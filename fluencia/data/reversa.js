/* =========================================================
   Tradução reversa — o português sai, o inglês entra.

   O método é antigo e é dos tradutores: você recebe a frase em
   português, produz a versão em inglês e SÓ ENTÃO compara com a
   referência. O valor não está na nota — está na distância entre
   o que você disse e o que está ali. É nessa distância que
   aparece, escrita, a estrutura do português vazando.

   Por isso cada frase traz uma ARMADILHA: o que o brasileiro
   costuma produzir aqui, e por quê. Sem isso o exercício vira
   adivinhação; com isso vira diagnóstico.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.reversa = [

    /* ---------- nível 1: as estruturas que todo mundo erra ---------- */
    {
        pt: 'Eu moro aqui há três anos.', nivel: 1,
        en: "I've lived here for three years.",
        alt: "I've been living here for three years.",
        armadilha: '"I live here since three years." O português usa presente + há; o inglês exige present perfect + FOR (período) ou SINCE (marco: since 2023).'
    },
    {
        pt: 'Eu tenho 34 anos.', nivel: 1,
        en: "I'm 34 years old.",
        alt: "I'm 34.",
        armadilha: '"I have 34 years." Idade em inglês é com TO BE, não com TER. É o erro número um do brasileiro.'
    },
    {
        pt: 'Estou com fome.', nivel: 1,
        en: "I'm hungry.",
        alt: "I'm starving.",
        armadilha: '"I am with hunger." Estado em inglês é adjetivo com TO BE: hungry, thirsty, cold, sleepy, scared.'
    },
    {
        pt: 'Faz muito tempo que não vejo ele.', nivel: 1,
        en: "I haven't seen him in a long time.",
        alt: "It's been ages since I last saw him.",
        armadilha: '"Makes a long time that I don\'t see him." A construção "faz X que não" vira present perfect negativo + IN/FOR.'
    },
    {
        pt: 'Eu preciso te contar uma coisa.', nivel: 1,
        en: "I need to tell you something.",
        alt: "There's something I need to tell you.",
        armadilha: '"I need to count you a thing." CONTAR de narrar é TELL; contar número é COUNT. E "uma coisa" aqui é SOMETHING.'
    },
    {
        pt: 'Você pode me explicar isso?', nivel: 1,
        en: "Can you explain this to me?",
        alt: "Could you walk me through this?",
        armadilha: '"Can you explain me this?" EXPLAIN nunca leva a pessoa colada: explain something TO someone.'
    },
    {
        pt: 'Depende do cliente.', nivel: 1,
        en: "It depends on the client.",
        alt: "That depends on the client.",
        armadilha: '"It depends of the client." Preposição fixa: depend ON. E o inglês exige o sujeito IT.'
    },
    {
        pt: 'Eu concordo com você.', nivel: 1,
        en: "I agree with you.",
        alt: "You have a point.",
        armadilha: '"I am agree with you." AGREE já é verbo — não leva TO BE.'
    },
    {
        pt: 'As pessoas estão atrasadas.', nivel: 1,
        en: "People are late.",
        alt: "Everyone is running late.",
        armadilha: '"The people is late." PEOPLE é plural em inglês, sempre: people ARE.'
    },
    {
        pt: 'Eu tenho uma dúvida.', nivel: 1,
        en: "I have a question.",
        alt: "Quick question:",
        armadilha: '"I have a doubt." DOUBT é desconfiança ("I doubt he\'ll come"). Dúvida de quem quer saber é QUESTION.'
    },
    {
        pt: 'Ontem eu fui ao médico.', nivel: 1,
        en: "I went to the doctor yesterday.",
        alt: "I saw a doctor yesterday.",
        armadilha: '"Yesterday I have gone to the doctor." Momento definido no passado pede past simple, nunca present perfect.'
    },
    {
        pt: 'Eu esqueci a minha carteira em casa.', nivel: 1,
        en: "I left my wallet at home.",
        alt: "I forgot my wallet.",
        armadilha: '"I forgot my wallet at home." Com o lugar dito, o inglês usa LEAVE; FORGET vem sozinho, sem lugar.'
    },
    {
        pt: 'Ele me disse que ia chegar tarde.', nivel: 1,
        en: "He told me he was going to be late.",
        alt: "He said he'd be late.",
        armadilha: '"He said me..." SAY não leva a pessoa direto (say TO me); TELL leva (tell me). São dois verbos diferentes.'
    },
    {
        pt: 'Eu gosto muito de trabalhar aqui.', nivel: 1,
        en: "I really like working here.",
        alt: "I love working here.",
        armadilha: '"I like very much to work here." VERY MUCH não vai no meio; use REALLY antes do verbo, ou jogue "very much" para o fim.'
    },
    {
        pt: 'Nós fomos de carro até a praia.', nivel: 1,
        en: "We drove to the beach.",
        alt: "We took the car to the beach.",
        armadilha: '"We went of car to the beach." O inglês prefere o verbo do meio de transporte: drive, fly, walk, take the bus.'
    },
    {
        pt: 'Me avisa quando você chegar.', nivel: 1,
        en: "Let me know when you get there.",
        alt: "Text me when you arrive.",
        armadilha: '"Warn me when you arrive." WARN é alertar de perigo. Avisar no sentido de informar é LET SOMEONE KNOW.'
    },
    {
        pt: 'Eu estou esperando há vinte minutos.', nivel: 1,
        en: "I've been waiting for twenty minutes.",
        alt: "I've been here for twenty minutes.",
        armadilha: '"I am waiting since twenty minutes." Ação que começou antes e continua: present perfect continuous + FOR.'
    },
    {
        pt: 'Que horas são?', nivel: 1,
        en: "What time is it?",
        alt: "Do you have the time?",
        armadilha: '"What hours are?" A pergunta em inglês é singular e precisa do sujeito IT.'
    },
    {
        pt: 'Eu não sei o que dizer.', nivel: 1,
        en: "I don't know what to say.",
        alt: "I'm at a loss for words.",
        armadilha: '"I don\'t know what say." Depois de "what" vem TO + verbo quando não há sujeito.'
    },
    {
        pt: 'A reunião foi adiada para sexta.', nivel: 1,
        en: "The meeting was pushed to Friday.",
        alt: "They moved the meeting to Friday.",
        armadilha: '"The meeting was anticipated to Friday." ANTICIPATE é prever, não antecipar data. Adiar é postpone / push back / move.'
    },
    {
        pt: 'Eu trabalho numa empresa de logística.', nivel: 1,
        en: "I work for a logistics company.",
        alt: "I'm in logistics.",
        armadilha: '"I work in a company of logistics." Em inglês o adjunto vem antes: a logistics company. E trabalha-se FOR uma empresa.'
    },
    {
        pt: 'Você já almoçou?', nivel: 1,
        en: "Have you had lunch yet?",
        alt: "Did you eat yet?",
        armadilha: '"You already lunched?" LUNCH quase não é verbo; use HAVE LUNCH, e ALREADY vira YET na pergunta.'
    },
    {
        pt: 'Estou indo para casa.', nivel: 1,
        en: "I'm going home.",
        alt: "I'm heading home.",
        armadilha: '"I\'m going to home." HOME não leva preposição depois de GO. Vale também: go there, go abroad.'
    },
    {
        pt: 'Eu tenho que acordar cedo amanhã.', nivel: 1,
        en: "I have to get up early tomorrow.",
        alt: "I've got an early start tomorrow.",
        armadilha: '"I have that wake up early." "Ter que" é HAVE TO — o TO é obrigatório e não é "that".'
    },
    {
        pt: 'Ela ainda não respondeu.', nivel: 1,
        en: "She hasn't answered yet.",
        alt: "I still haven't heard back from her.",
        armadilha: '"She still didn\'t answer." "Ainda não" com efeito no presente é present perfect + YET no fim.'
    },
    {
        pt: 'Eu vou fazer uma pergunta.', nivel: 1,
        en: "I'm going to ask a question.",
        alt: "Let me ask you something.",
        armadilha: '"I will make a question." Pergunta se PEDE (ask), não se faz. E aqui o futuro planejado é going to.'
    },
    {
        pt: 'Custa quanto?', nivel: 1,
        en: "How much is it?",
        alt: "How much does it cost?",
        armadilha: '"Costs how much?" O inglês não deixa a pergunta no fim: a palavra interrogativa abre a frase.'
    },
    {
        pt: 'Eu me formei em 2019.', nivel: 1,
        en: "I graduated in 2019.",
        alt: "I finished college in 2019.",
        armadilha: '"I formed me in 2019." GRADUATE não é reflexivo em inglês, e o "me" não existe ali.'
    },
    {
        pt: 'Está chovendo muito forte.', nivel: 1,
        en: "It's raining really hard.",
        alt: "It's pouring.",
        armadilha: '"Is raining very strong." Falta o IT (o inglês nunca deixa o sujeito vazio) e chuva é HARD, não STRONG.'
    },
    {
        pt: 'Eu prefiro café a chá.', nivel: 1,
        en: "I prefer coffee to tea.",
        alt: "I'd rather have coffee than tea.",
        armadilha: '"I prefer coffee than tea." Com PREFER a preposição é TO; THAN só aparece com "would rather".'
    },
    {
        pt: 'Nos vemos amanhã.', nivel: 1,
        en: "See you tomorrow.",
        alt: "Catch you tomorrow.",
        armadilha: '"We see us tomorrow." A despedida em inglês é fixa e sem sujeito: See you.'
    },
    {
        pt: 'Eu não estou entendendo.', nivel: 1,
        en: "I don't understand.",
        alt: "You've lost me.",
        armadilha: '"I am not understanding." Verbos de estado mental (understand, know, want, need) não vão para o contínuo.'
    },
    {
        pt: 'Ele é muito bem-educado.', nivel: 1,
        en: "He has very good manners.",
        alt: "He's very polite.",
        armadilha: '"He is very educated." EDUCATED é escolaridade. Boa educação de comportamento é manners / polite.'
    },
    {
        pt: 'Você trouxe o documento?', nivel: 1,
        en: "Did you bring the document?",
        alt: "Have you got the document with you?",
        armadilha: '"You brought the document?" Sem o DID a frase soa como estrangeiro; a pergunta em inglês exige o auxiliar.'
    },
    {
        pt: 'Vou pensar sobre isso.', nivel: 1,
        en: "I'll think about it.",
        alt: "Let me think it over.",
        armadilha: '"I go think about it." Futuro de decisão na hora é WILL, e não existe "go + verbo" sem TO.'
    },
    {
        pt: 'Faz frio aqui dentro.', nivel: 1,
        en: "It's cold in here.",
        alt: "It's freezing in here.",
        armadilha: '"Makes cold here inside." Tempo e temperatura pedem IT + BE. FAZER não entra.'
    },
    {
        pt: 'Ela nasceu em Salvador.', nivel: 1,
        en: "She was born in Salvador.",
        alt: "She's from Salvador.",
        armadilha: '"She born in Salvador." Nascer em inglês é passivo: WAS BORN. Ninguém "borns".'
    },
    {
        pt: 'Eu tenho medo de avião.', nivel: 1,
        en: "I'm afraid of flying.",
        alt: "I'm scared of planes.",
        armadilha: '"I have fear of airplane." Medo é adjetivo com TO BE, e o inglês prefere a ação (flying) ao objeto.'
    },
    {
        pt: 'Deu tudo certo no fim.', nivel: 1,
        en: "It all worked out in the end.",
        alt: "Everything turned out fine.",
        armadilha: '"Gave everything right in the end." "Dar certo" é WORK OUT — traduzir DAR ao pé da letra não existe aqui.'
    },
    {
        pt: 'Eu moro sozinho.', nivel: 1,
        en: "I live alone.",
        alt: "I live by myself.",
        armadilha: '"I live only." SOZINHO é alone / by myself; ONLY é "somente".'
    },
    {
        pt: 'Pode deixar comigo.', nivel: 1,
        en: "I'll take care of it.",
        alt: "Leave it with me.",
        armadilha: '"Can leave with me." A frase feita brasileira não traduz palavra a palavra; a equivalente natural é I\'ll take care of it.'
    },
    {
        pt: 'Quanto tempo você fica em São Paulo?', nivel: 1,
        en: "How long are you staying in São Paulo?",
        alt: "How long will you be in São Paulo?",
        armadilha: '"How much time you stay?" Duração é HOW LONG, e planos futuros usam o presente contínuo.'
    },
    {
        pt: 'Eu acabei de chegar.', nivel: 1,
        en: "I've just arrived.",
        alt: "I just got here.",
        armadilha: '"I finished to arrive." "Acabar de" é JUST + present perfect, não o verbo FINISH.'
    },
    {
        pt: 'Ele mora com os pais.', nivel: 1,
        en: "He lives with his parents.",
        alt: "He still lives at home.",
        armadilha: '"He lives with the parents." O inglês exige o possessivo: HIS parents, MY car, YOUR hands.'
    },
    {
        pt: 'Isso não faz sentido.', nivel: 1,
        en: "That doesn't make sense.",
        alt: "I'm not following.",
        armadilha: '"This don\'t make sense." Terceira pessoa no negativo é DOESN\'T — o S sai do verbo e entra no auxiliar.'
    },
    {
        pt: 'Eu vim de ônibus.', nivel: 1,
        en: "I came by bus.",
        alt: "I took the bus.",
        armadilha: '"I came of bus." Meio de transporte é BY + substantivo sem artigo, ou TAKE THE bus.'
    }
];
