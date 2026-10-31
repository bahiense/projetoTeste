/* =========================================================
   Teologia reformada ligada a um capítulo da Bíblia.

   As confissões e catecismos reformados citam, em cada afirmação, os
   textos que a sustentam. Virando essas citações, cada capítulo passa a
   saber quais doutrinas se apoiam nele — sem IA, sem rede, sem custo.

   O limite é honesto e fica na tela: só aparece o que essas obras de
   fato citam. Capítulo que nenhuma delas cita mostra isso, em vez de
   uma ligação inventada.
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.teologia = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, bib = B.biblia;

    function nomeDe(usfm) {
        var l = bib.LIVROS.filter(function (x) { return x.usfm === usfm; })[0];
        return l ? l.nome : usfm;
    }

    function referencia(r) {
        return nomeDe(r.u) + ' ' + r.c + (r.v ? '.' + r.v : '');
    }

    function render(arg) {
        var alvo = bib.interpretar(arg);
        if (!alvo || !alvo.livro || !alvo.capitulo) {
            return '<header class="tela-topo"><h2>Teologia reformada</h2></header>' +
                '<div class="vazio"><p>Não reconheci esse capítulo.</p></div>';
        }

        var titulo = alvo.livro.nome + ' ' + alvo.capitulo;
        var temas = B.doutrina.temas(alvo.livro.usfm, alvo.capitulo);

        /* Agrupado por obra: cinco pontos do Catecismo Maior misturados
           com dois da Confissão viram uma lista sem forma. */
        var porObra = [];
        temas.forEach(function (t, i) {
            var g = porObra.filter(function (x) { return x.obra === t.obra; })[0];
            if (!g) { g = { obra: t.obra, itens: [] }; porObra.push(g); }
            g.itens.push({ t: t, par: B.doutrina.PORCAPITULO[alvo.livro.usfm + ' ' +
                alvo.capitulo][i] });
        });

        return '' +
            '<header class="tela-topo">' +
            '<a class="voltar" href="#/estudo/' + encodeURIComponent(titulo) + '">‹ estudo</a>' +
            '<h2>Teologia reformada</h2>' +
            '<p class="tela-sub">O que as confissões reformadas apoiam em <b>' +
            esc(titulo) + '</b></p>' +
            '</header>' +

            (temas.length
                ? '<p class="dica">' + temas.length + ' ponto' + (temas.length === 1 ? '' : 's') +
                ' cita' + (temas.length === 1 ? '' : 'm') + ' este capítulo como prova. ' +
                'Toque para ler.</p>' +
                porObra.map(grupo).join('')
                : semNada());
    }

    function semNada() {
        return '<div class="vazio">' +
            '<div class="vazio-icone">◌</div>' +
            '<p>Nenhuma destas obras cita este capítulo.</p>' +
            '<p class="dica">Elas não cobrem a Bíblia inteira: dos 1.189 capítulos, citam ' +
            B.doutrina.quantos() + '. Preferi deixar vazio a inventar uma ligação que ' +
            'nenhuma delas faz.</p>' +
            '</div>' +
            '<p class="dica dica--honesta">' +
            B.doutrina.OBRAS.map(function (o) { return esc(o.nome); }).join(' · ') + '</p>';
    }

    function grupo(g) {
        return '<h3 class="secao">' + esc(g.obra.nome) + '</h3>' +
            g.itens.map(function (x) { return cartao(x.t, x.par); }).join('') +
            '<p class="dica dica--honesta">' + esc(g.obra.credito) +
            (g.obra.nota ? ' ' + esc(g.obra.nota) : '') + '</p>';
    }

    /* Cada tema abre no lugar: são textos curtos, e trocar de tela para
       ler três parágrafos cansa. */
    function cartao(t, par) {
        var refs = B.doutrina.citados(par);
        var ehPergunta = t.obra.id !== 'wcf';

        return '<details class="cartao tema">' +
            '<summary><b>' + esc(t.item.t) + '</b>' +
            '<small>' + esc(t.marca) + '</small></summary>' +

            '<p class="tema-texto">' + esc(t.item.x) + '</p>' +

            (refs.length
                ? '<p class="rotulo">' + (ehPergunta ? 'Textos citados' : 'Textos que a sustentam') +
                '</p><ul class="tema-refs">' + refs.map(function (r) {
                    var nome = nomeDe(r.u) + ' ' + r.c;
                    return '<li><a href="#/teologia/' + encodeURIComponent(nome) + '">' +
                        esc(referencia(r)) + '</a></li>';
                }).join('') + '</ul>'
                : '<p class="dica">Esta resposta não traz referências bíblicas.</p>') +
            '</details>';
    }

    return { render: render };
})();
