# Ciclo Concursos

Sistema de estudos cíclicos para concurso público, feito para rodar no seu Windows,
no seu navegador, com os dados guardados no seu computador. Sem internet, sem conta,
sem mensalidade.

É a versão em programa da planilha de ciclo: matérias em rodízio, PDF fatiado em
sessões de leitura, revisão do bloco inteiro com exercícios e reforço automático do
que ficou abaixo da meta.

---

## Como instalar

1. Instale o **Python** em <https://www.python.org/downloads/windows/>.
   Na primeira tela do instalador, **marque "Add python.exe to PATH"**.
2. Baixe esta pasta para o seu computador.
3. Dê dois cliques em **`iniciar.bat`**.

O navegador abre sozinho em `http://localhost:8756`. Para encerrar, feche a janela preta.

Seus dados ficam em `C:\Users\<seu usuário>\CicloConcursos\dados.db`.
Em **Ajustes** há um botão para baixar um backup — use de vez em quando.

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

Você informa o **total de páginas (T)** do PDF da aula. O sistema divide em sessões
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

### 5. A meta de 80%

Ao registrar uma bateria, o sistema compara o resultado com a meta (80% por padrão).
Quem passa fica **consolidado** e sai do reforço. Quem não passa volta.

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

| Tela | Para quê |
|---|---|
| **Hoje** | A tarefa da vez e nada mais. Abra, faça, registre, feche. |
| **Ciclo** | Mapa dos blocos de cada matéria, colorido por situação. |
| **Matérias** | Cadastro de matérias, pesos e aulas (com o total de páginas). |
| **Desempenho** | Aproveitamento por aula, bloco e matéria. Aqui se vê o que está furado. |
| **Caderno de erros** | Ranking dos assuntos que mais derrubam. |
| **Determinações** | Por que você está fazendo isso. Leia antes de começar. |
| **Ajustes** | Os números do ciclo e o backup. |

---

## Ajustes disponíveis

| Ajuste | Padrão | O que muda |
|---|---|---|
| Mínimo/máximo de páginas por sessão | 10 / 20 | O tamanho de cada sessão de leitura |
| Aceleração da revisão | 2,0 | Revisão a 20–40 páginas por sessão |
| Questões por bateria | 10 | Tamanho da bateria da revisão e do reforço |
| Questões de fixação | 5 | Bateria curta após a leitura de cada aula |
| Meta de acerto | 80% | O corte entre consolidar e voltar ao reforço |
| Mínimo de questões para julgar | 10 | Trava contra amostra pequena |
| Rodadas de reforço | 3 | Quantas vezes uma aula fraca é retomada |
| Tamanho alvo do bloco | 4 | Referência para o agrupamento automático |
| Revisões espaçadas | 7, 30, 90 | Os intervalos em dias |

---

## Para desenvolvedores

Python 3.8+ da biblioteca padrão. Sem dependências.

```
app/
  db.py        esquema SQLite e configuração
  ciclo.py     o motor: divisão de páginas, blocos, fases e rodízio ponderado
  api.py       regras de aplicação
  server.py    servidor HTTP local
  web/         interface (HTML, CSS e JavaScript sem framework)
testes/
  test_ciclo.py
```

```bash
python -m app                              # inicia
python -m unittest discover -s testes      # testes
```

Toda a lógica do ciclo está em `app/ciclo.py`. O banco guarda apenas o que já foi
**concluído**; o que está pendente é recalculado a cada consulta. Trocar a divisão
de páginas ou o tamanho dos blocos reorganiza o plano na hora, sem migração.
