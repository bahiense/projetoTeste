/* =========================================================
   TELA LEITURA — o capítulo, para ler dentro do app.

   O texto é a Almeida de 1911, em domínio público (ver js/texto.js).
   Quem quer a NVI tem, no rodapé, o botão que abre o mesmo capítulo no
   app da Bible.com — ela é licenciada e não pode ser embutida aqui.

   A tela é de leitura: pouca coisa na frente do texto, tudo que é ação
   fica no fim, onde a pessoa chega depois de ler.
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.ler = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, bib = B.biblia, store = B.store, plano = B.plano;

    function render(ref) {
        var alvo = bib.interpretar(ref);
        if (!alvo) {
            return '<header class="tela-topo"><h2>Não encontrei</h2>' +
                '<p class="tela-sub">"' + esc(ref) + '" não bate com nenhum capítulo.</p></header>' +
                '<p><a class="btn btn--forte" href="#/hoje">Voltar</a></p>';
        }
        var cap = alvo.capitulo || 1;
        return '<div id="leitura" data-livro="' + esc(alvo.livro.nome) + '" data-cap="' + cap + '">' +
            '<p class="carregando">Abrindo ' + esc(alvo.livro.nome + ' ' + cap) + '…</p></div>';
    }

    /* Capítulo anterior e seguinte, atravessando os livros na ordem
       canônica: quem termina Gênesis 50 quer Êxodo 1, não um beco. */
    function vizinho(livro, cap, passo) {
        var c = cap + passo;
        if (c >= 1 && c <= livro.caps) return { livro: livro, cap: c };
        var i = livro.ordem + passo;
        if (i < 0 || i >= bib.LIVROS.length) return null;
        var outro = bib.LIVROS[i];
        return { livro: outro, cap: passo > 0 ? 1 : outro.caps };
    }

    function depois(el, arg) {
        var caixa = ui.$('leitura');
        if (!caixa) return;
        var nomeLivro = caixa.getAttribute('data-livro');
        var cap = parseInt(caixa.getAttribute('data-cap'), 10);
        var livro = bib.livro(nomeLivro);

        B.texto.capitulo(nomeLivro, cap).then(function (versiculos) {
            pintar(caixa, livro, cap, versiculos);
        }, function (err) {
            caixa.innerHTML = cabecalho(livro, cap) +
                '<div class="aviso aviso--erro">' + esc(err.message) + '</div>' +
                '<a class="btn btn--forte btn--largo" href="' + esc(bib.linkNVI(livro, cap)) +
                '" target="_blank" rel="noopener">Ler em outras versões (Bible.com)</a>';
        });
    }

    function cabecalho(livro, cap) {
        var g = bib.grupo(livro.grupo);
        return '<header class="tela-topo tela-topo--leitura">' +
            '<a class="voltar" href="#/hoje">‹ hoje</a>' +
            '<h2>' + esc(livro.nome) + ' ' + cap + '</h2>' +
            '<p class="tela-sub">' + g.icone + ' ' + esc(g.nome) +
            ' · capítulo ' + cap + ' de ' + livro.caps + '</p>' +
            '</header>';
    }

    function pintar(caixa, livro, cap, versiculos) {
        var hoje = plano.leuHoje(livro.nome, cap);
        var ant = vizinho(livro, cap, -1);
        var prox = vizinho(livro, cap, 1);
        var fonte = store.get().config.fonte || 17;

        caixa.innerHTML = cabecalho(livro, cap) +

            '<div class="leitura-ferramentas">' +
            '<div class="leitura-ferr-linha-topo">' +
            '<span class="ferr-grupo">' +
            '<button class="btn btn--mini" data-fonte="-1" aria-label="Diminuir a letra">A−</button>' +
            '<button class="btn btn--mini" data-fonte="1" aria-label="Aumentar a letra">A+</button>' +
            '</span>' +
            '<button class="btn ' + (hoje ? 'btn--feito' : 'btn--forte') + ' btn--marcar-topo" data-ler' +
            (hoje ? ' aria-label="Lido hoje. Tocar desfaz o registro de hoje."' : '') + '>' +
            (hoje ? '✓ Leitura de hoje registrada' : '✓ Marcar leitura de hoje') + '</button>' +
            '</div>' +
            '<div class="grupo-botoes grupo-botoes--dois leitura-ferr-acoes">' +
            '<a class="btn btn--fraco" href="' + esc(bib.linkNVI(livro, cap)) + '" ' +
            'target="_blank" rel="noopener">Ler em outras versões</a>' +
            '<a class="btn btn--estudo" href="#/estudo/' + encodeURIComponent(livro.nome + ' ' + cap) +
            '">✦ Estudar</a>' +
            '</div>' +
            '</div>' +

            '<article class="texto" id="texto" style="font-size:' + fonte + 'px">' +
            versiculos.map(function (v, i) {
                return '<p class="v" data-v="' + (i + 1) + '"><span class="vn">' + (i + 1) + '</span>' + esc(v) + '</p>';
            }).join('') +
            '</article>' +

            '<section class="cartao leitura-fecho">' +
            '<div class="leitura-fecho-topo">' +
            '<b>Fim de ' + esc(livro.nome + ' ' + cap) + '</b>' +
            '<small>Toque em qualquer versículo acima para destacá-lo durante a leitura.</small>' +
            '</div>' +
            '<div class="leitura-fecho-acoes">' +
            '<button class="btn ' + (hoje ? 'btn--feito' : 'btn--forte') + ' btn--largo" data-ler-fim>' +
            (hoje ? '✓ Leitura de hoje registrada' : '✓ Marcar leitura de hoje') + '</button>' +
            '<div class="grupo-botoes grupo-botoes--dois">' +
            '<a class="btn btn--fraco" href="' + esc(bib.linkNVI(livro, cap)) + '" target="_blank" rel="noopener">Ler em outras versões</a>' +
            '<a class="btn btn--estudo" href="#/estudo/' + encodeURIComponent(livro.nome + ' ' + cap) +
            '">✦ Estudar</a>' +
            '</div>' +
            '</div>' +
            '</section>' +

            '<div class="creditos">' +
            '<b>' + esc(B.texto.edicao().nome) + '</b> · ' + esc(B.texto.edicao().credito) + ' ' +
            ui.ajuda('Ler em outras versões',
                '<p>A NVI, como a ARA, a NAA e a ACF, é <b>texto licenciado</b>: os direitos ' +
                'são da editora, e embutir os 31 mil versículos dela dentro de um app seria ' +
                'violação de direito autoral — mesmo num app pessoal, sem cobrar nada.</p>' +
                '<p>A Almeida de <b>1911</b> é a tradução mais recente em português que já ' +
                'entrou em domínio público. É ela que está aqui: dá para ler offline, de ' +
                'graça, sem depender de ninguém.</p>' +
                '<p>Para ler o mesmo capítulo <b>em outras versões (NVI, ARA, NAA, etc.)</b>, use o botão no topo: ele abre o ' +
                'app da Bible.com (ou o site), onde essas versões são gratuitas e licenciadas como devem ser.</p>') +
            '<br>' + esc(B.texto.edicao().aviso) +
            ' <button class="btn-link" data-trocar-edicao>' +
            (B.texto.edicaoAtual() === '1911'
                ? 'Ler com ortografia atualizada'
                : 'Voltar ao texto original de 1911') + '</button>' +
            '</div>' +

            '<nav class="paginacao">' +
            (ant
                ? '<a class="btn btn--fraco" href="#/ler/' +
                encodeURIComponent(ant.livro.nome + ' ' + ant.cap) + '">‹ ' +
                esc(ant.livro.nome + ' ' + ant.cap) + '</a>'
                : '<span></span>') +
            (prox
                ? '<a class="btn btn--fraco" href="#/ler/' +
                encodeURIComponent(prox.livro.nome + ' ' + prox.cap) + '">' +
                esc(prox.livro.nome + ' ' + prox.cap) + ' ›</a>'
                : '<span></span>') +
            '</nav>';

        ui.qq('[data-fonte]', caixa).forEach(function (b) {
            b.addEventListener('click', function () {
                var passo = parseInt(b.getAttribute('data-fonte'), 10);
                var nova = Math.min(26, Math.max(14, (store.get().config.fonte || 17) + passo));
                store.setConfig('fonte', nova);
                ui.$('texto').style.fontSize = nova + 'px';
            });
        });

        ui.q('[data-ler]', caixa).addEventListener('click', function () {
            marcar(caixa, livro, cap, versiculos);
        });

        var lerFim = ui.q('[data-ler-fim]', caixa);
        if (lerFim) lerFim.addEventListener('click', function () {
            marcar(caixa, livro, cap, versiculos);
        });

        var artTexto = ui.$('texto');
        if (artTexto) artTexto.addEventListener('click', function (ev) {
            var p = ev.target && ev.target.closest ? ev.target.closest('.v') : null;
            if (p) p.classList.toggle('is-marcado');
        });

        ui.q('[data-trocar-edicao]', caixa).addEventListener('click', function () {
            var nova = B.texto.edicaoAtual() === '1911' ? 'jfaal' : '1911';
            B.texto.trocarEdicao(nova);
            caixa.innerHTML = '<p class="carregando">Trocando a edição…</p>';
            B.texto.capitulo(livro.nome, cap).then(function (vv) {
                pintar(caixa, livro, cap, vv);
                ui.toast('Lendo a ' + B.texto.edicao().nome + '.');
            }, function (err) {
                caixa.innerHTML = '<div class="aviso aviso--erro">' + esc(err.message) + '</div>';
            });
        });

        window.scrollTo(0, 0);
    }

    /* Marcar aqui faz o que a pessoa espera: se este capítulo é ' +
       justamente a leitura de hoje daquele grupo, o plano anda junto.
       Se é um capítulo qualquer, só registra a leitura. */
    function marcar(caixa, livro, cap, versiculos) {
        var g = bib.grupo(livro.grupo);

        /* Já registrado hoje: o toque desfaz o registro DE HOJE — e só
           quando é o último, que é o caso do "ops" logo depois do toque.
           Mais atrás do que isso, quem corrige é o mapa da Bíblia. */
        if (plano.leuHoje(livro.nome, cap)) {
            var ultimo = (store.get().historico || [])[0];
            if (ultimo && ultimo.livro === livro.nome && ultimo.cap === cap) {
                plano.desfazerUltima();
                plano.atualizarSequencia();
                store.salvar();
                pintar(caixa, livro, cap, versiculos);
                B.app.cabecalho();
                return ui.toast('Registro de hoje desfeito.');
            }
            return ui.toast('Você já registrou este capítulo hoje.');
        }

        var atual = plano.leituraAtual(g.id);
        if (atual.livro.nome === livro.nome && atual.cap === cap) {
            var r = plano.marcarLida(g.id);
            B.app.cabecalho();
            var prox = plano.leituraAtual(g.id);
            pintar(caixa, livro, cap, versiculos);
            ui.toast(r.fechouCiclo
                ? 'Ciclo de ' + g.nome + ' completo!'
                : 'Lido hoje. A próxima de ' + g.nome + ' é ' + prox.ref + '.');
        } else {
            /* Fora da vez do plano: conta para o dia e para a sequência, e
               não mexe em onde o grupo está. */
            plano.registrarLeitura(livro.nome, cap);
            pintar(caixa, livro, cap, versiculos);
            B.app.cabecalho();
            ui.toast('Leitura de hoje registrada.');
        }
    }

    return { render: render, depois: depois };
})();
