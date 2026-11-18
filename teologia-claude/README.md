# Professor de Teologia — dentro do Claude

Abrir: https://claude.ai/artifact/JW1aJyxRL68X8n7LyzVL3q (no app do Claude ou em claude.ai).

Um professor particular de teologia (doutor, com livros publicados, que conhece
história da igreja, teologia sistemática, bíblica e histórica, hebraico e grego,
a Reforma e as grandes tradições, e as apresenta com justiça). Roda pelo plano
do Claude de quem usa, sem chave de API.

## O que entra

- **PDF** com texto ou escaneado (inclusive slides). Páginas com bastante texto
  são lidas direto do PDF; páginas em imagem (slides, figuras, escaneados) vão ao
  Claude como imagem, em duas metades, para a letra pequena chegar legível.
  "Ler todas as páginas como imagem" força a leitura por imagem (padrão para aulas
  em slides).
- **Texto** (.txt, .md) ou **texto colado** (sermão, artigo, capítulo).
- **Fotos das páginas** (JPG, PNG), várias de uma vez, na ordem do nome.
- Word e EPUB: salve como PDF antes.

Ao subir, escolhe-se **o que é** (aula, livro, apostila/artigo, sermão, estudo
bíblico, outro) e **para quê** (dominar e debater, preparar uma pregação, ensinar,
prova, edificação). Isso muda os pedidos ao professor e as abas: a aba própria do
objetivo (Apologética, Pregação, Para ensinar, Para a prova, Para a vida) e, para
pregação e ensino, ela vem logo depois da Aula; num estudo bíblico, Passagens vem
primeiro.

## Como a aula é feita

Cada etapa é um pedido separado e fica guardada assim que termina (banco do
artifact, área particular de cada pessoa). Se a cota do plano acabar ou a tela
fechar, "Continuar de onde parou" retoma do ponto exato; se a página foi
recarregada no meio da leitura, ela pede o arquivo de novo e continua da página
em que parou.

1. Leitura de todo o material, em janelas de 3 páginas.
2. Material grande (um livro): dividido em partes e **fichado** parte a parte;
   cada módulo é escrito com o trecho original dele. Material pequeno vai inteiro
   em cada pedido.
3. Plano: módulos que cobrem tudo, teólogos citados e complementares, passagens.
4. **Pesquisa na web** (opcional, ver abaixo) e dossiê com as fontes.
5. Módulos, teólogos (3 por vez), passagens (4 por vez, com termos originais e as
   leituras das tradições), conceitos e cronologia, debates, questões, flashcards,
   dissertativas, síntese e a parte do objetivo.

## De onde vem cada informação

A tela separa sempre: **do material** (o que o seu material diz, explicado),
**complemento do professor** (conhecimento do próprio Claude, em cartões
tracejados) e **da pesquisa na web** (em azul, com o link da fonte). A legenda no
alto da aula diz se houve pesquisa e por quê não, quando não houve.

## Pesquisa na web: como funciona e o limite

A página do artifact não tem acesso próprio à internet (o visualizador bloqueia
qualquer requisição). O único caminho é um **conector** do Claude. A página usa o
conector **Parallel Search** (gratuito, sem login): adicione-o em claude.ai →
Configurações → Conectores. Na primeira busca, o Claude pede permissão.

- Com o conector: o professor escolhe de 5 a 8 buscas (biografias, contexto,
  datas e citações a conferir, debates atuais), lê os resultados e escreve um
  dossiê com links; na conversa (aba Professor) ele também pode pesquisar quando
  precisar.
- Sem o conector: a aula sai do mesmo jeito, completada com o conhecimento do
  professor, marcado como "complemento".
- **Limite franco:** a integração com o Parallel Search foi testada só com um
  conector simulado; o formato exato dos argumentos é lido do próprio conector na
  hora (e há dois formatos de reserva). Se o conector mudar ou não estiver
  adicionado, a aula continua sem pesquisa e a tela diz o motivo.

## Para sempre e no celular

- "Levar para o app do celular" baixa `teologia-aula-….json`; o app Android
  (`teologia-android/`) importa por "Importar aula", "Abrir com" ou
  "Compartilhar". "Restaurar de uma cópia" traz as aulas de volta aqui.
- As conversas (dúvidas, debate, sabatina, correção) acontecem aqui, no Claude.

## Testes

`testes/teste-fluxo.mjs` roda o fluxo inteiro no Chromium com um Claude simulado
(`testes/claude-simulado.js`), inclusive com o banco devolvendo objetos
congelados, quedas no meio, recarga da página, material grande e o modo app:

    npm i pdfjs-dist@3.11.174   # numa pasta qualquer
    node teologia-claude/testes/teste-fluxo.mjs <essa pasta> <pasta para capturas>
