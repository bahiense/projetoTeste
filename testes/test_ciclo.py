"""Testes do motor do ciclo. Rodar com: python -m unittest discover testes"""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import api, ciclo, db


class Base(unittest.TestCase):
    def setUp(self):
        self.con = db.conectar(":memory:")
        db.iniciar(self.con)
        self.cfg = db.config(self.con)

    def materia(self, nome, aulas, paginas=40, peso=1, ordem=0, qtd_blocos=None):
        ident = api.salvar_materia(
            self.con, {"nome": nome, "peso": peso, "ordem": ordem, "qtd_blocos": qtd_blocos}
        )["id"]
        for n in range(1, aulas + 1):
            api.salvar_aula(self.con, {"materia_id": ident, "numero": n, "total_paginas": paginas})
        return ident

    def proxima(self):
        return ciclo.fila(self.con, db.config(self.con), limite=1)[0]

    def concluir(self, tarefa, acertos=None):
        """Executa a tarefa atual como o usuario faria pela tela."""
        if tarefa["tipo"] == "sessao":
            api.concluir_sessao(self.con, {
                "aula_id": tarefa["aula_id"], "fase": tarefa["fase"], "rodada": tarefa["rodada"],
                "indice": tarefa["indice"], "pag_inicio": tarefa["pag_inicio"],
                "pag_fim": tarefa["pag_fim"], "minutos": 30,
            })
        else:
            questoes = tarefa["questoes"]
            # baterias tem tamanhos diferentes (fixacao e menor), entao o numero
            # pedido pelo teste nunca pode passar do tamanho da bateria
            marcados = questoes if acertos is None else min(acertos, questoes)
            api.registrar_bateria(self.con, {
                "aula_id": tarefa["aula_id"], "momento": tarefa["momento"],
                "rodada": tarefa["rodada"], "questoes": questoes, "acertos": marcados,
            })

    def rodar(self, passos, acertos=None):
        vistas = []
        for _ in range(passos):
            fila = ciclo.fila(self.con, db.config(self.con), limite=1)
            if not fila:
                break
            vistas.append(fila[0])
            self.concluir(fila[0], acertos)
        return vistas


class TestDivisao(unittest.TestCase):
    def test_respeita_o_teto_de_paginas(self):
        for total in range(10, 400):
            fatias = ciclo.dividir_paginas(total, 10, 20)
            tamanhos = [f - i + 1 for i, f in fatias]
            self.assertLessEqual(max(tamanhos), 20, total)
            self.assertGreaterEqual(min(tamanhos), 10, total)
            self.assertEqual(fatias[0][0], 1)
            self.assertEqual(fatias[-1][1], total)
            self.assertEqual(sum(tamanhos), total)

    def test_fatias_sao_continuas(self):
        fatias = ciclo.dividir_paginas(122, 10, 20)
        for anterior, seguinte in zip(fatias, fatias[1:]):
            self.assertEqual(seguinte[0], anterior[1] + 1)

    def test_pdf_menor_que_o_minimo_vira_uma_sessao(self):
        self.assertEqual(ciclo.dividir_paginas(7, 10, 20), [(1, 7)])

    def test_pdf_sem_paginas_nao_gera_sessao(self):
        self.assertEqual(ciclo.dividir_paginas(0, 10, 20), [])

    def test_revisao_e_mais_rapida_que_a_leitura(self):
        cfg = dict(db.PADRAO)
        leitura = ciclo.dividir_por_fase(120, cfg, "leitura")
        revisao = ciclo.dividir_por_fase(120, cfg, "revisao")
        self.assertLess(len(revisao), len(leitura))


class TestBlocos(unittest.TestCase):
    def test_tamanhos_ficam_entre_tres_e_cinco(self):
        for n in range(3, 60):
            blocos = ciclo.montar_blocos(range(1, n + 1))
            tamanhos = [len(b) for b in blocos]
            self.assertGreaterEqual(min(tamanhos), 3, n)
            self.assertLessEqual(max(tamanhos), 5, n)
            self.assertEqual(sum(tamanhos), n)

    def test_nenhuma_aula_se_perde_nem_repete(self):
        blocos = ciclo.montar_blocos(range(1, 23))
        juntas = [a for b in blocos for a in b]
        self.assertEqual(juntas, list(range(1, 23)))

    def test_quantidade_manual_e_respeitada(self):
        self.assertEqual(len(ciclo.montar_blocos(range(1, 21), qtd_blocos=2)), 2)


class TestRodizio(Base):
    def test_nao_repete_a_mesma_materia_em_sequencia(self):
        self.materia("A", 5, ordem=1)
        self.materia("B", 5, ordem=2)
        self.materia("C", 5, ordem=3)
        fila = ciclo.fila(self.con, self.cfg, limite=9)
        nomes = [t["materia"] for t in fila]
        for anterior, seguinte in zip(nomes, nomes[1:]):
            self.assertNotEqual(anterior, seguinte)

    def test_peso_maior_aparece_mais_vezes(self):
        self.materia("Prioritaria", 20, peso=3, ordem=1)
        self.materia("Secundaria", 20, peso=1, ordem=2)
        nomes = [t["materia"] for t in ciclo.fila(self.con, self.cfg, limite=20)]
        self.assertGreater(nomes.count("Prioritaria"), nomes.count("Secundaria") * 2)

    def test_materia_pausada_sai_do_rodizio(self):
        ident = self.materia("Pausada", 5)
        self.materia("Ativa", 5)
        api.salvar_materia(self.con, {"id": ident, "nome": "Pausada", "ativa": False})
        nomes = {t["materia"] for t in ciclo.fila(self.con, self.cfg, limite=10)}
        self.assertEqual(nomes, {"Ativa"})


class TestFluxoDoBloco(Base):
    def test_leitura_do_bloco_inteiro_vem_antes_de_qualquer_revisao(self):
        self.materia("Unica", 4, paginas=20)  # 1 sessao de leitura por aula
        vistas = self.rodar(40)
        fases = [t.get("fase") or t["momento"] for t in vistas]
        primeira_revisao = fases.index("revisao")
        antes = fases[:primeira_revisao]
        self.assertNotIn("revisao", antes)
        self.assertEqual(len([f for f in antes if f == "leitura"]), 4)

    def test_revisao_volta_na_primeira_aula_do_bloco(self):
        self.materia("Unica", 4, paginas=20)
        vistas = self.rodar(40)
        revisoes = [t for t in vistas if t.get("fase") == "revisao"]
        self.assertEqual(revisoes[0]["aula_numero"], 1)

    def test_exercicios_vem_logo_apos_a_revisao_da_aula(self):
        self.materia("Unica", 3, paginas=20)
        vistas = self.rodar(40)
        seq = [(t.get("fase") or t["momento"], t["aula_numero"]) for t in vistas]
        pos = seq.index(("revisao", 1))
        self.assertEqual(seq[pos + 1], ("revisao", 1))  # a bateria da mesma aula

    def test_bloco_so_avanca_quando_todas_as_aulas_batem_a_meta(self):
        self.materia("Unica", 6, paginas=20)  # 2 blocos de 3
        self.rodar(60, acertos=None)  # 100% de acerto
        panorama = api.panorama(self.con)[0]
        self.assertTrue(panorama["blocos"][0]["consolidado"])

    def test_aula_abaixo_da_meta_volta_para_reforco(self):
        self.materia("Unica", 3, paginas=20)
        self.rodar(20, acertos=3)  # 30% de acerto, sempre
        vistas = self.rodar(20, acertos=3)
        self.assertTrue(any(t.get("fase") == "reforco" or t.get("momento") == "reforco"
                            for t in vistas))

    def test_reforco_pega_so_a_aula_fraca(self):
        """Quem ja bateu a meta nao volta para o reforco junto com quem falhou."""
        self.materia("Unica", 3, paginas=20)
        for _ in range(40):
            fila = ciclo.fila(self.con, db.config(self.con), limite=1)
            if not fila:
                break
            tarefa = fila[0]
            # so a aula 2 vai mal
            self.concluir(tarefa, acertos=2 if tarefa["aula_numero"] == 2 else None)
        reforcos = self.con.execute(
            "SELECT DISTINCT a.numero FROM sessao s JOIN aula a ON a.id = s.aula_id "
            "WHERE s.fase = 'reforco'"
        ).fetchall()
        self.assertEqual([linha[0] for linha in reforcos], [2])

    def test_aula_consolidada_continua_consolidada(self):
        self.materia("Unica", 3, paginas=20)
        for _ in range(40):
            fila = ciclo.fila(self.con, db.config(self.con), limite=1)
            if not fila:
                break
            tarefa = fila[0]
            self.concluir(tarefa, acertos=2 if tarefa["aula_numero"] == 2 else None)
        aulas = {a["numero"]: a for b in api.panorama(self.con)[0]["blocos"] for a in b["aulas"]}
        self.assertTrue(aulas[1]["consolidada"])
        self.assertTrue(aulas[3]["consolidada"])
        self.assertFalse(aulas[2]["consolidada"])

    def test_bloco_avanca_mesmo_com_aula_encalhada(self):
        """Esgotadas as rodadas, o ciclo segue em frente e a aula fica sinalizada."""
        self.materia("Unica", 6, paginas=20)
        for _ in range(200):
            fila = ciclo.fila(self.con, db.config(self.con), limite=1)
            if not fila:
                break
            tarefa = fila[0]
            self.concluir(tarefa, acertos=0 if tarefa["aula_numero"] == 1 else None)
        blocos = api.panorama(self.con)[0]["blocos"]
        self.assertEqual(len(blocos), 2)
        self.assertTrue(blocos[1]["consolidado"])  # o bloco 2 foi estudado assim mesmo

    def test_reforco_nao_se_repete_para_sempre(self):
        self.materia("Unica", 3, paginas=20)
        self.rodar(200, acertos=0)
        panorama = api.panorama(self.con)[0]
        rodadas = [a["rodada"] for b in panorama["blocos"] for a in b["aulas"]]
        limite = db.num(db.config(self.con), "max_rodadas_reforco") + 1
        self.assertLessEqual(max(rodadas), limite)

    def test_ciclo_termina_quando_tudo_esta_consolidado(self):
        self.materia("Unica", 3, paginas=20)
        self.rodar(100)
        self.assertEqual(ciclo.fila(self.con, db.config(self.con), limite=5), [])


class TestAvaliacao(Base):
    def test_amostra_pequena_demais_nao_consolida_a_aula(self):
        api.salvar_config(self.con, {"minimo_questoes_avaliacao": 30})
        self.materia("Unica", 3, paginas=20)
        self.rodar(100)
        panorama = api.panorama(self.con)[0]
        self.assertFalse(panorama["blocos"][0]["aulas"][0]["consolidada"])

    def test_consolidar_agenda_revisoes_espacadas(self):
        self.materia("Unica", 3, paginas=20)
        self.rodar(60)
        total = self.con.execute("SELECT COUNT(*) FROM revisao_agendada").fetchone()[0]
        self.assertEqual(total, 3 * 3)  # 3 aulas x 3 intervalos

    def test_erros_alimentam_o_caderno(self):
        ident = self.materia("Unica", 3, paginas=20)
        aula = self.con.execute("SELECT id FROM aula WHERE materia_id=?", (ident,)).fetchone()[0]
        api.registrar_bateria(self.con, {
            "aula_id": aula, "momento": "revisao", "rodada": 1, "questoes": 10, "acertos": 7,
            "erros": [{"assunto": "Controle de constitucionalidade", "motivo": "nao_sabia"},
                      {"assunto": "Controle de constitucionalidade", "motivo": "pegadinha"}],
        })
        caderno = api.caderno_de_erros(self.con)
        self.assertEqual(caderno["ranking"][0]["vezes"], 2)

    def test_acertos_maiores_que_questoes_sao_recusados(self):
        ident = self.materia("Unica", 1, paginas=20)
        aula = self.con.execute("SELECT id FROM aula WHERE materia_id=?", (ident,)).fetchone()[0]
        with self.assertRaises(api.ErroDeUso):
            api.registrar_bateria(self.con, {"aula_id": aula, "questoes": 10, "acertos": 11})


class TestPersistencia(Base):
    def test_concluir_sessao_e_idempotente(self):
        self.materia("Unica", 1, paginas=60)
        tarefa = self.proxima()
        self.concluir(tarefa)
        self.concluir(tarefa)
        total = self.con.execute("SELECT COUNT(*) FROM sessao").fetchone()[0]
        self.assertEqual(total, 1)

    def test_desfazer_devolve_a_tarefa_para_a_fila(self):
        self.materia("Unica", 1, paginas=60)
        tarefa = self.proxima()
        self.concluir(tarefa)
        self.assertNotEqual(self.proxima()["indice"], tarefa["indice"])
        api.desfazer_sessao(self.con, {"aula_id": tarefa["aula_id"], "fase": "leitura",
                                       "rodada": 1, "indice": tarefa["indice"]})
        self.assertEqual(self.proxima()["indice"], tarefa["indice"])

    def test_backup_preserva_o_progresso(self):
        self.materia("Unica", 3, paginas=20)
        self.rodar(6)
        dump = api.exportar(self.con)
        antes = ciclo.fila(self.con, db.config(self.con), limite=3)
        api.importar(self.con, dump)
        self.assertEqual(ciclo.fila(self.con, db.config(self.con), limite=3), antes)


class TestSarrafo(Base):
    def test_sarrafo_da_materia_vence_o_geral(self):
        ident = self.materia("Exigente", 3, paginas=20)
        api.salvar_materia(self.con, {"id": ident, "nome": "Exigente", "meta": 95})
        for _ in range(40):
            fila = ciclo.fila(self.con, db.config(self.con), limite=1)
            if not fila:
                break
            self.concluir(fila[0], acertos=9)  # 90%: passa no geral, reprova nos 95%
        panorama = api.panorama(self.con)[0]
        self.assertEqual(panorama["sarrafo"], 95)
        self.assertFalse(panorama["blocos"][0]["aulas"][0]["consolidada"])

    def test_sem_sarrafo_proprio_herda_o_geral(self):
        self.materia("Normal", 3, paginas=20)
        self.rodar(40, acertos=9)
        panorama = api.panorama(self.con)[0]
        self.assertEqual(panorama["sarrafo"], 80)
        self.assertTrue(panorama["blocos"][0]["aulas"][0]["consolidada"])

    def test_subir_o_sarrafo_devolve_a_aula_ao_reforco(self):
        """Aula aprovada com 80% volta a ficar pendente quando o corte sobe."""
        self.materia("Unica", 3, paginas=20)
        self.rodar(40, acertos=8)
        self.assertEqual(ciclo.fila(self.con, db.config(self.con), limite=1), [])
        api.salvar_config(self.con, {"meta_acerto": 90})
        self.assertTrue(ciclo.fila(self.con, db.config(self.con), limite=1))


class TestAulaSemPaginas(Base):
    def test_aula_sem_paginas_fica_fora_do_ciclo(self):
        ident = self.materia("Mista", 4, paginas=0)
        aula = self.con.execute(
            "SELECT id FROM aula WHERE materia_id=? ORDER BY numero", (ident,)).fetchone()[0]
        api.salvar_aula(self.con, {"id": aula, "materia_id": ident, "numero": 1,
                                   "total_paginas": 30})
        tarefas = ciclo.fila(self.con, db.config(self.con), limite=20)
        self.assertTrue(tarefas)
        self.assertEqual({t["aula_numero"] for t in tarefas}, {1})

    def test_materia_toda_sem_paginas_nao_gera_tarefa(self):
        self.materia("Vazia", 5, paginas=0)
        self.assertEqual(ciclo.fila(self.con, db.config(self.con), limite=5), [])

    def test_painel_separa_as_aulas_fora_do_ciclo(self):
        ident = self.materia("Mista", 4, paginas=0)
        aula = self.con.execute(
            "SELECT id FROM aula WHERE materia_id=? ORDER BY numero", (ident,)).fetchone()[0]
        api.salvar_aula(self.con, {"id": aula, "materia_id": ident, "numero": 1,
                                   "total_paginas": 30})
        panorama = api.panorama(self.con)[0]
        self.assertEqual(panorama["total_aulas"], 4)
        self.assertEqual(panorama["aulas_no_ciclo"], 1)
        self.assertEqual(len(panorama["sem_paginas"]), 3)


if __name__ == "__main__":
    unittest.main()
