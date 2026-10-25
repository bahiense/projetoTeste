# Oratória 10x IA

Mentor de oratória no celular: **escolha o tema, estude o roteiro, grave sua fala
e receba a avaliação** — nota, pontos fortes, o que melhorar, vícios de linguagem,
cobertura do roteiro e o mentor lendo o feedback em voz alta.

Abra `oratoria/` pelo navegador (Chrome, num endereço `https://`) e instale pelo
menu ⋮ → **Adicionar à tela inicial**.

## O treino, em quatro passos

1. **Tema** — escolha o nível (iniciante, intermediário, avançado) e o tempo
   máximo, e sorteie um tema ou escreva o seu (reunião, pitch, aula, entrevista).
   Dá para dizer a situação real em que você vai falar.
2. **Roteiro de estudo** — objetivo, pontos-chave com o que dizer, estrutura de
   abertura / desenvolvimento / fechamento com o tempo de cada parte, dicas de
   entrega e uma estratégia de ensaio.
3. **Gravação** — até o tempo escolhido, com cronômetro e medidor de volume.
   Ouça antes de enviar e regrave quantas vezes quiser.
4. **Feedback** — nota de 0 a 10, resumo, pontos fortes, o que melhorar (com o
   trecho e como dizer melhor), vícios de linguagem contados, ritmo em palavras
   por minuto, cobertura dos pontos-chave, o foco do próximo treino e a
   transcrição. O botão **Ouvir o mentor** lê um feedback falado.

A aba **Evolução** guarda o histórico: nota média, tendência recente, dias
seguidos, gráfico das notas e os vícios que mais se repetem.

## Com IA e sem IA

| | Sem chave | Com a chave gratuita do Gemini |
|---|---|---|
| Temas | banco de 36 temas embutido | a IA cria temas novos, sem repetir |
| Roteiro | estrutura padrão a partir dos pontos-chave | roteiro sob medida, com conteúdo e frase de abertura |
| Avaliação | no aparelho: ritmo, vícios, tempo e cobertura, sobre a transcrição do navegador | a IA **ouve o áudio** e julga também clareza, estrutura, entonação e hesitações |

A chave é gratuita e não pede cartão: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
→ **Create API key** → cole em Ajustes. Ela fica só no aparelho.

Detalhes que importam:

- **O áudio vai como WAV 16 kHz mono.** O Chrome grava em WebM, que nem toda
  versão da API aceita; a conversão é feita no aparelho e 2 minutos de fala dão
  ~4 MB, bem abaixo do limite de envio direto.
- **A gravação não é guardada.** Ela vai direto do celular ao Google para a
  análise e some ao fechar o app. O histórico guarda só o texto da avaliação.
- **Se a IA falhar** (cota, rede), o app mostra a avaliação local na hora e
  oferece "Avaliar de novo com IA" enquanto a gravação estiver na memória.
- **Sem transcrição:** em alguns celulares o reconhecimento de fala do navegador
  não roda junto com a gravação. Aí a análise local só mede o tempo, e diz isso.
- **Palavras por minuto e vícios** são contados pelo app sobre a transcrição,
  não estimados pela IA; o ritmo confortável fica entre 120 e 160 ppm.
- O feedback falado usa a voz do próprio aparelho (`speechSynthesis`) — não gasta
  cota e funciona offline. A voz e a velocidade se escolhem em Ajustes.

## Arquivos

| Arquivo | O quê |
|---|---|
| `js/temas.js` | banco de temas por nível |
| `js/roteiro.js` | roteiro montado no aparelho |
| `js/analise.js` | vícios, ritmo, cobertura e avaliação local |
| `js/ia.js` | pedidos ao Gemini (tema, roteiro, avaliação com áudio), em JSON com esquema |
| `js/gravador.js` | gravação, transcrição ao vivo e conversão para WAV |
| `js/voz.js` | o mentor falando |
| `js/store.js` | ajustes, treino em andamento, histórico e backup |
| `js/app.js` | telas e navegação |

## Conferir

```
node oratoria/verificar.mjs
```

Confere o banco de temas, o roteiro local, a contagem de vícios (sem falso
positivo dentro de palavras), ritmo, cobertura, a avaliação local, a leitura da
resposta da IA, o backup e o cabeçalho WAV.
