/* =========================================================
   TELA CONVERSA — role-play com o app fazendo o outro.

   Você não "pratica inglês": você resolve uma situação em
   inglês. Ter um objetivo muda a fala inteira.
   ========================================================= */
window.F = window.F || {};
F.telas = F.telas || {};

F.telas.conversa = (function () {
    'use strict';
    var ui = F.ui, esc = F.ui.esc;
    var dl = null, turno = 0, minhas = [], usados = {}, notas = [];

    function render(args) {
        var id = args[0] || F.curso.semanaAtual().dialogo;
        dl = F.curso.dialogo(id) || F.data.dialogos[0];
        turno = 0; minhas = []; usados = {}; notas = [];

        var pills = F.data.dialogos.map(function (d) {
            return '<a class="pilula' + (d.id === dl.id ? ' is-on' : '') + '" href="#/conversa/' + d.id + '">' +
                '<i class="nivel n' + d.nivel + '"></i>' + esc(d.titulo) + '</a>';
        }).join('');

        return ui.cabecalho('Role-play', 'O app faz o outro personagem. Você responde falando — nunca escrevendo.') +
            '<div class="pilulas">' + pills + '</div>' +

            '<div class="cartao cartao--cena">' +
            '<h3>' + esc(dl.titulo) + '</h3>' +
            '<p class="cena">' + esc(dl.contexto) + '</p>' +
            '<dl class="alvos">' +
            '<dt>Você é</dt><dd>' + esc(dl.seuPapel) + '</dd>' +
            '<dt>O app é</dt><dd>' + esc(dl.papelBot) + '</dd>' +
            '<dt>Objetivo</dt><dd>' + esc(dl.objetivo) + '</dd>' +
            '</dl>' +
            '<p class="sub">Blocos obrigatórios — use os três em algum momento:</p>' +
            '<div class="chips" id="cv-chips">' + dl.obrigatorios.map(function (o, i) {
                return '<span class="chip" data-ob="' + i + '">' + esc(o) + '</span>';
            }).join('') + '</div>' +
            '</div>' +

            '<div class="cartao">' +
            '<div id="cv-area"></div>' +
            '</div>';
    }

    function pintar() {
        var area = ui.$('cv-area');
        if (!area) return;
        if (turno >= dl.turnos.length) return fim(area);
        var t = dl.turnos[turno];

        area.innerHTML =
            '<div class="cv-topo">Turno ' + (turno + 1) + ' de ' + dl.turnos.length + '</div>' +
            '<div class="fala fala--bot">' +
            '<b>' + esc(dl.papelBot) + '</b>' +
            '<p>' + esc(t.bot) + '</p>' +
            '<div class="linha-botoes">' +
            ui.botaoOuvir(t.bot, 'Ouvir') +
            '<button class="btn btn--som" data-falar="' + esc(t.bot) + '" data-rate="0.7">🐢 Devagar</button>' +
            '<button class="btn" id="cv-pt">Ver em português</button>' +
            '</div>' +
            '<p class="fala-pt" id="cv-pt-txt" hidden>' + esc(t.pt) + '</p>' +
            '</div>' +

            '<div class="fala fala--voce">' +
            '<b>Você</b>' +
            '<p class="dica-turno">💡 ' + esc(t.dica) + '</p>' +
            F.pratica.caixa('cv-pratica', 'Responder falando') +
            '<div class="linha-botoes">' +
            '<button class="btn" id="cv-modelo">Ver uma resposta possível</button>' +
            '<button class="btn btn--forte" id="cv-prox">Continuar →</button>' +
            '</div>' +
            '<div id="cv-modelo-txt"></div>' +
            '</div>';

        F.voz.falar(t.bot);

        ui.$('cv-pt').addEventListener('click', function () {
            var e = ui.$('cv-pt-txt');
            e.hidden = !e.hidden;
            this.textContent = e.hidden ? 'Ver em português' : 'Esconder português';
        });

        ui.$('cv-modelo').addEventListener('click', function () {
            ui.$('cv-modelo-txt').innerHTML =
                '<div class="modelo-caixa"><b>Uma resposta possível</b>' +
                '<p>' + esc(t.modelo) + '</p>' + ui.botaoOuvir(t.modelo, 'ouvir') +
                '<p class="legenda">Não é a resposta certa — é uma referência de nível. A sua pode ser melhor.</p></div>';
        });

        ui.$('cv-prox').addEventListener('click', function () { turno++; pintar(); });

        /* A caixa de prática aqui compara com o modelo só para dar
           referência; o que vale mesmo é ter falado e usado os blocos. */
        F.pratica.ligar('cv-pratica', {
            alvo: function () { return dl.turnos[turno].modelo; },
            limite: 25000,
            aoResultado: function (pct, r) {
                var meu = r.hip.join(' ');
                minhas.push(meu);
                notas.push(pct);
                marcarObrigatorios(meu);
            }
        });
    }

    function marcarObrigatorios(texto) {
        var n = F.texto.normalizar(texto);
        dl.obrigatorios.forEach(function (o, i) {
            if (usados[i]) return;
            var alvo = F.texto.normalizar(o);
            // aceita a expressão inteira ou quase toda (o reconhecimento erra palavras pequenas)
            var partes = alvo.split(' ');
            var achou = n.indexOf(alvo) >= 0;
            if (!achou && partes.length > 2) {
                var presentes = partes.filter(function (p) { return n.indexOf(p) >= 0; }).length;
                achou = presentes / partes.length >= 0.8;
            }
            if (achou) {
                usados[i] = true;
                var chip = ui.q('#cv-chips [data-ob="' + i + '"]');
                if (chip) chip.classList.add('is-ok');
                ui.toast('Bloco usado: ' + o);
            }
        });
    }

    function fim(area) {
        if (!area) return;
        var usadosN = Object.keys(usados).length;
        var media = notas.length ? Math.round(notas.reduce(function (a, b) { return a + b; }, 0) / notas.length) : 0;
        var palavras = minhas.join(' ').split(/\s+/).filter(Boolean).length;
        F.store.registrar('fala', Math.min(100, media * 0.5 + (usadosN / dl.obrigatorios.length) * 50));
        F.store.concluirBloco('conversa');

        area.innerHTML = '<div class="teste-fim">' +
            '<h3>Cena encerrada</h3>' +
            '<div class="streak-linha">' +
            '<div class="streak-num">' + palavras + '<small>palavras suas</small></div>' +
            '<div class="streak-num">' + usadosN + '/' + dl.obrigatorios.length + '<small>blocos obrigatórios</small></div>' +
            '<div class="streak-num">' + media + '%<small>proximidade do modelo</small></div>' +
            '</div>' +
            '<p class="sub">Proximidade do modelo é referência, não nota: uma resposta diferente pode ser melhor. ' +
            'O que conta é ter falado sem travar e ter usado os blocos.</p>' +
            '<div class="cartao cartao--missao"><h3>Desafio</h3><p class="missao">' + esc(dl.desafio) + '</p></div>' +
            (minhas.length ? '<details class="transcricao"><summary>Ver o que você falou</summary><ul>' +
                minhas.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul></details>' : '') +
            '<div class="linha-botoes">' +
            '<button class="btn btn--forte" id="cv-refazer">Refazer a cena</button>' +
            '<a class="btn" href="#/arena">Ir para a arena</a>' +
            '</div></div>';

        ui.$('cv-refazer').addEventListener('click', function () {
            turno = 0; minhas = []; notas = []; usados = {};
            ui.qq('#cv-chips .chip').forEach(function (c) { c.classList.remove('is-ok'); });
            pintar();
        });
    }

    function montar() { pintar(); }

    return { render: render, montar: montar };
})();
