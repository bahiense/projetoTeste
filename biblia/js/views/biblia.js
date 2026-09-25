/* =========================================================
   TELA BÍBLIA — o mapa dos 1.189 capítulos e a importação.

   É aqui que entra a leitura de antes do app. Quem lê a Bíblia há
   vinte anos não começa do zero, e um app que obriga a começar do
   zero é um app que mente sobre a vida da pessoa.

   Três caminhos para dizer o que já foi lido: o backup do app
   antigo, uma lista colada ("Gênesis 1-50, Salmos") e o dedo no
   mapa, capítulo por capítulo.
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.biblia = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, bib = B.biblia, store = B.store;

    var aberto = {};   // livros com a grade de capítulos aberta

    function render() {
        var pb = B.plano.progressoBiblia();
        return '' +
            '<header class="tela-topo">' +
            '<h2>A Bíblia inteira</h2>' +
            '<p class="tela-sub"><b>' + pb.lidos + '</b> de ' + pb.total + ' capítulos ' +
            'registrados como lidos — ' + pb.pct + '%.</p>' +
            ui.barra(pb.pct) +
            '</header>' +

            '<div class="cartao cartao--importar">' +
            '<h3>Já leu antes de instalar o app?</h3>' +
            '<p class="dica">Registre aqui. Isto não mexe no plano diário: só diz o que ' +
            'você já leu na vida, e é daí que sai a porcentagem acima.</p>' +
            '<div class="importar-botoes">' +
            '<button class="btn btn--forte" data-imp-arquivo>Backup do app antigo</button>' +
            '<button class="btn btn--forte" data-imp-lista>Colar uma lista</button>' +
            '<button class="btn btn--fraco" data-alinhar>Alinhar o plano</button>' +
            '</div>' +
            '<input type="file" id="arquivo" accept=".json,application/json" hidden>' +
            '</div>' +

            '<div id="mapa">' + bib.GRUPOS.map(grupo).join('') + '</div>';
    }

    function grupo(g) {
        var lidos = store.lidosNoGrupo(g.id);
        var total = bib.capsDoGrupo(g.id);
        var pct = Math.round((lidos / total) * 100);
        return '<section class="cartao grupo-mapa">' +
            '<header class="grupo-topo">' +
            '<span class="grupo-icone">' + g.icone + '</span>' +
            '<div class="grupo-nome"><b>' + esc(g.nome) + '</b>' +
            '<small>' + lidos + ' de ' + total + ' capítulos · ' + pct + '%</small></div>' +
            '</header>' +
            ui.barra(pct) +
            '<div class="livros">' + g.livros.map(livro).join('') + '</div>' +
            '</section>';
    }

    function livro(l) {
        var lidos = store.lidosNoLivro(l.nome);
        var completo = lidos >= l.caps;
        var estaAberto = !!aberto[l.nome];
        return '<div class="livro' + (completo ? ' is-completo' : '') +
            (lidos && !completo ? ' is-parcial' : '') + '" data-livro="' + esc(l.nome) + '">' +
            '<button class="livro-linha" data-abrir="' + esc(l.nome) + '">' +
            '<span class="livro-nome">' + esc(l.nome) + '</span>' +
            '<span class="livro-conta">' + lidos + '/' + l.caps + '</span>' +
            '<span class="livro-seta">' + (estaAberto ? '▾' : '▸') + '</span>' +
            '</button>' +
            (estaAberto ? grade(l) : '') +
            '</div>';
    }

    function grade(l) {
        var caps = '';
        for (var c = 1; c <= l.caps; c++) {
            caps += '<button class="cap' + (store.leu(l.nome, c) ? ' is-on' : '') +
                '" data-cap="' + c + '" data-de="' + esc(l.nome) + '">' + c + '</button>';
        }
        return '<div class="grade">' +
            '<div class="grade-acoes">' +
            '<button class="btn btn--mini" data-tudo="' + esc(l.nome) + '">Marcar tudo</button>' +
            '<button class="btn btn--mini" data-ate="' + esc(l.nome) + '">Li até o capítulo…</button>' +
            '<button class="btn btn--mini btn--perigo" data-nada="' + esc(l.nome) + '">Limpar</button>' +
            '</div>' +
            '<div class="grade-caps">' + caps + '</div>' +
            '</div>';
    }

    /* Redesenha só o livro mexido: a tela inteira tem 1.189 botões e
       repintar tudo a cada toque trava o celular. */
    function repintarLivro(nome) {
        var el = achar(nome);
        if (!el) return;
        el.outerHTML = livro(bib.livro(nome));
        ligarLivro(achar(nome));
        repintarTopo();
    }

    function achar(nome) {
        return ui.qq('[data-livro]').filter(function (e) {
            return e.getAttribute('data-livro') === nome;
        })[0] || null;
    }

    function repintarTopo() {
        var pb = B.plano.progressoBiblia();
        var topo = ui.q('.tela-topo .tela-sub');
        if (topo) {
            topo.innerHTML = '<b>' + pb.lidos + '</b> de ' + pb.total +
                ' capítulos registrados como lidos — ' + pb.pct + '%.';
        }
        var barra = ui.q('.tela-topo .barra i');
        if (barra) barra.style.width = pb.pct + '%';
        ui.qq('.grupo-mapa').forEach(function (sec, i) {
            var g = bib.GRUPOS[i];
            var lidos = store.lidosNoGrupo(g.id), total = bib.capsDoGrupo(g.id);
            var pct = Math.round((lidos / total) * 100);
            var s = ui.q('.grupo-nome small', sec);
            if (s) s.textContent = lidos + ' de ' + total + ' capítulos · ' + pct + '%';
            var b = ui.q('.barra i', sec);
            if (b) b.style.width = pct + '%';
        });
        B.app.cabecalho();
    }

    function ligarLivro(el) {
        if (!el) return;
        var abrir = ui.q('[data-abrir]', el);
        abrir.addEventListener('click', function () {
            var nome = abrir.getAttribute('data-abrir');
            aberto[nome] = !aberto[nome];
            repintarLivro(nome);
        });

        ui.qq('[data-cap]', el).forEach(function (b) {
            b.addEventListener('click', function () {
                var nome = b.getAttribute('data-de');
                var c = parseInt(b.getAttribute('data-cap'), 10);
                var novo = !store.leu(nome, c);
                store.marcar(nome, c, novo);
                store.salvar();
                b.classList.toggle('is-on', novo);
                var conta = ui.q('.livro-conta', el);
                if (conta) conta.textContent = store.lidosNoLivro(nome) + '/' + bib.livro(nome).caps;
                repintarTopo();
            });
        });

        var t = ui.q('[data-tudo]', el);
        if (t) t.addEventListener('click', function () {
            var nome = t.getAttribute('data-tudo');
            store.marcarFaixa(nome, 1, bib.livro(nome).caps, true);
            store.salvar();
            repintarLivro(nome);
            ui.toast(nome + ' inteiro marcado como lido.');
        });

        var n = ui.q('[data-nada]', el);
        if (n) n.addEventListener('click', function () {
            var nome = n.getAttribute('data-nada');
            ui.confirmar('Limpar ' + nome,
                'Apagar o registro de leitura de ' + nome + '? O plano diário não muda.',
                { textoOk: 'Limpar', perigo: true }).then(function (ok) {
                    if (!ok) return;
                    store.marcarFaixa(nome, 1, bib.livro(nome).caps, false);
                    store.salvar();
                    repintarLivro(nome);
                });
        });

        var a = ui.q('[data-ate]', el);
        if (a) a.addEventListener('click', function () {
            var nome = a.getAttribute('data-ate');
            var l = bib.livro(nome);
            var valor = Math.max(1, store.lidosNoLivro(nome) || 1);
            ui.modal({
                titulo: 'Li até o capítulo…',
                html: '<p class="dica">Marca do capítulo 1 até o que você escolher, em ' +
                    esc(nome) + '.</p>' +
                    '<div class="passo">' +
                    '<button class="btn btn--fraco" id="ate-menos">−</button>' +
                    '<div class="passo-num"><b id="ate-num">' + valor + '</b>' +
                    '<small>de ' + l.caps + '</small></div>' +
                    '<button class="btn btn--fraco" id="ate-mais">+</button>' +
                    '</div>' +
                    '<input class="campo" id="ate-faixa" type="range" min="1" max="' + l.caps +
                    '" value="' + valor + '">',
                textoOk: 'Marcar',
                aoAbrir: function (corpo) {
                    var num = corpo.querySelector('#ate-num');
                    var faixa = corpo.querySelector('#ate-faixa');
                    function por(v) {
                        valor = Math.min(l.caps, Math.max(1, v));
                        num.textContent = valor;
                        faixa.value = valor;
                    }
                    corpo.querySelector('#ate-menos').onclick = function () { por(valor - 1); };
                    corpo.querySelector('#ate-mais').onclick = function () { por(valor + 1); };
                    faixa.oninput = function () { por(parseInt(faixa.value, 10)); };
                }
            }).then(function (ok) {
                if (!ok) return;
                store.marcarFaixa(nome, 1, valor, true);
                store.salvar();
                repintarLivro(nome);
                ui.toast(nome + ' 1–' + valor + ' marcado.');
            });
        });
    }

    function depois(el) {
        ui.qq('[data-livro]', el).forEach(ligarLivro);

        ui.q('[data-imp-arquivo]', el).addEventListener('click', function () {
            ui.$('arquivo').click();
        });
        ui.$('arquivo').addEventListener('change', function (ev) {
            var f = ev.target.files && ev.target.files[0];
            ev.target.value = '';
            if (f) lerArquivo(f);
        });

        ui.q('[data-imp-lista]', el).addEventListener('click', colarLista);

        ui.q('[data-alinhar]', el).addEventListener('click', function () {
            ui.confirmar('Alinhar o plano',
                'Cada grupo passa a apontar para o primeiro capítulo que você ainda não leu. ' +
                'É o que faz sentido depois de importar leitura antiga.',
                { textoOk: 'Alinhar' }).then(function (ok) {
                    if (!ok) return;
                    var mudou = B.plano.alinharComLeitura();
                    ui.modal({
                        titulo: 'Plano alinhado',
                        cancelar: false, textoOk: 'Pronto',
                        html: mudou.length
                            ? '<ul class="lista-seta">' + mudou.map(function (m) {
                                return '<li><b>' + esc(m.grupo) + '</b>: ' + esc(m.ref) + '</li>';
                            }).join('') + '</ul>'
                            : '<p>Nada mudou: o plano já estava no primeiro capítulo não lido de cada grupo.</p>'
                    });
                });
        });
    }

    /* ---------- importação por arquivo ---------- */

    function lerArquivo(f) {
        B.copia.deArquivo(f);
    }

    /* ---------- importação por lista colada ---------- */

    function colarLista() {
        ui.modal({
            titulo: 'Colar uma lista',
            html: '<p class="dica">Escreva o que já leu, separado por vírgula. Entende ' +
                'nome inteiro, abreviação e intervalo:</p>' +
                '<p class="exemplo">Gênesis 1-50, Êxodo 1-20, Salmos, Jo 1-10, 1co</p>' +
                '<textarea class="campo campo--texto" id="lista" rows="5" ' +
                'placeholder="Gênesis 1-50, Salmos, Mateus 1-12"></textarea>' +
                '<p class="dica">Livro sem número quer dizer o livro inteiro.</p>',
            textoOk: 'Conferir'
        }).then(function (ok) {
            if (!ok) return;
            var texto = (ui.$('lista').value || '').trim();
            if (!texto) return;
            var r = store.interpretarLista(texto);
            if (!r.achados.length) {
                return ui.toast('Não reconheci nenhum livro nessa lista.', 'erro');
            }
            var caps = r.achados.reduce(function (t, a) {
                return t + (Math.min(a.livro.caps, a.ate) - Math.max(1, a.de) + 1);
            }, 0);

            ui.modal({
                titulo: 'Conferir',
                html: '<ul class="resumo">' + r.achados.map(function (a) {
                    var todo = a.de <= 1 && a.ate >= a.livro.caps;
                    return '<li><b>' + esc(a.livro.nome) + '</b> ' +
                        (todo ? 'inteiro (' + a.livro.caps + ' capítulos)' : a.de + '–' + a.ate) + '</li>';
                }).join('') + '</ul>' +
                    (r.erros.length
                        ? '<p class="aviso">Não entendi: ' + esc(r.erros.join(', ')) + '</p>'
                        : '') +
                    '<p class="dica">' + caps + ' capítulos serão marcados como lidos. ' +
                    'Isto soma ao que já existe, não apaga nada.</p>',
                textoOk: 'Marcar'
            }).then(function (ok2) {
                if (!ok2) return;
                var n = store.aplicarLista(r.achados);
                B.app.pintar();
                ui.toast(n + ' capítulos novos marcados.');
            });
        });
    }

    return { render: render, depois: depois };
})();
