/* =========================================================
   Shadowing — repetir POR CIMA do modelo, com meio segundo
   de atraso, sem esperar a frase acabar.

   É o exercício que mais muda sotaque em pouco tempo, porque
   força boca e ouvido a trabalharem juntos, em tempo real,
   sem tradução no meio.

   Cada linha tem:
     en    o texto
     pt    o sentido (só para conferir, não para traduzir na hora)
     forte a mesma frase com as sílabas de BATIDA em maiúscula
     soa   como sai na boca de um nativo em velocidade normal
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.shadowing = [

    {
        id: 'sh-apresentacao',
        titulo: 'Me apresentando sem parecer currículo',
        nivel: 1,
        tema: 'apresentação pessoal',
        wpm: 120,
        foco: 'Ritmo básico e redução de "to" e "of".',
        linhas: [
            { en: "Hi, I'm Rodrigo — nice to meet you.", pt: 'Oi, sou o Rodrigo — prazer.', forte: "HI, I'm ro-DRI-go — NICE to MEET you.", soa: "Hi, I'm Rodrigo — nice-ta MEECHoo." },
            { en: "I'm originally from Salvador, but I live in São Paulo now.", pt: 'Sou de Salvador, mas moro em São Paulo agora.', forte: "I'm o-RI-ginally from SAL-vador, but I LIVE in São PAU-lo NOW.", soa: "I'm ORIGinally frm Salvador, budai LIVin São Paulo now." },
            { en: "I work in logistics — mostly planning and operations.", pt: 'Trabalho com logística — mais planejamento e operações.', forte: "I WORK in lo-GIS-tics — MOST-ly PLAN-ning and o-per-A-tions.", soa: "I work in lojistics — mostly planning'n operations." },
            { en: "I've been doing this for about eight years.", pt: 'Faço isso há uns oito anos.', forte: "I've been DO-ing this for a-BOUT EIGHT YEARS.", soa: "I've bin doo'in this fer'baout eight years." },
            { en: "Outside of work, I'm really into cycling.", pt: 'Fora do trabalho, curto muito ciclismo.', forte: "Out-SIDE of WORK, I'm REAL-ly IN-to CY-cling.", soa: "Outsida work, I'm really intu cycling." },
            { en: "What about you? What do you do?", pt: 'E você? Trabalha com o quê?', forte: "What a-BOUT YOU? What do you DO?", soa: "Whaddabout you? Whaddaya do?" }
        ]
    },

    {
        id: 'sh-rotina',
        titulo: 'A minha rotina (sem soar como livro didático)',
        nivel: 1,
        tema: 'dia a dia',
        wpm: 125,
        foco: 'Present simple com advérbios e a redução de "and" e "at".',
        linhas: [
            { en: "My day usually starts around six thirty.", pt: 'Meu dia normalmente começa por volta das seis e meia.', forte: "My DAY U-sually STARTS a-ROUND SIX THIR-ty.", soa: "My day yoozhly starts uround six thirdy." },
            { en: "I make coffee and check my messages before anyone else is up.", pt: 'Faço café e vejo minhas mensagens antes de todo mundo acordar.', forte: "I MAKE COF-fee and CHECK my MES-sages be-FORE AN-yone ELSE is UP.", soa: "I make coffee'n check my messages b'for anyone elsiz up." },
            { en: "Then it's straight into meetings — usually back to back.", pt: 'Aí é direto para as reuniões — geralmente emendadas.', forte: "THEN it's STRAIGHT IN-to MEET-ings — U-sually BACK to BACK.", soa: "Thenits straight intu meetings — yoozhly backtaback." },
            { en: "I try to block out an hour for deep work in the afternoon.", pt: 'Tento reservar uma hora para trabalho concentrado à tarde.', forte: "I TRY to BLOCK OUT an HOUR for DEEP WORK in the af-ter-NOON.", soa: "I try da block oud'n our fer deep work inthee afternoon." },
            { en: "By seven I'm done — I shut the laptop and don't look at it again.", pt: 'Às sete eu paro — fecho o notebook e não olho mais.', forte: "By SE-ven I'm DONE — I SHUT the LAP-top and DON'T LOOK at it a-GAIN.", soa: "By sevn I'm dun — I shudda laptop'n don't lookadit again." }
        ]
    },

    {
        id: 'sh-cafe',
        titulo: 'Conversa de corredor',
        nivel: 1,
        tema: 'small talk',
        wpm: 135,
        foco: 'Contrações e o "gonna / wanna" natural.',
        linhas: [
            { en: "Hey, how's it going? Long time no see.", pt: 'Oi, como vai? Quanto tempo.', forte: "HEY, HOW's it GO-ing? LONG TIME no SEE.", soa: "Hey, howzit go'in? Long time no see." },
            { en: "Yeah, it's been crazy — we're launching next month.", pt: 'É, tem sido loucura — a gente lança mês que vem.', forte: "YEAH, it's been CRA-zy — we're LAUN-ching NEXT MONTH.", soa: "Yeah, itsbin crazy — wer launching nex month." },
            { en: "You wanna grab a coffee later and catch up?", pt: 'Quer tomar um café mais tarde e colocar o papo em dia?', forte: "You WAN-na GRAB a COF-fee LA-ter and CATCH UP?", soa: "Ya wanna grabba coffee laderan catch up?" },
            { en: "I'm gonna be free after three, I think.", pt: 'Acho que estou livre depois das três.', forte: "I'm GON-na be FREE af-ter THREE, I THINK.", soa: "I'm gunna be free after three, I think." },
            { en: "Sounds good — I'll ping you.", pt: 'Beleza — te chamo.', forte: "SOUNDS GOOD — I'll PING you.", soa: "Soun'z good — al ping ya." }
        ]
    },

    {
        id: 'sh-opiniao-remoto',
        titulo: 'Defendendo uma opinião',
        nivel: 2,
        tema: 'trabalho remoto',
        wpm: 145,
        foco: 'Grupos de sentido e ênfase contrastiva.',
        linhas: [
            { en: "Honestly, I think the whole debate misses the point.", pt: 'Sinceramente, acho que o debate todo erra o alvo.', forte: "HON-estly, I THINK the WHOLE de-BATE MIS-ses the POINT.", soa: "Onestly, I think the hole debate missiz the point." },
            { en: "It's not about where you work — it's about how you work.", pt: 'Não é sobre onde você trabalha — é sobre como você trabalha.', forte: "It's NOT about WHERE you WORK — it's about HOW you WORK.", soa: "It's nod about WHERE ya work — it's about HOW ya work.", nota: 'A ênfase cai em WHERE e HOW: é isso que faz o contraste existir.' },
            { en: "I've seen teams in the same room barely talk to each other.", pt: 'Já vi times na mesma sala mal se falarem.', forte: "I've SEEN TEAMS in the SAME ROOM BARE-ly TALK to each O-ther.", soa: "I've seen teams inthe same room bairly talk deach other." },
            { en: "And I've seen remote teams that are incredibly tight.", pt: 'E já vi times remotos incrivelmente unidos.', forte: "And I've SEEN re-MOTE TEAMS that are in-CRE-dibly TIGHT.", soa: "An I've seen remote teams thadar incredibly tight." },
            { en: "So the answer isn't a policy — it's a habit.", pt: 'Então a resposta não é uma política — é um hábito.', forte: "So the AN-swer ISN'T a PO-licy — it's a HA-bit.", soa: "So the anser isnt a policy — itsa habit." },
            { en: "At least that's how I see it.", pt: 'Pelo menos é assim que eu vejo.', forte: "At LEAST THAT's how I SEE it.", soa: "Atleast thatsow I seeit." }
        ]
    },

    {
        id: 'sh-reuniao',
        titulo: 'Abrindo e conduzindo uma reunião',
        nivel: 2,
        tema: 'trabalho',
        wpm: 150,
        foco: 'Entonação de liderança: descer no fim das frases.',
        linhas: [
            { en: "Alright, let's get started — I know everyone's busy.", pt: 'Certo, vamos começar — sei que todos estão ocupados.', forte: "AL-right, let's get STAR-ted — I KNOW EV-eryone's BU-sy.", soa: "Awright, letsget stardid — I know evryonez bizzy." },
            { en: "Quick recap of where we left off last week.", pt: 'Uma recapitulação rápida de onde paramos semana passada.', forte: "QUICK RE-cap of WHERE we LEFT OFF LAST WEEK.", soa: "Quick reecap uv where we lefdoff last week." },
            { en: "Ana, do you want to walk us through the numbers?", pt: 'Ana, você quer nos guiar pelos números?', forte: "AN-a, do you WANT to WALK us THROUGH the NUM-bers?", soa: "Ana, dya wanna walkus through the numbers?" },
            { en: "Before we move on, does anyone have questions?", pt: 'Antes de seguir, alguém tem perguntas?', forte: "Be-FORE we MOVE ON, does AN-yone have QUES-tions?", soa: "B'for we moovon, duzenyone hav queschins?" },
            { en: "Okay — so the action items are: Ana takes the report, I talk to the vendor.", pt: 'Ok — então as tarefas são: Ana pega o relatório, eu falo com o fornecedor.', forte: "O-KAY — so the AC-tion I-tems ARE: AN-a TAKES the re-PORT, I TALK to the VEN-dor.", soa: "Okay — so the ackshin idems are: Ana takes the report, I talk da the vendor." },
            { en: "Thanks, everyone. I'll send a summary this afternoon.", pt: 'Obrigado a todos. Mando um resumo hoje à tarde.', forte: "THANKS, EV-eryone. I'll SEND a SUM-mary this af-ter-NOON.", soa: "Thanks evryone. Al senda summary this afternoon." }
        ]
    },

    {
        id: 'sh-entrevista',
        titulo: 'Resposta de entrevista com história',
        nivel: 2,
        tema: 'carreira',
        wpm: 150,
        foco: 'Passado simples + present perfect, sem gaguejar na troca.',
        linhas: [
            { en: "Sure — let me give you a concrete example.", pt: 'Claro — deixa eu dar um exemplo concreto.', forte: "SURE — let me GIVE you a con-CRETE ex-AM-ple.", soa: "Shur — lemme giv ya a concreet exampl." },
            { en: "Two years ago we were about to lose our biggest client.", pt: 'Há dois anos estávamos quase perdendo nosso maior cliente.', forte: "TWO YEARS a-GO we were a-BOUT to LOSE our BIG-gest CLI-ent.", soa: "Two years ago we wer'baoutta looz'r biggest client." },
            { en: "Nobody wanted to make the call, so I did.", pt: 'Ninguém queria fazer a ligação, então eu fiz.', forte: "NO-body WAN-ted to MAKE the CALL, so I DID.", soa: "Nobody wanadda make the call, so I did." },
            { en: "I flew out there, sat down with them, and just listened for an hour.", pt: 'Voei até lá, sentei com eles e só escutei por uma hora.', forte: "I FLEW OUT there, SAT DOWN with them, and JUST LIS-tened for an HOUR.", soa: "I flew out there, sadown with'm, an jus lissn'd fer'n our." },
            { en: "Turns out the problem had nothing to do with price.", pt: 'Acontece que o problema não tinha nada a ver com preço.', forte: "TURNS OUT the PRO-blem had NO-thing to DO with PRICE.", soa: "Turnzout the problm had nuthin ta do with price." },
            { en: "We kept the account, and I've handled every escalation since.", pt: 'Mantivemos a conta, e desde então cuido de toda escalada.', forte: "We KEPT the ac-COUNT, and I've HAN-dled EV-ery es-ca-LA-tion SINCE.", soa: "We kept the account, an I've handld evry escalation since." }
        ]
    },

    {
        id: 'sh-historia',
        titulo: 'Contando um perrengue',
        nivel: 2,
        tema: 'história pessoal',
        wpm: 155,
        foco: 'Ritmo de narrativa: acelerar no meio, frear na virada.',
        linhas: [
            { en: "So there I was, standing in the airport at two in the morning.", pt: 'Aí lá estava eu, de pé no aeroporto às duas da manhã.', forte: "So THERE I WAS, STAN-ding in the AIR-port at TWO in the MOR-ning.", soa: "So there I wuz, standin inthee airport at two inthe morning." },
            { en: "My flight had been cancelled and nobody could tell me why.", pt: 'Meu voo tinha sido cancelado e ninguém sabia dizer por quê.', forte: "My FLIGHT had been CAN-celled and NO-body could TELL me WHY.", soa: "My flite'd bin canceld'n nobody cud tell me why." },
            { en: "I hadn't slept, I hadn't eaten, and my phone was at two percent.", pt: 'Não tinha dormido, não tinha comido, e meu celular estava com 2%.', forte: "I HAD-n't SLEPT, I HAD-n't EAT-en, and my PHONE was at TWO per-CENT.", soa: "I hadn slept, I hadn eaten, an my fone wuz at two percent." },
            { en: "And then — out of nowhere — this guy taps me on the shoulder.", pt: 'E aí — do nada — esse cara toca no meu ombro.', forte: "And THEN — OUT of NO-where — this GUY TAPS me on the SHOUL-der.", soa: "An then — oudda nowhere — this guy tapsme onthe shoulder." },
            { en: "Turns out he was from my hometown. He gave me a ride.", pt: 'Acontece que ele era da minha cidade. Ele me deu carona.', forte: "TURNS OUT he was from my HOME-town. He GAVE me a RIDE.", soa: "Turnzout he wuz frm my hometown. He gaveme a ride." },
            { en: "Fifteen years later, he's still one of my closest friends.", pt: 'Quinze anos depois, ele ainda é um dos meus amigos mais próximos.', forte: "Fif-TEEN YEARS LA-ter, he's STILL ONE of my CLO-sest FRIENDS.", soa: "Fifteen years lader, heez still wunuv my closest frenz." }
        ]
    },

    {
        id: 'sh-telefone',
        titulo: 'Telefone e áudio ruim',
        nivel: 2,
        tema: 'trabalho',
        wpm: 150,
        foco: 'Falar claro sob ruído — consoante final bem marcada.',
        linhas: [
            { en: "Hi, this is Rodrigo calling from Logix — can you hear me okay?", pt: 'Oi, aqui é o Rodrigo da Logix — está me ouvindo bem?', forte: "HI, this is ro-DRI-go CAL-ling from LO-gix — can you HEAR me o-KAY?", soa: "Hi, thisiz Rodrigo calling frm Logix — canya hear me okay?" },
            { en: "Sorry, you're breaking up a little. Let me call you back.", pt: 'Desculpa, você está falhando um pouco. Deixa eu te ligar de volta.', forte: "SOR-ry, you're BREAK-ing UP a LIT-tle. Let me CALL you BACK.", soa: "Sorry, yer braking up a liddle. Lemme call ya back." },
            { en: "Is now a good time, or should I try later?", pt: 'É uma boa hora agora, ou tento mais tarde?', forte: "Is NOW a GOOD TIME, or should I TRY LA-ter?", soa: "Iznow a good time, er shudai try lader?" },
            { en: "Let me spell that for you: R as in Romeo, O as in Oscar.", pt: 'Deixa eu soletrar: R de Romeo, O de Oscar.', forte: "Let me SPELL THAT for you: R as in RO-meo, O as in OS-car.", soa: "Lemme spell thad ferya: R azin Romeo, O azin Oscar." },
            { en: "Great — I'll put that in writing and send it over today.", pt: 'Ótimo — vou colocar isso por escrito e mandar hoje.', forte: "GREAT — I'll PUT that in WRI-ting and SEND it O-ver to-DAY.", soa: "Great — al pud thadin writing an sendit over taday." }
        ]
    },

    {
        id: 'sh-cliente-dificil',
        titulo: 'Cliente irritado — mantendo a calma',
        nivel: 3,
        tema: 'atendimento',
        wpm: 160,
        foco: 'Suavizadores em cadeia sem perder firmeza.',
        linhas: [
            { en: "First of all, I completely understand why you're frustrated.", pt: 'Antes de tudo, eu entendo completamente por que você está frustrado.', forte: "FIRST of ALL, I com-PLETE-ly un-der-STAND WHY you're frus-TRA-ted.", soa: "Ferstuvall, I complitly understand whyer frustraded." },
            { en: "You were promised Thursday, and we didn't deliver. That's on us.", pt: 'Prometeram quinta, e não entregamos. A culpa é nossa.', forte: "You were PRO-mised THURS-day, and we DIDN'T de-LI-ver. THAT's on US.", soa: "Yu wer promist Thurzday, an we didn deliver. Thatson us." },
            { en: "What I can do right now is get you a firm date by end of day.", pt: 'O que posso fazer agora é te dar uma data firme até o fim do dia.', forte: "What I CAN DO RIGHT NOW is GET you a FIRM DATE by END of DAY.", soa: "Whad I can do rite now iz getcha a firm date by endaday." },
            { en: "I'd rather give you a real date than an optimistic one.", pt: 'Prefiro te dar uma data real do que uma otimista.', forte: "I'd RA-ther GIVE you a REAL DATE than an op-ti-MIS-tic ONE.", soa: "I'd rather givya a reel date than'n optimistic one." },
            { en: "Would that work for you, or do you need something today?", pt: 'Isso funcionaria para você, ou precisa de algo hoje?', forte: "Would THAT WORK for you, or do you NEED SOME-thing to-DAY?", soa: "Wud that work ferya, er dya need sumthin taday?" },
            { en: "Either way, you'll hear from me — not from a system.", pt: 'De qualquer forma, você vai ouvir de mim — não de um sistema.', forte: "EI-ther WAY, you'll HEAR from ME — NOT from a SYS-tem.", soa: "Eether way, yull hear frm me — not frm a system." }
        ]
    },

    {
        id: 'sh-tecnico',
        titulo: 'Explicando algo técnico para leigo',
        nivel: 3,
        tema: 'explicação',
        wpm: 160,
        foco: 'Frases longas com grupos de sentido bem separados.',
        linhas: [
            { en: "Think of it like a highway with too many cars and not enough lanes.", pt: 'Pense nisso como uma estrada com carros demais e faixas de menos.', forte: "THINK of it like a HIGH-way with TOO MA-ny CARS and NOT e-NOUGH LANES.", soa: "Thinkuvit lika highway with too many cars'n nod enuf lanes." },
            { en: "The data doesn't disappear — it just waits in line.", pt: 'Os dados não somem — só ficam na fila.', forte: "The DA-ta DOES-n't dis-ap-PEAR — it JUST WAITS in LINE.", soa: "The dada duzn disappear — it just waitsin line." },
            { en: "What we did was basically add two more lanes.", pt: 'O que fizemos foi basicamente adicionar mais duas faixas.', forte: "What we DID was BA-sically ADD TWO MORE LANES.", soa: "Whad we did wuz basicly ad two more lanes." },
            { en: "It's not the most elegant fix, but it buys us six months.", pt: 'Não é a solução mais elegante, mas nos dá seis meses.', forte: "It's NOT the MOST E-legant FIX, but it BUYS us SIX MONTHS.", soa: "Its not the most elegant fix, budit buys us six munths." },
            { en: "In the long run, we'll have to rethink the whole thing.", pt: 'No longo prazo, vamos ter que repensar tudo.', forte: "In the LONG RUN, we'll HAVE to re-THINK the WHOLE THING.", soa: "Inthe long run, wull hafta rethink the hole thing." }
        ]
    },

    {
        id: 'sh-negociacao',
        titulo: 'Negociando sem ceder de cara',
        nivel: 3,
        tema: 'negócios',
        wpm: 165,
        foco: 'Condicionais rápidas e entonação de proposta.',
        linhas: [
            { en: "I appreciate the offer, but that number doesn't work for us.", pt: 'Agradeço a proposta, mas esse número não funciona para nós.', forte: "I ap-PRE-ciate the OF-fer, but that NUM-ber DOES-n't WORK for US.", soa: "I appreeshiate the offer, but that number duznt work fer us." },
            { en: "If you could move on the timeline, I could move on the price.", pt: 'Se você puder ceder no prazo, eu posso ceder no preço.', forte: "If you could MOVE on the TIME-line, I could MOVE on the PRICE.", soa: "Ifya cud moovon the timeline, I cud moovon the price." },
            { en: "What would it take to make this work on your end?", pt: 'O que seria preciso para isso funcionar do seu lado?', forte: "What would it TAKE to make THIS WORK on your END?", soa: "Whad wuddit take ta make this work on yer end?" },
            { en: "Let's be honest about what's realistic here.", pt: 'Vamos ser honestos sobre o que é realista aqui.', forte: "Let's be HON-est about WHAT's re-a-LIS-tic HERE.", soa: "Letsbe onest abaout whats realistic here." },
            { en: "I'd hate to lose this over a five percent gap.", pt: 'Eu odiaria perder isso por uma diferença de cinco por cento.', forte: "I'd HATE to LOSE this O-ver a FIVE per-CENT GAP.", soa: "I'd hate ta looz this over a five percent gap." },
            { en: "Send me the revised terms and I'll get you an answer by noon.", pt: 'Me manda os termos revisados e eu te dou resposta ao meio-dia.', forte: "SEND me the re-VISED TERMS and I'll GET you an AN-swer by NOON.", soa: "Sendme the revized terms an al getcha'n anser by noon." }
        ]
    },

    {
        id: 'sh-apresentacao-publica',
        titulo: 'Abrindo uma apresentação para plateia',
        nivel: 3,
        tema: 'palco',
        wpm: 150,
        foco: 'Pausas dramáticas e projeção — velocidade menor, intenção maior.',
        linhas: [
            { en: "Let me start with a question. // How many of you have ever...", pt: 'Deixa eu começar com uma pergunta. Quantos de vocês já...', forte: "Let me START with a QUES-tion. // HOW MA-ny of you have E-ver...", soa: "Lemme start with a queschin. Howmany uv yu hav ever..." },
            { en: "Keep your hand up if you did it more than once.", pt: 'Mantenha a mão levantada se fez mais de uma vez.', forte: "KEEP your HAND UP if you DID it MORE than ONCE.", soa: "Keep yer handup ifya didit more thn wunce." },
            { en: "Right. // That's the problem I want to talk about today.", pt: 'Certo. É esse o problema de que quero falar hoje.', forte: "RIGHT. // THAT's the PRO-blem I WANT to TALK a-BOUT to-DAY.", soa: "Rite. Thats the problm I wanna talk abaout taday." },
            { en: "And I'm going to argue that we've been solving the wrong half of it.", pt: 'E vou argumentar que temos resolvido a metade errada dele.', forte: "And I'm GO-ing to AR-gue that we've been SOL-ving the WRONG HALF of it.", soa: "An I'm gunna argyu that weev bin solving the wrong haffuvit." },
            { en: "Stay with me — the last slide will make sense of all this.", pt: 'Fique comigo — o último slide vai dar sentido a tudo isso.', forte: "STAY with ME — the LAST SLIDE will MAKE SENSE of ALL THIS.", soa: "Stay with me — the last slide'l make sensuv all this." }
        ]
    },

    {
        id: 'sh-social',
        titulo: 'Jantar com amigos — inglês solto',
        nivel: 3,
        tema: 'social',
        wpm: 175,
        foco: 'Velocidade real de nativo relaxado, com engolimento de sílabas.',
        linhas: [
            { en: "Oh man, you should've seen his face — I almost lost it.", pt: 'Cara, você tinha que ver a cara dele — eu quase morri de rir.', forte: "OH MAN, you should've SEEN his FACE — I AL-most LOST it.", soa: "Oh man, yu shudda seen his face — I almost lostit." },
            { en: "I mean, come on, who does that on a first date?", pt: 'Quer dizer, fala sério, quem faz isso num primeiro encontro?', forte: "I MEAN, COME ON, WHO DOES that on a FIRST DATE?", soa: "I mean, c'mon, who duzzat on a ferst date?" },
            { en: "To be fair, she kind of had it coming.", pt: 'Para ser justo, ela meio que mereceu.', forte: "To be FAIR, she KIND of had it CO-ming.", soa: "Ta be fair, she kinda hadit cuming." },
            { en: "Anyway — are we splitting this or what?", pt: 'Enfim — vamos dividir isso ou o quê?', forte: "AN-yway — are we SPLIT-ting THIS or WHAT?", soa: "Enyway — arwe splittin thisor what?" },
            { en: "Nah, I got it. You paid last time.", pt: 'Nada, deixa comigo. Você pagou da última vez.', forte: "NAH, I GOT it. You PAID LAST TIME.", soa: "Nah, I godit. Yu paid last time." },
            { en: "Alright, next one's on me then. Deal?", pt: 'Beleza, a próxima é por minha conta então. Combinado?', forte: "AL-right, NEXT ONE's on ME then. DEAL?", soa: "Awright, nex wunzon me then. Deal?" }
        ]
    },

    {
        id: 'sh-noticia',
        titulo: 'Notícia lida em voz alta',
        nivel: 3,
        tema: 'jornalismo',
        wpm: 170,
        foco: 'Ritmo de locutor: denso, sem pausa entre grupos curtos.',
        linhas: [
            { en: "Officials said the decision would take effect at the end of the month.", pt: 'As autoridades disseram que a decisão entra em vigor no fim do mês.', forte: "Of-FI-cials SAID the de-CI-sion would TAKE ef-FECT at the END of the MONTH.", soa: "Officials sed the decision wud take effect atthee enduvthe munth." },
            { en: "Critics argue the measure does little to address the root cause.", pt: 'Críticos argumentam que a medida pouco faz para atacar a causa raiz.', forte: "CRI-tics AR-gue the MEA-sure does LIT-tle to ad-DRESS the ROOT CAUSE.", soa: "Critics argyu the mezher duz liddle da address the root cause." },
            { en: "Supporters, on the other hand, call it a necessary first step.", pt: 'Apoiadores, por outro lado, chamam de primeiro passo necessário.', forte: "Sup-POR-ters, on the O-ther HAND, CALL it a NE-cessary FIRST STEP.", soa: "Supporders, onthee other hand, callida necessary ferst step." },
            { en: "The full report is expected to be released on Friday.", pt: 'O relatório completo deve ser divulgado na sexta.', forte: "The FULL re-PORT is ex-PEC-ted to be re-LEASED on FRI-day.", soa: "The full report iz expected ta be releest on Fryday." }
        ]
    },

    {
        id: 'sh-discordar',
        titulo: 'Discordando com elegância',
        nivel: 3,
        tema: 'debate',
        wpm: 165,
        foco: 'Entonação de discordância educada: subir antes de virar.',
        linhas: [
            { en: "I see where you're coming from, and I don't disagree with the premise.", pt: 'Entendo seu ponto, e não discordo da premissa.', forte: "I SEE where you're CO-ming FROM, and I DON'T dis-a-GREE with the PRE-mise.", soa: "I see where yer cuming from, an I don disagree withe premis." },
            { en: "Where I'd push back is on the assumption that nothing changes.", pt: 'Onde eu discordaria é na suposição de que nada muda.', forte: "Where I'd PUSH BACK is on the as-SUMP-tion that NO-thing CHAN-ges.", soa: "Where I'd push backiz onthee assumption that nuthin chanjiz." },
            { en: "Because in practice, that's almost never true.", pt: 'Porque na prática isso quase nunca é verdade.', forte: "Be-CAUSE in PRAC-tice, THAT's AL-most NE-ver TRUE.", soa: "B'cuz in practis, thats almost never true." },
            { en: "I'm not saying you're wrong — I'm saying it's more complicated.", pt: 'Não estou dizendo que você está errado — digo que é mais complicado.', forte: "I'm NOT SAY-ing you're WRONG — I'm SAY-ing it's MORE COM-plicated.", soa: "I'm not saying yer wrong — I'm saying its more complicated." },
            { en: "Does that seem fair, or am I missing something?", pt: 'Isso parece justo, ou estou deixando algo passar?', forte: "Does THAT seem FAIR, or am I MIS-sing SOME-thing?", soa: "Duzzat seem fair, er ami missing sumthing?" }
        ]
    }
];
