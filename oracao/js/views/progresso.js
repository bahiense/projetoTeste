/* =========================================================
   Progresso — a fotografia honesta.

   O que interessa não é a média subir: é a comparação entre você de
   hoje e você do dia 1, que é a única comparação que o material
   admite. Por isso as orações reais aparecem antes dos números.
   ========================================================= */
window.A = window.A || {};
A.telas = A.telas || {};

(function () {
    'use strict';

    A.telas.progresso = function (el) {
        var u = A.ui, s = A.store.get();
        var oracoes = A.store.oracoes();

        var html = u.cabecalho('Progresso', 'Você contra você mesmo — antes e depois da prática.');

        html += '<div class="streak-linha">' +
            num(s.streak.atual, 'dias seguidos') +
            num(s.streak.recorde, 'recorde') +
            num(A.store.diasConcluidos() + '/21', 'programa') +
            num(oracoes.length, 'orações treinadas') +
            num(s.reais.length, 'orações reais') +
            '</div>';

        if (!oracoes.length && !s.reais.length) {
            html += u.vazio('Nada ainda. Uma oração de trinta segundos em voz alta já começa a linha.');
            html += '<a class="btn btn--forte btn--grande" href="#/treinar">Treinar agora</a>';
            el.innerHTML = html;
            return;
        }

        /* evolução: primeiras cinco contra últimas cinco */
        if (oracoes.length >= 6) {
            var ultimas = medias(oracoes.slice(0, 5));
            var primeiras = medias(oracoes.slice(-5));
            html += '<div class="cartao"><h3>Dia 1 × hoje</h3>' +
                '<table class="tabela tabela--comp"><thead><tr><th></th><th>primeiras 5</th><th>últimas 5</th></tr></thead><tbody>' +
                linha('Nota', primeiras.nota, ultimas.nota) +
                linha('Ângulos usados', primeiras.angulos, ultimas.angulos, 5) +
                linha('Pontes', primeiras.pontes, ultimas.pontes, 4) +
                linha('Detalhe verdadeiro', primeiras.especificidade, ultimas.especificidade) +
                linha('Vocativos em fila', primeiras.vocativosFila, ultimas.vocativosFila, null, true) +
                '</tbody></table>' +
                '<p class="legenda">Nos vocativos em fila, menos é melhor.</p></div>';
        }

        /* o que mais falta */
        var falho = pontoFraco(oracoes);
        if (falho) {
            html += '<div class="cartao cartao--destaque"><h3>O que mais falta em você</h3>' +
                '<p>' + u.esc(falho.texto) + '</p>' +
                '<a class="btn btn--forte" href="' + falho.link + '">' + u.esc(falho.acao) + '</a></div>';
        }

        /* orações reais primeiro: é para elas que o app existe */
        if (s.reais.length) {
            html += '<div class="cartao"><h3>Orações reais</h3><div class="historico">' +
                s.reais.slice(0, 8).map(function (r) {
                    var rot = ['', 'Travei', 'Difícil', 'Deu certo', 'Fluiu'][r.como] || '—';
                    return '<div class="hist"><span class="hist-nota hist-nota--txt">' + rot + '</span>' +
                        '<span class="hist-txt"><b>' + u.esc(r.quem || r.proposito || 'Oração em público') + '</b>' +
                        '<small>' + u.quando(r.data) + ' · ' + u.tempo(r.segundos) + '</small>' +
                        (r.obs ? '<i class="hist-obs">' + u.esc(r.obs) + '</i>' : '') +
                        '</span></div>';
                }).join('') + '</div></div>';
        }

        /* histórico de treino */
        html += '<div class="cartao"><h3>Treinos</h3><div class="historico">' +
            oracoes.slice(0, 20).map(function (o) {
                return '<div class="hist"><span class="hist-nota" style="--cor:' + u.corNota(o.nota) + '">' +
                    o.nota + '</span>' +
                    '<span class="hist-txt"><b>' + u.esc(o.titulo || 'Treino livre') + '</b>' +
                    '<small>' + u.quando(o.data) + ' · ' + u.tempo(o.segundos) +
                    ' · ' + o.angulos.length + '/5 ângulos · ' + o.pontes + '/4 pontes</small>' +
                    (o.reflexao ? '<i class="hist-obs">' + u.esc(o.reflexao) + '</i>' : '') +
                    (o.texto ? '<button class="link" data-ver="' + o.ts + '">ver o que você disse</button>' : '') +
                    '</span>' +
                    '<button class="apagar" data-apagar="' + o.ts + '" aria-label="apagar">✕</button></div>';
            }).join('') + '</div></div>';

        if (s.avaliacao.inicial || s.avaliacao.final) html += avaliacoes(s);
        else if (A.store.programaCompleto()) {
            html += '<a class="btn btn--forte btn--grande" href="#/avaliacao">Fazer a avaliação final</a>';
        }

        el.innerHTML = html;

        u.qq('[data-ver]', el).forEach(function (b) {
            b.onclick = function () {
                var ts = parseInt(b.getAttribute('data-ver'), 10);
                var o = null;
                oracoes.forEach(function (x) { if (x.ts === ts) o = x; });
                if (o) u.abrirModal(o.titulo || 'Oração', '<p class="oracao">' + u.esc(o.texto) + '</p>');
            };
        });

        u.qq('[data-apagar]', el).forEach(function (b) {
            b.onclick = function () {
                if (!confirm('Apagar este treino?')) return;
                A.store.apagarOracao(parseInt(b.getAttribute('data-apagar'), 10));
                A.telas.progresso(el);
            };
        });
    };

    function num(v, r) {
        return '<div class="streak-num">' + v + '<small>' + r + '</small></div>';
    }

    function medias(arr) {
        function m(campo) {
            var t = 0, n = 0;
            arr.forEach(function (o) {
                var v = campo === 'angulos' ? (o.angulos || []).length : o[campo];
                if (typeof v === 'number') { t += v; n++; }
            });
            return n ? Math.round((t / n) * 10) / 10 : 0;
        }
        return {
            nota: m('nota'), angulos: m('angulos'), pontes: m('pontes'),
            especificidade: m('especificidade'), vocativosFila: m('vocativosFila')
        };
    }

    function linha(rotulo, a, b, max, menorMelhor) {
        var melhorou = menorMelhor ? b < a : b > a;
        var seta = b === a ? '' : (melhorou ? ' <i class="sobe">↑</i>' : ' <i class="desce">↓</i>');
        var sufixo = max ? '/' + max : '';
        return '<tr><td>' + rotulo + '</td><td>' + a + sufixo + '</td><td><b>' + b + sufixo + '</b>' + seta + '</td></tr>';
    }

    /* Aponta um lugar só. Uma lista de dez fraquezas não muda nada. */
    function pontoFraco(oracoes) {
        var ult = oracoes.slice(0, 8);
        if (ult.length < 3) return null;
        var m = medias(ult);
        var conclui = ult.filter(function (o) { return o.concluiu; }).length / ult.length;

        if (m.angulos < 3) return {
            texto: 'Suas orações usam em média ' + m.angulos + ' dos 5 Ângulos. Quando faltar assunto, ' +
                'não procure outro tema: faça a pergunta do próximo ângulo.',
            link: '#/ferramenta/angulos', acao: 'Rever os 5 Ângulos'
        };
        if (m.pontes < 2) return {
            texto: 'As ideias ainda ficam soltas — média de ' + m.pontes + ' das 4 Pontes. ' +
                'A mais simples é situação → necessidade.',
            link: '#/ferramenta/pontes', acao: 'Rever as 4 Pontes'
        };
        if (conclui < 0.6) return {
            texto: 'Boa parte das suas orações para em vez de concluir. Antes do amém, diga em que ' +
                'vocês estão confiando.',
            link: '#/curso/3', acao: 'Rever o R do ALTAR'
        };
        if (m.especificidade < 45) return {
            texto: 'Ainda há mais bênção genérica do que detalhe verdadeiro. Diga o nome, diga a situação.',
            link: '#/curso/6', acao: 'Rever profundidade'
        };
        if (m.vocativosFila >= 2) return {
            texto: 'Os "Senhor... Pai... meu Deus..." em fila continuam aparecendo. É a busca pela ' +
                'próxima frase em voz alta — e uma pausa consciente resolve melhor.',
            link: '#/curso/2', acao: 'Rever o diagnóstico'
        };
        return {
            texto: 'As medidas estão boas. O próximo degrau não é o app: é ser chamado de verdade e ' +
                'registrar como foi.',
            link: '#/momento', acao: 'Vou orar de verdade'
        };
    }

    function avaliacoes(s) {
        var u = A.ui;
        var html = '<div class="cartao"><h3>Autoavaliação</h3><table class="tabela tabela--comp">' +
            '<thead><tr><th></th><th>antes</th><th>depois</th></tr></thead><tbody>';
        A.AVALIACAO.forEach(function (a) {
            var i = s.avaliacao.inicial ? s.avaliacao.inicial.notas[a.id] : '—';
            var f = s.avaliacao.final ? s.avaliacao.final.notas[a.id] : '—';
            html += '<tr><td>' + u.esc(a.nome) + '</td><td>' + i + '</td><td><b>' + f + '</b></td></tr>';
        });
        html += '</tbody></table><p class="legenda">Não é nota de aprovação. É uma fotografia do momento.</p>' +
            '<a class="btn" href="#/avaliacao">Refazer</a></div>';
        return html;
    }

    /* ---------------- avaliação de 1 a 5 ---------------- */

    A.telas.avaliacao = function (el) {
        var u = A.ui, s = A.store.get();
        var qual = s.avaliacao.inicial ? 'final' : 'inicial';
        var notas = {};

        var html = u.cabecalho(qual === 'inicial' ? 'Onde você está hoje' : 'Avaliação final',
            'De 1 a 5. Não existe nota certa — existe onde você está agora.');

        html += A.AVALIACAO.map(function (a) {
            return '<div class="cartao aval"><h3>' + u.esc(a.nome) + '</h3>' +
                '<p class="sub">' + u.esc(a.p) + '</p>' +
                '<div class="escala">' + [1, 2, 3, 4, 5].map(function (n) {
                    return '<button class="esc" data-id="' + a.id + '" data-n="' + n + '">' + n + '</button>';
                }).join('') + '</div></div>';
        }).join('');

        html += '<button class="btn btn--forte btn--grande" id="av-salvar">Guardar</button>';

        el.innerHTML = html;

        u.qq('.esc', el).forEach(function (b) {
            b.onclick = function () {
                var id = b.getAttribute('data-id');
                notas[id] = parseInt(b.getAttribute('data-n'), 10);
                u.qq('[data-id="' + id + '"]', el).forEach(function (x) { x.classList.remove('is-on'); });
                b.classList.add('is-on');
            };
        });

        u.$('av-salvar').onclick = function () {
            if (Object.keys(notas).length < A.AVALIACAO.length) {
                u.toast('Falta responder alguma.', 'ruim');
                return;
            }
            A.store.guardarAvaliacao(qual, notas);
            u.toast('Guardado.');
            location.hash = '#/progresso';
        };
    };
})();
