/* =========================================================
   Shadowing — parte 3: as oito que faltavam para o ano.

   O currículo é de 48 semanas com uma passagem por semana. Com
   quarenta, oito semanas repetiam material já visto. Estas
   fecham o calendário e puxam a velocidade para cima: as
   últimas estão em 165 wpm, que é rádio americano de verdade.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.shadowing = (F.data.shadowing || []).concat([

    {
        id: 'sh-ligacao-ruim',
        titulo: 'Ligação com sinal ruim',
        nivel: 2,
        tema: 'telefone',
        wpm: 135,
        foco: 'Frases curtas de reparo — o que se diz quando a ligação cai.',
        linhas: [
            { en: "Sorry, you're breaking up — can you say that again?", pt: 'Desculpa, está cortando — pode repetir?', forte: "SOR-ry, you're BREAK-ing UP — can you SAY that a-GAIN?", soa: "Sorry, yer breakin up — kenya say thad again?" },
            { en: "I lost you for a second there.", pt: 'Te perdi por um segundo aí.', forte: "I LOST you for a SE-cond THERE.", soa: "I lostchoo fer a seckn there." },
            { en: "Let me move — the signal's terrible in this room.", pt: 'Deixa eu mudar de lugar — o sinal é péssimo nessa sala.', forte: "Let me MOVE — the SIG-nal's TER-rible in this ROOM.", soa: "Lemme move — the signals terr'bl in this room." },
            { en: "Is that better? Can you hear me now?", pt: 'Melhorou? Está me ouvindo agora?', forte: "Is that BET-ter? Can you HEAR me NOW?", soa: "Izzat bedder? Kenya hear me now?" },
            { en: "Okay, go ahead — I've got you.", pt: 'Certo, pode falar — estou te ouvindo.', forte: "O-KAY, GO a-HEAD — I've GOT you.", soa: "Okay, go ahead — I've gotchoo." },
            { en: "If we get cut off again, I'll just call you right back.", pt: 'Se cair de novo, eu te ligo de volta.', forte: "If we get CUT OFF a-GAIN, I'll just CALL you right BACK.", soa: "If we get cudoff again, I'll just call ya right back." }
        ]
    },
    {
        id: 'sh-contando-historia',
        titulo: 'Contando o que aconteceu ontem',
        nivel: 2,
        tema: 'narrativa',
        wpm: 140,
        foco: 'Passado narrado com conectores de fala: so, then, anyway.',
        linhas: [
            { en: "So I got there twenty minutes early, like an idiot.", pt: 'Então cheguei vinte minutos antes, feito um idiota.', forte: "So I GOT there TWEN-ty minutes EAR-ly, like an ID-iot.", soa: "So I go'there twenny minnits early, likan idiot." },
            { en: "And of course nobody else showed up until nine.", pt: 'E claro que ninguém apareceu antes das nove.', forte: "And of COURSE NO-body else SHOWED UP un-TIL NINE.", soa: "Ndof course nobody else showd up until nine." },
            { en: "Then the guy tells me the meeting was moved.", pt: 'Aí o cara me diz que a reunião foi remarcada.', forte: "THEN the GUY TELLS me the MEET-ing was MOVED.", soa: "Then the guy tells me the meedin was moovd." },
            { en: "I mean, would it kill them to send an email?", pt: 'Quer dizer, custava mandar um e-mail?', forte: "I MEAN, would it KILL them to SEND an E-mail?", soa: "I mean, would it kill'm ta sendn email?" },
            { en: "Anyway, I ended up working from the coffee shop.", pt: 'Enfim, acabei trabalhando do café.', forte: "AN-y-way, I END-ed UP WORK-ing from the COF-fee SHOP.", soa: "Ennyway, I endedup workin frm the coffee shop." },
            { en: "Best two hours I've had all week, honestly.", pt: 'Melhores duas horas da semana, sinceramente.', forte: "BEST TWO HOURS I've had ALL WEEK, HON-est-ly.", soa: "Best two ourz I've had all week, onnestly." }
        ]
    },
    {
        id: 'sh-instrucoes',
        titulo: 'Explicando como se faz, passo a passo',
        nivel: 2,
        tema: 'instrução',
        wpm: 130,
        foco: 'Imperativo suave e a redução de "you" em "d\'you".',
        linhas: [
            { en: "First thing you want to do is turn it off completely.", pt: 'A primeira coisa é desligar completamente.', forte: "FIRST thing you WANT to DO is TURN it OFF com-PLETE-ly.", soa: "First thing ya wanna do is turnid off cmpletely." },
            { en: "Give it about ten seconds — don't rush it.", pt: 'Espere uns dez segundos — sem pressa.', forte: "GIVE it a-BOUT TEN SE-conds — DON'T RUSH it.", soa: "Givid abaout ten seckns — don't rushit." },
            { en: "Then hold the button until the light turns green.", pt: 'Aí segure o botão até a luz ficar verde.', forte: "THEN HOLD the BUT-ton un-TIL the LIGHT turns GREEN.", soa: "Then hold the buddn until the light turns green." },
            { en: "If it starts blinking, you did it too fast.", pt: 'Se começar a piscar, você fez rápido demais.', forte: "If it STARTS BLINK-ing, you DID it TOO FAST.", soa: "Ifit starts blinkin, ya didit too fast." },
            { en: "Once it's green, you're good to go.", pt: 'Quando ficar verde, está pronto.', forte: "ONCE it's GREEN, you're GOOD to GO.", soa: "Wunsits green, yer good ta go." },
            { en: "Any questions before you try it yourself?", pt: 'Alguma dúvida antes de tentar sozinho?', forte: "AN-y QUES-tions be-FORE you TRY it your-SELF?", soa: "Enny queschns bfore ya try it yerself?" }
        ]
    },
    {
        id: 'sh-discordando-educado',
        titulo: 'Discordando com jeito numa reunião',
        nivel: 3,
        tema: 'reunião',
        wpm: 145,
        foco: 'Suavizadores encadeados sem perder firmeza.',
        linhas: [
            { en: "I see it a little differently, if that's alright.", pt: 'Eu vejo um pouco diferente, se puder.', forte: "I SEE it a LIT-tle DIF-ferent-ly, if THAT'S al-RIGHT.", soa: "I see id a liddle diffrntly, if thats alright." },
            { en: "My worry is that we're solving the wrong problem.", pt: 'Minha preocupação é que estamos resolvendo o problema errado.', forte: "My WOR-ry is that we're SOLV-ing the WRONG PROB-lem.", soa: "My worry izzat we'r solvin the wrong problm." },
            { en: "Not that the plan is bad — it's just early.", pt: 'Não que o plano seja ruim — é só cedo.', forte: "NOT that the PLAN is BAD — it's JUST EAR-ly.", soa: "Nod thet the plan iz bad — its just early." },
            { en: "Could we test it with one team before we commit?", pt: 'Podemos testar com um time antes de assumir?', forte: "Could we TEST it with ONE TEAM be-FORE we com-MIT?", soa: "Could we testit with wun team bfore we cmmit?" },
            { en: "That way, if I'm wrong, it costs us a week.", pt: 'Assim, se eu estiver errado, custa uma semana.', forte: "THAT WAY, if I'm WRONG, it COSTS us a WEEK.", soa: "That way, if I'm wrong, it costsus a week." },
            { en: "I'd rather be wrong now than in production.", pt: 'Prefiro estar errado agora do que em produção.', forte: "I'd RA-ther be WRONG NOW than in pro-DUC-tion.", soa: "I'd rather be wrong now thanin prduction." }
        ]
    },
    {
        id: 'sh-mau-humor',
        titulo: 'Reclamando de um dia ruim',
        nivel: 3,
        tema: 'desabafo',
        wpm: 150,
        foco: 'Fala rápida e emocional, com contrações coladas.',
        linhas: [
            { en: "Don't even ask. It's been one of those days.", pt: 'Nem pergunta. Foi um daqueles dias.', forte: "DON'T even ASK. It's BEEN ONE of THOSE DAYS.", soa: "Don't even ask. Its bin wunna those days." },
            { en: "Everything that could go wrong basically did.", pt: 'Tudo que podia dar errado deu.', forte: "EV-ery-thing that could go WRONG BA-sic-ally DID.", soa: "Evrything thet could go wrong basiclly did." },
            { en: "I haven't even had lunch and it's almost four.", pt: 'Nem almocei e são quase quatro.', forte: "I HAVEN'T even had LUNCH and it's AL-most FOUR.", soa: "I havn't even had lunch nits almost four." },
            { en: "You know what? I'm just going to go home.", pt: 'Quer saber? Vou embora pra casa.', forte: "You KNOW WHAT? I'm JUST going to go HOME.", soa: "Ya know what? I'm just gonna go home." },
            { en: "Tomorrow's another day and I'll deal with it then.", pt: 'Amanhã é outro dia e eu resolvo então.', forte: "To-MOR-row's an-O-ther DAY and I'll DEAL with it THEN.", soa: "Tmorrow's anuther day nd I'll deal widit then." },
            { en: "Right now I need food and about ten hours of sleep.", pt: 'Agora eu preciso de comida e umas dez horas de sono.', forte: "RIGHT NOW I need FOOD and a-BOUT TEN HOURS of SLEEP.", soa: "Right now I need food nd abaout ten ourz uv sleep." }
        ]
    },
    {
        id: 'sh-negociando',
        titulo: 'Fechando um acordo',
        nivel: 3,
        tema: 'negociação',
        wpm: 150,
        foco: 'Condicionais rápidas: if you can, we can.',
        linhas: [
            { en: "Here's where I think we can land on this.", pt: 'É aqui que eu acho que a gente fecha.', forte: "HERE'S where I THINK we can LAND on THIS.", soa: "Heerz where I think we cn landon this." },
            { en: "If you can move on the timeline, I can move on the price.", pt: 'Se você ceder no prazo, eu cedo no preço.', forte: "If you can MOVE on the TIME-line, I can MOVE on the PRICE.", soa: "Ifya cn moovon the timeline, I cn moovon the price." },
            { en: "That's about as far as I can go, honestly.", pt: 'É até onde eu consigo ir, sinceramente.', forte: "That's a-BOUT as FAR as I can GO, HON-est-ly.", soa: "Thats abaoud az far az I cn go, onnestly." },
            { en: "I'd rather we both walk away happy than squeeze this.", pt: 'Prefiro os dois saírem satisfeitos a espremer isso.', forte: "I'd RA-ther we BOTH WALK a-WAY HAP-py than SQUEEZE this.", soa: "I'd rather we both walk away happy thn squeeze this." },
            { en: "Take a day, think it over, let me know Thursday.", pt: 'Pense um dia, me diga na quinta.', forte: "TAKE a DAY, THINK it O-ver, LET me KNOW THURS-day.", soa: "Take a day, thinkid over, lemme know thursdy." },
            { en: "Either way, I appreciate you being straight with me.", pt: 'De qualquer forma, agradeço a franqueza.', forte: "EI-ther WAY, I ap-PRE-ciate you being STRAIGHT with me.", soa: "Eether way, I appreeshiate ya bein straight with me." }
        ]
    },
    {
        id: 'sh-noticia-radio',
        titulo: 'Notícia de rádio em velocidade real',
        nivel: 4,
        tema: 'mídia',
        wpm: 165,
        foco: 'Velocidade de locutor: grupos de sentido, não palavras.',
        linhas: [
            { en: "City officials said the repairs will begin early next month.", pt: 'Autoridades disseram que os reparos começam no início do mês que vem.', forte: "CI-ty of-FI-cials SAID the re-PAIRS will be-GIN EAR-ly NEXT MONTH.", soa: "Cidy offishls sed the repairs'll begin early next munth." },
            { en: "Drivers are being asked to avoid the area if possible.", pt: 'Pede-se aos motoristas que evitem a área se possível.', forte: "DRI-vers are being ASKED to a-VOID the AR-ea if POS-sible.", soa: "Drivers'r bein askt ta avoyd the airia if possbl." },
            { en: "The project is expected to take about eighteen months.", pt: 'O projeto deve levar cerca de dezoito meses.', forte: "The PRO-ject is ex-PECT-ed to TAKE a-BOUT eigh-TEEN MONTHS.", soa: "The project's expected ta take abaout eighteen munths." },
            { en: "Meanwhile, residents have raised concerns about noise.", pt: 'Enquanto isso, moradores levantaram preocupações com barulho.', forte: "MEAN-while, RE-si-dents have RAISED con-CERNS a-bout NOISE.", soa: "Meanwhile, rezidnts've raizd cncerns abaout noyz." },
            { en: "A public meeting is scheduled for Thursday evening.", pt: 'Uma reunião pública está marcada para quinta à noite.', forte: "A PUB-lic MEET-ing is SCHED-uled for THURS-day EVE-ning.", soa: "A publik meedin's skejuld fer thursdy eevning." },
            { en: "We'll have more on that story as it develops.", pt: 'Teremos mais sobre essa história conforme se desenvolve.', forte: "We'll have MORE on that STO-ry as it de-VEL-ops.", soa: "We'll have more on that story azit dvelops." }
        ]
    },
    {
        id: 'sh-podcast-opiniao',
        titulo: 'Podcast: opinião em velocidade de conversa real',
        nivel: 4,
        tema: 'opinião',
        wpm: 165,
        foco: 'Discurso corrido com autocorreção — como as pessoas realmente falam.',
        linhas: [
            { en: "I think — and I could be totally wrong about this —", pt: 'Eu acho — e posso estar completamente errado —', forte: "I THINK — and I could be TO-tal-ly WRONG a-bout this —", soa: "I think — nd I could be todally wrong abaout this —" },
            { en: "we're way too focused on the tools and not the habit.", pt: 'estamos focados demais nas ferramentas e não no hábito.', forte: "we're WAY TOO FO-cused on the TOOLS and NOT the HA-bit.", soa: "we'r way too focust on the tools nd not the habit." },
            { en: "Like, you can have the best app in the world, right?", pt: 'Tipo, você pode ter o melhor app do mundo, né?', forte: "LIKE, you can have the BEST APP in the WORLD, RIGHT?", soa: "Like, ya cn have the best app inna world, right?" },
            { en: "But if you only open it twice a month, what's the point?", pt: 'Mas se você só abre duas vezes por mês, qual o sentido?', forte: "But if you ON-ly O-pen it TWICE a MONTH, what's the POINT?", soa: "Budif ya only open it twicea munth, whats the point?" },
            { en: "The people who actually get there are boring about it.", pt: 'As pessoas que realmente chegam lá são chatas sobre isso.', forte: "The PEO-ple who AC-tual-ly GET there are BOR-ing a-bout it.", soa: "The peeple hoo akshlly get there'r boring abaoudit." },
            { en: "Same time, every day, whether they feel like it or not.", pt: 'Mesma hora, todo dia, com ou sem vontade.', forte: "SAME TIME, EV-ery DAY, WHE-ther they FEEL like it or NOT.", soa: "Same time, evry day, whether they feel likit or not." }
        ]
    }
]);
