# Altar — treino de oração pública

Um app para quem **ora todo dia em casa e trava quando alguém diz "irmão, pode fazer
uma oração?"**. Não é devocional, não é gerador de orações prontas: é academia. Você ora
em voz alta, o app ouve e devolve o que dá para medir — e o que dá para treinar.

O conteúdo é o do **Método Altar** (os dez módulos, o dicionário de 100 palavras e os 50
versículos). O app organiza esse material e cobra a prática que ele pede.

## O problema que ele resolve

O material diagnostica com precisão: quem trava não trava por falta de fé nem de palavras.
Trava por falta de **direção** — não saber o que fazer depois da primeira frase. As
ferramentas são quatro:

| Ferramenta | Para quê |
|---|---|
| **ALTAR** | O mapa: propósito, momento, caminho, congregação, confiança |
| **5 Ângulos** | Desenvolver uma ideia: pessoas, situações, necessidades, fé, entrega |
| **4 Pontes** | Conectar uma ideia à próxima sem parecer lista |
| **5 Níveis** | Enxergar além do pedido, até o que está sendo vivido |

Saber as quatro não adianta se elas não estiverem disponíveis sob pressão. É para isso
que existe o resto do app.

## O que o app faz

- **Ouve você orar.** O reconhecimento de fala transcreve a oração inteira em português,
  do primeiro movimento ao amém.
- **Analisa o que foi dito**, pelo que o próprio método ensina a observar:
  - quantos dos **5 Ângulos** apareceram, e quais faltaram;
  - se a oração **andou** nas direções das **4 Pontes** (situação → necessidade →
    fé → entrega);
  - **detalhe verdadeiro × bênção genérica** ("tudo", "todas as coisas", "abençoa a todos");
  - **repetição** — trechos inteiros voltando, que é circular em vez de avançar;
  - **vocativos em fila** ("Pai… Senhor… meu Deus…" sem ideia no meio), o sintoma mais
    visível do Módulo 2;
  - **oração em lista** — quatro assuntos ou mais, nenhum desenvolvido;
  - se a **abertura** nasceu do momento ou foi louvor automático;
  - se a oração **concluiu por entrega** ou apenas parou;
- **Aponta o módulo** de onde vem cada correção — a crítica devolve ao material, não fica
  solta.
- **A bússola, durante a oração.** Um botão grande, *E agora?*, que entrega **um** movimento
  por vez. Mostrar o mapa inteiro no meio da oração seria trocar o branco por sobrecarga,
  que é o erro do Módulo 2.
- **O botão "Travei".** O protocolo do Módulo 10 em uma tela, com uma frase de retomada:
  respire, não peça desculpas, volte ao momento, dê o próximo passo.
- **O programa de 21 dias**, com os exercícios e as regras do Módulo 9 — do "um tema
  sorteado, uma ideia dita inteira" até o dia 20, em que o app escolhe contexto e
  necessidade e só conta na hora.
- **34 cenários reais**: culto, célula, hospital, velório, casamento, oferta, reunião de
  trabalho com gente de outra fé, alguém que te para no corredor. Os sensíveis vêm com o
  aviso do Módulo 8: não inventar, não especular, não expor.
- **Modo "Vou orar agora"** — para usar dentro da igreja, com o microfone chegando: o
  cartão de partida, depois uma bússola de letra grande, sem análise e sem microfone.
  Depois, o registro de como foi. É a parte do app que existe para tirar você do app.
- **Biblioteca**: as 100 palavras do dicionário (com o "em vez de… você pode dizer…"), os
  50 versículos por situação e já virados oração, e as orações modelo com o método revelado
  só depois de você ler a oração.
- **Orar de novo, com o mesmo cenário.** No fim de cada treino dá para repetir: o preparo da
  próxima tentativa já abre com o que a anterior apontou (no máximo dois pontos — lista de
  correções na cabeça durante a oração é a sobrecarga do Módulo 2), e o resultado compara as
  duas: nota, ângulos, pontes, detalhe e conclusão, com a seta de cada uma. Toda tentativa
  fica guardada; repetir para melhorar é o exercício, não trapaça.
- **Nenhum relógio.** Não há contagem antes, cronômetro durante nem duração no resultado, e
  a análise não mede velocidade de fala. Um número correndo na tela durante uma oração é
  mais uma coisa para vigiar, e vigiar é o oposto do que o método pede. A oração acaba
  quando o assunto acaba — e uma oração de trinta palavras, com uma ideia inteira e
  entrega, mede mais do que uma lista comprida.
- **Progresso** que compara você do dia 1 com você de hoje, e aponta **um** ponto fraco por
  vez — porque uma lista de dez fraquezas não muda nada.

## O que ele não faz

- **Não julga a sua oração.** Ele conta palavras. Sinceridade, unção e se a oração agradou
  a Deus não são medida de aplicativo, e o app diz isso na própria tela de resultado.
- **Não escreve orações para você.** O método inteiro existe para o contrário disso.
- **Não entende português.** A análise é por léxico: raízes de palavra e expressões. Ela
  acerta o padrão e erra o caso raro — uma oração excelente com vocabulário incomum pode
  medir menos do que merece.
- **O reconhecimento de fala é o do aparelho.** Ele erra com microfone ruim e em ambiente
  barulhento. Por isso a tela de resultado deixa corrigir o texto e analisar de novo.

## Como usar

Abra em **Hoje** e faça o dia do programa, sempre em voz alta e no tempo que você quiser.
Antes do próximo culto, use **Treinar** com o cenário mais parecido com o que vem por aí.
Quando te chamarem de verdade, abra **Vou orar agora** — e depois registre como foi.

Ler os módulos ajuda. Só ler não muda nada: a habilidade que falta é acessar o método com
gente olhando, e isso só se treina falando.

## Instalar no celular

### Pelo APK

O APK é gerado pelo GitHub a cada mudança (`.github/workflows/oracao-apk.yml`). Baixe o
`altar.apk` na aba **Releases**, abra pelo celular e confirme. O Android avisa que o app
não veio da Play Store — é esperado, o arquivo foi compilado a partir deste código.

Baixe pela **Releases**, não pelo artefato do Actions: o artefato sempre vem embrulhado
num `.zip`, e o Android não instala zip. Build do `master` publica em `altar-latest`;
build de branch de trabalho publica em `altar-preview`, marcada como prévia.

Na primeira abertura ele pede o microfone: é com ele que o app ouve a oração. O embrulho
Android fica em `../oracao-android/` e devolve ao WebView a voz que o WebView não tem.

### Pelo navegador

1. Publique a pasta com o GitHub Pages (**Settings → Pages → branch `master`, pasta `/`**).
2. No celular, abra `https://<usuário>.github.io/projetoTeste/oracao/` no **Chrome**.
3. Menu ⋮ → **Adicionar à tela inicial**.

O microfone e o reconhecimento de fala só funcionam em `https://` (ou `localhost`). Sem
eles o app continua inteiro — no lugar de falar, você digita o que orou —, mas aí some
metade do valor.

Para testar no computador:

```bash
npx http-server -p 8099 .
# abra http://localhost:8099/oracao/
```

## Privacidade

Tudo fica no `localStorage` do próprio aparelho: progresso, orações, transcrições e
anotações. O app não tem back-end e não envia nada para lugar nenhum. Isso importa mais
aqui do que em outros apps, porque oração pública fala da vida de outras pessoas — por
isso, em **Ajustes**, dá para desligar a guarda do texto das orações e apagar o que já foi
guardado. O backup em JSON é o único jeito de levar o progresso para outro aparelho.

## Arquivos

```
oracao/
├── index.html                a casca e a ordem dos scripts
├── css/style.css
├── data/
│   ├── metodo.js             ALTAR, 5 Ângulos, 4 Pontes, 5 Níveis, protocolos
│   ├── modulos.js            os dez módulos do curso
│   ├── cenarios.js           34 cenários, temas de sorteio e imprevistos
│   ├── programa.js           os 21 dias, com o foco e a regra de cada um
│   ├── dicionario.js         100 palavras + mapa de substituição
│   ├── versiculos.js         50 versículos por situação
│   ├── exemplos.js           orações modelo e os antes-e-depois
│   └── lexico.js             as pistas que o analisador procura
├── js/
│   ├── store.js              estado do aluno e persistência
│   ├── texto.js              normalização, raízes, repetição, posições
│   ├── analise.js            o analisador da oração
│   ├── voz.js                falar, ouvir e gravar
│   ├── ui.js                 peças de interface
│   ├── lembrete.js           o aviso da hora de praticar
│   ├── treino.js             o ciclo preparar → orar → analisar
│   ├── app.js                navegação e eventos globais
│   ├── ponte-android.js      repõe a voz que o WebView não tem
│   └── views/                uma tela por arquivo
├── manifest.webmanifest
├── sw.js                     cache offline
├── icons/
└── verificar.mjs             carrega tudo fora do navegador e confere
```

HTML, CSS e JavaScript puros, sem dependências e sem build.

## Manutenção

```bash
node oracao/verificar.mjs
```

Confere que tudo carrega, que as referências do programa e das categorias batem — e
roda o analisador contra as orações do próprio material: as orações modelo precisam
passar de 80, cada "depois" precisa medir mais que o seu "antes", uma oração curta e
inteira precisa medir mais que uma comprida e rasa, e a oração em lista e os vocativos em
fila precisam ficar em 60 ou menos. Se um ajuste no léxico quebrar isso, o analisador
parou de medir o que o método ensina.
