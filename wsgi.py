"""Ponto de entrada para hospedagem (PythonAnywhere e qualquer servidor WSGI).

No PythonAnywhere, aponte o arquivo WSGI da sua web app para:

    import os, sys
    sys.path.insert(0, "/home/SEU_USUARIO/ciclo-concursos")
    os.environ["CICLO_MODO"] = "servidor"
    os.environ["CICLO_DB"] = "/home/SEU_USUARIO/ciclo-concursos/dados.db"
    from wsgi import application
"""
import os

os.environ.setdefault("CICLO_MODO", "servidor")

from app import db, rotas   # noqa: E402  (depois de fixar o modo)

_pronto = False


def _garantir_banco():
    global _pronto
    if not _pronto:
        con = db.conectar()
        db.iniciar(con)
        con.close()
        _pronto = True


def application(environ, start_response):
    _garantir_banco()
    metodo = environ.get("REQUEST_METHOD", "GET")
    caminho = environ.get("PATH_INFO", "/") or "/"
    try:
        tamanho = int(environ.get("CONTENT_LENGTH") or 0)
    except ValueError:
        tamanho = 0
    corpo = environ["wsgi.input"].read(tamanho) if tamanho else b""
    seguro = environ.get("wsgi.url_scheme", "http") == "https" or \
        environ.get("HTTP_X_FORWARDED_PROTO", "") == "https"

    codigo, cabecalhos, saida = rotas.despachar(
        metodo, caminho, corpo, environ.get("HTTP_COOKIE", ""), seguro=seguro)

    cabecalhos = list(cabecalhos) + [
        ("X-Content-Type-Options", "nosniff"),
        ("Referrer-Policy", "same-origin"),
        ("X-Frame-Options", "DENY"),
    ]
    textos = {200: "200 OK", 400: "400 Bad Request", 401: "401 Unauthorized",
              404: "404 Not Found", 500: "500 Internal Server Error"}
    start_response(textos.get(codigo, "%d Status" % codigo), cabecalhos)
    return [saida]
