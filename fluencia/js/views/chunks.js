/* =========================================================
   TELA BLOCOS — memorização proposital com repetição espaçada.

   Regra: aparece o português, você PRODUZ o inglês em voz alta
   antes de revelar. Reconhecer não é saber.
   ========================================================= */
window.F = window.F || {};
F.telas = F.telas || {};

F.telas.chunks = (function () {
    'use strict';
    var ui = F.ui, esc = F.ui.esc;
    var fila = [], pos = 0, revelado = false, modo = 'treino', filtro = '';

    function render(args) {
        filtro = args[0] || '';
        var conjunto = F.curso.chunksDaSemana();
        var base = filtro ? F.data.chunks.filter(function (c) { return c.f === filtro; }) : conjunto.todos;
        var r = F.srs.resumo(base);
        fila = F.srs.fila(base, 20);
        pos = 0; revelado = false;

        var funcoes = ['<a class="pilula' + (filtro ? '' : ' is-on') + '" href="#/chunks">Da semana</a>'].concat(
            F.data.funcoes.map(function (f) {
                return '<a class="pilula' + (filtro === f.id ? ' is-on' : '') + '" href="#/chunks/' + f.id + '">' + esc(f.nome) + '</a>';
            })).join('');

        var fn = filtro ? F.curso.funcao(filtro) : null;

        return ui.cabecalho('Blocos de fala', 'O nativo não monta a frase: ele puxa o bloco pronto.') +
            '<div class="pilulas">' + funcoes + '</div>' +
            (fn ? '<p class="sub sub--solta">' + esc(fn.desc) + '</p>' : '') +

            '<div class="cartao">' +
            '<div class="srs-resumo">' +
            '<div><b>' + r.revisar + '</b><small>para revisar</small></div>' +
            '<div><b>' + r.novos + '</b><small>novos</small></div>' +
            '<div><b>' + r.aprendidos + '</b><small>na memória longa</small></div>' +
            '<div><b>' + r.total + '</b><small>no conjunto</small></div>' +
            '</div>' +
            '<div class="segmentado" id="ch-modo">' +
            '<button data-m="treino" class="is-on">Treinar</button>' +
            '<button data-m="lista">Ver a lista</button>' +
            '</div>' +
            '<div id="ch-area"></div>' +
            '</div>';
    }

    function pintar() {
        var area = ui.$('ch-area');
        if (!area) return;
        if (modo === 'lista') return pintarLista(area);
        if (!fila.length) {
            area.innerHTML = '<p class="vazio">Nada para revisar agora neste conjunto. ' +
                'Volte amanhã ou escolha outra função acima.</p>';
            return;
        }
        if (pos >= fila.length) {
            area.innerHTML = '<div class="teste-fim"><p class="feito-tudo">Rodada concluída: ' + fila.length + ' blocos.</p>' +
                '<p class="sub">Os que você errou voltam amanhã. Os fáceis somem por semanas.</p>' +
                '<button class="btn btn--forte" id="ch-mais">Mais uma rodada</button></div>';
            ui.$('ch-mais').addEventListener('click', function () { F.app.desenhar(); });
            F.store.concluirBloco('chunks');
            return;
        }

        var c = fila[pos];
        var cart = F.srs.cartao(c.id);
        revelado = false;

        area.innerHTML =
            '<div class="carta">' +
            '<div class="carta-topo">' + (pos + 1) + ' de ' + fila.length +
            ' · <span class="tag">' + esc((F.curso.funcao(c.f) || {}).nome || c.f) + '</span>' +
            (cart.rep ? ' · visto ' + (cart.acertos + cart.erros) + '×' : ' · novo') + '</div>' +
            '<p class="carta-pt">' + esc(c.pt) + '</p>' +
            '<p class="carta-instrucao">Diga em inglês, em voz alta, antes de revelar.</p>' +
            '<div id="ch-frente"><button class="btn btn--forte btn--grande" id="ch-revelar">Revelar</button></div>' +
            '</div>';

        ui.$('ch-revelar').addEventListener('click', revelar);
    }

    function revelar() {
        var c = fila[pos];
        revelado = true;
        var el = ui.$('ch-frente');
        if (!el) return;
        el.innerHTML =
            '<p class="carta-en">' + esc(c.en) + '</p>' +
            (c.nota ? '<p class="carta-nota">' + esc(c.nota) + '</p>' : '') +
            '<div class="linha-botoes">' +
            ui.botaoOuvir(c.en, 'Ouvir') +
            '<button class="btn btn--som" data-falar="' + esc(c.en) + '" data-rate="0.65">🐢 Devagar</button>' +
            '<button class="btn" id="ch-marcar">☆ Marcar</button>' +
            '</div>' +
            F.pratica.caixa('ch-pratica', 'Repetir em voz alta') +
            '<p class="carta-pergunta">Você produziu isso sozinho, antes de revelar?</p>' +
            '<div class="notas">' +
            '<button class="btn btn--nota bad" data-nota="0">Não saiu<small>volta amanhã</small></button>' +
            '<button class="btn btn--nota mid" data-nota="1">Com esforço<small>volta em breve</small></button>' +
            '<button class="btn btn--nota good" data-nota="2">Saiu na hora<small>some por semanas</small></button>' +
            '</div>';

        F.voz.falar(c.en);
        F.pratica.ligar('ch-pratica', { alvo: c.en, serie: 'pronuncia' });

        ui.$('ch-marcar').addEventListener('click', function () {
            var m = F.store.get().marcados;
            var k = m.indexOf(c.id);
            if (k >= 0) { m.splice(k, 1); ui.toast('Desmarcado.'); }
            else { m.push(c.id); ui.toast('Marcado para revisar sempre.'); }
            F.store.salvar();
        });

        ui.qq('#ch-area [data-nota]').forEach(function (b) {
            b.addEventListener('click', function () {
                F.srs.responder(c.id, parseInt(b.getAttribute('data-nota'), 10));
                pos++;
                pintar();
            });
        });
    }

    function pintarLista(area) {
        var conjunto = filtro ? F.data.chunks.filter(function (c) { return c.f === filtro; }) : F.curso.chunksDaSemana().todos;
        var porFuncao = {};
        conjunto.forEach(function (c) { (porFuncao[c.f] = porFuncao[c.f] || []).push(c); });

        area.innerHTML = Object.keys(porFuncao).map(function (f) {
            var fn = F.curso.funcao(f) || { nome: f, desc: '' };
            return '<section class="grupo">' +
                '<h4>' + esc(fn.nome) + '</h4><p class="sub">' + esc(fn.desc) + '</p>' +
                '<ul class="lista-chunks">' + porFuncao[f].map(function (c) {
                    var cart = F.srs.cartao(c.id);
                    return '<li>' +
                        '<button class="chunk-som" data-falar="' + esc(c.en) + '">🔊</button>' +
                        '<span><b>' + esc(c.en) + '</b><small>' + esc(c.pt) + '</small>' +
                        (c.nota ? '<em>' + esc(c.nota) + '</em>' : '') + '</span>' +
                        '<i class="selo n' + c.n + '">' + (cart.int >= 21 ? '✓' : c.n) + '</i>' +
                        '</li>';
                }).join('') + '</ul></section>';
        }).join('');
    }

    function montar() {
        ui.qq('#ch-modo button').forEach(function (b) {
            b.addEventListener('click', function () {
                modo = b.getAttribute('data-m');
                ui.qq('#ch-modo button').forEach(function (x) { x.classList.toggle('is-on', x === b); });
                pintar();
            });
        });
        pintar();
    }

    return { render: render, montar: montar };
})();
