#!/usr/bin/env python3
"""Inscreve você nos canais listados em canais.txt.

Busca cada nome no YouTube, mostra o canal encontrado, pula os que você
já segue, deixa você tirar os que vieram errados e só então se inscreve.

Uso:
    python inscrever_canais.py            # revisa e inscreve
    python inscrever_canais.py --simular  # só mostra, não inscreve
"""

import argparse
import json
import re

from googleapiclient.errors import HttpError

from comum import PASTA, conectar, cota_esgotada, ler_numeros, listar_inscricoes

ARQUIVO_CANAIS = PASTA / "canais.txt"
# Cada busca gasta 100 da cota diária de 10.000; guardar os resultados evita
# repetir buscas entre a simulação e a execução de verdade.
ARQUIVO_CACHE = PASTA / "busca_cache.json"
ID_CANAL = re.compile(r"^UC[\w-]{22}$")


def ler_canais():
    canais = []
    categoria = "Sem categoria"
    for linha in ARQUIVO_CANAIS.read_text(encoding="utf-8").splitlines():
        linha = linha.strip()
        if linha.startswith("##"):
            categoria = linha.lstrip("#").strip()
        elif linha and not linha.startswith("#"):
            canais.append({"termo": linha, "categoria": categoria})
    return canais


def carregar_cache():
    if ARQUIVO_CACHE.exists():
        return json.loads(ARQUIVO_CACHE.read_text(encoding="utf-8"))
    return {}


def salvar_cache(cache):
    ARQUIVO_CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")


def encontrar_canal(youtube, termo):
    """Devolve {"canal_id", "titulo"} do canal para o termo, ou None."""
    if ID_CANAL.match(termo):
        resposta = youtube.channels().list(part="snippet", id=termo).execute()
    elif termo.startswith("@"):
        resposta = youtube.channels().list(part="snippet", forHandle=termo).execute()
    else:
        resposta = youtube.search().list(
            part="snippet", q=termo, type="channel", maxResults=1
        ).execute()
    itens = resposta.get("items", [])
    if not itens:
        return None
    item = itens[0]
    canal_id = item["id"] if isinstance(item["id"], str) else item["id"]["channelId"]
    return {"canal_id": canal_id, "titulo": item["snippet"]["title"]}


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--simular", action="store_true", help="não inscreve em nada")
    args = parser.parse_args()

    youtube = conectar()
    print("Buscando suas inscrições atuais...")
    ja_sigo = {i["canal_id"] for i in listar_inscricoes(youtube)}

    cache = carregar_cache()
    encontrados = []
    print("Procurando os canais de canais.txt...\n")
    for canal in ler_canais():
        termo = canal["termo"]
        if termo not in cache:
            try:
                cache[termo] = encontrar_canal(youtube, termo)
            except HttpError as erro:
                if cota_esgotada(erro):
                    print("Limite diário da API atingido. Rode de novo amanhã para continuar.")
                    break
                print(f"  ERRO ao buscar '{termo}': {erro.reason}")
                continue
            salvar_cache(cache)
        achado = cache[termo]
        if not achado:
            print(f"  Não encontrado: {termo}")
        elif achado["canal_id"] in ja_sigo:
            print(f"  Já segue: {achado['titulo']}")
        elif achado["canal_id"] not in {e["canal_id"] for e in encontrados}:
            encontrados.append({**achado, **canal})

    if not encontrados:
        print("\nNada novo para inscrever.")
        return

    print(f"\nCanais encontrados ({len(encontrados)}). Confira se o nome bate com o que você queria:")
    categoria = None
    for n, canal in enumerate(encontrados, 1):
        if canal["categoria"] != categoria:
            categoria = canal["categoria"]
            print(f"\n  {categoria}")
        print(f"{n:4d}. {canal['titulo']}   (buscado: {canal['termo']})")

    print("\nAlgum veio errado ou você não quer? Digite os números para pular (ex: 2 5 8-10).")
    pular = ler_numeros("Enter para inscrever em todos: ", len(encontrados))
    selecionados = [c for n, c in enumerate(encontrados, 1) if n not in pular]
    if not selecionados:
        print("\nNada para inscrever.")
        return

    if args.simular:
        print(f"\nModo --simular: inscreveria em {len(selecionados)} canais, mas nada foi feito.")
        return
    if input(f"\nInscrever em {len(selecionados)} canais? Digite SIM para continuar: ").strip() != "SIM":
        print("Cancelado. Nenhuma inscrição foi feita.")
        return

    inscritos = 0
    for canal in selecionados:
        try:
            youtube.subscriptions().insert(
                part="snippet",
                body={"snippet": {"resourceId": {"kind": "youtube#channel", "channelId": canal["canal_id"]}}},
            ).execute()
            inscritos += 1
            print(f"  ok  {canal['titulo']}")
        except HttpError as erro:
            print(f"  ERRO {canal['titulo']}: {erro.reason}")
            if cota_esgotada(erro):
                print("\nLimite diário da API atingido. Rode de novo amanhã para continuar.")
                break
    print(f"\n{inscritos} inscrições feitas.")


if __name__ == "__main__":
    main()
