/* =========================================================
   Markdown para HTML, só o que o estudo usa.

   Sem biblioteca: são cinquenta linhas e o app continua sem
   dependência, sem build e funcionando offline. Tudo é escapado
   antes de virar HTML — o texto vem de fora, e texto de fora nunca
   entra na página como marcação.
   ========================================================= */
window.B = window.B || {};

B.md = (function () {
    'use strict';

    function esc(s) {
        return String(s === undefined || s === null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    /* Negrito, itálico, código e link, já com o texto escapado. */
    function linha(t) {
        var s = esc(t);
        s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
        s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
        s = s.replace(/(^|[\s(])_([^_\n]+)_/g, '$1<em>$2</em>');
        s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        return s;
    }

    function render(texto) {
        var linhas = String(texto || '').replace(/\r/g, '').split('\n');
        var html = [], lista = null, paragrafo = [], citando = false;

        function fecharParagrafo() {
            if (paragrafo.length) {
                html.push('<p>' + linha(paragrafo.join(' ')) + '</p>');
                paragrafo = [];
            }
        }
        function fecharLista() {
            if (lista) { html.push('</' + lista + '>'); lista = null; }
        }
        function fecharCitacao() {
            if (citando) { html.push('</blockquote>'); citando = false; }
        }
        function fecharTudo() { fecharParagrafo(); fecharLista(); fecharCitacao(); }

        linhas.forEach(function (l) {
            var t = l.trim();

            if (!t) { fecharParagrafo(); fecharLista(); fecharCitacao(); return; }

            var h = t.match(/^(#{1,6})\s+(.*)$/);
            if (h) {
                fecharTudo();
                var n = Math.min(6, h[1].length + 1);   // ## do texto vira h3 na tela
                html.push('<h' + n + '>' + linha(h[2]) + '</h' + n + '>');
                return;
            }
            if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { fecharTudo(); html.push('<hr>'); return; }

            var ul = t.match(/^[-*•]\s+(.*)$/);
            var ol = t.match(/^(\d+)[.)]\s+(.*)$/);
            if (ul || ol) {
                fecharParagrafo(); fecharCitacao();
                var tipo = ul ? 'ul' : 'ol';
                if (lista && lista !== tipo) fecharLista();
                if (!lista) { lista = tipo; html.push('<' + tipo + '>'); }
                html.push('<li>' + linha(ul ? ul[1] : ol[2]) + '</li>');
                return;
            }
            fecharLista();

            var cit = t.match(/^>\s?(.*)$/);
            if (cit) {
                fecharParagrafo();
                if (!citando) { html.push('<blockquote>'); citando = true; }
                html.push('<p>' + linha(cit[1]) + '</p>');
                return;
            }
            fecharCitacao();

            paragrafo.push(t);
        });

        fecharTudo();
        return html.join('\n');
    }

    /* Títulos das seções, para o índice que flutua no topo do estudo. */
    function secoes(texto) {
        var achadas = [];
        String(texto || '').split('\n').forEach(function (l) {
            var m = l.trim().match(/^(#{2,3})\s+(.*)$/);
            if (m) achadas.push({ nivel: m[1].length, titulo: m[2].trim() });
        });
        return achadas;
    }

    return { render: render, secoes: secoes, esc: esc };
})();
