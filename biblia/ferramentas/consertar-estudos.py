# -*- coding: utf-8 -*-
"""Conserta a chave dos estudos embutidos (data/estudos).

   O pacote de estudos que vem dentro do APK é procurado por chave:
   "Jeremias 27", "Jeremias 27 · simples", "Jeremias 27 · exercícios".
   Em 1.210 dos 2.121 estudos essa chave foi gravada com os bytes do
   UTF-8 lidos como latin-1 — "Â·" no lugar de "·", "exercÃ­cios" no
   lugar de "exercícios". O app procura a chave certa, não acha, e diz
   que o estudo ainda não foi escrito. O texto está lá; o endereço é
   que estava errado.

   O conserto é o caminho de volta: bytes latin-1 relidos como UTF-8.
   Só é aplicado quando a volta dá certo e o resultado muda — chave já
   correta fica como está.

   Uso: python3 -I ferramentas/consertar-estudos.py [--so-conferir]
"""
import io
import json
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
PASTA = os.path.join(RAIZ, 'data', 'estudos')


def consertar(texto):
    """Caminho de volta: bytes latin-1 relidos como UTF-8, pedaço a pedaço.

    A string inteira nem sempre faz a volta: em "1 Coríntios 11 Â·
    exercÃ­cios" o nome do livro está certo e só o fim está torto, e
    reler tudo como UTF-8 falharia no "í" correto. Por isso o conserto
    é por pedaço quebrado, não pela frase."""
    import re
    def volta(m):
        try:
            return m.group(0).encode('latin-1').decode('utf-8')
        except (UnicodeEncodeError, UnicodeDecodeError):
            return m.group(0)
    return re.sub(r'[ÂÃ][\x80-\xbf\u00a0-\u00ff]+', volta, texto)


def quebrada(texto):
    return 'Ã' in texto or 'Â' in texto


def chave_certa(estudo, titulo=None, formato=None):
    """A chave que o app procura, montada dos campos do próprio estudo.

    É o jeito seguro: em vez de adivinhar o conserto da chave, remonta
    o endereço a partir do título e do formato, que vieram corretos.
    Tem de bater com js/estudos.js — "título", "título · simples",
    "título · exercícios"."""
    t = (titulo or (estudo or {}).get('titulo') or '').strip()
    f = formato or (estudo or {}).get('formato') or 'completo'
    if not t:
        return None
    if f == 'simples':
        return t + ' · simples'
    if f == 'exercicios':
        return t + ' · exercícios'
    return t


def main(so_conferir=False):
    indice_caminho = os.path.join(PASTA, 'indice.json')
    with io.open(indice_caminho, encoding='utf-8') as f:
        indice = json.load(f)

    quebradas = [x for x in indice if quebrada(x.get('id', ''))]
    print('%d estudos no índice, %d com a chave quebrada' % (len(indice), len(quebradas)))

    por_arquivo = {}
    for item in indice:
        por_arquivo.setdefault(item.get('arq'), []).append(item)

    nao_deu = []
    mexidos = 0
    arquivos_mexidos = 0

    for arq, itens in sorted(por_arquivo.items()):
        if not arq:
            nao_deu.append('estudo sem arquivo no índice: ' + str(itens[0].get('id')))
            continue
        caminho = os.path.join(PASTA, arq + '.json')
        if not os.path.exists(caminho):
            nao_deu.append('arquivo %s não existe' % arq)
            continue
        with io.open(caminho, encoding='utf-8') as f:
            livro = json.load(f)

        novo = {}
        mudou = False
        for chave, estudo in livro.items():
            boa = chave_certa(estudo) or (consertar(chave) if quebrada(chave) else chave)
            if isinstance(estudo, dict):
                if quebrada(str(estudo.get('titulo', ''))):
                    estudo['titulo'] = consertar(estudo['titulo'])
                    mudou = True
                if estudo.get('id') != boa:
                    estudo['id'] = boa
                    mudou = True
            if boa != chave:
                mudou = True
                mexidos += 1
            if boa in novo:
                nao_deu.append('duas chaves viram a mesma: %s (arquivo %s)' % (boa, arq))
            novo[boa] = estudo

        if mudou:
            arquivos_mexidos += 1
            if not so_conferir:
                with io.open(caminho, 'w', encoding='utf-8') as f:
                    f.write(json.dumps(novo, ensure_ascii=False, separators=(',', ':')))

        # O índice tem de apontar para as chaves que agora existem.
        for item in itens:
            boa = chave_certa(None, item.get('titulo'), item.get('formato')) or item['id']
            item['id'] = boa
            if boa not in novo:
                nao_deu.append('%s (arquivo %s)' % (boa, arq))

    print('%d chaves consertadas, em %d arquivos de livro' % (mexidos, arquivos_mexidos))
    if nao_deu:
        print('\n✗ %d estudos do índice continuam sem par no arquivo:' % len(nao_deu))
        for x in nao_deu[:10]:
            print('   ' + x)
        return 1

    if so_conferir:
        print('\n(só conferindo — nada foi escrito)')
        return 0

    with io.open(indice_caminho, 'w', encoding='utf-8') as f:
        f.write(json.dumps(indice, ensure_ascii=False, separators=(',', ':')))
    print('\n✓ índice e arquivos regravados: toda chave do índice existe no livro')
    return 0


if __name__ == '__main__':
    sys.exit(main('--so-conferir' in sys.argv))
