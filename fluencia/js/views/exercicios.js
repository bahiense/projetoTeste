/* =========================================================
   TELA EXERCÍCIOS — todos os treinos, fora do ciclo do dia.
   ========================================================= */
window.F = window.F || {};
F.telas = F.telas || {};

F.telas.exercicios = (function () {
    'use strict';
    var esc = F.ui.esc;

    var ITENS = [
        { r: '#/pronuncia', i: '👄', t: 'Pronúncia', d: 'Os 16 sons que o brasileiro erra, com pares mínimos e correção por voz.' },
        { r: '#/shadowing', i: '🎧', t: 'Shadowing', d: '15 passagens graduadas, com ritmo marcado e a versão "como soa".' },
        { r: '#/escuta', i: '📝', t: 'Escuta e ditado', d: 'Fala conectada em velocidade real. Escreva o que ouviu.' },
        { r: '#/chunks', i: '🧱', t: 'Blocos de fala', d: '263 blocos por função, com repetição espaçada.' },
        { r: '#/drills', i: '⚡', t: 'Drills', d: 'Estímulo e resposta cronometrados até a estrutura virar reflexo.' },
        { r: '#/conversa', i: '💬', t: 'Role-play', d: '12 situações reais. O app faz o outro, você responde falando.' },
        { r: '#/arena', i: '🔥', t: 'Arena', d: 'Falar sem parar sob cronômetro: monólogo, entrevista, debate, ensinar.' },
        { r: '#/erros', i: '🚩', t: 'Erros de brasileiro', d: '62 armadilhas de tradução literal, falso amigo e falta de educação.' },
        { r: '#/coragem', i: '🪜', t: 'Escada da coragem', d: '20 degraus do espelho até ensinar uma aula inteira.' },
        { r: '#/diario', i: '📔', t: 'Diário de estudo', d: 'O que travou hoje, o alvo de amanhã.' },
        { r: '#/plano', i: '🗺️', t: 'Plano de 24 semanas', d: 'O programa inteiro, semana a semana.' },
        { r: '#/progresso', i: '📈', t: 'Progresso', d: 'Suas notas, sua constância e a nota de fluência.' }
    ];

    function render() {
        return F.ui.cabecalho('Exercícios', 'Treine qualquer coisa fora da ordem do dia.') +
            '<div class="grade-cards">' +
            ITENS.map(function (x) {
                return '<a class="card" href="' + x.r + '">' +
                    '<span class="card-i">' + x.i + '</span>' +
                    '<b>' + esc(x.t) + '</b><small>' + esc(x.d) + '</small></a>';
            }).join('') +
            '</div>';
    }

    return { render: render };
})();
