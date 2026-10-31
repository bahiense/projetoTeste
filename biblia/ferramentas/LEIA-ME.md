# De onde vem `data/westminster.js`

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
python3 extrair-wcf.py  <pagina-salva.mht>  wcf.json
python3 gerar-westminster.py  ../data/westminster.js
```

- `extrair-wcf.py` lê a página e separa capítulos, seções e provas.
- `titulos-pt.json` e `secoes-pt.json` são a tradução, feita para este
  app (as traduções brasileiras em circulação têm dono, e a tela diz
  de quem é a que ela mostra).
- `abrev.json` liga as abreviações em inglês aos códigos USFM dos
  livros, que é como `data/biblia.js` os identifica.

`gerar-westminster.py` avisa quantas seções ainda não têm tradução.
