/* =========================================================
   TELA PARA CANTAR — a música que se liga ao capítulo.

   Um capítulo lido de manhã e cantado à noite gruda de um jeito que
   nenhum estudo sozinho consegue. É o que esta tela serve.

   Duas honestidades, e elas mandam no desenho:

   - O link é uma BUSCA no YouTube, nunca um vídeo escolhido. Vídeo sai
     do ar; busca não. E escolher a gravação de "Castelo Forte" por
     alguém seria atrevimento: há centenas, e a boa é a da igreja da
     pessoa.
   - Cada música diz se ela CANTA O TEXTO do capítulo ou se apenas toca
     no TEMA dele. "O Senhor é o meu Pastor" é o Salmo 23; "Grandioso És
     Tu" não é Gênesis 1 — fala da criação, que é outra coisa.

   Capítulo sem música conhecida não fica sem nada: a busca pela
   referência sempre está aqui.
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.musica = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, bib = B.biblia;

    /* "Romanos 8" → o livro e o capítulo. Mesma separação da tela de
       teologia: a referência chega pela URL, escrita por gente. */
    function separar(ref) {
        var m = (ref || '').match(/^(.*?)\s+(\d+)$/);
        if (!m) return null;
        var livro = bib.livro(m[1]);
        if (!livro) return null;
        var cap = parseInt(m[2], 10);
        if (!cap || cap > livro.caps) return null;
        return { livro: livro, cap: cap };
    }

    function render(arg) {
        var alvo = separar(arg);
        if (!alvo) {
            return '<header class="tela-topo"><a class="voltar" href="#/hoje">‹ hoje</a>' +
                '<h2>Para cantar</h2></header>' +
                '<p class="dica">Não reconheci esse capítulo.</p>';
        }
        var ref = alvo.livro.nome + ' ' + alvo.cap;
        var musicas = B.musica ? B.musica.cantos(alvo.livro.usfm, alvo.cap) : [];
        var buscas = B.musica ? B.musica.buscas(alvo.livro.usfm, alvo.cap, alvo.livro.nome) : [];

        return '<header class="tela-topo">' +
            '<a class="voltar" href="#/estudo/' + encodeURIComponent(ref) + '">‹ estudo</a>' +
            '<h2>Para cantar</h2>' +
            '<p class="tela-sub">' + esc(ref) + ' · ' +
            (musicas.length
                ? '<b>' + musicas.length + '</b> música' + (musicas.length === 1 ? '' : 's') +
                ' que eu sei nomear'
                : 'nenhuma música nomeada aqui — mas há por onde procurar') +
            '</p>' +
            '<div class="grupo-botoes grupo-botoes--dois">' +
            '<a class="btn btn--fraco" href="#/ler/' + encodeURIComponent(ref) + '">Ler o texto</a>' +
            '<a class="btn btn--fraco" href="#/estudo/' + encodeURIComponent(ref) + '">O estudo</a>' +
            '</div>' +
            '</header>' +

            musicas.map(cartao).join('') +

            '<h3 class="secao">Procurar</h3>' +
            '<section class="cartao">' +
            '<p class="dica">Cada botão abre uma <b>busca no YouTube</b>. O app não guarda ' +
            'música nenhuma e não escolhe gravação por você: de quase todo hino há dezenas, ' +
            'e a que presta costuma ser a que se canta na sua igreja.</p>' +
            '<div class="musica-buscas">' +
            buscas.map(function (b) {
                return '<a class="btn btn--mini" target="_blank" rel="noopener" href="' +
                    esc(B.musica.url(b.termo)) + '">' + esc(b.rotulo) + '</a>';
            }).join('') +
            '</div>' +
            (alvo.livro.usfm === 'PSA'
                ? '<p class="dica">Os salmos foram escritos para ser cantados, e os 150 têm ' +
                'música: o <b>Saltério Escocês</b> (1650) os pôs todos em métrica, e o ' +
                '<b>EveryPsalm</b>, do duo Poor Bishop Hooper, publicou entre 2020 e 2022 uma ' +
                'música para cada um — de graça.</p>'
                : '') +
            '</section>' +

            '<p class="dica rodape-dica">A lista é curta de propósito: só entra música que eu ' +
            'sei nomear com autor e origem. Onde eu não tinha certeza do título, em vez de ' +
            'inventar um nome, deixei a busca pelo tema.</p>';
    }

    function cartao(m) {
        return '<section class="cartao musica">' +
            '<div class="musica-topo">' +
            '<h3>' + esc(m.t) + '</h3>' +
            '<span class="selo selo--' + (m.r === 'texto' ? 'ok' : 'tema') + '">' +
            (m.r === 'texto' ? 'canta o texto' : 'tema do capítulo') + '</span>' +
            '</div>' +
            '<p class="dica">' + esc(m.de) + (m.ano ? ' · ' + esc(m.ano) : '') +
            ' · ' + (m.l === 'pt' ? 'em português' : 'em inglês') + '</p>' +
            '<a class="btn btn--fraco btn--largo" target="_blank" rel="noopener" href="' +
            esc(B.musica.url(m.t + ' ' + (m.l === 'pt' ? 'hino louvor' : 'hymn'))) +
            '">Procurar no YouTube</a>' +
            '</section>';
    }

    return { render: render };
})();
