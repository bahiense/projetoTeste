/* =========================================================
   REVISÃO ESPAÇADA — o que você leu volta, antes de sumir.

   Ler um capítulo e nunca mais vê-lo é o normal de todo plano de
   leitura: em um ano passam 1.189 capítulos, e no fim sobra a sensação
   de ter lido tudo e lembrar pouco. O remédio conhecido é simples:
   rever logo depois, de novo alguns dias depois, de novo um mês
   depois. É o que este módulo agenda.

   Cada capítulo lido entra numa fila com três encontros marcados —
   1 dia, 7 dias e 30 dias. Quando o dia chega, ele aparece em "Hoje"
   com o que existir dele: os exercícios do capítulo e os jogos de
   memorização daquele livro.

   O que fica guardado é só a data do próximo encontro, na config do
   app — vai no backup e volta depois de reinstalar, como o resto.
   ========================================================= */
window.B = window.B || {};

B.revisao = (function () {
    'use strict';

    var PASSOS = [1, 7, 30];      // dias até cada volta
    var TETO = 6;                 // por dia, para a lista nunca virar dívida

    function estado() {
        var cfg = (B.store.get() || {}).config || {};
        return cfg.revisao || {};
    }

    function salvar(mapa) { B.store.setConfig('revisao', mapa); }

    function hoje() { return B.store.hojeISO(); }

    function diasDepois(iso, dias) {
        var d = new Date(iso + 'T12:00:00');
        d.setDate(d.getDate() + dias);
        return d.toISOString().slice(0, 10);
    }

    /**
     * Um capítulo lido entra na fila.
     *
     * Reler um capítulo que já está na fila não reinicia a conta: quem
     * leu Gênesis 1 três vezes esta semana não precisa de três revisões
     * de Gênesis 1.
     */
    function registrar(ref) {
        var mapa = estado();
        if (mapa[ref]) return mapa[ref];
        var item = { passo: 0, quando: diasDepois(hoje(), PASSOS[0]), lido: hoje() };
        mapa[ref] = item;
        salvar(mapa);
        return item;
    }

    /** O que vence hoje (ou venceu antes e ficou para trás). */
    function paraHoje() {
        var mapa = estado();
        var h = hoje();
        var fora = [];
        Object.keys(mapa).forEach(function (ref) {
            var it = mapa[ref];
            if (!it || !it.quando || it.quando > h) return;
            var alvo = B.biblia.interpretar(ref);
            if (!alvo || !alvo.capitulo) return;      // referência estragada: ignora
            fora.push({
                ref: ref, livro: alvo.livro, capitulo: alvo.capitulo,
                passo: it.passo, atrasado: it.quando < h, quando: it.quando
            });
        });
        /* O mais antigo primeiro: quem esperou mais tempo volta antes. */
        fora.sort(function (a, b) { return a.quando < b.quando ? -1 : 1; });
        return fora.slice(0, TETO);
    }

    function quantosHoje() { return paraHoje().length; }

    /** Revisado: marca o próximo encontro, ou encerra a fila deste capítulo. */
    function feito(ref) {
        var mapa = estado();
        var it = mapa[ref];
        if (!it) return false;
        it.passo = (it.passo || 0) + 1;
        if (it.passo >= PASSOS.length) {
            delete mapa[ref];                 // três voltas bastam
        } else {
            it.quando = diasDepois(hoje(), PASSOS[it.passo]);
        }
        salvar(mapa);
        return true;
    }

    function adiar(ref) {
        var mapa = estado();
        if (!mapa[ref]) return false;
        mapa[ref].quando = diasDepois(hoje(), 1);
        salvar(mapa);
        return true;
    }

    function esquecer(ref) {
        var mapa = estado();
        if (ref) delete mapa[ref]; else mapa = {};
        salvar(mapa);
    }

    /* Quantos capítulos estão na fila, para a tela poder dizer. */
    function naFila() { return Object.keys(estado()).length; }

    /**
     * Os jogos que falam do livro que está sendo lido.
     *
     * Cada item de jogo cita o versículo de onde saiu, então o livro sai
     * do próprio dado — não de uma lista escrita à mão que envelheceria
     * a cada baralho novo.
     */
    var indice = null;

    function montarIndice() {
        if (indice) return indice;
        indice = { livro: {}, capitulo: {} };
        B.jogos.baralhos().forEach(function (b) {
            var vistos = {};
            b.itens.forEach(function (it) {
                var ref = it.ref ? String(it.ref) : '';
                var codigo = it.livro || (ref ? ref.split(' ')[0] : null);
                if (!codigo) return;
                if (!vistos['L' + codigo]) {
                    vistos['L' + codigo] = true;
                    (indice.livro[codigo] = indice.livro[codigo] || []).push(b);
                }
                var m = ref.match(/^(\S+) (\d+)/);
                if (m) {
                    var chave = m[1] + ' ' + m[2];
                    if (!vistos['C' + chave]) {
                        vistos['C' + chave] = true;
                        (indice.capitulo[chave] = indice.capitulo[chave] || []).push(b);
                    }
                }
            });
        });
        return indice;
    }

    function jogosDoLivro(usfm) {
        if (!B.jogos || !usfm) return [];
        return (montarIndice().livro[usfm] || []).slice();
    }

    function jogosDoCapitulo(usfm, cap) {
        if (!B.jogos || !usfm || !cap) return [];
        return (montarIndice().capitulo[usfm + ' ' + cap] || []).slice();
    }

    /**
     * Um jogo para acompanhar a revisão daquele capítulo.
     *
     * Primeiro os baralhos que citam o próprio capítulo — rever Gênesis
     * 1 com "os sete dias da criação" é outra coisa que rever com um
     * baralho qualquer de Gênesis. Só depois o resto do livro. Entre os
     * candidatos, prefere o que ainda não saiu inteiro.
     */
    function jogoSugerido(usfm, cap) {
        var lista = jogosDoCapitulo(usfm, cap);
        if (!lista.length) lista = jogosDoLivro(usfm);
        if (!lista.length) return null;
        var faltando = lista.filter(function (b) { return !B.jogos.decorado(b.id); });
        var fonte = faltando.length ? faltando : lista;
        return fonte[Math.floor(Math.random() * fonte.length)];
    }

    return {
        PASSOS: PASSOS, registrar: registrar, paraHoje: paraHoje, quantosHoje: quantosHoje,
        feito: feito, adiar: adiar, esquecer: esquecer, naFila: naFila,
        jogosDoLivro: jogosDoLivro, jogosDoCapitulo: jogosDoCapitulo,
        jogoSugerido: jogoSugerido
    };
})();
