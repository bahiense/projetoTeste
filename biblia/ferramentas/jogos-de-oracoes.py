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

AQUI = os.path.dirname(os.path.abspath(__file__))
ORACOES = os.path.join(AQUI, 'oracoes-fonte.json')
JOGOS = os.path.join(AQUI, 'jogos-fonte.json')
TEMA = 'As orações da Bíblia'

# O Novo Testamento começa em Mateus: é o que separa os dois blocos.
NT = set('MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM '
         'HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split())


def ehNT(ref):
    return ref.split(' ')[0] in NT


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

    novos = []
    for parte, titulo in (('at', 'Antigo Testamento'), ('nt', 'Novo Testamento')):
        desta = [o for o in oracoes if ehNT(o['ref']) == (parte == 'nt')]
        for n, grupo in enumerate(pedacos(desta, 8), 1):
            novos.append({
                'id': 'orar-quem-%s-%d' % (parte, n),
                'tema': TEMA, 'jogo': 'pares',
                'nome': 'Quem orou — %s %d' % (titulo, n),
                'fonte': 'As orações do %s' % titulo,
                'itens': [{'a': o['titulo'], 'b': o['quem'],
                           'ref': o['ref'], 'conf': o['conf'][0]} for o in grupo]
            })
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
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
