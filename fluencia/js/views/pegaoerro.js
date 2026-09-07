/* =========================================================
   TELA PEGA O ERRO — o ouvido aprende a soar o alarme.

   Saber a regra não adianta: o erro de brasileiro passa
   despercebido porque soa normal para um ouvido brasileiro.
   Aqui a frase chega só pelo áudio, você julga em segundos e,
   se estiver torta, tem de dizer a forma certa em voz alta.
   Ouvido, julgamento e boca no mesmo movimento.
   ========================================================= */
window.F = window.F || {};
F.telas = F.telas || {};

F.telas.pegaoerro = (function () {
    'use strict';
    var ui = F.ui, esc = F.ui.esc;

    var META_DIA = 6;
    var RODADA = 8;

    var fila = [], pos = 0, notas = [], sequencia = 0, melhor = 0;
    var mostrouTexto = false, julgado = false;

    function render() {
        fila = montarFila();
        pos = 0; notas = []; sequencia = 0; melhor = 0;

        var comoFazer =
            '<ol>' +
            '<li>Toque em <b>Ouvir a frase</b>. Só o áudio — o texto fica escondido de ' +
            'propósito, para o ouvido trabalhar sozinho.</li>' +
            '<li>Decida em poucos segundos: <b>soa certo</b> ou <b>tem erro</b>?</li>' +
            '<li>Se tiver erro, você ainda precisa <b>dizer a forma certa em voz alta</b>. ' +
            'Reconhecer não basta — a boca é que tem de mudar.</li>' +
            '</ol>' +
            '<p>São as mesmas armadilhas da tela <b>Erros de brasileiro</b>, mas ali você ' +
            '<i>lê</i> as duas versões e escolhe. Aqui você não vê nada: é o ouvido que ' +
            'precisa desconfiar, que é como acontece numa conversa de verdade.</p>' +
            '<p class="destaque">Se você errar o julgamento, é justamente essa a frase que ' +
            'você diz sem perceber. Não é vergonha — é o mapa do que treinar.</p>';

        return ui.cabecalho('Pega o erro') +
            '<div class="cartao">' +
            '<div class="cartao-titulo">' +
            '<h3>Ouvido de brasileiro, alarme ligado</h3>' +
            '<span class="etiqueta">só áudio</span>' +
            ui.ajuda('Como funciona', comoFazer) +
            '</div>' +
            '<div id="pe-area"></div>' +
            '</div>';
    }

    /* Só entram frases que dá para falar inteiras: as entradas do banco
       com barra, parêntese ou comentário ensinam lendo, não ouvindo. */
    function utilizaveis() {
        return F.data.erros.filter(function (e) {
            return !/[\/()—]/.test(e.certo) && !/[\/()]/.test(e.errado) &&
                e.certo.length < 90 && e.errado.length < 90;
        });
    }

    function montarFila() {
        return ui.embaralhar(utilizaveis()).slice(0, RODADA).map(function (e) {
            /* Metade das frases chega já correta: sem isso o aluno aprende
               que a resposta é sempre "tem erro" e para de ouvir. */
            var torta = Math.random() < 0.6;
            return { erro: e, torta: torta, frase: torta ? e.errado : e.certo };
        });
    }

    function item() { return fila[pos]; }

    function pintar() {
        var area = ui.$('pe-area');
        if (!area) return;
        if (pos >= fila.length) return fim(area);
        mostrouTexto = false; julgado = false;

        area.innerHTML =
            barraDoBloco() +
            '<div class="ex-topo"><span>' + (pos + 1) + ' de ' + fila.length + '</span>' +
            '<span class="dt-placar">acertos: ' + notas.filter(Boolean).length +
            (sequencia > 1 ? ' · ' + sequencia + ' seguidas 🔥' : '') + '</span></div>' +
            '<div class="pe-caixa" id="pe-caixa"><span class="pe-oculto">frase escondida — ouça</span></div>' +
            '<div class="linha-botoes">' +
            '<button class="btn btn--forte" id="pe-ouvir">🔊 Ouvir a frase</button>' +
            '<button class="btn" id="pe-ver">Mostrar o texto</button>' +
            '</div>' +
            '<div class="notas" id="pe-julgar">' +
            '<button class="btn btn--nota good" data-j="ok">Soa certo</button>' +
            '<button class="btn btn--nota bad" data-j="erro">Tem erro</button>' +
            '</div>' +
            '<div id="pe-res"></div>';

        ui.$('pe-ouvir').addEventListener('click', function () {
            F.voz.falar(item().frase, { rate: 0.95 });
        });
        ui.$('pe-ver').addEventListener('click', function () {
            mostrouTexto = true;
            ui.$('pe-caixa').innerHTML = '<span class="pe-frase">' + esc(item().frase) + '</span>';
        });
        ui.qq('#pe-julgar [data-j]').forEach(function (b) {
            b.addEventListener('click', function () { julgar(b.getAttribute('data-j') === 'erro'); });
        });

        F.voz.falar(item().frase, { rate: 0.95 });
    }

    function barraDoBloco() {
        var n = F.store.feitosHoje('pegaoerro');
        if (F.store.blocoFeito('pegaoerro')) {
            return '<p class="bloco-progresso is-ok">✓ Bloco do dia concluído — ' + n +
                ' frases julgadas. O que vier agora é treino extra.</p>';
        }
        return '<p class="bloco-progresso">Bloco do dia: <b>' + n + ' de ' + META_DIA +
            '</b> frases julgadas.</p>';
    }

    function contarParaOBloco() {
        if (F.store.blocoFeito('pegaoerro')) return;
        if (F.store.feitosHoje('pegaoerro') < META_DIA) return;
        F.store.concluirBloco('pegaoerro');
        ui.toast('Bloco do dia concluído ✓');
    }

    function julgar(disseQueTemErro) {
        if (julgado) return;
        julgado = true;
        var it = item();
        var acertou = disseQueTemErro === it.torta;
        notas.push(acertou);
        sequencia = acertou ? sequencia + 1 : 0;
        if (sequencia > melhor) melhor = sequencia;
        F.store.registrar('pegaoerro', acertou ? 100 : 0);
        contarParaOBloco();

        var caixa = ui.$('pe-res');
        if (!caixa) return;
        ui.$('pe-caixa').innerHTML = '<span class="pe-frase' + (it.torta ? ' pe-frase--torta' : '') + '">' +
            esc(it.frase) + '</span>';
        ui.qq('#pe-julgar [data-j]').forEach(function (b) { b.disabled = true; });

        var html = '<div class="res-topo"><div class="res-txt"><b>' +
            esc(acertou
                ? (it.torta ? 'Isso. A frase estava torta.' : 'Isso. Um nativo diria assim mesmo.')
                : (it.torta ? 'Passou batido — e é assim que ela sai na sua boca.'
                    : 'Falso alarme: essa estava certa.')) +
            '</b></div></div>';

        if (it.torta) {
            html += '<div class="dr-resposta"><b>A forma certa:</b> ' + esc(it.erro.certo) + ' ' +
                ui.botaoOuvir(it.erro.certo, 'ouvir') + '</div>' +
                '<p class="corr-traducao">' + esc(it.erro.porque) + '</p>' +
                '<div id="pe-dizer"></div>';
        } else {
            html += '<p class="corr-traducao">' + esc(it.erro.porque) + '</p>' +
                '<p class="legenda">A versão torta desta é: <i>' + esc(it.erro.errado) + '</i></p>';
        }

        html += '<div class="linha-botoes">' +
            '<button class="btn" id="pe-rep">↻ Repetir esta</button>' +
            '<button class="btn btn--forte" id="pe-prox">Próxima →</button></div>';
        caixa.innerHTML = html;

        if (it.torta) montarDizer(it);
        ui.$('pe-rep').addEventListener('click', function () {
            if (notas.length) { if (notas[notas.length - 1]) sequencia = Math.max(0, sequencia - 1); notas.pop(); }
            pintar();
        });
        ui.$('pe-prox').addEventListener('click', function () { pos++; pintar(); });
    }

    /* Julgar é meio caminho. A frase certa tem de passar pela boca —
       é ali que a forma velha é substituída. */
    function montarDizer(it) {
        var caixa = ui.$('pe-dizer');
        if (!caixa) return;
        if (!F.voz.temEscuta()) {
            caixa.innerHTML = '<p class="legenda">Diga a forma certa em voz alta duas vezes ' +
                'antes de seguir — mesmo sem o app conferir.</p>';
            return;
        }
        caixa.innerHTML = '<button class="btn btn--forte" id="pe-falar">🎙 Dizer a forma certa</button>' +
            '<div id="pe-fala"></div>';
        ui.$('pe-falar').addEventListener('click', function () {
            var bt = ui.$('pe-falar');
            bt.textContent = '● ouvindo…';
            bt.classList.add('is-gravando');
            F.voz.ouvir({ limite: 7000 }).then(function (r) {
                var res = ui.$('pe-fala');
                if (!res) return;
                var b = ui.$('pe-falar');
                if (b) { b.textContent = '🎙 Dizer de novo'; b.classList.remove('is-gravando'); }
                if (r.vazio) {
                    res.innerHTML = ui.aviso('Não ouvi nada. Fale mais perto do aparelho.', 'atencao');
                    return;
                }
                var n = F.texto.pontuar(it.erro.certo, r.texto);
                F.store.registrar('pegaoerro', n.pct);
                res.innerHTML = '<div class="res-topo">' + ui.anel(n.pct) +
                    '<div class="res-txt"><b>' + esc(n.pct >= 75 ? 'Saiu certo.' : 'Quase — olhe onde escorregou.') +
                    '</b><small>Ouvi: “' + esc(r.texto) + '”</small></div></div>' + ui.diff(n);
            }).catch(function () {
                var res = ui.$('pe-fala');
                var b = ui.$('pe-falar');
                if (b) { b.textContent = '🎙 Dizer de novo'; b.classList.remove('is-gravando'); }
                if (res) res.innerHTML = ui.aviso('A escuta falhou agora. Tente de novo.', 'atencao');
            });
        });
    }

    function fim(area) {
        if (!area) return;
        var pct = notas.length ? Math.round((notas.filter(Boolean).length / notas.length) * 100) : 0;
        area.innerHTML = barraDoBloco() +
            '<div class="teste-fim">' + ui.anel(pct, 'ouvido') +
            '<p>' + esc(pct >= 90 ? 'Seu ouvido já desconfia sozinho. É esse o alarme que faltava.'
                : pct >= 60 ? 'Bom. As que passaram batido são as que ainda soam normais para você.'
                    : 'Muitas passaram. Não é falta de estudo: é que elas soam certas em português.') +
            (melhor > 2 ? ' Melhor sequência: ' + melhor + '.' : '') + '</p>' +
            '<div class="linha-botoes">' +
            '<button class="btn btn--forte" id="pe-mais">Mais oito frases</button>' +
            '<a class="btn" href="#/erros">Ver a lista de armadilhas</a></div></div>';
        ui.$('pe-mais').addEventListener('click', function () {
            fila = montarFila(); pos = 0; notas = []; sequencia = 0; pintar();
        });
    }

    function montar() { pintar(); }
    function desmontar() { F.voz.pararFala(); F.voz.pararEscuta(); }

    return { render: render, montar: montar, desmontar: desmontar };
})();
