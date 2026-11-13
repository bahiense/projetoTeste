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

    /* A terceira edição, quando existe, não vem do app: é um arquivo que
       a pessoa carregou neste aparelho (ver js/edicao-propria.js). Ela
       aparece na lista só enquanto estiver guardada aqui. */
    var PROPRIA = 'propria';

    function descricaoPropria(m) {
        return {
            nome: m.nome,
            curto: m.nome + ' (sua cópia)',
            credito: 'Edição carregada por você neste aparelho' +
                (m.arquivo ? ' (' + m.arquivo + ')' : '') + '. Não é distribuída pelo app: ' +
                'fica só aqui, e sai quando você mandar apagar.',
            aviso: 'Texto que você mesmo carregou: ' + m.livros + ' livros, ' +
                m.versiculos + ' versículos. O app não confere tradução — confere só se o ' +
                'arquivo tinha a forma de uma Bíblia.',
            propria: true,
            id: m.id
        };
    }

    /* 'propria:acf' -> 'acf'; qualquer outra coisa -> null. */
    function idDa(chave) {
        var c = String(chave || '');
        return c.indexOf(PROPRIA + ':') === 0 ? c.slice(PROPRIA.length + 1) : null;
    }

    /* As edições que dá para escolher agora: as duas de dentro do app e
       quantas a pessoa tiver carregado neste aparelho. */
    function edicoes() {
        var todas = {};
        Object.keys(EDICOES).forEach(function (k) { todas[k] = EDICOES[k]; });
        ((B.edicaoPropria && B.edicaoPropria.listaAgora()) || []).forEach(function (m) {
            todas[PROPRIA + ':' + m.id] = descricaoPropria(m);
        });
        return todas;
    }

    function edicaoAtual() {
        var e = B.store.get().config.edicao;
        if (edicoes()[e]) return e;
        return EDICOES[e] ? e : '1911';
    }

    function edicao() { return edicoes()[edicaoAtual()]; }

    var cache = {};      // 'jfaal:Gênesis' -> { livro, caps: [[versículos]] }
    var pedidos = {};    // promessas em andamento, para não buscar duas vezes

    function carregarLivro(nomeLivro) {
        var ed = edicaoAtual();
        var chave = ed + ':' + nomeLivro;
        if (cache[chave]) return Promise.resolve(cache[chave]);
        if (pedidos[chave]) return pedidos[chave];

        var livro = B.biblia.livro(nomeLivro);
        if (!livro) return Promise.reject(new Error('Livro desconhecido: ' + nomeLivro));

        var idProprio = idDa(ed);
        if (idProprio) {
            pedidos[chave] = B.edicaoPropria.livro(idProprio, livro.arquivo).then(function (d) {
                cache[chave] = d;
                delete pedidos[chave];
                return d;
            }, function (err) {
                delete pedidos[chave];
                throw new Error('A edição que você carregou não tem ' + nomeLivro +
                    '. Troque de edição em Ajustes para ler este livro.');
            });
            return pedidos[chave];
        }

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

    /**
     * O capítulo, com a Almeida de reserva.
     *
     * A edição carregada pela pessoa pode ter só uma parte da Bíblia — um
     * arquivo só do Novo Testamento é o caso comum. Na tela de leitura
     * isso é explícito: ela abre e avisa. Mas dentro do estudo, onde o
     * texto bíblico aparece ao lado do comentário, sumir seria pior do
     * que mostrar a Almeida dizendo que é a Almeida.
     *
     * Devolve { versiculos, edicao, reserva }, e quem chama decide se
     * conta ao leitor — a resposta nunca é texto sem procedência.
     */
    function capituloOuReserva(nomeLivro, cap) {
        var escolhida = edicaoAtual();
        return capitulo(nomeLivro, cap).then(function (vv) {
            return { versiculos: vv, edicao: edicoes()[escolhida], reserva: false };
        }, function (err) {
            if (!idDa(escolhida)) throw err;      // falhou numa edição do app
            var antes = B.store.get().config.edicao;
            B.store.setConfig('edicao', '1911');
            return capitulo(nomeLivro, cap).then(function (vv) {
                B.store.setConfig('edicao', antes);
                return { versiculos: vv, edicao: EDICOES['1911'], reserva: true };
            }, function (e2) {
                B.store.setConfig('edicao', antes);
                throw e2;
            });
        });
    }

    /* Baixa os 66 livros para o aparelho, para ler offline depois.
       Um de cada vez: são 3,7 MB, e enfileirar 66 pedidos de uma vez em
       rede de celular é pedir para algum deles falhar. */
    function baixarTudo(aoAndar) {
        if (idDa(edicaoAtual())) return Promise.resolve(0);   // já está aqui
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

    /* Trocar ou apagar a edição carregada tem de esvaziar o que já foi
       lido dela: o cache é por edição, e "propria" é sempre a mesma chave,
       mesmo quando o texto por trás mudou. */
    function esquecerPropria() {
        Object.keys(cache).forEach(function (k) {
            if (k.indexOf(PROPRIA + ':') === 0) delete cache[k];
        });
        Object.keys(pedidos).forEach(function (k) {
            if (k.indexOf(PROPRIA + ':') === 0) delete pedidos[k];
        });
    }

    /* Trocar de edição zera só o que estava em memória; o que o service
       worker guardou continua guardado. */
    function trocarEdicao(nova) {
        if (!edicoes()[nova]) return false;
        B.store.setConfig('edicao', nova);
        return true;
    }

    return {
        EDICOES: EDICOES, edicoes: edicoes, PROPRIA: PROPRIA, idDa: idDa,
        edicao: edicao, edicaoAtual: edicaoAtual, trocarEdicao: trocarEdicao,
        carregarLivro: carregarLivro, capitulo: capitulo,
        capituloOuReserva: capituloOuReserva,
        baixarTudo: baixarTudo, estaNaMemoria: estaNaMemoria,
        esquecerPropria: esquecerPropria
    };
})();
