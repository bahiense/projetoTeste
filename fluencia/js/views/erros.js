/* =========================================================
   TELA ERROS — as armadilhas do português dentro do inglês.
   ========================================================= */
window.F = window.F || {};
F.telas = F.telas || {};

F.telas.erros = (function () {
    'use strict';
    var ui = F.ui, esc = F.ui.esc;

    var TIPOS = {
        'falso-amigo': 'Falsos amigos',
        'literal': 'Tradução literal',
        'gramatica': 'Gramática sob pressão',
        'pragmatica': 'Soar rude sem querer'
    };

    var modo = 'quiz', tipo = '', ordem = [], pos = 0, acertos = 0;

    function render(args) {
        tipo = args[0] || '';
        preparar();
        var pills = ['<a class="pilula' + (tipo ? '' : ' is-on') + '" href="#/erros">Tudo</a>'].concat(
            Object.keys(TIPOS).map(function (t) {
                return '<a class="pilula' + (tipo === t ? ' is-on' : '') + '" href="#/erros/' + t + '">' + esc(TIPOS[t]) + '</a>';
            })).join('');

        return ui.cabecalho('Erros de brasileiro') +
            '<div class="pilulas">' + pills + '</div>' +
            '<div class="cartao">' +
            '<div class="cartao-titulo"><span class="sub">' + base().length + ' armadilhas</span>' +
            ui.ajuda('Por que estes erros',
                '<p>Não são erros bobos: é a estrutura do português vazando para dentro do inglês. Por ' +
                'isso eles são <b>previsíveis</b> — e por isso o app consegue corrigir boa parte deles ' +
                'na sua fala, sem entender inglês.</p>' +
                '<p>No modo <b>Treinar</b>, escolha qual das duas frases um nativo diria. No modo ' +
                '<b>Ver a lista</b>, leia a explicação de cada uma com o áudio da forma correta.</p>') +
            '</div>' +
            '<div class="segmentado" id="er-modo">' +
            '<button data-m="quiz" class="is-on">Treinar</button>' +
            '<button data-m="lista">Ver a lista</button>' +
            '</div>' +
            '<div id="er-area"></div>' +
            '</div>';
    }

    function base() {
        return tipo ? F.data.erros.filter(function (e) { return e.tipo === tipo; }) : F.data.erros;
    }

    function preparar() {
        ordem = ui.embaralhar(base()).slice(0, 15);
        pos = 0; acertos = 0;
    }

    function pintar() {
        var area = ui.$('er-area');
        if (!area) return;
        if (modo === 'lista') return lista(area);
        if (pos >= ordem.length) {
            var pct = Math.round((acertos / ordem.length) * 100);
            area.innerHTML = '<div class="teste-fim">' + ui.anel(pct, 'de armadilhas') +
                '<p>' + esc(pct >= 90 ? 'Você já não cai nessas. Ótimo sinal.'
                    : pct >= 60 ? 'Bom, mas algumas ainda passam. Refaça amanhã.'
                        : 'Vale voltar na lista e ler as explicações antes de treinar de novo.') + '</p>' +
                '<button class="btn btn--forte" id="er-de-novo">Outra rodada</button></div>';
            ui.$('er-de-novo').addEventListener('click', function () { preparar(); pintar(); });
            return;
        }

        var e = ordem[pos];
        var esquerda = Math.random() < 0.5;
        var a = esquerda ? e.errado : e.certo;
        var b = esquerda ? e.certo : e.errado;
        var certoLado = esquerda ? 'b' : 'a';

        area.innerHTML =
            '<div class="dt-topo"><span>' + (pos + 1) + ' de ' + ordem.length + '</span>' +
            '<span class="dt-placar">acertos: ' + acertos + '</span></div>' +
            '<p class="sub">Qual das duas um nativo diria?</p>' +
            '<div class="op-duplo">' +
            '<button class="btn btn--op" data-l="a">' + esc(a) + '</button>' +
            '<button class="btn btn--op" data-l="b">' + esc(b) + '</button>' +
            '</div>' +
            '<div id="er-fb"></div>';

        ui.qq('#er-area [data-l]').forEach(function (bt) {
            bt.addEventListener('click', function () {
                var ok = bt.getAttribute('data-l') === certoLado;
                if (ok) acertos++;
                ui.$('er-fb').innerHTML =
                    '<div class="fb ' + (ok ? 'fb--ok' : 'fb--erro') + '">' + (ok ? '✓ Isso.' : '✕ Era a outra.') + '</div>' +
                    '<div class="erro-caixa">' +
                    '<p class="errado">✕ ' + esc(e.errado) + '</p>' +
                    '<p class="certo">✓ ' + esc(e.certo) + ' ' + ui.botaoOuvir(e.certo, 'ouvir') + '</p>' +
                    '<p class="porque">' + esc(e.porque) + '</p>' +
                    '</div>' +
                    '<button class="btn btn--forte" id="er-prox">Próxima →</button>';
                ui.qq('#er-area [data-l]').forEach(function (x) { x.disabled = true; });
                ui.$('er-prox').addEventListener('click', function () { pos++; pintar(); });
                F.voz.falar(e.certo.replace(/\(.*?\)/g, ''));
            });
        });
    }

    function lista(area) {
        var porTipo = {};
        base().forEach(function (e) { (porTipo[e.tipo] = porTipo[e.tipo] || []).push(e); });
        area.innerHTML = Object.keys(porTipo).map(function (t) {
            return '<section class="grupo"><h4>' + esc(TIPOS[t] || t) + '</h4>' +
                porTipo[t].map(function (e) {
                    return '<div class="erro-caixa">' +
                        '<p class="errado">✕ ' + esc(e.errado) + '</p>' +
                        '<p class="certo">✓ ' + esc(e.certo) + ' ' + ui.botaoOuvir(e.certo, 'ouvir') + '</p>' +
                        '<p class="porque">' + esc(e.porque) + '</p></div>';
                }).join('') + '</section>';
        }).join('');
    }

    function montar() {
        ui.qq('#er-modo button').forEach(function (b) {
            b.addEventListener('click', function () {
                modo = b.getAttribute('data-m');
                ui.qq('#er-modo button').forEach(function (x) { x.classList.toggle('is-on', x === b); });
                pintar();
            });
        });
        pintar();
    }

    return { render: render, montar: montar };
})();
