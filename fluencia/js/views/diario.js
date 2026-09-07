/* =========================================================
   TELA DIÁRIO — o plano de estudo pessoal do método missionário.

   No CTM, cada missionário escreve todo dia: o que vou tentar
   hoje, o que travou, qual palavra faltou. Não é diário de
   sentimentos: é lista de alvos. O que não é anotado, some.
   ========================================================= */
window.F = window.F || {};
F.telas = F.telas || {};

F.telas.diario = (function () {
    'use strict';
    var ui = F.ui, esc = F.ui.esc;

    function render() {
        var s = F.store.get();
        var sem = F.curso.semanaAtual();
        var hoje = s.diario.filter(function (d) { return d.data === F.store.hoje() && d.tipo === 'estudo'; });

        return ui.cabecalho('Diário de estudo') +

            '<div class="cartao">' +
            '<div class="cartao-titulo"><h3>Plano de hoje</h3>' +
            ui.ajuda('Para que serve o diário',
                '<p>No treinamento missionário, cada aluno escreve todo dia: o que vou tentar hoje, o que ' +
                'travou, qual palavra faltou. Não é diário de sentimentos — é <b>lista de alvos</b>.</p>' +
                '<p>A pergunta mais valiosa é a primeira: a frase que você quis dizer e não conseguiu. ' +
                'Ela é o seu currículo particular, e o que não é anotado some.</p>' +
                '<p>Três minutos por dia. Amanhã você começa pelo alvo que escreveu hoje.</p>') + '</div>' +
            '<p class="sub">Meta da semana ' + sem.s + ': <b>' + esc(sem.meta) + '</b></p>' +
            '<label class="campo"><span>1. Qual foi a frase que você quis dizer hoje e não conseguiu?</span>' +
            '<textarea class="entrada" id="di-travou" rows="2" placeholder="em português mesmo — depois procure como se diz"></textarea></label>' +
            '<label class="campo"><span>2. Como você diria isso em inglês? (tente antes de procurar)</span>' +
            '<textarea class="entrada" id="di-tentativa" rows="2" placeholder="sua tentativa, mesmo torta"></textarea></label>' +
            '<label class="campo"><span>3. Qual bloco novo você usou hoje falando com alguém?</span>' +
            '<input class="entrada" id="di-bloco" placeholder="ex.: I see where you are coming from"></label>' +
            '<label class="campo"><span>4. Alvo de amanhã — específico e verificável</span>' +
            '<input class="entrada" id="di-alvo" placeholder="ex.: usar 3 phrasal verbs na reunião das 10h"></label>' +
            '<label class="campo"><span>5. Como foi a sua coragem hoje?</span>' +
            '<div class="humor" id="di-humor">' +
            ['1:Fugi de falar', '2:Falei o mínimo', '3:Falei o normal', '4:Me arrisquei', '5:Falei mais do que devia'].map(function (o) {
                var p = o.split(':');
                return '<button type="button" data-h="' + p[0] + '">' + p[0] + '<small>' + p[1] + '</small></button>';
            }).join('') + '</div></label>' +
            '<button class="btn btn--forte btn--grande" id="di-salvar">Salvar o dia</button>' +
            (hoje.length ? '<p class="legenda">Você já anotou ' + hoje.length + '× hoje.</p>' : '') +
            '</div>' +

            '<div class="cartao">' +
            '<h3>Histórico</h3>' +
            (s.diario.length ? '<div class="diario-lista">' + s.diario.slice(0, 40).map(entrada).join('') + '</div>'
                : '<p class="vazio">Nada anotado ainda. A primeira anotação é hoje.</p>') +
            '</div>';
    }

    function entrada(d) {
        if (d.tipo === 'coragem') {
            return '<div class="di-item di-item--coragem">' +
                '<span class="di-data">' + esc(d.data) + '</span>' +
                '<b>🪜 ' + esc(d.texto) + '</b>' +
                '<p class="sub">' + esc(d.pergunta || '') + '</p></div>';
        }
        return '<div class="di-item">' +
            '<span class="di-data">' + esc(d.data) + (d.humor ? ' · coragem ' + d.humor + '/5' : '') + '</span>' +
            (d.travou ? '<p><b>Faltou dizer:</b> ' + esc(d.travou) + '</p>' : '') +
            (d.tentativa ? '<p><b>Minha tentativa:</b> <i>' + esc(d.tentativa) + '</i></p>' : '') +
            (d.bloco ? '<p><b>Bloco usado:</b> ' + esc(d.bloco) + '</p>' : '') +
            (d.alvo ? '<p class="di-alvo"><b>Alvo do dia seguinte:</b> ' + esc(d.alvo) + '</p>' : '') +
            '</div>';
    }

    function montar() {
        var humor = 0;
        ui.qq('#di-humor button').forEach(function (b) {
            b.addEventListener('click', function () {
                humor = parseInt(b.getAttribute('data-h'), 10);
                ui.qq('#di-humor button').forEach(function (x) { x.classList.toggle('is-on', x === b); });
            });
        });

        ui.$('di-salvar').addEventListener('click', function () {
            var d = {
                tipo: 'estudo',
                travou: ui.$('di-travou').value.trim(),
                tentativa: ui.$('di-tentativa').value.trim(),
                bloco: ui.$('di-bloco').value.trim(),
                alvo: ui.$('di-alvo').value.trim(),
                humor: humor
            };
            if (!d.travou && !d.bloco && !d.alvo) {
                ui.toast('Escreva pelo menos uma coisa.', 'erro');
                return;
            }
            F.store.anotar(d);
            F.store.concluirBloco('diario');
            ui.toast('Dia registrado. Amanhã começa por esse alvo.');
            F.app.desenhar();
        });
    }

    return { render: render, montar: montar };
})();
