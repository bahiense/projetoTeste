# Fluência 180 — app Android

O APK é o mesmo app web da pasta `fluencia/`, embrulhado num WebView. Existe uma
única cópia do código: o Gradle copia `../fluencia` para os assets na hora de
compilar (`copyWebApp` em `app/build.gradle.kts`).

## Por que não é só um WebView

O WebView do Android **não implementa a Web Speech API**. Dentro dele
`window.speechSynthesis` e `SpeechRecognition` simplesmente não existem — e um
app de treino de fala sem falar e sem ouvir não é nada. Embrulhar a página sem
mais nada produziria uma versão muda, que só aceita resposta digitada.

Por isso existe a ponte:

| Lado | Arquivo | O que faz |
|---|---|---|
| Nativo | `VozBridge.kt` | `TextToSpeech` para falar, `SpeechRecognizer` para ouvir |
| Web | `../fluencia/js/ponte-android.js` | repõe `speechSynthesis` e `SpeechRecognition` com a mesma forma da API do navegador |

O resto do app não sabe onde está rodando: `js/voz.js` continua chamando
`speechSynthesis.speak()` e `new SpeechRecognition()` como faria no Chrome.
No navegador comum a ponte não faz nada — o `ponte-android.js` sai pela porta
logo na primeira linha se não houver app nativo.

Duas diferenças de comportamento que a ponte precisa acertar:

- `TextToSpeech.stop()` não avisa quem foi interrompido, enquanto o navegador
  dispara `onend` ao cancelar. A ponte encerra a fala do lado JavaScript, senão
  uma sequência de shadowing interrompida ficaria travada esperando um aviso
  que nunca chega.
- O `SpeechRecognizer` do Android encerra sozinho no silêncio. É o mesmo
  comportamento do Chrome, e a arena já religa o reconhecimento até o
  cronômetro zerar.

## Detalhes que não são óbvios

- A página é servida por `https://appassets.androidplatform.net`, não por
  `file://`. O microfone e o `MediaRecorder` só funcionam em contexto seguro, e
  o endereço interno também dá uma origem estável para o progresso salvo não
  sumir entre versões.
- O manifesto declara `<queries>` para `RecognitionService`. Sem isso, a partir
  do Android 11, `SpeechRecognizer.isRecognitionAvailable()` responde que não
  existe reconhecimento nenhum no aparelho.
- A chave de assinatura (`fluencia.keystore`) está versionada de propósito, como
  no teleprompter: a chave de depuração muda a cada máquina, e com assinatura
  diferente o Android recusa a atualização com "app não instalado". Ela mantém a
  assinatura estável, não prova autoria — para a Play Store seria preciso uma
  chave de verdade, fora do repositório.
- O botão voltar do Android navega o histórico da página (as telas são `#/hoje`,
  `#/pronuncia`…) e só fecha o app quando não há mais para onde voltar.

## Compilar

O APK sai pronto pelo GitHub a cada mudança em `fluencia/` ou aqui
(`.github/workflows/fluencia-apk.yml`); baixe em **Releases**. Na sua máquina,
com o Android SDK instalado:

```bash
cd fluencia-android && ./gradlew assembleDebug
# o arquivo sai em app/build/outputs/apk/debug/
```

## Limitações

- O reconhecimento de fala do Android costuma precisar de internet. O resto do
  app — conteúdo, correção, progresso, áudio — funciona offline.
- Aparelhos sem os serviços do Google podem não ter reconhecimento nenhum. Nesse
  caso o app avisa e cai na resposta digitada, como no navegador sem suporte.
