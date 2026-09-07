/* =========================================================
   TELA ESCUTA — ditado em velocidade real.

   Aqui se resolve a queixa mais comum do brasileiro:
   "eu leio bem, mas não entendo quando falam".
   ========================================================= */
window.F = window.F || {};
F.telas = F.telas || {};

F.telas.escuta = (function () {
    'use strict';
    var ui = F.ui, esc = F.ui.esc;
    var bloco = null, i = 0, vel = 1, respondido = false, acertos = [];

    function render(args) {
        var id = args[0] || F.curso.semanaAtual().ditado;
        bloco = F.curso.ditado(id) || F.data.ditado[0];
        i = 0; respondido = false; acertos = [];
        vel = 0.9;

        var pills = F.data.ditado.map(function (d) {
            return '<a class="pilula' + (d.id === bloco.id ? ' is-on' : '') + '" href="#/escuta/' + d.id + '">' +
                '<i class="nivel n' + d.nivel + '"></i>' + esc(d.titulo) + '</a>';
        }).join('');

        return ui.cabecalho('Laboratório de escuta', 'Escreva exatamente o que ouviu. Nem uma palavra a mais.') +
            '<div class="pilulas">' + pills + '</div>' +
            '<div class="cartao">' +
            '<h3>' + esc(bloco.titulo) + '</h3>' +
            '<p class="sub">Foco: ' + esc(bloco.foco) + ' · ' + bloco.itens.length + ' frases</p>' +
            '<div id="dt-area"></div>' +
            '</div>' +
            '<div class="cartao">' +
            '<h3>Como usar isto</h3>' +
            '<p class="sub">Ouça no máximo três vezes antes de escrever. Se não pegou, escreva o que conseguiu — ' +
            'o erro mostra exatamente qual pedaço da fala conectada o seu ouvido ainda não reconhece. ' +
            'Depois de conferir, repita a frase em voz alta na versão “como soa”: só se ouve o que a boca já produziu.</p>' +
            '</div>';
    }

    function pintaItem() {
        var item = bloco.itens[i];
        var area = ui.$('dt-area');
        if (!area) return;
        respondido = false;
        area.innerHTML =
            '<div class="dt-topo"><span>Frase ' + (i + 1) + ' de ' + bloco.itens.length + '</span>' +
            '<span class="dt-placar">' + acertos.length + ' respondidas · média ' + mediaAtual() + '%</span></div>' +
            '<div class="linha-botoes">' +
            '<button class="btn btn--forte" id="dt-ouvir">🔊 Ouvir</button>' +
            '<button class="btn" id="dt-lento">🐢 Bem devagar</button>' +
            '</div>' +
            '<textarea class="entrada entrada--grande" id="dt-txt" rows="3" placeholder="write exactly what you hear"></textarea>' +
            '<div class="linha-botoes">' +
            '<button class="btn btn--forte" id="dt-conferir">Conferir</button>' +
            '<button class="btn" id="dt-pular">Pular →</button>' +
            '</div>' +
            '<div id="dt-res"></div>';

        ui.$('dt-ouvir').addEventListener('click', function () { F.voz.falar(item.en, { rate: vel }); });
        ui.$('dt-lento').addEventListener('click', function () { F.voz.falar(item.en, { rate: 0.6 }); });
        ui.$('dt-conferir').addEventListener('click', conferir);
        ui.$('dt-pular').addEventListener('click', proximo);
        ui.$('dt-txt').addEventListener('keydown', function (ev) {
            if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) conferir();
        });
        ui.$('dt-txt').focus();
        F.voz.falar(item.en, { rate: vel });
    }

    function mediaAtual() {
        if (!acertos.length) return 0;
        return Math.round(acertos.reduce(function (a, b) { return a + b; }, 0) / acertos.length);
    }

    function conferir() {
        if (!ui.$('dt-res')) return;
        if (respondido) { proximo(); return; }
        var item = bloco.itens[i];
        var meu = ui.$('dt-txt').value;
        var r = F.texto.pontuar(item.en, meu);
        respondido = true;
        acertos.push(r.pct);
        F.store.registrar('ditado', r.pct);
        F.store.concluirBloco('escuta');

        ui.$('dt-res').innerHTML =
            '<div class="res-topo">' + ui.anel(r.pct) +
            '<div class="res-txt"><b>' + esc(ui.veredito(r.pct)) + '</b>' +
            '<small>O texto era: “' + esc(item.en) + '”</small></div></div>' +
            ui.diff(r) + ui.legendaDiff() +
            '<div class="soa-caixa"><b>Como isso realmente soa:</b> <i>' + esc(item.soa) + '</i> ' +
            ui.botaoOuvir(item.en, 'ouvir de novo') + '</div>' +
            (item.nota ? '<p class="nota-explica">' + esc(item.nota) + '</p>' : '') +
            '<p class="legenda">Agora fale a versão “como soa” três vezes em voz alta, rápido.</p>';

        ui.$('dt-conferir').textContent = 'Próxima →';
    }

    function proximo() {
        if (!ui.$('dt-area')) return;
        if (i + 1 >= bloco.itens.length) {
            var m = mediaAtual();
            ui.$('dt-area').innerHTML = '<div class="teste-fim">' + ui.anel(m, 'de escuta') +
                '<p>' + esc(m >= 90 ? 'Seu ouvido está pegando a fala colada. Suba de nível.'
                    : m >= 70 ? 'Bom. Repita este bloco amanhã e ele vira 90.'
                        : 'Ainda escapa muita coisa. Faça este mesmo bloco por três dias seguidos antes de trocar.') + '</p>' +
                '<div class="linha-botoes">' +
                '<button class="btn btn--forte" id="dt-refazer">Refazer este bloco</button>' +
                '<a class="btn" href="#/exercicios">Outro exercício</a></div></div>';
            ui.$('dt-refazer').addEventListener('click', function () { i = 0; acertos = []; pintaItem(); });
            return;
        }
        i++;
        pintaItem();
    }

    function montar() { pintaItem(); }

    return { render: render, montar: montar };
})();
