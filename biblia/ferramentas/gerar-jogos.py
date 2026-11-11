#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Os jogos de memorização, conferidos contra o texto bíblico do próprio app.

A lista de assuntos é escrita à mão (ferramentas/jogos-fonte.json), porque
não existe fonte livre pronta com "o que um cristão precisa ter de cor".
Escrita à mão é escrita de memória, e memória erra — então cada item traz
a referência e um trecho que TEM de aparecer naqueles versículos. Quem
confere é este programa, contra as duas edições da Almeida embutidas no
app. Item que não casa não entra: sai no relatório para ser corrigido.

Uso:
    python3 biblia/ferramentas/gerar-jogos.py           # confere e gera
    python3 biblia/ferramentas/gerar-jogos.py --so-conferir
"""
import io
import json
import os
import re
import sys
import unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
FONTE = os.path.join(AQUI, 'jogos-fonte.json')
SAIDA = os.path.join(AQUI, '..', 'data', 'jogos.js')
TEXTO = os.path.join(AQUI, '..', 'data', 'texto')
BIBLIA = os.path.join(AQUI, '..', 'data', 'biblia.js')


def livros():
    """
    {usfm: arquivo} a partir do próprio data/biblia.js.

    A lista de códigos lá está na ordem canônica, e o arquivo do texto é a
    posição dela — é assim que o app resolve, e repetir a conta aqui evita
    uma segunda lista para sair de sincronia com a primeira.
    """
    js = io.open(BIBLIA, encoding='utf-8').read()
    m = re.search(r"var USFM = \(([\s\S]*?)\)\.split", js)
    if not m:
        raise SystemExit('não achei a lista USFM em data/biblia.js')
    codigos = ' '.join(re.findall(r"'([^']*)'", m.group(1))).split()
    return dict((c, '%02d' % (i + 1)) for i, c in enumerate(codigos))


def simples(t):
    """Sem acento, sem maiúscula e com as grafias velhas achatadas."""
    t = unicodedata.normalize('NFD', t.lower())
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    t = t.replace('ph', 'f').replace('th', 't').replace('y', 'i')
    t = t.replace('ch', 'c').replace('ss', 's').replace('z', 's')
    t = re.sub(r'[^a-z0-9 ]', ' ', t)
    return re.sub(r'\s+', ' ', t).strip()


class Biblia(object):
    def __init__(self):
        self.mapa = livros()
        self.cache = {}

    def versiculos(self, usfm, cap):
        """Os versículos do capítulo, nas duas edições, já achatados."""
        chave = (usfm, cap)
        if chave in self.cache:
            return self.cache[chave]
        arq = self.mapa[usfm]
        juntos = []
        for edicao in ('1911', 'jfaal'):
            caminho = os.path.join(TEXTO, edicao, arq + '.json')
            if not os.path.exists(caminho):
                continue
            with io.open(caminho, encoding='utf-8') as f:
                d = json.load(f)
            caps = d.get('caps') or []
            if cap <= len(caps):
                juntos.append(caps[cap - 1])
        self.cache[chave] = juntos
        return juntos

    def trecho(self, ref):
        """'GEN 1.3-5' -> o texto desses versículos, achatado."""
        m = re.match(r'^(\S+) (\d+)(?:\.(\d+)(?:-(\d+))?)?$', ref.strip())
        if not m:
            return None
        usfm, cap = m.group(1), int(m.group(2))
        if usfm not in self.mapa:
            return None
        edicoes = self.versiculos(usfm, cap)
        if not edicoes:
            return None
        de = int(m.group(3)) if m.group(3) else 1
        ate = int(m.group(4)) if m.group(4) else (de if m.group(3) else 999)
        juntos = []
        for vv in edicoes:
            juntos.append(' '.join(vv[de - 1:ate]))
        return simples(' '.join(juntos))


def conferir(bib, baralhos):
    """Devolve a lista de problemas — item que não casa com o seu versículo."""
    problemas = []
    for b in baralhos:
        codigos = [it.get('livro') for it in b['itens'] if it.get('livro')]
        if codigos and b['jogo'] == 'ordem':
            # A ordem pedida ao jogador tem de ser a ordem da Bíblia do app.
            postos = [bib.mapa.get(c) for c in codigos]
            if None not in postos and postos != sorted(postos):
                problemas.append((b['id'], -1, 'fora da ordem canônica', ''))
        for i, item in enumerate(b['itens']):
            ref = item.get('ref')
            conf = item.get('conf')
            codigo = item.get('livro')
            if codigo:
                # Baralho de ordem canônica: o que se confere é o próprio
                # lugar do livro na Bíblia do app, não uma palavra do texto.
                if codigo not in bib.mapa:
                    problemas.append((b['id'], i, 'livro desconhecido', codigo))
                    continue
                continue
            if not ref:
                problemas.append((b['id'], i, 'sem referência', ''))
                continue
            texto = bib.trecho(ref)
            if texto is None:
                problemas.append((b['id'], i, 'referência inválida', ref))
                continue
            if conf is None:
                continue                      # item sem palavra a conferir
            for palavra in (conf if isinstance(conf, list) else [conf]):
                if simples(palavra) not in texto:
                    problemas.append((b['id'], i, 'não achei "%s" em' % palavra, ref))
    return problemas


def main(so_conferir=False):
    with io.open(FONTE, encoding='utf-8') as f:
        dados = json.load(f)
    baralhos = dados['baralhos']
    bib = Biblia()

    problemas = conferir(bib, baralhos)
    for p in problemas:
        print('  ✗ %-24s item %-3d %s %s' % p)

    temas = {}
    for b in baralhos:
        temas.setdefault(b['tema'], 0)
        temas[b['tema']] += 1
    print('%d jogos, %d itens, %d temas'
          % (len(baralhos), sum(len(b['itens']) for b in baralhos), len(temas)))
    for t in temas:
        print('   %-22s %d' % (t, temas[t]))

    if problemas:
        print('\n%d item(ns) por corrigir — nada foi gerado.' % len(problemas))
        return 1
    if so_conferir:
        return 0

    corpo = json.dumps({'baralhos': baralhos}, ensure_ascii=False, separators=(',', ':'))
    with io.open(SAIDA, 'w', encoding='utf-8') as f:
        f.write('/* =========================================================\n')
        f.write('   Jogos de memorização — gerado por ferramentas/gerar-jogos.py.\n\n')
        f.write('   Não edite aqui: mexa em ferramentas/jogos-fonte.json e rode o\n')
        f.write('   gerador, que confere cada item contra o texto bíblico do app\n')
        f.write('   antes de deixar passar.\n')
        f.write('   ========================================================= */\n')
        f.write('window.B = window.B || {};\nB.jogosDados = ')
        f.write(corpo)
        f.write(';\n')
    print('\n%s: %.0f KB' % (os.path.basename(SAIDA), os.path.getsize(SAIDA) / 1024))
    return 0


if __name__ == '__main__':
    sys.exit(main('--so-conferir' in sys.argv))
