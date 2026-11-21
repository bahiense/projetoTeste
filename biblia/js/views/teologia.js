/* =========================================================
   Teologia reformada ligada a um capítulo da Bíblia.

   As confissões e catecismos reformados citam, em cada afirmação, os
   textos que a sustentam. Virando essas citações, cada capítulo passa a
   saber quais doutrinas se apoiam nele — sem IA, sem rede, sem custo.

   O limite é honesto e fica na tela: só aparece o que essas obras de
   fato citam. Capítulo que nenhuma delas cita mostra isso, em vez de
   uma ligação inventada.
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.teologia = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, bib = B.biblia;

    function nomeDe(usfm) {
        var l = bib.LIVROS.filter(function (x) { return x.usfm === usfm; })[0];
        return l ? l.nome : usfm;
    }

    function referencia(r) {
        return nomeDe(r.u) + ' ' + r.c + (r.v ? '.' + r.v : '');
    }

    function render(arg) {
        if (!arg) {
            return renderPortal();
        }
        var alvo = bib.interpretar(arg);
        if (!alvo || !alvo.livro || !alvo.capitulo) {
            return '<header class="tela-topo"><h2>Teologia reformada</h2></header>' +
                '<div class="vazio"><p>Não reconheci esse capítulo.</p></div>';
        }

        var titulo = alvo.livro.nome + ' ' + alvo.capitulo;
        var temas = B.doutrina.temas(alvo.livro.usfm, alvo.capitulo);

        /* Agrupado por obra: cinco pontos do Catecismo Maior misturados
           com dois da Confissão viram uma lista sem forma. */
        var porObra = [];
        temas.forEach(function (t, i) {
            var g = porObra.filter(function (x) { return x.obra === t.obra; })[0];
            if (!g) { g = { obra: t.obra, itens: [] }; porObra.push(g); }
            g.itens.push({ t: t, par: B.doutrina.PORCAPITULO[alvo.livro.usfm + ' ' +
                alvo.capitulo][i] });
        });

        return '' +
            '<header class="tela-topo">' +
            '<a class="voltar" href="#/estudo/' + encodeURIComponent(titulo) + '">‹ estudo</a>' +
            '<h2>Teologia reformada</h2>' +
            '<p class="tela-sub">O que as confissões reformadas apoiam em <b>' +
            esc(titulo) + '</b> · <a href="#/teologia">Ver os 6 Símbolos de Fé ›</a></p>' +
            '</header>' +

            (temas.length
                ? '<p class="dica">' + temas.length + ' ponto' + (temas.length === 1 ? '' : 's') +
                ' cita' + (temas.length === 1 ? '' : 'm') + ' este capítulo como prova. ' +
                'Toque para ler.</p>' +
                porObra.map(grupo).join('')
                : semNada());
    }

    function renderPortal() {
        var obras = (B.doutrina && B.doutrina.OBRAS) ? B.doutrina.OBRAS : [];
        var totalItens = 0;
        obras.forEach(function (o) { totalItens += (o.itens ? o.itens.length : 0); });

        return '<header class="tela-topo">' +
            '<a class="voltar" href="#/estudo">‹ estudo</a>' +
            '<h2>🏛️ Símbolos de Fé Reformados</h2>' +
            '<p class="tela-sub">' + obras.length + ' Confissões e Catecismos históricos · ' +
            totalItens + ' artigos e perguntas com textos-prova clicáveis</p>' +
            '</header>' +
            '<div class="busca">' +
            '<input class="campo" id="busca-teologia" type="search" autocomplete="off" ' +
            'placeholder="Buscar doutrina: Trindade, Providência, Justificação, Ceia, Batismo, Lei…">' +
            '</div>' +
            '<div class="prosa-sumario" id="abas-obras-teologia">' +
            '<button type="button" class="sumario-chip is-on" data-obra-idx="todas">Todas (' + totalItens + ')</button>' +
            obras.map(function (o, idx) {
                return '<button type="button" class="sumario-chip" data-obra-idx="' + idx + '">' +
                    esc(o.curto || o.nome) + ' (' + (o.itens ? o.itens.length : 0) + ')</button>';
            }).join('') +
            '</div>' +
            '<div id="corpo-portal-teologia"></div>';
    }

    function normalizarTexto(s) {
        return String(s || '')
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    function depois(el, arg) {
        if (arg) return;
        var obras = (B.doutrina && B.doutrina.OBRAS) ? B.doutrina.OBRAS : [];
        var campo = ui.$('busca-teologia');
        var abas = ui.$('abas-obras-teologia');
        var corpo = ui.$('corpo-portal-teologia');
        if (!corpo) return;

        var obraAtiva = 'todas';

        function pintarPortal() {
            var q = normalizarTexto(campo ? campo.value : '');
            var gruposHtml = [];
            var totalAchados = 0;

            obras.forEach(function (o, idxObra) {
                if (obraAtiva !== 'todas' && String(idxObra) !== String(obraAtiva)) return;
                var itensFiltrados = [];
                (o.itens || []).forEach(function (it, idxItem) {
                    if (q) {
                        var textoAlvo = normalizarTexto(it.m + ' ' + it.t + ' ' + it.x);
                        if (textoAlvo.indexOf(q) < 0) return;
                    }
                    itensFiltrados.push({
                        t: { obra: o, item: it, marca: o.curto + ' ' + it.m },
                        par: [idxObra, idxItem]
                    });
                });
                if (!itensFiltrados.length) return;
                totalAchados += itensFiltrados.length;
                var limite = (q || obraAtiva !== 'todas') ? 200 : 25;
                var fatia = itensFiltrados.slice(0, limite);
                var mais = itensFiltrados.length > limite
                    ? '<p class="dica">Mostrando ' + limite + ' de ' + itensFiltrados.length +
                      ' itens desta obra. Selecione a aba "' + esc(o.curto || o.nome) + '" acima ou digite na busca para ver todos.</p>'
                    : '';
                gruposHtml.push(
                    '<h3 class="secao">' + esc(o.nome) + ' <small>(' + o.ano + ' · ' + itensFiltrados.length + ' itens)</small></h3>' +
                    fatia.map(function (x) { return cartao(x.t, x.par); }).join('') +
                    mais +
                    '<p class="dica dica--honesta">' + esc(o.credito) + (o.nota ? ' ' + esc(o.nota) : '') + '</p>'
                );
            });

            if (!gruposHtml.length) {
                corpo.innerHTML = '<div class="vazio"><p>Nenhum artigo ou pergunta encontrado para "' +
                    esc(campo ? campo.value : '') + '".</p></div>';
                return;
            }
            corpo.innerHTML = (q ? '<p class="dica">' + totalAchados + ' resultado' + (totalAchados === 1 ? '' : 's') + ' encontrado' + (totalAchados === 1 ? '' : 's') + '.</p>' : '') +
                gruposHtml.join('');
        }

        if (campo) campo.addEventListener('input', pintarPortal);
        if (abas) {
            ui.qq('[data-obra-idx]', abas).forEach(function (btn) {
                btn.addEventListener('click', function () {
                    obraAtiva = btn.getAttribute('data-obra-idx');
                    ui.qq('[data-obra-idx]', abas).forEach(function (b) {
                        b.classList.toggle('is-on', b === btn);
                    });
                    pintarPortal();
                });
            });
        }
        pintarPortal();
    }

    function semNada() {
        return '<div class="vazio">' +
            '<div class="vazio-icone">◌</div>' +
            '<p>Nenhuma destas obras cita este capítulo.</p>' +
            '<p class="dica">Elas não cobrem a Bíblia inteira: dos 1.189 capítulos, citam ' +
            B.doutrina.quantos() + '. Preferi deixar vazio a inventar uma ligação que ' +
            'nenhuma delas faz.</p>' +
            '</div>' +
            '<p class="dica dica--honesta">' +
            B.doutrina.OBRAS.map(function (o) { return esc(o.nome); }).join(' · ') + '</p>';
    }

    function grupo(g) {
        return '<h3 class="secao">' + esc(g.obra.nome) + '</h3>' +
            g.itens.map(function (x) { return cartao(x.t, x.par); }).join('') +
            '<p class="dica dica--honesta">' + esc(g.obra.credito) +
            (g.obra.nota ? ' ' + esc(g.obra.nota) : '') + '</p>';
    }

    /* Cada tema abre no lugar: são textos curtos, e trocar de tela para
       ler três parágrafos cansa. */
    function cartao(t, par) {
        var refs = B.doutrina.citados(par);
        var ehPergunta = t.obra.id !== 'wcf';

        return '<details class="cartao tema">' +
            '<summary><b>' + esc(t.item.t) + '</b>' +
            '<small>' + esc(t.marca) + '</small></summary>' +

            '<p class="tema-texto">' + esc(t.item.x) + '</p>' +

            (refs.length
                ? '<p class="rotulo">' + (ehPergunta ? 'Textos citados' : 'Textos que a sustentam') +
                '</p><ul class="tema-refs">' + refs.map(function (r) {
                    var nome = nomeDe(r.u) + ' ' + r.c;
                    return '<li><a href="#/teologia/' + encodeURIComponent(nome) + '">' +
                        esc(referencia(r)) + '</a></li>';
                }).join('') + '</ul>'
                : '<p class="dica">Esta resposta não traz referências bíblicas.</p>') +
            '</details>';
    }

    return { render: render, depois: depois };
})();
