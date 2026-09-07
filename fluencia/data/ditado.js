/* =========================================================
   Laboratório de escuta — ditado.

   Você não entende o nativo por causa da FALA CONECTADA, não
   por causa de vocabulário. Aqui a frase é dita em velocidade
   real, você escreve o que ouviu, e o app mostra palavra por
   palavra o que seu ouvido perdeu.

   "soa" = a transcrição de como a frase realmente sai.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.ditado = [

    {
        id: 'dt-reducoes',
        titulo: 'As reduções que somem no meio',
        nivel: 1,
        foco: 'gonna, wanna, gotta, hafta, kinda',
        itens: [
            { en: "What are you going to do about it?", soa: 'Whaddaya gonna do aboudit?', nota: '"What are you" vira "whaddaya" em quase toda conversa real.' },
            { en: "I have to leave in about ten minutes.", soa: 'I hafta leave inabout ten minits.', nota: '"have to" = "hafta". Sempre.' },
            { en: "You've got to be kidding me.", soa: 'You godda be kiddin me.', nota: '"got to" = "gotta"; o -g de "kidding" some.' },
            { en: "I kind of want to stay home tonight.", soa: 'I kinda wanna stay home danite.', nota: 'Duas reduções na mesma frase — normal.' },
            { en: "We're going to need a lot of help.", soa: "We're gonna need a lotta help.", nota: '"a lot of" = "a lotta".' },
            { en: "Let me give you a hand with that.", soa: 'Lemme gichya a hand widdat.', nota: '"give you" vira "gichya"; "with that" vira "widdat".' }
        ]
    },

    {
        id: 'dt-flap',
        titulo: 'O T que vira R brasileiro',
        nivel: 1,
        foco: 'flapping do /t/ entre vogais',
        itens: [
            { en: "Can you get a little bit of water?", soa: 'Canya gedda liddle bidda wader?', nota: 'Quatro T viraram R brasileiro na mesma frase.' },
            { en: "I bought it at a better price.", soa: 'I boddit adda bedder price.', nota: '"bought it" = "boddit".' },
            { en: "Whatever, it doesn't matter.", soa: 'Whadever, it duzn madder.', nota: 'Duas palavras que você já ouviu mil vezes sem reconhecer.' },
            { en: "Put it on the computer.", soa: 'Puddidon the compuder.', nota: 'Três palavras coladas numa só.' },
            { en: "She got a lot of it out of the meeting.", soa: 'She godda loddavit oudda the meedin.', nota: 'O caso extremo: nada soa como está escrito.' },
            { en: "Thirty little bottles.", soa: 'Thirdy liddle boddles.', nota: 'Clássico teste de sotaque americano.' }
        ]
    },

    {
        id: 'dt-ligacao',
        titulo: 'Palavras que grudam',
        nivel: 2,
        foco: 'linking: consoante final + vogal inicial',
        itens: [
            { en: "Take it easy, it's an easy one.", soa: 'Tay-kit-eezy, itsan eezy wun.', nota: 'Consoante final pula para a vogal seguinte.' },
            { en: "Pick up an apple on your way in.", soa: 'Pickup-an-apple on yer way-in.', nota: 'Tudo emendado numa corrente só.' },
            { en: "Is it in an envelope?", soa: 'Izidinan envelope?', nota: 'Quatro palavras, uma respiração.' },
            { en: "He asked us to check it out.", soa: 'He askdus ta checkidout.', nota: '"check it out" = "checkidout".' },
            { en: "Turn it off and on again.", soa: 'Turnidoff an on again.', nota: 'O suporte técnico universal.' },
            { en: "I ran out of ideas about an hour ago.", soa: 'I ran-oudda ideeaz aboudan our ago.', nota: '"out of" = "oudda"; "about an" = "aboudan".' }
        ]
    },

    {
        id: 'dt-fracas',
        titulo: 'Formas fracas: to, of, for, and, can, was',
        nivel: 2,
        foco: 'a vogal reduzida (schwa) nas palavras gramaticais',
        itens: [
            { en: "I need to talk to you for a second.", soa: 'I needa talk ta ya fera second.', nota: '"to" nunca é "tú" no meio da frase.' },
            { en: "She was supposed to be here at eight.", soa: 'She wuz spozeda be here at ate.', nota: '"supposed to" = "spozeda".' },
            { en: "We can do it, but we can't do it today.", soa: 'We kn do it, but we KANT do it taday.', nota: "A diferença can/can't está na FORÇA, não no T final." },
            { en: "A couple of them are coming for dinner.", soa: 'A cupplavem ar cumin fer dinner.', nota: '"of them" = "avem".' },
            { en: "There's a lot of work to be done.", soa: 'Thersa lodda work ta be dun.', nota: '"There is a" = "Thersa".' },
            { en: "I would have told you if I had known.", soa: 'I wuddav toldya if I hadnown.', nota: '"would have" = "wuddav" — nunca "would of", apesar do som.' }
        ]
    },

    {
        id: 'dt-perguntas',
        titulo: 'Perguntas em velocidade real',
        nivel: 2,
        foco: 'auxiliares que colam no pronome',
        itens: [
            { en: "Did you eat yet?", soa: 'Djeet yet?', nota: 'A pergunta mais famosa do inglês falado — três sons.' },
            { en: "What do you think about it?", soa: 'Whaddaya think aboudit?' },
            { en: "Where did you put the keys?", soa: 'Where-dja put the keez?' },
            { en: "How's it going with the new team?", soa: 'Howzit go-in withe new team?' },
            { en: "Are you coming or not?", soa: 'Er ya cumin er not?' },
            { en: "Don't you want to see it first?", soa: 'Doncha wanna seeit first?' }
        ]
    },

    {
        id: 'dt-trabalho',
        titulo: 'Frases de reunião em velocidade de reunião',
        nivel: 3,
        foco: 'blocos longos sem pausa',
        itens: [
            { en: "I'll circle back to you on that by end of day.", soa: 'Al circle backatcha on that by endaday.' },
            { en: "Let's take a step back and look at the whole picture.", soa: "Let's takea step back an lookat the hole picture." },
            { en: "That wasn't what I had in mind, to be honest with you.", soa: 'That wuzn what I hadin mind, ta be onest withya.' },
            { en: "We should probably loop in the legal team before we commit.", soa: "We shud probly loopin the leegal team b'for we cummit." },
            { en: "Can we get everyone on the same page before Thursday?", soa: "Canwe ged evryone onthe same page b'for Thurzday?" },
            { en: "I don't think we have enough data to make that call.", soa: 'I don think we hav enuff dada ta make that call.' }
        ]
    },

    {
        id: 'dt-filme',
        titulo: 'Falas de série, sem legenda',
        nivel: 3,
        foco: 'informalidade extrema',
        itens: [
            { en: "I don't know what you're talking about.", soa: 'I dunno whatcher talkin about.' },
            { en: "Come on, give me a break.", soa: "C'mon, gimme a break." },
            { en: "What's the matter with you?", soa: 'Whats-a-madder witchu?' },
            { en: "I'm telling you, it's not going to work.", soa: "I'm tellin ya, its not gonna work." },
            { en: "Let's get out of here before he sees us.", soa: "Lets ged oudda here b'fore he seez us." },
            { en: "You should have seen the look on his face.", soa: 'You shudda seen the lookon his face.' }
        ]
    },

    {
        id: 'dt-numeros',
        titulo: 'Números, datas e o pesadelo do -teen',
        nivel: 2,
        foco: 'thirteen × thirty, e datas faladas',
        itens: [
            { en: "It costs thirteen fifty, not thirty.", soa: 'It costs thir-TEEN fifty, not THIR-dy.', nota: 'A diferença é o ACENTO: -TEEN forte no fim, -ty forte no começo.' },
            { en: "The meeting is on the fifteenth at nine fifteen.", soa: 'The meedinizon the fifteenth at nine fifteen.' },
            { en: "We grew from fourteen to forty stores.", soa: 'We grew frm four-TEEN ta FOR-dy stores.' },
            { en: "It's about a quarter to eight.", soa: 'Itsabouda quarder ta ate.' },
            { en: "Two thousand and nineteen was a rough year.", soa: "Two thousand'n nineteen wuza ruff year." },
            { en: "My flight leaves at eighteen forty-five.", soa: 'My flite leevzat eighteen fordy-five.' }
        ]
    },

    {
        id: 'dt-sotaques',
        titulo: 'Sotaques diferentes, mesma frase',
        nivel: 3,
        foco: 'britânico × americano — o mesmo texto, outra música',
        itens: [
            { en: "I can't park the car in the yard after half past four.", soa: 'US: I kant park the car inthe yard after haff past for. // UK: I kahnt pahk the cah in the yahd ahfter hahf pahst faw.', nota: 'O R depois de vogal some no britânico. O "a" muda.' },
            { en: "Water bottle in the hospital lobby.", soa: 'US: wader boddle inthe hospidal lobby. // UK: waw-tuh bot-tul in the hos-pi-tul lobby.', nota: 'O T britânico é T mesmo; o americano vira R.' },
            { en: "Schedule the mobile advertisement for Tuesday.", soa: 'US: SKED-jul the MOH-bul AD-ver-tize-ment for TOOZ-day. // UK: SHED-yool the MOH-bye-ul ad-VER-tis-ment for TYOOZ-day.', nota: 'Quatro palavras, quatro diferenças.' },
            { en: "Can you take a bath after the dance class?", soa: 'US: bath /æ/, dance /æ/. // UK: bahth, dahnce.', nota: 'É o famoso "TRAP-BATH split".' }
        ]
    },

    {
        id: 'dt-academico',
        titulo: 'Escuta densa: palestra e podcast',
        nivel: 3,
        foco: 'frases longas com subordinação',
        itens: [
            { en: "What the research suggests, at least so far, is that the effect is much smaller than we assumed.", soa: 'What the reserch sujests, atleast so far, izthat thee effectiz much smaller thanwe assumed.' },
            { en: "There's a growing consensus that the model we've been using doesn't hold up.", soa: 'Thersa growing consensus thatthe model weevbin using duzn hold up.' },
            { en: "If you look at the data over a longer period, a different picture emerges.", soa: 'If ya lookat the dada over a longer period, a diffrent picture emerjez.' },
            { en: "That's precisely the point I want to come back to in a moment.", soa: 'Thats precisely the point I wanna come back to ina moment.' },
            { en: "Not everyone agrees, and I think the disagreement is actually productive.", soa: 'Nod evryone agreez, an I think the disagreementiz akshully productive.' }
        ]
    }
];
