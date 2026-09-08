/* =========================================================
   TELA EXPLICAR — chegar na ideia sem a palavra.

   O que trava um intermediário não é falta de vocabulário: é
   parar quando a palavra some. Nativo contorna sem pensar
   ("aquela coisa que a gente usa pra..."). Aqui o app tira as
   saídas fáceis e obriga o contorno, escutando enquanto você
   fala e acendendo o que você acertou e o que você queimou.
   ========================================================= */
window.F = window.F || {};
F.telas = F.telas || {};

F.telas.explicar = (function () {
    'use strict';
    var ui = F.ui, esc = F.ui.esc;

    var META_DIA = 4;          // rodadas que fecham o bloco do dia
    var MIN_PALAVRAS = 12;     // abaixo disso não foi explicação, foi tentativa
    var TEMPO = 40;

    var fila = [], pos = 0, notas = [], rodando = false, timer = null;
    var queimadas = [], acesas = [], ouvidoAgora = '';

    function render() {
        fila = montarFila();
        pos = 0; notas = [];

        var comoFazer =
            '<ol>' +
            '<li>O app mostra uma palavra e <b>proíbe</b> as saídas óbvias.</li>' +
            '<li>Toque em <b>Explicar</b> e fale até o outro lado entender — sem dizer ' +
            'a palavra nem nenhuma das proibidas.</li>' +
            '<li>Enquanto você fala, o app acende em verde as palavras que ajudam e em ' +
            'vermelho a proibida no instante em que ela escapa.</li>' +
            '</ol>' +
            '<p><b>Ganha a rodada</b> quem falar pelo menos ' + MIN_PALAVRAS + ' palavras, ' +
            'dentro do tempo, sem queimar nenhuma proibida. Não existe resposta certa: ' +
            'existem mil explicações boas.</p>' +
            '<p>As palavras que ajudam <b>não são obrigatórias</b> — são só um empurrão para ' +
            'quem travou. E o modelo que aparece no fim é <i>uma</i> forma de explicar, para ' +
            'você comparar, não para copiar.</p>' +
            '<p class="destaque">Isto é a habilidade mais útil de todo o curso. Numa conversa ' +
            'real você vai esquecer palavras a vida inteira; o que muda é você continuar ' +
            'falando em vez de parar e pedir desculpa.</p>';

        return ui.cabecalho('Explique sem a palavra') +
            '<div class="cartao">' +
            '<div class="cartao-titulo">' +
            '<h3 id="ex-nome">Contornar o buraco</h3>' +
            '<span class="etiqueta">resposta livre</span>' +
            ui.ajuda('Como funciona', comoFazer) +
            '</div>' +
            '<div id="ex-area"></div>' +
            '</div>';
    }

    /* Rodada do dia: cinco palavras sorteadas na faixa da fase atual,
       com as fases anteriores no bolo — o que já foi treinado volta. */
    function montarFila() {
        var fase = F.curso.semanaAtual().fase;
        var teto = Math.max(1, Math.min(4, Math.ceil(fase / 2)));
        var pool = [];
        /* Sobe um nível de cada vez até ter material que dure algumas
           semanas: gate apertado demais faz a fase 1 repetir as mesmas
           vinte palavras por um mês e meio. */
        for (var n = 1; n <= 4 && (n <= teto || pool.length < 50); n++) {
            pool = pool.concat(F.data.explicar.filter(function (it) { return it.nivel === n; }));
        }
        if (pool.length < 5) pool = F.data.explicar.slice();
        return ui.embaralhar(pool).slice(0, 5);
    }

    function item() { return fila[pos]; }

    function pintar() {
        var area = ui.$('ex-area');
        if (!area) return;
        if (pos >= fila.length) return fim(area);

        var it = item();
        queimadas = []; acesas = []; ouvidoAgora = '';

        area.innerHTML =
            barraDoBloco() +
            '<div class="ex-topo"><span>' + (pos + 1) + ' de ' + fila.length + '</span>' +
            '<span class="dt-placar">explicadas: ' + notas.filter(Boolean).length + '</span></div>' +
            '<div class="ex-palavra">' + esc(it.palavra) +
            '<small>' + esc(it.pt) + '</small></div>' +
            '<p class="ex-rotulo">Não pode dizer</p>' +
            '<div class="ex-fichas" id="ex-proibidas">' +
            it.proibidas.map(function (p, i) {
                return '<span class="ficha ficha--nao" data-p="' + i + '">' + esc(p) + '</span>';
            }).join('') + '</div>' +
            '<p class="ex-rotulo">Ajudam <small>(opcionais)</small></p>' +
            '<div class="ex-fichas" id="ex-ajudam">' +
            it.ajudam.map(function (p, i) {
                return '<span class="ficha" data-a="' + i + '">' + esc(p) + '</span>';
            }).join('') + '</div>' +
            '<div class="dr-relogio"><i id="ex-barra"></i></div>' +
            '<div class="linha-botoes">' +
            '<button class="btn btn--forte" id="ex-ir">🎙 Explicar (' + TEMPO + 's)</button>' +
            F.pratica.botaoEscrever('ex-escrever', 'Escrever') +
            '<button class="btn" id="ex-pular">Pular</button>' +
            '</div>' +
            '<p class="ex-transcricao" id="ex-txt"></p>' +
            '<div id="ex-res"></div>';

        ui.$('ex-ir').addEventListener('click', comecar);
        ui.$('ex-escrever').addEventListener('click', porEscrito);
        ui.$('ex-pular').addEventListener('click', function () { pos++; pintar(); });
    }

    function barraDoBloco() {
        var n = F.store.feitosHoje('explicar');
        if (F.store.blocoFeito('explicar')) {
            return '<p class="bloco-progresso is-ok">✓ Bloco do dia concluído — ' + n +
                ' explicações. O que vier agora é treino extra.</p>';
        }
        return '<p class="bloco-progresso">Bloco do dia: <b>' + n + ' de ' + META_DIA +
            '</b> explicações.</p>';
    }

    function contarParaOBloco() {
        if (F.store.blocoFeito('explicar')) return;
        if (F.store.feitosHoje('explicar') < META_DIA) return;
        F.store.concluirBloco('explicar');
        ui.toast('Bloco do dia concluído ✓');
    }

    /* ------------- a escuta ao vivo ------------- */

    function comecar() {
        if (rodando) return;
        if (!F.voz.temEscuta()) {
            ui.$('ex-res').innerHTML = ui.aviso('Sem reconhecimento de fala neste aparelho. ' +
                'Explique em voz alta assim mesmo e compare com o modelo depois.', 'atencao') +
                '<button class="btn btn--forte" id="ex-ver">Ver uma explicação</button>';
            ui.$('ex-ver').addEventListener('click', function () { revelar(null); });
            return;
        }
        rodando = true;
        var barra = ui.$('ex-barra');
        ui.$('ex-res').innerHTML = '';
        ui.$('ex-ir').textContent = '● ouvindo…';
        ui.$('ex-ir').classList.add('is-gravando');

        barra.style.transition = 'none';
        barra.style.width = '100%';
        setTimeout(function () {
            if (!document.body.contains(barra)) return;
            barra.style.transition = 'width ' + TEMPO + 's linear';
            barra.style.width = '0%';
        }, 20);

        F.voz.ouvir({
            continuo: true,
            limite: TEMPO * 1000,
            onParcial: function (t) { ouvidoAgora = t; acender(t); }
        }).then(function (r) {
            revelar(r.vazio ? '' : r.texto);
        }).catch(function () {
            revelar(ouvidoAgora || '');
        });
    }

    /* Escrever em vez de falar. A regra é a mesma — proibidas queimam,
       as que ajudam acendem, e o mínimo de palavras continua valendo.
       O que se perde é o relógio, porque digitar em quarenta segundos é
       outra prova; o que se ganha é poder fazer o exercício no ônibus. */
    function porEscrito() {
        if (rodando) { F.voz.pararEscuta(); rodando = false; }
        var barra = ui.$('ex-barra');
        if (barra) { barra.style.transition = 'none'; barra.style.width = '0%'; }
        F.pratica.escrita('ex-res', {
            dica: 'Escreva a explicação sem usar as palavras proibidas. Sem relógio nesta — ' +
                'mas escreva de uma vez, sem ficar buscando a palavra perfeita.',
            exemplo: "it's the thing you use when...",
            linhas: 4,
            aoConferir: function (v) { acender(v); revelar(v); }
        });
    }

    /* Acende as fichas enquanto a pessoa fala. É o que torna o
       exercício um jogo: o erro aparece no instante em que sai da
       boca, não num relatório no fim. */
    function acender(texto) {
        var caixa = ui.$('ex-txt');
        if (!caixa) return;
        var it = item();
        caixa.textContent = texto;

        it.proibidas.forEach(function (p, i) {
            if (contem(texto, p) && queimadas.indexOf(i) < 0) {
                queimadas.push(i);
                var f = ui.q('#ex-proibidas [data-p="' + i + '"]');
                if (f) f.classList.add('is-queimada');
                ui.toast('Queimou: “' + p + '”', 'erro');
            }
        });
        it.ajudam.forEach(function (p, i) {
            if (contem(texto, p) && acesas.indexOf(i) < 0) {
                acesas.push(i);
                var f = ui.q('#ex-ajudam [data-a="' + i + '"]');
                if (f) f.classList.add('is-acesa');
            }
        });
    }

    /* Casa palavra inteira e deixa passar plural e -ing/-ed, senão
       "card" não pegaria "cards" e o jogo viraria sorte. Expressão
       de duas palavras é procurada inteira. */
    function contem(texto, alvo) {
        var t = ' ' + F.texto.normalizar(texto) + ' ';
        var a = F.texto.normalizar(alvo).replace(/^to /, '');
        if (a.indexOf(' ') >= 0) return t.indexOf(' ' + a + ' ') >= 0;
        var formas = [a, a + 's', a + 'es', a + 'ed', a + 'ing', a + 'd'];
        if (/e$/.test(a)) formas.push(a.slice(0, -1) + 'ing');
        for (var i = 0; i < formas.length; i++) {
            if (t.indexOf(' ' + formas[i] + ' ') >= 0) return true;
        }
        return false;
    }

    /* ------------- o veredito ------------- */

    function revelar(ouvido) {
        rodando = false;
        clearTimeout(timer);
        F.voz.pararEscuta();
        var caixa = ui.$('ex-res');
        if (!caixa) return;
        var bt = ui.$('ex-ir');
        if (bt) { bt.textContent = '🎙 Explicar de novo'; bt.classList.remove('is-gravando'); }

        var it = item();
        var html = '';

        if (ouvido !== null && ouvido !== undefined) {
            acender(ouvido);
            var palavras = F.texto.palavras(ouvido || '').length;
            var limpo = queimadas.length === 0;
            var ganhou = limpo && palavras >= MIN_PALAVRAS;
            notas.push(ganhou);
            F.store.registrar('explicar', ganhou ? 100 : (limpo ? 55 : 25));
            contarParaOBloco();

            html += '<div class="res-topo"><div class="res-txt"><b>' + esc(
                ganhou ? 'Explicou sem a palavra. É exatamente isso.'
                    : !limpo ? 'Chegou lá, mas pela porta proibida.'
                        : palavras ? 'Curto demais. Uma explicação precisa de mais que uma frase.'
                            : 'Não veio nada. Na próxima, escreva ou fale mesmo torto.') +
                '</b><small>' + palavras + ' palavras' +
                (queimadas.length ? ' · queimou ' + queimadas.map(function (i) {
                    return '“' + it.proibidas[i] + '”';
                }).join(', ') : ' · nenhuma proibida') +
                (acesas.length ? ' · acendeu ' + acesas.length + ' que ajudam' : '') +
                '</small></div></div>';

            if (ouvido) {
                html += '<div class="ex-minha"><b>O que você disse</b><p>' + esc(ouvido) + '</p></div>' +
                    F.correcao.html(ouvido);
            }
        }

        html += '<div class="possiveis"><div class="possivel"><b>Uma forma de explicar</b>' +
            '<p class="possivel-en">' + esc(it.modelo) + ' ' + ui.botaoOuvir(it.modelo, 'ouvir') + '</p>' +
            '<p class="possivel-pt">' + esc(it.modeloPt) + '</p></div>' +
            '<p class="legenda">A sua não precisa parecer com esta. Compare só o tamanho e a ' +
            'coragem de continuar falando.</p></div>' +
            '<div class="linha-botoes">' +
            '<button class="btn" id="ex-rep">↻ Tentar de novo</button>' +
            '<button class="btn btn--forte" id="ex-prox">Próxima →</button></div>';

        caixa.innerHTML = html;
        ui.$('ex-rep').addEventListener('click', function () {
            if (notas.length) notas.pop();
            pintar();
        });
        ui.$('ex-prox').addEventListener('click', function () { pos++; pintar(); });
    }

    function fim(area) {
        if (!area) return;
        var pct = notas.length ? Math.round((notas.filter(Boolean).length / notas.length) * 100) : 0;
        area.innerHTML = barraDoBloco() +
            '<div class="teste-fim">' + ui.anel(pct, 'sem a palavra') +
            '<p>' + esc(pct >= 80
                ? 'Você contornou quase tudo. Numa conversa real, isso é o que impede a travada.'
                : pct >= 40
                    ? 'Metade saiu. As que queimaram são as palavras em que sua cabeça só tem um caminho.'
                    : 'Difícil no começo — é normal. Use as palavras que ajudam como muleta até não precisar mais.') +
            '</p><div class="linha-botoes">' +
            '<button class="btn btn--forte" id="ex-mais">Mais cinco palavras</button>' +
            '<a class="btn" href="#/exercicios">Outro exercício</a></div></div>';
        ui.$('ex-mais').addEventListener('click', function () {
            fila = montarFila(); pos = 0; notas = []; pintar();
        });
    }

    function montar() { pintar(); }

    function desmontar() {
        clearTimeout(timer);
        rodando = false;
        F.voz.pararEscuta();
    }

    return { render: render, montar: montar, desmontar: desmontar };
})();
