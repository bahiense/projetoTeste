/* =========================================================
   Role-play — parte 3.

   O currículo tem 48 semanas e uma cena por semana: com trinta
   cenas, vinte semanas repetiam material já visto. Estas fecham
   o ano, e sobem a aposta — as últimas são conversas em que o
   inglês não é o problema, é o instrumento.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.dialogos = (F.data.dialogos || []).concat([

    {
        id: 'dl-hotel-problema',
        titulo: 'Quarto de hotel com problema à meia-noite',
        nivel: 2,
        contexto: 'Você chegou de madrugada, o ar-condicionado não liga e o quarto está a 30 graus.',
        seuPapel: 'Hóspede cansado',
        papelBot: 'Recepcionista da madrugada',
        objetivo: 'Conseguir a troca de quarto hoje, sem levantar a voz e sem pedir desculpa por reclamar.',
        obrigatorios: ["I'm afraid", 'Is there any chance', "I'd really appreciate it"],
        turnos: [
            { bot: "Front desk, good evening. How can I help you?", pt: 'Recepção, boa noite. Como posso ajudar?', dica: 'Diga o quarto e o problema em uma frase só.', modelo: "Hi, this is room 412 — I'm afraid the air conditioning isn't working at all." },
            { bot: "Oh, I'm sorry about that. Have you tried the panel by the door?", pt: 'Desculpe. Você tentou o painel perto da porta?', dica: 'Mostre que já tentou, sem soar irritado.', modelo: "I did, yeah — the display lights up but nothing comes out. It's about thirty degrees in here." },
            { bot: "Let me see what I can do. Maintenance is off until seven.", pt: 'Vou ver o que consigo. A manutenção só volta às sete.', dica: 'Não aceite o problema como resolvido. Peça a alternativa.', modelo: "I understand. Is there any chance you could move me to another room tonight? I've got an early flight." },
            { bot: "We're pretty full, but let me check... I might have something on the sixth floor.", pt: 'Estamos cheios, mas deixa eu ver... Talvez tenha algo no sexto.', dica: 'Agradeça antes de fechar. Educação é o que faz o outro se esforçar.', modelo: "That would be perfect — I'd really appreciate it. I can come down and get the key right now." },
            { bot: "No need, I'll bring it up myself. Give me five minutes.", pt: 'Não precisa, eu levo aí. Cinco minutos.', dica: 'Feche com algo humano, não só "thank you".', modelo: "You're a lifesaver. Seriously, thank you — I was about to sleep in the hallway." }
        ],
        desafio: 'Refaça a cena como se o recepcionista tivesse dito não. Consiga alguma coisa mesmo assim.'
    },
    {
        id: 'dl-apresentacao-perguntas',
        titulo: 'A pergunta hostil depois da sua apresentação',
        nivel: 3,
        contexto: 'Você acabou de apresentar um projeto. Alguém da plateia questiona os seus números na frente de todos.',
        seuPapel: 'Quem apresentou',
        papelBot: 'Executivo cético',
        objetivo: 'Defender o trabalho sem ficar na defensiva. Concordar com a parte válida e segurar o resto.',
        obrigatorios: ["That's a fair point", 'What I can tell you is', "Let's take that offline"],
        turnos: [
            { bot: "Those numbers look optimistic to me. Where exactly did they come from?", pt: 'Esses números me parecem otimistas. De onde exatamente vieram?', dica: 'Não se defenda antes de reconhecer. Comece pelo acordo.', modelo: "That's a fair point — they're from the last two quarters only, so the sample is small." },
            { bot: "Two quarters is nothing. You're asking us to bet on a trend that might not exist.", pt: 'Dois trimestres não é nada. Está pedindo pra apostar numa tendência que talvez nem exista.', dica: 'Aceite o limite e devolva o que você tem de sólido.', modelo: "You're right that it's early. What I can tell you is that the same pattern showed up in all four regions." },
            { bot: "All four? That wasn't in the deck.", pt: 'Nas quatro? Isso não estava na apresentação.', dica: 'Assuma a falha sem se desculpar três vezes.', modelo: "It wasn't — that's on me, I cut it for time. I can send the regional breakdown right after this." },
            { bot: "Please do. And I still think the forecast is aggressive.", pt: 'Por favor. E continuo achando a projeção agressiva.', dica: 'Não force o acordo. Ofereça o próximo passo.', modelo: "That's fair, and I'd rather be wrong on paper than in production. Let's take that offline and run a conservative version together." },
            { bot: "Alright. Send it over and we'll talk Thursday.", pt: 'Certo. Manda e a gente conversa quinta.', dica: 'Feche marcando compromisso concreto.', modelo: "Thursday works. I'll have both versions in your inbox by Wednesday morning." }
        ],
        desafio: 'Refaça sem usar a palavra "sorry" nenhuma vez.'
    },
    {
        id: 'dl-escola-filho',
        titulo: 'Reunião na escola do seu filho',
        nivel: 2,
        contexto: 'Primeira reunião com a professora, num país onde você acabou de chegar.',
        seuPapel: 'Pai ou mãe',
        papelBot: 'Professora',
        objetivo: 'Entender como seu filho está indo e dizer o que preocupa você, sem fingir que entendeu tudo.',
        obrigatorios: ["I'm not sure I follow", 'How is he doing with', 'What would you suggest'],
        turnos: [
            { bot: "Thanks for coming in. Overall he's settling in well, though he's very quiet in class.", pt: 'Obrigada por vir. No geral ele está se adaptando bem, mas é muito quieto em aula.', dica: 'Reaja e peça detalhe, não aceite o resumo.', modelo: "That's good to hear. Quiet how — is he not understanding, or just shy?" },
            { bot: "More shy, I think. He follows instructions fine but never volunteers.", pt: 'Mais tímido, eu acho. Ele segue as instruções bem, mas nunca se voluntaria.', dica: 'Traga a sua informação de casa. Você sabe coisas que ela não sabe.', modelo: "That matches home, honestly. He talks nonstop in Portuguese and freezes in English." },
            { bot: "That's very common in the first year. We usually give it time and pair them up.", pt: 'É comum no primeiro ano. Costumamos dar tempo e colocar em duplas.', dica: 'Se não entendeu um termo, pergunte na hora.', modelo: "I'm not sure I follow — pair them up with another student, you mean?" },
            { bot: "Exactly. A buddy who does the talking until he's comfortable.", pt: 'Exatamente. Um colega que fala por ele até ficar confortável.', dica: 'Peça a recomendação prática que você pode aplicar em casa.', modelo: "That makes sense. What would you suggest we do at home to help that along?" },
            { bot: "Read out loud together in English, ten minutes a night. It works.", pt: 'Leiam em voz alta em inglês, dez minutos por noite. Funciona.', dica: 'Feche combinando um retorno.', modelo: "We can do ten minutes. Could we check in again in a month and see if it moved?" }
        ],
        desafio: 'Refaça pedindo esclarecimento em pelo menos dois turnos diferentes.'
    },
    {
        id: 'dl-negociando-prazo',
        titulo: 'Dizer ao cliente que vai atrasar',
        nivel: 3,
        contexto: 'A entrega é sexta e não vai ficar pronta. Você liga antes que ele descubra sozinho.',
        seuPapel: 'Responsável pelo projeto',
        papelBot: 'Cliente que já pagou',
        objetivo: 'Dar a má notícia primeiro, com data nova e plano — não com desculpa.',
        obrigatorios: ['I wanted to get ahead of this', "Here's where we are", 'What I can commit to'],
        turnos: [
            { bot: "Hey — I wasn't expecting your call. Everything alright?", pt: 'Oi — não esperava sua ligação. Está tudo bem?', dica: 'Não enrole. A má notícia vem na primeira frase.', modelo: "Everything's fine, but I wanted to get ahead of this: we're not going to make Friday." },
            { bot: "Okay. That's not what I wanted to hear. What happened?", pt: 'Certo. Não era o que eu queria ouvir. O que aconteceu?', dica: 'Fato curto, sem culpar terceiros.', modelo: "Here's where we are: the integration took three days longer than we planned, and testing hasn't started." },
            { bot: "So when is it going to be ready? And is that a real date this time?", pt: 'Então quando fica pronto? E é uma data real dessa vez?', dica: 'Dê a data com folga e diga por quê.', modelo: "What I can commit to is Wednesday the 18th. That includes two full days of testing, which is what we skipped." },
            { bot: "The 18th is tight for us. We've got a launch on the 20th.", pt: 'Dia 18 é apertado pra gente. Temos um lançamento no dia 20.', dica: 'Ofereça a entrega parcial em vez de prometer o impossível.', modelo: "I hear you. I can give you the checkout flow on Monday so your team can start, and the rest on the 18th." },
            { bot: "That works. Send me a written version of that today.", pt: 'Isso funciona. Me manda isso por escrito hoje.', dica: 'Feche confirmando exatamente o combinado.', modelo: "You'll have it in an hour — checkout Monday, everything else the 18th, in writing. Thanks for being straight with me." }
        ],
        desafio: 'Refaça a cena sem usar a palavra "problem" nenhuma vez.'
    },
    {
        id: 'dl-viagem-perdeu-voo',
        titulo: 'Perdeu a conexão no aeroporto',
        nivel: 2,
        contexto: 'O primeiro voo atrasou e você perdeu a conexão. Fila do balcão, meia-noite.',
        seuPapel: 'Passageiro',
        papelBot: 'Atendente da companhia',
        objetivo: 'Sair do balcão com voo novo e, se possível, hotel — sendo o passageiro que ela quer ajudar.',
        obrigatorios: ['I completely understand', 'Would it be possible', 'anything you can do'],
        turnos: [
            { bot: "Next, please. Boarding pass and passport?", pt: 'Próximo, por favor. Cartão de embarque e passaporte?', dica: 'Diga o problema em uma frase, sem história longa.', modelo: "Here you go. My flight from São Paulo landed late and I missed the connection to Chicago." },
            { bot: "Let me look... the next one with seats is tomorrow at 6 a.m.", pt: 'Deixa ver... o próximo com lugar é amanhã às 6h.', dica: 'Aceite a informação antes de pedir mais.', modelo: "I completely understand it's a busy night. Would it be possible to get on the standby list for anything earlier?" },
            { bot: "I can add you, but I can't promise. It's Thanksgiving week.", pt: 'Posso te colocar, mas não prometo. É semana de feriado.', dica: 'Agradeça e vá para a segunda pergunta.', modelo: "That's more than fair, thank you. And since it's an overnight — is there anything you can do about a hotel?" },
            { bot: "Because the delay was ours, yes. I can give you a voucher.", pt: 'Como o atraso foi nosso, sim. Posso te dar um voucher.', dica: 'Confirme os detalhes práticos: onde, como, a que horas.', modelo: "That helps a lot. Where do I catch the shuttle, and what time should I be back here in the morning?" },
            { bot: "Door 4, every twenty minutes. Be back by 4:30.", pt: 'Porta 4, de vinte em vinte minutos. Volte até 4h30.', dica: 'Feche reconhecendo o esforço dela pelo nome.', modelo: "Door 4, back by 4:30. Thank you, Denise — you made a bad night much easier." }
        ],
        desafio: 'Refaça a cena com a atendente dizendo não ao hotel. Continue educado até o fim.'
    },
    {
        id: 'dl-time-remoto-conflito',
        titulo: 'Dois colegas discutindo e você no meio',
        nivel: 3,
        contexto: 'Reunião online. Dois colegas discordam há dez minutos e ninguém decide nada.',
        seuPapel: 'Terceira pessoa na reunião',
        papelBot: 'Colega irritado',
        objetivo: 'Cortar a discussão sem tomar partido e transformar o conflito numa decisão.',
        obrigatorios: ['Can I jump in', 'It sounds like', "Let's decide"],
        turnos: [
            { bot: "I've said this three times: doing it his way is going to break the API.", pt: 'Já disse três vezes: fazer do jeito dele vai quebrar a API.', dica: 'Peça a palavra em vez de simplesmente falar por cima.', modelo: "Can I jump in for a second? I think we're arguing about two different things." },
            { bot: "Go ahead, but I don't see how.", pt: 'Pode falar, mas não vejo como.', dica: 'Reformule os dois lados. Quem reformula, controla.', modelo: "It sounds like you're worried about breaking existing clients, and he's worried about the deadline. Both are real." },
            { bot: "Fine, but one of them has to win. We can't do both.", pt: 'Tá, mas um dos dois tem que ganhar. Não dá para os dois.', dica: 'Proponha o critério, não a solução.', modelo: "Maybe not both — but what if we decide by which one is cheaper to undo? Whatever we pick, we'll be wrong about something." },
            { bot: "...that's actually not a bad way to look at it.", pt: '...na verdade não é um jeito ruim de ver.', dica: 'Feche a decisão enquanto o clima está bom.', modelo: "Then let's decide now: version behind a flag this sprint, and we revisit in two weeks with real numbers." },
            { bot: "I can live with that. Let's move on.", pt: 'Consigo viver com isso. Vamos em frente.', dica: 'Registre o combinado para não voltar amanhã.', modelo: "I'll put it in the notes so nobody has to remember this conversation on Monday." }
        ],
        desafio: 'Refaça sem dar razão a nenhum dos dois em momento nenhum.'
    },
    {
        id: 'dl-medico-segunda-opiniao',
        titulo: 'Pedir uma segunda opinião ao médico',
        nivel: 3,
        contexto: 'O médico recomendou uma cirurgia. Você quer ouvir outro profissional sem ofender este.',
        seuPapel: 'Paciente',
        papelBot: 'Médico',
        objetivo: 'Pedir a segunda opinião e sair com os exames em mãos, sem estragar a relação.',
        obrigatorios: ['I want to make sure I understand', 'Before I decide', 'Would you be able to'],
        turnos: [
            { bot: "So my recommendation is surgery. We'd schedule it for early next month.", pt: 'Minha recomendação é cirurgia. Marcaríamos para o começo do mês que vem.', dica: 'Antes de pedir outra opinião, mostre que entendeu esta.', modelo: "I want to make sure I understand — surgery is the option you'd choose even at my age?" },
            { bot: "Yes. The alternative is medication, but it treats the symptom, not the cause.", pt: 'Sim. A alternativa é medicação, mas trata o sintoma, não a causa.', dica: 'Nomeie o seu desconforto sem acusar ninguém.', modelo: "That's clear. Before I decide on something this big, I'd like to hear one more opinion." },
            { bot: "That's your right, of course. Some patients feel awkward asking.", pt: 'É seu direito, claro. Alguns pacientes ficam sem jeito de pedir.', dica: 'Aproveite a abertura e peça o que você precisa levar.', modelo: "I appreciate you saying that. Would you be able to give me copies of the scans and your notes?" },
            { bot: "Absolutely. My office can send everything by email today.", pt: 'Claro. Meu consultório manda tudo por e-mail hoje.', dica: 'Pergunte o prazo real — a decisão tem tempo?', modelo: "Thank you. And realistically, how long can I take to decide without making things worse?" },
            { bot: "A few weeks won't change the outcome. Months might.", pt: 'Algumas semanas não mudam nada. Meses, talvez.', dica: 'Feche com o compromisso de voltar.', modelo: "Then I'll get the second opinion in the next two weeks and come back to you either way." }
        ],
        desafio: 'Refaça a cena com o médico reagindo mal ao pedido. Mantenha o seu pedido de pé.'
    },
    {
        id: 'dl-vender-sua-ideia',
        titulo: 'Convencer o time a tentar do seu jeito',
        nivel: 4,
        contexto: 'Você tem uma proposta diferente da que o time já combinou. Cinco minutos para defendê-la.',
        seuPapel: 'Quem propõe',
        papelBot: 'Colega que já decidiu o contrário',
        objetivo: 'Fazer o outro considerar de verdade — não vencer a discussão.',
        obrigatorios: ['Hear me out', "I might be wrong, but", "What would change your mind"],
        turnos: [
            { bot: "We already agreed on the other approach last week. Why are we reopening this?", pt: 'A gente já combinou a outra abordagem semana passada. Por que reabrir?', dica: 'Peça o espaço antes de usá-lo.', modelo: "Hear me out for two minutes — if you still disagree after that, I'll drop it for good." },
            { bot: "Two minutes. Go.", pt: 'Dois minutos. Vai.', dica: 'Comece pelo custo do caminho atual, não pelas virtudes do seu.', modelo: "I might be wrong, but the plan we agreed on locks us into that vendor for three years. That's the part that worries me." },
            { bot: "It also gets us live in six weeks instead of twelve.", pt: 'Também nos coloca no ar em seis semanas em vez de doze.', dica: 'Conceda o ponto forte do outro. Isso compra credibilidade.', modelo: "That's true, and it's a real advantage — I'm not pretending speed doesn't matter here." },
            { bot: "So what exactly are you proposing?", pt: 'Então o que exatamente você propõe?', dica: 'Proposta concreta, pequena, reversível.', modelo: "Give me one week to build the thin version. If it isn't working by Friday, we go with your plan and I shut up." },
            { bot: "One week. And if it's not working, we don't discuss it again.", pt: 'Uma semana. E se não funcionar, não se discute mais.', dica: 'Feche perguntando o critério — é o que separa proposta de teimosia.', modelo: "Deal. What would change your mind by Friday — what would you need to see?" }
        ],
        desafio: 'Refaça a cena defendendo a ideia CONTRÁRIA à sua. Você precisa conseguir os dois lados.'
    },
    {
        id: 'dl-condolencias',
        titulo: 'Dizer alguma coisa quando alguém perdeu alguém',
        nivel: 4,
        contexto: 'Um colega voltou ao trabalho depois de perder o pai. Vocês se cruzam no corredor.',
        seuPapel: 'Colega',
        papelBot: 'Quem perdeu o pai',
        objetivo: 'Dizer o que precisa ser dito e ir embora na hora certa. Curto, sincero, sem clichê traduzido.',
        obrigatorios: ["I'm so sorry for your loss", 'No pressure at all', "I'm around"],
        turnos: [
            { bot: "Hey. Yeah, I'm back. Everyone keeps looking at me funny.", pt: 'Oi. É, voltei. Todo mundo fica me olhando estranho.', dica: 'Diga a frase padrão. Ela existe porque funciona.', modelo: "I'm so sorry for your loss. I don't really know what to say, but I didn't want to say nothing." },
            { bot: "Thanks. Honestly, that's better than most of what I've heard today.", pt: 'Obrigado. Sinceramente, é melhor que a maior parte do que ouvi hoje.', dica: 'Não force conversa. Ofereça e recue.', modelo: "If you ever want to talk about him, I'd like to hear about it. No pressure at all." },
            { bot: "Maybe. Not today. Today I just want to answer emails and not think.", pt: 'Talvez. Hoje não. Hoje eu só quero responder e-mail e não pensar.', dica: 'Aceite o limite na hora, sem insistir.', modelo: "That sounds like exactly the right plan. I'll leave you to it." },
            { bot: "Appreciate it. It's weird — some hours are fine and some aren't.", pt: 'Valeu. É estranho — tem hora que está tudo bem e tem hora que não.', dica: 'Valide sem explicar o luto para quem está nele.', modelo: "That makes sense. There's no version of this that's supposed to be smooth." },
            { bot: "Yeah. Anyway. Coffee?", pt: 'É. Enfim. Café?', dica: 'Feche curto e deixe a porta aberta.', modelo: "Coffee sounds good. And seriously — I'm around, whenever." }
        ],
        desafio: 'Refaça mantendo cada resposta em no máximo doze palavras. Nesta conversa, menos é mais.'
    }
]);
