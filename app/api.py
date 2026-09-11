"""Regras de aplicacao: tudo que a interface pode pedir ao sistema."""
import datetime
import json

from . import ciclo, db


class ErroDeUso(Exception):
    """Entrada invalida vinda da interface."""


def _int(dados, chave, padrao=None, minimo=None):
    valor = dados.get(chave, padrao)
    if valor in (None, ""):
        if padrao is None:
            raise ErroDeUso(f"Campo obrigatorio: {chave}")
        valor = padrao
    try:
        valor = int(valor)
    except (TypeError, ValueError):
        raise ErroDeUso(f"Campo {chave} precisa ser um numero")
    if minimo is not None and valor < minimo:
        raise ErroDeUso(f"Campo {chave} precisa ser no minimo {minimo}")
    return valor


def _texto(dados, chave, padrao=""):
    return str(dados.get(chave) or padrao).strip()


# ---------------------------------------------------------------- panorama

def _status_aula(aula, cfg, materia=None):
    """Resume o estado de uma aula: quanto foi lido, revisado e qual o aproveitamento."""
    leitura = ciclo.dividir_por_fase(aula["total_paginas"], cfg, "leitura")
    revisao = ciclo.dividir_por_fase(aula["total_paginas"], cfg, "revisao")
    feitas_leitura = sum(1 for f in aula["concluidas"] if f[0] == "leitura")
    feitas_revisao = sum(1 for f in aula["concluidas"] if f[0] == "revisao")
    ultima = ciclo.ultima_avaliacao(aula)
    rodada, momento = ultima if ultima else (1, "revisao")
    q, a = ciclo.aproveitamento(aula["baterias"], momento=momento, rodada=rodada)
    q_total, a_total = ciclo.aproveitamento(aula["baterias"])
    consolidada, pct = ciclo._aula_consolidada(aula, cfg, materia)
    if not aula["total_paginas"]:
        situacao = "sem_paginas"
    elif consolidada:
        situacao = "consolidada"
    elif feitas_leitura == 0:
        situacao = "nao_iniciada"
    elif feitas_leitura < len(leitura):
        situacao = "lendo"
    elif feitas_revisao < len(revisao):
        situacao = "aguardando_revisao"
    elif q == 0:
        situacao = "aguardando_exercicios"
    else:
        situacao = "abaixo_da_meta"
    return {
        "id": aula["id"],
        "numero": aula["numero"],
        "titulo": aula["titulo"],
        "total_paginas": aula["total_paginas"],
        "link_pdf": aula["link_pdf"],
        "link_exercicios": aula["link_exercicios"],
        "observacao": aula["observacao"],
        "sessoes_leitura": len(leitura),
        "sessoes_leitura_feitas": feitas_leitura,
        "sessoes_revisao": len(revisao),
        "sessoes_revisao_feitas": feitas_revisao,
        "paginas_por_dia": (leitura[0][1] - leitura[0][0] + 1) if leitura else 0,
        "rodada": rodada,
        "questoes": q_total,
        "acertos": a_total,
        "percentual": ciclo.percentual(q_total, a_total),
        "questoes_rodada": q,
        "acertos_rodada": a,
        "percentual_rodada": pct,
        "consolidada": consolidada,
        "situacao": situacao,
    }


def panorama(con, cfg=None):
    """Visao completa: materias -> blocos -> aulas, com aproveitamento em cada nivel."""
    cfg = cfg or db.config(con)
    saida = []
    materias = con.execute("SELECT * FROM materia ORDER BY ordem, id").fetchall()
    for m in materias:
        todas = ciclo._carregar_materia(con, m["id"], cfg)
        # As aulas sem total de paginas ficam fora do ciclo ate serem preenchidas,
        # entao tambem ficam fora dos blocos — senao o painel mostraria um plano
        # diferente do que a fila realmente executa.
        aulas = [a for a in todas if a["total_paginas"] > 0]
        sem_paginas = [a for a in todas if not a["total_paginas"]]
        por_numero = {a["numero"]: a for a in aulas}
        grupos = ciclo.montar_blocos(
            [a["numero"] for a in aulas], m["qtd_blocos"], db.num(cfg, "tamanho_bloco_alvo")
        )
        blocos = []
        for n, numeros in enumerate(grupos, start=1):
            itens = [_status_aula(por_numero[x], cfg, dict(m)) for x in numeros]
            # Duas leituras diferentes do mesmo bloco: "atual" e a ultima medicao
            # de cada aula (e o que decide reforco); "acumulado" e a vida inteira.
            q_atual = sum(i["questoes_rodada"] for i in itens)
            a_atual = sum(i["acertos_rodada"] for i in itens)
            q = sum(i["questoes"] for i in itens)
            a = sum(i["acertos"] for i in itens)
            atual = ciclo.percentual(q_atual, a_atual)
            blocos.append({
                "numero": n,
                "aulas": itens,
                "questoes": q_atual,
                "acertos": a_atual,
                "questoes_acumuladas": q,
                "acertos_acumulados": a,
                "percentual": atual,
                "percentual_acumulado": ciclo.percentual(q, a),
                "consolidado": all(i["consolidada"] for i in itens) if itens else False,
                "abaixo_da_meta": atual is not None and atual < ciclo.sarrafo_de(dict(m), cfg),
            })
        q = sum(b["questoes_acumuladas"] for b in blocos)
        a = sum(b["acertos_acumulados"] for b in blocos)
        saida.append({
            "id": m["id"], "nome": m["nome"], "ordem": m["ordem"], "peso": m["peso"],
            "meta": m["meta"], "sarrafo": ciclo.sarrafo_de(dict(m), cfg),
            "ativa": bool(m["ativa"]), "qtd_blocos": m["qtd_blocos"],
            "total_aulas": len(todas), "aulas_no_ciclo": len(aulas),
            "sem_paginas": [_status_aula(a, cfg, dict(m)) for a in sem_paginas],
            "total_paginas": sum(x["total_paginas"] for x in aulas),
            "blocos": blocos, "questoes": q, "acertos": a,
            "percentual": ciclo.percentual(q, a),
        })
    return saida


def _projecao(con, cfg, fila_atual):
    """Estima quando o edital termina, com base no ritmo real das ultimas semanas."""
    limite = (datetime.date.today() - datetime.timedelta(days=28)).isoformat()
    linha = con.execute(
        "SELECT COUNT(*) AS n, COUNT(DISTINCT substr(concluida_em,1,10)) AS dias "
        "FROM sessao WHERE concluida_em IS NOT NULL AND concluida_em >= ?", (limite,)
    ).fetchone()
    pendentes = 0
    for m in con.execute("SELECT * FROM materia WHERE ativa = 1"):
        pendentes += len(ciclo.tarefas_da_materia(con, m, cfg, limite=9999))
    ritmo = (linha["n"] / linha["dias"]) if linha["dias"] else None
    dias = int(pendentes / ritmo) if ritmo else None
    return {
        "tarefas_pendentes": pendentes,
        "sessoes_por_dia": round(ritmo, 1) if ritmo else None,
        "dias_restantes": dias,
        "termino_previsto": (
            (datetime.date.today() + datetime.timedelta(days=dias)).isoformat() if dias else None
        ),
    }


def estado(con):
    cfg = db.config(con)
    tarefas = ciclo.fila(con, cfg, limite=12)
    vencidas = ciclo.revisoes_vencidas(con)
    hoje = ciclo.hoje()
    feitas = con.execute(
        "SELECT COUNT(*) AS n FROM sessao WHERE substr(concluida_em,1,10) = ?", (hoje,)
    ).fetchone()["n"]
    questoes = con.execute(
        "SELECT COALESCE(SUM(questoes),0) AS q, COALESCE(SUM(acertos),0) AS a "
        "FROM bateria WHERE substr(data,1,10) = ?", (hoje,)
    ).fetchone()
    return {
        "config": cfg,
        "tarefa_atual": tarefas[0] if tarefas else None,
        "fila": tarefas[1:],
        "revisoes_vencidas": vencidas,
        "hoje": {
            "data": hoje,
            "sessoes": feitas,
            "questoes": questoes["q"],
            "acertos": questoes["a"],
            "percentual": ciclo.percentual(questoes["q"], questoes["a"]),
        },
        "projecao": _projecao(con, cfg, tarefas),
    }


# ---------------------------------------------------------------- cadastro

def salvar_materia(con, dados):
    nome = _texto(dados, "nome")
    if not nome:
        raise ErroDeUso("A materia precisa de um nome")
    peso = _int(dados, "peso", 1, minimo=1)
    ordem = _int(dados, "ordem", 0)
    qtd = dados.get("qtd_blocos") or None
    qtd = int(qtd) if qtd else None
    meta = dados.get("meta") or None
    meta = int(meta) if meta else None
    ativa = 1 if dados.get("ativa", True) else 0
    if dados.get("id"):
        con.execute(
            "UPDATE materia SET nome=?, peso=?, ordem=?, qtd_blocos=?, meta=?, ativa=? WHERE id=?",
            (nome, peso, ordem, qtd, meta, ativa, int(dados["id"])),
        )
        ident = int(dados["id"])
    else:
        cur = con.execute(
            "INSERT INTO materia (nome, peso, ordem, qtd_blocos, meta, ativa) VALUES (?,?,?,?,?,?)",
            (nome, peso, ordem, qtd, meta, ativa),
        )
        ident = cur.lastrowid
    con.commit()
    return {"id": ident}


def salvar_aula(con, dados):
    materia_id = _int(dados, "materia_id")
    numero = _int(dados, "numero", minimo=0)
    paginas = _int(dados, "total_paginas", 0, minimo=0)
    campos = (
        _texto(dados, "titulo"), paginas, _texto(dados, "link_pdf"),
        _texto(dados, "link_exercicios"), _texto(dados, "observacao"),
    )
    if dados.get("id"):
        con.execute(
            "UPDATE aula SET numero=?, titulo=?, total_paginas=?, link_pdf=?, "
            "link_exercicios=?, observacao=? WHERE id=?",
            (numero,) + campos + (int(dados["id"]),),
        )
        ident = int(dados["id"])
    else:
        cur = con.execute(
            "INSERT INTO aula (materia_id, numero, titulo, total_paginas, link_pdf, "
            "link_exercicios, observacao) VALUES (?,?,?,?,?,?,?)",
            (materia_id, numero) + campos,
        )
        ident = cur.lastrowid
    con.commit()
    return {"id": ident}


def criar_aulas_em_lote(con, dados):
    """Cadastra de uma vez as N aulas de uma materia (numeradas a partir de 1)."""
    materia_id = _int(dados, "materia_id")
    quantidade = _int(dados, "quantidade", minimo=1)
    inicio = _int(dados, "inicio", 1, minimo=0)
    paginas = _int(dados, "total_paginas", 0, minimo=0)
    criadas = 0
    for i in range(quantidade):
        try:
            con.execute(
                "INSERT INTO aula (materia_id, numero, total_paginas) VALUES (?,?,?)",
                (materia_id, inicio + i, paginas),
            )
            criadas += 1
        except Exception:
            pass
    con.commit()
    return {"criadas": criadas}


def excluir(con, tabela, ident):
    if tabela not in ("materia", "aula", "bateria", "erro"):
        raise ErroDeUso("Tabela invalida")
    con.execute(f"DELETE FROM {tabela} WHERE id = ?", (int(ident),))
    con.commit()
    return {"ok": True}


# ---------------------------------------------------------------- execucao do ciclo

def concluir_sessao(con, dados):
    aula_id = _int(dados, "aula_id")
    fase = _texto(dados, "fase")
    if fase not in ciclo.FASES:
        raise ErroDeUso("Fase invalida")
    rodada = _int(dados, "rodada", 1, minimo=1)
    indice = _int(dados, "indice", minimo=1)
    con.execute(
        "INSERT INTO sessao (aula_id, fase, rodada, indice, pag_inicio, pag_fim, "
        "concluida_em, minutos, pontos_chave) VALUES (?,?,?,?,?,?,?,?,?) "
        "ON CONFLICT (aula_id, fase, rodada, indice) DO UPDATE SET "
        "concluida_em=excluded.concluida_em, minutos=excluded.minutos, "
        "pontos_chave=excluded.pontos_chave",
        (aula_id, fase, rodada, indice, _int(dados, "pag_inicio", 0),
         _int(dados, "pag_fim", 0), datetime.datetime.now().isoformat(timespec="seconds"),
         _int(dados, "minutos", 0), _texto(dados, "pontos_chave")),
    )
    if dados.get("observacao") is not None:
        con.execute("UPDATE aula SET observacao=? WHERE id=?",
                    (_texto(dados, "observacao"), aula_id))
    con.commit()
    return {"ok": True}


def desfazer_sessao(con, dados):
    con.execute(
        "UPDATE sessao SET concluida_em = NULL WHERE aula_id=? AND fase=? AND rodada=? AND indice=?",
        (_int(dados, "aula_id"), _texto(dados, "fase"),
         _int(dados, "rodada", 1), _int(dados, "indice")),
    )
    con.commit()
    return {"ok": True}


def registrar_bateria(con, dados):
    """Grava uma bateria de exercicios e, junto, os erros no caderno."""
    cfg = db.config(con)
    aula_id = _int(dados, "aula_id")
    questoes = _int(dados, "questoes", minimo=1)
    acertos = _int(dados, "acertos", 0, minimo=0)
    if acertos > questoes:
        raise ErroDeUso("Acertos nao podem passar do total de questoes")
    momento = _texto(dados, "momento", "revisao")
    if momento not in ("fixacao", "revisao", "reforco"):
        raise ErroDeUso("Momento invalido")
    cur = con.execute(
        "INSERT INTO bateria (aula_id, momento, rodada, questoes, acertos, minutos, data, observacao) "
        "VALUES (?,?,?,?,?,?,?,?)",
        (aula_id, momento, _int(dados, "rodada", 1, minimo=1), questoes, acertos,
         _int(dados, "minutos", 0), datetime.datetime.now().isoformat(timespec="seconds"),
         _texto(dados, "observacao")),
    )
    bateria_id = cur.lastrowid
    for item in dados.get("erros") or []:
        assunto = _texto(item, "assunto")
        if not assunto:
            continue
        con.execute(
            "INSERT INTO erro (bateria_id, assunto, motivo, anotacao) VALUES (?,?,?,?)",
            (bateria_id, assunto, _texto(item, "motivo", "nao_sabia"), _texto(item, "anotacao")),
        )
    con.commit()
    materia_id = con.execute("SELECT materia_id FROM aula WHERE id=?", (aula_id,)).fetchone()[0]
    materia = con.execute("SELECT * FROM materia WHERE id=?", (materia_id,)).fetchone()
    aulas = ciclo._carregar_materia(con, materia_id, cfg)
    alvo = next((a for a in aulas if a["id"] == aula_id), None)
    if alvo:
        consolidada, _ = ciclo._aula_consolidada(alvo, cfg, dict(materia))
        if consolidada:
            ciclo.agendar_revisoes_espacadas(con, aula_id, cfg)
            con.commit()
    return {"id": bateria_id}


def concluir_revisao_espacada(con, dados):
    con.execute(
        "UPDATE revisao_agendada SET concluida_em=? WHERE id=?",
        (ciclo.hoje(), _int(dados, "id")),
    )
    con.commit()
    return {"ok": True}


def adiar_revisao_espacada(con, dados):
    dias = _int(dados, "dias", 1, minimo=1)
    nova = (datetime.date.today() + datetime.timedelta(days=dias)).isoformat()
    con.execute("UPDATE revisao_agendada SET prevista_para=? WHERE id=?", (nova, _int(dados, "id")))
    con.commit()
    return {"ok": True}


# ---------------------------------------------------------------- apoio

def caderno_de_erros(con):
    linhas = con.execute(
        """SELECT e.id, e.assunto, e.motivo, e.anotacao, e.resolvido, b.data,
                  a.numero AS aula_numero, m.nome AS materia
           FROM erro e
           JOIN bateria b ON b.id = e.bateria_id
           JOIN aula a ON a.id = b.aula_id
           JOIN materia m ON m.id = a.materia_id
           ORDER BY e.resolvido, b.data DESC, e.id DESC"""
    ).fetchall()
    itens = [dict(l) for l in linhas]
    resumo = {}
    for item in itens:
        chave = (item["materia"], item["assunto"].lower())
        resumo.setdefault(chave, {"materia": item["materia"], "assunto": item["assunto"],
                                  "vezes": 0, "abertos": 0})
        resumo[chave]["vezes"] += 1
        if not item["resolvido"]:
            resumo[chave]["abertos"] += 1
    ranking = sorted(resumo.values(), key=lambda x: (-x["vezes"], x["materia"]))
    return {"itens": itens, "ranking": ranking}


def alternar_erro(con, dados):
    con.execute("UPDATE erro SET resolvido = 1 - resolvido WHERE id=?", (_int(dados, "id"),))
    con.commit()
    return {"ok": True}


def salvar_config(con, dados):
    for chave, valor in (dados or {}).items():
        if chave in db.PADRAO:
            con.execute("UPDATE config SET valor=? WHERE chave=?", (str(valor), chave))
    con.commit()
    return db.config(con)


def determinacoes(con):
    return [dict(l) for l in con.execute("SELECT * FROM determinacao ORDER BY ordem, id")]


def salvar_determinacoes(con, dados):
    for item in dados.get("itens", []):
        if item.get("id"):
            con.execute("UPDATE determinacao SET pergunta=?, resposta=? WHERE id=?",
                        (_texto(item, "pergunta"), _texto(item, "resposta"), int(item["id"])))
        elif _texto(item, "pergunta"):
            con.execute("INSERT INTO determinacao (pergunta, resposta, ordem) VALUES (?,?,?)",
                        (_texto(item, "pergunta"), _texto(item, "resposta"), 99))
    con.commit()
    return determinacoes(con)


def exportar(con):
    dump = {"gerado_em": datetime.datetime.now().isoformat(timespec="seconds")}
    for tabela in ("config", "materia", "aula", "sessao", "bateria", "erro",
                   "revisao_agendada", "determinacao"):
        dump[tabela] = [dict(l) for l in con.execute(f"SELECT * FROM {tabela}")]
    return dump


def importar(con, dados):
    """Restaura um backup gerado por exportar(). Substitui todo o conteudo."""
    if not isinstance(dados, dict) or "materia" not in dados:
        raise ErroDeUso("Arquivo de backup invalido")
    ordem = ("erro", "bateria", "sessao", "revisao_agendada", "aula", "materia", "determinacao")
    for tabela in ordem:
        con.execute(f"DELETE FROM {tabela}")
    for tabela in reversed(ordem):
        for linha in dados.get(tabela, []):
            colunas = ",".join(linha.keys())
            marcas = ",".join("?" * len(linha))
            con.execute(f"INSERT INTO {tabela} ({colunas}) VALUES ({marcas})",
                        tuple(linha.values()))
    for linha in dados.get("config", []):
        con.execute("UPDATE config SET valor=? WHERE chave=?", (linha["valor"], linha["chave"]))
    con.commit()
    return {"ok": True}
