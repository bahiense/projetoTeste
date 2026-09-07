/* =========================================================
   TELA PLANO — o ano inteiro, à vista.
   ========================================================= */
window.F = window.F || {};
F.telas = F.telas || {};

F.telas.plano = (function () {
    'use strict';
    var ui = F.ui, esc = F.ui.esc;

    function render() {
        var atual = F.store.get().semana;

        var html = F.data.fases.map(function (fa) {
            var semanas = F.data.curriculo.filter(function (w) { return w.fase === fa.id; });
            return '<section class="fase">' +
                '<div class="fase-head">' +
                '<h3>Fase ' + fa.id + ' · ' + esc(fa.nome) + '</h3>' +
                '<span class="fase-sem">semanas ' + esc(fa.semanas) + '</span>' +
                '</div>' +
                '<p class="sub">' + esc(fa.resumo) + '</p>' +
                '<p class="entrega">🎯 ' + esc(fa.entrega) + '</p>' +
                '<div class="semanas">' +
                semanas.map(function (w) {
                    var estado = w.s < atual ? 'passada' : w.s === atual ? 'atual' : 'futura';
                    var som = F.curso.som(w.som);
                    return '<details class="semana is-' + estado + '"' + (w.s === atual ? ' open' : '') + '>' +
                        '<summary><span class="semana-n">' + w.s + '</span>' +
                        '<span class="semana-t">' + esc(w.tema) + '</span>' +
                        (w.s === atual ? '<span class="tag tag--agora">agora</span>' : '') +
                        '</summary>' +
                        '<div class="semana-corpo">' +
                        '<dl class="alvos">' +
                        '<dt>Som</dt><dd><a href="#/pronuncia/' + w.som + '">' + esc(som ? som.nome : w.som) + '</a></dd>' +
                        '<dt>Estrutura</dt><dd>' + esc(w.gramatica) + '</dd>' +
                        '<dt>Função</dt><dd><a href="#/chunks/' + w.funcao + '">' + esc((F.curso.funcao(w.funcao) || {}).nome || w.funcao) + '</a></dd>' +
                        '<dt>Shadowing</dt><dd><a href="#/shadowing/' + w.shadowing + '">' + esc((F.curso.shadowing(w.shadowing) || {}).titulo || '') + '</a></dd>' +
                        '<dt>Escuta</dt><dd><a href="#/escuta/' + w.ditado + '">' + esc((F.curso.ditado(w.ditado) || {}).titulo || '') + '</a></dd>' +
                        '<dt>Drill</dt><dd><a href="#/drills/' + w.drill + '">' + esc((F.curso.drill(w.drill) || {}).nome || '') + '</a></dd>' +
                        '<dt>Role-play</dt><dd><a href="#/conversa/' + w.dialogo + '">' + esc((F.curso.dialogo(w.dialogo) || {}).titulo || '') + '</a></dd>' +
                        '<dt>Meta</dt><dd>' + esc(w.meta) + '</dd>' +
                        '<dt>Missão</dt><dd class="missao-dd">' + esc(w.missao) + '</dd>' +
                        '</dl>' +
                        (w.s === atual ? '' : '<button class="btn" data-semana="' + w.s + '">Ir para esta semana</button>') +
                        '</div></details>';
                }).join('') +
                '</div></section>';
        }).join('');

        return ui.cabecalho('Plano de ' + F.data.curriculo.length + ' semanas',
            'Um alvo por semana. Currículo que ataca tudo de uma vez não muda ninguém.') + html;
    }

    function montar() {
        ui.qq('[data-semana]').forEach(function (b) {
            b.addEventListener('click', function () {
                var n = parseInt(b.getAttribute('data-semana'), 10);
                if (!confirm('Mudar para a semana ' + n + '?')) return;
                F.store.get().semana = n;
                F.store.salvar();
                F.ui.toast('Semana ' + n + ' aberta.');
                F.app.ir('#/hoje');
            });
        });
    }

    return { render: render, montar: montar };
})();
