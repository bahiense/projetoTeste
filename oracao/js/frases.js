/* =========================================================
   Escolha das frases de partida.

   Duas regras, e as duas existem para a frase não virar muleta:

   - Nunca repete dentro da mesma oração. Ver a mesma frase duas
     vezes ensina a decorá-la, que é o contrário do método.
   - Prefere o contexto quando ele existe: no hospital, a abertura
     que fala de hospital vem antes da genérica.
   ========================================================= */
window.A = window.A || {};

A.frases = (function () {
    'use strict';

    var usadas = {};        // momento -> frases já mostradas nesta oração

    function limpar() { usadas = {}; }

    /* Duas listas separadas de propósito: a do contexto tem prioridade na
       hora de sortear. Juntar tudo num monte só faria a frase do velório
       aparecer no velório por acaso, e não por escolha. */
    function bancos(momento, contexto) {
        var m = A.FRASES[momento] || {};
        return {
            contexto: (contexto && m[contexto]) ? m[contexto] : [],
            geral: m.geral || []
        };
    }

    function banco(momento, contexto) {
        var b = bancos(momento, contexto);
        return b.contexto.concat(b.geral);
    }

    function tirar(pool, momento, quantas, saida) {
        var livres = pool.filter(function (f) { return usadas[momento].indexOf(f) < 0; });
        while (saida.length < quantas && livres.length) {
            var i = Math.floor(Math.random() * livres.length);
            saida.push(livres[i]);
            usadas[momento].push(livres[i]);
            livres.splice(i, 1);
        }
    }

    /* Devolve `quantas` frases ainda não usadas neste momento — as do
       contexto primeiro. Quando o banco se esgota, recomeça em vez de
       devolver vazio. */
    function para(momento, contexto, quantas) {
        quantas = quantas || 2;
        var b = bancos(momento, contexto);
        if (!b.contexto.length && !b.geral.length) return [];
        if (!usadas[momento]) usadas[momento] = [];

        var saida = [];
        tirar(b.contexto, momento, quantas, saida);
        tirar(b.geral, momento, quantas, saida);

        if (!saida.length) {          // tudo já foi usado: recomeça
            usadas[momento] = [];
            tirar(b.contexto, momento, quantas, saida);
            tirar(b.geral, momento, quantas, saida);
        }
        return saida;
    }

    function uma(momento, contexto) {
        var f = para(momento, contexto, 1);
        return f[0] || '';
    }

    function total(momento, contexto) { return banco(momento, contexto).length; }

    function nomeDoMomento(id) {
        var achado = null;
        A.FRASES_MOMENTOS.forEach(function (m) { if (m.id === id) achado = m; });
        return achado;
    }

    return { para: para, uma: uma, total: total, limpar: limpar, momento: nomeDoMomento };
})();
