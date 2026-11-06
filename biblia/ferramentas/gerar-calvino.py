#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Converte o comentário de João Calvino para o formato do app.

A fonte é o módulo CalvinCommentaries do projeto SWORD (CrossWire), que por
sua vez vem do CCEL — domínio público, tradução inglesa do século XIX. O
repositório thefrenchpressed/pillar-commentary-data já o converteu para JSON
por capítulo (licença MIT); aqui ele vira pedaços do tamanho certo para a
página baixar um de cada vez.

Por que pedaços e não um arquivo por capítulo: são 819 capítulos, e o
artefato aceita no máximo 511 arquivos por versão. Por que não um arquivo
por livro: o de Salmos sozinho tem 13 MB, e ninguém deve baixar 13 MB para
gerar o estudo de um salmo.

Uso:
    git clone --depth 1 https://github.com/thefrenchpressed/pillar-commentary-data.git /tmp/pillar
    python3 biblia/ferramentas/gerar-calvino.py /tmp/pillar
"""
import json
import os
import sys
import glob

LIMITE = 1_500_000          # bytes por pedaço: um download curto no celular
SAIDA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'calvino')


def texto_do_versiculo(bloco):
    partes = []
    for x in bloco.get('content', []):
        if isinstance(x, dict) and 'text' in x:
            partes.append(x['text'])
        elif isinstance(x, str):
            partes.append(x)
    return ' '.join(' '.join(partes).split())


def ler(raiz):
    """{usfm: {cap: {versiculo: texto}}} — na ordem dos arquivos da fonte."""
    obra = {}
    for caminho in sorted(glob.glob(os.path.join(raiz, 'c', 'calvin', '*', '*.json'))):
        usfm = os.path.basename(os.path.dirname(caminho))
        cap = os.path.splitext(os.path.basename(caminho))[0]
        if not cap.isdigit():
            continue
        with open(caminho, encoding='utf-8') as f:
            dados = json.load(f)
        versos = {}
        for bloco in dados.get('chapter', {}).get('content', []):
            if bloco.get('type') != 'verse':
                continue
            t = texto_do_versiculo(bloco)
            if t:
                versos[str(bloco['number'])] = t
        if versos:
            obra.setdefault(usfm, {})[cap] = versos
    return obra


def main(raiz):
    obra = ler(raiz)
    os.makedirs(SAIDA, exist_ok=True)
    for velho in glob.glob(os.path.join(SAIDA, '*.json')):
        os.remove(velho)

    indice = {}     # "ROM 8" -> "ROM-1"
    resumo = {}     # ROM -> quantos capítulos
    arquivos = 0

    for usfm in sorted(obra):
        caps = sorted(obra[usfm], key=int)
        resumo[usfm] = len(caps)
        pedaco, tamanho, n = {}, 0, 1
        for cap in caps:
            corpo = obra[usfm][cap]
            peso = sum(len(t) for t in corpo.values()) + 64 * len(corpo)
            # Um capítulo nunca é partido ao meio: ou cabe no pedaço aberto,
            # ou abre o próximo. Meia explicação de Calvino não serve a nada.
            if pedaco and tamanho + peso > LIMITE:
                gravar(usfm, n, pedaco, indice)
                arquivos += 1
                pedaco, tamanho, n = {}, 0, n + 1
            pedaco[cap] = corpo
            tamanho += peso
        if pedaco:
            gravar(usfm, n, pedaco, indice)
            arquivos += 1

    with open(os.path.join(SAIDA, 'indice.json'), 'w', encoding='utf-8') as f:
        json.dump({
            'obra': 'Comentários de João Calvino',
            'fonte': 'CCEL / CrossWire SWORD (domínio público), via pillar-commentary-data',
            'lingua': 'en',
            'capitulos': indice,
            'livros': resumo
        }, f, ensure_ascii=False, separators=(',', ':'))

    total = sum(os.path.getsize(p) for p in glob.glob(os.path.join(SAIDA, '*.json')))
    print('livros: %d · capítulos: %d · pedaços: %d · total: %.1f MB'
          % (len(resumo), len(indice), arquivos, total / 1048576))
    maior = max(glob.glob(os.path.join(SAIDA, '*.json')), key=os.path.getsize)
    print('maior pedaço: %s (%.1f MB)' % (os.path.basename(maior), os.path.getsize(maior) / 1048576))


def gravar(usfm, n, pedaco, indice):
    nome = '%s-%d' % (usfm, n)
    with open(os.path.join(SAIDA, nome + '.json'), 'w', encoding='utf-8') as f:
        json.dump({'livro': usfm, 'caps': pedaco}, f, ensure_ascii=False, separators=(',', ':'))
    for cap in pedaco:
        indice['%s %s' % (usfm, cap)] = nome


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1])
