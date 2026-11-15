#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Põe as orações bíblicas nos jogos, a partir de oracoes-fonte.json.

Os baralhos de oração não são escritos à mão em jogos-fonte.json: seriam
uma segunda cópia da mesma lista, para sair de sincronia com a primeira.
Este programa reescreve (só) os baralhos de id "orar-*" a partir da fonte
das orações, e depois gerar-jogos.py os confere como qualquer outro item,
contra o texto bíblico do app.

Uso: python3 biblia/ferramentas/jogos-de-oracoes.py
"""
import io
import json
import os
import re

AQUI = os.path.dirname(os.path.abspath(__file__))
ORACOES = os.path.join(AQUI, 'oracoes-fonte.json')
JOGOS = os.path.join(AQUI, 'jogos-fonte.json')
TEXTO = os.path.join(AQUI, '..', 'data', 'texto')
BIBLIA = os.path.join(AQUI, '..', 'data', 'biblia.js')
TEMA = 'As orações da Bíblia'

# Quantas palavras do começo da oração entram no baralho. Doze é o que
# cabe num botão de celular e o que basta para a boca pegar o embalo:
# quem sabe como começa não trava, e travar é o que se quer evitar.
PALAVRAS = 12

# O Novo Testamento começa em Mateus: é o que separa os dois blocos.
NT = set('MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM '
         'HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split())


def ehNT(ref):
    return ref.split(' ')[0] in NT


def mapaLivros():
    """{usfm: arquivo}, da mesma lista que o app usa."""
    js = io.open(BIBLIA, encoding='utf-8').read()
    m = re.search(r"var USFM = \(([\s\S]*?)\)\.split", js)
    if not m:
        raise SystemExit('não achei a lista USFM em data/biblia.js')
    codigos = ' '.join(re.findall(r"'([^']*)'", m.group(1))).split()
    return dict((c, '%02d' % (i + 1)) for i, c in enumerate(codigos))


def comeco(mapa, ref, palavras=PALAVRAS):
    """
    As primeiras palavras da oração, copiadas do texto do app.

    Não são escritas aqui: são lidas de data/texto, na Almeida revista
    (grafia de hoje), exatamente como estão. É o que faz o baralho
    trabalhar a Escritura, e não a minha lembrança dela.
    """
    m = re.match(r'^(\S+) (\d+)\.(\d+)', ref)
    if not m:
        return None
    arq = mapa.get(m.group(1))
    if not arq:
        return None
    for edicao in ('jfaal', '1911'):
        caminho = os.path.join(TEXTO, edicao, arq + '.json')
        if not os.path.exists(caminho):
            continue
        with io.open(caminho, encoding='utf-8') as f:
            d = json.load(f)
        caps = d.get('caps') or []
        cap = int(m.group(2))
        if cap > len(caps):
            continue
        vv = caps[cap - 1]
        v = int(m.group(3))
        if v > len(vv):
            continue
        partes = str(vv[v - 1]).split()
        if len(partes) < 4:
            continue
        corte = ' '.join(partes[:palavras])
        return corte.rstrip(',;:.') + ('…' if len(partes) > palavras else '')
    return None


def pedacos(lista, n):
    """
    Divide em grupos de n, sem deixar sobra pequena.

    Baralho com menos de três itens não aceita o relâmpago (o jogo
    precisa de alternativas erradas para oferecer), então a sobra volta
    para o grupo anterior em vez de virar um baralho manco.
    """
    fora = [lista[i:i + n] for i in range(0, len(lista), n)]
    if len(fora) > 1 and len(fora[-1]) < 3:
        fora[-2].extend(fora.pop())
    return fora


def main():
    fonte = json.load(io.open(ORACOES, encoding='utf-8'))
    jogos = json.load(io.open(JOGOS, encoding='utf-8'))
    oracoes = fonte['oracoes']
    nomeUso = dict((u['id'], u['nome']) for u in fonte['usos'])

    mapa = mapaLivros()
    semComeco = []

    novos = []
    for parte, titulo in (('at', 'Antigo Testamento'), ('nt', 'Novo Testamento')):
        desta = [o for o in oracoes if ehNT(o['ref']) == (parte == 'nt')]

        # O baralho que trabalha de cor: as palavras com que a oração
        # começa. Saber de quem é uma oração não ajuda ninguém a orar;
        # ter a primeira frase na boca, ajuda.
        comComeco = []
        for o in desta:
            texto = comeco(mapa, o['ref'])
            if not texto:
                semComeco.append(o['id'])
                continue
            comComeco.append((o, texto))
        for n, grupo in enumerate(pedacos(comComeco, 6), 1):
            novos.append({
                'id': 'orar-comeco-%s-%d' % (parte, n),
                'tema': TEMA, 'jogo': 'pares',
                'nome': 'Como começa — %s %d' % (titulo, n),
                'fonte': 'As orações do %s, na Almeida revista do app' % titulo,
                'itens': [{'a': o['titulo'], 'b': '"' + texto + '"',
                           'ref': o['ref'], 'conf': o['conf'][0]}
                          for o, texto in grupo]
            })

        for n, grupo in enumerate(pedacos(desta, 8), 1):
            novos.append({
                'id': 'orar-onde-%s-%d' % (parte, n),
                'tema': TEMA, 'jogo': 'pares',
                'nome': 'Onde está a oração — %s %d' % (titulo, n),
                'fonte': 'As orações do %s' % titulo,
                'itens': [{'a': o['titulo'], 'b': o['onde'],
                           'ref': o['ref'], 'conf': o['conf'][0]} for o in grupo]
            })

    # Uma oração por ocasião: é o baralho que serve quando te chamam de
    # surpresa e você precisa saber para onde correr.
    porUso = []
    usados = set()
    for u in fonte['usos']:
        for o in oracoes:
            if u['id'] in o['usos'] and o['id'] not in usados:
                porUso.append({'a': nomeUso[u['id']], 'b': o['titulo'],
                               'ref': o['ref'], 'conf': o['conf'][0]})
                usados.add(o['id'])
                break
    for n, grupo in enumerate(pedacos(porUso, 7), 1):
        novos.append({
            'id': 'orar-ocasiao-%d' % n,
            'tema': TEMA, 'jogo': 'pares',
            'nome': 'A oração para a hora — %d' % n,
            'fonte': 'As orações da Bíblia',
            'itens': grupo
        })

    outros = [b for b in jogos['baralhos'] if not b['id'].startswith('orar-')]
    jogos['baralhos'] = outros + novos
    io.open(JOGOS, 'w', encoding='utf-8').write(
        json.dumps(jogos, ensure_ascii=False, indent=1))
    print('%d baralhos de oração, %d itens (%d baralhos no total)'
          % (len(novos), sum(len(b['itens']) for b in novos), len(jogos['baralhos'])))
    if semComeco:
        print('sem primeiras palavras no texto: %s' % ', '.join(semComeco))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
