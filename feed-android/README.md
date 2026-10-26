# Feed Limpo — app Android

Limpa o YouTube de política e reforça o que você gosta: rock clássico, jazz,
blues, country, gospel americano e cristianismo reformado (a lista fica em
`app/src/main/assets/canais.js`).

O app tem dois modos:

- **Simples** — funciona assim que é instalado, sem configurar nada. Cada canal
  da lista tem um botão **Abrir**, que leva ao canal no app do YouTube; lá você
  toca em **Inscrever-se** e volta para marcar como feito. Para limpar, o app
  abre a sua lista de canais no YouTube e diz o que procurar.
- **Automático** — com um ID do cliente do Google (abaixo), o app entra na
  conta, lê suas inscrições, marca as de política e cancela e inscreve sozinho,
  sempre com revisão e confirmação na tela.

A aba **Dicas** explica o que fazer no próprio YouTube para o algoritmo mudar.

## Como funciona

A tela é uma página (`app/src/main/assets/`) num WebView, servida por
`https://appassets.androidplatform.net` para o `localStorage` ser estável. É lá
que ficam guardadas as buscas de canais, que custam cota da API.

A `YouTubeBridge.kt` faz duas coisas que a página não pode fazer:

- **O login.** Abre no navegador do aparelho, na página do Google. O Google
  recusa OAuth em WebView (`disallowed_useragent`), e com razão: ali o app
  poderia ler a senha. A troca do código usa PKCE (S256) e confere o `state`.
- **As chamadas à API.** A página pede (`chamar(pedido, metodo, caminho,
  corpo)`) e recebe a resposta em `window.__ytResposta`. O token fica só no
  lado nativo; o JavaScript nunca o vê.

## Ligar o modo automático (opcional, uma vez, de graça)

O `youtubeClienteId` em `gradle.properties` vem vazio: sem ele o app funciona
no modo simples, e a aba Dicas explica o que falta. Em `console.cloud.google.com`:

1. Crie um projeto.
2. Em **APIs e serviços → Biblioteca**, ative a **YouTube Data API v3**.
3. Em **Tela de consentimento OAuth**: tipo **Externo**; preencha nome e e-mail;
   em **Usuários de teste**, adicione o e-mail da sua conta do YouTube.
4. Em **Credenciais → Criar credenciais → ID do cliente OAuth**, tipo **Android**:
   - pacote `com.bahiense.feed`
   - SHA-1 `E4:54:28:A1:1C:36:9A:98:C0:A2:77:45:AF:DA:D3:AE:F7:37:35:25`
     (a chave fixa do repositório — `keytool -list -v -keystore feed.keystore`,
     senha `feedlimpo`)
   - em **Configurações avançadas**, ative o **esquema de URI personalizado**.
     O app recebe o login de volta por esse esquema; o Google o deixa desligado
     em clientes Android novos.
5. Cole o ID (termina em `.apps.googleusercontent.com`) em `youtubeClienteId=`
   no `gradle.properties` — dá para editar direto pelo site do GitHub — e o
   GitHub gera o APK de novo sozinho.

Na hora de entrar, o Google mostra "o Google não verificou este app": toque em
**Avançado → Acessar**. O app é seu, criado na sua conta.

Com a tela de consentimento em **Testes**, o Google expira a permissão a cada
**7 dias**. Para uma faxina isso basta; se expirar, o app esquece o token e
pede para entrar de novo.

## Cota da API

São 10.000 pontos por dia, de graça:

| Ação | Custo |
|---|---|
| Ler inscrições (50 por vez) | 1 |
| Buscar um canal | 100 |
| Cancelar uma inscrição | 50 |
| Inscrever em um canal | 50 |

A lista inteira de sugestões (55 canais) gasta cerca de 8.300, e cabe num dia.
Se a cota acabar no meio, o app para, avisa, e o que já foi feito fica feito.

## Instalar

O APK é gerado pelo GitHub a cada mudança (`.github/workflows/feed-apk.yml`).
Do `master`, ele vai para a aba **Releases** (`feed-limpo.apk`). De outras
branches, fica como artefato na execução do workflow, na aba **Actions**.

## Compilar na mão

```bash
cd feed-android
./gradlew assembleDebug
# app/build/outputs/apk/debug/app-debug.apk
```
