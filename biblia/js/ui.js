/* =========================================================
   Peças de interface usadas por todas as telas.
   ========================================================= */
window.B = window.B || {};

B.ui = (function () {
    'use strict';

    function $(id) { return document.getElementById(id); }
    function q(sel, raiz) { return (raiz || document).querySelector(sel); }
    function qq(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }
    var esc = B.md.esc;

    var toastTimer = null;
    function toast(msg, tipo) {
        var el = $('toast');
        if (!el) return;
        el.textContent = msg;
        el.className = 'toast is-on' + (tipo ? ' toast--' + tipo : '');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { el.className = 'toast'; }, 3200);
    }

    /* Modal genérico. Devolve promessa: true no botão de confirmar,
       false em cancelar, fechar ou toque fora. */
    function modal(opcoes) {
        var el = $('modal');
        var corpo = $('modal-corpo');
        $('modal-titulo').textContent = opcoes.titulo || '';
        corpo.innerHTML = opcoes.html || '';
        var pe = $('modal-pe');
        pe.innerHTML = '';

        return new Promise(function (ok) {
            function fechar(valor) {
                el.hidden = true;
                el.removeEventListener('click', fora);
                ok(valor);
            }
            function fora(ev) { if (ev.target === el) fechar(false); }

            if (opcoes.cancelar !== false) {
                var bc = document.createElement('button');
                bc.className = 'btn btn--fraco';
                bc.textContent = opcoes.textoCancelar || 'Cancelar';
                bc.onclick = function () { fechar(false); };
                pe.appendChild(bc);
            }
            var bo = document.createElement('button');
            bo.className = 'btn btn--forte' + (opcoes.perigo ? ' btn--perigo' : '');
            bo.textContent = opcoes.textoOk || 'Confirmar';
            bo.onclick = function () { fechar(true); };
            pe.appendChild(bo);

            $('modal-x').onclick = function () { fechar(false); };
            el.addEventListener('click', fora);
            el.hidden = false;
            if (opcoes.aoAbrir) opcoes.aoAbrir(corpo);
        });
    }

    function confirmar(titulo, texto, opcoes) {
        opcoes = opcoes || {};
        return modal({
            titulo: titulo,
            html: '<p>' + esc(texto) + '</p>',
            textoOk: opcoes.textoOk || 'Confirmar',
            perigo: opcoes.perigo
        });
    }

    function barra(pct, cor) {
        pct = Math.max(0, Math.min(100, pct || 0));
        return '<div class="barra"><i style="width:' + pct + '%' +
            (cor ? ';background:' + cor : '') + '"></i></div>';
    }

    /* Botãozinho de ajuda: explica sem ocupar espaço na tela. */
    var ajudas = {};
    var seqAjuda = 0;
    function ajuda(titulo, html) {
        var id = 'aj' + (++seqAjuda);
        ajudas[id] = { titulo: titulo, html: html };
        return '<button class="ajuda" data-ajuda="' + id + '" aria-label="Explicação: ' +
            esc(titulo) + '">?</button>';
    }
    document.addEventListener('click', function (ev) {
        var b = ev.target.closest ? ev.target.closest('[data-ajuda]') : null;
        if (!b) return;
        var a = ajudas[b.getAttribute('data-ajuda')];
        if (a) modal({ titulo: a.titulo, html: a.html, cancelar: false, textoOk: 'Entendi' });
    });

    function data(iso, curta) {
        var d = new Date(iso);
        if (isNaN(d)) return '';
        return curta
            ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    /* "há 3 dias", que diz mais do que a data em si. */
    function quando(iso) {
        var d = new Date(iso);
        if (isNaN(d)) return '';
        var dias = Math.floor((Date.now() - d.getTime()) / 86400000);
        if (dias <= 0) return 'hoje';
        if (dias === 1) return 'ontem';
        if (dias < 30) return 'há ' + dias + ' dias';
        if (dias < 60) return 'há um mês';
        if (dias < 365) return 'há ' + Math.floor(dias / 30) + ' meses';
        return 'há ' + Math.floor(dias / 365) + ' ano' + (dias >= 730 ? 's' : '');
    }

    function copiar(texto) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(texto)
                .then(function () { return true; }, function () { return caixaDeTexto(texto); });
        }
        return Promise.resolve(caixaDeTexto(texto));
    }

    /* Sem permissão de área de transferência, mostra o texto para copiar
       na mão — melhor do que um erro sem saída. */
    function caixaDeTexto(texto) {
        modal({
            titulo: 'Copie o texto',
            html: '<p class="dica">Seu navegador não deixou copiar sozinho. Selecione tudo e copie.</p>' +
                '<textarea class="campo campo--texto" rows="10" readonly>' + esc(texto) + '</textarea>',
            cancelar: false, textoOk: 'Fechar'
        });
        return false;
    }

    function baixar(nome, conteudo, tipo) {
        var blob = new Blob([conteudo], { type: tipo || 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = nome;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    function compartilhar(titulo, texto) {
        if (navigator.share) {
            return navigator.share({ title: titulo, text: texto })
                .then(function () { return true; }, function () { return false; });
        }
        return copiar(texto).then(function (ok) {
            if (ok) toast('Estudo copiado.');
            return ok;
        });
    }

    return {
        $: $, q: q, qq: qq, esc: esc, toast: toast, modal: modal, confirmar: confirmar,
        barra: barra, ajuda: ajuda, data: data, quando: quando,
        copiar: copiar, baixar: baixar, compartilhar: compartilhar
    };
})();
