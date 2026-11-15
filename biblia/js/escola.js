/* =========================================================
   ESCOLA DE ORAÇÃO — orar na frente de outras pessoas.

   Isto é outra coisa do que a tela Orar. Lá estão as orações que fecham
   cada estudo, escritas por IA a partir do capítulo: servem para a sua
   devoção. Aqui estão as orações QUE ESTÃO NA BÍBLIA — Daniel 9, o Pai
   Nosso, o Magnificat, a da igreja perseguida em Atos 4 —, e a razão da
   diferença é simples: quem vai orar em público não deve aprender o
   jeito imitando uma IA. Deve aprender com a Escritura.

   Três coisas moram aqui:

   1. as 57 orações da Bíblia, com texto de verdade, lido do próprio app;
   2. o cartão de condução: cinco movimentos (adoração, confissão,
      gratidão, petição, intercessão) e, em cada um, frases bíblicas de
      verdade para escolher. O cartão sai com letra grande, para orar
      olhando de relance — não para ler em voz alta;
   3. a decoração das frases, em revisão espaçada, porque orar bem em
      público é ter vocabulário disponível sob pressão, e vocabulário
      disponível é vocabulário decorado.

   Deste módulo não sai nenhuma palavra bíblica: só referências. O texto
   vem de B.texto, a mesma fonte da tela de leitura — inclusive a edição
   que a pessoa carregou no aparelho. É por isso que a tela nunca mostra
   uma palavra que o app não tenha.

   O que este módulo não faz: contar quantas vezes você orou. Orar não é
   placar. Decorar é, e esse é o único número que ele guarda.
   ========================================================= */
window.B = window.B || {};

B.escola = (function () {
    'use strict';

    var D = window.B.oracoesDados || { movimentos: [], oracoes: [], frases: [], usos: [] };

    /* Os mesmos passos da revisão dos capítulos: 1, 7 e 30 dias. */
    var PASSOS = [1, 7, 30];

    /* ---------- o acervo ---------- */

    function movimentos() {
        return D.movimentos.slice().sort(function (a, b) { return a.ordem - b.ordem; });
    }

    function frases(movimento) {
        return D.frases.filter(function (f) { return f.movimento === movimento; });
    }

    function fraseDe(ref) {
        var achou = null;
        D.frases.forEach(function (f) { if (f.ref === ref) achou = f; });
        return achou;
    }

    function oracoes() { return D.oracoes.slice(); }

    function oracao(id) {
        var achou = null;
        D.oracoes.forEach(function (o) { if (o.id === id) achou = o; });
        return achou;
    }

    /* As ocasiões que têm ao menos uma oração — ocasião vazia na tela é
       promessa que o app não cumpre. */
    function usos() {
        return D.usos.filter(function (u) {
            return D.oracoes.some(function (o) { return o.usos.indexOf(u.id) >= 0; });
        });
    }

    function porUso(uso) {
        if (!uso) return oracoes();
        return D.oracoes.filter(function (o) { return o.usos.indexOf(uso) >= 0; });
    }

    /* ---------- a referência e o texto ---------- */

    var PORUSFM = null;

    function porUsfm(codigo) {
        if (!PORUSFM) {
            PORUSFM = {};
            (B.biblia.LIVROS || []).forEach(function (l) { PORUSFM[l.usfm] = l; });
        }
        return PORUSFM[codigo] || null;
    }

    /** 'MAT 6.9-13' -> { livro, capitulo, de, ate, onde } */
    function alvoDe(ref) {
        var m = String(ref || '').match(/^(\S+) (\d+)\.(\d+)(?:-(\d+))?$/);
        if (!m) return null;
        var livro = porUsfm(m[1]);
        if (!livro) return null;
        var de = parseInt(m[3], 10);
        return {
            livro: livro, capitulo: parseInt(m[2], 10),
            de: de, ate: parseInt(m[4] || m[3], 10),
            onde: livro.nome + ' ' + m[2] + ':' + m[3] + (m[4] ? '-' + m[4] : '')
        };
    }

    /**
     * O texto de uma referência, lido do próprio app.
     *
     * Devolve { versiculos: [{ n, t }], edicao, reserva, alvo }. A reserva
     * é dita porque importa: se a edição carregada não tiver o livro, o
     * app cai na Almeida de 1911 e quem lê tem de saber em que texto está.
     */
    function texto(ref) {
        var alvo = alvoDe(ref);
        if (!alvo) return Promise.reject(new Error('referência inválida: ' + ref));
        return B.texto.capituloOuReserva(alvo.livro.nome, alvo.capitulo).then(function (r) {
            var vv = (r.versiculos || []).slice(alvo.de - 1, alvo.ate);
            return {
                alvo: alvo, edicao: r.edicao, reserva: r.reserva,
                versiculos: vv.map(function (t, i) { return { n: alvo.de + i, t: t }; })
            };
        });
    }

    /* ---------- o cartão de condução ---------- */

    function cartao() {
        var c = (B.store.get().config || {}).escolaCartao;
        return (c && c.length ? c : []).filter(function (ref) { return !!fraseDe(ref); });
    }

    function noCartao(ref) { return cartao().indexOf(ref) >= 0; }

    /**
     * Põe ou tira uma frase do cartão.
     *
     * Uma frase por movimento, e a nova troca a antiga: cartão com três
     * frases de adoração e nenhuma de intercessão não conduz nada. Quem
     * quiser mais, toca duas vezes e tem o cartão de cinco linhas que é
     * o que cabe num relance.
     */
    function trocarFrase(ref) {
        var f = fraseDe(ref);
        if (!f) return cartao();
        var atual = cartao();
        if (atual.indexOf(ref) >= 0) {
            atual = atual.filter(function (r) { return r !== ref; });
        } else {
            atual = atual.filter(function (r) {
                var o = fraseDe(r);
                return !o || o.movimento !== f.movimento;
            });
            atual.push(ref);
        }
        /* Na ordem dos movimentos, não na ordem dos toques. */
        var ordem = movimentos().map(function (m) { return m.id; });
        atual.sort(function (a, b) {
            return ordem.indexOf(fraseDe(a).movimento) - ordem.indexOf(fraseDe(b).movimento);
        });
        B.store.setConfig('escolaCartao', atual);
        return atual;
    }

    function limparCartao() { B.store.setConfig('escolaCartao', []); }

    /** O cartão pronto para a tela: frase, movimento e referência. */
    function cartaoPronto() {
        return cartao().map(function (ref) {
            var f = fraseDe(ref);
            var m = null;
            movimentos().forEach(function (x) { if (x.id === f.movimento) m = x; });
            return { ref: ref, onde: f.onde, movimento: m };
        });
    }

    /* ---------- decorar as frases ---------- */

    function hoje() { return new Date().toISOString().slice(0, 10); }

    function diasDepois(dia, n) {
        var d = new Date(dia + 'T12:00:00');
        d.setDate(d.getDate() + n);
        return d.toISOString().slice(0, 10);
    }

    function fila() {
        var f = (B.store.get().config || {}).escolaFila;
        return f && typeof f === 'object' ? f : {};
    }

    function salvarFila(f) { B.store.setConfig('escolaFila', f); }

    function naFila(ref) { return !!fila()[ref]; }

    function decorar(ref) {
        if (!fraseDe(ref)) return null;
        var f = fila();
        if (f[ref]) return f[ref];
        f[ref] = { passo: 0, quando: diasDepois(hoje(), PASSOS[0]) };
        salvarFila(f);
        return f[ref];
    }

    function esquecer(ref) {
        var f = fila();
        delete f[ref];
        salvarFila(f);
    }

    /** O que vence hoje — ou venceu antes e ficou para trás. */
    function paraHoje() {
        var f = fila();
        var h = hoje();
        var fora = [];
        Object.keys(f).forEach(function (ref) {
            var it = f[ref];
            var fr = fraseDe(ref);
            if (!it || !fr || !it.quando || it.quando > h) return;
            fora.push({
                ref: ref, onde: fr.onde, movimento: fr.movimento,
                passo: it.passo, atrasado: it.quando < h, quando: it.quando
            });
        });
        fora.sort(function (a, b) { return a.quando < b.quando ? -1 : 1; });
        return fora;
    }

    /**
     * Acertou: anda um passo. Errou: volta ao começo.
     *
     * Voltar ao começo é duro de propósito — frase que você não lembrou
     * hoje não está decorada, e dizer que está não ajudaria em nada na
     * hora de orar de pé.
     */
    function feito(ref, acertou) {
        var f = fila();
        var it = f[ref];
        if (!it) return null;
        it.passo = acertou ? Math.min(it.passo + 1, PASSOS.length - 1) : 0;
        it.quando = diasDepois(hoje(), PASSOS[it.passo]);
        if (acertou && it.passo >= PASSOS.length - 1 && !it.firme) it.firme = hoje();
        salvarFila(f);
        return it;
    }

    function resumo() {
        var f = fila();
        var refs = Object.keys(f);
        return {
            decorando: refs.length,
            firmes: refs.filter(function (r) { return f[r] && f[r].firme; }).length,
            hoje: paraHoje().length,
            oracoes: D.oracoes.length,
            frases: D.frases.length
        };
    }

    /* As orações são da Bíblia; o que é nosso é o recorte e a nota. */
    var CREDITO = 'Orações da própria Escritura. O texto vem da edição que você está ' +
        'lendo no app; o título e a nota de cada uma são deste app.';

    return {
        PASSOS: PASSOS, CREDITO: CREDITO,
        movimentos: movimentos, frases: frases, fraseDe: fraseDe,
        oracoes: oracoes, oracao: oracao, usos: usos, porUso: porUso,
        alvoDe: alvoDe, texto: texto,
        cartao: cartao, noCartao: noCartao, trocarFrase: trocarFrase,
        limparCartao: limparCartao, cartaoPronto: cartaoPronto,
        naFila: naFila, decorar: decorar, esquecer: esquecer,
        paraHoje: paraHoje, feito: feito, fila: fila, resumo: resumo
    };
})();
