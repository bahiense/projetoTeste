/* =========================================================
   Ligações entre o currículo e os bancos de conteúdo.
   ========================================================= */
window.F = window.F || {};

F.curso = (function () {
    'use strict';

    function porId(lista, id) {
        for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i];
        return null;
    }

    function semanaAtual() {
        var n = F.store.get().semana || 1;
        return F.data.curriculo[Math.min(n, F.data.curriculo.length) - 1];
    }

    function fase(n) {
        for (var i = 0; i < F.data.fases.length; i++) if (F.data.fases[i].id === n) return F.data.fases[i];
        return F.data.fases[0];
    }

    function som(id) { return porId(F.data.sons, id); }
    function shadowing(id) { return porId(F.data.shadowing, id); }
    function ditado(id) { return porId(F.data.ditado, id); }
    function drill(id) { return porId(F.data.drills, id); }
    function dialogo(id) { return porId(F.data.dialogos, id); }
    function funcao(id) { return porId(F.data.funcoes, id); }
    function degrau(n) { return F.data.escada[Math.min(Math.max(n, 1), F.data.escada.length) - 1]; }

    /* Chunks liberados até a semana atual (nível cresce com o programa). */
    function chunksDaSemana() {
        var s = semanaAtual();
        var nivelMax = s.fase >= 4 ? 3 : (s.fase >= 2 ? 2 : 1);
        var daFuncao = [], resto = [];
        F.data.chunks.forEach(function (c, i) {
            c.id = c.id || ('ch' + i);
            if (c.n > nivelMax) return;
            (c.f === s.funcao ? daFuncao : resto).push(c);
        });
        return { foco: daFuncao, todos: daFuncao.concat(resto) };
    }

    /* Garante id em todo chunk, mesmo fora da semana. */
    (function idsFixos() {
        F.data.chunks.forEach(function (c, i) { if (!c.id) c.id = 'ch' + i; });
    })();

    function avancarSemana() {
        var s = F.store.get();
        if (s.semana < F.data.curriculo.length) { s.semana++; F.store.salvar(); return true; }
        return false;
    }

    /* Blocos do ciclo diário — a rotina do CTM adaptada. */
    var CICLO = [
        { id: 'aquecimento', nome: 'Aquecimento da boca', min: 5, rota: '#/pronuncia', desc: 'O som da semana, exagerado, com pares mínimos.' },
        { id: 'shadowing', nome: 'Shadowing', min: 10, rota: '#/shadowing', desc: 'Falar por cima do modelo, meio segundo atrás, sem parar.' },
        { id: 'drill', nome: 'Drill de estrutura', min: 6, rota: '#/drills', desc: 'Estímulo e resposta no relógio, até virar reflexo.' },
        { id: 'chunks', nome: 'Blocos de fala', min: 6, rota: '#/chunks', desc: 'Memorização proposital, com repetição espaçada.' },
        { id: 'escuta', nome: 'Laboratório de escuta', min: 8, rota: '#/escuta', desc: 'Ditado em velocidade real, para o ouvido pegar a fala colada.' },
        { id: 'conversa', nome: 'Role-play', min: 8, rota: '#/conversa', desc: 'Resolver uma situação real falando, com o app fazendo o outro.' },
        { id: 'explicar', nome: 'Explique sem a palavra', min: 5, rota: '#/explicar', desc: 'Chegar na ideia sem a palavra, com as saídas fáceis proibidas.' },
        { id: 'pegaoerro', nome: 'Pega o erro', min: 3, rota: '#/pegaoerro', desc: 'Julgar a frase só pelo áudio e dizer a forma certa em voz alta.' }
    ];

    return {
        semanaAtual: semanaAtual, fase: fase, som: som, shadowing: shadowing, ditado: ditado,
        drill: drill, dialogo: dialogo, funcao: funcao, degrau: degrau,
        chunksDaSemana: chunksDaSemana, avancarSemana: avancarSemana, CICLO: CICLO, porId: porId
    };
})();
