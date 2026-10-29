# Servidor do Espalhe — configuração única do dono

Com isto feito **uma vez**, quem usa o Espalhe liga as métricas tocando em
**"Entrar com o Instagram"** (ou Facebook, Threads, YouTube, TikTok): abre a
página de login da própria rede, a pessoa entra e volta para o app. Sem token,
sem app de desenvolvedor, sem nada técnico.

Por que existe um servidor: cada rede exige um "app de desenvolvedor" com uma
**senha**, e essa senha não pode ir dentro do APK (qualquer um a tiraria de
lá). Ela fica neste servidor, um Cloudflare Worker gratuito. Ele não guarda
nada de ninguém: só troca o código de login por um acesso e devolve ao celular,
cifrado de um jeito que só aquele celular abre.

Tudo abaixo é grátis. Dá para fazer só algumas redes: as que ficarem sem
configurar simplesmente não mostram o botão "Entrar".

Onde cadastrar cada coisa no GitHub: no repositório, **Settings → Secrets and
variables → Actions**. "Segredo" vai na aba **Secrets**; "variável" na aba
**Variables**.

---

## 1. O servidor (Cloudflare) — 10 minutos

1. Crie uma conta em https://dash.cloudflare.com/sign-up (grátis).
2. Em **Workers & Pages**, abra a página uma vez (ela cria o seu endereço
   `.workers.dev`). Na lateral direita aparece o **Account ID**: copie.
3. Clique no seu perfil (canto de cima) → **My Profile → API Tokens → Create
   Token** → modelo **Edit Cloudflare Workers** → **Continue to summary → Create
   Token**. Copie o token.
4. (Guarde o token: um workflow que publica o servidor sozinho ainda está
   pendente de aprovação; por enquanto a publicação é à mão, no passo 5.)
5. Publique o servidor: em **Workers & Pages → Create → Worker**, dê o nome
   `espalhe`, cole o conteúdo de `worker.js` e toque em **Deploy**. Em
   **Settings → Variables and Secrets**, adicione como *Secret* um `SEGREDO`
   (qualquer texto longo e aleatório) e as senhas das redes dos passos abaixo.
6. O endereço do servidor aparece no topo (algo como
   `https://espalhe.seunome.workers.dev`). Crie a **variável**
   `ESPALHE_SERVIDOR` com esse endereço.
7. Abra o endereço no navegador: a página lista cada rede, o que falta e o
   **endereço de volta** que você vai colar no painel de cada uma.

## 2. Instagram, Facebook e Threads (Meta) — 20 minutos

Em https://developers.facebook.com/apps entre com o seu Facebook e toque em
**Criar app**. Escolha os casos de uso (se o painel não deixar juntar algum,
crie um app separado para ele — o Threads costuma pedir app próprio):

- **Instagram** — caso de uso *"Gerenciar mensagens e conteúdo no Instagram"*.
  Em **Configuração da API com login do Instagram → Configurar login comercial
  do Instagram**, cole o endereço de volta `…/volta/instagram`. Ali mesmo
  aparecem o **ID do app do Instagram** e a **chave secreta** → segredos
  `IG_ID` e `IG_SEGREDO`.
- **Facebook (Páginas)** — caso de uso *"Gerenciar tudo na sua Página"*. Em
  **Login do Facebook para Empresas → Configurações → URIs de redirecionamento
  do OAuth válidos**, cole `…/volta/facebook`. Em **Configurações do app →
  Básico** estão o **ID do app** e a **chave secreta** → `FB_ID` e `FB_SEGREDO`.
- **Threads** — caso de uso *"Acessar a API do Threads"*, com as permissões
  `threads_basic`, `threads_manage_insights` e `threads_read_replies`. Em
  **URLs de retorno de chamada**, cole `…/volta/threads`. O **ID do app do
  Threads** e a **chave secreta** → `TH_ID` e `TH_SEGREDO`.

**Quem pode entrar:** enquanto o app da Meta estiver em modo de
desenvolvimento, só entram as contas que você adicionar em **Funções do app**
(como Testador do Instagram / do Threads, ou administrador). Para você e alguns
conhecidos isso basta. Para qualquer pessoa entrar, o app precisa passar pela
**Análise do app** da Meta (e, para algumas permissões, pela verificação da
empresa) — é um processo da Meta, que leva dias ou semanas.

Lembrete para quem vai entrar no Instagram: a conta precisa ser **Criador de
conteúdo** ou **Empresa** (grátis, nas configurações do Instagram).

## 3. YouTube (Google) — 10 minutos

1. Em https://console.cloud.google.com crie um projeto.
2. **APIs e serviços → Biblioteca**: ative **YouTube Data API v3** e **YouTube
   Analytics API**.
3. **Tela de consentimento OAuth**: tipo **Externo**, preencha o nome
   "Espalhe" e o seu e-mail. Depois toque em **Publicar app** (sem isso o
   Google derruba o acesso a cada 7 dias).
4. **Credenciais → Criar credenciais → ID do cliente OAuth → Aplicativo da
   Web**. Em **URIs de redirecionamento autorizados**, cole `…/volta/youtube`.
5. Copie o **ID do cliente** e a **chave secreta** → `GOOGLE_ID` e `GOOGLE_SEGREDO`.

Sem a verificação do Google, quem entra vê o aviso *"O Google não verificou
este app"*: tocar em **Avançado → Acessar Espalhe** continua. Para tirar o aviso
(e passar de 100 pessoas), peça a verificação na própria tela de consentimento.

## 4. TikTok — 10 minutos

1. Em https://developers.tiktok.com entre e crie um app (**Manage apps →
   Connect an app**).
2. Adicione **Login Kit** (Web), com o **Redirect URI** `…/volta/tiktok`, e os
   escopos **user.info.basic** e **video.list**.
3. Copie o **Client key** e o **Client secret** → `TT_CHAVE` e `TT_SEGREDO`.

Enquanto o app não for aprovado pelo TikTok, só entram as contas cadastradas
no **Sandbox → Target users**. Para abrir a todos, envie o app para revisão.

## 5. Terminar

1. Confira que as senhas estão em **Settings → Variables and Secrets** do
   Worker na Cloudflare.
2. Aba **Actions** → **Gerar APK do Espalhe** → **Run workflow** (para o app
   sair com o botão "Entrar").
3. Abra o endereço do servidor no navegador e confira os ✓.

Pronto. A partir daí, quem usa o Espalhe só toca em "Entrar".

---

## Como funciona (para quem quiser conferir)

- `worker.js` tem quatro rotas: `/entrar/:rede` (começa o login), `/volta/:rede`
  (a rede devolve o código; o servidor troca pelo acesso), `/renovar` (TikTok e
  Google pedem a senha também para renovar) e `/redes` (quais redes estão
  configuradas).
- O celular gera um par de chaves para cada login e manda só a metade pública.
  O acesso volta cifrado (ECDH P-256 + AES-GCM) para essa chave: nem o navegador
  nem o histórico veem o token. O "state" do login é assinado (HMAC) e vale 15
  minutos.
- Não há banco de dados nem registro de nada.
