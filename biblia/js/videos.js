/* =========================================================
   O capítulo em vídeo: pregação, estudo, comentário.

   Nada aqui é lista de vídeos. É um construtor de BUSCAS no YouTube,
   e isso é de propósito:

   - Vídeo escolhido sai do ar, muda de dono, vira outra coisa. Busca
     não quebra, e em dois anos ela devolve o que foi publicado depois.
   - Escolher o pregador de alguém é atrevimento. O app abre a porta;
     quem entra decide.

   Daí não haver tabela de capítulo nenhum: todos os 1.189 têm busca, e
   os 66 livros também, porque a busca se monta a partir da referência.
   Os nomes em inglês existem só para isso: "Salmos 23 sermon" não acha
   nada; "Psalm 23 sermon" acha a metade da internet.
   ========================================================= */
window.B = window.B || {};

B.videos = (function () {
    'use strict';

    /* Nomes em inglês, para a busca em inglês valer alguma coisa. */
    var EN = {
        GEN: 'Genesis', EXO: 'Exodus', LEV: 'Leviticus', NUM: 'Numbers', DEU: 'Deuteronomy',
        JOS: 'Joshua', JDG: 'Judges', RUT: 'Ruth', '1SA': '1 Samuel', '2SA': '2 Samuel',
        '1KI': '1 Kings', '2KI': '2 Kings', '1CH': '1 Chronicles', '2CH': '2 Chronicles',
        EZR: 'Ezra', NEH: 'Nehemiah', EST: 'Esther', JOB: 'Job', PSA: 'Psalm',
        PRO: 'Proverbs', ECC: 'Ecclesiastes', SNG: 'Song of Solomon', ISA: 'Isaiah',
        JER: 'Jeremiah', LAM: 'Lamentations', EZK: 'Ezekiel', DAN: 'Daniel', HOS: 'Hosea',
        JOL: 'Joel', AMO: 'Amos', OBA: 'Obadiah', JON: 'Jonah', MIC: 'Micah', NAM: 'Nahum',
        HAB: 'Habakkuk', ZEP: 'Zephaniah', HAG: 'Haggai', ZEC: 'Zechariah', MAL: 'Malachi',
        MAT: 'Matthew', MRK: 'Mark', LUK: 'Luke', JHN: 'John', ACT: 'Acts', ROM: 'Romans',
        '1CO': '1 Corinthians', '2CO': '2 Corinthians', GAL: 'Galatians', EPH: 'Ephesians',
        PHP: 'Philippians', COL: 'Colossians', '1TH': '1 Thessalonians',
        '2TH': '2 Thessalonians', '1TI': '1 Timothy', '2TI': '2 Timothy', TIT: 'Titus',
        PHM: 'Philemon', HEB: 'Hebrews', JAS: 'James', '1PE': '1 Peter', '2PE': '2 Peter',
        '1JN': '1 John', '2JN': '2 John', '3JN': '3 John', JUD: 'Jude', REV: 'Revelation'
    };

    /*
     * Expositores com canal no YouTube e pregação pela Bíblia inteira.
     *
     * A escolha não é neutra, e não finge ser: são reformados, como o
     * resto do app — a mesma tradição das confissões que estão em
     * Teologia. Ficam numa fileira à parte, depois da busca aberta, para
     * quem quiser; a busca sem nome nenhum vem primeiro.
     */
    var EXPOSITORES = [
        { nome: 'Hernandes Dias Lopes', l: 'pt' },
        { nome: 'Augustus Nicodemus', l: 'pt' },
        { nome: 'John MacArthur', l: 'en' },
        { nome: 'John Piper', l: 'en' },
        { nome: 'Ligonier R.C. Sproul', l: 'en' }
    ];

    /** Uma busca no YouTube — nunca um vídeo escolhido. */
    function url(termo) {
        return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(termo);
    }

    function refEn(livro, cap) {
        var n = EN[livro.usfm] || livro.nome;
        return n + (cap ? ' ' + cap : '');
    }

    /**
     * As buscas do capítulo (ou do livro inteiro, quando cap é vazio),
     * em três fileiras: português, inglês e por expositor.
     */
    function buscas(livro, cap) {
        var ref = livro.nome + (cap ? ' ' + cap : '');
        var en = refEn(livro, cap);
        var pt = cap
            ? [
                { rotulo: 'Estudo', termo: ref + ' estudo bíblico' },
                { rotulo: 'Pregação', termo: ref + ' pregação' },
                { rotulo: 'Sermão expositivo', termo: ref + ' sermão expositivo' },
                { rotulo: 'Versículo por versículo', termo: ref + ' comentário versículo por versículo' }
            ]
            : [
                { rotulo: 'Panorama do livro', termo: 'panorama do livro de ' + ref },
                { rotulo: 'Introdução', termo: 'introdução ao livro de ' + ref + ' estudo' },
                { rotulo: 'Série expositiva', termo: ref + ' série expositiva pregação' }
            ];
        var ingles = cap
            ? [
                { rotulo: en + ' sermon', termo: en + ' sermon' },
                { rotulo: en + ' verse by verse', termo: en + ' verse by verse commentary' }
            ]
            : [
                { rotulo: en + ' overview', termo: en + ' book overview' }
            ];
        var quem = EXPOSITORES.map(function (e) {
            return {
                rotulo: e.nome.replace(' R.C. Sproul', ''),
                termo: e.nome + ' ' + (e.l === 'pt' ? ref : en)
            };
        });
        return { pt: pt, ingles: ingles, expositores: quem };
    }

    /* Quantas buscas a tela vai mostrar ao todo — o botão usa para não
       prometer o que não há (sempre há, mas o número sai daqui). */
    function quantas(livro, cap) {
        var b = buscas(livro, cap);
        return b.pt.length + b.ingles.length + b.expositores.length;
    }

    return { EN: EN, EXPOSITORES: EXPOSITORES, url: url, buscas: buscas, quantas: quantas };
})();
