/* =========================================================
   Peças de interface reaproveitadas por todas as telas.
   ========================================================= */
window.F = window.F || {};

F.ui = (function () {
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
        toastTimer = setTimeout(function () { el.className = 'toast'; }, 2600);
    }

    /* Anel de nota, 0 a 100. */
    /* cor: sem argumento, semáforo de desempenho; 'neutro' para barra de
       progresso, onde estar no começo não é um problema a sinalizar. */
    function anel(pct, rotulo, cor) {
        pct = Math.max(0, Math.min(100, Math.round(pct || 0)));
        if (cor === 'neutro') cor = 'var(--accent)';
        else if (!cor) cor = pct >= 85 ? 'var(--ok)' : pct >= 60 ? 'var(--warn)' : 'var(--bad)';
        return '<div class="anel" style="--pct:' + pct + ';--cor:' + cor + '">' +
            '<div class="anel-num">' + pct + '<small>%</small></div>' +
            (rotulo ? '<div class="anel-rot">' + esc(rotulo) + '</div>' : '') +
            '</div>';
    }

    function barra(pct, cor) {
        pct = Math.max(0, Math.min(100, Math.round(pct || 0)));
        return '<div class="barra"><i style="width:' + pct + '%' + (cor ? ';background:' + cor : '') + '"></i></div>';
    }

    /* Mostra o diff entre o esperado e o que foi ouvido. */
    function diff(resultado) {
        var out = resultado.ops.map(function (o) {
            if (o.op === 'ok') return '<span class="w w--ok">' + esc(o.ref) + '</span>';
            if (o.op === 'troca') return '<span class="w w--troca" title="ouvi: ' + esc(o.hip) + '">' + esc(o.ref) +
                '<em>' + esc(o.hip) + '</em></span>';
            if (o.op === 'faltou') return '<span class="w w--faltou">' + esc(o.ref) + '</span>';
            return '<span class="w w--sobrou">' + esc(o.hip) + '</span>';
        }).join(' ');
        return '<div class="diff">' + out + '</div>';
    }

    function legendaDiff() {
        return '<p class="legenda">' +
            '<span class="w w--ok">certo</span> ' +
            '<span class="w w--troca">saiu diferente</span> ' +
            '<span class="w w--faltou">não saiu</span> ' +
            '<span class="w w--sobrou">sobrou</span></p>';
    }

    function dicasDiagnostico(lista) {
        if (!lista || !lista.length) return '';
        return '<div class="diag">' + lista.map(function (d) {
            return '<div class="diag-item"><b>' + d.n + '×</b> ' + esc(d.dica) +
                ' <a href="#/pronuncia/' + d.id + '" class="link">treinar isso</a></div>';
        }).join('') + '</div>';
    }

    /* Cronômetro regressivo simples; devolve um objeto com parar(). */
    function contagem(segundos, elemento, aoFim) {
        var restante = segundos;
        function pinta() {
            var m = Math.floor(restante / 60), s = restante % 60;
            if (elemento) elemento.textContent = m + ':' + (s < 10 ? '0' : '') + s;
        }
        pinta();
        var t = setInterval(function () {
            restante--;
            pinta();
            if (restante <= 0) {
                clearInterval(t);
                if (aoFim) aoFim();
            }
        }, 1000);
        return {
            parar: function () { clearInterval(t); return segundos - restante; },
            decorrido: function () { return segundos - restante; }
        };
    }

    /* Cronômetro progressivo. */
    function relogio(elemento, aoTique) {
        var seg = 0;
        var t = setInterval(function () {
            seg++;
            if (elemento) {
                var m = Math.floor(seg / 60), s = seg % 60;
                elemento.textContent = m + ':' + (s < 10 ? '0' : '') + s;
            }
            if (aoTique) aoTique(seg);
        }, 1000);
        return { parar: function () { clearInterval(t); return seg; }, seg: function () { return seg; } };
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

    /* Botão de áudio padrão, usado em todas as telas. */
    function botaoOuvir(texto, rotulo, extra) {
        return '<button class="btn btn--som" data-falar="' + esc(texto) + '"' +
            (extra || '') + '>🔊 ' + esc(rotulo || 'Ouvir') + '</button>';
    }

    /* ---------------------------------------------------------
       Ajuda em pop-up.

       A explicação precisa existir — sem ela o aluno não sabe o
       que fazer —, mas não precisa estar na frente dele o tempo
       todo. Fica atrás de um botão, perto do exercício que ela
       explica, e some depois de lida.
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

    function abrirModal(titulo, html) {
        var m = $('modal');
        if (!m) return;
        $('modal-titulo').textContent = titulo;
        $('modal-corpo').innerHTML = html;
        m.hidden = false;
        document.body.classList.add('sem-rolagem');
        var f = $('modal-fechar');
        if (f) f.focus();
    }

    function fecharModal() {
        var m = $('modal');
        if (!m) return;
        m.hidden = true;
        document.body.classList.remove('sem-rolagem');
    }

    function cabecalho(titulo, sub, extra) {
        return '<header class="tela-head">' +
            '<h2>' + esc(titulo) + '</h2>' +
            (sub ? '<p>' + esc(sub) + '</p>' : '') +
            (extra || '') + '</header>';
    }

    function aviso(texto) {
        return '<div class="aviso">' + texto + '</div>';
    }

    /* Feedback textual honesto — nada de "parabéns" para nota 40. */
    function veredito(pct) {
        if (pct >= 95) return 'Impecável. Isso já é nível nativo.';
        if (pct >= 85) return 'Muito bom. Passaria numa conversa real sem ruído.';
        if (pct >= 70) return 'Dá para entender, mas ainda com esforço do outro lado. Repita.';
        if (pct >= 50) return 'Metade se perdeu. Vá mais devagar e exagere os sons marcados.';
        return 'Não saiu. Ouça o modelo três vezes antes de tentar de novo — sem pressa.';
    }

    return {
        $: $, q: q, qq: qq, esc: esc, toast: toast, anel: anel, barra: barra,
        diff: diff, legendaDiff: legendaDiff, dicasDiagnostico: dicasDiagnostico,
        contagem: contagem, relogio: relogio, embaralhar: embaralhar, sorteio: sorteio,
        botaoOuvir: botaoOuvir, cabecalho: cabecalho, aviso: aviso, veredito: veredito,
        ajuda: ajuda, limparAjudas: limparAjudas, abrirAjuda: abrirAjuda,
        abrirModal: abrirModal, fecharModal: fecharModal
    };
})();
