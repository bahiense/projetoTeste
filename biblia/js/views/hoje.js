/* =========================================================
   TELA HOJE — os oito capítulos do dia, um por grupo.
   É a tela que a pessoa abre todo dia; tudo que não é leitura
   de hoje sai daqui.
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.hoje = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, bib = B.biblia, plano = B.plano, store = B.store;

    function saudacao() {
        var h = new Date().getHours();
        if (h < 5) return 'Boa madrugada';
        if (h < 12) return 'Bom dia';
        if (h < 18) return 'Boa tarde';
        return 'Boa noite';
    }

    function cartao(g) {
        var e = store.get();
        var gs = e.grupos[g.id];
        var atual = plano.leituraAtual(g.id);
        var prox = plano.proximaLeitura(g.id);
        var ciclo = plano.progressoCiclo(g.id);
        var real = plano.progressoReal(g.id);
        var jaLido = store.leu(atual.livro.nome, atual.cap);

        return '' +
            '<article class="cartao grupo' + (gs.hoje ? ' is-ok' : '') + '" data-grupo="' + g.id + '">' +
            '<header class="grupo-topo">' +
            '<span class="grupo-icone">' + g.icone + '</span>' +
            '<div class="grupo-nome"><b>' + esc(g.nome) + '</b>' +
            '<small>' + gs.ciclos + (gs.ciclos === 1 ? ' ciclo' : ' ciclos') + ' · ' +
            real.pct + '% do grupo lido</small></div>' +
            (gs.hoje ? '<span class="selo selo--ok">lido hoje</span>' : '') +
            '</header>' +

            '<div class="leitura">' +
            '<div class="leitura-ref">' + esc(atual.ref) +
            (jaLido ? '<span class="selo selo--rele" title="você já leu este capítulo antes">relendo</span>' : '') +
            '</div>' +
            '<div class="leitura-sub">capítulo ' + atual.cap + ' de ' + atual.livro.caps +
            ' · depois vem ' + esc(prox.ref) + '</div>' +
            '</div>' +

            ui.barra(ciclo.pct) +
            '<div class="barra-txt"><span>' + ciclo.lidos + '/' + ciclo.total +
            ' capítulos neste ciclo</span><span>' + ciclo.pct + '%</span></div>' +

            '<div class="grupo-botoes">' +
            '<button class="btn btn--forte" data-marcar="' + g.id + '">' +
            (gs.hoje ? 'Ler mais um' : 'Marcar como lido') + '</button>' +
            '<button class="btn btn--estudo" data-estudar="' + esc(atual.ref) + '">Estudar</button>' +
            '<button class="btn btn--fraco btn--icone" data-ajustar="' + g.id + '" ' +
            'aria-label="Ajustar posição">✎</button>' +
            '</div>' +
            '</article>';
    }

    function render() {
        var e = store.get();
        var st = plano.estatisticas();
        var faltam = B.app.faltamHoje();
        var prev = plano.previsao();

        var resumo = faltam === 0
            ? 'Os oito grupos de hoje estão lidos. Ler mais é lucro.'
            : faltam + (faltam === 1 ? ' grupo ainda não foi lido hoje.' : ' grupos ainda não foram lidos hoje.');

        return '' +
            '<header class="tela-topo">' +
            '<p class="olho">' + saudacao() + ' · ' +
            esc(new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })) + '</p>' +
            '<h2>Leitura de hoje</h2>' +
            '<p class="tela-sub">' + esc(resumo) +
            (e.sequencia > 1 ? ' Você está no <b>' + e.sequencia + 'º dia seguido</b>.' : '') +
            '</p>' +
            '</header>' +

            (prev && prev.dias > 0
                ? '<p class="faixa-previsao">No ritmo dos últimos 30 dias (' + prev.porDia +
                ' capítulos por dia), a Bíblia inteira fecha em <b>' +
                (prev.dias > 400 ? Math.round(prev.dias / 365 * 10) / 10 + ' anos' : prev.dias + ' dias') +
                '</b>. ' + ui.ajuda('De onde vem essa conta',
                    '<p>É o número de capítulos que faltam para você ter lido os 1.189, ' +
                    'dividido pela sua média diária dos últimos 30 dias.</p>' +
                    '<p>A média usa os 30 dias corridos, não só os dias em que você leu — ' +
                    'então ela já conta as faltas. É por isso que a previsão piora quando ' +
                    'você para, o que é justamente o ponto dela.</p>') + '</p>'
                : '') +

            '<section class="cartao posicoes">' +
            '<h3>Onde estou em cada grupo <small>toque para ajustar</small></h3>' +
            '<div class="posicoes-grade">' +
            bib.GRUPOS.map(function (g) {
                var r = plano.leituraAtual(g.id);
                return '<button class="posicao" data-ajustar="' + g.id + '">' +
                    '<span class="posicao-icone">' + g.icone + '</span>' +
                    '<span class="posicao-ref">' + esc(r.ref) + '</span>' +
                    '<span class="posicao-grupo">' + esc(g.nome) + '</span>' +
                    '</button>';
            }).join('') +
            '</div></section>' +

            bib.GRUPOS.map(cartao).join('') +

            '<div class="cartao cartao--acoes">' +
            '<button class="btn btn--fraco" data-desfazer>Desfazer última marcação</button>' +
            '<button class="btn btn--fraco" data-zerar-dia>Desmarcar o dia</button>' +
            '</div>' +

            '<p class="rodape-dica">' + st.faltam + ' capítulos ainda não lidos na sua conta. ' +
            '<a href="#/biblia">Já leu antes e não está aqui?</a></p>';
    }

    function depois(el) {
        ui.qq('[data-marcar]', el).forEach(function (b) {
            b.addEventListener('click', function () {
                var r = plano.marcarLida(b.getAttribute('data-marcar'));
                B.app.pintar();
                if (r.biblia) {
                    ui.modal({
                        titulo: '🏆 Bíblia inteira',
                        html: '<p>Você terminou a Bíblia pela <b>' + r.biblia + 'ª vez</b> — os 66 livros, ' +
                            'os 1.189 capítulos, um capítulo de cada vez.</p><p>O plano recomeça agora, ' +
                            'com você sabendo coisas que não sabia na primeira volta.</p>',
                        cancelar: false, textoOk: 'Continuar lendo'
                    });
                } else if (r.fechouCiclo) {
                    ui.modal({
                        titulo: '🎉 Ciclo completo',
                        html: '<p>Você fechou mais um ciclo deste grupo — é o <b>' + r.ciclos + 'º</b>. ' +
                            'A próxima leitura volta ao primeiro livro do grupo.</p>',
                        cancelar: false, textoOk: 'Seguir'
                    });
                } else {
                    ui.toast(r.lido.livro + ' ' + r.lido.cap + ' marcado como lido.');
                }
            });
        });

        ui.qq('[data-estudar]', el).forEach(function (b) {
            b.addEventListener('click', function () {
                B.app.ir('estudo', b.getAttribute('data-estudar'));
            });
        });

        ui.qq('[data-ajustar]', el).forEach(function (b) {
            b.addEventListener('click', function () { ajustar(b.getAttribute('data-ajustar')); });
        });

        var d = ui.q('[data-desfazer]', el);
        if (d) d.addEventListener('click', function () {
            var h = B.store.get().historico[0];
            if (!h) return ui.toast('Não há nada para desfazer.', 'aviso');
            ui.confirmar('Desfazer', 'Desmarcar ' + h.livro + ' ' + h.cap +
                ' e voltar o plano para esse capítulo?').then(function (ok) {
                    if (!ok) return;
                    plano.desfazerUltima();
                    B.app.pintar();
                    ui.toast('Desfeito.');
                });
        });

        var z = ui.q('[data-zerar-dia]', el);
        if (z) z.addEventListener('click', function () {
            var e = store.get();
            Object.keys(e.grupos).forEach(function (k) { e.grupos[k].hoje = false; });
            store.salvar();
            B.app.pintar();
            ui.toast('Marcações de hoje liberadas. O que foi lido continua lido.');
        });
    }

    /* Ajustar a posição de um grupo: escolher livro e capítulo. */
    function ajustar(id) {
        var g = bib.grupo(id);
        var gs = store.get().grupos[id];
        var atualLivro = bib.livro(gs.livro);

        var html = '' +
            '<label class="rotulo">Livro</label>' +
            '<select class="campo" id="aj-livro">' +
            g.livros.map(function (l) {
                return '<option value="' + esc(l.nome) + '"' + (l.nome === gs.livro ? ' selected' : '') +
                    '>' + esc(l.nome) + ' (' + l.caps + ')</option>';
            }).join('') + '</select>' +
            '<label class="rotulo">Capítulo</label>' +
            '<div class="passo">' +
            '<button class="btn btn--fraco" id="aj-menos">−</button>' +
            '<div class="passo-num"><b id="aj-num">' + gs.cap + '</b><small id="aj-de">de ' +
            atualLivro.caps + '</small></div>' +
            '<button class="btn btn--fraco" id="aj-mais">+</button>' +
            '</div>' +
            '<p class="dica">Isto muda só a próxima leitura deste grupo. Para registrar ' +
            'capítulos que você já leu, use a aba <b>Bíblia</b>.</p>';

        var cap = gs.cap;
        ui.modal({
            titulo: g.icone + ' ' + g.nome,
            html: html,
            textoOk: 'Salvar',
            aoAbrir: function (corpo) {
                var sel = corpo.querySelector('#aj-livro');
                var num = corpo.querySelector('#aj-num');
                var de = corpo.querySelector('#aj-de');
                function limite() { return bib.livro(sel.value).caps; }
                sel.addEventListener('change', function () {
                    cap = 1;
                    num.textContent = cap;
                    de.textContent = 'de ' + limite();
                });
                corpo.querySelector('#aj-menos').addEventListener('click', function () {
                    cap = Math.max(1, cap - 1); num.textContent = cap;
                });
                corpo.querySelector('#aj-mais').addEventListener('click', function () {
                    cap = Math.min(limite(), cap + 1); num.textContent = cap;
                });
            }
        }).then(function (ok) {
            if (!ok) return;
            var sel = ui.$('aj-livro');
            plano.irPara(id, sel ? sel.value : gs.livro, cap);
            B.app.pintar();
            ui.toast('Posição ajustada.');
        });
    }

    return { render: render, depois: depois };
})();
