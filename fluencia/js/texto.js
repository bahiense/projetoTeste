/* =========================================================
   Comparação de texto — é o que permite corrigir o aluno.

   Serve para três coisas: nota do ditado, nota da pronúncia
   (comparando com o que o reconhecimento de voz entendeu) e
   diagnóstico do erro típico de brasileiro por trás da palavra
   que saiu errada.
   ========================================================= */
window.F = window.F || {};

F.texto = (function () {
    'use strict';

    var CONTRACOES = {
        "i'm": 'i am', "im": 'i am', "you're": 'you are', "we're": 'we are', "they're": 'they are',
        "he's": 'he is', "she's": 'she is', "it's": 'it is', "that's": 'that is', "there's": 'there is',
        "what's": 'what is', "who's": 'who is', "let's": 'let us', "here's": 'here is',
        "don't": 'do not', "doesn't": 'does not', "didn't": 'did not', "isn't": 'is not',
        "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not', "can't": 'can not',
        "cannot": 'can not', "couldn't": 'could not', "won't": 'will not', "wouldn't": 'would not',
        "shouldn't": 'should not', "haven't": 'have not', "hasn't": 'has not', "hadn't": 'had not',
        "i've": 'i have', "you've": 'you have', "we've": 'we have', "they've": 'they have',
        "i'd": 'i would', "you'd": 'you would', "he'd": 'he would', "she'd": 'she would',
        "we'd": 'we would', "they'd": 'they would',
        "i'll": 'i will', "you'll": 'you will', "he'll": 'he will', "she'll": 'she will',
        "we'll": 'we will', "they'll": 'they will', "it'll": 'it will',
        "gonna": 'going to', "wanna": 'want to', "gotta": 'got to', "kinda": 'kind of',
        "hafta": 'have to', "lemme": 'let me', "gimme": 'give me', "cause": 'because',
        "ok": 'okay', "alright": 'all right'
    };

    function normalizar(s) {
        if (!s) return '';
        s = String(s).toLowerCase();
        s = s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
        s = s.replace(/[^a-z0-9'\s-]/g, ' ');
        s = s.replace(/\s+/g, ' ').trim();
        var saida = [];
        var partes = s.split(' ');
        for (var i = 0; i < partes.length; i++) {
            var p = partes[i].replace(/^-+|-+$/g, '');
            if (!p) continue;
            if (CONTRACOES[p]) saida = saida.concat(CONTRACOES[p].split(' '));
            else saida.push(p.replace(/'/g, ''));
        }
        return saida.join(' ');
    }

    function palavras(s) {
        var n = normalizar(s);
        return n ? n.split(' ') : [];
    }

    /* Alinhamento de Levenshtein no nível da palavra, com rastro.
       Devolve a lista de operações para mostrar o diff. */
    function alinhar(ref, hip) {
        var a = palavras(ref), b = palavras(hip);
        var m = a.length, n = b.length;
        var d = [], i, j;
        for (i = 0; i <= m; i++) { d[i] = [i]; }
        for (j = 0; j <= n; j++) { d[0][j] = j; }
        for (i = 1; i <= m; i++) {
            for (j = 1; j <= n; j++) {
                var custo = a[i - 1] === b[j - 1] ? 0 : 1;
                d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + custo);
            }
        }
        var ops = [];
        i = m; j = n;
        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) {
                ops.unshift(a[i - 1] === b[j - 1]
                    ? { op: 'ok', ref: a[i - 1], hip: b[j - 1] }
                    : { op: 'troca', ref: a[i - 1], hip: b[j - 1] });
                i--; j--;
            } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
                ops.unshift({ op: 'faltou', ref: a[i - 1], hip: '' });
                i--;
            } else {
                ops.unshift({ op: 'sobrou', ref: '', hip: b[j - 1] });
                j--;
            }
        }
        return { ops: ops, ref: a, hip: b, distancia: d[m][n] };
    }

    /* Nota de 0 a 100 comparando o que era para falar com o que foi ouvido. */
    function pontuar(ref, hip) {
        var r = alinhar(ref, hip);
        var acertos = 0;
        for (var i = 0; i < r.ops.length; i++) if (r.ops[i].op === 'ok') acertos++;
        var total = r.ref.length || 1;
        var pct = Math.max(0, Math.round((acertos / total) * 100));
        // penaliza palavra inventada, mas de leve: quem fala demais não deve zerar
        var sobras = r.ops.filter(function (o) { return o.op === 'sobrou'; }).length;
        pct = Math.max(0, pct - Math.min(15, sobras * 3));
        r.acertos = acertos;
        r.total = total;
        r.pct = pct;
        return r;
    }

    /* ---------------------------------------------------------
       Diagnóstico: por que essa palavra saiu errada?
       Heurística baseada nos erros clássicos do falante de
       português. Não é fonética de laboratório — é o palpite
       que um professor daria olhando o par (esperado, ouvido).
       --------------------------------------------------------- */
    var REGRAS = [
        {
            id: 'th-surdo',
            teste: function (r, h) { return /th/.test(r) && /^[stf]/.test(h) && r[0] === 't'; },
            dica: 'O TH virou S/T/F. Ponha a ponta da língua entre os dentes e sopre.'
        },
        {
            id: 'th-sonoro',
            teste: function (r, h) { return /^th/.test(r) && /^[dz]/.test(h); },
            dica: 'O TH sonoro virou D ou Z. Língua entre os dentes, com a voz ligada.'
        },
        {
            id: 'epentese',
            teste: function (r, h) { return h.length > r.length && h.indexOf(r) === 0 && /[ie]$/.test(h); },
            dica: 'Você colou uma vogal no fim da palavra. Termine na consoante e pare.'
        },
        {
            id: 'cluster-s',
            teste: function (r, h) { return /^s[ptkclmnw]/.test(r) && /^e?s/.test(h) && h.length > r.length; },
            dica: 'Entrou um "e" antes do S. Comece pelo próprio S, segurando o som.'
        },
        {
            id: 'i-longo-curto',
            teste: function (r, h) {
                return r !== h && r.replace(/ee|ea|i/g, 'I') === h.replace(/ee|ea|i/g, 'I');
            },
            dica: 'Confusão entre /ɪ/ curto e /iː/ longo (ship × sheep). São vogais diferentes, não a mesma mais rápida.'
        },
        {
            id: 'h-r',
            teste: function (r, h) { return (/^h/.test(r) && /^r/.test(h)) || (/^r/.test(r) && /^h/.test(h)); },
            dica: 'H e R trocados. O H é só ar soprado; o R americano não vibra nunca.'
        },
        {
            id: 'v-w',
            teste: function (r, h) { return (/^v/.test(r) && /^w/.test(h)) || (/^w/.test(r) && /^v/.test(h)); },
            dica: 'V e W trocados. V morde o lábio; W faz bico, sem tocar nos dentes.'
        },
        {
            id: 'ed',
            teste: function (r, h) { return /ed$/.test(r) && (h === r.replace(/ed$/, '') || h === r.replace(/ed$/, 'id')); },
            dica: 'O -ed saiu errado. Só depois de T ou D ele vira sílaba nova.'
        },
        {
            id: 's-final',
            teste: function (r, h) { return /s$/.test(r) && h === r.replace(/s$/, ''); },
            dica: 'Você comeu o -s final. Ele carrega plural, terceira pessoa ou posse.'
        },
        {
            id: 'l-final',
            teste: function (r, h) { return /l$/.test(r) && /[uw]$/.test(h); },
            dica: 'O L final virou U. A ponta da língua tem que encostar atrás dos dentes de cima.'
        }
    ];

    function diagnosticar(ref, hip) {
        if (!ref || !hip || ref === hip) return null;
        for (var i = 0; i < REGRAS.length; i++) {
            try { if (REGRAS[i].teste(ref, hip)) return REGRAS[i]; } catch (e) { }
        }
        return null;
    }

    /* Junta os diagnósticos de uma frase inteira, do mais frequente
       para o menos frequente. */
    function diagnosticoDaFrase(resultado) {
        var contagem = {}, dicas = {};
        for (var i = 0; i < resultado.ops.length; i++) {
            var o = resultado.ops[i];
            if (o.op !== 'troca') continue;
            var d = diagnosticar(o.ref, o.hip);
            if (!d) continue;
            contagem[d.id] = (contagem[d.id] || 0) + 1;
            dicas[d.id] = d.dica;
        }
        return Object.keys(contagem)
            .sort(function (a, b) { return contagem[b] - contagem[a]; })
            .map(function (id) { return { id: id, n: contagem[id], dica: dicas[id] }; });
    }

    /* Conta sílabas aproximadamente — usado para mostrar ao aluno
       quantas sílabas a frase deveria ter (contra a vogal fantasma). */
    function silabas(frase) {
        var ps = palavras(frase), total = 0;
        for (var i = 0; i < ps.length; i++) {
            var p = ps[i].replace(/e$/, '');
            var g = p.match(/[aeiouy]+/g);
            total += g ? g.length : 1;
        }
        return total;
    }

    return {
        normalizar: normalizar,
        palavras: palavras,
        alinhar: alinhar,
        pontuar: pontuar,
        diagnosticar: diagnosticar,
        diagnosticoDaFrase: diagnosticoDaFrase,
        silabas: silabas
    };
})();
