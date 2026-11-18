/* =========================================================
   AS ORAÇÕES DOS ESTUDOS, PARA ORAR.

   Todo estudo completo termina com uma oração escrita a partir do
   capítulo. Ela estava enterrada no fim de um texto de vinte mil
   caracteres — boa para ler uma vez, inútil para a vida devocional,
   que é outra coisa: voltar amanhã, e no mês que vem, e levar a mesma
   oração para o dia.

   Este módulo não gera nada. Ele tira a oração de dentro do estudo que
   já existe, guarda quais são suas e anota o dia em que você orou. O
   resto é tela.

   Duas regras que o módulo carrega:

   - a oração é dita como é: escrita por IA a partir do capítulo. Quem
     ora tem direito de saber de onde vem a palavra que está orando;
   - o app não anota se você orou. Guardar uma oração é escolha sua e
     serve para achá-la de novo; contar orações seria transformar a vida
     devocional em placar, e o app já tem jogos onde placar cabe.
   ========================================================= */
window.B = window.B || {};

B.oracoes = (function () {
    'use strict';

    var cache = {};      // 'João 3' -> texto da oração, ou false quando não há

    /**
     * Tira a seção "Oração" do texto do estudo.
     *
     * O título vem como "### Oração" ou "## Oração", às vezes com algo
     * depois no mesmo cabeçalho, e termina no próximo cabeçalho — ou no
     * fim do texto, que é o caso mais comum, porque a oração fecha o
     * estudo.
     */
    function extrair(texto) {
        var t = String(texto || '');
        /* Sem a bandeira /m de propósito: com ela, o "$" do fim casaria
           no fim de qualquer linha, e a oração sairia vazia. */
        var m = t.match(/(?:^|\n)#{2,4}[ \t]*Ora[çc][ãa]o[^\n]*\n([\s\S]*?)(?=\n#{2,4}[ \t]|$)/);
        if (!m) return null;
        var corpo = m[1]
            .replace(/^\s*>\s?/gm, '')       // citação vira texto corrido
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .trim();
        return corpo.length > 40 ? corpo : null;
    }

    /** A oração de um capítulo, do estudo completo dele. */
    function doCapitulo(ref) {
        if (ref in cache) return Promise.resolve(cache[ref] || null);
        return B.estudos.obter(ref, 'completo').then(function (e) {
            var o = e ? extrair(e.texto) : null;
            cache[ref] = o || false;
            return o;
        }, function () { return null; });
    }

    /** Tem estudo completo? (não garante oração — isso só o texto diz) */
    function temEstudo(ref) {
        return B.estudos.obter(ref, 'completo').then(function (e) { return !!e; },
            function () { return false; });
    }

    /* ---------- o que é seu ---------- */

    function estado() {
        var cfg = (B.store.get() || {}).config || {};
        var o = cfg.oracoes || {};
        if (!o.guardadas) o.guardadas = [];
        return o;
    }

    function salvar(o) { B.store.setConfig('oracoes', o); }

    function guardadas() { return estado().guardadas.slice(); }

    function estaGuardada(ref) { return estado().guardadas.indexOf(ref) >= 0; }

    function guardar(ref) {
        var o = estado();
        var i = o.guardadas.indexOf(ref);
        if (i >= 0) o.guardadas.splice(i, 1); else o.guardadas.unshift(ref);
        salvar(o);
        return i < 0;        // true: acabou de entrar
    }


    function resumo() { return { guardadas: estado().guardadas.length }; }

    /* ---------- busca por assunto ----------

       Procurar "perdão" varrendo os estudos seria abrir os 66 arquivos
       e ler 24 MB para mostrar dez linhas. Por isso há um índice
       pronto (data/oracoes-indice.json, feito por
       ferramentas/gerar-oracoes-indice.py): que palavra está em que
       oração, e o começo de cada uma para a lista.

       Ele é buscado só quando alguém procura — no arranque do app não
       custa nada. E as orações que chegaram depois, nos pacotes, são
       varridas do aparelho e entram na mesma busca: o índice cobre o
       que vem no app, não o que você trouxe. */

    var indice = null;          // o que vem no app
    var pedido = null;
    var seus = null;            // o que você importou, varrido uma vez

    function semAcento(t) {
        t = String(t || '').toLowerCase();
        if (t.normalize) {
            t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }
        return t.replace(/[^a-z0-9 ]/g, ' ');
    }

    /*
     * A raiz da palavra procurada.
     *
     * Em português a mesma ideia muda de forma no meio: quem escreve
     * "perdão" quer achar "perdoa", "perdoaste" e "perdoar", e nenhuma
     * delas começa com "perdao". Então a terminação cai antes de
     * procurar — "perdão" vira "perd", que acha todas.
     *
     * Podar demais traz palavra de outro sentido ("perder"), e isso é
     * preferível ao contrário: numa busca, sobra se descarta com o
     * olho; falta não se descobre.
     */
    var FINAIS = ['mente', 'coes', 'cao', 'oes', 'ndo', 'ram', 'mos', 'ste',
        'sse', 'ais', 'eis', 'ao', 'ar', 'er', 'ir', 'as', 'es', 'os', 's'];

    function raiz(p) {
        for (var i = 0; i < FINAIS.length; i++) {
            var f = FINAIS[i];
            if (p.length - f.length >= 4 && p.slice(-f.length) === f) {
                return p.slice(0, p.length - f.length);
            }
        }
        return p;
    }

    function carregarIndice() {
        if (indice) return Promise.resolve(indice);
        if (pedido) return pedido;
        pedido = fetch('data/oracoes-indice.json').then(function (r) {
            if (!r.ok) throw new Error('índice indisponível');
            return r.json();
        }).then(function (d) {
            indice = d;
            return d;
        }, function () {
            pedido = null;
            indice = { refs: [], trechos: [], palavras: {}, assuntos: [] };
            return indice;
        });
        return pedido;
    }

    /* As orações que não vêm no app: as dos estudos que você importou. */
    function carregarSeus() {
        if (seus) return Promise.resolve(seus);
        var fora = [];
        if (!B.estudos || !B.estudos.percorrer) {
            seus = fora;
            return Promise.resolve(fora);
        }
        return B.estudos.percorrer(function (e) {
            if (!e || (e.formato && e.formato !== 'completo')) return;
            var o = extrair(e.texto || '');
            if (!o) return;
            fora.push({
                ref: (e.titulo || '').trim(),
                trecho: o.replace(/\s+/g, ' ').slice(0, 110),
                termos: semAcento(o)
            });
        }).then(function () { seus = fora; return fora; },
            function () { seus = fora; return fora; });
    }

    function assuntos() {
        return carregarIndice().then(function (d) { return (d.assuntos || []).slice(); });
    }

    /**
     * Procura nas orações. Devolve [{ ref, trecho, seu }].
     *
     * Por palavra: casa pelo começo dela, para "perdo" achar "perdoa" e
     * "perdoaste". Por assunto: usa as raízes daquele rótulo. Duas
     * palavras juntas pedem as duas, que é o que se espera de uma busca.
     */
    function buscar(texto, assunto) {
        return Promise.all([carregarIndice(), carregarSeus()]).then(function (dois) {
            var d = dois[0], meus = dois[1];
            var raizes = [];
            if (assunto) {
                (d.assuntos || []).forEach(function (a) {
                    if (a.id === assunto) raizes = a.raizes.slice();
                });
                if (!raizes.length) return [];
            }

            var pedacos = semAcento(texto).split(' ')
                .filter(function (p) { return p.length >= 3; })
                .map(raiz);
            if (!assunto && !pedacos.length) return [];

            /* No índice: interseção dos conjuntos de cada palavra. */
            var conjunto = null;
            function somar(prefixos, exigir) {
                var achados = {};
                Object.keys(d.palavras || {}).forEach(function (t) {
                    for (var i = 0; i < prefixos.length; i++) {
                        if (t.indexOf(prefixos[i]) === 0) {
                            d.palavras[t].forEach(function (n) { achados[n] = true; });
                            return;
                        }
                    }
                });
                if (!exigir || conjunto === null) {
                    conjunto = conjunto === null ? achados
                        : (function () {
                            Object.keys(achados).forEach(function (k) { conjunto[k] = true; });
                            return conjunto;
                        })();
                    return;
                }
                Object.keys(conjunto).forEach(function (k) {
                    if (!achados[k]) delete conjunto[k];
                });
            }

            if (assunto) somar(raizes, false);
            pedacos.forEach(function (p) { somar([p], true); });

            var fora = [];
            Object.keys(conjunto || {}).forEach(function (i) {
                fora.push({ ref: d.refs[i], trecho: d.trechos[i], seu: false });
            });

            /* E nas suas, que o índice não conhece. */
            var jaTem = {};
            fora.forEach(function (x) { jaTem[x.ref] = true; });
            meus.forEach(function (o) {
                if (jaTem[o.ref]) return;
                var casa = assunto
                    ? raizes.some(function (r) { return o.termos.indexOf(r) >= 0; })
                    : true;
                if (casa) {
                    casa = pedacos.every(function (p) { return o.termos.indexOf(p) >= 0; });
                }
                if (casa) fora.push({ ref: o.ref, trecho: o.trecho, seu: true });
            });

            /* Na ordem da Bíblia, não na do alfabeto: quem procura
               "medo" espera Gênesis antes de 1 Coríntios. */
            fora.forEach(function (x) {
                var alvo = B.biblia.interpretar(x.ref);
                x.ordem = alvo && alvo.livro
                    ? alvo.livro.ordem * 1000 + (alvo.capitulo || 0)
                    : 999999;
            });
            fora.sort(function (a, b) { return a.ordem - b.ordem; });
            return fora;
        });
    }

    function quantas() {
        return carregarIndice().then(function (d) { return (d.refs || []).length; });
    }

    var AVISO = 'Oração escrita por IA a partir do capítulo, como o resto do estudo.';

    return {
        extrair: extrair, doCapitulo: doCapitulo, temEstudo: temEstudo,
        guardadas: guardadas, estaGuardada: estaGuardada, guardar: guardar,
        resumo: resumo, AVISO: AVISO,
        buscar: buscar, assuntos: assuntos, quantas: quantas
    };
})();
