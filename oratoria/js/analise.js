/* =========================================================
   Medidas que não dependem de IA: vícios de linguagem, ritmo,
   tempo e cobertura do roteiro, contados sobre a transcrição.

   Com o Gemini, elas complementam a avaliação (o número de palavras
   por minuto é conta, não opinião, então é feito aqui). Sem ele, viram
   uma avaliação local inteira — mais simples, e a tela diz isso.
   ========================================================= */
window.O = window.O || {};

O.analise = (function () {
    'use strict';

    /* Expressões compostas primeiro: "tipo assim" não pode contar também
       como "tipo" e como "assim". */
    var VICIOS = [
        'tipo assim', 'meio que', 'na verdade', 'ou seja', 'sabe como',
        'né', 'tipo', 'então', 'aí', 'daí', 'assim', 'enfim', 'sabe', 'tá',
        'basicamente', 'literalmente'
    ];
    /* Hesitações: só a IA ouve de verdade; o reconhecimento do navegador
       costuma apagá-las. */
    var HESITACAO = /^(e{2,}h*|eh+|é{2,}|ã+|ah+|hum+|hm+|uh+m*|hã+|ããn+)$/;

    var RITMO_IDEAL = [120, 160];

    function semAcento(s) {
        return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    }

    function palavras(texto) {
        return String(texto || '').toLowerCase()
            .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
            .split(/\s+/).filter(Boolean);
    }

    /** Conta vícios. Devolve [{ termo, vezes }] do mais frequente ao menos. */
    function contarVicios(texto) {
        var resto = ' ' + palavras(texto).join(' ') + ' ';
        var achados = [];
        VICIOS.forEach(function (v) {
            var re = new RegExp(' ' + v + '(?= )', 'g');
            var n = (resto.match(re) || []).length;
            if (n) {
                achados.push({ termo: v, vezes: n });
                resto = resto.replace(re, ' ·');
            }
        });
        var hes = palavras(texto).filter(function (p) { return HESITACAO.test(p); }).length;
        if (hes) achados.push({ termo: 'éé / ãã (hesitação)', vezes: hes });
        return achados.sort(function (a, b) { return b.vezes - a.vezes; });
    }

    function ritmo(texto, segundos) {
        var n = palavras(texto).length;
        var ppm = segundos > 0 ? Math.round(n / (segundos / 60)) : 0;
        return { palavras: n, ppm: ppm };
    }

    function radical(p) { return semAcento(p).slice(0, 5); }

    /** Quais pontos-chave aparecem na fala, por palavras significativas. */
    function cobertura(texto, pontos) {
        var falados = {};
        palavras(texto).forEach(function (p) { if (p.length >= 4) falados[radical(p)] = 1; });
        return (pontos || []).map(function (ponto) {
            var titulo = typeof ponto === 'string' ? ponto : ponto.titulo;
            var chaves = palavras(titulo).filter(function (p) { return p.length >= 5; });
            if (!chaves.length) chaves = palavras(titulo).filter(function (p) { return p.length >= 4; });
            var achou = chaves.filter(function (p) { return falados[radical(p)]; }).length;
            return { ponto: titulo, coberto: chaves.length ? achou / chaves.length >= 0.34 : false };
        });
    }

    function nomeRitmo(ppm) {
        if (!ppm) return '';
        if (ppm < RITMO_IDEAL[0] - 20) return 'lento';
        if (ppm < RITMO_IDEAL[0]) return 'um pouco lento';
        if (ppm <= RITMO_IDEAL[1]) return 'adequado';
        if (ppm <= RITMO_IDEAL[1] + 20) return 'um pouco acelerado';
        return 'acelerado';
    }

    /** Medidas brutas, usadas pelas duas avaliações. */
    function medir(texto, segundos, pontos) {
        var r = ritmo(texto, segundos);
        var vicios = contarVicios(texto);
        var totalVicios = vicios.reduce(function (s, v) { return s + v.vezes; }, 0);
        return {
            segundos: Math.round(segundos),
            palavras: r.palavras,
            ppm: r.ppm,
            ritmo: nomeRitmo(r.ppm),
            vicios: vicios,
            viciosPorMinuto: segundos > 0 ? +(totalVicios / (segundos / 60)).toFixed(1) : 0,
            cobertura: cobertura(texto, pontos)
        };
    }

    /**
     * Avaliação inteira feita aqui, sem IA. Regras simples e explicáveis —
     * cada ponto descontado vira uma linha em "o que melhorar".
     */
    function avaliarLocal(texto, segundos, roteiro, minutosAlvo) {
        var m = medir(texto, segundos, roteiro && roteiro.pontos);
        var alvo = (minutosAlvo || 2) * 60;
        var nota = 10;
        var fortes = [];
        var melhorar = [];
        var temTexto = m.palavras >= 5;

        if (!temTexto) {
            return {
                nota: null,
                resumo: 'Não deu para transcrever a fala neste aparelho, então a análise ' +
                    'local mediu só o tempo. Ouça a gravação e compare com o roteiro — ou ' +
                    'configure a chave gratuita do Gemini em Ajustes para receber a ' +
                    'avaliação completa.',
                fortes: segundos >= alvo * 0.5 ? ['Você sustentou a fala por ' +
                    Math.round(segundos) + ' segundos.'] : [],
                melhorar: segundos < alvo * 0.5 ? [{ titulo: 'Tempo',
                    texto: 'A fala ficou curta para o tema. Tente usar ao menos metade do tempo.' }] : [],
                medidas: m,
                foco: 'Repita o treino e compare a gravação com o roteiro.',
                origem: 'local'
            };
        }

        if (m.ritmo === 'adequado') {
            fortes.push('Ritmo adequado: cerca de ' + m.ppm + ' palavras por minuto.');
        } else {
            nota -= /um pouco/.test(m.ritmo) ? 0.5 : 1.5;
            melhorar.push({ titulo: 'Ritmo', texto: 'Sua fala ficou ' + m.ritmo + ' (' + m.ppm +
                ' palavras por minuto). O confortável para quem ouve fica entre ' +
                RITMO_IDEAL[0] + ' e ' + RITMO_IDEAL[1] + '.' });
        }

        if (m.viciosPorMinuto <= 2) {
            fortes.push(m.vicios.length ? 'Poucos vícios de linguagem.' :
                'Nenhum vício de linguagem evidente.');
        } else {
            nota -= Math.min(3, (m.viciosPorMinuto - 2) * 0.5);
            var top = m.vicios.slice(0, 3).map(function (v) {
                return '"' + v.termo + '" (' + v.vezes + 'x)';
            }).join(', ');
            melhorar.push({ titulo: 'Vícios de linguagem', texto: 'Apareceram ' + top +
                '. Troque essas muletas por uma pausa curta: o silêncio passa mais segurança.' });
        }

        if (segundos > alvo * 1.15) {
            nota -= 1;
            melhorar.push({ titulo: 'Tempo', texto: 'Passou do tempo combinado (' + Math.round(segundos) +
                's de ' + alvo + 's). Corte o que não sustenta a ideia principal.' });
        } else if (segundos < alvo * 0.4) {
            nota -= 1.5;
            melhorar.push({ titulo: 'Tempo', texto: 'A fala ficou curta (' + Math.round(segundos) +
                's). Desenvolva cada ponto com um exemplo.' });
        } else {
            fortes.push('Boa gestão do tempo: ' + Math.round(segundos) + 's de ' + alvo + 's.');
        }

        var cobertos = m.cobertura.filter(function (c) { return c.coberto; });
        if (m.cobertura.length) {
            var falta = m.cobertura.filter(function (c) { return !c.coberto; });
            if (!falta.length) {
                fortes.push('Passou por todos os pontos-chave do roteiro.');
            } else {
                nota -= Math.min(3, falta.length * 0.75);
                melhorar.push({ titulo: 'Cobertura do roteiro', texto: 'Parece que ficou de fora: ' +
                    falta.map(function (c) { return c.ponto; }).join('; ') + '.' });
            }
        }

        nota = Math.max(0, Math.min(10, Math.round(nota * 2) / 2));
        return {
            nota: nota,
            resumo: 'Avaliação local, feita no aparelho a partir da transcrição: mede ritmo, ' +
                'vícios, tempo e se os pontos-chave apareceram (' + cobertos.length + ' de ' +
                m.cobertura.length + '). Clareza, argumentação e entonação só a avaliação ' +
                'com IA consegue julgar.',
            fortes: fortes,
            melhorar: melhorar,
            medidas: m,
            foco: melhorar.length ? melhorar[0].titulo + ': ' + melhorar[0].texto
                : 'Mantenha o padrão e suba de nível.',
            origem: 'local'
        };
    }

    return {
        contarVicios: contarVicios, ritmo: ritmo, cobertura: cobertura, medir: medir,
        avaliarLocal: avaliarLocal, nomeRitmo: nomeRitmo, palavras: palavras,
        RITMO_IDEAL: RITMO_IDEAL
    };
})();
