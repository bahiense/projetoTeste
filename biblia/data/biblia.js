/* =========================================================
   A Bíblia como dado: 66 livros, 1.189 capítulos, 8 grupos.

   Os grupos são os do plano de leitura em paralelo: em vez de ler
   a Bíblia do começo ao fim, você lê um capítulo de cada grupo por
   dia, e cada grupo gira no seu próprio ciclo. Assim narrativa,
   poesia, profecia e epístola andam juntas.

   Cada livro: [nome, capítulos, abreviação, apelidos para busca].
   Os apelidos são o que a pessoa digita ("1co", "sl", "apoc") —
   sempre em minúsculas e sem acento; a busca normaliza a entrada.
   ========================================================= */
window.B = window.B || {};

B.biblia = (function () {
    'use strict';

    var GRUPOS = [
        {
            id: 'pentateuco', nome: 'Pentateuco', icone: '📜',
            resumo: 'A lei e as origens: criação, aliança e o povo formado no deserto.',
            livros: [
                ['Gênesis', 50, 'Gn', 'genesis gn gen'],
                ['Êxodo', 40, 'Êx', 'exodo ex êx exo'],
                ['Levítico', 27, 'Lv', 'levitico lv lev'],
                ['Números', 36, 'Nm', 'numeros nm num nmr'],
                ['Deuteronômio', 34, 'Dt', 'deuteronomio dt deut']
            ]
        },
        {
            id: 'historicos', nome: 'Livros Históricos', icone: '⚔️',
            resumo: 'De Josué a Ester: conquista, reis, exílio e volta para casa.',
            livros: [
                ['Josué', 24, 'Js', 'josue js jos'],
                ['Juízes', 21, 'Jz', 'juizes jz juiz'],
                ['Rute', 4, 'Rt', 'rute rt'],
                ['1 Samuel', 31, '1Sm', '1samuel 1sm 1sa isamuel'],
                ['2 Samuel', 24, '2Sm', '2samuel 2sm 2sa iisamuel'],
                ['1 Reis', 22, '1Rs', '1reis 1rs 1re ireis'],
                ['2 Reis', 25, '2Rs', '2reis 2rs 2re iireis'],
                ['1 Crônicas', 29, '1Cr', '1cronicas 1cr 1cro'],
                ['2 Crônicas', 36, '2Cr', '2cronicas 2cr 2cro'],
                ['Esdras', 10, 'Ed', 'esdras ed esd'],
                ['Neemias', 13, 'Ne', 'neemias ne nee'],
                ['Ester', 10, 'Et', 'ester et est']
            ]
        },
        {
            id: 'poesia', nome: 'Poesia e Sabedoria', icone: '🎵',
            resumo: 'O coração humano diante de Deus: dor, louvor, prudência e amor.',
            livros: [
                ['Jó', 42, 'Jó', 'jo job jó'],
                ['Salmos', 150, 'Sl', 'salmos sl salmo sal'],
                ['Provérbios', 31, 'Pv', 'proverbios pv prov'],
                ['Eclesiastes', 12, 'Ec', 'eclesiastes ec ecl'],
                ['Cânticos', 8, 'Ct', 'canticos ct cantares canticodoscanticos cant']
            ]
        },
        {
            id: 'profeticos', nome: 'Profetas Maiores', icone: '🔮',
            resumo: 'A voz que denuncia e consola: juízo, exílio e promessa de restauração.',
            livros: [
                ['Isaías', 66, 'Is', 'isaias is isa'],
                ['Jeremias', 52, 'Jr', 'jeremias jr jer'],
                ['Lamentações', 5, 'Lm', 'lamentacoes lm lam'],
                ['Ezequiel', 48, 'Ez', 'ezequiel ez eze'],
                ['Daniel', 12, 'Dn', 'daniel dn dan']
            ]
        },
        {
            id: 'profetasMenores', nome: 'Profetas Menores', icone: '📢',
            resumo: 'Doze livros curtos e afiados, do século VIII ao pós-exílio.',
            livros: [
                ['Oséias', 14, 'Os', 'oseias os ose'],
                ['Joel', 3, 'Jl', 'joel jl'],
                ['Amós', 9, 'Am', 'amos am'],
                ['Obadias', 1, 'Ob', 'obadias ob abdias'],
                ['Jonas', 4, 'Jn', 'jonas jn jon'],
                ['Miquéias', 7, 'Mq', 'miqueias mq miq'],
                ['Naum', 3, 'Na', 'naum na'],
                ['Habacuque', 3, 'Hc', 'habacuque hc hab'],
                ['Sofonias', 3, 'Sf', 'sofonias sf sof'],
                ['Ageu', 2, 'Ag', 'ageu ag'],
                ['Zacarias', 14, 'Zc', 'zacarias zc zac'],
                ['Malaquias', 4, 'Ml', 'malaquias ml mal']
            ]
        },
        {
            id: 'evangelhos', nome: 'Evangelhos e Atos', icone: '✝️',
            resumo: 'Jesus em quatro retratos, e a igreja nascendo depois da ressurreição.',
            livros: [
                ['Mateus', 28, 'Mt', 'mateus mt mat'],
                ['Marcos', 16, 'Mc', 'marcos mc mar mrc'],
                ['Lucas', 24, 'Lc', 'lucas lc luc'],
                ['João', 21, 'Jo', 'joao jo jhn evangelhodejoao'],
                ['Atos', 28, 'At', 'atos at ato atosdosapostolos']
            ]
        },
        {
            id: 'cartasPaulinas', nome: 'Cartas Paulinas', icone: '✉️',
            resumo: 'Paulo escrevendo a igrejas reais, com problemas reais, no século I.',
            livros: [
                ['Romanos', 16, 'Rm', 'romanos rm rom'],
                ['1 Coríntios', 16, '1Co', '1corintios 1co 1cor'],
                ['2 Coríntios', 13, '2Co', '2corintios 2co 2cor'],
                ['Gálatas', 6, 'Gl', 'galatas gl gal'],
                ['Efésios', 6, 'Ef', 'efesios ef efe'],
                ['Filipenses', 4, 'Fp', 'filipenses fp fil'],
                ['Colossenses', 4, 'Cl', 'colossenses cl col'],
                ['1 Tessalonicenses', 5, '1Ts', '1tessalonicenses 1ts 1tes'],
                ['2 Tessalonicenses', 3, '2Ts', '2tessalonicenses 2ts 2tes'],
                ['1 Timóteo', 6, '1Tm', '1timoteo 1tm 1tim'],
                ['2 Timóteo', 4, '2Tm', '2timoteo 2tm 2tim'],
                ['Tito', 3, 'Tt', 'tito tt tit'],
                ['Filemom', 1, 'Fm', 'filemom fm flm filemon']
            ]
        },
        {
            id: 'cartasGerais', nome: 'Cartas Gerais e Apocalipse', icone: '📨',
            resumo: 'Cartas à igreja perseguida e a visão final: o Cordeiro vence.',
            livros: [
                ['Hebreus', 13, 'Hb', 'hebreus hb heb'],
                ['Tiago', 5, 'Tg', 'tiago tg tia'],
                ['1 Pedro', 5, '1Pe', '1pedro 1pe 1pd'],
                ['2 Pedro', 3, '2Pe', '2pedro 2pe 2pd'],
                ['1 João', 5, '1Jo', '1joao 1jo 1jn'],
                ['2 João', 1, '2Jo', '2joao 2jo 2jn'],
                ['3 João', 1, '3Jo', '3joao 3jo 3jn'],
                ['Judas', 1, 'Jd', 'judas jd jud'],
                ['Apocalipse', 22, 'Ap', 'apocalipse ap apo revelacao']
            ]
        }
    ];

    /* Um índice plano é o que quase todo código quer: percorrer os 66
       livros na ordem canônica sem se importar com o grupo. */
    var LIVROS = [];
    var PORNOME = {};
    var PORGRUPO = {};

    GRUPOS.forEach(function (g) {
        PORGRUPO[g.id] = g;
        g.livros = g.livros.map(function (l, i) {
            var livro = {
                nome: l[0], caps: l[1], abrev: l[2],
                apelidos: l[3].split(' '),
                grupo: g.id, indice: i, ordem: LIVROS.length,
                testamento: LIVROS.length < 39 ? 'AT' : 'NT'
            };
            LIVROS.push(livro);
            PORNOME[livro.nome] = livro;
            return livro;
        });
    });

    var TOTAL_CAPS = LIVROS.reduce(function (s, l) { return s + l.caps; }, 0);

    function semAcento(s) {
        return String(s || '').toLowerCase()
            .normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9]/g, '');
    }

    /* Dois mapas de busca. O primeiro guarda o acento, porque em português
       ele é a única coisa que separa Jó de João; o segundo ignora acento,
       para quem digita rápido no celular. Quem escreve "jo" quase sempre quer
       João (Jo é a abreviação consagrada); para Jó, escreva "jó" ou "job". */
    var BUSCA = {};        // sem acento
    var BUSCA_AC = {};     // com acento preservado

    function soMinusculas(s) {
        return String(s || '').toLowerCase().replace(/[^a-z0-9\u00c0-\u024f]/g, '');
    }

    LIVROS.forEach(function (l) { BUSCA[semAcento(l.nome)] = l; });
    LIVROS.forEach(function (l) {
        var a = semAcento(l.abrev);
        if (!BUSCA[a]) BUSCA[a] = l;
        l.apelidos.forEach(function (ap) { if (!BUSCA[ap]) BUSCA[ap] = l; });
    });
    LIVROS.forEach(function (l) {
        BUSCA_AC[soMinusculas(l.nome)] = l;
        var a = soMinusculas(l.abrev);
        if (!BUSCA_AC[a]) BUSCA_AC[a] = l;
    });

    /* Desempates que a ordem canônica resolveria errado. */
    BUSCA['jo'] = PORNOME['João'];
    BUSCA['job'] = PORNOME['Jó'];
    BUSCA_AC['jó'] = PORNOME['Jó'];
    BUSCA_AC['jo'] = PORNOME['João'];

    function livro(nome) { return PORNOME[nome] || null; }
    function grupo(id) { return PORGRUPO[id] || null; }
    function capsDoGrupo(id) {
        return PORGRUPO[id].livros.reduce(function (s, l) { return s + l.caps; }, 0);
    }

    /* Entende "João 3", "1co 13", "sl", "Apocalipse 22" e devolve
       { livro, capitulo } — capítulo nulo quando a pessoa só disse o livro,
       que é o caso do panorama do livro inteiro. */
    function interpretar(texto) {
        var bruto = String(texto || '').trim();
        if (!bruto) return null;
        var m = bruto.match(/^(.*?)[\s.:]*(\d{1,3})?\s*$/);
        var parteLivro = m ? m[1] : bruto;
        var cap = m && m[2] ? parseInt(m[2], 10) : null;

        var chave = semAcento(parteLivro);
        var achado = BUSCA_AC[soMinusculas(parteLivro)] || BUSCA[chave];

        /* Nada bateu exato: pode ser "1 jo" com o número solto virando
           capítulo ("1jo" sem espaço) ou um começo de nome ("apoca"). */
        if (!achado && cap !== null) {
            var comNumero = BUSCA_AC[soMinusculas(parteLivro + cap)] || BUSCA[semAcento(parteLivro + cap)];
            if (comNumero) { achado = comNumero; cap = null; }
        }
        if (!achado && chave) {
            var candidatos = Object.keys(BUSCA).filter(function (k) {
                return k.indexOf(chave) === 0;
            });
            var unicos = {};
            candidatos.forEach(function (k) { unicos[BUSCA[k].nome] = BUSCA[k]; });
            var nomes = Object.keys(unicos);
            if (nomes.length === 1) achado = unicos[nomes[0]];
        }
        if (!achado) return null;
        if (cap !== null && (cap < 1 || cap > achado.caps)) return null;
        return { livro: achado, capitulo: cap };
    }

    /* Sugestões para o campo de busca. */
    function sugerir(texto, limite) {
        var chave = semAcento(texto);
        if (!chave) return [];
        var pontua = LIVROS.map(function (l) {
            var n = semAcento(l.nome);
            var p = n === chave ? 0
                : n.indexOf(chave) === 0 ? 1
                    : semAcento(l.abrev) === chave ? 1
                        : l.apelidos.some(function (a) { return a.indexOf(chave) === 0; }) ? 2
                            : n.indexOf(chave) > 0 ? 3 : 99;
            return { livro: l, p: p };
        }).filter(function (x) { return x.p < 99; });
        pontua.sort(function (a, b) { return a.p - b.p || a.livro.ordem - b.livro.ordem; });
        return pontua.slice(0, limite || 8).map(function (x) { return x.livro; });
    }

    return {
        GRUPOS: GRUPOS, LIVROS: LIVROS, TOTAL_CAPS: TOTAL_CAPS,
        livro: livro, grupo: grupo, capsDoGrupo: capsDoGrupo,
        interpretar: interpretar, sugerir: sugerir, semAcento: semAcento
    };
})();
