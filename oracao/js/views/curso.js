/* =========================================================
   Curso — os dez módulos.

   Ler não é o exercício, e a tela diz isso: cada módulo termina
   empurrando para a voz alta. O que fica marcado como lido é só
   um mapa de onde você passou.
   ========================================================= */
window.A = window.A || {};
A.telas = A.telas || {};

(function () {
    'use strict';

    A.telas.curso = function (el, args) {
        var u = A.ui;
        if (args && args[0]) { modulo(el, parseInt(args[0], 10)); return; }

        var html = u.cabecalho('O método', 'Dez módulos: do medo de travar até orar sem pensar no método.');

        html += '<div class="modulos">' + A.MODULOS.map(function (m) {
            var lido = A.store.lido(m.id);
            return '<a class="mod' + (lido ? ' is-lido' : '') + '" href="#/curso/' + m.n + '">' +
                '<span class="mod-n">' + m.n + '</span>' +
                '<span class="mod-c"><b>' + u.esc(m.titulo) + '</b>' +
                '<small>' + u.esc(m.sub) + '</small>' +
                '<span class="seta">' + (lido ? '✓' : '›') + '</span></a>';
        }).join('') + '</div>';

        html += '<div class="cartao"><h3>As ferramentas, numa página</h3>' +
            '<div class="grade-cards">' +
            '<a class="card" href="#/ferramenta/altar"><span class="card-i">🗺</span><b>Mapa ALTAR</b><small>Os cinco movimentos.</small></a>' +
            '<a class="card" href="#/ferramenta/angulos"><span class="card-i">🔎</span><b>5 Ângulos</b><small>Desenvolver uma ideia.</small></a>' +
            '<a class="card" href="#/ferramenta/pontes"><span class="card-i">🌉</span><b>4 Pontes</b><small>Conectar sem pular.</small></a>' +
            '<a class="card" href="#/ferramenta/niveis"><span class="card-i">⬇</span><b>5 Níveis</b><small>Enxergar além do pedido.</small></a>' +
            '</div></div>';

        el.innerHTML = html;
    };

    function modulo(el, n) {
        var u = A.ui;
        var m = A.MODULOS[Math.max(0, Math.min(9, n - 1))];

        var html = '<a class="voltar" href="#/curso">‹ Módulos</a>' +
            u.cabecalho('Módulo ' + m.n + ' — ' + m.titulo, m.sub);

        html += '<p class="chave">' + u.esc(m.chave) + '</p>';

        m.secoes.forEach(function (s) {
            html += '<section class="secao"><h3>' + u.esc(s.t) + '</h3>' +
                s.p.map(function (p) { return '<p>' + u.esc(p) + '</p>'; }).join('') +
                '</section>';
        });

        html += '<div class="cartao cartao--destaque"><p>' + u.esc(m.destaque) + '</p></div>';

        html += '<div class="cartao"><h3>Agora em voz alta</h3>' +
            '<p>' + u.esc(m.exercicio.t) + '</p><ul class="lista-ex">' +
            m.exercicio.itens.map(function (i) { return '<li>' + u.esc(i) + '</li>'; }).join('') +
            '</ul><p class="legenda">' + u.esc(m.exercicio.fecho) + '</p>' +
            '<a class="btn btn--forte btn--grande" href="#/treinar">Treinar agora</a></div>';

        html += '<div class="linha-botoes">' +
            '<button class="btn" id="mod-lido">' + (A.store.lido(m.id) ? '✓ Lido' : 'Marcar como lido') + '</button>' +
            (m.n > 1 ? '<a class="btn" href="#/curso/' + (m.n - 1) + '">‹ Módulo ' + (m.n - 1) + '</a>' : '') +
            (m.n < 10 ? '<a class="btn" href="#/curso/' + (m.n + 1) + '">Módulo ' + (m.n + 1) + ' ›</a>' : '') +
            '</div>';

        el.innerHTML = html;

        u.$('mod-lido').onclick = function () {
            A.store.marcarLido(m.id);
            this.textContent = '✓ Lido';
            u.toast('Marcado. Agora ore em voz alta — é aí que muda.');
        };
    }

    /* ---------------- ferramentas, para consulta ---------------- */

    A.telas.ferramenta = function (el, args) {
        var u = A.ui;
        var qual = (args && args[0]) || 'altar';
        var html = '<a class="voltar" href="#/curso">‹ Módulos</a>';

        if (qual === 'altar') {
            html += u.cabecalho('O mapa ALTAR', 'Cinco perguntas. Um mapa. Não uma fórmula.');
            html += A.ALTAR.map(function (l) {
                return '<div class="cartao letra"><div class="letra-topo">' +
                    '<span class="letra-l">' + l.letra + '</span>' +
                    '<div><b>' + u.esc(l.nome) + '</b><small>' + u.esc(l.pergunta) + '</small></div></div>' +
                    '<p>' + u.esc(l.texto) + '</p>' +
                    (l.opcoes ? '<div class="chips">' + l.opcoes.map(function (o) {
                        return '<span class="chip">' + u.esc(o) + '</span>';
                    }).join('') + '</div>' : '') +
                    (l.comparacao ? '<div class="comparar">' +
                        '<div class="comp comp--fraco"><small>genérico</small>' + u.esc(l.comparacao.fraco) + '</div>' +
                        '<div class="comp comp--forte"><small>do momento</small>' + u.esc(l.comparacao.forte) + '</div>' +
                        '</div>' : '') +
                    '</div>';
            }).join('');
        } else if (qual === 'angulos') {
            html += u.cabecalho('Os 5 Ângulos', 'Perguntas que encontram o conteúdo que já está em você.');
            html += A.ANGULOS.map(function (a) {
                return '<div class="cartao"><h3>' + a.n + '. ' + u.esc(a.nome) + '</h3>' +
                    '<p class="pergunta">' + u.esc(a.pergunta) + '</p>' +
                    '<p>' + u.esc(a.dica) + '</p>' +
                    '<ul class="lista-ex">' + a.exemplos.map(function (e) {
                        return '<li>' + u.esc(e) + '</li>';
                    }).join('') + '</ul></div>';
            }).join('');
        } else if (qual === 'pontes') {
            html += u.cabecalho('As 4 Pontes', 'Transição não é frase. É relação entre duas ideias.');
            html += A.PONTES.map(function (p) {
                return '<div class="cartao"><h3>' + p.n + '. ' + u.esc(p.nome) + '</h3>' +
                    '<p class="pergunta">' + u.esc(p.pergunta) + '</p>' +
                    '<p class="citacao">' + u.esc(p.exemplo) + '</p>' +
                    '<p class="legenda">' + u.esc(p.porque) + '</p></div>';
            }).join('');
        } else {
            html += u.cabecalho('Os 5 Níveis', 'Profundidade não é tamanho nem palavra difícil.');
            html += A.NIVEIS.map(function (n) {
                return '<div class="cartao"><h3>' + n.n + '. ' + u.esc(n.nome) + '</h3>' +
                    '<p>' + u.esc(n.dica) + '</p>' +
                    '<div class="comparar">' +
                    '<div class="comp comp--fraco"><small>superfície</small>' + u.esc(n.raso) + '</div>' +
                    '<div class="comp comp--forte"><small>um nível abaixo</small>' + u.esc(n.fundo) + '</div>' +
                    '</div></div>';
            }).join('');
        }

        html += '<a class="btn btn--forte btn--grande" href="#/treinar">Usar isso agora, em voz alta</a>';
        el.innerHTML = html;
    };
})();
