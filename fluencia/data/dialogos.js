/* =========================================================
   Role-play — o app faz o outro personagem, você responde
   FALANDO. Nada de escrever.

   Estrutura vinda do CTM: cenário real + objetivo claro +
   chunks obrigatórios. Você não "pratica inglês", você
   resolve uma situação usando inglês. A diferença muda tudo.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.dialogos = [

    {
        id: 'dl-cafe-conferencia',
        titulo: 'Puxar conversa numa conferência',
        nivel: 1,
        contexto: 'Fila do café num evento de tecnologia em Austin. Você não conhece ninguém.',
        seuPapel: 'Você, participante brasileiro',
        papelBot: 'Sam, engenheiro de uma startup local',
        objetivo: 'Sair da fila com o nome, a empresa e um assunto em comum. Não pedir desculpa pelo inglês nenhuma vez.',
        obrigatorios: ["I don't think we've met", 'What brings you here', 'Small world'],
        turnos: [
            { bot: "Man, this line is not moving. Have you been to this one before?", pt: 'Cara, essa fila não anda. Já veio nesse evento antes?', dica: 'Responda e devolva a pergunta. Nunca deixe a bola morrer.', modelo: "First time, actually. You?" },
            { bot: "Third year in a row. It's gotten way bigger. So what do you do?", pt: 'Terceiro ano seguido. Cresceu muito. E você, trabalha com o quê?', dica: 'Diga a função, não o cargo. Cargo ninguém entende.', modelo: "I run logistics for a food delivery company — basically I keep the trucks from crashing into each other." },
            { bot: "Ha! That sounds stressful. Are you here for the whole week?", pt: 'Haha! Parece estressante. Você fica a semana toda?', dica: 'Use uma reação antes de responder: "Kind of, yeah."', modelo: "Kind of, yeah — I fly back Saturday. How about you?" },
            { bot: "Same. Hey, are you going to the rooftop thing tonight?", pt: 'Igual. Você vai no evento do terraço hoje à noite?', dica: 'Aceite e proponha algo concreto — é assim que se faz um contato.', modelo: "I was thinking about it. Want to grab a seat together? I don't know a soul here." },
            { bot: "Sure, let's do it. I'm Sam, by the way.", pt: 'Claro, vamos. Eu sou o Sam, aliás.', dica: 'Feche o loop: nome + algo memorável sobre você.', modelo: "Rodrigo. Good to meet you, Sam — I'm the Brazilian guy who can't stop drinking your terrible coffee." }
        ],
        desafio: 'Refaça o diálogo inteiro sem repetir NENHUMA das suas respostas anteriores.'
    },

    {
        id: 'dl-restaurante',
        titulo: 'Restaurante com pedido errado',
        nivel: 1,
        contexto: 'Você pediu sem cebola por alergia. Veio com cebola.',
        seuPapel: 'Cliente',
        papelBot: 'Garçom',
        objetivo: 'Resolver o problema sendo firme e educado. Reclamar em inglês sem soar grosseiro é uma habilidade.',
        obrigatorios: ["I'm afraid", 'Would you mind', "It's not a big deal, but"],
        turnos: [
            { bot: "Hi there! How is everything tasting tonight?", pt: 'Oi! Como está a comida hoje?', dica: 'Não diga "is bad". Comece com o suavizador.', modelo: "Actually, I'm afraid there's been a small mix-up with my order." },
            { bot: "Oh no, I'm sorry — what happened?", pt: 'Nossa, desculpa — o que houve?', dica: 'Fato + consequência. Curto.', modelo: "I asked for it without onions — I'm allergic. This one has onions in it." },
            { bot: "I am so sorry. Let me get the kitchen to remake that right away.", pt: 'Sinto muitíssimo. Vou pedir para a cozinha refazer agora.', dica: 'Aceite sem drama e pergunte pelo tempo.', modelo: "No worries at all. Any idea how long that'll take? My friend's food is getting cold." },
            { bot: "Ten minutes, tops. And dessert's on the house tonight.", pt: 'Dez minutos, no máximo. E a sobremesa é por conta da casa.', dica: 'Agradeça de forma calorosa — encerre bem a interação.', modelo: "That's really kind of you, thank you. Honestly, no hard feelings — it happens." }
        ],
        desafio: 'Repita, mas agora o garçom discute com você. Mantenha a educação e a firmeza.'
    },

    {
        id: 'dl-standup',
        titulo: 'Daily stand-up com time gringo',
        nivel: 2,
        contexto: 'Reunião diária de 15 minutos. Todos falam rápido. É a sua vez.',
        seuPapel: 'Você',
        papelBot: 'Jess, tech lead',
        objetivo: 'Reportar em 30 segundos: ontem, hoje, bloqueio. Sem enrolação e sem sumir.',
        obrigatorios: ["I'm blocked on", "I'll follow up", 'Quick heads-up'],
        turnos: [
            { bot: "Morning everyone. Rodrigo, you want to go first?", pt: 'Bom dia. Rodrigo, quer começar?', dica: 'Aceite o turno com energia. Nada de "yes... hum...".', modelo: "Sure, I'll go. Quick one from me." },
            { bot: "Go for it.", pt: 'Manda.', dica: 'Estrutura: yesterday / today / blocker. Passado simples, não present perfect.', modelo: "Yesterday I finished the carrier integration and pushed it to staging. Today I'm writing the tests. One thing: I'm blocked on the API keys from the vendor." },
            { bot: "Who's chasing the vendor on that?", pt: 'Quem está atrás do fornecedor nisso?', dica: 'Assuma ou delegue, mas nunca fique vago.', modelo: "I emailed them Monday and haven't heard back. I'll follow up today, but if it drags past tomorrow, I might need you to escalate." },
            { bot: "Got it. Ping me tomorrow if it's still stuck. Anything else?", pt: 'Entendi. Me chama amanhã se ainda estiver travado. Mais alguma coisa?', dica: 'Encerre limpo. Não peça desculpas por nada.', modelo: "That's it from me. Thanks, Jess." }
        ],
        desafio: 'Cronometre: seu relato inteiro tem que caber em 30 segundos, falando devagar.'
    },

    {
        id: 'dl-entrevista',
        titulo: 'Entrevista de emprego — a pergunta difícil',
        nivel: 2,
        contexto: 'Última rodada. A recrutadora vai perguntar sobre um fracasso.',
        seuPapel: 'Candidato',
        papelBot: 'Karen, hiring manager',
        objetivo: 'Contar um fracasso real e o que aprendeu, sem se autodepreciar nem mentir.',
        obrigatorios: ['A good example of that would be', 'That taught me', 'In hindsight'],
        turnos: [
            { bot: "Tell me about a time something went really wrong on your watch.", pt: 'Me conte sobre uma vez em que algo deu muito errado sob sua responsabilidade.', dica: 'Situação em uma frase. Não comece explicando a empresa toda.', modelo: "A good example of that would be a launch we rushed in 2022. I signed off on it knowing the testing wasn't finished." },
            { bot: "What happened?", pt: 'O que aconteceu?', dica: 'Fatos concretos, números. Passado simples.', modelo: "We went live on a Friday, the payment flow broke, and about four hundred orders failed over the weekend." },
            { bot: "That's rough. How did you handle it?", pt: 'Que barra. Como você lidou?', dica: 'Ação sua, verbo forte, primeira pessoa.', modelo: "I called the team in on Saturday, we rolled back within three hours, and I personally called the twenty biggest customers to apologize." },
            { bot: "And what would you do differently now?", pt: 'E o que faria diferente hoje?', dica: 'Aprendizado que virou regra, não frase motivacional.', modelo: "In hindsight, the mistake wasn't the bug — it was shipping on a Friday with an unfinished checklist. That taught me to make the checklist a hard gate, not a suggestion. We haven't shipped on a Friday since." },
            { bot: "Good answer. Any questions for me?", pt: 'Boa resposta. Alguma pergunta para mim?', dica: 'Sempre tenha uma. Pergunte sobre sucesso ou sobre o time.', modelo: "Yes — what does success look like in this role after the first six months?" }
        ],
        desafio: 'Refaça contando um fracasso DIFERENTE, de verdade, da sua vida.'
    },

    {
        id: 'dl-vizinho',
        titulo: 'Vizinho americano puxando papo',
        nivel: 2,
        contexto: 'Você se mudou faz uma semana. O vizinho aparece no corredor.',
        seuPapel: 'Novo morador',
        papelBot: 'Dave, vizinho falante',
        objetivo: 'Sustentar cinco minutos de small talk sem morrer de vergonha. Small talk é esporte.',
        obrigatorios: ['How long have you', 'Tell me about it', 'I should let you go'],
        turnos: [
            { bot: "Hey neighbor! You just moved in, right? How's it going so far?", pt: 'E aí, vizinho! Acabou de se mudar, né? Como está indo?', dica: 'Responda com um detalhe, nunca só "fine".', modelo: "Yeah, last Tuesday. Still living out of boxes, honestly — I can't find my coffee maker anywhere." },
            { bot: "Ha, been there. Where'd you move from?", pt: 'Haha, já passei por isso. De onde você veio?', dica: 'Cidade + um contraste interessante = o outro tem onde puxar.', modelo: "São Paulo, Brazil. Twenty million people and no snow — this place is the exact opposite." },
            { bot: "Oh wow, Brazil! You must be freezing here.", pt: 'Uau, Brasil! Você deve estar congelando aqui.', dica: 'Brinque com você mesmo. Humor derrete a vergonha.', modelo: "Tell me about it. I own four coats now. In Brazil I owned zero." },
            { bot: "You'll get used to it. Hey, we do a block barbecue every second Saturday — you should come.", pt: 'Você se acostuma. A gente faz um churrasco no quarteirão todo segundo sábado — apareça.', dica: 'Aceite e ofereça algo. Reciprocidade constrói relação.', modelo: "I'd love that. And fair warning — if there's a barbecue, a Brazilian is going to have opinions about the meat." },
            { bot: "Ha! Bring those opinions. Anyway, I gotta run — good to meet you.", pt: 'Haha! Traga as opiniões. Enfim, tenho que correr — prazer.', dica: 'Feche com o nome dele e uma promessa concreta.', modelo: "Good to meet you too, Dave. I'll see you Saturday — and I'll bring the meat." }
        ],
        desafio: 'Grave-se sustentando dois minutos sozinho sobre "de onde eu venho".'
    },

    {
        id: 'dl-medico',
        titulo: 'Consulta médica no exterior',
        nivel: 2,
        contexto: 'Você acordou com dor forte no estômago em Chicago.',
        seuPapel: 'Paciente',
        papelBot: 'Dra. Patel',
        objetivo: 'Descrever sintoma, duração, intensidade e histórico — vocabulário que salva vida.',
        obrigatorios: ['It started', 'It comes and goes', "I'm allergic to"],
        turnos: [
            { bot: "So what brings you in today?", pt: 'O que te trouxe aqui hoje?', dica: 'Sintoma principal primeiro, em uma frase.', modelo: "I've had a sharp pain in my lower stomach since yesterday morning." },
            { bot: "Can you describe the pain? Sharp, dull, burning?", pt: 'Pode descrever a dor? Aguda, surda, ardida?', dica: 'Vocabulário exato importa mais que gramática aqui.', modelo: "Sharp, mostly. It comes and goes — worse when I press on it." },
            { bot: "Any fever, nausea, vomiting?", pt: 'Febre, náusea, vômito?', dica: 'Responda item por item, não um "yes" genérico.', modelo: "No fever. Some nausea last night, but I haven't thrown up." },
            { bot: "Any allergies or medications you're taking?", pt: 'Alguma alergia ou remédio em uso?', dica: 'Frase de emergência que você tem que saber dormindo.', modelo: "I'm allergic to penicillin. I take blood pressure medication — losartan, fifty milligrams." },
            { bot: "Okay. I'd like to run some tests before we decide anything.", pt: 'Certo. Quero fazer alguns exames antes de decidir.', dica: 'Pergunte sobre custo e prazo — direito seu.', modelo: "That's fine. Just so I know — will my travel insurance cover this, and how long will the results take?" }
        ],
        desafio: 'Refaça descrevendo uma dor diferente: cabeça, dente, costas.'
    },

    {
        id: 'dl-feedback',
        titulo: 'Dar feedback duro para um colega',
        nivel: 3,
        contexto: 'Um colega vem entregando tarde e o time está pagando o preço.',
        seuPapel: 'Colega sênior',
        papelBot: 'Tom, na defensiva',
        objetivo: 'Ser direto sem humilhar. Aguentar a defensiva sem recuar nem endurecer.',
        obrigatorios: ['I wanted to talk about', 'From where I stand', 'What would help'],
        turnos: [
            { bot: "Hey — you said you wanted to chat? Everything okay?", pt: 'Oi — disse que queria conversar? Tudo bem?', dica: 'Anuncie o assunto sem rodeio e sem ameaça.', modelo: "Yeah, all good. I wanted to talk about the last two sprints — specifically the deadlines." },
            { bot: "Look, I know they slipped, but that wasn't really on me.", pt: 'Olha, sei que atrasaram, mas não foi bem culpa minha.', dica: 'Não brigue pela culpa. Traga o efeito observável.', modelo: "I'm not looking for blame. From where I stand, the effect is that Ana and I picked up eleven hours of your work last week — and nobody told us until Friday." },
            { bot: "I would've said something if it were a real problem.", pt: 'Eu teria falado se fosse um problema de verdade.', dica: 'Concorde com a parte válida e mantenha o pedido.', modelo: "That's fair, and I'd rather hear it early than perfectly. Even a message on Wednesday saying 'this is slipping' changes everything for us." },
            { bot: "Okay. I hear you. Things have been rough at home, honestly.", pt: 'Ok. Te entendo. As coisas têm sido difíceis em casa, sinceramente.', dica: 'Acolha, mas não abandone o combinado.', modelo: "I'm sorry — that's a lot to carry. That doesn't change what we need, but it does change how we plan it. What would help right now?" },
            { bot: "Maybe if I could hand off the reporting piece for a month.", pt: 'Talvez se eu pudesse passar a parte de relatórios por um mês.', dica: 'Feche com acordo concreto: quem, o quê, quando.', modelo: "Let's do that. I'll take reporting through March, you flag anything slipping by Wednesday, and we check in in two weeks. Deal?" }
        ],
        desafio: 'Inverta: agora VOCÊ é quem está atrasando e recebe o feedback.'
    },

    {
        id: 'dl-pitch',
        titulo: 'Pitch de 90 segundos para investidor',
        nivel: 3,
        contexto: 'Elevador real. Você tem até o oitavo andar.',
        seuPapel: 'Fundador',
        papelBot: 'Investidora cética',
        objetivo: 'Problema, solução, tração, pedido. Sem jargão e sem gaguejar.',
        obrigatorios: ['The problem is', "Here's what we do", 'What I need from you'],
        turnos: [
            { bot: "You've got until the eighth floor. Go.", pt: 'Você tem até o oitavo andar. Manda.', dica: 'Problema em uma frase, com número.', modelo: "Small restaurants in Brazil throw away eighteen percent of what they buy — that's about nine thousand dollars a year, each." },
            { bot: "Okay, and you fix that how?", pt: 'Certo, e você resolve isso como?', dica: 'Solução concreta, sem buzzword.', modelo: "Here's what we do: we predict tomorrow's demand from their own sales history and tell them exactly what to order tonight. It's a WhatsApp message, not a dashboard." },
            { bot: "Everyone says AI these days. Why would they trust you?", pt: 'Todo mundo fala em IA hoje. Por que confiariam em você?', dica: 'Prova, não promessa: tração e retenção.', modelo: "Because it's already working. Four hundred restaurants, eleven months, average waste down eleven points. Ninety-one percent of them are still with us after six months." },
            { bot: "What do you want from me?", pt: 'O que você quer de mim?', dica: 'Pedido exato: valor, uso, prazo.', modelo: "What I need from you is eight hundred thousand for eighteen months — mostly sales hires — to go from four hundred restaurants to three thousand." },
            { bot: "Send me the deck. I'm on the tenth floor, by the way.", pt: 'Me manda o deck. Estou no décimo, aliás.', dica: 'Feche com próximo passo e prazo, sempre.', modelo: "It'll be in your inbox in ten minutes. I'll follow up Thursday if I don't hear back — is that okay?" }
        ],
        desafio: 'Faça o pitch do seu trabalho REAL em 90 segundos, gravando.'
    },

    {
        id: 'dl-conflito',
        titulo: 'Discordar do chefe na frente do time',
        nivel: 3,
        contexto: 'Seu chefe anunciou um prazo impossível na reunião.',
        seuPapel: 'Você',
        papelBot: 'Chefe',
        objetivo: 'Discordar publicamente sem virar confronto. Nível alto de pragmática.',
        obrigatorios: ['I want to push back on', 'Just so we go in with our eyes open', "What I'd suggest"],
        turnos: [
            { bot: "So, we're committing to the fifteenth. I've already told the client.", pt: 'Então, estamos assumindo o dia quinze. Já falei com o cliente.', dica: 'Peça o turno, não invada. Nomeie o desacordo.', modelo: "Can I push back on that for a second — not on the goal, on the date." },
            { bot: "We don't really have a choice here.", pt: 'Não temos muita escolha aqui.', dica: 'Não discuta a escolha; mostre o custo com dados.', modelo: "Understood. Just so we go in with our eyes open: the same scope took us five weeks last quarter, and we're one person down. The fifteenth means cutting the testing week." },
            { bot: "So what, we tell the client we can't do it?", pt: 'Então o quê, dizemos ao cliente que não conseguimos?', dica: 'Nunca só o problema — sempre a alternativa.', modelo: "No — what I'd suggest is we deliver the core flow on the fifteenth and the reporting module on the twenty-ninth. The client gets something real on the date they care about." },
            { bot: "Hm. That might actually fly. Can you write that up?", pt: 'Hm. Isso pode até colar. Pode escrever isso?', dica: 'Assuma com prazo. Ganhou a discussão? Feche rápido.', modelo: "I'll have a one-pager in your inbox by lunch. And thanks for hearing me out in front of everyone — I know that's not easy." }
        ],
        desafio: 'Refaça com o chefe hostil, que corta você duas vezes.'
    },

    {
        id: 'dl-imigracao',
        titulo: 'Imigração e alfândega',
        nivel: 1,
        contexto: 'Balcão de imigração nos EUA. O agente é seco e rápido.',
        seuPapel: 'Viajante',
        papelBot: 'Agente',
        objetivo: 'Respostas curtas, claras e sem hesitação. Aqui a hesitação custa caro.',
        obrigatorios: ['I am here for', 'I am staying at', 'I will be here for'],
        turnos: [
            { bot: "Purpose of your trip?", pt: 'Motivo da viagem?', dica: 'Uma frase. Sem história.', modelo: "Business — I'm attending a conference in Austin." },
            { bot: "How long are you staying?", pt: 'Quanto tempo vai ficar?', dica: 'Número + data de volta.', modelo: "Nine days. I fly back on the twenty-third." },
            { bot: "Where are you staying?", pt: 'Onde vai ficar?', dica: 'Nome do hotel e cidade, nada mais.', modelo: "At the Hilton downtown, in Austin." },
            { bot: "Are you bringing any food or agricultural products?", pt: 'Está trazendo comida ou produtos agrícolas?', dica: 'Se sim, declare. Mentir é o único erro grave.', modelo: "Just some coffee and a package of cheese bread — should I declare that?" },
            { bot: "Coffee's fine. Enjoy your stay.", pt: 'Café pode. Boa estadia.', dica: 'Agradeça e siga. Não puxe conversa.', modelo: "Thank you, have a good one." }
        ],
        desafio: 'Faça as cinco respostas em menos de 20 segundos no total.'
    },

    {
        id: 'dl-networking',
        titulo: 'Pedir ajuda para alguém que você admira',
        nivel: 3,
        contexto: 'Você encontrou por acaso alguém sênior da sua área.',
        seuPapel: 'Você',
        papelBot: 'Executiva ocupada e simpática',
        objetivo: 'Fazer um pedido específico e pequeno. Pedido vago não é atendido.',
        obrigatorios: ['I know you are busy', 'Would you be open to', 'No pressure at all'],
        turnos: [
            { bot: "Sorry, do I know you? You look familiar.", pt: 'Desculpa, eu te conheço? Você me parece familiar.', dica: 'Contexto em uma frase e um elogio específico, não genérico.', modelo: "We haven't met — I'm Rodrigo. I read your piece on last-mile costs twice, and I've been quoting the part about return trips ever since." },
            { bot: "Oh, thank you! That one took forever to write.", pt: 'Ah, obrigada! Aquele demorou uma eternidade.', dica: 'Reaja e faça a ponte para o seu pedido.', modelo: "It shows, in a good way. I'm working on the same problem from the operator side, and I keep hitting a wall you seem to have solved." },
            { bot: "Which wall?", pt: 'Qual parede?', dica: 'Seja técnico e específico — mostra que você fez a lição.', modelo: "Pricing the return leg when the truck comes back empty. Everything I try ends up penalizing the drivers." },
            { bot: "That's the hard one. There's no clean answer, honestly.", pt: 'Essa é a difícil. Não existe resposta limpa, sinceramente.', dica: 'Agora o pedido: pequeno, com prazo e saída fácil.', modelo: "I know you're busy — would you be open to twenty minutes on a call, sometime in the next month? No pressure at all if it's not a good time." },
            { bot: "Send me an email with three specific questions and I'll do it.", pt: 'Me manda um e-mail com três perguntas específicas e eu topo.', dica: 'Confirme os termos exatos, para ela não ter que repetir.', modelo: "Three specific questions, no essay. It'll be in your inbox tonight. Thank you — really." }
        ],
        desafio: 'Escreva e grave o mesmo pedido para alguém real da sua área.'
    },

    {
        id: 'dl-fofoca',
        titulo: 'Conversa de bar, rápida e cheia de gíria',
        nivel: 3,
        contexto: 'Sexta à noite, três amigos, música alta. Velocidade real.',
        seuPapel: 'Você',
        papelBot: 'Amigo americano',
        objetivo: 'Acompanhar o ritmo, entrar na piada, não pedir para repetir a cada frase.',
        obrigatorios: ['No way', 'I mean', "That's on him"],
        turnos: [
            { bot: "Dude, did you hear what happened with Marcus and the promotion?", pt: 'Cara, ficou sabendo do Marcus e da promoção?', dica: 'Reaja primeiro, pergunte depois. Sempre nessa ordem.', modelo: "No way — what happened?" },
            { bot: "He turned it down. Straight up said no in the meeting.", pt: 'Ele recusou. Disse não na cara, na reunião.', dica: 'Reaja com surpresa e traga um julgamento leve.', modelo: "You're kidding. In front of everyone? That takes guts." },
            { bot: "Right? Everybody was just sitting there. I mean, who does that?", pt: 'Né? Todo mundo ficou parado. Quer dizer, quem faz isso?', dica: 'Ofereça a leitura alternativa — é assim que a conversa anda.', modelo: "I mean, honestly? Maybe he saw what that job did to Ana last year." },
            { bot: "Huh. I didn't think about that. Still, he could've handled it better.", pt: 'Hm. Não tinha pensado nisso. Mesmo assim, podia ter lidado melhor.', dica: 'Concorde parcialmente com gíria natural.', modelo: "Yeah, that's on him. There's a difference between saying no and blowing it up." },
            { bot: "Exactly. Anyway — another round?", pt: 'Exato. Enfim — mais uma rodada?', dica: 'Feche leve.', modelo: "I'm down. This one's on me." }
        ],
        desafio: 'Rode este diálogo com a velocidade no máximo. Sem legenda.'
    }
];
