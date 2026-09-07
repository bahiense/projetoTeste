/* =========================================================
   TELA ARENA — falar sem parar, sob cronômetro.

   O exercício mais desconfortável do app e o que mais separa
   quem "sabe inglês" de quem fala inglês. A regra é uma só:
   a boca não pode parar até o relógio zerar.
   ========================================================= */
window.F = window.F || {};
F.telas = F.telas || {};

F.telas.arena = (function () {
    'use strict';
    var ui = F.ui, esc = F.ui.esc;

    var MODOS = [
        { id: 'monologo', nome: 'Monólogo', desc: 'Um tema sorteado. Falar sem parar até o tempo acabar.' },
        { id: 'entrevista', nome: 'Entrevista', desc: 'A pergunta que a banca faz. Resposta estruturada, sob relógio.' },
        { id: 'ensinar', nome: 'Ensinar', desc: 'O exercício central do método: você ensina algo em inglês.' },
        { id: 'debate', nome: 'Debate', desc: 'Você recebe um lado — inclusive um que você não defende.' },
        { id: 'narracao', nome: 'Narração', desc: 'Narrar o que está acontecendo, ao vivo, no presente.' }
    ];

    var modo = 'monologo', item = null, tempo = 60, rodando = false;
    var relogio = null, transcricao = '', escutaLoop = null, iniciou = 0;

    function render(args) {
        modo = args[0] || 'monologo';
        if (!F.data.prompts[modo]) modo = 'monologo';
        sortear();

        var pills = MODOS.map(function (m) {
            return '<a class="pilula' + (m.id === modo ? ' is-on' : '') + '" href="#/arena/' + m.id + '">' + esc(m.nome) + '</a>';
        }).join('');
        var md = MODOS.filter(function (m) { return m.id === modo; })[0];

        var asRegras = '<p><b>A boca não para até o relógio zerar.</b> Errar é permitido; parar, não.</p>' +
            '<ul>' +
            '<li><b>Não pare.</b> Se travar numa palavra, descreva-a em inglês e siga.</li>' +
            '<li><b>Não traduza.</b> Nem uma palavra em português, nem para si mesmo.</li>' +
            '<li><b>Não se corrija.</b> Errou, segue. Correção é depois, ouvindo a gravação.</li>' +
            '</ul>' +
            '<p><b>' + esc(md.nome) + ':</b> ' + esc(md.desc) + '</p>' +
            '<p>No fim o app mostra quantas palavras por minuto você falou (nativo relaxado fica entre ' +
            '120 e 160), quais blocos do banco apareceram na sua fala e a correção do que deu para ouvir.</p>';

        return ui.cabecalho('Arena') +
            '<div class="pilulas">' + pills + '</div>' +

            '<div class="cartao cartao--arena">' +
            '<div class="arena-ajuda">' + ui.ajuda('As regras da arena', asRegras, 'as regras') + '</div>' +
            '<div class="arena-prompt" id="ar-prompt"></div>' +
            '<div class="arena-relogio" id="ar-relogio">' + fmt(tempo) + '</div>' +
            '<div class="linha-botoes">' +
            '<button class="btn btn--forte btn--grande" id="ar-ir">▶ Começar</button>' +
            '<button class="btn" id="ar-sortear">🎲 Outro tema</button>' +
            '<button class="btn btn--som" id="ar-ouvir">🔊 Ouvir o tema</button>' +
            '</div>' +
            '<div class="arena-vivo" id="ar-vivo"></div>' +
            '</div>' +

            '<div id="ar-res"></div>';
    }

    function sortear() {
        var lista = F.data.prompts[modo];
        item = ui.sorteio(lista);
        tempo = item.t || (modo === 'debate' ? 90 : 90);
    }

    function pintarPrompt() {
        var el = ui.$('ar-prompt');
        if (!el) return;
        el.innerHTML = '<p class="arena-en">' + esc(item.p) + '</p>' +
            '<p class="arena-pt">' + esc(item.pt || '') + '</p>' +
            (item.dica ? '<p class="dica-turno">💡 ' + esc(item.dica) + '</p>' : '') +
            (modo === 'debate' ? '<p class="legenda">Defenda este lado por 90 segundos, concordando ou não.</p>' : '');
        ui.$('ar-relogio').textContent = fmt(tempo);
        ui.$('ar-ouvir').setAttribute('data-falar', item.p);
    }

    function fmt(s) {
        var m = Math.floor(s / 60), r = s % 60;
        return m + ':' + (r < 10 ? '0' : '') + r;
    }

    /* Reconhecimento longo: o Chrome encerra sozinho em pausas,
       então religamos até o tempo acabar. */
    function escutarAte(fimEm, aoTexto) {
        var vivo = true;
        function ciclo() {
            if (!vivo || Date.now() >= fimEm) return;
            F.voz.ouvir({
                continuo: true,
                limite: Math.max(1000, fimEm - Date.now()),
                onParcial: function (t) { aoTexto(t, false); }
            }).then(function (r) {
                if (r.texto) aoTexto(r.texto, true);
                if (vivo && Date.now() < fimEm - 500) setTimeout(ciclo, 120);
            }).catch(function () { vivo = false; });
        }
        ciclo();
        return { parar: function () { vivo = false; F.voz.pararEscuta(); } };
    }

    function comecar() {
        if (rodando) return parar();
        rodando = true;
        transcricao = '';
        iniciou = Date.now();
        ui.$('ar-ir').textContent = '⏹ Parar agora';
        ui.$('ar-res').innerHTML = '';
        ui.$('ar-vivo').innerHTML = '<p class="vivo-txt" id="ar-vivo-txt">…</p>';

        if (F.voz.temGravacao()) F.voz.comecarGravacao().catch(function () { });

        var fimEm = Date.now() + tempo * 1000;
        if (F.voz.temEscuta()) {
            escutaLoop = escutarAte(fimEm, function (t, final) {
                if (final) transcricao += ' ' + t;
                var el = ui.$('ar-vivo-txt');
                if (el) el.textContent = (transcricao + ' ' + (final ? '' : t)).trim().slice(-320);
            });
        } else {
            ui.$('ar-vivo').innerHTML = '<p class="sub">Sem reconhecimento de fala neste aparelho — ' +
                'fale assim mesmo, a gravação é o que importa.</p>';
        }

        relogio = ui.contagem(tempo, ui.$('ar-relogio'), parar);
    }

    function parar() {
        if (!rodando) return;
        rodando = false;
        var dur = relogio ? relogio.decorrido() : 0;
        if (relogio) relogio.parar();
        if (escutaLoop) escutaLoop.parar();
        var btIr = ui.$('ar-ir');
        if (btIr) btIr.textContent = '▶ Começar de novo';

        var audio = F.voz.gravando() ? F.voz.pararGravacao() : Promise.resolve(null);
        audio.then(function (url) { resultado(dur || tempo, url); });
    }

    function resultado(dur, url) {
        var caixa = ui.$('ar-res');
        if (!caixa) return;   // o aluno já saiu da arena
        var texto = transcricao.trim();
        var palavras = texto ? texto.split(/\s+/).filter(Boolean) : [];
        var wpm = dur > 0 ? Math.round((palavras.length / dur) * 60) : 0;
        var unicas = {};
        palavras.forEach(function (p) { unicas[F.texto.normalizar(p)] = 1; });
        var variedade = palavras.length ? Math.round((Object.keys(unicas).length / palavras.length) * 100) : 0;
        var chunksUsados = acharChunks(texto);
        var muletas = contarMuletas(texto);

        /* Nota da fala: volume, ritmo e riqueza. Nunca sobre "erro de gramática" —
           esse não é o objetivo deste exercício. */
        var nFluxo = Math.min(100, Math.round((wpm / 110) * 100));
        var nDuracao = Math.min(100, Math.round((dur / tempo) * 100));
        var nRiqueza = Math.min(100, variedade + chunksUsados.length * 4);
        var nota = Math.round(nFluxo * 0.4 + nDuracao * 0.35 + nRiqueza * 0.25);
        if (F.voz.temEscuta() && palavras.length) F.store.registrar('fala', nota);
        F.store.concluirBloco('fala');

        caixa.innerHTML = '<div class="cartao">' +
            '<h3>Como foi</h3>' +
            '<div class="streak-linha">' +
            '<div class="streak-num">' + dur + 's<small>falando</small></div>' +
            '<div class="streak-num">' + palavras.length + '<small>palavras</small></div>' +
            '<div class="streak-num">' + wpm + '<small>palavras/min</small></div>' +
            '<div class="streak-num">' + variedade + '%<small>variedade</small></div>' +
            '</div>' +
            (F.voz.temEscuta() && palavras.length ? '<div class="res-topo">' + ui.anel(nota, 'fala') +
                '<div class="res-txt"><b>' + esc(veredito(wpm, dur)) + '</b>' +
                '<small>Nativo em conversa relaxada fala entre 120 e 160 palavras por minuto.</small></div></div>' : '') +
            (chunksUsados.length ? '<p class="sub">Blocos do banco que você usou: ' +
                chunksUsados.map(function (c) { return '<span class="chip is-ok">' + esc(c) + '</span>'; }).join(' ') + '</p>'
                : '<p class="sub">Você não usou nenhum bloco do banco. Tente encaixar dois na próxima rodada — ' +
                'é assim que eles saem da lista e entram na sua fala.</p>') +
            (muletas.length ? '<p class="sub">Muletas detectadas: ' + muletas.map(function (m) {
                return '<span class="chip chip--alerta">' + esc(m.p) + ' ×' + m.n + '</span>';
            }).join(' ') + ' — troque por um chunk de ganhar tempo.</p>' : '') +
            (url ? '<div class="audio-linha"><b>Sua fala</b><audio controls src="' + url + '"></audio></div>' : '') +
            (texto ? '<details class="transcricao"><summary>Ver a transcrição</summary><p>' + esc(texto) + '</p></details>' : '') +
            // dois minutos de fala livre são o melhor material de correção que
            // existe: é ali que os erros de sempre aparecem sem disfarce
            (texto ? F.correcao.html(texto) : '') +
            '<p class="legenda">Ouça a gravação inteira. Anote no diário as três palavras que faltaram.</p>' +
            '<a class="btn" href="#/diario">Anotar no diário</a>' +
            '</div>';
    }

    function veredito(wpm, dur) {
        if (dur < tempo * 0.6) return 'Você parou antes do tempo. Da próxima, encha o silêncio com qualquer coisa — até "let me think" conta.';
        if (wpm < 70) return 'Muito devagar: ainda tem tradução no meio do caminho.';
        if (wpm < 110) return 'Ritmo de conversa cuidadosa. Já é comunicação real.';
        if (wpm <= 170) return 'Ritmo de nativo relaxado. É esse o alvo.';
        return 'Rápido demais para ser entendido com clareza — respire e marque as pausas.';
    }

    function acharChunks(texto) {
        var n = ' ' + F.texto.normalizar(texto) + ' ';
        var achados = [];
        F.data.chunks.forEach(function (c) {
            if (achados.length >= 8) return;
            var alvo = F.texto.normalizar(c.en.split('—')[0]);
            if (alvo.split(' ').length < 2) return;
            if (n.indexOf(' ' + alvo + ' ') >= 0) achados.push(c.en);
        });
        return achados;
    }

    function contarMuletas(texto) {
        var n = ' ' + F.texto.normalizar(texto) + ' ';
        var lista = ['like', 'you know', 'i mean', 'basically', 'actually', 'so', 'um', 'uh'];
        var out = [];
        lista.forEach(function (m) {
            var re = new RegExp(' ' + m + ' ', 'g');
            var c = (n.match(re) || []).length;
            if (c >= 4) out.push({ p: m, n: c });
        });
        return out;
    }

    function montar() {
        pintarPrompt();
        ui.$('ar-ir').addEventListener('click', comecar);
        ui.$('ar-sortear').addEventListener('click', function () {
            if (rodando) return;
            sortear(); pintarPrompt();
        });
    }

    function desmontar() {
        if (relogio) relogio.parar();
        if (escutaLoop) escutaLoop.parar();
        if (F.voz.gravando()) F.voz.pararGravacao();
        rodando = false;
    }

    return { render: render, montar: montar, desmontar: desmontar };
})();
