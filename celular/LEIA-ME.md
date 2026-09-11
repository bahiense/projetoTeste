# Ciclo Concursos — app de celular

App instalável que roda **fora do Claude**, guarda tudo **no seu telefone** e
**funciona sem internet**. Não é um site que você visita: depois de instalado,
ele ganha ícone na tela de início e abre em tela cheia, sem barra de endereço.

Tecnicamente é um **PWA** (Progressive Web App). Na prática, para você, é um
aplicativo — a diferença é que a instalação vem do navegador em vez da loja,
sem cadastro, sem cobrança e sem revisão da Apple ou do Google.

## O que tem nesta pasta

```
index.html             o app inteiro
manifest.webmanifest   o que diz ao celular que isto é um aplicativo
sw.js                  o que faz abrir sem internet
icone-192.png          ícone da tela de início
icone-512.png          ícone grande e da tela de abertura
icone-180.png          ícone do iPhone
```

## Como colocar no ar (GitHub Pages, grátis para sempre)

O app precisa de um endereço `https://` — é exigência do navegador para
instalar e para funcionar offline. O GitHub Pages serve isso de graça.

1. Crie um repositório **público** novo em <https://github.com/new>,
   com o nome `ciclo-concursos`.
2. Envie o conteúdo **desta pasta** para a raiz do repositório (pode arrastar
   os arquivos na própria página do GitHub, em *Add file → Upload files*).
3. No repositório, vá em **Settings → Pages**. Em *Source*, escolha
   **Deploy from a branch**, selecione a branch `main` e a pasta `/ (root)`.
   Salve.
4. Espere um ou dois minutos e abra `https://SEU_USUARIO.github.io/ciclo-concursos/`.

## Como instalar no celular

Abra esse endereço no celular e:

- **Android (Chrome):** aparece um aviso "Instalar aplicativo". Se não
  aparecer, toque no menu ⋮ → *Adicionar à tela inicial* → *Instalar*.
- **iPhone (Safari):** toque no botão Compartilhar (o quadrado com a seta) →
  *Adicionar à Tela de Início*. No iPhone isto só funciona pelo Safari.

Pronto: ícone na tela, tela cheia, e abre mesmo no modo avião.

## Onde ficam os seus dados

No armazenamento do navegador **daquele aparelho**. Não sobem para servidor
nenhum, não passam por mim e não acompanham você para outro celular.

Três consequências que valem saber de antemão:

- **Baixe uma cópia de vez em quando** (Ajustes → Baixar uma cópia). É um
  arquivo `.json` que restaura tudo em Ajustes → Restaurar uma cópia.
- **Limpar os dados de navegação apaga o app.** Desinstalar também.
- O app pede ao navegador para marcar os dados como *persistentes*, o que
  evita que sejam descartados quando o telefone fica sem espaço — mas a
  garantia não é absoluta. A cópia é a garantia.

## Como atualizar o app depois

Envie os arquivos novos para o repositório e **troque o número da `VERSAO`
no `sw.js`** (de `ciclo-v1` para `ciclo-v2`, e assim por diante). Sem essa
troca, o celular continua abrindo a versão guardada.

Atualizar o app **não apaga o seu progresso** — os dados e os arquivos do app
ficam em lugares separados.

## O que dá para fazer dentro do app

| Onde | O quê |
|---|---|
| Estudar | A tarefa da vez; concluir sessão; registrar exercícios e erros; **desfazer** o último registro |
| Progresso | Matéria → bloco → aula, com aproveitamento; caderno de erros |
| Ajustes | Criar, editar e excluir matérias; criar, editar e **apagar aulas**; sarrafo geral e por matéria; ritmo do ciclo; **apagar tudo**; baixar e restaurar cópia |
