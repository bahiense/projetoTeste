/* =========================================================
   Os lugares de cada capítulo, e o mapa onde eles ficam.

   Duas fontes, as duas livres:

   - STEPBible / Tyndale House (CC BY 4.0): cada lugar da Bíblia com
     coordenada e uma linha de descrição, e — o que importa — em quais
     capítulos ele aparece de fato, versículo a versículo, do texto
     hebraico e grego etiquetado.
   - Natural Earth (domínio público): a costa, os lagos e os rios da
     região, em traço vetorial.

   Nada de tiles de servidor: tile precisa de internet e de atribuição
   por uso, e este app abre no avião. Traço vetorial pesa 47 KB, desenha
   offline e não borra quando aproxima.

   A coordenada é a identificação que os geógrafos propõem hoje; para
   vários lugares da Bíblia ela é discutida, e a tela diz isso.
   ========================================================= */
window.B = window.B || {};

B.lugares = (function () {
    'use strict';

    var ARQ_LUGARES = 'data/lugares.json';
    var ARQ_MAPA = 'data/mapa-base.json';

    var dados = null;       // null = não tentou, false = não está aqui
    var base = null;
    var buscando = null;

    function carregar() {
        if (dados !== null) return Promise.resolve(dados);
        if (buscando) return buscando;
        buscando = Promise.all([pegar(ARQ_LUGARES), pegar(ARQ_MAPA)]).then(function (r) {
            dados = r[0] || false;
            base = r[1] || false;
            return dados;
        });
        return buscando;
    }

    function pegar(arq) {
        return fetch(arq).then(function (r) {
            return r.ok ? r.json() : null;
        }).catch(function () { return null; });
    }

    function chave(usfm, cap) { return usfm + ' ' + cap; }

    /* Tem lugar neste capítulo? Só vale depois de carregar(). */
    function tem(usfm, cap) {
        return !!(dados && cap && dados.capitulos[chave(usfm, cap)]);
    }

    function doCapitulo(usfm, cap) {
        if (!dados) return [];
        var ids = dados.capitulos[chave(usfm, cap)] || [];
        return ids.map(function (i) { return dados.lugares[i]; }).filter(Boolean);
    }

    /*
     * O capítulo de discurso que não cita lugar nenhum.
     *
     * João 13 é a ceia, o lava-pés, o novo mandamento: a cena continua em
     * Jerusalém, e o texto não repete onde está. Mostrar "nenhum lugar" ali
     * é tecnicamente certo e inútil. Então o mapa empresta o capítulo mais
     * próximo DO MESMO LIVRO que cita lugar — e diz que é emprestado.
     *
     * Três capítulos para cada lado, não mais: a cena de João 13 vem de
     * João 12, mas o lugar citado em Romanos 1 não é o cenário de Romanos
     * 14 — ali não há cena nenhuma, há argumento.
     */
    var ALCANCE = 3;

    /*
     * Livro em que capítulo vizinho não é cena vizinha.
     *
     * Cada salmo é um poema inteiro, escrito por outra mão, em outro
     * século; Provérbios é coleção de ditos. Emprestar ao Salmo 117 o mapa
     * do Salmo 114 não seria contexto, seria invenção.
     */
    var SEM_CONTEXTO = { PSA: 1, PRO: 1 };

    function contexto(usfm, cap) {
        if (!dados || !cap || tem(usfm, cap) || SEM_CONTEXTO[usfm]) return null;
        var livro = B.biblia.LIVROS.filter(function (l) { return l.usfm === usfm; })[0];
        if (!livro) return null;
        for (var d = 1; d <= ALCANCE; d++) {
            /* O de trás primeiro: a cena quase sempre vem de antes. */
            var atras = cap - d, frente = cap + d;
            if (atras >= 1 && tem(usfm, atras)) {
                return { cap: atras, distancia: d, antes: true,
                    lista: doCapitulo(usfm, atras) };
            }
            if (frente <= livro.caps && tem(usfm, frente)) {
                return { cap: frente, distancia: d, antes: false,
                    lista: doCapitulo(usfm, frente) };
            }
        }
        return null;
    }

    /* O botão do mapa vale quando há o que mostrar: o próprio capítulo ou
       o vizinho emprestado. */
    function temAlgum(usfm, cap) {
        return tem(usfm, cap) || !!contexto(usfm, cap);
    }

    function quantos() {
        if (!dados) return { lugares: 0, capitulos: 0 };
        return {
            lugares: dados.lugares.length,
            capitulos: Object.keys(dados.capitulos).length
        };
    }

    function mapaBase() { return base || null; }

    /**
     * A janela do desenho: os lugares do capítulo, com folga — e nunca
     * menor que meio grau, senão um capítulo com um lugar só abriria
     * num zoom de rua, onde o traço da costa não diz nada.
     */
    function janela(lista) {
        var xs = lista.map(function (l) { return l.x; });
        var ys = lista.map(function (l) { return l.y; });
        var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
        var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
        var folga = Math.max((x1 - x0), (y1 - y0)) * 0.25 + 0.35;
        x0 -= folga; x1 += folga; y0 -= folga; y1 += folga;
        var minimo = 1.2;
        if (x1 - x0 < minimo) {
            var mx = (x0 + x1) / 2; x0 = mx - minimo / 2; x1 = mx + minimo / 2;
        }
        if (y1 - y0 < minimo) {
            var my = (y0 + y1) / 2; y0 = my - minimo / 2; y1 = my + minimo / 2;
        }
        return { x0: x0, x1: x1, y0: y0, y1: y1 };
    }

    /* Link para o mapa de verdade, com satélite e rua — para quem quiser
       ver o lugar hoje. Isto, sim, precisa de internet. */
    function linkExterno(l) {
        return 'https://www.openstreetmap.org/?mlat=' + l.y + '&mlon=' + l.x +
            '#map=11/' + l.y + '/' + l.x;
    }

    function todos() {
        return dados && dados.lugares ? dados.lugares : [];
    }

    /* Coordenadas de apoio para regiões e topônimos em português muito frequentes nos estudos */
    var EXTRAS_PT = {
        'sinai': { n: 'Monte Sinai (Horebe)', en: 'Mount Sinai', y: 28.5394, x: 33.975, d: 'Montanha da Aliança na península do Sinai onde Deus entregou a Lei a Moisés.' },
        'monte sinai': { n: 'Monte Sinai (Horebe)', en: 'Mount Sinai', y: 28.5394, x: 33.975, d: 'Montanha da Aliança na península do Sinai onde Deus entregou a Lei a Moisés.' },
        'deserto do sinai': { n: 'Deserto do Sinai', en: 'Wilderness of Sinai', y: 28.65, x: 33.95, d: 'Região árida ao redor do Monte Sinai onde Israel acampou e ergueu o Tabernáculo.' },
        'horebe': { n: 'Monte Horebe (Sinai)', en: 'Mount Horeb', y: 28.5394, x: 33.975, d: 'O Monte de Deus, onde Moisés viu a sarça ardente e Elias ouviu a voz mansa e delicada.' },
        'monte horebe': { n: 'Monte Horebe (Sinai)', en: 'Mount Horeb', y: 28.5394, x: 33.975, d: 'O Monte de Deus na região do Sinai.' },
        'jerusalem': { n: 'Jerusalém', en: 'Jerusalem', y: 31.7774, x: 35.2349, d: 'Cidade de Davi, sede do Templo e lugar da crucificação e ressurreição de Cristo.' },
        'siao': { n: 'Monte Sião (Jerusalém)', en: 'Mount Zion', y: 31.7717, x: 35.2289, d: 'Colina histórica de Jerusalém, símbolo da habitação do Grande Rei e da Cidade de Deus.' },
        'monte siao': { n: 'Monte Sião (Jerusalém)', en: 'Mount Zion', y: 31.7717, x: 35.2289, d: 'Colina histórica de Jerusalém e sede do trono davídico.' },
        'moria': { n: 'Monte Moriá', en: 'Mount Moriah', y: 31.7781, x: 35.2354, d: 'Monte em Jerusalém onde Abraão ofereceu Isaque e Salomão edificou o Templo.' },
        'monte moria': { n: 'Monte Moriá', en: 'Mount Moriah', y: 31.7781, x: 35.2354, d: 'Monte em Jerusalém onde Abraão ofereceu Isaque e Salomão edificou o Templo.' },
        'monte das oliveiras': { n: 'Monte das Oliveiras', en: 'Mount of Olives', y: 31.7781, x: 35.2472, d: 'Monte a leste de Jerusalém, cenário do discurso profético e da ascensão de Jesus.' },
        'jordao': { n: 'Rio Jordão', en: 'Jordan River', y: 32.1, x: 35.55, d: 'Principal rio da Terra Prometida, atravessado por Josué e local do batismo de Jesus.' },
        'rio jordao': { n: 'Rio Jordão', en: 'Jordan River', y: 32.1, x: 35.55, d: 'Principal rio da Terra Prometida, do Hermom ao Mar Morto.' },
        'mar morto': { n: 'Mar Morto (Mar Salgado)', en: 'Dead Sea', y: 31.5, x: 35.48, d: 'Lago salgado no ponto mais baixo da terra, entre Judá e Moabe.' },
        'mar salgado': { n: 'Mar Salgado (Mar Morto)', en: 'Salt Sea', y: 31.5, x: 35.48, d: 'Nome bíblico do Mar Morto na fronteira oriental de Judá.' },
        'mar da galileia': { n: 'Mar da Galileia (Quinerete / Tiberíades)', en: 'Sea of Galilee', y: 32.82, x: 35.58, d: 'Lago de água doce no norte de Israel, centro do ministério público de Jesus.' },
        'lago de genesare': { n: 'Lago de Genesaré (Mar da Galileia)', en: 'Lake of Gennesaret', y: 32.82, x: 35.58, d: 'Mar da Galileia, onde Jesus chamou pescadores e acalmou a tempestade.' },
        'mar vermelho': { n: 'Mar Vermelho (Yam Suph)', en: 'Red Sea', y: 29.5, x: 32.8, d: 'Corpo de água atravessado por Israel na saída do Egito.' },
        'cades': { n: 'Cades-Barneia', en: 'Kadesh-barnea', y: 30.648, x: 34.422, d: 'Oásis na fronteira sul de Canaã onde Israel acampou no deserto.' },
        'cades-barneia': { n: 'Cades-Barneia', en: 'Kadesh-barnea', y: 30.648, x: 34.422, d: 'Oásis entre os desertos de Parã e Zim, ponto de partida dos doze espias.' },
        'para': { n: 'Deserto de Parã', en: 'Wilderness of Paran', y: 29.8, x: 34.2, d: 'Vasta região desértica na península do Sinai percorrida por Israel.' },
        'deserto de para': { n: 'Deserto de Parã', en: 'Wilderness of Paran', y: 29.8, x: 34.2, d: 'Vasta região desértica na península do Sinai percorrida por Israel.' },
        'deserto de zim': { n: 'Deserto de Zim', en: 'Wilderness of Zin', y: 30.8, x: 34.8, d: 'Região árida ao sul de Judá onde ficava Cades-Barneia.' },
        'neguebe': { n: 'Neguebe (Sul de Judá)', en: 'Negev', y: 31.1, x: 34.8, d: 'Região semiárida ao sul de Judá por onde caminharam Abraão, Isaque e Jacó.' },
        'sefela': { n: 'Sefelá (Campina de Judá)', en: 'Shephelah', y: 31.7, x: 34.9, d: 'Colinas baixas entre a planície costeira filisteia e as montanhas de Judá.' },
        'juda': { n: 'Território de Judá', en: 'Judah', y: 31.55, x: 35.1, d: 'Região montanhosa do sul, território da tribo real de Davi.' },
        'judeia': { n: 'Judeia', en: 'Judea', y: 31.65, x: 35.18, d: 'Região sul da terra de Israel nos tempos do Segundo Templo e do Novo Testamento.' },
        'samaria': { n: 'Samaria', en: 'Samaria', y: 32.2764, x: 35.195, d: 'Capital do Reino do Norte (Israel) fundada por Onri e região central entre Judeia e Galileia.' },
        'jerico': { n: 'Jericó', en: 'Jericho', y: 31.8711, x: 35.4442, d: 'Cidade das Palmeiras no vale do Jordão, primeira fortaleza conquistada sob Josué.' },
        'siquem': { n: 'Siquém', en: 'Shechem', y: 32.2137, x: 35.2818, d: 'Cidade entre os montes Ebal e Gerizim, onde Deus apareceu a Abrão e Josué renovou a aliança.' },
        'silo': { n: 'Siló', en: 'Shiloh', y: 32.0556, x: 35.2894, d: 'Centro de adoração onde o Tabernáculo e a Arca permaneceram nos dias dos Juízes e de Samuel.' },
        'nazare': { n: 'Nazaré', en: 'Nazareth', y: 32.7022, x: 35.2978, d: 'Vila na baixa Galileia onde Jesus cresceu.' },
        'ur': { n: 'Ur dos Caldeus', en: 'Ur of the Chaldeans', y: 30.9625, x: 46.1031, d: 'Antiga metrópole na baixa Mesopotâmia de onde Deus chamou Abrão.' },
        'ninive': { n: 'Nínive', en: 'Nineveh', y: 36.3594, x: 43.1529, d: 'Grande capital do Império Assírio às margens do rio Tigre, onde Jonas pregou.' },
        'susa': { n: 'Susã', en: 'Susa', y: 32.1892, x: 48.2579, d: 'Capital de inverno do Império Persa, cenário do livro de Ester e ponto de partida de Neemias.' },
        'persia': { n: 'Império Persa (Elão)', en: 'Persia', y: 32.1892, x: 48.2579, d: 'Potência que sucedeu a Babilônia e autorizou o retorno dos judeus sob Ciro.' },
        'roma': { n: 'Roma', en: 'Rome', y: 41.8902, x: 12.4922, d: 'Capital do Império Romano, destinatária da carta de Paulo e onde o apóstolo pregou em Atos 28.' },
        'filipos': { n: 'Filipos', en: 'Philippi', y: 41.0131, x: 24.2842, d: 'Colônia romana na Macedônia, primeira igreja plantada por Paulo na Europa (Atos 16).' },
        'tessalonica': { n: 'Tessalônica', en: ' Thessalonica', y: 40.6401, x: 22.9444, d: 'Capital da província da Macedônia onde Paulo plantou uma igreja vibrante (Atos 17).' },
        'creta': { n: 'Ilha de Creta', en: 'Crete', y: 35.2401, x: 24.8093, d: 'Grande ilha do Mediterrâneo onde Tito organizou presbíteros nas igrejas.' },
        'patmos': { n: 'Ilha de Patmos', en: 'Patmos', y: 37.325, x: 26.5419, d: 'Ilha no mar Egeu onde o apóstolo João recebeu as visões do Apocalipse.' },
        'monte carmelo': { n: 'Monte Carmelo', en: 'Mount Carmel', y: 32.7294, x: 35.0498, d: 'Cordilheira junto ao Mediterrâneo onde Elias confrontou os profetas de Baal.' },
        'monte nebo': { n: 'Monte Nebo (Pisga)', en: 'Mount Nebo', y: 31.7669, x: 35.725, d: 'Monte em Moabe de onde Moisés contemplou toda a Terra Prometida antes de morrer.' },
        'pisga': { n: 'Cume de Pisga (Monte Nebo)', en: 'Pisgah', y: 31.7669, x: 35.725, d: 'Cume da cordilheira de Abarim, de frente para Jericó.' },
        'midia': { n: 'Terra de Midiã', en: 'Midian', y: 28.5, x: 35.2, d: 'Região a leste do golfo de Ácaba onde Moisés viveu quarenta anos junto a Jetro.' },
        'moabe': { n: 'Terra de Moabe', en: 'Moab', y: 31.4, x: 35.7, d: 'Planalto a leste do Mar Morto, terra natal de Rute e última parada de Israel antes do Jordão.' },
        'jaboque': { n: 'Vau do Jaboque', en: 'Jabbok River', y: 32.19, x: 35.68, d: 'Afluente oriental do Jordão onde Jacó lutou com o Anjo e recebeu o nome Israel.' },
        'manre': { n: 'Carvalhos de Manre (Hebrom)', en: 'Mamre', y: 31.55, x: 35.1, d: 'Local próximo a Hebrom onde Abraão armou sua tenda e edificou altar ao Senhor.' }
    };

    function normalizarNome(s) {
        return String(s || '')
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /* Busca um lugar pelo nome (em português ou inglês), priorizando os lugares do capítulo atual */
    function buscar(nomeBruto, usfm, cap) {
        if (!nomeBruto) return null;
        var alvoNorm = normalizarNome(nomeBruto)
            .replace(/^(o |a |os |as |no |na |em |de |do |da |dos |das )+/, '')
            .trim();
        if (!alvoNorm) return null;

        var semPrefixo = alvoNorm
            .replace(/^(monte|montes|rio|ribeiro|mar|lago|vale|vale de|deserto|deserto de|deserto do|planicie|planicies de|terra de|cidade de|regiao de|ilha de|cume de|fonte de|poco de|caminho de)\s+/, '')
            .trim();

        var listaCap = (dados && usfm && cap) ? doCapitulo(usfm, cap) : [];
        var listaTodos = todos();

        function bate(l, chaveNorm) {
            var nNorm = normalizarNome(l.n);
            var enNorm = l.en ? normalizarNome(l.en) : '';
            return nNorm === chaveNorm || enNorm === chaveNorm;
        }

        /* 1. Tenta achar nos lugares do próprio capítulo primeiro */
        var i;
        for (i = 0; i < listaCap.length; i++) {
            if (bate(listaCap[i], alvoNorm) || (semPrefixo && bate(listaCap[i], semPrefixo))) {
                return listaCap[i];
            }
        }

        /* 2. Tenta no dicionário de apoio em português */
        if (EXTRAS_PT[alvoNorm]) return EXTRAS_PT[alvoNorm];
        if (semPrefixo && EXTRAS_PT[semPrefixo]) return EXTRAS_PT[semPrefixo];

        /* 3. Tenta correspondência exata na base completa do STEPBible */
        for (i = 0; i < listaTodos.length; i++) {
            if (bate(listaTodos[i], alvoNorm) || (semPrefixo && bate(listaTodos[i], semPrefixo))) {
                return listaTodos[i];
            }
        }

        /* 4. Tenta correspondência parcial nos lugares do capítulo ou na base */
        if (semPrefixo.length >= 4) {
            for (i = 0; i < listaCap.length; i++) {
                var nc = normalizarNome(listaCap[i].n);
                if (nc.indexOf(semPrefixo) >= 0 || semPrefixo.indexOf(nc) >= 0) return listaCap[i];
            }
            for (i = 0; i < listaTodos.length; i++) {
                var nt = normalizarNome(listaTodos[i].n);
                if (nt.indexOf(semPrefixo) === 0) return listaTodos[i];
            }
        }
        return null;
    }

    return {
        carregar: carregar, tem: tem, temAlgum: temAlgum, contexto: contexto,
        doCapitulo: doCapitulo, quantos: quantos, todos: todos, buscar: buscar,
        mapaBase: mapaBase, janela: janela, linkExterno: linkExterno
    };
})();
