/* =========================================================
   Treinar — o treino livre, fora do programa.

   O aluno escolhe o quanto quer escolher: pode sortear tudo (que é
   o que mais parece a vida real) ou filtrar por contexto quando
   quer ensaiar um caso específico — o velório, o hospital, a
   reunião com gente de outra fé.
   ========================================================= */
window.A = window.A || {};
A.telas = A.telas || {};

/* Cada tela vive dentro da sua própria função: os auxiliares daqui
   (sorteio de cenário, selo de pressão) não precisam existir para o
   resto do app, e nome global repetido entre telas é bug esperando. */
(function () {
    'use strict';

A.telas.treinar = function (el, args) {
    var u = A.ui;

    /* #/treinar/culto-abertura entra direto no cenário */
    if (args && args[0]) {
        var achado = null;
        A.CENARIOS.forEach(function (c) { if (c.id === args[0]) achado = c; });
        if (achado) { rodar(el, achado); return; }
    }

    var filtro = A.telas.treinar.filtro || 'todos';
    var lista = A.CENARIOS.filter(function (c) {
        return filtro === 'todos' || c.contexto === filtro;
    });

    var html = u.cabecalho('Treinar', 'Escolha um cenário — ou deixe o app escolher, que é o mais parecido com a vida.');

    html += '<button class="btn btn--forte btn--grande" id="tr-sorteio">🎲 Sortear um cenário e começar</button>';

    html += '<div class="pilulas">' +
        ['todos'].concat(A.CONTEXTOS).map(function (c) {
            return '<button class="pilula' + (c === filtro ? ' is-on' : '') + '" data-filtro="' + u.esc(c) + '">' +
                (c === 'todos' ? 'Todos' : u.esc(c)) + '</button>';
        }).join('') + '</div>';

    html += '<div class="cenarios">' + lista.map(function (c) {
        return '<button class="cenario" data-cenario="' + c.id + '">' +
            '<span class="cenario-top"><span class="etiqueta">' + u.esc(c.contexto) + '</span>' +
            pressao(c.pressao) + '</span>' +
            '<b>' + u.esc(c.titulo) + '</b>' +
            '<small>' + u.esc(c.cena) + '</small>' +
            (c.cuidado ? '<span class="cenario-meta">pede discrição</span>' : '') +
            '</button>';
    }).join('') + '</div>';

    el.innerHTML = html;

    u.$('tr-sorteio').onclick = function () {
        rodar(el, u.sorteio(lista.length ? lista : A.CENARIOS));
    };

    u.qq('[data-filtro]', el).forEach(function (b) {
        b.onclick = function () {
            A.telas.treinar.filtro = b.getAttribute('data-filtro');
            A.telas.treinar(el);
        };
    });

    u.qq('[data-cenario]', el).forEach(function (b) {
        b.onclick = function () {
            var id = b.getAttribute('data-cenario');
            var c = null;
            A.CENARIOS.forEach(function (x) { if (x.id === id) c = x; });
            if (c) rodar(el, c);
        };
    });
};

function pressao(n) {
    var rotulo = n === 3 ? 'pressão alta' : n === 2 ? 'pressão média' : 'tranquilo';
    return '<span class="pressao pressao--' + n + '" title="' + rotulo + '">' +
        '●'.repeat(n) + '<i>' + rotulo + '</i></span>';
}

function rodar(el, cenario) {
    A.treino.iniciar(el, {
        tipo: 'livre',
        titulo: cenario.titulo,
        contexto: cenario.contexto,
        cena: cenario.cena,
        cuidado: cenario.cuidado,
        reflexao: 'O que você percebeu?',
        revelar: {
            quem: cenario.quem, oque: cenario.oque,
            necessidade: cenario.necessidade, primeiro: cenario.primeiro
        },
        aoTerminar: function () {
            location.hash = '#/progresso';
            A.ui.toast('Oração guardada.');
        }
    });
}

})();
