/* =========================================================
   Ponte com o app Android.

   Duas coisas que o WebView não faz e o navegador faz:

   - Baixar arquivo. No navegador o backup sai de um blob com <a download>;
     o WebView ignora blob:, e o botão "baixar backup" simplesmente não
     faria nada — o pior jeito de um botão de backup falhar.
   - Compartilhar. navigator.share não existe lá dentro.

   No navegador comum esta ponte sai pela porta na primeira linha e tudo
   continua como estava.
   ========================================================= */
(function () {
    'use strict';
    var nativo = window.AndroidArquivo;
    if (!nativo || !window.B || !B.ui) return;

    var baixarWeb = B.ui.baixar;
    var compartilharWeb = B.ui.compartilhar;

    B.ui.baixar = function (nome, conteudo, tipo) {
        try {
            if (nativo.salvar(nome, conteudo, tipo || 'application/json')) return;
        } catch (e) { }
        baixarWeb(nome, conteudo, tipo);
    };

    B.ui.compartilhar = function (titulo, texto) {
        try {
            if (nativo.compartilhar(titulo, texto)) return Promise.resolve(true);
        } catch (e) { }
        return compartilharWeb(titulo, texto);
    };
})();
