"""Monta biblia/data/doutrina.js: as obras reformadas e o índice invertido.

Cada obra responde "esta doutrina se apoia nestes textos". O app faz a
pergunta ao contrário — "que doutrinas se apoiam neste capítulo?" — e
para isso o índice vem pronto, não calculado na abertura.
"""
import sys, json, os, re

S = os.path.dirname(os.path.abspath(__file__))
def carregar(nome):
    return json.load(open(os.path.join(S, nome), encoding='utf8'))

ROMANO = {}
for i, r in enumerate(['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII',
                       'XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI','XXII','XXIII','XXIV',
                       'XXV','XXVI','XXVII','XXVIII','XXIX','XXX','XXXI','XXXII','XXXIII'], 1):
    ROMANO[r] = i

ABREV_EN = carregar('abrev.json')
CAPS = carregar('caps.json')
# Livros de um capítulo só: "3Jo 12" é o versículo 12, não o capítulo 12.
UM_CAPITULO = {u for u, n in CAPS.items() if n == 1}
descartadas = []


def valida(u, c, origem):
    """Capítulo que não existe é referência que eu não entendi.

    Apontar para o capítulo errado é pior do que não apontar: na tela
    nada pareceria errado. Então é descartada, e contada."""
    if u in UM_CAPITULO:
        c = 1
    if c < 1 or c > CAPS.get(u, 0):
        descartadas.append((origem, u, c))
        return None
    return c
REF_EN = re.compile(r'^\s*((?:[1-3]\s*)?[A-Za-z][A-Za-z\s.]*?)\s*(\d+)(?:[.:](.*))?\s*$')

def refs_wcf(g, origem):
    fora = []
    for r in g:
        m = REF_EN.match(r)
        if not m:
            continue
        livro = re.sub(r'^([1-3])\s*', r'\1 ', m.group(1).replace('.', '').strip().lower())
        u = ABREV_EN.get(livro)
        if not u:
            continue
        c = valida(u, int(m.group(2)), origem)
        if c:
            fora.append({'u': u, 'c': c, 'v': (m.group(3) or '').strip()})
    return fora

obras = []

# ---- Confissão de Westminster: capítulos e seções ----
caps = carregar('wcf.json')
titulos = carregar('titulos-pt.json')
pt = carregar('secoes-pt.json')
itens = []
for c in caps:
    cn = ROMANO[c['n']]
    for s in sorted(c['secoes'], key=lambda x: ROMANO[x['n']]):
        sn = ROMANO[s['n']]
        refs = []
        for g in s['provas']:
            for r in refs_wcf(g['refs'], 'wcf %d.%d' % (cn, sn)):
                if r not in refs:
                    refs.append(r)
        itens.append({'m': '%d.%d' % (cn, sn), 't': titulos[c['n']],
                      'x': pt['%d.%d' % (cn, sn)], 'r': refs})
obras.append({
    'id': 'wcf', 'nome': 'Confissão de Fé de Westminster', 'curto': 'Confissão', 'ano': 1646,
    'credito': 'Confissão de Fé de Westminster (1646), com os textos-prova da edição '
               'original. Domínio público; tradução feita para este app.',
    'itens': itens})

# ---- os dois catecismos: pergunta e resposta ----
def catecismo(arquivo, ident, nome, curto, ano, credito, nota=''):
    fonte = carregar(arquivo)
    itens = []
    for q in sorted(fonte, key=lambda x: x['n']):
        rr = []
        for u, c in q['refs']:
            cc = valida(u, c, ident + ' ' + str(q['n']))
            if cc and {'u': u, 'c': cc, 'v': ''} not in rr:
                rr.append({'u': u, 'c': cc, 'v': ''})
        itens.append({'m': str(q['n']), 't': q['pergunta'], 'x': q['texto'], 'r': rr})
    o = {'id': ident, 'nome': nome, 'curto': curto, 'ano': ano, 'credito': credito,
         'itens': itens}
    if nota:
        o['nota'] = nota
    return o

obras.append(catecismo(
    'ref-in/breve.json', 'wsc', 'Breve Catecismo de Westminster', 'Breve Catecismo', 1647,
    'Breve Catecismo de Westminster (1647), com as referências bíblicas da edição em '
    'português. Domínio público.'))
obras.append(catecismo(
    'ref-in/maior.json', 'wlc', 'Catecismo Maior de Westminster', 'Catecismo Maior', 1648,
    'Catecismo Maior de Westminster (1648), com as referências bíblicas da edição em '
    'português. Domínio público.',
    'A edição usada não traz as perguntas 176, 177 e 192.'))

# ---- o índice invertido ----
indice = {}
for io_, o in enumerate(obras):
    for ii, it in enumerate(o['itens']):
        visto = set()
        for r in it['r']:
            k = r['u'] + ' ' + str(r['c'])
            if k in visto:
                continue
            visto.add(k)
            indice.setdefault(k, []).append([io_, ii])

cit = sum(len(it['r']) for o in obras for it in o['itens'])
js = '''/* =========================================================
   Teologia reformada ligada a cada capítulo da Bíblia.

   Cada obra aqui cita, em cada afirmação, os textos que a sustentam. O
   app faz a pergunta ao contrário: quem lê João 3 quer saber que
   doutrinas se apoiam ali. Por isso o índice vem pronto no arquivo — são
   %d citações, e a tela não pode esperar por elas.

   Nada disto saiu de memória: cada obra foi extraída de uma edição com
   os textos-prova, e o que o leitor não entendeu foi descartado em vez
   de ser adivinhado. Citação inventada num app de doutrina é o pior
   erro possível.

   O alcance é o que é: %d dos 1.189 capítulos. Capítulo sem tema é
   capítulo que nenhuma destas obras citou.
   ========================================================= */
window.B = window.B || {};

B.doutrina = (function () {
    'use strict';

    var OBRAS = %s;

    /* "ROM 8" -> [[obra, item], ...] */
    var PORCAPITULO = %s;

    function umTema(par) {
        var o = OBRAS[par[0]];
        var it = o && o.itens[par[1]];
        if (!it) return null;
        return { obra: o, item: it, marca: o.curto + ' ' + it.m };
    }

    /* Os temas que um capítulo sustenta, na ordem das obras. */
    function temas(usfm, cap) {
        return (PORCAPITULO[usfm + ' ' + cap] || []).map(umTema).filter(Boolean);
    }

    /* Onde mais este tema se apoia: é o que deixa pular de um capítulo
       bíblico para outro sem voltar ao índice. */
    function citados(par) {
        var t = umTema(par);
        if (!t) return [];
        var fora = [], visto = {};
        t.item.r.forEach(function (r) {
            var k = r.u + ' ' + r.c;
            if (visto[k]) return;
            visto[k] = 1;
            fora.push(r);
        });
        return fora;
    }

    function quantos() { return Object.keys(PORCAPITULO).length; }

    return {
        OBRAS: OBRAS, PORCAPITULO: PORCAPITULO,
        temas: temas, citados: citados, quantos: quantos
    };
})();
''' % (cit, len(indice),
       json.dumps(obras, ensure_ascii=False, separators=(',', ':')),
       json.dumps(indice, ensure_ascii=False, separators=(',', ':')))

open(sys.argv[1], 'w', encoding='utf8').write(js)
print('obras:', len(obras))
for o in obras:
    print('  %-28s %4d itens | %5d citações' % (o['nome'], len(o['itens']),
                                                sum(len(i['r']) for i in o['itens'])))
print('descartadas por capítulo inexistente:', len(descartadas), descartadas[:6])
print('capítulos indexados:', len(indice), '| citações:', cit,
      '| tamanho:', round(len(js) / 1024), 'KB')
