#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O mapa de fundo do mundo bíblico, em traços, para desenhar offline.

Fonte: Natural Earth (natural-earth-vector, domínio público) — costa,
lagos e rios a 1:50m. Aqui eles são recortados na janela do mundo
bíblico, simplificados e convertidos em caminhos SVG em coordenadas
geográficas (o app projeta na hora de desenhar).

Sem imagem de satélite e sem tiles: tile de servidor precisa de internet
e de atribuição por uso, e o app tem de abrir no avião. Traço vetorial
pesa quilobytes e aumenta sem borrar.

Uso:
    git clone --depth 1 --filter=blob:none https://github.com/nvkelso/natural-earth-vector.git /tmp/ne
    cd /tmp/ne && git checkout HEAD -- geojson/ne_50m_coastline.geojson \\
        geojson/ne_50m_lakes.geojson geojson/ne_50m_rivers_lake_centerlines.geojson
    python3 biblia/ferramentas/gerar-mapa.py /tmp/ne
"""
import io
import json
import math
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, '..', 'data', 'mapa-base.json')

# A janela: de Társis (Espanha) a Susã (Pérsia), de Sabá ao mar Negro.
# Vem dos próprios lugares do data/lugares.json, com uma folga.
JANELA = {'oeste': -8.0, 'leste': 50.0, 'sul': 8.0, 'norte': 43.0}
TOLERANCIA = 0.02        # graus — abaixo disso o traço não muda na tela


def dentro(x, y):
    return (JANELA['oeste'] <= x <= JANELA['leste'] and
            JANELA['sul'] <= y <= JANELA['norte'])


def recortar(linha):
    """Quebra a linha nos pedaços que caem dentro da janela."""
    pedacos, atual = [], []
    for x, y in linha:
        if dentro(x, y):
            atual.append((x, y))
        else:
            # um ponto fora, para o traço não morrer na borda
            if atual:
                atual.append((x, y))
                pedacos.append(atual)
                atual = []
    if atual:
        pedacos.append(atual)
    return [p for p in pedacos if len(p) > 1]


def simplificar(pontos, tol):
    """Douglas-Peucker, sem biblioteca: são quatro linhas de geometria."""
    if len(pontos) < 3:
        return pontos
    (x1, y1), (x2, y2) = pontos[0], pontos[-1]
    dx, dy = x2 - x1, y2 - y1
    norma = math.hypot(dx, dy)
    pior, idx = 0.0, 0
    for i in range(1, len(pontos) - 1):
        x, y = pontos[i]
        if norma == 0:
            d = math.hypot(x - x1, y - y1)
        else:
            d = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / norma
        if d > pior:
            pior, idx = d, i
    if pior <= tol:
        return [pontos[0], pontos[-1]]
    return simplificar(pontos[:idx + 1], tol)[:-1] + simplificar(pontos[idx:], tol)


def linhas_de(geom):
    t = geom['type']
    if t == 'LineString':
        return [geom['coordinates']]
    if t == 'MultiLineString':
        return geom['coordinates']
    if t == 'Polygon':
        return geom['coordinates']
    if t == 'MultiPolygon':
        return [anel for poly in geom['coordinates'] for anel in poly]
    return []


def camada(caminho, tol, minimo=0):
    with io.open(caminho, encoding='utf-8') as f:
        dados = json.load(f)
    saida = []
    for f2 in dados['features']:
        for linha in linhas_de(f2.get('geometry') or {}):
            for pedaco in recortar([(p[0], p[1]) for p in linha]):
                s = simplificar(pedaco, tol)
                if len(s) < 2:
                    continue
                if minimo and comprimento(s) < minimo:
                    continue
                saida.append([[round(x, 3), round(y, 3)] for x, y in s])
    return saida


def comprimento(pts):
    return sum(math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])
               for i in range(len(pts) - 1))


def main(raiz):
    g = os.path.join(raiz, 'geojson')
    sys.setrecursionlimit(100000)
    base = {
        'fonte': 'Natural Earth 1:50m (domínio público)',
        'janela': JANELA,
        'costa': camada(os.path.join(g, 'ne_50m_coastline.geojson'), TOLERANCIA),
        'lagos': camada(os.path.join(g, 'ne_50m_lakes.geojson'), TOLERANCIA, minimo=0.15),
        'rios': camada(os.path.join(g, 'ne_50m_rivers_lake_centerlines.geojson'),
                       TOLERANCIA, minimo=0.6)
    }
    with io.open(SAIDA, 'w', encoding='utf-8') as f:
        json.dump(base, f, separators=(',', ':'))
    pontos = sum(len(l) for k in ('costa', 'lagos', 'rios') for l in base[k])
    print('costa: %d traços · lagos: %d · rios: %d · %d pontos · %.0f KB'
          % (len(base['costa']), len(base['lagos']), len(base['rios']), pontos,
             os.path.getsize(SAIDA) / 1024))


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1])
