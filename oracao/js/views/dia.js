/* =========================================================
   O dia do programa.

   Monta o treino a partir do `modo` do exercício (tema sorteado,
   frase de partida, cenário, dois contextos seguidos, imprevisto no
   meio, ou o dia em que o app escolhe tudo e não conta antes).
   ========================================================= */
window.A = window.A || {};
A.telas = A.telas || {};

(function () {
    'use strict';

    A.telas.dia = function (el, args) {
        var u = A.ui;
        var n = Math.max(1, Math.min(21, parseInt((args && args[0]) || A.store.diaAtual(), 10)));
        var ex = A.PROGRAMA[n - 1];
        var feito = A.store.diaFeito(n);
        var fase = A.FASES[ex.fase - 1];

        var html = u.cabecalho('Dia ' + n + ' — ' + ex.titulo,
            'Fase ' + fase.n + ' · ' + fase.nome + ' · ' + ex.foco);

        if (feito) {
            var reg = A.store.get().programa.feitos[n];
            html += u.aviso('<b>Você já fez este dia</b> em ' + u.quando(reg.data) +
                (reg.nota ? ', com nota ' + reg.nota : '') + '. Refazer é bom — o material pede repetição.', 'ok');
        }

        html += '<div class="cartao"><h3>O exercício</h3>' +
            '<p>' + u.esc(ex.instrucao) + '</p>' +
            '<dl class="alvos">' +
            '<dt>Objetivo</dt><dd>' + u.esc(ex.objetivo) + '</dd>' +
            '<dt>Foco</dt><dd>' + u.esc(ex.foco) + '</dd>' +
            '</dl></div>';

        html += u.aviso('<b>Regra de hoje.</b> ' + u.esc(ex.regra), 'regra');

        html += '<button class="btn btn--forte btn--grande" id="dia-comecar">' +
            (feito ? 'Fazer de novo' : 'Começar o dia ' + n) + '</button>';

        html += '<div class="linha-botoes"><a class="btn" href="#/programa">Ver os 21 dias</a></div>';

        el.innerHTML = html;
        u.$('dia-comecar').onclick = function () { montar(el, n, ex); };
    };

    /* ---------------- montagem por modo ---------------- */

    function montar(el, n, ex, parte) {
        var u = A.ui;
        var cfg = {
            tipo: 'programa',
            dia: n,
            titulo: 'Dia ' + n + ' — ' + ex.titulo,
            contexto: 'Fase ' + ex.fase,
            instrucao: ex.instrucao,
            regra: ex.regra,
            reflexao: ex.reflexao,
            imprevisto: ex.modo === 'imprevisto'
        };

        if (ex.modo === 'tema') {
            var tema = u.sorteio(A.TEMAS);
            cfg.cena = 'Tema sorteado: ' + tema + '. Ore sobre ele — sem planejar o caminho inteiro antes.';
            cfg.titulo = 'Dia ' + n + ' — ' + tema;
        } else if (ex.modo === 'frase') {
            cfg.frase = ex.frase;
            cfg.cena = 'A oração parte desta frase. O exercício é o que vem depois dela.';
        } else if (ex.modo === 'cenario' || ex.modo === 'imprevisto') {
            var pool = A.CENARIOS.filter(function (c) {
                return !ex.filtro || c.contexto === ex.filtro;
            });
            var cen = u.sorteio(pool.length ? pool : A.CENARIOS);
            cfg.cena = cen.cena;
            cfg.contexto = cen.contexto;
            cfg.cuidado = cen.cuidado;
            cfg.revelar = { quem: cen.quem, oque: cen.oque, necessidade: cen.necessidade, primeiro: cen.primeiro };
            cfg.titulo = 'Dia ' + n + ' — ' + cen.titulo;
        } else if (ex.modo === 'duplo') {
            var qual = parte || 1;
            cfg.cena = 'Necessidade: “' + ex.necessidade + '”. Contexto ' + qual + ' de 2: ' +
                ex.contextos[qual - 1] + '.';
            cfg.titulo = 'Dia ' + n + ' — oração ' + qual + ' de 2';
        } else if (ex.modo === 'estado') {
            cfg.cena = 'Antes de começar, diga em voz baixa: “não preciso impressionar, não preciso ' +
                'parecer confiante, preciso servir este momento”. Depois ore por qualquer necessidade ' +
                'que estiver no seu coração agora.';
        } else if (ex.modo === 'surpresa') {
            /* o Dia 20 tira as variáveis da mão do aluno: outra pessoa escolhe
               tudo. Aqui quem escolhe é o app, e só conta na hora. */
            var cenS = u.sorteio(A.CENARIOS);
            cfg.cena = cenS.cena;
            cfg.contexto = cenS.contexto;
            cfg.cuidado = cenS.cuidado;
            cfg.titulo = 'Dia ' + n + ' — ' + cenS.titulo;
            cfg.instrucao = 'Escolhido pelo app: ' + cenS.contexto.toLowerCase() +
                ', ' + cenS.necessidade.toLowerCase() + ' Você não sabia. Comece.';
            cfg.revelar = { quem: cenS.quem, oque: cenS.oque, necessidade: cenS.necessidade, primeiro: cenS.primeiro };
        }

        cfg.aoTerminar = function (registro) {
            /* o dia 12 são duas orações: a primeira não conclui o dia */
            if (ex.modo === 'duplo' && (parte || 1) === 1) {
                montarSegunda(el, n, ex, registro);
                return;
            }
            A.store.concluirDia(n, { nota: registro.nota, reflexao: registro.reflexao });
            telaFim(el, n, ex, registro);
        };

        A.treino.iniciar(el, cfg);
    }

    function montarSegunda(el, n, ex, primeiro) {
        var u = A.ui;
        el.innerHTML = '<div class="treino"><div class="treino-topo">' +
            '<span class="etiqueta">Dia ' + n + '</span><h2>Primeira oração feita</h2>' +
            '<p class="cena">Nota ' + primeiro.nota + '. Agora a mesma necessidade, outro contexto: ' +
            u.esc(ex.contextos[1]) + '.</p></div>' +
            '<button class="btn btn--forte btn--grande" id="dia-seg">Fazer a segunda oração</button></div>';
        u.$('dia-seg').onclick = function () { montar(el, n, ex, 2); };
    }

    /* ---------------- fim do dia ---------------- */

    function telaFim(el, n, ex, registro) {
        var u = A.ui;
        var fase = A.FASES[ex.fase - 1];
        var fimDeFase = (n === 7 || n === 14 || n === 21);

        var html = '<div class="treino fim-dia">' +
            '<div class="selo">✓</div>' +
            '<h2>Dia ' + n + ' concluído</h2>' +
            '<p class="cena">' + u.esc(ex.objetivo) + '</p>';

        if (registro.reflexao) {
            html += '<div class="cartao"><h3>Você anotou</h3><p class="citacao">' +
                u.esc(registro.reflexao) + '</p></div>';
        }

        if (fimDeFase && n < 21) {
            var prox = A.FASES[ex.fase];
            html += '<div class="cartao cartao--bom"><h3>Fase ' + fase.n + ' concluída: ' + u.esc(fase.nome) + '</h3>' +
                '<p>' + (n === 7 ? 'Você já sabe começar.' : 'Você já sabe construir.') + ' ' +
                'A partir de amanhã: <b>' + u.esc(prox.nome) + '</b> — ' + u.esc(prox.obj) + '</p></div>';
        }

        if (n === 21) {
            html += '<div class="cartao cartao--bom"><h3>21 dias concluídos</h3>' +
                '<p>O programa termina. A prática, não. Cada oração real a partir de hoje é uma ' +
                'nova oportunidade de treinar.</p>' +
                '<a class="btn btn--forte btn--grande" href="#/avaliacao">Fazer a avaliação final</a></div>';
        } else {
            html += '<div class="cartao"><h3>Amanhã</h3><p><b>Dia ' + (n + 1) + ' — ' +
                u.esc(A.PROGRAMA[n].titulo) + '</b><br><small>' + u.esc(A.PROGRAMA[n].objetivo) + '</small></p></div>';
        }

        html += '<div class="linha-botoes">' +
            '<a class="btn btn--forte" href="#/hoje">Voltar ao início</a>' +
            '<a class="btn" href="#/progresso">Ver progresso</a>' +
            '</div></div>';

        el.innerHTML = html;
    }
})();
