# Limpar inscrições de política no YouTube

O script lista os canais que você segue e marca os que parecem ser de política.
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
```

Na primeira vez, o navegador abre para você entrar na conta Google e autorizar.
Como o app está em modo de teste, o Google mostra um aviso de "app não verificado":
clique em **Avançado → Acessar** (o app é seu).

## Observações

- A detecção é por palavras-chave (ex.: política, deputado, eleição, partido, STF).
  Pode marcar canais que não são de política, e deixar passar outros. Por isso a revisão:
  você pode manter os marcados por engano e escolher outros na lista completa.
- A API permite cerca de 200 cancelamentos por dia. Se passar disso, rode de novo no dia seguinte.
- Os arquivos `client_secret.json` e `token.json` são pessoais. Não compartilhe nem envie ao GitHub.
