/* =========================================================
   O ciclo do treino: preparar → orar → analisar.

   As três telas do treino vivem aqui porque são as mesmas em todo
   lugar do app — no exercício do dia, no treino livre e no desafio.
   O que muda é o que entra (cenário, frase, tema) e o que o app faz
   com o resultado.

   Duas decisões que valem explicação:

   - Durante a oração o app NÃO mostra o que está transcrevendo. Ler
     a própria fala enquanto ora é a definição de olhar para si
     mesmo, que é justamente o que o Módulo 7 manda parar de fazer.
     Quem quiser ver, liga na tela — mas o padrão é não ver.

   - A bússola mostra um movimento por vez. Mostrar o mapa inteiro
     durante a oração seria trocar o branco por sobrecarga, que é o
     erro do Módulo 2.
   ========================================================= */
window.A = window.A || {};

A.treino = (function () {
    'use strict';

    var U = null;               // A.ui
    var sessao = null;

    function u() { return (U = U || A.ui); }

    /* ---------------------------------------------------------
       Entrada única. `cfg`:
         titulo, contexto, cena      o que aparece na tela de preparo
         alvo                        segundos de oração pedidos
         preparo                     segundos antes de começar
         regra, foco                 a regra do dia, quando existe
         revelar                     leitura do momento, mostrada só no fim
         imprevisto                  injeta uma informação no meio
         aoTerminar(resultado)       o que a tela chamadora faz depois
       --------------------------------------------------------- */
    function iniciar(alvoEl, cfg) {
        sessao = {
            el: alvoEl,
            cfg: cfg || {},
            texto: '',
            segundos: 0,
            passos: [],           // o que a bússola sugeriu, na ordem
            usouTravei: 0,
            crono: null,
            rec: null,
            ouvindo: false,
            mostrarFala: false
        };
        telaPreparo();
    }

    function encerrarTudo() {
        if (!sessao) return;
        if (sessao.crono) { sessao.crono.parar(); sessao.crono = null; }
        pararEscuta();
        sessao = null;
    }

    /* ---------------- 1. preparo ---------------- */

    function telaPreparo() {
        var c = sessao.cfg;
        var s = sessao;
        var seg = c.preparo === undefined ? 10 : c.preparo;

        var html = '<div class="treino">' +
            '<div class="treino-topo">' +
            (c.contexto ? '<span class="etiqueta">' + u().esc(c.contexto) + '</span>' : '') +
            '<h2>' + u().esc(c.titulo || 'Treino') + '</h2>' +
            (c.cena ? '<p class="cena">' + u().esc(c.cena) + '</p>' : '') +
            '</div>';

        if (c.frase) {
            html += '<div class="frase-partida"><small>Comece por esta frase</small>' +
                '<b>' + u().esc(c.frase) + '</b>' +
                u().botaoOuvir(c.frase, 'Ouvir') + '</div>';
        }

        if (c.instrucao) html += '<p class="instrucao">' + u().esc(c.instrucao) + '</p>';
        if (c.regra) html += u().aviso('<b>Regra de hoje.</b> ' + u().esc(c.regra), 'regra');
        if (c.cuidado) html += u().aviso('<b>Cuidado.</b> ' + u().esc(c.cuidado), 'perigo');

        html += '<div class="checklist"><h3>Dez segundos</h3><ol>' +
            A.CHECKLIST.map(function (i) {
                return '<li><b>' + u().esc(i.p) + '</b> <span>' + u().esc(i.d) + '</span></li>';
            }).join('') + '</ol></div>';

        html += '<div class="conta-grande"><span id="tr-conta">' + u().tempo(seg) + '</span>' +
            '<small>' + (seg ? 'depois disso, comece a falar' : 'sem preparo — comece') + '</small></div>';

        html += '<div class="linha-botoes">' +
            '<button class="btn btn--forte btn--grande" id="tr-comecar">Começar a orar</button>' +
            '</div>' +
            '<p class="legenda">A oração é em voz alta. O app ouve pelo microfone e analisa depois — ' +
            'nada é enviado para lugar nenhum.</p>' +
            '</div>';

        s.el.innerHTML = html;

        var contaEl = u().$('tr-conta');
        if (seg > 0) {
            s.crono = u().contagem(seg, contaEl, function () { telaOrando(); });
        } else {
            contaEl.textContent = 'agora';
        }

        u().$('tr-comecar').onclick = function () {
            if (s.crono) { s.crono.parar(); s.crono = null; }
            telaOrando();
        };
    }

    /* ---------------- 2. orando (a bússola) ---------------- */

    function telaOrando() {
        var s = sessao;
        if (!s) return;
        var c = s.cfg;
        var alvo = c.alvo || 0;

        var html = '<div class="treino orando">' +
            '<div class="orando-topo">' +
            '<div class="crono" id="tr-crono">0:00</div>' +
            (alvo ? '<div class="crono-alvo">de ' + u().tempo(alvo) + '</div>' : '') +
            '<div class="mic" id="tr-mic" title="microfone">●</div>' +
            '</div>' +
            (alvo ? '<div class="barra barra--fina"><i id="tr-barra" style="width:0%"></i></div>' : '') +

            '<div class="bussola" id="tr-bussola">' +
            '<small>agora</small>' +
            '<b id="tr-passo">Comece pelo primeiro movimento</b>' +
            '<span id="tr-dica">Uma frase simples e honesta. O resto vem depois dela.</span>' +
            '</div>' +

            '<div class="linha-botoes botoes-orando">' +
            '<button class="btn btn--forte btn--eagora" id="tr-eagora">E agora?</button>' +
            '<button class="btn btn--perigo" id="tr-travei">Travei</button>' +
            '</div>' +

            '<div class="fala" id="tr-fala" hidden></div>' +

            '<button class="btn btn--grande btn--fim" id="tr-fim">Terminei de orar</button>' +
            '<label class="ver-fala"><input type="checkbox" id="tr-ver"> mostrar o que estou dizendo</label>' +
            '</div>';

        s.el.innerHTML = html;

        var cronoEl = u().$('tr-crono');
        var barraEl = u().$('tr-barra');
        s.crono = u().relogio(cronoEl, function (seg) {
            s.segundos = seg;
            if (barraEl && alvo) barraEl.style.width = Math.min(100, (seg / alvo) * 100) + '%';
            if (alvo && seg === alvo) {
                cronoEl.classList.add('is-alvo');
                vibrar();
            }
            if (c.imprevisto && seg === Math.round((alvo || 120) * 0.45)) soltarImprevisto();
        });

        comecarEscuta();

        u().$('tr-eagora').onclick = proximoMovimento;
        u().$('tr-travei').onclick = mostrarProtocolo;
        u().$('tr-fim').onclick = function () { terminar(); };
        u().$('tr-ver').onchange = function () {
            s.mostrarFala = this.checked;
            u().$('tr-fala').hidden = !this.checked;
        };
    }

    function vibrar() {
        try { if (navigator.vibrate) navigator.vibrate(60); } catch (e) { }
    }

    /* A bússola: um movimento por vez, na ordem em que o método sugere,
       mas sem obrigar — o aluno pede o próximo quando quiser. */
    var ROTEIRO = [
        { p: 'Ligue ao momento', d: 'O que está acontecendo aqui? Comece por isso, não por uma fórmula.' },
        { p: 'Quem?', d: 'Nomeie as pessoas dentro do assunto. Ângulo 1.' },
        { p: 'O que estão vivendo?', d: 'A situação real, sem inventar nem dramatizar. Ângulo 2.' },
        { p: 'Do que precisam?', d: 'Saia da descrição e entre na intercessão. Ângulo 3.' },
        { p: 'O que lembramos sobre Deus?', d: 'Uma verdade simples, diante desta necessidade. Ângulo 4.' },
        { p: 'Inclua quem está ouvindo', d: 'Alguém mais aqui vive isso? Ponte parte → todo.' },
        { p: 'Desça um nível', d: 'O que está por trás do pedido? O que isso está causando neles?' },
        { p: 'Entregue', d: 'O que aqui está além do que vocês conseguem resolver? Ângulo 5.' },
        { p: 'Encerre por confiança', d: 'Em que vocês estão confiando? Aí vem o amém.' }
    ];

    function proximoMovimento() {
        var s = sessao;
        var i = s.passos.length;
        var passo = ROTEIRO[Math.min(i, ROTEIRO.length - 1)];
        s.passos.push(passo.p);
        u().$('tr-passo').textContent = passo.p;
        u().$('tr-dica').textContent = passo.d;
        var b = u().$('tr-bussola');
        b.classList.remove('pisca');
        void b.offsetWidth;
        b.classList.add('pisca');
    }

    function mostrarProtocolo() {
        var s = sessao;
        s.usouTravei++;
        var html = '<ol class="protocolo">' +
            A.TRAVOU.passos.map(function (p) {
                return '<li><b>' + u().esc(p.t) + '</b> ' + u().esc(p.d) + '</li>';
            }).join('') + '</ol>' +
            '<p class="retomada"><small>Diga isto e continue:</small><b>' +
            u().esc(u().sorteio(A.TRAVOU.retomadas)) + '</b></p>';
        u().abrirModal('Respire. Continue.', html);
    }

    /* Módulo 18: alguém acrescenta uma informação no meio. Não reinicie,
       não peça desculpas — faça uma ponte. */
    function soltarImprevisto() {
        var texto = u().sorteio(A.IMPREVISTOS);
        sessao.imprevistoDado = texto;
        var b = u().$('tr-bussola');
        if (!b) return;
        u().$('tr-passo').textContent = '“' + texto + '”';
        u().$('tr-dica').textContent = 'Alguém acrescentou isso agora. Não reinicie: conecte ao que você já estava dizendo.';
        b.classList.add('imprevisto', 'pisca');
        vibrar();
    }

    /* ---------------- reconhecimento de fala ---------------- */

    /* O reconhecimento encerra sozinho no silêncio, e silêncio faz parte
       de uma oração. Por isso ele é religado até o aluno dizer que
       terminou — o texto vai sendo somado entre as rodadas. */
    function comecarEscuta() {
        var s = sessao;
        if (!A.voz.temEscuta()) {
            var m = u().$('tr-mic');
            if (m) { m.classList.add('is-off'); m.title = 'sem reconhecimento de fala neste aparelho'; }
            return;
        }
        s.ouvindo = true;
        rodada();
    }

    function rodada() {
        var s = sessao;
        if (!s || !s.ouvindo) return;
        A.voz.ouvir({
            continuo: true,
            idioma: 'pt-BR',
            onParcial: function (t) {
                if (!s || !s.mostrarFala) return;
                var el = u().$('tr-fala');
                if (el) { el.textContent = (s.texto + ' ' + t).trim(); el.scrollTop = el.scrollHeight; }
            }
        }).then(function (r) {
            if (!s) return;
            if (r && r.texto) s.texto = (s.texto + ' ' + r.texto).trim();
            if (s.ouvindo) setTimeout(rodada, 120);
        }).catch(function (e) {
            if (!s) return;
            A.diag.anotar('escuta: ' + (e && e.message));
            var m = u().$('tr-mic');
            if (m) m.classList.add('is-off');
            /* erro de permissão não adianta insistir; os outros, sim */
            if (e && /not-allowed|service-not-allowed|permissao/.test(e.message || '')) {
                s.ouvindo = false;
                u().toast('Sem microfone. Você pode digitar a oração no fim.', 'ruim');
            } else if (s.ouvindo) {
                setTimeout(rodada, 600);
            }
        });
    }

    function pararEscuta() {
        if (sessao) sessao.ouvindo = false;
        try { A.voz.pararEscuta(); } catch (e) { }
    }

    /* ---------------- 3. resultado ---------------- */

    function terminar() {
        var s = sessao;
        if (!s) return;
        if (s.crono) { s.segundos = s.crono.parar(); s.crono = null; }
        pararEscuta();
        /* o último trecho pode chegar depois do stop */
        setTimeout(function () { telaResultado(); }, 450);
        s.el.innerHTML = '<div class="treino"><p class="carregando">Ouvindo o final…</p></div>';
    }

    function telaResultado() {
        var s = sessao;
        if (!s) return;
        var c = s.cfg;
        var r = A.analise.analisar(s.texto, { segundos: s.segundos, alvo: c.alvo });
        s.resultado = r;

        var html = '<div class="treino resultado">';

        html += '<div class="res-topo">' + u().anel(r.nota, 'nota') +
            '<div class="res-txt"><b>' + u().esc(A.analise.veredito(r.nota)) + '</b>' +
            '<small>' + u().tempo(s.segundos) + (c.alvo ? ' de ' + u().tempo(c.alvo) : '') +
            ' · ' + r.palavras + ' palavras' +
            (r.ritmoConfiavel ? ' · ' + r.ritmo + ' por minuto' : '') + '</small></div></div>';

        if (r.vazio) {
            html += u().aviso('O app não ouviu quase nada. Se você orou, escreva abaixo o que disse — ' +
                'a análise funciona igual.', 'perigo');
        }

        /* os 5 ângulos, visualmente */
        html += '<div class="cartao"><h3>Os 5 Ângulos</h3><div class="angulos">' +
            r.angulos.map(function (a) {
                var cls = a.forte ? 'is-forte' : a.presente ? 'is-ok' : 'is-nao';
                return '<div class="ang ' + cls + '"><b>' + u().esc(a.nome) + '</b>' +
                    '<small>' + (a.presente ? a.n + '×' : 'não apareceu') + '</small></div>';
            }).join('') + '</div>' +
            '<p class="legenda">Não é obrigatório usar todos. Numa oração curta, três já é bastante.</p></div>';

        /* as 4 pontes */
        html += '<div class="cartao"><h3>As 4 Pontes</h3><div class="pontes">' +
            r.caminho.pontes.map(function (p) {
                return '<div class="ponte ' + (p.ok ? 'is-ok' : 'is-nao') + '">' +
                    '<span>' + (p.ok ? '✓' : '·') + '</span>' + u().esc(p.nome) + '</div>';
            }).join('') + '</div>' +
            '<p class="legenda">O app vê se a oração <i>andou</i> naquela direção. Conexão de verdade, ' +
            'só quem ouviu sabe.</p></div>';

        /* medidas */
        html += '<div class="cartao"><h3>Medidas</h3>' +
            u().medida('Detalhe verdadeiro', r.especificidade.indice * 100,
                r.especificidade.indice >= 0.65 ? 'específica' : r.especificidade.indice >= 0.4 ? 'mistura' : 'genérica') +
            u().medida('Avanço (sem repetir)', Math.max(0, 100 - r.repeticao.taxa * 300),
                r.repeticao.taxa < 0.06 ? 'avançou' : r.repeticao.taxa < 0.15 ? 'repetiu um pouco' : 'circulou') +
            u().medida('Vocativos em fila', Math.max(0, 100 - r.vocativos.seguidos * 25),
                r.vocativos.seguidos ? r.vocativos.seguidos + '×' : 'nenhum') +
            u().medida('Conclusão', r.encerramento.porEntrega ? 100 : r.encerramento.fechou ? 55 : 0,
                r.encerramento.porEntrega ? 'por entrega' : r.encerramento.fechou ? 'pela fórmula' : 'parou') +
            '</div>';

        if (r.elogios.length) {
            html += '<div class="cartao cartao--bom"><h3>O que funcionou</h3><ul class="lista-bom">' +
                r.elogios.map(function (e) { return '<li>' + u().esc(e) + '</li>'; }).join('') +
                '</ul></div>';
        }

        if (r.sugestoes.length) {
            html += '<div class="cartao"><h3>O que treinar</h3>' +
                r.sugestoes.map(function (g) {
                    return '<div class="achado achado--' + g.grau + '">' +
                        '<b>' + u().esc(g.titulo) + '</b>' +
                        '<p>' + u().esc(g.texto) + '</p>' +
                        (g.modulo ? '<a class="link" href="#/curso/' + g.modulo + '">Módulo ' + g.modulo + '</a>' : '') +
                        (g.dicionario ? '<a class="link" href="#/dicionario">Abrir o dicionário</a>' : '') +
                        '</div>';
                }).join('') + '</div>';
        }

        /* a leitura do momento, agora que a oração já aconteceu */
        if (c.revelar) {
            html += '<div class="cartao"><h3>Uma leitura possível do momento</h3>' +
                '<dl class="leitura">' +
                (c.revelar.quem ? '<dt>Quem</dt><dd>' + u().esc(c.revelar.quem) + '</dd>' : '') +
                (c.revelar.oque ? '<dt>O quê</dt><dd>' + u().esc(c.revelar.oque) + '</dd>' : '') +
                (c.revelar.necessidade ? '<dt>Necessidade</dt><dd>' + u().esc(c.revelar.necessidade) + '</dd>' : '') +
                (c.revelar.primeiro ? '<dt>Primeiro movimento</dt><dd>' + u().esc(c.revelar.primeiro) + '</dd>' : '') +
                '</dl><p class="legenda">Não é a resposta certa — é uma leitura. Compare com a sua.</p></div>';
        }

        /* o que foi dito */
        html += '<div class="cartao"><h3>O que você disse</h3>' +
            '<textarea class="entrada entrada--texto" id="tr-texto" rows="6" ' +
            'placeholder="Se o microfone falhou, escreva aqui o que você orou e analise de novo.">' +
            u().esc(s.texto) + '</textarea>' +
            '<div class="linha-botoes"><button class="btn" id="tr-reanalisar">Analisar este texto</button></div>' +
            '<p class="legenda">O reconhecimento de fala erra, principalmente com microfone ruim. ' +
            'Corrigir aqui melhora a análise.</p></div>';

        /* reflexão — o material pede uma frase depois de cada exercício */
        html += '<div class="cartao"><h3>' + u().esc(c.reflexao || 'O que você percebeu?') + '</h3>' +
            '<textarea class="entrada" id="tr-reflexao" rows="3" ' +
            'placeholder="Uma frase basta: o que foi fácil, o que foi difícil."></textarea></div>';

        html += '<div class="linha-botoes">' +
            '<button class="btn btn--forte btn--grande" id="tr-salvar">Guardar e concluir</button>' +
            '</div>' +
            '<p class="legenda aviso-limite">O app conta palavras: mede desenvolvimento, conexão, ' +
            'detalhe e conclusão. Ele não julga se a oração foi sincera nem se agradou a Deus — ' +
            'isso não é medida de aplicativo.</p>' +
            '</div>';

        s.el.innerHTML = html;

        u().$('tr-reanalisar').onclick = function () {
            s.texto = u().$('tr-texto').value;
            telaResultado();
        };

        u().$('tr-salvar').onclick = function () {
            var reflexao = u().$('tr-reflexao').value.trim();
            var texto = u().$('tr-texto').value.trim();
            var registro = {
                tipo: c.tipo || 'livre',
                dia: c.dia || null,
                titulo: c.titulo || '',
                contexto: c.contexto || '',
                segundos: s.segundos,
                alvo: c.alvo || 0,
                palavras: r.palavras,
                nota: r.nota,
                ritmo: r.ritmo,
                angulos: r.angulos.filter(function (a) { return a.presente; }).map(function (a) { return a.id; }),
                pontes: r.caminho.feitas,
                repeticao: Math.round(r.repeticao.taxa * 100),
                vocativosFila: r.vocativos.seguidos,
                concluiu: r.encerramento.concluiu,
                especificidade: Math.round(r.especificidade.indice * 100),
                travei: s.usouTravei,
                reflexao: reflexao,
                texto: texto
            };
            A.store.guardarOracao(registro);
            var fim = c.aoTerminar;
            var copia = registro;
            encerrarTudo();
            if (fim) fim(copia);
        };
    }

    return {
        iniciar: iniciar,
        encerrar: encerrarTudo
    };
})();
