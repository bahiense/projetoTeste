/*
 * O conteúdo do app, separado da lógica.
 *
 * Os versículos estão em Almeida de domínio público. A referência vem sempre
 * junto do texto, de propósito: quem usa o app deve poder conferir na própria
 * Bíblia, e não depender da palavra de um aplicativo.
 */

// Os tipos de tentação servem para duas coisas: nomear diante de Deus, que
// já interrompe a corrente cedo, e escolher a passagem certa para o passo da
// Palavra.
const TENTACOES = [
  {id: 'impureza',  nome: 'Impureza',   versiculo: 'jo31'},
  {id: 'ira',       nome: 'Ira',        versiculo: 'tg119'},
  {id: 'lingua',    nome: 'Língua',     versiculo: 'pv2123'},
  {id: 'orgulho',   nome: 'Orgulho',    versiculo: 'pv1618'},
  {id: 'inveja',    nome: 'Inveja',     versiculo: 'tg316'},
  {id: 'avareza',   nome: 'Avareza',    versiculo: 'hb135'},
  {id: 'vicio',     nome: 'Vício',      versiculo: '1co612'},
  {id: 'amargura',  nome: 'Amargura',   versiculo: 'ef431'},
  {id: 'preguica',  nome: 'Preguiça',   versiculo: 'cl323'},
  {id: 'ansiedade', nome: 'Ansiedade',  versiculo: '1pe57'},
  {id: 'mentira',   nome: 'Mentira',    versiculo: 'ef425'},
  {id: 'outro',     nome: 'Outro',      versiculo: '1co1013'}
];

const VERSICULOS = {
  '1co1013': {ref: '1 Coríntios 10:13', texto: 'Não veio sobre vós tentação, senão humana; mas fiel é Deus, que não vos deixará tentar acima do que podeis, antes com a tentação dará também o escape, para que a possais suportar.'},
  'tg47':    {ref: 'Tiago 4:7',         texto: 'Sujeitai-vos, pois, a Deus, resisti ao diabo, e ele fugirá de vós.'},
  'mt2641':  {ref: 'Mateus 26:41',      texto: 'Vigiai e orai, para que não entreis em tentação; na verdade, o espírito está pronto, mas a carne é fraca.'},
  'gn3912':  {ref: 'Gênesis 39:12',     texto: 'E ela lhe pegou pela sua roupa, dizendo: Deita-te comigo. E ele deixou a sua roupa na mão dela, e fugiu, e saiu para fora.'},
  '2tm222':  {ref: '2 Timóteo 2:22',    texto: 'Foge também dos desejos da mocidade; e segue a justiça, a fé, a caridade, a paz com os que, com um coração puro, invocam o Senhor.'},
  'tg114':   {ref: 'Tiago 1:14-15',     texto: 'Mas cada um é tentado, quando atraído e engodado pela sua própria concupiscência. Depois, havendo a concupiscência concebido, dá à luz o pecado; e o pecado, sendo consumado, gera a morte.'},
  'hb415':   {ref: 'Hebreus 4:15-16',   texto: 'Porque não temos um sumo sacerdote que não possa compadecer-se das nossas fraquezas; porém, um que, como nós, em tudo foi tentado, mas sem pecado. Cheguemos, pois, com confiança ao trono da graça.'},
  '1jo19':   {ref: '1 João 1:9',        texto: 'Se confessarmos os nossos pecados, ele é fiel e justo para nos perdoar os pecados, e nos purificar de toda a injustiça.'},
  'rm81':    {ref: 'Romanos 8:1',       texto: 'Portanto, agora nenhuma condenação há para os que estão em Cristo Jesus.'},
  'lm322':   {ref: 'Lamentações 3:22-23', texto: 'As misericórdias do Senhor são a causa de não sermos consumidos; porque as suas misericórdias não têm fim. Novas são cada manhã; grande é a tua fidelidade.'},
  '2co710':  {ref: '2 Coríntios 7:10',  texto: 'Porque a tristeza segundo Deus opera arrependimento para a salvação, da qual ninguém se arrepende; mas a tristeza do mundo opera a morte.'},
  'pv2416':  {ref: 'Provérbios 24:16',  texto: 'Porque sete vezes cairá o justo, e se levantará.'},
  'sl11911': {ref: 'Salmos 119:11',     texto: 'Escondi a tua palavra no meu coração, para eu não pecar contra ti.'},
  'sl11937': {ref: 'Salmos 119:37',     texto: 'Desvia os meus olhos de contemplarem a vaidade, e vivifica-me no teu caminho.'},
  'sl13923': {ref: 'Salmos 139:23-24',  texto: 'Sonda-me, ó Deus, e conhece o meu coração; prova-me, e conhece os meus pensamentos. E vê se há em mim algum caminho mau, e guia-me pelo caminho eterno.'},
  'sl461':   {ref: 'Salmos 46:1',       texto: 'Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.'},
  'sl5110':  {ref: 'Salmos 51:10',      texto: 'Cria em mim, ó Deus, um coração puro, e renova em mim um espírito reto.'},
  'mt44':    {ref: 'Mateus 4:4',        texto: 'Está escrito: Nem só de pão viverá o homem, mas de toda a palavra que sai da boca de Deus.'},
  'ef617':   {ref: 'Efésios 6:17',      texto: 'Tomai também o capacete da salvação, e a espada do Espírito, que é a palavra de Deus.'},
  'tg516':   {ref: 'Tiago 5:16',        texto: 'Confessai as vossas culpas uns aos outros, e orai uns pelos outros, para que sareis.'},
  '1co618':  {ref: '1 Coríntios 6:18',  texto: 'Fugi da prostituição. Todo o pecado que o homem comete é fora do corpo; mas o que se prostitui peca contra o seu próprio corpo.'},
  'jo31':    {ref: 'Jó 31:1',           texto: 'Fiz concerto com os meus olhos; como pois attentaria numa virgem?'},
  'tg119':   {ref: 'Tiago 1:19-20',     texto: 'Todo o homem seja pronto para ouvir, tardio para falar, tardio para se irar. Porque a ira do homem não opera a justiça de Deus.'},
  'ef426':   {ref: 'Efésios 4:26',      texto: 'Irai-vos, e não pequeis; não se ponha o sol sobre a vossa ira.'},
  'pv2123':  {ref: 'Provérbios 21:23',  texto: 'O que guarda a sua boca e a sua língua, guarda a sua alma das angústias.'},
  'ef425':   {ref: 'Efésios 4:25',      texto: 'Pelo que deixai a mentira, e falai a verdade cada um com o seu próximo; porque somos membros uns dos outros.'},
  'pv1618':  {ref: 'Provérbios 16:18',  texto: 'A soberba precede a ruína, e a altivez do espírito precede a queda.'},
  'tg46':    {ref: 'Tiago 4:6',         texto: 'Deus resiste aos soberbos, porém dá graça aos humildes.'},
  'tg316':   {ref: 'Tiago 3:16',        texto: 'Porque onde há inveja e espírito faccioso aí há perturbação e toda a obra perversa.'},
  'hb135':   {ref: 'Hebreus 13:5',      texto: 'Sejam vossos costumes sem avareza, contentando-vos com o que tendes; porque ele disse: Não te deixarei, nem te desampararei.'},
  '1co612':  {ref: '1 Coríntios 6:12',  texto: 'Todas as coisas me são lícitas, mas nem todas as coisas convêm; todas as coisas me são lícitas, mas eu não me deixarei dominar por nenhuma.'},
  'ef518':   {ref: 'Efésios 5:18',      texto: 'E não vos embriagueis com vinho, em que há contenda, mas enchei-vos do Espírito.'},
  'ef431':   {ref: 'Efésios 4:31-32',   texto: 'Toda a amargura, e ira, e cólera, e gritaria, e blasfêmias e toda a malícia sejam tiradas dentre vós. Antes sede uns para com os outros benignos, misericordiosos, perdoando-vos uns aos outros, como também Deus vos perdoou em Cristo.'},
  'cl323':   {ref: 'Colossenses 3:23',  texto: 'E, tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor, e não aos homens.'},
  '1pe57':   {ref: '1 Pedro 5:7',       texto: 'Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.'},
  'fp46':    {ref: 'Filipenses 4:6-7',  texto: 'Não estejais inquietos por coisa alguma; antes as vossas petições sejam em tudo conhecidas diante de Deus pela oração e súplica, com ação de graças. E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos sentimentos em Cristo Jesus.'},
  'fp48':    {ref: 'Filipenses 4:8',    texto: 'Tudo o que é verdadeiro, tudo o que é honesto, tudo o que é justo, tudo o que é puro, tudo o que é amável, tudo o que é de boa fama, se há alguma virtude, e se há algum louvor, nisso pensai.'},
  'gl516':   {ref: 'Gálatas 5:16',      texto: 'Digo, porém: Andai em Espírito, e não cumprireis a concupiscência da carne.'},
  'rm1314':  {ref: 'Romanos 13:14',     texto: 'Mas revesti-vos do Senhor Jesus Cristo, e não tenhais cuidado da carne em suas concupiscências.'},
  'mt529':   {ref: 'Mateus 5:29-30',    texto: 'Portanto, se o teu olho direito te escandaliza, arranca-o e atira-o para longe de ti. Melhor te é que se perca um dos teus membros, do que todo o teu corpo seja lançado no inferno.'},
  'pv223':   {ref: 'Provérbios 22:3',   texto: 'O prudente vê o mal, e esconde-se; mas os simples passam, e pagam a pena.'},
  'pv423':   {ref: 'Provérbios 4:23',   texto: 'Sobre tudo o que se deve guardar, guarda o teu coração, porque dele procedem as saídas da vida.'},
  'ef428':   {ref: 'Efésios 4:28',      texto: 'Aquele que furtava, não furte mais; antes trabalhe, fazendo com as mãos o que é bom, para que tenha o que repartir com o que tiver necessidade.'},
  'rm62':    {ref: 'Romanos 6:1-2',     texto: 'Que diremos pois? Permaneceremos no pecado, para que a graça abunde? De modo nenhum. Nós, que estamos mortos para o pecado, como viveremos ainda nele?'},
  'tt211':   {ref: 'Tito 2:11-12',      texto: 'Porque a graça de Deus se há manifestado, trazendo salvação a todos os homens, ensinando-nos que, renunciando à impiedade e às concupiscências mundanas, vivamos neste presente século sóbria, e justa, e piamente.'},
  '1pe58':   {ref: '1 Pedro 5:8',       texto: 'Sede sóbrios; vigiai; porque o diabo, vosso adversário, anda em derredor, bramando como leão, buscando a quem possa tragar.'},
  'cl32':    {ref: 'Colossenses 3:2',   texto: 'Pensai nas coisas que são de cima, e não nas que são da terra.'},
  'sl1195':  {ref: 'Salmos 119:105',    texto: 'Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.'}
};

// O versículo que abre o dia. Gira sozinho pela data, para não virar escolha.
const VERSICULO_DO_DIA = ['1co1013', 'tg47', 'mt2641', 'sl11911', 'hb415', 'gl516',
  'sl461', 'rm1314', 'lm322', 'fp48', 'pv423', '1pe58', 'sl13923', 'cl32',
  'tg516', 'sl11937', 'pv223', 'rm81', 'tt211', 'sl1195', 'pv2416'];

/* ---------------- A SAÍDA: o protocolo da tentação ---------------- */

const PROTOCOLO = [
  {
    id: 'sair', rotulo: 'Primeiro passo', seg: 45, tipo: 'texto',
    linha: 'Saia do lugar. Agora.',
    apoio: 'Levante e leve o corpo para outro cômodo. Se o gatilho está no aparelho, deixe o aparelho para trás. José não discutiu com a tentação: correu e deixou a capa na mão dela.',
    versiculo: 'gn3912'
  },
  {
    id: 'respirar', rotulo: 'Segundo passo', seg: 42, tipo: 'respiracao',
    linha: 'Aquiete o corpo.',
    apoio: 'Duas inspirações pelo nariz, expiração longa pela boca. O corpo acelerado não ora bem — isto não é técnica espiritual, é só tirar o barulho do caminho.'
  },
  {
    id: 'nomear', rotulo: 'Terceiro passo', seg: 25, tipo: 'nomear',
    linha: 'Diga o nome, diante de Deus.',
    apoio: 'Em voz alta: “Senhor, estou sendo tentado a ____”. O desejo vive de não ser nomeado; dito em voz alta diante de Deus, a corrente se rompe cedo.',
    versiculo: 'tg114'
  },
  {
    id: 'clamar', rotulo: 'Quarto passo', seg: 45, tipo: 'oracao',
    linha: 'Clame por socorro.',
    apoio: 'Ore em voz alta. Pode usar estas palavras ou as suas.',
    oracao: 'Senhor, eu não tenho força para isto sozinho. Tu prometeste que com a tentação darias também a saída. Mostra a saída agora, e me dá vontade de tomá-la. Em nome de Jesus, amém.',
    versiculo: '1co1013'
  },
  {
    id: 'palavra', rotulo: 'Quinto passo', seg: 50, tipo: 'palavra',
    linha: 'Responda com o que está escrito.',
    apoio: 'Leia em voz alta, duas vezes. Foi assim que Jesus respondeu no deserto: não argumentando, mas citando.'
  },
  {
    id: 'resistir', rotulo: 'Sexto passo', seg: 40, tipo: 'resistir',
    linha: 'Resista e ocupe o lugar.',
    apoio: 'Não basta parar: é preciso pôr outra coisa no lugar. Faça agora uma coisa concreta e boa — e, se der, fale com alguém.',
    versiculo: 'tg47'
  }
];

const ACOES_SUBSTITUTAS = [
  'Ligar para alguém', 'Beber água', 'Sair para caminhar', 'Abrir a Bíblia',
  'Lavar a louça', 'Tomar banho', 'Cantar um louvor', 'Escrever uma oração'
];

/* ---------------- Depois da queda ---------------- */

const QUEDA = [
  {
    id: 'levantar', rotulo: 'Primeiro', tipo: 'texto', seg: 20,
    linha: 'Isto não é o fim.',
    apoio: 'Você não está aqui para ser condenado. Está aqui para levantar — e quem cai e levanta no mesmo dia não deixa a raiz criar corpo.',
    versiculo: 'pv2416'
  },
  {
    id: 'confessar', rotulo: 'Segundo', tipo: 'escrever',
    linha: 'Confesse, sem rodeio.',
    apoio: 'Diga o que foi, em uma linha, com o nome que tem. Confissão não é autoacusação: é concordar com Deus a respeito do que aconteceu.',
    campo: 'O que aconteceu', versiculo: '1jo19'
  },
  {
    id: 'corrente', rotulo: 'Terceiro', tipo: 'escrever',
    linha: 'Onde a corrente começou?',
    apoio: 'Não foi no último passo. Foi lá atrás: um horário, um lugar, um cansaço, uma tela, uma conversa. Encontre o primeiro elo.',
    campo: 'O primeiro elo', versiculo: 'tg114'
  },
  {
    id: 'cortar', rotulo: 'Quarto', tipo: 'escrever',
    linha: 'O que você corta hoje?',
    apoio: 'Uma coisa concreta, hoje: um bloqueio, uma senha na mão de outra pessoa, um caminho diferente, um aplicativo apagado. Arrependimento sem corte é só intenção.',
    campo: 'O corte de hoje', versiculo: 'mt529'
  },
  {
    id: 'contar', rotulo: 'Quinto', tipo: 'contar',
    linha: 'Conte a alguém hoje.',
    apoio: 'O pecado engorda no escuro. Uma pessoa madura que saiba e que te pergunte muda mais do que um mês de força de vontade.',
    versiculo: 'tg516'
  }
];

/* ---------------- Ferramentas ---------------- */

const FERRAMENTAS = [
  {
    id: 'fuga', nome: 'Fuga imediata', grupo: 'Na hora', dur: '90 s', versiculo: '2tm222',
    quando: 'O desejo apertou e você ainda está no lugar em que ele aperta.',
    passos: [
      {texto: 'Levante. Não negocie, não avalie, não “só mais um pouco”. Levante.', seg: 15},
      {texto: 'Saia do cômodo. Se o gatilho é o aparelho, ele fica para trás.', seg: 30},
      {texto: 'Vá para onde tenha gente, ou para a rua, ou para a pia com água fria.', seg: 30},
      {texto: 'Agora, de longe, diga em voz alta: isto não me domina.', seg: 15}
    ]
  },
  {
    id: 'respirar', nome: 'Aquietar o corpo', grupo: 'Na hora', dur: '90 s', versiculo: 'sl461',
    quando: 'O coração está disparado e não dá para pensar nem orar direito.',
    passos: [
      {texto: 'Sente com as costas apoiadas. Solte os ombros.', seg: 10},
      {texto: 'Siga o círculo: duas inspirações pelo nariz, expiração longa pela boca.', seg: 60, tipo: 'respiracao'},
      {texto: 'Respire normal. Agora fale com Deus — dá para ouvir a si mesmo de novo.', seg: 15}
    ]
  },
  {
    id: 'cortar', nome: 'Cortar a ocasião', grupo: 'Na hora', dur: '5 min', versiculo: 'rm1314',
    quando: 'Você já sabe por onde a queda entra, e ela continua entrando por ali.',
    passos: [
      {texto: 'Escreva por onde entrou das últimas três vezes. Seja específico: o aplicativo, o horário, o caminho, a pessoa.'},
      {texto: 'Escolha UM corte que você pode fazer nos próximos dez minutos.'},
      {texto: 'Faça agora. Bloqueio, senha na mão de alguém, aplicativo apagado, rota trocada.'},
      {texto: 'Conte a alguém o que você cortou. Corte que ninguém sabe volta atrás sozinho.'}
    ]
  },
  {
    id: 'socorro', nome: 'Oração de socorro', grupo: 'Oração e Palavra', dur: '2 min', versiculo: '1co1013',
    quando: 'Em qualquer aperto. É a oração mais curta e a mais atendida.',
    passos: [
      {texto: 'Em voz alta: “Senhor, eu não tenho força para isto sozinho.”', seg: 20},
      {texto: '“Tu prometeste que com a tentação darias também a saída.”', seg: 20},
      {texto: '“Mostra a saída agora, e me dá vontade de tomá-la.”', seg: 20},
      {texto: 'Fique em silêncio meio minuto. Depois faça a primeira coisa que aparecer como saída.', seg: 30}
    ]
  },
  {
    id: 'espada', nome: 'A espada', grupo: 'Oração e Palavra', dur: '2 min', versiculo: 'ef617',
    quando: 'O pensamento insiste e argumentar com ele não está funcionando.',
    passos: [
      {texto: 'Abra o versículo do seu pecado. Leia em voz alta, devagar.', seg: 30},
      {texto: 'Leia de novo, trocando as palavras pela sua situação de hoje.', seg: 30},
      {texto: 'Repita só a frase principal, cinco vezes, até ela ficar mais alta que o pensamento.', seg: 40},
      {texto: 'Jesus não discutiu com o tentador: respondeu “está escrito” e seguiu.', seg: 20}
    ]
  },
  {
    id: 'sondagem', nome: 'Sondagem do coração', grupo: 'Oração e Palavra', dur: '6 min', versiculo: 'sl13923',
    quando: 'Fora da crise, para descobrir o que o pecado está prometendo.',
    passos: [
      {texto: 'Ore: “Sonda-me, ó Deus, e conhece o meu coração.” Depois espere, sem pressa.'},
      {texto: 'O que esse pecado promete? Alívio, prazer, poder, consolo, vingança, fuga?'},
      {texto: 'Ele cumpre a promessa? Por quanto tempo, e a que preço?'},
      {texto: 'Onde está em Deus aquilo que ele promete de mentira? Escreva com referência bíblica se souber.'},
      {texto: 'Peça a Deus o que você estava buscando no lugar errado.'}
    ]
  },
  {
    id: 'confissao', nome: 'Confissão a Deus', grupo: 'Oração e Palavra', dur: '4 min', versiculo: '1jo19',
    quando: 'Depois da queda, e no exame do fim do dia.',
    passos: [
      {texto: 'Diga o que foi, com o nome que tem. Sem “acabei acontecendo”.'},
      {texto: 'Concorde com Deus: isto é pecado, e feriu a Ele e a outros.'},
      {texto: 'Peça perdão e creia no perdão. Ele é fiel e justo para perdoar — a dúvida aqui não é humildade.'},
      {texto: 'Peça o coração limpo, não só a consciência aliviada.'},
      {texto: 'Levante e siga. Ruminar a culpa depois do perdão alimenta a próxima queda.'}
    ]
  },
  {
    id: 'gratidao', nome: 'Gratidão que ocupa', grupo: 'Oração e Palavra', dur: '3 min', versiculo: 'fp48',
    quando: 'Quando o desejo cede mas a cabeça continua voltando para lá.',
    passos: [
      {texto: 'Diga em voz alta cinco coisas verdadeiras e boas da sua vida hoje.', seg: 60},
      {texto: 'Agradeça por cada uma, uma a uma, sem pressa.', seg: 60},
      {texto: 'A cabeça não fica vazia: ou pensa naquilo, ou pensa nisto. Escolha o que ocupa.', seg: 20}
    ]
  },
  {
    id: 'contas', nome: 'Prestação de contas', grupo: 'Vida em comum', dur: '10 min', versiculo: 'tg516',
    quando: 'Toda semana, e sempre depois de uma queda.',
    passos: [
      {texto: 'Escolha uma pessoa: alguém maduro, discreto, que não se assuste nem passe a mão na cabeça.'},
      {texto: 'Combine as perguntas que ela vai te fazer, e a frequência. Sem isso, vira conversa fiada.'},
      {texto: 'Diga a verdade inteira, inclusive o que envergonha. Meia verdade é a queda seguinte.'},
      {texto: 'Peça oração na hora, junto, em voz alta.'},
      {texto: 'Guarde o número dela nos Ajustes deste app, para chamar direto no meio da crise.'}
    ]
  },
  {
    id: 'jejum', nome: 'Jejum de treino', grupo: 'Vida em comum', dur: '1 dia', versiculo: 'tt211',
    quando: 'Para treinar dizer não ao corpo em coisa pequena, antes da coisa grande.',
    passos: [
      {texto: 'Escolha algo bom e legítimo: uma refeição, o açúcar, uma rede social, o sofá da noite.'},
      {texto: 'Defina o período exato. Vago não é jejum, é intenção.'},
      {texto: 'Cada vez que sentir falta, use como despertador: ore ali mesmo, uma frase.'},
      {texto: 'No fim do dia, escreva o que descobriu sobre o que te governa.'}
    ]
  },
  {
    id: 'ensaio', nome: 'Ensaiar a saída', grupo: 'Vida em comum', dur: '6 min', versiculo: 'pv223',
    quando: 'Fora da crise, de preferência de manhã. É o que faz a saída existir na hora.',
    passos: [
      {texto: 'Qual é o seu horário e lugar de maior risco hoje? Diga a hora e o lugar.'},
      {texto: 'Imagine a cena com detalhe: onde você está, o que sente, o que aparece.'},
      {texto: 'Agora imagine a saída, passo a passo: levantar, sair, para onde ir, para quem ligar.'},
      {texto: 'Escreva assim: “quando ____, eu vou ____”. Uma ação de um passo só.'},
      {texto: 'Ore por esse horário agora, antes de ele chegar. O prudente vê o mal e esconde-se.'}
    ]
  }
];

/* ---------------- Programa de 21 dias ---------------- */

const SEMANAS = [
  {n: 1, nome: 'Vigiar', sub: 'enxergar a corrente antes de tentar quebrá-la'},
  {n: 2, nome: 'Armar-se', sub: 'a Palavra decorada e a ocasião cortada'},
  {n: 3, nome: 'Andar', sub: 'ocupar o lugar que o pecado ocupava'}
];

const DIAS = [
  [1, 'O nome', 'Escreva, sem rodeio e com o nome que tem, o pecado que mais te derruba. Nada de “uma área difícil”. Depois confesse a Deus em voz alta, hoje.'],
  [2, 'As deixas', 'Que horas costuma ser? Em que lugar? Em que estado — sozinho, cansado, ferido, entediado, com raiva? Anote as três deixas mais frequentes.'],
  [3, 'A corrente', 'Tiago 1:14-15 descreve uma corrente: atração, concepção, pecado. Escreva a sua em cinco elos, do primeiro olhar até a queda. Marque em qual elo ainda dá para sair fácil.'],
  [4, 'O custo', 'O que esse pecado já tirou de você, dos seus, e da sua comunhão com Deus? Concreto: tempo, dinheiro, confiança, sono, oração que secou.'],
  [5, 'A promessa mentirosa', 'O que ele promete? Alívio, prazer, poder, consolo, vingança? Escreva a promessa. Depois escreva onde aquilo se encontra de verdade em Deus.'],
  [6, 'A saída que estava lá', 'Lembre das três últimas vezes. Onde estava a saída em cada uma? Ela estava — a promessa é de Deus. Escreva qual era.'],
  [7, 'Confissão', 'Confesse a Deus por escrito, item a item. E escolha hoje uma pessoa madura para contar nesta semana. Escreva o nome dela.'],
  [8, 'A espada', 'Escolha o versículo que fala direto ao seu pecado. Escreva num papel e deixe onde você vai ver. Comece a decorar hoje.'],
  [9, 'Decorar', 'Repita o versículo dez vezes em voz alta, em três momentos do dia. Palavra guardada no coração é a que aparece na hora, sem precisar procurar.'],
  [10, 'Está escrito', 'Qual é a mentira que seu gatilho repete? (“Você merece”, “só uma vez”, “ninguém vai saber”.) Escreva a resposta bíblica para cada uma, começando com “está escrito”.'],
  [11, 'Cortar', 'Corte uma ocasião hoje, de verdade: um bloqueio, uma senha na mão de outra pessoa, um caminho diferente, um aplicativo apagado. Uma coisa, feita hoje.'],
  [12, 'O coração', 'Ore o Salmo 139:23-24 e espere em silêncio. Escreva o que Ele mostrar, sem se defender e sem completar as frases por Ele.'],
  [13, 'Contar', 'Conte hoje à pessoa que você escolheu no dia 7. A verdade inteira. Combine as perguntas que ela vai te fazer e com que frequência.'],
  [14, 'Revisão', 'Quantas saídas você tomou nesta semana? Em que elo da corrente conseguiu sair mais cedo? O desejo médio caiu, subiu ou ficou igual?'],
  [15, 'Substituir', 'Parar não basta: é preciso trocar. Que ação boa vai ocupar o lugar e o horário que o pecado ocupava? Escolha uma e comece hoje.'],
  [16, 'O plano escrito', 'Escreva três planos: “quando ____, eu vou ____”. Deixas específicas, ações de um passo só. Decore os três.'],
  [17, 'A hora fraca', 'Descubra sua hora mais fraca e ocupe-a de propósito esta semana: um compromisso, uma ligação marcada, um lugar com gente.'],
  [18, 'Servir', 'Faça hoje algo concreto por alguém, de preferência no seu horário de risco. O pecado engorda no isolamento e emagrece quando você está servindo.'],
  [19, 'Jejum', 'Escolha uma coisa boa e legítima e abra mão dela hoje. Cada falta sentida vira um despertador para orar. À noite, escreva o que descobriu.'],
  [20, 'Perdão', 'Há amargura presa contra alguém, ou culpa não resolvida? Trate hoje: perdoe, peça perdão, repare o que dá para reparar. Ressentimento é combustível de recaída.'],
  [21, 'Aliança', 'Escreva sua aliança em uma página: o pecado nomeado, os versículos decorados, as três saídas, a pessoa que te pergunta, e de quanto em quanto tempo.']
];

const ROTINA = {
  manha: [
    'Orar entregando o dia e pedindo a saída antes de precisar dela',
    'Ler o versículo do dia em voz alta',
    'Prever: “hoje o risco é ___, e minha saída é ___”'
  ],
  noite: [
    'Exame: onde a corrente começou hoje?',
    'Confessar o que houve e agradecer pelo que houve de bom',
    'Marcar o dia do programa'
  ]
};

/* ---------------- Leitura, fora da crise ---------------- */

const LEITURA = [
  {
    titulo: 'Tentação não é pecado',
    blocos: [
      ['Jesus foi tentado', 'Hebreus 4:15 diz que ele foi tentado em tudo, como nós, mas sem pecado. Se ser tentado fosse pecar, essa frase não existiria. Sentir o puxão não é cair.'],
      ['A corrente tem elos', 'Tiago 1:14-15: primeiro a atração, depois a concepção, depois o pecado. Entre um elo e outro há espaço — e é nesse espaço que este app trabalha.'],
      ['Sair cedo é mais fácil', 'No primeiro elo, sair custa um gesto. No quarto, custa uma guerra. Por isso o trabalho é aprender a reconhecer o primeiro elo, não a resistir heroicamente no último.'],
      ['Culpa pelo que se sente', 'Muita gente vive condenada por sentir, e gasta no autoacusar-se a força que precisaria para sair do lugar. Sentir não é falhar. Ficar é que é.']
    ]
  },
  {
    titulo: 'A saída prometida',
    blocos: [
      ['A promessa', '1 Coríntios 10:13 promete que com a tentação Deus dá também o escape. Não promete que você não será tentado, nem que o desejo some. Promete uma saída.'],
      ['A saída quase sempre é física', 'Na prática ela costuma ter forma de porta: levantar, sair do cômodo, desligar, largar o aparelho, ligar para alguém. José não venceu argumentando — correu e deixou a capa para trás.'],
      ['Ela precisa ser vista antes', 'No meio do desejo ninguém inventa saída nova. Por isso o ensaio: quem já decidiu de manhã para onde vai correr, corre. Quem não decidiu, negocia.'],
      ['Tomar a saída é obra sua', 'Deus dá; você toma. A promessa não dispensa o levantar da cadeira — ela garante que, quando você levantar, haverá para onde ir.']
    ]
  },
  {
    titulo: 'Vergonha não é arrependimento',
    blocos: [
      ['Duas tristezas', '2 Coríntios 7:10 separa a tristeza segundo Deus, que produz arrependimento, da tristeza do mundo, que produz morte. Uma leva de volta a Deus; a outra leva a se esconder.'],
      ['O que a vergonha faz', 'Ela mantém você olhando para si mesmo, aumenta a tensão e torna a próxima queda mais provável. É por isso que a espiral de culpa depois da queda costuma terminar em outra queda.'],
      ['O que o arrependimento faz', 'Nomeia, confessa, corta a ocasião, conta a alguém e segue. Custa menos e muda mais.'],
      ['Nenhuma condenação', 'Romanos 8:1. Se você é de Cristo, a condenação já foi resolvida. Recusar o perdão oferecido não é humildade — é insistir em pagar o que já foi pago.']
    ]
  },
  {
    titulo: 'Graça não é licença',
    blocos: [
      ['A pergunta de Paulo', 'Romanos 6:1-2 antecipa o abuso: permaneceremos no pecado para que a graça abunde? De modo nenhum.'],
      ['A graça ensina', 'Tito 2:11-12 diz que a graça nos ensina a renunciar às concupiscências e a viver sóbria e justamente. Ela não é permissão: é o que dá força para mudar.'],
      ['Nem rigor, nem frouxidão', 'Um app de contagem pode virar duas coisas ruins: um chicote, que produz vergonha, ou um placar, que produz orgulho. O número aqui serve para ver o padrão — o horário, o lugar, a deixa. Nada mais.'],
      ['Sua posição não oscila', 'Dias seguidos não te fazem mais amado; uma queda não te faz menos. O que muda com a prática é a sua liberdade, não o amor de Deus por você.']
    ]
  },
  {
    titulo: 'Quando buscar mais ajuda',
    blocos: [
      ['Comunidade primeiro', 'Isto aqui não substitui igreja, pastor, confissão nem discipulado. Tiago 5:16 manda confessar uns aos outros: um app não é “uns aos outros”.'],
      ['Sinais de que é mais do que hábito', 'Se há compulsão que você não interrompe, dependência química, prejuízo grave no trabalho ou na família, ou pensamentos de se machucar, isso pede ajuda profissional além da espiritual.'],
      ['Os dois juntos', 'Procurar um médico ou psicólogo não é falta de fé, como tomar remédio para pressão não é. Acompanhamento pastoral e tratamento clínico funcionam melhor juntos do que qualquer um sozinho.'],
      ['Se houver risco de vida', 'Em pensamento de suicídio, procure ajuda imediatamente: no Brasil, o CVV atende pelo telefone 188, 24 horas, gratuito.']
    ]
  }
];
