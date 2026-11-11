/* =========================================================
   JOGOS DE MEMORIZAÇÃO — o acervo e o placar.

   O conteúdo vem de data/jogos.js, gerado por
   ferramentas/gerar-jogos.py: cada item carrega a referência de onde
   ele saiu, e o gerador só deixa passar o item cuja palavra-chave
   aparece mesmo naquele versículo, nas duas edições que o app tem. Por
   isso aqui não se inventa nada — só se embaralha.

   O placar fica na config do app (B.store), e não num canto só deste
   aparelho: assim ele vai no backup e volta junto com a leitura quando
   o app é reinstalado.
   ========================================================= */
window.B = window.B || {};

B.jogos = (function () {
    'use strict';

    var DADOS = (B.jogosDados && B.jogosDados.baralhos) || [];

    /* ---------- o acervo ---------- */

    function baralhos() { return DADOS; }

    function porId(id) {
        for (var i = 0; i < DADOS.length; i++) {
            if (DADOS[i].id === id) return DADOS[i];
        }
        return null;
    }

    /* Agrupa na ordem em que os temas aparecem no arquivo: a fonte está
       em ordem bíblica, e essa é a ordem útil para quem vai decorar. */
    function temas() {
        var ordem = [], mapa = {};
        DADOS.forEach(function (b) {
            if (!mapa[b.tema]) { mapa[b.tema] = []; ordem.push(b.tema); }
            mapa[b.tema].push(b);
        });
        return ordem.map(function (t) { return { tema: t, baralhos: mapa[t] }; });
    }

    function totalItens() {
        return DADOS.reduce(function (n, b) { return n + b.itens.length; }, 0);
    }

    /* ---------- os modos ---------- */

    /**
     * Que modos um baralho aceita.
     *
     * Todo baralho aceita o relâmpago (pergunta e quatro alternativas);
     * o modo próprio depende do que o baralho é: sequência se a ordem
     * importa, pares se o que importa é ligar uma coisa à outra.
     */
    function modos(baralho) {
        var lista = [];
        if (baralho.jogo === 'ordem') {
            lista.push({ id: 'ordem', nome: 'Pôr em ordem',
                dica: 'Toque na ordem certa, do primeiro ao último.' });
        } else {
            lista.push({ id: 'pares', nome: 'Ligar os pares',
                dica: 'Toque num item e depois na descrição que combina.' });
        }
        if (baralho.itens.length >= 3) {
            lista.push({ id: 'relampago', nome: 'Relâmpago',
                dica: 'A descrição aparece, você escolhe de quem é.' });
        }
        return lista;
    }

    function modoValido(baralho, modo) {
        return modos(baralho).some(function (m) { return m.id === modo; });
    }

    /* ---------- embaralhar ---------- */

    function embaralhar(lista) {
        var a = lista.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    /**
     * Uma rodada de relâmpago: cada item vira uma pergunta com até
     * quatro alternativas, tiradas do próprio baralho — erro de verdade,
     * não alternativa absurda que se descarta sem saber a matéria.
     */
    function relampago(baralho) {
        var itens = baralho.itens;
        return embaralhar(itens.map(function (it, i) { return i; })).map(function (i) {
            var certo = itens[i];
            var outros = embaralhar(itens.filter(function (_, n) { return n !== i; }))
                .slice(0, 3);
            var opcoes = embaralhar(outros.concat([certo]));
            return {
                pergunta: certo.b,
                opcoes: opcoes.map(function (o) { return o.a; }),
                certa: opcoes.indexOf(certo),
                item: certo
            };
        });
    }

    /* Pares em mesas pequenas: vinte e duas pedras numa tela de celular
       viram rolagem, e rolagem no meio do jogo faz perder o fio. */
    function mesas(baralho, tamanho) {
        var t = tamanho || 4;
        var itens = embaralhar(baralho.itens);
        var fora = [];
        for (var i = 0; i < itens.length; i += t) fora.push(itens.slice(i, i + t));
        /* Uma mesa de um par só não é jogo: junta com a anterior. */
        if (fora.length > 1 && fora[fora.length - 1].length === 1) {
            fora[fora.length - 2] = fora[fora.length - 2].concat(fora.pop());
        }
        return fora;
    }

    /* ---------- o placar ---------- */

    function tudo() {
        var cfg = (B.store.get() || {}).config || {};
        return cfg.jogos || {};
    }

    function doBaralho(id) { return tudo()[id] || null; }

    /**
     * Guarda o resultado de uma rodada.
     *
     * Fica o melhor resultado e a última vez — não um histórico: o que
     * importa é "já sei isto de cor?", e para isso basta saber se algum
     * dia saiu tudo certo.
     */
    function guardar(id, modo, acertos, total) {
        var mapa = tudo();
        var r = mapa[id] || { rodadas: 0, melhor: 0, total: total, modos: {} };
        r.rodadas = (r.rodadas || 0) + 1;
        r.total = total;
        if (acertos > (r.melhor || 0)) r.melhor = acertos;
        r.modos = r.modos || {};
        if (acertos >= total) r.modos[modo] = true;   // modo vencido sem erro
        r.quando = B.store.hojeISO();
        mapa[id] = r;
        B.store.setConfig('jogos', mapa);
        return r;
    }

    function decorado(id) {
        var r = doBaralho(id);
        return !!(r && r.total && r.melhor >= r.total);
    }

    /* Quantos baralhos já saíram inteiros, para a tela de Estudo poder
       dizer "12 de 57" sem abrir o acervo. */
    function resumo() {
        var n = 0;
        DADOS.forEach(function (b) { if (decorado(b.id)) n++; });
        return { baralhos: DADOS.length, decorados: n, itens: totalItens() };
    }

    function zerar(id) {
        var mapa = tudo();
        if (id) delete mapa[id]; else mapa = {};
        B.store.setConfig('jogos', mapa);
    }

    return {
        baralhos: baralhos, porId: porId, temas: temas, totalItens: totalItens,
        modos: modos, modoValido: modoValido,
        embaralhar: embaralhar, relampago: relampago, mesas: mesas,
        doBaralho: doBaralho, guardar: guardar, decorado: decorado,
        resumo: resumo, zerar: zerar
    };
})();
