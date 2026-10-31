"""Confissão Belga (1561), da edição em português com textos-prova.

Cada artigo traz as referências no fim, numeradas como notas de rodapé:
"1 Rm 10:10. 2 Dt 6:4; 1Co 8:4,6." O que o índice quer é o conjunto.

A edição usada traz os artigos 1 a 17; os demais ficam de fora, e a
tela diz isso.
"""
import sys, re, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import refs_pt

MIUDAS = {'a', 'as', 'o', 'os', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na',
          'por', 'para', 'com', 'que', 'ao', 'à', 'pelos', 'pelas', 'pelo', 'pela'}
MAIUSCULAS = {'deus', 'cristo', 'jesus', 'escritura', 'escrituras', 'trindade',
              'espírito', 'santo', 'filho', 'pai', 'palavra', 'igreja', 'adão',
              'satanás', 'lei', 'evangelho'}


def arrumarTitulo(t):
    """O título vem em caixa alta na fonte; gritar na tela não ajuda."""
    if not t.isupper():
        return t
    fora = []
    for i, p in enumerate(t.lower().split()):
        if p in MAIUSCULAS or i == 0 or p not in MIUDAS:
            fora.append(p[:1].upper() + p[1:])
        else:
            fora.append(p)
    return ' '.join(fora)


t = open(sys.argv[1], encoding='utf8').read()
partes = re.split(r'\n\s*ARTIGO\s+(\d{1,2})\s*[-–]\s*', t)
itens, perdidas = [], []
for i in range(1, len(partes), 2):
    n = int(partes[i])
    corpo = partes[i + 1]
    linhas = [l.strip() for l in corpo.split('\n')]
    titulo = linhas[0] if linhas else ''
    resto = ' '.join(linhas[1:])
    # As notas começam no primeiro "1 " seguido de livro, e vão até o fim.
    g = re.search(r'(?<![\d,])1\s+(?=(?:[1-3]\s?)?[A-ZÀ-ÚS][a-zà-ú1]{0,8}\.?\s*\d{1,3}\s*[:.]\s*\d)', resto)
    texto = resto[:g.start()].strip() if g else resto.strip()
    cru = resto[g.start():] if g else ''
    # "2 Dt 6:4" — o número da nota não é capítulo; vira separador.
    cru = re.sub(r'(?<![\d,:.\-])\s*\d{1,2}\s+(?=(?:[1-3]\s?)?[A-ZÀ-ÚS][a-zà-ú1]{0,8}\.?\s*\d)', '; ', cru)
    cru = cru.replace('Veja também', ';')
    # A fonte troca "Sl" por "S1" e "sábio10" por "sábiol0" em alguns pontos.
    cru = re.sub(r'\bS1\b', 'Sl', cru)
    # E "l" minúsculo no lugar do "1": lCo, lTm, lJo, lPe.
    cru = re.sub(r'\bl(Co|Tm|Jo|Pe|Ts|Sm|Rs|Cr)\b', r'1\1', cru)
    refs, p = refs_pt.ler(cru)
    perdidas += [(n, x) for x in p]
    texto = re.sub(r'(?<=[a-zà-úA-ZÀ-Ú\)”"])\d{1,2}\b', '', texto)   # marcas de nota
    itens.append({'n': n, 'pergunta': arrumarTitulo(titulo),
                  'texto': re.sub(r'\s+', ' ', texto).strip(), 'refs': refs})

itens = [x for x in itens if x['texto']]

# Onde a outra edição tem o texto limpo, é dela que ele vem: aqui as
# marcas de nota entraram coladas nas palavras ("boca1" virou "bocal"),
# e isso não há regra que desfaça sem estragar palavra de verdade.
limpo_path = os.path.join(os.path.dirname(os.path.abspath(sys.argv[1])), 'belga-texto.json')
if os.path.exists(limpo_path):
    limpos = json.load(open(limpo_path, encoding='utf8'))
    trocados = 0
    for x in itens:
        bom = limpos.get(str(x['n']))
        if bom:
            x['texto'] = bom['texto']
            x['pergunta'] = bom['titulo']
            trocados += 1
    print('   texto limpo aproveitado em %d dos %d artigos' % (trocados, len(itens)))
print('Belga: %d artigos | %d com referência | %d citações | %d não entendidas'
      % (len(itens), sum(1 for x in itens if x['refs']),
         sum(len(x['refs']) for x in itens), len(perdidas)))
if perdidas:
    print('   exemplos:', perdidas[:6])
for x in itens[:2]:
    print('   %2d | %s | %s… | %d refs' % (x['n'], x['pergunta'][:40], x['texto'][:46], len(x['refs'])))
json.dump(itens, open(sys.argv[2], 'w', encoding='utf8'), ensure_ascii=False)
