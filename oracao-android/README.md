# Altar — app Android

O APK é o mesmo app web da pasta `oracao/`, embrulhado num WebView. Existe uma única
cópia do código: o Gradle copia `../oracao` para os assets na hora de compilar
(`copyWebApp` em `app/build.gradle.kts`).

## Por que não é só um WebView

O WebView do Android **não implementa a Web Speech API**. Dentro dele
`window.speechSynthesis` e `SpeechRecognition` simplesmente não existem — e um app que
ouve a oração para analisá-la, sem ouvir, não é nada. Embrulhar a página sem mais nada
produziria uma versão em que só dá para digitar o que se orou.

Por isso existe a ponte:

| Lado | Arquivo | O que faz |
|---|---|---|
| Nativo | `VozBridge.kt` | `TextToSpeech` para ler os exemplos, `SpeechRecognizer` para ouvir a oração |
| Web | `../oracao/js/ponte-android.js` | repõe `speechSynthesis` e `SpeechRecognition` com a forma da API do navegador |

O resto do app não sabe onde está rodando: `js/voz.js` continua chamando
`speechSynthesis.speak()` e `new SpeechRecognition()` como faria no Chrome. No navegador
comum a ponte sai pela porta na primeira linha.

Duas diferenças de comportamento que a ponte precisa acertar:

- `TextToSpeech.stop()` não avisa quem foi interrompido, enquanto o navegador dispara
  `onend` ao cancelar. A ponte encerra a fala do lado JavaScript, senão a leitura de um
  exemplo interrompida deixaria a página esperando um aviso que nunca chega.
- O `SpeechRecognizer` do Android encerra sozinho no silêncio — e silêncio faz parte de
  uma oração. Por isso o treino religa o reconhecimento até o aluno dizer que terminou, e
  soma o texto entre as rodadas.

## Detalhes que não são óbvios

- A página é servida por `https://appassets.androidplatform.net`, não por `file://`. O
  microfone só funciona em contexto seguro, e o endereço interno também dá uma origem
  estável para o progresso guardado não sumir entre versões.
- O manifesto declara `<queries>` para `RecognitionService`. Sem isso, a partir do Android
  11, `SpeechRecognizer.isRecognitionAvailable()` responde que não existe reconhecimento
  nenhum no aparelho.
- `RECORD_AUDIO` é pedido porque o `SpeechRecognizer` exige a permissão no app, mesmo com
  a captura acontecendo no serviço do sistema. **O app não grava áudio**: não existe
  `MediaRecorder` aqui, nada é salvo em arquivo e nada sai do aparelho. O que o app guarda
  é o texto transcrito, no `localStorage`, e só se o aluno deixar (Ajustes → Privacidade).
- A chave de assinatura (`altar.keystore`) está versionada de propósito, como nos outros
  apps deste repositório: a chave de depuração muda a cada máquina, e com assinatura
  diferente o Android recusa a atualização com "app não instalado". Ela mantém a assinatura
  estável, não prova autoria — para a Play Store seria preciso uma chave de verdade, fora
  do repositório.
- O botão voltar do Android navega o histórico da página (as telas são `#/hoje`,
  `#/treinar`…) e só fecha o app quando não há mais para onde voltar.

## Compilar

O APK sai pronto pelo GitHub a cada mudança em `oracao/` ou aqui
(`.github/workflows/oracao-apk.yml`); baixe em **Releases**. Na sua máquina, com o Android
SDK instalado:

```bash
cd oracao-android && ./gradlew assembleDebug
# o arquivo sai em app/build/outputs/apk/debug/
```

## Limitações

- O reconhecimento de fala do Android costuma precisar de internet. O resto do app —
  conteúdo, análise, programa, progresso — funciona offline.
- Aparelhos sem os serviços do Google podem não ter reconhecimento nenhum. Nesse caso o
  app avisa e cai na oração digitada depois, como no navegador sem suporte.
