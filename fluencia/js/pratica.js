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
            res.innerHTML =
                '<div class="res-topo">' + ui.anel(r.pct) +
                '<div class="res-txt"><b>' + esc(ui.veredito(r.pct)) + '</b>' +
                '<small>Ouvi: “' + esc(texto || '(nada)') + '”</small></div></div>' +
                ui.diff(r) + ui.legendaDiff() + ui.dicasDiagnostico(diag);
            if (opcoes.serie) F.store.registrar(opcoes.serie, r.pct);
            if (opcoes.aoResultado) opcoes.aoResultado(r.pct, r);
        }

        function porEscrito() {
            res.innerHTML = '<div class="fallback">' +
                '<p class="sub">Este aparelho não reconhece fala (use o Chrome para isso). ' +
                'Fale em voz alta assim mesmo e digite o que você disse:</p>' +
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
            if (!F.voz.temEscuta()) { porEscrito(); return; }

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
                    res.innerHTML = '<p class="sub">O navegador bloqueou o microfone. Libere o acesso e tente de novo.</p>';
                } else {
                    porEscrito();
                }
            });
        });
    }

    /* Gravador para se ouvir: grava, toca e guarda o áudio anterior
       para comparação lado a lado. */
    function gravador(id) {
        return '<div class="gravador" id="' + id + '">' +
            '<button class="btn" data-papel="rec">⏺ Gravar minha voz</button>' +
            '<div class="gravador-saida" data-papel="saida"></div>' +
            '</div>';
    }

    function ligarGravador(id) {
        var raiz = ui.$(id);
        if (!raiz) return;
        var bt = raiz.querySelector('[data-papel="rec"]');
        var saida = raiz.querySelector('[data-papel="saida"]');
        var anterior = null;

        if (!F.voz.temGravacao()) {
            bt.disabled = true;
            bt.textContent = 'Gravação indisponível neste aparelho';
            return;
        }

        bt.addEventListener('click', function () {
            if (F.voz.gravando()) {
                F.voz.pararGravacao().then(function (url) {
                    if (!document.body.contains(raiz)) return;
                    bt.textContent = '⏺ Gravar de novo';
                    bt.classList.remove('is-rec');
                    if (!url) return;
                    saida.innerHTML =
                        '<div class="audio-linha"><b>Agora</b><audio controls src="' + url + '"></audio></div>' +
                        (anterior ? '<div class="audio-linha"><b>Antes</b><audio controls src="' + anterior + '"></audio></div>' : '') +
                        '<p class="legenda">Ouça as duas. A diferença entre elas é o seu progresso — e é a única prova que vale.</p>';
                    anterior = url;
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
            return 'Outro aplicativo está usando o microfone agora — costuma ser uma chamada, um assistente ' +
                'de voz ou um gravador aberto. Feche e tente de novo. (' + nome + ')';
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
