# De onde vem `data/doutrina.js`

A Confissão de Westminster (1646) é domínio público e cita, em cada
afirmação, os textos bíblicos que a sustentam. O app inverte essas
citações: cada capítulo da Bíblia passa a saber quais doutrinas se
apoiam nele.

Os dados **não** foram escritos de memória — isso daria citação
inventada, que num app sobre doutrina é o pior erro possível. Eles
saem de uma página da confissão salva do navegador, em que cada
referência vem num link com a forma normalizada (`data-reference="Ps
19.1-3"`).

```
python3 extrair-wcf.py     <pagina-salva.mht>  wcf.json
python3 ler-catecismos.py  breve.txt  maior.txt     # dos PDFs, via pdftotext
python3 gerar-doutrina.py  ../data/doutrina.js
```

Três obras entram hoje: a Confissão (1646), o Breve Catecismo (1647) e o
Catecismo Maior (1648). As duas últimas já vêm em português na edição
usada; a Confissão foi traduzida aqui.

- `extrair-wcf.py` lê a página e separa capítulos, seções e provas.
- `titulos-pt.json` e `secoes-pt.json` são a tradução, feita para este
  app (as traduções brasileiras em circulação têm dono, e a tela diz
  de quem é a que ela mostra).
- `abrev.json` liga as abreviações em inglês aos códigos USFM dos
  livros, que é como `data/biblia.js` os identifica.

`refs_pt.py` lê listas de referências em português e carrega o livro de
uma para a seguinte: em "Jo 5.39; 20.31", a segunda é João 20. Perder
essa herança jogaria a citação no livro errado.

`gerar-doutrina.py` confere cada citação contra o número real de
capítulos de cada livro e **descarta** a que não existe, dizendo quantas
foram. Em livro de um capítulo só, "3Jo 12" é o versículo 12. Apontar
para o capítulo errado seria pior do que não apontar: na tela nada
pareceria errado.
