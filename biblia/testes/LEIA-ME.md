# As suítes do navegador

O `verificar.mjs` confere o que dá para conferir sem tela. Estes testes
abrem o app de verdade num Chromium e conferem o resto: o que a pessoa
vê, o que acontece ao tocar, e o que o mutirão faz quando a IA falha.

```
cd /caminho/do/repositorio
python3 -m http.server 8123 &
node biblia/testes/teste-teologia.mjs
```

Cada arquivo roda sozinho e sai com código 1 se algo quebrou.

| arquivo | o que cobre |
| --- | --- |
| `teste-acervo.mjs` | o acervo, a saída da IA do APK, as perguntas removidas |
| `teste-claude-lote.mjs` | o mutirão rodando pelo Claude |
| `teste-conexao.mjs` | internet que cai e volta no meio da geração |
| `teste-conferir.mjs` | o teste da chave do Gemini em Ajustes |
| `teste-mapa.mjs` | o mapa do acervo e a escolha de livros |
| `teste-motivo.mjs` | por que o mutirão parou, visível na tela |
| `teste-oficina.mjs` | a Oficina e as barras de navegação de cada lugar |
| `teste-panorama.mjs` | gerar só o panorama dos 66 livros |
| `teste-puxar.mjs` | trazer um backup para dentro do app |
| `teste-queda.mjs` | queda de ligação com o Claude |
| `teste-renovar.mjs` | renovar estudos por origem |
| `teste-retomar.mjs` | o mutirão voltando sozinho |
| `teste-saidos.mjs` | o que saiu na sentada, e a falha consertada |
| `teste-sobrecarga.mjs` | servidor sobrecarregado |
| `teste-sóclaude.mjs` | a chave do Gemini dobrada quando o Claude gera |
| `teste-teologia.mjs` | a teologia reformada por capítulo |
| `teste-travessia.mjs` | os pacotes entre a Oficina e o celular |
| `teste-umestudo.mjs` | renovar um capítulo avulso |

Os caminhos do servidor são relativos à raiz do repositório, e o
`teste-oficina.mjs` escreve um `artefato-teste.html` temporário em
`biblia/` e o apaga no fim.
