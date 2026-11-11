/* =========================================================
   Navegação, cabeçalho e partida do app.
   ========================================================= */
window.B = window.B || {};

B.app = (function () {
    'use strict';
    var ui = B.ui;

    var ROTAS = ['hoje', 'ler', 'estudo', 'biblia', 'progresso', 'config', 'oficina',
        'teologia', 'videos', 'tempo', 'mapa', 'exercicios', 'jogos'];

    /*
     * Dentro do Claude o app não é o app: é a oficina onde os estudos são
     * escritos. Ler, marcar capítulo e acompanhar o plano acontecem no
     * celular, com o aparelho na mão — aqui seriam uma segunda cópia das
     * mesmas telas, convidando a marcar leitura no lugar errado.
     */
    function soOficina() { return !!window.__SO_OFICINA; }

    /* E no app instalado não existe oficina: lá não se gera nada. */
    function semOficina() { return !!(B.copia && B.copia.noApk && B.copia.noApk()); }

    function partes() {
        var inicial = soOficina() ? 'oficina' : 'hoje';
        var h = (location.hash || '#/' + inicial).replace(/^#\/?/, '');
        var p = h.split('/');
        var rota = ROTAS.indexOf(p[0]) >= 0 ? p[0] : inicial;
        var arg = p[1] ? decodeURIComponent(p.slice(1).join('/')) : '';
        return { rota: rota, arg: arg };
    }

    function ir(rota, arg) {
        location.hash = '#/' + rota + (arg ? '/' + encodeURIComponent(arg) : '');
    }

    var rotaAnterior = null;

    function pintar() {
        var p = partes();
        if (rotaAnterior === 'estudo' && p.rota !== 'estudo' && B.telas.estudo.abortar) {
            B.telas.estudo.abortar();
        }
        rotaAnterior = p.rota;
        var tela = B.telas[p.rota];
        var alvo = ui.$('tela');
        alvo.innerHTML = tela.render(p.arg);
        alvo.scrollTop = 0;
        window.scrollTo(0, 0);
        if (tela.depois) tela.depois(alvo, p.arg);

        ui.qq('[data-nav]').forEach(function (b) {
            b.classList.toggle('is-on', b.getAttribute('data-nav') === p.rota);
        });
        cabecalho();
    }

    /* Cada lugar mostra as telas que fazem sentido nele. */
    function arrumarNav() {
        var fora = soOficina()
            ? { hoje: 1, biblia: 1, progresso: 1 }
            : semOficina() ? { oficina: 1 } : {};
        ui.qq('[data-nav]').forEach(function (b) {
            b.hidden = !!fora[b.getAttribute('data-nav')];
        });
    }

    function temaAtual() {
        var cfg = B.store.get().config || {};
        if (cfg.tema === 'escuro' || cfg.tema === 'claro') return cfg.tema;
        return 'claro';
    }

    function aplicarTema() {
        var t = temaAtual();
        if (document.documentElement && document.documentElement.setAttribute) {
            document.documentElement.setAttribute('data-tema', t);
        }
        if (document.body && document.body.setAttribute) {
            document.body.setAttribute('data-tema', t);
        }
        var btn = ui.$('cab-tema');
        if (btn) {
            btn.textContent = t === 'escuro' ? '🌙 Noite' : '☀️ Dia';
            btn.setAttribute('title', t === 'escuro' ? 'Modo Noite ativo (toque para modo Dia)' : 'Modo Dia ativo (toque para modo Noite)');
        }
    }

    function alternarTema() {
        var novo = temaAtual() === 'escuro' ? 'claro' : 'escuro';
        B.store.setConfig('tema', novo);
        aplicarTema();
        ui.toast(novo === 'escuro' ? '🌙 Modo Noite ativado.' : '☀️ Modo Dia ativado.');
    }

    function cabecalho() {
        var e = B.store.get();
        var pb = B.plano.progressoBiblia();
        ui.$('cab-streak').textContent = e.sequencia;
        ui.$('cab-pct').textContent = pb.pct + '%';
        ui.$('cab-barra').style.width = pb.pct + '%';
        aplicarTema();
    }

    /* Conta quantos grupos ainda não foram lidos hoje, para o app poder
       dizer "faltam 3" sem a pessoa precisar contar cartão por cartão. */
    function faltamHoje() {
        var e = B.store.get();
        return B.biblia.GRUPOS.filter(function (g) { return !e.grupos[g.id].hoje; }).length;
    }

    function iniciar() {
        B.store.carregar();
        aplicarTema();

        window.addEventListener('hashchange', pintar);
        ui.qq('[data-nav]').forEach(function (b) {
            b.addEventListener('click', function () { ir(b.getAttribute('data-nav')); });
        });
        arrumarNav();
        var btnTema = ui.$('cab-tema');
        if (btnTema) btnTema.addEventListener('click', alternarTema);
        ui.$('cab-config').addEventListener('click', function (ev) {
            ev.preventDefault();
            ir('config');
        });

        /* Voltar de um dia para o outro sem recarregar a página: o app fica
           aberto no celular por semanas. */
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState !== 'visible') return;
            var antes = JSON.stringify(B.store.get().grupos);
            B.store.virarODia();
            if (JSON.stringify(B.store.get().grupos) !== antes) pintar();
        });

        pintar();

        /* Descobrir se estamos dentro do Claude leva alguns instantes; quando
           a resposta chega, a tela de estudo muda de cara (deixa de pedir
           chave), então vale repintar. */
        B.ia.detectar().then(function (m) {
            if (m === 'claude') pintar();
        });

        /*
         * O índice dos lugares vem por fetch, e o botão de Mapa depende dele
         * para não levar a uma tela vazia. Carrega na abertura e repinta uma
         * vez — sem isto, quem abre o app direto num capítulo não vê o botão
         * até trocar de tela.
         */
        Promise.all([
            B.lugares ? B.lugares.carregar() : null
        ]).then(function () {
            /* Só onde esse botão aparece: repintar a Oficina no meio de
               uma conta assíncrona dela é trocar o DOM debaixo do próprio
               código que está rodando. */
            var r = partes().rota;
            if (r === 'ler' || r === 'estudo') pintar();
        }, function () { });

        /*
         * Os pacotes que o Claude escreveu no Chrome entram sozinhos.
         *
         * É o que faz a travessia não ser tarefa de ninguém: a pessoa gera
         * numa ponta e abre o app na outra; os estudos já estão aqui. Só
         * acrescenta — a leitura marcada neste aparelho continua sendo a
         * deste aparelho.
         */
        setTimeout(function () {
            if (!B.copia || !B.copia.trazerPacotes) return;
            /*
             * Antes dos pacotes, o estado: quem reinstalou o app tem na pasta
             * apontada o plano e os capítulos lidos. Entra sozinho, porque
             * aqui não há nada para substituir — e sem isto a pessoa
             * reinstala e perde anos de leitura registrada enquanto os
             * estudos voltam normalmente.
             */
            B.copia.trazerEstado().then(function (r) {
                if (!r) return;
                B.ui.toast('Sua leitura voltou da pasta de cópias: ' +
                    r.capitulos + ' capítulos.');
                B.app.pintar();
            }, function () { });
            B.copia.trazerPacotes().then(function (n) {
                if (!n) return;
                B.ui.toast(n + ' estudo' + (n === 1 ? '' : 's') + ' do Claude ' +
                    (n === 1 ? 'entrou' : 'entraram') + ' no app.');
                B.app.pintar();
            });
        }, 1200);

        /* Mutirão deixado ligado: se a cota do Google já virou, ele volta
           sozinho — senão a pessoa teria de lembrar de reapertar o botão toda
           manhã, por dias seguidos, que é justamente o que ele existe para
           evitar. */
        setTimeout(function () {
            if (B.lote) B.lote.retomarSePreciso();
        }, 3000);

        /*
         * E volta também toda vez que o app reaparece ou a internet volta.
         *
         * No Android, app fora da frente é WebView suspenso: o mutirão para no
         * meio e, sem isto, só recomeçaria numa abertura fria. Pegar o celular
         * do bolso passa a bastar. O retomarSePreciso já recusa quando não é
         * para voltar — cota do dia, chave marcada por cobrança —, então pode
         * ser chamado à vontade.
         */
        document.addEventListener('visibilitychange', function () {
            if (!document.hidden && B.lote) B.lote.retomarSePreciso();
        });
        window.addEventListener('online', function () {
            if (B.lote) B.lote.retomarSePreciso();
        });

        if (!window.__SEM_SW && 'serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
            navigator.serviceWorker.register('sw.js').catch(function () { });
        }
    }

    return { iniciar: iniciar, ir: ir, pintar: pintar, cabecalho: cabecalho, faltamHoje: faltamHoje };
})();

/* O Chrome avisa quando o app pode ser instalado; guardamos o convite
   para oferecer o botão em Ajustes em vez de deixar o navegador decidir
   a hora de perguntar. */
B.instalar = (function () {
    'use strict';
    var convite = null;
    window.addEventListener('beforeinstallprompt', function (ev) {
        ev.preventDefault();
        convite = ev;
        B.instalar.pronto = true;
    });
    window.addEventListener('appinstalled', function () {
        convite = null;
        B.instalar.pronto = false;
    });
    return {
        pronto: false,
        pedir: function () {
            if (!convite) return;
            convite.prompt();
            convite = null;
            B.instalar.pronto = false;
        }
    };
})();

window.addEventListener('DOMContentLoaded', function () { B.app.iniciar(); });
