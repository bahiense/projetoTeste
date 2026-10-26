"""Login no Google e leitura das inscrições, usados pelos dois scripts."""

import sys
import unicodedata
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

ESCOPO = ["https://www.googleapis.com/auth/youtube"]
PASTA = Path(__file__).resolve().parent
ARQUIVO_CLIENTE = PASTA / "client_secret.json"
ARQUIVO_TOKEN = PASTA / "token.json"


def normalizar(texto):
    sem_acento = unicodedata.normalize("NFKD", texto)
    sem_acento = "".join(c for c in sem_acento if not unicodedata.combining(c))
    return sem_acento.lower()


def autenticar():
    credenciais = None
    if ARQUIVO_TOKEN.exists():
        credenciais = Credentials.from_authorized_user_file(str(ARQUIVO_TOKEN), ESCOPO)
    if credenciais and credenciais.valid:
        return credenciais
    if credenciais and credenciais.expired and credenciais.refresh_token:
        credenciais.refresh(Request())
    else:
        if not ARQUIVO_CLIENTE.exists():
            sys.exit(f"Arquivo {ARQUIVO_CLIENTE.name} não encontrado nesta pasta. Veja o LEIAME.md.")
        fluxo = InstalledAppFlow.from_client_secrets_file(str(ARQUIVO_CLIENTE), ESCOPO)
        credenciais = fluxo.run_local_server(port=0)
    ARQUIVO_TOKEN.write_text(credenciais.to_json())
    return credenciais


def conectar():
    return build("youtube", "v3", credentials=autenticar())


def listar_inscricoes(youtube):
    inscricoes = []
    pagina = None
    while True:
        resposta = youtube.subscriptions().list(
            part="snippet", mine=True, maxResults=50, pageToken=pagina
        ).execute()
        for item in resposta.get("items", []):
            snippet = item["snippet"]
            inscricoes.append({
                "id": item["id"],
                "canal_id": snippet["resourceId"]["channelId"],
                "titulo": snippet["title"],
                "descricao": snippet.get("description", ""),
            })
        pagina = resposta.get("nextPageToken")
        if not pagina:
            return sorted(inscricoes, key=lambda i: normalizar(i["titulo"]))


def ler_numeros(mensagem, limite):
    """Lê números separados por espaço ou vírgula, aceitando faixas (3-7)."""
    entrada = input(mensagem).replace(",", " ").split()
    numeros = set()
    for parte in entrada:
        try:
            if "-" in parte:
                inicio, fim = (int(n) for n in parte.split("-", 1))
                numeros.update(range(inicio, fim + 1))
            else:
                numeros.add(int(parte))
        except ValueError:
            print(f"  Ignorando '{parte}' (não é número).")
    return {n for n in numeros if 1 <= n <= limite}


def cota_esgotada(erro):
    return erro.resp.status == 403 and "quota" in str(erro).lower()
