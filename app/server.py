"""Servidor local. Usa apenas a biblioteca padrao do Python."""
import socketserver
import threading
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer

from . import auth, db, rotas


class Manipulador(BaseHTTPRequestHandler):
    server_version = "CicloConcursos"

    def log_message(self, formato, *args):
        pass

    def _executar(self, metodo):
        tamanho = int(self.headers.get("Content-Length") or 0)
        corpo = self.rfile.read(tamanho) if tamanho else b""
        codigo, cabecalhos, saida = rotas.despachar(
            metodo, self.path.split("?")[0], corpo,
            self.headers.get("Cookie", ""), seguro=False)   # http local, sem TLS
        self.send_response(codigo)
        for nome, valor in cabecalhos:
            self.send_header(nome, valor)
        self.end_headers()
        self.wfile.write(saida)

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
    protegido = auth.tem_senha(con)
    con.close()
    caminho = db.caminho_banco()
    endereco = "http://localhost:%d" % porta
    servidor = Servidor(("127.0.0.1", porta), Manipulador)
    print("=" * 60)
    print("  Ciclo Concursos")
    print("  Abra no navegador: " + endereco)
    print("  Seus dados ficam em: " + caminho)
    if protegido:
        print("  Protegido por senha.")
    print("  Para encerrar, feche esta janela ou aperte Ctrl+C")
    print("=" * 60)
    if abrir:
        threading.Timer(1.0, lambda: webbrowser.open(endereco)).start()
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\nEncerrado.")
    finally:
        servidor.server_close()
