/* =========================================================
   Mutirão: gerar os estudos da Bíblia inteira, sozinho.

   São 1.189 capítulos e 66 livros, nos dois formatos: 2.510 estudos.
   Um por vez, na mão, isso não acontece nunca. Aqui o app faz a fila
   andar sozinho enquanto está aberto, e guarda onde parou.

   Três coisas moldam o desenho, e todas vêm da mesma raiz — a cota
   gratuita do Google:

   1. NINGUÉM SABE QUAL É A COTA. O Google parou de publicar os números
      do plano gratuito, e os relatos de 2026 vão de 20 a 1.500 pedidos
      por dia. Então o app não chuta: ele descobre. Quando o 429 chega,
      o corpo do erro traz o valor real da cota daquela chave, e é esse
      número que a tela passa a mostrar.

   2. ACABAR A COTA NÃO É ERRO, é fim de expediente. O mutirão para,
      anota a hora da virada (meia-noite no Pacífico) e volta sozinho no
      dia seguinte, de onde parou.

   3. A ORDEM IMPORTA. A fila segue o plano de leitura — o próximo
      capítulo de cada um dos oito grupos, e assim por diante. Se a cota
      só der para cem estudos por dia, que sejam os cem que você vai ler
      primeiro.

   Enquanto roda, a cópia automática fica suspensa: com a Bíblia inteira
   estudada o backup passa de 25 MB, e regravá-lo a cada estudo seriam
   dezenas de gigabytes à toa. Ela é gravada a cada 50 e no fim.
   ========================================================= */
window.B = window.B || {};

B.lote = (function () {
    'use strict';

    var CHAVE = 'bib:lote';
    var ESPERA_PADRAO = 7000;   // 10 pedidos por minuto, com folga
    var TENTATIVAS = 3;         // por alvo, antes de pular
    var A_CADA = 50;            // estudos entre uma gravação da cópia e outra

    var rodando = false;
    var pedirParada = false;
    var ouvintes = [];
    var abortador = null;

    /* ---------- estado guardado ---------- */

    function vazio() {
        return {
            ligado: false, formato: 'ambos', feitos: 0, erros: 0,
            caracteres: 0, ultimoErro: '', em: '', dia: '', feitosHoje: 0,
            cotaDia: null, pausadoAte: null
        };
    }

    var st = (function () {
        try {
            var g = JSON.parse(localStorage.getItem(CHAVE) || 'null');
            if (!g) return vazio();
            var v = vazio();
            Object.keys(v).forEach(function (k) { if (k in g) v[k] = g[k]; });
            return v;
        } catch (e) { return vazio(); }
    })();

    function gravar() {
        try { localStorage.setItem(CHAVE, JSON.stringify(st)); } catch (e) { }
        avisar();
    }

    function avisar() {
        ouvintes.forEach(function (f) { try { f(estado()); } catch (e) { } });
    }

    function aoMudar(f) { ouvintes.push(f); }

    function estado() {
        var e = {};
        Object.keys(st).forEach(function (k) { e[k] = st[k]; });
        e.rodando = rodando;
        e.esperandoCota = !!(st.ligado && !rodando && st.pausadoAte &&
            new Date(st.pausadoAte) > new Date());
        return e;
    }

    /* ---------- a fila ---------- */

    /**
     * Todos os capítulos, na ordem em que o plano os entrega: o próximo de
     * cada grupo, depois o seguinte de cada grupo, e assim por diante. Os
     * livros inteiros vão no fim — eles resumem o que os capítulos já cobrem.
     */
    function ordem() {
        var bib = B.biblia;
        var e = B.store.get();
        var filas = bib.GRUPOS.map(function (g) {
            var livros = bib.grupo(g.id).livros;
            var pos = e.grupos[g.id];
            var atual = bib.livro(pos.livro) || livros[0];
            var i = livros.indexOf(atual);
            if (i < 0) i = 0;
            var cap = pos.cap || 1;
            var fila = [];
            /* Uma volta completa no grupo, começando de onde ele está. */
            for (var passo = 0; passo < livros.length; passo++) {
                var l = livros[(i + passo) % livros.length];
                var de = (passo === 0) ? cap : 1;
                for (var c = de; c <= l.caps; c++) fila.push({ livro: l, capitulo: c });
                if (passo === livros.length - 1) {
                    /* fecha o ciclo: o que ficou para trás no livro inicial */
                    for (var c2 = 1; c2 < cap; c2++) fila.push({ livro: atual, capitulo: c2 });
                }
            }
            return fila;
        });

        var lista = [];
        var maior = filas.reduce(function (m, f) { return Math.max(m, f.length); }, 0);
        for (var n = 0; n < maior; n++) {
            for (var k = 0; k < filas.length; k++) if (filas[k][n]) lista.push(filas[k][n]);
        }
        bib.LIVROS.forEach(function (l) { lista.push({ livro: l, capitulo: null }); });
        return lista;
    }

    function formatos() {
        if (st.formato === 'simples') return ['simples'];
        if (st.formato === 'completo') return ['completo'];
        return ['simples', 'completo'];
    }

    /* O que falta, já sem o que está guardado. */
    function pendentes() {
        return B.estudos.chaves().then(function (chaves) {
            var tem = {};
            chaves.forEach(function (c) { tem[c] = true; });
            var fila = [];
            ordem().forEach(function (alvo) {
                var titulo = alvo.livro.nome + (alvo.capitulo ? ' ' + alvo.capitulo : '');
                formatos().forEach(function (f) {
                    if (!tem[B.estudos.chave(titulo, f)]) {
                        fila.push({ alvo: alvo, titulo: titulo, formato: f });
                    }
                });
            });
            return fila;
        });
    }

    /** Números para a tela decidir se vale a pena, antes de começar. */
    function estimativa() {
        return pendentes().then(function (fila) {
            var porDia = st.cotaDia || null;
            /* Média medida nos estudos já guardados; sem eles, uma conta
               grosseira a partir do tamanho pedido no prompt. */
            var mediaSimples = 4500, mediaCompleta = 18000;
            var bytes = fila.reduce(function (t, i) {
                return t + (i.formato === 'simples' ? mediaSimples : mediaCompleta);
            }, 0);
            return {
                faltam: fila.length,
                mb: bytes / 1048576,
                dias: porDia ? Math.ceil(fila.length / porDia) : null,
                cotaDia: porDia,
                horas: fila.length * (ESPERA_PADRAO / 1000) / 3600
            };
        });
    }

    /* ---------- a volta da meia-noite do Pacífico ---------- */

    /**
     * A cota diária do Google vira à meia-noite no Pacífico, que aqui cai de
     * madrugada (4h ou 5h, conforme o horário de verão de lá). Em vez de
     * calendário e fuso na mão, pega-se a hora do Pacífico agora e soma-se o
     * que falta para ela fechar o dia.
     */
    function proximaVirada() {
        var agora = new Date();
        var la;
        try {
            la = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
        } catch (e) {
            la = new Date(agora.getTime() - 8 * 3600e3);
        }
        var faltam = ((23 - la.getHours()) * 3600 + (59 - la.getMinutes()) * 60 +
            (60 - la.getSeconds())) * 1000;
        return new Date(agora.getTime() + faltam + 60000).toISOString();
    }

    /* ---------- o laço ---------- */

    function dormir(ms) {
        return new Promise(function (ok) { setTimeout(ok, ms); });
    }

    function hojeISO() { return B.store.hojeISO(); }

    function umEstudo(item, cfg) {
        var pedido = B.prompts.montar(item.alvo, cfg, item.formato);
        abortador = new AbortController();
        var texto = '';
        return B.ia.gerar(pedido, cfg, {
            onTexto: function (_, tudo) { texto = tudo; }
        }, abortador.signal).then(function (r) {
            abortador = null;
            return B.estudos.salvar({
                titulo: item.titulo, formato: item.formato,
                tipo: item.alvo.capitulo ? 'capitulo' : 'livro',
                livro: item.alvo.livro.nome, cap: item.alvo.capitulo || null,
                texto: r.texto || texto, modelo: r.modelo, custo: r.custo,
                buscas: 0, perguntas: [], criado: new Date().toISOString()
            }).then(function () { return (r.texto || texto).length; });
        }, function (e) { abortador = null; throw e; });
    }

    function comecar(opcoes) {
        if (rodando) return Promise.resolve(estado());
        var cfg = B.store.get().config;
        if (!cfg.chaveGoogle) {
            st.ultimoErro = 'O mutirão precisa da chave do Gemini, em Ajustes.';
            st.ligado = false;
            gravar();
            return Promise.resolve(estado());
        }
        if (opcoes && opcoes.formato) st.formato = opcoes.formato;
        st.ligado = true;
        st.pausadoAte = null;
        st.ultimoErro = '';
        pedirParada = false;
        gravar();

        return pendentes().then(function (fila) {
            if (!fila.length) {
                st.ligado = false;
                st.em = '';
                gravar();
                return estado();
            }
            rodando = true;
            acordar(true);
            if (B.copia.suspender) B.copia.suspender();
            avisar();
            return laco(fila, cfg).then(function () {
                rodando = false;
                acordar(false);
                if (B.copia.retomar) B.copia.retomar();
                return B.copia.gravar().catch(function () { }).then(function () {
                    avisar();
                    return estado();
                });
            });
        });
    }

    function laco(fila, cfg) {
        var i = 0, desdeGravacao = 0;

        function proximo() {
            if (pedirParada || !st.ligado || i >= fila.length) return Promise.resolve();

            var item = fila[i];
            st.em = item.titulo + (item.formato === 'simples' ? ' (simples)' : '');
            avisar();

            return tentar(item, cfg, 1).then(function (r) {
                if (r.parar) { st.ligado = r.desligar ? false : st.ligado; return; }
                if (r.ok) {
                    if (st.dia !== hojeISO()) { st.dia = hojeISO(); st.feitosHoje = 0; }
                    st.feitos++;
                    st.feitosHoje++;
                    st.caracteres += r.tamanho || 0;
                    desdeGravacao++;
                } else {
                    st.erros++;
                }
                i++;
                gravar();

                if (desdeGravacao >= A_CADA) {
                    desdeGravacao = 0;
                    if (B.copia.retomar) B.copia.retomar();
                    return B.copia.gravar({ nuvem: false }).catch(function () { }).then(function () {
                        if (B.copia.suspender) B.copia.suspender();
                        return dormir(ESPERA_PADRAO).then(proximo);
                    });
                }
                return dormir(ESPERA_PADRAO).then(proximo);
            });
        }

        return proximo();
    }

    /** Uma tentativa, com o que fazer em cada tipo de tropeço. */
    function tentar(item, cfg, vez) {
        return umEstudo(item, cfg).then(function (tamanho) {
            return { ok: true, tamanho: tamanho };
        }, function (e) {
            if (pedirParada) return { parar: true };

            var q = e && e.quota;
            if (q && q.porDia) {
                /* Fim de expediente, não erro: guarda a cota que o Google
                   acabou de revelar e volta amanhã. */
                if (q.valor) st.cotaDia = q.valor;
                st.pausadoAte = proximaVirada();
                st.ultimoErro = e.message;
                gravar();
                return { parar: true };
            }
            if (q && q.porMinuto) {
                var espera = Math.max(5, q.esperar || 30) * 1000;
                if (vez > TENTATIVAS) return { ok: false };
                return dormir(espera).then(function () { return tentar(item, cfg, vez + 1); });
            }
            if (e && e.fatal) {
                /* Chave inválida ou recusada: insistir 2.500 vezes não ajuda. */
                st.ultimoErro = e.message;
                gravar();
                return { parar: true, desligar: true };
            }
            if (vez <= TENTATIVAS) {
                return dormir(vez * 4000).then(function () { return tentar(item, cfg, vez + 1); });
            }
            st.ultimoErro = (e && e.message) || 'Falhou.';
            return { ok: false };
        });
    }

    function parar() {
        pedirParada = true;
        st.ligado = false;
        st.em = '';
        if (abortador) { try { abortador.abort(); } catch (e) { } }
        gravar();
        return Promise.resolve();
    }

    /**
     * Chamado quando o app abre: se o mutirão ficou ligado e a cota já virou,
     * ele volta sozinho. É o que faz "deixa rodando uns dias" funcionar sem a
     * pessoa ter de lembrar de reapertar o botão toda manhã.
     */
    function retomarSePreciso() {
        if (!st.ligado || rodando) return Promise.resolve(estado());
        if (st.pausadoAte && new Date(st.pausadoAte) > new Date()) return Promise.resolve(estado());
        return comecar();
    }

    /* Tela apagada é app suspenso, e aí o mutirão para no meio. */
    function acordar(ligar) {
        var n = window.AndroidArquivo;
        if (n && typeof n.manterAcordado === 'function') {
            try { n.manterAcordado(!!ligar); return; } catch (e) { }
        }
        if (!navigator.wakeLock) return;
        if (ligar) {
            navigator.wakeLock.request('screen').then(function (t) { acordar.trava = t; },
                function () { });
        } else if (acordar.trava) {
            try { acordar.trava.release(); } catch (e) { }
            acordar.trava = null;
        }
    }

    return {
        comecar: comecar, parar: parar, estado: estado, aoMudar: aoMudar,
        pendentes: pendentes, estimativa: estimativa, ordem: ordem,
        retomarSePreciso: retomarSePreciso, proximaVirada: proximaVirada
    };
})();
