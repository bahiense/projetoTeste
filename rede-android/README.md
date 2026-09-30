# Rede

App de Android que bloqueia sites adultos no próprio aparelho, pensado como um
**pacto com você mesmo**: você liga uma vez, oculta o ícone e dificulta que o
seu "eu" de um momento de fraqueza consiga achar e desligar o bloqueio.

O nome, o ícone e a notificação são neutros de propósito — nada ali anuncia o
que o app faz.

## Como funciona

O app sobe uma **VPN local** (nada sai do aparelho para um servidor nosso) que
intercepta **só o DNS** — a "lista telefônica" que traduz o nome do site no
endereço dele. Quando o celular pergunta o endereço de um domínio da lista, o
app responde "esse site não existe" e a página simplesmente não abre. Todo o
resto do tráfego segue normal, então a internet não fica lenta.

A lista embutida (`app/src/main/assets/lista.dat`) tem cerca de **950 mil
domínios** de conteúdo adulto, da lista pública mantida pelo
[The Block List Project](https://github.com/blocklistproject/Lists) (licença
MIT). Bloquear um domínio já bloqueia todos os subdomínios dele.

## Passo a passo no celular

1. Instale o `rede.apk`.
2. Abra o app uma vez e toque em **Ativar proteção**. O Android vai pedir
   permissão para criar a VPN — confirme.
3. (Muito recomendado) Deixe o bloqueio à prova de reinício: vá em
   **Ajustes › Rede e internet › VPN**, abra o app **Rede** e ligue
   **"VPN sempre ativa"** (e, se aparecer, "Bloquear conexões sem VPN"). É isso
   que faz o próprio Android reerguer o filtro no boot e impede que ele seja
   desligado facilmente.
4. Toque em **Concluir e ocultar o app**. O ícone some da gaveta de
   aplicativos. A proteção continua rodando.

## Limites honestos

Nenhum bloqueio que roda no próprio aparelho é impossível de burlar. Vale saber:

- **Ocultar o ícone** tira o app da gaveta, mas ele ainda aparece em
  **Ajustes › Aplicativos** (é por ali que se desinstala, se um dia precisar).
  Alguns fabricantes (Xiaomi, Samsung etc.) restringem esconder o ícone e podem
  mostrá-lo mesmo assim.
- O filtro é por **DNS**. Um navegador com "DNS seguro/DoH" ligado, um app com
  DNS embutido, ou uma VPN de terceiros por cima podem escapar do filtro.
  Ligar "VPN sempre ativa" com "bloquear conexões sem VPN" fecha boa parte
  dessas saídas.
- Quem tiver acesso às Configurações pode desligar a VPN ou desinstalar o app.
  A "VPN sempre ativa" torna isso mais chato, mas não impossível sem um
  aparelho gerenciado (device owner/MDM), que exige formatar o celular.

Ou seja: isto ergue uma barreira alta o suficiente para um momento de impulso,
não uma prisão inviolável.

## Como o APK é gerado

Toda alteração em `rede-android/` dispara o workflow
`.github/workflows/rede-apk.yml`, que compila o APK e publica o
`rede.apk` na aba **Releases** (tag `rede-apk-latest`), para baixar direto no
celular.

A assinatura é fixa (chave guardada no repositório) só para o Android aceitar
atualizações por cima da versão anterior — não é uma chave de segredo.
