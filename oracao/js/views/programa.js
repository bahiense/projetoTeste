/* =========================================================
   Programa — os 21 dias em uma tela.

   Mostra a progressão inteira de propósito: ver que o dia 16 pede
   cinco minutos ajuda a entender por que o dia 1 pede trinta
   segundos. O que está trancado não fica escondido — fica visível
   e fora de alcance, que é diferente.
   ========================================================= */
window.A = window.A || {};
A.telas = A.telas || {};

(function () {
    'use strict';

    A.telas.programa = function (el) {
        var u = A.ui;
        var atual = A.store.diaAtual();
        var feitos = A.store.diasConcluidos();

        var html = u.cabecalho('Programa de 21 dias',
            'Pratique pequeno. Repita. Aumente a dificuldade.');

        html += '<div class="cartao"><div class="res-topo">' +
            u.anel((feitos / 21) * 100, feitos + '/21', 'neutro') +
            '<div class="res-txt"><b>' + (feitos === 0 ? 'Ainda não começou.' :
                feitos >= 21 ? 'Programa concluído.' : 'Você está no dia ' + atual + '.') + '</b>' +
            '<small>' + (A.store.get().programa.iniciado ?
                'Começou ' + u.quando(A.store.get().programa.iniciado) + '.' :
                'Trinta segundos de oração já valem o primeiro dia.') + '</small></div></div>' +
            '<a class="btn btn--forte btn--grande" href="#/dia/' + atual + '">' +
            (feitos >= 21 ? 'Refazer o dia 21' : 'Ir para o dia ' + atual) + '</a></div>';

        A.FASES.forEach(function (fase) {
            html += '<div class="fase"><h3>Fase ' + fase.n + ' · ' + u.esc(fase.nome) +
                '<small>dias ' + fase.dias + '</small></h3>' +
                '<p class="sub">' + u.esc(fase.obj) + '</p><div class="dias">';

            A.PROGRAMA.filter(function (d) { return d.fase === fase.n; }).forEach(function (d) {
                var feito = A.store.diaFeito(d.dia);
                var liberado = d.dia <= atual || feito;
                var cls = feito ? 'is-ok' : (d.dia === atual ? 'is-agora' : liberado ? '' : 'is-tranca');
                var reg = A.store.get().programa.feitos[d.dia];
                html += (liberado ? '<a href="#/dia/' + d.dia + '"' : '<span') +
                    ' class="dia-item ' + cls + '">' +
                    '<span class="dia-i">' + (feito ? '✓' : d.dia) + '</span>' +
                    '<span class="dia-c"><b>' + u.esc(d.titulo) + (d.desafio ? ' <i class="desafio">desafio</i>' : '') + '</b>' +
                    '<small>' + u.esc(d.foco) + ' · ' +
                    (d.segundos ? A.analise.segundosTexto(d.segundos) : 'duração surpresa') + '</small></span>' +
                    (reg && reg.nota ? '<span class="dia-nota" style="--cor:' + u.corNota(reg.nota) + '">' + reg.nota + '</span>' : '') +
                    (liberado ? '</a>' : '</span>');
            });
            html += '</div></div>';
        });

        html += '<div class="cartao"><h3>As cinco regras</h3><ol class="regras">' +
            '<li>Pratique todos os dias, mesmo que pouco.</li>' +
            '<li>Não escreva a oração inteira antes — o programa treina construção, não memorização.</li>' +
            '<li>Não busque perfeição: o objetivo é terminar o exercício.</li>' +
            '<li>Faça em voz alta. Pensar sobre oração não substitui orar.</li>' +
            '<li>Registre o que percebeu, em uma frase.</li>' +
            '</ol></div>';

        if (A.store.programaCompleto()) {
            html += '<a class="btn btn--forte btn--grande" href="#/avaliacao">Avaliação final</a>';
        }

        html += '<div class="linha-botoes"><button class="btn btn--perigo" id="pg-zerar">Recomeçar o programa</button></div>';

        el.innerHTML = html;

        u.$('pg-zerar').onclick = function () {
            if (!confirm('Recomeçar do dia 1? As orações já treinadas continuam guardadas.')) return;
            A.store.refazerPrograma();
            A.telas.programa(el);
            u.toast('Programa recomeçado.');
        };
    };
})();
