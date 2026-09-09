/* =========================================================
   Hoje — a tela que abre o app.

   Uma pergunta só: o que fazer agora? Por isso o exercício do dia
   vem primeiro, grande, e o resto desce. O cartão de partida fica
   ao alcance porque o momento real de usar este app costuma ser
   dentro da igreja, com o microfone chegando.
   ========================================================= */
window.A = window.A || {};
A.telas = A.telas || {};

A.telas.hoje = function (el) {
    var u = A.ui, s = A.store.get();
    var dia = A.store.diaAtual();
    var ex = A.PROGRAMA[dia - 1];
    var feitoHoje = A.store.oracoesHoje().length;
    var completo = A.store.programaCompleto();

    var html = '';

    /* saudação curta, sem enfeite */
    var h = new Date().getHours();
    var ola = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    html += '<header class="tela-head">' +
        '<h2>' + ola + (s.nome ? ', ' + u.esc(s.nome) : '') + '</h2>' +
        '<p>' + (feitoHoje ? 'Você já orou ' + feitoHoje + '× hoje.' :
            'Nenhuma oração em voz alta hoje ainda.') + '</p></header>';

    /* o exercício do dia */
    if (!completo) {
        var fase = A.FASES[ex.fase - 1];
        html += '<a class="cartao cartao--dia" href="#/dia/' + dia + '">' +
            '<div class="dia-num"><small>dia</small><b>' + dia + '</b><small>de 21</small></div>' +
            '<div class="dia-txt">' +
            '<span class="etiqueta">Fase ' + fase.n + ' · ' + u.esc(fase.nome) + '</span>' +
            '<b>' + u.esc(ex.titulo) + '</b>' +
            '<small>' + u.esc(ex.objetivo) + '</small>' +
            '<span class="dia-meta">' + u.esc(ex.foco) + '</span>' +
            '</div><span class="seta">›</span></a>';
    } else {
        html += '<div class="cartao cartao--dia">' +
            '<div class="dia-txt"><span class="etiqueta">21 dias concluídos</span>' +
            '<b>Agora é a vida real</b>' +
            '<small>O programa terminou. O que continua é a prática: cada vez que ' +
            'te chamarem, é treino de verdade.</small></div></div>';
    }

    html += '<div class="grade-cards">' +
        '<a class="card" href="#/treinar"><span class="card-i">🎙</span><b>Treinar agora</b>' +
        '<small>Um cenário sorteado e a sua voz. Sem relógio.</small></a>' +
        '<a class="card" href="#/momento"><span class="card-i">🧭</span><b>Vou orar agora</b>' +
        '<small>O cartão de partida e a bússola, para usar de verdade.</small></a>' +
        '<a class="card" href="#/curso"><span class="card-i">📖</span><b>O método</b>' +
        '<small>Os dez módulos, do medo ao improviso.</small></a>' +
        '<a class="card" href="#/biblioteca"><span class="card-i">🗂</span><b>Biblioteca</b>' +
        '<small>100 palavras, 50 versículos e orações modelo.</small></a>' +
        '</div>';

    /* prontidão — só depois de existir algum dado */
    if (s.oracoes.length) {
        var p = A.store.prontidao();
        html += '<div class="cartao"><h3>Prontidão ' + u.ajuda('Prontidão',
            '<p>Uma nota só, de 0 a 100, para a pergunta "se me chamarem hoje, eu dou conta?".</p>' +
            '<p>Ela junta quatro coisas: a média das suas últimas dez orações (metade da nota), ' +
            'quanto do programa de 21 dias você já fez, a sua constância e o volume de prática.</p>' +
            '<p>Não é medida espiritual. É medida de treino — e treino some quando para.</p>') + '</h3>' +
            '<div class="res-topo">' + u.anel(p, '', 'neutro') +
            '<div class="res-txt"><b>' + (p >= 75 ? 'Você está pronto para ser chamado.' :
                p >= 50 ? 'Já dá. Ainda vale praticar antes do próximo culto.' :
                    'Falta rodagem. Uma oração em voz alta por dia muda isso rápido.') + '</b>' +
            '<small>🔥 ' + s.streak.atual + ' dia' + (s.streak.atual === 1 ? '' : 's') + ' seguidos · ' +
            A.store.diasConcluidos() + '/21 do programa · ' + s.oracoes.length + ' orações treinadas</small>' +
            '</div></div></div>';
    }

    /* últimas orações */
    var ult = A.store.oracoes(3);
    if (ult.length) {
        html += '<div class="cartao"><h3>Últimas orações</h3><div class="historico">' +
            ult.map(function (o) {
                return '<a class="hist" href="#/progresso">' +
                    '<span class="hist-nota" style="--cor:' + u.corNota(o.nota) + '">' + o.nota + '</span>' +
                    '<span class="hist-txt"><b>' + u.esc(o.titulo || 'Treino livre') + '</b>' +
                    '<small>' + u.quando(o.data) + ' · ' + o.palavras + ' palavras</small></span></a>';
            }).join('') + '</div></div>';
    }

    /* uma verdade por dia, do Módulo 9 */
    var idx = new Date().getDate() % A.VERDADES.length;
    html += '<div class="cartao cartao--verdade"><small>lembre-se</small><p>' +
        u.esc(A.VERDADES[idx]) + '</p></div>';

    el.innerHTML = html;
};
