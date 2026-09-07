/* =========================================================
   Prática falada — o pedaço reaproveitado por todas as telas.

   Fluxo: o app fala o modelo, você repete, o reconhecimento de
   voz transcreve, o texto é comparado com o alvo e o erro é
   diagnosticado. Sem reconhecimento de voz no aparelho, o
   mesmo exercício funciona por escrito.
   ========================================================= */
window.F = window.F || {};

F.pratica = (function () {
    'use strict';
    var ui = F.ui, esc = F.ui.esc;

    /* Caixa de prática: botão de falar + área de resultado. */
    function caixa(id, rotulo) {
        return '<div class="pratica" id="' + id + '">' +
            '<button class="btn btn--falar" data-papel="falar">🎙️ ' + esc(rotulo || 'Sua vez — falar') + '</button>' +
            '<div class="pratica-status" data-papel="status"></div>' +
            '<div class="pratica-res" data-papel="res"></div>' +
            '</div>';
    }

    /* Liga a caixa. opcoes: { alvo: string|função, serie: 'pronuncia', aoResultado: fn(pct, res) } */
    function ligar(id, opcoes) {
        var raiz = ui.$(id);
        if (!raiz) return;
        var bt = raiz.querySelector('[data-papel="falar"]');
        var status = raiz.querySelector('[data-papel="status"]');
        var res = raiz.querySelector('[data-papel="res"]');
        var ocupado = false;

        function alvoAtual() {
            return typeof opcoes.alvo === 'function' ? opcoes.alvo() : opcoes.alvo;
        }

        function mostrar(texto) {
            if (!document.body.contains(res)) return;
            var alvo = alvoAtual();
            var r = F.texto.pontuar(alvo, texto);
            var diag = F.texto.diagnosticoDaFrase(r);
            /* Onde a fala é livre (role-play, explicar), comparar com um modelo
               único não diz se a frase está certa — diz só o quanto ela é
               parecida. A correção por regras entra aí, e é ela que responde
               a pergunta que o aluno realmente faz: "o que eu falei estava
               errado?". */
            res.innerHTML =
                '<div class="res-topo">' + ui.anel(r.pct, opcoes.livre ? 'proximidade' : '') +
                '<div class="res-txt"><b>' + esc(opcoes.livre ? 'Comparação com o modelo'
                    : opcoes.veredito ? opcoes.veredito(r.pct) : ui.veredito(r.pct)) + '</b>' +
                '<small>Ouvi: “' + esc(texto || '(nada)') + '”</small></div></div>' +
                (opcoes.livre ? '' : ui.diff(r) + ui.legendaDiff() + ui.dicasDiagnostico(diag)) +
                (opcoes.corrigir ? F.correcao.html(texto, { checar: opcoes.checar || [] }) : '') +
                (opcoes.livre ? '<p class="legenda">A sua resposta não precisa ser igual à do modelo. ' +
                    'A proximidade é só referência de tamanho e registro.</p>' : '');
            if (opcoes.serie) F.store.registrar(opcoes.serie, r.pct);
            if (opcoes.aoResultado) opcoes.aoResultado(r.pct, r);
        }

        /* motivo: 'sem-suporte' quando o aparelho não tem reconhecimento, ou o
           nome do erro quando a tentativa falhou — dizer "não reconhece fala"
           para quem acabou de usar o reconhecimento é mentira, e manda o aluno
           procurar solução no lugar errado. */
        function porEscrito(motivo) {
            var aviso;
            if (!motivo || motivo === 'sem-suporte') {
                aviso = 'Este aparelho não reconhece fala (no computador, use o Chrome). ' +
                    'Fale em voz alta assim mesmo e digite o que você disse:';
            } else {
                var causas = {
                    'sem-internet': 'Sem internet. O reconhecimento de fala do Android é feito na rede — ' +
                        'sem conexão, ele não funciona (o resto do app funciona offline).',
                    'microfone-ocupado': 'O microfone está ocupado por outro app — chamada, assistente de ' +
                        'voz ou gravador.',
                    'reconhecimento-ocupado': 'O reconhecimento ainda estava terminando a escuta anterior.',
                    'reconhecimento-instavel': 'O serviço de reconhecimento do aparelho recusou o pedido. ' +
                        'O app já tentou de novo sozinho.',
                    'servidor-de-fala': 'O servidor de reconhecimento do Google não respondeu.',
                    'limite-do-google': 'O Google limitou os pedidos de reconhecimento por agora.',
                    'idioma-nao-instalado': 'O pacote de voz em inglês não está instalado. Ajustes do ' +
                        'aparelho → Google → Voz → Reconhecimento de fala offline → baixar inglês.',
                    'no-speech': 'Não chegou nenhuma voz. Fale mais perto e mais alto do que parece preciso.'
                };
                aviso = 'A escuta falhou agora. ' + (causas[motivo] || 'Motivo relatado: ' + motivo + '.') +
                    ' Toque no botão para tentar de novo, ou fale e digite o que você disse:';
            }
            res.innerHTML = '<div class="fallback">' +
                '<p class="sub">' + esc(aviso) + '</p>' +
                '<textarea class="entrada" rows="2" placeholder="write what you just said out loud"></textarea>' +
                '<button class="btn" data-papel="conferir">Conferir</button></div>';
            var ta = res.querySelector('textarea');
            ta.focus();
            res.querySelector('[data-papel="conferir"]').addEventListener('click', function () {
                mostrar(ta.value);
            });
        }

        bt.addEventListener('click', function () {
            if (ocupado) { F.voz.pararEscuta(); return; }
            if (!F.voz.temEscuta()) { porEscrito('sem-suporte'); return; }

            ocupado = true;
            bt.classList.add('is-ouvindo');
            bt.textContent = '⏹ Parar';
            status.textContent = 'Ouvindo… fale a frase inteira.';
            res.innerHTML = '';

            F.voz.ouvir({
                limite: opcoes.limite || 15000,
                onParcial: function (t) { status.textContent = '“' + t + '”'; }
            }).then(function (r) {
                ocupado = false;
                if (!document.body.contains(raiz)) return;
                bt.classList.remove('is-ouvindo');
                bt.textContent = '🎙️ De novo';
                status.textContent = '';
                if (r.vazio) {
                    res.innerHTML = '<p class="sub">Não ouvi nada. Fale mais perto do microfone — ' +
                        'e mais alto do que parece necessário.</p>';
                    return;
                }
                mostrar(r.texto);
            }).catch(function (e) {
                ocupado = false;
                if (!document.body.contains(raiz)) return;
                bt.classList.remove('is-ouvindo');
                bt.textContent = '🎙️ Sua vez — falar';
                status.textContent = '';
                if (String(e.message) === 'not-allowed') {
                    res.innerHTML = '<p class="sub">O microfone está bloqueado para o app. Abra os ajustes ' +
                        'do aparelho → Aplicativos → Fluência 180 → Permissões → Microfone → Permitir.</p>';
                } else {
                    porEscrito(String(e.message || 'erro desconhecido'));
                }
            });
        });
    }

    /* Gravador para se ouvir: grava, toca, guarda a anterior para comparação
       e deixa apagar o que não serve. */
    function gravador(id) {
        return '<div class="gravador" id="' + id + '">' +
            '<button class="btn" data-papel="rec">⏺ Gravar minha voz</button>' +
            '<div class="gravador-saida" data-papel="saida"></div>' +
            '</div>';
    }

    /* A segunda linha é sempre a anterior; a distância no tempo é o que dá
       sentido à comparação, então ela vai no rótulo quando existe. */
    function rotuloAntes(g) {
        var q = quando(g);
        return q === 'hoje' ? 'Antes' : 'Antes · ' + q;
    }

    /* "hoje", "ontem", "há 12 dias" — é a distância que dá sentido à comparação. */
    function quando(g) {
        if (!g.data) return '';
        var dias = F.store.diasEntre(g.data, F.store.hoje());
        if (dias <= 0) return 'hoje';
        if (dias === 1) return 'ontem';
        if (dias < 30) return 'há ' + dias + ' dias';
        return g.data;
    }

    function ligarGravador(id, opcoes) {
        var raiz = ui.$(id);
        if (!raiz) return;
        opcoes = opcoes || {};
        var chave = opcoes.chave || 'geral';
        var bt = raiz.querySelector('[data-papel="rec"]');
        var saida = raiz.querySelector('[data-papel="saida"]');

        if (!F.voz.temGravacao()) {
            bt.disabled = true;
            bt.textContent = 'Gravação indisponível neste aparelho';
            return;
        }

        function pintar() {
            var lista = F.store.gravacoes(chave);
            if (!lista.length) { saida.innerHTML = ''; return; }
            saida.innerHTML = lista.map(function (g, i) {
                return '<div class="audio-linha">' +
                    '<b>' + esc(i === 0 ? 'Agora' : rotuloAntes(g)) + '</b>' +
                    '<audio controls src="' + esc(g.url) + '"></audio>' +
                    '<button class="btn btn--apagar" data-apagar="' + esc(g.url) + '" ' +
                    'title="apagar esta gravação" aria-label="apagar esta gravação">✕</button>' +
                    '</div>';
            }).join('') +
                (lista.length > 1
                    ? '<p class="legenda">Ouça as duas. A diferença entre elas é o seu progresso — ' +
                    'e é a única prova que vale.</p>'
                    : '<p class="legenda">Guardada. Grave de novo daqui a duas semanas e compare — ' +
                    'o app mantém a anterior para isso.</p>');

            ui.qq('[data-apagar]', saida).forEach(function (x) {
                x.addEventListener('click', function () {
                    var url = x.getAttribute('data-apagar');
                    var g = F.store.gravacoes(chave).filter(function (y) { return y.url === url; })[0];
                    // a de hoje se refaz em segundos; a antiga é insubstituível
                    if (g && F.store.diasEntre(g.data, F.store.hoje()) >= 1 &&
                        !confirm('Apagar a gravação de ' + quando(g) + '?\n\n' +
                            'Ela existe para você comparar com a de hoje, e não dá para refazer.')) return;
                    F.voz.apagarGravacao(url);
                    F.store.esquecerGravacao(url);
                    ui.toast('Gravação apagada.');
                    pintar();
                });
            });
        }

        pintar();

        bt.addEventListener('click', function () {
            if (F.voz.gravando()) {
                F.voz.pararGravacao().then(function (url) {
                    if (!document.body.contains(raiz)) return;
                    bt.textContent = '⏺ Gravar de novo';
                    bt.classList.remove('is-rec');
                    if (!url) {
                        saida.innerHTML = '<p class="sub">A gravação saiu vazia — fale mais perto do ' +
                            'microfone e por pelo menos dois segundos.</p>';
                        return;
                    }
                    var saíram = F.store.guardarGravacao({ url: url, chave: chave });
                    saíram.forEach(function (v) { F.voz.apagarGravacao(v.url); });
                    pintar();
                });
            } else {
                F.voz.comecarGravacao().then(function () {
                    bt.textContent = '⏹ Parar gravação';
                    bt.classList.add('is-rec');
                }).catch(function (e) {
                    saida.innerHTML = '<p class="sub">' + esc(explicarMicrofone(e)) + '</p>';
                    F.ui.toast('Não consegui acessar o microfone.', 'erro');
                });
            }
        });
    }

    /* Cada motivo tem uma saída diferente, e um aviso genérico deixa o aluno
       sem ação. O nome técnico vai junto: é o que permite corrigir o app
       quando alguém relata a falha. */
    function explicarMicrofone(e) {
        /* Erros do navegador se identificam pelo .name (NotAllowedError); os
           nossos, pela mensagem. Olhar só um dos dois faz o aviso dizer
           "Error", que não ajuda ninguém. */
        var nome = (e && e.name) || '';
        var msg = (e && e.message) || '';
        nome = (nome && nome !== 'Error') ? nome : (msg || 'desconhecido');
        if (nome === 'permissao-negada' || nome === 'NotAllowedError' || nome === 'SecurityError') {
            return 'O microfone está bloqueado para o app. Abra os ajustes do aparelho → Aplicativos → ' +
                'Fluência 180 → Permissões → Microfone → Permitir, e tente de novo. (' + nome + ')';
        }
        if (nome === 'NotReadableError' || nome === 'AbortError') {
            // no app é o Android que grava, e não há as três tentativas do navegador
            var noApp = !!(window.__android && window.__android.gravador);
            return 'O microfone está ocupado' +
                (noApp ? '' : ' — o app tentou três vezes, esperando até um segundo e meio entre elas') +
                '. Quem costuma segurar é uma chamada em andamento, um assistente de voz ' +
                '(Bixby, Google, Alexa) ou um gravador aberto. Feche e toque em gravar de novo; ' +
                'se insistir, veja o Diagnóstico em Ajustes. (' + nome + ')';
        }
        if (nome === 'NotFoundError') {
            return 'Este aparelho não apresentou nenhum microfone ao navegador. (' + nome + ')';
        }
        if (nome === 'permissao-sem-resposta') {
            return 'O pedido de permissão ficou sem resposta. Toque em gravar de novo e responda ao aviso do Android.';
        }
        if (nome === 'sem-gravacao') {
            return 'Este navegador não grava áudio. No computador, use o Chrome; no celular, o app instalado pelo APK.';
        }
        return 'Não consegui abrir o microfone. Motivo relatado pelo sistema: ' + nome + '.';
    }

    return { caixa: caixa, ligar: ligar, gravador: gravador, ligarGravador: ligarGravador, explicarMicrofone: explicarMicrofone };
})();
