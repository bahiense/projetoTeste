/* =========================================================
   Texto — o pouco de processamento de linguagem que o app faz.

   O reconhecimento de fala devolve um bloco quase sem pontuação.
   Tudo aqui parte disso: normalizar, contar, achar raízes e cortar
   em trechos com um critério que funcione mesmo sem vírgula.
   ========================================================= */
window.A = window.A || {};

A.texto = (function () {
    'use strict';

    /* minúsculas, sem acento, sem pontuação dupla — a forma em que
       todos os léxicos foram escritos. */
    function normalizar(s) {
        return String(s || '')
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function palavras(s) {
        var n = normalizar(s);
        return n ? n.split(' ') : [];
    }

    function contarPalavras(s) { return palavras(s).length; }

    /* Casa por começo de palavra: "sabedoria" acha "sabedoria",
       "sabedorias"; "cansad" acha "cansado", "cansada", "cansados".

       Raiz curta é exigida inteira. Sem isso, "fé" casaria com "feliz" e
       "fevereiro", "pai" com "país" e "ele" com "elevamos" — e a medida
       viraria ruído. */
    function casa(token, raiz) {
        return raiz.length <= 3 ? token === raiz : token.indexOf(raiz) === 0;
    }

    function temRaiz(tokens, raiz) {
        for (var i = 0; i < tokens.length; i++) {
            if (casa(tokens[i], raiz)) return true;
        }
        return false;
    }

    function contarRaiz(tokens, raiz) {
        var n = 0;
        for (var i = 0; i < tokens.length; i++) if (casa(tokens[i], raiz)) n++;
        return n;
    }

    function contarFrase(normalizado, frase) {
        if (!frase) return 0;
        var n = 0, i = 0;
        while ((i = normalizado.indexOf(frase, i)) >= 0) { n++; i += frase.length; }
        return n;
    }

    /* Quantas pistas de um léxico apareceram, e quais. */
    function pistas(normalizado, tokens, lex) {
        var achadas = [], total = 0, i;
        var raizes = lex.raiz || [];
        for (i = 0; i < raizes.length; i++) {
            var c = contarRaiz(tokens, raizes[i]);
            if (c) { total += c; achadas.push(raizes[i]); }
        }
        var frases = lex.frase || [];
        for (i = 0; i < frases.length; i++) {
            var f = contarFrase(normalizado, frases[i]);
            if (f) { total += f; achadas.push(frases[i]); }
        }
        return { total: total, achadas: achadas };
    }

    /* Primeira e última posição (em palavras) em que um léxico aparece.
       É com isso que dá para dizer se a oração *andou* de um assunto para
       o outro: se a necessidade só aparece antes da fé, não houve
       movimento de necessidade para fé — houve o contrário. */
    function extremos(tokens, normalizado, lex) {
        var primeira = null, ultima = null, i, j;
        var raizes = lex.raiz || [];
        for (i = 0; i < tokens.length; i++) {
            for (j = 0; j < raizes.length; j++) {
                if (casa(tokens[i], raizes[j])) {
                    if (primeira === null) primeira = i;
                    ultima = i;
                    break;
                }
            }
        }
        var frases = lex.frase || [];
        for (j = 0; j < frases.length; j++) {
            var p = normalizado.indexOf(frases[j]);
            while (p >= 0) {
                var idx = normalizado.slice(0, p).split(' ').length - 1;
                if (primeira === null || idx < primeira) primeira = idx;
                if (ultima === null || idx > ultima) ultima = idx;
                p = normalizado.indexOf(frases[j], p + frases[j].length);
            }
        }
        return { primeira: primeira, ultima: ultima, achou: primeira !== null };
    }

    function primeiraOcorrencia(tokens, normalizado, lex) {
        var e = extremos(tokens, normalizado, lex);
        if (!e.achou) return null;
        return tokens.length ? e.primeira / tokens.length : 0;
    }

    /* Corta em trechos. Usa a pontuação quando ela existe e, quando não
       existe, os conectivos que quase sempre iniciam uma nova ideia numa
       oração falada. */
    var CORTES = /\b(e entao|entao|por isso|diante disso|tambem|mas|porque|para que|que tu|senhor|pai|deus)\b/g;

    function trechos(s) {
        var bruto = String(s || '').split(/[.!?;]+/);
        var saida = [];
        bruto.forEach(function (b) {
            var n = normalizar(b);
            if (!n) return;
            if (n.split(' ').length <= 14) { saida.push(n); return; }
            // trecho longo demais para ser uma ideia só: corta nos conectivos
            var partes = n.replace(CORTES, '\n$1').split('\n');
            partes.forEach(function (p) { if (p.trim()) saida.push(p.trim()); });
        });
        return saida;
    }

    /* Repetição real: trigramas que voltam. Dizer a mesma coisa com
       palavras diferentes é o que o Módulo 4 chama de circular. */
    function repeticao(tokens) {
        if (tokens.length < 12) return { taxa: 0, exemplos: [] };
        var vistos = {}, repetidos = {}, i;
        for (i = 0; i + 2 < tokens.length; i++) {
            var g = tokens[i] + ' ' + tokens[i + 1] + ' ' + tokens[i + 2];
            if (vistos[g]) repetidos[g] = (repetidos[g] || 1) + 1;
            vistos[g] = true;
        }
        var lista = Object.keys(repetidos).sort(function (a, b) { return repetidos[b] - repetidos[a]; });
        var total = 0;
        lista.forEach(function (g) { total += repetidos[g]; });
        return {
            taxa: Math.min(1, total / Math.max(1, tokens.length - 2)),
            exemplos: lista.slice(0, 3).map(function (g) { return { trecho: g, n: repetidos[g] }; })
        };
    }

    /* Palavras que o aluno mais repetiu, ignorando as de ligação.
       Alimenta a sugestão vinda do Dicionário. */
    var VAZIAS = ('a o e de da do das dos que em no na nos nas um uma uns umas para por com ' +
        'te tu teu tua teus tuas nos nosso nossa nossos nossas se ao aos as os eu meu minha ' +
        'ele ela eles elas esta este isso aquilo mais muito ja nao sim como quando onde ' +
        'porque tambem so tudo todo toda todos todas seu sua ser esta estao sao foi era ' +
        'ha tem temos vai vou pode podem esse essa hoje aqui').split(' ');

    function frequentes(tokens, minimo) {
        var conta = {}, i;
        for (i = 0; i < tokens.length; i++) {
            var t = tokens[i];
            if (t.length < 4 || VAZIAS.indexOf(t) >= 0) continue;
            conta[t] = (conta[t] || 0) + 1;
        }
        return Object.keys(conta)
            .filter(function (k) { return conta[k] >= (minimo || 3); })
            .sort(function (a, b) { return conta[b] - conta[a]; })
            .map(function (k) { return { palavra: k, n: conta[k] }; });
    }

    return {
        casa: casa,
        normalizar: normalizar,
        palavras: palavras,
        contarPalavras: contarPalavras,
        temRaiz: temRaiz,
        contarRaiz: contarRaiz,
        contarFrase: contarFrase,
        pistas: pistas,
        extremos: extremos,
        primeiraOcorrencia: primeiraOcorrencia,
        trechos: trechos,
        repeticao: repeticao,
        frequentes: frequentes
    };
})();
