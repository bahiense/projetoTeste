/*
 * O conteúdo do programa, separado da lógica: texto é o que mais muda, e
 * mexer nele não deveria arriscar quebrar o app.
 */

// Os seis passos do protocolo, com a duração de cada um. O app conduz por
// eles em sequência; os segundos são os mesmos do cartão impresso.
const PROTOCOLO = [
  {
    id: 'parar',
    rotulo: 'Pare o corpo',
    seg: 8,
    tipo: 'texto',
    linha: 'Mãos para baixo. Boca fechada. Telefone na mesa.',
    apoio: 'Nenhuma palavra, nenhuma mensagem enviada. A primeira vitória é não agir — não é se acalmar.'
  },
  {
    id: 'respirar',
    rotulo: 'Respire',
    seg: 42,
    tipo: 'respiracao',
    linha: 'Siga o círculo.',
    apoio: 'Duas inspirações pelo nariz, a segunda curta por cima da primeira. Depois solte todo o ar pela boca, devagar.'
  },
  {
    id: 'nomear',
    rotulo: 'Nomeie',
    seg: 20,
    tipo: 'nomear',
    linha: 'O que é isto, exatamente?',
    apoio: 'Palavra exata baixa a ativação. Palavra vaga mantém.'
  },
  {
    id: 'orientar',
    rotulo: 'Oriente-se',
    seg: 25,
    tipo: 'orientar',
    linha: 'Volte para o lugar onde você está.',
    apoio: 'Três coisas que você vê. Dois sons. Os pés no chão. Isso tira o cérebro do modo ameaça.'
  },
  {
    id: 'perguntar',
    rotulo: 'Pergunte',
    seg: 20,
    tipo: 'texto',
    linha: 'O que essa emoção quer que eu faça?',
    apoio: 'E agora a outra: o que eu decidi, num momento calmo, fazer aqui? São respostas diferentes. A segunda é a sua.'
  },
  {
    id: 'agir',
    rotulo: 'Execute o roteiro novo',
    seg: 15,
    tipo: 'texto',
    linha: 'Uma ação. Um passo só.',
    apoio: 'Se ainda estiver acima de 7, a ação é sempre a mesma: adiar a resposta em 20 minutos e sair do lugar.'
  }
];

const EMOCOES = ['Raiva', 'Medo', 'Ansiedade', 'Tristeza', 'Vergonha', 'Culpa', 'Rejeição', 'Frustração', 'Solidão', 'Ciúme'];

const CORPO = ['Peito', 'Garganta', 'Estômago', 'Mandíbula', 'Ombros', 'Cabeça', 'Mãos', 'Costas'];

// Ferramentas guiadas. Cada passo vira uma tela; `seg` liga o cronômetro.
const FERRAMENTAS = [
  {
    id: 'respiracao',
    nome: 'Respiração fisiológica',
    grupo: 'Corpo',
    dur: '90 s',
    quando: 'A ativação está alta e você precisa de efeito em menos de dois minutos.',
    passos: [
      {texto: 'Sente ou fique de pé com as costas apoiadas. Solte os ombros.', seg: 10},
      {texto: 'Siga o círculo: duas inspirações pelo nariz, expiração longa pela boca.', seg: 60, tipo: 'respiracao'},
      {texto: 'Respire normal e repare no que mudou no corpo.', seg: 15}
    ]
  },
  {
    id: 'orientacao',
    nome: 'Orientação 3–2–1',
    grupo: 'Corpo',
    dur: '60 s',
    quando: 'Você "sai do ar", sente o mundo distante, ou a ansiedade vira onda de pânico.',
    passos: [
      {texto: 'Nomeie em voz baixa três objetos que você vê. Com detalhe: "caneca azul, lascada na borda".', seg: 20},
      {texto: 'Agora dois sons que você ouve neste momento.', seg: 15},
      {texto: 'Um ponto de contato: os pés no chão. Empurre o chão com eles e conte até cinco.', seg: 15}
    ]
  },
  {
    id: 'descarga',
    nome: 'Descarga física',
    grupo: 'Corpo',
    dur: '3 min',
    quando: 'O corpo pede ação: raiva, agitação, vontade de responder na hora.',
    passos: [
      {texto: 'Saia do ambiente. Isto não é fuga, é troca de contexto.', seg: 15},
      {texto: 'Vinte agachamentos, uma subida de escada, ou caminhada rápida. Comece agora.', seg: 90},
      {texto: 'Água fria no rosto e nos punhos.', seg: 20},
      {texto: 'Só agora decida o que dizer.', seg: 10}
    ]
  },
  {
    id: 'rotulo',
    nome: 'Rótulo preciso',
    grupo: 'Mente',
    dur: '30 s',
    quando: 'Em toda ativação. É o exercício mais barato e o de maior retorno.',
    passos: [
      {texto: 'Complete, em voz baixa: "isto é ____, intensidade ____, sobre ____, e sinto em ____".', seg: 20},
      {texto: 'Se não achar a palavra: medo, raiva, tristeza, vergonha, nojo, culpa, inveja, solidão. Uma delas serve.', seg: 15}
    ]
  },
  {
    id: 'abc',
    nome: 'Desmontagem ABC',
    grupo: 'Mente',
    dur: '5 min',
    quando: 'Uma vez por dia, sobre o episódio mais forte. Produz o material de todo o resto.',
    passos: [
      {texto: 'Situação: só fatos, como uma câmera registraria.'},
      {texto: 'Pensamento automático: a frase exata que passou pela cabeça.'},
      {texto: 'Emoção e corpo: nome, intensidade, lugar.'},
      {texto: 'Impulso: o que você quis fazer.'},
      {texto: 'Ação: o que você fez de fato.'},
      {texto: 'Custo: o que isso cobrou de você e dos outros.'},
      {texto: 'Alternativa: o que você faria com trinta segundos a mais.'}
    ]
  },
  {
    id: 'defusao',
    nome: 'Defusão',
    grupo: 'Mente',
    dur: '2 min',
    quando: 'Um pensamento grudou e você fica argumentando com ele há horas.',
    passos: [
      {texto: 'Escreva o pensamento em uma frase. Por exemplo: "sou um fracasso".', seg: 20},
      {texto: 'Repita dez vezes: "estou tendo o pensamento de que...". Devagar.', seg: 40},
      {texto: 'Agora só a palavra-chave, em voz alta, rápido, até virar som sem sentido.', seg: 40},
      {texto: 'O pensamento continua aí — mas perdeu peso. O objetivo não era acreditar no contrário.', seg: 15}
    ]
  },
  {
    id: 'evidencia',
    nome: 'Teste de evidência',
    grupo: 'Mente',
    dur: '5 min',
    quando: 'Sobre a regra por trás do pensamento, não sobre o pensamento avulso.',
    passos: [
      {texto: 'Qual é a regra? Algo como "se me criticam, não valho nada". Escreva em uma frase.'},
      {texto: 'Fatos concretos que sustentam a regra. Fatos, não sensações.'},
      {texto: 'Fatos que a contradizem — inclusive os pequenos que você desconta.'},
      {texto: 'O que você diria a um amigo que te contasse exatamente isso.'},
      {texto: 'Escreva a versão mais verdadeira E mais útil. Se você não acredita nela, reescreva.'}
    ]
  },
  {
    id: 'seentao',
    nome: 'Plano se–então',
    grupo: 'Ação',
    dur: '3 min',
    quando: 'O coração da reprogramação. Sem isto, o resto vira só autoconhecimento.',
    passos: [
      {texto: 'Fórmula: "Quando [deixa muito específica], eu vou [ação de um passo só]".'},
      {texto: 'Ruim: "quando eu ficar bravo, vou me controlar". Bom: "quando ela cruzar os braços e mudar o tom, eu vou colocar as mãos na mesa e dizer: me dá um minuto".'},
      {texto: 'Escreva três. No máximo três. Decore.'},
      {texto: 'A ação precisa ser executável com o corpo ligado. Se exige clareza mental, não vai funcionar.'}
    ]
  },
  {
    id: 'surfar',
    nome: 'Surfar o impulso',
    grupo: 'Ação',
    dur: '3 min',
    quando: 'A vontade de executar o roteiro velho é forte: brigar, checar, beber, mandar a mensagem.',
    passos: [
      {texto: 'Não lute contra o impulso e não obedeça a ele. Só observe.', seg: 20},
      {texto: 'Descreva a onda como se fosse clima: onde começa, quanto sobe, se muda de lugar.', seg: 60},
      {texto: 'Conte as respirações até ela ceder. Toda onda cede; nenhuma é infinita.', seg: 80},
      {texto: 'Ela cedeu, e você não agiu. Isso é a repetição que constrói o circuito novo.', seg: 15}
    ]
  },
  {
    id: 'ensaio',
    nome: 'Ensaio mental',
    grupo: 'Ação',
    dur: '5 min',
    quando: 'Toda noite, a partir do dia 16. É a repetição que não depende da situação acontecer.',
    passos: [
      {texto: 'Feche os olhos. Reconstrua o gatilho com detalhe: o lugar, a luz, a voz, o que você sente no corpo.', seg: 60},
      {texto: 'Deixe a ativação subir um pouco. Se não sobe nada, o ensaio está raso demais.', seg: 40},
      {texto: 'Agora execute mentalmente o protocolo inteiro e o seu se–então, até o fim, incluindo o que você diz.', seg: 90},
      {texto: 'Termine com a cena resolvida. Nunca pare no meio da cena difícil.', seg: 30}
    ]
  },
  {
    id: 'reparo',
    nome: 'Reparo sem vergonha',
    grupo: 'Ação',
    dur: '10 min',
    quando: 'Depois de escorregar. É obrigatório, e é o que a maioria pula.',
    passos: [
      {texto: 'Vergonha alimenta o circuito: aumenta a ativação e torna a próxima recaída mais provável. Reparo interrompe.'},
      {texto: 'Três frases, sem defesa e sem autoflagelo: o que eu fiz.'},
      {texto: 'Qual foi o efeito na outra pessoa.'},
      {texto: 'O que farei diferente.'},
      {texto: 'Entregue o reparo de verdade, quando couber. Uma mensagem curta basta.'},
      {texto: 'Volte ao programa hoje mesmo. Um dia perdido é um dia; um dia perdido mais uma semana de culpa são oito.'}
    ]
  }
];

const DIAS = [
  [1, 'Inventário', 'Liste seus cinco gatilhos mais caros. Para cada um: a deixa exata, o que você faz, o que já custou. Pratique a respiração fisiológica três vezes hoje, sem estar ativado.'],
  [2, 'Rótulo', 'A cada ativação, diga baixinho: "isto é [emoção], intensidade [0–10]". Meta de hoje: três rótulos até a noite. Não precisa fazer mais nada com eles.'],
  [3, 'Mapa do corpo', 'Onde o gatilho aparece primeiro — mandíbula, peito, estômago, ombros, mãos? Registre dois episódios com o lugar exato e o sinal mais precoce que você conseguir pegar.'],
  [4, 'Latência', 'Meça o intervalo entre a deixa e a sua reação. Regra única de hoje: três respirações antes de qualquer resposta, falada ou digitada.'],
  [5, 'Precursores', 'Sono ruim, fome, álcool, horário, pessoa específica, cansaço acumulado. Descubra o que te deixa três vezes mais inflamável e escreva a lista.'],
  [6, 'Custo', 'Escreva sem suavizar o que as reações automáticas custaram nos últimos doze meses: relações, dinheiro, oportunidades, saúde, tempo.'],
  [7, 'Alvo', 'Releia a semana inteira. Escolha UM gatilho como alvo das próximas duas semanas — o mais frequente, não o mais dramático. Frequência é o que dá repetição para treinar.'],
  [8, 'ABC', 'Faça a desmontagem completa de um episódio do gatilho-alvo. Os sete campos, sem pressa. Guarde: você vai usar este texto nos próximos cinco dias.'],
  [9, 'A regra por trás', 'Todo pensamento automático obedece a uma regra antiga: "se me criticam, não valho nada", "se eu precisar de alguém, me abandonam". Escreva a sua em uma frase.'],
  [10, 'Evidência', 'Fatos a favor da regra. Fatos contra — inclusive os pequenos que você desconta. O que você diria a um amigo com essa regra. Feche com a versão mais verdadeira e mais útil.'],
  [11, 'Defusão', 'Pegue o pensamento mais pesado. Repita dez vezes "estou tendo o pensamento de que…". Depois só a palavra-chave, trinta vezes em voz alta, até virar som.'],
  [12, 'Origem', 'Quando você aprendeu essa resposta? Quantos anos tinha? Escreva três frases para quem aprendeu. Sem análise e sem terapia de si mesmo — só reconhecimento.'],
  [13, 'Frase-âncora', 'Escreva a frase nova: curta, primeira pessoa, crível. Não "eu sou incrível". Algo como "posso ouvir isso e continuar inteiro". Se você não acredita nela, reescreva.'],
  [14, 'Instalação', 'Leia a frase-âncora em voz alta de manhã e à noite. Revise a semana: a intensidade média dos seus episódios caiu, subiu ou ficou igual?'],
  [15, 'Se–então', 'Escreva três planos "quando X, eu faço Y" para o gatilho-alvo. Deixas muito específicas, ações de um passo só. Decore os três.'],
  [16, 'Ensaio', 'Cinco minutos de ensaio mental: o gatilho em detalhe sensorial e você executando a nova resposta até o fim. Repita todas as noites daqui em diante.'],
  [17, 'Exposição leve', 'Procure de propósito uma situação nível 3/10. Surfe o impulso por noventa segundos sem agir. Registre a intensidade antes e depois.'],
  [18, 'Exposição média', 'Nível 5/10. Protocolo completo. Anote três números: intensidade antes, no pico, e dez minutos depois.'],
  [19, 'Reparo', 'Escolha uma situação que o gatilho estragou. Faça um reparo real hoje — uma mensagem, uma conversa, uma devolução. Três frases, sem defesa e sem autoflagelo.'],
  [20, 'Real', 'A próxima situação de verdade que aparecer, ou uma de nível 7/10. Protocolo completo, se–então executado até o fim, registro no mesmo dia.'],
  [21, 'Balanço', 'Compare a intensidade média da primeira semana com a da terceira. Escreva o seu protocolo pessoal em uma página: suas deixas, seus três se–então, sua frase-âncora.']
];

const SEMANAS = [
  {n: 1, nome: 'Mapear', sub: 'ver o mecanismo antes de tentar mudá-lo'},
  {n: 2, nome: 'Desmontar', sub: 'separar o fato do significado que você deu a ele'},
  {n: 3, nome: 'Instalar', sub: 'praticar ativado, que é a única forma que ensina'}
];

const ROTINA = {
  manha: [
    'Respiração fisiológica, 3 ciclos',
    'Frase-âncora em voz alta, 2 vezes',
    'Prever: "hoje o risco é ___, e meu se–então é ___"'
  ],
  noite: [
    'Desmontagem ABC do episódio mais forte',
    'Ensaio mental, 5 minutos',
    'Marcar o dia do programa'
  ]
};

// Texto de apoio, lido fora da crise.
const LEITURA = [
  {
    titulo: 'Como um gatilho funciona',
    blocos: [
      ['Deixa', 'Um tom de voz, um silêncio, uma mensagem não respondida, um horário. É pequeno e específico — por isso passa despercebido.'],
      ['Descarga', 'Em milésimos de segundo o alarme dispara: calor, aperto, mandíbula travada. Isso acontece antes de qualquer pensamento consciente, e é a parte que você não controla.'],
      ['Roteiro', 'Atacar, sumir, justificar, checar o celular, beber, engolir e guardar. Você não escolhe: é o mais praticado. Esta é a parte que muda.'],
      ['Alívio', 'O roteiro dá alívio imediato e custo adiado. O alívio é o que ensina o circuito — por isso a reação piora a vida e mesmo assim se repete.']
    ]
  },
  {
    titulo: 'Quatro regras do treino',
    blocos: [
      ['Você não apaga o circuito antigo', 'Constrói um mais forte ao lado. Por isso o padrão velho reaparece quando você dorme mal, bebe ou está com fome. Recaída não é fracasso do método: é a assinatura de como ele funciona.'],
      ['Nomear com precisão reduz', '"Tô mal" não faz nada. "Estou com medo de ser excluído, 7, no peito" baixa a ativação de forma mensurável.'],
      ['O que não é praticado ativado não é aprendido', 'Respirar bem no sofá prepara. O aprendizado acontece quando você executa a resposta nova com o corpo ligado.'],
      ['Repetição espaçada vence intensidade', 'Doze minutos por dia mudam mais do que um fim de semana de imersão. A consistência é o ingrediente ativo.']
    ]
  },
  {
    titulo: 'Como saber se está funcionando',
    blocos: [
      ['Olhe quatro números', 'Intensidade média no pico. Latência: quantos segundos entre a deixa e a reação — o que mais cresce. Quantos episódios você rodou o protocolo até o fim. Tempo de recuperação.'],
      ['Ignore se você ainda sente', 'Sentir não é falhar. O objetivo nunca foi deixar de ser afetado, foi deixar de ser conduzido. Você venceu quando sentiu 8 e agiu como se fosse 3.'],
      ['Expectativa honesta', 'Em 21 dias você sai do piloto automático e ganha latência. A mudança estrutural de um padrão antigo leva meses de repetição. Isto aqui é o começo de uma prática, não uma cura de três semanas.'],
      ['Quando procurar ajuda', 'Se o que te ativa envolve trauma, pânico recorrente, dependência, compulsão que você não interrompe, ou pensamentos de se machucar, este app é complemento e não substituto. Fazer os dois juntos funciona melhor que qualquer um sozinho.']
    ]
  }
];
