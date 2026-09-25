# Leitura Bíblica — app Android

O APK é o mesmo app web da pasta `biblia/`, embrulhado num WebView. Existe uma
única cópia do código: o Gradle copia `../biblia` para os assets na hora de
compilar (`copyWebApp` em `app/build.gradle.kts`) — incluindo `data/texto`, os
132 arquivos do texto bíblico, que é o que faz a leitura funcionar sem internet
desde a primeira abertura. São ~7,4 MB de assets, e por isso o APK passa dos
9 MB.

## Por que não é um WebView pelado

**A página é servida por `https://appassets.androidplatform.net`, não por
`file://`.** Disso dependem três coisas do app:

| O que | Por que precisa de origem https |
|---|---|
| O plano de leitura (`localStorage`) | uma origem `file://` não é estável: o progresso pode sumir |
| Os estudos (`IndexedDB`) | idem, e o IndexedDB é onde eles moram |
| Gerar estudo pela API | o navegador só deixa a chamada sair de contexto seguro |

**Duas coisas o WebView não faz**, e a `ArquivoBridge` repõe:

| Lado | Arquivo | O que faz |
|---|---|---|
| Nativo | `ArquivoBridge.kt` | grava o backup na pasta Downloads; regrava a cópia automática; abre o menu de compartilhar |
| Web | `../biblia/js/ponte-android.js` | troca `B.ui.baixar` e `B.ui.compartilhar` pela ponte |
| Web | `../biblia/js/copia.js` | agenda a cópia automática e restaura a partir dela |

## A cópia que sobrevive à desinstalação

O Android apaga a pasta privada do app quando ele é desinstalado — com
`localStorage`, `IndexedDB` e tudo. Por isso `salvarBackup` grava em
**Downloads**, via MediaStore: essa pasta é do usuário e continua lá.

Dois detalhes que o código trata e não são óbvios:

- **Sobrescrever, não acumular.** `acharEmDownloads` procura o arquivo pelo nome
  e reabre com `"wt"`; sem o truncamento, um backup menor deixaria o fim do
  arquivo antigo colado no novo.
- **Ler de volta nem sempre é possível.** O MediaStore amarra o arquivo a quem o
  criou. Depois de reinstalar, o app é outro dono aos olhos do sistema e
  `lerBackup` volta vazio — daí a tela pedir um toque no seletor. A alternativa
  seria `MANAGE_EXTERNAL_STORAGE`, desproporcional aqui.

No navegador comum a ponte sai pela porta na primeira linha e tudo continua
como estava — `<a download>` e `navigator.share`.

O terceiro buraco é o seletor de arquivos: sem `onShowFileChooser` no
`WebChromeClient`, o `<input type="file">` de "restaurar backup" não abre nada.
Está resolvido no `MainActivity`.

## Detalhes que não são óbvios

- **Baixar backup é um blob.** No navegador o arquivo sai de `URL.createObjectURL`
  com `<a download>`. O WebView ignora `blob:` silenciosamente: o botão não daria
  erro, simplesmente não faria nada — o pior jeito de um botão de backup falhar.
  Por isso o conteúdo atravessa a ponte como texto.
- **Link externo abre fora.** As fontes consultadas no fim de um estudo e o
  console da Anthropic abrem no navegador do aparelho. Dentro do WebView virariam
  uma página sem barra de endereço e sem volta.
- **Tema escuro.** Sem `setAlgorithmicDarkeningAllowed`, o WebView ignora o tema
  do sistema e a página, que segue `prefers-color-scheme`, ficaria sempre clara.
- **O service worker fica de fora do APK.** Os arquivos já estão no aparelho; um
  cache por cima só serviria para servir código velho depois de atualizar o app.
- **Chave de assinatura no repositório, de propósito.** A chave de depuração que
  o Gradle cria muda de máquina para máquina; cada build no GitHub sairia com
  assinatura diferente e o Android recusaria a atualização com "app não
  instalado" — obrigando a desinstalar, e desinstalar leva a leitura junto. Não é
  chave secreta: serve para manter a assinatura estável, não para provar autoria.

## A IA dentro do APK

No APK não existe login do Claude para a página aproveitar, então há três
caminhos para ter estudo aqui:

1. **Chave gratuita do Google Gemini** em Ajustes (aistudio.google.com/apikey,
   sem cartão) — o app gera sozinho, dentro do limite diário do plano grátis.
   É o único caminho de API no app: os pagos foram retirados.
2. **Gerar na versão que roda dentro do Claude** (sem chave, pelo seu plano),
   baixar o backup lá e restaurar aqui: os estudos vão junto no arquivo.
3. **Copiar o pedido pronto**, colar no app do Claude e trazer a resposta de
   volta com "colar um estudo pronto".

## Instalar

O APK é gerado pelo GitHub a cada mudança no código
(`.github/workflows/biblia-apk.yml`). Baixe o `leitura-biblica.apk` na aba
**Releases** do repositório, abra pelo celular e confirme a instalação. O Android
avisa que o app não veio da Play Store — é esperado, porque o arquivo foi
compilado direto do código.

## Compilar na mão

```bash
cd biblia-android
./gradlew assembleDebug
# app/build/outputs/apk/debug/app-debug.apk
```
