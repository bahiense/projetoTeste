#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Converte o comentário completo de Matthew Henry para o formato do app.

A fonte é lyteword/mhenry-complete: os seis volumes em markdown, um arquivo
por capítulo, em CC0. Henry (1662-1714) é puritano inglês — a mesma veia
reformada das confissões que o app já carrega — e, ao contrário de Calvino,
comentou a Bíblia inteira: 1.189 capítulos, sem buraco nenhum.

O que entra: a prosa de Henry. O que sai: o cabeçalho do site estático e o
texto bíblico citado em bloco (é a KJV, e o app já tem a sua Bíblia).

Uso:
    git clone --depth 1 https://github.com/lyteword/mhenry-complete.git /tmp/henry
    python3 biblia/ferramentas/gerar-henry.py /tmp/henry
"""
import json
import os
import re
import sys
import glob

LIMITE = 1_500_000
SAIDA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'henry')

# As pastas do repositório, no nome em inglês, para o código USFM do app.
USFM = {
    'genesis': 'GEN', 'exodus': 'EXO', 'leviticus': 'LEV', 'numbers': 'NUM',
    'deuteronomy': 'DEU', 'joshua': 'JOS', 'judges': 'JDG', 'ruth': 'RUT',
    '1-samuel': '1SA', '2-samuel': '2SA', '1-kings': '1KI', '2-kings': '2KI',
    '1-chronicles': '1CH', '2-chronicles': '2CH', 'ezra': 'EZR', 'nehemiah': 'NEH',
    'esther': 'EST', 'job': 'JOB', 'psalms': 'PSA', 'proverbs': 'PRO',
    'ecclesiastes': 'ECC', 'song-of-solomon': 'SNG', 'isaiah': 'ISA', 'jeremiah': 'JER',
    'lamentations': 'LAM', 'ezekiel': 'EZK', 'daniel': 'DAN', 'hosea': 'HOS',
    'joel': 'JOL', 'amos': 'AMO', 'obadiah': 'OBA', 'jonah': 'JON', 'micah': 'MIC',
    'nahum': 'NAM', 'habakkuk': 'HAB', 'zephaniah': 'ZEP', 'haggai': 'HAG',
    'zechariah': 'ZEC', 'malachi': 'MAL', 'matthew': 'MAT', 'mark': 'MRK',
    'luke': 'LUK', 'john': 'JHN', 'acts': 'ACT', 'romans': 'ROM',
    '1-corinthians': '1CO', '2-corinthians': '2CO', 'galatians': 'GAL',
    'ephesians': 'EPH', 'philippians': 'PHP', 'colossians': 'COL',
    '1-thessalonians': '1TH', '2-thessalonians': '2TH', '1-timothy': '1TI',
    '2-timothy': '2TI', 'titus': 'TIT', 'philemon': 'PHM', 'hebrews': 'HEB',
    'james': 'JAS', '1-peter': '1PE', '2-peter': '2PE', '1-john': '1JN',
    '2-john': '2JN', '3-john': '3JN', 'jude': 'JUD', 'revelation': 'REV'
}


def limpar(bruto):
    t = re.sub(r'^---\n.*?\n---\n', '', bruto, flags=re.S)   # cabeçalho do site
    t = re.sub(r'^>.*$', '', t, flags=re.M)                  # o texto bíblico (KJV)
    t = re.sub(r'^#\s+.*$', '', t, flags=re.M)               # o título do capítulo
    t = re.sub(r'^##\s+', '— ', t, flags=re.M)               # subtítulos viram linha simples
    t = t.replace('\\.', '.').replace('*', '')
    t = re.sub(r'[ \t]+', ' ', t)
    t = re.sub(r'\n{3,}', '\n\n', t)
    return t.strip()


def ler(raiz):
    obra = {}
    for caminho in glob.glob(os.path.join(raiz, 'volume-*', '*', '*.md')):
        pasta = os.path.basename(os.path.dirname(caminho))
        nome = os.path.basename(caminho)
        m = re.match(r'(?:chapter|psalm)-(\d+)\.md$', nome)
        if not m or pasta not in USFM:
            continue
        with open(caminho, encoding='utf-8') as f:
            texto = limpar(f.read())
        if texto:
            obra.setdefault(USFM[pasta], {})[m.group(1)] = texto
    return obra


def main(raiz):
    obra = ler(raiz)
    os.makedirs(SAIDA, exist_ok=True)
    for velho in glob.glob(os.path.join(SAIDA, '*.json')):
        os.remove(velho)

    indice, resumo, arquivos = {}, {}, 0
    for usfm in sorted(obra):
        caps = sorted(obra[usfm], key=int)
        resumo[usfm] = len(caps)
        pedaco, tamanho, n = {}, 0, 1
        for cap in caps:
            corpo = obra[usfm][cap]
            if pedaco and tamanho + len(corpo) > LIMITE:
                gravar(usfm, n, pedaco, indice)
                arquivos += 1
                pedaco, tamanho, n = {}, 0, n + 1
            pedaco[cap] = corpo
            tamanho += len(corpo)
        if pedaco:
            gravar(usfm, n, pedaco, indice)
            arquivos += 1

    with open(os.path.join(SAIDA, 'indice.json'), 'w', encoding='utf-8') as f:
        json.dump({
            'obra': 'Comentário de Matthew Henry',
            'fonte': 'lyteword/mhenry-complete (CC0), os seis volumes de 1708-1710',
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
