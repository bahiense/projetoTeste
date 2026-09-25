/* =========================================================
   Cópia automática no Google Drive.

   A terceira cópia, e a única que atravessa a perda do aparelho:

   - IndexedDB / localStorage: morre se o app for desinstalado.
   - pasta Downloads: sobrevive à desinstalação, morre com o celular.
   - Google Drive: sobrevive às duas.

   O login não acontece aqui dentro. Ele acontece no navegador do
   aparelho, na página do próprio Google — o app nunca vê a senha, e o
   que volta é um token que alcança apenas os arquivos que este app
   criou (escopo drive.file). Ele não consegue ler o resto do Drive.

   Quem faz o trabalho é a ponte nativa (DriveBridge.kt). Rede não pode
   passar pela chamada síncrona da ponte, senão a página congelaria até
   o Google responder; então o pedido sai por aqui com um número e a
   resposta volta pela janela, em window.__driveResposta.

   No navegador comum não existe ponte: tudo aqui responde "não dá", e a
   tela oferece o backup manual, como antes.
   ========================================================= */
window.B = window.B || {};

B.drive = (function () {
    'use strict';

    var PRAZO = 90000;      // o Drive travado não pode deixar promessa viva para sempre
    var pendentes = {};
    var contador = 0;
    var ouvintes = [];
    var aguardandoLogin = null;

    function ponte() {
        var n = window.AndroidDrive;
        return (n && typeof n.enviar === 'function') ? n : null;
    }

    /* Existe ponte? (é o app instalado, não o navegador) */
    function disponivel() { return !!ponte(); }

    var VAZIO = { possivel: false, conectado: false, conta: '', em: '', pasta: '' };

    function estado() {
        var n = ponte();
        if (!n) return VAZIO;
        try {
            var e = JSON.parse(n.estado());
            return {
                possivel: !!e.possivel, conectado: !!e.conectado,
                conta: e.conta || '', em: e.em || '', pasta: e.pasta || ''
            };
        } catch (err) { return VAZIO; }
    }

    /* Este APK foi montado com cliente do Google? Sem isso o recurso não
       existe, e a tela explica como criar o cliente em vez de mentir. */
    function possivel() { return estado().possivel; }
    function conectado() { return estado().conectado; }

    function pedir(metodo, nome, conteudo) {
        var n = ponte();
        if (!n) return Promise.reject(new Error('O Drive só funciona no app instalado.'));
        return new Promise(function (ok, falhou) {
            var id = 'p' + (++contador);
            pendentes[id] = { ok: ok, falhou: falhou };
            pendentes[id].prazo = setTimeout(function () {
                if (!pendentes[id]) return;
                delete pendentes[id];
                falhou(new Error('O Drive não respondeu.'));
            }, PRAZO);
            try {
                if (metodo === 'enviar') n.enviar(id, nome, conteudo);
                else n.baixar(id, nome);
            } catch (e) {
                clearTimeout(pendentes[id].prazo);
                delete pendentes[id];
                falhou(e);
            }
        });
    }

    window.__driveResposta = function (id, ok, dados) {
        var p = pendentes[id];
        if (!p) return;
        clearTimeout(p.prazo);
        delete pendentes[id];
        if (ok) p.ok(dados); else p.falhou(new Error(dados || 'Falhou.'));
    };

    /* O login volta do navegador, não desta chamada: quem terminou de
       conectar é avisado aqui, e a tela de Ajustes se repinta. */
    window.__driveConectou = function (ok, recado) {
        var p = aguardandoLogin;
        aguardandoLogin = null;
        if (p) { clearTimeout(p.prazo); if (ok) p.ok(recado); else p.falhou(new Error(recado)); }
        ouvintes.forEach(function (f) {
            try { f(ok, recado); } catch (e) { }
        });
    };

    function aoConectar(f) { ouvintes.push(f); }

    /**
     * Abre a página de login do Google no navegador. A promessa só cumpre
     * quando a pessoa termina lá e o aparelho devolve o app para cá — pode
     * levar minutos, e pode nunca acontecer (ela desistiu). Por isso há prazo.
     */
    function conectar() {
        var n = ponte();
        if (!n) return Promise.reject(new Error('O Drive só funciona no app instalado.'));
        var abriu = false;
        try { abriu = n.conectar(); } catch (e) { abriu = false; }
        if (!abriu) return Promise.reject(new Error(
            'Não consegui abrir o navegador para o login do Google.'));
        return new Promise(function (ok, falhou) {
            aguardandoLogin = { ok: ok, falhou: falhou };
            aguardandoLogin.prazo = setTimeout(function () {
                if (aguardandoLogin) { aguardandoLogin = null; falhou(new Error('Login não concluído.')); }
            }, 10 * 60 * 1000);
        });
    }

    function desconectar() {
        var n = ponte();
        if (!n) return false;
        try { return n.desconectar(); } catch (e) { return false; }
    }

    function enviar(nome, conteudo) { return pedir('enviar', nome, conteudo); }

    function baixar(nome) {
        return pedir('baixar', nome).then(function (bruto) {
            return JSON.parse(bruto);
        });
    }

    return {
        disponivel: disponivel, possivel: possivel, conectado: conectado,
        estado: estado, conectar: conectar, desconectar: desconectar,
        enviar: enviar, baixar: baixar, aoConectar: aoConectar
    };
})();
