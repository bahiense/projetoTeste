/* =========================================================
   Gravação da fala.

   MediaRecorder guarda o áudio para você ouvir de novo; ao mesmo tempo,
   se o navegador tiver reconhecimento de fala, ele transcreve ao vivo
   para a análise local. Os dois disputam o microfone em alguns
   celulares — se o reconhecimento falhar, a gravação continua igual.

   Para mandar ao Gemini, o áudio é convertido em WAV mono de 16 kHz:
   é um formato que toda versão da API aceita, ao contrário do WebM que
   o Chrome grava, e 16 kHz é tudo de que a voz precisa.
   ========================================================= */
window.O = window.O || {};

O.gravador = (function () {
    'use strict';

    var Reconhecimento = window.SpeechRecognition || window.webkitSpeechRecognition || null;

    function suportado() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
    }

    /**
     * Começa a gravar. Devolve um controle com parar() → Promise<{ blob,
     * url, segundos, transcricao }> e cancelar().
     * eventos: onNivel(0..1), onTempo(segundos), onTexto(transcricao), onLimite()
     */
    function iniciar(limiteSegundos, eventos) {
        eventos = eventos || {};
        return navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        }).then(function (stream) {
            var pedacos = [];
            var tipo = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
                .filter(function (t) { return MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t); })[0];
            var rec = new MediaRecorder(stream, tipo ? { mimeType: tipo } : undefined);
            rec.ondataavailable = function (e) { if (e.data && e.data.size) pedacos.push(e.data); };

            var inicio = Date.now();
            var acabou = false;
            var relogio = setInterval(function () {
                var s = (Date.now() - inicio) / 1000;
                if (eventos.onTempo) eventos.onTempo(s);
                if (s >= limiteSegundos && !acabou && eventos.onLimite) eventos.onLimite();
            }, 200);

            /* Medidor de volume: mostra que o microfone está ouvindo. */
            var actx = null, quadro = null;
            try {
                actx = new (window.AudioContext || window.webkitAudioContext)();
                var fonte = actx.createMediaStreamSource(stream);
                var an = actx.createAnalyser();
                an.fftSize = 512;
                fonte.connect(an);
                var buf = new Uint8Array(an.fftSize);
                (function medir() {
                    an.getByteTimeDomainData(buf);
                    var soma = 0;
                    for (var i = 0; i < buf.length; i++) { var v = (buf[i] - 128) / 128; soma += v * v; }
                    if (eventos.onNivel) eventos.onNivel(Math.min(1, Math.sqrt(soma / buf.length) * 4));
                    quadro = requestAnimationFrame(medir);
                })();
            } catch (e) { actx = null; }

            /* Transcrição ao vivo, quando houver. O Chrome encerra o
               reconhecimento após silêncios; ele é reiniciado até o fim. */
            var finais = [], parcial = '', reco = null;
            if (Reconhecimento) {
                try {
                    reco = new Reconhecimento();
                    reco.lang = 'pt-BR';
                    reco.continuous = true;
                    reco.interimResults = true;
                    reco.onresult = function (ev) {
                        parcial = '';
                        for (var i = ev.resultIndex; i < ev.results.length; i++) {
                            var r = ev.results[i];
                            if (r.isFinal) finais.push(r[0].transcript.trim());
                            else parcial += r[0].transcript;
                        }
                        if (eventos.onTexto) eventos.onTexto(texto());
                    };
                    reco.onerror = function (ev) {
                        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed' ||
                            ev.error === 'audio-capture') reco = null;
                    };
                    reco.onend = function () {
                        if (!acabou && reco) { try { reco.start(); } catch (e) { } }
                    };
                    reco.start();
                } catch (e) { reco = null; }
            }
            function texto() { return (finais.join(' ') + ' ' + parcial).replace(/\s+/g, ' ').trim(); }

            rec.start(1000);

            function encerrar() {
                acabou = true;
                clearInterval(relogio);
                if (quadro) cancelAnimationFrame(quadro);
                if (reco) { try { reco.stop(); } catch (e) { } }
                stream.getTracks().forEach(function (t) { t.stop(); });
                if (actx) { try { actx.close(); } catch (e) { } }
            }

            return {
                parar: function () {
                    var segundos = (Date.now() - inicio) / 1000;
                    return new Promise(function (ok) {
                        rec.onstop = function () {
                            encerrar();
                            /* O último resultado do reconhecimento pode chegar
                               logo depois do stop; meio segundo basta. */
                            setTimeout(function () {
                                var blob = new Blob(pedacos, { type: rec.mimeType || tipo || 'audio/webm' });
                                ok({ blob: blob, url: URL.createObjectURL(blob), segundos: segundos, transcricao: texto() });
                            }, 500);
                        };
                        if (rec.state !== 'inactive') rec.stop(); else rec.onstop();
                    });
                },
                cancelar: function () {
                    rec.onstop = null;
                    try { if (rec.state !== 'inactive') rec.stop(); } catch (e) { }
                    encerrar();
                }
            };
        });
    }

    /* ---------- conversão para WAV 16 kHz mono ---------- */

    function paraWav(blob) {
        return blob.arrayBuffer().then(function (bytes) {
            var Ctx = window.AudioContext || window.webkitAudioContext;
            var ctx = new Ctx();
            return new Promise(function (ok, falha) {
                ctx.decodeAudioData(bytes, ok, falha);
            }).then(function (audio) {
                try { ctx.close(); } catch (e) { }
                var taxa = 16000;
                var off = new OfflineAudioContext(1, Math.ceil(audio.duration * taxa), taxa);
                var src = off.createBufferSource();
                src.buffer = audio;
                src.connect(off.destination);
                src.start();
                return off.startRendering();
            }).then(function (r) {
                return codificarWav(r.getChannelData(0), 16000);
            });
        });
    }

    function codificarWav(amostras, taxa) {
        var buf = new ArrayBuffer(44 + amostras.length * 2);
        var v = new DataView(buf);
        function txt(pos, s) { for (var i = 0; i < s.length; i++) v.setUint8(pos + i, s.charCodeAt(i)); }
        txt(0, 'RIFF'); v.setUint32(4, 36 + amostras.length * 2, true); txt(8, 'WAVE');
        txt(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
        v.setUint32(24, taxa, true); v.setUint32(28, taxa * 2, true); v.setUint16(32, 2, true);
        v.setUint16(34, 16, true); txt(36, 'data'); v.setUint32(40, amostras.length * 2, true);
        for (var i = 0, p = 44; i < amostras.length; i++, p += 2) {
            var s = Math.max(-1, Math.min(1, amostras[i]));
            v.setInt16(p, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        }
        return new Blob([buf], { type: 'audio/wav' });
    }

    function base64(blob) {
        return new Promise(function (ok, falha) {
            var fr = new FileReader();
            fr.onload = function () { ok(String(fr.result).split(',')[1] || ''); };
            fr.onerror = function () { falha(fr.error); };
            fr.readAsDataURL(blob);
        });
    }

    /** Áudio pronto para a API: { tipo, base64 }. Se a conversão falhar,
        manda o original e deixa o Gemini tentar. */
    function paraEnvio(blob) {
        return paraWav(blob).then(function (wav) {
            return base64(wav).then(function (b) { return { tipo: 'audio/wav', base64: b }; });
        }, function () {
            var tipo = String(blob.type || 'audio/webm').split(';')[0];
            return base64(blob).then(function (b) { return { tipo: tipo, base64: b }; });
        });
    }

    return {
        suportado: suportado, iniciar: iniciar, paraEnvio: paraEnvio,
        temTranscricao: !!Reconhecimento, codificarWav: codificarWav
    };
})();
