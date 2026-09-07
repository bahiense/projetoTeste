/* =========================================================
   Voz — falar, ouvir e gravar.

   Três recursos do próprio navegador:
     speechSynthesis      o app fala (modelo nativo)
     SpeechRecognition    o app ouve você (Chrome)
     MediaRecorder        grava sua voz para você se ouvir

   Tudo com degradação suave: se o aparelho não tiver um deles,
   o exercício continua funcionando de outro jeito.
   ========================================================= */
window.F = window.F || {};

F.voz = (function () {
    'use strict';

    var RecAPI = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    var sintese = window.speechSynthesis || null;
    var vozes = [];
    var rec = null;
    var recAtivo = false;
    var gravador = null;
    var pedacos = [];

    /* ---------------- suporte ---------------- */

    function temFala() { return !!sintese; }
    function temEscuta() { return !!RecAPI; }
    function temGravacao() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
    }

    /* ---------------- vozes ---------------- */

    function carregarVozes() {
        if (!sintese) return [];
        vozes = (sintese.getVoices() || []).filter(function (v) { return /^en/i.test(v.lang); });
        return vozes;
    }

    if (sintese) {
        carregarVozes();
        sintese.addEventListener && sintese.addEventListener('voiceschanged', carregarVozes);
    }

    function listaVozes() {
        if (!vozes.length) carregarVozes();
        return vozes;
    }

    function melhorVoz(sotaque) {
        var lista = listaVozes();
        if (!lista.length) return null;
        var cfg = F.store.get().config;
        if (cfg.voz) {
            for (var i = 0; i < lista.length; i++) if (lista[i].name === cfg.voz) return lista[i];
        }
        var alvo = sotaque || cfg.sotaque || 'en-US';
        // preferência: voz do idioma exato, natural/online, depois qualquer inglês
        var pontos = lista.map(function (v) {
            var p = 0;
            if (v.lang.replace('_', '-') === alvo) p += 10;
            else if (v.lang.slice(0, 2) === alvo.slice(0, 2)) p += 3;
            if (/natural|neural|google|premium|enhanced|siri/i.test(v.name)) p += 4;
            if (v.localService) p += 1;
            return { v: v, p: p };
        });
        pontos.sort(function (a, b) { return b.p - a.p; });
        return pontos[0].v;
    }

    /* ---------------- falar ---------------- */

    function falar(texto, opcoes) {
        opcoes = opcoes || {};
        return new Promise(function (resolve) {
            if (!sintese) { resolve(false); return; }
            try { sintese.cancel(); } catch (e) { }
            var u = new SpeechSynthesisUtterance(String(texto));
            var v = melhorVoz(opcoes.sotaque);
            if (v) { u.voice = v; u.lang = v.lang; }
            else u.lang = opcoes.sotaque || F.store.get().config.sotaque || 'en-US';
            u.rate = opcoes.rate || F.store.get().config.rate || 1;
            u.pitch = opcoes.pitch || 1;
            u.onend = function () { resolve(true); };
            u.onerror = function () { resolve(false); };
            // Chrome trava a fala se a aba ficou muito tempo parada: um resume preventivo
            try { sintese.resume(); } catch (e) { }
            sintese.speak(u);
        });
    }

    function pararFala() {
        if (sintese) { try { sintese.cancel(); } catch (e) { } }
    }

    /* Fala uma lista de frases em sequência, com pausa entre elas. */
    function falarSequencia(frases, opcoes, aoTrocar) {
        opcoes = opcoes || {};
        var i = 0, cancelado = false;
        function proxima() {
            if (cancelado || i >= frases.length) return Promise.resolve(!cancelado);
            var t = frases[i];
            if (aoTrocar) aoTrocar(i, t);
            return falar(t, opcoes).then(function () {
                i++;
                return new Promise(function (r) { setTimeout(r, opcoes.pausa || 350); }).then(proxima);
            });
        }
        var p = proxima();
        p.cancelar = function () { cancelado = true; pararFala(); };
        return p;
    }

    /* ---------------- ouvir ---------------- */

    function ouvir(opcoes) {
        opcoes = opcoes || {};
        return new Promise(function (resolve, reject) {
            if (!RecAPI) { reject(new Error('sem-reconhecimento')); return; }
            pararEscuta();
            rec = new RecAPI();
            rec.lang = opcoes.sotaque || F.store.get().config.sotaque || 'en-US';
            rec.continuous = !!opcoes.continuo;
            rec.interimResults = true;
            rec.maxAlternatives = 3;

            var finalTexto = '';
            var alternativas = [];

            rec.onresult = function (ev) {
                var parcial = '';
                for (var i = ev.resultIndex; i < ev.results.length; i++) {
                    var r = ev.results[i];
                    if (r.isFinal) {
                        finalTexto += ' ' + r[0].transcript;
                        for (var j = 0; j < r.length; j++) alternativas.push(r[j].transcript);
                    } else {
                        parcial += r[0].transcript;
                    }
                }
                if (opcoes.onParcial) opcoes.onParcial((finalTexto + ' ' + parcial).trim());
            };
            rec.onerror = function (ev) {
                recAtivo = false;
                if (ev.error === 'no-speech') { resolve({ texto: finalTexto.trim(), alternativas: alternativas, vazio: true }); return; }
                reject(new Error(ev.error || 'erro-reconhecimento'));
            };
            rec.onend = function () {
                recAtivo = false;
                resolve({ texto: finalTexto.trim(), alternativas: alternativas, vazio: !finalTexto.trim() });
            };
            try {
                rec.start();
                recAtivo = true;
                if (opcoes.limite) setTimeout(function () { if (recAtivo) pararEscuta(); }, opcoes.limite);
            } catch (e) {
                reject(e);
            }
        });
    }

    function pararEscuta() {
        if (rec) {
            try { rec.stop(); } catch (e) { }
            try { rec.abort && rec.abort(); } catch (e) { }
        }
        recAtivo = false;
    }

    function escutando() { return recAtivo; }

    /* ---------------- gravar ---------------- */

    function comecarGravacao() {
        if (!temGravacao()) return Promise.reject(new Error('sem-gravacao'));
        return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
            pedacos = [];
            var tipos = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', ''];
            var mime = '';
            for (var i = 0; i < tipos.length; i++) {
                if (!tipos[i] || (window.MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(tipos[i]))) { mime = tipos[i]; break; }
            }
            gravador = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
            gravador.ondataavailable = function (e) { if (e.data && e.data.size) pedacos.push(e.data); };
            gravador.start();
            return true;
        });
    }

    function pararGravacao() {
        return new Promise(function (resolve) {
            if (!gravador || gravador.state === 'inactive') { resolve(null); return; }
            gravador.onstop = function () {
                var blob = new Blob(pedacos, { type: gravador.mimeType || 'audio/webm' });
                try {
                    gravador.stream.getTracks().forEach(function (t) { t.stop(); });
                } catch (e) { }
                gravador = null;
                resolve(URL.createObjectURL(blob));
            };
            try { gravador.stop(); } catch (e) { resolve(null); }
        });
    }

    function gravando() { return !!gravador && gravador.state === 'recording'; }

    return {
        temFala: temFala,
        temEscuta: temEscuta,
        temGravacao: temGravacao,
        listaVozes: listaVozes,
        falar: falar,
        pararFala: pararFala,
        falarSequencia: falarSequencia,
        ouvir: ouvir,
        pararEscuta: pararEscuta,
        escutando: escutando,
        comecarGravacao: comecarGravacao,
        pararGravacao: pararGravacao,
        gravando: gravando
    };
})();
