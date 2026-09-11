"""Servidor local. Usa apenas a biblioteca padrao do Python."""
import json
import mimetypes
import os
import socketserver
import threading
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

from . import api, ciclo, db

WEB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web")


def _com_conexao(funcao):
    def envolvido(dados, caminho):
        con = db.conectar()
        try:
            return funcao(con, dados, caminho)
        finally:
            con.close()
    return envolvido


ROTAS = {
    ("GET", "/api/estado"): lambda c, d, p: api.estado(c),
    ("GET", "/api/panorama"): lambda c, d, p: api.panorama(c),
    ("GET", "/api/erros"): lambda c, d, p: api.caderno_de_erros(c),
    ("GET", "/api/determinacoes"): lambda c, d, p: api.determinacoes(c),
    ("GET", "/api/exportar"): lambda c, d, p: api.exportar(c),
    ("POST", "/api/materias"): lambda c, d, p: api.salvar_materia(c, d),
    ("POST", "/api/aulas"): lambda c, d, p: api.salvar_aula(c, d),
    ("POST", "/api/aulas/lote"): lambda c, d, p: api.criar_aulas_em_lote(c, d),
    ("POST", "/api/sessoes/concluir"): lambda c, d, p: api.concluir_sessao(c, d),
    ("POST", "/api/sessoes/desfazer"): lambda c, d, p: api.desfazer_sessao(c, d),
    ("POST", "/api/baterias"): lambda c, d, p: api.registrar_bateria(c, d),
    ("POST", "/api/revisoes/concluir"): lambda c, d, p: api.concluir_revisao_espacada(c, d),
    ("POST", "/api/revisoes/adiar"): lambda c, d, p: api.adiar_revisao_espacada(c, d),
    ("POST", "/api/erros/alternar"): lambda c, d, p: api.alternar_erro(c, d),
    ("POST", "/api/config"): lambda c, d, p: api.salvar_config(c, d),
    ("POST", "/api/determinacoes"): lambda c, d, p: api.salvar_determinacoes(c, d),
    ("POST", "/api/importar"): lambda c, d, p: api.importar(c, d),
    ("POST", "/api/excluir"): lambda c, d, p: api.excluir(c, d.get("tabela"), d.get("id")),
}


class Manipulador(BaseHTTPRequestHandler):
    server_version = "CicloConcursos"

    def log_message(self, formato, *args):
        pass

    # -- utilidades -------------------------------------------------
    def _responder(self, codigo, corpo, tipo="application/json; charset=utf-8"):
        if isinstance(corpo, (dict, list)):
            corpo = json.dumps(corpo, ensure_ascii=False).encode("utf-8")
        elif isinstance(corpo, str):
            corpo = corpo.encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", tipo)
        self.send_header("Content-Length", str(len(corpo)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(corpo)

    def _arquivo(self, caminho):
        if caminho in ("/", ""):
            caminho = "/index.html"
        destino = os.path.normpath(os.path.join(WEB, caminho.lstrip("/")))
        if not destino.startswith(WEB) or not os.path.isfile(destino):
            return self._responder(404, {"erro": "nao encontrado"})
        tipo = mimetypes.guess_type(destino)[0] or "application/octet-stream"
        with open(destino, "rb") as arquivo:
            self._responder(200, arquivo.read(), tipo + "; charset=utf-8")

    def _executar(self, metodo):
        caminho = urlparse(self.path).path
        rota = ROTAS.get((metodo, caminho))
        if rota is None:
            if metodo == "GET":
                return self._arquivo(caminho)
            return self._responder(404, {"erro": "rota desconhecida"})
        dados = {}
        if metodo == "POST":
            tamanho = int(self.headers.get("Content-Length") or 0)
            if tamanho:
                try:
                    dados = json.loads(self.rfile.read(tamanho).decode("utf-8"))
                except json.JSONDecodeError:
                    return self._responder(400, {"erro": "JSON invalido"})
        con = db.conectar(criar=True)   # sobrevive ao arquivo do banco sumir
        try:
            self._responder(200, rota(con, dados, caminho))
        except api.ErroDeUso as erro:
            self._responder(400, {"erro": str(erro)})
        except Exception as erro:  # pragma: no cover - rede de seguranca
            self._responder(500, {"erro": f"{type(erro).__name__}: {erro}"})
        finally:
            con.close()

    def do_GET(self):
        self._executar("GET")

    def do_POST(self):
        self._executar("POST")


class Servidor(socketserver.ThreadingMixIn, HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def executar(porta=8756, abrir=True):
    con = db.conectar()
    db.iniciar(con)
    caminho = db.caminho_banco()
    con.close()
    endereco = f"http://localhost:{porta}"
    servidor = Servidor(("127.0.0.1", porta), Manipulador)
    print("=" * 58)
    print("  Ciclo Concursos")
    print(f"  Abra no navegador: {endereco}")
    print(f"  Seus dados ficam em: {caminho}")
    print("  Para encerrar, feche esta janela ou aperte Ctrl+C")
    print("=" * 58)
    if abrir:
        threading.Timer(1.0, lambda: webbrowser.open(endereco)).start()
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\nEncerrado.")
    finally:
        servidor.server_close()
