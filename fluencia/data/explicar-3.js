/* =========================================================
   Explicar sem a palavra — parte 3.

   Mais material para o ano: repetir a mesma palavra meses
   depois é bom (a explicação sai diferente e melhor), mas
   quem faz isso todo dia precisa de rosto novo com frequência.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.explicar = (F.data.explicar || []).concat([

    /* ---------- nível 1 ---------- */
    {
        palavra: 'scissors', pt: 'tesoura', nivel: 1,
        proibidas: ['cut', 'paper', 'sharp', 'blade'],
        ajudam: ['two', 'metal', 'hand', 'kitchen', 'drawer', 'hair', 'open'],
        modelo: "Two pieces of metal joined in the middle; you put two fingers in and open and close them, and they live in the kitchen drawer.",
        modeloPt: 'Duas peças de metal unidas no meio; você põe dois dedos e abre e fecha, e vivem na gaveta da cozinha.'
    },
    {
        palavra: 'bucket', pt: 'balde', nivel: 1,
        proibidas: ['water', 'carry', 'plastic', 'clean'],
        ajudam: ['round', 'handle', 'floor', 'fill', 'heavy', 'rain', 'leak'],
        modelo: "It's round, it has a handle on top, and when the roof leaks you put it on the floor under the hole.",
        modeloPt: 'É redondo, tem uma alça em cima, e quando o telhado vaza você põe no chão embaixo do buraco.'
    },
    {
        palavra: 'remote control', pt: 'controle remoto', nivel: 1,
        proibidas: ['tv', 'buttons', 'channel', 'control'],
        ajudam: ['sofa', 'lose', 'batteries', 'find', 'point', 'volume', 'fight'],
        modelo: "It disappears between the cushions of the sofa, the batteries are always dead, and the whole family fights over it.",
        modeloPt: 'Some entre as almofadas do sofá, as pilhas estão sempre acabadas, e a família toda briga por ele.'
    },
    {
        palavra: 'shoelace', pt: 'cadarço', nivel: 1,
        proibidas: ['shoe', 'tie', 'string', 'foot'],
        ajudam: ['knot', 'child', 'learn', 'break', 'morning', 'loose', 'walk'],
        modelo: "A child takes a year to learn how to make the knot, and yours always comes loose in the middle of the street.",
        modeloPt: 'Uma criança leva um ano pra aprender o nó, e o seu sempre solta no meio da rua.'
    },
    {
        palavra: 'kettle', pt: 'chaleira', nivel: 1,
        proibidas: ['water', 'boil', 'tea', 'hot'],
        ajudam: ['whistle', 'stove', 'coffee', 'morning', 'metal', 'noise', 'wait'],
        modelo: "You put it on the stove in the morning, and when it whistles you know the coffee can be made.",
        modeloPt: 'Você põe no fogão de manhã, e quando apita você sabe que dá pra fazer o café.'
    },
    {
        palavra: 'hanger', pt: 'cabide', nivel: 1,
        proibidas: ['clothes', 'hang', 'closet', 'shirt'],
        ajudam: ['plastic', 'wire', 'shoulder', 'wardrobe', 'shape', 'thin', 'iron'],
        modelo: "It's thin, usually plastic, shaped like two shoulders, and you have thirty of them and never enough.",
        modeloPt: 'É fino, geralmente de plástico, no formato de dois ombros, e você tem trinta e nunca é o bastante.'
    },
    {
        palavra: 'nail clippers', pt: 'cortador de unha', nivel: 1,
        proibidas: ['nail', 'cut', 'finger', 'small'],
        ajudam: ['metal', 'bathroom', 'press', 'sunday', 'noise', 'lose', 'hand'],
        modelo: "A little metal thing in the bathroom, you press it and it makes that noise everyone hates on a Sunday morning.",
        modeloPt: 'Uma coisinha de metal no banheiro, você aperta e faz aquele barulho que todo mundo odeia num domingo de manhã.'
    },
    {
        palavra: 'seatbelt', pt: 'cinto de segurança', nivel: 1,
        proibidas: ['car', 'safe', 'belt', 'accident'],
        ajudam: ['click', 'front', 'law', 'forget', 'noise', 'chest', 'driver'],
        modelo: "You pull it across your chest and you hear the click; if you forget, that noise keeps going until you do it.",
        modeloPt: 'Você puxa pelo peito e ouve o clique; se esquecer, o apito não para até você colocar.'
    },
    {
        palavra: 'doormat', pt: 'capacho', nivel: 1,
        proibidas: ['door', 'feet', 'clean', 'shoes'],
        ajudam: ['outside', 'entrance', 'welcome', 'dirt', 'key', 'under', 'rough'],
        modelo: "It sits outside the entrance, it says welcome on it, and some people still hide a spare key under it.",
        modeloPt: 'Fica do lado de fora da entrada, tem "welcome" escrito, e ainda tem gente que esconde uma cópia da chave embaixo.'
    },
    {
        palavra: 'ice cube tray', pt: 'forma de gelo', nivel: 1,
        proibidas: ['ice', 'cold', 'freezer', 'water'],
        ajudam: ['plastic', 'squares', 'fill', 'twist', 'empty', 'guest', 'party'],
        modelo: "Plastic with little squares in it; you fill it, twist it two hours later, and there is never one ready when guests arrive.",
        modeloPt: 'De plástico com quadradinhos; você enche, torce duas horas depois, e nunca tem pronto quando chega visita.'
    },

    /* ---------- nível 2 ---------- */
    {
        palavra: 'to oversleep', pt: 'dormir demais / perder a hora', nivel: 2,
        proibidas: ['late', 'alarm', 'sleep', 'wake'],
        ajudam: ['meeting', 'nine', 'phone', 'run', 'shower', 'skip', 'panic'],
        modelo: "You open your eyes, the light is wrong, it's ten past nine, and the meeting started twenty minutes ago.",
        modeloPt: 'Você abre os olhos, a luz está errada, são nove e dez, e a reunião começou há vinte minutos.'
    },
    {
        palavra: 'to split the bill', pt: 'dividir a conta', nivel: 2,
        proibidas: ['pay', 'money', 'bill', 'divide'],
        ajudam: ['restaurant', 'eight', 'calculator', 'card', 'each', 'awkward', 'wine'],
        modelo: "Eight people at a restaurant, one calculator, and the two who only had a salad are not very happy.",
        modeloPt: 'Oito pessoas no restaurante, uma calculadora, e os dois que só comeram salada não estão nada felizes.'
    },
    {
        palavra: 'to cancel last minute', pt: 'desmarcar em cima da hora', nivel: 2,
        proibidas: ['cancel', 'late', 'plans', 'sorry'],
        ajudam: ['already', 'dressed', 'message', 'twenty', 'minutes', 'before', 'again'],
        modelo: "You are already dressed and about to leave when the message arrives — twenty minutes before, for the third time this month.",
        modeloPt: 'Você já está vestido e prestes a sair quando chega a mensagem — vinte minutos antes, pela terceira vez no mês.'
    },
    {
        palavra: 'to be stuck in a queue', pt: 'estar preso numa fila', nivel: 2,
        proibidas: ['line', 'queue', 'wait', 'people'],
        ajudam: ['bank', 'hour', 'move', 'number', 'chair', 'front', 'nothing'],
        modelo: "You took a number at the bank an hour ago, nothing has moved, and there are still eleven in front of you.",
        modeloPt: 'Você pegou a senha no banco uma hora atrás, nada andou, e ainda tem onze na sua frente.'
    },
    {
        palavra: 'housewarming', pt: 'festa de casa nova', nivel: 2,
        proibidas: ['house', 'party', 'new', 'home'],
        ajudam: ['moved', 'friends', 'invite', 'plant', 'boxes', 'first', 'wine'],
        modelo: "You just moved, half the boxes are still closed, and you invite everyone anyway — they all bring a plant.",
        modeloPt: 'Você acabou de se mudar, metade das caixas fechadas, e convida todo mundo assim mesmo — todos levam uma planta.'
    },
    {
        palavra: 'to work overtime', pt: 'fazer hora extra', nivel: 2,
        proibidas: ['work', 'hours', 'late', 'extra'],
        ajudam: ['stay', 'office', 'nine', 'night', 'dinner', 'family', 'paid'],
        modelo: "Everyone else left at six, you are still at your desk at nine at night, and dinner at home went cold.",
        modeloPt: 'Todo mundo saiu às seis, você continua na mesa às nove da noite, e o jantar em casa esfriou.'
    },
    {
        palavra: 'to have a flat tire', pt: 'furar o pneu', nivel: 2,
        proibidas: ['tire', 'car', 'flat', 'wheel'],
        ajudam: ['road', 'stop', 'rain', 'spare', 'change', 'middle', 'nowhere'],
        modelo: "You hear a bang, everything pulls to one side, and you stop in the rain in the middle of nowhere to put the spare on.",
        modeloPt: 'Você ouve um estouro, tudo puxa pro lado, e você para na chuva no meio do nada pra pôr o estepe.'
    },
    {
        palavra: 'to babysit', pt: 'tomar conta de criança', nivel: 2,
        proibidas: ['children', 'kids', 'watch', 'parents'],
        ajudam: ['evening', 'neighbor', 'sleep', 'money', 'teenager', 'television', 'quiet'],
        modelo: "The neighbors go out for dinner, a teenager stays in the living room until midnight, and gets paid for it.",
        modeloPt: 'Os vizinhos saem pra jantar, um adolescente fica na sala até meia-noite, e ganha por isso.'
    },
    {
        palavra: 'to get lost', pt: 'se perder', nivel: 2,
        proibidas: ['lost', 'map', 'way', 'find'],
        ajudam: ['street', 'wrong', 'turn', 'phone', 'battery', 'ask', 'circle'],
        modelo: "You took the wrong turn twenty minutes ago, your phone has no battery, and you have passed the same church three times.",
        modeloPt: 'Você virou errado vinte minutos atrás, o celular sem bateria, e já passou pela mesma igreja três vezes.'
    },
    {
        palavra: 'to have second helpings', pt: 'repetir o prato', nivel: 2,
        proibidas: ['eat', 'more', 'food', 'plate'],
        ajudam: ['again', 'grandmother', 'sunday', 'full', 'no', 'insist', 'cannot'],
        modelo: "You are completely full, you already said no twice, and your grandmother is serving you again anyway.",
        modeloPt: 'Você está completamente cheio, já disse não duas vezes, e sua avó está te servindo de novo mesmo assim.'
    },

    /* ---------- nível 3 ---------- */
    {
        palavra: 'guilt', pt: 'culpa (sentimento)', nivel: 3,
        proibidas: ['guilty', 'bad', 'wrong', 'fault'],
        ajudam: ['night', 'think', 'should', 'have', 'mother', 'call', 'weight'],
        modelo: "You didn't call your mother for three weeks, and now every time you sit down quietly the thought comes back.",
        modeloPt: 'Você não ligou pra sua mãe por três semanas, e agora toda vez que senta em silêncio o pensamento volta.'
    },
    {
        palavra: 'to be fed up', pt: 'estar de saco cheio', nivel: 3,
        proibidas: ['tired', 'angry', 'enough', 'stop'],
        ajudam: ['same', 'thing', 'months', 'again', 'today', 'cannot', 'anymore'],
        modelo: "It's the same thing every single day for eight months, and this morning something inside you just said: not one more time.",
        modeloPt: 'É a mesma coisa todo dia há oito meses, e hoje de manhã algo dentro de você disse: nem mais uma vez.'
    },
    {
        palavra: 'to procrastinate', pt: 'enrolar / empurrar com a barriga', nivel: 3,
        proibidas: ['later', 'delay', 'lazy', 'time'],
        ajudam: ['clean', 'kitchen', 'instead', 'important', 'tomorrow', 'anything', 'else'],
        modelo: "The important thing is right there on the table, and suddenly you decide the kitchen absolutely has to be cleaned first.",
        modeloPt: 'A coisa importante está ali na mesa, e de repente você decide que a cozinha precisa ser limpa antes.'
    },
    {
        palavra: 'to be picky', pt: 'ser exigente / cheio de dedos', nivel: 3,
        proibidas: ['choose', 'difficult', 'like', 'taste'],
        ajudam: ['menu', 'twenty', 'minutes', 'restaurant', 'nothing', 'right', 'child'],
        modelo: "Twenty minutes with the menu open, everything has one small problem, and in the end you order the same thing as always.",
        modeloPt: 'Vinte minutos com o cardápio aberto, tudo tem um probleminha, e no fim você pede o de sempre.'
    },
    {
        palavra: 'to take something personally', pt: 'levar para o lado pessoal', nivel: 3,
        proibidas: ['personal', 'offend', 'feel', 'attack'],
        ajudam: ['comment', 'meeting', 'about', 'work', 'not', 'you', 'night'],
        modelo: "The comment was about the report, not about who wrote it — but you went home and thought about it all night.",
        modeloPt: 'O comentário era sobre o relatório, não sobre quem escreveu — mas você foi pra casa e pensou nisso a noite toda.'
    },
    {
        palavra: 'to catch someone off guard', pt: 'pegar desprevenido', nivel: 3,
        proibidas: ['surprise', 'ready', 'expect', 'guard'],
        ajudam: ['question', 'meeting', 'suddenly', 'nothing', 'say', 'silence', 'blank'],
        modelo: "In the middle of the meeting they ask you a question you had not thought about, and for four seconds nothing comes out.",
        modeloPt: 'No meio da reunião te fazem uma pergunta na qual você não tinha pensado, e por quatro segundos não sai nada.'
    },
    {
        palavra: 'to be out of touch', pt: 'estar por fora', nivel: 3,
        proibidas: ['know', 'news', 'touch', 'old'],
        ajudam: ['years', 'young', 'music', 'reference', 'laugh', 'everyone', 'lost'],
        modelo: "Everyone at the table laughs at a reference and you have absolutely no idea what they are talking about.",
        modeloPt: 'Todo mundo na mesa ri de uma referência e você não faz a menor ideia do que estão falando.'
    },
    {
        palavra: 'to bottle things up', pt: 'guardar tudo por dentro', nivel: 3,
        proibidas: ['feelings', 'hide', 'inside', 'talk'],
        ajudam: ['never', 'say', 'anything', 'fine', 'months', 'explode', 'small'],
        modelo: "For months the answer is always fine, nothing ever comes out — and then one small thing makes everything come at once.",
        modeloPt: 'Por meses a resposta é sempre "tudo bem", nada sai — e aí uma coisa pequena faz tudo vir de uma vez.'
    },
    {
        palavra: 'to grow on you', pt: 'ir gostando aos poucos', nivel: 3,
        proibidas: ['like', 'love', 'grow', 'time'],
        ajudam: ['first', 'hated', 'song', 'week', 'now', 'listen', 'again'],
        modelo: "The first week you heard that song you hated it, and now it's the only thing you listen to in the car.",
        modeloPt: 'Na primeira semana em que ouviu aquela música você odiou, e agora é a única coisa que escuta no carro.'
    },
    {
        palavra: 'to have mixed feelings', pt: 'estar dividido', nivel: 3,
        proibidas: ['feel', 'both', 'sad', 'happy'],
        ajudam: ['leaving', 'job', 'good', 'news', 'still', 'strange', 'same'],
        modelo: "You got the job in another city — it's exactly what you wanted, and at the same time you don't want to leave anyone.",
        modeloPt: 'Você conseguiu o emprego em outra cidade — é exatamente o que queria, e ao mesmo tempo não quer deixar ninguém.'
    },

    /* ---------- nível 4 ---------- */
    {
        palavra: 'onboarding', pt: 'integração de novo funcionário', nivel: 4,
        proibidas: ['new', 'employee', 'training', 'start'],
        ajudam: ['first', 'week', 'laptop', 'access', 'meet', 'team', 'lost'],
        modelo: "The first week: somebody gives you a laptop, seven passwords, and a coffee with each person on the team.",
        modeloPt: 'A primeira semana: alguém te dá um notebook, sete senhas, e um café com cada pessoa do time.'
    },
    {
        palavra: 'scope creep', pt: 'projeto que incha sem parar', nivel: 4,
        proibidas: ['project', 'grow', 'scope', 'more'],
        ajudam: ['client', 'small', 'thing', 'week', 'never', 'ends', 'agreed'],
        modelo: "You agreed to build one small thing, and every week the client adds another little request until the job is three times bigger.",
        modeloPt: 'Você combinou fazer uma coisa pequena, e toda semana o cliente adiciona um pedidinho até o trabalho ficar três vezes maior.'
    },
    {
        palavra: 'to push back', pt: 'peitar / contestar educadamente', nivel: 4,
        proibidas: ['no', 'refuse', 'push', 'disagree'],
        ajudam: ['boss', 'deadline', 'impossible', 'say', 'politely', 'reason', 'meeting'],
        modelo: "Your boss asks for it by Tuesday, and instead of nodding you explain politely why that date is simply impossible.",
        modeloPt: 'Seu chefe pede pra terça, e em vez de concordar você explica educadamente por que essa data é impossível.'
    },
    {
        palavra: 'stakeholder', pt: 'parte interessada', nivel: 4,
        proibidas: ['people', 'interest', 'project', 'company'],
        ajudam: ['decision', 'affects', 'money', 'client', 'team', 'approve', 'room'],
        modelo: "Anyone the decision affects and who therefore has to be in the room before you approve anything.",
        modeloPt: 'Qualquer um que a decisão afeta e que por isso precisa estar na sala antes de aprovarem algo.'
    },
    {
        palavra: 'to take the blame', pt: 'assumir a culpa', nivel: 4,
        proibidas: ['blame', 'fault', 'guilty', 'wrong'],
        ajudam: ['team', 'mistake', 'front', 'client', 'say', 'mine', 'protect'],
        modelo: "The team made the mistake, but in front of the client you say it was your responsibility and nobody else's.",
        modeloPt: 'O time errou, mas na frente do cliente você diz que a responsabilidade foi sua e de mais ninguém.'
    },
    {
        palavra: 'to play devil’s advocate', pt: 'bancar o do contra (de propósito)', nivel: 4,
        proibidas: ['against', 'argue', 'devil', 'disagree'],
        ajudam: ['agree', 'actually', 'other', 'side', 'test', 'idea', 'purpose'],
        modelo: "You actually think the idea is good, but you defend the opposite for ten minutes just to see if it survives.",
        modeloPt: 'Você até acha a ideia boa, mas defende o oposto por dez minutos só pra ver se ela sobrevive.'
    },
    {
        palavra: 'to be understaffed', pt: 'estar com equipe curta', nivel: 4,
        proibidas: ['people', 'staff', 'hire', 'few'],
        ajudam: ['three', 'doing', 'work', 'six', 'nobody', 'replaced', 'tired'],
        modelo: "Two colleagues left in March and nobody replaced them, so three of you are doing the work of six.",
        modeloPt: 'Dois colegas saíram em março e ninguém foi contratado, então três de vocês fazem o trabalho de seis.'
    },
    {
        palavra: 'a rain check', pt: 'fica pra próxima', nivel: 4,
        proibidas: ['later', 'another', 'time', 'rain'],
        ajudam: ['tonight', 'cannot', 'promise', 'next', 'week', 'invitation', 'yes'],
        modelo: "You want to go and you are saying yes in principle — just not tonight; ask me again next week.",
        modeloPt: 'Você quer ir e está dizendo sim em princípio — só não hoje; me chame de novo na semana que vem.'
    },
    {
        palavra: 'to burn bridges', pt: 'queimar a ponte / fechar a porta', nivel: 4,
        proibidas: ['bridge', 'relationship', 'never', 'end'],
        ajudam: ['quit', 'email', 'everyone', 'copy', 'angry', 'back', 'later'],
        modelo: "On your last day you send that email to the whole company — and two years later you need one of them for a job.",
        modeloPt: 'No último dia você manda aquele e-mail pra empresa toda — e dois anos depois precisa de um deles pra um emprego.'
    },
    {
        palavra: 'to sleep on it', pt: 'dormir sobre o assunto', nivel: 4,
        proibidas: ['sleep', 'decide', 'tomorrow', 'think'],
        ajudam: ['answer', 'now', 'night', 'morning', 'clear', 'wait', 'tired'],
        modelo: "They want an answer right now, but you say you'll give it in the morning — everything looks different after a night.",
        modeloPt: 'Querem a resposta agora, mas você diz que dá de manhã — tudo parece diferente depois de uma noite.'
    }
]);
