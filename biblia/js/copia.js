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
    var MUITOS = 300;        // a partir daqui a cópia vai em fluxo, não de uma vez
    var CHAVE_DATA = 'bib:copiaEm';
    var ESPERA = 4000;      // junta várias mudanças seguidas numa gravação só

    var timer = null;
    var gravando = false;
    var suspenso = false;

    function ponte() {
        var n = window.AndroidArquivo;
        return (n && typeof n.salvarBackup === 'function') ? n : null;
    }

    /* A ponte sabe escrever em pedaços? (APK novo) */
    function pontePartes() {
        var n = ponte();
        return (n && typeof n.copiaAbrir === 'function' &&
            typeof n.copiaEscrever === 'function' &&
            typeof n.copiaFechar === 'function') ? n : null;
    }

    function disponivel() { return !!ponte(); }

    function naNuvem() { return !!(B.drive && B.drive.conectado()); }

    /* Chamado a cada mudança que vale a pena preservar. Não grava na hora:
       marcar três capítulos seguidos são três chamadas e uma gravação. */
    function agendar() {
        if (gravando || suspenso) return;
        if (!ponte() && !naNuvem()) return;
        clearTimeout(timer);
        timer = setTimeout(gravar, ESPERA);
    }

    /**
     * Segura a cópia automática por um tempo.
     *
     * Existe para o mutirão: com a Bíblia inteira estudada o backup passa de
     * 25 MB, e regravá-lo depois de cada um dos 2.510 estudos seriam dezenas
     * de gigabytes gravados e enviados à toa. Durante o mutirão ela sai a cada
     * cinquenta e no fim — a chamada direta a gravar() continua valendo.
     */
    function suspender() { suspenso = true; clearTimeout(timer); }
    function retomar() { suspenso = false; }

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
     *
     * Com `{ nuvem: false }` só o arquivo local é escrito. É o que o mutirão
     * usa nas gravações intermediárias: mandar 30 MB para o Drive cinquenta
     * vezes numa tarde seria mais de um giga de dados móveis por nada.
     */
    function gravar(op) {
        op = op || {};
        if (gravando) return Promise.resolve({ downloads: false, drive: null });
        gravando = true;
        return B.estudos.contar().then(function (quantos) {
            if (quantos > MUITOS && pontePartes()) return emFluxo(op);
            return inteira(op);
        }, function () { gravando = false; return { downloads: false, drive: null }; });
    }

    /**
     * A Bíblia inteira estudada dá um backup de uns 30 MB. Montar isso como uma
     * string só significa ter os 30 MB em JavaScript, mais outro tanto ao
     * atravessar a ponte para o Java — num celular modesto é o app morrendo.
     *
     * Aqui o arquivo é escrito aos poucos, estudo a estudo, direto num arquivo
     * de trabalho do lado nativo. Nada grande existe em memória em momento
     * algum. O caminho antigo continua valendo para as centenas de estudos
     * normais: é mais simples e já funciona.
     */
    function emFluxo(op) {
        var n = pontePartes();
        var pedaco = '';
        var primeiro = true;

        function solta(texto, forcar) {
            pedaco += texto;
            if (!forcar && pedaco.length < 262144) return;
            try { n.copiaEscrever(pedaco); } catch (e) { }
            pedaco = '';
        }

        try { n.copiaAbrir(); } catch (e) { gravando = false; return { downloads: false, drive: null }; }

        var cabeca = B.store.paraBackup([]);
        var molde = JSON.stringify(cabeca);
        /* Abre o JSON com tudo menos os estudos, e deixa o vetor em aberto. */
        solta(molde.replace(/,"estudos":\[\]}$/, ',"estudos":['), false);

        return B.estudos.percorrer(function (e) {
            solta((primeiro ? '' : ',') + JSON.stringify(e), false);
            primeiro = false;
        }).then(function () {
            solta(']}', true);
            var ok = false;
            try { ok = n.copiaFechar(NOME); } catch (e) { ok = false; }
            if (ok) {
                try { localStorage.setItem(CHAVE_DATA, new Date().toISOString()); } catch (e) { }
            }
            if (!ok || op.nuvem === false || !naNuvem() || !B.drive.doArquivo) {
                gravando = false;
                return { downloads: ok, drive: (op.nuvem === false || !naNuvem()) ? null : false };
            }
            /* O Drive lê o mesmo arquivo de trabalho: os 30 MB não voltam a
               passar pela página. */
            return B.drive.doArquivo(NOME).then(function () {
                gravando = false;
                return { downloads: ok, drive: true };
            }, function (e) {
                gravando = false;
                return { downloads: ok, drive: false, erro: e && e.message };
            });
        }, function () {
            try { n.copiaFechar(''); } catch (e) { }
            gravando = false;
            return { downloads: false, drive: null };
        });
    }

    function inteira(op) {
        return montar().then(function (dados) {
            var n = ponte();
            var local = false;
            if (n) {
                try { local = n.salvarBackup(NOME, dados); } catch (e) { local = false; }
                if (local) {
                    try { localStorage.setItem(CHAVE_DATA, new Date().toISOString()); } catch (e) { }
                }
            }
            if (op.nuvem === false || !naNuvem()) {
                gravando = false;
                return { downloads: local, drive: null };
            }
            return B.drive.enviar(NOME, dados).then(function () {
                gravando = false;
                return { downloads: local, drive: true };
            }, function (e) {
                gravando = false;
                return { downloads: local, drive: false, erro: e && e.message };
            });
        }, function () { gravando = false; return { downloads: false, drive: null }; });
    }

    /* =====================================================
       Pacotes: do Claude para o app instalado.

       O app instalado não alcança o Claude — `window.claude` só existe
       dentro do claude.ai, e nenhum truque de WebView muda isso. Então
       quem gera é a versão aberta no Chrome, e os estudos precisam
       atravessar para o app.

       A travessia é um arquivo na pasta Downloads, que os dois lados
       enxergam. Do lado do Chrome, um toque salva o que ainda não foi
       levado; do lado do app, ele acha o arquivo sozinho ao abrir e
       guarda o que veio. A pessoa não escolhe arquivo, não navega em
       pasta, não aperta nada no app.

       Vai em pacotes de quatrocentos, e não num arquivo só, por duas
       razões: a Bíblia inteira dá 30 MB — ler isso de uma vez, atravessar
       a ponte e ainda parsear num celular modesto é o app morrendo — e
       porque assim o que já foi gerado chega ao app antes de tudo acabar.

       Pacote traz estudo, e só. A leitura é do aparelho de quem lê: quem
       marcou capítulo no app não perde a marcação porque o Chrome passou
       a semana escrevendo.
       ===================================================== */

    var PACOTE = 'estudos-do-claude-';
    var POR_PACOTE = 400;
    var CHAVE_LEVADOS = 'bib:pacoteLevados'; // chaves de estudo já levadas
    var CHAVE_NUM = 'bib:pacoteNum';         // numeração dos arquivos
    var CHAVE_LIDOS = 'bib:pacotesLidos';    // nomes que o app já trouxe

    function guardado(chave, padrao) {
        try { return localStorage.getItem(chave) || padrao; } catch (e) { return padrao; }
    }
    function guardar(chave, valor) {
        try { localStorage.setItem(chave, valor); } catch (e) { }
    }

    /**
     * O que já atravessou, por chave de estudo.
     *
     * Guardar uma data de corte seria menor, e estaria errado: estudo
     * restaurado de um backup chega com a data em que foi escrito, não a de
     * hoje — ficaria atrás do corte e nunca atravessaria. São 2.510 chaves no
     * pior caso, uns 50 KB: cabe, e é exato.
     */
    function levados() {
        var m = {};
        try { m = JSON.parse(guardado(CHAVE_LEVADOS, '{}')) || {}; } catch (e) { m = {}; }
        return m;
    }

    /* Quantos estudos ainda não foram levados para o app. */
    function aLevar() {
        var ja = levados();
        var quantos = 0;
        return B.estudos.percorrer(function (e) {
            if (!ja[e.id]) quantos++;
        }).then(function () { return quantos; }, function () { return 0; });
    }

    /**
     * Escreve o próximo pacote na pasta Downloads.
     *
     * Duas passadas pelo banco de propósito: a primeira só olha data e
     * chave, para escolher os quatrocentos mais antigos que faltam; a
     * segunda traz o texto só desses. Escolher na ordem do banco seria
     * pegar quatrocentos espalhados no tempo e deixar buracos atrás da
     * marca — estudos que nunca mais seriam levados.
     */
    function levarPacote() {
        var ja = levados();
        var fila = [];
        return B.estudos.percorrer(function (e) {
            if (!ja[e.id]) fila.push({ id: e.id, criado: e.criado || '' });
        }).then(function () {
            if (!fila.length) return { quantos: 0, faltam: 0 };
            fila.sort(function (a, b) { return a.criado < b.criado ? -1 : a.criado > b.criado ? 1 : 0; });
            var faltam = Math.max(0, fila.length - POR_PACOTE);
            var leva = {};
            fila.slice(0, POR_PACOTE).forEach(function (x) { leva[x.id] = true; });

            var corpo = [];
            return B.estudos.percorrer(function (e) {
                if (leva[e.id]) corpo.push(e);
            }).then(function () {
                var n = (parseInt(guardado(CHAVE_NUM, '0'), 10) || 0) + 1;
                var nome = PACOTE + (n < 10 ? '0' + n : n) + '.json';
                var texto = JSON.stringify({ pacote: 1, estudos: corpo });
                return Promise.resolve(B.ui.baixar(nome, texto, 'application/json'))
                    .then(function (ok) {
                        if (!ok) return { quantos: 0, faltam: fila.length, recusado: true };
                        guardar(CHAVE_NUM, String(n));
                        corpo.forEach(function (e) { ja[e.id] = 1; });
                        guardar(CHAVE_LEVADOS, JSON.stringify(ja));
                        return { quantos: corpo.length, faltam: faltam, nome: nome };
                    });
            });
        });
    }

    /* A ponte do app sabe procurar pacotes em Downloads? (APK novo) */
    function pontePacotes() {
        var n = window.AndroidArquivo;
        return (n && typeof n.listarPacotes === 'function' &&
            typeof n.lerPacote === 'function') ? n : null;
    }

    /* A pasta já foi apontada? */
    function pastaTem() {
        var n = pontePacotes();
        if (!n || typeof n.pastaTem !== 'function') return false;
        try { return !!n.pastaTem(); } catch (e) { return false; }
    }

    /**
     * Pede a pasta uma vez. A resposta vem do Android, pelo seletor do
     * sistema, então é assíncrona: a ponte avisa por esta janela.
     */
    function pastaPedir() {
        var n = pontePacotes();
        if (!n || typeof n.pastaEscolher !== 'function') return Promise.resolve(false);
        return new Promise(function (ok) {
            var respondeu = false;
            window.__pastaEscolhida = function (deu) {
                if (respondeu) return;
                respondeu = true;
                ok(deu === true || deu === 'true');
            };
            try { n.pastaEscolher(); } catch (e) { respondeu = true; ok(false); }
        });
    }

    /**
     * Do lado do app: acha os pacotes em Downloads e guarda o que veio.
     *
     * Roda sozinho na abertura. Só acrescenta — nada do aparelho é
     * substituído, e um pacote já trazido não é lido de novo (são
     * megabytes por arquivo; reler toda abertura seria segurar a tela à
     * toa).
     */
    function trazerPacotes() {
        var n = pontePacotes();
        if (!n) return Promise.resolve(0);
        var nomes = [];
        try { nomes = JSON.parse(n.listarPacotes(PACOTE) || '[]'); } catch (e) { return Promise.resolve(0); }
        var lidos = {};
        try { lidos = JSON.parse(guardado(CHAVE_LIDOS, '{}')) || {}; } catch (e) { lidos = {}; }
        var fila = nomes.filter(function (x) { return !lidos[x]; });
        if (!fila.length) return Promise.resolve(0);

        suspender();
        var total = 0;

        function proximo(i) {
            if (i >= fila.length) return Promise.resolve();
            var bruto = '';
            try { bruto = n.lerPacote(fila[i]); } catch (e) { bruto = ''; }
            var dados = null;
            if (bruto) { try { dados = JSON.parse(bruto); } catch (e) { dados = null; } }
            var estudos = (dados && dados.estudos) || [];
            var p = estudos.length ? B.estudos.importar(estudos) : Promise.resolve(0);
            return p.then(function (q) {
                total += q || 0;
                lidos[fila[i]] = 1;
                guardar(CHAVE_LIDOS, JSON.stringify(lidos));
                return proximo(i + 1);
            }, function () {
                /* Arquivo pela metade (download interrompido): deixa sem
                   marcar, para tentar de novo na próxima abertura. */
                return proximo(i + 1);
            });
        }

        return proximo(0).then(function () {
            retomar();
            if (total) gravar({ nuvem: false });
            return total;
        }, function () { retomar(); return total; });
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

    /**
     * Acrescenta estudos de um pacote, sem tocar em mais nada.
     *
     * É o mesmo que a abertura do app faz sozinha quando acha o pacote na
     * pasta; aqui é para quando a pessoa aponta o arquivo na mão — noutro
     * aparelho, ou antes de apontar a pasta.
     */
    function somarEstudos(estudos) {
        var bons = estudos.filter(function (e) { return e && e.titulo && e.texto; });
        if (!bons.length) {
            B.ui.toast('Esse pacote está vazio.', 'erro');
            return Promise.resolve(false);
        }
        return B.estudos.importar(bons).then(function (n) {
            B.ui.toast(n + ' estudo' + (n === 1 ? '' : 's') + ' ' +
                (n === 1 ? 'entrou' : 'entraram') + ' — nada foi substituído.');
            B.app.pintar();
            return true;
        }, function () {
            B.ui.toast('Não consegui guardar os estudos do pacote.', 'erro');
            return false;
        });
    }

    /**
     * Lê um arquivo escolhido no seletor do sistema.
     *
     * Cada passo avisa. Um backup com a Bíblia estudada tem 30 MB: ler e
     * interpretar leva segundos de tela parada, e sem aviso isso é
     * indistinguível de não ter acontecido nada — que foi exatamente como
     * pareceu quando o seletor devolvia o arquivo e a tela ficava muda.
     */
    function deArquivo(arquivo) {
        var mb = arquivo.size / 1048576;
        B.ui.toast('Lendo ' + arquivo.name + ' (' +
            (mb < 1 ? Math.round(arquivo.size / 1024) + ' KB' : mb.toFixed(1) + ' MB') + ')…');

        return new Promise(function (ok) {
            var leitor = new FileReader();
            leitor.onload = function (ev) {
                var dados;
                try { dados = JSON.parse(ev.target.result); }
                catch (e) {
                    B.ui.toast('"' + arquivo.name + '" não é um backup: o conteúdo não é JSON.', 'erro');
                    return ok(false);
                }
                /* JSON válido mas de outra coisa: dizer isso é diferente de
                   dizer "arquivo inválido", e leva a pessoa ao arquivo certo. */
                if (!dados || typeof dados !== 'object' ||
                    (!dados.estado && !dados.estudos && !dados.grupos)) {
                    B.ui.toast('"' + arquivo.name + '" é um JSON, mas não é um backup deste app.', 'erro');
                    return ok(false);
                }
                /* Pacote não é backup: ele traz estudo e mais nada. Mandá-lo
                   pelo caminho da restauração apagaria a leitura marcada aqui
                   — e é um arquivo que a pessoa tem em mãos, fácil de escolher
                   por engano. */
                if (dados.pacote) return somarEstudos(dados.estudos || []).then(ok);
                restaurar(dados).then(ok);
            };
            leitor.onerror = function () {
                B.ui.toast('O sistema não deixou ler "' + arquivo.name + '".', 'erro');
                ok(false);
            };
            leitor.readAsText(arquivo);
        });
    }

    return {
        NOME: NOME, agendar: agendar, gravar: gravar, lerAutomatico: lerAutomatico,
        disponivel: disponivel, quando: quando, estaVazio: estaVazio,
        restaurar: restaurar, deArquivo: deArquivo, montar: montar,
        somarEstudos: somarEstudos,
        naNuvem: naNuvem, daNuvem: daNuvem, enviarPeloMenu: enviarPeloMenu,
        suspender: suspender, retomar: retomar,
        PACOTE: PACOTE, aLevar: aLevar, levarPacote: levarPacote,
        trazerPacotes: trazerPacotes, pontePacotes: pontePacotes,
        pastaTem: pastaTem, pastaPedir: pastaPedir
    };
})();
