#!/usr/bin/env python3
"""Cancela inscrições do YouTube em canais de política.

Lista todos os canais que você segue, marca os que parecem tratar de
política (pelo nome e pela descrição), deixa você revisar a lista e só
então cancela as inscrições que você aprovar.

Uso:
    python limpar_inscricoes.py            # revisa e cancela
    python limpar_inscricoes.py --simular  # só mostra, não cancela nada
"""

import argparse
import re
import sys
import unicodedata
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

ESCOPO = ["https://www.googleapis.com/auth/youtube"]
PASTA = Path(__file__).resolve().parent
ARQUIVO_CLIENTE = PASTA / "client_secret.json"
ARQUIVO_TOKEN = PASTA / "token.json"

# Termos comparados sem acento e em minúsculas. Siglas curtas usam
# fronteira de palavra para não casar dentro de outras palavras.
PALAVRAS = [
    "politica", "politico", "politicos", "politicas",
    "eleicao", "eleicoes", "eleitoral", "candidato", "candidata",
    "deputado", "deputada", "senador", "senadora", "vereador", "vereadora",
    "governador", "prefeito", "presidente", "ministro", "ministra",
    "congresso", "camara dos deputados", "senado", "planalto", "brasilia",
    "partido", "esquerda", "direita", "conservador", "conservadora",
    "progressista", "liberalismo", "socialismo", "comunismo", "marxismo",
    "ideologia", "militante", "militancia", "democracia", "impeachment",
    "lula", "bolsonaro", "bolsonarista", "petista", "lulista",
    "stf", "tse", "cpi", "pt", "pl", "psol", "mdb", "psdb", "pdt", "psb",
    "novo partido", "uniao brasil", "republicanos", "mbl",
    "geopolitica", "governo", "oposicao", "patriota", "patriotas",
]
PADRAO = re.compile(r"\b(" + "|".join(re.escape(p) for p in PALAVRAS) + r")\b")


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
                "titulo": snippet["title"],
                "descricao": snippet.get("description", ""),
            })
        pagina = resposta.get("nextPageToken")
        if not pagina:
            return sorted(inscricoes, key=lambda i: normalizar(i["titulo"]))


def motivo_politico(inscricao):
    texto = normalizar(inscricao["titulo"] + " " + inscricao["descricao"])
    achados = sorted(set(PADRAO.findall(texto)))
    return ", ".join(achados)


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


def mostrar(lista):
    for n, inscricao in enumerate(lista, 1):
        motivo = inscricao.get("motivo")
        extra = f"  [{motivo}]" if motivo else ""
        print(f"{n:4d}. {inscricao['titulo']}{extra}")


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--simular", action="store_true", help="não cancela nada")
    args = parser.parse_args()

    youtube = build("youtube", "v3", credentials=autenticar())
    print("Buscando suas inscrições...")
    todas = listar_inscricoes(youtube)
    print(f"Você segue {len(todas)} canais.\n")

    for inscricao in todas:
        inscricao["motivo"] = motivo_politico(inscricao)
    marcados = [i for i in todas if i["motivo"]]

    print(f"{len(marcados)} parecem ser de política (entre colchetes, o termo que bateu):\n")
    mostrar(marcados)

    print("\nAlgum desses NÃO é de política? Digite os números para manter (ex: 2 5 8-10).")
    manter = ler_numeros("Enter para não manter nenhum: ", len(marcados))
    selecionados = [i for n, i in enumerate(marcados, 1) if n not in manter]

    outros = [i for i in todas if not i["motivo"]]
    if outros and input("\nQuer ver os outros canais para escolher mais algum? (s/N) ").strip().lower() == "s":
        print()
        mostrar(outros)
        extras = ler_numeros("\nNúmeros para cancelar também (Enter para nenhum): ", len(outros))
        selecionados += [i for n, i in enumerate(outros, 1) if n in extras]

    if not selecionados:
        print("\nNada para cancelar.")
        return

    print(f"\nVou cancelar a inscrição destes {len(selecionados)} canais:\n")
    for inscricao in selecionados:
        print(f"  - {inscricao['titulo']}")

    if args.simular:
        print("\nModo --simular: nada foi cancelado.")
        return
    if input("\nConfirma? Digite SIM para continuar: ").strip() != "SIM":
        print("Cancelado. Nenhuma inscrição foi alterada.")
        return

    cancelados = 0
    for inscricao in selecionados:
        try:
            youtube.subscriptions().delete(id=inscricao["id"]).execute()
            cancelados += 1
            print(f"  ok  {inscricao['titulo']}")
        except HttpError as erro:
            print(f"  ERRO {inscricao['titulo']}: {erro.reason}")
            if erro.resp.status == 403 and "quota" in str(erro).lower():
                print("\nLimite diário da API atingido. Rode de novo amanhã para continuar.")
                break
    print(f"\n{cancelados} inscrições canceladas.")


if __name__ == "__main__":
    main()
