/* =========================================================
   TELA JOGOS — decorar o que um cristão quer na ponta da língua.

   Três mecânicas, conforme o baralho: pôr em ordem (os dias da
   criação, os juízes, a ordem dos livros), ligar os pares (a oferta e
   o que ela era, a praga e o sinal) e o relâmpago (a descrição
   aparece, você escolhe de quem é).

   A resposta certa aparece sempre — errando, ela é mostrada na hora,
   com o versículo de onde saiu. Decorar é o objetivo; a nota é só para
   saber se já saiu inteiro alguma vez.
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.jogos = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, jg = B.jogos;

    /* Estado de uma rodada. Vive enquanto a tela vive. */
    var jogo = null;

    /* ---------- referências ---------- */

    var PORUSFM = (function () {
        var m = {};
        (B.biblia.LIVROS || []).forEach(function (l) { m[l.usfm] = l; });
        return m;
    })();

    /** 'GEN 1.3-5' -> { texto: 'Gênesis 1.3-5', href: '#/ler/Gênesis 1' } */
    function refHumana(ref) {
        var m = String(ref || '').match(/^(\S+) (\d+)(?:\.(\d+(?:-\d+)?))?$/);
        if (!m || !PORUSFM[m[1]]) return null;
        var nome = PORUSFM[m[1]].nome;
        return {
            texto: nome + ' ' + m[2] + (m[3] ? '.' + m[3] : ''),
            href: '#/ler/' + encodeURIComponent(nome + ' ' + m[2])
        };
    }

    function linhaFonte(item) {
        if (item.livro && !item.ref) {
            var l = PORUSFM[item.livro];
            return l ? '<span class="jg-ref">' + esc(l.nome) + '</span>' : '';
        }
        var r = refHumana(item.ref);
        if (!r) return '';
        return '<a class="jg-ref" href="' + r.href + '">' + esc(r.texto) + ' ›</a>';
    }

    /* ---------- rota ---------- */

    function separar(arg) {
        var p = String(arg || '').split('/');
        return { id: p[0] || '', modo: p[1] || '' };
    }

    function render(arg) {
        var a = separar(arg);
        if (!a.id) return renderAcervo();
        var baralho = jg.porId(a.id);
        if (!baralho) {
            return topo('Jogos', '', '#/jogos', 'acervo') +
                '<p class="dica">Não achei esse jogo.</p>';
        }
        if (a.modo && jg.modoValido(baralho, a.modo)) return renderJogo(baralho, a.modo);
        return renderCapa(baralho);
    }

    function topo(titulo, sub, voltarHref, voltarTxt) {
        return '<header class="tela-topo">' +
            '<a class="voltar" href="' + voltarHref + '">‹ ' + esc(voltarTxt) + '</a>' +
            '<h2>' + esc(titulo) + '</h2>' +
            (sub ? '<p class="tela-sub">' + sub + '</p>' : '') +
            '</header>';
    }

    /* ---------- o acervo ---------- */

    function renderAcervo() {
        var r = jg.resumo();
        var html = topo('Jogos', 'São <b>' + r.baralhos + '</b> assuntos para ter de cor, ' +
            r.itens + ' itens em todos. Cada item traz o versículo de onde saiu — o jogo ' +
            'não inventa nada.', '#/estudo', 'estudo');

        html += '<section class="cartao jg-resumo">' +
            '<p><b>' + r.decorados + '</b> de <b>' + r.baralhos + '</b> já saíram ' +
            'inteiros, sem errar nenhum.</p>' +
            '<div class="barra"><i style="width:' +
            Math.round(100 * r.decorados / Math.max(1, r.baralhos)) + '%"></i></div>' +
            '</section>';

        jg.temas().forEach(function (t) {
            html += '<h3 class="secao">' + esc(t.tema) + ' <small>' + t.baralhos.length +
                ' jogo' + (t.baralhos.length === 1 ? '' : 's') + '</small></h3>' +
                '<div class="jg-lista">' + t.baralhos.map(cartaoBaralho).join('') + '</div>';
        });
        return html;
    }

    function cartaoBaralho(b) {
        var feito = jg.decorado(b.id);
        var placar = jg.doBaralho(b.id);
        return '<a class="jg-item' + (feito ? ' is-feito' : '') +
            '" href="#/jogos/' + encodeURIComponent(b.id) + '">' +
            '<span class="jg-item-selo">' + (feito ? '★' : (b.jogo === 'ordem' ? '⇅' : '⇄')) +
            '</span>' +
            '<span class="jg-item-txt"><b>' + esc(b.nome) + '</b>' +
            '<small>' + b.itens.length + ' itens · ' + esc(b.fonte) +
            (placar ? ' · melhor ' + placar.melhor + '/' + placar.total : '') +
            '</small></span>' +
            '<span class="estudo-seta">›</span></a>';
    }

    /* ---------- a capa de um jogo ---------- */

    function renderCapa(b) {
        var placar = jg.doBaralho(b.id);
        var html = topo(b.nome, 'Fonte: <b>' + esc(b.fonte) + '</b> · ' + b.itens.length +
            ' itens', '#/jogos', 'jogos');

        html += '<section class="cartao">' +
            '<p class="dica">Escolha como quer treinar:</p>' +
            jg.modos(b).map(function (m) {
                var venceu = placar && placar.modos && placar.modos[m.id];
                return '<a class="btn ' + (venceu ? 'btn--feito' : 'btn--forte') +
                    ' btn--largo jg-modo" href="#/jogos/' + encodeURIComponent(b.id) +
                    '/' + m.id + '">' + esc(m.nome) + (venceu ? ' ✓' : '') + '</a>' +
                    '<p class="dica jg-modo-dica">' + esc(m.dica) + '</p>';
            }).join('') +
            '</section>';

        html += '<h3 class="secao">O que há para decorar <small>a lista inteira</small></h3>' +
            '<section class="cartao jg-gabarito">' + b.itens.map(function (it, i) {
                return '<div class="jg-linha">' +
                    '<b>' + (b.jogo === 'ordem' ? (i + 1) + '. ' : '') + esc(it.a) + '</b>' +
                    '<span>' + esc(it.b) + '</span>' + linhaFonte(it) + '</div>';
            }).join('') + '</section>';

        if (placar) {
            html += '<section class="cartao"><p class="dica">Você jogou ' + placar.rodadas +
                ' vez' + (placar.rodadas === 1 ? '' : 'es') + '; melhor resultado ' +
                placar.melhor + ' de ' + placar.total + '.</p>' +
                '<button class="btn btn--fraco btn--largo" id="jg-zerar">Esquecer este ' +
                'placar</button></section>';
        }
        return html;
    }

    /* ---------- a rodada ---------- */

    function renderJogo(b, modo) {
        var m = jg.modos(b).filter(function (x) { return x.id === modo; })[0];
        return topo(b.nome, esc(m.nome) + ' · ' + esc(m.dica),
            '#/jogos/' + encodeURIComponent(b.id), 'o jogo') +
            '<div class="jg-placar" id="jg-placar"></div>' +
            '<div id="jg-mesa"></div>';
    }

    function depois(el, arg) {
        var a = separar(arg);
        var b = a.id && jg.porId(a.id);
        if (!b) return;

        var zerar = ui.$('jg-zerar');
        if (zerar) {
            zerar.addEventListener('click', function () {
                jg.zerar(b.id);
                ui.toast('Placar deste jogo esquecido.');
                B.app.pintar();
            });
        }
        if (!a.modo || !jg.modoValido(b, a.modo)) return;
        iniciarRodada(b, a.modo);
    }

    /*
     * Cada rodada ganha uma mesa nova em folha.
     *
     * "Jogar de novo" chamava esta função outra vez e cada mecânica pendura
     * o seu ouvinte na mesa: sem trocar o nó, o segundo jogo contaria cada
     * toque duas vezes.
     */
    function limparMesa() {
        var antiga = ui.$('jg-mesa');
        if (!antiga || !antiga.parentNode) return antiga;
        var nova = document.createElement('div');
        nova.id = 'jg-mesa';
        antiga.parentNode.replaceChild(nova, antiga);
        return nova;
    }

    function iniciarRodada(b, modo) {
        limparMesa();
        jogo = { baralho: b, modo: modo, acertos: 0, erros: 0, total: b.itens.length };
        if (modo === 'ordem') return ordem(b);
        if (modo === 'pares') return pares(b);
        return relampago(b);
    }

    function placar(texto) {
        var c = ui.$('jg-placar');
        if (!c) return;
        c.innerHTML = texto;
    }

    function fim(extra) {
        var b = jogo.baralho;
        var r = jg.guardar(b.id, jogo.modo, jogo.acertos, jogo.total);
        var perfeito = jogo.acertos >= jogo.total;
        var mesa = ui.$('jg-mesa');
        mesa.insertAdjacentHTML('beforeend',
            '<section class="cartao jg-fim">' +
            '<p class="jg-fim-nota">' + jogo.acertos + ' de ' + jogo.total +
            ' de primeira</p>' +
            '<p class="dica">' + (perfeito
                ? 'Saiu inteiro, sem errar nenhum. Este assunto conta como decorado — ' +
                'mas vale repetir daqui a alguns dias.'
                : 'Os que escaparam estão na lista do jogo, com o versículo de cada um. ' +
                'Repetir hoje mesmo ajuda mais do que deixar para depois.') +
            (r.melhor > jogo.acertos ? ' Seu melhor continua ' + r.melhor + '/' + r.total +
                '.' : '') + '</p>' +
            (extra || '') +
            '<div class="grupo-botoes grupo-botoes--dois">' +
            '<button class="btn btn--forte" id="jg-denovo">Jogar de novo</button>' +
            '<a class="btn btn--fraco" href="#/jogos/' + encodeURIComponent(b.id) +
            '">A lista e os modos</a>' +
            '</div>' +
            '<a class="btn btn--fraco btn--largo" href="#/jogos">Outros jogos</a>' +
            '</section>');
        var dn = ui.$('jg-denovo');
        if (dn) dn.addEventListener('click', function () { iniciarRodada(b, jogo.modo); });
        mesa.querySelector('.jg-fim').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /* ---------- modo: pôr em ordem ---------- */

    function ordem(b) {
        var mesa = ui.$('jg-mesa');
        var sorteadas = jg.embaralhar(b.itens.map(function (it, i) { return i; }));
        var proximo = 0;

        mesa.innerHTML = '<div class="jg-fila" id="jg-fila"></div>' +
            '<div class="jg-pedras">' + sorteadas.map(function (i) {
                return '<button class="jg-pedra" data-i="' + i + '">' +
                    '<b>' + esc(b.itens[i].a) + '</b>' +
                    '<small>' + esc(b.itens[i].b) + '</small></button>';
            }).join('') + '</div>';
        placar('Toque na ordem certa · <b>0</b> de ' + b.itens.length);

        mesa.addEventListener('click', function (ev) {
            var botao = ev.target.closest ? ev.target.closest('.jg-pedra') : null;
            if (!botao || botao.disabled) return;
            var i = +botao.getAttribute('data-i');

            if (i === proximo) {
                jogo.acertos++;
                aceitar(botao, i, true);
            } else {
                jogo.erros++;
                botao.classList.add('is-errada');
                setTimeout(function () { botao.classList.remove('is-errada'); }, 400);
                /* Mostra qual era o certo: errar sem saber a resposta não
                   ensina a sequência, só frustra. */
                var certo = ui.q('.jg-pedra[data-i="' + proximo + '"]', mesa);
                if (certo) aceitar(certo, proximo, false);
            }
            proximo++;
            placar('Toque na ordem certa · <b>' + jogo.acertos + '</b> de ' + jogo.total +
                (jogo.erros ? ' · ' + jogo.erros + ' erro' + (jogo.erros === 1 ? '' : 's') : ''));
            if (proximo >= b.itens.length) fim('');
        });

        function aceitar(botao, i, acertou) {
            botao.disabled = true;
            botao.classList.add(acertou ? 'is-certa' : 'is-revelada');
            var it = b.itens[i];
            ui.$('jg-fila').insertAdjacentHTML('beforeend',
                '<div class="jg-passo' + (acertou ? '' : ' is-revelada') + '">' +
                '<span class="jg-num">' + (i + 1) + '</span>' +
                '<span class="jg-passo-txt"><b>' + esc(it.a) + '</b>' +
                '<small>' + esc(it.b) + '</small>' + linhaFonte(it) + '</span>' +
                '</div>');
        }
    }

    /* ---------- modo: ligar os pares ---------- */

    function pares(b) {
        var mesa = ui.$('jg-mesa');
        var tabuleiros = jg.mesas(b, 4);
        var qual = 0;
        var escolhido = null;

        pintarMesa();

        function pintarMesa() {
            var itens = tabuleiros[qual];
            var direita = jg.embaralhar(itens);
            mesa.innerHTML = '<section class="cartao jg-pares">' +
                '<p class="dica">Mesa ' + (qual + 1) + ' de ' + tabuleiros.length +
                ' · toque num item e depois na descrição que combina.</p>' +
                '<div class="jg-colunas">' +
                '<div class="jg-coluna">' + itens.map(function (it) {
                    return pedra(it, 'a', esc(it.a));
                }).join('') + '</div>' +
                '<div class="jg-coluna">' + direita.map(function (it) {
                    return pedra(it, 'b', esc(it.b));
                }).join('') + '</div>' +
                '</div></section>';
            placarPares();
        }

        function pedra(it, lado, texto) {
            return '<button class="jg-par jg-par--' + lado + '" data-lado="' + lado +
                '" data-chave="' + esc(chave(it)) + '">' + texto + '</button>';
        }

        /* A chave liga os dois lados sem depender da posição na tela. */
        function chave(it) { return it.a + '§' + it.ref + '§' + (it.livro || ''); }

        function placarPares() {
            placar('Pares ligados · <b>' + jogo.acertos + '</b> de ' + jogo.total +
                (jogo.erros ? ' · ' + jogo.erros + ' erro' + (jogo.erros === 1 ? '' : 's') : ''));
        }

        mesa.addEventListener('click', function (ev) {
            var botao = ev.target.closest ? ev.target.closest('.jg-par') : null;
            if (!botao || botao.disabled) return;

            if (!escolhido || escolhido.getAttribute('data-lado') === botao.getAttribute('data-lado')) {
                if (escolhido) escolhido.classList.remove('is-escolhida');
                escolhido = botao;
                botao.classList.add('is-escolhida');
                return;
            }
            var certo = escolhido.getAttribute('data-chave') === botao.getAttribute('data-chave');
            var par = [escolhido, botao];
            escolhido.classList.remove('is-escolhida');
            escolhido = null;

            if (certo) {
                jogo.acertos++;
                par.forEach(function (p) { p.disabled = true; p.classList.add('is-certa'); });
                placarPares();
                if (!ui.qq('.jg-par:not([disabled])', mesa).length) {
                    qual++;
                    if (qual < tabuleiros.length) setTimeout(pintarMesa, 450);
                    else setTimeout(function () { fim(gabarito(b)); }, 450);
                }
                return;
            }
            jogo.erros++;
            par.forEach(function (p) { p.classList.add('is-errada'); });
            setTimeout(function () {
                par.forEach(function (p) { p.classList.remove('is-errada'); });
            }, 450);
            placarPares();
        });
    }

    /* A lista certa no fim dos pares: o jogo embaralha, e sem isto quem
       errou sai da rodada sem ver como era de verdade. */
    function gabarito(b) {
        return '<div class="jg-gabarito jg-gabarito--fim">' +
            '<p class="dica"><b>Como é:</b></p>' + b.itens.map(function (it) {
                return '<div class="jg-linha"><b>' + esc(it.a) + '</b>' +
                    '<span>' + esc(it.b) + '</span>' + linhaFonte(it) + '</div>';
            }).join('') + '</div>';
    }

    /* ---------- modo: relâmpago ---------- */

    function relampago(b) {
        var mesa = ui.$('jg-mesa');
        var perguntas = jg.relampago(b);
        var atual = 0;

        pintarPergunta();
        function pintarPergunta() {
            var q = perguntas[atual];
            placar('Pergunta <b>' + (atual + 1) + '</b> de ' + perguntas.length +
                ' · ' + jogo.acertos + ' certa' + (jogo.acertos === 1 ? '' : 's'));
            mesa.innerHTML = '<section class="cartao jg-flash">' +
                '<p class="jg-flash-txt">' + esc(q.pergunta) + '</p>' +
                '<div class="alternativas">' + q.opcoes.map(function (o, n) {
                    return '<button class="alt-ex" data-n="' + n + '">' + esc(o) + '</button>';
                }).join('') + '</div>' +
                '<div class="jg-flash-resp" hidden></div>' +
                '</section>';
        }

        mesa.addEventListener('click', function (ev) {
            var botao = ev.target.closest ? ev.target.closest('.alt-ex') : null;
            if (botao && !botao.disabled) return responder(botao);
            if (ev.target.id === 'jg-adiante') adiante();
        });

        function responder(botao) {
            var q = perguntas[atual];
            var n = +botao.getAttribute('data-n');
            var acertou = n === q.certa;
            if (acertou) jogo.acertos++; else jogo.erros++;

            ui.qq('.alt-ex', mesa).forEach(function (a) {
                a.disabled = true;
                if (+a.getAttribute('data-n') === q.certa) a.classList.add('is-certa');
                else if (a === botao) a.classList.add('is-errada');
            });
            var resp = ui.q('.jg-flash-resp', mesa);
            resp.hidden = false;
            resp.innerHTML = '<p class="' + (acertou ? 'ex-ok' : 'ex-nao') + '">' +
                (acertou ? '✓ Certo.' : '✗ É: <b>' + esc(q.item.a) + '</b>') + '</p>' +
                linhaFonte(q.item) +
                '<button class="btn btn--forte btn--largo" id="jg-adiante">' +
                (atual + 1 >= perguntas.length ? 'Ver o resultado' : 'Próxima') + '</button>';
        }

        function adiante() {
            atual++;
            if (atual < perguntas.length) return pintarPergunta();
            mesa.innerHTML = '';
            placar(jogo.acertos + ' de ' + jogo.total);
            fim(gabarito(b));
        }
    }

    return { render: render, depois: depois };
})();
