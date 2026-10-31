"""Monta biblia/data/westminster.js a partir da confissão extraída.

Guarda a confissão e, junto, o índice invertido: para cada capítulo da
Bíblia, quais seções da confissão se apoiam nele. O índice é o que a tela
do estudo consulta, e precisa ser instantâneo — por isso vem pronto, e não
calculado na abertura.
"""
import sys, json, re, os

S = os.path.dirname(os.path.abspath(__file__))
caps = json.load(open(os.path.join(S, 'wcf.json'), encoding='utf8'))
titulos = json.load(open(os.path.join(S, 'titulos-pt.json'), encoding='utf8'))
pt_path = os.path.join(S, 'secoes-pt.json')
pt = json.load(open(pt_path, encoding='utf8')) if os.path.exists(pt_path) else {}

ABREV = json.load(open(os.path.join(S, 'abrev.json'), encoding='utf8'))
REF = re.compile(r'^\s*((?:[1-3]\s*)?[A-Za-z][A-Za-z\s.]*?)\s*(\d+)(?:[.:](.*))?\s*$')
ROMANO = {'I':1,'II':2,'III':3,'IV':4,'V':5,'VI':6,'VII':7,'VIII':8,'IX':9,'X':10,
          'XI':11,'XII':12,'XIII':13,'XIV':14,'XV':15,'XVI':16,'XVII':17,'XVIII':18,
          'XIX':19,'XX':20,'XXI':21,'XXII':22,'XXIII':23,'XXIV':24,'XXV':25,'XXVI':26,
          'XXVII':27,'XXVIII':28,'XXIX':29,'XXX':30,'XXXI':31,'XXXII':32,'XXXIII':33}

def partir(r):
    m = REF.match(r)
    if not m: return None
    livro = re.sub(r'^([1-3])\s*', r'\1 ', m.group(1).replace('.', '').strip().lower())
    u = ABREV.get(livro)
    return (u, int(m.group(2)), (m.group(3) or '').strip()) if u else None

saida, indice, traduzidas, total = [], {}, 0, 0
for c in caps:
    cn = ROMANO[c['n']]
    secoes = []
    for s in c['secoes']:
        sn = ROMANO[s['n']]
        marca = '%d.%d' % (cn, sn)
        total += 1
        provas = []
        for g in s['provas']:
            refs = []
            for r in g['refs']:
                p = partir(r)
                if not p: continue
                refs.append({'u': p[0], 'c': p[1], 'v': p[2]})
                indice.setdefault(p[0] + ' ' + str(p[1]), [])
                if marca not in indice[p[0] + ' ' + str(p[1])]:
                    indice[p[0] + ' ' + str(p[1])].append(marca)
            if refs: provas.append({'l': g['letra'], 'r': refs})
        texto = pt.get(marca, '')
        if texto: traduzidas += 1
        secoes.append({'n': sn, 'texto': texto, 'provas': provas})
    # Na fonte, 19.7 vem antes de 19.6. Guardar na ordem do documento faria
    # a busca por posição devolver a seção errada — e a tela listaria fora
    # de ordem. A ordem é a do número, sempre.
    secoes.sort(key=lambda x: x['n'])
    saida.append({'n': cn, 'titulo': titulos[c['n']], 'secoes': secoes})

semProva = [ '%d.%d' % (ROMANO[c['n']], ROMANO[s['n']])
             for c in caps for s in c['secoes'] if not s['provas'] ]

js = '''/* =========================================================
   A Confissão de Westminster (1646) e o índice invertido dela.

   A confissão responde "esta doutrina se apoia nestes textos". Quem lê
   João 3 quer a pergunta ao contrário: "que doutrinas se apoiam aqui".
   Por isso o índice vem pronto no arquivo, e não calculado na abertura:
   são 1.807 citações, e a tela do estudo não pode esperar por elas.

   O texto de 1646 é domínio público. A tradução para o português é feita
   para este app — as traduções brasileiras em circulação têm dono, e o
   app diz de quem é a que ele mostra.

   Nem todo capítulo da Bíblia aparece aqui: só os %d que a confissão de
   fato cita. Capítulo sem tema é capítulo que ela não citou, e inventar
   ligação seria pior do que não ter nenhuma.
   ========================================================= */
window.B = window.B || {};

B.wcf = (function () {
    'use strict';

    var FONTE = {
        nome: 'Confissão de Fé de Westminster',
        ano: 1646,
        credito: 'Confissão de Fé de Westminster (1646), com os textos-prova da ' +
            'edição original. Texto em domínio público; tradução feita para este app.',
        semProva: %s
    };

    /* Cada seção: número, texto e as provas agrupadas pela letra que o
       original marca no corpo do parágrafo. */
    var CAPITULOS = %s;

    /* "ROM 8" -> ["3.1", "5.4", ...] */
    var PORCAPITULO = %s;

    function secao(marca) {
        var p = String(marca).split('.');
        var c = CAPITULOS[parseInt(p[0], 10) - 1];
        if (!c) return null;
        var s = c.secoes[parseInt(p[1], 10) - 1];
        if (!s) return null;
        return { cap: c, secao: s, marca: marca, titulo: c.titulo };
    }

    /* Os temas que um capítulo da Bíblia sustenta, na ordem da confissão. */
    function temas(usfm, cap) {
        var marcas = PORCAPITULO[usfm + ' ' + cap] || [];
        return marcas.map(secao).filter(Boolean);
    }

    /* Onde mais esta seção se apoia — o que deixa pular de um capítulo
       bíblico para outro sem voltar ao índice. */
    function citados(marca) {
        var s = secao(marca);
        if (!s) return [];
        var fora = [], visto = {};
        s.secao.provas.forEach(function (g) {
            g.r.forEach(function (r) {
                var k = r.u + ' ' + r.c;
                if (visto[k]) return;
                visto[k] = 1;
                fora.push(r);
            });
        });
        return fora;
    }

    return {
        FONTE: FONTE, CAPITULOS: CAPITULOS, PORCAPITULO: PORCAPITULO,
        secao: secao, temas: temas, citados: citados
    };
})();
''' % (len(indice),
       json.dumps(semProva),
       json.dumps(saida, ensure_ascii=False, separators=(',', ':')),
       json.dumps(indice, ensure_ascii=False, separators=(',', ':')))

open(sys.argv[1], 'w', encoding='utf8').write(js)
print('seções:', total, '| traduzidas:', traduzidas,
      '| capítulos indexados:', len(indice),
      '| tamanho:', round(len(js) / 1024), 'KB')
