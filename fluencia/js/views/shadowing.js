/* =========================================================
   TELA SHADOWING — falar por cima do modelo.
   ========================================================= */
window.F = window.F || {};
F.telas = F.telas || {};

F.telas.shadowing = (function () {
    'use strict';
    var ui = F.ui, esc = F.ui.esc;
    var passagem = null, linha = 0, modo = 'en', vel = 1, tocando = null, loop = null;

    function render(args) {
        var id = args[0] || F.curso.semanaAtual().shadowing;
        passagem = F.curso.shadowing(id) || F.data.shadowing[0];
        linha = 0;
        vel = F.store.get().config.rate || 1;

        var pills = F.data.shadowing.map(function (p) {
            return '<a class="pilula' + (p.id === passagem.id ? ' is-on' : '') + '" href="#/shadowing/' + p.id + '">' +
                '<i class="nivel n' + p.nivel + '"></i>' + esc(p.titulo) + '</a>';
        }).join('');

        var comoFazer = '<p>Comece a falar <b>meio segundo depois</b> do modelo, por cima dele — não ' +
            'espere a frase terminar. É desconfortável no começo e é justamente esse desconforto que ' +
            'força boca e ouvido a trabalharem juntos, sem tradução no meio.</p>' +
            '<p><b>Os quatro modos:</b> Texto é o que está escrito; Ritmo marca em maiúscula as sílabas ' +
            'que levam a batida; Como soa mostra a frase como ela realmente sai na boca do nativo; ' +
            'Português serve só para conferir o sentido, nunca para traduzir na hora.</p>' +
            '<p><b>Foco desta passagem:</b> ' + esc(passagem.foco) + '</p>';

        return ui.cabecalho('Shadowing') +
            '<div class="pilulas">' + pills + '</div>' +

            '<div class="cartao">' +
            '<div class="cartao-titulo">' +
            '<h3>' + esc(passagem.titulo) + '</h3>' +
            ui.ajuda('Como fazer shadowing', comoFazer) +
            '</div>' +
            '<p class="sub sub--compacta">nível ' + passagem.nivel + ' · ' + passagem.wpm + ' palavras/min</p>' +

            '<div class="sh-controles">' +
            '<div class="segmentado" id="sh-modo">' +
            ['en:Texto', 'forte:Ritmo', 'soa:Como soa', 'pt:Português'].map(function (o) {
                var p = o.split(':');
                return '<button data-modo="' + p[0] + '"' + (p[0] === 'en' ? ' class="is-on"' : '') + '>' + p[1] + '</button>';
            }).join('') + '</div>' +
            '<label class="campo campo--slider"><span>Velocidade <b id="sh-vel">' + vel.toFixed(2) + '×</b></span>' +
            '<input type="range" id="sh-rate" min="0.5" max="1.2" step="0.05" value="' + vel + '"></label>' +
            '</div>' +

            '<ol class="linhas" id="sh-linhas">' +
            passagem.linhas.map(function (l, i) {
                return '<li class="linha' + (i === 0 ? ' is-on' : '') + '" data-i="' + i + '">' +
                    '<span class="linha-txt">' + textoLinha(l, 'en') + '</span>' +
                    (l.nota ? '<span class="linha-nota">' + esc(l.nota) + '</span>' : '') +
                    '</li>';
            }).join('') +
            '</ol>' +

            '<div class="linha-botoes">' +
            '<button class="btn btn--forte" id="sh-tocar">▶ Tocar tudo</button>' +
            '<button class="btn" id="sh-linha">🔁 Repetir esta linha 3×</button>' +
            '<button class="btn" id="sh-prox">Próxima linha →</button>' +
            '</div>' +
            '</div>' +

            '<div class="cartao">' +
            '<div class="cartao-titulo"><h3>Sua vez, linha por linha</h3>' +
            ui.ajuda('Sua vez', '<p>Ouça a linha, fale por cima e o app mostra o que um ouvido de fora ' +
                'entendeu da sua fala.</p>') + '</div>' +
            '<p class="frase-alvo" id="sh-alvo">' + esc(passagem.linhas[0].en) + '</p>' +
            F.pratica.caixa('sh-pratica', null, { semEscrita: true }) +
            '</div>' +

            '<div class="cartao">' +
            '<div class="cartao-titulo"><h3>Gravar e comparar</h3>' +
            ui.ajuda('Gravar e comparar', '<p>Grave a passagem inteira. Repita na semana que vem, com a ' +
                'gravação antiga do lado — é a comparação que mostra o progresso.</p>') + '</div>' +
            F.pratica.gravador('sh-grav') +
            '</div>';
    }

    function textoLinha(l, m) {
        if (m === 'forte') return marcarFortes(l.forte || l.en);
        if (m === 'soa') return '<i class="soa">' + esc(l.soa || l.en) + '</i>';
        if (m === 'pt') return '<i class="pt">' + esc(l.pt) + '</i>';
        return esc(l.en);
    }

    /* Deixa em destaque as sílabas escritas em maiúscula na versão "forte". */
    function marcarFortes(t) {
        return esc(t).replace(/([A-Z]{2,})/g, '<b>$1</b>');
    }

    function pintar() {
        ui.qq('#sh-linhas .linha').forEach(function (li, i) {
            li.classList.toggle('is-on', i === linha);
            li.querySelector('.linha-txt').innerHTML = textoLinha(passagem.linhas[i], modo);
        });
        var alvo = ui.$('sh-alvo');
        if (alvo) alvo.textContent = passagem.linhas[linha].en;
        var res = ui.q('#sh-pratica [data-papel="res"]');
        if (res) res.innerHTML = '';
    }

    function montar() {
        F.pratica.ligar('sh-pratica', {
            alvo: function () { return passagem.linhas[linha].en; },
            serie: 'pronuncia',
            aoResultado: function () { F.store.concluirBloco('shadowing'); }
        });
        F.pratica.ligarGravador('sh-grav', { chave: 'shadowing:' + passagem.id });

        ui.qq('#sh-modo button').forEach(function (b) {
            b.addEventListener('click', function () {
                modo = b.getAttribute('data-modo');
                ui.qq('#sh-modo button').forEach(function (x) { x.classList.toggle('is-on', x === b); });
                pintar();
            });
        });

        ui.$('sh-rate').addEventListener('input', function () {
            vel = parseFloat(this.value);
            ui.$('sh-vel').textContent = vel.toFixed(2) + '×';
        });

        ui.qq('#sh-linhas .linha').forEach(function (li) {
            li.addEventListener('click', function () {
                linha = parseInt(li.getAttribute('data-i'), 10);
                pintar();
                F.voz.falar(passagem.linhas[linha].en, { rate: vel });
            });
        });

        ui.$('sh-tocar').addEventListener('click', function () {
            var bt = this;
            if (tocando) {
                tocando.cancelar();
                tocando = null;
                bt.textContent = '▶ Tocar tudo';
                return;
            }
            bt.textContent = '⏹ Parar';
            var frases = passagem.linhas.map(function (l) { return l.en; });
            tocando = F.voz.falarSequencia(frases, { rate: vel, pausa: 500 }, function (i) {
                linha = i; pintar();
            });
            tocando.then(function () {
                tocando = null;
                bt.textContent = '▶ Tocar tudo';
                F.store.concluirBloco('shadowing');
            });
        });

        ui.$('sh-linha').addEventListener('click', function () {
            if (loop) { loop.cancelar(); loop = null; this.textContent = '🔁 Repetir esta linha 3×'; return; }
            var t = passagem.linhas[linha].en;
            var bt = this;
            bt.textContent = '⏹ Parar repetição';
            loop = F.voz.falarSequencia([t, t, t], { rate: vel, pausa: 900 });
            loop.then(function () { loop = null; bt.textContent = '🔁 Repetir esta linha 3×'; });
        });

        ui.$('sh-prox').addEventListener('click', function () {
            linha = (linha + 1) % passagem.linhas.length;
            pintar();
            F.voz.falar(passagem.linhas[linha].en, { rate: vel });
        });
    }

    function desmontar() {
        if (tocando) { tocando.cancelar(); tocando = null; }
        if (loop) { loop.cancelar(); loop = null; }
    }

    return { render: render, montar: montar, desmontar: desmontar };
})();
