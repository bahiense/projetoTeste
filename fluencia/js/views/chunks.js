/* =========================================================
   TELA BLOCOS — o bloco não se traduz, se encaixa.

   A versão anterior mostrava o português e pedia o inglês, que é
   exatamente o que a Tradução reversa faz — dois exercícios com
   a mesma cara. E era o exercício errado para bloco pronto:
   ninguém traduz "to be honest with you" no meio de uma frase.
   Bloco de fala é RECUPERAÇÃO, não tradução.

   Agora são dois passos:
     1. FORMA — o bloco aparece furado ("to be ___ with ___") e
        você completa em voz alta. Sem português na tela.
     2. USO — você inventa uma frase sua que CONTENHA o bloco. O
        app confere se ele está lá dentro, não se a frase é
        parecida com um modelo — porque não existe modelo.

   A repetição espaçada continua mandando na volta do cartão.
   ========================================================= */
window.F = window.F || {};
F.telas = F.telas || {};

F.telas.chunks = (function () {
    'use strict';
    var ui = F.ui, esc = F.ui.esc;
    var fila = [], pos = 0, modo = 'treino', filtro = '';
    /* buracos do cartão atual e o que já foi conquistado nele */
    var furos = [], formaOk = false, usoOk = false;

    function render(args) {
        filtro = args[0] || '';
        var conjunto = F.curso.chunksDaSemana();
        var base = filtro ? F.data.chunks.filter(function (c) { return c.f === filtro; }) : conjunto.todos;
        var r = F.srs.resumo(base);
        fila = F.srs.fila(base, 20);
        pos = 0; formaOk = false; usoOk = false;

        var funcoes = ['<a class="pilula' + (filtro ? '' : ' is-on') + '" href="#/chunks">Da semana</a>'].concat(
            F.data.funcoes.map(function (f) {
                return '<a class="pilula' + (filtro === f.id ? ' is-on' : '') + '" href="#/chunks/' + f.id + '">' + esc(f.nome) + '</a>';
            })).join('');

        var fn = filtro ? F.curso.funcao(filtro) : null;

        var comoFazer = '<p>O nativo não monta a frase peça por peça: ele puxa o bloco pronto. Enquanto ' +
            'você traduz, ele já está na terceira frase.</p>' +
            '<ol>' +
            '<li><b>Complete o bloco.</b> Ele aparece furado e você diz inteiro, em voz alta. ' +
            'Não tem português na tela de propósito: bloco pronto se recupera pela forma e pela ' +
            'situação, não pela tradução.</li>' +
            '<li><b>Use num contexto seu.</b> Invente uma frase que contenha o bloco. O app só ' +
            'confere se ele está lá dentro — o resto da frase é seu, e é isso que transforma ' +
            'decoreba em fala.</li>' +
            '</ol>' +
            '<p><b>As três notas</b> decidem quando o bloco volta: <i>Não saiu</i> traz de volta amanhã, ' +
            '<i>Com esforço</i> em poucos dias, <i>Saiu na hora</i> some por semanas. Seja honesto — ' +
            'a repetição espaçada só funciona com nota sincera.</p>' +
            '<p class="destaque">Se quiser o exercício de traduzir a frase inteira do português, ele ' +
            'existe e é outro: <b>Tradução reversa</b>.</p>' +
            (fn ? '<p><b>' + esc(fn.nome) + ':</b> ' + esc(fn.desc) + '</p>' : '');

        return ui.cabecalho('Blocos de fala') +
            '<div class="pilulas">' + funcoes + '</div>' +

            '<div class="cartao">' +
            '<div class="cartao-titulo"><h3>' + esc(fn ? fn.nome : 'Da semana') + '</h3>' +
            ui.ajuda('Como funcionam os blocos', comoFazer) + '</div>' +
            '<div class="srs-resumo">' +
            '<div><b>' + r.revisar + '</b><small>para revisar</small></div>' +
            '<div><b>' + r.novos + '</b><small>novos</small></div>' +
            '<div><b>' + r.aprendidos + '</b><small>na memória longa</small></div>' +
            '<div><b>' + r.total + '</b><small>no conjunto</small></div>' +
            '</div>' +
            '<div class="segmentado" id="ch-modo">' +
            '<button data-m="treino" class="is-on">Treinar</button>' +
            '<button data-m="lista">Ver a lista</button>' +
            '</div>' +
            '<div id="ch-area"></div>' +
            '</div>';
    }

    function pintar() {
        var area = ui.$('ch-area');
        if (!area) return;
        if (modo === 'lista') return pintarLista(area);
        if (!fila.length) {
            area.innerHTML = '<p class="vazio">Nada para revisar agora neste conjunto. ' +
                'Volte amanhã ou escolha outra função acima.</p>';
            return;
        }
        if (pos >= fila.length) {
            area.innerHTML = '<div class="teste-fim"><p class="feito-tudo">Rodada concluída: ' + fila.length + ' blocos.</p>' +
                '<p class="sub">Os que você errou voltam amanhã. Os fáceis somem por semanas.</p>' +
                '<button class="btn btn--forte" id="ch-mais">Mais uma rodada</button></div>';
            ui.$('ch-mais').addEventListener('click', function () { F.app.desenhar(); });
            F.store.concluirBloco('chunks');
            return;
        }

        var c = fila[pos];
        var cart = F.srs.cartao(c.id);
        furos = furar(c.en);
        formaOk = false; usoOk = false;

        area.innerHTML =
            '<div class="carta">' +
            '<div class="carta-topo">' + (pos + 1) + ' de ' + fila.length +
            ' · <span class="tag">' + esc((F.curso.funcao(c.f) || {}).nome || c.f) + '</span>' +
            (cart.rep ? ' · visto ' + (cart.acertos + cart.erros) + '×' : ' · novo') + '</div>' +
            '<p class="carta-furada">' + furos.html + '</p>' +
            '<p class="carta-instrucao">Complete o bloco em voz alta. Sem tradução — ' +
            'é para vir pela forma.</p>' +
            F.pratica.caixa('ch-forma', '🎙 Dizer o bloco completo') +
            '<div class="linha-botoes">' +
            '<button class="btn" id="ch-revelar">Não lembro — mostrar</button>' +
            '</div>' +
            '<div id="ch-frente"></div>' +
            '</div>';

        F.pratica.ligar('ch-forma', {
            alvo: c.en,
            serie: 'pronuncia',
            veredito: function (pct) {
                return pct >= 80 ? 'É esse o bloco.'
                    : pct >= 50 ? 'Quase — olhe qual palavra faltou.'
                        : 'Não é esse. Veja o bloco inteiro e repita.';
            },
            aoResultado: function (pct) {
                if (pct >= 80) formaOk = true;
                revelar();
            }
        });
        ui.$('ch-revelar').addEventListener('click', revelar);
    }

    /* Fura o bloco: some com metade das palavras longas, que são as que
       carregam a forma. Palavrinha de ligação fica, senão o cartão vira
       adivinhação e não recuperação. */
    function furar(en) {
        var partes = String(en).split(/(\s+)/);
        var candidatos = [];
        partes.forEach(function (p, i) {
            if (/^\s+$/.test(p)) return;
            var limpa = p.replace(/[^A-Za-z']/g, '');
            if (limpa.length >= 4) candidatos.push(i);
        });
        var quantos = Math.max(1, Math.round(candidatos.length / 2));
        var sorteados = ui.embaralhar(candidatos.slice()).slice(0, quantos);
        var html = partes.map(function (p, i) {
            if (sorteados.indexOf(i) < 0) return esc(p);
            return '<i class="furo">' + p.replace(/[A-Za-z']/g, '_') + '</i>';
        }).join('');
        return { html: html, quantos: quantos };
    }

    function revelar() {
        var c = fila[pos];
        var el = ui.$('ch-frente');
        if (!el) return;
        var ver = ui.$('ch-revelar');
        if (ver) ver.hidden = true;

        el.innerHTML =
            '<p class="carta-en">' + esc(c.en) + '</p>' +
            '<p class="carta-pt">' + esc(c.pt) + '</p>' +
            (c.nota ? '<p class="carta-nota">' + esc(c.nota) + '</p>' : '') +
            '<div class="linha-botoes">' +
            ui.botaoOuvir(c.en, 'Ouvir') +
            '<button class="btn btn--som" data-falar="' + esc(c.en) + '" data-rate="0.65">🐢 Devagar</button>' +
            '<button class="btn" id="ch-marcar">☆ Marcar</button>' +
            '</div>' +
            '<div class="ch-uso">' +
            '<b>Agora use num contexto seu</b>' +
            '<p class="sub">Invente uma frase sua que contenha este bloco. Não existe modelo: o app ' +
            'só confere se o bloco está lá dentro.</p>' +
            '<button class="btn btn--forte" id="ch-usar">🎙 Falar a minha frase</button>' +
            '<div id="ch-uso-res"></div>' +
            '</div>' +
            '<p class="carta-pergunta">O bloco veio à cabeça sozinho?</p>' +
            '<div class="notas">' +
            '<button class="btn btn--nota bad" data-nota="0">Não saiu<small>volta amanhã</small></button>' +
            '<button class="btn btn--nota mid" data-nota="1">Com esforço<small>volta em breve</small></button>' +
            '<button class="btn btn--nota good" data-nota="2">Saiu na hora<small>some por semanas</small></button>' +
            '</div>';

        F.voz.falar(c.en);

        ui.$('ch-marcar').addEventListener('click', function () {
            var m = F.store.get().marcados;
            var k = m.indexOf(c.id);
            if (k >= 0) { m.splice(k, 1); ui.toast('Desmarcado.'); }
            else { m.push(c.id); ui.toast('Marcado para revisar sempre.'); }
            F.store.salvar();
        });

        ui.$('ch-usar').addEventListener('click', function () { ouvirUso(c); });

        ui.qq('#ch-area [data-nota]').forEach(function (b) {
            b.addEventListener('click', function () {
                F.srs.responder(c.id, parseInt(b.getAttribute('data-nota'), 10));
                pos++;
                pintar();
            });
        });
    }

    /* O uso não é comparado com modelo nenhum: o único critério é o bloco
       ter aparecido inteiro dentro da frase que o aluno inventou. Medir
       proximidade aqui reprovaria justamente a frase original, que é o
       que o exercício quer. */
    function ouvirUso(c) {
        var bt = ui.$('ch-usar');
        var caixa = ui.$('ch-uso-res');
        if (!bt || !caixa) return;
        if (!F.voz.temEscuta()) {
            caixa.innerHTML = '<textarea class="entrada" id="ch-uso-txt" rows="2" ' +
                'placeholder="write your own sentence with the block"></textarea>' +
                '<button class="btn" id="ch-uso-conferir">Conferir</button>';
            ui.$('ch-uso-conferir').addEventListener('click', function () {
                julgarUso(c, ui.$('ch-uso-txt').value);
            });
            return;
        }
        bt.textContent = '● ouvindo…';
        bt.classList.add('is-gravando');
        F.voz.ouvir({ limite: 12000 }).then(function (r) {
            var b = ui.$('ch-usar');
            if (b) { b.textContent = '🎙 Falar de novo'; b.classList.remove('is-gravando'); }
            julgarUso(c, r.vazio ? '' : r.texto);
        }).catch(function () {
            var b = ui.$('ch-usar');
            if (b) { b.textContent = '🎙 Falar de novo'; b.classList.remove('is-gravando'); }
            if (ui.$('ch-uso-res')) ui.$('ch-uso-res').innerHTML = ui.aviso('A escuta falhou agora. Tente de novo.', 'atencao');
        });
    }

    function julgarUso(c, dito) {
        var caixa = ui.$('ch-uso-res');
        if (!caixa) return;
        if (!dito) {
            caixa.innerHTML = ui.aviso('Não ouvi nada. Fale mais perto do aparelho.', 'atencao');
            return;
        }
        var dentro = contem(dito, c.en);
        var extras = Math.max(0, F.texto.palavras(dito).length - F.texto.palavras(c.en).length);
        usoOk = dentro && extras >= 2;
        F.store.registrar('chunks', usoOk ? 100 : (dentro ? 60 : 20));

        caixa.innerHTML =
            '<div class="res-topo"><div class="res-txt"><b>' + esc(
                usoOk ? 'O bloco entrou numa frase sua. É esse o objetivo.'
                    : dentro ? 'O bloco está lá, mas quase nada em volta. Construa uma frase inteira.'
                        : 'O bloco não apareceu na frase. Ele precisa sair inteiro, do jeito que é.') +
            '</b><small>Ouvi: “' + esc(dito) + '”' +
            (dentro ? ' · ' + extras + ' palavras suas em volta' : '') + '</small></div></div>' +
            /* a correção só entra quando há erro clássico a nomear; sem isso
               ela vira um parágrafo de "não achei nada" em todo cartão */
            (F.correcao.analisar(dito).achados.length ? F.correcao.html(dito) : '');
    }

    /* Casa o bloco dentro da fala do aluno já normalizado: contração
       expandida, apóstrofo fora, pontuação fora. "I'd love to" e
       "I would love to" contam como o mesmo bloco. */
    function contem(dito, bloco) {
        var d = ' ' + F.texto.normalizar(dito) + ' ';
        var b = ' ' + F.texto.normalizar(bloco) + ' ';
        return d.indexOf(b) >= 0;
    }

    function pintarLista(area) {
        var conjunto = filtro ? F.data.chunks.filter(function (c) { return c.f === filtro; }) : F.curso.chunksDaSemana().todos;
        var porFuncao = {};
        conjunto.forEach(function (c) { (porFuncao[c.f] = porFuncao[c.f] || []).push(c); });

        area.innerHTML = Object.keys(porFuncao).map(function (f) {
            var fn = F.curso.funcao(f) || { nome: f, desc: '' };
            return '<section class="grupo">' +
                '<h4>' + esc(fn.nome) + '</h4><p class="sub">' + esc(fn.desc) + '</p>' +
                '<ul class="lista-chunks">' + porFuncao[f].map(function (c) {
                    var cart = F.srs.cartao(c.id);
                    return '<li>' +
                        '<button class="chunk-som" data-falar="' + esc(c.en) + '">🔊</button>' +
                        '<span><b>' + esc(c.en) + '</b><small>' + esc(c.pt) + '</small>' +
                        (c.nota ? '<em>' + esc(c.nota) + '</em>' : '') + '</span>' +
                        '<i class="selo n' + c.n + '">' + (cart.int >= 21 ? '✓' : c.n) + '</i>' +
                        '</li>';
                }).join('') + '</ul></section>';
        }).join('');
    }

    function montar() {
        ui.qq('#ch-modo button').forEach(function (b) {
            b.addEventListener('click', function () {
                modo = b.getAttribute('data-m');
                ui.qq('#ch-modo button').forEach(function (x) { x.classList.toggle('is-on', x === b); });
                pintar();
            });
        });
        pintar();
    }

    return { render: render, montar: montar };
})();
