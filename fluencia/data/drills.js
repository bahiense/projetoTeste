/* =========================================================
   Drills de automatização — estímulo e resposta.

   O app fala o estímulo, você tem poucos segundos para
   responder EM VOZ ALTA, e só então ouve a resposta certa.
   É repetição sob relógio: o objetivo não é acertar pensando,
   é acertar sem pensar. Enquanto a estrutura exigir raciocínio,
   ela não está pronta para a conversa real.

   Regra do exercício: nunca pare para se corrigir no meio.
   Errou, segue. A correção vem na repetição seguinte.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.drills = [

    {
        id: 'dr-perfect',
        nome: 'Present perfect com FOR e SINCE',
        foco: 'A estrutura que o brasileiro erra a vida inteira ("I am here since...").',
        instrucao: 'Ouça o tempo e transforme: "three years" → "I have been working here for three years".',
        modelo: 'I have been working here ___',
        itens: [
            ['three years', "I've been working here for three years."],
            ['2019', "I've been working here since 2019."],
            ['six months', "I've been working here for six months."],
            ['I graduated', "I've been working here since I graduated."],
            ['a long time', "I've been working here for a long time."],
            ['last March', "I've been working here since last March."],
            ['almost a decade', "I've been working here for almost a decade."],
            ['the merger', "I've been working here since the merger."]
        ]
    },

    {
        id: 'dr-educado',
        nome: 'De seco para educado',
        foco: 'Transformar ordem em pedido — o ajuste que evita parecer grosseiro.',
        instrucao: 'Ouça a versão seca e devolva a versão educada.',
        modelo: 'Send the file. → Could you send me the file when you get a chance?',
        itens: [
            ['Send the file.', 'Could you send me the file when you get a chance?'],
            ['Call me tomorrow.', 'Would you mind giving me a call tomorrow?'],
            ['I want more time.', "I was wondering if I could have a bit more time."],
            ['Fix this.', 'Do you think you could take another look at this?'],
            ['You are wrong.', "I'm not sure that's quite right — can we double-check?"],
            ['Explain it again.', 'Sorry, would you mind walking me through that again?'],
            ['I need the report today.', "Any chance you could get me the report today?"],
            ['Come to my office.', 'Do you have a minute to stop by my office?'],
            ['No.', "I'd love to, but I can't make it work this week."],
            ['Give me a discount.', 'Is there any flexibility on the price?']
        ]
    },

    {
        id: 'dr-pergunta',
        nome: 'Afirmativa vira pergunta',
        foco: 'Inverter auxiliar sem pausa — o que trava o brasileiro no meio da conversa.',
        instrucao: 'Ouça a afirmação e devolva a pergunta correspondente.',
        modelo: 'He works here. → Does he work here?',
        itens: [
            ['He works here.', 'Does he work here?'],
            ['They finished the report.', 'Did they finish the report?'],
            ['She has been to Japan.', 'Has she been to Japan?'],
            ['You can help me.', 'Can you help me?'],
            ['It will take long.', 'Will it take long?'],
            ['They were talking about it.', 'Were they talking about it?'],
            ['He should call her.', 'Should he call her?'],
            ['We have enough time.', 'Do we have enough time?'],
            ['She had already left.', 'Had she already left?'],
            ['This is working.', 'Is this working?']
        ]
    },

    {
        id: 'dr-negativa',
        nome: 'Negativa contraída em velocidade',
        foco: 'Contrair sempre. Falar "do not" na conversa soa robótico.',
        instrucao: 'Ouça a frase e devolva a negativa contraída.',
        modelo: 'I know. → I don\'t know.',
        itens: [
            ['I know.', "I don't know."],
            ['She agreed.', "She didn't agree."],
            ['They have finished.', "They haven't finished."],
            ['He can come.', "He can't come."],
            ['It is working.', "It isn't working."],
            ['We should wait.', "We shouldn't wait."],
            ['I have seen it.', "I haven't seen it."],
            ['You were there.', "You weren't there."],
            ['It will happen.', "It won't happen."],
            ['I would do that.', "I wouldn't do that."]
        ]
    },

    {
        id: 'dr-condicional',
        nome: 'Condicional sem "would" no IF',
        foco: 'O erro campeão: "If I would have time".',
        instrucao: 'Ouça o fato e devolva a versão hipotética.',
        modelo: 'I have no time, so I do not go. → If I had time, I would go.',
        itens: [
            ["I don't have time, so I don't go.", 'If I had time, I would go.'],
            ["I don't know English, so I don't apply.", 'If I knew English, I would apply.'],
            ["He is not here, so he can't help.", 'If he were here, he could help.'],
            ["We don't have the budget, so we don't hire.", "If we had the budget, we'd hire."],
            ["I didn't study, so I failed.", "If I had studied, I wouldn't have failed."],
            ["She didn't call, so I didn't know.", "If she had called, I would have known."],
            ["They are late, so we can't start.", "If they weren't late, we could start."],
            ["It's raining, so we stay home.", "If it weren't raining, we'd go out."]
        ]
    },

    {
        id: 'dr-passado',
        nome: 'Passado irregular no reflexo',
        foco: 'Verbos irregulares em velocidade, dentro de frase — nunca em lista solta.',
        instrucao: 'Ouça no presente, devolva no passado, frase inteira.',
        modelo: 'I go there every day. → I went there yesterday.',
        itens: [
            ['I go there every day.', 'I went there yesterday.'],
            ['She brings the documents.', 'She brought the documents.'],
            ['They think it works.', 'They thought it worked.'],
            ['He buys a new one.', 'He bought a new one.'],
            ['We take the train.', 'We took the train.'],
            ['I keep the receipts.', 'I kept the receipts.'],
            ['She teaches beginners.', 'She taught beginners.'],
            ['They choose the vendor.', 'They chose the vendor.'],
            ['He leads the team.', 'He led the team.'],
            ['I feel confident.', 'I felt confident.'],
            ['We hold two meetings.', 'We held two meetings.'],
            ['She sends the invoice.', 'She sent the invoice.']
        ]
    },

    {
        id: 'dr-phrasal',
        nome: 'Trocar o verbo formal pelo phrasal',
        foco: 'Soar natural: o nativo escolhe o phrasal na fala e o formal no papel.',
        instrucao: 'Ouça a frase formal e devolva a versão falada.',
        modelo: 'I will investigate it. → I will look into it.',
        itens: [
            ['I will investigate it.', "I'll look into it."],
            ['We must postpone the meeting.', 'We have to put off the meeting.'],
            ['She invented a solution.', 'She came up with a solution.'],
            ['They rejected the offer.', 'They turned down the offer.'],
            ['We exhausted our budget.', 'We ran out of budget.'],
            ['I cannot comprehend this.', "I can't figure this out."],
            ['Please contact me anytime.', 'Feel free to reach out anytime.'],
            ['They cancelled the event.', 'They called off the event.'],
            ['We should resolve this today.', 'We should sort this out today.'],
            ['He mentioned the problem.', 'He brought up the problem.']
        ]
    },

    {
        id: 'dr-reacao',
        nome: 'Reagir em menos de um segundo',
        foco: 'O silêncio depois da fala do outro é o que gera constrangimento.',
        instrucao: 'Ouça e reaja imediatamente. Qualquer reação natural serve.',
        modelo: 'My dog died. → Oh no, I am so sorry.',
        itens: [
            ['I got the promotion!', "That's amazing — congratulations!"],
            ['My flight got cancelled.', "Oh no, that's rough."],
            ['I ran a marathon last week.', 'No way! How did it go?'],
            ['We lost the client.', "Ugh, I'm sorry. What happened?"],
            ['I am moving to Canada.', 'Wait, really? When?'],
            ['My kid started walking.', "Oh, that's the best. Congrats!"],
            ['The server is down again.', 'You have got to be kidding me.'],
            ['I finally finished the project.', 'Nice! That took forever, huh?'],
            ['I have been sick all week.', "Sorry to hear that — are you feeling better?"],
            ['They cut my budget in half.', "That's brutal. How are you handling it?"]
        ]
    },

    {
        id: 'dr-ganhar-tempo',
        nome: 'Encher o silêncio sem "hummm"',
        foco: 'Substituir a hesitação em português pela hesitação em inglês.',
        instrucao: 'Ouça a pergunta difícil e comece a responder com um chunk de tempo, sem pausa.',
        modelo: 'Why should we hire you? → That is a good question. The way I see it...',
        itens: [
            ['Why should we hire you?', "That's a fair question. The way I see it, ..."],
            ['What went wrong there?', 'Honestly, there is a lot to unpack there. ...'],
            ['Do you have a plan B?', 'Let me think for a second. ...'],
            ['How much would that cost?', 'Off the top of my head, ...'],
            ['What is your biggest flaw?', "How do I put this... ..."],
            ['Would you do it again?', 'Yes and no — it depends on ...'],
            ['Who was responsible?', 'Now that you mention it, ...'],
            ['Can you deliver by Friday?', 'Short answer: yes. Long answer: ...']
        ]
    },

    {
        id: 'dr-relativa',
        nome: 'Juntar duas frases numa só',
        foco: 'Sair da fala picotada de iniciante e construir períodos longos.',
        instrucao: 'Ouça as duas frases e devolva uma única, com relativa.',
        modelo: 'That is the client. He called yesterday. → That is the client who called yesterday.',
        itens: [
            ['That is the client. He called yesterday.', 'That is the client who called yesterday.'],
            ['This is the report. I mentioned it.', 'This is the report I mentioned.'],
            ['She is the manager. Her team won.', 'She is the manager whose team won.'],
            ['That is the city. I grew up there.', 'That is the city where I grew up.'],
            ['It was 2020. Everything changed then.', 'It was 2020, when everything changed.'],
            ['He is the guy. I told you about him.', 'He is the guy I told you about.'],
            ['This is the tool. It saved us.', 'This is the tool that saved us.'],
            ['That is the reason. We left because of it.', 'That is the reason we left.']
        ]
    },

    {
        id: 'dr-hedge',
        nome: 'Suavizar uma afirmação forte',
        foco: 'Registro corporativo anglófono: quase nada se afirma seco.',
        instrucao: 'Ouça a afirmação categórica e devolva a versão acolchoada.',
        modelo: 'This will fail. → I have a feeling this might not work as well as we hope.',
        itens: [
            ['This will fail.', "I have a feeling this might not work as well as we'd hope."],
            ['That is impossible.', "That would be really tough on our current timeline."],
            ['You did not test it.', "It looks like this may not have gone through testing."],
            ['The plan is bad.', "I see the logic — my concern is the execution risk."],
            ['Nobody agrees with you.', "I think there might be some pushback on that."],
            ['We are late.', "We're running a little behind on this one."],
            ['That costs too much.', "That's a bit outside what we had in mind."],
            ['I disagree completely.', "I see where you're coming from, but I'd push back a little."]
        ]
    },

    {
        id: 'dr-reported',
        nome: 'Contar o que o outro disse',
        foco: 'Discurso indireto — indispensável para reportar reunião e fofocar.',
        instrucao: 'Ouça a fala direta e devolva o relato.',
        modelo: '"I am tired," she said. → She said she was tired.',
        itens: [
            ['"I am tired," she said.', 'She said she was tired.'],
            ['"We will ship on Friday," they said.', 'They said they would ship on Friday.'],
            ['"I have finished," he said.', 'He said he had finished.'],
            ['"Can you help?" she asked.', 'She asked if I could help.'],
            ['"Where is the file?" he asked.', 'He asked where the file was.'],
            ['"Don\'t worry," she told me.', 'She told me not to worry.'],
            ['"I am not going," he said.', 'He said he was not going.'],
            ['"Call me tomorrow," she said.', 'She asked me to call her the next day.']
        ]
    },

    {
        id: 'dr-numeros',
        nome: 'Números, datas e valores em voz alta',
        foco: 'Ninguém fala número devagar. Você precisa produzir automático.',
        instrucao: 'Ouça o número e diga a frase completa em voz alta.',
        modelo: '1,250,000 → one million two hundred fifty thousand',
        itens: [
            ['R$ 1.250.000', 'one million two hundred fifty thousand reais'],
            ['3/4', 'three quarters'],
            ['0.75%', 'zero point seven five percent'],
            ['15/03/2024', 'March fifteenth, twenty twenty-four'],
            ['1998', 'nineteen ninety-eight'],
            ['2005', 'two thousand five'],
            ['$19.99', 'nineteen ninety-nine'],
            ['7:45 a.m.', 'a quarter to eight in the morning'],
            ['+55 11 98765-4321', 'plus five five, one one, nine eight seven six five, four three two one'],
            ['2/3 of the team', 'two thirds of the team']
        ]
    },

    {
        id: 'dr-cortar',
        nome: 'Dizer o mesmo com metade das palavras',
        foco: 'Fluência não é falar muito: é chegar rápido ao ponto.',
        instrucao: 'Ouça a frase enrolada e devolva a versão enxuta.',
        modelo: 'I would like to take this opportunity to say... → I want to say...',
        itens: [
            ['I would like to take this opportunity to thank you.', 'Thanks for this.'],
            ['Due to the fact that we are late...', 'Since we are late...'],
            ['In order to be able to finish...', 'To finish...'],
            ['At this point in time we are not able to.', "We can't right now."],
            ['I am writing to inform you that the meeting is cancelled.', 'The meeting is cancelled.'],
            ['It is my personal opinion that we should wait.', 'I think we should wait.'],
            ['There is a possibility that it may rain.', 'It might rain.'],
            ['We have made the decision to postpone.', "We've decided to postpone."]
        ]
    },

    {
        id: 'dr-linking',
        nome: 'Grudar as palavras de propósito',
        foco: 'Produzir a fala conectada que você precisa aprender a ouvir.',
        instrucao: 'Ouça a frase escrita e diga a versão conectada, rápido.',
        modelo: 'What are you going to do? → Whaddaya gonna do?',
        itens: [
            ['What are you going to do?', 'Whaddaya gonna do?'],
            ['I have to get out of here.', 'I hafta gedoudda here.'],
            ['Did you eat yet?', 'Djeet yet?'],
            ['Let me give you a call.', 'Lemme gichya a call.'],
            ['I do not know what it is.', 'I dunno whadidiz.'],
            ['Come on, get up.', 'C-mon, gedup.'],
            ['A lot of it is out of date.', 'A lodda-vit-iz oudda date.'],
            ['Would you like a bit of water?', 'Wudja like a bidda wader?']
        ]
    },

    {
        id: 'dr-artigos',
        nome: 'A, AN, THE ou nada',
        foco: 'Artigo é o erro que mais denuncia estrangeiro em texto e fala.',
        instrucao: 'Ouça a frase incompleta e devolva com o artigo certo (ou sem).',
        modelo: '___ life is hard. → Life is hard.',
        itens: [
            ['___ life is hard.', 'Life is hard.'],
            ['She is ___ engineer.', 'She is an engineer.'],
            ['I go to ___ work by bus.', 'I go to work by bus.'],
            ['___ people in this room are tired.', 'The people in this room are tired.'],
            ['I love ___ Brazilian coffee.', 'I love Brazilian coffee.'],
            ['He is at ___ hospital visiting a friend.', 'He is at the hospital visiting a friend.'],
            ['She plays ___ piano.', 'She plays the piano.'],
            ['We had ___ dinner at eight.', 'We had dinner at eight.'],
            ['This is ___ best option.', 'This is the best option.'],
            ['I need ___ advice.', 'I need advice.']
        ]
    },

    {
        id: 'dr-preposicoes',
        nome: 'Preposição que não se traduz',
        foco: 'Combinações fixas: decorar em bloco, não por lógica.',
        instrucao: 'Ouça e complete com a preposição certa.',
        modelo: 'It depends ___ you. → It depends on you.',
        itens: [
            ['It depends ___ you.', 'It depends on you.'],
            ['I am good ___ math.', 'I am good at math.'],
            ['She is married ___ a doctor.', 'She is married to a doctor.'],
            ['We arrived ___ the airport.', 'We arrived at the airport.'],
            ['I am interested ___ the role.', 'I am interested in the role.'],
            ['He is responsible ___ the team.', 'He is responsible for the team.'],
            ['Congratulations ___ your promotion.', 'Congratulations on your promotion.'],
            ['I apologize ___ the delay.', 'I apologize for the delay.'],
            ['She is worried ___ the deadline.', 'She is worried about the deadline.'],
            ['This is different ___ that.', 'This is different from that.']
        ]
    },

    {
        id: 'dr-stress',
        nome: 'Mesma palavra, acento diferente, sentido diferente',
        foco: 'Substantivo tem acento na primeira sílaba; verbo, na segunda.',
        instrucao: 'Ouça a classe da palavra e diga a frase com o acento certo.',
        modelo: 'PREsent (substantivo) × preSENT (verbo)',
        itens: [
            ['present — substantivo', 'I got a PREsent.'],
            ['present — verbo', "I'll preSENT the results."],
            ['record — substantivo', 'We broke the REcord.'],
            ['record — verbo', 'Let me reCORD this call.'],
            ['increase — substantivo', 'There was an INcrease in sales.'],
            ['increase — verbo', 'We need to inCREASE sales.'],
            ['object — substantivo', "That's a strange OBject."],
            ['object — verbo', 'I obJECT to that.'],
            ['contract — substantivo', 'Sign the CONtract.'],
            ['produce — verbo', 'We proDUCE two tons a day.']
        ]
    },

    {
        id: 'dr-small-talk',
        nome: 'Devolver a bola no small talk',
        foco: 'Responder e perguntar de volta, sempre. Resposta seca mata a conversa.',
        instrucao: 'Ouça a pergunta e responda com detalhe + pergunta de volta.',
        modelo: 'How was your weekend? → Pretty good — took the kids to the beach. How about you?',
        itens: [
            ['How was your weekend?', 'Pretty good — I took the kids to the beach. How about you?'],
            ['How is work going?', "Busy, but the good kind of busy. You still on the same project?"],
            ['Is it your first time here?', "It is, actually. Any place I shouldn't miss?"],
            ['How do you like the city?', "Honestly? Colder than I expected. How long have you lived here?"],
            ['Did you watch the game?', "Only the second half — what a finish. Are you a fan?"],
            ['Any plans for the holidays?', "Nothing fancy — family stuff, mostly. You going anywhere?"],
            ['How was the flight?', 'Long, but I slept most of it. Have you done that route before?'],
            ['What do you do?', "I run logistics for a delivery company. What about you?"]
        ]
    }
];
