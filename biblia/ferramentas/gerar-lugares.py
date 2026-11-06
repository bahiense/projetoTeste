#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Os lugares de cada capítulo, com coordenada, para o mapa do app.

Fonte: STEPBible-Data (Tyndale House Cambridge, CC BY 4.0).

- TIPNR traz cada lugar da Bíblia com nome, coordenada (dentro da URL do
  Google Maps) e uma linha de descrição.
- O texto etiquetado (TAHOT, hebraico, e TAGNT, grego) traz, em cada
  palavra, o nome único do lugar depois de "»". É daí que sai em quais
  capítulos cada lugar aparece — exato, versículo a versículo, em vez de
  depender das listas resumidas ("Jos.10.1ff") do próprio TIPNR.

Uso:
    git clone --depth 1 https://github.com/STEPBible/STEPBible-Data.git /tmp/step
    python3 biblia/ferramentas/gerar-lugares.py /tmp/step
"""
import io
import json
import os
import re
import sys
import glob

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, '..', 'data', 'lugares.json')
PT = os.path.join(AQUI, 'lugares-pt.json')     # nomes em português, conferidos à mão

LIVROS = ['Gen', 'Exo', 'Lev', 'Num', 'Deu', 'Jos', 'Jdg', 'Rut', '1Sa', '2Sa', '1Ki',
          '2Ki', '1Ch', '2Ch', 'Ezr', 'Neh', 'Est', 'Job', 'Psa', 'Pro', 'Ecc', 'Sng',
          'Isa', 'Jer', 'Lam', 'Ezk', 'Dan', 'Hos', 'Jol', 'Amo', 'Oba', 'Jon', 'Mic',
          'Nam', 'Hab', 'Zep', 'Hag', 'Zec', 'Mal', 'Mat', 'Mrk', 'Luk', 'Jhn', 'Act',
          'Rom', '1Co', '2Co', 'Gal', 'Eph', 'Php', 'Col', '1Th', '2Th', '1Ti', '2Ti',
          'Tit', 'Phm', 'Heb', 'Jas', '1Pe', '2Pe', '1Jn', '2Jn', '3Jn', 'Jud', 'Rev']
USFM = {l: l.upper() for l in LIVROS}


def ler_tipnr(raiz):
    """{nomeÚnico: {nome, lat, lon, descrição}} — só PLACE com coordenada."""
    caminho = glob.glob(os.path.join(raiz, 'Proper Nouns', 'TIPNR*.txt'))[0]
    txt = io.open(caminho, encoding='utf-8-sig', errors='replace').read()
    lugares = {}
    for bloco in txt.split('$========== PLACE')[1:]:
        linhas = bloco.split('\n')
        # a primeira linha do bloco é o resto do cabeçalho; o registro vem depois
        cab = None
        for l in linhas:
            campos = l.strip('\r').split('\t')
            if campos and '@' in campos[0] and '=' in campos[0]:
                cab = campos
                break
        if not cab:
            continue
        unico = cab[0].split('=')[0].strip()        # Abana@2Ki.5.12
        nome = unico.split('@')[0].replace('_', ' ').strip()
        coord = re.search(r'maps/@(-?\d+\.\d+),(-?\d+\.\d+)', bloco)
        if not coord:
            continue                                 # lugar sem localização conhecida
        breve = ''
        for l in linhas:
            if l.startswith('@Brief='):
                breve = l[len('@Brief='):].strip().strip('\r')
                break
        strongs = []
        for l in linhas:
            if l.startswith('– Total'):
                campos = l.strip('\r').split('\t')
                if len(campos) > 3:
                    strongs = [x.strip() for x in campos[3].split(',') if x.strip()]
                break
        lugares[unico] = {
            'nome': nome,
            'lat': round(float(coord.group(1)), 4),
            'lon': round(float(coord.group(2)), 4),
            'breve': breve,
            'strongs': strongs
        }
    return lugares


def limpo(t):
    t = re.sub(r'[^a-z ]', ' ', t.lower())
    t = ' '.join(p for p in t.split() if p not in ('of', 'the', 'to', 'in', 'at', 'a'))
    return t.strip()


def casa(traducao, nome):
    """A palavra traduzida é mesmo este lugar?"""
    a, b = limpo(traducao), limpo(nome)
    if not a or not b:
        return False
    return a == b or a in b or b in a


def ler_etiquetado(raiz, lugares):
    """
    {nomeÚnico do TIPNR: {'USFM cap', ...}} — onde cada lugar aparece.

    O nome único que o texto etiquetado usa nem sempre é o mesmo do TIPNR:
    os dois ancoram no "primeiro lugar onde ocorre", e essa escolha às
    vezes difere (o texto diz Jerusalem@Jos.10.1-Rev onde o TIPNR diz
    Jerusalem@Gen.14.18-Rev). Então: casa exato; não casando, casa pelo
    nome quando só existe um lugar com aquele nome; sendo mais de um
    (Debir, Bethel, Ophrah…), deixa de fora — pino no lugar errado é pior
    do que pino nenhum.
    """
    porNome = {}
    for u in lugares:
        porNome.setdefault(u.split('@')[0], []).append(u)

    onde = {}
    ambiguos = set()
    # Só o hebraico: no grego o "»" liga palavras, não nomeia lugares.
    arqs = glob.glob(os.path.join(raiz, 'Translators Amalgamated OT+NT', 'TAHOT*.txt'))
    ref_re = re.compile(r'^(\d?[A-Za-z]{2,3})\.(\d+)\.(\d+)')
    nome_re = re.compile(r'»([^}=»]+?)[}=]')
    for arq in sorted(arqs):
        with io.open(arq, encoding='utf-8-sig', errors='replace') as f:
            for linha in f:
                m = ref_re.match(linha)
                if not m or m.group(1) not in USFM or '»' not in linha:
                    continue
                cap = USFM[m.group(1)] + ' ' + m.group(2)
                for u in nome_re.findall(linha):
                    u = u.strip()
                    if u not in lugares:
                        candidatos = porNome.get(u.split('@')[0], [])
                        if len(candidatos) != 1:
                            if candidatos:
                                ambiguos.add(u)
                            continue
                        u = candidatos[0]
                    onde.setdefault(u, set()).add(cap)
    if ambiguos:
        print('deixados de fora por ambiguidade (mesmo nome, lugares diferentes): %d'
              % len(ambiguos))

    """
    O grego não traz o nome único.

    O hebraico etiquetado marca cada palavra com »Nome@Ref; o grego, não —
    lá o "»" liga palavras entre si. Então no Novo Testamento a ligação é
    pelo número de Strong do nome próprio, que o TIPNR lista para cada
    lugar. Dá no mesmo, e é exato: nome próprio não divide Strong com
    outra coisa.
    """
    porStrong = {}
    for u, l in lugares.items():
        for g in l.get('strongs', []):
            if g.startswith('G'):
                base = re.match(r'G\d+', g)
                if base:
                    porStrong.setdefault(base.group(0), set()).add(u)

    for arq in sorted(glob.glob(os.path.join(raiz, 'Translators Amalgamated OT+NT',
                                             'TAGNT*.txt'))):
        with io.open(arq, encoding='utf-8-sig', errors='replace') as f:
            for linha in f:
                m = ref_re.match(linha)
                if not m or m.group(1) not in USFM:
                    continue
                campos = linha.split('\t')
                if len(campos) < 4:
                    continue
                tag = campos[3].strip()
                g = re.match(r'(G\d+)=\S*?N-[A-Z]+-L', tag)
                if not g:
                    # O sufixo -L da morfologia é o que diz "nome próprio de lugar".
                    # Sem ele, "Três Tavernas" (G5140) casaria com todo
                    # versículo que diz "três", e "Akeldama" com todo
                    # versículo que diz "sangue".
                    continue
                donos = porStrong.get(g.group(1))
                if not donos or len(donos) != 1:
                    continue        # Strong de dois lugares: não dá para escolher
                dono = list(donos)[0]
                # E a tradução da palavra tem de ser o nome do lugar. O TIPNR
                # às vezes empresta um Strong genérico a um lugar (G5117,
                # "lugar"; G3094, "Madalena"), e sem esta conferência Mateus
                # 27 ganhava um pino em Mispá por causa de "Lugar da Caveira".
                if not casa(campos[2], lugares[dono]['nome']):
                    continue
                cap = USFM[m.group(1)] + ' ' + m.group(2)
                onde.setdefault(dono, set()).add(cap)

    return onde


def main(raiz):
    lugares = ler_tipnr(raiz)
    onde = ler_etiquetado(raiz, lugares)

    pt = {}
    if os.path.exists(PT):
        pt = json.load(io.open(PT, encoding='utf-8'))

    # Só entra lugar que aparece em algum capítulo: lugar sem capítulo não
    # tem como ser mostrado, e ficaria ocupando espaço à toa.
    chaves = sorted([u for u in lugares if onde.get(u)])
    lista = []
    indice = {}
    for i, u in enumerate(chaves):
        l = lugares[u]
        item = {'n': pt.get(l['nome'], l['nome']), 'y': l['lat'], 'x': l['lon']}
        # o nome da fonte fica junto só quando difere — "Ai (Ai)" é ruído
        if pt.get(l['nome']) and pt[l['nome']] != l['nome']:
            item['en'] = l['nome']
        if l['breve']:
            item['d'] = l['breve']
        lista.append(item)
        for cap in onde[u]:
            indice.setdefault(cap, []).append(i)

    for cap in indice:
        indice[cap].sort()

    dados = {
        'fonte': 'STEPBible-Data / Tyndale House Cambridge (CC BY 4.0)',
        'lugares': lista,
        'capitulos': indice
    }
    with io.open(SAIDA, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, separators=(',', ':'))

    tam = os.path.getsize(SAIDA) / 1024
    comPt = sum(1 for i in lista if 'en' in i)
    print('lugares com coordenada e capítulo: %d (%d com nome em português)'
          % (len(lista), comPt))
    print('capítulos com algum lugar: %d de 1189' % len(indice))
    print('%s: %.0f KB' % (os.path.basename(SAIDA), tam))
    sem = [i['n'] for i in sorted(lista, key=lambda x: -len(x.get('d', '')))][:0]
    maiores = sorted(indice.items(), key=lambda kv: -len(kv[1]))[:3]
    print('capítulos com mais lugares:', ', '.join('%s (%d)' % (k, len(v)) for k, v in maiores))


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1])
