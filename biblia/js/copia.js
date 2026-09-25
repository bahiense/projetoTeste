/* =========================================================
   Cópia automática, fora da pasta do app.

   Tudo que o app guarda — plano, leitura, estudos — mora na pasta
   privada dele. O Android apaga essa pasta inteira na desinstalação, e
   nenhum truque de JavaScript muda isso: quem some é a pasta, não o
   código. Para o estudo gerado sobreviver a uma reinstalação, ele tem
   de estar em outro lugar.

   Esse outro lugar é a pasta Downloads do aparelho, que pertence ao
   usuário e não ao app. Depois de cada estudo novo (e de cada leitura
   marcada), o app regrava ali um único arquivo com tudo dentro.

   Na volta, há dois casos, e eles são diferentes de verdade:

   - LIMPAR OS DADOS do app: o arquivo continua sendo "nosso" aos olhos
     do Android, então o app lê sozinho e restaura sem pedir nada.
   - DESINSTALAR e instalar de novo: o sistema esquece quem criou o
     arquivo. Ele continua lá, mas o app novo não tem permissão de abri-lo
     sozinho — e pedir permissão de armazenamento inteira, num app de
     leitura bíblica, seria pedir demais. Então a tela pede um toque:
     escolher o arquivo no seletor do sistema. Um toque, e tudo volta.

   Falta a essas duas o caso do celular perdido, roubado ou trocado: a
   pasta Downloads vai embora junto com o aparelho. Quem cobre isso é o
   Google Drive da própria pessoa (js/drive.js), quando ela conecta a
   conta — a mesma gravação sai para os dois lugares.

   No navegador não existe esta ponte; lá o backup continua manual, no
   botão de Progresso.
   ========================================================= */
window.B = window.B || {};

B.copia = (function () {
    'use strict';

    var NOME = 'leitura-biblica-backup.json';
    var CHAVE_DATA = 'bib:copiaEm';
    var ESPERA = 4000;      // junta várias mudanças seguidas numa gravação só

    var timer = null;
    var gravando = false;

    function ponte() {
        var n = window.AndroidArquivo;
        return (n && typeof n.salvarBackup === 'function') ? n : null;
    }

    function disponivel() { return !!ponte(); }

    function naNuvem() { return !!(B.drive && B.drive.conectado()); }

    /* Chamado a cada mudança que vale a pena preservar. Não grava na hora:
       marcar três capítulos seguidos são três chamadas e uma gravação. */
    function agendar() {
        if (gravando) return;
        if (!ponte() && !naNuvem()) return;
        clearTimeout(timer);
        timer = setTimeout(gravar, ESPERA);
    }

    /* O conteúdo da cópia: o estado inteiro mais todos os estudos. */
    function montar() {
        return B.estudos.listar().then(function (estudos) {
            return JSON.stringify(B.store.paraBackup(estudos));
        });
    }

    /**
     * Grava a cópia nos dois lugares que ela tem.
     *
     * O Drive não atrasa nem atrapalha o arquivo local: são independentes de
     * propósito, porque o caso comum é justamente estar sem rede (metrô, avião,
     * sinal ruim) e a cópia local precisa acontecer de todo jeito.
     */
    function gravar() {
        if (gravando) return Promise.resolve({ downloads: false, drive: null });
        gravando = true;
        return montar().then(function (dados) {
            var n = ponte();
            var local = false;
            if (n) {
                try { local = n.salvarBackup(NOME, dados); } catch (e) { local = false; }
                if (local) {
                    try { localStorage.setItem(CHAVE_DATA, new Date().toISOString()); } catch (e) { }
                }
            }
            if (!naNuvem()) { gravando = false; return { downloads: local, drive: null }; }
            return B.drive.enviar(NOME, dados).then(function () {
                gravando = false;
                return { downloads: local, drive: true };
            }, function (e) {
                gravando = false;
                return { downloads: local, drive: false, erro: e && e.message };
            });
        }, function () { gravando = false; return { downloads: false, drive: null }; });
    }

    /**
     * Manda a cópia para onde a pessoa escolher, pelo menu do Android — o
     * caminho para o Drive que não pede login nenhum nem configuração: dois
     * toques, e o arquivo está numa nuvem.
     */
    function enviarPeloMenu() {
        var n = window.AndroidArquivo;
        if (!n || typeof n.compartilharArquivo !== 'function') return Promise.resolve(false);
        return montar().then(function (dados) {
            try { return !!n.compartilharArquivo(NOME, dados, 'application/json'); }
            catch (e) { return false; }
        });
    }

    /* Traz a cópia do Drive e restaura — o caminho de quem trocou de celular. */
    function daNuvem() {
        if (!B.drive || !B.drive.conectado())
            return Promise.reject(new Error('Conta do Google não conectada.'));
        return B.drive.baixar(NOME).then(function (dados) { return restaurar(dados); });
    }

    /* Tenta ler a cópia sem pedir nada a ninguém. Volta null quando o
       Android não deixa (o caso da reinstalação). */
    function lerAutomatico() {
        var n = ponte();
        if (!n || typeof n.lerBackup !== 'function') return null;
        var bruto = '';
        try { bruto = n.lerBackup(NOME); } catch (e) { return null; }
        if (!bruto) return null;
        try { return JSON.parse(bruto); } catch (e) { return null; }
    }

    function quando() {
        try { return localStorage.getItem(CHAVE_DATA); } catch (e) { return null; }
    }

    /* O app está zerado? É o que dispara o convite para restaurar. */
    function estaVazio() {
        var e = B.store.get();
        return B.plano.progressoBiblia().lidos === 0 && (e.historico || []).length === 0;
    }

    /* Restaurar é sempre o mesmo caminho, venha o arquivo do seletor do
       sistema ou da cópia automática: mostrar o que há dentro, confirmar,
       aplicar. Uma implementação só — duas acabariam discordando. */
    function restaurar(dados, aoTerminar) {
        var ui = B.ui, esc = B.ui.esc;
        var estado = dados.estado || dados;
        var estudos = dados.estudos || [];
        var r;
        try { r = B.store.resumoDoArquivo(estado); }
        catch (e) { ui.toast('Não consegui entender esse backup.', 'erro'); return Promise.resolve(false); }

        return ui.modal({
            titulo: 'Conferir antes de restaurar',
            html: '<p class="dica">' + (r.antigo
                ? 'Backup do app antigo. O que já foi lido é deduzido da posição de cada ' +
                'grupo: tudo que vem antes dela, mais os grupos com ciclo fechado.'
                : 'Backup deste app.') + '</p>' +
                '<ul class="resumo">' +
                '<li><b>' + r.capitulos + '</b> capítulos lidos</li>' +
                '<li><b>' + r.ciclos + '</b> ciclo' + (r.ciclos === 1 ? '' : 's') + ' fechado' +
                (r.ciclos === 1 ? '' : 's') + '</li>' +
                '<li><b>' + r.dias + '</b> dia' + (r.dias === 1 ? '' : 's') +
                ' de leitura registrado' + (r.dias === 1 ? '' : 's') + '</li>' +
                (estudos.length
                    ? '<li><b>' + estudos.length + '</b> estudo' + (estudos.length === 1 ? '' : 's') +
                    ' guardado' + (estudos.length === 1 ? '' : 's') + '</li>'
                    : '') +
                '</ul>' +
                '<p class="aviso">Isto <b>substitui</b> os dados atuais do aparelho.</p>',
            textoOk: 'Restaurar'
        }).then(function (ok) {
            if (!ok) return false;
            B.store.substituirPor(r.estado);
            var p = estudos.length ? B.estudos.importar(estudos) : Promise.resolve(0);
            return p.then(function () {
                B.app.pintar();
                ui.toast('Restaurado: ' + r.capitulos + ' capítulos' +
                    (estudos.length ? ' e ' + estudos.length + ' estudos' : '') + '.');
                if (aoTerminar) aoTerminar();
                return true;
            });
        });
    }

    /* Lê um arquivo escolhido no seletor do sistema. */
    function deArquivo(arquivo) {
        return new Promise(function (ok) {
            var leitor = new FileReader();
            leitor.onload = function (ev) {
                var dados;
                try { dados = JSON.parse(ev.target.result); }
                catch (e) {
                    B.ui.toast('Esse arquivo não é um backup válido.', 'erro');
                    return ok(false);
                }
                restaurar(dados).then(ok);
            };
            leitor.onerror = function () {
                B.ui.toast('Não consegui ler o arquivo.', 'erro');
                ok(false);
            };
            leitor.readAsText(arquivo);
        });
    }

    return {
        NOME: NOME, agendar: agendar, gravar: gravar, lerAutomatico: lerAutomatico,
        disponivel: disponivel, quando: quando, estaVazio: estaVazio,
        restaurar: restaurar, deArquivo: deArquivo, montar: montar,
        naNuvem: naNuvem, daNuvem: daNuvem, enviarPeloMenu: enviarPeloMenu
    };
})();
