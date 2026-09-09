/* =========================================================
   Navegação, cabeçalho e o que vale para todas as telas.
   ========================================================= */
window.A = window.A || {};

(function () {
    'use strict';

    var u = A.ui;
    var tela = u.$('tela');

    /* Rota → tela. O que vem depois da barra chega como argumentos:
       #/curso/4 abre o módulo 4, #/dia/12 abre o dia 12. */
    var ROTAS = {
        hoje: 'hoje',
        treinar: 'treinar',
        dia: 'dia',
        programa: 'programa',
        curso: 'curso',
        ferramenta: 'ferramenta',
        biblioteca: 'biblioteca',
        frases: 'frases',
        dicionario: 'dicionario',
        versiculos: 'versiculos',
        modelos: 'modelos',
        antesdepois: 'antesdepois',
        momento: 'momento',
        progresso: 'progresso',
        avaliacao: 'avaliacao',
        config: 'config'
    };

    function navegar() {
        var partes = (location.hash || '#/hoje').replace(/^#\/?/, '').split('/').filter(Boolean);
        var nome = ROTAS[partes[0]] || 'hoje';
        var args = partes.slice(1);

        /* sair de um treino no meio precisa soltar o microfone e o
           cronômetro, senão eles continuam vivos por baixo da próxima tela */
        A.treino.encerrar();
        A.voz.pararFala();
        u.limparAjudas();
        u.fecharModal();

        var fn = A.telas[nome];
        if (!fn) fn = A.telas.hoje;
        tela.innerHTML = '';
        fn(tela, args);
        window.scrollTo(0, 0);
        pintarCabecalho(partes[0] || 'hoje');
    }

    function pintarCabecalho(rota) {
        var s = A.store.get();
        u.$('cab-streak').textContent = s.streak.atual;
        var dia = A.store.diaAtual();
        u.$('cab-dia').textContent = A.store.programaCompleto() ? '21/21' : 'Dia ' + dia;
        var feitos = A.store.diasConcluidos();
        u.$('cab-barra').style.width = Math.round((feitos / 21) * 100) + '%';

        var grupo = { frases: 'biblioteca', dicionario: 'biblioteca', versiculos: 'biblioteca', modelos: 'biblioteca', antesdepois: 'biblioteca', ferramenta: 'curso', dia: 'programa', avaliacao: 'progresso' }[rota] || rota;
        u.qq('.nav-item').forEach(function (b) {
            b.classList.toggle('is-on', b.getAttribute('data-nav') === grupo);
        });
    }

    /* ---------------- eventos globais ---------------- */

    document.addEventListener('click', function (ev) {
        var alvo = ev.target;

        var nav = alvo.closest && alvo.closest('[data-nav]');
        if (nav) {
            var destino = '#/' + nav.getAttribute('data-nav');
            /* Tocar na aba em que já se está precisa recomeçar a tela: sem isto,
               quem está no meio de um treino e toca em "Treinar" fica preso ali
               — o endereço não muda, e sem mudança de endereço nada é redesenhado. */
            if (location.hash === destino) navegar();
            else location.hash = destino;
            return;
        }

        var falar = alvo.closest && alvo.closest('[data-falar]');
        if (falar) {
            var texto = falar.getAttribute('data-falar');
            if (falar.classList.contains('is-falando')) {
                A.voz.pararFala();
                falar.classList.remove('is-falando');
                return;
            }
            u.qq('.is-falando').forEach(function (x) { x.classList.remove('is-falando'); });
            falar.classList.add('is-falando');
            A.voz.falar(texto, { idioma: 'pt-BR' }).then(function () {
                falar.classList.remove('is-falando');
            });
            return;
        }

        var aj = alvo.closest && alvo.closest('[data-ajuda]');
        if (aj) { u.abrirAjuda(parseInt(aj.getAttribute('data-ajuda'), 10)); return; }

        if (alvo.closest && alvo.closest('[data-fechar-modal]')) { u.fecharModal(); return; }
        if (alvo.id === 'modal') u.fecharModal();
    });

    document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape') u.fecharModal();
    });

    /* Sair da página no meio de um treino: solta o microfone. */
    window.addEventListener('pagehide', function () {
        try { A.voz.pararEscuta(); A.voz.pararFala(); } catch (e) { }
    });

    window.addEventListener('hashchange', navegar);

    /* ---------------- partida ---------------- */

    if (!location.hash) location.hash = '#/hoje';
    navegar();

    /* O lembrete precisa ser rearmado a cada abertura: no navegador ele
       vive num temporizador da própria página. */
    try { A.lembrete.aplicar(); } catch (e) { }

    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
        navigator.serviceWorker.register('sw.js').catch(function () { });
    }
})();
