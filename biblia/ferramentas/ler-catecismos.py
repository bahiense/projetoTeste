"""Lê os dois catecismos de Westminster, em português, dos PDFs."""
import sys, re, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import refs_pt

def limpo(s):
    return re.sub(r'\s+', ' ', s).strip()

def breve(caminho):
    """Pergunta N. ... / R. ... / Ref. ..."""
    t = open(caminho, encoding='utf8').read()
    t = re.sub(r'\n{2,}', '\n\n', t)
    itens, perdidas = [], []
    partes = re.split(r'\n\s*Pergunta\s+(\d+)\.\s*', t)
    for i in range(1, len(partes), 2):
        n, corpo = int(partes[i]), partes[i + 1]
        # A fonte usa "Ref." quase sempre e "Referências:" na primeira.
        m = re.search(r'(.*?)\n\s*R\.\s*(.*?)(?:\n\s*(?:Ref\.|Referências:)\s*(.*))?$',
                      corpo, re.S)
        if not m:
            continue
        # O bloco de referências termina na primeira linha de prosa: a
        # última pergunta do catecismo é seguida pelo decálogo inteiro, e
        # sem esse corte ele entraria como se fosse citação.
        cru = []
        for l in (m.group(3) or '').split('\n'):
            l = l.strip()
            if not l:
                continue
            if cru and not ehLinhaDeReferencia(l):
                break
            cru.append(l)
        refs, p = refs_pt.ler(limpo(' '.join(cru)))
        perdidas += [(n, x) for x in p]
        itens.append({'n': n, 'pergunta': limpo(m.group(1)),
                      'texto': limpo(m.group(2)), 'refs': refs})
    return itens, perdidas

def ehLinhaDeReferencia(l):
    """A linha é uma lista de referências, e não prosa?

    Medida, não palpite: tira da linha tudo o que parece referência e
    pontuação; se quase nada sobra, era uma lista. Heurística por
    "começa com nome de livro" deixava escapar as listas que começam com
    um número herdado do livro anterior.
    """
    if not l or len(l) > 300:
        return False
    resto = re.sub(r'(?:[1-3]\s?)?[A-ZÀ-Ú][a-zà-úê]{0,8}\.?\s*\d{1,3}\s*[.:]\s*[\d,\s\-–]+', ' ', l)
    resto = re.sub(r'\d{1,3}\s*[.:]\s*[\d,\s\-–]+', ' ', resto)
    resto = re.sub(r'[;,.\s\-–:0-9]|comparado|com|cf|ver|e\b', ' ', resto)
    sobra = len(resto.strip())
    return sobra <= max(2, len(l) * 0.12) and re.search(r'\d\s*[.:]\s*\d', l)


def maior(caminho):
    """N. pergunta / resposta / bloco de referências."""
    t = open(caminho, encoding='utf8').read()
    itens, perdidas = [], []
    partes = re.split(r'\n\s*(\d{1,3})\.\s+(?=[A-ZÀ-Ú])', t)
    for i in range(1, len(partes), 2):
        n, corpo = int(partes[i]), partes[i + 1]
        pergunta, resposta, refs_cru = '', [], []
        fase = 'pergunta'
        for l in [x.strip() for x in corpo.split('\n')]:
            if not l or re.match(r'^Catecismo Maior', l) or re.match(r'^\d+$', l):
                continue
            if fase == 'pergunta':
                pergunta += ' ' + l
                if l.endswith('?'):
                    fase = 'resposta'
                continue
            if ehLinhaDeReferencia(l):
                refs_cru.append(l)
                fase = 'refs'
            else:
                # Prosa depois das referências é resposta que continua:
                # algumas respostas trazem listas no meio.
                resposta.append(l)
                fase = 'resposta'
        refs, p = refs_pt.ler(limpo(' '.join(refs_cru)))
        perdidas += [(n, x) for x in p]
        itens.append({'n': n, 'pergunta': limpo(pergunta),
                      'texto': limpo(' '.join(resposta)), 'refs': refs})
    # Número achado no meio da prosa não é pergunta: pergunta termina em
    # interrogação e tem resposta.
    itens = [x for x in itens if x['pergunta'].endswith('?') and x['texto']]
    return itens, perdidas


if __name__ == '__main__':
    for nome, fn, arq in [('Breve', breve, sys.argv[1]), ('Maior', maior, sys.argv[2])]:
        itens, perdidas = fn(arq)
        comRef = [x for x in itens if x['refs']]
        print('%s: %d perguntas | %d com referência | %d citações | %d não entendidas'
              % (nome, len(itens), len(comRef), sum(len(x['refs']) for x in itens), len(perdidas)))
        if perdidas:
            print('   exemplos:', perdidas[:5])
        falta = [x['n'] for x in itens if not x['refs']]
        if falta:
            print('   sem referência:', falta[:12])
        json.dump(itens, open(arq.replace('.txt', '.json'), 'w', encoding='utf8'),
                  ensure_ascii=False)
