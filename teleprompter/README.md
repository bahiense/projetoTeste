# Teleprompter

App de teleprompter para gravar vídeos lendo um texto sem parecer que está lendo.
O texto rola por cima da imagem da câmera, e o vídeo é gravado **sem o texto aparecer**.

Funciona no celular Android pelo Chrome e pode ser instalado na tela inicial, ficando
com cara de aplicativo (tela cheia, ícone próprio, funciona offline).

## Como colocar no celular

1. Publique a pasta com o GitHub Pages:
   **Settings → Pages → Source: Deploy from a branch → Branch: `master` / pasta `/ (root)`**
   (é preciso que a branch com o app já esteja no `master`).
2. No celular, abra `https://<seu-usuario>.github.io/projetoTeste/teleprompter/` no **Chrome**.
3. Menu do Chrome (⋮) → **Adicionar à tela inicial**.
4. Abra pelo ícone criado e libere o acesso à câmera e ao microfone quando ele pedir.

> A câmera só funciona em endereço `https://` (ou `localhost`). Abrir o arquivo direto
> do celular, sem servidor, não vai ligar a câmera.

Para testar no computador:

```bash
npx http-server -p 8099 .
# abra http://localhost:8099
```

## Como usar

1. Escreva ou cole o texto na primeira tela.
2. Toque em **Gravar com a câmera**.
3. Aperte o botão vermelho: aparece a contagem regressiva, a gravação começa e o texto
   começa a rolar sozinho.
4. Leia olhando para a **parte de cima da tela**, bem perto da lente — é isso que faz
   parecer que você está olhando para a câmera, e não lendo.
5. Aperte o botão vermelho de novo para parar. Aí é só **Compartilhar / Salvar** para
   mandar o vídeo para a galeria, o Instagram ou o WhatsApp.

### Controles durante a gravação

| Controle | O que faz |
|---|---|
| Toque na tela | Começa / pausa a rolagem |
| **–** e **+** | Deixa o texto mais devagar ou mais rápido (na hora) |
| **A–** e **A+** | Diminui ou aumenta a letra |
| ↺ | Volta o texto para o começo |
| Botão vermelho | Começa / para a gravação |
| ▶ / ❚❚ | Começa / pausa a rolagem |
| ⟳ (topo) | Troca entre câmera frontal e traseira |
| ◀▶ (topo) | Espelha o texto (para usar com vidro de teleprompter) |
| ✕ (topo) | Volta para a tela do texto |

Com teclado ou controle bluetooth: **espaço** pausa, **↑/↓** mudam a velocidade,
**Home** volta ao início e **Esc** sai.

## Ajustes disponíveis

- **Velocidade** (1 a 30) — também dá para mudar durante a gravação
- **Tamanho da letra** (20 a 96 px)
- **Altura da área de texto** — quanto da tela o texto ocupa; deixe menor para ler
  mais perto da lente
- **Fundo do texto** — escurece atrás das letras para melhorar a leitura
- **Contagem antes de começar** (0 a 10 s)
- **Espelhar câmera na tela** — efeito selfie na visualização (não afeta o arquivo gravado)
- **Espelhar texto** na horizontal / vertical — para rigs com vidro de teleprompter
- **Marcadores de leitura** — setinhas laterais mostrando onde manter os olhos
- **Gravar com áudio**
- **Câmera** frontal ou traseira
- **Qualidade do vídeo** — 720p, 1080p ou 4K

Os textos e os ajustes ficam salvos no próprio aparelho (`localStorage`).

## Detalhes técnicos

- HTML, CSS e JavaScript puros, sem dependências e sem build.
- Câmera e microfone via `getUserMedia`; gravação via `MediaRecorder`.
  O formato é escolhido conforme o suporte do aparelho, tentando MP4 (H.264) primeiro
  e caindo para WebM.
- O texto é um elemento HTML **por cima** do `<video>`, e o que é gravado é a stream da
  câmera — por isso o texto nunca aparece no arquivo final.
- A rolagem usa `requestAnimationFrame` com `transform: translate3d`, em px/s
  proporcionais ao tamanho da fonte, para ficar suave em qualquer velocidade.
- `Screen Wake Lock` mantém a tela ligada enquanto o prompter está aberto.
- Service worker (`sw.js`) guarda os arquivos em cache para funcionar offline.

## Arquivos

```
teleprompter/
├── index.html              telas (editor, prompter, resultado)
├── css/style.css
├── js/app.js               toda a lógica
├── manifest.webmanifest    instalação na tela inicial
├── sw.js                   cache offline
└── icons/                  ícones do app
```

## Limitações

- Precisa de Chrome atualizado no Android. Em iPhone o `MediaRecorder` tem suporte
  irregular; a rolagem funciona, a gravação pode não funcionar.
- Se você sair do app ou apagar a tela durante a gravação, o Android interrompe a
  câmera e a gravação para.
- Vídeos longos em 4K geram arquivos grandes, que ficam na memória até você salvar.
