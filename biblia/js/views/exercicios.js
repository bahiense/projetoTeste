/* =========================================================
   TELA EXERCÍCIOS — o que ficou do capítulo.

   Múltipla escolha e certo/errado, corrigidos na hora: tocou na
   alternativa, já diz se acertou, por quê e em que versículo está. Sem
   nota guardada e sem ranking — isto é leitura, não prova.

   As perguntas são escritas pela IA no artefato, com o TEXTO DO
   CAPÍTULO dentro do pedido: a resposta certa tem de estar no texto. E
   mesmo assim o rodapé diz que, se a correção discordar da Bíblia, a
   Bíblia é que está certa.
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.exercicios = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, bib = B.biblia;

    var feito = {};     // índice da pergunta -> alternativa escolhida

    function separar(ref) {
        var m = (ref || '').match(/^(.*?)\s+(\d+)$/);
        if (!m) return null;
        var livro = bib.livro(m[1]);
        if (!livro) return null;
        var cap = parseInt(m[2], 10);
        if (!cap || cap > livro.caps) return null;
        return { livro: livro, capitulo: cap, ref: livro.nome + ' ' + cap };
    }

    /**
     * O JSON das perguntas, lido com desconfiança.
     *
     * O modelo às vezes embrulha a resposta em cercas de código, e um
     * JSON quebrado não pode virar tela quebrada: vira recado.
     */
    function ler(texto) {
        var t = String(texto || '').trim();
        var cerca = t.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (cerca) t = cerca[1].trim();
        var i = t.indexOf('{'), j = t.lastIndexOf('}');
        if (i > 0 || j < t.length - 1) t = t.slice(i, j + 1);
        var d;
        try { d = JSON.parse(t); } catch (e) { return null; }
        var lista = (d && d.perguntas) || [];
        lista = lista.filter(function (q) {
            if (!q || !q.p) return false;
            if (q.t === 'cv') return typeof q.c === 'boolean';
            return Array.isArray(q.o) && q.o.length >= 2 &&
                typeof q.c === 'number' && q.c >= 0 && q.c < q.o.length;
        });
        return lista.length ? lista : null;
    }

    function render(arg) {
        var alvo = separar(arg);
        if (!alvo) {
            return '<header class="tela-topo"><a class="voltar" href="#/hoje">‹ hoje</a>' +
                '<h2>Exercícios</h2></header>' +
                '<p class="dica">Não reconheci esse capítulo.</p>';
        }
        var enc = encodeURIComponent(alvo.ref);
        return '<header class="tela-topo">' +
            '<a class="voltar" href="#/estudo/' + enc + '">‹ estudo</a>' +
            '<h2>Exercícios</h2>' +
            '<p class="tela-sub">' + esc(alvo.ref) + ' · o que ficou do capítulo</p>' +
            '<div class="grupo-botoes grupo-botoes--dois">' +
            '<a class="btn btn--fraco" href="#/ler/' + enc + '">Ler o texto</a>' +
            '<a class="btn btn--fraco" href="#/estudo/' + enc + '">O estudo</a>' +
            '</div>' +
            '</header>' +
            '<div id="ex-corpo"><p class="carregando">Procurando os exercícios…</p></div>';
    }

    function depois(el, arg) {
        var alvo = separar(arg);
        var caixa = ui.$('ex-corpo');
        if (!alvo || !caixa) return;
        feito = {};
        B.estudos.obter(alvo.ref, 'exercicios').then(function (guardado) {
            if (!guardado) { caixa.innerHTML = semExercicio(alvo); return; }
            var perguntas = ler(guardado.texto);
            if (!perguntas) { caixa.innerHTML = ilegivel(alvo); return; }
            pintar(caixa, alvo, perguntas, guardado);
        }, function () {
            caixa.innerHTML = '<p class="dica">Não consegui abrir os exercícios agora.</p>';
        });
    }

    function semExercicio(alvo) {
        var noApk = B.copia && B.copia.noApk && B.copia.noApk();
        return '<section class="cartao">' +
            '<p class="dica"><b>Ainda não há exercícios deste capítulo.</b></p>' +
            '<p class="dica">' + (noApk
                ? 'Eles são escritos na Oficina, na versão que roda dentro do Claude, e ' +
                'chegam aqui nos pacotes — junto com os estudos.'
                : 'Para escrever os deste capítulo agora, use a Oficina: o campo ' +
                '"Renovar um capítulo agora" aceita o formato <b>exercícios</b>. Para ' +
                'todos de uma vez, escolha <b>Só os exercícios</b> no mutirão.') + '</p>' +
            '</section>';
    }

    function ilegivel(alvo) {
        return '<section class="cartao">' +
            '<p class="aviso aviso--erro"><b>Os exercícios deste capítulo vieram ' +
            'embaralhados.</b> O que está guardado não é uma lista de perguntas que eu ' +
            'consiga ler.</p>' +
            '<p class="dica">Peça de novo na Oficina (<b>Renovar um capítulo agora</b>, ' +
            'formato exercícios): o pedido é refeito e o texto velho é substituído só ' +
            'quando o novo chega inteiro.</p></section>';
    }

    function pintar(caixa, alvo, perguntas, guardado) {
        caixa.innerHTML =
            '<p class="dica">São <b>' + perguntas.length + '</b> perguntas sobre ' +
            esc(alvo.ref) + '. Toque na resposta: ela é corrigida na hora, e a explicação ' +
            'diz em que versículo está.</p>' +
            '<div id="ex-placar" class="ex-placar" hidden></div>' +
            '<div class="exercicios">' +
            perguntas.map(function (q, i) { return cartao(q, i); }).join('') +
            '</div>' +
            '<div class="ex-pe">' +
            '<button class="btn btn--fraco btn--largo" id="ex-refazer">Refazer</button>' +
            '<p class="dica">Perguntas escritas por IA com o texto do capítulo na frente, ' +
            'e a resposta certa tem de estar nele. Mesmo assim: se a correção discordar da ' +
            'Bíblia, <b>a Bíblia está certa</b> — e vale avisar para o capítulo ser ' +
            'refeito.' + (guardado.criado ? ' Escritos ' + ui.quando(guardado.criado) + '.' : '') +
            '</p></div>';

        ligar(caixa, perguntas);
    }

    function cartao(q, i) {
        var alternativas = q.t === 'cv'
            ? [{ r: 'Certo', v: 'true' }, { r: 'Errado', v: 'false' }]
            : q.o.map(function (o, n) { return { r: o, v: String(n) }; });
        return '<section class="cartao ex-pergunta" data-q="' + i + '">' +
            '<p class="ex-pergunta-txt"><b>' + (i + 1) + '.</b> ' + esc(q.p) + '</p>' +
            '<div class="alternativas">' +
            alternativas.map(function (a) {
                return '<button class="alt-ex" data-q="' + i + '" data-v="' + a.v + '">' +
                    esc(a.r) + '</button>';
            }).join('') +
            '</div>' +
            '<div class="ex-resposta" hidden></div>' +
            '</section>';
    }

    function certa(q) { return q.t === 'cv' ? String(q.c) : String(q.c); }

    function ligar(caixa, perguntas) {
        caixa.addEventListener('click', function (ev) {
            var b = ev.target.closest ? ev.target.closest('.alt-ex') : null;
            if (b) return responder(caixa, perguntas, b);
            if (ev.target.id === 'ex-refazer') {
                feito = {};
                ui.qq('.ex-pergunta', caixa).forEach(function (sec) {
                    ui.qq('.alt-ex', sec).forEach(function (a) {
                        a.classList.remove('is-certa', 'is-errada');
                        a.disabled = false;
                    });
                    var r = ui.q('.ex-resposta', sec);
                    r.hidden = true;
                    r.innerHTML = '';
                });
                var placar = ui.$('ex-placar');
                placar.hidden = true;
                caixa.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    function responder(caixa, perguntas, botao) {
        var i = +botao.getAttribute('data-q');
        if (i in feito) return;          // responde uma vez; depois é "refazer"
        var q = perguntas[i];
        var escolhido = botao.getAttribute('data-v');
        var gabarito = certa(q);
        feito[i] = escolhido;

        var sec = botao.closest('.ex-pergunta');
        ui.qq('.alt-ex', sec).forEach(function (a) {
            a.disabled = true;
            if (a.getAttribute('data-v') === gabarito) a.classList.add('is-certa');
            else if (a === botao) a.classList.add('is-errada');
        });

        /* A resposta certa aparece sempre, acertando ou errando: o ponto do
           exercício é aprender o capítulo, não medir ninguém. */
        var acertou = escolhido === gabarito;
        var resp = ui.q('.ex-resposta', sec);
        resp.hidden = false;
        resp.innerHTML = '<p class="' + (acertou ? 'ex-ok' : 'ex-nao') + '">' +
            (acertou ? '✓ Certo.' : '✗ A resposta é: <b>' + esc(textoCerto(q)) + '</b>') +
            '</p>' +
            (q.e ? '<p class="dica">' + esc(q.e) + '</p>' : '') +
            (q.v ? '<p class="dica">Versículo ' + esc(String(q.v)) + '.</p>' : '');

        placar(perguntas);
    }

    function textoCerto(q) {
        if (q.t === 'cv') return q.c ? 'Certo' : 'Errado';
        return q.o[q.c];
    }

    function placar(perguntas) {
        var feitas = Object.keys(feito).length;
        var caixa = ui.$('ex-placar');
        if (!caixa) return;
        var acertos = 0;
        Object.keys(feito).forEach(function (i) {
            if (feito[i] === certa(perguntas[i])) acertos++;
        });
        caixa.hidden = false;
        caixa.innerHTML = '<b>' + acertos + '</b> de <b>' + feitas + '</b> respondidas' +
            (feitas === perguntas.length ? ' · acabou' : '');
    }

    return { render: render, depois: depois };
})();
