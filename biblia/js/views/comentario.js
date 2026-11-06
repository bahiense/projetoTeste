/* =========================================================
   TELA COMENTÁRIO — o que Calvino e Matthew Henry escreveram.

   Sem IA no meio. O estudo ao lado é escrito por um modelo com estes
   textos na frente; aqui está o texto, como eles o deixaram.

   Em inglês, e a tela diz isso antes de qualquer coisa: os dois estão
   em domínio público nas traduções inglesas, e versão em português de
   Calvino ou de Henry que esteja em domínio público não existe. Mentir
   sobre isso seria pior do que a barreira.
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.comentario = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, bib = B.biblia;

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
                '<h2>Comentário</h2></header>' +
                '<p class="dica">Não reconheci esse capítulo.</p>';
        }
        var ref = alvo.livro.nome + ' ' + alvo.capitulo;
        return '<header class="tela-topo">' +
            '<a class="voltar" href="#/estudo/' + encodeURIComponent(ref) + '">‹ estudo</a>' +
            '<h2>Comentário</h2>' +
            '<p class="tela-sub">' + esc(ref) + ' · João Calvino e Matthew Henry, ' +
            '<b>em inglês</b></p>' +
            '<div class="grupo-botoes grupo-botoes--dois">' +
            '<a class="btn btn--fraco" href="#/ler/' + encodeURIComponent(ref) + '">Ler o texto</a>' +
            '<a class="btn btn--fraco" href="#/estudo/' + encodeURIComponent(ref) + '">O estudo</a>' +
            '</div>' +
            '</header>' +
            '<div id="comentario-corpo"><p class="carregando">Procurando o comentário…</p></div>';
    }

    function depois(el, arg) {
        var alvo = separar(arg);
        var caixa = ui.$('comentario-corpo');
        if (!alvo || !caixa) return;

        B.comentario.inteiro(alvo).then(function (obras) {
            if (!obras.length) return caixa.innerHTML = vazio();
            caixa.innerHTML =
                '<p class="dica">Texto original, sem IA no meio. Os dois estão em ' +
                '<b>domínio público</b> nas traduções inglesas — e é por isso que estão ' +
                'aqui em inglês: versão em português desses comentários que seja livre ' +
                'não existe. O que o <b>estudo</b> cita deles vem traduzido.</p>' +
                obras.map(secao).join('');
        }, function () {
            caixa.innerHTML = '<p class="dica">Não consegui abrir o comentário agora.</p>';
        });
    }

    function vazio() {
        return '<section class="cartao">' +
            '<p class="dica"><b>Não há comentário guardado deste capítulo.</b></p>' +
            '<p class="dica">Calvino não comentou a Bíblia inteira: faltam Samuel, Reis, ' +
            'Crônicas, Jó, Provérbios, Atos e Apocalipse, e o Ezequiel dele para no ' +
            'capítulo 21 — ele morreu no meio das aulas. Matthew Henry cobre os 1.189 ' +
            'capítulos; se nem ele aparece aqui, é porque esta versão do app está sem os ' +
            'arquivos do comentário.</p>' +
            '</section>';
    }

    function secao(o) {
        return '<section class="cartao comentario">' +
            '<h3>' + esc(o.autor) + '</h3>' +
            '<p class="dica">' + esc(o.obra) + ' · ' + esc(o.quando) + '</p>' +
            (o.versos ? porVersiculo(o.versos) : '<div class="prosa-en">' +
                paragrafos(o.texto) + '</div>') +
            '</section>';
    }

    function porVersiculo(versos) {
        return '<div class="prosa-en">' + Object.keys(versos)
            .sort(function (a, b) { return a - b; })
            .map(function (n) {
                return '<p><b class="vn-com">' + esc(n) + '</b> ' +
                    esc(semONumero(versos[n], n)) + '</p>';
            }).join('') + '</div>';
    }

    /* O comentário de Calvino muitas vezes começa repetindo o número do
       versículo ("1 Behold..."); com o número já na margem, sairia "1 1". */
    function semONumero(texto, n) {
        var re = new RegExp('^' + n + '[.)]?\\s+');
        return texto.replace(re, '');
    }

    function paragrafos(texto) {
        return texto.split(/\n+/).filter(function (l) { return l.trim(); })
            .map(function (l) { return '<p>' + esc(l.trim()) + '</p>'; }).join('');
    }

    return { render: render, depois: depois };
})();
