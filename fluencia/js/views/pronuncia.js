/* =========================================================
   TELA PRONÚNCIA — o som da semana, pares mínimos, teste de
   ouvido e correção da sua fala.
   ========================================================= */
window.F = window.F || {};
F.telas = F.telas || {};

F.telas.pronuncia = (function () {
    'use strict';
    var ui = F.ui, esc = F.ui.esc;
    var som = null, frase = 0, teste = null;

    function render(args) {
        var id = args[0] || F.curso.semanaAtual().som;
        som = F.curso.som(id) || F.data.sons[0];
        frase = 0;

        var lista = F.data.sons.map(function (s) {
            return '<a class="pilula' + (s.id === som.id ? ' is-on' : '') + '" href="#/pronuncia/' + s.id + '">' +
                esc(s.nome.split(' — ')[0]) + '</a>';
        }).join('');

        var pares = som.pares.map(function (p, i) {
            return '<div class="par">' +
                '<button class="par-lado" data-falar="' + esc(p.a) + '"><b>' + esc(p.a) + '</b><small>' + esc(p.ipaA) + '</small></button>' +
                '<span class="par-x">×</span>' +
                '<button class="par-lado" data-falar="' + esc(p.b) + '"><b>' + esc(p.b) + '</b><small>' + esc(p.ipaB) + '</small></button>' +
                '</div>';
        }).join('');

        return ui.cabecalho('Pronúncia', 'Um som por vez, exagerado até a boca aprender.') +
            '<div class="pilulas">' + lista + '</div>' +

            '<div class="cartao">' +
            '<h3>' + esc(som.nome) + ' <span class="ipa">' + esc(som.ipa) + '</span></h3>' +
            '<p class="porque"><b>Por que o brasileiro erra:</b> ' + esc(som.porque) + '</p>' +
            '<p class="dica"><b>O que fazer com a boca:</b> ' + esc(som.dica) + '</p>' +
            '<p class="teste"><b>Teste rápido:</b> ' + esc(som.teste) + '</p>' +
            '</div>' +

            '<div class="cartao">' +
            '<h3>Pares mínimos</h3>' +
            '<p class="sub">Toque em cada lado e ouça a diferença. Depois repita em voz alta, alternando.</p>' +
            '<div class="pares">' + pares + '</div>' +
            '<div class="linha-botoes">' +
            '<button class="btn" id="bt-teste">Teste de ouvido (10 rodadas)</button>' +
            '<button class="btn" id="bt-tudo">Ouvir todos, devagar</button>' +
            '</div>' +
            '<div id="teste-area"></div>' +
            '</div>' +

            '<div class="cartao">' +
            '<h3>Sua vez</h3>' +
            '<p class="sub">Frase ' + '<b id="fr-num">1</b> de ' + som.frases.length + ' — ouça o modelo, repita em voz alta e veja o que saiu.</p>' +
            '<p class="frase-alvo" id="fr-txt">' + esc(som.frases[0]) + '</p>' +
            '<p class="legenda">Sílabas esperadas: <b>' + F.texto.silabas(som.frases[0]) + '</b> — se você falou mais, colou vogal onde não tem.</p>' +
            '<div class="linha-botoes">' +
            ui.botaoOuvir(som.frases[0], 'Ouvir', ' id="bt-ouvir"') +
            '<button class="btn" id="bt-lento" data-falar="' + esc(som.frases[0]) + '" data-rate="0.6">🐢 Devagar</button>' +
            '<button class="btn" id="bt-prox">Próxima frase →</button>' +
            '</div>' +
            F.pratica.caixa('pr-pratica') +
            '</div>' +

            '<div class="cartao">' +
            '<h3>Gravar e comparar</h3>' +
            '<p class="sub">Grave a mesma frase hoje e daqui a duas semanas. É o exercício mais desconfortável e o mais convincente.</p>' +
            F.pratica.gravador('pr-grav') +
            '</div>';
    }

    function montar() {
        F.pratica.ligar('pr-pratica', {
            alvo: function () { return som.frases[frase]; },
            serie: 'pronuncia',
            aoResultado: function () { F.store.concluirBloco('aquecimento'); }
        });
        F.pratica.ligarGravador('pr-grav');

        ui.$('bt-prox').addEventListener('click', function () {
            frase = (frase + 1) % som.frases.length;
            var t = som.frases[frase];
            ui.$('fr-txt').textContent = t;
            ui.$('fr-num').textContent = frase + 1;
            ui.$('bt-ouvir').setAttribute('data-falar', t);
            ui.$('bt-lento').setAttribute('data-falar', t);
            var leg = ui.q('.frase-alvo').nextElementSibling;
            if (leg) leg.innerHTML = 'Sílabas esperadas: <b>' + F.texto.silabas(t) + '</b> — se você falou mais, colou vogal onde não tem.';
            ui.q('#pr-pratica [data-papel="res"]').innerHTML = '';
            F.voz.falar(t);
        });

        ui.$('bt-tudo').addEventListener('click', function () {
            var seq = [];
            som.pares.forEach(function (p) { seq.push(p.a, p.b); });
            F.voz.falarSequencia(seq, { rate: 0.7, pausa: 500 });
        });

        ui.$('bt-teste').addEventListener('click', iniciarTeste);
    }

    /* Teste de percepção: o app fala um dos dois, você diz qual foi. */
    function iniciarTeste() {
        var area = ui.$('teste-area');
        teste = { rodada: 0, acertos: 0, total: 10, atual: null };
        proximaRodada(area);
    }

    function proximaRodada(area) {
        // o teste roda com setTimeout: se o aluno saiu da tela, não há onde escrever
        if (!area || !document.body.contains(area)) return;
        if (teste.rodada >= teste.total) {
            var pct = Math.round((teste.acertos / teste.total) * 100);
            F.store.registrar('pronuncia', pct, 'ouvido');
            area.innerHTML = '<div class="teste-fim">' + ui.anel(pct, 'de ouvido') +
                '<p>' + esc(pct >= 90 ? 'Seu ouvido separa os dois sons. Agora é só a boca acompanhar.'
                    : pct >= 70 ? 'Quase lá. Repita o teste hoje e amanhã: percepção melhora rápido.'
                        : 'Seu ouvido ainda funde os dois sons — e boca não produz o que ouvido não separa. Escute os pares 5 minutos por dia.') + '</p>' +
                '<button class="btn" id="bt-teste2">Repetir teste</button></div>';
            ui.$('bt-teste2').addEventListener('click', iniciarTeste);
            return;
        }

        var par = ui.sorteio(som.pares);
        var ladoA = Math.random() < 0.5;
        teste.atual = { par: par, correto: ladoA ? 'a' : 'b' };
        var palavra = ladoA ? par.a : par.b;

        area.innerHTML = '<div class="teste">' +
            '<p class="teste-info">Rodada ' + (teste.rodada + 1) + ' de ' + teste.total +
            ' · acertos: ' + teste.acertos + '</p>' +
            '<p class="sub">Qual palavra você ouviu?</p>' +
            '<div class="teste-op">' +
            '<button class="btn btn--op" data-op="a">' + esc(par.a) + '</button>' +
            '<button class="btn btn--op" data-op="b">' + esc(par.b) + '</button>' +
            '</div>' +
            '<button class="btn btn--som" id="bt-repetir">🔊 Ouvir de novo</button>' +
            '<div class="teste-fb" id="teste-fb"></div>' +
            '</div>';

        var limpa = palavra.split(' ')[0].replace(/\(.*\)/, '');
        F.voz.falar(limpa);
        ui.$('bt-repetir').addEventListener('click', function () { F.voz.falar(limpa); });

        ui.qq('#teste-area [data-op]').forEach(function (b) {
            b.addEventListener('click', function () {
                var certo = b.getAttribute('data-op') === teste.atual.correto;
                if (certo) teste.acertos++;
                ui.$('teste-fb').innerHTML = certo
                    ? '<span class="fb fb--ok">✓ Isso. Era “' + esc(palavra) + '”.</span>'
                    : '<span class="fb fb--erro">✕ Era “' + esc(palavra) + '”. Ouça os dois de novo, lado a lado.</span>';
                teste.rodada++;
                setTimeout(function () { proximaRodada(ui.$('teste-area')); }, certo ? 700 : 1600);
            });
        });
    }

    return { render: render, montar: montar };
})();
