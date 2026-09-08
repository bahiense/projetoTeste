/* =========================================================
   Ponte com o app Android.

   O WebView não implementa a Web Speech API: dentro dele
   window.speechSynthesis e SpeechRecognition não existem, e sem
   os dois este app vira só a versão escrita.

   Quando o app nativo está presente (window.AndroidVoz), este
   arquivo repõe as duas APIs com a mesma forma que o navegador
   expõe, para que js/voz.js — e todo o resto — não precise saber
   onde está rodando. No navegador comum, ele não faz nada.

   Sem isto, dentro do APK o app não ouviria a oração — e ouvir a
   oração é metade do que este app faz.

   Precisa vir ANTES de js/voz.js: aquele arquivo lê as duas APIs
   uma única vez, na hora em que carrega.
   ========================================================= */
(function () {
    'use strict';

    var ponte = window.AndroidVoz;
    /* Os lembretes vivem numa interface separada da voz: são assuntos
       distintos, e a página precisa saber qual das duas falta quando
       algo não funciona. */
    var lem = window.AndroidLembrete;
    if (!ponte) return;

    function definir(nome, valor) {
        // speechSynthesis é acessor somente-leitura em alguns WebViews:
        // atribuir direto falha em silêncio, defineProperty não.
        try {
            Object.defineProperty(window, nome, { value: valor, configurable: true, writable: true });
        } catch (e) {
            try { window[nome] = valor; } catch (e2) { }
        }
    }

    /* ---------------- falar ---------------- */

    var VOZES = [
        { name: 'Voz do Android — português do Brasil', lang: 'pt-BR', localService: true, default: true },
        { name: 'Voz do Android — português de Portugal', lang: 'pt-PT', localService: true, default: false }
    ];

    var falando = null;

    /* Encerra a fala atual uma única vez, venha o aviso do Android
       (terminou) ou daqui (foi cancelada). */
    function terminarFala(ok) {
        var u = falando;
        falando = null;
        if (!u) return;
        if (ok === false && u.onerror) u.onerror({ error: 'interrupted' });
        else if (u.onend) u.onend({});
    }

    window.__ponteFalaFim = function (ok) { terminarFala(ok !== false); };

    function Enunciado(texto) {
        this.text = texto === undefined ? '' : String(texto);
        this.lang = 'pt-BR';
        this.rate = 1;
        this.pitch = 1;
        this.volume = 1;
        this.voice = null;
        this.onend = null;
        this.onerror = null;
        this.onstart = null;
    }

    definir('SpeechSynthesisUtterance', Enunciado);

    definir('speechSynthesis', {
        speaking: false,
        pending: false,
        paused: false,
        speak: function (u) {
            terminarFala(true);          // o Android descarta a fala anterior
            falando = u;
            if (u.onstart) u.onstart({});
            ponte.falar(String(u.text || ''), u.rate || 1, u.lang || 'pt-BR');
        },
        cancel: function () {
            ponte.pararFala();
            terminarFala(true);          // TextToSpeech.stop() não avisa quem foi interrompido
        },
        pause: function () { },
        resume: function () { },
        getVoices: function () { return VOZES; },
        addEventListener: function () { },
        removeEventListener: function () { }
    });

    /* ---------------- ouvir ---------------- */

    var atual = null;

    /* Monta o evento no formato do navegador: results[i][j].transcript,
       com isFinal no resultado. É o que js/voz.js sabe ler. */
    function eventoDeFala(alternativas, isFinal) {
        var res = alternativas.map(function (t) {
            return { transcript: t, confidence: 0.9 };
        });
        res.isFinal = isFinal;
        var lista = [res];
        return { resultIndex: 0, results: lista };
    }

    window.__ponteEscuta = {
        parcial: function (texto) {
            if (atual && atual.onresult && atual.interimResults) {
                atual.onresult(eventoDeFala([texto], false));
            }
        },
        resultado: function (alternativas) {
            if (!atual || !atual.onresult) return;
            if (!alternativas || !alternativas.length) return;
            atual.onresult(eventoDeFala(alternativas, true));
        },
        erro: function (nome) {
            var r = atual;
            if (!r) return;
            atual = null;
            if (r.onerror) r.onerror({ error: nome });
            // no navegador, onend vem sempre depois de onerror
            if (r.onend) r.onend({});
        },
        fim: function () {
            var r = atual;
            if (!r) return;
            atual = null;
            if (r.onend) r.onend({});
        }
    };

    function Reconhecimento() {
        this.lang = 'pt-BR';
        this.continuous = false;
        this.interimResults = true;
        this.maxAlternatives = 3;
        this.onresult = null;
        this.onerror = null;
        this.onend = null;
    }

    Reconhecimento.prototype.start = function () {
        atual = this;
        ponte.ouvir(this.lang || 'pt-BR');
    };

    Reconhecimento.prototype.stop = function () {
        ponte.pararEscuta();
    };

    Reconhecimento.prototype.abort = function () {
        ponte.pararEscuta();
    };

    if (ponte.temEscuta && ponte.temEscuta()) {
        definir('SpeechRecognition', Reconhecimento);
        definir('webkitSpeechRecognition', Reconhecimento);
    }

    /* Marca o ambiente e entrega o controle do microfone para js/voz.js.
       O reconhecimento de fala roda no serviço do sistema e dispensa a
       permissão do app; a gravação, não — por isso os dois caminhos são
       separados aqui. */
    window.__android = {
        versao: (ponte.versao && ponte.versao()) || '?',
        escuta: !!(ponte.temEscuta && ponte.temEscuta()),
        microfone: ponte.temMicrofone ? {
            tem: function () { try { return !!ponte.temMicrofone(); } catch (e) { return false; } },
            pedir: function () { ponte.pedirMicrofone(); },
            liberar: function () { try { ponte.liberarMicrofone(); } catch (e) { } }
        } : null,

        /* Gravação pelo lado nativo. O getUserMedia do WebView disputa o
           microfone com o reconhecimento e com os assistentes do aparelho, e
           perde sem explicar; o MediaRecorder do Android grava direto. */
        gravador: ponte.gravarComecar ? {
            comecar: function () { try { return String(ponte.gravarComecar()); } catch (e) { return 'erro:' + e; } },
            parar: function () { try { return String(ponte.gravarParar() || ''); } catch (e) { return ''; } },
            gravando: function () { try { return !!ponte.gravandoAgora(); } catch (e) { return false; } },
            apagar: function (url) { try { return !!ponte.gravarApagar(String(url || '')); } catch (e) { return false; } }
        } : null,

        /* Lembretes: só o lado nativo consegue avisar com o app fechado.
           O AlarmManager continua valendo depois de reiniciar o aparelho;
           um temporizador dentro da página, não. */
        lembretes: (lem && lem.agendarLembretes) ? {
            agendar: function (json) { try { return String(lem.agendarLembretes(String(json))); } catch (e) { return ''; } },
            estado: function () { try { return String(lem.estadoLembretes() || '{}'); } catch (e) { return '{}'; } },
            pedirPermissao: function () { try { lem.pedirPermissaoAviso(); } catch (e) { } },
            abrirAjustesExato: function () { try { lem.abrirAjustesDeAlarme(); } catch (e) { } }
        } : null,

        diagnostico: function () {
            try { return ponte.diagnostico ? String(ponte.diagnostico()) : ''; } catch (e) { return ''; }
        }
    };
})();
