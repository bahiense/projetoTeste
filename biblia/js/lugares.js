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

    return {
        carregar: carregar, tem: tem, temAlgum: temAlgum, contexto: contexto,
        doCapitulo: doCapitulo, quantos: quantos,
        mapaBase: mapaBase, janela: janela, linkExterno: linkExterno
    };
})();
