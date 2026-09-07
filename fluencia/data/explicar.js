/* =========================================================
   Explicar sem a palavra — contornar o buraco de vocabulário.

   A habilidade que separa quem trava de quem conversa não é
   saber todas as palavras: é conseguir chegar na ideia sem a
   palavra que faltou. Nativo faz isso o tempo todo ("aquela
   coisa que a gente usa pra..."). Brasileiro intermediário
   trava, pede desculpa e muda de assunto.

   Cada item traz palavras PROIBIDAS — as saídas fáceis, que
   matariam o exercício — e palavras que AJUDAM, que valem
   ponto extra mas não são obrigatórias. O modelo no fim é uma
   forma de dizer, não a forma.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.explicar = [

    /* ---------- nível 1: coisas do dia a dia ---------- */
    {
        palavra: 'wallet', pt: 'carteira (de dinheiro)', nivel: 1,
        proibidas: ['money', 'cash', 'card', 'pocket'],
        ajudam: ['carry', 'keep', 'documents', 'small', 'leather', 'lose', 'thin'],
        modelo: "It's a small thing you carry with you every day. You keep your documents and your bills inside it, and it fits in your jeans.",
        modeloPt: 'É uma coisa pequena que você carrega todo dia, onde guarda documentos e notas, e que cabe na calça.'
    },
    {
        palavra: 'umbrella', pt: 'guarda-chuva', nivel: 1,
        proibidas: ['rain', 'wet', 'water'],
        ajudam: ['open', 'above', 'head', 'carry', 'wind', 'broke', 'street'],
        modelo: "You open it above your head when the weather goes bad, and the wind always breaks it on the way to work.",
        modeloPt: 'Você abre acima da cabeça quando o tempo vira, e o vento sempre quebra no caminho do trabalho.'
    },
    {
        palavra: 'ladder', pt: 'escada (portátil)', nivel: 1,
        proibidas: ['stairs', 'climb', 'steps', 'high'],
        ajudam: ['reach', 'top', 'shelf', 'paint', 'lean', 'wall', 'fall'],
        modelo: "You need it when something is too far above you — you lean it against the wall to reach the top shelf.",
        modeloPt: 'Você precisa quando algo está longe demais acima de você — encosta na parede pra alcançar a prateleira de cima.'
    },
    {
        palavra: 'mirror', pt: 'espelho', nivel: 1,
        proibidas: ['reflection', 'glass', 'see yourself', 'image'],
        ajudam: ['face', 'look', 'bathroom', 'wall', 'shave', 'hair', 'behind'],
        modelo: "It hangs on the bathroom wall, and you look at it every morning to fix your hair before you leave.",
        modeloPt: 'Fica na parede do banheiro, e você olha toda manhã pra ajeitar o cabelo antes de sair.'
    },
    {
        palavra: 'sponge', pt: 'esponja', nivel: 1,
        proibidas: ['soap', 'dishes', 'clean', 'kitchen'],
        ajudam: ['soft', 'yellow', 'squeeze', 'water', 'holds', 'sink', 'wash'],
        modelo: "It's soft, it holds a lot of water, and you squeeze it before you leave it by the sink.",
        modeloPt: 'É macio, segura muita água, e você aperta antes de deixar do lado da pia.'
    },
    {
        palavra: 'blender', pt: 'liquidificador', nivel: 1,
        proibidas: ['juice', 'mix', 'kitchen', 'machine'],
        ajudam: ['loud', 'fruit', 'ice', 'button', 'morning', 'drink', 'fast'],
        modelo: "It's very loud, it has a button on the front, and you throw fruit and ice in it when you want something to drink.",
        modeloPt: 'É muito barulhento, tem um botão na frente, e você joga fruta e gelo pra fazer algo pra beber.'
    },
    {
        palavra: 'stapler', pt: 'grampeador', nivel: 1,
        proibidas: ['paper', 'staple', 'office', 'together'],
        ajudam: ['press', 'metal', 'desk', 'small', 'holds', 'pages', 'corner'],
        modelo: "It sits on your desk, you press it in the corner of two pages, and a tiny piece of metal holds them.",
        modeloPt: 'Fica na mesa, você aperta no canto de duas folhas, e um pedacinho de metal segura as duas.'
    },
    {
        palavra: 'pillow', pt: 'travesseiro', nivel: 1,
        proibidas: ['sleep', 'bed', 'head', 'soft'],
        ajudam: ['night', 'under', 'hotel', 'wash', 'cotton', 'flat', 'hug'],
        modelo: "You put it under you at night, and in a bad hotel it's completely flat and you can't rest.",
        modeloPt: 'Você põe embaixo de você à noite, e num hotel ruim ele é totalmente chato e você não descansa.'
    },
    {
        palavra: 'fridge', pt: 'geladeira', nivel: 1,
        proibidas: ['cold', 'food', 'kitchen', 'ice'],
        ajudam: ['door', 'open', 'milk', 'inside', 'noise', 'big', 'keeps'],
        modelo: "It's the big white thing you open twenty times a day looking for something that isn't there.",
        modeloPt: 'É a coisa branca e grande que você abre vinte vezes por dia procurando algo que não está lá.'
    },
    {
        palavra: 'sunglasses', pt: 'óculos de sol', nivel: 1,
        proibidas: ['sun', 'eyes', 'dark', 'glasses'],
        ajudam: ['face', 'beach', 'wear', 'lose', 'car', 'bright', 'cheap'],
        modelo: "You wear them on your face at the beach, and you always lose them in the car.",
        modeloPt: 'Você usa no rosto na praia, e sempre perde dentro do carro.'
    },
    {
        palavra: 'flip-flops', pt: 'chinelo', nivel: 1,
        proibidas: ['feet', 'beach', 'shoes', 'rubber'],
        ajudam: ['wear', 'summer', 'cheap', 'noise', 'walk', 'home', 'toes'],
        modelo: "Brazilians wear them everywhere in the summer, they cost almost nothing, and they make a noise when you walk.",
        modeloPt: 'Brasileiro usa em todo lugar no verão, custa quase nada, e faz barulho quando você anda.'
    },
    {
        palavra: 'charger', pt: 'carregador', nivel: 1,
        proibidas: ['phone', 'battery', 'plug', 'electricity'],
        ajudam: ['cable', 'wall', 'forget', 'travel', 'hotel', 'borrow', 'dead'],
        modelo: "It's the cable you always forget in the hotel, and then you spend the whole day asking strangers to lend you one.",
        modeloPt: 'É o cabo que você sempre esquece no hotel, e aí passa o dia pedindo um emprestado para estranhos.'
    },
    {
        palavra: 'helmet', pt: 'capacete', nivel: 1,
        proibidas: ['head', 'protect', 'motorcycle', 'safety'],
        ajudam: ['hard', 'wear', 'law', 'fall', 'bike', 'construction', 'hot'],
        modelo: "It's hard, it's hot, and the law says you have to wear it on a bike — for a very good reason.",
        modeloPt: 'É duro, é quente, e a lei manda usar na moto — por um motivo muito bom.'
    },
    {
        palavra: 'lighter', pt: 'isqueiro', nivel: 1,
        proibidas: ['fire', 'cigarette', 'flame', 'burn'],
        ajudam: ['small', 'plastic', 'candle', 'borrow', 'lose', 'pocket', 'party'],
        modelo: "It's small and plastic, everyone borrows one at a party, and nobody ever gives it back.",
        modeloPt: 'É pequeno e de plástico, todo mundo pede emprestado na festa, e ninguém devolve.'
    },
    {
        palavra: 'blanket', pt: 'cobertor', nivel: 1,
        proibidas: ['cold', 'bed', 'warm', 'sleep'],
        ajudam: ['heavy', 'winter', 'sofa', 'pull', 'wool', 'night', 'cover'],
        modelo: "In winter you pull it over you on the sofa, and after ten minutes you're asleep in front of the TV.",
        modeloPt: 'No inverno você puxa por cima de você no sofá, e em dez minutos dorme na frente da TV.'
    },
    {
        palavra: 'towel', pt: 'toalha', nivel: 1,
        proibidas: ['dry', 'wet', 'shower', 'bath'],
        ajudam: ['soft', 'beach', 'hang', 'use', 'after', 'body', 'sand'],
        modelo: "You use it when you come out of the bathroom, and at the beach you lie on it and take half the sand home.",
        modeloPt: 'Você usa quando sai do banheiro, e na praia deita em cima e leva metade da areia pra casa.'
    },
    {
        palavra: 'key', pt: 'chave', nivel: 1,
        proibidas: ['door', 'lock', 'open', 'house'],
        ajudam: ['metal', 'small', 'pocket', 'lose', 'copy', 'neighbor', 'inside'],
        modelo: "It's small and made of metal, and the worst moment of your life is when you leave it inside the apartment and hear the click behind you.",
        modeloPt: 'É pequena e de metal, e o pior momento da sua vida é quando você deixa dentro do apartamento e ouve o clique atrás de você.'
    },
    {
        palavra: 'stairs', pt: 'escada (do prédio)', nivel: 1,
        proibidas: ['up', 'down', 'climb', 'steps', 'floor'],
        ajudam: ['elevator', 'broken', 'building', 'tired', 'legs', 'walk', 'above'],
        modelo: "When the elevator is broken in an old building, this is how you reach apartment 502 — and your legs hate you afterwards.",
        modeloPt: 'Quando o elevador quebra num prédio velho, é assim que você chega no apartamento 502 — e suas pernas te odeiam depois.'
    },
    {
        palavra: 'washing machine', pt: 'máquina de lavar', nivel: 1,
        proibidas: ['clothes', 'wash', 'clean', 'water'],
        ajudam: ['noise', 'turn', 'inside', 'sunday', 'shirt', 'shrink', 'hour'],
        modelo: "You put your shirts inside, it turns for an hour making a lot of noise, and sometimes your favorite one comes out two sizes smaller.",
        modeloPt: 'Você põe as camisas dentro, roda por uma hora fazendo barulho, e às vezes a favorita sai dois números menor.'
    },
    {
        palavra: 'straw', pt: 'canudo', nivel: 1,
        proibidas: ['drink', 'plastic', 'suck', 'juice'],
        ajudam: ['thin', 'long', 'glass', 'paper', 'kids', 'restaurant', 'through'],
        modelo: "It's thin and long, it comes in your glass at a restaurant, and now they give you a paper one that dies in five minutes.",
        modeloPt: 'É fino e comprido, vem no copo no restaurante, e agora te dão um de papel que morre em cinco minutos.'
    },

    /* ---------- nível 2: situações e ações ---------- */
    {
        palavra: 'traffic jam', pt: 'congestionamento', nivel: 2,
        proibidas: ['traffic', 'cars', 'stuck', 'road'],
        ajudam: ['late', 'move', 'hour', 'horn', 'radio', 'morning', 'nothing'],
        modelo: "Nothing moves for forty minutes, everybody is late for work, and the only thing you hear is people using the horn.",
        modeloPt: 'Nada anda por quarenta minutos, todo mundo está atrasado, e só se ouve gente buzinando.'
    },
    {
        palavra: 'hangover', pt: 'ressaca', nivel: 2,
        proibidas: ['drink', 'alcohol', 'party', 'drunk', 'beer'],
        ajudam: ['head', 'morning', 'after', 'water', 'light', 'regret', 'promise'],
        modelo: "It's the morning after, your head hurts, the light is too strong, and you promise you'll never do it again.",
        modeloPt: 'É a manhã seguinte, a cabeça dói, a luz incomoda, e você promete que nunca mais faz isso.'
    },
    {
        palavra: 'to postpone', pt: 'adiar', nivel: 2,
        proibidas: ['delay', 'later', 'move', 'reschedule'],
        ajudam: ['meeting', 'friday', 'instead', 'again', 'week', 'decide', 'change'],
        modelo: "The meeting was going to be today, but now it happens next Friday instead — for the third time.",
        modeloPt: 'A reunião ia ser hoje, mas agora acontece na sexta que vem — pela terceira vez.'
    },
    {
        palavra: 'to complain', pt: 'reclamar', nivel: 2,
        proibidas: ['complain', 'angry', 'bad', 'problem'],
        ajudam: ['manager', 'restaurant', 'cold', 'tell', 'unhappy', 'loud', 'service'],
        modelo: "The food arrives cold, so you call the manager and tell him exactly why you are not happy.",
        modeloPt: 'A comida chega fria, então você chama o gerente e diz exatamente por que não está satisfeito.'
    },
    {
        palavra: 'to borrow', pt: 'pegar emprestado', nivel: 2,
        proibidas: ['lend', 'give', 'take', 'return'],
        ajudam: ['friend', 'car', 'use', 'back', 'ask', 'promise', 'week'],
        modelo: "You ask a friend for his car, you use it on the weekend, and on Monday it is with him again — that's what you did.",
        modeloPt: 'Você pede o carro do amigo, usa no fim de semana e na segunda ele já está com o dono — foi isso que você fez.'
    },
    {
        palavra: 'refund', pt: 'reembolso', nivel: 2,
        proibidas: ['money back', 'return', 'pay', 'buy'],
        ajudam: ['broken', 'store', 'receipt', 'week', 'card', 'ask', 'wrong'],
        modelo: "The thing you bought arrived broken, you took the receipt to the store, and a week later the amount is back on your card.",
        modeloPt: 'O que você comprou chegou quebrado, você levou a nota na loja, e uma semana depois o valor volta pro cartão.'
    },
    {
        palavra: 'layover', pt: 'escala (de voo)', nivel: 2,
        proibidas: ['flight', 'airport', 'plane', 'connection'],
        ajudam: ['wait', 'hours', 'city', 'between', 'sleep', 'coffee', 'gate'],
        modelo: "You don't go straight there: you wait six hours in a city in the middle, drinking bad coffee at the gate.",
        modeloPt: 'Você não vai direto: espera seis horas numa cidade no meio, tomando café ruim no portão.'
    },
    {
        palavra: 'blind date', pt: 'encontro às cegas', nivel: 2,
        proibidas: ['date', 'meet', 'romantic', 'stranger'],
        ajudam: ['friend', 'never', 'before', 'dinner', 'nervous', 'photo', 'arranged'],
        modelo: "A friend arranges dinner with someone you have never seen before — you're nervous and you have no idea what to expect.",
        modeloPt: 'Um amigo marca um jantar com alguém que você nunca viu — você fica nervoso e sem ideia do que esperar.'
    },
    {
        palavra: 'deadline', pt: 'prazo final', nivel: 2,
        proibidas: ['date', 'time', 'finish', 'due'],
        ajudam: ['friday', 'before', 'client', 'late', 'pressure', 'night', 'promised'],
        modelo: "You promised the client it would be ready by Friday, so on Thursday night nobody in the team goes home.",
        modeloPt: 'Você prometeu ao cliente que estaria pronto na sexta, então na quinta à noite ninguém do time vai pra casa.'
    },
    {
        palavra: 'raise', pt: 'aumento de salário', nivel: 2,
        proibidas: ['salary', 'money', 'pay', 'more'],
        ajudam: ['boss', 'ask', 'year', 'same', 'work', 'meeting', 'deserve'],
        modelo: "You do the same job, but after two good years you sit with your boss and ask for a better number.",
        modeloPt: 'Você faz o mesmo trabalho, mas depois de dois anos bons senta com o chefe e pede um número melhor.'
    },
    {
        palavra: 'to be fired', pt: 'ser demitido', nivel: 2,
        proibidas: ['fired', 'job', 'work', 'quit', 'boss'],
        ajudam: ['leave', 'box', 'friday', 'told', 'company', 'no longer', 'email'],
        modelo: "On Friday they tell you the company no longer needs you, and you leave with a box and no plan.",
        modeloPt: 'Na sexta te dizem que a empresa não precisa mais de você, e você sai com uma caixa e sem plano.'
    },
    {
        palavra: 'to quit', pt: 'pedir demissão', nivel: 2,
        proibidas: ['leave', 'job', 'resign', 'work'],
        ajudam: ['decide', 'yourself', 'letter', 'boss', 'month', 'tired', 'new'],
        modelo: "Nobody pushed you out — you decided yourself, wrote the letter, and gave them a month.",
        modeloPt: 'Ninguém te tirou — você decidiu sozinho, escreveu a carta e deu um mês de aviso.'
    },
    {
        palavra: 'to gossip', pt: 'fofocar', nivel: 2,
        proibidas: ['talk', 'people', 'secret', 'rumor'],
        ajudam: ['office', 'behind', 'kitchen', 'quiet', 'someone', 'story', 'true'],
        modelo: "Two coworkers in the office kitchen, voices very low, saying things about a third one who is not there.",
        modeloPt: 'Dois colegas na copa do escritório, voz baixinha, falando de um terceiro que não está lá.'
    },
    {
        palavra: 'to apologize', pt: 'pedir desculpa', nivel: 2,
        proibidas: ['sorry', 'excuse', 'forgive', 'apology'],
        ajudam: ['wrong', 'admit', 'fault', 'again', 'call', 'late', 'say'],
        modelo: "You know you were wrong, so you call the person, admit it was your fault, and promise it won't happen again.",
        modeloPt: 'Você sabe que errou, então liga pra pessoa, admite que a culpa foi sua, e promete que não repete.'
    },
    {
        palavra: 'to catch up', pt: 'colocar o papo em dia', nivel: 2,
        proibidas: ['talk', 'meet', 'friend', 'news'],
        ajudam: ['months', 'coffee', 'happened', 'since', 'tell', 'life', 'each'],
        modelo: "You haven't seen someone for eight months, so you sit for a coffee and each of you tells everything that happened since.",
        modeloPt: 'Você não vê a pessoa há oito meses, então senta pra um café e cada um conta tudo que aconteceu.'
    },
    {
        palavra: 'to run out of', pt: 'acabar (o estoque)', nivel: 2,
        proibidas: ['finish', 'end', 'empty', 'more', 'left'],
        ajudam: ['coffee', 'monday', 'store', 'nothing', 'buy', 'need', 'again'],
        modelo: "It's Monday morning, you go to make coffee, and there is simply none in the house — again.",
        modeloPt: 'É segunda de manhã, você vai fazer café, e simplesmente não tem em casa — de novo.'
    },
    {
        palavra: 'to give up', pt: 'desistir', nivel: 2,
        proibidas: ['stop', 'quit', 'give', 'try'],
        ajudam: ['gym', 'january', 'february', 'hard', 'decide', 'anymore', 'never'],
        modelo: "You start the gym in January, and by the middle of February you decide you are not going anymore.",
        modeloPt: 'Você começa a academia em janeiro, e no meio de fevereiro decide que não vai mais.'
    },
    {
        palavra: 'to show up', pt: 'aparecer (comparecer)', nivel: 2,
        proibidas: ['arrive', 'come', 'appear', 'go'],
        ajudam: ['party', 'invited', 'nobody', 'wait', 'hour', 'late', 'there'],
        modelo: "You invited fifteen people and waited an hour, but only two were actually there.",
        modeloPt: 'Você convidou quinze pessoas e esperou uma hora, mas só duas de fato estavam lá.'
    },
    {
        palavra: 'commute', pt: 'trajeto casa-trabalho', nivel: 2,
        proibidas: ['work', 'travel', 'go', 'transport'],
        ajudam: ['bus', 'hour', 'every', 'morning', 'back', 'evening', 'far'],
        modelo: "Two hours on the bus in the morning and two hours back in the evening, every single day of your life.",
        modeloPt: 'Duas horas de ônibus de manhã e duas na volta à noite, todo santo dia da sua vida.'
    },
    {
        palavra: 'leftovers', pt: 'sobras (de comida)', nivel: 2,
        proibidas: ['food', 'eat', 'rest', 'remain'],
        ajudam: ['fridge', 'yesterday', 'lunch', 'tomorrow', 'plastic', 'heat', 'again'],
        modelo: "What was on the table yesterday, now in a plastic box, and tomorrow it's your lunch at the office.",
        modeloPt: 'O que estava na mesa ontem, agora num pote de plástico, e amanhã é seu almoço no trabalho.'
    }
];
