/* =========================================================
   Sons do inglês que o brasileiro erra — e como consertar.

   Cada bloco tem: por que erramos (a interferência do português),
   a instrução articulatória (o que fazer com a boca), os pares
   mínimos para treinar ouvido e boca, e frases-armadilha.
   ========================================================= */
window.F = window.F || {};
F.data = F.data || {};

F.data.sons = [

    {
        id: 'th-surdo',
        nome: 'TH surdo — think, three, month',
        ipa: '/θ/',
        prioridade: 1,
        porque: 'O português não tem esse som, então a boca troca pelo mais parecido: ' +
            '"think" vira "sink" ou "tink". É o sotaque mais denunciador que existe.',
        dica: 'Ponta da língua ENTRE os dentes (dá para ver a língua no espelho), e sopra. ' +
            'Sem voz nenhuma na garganta — é só ar passando raspado. Comece exagerando: ' +
            'deixe 5 mm de língua para fora, depois vá reduzindo.',
        teste: 'Ponha o dedo na frente da boca: você tem que sentir o jato de ar em "three".',
        pares: [
            { a: 'think', ipaA: '/θɪŋk/', b: 'sink', ipaB: '/sɪŋk/' },
            { a: 'thin', ipaA: '/θɪn/', b: 'fin', ipaB: '/fɪn/' },
            { a: 'thought', ipaA: '/θɔːt/', b: 'fought', ipaB: '/fɔːt/' },
            { a: 'three', ipaA: '/θriː/', b: 'tree', ipaB: '/triː/' },
            { a: 'math', ipaA: '/mæθ/', b: 'mass', ipaB: '/mæs/' },
            { a: 'path', ipaA: '/pæθ/', b: 'pass', ipaB: '/pæs/' },
            { a: 'mouth', ipaA: '/maʊθ/', b: 'mouse', ipaB: '/maʊs/' },
            { a: 'both', ipaA: '/boʊθ/', b: 'boat', ipaB: '/boʊt/' }
        ],
        frases: [
            'I think three things are worth thinking through.',
            'Thanks for everything — I thought about it Thursday.',
            'Both of them thought the math was thorough.',
            'Something is worth more than nothing.'
        ]
    },

    {
        id: 'th-sonoro',
        nome: 'TH sonoro — this, they, other',
        ipa: '/ð/',
        prioridade: 1,
        porque: 'Vira "d" ou "z": "this" sai "dis", "brother" sai "bruder". ' +
            'Como aparece nas palavras mais frequentes do inglês (the, this, that, they, ' +
            'there, with), errar aqui contamina cada frase que você fala.',
        dica: 'Mesma posição do TH surdo — língua entre os dentes — mas agora com a voz ' +
            'ligada. Ponha a mão na garganta: tem que vibrar. O ar continua saindo, a língua ' +
            'não encosta atrás dos dentes (isso seria "d").',
        teste: 'Diga "the other day" três vezes segurando a garganta: vibra o tempo todo, ' +
            'sem nenhum bloqueio de ar.',
        pares: [
            { a: 'they', ipaA: '/ðeɪ/', b: 'day', ipaB: '/deɪ/' },
            { a: 'then', ipaA: '/ðen/', b: 'den', ipaB: '/den/' },
            { a: 'there', ipaA: '/ðer/', b: 'dare', ipaB: '/der/' },
            { a: 'breathe', ipaA: '/briːð/', b: 'breeze', ipaB: '/briːz/' },
            { a: 'those', ipaA: '/ðoʊz/', b: 'doze', ipaB: '/doʊz/' },
            { a: 'that', ipaA: '/ðæt/', b: 'dat (não existe)', ipaB: '/dæt/' }
        ],
        frases: [
            'The other day, they told me the truth about this.',
            'Neither of them would rather be there.',
            'Those are the ones that bother my mother.',
            "That's the thing — they think this and that."
        ]
    },

    {
        id: 'epentese',
        nome: 'A vogal fantasma no fim das palavras',
        ipa: 'hot dog ≠ "hót-chi dóg-ui"',
        prioridade: 1,
        porque: 'Em português quase toda palavra acaba em vogal, então a boca inventa um "i" ' +
            'ou "e" que não existe: "big" vira "bigui", "stop" vira "estópi", "help" vira "hélpi". ' +
            'Isso mais que dobra o número de sílabas e destrói o ritmo da frase.',
        dica: 'Termine a palavra e PARE. A consoante final é só um toque: os lábios fecham em ' +
            '"stop" e ficam fechados. Treine cortando o som: "big—" (silêncio). ' +
            'Grave e conte as sílabas: "background" tem 2, não 4.',
        teste: 'Diga "I need to check the network" — 6 palavras, 7 sílabas. Se saiu 11 ou 12, você ' +
            'está colocando vogal fantasma.',
        pares: [
            { a: 'big (1 sílaba)', ipaA: '/bɪɡ/', b: '"bi-gui" (2)', ipaB: 'errado' },
            { a: 'stop (1)', ipaA: '/stɑːp/', b: '"es-tó-pi" (3)', ipaB: 'errado' },
            { a: 'help (1)', ipaA: '/help/', b: '"hél-pi" (2)', ipaB: 'errado' },
            { a: 'club (1)', ipaA: '/klʌb/', b: '"clu-bi" (2)', ipaB: 'errado' },
            { a: 'network (2)', ipaA: '/ˈnetwɜːrk/', b: '"ne-tu-uór-ki" (4)', ipaB: 'errado' },
            { a: 'text (1)', ipaA: '/tekst/', b: '"tex-ti" (2)', ipaB: 'errado' }
        ],
        frases: [
            'I stopped the truck in front of the club.',
            'Check the network and send the text back.',
            'Good luck with that big project next week.',
            'He picked up the black backpack and left.'
        ]
    },

    {
        id: 'cluster-s',
        nome: 'Palavras que começam com S + consoante',
        ipa: 'sp-, st-, sk-, sl-, sn-',
        prioridade: 1,
        porque: 'O português não começa palavra com S+consoante, então colamos um "e" na ' +
            'frente: "Spain" vira "Espain", "school" vira "eschool", "stress" vira "estress".',
        dica: 'Comece o som pelo S, sozinho, e segure: "sssss...pain". Depois vá encurtando o ' +
            'S até virar "spain". Truque: pense que o S pertence à palavra anterior — ' +
            '"the-s + tudent".',
        teste: 'Diga "I still study Spanish at school" sem nenhum "e" antes dos S.',
        pares: [
            { a: 'school', ipaA: '/skuːl/', b: '"e-school"', ipaB: 'errado' },
            { a: 'Spain', ipaA: '/speɪn/', b: '"Espain"', ipaB: 'errado' },
            { a: 'student', ipaA: '/ˈstuːdənt/', b: '"estudent"', ipaB: 'errado' },
            { a: 'strategy', ipaA: '/ˈstrætədʒi/', b: '"estrategy"', ipaB: 'errado' },
            { a: 'sport', ipaA: '/spɔːrt/', b: '"esport"', ipaB: 'errado' }
        ],
        frases: [
            'The students started a small startup in Spain.',
            'I strongly suggest we speed up the schedule.',
            'Stop stressing about the spreadsheet.'
        ]
    },

    {
        id: 'i-longo-curto',
        nome: 'ship × sheep — o /ɪ/ curto',
        ipa: '/ɪ/ × /iː/',
        prioridade: 1,
        porque: 'Ouvimos os dois como o "i" do português e falamos tudo com /i/ longo. ' +
            'Resultado: "I want to leave" (quero ir embora) sai como "I want to live". ' +
            'E existe a palavra "sheet" com "beach" que você não quer errar.',
        dica: '/iː/ é longo e tenso: sorriso largo, língua alta e para a frente. ' +
            '/ɪ/ é curto, relaxado e mais central — quase um "ê" bem rápido, boca frouxa. ' +
            'Não é "i" mais curto: é outra vogal, mais aberta.',
        teste: 'Grave "This is it" — as três vogais são /ɪ/ curtinho, nenhuma é "iiii".',
        pares: [
            { a: 'ship', ipaA: '/ʃɪp/', b: 'sheep', ipaB: '/ʃiːp/' },
            { a: 'live (verbo)', ipaA: '/lɪv/', b: 'leave', ipaB: '/liːv/' },
            { a: 'bit', ipaA: '/bɪt/', b: 'beat', ipaB: '/biːt/' },
            { a: 'fill', ipaA: '/fɪl/', b: 'feel', ipaB: '/fiːl/' },
            { a: 'sit', ipaA: '/sɪt/', b: 'seat', ipaB: '/siːt/' },
            { a: 'itch', ipaA: '/ɪtʃ/', b: 'each', ipaB: '/iːtʃ/' },
            { a: 'chip', ipaA: '/tʃɪp/', b: 'cheap', ipaB: '/tʃiːp/' },
            { a: 'still', ipaA: '/stɪl/', b: 'steel', ipaB: '/stiːl/' }
        ],
        frases: [
            'I still feel this ship is cheap.',
            "It's been six weeks since he left this city.",
            'Please fill in the field before you leave.',
            'Did you sit in the middle seat?'
        ]
    },

    {
        id: 'ae',
        nome: 'bad × bed × bud — o /æ/',
        ipa: '/æ/ × /e/ × /ʌ/',
        prioridade: 2,
        porque: 'O português tem "é" e "a", mas não tem o /æ/ (entre os dois) nem o /ʌ/. ' +
            'Por isso "man", "men" e "mine" viram tudo a mesma coisa, e "cat" sai "quét".',
        dica: '/æ/: abra a boca como se fosse dizer "é" e desça o queixo até quase o "a" — ' +
            'som largo, meio de pato. /ʌ/: boca relaxada, curto, no meio da boca ("â" de "cama"). ' +
            '/e/: o "é" comum do português, mas curto.',
        teste: 'bat — bet — but: três vogais claramente diferentes, sem esforço.',
        pares: [
            { a: 'bad', ipaA: '/bæd/', b: 'bed', ipaB: '/bed/' },
            { a: 'man', ipaA: '/mæn/', b: 'men', ipaB: '/men/' },
            { a: 'cat', ipaA: '/kæt/', b: 'cut', ipaB: '/kʌt/' },
            { a: 'hat', ipaA: '/hæt/', b: 'hut', ipaB: '/hʌt/' },
            { a: 'sad', ipaA: '/sæd/', b: 'said', ipaB: '/sed/' },
            { a: 'match', ipaA: '/mætʃ/', b: 'much', ipaB: '/mʌtʃ/' }
        ],
        frases: [
            'That man had a bad habit.',
            "I can't stand that — it's much better than that.",
            'The staff had to run a hundred tests.'
        ]
    },

    {
        id: 'ed',
        nome: 'O -ed do passado tem 3 sons',
        ipa: '/t/ /d/ /ɪd/',
        prioridade: 1,
        porque: 'O brasileiro fala "wanted", "worked" e "played" todos como "-êd" ou "-idi". ' +
            'Na real: só depois de T ou D é que se pronuncia uma sílaba nova.',
        dica: 'Depois de som SURDO (p, k, f, s, ʃ, tʃ, θ) → /t/: "worked" = "workt". ' +
            'Depois de som SONORO (b, g, v, z, m, n, l, r, vogal) → /d/: "played" = "playd". ' +
            'Depois de T ou D → /ɪd/, aí sim vira sílaba: "wanted", "needed".',
        teste: '"I worked, I played, I needed" = 2 + 2 + 3 sílabas.',
        pares: [
            { a: 'worked /t/', ipaA: '/wɜːrkt/', b: 'wanted /ɪd/', ipaB: '/ˈwɑːntɪd/' },
            { a: 'stopped /t/', ipaA: '/stɑːpt/', b: 'started /ɪd/', ipaB: '/ˈstɑːrtɪd/' },
            { a: 'played /d/', ipaA: '/pleɪd/', b: 'painted /ɪd/', ipaB: '/ˈpeɪntɪd/' },
            { a: 'watched /t/', ipaA: '/wɑːtʃt/', b: 'waited /ɪd/', ipaB: '/ˈweɪtɪd/' },
            { a: 'lived /d/', ipaA: '/lɪvd/', b: 'decided /ɪd/', ipaB: '/dɪˈsaɪdɪd/' }
        ],
        frases: [
            'I worked, watched and waited.',
            'She stopped, started again and finished.',
            'They asked, we answered, nobody complained.'
        ]
    },

    {
        id: 's-final',
        nome: 'O -s final: /s/, /z/ ou /ɪz/',
        ipa: '/s/ /z/ /ɪz/',
        prioridade: 2,
        porque: 'Falamos tudo com /s/ ("kids" sai "kits") ou simplesmente comemos o -s ' +
            '("he work"). O -s carrega informação: plural, terceira pessoa, posse.',
        dica: 'Depois de som surdo → /s/ (cats). Depois de som sonoro ou vogal → /z/ (dogs, ' +
            'days). Depois de s, z, ʃ, tʃ, dʒ → /ɪz/, sílaba nova (buses, watches, changes).',
        teste: 'cats /s/ — dogs /z/ — boxes /ɪz/. Ponha a mão na garganta: só o segundo vibra.',
        pares: [
            { a: 'cats /s/', ipaA: '/kæts/', b: 'kids /z/', ipaB: '/kɪdz/' },
            { a: 'works /s/', ipaA: '/wɜːrks/', b: 'watches /ɪz/', ipaB: '/ˈwɑːtʃɪz/' },
            { a: 'books /s/', ipaA: '/bʊks/', b: 'pages /ɪz/', ipaB: '/ˈpeɪdʒɪz/' }
        ],
        frases: [
            'He works, she manages, they choose.',
            'The prices of these services changed.',
            "My friend's kids love these boxes."
        ]
    },

    {
        id: 'l-final',
        nome: 'O L escuro no fim — não é "u"',
        ipa: '/l/ (dark L)',
        prioridade: 2,
        porque: 'Em português "Brasil" acaba em "u". Aí "people" vira "pípou", "milk" vira ' +
            '"miuki" e "all" vira "ól". O ouvido nativo escuta uma palavra diferente.',
        dica: 'A ponta da língua PRECISA encostar atrás dos dentes de cima e ficar lá. ' +
            'O fundo da língua sobe (por isso soa "escuro"), mas a ponta encosta. ' +
            'Segure a última consoante um instante: "peop-LLL".',
        teste: 'Diga "well" e congele no final: sua língua está colada no céu da boca? ' +
            'Se está solta, saiu "wéu".',
        pares: [
            { a: 'feel', ipaA: '/fiːl/', b: 'few', ipaB: '/fjuː/' },
            { a: 'call', ipaA: '/kɔːl/', b: 'caw', ipaB: '/kɔː/' },
            { a: 'people', ipaA: '/ˈpiːpl/', b: '"pípou"', ipaB: 'errado' },
            { a: 'milk', ipaA: '/mɪlk/', b: '"miuk"', ipaB: 'errado' },
            { a: 'help', ipaA: '/help/', b: '"héupi"', ipaB: 'errado' }
        ],
        frases: [
            'All the people will call you well before April.',
            'I still felt terrible about the email.',
            'Well, I will help — I feel awful.'
        ]
    },

    {
        id: 'h-r',
        nome: 'O H que sopra e o R americano',
        ipa: '/h/ × /r/',
        prioridade: 1,
        porque: 'O "r" do português em "rato" é justamente o /h/ do inglês. Por isso "house" ' +
            'vira "rouse" e "hat" vira "rat". E o /r/ inglês vira nosso "rr" ou o "r" caipira.',
        dica: '/h/: só ar quente, como embaçar um óculos — nada de raspar a garganta. ' +
            '/r/ americano: a língua não toca em NADA; as bordas encostam nos dentes de trás, ' +
            'a ponta se curva para trás e os lábios arredondam um pouco. Se vibrou, está errado.',
        teste: '"Harry, hurry, red car" — o H sopra, o R nunca vibra nem bate.',
        pares: [
            { a: 'hat', ipaA: '/hæt/', b: 'rat', ipaB: '/ræt/' },
            { a: 'high', ipaA: '/haɪ/', b: 'rye', ipaB: '/raɪ/' },
            { a: 'hair', ipaA: '/her/', b: 'rare', ipaB: '/rer/' },
            { a: 'ahead', ipaA: '/əˈhed/', b: 'a red', ipaB: '/ə red/' }
        ],
        frases: [
            'Harry hurried home to hear the whole story.',
            'The red car is right here in the garage.',
            'How hard is it to hire a hundred people?'
        ]
    },

    {
        id: 'palatalizacao',
        nome: 'TI e DI não viram "tchi" e "dji"',
        ipa: '/ti/ /di/',
        prioridade: 2,
        porque: 'No português do Brasil, "tia" é "tchia" e "dia" é "djia". Aí "team" vira ' +
            '"tchim", "did" vira "djid" e "Tuesday" vira "tchusday".',
        dica: 'Segure a língua atrás dos dentes e solte um T sequinho, seco, sem chiado. ' +
            'Pratique em câmera lenta: "t...i...m", depois acelere sem deixar o chiado voltar.',
        teste: '"Did the team decide on Tuesday?" — nenhum "tch" nem "dj" na frase.',
        pares: [
            { a: 'tea', ipaA: '/tiː/', b: '"tchi"', ipaB: 'errado' },
            { a: 'did', ipaA: '/dɪd/', b: '"djid"', ipaB: 'errado' },
            { a: 'team', ipaA: '/tiːm/', b: 'cheem', ipaB: 'errado' },
            { a: 'Tuesday', ipaA: '/ˈtuːzdeɪ/', b: '"tchusday"', ipaB: 'errado' }
        ],
        frases: [
            'The team did it on Tuesday.',
            'Did you decide to take the tea?',
            'It depends on the timing of the deal.'
        ]
    },

    {
        id: 'v-w',
        nome: 'V × W — very × wery',
        ipa: '/v/ × /w/',
        prioridade: 2,
        porque: 'O português não tem /w/ como consoante de início forte, então "we" vira "vi" ' +
            '— ou o contrário, por hipercorreção: "very" vira "wery".',
        dica: '/v/: dentes de cima mordem o lábio de baixo, com voz. ' +
            '/w/: lábios em bico redondo, sem tocar nos dentes — é o "u" do "quando", ' +
            'bem rápido antes da vogal.',
        teste: '"We were very worried" — alterna bico de beijo (w) e mordida (v).',
        pares: [
            { a: 'vine', ipaA: '/vaɪn/', b: 'wine', ipaB: '/waɪn/' },
            { a: 'vest', ipaA: '/vest/', b: 'west', ipaB: '/west/' },
            { a: 'veal', ipaA: '/viːl/', b: 'wheel', ipaB: '/wiːl/' },
            { a: 'invest', ipaA: '/ɪnˈvest/', b: 'in west', ipaB: '/ɪn west/' }
        ],
        frases: [
            'We were very worried about the wine.',
            "I will visit the west side — it's worth it.",
            'We value what we want.'
        ]
    },

    {
        id: 'ng',
        nome: 'O -ING não termina em "g" nem em "n"',
        ipa: '/ŋ/',
        prioridade: 3,
        porque: 'Ou falamos "workin-GUI" (com a vogal fantasma no G) ou "workin" com N comum. ' +
            'O som certo é nasal, no fundo da boca, sem nenhum "g" audível.',
        dica: 'É o som do "ng" de "banco" em português: o fundo da língua sobe e trava, o ar ' +
            'sai pelo nariz e acabou. Nada de destravar com um "gui".',
        teste: '"I am working on something interesting" — nenhuma sílaba extra no fim.',
        pares: [
            { a: 'sing /ŋ/', ipaA: '/sɪŋ/', b: 'sin /n/', ipaB: '/sɪn/' },
            { a: 'thing', ipaA: '/θɪŋ/', b: 'thin', ipaB: '/θɪn/' },
            { a: 'running', ipaA: '/ˈrʌnɪŋ/', b: '"runnin-gui"', ipaB: 'errado' }
        ],
        frases: [
            'Nothing is going wrong with the meeting.',
            "I'm working on making everything simpler.",
            'Bring the young king something long.'
        ]
    },

    {
        id: 'schwa',
        nome: 'O schwa — a vogal preguiçosa que domina o inglês',
        ipa: '/ə/',
        prioridade: 1,
        porque: 'Em português toda vogal escrita é pronunciada por inteiro. Em inglês, TODA ' +
            'sílaba sem acento vira /ə/ — um "â" curtinho e sem cor. Falar todas as vogais ' +
            'cheias é o que faz o "sotaque de robô" que denuncia o brasileiro na primeira frase.',
        dica: 'Ache a sílaba forte da palavra e ESMAGUE todas as outras. ' +
            '"banana" = bâ-NÃ-nâ, "computer" = câm-PIU-târ, "problem" = PRÁB-lâm. ' +
            'Se a sílaba fraca ficou clara demais, ainda está errado.',
        teste: 'Diga "photograph — photographer — photographic": a mesma raiz muda de vogal ' +
            'em toda sílaba, porque o acento muda de lugar.',
        pares: [
            { a: 'about /əˈbaʊt/', ipaA: 'â-BÁUT', b: '"a-bout"', ipaB: 'errado' },
            { a: 'support /səˈpɔːrt/', ipaA: 'sâ-PÓRT', b: '"su-port"', ipaB: 'errado' },
            { a: 'problem /ˈprɑːbləm/', ipaA: 'PRÁB-lâm', b: '"pro-blém"', ipaB: 'errado' },
            { a: 'company /ˈkʌmpəni/', ipaA: 'CÂM-pâ-ni', b: '"com-pá-ni"', ipaB: 'errado' }
        ],
        frases: [
            'The company had a problem with the computer.',
            'I was about to support the proposal.',
            'A photographer takes a photograph.'
        ]
    },

    {
        id: 'ritmo',
        nome: 'Ritmo: inglês é batida, português é metralhadora',
        ipa: 'stress-timed',
        prioridade: 1,
        porque: 'No português cada sílaba dura mais ou menos o mesmo tempo. No inglês, só as ' +
            'sílabas fortes marcam a batida — o resto é espremido no meio. Quem fala inglês ' +
            'com ritmo de português é entendido com esforço, mesmo com os sons certos.',
        dica: 'Bata na mesa uma vez por palavra FORTE (substantivo, verbo principal, adjetivo, ' +
            'advérbio, interrogativo). Palavras gramaticais (a, of, to, for, was, can, and) ' +
            'entram espremidas entre as batidas, sem batida própria.',
        teste: 'Estas frases levam o MESMO tempo, porque têm 4 batidas cada: ' +
            '"CATS EAT FISH" / "the CATS have EATen the FISH" / ' +
            '"the CATS could have EATen all the FISH".',
        pares: [
            { a: 'I can /kən/ go', ipaA: 'fraco: "kân"', b: "I can't /kænt/ go", ipaB: 'forte: "kǽnt"' },
            { a: 'to /tə/ work', ipaA: '"tâ work"', b: '"tu work"', ipaB: 'errado' },
            { a: 'and /ən/', ipaA: '"rock ân roll"', b: '"and"', ipaB: 'devagar demais' },
            { a: 'for /fər/ you', ipaA: '"fâr you"', b: '"fór iú"', ipaB: 'errado' }
        ],
        frases: [
            'I was GOing to CALL you but I FORgot.',
            "There's a LOT of THINGS I would HAVE to CHANGE.",
            'What do you WANT me to DO about it?'
        ]
    },

    {
        id: 'ligacao',
        nome: 'Ligação e redução — por que você não entende o nativo',
        ipa: 'connected speech',
        prioridade: 1,
        porque: 'Você não entende filme não por falta de vocabulário: é porque o nativo não ' +
            'fala palavra por palavra. "What are you going to do?" sai "whaddaya gonna do". ' +
            'Se sua boca nunca produziu isso, seu ouvido não reconhece.',
        dica: 'Consoante final + vogal inicial GRUDAM: "an apple" = "a-napple". ' +
            'T entre vogais vira um toque de R brasileiro: "water" = "wader", "get it" = "gedit". ' +
            'T final some antes de consoante: "next day" = "nex day".',
        teste: 'Escreva a frase como ela SOA, depois fale a versão soada.',
        pares: [
            { a: 'want to', ipaA: 'wanna', b: 'got to', ipaB: 'gotta' },
            { a: 'going to', ipaA: 'gonna', b: 'kind of', ipaB: 'kinda' },
            { a: 'let me', ipaA: 'lemme', b: 'give me', ipaB: 'gimme' },
            { a: 'what do you', ipaA: 'whaddaya', b: 'did you', ipaB: 'didja' },
            { a: 'a lot of', ipaA: 'a lotta', b: 'out of', ipaB: 'outta' }
        ],
        frases: [
            "What are you going to do about it? → Whaddaya gonna do aboudit?",
            'I have to get out of here. → I hafta gedoudda here.',
            'Did you eat yet? → Djeet yet?',
            'Let me give you a hand. → Lemme gimme... gichya hand.'
        ]
    }
];
