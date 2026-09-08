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
    var furos = [], formaOk = false, usoOk = false, nivelDica = 0;

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
        var primeiraVez = !cart.rep && !(cart.acertos + cart.erros);
        furos = furar(c.en);
        formaOk = false; usoOk = false; nivelDica = 0;

        var topo = '<div class="carta-topo">' + (pos + 1) + ' de ' + fila.length +
            ' · <span class="tag">' + esc((F.curso.funcao(c.f) || {}).nome || c.f) + '</span>' +
            (cart.rep ? ' · visto ' + (cart.acertos + cart.erros) + '×' : ' · novo') + '</div>';

        /* Bloco novo não pode vir furado: não há o que recuperar de uma coisa
           que nunca entrou. Na primeira vez ele aparece inteiro, com sentido e
           áudio — é apresentação. O buraco começa na segunda. */
        if (primeiraVez) {
            area.innerHTML =
                '<div class="carta">' + topo +
                '<p class="carta-en">' + esc(c.en) + '</p>' +
                '<p class="carta-pt">' + esc(c.pt) + '</p>' +
                (c.nota ? '<p class="carta-nota">' + esc(c.nota) + '</p>' : '') +
                '<p class="carta-instrucao">Bloco novo: ouça e repita duas vezes. ' +
                'Da próxima vez ele vem furado.</p>' +
                '<div class="linha-botoes">' +
                ui.botaoOuvir(c.en, 'Ouvir') +
                '<button class="btn btn--som" data-falar="' + esc(c.en) + '" data-rate="0.65">🐢 Devagar</button>' +
                '</div>' +
                F.pratica.caixa('ch-forma', 'Repetir o bloco') +
                '<div class="linha-botoes">' +
                '<button class="btn" id="ch-revelar">Já repeti — seguir</button>' +
                '</div>' +
                '<div id="ch-frente"></div>' +
                '</div>';
            F.voz.falar(c.en);
        } else {
            area.innerHTML =
                '<div class="carta">' + topo +
                '<p class="carta-furada">' + furos.html + '</p>' +
                '<p class="carta-dica" id="ch-dica"></p>' +
                '<p class="carta-instrucao">Complete o bloco em voz alta. Sem tradução — ' +
                'é para vir pela forma.</p>' +
                F.pratica.caixa('ch-forma', 'Dizer o bloco completo') +
                '<div class="linha-botoes">' +
                '<button class="btn" id="ch-pista">💡 Dica</button>' +
                '<button class="btn" id="ch-revelar">Não lembro — mostrar</button>' +
                '</div>' +
                '<div id="ch-frente"></div>' +
                '</div>';
            ui.$('ch-pista').addEventListener('click', function () { maisDica(c); });
        }

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

    /* Dica em degraus, em vez de entregar tudo de uma vez. Cada degrau
       tira um pouco do esforço de recuperação, que é onde o exercício
       trabalha — por isso não começa pelo significado.

         1. quando se usa (a função, em português)
         2. a inicial de cada palavra que sumiu
         3. o sentido do bloco inteiro

       Depois dos três só resta "não lembro", que revela. */
    function maisDica(c) {
        var el = ui.$('ch-dica');
        var bt = ui.$('ch-pista');
        if (!el) return;
        nivelDica++;
        var fn = F.curso.funcao(c.f) || {};

        if (nivelDica === 1) {
            el.innerHTML = '<b>Serve para:</b> ' + esc(fn.desc || fn.nome || 'usar nesta função');
        } else if (nivelDica === 2) {
            el.innerHTML = '<b>Serve para:</b> ' + esc(fn.desc || fn.nome || '') +
                '<br><b>Começa com:</b> ' + esc(iniciais(c.en));
        } else {
            el.innerHTML = '<b>Serve para:</b> ' + esc(fn.desc || fn.nome || '') +
                '<br><b>Começa com:</b> ' + esc(iniciais(c.en)) +
                '<br><b>Em português:</b> ' + esc(c.pt);
            if (bt) { bt.disabled = true; bt.textContent = 'Acabaram as dicas'; }
        }
        if (bt && nivelDica < 3) bt.textContent = '💡 Mais uma dica';
    }

    /* Só as palavras que sumiram entregam a inicial; as que estão na tela
       não precisam de ajuda. */
    function iniciais(en) {
        var partes = String(en).split(/(\s+)/);
        var saida = [];
        partes.forEach(function (p, i) {
            if (/^\s+$/.test(p)) return;
            if (furos.escondidas.indexOf(i) < 0) return;
            var letra = p.replace(/[^A-Za-z]/g, '').charAt(0);
            if (letra) saida.push(letra.toUpperCase() + '…');
        });
        return saida.join(' ') || '—';
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
        return { html: html, quantos: quantos, escondidas: sorteados };
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
            '<div class="linha-botoes">' +
            '<button class="btn btn--forte" id="ch-usar">🎙 Falar a minha frase</button>' +
            F.pratica.botaoEscrever('ch-escrever', 'Escrever a frase') +
            '</div>' +
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
        ui.$('ch-escrever').addEventListener('click', function () {
            F.pratica.escrita('ch-uso-res', {
                dica: 'Escreva uma frase sua que contenha o bloco, do jeito que ele é.',
                exemplo: 'your own sentence with the block inside',
                aoConferir: function (v) { julgarUso(c, v); }
            });
        });

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
            F.pratica.escrita('ch-uso-res', {
                dica: 'Sem reconhecimento de fala neste aparelho. Escreva a frase — e diga em voz alta também.',
                exemplo: 'your own sentence with the block inside',
                aoConferir: function (v) { julgarUso(c, v); }
            });
            return;
        }
        bt.textContent = '● ouvindo…';
        bt.classList.add('is-gravando');
        F.voz.ouvir({ limite: 12000 }).then(function (r) {
            var b = ui.$('ch-usar');
            if (b) { b.textContent = '🎙 Falar de novo'; b.classList.remove('is-gravando'); }
            julgarUso(c, r.vazio ? '' : r.texto, true);
        }).catch(function () {
            var b = ui.$('ch-usar');
            if (b) { b.textContent = '🎙 Falar de novo'; b.classList.remove('is-gravando'); }
            if (ui.$('ch-uso-res')) ui.$('ch-uso-res').innerHTML = ui.aviso('A escuta falhou agora. Tente de novo.', 'atencao');
        });
    }

    function julgarUso(c, dito, foiFalado) {
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
            '</b><small>' + (foiFalado ? 'Ouvi: ' : 'Você escreveu: ') + '“' + esc(dito) + '”' +
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
