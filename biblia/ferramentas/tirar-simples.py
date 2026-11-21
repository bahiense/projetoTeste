#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tira do app os estudos no formato "simples".

A pedido do dono do app: ele só quer o estudo completo. Dois formatos
para o mesmo capítulo custavam uma escolha a cada abertura, 4 MB no
APK e um galho a mais em todo código que renderiza estudo.

Isto apaga os estudos simples dos arquivos embutidos e do índice. Os
completos e os exercícios ficam. Roda uma vez; depois dela, nada no
app gera simples.

Uso: python3 biblia/ferramentas/tirar-simples.py
"""
import io
import json
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDOS = os.path.join(AQUI, '..', 'data', 'estudos')


def main():
    tirados = 0
    bytesAntes = 0
    bytesDepois = 0
    for arq in sorted(os.listdir(ESTUDOS)):
        if not arq.endswith('.json') or arq == 'indice.json':
            continue
        caminho = os.path.join(ESTUDOS, arq)
        bytesAntes += os.path.getsize(caminho)
        with io.open(caminho, encoding='utf-8') as f:
            livro = json.load(f)
        ficam = {}
        for chave in livro:
            e = livro[chave] or {}
            if e.get('formato') == 'simples' or chave.endswith(' · simples'):
                tirados += 1
                continue
            ficam[chave] = livro[chave]
        with io.open(caminho, 'w', encoding='utf-8') as f:
            json.dump(ficam, f, ensure_ascii=False, separators=(',', ':'))
        bytesDepois += os.path.getsize(caminho)

    indice = os.path.join(ESTUDOS, 'indice.json')
    with io.open(indice, encoding='utf-8') as f:
        lista = json.load(f)
    nova = [e for e in lista if e.get('formato') != 'simples']
    with io.open(indice, 'w', encoding='utf-8') as f:
        json.dump(nova, f, ensure_ascii=False, separators=(',', ':'))

    print('%d estudos simples apagados · índice: %d → %d · %.1f MB → %.1f MB'
          % (tirados, len(lista), len(nova),
             bytesAntes / 1048576.0, bytesDepois / 1048576.0))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
