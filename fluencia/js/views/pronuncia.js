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

        var pares = som.pares.map(function (p) {
            return '<div class="par">' + lado(p.a, p.ipaA) +
                '<span class="par-x">×</span>' + lado(p.b, p.ipaB) + '</div>';
        }).join('');

        var comoFazer = '<p><b>Por que o brasileiro erra:</b> ' + esc(som.porque) + '</p>' +
            '<p><b>O que fazer com a boca:</b> ' + esc(som.dica) + '</p>' +
            '<p><b>Teste rápido:</b> ' + esc(som.teste) + '</p>' +
            '<p><b>Nos pares mínimos:</b> toque em cada lado e ouça a diferença; depois repita em voz ' +
            'alta, alternando. O lado tracejado é a grafia do erro — ele não tem áudio de propósito.</p>';

        return ui.cabecalho('Pronúncia') +
            '<div class="pilulas">' + lista + '</div>' +

            '<div class="cartao">' +
            '<div class="cartao-titulo">' +
            '<h3>' + esc(som.nome) + ' <span class="ipa">' + esc(som.ipa) + '</span></h3>' +
            ui.ajuda('Como treinar ' + som.nome, comoFazer) +
            '</div>' +
            '<div class="pares">' + pares + '</div>' +
            '<div class="linha-botoes">' +
            '<button class="btn" id="bt-teste">Teste de ouvido (10 rodadas)</button>' +
            '<button class="btn" id="bt-tudo">Ouvir todos, devagar</button>' +
            '</div>' +
            '<div id="teste-area"></div>' +
            '</div>' +

            '<div class="cartao">' +
            '<div class="cartao-titulo"><h3>Sua vez</h3>' +
            '<span class="sub">frase <b id="fr-num">1</b> de ' + som.frases.length + '</span>' +
            ui.ajuda('Sua vez', '<p>Ouça o modelo, repita <b>em voz alta</b> e o app mostra o que ele ' +
                'entendeu da sua fala, palavra por palavra.</p><p>A contagem de sílabas é o alerta contra ' +
                'a vogal fantasma: se você falou mais sílabas que o esperado, colou vogal onde não tem.</p>') +
            '</div>' +
            '<div id="fr-bloco">' + blocoFrase(som.frases[0]) + '</div>' +
            '<div class="linha-botoes">' +
            ui.botaoOuvir(frasePartida(som.frases[0]).real, 'Ouvir', ' id="bt-ouvir"') +
            '<button class="btn" id="bt-lento" data-falar="' + esc(frasePartida(som.frases[0]).real) + '" data-rate="0.6">🐢 Devagar</button>' +
            '<button class="btn" id="bt-prox">Próxima frase →</button>' +
            '</div>' +
            F.pratica.caixa('pr-pratica', null, { semEscrita: true }) +
            '</div>' +

            '<div class="cartao">' +
            '<div class="cartao-titulo"><h3>Gravar e comparar</h3>' +
            ui.ajuda('Gravar e comparar', '<p>Grave a mesma frase hoje e daqui a duas semanas. É o ' +
                'exercício mais desconfortável e o mais convincente: a diferença entre as duas gravações ' +
                'é a única prova de progresso que não mente.</p><p>O app guarda a anterior de cada som, ' +
                'com a data. O ✕ apaga uma gravação — a antiga pergunta antes, porque não dá para refazer.</p>') +
            '</div>' +
            F.pratica.gravador('pr-grav') +
            '</div>';
    }

    /* Um lado do par mínimo. O lado que representa o ERRO não ganha áudio:
       é grafia para o olho brasileiro, e a voz inglesa lendo "es-tó-pi" não
       produz nem o erro nem o acerto. Fica como texto, para comparação. */
    function lado(texto, ipa) {
        var falavel = F.texto.paraFalar(texto);
        if (F.texto.ehGrafiaDeErro(texto, ipa) || !falavel) {
            return '<span class="par-lado par-lado--erro"><b>' + esc(texto) + '</b>' +
                '<small>' + esc(ipa) + '</small></span>';
        }
        return '<button class="par-lado" data-falar="' + esc(falavel) + '">' +
            '<b>' + esc(texto) + '</b><small>' + esc(ipa) + '</small></button>';
    }

    /* A frase pode vir com a versão "como soa" depois da seta. As duas
       aparecem; só a primeira é falada e contada. */
    function frasePartida(t) {
        var partes = String(t).split('→');
        return { real: partes[0].trim(), soa: (partes[1] || '').trim() };
    }

    function blocoFrase(t) {
        var f = frasePartida(t);
        return '<p class="frase-alvo" id="fr-txt">' + esc(f.real) + '</p>' +
            (f.soa ? '<p class="soa-caixa"><b>Como isso soa:</b> <i>' + esc(f.soa) + '</i></p>' : '') +
            '<p class="legenda" id="fr-silabas">Sílabas esperadas: <b>' + F.texto.silabas(f.real) +
            '</b> — se você falou mais, colou vogal onde não tem.</p>';
    }

    function montar() {
        F.pratica.ligar('pr-pratica', {
            alvo: function () { return frasePartida(som.frases[frase]).real; },
            serie: 'pronuncia',
            aoResultado: function () { F.store.concluirBloco('aquecimento'); }
        });
        F.pratica.ligarGravador('pr-grav', { chave: 'pronuncia:' + som.id });

        ui.$('bt-prox').addEventListener('click', function () {
            frase = (frase + 1) % som.frases.length;
            var t = som.frases[frase];
            var real = frasePartida(t).real;
            ui.$('fr-bloco').innerHTML = blocoFrase(t);
            ui.$('fr-num').textContent = frase + 1;
            ui.$('bt-ouvir').setAttribute('data-falar', real);
            ui.$('bt-lento').setAttribute('data-falar', real);
            ui.q('#pr-pratica [data-papel="res"]').innerHTML = '';
            F.voz.falar(real);
        });

        ui.$('bt-tudo').addEventListener('click', function () {
            var seq = [];
            som.pares.forEach(function (p) {
                if (!F.texto.ehGrafiaDeErro(p.a, p.ipaA)) seq.push(F.texto.paraFalar(p.a));
                if (!F.texto.ehGrafiaDeErro(p.b, p.ipaB)) seq.push(F.texto.paraFalar(p.b));
            });
            F.voz.falarSequencia(seq.filter(Boolean), { rate: 0.7, pausa: 500 });
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

        var faláveis = som.pares.filter(function (p) {
            return !F.texto.ehGrafiaDeErro(p.a, p.ipaA) && !F.texto.ehGrafiaDeErro(p.b, p.ipaB) &&
                F.texto.paraFalar(p.a) && F.texto.paraFalar(p.b);
        });
        if (!faláveis.length) {
            area.innerHTML = '<p class="sub">Este som não tem pares que o aparelho consiga falar ' +
                'dos dois lados — o contraste aqui é com a grafia do erro, para ler e comparar. ' +
                'Use os pares acima e a sua própria voz.</p>';
            return;
        }
        var par = ui.sorteio(faláveis);
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

        var limpa = F.texto.paraFalar(palavra);
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
