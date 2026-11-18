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

O Android só instala uma versão nova por cima se ela tiver a **mesma assinatura**.
A chave não pode ficar no repositório (ele é público): ela vem de segredos do
GitHub. Sem segredo completo, cada build sai com uma chave descartável e a
atualização dá "app não instalado" (é preciso desinstalar antes, e as aulas do
app se perdem, mas a cópia em Downloads fica).

O workflow usa, nesta ordem: `TEOLOGIA_KEYSTORE_B64` + `TEOLOGIA_KEYSTORE_SENHA`
(apelido `teologia`, ou o de `TEOLOGIA_KEYSTORE_ALIAS`); senão a chave do Ciência
Política (`POLITICA_KEYSTORE_B64` + `POLITICA_KEYSTORE_SENHA`, apelido
`politica`); senão a do Espalhe. Ele confere a senha antes de compilar e avisa no
resumo do workflow qual chave usou.

Para criar a chave própria (uma vez, num computador com Java):

    keytool -genkeypair -v -keystore teologia.jks -alias teologia \
      -keyalg RSA -keysize 4096 -validity 36500 \
      -storepass SUA_SENHA -keypass SUA_SENHA -dname "CN=Professor de Teologia"
    base64 -w0 teologia.jks > teologia.b64      # no Mac: base64 -i teologia.jks -o teologia.b64

Depois, no GitHub: repositório → Settings → Secrets and variables → Actions →
New repository secret:

- `TEOLOGIA_KEYSTORE_B64` = o conteúdo de `teologia.b64`
- `TEOLOGIA_KEYSTORE_SENHA` = a senha

Guarde `teologia.jks` e a senha fora do repositório (num gerenciador de senhas ou
no Drive). Perder a chave significa nunca mais atualizar por cima.

Importante: o primeiro APK assinado com a chave estável não instala por cima de
um assinado com chave descartável. Desinstale uma vez (antes, garanta a cópia em
Downloads ou no Drive) e daí em diante as atualizações instalam por cima.

## Compilar

O workflow `.github/workflows/teologia-apk.yml` gera o APK a cada push que mexe
em `teologia-android/` ou na página e publica na aba Releases (tag
`teologia-apk-latest`). Localmente: `./gradlew assembleRelease` (precisa do SDK
do Android).
