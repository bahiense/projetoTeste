# Limpar política e reforçar o que você gosta no YouTube

São dois scripts:

- `limpar_inscricoes.py`: cancela inscrições em canais de política.
- `inscrever_canais.py`: inscreve você nos canais de `canais.txt` (rock clássico, jazz,
  blues, country e cristianismo reformado). Edite o arquivo para pôr ou tirar canais.

O primeiro script lista os canais que você segue e marca os que parecem ser de política.
Você revisa a lista, e ele só cancela as inscrições que você confirmar.
O login é feito numa tela oficial do Google: sua senha nunca passa pelo script.

## 1. Criar a credencial no Google Cloud (uma vez só, grátis)

1. Acesse https://console.cloud.google.com/ e crie um projeto (qualquer nome).
2. Em **APIs e serviços → Biblioteca**, procure **YouTube Data API v3** e clique em **Ativar**.
3. Em **APIs e serviços → Tela de consentimento OAuth**: escolha **Externo**, preencha o nome
   do app e o seu e-mail. Em **Usuários de teste**, adicione o e-mail da sua conta do YouTube.
4. Em **APIs e serviços → Credenciais → Criar credenciais → ID do cliente OAuth**,
   escolha o tipo **App para computador**.
5. Baixe o JSON e salve nesta pasta com o nome `client_secret.json`.

## 2. Rodar

Precisa de Python 3 instalado no seu computador.

```bash
pip install google-api-python-client google-auth-oauthlib
python limpar_inscricoes.py --simular   # primeiro, só para ver a lista
python limpar_inscricoes.py             # depois, para cancelar de verdade

python inscrever_canais.py --simular    # mostra os canais que achou
python inscrever_canais.py              # inscreve de verdade
```

O `inscrever_canais.py` busca cada nome no YouTube e mostra o canal encontrado.
Confira se é o canal oficial: você pode pular os que vierem errados. Para acertar um
canal específico, troque o nome em `canais.txt` pelo @handle dele (aparece no endereço
do canal, ex: `@LigonierMinistries`).

Na primeira vez, o navegador abre para você entrar na conta Google e autorizar.
Como o app está em modo de teste, o Google mostra um aviso de "app não verificado":
clique em **Avançado → Acessar** (o app é seu).

## Observações

- A detecção é por palavras-chave (ex.: política, deputado, eleição, partido, STF).
  Pode marcar canais que não são de política, e deixar passar outros. Por isso a revisão:
  você pode manter os marcados por engano e escolher outros na lista completa.
- A API tem uma cota diária: dá para cerca de 200 cancelamentos, ou buscar e inscrever uns
  60 canais. Se passar disso, rode de novo no dia seguinte. As buscas ficam guardadas em
  `busca_cache.json`, então rodar `--simular` antes não gasta a cota duas vezes.
- Os arquivos `client_secret.json` e `token.json` são pessoais. Não compartilhe nem envie ao GitHub.
