/* =========================================================
   TELA PROGRESSO — os números que importam.

   Nota de fluência = desempenho (60%) + constância (25%) +
   volume de prática (15%). Constância pesa porque é o que
   melhor prevê o resultado no fim dos seis meses.
   ========================================================= */
window.F = window.F || {};
F.telas = F.telas || {};

F.telas.progresso = (function () {
    'use strict';
    var ui = F.ui, esc = F.ui.esc;

    var SERIES = [
        { id: 'pronuncia', nome: 'Pronúncia', desc: 'quanto da sua fala foi reconhecida corretamente' },
        { id: 'ditado', nome: 'Escuta', desc: 'quanto você acerta do ditado em velocidade real' },
        { id: 'drill', nome: 'Automatismo', desc: 'estruturas que saem sem raciocínio' },
        { id: 'fala', nome: 'Fala livre', desc: 'fluxo, duração e riqueza na arena' }
    ];

    function render() {
        var s = F.store.get();
        var nota = F.store.notaFluencia();
        var sem = F.curso.semanaAtual();
        var chunks = F.srs.resumo(F.data.chunks);

        return ui.cabecalho('Progresso', 'O que mudou de verdade, em número.') +

            '<div class="cartao">' +
            '<div class="dia-topo">' +
            '<div><b>Nota de fluência</b><small>desempenho + constância + volume</small></div>' +
            ui.anel(nota) +
            '</div>' +
            '<p class="sub">' + esc(faixa(nota)) + '</p>' +
            '</div>' +

            '<div class="grade-2">' +
            SERIES.map(function (x) {
                var m = F.store.media(x.id, 20);
                var h = (s.historico[x.id] || []);
                var antes = h.length > 25 ? mediaDe(h.slice(0, 10)) : null;
                var delta = (m !== null && antes !== null) ? m - antes : null;
                return '<div class="cartao cartao--serie">' +
                    '<h3>' + esc(x.nome) + '</h3>' +
                    '<div class="serie-num">' + (m === null ? '—' : m + '%') +
                    (delta !== null ? '<span class="delta ' + (delta >= 0 ? 'up' : 'down') + '">' +
                        (delta >= 0 ? '▲' : '▼') + Math.abs(delta) + '</span>' : '') + '</div>' +
                    grafico(h) +
                    '<p class="sub">' + esc(x.desc) + ' · ' + h.length + ' medições</p>' +
                    '</div>';
            }).join('') +
            '</div>' +

            '<div class="cartao">' +
            '<h3>Constância</h3>' +
            '<div class="streak-linha">' +
            '<div class="streak-num">' + s.streak.atual + '<small>dias seguidos</small></div>' +
            '<div class="streak-num">' + s.streak.recorde + '<small>recorde</small></div>' +
            '<div class="streak-num">' + F.store.diasEstudados() + '<small>dias com prática</small></div>' +
            '<div class="streak-num">' + Math.round(F.store.minutosTotais() / 60) + 'h<small>de treino</small></div>' +
            '</div>' +
            barrasMinutos() +
            '</div>' +

            '<div class="grade-2">' +
            '<div class="cartao">' +
            '<h3>Programa</h3>' +
            '<p class="serie-num">' + sem.s + '<small>/' + F.data.curriculo.length + '</small></p>' +
            ui.barra((sem.s / F.data.curriculo.length) * 100) +
            '<p class="sub">Fase ' + sem.fase + ': ' + esc(F.curso.fase(sem.fase).nome) + '</p>' +
            '</div>' +
            '<div class="cartao">' +
            '<h3>Escada da coragem</h3>' +
            '<p class="serie-num">' + s.escada.nivel + '<small>/20</small></p>' +
            ui.barra((s.escada.nivel / 20) * 100) +
            '<p class="sub">' + esc(F.curso.degrau(s.escada.nivel).titulo) + '</p>' +
            '</div>' +
            '<div class="cartao">' +
            '<h3>Blocos na memória</h3>' +
            '<p class="serie-num">' + chunks.aprendidos + '<small>/' + chunks.total + '</small></p>' +
            ui.barra((chunks.aprendidos / chunks.total) * 100) +
            '<p class="sub">' + chunks.revisar + ' para revisar hoje · ' + chunks.novos + ' ainda não vistos</p>' +
            '</div>' +
            '<div class="cartao">' +
            '<h3>Diário</h3>' +
            '<p class="serie-num">' + s.diario.length + '<small> anotações</small></p>' +
            '<p class="sub">' + (s.diario.length ? 'Último: ' + esc(s.diario[0].data) : 'Nenhuma ainda') + '</p>' +
            '<a class="btn" href="#/diario">Anotar agora</a>' +
            '</div>' +
            '</div>' +

            '<div class="cartao">' +
            '<h3>O teste dos seis meses</h3>' +
            '<p class="sub">Grave hoje 90 segundos falando sobre o seu trabalho. Guarde. Refaça na semana 12, na 24 e na 48, ' +
            'com o mesmo tema. É a única avaliação que não mente — e ela não cabe em nenhum número desta tela.</p>' +
            '<a class="btn btn--forte" href="#/arena">Gravar agora na arena</a>' +
            '</div>';
    }

    function faixa(n) {
        if (n >= 85) return 'Faixa quase-nativa: você conduz conversa, discorda e improvisa sem preparar antes.';
        if (n >= 70) return 'Avançado real: se vira em qualquer situação, ainda com esforço em velocidade alta.';
        if (n >= 50) return 'Intermediário alto: comunica bem o que planejou, trava no improviso.';
        if (n >= 30) return 'Começando o programa. O número sobe rápido nas primeiras semanas — não pare agora.';
        return 'Poucos dados ainda. Faça o ciclo completo por uma semana e volte aqui.';
    }

    function mediaDe(arr) {
        if (!arr.length) return null;
        return Math.round(arr.reduce(function (a, b) { return a + b.p; }, 0) / arr.length);
    }

    /* Minigráfico em SVG, sem biblioteca nenhuma. */
    function grafico(h) {
        if (!h.length) return '<div class="grafico grafico--vazio">sem dados ainda</div>';
        var pontos = h.slice(-40);
        var larg = 260, alt = 54;
        var passo = pontos.length > 1 ? larg / (pontos.length - 1) : larg;
        var d = pontos.map(function (p, i) {
            return (i ? 'L' : 'M') + (i * passo).toFixed(1) + ' ' + (alt - (p.p / 100) * alt).toFixed(1);
        }).join(' ');
        return '<svg class="grafico" viewBox="0 0 ' + larg + ' ' + alt + '" preserveAspectRatio="none">' +
            '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="2" ' +
            'stroke-linejoin="round" stroke-linecap="round"/></svg>';
    }

    function barrasMinutos() {
        var s = F.store.get();
        var meta = s.config.metaDiaria || 45;
        var hoje = new Date();
        var barras = [];
        for (var i = 13; i >= 0; i--) {
            var d = new Date(hoje.getTime() - i * 86400000);
            var k = d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
            var min = s.minutos[k] || 0;
            var h = Math.min(100, Math.round((min / meta) * 100));
            barras.push('<div class="mb" title="' + k + ': ' + min + ' min">' +
                '<i style="height:' + Math.max(3, h) + '%"></i>' +
                '<small>' + ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][d.getDay()] + '</small></div>');
        }
        return '<div class="minutos-barras">' + barras.join('') + '</div>' +
            '<p class="legenda">Últimos 14 dias contra a meta de ' + meta + ' minutos.</p>';
    }

    function p2(n) { return n < 10 ? '0' + n : '' + n; }

    return { render: render };
})();
