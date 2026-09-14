/* =========================================================
   Estado — tudo no próprio aparelho, nada sai daqui.

   Duas coisas diferentes são guardadas, e é importante não confundir:

   1. A POSIÇÃO de cada grupo: onde o plano está hoje (livro e capítulo
      da próxima leitura). É o que faz o app dizer "hoje: Gênesis 12".
   2. O QUE JÁ FOI LIDO: um conjunto de capítulos por livro, guardado em
      intervalos ("1-11,15"). É isso que a importação preenche quando você
      diz o que leu antes de instalar o app, e é daí que sai o progresso
      real da Bíblia inteira.

   Separar os dois permite marcar 40 anos de leitura sem mexer no plano,
   e mexer no plano sem inventar leitura que não houve.
   ========================================================= */
window.B = window.B || {};

B.store = (function () {
    'use strict';

    var CHAVE = 'bib:estado';
    var bib = B.biblia;

    var PADRAO = {
        v: 2,
        criado: null,
        grupos: {},          // id -> { livro, cap, ciclos, lidosNoApp, hoje }
        lidos: {},           // 'Gênesis' -> '1-11,15'
        historico: [],       // { data, grupo, livro, cap, icone }
        datas: [],           // '2026-09-14' (ISO curta, ordenável)
        sequencia: 0,
        recorde: 0,
        ultimaData: null,
        biblias: 0,          // Bíblias inteiras concluídas pelo plano
        config: {
            chave: '',                 // chave da API da Anthropic
            modelo: 'claude-opus-5',
            esforco: 'high',
            buscaWeb: true,
            versao: 'ARA',             // tradução citada no estudo
            tradicao: 'equilibrada',   // viés confessional pedido ao modelo
            tamanho: 'completo'
        }
    };

    var estado = null;
    var idx = {};   // 'Gênesis' -> Set de capítulos lidos (espelho de lidos)

    /* ---------- intervalos ---------- */
    /* "1-3,7" <-> Set{1,2,3,7}. Guardar em intervalo é o que deixa
       1.189 capítulos caberem num backup que dá para ler com o olho. */

    function deTexto(txt) {
        var s = new Set();
        String(txt || '').split(',').forEach(function (p) {
            p = p.trim();
            if (!p) return;
            var m = p.match(/^(\d+)\s*-\s*(\d+)$/);
            if (m) {
                var a = parseInt(m[1], 10), b = parseInt(m[2], 10);
                for (var i = Math.min(a, b); i <= Math.max(a, b); i++) s.add(i);
            } else if (/^\d+$/.test(p)) {
                s.add(parseInt(p, 10));
            }
        });
        return s;
    }

    function paraTexto(set) {
        var nums = Array.from(set).sort(function (a, b) { return a - b; });
        var partes = [], ini = null, ant = null;
        nums.forEach(function (n) {
            if (ini === null) { ini = ant = n; return; }
            if (n === ant + 1) { ant = n; return; }
            partes.push(ini === ant ? String(ini) : ini + '-' + ant);
            ini = ant = n;
        });
        if (ini !== null) partes.push(ini === ant ? String(ini) : ini + '-' + ant);
        return partes.join(',');
    }

    function reindexar() {
        idx = {};
        Object.keys(estado.lidos || {}).forEach(function (nome) {
            if (!bib.livro(nome)) return;   // livro de versão antiga: ignora
            idx[nome] = deTexto(estado.lidos[nome]);
        });
    }

    function gravarIndice(nome) {
        var s = idx[nome];
        if (!s || s.size === 0) delete estado.lidos[nome];
        else estado.lidos[nome] = paraTexto(s);
    }

    /* ---------- persistência ---------- */

    function clone(o) { return JSON.parse(JSON.stringify(o)); }

    function grupoNovo(id) {
        return { livro: bib.grupo(id).livros[0].nome, cap: 1, ciclos: 0, lidosNoApp: 0, hoje: false };
    }

    function novo() {
        var e = clone(PADRAO);
        e.criado = hojeISO();
        bib.GRUPOS.forEach(function (g) { e.grupos[g.id] = grupoNovo(g.id); });
        return e;
    }

    function carregar() {
        var e;
        try {
            var bruto = localStorage.getItem(CHAVE);
            e = bruto ? JSON.parse(bruto) : null;
        } catch (err) { e = null; }

        if (!e) e = novo();
        else e = completar(e);

        estado = e;
        reindexar();
        virarODia();
        return estado;
    }

    /* Completa chaves que não existiam antes e conserta grupo faltando. */
    function completar(e) {
        var p = clone(PADRAO);
        for (var k in p) if (!(k in e)) e[k] = p[k];
        for (var c in p.config) if (!(c in (e.config || {}))) e.config[c] = p.config[c];
        e.grupos = e.grupos || {};
        bib.GRUPOS.forEach(function (g) {
            var s = e.grupos[g.id];
            if (!s) { e.grupos[g.id] = grupoNovo(g.id); return; }
            if (!bib.livro(s.livro)) s.livro = bib.grupo(g.id).livros[0].nome;
            var l = bib.livro(s.livro);
            s.cap = Math.min(Math.max(1, s.cap || 1), l.caps);
            s.ciclos = s.ciclos || 0;
            s.lidosNoApp = s.lidosNoApp || 0;
            s.hoje = !!s.hoje;
        });
        e.v = 2;
        return e;
    }

    function salvar() {
        try {
            localStorage.setItem(CHAVE, JSON.stringify(estado));
            return true;
        } catch (err) {
            /* Cota estourada: o histórico é a parte descartável. */
            estado.historico = estado.historico.slice(0, 60);
            try { localStorage.setItem(CHAVE, JSON.stringify(estado)); return true; }
            catch (err2) { return false; }
        }
    }

    /* ---------- datas ---------- */

    function hojeISO(d) {
        var x = d ? new Date(d) : new Date();
        return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') +
            '-' + String(x.getDate()).padStart(2, '0');
    }

    /* Se o último uso foi ontem ou antes, hoje ninguém leu ainda. */
    function virarODia() {
        if (estado.ultimaData !== hojeISO()) {
            Object.keys(estado.grupos).forEach(function (id) { estado.grupos[id].hoje = false; });
        }
    }

    /* ---------- leitura registrada ---------- */

    function leu(nomeLivro, cap) {
        var s = idx[nomeLivro];
        return !!(s && s.has(cap));
    }

    function marcar(nomeLivro, cap, valor) {
        var l = bib.livro(nomeLivro);
        if (!l || cap < 1 || cap > l.caps) return false;
        if (!idx[nomeLivro]) idx[nomeLivro] = new Set();
        if (valor === false) idx[nomeLivro].delete(cap);
        else idx[nomeLivro].add(cap);
        gravarIndice(nomeLivro);
        return true;
    }

    function marcarFaixa(nomeLivro, de, ate, valor) {
        var l = bib.livro(nomeLivro);
        if (!l) return 0;
        var n = 0;
        for (var i = Math.max(1, de); i <= Math.min(l.caps, ate); i++) {
            if (marcar(nomeLivro, i, valor)) n++;
        }
        return n;
    }

    function lidosNoLivro(nomeLivro) {
        var s = idx[nomeLivro];
        return s ? s.size : 0;
    }

    function capitulosDoLivro(nomeLivro) {
        var s = idx[nomeLivro];
        return s ? Array.from(s).sort(function (a, b) { return a - b; }) : [];
    }

    function totalLidos() {
        return Object.keys(idx).reduce(function (t, n) { return t + idx[n].size; }, 0);
    }

    function lidosNoGrupo(id) {
        return bib.grupo(id).livros.reduce(function (t, l) { return t + lidosNoLivro(l.nome); }, 0);
    }

    /* Primeiro capítulo ainda não lido de um grupo, para alinhar o plano
       com o que a importação disse. Se o grupo inteiro já foi lido, volta
       ao começo: é um novo ciclo. */
    function primeiroNaoLido(id) {
        var livros = bib.grupo(id).livros;
        for (var i = 0; i < livros.length; i++) {
            for (var c = 1; c <= livros[i].caps; c++) {
                if (!leu(livros[i].nome, c)) return { livro: livros[i].nome, cap: c };
            }
        }
        return { livro: livros[0].nome, cap: 1 };
    }

    /* ---------- importação ---------- */

    /* Backup do app antigo (o HTML de uma página só). Formato:
       { groups: { pentateuco: {currentBookIndex, currentChapter, completedCycles,
         totalChaptersRead, todayRead} }, history, readDates, streak, maxStreak,
         lastReadDate, totalBiblesCompleted }
       O antigo só sabia a posição; o que já foi lido é deduzido dela —
       tudo antes da posição atual, mais o grupo inteiro por ciclo fechado. */
    function ehFormatoAntigo(o) {
        return !!(o && o.groups && !o.grupos);
    }

    function converterAntigo(o) {
        var e = novo();
        var mapaNomes = {
            pentateuco: 'pentateuco', historicos: 'historicos', poesia: 'poesia',
            profeticos: 'profeticos', profetasMenores: 'profetasMenores',
            evangelhos: 'evangelhos', cartasPaulinas: 'cartasPaulinas',
            cartasGerais: 'cartasGerais'
        };

        Object.keys(o.groups || {}).forEach(function (k) {
            var id = mapaNomes[k];
            if (!id || !bib.grupo(id)) return;
            var g = o.groups[k], livros = bib.grupo(id).livros;
            var bi = Math.min(Math.max(0, g.currentBookIndex || 0), livros.length - 1);
            var cap = Math.min(Math.max(1, g.currentChapter || 1), livros[bi].caps);

            e.grupos[id] = {
                livro: livros[bi].nome, cap: cap,
                ciclos: g.completedCycles || 0,
                lidosNoApp: g.totalChaptersRead || 0,
                hoje: false
            };

            /* Ciclo fechado = grupo inteiro lido pelo menos uma vez. */
            if ((g.completedCycles || 0) > 0) {
                livros.forEach(function (l) { e.lidos[l.nome] = '1-' + l.caps; });
            }
            /* Mais o trecho andado no ciclo em curso. */
            for (var i = 0; i < bi; i++) e.lidos[livros[i].nome] = '1-' + livros[i].caps;
            if (cap > 1) {
                var atual = livros[bi];
                var jaTem = deTexto(e.lidos[atual.nome] || '');
                for (var c = 1; c < cap; c++) jaTem.add(c);
                e.lidos[atual.nome] = paraTexto(jaTem);
            }
        });

        (o.history || []).forEach(function (h) {
            e.historico.push({
                data: h.date, grupo: h.group, livro: h.book,
                cap: h.chapter, icone: h.icon || '📖'
            });
        });
        e.datas = (o.readDates || []).map(function (d) {
            var dt = new Date(d);
            return isNaN(dt) ? null : hojeISO(dt);
        }).filter(Boolean);
        e.sequencia = o.streak || 0;
        e.recorde = o.maxStreak || 0;
        e.biblias = o.totalBiblesCompleted || 0;
        e.ultimaData = o.lastReadDate ? hojeISO(new Date(o.lastReadDate)) : null;
        return e;
    }

    /* Resumo mostrado antes de confirmar a importação: ninguém deve
       substituir os próprios dados às cegas. */
    function resumoDoArquivo(o) {
        var e = ehFormatoAntigo(o) ? converterAntigo(o) : completar(clone(o));
        var caps = 0;
        Object.keys(e.lidos || {}).forEach(function (n) { caps += deTexto(e.lidos[n]).size; });
        var ciclos = Object.keys(e.grupos).reduce(function (t, k) { return t + (e.grupos[k].ciclos || 0); }, 0);
        return {
            estado: e,
            antigo: ehFormatoAntigo(o),
            capitulos: caps,
            ciclos: ciclos,
            dias: (e.datas || []).length,
            sequencia: e.sequencia || 0,
            biblias: e.biblias || 0,
            historico: (e.historico || []).length
        };
    }

    function substituirPor(novoEstado) {
        estado = completar(novoEstado);
        reindexar();
        virarODia();
        salvar();
    }

    /* Texto colado: "Gênesis 1-50, Salmos 1-41; João" — vale tudo que o
       interpretador de referência entende, com ou sem intervalo. Livro sem
       número quer dizer o livro inteiro. */
    function interpretarLista(texto) {
        var achados = [], erros = [];
        String(texto || '').split(/[,;\n]+/).forEach(function (bruto) {
            var p = bruto.trim();
            if (!p) return;

            var m = p.match(/^(.+?)\s*(\d{1,3})\s*(?:-|–|a|até)\s*(\d{1,3})\s*$/i);
            if (m) {
                var r = bib.interpretar(m[1]);
                if (!r) { erros.push(p); return; }
                achados.push({ livro: r.livro, de: parseInt(m[2], 10), ate: parseInt(m[3], 10), texto: p });
                return;
            }
            var r2 = bib.interpretar(p);
            if (!r2) { erros.push(p); return; }
            if (r2.capitulo) achados.push({ livro: r2.livro, de: r2.capitulo, ate: r2.capitulo, texto: p });
            else achados.push({ livro: r2.livro, de: 1, ate: r2.livro.caps, texto: p });
        });
        return { achados: achados, erros: erros };
    }

    function aplicarLista(achados) {
        var n = 0;
        achados.forEach(function (a) {
            for (var c = Math.max(1, a.de); c <= Math.min(a.livro.caps, a.ate); c++) {
                if (!leu(a.livro.nome, c)) { marcar(a.livro.nome, c, true); n++; }
            }
        });
        salvar();
        return n;
    }

    /* ---------- backup ---------- */

    function paraBackup(estudos) {
        return {
            app: 'leitura-biblica',
            v: 2,
            exportadoEm: new Date().toISOString(),
            estado: (function () { var c = clone(estado); delete c.config.chave; return c; })(),
            estudos: estudos || []
        };
    }

    function get() { return estado; }
    function setConfig(chave, valor) { estado.config[chave] = valor; salvar(); }

    function zerar() {
        estado = novo();
        idx = {};
        salvar();
    }

    return {
        carregar: carregar, salvar: salvar, get: get, setConfig: setConfig, zerar: zerar,
        hojeISO: hojeISO, virarODia: virarODia,
        deTexto: deTexto, paraTexto: paraTexto,
        leu: leu, marcar: marcar, marcarFaixa: marcarFaixa,
        lidosNoLivro: lidosNoLivro, capitulosDoLivro: capitulosDoLivro,
        totalLidos: totalLidos, lidosNoGrupo: lidosNoGrupo, primeiroNaoLido: primeiroNaoLido,
        ehFormatoAntigo: ehFormatoAntigo, converterAntigo: converterAntigo,
        resumoDoArquivo: resumoDoArquivo, substituirPor: substituirPor,
        interpretarLista: interpretarLista, aplicarLista: aplicarLista,
        paraBackup: paraBackup, grupoNovo: grupoNovo
    };
})();
