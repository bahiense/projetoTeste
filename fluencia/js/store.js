/* =========================================================
   Estado do aluno — tudo fica no próprio aparelho.
   Nada é enviado para lugar nenhum.
   ========================================================= */
window.F = window.F || {};

F.store = (function () {
    'use strict';

    var CHAVE = 'fl:estado';

    var PADRAO = {
        v: 1,
        criado: null,
        nome: '',
        semana: 1,
        diaCiclo: 0,
        pacto: false,          // assinou o compromisso SYL
        streak: { atual: 0, recorde: 0, ultimo: '' },
        minutos: {},           // '2026-09-07': 42
        blocos: {},            // '2026-09-07': ['aquecimento','shadowing']
        srs: {},               // chunk -> agendamento
        escada: { nivel: 1, feitos: {} },
        diario: [],
        historico: {           // séries temporais de desempenho
            pronuncia: [], ditado: [], drill: [], fala: []
        },
        marcados: [],          // chunks favoritados
        config: {
            sotaque: 'en-US',
            voz: '',
            rate: 1,
            metaDiaria: 45,
            mostrarPt: true
        }
    };

    var estado = carregar();

    function clone(o) { return JSON.parse(JSON.stringify(o)); }

    function carregar() {
        try {
            var bruto = localStorage.getItem(CHAVE);
            if (!bruto) return novo();
            var s = JSON.parse(bruto);
            // completa chaves que não existiam em versões anteriores
            var p = clone(PADRAO);
            for (var k in p) if (!(k in s)) s[k] = p[k];
            for (var c in p.config) if (!(c in s.config)) s.config[c] = p.config[c];
            for (var h in p.historico) if (!(h in s.historico)) s.historico[h] = p.historico[h];
            return s;
        } catch (e) {
            return novo();
        }
    }

    function novo() {
        var s = clone(PADRAO);
        s.criado = hoje();
        return s;
    }

    function salvar() {
        try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* cota cheia */ }
    }

    function hoje() {
        var d = new Date();
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function diasEntre(a, b) {
        return Math.round((new Date(b + 'T00:00') - new Date(a + 'T00:00')) / 86400000);
    }

    /* ---------------- streak e tempo ---------------- */

    function registrarMinutos(min) {
        var d = hoje();
        estado.minutos[d] = (estado.minutos[d] || 0) + min;
        tocarStreak();
        salvar();
    }

    function tocarStreak() {
        var d = hoje();
        var s = estado.streak;
        if (s.ultimo === d) return;
        if (!s.ultimo) s.atual = 1;
        else {
            var dif = diasEntre(s.ultimo, d);
            s.atual = dif === 1 ? s.atual + 1 : (dif === 0 ? s.atual : 1);
        }
        s.ultimo = d;
        if (s.atual > s.recorde) s.recorde = s.atual;
    }

    function minutosHoje() { return estado.minutos[hoje()] || 0; }

    function minutosTotais() {
        var t = 0;
        for (var k in estado.minutos) t += estado.minutos[k];
        return t;
    }

    function diasEstudados() { return Object.keys(estado.minutos).length; }

    /* ---------------- blocos do ciclo diário ---------------- */

    function blocosHoje() { return estado.blocos[hoje()] || []; }

    function concluirBloco(id) {
        var d = hoje();
        if (!estado.blocos[d]) estado.blocos[d] = [];
        if (estado.blocos[d].indexOf(id) < 0) estado.blocos[d].push(id);
        tocarStreak();
        salvar();
    }

    function blocoFeito(id) { return blocosHoje().indexOf(id) >= 0; }

    /* ---------------- desempenho ---------------- */

    function registrar(serie, pct, extra) {
        var h = estado.historico[serie];
        if (!h) h = estado.historico[serie] = [];
        h.push({ d: hoje(), p: Math.round(pct), x: extra || null });
        if (h.length > 600) h.shift();
        salvar();
    }

    function media(serie, ultimos) {
        var h = estado.historico[serie] || [];
        var arr = ultimos ? h.slice(-ultimos) : h;
        if (!arr.length) return null;
        var t = 0;
        for (var i = 0; i < arr.length; i++) t += arr[i].p;
        return Math.round(t / arr.length);
    }

    /* Nota geral de fluência: 0 a 100, a partir do que existe de dado. */
    function notaFluencia() {
        var partes = [];
        var pr = media('pronuncia', 30); if (pr !== null) partes.push(pr);
        var di = media('ditado', 30); if (di !== null) partes.push(di);
        var dr = media('drill', 30); if (dr !== null) partes.push(dr);
        var fa = media('fala', 30); if (fa !== null) partes.push(fa);
        // constância vale um quarto da nota: fluência é frequência
        var const_ = Math.min(100, (estado.streak.atual / 30) * 100);
        var vol = Math.min(100, (minutosTotais() / (45 * 100)) * 100);
        if (!partes.length) return Math.round((const_ + vol) / 4);
        var m = partes.reduce(function (a, b) { return a + b; }, 0) / partes.length;
        return Math.round(m * 0.6 + const_ * 0.25 + vol * 0.15);
    }

    /* ---------------- diário ---------------- */

    function anotar(entrada) {
        entrada.data = hoje();
        entrada.ts = Date.now();
        estado.diario.unshift(entrada);
        if (estado.diario.length > 400) estado.diario.pop();
        salvar();
    }

    /* ---------------- exportar / importar ---------------- */

    function exportar() {
        return JSON.stringify(estado, null, 2);
    }

    function importar(texto) {
        var s = JSON.parse(texto);
        if (!s || typeof s !== 'object' || !('streak' in s)) throw new Error('arquivo não é um backup do app');
        estado = s;
        salvar();
        return true;
    }

    function zerar() {
        estado = novo();
        salvar();
    }

    return {
        get: function () { return estado; },
        salvar: salvar,
        hoje: hoje,
        diasEntre: diasEntre,
        registrarMinutos: registrarMinutos,
        minutosHoje: minutosHoje,
        minutosTotais: minutosTotais,
        diasEstudados: diasEstudados,
        tocarStreak: tocarStreak,
        blocosHoje: blocosHoje,
        blocoFeito: blocoFeito,
        concluirBloco: concluirBloco,
        registrar: registrar,
        media: media,
        notaFluencia: notaFluencia,
        anotar: anotar,
        exportar: exportar,
        importar: importar,
        zerar: zerar
    };
})();
