/* =========================================================
   OUVIR O CAPÍTULO.

   Usa a voz que já existe no aparelho (a leitura em voz alta do
   Android, pelo speechSynthesis do navegador). Não baixa áudio, não
   depende de servidor, não custa nada e funciona em avião — e vale
   para qualquer edição, inclusive a que a pessoa carregou, porque o
   que é falado é o texto que está na tela.

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

    function disponivel() {
        return !!(fala && typeof SpeechSynthesisUtterance === 'function');
    }

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

    function temVozPortugues() { return !!vozEscolhida(); }

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

    function pausar() {
        if (!atual || atual.pausado) return false;
        atual.pausado = true;
        atual.acabouPausado = false;
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
        if (fala.paused) { try { fala.resume(); return true; } catch (e) { } }
        proximo();      // foi cancelado: recomeça o versículo da vez
        return true;
    }

    function parar() {
        var tinha = !!atual;
        var fim = atual && atual.aoFim;
        atual = null;
        if (fala) { try { fala.cancel(); } catch (e) { } }
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
        ler: ler, pausar: pausar, retomar: retomar, parar: parar,
        estado: estado, velocidade: velocidade
    };
})();
