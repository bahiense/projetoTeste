#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
A escola de oração, conferida contra o texto bíblico do próprio app.

As orações daqui são as da Bíblia — não as escritas por IA nos estudos.
É essa a razão de existir deste programa: oração que se vai decorar para
orar na frente de outras pessoas não pode ser inventada, nem pode estar
numa referência errada.

A lista é escrita à mão (ferramentas/oracoes-fonte.json) e cada entrada
traz um trecho que TEM de aparecer naqueles versículos, nas edições da
Almeida embutidas no app. Quem confere é este programa. Entrada que não
casa derruba a geração inteira, com relatório.

O arquivo gerado NÃO guarda texto bíblico: guarda referência. O texto
mostrado na tela é lido do próprio app, em tempo de uso — é assim que a
tela nunca mostra uma palavra que o app não tenha.

Uso:
    python3 biblia/ferramentas/gerar-oracoes.py
    python3 biblia/ferramentas/gerar-oracoes.py --so-conferir
"""
import io
import json
import os
import re
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from importlib.machinery import SourceFileLoader   # noqa: E402

# Reaproveita o leitor de Bíblia do gerador de jogos: uma cópia dele aqui
# seria uma segunda verdade para sair de sincronia com a primeira.
_jogos = SourceFileLoader('gerar_jogos', os.path.join(AQUI, 'gerar-jogos.py')).load_module()
Biblia, simples = _jogos.Biblia, _jogos.simples

FONTE = os.path.join(AQUI, 'oracoes-fonte.json')
SAIDA = os.path.join(AQUI, '..', 'data', 'oracoes-biblicas.js')


def conferir(bib, dados):
    problemas = []
    movs = set(m['id'] for m in dados['movimentos'])
    usos = set(u['id'] for u in dados['usos'])
    vistos = set()

    for o in dados['oracoes']:
        if o['id'] in vistos:
            problemas.append(('oração', o['id'], 'id repetido', ''))
        vistos.add(o['id'])
        # O id vai em endereço de tela e em chave de fila: acento ali
        # vira %C3%B3 num lugar e letra no outro, e as duas deixam de
        # casar. Letra simples, número e hífen, só.
        if not re.match(r'^[a-z0-9-]+$', o['id']):
            problemas.append(('oração', o['id'], 'id com acento ou maiúscula', ''))
        texto = bib.trecho(o['ref'])
        if texto is None:
            problemas.append(('oração', o['id'], 'referência inválida', o['ref']))
            continue
        for u in o['usos']:
            if u not in usos:
                problemas.append(('oração', o['id'], 'uso desconhecido', u))
        # Basta um dos trechos casar: as duas edições divergem de palavra.
        if o['conf'] and not any(simples(c) in texto for c in o['conf']):
            problemas.append(('oração', o['id'], 'não achei "%s" em' % o['conf'][0], o['ref']))

    for f in dados['frases']:
        if f['movimento'] not in movs:
            problemas.append(('frase', f['ref'], 'movimento desconhecido', f['movimento']))
        texto = bib.trecho(f['ref'])
        if texto is None:
            problemas.append(('frase', f['ref'], 'referência inválida', f['ref']))
            continue
        if simples(f['conf']) not in texto:
            problemas.append(('frase', f['ref'], 'não achei "%s" em' % f['conf'], f['ref']))

    # Um movimento sem frase deixaria a tela com uma coluna vazia.
    for m in dados['movimentos']:
        if not [f for f in dados['frases'] if f['movimento'] == m['id']]:
            problemas.append(('movimento', m['id'], 'sem nenhuma frase', ''))
    return problemas


def main(so_conferir=False):
    with io.open(FONTE, encoding='utf-8') as f:
        dados = json.load(f)
    bib = Biblia()

    problemas = conferir(bib, dados)
    for p in problemas:
        print('  ✗ %-10s %-22s %s %s' % p)

    print('%d orações bíblicas, %d frases em %d movimentos, %d ocasiões'
          % (len(dados['oracoes']), len(dados['frases']),
             len(dados['movimentos']), len(dados['usos'])))
    for m in dados['movimentos']:
        n = len([f for f in dados['frases'] if f['movimento'] == m['id']])
        print('   %-14s %d frases' % (m['nome'], n))

    if problemas:
        print('\n%d entrada(s) por corrigir — nada foi gerado.' % len(problemas))
        return 1
    if so_conferir:
        return 0

    corpo = json.dumps(dados, ensure_ascii=False, separators=(',', ':'))
    with io.open(SAIDA, 'w', encoding='utf-8') as f:
        f.write('/* =========================================================\n')
        f.write('   Escola de oração — gerado por ferramentas/gerar-oracoes.py.\n\n')
        f.write('   Não edite aqui: mexa em ferramentas/oracoes-fonte.json e rode\n')
        f.write('   o gerador, que confere cada referência e cada trecho contra o\n')
        f.write('   texto bíblico do app antes de deixar passar.\n\n')
        f.write('   Aqui não há texto bíblico, só referência: o texto vem do\n')
        f.write('   próprio app na hora de mostrar.\n')
        f.write('   ========================================================= */\n')
        f.write('window.B = window.B || {};\nB.oracoesDados = ')
        f.write(corpo)
        f.write(';\n')
    print('\n%s: %.0f KB' % (os.path.basename(SAIDA), os.path.getsize(SAIDA) / 1024))
    return 0


if __name__ == '__main__':
    sys.exit(main('--so-conferir' in sys.argv))
