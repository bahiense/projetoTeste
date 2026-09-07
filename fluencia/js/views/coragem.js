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
                        '<div class="cartao-titulo"><b>' + esc(d.titulo) + '</b>' +
                        ui.ajuda('Degrau ' + d.n,
                            '<p><b>A missão:</b> ' + esc(d.missao) + '</p>' +
                            '<p><b>Por que este degrau existe:</b> ' + esc(d.porque) + '</p>' +
                            '<p><b>Depois de fazer, responda:</b> <i>' + esc(d.debrief) + '</i></p>') +
                        '</div>' +
                        '<p class="degrau-missao">' + esc(d.missao) + '</p>' +
                        (travado ? '<p class="legenda">Destrava ao cumprir o degrau ' + (d.n - 1) + ' duas vezes.</p>' :
                            '<div class="degrau-acoes">' +
                            '<span class="degrau-contador">' + feitos + '/2 vezes</span>' +
                            '<button class="btn btn--forte" data-fiz="' + d.n + '">Fiz isso hoje</button>' +
                            '</div>') +
                        '</div></div>';
                }).join('') +
                '</section>';
        }).join('');

        var pct = Math.round(((atual - 1) / F.data.escada.length) * 100);

        return ui.cabecalho('Escada da coragem') +
            '<div class="cartao">' +
            '<div class="dia-topo">' +
            '<div><b>Degrau ' + atual + ' de 20</b><small>' + esc(F.curso.degrau(atual).titulo) + '</small></div>' +
            ui.anel(pct, 'da escada', 'neutro') +
            '</div>' +
            '<div class="cartao-titulo"><span class="sub">vinte degraus, do espelho até dar uma aula</span>' +
            ui.ajuda('Como a escada funciona',
                '<p>A vergonha de falar não some com teoria: some com <b>exposição graduada</b> — o mesmo ' +
                'mecanismo usado para tratar fobia. Cada degrau é um pouco mais assustador que o anterior, ' +
                'e só isso.</p>' +
                '<p>Cada um precisa ser cumprido <b>duas vezes</b> antes de destravar o próximo. Não vale ' +
                '"mais ou menos": ou você fez, ou não fez.</p>' +
                '<p>O botão ? de cada degrau traz a missão completa, o motivo dele existir e a pergunta ' +
                'para responder depois.</p>') + '</div>' +
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
