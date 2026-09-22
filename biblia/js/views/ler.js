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
                '" target="_blank" rel="noopener">Abrir na NVI, no app da Bible.com</a>';
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
        var lido = store.leu(livro.nome, cap);
        var ant = vizinho(livro, cap, -1);
        var prox = vizinho(livro, cap, 1);
        var fonte = store.get().config.fonte || 17;

        caixa.innerHTML = cabecalho(livro, cap) +

            /* A NVI fica na barra de cima, do lado de Estudar: quem lê nela
               quer o atalho ao abrir o capítulo, mas ele é atalho — não
               merece uma faixa inteira na frente do texto. */
            /* Tudo que se faz com o capítulo fica na mesma barra, acima do
               texto: ler na NVI, estudar e marcar como lido. O tamanho da
               letra fica à esquerda, separado — é ajuste de tela, não ação
               sobre o capítulo. Em tela estreita o grupo da direita desce
               inteiro para a linha de baixo, sem embaralhar a ordem. */
            '<div class="leitura-ferramentas">' +
            '<span class="ferr-grupo">' +
            '<button class="btn btn--mini" data-fonte="-1" aria-label="Diminuir a letra">A−</button>' +
            '<button class="btn btn--mini" data-fonte="1" aria-label="Aumentar a letra">A+</button>' +
            '</span>' +
            '<span class="ferr-grupo ferr-grupo--acoes">' +
            '<a class="btn btn--mini" href="' + esc(bib.linkNVI(livro, cap)) + '" ' +
            'target="_blank" rel="noopener">Ler na NVI</a>' +
            '<a class="btn btn--mini" href="#/estudo/' + encodeURIComponent(livro.nome + ' ' + cap) +
            '">Estudar</a>' +
            '<button class="btn btn--mini ' + (lido ? 'btn--feito' : '') + '" data-ler' +
            (lido ? ' aria-label="Já lido. Tocar desmarca."' : '') + '>' +
            (lido ? '✓ Já lido' : 'Marcar como lido') + '</button>' +
            '</span>' +
            '</div>' +

            '<article class="texto" id="texto" style="font-size:' + fonte + 'px">' +
            versiculos.map(function (v, i) {
                return '<p class="v"><span class="vn">' + (i + 1) + '</span>' + esc(v) + '</p>';
            }).join('') +
            '</article>' +

            '<div class="creditos">' +
            '<b>' + esc(B.texto.edicao().nome) + '</b> · ' + esc(B.texto.edicao().credito) + ' ' +
            ui.ajuda('Por que não é a NVI',
                '<p>A NVI, como a ARA, a NAA e a ACF, é <b>texto licenciado</b>: os direitos ' +
                'são da editora, e embutir os 31 mil versículos dela dentro de um app seria ' +
                'violação de direito autoral — mesmo num app pessoal, sem cobrar nada.</p>' +
                '<p>A Almeida de <b>1911</b> é a tradução mais recente em português que já ' +
                'entrou em domínio público. É ela que está aqui: dá para ler offline, de ' +
                'graça, sem depender de ninguém.</p>' +
                '<p>Para ler o mesmo capítulo <b>na NVI</b>, use o botão abaixo: ele abre o ' +
                'app da Bible.com (ou o site), onde a NVI é gratuita e licenciada como deve ser.</p>') +
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
        var jaLido = store.leu(livro.nome, cap);
        if (jaLido) {
            store.marcar(livro.nome, cap, false);
            store.salvar();
            pintar(caixa, livro, cap, versiculos);
            B.app.cabecalho();
            return ui.toast('Desmarcado.');
        }

        var g = bib.grupo(livro.grupo);
        var atual = plano.leituraAtual(g.id);
        if (atual.livro.nome === livro.nome && atual.cap === cap) {
            var r = plano.marcarLida(g.id);
            B.app.cabecalho();
            var prox = plano.leituraAtual(g.id);
            pintar(caixa, livro, cap, versiculos);
            ui.toast(r.fechouCiclo
                ? 'Ciclo de ' + g.nome + ' completo!'
                : 'Lido. A próxima de ' + g.nome + ' é ' + prox.ref + '.');
        } else {
            store.marcar(livro.nome, cap, true);
            plano.atualizarSequencia();
            store.salvar();
            pintar(caixa, livro, cap, versiculos);
            B.app.cabecalho();
            ui.toast('Marcado como lido.');
        }
    }

    return { render: render, depois: depois };
})();
