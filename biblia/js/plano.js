/* =========================================================
   O plano: oito frentes andando ao mesmo tempo.

   Cada grupo tem sua própria posição e seu próprio ciclo. Ler um
   capítulo de cada grupo por dia dá oito capítulos diários e uma
   Bíblia inteira quando o último grupo fecha o ciclo — mas o ritmo
   é seu: ler um grupo só também anda.
   ========================================================= */
window.B = window.B || {};

B.plano = (function () {
    'use strict';
    var bib = B.biblia, store = B.store;

    function leituraAtual(id) {
        var g = store.get().grupos[id];
        var l = bib.livro(g.livro);
        return { livro: l, cap: g.cap, ref: l.nome + ' ' + g.cap };
    }

    function proximaLeitura(id) {
        var g = store.get().grupos[id];
        var livros = bib.grupo(id).livros;
        var l = bib.livro(g.livro);
        if (g.cap < l.caps) return { livro: l, cap: g.cap + 1, ref: l.nome + ' ' + (g.cap + 1) };
        var prox = livros[(l.indice + 1) % livros.length];
        return { livro: prox, cap: 1, ref: prox.nome + ' 1', viraCiclo: l.indice === livros.length - 1 };
    }

    function irPara(id, nomeLivro, cap) {
        var g = store.get().grupos[id];
        var l = bib.livro(nomeLivro);
        if (!l || l.grupo !== id) return false;
        g.livro = l.nome;
        g.cap = Math.min(Math.max(1, cap), l.caps);
        store.salvar();
        return true;
    }

    /* Marca a leitura de hoje e anda uma casa. Devolve o que aconteceu,
       para a tela decidir se comemora. */
    function marcarLida(id) {
        var e = store.get();
        var g = e.grupos[id];
        var grupo = bib.grupo(id);
        var l = bib.livro(g.livro);
        var lido = { livro: l.nome, cap: g.cap };
        var fechouCiclo = false;

        store.marcar(l.nome, g.cap, true);

        e.historico.unshift({
            data: new Date().toISOString(), grupo: grupo.nome,
            livro: l.nome, cap: g.cap, icone: grupo.icone
        });
        if (e.historico.length > 200) e.historico = e.historico.slice(0, 200);

        g.lidosNoApp++;
        g.hoje = true;

        if (g.cap < l.caps) {
            g.cap++;
        } else if (l.indice < grupo.livros.length - 1) {
            g.livro = grupo.livros[l.indice + 1].nome;
            g.cap = 1;
        } else {
            g.livro = grupo.livros[0].nome;
            g.cap = 1;
            g.ciclos++;
            fechouCiclo = true;
        }

        atualizarSequencia();
        var biblia = fechouCiclo ? conferirBibliaCompleta() : false;
        store.salvar();

        return { lido: lido, fechouCiclo: fechouCiclo, ciclos: g.ciclos, biblia: biblia };
    }

    function desfazerUltima() {
        var e = store.get();
        var h = e.historico[0];
        if (!h) return null;
        var l = bib.livro(h.livro);
        if (!l) return null;
        var g = e.grupos[bib.grupo(l.grupo).id];
        store.marcar(h.livro, h.cap, false);
        g.livro = h.livro;
        g.cap = h.cap;
        g.lidosNoApp = Math.max(0, g.lidosNoApp - 1);
        e.historico.shift();
        store.salvar();
        return h;
    }

    /* A Bíblia inteira pelo plano é o ciclo fechado em todos os grupos:
       o menor número de ciclos é quantas vezes você deu a volta completa. */
    function conferirBibliaCompleta() {
        var e = store.get();
        var minimo = Math.min.apply(null, bib.GRUPOS.map(function (g) {
            return e.grupos[g.id].ciclos;
        }));
        if (minimo > e.biblias) {
            e.biblias = minimo;
            return minimo;
        }
        return false;
    }

    function atualizarSequencia() {
        var e = store.get();
        var hoje = store.hojeISO();
        if (e.datas.indexOf(hoje) < 0) e.datas.push(hoje);
        e.datas.sort();

        var conjunto = {};
        e.datas.forEach(function (d) { conjunto[d] = true; });

        var n = 0;
        var d = new Date();
        while (conjunto[store.hojeISO(d)]) {
            n++;
            d.setDate(d.getDate() - 1);
        }
        e.sequencia = n;
        e.recorde = Math.max(e.recorde || 0, n);
        e.ultimaData = hoje;
    }

    /* Progresso do ciclo em curso: quanto falta para o grupo dar a volta.
       Conta pela posição, não pelo que foi lido na vida — são coisas
       diferentes, e misturá-las faria a barra andar para trás. */
    function progressoCiclo(id) {
        var g = store.get().grupos[id];
        var livros = bib.grupo(id).livros;
        var l = bib.livro(g.livro);
        var andados = 0;
        for (var i = 0; i < l.indice; i++) andados += livros[i].caps;
        andados += g.cap - 1;
        var total = bib.capsDoGrupo(id);
        return { lidos: andados, total: total, pct: Math.round((andados / total) * 100) };
    }

    /* Progresso de verdade: capítulos distintos já lidos, do grupo e da
       Bíblia inteira, vindos da importação e das leituras marcadas. */
    function progressoReal(id) {
        var lidos = store.lidosNoGrupo(id);
        var total = bib.capsDoGrupo(id);
        return { lidos: lidos, total: total, pct: Math.round((lidos / total) * 100) };
    }

    function progressoBiblia() {
        var lidos = store.totalLidos();
        return {
            lidos: lidos, total: bib.TOTAL_CAPS,
            pct: Math.round((lidos / bib.TOTAL_CAPS) * 1000) / 10
        };
    }

    function estatisticas() {
        var e = store.get();
        var noApp = bib.GRUPOS.reduce(function (t, g) { return t + e.grupos[g.id].lidosNoApp; }, 0);
        var dias = e.datas.length;
        return {
            noApp: noApp,
            dias: dias,
            media: dias ? Math.round((noApp / dias) * 10) / 10 : 0,
            sequencia: e.sequencia,
            recorde: e.recorde,
            biblias: e.biblias,
            faltam: bib.TOTAL_CAPS - store.totalLidos()
        };
    }

    /* Quantos dias faltam para terminar a Bíblia no ritmo atual — a conta
       que ninguém faz e que todo mundo quer saber. Usa a média dos últimos
       30 dias, que é honesta com quem parou e voltou. */
    function previsao() {
        var e = store.get();
        var limite = new Date();
        limite.setDate(limite.getDate() - 30);
        var alvo = store.hojeISO(limite);
        var recentes = e.historico.filter(function (h) {
            return store.hojeISO(new Date(h.data)) >= alvo;
        }).length;
        /* Com dois ou três capítulos no mês a projeção vira ficção
           ("0 capítulos por dia, 97 anos"). Abaixo de dez leituras em
           30 dias é mais honesto não prever nada. */
        if (recentes < 10) return null;
        var porDia = recentes / 30;
        var faltam = bib.TOTAL_CAPS - store.totalLidos();
        if (faltam <= 0) return { dias: 0, porDia: Math.round(porDia * 10) / 10 };
        return {
            dias: Math.ceil(faltam / porDia),
            porDia: Math.round(porDia * 10) / 10
        };
    }

    var CONQUISTAS = [
        { icone: '📖', nome: 'Primeiro passo', desc: 'Marcar o primeiro capítulo', teste: function (c) { return c.noApp >= 1; } },
        { icone: '🔥', nome: 'Semana de fogo', desc: '7 dias seguidos', teste: function (c) { return c.recorde >= 7; } },
        { icone: '🌟', nome: 'Mês dedicado', desc: '30 dias seguidos', teste: function (c) { return c.recorde >= 30; } },
        { icone: '🧠', nome: 'Estudante', desc: 'Gerar 10 estudos', teste: function (c) { return c.estudos >= 10; } },
        { icone: '🔄', nome: 'Primeiro ciclo', desc: 'Fechar o ciclo de um grupo', teste: function (c) { return c.maiorCiclo >= 1; } },
        { icone: '🏛️', nome: 'Toda a Lei', desc: 'Ler o Pentateuco inteiro', teste: function (c) { return c.gruposCompletos.pentateuco; } },
        { icone: '✝️', nome: 'Os quatro retratos', desc: 'Ler os quatro Evangelhos', teste: function (c) { return c.gruposCompletos.evangelhos; } },
        { icone: '📚', nome: 'Centurião', desc: '100 capítulos lidos', teste: function (c) { return c.lidos >= 100; } },
        { icone: '📕', nome: 'Meio caminho', desc: 'Metade da Bíblia', teste: function (c) { return c.lidos >= 595; } },
        { icone: '👑', nome: 'Bíblia inteira', desc: 'Os 1.189 capítulos', teste: function (c) { return c.lidos >= 1189; } }
    ];

    function conquistas(qtdEstudos) {
        var st = estatisticas();
        var e = store.get();
        var completos = {};
        bib.GRUPOS.forEach(function (g) {
            completos[g.id] = store.lidosNoGrupo(g.id) >= bib.capsDoGrupo(g.id);
        });
        var ctx = {
            noApp: st.noApp, recorde: st.recorde, lidos: store.totalLidos(),
            estudos: qtdEstudos || 0, gruposCompletos: completos,
            maiorCiclo: Math.max.apply(null, bib.GRUPOS.map(function (g) { return e.grupos[g.id].ciclos; }))
        };
        return CONQUISTAS.map(function (c) {
            return { icone: c.icone, nome: c.nome, desc: c.desc, ok: !!c.teste(ctx) };
        });
    }

    /* Alinha a posição de cada grupo com o que a importação registrou:
       o plano recomeça no primeiro capítulo que ainda falta. */
    function alinharComLeitura() {
        var mudou = [];
        bib.GRUPOS.forEach(function (g) {
            var alvo = store.primeiroNaoLido(g.id);
            var atual = store.get().grupos[g.id];
            if (atual.livro !== alvo.livro || atual.cap !== alvo.cap) {
                atual.livro = alvo.livro;
                atual.cap = alvo.cap;
                mudou.push({ grupo: g.nome, ref: alvo.livro + ' ' + alvo.cap });
            }
        });
        store.salvar();
        return mudou;
    }

    return {
        leituraAtual: leituraAtual, proximaLeitura: proximaLeitura, irPara: irPara,
        marcarLida: marcarLida, desfazerUltima: desfazerUltima,
        progressoCiclo: progressoCiclo, progressoReal: progressoReal,
        progressoBiblia: progressoBiblia, estatisticas: estatisticas, previsao: previsao,
        conquistas: conquistas, alinharComLeitura: alinharComLeitura,
        atualizarSequencia: atualizarSequencia
    };
})();
