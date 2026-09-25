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

## A cópia que sobrevive ao celular

Downloads sobrevive à desinstalação, mas não ao aparelho: celular perdido,
roubado ou trocado leva a cópia junto. Quem cobre isso é o Google Drive da
própria pessoa — `DriveBridge.kt`.

Há dois caminhos, e eles resolvem problemas diferentes:

- **Pelo menu do Android** (`compartilharArquivo`): escreve o JSON no cache,
  entrega por `FileProvider` e abre o `ACTION_SEND`, onde a pessoa escolhe
  "Salvar no Drive". Manual, mas funciona **sem cadastro nenhum**.
- **Automático, por OAuth** (`DriveBridge`): depois de conectar a conta uma vez,
  cada estudo novo e cada leitura marcada regravam o mesmo arquivo numa pasta
  `Leitura Bíblica` do Drive.

O que o código deliberadamente **não** faz:

- **Não vê a senha.** O login abre no navegador do aparelho, na página do
  Google. Não é escolha de estilo: o Google recusa OAuth em WebView
  (`disallowed_useragent`) exatamente porque ali o app poderia ler o que a
  pessoa digita.
- **Não alcança o resto do Drive.** O escopo é `drive.file`, que dá acesso só
  aos arquivos criados pelo próprio app. Isso também é o que faz a busca por
  nome ser segura: ela não enxerga arquivo de outro programa.
- **Não guarda senha de cliente.** Cliente OAuth de Android não tem; o que o
  protege é pacote + assinatura do APK, registrados no Google Cloud. A troca do
  código usa PKCE (S256) e confere o `state` na volta.

### Ligar a cópia automática (uma vez, de graça)

O `driveClienteId` em `gradle.properties` vem vazio: sem ele o recurso fica
desligado e a tela de Ajustes explica isto em português. Para ligar, em
`console.cloud.google.com`:

1. crie um projeto;
2. ative a **Google Drive API**;
3. na tela de consentimento OAuth, tipo **Externo**, **publique em produção**.
   Isto não é burocracia: com a tela em "Testes" o Google expira o
   `refresh_token` **a cada 7 dias**. Como `drive.file`, `openid` e `email` são
   escopos não sensíveis, não há verificação de app a passar;
4. em Credenciais, crie um **ID do cliente OAuth** tipo **Android**:
   - pacote `com.bahiense.biblia`
   - SHA-1 `D7:95:97:A7:59:00:42:A4:11:F0:DF:C7:22:4E:19:59:4D:1B:9F:FB`
     (a chave fixa do repositório — `keytool -list -v -keystore biblia.keystore`)
5. ponha o ID em `driveClienteId=` e gere o APK.

O redirecionamento é o ID do cliente ao contrário
(`com.googleusercontent.apps.…:/oauth2redirect`). Como um `android:scheme` de
manifesto não aceita curinga, ele entra por `manifestPlaceholders` no
`build.gradle.kts` — é por isso que o ID precisa estar no build, e não digitado
na tela.

Se a permissão expirar (`invalid_grant`), o app apaga o token guardado e pede
novo login em vez de tentar para sempre — com o recado de conferir se a tela de
consentimento está publicada.

## O mutirão, e o que ele quebrou

A tela de Ajustes tem um botão que manda o app gerar os 2.510 estudos da Bíblia
inteira sozinho, dia após dia, dentro da cota gratuita do Google (`js/lote.js`).
Isso cobra três coisas do lado nativo:

- **`manterAcordado`** (`FLAG_KEEP_SCREEN_ON`): tela apagada é WebView suspenso,
  e o mutirão pararia no meio do primeiro capítulo. A bandeira cai sozinha
  quando o app sai da frente.
- **`copiaAbrir` / `copiaEscrever` / `copiaFechar`**: com tudo estudado o backup
  passa de 30 MB, e mandá-lo como uma `String` pela ponte significa tê-lo duas
  vezes na memória — em JavaScript e em Java. Acima de 300 estudos a página
  escreve o arquivo aos poucos, direto num arquivo de trabalho no cache, e só
  então ele vai para Downloads.
- **`DriveBridge.enviarDoCache`**: sobe esse mesmo arquivo de trabalho direto do
  disco para o socket, com `setFixedLengthStreamingMode` — sem o texto voltar a
  passar pela página nem ser juntado na memória pelo `HttpURLConnection`.

Abaixo de 300 estudos nada disso entra em cena: o caminho antigo, de uma
tacada só, continua valendo por ser mais simples.

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
