/* =========================================================
   Música para cada capítulo: hinos, salmos cantados, louvor.

   Três regras, e elas são o que separa isto de uma lista inventada:

   1. Só entra música que existe mesmo, com título e origem que dá para
      conferir. Onde eu não tinha certeza do título ou de quem fez, não
      inventei nome nenhum: entra uma BUSCA pelo tema, que é honesta
      sobre o que é.
   2. O link é sempre uma BUSCA no YouTube, nunca um vídeo escolhido.
      Vídeo sai do ar, muda de dono, vira outra coisa; busca não quebra.
      E o app não escolhe gravação por ninguém — há dezenas de cada hino.
   3. A relação com o capítulo é dita na cara: 'texto' quando a música
      canta aquele texto (o Salmo 23 cantado é o Salmo 23), 'tema'
      quando ela trata do assunto do capítulo sem ser ele.

   Os 150 salmos têm cobertura inteira, e não por mérito meu: eles foram
   escritos para ser cantados, e há saltérios completos — o Escocês
   (1650), em métrica, e o EveryPsalm, do duo Poor Bishop Hooper, que
   entre 2020 e 2022 publicou uma música por salmo, de graça.
   ========================================================= */
window.B = window.B || {};

B.musica = (function () {
    'use strict';

    /* t: título · de: quem fez ou de onde vem · ano · l: língua · r: relação */
    var CANTOS = {
        /* ---------------- Antigo Testamento ---------------- */
        'GEN 1': [
            { t: 'Grandioso És Tu', de: 'Carl Boberg; versão de Stuart Hine', ano: '1885', l: 'pt', r: 'tema' },
            { t: 'How Great Thou Art', de: 'Carl Boberg / Stuart K. Hine', ano: '1885', l: 'en', r: 'tema' }
        ],
        'GEN 28': [
            { t: 'Mais Perto Quero Estar', de: 'Sarah F. Adams — a escada de Jacó', ano: '1841', l: 'pt', r: 'tema' },
            { t: 'Nearer, My God, to Thee', de: 'Sarah F. Adams', ano: '1841', l: 'en', r: 'tema' }
        ],
        'GEN 32': [
            { t: 'Come, O Thou Traveler Unknown', de: 'Charles Wesley — Jacó luta até o amanhecer', ano: '1742', l: 'en', r: 'tema' }
        ],
        'EXO 3': [
            { t: 'We Are Standing on Holy Ground', de: 'Geron Davis', ano: '1983', l: 'en', r: 'tema' }
        ],
        'NUM 6': [
            { t: 'A Bênção', de: 'versão brasileira de "The Blessing"', ano: '2020', l: 'pt', r: 'texto' },
            { t: 'The Blessing', de: 'Kari Jobe, Cody Carnes e Elevation Worship', ano: '2020', l: 'en', r: 'texto' },
            { t: 'The Lord Bless You and Keep You', de: 'John Rutter', ano: '1981', l: 'en', r: 'texto' }
        ],
        'NEH 8': [
            { t: 'A Alegria do Senhor', de: 'corinho brasileiro; gravado por Fernandinho e por Renascer Praise', ano: '', l: 'pt', r: 'texto' }
        ],
        'JOB 19': [
            { t: 'I Know That My Redeemer Lives', de: 'Samuel Medley', ano: '1775', l: 'en', r: 'texto' },
            { t: 'I Know That My Redeemer Liveth', de: 'G. F. Handel, do "Messias"', ano: '1741', l: 'en', r: 'texto' }
        ],
        'PSA 8': [
            { t: 'How Majestic Is Your Name', de: 'Michael W. Smith', ano: '1981', l: 'en', r: 'texto' }
        ],
        'PSA 19': [
            { t: 'The Heavens Are Telling', de: 'Joseph Haydn, de "A Criação"', ano: '1798', l: 'en', r: 'texto' }
        ],
        'PSA 23': [
            { t: 'The Lord’s My Shepherd', de: 'Saltério Escocês, melodia Crimond', ano: '1650', l: 'en', r: 'texto' },
            { t: 'Psalm 23 (Surely Goodness, Surely Mercy)', de: 'Shane & Shane', ano: '2015', l: 'en', r: 'texto' }
        ],
        'PSA 34': [
            { t: 'Taste and See', de: 'James E. Moore Jr.', ano: '1983', l: 'en', r: 'texto' }
        ],
        'PSA 40': [
            { t: '40', de: 'U2 — o salmo inteiro cantado', ano: '1983', l: 'en', r: 'texto' }
        ],
        'PSA 42': [
            { t: 'Como o Cervo', de: 'versão de "As the Deer", de Martin Nystrom', ano: '1984', l: 'pt', r: 'texto' },
            { t: 'As the Deer', de: 'Martin Nystrom', ano: '1984', l: 'en', r: 'texto' }
        ],
        'PSA 46': [
            { t: 'Castelo Forte', de: 'Martinho Lutero ("Ein feste Burg")', ano: '1529', l: 'pt', r: 'texto' },
            { t: 'A Mighty Fortress Is Our God', de: 'Martinho Lutero', ano: '1529', l: 'en', r: 'texto' }
        ],
        'PSA 51': [
            { t: 'Cria em Mim um Coração Puro', de: 'corinho brasileiro, sobre o v. 10', ano: '', l: 'pt', r: 'texto' },
            { t: 'Create in Me a Clean Heart', de: 'Keith Green', ano: '1984', l: 'en', r: 'texto' }
        ],
        'PSA 72': [
            { t: 'Jesus Shall Reign Where’er the Sun', de: 'Isaac Watts, dos "Salmos de Davi"', ano: '1719', l: 'en', r: 'texto' }
        ],
        'PSA 84': [
            { t: 'Better Is One Day', de: 'Matt Redman', ano: '1995', l: 'en', r: 'texto' }
        ],
        'PSA 90': [
            { t: 'O God, Our Help in Ages Past', de: 'Isaac Watts', ano: '1719', l: 'en', r: 'texto' }
        ],
        'PSA 91': [
            { t: 'On Eagle’s Wings', de: 'Michael Joncas', ano: '1979', l: 'en', r: 'texto' }
        ],
        'PSA 98': [
            { t: 'Ao Mundo Paz, Nasceu Jesus', de: 'Isaac Watts ("Joy to the World"), sobre o Salmo 98', ano: '1719', l: 'pt', r: 'texto' },
            { t: 'Joy to the World', de: 'Isaac Watts', ano: '1719', l: 'en', r: 'texto' }
        ],
        'PSA 100': [
            { t: 'All People That on Earth Do Dwell', de: 'William Kethe, melodia "Old Hundredth"', ano: '1561', l: 'en', r: 'texto' }
        ],
        'PSA 103': [
            { t: '10,000 Reasons (Bless the Lord)', de: 'Matt Redman', ano: '2011', l: 'en', r: 'texto' }
        ],
        'PSA 117': [
            { t: 'From All That Dwell Below the Skies', de: 'Isaac Watts', ano: '1719', l: 'en', r: 'texto' }
        ],
        'PSA 118': [
            { t: 'Este é o Dia', de: 'versão de "This Is the Day", de Les Garrett — o v. 24', ano: '1967', l: 'pt', r: 'texto' },
            { t: 'This Is the Day', de: 'Les Garrett', ano: '1967', l: 'en', r: 'texto' }
        ],
        'PSA 119': [
            { t: 'Thy Word', de: 'Amy Grant e Michael W. Smith — o v. 105', ano: '1984', l: 'en', r: 'texto' }
        ],
        'PSA 121': [
            { t: 'I to the Hills Will Lift Mine Eyes', de: 'Saltério Escocês', ano: '1650', l: 'en', r: 'texto' }
        ],
        'PSA 130': [
            { t: 'Aus tiefer Not schrei ich zu dir', de: 'Martinho Lutero — "das profundezas clamo a ti"', ano: '1524', l: 'en', r: 'texto' }
        ],
        'PSA 136': [
            { t: 'Forever', de: 'Chris Tomlin', ano: '2001', l: 'en', r: 'texto' }
        ],
        'PSA 139': [
            { t: 'Search Me, O God', de: 'J. Edwin Orr — os v. 23-24', ano: '1936', l: 'en', r: 'texto' }
        ],
        'PSA 146': [
            { t: 'I’ll Praise My Maker While I’ve Breath', de: 'Isaac Watts', ano: '1719', l: 'en', r: 'texto' }
        ],
        'PSA 148': [
            { t: 'Praise the Lord! Ye Heavens, Adore Him', de: 'Foundling Hospital Collection', ano: '1796', l: 'en', r: 'texto' }
        ],
        'ECC 3': [
            { t: 'Turn! Turn! Turn!', de: 'Pete Seeger; gravada pelos Byrds — os v. 1-8', ano: '1959', l: 'en', r: 'texto' }
        ],
        'ISA 6': [
            { t: 'Santo! Santo! Santo!', de: 'Reginald Heber', ano: '1826', l: 'pt', r: 'texto' },
            { t: 'Holy, Holy, Holy! Lord God Almighty', de: 'Reginald Heber', ano: '1826', l: 'en', r: 'texto' }
        ],
        'ISA 7': [
            { t: 'Ó Vem, Emanuel', de: 'antífonas latinas do século XII', ano: 'séc. XII', l: 'pt', r: 'tema' },
            { t: 'O Come, O Come, Emmanuel', de: 'antífonas latinas', ano: 'séc. XII', l: 'en', r: 'tema' }
        ],
        'ISA 9': [
            { t: 'For Unto Us a Child Is Born', de: 'G. F. Handel, do "Messias" — o v. 6', ano: '1741', l: 'en', r: 'texto' }
        ],
        'ISA 40': [
            { t: 'Everlasting God (Strength Will Rise)', de: 'Brenton Brown e Ken Riley — o v. 31', ano: '2005', l: 'en', r: 'texto' },
            { t: 'Comfort, Comfort Ye My People', de: 'Johann Olearius', ano: '1671', l: 'en', r: 'texto' }
        ],
        'ISA 53': [
            { t: 'Man of Sorrows! What a Name', de: 'Philip P. Bliss', ano: '1875', l: 'en', r: 'tema' },
            { t: 'How Deep the Father’s Love for Us', de: 'Stuart Townend', ano: '1995', l: 'en', r: 'tema' }
        ],
        'LAM 3': [
            { t: 'Grande é a Tua Fidelidade', de: 'Thomas Chisholm — os v. 22-23', ano: '1923', l: 'pt', r: 'texto' },
            { t: 'Great Is Thy Faithfulness', de: 'Thomas O. Chisholm', ano: '1923', l: 'en', r: 'texto' }
        ],
        'EZK 37': [
            { t: 'Dem Bones (Dry Bones)', de: 'espiritual negro norte-americano', ano: 'séc. XIX', l: 'en', r: 'texto' }
        ],

        /* ---------------- Novo Testamento ---------------- */
        'MAT 6': [
            { t: 'The Lord’s Prayer', de: 'Albert Hay Malotte — o Pai Nosso', ano: '1935', l: 'en', r: 'texto' }
        ],
        'MAT 28': [
            { t: 'Christ the Lord Is Risen Today', de: 'Charles Wesley', ano: '1739', l: 'en', r: 'tema' },
            { t: 'Porque Ele Vive', de: 'versão de "Because He Lives", de Gloria e William Gaither', ano: '1971', l: 'pt', r: 'tema' }
        ],
        'LUK 2': [
            { t: 'Noite Feliz', de: 'Joseph Mohr e Franz Gruber', ano: '1818', l: 'pt', r: 'tema' },
            { t: 'Glória a Deus nas Alturas', de: 'versão de "Angels We Have Heard on High", hino francês', ano: 'séc. XVIII', l: 'pt', r: 'texto' }
        ],
        'JHN 1': [
            { t: 'Of the Father’s Love Begotten', de: 'Aurélio Prudêncio', ano: 'séc. IV', l: 'en', r: 'tema' }
        ],
        'JHN 3': [
            { t: 'God So Loved', de: 'We The Kingdom — o v. 16', ano: '2020', l: 'en', r: 'texto' }
        ],
        'ACT 2': [
            { t: 'Come, Holy Ghost, Our Souls Inspire', de: 'hino latino "Veni Creator Spiritus"', ano: 'séc. IX', l: 'en', r: 'tema' }
        ],
        'ROM 8': [
            { t: 'Before the Throne of God Above', de: 'Charitie Lees Bancroft — os v. 33-34', ano: '1863', l: 'en', r: 'tema' },
            { t: 'In Christ Alone', de: 'Stuart Townend e Keith Getty', ano: '2001', l: 'en', r: 'tema' }
        ],
        '1CO 15': [
            { t: 'Thine Be the Glory', de: 'Edmond Budry', ano: '1884', l: 'en', r: 'tema' }
        ],
        'GAL 6': [
            { t: 'When I Survey the Wondrous Cross', de: 'Isaac Watts, sobre o v. 14', ano: '1707', l: 'en', r: 'texto' }
        ],
        'EPH 2': [
            { t: 'Sublime Graça', de: 'John Newton ("Amazing Grace")', ano: '1779', l: 'pt', r: 'tema' },
            { t: 'Amazing Grace', de: 'John Newton', ano: '1779', l: 'en', r: 'tema' }
        ],
        'EPH 6': [
            { t: 'Stand Up, Stand Up for Jesus', de: 'George Duffield Jr. — os v. 10-11', ano: '1858', l: 'en', r: 'texto' }
        ],
        'PHP 2': [
            { t: 'At the Name of Jesus', de: 'Caroline M. Noel — os v. 9-11', ano: '1870', l: 'en', r: 'texto' }
        ],
        'PHP 4': [
            { t: 'Rejoice in the Lord Always', de: 'corinho tradicional — o v. 4', ano: '', l: 'en', r: 'texto' }
        ],
        'REV 4': [
            { t: 'Santo! Santo! Santo!', de: 'Reginald Heber — o v. 8', ano: '1826', l: 'pt', r: 'texto' },
            { t: 'Revelation Song', de: 'Jennie Lee Riddle', ano: '2004', l: 'en', r: 'texto' }
        ],
        'REV 5': [
            { t: 'Worthy Is the Lamb', de: 'G. F. Handel, coro final do "Messias"', ano: '1741', l: 'en', r: 'texto' },
            { t: 'Worthy Is the Lamb', de: 'Darlene Zschech, Hillsong', ano: '2000', l: 'en', r: 'texto' }
        ],
        'REV 19': [
            { t: 'Aleluia (Coro do Messias)', de: 'G. F. Handel — o v. 6', ano: '1741', l: 'en', r: 'texto' }
        ],
        'REV 22': [
            { t: 'Even So Come', de: 'Chris Tomlin — "vem, Senhor Jesus"', ano: '2015', l: 'en', r: 'texto' }
        ]
    };

    /*
     * Buscas por tema, onde eu sei que se canta aquilo mas não tenho
     * certeza do título ou de quem fez. É mais honesto do que chutar um
     * nome: leva a pessoa ao lugar certo sem afirmar o que não sei.
     */
    var TEMAS = {
        'GEN 22': ['Jeová Jireh louvor'],
        'EXO 15': ['cântico de Moisés Êxodo 15 louvor'],
        'JOS 24': ['eu e a minha casa serviremos ao Senhor louvor'],
        '2CH 7': ['se o meu povo se humilhar louvor'],
        'RUT 1': ['aonde fores irei Rute louvor'],
        'PRO 3': ['confia no Senhor de todo o teu coração louvor'],
        'ISA 43': ['não temas porque eu te remi louvor'],
        'ISA 55': ['ó vós todos os sedentos louvor'],
        'DAN 3': ['forno de fogo Daniel 3 louvor'],
        'HAB 3': ['ainda que a figueira não floresça louvor'],
        'MIC 6': ['o que o Senhor pede de ti Miquéias 6.8 louvor'],
        'MAL 3': ['trazei todos os dízimos louvor'],
        'MAT 5': ['bem-aventurados Mateus 5 cantado'],
        'MAT 11': ['vinde a mim todos os cansados louvor'],
        'MAT 27': ['Ó Fronte Ensanguentada hino da paixão'],
        'MRK 15': ['hino da paixão de Cristo'],
        'LUK 1': ['Magnificat cantado'],
        'LUK 15': ['filho pródigo louvor'],
        'LUK 23': ['hino da cruz Lucas 23'],
        'LUK 24': ['Cristo ressuscitou hino de páscoa'],
        'JHN 14': ['eu sou o caminho a verdade e a vida louvor'],
        'JHN 15': ['permanecei em mim videira louvor'],
        'JHN 20': ['Cristo ressuscitou hino de páscoa'],
        'ACT 16': ['crê no Senhor Jesus e serás salvo louvor'],
        'ROM 12': ['sacrifício vivo Romanos 12 louvor'],
        '1CO 13': ['1 Coríntios 13 o amor cantado'],
        '2CO 12': ['a minha graça te basta louvor'],
        'GAL 2': ['já não sou eu quem vive Gálatas 2.20 louvor'],
        'COL 3': ['buscai as coisas que são de cima louvor'],
        '1TH 4': ['a volta de Cristo louvor'],
        'HEB 11': ['pela fé Hebreus 11 louvor'],
        'HEB 12': ['olhando para Jesus louvor'],
        'JAS 1': ['provações alegria Tiago 1 louvor'],
        '1PE 1': ['esperança viva 1 Pedro louvor'],
        'REV 21': ['nova Jerusalém louvor']
    };

    function chave(usfm, cap) { return usfm + ' ' + (cap || 1); }

    /** As músicas que eu sei nomear para este capítulo. */
    function cantos(usfm, cap) {
        return (CANTOS[chave(usfm, cap)] || []).slice();
    }

    function quantos(usfm, cap) {
        return cantos(usfm, cap).length;
    }

    /** Uma busca no YouTube — nunca um vídeo escolhido. */
    function url(termo) {
        return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(termo);
    }

    /**
     * As buscas a oferecer para o capítulo: o tema conhecido, quando há, e
     * sempre a busca pela referência. Capítulo nenhum fica sem caminho.
     */
    function buscas(usfm, cap, nome) {
        var ref = nome + ' ' + cap;
        var lista = (TEMAS[chave(usfm, cap)] || []).map(function (q) {
            return { rotulo: q, termo: q };
        });
        if (usfm === 'PSA') {
            lista.push({ rotulo: 'Salmo ' + cap + ' cantado', termo: 'Salmo ' + cap + ' cantado' });
            lista.push({ rotulo: 'EveryPsalm ' + cap, termo: 'EveryPsalm Psalm ' + cap + ' Poor Bishop Hooper' });
        }
        lista.push({ rotulo: ref + ' louvor', termo: ref + ' louvor música' });
        lista.push({ rotulo: ref + ' hino', termo: ref + ' hino cantado' });
        return lista;
    }

    /* Tem alguma coisa a mostrar além da busca pela referência? */
    function temAlgo(usfm, cap) {
        return !!(CANTOS[chave(usfm, cap)] || TEMAS[chave(usfm, cap)] || usfm === 'PSA');
    }

    function total() {
        var n = 0;
        Object.keys(CANTOS).forEach(function (k) { n += CANTOS[k].length; });
        return n;
    }

    /* Quantos capítulos têm algo além da busca pela referência — os 150
       salmos contam, porque todos eles têm saltério completo. */
    function capitulos() {
        var vistos = {};
        Object.keys(CANTOS).forEach(function (k) { vistos[k] = 1; });
        Object.keys(TEMAS).forEach(function (k) { vistos[k] = 1; });
        for (var c = 1; c <= 150; c++) vistos['PSA ' + c] = 1;
        return Object.keys(vistos).length;
    }

    return {
        CANTOS: CANTOS, TEMAS: TEMAS,
        cantos: cantos, quantos: quantos, buscas: buscas, url: url,
        temAlgo: temAlgo, total: total, capitulos: capitulos
    };
})();
