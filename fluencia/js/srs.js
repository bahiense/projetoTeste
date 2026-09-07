/* =========================================================
   Repetição espaçada (SM-2 enxuto).

   O chunk volta a aparecer pouco antes de você esquecer.
   Errou, volta amanhã; acertou fácil, some por semanas.
   ========================================================= */
window.F = window.F || {};

F.srs = (function () {
    'use strict';

    function hojeNum() { return Math.floor(Date.now() / 86400000); }

    function cartao(id) {
        var e = F.store.get().srs;
        return e[id] || { ef: 2.5, int: 0, rep: 0, due: 0, erros: 0, acertos: 0 };
    }

    /* nota: 0 = errei, 1 = difícil, 2 = fácil */
    function responder(id, nota) {
        var s = F.store.get();
        var c = cartao(id);
        var q = nota === 0 ? 2 : (nota === 1 ? 4 : 5);

        if (q < 3) {
            c.rep = 0;
            c.int = 1;
            c.erros++;
        } else {
            c.rep++;
            c.acertos++;
            if (c.rep === 1) c.int = 1;
            else if (c.rep === 2) c.int = 6;
            else c.int = Math.round(c.int * c.ef);
            c.ef = c.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
            if (c.ef < 1.3) c.ef = 1.3;
        }
        c.due = hojeNum() + c.int;
        s.srs[id] = c;
        F.store.salvar();
        return c;
    }

    /* Fila do dia: atrasados primeiro, depois novos. */
    function fila(todos, limite) {
        limite = limite || 20;
        var s = F.store.get().srs;
        var h = hojeNum();
        var vencidos = [], novos = [];
        for (var i = 0; i < todos.length; i++) {
            var id = todos[i].id;
            var c = s[id];
            if (!c) novos.push(todos[i]);
            else if (c.due <= h) vencidos.push(todos[i]);
        }
        vencidos.sort(function (a, b) { return (s[a.id].due || 0) - (s[b.id].due || 0); });
        return vencidos.concat(novos).slice(0, limite);
    }

    function resumo(todos) {
        var s = F.store.get().srs, h = hojeNum();
        var novos = 0, revisar = 0, aprendidos = 0;
        for (var i = 0; i < todos.length; i++) {
            var c = s[todos[i].id];
            if (!c) novos++;
            else if (c.due <= h) revisar++;
            else if (c.int >= 21) aprendidos++;
        }
        return { novos: novos, revisar: revisar, aprendidos: aprendidos, total: todos.length };
    }

    return { cartao: cartao, responder: responder, fila: fila, resumo: resumo, hojeNum: hojeNum };
})();
