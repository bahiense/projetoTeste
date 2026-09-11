"""Senha e sessao. Biblioteca padrao apenas.

Na maquina de casa o sistema roda aberto: ele so escuta em 127.0.0.1 e quem
esta na frente do computador ja e o dono. Publicado na internet a historia
muda, e ai a senha passa a ser obrigatoria — o modo servidor se recusa a
mostrar qualquer dado enquanto nao existir uma.
"""
import base64
import hashlib
import hmac
import json
import os
import secrets
import time

ITERACOES = 240_000
VALIDADE = 60 * 60 * 24 * 30          # trinta dias de sessao


def _derivar(senha, sal):
    return hashlib.pbkdf2_hmac("sha256", senha.encode("utf-8"), sal, ITERACOES)


def criar_hash(senha):
    sal = secrets.token_bytes(16)
    return "pbkdf2$%d$%s$%s" % (
        ITERACOES, base64.b64encode(sal).decode(), base64.b64encode(_derivar(senha, sal)).decode())


def conferir_hash(senha, guardado):
    try:
        _, iteracoes, sal, esperado = guardado.split("$")
        sal = base64.b64decode(sal)
        calculado = hashlib.pbkdf2_hmac("sha256", senha.encode("utf-8"), sal, int(iteracoes))
        return hmac.compare_digest(calculado, base64.b64decode(esperado))
    except Exception:
        return False


# ------------------------------------------------------------------ estado

def _obter(con, chave):
    linha = con.execute("SELECT valor FROM config WHERE chave = ?", (chave,)).fetchone()
    return linha["valor"] if linha else ""


def _gravar(con, chave, valor):
    con.execute("INSERT INTO config (chave, valor) VALUES (?, ?) "
                "ON CONFLICT (chave) DO UPDATE SET valor = excluded.valor", (chave, valor))


def tem_senha(con):
    return bool(_obter(con, "senha_hash"))


def segredo(con):
    atual = _obter(con, "segredo_sessao")
    if not atual:
        atual = secrets.token_hex(32)
        _gravar(con, "segredo_sessao", atual)
        con.commit()
    return atual


def definir_senha(con, senha, senha_atual=None):
    """Define ou troca a senha. Trocar exige a senha antiga."""
    senha = (senha or "").strip()
    if len(senha) < 6:
        raise ValueError("A senha precisa ter pelo menos 6 caracteres")
    if tem_senha(con) and not conferir_hash(senha_atual or "", _obter(con, "senha_hash")):
        raise ValueError("A senha atual não confere")
    _gravar(con, "senha_hash", criar_hash(senha))
    _gravar(con, "segredo_sessao", secrets.token_hex(32))   # derruba as sessoes antigas
    con.commit()


def conferir_senha(con, senha):
    guardado = _obter(con, "senha_hash")
    return bool(guardado) and conferir_hash(senha or "", guardado)


# ------------------------------------------------------------------ sessao

def criar_token(con):
    corpo = base64.urlsafe_b64encode(
        json.dumps({"exp": int(time.time()) + VALIDADE}).encode()).decode().rstrip("=")
    assinatura = hmac.new(segredo(con).encode(), corpo.encode(), hashlib.sha256).hexdigest()
    return corpo + "." + assinatura


def token_valido(con, token):
    if not token or "." not in token:
        return False
    corpo, assinatura = token.rsplit(".", 1)
    esperada = hmac.new(segredo(con).encode(), corpo.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(assinatura, esperada):
        return False
    try:
        recheio = corpo + "=" * (-len(corpo) % 4)
        return json.loads(base64.urlsafe_b64decode(recheio))["exp"] > time.time()
    except Exception:
        return False


def cookie_de_sessao(token, seguro=True, apagar=False):
    partes = ["sessao=" + ("" if apagar else token), "Path=/", "HttpOnly", "SameSite=Lax"]
    partes.append("Max-Age=0" if apagar else "Max-Age=%d" % VALIDADE)
    if seguro:
        partes.append("Secure")
    return "; ".join(partes)


def token_do_cabecalho(cabecalho):
    for parte in (cabecalho or "").split(";"):
        nome, _, valor = parte.strip().partition("=")
        if nome == "sessao":
            return valor
    return ""


def modo_servidor():
    """Publicado na internet? Entao a senha e obrigatoria."""
    return os.environ.get("CICLO_MODO", "").lower() == "servidor"
