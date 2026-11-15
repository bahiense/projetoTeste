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
            '<a class="cartao orar-porta" href="#/escola">' +
            '<span class="jg-porta-icone">🕊</span>' +
            '<span class="jg-porta-txt"><b>Escola de oração</b>' +
            '<small>Aprender a orar em público com as orações da Bíblia — não com estas, ' +
            'que são escritas por IA</small>' +
            '</span>' +
            '<span class="estudo-seta">›</span></a>' +

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
