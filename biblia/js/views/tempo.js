/* =========================================================
   TELA LINHA DO TEMPO — em que ponto da história do povo
   de Deus este capítulo está.

   Mostra de imediato o quadro "Onde estamos" (Era, Data,
   Reinado, Império dominante e Situação dos reinos) e, logo
   abaixo, a linha do tempo inteira das 12 grandes eras
   bíblicas — com a era atual destacada ("Você está aqui").
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.tempo = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, bib = B.biblia;

    function render(arg) {
        var alvo = arg ? bib.interpretar(arg) : null;
        if (arg && !alvo) {
            return '<header class="tela-topo"><a class="voltar" href="#/hoje">‹ hoje</a>' +
                '<h2>Linha do Tempo</h2></header>' +
                '<p class="dica">Não reconheci esse livro ou capítulo.</p>';
        }

        var ref = alvo
            ? alvo.livro.nome + (alvo.capitulo ? ' ' + alvo.capitulo : '')
            : '';
        var enc = encodeURIComponent(ref);
        var info = alvo ? B.tempo.doCapitulo(alvo.livro, alvo.capitulo) : null;

        return '<header class="tela-topo">' +
            '<a class="voltar" href="' + (ref ? '#/estudo/' + enc : '#/hoje') + '">' +
            (ref ? '‹ estudo' : '‹ hoje') + '</a>' +
            '<h2>Linha do Tempo</h2>' +
            '<p class="tela-sub">' +
            (ref
                ? '<b>' + esc(ref) + '</b> · onde estamos na história do povo de Deus'
                : 'As 12 grandes eras da história bíblica: reis, reinos e impérios') +
            '</p>' +
            (alvo && alvo.capitulo
                ? '<div class="ferr-ponte">' +
                '<a class="btn btn--fraco btn--mini" href="#/ler/' + enc + '">📖 Ler o texto</a>' +
                '<a class="btn btn--fraco btn--mini" href="#/estudo/' + enc + '">✦ Voltar ao estudo</a>' +
                '</div>'
                : '') +
            '</header>' +
            (info ? cartaoOndeEstamos(ref, alvo, info) : '') +
            renderTrilha(info ? info.era.id : null) +
            renderLinhaCompleta(ref, info);
    }

    function cartaoOndeEstamos(ref, alvo, info) {
        var era = info.era;
        return '<section class="cartao tempo-onde">' +
            '<div class="tempo-selo-topo">' +
            '<span class="selo selo--aqui">📍 Você está aqui · Era ' + era.ordem + ' de ' +
            B.tempo.ERAS.length + '</span>' +
            (info.faixa ? '<span class="tempo-faixa">' + esc(alvo.livro.nome + ' · ' + info.faixa) + '</span>' : '') +
            '</div>' +
            '<h3 class="tempo-era-titulo">' + esc(era.nome) + '</h3>' +
            '<p class="tempo-contexto">' + esc(info.contexto) + '</p>' +

            '<div class="tempo-grade">' +
            '<div class="tempo-dado">' +
            '<span class="tempo-dado-rotulo">📅 Data aproximada</span>' +
            '<b>' + esc(info.data) + '</b>' +
            '</div>' +
            '<div class="tempo-dado">' +
            '<span class="tempo-dado-rotulo">👑 Quem reina / lidera</span>' +
            '<b>' + esc(info.reinado) + '</b>' +
            '</div>' +
            '<div class="tempo-dado">' +
            '<span class="tempo-dado-rotulo">🏛️ Potência / Império dominante</span>' +
            '<b>' + esc(info.imperio) + '</b>' +
            '</div>' +
            '<div class="tempo-dado">' +
            '<span class="tempo-dado-rotulo">⚖️ Situação dos reinos</span>' +
            '<b>' + esc(info.situacao) + '</b>' +
            '</div>' +
            '</div>' +
            '</section>';
    }

    /* Régua visual das 12 eras para situar de relance em que altura da
       história bíblica o capítulo se encontra. */
    function renderTrilha(eraAtualId) {
        return '<div class="cartao tempo-regua-cartao">' +
            '<div class="tempo-regua-topo">' +
            '<span>Criação</span>' +
            '<span>Reino Unido / Dividido</span>' +
            '<span>Exílio / Pérsia</span>' +
            '<span>Cristo e Igreja</span>' +
            '</div>' +
            '<div class="tempo-regua" role="list" aria-label="Posição nas 12 eras bíblicas">' +
            B.tempo.ERAS.map(function (e) {
                var ativo = e.id === eraAtualId;
                var passado = eraAtualId && e.ordem < B.tempo.POR_ID[eraAtualId].ordem;
                return '<a class="tempo-ponto' +
                    (ativo ? ' is-atual' : passado ? ' is-passado' : '') +
                    '" href="#era-' + e.id + '" data-ir-era="' + e.id + '" title="' +
                    esc(e.ordem + '. ' + e.curto + ' (' + e.data + ')') + '">' +
                    '<span>' + e.ordem + '</span>' +
                    '</a>';
            }).join('') +
            '</div>' +
            '</div>';
    }

    function renderLinhaCompleta(ref, info) {
        var atualId = info ? info.era.id : null;
        return '<h3 class="secao">A história completa <small>toque numa era para ver detalhes</small></h3>' +
            '<div class="tempo-lista">' +
            B.tempo.ERAS.map(function (e) {
                var ativo = e.id === atualId;
                return '<details class="cartao tempo-item' + (ativo ? ' is-atual' : '') +
                    '" id="era-' + e.id + '"' + (ativo ? ' open' : '') + '>' +
                    '<summary class="tempo-item-topo">' +
                    '<span class="tempo-num">' + e.ordem + '</span>' +
                    '<div class="tempo-item-cab">' +
                    (ativo
                        ? '<span class="selo selo--aqui">📍 Você está aqui' +
                        (ref ? ' · ' + esc(ref) : '') + '</span>'
                        : '') +
                    '<b>' + esc(e.nome) + '</b>' +
                    '<small>' + esc(e.data) + ' · ' + esc(e.imperio) + '</small>' +
                    '</div>' +
                    '</summary>' +
                    '<div class="tempo-item-corpo">' +
                    '<p>' + esc(e.resumo) + '</p>' +
                    '<ul class="tempo-meta">' +
                    '<li><b>Reinado / Liderança:</b> ' + esc(e.governante) + '</li>' +
                    '<li><b>Império / Potência:</b> ' + esc(e.imperio) + '</li>' +
                    '<li><b>Situação do Reino:</b> ' + esc(e.situacaoReino) + '</li>' +
                    '<li><b>Marco principal:</b> ' + esc(e.marco) + '</li>' +
                    '<li><b>Livros nesta era:</b> ' + esc(e.livros) + '</li>' +
                    '</ul>' +
                    '</div>' +
                    '</details>';
            }).join('') +
            '</div>' +
            '<p class="dica rodape-dica">As datas anteriores a Abraão não são fixadas pela ' +
            'Bíblia, e do Êxodo ao início da monarquia há duas cronologias usadas entre ' +
            'estudiosos (a longa, com o Êxodo em ~1446 a.C., e a curta, em ~1260 a.C.). ' +
            'A partir da divisão do reino (931 a.C.), da queda de Samaria para a Assíria ' +
            '(722 a.C.), da queda de Jerusalém para a Babilônia (586 a.C.), do decreto persa ' +
            'de Ciro (538 a.C.) e do Império Romano, as datas cruzam com os registros ' +
            'históricos do Antigo Oriente Próximo e de Roma.</p>';
    }

    function depois(el) {
        ui.qq('[data-ir-era]', el).forEach(function (a) {
            a.addEventListener('click', function (ev) {
                ev.preventDefault();
                var id = a.getAttribute('data-ir-era');
                var det = ui.$('era-' + id);
                if (!det) return;
                det.open = true;
                det.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
    }

    return { render: render, depois: depois };
})();
