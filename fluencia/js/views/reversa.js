/* =========================================================
   TELA TRADUÇÃO REVERSA — o português sai, o inglês entra.

   O método é dos tradutores e a escola missionária usava sem dar
   nome: recebe a frase em português, produz a versão em inglês,
   e só então compara. O que ensina não é a nota — é a distância
   entre o que você disse e o que está na referência. É ali que a
   estrutura do português aparece escrita, e uma vez vista ela
   custa a voltar.

   Por isso a ordem importa: primeiro você tenta, depois vê. Ver
   antes transforma o exercício em cópia, que não treina nada.
   ========================================================= */
window.F = window.F || {};
F.telas = F.telas || {};

F.telas.reversa = (function () {
    'use strict';
    var ui = F.ui, esc = F.ui.esc;

    var META_DIA = 8;
    var RODADA = 8;

    var fila = [], pos = 0, notas = [], tentou = false;

    function render() {
        fila = montarFila();
        pos = 0; notas = [];

        var comoFazer =
            '<ol>' +
            '<li>Leia a frase em <b>português</b>.</li>' +
            '<li>Diga em inglês <b>em voz alta</b>, do seu jeito, antes de ver qualquer coisa.</li>' +
            '<li>Só então o app mostra a referência e marca, palavra por palavra, onde a sua ' +
            'versão se afastou.</li>' +
            '<li>Leia a <b>armadilha</b> e diga de novo, agora corrigido. É a segunda vez que grava.</li>' +
            '</ol>' +
            '<p>Não tente adivinhar a frase exata da referência: várias traduções estão certas. ' +
            'O que interessa é <b>onde</b> você se afastou — se foi por escolha de palavra, tudo bem; ' +
            'se foi porque o português vazou na estrutura, é isso que a armadilha explica.</p>' +
            '<p class="destaque">Este é o exercício que mais mostra progresso ao longo dos meses. ' +
            'A mesma frase que hoje sai torta vai sair inteira daqui a oito semanas — e você vai ' +
            'lembrar de ter errado.</p>';

        return ui.cabecalho('Tradução reversa') +
            '<div class="cartao">' +
            '<div class="cartao-titulo">' +
            '<h3>Do português para o inglês</h3>' +
            '<span class="etiqueta">em voz alta</span>' +
            ui.ajuda('Como funciona', comoFazer) +
            '</div>' +
            '<div id="rv-area"></div>' +
            '</div>';
    }

    /* Sobe um nível de cada vez até ter material que dure algumas semanas:
       gate apertado demais faz a fase 1 repetir as mesmas frases por um mês. */
    function montarFila() {
        var fase = F.curso.semanaAtual().fase;
        var teto = Math.max(1, Math.min(4, Math.ceil(fase / 2)));
        var pool = [];
        for (var n = 1; n <= 4 && (n <= teto || pool.length < 60); n++) {
            pool = pool.concat(F.data.reversa.filter(function (it) { return it.nivel === n; }));
        }
        if (pool.length < RODADA) pool = F.data.reversa.slice();
        return ui.embaralhar(pool).slice(0, RODADA);
    }

    function item() { return fila[pos]; }

    function pintar() {
        var area = ui.$('rv-area');
        if (!area) return;
        if (pos >= fila.length) return fim(area);
        tentou = false;

        var it = item();
        area.innerHTML =
            barraDoBloco() +
            '<div class="ex-topo"><span>' + (pos + 1) + ' de ' + fila.length + '</span>' +
            '<span class="dt-placar">boas: ' + notas.filter(Boolean).length + '</span></div>' +
            '<div class="rv-pt">' + esc(it.pt) + '</div>' +
            F.pratica.caixa('rv-pratica', '🎙 Dizer em inglês') +
            '<div class="linha-botoes">' +
            '<button class="btn" id="rv-ver">Não sei — mostrar</button>' +
            '</div>' +
            '<div id="rv-res"></div>';

        F.pratica.ligar('rv-pratica', {
            alvo: function () { return item().en; },
            serie: 'reversa',
            corrigir: true,
            limite: 14000,
            /* O veredito padrão manda ouvir o modelo três vezes — aqui não
               houve modelo nenhum antes da tentativa, e a distância que
               interessa é a da estrutura, não a do som. */
            veredito: function (pct) {
                if (pct >= 90) return 'Praticamente a referência.';
                if (pct >= 70) return 'Perto. Veja onde escorregou e diga de novo.';
                if (pct >= 40) return 'A ideia chegou, a estrutura não. É o que a armadilha explica.';
                return 'Bem longe da referência — leia a armadilha antes de repetir.';
            },
            aoResultado: function (pct) {
                if (!tentou) { notas.push(pct >= 70); tentou = true; }
                contarParaOBloco();
                revelar();
            }
        });
        ui.$('rv-ver').addEventListener('click', function () {
            if (!tentou) { notas.push(false); tentou = true; }
            revelar();
        });
    }

    function barraDoBloco() {
        var n = F.store.feitosHoje('reversa');
        if (F.store.blocoFeito('reversa')) {
            return '<p class="bloco-progresso is-ok">✓ Bloco do dia concluído — ' + n +
                ' frases. O que vier agora é treino extra.</p>';
        }
        return '<p class="bloco-progresso">Bloco do dia: <b>' + n + ' de ' + META_DIA +
            '</b> frases traduzidas.</p>';
    }

    function contarParaOBloco() {
        if (F.store.blocoFeito('reversa')) return;
        if (F.store.feitosHoje('reversa') < META_DIA) return;
        F.store.concluirBloco('reversa');
        ui.toast('Bloco do dia concluído ✓');
    }

    /* A referência, a segunda forma e — o que faz o exercício valer — a
       armadilha: o que o brasileiro costuma produzir aqui, e por quê. */
    function revelar() {
        var caixa = ui.$('rv-res');
        if (!caixa) return;
        var it = item();
        /* Depois de revelado, "não sei" só confunde: a resposta já está ali. */
        var ver = ui.$('rv-ver');
        if (ver) ver.hidden = true;

        caixa.innerHTML =
            '<div class="possiveis">' +
            '<div class="possivel"><b>Referência</b>' +
            '<p class="possivel-en">' + esc(it.en) + ' ' + ui.botaoOuvir(it.en, 'ouvir') + '</p></div>' +
            (it.alt ? '<div class="possivel"><b>Também serve</b>' +
                '<p class="possivel-en">' + esc(it.alt) + ' ' + ui.botaoOuvir(it.alt, 'ouvir') + '</p></div>' : '') +
            '</div>' +
            '<div class="rv-armadilha"><b>A armadilha</b><p>' + esc(it.armadilha) + '</p></div>' +
            '<p class="legenda">Sua versão não precisa ser igual à referência. Repita agora a forma ' +
            'certa em voz alta, no botão acima — é a repetição depois de ver o erro que fixa.</p>' +
            '<button class="btn btn--forte" id="rv-prox">Próxima →</button>';

        ui.$('rv-prox').addEventListener('click', function () { pos++; pintar(); });
    }

    function fim(area) {
        if (!area) return;
        var pct = notas.length ? Math.round((notas.filter(Boolean).length / notas.length) * 100) : 0;
        area.innerHTML = barraDoBloco() +
            '<div class="teste-fim">' + ui.anel(pct, 'perto do modelo') +
            '<p>' + esc(pct >= 80
                ? 'Quase tudo saiu perto da referência. Suba um nível: pegue as frases longas.'
                : pct >= 40
                    ? 'Metade saiu. As que se afastaram são as que o português ainda comanda.'
                    : 'Muitas se afastaram — e é exatamente para isso que este exercício existe. ' +
                    'Releia as armadilhas de hoje antes de dormir; elas voltam amanhã.') + '</p>' +
            '<div class="linha-botoes">' +
            '<button class="btn btn--forte" id="rv-mais">Mais oito frases</button>' +
            '<a class="btn" href="#/exercicios">Outro exercício</a></div></div>';
        ui.$('rv-mais').addEventListener('click', function () {
            fila = montarFila(); pos = 0; notas = []; pintar();
        });
    }

    function montar() { pintar(); }
    function desmontar() { F.voz.pararFala(); F.voz.pararEscuta(); }

    return { render: render, montar: montar, desmontar: desmontar };
})();
