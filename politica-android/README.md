# Ciência Política — app Android

**Para instalar:** abra no celular
https://github.com/bahiense/projetoTeste/releases/download/politica-apk-latest/politica.apk
e abra o arquivo baixado (permita "instalar apps desconhecidos" se o Android pedir).

Um professor particular de ciência política para as lições que chegam toda
semana em PDF. Quem escreve é o **Claude** (modelo `claude-opus-5-5`), pela API
da Anthropic, com o papel de um professor universitário doutor, com décadas de
pesquisa e livros publicados.

## Dois jeitos de preparar as aulas

- **Pelo Claude, sem custo extra (recomendado):** o Professor de Política
  dentro do Claude (`politica-claude/`,
  https://claude.ai/artifact/Fexq3SMKpPT7jYdWLyi3Jw) prepara a aula pelo seu
  plano. Lá, **Levar para o app** baixa a aula em `Downloads`; este app, com a
  pasta apontada uma vez, importa sozinho toda vez que abre (`Copias.kt`, igual
  ao app da Bíblia). Sem chave, o app é leitor completo: aula, autores,
  conceitos, debates, quiz, verdadeiro ou falso e flashcards, offline. Dúvidas,
  debate, sabatina e correção levam ao Claude.
- **Pela API (opcional, pago à parte):** com uma chave da API em Ajustes, o app
  prepara a aula sozinho, com pesquisa na web, e conversa com o professor
  aqui mesmo. É o caminho descrito abaixo.

## Para sempre: as cópias

- No Claude: as aulas ficam na sua conta (banco do artifact, área particular).
- Em Downloads: o app regrava `politica-copia-do-app.json` a cada aula nova.
  Sobrevive a desinstalar; ao reinstalar, aponte a pasta e tudo volta.
- No Google Drive: Ajustes → **Enviar cópia** → Drive. Sobrevive a perder o
  celular. Ajustes → **Trazer aulas de um arquivo de cópia** restaura de
  qualquer lugar, e o artifact também restaura do mesmo arquivo.

## Como usar com a chave da API

1. **Na primeira vez**, cole a chave da API (console.anthropic.com → API Keys).
   A API é paga por uso, separada da assinatura do Claude: coloque créditos em
   Billing. O app confere a chave antes de guardar.
2. **Toda semana**, toque em **Nova lição (PDF)**, escolha o arquivo e depois
   **Preparar a aula**. Leva de 5 a 15 minutos; dá para usar o celular enquanto
   isso (uma notificação fica aberta) e o app avisa quando termina.
3. **Estude**: a aula fica pronta para sempre, sem gastar mais nada para reler.

## O que a aula tem

| Aba | O que tem |
|---|---|
| Aula | visão geral, roteiro e um módulo por bloco do PDF (cobrindo todos os slides): explicação do simples ao complexo, exemplo, por que importa, o erro comum, e uma pergunta de checagem com resposta |
| Autores | cada autor citado no PDF e os complementares: quem foi, contexto, ideias, obras, como se liga à lição, quem o critica |
| Conceitos | glossário com busca: definição, exemplo, com o que não confundir |
| Cronologia | os fatos e as ideias em ordem, quando a lição pede |
| Debates | as controvérsias do tema com as posições e seus melhores argumentos; **treino de debate** em que o professor defende o lado contrário e, no fim, dá nota e mostra como responder melhor |
| Exercícios | múltipla escolha, verdadeiro ou falso, flashcards (com monte do que você ainda não sabe), **sabatina oral** e **questões dissertativas corrigidas** pelo professor, com nota e resposta modelo |
| Professor | conversa livre para tirar dúvidas; ele conhece o PDF e a pesquisa e pode buscar na web |
| Revisão | síntese, argumentos prontos para debate, leituras para ir além e o dossiê de pesquisa |

Em cada módulo e em cada autor há o botão **Perguntar ao professor**, que abre
uma conversa já sabendo do que se trata.

## Como funciona por dentro

- `Professor.kt` — tudo o que fala com o Claude, pelo SDK oficial
  (`com.anthropic:anthropic-java`). Não usa nada do Android (dá para compilar e
  testar no computador).
  1. O PDF sobe uma vez pela **Files API** e depois é citado pelo id. O Claude lê
     os PDFs também como imagem, então slides sem texto selecionável funcionam.
  2. **Pesquisa**: o Claude lê o PDF slide a slide e usa a **busca na web** para
     aprofundar autores, conceitos e o fato da semana. Sai um dossiê (guardado:
     se a etapa seguinte falhar, não se paga de novo).
  3. **Aula**: com o PDF e o dossiê, ele escreve a aula num JSON com formato
     garantido (**structured outputs**, esquema em `Esquema.kt`).
  4. **Conversas** (dúvidas, debate, sabatina, correção) mandam o PDF e o dossiê
     com **cache de prompt**, e o texto chega aos poucos (streaming).
  - Raciocínio adaptativo, esforço `high` para a aula e `medium` nas conversas,
    e fallback do lado do servidor caso o modelo recuse um pedido.
- `Prompts.kt` — quem é o professor e o que se pede em cada etapa e modo.
- `Ponte.kt` — o que a página pede ao lado nativo; guarda as lições em
  `files/aulas/<id>/` (`licao.pdf`, `meta.json`, `dossie.md`, `aula.json`).
- `ServicoAula.kt` — mantém o app em primeiro plano enquanto a aula é escrita.
- `assets/` — a tela (HTML/CSS/JS, sem biblioteca). Progresso e conversas ficam
  no `localStorage`.

## Custo (aproximado)

Preparar uma lição de ~35 slides: de US$ 1,50 a 4 (leitura do PDF, pesquisa na
web e a aula, que é longa). Cada pergunta ao professor: alguns centavos.

## Segurança

- A chave da API fica só no lado nativo, cifrada com AES-GCM por uma chave do
  Android Keystore (`Cofre.kt`); a página nunca a vê. `allowBackup=false`.
- APK de release, não de depuração.
- A página roda com CSP sem script externo nem requisição de rede; links
  externos só https, abertos no navegador.

## Compilar

O workflow `.github/workflows/politica-apk.yml` gera o APK a cada push e o
publica na aba Releases (tag `politica-apk-latest`). A assinatura usa os
segredos `POLITICA_KEYSTORE_B64`/`POLITICA_KEYSTORE_SENHA` ou, na falta deles,
os do Espalhe. Localmente: `./gradlew assembleRelease`.
