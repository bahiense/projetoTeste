#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O índice de busca das orações dos estudos.

A oração de cada capítulo mora no fim do estudo completo, e os estudos
somam 24 MB. Procurar "perdão" varrendo tudo no celular seria abrir os
66 arquivos e ler 24 MB para mostrar dez linhas — caro demais para um
campo de busca.

Então o índice é feito aqui: que palavra aparece em que oração, mais um
trecho curto de cada uma para a lista de resultados. O texto inteiro
continua saindo do estudo, na hora de abrir — aqui não se guarda cópia
da oração, só o começo dela.

Os "assuntos" são rótulos nossos (perdão, medo, gratidão...), mas cada
um só entra se as palavras dele aparecerem mesmo nas orações: a conta
ao lado do rótulo é contagem de verdade, não promessa.

Uso: python3 biblia/ferramentas/gerar-oracoes-indice.py
"""
import io
import json
import os
import re
import unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDOS = os.path.join(AQUI, '..', 'data', 'estudos')
SAIDA = os.path.join(AQUI, '..', 'data', 'oracoes-indice.json')

# A mesma regra do app (js/oracoes.js): sem a bandeira /m, senão o "$"
# casaria no fim de qualquer linha e a oração sairia vazia.
SECAO = re.compile(r'(?:^|\n)#{2,4}[ \t]*Ora[çc][ãa]o[^\n]*\n([\s\S]*?)(?=\n#{2,4}[ \t]|$)')

# Palavras que aparecem em quase toda oração não ajudam a achar nada.
PAROU = set('''
para pela pelo pelos pelas como mais mas nos nas dos das este esta estes estas
isso isto aquele aquela aquilo quando onde porque porquê que qual quais sobre
seja sejam somos sou está estão estamos temos tenho tens teus tuas minha minhas
meus nossa nossas nosso nossos vossa vossos senhor senhora deus jesus cristo
espírito santo amém amen oração orar oramos rogamos pedimos agradecemos
também ainda assim aqui hoje agora então pois entre contra desde até sem com
sua suas seu seus ele ela eles elas nós vós tudo todo toda todos todas nada
ser sermos fazer faça faz dar dá dia dias vida nome pai filho senhores
'''.split())


def achatar(t):
    t = unicodedata.normalize('NFD', t.lower())
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9 ]', ' ', t)


def termos(texto):
    """As palavras que valem busca, já achatadas e sem plural simples."""
    fora = set()
    for p in achatar(texto).split():
        if len(p) < 4 or p in PAROU:
            continue
        if len(p) > 4 and p.endswith('s') and not p.endswith('ss'):
            p = p[:-1]
        fora.add(p)
    return fora


def extrair(texto):
    m = SECAO.search(texto or '')
    if not m:
        return None
    corpo = re.sub(r'^\s*>\s?', '', m.group(1), flags=re.M)
    corpo = corpo.replace('**', '').replace('*', '').strip()
    return corpo if len(corpo) > 40 else None


# Os rótulos: cada um é um punhado de raízes de palavra. Rótulo que não
# achar oração nenhuma fica de fora da tela, em vez de prometer vazio.
ASSUNTOS = [
    ('perdao', 'Perdão', ['perdo', 'perdoa', 'misericordi', 'culpa', 'pecad']),
    ('gratidao', 'Gratidão', ['gratid', 'grato', 'gracas', 'louvor', 'bendit']),
    ('medo', 'Medo e aflição', ['medo', 'temor', 'angusti', 'afli', 'ansied', 'desesper']),
    ('familia', 'Família', ['famili', 'filho', 'esposa', 'marido', 'casa', 'pais']),
    ('trabalho', 'Trabalho', ['trabalh', 'obra', 'lavor', 'servi']),
    ('doenca', 'Doença', ['doen', 'enferm', 'cura', 'saude', 'sofriment']),
    ('luto', 'Luto e morte', ['luto', 'mort', 'perda', 'chor', 'sepult']),
    ('fe', 'Fé e dúvida', ['duvid', 'incredul', 'confian']),
    ('obediencia', 'Obediência', ['obedec', 'obedien', 'mandament', 'vontade']),
    ('sabedoria', 'Sabedoria', ['sabedori', 'discernim', 'entendim', 'prudenci']),
    ('humildade', 'Humildade', ['humild', 'orgulh', 'soberb', 'vaidad']),
    ('esperanca', 'Esperança', ['esperan', 'promessa', 'futur', 'aguard']),
    ('justica', 'Justiça', ['justic', 'injusti', 'opri', 'pobre', 'orfao', 'viuva']),
    ('missao', 'Missão e evangelho', ['evangelh', 'anunci', 'nacoes', 'testemunh', 'prega']),
    ('igreja', 'Igreja', ['igrej', 'irmao', 'comunh', 'unidad', 'corpo']),
    ('arrependimento', 'Arrependimento', ['arrepend', 'convers', 'volta', 'desvi']),
    ('provacao', 'Provação', ['prova', 'tenta', 'deserto', 'esperar', 'paciencia']),
    ('guerra', 'Lutas e inimigos', ['inimig', 'batalh', 'guerr', 'persegui']),
]


def main():
    refs, trechos, palavras = [], [], {}
    arquivos = sorted(f for f in os.listdir(ESTUDOS) if f.endswith('.json')
                      and f != 'indice.json')
    for arq in arquivos:
        with io.open(os.path.join(ESTUDOS, arq), encoding='utf-8') as f:
            livro = json.load(f)
        for chave in livro:
            if ' · ' in chave and not chave.endswith(' · completo'):
                continue
            estudo = livro[chave] or {}
            oracao = extrair(estudo.get('texto') or '')
            if not oracao:
                continue
            ref = (estudo.get('titulo') or chave.split(' · ')[0]).strip()
            i = len(refs)
            refs.append(ref)
            trechos.append(re.sub(r'\s+', ' ', oracao)[:110])
            for t in termos(oracao):
                palavras.setdefault(t, []).append(i)

    # Palavra que está em quase toda oração não separa nada: sai.
    teto = max(3, int(len(refs) * 0.55))
    palavras = dict((t, v) for t, v in palavras.items() if len(v) <= teto)

    assuntos = []
    for aid, nome, raizes in ASSUNTOS:
        quais = set()
        for t, v in palavras.items():
            if any(t.startswith(r) for r in raizes):
                quais.update(v)
        if quais:
            assuntos.append({'id': aid, 'nome': nome, 'n': len(quais),
                             'raizes': raizes})
    assuntos.sort(key=lambda a: -a['n'])

    dados = {'refs': refs, 'trechos': trechos, 'palavras': palavras,
             'assuntos': assuntos}
    with io.open(SAIDA, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, separators=(',', ':'))

    print('%d orações indexadas, %d palavras, %d assuntos · %.0f KB'
          % (len(refs), len(palavras), len(assuntos),
             os.path.getsize(SAIDA) / 1024))
    for a in assuntos[:6]:
        print('   %-22s %d orações' % (a['nome'], a['n']))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
