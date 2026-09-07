/* =========================================================
   TELA DRILLS — estímulo, relógio, resposta.

   Não é para acertar pensando: é para acertar sem pensar.
   Enquanto a estrutura exigir raciocínio, ela não existe na
   sua fala espontânea.
   ========================================================= */
window.F = window.F || {};
F.telas = F.telas || {};

F.telas.drills = (function () {
    'use strict';
    var ui = F.ui, esc = F.ui.esc;
    var drill = null, ordem = [], pos = 0, notas = [], tempo = 5, timer = null, rodando = false;

    function render(args) {
        var id = args[0] || F.curso.semanaAtual().drill;
        drill = F.curso.drill(id) || F.data.drills[0];
        ordem = ui.embaralhar(drill.itens);
        pos = 0; notas = [];

        var pills = F.data.drills.map(function (d) {
            return '<a class="pilula' + (d.id === drill.id ? ' is-on' : '') + '" href="#/drills/' + d.id + '">' + esc(d.nome) + '</a>';
        }).join('');

        return ui.cabecalho('Drills de automatização', 'Estímulo, poucos segundos, resposta em voz alta.') +
            '<div class="pilulas">' + pills + '</div>' +
            '<div class="cartao">' +
            '<h3>' + esc(drill.nome) + '</h3>' +
            '<p class="porque">' + esc(drill.foco) + '</p>' +
            '<p class="sub"><b>Como fazer:</b> ' + esc(drill.instrucao) + '</p>' +
            '<p class="modelo">Modelo: <i>' + esc(drill.modelo) + '</i></p>' +
            '<label class="campo campo--slider"><span>Tempo para responder: <b id="dr-tv">' + tempo + 's</b></span>' +
            '<input type="range" id="dr-tempo" min="2" max="10" step="1" value="' + tempo + '"></label>' +
            '<div id="dr-area"></div>' +
            '</div>';
    }

    function pintar() {
        var area = ui.$('dr-area');
        if (!area) return;
        if (pos >= ordem.length) return fim(area);

        var it = ordem[pos];
        area.innerHTML =
            '<div class="dr-topo"><span>' + (pos + 1) + ' de ' + ordem.length + '</span>' +
            '<span class="dt-placar">acertos: ' + notas.filter(Boolean).length + '</span></div>' +
            '<div class="dr-estimulo" id="dr-est">' + esc(it[0]) + '</div>' +
            '<div class="dr-relogio"><i id="dr-barra"></i></div>' +
            '<div class="linha-botoes">' +
            '<button class="btn btn--forte" id="dr-ir">▶ Ouvir e responder</button>' +
            '<button class="btn" id="dr-ver">Ver a resposta</button>' +
            '</div>' +
            '<div id="dr-res"></div>';

        ui.$('dr-ir').addEventListener('click', rodar);
        ui.$('dr-ver').addEventListener('click', function () { revelar(null); });
    }

    function rodar() {
        if (rodando) return;
        rodando = true;
        var it = ordem[pos];
        var barra = ui.$('dr-barra');
        ui.$('dr-res').innerHTML = '';

        F.voz.falar(it[0], { rate: 0.95 }).then(function () {
            if (!document.body.contains(barra)) return;
            barra.style.transition = 'none';
            barra.style.width = '100%';
            setTimeout(function () {
                barra.style.transition = 'width ' + tempo + 's linear';
                barra.style.width = '0%';
            }, 20);

            if (F.voz.temEscuta()) {
                F.voz.ouvir({ limite: tempo * 1000 }).then(function (r) {
                    revelar(r.vazio ? '' : r.texto);
                }).catch(function () { revelar(null); });
            } else {
                timer = setTimeout(function () { revelar(null); }, tempo * 1000);
            }
        });
    }

    function revelar(ouvido) {
        rodando = false;
        clearTimeout(timer);
        F.voz.pararEscuta();
        var caixa = ui.$('dr-res');
        if (!caixa) return;
        var it = ordem[pos];
        var certa = it[1];
        var html = '<div class="dr-resposta"><b>Resposta:</b> ' + esc(certa) + ' ' +
            ui.botaoOuvir(certa, 'ouvir') + '</div>';

        if (ouvido !== null && ouvido !== undefined) {
            var r = F.texto.pontuar(certa, ouvido);
            notas.push(r.pct >= 70);
            F.store.registrar('drill', r.pct);
            html += '<div class="res-topo">' + ui.anel(r.pct) +
                '<div class="res-txt"><b>' + esc(r.pct >= 70 ? 'Saiu.' : 'Ainda não saiu automático.') + '</b>' +
                '<small>Ouvi: “' + esc(ouvido || '(nada)') + '”</small></div></div>' + ui.diff(r);
        } else {
            html += '<p class="carta-pergunta">Você respondeu antes de ouvir?</p>' +
                '<div class="notas">' +
                '<button class="btn btn--nota bad" data-ok="0">Não</button>' +
                '<button class="btn btn--nota good" data-ok="1">Sim, na hora</button></div>';
        }
        html += '<button class="btn btn--forte" id="dr-prox">Próximo →</button>';
        caixa.innerHTML = html;

        F.voz.falar(certa, { rate: 0.95 });

        ui.qq('#dr-res [data-ok]').forEach(function (b) {
            b.addEventListener('click', function () {
                var ok = b.getAttribute('data-ok') === '1';
                notas.push(ok);
                F.store.registrar('drill', ok ? 100 : 0);
                pos++; pintar();
            });
        });
        ui.$('dr-prox').addEventListener('click', function () { pos++; pintar(); });
    }

    function fim(area) {
        if (!area) return;
        var pct = notas.length ? Math.round((notas.filter(Boolean).length / notas.length) * 100) : 0;
        F.store.concluirBloco('drill');
        area.innerHTML = '<div class="teste-fim">' + ui.anel(pct, 'automático') +
            '<p>' + esc(pct >= 90 ? 'Automatizado. Pode trocar de drill.'
                : pct >= 60 ? 'Está virando reflexo. Mais duas rodadas hoje e amanhã.'
                    : 'Ainda está sendo raciocinado. Diminua o tempo de resposta só quando acertar 8 de 10.') + '</p>' +
            '<div class="linha-botoes">' +
            '<button class="btn btn--forte" id="dr-de-novo">Rodar de novo, embaralhado</button>' +
            '<a class="btn" href="#/exercicios">Outro exercício</a></div></div>';
        ui.$('dr-de-novo').addEventListener('click', function () {
            ordem = ui.embaralhar(drill.itens); pos = 0; notas = []; pintar();
        });
    }

    function montar() {
        ui.$('dr-tempo').addEventListener('input', function () {
            tempo = parseInt(this.value, 10);
            ui.$('dr-tv').textContent = tempo + 's';
        });
        pintar();
    }

    function desmontar() { clearTimeout(timer); rodando = false; }

    return { render: render, montar: montar, desmontar: desmontar };
})();
