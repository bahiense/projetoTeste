/* =========================================================
   Drills — segunda parte.

   As estruturas que aparecem depois que o básico já sai
   sozinho: futuro, passiva, arrependimento, sugestão,
   colocações e as perguntas que o brasileiro monta na ordem
   errada.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.drills = F.data.drills.concat([

    {
        id: 'dr-futuro',
        nome: 'Os três futuros do inglês',
        foco: 'will, going to e presente contínuo não são intercambiáveis — e o brasileiro usa só o will.',
        instrucao: 'Ouça a situação e responda com o futuro certo.',
        modelo: 'Decisão na hora → will · Plano já feito → going to · Agenda marcada → present continuous',
        itens: [
            ['The phone is ringing. (decisão agora)', "I'll get it."],
            ['We already decided to move offices.', "We're going to move offices."],
            ['My flight is booked for Tuesday at nine.', "I'm flying on Tuesday at nine."],
            ['Look at those clouds. (previsão pela evidência)', "It's going to rain."],
            ['I promise, first thing tomorrow.', "I'll do it first thing tomorrow."],
            ['Dinner with Ana, already arranged for Friday.', "I'm having dinner with Ana on Friday."],
            ['Our plan for next year: hire two people.', "We're going to hire two people."],
            ['You look cold. (oferta espontânea)', "I'll close the window."],
            ['The meeting is on the calendar for ten.', "We're meeting at ten."],
            ['I predict they lose. (opinião sobre o futuro)', "I think they'll lose."]
        ]
    },

    {
        id: 'dr-passiva',
        nome: 'Ativa vira passiva',
        foco: 'A passiva é o registro padrão de relatório, aviso e notícia em inglês.',
        instrucao: 'Ouça a frase ativa e devolva na passiva.',
        modelo: 'They cancelled the meeting. → The meeting was cancelled.',
        itens: [
            ['They cancelled the meeting.', 'The meeting was cancelled.'],
            ['Someone stole my laptop.', 'My laptop was stolen.'],
            ['We will announce the results tomorrow.', 'The results will be announced tomorrow.'],
            ['They are fixing the server right now.', 'The server is being fixed right now.'],
            ['Nobody has signed the contract yet.', 'The contract has not been signed yet.'],
            ['They built this in 1890.', 'This was built in 1890.'],
            ['We must finish the report today.', 'The report must be finished today.'],
            ['They pay us on the fifth.', 'We are paid on the fifth.'],
            ['Someone should tell her.', 'She should be told.'],
            ['They are going to replace the system.', 'The system is going to be replaced.']
        ]
    },

    {
        id: 'dr-tag',
        nome: 'Question tags — o "né?" do inglês',
        foco: 'O brasileiro fala "no?" ou "right?" para tudo. O nativo espelha o auxiliar.',
        instrucao: 'Ouça a frase e acrescente a tag correta.',
        modelo: "You're coming, aren't you? · She didn't call, did she?",
        itens: [
            ["You're coming,", "aren't you?"],
            ['She called yesterday,', "didn't she?"],
            ["He can't drive,", 'can he?'],
            ['They have finished,', "haven't they?"],
            ['It was expensive,', "wasn't it?"],
            ["We shouldn't wait,", 'should we?'],
            ["I'm late,", "aren't I?"],
            ['Nobody told you,', 'did they?'],
            ["You'll be there,", "won't you?"],
            ['This makes sense,', "doesn't it?"]
        ]
    },

    {
        id: 'dr-arrependimento',
        nome: 'Should have, could have, must have',
        foco: 'Falar do passado que não aconteceu — arrependimento, crítica e dedução.',
        instrucao: 'Ouça o fato e devolva o comentário sobre o passado.',
        modelo: 'I didn\'t study, and I failed. → I should have studied.',
        itens: [
            ["I didn't study, and I failed.", 'I should have studied.'],
            ["He didn't call, and she was worried.", 'He should have called.'],
            ['She had the chance but chose not to go.', 'She could have gone.'],
            ['The lights are off — nobody is home, certainly.', 'They must have left.'],
            ['I ate too much and now I feel sick.', "I shouldn't have eaten so much."],
            ['We had the budget but we never used it.', 'We could have used the budget.'],
            ['His car is gone, so he certainly drove.', 'He must have driven.'],
            ["They didn't warn us and now it's a mess.", 'They should have warned us.'],
            ['It was possible, but it did not happen.', 'It could have happened.'],
            ['She looks exhausted — certainly a long trip.', 'She must have had a long trip.']
        ]
    },

    {
        id: 'dr-ing-infinitivo',
        nome: 'Verbo + -ING ou + TO',
        foco: 'enjoy doing × want to do. Não há lógica: é lista, e vira reflexo por repetição.',
        instrucao: 'Ouça o verbo e a ação, e complete a frase.',
        modelo: 'enjoy / cook → I enjoy cooking.',
        itens: [
            ['enjoy / cook', 'I enjoy cooking.'],
            ['want / leave', 'I want to leave.'],
            ['avoid / talk about it', 'I avoid talking about it.'],
            ['decide / stay', 'I decided to stay.'],
            ['finish / write the report', 'I finished writing the report.'],
            ['agree / help', 'I agreed to help.'],
            ['consider / move', 'I am considering moving.'],
            ['refuse / sign', 'I refused to sign.'],
            ['keep / try', 'I keep trying.'],
            ['manage / fix it', 'I managed to fix it.'],
            ['look forward to / see you', 'I look forward to seeing you.'],
            ['used to / smoke', 'I used to smoke.']
        ]
    },

    {
        id: 'dr-comparativo',
        nome: 'Comparar sem errar',
        foco: 'Mais que, tão quanto, o mais de todos — na velocidade da conversa.',
        instrucao: 'Ouça os dois elementos e compare.',
        modelo: 'this / that — expensive → This is more expensive than that.',
        itens: [
            ['this / that — expensive', 'This is more expensive than that.'],
            ['today / yesterday — busy', 'Today is busier than yesterday.'],
            ['the two options — equal cost', 'This one costs as much as that one.'],
            ['our team / theirs — big', 'Our team is bigger than theirs.'],
            ['this route — best of all', 'This is the best route.'],
            ['the new one / the old one — not as good', 'The new one is not as good as the old one.'],
            ['his English / mine — better', 'His English is better than mine.'],
            ['this problem — worst of the year', 'This is the worst problem of the year.'],
            ['the more you practice / the easier', 'The more you practice, the easier it gets.'],
            ['twice / last year — sales', 'Sales are twice as high as last year.']
        ]
    },

    {
        id: 'dr-quantificador',
        nome: 'Much, many, a few, a little',
        foco: 'Contável e incontável, e o "muito" que muda de forma.',
        instrucao: 'Ouça o substantivo e a ideia, e complete.',
        modelo: 'time / not enough → I don\'t have much time.',
        itens: [
            ['time / not enough', "I don't have much time."],
            ['friends / not enough', "I don't have many friends."],
            ['money / a small amount', 'I have a little money.'],
            ['options / a small number', 'I have a few options.'],
            ['information / a lot', 'There is a lot of information.'],
            ['people / too many', 'There are too many people.'],
            ['work / too much', 'There is too much work.'],
            ['advice / some', 'I need some advice.'],
            ['coffee / none left', 'There is no coffee left.'],
            ['mistakes / hardly any', 'There were hardly any mistakes.']
        ]
    },

    {
        id: 'dr-indireta',
        nome: 'Pergunta dentro de pergunta',
        foco: 'A ordem muda e o brasileiro mantém a ordem da pergunta direta. Erro que soa muito estrangeiro.',
        instrucao: 'Ouça a pergunta direta e devolva a versão indireta.',
        modelo: 'Where is the station? → Do you know where the station is?',
        itens: [
            ['Where is the station?', 'Do you know where the station is?'],
            ['What time does it start?', 'Could you tell me what time it starts?'],
            ['How much does it cost?', 'Do you know how much it costs?'],
            ['Is he coming?', 'Do you know if he is coming?'],
            ['Why did they leave?', 'I wonder why they left.'],
            ['Where did you buy it?', 'Can I ask where you bought it?'],
            ['Has she finished?', 'Do you know whether she has finished?'],
            ['What does it mean?', 'Could you explain what it means?'],
            ['When will they arrive?', 'Any idea when they will arrive?'],
            ['Who is in charge?', 'Do you know who is in charge?']
        ]
    },

    {
        id: 'dr-so-neither',
        nome: 'So do I / Neither do I',
        foco: 'Concordar em uma sílaba, do jeito que o nativo faz. Ninguém responde "I also".',
        instrucao: 'Ouça a frase e concorde na mesma forma.',
        modelo: 'I love coffee. → So do I. · I don\'t smoke. → Neither do I.',
        itens: [
            ['I love coffee.', 'So do I.'],
            ["I don't smoke.", 'Neither do I.'],
            ["I'm tired.", 'So am I.'],
            ["I can't swim.", 'Neither can I.'],
            ['I went there last year.', 'So did I.'],
            ["I've never been to Japan.", 'Neither have I.'],
            ['I would love to go.', 'So would I.'],
            ["I wasn't invited.", 'Neither was I.'],
            ['I will be there.', 'So will I.'],
            ["I don't agree.", 'Neither do I.']
        ]
    },

    {
        id: 'dr-usedto',
        nome: 'Used to, be used to, get used to',
        foco: 'Três formas parecidas com sentidos completamente diferentes.',
        instrucao: 'Ouça a ideia em português e devolva a forma certa.',
        modelo: 'costumava fumar → I used to smoke · estou acostumado a acordar cedo → I am used to waking up early',
        itens: [
            ['eu costumava fumar (não fumo mais)', 'I used to smoke.'],
            ['estou acostumado a acordar cedo', 'I am used to waking up early.'],
            ['estou me acostumando ao frio', 'I am getting used to the cold.'],
            ['ela costumava morar aqui', 'She used to live here.'],
            ['ele não está acostumado a falar em público', 'He is not used to speaking in public.'],
            ['você vai se acostumar', 'You will get used to it.'],
            ['a gente costumava sair toda sexta', 'We used to go out every Friday.'],
            ['não estou acostumado a esse horário', 'I am not used to this schedule.']
        ]
    },

    {
        id: 'dr-sugerir',
        nome: 'Sugerir de cinco jeitos',
        foco: 'Uma sugestão dita de um jeito só soa insistência; variar é o que soa natural.',
        instrucao: 'Ouça a sugestão e devolva na forma pedida.',
        modelo: 'ir de trem / Why don\'t we → Why don\'t we take the train?',
        itens: [
            ['ir de trem — Why don\'t we', 'Why don\'t we take the train?'],
            ['ir de trem — How about', 'How about taking the train?'],
            ['ir de trem — Let\'s', "Let's take the train."],
            ['ir de trem — We could', 'We could take the train.'],
            ['ir de trem — What if', 'What if we took the train?'],
            ['adiar a reunião — How about', 'How about postponing the meeting?'],
            ['pedir ajuda — Why don\'t you', "Why don't you ask for help?"],
            ['testar por um mês — What if', 'What if we tried it for a month?'],
            ['começar de novo — Let\'s', "Let's start over."],
            ['falar com ela — You might want to', 'You might want to talk to her.']
        ]
    },

    {
        id: 'dr-colocacao',
        nome: 'Make, do, take, have, get',
        foco: 'Os cinco verbos que carregam metade da conversa — e que o português junta errado.',
        instrucao: 'Ouça o complemento e diga o verbo certo com ele.',
        modelo: '___ a decision → make a decision',
        itens: [
            ['___ a decision', 'make a decision'],
            ['___ a mistake', 'make a mistake'],
            ['___ your homework', 'do your homework'],
            ['___ a shower', 'take a shower'],
            ['___ a break', 'take a break'],
            ['___ breakfast (comer)', 'have breakfast'],
            ['___ a look', 'take a look'],
            ['___ progress', 'make progress'],
            ['___ business with them', 'do business with them'],
            ['___ a chance', 'take a chance'],
            ['___ in touch', 'get in touch'],
            ['___ an appointment', 'make an appointment'],
            ['___ a difference', 'make a difference'],
            ['___ the dishes', 'do the dishes'],
            ['___ fun of someone', 'make fun of someone']
        ]
    },

    {
        id: 'dr-clarificar',
        aberto: true,   // várias respostas servem: o modelo é referência, não gabarito
        nome: 'Não entendi — em meio segundo',
        foco: 'Reagir à falta de entendimento sem congelar a conversa.',
        instrucao: 'Ouça a situação e devolva a frase certa, rápido.',
        modelo: 'Falaram rápido demais → Sorry, could you say that again?',
        itens: [
            ['falaram rápido demais', 'Sorry, could you say that again?'],
            ['você perdeu só a última palavra', "Sorry, the last word — what was it?"],
            ['você quer confirmar o que entendeu', 'So you mean we start on Monday?'],
            ['você não sabe uma palavra que ele usou', 'What does that mean, exactly?'],
            ['o barulho atrapalhou', "Sorry, it's loud in here — one more time?"],
            ['você quer que ele fale devagar', 'Could you slow down just a bit?'],
            ['você quer que ele escreva', 'Could you write that down for me?'],
            ['você entendeu, mas quer exemplo', 'Can you give me an example?'],
            ['você perdeu o nome da pessoa', "Sorry, I didn't catch your name."],
            ['você quer confirmar um número', 'Was that fifteen or fifty?']
        ]
    },

    {
        id: 'dr-adjetivos',
        nome: 'A ordem dos adjetivos',
        foco: 'Existe uma ordem fixa, e o nativo percebe na hora quando ela é quebrada.',
        instrucao: 'Ouça os adjetivos soltos e ordene: opinião, tamanho, idade, forma, cor, origem, material.',
        modelo: 'leather / old / brown / bag → an old brown leather bag',
        itens: [
            ['leather / old / brown / bag', 'an old brown leather bag'],
            ['Italian / beautiful / small / car', 'a beautiful small Italian car'],
            ['plastic / round / red / table', 'a round red plastic table'],
            ['cotton / white / new / shirt', 'a new white cotton shirt'],
            ['huge / ugly / concrete / building', 'a huge ugly concrete building'],
            ['wooden / French / antique / chair', 'an antique French wooden chair'],
            ['long / boring / black / film', 'a long boring black film'],
            ['young / talented / Brazilian / player', 'a talented young Brazilian player']
        ]
    },

    {
        id: 'dr-plural-irregular',
        nome: 'Plurais que não levam -s',
        foco: 'Erro que passa despercebido para quem fala, e nunca para quem ouve.',
        instrucao: 'Ouça o singular e diga a frase no plural.',
        modelo: 'one child → two children',
        itens: [
            ['one child', 'two children'],
            ['one person', 'two people'],
            ['one man', 'two men'],
            ['one woman', 'two women'],
            ['one foot', 'two feet'],
            ['one tooth', 'two teeth'],
            ['one analysis', 'two analyses'],
            ['one criterion', 'two criteria'],
            ['one datum (dado)', 'two data'],
            ['one sheep', 'two sheep']
        ]
    },

    {
        id: 'dr-telefone-rapido',
        aberto: true,   // várias respostas servem: o modelo é referência, não gabarito
        nome: 'Telefone: resposta imediata',
        foco: 'No telefone não há rosto nem contexto. A frase tem que sair pronta.',
        instrucao: 'Ouça a fala do outro e responda na hora.',
        modelo: 'Can I speak to Rodrigo? → Speaking.',
        itens: [
            ['Can I speak to Rodrigo?', 'Speaking.'],
            ['Who is calling, please?', "This is Rodrigo from Logix."],
            ['Hold on, I will transfer you.', 'Sure, thank you.'],
            ['Sorry, he is in a meeting.', 'No problem — could you take a message?'],
            ['Can I take a message?', 'Yes, please ask him to call me back.'],
            ['You are breaking up.', "Sorry — can you hear me now?"],
            ['What is your number?', "It's four one five, two two two, nine eight."],
            ['Could you spell your name?', 'R-O-D-R-I-G-O.'],
            ['I will call you back in ten minutes.', "Perfect, I'll be here."],
            ['Thanks for calling.', 'Thanks for your time — have a good one.']
        ]
    }
]);
