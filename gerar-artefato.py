#!/usr/bin/env python3
"""Gera a página do Claude a partir do app do celular.

Uma fonte só. O app de celular é um documento HTML completo; a página
publicada no Claude recebe o cabeçalho do próprio visualizador, então aqui
tiramos o invólucro e o que só faz sentido num app instalado.
"""
import pathlib
import re
import sys

origem = pathlib.Path("celular/index.html")
destino = pathlib.Path("CicloConcursos.html")
s = origem.read_text()

# fora o invólucro de documento
s = s.replace('<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n', "", 1)
s = s.replace("</head>\n<body>\n", "", 1)
s = re.sub(r"\n</body>\n</html>\s*$", "\n", s)

# fora o que só serve ao aplicativo instalado
for linha in ('<link rel="manifest" href="manifest.webmanifest">',
              '<link rel="icon" href="icone-192.png">',
              '<link rel="apple-touch-icon" href="icone-180.png">',
              '<meta name="apple-mobile-web-app-capable" content="yes">',
              '<meta name="apple-mobile-web-app-title" content="Ciclo">',
              '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'):
    s = s.replace(linha + "\n", "")

for proibido in ("<!doctype", "</html>", "<head>", "manifest.webmanifest"):
    if proibido in s.lower():
        sys.exit("sobrou %r na página gerada" % proibido)

destino.write_text(s)
print("%s gerado a partir de %s (%d KB)" % (destino, origem, len(s) / 1024))
