/* =========================================================
   TELA EM VÍDEO — o capítulo pregado e estudado por gente.

   O estudo da tela ao lado é escrito por IA, e a tela diz isso em todo
   rodapé. Aqui é o contrário: é o caminho para ouvir quem estudou o
   capítulo a vida inteira — pregação, exposição, comentário.

   Todo link é uma BUSCA no YouTube. Vídeo escolhido sai do ar; busca
   não. E o app não escolhe pregador por ninguém: a busca aberta vem
   primeiro, os nomes vêm depois, para quem quiser.
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.videos = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, bib = B.biblia;

    /* "Romanos 8" → livro e capítulo; "Romanos" → o livro inteiro. */
    function separar(ref) {
        var m = (ref || '').match(/^(.*?)(?:\s+(\d+))?$/);
        if (!m) return null;
        var livro = bib.livro(m[1]);
        if (!livro) return null;
        var cap = m[2] ? parseInt(m[2], 10) : 0;
        if (cap && cap > livro.caps) return null;
        return { livro: livro, cap: cap };
    }

    function render(arg) {
        var alvo = separar(arg);
        if (!alvo) {
            return '<header class="tela-topo"><a class="voltar" href="#/hoje">‹ hoje</a>' +
                '<h2>Em vídeo</h2></header>' +
                '<p class="dica">Não reconheci esse capítulo.</p>';
        }
        var ref = alvo.livro.nome + (alvo.cap ? ' ' + alvo.cap : '');
        var b = B.videos.buscas(alvo.livro, alvo.cap);

        return '<header class="tela-topo">' +
            '<a class="voltar" href="#/estudo/' + encodeURIComponent(ref) + '">‹ estudo</a>' +
            '<h2>Em vídeo</h2>' +
            '<p class="tela-sub">' + esc(ref) + ' · pregação, estudo e comentário no YouTube</p>' +
            '<div class="grupo-botoes grupo-botoes--dois">' +
            (alvo.cap
                ? '<a class="btn btn--fraco" href="#/ler/' + encodeURIComponent(ref) +
                '">Ler o texto</a>'
                : '') +
            '<a class="btn btn--fraco" href="#/estudo/' + encodeURIComponent(ref) + '">O estudo</a>' +
            '</div>' +
            '</header>' +

            bloco('Em português', b.pt,
                'A busca aberta: o que houver sobre este capítulo, de quem for.') +
            bloco('Em inglês', b.ingles,
                'Em inglês há muito mais material, e a busca precisa do nome do livro em ' +
                'inglês — "Salmos 23 sermon" não acha nada.') +
            bloco('Por expositor', b.expositores,
                'Pregadores com canal e exposição pela Bíblia inteira. A escolha não é ' +
                'neutra e não finge ser: são reformados, como o resto do app.') +

            '<p class="dica rodape-dica">Cada botão abre uma <b>busca no YouTube</b>, nunca um ' +
            'vídeo escolhido: vídeo sai do ar, busca não. O app não guarda vídeo nenhum e não ' +
            'sabe o que vai aparecer ali — <b>confira o que ouvir</b>, como faria com o estudo ' +
            'escrito pela IA.</p>';
    }

    function bloco(titulo, lista, dica) {
        if (!lista.length) return '';
        return '<h3 class="secao">' + esc(titulo) + '</h3>' +
            '<section class="cartao">' +
            '<p class="dica">' + dica + '</p>' +
            '<div class="video-buscas">' +
            lista.map(function (x) {
                return '<a class="btn btn--mini" target="_blank" rel="noopener" href="' +
                    esc(B.videos.url(x.termo)) + '">' + esc(x.rotulo) + '</a>';
            }).join('') +
            '</div>' +
            '</section>';
    }

    return { render: render };
})();
