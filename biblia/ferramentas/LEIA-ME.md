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
python3 ler-dort.py         dort.txt   ref-in/dort.json
python3 gerar-doutrina.py   ../data/doutrina.js
```

As Três Formas de Unidade (Belga, Heidelberg e Dort) vieram num PDF só,
em português e com os textos-prova; ele é fatiado em três antes de ser
lido.

Seis obras entram hoje: a Confissão (1646), o Breve Catecismo (1647),
o Catecismo Maior (1648), o Catecismo de Heidelberg (1563), a
Confissão Belga (1561) e os Cânones de Dort (1619). As cinco últimas
já vêm em português na edição usada; a Confissão de Westminster foi
traduzida aqui.

A Belga sai de duas edições: o texto limpo de uma página, as
referências do PDF. O `ler-belga.py` junta as duas, preferindo o texto
limpo onde ele existe.

Em Dort as citações estão na prosa, entre parênteses, e dentro dos
parênteses o livro vale para as seguintes — em "(Rom. 3:19,23; 6:23)",
a segunda é Romanos 6.

`abrir_mht.py` lê a parte HTML da página salva **sem acreditar no
charset declarado**: duas das páginas dizem UTF-8 e estão em
windows-1252, e acreditar nelas entregaria o texto todo corrompido.

Lacunas conhecidas, declaradas na tela:

- **Catecismo Maior** — a edição usada não traz as perguntas 176, 177
  e 192.
- **Cânones de Dort** — só 23 dos 59 artigos trazem referência
  bíblica. Não é falha da extração: os artigos argumentam mais do que
  citam, e a tela diz isso.

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

# De onde vêm `data/lugares.json` e `data/mapa-base.json`

O mapa de cada capítulo tem duas fontes, as duas livres:

| o quê | fonte | licença |
| --- | --- | --- |
| lugares, coordenadas e descrição | [STEPBible-Data](https://github.com/STEPBible/STEPBible-Data) (TIPNR), Tyndale House Cambridge | CC BY 4.0 |
| costa, rios e lagos | [natural-earth-vector](https://github.com/nvkelso/natural-earth-vector), 1:50m | domínio público |

```
git clone --depth 1 https://github.com/STEPBible/STEPBible-Data.git /tmp/step
python3 gerar-lugares.py /tmp/step

git clone --depth 1 --filter=blob:none https://github.com/nvkelso/natural-earth-vector.git /tmp/ne
cd /tmp/ne && git checkout HEAD -- geojson/ne_50m_coastline.geojson \
    geojson/ne_50m_lakes.geojson geojson/ne_50m_rivers_lake_centerlines.geojson
python3 gerar-mapa.py /tmp/ne
```

**Em quais capítulos cada lugar aparece** não sai das listas resumidas do
TIPNR ("Jos.10.1ff" perderia Jerusalém em centenas de capítulos): sai do
texto etiquetado, versículo a versículo. No Antigo Testamento o hebraico
marca cada palavra com `»Nome@Ref`; no Novo, não — lá a ligação é pelo
número de Strong do nome próprio, aceito só quando a morfologia traz o
sufixo `-L` (lugar) **e** a tradução da palavra é o nome do lugar. Sem
essas duas travas, "Três Tavernas" entrava em todo versículo que diz
"três" e Mateus 27 ganhava um pino em Mispá por causa de "Lugar da
Caveira".

Buracos conhecidos, que são da fonte e não do app: 23 nomes repetidos em
lugares diferentes (Debir, Betel de Simeão, Ofra…) ficam de fora porque
não dá para escolher o pino certo, e alguns lugares conhecidos não estão
no TIPNR com coordenada — Creta, por exemplo, aparece só pelos portos
(Salmone, Laseia, Fenice).

Os nomes em português estão em `lugares-pt.json`, conferidos à mão. O que
não está lá fica no nome da fonte, em inglês — melhor do que inventar
grafia de nome bíblico.
