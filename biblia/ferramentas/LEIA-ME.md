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
python3 extrair-wcf.py      <pagina-salva.mht>  wcf.json
python3 ler-catecismos.py   breve.txt  maior.txt    # dos PDFs, via pdftotext
python3 ler-heidelberg.py   <pagina-salva.mht>  ref-in/heidelberg.json
python3 ler-belga-texto.py  <pagina-salva.mht>  ref-in/belga-texto.json
python3 ler-belga.py        belga.txt  ref-in/belga.json
python3 gerar-doutrina.py   ../data/doutrina.js
```

Cinco obras entram hoje: a Confissão (1646), o Breve Catecismo (1647),
o Catecismo Maior (1648), o Catecismo de Heidelberg (1563) e a
Confissão Belga (1561). As quatro últimas já vêm em português na
edição usada; a Confissão de Westminster foi traduzida aqui.

A Belga sai de **duas** edições, porque nenhuma serve sozinha: uma traz
os textos-prova mas com as marcas de nota coladas nas palavras ("boca1"
virou "bocal"), a outra traz o texto limpo mas sem prova nenhuma. O
`ler-belga.py` junta as duas, preferindo o texto limpo onde ele existe.

`abrir_mht.py` lê a parte HTML da página salva **sem acreditar no
charset declarado**: duas das páginas dizem UTF-8 e estão em
windows-1252, e acreditar nelas entregaria o texto todo corrompido.

Lacunas conhecidas, declaradas na tela:

- **Catecismo Maior** — a edição usada não traz as perguntas 176, 177
  e 192.
- **Confissão Belga** — a edição com textos-prova vai até o artigo 17.
  Os outros vinte existem, mas sem prova não entram num índice por
  capítulo.
- **Cânones de Dort** — fora. A página em português traz só o primeiro
  dos cinco pontos; o PDF traz os cinco, mas em inglês e em duas
  colunas, que o extrator embaralha.

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
