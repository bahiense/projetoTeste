# Ciclo Concursos

Sistema de estudos cíclicos para concurso público.

É a versão em programa da planilha de ciclo: matérias em rodízio, PDF fatiado em
sessões de leitura, revisão do bloco inteiro com exercícios e reforço automático do
que ficou abaixo do sarrafo.

---

## Como usar

### 1. Aplicativo Android (APK)

O jeito de ter isto como aplicativo de verdade no celular: ícone na tela,
tela cheia, funciona sem internet, dados no aparelho.

O APK é montado pelo próprio GitHub, de graça, sem precisar instalar nada:

1. Abra a aba **Actions** do repositório.
2. Escolha o fluxo **APK do celular** e clique em **Run workflow**.
3. Quando terminar (uns 3 minutos), abra a execução e baixe
   **ciclo-concursos-apk** em *Artifacts*.
4. Passe o `app-debug.apk` para o celular e toque nele. O Android vai pedir
   permissão para instalar de fora da Play Store — é esperado.

A pasta `android/` tem o projeto: uma casca WebView (`androidx.webkit`) que
serve o app dos assets por `https://appassets.androidplatform.net/`, e não por
`file://`. A diferença importa: em `file://` o navegador trata o armazenamento
como descartável e o seu progresso poderia sumir.

### 2. Arquivo único, dois cliques (no computador)

Baixe **`CicloConcursos.html`**, salve na área de trabalho e dê dois cliques.
Pronto — sem instalar nada, sem Python, sem internet.

Os dados ficam no navegador daquele computador. Uma ressalva honesta: eles somem se
você limpar os dados de navegação, e não acompanham você para outro aparelho. Em
**Ajustes** há "Baixar cópia dos dados" e "Restaurar uma cópia" — use de vez em quando.

### 3. Página publicada na sua conta do Claude

O mesmo arquivo, publicado como página. Abre pelo endereço no notebook e no celular,
com o progresso sincronizado entre os dois, sem instalar nada.

No celular, é preciso estar com a sua conta do Claude conectada naquele aparelho —
a página é privada. Depois de abrir, use **"Adicionar à tela de início"** (Safari:
botão Compartilhar; Chrome: menu ⋮) e ela ganha um ícone como o de qualquer aplicativo.

A tela foi feita para caber num celular: a tarefa do momento vem primeiro, o menu
desliza de lado e nada rola para os lados.

### 4. Servidor próprio, com senha

A versão em Python desta pasta: roda no Windows com `iniciar.bat`, ou numa hospedagem
gratuita com endereço seu e senha. É a única forma que faz sentido se um dia outras
pessoas forem usar. Instruções logo abaixo.

---

## Instalando a versão em Python (a forma 4)

Só compensa se você for publicar num servidor — para uso próprio, o arquivo único faz
o mesmo sem instalar nada.

1. Instale o **Python** em <https://www.python.org/downloads/windows/>.
   Na primeira tela do instalador, **marque "Add python.exe to PATH"**.
2. Baixe esta pasta para o seu computador.
3. Dê dois cliques em **`iniciar.bat`**.

O navegador abre sozinho em `http://localhost:8756`. Para encerrar, feche a janela preta.
Seus dados ficam em `C:\Users\<seu usuário>\CicloConcursos\dados.db`.

---

## Como publicar na internet de graça

O sistema guarda tudo num arquivo SQLite. Isso descarta a maioria das hospedagens
gratuitas: elas apagam o disco a cada reinício, e o seu progresso iria junto.

| Serviço | Serve? |
|---|---|
| **PythonAnywhere** | Sim — 512 MB de disco que persiste, sem cartão de crédito |
| Render (grátis) | Não — disco efêmero; o Postgres gratuito expira em 30 dias |
| Fly.io | Não — encerrou a camada gratuita |
| Koyeb | Arriscado — o disco some no redeploy |
| Oracle Cloud (Always Free) | Sim, mas exige cartão e administrar um servidor |

### Passo a passo no PythonAnywhere

1. Crie a conta gratuita em <https://www.pythonanywhere.com/registration/register/beginner/>.
2. Em **Consoles → Bash**, traga o código:
   ```bash
   git clone https://github.com/SEU_USUARIO/SEU_REPO.git ciclo-concursos
   ```
   (Se o `git clone` não passar, envie o .zip pela aba **Files** e descompacte com `unzip`.)
3. Em **Web → Add a new web app**, escolha **Manual configuration** e a versão de
   Python mais nova da lista.
4. Ainda na aba **Web**, clique no link do **WSGI configuration file** e troque todo
   o conteúdo por:
   ```python
   import os, sys
   CAMINHO = "/home/SEU_USUARIO/ciclo-concursos"
   sys.path.insert(0, CAMINHO)
   os.environ["CICLO_MODO"] = "servidor"
   os.environ["CICLO_DB"] = CAMINHO + "/dados.db"
   from wsgi import application
   ```
5. Clique em **Reload** e abra `https://SEU_USUARIO.pythonanywhere.com`.
6. A primeira tela pede para **criar a sua senha**. Nada é gravado nem mostrado
   antes disso.

Duas coisas para saber da conta gratuita: o endereço é `SEU_USUARIO.pythonanywhere.com`
(não dá para usar domínio próprio), e a web app precisa ser renovada de tempos em
tempos com um clique — eles avisam por e-mail. Se você deixar vencer, o site sai do
ar mas **os dados continuam lá**; basta renovar.

Faça o backup pela aba Ajustes de vez em quando, de qualquer jeito.

---

## Senha e acesso

- **Em casa** (`iniciar.bat`), sem senha cadastrada, o sistema abre direto: ele só
  escuta em `127.0.0.1`, então quem está na frente do computador já é o dono. Se
  quiser, crie uma senha em Ajustes e ela passa a ser exigida.
- **Na internet** (`CICLO_MODO=servidor`), a senha é obrigatória. Sem ela cadastrada,
  a única coisa que o sistema aceita fazer é criar a primeira senha — nenhum dado
  sai e nenhuma escrita entra.

A senha é guardada como hash PBKDF2-SHA256 com 240 mil iterações e sal aleatório,
nunca em texto puro. A sessão é um cookie assinado (HMAC-SHA256), `HttpOnly`,
`SameSite=Lax` e `Secure` quando há HTTPS, válido por 30 dias. Trocar a senha
derruba as sessões abertas nos outros aparelhos.

---

## O método

### 1. Matérias em ordem de importância, com peso

Cadastre as matérias na ordem do edital e dê um **peso de 1 a 5** para cada uma.
O peso decide a frequência no rodízio: uma matéria peso 3 aparece três vezes mais
que uma peso 1. Duas tarefas da mesma matéria nunca caem em sequência.

O peso deve sair de duas coisas: **quantas questões a matéria vale na prova** e
**o quanto ela te derruba**. Matéria que vale 20 questões e você vai mal merece
peso 3; matéria que vale 5 e você domina merece peso 1.

### 2. Blocos de 3 a 5 aulas

As aulas de cada matéria são agrupadas em blocos de tamanho parecido. O sistema
escolhe sozinho quantos blocos (mirando 4 aulas por bloco), ou você fixa o número.
O bloco é a unidade do ciclo: você lê o bloco inteiro antes de revisar qualquer
coisa dele.

### 3. Leitura fatiada por páginas, não por aula

Você informa o **total de páginas (T)** do PDF da aula. Enquanto esse número estiver
em branco, a aula **fica fora do ciclo** — ela não tem como ser fatiada, então não
entra na fila nem conta como lida. O sistema avisa quantas aulas estão nessa situação,
para você preencher conforme for baixando os PDFs. O sistema divide em sessões
de **10 a 20 páginas** — sempre o menor número de sessões que respeite o teto, com
as páginas distribuídas por igual.

| Total | Sessões | Páginas de cada uma |
|---|---|---|
| 59  | 3 | 20, 20, 19 |
| 76  | 4 | 19, 19, 19, 19 |
| 122 | 7 | 18, 18, 18, 17, 17, 17, 17 |

Ao concluir uma sessão, o rodízio passa para a próxima matéria. A aula continua
de onde parou quando a vez dela voltar.

### 4. O ciclo dentro do bloco

```
LEITURA    aula 1 → aula 2 → aula 3 → aula 4     (o bloco inteiro, sessão a sessão)
           + 5 questões de fixação ao terminar cada aula

REVISÃO    volta à aula 1 do bloco
           releitura em ritmo dobrado (20 a 40 páginas por sessão)
           + 10 questões ao terminar a revisão de cada aula

REFORÇO    só as aulas que ficaram abaixo da meta
           nova revisão + nova bateria, até passar ou esgotar as rodadas

→ próximo bloco
```

### 5. O sarrafo

Ao registrar uma bateria, o sistema compara o resultado com o **sarrafo** — a nota de
corte, 80% por padrão. Quem passa fica **consolidado** e sai do reforço. Quem não passa volta.

O sarrafo é ajustável de duas maneiras:

- **Geral**, em Ajustes, valendo para tudo que não tenha regra própria.
- **Por matéria**, na aba Matérias: deixe em branco para herdar o geral, ou fixe o
  número daquela matéria. Informática cobrada em 90% e Português em 80% é uma
  configuração legítima — exigência igual para matérias desiguais é que não é.

Subir o sarrafo vale para trás, não só para a frente: uma aula aprovada com 80% que
fique abaixo do novo corte **volta para o reforço** na próxima vez que o ciclo passar
por ela. É assim que se aperta o padrão sem recomeçar nada.

Duas travas importantes:

- **A aula é julgada pela última medição, não pela média da vida.** Você foi mal na
  primeira vez e bem no reforço? Você aprendeu. A média histórica fica registrada,
  mas quem decide o reforço é a medição mais recente.
- **Amostra pequena não aprova ninguém.** Existe um mínimo de questões
  (`minimo_questoes_avaliacao`) para que 80% signifique alguma coisa. Com 10 questões,
  acertar 8 pode ser sorte. Se você levar a sério, suba esse número para 20 ou 30.

Se uma aula esgotar as rodadas de reforço sem bater a meta, o ciclo **segue em frente**
e a aula fica sinalizada em vermelho. O ciclo não pode travar por causa de um assunto —
mas você também não pode fingir que ele não existe.

---

## O que foi acrescentado ao método original

Cinco coisas que a planilha não fazia e que mudam o resultado:

**1. Revisão espaçada depois do bloco.** No método original, uma aula que você tirou
90% nunca mais é revista — e em dois meses ela evapora. Ao consolidar uma aula, o
sistema agenda revisões para **7, 30 e 90 dias**. Elas aparecem no topo da tela Hoje
quando vencem, na frente da fila normal.

**2. Questões logo depois da leitura.** Esperar o bloco inteiro para ver a primeira
questão é tarde demais. São 5 questões de fixação ao terminar cada aula, só para
descobrir se você entendeu — o resultado não conta para a meta do bloco. A bateria
que vale continua sendo a da revisão.

**3. Pontos-chave escritos de memória.** Ao fechar cada sessão de leitura, o sistema
pede 2 ou 3 ideias centrais **sem olhar o PDF**. Isso é recuperação ativa: o
esforço de lembrar é o que fixa, não a releitura. Leva 40 segundos e vale mais que
a sessão inteira de leitura passiva.

**4. Caderno de erros por assunto.** Cada questão errada é registrada com o assunto
e o motivo (não sabia, desatenção, interpretação, pegadinha, faltou decorar).
O sistema monta o ranking dos assuntos que mais te derrubam. Essa lista é o material
mais valioso do sistema — é o que você revisa na véspera.

**5. Projeção de término.** A tela Hoje mostra quantas tarefas faltam, seu ritmo real
das últimas 4 semanas e a data prevista para terminar. Se a data cair depois da prova,
você descobre agora e não em cima da hora — e corta matéria ou aumenta o ritmo.

---

## As telas

Três lugares, porque são três coisas diferentes:

| Tela | Para quê |
|---|---|
| **Estudar** | A tarefa da vez e nada mais. Abra, faça, registre, feche. |
| **Progresso** | Como o método está indo: matéria → bloco → aula, num lugar só, mais o caderno de erros. |
| **Ajustes** | O sarrafo, as matérias e aulas, os números do ciclo e o backup. |

A tela de Estudar tem um único cartão — a tarefa. O resto da página é lista simples,
porque quando tudo tem moldura nada se destaca.

---

## Ajustes disponíveis

| Ajuste | Padrão | O que muda |
|---|---|---|
| Mínimo/máximo de páginas por sessão | 10 / 20 | O tamanho de cada sessão de leitura |
| Aceleração da revisão | 2,0 | Revisão a 20–40 páginas por sessão |
| Questões por bateria | 10 | Tamanho da bateria da revisão e do reforço |
| Questões de fixação | 5 | Bateria curta após a leitura de cada aula |
| Sarrafo geral | 80% | O corte entre consolidar e voltar ao reforço |
| Sarrafo por matéria | herda o geral | Corte próprio de uma matéria, na aba Matérias |
| Mínimo de questões para julgar | 10 | Trava contra amostra pequena |
| Rodadas de reforço | 3 | Quantas vezes uma aula fraca é retomada |
| Tamanho alvo do bloco | 4 | Referência para o agrupamento automático |
| Revisões espaçadas | 7, 30, 90 | Os intervalos em dias |

---

## Para desenvolvedores

Python 3.8+ da biblioteca padrão. Sem dependências.

```
celular/              o app: index.html com tudo dentro (fontes inclusive),
                      manifest e service worker — vira PWA ou entra no APK
android/              projeto Gradle da casca WebView que empacota o APK
.github/workflows/    o fluxo que monta o APK no GitHub
CicloConcursos.html   o mesmo app para abrir do disco no computador
app/
  db.py        esquema SQLite e configuração
  ciclo.py     o motor: divisão de páginas, blocos, fases e rodízio ponderado
  api.py       regras de aplicação
  auth.py      senha (PBKDF2) e sessão (cookie assinado)
  rotas.py     roteamento e controle de acesso, comuns aos dois modos
  server.py    servidor HTTP local (adaptador fino sobre rotas.py)
  web/         interface (HTML, CSS e JavaScript sem framework)
wsgi.py        entrada para hospedagem WSGI (adaptador fino sobre rotas.py)
testes/
  test_ciclo.py    método: páginas, blocos, rodízio, fases, sarrafo
  test_acesso.py   senha, sessão e o que vaza sem login
```

```bash
python -m app                              # inicia local
python -m unittest discover -s testes      # testes
```

Os dois modos de execução passam pelo mesmo `rotas.despachar`, de propósito: as
regras de acesso valem nos dois, e não existe um caminho "de produção" que nenhum
teste percorreu.

A versão online é uma página única com o mesmo motor portado para JavaScript e os
dados no banco do artefato. As duas precisam concordar: qualquer mudança de regra
(divisão de páginas, montagem de blocos, sarrafo) vale para as duas.

Toda a lógica do ciclo está em `app/ciclo.py`. O banco guarda apenas o que já foi
**concluído**; o que está pendente é recalculado a cada consulta. Trocar a divisão
de páginas ou o tamanho dos blocos reorganiza o plano na hora, sem migração.
