/* =========================================================
   O acervo: quanto da Bíblia já está guardada no aparelho.

   Mora fora das telas porque duas delas mostram o mesmo quadro — a de
   Progresso, que fica, e a Oficina, que existe só onde se gera. Duas
   cópias da mesma conta acabariam discordando uma da outra.

   A conta sai das chaves (título + formato) e de oito registros pelo
   índice de data. Nenhum texto de estudo é carregado: ela custa o mesmo
   com dez estudos guardados e com os 2.510 da Bíblia inteira.
   ========================================================= */
window.B = window.B || {};

B.acervo = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc;

    /**
     * O que existe, o que falta e o que chegou por último.
     *
     * Tudo sai das chaves (título + formato) e de oito registros pelo índice
     * de data. Nenhum texto de estudo é carregado: a conta é a mesma com dez
     * estudos guardados e com os 2.510 da Bíblia inteira.
     */
    function alvos() {
        var lista = [];
        B.biblia.LIVROS.forEach(function (l) {
            for (var c = 1; c <= l.caps; c++) lista.push({ titulo: l.nome + ' ' + c, tipo: 'capitulo' });
        });
        B.biblia.LIVROS.forEach(function (l) { lista.push({ titulo: l.nome, tipo: 'livro' }); });
        return lista;
    }

    function pintar(onde) {
        var caixa = ui.$(onde);
        if (!caixa) return;
        Promise.all([B.estudos.chaves(), B.estudos.recentes(8)]).then(function (r) {
            var tem = {};
            r[0].forEach(function (k) { tem[k] = true; });
            var novos = r[1];

            var lista = alvos();
            var conta = {
                simples: 0, completo: 0,
                capitulos: 0, livros: 0,
                faltam: []
            };
            lista.forEach(function (a) {
                ['simples', 'completo'].forEach(function (f) {
                    if (tem[B.estudos.chave(a.titulo, f)]) {
                        conta[f]++;
                        if (a.tipo === 'livro') conta.livros++; else conta.capitulos++;
                    } else {
                        conta.faltam.push({ titulo: a.titulo, formato: f });
                    }
                });
            });

            var total = lista.length * 2;
            var temos = conta.simples + conta.completo;
            var pct = Math.round((temos / total) * 100);
            var meio = Math.round(lista.length);

            caixa.innerHTML =
                '<div class="acervo-topo"><b>' + temos.toLocaleString('pt-BR') + '</b> de ' +
                total.toLocaleString('pt-BR') + ' estudos <span>' + pct + '%</span></div>' +
                ui.barra(pct) +
                '<ul class="resumo">' +
                '<li>simples: <b>' + conta.simples.toLocaleString('pt-BR') + '</b> de ' +
                meio.toLocaleString('pt-BR') + '</li>' +
                '<li>completos: <b>' + conta.completo.toLocaleString('pt-BR') + '</b> de ' +
                meio.toLocaleString('pt-BR') + '</li>' +
                '<li>de capítulo: <b>' + conta.capitulos.toLocaleString('pt-BR') + '</b> · ' +
                'de livro inteiro: <b>' + conta.livros.toLocaleString('pt-BR') + '</b></li>' +
                (conta.faltam.length
                    ? '<li>faltam <b>' + conta.faltam.length.toLocaleString('pt-BR') + '</b></li>'
                    : '<li><b>Está completo.</b> Os 1.189 capítulos e os 66 livros, nos dois ' +
                    'formatos, abrem sem internet e sem IA.</li>') +
                '</ul>' +

                (novos.length
                    ? '<h4 class="acervo-tit">Chegaram por último</h4>' +
                    '<ul class="acervo-lista">' + novos.map(function (e) {
                        return '<li><a href="#/estudo/' + encodeURIComponent(e.titulo) +
                            (e.formato === 'simples' ? '/simples' : '') + '">' +
                            esc(e.titulo) + '</a> <small>' + e.formato + ' · ' +
                            ui.quando(e.criado) + '</small></li>';
                    }).join('') + '</ul>'
                    : '') +

                (conta.faltam.length
                    ? '<h4 class="acervo-tit">Os próximos que faltam</h4>' +
                    '<ul class="acervo-lista">' + proximos(conta.faltam, tem).map(function (f) {
                        return '<li>' + esc(f.titulo) + ' <small>' + f.formato + '</small></li>';
                    }).join('') + '</ul>'
                    : '');
        }, function () {
            caixa.innerHTML = '<p class="dica">Não consegui conferir o acervo agora.</p>';
        });
    }

    /* Na ordem em que o mutirão os geraria, que é a ordem do plano: o que
       falta primeiro é o que você vai ler primeiro. */
    function proximos(faltam, tem) {
        var fila = [];
        try {
            B.lote.ordem().forEach(function (a) {
                if (fila.length >= 6) return;
                var titulo = a.livro.nome + (a.capitulo ? ' ' + a.capitulo : '');
                ['simples', 'completo'].forEach(function (f) {
                    if (fila.length >= 6) return;
                    if (!tem[B.estudos.chave(titulo, f)]) fila.push({ titulo: titulo, formato: f });
                });
            });
        } catch (e) { }
        return fila.length ? fila : faltam.slice(0, 6);
    }

    return { pintar: pintar, alvos: alvos };
})();
