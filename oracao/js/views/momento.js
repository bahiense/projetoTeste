/* =========================================================
   "Vou orar agora" — o modo para a vida real.

   Esta é a tela que a pessoa abre dentro da igreja, com o microfone
   chegando. Por isso ela é diferente de todo o resto do app: sem
   análise, sem nota, sem microfone, sem nada para ler enquanto ora.
   Só o cartão de dez segundos, e depois uma bússola de uma linha —
   letra grande, para ser olhada de relance e não lida.

   Depois, e só depois, o app pergunta como foi. O registro do que
   aconteceu de verdade vale mais que qualquer treino.
   ========================================================= */
window.A = window.A || {};
A.telas = A.telas || {};

(function () {
    'use strict';

    var passo = 0;
    var comecou = 0;

    A.telas.momento = function (el) {
        passo = 0;
        leitura(el);
    };

    /* ---------------- 1. os dez segundos ---------------- */

    function leitura(el) {
        var u = A.ui;
        var html = '<div class="momento">' +
            u.cabecalho('Vou orar agora', 'Dez segundos. Depois é só começar.');

        html += '<div class="cartao"><h3>Quem está aqui?</h3>' +
            '<input class="entrada entrada--grande" id="mo-quem" placeholder="a igreja · esta família · o casal · uma pessoa"></div>';

        html += '<div class="cartao"><h3>Por que estamos orando?</h3>' +
            '<div class="chips chips--clique">' +
            A.ALTAR[0].opcoes.map(function (o) {
                return '<button class="chip" data-prop="' + u.esc(o) + '">' + u.esc(o) + '</button>';
            }).join('') + '</div>' +
            '<input class="entrada entrada--grande" id="mo-prop" placeholder="ou escreva o propósito"></div>';

        html += '<div class="cartao"><h3>O que este momento precisa?</h3>' +
            '<input class="entrada entrada--grande" id="mo-nec" placeholder="sabedoria · consolo · direção · gratidão"></div>';

        html += '<div class="cartao cartao--destaque"><p>Primeiro movimento: uma frase simples e honesta. ' +
            'Você não precisa ver a oração inteira.</p></div>';

        html += '<button class="btn btn--forte btn--grande" id="mo-ir">Estou pronto</button>' +
            '<div class="linha-botoes"><button class="btn" id="mo-pular">Pular direto para a bússola</button></div>' +
            '</div>';

        el.innerHTML = html;

        u.qq('[data-prop]', el).forEach(function (b) {
            b.onclick = function () {
                u.$('mo-prop').value = b.getAttribute('data-prop');
                u.qq('[data-prop]', el).forEach(function (x) { x.classList.remove('is-on'); });
                b.classList.add('is-on');
            };
        });

        function ir() {
            bussola(el, {
                quem: u.$('mo-quem').value.trim(),
                proposito: u.$('mo-prop').value.trim(),
                necessidade: u.$('mo-nec').value.trim()
            });
        }
        u.$('mo-ir').onclick = ir;
        u.$('mo-pular').onclick = function () { bussola(el, {}); };
    }

    /* ---------------- 2. a bússola discreta ---------------- */

    var MOVIMENTOS = [
        { p: 'Comece pelo momento', d: 'o que está acontecendo aqui' },
        { p: 'Quem', d: 'nomeie as pessoas' },
        { p: 'O que vivem', d: 'a situação real' },
        { p: 'Do que precisam', d: 'a necessidade, com clareza' },
        { p: 'Quem Deus é', d: 'uma verdade diante disso' },
        { p: 'Inclua os que ouvem', d: 'quem mais vive isso aqui' },
        { p: 'Mais fundo', d: 'o que está por trás do pedido' },
        { p: 'Entregue', d: 'o que não se resolve aqui' },
        { p: 'Encerre confiando', d: 'em que estamos confiando' }
    ];

    function bussola(el, leituraFeita) {
        var u = A.ui;
        passo = 0;
        comecou = Date.now();

        var html = '<div class="momento discreto">' +
            (leituraFeita.proposito || leituraFeita.quem || leituraFeita.necessidade ?
                '<div class="lembrete-leitura">' +
                [leituraFeita.quem, leituraFeita.proposito, leituraFeita.necessidade]
                    .filter(Boolean).map(u.esc).join(' · ') + '</div>' : '') +
            '<div class="passo-grande" id="mo-passo">' +
            '<b>Respire. Comece.</b><span>uma frase simples e honesta</span></div>' +
            '<button class="btn btn--eagora btn--enorme" id="mo-eagora">E agora?</button>' +
            '<div class="linha-botoes">' +
            '<button class="btn btn--perigo" id="mo-travei">Travei</button>' +
            '<button class="btn" id="mo-fim">Terminei</button>' +
            '</div>' +
            '<p class="legenda">Olhe de relance. Ler durante a oração tira você do momento — ' +
            'e é o momento que a congregação acompanha.</p>' +
            '</div>';

        el.innerHTML = html;

        u.$('mo-eagora').onclick = function () {
            var m = MOVIMENTOS[Math.min(passo, MOVIMENTOS.length - 1)];
            passo++;
            u.$('mo-passo').innerHTML = '<b>' + u.esc(m.p) + '</b><span>' + u.esc(m.d) + '</span>';
            try { if (navigator.vibrate) navigator.vibrate(30); } catch (e) { }
        };

        u.$('mo-travei').onclick = function () {
            var html2 = '<ol class="protocolo">' +
                A.TRAVOU.passos.map(function (p) {
                    return '<li><b>' + u.esc(p.t) + '</b> ' + u.esc(p.d) + '</li>';
                }).join('') + '</ol>' +
                '<p class="retomada"><small>Diga isto e continue:</small><b>' +
                u.esc(u.sorteio(A.TRAVOU.retomadas)) + '</b></p>';
            u.abrirModal('Respire. Continue.', html2);
        };

        u.$('mo-fim').onclick = function () { registro(el, leituraFeita); };
    }

    /* ---------------- 3. como foi ---------------- */

    function registro(el, leituraFeita) {
        var u = A.ui;
        var seg = Math.round((Date.now() - comecou) / 1000);

        var html = '<div class="momento">' +
            u.cabecalho('Você orou', 'Isso conta mais do que qualquer treino. Anote enquanto está fresco.');

        html += '<div class="cartao"><h3>Como foi?</h3><div class="notas">' +
            [
                { v: 1, r: 'Travei', d: 'não consegui continuar' },
                { v: 2, r: 'Difícil', d: 'saiu, mas com esforço' },
                { v: 3, r: 'Deu certo', d: 'consegui conduzir' },
                { v: 4, r: 'Fluiu', d: 'não precisei procurar' }
            ].map(function (n) {
                return '<button class="btn btn--nota" data-nota="' + n.v + '">' + n.r +
                    '<small>' + n.d + '</small></button>';
            }).join('') + '</div></div>';

        html += '<div class="cartao"><h3>O que você percebeu?</h3>' +
            '<textarea class="entrada" id="mo-obs" rows="3" ' +
            'placeholder="Onde travou? O que fluiu? O que faria diferente?"></textarea></div>';

        html += '<p class="legenda">Duração aproximada: ' + u.tempo(seg) + '.</p>';

        html += '<button class="btn btn--forte btn--grande" id="mo-salvar">Guardar</button></div>';

        el.innerHTML = html;

        var nota = 0;
        u.qq('[data-nota]', el).forEach(function (b) {
            b.onclick = function () {
                nota = parseInt(b.getAttribute('data-nota'), 10);
                u.qq('[data-nota]', el).forEach(function (x) { x.classList.remove('is-on'); });
                b.classList.add('is-on');
            };
        });

        u.$('mo-salvar').onclick = function () {
            A.store.registrarReal({
                como: nota,
                obs: u.$('mo-obs').value.trim(),
                segundos: seg,
                quem: leituraFeita.quem || '',
                proposito: leituraFeita.proposito || '',
                passos: passo
            });
            u.toast('Guardado. Isso foi oração de verdade.');
            location.hash = '#/progresso';
        };
    }
})();
