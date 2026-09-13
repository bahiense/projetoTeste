# O Segundo Antes — Android

O mesmo app que está em [`/gatilhos`](../gatilhos), embrulhado num APK.

## Por que existe

Na tela inicial pelo navegador o app já funciona, mas depende de o Chrome
manter os dados do site — e, principalmente, não consegue avisar nada com o
navegador fechado. O programa é diário: sem lembrete, ele morre na segunda
semana. O APK resolve as duas coisas.

## Como é por dentro

- **Uma Activity com um WebView**, servindo `/gatilhos` de dentro do APK por
  `https://appassets.androidplatform.net`. O endereço interno dá à página uma
  origem estável, para os 21 dias marcados e o registro de episódios não
  sumirem.
- **Sem permissão de internet.** O conteúdo todo vem no APK e o que o usuário
  escreve nunca sai do aparelho.
- **Lembrete diário** pelo AlarmManager, marcado pela própria página através da
  `LembreteBridge`. O plano fica em SharedPreferences porque quem remarca
  depois do disparo e depois do boot não pode abrir o WebView para perguntar.

O conteúdo não é duplicado: `copyWebApp` copia `/gatilhos` para os assets na
hora de compilar, então corrigir o texto do programa vale para a página e para
o APK de uma vez só.

## Compilar

O APK sai pronto no GitHub Actions
([workflow](../.github/workflows/segundo-antes-apk.yml)) a cada push. Para
compilar na mão, com o Android SDK instalado:

```sh
cd gatilhos-android
./gradlew assembleDebug
# app/build/outputs/apk/debug/app-debug.apk
```

A chave de assinatura está no repositório de propósito, pelo mesmo motivo do
Fluência e do teleprompter: sem uma chave fixa, cada build sairia com
assinatura diferente e o Android recusaria a atualização com "app não
instalado". Ela não protege nada — se um dia o app for para a Play Store, é
preciso gerar uma chave de verdade e guardá-la fora daqui.
