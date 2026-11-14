# -*- coding: utf-8 -*-
"""Referências cruzadas: de onde vêm e como entram no app.

   A fonte é o conjunto do openbible.info (CC BY), que é a lista de
   ligações entre versículos votada por leitores ao longo de anos — a
   mesma que o projeto scrollmapper/bible_databases distribui. São 344
   mil linhas no formato:

       Gen.1.1 <TAB> Prov.8.22-Prov.8.30 <TAB> 59

   O app não aceita isso de olhos fechados. Toda referência é conferida
   contra o texto bíblico que ele mesmo tem: capítulo que não existe, ou
   versículo além do fim do capítulo, é descartado — numeração de
   edições difere em alguns pontos (títulos dos Salmos, fim de Romanos,
   3 João), e referência que aponta para o vazio seria pior que nenhuma.

   Fica uma lista por livro, em data/referencias/NN.json, carregada sob
   demanda como o texto.

   Uso:
     curl -sL -o /tmp/xref.txt https://raw.githubusercontent.com/scrollmapper/bible_databases/master/sources/extras/cross_references.txt
     python3 -I ferramentas/gerar-referencias.py /tmp/xref.txt [--so-conferir]
"""
import io
import json
import os
import re
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
TEXTO = os.path.join(RAIZ, 'data', 'texto')
SAIDA = os.path.join(RAIZ, 'data', 'referencias')
BIBLIA = os.path.join(RAIZ, 'data', 'biblia.js')

QUANTAS = 12          # no máximo, por versículo — as mais votadas
VOTO_MINIMO = 1       # o conjunto tem ligações com voto negativo: ficam de fora

ABREVIATURAS = (
    'Gen GEN|Exod EXO|Lev LEV|Num NUM|Deut DEU|Josh JOS|Judg JDG|Ruth RUT|'
    '1Sam 1SA|2Sam 2SA|1Kgs 1KI|2Kgs 2KI|1Chr 1CH|2Chr 2CH|Ezra EZR|Neh NEH|'
    'Esth EST|Job JOB|Ps PSA|Prov PRO|Eccl ECC|Song SNG|Isa ISA|Jer JER|'
    'Lam LAM|Ezek EZK|Dan DAN|Hos HOS|Joel JOL|Amos AMO|Obad OBA|Jonah JON|'
    'Mic MIC|Nah NAM|Hab HAB|Zeph ZEP|Hag HAG|Zech ZEC|Mal MAL|Matt MAT|'
    'Mark MRK|Luke LUK|John JHN|Acts ACT|Rom ROM|1Cor 1CO|2Cor 2CO|Gal GAL|'
    'Eph EPH|Phil PHP|Col COL|1Thess 1TH|2Thess 2TH|1Tim 1TI|2Tim 2TI|'
    'Titus TIT|Phlm PHM|Heb HEB|Jas JAS|1Pet 1PE|2Pet 2PE|1John 1JN|'
    '2John 2JN|3John 3JN|Jude JUD|Rev REV'
)


def mapa_abreviaturas():
    m = {}
    for par in ABREVIATURAS.split('|'):
        de, para = par.split()
        m[de] = para
    return m


def ordem_dos_livros():
    """{usfm: arquivo} a partir do próprio data/biblia.js."""
    js = io.open(BIBLIA, encoding='utf-8').read()
    m = re.search(r"var USFM = \(([\s\S]*?)\)\.split", js)
    codigos = ' '.join(re.findall(r"'([^']*)'", m.group(1))).split()
    return dict((c, '%02d' % (i + 1)) for i, c in enumerate(codigos))


def tamanhos(arquivos):
    """{usfm: [versículos do cap1, do cap2, ...]} — o maior das duas edições.

    O maior, e não o de uma só: as duas numeram igual quase sempre, e
    onde diferem vale a mais generosa, porque o app mostra a que o leitor
    escolheu."""
    fora = {}
    for usfm, arq in arquivos.items():
        maior = []
        for edicao in ('1911', 'jfaal'):
            caminho = os.path.join(TEXTO, edicao, arq + '.json')
            if not os.path.exists(caminho):
                continue
            with io.open(caminho, encoding='utf-8') as f:
                caps = json.load(f).get('caps') or []
            for i, vv in enumerate(caps):
                if i >= len(maior):
                    maior.append(len(vv))
                else:
                    maior[i] = max(maior[i], len(vv))
        fora[usfm] = maior
    return fora


def ler_ref(bruto, abrev):
    """'Prov.8.22' -> ('PRO', 8, 22). Devolve None se não der para ler."""
    p = bruto.split('.')
    if len(p) != 3 or p[0] not in abrev:
        return None
    try:
        return (abrev[p[0]], int(p[1]), int(p[2]))
    except ValueError:
        return None


def existe(ref, caps):
    usfm, cap, v = ref
    lista = caps.get(usfm) or []
    return 1 <= cap <= len(lista) and 1 <= v <= lista[cap - 1]


def main(entrada, so_conferir=False):
    abrev = mapa_abreviaturas()
    arquivos = ordem_dos_livros()
    caps = tamanhos(arquivos)

    por_livro = {}
    lidas = guardadas = fora_do_texto = ilegiveis = poucos_votos = 0

    with io.open(entrada, encoding='utf-8') as f:
        for linha in f:
            if linha.startswith('From Verse'):
                continue
            partes = linha.rstrip('\n').split('\t')
            if len(partes) < 3:
                continue
            lidas += 1
            try:
                votos = int(partes[2])
            except ValueError:
                continue
            if votos < VOTO_MINIMO:
                poucos_votos += 1
                continue

            de = ler_ref(partes[0], abrev)
            alvo = partes[1].split('-')
            ini = ler_ref(alvo[0], abrev)
            fim = ler_ref(alvo[1], abrev) if len(alvo) > 1 else ini
            if not de or not ini or not fim:
                ilegiveis += 1
                continue
            # Faixa que atravessa livro ou capítulo não vira cartão: o app
            # mostra "Pv 8.22-30", e "Pv 8.22—Ec 1.2" não é uma coisa só.
            if ini[0] != fim[0] or ini[1] != fim[1]:
                fim = ini
            if not existe(de, caps) or not existe(ini, caps) or not existe(fim, caps):
                fora_do_texto += 1
                continue

            texto = '%s %d.%d' % ini
            if fim[2] > ini[2]:
                texto += '-%d' % fim[2]

            livro = por_livro.setdefault(de[0], {})
            cap = livro.setdefault(str(de[1]), {})
            cap.setdefault(str(de[2]), []).append([texto, votos])
            guardadas += 1

    # As mais votadas primeiro, e só as primeiras: doze bastam para uma
    # tela de celular, e o resto é cauda.
    cortadas = 0
    for livro in por_livro.values():
        for cap in livro.values():
            for v, lista in cap.items():
                lista.sort(key=lambda x: -x[1])
                if len(lista) > QUANTAS:
                    cortadas += len(lista) - QUANTAS
                    del lista[QUANTAS:]
                cap[v] = [x[0] for x in lista]     # o voto já cumpriu o papel

    versiculos = sum(len(c) for l in por_livro.values() for c in l.values())
    print('%d linhas lidas' % lidas)
    print('  %d guardadas, em %d versículos de %d livros' %
          (guardadas, versiculos, len(por_livro)))
    print('  %d com voto abaixo de %d' % (poucos_votos, VOTO_MINIMO))
    print('  %d ilegíveis, %d apontando para fora do texto do app' %
          (ilegiveis, fora_do_texto))
    print('  %d cortadas por passarem de %d no mesmo versículo' % (cortadas, QUANTAS))

    if len(por_livro) < 66:
        print('\n✗ faltou livro: só %d dos 66 — nada foi gerado.' % len(por_livro))
        return 1
    if so_conferir:
        return 0

    if not os.path.isdir(SAIDA):
        os.makedirs(SAIDA)
    total = 0
    for usfm, livro in por_livro.items():
        caminho = os.path.join(SAIDA, arquivos[usfm] + '.json')
        with io.open(caminho, 'w', encoding='utf-8') as f:
            f.write(json.dumps({'livro': usfm, 'refs': livro},
                               ensure_ascii=False, separators=(',', ':')))
        total += os.path.getsize(caminho)
    print('\n%d arquivos em data/referencias (%d KB)' % (len(por_livro), total // 1024))
    return 0


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args:
        print(__doc__)
        sys.exit(2)
    sys.exit(main(args[0], '--so-conferir' in sys.argv))
