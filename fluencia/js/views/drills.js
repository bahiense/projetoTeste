/* =========================================================
   TELA DRILLS — estímulo, relógio, resposta.

   Não é para acertar pensando: é para acertar sem pensar.
   Enquanto a estrutura exigir raciocínio, ela não existe na
   sua fala espontânea.
   ========================================================= */
window.F = window.F || {};
F.telas = F.telas || {};

F.telas.drills = (function () {
    'use strict';
    var ui = F.ui, esc = F.ui.esc;
    /* Quantas respostas fecham o bloco de drill do dia. Conta o trabalho
       feito, não a chegada à última tela: pode ser em drills diferentes e
       em várias sessões — sair da tela não apaga nada. */
    var META_DIA = 8;
    var drill = null, ordem = [], pos = 0, notas = [], tempo = 5, timer = null, rodando = false;
    /* marca se a tentativa atual já lançou nota — repetir o item tem de
       desfazer essa nota, senão o mesmo estímulo conta duas vezes. */
    var notaLancada = false;

    function render(args) {
        var id = args[0] || F.curso.semanaAtual().drill;
        drill = F.curso.drill(id) || F.data.drills[0];
        ordem = ui.embaralhar(drill.itens);
        pos = 0; notas = [];

        var pills = F.data.drills.map(function (d) {
            return '<a class="pilula' + (d.id === drill.id ? ' is-on' : '') + '" href="#/drills/' + d.id + '">' + esc(d.nome) + '</a>';
        }).join('');

        var comoFazer = '<ol>' +
            '<li>Toque em <b>Ouvir e responder</b>: o app fala o estímulo.</li>' +
            '<li>Responda <b>em voz alta</b> antes de o tempo acabar. Não escreva, não pense demais.</li>' +
            '<li>Só então o app mostra a resposta e o que ele ouviu de você.</li>' +
            '</ol>' +
            '<p><b>Este drill:</b> ' + esc(drill.foco) + '</p>' +
            '<p><b>Como fazer:</b> ' + esc(drill.instrucao) + '</p>' +
            '<p><b>' + (drill.aberto ? 'Exemplo' : 'Modelo') + ':</b> <i>' + esc(drill.modelo) + '</i></p>' +
            (drill.aberto
                ? '<p class="destaque"><b>Resposta livre.</b> Várias respostas servem — o app não compara ' +
                'palavra por palavra. O que conta é responder rápido, sem travar. A resposta mostrada ' +
                'depois é <i>uma</i> possibilidade, para comparar ideias, não para copiar.</p>'
                : '<p class="destaque"><b>Resposta única.</b> Este drill treina uma estrutura: existe uma ' +
                'forma certa, e o objetivo é que ela saia sem você pensar.</p>') +
            '<p>O tempo de resposta começa em 5 segundos. Diminua só quando estiver acertando quase tudo.</p>';

        return ui.cabecalho('Drills') +
            '<div class="pilulas">' + pills + '</div>' +
            '<div class="cartao">' +
            '<div class="cartao-titulo">' +
            '<h3>' + esc(drill.nome) + '</h3>' +
            '<span class="etiqueta">' + (drill.aberto ? 'resposta livre' : 'resposta única') + '</span>' +
            ui.ajuda('Como funciona este drill', comoFazer) +
            '</div>' +
            '<label class="campo campo--slider"><span>Tempo para responder: <b id="dr-tv">' + tempo + 's</b></span>' +
            '<input type="range" id="dr-tempo" min="2" max="10" step="1" value="' + tempo + '"></label>' +
            '<div id="dr-area"></div>' +
            '</div>';
    }

    /* Os drills de estrutura têm par simples; os de resposta livre trazem
       ainda uma segunda forma de dizer e a tradução das duas — é o que
       permite ao aluno entender a resposta em vez de só copiá-la. */
    function comoObjeto(it) {
        return {
            estimulo: it[0], resposta: it[1],
            alternativa: it[2] || '', pt: it[3] || '', ptAlt: it[4] || ''
        };
    }

    function pintar() {
        var area = ui.$('dr-area');
        if (!area) return;
        if (pos >= ordem.length) return fim(area);

        notaLancada = false;
        var it = comoObjeto(ordem[pos]);
        area.innerHTML =
            '<div class="dr-topo"><span>' + (pos + 1) + ' de ' + ordem.length + '</span>' +
            '<span class="dt-placar">acertos: ' + notas.filter(Boolean).length + '</span></div>' +
            barraDoBloco() +
            '<div class="dr-estimulo" id="dr-est">' + esc(it.estimulo) + '</div>' +
            '<div class="dr-relogio"><i id="dr-barra"></i></div>' +
            '<div class="linha-botoes">' +
            '<button class="btn btn--forte" id="dr-ir">▶ Ouvir e responder</button>' +
            F.pratica.botaoEscrever('dr-escrever', 'Escrever') +
            '<button class="btn" id="dr-ver">' + (drill.aberto ? 'Ver uma resposta' : 'Ver a resposta') + '</button>' +
            '</div>' +
            '<div id="dr-res"></div>';

        ui.$('dr-ir').addEventListener('click', rodar);
        ui.$('dr-escrever').addEventListener('click', porEscrito);
        ui.$('dr-ver').addEventListener('click', function () { revelar(null); });
    }

    /* O aluno precisa ver o que falta para o bloco fechar — antes disto
       ele respondia por um tempão sem saber que o ✓ do dia dependia de
       terminar a rodada inteira sem sair da tela. */
    function barraDoBloco() {
        var n = F.store.feitosHoje('drill');
        if (F.store.blocoFeito('drill')) {
            return '<p class="bloco-progresso is-ok">✓ Bloco de drill do dia concluído — ' +
                n + ' respostas. O que vier agora é treino extra.</p>';
        }
        return '<p class="bloco-progresso">Bloco do dia: <b>' + n + ' de ' + META_DIA +
            '</b> respostas' + (n ? '' : ' — vale qualquer drill, em qualquer ordem') + '.</p>';
    }

    /* Marca o bloco assim que o trabalho do dia chega na meta, e não só no
       fim da rodada: trocar de drill ou fechar o app não perde o progresso. */
    function contarParaOBloco() {
        if (F.store.blocoFeito('drill')) return;
        if (F.store.feitosHoje('drill') < META_DIA) return;
        F.store.concluirBloco('drill');
        ui.toast('Bloco de drill do dia concluído ✓');
    }

    /* Escrever em vez de falar. O relógio não corre aqui: digitar em cinco
       segundos não é a mesma prova que responder em cinco segundos, e
       fingir que é só produziria nota falsa. O estímulo é falado do mesmo
       jeito — o ouvido continua trabalhando. */
    function porEscrito() {
        if (rodando) { F.voz.pararEscuta(); rodando = false; clearTimeout(timer); }
        var it = comoObjeto(ordem[pos]);
        F.voz.falar(it.estimulo, { rate: 0.95 });
        F.pratica.escrita('dr-res', {
            dica: 'Responda por escrito, como se estivesse falando. Sem relógio nesta.',
            exemplo: drill.aberto ? 'your answer, in a full sentence' : 'the structure, complete',
            aoConferir: function (v) { revelar(v); }
        });
    }

    function rodar() {
        if (rodando) return;
        rodando = true;
        var it = comoObjeto(ordem[pos]);
        var barra = ui.$('dr-barra');
        ui.$('dr-res').innerHTML = '';

        F.voz.falar(it.estimulo, { rate: 0.95 }).then(function () {
            if (!document.body.contains(barra)) return;
            barra.style.transition = 'none';
            barra.style.width = '100%';
            setTimeout(function () {
                barra.style.transition = 'width ' + tempo + 's linear';
                barra.style.width = '0%';
            }, 20);

            if (F.voz.temEscuta()) {
                F.voz.ouvir({ limite: tempo * 1000 }).then(function (r) {
                    revelar(r.vazio ? '' : r.texto);
                }).catch(function () { revelar(null); });
            } else {
                timer = setTimeout(function () { revelar(null); }, tempo * 1000);
            }
        });
    }

    function revelar(ouvido) {
        rodando = false;
        clearTimeout(timer);
        F.voz.pararEscuta();
        var caixa = ui.$('dr-res');
        if (!caixa) return;
        var it = comoObjeto(ordem[pos]);
        var certa = it.resposta;
        var html = drill.aberto ? possibilidades(it)
            : '<div class="dr-resposta"><b>Resposta:</b> ' + esc(certa) + ' ' +
            ui.botaoOuvir(certa, 'ouvir') + '</div>' +
            (it.pt ? '<p class="corr-traducao">' + esc(it.pt) + '</p>' : '');

        if (ouvido !== null && ouvido !== undefined) {
            if (drill.aberto) {
                /* Resposta livre: comparar com um modelo único reprovaria uma
                   resposta boa só por ser diferente — que é exatamente o que
                   este exercício quer que o aluno produza. O que se mede aqui
                   é ter respondido, e rápido. */
                var palavras = F.texto.palavras(ouvido || '');
                var respondeu = palavras.length >= 3;
                notas.push(respondeu); notaLancada = true;
                F.store.registrar('drill', respondeu ? 100 : (palavras.length ? 50 : 0));
                contarParaOBloco();
                html = '<div class="res-topo"><div class="res-txt"><b>' +
                    esc(respondeu ? 'Respondeu — é isso que o exercício mede.'
                        : palavras.length ? 'Saiu curto demais. Uma frase inteira, mesmo torta.'
                            : 'Não saiu nada. Da próxima, fale qualquer coisa antes do tempo acabar.') +
                    '</b></div></div>' +
                    F.correcao.html(ouvido, { checar: drill.checar || [] }) +
                    possibilidades(it);
            } else {
                var r = F.texto.pontuar(certa, ouvido);
                notas.push(r.pct >= 70); notaLancada = true;
                F.store.registrar('drill', r.pct);
                contarParaOBloco();
                html += '<div class="res-topo">' + ui.anel(r.pct) +
                    '<div class="res-txt"><b>' + esc(r.pct >= 70 ? 'Saiu.' : 'Ainda não saiu automático.') + '</b>' +
                    '<small>Ouvi: “' + esc(ouvido || '(nada)') + '”</small></div></div>' + ui.diff(r) +
                    (it.pt ? '<p class="corr-traducao">' + esc(it.pt) + '</p>' : '') +
                    // aqui a nota já mostra o desvio; a correção só entra se
                    // houver um erro clássico de brasileiro para nomear
                    (F.correcao.analisar(ouvido).achados.length ? F.correcao.html(ouvido) : '');
            }
        } else {
            html += '<p class="carta-pergunta">Você respondeu antes de ouvir?</p>' +
                '<div class="notas">' +
                '<button class="btn btn--nota bad" data-ok="0">Não</button>' +
                '<button class="btn btn--nota good" data-ok="1">Sim, na hora</button></div>';
        }
        html += '<div class="linha-botoes">' +
            '<button class="btn" id="dr-rep">↻ Repetir este</button>' +
            '<button class="btn btn--forte" id="dr-prox">Próximo →</button></div>';
        caixa.innerHTML = html;

        F.voz.falar(certa, { rate: 0.95 });

        ui.qq('#dr-res [data-ok]').forEach(function (b) {
            b.addEventListener('click', function () {
                var ok = b.getAttribute('data-ok') === '1';
                notas.push(ok);
                F.store.registrar('drill', ok ? 100 : 0);
                contarParaOBloco();
                pos++; pintar();
            });
        });
        ui.$('dr-rep').addEventListener('click', repetir);
        ui.$('dr-prox').addEventListener('click', function () { pos++; pintar(); });
    }

    /* Repetir não avança e não deixa rastro: a nota da tentativa anterior
       sai da conta, para o mesmo estímulo não pesar duas vezes no placar. */
    function repetir() {
        F.voz.pararFala();
        F.voz.pararEscuta();
        clearTimeout(timer);
        rodando = false;
        if (notaLancada) { notas.pop(); notaLancada = false; }
        pintar();
    }

    /* Duas formas de dizer a mesma coisa, cada uma com a tradução. Uma
       resposta só ensina a copiar; duas ensinam que existe escolha. */
    function possibilidades(it) {
        var bloco = '<div class="possiveis">' +
            '<div class="possivel"><b>Uma resposta possível</b>' +
            '<p class="possivel-en">' + esc(it.resposta) + ' ' + ui.botaoOuvir(it.resposta, 'ouvir') + '</p>' +
            (it.pt ? '<p class="possivel-pt">' + esc(it.pt) + '</p>' : '') +
            '</div>';

        if (it.alternativa) {
            bloco += '<div class="possivel"><b>Outra forma de dizer</b>' +
                '<p class="possivel-en">' + esc(it.alternativa) + ' ' + ui.botaoOuvir(it.alternativa, 'ouvir') + '</p>' +
                (it.ptAlt ? '<p class="possivel-pt">' + esc(it.ptAlt) + '</p>' : '') +
                '</div>';
        }

        return bloco + '<p class="legenda">A sua não precisa ser igual a nenhuma das duas. ' +
            'Compare a ideia, o tamanho e o registro.</p></div>';
    }

    function fim(area) {
        if (!area) return;
        var pct = notas.length ? Math.round((notas.filter(Boolean).length / notas.length) * 100) : 0;
        F.store.concluirBloco('drill');
        area.innerHTML = '<div class="teste-fim">' + ui.anel(pct, drill.aberto ? 'sem travar' : 'automático') +
            '<p>' + esc(drill.aberto
                ? (pct >= 90 ? 'Você respondeu a quase tudo no tempo. É esse o objetivo.'
                    : pct >= 60 ? 'Bom. As que ficaram para trás são as que você ainda traduz antes de falar.'
                        : 'Muitas ficaram no silêncio. Aumente o tempo de resposta e vá diminuindo aos poucos.')
                : (pct >= 90 ? 'Automatizado. Pode trocar de drill.'
                    : pct >= 60 ? 'Está virando reflexo. Mais duas rodadas hoje e amanhã.'
                        : 'Ainda está sendo raciocinado. Diminua o tempo de resposta só quando acertar 8 de 10.')) + '</p>' +
            '<div class="linha-botoes">' +
            '<button class="btn btn--forte" id="dr-de-novo">Rodar de novo, embaralhado</button>' +
            '<a class="btn" href="#/exercicios">Outro exercício</a></div></div>';
        ui.$('dr-de-novo').addEventListener('click', function () {
            ordem = ui.embaralhar(drill.itens); pos = 0; notas = []; pintar();
        });
    }

    function montar() {
        ui.$('dr-tempo').addEventListener('input', function () {
            tempo = parseInt(this.value, 10);
            ui.$('dr-tv').textContent = tempo + 's';
        });
        pintar();
    }

    function desmontar() { clearTimeout(timer); rodando = false; }

    return { render: render, montar: montar, desmontar: desmontar };
})();
