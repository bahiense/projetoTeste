/* =========================================================
   TELA MAPA — onde o capítulo acontece.

   Um SVG desenhado na hora: a costa, os rios e os lagos da região em
   traço (Natural Earth, domínio público) e, por cima, os lugares que o
   capítulo nomeia (STEPBible, CC BY). Tudo offline, inclusive no avião.

   A janela aperta nos lugares do capítulo: Gênesis 12 abre em Canaã,
   Atos 27 abre no Mediterrâneo inteiro. Mapa que mostra sempre a mesma
   coisa não diz onde o capítulo acontece — diz onde fica o Oriente
   Médio, que a pessoa já sabe.
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.mapa = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, bib = B.biblia;

    /*
     * A janela do desenho é SEMPRE 360x260 unidades, e é a área
     * geográfica que se ajusta a ela — não o contrário.
     *
     * Com o viewBox variando, a letra do rótulo (que é medida em unidades
     * do viewBox) crescia junto com o zoom: em Josué 10, que cabe em um
     * grau, os nomes saíam do tamanho de um dedo.
     */
    var LARGURA = 360;
    var ALTURA = 260;

    function separar(ref) {
        var m = (ref || '').match(/^(.*?)\s+(\d+)$/);
        if (!m) return null;
        var livro = bib.livro(m[1]);
        if (!livro) return null;
        var cap = parseInt(m[2], 10);
        if (!cap || cap > livro.caps) return null;
        return { livro: livro, capitulo: cap };
    }

    function render(arg) {
        var alvo = separar(arg);
        if (!alvo) {
            return '<header class="tela-topo"><a class="voltar" href="#/hoje">‹ hoje</a>' +
                '<h2>Mapa</h2></header><p class="dica">Não reconheci esse capítulo.</p>';
        }
        var ref = alvo.livro.nome + ' ' + alvo.capitulo;
        return '<header class="tela-topo">' +
            '<a class="voltar" href="#/estudo/' + encodeURIComponent(ref) + '">‹ estudo</a>' +
            '<h2>Mapa</h2>' +
            '<p class="tela-sub">' + esc(ref) + ' · onde o capítulo acontece</p>' +
            '<div class="grupo-botoes grupo-botoes--dois">' +
            '<a class="btn btn--fraco" href="#/ler/' + encodeURIComponent(ref) + '">Ler o texto</a>' +
            '<a class="btn btn--fraco" href="#/estudo/' + encodeURIComponent(ref) + '">O estudo</a>' +
            '</div>' +
            '</header>' +
            '<div id="mapa-corpo"><p class="carregando">Abrindo o mapa…</p></div>';
    }

    function depois(el, arg) {
        var alvo = separar(arg);
        var caixa = ui.$('mapa-corpo');
        if (!alvo || !caixa) return;
        B.lugares.carregar().then(function () {
            var lista = B.lugares.doCapitulo(alvo.livro.usfm, alvo.capitulo);
            if (!lista.length) return caixa.innerHTML = vazio();
            caixa.innerHTML = desenhar(lista) + listar(lista) + rodape();
        }, function () {
            caixa.innerHTML = '<p class="dica">Não consegui abrir o mapa agora.</p>';
        });
    }

    function vazio() {
        return '<section class="cartao">' +
            '<p class="dica"><b>Este capítulo não nomeia nenhum lugar.</b> ' +
            'Acontece com boa parte dos Salmos, dos Provérbios e das cartas: eles falam ' +
            'de Deus e da vida, não de geografia.</p></section>';
    }

    /* ---------- o desenho ---------- */

    function desenhar(lista) {
        var base = B.lugares.mapaBase();
        var j = B.lugares.janela(lista);
        /* Perto do equador um grau de longitude é quase um grau de
           latitude; aqui, não — sem o cosseno a Palestina fica gorda. */
        var k = Math.cos((j.y0 + j.y1) / 2 * Math.PI / 180);

        /* Encaixa a área no formato fixo, alargando o lado que sobra —
           nunca apertando, para nenhum lugar ficar de fora. */
        var larg = (j.x1 - j.x0) * k;
        var alt = j.y1 - j.y0;
        if (larg / alt < LARGURA / ALTURA) {
            var nova = alt * (LARGURA / ALTURA) / k;
            var mx = (j.x0 + j.x1) / 2;
            j = { x0: mx - nova / 2, x1: mx + nova / 2, y0: j.y0, y1: j.y1 };
        } else {
            var novaA = larg * (ALTURA / LARGURA);
            var my = (j.y0 + j.y1) / 2;
            j = { x0: j.x0, x1: j.x1, y0: my - novaA / 2, y1: my + novaA / 2 };
        }
        var escala = ALTURA / (j.y1 - j.y0);

        function px(x) { return ((x - j.x0) * k * escala).toFixed(1); }
        function py(y) { return ((j.y1 - y) * escala).toFixed(1); }

        function caminho(linhas, fechar) {
            return (linhas || []).map(function (l) {
                var d = '';
                for (var i = 0; i < l.length; i++) {
                    if (l[i][0] < j.x0 - 2 || l[i][0] > j.x1 + 2) continue;
                    if (l[i][1] < j.y0 - 2 || l[i][1] > j.y1 + 2) continue;
                    d += (d ? 'L' : 'M') + px(l[i][0]) + ' ' + py(l[i][1]);
                }
                return d ? d + (fechar ? 'Z' : '') : '';
            }).filter(Boolean).join(' ');
        }

        var svg = '<svg class="mapa" viewBox="0 0 ' + LARGURA + ' ' + ALTURA + '" ' +
            'width="100%" preserveAspectRatio="xMidYMid meet" role="img" ' +
            'aria-label="Mapa dos lugares do capítulo">' +
            '<rect width="100%" height="100%" class="mapa-fundo"/>';
        if (base) {
            svg += '<path class="mapa-rios" d="' + caminho(base.rios) + '"/>' +
                '<path class="mapa-lagos" d="' + caminho(base.lagos, true) + '"/>' +
                '<path class="mapa-costa" d="' + caminho(base.costa) + '"/>';
        }
        /*
         * Rótulo que cai em cima de outro não informa nada: em Gênesis 12,
         * Siquém, Betel, Canaã e Ai ficam a poucos quilômetros e os quatro
         * nomes viravam um borrão. Cada nome tenta quatro posições; se as
         * quatro estiverem ocupadas, fica só o pino — e a lista embaixo
         * nomeia todos, sempre.
         */
        var caixas = [];
        function livre(c) {
            return !caixas.some(function (o) {
                return c.x1 > o.x0 && c.x0 < o.x1 && c.y1 > o.y0 && c.y0 < o.y1;
            });
        }
        lista.forEach(function (l, i) {
            var x = +px(l.x), y = +py(l.y);
            var larg = l.n.length * 4.7 + 4;
            var jeitos = [
                { dx: 0, dy: 11, a: 'middle', x0: x - larg / 2, x1: x + larg / 2 },
                { dx: 0, dy: -7, a: 'middle', x0: x - larg / 2, x1: x + larg / 2 },
                { dx: 6, dy: 3, a: 'start', x0: x + 6, x1: x + 6 + larg },
                { dx: -6, dy: 3, a: 'end', x0: x - 6 - larg, x1: x - 6 }
            ];
            var posto = null;
            for (var k = 0; k < jeitos.length && !posto; k++) {
                var j2 = jeitos[k];
                var c = { x0: j2.x0, x1: j2.x1, y0: y + j2.dy - 9, y1: y + j2.dy + 2 };
                if (livre(c)) { caixas.push(c); posto = j2; }
            }
            caixas.push({ x0: x - 4, x1: x + 4, y0: y - 4, y1: y + 4 });
            svg += '<g class="mapa-pino" data-pino="' + i + '">' +
                '<circle cx="' + x + '" cy="' + y + '" r="3.2"/>' +
                (posto
                    ? '<text x="' + (x + posto.dx) + '" y="' + (y + posto.dy) +
                    '" text-anchor="' + posto.a + '">' + esc(l.n) + '</text>'
                    : '') +
                '</g>';
        });
        return '<div class="mapa-caixa">' + svg + '</div>';
    }

    function listar(lista) {
        return '<h3 class="secao">' + lista.length + ' lugar' +
            (lista.length === 1 ? '' : 'es') + ' neste capítulo</h3>' +
            '<div class="lugares">' + lista.map(function (l, i) {
                return '<div class="lugar" data-lugar="' + i + '">' +
                    '<div class="lugar-topo"><b>' + esc(l.n) + '</b>' +
                    (l.en ? '<small>' + esc(l.en) + '</small>' : '') + '</div>' +
                    (l.d ? '<p class="dica">' + esc(l.d) + '</p>' : '') +
                    '<a class="btn btn--mini" target="_blank" rel="noopener" href="' +
                    esc(B.lugares.linkExterno(l)) + '">Ver no mapa de hoje</a>' +
                    '</div>';
            }).join('') + '</div>';
    }

    function rodape() {
        return '<p class="dica rodape-dica">Lugares e coordenadas: ' +
            '<b>STEPBible / Tyndale House</b> (CC BY 4.0). Costa, rios e lagos: ' +
            '<b>Natural Earth</b> (domínio público). O desenho é feito no aparelho e ' +
            'funciona sem internet — só o botão "ver no mapa de hoje" precisa dela.<br>' +
            'A localização de muitos lugares da Bíblia é <b>proposta</b>, não certa: ' +
            'escavação nova muda identificação, e há sítios disputados. Leia o pino como ' +
            '"é por aqui", não como "é exatamente aqui".</p>';
    }

    return { render: render, depois: depois };
})();
