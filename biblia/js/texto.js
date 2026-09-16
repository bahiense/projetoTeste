/* =========================================================
   O texto bíblico embutido no app.

   A tradução é a Almeida de 1911, em domínio público. Não é escolha
   estética: NVI, ARA, NAA e ACF são texto licenciado, e distribuir os
   31 mil versículos de qualquer uma delas dentro de um app seria
   violação de direito autoral. A de 1911 é a mais recente em português
   que já caiu em domínio público — dá para embutir, ler offline e
   distribuir sem depender de ninguém. Para a NVI, o leitor tem o botão
   que abre o mesmo capítulo no app da Bible.com.

   São duas edições do mesmo texto, e a escolha fica com quem lê, porque
   a diferença não é só de grafia: a revisão do projeto JFAAL mexe também
   em tempo verbal e pronome, com apoio de IA. Isso não se esconde atrás
   de um padrão — o app diz, na tela de leitura, qual está em uso.

   Um arquivo por livro, carregado sob demanda: ninguém baixa 3,7 MB
   para ler um salmo. O que já foi aberto fica na memória, e o service
   worker guarda no aparelho para a próxima vez, sem internet.
   ========================================================= */
window.B = window.B || {};

B.texto = (function () {
    'use strict';

    var EDICOES = {
        '1911': {
            nome: 'Almeida 1911',
            curto: 'Almeida 1911 (original)',
            credito: 'João Ferreira de Almeida, edição de 1911 — domínio público. ' +
                'Digitalização do projeto JFAAL.',
            aviso: 'Texto histórico, com a grafia da época: "valle", "aquelle", "n\'elle".'
        },
        jfaal: {
            nome: 'Almeida 1911 atualizada',
            curto: 'Almeida atualizada (JFAAL)',
            credito: 'JFAAL — revisão da Almeida de 1911, © Marcos Cristiano Alves Ferreira, ' +
                'sob licença Creative Commons Atribuição 3.0 Brasil.',
            aviso: 'Ortografia atual, muito mais fácil de ler. A revisão foi feita com apoio ' +
                'de inteligência artificial e mexe também em tempo verbal e pronome — não é ' +
                'só ortografia.'
        }
    };

    function edicaoAtual() {
        var e = B.store.get().config.edicao;
        return EDICOES[e] ? e : '1911';
    }

    function edicao() { return EDICOES[edicaoAtual()]; }

    var cache = {};      // 'jfaal:Gênesis' -> { livro, caps: [[versículos]] }
    var pedidos = {};    // promessas em andamento, para não buscar duas vezes

    function carregarLivro(nomeLivro) {
        var ed = edicaoAtual();
        var chave = ed + ':' + nomeLivro;
        if (cache[chave]) return Promise.resolve(cache[chave]);
        if (pedidos[chave]) return pedidos[chave];

        var livro = B.biblia.livro(nomeLivro);
        if (!livro) return Promise.reject(new Error('Livro desconhecido: ' + nomeLivro));

        pedidos[chave] = fetch('data/texto/' + ed + '/' + livro.arquivo + '.json')
            .then(function (r) {
                if (!r.ok) throw new Error('não encontrei o texto de ' + nomeLivro);
                return r.json();
            })
            .then(function (d) {
                cache[chave] = d;
                delete pedidos[chave];
                return d;
            }, function (err) {
                delete pedidos[chave];
                throw new Error('Não consegui abrir o texto de ' + nomeLivro +
                    '. Se você estiver sem internet e for a primeira vez que abre este ' +
                    'livro, ele ainda não está guardado no aparelho.');
            });

        return pedidos[chave];
    }

    /* Devolve os versículos de um capítulo: ['No princípio...', ...] */
    function capitulo(nomeLivro, cap) {
        return carregarLivro(nomeLivro).then(function (d) {
            var vv = d.caps[cap - 1];
            if (!vv) throw new Error(nomeLivro + ' não tem capítulo ' + cap);
            return vv;
        });
    }

    /* Baixa os 66 livros para o aparelho, para ler offline depois.
       Um de cada vez: são 3,7 MB, e enfileirar 66 pedidos de uma vez em
       rede de celular é pedir para algum deles falhar. */
    function baixarTudo(aoAndar) {
        var livros = B.biblia.LIVROS;
        var feitos = 0;
        return livros.reduce(function (fila, l) {
            return fila.then(function () {
                return carregarLivro(l.nome).then(function () {
                    feitos++;
                    if (aoAndar) aoAndar(feitos, livros.length, l.nome);
                });
            });
        }, Promise.resolve()).then(function () { return feitos; });
    }

    function estaNaMemoria(nomeLivro) { return !!cache[edicaoAtual() + ':' + nomeLivro]; }

    /* Trocar de edição zera só o que estava em memória; o que o service
       worker guardou continua guardado. */
    function trocarEdicao(nova) {
        if (!EDICOES[nova]) return false;
        B.store.setConfig('edicao', nova);
        return true;
    }

    return {
        EDICOES: EDICOES, edicao: edicao, edicaoAtual: edicaoAtual, trocarEdicao: trocarEdicao,
        carregarLivro: carregarLivro, capitulo: capitulo,
        baixarTudo: baixarTudo, estaNaMemoria: estaNaMemoria
    };
})();
