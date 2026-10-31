/* =========================================================
   Teologia reformada ligada a um capítulo da Bíblia.

   A Confissão de Westminster cita, em cada afirmação, os textos que a
   sustentam. Virando essas citações, cada capítulo passa a saber quais
   doutrinas se apoiam nele — sem IA, sem rede, sem custo.

   O limite é honesto e fica na tela: só aparece o que a confissão de
   fato cita. Capítulo que ela não cita mostra isso, em vez de uma
   ligação inventada.
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.teologia = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, bib = B.biblia;

    /* "Romanos 8" -> o que o índice precisa para responder. */
    function alvoDe(ref) {
        var a = bib.interpretar(ref);
        if (!a || !a.livro || !a.capitulo) return null;
        return a;
    }

    function nomeDe(usfm) {
        var l = bib.LIVROS.filter(function (x) { return x.usfm === usfm; })[0];
        return l ? l.nome : usfm;
    }

    function referencia(r) {
        return nomeDe(r.u) + ' ' + r.c + (r.v ? '.' + r.v : '');
    }

    function render(arg) {
        var alvo = alvoDe(arg);
        if (!alvo) {
            return '<header class="tela-topo"><h2>Teologia reformada</h2></header>' +
                '<div class="vazio"><p>Não reconheci esse capítulo.</p></div>';
        }

        var titulo = alvo.livro.nome + ' ' + alvo.capitulo;
        var temas = B.wcf.temas(alvo.livro.usfm, alvo.capitulo);

        return '' +
            '<header class="tela-topo">' +
            '<a class="voltar" href="#/estudo/' + encodeURIComponent(titulo) + '">‹ estudo</a>' +
            '<h2>Teologia reformada</h2>' +
            '<p class="tela-sub">O que a Confissão de Westminster apoia em <b>' +
            esc(titulo) + '</b></p>' +
            '</header>' +

            (temas.length
                ? '<p class="dica">' + temas.length + ' ponto' + (temas.length === 1 ? '' : 's') +
                ' da confissão cita' + (temas.length === 1 ? '' : 'm') + ' este capítulo como ' +
                'prova. Toque para ler.</p>' +
                temas.map(cartao).join('')
                : '<div class="vazio">' +
                '<div class="vazio-icone">◌</div>' +
                '<p>A confissão não cita este capítulo.</p>' +
                '<p class="dica">Ela não cobre a Bíblia inteira: dos 1.189 capítulos, cita ' +
                '448. Preferi deixar vazio a inventar uma ligação que ela não faz.</p>' +
                '</div>') +

            '<p class="dica dica--honesta">' + esc(B.wcf.FONTE.credito) + '</p>';
    }

    /* Cada tema aberto no lugar, sem trocar de tela: são textos curtos, e
       pular de tela em tela para ler três parágrafos cansa. */
    function cartao(t) {
        var semProva = B.wcf.FONTE.semProva.indexOf(t.marca) >= 0;
        var outros = B.wcf.citados(t.marca).filter(function (r) {
            return true;
        });

        return '<details class="cartao tema">' +
            '<summary><b>' + esc(t.titulo) + '</b>' +
            '<small>Confissão de Westminster ' + t.marca + '</small></summary>' +

            (t.secao.texto
                ? '<p class="tema-texto">' + esc(t.secao.texto) + '</p>'
                : '<p class="dica">Esta seção ainda não foi traduzida — vem numa próxima ' +
                'atualização. As citações abaixo já valem.</p>') +

            (semProva
                ? '<p class="dica">A fonte usada não traz os textos-prova desta seção.</p>'
                : '<p class="rotulo">Textos que a sustentam</p>' +
                '<ul class="tema-refs">' + outros.map(function (r) {
                    var nome = nomeDe(r.u) + ' ' + r.c;
                    return '<li><a href="#/teologia/' + encodeURIComponent(nome) + '">' +
                        esc(referencia(r)) + '</a></li>';
                }).join('') + '</ul>') +
            '</details>';
    }

    return { render: render };
})();
