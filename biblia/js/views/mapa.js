/* =========================================================
   TELA MAPA — onde o capítulo acontece.

   Um SVG desenhado na hora, offline: terra e mar pintados, rios, lagos,
   a costa, as fronteiras de hoje bem fracas (só para a pessoa se
   situar), os nomes das regiões — e por cima os lugares que o capítulo
   nomeia.

   A janela abre no capítulo: Gênesis 12 em Canaã, Atos 27 no
   Mediterrâneo inteiro. Mas ela não fica presa: dá para afastar,
   arrastar e voltar. Mapa que mostra só um quadradinho em volta dos
   pinos não mostra a região — e saber onde fica a região é metade do
   que um mapa serve.

   Fontes: Natural Earth (domínio público) para o desenho, STEPBible /
   Tyndale House (CC BY 4.0) para os lugares.
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.mapa = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, bib = B.biblia;

    /* A janela do desenho é SEMPRE 360x260 unidades, e é a área
       geográfica que se ajusta a ela. Com o viewBox variando, a letra
       dos rótulos (medida em unidades do viewBox) crescia junto com o
       zoom e os nomes saíam do tamanho de um dedo. */
    var LARGURA = 360;
    var ALTURA = 260;

    var atual = null;   // { lista, j } — a janela pode mudar sem trocar de tela

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
            var ctx = lista.length ? null : B.lugares.contexto(alvo.livro.usfm, alvo.capitulo);
            if (ctx) lista = ctx.lista;
            if (!lista.length) { caixa.innerHTML = vazio(); return; }
            atual = { lista: lista, j: encaixar(B.lugares.janela(lista)) };
            caixa.innerHTML =
                (ctx ? emprestado(alvo, ctx) : '') +
                '<div class="mapa-caixa"><div id="mapa-svg"></div>' + controles() + '</div>' +
                listar(lista, ctx ? alvo.livro.nome + ' ' + ctx.cap : '') + rodape();
            pintarMapa();
            ligar();
        }, function () {
            caixa.innerHTML = '<p class="dica">Não consegui abrir o mapa agora.</p>';
        });
    }

    /* O aviso de que o mapa é do vizinho. Vem ANTES do desenho, e não num
       rodapé: quem olha um mapa acredita no que vê em dois segundos. */
    function emprestado(alvo, ctx) {
        var ref = alvo.livro.nome + ' ' + ctx.cap;
        return '<section class="cartao aviso-mapa">' +
            '<p class="dica"><b>Este capítulo não cita nenhum lugar.</b> ' +
            'O mapa abaixo é de <b>' + esc(ref) + '</b>, ' +
            ctx.distancia + ' capítulo' + (ctx.distancia === 1 ? '' : 's') +
            (ctx.antes ? ' antes' : ' depois') + ' — o mais perto que este livro nomeia. ' +
            'Num capítulo de discurso a cena costuma ser a mesma (João 13 continua em ' +
            'Jerusalém, de João 12); numa carta, o lugar vizinho é só o lugar vizinho.</p>' +
            '<a class="btn btn--mini" href="#/ler/' + encodeURIComponent(ref) + '">' +
            'Ler ' + esc(ref) + '</a>' +
            '</section>';
    }

    function vazio() {
        return '<section class="cartao">' +
            '<p class="dica"><b>Este capítulo não nomeia nenhum lugar</b>, e nenhum vizinho ' +
            'perto dele nomeia. Acontece com boa parte dos Salmos, dos Provérbios e das ' +
            'cartas: eles falam de Deus e da vida, não de geografia.</p></section>';
    }

    function controles() {
        return '<div class="mapa-botoes">' +
            '<button class="btn btn--mini" data-zoom="-1" aria-label="Afastar">−</button>' +
            '<button class="btn btn--mini" data-zoom="1" aria-label="Aproximar">+</button>' +
            '<button class="btn btn--mini" data-zoom="0">No capítulo</button>' +
            '<button class="btn btn--mini" data-zoom="tudo">A região toda</button>' +
            '</div>';
    }

    /* ---------- a janela ---------- */

    /* Encaixa a área geográfica no formato fixo do desenho, alargando o
       lado que sobra — nunca apertando, para nenhum lugar ficar de fora. */
    function encaixar(j) {
        var k = Math.cos((j.y0 + j.y1) / 2 * Math.PI / 180);
        var larg = (j.x1 - j.x0) * k, alt = j.y1 - j.y0;
        if (larg / alt < LARGURA / ALTURA) {
            var nova = alt * (LARGURA / ALTURA) / k, mx = (j.x0 + j.x1) / 2;
            return { x0: mx - nova / 2, x1: mx + nova / 2, y0: j.y0, y1: j.y1 };
        }
        var novaA = larg * (ALTURA / LARGURA), my = (j.y0 + j.y1) / 2;
        return { x0: j.x0, x1: j.x1, y0: my - novaA / 2, y1: my + novaA / 2 };
    }

    function afastar(fator) {
        var j = atual.j;
        var mx = (j.x0 + j.x1) / 2, my = (j.y0 + j.y1) / 2;
        var lx = (j.x1 - j.x0) * fator / 2, ly = (j.y1 - j.y0) * fator / 2;
        atual.j = { x0: mx - lx, x1: mx + lx, y0: my - ly, y1: my + ly };
        pintarMapa();
    }

    function ligar() {
        var caixa = ui.$('mapa-svg');
        ui.qq('[data-zoom]').forEach(function (b) {
            b.addEventListener('click', function () {
                var q = b.getAttribute('data-zoom');
                if (q === '0') atual.j = encaixar(B.lugares.janela(atual.lista));
                else if (q === 'tudo') {
                    var base = B.lugares.mapaBase();
                    atual.j = encaixar(base
                        ? { x0: base.janela.oeste, x1: base.janela.leste,
                            y0: base.janela.sul, y1: base.janela.norte }
                        : B.lugares.janela(atual.lista));
                } else afastar(q === '1' ? 1 / 1.7 : 1.7);
                if (q === '0' || q === 'tudo') pintarMapa();
            });
        });
        if (!caixa) return;

        /* Arrastar com o dedo: o mapa anda com a mão, e não em passos de
           botão. Sem isto, sair do quadrado do capítulo custa cinco toques. */
        var pegou = null;
        caixa.addEventListener('pointerdown', function (ev) {
            pegou = { x: ev.clientX, y: ev.clientY, j: atual.j };
            caixa.setPointerCapture(ev.pointerId);
        });
        caixa.addEventListener('pointermove', function (ev) {
            if (!pegou) return;
            var r = caixa.getBoundingClientRect();
            var j = pegou.j;
            var dx = (ev.clientX - pegou.x) / r.width * (j.x1 - j.x0);
            var dy = (ev.clientY - pegou.y) / r.height * (j.y1 - j.y0);
            atual.j = { x0: j.x0 - dx, x1: j.x1 - dx, y0: j.y0 + dy, y1: j.y1 + dy };
            pintarMapa();
        });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (e) {
            caixa.addEventListener(e, function () { pegou = null; });
        });
    }

    /* ---------- o desenho ---------- */

    function pintarMapa() {
        var onde = ui.$('mapa-svg');
        if (onde && atual) onde.innerHTML = svgDo(atual.lista, atual.j);
    }

    function svgDo(lista, j) {
        var base = B.lugares.mapaBase();
        var k = Math.cos((j.y0 + j.y1) / 2 * Math.PI / 180);
        var escala = ALTURA / (j.y1 - j.y0);
        var folga = (j.x1 - j.x0) * 0.2;

        function px(x) { return ((x - j.x0) * k * escala).toFixed(1); }
        function py(y) { return ((j.y1 - y) * escala).toFixed(1); }
        function visivel(p) {
            return p[0] > j.x0 - folga && p[0] < j.x1 + folga &&
                p[1] > j.y0 - folga && p[1] < j.y1 + folga;
        }
        function caminho(linhas, fechar) {
            return (linhas || []).map(function (l) {
                /* Um traço que passa pela janela não pode sumir só porque
                   os vértices caem fora dela: por isso o pedaço inteiro
                   entra quando qualquer ponto dele aparece. */
                var algum = false, d = '';
                for (var i = 0; i < l.length; i++) {
                    if (visivel(l[i])) algum = true;
                    d += (i ? 'L' : 'M') + px(l[i][0]) + ' ' + py(l[i][1]);
                }
                return algum ? d + (fechar ? 'Z' : '') : '';
            }).filter(Boolean).join(' ');
        }

        var svg = '<svg class="mapa" viewBox="0 0 ' + LARGURA + ' ' + ALTURA + '" ' +
            'width="100%" preserveAspectRatio="xMidYMid slice" role="img" ' +
            'aria-label="Mapa dos lugares do capítulo">' +
            '<rect width="100%" height="100%" class="mapa-mar"/>';
        if (base) {
            svg += '<path class="mapa-terra" d="' + caminho(base.terra, true) + '"/>' +
                '<path class="mapa-paises" d="' + caminho(base.paises) + '"/>' +
                '<path class="mapa-rios" d="' + caminho(base.rios) + '"/>' +
                '<path class="mapa-lagos" d="' + caminho(base.lagos, true) + '"/>' +
                '<path class="mapa-costa" d="' + caminho(base.costa) + '"/>';
        }

        var caixas = [];
        function livre(c) {
            return !caixas.some(function (o) {
                return c.x1 > o.x0 && c.x0 < o.x1 && c.y1 > o.y0 && c.y0 < o.y1;
            });
        }

        lista.forEach(function (l, i) {
            var x = +px(l.x), y = +py(l.y);
            if (x < -40 || x > LARGURA + 40 || y < -40 || y > ALTURA + 40) return;
            var larg = l.n.length * 4.7 + 4;
            var jeitos = [
                { dx: 0, dy: 11, a: 'middle', x0: x - larg / 2, x1: x + larg / 2 },
                { dx: 0, dy: -7, a: 'middle', x0: x - larg / 2, x1: x + larg / 2 },
                { dx: 6, dy: 3, a: 'start', x0: x + 6, x1: x + 6 + larg },
                { dx: -6, dy: 3, a: 'end', x0: x - 6 - larg, x1: x - 6 }
            ];
            var posto = null;
            for (var n = 0; n < jeitos.length && !posto; n++) {
                var p2 = jeitos[n];
                var c = { x0: p2.x0, x1: p2.x1, y0: y + p2.dy - 9, y1: y + p2.dy + 2 };
                if (livre(c)) { caixas.push(c); posto = p2; }
            }
            caixas.push({ x0: x - 4, x1: x + 4, y0: y - 4, y1: y + 4 });
            svg += '<g class="mapa-pino" data-pino="' + i + '">' +
                '<circle cx="' + x + '" cy="' + y + '" r="3.4"/>' +
                (posto
                    ? '<text x="' + (x + posto.dx) + '" y="' + (y + posto.dy) +
                    '" text-anchor="' + posto.a + '">' + esc(l.n) + '</text>'
                    : '') +
                '</g>';
        });

        /* Os nomes da região vêm DEPOIS dos pinos no código, de propósito:
           quem reserva lugar primeiro ganha, e quem tem de ganhar é o
           capítulo. O nome do mar cede espaço a Siquém, não o contrário. */
        var grau = j.x1 - j.x0;
        (base && base.rotulos || []).forEach(function (r) {
            if (r.x < j.x0 || r.x > j.x1 || r.y < j.y0 || r.y > j.y1) return;
            /* De perto, nome de continente só atrapalha; de longe, nome de
               lago some no borrão. */
            if (r.g === 1 && grau < 4) return;
            if (r.g === 2 && grau > 26) return;
            var x = +px(r.x), y = +py(r.y);
            var tam = r.g === 1 ? 10 : 8.5;
            var larg = r.n.length * tam * 0.5;
            var c = { x0: x - larg / 2, x1: x + larg / 2, y0: y - tam, y1: y + 2 };
            if (!livre(c)) return;
            caixas.push(c);
            svg += '<text class="mapa-regiao mapa-regiao--' + esc(r.a) + '" x="' + x +
                '" y="' + y + '" style="font-size:' + tam + 'px">' + esc(r.n) + '</text>';
        });

        return svg + regua(j, k, escala) + '</svg>';
    }

    /* Escala em quilômetros: sem ela, "perto" e "longe" no mapa não querem
       dizer nada — e a distância é metade do que a geografia bíblica
       ensina (de Belém a Jerusalém são 8 km; do Egito a Canaã, 400). */
    function regua(j, k, escala) {
        var kmPorGrau = 111.32;
        var alvo = (j.x1 - j.x0) * 0.28 * kmPorGrau * k;
        var passos = [5, 10, 25, 50, 100, 200, 500, 1000, 2000];
        var km = passos[passos.length - 1];
        for (var i = 0; i < passos.length; i++) {
            if (passos[i] >= alvo) { km = passos[i]; break; }
        }
        var larg = km / kmPorGrau / k * k * escala;
        if (larg > LARGURA * 0.6) larg = LARGURA * 0.6;
        var x = 12, y = ALTURA - 14;
        return '<g class="mapa-regua">' +
            '<rect x="' + (x - 4) + '" y="' + (y - 11) + '" width="' + (larg + 8) +
            '" height="20" rx="4"/>' +
            '<line x1="' + x + '" y1="' + y + '" x2="' + (x + larg) + '" y2="' + y + '"/>' +
            '<text x="' + (x + larg / 2) + '" y="' + (y - 3) + '">' + km + ' km</text>' +
            '</g>';
    }

    function listar(lista, deOutro) {
        return '<h3 class="secao">' + lista.length + ' lugar' +
            (lista.length === 1 ? '' : 'es') +
            (deOutro ? ' em ' + esc(deOutro) : ' neste capítulo') + '</h3>' +
            '<div class="lugares">' + lista.map(function (l) {
                return '<div class="lugar">' +
                    '<div class="lugar-topo"><b>' + esc(l.n) + '</b>' +
                    (l.en ? '<small>' + esc(l.en) + '</small>' : '') + '</div>' +
                    (l.d ? '<p class="dica">' + esc(l.d) + '</p>' : '') +
                    '<a class="btn btn--mini" target="_blank" rel="noopener" href="' +
                    esc(B.lugares.linkExterno(l)) + '">Ver no mapa de hoje</a>' +
                    '</div>';
            }).join('') + '</div>';
    }

    function rodape() {
        return '<p class="dica rodape-dica">Arraste o mapa para andar; os botões afastam, ' +
            'aproximam e voltam. Lugares e coordenadas: <b>STEPBible / Tyndale House</b> ' +
            '(CC BY 4.0). Terra, mar, rios, lagos e fronteiras: <b>Natural Earth</b> ' +
            '(domínio público) — as fronteiras são as de <b>hoje</b>, e estão aí só para ' +
            'você se situar. O desenho é feito no aparelho e funciona sem internet.<br>' +
            'A localização de muitos lugares da Bíblia é <b>proposta</b>, não certa: ' +
            'escavação nova muda identificação, e há sítios disputados. Leia o pino como ' +
            '"é por aqui", não como "é exatamente aqui".</p>';
    }

    return { render: render, depois: depois };
})();
