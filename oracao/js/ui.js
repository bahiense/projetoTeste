/* =========================================================
   Peças de interface reaproveitadas pelas telas.
   ========================================================= */
window.A = window.A || {};

A.ui = (function () {
    'use strict';

    function $(id) { return document.getElementById(id); }
    function q(sel, raiz) { return (raiz || document).querySelector(sel); }
    function qq(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }

    function esc(s) {
        return String(s === undefined || s === null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    var toastTimer = null;
    function toast(msg, tipo) {
        var el = $('toast');
        if (!el) return;
        el.textContent = msg;
        el.className = 'toast is-on' + (tipo ? ' toast--' + tipo : '');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { el.className = 'toast'; }, 2800);
    }

    /* Anel de nota, 0 a 100. */
    function anel(pct, rotulo, cor) {
        pct = Math.max(0, Math.min(100, Math.round(pct || 0)));
        if (cor === 'neutro') cor = 'var(--accent)';
        else if (!cor) cor = pct >= 80 ? 'var(--ok)' : pct >= 55 ? 'var(--warn)' : 'var(--bad)';
        return '<div class="anel" style="--pct:' + pct + ';--cor:' + cor + '">' +
            '<div class="anel-num">' + pct + '</div>' +
            (rotulo ? '<div class="anel-rot">' + esc(rotulo) + '</div>' : '') +
            '</div>';
    }

    /* Cor de nota: o mesmo semáforo em todas as telas. */
    function corNota(n) {
        return n >= 80 ? 'var(--ok)' : n >= 55 ? 'var(--warn)' : 'var(--bad)';
    }

    function barra(pct, cor) {
        pct = Math.max(0, Math.min(100, Math.round(pct || 0)));
        return '<div class="barra"><i style="width:' + pct + '%' +
            (cor ? ';background:' + cor : '') + '"></i></div>';
    }

    /* Linha de medida: rótulo, barra e valor. Usada no resultado do treino. */
    function medida(rotulo, pct, valor, cor) {
        return '<div class="medida">' +
            '<div class="medida-top"><span>' + esc(rotulo) + '</span><b>' + esc(valor) + '</b></div>' +
            barra(pct, cor) + '</div>';
    }

    function embaralhar(a) {
        var arr = a.slice();
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
    }

    function sorteio(a) { return a[Math.floor(Math.random() * a.length)]; }

    function botaoOuvir(texto, rotulo) {
        return '<button class="btn btn--som" data-falar="' + esc(texto) + '">🔊 ' +
            esc(rotulo || 'Ouvir') + '</button>';
    }

    function cabecalho(titulo, sub, extra) {
        return '<header class="tela-head">' +
            '<h2>' + esc(titulo) + '</h2>' +
            (sub ? '<p>' + esc(sub) + '</p>' : '') +
            (extra || '') + '</header>';
    }

    function aviso(html, tipo) {
        return '<div class="aviso' + (tipo ? ' aviso--' + tipo : '') + '">' + html + '</div>';
    }

    function vazio(texto) { return '<p class="vazio">' + esc(texto) + '</p>'; }

    /* ---------------------------------------------------------
       Ajuda em pop-up: a explicação existe, mas não fica na frente
       do aluno o tempo todo.
       --------------------------------------------------------- */
    var ajudas = [];

    function limparAjudas() { ajudas = []; }

    function ajuda(titulo, conteudo, rotulo) {
        var i = ajudas.push({ titulo: titulo, corpo: conteudo }) - 1;
        return '<button class="btn-ajuda" data-ajuda="' + i + '" ' +
            'aria-label="' + esc('Como funciona: ' + titulo) + '">' +
            (rotulo ? esc(rotulo) : '?') + '</button>';
    }

    function abrirAjuda(i) {
        var a = ajudas[i];
        if (a) abrirModal(a.titulo, a.corpo);
    }

    function abrirModal(titulo, html, semBotao) {
        var m = $('modal');
        if (!m) return;
        $('modal-titulo').textContent = titulo;
        $('modal-corpo').innerHTML = html;
        var b = $('modal-fechar');
        if (b) b.hidden = !!semBotao;
        m.hidden = false;
        document.body.classList.add('sem-rolagem');
        if (b && !semBotao) b.focus();
    }

    function fecharModal() {
        var m = $('modal');
        if (!m) return;
        m.hidden = true;
        document.body.classList.remove('sem-rolagem');
    }

    /* Data legível: "hoje", "ontem", "há 6 dias". Ver a distância importa
       mais do que ver a data. */
    function quando(data) {
        var d = A.store.diasEntre(data, A.store.hoje());
        if (d === 0) return 'hoje';
        if (d === 1) return 'ontem';
        if (d < 7) return 'há ' + d + ' dias';
        if (d < 30) return 'há ' + Math.round(d / 7) + ' semana' + (d >= 14 ? 's' : '');
        return 'há ' + Math.round(d / 30) + ' mês' + (d >= 60 ? 'es' : '');
    }

    return {
        $: $, q: q, qq: qq, esc: esc, toast: toast,
        anel: anel, barra: barra, corNota: corNota, medida: medida,
        embaralhar: embaralhar, sorteio: sorteio,
        botaoOuvir: botaoOuvir, cabecalho: cabecalho, aviso: aviso, vazio: vazio,
        ajuda: ajuda, limparAjudas: limparAjudas, abrirAjuda: abrirAjuda,
        abrirModal: abrirModal, fecharModal: fecharModal, quando: quando
    };
})();
