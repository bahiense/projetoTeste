/* =========================================================
   Ditado — segunda parte.

   Mais fala conectada, e agora em situações inteiras: recado
   de voz, direção na rua, jogo narrado, entrevista. Quanto
   mais longo o trecho, mais o ouvido precisa segurar o que
   ouviu enquanto o resto continua chegando.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.ditado = F.data.ditado.concat([

    {
        id: 'dt-recado',
        titulo: 'Recado de voz no trabalho',
        nivel: 2,
        foco: 'nome, número e motivo, tudo rápido e sem repetição',
        itens: [
            { en: "Hi, this is Karen from accounting, just following up on that invoice.", soa: 'Hi, thisiz Karen frm accounting, jus following upon thad invoice.' },
            { en: "Give me a call back when you get a chance.", soa: 'Gimme a call back whenya gedda chance.' },
            { en: "My extension is four one two.", soa: 'My extenshniz four one two.' },
            { en: "It's not urgent, but I'd like to sort it out this week.", soa: "Its nod urgent, budai'd like ta sordidout this week." },
            { en: "If I don't pick up, just leave a message.", soa: "If I don pickup, jus leava message." },
            { en: "Thanks a lot — talk to you soon.", soa: 'Thanksa lot — talk ta ya soon.' }
        ]
    },

    {
        id: 'dt-direcoes',
        titulo: 'Direções na rua',
        nivel: 1,
        foco: 'preposições de lugar coladas nas palavras seguintes',
        itens: [
            { en: "Go straight down this street for about two blocks.", soa: 'Go straight down this street fer abaout two blocks.' },
            { en: "Then take a left at the traffic light.", soa: 'Then takea leftat the traffic light.' },
            { en: "It's on your right, across from the bank.", soa: 'Itson yer right, acrossfrm the bank.' },
            { en: "You can't miss it.", soa: "You cant missit." },
            { en: "If you get to the bridge, you've gone too far.", soa: "Ifya get to the bridge, youve gone too far." },
            { en: "It's about a ten minute walk from here.", soa: 'Itsabouda ten minit walk frm here.' }
        ]
    },

    {
        id: 'dt-entrevista-escuta',
        titulo: 'Perguntas de entrevista em velocidade real',
        nivel: 2,
        foco: 'perguntas longas ditas de uma vez só',
        itens: [
            { en: "Tell me a little bit about what you're doing right now.", soa: "Tell me a liddle bidabout whatcher doing right now." },
            { en: "What would you say is your biggest strength?", soa: 'Whad wudja say iz yer biggest strength?' },
            { en: "Can you walk me through a project you're proud of?", soa: "Canya walk me through a project yer proud of?" },
            { en: "How do you deal with a deadline you can't meet?", soa: "How dya deal witha deadline ya cant meet?" },
            { en: "Is there anything you'd like to ask us?", soa: "Iz there anything you'd like ta askus?" },
            { en: "We'll be in touch by the end of next week.", soa: "Wull be in touch by the enduv next week." }
        ]
    },

    {
        id: 'dt-cotidiano',
        titulo: 'Casa, família e fim de semana',
        nivel: 1,
        foco: 'a conversa mais comum do mundo, na velocidade dela',
        itens: [
            { en: "What did you get up to over the weekend?", soa: 'Whadja gedup to over the weekend?' },
            { en: "Not much — we just stayed in and watched a movie.", soa: 'Nod much — we jus stayedin an watcheda movie.' },
            { en: "The kids have been driving me crazy all week.", soa: 'The kids av bin driving me crazy all week.' },
            { en: "I've got to pick them up at four.", soa: "I've godda pickem up at four." },
            { en: "Do you want to come over for dinner on Saturday?", soa: 'Dya wanna come over fer dinner on Saturday?' },
            { en: "I'll let you know later, is that all right?", soa: "Al letcha know lader, izzat awright?" }
        ]
    },

    {
        id: 'dt-jogo',
        titulo: 'Jogo narrado',
        nivel: 3,
        foco: 'velocidade de locutor, sem pausa entre frases',
        itens: [
            { en: "He takes it down the left side, cuts inside, and shoots!", soa: 'He takesit down the left side, cudsinside, an shoots!' },
            { en: "Off the post — and it stays out!", soa: 'Offthe post — andit stays out!' },
            { en: "That's the third chance they've wasted in ten minutes.", soa: "Thatsthe third chance theyv wasted in ten minits." },
            { en: "There's five minutes left plus stoppage time.", soa: 'Thers five minits left plus stoppage time.' },
            { en: "The keeper had absolutely no chance on that one.", soa: 'The keeper had absolutely no chance onnat one.' },
            { en: "What a way to finish the game.", soa: 'Whadda way ta finish the game.' }
        ]
    },

    {
        id: 'dt-britanico',
        titulo: 'Britânico do dia a dia',
        nivel: 3,
        foco: 'o R que some, o T que não vira R e o vocabulário próprio',
        itens: [
            { en: "Sorry, I can't hear you — it's rather noisy in here.", soa: 'Sorry, I kahnt hear you — its rahther noisy in here.', nota: '"can\'t" britânico soa "kahnt", com A longo.' },
            { en: "Shall we pop out for a coffee?", soa: 'Shal we popout fora coffee?', nota: '"Shall we" é britânico corrente; nos EUA soaria antiquado.' },
            { en: "It's a bit of a faff, to be honest.", soa: 'Itsa bidova faff, ta be onest.', nota: '"faff" = trabalheira chata.' },
            { en: "I'll ring you in the morning.", soa: 'Al ring you inthe morning.', nota: 'No britânico se "ring", no americano se "call".' },
            { en: "That's brilliant, cheers.", soa: 'Thats brilliant, cheers.', nota: '"Cheers" também significa obrigado.' },
            { en: "We're queuing outside the lift.", soa: 'Wer kyoo-ing outside the lift.', nota: 'queue = fila, lift = elevador.' }
        ]
    },

    {
        id: 'dt-negocios-escuta',
        titulo: 'Reunião difícil, ouvida de fora',
        nivel: 3,
        foco: 'frases longas com subordinação e suavizadores',
        itens: [
            { en: "I hear what you're saying, but the numbers tell a different story.", soa: "I hear whatcher saying, butthe numbers tella diffrent story." },
            { en: "What I'd rather do is take a week and come back with options.", soa: "Whadai'd rather do iz takea week an come back with options." },
            { en: "There's no version of this where we hit the original date.", soa: 'Thersno version of this where we hit the original date.' },
            { en: "Let's be honest about what we can actually deliver.", soa: 'Letsbe onest about what we can akshully deliver.' },
            { en: "I don't want to be the one to say it, but somebody has to.", soa: "I don wanna be the one ta sayit, but sumbody hasta." },
            { en: "Can we agree to disagree and move on?", soa: 'Canwe agree ta disagree an moovon?' }
        ]
    },

    {
        id: 'dt-medico-escuta',
        titulo: 'Consultório e farmácia',
        nivel: 2,
        foco: 'instruções que não podem ser entendidas pela metade',
        itens: [
            { en: "Take one tablet twice a day with food.", soa: 'Take one tablet twicea day with food.' },
            { en: "If it doesn't improve in three days, come back.", soa: "Ifit duzn improve in three days, come back." },
            { en: "Any allergies I should know about?", soa: 'Eny allergiez I shud know about?' },
            { en: "We'll need to run a couple of tests.", soa: 'Wull need ta runa cupplav tests.' },
            { en: "The results should be back by Thursday.", soa: 'The results shud be back by Thurzday.' },
            { en: "Don't take it on an empty stomach.", soa: 'Don takidon an empty stomach.' }
        ]
    },

    {
        id: 'dt-noticia-2',
        titulo: 'Notícia de rádio',
        nivel: 3,
        foco: 'informação densa, sem redundância',
        itens: [
            { en: "Officials say the measure will take effect immediately.", soa: 'Officials say the mezher wil take effect immediately.' },
            { en: "The company declined to comment on the report.", soa: 'The company declined ta commenton the report.' },
            { en: "Prices rose for the fourth month in a row.", soa: 'Prices rose fer the forth month ina row.' },
            { en: "Residents were told to stay indoors until further notice.", soa: 'Residents wer told ta stay indoors until further notice.' },
            { en: "Negotiations are expected to resume on Monday.", soa: 'Negoshiations ar expected ta rezoom on Munday.' },
            { en: "We'll have more on that story after the break.", soa: 'Wull have more onnat story after the break.' }
        ]
    },

    {
        id: 'dt-aeroporto-escuta',
        titulo: 'Anúncios de aeroporto',
        nivel: 2,
        foco: 'voz distorcida, informação crítica',
        itens: [
            { en: "Flight two four seven to Chicago is now boarding at gate twelve.", soa: 'Flight two four seven ta Chicago iznow boarding at gate twelve.' },
            { en: "Passengers with small children may board first.", soa: 'Passenjerz with small children may board first.' },
            { en: "The gate has been changed to B fourteen.", soa: 'The gate azbin changed ta B forteen.' },
            { en: "Final call for passenger Silva.", soa: 'Final call fer passenjer Silva.' },
            { en: "Please keep your belongings with you at all times.", soa: 'Pleez keep yer belongings withyou at all times.' },
            { en: "We apologize for the delay in departure.", soa: 'We apolojize fer the delay in departure.' }
        ]
    },

    {
        id: 'dt-conversa-rapida',
        titulo: 'Duas pessoas falando ao mesmo tempo',
        nivel: 3,
        foco: 'o caso mais difícil: turnos curtos, colados, com interrupção',
        itens: [
            { en: "Wait, hold on — that's not what she said.", soa: 'Wait, hold on — thats nod what she sed.' },
            { en: "No, I know, but that's exactly my point.", soa: 'No, I know, but thats exactly my point.' },
            { en: "Right, right — no, yeah, totally.", soa: 'Right, right — no, yeah, todally.', nota: '"No, yeah" significa sim. "Yeah, no" significa não. Sério.' },
            { en: "Can I just finish what I was saying?", soa: 'Cannai jus finish what I wuz saying?' },
            { en: "Sorry, go ahead — you first.", soa: 'Sorry, go ahead — you first.' },
            { en: "Anyway, where were we?", soa: 'Enyway, where wer we?' }
        ]
    },

    {
        id: 'dt-palestra',
        titulo: 'Palestra técnica',
        nivel: 3,
        foco: 'termos longos dentro de frases longas',
        itens: [
            { en: "What we're looking at here is a fundamental shift in how the system behaves.", soa: "What wer looking at here iza fundamental shiftin how the system behaves." },
            { en: "I want to be careful not to overstate the findings.", soa: 'I wanna be careful nod ta overstate the findings.' },
            { en: "The mechanism itself is fairly straightforward.", soa: 'The mechanism itselfiz fairly straightforward.' },
            { en: "There are three variables that matter most.", soa: 'Ther ar three variables that madder most.' },
            { en: "This is where most implementations go wrong.", soa: 'Thisiz where most implementations go wrong.' },
            { en: "I'm happy to go deeper on that in the Q and A.", soa: "I'm happy ta go deeper onnat inthe Q an A." }
        ]
    }
]);
