"""Extrai a Confissão de Westminster da página salva.

O cabeçalho de cada capítulo é um <h1> com âncora; as seções e os blocos de
prova são ambos <p>, e o que os separa é o conteúdo: bloco de prova tem links
de referência bíblica, seção começa com numeral romano. O capítulo I aparece
duas vezes na página, então o primeiro de cada número é o que vale.
"""
import sys, email, re, json, html as H

msg = email.message_from_file(open(sys.argv[1], encoding='utf8', errors='replace'))
for part in msg.walk():
    if part.get_content_type() == 'text/html':
        doc = part.get_payload(decode=True).decode('utf8', 'replace'); break

# A página salva guarda os caracteres fora do ASCII como escapes literais
# (\u2022, \u2019), e não como o caractere. Sem desfazer isso, o separador
# entre as provas não existe e todas as letras viram um grupo só.
doc = re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), doc)

def limpo(s):
    s = re.sub(r'<sup>.*?</sup>', '', s, flags=re.S)
    s = re.sub(r'<[^>]+>', '', s)
    return re.sub(r'\s+', ' ', H.unescape(s).replace(' ', ' ')).strip()

ACHADOS = re.compile(
    r'<h1[^>]*>\s*<a name="Chapter ([IVXL]+)"[^>]*>\s*</a>\s*(.*?)</h1>'
    r'|<p[^>]*>(.*?)</p>', re.S)

caps, vistos, atual = [], set(), None
for m in ACHADOS.finditer(doc):
    if m.group(1):
        n = m.group(1)
        if n in vistos:
            atual = None               # a repetição do capítulo I
            continue
        vistos.add(n)
        t = re.sub(r'^[IVXL]+\.\s*', '', limpo(m.group(2)))
        atual = {'n': n, 'titulo': t, 'secoes': []}
        caps.append(atual)
        continue

    if atual is None:
        continue
    corpo = m.group(3)
    texto = limpo(corpo)
    if not texto:
        continue

    if 'rtBibleRef' in corpo:
        if not atual['secoes']:
            continue
        grupos = []
        for pedaco in re.split(r'•', corpo):
            refs = re.findall(r'data-reference="([^"]+)"', pedaco)
            if not refs:
                continue
            letra = re.match(r'\s*([a-z])\.', limpo(pedaco))
            grupos.append({'letra': letra.group(1) if letra else '', 'refs': refs})
        if grupos:
            atual['secoes'][-1]['provas'] += grupos
        continue

    # Lixo de navegação da página, que não é texto da confissão.
    texto = re.sub(r'\s*Back to the top\.?\s*$', '', texto)

    # A seção 1.6 traz as provas no corpo, como texto, em vez de no bloco
    # com links. Recolhê-las dali é ler a fonte, não lembrar de cor.
    # Pode vir colado no fim do parágrafo ou sozinho, num <p> só dele.
    embutidas = re.search(r'(?:^|\s)(a\.\s*[A-Z1-3][^|]*)$', texto)
    if embutidas and ' • ' in embutidas.group(1):
        cru = embutidas.group(1)
        texto = texto[:embutidas.start()].strip()
        grupos, livro = [], ''
        for pedaco in cru.split('•'):
            m = re.match(r'\s*([a-z])\.\s*(.*)', pedaco)
            if not m: continue
            refs = []
            for r in m.group(2).split(';'):
                r = r.strip().rstrip('.')
                if not r: continue
                t = re.match(r'^((?:[1-3]\s*)?[A-Za-z][A-Za-z\s.]*?)\s*(\d+[:.].*)$', r)
                if t:
                    livro = t.group(1).strip()
                    resto = t.group(2)
                else:
                    resto = r                      # "14:26, 40" herda o livro
                cap = re.match(r'^(\d+)[:.](.*)$', resto)
                if not cap or not livro: continue
                refs.append(livro + ' ' + cap.group(1) + '.' + cap.group(2).strip())
            if refs:
                grupos.append({'letra': m.group(1), 'refs': refs})
        if grupos and atual['secoes']:
            atual['secoes'][-1]['provas'] += grupos
            # Só quando as provas vinham coladas no fim do parágrafo; num
            # <p> só delas, o texto da seção já está guardado.
            if texto:
                atual['secoes'][-1]['texto'] = texto
            continue

    s = re.match(r'^([IVXL]+)\.\s*(.*)$', texto)
    if s:
        atual['secoes'].append({'n': s.group(1), 'texto': s.group(2), 'provas': []})
    elif atual['secoes']:
        atual['secoes'][-1]['texto'] += ' ' + texto

caps = [c for c in caps if c['secoes']]
json.dump(caps, open(sys.argv[2], 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('capítulos:', len(caps), '| seções:', sum(len(c['secoes']) for c in caps))
print('citações:', sum(len(g['refs']) for c in caps for s in c['secoes'] for g in s['provas']))
print('seções sem prova:', [c['n'] + '.' + s['n'] for c in caps for s in c['secoes'] if not s['provas']])
