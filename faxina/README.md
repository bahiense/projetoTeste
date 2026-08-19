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
| Apps | Todo app instalado, com filtros por uso e idade, e desinstalação |
| Cache | Limpeza geral de cache e a lista de quem mais ocupa |
| Lixeira | O que foi removido, em miniaturas, com restaurar e esvaziar |

**Cada arquivo aparece com miniatura**: a foto, o primeiro quadro do vídeo ou a
capa embutida do MP3. `IMG_20231104_193045.jpg` é uma péssima base para decidir
se algo pode sumir.

**Busca e ordenação** ficam no alto da aba Arquivos. A caixa filtra por nome
dentro de todos os grupos ao mesmo tempo e abre sozinha os que tiverem
resultado — buscar e não ver nada porque tudo continua fechado é a maneira mais
rápida de concluir que a busca está quebrada. As etiquetas ao lado ordenam por
**maiores**, **mais novos**, **mais antigos** ou **nome**, e "maiores" é o
padrão porque é a ordem que resolve o problema em menos toques.

**"As pastas do aparelho"**, no Início, soma o que existe dentro de cada pasta e
lista as maiores, com barra proporcional. A soma sobe até três níveis, e uma
pasta filha substitui a mãe quando responde por quase todo o peso dela: sem essa
regra, `WhatsApp`, `WhatsApp/Media` e `WhatsApp/Media/WhatsApp Video` ocupariam
três linhas para dizer a mesma coisa uma vez.

São **duas listas**, na chave acima do cartão, e a segunda não é uma variação da
primeira:

- **Que mais pesam** (corte de 50 MB) — onde está o espaço.
- **Com mais arquivos** (corte de 200 arquivos) — onde está a bagunça.

Quase nunca são a mesma pasta, e é esse o motivo de existirem separadas. Dez
vídeos ocupam gigabytes em dez arquivos e não atrapalham ninguém; trinta mil
miniaturas ocupam pouco, tornam a pasta impossível de revisar à mão e costumam
ser exatamente o tipo de coisa que ninguém escolheu guardar. O número que ordena
a lista é o que aparece grande em cada linha, para a leitura bater com a barra
ao lado.

**Tocar numa pasta abre o conteúdo dela em miniaturas grandes**, entrando nas
subpastas, com seleção e envio para a lixeira. A grade e não a lista, porque
aqui se decide olhando: esta tela é uma listagem crua — nada é classificado,
nada vem pré-marcado, nenhum palpite é dado. A lista de pastas responde *onde*
está o espaço; esta responde *o quê*, que é a única resposta que autoriza
apagar.

O teto é de 3.000 arquivos por pasta, e o corte acontece **depois** da
ordenação, para que o teto guarde os maiores e não os primeiros que o sistema
de arquivos entregou. O cabeçalho continua mostrando a contagem e o peso reais,
com a ressalva de quantos estão à vista. A seleção é local e separada da aba
Arquivos: apagar o que se escolheu aqui não pode levar junto o que ficou
marcado lá.

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
**todos**; e o filtro **Esquecidos**, descrito abaixo.

O uso vem de `queryAndAggregateUsageStats` numa janela de um ano — a mesma
permissão "Acesso de uso" que já era necessária para medir tamanho. Cada linha
diz quando o app foi aberto pela última vez e quando foi instalado.

Ordenar por "menos usado" coloca no topo quem tem zero tempo registrado, que é
exatamente quem se procura: app grande que você nunca abre.

A tela escreve **"sem registro de uso"**, e não "nunca aberto". O sistema
descarta o histórico depois de um tempo, e as duas coisas são diferentes —
afirmar a segunda seria mentir com confiança.

### O detalhe de cada app, e a metade que ninguém vê

Tocar num app abre uma tela que separa duas coisas que a lista misturava.

**O que o sistema informa** — APK, dados e cache, três totais fechados. A
composição da área privada (`/data/data/<pacote>` e `Android/data/<pacote>`) não
é legível por app nenhum: a primeira nunca foi, e a segunda deixou de ser no
Android 11. Quantas fotos ou bancos de dados existem lá dentro é informação que
o sistema não entrega — e inventar essa divisão seria chute apresentado como
dado.

**Arquivos fora da área privada** — esses sim listados por tipo (imagens,
vídeos, áudio, documentos, outros), com contagem, tamanho e seleção para mandar
à lixeira. Cada grupo tem um botão **Ver** que abre os arquivos dele na mesma
grade de miniaturas do conteúdo de pasta, maiores primeiro: "9296 imagens" diz
quanto pesa e não diz nada sobre o que pode sair, e só a miniatura diz. Marcar
o grupo inteiro e olhar o que tem dentro são intenções diferentes, então são
alvos diferentes na linha — apagar dez mil arquivos porque o toque marcou tudo
é o tipo de acidente que a lixeira conserta e o susto não. Saem de `Android/media/<pacote>`, que **é** legível — e é justamente
por isso que o WhatsApp e outros passaram a guardar mídia lá — mais as pastas
históricas na raiz (`WhatsApp/`, `Telegram/`, `Pictures/Instagram/`…), que muita
gente ainda tem cheias anos depois.

A exclusão daqui usa um caminho separado da seleção da aba Arquivos: apagar os
arquivos de um app não pode levar junto o que estiver marcado na outra tela.

### Apps esquecidos

O cartão no topo da aba cruza duas informações que o Android tem separadas e
nunca junta: **quando cada app foi aberto pela última vez** e **quanto cada um
ocupa**. Um app de 3 GB usado ontem é espaço bem gasto; o mesmo app parado há
seis meses é o candidato número um a sair.

São dois cortes, e os dois existem para o cartão não virar ruído:

- **90 dias sem abrir.** Três meses cobrem uso sazonal — app de viagem, de
  imposto de renda, do banco que se abre de vez em quando. Abaixo disso o
  alarme seria falso com frequência demais.
- **20 MB no mínimo.** Uma lista de vinte apizinhos de 4 MB parados desde
  sempre ensina o usuário a ignorar o cartão.

Apps sem registro nenhum de uso entram na conta: a janela do
`UsageStatsManager` é de um ano, então "sem registro" já significa "não foi
aberto no último ano".

### Desinstalar

O botão fica na tela de detalhe de cada app instalado por você, ao lado de
"Configurações". Ele dispara `ACTION_DELETE`, que **não desinstala nada
sozinho**: abre o diálogo de confirmação do próprio Android, com o nome do app
na tela. O Faxina não tem — nem poderia ter — o poder de remover um app sem
essa confirmação.

Para apps de fábrica o botão não aparece, porque não existe desinstalação: o
texto no lugar dele aponta o "Desativar" de Configurações, que não devolve o
espaço do APK mas interrompe o acúmulo de dados.

Desinstalar é a única operação que recupera os números inteiros da linha —
APK e dados privados. Limpar cache mexe na menor das três parcelas, e a área
privada de um app não é acessível a nenhum outro.

## Quanto já foi liberado

A tela inicial mostra um total acumulado, e ele obedece a uma regra estrita:
**só entra o que virou espaço livre de verdade.** Esvaziar a lixeira conta;
limpar cache conta. Mandar arquivo para a lixeira **não** conta, porque naquele
momento o byte continua exatamente onde estava, só que em outra pasta.

Aplicativos de limpeza costumam somar tudo que passa pela tela e chegar a
números impossíveis. Um contador que mente é pior que contador nenhum: ensina o
usuário a ignorar o próprio app.

## Diagnóstico

Uma lista de conferências no espírito da "Assistência do aparelho" da Samsung,
alcançável pelo cartão no topo da tela inicial. A régua é simples: **cada item
sai de uma API pública, e o que não sai não vira linha verde decorativa.** Uma
verificação que sempre passa porque não mede nada é pior que verificação nenhuma.

O que ele confere: armazenamento, memória do aparelho, cache acumulado,
aplicativos parados, lixeira do Faxina, **quem tem acesso à sua tela** e **quem
tem poder de administrador**.

As duas últimas são as que mais valem. Um serviço de acessibilidade ativo lê tudo
que aparece na tela e pode tocar por você — é o vetor dos golpes bancários — e a
lista de quem o tem é pública. Isso é uma verificação de segurança de verdade,
diferente de um "nenhum malware detectado" que um app sem base de assinaturas não
tem como afirmar.

### As quatro que o Device Care faz e este app não

Estão escritas na própria tela, com o motivo:

| Verificação | Por que não |
| --- | --- |
| Bateria por app | Não há API pública. O que dá para medir é tempo de tela, que é outra coisa |
| Falhas de outros apps | Cada app só enxerga os próprios encerramentos |
| Memória por app | Sumiu no Android 5 — sobra o total do aparelho |
| Notificações em excesso | Exigiria leitura de notificações, que o Play Protect bloqueia em APK, igual à acessibilidade |

E **"fechar apps em segundo plano" ficou de fora de propósito**, não por
impedimento: `killBackgroundProcesses` é chamável. Só que o Android relança o que
foi fechado em seguida, gastando mais bateria do que economizou. É a otimização
que parece útil na tela e atrapalha no aparelho — o tipo de teatro que separa um
app de limpeza sério dos outros.

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

Essa limpeza geral também está na **barra de notificações**, como bloco de
Configurações Rápidas: dois arrastos para baixo e um toque, sem abrir o app —
e o bloco já mostra quanto há para liberar antes de você tocar. É a operação que
mais se repete e a única que não exige nenhuma escolha, então é a única que faz
sentido colocar lá. Do Android 13 em diante o botão "Adicionar o bloco" na aba
Cache pede a instalação pelo diálogo oficial do sistema; antes disso não existe
API para isso, e o app apenas ensina o caminho pelo lápis de editar.

O bloco usa `BIND_QUICK_SETTINGS_TILE`, que não incomoda o Play Protect — ele
vive na versão padrão, ao contrário do serviço de acessibilidade.

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

## Ver antes de apagar, em toda tela que lista arquivo

A regra vale sem exceção: **em nenhum lugar do app se decide sobre um arquivo
sem poder olhar para ele.** Uma contagem — "9.296 imagens, 586 MB" — diz quanto
pesa e não diz nada sobre o que pode sair. Só a imagem diz.

As quatro telas que listam arquivos abrem em grade de miniaturas grandes, com a
lista a um toque no seletor ☰ / ▦:

| Onde | Como se chega |
| --- | --- |
| Aba Arquivos | as duas vistas do resultado da varredura |
| Conteúdo de uma pasta | tocar numa linha de "As pastas do aparelho", no Início |
| Grupo de um app | botão **Ver** em cada linha de "Arquivos fora da área privada" |
| Lixeira | direto na aba |

Na lista, tocar a miniatura abre o arquivo no app que o sistema escolher; na
grade, o toque longo faz o mesmo. Conferir o original antes de apagar em lote é
a diferença entre limpar e se arrepender.

**A lixeira é o caso que mais precisa disso**, e era o que menos tinha: é o
último lugar onde olhar ainda muda alguma coisa, porque depois de esvaziar não
há volta. Agora ela mostra miniaturas e aceita seleção, porque o caso comum ali
não é "restaurar tudo" — é achar as três fotos que não deviam ter entrado e
trazer só elas de volta. Esvaziar continua sendo tudo ou nada, e o diálogo diz
isso com todas as letras para ninguém confundir com a seleção da tela.

## Enviar cópia para o Drive (ou para qualquer nuvem)

Ao lado de "Para a lixeira", nas telas de seleção, existe **Enviar cópia**: os
arquivos marcados vão para a folha de compartilhamento do Android, e de lá para
o Google Drive, o Fotos, o Telegram — o que estiver instalado.

O caminho é a folha, e **não** a API do Drive. A escolha não é preguiça:

- A API exigiria um projeto no Google Cloud, um cliente OAuth amarrado à
  assinatura do APK e uma tela de consentimento — infraestrutura inteira para
  servir a **um** destino.
- A folha entrega para qualquer nuvem instalada, com a conta que o usuário já
  usa, e quem cuida de escolher pasta, mostrar progresso e retomar envio
  interrompido é o app de destino, que faz isso melhor do que este faria.

Os arquivos saem como `content://` do FileProvider, com permissão de leitura
concedida só para aquele envio.

**Enviar e apagar são dois botões, e continuam separados.** Juntar os dois num
só seria mais cômodo e seria errado: a folha de compartilhamento não devolve
confirmação de que a cópia chegou ao destino, então apagar em seguida seria
apagar no escuro. Sobe, confere no Drive, volta e apaga.

O teto é de **200 arquivos por envio**, e também não é gosto: o Intent viaja por
Binder, cuja transação tem cerca de 1 MB, e cada URI custa algumas centenas de
bytes já parcelada. Passar do teto não dá erro tratável — derruba a transação.
O app recusa antes e diz o número, em vez de quebrar na entrega.

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
