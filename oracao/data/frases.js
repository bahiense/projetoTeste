/* =========================================================
   Frases de partida — o empurrão para quando trava.

   O Módulo 1 é categórico: não decore orações. Então por que um
   banco de frases? Porque "não decore" não é o mesmo que "vire-se
   sozinho". Estas frases não são a oração: são a primeira linha de
   um movimento, dita para tirar você da inércia. Você fala a frase e
   continua com as suas palavras — a que importa é a que vem depois.

   Por isso quase todas terminam em reticências: elas abrem, não
   fecham. E por isso o app as mostra escondidas atrás de um toque,
   nunca soltas na tela durante a oração: frase à vista vira
   teleprompter, e aí a oração deixa de ser sua.

   A organização é por MOMENTO (onde você travou) e, dentro dele, por
   CONTEXTO (onde você está). O app usa o contexto quando conhece, e
   cai no geral quando não.
   ========================================================= */
window.A = window.A || {};

A.FRASES_MOMENTOS = [
    { id: 'abertura', nome: 'Começar', pergunta: 'O que está acontecendo aqui?', icone: '▶' },
    { id: 'pessoas', nome: 'Nomear quem', pergunta: 'Quem está envolvido nisso?', icone: '◎' },
    { id: 'situacoes', nome: 'Dizer o que vivem', pergunta: 'O que essas pessoas estão vivendo?', icone: '≡' },
    { id: 'necessidades', nome: 'Pedir', pergunta: 'Do que elas precisam?', icone: '⌁' },
    { id: 'fe', nome: 'Lembrar quem Deus é', pergunta: 'O que é verdade sobre Deus diante disso?', icone: '✦' },
    { id: 'incluir', nome: 'Incluir quem ouve', pergunta: 'Quem mais aqui vive isso?', icone: '◍' },
    { id: 'aprofundar', nome: 'Descer um nível', pergunta: 'O que está por trás do pedido?', icone: '↓' },
    { id: 'entrega', nome: 'Entregar', pergunta: 'O que está além do que vocês resolvem?', icone: '🤲' },
    { id: 'encerrar', nome: 'Encerrar', pergunta: 'Em que estamos confiando?', icone: '■' },
    { id: 'transicao', nome: 'Emendar duas ideias', pergunta: 'Como a próxima nasce desta?', icone: '→' },
    { id: 'retomada', nome: 'Voltar depois do branco', pergunta: 'O que é verdadeiro sobre este momento?', icone: '↺' }
];

A.FRASES = {};

/* ---------------------------------------------------------
   1. ABERTURA — a primeira frase, quando a mente está em branco
   --------------------------------------------------------- */
A.FRASES.abertura = {
    geral: [
        'Senhor, nós nos colocamos diante de Ti neste momento...',
        'Pai, viemos com o que temos hoje...',
        'Senhor, antes de qualquer pedido, reconhecemos que Tu já estás aqui...',
        'Pai, Tu sabes exatamente o que cada um trouxe até aqui...',
        'Senhor, nós paramos agora para falar contigo...',
        'Pai, obrigado por este momento em que podemos estar juntos diante de Ti...',
        'Senhor, chegamos de lugares diferentes, com histórias diferentes, mas com o mesmo desejo...',
        'Pai, nós não viemos com palavras elaboradas. Viemos com o que somos...',
        'Senhor, este momento é Teu antes de ser nosso...',
        'Pai, nós Te agradecemos porque podemos vir assim, do jeito que estamos...',
        'Senhor, há coisas aqui que só Tu conheces inteiramente...',
        'Pai, nós nos aproximamos sabendo que Tu nos ouves...',
        'Senhor, colocamos diante de Ti aquilo que está pesando em cada um...',
        'Pai, começamos reconhecendo que precisamos de Ti para isto que vem agora...',
        'Senhor, obrigado porque não precisamos chegar prontos para falar contigo...'
    ],
    Culto: [
        'Senhor, estamos aqui mais uma vez, vindos de uma semana inteira...',
        'Pai, cada pessoa nesta sala chegou carregando alguma coisa. Tu sabes o quê...',
        'Senhor, consagramos este culto a Ti antes de ele começar...',
        'Pai, que este tempo não seja só programação. Que seja encontro...',
        'Senhor, nós Te convidamos a governar tudo o que acontecer aqui hoje...',
        'Pai, obrigado por mais um domingo em que podemos nos reunir em Teu nome...',
        'Senhor, antes da palavra, antes do louvor, nós queremos Ti...',
        'Pai, prepara o coração de cada um para o que Tu tens para hoje...'
    ],
    'Célula': [
        'Pai, abrimos este encontro reconhecendo o peso da semana que cada um trouxe...',
        'Senhor, somos poucos aqui, e Tu prometeste estar no meio de dois ou três...',
        'Pai, obrigado por este espaço onde dá para ser sincero...',
        'Senhor, que este tempo juntos sirva para nos aproximar de Ti e uns dos outros...',
        'Pai, cada um aqui veio de um dia diferente. Encontra cada um onde ele está...',
        'Senhor, guarda esta conversa para que ela edifique e não machuque ninguém...'
    ],
    'Família': [
        'Senhor, nós Te trazemos esta família hoje...',
        'Pai, esta casa é Tua antes de ser nossa...',
        'Senhor, obrigado pelas pessoas que estão nesta mesa...',
        'Pai, nós nos reunimos como família diante de Ti...',
        'Senhor, o que acontece dentro desta casa importa para Ti...',
        'Pai, obrigado porque aqui a gente pode ser quem é...'
    ],
    Hospital: [
        'Senhor, nós estamos neste quarto e Tu estás aqui antes de nós...',
        'Pai, este é um lugar difícil, e mesmo assim é lugar onde Tu entras...',
        'Senhor, viemos ficar perto, e Te pedimos que fiques mais perto ainda...',
        'Pai, Tu conheces esta pessoa por inteiro — corpo, história e medo...',
        'Senhor, não temos respostas para dar aqui. Temos Ti...',
        'Pai, obrigado porque a Tua presença não depende do resultado dos exames...'
    ],
    Luto: [
        'Senhor, viemos com uma dor que não sabemos onde colocar...',
        'Pai, nós não temos palavras à altura deste momento...',
        'Senhor, Tu prometeste estar perto dos que têm o coração quebrantado. Estamos precisando disso agora...',
        'Pai, obrigado pela vida que hoje nos falta...',
        'Senhor, esta família não precisa de explicação. Precisa de Ti...',
        'Pai, recebe o choro desta sala como oração...'
    ],
    'Celebração': [
        'Senhor, hoje é um dia de alegria, e a alegria também é oração...',
        'Pai, obrigado por este momento que Tu preparaste...',
        'Senhor, celebramos diante de Ti porque foi a Tua mão que trouxe até aqui...',
        'Pai, que nossa alegria hoje aponte para Ti...',
        'Senhor, obrigado por reunir estas pessoas em volta desta história...',
        'Pai, este começo pertence a Ti...'
    ],
    'Reunião': [
        'Senhor, colocamos diante de Ti o que foi conversado aqui...',
        'Pai, obrigado pelo trabalho que nos foi confiado...',
        'Senhor, pedimos direção antes de decidir qualquer coisa...',
        'Pai, que o que sair daqui sirva às pessoas, e não só aos números...',
        'Senhor, obrigado por cada pessoa em volta desta mesa...',
        'Pai, nós reconhecemos que precisamos de sabedoria que não é nossa...'
    ],
    'Ministério': [
        'Senhor, antes de servir, nós paramos para Te ouvir...',
        'Pai, que este trabalho continue sendo serviço e não vitrine...',
        'Senhor, obrigado por chamar gente comum para coisas assim...',
        'Pai, une esta equipe no que importa...',
        'Senhor, cuida de quem cuida dos outros...',
        'Pai, que Tu sejas visto e não nós...'
    ],
    Necessidade: [
        'Senhor, nós trazemos uma situação específica diante de Ti...',
        'Pai, há um peso aqui que não é fácil de carregar...',
        'Senhor, viemos por causa de algo real que está acontecendo agora...',
        'Pai, Tu conheces esta situação inteira, inclusive o que não foi dito...',
        'Senhor, não sabemos tudo, mas sabemos a quem trazer isto...',
        'Pai, esta família não está sozinha, e queremos que ela sinta isso...'
    ],
    'Gratidão': [
        'Senhor, começamos reconhecendo o que Tu já fizeste...',
        'Pai, antes de pedir qualquer coisa, obrigado...',
        'Senhor, nós vimos a Tua mão e não queremos passar batido por isso...',
        'Pai, que a nossa memória não seja curta com a Tua bondade...',
        'Senhor, obrigado pelo que aconteceu e pelo jeito como aconteceu...',
        'Pai, isto que celebramos hoje tem nome, e o nome é Teu...'
    ],
    Improviso: [
        'Senhor, nós paramos agora para colocar este momento diante de Ti...',
        'Pai, Tu conheces exatamente por que estamos aqui...',
        'Senhor, obrigado por esta oportunidade de orar juntos...',
        'Pai, que este minuto sirva a quem está aqui...',
        'Senhor, começamos por Ti, e o resto vem depois...'
    ]
};

/* ---------------------------------------------------------
   2. PESSOAS — quando a oração está abstrata e falta rosto
   --------------------------------------------------------- */
A.FRASES.pessoas = {
    geral: [
        'Senhor, penso especialmente em...',
        'Pai, dentro desta situação há pessoas com nome...',
        'Senhor, nós Te trazemos cada um deles, um por um...',
        'Pai, lembra do pai desta casa, que carrega mais do que mostra...',
        'Senhor, lembra da mãe, que sustenta o que ninguém vê...',
        'Pai, oramos pelos filhos, cada um na fase em que está...',
        'Senhor, colocamos diante de Ti este casal...',
        'Pai, oramos pelos mais velhos desta família, pela história que eles carregam...',
        'Senhor, oramos por quem está sozinho hoje...',
        'Pai, oramos por quem está cuidando de alguém e não tem quem cuide dele...',
        'Senhor, oramos pelos que estão aqui e pelos que ficaram em casa...',
        'Pai, oramos pelos jovens, pelas escolhas que eles precisam fazer agora...',
        'Senhor, oramos pelas crianças, que percebem mais do que a gente imagina...',
        'Pai, oramos pelos líderes desta casa e pelo peso que eles carregam calados...',
        'Senhor, oramos por quem chegou aqui pela primeira vez...',
        'Pai, oramos por quem está com o coração longe, mesmo estando presente...',
        'Senhor, oramos por quem não consegue pedir oração por vergonha...',
        'Pai, lembra de quem está trabalhando agora e não pôde vir...',
        'Senhor, oramos por quem está doente e por quem espera no corredor...',
        'Pai, oramos por quem tomou uma decisão difícil esta semana...',
        'Senhor, oramos pelos que estão longe da família por necessidade...',
        'Pai, oramos por quem está começando de novo depois de perder tudo...',
        'Senhor, oramos por quem está firme e por quem está cansado de ser firme...',
        'Pai, oramos por quem serve sem que ninguém veja...',
        'Senhor, cada pessoa desta sala tem um nome que Tu conheces...'
    ]
};

/* ---------------------------------------------------------
   3. SITUAÇÕES — quando falta dizer o que está sendo vivido
   --------------------------------------------------------- */
A.FRASES.situacoes = {
    geral: [
        'Senhor, eles estão diante de uma decisão que pesa...',
        'Pai, tem sido uma fase de incerteza, sem resposta à vista...',
        'Senhor, o cansaço aqui não é só do corpo...',
        'Pai, há contas que chegam antes do dinheiro...',
        'Senhor, há uma conversa que precisa acontecer e ninguém começa...',
        'Pai, há um silêncio dentro desta casa que já dura tempo demais...',
        'Senhor, eles têm tentado, e ainda assim parece que não sai do lugar...',
        'Pai, a espera tem sido mais longa do que eles imaginavam...',
        'Senhor, houve uma perda aqui, e a vida continuou como se nada tivesse acontecido...',
        'Pai, há um diagnóstico no meio desta família...',
        'Senhor, há um trabalho que acabou e uma identidade que foi junto...',
        'Pai, há uma mudança chegando, e mudança assusta mesmo quando é boa...',
        'Senhor, há mágoas antigas que ninguém teve coragem de nomear...',
        'Pai, eles estão carregando isso em silêncio porque não há espaço para falar...',
        'Senhor, há noites em que o sono não vem por causa disso...',
        'Pai, há uma pressão que começou pequena e foi crescendo...',
        'Senhor, eles estão firmes por fora e cansados por dentro...',
        'Pai, há uma esperança que já foi adiada muitas vezes...',
        'Senhor, há um recomeço acontecendo, e recomeçar dá medo...',
        'Pai, há alegria aqui, e ela veio depois de muito tempo difícil...',
        'Senhor, eles fizeram tudo o que podiam, e o resultado não depende deles...',
        'Pai, há uma distância que foi crescendo sem ninguém perceber...',
        'Senhor, esta semana pesou mais do que as outras...',
        'Pai, há coisas aqui que não foram ditas em voz alta, e Tu as conheces...',
        'Senhor, a gente sabe uma parte da história. Tu conheces a inteira...'
    ]
};

/* ---------------------------------------------------------
   4. NECESSIDADES — quando a oração descreve e não pede
   --------------------------------------------------------- */
A.FRASES.necessidades = {
    geral: [
        'Senhor, dá sabedoria para saberem qual caminho seguir...',
        'Pai, concede clareza onde hoje só existe dúvida...',
        'Senhor, sustenta as forças de quem já está no limite...',
        'Pai, traz descanso — o descanso que não vem só de dormir...',
        'Senhor, dá paz que não dependa das circunstâncias mudarem...',
        'Pai, dá coragem para a conversa que precisa acontecer...',
        'Senhor, dá humildade para ouvir antes de responder...',
        'Pai, dá paciência para o tempo que isto vai levar...',
        'Senhor, dá provisão para o que é necessário, não para o que é aparência...',
        'Pai, abre portas — e dá discernimento para saber qual atravessar...',
        'Senhor, cura o que está doendo no corpo e o que está doendo por dentro...',
        'Pai, restaura o que foi quebrado, no tempo e no jeito que Tu sabes...',
        'Senhor, dá firmeza para não desistir no meio...',
        'Pai, dá esperança para quem já não consegue esperar sozinho...',
        'Senhor, dá direção para o próximo passo, mesmo que o resto continue escuro...',
        'Pai, ensina esta família a conversar de novo...',
        'Senhor, dá disposição para recomeçar depois do que aconteceu...',
        'Pai, dá alegria genuína, não a de fachada...',
        'Senhor, dá companhia para quem está atravessando isto sozinho...',
        'Pai, dá sabedoria a quem decide e coragem a quem obedece...',
        'Senhor, dá consolo que chegue mais fundo do que as nossas palavras...',
        'Pai, dá saúde, e dá também paciência enquanto ela não vem...',
        'Senhor, dá perdão de mão dupla nesta casa...',
        'Pai, sustenta a fé de quem está com a fé pequena hoje...',
        'Senhor, dá discernimento para separar o urgente do importante...',
        'Pai, dá segurança para os filhos no meio da tempestade dos adultos...',
        'Senhor, dá trabalho, e dá dignidade junto...',
        'Pai, dá sono tranquilo para quem tem passado noites acordado...',
        'Senhor, dá o que eles precisam, e não apenas o que a gente imagina que precisam...',
        'Pai, dá a eles a certeza de que não estão sozinhos nisto...'
    ]
};

/* ---------------------------------------------------------
   5. FÉ — quando falta dizer quem Deus é diante daquilo
   --------------------------------------------------------- */
A.FRASES.fe = {
    geral: [
        'Senhor, Tu conheces o caminho que eles ainda não conseguem enxergar...',
        'Pai, nós cremos que Tu estás dentro desta história, e não olhando de fora...',
        'Senhor, Tu sustentas o que para nós já não se sustenta...',
        'Pai, Tu dás sabedoria a quem pede, sem cobrar por isso...',
        'Senhor, Tu não perdeste o controle disto que nos assusta...',
        'Pai, Tu vês o que ninguém percebeu...',
        'Senhor, Tu ficas perto justamente de quem está com o coração quebrado...',
        'Pai, o que é impossível para nós continua possível para Ti...',
        'Senhor, a Tua fidelidade não depende do nosso humor de hoje...',
        'Pai, Tu tens cuidado desta família até aqui, e não vais parar agora...',
        'Senhor, Tu ouves inclusive a oração que sai errada...',
        'Pai, Tu conheces cada um pelo nome, não como número...',
        'Senhor, a Tua bondade não é recompensa pelo que fizemos...',
        'Pai, Tu andas com quem atravessa o vale, e não só com quem chega ao topo...',
        'Senhor, Tu és o mesmo no dia bom e no dia difícil...',
        'Pai, Tu não te assustas com a dúvida de ninguém aqui...',
        'Senhor, Tu prometeste estar presente onde dois ou três se reúnem, e estamos aqui...',
        'Pai, Tu carregas o que a gente não consegue nem levantar...',
        'Senhor, Tu és Pai também para quem nunca teve um...',
        'Pai, o Teu tempo não é atraso...',
        'Senhor, Tu enxergas o fim disto que para nós ainda é começo...',
        'Pai, Tu já cuidaste antes, e a memória disso nos sustenta agora...',
        'Senhor, a Tua paz não depende de tudo estar resolvido...',
        'Pai, Tu não desistes de ninguém desta sala...',
        'Senhor, Tu és bom mesmo quando a resposta demora...',
        'Pai, o que Tu começaste, Tu levas até o fim...',
        'Senhor, Tu conheces o que não foi dito em voz alta aqui...',
        'Pai, Tu não precisas da nossa performance para agir...',
        'Senhor, Tu és refúgio, e refúgio é lugar de entrar, não de olhar de longe...',
        'Pai, nós não temos todas as respostas, mas sabemos a quem perguntar...'
    ]
};

/* ---------------------------------------------------------
   6. INCLUIR — quando a oração ficou pessoal demais e quem
      ouve não consegue entrar
   --------------------------------------------------------- */
A.FRASES.incluir = {
    geral: [
        'Senhor, e o que estamos pedindo por eles, pedimos por cada família desta sala...',
        'Pai, muita gente aqui está vivendo algo parecido, mesmo sem dizer...',
        'Senhor, cada pessoa aqui trouxe um nome no coração — alcança esse nome também...',
        'Pai, o que dissemos por esta família vale para todos os lares desta comunidade...',
        'Senhor, há gente aqui que chegou hoje sem conseguir contar para ninguém o que está passando...',
        'Pai, alcança também quem não veio, mas está no pensamento de alguém daqui...',
        'Senhor, faz esta oração ser de todos nós, e não só de quem está falando...',
        'Pai, que ninguém saia daqui hoje achando que está sozinho nisto...',
        'Senhor, alcança quem está ouvindo e não teria coragem de pedir...',
        'Pai, une esta sala em volta desta necessidade...',
        'Senhor, o que pedimos aqui, pedimos junto com toda esta igreja...',
        'Pai, alcança as casas para onde cada um vai voltar depois daqui...',
        'Senhor, alcança também os vizinhos, o trabalho e a rua de cada um destes...',
        'Pai, que este momento sirva a quem está aqui de pé e a quem está aqui por dentro caído...',
        'Senhor, ninguém nesta sala está fora do Teu olhar agora...',
        'Pai, que a fé de uns sustente a fé de outros hoje...',
        'Senhor, alcança quem serviu neste culto e não teve tempo de orar por si...',
        'Pai, alcança as crianças que estão aqui e ouvem tudo...',
        'Senhor, alcança quem está chegando ao fim das forças e ainda não contou a ninguém...',
        'Pai, que esta oração continue depois que a gente parar de falar...'
    ]
};

/* ---------------------------------------------------------
   7. APROFUNDAR — quando a oração ficou no pedido de fora
   --------------------------------------------------------- */
A.FRASES.aprofundar = {
    geral: [
        'Senhor, mais do que a porta que se abre, eles precisam saber qual atravessar...',
        'Pai, por baixo deste pedido há um medo que ninguém nomeou ainda...',
        'Senhor, não é só cansaço: é o peso de continuar sem ver resultado...',
        'Pai, o que dói aqui não é só o que aconteceu, é o que ficou depois...',
        'Senhor, eles não precisam só de solução. Precisam saber que Tu estás junto enquanto ela não vem...',
        'Pai, por trás desta briga há duas pessoas machucadas...',
        'Senhor, o que parece teimosia às vezes é medo antigo...',
        'Pai, o silêncio desta casa não é paz, é assunto adiado...',
        'Senhor, a preocupação com dinheiro aqui é preocupação com dignidade...',
        'Pai, esta doença mexeu com muito mais do que o corpo...',
        'Senhor, esta decisão pesa porque afeta gente que eles amam...',
        'Pai, eles não conseguem pedir ajuda, e isso também é parte do problema...',
        'Senhor, o que eles chamam de fraqueza é cansaço de estar sendo fortes há tempo demais...',
        'Pai, há aqui a vergonha de estar precisando, e ela machuca junto...',
        'Senhor, alcança o que eles ainda não conseguiram nem colocar em palavras...',
        'Pai, tem uma solidão dentro desta casa cheia...',
        'Senhor, eles precisam de descanso, mas antes precisam de permissão para descansar...',
        'Pai, este pedido tem uma história por trás que Tu conheces inteira...',
        'Senhor, mais do que mudar a situação, muda o que a situação está fazendo com eles...',
        'Pai, alcança a parte disto que eles não contariam nem para o amigo mais próximo...'
    ]
};

/* ---------------------------------------------------------
   8. ENTREGA — quando a oração precisa soltar
   --------------------------------------------------------- */
A.FRASES.entrega = {
    geral: [
        'Senhor, entregamos esta situação em Tuas mãos...',
        'Pai, colocamos diante de Ti o que não conseguimos resolver...',
        'Senhor, o que não conseguimos ver, confiamos ao Teu cuidado...',
        'Pai, soltamos aquilo que não é nosso para carregar...',
        'Senhor, entregamos o resultado, que nunca esteve com a gente...',
        'Pai, entregamos o amanhã desta família nas Tuas mãos...',
        'Senhor, deixamos contigo o que a gente tentou consertar e não deu...',
        'Pai, entregamos esta decisão antes mesmo de saber qual será...',
        'Senhor, entregamos as pessoas que amamos e não conseguimos proteger de tudo...',
        'Pai, entregamos esta espera, com o tempo que ela ainda vai levar...',
        'Senhor, entregamos o que está fora do nosso alcance e dentro do Teu...',
        'Pai, entregamos o medo junto com o pedido...',
        'Senhor, entregamos esta casa, com tudo o que acontece dentro dela...',
        'Pai, entregamos o que já passou e não dá mais para mudar...',
        'Senhor, entregamos esta conversa que ainda vai acontecer...',
        'Pai, descansamos isto em Ti, porque carregar sozinho já provamos que não dá...',
        'Senhor, entregamos o que temos e o que nos falta...',
        'Pai, entregamos este corpo, este tratamento e esta família inteira...',
        'Senhor, entregamos o que não temos palavras para nomear...',
        'Pai, que a Tua vontade prevaleça sobre os nossos planos...',
        'Senhor, entregamos o que vier depois desta oração...',
        'Pai, se for para ser diferente do que pedimos, sustenta a gente no diferente...',
        'Senhor, entregamos também a nossa pressa...',
        'Pai, colocamos nas Tuas mãos aquilo que a gente insiste em tentar controlar...',
        'Senhor, entregamos esta noite, e amanhã entregamos de novo...'
    ]
};

/* ---------------------------------------------------------
   9. ENCERRAR — quando é hora de terminar com propósito
   --------------------------------------------------------- */
A.FRASES.encerrar = {
    geral: [
        'Senhor, confiamos no Teu cuidado. Em nome de Jesus, amém.',
        'Pai, cremos que Tu já estás agindo nisto. Em nome de Jesus, amém.',
        'Senhor, descansamos em Ti sobre tudo o que trouxemos aqui. Amém.',
        'Pai, obrigado porque podemos sair daqui sem carregar isto sozinhos. Amém.',
        'Senhor, que ninguém saia deste lugar do jeito que entrou. Em nome de Jesus, amém.',
        'Pai, guarda o que oramos e faz o que só Tu podes fazer. Amém.',
        'Senhor, seja feita a Tua vontade, e não a nossa. Em nome de Jesus, amém.',
        'Pai, a Ti toda a glória por tudo isto. Amém.',
        'Senhor, cremos e recebemos, no tempo que for o Teu. Amém.',
        'Pai, obrigado por ouvir mesmo o que a gente não soube dizer. Em nome de Jesus, amém.',
        'Senhor, vai à frente de cada um que sai daqui. Amém.',
        'Pai, que o Teu cuidado acompanhe esta família esta semana inteira. Em nome de Jesus, amém.',
        'Senhor, obrigado porque podemos voltar a falar contigo a qualquer hora. Amém.',
        'Pai, que a paz que excede o entendimento guarde o coração de cada um. Amém.',
        'Senhor, entregamos e confiamos. Em nome de Jesus, amém.',
        'Pai, sustenta cada um até a próxima vez que nos encontrarmos. Amém.',
        'Senhor, obrigado por este momento e por quem esteve nele. Em nome de Jesus, amém.',
        'Pai, que o Senhor os abençoe e os guarde. Amém.',
        'Senhor, ficamos com o que Tu decidires, confiando que é bom. Amém.',
        'Pai, é em nome de Jesus que oramos. Amém.'
    ]
};

/* ---------------------------------------------------------
   10. TRANSIÇÃO — a emenda entre duas ideias (as 4 Pontes)
   --------------------------------------------------------- */
A.FRASES.transicao = {
    geral: [
        'E dentro desta família, Senhor, penso especialmente em...',
        'E o que vale para eles vale também para cada lar representado aqui...',
        'Diante de tudo isso, Senhor, o que eles precisam é...',
        'E é por causa disso que pedimos...',
        'Mas nós sabemos que Tu és o Deus que...',
        'E mesmo sem entender, nós cremos que...',
        'Por isso, Senhor, entregamos...',
        'E se cremos nisso, então soltamos...',
        'E não é só com eles: nesta sala tem gente atravessando o mesmo...',
        'Senhor, e por baixo desse pedido existe algo mais fundo...',
        'E o que pesa mais do que a situação em si é...',
        'E, confiando nisso, colocamos nas Tuas mãos...',
        'E o que começou pequeno aqui, Senhor, alcança também...',
        'Diante disso, não pedimos só solução, pedimos...',
        'E porque Tu já cuidaste antes, pedimos agora...',
        'E enquanto a resposta não vem, Senhor...',
        'E o que dissemos por um, dizemos por todos...',
        'Por isso mesmo, Senhor, precisamos que Tu...',
        'E é exatamente aí que precisamos de Ti...',
        'E assim, com isso nas Tuas mãos, nós...'
    ]
};

/* ---------------------------------------------------------
   11. RETOMADA — o branco chegou e é preciso voltar
   --------------------------------------------------------- */
A.FRASES.retomada = {
    geral: [
        'Senhor, Tu conheces o que estamos vivendo...',
        'Pai, nós queremos colocar esta situação diante de Ti...',
        'Senhor, nós não temos todas as palavras, mas viemos com o que temos...',
        'Pai, Tu sabes o que cada pessoa aqui trouxe hoje...',
        'Senhor, nós paramos por um instante diante de Ti...',
        'Pai, obrigado porque Tu ouves mesmo quando faltam palavras...',
        'Senhor, o que importa aqui, Tu já conheces...',
        'Pai, nós continuamos confiando, mesmo sem saber o que dizer agora...',
        'Senhor, olha para esta situação com os Teus olhos...',
        'Pai, alcança aquilo que a gente não consegue explicar...',
        'Senhor, nós Te pedimos por esta necessidade que está diante de nós...',
        'Pai, sustenta cada um que está aqui neste momento...',
        'Senhor, obrigado por este tempo em que podemos falar contigo...',
        'Pai, nós confiamos isto ao Teu cuidado...',
        'Senhor, que a Tua presença fique sobre este lugar...'
    ]
};

/* Quantas frases existem — usado na biblioteca e na verificação. */
A.contarFrases = function () {
    var t = 0;
    for (var m in A.FRASES) {
        for (var c in A.FRASES[m]) t += A.FRASES[m][c].length;
    }
    return t;
};
