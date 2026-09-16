/* =========================================================
   Navegação, cabeçalho e partida do app.
   ========================================================= */
window.B = window.B || {};

B.app = (function () {
    'use strict';
    var ui = B.ui;

    var ROTAS = ['hoje', 'ler', 'estudo', 'biblia', 'progresso', 'config'];

    function partes() {
        var h = (location.hash || '#/hoje').replace(/^#\/?/, '');
        var p = h.split('/');
        var rota = ROTAS.indexOf(p[0]) >= 0 ? p[0] : 'hoje';
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

    function cabecalho() {
        var e = B.store.get();
        var pb = B.plano.progressoBiblia();
        ui.$('cab-streak').textContent = e.sequencia;
        ui.$('cab-pct').textContent = pb.pct + '%';
        ui.$('cab-barra').style.width = pb.pct + '%';
    }

    /* Conta quantos grupos ainda não foram lidos hoje, para o app poder
       dizer "faltam 3" sem a pessoa precisar contar cartão por cartão. */
    function faltamHoje() {
        var e = B.store.get();
        return B.biblia.GRUPOS.filter(function (g) { return !e.grupos[g.id].hoje; }).length;
    }

    function iniciar() {
        B.store.carregar();

        window.addEventListener('hashchange', pintar);
        ui.qq('[data-nav]').forEach(function (b) {
            b.addEventListener('click', function () { ir(b.getAttribute('data-nav')); });
        });
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
