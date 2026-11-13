/* =========================================================
   UMA EDIÇÃO SUA, SÓ NESTE APARELHO.

   O app traz embutidas duas edições em domínio público, e é só isso
   que ele distribui: tradução licenciada (NVI, ARA, NAA, ACF) não entra
   no repositório nem no APK, porque publicar os 31 mil versículos de um
   texto com direitos é violação, por mais pessoal que seja o app.

   Este módulo é outra coisa. Ele não traz texto nenhum: ele lê um
   arquivo que a pessoa escolhe no próprio aparelho e guarda o resultado
   no IndexedDB daqui, como um leitor de e-book guarda o livro que você
   abriu. O que entra por aqui:

   - não vai para o repositório, nem para o APK, nem para a Oficina;
   - não entra no backup nem nos pacotes que atravessam para o Claude —
     esses levam leitura e estudos, nunca o texto bíblico;
   - sai do aparelho quando a pessoa manda apagar.

   Formatos aceitos (o que der para conferir, é conferido):

   1. JSON no formato do próprio app: [{livro, caps: [[versículo, ...]]}]
   2. JSON no formato comum dos repositórios de Bíblia:
      [{name|abbrev, chapters: [[versículo, ...]]}]
   3. Texto puro, uma referência por linha: "Gênesis 1:1 No princípio..."
      (abreviatura também serve: "Gn 1:1 ...")

   PDF não entra aqui de propósito: PDF de Bíblia vem em duas colunas,
   com títulos de seção e notas de rodapé no meio do versículo, e um
   extrator chutando onde termina o versículo produziria um texto que
   parece certo e não é. Exporte o PDF para texto e traga o texto.
   ========================================================= */
window.B = window.B || {};

B.edicaoPropria = (function () {
    'use strict';

    var NOME = 'bib-edicao-propria';
    var LOJA = 'livros';
    var INDICE = '__edicoes__';     // a lista das edições guardadas aqui
    var ANTIGA = '__meta__';        // como era quando só cabia uma
    var bd = null;
    var listaCache = null;

    function abrir() {
        if (bd) return Promise.resolve(bd);
        return new Promise(function (ok, erro) {
            if (typeof indexedDB === 'undefined' || !indexedDB) {
                return erro(new Error('Este navegador não guarda arquivos grandes.'));
            }
            var p = indexedDB.open(NOME, 1);
            p.onupgradeneeded = function () {
                var b = p.result;
                if (!b.objectStoreNames.contains(LOJA)) b.createObjectStore(LOJA);
            };
            p.onsuccess = function () { bd = p.result; ok(bd); };
            p.onerror = function () { erro(p.error || new Error('IndexedDB indisponível')); };
        });
    }

    function ler(chave) {
        return abrir().then(function (b) {
            return new Promise(function (ok, erro) {
                var t = b.transaction(LOJA, 'readonly').objectStore(LOJA).get(chave);
                t.onsuccess = function () { ok(t.result || null); };
                t.onerror = function () { erro(t.error); };
            });
        });
    }

    /**
     * Grava uma edição: põe o que ela tem e tira o que ela tinha antes.
     *
     * Cada edição vive debaixo do seu próprio prefixo ("acf/23"), então
     * carregar a segunda não encosta na primeira — é o que permite ter
     * várias e trocar entre elas. Mas recarregar a MESMA edição com um
     * arquivo menor precisa deixá-la só com o que veio agora: senão
     * sobrariam livros do arquivo velho misturados com os do novo.
     * Tudo numa transação só.
     */
    function gravar(id, pares, indiceNovo) {
        var ficam = {};
        pares.forEach(function (p) { ficam[p[0]] = true; });
        return abrir().then(function (b) {
            return new Promise(function (ok, erro) {
                var tr = b.transaction(LOJA, 'readwrite');
                var loja = tr.objectStore(LOJA);
                var chaves = loja.getAllKeys();
                chaves.onsuccess = function () {
                    (chaves.result || []).forEach(function (k) {
                        if (String(k).indexOf(id + '/') === 0 && !ficam[k]) loja.delete(k);
                    });
                    pares.forEach(function (p) { loja.put(p[1], p[0]); });
                    loja.put(indiceNovo, INDICE);
                };
                tr.oncomplete = function () { ok(true); };
                tr.onerror = function () { erro(tr.error); };
                tr.onabort = function () { erro(tr.error || new Error('gravação abortada')); };
            });
        });
    }

    /* ---------- o que está guardado ---------- */

    /**
     * A lista das edições carregadas neste aparelho.
     *
     * Traz junto a mudança de quando só cabia uma: quem já tinha carregado
     * um arquivo na versão anterior do app não pode abrir e ver a edição
     * sumida. A antiga vira a primeira da lista, com os livros no lugar.
     */
    function lista() {
        if (listaCache) return Promise.resolve(listaCache);
        return ler(INDICE).then(function (l) {
            if (Array.isArray(l)) { listaCache = l; return l; }
            return migrarAntiga();
        }, function () { listaCache = []; return listaCache; });
    }

    function migrarAntiga() {
        return ler(ANTIGA).then(function (m) {
            if (!m) { listaCache = []; return listaCache; }
            var id = 'edicao-1';
            return abrir().then(function (b) {
                return new Promise(function (ok) {
                    var tr = b.transaction(LOJA, 'readwrite');
                    var loja = tr.objectStore(LOJA);
                    var tudo = loja.getAllKeys();
                    tudo.onsuccess = function () {
                        var antigas = (tudo.result || []).filter(function (k) {
                            return /^\d\d$/.test(String(k));
                        });
                        antigas.forEach(function (k) {
                            var leitura = loja.get(k);
                            leitura.onsuccess = function () {
                                if (leitura.result) loja.put(leitura.result, id + '/' + k);
                                loja.delete(k);
                            };
                        });
                        loja.delete(ANTIGA);
                    };
                    tr.oncomplete = function () {
                        m.id = id;
                        listaCache = [m];
                        gravarIndice(listaCache).then(function () { ok(listaCache); },
                            function () { ok(listaCache); });
                    };
                    tr.onerror = function () { listaCache = []; ok(listaCache); };
                });
            });
        }, function () { listaCache = []; return listaCache; });
    }

    function gravarIndice(l) {
        return abrir().then(function (b) {
            return new Promise(function (ok, erro) {
                var tr = b.transaction(LOJA, 'readwrite');
                tr.objectStore(LOJA).put(l, INDICE);
                tr.oncomplete = function () { ok(true); };
                tr.onerror = function () { erro(tr.error); };
            });
        });
    }

    /* Versão síncrona, para montar tela sem esperar: vale o que a última
       leitura descobriu. */
    function listaAgora() { return listaCache || []; }

    function porId(id) {
        var achada = null;
        listaAgora().forEach(function (m) { if (m.id === id) achada = m; });
        return achada;
    }

    function livro(id, arquivo) {
        return ler(id + '/' + arquivo).then(function (d) {
            if (!d) throw new Error('Este livro não veio no arquivo que você carregou.');
            return d;
        });
    }

    /* Um nome de arquivo vira um id curto e estável; repetido, ganha
       número, para duas edições com o mesmo nome não se apagarem. */
    function novoId(rotulo) {
        /* Mantém os hífens: o id aparece em lugar nenhum da tela, mas
           aparece no console e nos testes, e "acf-2007" se lê. */
        var base = B.biblia.semAcento(String(rotulo || '')).toLowerCase()
            .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'edicao';
        var id = base, n = 2;
        while (porId(id)) { id = base + '-' + n; n++; }
        return id;
    }

    function apagar(id) {
        return lista().then(function (l) {
            return abrir().then(function (b) {
                return new Promise(function (ok, erro) {
                    var tr = b.transaction(LOJA, 'readwrite');
                    var loja = tr.objectStore(LOJA);
                    var chaves = loja.getAllKeys();
                    chaves.onsuccess = function () {
                        (chaves.result || []).forEach(function (k) {
                            if (!id || String(k).indexOf(id + '/') === 0) {
                                if (String(k) !== INDICE) loja.delete(k);
                            }
                        });
                        listaCache = id
                            ? l.filter(function (m) { return m.id !== id; })
                            : [];
                        loja.put(listaCache, INDICE);
                    };
                    tr.oncomplete = function () {
                        if (B.texto && B.texto.esquecerPropria) B.texto.esquecerPropria();
                        ok(true);
                    };
                    tr.onerror = function () { erro(tr.error); };
                });
            });
        });
    }

    /* ---------- leitura do arquivo ---------- */

    function semAcento(t) {
        return B.biblia.semAcento(String(t || '')).toLowerCase()
            .replace(/[^a-z0-9]/g, '');
    }

    /* Nomes em inglês, na ordem canônica: muito arquivo de Bíblia em
       português vem com o nome do livro em inglês, ou com a abreviatura
       inglesa, porque foi montado em cima de uma base de lá. */
    var INGLES = ('Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|' +
        '1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|' +
        'Job|Psalms|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|' +
        'Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|' +
        'Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|' +
        '2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|' +
        '2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|' +
        '1 John|2 John|3 John|Jude|Revelation').split('|');

    /* Índice de nomes e abreviaturas -> livro do app, montado uma vez. */
    var porNome = (function () {
        var m = {};
        (B.biblia.LIVROS || []).forEach(function (l, i) {
            m[semAcento(l.nome)] = l;
            if (l.usfm) m[semAcento(l.usfm)] = l;
            (l.apelidos || []).forEach(function (a) { m[semAcento(a)] = l; });
            if (INGLES[i]) m[semAcento(INGLES[i])] = l;
        });
        /* Nomes que variam de edição para edição. */
        [['Cantares', 'Cânticos'], ['Cantico dos Canticos', 'Cânticos'],
         ['Song of Songs', 'Cânticos'], ['Oseias', 'Oséias'], ['Miqueias', 'Miquéias'],
         ['Naum', 'Naum'], ['Sofonias', 'Sofonias'], ['Filemon', 'Filemom'],
         ['Apocalipse de João', 'Apocalipse'], ['Atos dos Apóstolos', 'Atos'],
         ['Salmo', 'Salmos'], ['Juizes', 'Juízes']].forEach(function (par) {
            var l = B.biblia.livro(par[1]);
            if (l) m[semAcento(par[0])] = l;
        });
        return m;
    })();

    /**
     * De um nome qualquer para o livro do app.
     *
     * Quem decide primeiro é o próprio app, porque ele já carrega as
     * convenções do português: "Jo" é João e "Jó" é Jó — a acentuação
     * muda o livro, e achatar o acento aqui mandaria João 3:16 para
     * dentro de Jó. Só o que ele não reconhecer é que passa pelo índice
     * daqui, que tem o nome em inglês, o código USFM e as variações.
     */
    function acharLivro(nome) {
        var limpo = String(nome == null ? '' : nome).trim();
        if (!limpo) return null;
        try {
            var r = B.biblia.interpretar(limpo + ' 1');
            if (r && r.livro) return r.livro;
        } catch (e) { /* nome estranho: segue para o índice */ }

        var chave = semAcento(limpo);
        if (!chave) return null;
        if (porNome[chave]) return porNome[chave];
        /* "1Samuel", "ISamuel", "1 Sm": o número já está achatado pelo
           semAcento, então sobra casar por começo. */
        var achados = Object.keys(porNome).filter(function (k) {
            return k.indexOf(chave) === 0 || chave.indexOf(k) === 0;
        }).map(function (k) { return porNome[k]; });
        var unicos = {};
        achados.forEach(function (l) { unicos[l.nome] = l; });
        var lista = Object.keys(unicos);
        return lista.length === 1 ? unicos[lista[0]] : null;
    }

    /** Texto puro: uma linha por versículo, "Gênesis 1:1 No princípio...". */
    function lerTexto(bruto) {
        var livros = {};
        var linhas = String(bruto).split(/\r?\n/);
        var atual = null, capAtual = 0;

        linhas.forEach(function (linha) {
            var t = linha.trim();
            if (!t) return;
            var m = t.match(/^([1-3]?\s*[A-Za-zÀ-ÿ.]+(?:\s+[A-Za-zÀ-ÿ.]+)?)[\s.]*(\d+)[:.,](\d+)\s+(.*)$/);
            if (m) {
                var l = acharLivro(m[1]);
                if (!l) return;
                atual = l;
                capAtual = parseInt(m[2], 10);
                por(l, capAtual, parseInt(m[3], 10), m[4]);
                return;
            }
            /* Linha só com o versículo numerado, depois de um cabeçalho de
               capítulo: "12 E disse Deus..." */
            var so = t.match(/^(\d+)\s+(.+)$/);
            if (so && atual && capAtual) {
                por(atual, capAtual, parseInt(so[1], 10), so[2]);
                return;
            }
            var cab = t.match(/^([1-3]?\s*[A-Za-zÀ-ÿ.]+(?:\s+[A-Za-zÀ-ÿ.]+)?)\s+(\d+)$/);
            if (cab) {
                var l2 = acharLivro(cab[1]);
                if (l2) { atual = l2; capAtual = parseInt(cab[2], 10); }
            }
        });

        function por(l, cap, v, texto) {
            if (!cap || !v || cap > l.caps) return;
            var alvo = livros[l.nome] || (livros[l.nome] = { livro: l, caps: [] });
            var c = alvo.caps[cap - 1] || (alvo.caps[cap - 1] = []);
            c[v - 1] = texto.trim();
        }

        return livros;
    }

    /**
     * Texto corrido, que é o que sai de um PDF exportado.
     *
     * Ali o capítulo vem num parágrafo só, com os números do versículo no
     * meio da frase: "1 No princípio... 2 E a terra era sem forma...".
     * Cortar em todo número seria desastre — "40 dias" e "1 Samuel" viram
     * versículo do nada. O corte só acontece no número que vem a seguir
     * na conta: depois do 7 procura-se o 8, nunca qualquer número.
     */
    function lerCorrido(bruto) {
        var livros = {};
        var atual = null, capAtual = 0, pedacos = [];

        function fechar() {
            if (!atual || !capAtual || !pedacos.length) return;
            var texto = pedacos.join(' ').replace(/\s+/g, ' ').trim();
            var versiculos = partirPorNumero(texto);
            if (versiculos.length) {
                var alvo = livros[atual.nome] || (livros[atual.nome] = { livro: atual, caps: [] });
                alvo.caps[capAtual - 1] = versiculos;
            }
            pedacos = [];
        }

        String(bruto).split(/\r?\n/).forEach(function (linha) {
            var t = linha.trim();
            if (!t) return;
            /* "Gênesis 1", "GÊNESIS 1", "Gn 1" */
            var cab = t.match(/^([1-3]?\s*[A-Za-zÀ-ÿ.]+(?:\s+[A-Za-zÀ-ÿ.]+)?)\s+(\d{1,3})$/);
            if (cab) {
                var l = acharLivro(cab[1]);
                if (l) { fechar(); atual = l; capAtual = parseInt(cab[2], 10); return; }
            }
            /* "CAPÍTULO 7", debaixo de um cabeçalho de livro */
            var capSo = t.match(/^cap[íi]tulo\s+(\d{1,3})$/i);
            if (capSo && atual) { fechar(); capAtual = parseInt(capSo[1], 10); return; }
            /* Só o nome do livro, numa linha */
            var soLivro = acharLivro(t);
            if (soLivro && t.length < 30 && !/\d/.test(t)) {
                fechar(); atual = soLivro; capAtual = 0; return;
            }
            if (atual && capAtual) pedacos.push(t);
        });
        fechar();
        return livros;
    }

    /* "1 No princípio... 2 E a terra..." -> ['No princípio...', 'E a terra...'] */
    function partirPorNumero(texto) {
        var inicio = texto.search(/(^|\s)1\s+\S/);
        if (inicio < 0) return [];
        var resto = texto.slice(inicio).replace(/^\s*1\s+/, '');
        var versiculos = [];
        var proximo = 2;
        while (true) {
            var corte = resto.search(new RegExp('\\s' + proximo + '\\s+(?=[\\S])'));
            if (corte < 0) break;
            versiculos.push(resto.slice(0, corte).trim());
            resto = resto.slice(corte).replace(new RegExp('^\\s*' + proximo + '\\s+'), '');
            proximo++;
        }
        versiculos.push(resto.trim());
        return versiculos.filter(function (v) { return v.length > 0; });
    }

    /**
     * JSON, em qualquer das formas que circulam por aí.
     *
     * Não existe um formato só de Bíblia em JSON, e quem baixa um arquivo
     * pronto não escolhe a forma dele. Quatro são comuns, e todas caem
     * aqui:
     *
     *   1. lista de livros:  [{name|abbrev|livro, chapters|caps: [[v, v]]}]
     *   2. mapa de livros:   {"Gênesis": {"1": {"1": "texto"}}}
     *   3. lista solta de versículos, uma linha por versículo:
     *      [{book_name, chapter, verse, text}]
     *   4. qualquer das três embrulhada em {livros|books|verses|data: ...}
     *
     * Capítulo e versículo podem vir como lista ou como objeto com o
     * número na chave — "1", "2", "3" —, e nesse caso a ordem é a do
     * número, nunca a ordem em que as chaves aparecem no arquivo.
     */
    function lerJson(dados) {
        var d = desembrulhar(dados);
        if (!d) return null;
        if (Array.isArray(d)) {
            /* Lista de livros ou lista de versículos? O primeiro item diz. */
            var um = d[0];
            if (um && (um.chapters || um.caps || um.capitulos || um.versiculos)) {
                return deListaDeLivros(d);
            }
            if (um && (um.text || um.texto || um.verse_text) !== undefined) {
                return deVersiculosSoltos(d);
            }
            return deListaDeLivros(d);
        }
        if (d.livro && d.caps) return deListaDeLivros([d]);
        if (typeof d === 'object') return deMapaDeLivros(d);
        return null;
    }

    /* Tira as camadas de embrulho até achar a lista (ou o mapa) de verdade. */
    function desembrulhar(dados) {
        var d = dados;
        for (var i = 0; i < 4 && d && !Array.isArray(d); i++) {
            var chave = ['livros', 'books', 'biblia', 'bible', 'verses', 'versiculos',
                'resultado', 'data'].filter(function (k) { return d[k]; })[0];
            if (!chave) break;
            d = d[chave];
        }
        return d || null;
    }

    /* Lista ou objeto numerado -> lista na ordem do número. */
    function emOrdem(x) {
        if (Array.isArray(x)) return x;
        if (!x || typeof x !== 'object') return null;
        var chaves = Object.keys(x).filter(function (k) { return /^\d+$/.test(k); });
        if (!chaves.length) return null;
        var fora = [];
        chaves.forEach(function (k) { fora[parseInt(k, 10) - 1] = x[k]; });
        for (var i = 0; i < fora.length; i++) if (fora[i] === undefined) fora[i] = null;
        return fora;
    }

    function versiculosDe(cap) {
        var lista = emOrdem(cap);
        if (!lista) return [];
        return lista.map(function (v) {
            if (v && typeof v === 'object') v = v.text || v.texto || v.verse || '';
            return String(v == null ? '' : v).trim();
        });
    }

    function deListaDeLivros(lista) {
        var livros = {};
        lista.forEach(function (item) {
            if (!item) return;
            var nome = item.livro || item.nome || item.name || item.book ||
                item.book_name || item.abbrev;
            var caps = item.caps || item.capitulos || item.chapters || item.versiculos;
            var l = acharLivro(nome);
            var emLista = emOrdem(caps);
            if (!l || !emLista) return;
            livros[l.nome] = { livro: l, caps: emLista.map(versiculosDe) };
        });
        return livros;
    }

    function deMapaDeLivros(mapa) {
        var livros = {};
        Object.keys(mapa).forEach(function (nome) {
            var l = acharLivro(nome);
            var caps = emOrdem(mapa[nome]);
            if (!l || !caps) return;
            livros[l.nome] = { livro: l, caps: caps.map(versiculosDe) };
        });
        return livros;
    }

    function deVersiculosSoltos(lista) {
        var livros = {};
        lista.forEach(function (v) {
            if (!v) return;
            var l = acharLivro(v.book_name || v.livro || v.book || v.nome || v.abbrev);
            var cap = parseInt(v.chapter || v.capitulo || v.chapter_number || v.cap, 10);
            var num = parseInt(v.verse || v.versiculo || v.verse_number || v.num, 10);
            var texto = v.text || v.texto || v.verse_text;
            if (!l || !cap || !num || texto == null || cap > l.caps) return;
            var alvo = livros[l.nome] || (livros[l.nome] = { livro: l, caps: [] });
            var c = alvo.caps[cap - 1] || (alvo.caps[cap - 1] = []);
            c[num - 1] = String(texto).trim();
        });
        return livros;
    }

    /**
     * Confere o que foi lido e diz o que entra.
     *
     * Texto bíblico errado é pior que texto bíblico nenhum: capítulo a
     * mais do que o livro tem é sinal de que o arquivo foi lido torto, e
     * nesse caso o livro inteiro fica de fora, com o aviso.
     */
    function conferir(livros) {
        var bons = [], problemas = [];
        var versiculos = 0, capitulos = 0;
        Object.keys(livros).forEach(function (nome) {
            var d = livros[nome];
            var l = d.livro;
            var caps = d.caps || [];
            if (caps.length > l.caps) {
                problemas.push(nome + ': vieram ' + caps.length + ' capítulos, e o livro tem ' +
                    l.caps);
                return;
            }
            var vazios = 0;
            caps.forEach(function (c) { if (!c || !c.length) vazios++; });
            if (!caps.length || vazios === caps.length) {
                problemas.push(nome + ': nenhum versículo foi reconhecido');
                return;
            }
            var limpos = caps.map(function (c) {
                return (c || []).map(function (v) { return String(v == null ? '' : v); });
            });
            limpos.forEach(function (c) { versiculos += c.length; });
            capitulos += limpos.length;
            bons.push({ arquivo: l.arquivo, livro: l.nome, caps: limpos,
                faltando: l.caps - limpos.length });
        });
        return { bons: bons, problemas: problemas, versiculos: versiculos, capitulos: capitulos };
    }

    /**
     * Lê o arquivo escolhido e guarda. Devolve o resumo do que entrou.
     *
     * Não apaga o que já estava guardado antes de ter o novo pronto: se o
     * arquivo for ilegível, a edição anterior continua de pé.
     */
    /**
     * Lê o arquivo escolhido e guarda como mais uma edição.
     *
     * Não apaga o que já estava guardado antes de ter o novo pronto: se o
     * arquivo for ilegível, as edições anteriores continuam de pé. E cada
     * arquivo entra como uma edição à parte — carregar a ACF não derruba
     * a que você carregou ontem.
     */
    function importar(texto, nomeArquivo, rotulo) {
        return lista().then(function () {
            var bruto = String(texto || '');
            var livros = null;
            var t = bruto.trim();
            if (t.charAt(0) === '{' || t.charAt(0) === '[') {
                try { livros = lerJson(JSON.parse(t)); } catch (e) { livros = null; }
            }
            if (!livros || !Object.keys(livros).length) livros = lerTexto(bruto);
            /* Um versículo por linha é o formato bom. Quando não é esse, o
               arquivo quase sempre veio de um PDF: capítulo em parágrafo
               corrido, com os números no meio. */
            if (!livros || !Object.keys(livros).length) livros = lerCorrido(bruto);
            return livros;
        }).then(function (livros) {
            var r = conferir(livros || {});
            if (!r.bons.length) {
                throw new Error('Não reconheci nenhum livro neste arquivo. ' +
                    (r.problemas.length ? r.problemas[0] : 'Confira o formato.'));
            }
            var nome = rotulo || 'Edição carregada por você';
            var m = {
                id: novoId(nome),
                nome: nome,
                arquivo: nomeArquivo || '',
                criado: new Date().toISOString(),
                livros: r.bons.length,
                capitulos: r.capitulos,
                versiculos: r.versiculos,
                problemas: r.problemas
            };
            var pares = r.bons.map(function (b) {
                return [m.id + '/' + b.arquivo, { livro: b.livro, caps: b.caps }];
            });
            var nova = listaAgora().concat([m]);
            return gravar(m.id, pares, nova).then(function () {
                listaCache = nova;
                /* O que já tinha sido lido continua na memória do leitor de
                   texto: sem esquecer, o capítulo da edição velha seguiria
                   aparecendo até fechar o app. */
                if (B.texto && B.texto.esquecerPropria) B.texto.esquecerPropria();
                return { meta: m, problemas: r.problemas, bons: r.bons };
            });
        });
    }

    return {
        lista: lista, listaAgora: listaAgora, porId: porId,
        livro: livro, apagar: apagar, importar: importar,
        /* expostos para teste e para o verificador */
        lerTexto: lerTexto, lerCorrido: lerCorrido, partirPorNumero: partirPorNumero,
        lerJson: lerJson, conferir: conferir, acharLivro: acharLivro, emOrdem: emOrdem
    };
})();
