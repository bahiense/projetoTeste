/* =========================================================
   REFERÊNCIAS CRUZADAS — onde mais a Bíblia diz isto.

   Não são escritas pela IA. Vêm do conjunto do openbible.info
   (CC BY), 341 mil ligações entre versículos votadas por leitores ao
   longo de anos, conferidas uma a uma contra o texto que o app tem
   (ferramentas/gerar-referencias.py). Por isso aqui não há "confira se
   existe": existe.

   Um arquivo por livro, carregado sob demanda e guardado pelo service
   worker, como o texto bíblico. São 3 MB no total; ninguém baixa tudo
   para ler um salmo.
   ========================================================= */
window.B = window.B || {};

B.referencias = (function () {
    'use strict';

    var cache = {};      // 'JHN' -> { refs: {...} }
    var pedidos = {};

    var PORUSFM = (function () {
        var m = {};
        (B.biblia.LIVROS || []).forEach(function (l) { m[l.usfm] = l; });
        return m;
    })();

    function carregar(usfm) {
        var l = PORUSFM[usfm];
        if (!l) return Promise.reject(new Error('livro desconhecido: ' + usfm));
        if (cache[usfm]) return Promise.resolve(cache[usfm]);
        if (pedidos[usfm]) return pedidos[usfm];

        pedidos[usfm] = fetch('data/referencias/' + l.arquivo + '.json')
            .then(function (r) {
                if (!r.ok) throw new Error('sem referências de ' + l.nome);
                return r.json();
            })
            .then(function (d) {
                cache[usfm] = d;
                delete pedidos[usfm];
                return d;
            }, function (e) {
                delete pedidos[usfm];
                /* Sem arquivo, o app segue sem as ligações — elas são um
                   acréscimo, não uma dependência. */
                cache[usfm] = { refs: {} };
                return cache[usfm];
            });
        return pedidos[usfm];
    }

    /** As ligações de um versículo: ['JHN 1.1-3', 'HEB 11.3', ...] */
    function doVersiculo(usfm, cap, v) {
        var d = cache[usfm];
        if (!d) return [];
        var c = d.refs[String(cap)];
        return (c && c[String(v)]) || [];
    }

    /**
     * As ligações de uma faixa de versículos, sem repetir.
     *
     * A ordem é a do texto: o primeiro versículo da faixa primeiro, e
     * dentro dele a ordem do conjunto, que é a dos mais votados.
     */
    function daFaixa(usfm, cap, v1, v2) {
        var vistas = {};
        var fora = [];
        for (var v = v1; v <= v2; v++) {
            doVersiculo(usfm, cap, v).forEach(function (r) {
                if (vistas[r]) return;
                vistas[r] = true;
                fora.push({ ref: r, de: v });
            });
        }
        return fora;
    }

    /** 'JHN 1.1-3' -> { texto: 'João 1.1-3', rota: '#/ler/João 1' } */
    function humana(ref) {
        var m = String(ref || '').match(/^(\S+) (\d+)\.(\d+)(?:-(\d+))?$/);
        if (!m || !PORUSFM[m[1]]) return null;
        var nome = PORUSFM[m[1]].nome;
        return {
            texto: nome + ' ' + m[2] + '.' + m[3] + (m[4] ? '-' + m[4] : ''),
            curto: (PORUSFM[m[1]].apelidos && PORUSFM[m[1]].apelidos[1]
                ? PORUSFM[m[1]].apelidos[1] : nome) + ' ' + m[2] + '.' + m[3] +
                (m[4] ? '-' + m[4] : ''),
            livro: nome,
            capitulo: parseInt(m[2], 10),
            de: parseInt(m[3], 10),
            ate: parseInt(m[4] || m[3], 10)
        };
    }

    /* O crédito que a licença exige, dito onde as ligações aparecem. */
    var CREDITO = 'Ligações do openbible.info (CC BY), conferidas contra o texto do app.';

    return {
        carregar: carregar, doVersiculo: doVersiculo, daFaixa: daFaixa,
        humana: humana, CREDITO: CREDITO
    };
})();
