/* =========================================================
   TELA CORAGEM — exposição graduada contra a vergonha de falar.

   Vergonha não some por convencimento; some por exposição
   repetida e crescente. Um degrau de cada vez, duas vezes cada.
   ========================================================= */
window.F = window.F || {};
F.telas = F.telas || {};

F.telas.coragem = (function () {
    'use strict';
    var ui = F.ui, esc = F.ui.esc;

    var FASES = {
        'sozinho': 'Sozinho — ninguém te ouve',
        'assíncrono': 'Assíncrono — alguém ouve depois',
        'ao vivo': 'Ao vivo — alguém ouve agora',
        'pressão': 'Sob pressão — plateia e improviso'
    };

    function render() {
        var e = F.store.get().escada;
        var atual = e.nivel;
        var porFase = {};
        F.data.escada.forEach(function (d) { (porFase[d.fase] = porFase[d.fase] || []).push(d); });

        var html = Object.keys(FASES).map(function (f) {
            var degraus = porFase[f] || [];
            return '<section class="grupo">' +
                '<h4>' + esc(FASES[f]) + '</h4>' +
                degraus.map(function (d) {
                    var feitos = e.feitos[d.n] || 0;
                    var travado = d.n > atual;
                    return '<div class="degrau' + (travado ? ' is-travado' : '') + (feitos >= 2 ? ' is-ok' : '') + '" data-n="' + d.n + '">' +
                        '<div class="degrau-n">' + d.n + '</div>' +
                        '<div class="degrau-corpo">' +
                        '<b>' + esc(d.titulo) + '</b>' +
                        '<p class="degrau-missao">' + esc(d.missao) + '</p>' +
                        '<p class="sub"><b>Por quê:</b> ' + esc(d.porque) + '</p>' +
                        (travado ? '<p class="legenda">Destrava ao cumprir o degrau ' + (d.n - 1) + ' duas vezes.</p>' :
                            '<div class="degrau-acoes">' +
                            '<span class="degrau-contador">' + feitos + '/2 vezes</span>' +
                            '<button class="btn btn--forte" data-fiz="' + d.n + '">Fiz isso hoje</button>' +
                            '</div>' +
                            '<p class="degrau-debrief">Depois de fazer, responda: <i>' + esc(d.debrief) + '</i></p>') +
                        '</div></div>';
                }).join('') +
                '</section>';
        }).join('');

        var pct = Math.round(((atual - 1) / F.data.escada.length) * 100);

        return ui.cabecalho('Escada da coragem',
            'Vinte degraus do espelho até ensinar uma aula inteira em inglês.') +
            '<div class="cartao">' +
            '<div class="dia-topo">' +
            '<div><b>Degrau ' + atual + ' de 20</b><small>' + esc(F.curso.degrau(atual).titulo) + '</small></div>' +
            ui.anel(pct, 'da escada', 'neutro') +
            '</div>' +
            '<p class="sub">Cada degrau precisa ser cumprido <b>duas vezes</b> antes de destravar o próximo. ' +
            'Não vale "mais ou menos": ou você fez, ou não fez.</p>' +
            '</div>' +
            html;
    }

    function montar() {
        ui.qq('[data-fiz]').forEach(function (b) {
            b.addEventListener('click', function () {
                var n = parseInt(b.getAttribute('data-fiz'), 10);
                var e = F.store.get().escada;
                e.feitos[n] = (e.feitos[n] || 0) + 1;
                if (e.feitos[n] >= 2 && e.nivel === n && n < F.data.escada.length) {
                    e.nivel = n + 1;
                    ui.toast('Degrau ' + n + ' vencido. O ' + (n + 1) + ' está aberto.');
                } else {
                    ui.toast('Registrado: ' + e.feitos[n] + '/2.');
                }
                F.store.salvar();
                var d = F.curso.degrau(n);
                F.store.anotar({ tipo: 'coragem', texto: 'Degrau ' + n + ': ' + d.titulo, pergunta: d.debrief });
                F.app.desenhar();
            });
        });
    }

    return { render: render, montar: montar };
})();
