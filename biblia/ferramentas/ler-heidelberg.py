"""Catecismo de Heidelberg (1563), da página salva em português.

Cada pergunta traz as referências num parágrafo final, agrupadas por
número — "(1) 1Co 3:23; Tt 2:14. (2) Rm 14:8". O que interessa ao índice
é o conjunto delas.
"""
import sys, re, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from abrir_mht import html_de, texto
import refs_pt

t = texto(html_de(sys.argv[1]))
# Começa na primeira pergunta; antes disso é menu do site.
ini = t.find('1. Qual é o seu único fundamento')
t = t[ini:] if ini > 0 else t

# A fonte numera com ponto quase sempre — e com vírgula na 10 e em
# outras três. Em vez de confiar na pontuação, só é aceito como início
# de pergunta o número que vem na sequência: 10 depois da 9, e nunca um
# "(10)" de referência no meio do texto.
# Três coisas, juntas, distinguem o começo de uma pergunta de um número
# de referência: o número cresce, vem seguido de maiúscula e há uma
# pergunta logo adiante. Crescer, e não ser o próximo exato: assim uma
# pergunta que a fonte numerou de outro jeito custa só ela mesma, em vez
# de desalinhar todo o resto.
candidatos = []
for m in re.finditer(r'(\d{1,3})\s*[.,]?\s+(?=[A-ZÀ-Ú“"])', t):
    n = int(m.group(1))
    # Número de referência também vem seguido de maiúscula; o que
    # distingue o começo de uma pergunta é haver uma pergunta logo ali.
    if 1 <= n <= 129 and '?' in t[m.end():m.end() + 400]:
        candidatos.append((n, m.end()))

# Procura cada número na ordem, sempre depois do anterior. Assim um
# "12" solto no meio da resposta 2 não rouba o lugar da pergunta 12, e
# uma pergunta que a fonte numerou de outro jeito custa só ela mesma.
marcas, onde = [], 0
for n in range(1, 130):
    achou = next((c for c in candidatos if c[0] == n and c[1] > onde), None)
    if achou:
        marcas.append(achou)
        onde = achou[1]

itens, perdidas = [], []
for k, (n, ini_) in enumerate(marcas):
    fim_ = marcas[k + 1][1] - len(str(marcas[k + 1][0])) - 2 if k + 1 < len(marcas) else len(t)
    corpo = t[ini_:max(ini_, fim_)]
    m = re.match(r'(.*?\?)\s*(.*)$', corpo, re.S)
    if not m:
        continue
    pergunta, resto = m.group(1).strip(), m.group(2).strip()
    # O bloco de referências começa no primeiro "(1)" seguido de livro.
    g = re.search(r'\(1\)\s*(?=(?:[1-3]\s?)?[A-ZÀ-Ú][a-zà-ú]{0,8}\.?\s*\d)', resto)
    resposta = resto[:g.start()].strip() if g else resto
    cru = resto[g.start():] if g else ''
    cru = re.sub(r'\(\d+\)', ';', cru)
    cru = re.sub(r'Veja também', ';', cru)
    refs, p = refs_pt.ler(cru)
    perdidas += [(n, x) for x in p]
    resposta = re.sub(r'^R\.\s*', '', resposta)
    resposta = re.sub(r'\s*\(\d+\)', '', resposta).strip()
    itens.append({'n': n, 'pergunta': re.sub(r'\s*\(\d+\)', '', pergunta),
                  'texto': resposta, 'refs': refs})

vistos, limpos = set(), []
for x in sorted(itens, key=lambda y: y['n']):
    if x['n'] in vistos or not x['texto']:
        continue
    vistos.add(x['n'])
    limpos.append(x)

print('Heidelberg: %d perguntas | %d com referência | %d citações | %d não entendidas'
      % (len(limpos), sum(1 for x in limpos if x['refs']),
         sum(len(x['refs']) for x in limpos), len(perdidas)))
faltam = [i for i in range(1, 130) if i not in vistos]
if faltam:
    print('   não achadas:', faltam)
if perdidas:
    print('   exemplos de perdidas:', perdidas[:5])
json.dump(limpos, open(sys.argv[2], 'w', encoding='utf8'), ensure_ascii=False)
