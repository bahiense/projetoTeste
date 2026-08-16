# Faxina

App Android para achar o que está ocupando espaço no celular e limpar com
segurança. Feito para uso pessoal, instalado por APK — não passa pela Play Store.

## Visual

Material 3 com **cor dinâmica** (Material You): no Android 12+ a paleta é
extraída do papel de parede, então o app combina com o resto do aparelho e com
a One UI em vez de trazer uma cor fixa que envelhece. Abaixo do 12 vale a paleta
escura própria. Cantos mais arredondados, superfícies em camadas tonais,
grupos que abrem e fecham com mola, e desenho ponta a ponta atrás das barras do
sistema.

A abertura usa a **tela de splash oficial**: no Android 12+ quem a desenha é o
sistema, com o ícone centrado; a biblioteca de compatibilidade leva o mesmo
comportamento até o Android 8.

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
| Arquivos | Duas vistas do mesmo resultado: **por problema** e **por origem** |
| Apps | Todo app instalado, com filtros por uso, idade e origem |
| Cache | Limpeza geral de cache e a lista de quem mais ocupa |
| Lixeira | O que foi removido, com restaurar e esvaziar |

**Cada arquivo aparece com miniatura**: a foto, o primeiro quadro do vídeo ou a
capa embutida do MP3. `IMG_20231104_193045.jpg` é uma péssima base para decidir
se algo pode sumir.

A aba Arquivos tem duas apresentações, no botão à direita do seletor:

- **Lista** (☰) — nome, caminho, tamanho e o motivo de o arquivo estar ali.
  Toque na linha marca; toque na miniatura abre o arquivo.
- **Grade** (▦) — miniaturas grandes, três por linha, com a extensão no canto
  superior e o tamanho no inferior. Toque marca, toque longo abre. Para varrer
  centenas de fotos decidindo pela imagem, a lista com miniatura de 48 dp não
  serve.

A sigla do tipo é colorida por categoria — imagem em verde-água, vídeo em lilás,
áudio em âmbar. Numa grade de trinta ladrilhos, ler "MP4" em cada um é trabalho;
enxergar que três deles são lilases não é. E vídeo costuma ser o que carrega o
peso, então achá-lo de relance é metade da tarefa.

### As duas vistas da aba Arquivos

**Por problema** — lixo, duplicados, arquivos grandes, baixados esquecidos e
pastas vazias. Responde "o que dá para tirar".

**Por origem** — de onde a mídia veio. Responde "de onde veio o espaço", que é
outra pergunta, e serve a um propósito além de organizar: **a origem prevê o
risco melhor que qualquer outro sinal barato.**

| Origem | Por que importa |
| --- | --- |
| 📸 Feito neste celular | Câmera e microfone. Não existe em nenhum outro lugar — nunca vem marcado |
| 🖼 Capturas de tela | Feitas por você, mas quase sempre para um dia só |
| 💬 Recebido em conversas | WhatsApp, Telegram, Bluetooth. Enquanto a conversa existir, baixa de novo |
| 📤 Cópias do que você enviou | Segunda via que o WhatsApp guarda. O original segue na câmera — **vem marcado** |
| ⬇️ Baixado da internet | Se precisar, baixa de novo |
| 🧩 Guardado por aplicativos | Figurinhas e capas que apps salvaram sozinhos |

A classificação sai de caminho e nome, com duas ordens que fazem toda a
diferença: "enviado" é testado antes de "recebido", porque a pasta `Sent` fica
dentro da pasta de mídia do WhatsApp; e "captura" antes de "câmera", porque em
vários aparelhos as capturas moram dentro de `DCIM`. O sufixo `-WA0001` no nome
identifica mídia do WhatsApp mesmo depois de copiada para fora das pastas dele.

Nada disso abre o arquivo. Ler o EXIF de cada foto para confirmar a marca do
aparelho daria uma certeza a mais e custaria uma varredura muitas vezes mais
lenta — caminho e nome já acertam a enorme maioria.

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

## A aba Apps

Ordenar por **espaço**, **cache**, **mais usado**, **menos usado**, **instalado
agora** ou **instalado há mais tempo**; mostrar **os seus**, **os do sistema** ou
**todos**; e um filtro de **parados há 30 dias**.

O uso vem de `queryAndAggregateUsageStats` numa janela de um ano — a mesma
permissão "Acesso de uso" que já era necessária para medir tamanho. Cada linha
diz quando o app foi aberto pela última vez e quando foi instalado.

Ordenar por "menos usado" coloca no topo quem tem zero tempo registrado, que é
exatamente quem se procura: app grande que você nunca abre.

A tela escreve **"sem registro de uso"**, e não "nunca aberto". O sistema
descarta o histórico depois de um tempo, e as duas coisas são diferentes —
afirmar a segunda seria mentir com confiança.

### Assinaturas mensais: o filtro que não existe

Nenhum app consegue ver as assinaturas de outro. A compra vive na conta Google e
no servidor de quem vende, e a API de faturamento do Android responde apenas
sobre o próprio app que a chama.

Dava para embutir uma lista de suspeitos conhecidos — Netflix, Spotify e afins —
e chamar aquilo de filtro. Seria adivinhar o que o usuário assina e errar em
silêncio, que é pior que não ter o recurso. A aba leva à lista real, na Play
Store.

## Cache: como o app apaga sem ser privilegiado

`clearApplicationUserData` e `deleteApplicationCacheFiles` são reservados a apps
assinados com a chave da plataforma. O caminho óbvio está fechado — mas existe um
caminho público que chega ao mesmo lugar:

> `StorageManager.allocateBytes(uuid, n)` diz ao sistema "vou escrever n bytes".
> Para atender ao pedido, o próprio Android apaga arquivos de cache de quem
> estiver ocupando espaço.

A segurança disso não depende de o Faxina acertar quais arquivos são
descartáveis. **Quem escolhe é o sistema operacional**, e ele só considera
descartável o que está em diretório de cache. Conversas, fotos, documentos,
downloads, logins e configurações ficam fora por construção. É a mesma rotina que
o Android executa sozinho quando o armazenamento enche.

O que essa API não faz é escolher um app específico. Para isso existe o botão
**Limpar** de cada linha, e ele tem dois modos:

- **Sem nada ligado** (padrão): abre a tela de informações do app em
  Configurações, de onde faltam dois toques — "Armazenamento" e "Limpar cache".

  Houve uma tentativa de encurtar isso chamando atividades internas do app de
  Configurações antes da intent pública. Deu errado de um jeito instrutivo: a
  One UI **tem** `Settings$StorageUseActivity`, mas ela é a *lista* de apps por
  armazenamento, não a tela de um app. Como abria sem erro, era sempre a
  escolhida, e o resultado era cair em "Aplicativos" e ter de procurar o app na
  mão — mais passos do que antes de "otimizar". Palpite que abre a tela errada
  não é atalho.

  Ficou só `ACTION_APPLICATION_DETAILS_SETTINGS`, que é documentada e sempre cai
  na tela do app pedido. Vai junto o extra `:settings:fragment_args_key`, que
  pede o realce da linha de armazenamento e é ignorado sem efeito onde não for
  entendido.
- **Com o serviço de acessibilidade ligado**: o Faxina aperta o botão. Abre a
  tela, toca em "Armazenamento", toca em "Limpar cache" e volta. E com
  **"Limpar de uma vez"** ele percorre a lista inteira sozinho — até 20 apps em
  sequência, sem parar entre um e outro, voltando ao Faxina no fim.

Quem abre cada app seguinte é o próprio serviço, não a interface: com o Faxina
em segundo plano durante a fila, ele não conseguiria iniciar telas.

### As travas do serviço de acessibilidade

Automação de interface é ferramenta afiada, e um app de limpeza que pede
acessibilidade sem explicar o que fará com ela merece desconfiança. As três
travas:

1. **Só enxerga Configurações.** O `android:packageNames` do XML do serviço
   limita quais apps geram evento para ele. Não é promessa do código: o sistema
   não entrega as telas de nenhum outro app a este serviço.
2. **Só age quando pedido.** Fora da janela de 15 segundos aberta por um toque
   em "Limpar", todo evento é descartado sem olhar.
3. **Nunca toca em "Limpar dados".** O reconhecimento exige a palavra "cache" e
   recusa qualquer texto com "dados"/"data". "Armazenamento e cache" é tratado
   como linha de navegação, não como botão, porque não começa com verbo. Perder
   cache custa segundos de recarga; perder dados custa conversas e logins.
4. **Solta o aparelho se você sair.** Antes de abrir o próximo app da fila, o
   serviço confere se a tela ainda é de Configurações — como o `packageNames`
   já o restringe, uma tela de outro app aparece para ele como vazia. Se você
   saiu, a fila termina ali. Automação que reabre Configurações por cima de
   quem saiu não é ajuda, é sequestro.
5. **A fila tem fim.** Cada app tem 9 segundos para entregar o botão; passou
   disso, é pulado. E o lote para em 20 apps, para a espera não passar de dois
   minutos.

O serviço vem desligado e o app funciona inteiro sem ele.

A tela mostra a estimativa do sistema antes e o número **real** depois, medido
como espaço livre antes menos depois. Se o Android decidir não apagar nada, a
tela diz isso em vez de fingir sucesso.

## Os dois limites que continuam de pé

1. **`Android/data` e `Android/obb` são invisíveis** desde o Android 11, mesmo
   com "Acesso a todos os arquivos". A varredura de arquivos não entra lá — a
   limpeza de cache acima chega, porque quem executa é o sistema.
2. **Não existe API para limpar o cache de um app escolhido a dedo.** O botão só
   existe dentro de Configurações — o serviço de acessibilidade aperta esse
   botão, mas não substitui uma API que não há.

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

Os APKs são gerados pelo GitHub Actions a cada push em `faxina/`. Baixe direto no
celular pela aba **Releases**, na tag `faxina-latest`.

| Arquivo | Diferença |
| --- | --- |
| `faxina.apk` | Versão padrão. Instala sem atrito. |
| `faxina-com-acessibilidade.apk` | Mesma coisa, mais o serviço que aperta "Limpar cache" sozinho. **Bloqueado pelo Play Protect** — ver abaixo. |

### Por que a versão completa não instala

O Play Protect recusa qualquer APK vindo de fora da Play Store que declare
`BIND_ACCESSIBILITY_SERVICE`, com a mensagem "O app foi bloqueado para proteger
seu dispositivo". Não é falso positivo nem um bug a contornar no código: é uma
checagem deliberada do Google, e **o Brasil foi o primeiro país onde ela entrou no
ar**, porque acessibilidade é o vetor preferido dos trojans bancários. O diálogo
não oferece "instalar mesmo assim".

Por isso a versão padrão é a que sai sem o serviço: o app inteiro funciona sem
ele, e o botão de cada app apenas abre a tela certa em vez de apertar o botão.

Para instalar a versão completa mesmo assim:

1. Play Store → foto do perfil → **Play Protect** → engrenagem
2. Desligue **Analisar apps com o Play Protect**
3. Instale o `faxina-com-acessibilidade.apk`
4. **Religue a verificação** — ela continua valendo para o app já instalado

O passo 4 não é formalidade. Com a verificação desligada, todo APK instalado
nesse intervalo passa sem checagem alguma.

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
