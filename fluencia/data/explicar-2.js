/* =========================================================
   Explicar sem a palavra — parte 2.

   Aqui a coisa fica abstrata: sentimento, ideia, situação sem
   objeto. É onde o intermediário some, porque não dá para
   apontar. É também onde o quase-nativo aparece.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.explicar = (F.data.explicar || []).concat([

    /* ---------- nível 3: abstratos e sentimentos ---------- */
    {
        palavra: 'homesick', pt: 'com saudade de casa', nivel: 3,
        proibidas: ['home', 'miss', 'sad', 'family'],
        ajudam: ['far', 'months', 'abroad', 'food', 'mother', 'call', 'feeling'],
        modelo: "You've been abroad for six months, everything is fine, and still there's a feeling in your chest every time your mother calls.",
        modeloPt: 'Você está fora há seis meses, está tudo bem, e mesmo assim dá um aperto no peito toda vez que sua mãe liga.'
    },
    {
        palavra: 'jealous', pt: 'com ciúme / com inveja', nivel: 3,
        proibidas: ['envy', 'jealous', 'want', 'angry'],
        ajudam: ['friend', 'promotion', 'happy', 'should', 'feel', 'ugly', 'admit'],
        modelo: "Your friend gets the promotion, you should be happy for him, and instead you feel something ugly that you would never admit out loud.",
        modeloPt: 'Seu amigo é promovido, você devia ficar feliz por ele, e em vez disso sente algo feio que nunca admitiria em voz alta.'
    },
    {
        palavra: 'embarrassed', pt: 'envergonhado', nivel: 3,
        proibidas: ['shame', 'shy', 'red', 'embarrass'],
        ajudam: ['everyone', 'watching', 'face', 'hot', 'wrong', 'name', 'disappear'],
        modelo: "You call your boss by the wrong name in front of the whole room, your face goes hot, and you want to disappear.",
        modeloPt: 'Você chama o chefe pelo nome errado na frente da sala toda, o rosto esquenta, e você quer sumir.'
    },
    {
        palavra: 'relieved', pt: 'aliviado', nivel: 3,
        proibidas: ['relief', 'happy', 'better', 'calm'],
        ajudam: ['worried', 'test', 'result', 'fine', 'breathe', 'week', 'finally'],
        modelo: "You were worried for a whole week about the test, then the doctor says everything is fine, and you can breathe again.",
        modeloPt: 'Você ficou preocupado a semana toda com o exame, aí o médico diz que está tudo bem, e você volta a respirar.'
    },
    {
        palavra: 'overwhelmed', pt: 'sobrecarregado', nivel: 3,
        proibidas: ['stress', 'tired', 'busy', 'much'],
        ajudam: ['everything', 'once', 'start', 'cannot', 'list', 'week', 'freeze'],
        modelo: "Twelve things need you at the same time, and instead of starting one you just sit there and do nothing at all.",
        modeloPt: 'Doze coisas precisam de você ao mesmo tempo, e em vez de começar uma, você fica sentado sem fazer nada.'
    },
    {
        palavra: 'stubborn', pt: 'teimoso', nivel: 3,
        proibidas: ['change', 'mind', 'insist', 'hard'],
        ajudam: ['wrong', 'admit', 'never', 'father', 'argue', 'always', 'right'],
        modelo: "Everybody can see he is wrong, you show him twice, and he still says the same thing an hour later.",
        modeloPt: 'Todo mundo vê que ele está errado, você mostra duas vezes, e uma hora depois ele diz a mesma coisa.'
    },
    {
        palavra: 'patience', pt: 'paciência', nivel: 3,
        proibidas: ['wait', 'calm', 'patient', 'time'],
        ajudam: ['queue', 'bank', 'hour', 'still', 'quiet', 'children', 'need'],
        modelo: "You need a lot of this at the bank, with two small children, when the line has not moved in an hour.",
        modeloPt: 'Você precisa muito disso no banco, com duas crianças pequenas, quando a fila não anda há uma hora.'
    },
    {
        palavra: 'luck', pt: 'sorte', nivel: 3,
        proibidas: ['lucky', 'chance', 'fortune', 'random'],
        ajudam: ['nothing', 'deserve', 'happen', 'right', 'moment', 'ticket', 'earn'],
        modelo: "You did nothing to deserve it and you did not earn it — you were simply in the right place at the right moment.",
        modeloPt: 'Você não fez nada para merecer e não conquistou — simplesmente estava no lugar certo na hora certa.'
    },
    {
        palavra: 'habit', pt: 'hábito', nivel: 3,
        proibidas: ['every day', 'routine', 'usually', 'always'],
        ajudam: ['coffee', 'without', 'thinking', 'years', 'break', 'hard', 'morning'],
        modelo: "You do it at the same hour without thinking about it, you've done it for years, and it's very hard to break.",
        modeloPt: 'Você faz na mesma hora sem pensar, faz há anos, e é muito difícil largar.'
    },
    {
        palavra: 'excuse', pt: 'desculpa (justificativa)', nivel: 3,
        proibidas: ['sorry', 'reason', 'explain', 'lie'],
        ajudam: ['late', 'traffic', 'boss', 'again', 'believe', 'story', 'invent'],
        modelo: "You are late for the third time this week, so you invent a story about the traffic and hope your boss believes it.",
        modeloPt: 'Você chega atrasado pela terceira vez na semana, então inventa uma história de trânsito e torce pro chefe acreditar.'
    },
    {
        palavra: 'deal', pt: 'acordo / negócio', nivel: 3,
        proibidas: ['agreement', 'business', 'contract', 'sign'],
        ajudam: ['both', 'sides', 'hands', 'price', 'accept', 'meeting', 'happy'],
        modelo: "Both sides talk for two hours, they finally accept the same price, and they shake hands on it.",
        modeloPt: 'Os dois lados conversam duas horas, finalmente aceitam o mesmo preço, e apertam as mãos.'
    },
    {
        palavra: 'deadline pressure', pt: 'pressão do prazo', nivel: 3,
        proibidas: ['deadline', 'stress', 'time', 'work'],
        ajudam: ['friday', 'night', 'nobody', 'sleep', 'client', 'promised', 'coffee'],
        modelo: "It's Thursday night, the client is waiting, nobody in the team is sleeping, and there is far too much coffee on the table.",
        modeloPt: 'É quinta à noite, o cliente esperando, ninguém do time dormindo, e café demais na mesa.'
    },
    {
        palavra: 'misunderstanding', pt: 'mal-entendido', nivel: 3,
        proibidas: ['understand', 'confusion', 'wrong', 'mistake'],
        ajudam: ['said', 'heard', 'different', 'both', 'angry', 'week', 'clear'],
        modelo: "He said one thing, she heard another, and they were angry with each other for a week over something that never happened.",
        modeloPt: 'Ele disse uma coisa, ela ouviu outra, e ficaram bravos uma semana por algo que nunca aconteceu.'
    },
    {
        palavra: 'to warn', pt: 'avisar (alertar)', nivel: 3,
        proibidas: ['warn', 'tell', 'danger', 'careful'],
        ajudam: ['before', 'happen', 'told', 'ignore', 'later', 'bad', 'idea'],
        modelo: "You say it out loud before it happens — that this is a bad idea — they ignore you, and two months later you are proved right.",
        modeloPt: 'Você diz em voz alta antes de acontecer que é má ideia, a pessoa ignora, e dois meses depois você estava certo.'
    },
    {
        palavra: 'to be broke', pt: 'estar duro / sem dinheiro', nivel: 3,
        proibidas: ['money', 'poor', 'cash', 'broke'],
        ajudam: ['end', 'month', 'card', 'rice', 'friends', 'stay', 'home'],
        modelo: "It's the twenty-eighth of the month, your card says no, and you tell your friends you'd rather stay home tonight.",
        modeloPt: 'É dia 28, o cartão recusa, e você diz aos amigos que prefere ficar em casa hoje.'
    },
    {
        palavra: 'to be worth it', pt: 'valer a pena', nivel: 3,
        proibidas: ['worth', 'value', 'price', 'good'],
        ajudam: ['expensive', 'still', 'again', 'tired', 'end', 'result', 'happy'],
        modelo: "It cost a lot and it was exhausting, but looking back you would do exactly the same thing again.",
        modeloPt: 'Custou caro e foi cansativo, mas olhando para trás você faria exatamente a mesma coisa de novo.'
    },
    {
        palavra: 'to make up your mind', pt: 'se decidir', nivel: 3,
        proibidas: ['decide', 'decision', 'choose', 'mind'],
        ajudam: ['finally', 'two', 'options', 'weeks', 'sure', 'now', 'stop'],
        modelo: "For two weeks you went back and forth between the two options, and this morning you finally know which one it is.",
        modeloPt: 'Por duas semanas você ficou indo e voltando entre as duas opções, e hoje de manhã você finalmente sabe qual é.'
    },
    {
        palavra: 'small talk', pt: 'conversa fiada', nivel: 3,
        proibidas: ['talk', 'conversation', 'chat', 'weather'],
        ajudam: ['elevator', 'stranger', 'nothing', 'important', 'polite', 'minute', 'silence'],
        modelo: "Two strangers in an elevator, sixty seconds to fill, and nothing important is being said by anyone.",
        modeloPt: 'Dois estranhos no elevador, sessenta segundos para preencher, e ninguém diz nada de importante.'
    },
    {
        palavra: 'burnout', pt: 'esgotamento', nivel: 3,
        proibidas: ['tired', 'stress', 'work', 'rest'],
        ajudam: ['months', 'nothing', 'care', 'sunday', 'empty', 'doctor', 'stop'],
        modelo: "After eighteen months without stopping, you wake up on Sunday feeling empty and you simply do not care about anything.",
        modeloPt: 'Depois de dezoito meses sem parar, você acorda no domingo se sentindo vazio e simplesmente não se importa com nada.'
    },
    {
        palavra: 'peer pressure', pt: 'pressão do grupo', nivel: 3,
        proibidas: ['friends', 'force', 'group', 'pressure'],
        ajudam: ['everyone', 'else', 'doing', 'teenager', 'want', 'stupid', 'because'],
        modelo: "A teenager does something stupid not because he wants to, but because everyone else around him is doing it.",
        modeloPt: 'Um adolescente faz uma besteira não porque quer, mas porque todo mundo em volta está fazendo.'
    },

    /* ---------- nível 4: cultura, trabalho, ideias difíceis ---------- */
    {
        palavra: 'saudade', pt: 'saudade (não tem palavra em inglês)', nivel: 4,
        proibidas: ['miss', 'nostalgia', 'sad', 'longing'],
        ajudam: ['portuguese', 'word', 'english', 'feeling', 'someone', 'gone', 'good'],
        modelo: "There is no single English word for it: it's the feeling you have for someone who is gone, and it hurts and it's sweet at the same time.",
        modeloPt: 'Não existe uma palavra em inglês: é o sentimento por alguém que se foi, que dói e é doce ao mesmo tempo.'
    },
    {
        palavra: 'jeitinho', pt: 'jeitinho brasileiro', nivel: 4,
        proibidas: ['brazilian', 'way', 'trick', 'corruption'],
        ajudam: ['rule', 'around', 'solve', 'friend', 'quick', 'system', 'small'],
        modelo: "Something is impossible by the rules, so someone finds a small path around the system and it gets solved in ten minutes.",
        modeloPt: 'Algo é impossível pelas regras, então alguém acha um caminho pequeno em volta do sistema e resolve em dez minutos.'
    },
    {
        palavra: 'micromanager', pt: 'chefe que controla tudo', nivel: 4,
        proibidas: ['boss', 'control', 'manage', 'detail'],
        ajudam: ['every', 'email', 'copy', 'trust', 'ask', 'hour', 'terrible'],
        modelo: "He wants to be copied on every single email and asks how it's going every hour — he doesn't trust anyone to do the job.",
        modeloPt: 'Ele quer cópia de todo e-mail e pergunta como está indo de hora em hora — não confia em ninguém para fazer o trabalho.'
    },
    {
        palavra: 'to delegate', pt: 'delegar', nivel: 4,
        proibidas: ['give', 'task', 'someone else', 'team'],
        ajudam: ['stop', 'yourself', 'trust', 'time', 'grow', 'let', 'others'],
        modelo: "You stop doing everything yourself and let other hands take part of it, because otherwise the company never grows.",
        modeloPt: 'Você para de fazer tudo sozinho e deixa outras mãos assumirem parte, porque senão a empresa nunca cresce.'
    },
    {
        palavra: 'turnover', pt: 'rotatividade de pessoal', nivel: 4,
        proibidas: ['people', 'leave', 'employees', 'company'],
        ajudam: ['new', 'faces', 'month', 'train', 'again', 'expensive', 'problem'],
        modelo: "Every month there are new faces in the same chairs, and you spend your life training somebody who leaves in June.",
        modeloPt: 'Todo mês tem cara nova nas mesmas cadeiras, e você passa a vida treinando alguém que vai embora em junho.'
    },
    {
        palavra: 'bottleneck', pt: 'gargalo', nivel: 4,
        proibidas: ['slow', 'problem', 'stop', 'block'],
        ajudam: ['everything', 'waits', 'one', 'person', 'approve', 'week', 'line'],
        modelo: "Everything in the process waits for one single person to approve it, so the whole thing takes a week instead of a day.",
        modeloPt: 'Tudo no processo espera uma única pessoa aprovar, então a coisa toda leva uma semana em vez de um dia.'
    },
    {
        palavra: 'to be on the same page', pt: 'estar alinhado', nivel: 4,
        proibidas: ['agree', 'same', 'understand', 'page'],
        ajudam: ['meeting', 'before', 'everyone', 'clear', 'expect', 'start', 'confusion'],
        modelo: "Before you start, you have a short meeting so that nobody expects something different, and there is no confusion later.",
        modeloPt: 'Antes de começar, você faz uma reunião curta para que ninguém espere coisa diferente, e não haja confusão depois.'
    },
    {
        palavra: 'trade-off', pt: 'troca (perde-ganha)', nivel: 4,
        proibidas: ['choose', 'exchange', 'both', 'better'],
        ajudam: ['faster', 'expensive', 'cannot', 'have', 'lose', 'gain', 'decide'],
        modelo: "You can have it faster or you can have it cheap, but you cannot have the two together — one always costs the other.",
        modeloPt: 'Você pode ter rápido ou barato, mas não os dois juntos — um sempre custa o outro.'
    },
    {
        palavra: 'deadline extension', pt: 'prorrogação de prazo', nivel: 4,
        proibidas: ['deadline', 'more time', 'delay', 'extend'],
        ajudam: ['ask', 'client', 'friday', 'next', 'week', 'instead', 'agreed'],
        modelo: "You ask the client to accept it next Friday instead of this one, and he agrees — with a face.",
        modeloPt: 'Você pede ao cliente para aceitar na sexta que vem em vez desta, e ele concorda — com uma cara.'
    },
    {
        palavra: 'to break even', pt: 'empatar (nem lucro nem prejuízo)', nivel: 4,
        proibidas: ['profit', 'loss', 'money', 'zero'],
        ajudam: ['spent', 'earned', 'same', 'end', 'year', 'exactly', 'business'],
        modelo: "At the end of the year the business earned exactly what it spent — you did not gain and you did not lose.",
        modeloPt: 'No fim do ano o negócio ganhou exatamente o que gastou — você não lucrou e não perdeu.'
    },
    {
        palavra: 'red tape', pt: 'burocracia', nivel: 4,
        proibidas: ['bureaucracy', 'papers', 'government', 'slow'],
        ajudam: ['stamps', 'offices', 'form', 'again', 'months', 'simple', 'sign'],
        modelo: "To do one simple thing you need four forms, three signatures and two visits to different offices — and it takes months.",
        modeloPt: 'Para fazer uma coisa simples você precisa de quatro formulários, três assinaturas e duas idas a repartições — e leva meses.'
    },
    {
        palavra: 'to network', pt: 'fazer contatos profissionais', nivel: 4,
        proibidas: ['people', 'meet', 'contacts', 'friends'],
        ajudam: ['event', 'card', 'linkedin', 'later', 'job', 'talk', 'useful'],
        modelo: "You go to an event, you talk to twenty strangers, you take their cards — and two years later one of them gives you a job.",
        modeloPt: 'Você vai a um evento, fala com vinte desconhecidos, pega os cartões — e dois anos depois um deles te dá um emprego.'
    },
    {
        palavra: 'gut feeling', pt: 'intuição', nivel: 4,
        proibidas: ['feel', 'instinct', 'stomach', 'intuition'],
        ajudam: ['no', 'reason', 'explain', 'know', 'right', 'decision', 'wrong'],
        modelo: "You cannot explain it and you have no data, but something inside tells you this decision is wrong — and it usually is.",
        modeloPt: 'Você não consegue explicar e não tem dados, mas algo por dentro diz que essa decisão está errada — e normalmente está.'
    },
    {
        palavra: 'to sugarcoat', pt: 'dourar a pílula', nivel: 4,
        proibidas: ['sweet', 'soft', 'nice', 'truth'],
        ajudam: ['bad', 'news', 'gently', 'direct', 'say', 'hurt', 'straight'],
        modelo: "The news is bad, so instead of saying it straight you wrap it in three compliments first.",
        modeloPt: 'A notícia é ruim, então em vez de dizer direto você embrulha em três elogios antes.'
    },
    {
        palavra: 'to keep someone posted', pt: 'manter informado', nivel: 4,
        proibidas: ['inform', 'tell', 'news', 'update'],
        ajudam: ['message', 'anything', 'happens', 'know', 'first', 'send', 'week'],
        modelo: "Nothing has happened yet, but you promise you'll send a message the moment anything changes.",
        modeloPt: 'Nada aconteceu ainda, mas você promete mandar uma mensagem no momento em que algo mudar.'
    },
    {
        palavra: 'to lose your temper', pt: 'perder a paciência', nivel: 4,
        proibidas: ['angry', 'temper', 'shout', 'mad'],
        ajudam: ['third', 'time', 'suddenly', 'voice', 'meeting', 'regret', 'everyone'],
        modelo: "It was the third time in the meeting, and suddenly your voice was much louder than you wanted — everybody went quiet.",
        modeloPt: 'Foi a terceira vez na reunião, e de repente sua voz saiu muito mais alta do que você queria — todos ficaram quietos.'
    },
    {
        palavra: 'to be in over your head', pt: 'estar além da sua conta', nivel: 4,
        proibidas: ['difficult', 'hard', 'head', 'help'],
        ajudam: ['accept', 'project', 'thought', 'could', 'week', 'realize', 'ask'],
        modelo: "You accepted the project thinking you could do it, and by the second week you realize it's much bigger than you are.",
        modeloPt: 'Você aceitou o projeto achando que daria conta, e na segunda semana percebe que é muito maior do que você.'
    },
    {
        palavra: 'second-guess', pt: 'ficar duvidando da própria decisão', nivel: 4,
        proibidas: ['doubt', 'decision', 'guess', 'sure'],
        ajudam: ['already', 'chose', 'night', 'again', 'right', 'thinking', 'stop'],
        modelo: "You already chose, it's done, and still you lie awake at night going through the other option again and again.",
        modeloPt: 'Você já escolheu, está feito, e mesmo assim passa a noite acordado revendo a outra opção de novo e de novo.'
    },
    {
        palavra: 'to cut corners', pt: 'fazer nas coxas', nivel: 4,
        proibidas: ['fast', 'cheap', 'bad', 'corner'],
        ajudam: ['skip', 'steps', 'save', 'quality', 'later', 'pay', 'test'],
        modelo: "To finish sooner you skip two steps that nobody sees — and six months later you pay for it twice.",
        modeloPt: 'Para terminar antes você pula duas etapas que ninguém vê — e seis meses depois paga em dobro.'
    },
    {
        palavra: 'to have a point', pt: 'ter razão (num argumento)', nivel: 4,
        proibidas: ['right', 'agree', 'point', 'correct'],
        ajudam: ['argue', 'disagree', 'still', 'admit', 'thinking', 'said', 'true'],
        modelo: "You were arguing against him for an hour, and then you stop and admit that what he said is actually true.",
        modeloPt: 'Você discutiu contra ele por uma hora, aí para e admite que o que ele disse é verdade.'
    }
]);
