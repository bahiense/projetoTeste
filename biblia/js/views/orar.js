/* =========================================================
   TELA ORAR — a oração do capítulo, sozinha.

   Estudo e oração são duas coisas. O estudo quer informação na tela:
   blocos, referências, teólogos, exercícios. A oração quer o
   contrário — uma coluna de texto, letra grande, nada em volta. Por
   isso ela tem tela própria em vez de um cartão no meio do estudo.

   Sem argumento, a tela é o acervo: as suas orações guardadas e as dos
   capítulos lidos hoje.
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.orar = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, bib = B.biblia;

    function alvoDe(arg) {
        var r = bib.interpretar(String(arg || ''));
        if (!r || !r.capitulo) return null;
        return { livro: r.livro, capitulo: r.capitulo, ref: r.livro.nome + ' ' + r.capitulo };
    }

    function render(arg) {
        var alvo = alvoDe(arg);
        if (!alvo) return renderAcervo();

        var enc = encodeURIComponent(alvo.ref);
        return '<header class="tela-topo tela-topo--orar">' +
            '<a class="voltar" href="#/orar">‹ orações</a>' +
            '<p class="olho">Oração</p>' +
            '<h2>' + esc(alvo.ref) + '</h2>' +
            '</header>' +
            '<div id="orar-corpo"><p class="carregando">Abrindo a oração…</p></div>' +
            '<div class="grupo-botoes grupo-botoes--dois orar-pe">' +
            '<a class="btn btn--fraco" href="#/ler/' + enc + '">📖 Ler o capítulo</a>' +
            '<a class="btn btn--fraco" href="#/estudo/' + enc + '">✦ O estudo</a>' +
            '</div>';
    }

    function renderAcervo() {
        var r = B.oracoes.resumo();
        return '<header class="tela-topo">' +
            '<h2>Orações</h2>' +
            '<p class="tela-sub">A oração que fecha o estudo de cada capítulo, aqui para ' +
            'ser orada — não para ser lida mais uma vez.</p>' +
            '</header>' +
            /* A busca primeiro: quem chega aqui com um assunto na
               cabeça ("preciso orar sobre medo") não quer rolar lista. */
            '<section class="cartao" id="orar-busca">' +
            '<h3>Procurar por assunto</h3>' +
            '<p class="dica" id="busca-conta">Procurando nas orações dos estudos…</p>' +
            '<input class="campo" id="busca-oracao" type="search" ' +
            'placeholder="perdão, medo, família, trabalho…" ' +
            'autocomplete="off" spellcheck="false">' +
            '<div class="ferr-grupo" id="busca-assuntos"></div>' +
            '<div id="busca-resultado"></div>' +
            '</section>' +

            '<div id="orar-hoje"></div>' +
            '<div id="orar-guardadas"></div>' +
            '<section class="cartao">' +
            '<p class="dica">Toda oração sai do estudo completo do capítulo. ' +
            esc(B.oracoes.AVISO) + '</p>' +
            '</section>';
    }

    /* ---------- a oração ---------- */

    function depois(el, arg) {
        var alvo = alvoDe(arg);
        if (!alvo) return montarAcervo(el);

        var caixa = ui.$('orar-corpo');
        B.oracoes.doCapitulo(alvo.ref).then(function (texto) {
            if (!texto) { caixa.innerHTML = semOracao(alvo); return; }
            pintar(caixa, alvo, texto);
        }, function () { caixa.innerHTML = semOracao(alvo); });
    }

    function semOracao(alvo) {
        return '<section class="cartao">' +
            '<p class="dica"><b>Este capítulo ainda não tem oração.</b> Ela vem no estudo ' +
            'completo — quando o estudo de ' + esc(alvo.ref) + ' chegar, a oração aparece ' +
            'aqui.</p></section>';
    }

    function pintar(caixa, alvo, texto) {
        var guardada = B.oracoes.estaGuardada(alvo.ref);

        caixa.innerHTML =
            '<article class="oracao">' + esc(texto).replace(/\n{2,}/g, '</p><p>')
                .replace(/\n/g, '<br>').replace(/^/, '<p>').replace(/$/, '</p>') +
            '</article>' +
            '<div class="orar-acoes">' +
            '<button class="btn ' + (guardada ? 'btn--feito' : 'btn--fraco') + ' btn--largo" ' +
            'data-guardar>' +
            (guardada ? '★ Nas suas orações' : '☆ Guardar esta oração') + '</button>' +
            '</div>' +
            '<p class="dica orar-nota">' + esc(B.oracoes.AVISO) + '</p>';

        ui.q('[data-guardar]', caixa).addEventListener('click', function () {
            var entrou = B.oracoes.guardar(alvo.ref);
            ui.toast(entrou ? 'Guardada nas suas orações.' : 'Saiu das suas orações.');
            pintar(caixa, alvo, texto);
        });
    }

    /* ---------- o acervo ---------- */

    function montarAcervo(el) {
        /* O que foi lido hoje — e, enquanto não houver nada lido, o que o
           plano tem para hoje: orar antes de ler também é ler. */
        var lidos = [];
        bib.GRUPOS.forEach(function (g) {
            B.plano.lidosHoje(g.id).forEach(function (h) { lidos.push(h.ref); });
        });
        var titulo = 'Dos capítulos lidos hoje';
        if (!lidos.length) {
            titulo = 'Da leitura de hoje';
            bib.GRUPOS.forEach(function (g) {
                var a = B.plano.leituraAtual(g.id);
                if (a && a.ref) lidos.push(a.ref);
            });
        }

        pintarLista('orar-hoje', titulo, lidos.slice(0, 8),
            'Marque a leitura de um capítulo e a oração dele aparece aqui.');
        pintarLista('orar-guardadas', 'As suas orações', B.oracoes.guardadas(),
            'Nenhuma guardada ainda. Dentro de uma oração, toque em <b>Guardar</b> e ela ' +
            'fica nesta lista — e vai no backup, como o resto.');

        ligarBusca();
    }

    /* ---------- procurar por assunto ---------- */

    var assuntoAtual = '';

    function ligarBusca() {
        var campo = ui.$('busca-oracao');
        var chips = ui.$('busca-assuntos');
        if (!campo || !chips) return;

        B.oracoes.quantas().then(function (n) {
            var conta = ui.$('busca-conta');
            if (!conta) return;
            conta.innerHTML = n
                ? 'Procura no texto de <b>' + n + ' orações</b> que vêm no app, e também ' +
                  'nas que chegaram nos seus pacotes. Toque num assunto ou escreva uma ' +
                  'palavra.'
                : 'O índice de busca não está neste aparelho, mas as orações que você ' +
                  'importou continuam sendo procuradas.';
        });

        B.oracoes.assuntos().then(function (lista) {
            chips.innerHTML = lista.map(function (a) {
                return '<button class="btn btn--mini" data-assunto="' + esc(a.id) + '">' +
                    esc(a.nome) + ' <span class="dica">' + a.n + '</span></button>';
            }).join('');
        });

        chips.addEventListener('click', function (ev) {
            var b = ev.target.closest ? ev.target.closest('[data-assunto]') : null;
            if (!b) return;
            var id = b.getAttribute('data-assunto');
            assuntoAtual = assuntoAtual === id ? '' : id;
            ui.qq('[data-assunto]', chips).forEach(function (o) {
                o.classList.toggle('is-on', o.getAttribute('data-assunto') === assuntoAtual);
            });
            procurar();
        });

        var espera = null;
        campo.addEventListener('input', function () {
            clearTimeout(espera);
            espera = setTimeout(procurar, 220);
        });
    }

    function procurar() {
        var campo = ui.$('busca-oracao');
        var vao = ui.$('busca-resultado');
        if (!campo || !vao) return;
        var texto = campo.value.trim();

        if (!texto && !assuntoAtual) { vao.innerHTML = ''; return; }
        vao.innerHTML = '<p class="carregando">Procurando…</p>';

        B.oracoes.buscar(texto, assuntoAtual).then(function (achados) {
            if (!achados.length) {
                vao.innerHTML = '<p class="dica">Nenhuma oração com isso. ' +
                    'Tente uma palavra mais comum — a busca é no texto das orações, ' +
                    'não numa lista de temas feita à mão.</p>';
                return;
            }
            /* Doze por vez: resultado em lista longa empurra o resto da
               tela para baixo, e ninguém lê quarenta orações de uma vez. */
            var quantos = 12;

            function pintar() {
                var mostra = achados.slice(0, quantos);
                vao.innerHTML = '<p class="dica">' + achados.length + ' oraç' +
                    (achados.length === 1 ? 'ão' : 'ões') +
                    (achados.length > mostra.length
                        ? ' · mostrando ' + mostra.length : '') + '</p>' +
                    '<div class="orar-lista">' +
                    mostra.map(function (x) {
                        return '<a class="orar-item" href="#/orar/' +
                            encodeURIComponent(x.ref) + '">' +
                            '<span class="orar-item-txt"><b>' + esc(x.ref) + '</b>' +
                            (x.seu ? ' <span class="dica">(sua)</span>' : '') +
                            '<small>' + esc(x.trecho) + '…</small></span>' +
                            '<span class="estudo-seta">›</span></a>';
                    }).join('') + '</div>' +
                    (achados.length > mostra.length
                        ? '<button class="btn btn--fraco btn--largo" data-mais>' +
                          'Mostrar mais ' +
                          Math.min(12, achados.length - mostra.length) + '</button>'
                        : '');
                var mais = ui.q('[data-mais]', vao);
                if (mais) mais.addEventListener('click', function () {
                    quantos += 12;
                    pintar();
                });
            }
            pintar();
        }, function () {
            vao.innerHTML = '<p class="dica">Não deu para procurar agora.</p>';
        });
    }

    function pintarLista(id, titulo, refs, vazio) {
        var caixa = ui.$(id);
        if (!caixa) return;
        if (!refs.length) {
            caixa.innerHTML = '<h3 class="secao">' + esc(titulo) + '</h3>' +
                '<p class="dica">' + vazio + '</p>';
            return;
        }
        caixa.innerHTML = '<h3 class="secao">' + esc(titulo) + ' <small>' + refs.length +
            '</small></h3><div class="orar-lista">' +
            refs.map(function (ref) {
                return '<a class="orar-item" href="#/orar/' + encodeURIComponent(ref) + '">' +
                    '<span class="orar-item-txt"><b>' + esc(ref) + '</b></span>' +
                    '<span class="estudo-seta">›</span></a>';
            }).join('') + '</div>';
    }

    return { render: render, depois: depois };
})();
