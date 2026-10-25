/* =========================================================
   Estado salvo no aparelho (localStorage): ajustes, o treino em
   andamento e o histórico de avaliações. O áudio não é guardado —
   só o texto da avaliação, que é o que serve para ver a evolução.
   ========================================================= */
window.O = window.O || {};

O.store = (function () {
    'use strict';

    var CHAVE = 'oratoria10x-v1';
    var MAX_HISTORICO = 300;

    function vazio() {
        return {
            cfg: { chaveGoogle: '', modeloGoogle: '', voz: '', velocidade: 1, nivel: 'intermediario', minutos: 2 },
            atual: null,          // { tema, roteiro, contexto, minutos }
            historico: []         // [{ id, data, tema, nivel, minutos, segundos, avaliacao }]
        };
    }

    var estado = null;

    function carregar() {
        var e = vazio();
        try {
            var cru = localStorage.getItem(CHAVE);
            if (cru) {
                var d = JSON.parse(cru);
                e.cfg = Object.assign(e.cfg, d.cfg || {});
                e.atual = d.atual || null;
                e.historico = Array.isArray(d.historico) ? d.historico : [];
            }
        } catch (x) { }
        return e;
    }

    function get() {
        if (!estado) estado = carregar();
        return estado;
    }

    function salvar() {
        try { localStorage.setItem(CHAVE, JSON.stringify(get())); } catch (x) { }
    }

    function cfg() { return get().cfg; }

    function ajustar(mudancas) {
        Object.assign(get().cfg, mudancas);
        salvar();
    }

    function definirAtual(atual) {
        get().atual = atual;
        salvar();
    }

    function registrar(item) {
        var h = get().historico;
        item.id = item.id || Date.now().toString(36);
        item.data = item.data || new Date().toISOString();
        h.push(item);
        if (h.length > MAX_HISTORICO) h.splice(0, h.length - MAX_HISTORICO);
        salvar();
        return item;
    }

    function apagar(id) {
        var e = get();
        e.historico = e.historico.filter(function (h) { return h.id !== id; });
        salvar();
    }

    function temasFeitos() {
        return get().historico.map(function (h) { return h.tema && h.tema.titulo; }).filter(Boolean);
    }

    function dia(d) { return d.toLocaleDateString('sv'); }   // AAAA-MM-DD no fuso local

    /** Dias seguidos com pelo menos um treino, contando até hoje (ou ontem). */
    function sequencia(hoje) {
        var dias = {};
        get().historico.forEach(function (h) { dias[dia(new Date(h.data))] = 1; });
        var d = hoje ? new Date(hoje) : new Date();
        var n = 0;
        if (!dias[dia(d)]) d.setDate(d.getDate() - 1);
        while (dias[dia(d)]) { n++; d.setDate(d.getDate() - 1); }
        return n;
    }

    function exportar() {
        var e = get();
        return JSON.stringify({ app: 'oratoria10x', versao: 1, historico: e.historico,
            cfg: Object.assign({}, e.cfg, { chaveGoogle: '' }) }, null, 1);
    }

    function importar(texto) {
        var d = JSON.parse(texto);
        if (!d || d.app !== 'oratoria10x' || !Array.isArray(d.historico)) {
            throw new Error('Esse arquivo não é um backup do Oratória 10x.');
        }
        var e = get();
        var ids = {};
        e.historico.forEach(function (h) { ids[h.id] = 1; });
        var novos = d.historico.filter(function (h) { return h && h.id && !ids[h.id]; });
        e.historico = e.historico.concat(novos).sort(function (a, b) {
            return String(a.data).localeCompare(String(b.data));
        });
        salvar();
        return novos.length;
    }

    function zerar() {
        var chave = cfg().chaveGoogle, modelo = cfg().modeloGoogle;
        estado = vazio();
        estado.cfg.chaveGoogle = chave;
        estado.cfg.modeloGoogle = modelo;
        salvar();
    }

    return {
        get: get, salvar: salvar, cfg: cfg, ajustar: ajustar, definirAtual: definirAtual,
        registrar: registrar, apagar: apagar, temasFeitos: temasFeitos, sequencia: sequencia,
        exportar: exportar, importar: importar, zerar: zerar
    };
})();
