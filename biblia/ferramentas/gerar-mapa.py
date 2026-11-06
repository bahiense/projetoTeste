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


def cortar_lado(pontos, dentro, corta):
    """Um lado do retângulo, no algoritmo de Sutherland-Hodgman."""
    saida = []
    if not pontos:
        return saida
    anterior = pontos[-1]
    for atual in pontos:
        if dentro(atual):
            if not dentro(anterior):
                saida.append(corta(anterior, atual))
            saida.append(atual)
        elif dentro(anterior):
            saida.append(corta(anterior, atual))
        anterior = atual
    return saida


def recortar_poligono(anel):
    """
    Recorta o anel na janela, mantendo-o fechado.

    O recorte de linha serve para costa e rio, que são traço; polígono
    precisa continuar polígono, senão o preenchimento da terra vaza pela
    borda e pinta o mapa inteiro.
    """
    o, l = JANELA['oeste'], JANELA['leste']
    su, n = JANELA['sul'], JANELA['norte']

    def px(a, b, x):
        t = (x - a[0]) / (b[0] - a[0]) if b[0] != a[0] else 0.0
        return (x, a[1] + t * (b[1] - a[1]))

    def py(a, b, y):
        t = (y - a[1]) / (b[1] - a[1]) if b[1] != a[1] else 0.0
        return (a[0] + t * (b[0] - a[0]), y)

    pontos = anel
    pontos = cortar_lado(pontos, lambda p: p[0] >= o, lambda a, b: px(a, b, o))
    pontos = cortar_lado(pontos, lambda p: p[0] <= l, lambda a, b: px(a, b, l))
    pontos = cortar_lado(pontos, lambda p: p[1] >= su, lambda a, b: py(a, b, su))
    pontos = cortar_lado(pontos, lambda p: p[1] <= n, lambda a, b: py(a, b, n))
    return pontos


def area(pontos):
    s = 0.0
    for i in range(len(pontos)):
        x1, y1 = pontos[i]
        x2, y2 = pontos[(i + 1) % len(pontos)]
        s += x1 * y2 - x2 * y1
    return abs(s) / 2


def poligonos(caminho, tol, minimo=0.0):
    """Anéis fechados, recortados na janela — para pintar, não para traçar."""
    with io.open(caminho, encoding='utf-8') as f:
        dados = json.load(f)
    saida = []
    for f2 in dados['features']:
        for anel in linhas_de(f2.get('geometry') or {}):
            pontos = recortar_poligono([(p[0], p[1]) for p in anel])
            if len(pontos) < 3:
                continue
            s = simplificar(pontos, tol)
            if len(s) < 3 or area(s) < minimo:
                continue
            saida.append([[round(x, 3), round(y, 3)] for x, y in s])
    return saida


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


def rotulos():
    """
    Os nomes que dizem onde a pessoa está.

    Não vêm do Natural Earth (lá estão em inglês e cheios de coisa que não
    interessa): são escritos aqui, em português, só os que servem para se
    situar num mapa bíblico. 'g' é o tamanho — 1 grande (mares e desertos),
    2 médio (rios e golfos).
    """
    return [
        {'n': 'Mar Mediterrâneo', 'x': 32.0, 'y': 34.2, 'g': 1, 'a': 'mar'},
        {'n': 'Mar Vermelho', 'x': 37.5, 'y': 23.0, 'g': 1, 'a': 'mar'},
        {'n': 'Mar Negro', 'x': 35.0, 'y': 43.0, 'g': 1, 'a': 'mar'},
        {'n': 'Mar Cáspio', 'x': 50.5, 'y': 40.5, 'g': 1, 'a': 'mar'},
        {'n': 'Golfo Pérsico', 'x': 50.5, 'y': 27.5, 'g': 2, 'a': 'mar'},
        {'n': 'Mar Morto', 'x': 35.5, 'y': 31.5, 'g': 2, 'a': 'mar'},
        {'n': 'Mar da Galileia', 'x': 35.6, 'y': 32.82, 'g': 2, 'a': 'mar'},
        {'n': 'Mar Egeu', 'x': 25.0, 'y': 38.0, 'g': 2, 'a': 'mar'},
        {'n': 'Mar Adriático', 'x': 16.5, 'y': 42.5, 'g': 2, 'a': 'mar'},
        {'n': 'Rio Nilo', 'x': 31.5, 'y': 26.5, 'g': 2, 'a': 'rio'},
        {'n': 'Rio Eufrates', 'x': 41.5, 'y': 34.5, 'g': 2, 'a': 'rio'},
        {'n': 'Rio Tigre', 'x': 43.5, 'y': 35.5, 'g': 2, 'a': 'rio'},
        {'n': 'Rio Jordão', 'x': 35.58, 'y': 32.35, 'g': 2, 'a': 'rio'},
        {'n': 'Deserto do Saara', 'x': 15.0, 'y': 25.0, 'g': 1, 'a': 'terra'},
        {'n': 'Deserto da Arábia', 'x': 44.0, 'y': 23.0, 'g': 1, 'a': 'terra'},
        {'n': 'Deserto do Sinai', 'x': 33.8, 'y': 29.5, 'g': 2, 'a': 'terra'},
        {'n': 'Deserto da Síria', 'x': 39.0, 'y': 32.5, 'g': 2, 'a': 'terra'},
        {'n': 'Mesopotâmia', 'x': 43.0, 'y': 33.5, 'g': 1, 'a': 'terra'},
        {'n': 'Ásia Menor', 'x': 33.0, 'y': 39.0, 'g': 1, 'a': 'terra'},
        {'n': 'Egito', 'x': 29.5, 'y': 27.0, 'g': 1, 'a': 'terra'},
        {'n': 'Arábia', 'x': 45.0, 'y': 19.0, 'g': 1, 'a': 'terra'},
        {'n': 'Grécia', 'x': 22.0, 'y': 39.5, 'g': 2, 'a': 'terra'},
        {'n': 'Itália', 'x': 13.0, 'y': 42.0, 'g': 2, 'a': 'terra'},
        {'n': 'Pérsia', 'x': 52.0, 'y': 32.0, 'g': 1, 'a': 'terra'},
        {'n': 'Chipre', 'x': 33.0, 'y': 35.1, 'g': 2, 'a': 'terra'},
        {'n': 'Creta', 'x': 24.8, 'y': 35.2, 'g': 2, 'a': 'terra'},
        {'n': 'Etiópia', 'x': 39.0, 'y': 10.0, 'g': 2, 'a': 'terra'}
    ]


def main(raiz):
    g = os.path.join(raiz, 'geojson')
    sys.setrecursionlimit(100000)
    base = {
        'fonte': 'Natural Earth 1:50m (domínio público)',
        'janela': JANELA,
        # terra é preenchimento: sem ela não dá para saber o que é mar
        'terra': poligonos(os.path.join(g, 'ne_50m_land.geojson'), TOLERANCIA, minimo=0.02),
        'costa': camada(os.path.join(g, 'ne_50m_coastline.geojson'), TOLERANCIA),
        'lagos': poligonos(os.path.join(g, 'ne_50m_lakes.geojson'), TOLERANCIA, minimo=0.01),
        'rios': camada(os.path.join(g, 'ne_50m_rivers_lake_centerlines.geojson'),
                       TOLERANCIA, minimo=0.6),
        # fronteiras de hoje, bem fracas: servem só para a pessoa se situar
        'paises': camada(os.path.join(g, 'ne_50m_admin_0_boundary_lines_land.geojson'),
                         TOLERANCIA * 2, minimo=0.5),
        'rotulos': rotulos()
    }
    with io.open(SAIDA, 'w', encoding='utf-8') as f:
        json.dump(base, f, separators=(',', ':'))
    pontos = sum(len(l) for k in ('terra', 'costa', 'lagos', 'rios', 'paises')
                 for l in base[k])
    print('terra: %d · costa: %d · lagos: %d · rios: %d · fronteiras: %d · '
          '%d pontos · %.0f KB'
          % (len(base['terra']), len(base['costa']), len(base['lagos']),
             len(base['rios']), len(base['paises']), pontos,
             os.path.getsize(SAIDA) / 1024))


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1])
