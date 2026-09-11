"""Testes do controle de acesso. Rodar com: python -m unittest discover testes"""
import json
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import auth, db


def cabecalhos_de(pares):
    return dict(pares)


class Base(unittest.TestCase):
    def setUp(self):
        self.arquivo = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.arquivo.close()
        os.environ["CICLO_DB"] = self.arquivo.name
        os.environ.pop("CICLO_MODO", None)
        con = db.conectar()
        db.iniciar(con)
        con.close()
        from app import rotas
        self.rotas = rotas

    def tearDown(self):
        os.environ.pop("CICLO_DB", None)
        os.environ.pop("CICLO_MODO", None)
        os.unlink(self.arquivo.name)

    def chamar(self, metodo, caminho, corpo=None, cookie=""):
        bruto = json.dumps(corpo).encode() if corpo is not None else b""
        codigo, cabecalhos, saida = self.rotas.despachar(metodo, caminho, bruto, cookie)
        try:
            dados = json.loads(saida.decode())
        except Exception:
            dados = saida
        return codigo, dict(cabecalhos), dados

    def entrar(self, senha):
        codigo, cabecalhos, _ = self.chamar("POST", "/api/sessao/entrar", {"senha": senha})
        self.assertEqual(codigo, 200)
        return cabecalhos["Set-Cookie"].split(";")[0]


class TestModoServidor(Base):
    """Publicado na internet, nada aparece antes de existir uma senha."""

    def setUp(self):
        super().setUp()
        os.environ["CICLO_MODO"] = "servidor"

    def test_sem_senha_nenhum_dado_sai(self):
        for caminho in ("/api/estado", "/api/panorama", "/api/erros", "/api/exportar"):
            codigo, _, _ = self.chamar("GET", caminho)
            self.assertEqual(codigo, 401, caminho)

    def test_sem_senha_nenhuma_escrita_passa(self):
        codigo, _, _ = self.chamar("POST", "/api/materias", {"nome": "Invasor"})
        self.assertEqual(codigo, 401)

    def test_a_primeira_senha_pode_ser_criada_sem_estar_dentro(self):
        codigo, cabecalhos, _ = self.chamar("POST", "/api/senha/definir", {"senha": "estudar2026"})
        self.assertEqual(codigo, 200)
        self.assertIn("HttpOnly", cabecalhos["Set-Cookie"])
        self.assertIn("Secure", cabecalhos["Set-Cookie"])

    def test_depois_de_criada_a_senha_e_exigida(self):
        self.chamar("POST", "/api/senha/definir", {"senha": "estudar2026"})
        self.assertEqual(self.chamar("GET", "/api/estado")[0], 401)
        self.assertEqual(self.chamar("GET", "/api/estado", cookie=self.entrar("estudar2026"))[0], 200)

    def test_senha_errada_nao_entra(self):
        self.chamar("POST", "/api/senha/definir", {"senha": "estudar2026"})
        self.assertEqual(self.chamar("POST", "/api/sessao/entrar", {"senha": "chute"})[0], 401)

    def test_cookie_adulterado_nao_vale(self):
        self.chamar("POST", "/api/senha/definir", {"senha": "estudar2026"})
        bom = self.entrar("estudar2026")
        ruim = bom[:-1] + ("0" if bom[-1] != "0" else "1")
        self.assertEqual(self.chamar("GET", "/api/estado", cookie=ruim)[0], 401)

    def test_nao_da_para_trocar_a_senha_de_fora(self):
        self.chamar("POST", "/api/senha/definir", {"senha": "estudar2026"})
        codigo, _, _ = self.chamar("POST", "/api/senha/definir", {"senha": "sequestrada"})
        self.assertEqual(codigo, 401)
        self.assertTrue(self.chamar("POST", "/api/sessao/entrar", {"senha": "estudar2026"})[0] == 200)

    def test_trocar_a_senha_derruba_as_sessoes_antigas(self):
        self.chamar("POST", "/api/senha/definir", {"senha": "estudar2026"})
        antigo = self.entrar("estudar2026")
        self.chamar("POST", "/api/senha/definir",
                    {"senha": "outrasenha1", "senha_atual": "estudar2026"}, cookie=antigo)
        self.assertEqual(self.chamar("GET", "/api/estado", cookie=antigo)[0], 401)

    def test_sair_invalida_o_cookie_no_navegador(self):
        self.chamar("POST", "/api/senha/definir", {"senha": "estudar2026"})
        cookie = self.entrar("estudar2026")
        _, cabecalhos, _ = self.chamar("POST", "/api/sessao/sair", {}, cookie=cookie)
        self.assertIn("Max-Age=0", cabecalhos["Set-Cookie"])

    def test_a_tela_de_entrada_e_servida_sem_senha(self):
        codigo, _, _ = self.chamar("GET", "/index.html")
        self.assertEqual(codigo, 200)


class TestModoLocal(Base):
    """Em casa, sem senha, o sistema roda aberto — ele so escuta em 127.0.0.1."""

    def test_sem_senha_funciona_normalmente(self):
        self.assertEqual(self.chamar("GET", "/api/estado")[0], 200)

    def test_com_senha_passa_a_exigir_login(self):
        self.chamar("POST", "/api/senha/definir", {"senha": "estudar2026"})
        self.assertEqual(self.chamar("GET", "/api/estado")[0], 401)
        self.assertEqual(self.chamar("GET", "/api/estado", cookie=self.entrar("estudar2026"))[0], 200)

    def test_cookie_local_nao_pede_https(self):
        """Sem TLS em casa, um cookie Secure nunca voltaria e o login travaria."""
        self.chamar("POST", "/api/senha/definir", {"senha": "estudar2026"})
        codigo, cabecalhos, _ = self.rotas.despachar(
            "POST", "/api/sessao/entrar", json.dumps({"senha": "estudar2026"}).encode(),
            "", seguro=False)
        self.assertEqual(codigo, 200)
        self.assertNotIn("Secure", cabecalhos_de(cabecalhos)["Set-Cookie"])
        self.assertIn("HttpOnly", cabecalhos_de(cabecalhos)["Set-Cookie"])


class TestSenha(Base):
    def test_senha_curta_e_recusada(self):
        codigo, _, dados = self.chamar("POST", "/api/senha/definir", {"senha": "abc"})
        self.assertEqual(codigo, 400)
        self.assertIn("6 caracteres", dados["erro"])

    def test_hash_nunca_guarda_a_senha_em_claro(self):
        con = db.conectar()
        auth.definir_senha(con, "estudar2026")
        guardado = con.execute("SELECT valor FROM config WHERE chave='senha_hash'").fetchone()[0]
        con.close()
        self.assertNotIn("estudar2026", guardado)
        self.assertTrue(guardado.startswith("pbkdf2$"))

    def test_caminho_de_arquivo_nao_escapa_da_pasta_web(self):
        for tentativa in ("/../db.py", "/../../etc/passwd", "/..%2fapi.py"):
            codigo, _, _ = self.chamar("GET", tentativa)
            self.assertEqual(codigo, 404, tentativa)


if __name__ == "__main__":
    unittest.main()
