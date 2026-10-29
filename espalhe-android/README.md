# Espalhe — app Android

**Para instalar:** abra no celular https://bahiense.github.io/projetoTeste/espalhe/
e toque em **Baixar o Espalhe** (ou direto:
https://github.com/bahiense/projetoTeste/releases/download/espalhe-apk-latest/espalhe.apk).
Na primeira abertura, um assistente pergunta em quais redes você publica, os
nomes dos perfis, e mostra um botão **Instalar** para cada app que faltar. Depois
disso, o Espalhe avisa quando há versão nova e se atualiza com um toque.

Publica o **seu** conteúdo em todos os seus perfis, sem mostrar o que os outros
postam. Você escolhe uma foto ou vídeo, marca os perfis (pode ter vários em cada
rede) e os formatos, vê como vai ficar em cada rede e envia um por um.

Redes: Instagram, Facebook, status do WhatsApp (e WhatsApp Business), TikTok,
YouTube (Shorts e 16:9), Kwai, Threads, X, LinkedIn e Pinterest. A lista, os
tamanhos e os formatos ficam em `app/src/main/assets/redes.js`.

## Como funciona

1. **Perfis** — cadastre cada conta: a rede, o nome e por qual app ela publica
   (Instagram ou Instagram Lite, WhatsApp ou WhatsApp Business, Facebook ou Meta
   Business Suite…).
2. **Publicar** — escolha a mídia (ou compartilhe da galeria para o Espalhe),
   escreva a legenda e marque perfis e formatos: post 4:5, 3:4 ou 1:1, Stories,
   Reels, status, Shorts…
3. **Como vai ficar** — uma prévia por formato, com a moldura de cada rede e, em
   vermelho, a área que fica atrás dos botões e do nome. Para cada tamanho dá para
   escolher "preencher a tela" (com zoom e arrastando para enquadrar) ou "mostrar
   inteira" (com fundo desfocado, preto ou branco).
4. **Enviar** — o app gera um arquivo por tamanho, na resolução exata
   (1080×1920, 1080×1350…), e cada botão abre o app da rede já com o arquivo. A
   legenda vai junto e também para a área de transferência, porque Instagram e
   TikTok ignoram o texto que chega pelo compartilhamento.

Fotos são recortadas e redimensionadas com `ImageDecoder`/`Canvas`; vídeos são
recodificados no próprio aparelho com o Media3 Transformer (H.264 + AAC, HDR
convertido para SDR). A conta do enquadramento é a mesma na prévia (`app.js`,
`recorte`) e no arquivo final (`Gerador.kt`, `recorte`).

## Resultados (métricas)

A aba **Resultados** mostra visualizações, curtidas, comentários e
compartilhamentos — no total, por rede, por perfil e por publicação feita pelo
Espalhe (cada envio é ligado ao post que apareceu naquele perfil logo depois).
Em cada post, **Quem comentou** lista os comentários; na Página do Facebook
aparece também quem reagiu.

**Quem curtiu não dá:** Instagram, TikTok, YouTube e Threads só informam o total
de curtidas para apps de terceiros. Status do WhatsApp, Kwai, X (sem plano pago)
e LinkedIn pessoal não têm API de métricas.

Cada perfil é ligado à API da sua rede, em **Perfis → (o perfil) → Métricas**.
O passo a passo de cada rede aparece ali mesmo; o resumo:

| Rede | Como liga | Precisa |
|---|---|---|
| Instagram | token colado | conta **Criador** ou **Empresa** (grátis); app em developers.facebook.com com "API do Instagram com login do Instagram"; a conta como Testador do Instagram |
| Threads | token colado | app com o caso de uso "API do Threads"; você como Testador do Threads |
| Facebook (Página) | token colado | token do Explorador da API do Graph, estendido no Depurador |
| YouTube | login do Google | `googleClienteId` em `gradle.properties` (abaixo) |
| TikTok | login do TikTok | app em developers.tiktok.com com Login Kit + sandbox; chaves digitadas no app |

Os tokens ficam só no lado nativo (`Metricas.kt`, SharedPreferences privadas);
a página nunca os vê. Os de Instagram e Threads valem 60 dias e são renovados
sozinhos toda semana.

### YouTube

Em `console.cloud.google.com`:

1. Crie um projeto e ative a **YouTube Data API v3** e a **YouTube Analytics API**.
2. Tela de consentimento OAuth: tipo Externo; adicione o seu e-mail como usuário
   de teste. Depois, **publique o app** (sem verificação mesmo): em modo de teste
   o Google derruba o acesso a cada 7 dias.
3. Credenciais → ID do cliente OAuth → **Android**: pacote `com.bahiense.espalhe`,
   SHA-1 da sua chave de assinatura (aparece no log do workflow, passo
   "Conferir a assinatura"); nas
   configurações avançadas, ative o **esquema de URI personalizado**.
4. Copie o ID para `googleClienteId` em `gradle.properties` e gere o APK de novo.

### TikTok

O TikTok só devolve o login para um endereço `https`. Esse endereço é a página
`espalhe-volta/` deste repositório, publicada pelo GitHub Pages
(`https://bahiense.github.io/projetoTeste/espalhe-volta/`, e só depois que o
código estiver no `master`): ela passa o código ao app por `espalhe://volta`.
Registre esse endereço como Redirect URI no Login Kit. As chaves do app (Client
key e secret) são digitadas no próprio Espalhe e não vão para o repositório.

## Apps das redes: as versões leves

Publicar passa pelo app de cada rede (é o único jeito de o post sair público em
todas, inclusive no status do WhatsApp). Quando nenhum app da rede está
instalado, o Espalhe sugere a versão Lite e tem o botão para baixar:

- Facebook Lite — https://play.google.com/store/apps/details?id=com.facebook.lite
- Instagram Lite — https://play.google.com/store/apps/details?id=com.instagram.lite
- TikTok Lite — https://play.google.com/store/apps/details?id=com.zhiliaoapp.musically.go

WhatsApp, YouTube, Kwai e Threads não têm versão Lite. Dá para tirar o ícone dos
apps da tela inicial e desligar as notificações deles: o Espalhe abre direto na
tela de publicar, sem passar pelo feed.

## Limites que vêm das redes

- **A conta usada é a que estiver ativa no app da rede.** Para publicar, o
  Espalhe não faz login em nada (a internet é só para ler as métricas): ele
  entrega o arquivo ao app oficial.
  Com duas contas no mesmo app, a lista de envio lembra qual deve estar ativa —
  troque lá antes de confirmar. Para Páginas do Facebook e contas comerciais do
  Instagram, o **Meta Business Suite** deixa escolher a conta na hora.
- **A última confirmação é no app da rede.** Instagram e Facebook perguntam se é
  Feed, Stories ou Reels; o WhatsApp mostra a lista com "Meu status" no topo.
- Publicar 100% automático, sem abrir cada app, só existe pelas APIs oficiais
  (Meta Graph API, TikTok Content Posting API), que exigem conta comercial,
  cadastro de desenvolvedor e aprovação de cada rede — e o status do WhatsApp não
  tem API nenhuma.

## Segurança

- **Assinatura fora do repositório.** A chave que assina o APK fica em dois
  segredos do GitHub (Settings → Secrets and variables → Actions):
  `ESPALHE_KEYSTORE_B64` (o arquivo .jks em base64) e `ESPALHE_KEYSTORE_SENHA`.
  O repositório é público; com a chave, qualquer um faria um APK que o Android
  instalaria por cima do Espalhe como atualização. Sem os segredos o workflow
  compila mas não publica. **Guarde uma cópia da chave**: perdê-la obriga a
  desinstalar e reinstalar (e ligar as contas de novo).
- **APK de release**, não de depuração (o de depuração deixa copiar os dados do
  app por cabo USB, sem senha).
- **Tokens cifrados** com AES-GCM por uma chave do Android Keystore (`Cofre.kt`);
  `allowBackup=false`. A página nunca vê os tokens.
- **Sem servidor.** O app fala só com as APIs oficiais das redes, por https.
- **Tela travada no código do APK:** CSP sem script externo nem requisição da
  página; links externos só https; a WebView não abre arquivos nem janelas.
- **"Compartilhar" para o Espalhe** só aceita foto ou vídeo de outro app
  (`content://`), nunca um caminho para os arquivos internos.
- **Logins** com `state` conferido e prazo de 15 minutos; o do Google com PKCE.
- **Bloqueio opcional** com a digital ou a senha do celular (aba Perfis →
  Segurança), que também esconde o app da lista de recentes e de capturas.

## Compilar

O workflow `.github/workflows/espalhe-apk.yml` gera o APK de release a cada push
e, no `master` e com os segredos de assinatura cadastrados, o publica na aba
Releases (tag `espalhe-apk-latest`). Localmente: `./gradlew assembleRelease`.
