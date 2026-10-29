# Espalhe — app Android

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

## Limites que vêm das redes

- **A conta usada é a que estiver ativa no app da rede.** O Espalhe não faz login
  em nada (nem tem permissão de internet): ele entrega o arquivo ao app oficial.
  Com duas contas no mesmo app, a lista de envio lembra qual deve estar ativa —
  troque lá antes de confirmar. Para Páginas do Facebook e contas comerciais do
  Instagram, o **Meta Business Suite** deixa escolher a conta na hora.
- **A última confirmação é no app da rede.** Instagram e Facebook perguntam se é
  Feed, Stories ou Reels; o WhatsApp mostra a lista com "Meu status" no topo.
- Publicar 100% automático, sem abrir cada app, só existe pelas APIs oficiais
  (Meta Graph API, TikTok Content Posting API), que exigem conta comercial,
  cadastro de desenvolvedor e aprovação de cada rede — e o status do WhatsApp não
  tem API nenhuma.

## Compilar

O workflow `.github/workflows/espalhe-apk.yml` gera o APK a cada push e o publica
na aba Releases (tag `espalhe-apk-latest`). Localmente: `./gradlew assembleDebug`.
A chave `espalhe.keystore` fica no repositório de propósito, para toda build ter a
mesma assinatura e instalar por cima da anterior.
