"""Roteamento e controle de acesso, compartilhados pelos dois modos de execucao.

O mesmo despachante atende o servidor local (`python -m app`) e o servidor do
provedor de hospedagem (`wsgi.py`). Assim as regras de acesso valem nos dois, e
nao ha um caminho "de producao" que ninguem testou.
"""
import json
import mimetypes
import os

from . import api, auth, db

WEB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web")

ROTAS = {
    ("GET", "/api/estado"): lambda c, d: api.estado(c),
    ("GET", "/api/panorama"): lambda c, d: api.panorama(c),
    ("GET", "/api/erros"): lambda c, d: api.caderno_de_erros(c),
    ("GET", "/api/determinacoes"): lambda c, d: api.determinacoes(c),
    ("GET", "/api/exportar"): lambda c, d: api.exportar(c),
    ("POST", "/api/materias"): lambda c, d: api.salvar_materia(c, d),
    ("POST", "/api/aulas"): lambda c, d: api.salvar_aula(c, d),
    ("POST", "/api/aulas/lote"): lambda c, d: api.criar_aulas_em_lote(c, d),
    ("POST", "/api/sessoes/concluir"): lambda c, d: api.concluir_sessao(c, d),
    ("POST", "/api/sessoes/desfazer"): lambda c, d: api.desfazer_sessao(c, d),
    ("POST", "/api/baterias"): lambda c, d: api.registrar_bateria(c, d),
    ("POST", "/api/revisoes/concluir"): lambda c, d: api.concluir_revisao_espacada(c, d),
    ("POST", "/api/revisoes/adiar"): lambda c, d: api.adiar_revisao_espacada(c, d),
    ("POST", "/api/erros/alternar"): lambda c, d: api.alternar_erro(c, d),
    ("POST", "/api/config"): lambda c, d: api.salvar_config(c, d),
    ("POST", "/api/determinacoes"): lambda c, d: api.salvar_determinacoes(c, d),
    ("POST", "/api/importar"): lambda c, d: api.importar(c, d),
    ("POST", "/api/excluir"): lambda c, d: api.excluir(c, d.get("tabela"), d.get("id")),
}

# Rotas que precisam responder antes de haver sessao, senao nao ha como entrar.
ABERTAS = {("GET", "/api/sessao"), ("POST", "/api/sessao/entrar"),
           ("POST", "/api/sessao/sair"), ("POST", "/api/senha/definir")}


def _json(codigo, corpo, extras=None):
    dados = json.dumps(corpo, ensure_ascii=False).encode("utf-8")
    cabecalhos = [("Content-Type", "application/json; charset=utf-8"),
                  ("Content-Length", str(len(dados))), ("Cache-Control", "no-store")]
    cabecalhos.extend(extras or [])
    return codigo, cabecalhos, dados


def _arquivo(caminho):
    if caminho in ("", "/"):
        caminho = "/index.html"
    destino = os.path.normpath(os.path.join(WEB, caminho.lstrip("/")))
    if not destino.startswith(WEB) or not os.path.isfile(destino):
        return _json(404, {"erro": "não encontrado"})
    tipo = (mimetypes.guess_type(destino)[0] or "application/octet-stream") + "; charset=utf-8"
    with open(destino, "rb") as arquivo:
        corpo = arquivo.read()
    return 200, [("Content-Type", tipo), ("Content-Length", str(len(corpo))),
                 ("Cache-Control", "no-store")], corpo


def _liberado(con, token):
    """Quem pode ver os dados agora?

    No servidor a senha e obrigatoria: sem senha cadastrada, ninguem passa — a
    tela so oferece a criacao dela. Em casa, sem senha cadastrada, tudo passa.
    """
    if not auth.tem_senha(con):
        return not auth.modo_servidor()
    return auth.token_valido(con, token)


def despachar(metodo, caminho, corpo_bruto, cookie="", seguro=True):
    """Devolve (codigo, cabecalhos, corpo) para qualquer um dos dois servidores."""
    if metodo == "GET" and not caminho.startswith("/api/"):
        return _arquivo(caminho)

    chave = (metodo, caminho)
    if chave not in ROTAS and chave not in ABERTAS:
        return _json(404, {"erro": "rota desconhecida"})

    dados = {}
    if metodo == "POST" and corpo_bruto:
        try:
            dados = json.loads(corpo_bruto.decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            return _json(400, {"erro": "JSON inválido"})

    con = db.conectar(criar=True)
    try:
        token = auth.token_do_cabecalho(cookie)

        if chave == ("GET", "/api/sessao"):
            return _json(200, {"tem_senha": auth.tem_senha(con),
                               "autenticado": _liberado(con, token),
                               "modo_servidor": auth.modo_servidor()})

        if chave == ("POST", "/api/sessao/entrar"):
            if not auth.conferir_senha(con, dados.get("senha")):
                return _json(401, {"erro": "Senha incorreta"})
            return _json(200, {"ok": True},
                         [("Set-Cookie", auth.cookie_de_sessao(auth.criar_token(con), seguro))])

        if chave == ("POST", "/api/sessao/sair"):
            return _json(200, {"ok": True},
                         [("Set-Cookie", auth.cookie_de_sessao("", seguro, apagar=True))])

        if chave == ("POST", "/api/senha/definir"):
            # Trocar a senha exige estar dentro; cria-la pela primeira vez, nao.
            if auth.tem_senha(con) and not auth.token_valido(con, token):
                return _json(401, {"erro": "Entre com a senha atual primeiro"})
            try:
                auth.definir_senha(con, dados.get("senha"), dados.get("senha_atual"))
            except ValueError as erro:
                return _json(400, {"erro": str(erro)})
            return _json(200, {"ok": True},
                         [("Set-Cookie", auth.cookie_de_sessao(auth.criar_token(con), seguro))])

        if not _liberado(con, token):
            return _json(401, {"erro": "Sessão expirada", "tem_senha": auth.tem_senha(con)})

        try:
            return _json(200, ROTAS[chave](con, dados))
        except api.ErroDeUso as erro:
            return _json(400, {"erro": str(erro)})
        except Exception as erro:                      # rede de seguranca
            return _json(500, {"erro": "%s: %s" % (type(erro).__name__, erro)})
    finally:
        con.close()
