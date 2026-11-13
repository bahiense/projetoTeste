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
    var CHAVE_META = '__meta__';
    var bd = null;
    var metaCache = null;

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

    function gravar(pares) {
        return abrir().then(function (b) {
            return new Promise(function (ok, erro) {
                var tr = b.transaction(LOJA, 'readwrite');
                var loja = tr.objectStore(LOJA);
                pares.forEach(function (p) { loja.put(p[1], p[0]); });
                tr.oncomplete = function () { ok(true); };
                tr.onerror = function () { erro(tr.error); };
                tr.onabort = function () { erro(tr.error || new Error('gravação abortada')); };
            });
        });
    }

    /* ---------- o que está guardado ---------- */

    function meta() {
        if (metaCache !== null) return Promise.resolve(metaCache);
        return ler(CHAVE_META).then(function (m) {
            metaCache = m || false;
            return metaCache;
        }, function () { return false; });
    }

    /* Versão síncrona, para quem precisa montar tela sem esperar: vale o
       que a última leitura descobriu. */
    function metaAgora() { return metaCache || null; }

    function livro(arquivo) {
        return ler(arquivo).then(function (d) {
            if (!d) throw new Error('Este livro não veio no arquivo que você carregou.');
            return d;
        });
    }

    function apagar() {
        return abrir().then(function (b) {
            return new Promise(function (ok, erro) {
                var tr = b.transaction(LOJA, 'readwrite');
                tr.objectStore(LOJA).clear();
                tr.oncomplete = function () { metaCache = false; ok(true); };
                tr.onerror = function () { erro(tr.error); };
            });
        });
    }

    /* ---------- leitura do arquivo ---------- */

    function semAcento(t) {
        return B.biblia.semAcento(String(t || '')).toLowerCase()
            .replace(/[^a-z0-9]/g, '');
    }

    /* Índice de nomes e abreviaturas -> livro do app, montado uma vez. */
    var porNome = (function () {
        var m = {};
        (B.biblia.LIVROS || []).forEach(function (l) {
            m[semAcento(l.nome)] = l;
            if (l.usfm) m[semAcento(l.usfm)] = l;
            (l.apelidos || []).forEach(function (a) { m[semAcento(a)] = l; });
        });
        return m;
    })();

    function acharLivro(nome) {
        var chave = semAcento(nome);
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

    /** JSON: o formato do app ou o dos repositórios de Bíblia. */
    function lerJson(dados) {
        var lista = Array.isArray(dados) ? dados
            : (dados && (dados.livros || dados.books || dados.biblia)) || null;
        if (!lista && dados && dados.livro && dados.caps) lista = [dados];
        if (!Array.isArray(lista)) return null;

        var livros = {};
        lista.forEach(function (item) {
            if (!item) return;
            var nome = item.livro || item.nome || item.name || item.abbrev || item.book;
            var caps = item.caps || item.capitulos || item.chapters || item.versiculos;
            var l = acharLivro(nome);
            if (!l || !Array.isArray(caps)) return;
            livros[l.nome] = {
                livro: l,
                caps: caps.map(function (c) {
                    return Array.isArray(c) ? c.map(function (v) { return String(v).trim(); })
                        : [];
                })
            };
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
    function importar(texto, nomeArquivo, rotulo) {
        return new Promise(function (ok) {
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
            ok(livros);
        }).then(function (livros) {
            var r = conferir(livros || {});
            if (!r.bons.length) {
                throw new Error('Não reconheci nenhum livro neste arquivo. ' +
                    (r.problemas.length ? r.problemas[0] : 'Confira o formato.'));
            }
            var m = {
                nome: rotulo || 'Edição carregada por você',
                arquivo: nomeArquivo || '',
                criado: new Date().toISOString(),
                livros: r.bons.length,
                capitulos: r.capitulos,
                versiculos: r.versiculos,
                problemas: r.problemas
            };
            var pares = r.bons.map(function (b) {
                return [b.arquivo, { livro: b.livro, caps: b.caps }];
            });
            pares.push([CHAVE_META, m]);
            return gravar(pares).then(function () {
                metaCache = m;
                return { meta: m, problemas: r.problemas, bons: r.bons };
            });
        });
    }

    return {
        meta: meta, metaAgora: metaAgora, livro: livro, apagar: apagar,
        importar: importar,
        /* expostos para teste e para o verificador */
        lerTexto: lerTexto, lerCorrido: lerCorrido, partirPorNumero: partirPorNumero,
        lerJson: lerJson, conferir: conferir, acharLivro: acharLivro
    };
})();
