"""O texto limpo dos artigos da Confissão Belga, da página salva.

Esta edição não traz os textos-prova, e a que traz veio com marcas de
nota coladas nas palavras ("boca1" virou "bocal"). Cada uma dá o que
tem de melhor: esta, o texto; a outra, as referências.

Os títulos saem do índice no alto da página, e não de adivinhar onde o
título acaba e o corpo começa — ali não há pontuação que os separe.
"""
import sys, re, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from abrir_mht import html_de, texto

t = texto(html_de(sys.argv[1]))

titulos = {}
for m in re.finditer(r'Artigo\s+(\d{1,2})\s*:\s*([^A-Z]*?[a-zà-ú])(?=\s+Artigo\s+\d|\s+Introdução|\s*$)', t[:4000]):
    titulos[int(m.group(1))] = m.group(2).strip()
if len(titulos) < 30:   # índice em outro formato: pega par a par
    bruto = re.findall(r'Artigo\s+(\d{1,2}):\s*(.+?)(?=Artigo\s+\d{1,2}:|$)', t[:4000])
    for n, tt in bruto:
        titulos.setdefault(int(n), tt.strip())

fora = {}
for n, tit in sorted(titulos.items()):
    marca = 'Artigo %d: %s' % (n, tit)
    i = t.find(marca, 3000)
    if i < 0:
        continue
    j = len(t)
    for prox in range(n + 1, n + 4):
        if prox in titulos:
            k = t.find('Artigo %d: %s' % (prox, titulos[prox]), i + 1)
            if k > 0:
                j = k
                break
    corpo = t[i + len(marca):j].replace('Voltar ao topo', ' ').strip()
    if len(corpo) > 60:
        fora[n] = {'titulo': tit, 'texto': re.sub(r'\s+', ' ', corpo)}

print('títulos no índice:', len(titulos), '| artigos com texto:', len(fora))
for n in (1, 2, 37):
    if n in fora:
        print('  %2d | %s | %s…' % (n, fora[n]['titulo'][:46], fora[n]['texto'][:50]))
json.dump(fora, open(sys.argv[2], 'w', encoding='utf8'), ensure_ascii=False)
