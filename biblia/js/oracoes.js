/* =========================================================
   AS ORAÇÕES DOS ESTUDOS, PARA ORAR.

   Todo estudo completo termina com uma oração escrita a partir do
   capítulo. Ela estava enterrada no fim de um texto de vinte mil
   caracteres — boa para ler uma vez, inútil para a vida devocional,
   que é outra coisa: voltar amanhã, e no mês que vem, e levar a mesma
   oração para o dia.

   Este módulo não gera nada. Ele tira a oração de dentro do estudo que
   já existe, guarda quais são suas e anota o dia em que você orou. O
   resto é tela.

   Duas regras que o módulo carrega:

   - a oração é dita como é: escrita por IA a partir do capítulo. Quem
     ora tem direito de saber de onde vem a palavra que está orando;
   - o app não anota se você orou. Guardar uma oração é escolha sua e
     serve para achá-la de novo; contar orações seria transformar a vida
     devocional em placar, e o app já tem jogos onde placar cabe.
   ========================================================= */
window.B = window.B || {};

B.oracoes = (function () {
    'use strict';

    var cache = {};      // 'João 3' -> texto da oração, ou false quando não há

    /**
     * Tira a seção "Oração" do texto do estudo.
     *
     * O título vem como "### Oração" ou "## Oração", às vezes com algo
     * depois no mesmo cabeçalho, e termina no próximo cabeçalho — ou no
     * fim do texto, que é o caso mais comum, porque a oração fecha o
     * estudo.
     */
    function extrair(texto) {
        var t = String(texto || '');
        /* Sem a bandeira /m de propósito: com ela, o "$" do fim casaria
           no fim de qualquer linha, e a oração sairia vazia. */
        var m = t.match(/(?:^|\n)#{2,4}[ \t]*Ora[çc][ãa]o[^\n]*\n([\s\S]*?)(?=\n#{2,4}[ \t]|$)/);
        if (!m) return null;
        var corpo = m[1]
            .replace(/^\s*>\s?/gm, '')       // citação vira texto corrido
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .trim();
        return corpo.length > 40 ? corpo : null;
    }

    /** A oração de um capítulo, do estudo completo dele. */
    function doCapitulo(ref) {
        if (ref in cache) return Promise.resolve(cache[ref] || null);
        return B.estudos.obter(ref, 'completo').then(function (e) {
            var o = e ? extrair(e.texto) : null;
            cache[ref] = o || false;
            return o;
        }, function () { return null; });
    }

    /** Tem estudo completo? (não garante oração — isso só o texto diz) */
    function temEstudo(ref) {
        return B.estudos.obter(ref, 'completo').then(function (e) { return !!e; },
            function () { return false; });
    }

    /* ---------- o que é seu ---------- */

    function estado() {
        var cfg = (B.store.get() || {}).config || {};
        var o = cfg.oracoes || {};
        if (!o.guardadas) o.guardadas = [];
        return o;
    }

    function salvar(o) { B.store.setConfig('oracoes', o); }

    function guardadas() { return estado().guardadas.slice(); }

    function estaGuardada(ref) { return estado().guardadas.indexOf(ref) >= 0; }

    function guardar(ref) {
        var o = estado();
        var i = o.guardadas.indexOf(ref);
        if (i >= 0) o.guardadas.splice(i, 1); else o.guardadas.unshift(ref);
        salvar(o);
        return i < 0;        // true: acabou de entrar
    }


    function resumo() { return { guardadas: estado().guardadas.length }; }

    var AVISO = 'Oração escrita por IA a partir do capítulo, como o resto do estudo.';

    return {
        extrair: extrair, doCapitulo: doCapitulo, temEstudo: temEstudo,
        guardadas: guardadas, estaGuardada: estaGuardada, guardar: guardar,
        resumo: resumo, AVISO: AVISO
    };
})();
