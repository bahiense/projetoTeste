/* =========================================================
   OUVIR O CAPÍTULO.

   Usa a voz que já existe no aparelho. Não baixa áudio, não depende de
   servidor, não custa nada e funciona em avião — e vale para qualquer
   edição, inclusive a que a pessoa carregou, porque o que é falado é o
   texto que está na tela.

   São dois caminhos para a mesma coisa, porque o WebView do Android
   não tem o speechSynthesis do navegador — o objeto nem existe, e no
   app instalado o botão simplesmente não aparecia, justamente onde ele
   faz mais falta. Então:

   - no app, a ponte AndroidVoz, ligada no TextToSpeech do sistema;
   - no navegador e no Claude, o speechSynthesis de sempre.

   Quem chama não precisa saber de qual dos dois a voz saiu.

   Fala versículo a versículo, não o capítulo inteiro de uma vez. São
   três motivos:

   1. a tela acompanha: dá para destacar o versículo que está sendo
      lido e rolar junto;
   2. pausar e voltar não perde o lugar;
   3. frase curta é mais estável: a voz do sistema engasga com textos
      longos, e algumas param no meio sem avisar.

   O que este módulo não faz: continuar com a tela apagada. Isso é
   decisão do Android, e o app pede para manter a tela acesa enquanto
   lê — o mesmo que o mutirão faz.
   ========================================================= */
window.B = window.B || {};

B.audio = (function () {
    'use strict';

    var fala = typeof speechSynthesis !== 'undefined' ? speechSynthesis : null;
    var vozes = [];
    var atual = null;        // { versiculos, i, aoVerso, aoFim, pausado }
    var seq = 0;             // id da frase em curso, para o aviso nativo

    function nativa() {
        var n = window.AndroidVoz;
        if (!n || typeof n.falar !== 'function') return null;
        try { return n.existe() ? n : null; } catch (e) { return null; }
    }

    function doNavegador() {
        return !!(fala && typeof SpeechSynthesisUtterance === 'function');
    }

    function disponivel() { return !!nativa() || doNavegador(); }

    /* As vozes chegam depois, no Android: a lista vem vazia na primeira
       pergunta e só é preenchida quando o motor responde. */
    function carregarVozes() {
        if (!fala) return;
        vozes = fala.getVoices() || [];
        if (!vozes.length && typeof fala.addEventListener === 'function') {
            fala.addEventListener('voiceschanged', function () {
                vozes = fala.getVoices() || [];
            });
        }
    }
    carregarVozes();

    /** A melhor voz em português que o aparelho tiver. */
    function vozEscolhida() {
        if (!vozes.length) vozes = (fala && fala.getVoices()) || [];
        var pt = vozes.filter(function (v) { return /^pt(-|_|$)/i.test(v.lang || ''); });
        var br = pt.filter(function (v) { return /br/i.test(v.lang || ''); });
        return br[0] || pt[0] || null;
    }

    function temVozPortugues() {
        var n = nativa();
        if (n) {
            try { return !!n.temPortugues(); } catch (e) { return true; }
        }
        return !!vozEscolhida();
    }

    function velocidade(nova) {
        if (nova !== undefined) {
            B.store.setConfig('vozVelocidade', Math.max(0.5, Math.min(2, nova)));
        }
        var v = (B.store.get().config || {}).vozVelocidade;
        return v || 1;
    }

    function acordado(ligar) {
        var n = window.AndroidArquivo;
        if (n && typeof n.manterAcordado === 'function') {
            try { n.manterAcordado(!!ligar); } catch (e) { }
        }
    }

    /**
     * Lê uma lista de versículos.
     *
     * aoVerso(i) é chamado quando cada um começa — é por ele que a tela
     * destaca e rola. aoFim(motivo) fecha: 'fim' quando acabou o
     * capítulo, 'parado' quando a pessoa parou.
     */
    function ler(versiculos, aoVerso, aoFim, comecarEm) {
        if (!disponivel() || !versiculos || !versiculos.length) return false;
        parar();
        atual = {
            versiculos: versiculos, i: Math.max(0, comecarEm || 0),
            aoVerso: aoVerso || function () { }, aoFim: aoFim || function () { },
            pausado: false
        };
        acordado(true);
        proximo();
        return true;
    }

    function proximo() {
        if (!atual) return;
        if (atual.i >= atual.versiculos.length) {
            var fim = atual.aoFim;
            atual = null;
            acordado(false);
            fim('fim');
            return;
        }
        var i = atual.i;
        var texto = String(atual.versiculos[i] || '').trim();
        if (!texto) { atual.i++; return proximo(); }

        var n = nativa();
        if (n) {
            seq++;
            atual.id = String(seq);
            atual.aoVerso(i);
            try {
                n.falar(texto, atual.id, velocidade());
            } catch (e) {
                /* Motor recusou esta frase: segue para a próxima, que é
                   melhor do que parar em silêncio. */
                atual.i++;
                setTimeout(proximo, 120);
            }
            return;
        }

        var u = new SpeechSynthesisUtterance(texto);
        var voz = vozEscolhida();
        if (voz) u.voice = voz;
        u.lang = (voz && voz.lang) || 'pt-BR';
        u.rate = velocidade();
        u.onend = function () {
            if (!atual) return;
            /* Pausado quando o versículo acabou: o motor não vai avisar
               de novo, então fica anotado que este já foi — senão
               "continuar" ficaria esperando um aviso que não vem. */
            if (atual.pausado) { atual.acabouPausado = true; return; }
            atual.i++;
            proximo();
        };
        /* Erro no meio não pode travar a leitura: pula o versículo e
           segue, que é melhor do que parar em silêncio. */
        u.onerror = function () {
            if (!atual || atual.pausado) return;
            atual.i++;
            setTimeout(proximo, 120);
        };
        atual.aoVerso(i);
        fala.speak(u);
    }

    /**
     * O Android avisa aqui que acabou de falar a frase.
     *
     * Chamado de fora (VozBridge.kt), com o id da frase: aviso de frase
     * velha, que chegou atrasado depois de um "parar", é ignorado.
     */
    function __fimNativo(id, oque) {
        if (!atual || String(id) !== String(atual.id)) return;
        if (atual.pausado) { atual.acabouPausado = true; return; }
        atual.i++;
        if (oque === 'erro') setTimeout(proximo, 120); else proximo();
    }

    function pausar() {
        if (!atual || atual.pausado) return false;
        atual.pausado = true;
        atual.acabouPausado = false;
        var n = nativa();
        if (n) {
            /* O TextToSpeech do Android não pausa: para. Retomar refaz o
               versículo da vez desde o começo, que para quem ouve é a
               mesma coisa. */
            try { n.parar(); } catch (e) { }
            acordado(false);
            return true;
        }
        try { fala.pause(); } catch (e) { }
        /* Algumas versões do Android ignoram pause(): cancelar e retomar
           do mesmo versículo dá no mesmo para quem ouve. */
        setTimeout(function () {
            if (atual && atual.pausado && fala.speaking && !fala.paused) {
                try { fala.cancel(); } catch (e) { }
            }
        }, 150);
        acordado(false);
        return true;
    }

    function retomar() {
        if (!atual || !atual.pausado) return false;
        atual.pausado = false;
        acordado(true);
        if (atual.acabouPausado) {
            atual.acabouPausado = false;
            atual.i++;
            proximo();                       // o versículo já tinha acabado
            return true;
        }
        if (!nativa() && fala && fala.paused) {
            try { fala.resume(); return true; } catch (e) { }
        }
        proximo();      // foi cancelado: recomeça o versículo da vez
        return true;
    }

    function parar() {
        var tinha = !!atual;
        var fim = atual && atual.aoFim;
        atual = null;
        var n = nativa();
        if (n) { try { n.parar(); } catch (e) { } }
        else if (fala) { try { fala.cancel(); } catch (e) { } }
        acordado(false);
        if (tinha && fim) fim('parado');
        return tinha;
    }

    function estado() {
        if (!atual) return { lendo: false, pausado: false, verso: -1 };
        return { lendo: true, pausado: atual.pausado, verso: atual.i };
    }

    return {
        disponivel: disponivel, temVozPortugues: temVozPortugues,
        __fimNativo: __fimNativo,
        ler: ler, pausar: pausar, retomar: retomar, parar: parar,
        estado: estado, velocidade: velocidade
    };
})();
