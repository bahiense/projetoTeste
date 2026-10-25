/* =========================================================
   O mentor fala: o feedback em áudio é lido pela voz do próprio
   aparelho (speechSynthesis), em português. Funciona sem internet
   e sem gastar cota da IA.
   ========================================================= */
window.O = window.O || {};

O.voz = (function () {
    'use strict';

    var sintese = window.speechSynthesis || null;
    var vozes = [];

    function carregarVozes() {
        if (!sintese) return [];
        vozes = (sintese.getVoices() || []).filter(function (v) { return /^pt/i.test(v.lang); })
            .sort(function (a, b) {
                /* pt-BR antes de pt-PT; vozes "naturais"/online antes das locais. */
                return peso(a) - peso(b);
            });
        return vozes;

        function peso(v) {
            return (/pt[-_]BR/i.test(v.lang) ? 0 : 10) +
                (/natural|online|neural|google/i.test(v.name) ? 0 : 1);
        }
    }
    if (sintese) {
        carregarVozes();
        if ('onvoiceschanged' in sintese) sintese.onvoiceschanged = carregarVozes;
    }

    function disponivel() { return !!sintese; }

    function lista() { return vozes.length ? vozes : carregarVozes(); }

    /* O Chrome corta falas longas (~15 s) em alguns aparelhos; lendo por
       frases, cada pedaço é curto e o "parar" responde na hora. */
    function frases(texto) {
        return String(texto || '').replace(/\s+/g, ' ')
            .match(/[^.!?…]+[.!?…]*\s*/g) || [];
    }

    var fila = [];
    var falando = false;
    var aoAcabar = null;

    function falar(texto, cfg, eventos) {
        parar();
        if (!sintese) return false;
        eventos = eventos || {};
        cfg = cfg || {};
        var v = lista().filter(function (x) { return x.name === cfg.voz; })[0] || lista()[0] || null;
        fila = frases(texto);
        falando = true;
        aoAcabar = eventos.onFim || null;
        var total = fila.length, feito = 0;

        (function proxima() {
            if (!falando) return;
            var f = fila.shift();
            if (!f) { falando = false; if (aoAcabar) aoAcabar(); return; }
            var u = new SpeechSynthesisUtterance(f.trim());
            u.lang = v ? v.lang : 'pt-BR';
            if (v) u.voice = v;
            u.rate = cfg.velocidade || 1;
            u.onend = u.onerror = function () {
                feito++;
                if (eventos.onProgresso) eventos.onProgresso(feito / total);
                proxima();
            };
            sintese.speak(u);
        })();
        return true;
    }

    function parar() {
        var cb = aoAcabar;
        falando = false;
        fila = [];
        aoAcabar = null;
        if (sintese) sintese.cancel();
        if (cb) cb();
    }

    function ativo() { return falando; }

    return { disponivel: disponivel, lista: lista, falar: falar, parar: parar, ativo: ativo, frases: frases };
})();
