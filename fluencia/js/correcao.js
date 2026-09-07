/* =========================================================
   Corretor de regras.

   Recebe o que o reconhecimento ouviu e devolve: os erros que
   ele reconhece, a frase reescrita com as trocas aplicadas, e
   as observações do exercício (devolveu a pergunta? a reação
   ficou curta?).

   O que ele NÃO faz, e diz isso ao aluno: entender inglês.
   Não achar erro aqui não significa que a frase está certa —
   significa que ela não caiu em nenhuma das armadilhas
   conhecidas. Corretor que finge onipotência ensina o aluno a
   confiar no lugar errado.
   ========================================================= */
window.F = window.F || {};

F.correcao = (function () {
    'use strict';

    /* O reconhecimento devolve texto sem pontuação e em caixa baixa;
       é nesse formato que as regras trabalham. */
    function normalizar(t) {
        return String(t || '').toLowerCase().replace(/[.,!?;:]/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function analisar(texto, opcoes) {
        opcoes = opcoes || {};
        var t = normalizar(texto);
        var achados = [];
        var corrigido = texto ? String(texto).trim() : '';

        if (!t) return { achados: [], corrigido: '', observacoes: [], vazio: true };

        (F.data.correcoes || []).forEach(function (regra) {
            var m = t.match(regra.re);
            if (!m) return;
            var sugestao = regra.troca.replace(/\$(\d)/g, function (_, n) { return m[Number(n)] || ''; });
            achados.push({ trecho: m[0], sugestao: sugestao, porque: regra.porque });

            // reescreve a frase do aluno com a troca aplicada, para ele ver
            // a versão certa inteira, e não só o pedaço
            if (sugestao.indexOf('(') !== 0) {
                var re = new RegExp(m[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                corrigido = corrigido.replace(re, sugestao);
            }
        });

        var observacoes = [];
        (opcoes.checar || []).forEach(function (id) {
            var o = (F.data.observacoes || {})[id];
            if (o && o.testa(t)) observacoes.push(o.aviso);
        });

        return {
            achados: achados,
            corrigido: achados.length ? corrigido : '',
            observacoes: observacoes,
            vazio: false
        };
    }

    /* Bloco pronto para as telas: o que o aluno falou, o que ficaria certo,
       e a razão de cada troca. */
    function html(texto, opcoes) {
        var esc = F.ui.esc;
        var r = analisar(texto, opcoes);
        if (r.vazio) return '';

        var partes = ['<div class="correcao">'];
        partes.push('<h4>O que você disse</h4><p class="corr-falado">“' + esc(texto) + '”</p>');

        if (r.achados.length) {
            partes.push('<h4>Corrigido</h4><p class="corr-certo">“' + esc(r.corrigido) + '”</p>');
            partes.push('<ul class="corr-lista">' + r.achados.map(function (a) {
                return '<li><b>' + esc(a.trecho) + '</b> → <i>' + esc(a.sugestao) + '</i>' +
                    '<small>' + esc(a.porque) + '</small></li>';
            }).join('') + '</ul>');
        } else {
            partes.push('<p class="corr-limpo">Nenhum dos erros que o app sabe detectar apareceu aqui. ' +
                'Isso não garante que a frase esteja perfeita: a correção é por regras — ele reconhece ' +
                'as armadilhas do português, não entende inglês.</p>');
        }

        r.observacoes.forEach(function (o) {
            partes.push('<p class="corr-obs">' + esc(o) + '</p>');
        });

        partes.push('</div>');
        return partes.join('');
    }

    return { analisar: analisar, html: html, normalizar: normalizar };
})();
