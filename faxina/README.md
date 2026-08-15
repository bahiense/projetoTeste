# Faxina

App Android para achar o que está ocupando espaço no celular e limpar com
segurança. Feito para uso pessoal, instalado por APK — não passa pela Play Store.

## Sobre o "SDK da Samsung"

Ele não existe para esse fim, e vale registrar o porquê:

- **Device Care** ("Gerenciar armazenamento", nas Configurações) é um app de
  sistema privilegiado. As permissões que ele usa são reservadas a apps
  assinados com a chave da plataforma.
- **Knox SDK** é o único SDK público da Samsung. É licenciado para gestão
  corporativa de aparelhos e não expõe nada de limpeza de armazenamento.
- O que sobra é o **SDK padrão do Android**, que é o que este app usa. Com as
  permissões certas ele chega perto do Device Care, com dois limites reais
  descritos abaixo.

## O que o app faz

| Tela | O que entrega |
| --- | --- |
| Início | Uso real do aparelho e o resumo do que a varredura encontrou |
| Arquivos | Lixo, duplicados, arquivos grandes, baixados esquecidos e pastas vazias |
| Apps | Todo app instalado ordenado por tamanho — APK, dados e cache separados |
| Lixeira | O que foi removido, com restaurar e esvaziar |

**Duplicados** são comparados por conteúdo, não por nome. São três peneiras, da
mais barata para a mais cara: tamanho, assinatura das pontas (128 KB lidos), e
só então o hash completo. Um arquivo de 4 GB só é lido inteiro se existir outro
exatamente do mesmo tamanho com começo e fim idênticos.

**Nada é apagado direto.** O que você marca vai para `Faxina/Lixeira`, no mesmo
volume — mover é só renomear, então é instantâneo. O espaço só volta quando você
esvazia a lixeira, e a tela diz isso com todas as letras.

**A marcação automática é conservadora.** Vêm marcados só lixo e pastas vazias,
mais as cópias extras de cada grupo de duplicados (a mais antiga sempre fica).
Arquivos grandes e baixados antigos ficam desmarcados: são conteúdo seu, e a
decisão é sua.

## Os dois limites que nenhum app comum contorna

1. **`Android/data` e `Android/obb` são invisíveis** desde o Android 11, mesmo
   com "Acesso a todos os arquivos". É onde mora boa parte do cache dos apps.
2. **Nenhum app limpa o cache de outro.** `clearApplicationUserData` é reservado
   ao sistema. O Faxina mede e leva você direto à tela onde os botões existem.

Por isso a aba **Apps** importa tanto: em um aparelho cheio, quase todo o espaço
está em apps e nos dados deles, e é exatamente a fatia que a tela da Samsung não
lista.

## Permissões

Nenhuma das duas aparece no diálogo comum — as duas são chaves em telas de
Configurações, e o app tem um botão que leva direto a cada uma.

- **Acesso a todos os arquivos** (`MANAGE_EXTERNAL_STORAGE`): sem ela o app só
  enxerga a própria pasta.
- **Acesso de uso** (`PACKAGE_USAGE_STATS`): sem ela não dá para medir o tamanho
  dos apps instalados.

`MANAGE_EXTERNAL_STORAGE` é o motivo de o app não poder ir para a Play Store: o
Google só aceita essa permissão em gerenciadores de arquivos e antivírus.

## Instalar

O APK é gerado pelo GitHub Actions a cada push em `faxina/`. Baixe direto no
celular pela aba **Releases**, na tag `faxina-latest`.

A assinatura é fixa (`faxina.keystore`, versionado de propósito, mesma solução do
teleprompter): toda build sai assinada igual, então dá para instalar por cima da
versão anterior sem o erro "app não instalado". Não é uma chave secreta — serve
para estabilidade de assinatura, não para provar autoria.

## Compilar localmente

```sh
cd faxina
./gradlew assembleDebug
# app/build/outputs/apk/debug/app-debug.apk
```

Precisa do SDK do Android instalado e de `ANDROID_HOME` apontando para ele.
