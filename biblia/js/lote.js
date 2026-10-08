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
    var TENTATIVAS = 3;         // por alvo, antes de deixar para a repescagem
    var A_CADA = 50;            // estudos entre uma gravação da cópia e outra
    var TETO_ALTO = 32768;      // teto de tamanho na segunda tentativa
    var DIARIO_MAX = 60;        // últimas falhas guardadas com data e hora

    /* Falhas que valem para todo pedido, não só para aquele capítulo: insistir
       nos 2.500 não adianta, e o mutirão para para a pessoa resolver. */
    var DE_CONFIGURACAO = { chave: 1, permissao: 1, modelo: 1 };

    /* Barrado pelo filtro é decisão firme do Google sobre aquele texto: repetir
       o mesmo pedido no mesmo minuto dá o mesmo não, e cada repetição é uma
       chamada da cota do dia queimada. Fica para amanhã, quando a fila o traz
       de volta — e aí talvez com outro modelo escolhido. */
    var SEM_REPETIR_AGORA = { seguranca: 1, bloqueio: 1 };

    var rodando = false;
    var pedirParada = false;
    var ouvintes = [];
    var abortador = null;

    /* ---------- estado guardado ---------- */

    function vazio() {
        return {
            ligado: false, formato: 'ambos', feitos: 0, erros: 0,
            caracteres: 0, ultimoErro: '', em: '', dia: '', feitosHoje: 0,
            cotaDia: null, pausadoAte: null,
            /* Descoberto na primeira falha de teto: a partir daí todo pedido
               já sai com teto alto, em vez de gastar uma chamada de cota para
               errar igual em cada capítulo. */
            tetoAlto: false,
            /* O que falhou, por chave do estudo: some quando ele enfim sai.
               É isto que faz a próxima rodada começar pela dívida. */
            falhas: {},
            /* Quantas vezes cada causa apareceu — o número que diz o que
               consertar. */
            porCausa: {},
            /* As últimas falhas com data, hora e mensagem do Google. */
            diario: []
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

    /* ---------- o que deu errado ---------- */

    function anotarFalha(item, e) {
        var causa = (e && e.causa) || 'desconhecida';
        var chave = B.estudos.chave(item.titulo, item.formato);
        var antes = st.falhas[chave];
        st.falhas[chave] = {
            titulo: item.titulo, formato: item.formato, causa: causa,
            msg: (e && e.message) || 'Falhou.',
            fim: (e && e.finishReason) || '',
            vezes: (antes ? antes.vezes : 0) + 1,
            quando: new Date().toISOString()
        };
        st.porCausa[causa] = (st.porCausa[causa] || 0) + 1;
        st.diario.unshift({
            quando: new Date().toISOString(),
            alvo: item.titulo + (item.formato === 'simples' ? ' (simples)' : ' (completo)'),
            causa: causa, msg: (e && e.message) || 'Falhou.',
            fim: (e && e.finishReason) || ''
        });
        if (st.diario.length > DIARIO_MAX) st.diario = st.diario.slice(0, DIARIO_MAX);
    }

    function esquecerFalha(item) {
        var chave = B.estudos.chave(item.titulo, item.formato);
        if (st.falhas[chave]) delete st.falhas[chave];
    }

    /* Para a pessoa poder mandar o log para alguém olhar. */
    function diarioComoTexto() {
        var linhas = ['# Falhas do mutirão', ''];
        linhas.push('Total de falhas contadas: ' + st.erros);
        Object.keys(st.porCausa).sort(function (a, b) {
            return st.porCausa[b] - st.porCausa[a];
        }).forEach(function (c) {
            linhas.push('- ' + (B.ia.CAUSAS[c] || c) + ': ' + st.porCausa[c]);
        });
        linhas.push('', '## Últimas ' + st.diario.length, '');
        st.diario.forEach(function (d) {
            linhas.push('- ' + d.quando + ' · ' + d.alvo + ' · ' +
                (B.ia.CAUSAS[d.causa] || d.causa) + (d.fim ? ' [' + d.fim + ']' : '') +
                '\n  ' + d.msg);
        });
        return linhas.join('\n');
    }

    function limparFalhas() {
        st.falhas = {};
        st.porCausa = {};
        st.diario = [];
        st.erros = 0;
        gravar();
    }

    function estado() {
        var e = {};
        Object.keys(st).forEach(function (k) { e[k] = st[k]; });
        e.rodando = rodando;
        e.aguardando = Object.keys(st.falhas).length;
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

    /**
     * O que falta, já sem o que está guardado — e com a dívida na frente.
     *
     * O que falhou antes volta para o começo da fila, porque é o mais antigo e
     * porque quase toda falha é passageira (rede, servidor ocupado, o teto de
     * tamanho que a segunda tentativa já corrige). O que falhou muitas vezes
     * vai para o fim: continua sendo tentado todo dia, mas não fica entupindo
     * a cabeça da fila na frente de capítulos que sairiam de primeira.
     */
    function pendentes() {
        return B.estudos.chaves().then(function (chaves) {
            var tem = {};
            chaves.forEach(function (c) { tem[c] = true; });
            var repescagem = [], novos = [], teimosos = [];
            ordem().forEach(function (alvo) {
                var titulo = alvo.livro.nome + (alvo.capitulo ? ' ' + alvo.capitulo : '');
                formatos().forEach(function (f) {
                    var chave = B.estudos.chave(titulo, f);
                    if (tem[chave]) return;
                    var item = { alvo: alvo, titulo: titulo, formato: f };
                    var falha = st.falhas[chave];
                    if (!falha) novos.push(item);
                    else if ((falha.vezes || 0) < 5) repescagem.push(item);
                    else teimosos.push(item);
                });
            });
            return repescagem.concat(novos, teimosos);
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

    /* Pedir teto alto não alonga o estudo — quem manda no tamanho é o prompt.
       O teto só precisa caber o pensamento do modelo mais o texto. */
    function comTeto(cfg) {
        if (!st.tetoAlto || (cfg.limiteGoogle || 0) >= TETO_ALTO) return cfg;
        var c = {};
        Object.keys(cfg).forEach(function (k) { c[k] = cfg[k]; });
        c.limiteGoogle = TETO_ALTO;
        return c;
    }

    function umEstudo(item, cfg) {
        cfg = comTeto(cfg);
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
        var caiuAgora = [];     // falhou nesta passada: volta no fim dela
        var jaRepescou = false; // uma repescagem por rodada, nunca em círculo

        function proximo() {
            if (pedirParada || !st.ligado || i >= fila.length) {
                /*
                 * Repescagem da própria rodada. Boa parte das falhas é do
                 * momento — servidor ocupado, rede oscilando — e tentar de novo
                 * meia hora depois resolve sem esperar o dia virar.
                 */
                if (!pedirParada && st.ligado && caiuAgora.length && !jaRepescou) {
                    /* Uma vez só. Em círculo, um capítulo que falha sempre —
                       barrado pelo filtro, digamos — torraria a cota do dia
                       inteira sozinho. O que não sair aqui fica para amanhã,
                       na frente da fila. */
                    jaRepescou = true;
                    fila = caiuAgora;
                    caiuAgora = [];
                    i = 0;
                    return proximo();
                }
                return Promise.resolve();
            }

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
                    esquecerFalha(item);
                } else {
                    st.erros++;
                    anotarFalha(item, r.erro);
                    if (!r.semRepescagem) caiuAgora.push(item);
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
                if (vez > TENTATIVAS) return { ok: false, erro: e };
                return dormir(espera).then(function () { return tentar(item, cfg, vez + 1); });
            }

            /* Chave, permissão ou modelo errados valem para todo pedido:
               insistir 2.500 vezes não ajuda, e o mutirão para para a pessoa
               resolver. Qualquer outra falha é daquele capítulo, e a fila
               segue. */
            if (DE_CONFIGURACAO[e && e.causa]) {
                st.ultimoErro = e.message;
                gravar();
                return { parar: true, desligar: true };
            }

            if (SEM_REPETIR_AGORA[e && e.causa]) {
                st.ultimoErro = e.message;
                return { ok: false, erro: e, semRepescagem: true };
            }

            if (vez <= TENTATIVAS) {
                /*
                 * Voltou vazio porque o pensamento do modelo comeu o teto de
                 * tamanho? Repetir igual dá igual. A segunda tentativa vai com
                 * teto alto — é o que destrava a maioria dessas.
                 */
                if (e && e.maisTeto && !st.tetoAlto &&
                    (cfg.limiteGoogle || 8192) < TETO_ALTO) {
                    /* Uma vez só: daqui para a frente todo pedido já sai
                       grande, e nenhum outro capítulo gasta cota para
                       descobrir a mesma coisa. */
                    st.tetoAlto = true;
                    gravar();
                }
                return dormir(vez * 4000).then(function () {
                    return tentar(item, cfg, vez + 1);
                });
            }
            st.ultimoErro = (e && e.message) || 'Falhou.';
            return { ok: false, erro: e };
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
        retomarSePreciso: retomarSePreciso, proximaVirada: proximaVirada,
        diarioComoTexto: diarioComoTexto, limparFalhas: limparFalhas
    };
})();
