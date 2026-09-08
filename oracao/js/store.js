/* =========================================================
   Estado do aluno — tudo fica no próprio aparelho.

   Nada é enviado para lugar nenhum: o app não tem servidor. Isso
   importa mais aqui do que em outros apps, porque o que fica
   guardado é oração — e oração pública costuma citar a vida de
   outras pessoas. Por isso o texto transcrito pode ser desligado
   nos ajustes, e apagado a qualquer momento.
   ========================================================= */
window.A = window.A || {};

A.store = (function () {
    'use strict';

    var CHAVE = 'altar:estado';

    var PADRAO = {
        v: 1,
        criado: null,
        nome: '',
        streak: { atual: 0, recorde: 0, ultimo: '' },
        /* Programa de 21 dias. `dia` é o próximo a fazer. */
        programa: { dia: 1, iniciado: null, feitos: {} },
        /* Uma linha por oração treinada. É daqui que sai o progresso. */
        oracoes: [],
        /* Módulos do curso já lidos. */
        lidos: [],
        /* Versículos e palavras marcadas para revisar. */
        marcados: { versiculos: [], palavras: [] },
        /* Autoavaliação do Módulo 9: antes e depois do programa. */
        avaliacao: { inicial: null, final: null },
        /* Momentos reais: oração feita na vida, fora do treino. */
        reais: [],
        config: {
            guardarTexto: true,
            vozLeitura: '',
            velocidade: 1,
            avisoPassos: true,      // a bússola avisa quando é hora de virar
            lembrete: {
                ligado: false,
                dias: [1, 2, 3, 4, 5, 6, 0],
                hora: '20:00',
                antes: 0
            }
        }
    };

    var estado = carregar();

    function clone(o) { return JSON.parse(JSON.stringify(o)); }

    function carregar() {
        try {
            var bruto = localStorage.getItem(CHAVE);
            if (!bruto) return novo();
            var s = JSON.parse(bruto);
            var p = clone(PADRAO);
            for (var k in p) if (!(k in s)) s[k] = p[k];
            for (var c in p.config) if (!(c in s.config)) s.config[c] = p.config[c];
            for (var l in p.config.lembrete) if (!(l in s.config.lembrete)) s.config.lembrete[l] = p.config.lembrete[l];
            for (var m in p.marcados) if (!(m in s.marcados)) s.marcados[m] = p.marcados[m];
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

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function hoje() {
        var d = new Date();
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    function diasEntre(a, b) {
        return Math.round((new Date(b + 'T00:00') - new Date(a + 'T00:00')) / 86400000);
    }

    /* ---------------- constância ---------------- */

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

    /* ---------------- orações treinadas ---------------- */

    /* Guarda o resultado de um treino. `o` traz o que o analisador
       apurou; o texto só entra se o aluno deixou. */
    function guardarOracao(o) {
        o.data = hoje();
        o.ts = Date.now();
        if (!estado.config.guardarTexto) delete o.texto;
        estado.oracoes.unshift(o);
        if (estado.oracoes.length > 500) estado.oracoes.pop();
        tocarStreak();
        salvar();
        return o;
    }

    function oracoes(n) {
        return n ? estado.oracoes.slice(0, n) : estado.oracoes;
    }

    function oracoesHoje() {
        var d = hoje();
        return estado.oracoes.filter(function (o) { return o.data === d; });
    }

    function apagarOracao(ts) {
        estado.oracoes = estado.oracoes.filter(function (o) { return o.ts !== ts; });
        salvar();
    }

    function apagarTextos() {
        estado.oracoes.forEach(function (o) { delete o.texto; });
        salvar();
    }

    /* Média de uma medida do analisador nas últimas N orações. */
    function media(campo, ultimas) {
        var arr = estado.oracoes.slice(0, ultimas || 10).filter(function (o) {
            return o && typeof o[campo] === 'number';
        });
        if (!arr.length) return null;
        var t = 0;
        for (var i = 0; i < arr.length; i++) t += arr[i][campo];
        return Math.round(t / arr.length);
    }

    /* ---------------- programa de 21 dias ---------------- */

    function diaAtual() { return Math.min(21, estado.programa.dia || 1); }

    function diaFeito(n) { return !!estado.programa.feitos[n]; }

    function concluirDia(n, dados) {
        if (!estado.programa.iniciado) estado.programa.iniciado = hoje();
        estado.programa.feitos[n] = Object.assign({ data: hoje(), ts: Date.now() }, dados || {});
        if (n >= (estado.programa.dia || 1)) estado.programa.dia = Math.min(21, n + 1);
        tocarStreak();
        salvar();
    }

    function diasConcluidos() { return Object.keys(estado.programa.feitos).length; }

    function programaCompleto() { return diasConcluidos() >= 21; }

    function refazerPrograma() {
        estado.programa = { dia: 1, iniciado: null, feitos: {} };
        salvar();
    }

    /* ---------------- curso ---------------- */

    function marcarLido(id) {
        if (estado.lidos.indexOf(id) < 0) estado.lidos.push(id);
        salvar();
    }

    function lido(id) { return estado.lidos.indexOf(id) >= 0; }

    /* ---------------- marcados ---------------- */

    function alternarMarcado(tipo, id) {
        var lista = estado.marcados[tipo];
        var i = lista.indexOf(id);
        if (i >= 0) lista.splice(i, 1); else lista.push(id);
        salvar();
        return i < 0;
    }

    function marcado(tipo, id) { return estado.marcados[tipo].indexOf(id) >= 0; }

    /* ---------------- momentos reais ---------------- */

    /* O material insiste: o objetivo é a vida real, não o app. Aqui o
       aluno registra as orações que fez de verdade, na igreja ou em casa. */
    function registrarReal(r) {
        r.data = hoje();
        r.ts = Date.now();
        estado.reais.unshift(r);
        if (estado.reais.length > 300) estado.reais.pop();
        tocarStreak();
        salvar();
    }

    /* ---------------- avaliação ---------------- */

    function guardarAvaliacao(qual, notas) {
        estado.avaliacao[qual] = { data: hoje(), notas: notas };
        salvar();
    }

    /* ---------------- prontidão ---------------- */

    /* Uma nota só, de 0 a 100, para responder "estou pronto para ser
       chamado?". Desempenho pesa mais, mas constância e volume contam:
       quem parou de praticar não está tão pronto quanto acha. */
    function prontidao() {
        var partes = [];
        var q = media('nota', 10); if (q !== null) partes.push(q);
        var const_ = Math.min(100, (estado.streak.atual / 21) * 100);
        var prog = (diasConcluidos() / 21) * 100;
        var vol = Math.min(100, (estado.oracoes.length / 40) * 100);
        var base = partes.length ? partes[0] : 0;
        if (!estado.oracoes.length) return Math.round(prog * 0.4);
        return Math.round(base * 0.5 + prog * 0.2 + const_ * 0.15 + vol * 0.15);
    }

    /* ---------------- exportar / importar ---------------- */

    function exportar() { return JSON.stringify(estado, null, 2); }

    function importar(texto) {
        var s = JSON.parse(texto);
        if (!s || typeof s !== 'object' || !('programa' in s)) throw new Error('arquivo não é um backup do app');
        estado = s;
        salvar();
        return true;
    }

    function zerar() { estado = novo(); salvar(); }

    return {
        get: function () { return estado; },
        salvar: salvar,
        hoje: hoje,
        diasEntre: diasEntre,
        tocarStreak: tocarStreak,
        guardarOracao: guardarOracao,
        oracoes: oracoes,
        oracoesHoje: oracoesHoje,
        apagarOracao: apagarOracao,
        apagarTextos: apagarTextos,
        media: media,
        diaAtual: diaAtual,
        diaFeito: diaFeito,
        concluirDia: concluirDia,
        diasConcluidos: diasConcluidos,
        programaCompleto: programaCompleto,
        refazerPrograma: refazerPrograma,
        marcarLido: marcarLido,
        lido: lido,
        alternarMarcado: alternarMarcado,
        marcado: marcado,
        registrarReal: registrarReal,
        guardarAvaliacao: guardarAvaliacao,
        prontidao: prontidao,
        exportar: exportar,
        importar: importar,
        zerar: zerar
    };
})();
