"""Lê uma lista de referências em português e devolve (USFM, capítulo).

Listas assim carregam o livro de uma referência para a seguinte: em
"Jo 5.39; 20.31", a segunda é João 20. Perder essa herança jogaria a
citação no livro errado — pior do que perdê-la.
"""
import re, json, os

ABREV = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                    'abrev-pt.json'), encoding='utf8'))
# Da mais longa para a mais curta: "1Co" antes de "Co", "Jó" antes de "Jo".
NOMES = sorted(ABREV, key=len, reverse=True)
# O capítulo é o que importa para o índice; o versículo pode faltar
# ("Gn 1") ou vir separado por hífen ou vírgula ("Sl 86-8", "Sl 29,2"),
# que são erros de digitação da fonte, não ambiguidades reais.
UM = re.compile(
    r'^\s*(?:(' + '|'.join(re.escape(n) for n in NOMES) + r')\.?\s*)?'
    r'(\d{1,3})\s*(?:[.:,\-–]\s*(\d[\d,\s\-–e]*))?\s*$')

# "I Co", "II Tm", "III Jo" — numeral romano no lugar do arábico.
ROMANO = [('III ', '3'), ('II ', '2'), ('I ', '1')]

def ler(lista):
    """Devolve [(usfm, capitulo)], sem repetir, e o que não foi entendido."""
    fora, perdidas, livro = [], [], None
    bruto = re.sub(r'\s+', ' ', lista or '')
    bruto = bruto.replace(' e ', '; ')
    for r, n in ROMANO:
        bruto = re.sub(r'(?<![A-Za-zÀ-ú])' + r + r'(?=[A-ZÀ-Ú][a-zà-ú])', n, bruto)
    # A vírgula separa versículos do mesmo capítulo ("24.27, 44"), mas
    # também capítulos quando o que vem depois já traz o seu próprio
    # ponto ("1.28, 3.1-19"). Só nesse caso ela vira separador.
    bruto = re.sub(r',\s*(?=\d{1,3}\s*[.:]\s*\d)', '; ', bruto)
    for pedaco in re.split(r'[;]', bruto):
        pedaco = pedaco.strip().strip('.').strip()
        if not pedaco:
            continue
        m = UM.match(pedaco)
        if not m:
            # "Hb 1:1 comparado com Lc 1.1-4" e outras frases no meio
            achou = False
            for sub in re.findall(r'((?:[1-3]\s?)?[A-ZÀ-Ú][a-zà-úê]{0,7})\.?\s*(\d{1,3})\s*[.:]\s*\d', pedaco):
                u = ABREV.get(sub[0].replace(' ', ''))
                if u:
                    livro, achou = sub[0].replace(' ', ''), True
                    par = (u, int(sub[1]))
                    if par not in fora:
                        fora.append(par)
            if not achou:
                perdidas.append(pedaco)
            continue
        if m.group(1):
            livro = m.group(1)
        if not livro:
            perdidas.append(pedaco)
            continue
        u = ABREV.get(livro)
        if not u:
            perdidas.append(pedaco)
            continue
        par = (u, int(m.group(2)))
        if par not in fora:
            fora.append(par)
    return fora, perdidas
