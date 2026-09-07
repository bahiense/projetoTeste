# Fluência 180

Treino diário de **inglês falado** para brasileiros. Um ano (48 semanas) para sair
de um inglês intermediário — aquele que lê bem, entende texto e trava na hora de falar —
e chegar perto de nativo em conversa, escuta e coragem.

O método é o das escolas missionárias de idiomas (o mesmo do CTM): pouca teoria,
muita boca aberta, todo dia, com objetivo comunicativo real em cada exercício.

## Como usar

O app abre na tela **Hoje**, com o ciclo do dia dividido em 8 blocos, cerca de
50 minutos no total:

| Bloco | Minutos | O que é |
|---|---|---|
| Aquecimento da boca | 5 | O som da semana, exagerado, com pares mínimos |
| Shadowing | 10 | Falar por cima do modelo, meio segundo atrás |
| Drill de estrutura | 6 | Estímulo e resposta no relógio, até virar reflexo |
| Blocos de fala | 6 | Memorização proposital com repetição espaçada |
| Laboratório de escuta | 8 | Ditado em velocidade real de nativo |
| Role-play | 8 | Resolver uma situação real falando |
| Fala livre sob pressão | 5 | Tema sorteado, cronômetro, sem parar |
| Diário e missão | 3 | O que travou hoje, o alvo de amanhã |

Cada semana tem **um** som, **uma** estrutura, **uma** função de conversa e **uma**
missão no mundo real (fora do app). O app te empurra para fora dele de propósito:
é lá que a fluência acontece.

## O que o app faz

- **Ouve você.** O reconhecimento de fala transcreve o que você disse, compara com o
  alvo palavra por palavra e mostra o que um ouvido nativo teria perdido.
- **Diagnostica o erro de brasileiro.** Não diz só "errado": diz *por que* saiu errado —
  TH virando S, vogal fantasma no fim da palavra, "e" antes do S inicial, L final
  virando U, -ed com sílaba a mais, e assim por diante.
- **Fala com você.** Todo texto tem áudio, com velocidade ajustável de 0,5× a 1,3×.
- **Grava sua voz** e guarda a anterior de cada exercício, com a data ("há 14 dias"),
  para a comparação que o método pede. Cada gravação tem um botão para apagar; a antiga
  pede confirmação, porque ela não se refaz.
- **Lembra o que você esquece.** Os blocos de fala voltam pouco antes de você esquecer
  (repetição espaçada, SM-2).
- **Mede o que importa.** Nota de fluência = desempenho (60%) + constância (25%) +
  volume de prática (15%).

## O conteúdo

| Banco | Tamanho |
|---|---|
| Sons problemáticos para brasileiros | 16 blocos, 80 pares mínimos, com IPA e instrução articulatória |
| Blocos de fala (chunks) | 622, em 39 funções de conversa |
| Passagens de shadowing | 40 passagens (207 linhas), com ritmo marcado e transcrição "como soa" |
| Role-plays | 30 cenas, 141 turnos, com objetivo e blocos obrigatórios |
| Ditados de fala conectada | 22 blocos, 129 frases |
| Drills de automatização | 35 drills, 337 pares estímulo–resposta |
| Erros de brasileiro | 122 armadilhas (falso amigo, tradução literal, gramática, pragmática) |
| Temas para falar sob pressão | 196, entre monólogo, entrevista, ensinar, debate e narração |
| Escada da coragem | 20 degraus, do espelho até dar uma aula |
| Currículo | 48 semanas em 8 fases |

Os bancos grandes ficam em dois arquivos (`chunks.js` e `chunks-2.js`, e assim por
diante). A segunda parte tem a mesma forma da primeira e é carregada em seguida —
a divisão é só para o arquivo não ficar impossível de ler.

## As oito fases

**Primeiro semestre — construir a fala**

1. **Reconstruir a boca** (semanas 1–6) — sons e, principalmente, ritmo.
   Ao fim: nativo entende você na primeira vez.
2. **Parar de traduzir** (7–12) — blocos e estruturas no automático.
   Ao fim: 10 minutos de conversa sem pausa para procurar palavra.
3. **Aguentar pressão** (13–18) — velocidade real, discordar, improvisar, humor.
   Ao fim: falar numa reunião de nativos sem ensaiar antes.
4. **Refino quase-nativo** (19–24) — nuance, registro, ironia, sotaque fino.

**Segundo semestre — tirar o apoio**

5. **Velocidade real** (25–30) — nativo relaxado, outro sotaque, gente falando junto.
   Ao fim: você entende conversa entre nativos que não é com você.
6. **Domínio profissional** (31–36) — conduzir reunião, negociar salário, dar notícia ruim.
   Ao fim: você conduz trinta minutos de reunião sem ensaio.
7. **Nuance e cultura** (37–42) — humor, ironia, registro, small talk longo.
   Ao fim: você faz um nativo rir, e entende as piadas dele.
8. **Autonomia** (43–48) — você escolhe o tema, corrige o próprio erro e ensina em inglês.
   Ao fim: o inglês virou ferramenta de trabalho, não matéria de estudo.

## Instalar no celular

### Pelo APK (recomendado, não depende de site)

O APK é gerado automaticamente pelo GitHub a cada mudança no código
(`.github/workflows/fluencia-apk.yml`). Baixe o `fluencia180.apk` na aba
**Releases** do repositório, abra pelo celular e confirme a instalação. O Android
avisa que o app não veio da Play Store — é esperado, porque o arquivo foi
compilado direto do código.

Na primeira abertura ele pede o microfone: é com ele que o app ouve você falar.
O código do app é o mesmo desta pasta; o embrulho Android fica em
`../fluencia-android/`, e é ele que devolve ao WebView a voz que o WebView não
tem (veja o README de lá).

### Pelo navegador


1. Publique a pasta com o GitHub Pages:
   **Settings → Pages → Source: Deploy from a branch → Branch: `master` / pasta `/ (root)`**
   (é preciso que a branch com o app já esteja no `master`).
2. No celular, abra `https://<seu-usuario>.github.io/projetoTeste/fluencia/` no **Chrome**.
3. Menu do Chrome (⋮) → **Adicionar à tela inicial**.
4. Libere o microfone quando ele pedir.

> O reconhecimento de fala e o microfone só funcionam em endereço `https://`
> (ou `localhost`). Sem eles o app continua inteiro: no lugar de falar, você digita
> o que diria — mas aí você perde metade do valor. Use o Chrome.

Para testar no computador:

```bash
npx http-server -p 8099 .
# abra http://localhost:8099
```

## Privacidade

Tudo fica no `localStorage` do próprio aparelho: progresso, diário, gravações e notas.
Nada é enviado para servidor nenhum — o app não tem back-end. O reconhecimento de fala
é o do próprio navegador. Em **Ajustes** dá para baixar um backup em JSON e restaurar
em outro aparelho.

## Arquivos

```
fluencia/
├── index.html              a casca e a ordem dos scripts
├── css/style.css
├── data/                   todo o conteúdo pedagógico, um arquivo por banco
│   ├── sons.js             sons, pares mínimos, instrução articulatória
│   ├── chunks.js           blocos de fala por função (+ chunks-2.js)
│   ├── shadowing.js        passagens com ritmo e "como soa"
│   ├── dialogos.js         role-plays
│   ├── ditado.js           fala conectada para escuta
│   ├── prompts.js          temas de fala sob pressão
│   ├── escada.js           os 20 degraus da coragem
│   ├── erros.js            armadilhas do português
│   ├── drills.js           pares estímulo–resposta
│   └── curriculo.js        as 24 semanas e as 4 fases
├── js/
│   ├── store.js            estado do aluno e persistência
│   ├── texto.js            comparação de texto e diagnóstico do erro
│   ├── srs.js              repetição espaçada (SM-2)
│   ├── voz.js              falar, ouvir e gravar
│   ├── ui.js               peças de interface
│   ├── curso.js            liga currículo e bancos de conteúdo
│   ├── pratica.js          o ciclo falar → ouvir → corrigir
│   ├── app.js              navegação, cabeçalho, ajustes
│   └── views/              uma tela por arquivo
│   └── ponte-android.js    repõe a voz que o WebView do Android não tem
├── manifest.webmanifest
├── sw.js                   cache offline
├── verificar.mjs           carrega tudo fora do navegador e confere o conteúdo
└── gerar-app-unico.mjs     gera o app.html
```

HTML, CSS e JavaScript puros, sem dependências e sem build.

## Manutenção

```bash
node verificar.mjs        # sintaxe, tamanho dos bancos, referências do currículo
                          # e quantos dias de material cada banco ainda tem
node gerar-app-unico.mjs  # regenera app.html depois de qualquer mudança
```

`app.html` é o app inteiro num arquivo só — abre com dois cliques no computador,
sem servidor. Ele é gerado a partir dos outros arquivos; ao mexer neles, gere de novo,
senão as duas versões ficam diferentes.

## Limitações honestas

- O reconhecimento de fala é o do navegador: ele erra, principalmente com sotaque
  forte e microfone ruim. A nota de pronúncia é um **indicador**, não um laudo
  fonético — e o erro dele costuma cair justamente onde o seu sotaque é mais forte,
  o que ainda assim é informação útil.
- O app não corrige a *gramática* da sua fala livre; ele mede fluxo, duração e
  riqueza. Correção de conteúdo é papel de um professor humano ou de um parceiro
  de conversa.
- Nenhum app substitui falar com gente. Este aqui existe para você chegar na conversa
  real já treinado — e para te obrigar a marcar essa conversa (é o que a escada da
  coragem faz).
