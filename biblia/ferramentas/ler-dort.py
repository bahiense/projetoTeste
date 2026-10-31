"""Cânones de Dort (1619), da edição em português das Três Formas.

Aqui as citações estão na prosa, entre parênteses — "(Rom. 3:19,23;
6:23)" —, e dentro dos parênteses o livro vale para as seguintes: a
segunda é Romanos 6. O terceiro e o quarto pontos vêm juntos, como no
original.
"""
import sys, re, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import refs_pt

MIUDAS = {'a', 'as', 'o', 'os', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na',
          'por', 'para', 'com', 'que', 'ao', 'à', 'aos', 'às', 'pelo', 'pela', 'um', 'uma'}


def arrumar(t):
    if not t.isupper():
        return t
    return ' '.join(p[:1].upper() + p[1:] if i == 0 or p not in MIUDAS else p
                    for i, p in enumerate(t.lower().split()))


t = '\n' + open(sys.argv[1], encoding='utf8').read()
# Os capítulos dão o lugar de cada artigo; sem eles, a numeração
# recomeçada em cada ponto faria um artigo apagar o outro.
caps = []
for m in re.finditer(r'\n\s*CAPÍTULOS?\s+([\d\se]+?)\s*(?:-\s*([^\n]*))?\n', t):
    titulo = (m.group(2) or '').strip()
    # O título pode continuar na linha seguinte, mas nunca depois do
    # primeiro "ART." — ali já começa o artigo.
    sobra = t[m.end():m.end() + 200].split('ART.')[0]
    for l in sobra.split('\n'):
        l = l.strip()
        if not l or not l.isupper():
            break
        titulo += ' ' + l
    caps.append((m.start(), arrumar(re.sub(r'\s+', ' ', titulo).strip()), m.group(1)))

itens, perdidas = [], []
marcas = list(re.finditer(r'\n\s*ART\.\s*(\d{1,2})\.\s*([^\n]*)', t))
for k, m in enumerate(marcas):
    n = int(m.group(1))
    fim = marcas[k + 1].start() if k + 1 < len(marcas) else len(t)
    corpo = t[m.end():fim]
    cap = [c for c in caps if c[0] < m.start()]
    nome_cap = cap[-1][1] if cap else ''
    num_cap = re.sub(r'\s+', ' ', cap[-1][2]).strip() if cap else '?'

    refs = []
    for par in re.findall(r'\(([^()]{4,220})\)', corpo):
        if not re.search(r'\d\s*[:.]\s*\d', par):
            continue
        achadas, p = refs_pt.ler(par.replace('.', ' ').replace(' :', ':'))
        for a in achadas:
            if a not in refs:
                refs.append(a)
        perdidas += [(num_cap + '.' + str(n), x) for x in p if len(x) < 40]

    itens.append({'n': n, 'cap': num_cap, 'capTitulo': nome_cap,
                  'pergunta': arrumar(re.sub(r'\s+', ' ', m.group(2)).strip()),
                  'texto': re.sub(r'\s*\n\s*', ' ', re.sub(r'\n\s*\d+\s*\n', '\n', corpo)).strip(),
                  'refs': refs})

print('Dort: %d artigos | %d com referência | %d citações | %d não entendidas'
      % (len(itens), sum(1 for x in itens if x['refs']),
         sum(len(x['refs']) for x in itens), len(perdidas)))
print('   capítulos:', [(c[2].strip(), c[1][:40]) for c in caps])
for x in itens[:2]:
    print('   %s.%d | %s | %d refs' % (x['cap'], x['n'], x['pergunta'][:46], len(x['refs'])))
json.dump(itens, open(sys.argv[2], 'w', encoding='utf8'), ensure_ascii=False)
