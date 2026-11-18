# Professor de Teologia — app Android

**Para instalar:** abra no celular
https://github.com/bahiense/projetoTeste/releases/download/teologia-apk-latest/teologia.apk
e abra o arquivo baixado (permita "instalar apps desconhecidos" se o Android pedir).

O leitor das aulas preparadas pelo **Professor de Teologia dentro do Claude**
(`teologia-claude/`, https://claude.ai/artifact/JW1aJyxRL68X8n7LyzVL3q). Não
precisa de chave da API e não usa internet para as aulas.

## Como usar

1. No Claude, prepare a aula e toque em **Levar para o app do celular** (o arquivo
   `teologia-aula-….json` vai para Downloads).
2. No app, toque em **Importar aula** e escolha o arquivo. Também funciona abrir o
   arquivo com o app (pelo gerenciador de arquivos, "Abrir com") ou
   compartilhar o arquivo com ele.
3. Estude sem internet: aula, passagens (com hebraico e grego), teólogos,
   conceitos, cronologia, debates, múltipla escolha, verdadeiro ou falso,
   flashcards e dissertativas com os pontos esperados. As conversas com o
   professor (dúvidas, debate, sabatina, correção) acontecem no Claude.

## Para sempre: as cópias

- As aulas ficam nos arquivos do app (`files/banco/`).
- Depois de cada importação, o app regrava `teologia-copia-do-app.json` em
  Downloads (sobrevive a desinstalar). Para restaurar, "Importar aula" e escolha
  esse arquivo.
- **Enviar cópia (Drive…)** abre o menu de compartilhar: escolha o Google Drive
  para sobreviver à perda do celular. O mesmo arquivo restaura as aulas no Claude
  ("Restaurar de uma cópia").

## Como funciona por dentro

- A tela é a **mesma página** do artifact (`teologia-claude/professor.html`),
  copiada na compilação pela tarefa `gerarPagina` de `app/build.gradle.kts`, que
  tira as bibliotecas de fora e põe uma política de segurança (sem rede).
- `Nativo.kt` — o objeto `TeologiaNativo`: guarda cada documento da aula como um
  arquivo, recebe os arquivos (seletor, "Abrir com", "Compartilhar") e faz as
  cópias.
- `Atualizador.kt` — "Procurar atualização": baixa o APK novo da aba Releases.

## Assinatura (para a atualização instalar por cima)

O Android só instala uma versão nova por cima se ela tiver a mesma assinatura.
Como no app da Bíblia, a chave é fixa e fica no repositório
(`teologia.keystore`, senha `teologia`): todo build no GitHub sai com a mesma
assinatura. Não é uma chave secreta; serve só para manter a assinatura estável.
O app não guarda chave de API nem senha, só as aulas. Instale atualizações só
pelo link da aba Releases ou pelo botão "Procurar atualização".

## Compilar

O workflow `.github/workflows/teologia-apk.yml` gera o APK a cada push que mexe
em `teologia-android/` ou na página e publica na aba Releases (tag
`teologia-apk-latest`). Localmente: `./gradlew assembleRelease` (precisa do SDK
do Android).
