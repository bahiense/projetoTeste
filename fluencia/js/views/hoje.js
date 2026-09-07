/* =========================================================
   TELA HOJE — o ciclo diário guiado.
   É a única tela que o aluno precisa abrir todo dia.
   ========================================================= */
window.F = window.F || {};
F.telas = F.telas || {};

F.telas.hoje = (function () {
    'use strict';
    var ui = F.ui, esc = F.ui.esc;

    function render() {
        var s = F.store.get();
        var sem = F.curso.semanaAtual();
        var fase = F.curso.fase(sem.fase);
        var som = F.curso.som(sem.som);
        var deg = F.curso.degrau(sem.escada);
        var feitos = F.store.blocosHoje();
        var totalMin = F.curso.CICLO.reduce(function (a, b) { return a + b.min; }, 0);
        var pctDia = Math.round((feitos.length / F.curso.CICLO.length) * 100);

        var saud = saudacao(s.nome);

        var blocos = F.curso.CICLO.map(function (b) {
            var ok = feitos.indexOf(b.id) >= 0;
            return '<a class="bloco' + (ok ? ' is-ok' : '') + '" href="' + b.rota + '">' +
                '<span class="bloco-check">' + (ok ? '✓' : '') + '</span>' +
                '<span class="bloco-txt"><b>' + esc(b.nome) + '</b></span>' +
                '<span class="bloco-min">' + b.min + '<small>min</small></span>' +
                '</a>';
        }).join('');

        return '' +
            '<header class="tela-head">' +
            '<p class="olho">' + esc(saud) + '</p>' +
            '<h2>Semana ' + sem.s + ' — ' + esc(sem.tema) + '</h2>' +
            '<p>Fase ' + fase.id + ': <b>' + esc(fase.nome) + '</b> · ' + esc(fase.semanas) + '</p>' +
            '</header>' +

            '<div class="cartao cartao--dia">' +
            '<div class="dia-topo">' +
            '<div><b>' + feitos.length + ' de ' + F.curso.CICLO.length + '</b> blocos de hoje' +
            '<small>' + totalMin + ' minutos no total ' +
            ui.ajuda('O ciclo do dia',
                '<p>Os oito blocos são a rotina diária do método, na ordem em que funcionam melhor: ' +
                'boca, ouvido, estrutura, memória, escuta, conversa, fala livre e registro.</p><ul>' +
                F.curso.CICLO.map(function (b) {
                    return '<li><b>' + esc(b.nome) + '</b> (' + b.min + ' min) — ' + esc(b.desc) + '</li>';
                }).join('') + '</ul>' +
                '<p>Um bloco fica marcado assim que você faz o exercício. Não precisa ser tudo de uma vez, ' +
                'nem nessa ordem — precisa ser todo dia.</p>') +
            '</small></div>' +
            ui.anel(pctDia, '', 'neutro') +
            '</div>' +
            '<div class="blocos">' + blocos + '</div>' +
            (feitos.length === F.curso.CICLO.length
                ? '<p class="feito-tudo">Ciclo completo. Isso, repetido, é o que muda tudo — volte amanhã.</p>'
                : '') +
            '</div>' +

            '<div class="grade-2">' +
            '<div class="cartao">' +
            '<h3>Alvo da semana</h3>' +
            '<dl class="alvos">' +
            '<dt>Som</dt><dd>' + esc(som ? som.nome : sem.som) + '</dd>' +
            '<dt>Estrutura</dt><dd>' + esc(sem.gramatica) + '</dd>' +
            '<dt>Função</dt><dd>' + esc((F.curso.funcao(sem.funcao) || {}).nome || sem.funcao) + '</dd>' +
            '<dt>Meta</dt><dd>' + esc(sem.meta) + '</dd>' +
            '</dl>' +
            '</div>' +

            '<div class="cartao cartao--missao">' +
            '<div class="cartao-titulo"><h3>Missão no mundo real</h3>' +
            ui.ajuda('Por que existe uma missão',
                '<p>O app é o treino; a fluência acontece lá fora. A missão da semana empurra você para ' +
                'fora dele — é a parte do método que nenhum aplicativo pode fazer por você.</p>' +
                '<p>Ela anda junto com a escada da coragem: esta semana está no degrau ' + deg.n + ', ' +
                '<b>' + esc(deg.titulo) + '</b>.</p>') + '</div>' +
            '<p class="missao">' + esc(sem.missao) + '</p>' +
            '<a class="btn" href="#/coragem">Abrir a escada da coragem</a>' +
            '</div>' +
            '</div>' +

            '<div class="cartao">' +
            '<h3>Sequência</h3>' +
            '<div class="streak-linha">' +
            '<div class="streak-num">' + s.streak.atual + '<small>dias seguidos</small></div>' +
            '<div class="streak-num">' + s.streak.recorde + '<small>recorde</small></div>' +
            '<div class="streak-num">' + F.store.minutosTotais() + '<small>minutos no total</small></div>' +
            '<div class="streak-num">' + F.store.notaFluencia() + '<small>nota de fluência</small></div>' +
            '</div>' +
            calendario() +
            '</div>' +

            '<div class="linha-botoes">' +
            '<a class="btn" href="#/plano">Ver o plano de 48 semanas</a>' +
            '<a class="btn" href="#/metodo">Por que funciona</a>' +
            '<button class="btn" id="proxima-semana">Concluir semana ' + sem.s + '</button>' +
            '</div>';
    }

    function saudacao(nome) {
        var h = new Date().getHours();
        var p = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
        return nome ? p + ', ' + nome + '.' : p + '.';
    }

    /* Últimos 35 dias, estilo grade de contribuições. */
    function calendario() {
        var s = F.store.get();
        var hoje = new Date();
        var celulas = [];
        for (var i = 34; i >= 0; i--) {
            var d = new Date(hoje.getTime() - i * 86400000);
            var chave = d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
            var min = s.minutos[chave] || 0;
            var n = min === 0 ? 0 : min < 15 ? 1 : min < 30 ? 2 : min < 45 ? 3 : 4;
            celulas.push('<i class="cal-n' + n + '" title="' + chave + ': ' + min + ' min"></i>');
        }
        return '<div class="calendario">' + celulas.join('') + '</div>' +
            '<p class="legenda">Últimos 35 dias. Quanto mais escuro, mais tempo de boca aberta.</p>';
    }

    function p2(n) { return n < 10 ? '0' + n : '' + n; }

    function montar() {
        var b = ui.$('proxima-semana');
        if (!b) return;
        b.addEventListener('click', function () {
            var s = F.store.get();
            if (s.semana >= F.data.curriculo.length) {
                ui.toast('Você chegou ao fim do programa. Recomece o ciclo num nível mais alto.');
                return;
            }
            if (!confirm('Fechar a semana ' + s.semana + ' e abrir a ' + (s.semana + 1) + '?\n\n' +
                'Só avance se a missão da semana foi cumprida de verdade.')) return;
            F.curso.avancarSemana();
            ui.toast('Semana ' + F.store.get().semana + ' liberada.');
            F.app.desenhar();
        });
    }

    return { render: render, montar: montar };
})();
