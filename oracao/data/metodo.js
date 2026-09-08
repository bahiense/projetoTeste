/* =========================================================
   O método, em dados.

   Tudo que as telas mostram como referência sai daqui: o mapa
   ALTAR, os 5 Ângulos, as 4 Pontes, os 5 Níveis, o cartão de dez
   segundos e o protocolo de quando a mente trava.

   O conteúdo é o do Método Altar (módulos 1 a 10). O app não
   inventa doutrina: ele organiza o que o material ensina e cobra
   a prática.
   ========================================================= */
window.A = window.A || {};

A.ALTAR = [
    {
        id: 'a1',
        letra: 'A',
        nome: 'Alinhe o Propósito',
        pergunta: 'Qual é o objetivo desta oração?',
        resumo: 'Saber para onde você está indo antes de abrir a boca.',
        texto: 'Toda oração tem um propósito, mesmo quando quem ora não percebe. ' +
            'Tornar esse propósito consciente organiza tudo o que vem depois. Clareza de ' +
            'propósito não limita a oração — ela liberta, porque você deixa de gastar ' +
            'energia tentando pensar em tudo ao mesmo tempo.',
        opcoes: ['Agradecer', 'Interceder', 'Pedir direção', 'Consagrar', 'Pedir proteção', 'Buscar perdão', 'Consolar', 'Abençoar'],
        exemplo: 'Interceder por uma família. Esse é o centro — o resto gira em volta disso.'
    },
    {
        id: 'a2',
        letra: 'L',
        nome: 'Ligue o Céu ao Momento',
        pergunta: 'O que está acontecendo aqui?',
        resumo: 'A oração começa onde as pessoas realmente estão.',
        texto: 'A abertura não precisa ser uma frase religiosa universal. Ela pode nascer do ' +
            'que está acontecendo naquele instante: quem está ali, o que essas pessoas estão ' +
            'vivendo, o que o contexto pede. Não existe frase proibida — o ponto é perceber ' +
            'o momento e deixar que ele alimente o começo.',
        comparacao: {
            fraco: 'Senhor, nós Te louvamos, Te bendizemos e Te glorificamos...',
            forte: 'Senhor, chegamos aqui depois de uma semana difícil, mas com o coração disposto a Te buscar.'
        },
        exemplo: 'A família está passando por dificuldades. É esse o contexto real que alimenta a abertura.'
    },
    {
        id: 'a3',
        letra: 'T',
        nome: 'Trace o Caminho',
        pergunta: 'Para onde essa oração pode ir agora?',
        resumo: 'A letra mais importante. Um passo de cada vez.',
        texto: 'Você não precisa saber a oração inteira antes de começar. Precisa saber qual é ' +
            'o próximo movimento. Uma ideia, quando explorada com atenção, conduz naturalmente ' +
            'à próxima — o conteúdo já estava dentro do assunto que você começou. O mapa ' +
            'orienta, não aprisiona: dá para voltar a um assunto, aprofundar um só, mudar de ' +
            'direção ou encerrar antes.',
        exemplo: 'Família → marido → dificuldades → casamento → filhos → outras famílias → entrega.'
    },
    {
        id: 'a4',
        letra: 'A',
        nome: 'Aproxime a Congregação',
        pergunta: 'As pessoas conseguem acompanhar e participar?',
        resumo: 'Você fala com Deus na presença das pessoas — não para as pessoas sobre Deus.',
        texto: 'Quando quem ouve entende, acompanha e se identifica, passa a participar da oração ' +
            'mesmo em silêncio. Linguagem é ponte, não vitrine. Isso não significa simplificar a ' +
            'fé: significa que o "amém" no coração de quem ouve é parte da oração.',
        comparacao: {
            fraco: 'Ó Eterno e Soberano Senhor dos exércitos celestes, em Tua magnânima e inesgotável misericórdia...',
            forte: 'Senhor, essa família está cansada. Eles têm tentado, mas estão no limite. Nós confiamos que Tu estás dentro dessa história.'
        },
        exemplo: 'Linguagem simples, próxima, que todos sintam que pertence a eles também.'
    },
    {
        id: 'a5',
        letra: 'R',
        nome: 'Reafirme a Confiança',
        pergunta: 'Em que estamos confiando enquanto encerramos?',
        resumo: 'Terminar por entrega, não por falta de palavras.',
        texto: 'A conclusão não precisa ser uma fuga. Ela é um movimento intencional de entrega: ' +
            'conduzir o coração de todos para um lugar de fé e descanso sobre tudo o que foi ' +
            'apresentado. O "amém" nasce disso — e quando nasce daí, tem peso.',
        opcoes: [
            'Nós confiamos em Ti.',
            'Entregamos esta situação em Tuas mãos.',
            'Cremos que Tu estás conosco nisto.',
            'Obrigado porque podemos descansar em Ti.'
        ],
        exemplo: 'Entregar a família nas mãos de Deus, com fé de que Ele está dentro daquela situação.'
    }
];

/* Os 5 Ângulos — lentes para desenvolver uma única ideia (Módulo 4).
   Não competem com o ALTAR: funcionam dentro do T. */
A.ANGULOS = [
    {
        id: 'pessoas',
        n: 1,
        nome: 'Pessoas',
        pergunta: 'Quem está envolvido nisso?',
        dica: 'Uma ideia abstrata vira concreta quando você começa a ver rostos. ' +
            'Não precisa ser todo mundo — pode ser uma pessoa, uma relação.',
        exemplos: ['Família → o marido, a esposa', 'Os filhos, cada fase', 'Pais e irmãos', 'Os líderes, os jovens, os novos'],
        prompts: [
            'Quem especificamente você quer colocar diante de Deus agora?',
            'Quem dentro disso precisa de cuidado antes dos outros?',
            'Quem mais está nessa mesma situação e poderia ser incluído?'
        ]
    },
    {
        id: 'situacoes',
        n: 2,
        nome: 'Situações',
        pergunta: 'O que essas pessoas estão vivendo?',
        dica: 'O contexto real, não o ideal. Você não precisa inventar problemas nem ' +
            'dramatizar — basta observar o que já está diante dos seus olhos.',
        exemplos: ['Conflitos', 'Decisões difíceis', 'Enfermidade', 'Cansaço e distanciamento', 'Mudanças'],
        prompts: [
            'O que está de fato acontecendo com essas pessoas?',
            'O que você sabe — e é seguro dizer em voz alta?',
            'O que isso está causando nelas por dentro?'
        ]
    },
    {
        id: 'necessidades',
        n: 3,
        nome: 'Necessidades',
        pergunta: 'Do que essas pessoas precisam?',
        dica: 'É o ângulo que transforma a oração: você sai da descrição e entra na ' +
            'intercessão. Nomeie a necessidade com clareza.',
        exemplos: [
            'Conflito → reconciliação, paciência, humildade',
            'Decisão → sabedoria, clareza, direção',
            'Enfermidade → cuidado, cura, presença',
            'Dificuldade financeira → força, provisão, esperança',
            'Cansaço → descanso, renovação, paz'
        ],
        prompts: [
            'Diante disso, do que eles precisam de Deus?',
            'Qual é a necessidade por trás do pedido que foi feito?',
            'O que essa necessidade permitiria que eles vivessem?'
        ]
    },
    {
        id: 'fe',
        n: 4,
        nome: 'Fé',
        pergunta: 'O que podemos lembrar sobre Deus diante disso?',
        dica: 'A fé não precisa ser uma frase grandiosa nem um versículo memorizado. ' +
            'Uma afirmação simples de confiança, nascida do momento, basta.',
        exemplos: [
            'Deus permanece presente mesmo no que não conseguimos ver.',
            'Deus pode sustentar o que parece insustentável para nós.',
            'Deus pode dar sabedoria onde só temos dúvida.',
            'Deus conhece aquilo que não conseguimos resolver.'
        ],
        prompts: [
            'O que é verdade sobre Deus exatamente diante desta necessidade?',
            'O que essas pessoas precisam lembrar sobre Ele agora?',
            'O que a Palavra diz sobre isso — com suas palavras?'
        ]
    },
    {
        id: 'entrega',
        n: 5,
        nome: 'Entrega',
        pergunta: 'O que estamos colocando nas mãos de Deus?',
        dica: 'Uma oração não precisa resolver tudo. Às vezes a coisa mais poderosa que ' +
            'ela faz é entregar o que está além da nossa capacidade. Isso não é fraqueza — é fé.',
        exemplos: ['A situação, como ela está', 'As pessoas, uma a uma', 'O resultado que você não controla', 'O futuro', 'O que não dá para resolver'],
        prompts: [
            'O que aqui está além do que vocês conseguem resolver?',
            'O que dá para soltar agora, diante do que acabou de ser dito?',
            'O que você entrega em nome de quem está ouvindo?'
        ]
    }
];

/* As 4 Pontes — relações de pensamento que fazem a oração avançar (Módulo 5).
   Transição não é frase bonita: é relação entre duas ideias. */
A.PONTES = [
    {
        id: 'parte-todo',
        n: 1,
        nome: 'Parte → Todo',
        pergunta: 'O que essa situação específica revela ou envolve além dela mesma?',
        exemplo: '"Cuida dos nossos filhos..." → "e de cada família representada aqui" → "e de todos os lares desta comunidade."',
        porque: 'A oração não muda de assunto: ela expande o círculo. Começar pelo específico cria identificação.'
    },
    {
        id: 'situacao-necessidade',
        n: 2,
        nome: 'Situação → Necessidade',
        pergunta: 'Diante de tudo isso, do que precisamos?',
        exemplo: '"Eles estão diante de uma decisão difícil..." → "Dá sabedoria para que saibam escolher o caminho certo."',
        porque: 'A necessidade nasce da situação. Não é mudança de assunto — é consequência.'
    },
    {
        id: 'necessidade-fe',
        n: 3,
        nome: 'Necessidade → Fé',
        pergunta: 'O que posso lembrar sobre Deus diante exatamente desta necessidade?',
        exemplo: '"Precisamos de sabedoria..." → "Mas sabemos que Tu és o Deus que orienta."',
        porque: 'A fé soa natural porque responde a algo real dito momentos antes.'
    },
    {
        id: 'fe-entrega',
        n: 4,
        nome: 'Fé → Entrega',
        pergunta: 'Se confiamos nisso, o que podemos soltar agora?',
        exemplo: '"Sabemos que Tu estás no controle..." → "Por isso entregamos o futuro desta família em Tuas mãos."',
        porque: 'É a ponte que leva a oração ao repouso. Prepara o encerramento sem cortá-lo.'
    }
];

/* Os 5 Níveis — lente de profundidade (Módulo 6). Não é outro método:
   é o que fazer para enxergar além do pedido. */
A.NIVEIS = [
    {
        n: 1,
        nome: 'O que está acontecendo?',
        dica: 'Observe a realidade com clareza antes de falar sobre ela.',
        raso: 'Uma família está passando por uma fase difícil.',
        fundo: 'Existe uma decisão importante para tomar. Eles não sabem qual caminho seguir. O peso da escolha está sobre eles.'
    },
    {
        n: 2,
        nome: 'O que isso está causando?',
        dica: 'Vá além do acontecimento: perceba a experiência humana. Ansiedade, medo, desgaste, impotência.',
        raso: 'Eles estão preocupados.',
        fundo: 'É um peso que acorda com eles de manhã e vai dormir junto — e que às vezes nem é conversado, porque é difícil demais.'
    },
    {
        n: 3,
        nome: 'Do que realmente precisamos?',
        dica: 'O pedido é o que a pessoa consegue articular. A necessidade é o que ela realmente precisa.',
        raso: 'Senhor, abre uma porta.',
        fundo: 'Senhor, precisamos de sabedoria para saber qual porta devemos atravessar.'
    },
    {
        n: 4,
        nome: 'O que podemos lembrar sobre Deus?',
        dica: 'Conecte a necessidade à fé. Deixe o caráter de Deus responder à realidade humana.',
        raso: 'Deus é bom.',
        fundo: 'Mesmo quando não sabemos o que fazer, podemos confiar que Tu não perdeste o controle.'
    },
    {
        n: 5,
        nome: 'O que entregamos a Ele?',
        dica: 'A entrega não é o ponto fraco da oração. É o clímax dela.',
        raso: 'Amém.',
        fundo: 'Nós entregamos esse caminho em Tuas mãos — o que não conseguimos resolver e o que não conseguimos ver.'
    }
];

/* Cartão de dez segundos (Módulo 10). É o que a pessoa olha na igreja,
   com o microfone chegando. Curto de propósito. */
A.CHECKLIST = [
    { n: 1, p: 'Quem?', d: 'Quem está presente? Quem precisa ser incluído?' },
    { n: 2, p: 'O quê?', d: 'Por que estamos orando agora? Qual é o propósito?' },
    { n: 3, p: 'Necessidade?', d: 'O que este momento precisa de Deus?' },
    { n: 4, p: 'Primeiro movimento?', d: 'Qual é a primeira frase? Não a oração inteira.' },
    { n: 5, p: 'Confie e comece.', d: 'Você tem o mapa. Agora use sua voz.' }
];

/* Protocolo de travamento (Módulos 7 e 10). O botão vermelho do app. */
A.TRAVOU = {
    passos: [
        { t: 'Respire.', d: 'Uma pausa real. Não um segundo nervoso — um fôlego intencional.' },
        { t: 'Não peça desculpas.', d: 'Silêncio em oração não é erro. Muitas vezes é presença.' },
        { t: 'Não preencha o vazio.', d: 'Palavra dita só para tapar silêncio enfraquece a oração.' },
        { t: 'Volte ao momento.', d: 'Onde estou? Quem está aqui? O que está sendo vivido agora?' },
        { t: 'Pergunte o que o momento precisa.', d: 'Não a frase perfeita. O próximo pensamento verdadeiro.' },
        { t: 'Dê o próximo passo.', d: 'Não o próximo parágrafo. Só a próxima frase.' }
    ],
    /* Frases de retomada. Existem como exemplo de um princípio — quando você
       não sabe o que dizer, diga o que é verdadeiro sobre o momento. */
    retomadas: [
        'Senhor, Tu conheces o que estamos vivendo...',
        'Senhor, nós queremos colocar esta situação diante de Ti...',
        'Pai, nós não temos todas as palavras, mas viemos com o que temos...',
        'Senhor, nós nos colocamos diante de Ti neste momento...',
        'Pai, Tu sabes o que cada pessoa aqui trouxe hoje...'
    ],
    esqueceu: [
        'Não volte ao início — recomeçar interrompe o fluxo e sinaliza insegurança.',
        'Não peça desculpas — ninguém estava esperando aquela frase específica.',
        'Faça uma Ponte — use o que já disse como partida para o próximo movimento.',
        'Continue — quem ouve percebe propósito, não a ideia que ficou para trás.'
    ]
};

/* As seis respostas possíveis para "E agora?" (Módulo 10).
   Uma delas sempre está disponível — é o que a bússola oferece ao vivo. */
A.EAGORA = [
    { id: 'desenvolver', rotulo: 'Desenvolver', icone: '⊕', dica: 'Fique no assunto atual. Use outro dos 5 Ângulos.' },
    { id: 'conectar', rotulo: 'Conectar', icone: '→', dica: 'Faça uma Ponte: a próxima ideia nasce da anterior.' },
    { id: 'aprofundar', rotulo: 'Aprofundar', icone: '↓', dica: 'Desça um Nível: do pedido para a necessidade real.' },
    { id: 'incluir', rotulo: 'Incluir', icone: '◎', dica: 'Traga quem está ouvindo para dentro da oração.' },
    { id: 'entregar', rotulo: 'Entregar', icone: '🤲', dica: 'Coloque nas mãos de Deus o que não se resolve aqui.' },
    { id: 'encerrar', rotulo: 'Encerrar', icone: '■', dica: 'Conclua por confiança, não por falta de palavras.' }
];

/* Preparação interna de cinco passos, antes de falar (Módulo 7).
   Dura menos de dez segundos. */
A.PREPARO = [
    { t: 'Respirar', d: 'Uma respiração lenta. Não para impressionar — para aterrissar.' },
    { t: 'Diminuir a velocidade', d: 'Não comece na velocidade do nervosismo. Dê um passo atrás.' },
    { t: 'Olhar para o momento', d: 'Perceba quem está ali e o que estão vivendo.' },
    { t: 'Lembrar o propósito', d: '"Eu sei por que estou aqui." Essa frase é suficiente.' },
    { t: 'Começar', d: 'Não quando estiver perfeito. Agora, com o primeiro movimento.' }
];

/* As 7 verdades para levar (Módulo 9). */
A.VERDADES = [
    'Você não precisa esperar o medo desaparecer.',
    'Você não precisa decorar uma oração — precisa saber o próximo movimento.',
    'Uma ideia pode ser desenvolvida: uma só, com profundidade, vale mais que dez superficiais.',
    'Uma ideia pode se conectar à próxima. As Pontes existem para isso.',
    'O contexto pode mudar sem destruir a estrutura.',
    'Você pode continuar mesmo quando algo sai do plano. Isso não é falha — é condução.',
    'Oração perfeita não é o objetivo. Oração presente, intencional e que serve o momento, sim.'
];

/* Trocas de pensamento (Módulos 7 e 10). Aparecem no preparo e no fim do treino. */
A.TROCAS = [
    { antes: 'Qual frase devo falar agora?', depois: 'O que este momento precisa agora?' },
    { antes: 'E se eu esquecer o que ia dizer?', depois: 'Qual é o próximo movimento?' },
    { antes: 'E se me julgarem por como estou orando?', depois: 'Como posso servir este momento com a voz que tenho?' },
    { antes: 'Preciso parecer confiante para que me levem a sério.', depois: 'Preciso permanecer presente. Isso é suficiente.' },
    { antes: 'Preciso impressionar.', depois: 'Preciso servir.' },
    { antes: 'Preciso lembrar tudo.', depois: 'Preciso saber o próximo passo.' },
    { antes: 'Preciso parar de sentir medo.', depois: 'Posso continuar mesmo sentindo medo.' }
];

/* Declaração final do Módulo 10. Fica na tela de encerramento do programa. */
A.DECLARACAO = [
    'Eu não preciso saber tudo antes de começar.',
    'Não preciso decorar uma oração.',
    'Não preciso impressionar ninguém.',
    'Posso sentir nervosismo e continuar.',
    'Posso pausar. Posso recomeçar. Posso adaptar.',
    'Posso simplesmente dar o próximo passo.',
    'Deus não precisa da minha performance.',
    'Eu posso estar presente. Eu posso servir este momento. Eu posso usar minha voz.'
];
