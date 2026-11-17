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

    /* ---------- treinar uma oração de cor ---------- */

    /*
     * Quantos versículos entram no treino.
     *
     * Daniel 9 tem dezesseis: pôr dezesseis em ordem na tela de um
     * celular não é decorar, é rolar a tela. Seis é o que se consegue
     * guardar de uma vez e o que caberia numa oração pública.
     */
    var NO_TREINO = 6;

    /* As orações dos estudos entram no treino com esta marca no id: são
       de outra natureza (escritas por IA) e a tela tem de dizer isso. */
    var ESTUDO = 'estudo:';

    function ehDeEstudo(id) { return String(id || '').indexOf(ESTUDO) === 0; }

    /**
     * Parte a oração do estudo em frases.
     *
     * A oração bíblica já vem partida em versículos; a do estudo é prosa
     * corrida. Frase curta demais não é peça de treino — junta-se com a
     * seguinte, senão o jogo de pôr em ordem vira sorteio de "Amém".
     */
    function frasesDoTexto(t) {
        var fora = [];
        var atual = '';
        String(t || '').replace(/\s+/g, ' ').split(' ').forEach(function (p) {
            if (!p) return;
            atual += (atual ? ' ' : '') + p;
            if (/[.!?]["'\u201d\)\]]?$/.test(p) && atual.length >= 60) {
                fora.push(atual);
                atual = '';
            }
        });
        if (atual.trim()) {
            if (fora.length && atual.trim().length < 40) fora[fora.length - 1] += ' ' + atual.trim();
            else fora.push(atual.trim());
        }
        return fora;
    }

    function trechoTreino(id) {
        if (ehDeEstudo(id)) {
            var ref = String(id).slice(ESTUDO.length);
            if (!B.oracoes) return Promise.reject(new Error('sem o módulo das orações'));
            return B.oracoes.doCapitulo(ref).then(function (t) {
                if (!t) throw new Error('este capítulo ainda não tem oração');
                var frases = frasesDoTexto(t).slice(0, NO_TREINO);
                return {
                    oracao: {
                        id: id, titulo: 'Oração de ' + ref, onde: ref,
                        quem: 'Escrita por IA a partir do capítulo', ia: true
                    },
                    edicao: null, reserva: false,
                    versiculos: frases.map(function (f, i) { return { n: i + 1, t: f }; })
                };
            });
        }
        var o = oracao(id);
        if (!o) return Promise.reject(new Error('oração desconhecida: ' + id));
        return texto(o.ref).then(function (r) {
            return {
                oracao: o, edicao: r.edicao, reserva: r.reserva,
                versiculos: r.versiculos.slice(0, NO_TREINO)
            };
        });
    }

    function embaralhar(lista) {
        var a = lista.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    /* ---------- flash cards ----------

       Era um treino de sete exercícios; virou um baralho de cartas, a
       pedido de quem usa. Carta é o que serve para decorar sem ocupar a
       cabeça com regra de jogo: frente, verso, e você diz se lembrava.

       A fonte muda, o baralho não:

       - 'cartao'  — as frases que você escolheu em Montar a oração;
       - 'fila'    — as frases que vencem hoje;
       - 'estudos' — as orações dos estudos que você marcou;
       - um id     — uma oração da Bíblia ou de estudo, trecho a trecho.

       Cada carta leva a chave da fila a que pertence, e é por ela que o
       "lembrava / não lembrava" anda (ou volta) na revisão. */

    function cartaDaFrase(ref) {
        var f = fraseDe(ref);
        if (!f) return null;
        var m = null;
        movimentos().forEach(function (x) { if (x.id === f.movimento) m = x; });
        return texto(ref).then(function (r) {
            return {
                frente: m ? m.nome : 'Frase',
                onde: f.onde,
                verso: r.versiculos.map(function (v) { return v.t; }).join(' '),
                chave: ref, tipo: 'frase'
            };
        }, function () { return null; });
    }

    function cartasDaOracao(id) {
        return trechoTreino(id).then(function (t) {
            var total = t.versiculos.length;
            return {
                titulo: t.oracao.titulo, onde: t.oracao.onde, ia: !!t.oracao.ia,
                chave: id, tipo: 'oracao',
                cartas: t.versiculos.map(function (v, i) {
                    return {
                        /* A deixa: de onde é, na primeira; o fim do trecho
                           anterior nas outras, que é a deixa de verdade de
                           quem está orando. */
                        frente: i === 0
                            ? (t.oracao.ia ? 'Como começa' : t.oracao.onde)
                            : '…' + String(t.versiculos[i - 1].t).split(' ').slice(-5).join(' '),
                        onde: (t.oracao.ia ? 'Frase ' : 'Versículo ') + v.n +
                            ' de ' + total,
                        verso: v.t, chave: id, tipo: 'oracao'
                    };
                })
            };
        });
    }

    function baralho(fonte) {
        if (fonte === 'cartao' || fonte === 'fila') {
            var refs = fonte === 'cartao'
                ? cartao()
                : paraHoje().map(function (x) { return x.ref; });
            if (!refs.length) {
                return Promise.resolve({
                    titulo: fonte === 'cartao' ? 'O seu cartão' : 'Frases de hoje',
                    cartas: [], vazio: fonte
                });
            }
            return Promise.all(refs.map(cartaDaFrase)).then(function (cc) {
                return {
                    titulo: fonte === 'cartao' ? 'As frases do seu cartão' : 'Frases de hoje',
                    cartas: cc.filter(function (c) { return !!c; }),
                    tipo: 'frase'
                };
            });
        }

        if (fonte === 'estudos') {
            var escolhidas = estudosEscolhidos();
            if (!escolhidas.length) {
                return Promise.resolve({ titulo: 'Orações dos estudos', cartas: [], vazio: 'estudos' });
            }
            return Promise.all(escolhidas.map(function (ref) {
                return cartasDaOracao(ESTUDO + ref).catch(function () { return null; });
            })).then(function (todas) {
                var cartas = [];
                todas.forEach(function (b) { if (b) cartas = cartas.concat(b.cartas); });
                return {
                    titulo: escolhidas.length === 1
                        ? 'Oração de ' + escolhidas[0]
                        : escolhidas.length + ' orações dos estudos',
                    ia: true, cartas: cartas, tipo: 'oracao'
                };
            });
        }

        return cartasDaOracao(fonte);
    }

    /* ---------- quais orações de estudo entram ---------- */

    function estudosEscolhidos() {
        var e = (B.store.get().config || {}).escolaEstudos;
        return e && e.length ? e.slice() : [];
    }

    function escolherEstudo(ref) {
        var atual = estudosEscolhidos();
        var i = atual.indexOf(ref);
        if (i >= 0) atual.splice(i, 1); else atual.push(ref);
        B.store.setConfig('escolaEstudos', atual);
        return atual;
    }

    function estudoEscolhido(ref) { return estudosEscolhidos().indexOf(ref) >= 0; }

    /* ---------- a fila das orações ---------- */

    function filaOracoes() {
        var f = (B.store.get().config || {}).escolaOracoes;
        return f && typeof f === 'object' ? f : {};
    }

    function salvarFilaOracoes(f) { B.store.setConfig('escolaOracoes', f); }

    function naFilaOracao(id) { return !!filaOracoes()[id]; }

    function decorarOracao(id) {
        if (!oracao(id) && !ehDeEstudo(id)) return null;
        var f = filaOracoes();
        if (f[id]) return f[id];
        f[id] = { passo: 0, quando: diasDepois(hoje(), PASSOS[0]) };
        salvarFilaOracoes(f);
        return f[id];
    }

    function esquecerOracao(id) {
        var f = filaOracoes();
        delete f[id];
        salvarFilaOracoes(f);
    }

    function oracoesParaHoje() {
        var f = filaOracoes();
        var h = hoje();
        var fora = [];
        Object.keys(f).forEach(function (id) {
            var it = f[id];
            if (!it || !it.quando || it.quando > h) return;
            var o = oracao(id);
            if (!o && !ehDeEstudo(id)) return;        // id estragado: ignora
            var ref = ehDeEstudo(id) ? String(id).slice(ESTUDO.length) : null;
            fora.push({
                id: id,
                titulo: o ? o.titulo : 'Oração de ' + ref,
                onde: o ? o.onde : ref + ' · escrita por IA',
                ia: !o,
                passo: it.passo, atrasado: it.quando < h, quando: it.quando
            });
        });
        fora.sort(function (a, b) { return a.quando < b.quando ? -1 : 1; });
        return fora;
    }

    /**
     * Qual oração treinar agora.
     *
     * Antes aqui havia um botão fixo no Pai Nosso, o que é um conselho
     * ruim depois da primeira semana: quem já treinou o Pai Nosso
     * precisa da próxima, não dele de novo. A ordem é:
     *
     * 1. a que vence hoje (a revisão vem antes de material novo);
     * 2. uma que ainda não está em treino — as curtas primeiro, porque
     *    decorar começa pelo que cabe na boca, e girando pelo dia para
     *    não cair sempre na mesma;
     * 3. se todas já estão em treino, a que volta antes.
     */
    function sugestaoTreino() {
        var vencendo = oracoesParaHoje();
        if (vencendo.length) {
            return { id: vencendo[0].id, titulo: vencendo[0].titulo, motivo: 'vence hoje' };
        }

        var f = filaOracoes();
        var novas = D.oracoes.filter(function (o) { return !f[o.id]; });
        if (novas.length) {
            novas.sort(function (a, b) { return tamanho(a) - tamanho(b); });
            var perto = novas.slice(0, 12);
            var dia = parseInt(hoje().replace(/-/g, ''), 10) || 0;
            var escolhida = perto[dia % perto.length];
            return { id: escolhida.id, titulo: escolhida.titulo, motivo: 'ainda não treinada' };
        }

        var ids = Object.keys(f);
        if (!ids.length) return null;
        ids.sort(function (a, b) { return (f[a].quando || '') < (f[b].quando || '') ? -1 : 1; });
        var o = oracao(ids[0]);
        return {
            id: ids[0],
            titulo: o ? o.titulo : 'Oração de ' + String(ids[0]).slice(ESTUDO.length),
            motivo: 'volta em ' + (f[ids[0]].quando || '').split('-').reverse().join('/')
        };
    }

    /* Quantos versículos tem a oração — serve para começar pelas curtas. */
    function tamanho(o) {
        var a = alvoDe(o.ref);
        return a ? (a.ate - a.de + 1) : 99;
    }

    /** Quando a próxima volta, para a tela não ficar muda entre revisões. */
    function proximaVolta() {
        var f = filaOracoes();
        var quandos = Object.keys(f).map(function (id) { return f[id].quando; })
            .filter(function (q) { return !!q; }).sort();
        return quandos.length ? quandos[0] : null;
    }

    function feitoOracao(id, acertou) {
        /* Treinar uma oração que não estava na fila a põe nela: é o
           caminho normal, porque o treino vem antes da fila. */
        if (!filaOracoes()[id] && !decorarOracao(id)) return null;
        var f = filaOracoes();
        var it = f[id];                 // o mesmo objeto que vai ser salvo
        if (!it) return null;
        it.passo = acertou ? Math.min(it.passo + 1, PASSOS.length - 1) : 0;
        it.quando = diasDepois(hoje(), PASSOS[it.passo]);
        if (acertou && it.passo >= PASSOS.length - 1 && !it.firme) it.firme = hoje();
        salvarFilaOracoes(f);
        return it;
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
        var fo = filaOracoes();
        var ids = Object.keys(fo);
        return {
            decorando: refs.length,
            firmes: refs.filter(function (r) { return f[r] && f[r].firme; }).length,
            hoje: paraHoje().length,
            treinando: ids.length,
            treinoFirmes: ids.filter(function (i) { return fo[i] && fo[i].firme; }).length,
            treinoHoje: oracoesParaHoje().length,
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
        paraHoje: paraHoje, feito: feito, fila: fila, resumo: resumo,
        NO_TREINO: NO_TREINO, ESTUDO: ESTUDO, ehDeEstudo: ehDeEstudo,
        frasesDoTexto: frasesDoTexto, trechoTreino: trechoTreino,
        baralho: baralho, embaralhar: embaralhar,
        estudosEscolhidos: estudosEscolhidos, escolherEstudo: escolherEstudo,
        estudoEscolhido: estudoEscolhido,
        filaOracoes: filaOracoes, naFilaOracao: naFilaOracao,
        decorarOracao: decorarOracao, esquecerOracao: esquecerOracao,
        oracoesParaHoje: oracoesParaHoje, feitoOracao: feitoOracao,
        sugestaoTreino: sugestaoTreino, proximaVolta: proximaVolta
    };
})();
