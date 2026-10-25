/* =========================================================
   Telas e navegação.

   O treino tem quatro passos, como uma mentoria:
   1. #/treinar    escolher ou sortear o tema, o nível e o tempo
   2. #/roteiro    estudar o roteiro e gravar a fala
   3. (análise)    a IA ouve a gravação; sem chave, a análise é local
   4. #/feedback/  nota, pontos fortes, o que melhorar, vícios e o
                   mentor lendo o feedback em voz alta
   Mais #/evolucao (histórico e gráfico) e #/ajustes (chave e voz).
   ========================================================= */
window.O = window.O || {};

O.app = (function () {
    'use strict';

    var st = O.store;
    var NIVEIS = O.temas.NIVEIS;

    function $(id) { return document.getElementById(id); }
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios); }
    function mmss(s) {
        s = Math.max(0, Math.round(s));
        return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
    }

    var toastTimer = null;
    function toast(msg, tipo) {
        var el = $('toast');
        el.textContent = msg;
        el.className = 'toast is-on' + (tipo ? ' toast--' + tipo : '');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { el.className = 'toast'; }, 3500);
    }

    /* ---------- estado da sessão (não salvo) ---------- */

    var sessao = {
        carregando: '',        // texto do que está sendo gerado
        erro: '',
        gravacao: null,        // { blob, url, segundos, transcricao }
        controle: null,        // gravação em andamento
        idGravacao: null,      // id do histórico ligado à gravação em memória
        analisando: ''         // texto enquanto a avaliação é feita
    };

    /* ---------- rotas ---------- */

    var ROTAS = ['treinar', 'roteiro', 'feedback', 'evolucao', 'ajustes'];

    function partes() {
        var h = (location.hash || '#/treinar').replace(/^#\/?/, '').split('/');
        return { rota: ROTAS.indexOf(h[0]) >= 0 ? h[0] : 'treinar', arg: h[1] ? decodeURIComponent(h[1]) : '' };
    }

    function ir(rota, arg) {
        var alvo = '#/' + rota + (arg ? '/' + encodeURIComponent(arg) : '');
        if (location.hash === alvo) pintar(); else location.hash = alvo;
    }

    function pintar() {
        var p = partes();
        if (p.rota !== 'roteiro' && sessao.controle) { sessao.controle.cancelar(); sessao.controle = null; }
        if (p.rota !== 'feedback') O.voz.parar();
        var tela = TELAS[p.rota];
        $('tela').innerHTML = tela.html(p.arg);
        window.scrollTo(0, 0);
        if (tela.ligar) tela.ligar(p.arg);
        Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'), function (b) {
            var r = b.getAttribute('data-nav');
            b.classList.toggle('is-on', r === p.rota || (r === 'treinar' && (p.rota === 'roteiro' || p.rota === 'feedback')));
        });
    }

    function on(sel, ev, fn) {
        Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
            el.addEventListener(ev, fn);
        });
    }

    /* =========================================================
       1. TREINAR
       ========================================================= */

    function htmlTreinar() {
        var c = st.cfg();
        var atual = st.get().atual;
        var semChave = !O.ia.pronto(c);
        var h = '<section class="hero">' +
            '<h1>Fale melhor, <em>um tema</em> por vez.</h1>' +
            '<p>Receba um tema, estude o roteiro, grave sua explicação e descubra o que melhorar.</p>' +
            '</section>';

        if (atual && atual.roteiro) {
            h += '<a class="cartao cartao--link" href="#/roteiro">' +
                '<span class="rotulo">Continuar treino</span>' +
                '<b>' + esc(atual.tema.titulo) + '</b>' +
                '<span class="seta">›</span></a>';
        }

        h += '<section class="cartao">' +
            '<div class="chips" role="group" aria-label="Nível">' +
            Object.keys(NIVEIS).map(function (k) {
                return '<button class="chip' + (c.nivel === k ? ' is-on' : '') + '" data-nivel="' + k + '">' +
                    NIVEIS[k].nome + '</button>';
            }).join('') + '</div>' +
            '<p class="dica-nivel">' + esc(NIVEIS[c.nivel].dica) + '</p>' +
            '<div class="linha-tempo"><span>Tempo máximo</span><div class="chips chips--mini">' +
            [1, 2, 3, 5].map(function (m) {
                return '<button class="chip' + (c.minutos === m ? ' is-on' : '') + '" data-min="' + m + '">' + m + ' min</button>';
            }).join('') + '</div></div>' +
            '<button class="btn btn--forte btn--largo" id="sortear">✦ Sortear um tema para mim</button>' +
            '<div class="ou"><span>ou escolha</span></div>' +
            '<label class="campo"><span>Seu tema</span>' +
            '<input id="tema-proprio" type="text" maxlength="160" placeholder="Ex.: Como funciona a inflação"></label>' +
            '<label class="campo"><span>Situação real <small>(opcional)</small></span>' +
            '<input id="contexto" type="text" maxlength="200" placeholder="Ex.: reunião com a diretoria, pitch, aula, entrevista"></label>' +
            '<button class="btn btn--largo" id="usar-tema">Usar meu tema</button>' +
            '</section>';

        if (semChave) {
            h += '<p class="aviso">Sem a chave gratuita do Gemini, os temas vêm do banco do app e a ' +
                'avaliação é feita no aparelho (ritmo, vícios, tempo e cobertura). Para a avaliação ' +
                'completa com IA, que ouve sua voz, <a href="#/ajustes">configure a chave</a> — leva dois minutos e não pede cartão.</p>';
        }
        return h;
    }

    function ligarTreinar() {
        on('[data-nivel]', 'click', function () {
            st.ajustar({ nivel: this.getAttribute('data-nivel'),
                minutos: NIVEIS[this.getAttribute('data-nivel')].minutos });
            pintar();
        });
        on('[data-min]', 'click', function () {
            st.ajustar({ minutos: +this.getAttribute('data-min') });
            pintar();
        });
        $('sortear').addEventListener('click', function () { comecar(null); });
        $('usar-tema').addEventListener('click', function () {
            var t = $('tema-proprio').value.trim();
            if (t.length < 3) { toast('Escreva o tema que você quer treinar.'); $('tema-proprio').focus(); return; }
            comecar({ titulo: t, objetivo: '', pontos: [], nivel: st.cfg().nivel, origem: 'proprio' },
                $('contexto').value.trim());
        });
        $('tema-proprio').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('usar-tema').click(); });
    }

    /* Tema escolhido (ou null para sortear): gera o roteiro e vai para ele. */
    function comecar(tema, contexto) {
        var c = st.cfg();
        descartarGravacao();
        st.definirAtual({ tema: tema || { titulo: '', nivel: c.nivel }, roteiro: null,
            contexto: contexto || '', minutos: c.minutos });
        sessao.erro = '';
        sessao.carregando = tema ? 'Montando o roteiro…' : 'Escolhendo um tema para você…';
        ir('roteiro');

        var temaP = tema ? Promise.resolve(tema)
            : O.ia.pronto(c) ? O.ia.sortearTema(c.nivel, st.temasFeitos(), c).catch(function (e) {
                toast('A IA não respondeu (' + e.message + '). Sorteei do banco do app.', 'erro');
                return O.temas.sortear(c.nivel, st.temasFeitos());
            })
                : Promise.resolve(O.temas.sortear(c.nivel, st.temasFeitos()));

        temaP.then(function (t) {
            var atual = st.get().atual;
            atual.tema = t;
            st.definirAtual(atual);
            sessao.carregando = 'Montando o roteiro…';
            if (partes().rota === 'roteiro') pintar();
            return gerarRoteiro();
        });
    }

    function gerarRoteiro() {
        var c = st.cfg();
        var atual = st.get().atual;
        sessao.carregando = 'Montando o roteiro…';
        sessao.erro = '';
        var p = O.ia.pronto(c)
            ? O.ia.criarRoteiro(atual.tema, atual.minutos, atual.contexto, c).catch(function (e) {
                sessao.erro = 'A IA não conseguiu montar o roteiro (' + e.message + '). ' +
                    'Este é o roteiro básico do app.';
                return O.roteiro.montar(atual.tema, atual.minutos);
            })
            : Promise.resolve(O.roteiro.montar(atual.tema, atual.minutos));
        return p.then(function (r) {
            var a = st.get().atual;
            if (a !== atual) return;
            a.roteiro = r;
            st.definirAtual(a);
            sessao.carregando = '';
            if (partes().rota === 'roteiro') pintar();
        });
    }

    /* =========================================================
       2. ROTEIRO + GRAVAÇÃO
       ========================================================= */

    function htmlRoteiro() {
        var atual = st.get().atual;
        if (!atual) {
            return '<section class="vazio"><p>Nenhum treino em andamento.</p>' +
                '<a class="btn btn--forte" href="#/treinar">Escolher um tema</a></section>';
        }
        if (sessao.carregando || !atual.roteiro) {
            return '<section class="carregando"><div class="pulso"></div><p>' +
                esc(sessao.carregando || 'Montando o roteiro…') + '</p>' +
                (atual.tema && atual.tema.titulo ? '<b>' + esc(atual.tema.titulo) + '</b>' : '') + '</section>';
        }
        var r = atual.roteiro;
        var h = '<section class="tema-topo">' +
            '<span class="rotulo">Seu tema · ' + esc(NIVEIS[atual.tema.nivel || 'intermediario'].nome) +
            ' · até ' + atual.minutos + ' min</span>' +
            '<h1>' + esc(r.titulo || atual.tema.titulo) + '</h1>' +
            (r.objetivo ? '<p>' + esc(r.objetivo) + '</p>' : '') + '</section>';

        if (sessao.erro) h += '<p class="aviso aviso--erro">' + esc(sessao.erro) + '</p>';

        h += '<section class="cartao"><h2>Pontos-chave</h2><ol class="pontos">' +
            (r.pontos || []).map(function (p, i) {
                return '<li><span class="num">' + (i + 1) + '</span><div><b>' + esc(p.titulo) + '</b>' +
                    (p.explicacao ? '<p>' + esc(p.explicacao) + '</p>' : '') + '</div></li>';
            }).join('') + '</ol></section>';

        if (r.estrutura && r.estrutura.length) {
            h += '<section class="cartao"><h2>Estrutura</h2><ul class="estrutura">' +
                r.estrutura.map(function (e) {
                    return '<li><b>' + esc(e.parte) + '</b>' + (e.tempo ? ' <small>' + esc(e.tempo) + '</small>' : '') +
                        '<p>' + esc(e.texto) + '</p></li>';
                }).join('') + '</ul></section>';
        }
        if (r.dicas && r.dicas.length) {
            h += '<section class="cartao"><h2>Dicas</h2><ul class="marcadores">' +
                r.dicas.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></section>';
        }
        if (r.estrategia && r.estrategia.length) {
            h += '<section class="cartao"><h2>Estratégia de estudo</h2><ol class="passos">' +
                r.estrategia.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ol></section>';
        }

        h += '<section class="cartao gravar" id="gravar">' + htmlGravar() + '</section>';
        h += '<div class="acoes-pe">' +
            '<button class="btn btn--fraco" id="novo-roteiro">↻ Gerar o roteiro de novo</button>' +
            '<button class="btn btn--fraco" id="trocar-tema">Trocar de tema</button></div>';
        return h;
    }

    function htmlGravar() {
        var atual = st.get().atual;
        if (!O.gravador.suportado()) {
            return '<p>Este navegador não deixa gravar áudio. Abra o app no Chrome, por um endereço https://.</p>';
        }
        if (sessao.analisando) {
            return '<div class="carregando carregando--mini"><div class="pulso"></div><p>' +
                esc(sessao.analisando) + '</p></div>';
        }
        if (sessao.controle) {
            return '<p class="gravando-txt"><i class="ponto-rec"></i> Gravando… <b id="rel">0:00</b> / ' +
                mmss(atual.minutos * 60) + '</p>' +
                '<div class="tempo-barra"><i id="rel-barra"></i></div>' +
                '<div class="nivel"><i id="nivel"></i></div>' +
                '<p class="ao-vivo" id="ao-vivo"></p>' +
                '<button class="mic mic--parar" id="parar" aria-label="Parar gravação">■</button>' +
                '<p class="peq">Toque para encerrar</p>';
        }
        if (sessao.gravacao) {
            return '<h2>Sua gravação · ' + mmss(sessao.gravacao.segundos) + '</h2>' +
                '<audio controls src="' + sessao.gravacao.url + '"></audio>' +
                '<button class="btn btn--forte btn--largo" id="enviar">Enviar para análise</button>' +
                '<button class="btn btn--fraco btn--largo" id="regravar">Gravar de novo</button>';
        }
        return '<p>Pronto? Grave sua explicação (até ' + plural(atual.minutos, 'minuto', 'minutos') + ').</p>' +
            '<button class="mic" id="gravar-btn" aria-label="Começar a gravar">' + ICONE_MIC + '</button>';
    }

    var ICONE_MIC = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" ' +
        'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/>' +
        '<path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';

    function repintarGravar() {
        var el = $('gravar');
        if (!el) return;
        el.innerHTML = htmlGravar();
        ligarGravar();
    }

    function ligarRoteiro() {
        var b = $('novo-roteiro');
        if (b) b.addEventListener('click', function () { gerarRoteiro(); pintar(); });
        b = $('trocar-tema');
        if (b) b.addEventListener('click', function () {
            descartarGravacao();
            st.definirAtual(null);
            ir('treinar');
        });
        ligarGravar();
    }

    function ligarGravar() {
        var b = $('gravar-btn');
        if (b) b.addEventListener('click', gravar);
        b = $('parar');
        if (b) b.addEventListener('click', parar);
        b = $('regravar');
        if (b) b.addEventListener('click', function () { descartarGravacao(); gravar(); });
        b = $('enviar');
        if (b) b.addEventListener('click', function () { analisar(); });
    }

    function gravar() {
        var atual = st.get().atual;
        var limite = atual.minutos * 60;
        O.voz.parar();
        O.gravador.iniciar(limite, {
            onTempo: function (s) {
                var r = $('rel'), barra = $('rel-barra');
                if (r) r.textContent = mmss(s);
                if (barra) barra.style.width = Math.min(100, s / limite * 100) + '%';
            },
            onNivel: function (n) {
                var el = $('nivel');
                if (el) el.style.width = Math.round(n * 100) + '%';
            },
            onTexto: function (t) {
                var el = $('ao-vivo');
                if (el) el.textContent = t.split(' ').slice(-14).join(' ');
            },
            onLimite: function () { toast('Tempo esgotado.'); parar(); }
        }).then(function (ctrl) {
            sessao.controle = ctrl;
            repintarGravar();
        }, function (e) {
            toast(e && e.name === 'NotAllowedError'
                ? 'O microfone foi negado. Libere o acesso nas permissões do navegador.'
                : 'Não consegui abrir o microfone: ' + (e && e.message || e), 'erro');
        });
    }

    function parar() {
        var ctrl = sessao.controle;
        if (!ctrl) return;
        sessao.controle = null;
        ctrl.parar().then(function (g) {
            sessao.gravacao = g;
            sessao.idGravacao = null;
            repintarGravar();
        });
        var el = $('gravar');
        if (el) el.innerHTML = '<div class="carregando carregando--mini"><div class="pulso"></div><p>Finalizando…</p></div>';
    }

    function descartarGravacao() {
        if (sessao.controle) { sessao.controle.cancelar(); sessao.controle = null; }
        if (sessao.gravacao) { try { URL.revokeObjectURL(sessao.gravacao.url); } catch (e) { } }
        sessao.gravacao = null;
        sessao.idGravacao = null;
    }

    /* =========================================================
       3. ANÁLISE
       ========================================================= */

    function analisar(forcarLocal) {
        var c = st.cfg();
        var atual = st.get().atual;
        var g = sessao.gravacao;
        if (!g || !atual) return;
        if (g.segundos < 3) { toast('A gravação ficou curta demais. Grave de novo.'); return; }

        var usarIA = O.ia.pronto(c) && !forcarLocal;
        sessao.analisando = usarIA ? 'Seu mentor está ouvindo a gravação…' : 'Analisando…';
        repintarGravar();

        var p = usarIA
            ? O.gravador.paraEnvio(g.blob).then(function (audio) {
                return O.ia.avaliar(audio, atual.tema, atual.roteiro, g.segundos, atual.minutos, c);
            }).then(completarIA, function (e) {
                toast('A IA falhou: ' + e.message + ' Mostrando a avaliação local.', 'erro');
                var a = avaliacaoLocal(g, atual);
                a.erroIA = e.message;
                return a;
            })
            : Promise.resolve(avaliacaoLocal(g, atual));

        p.then(function (av) {
            sessao.analisando = '';
            var item = st.registrar({
                tema: { titulo: atual.tema.titulo, nivel: atual.tema.nivel, origem: atual.tema.origem },
                nivel: atual.tema.nivel,
                minutos: atual.minutos,
                segundos: Math.round(g.segundos),
                avaliacao: av
            });
            sessao.idGravacao = item.id;
            ir('feedback', item.id);
        });

        function completarIA(a) {
            var m = O.analise.medir(a.transcricao || '', g.segundos, atual.roteiro && atual.roteiro.pontos);
            a.medidas = m;
            a.fortes = a.fortes || [];
            a.melhorar = a.melhorar || [];
            a.vicios = (a.vicios || []).filter(function (v) { return v && v.termo && v.vezes > 0; })
                .sort(function (x, y) { return y.vezes - x.vezes; });
            if (!a.cobertura || !a.cobertura.length) a.cobertura = m.cobertura;
            return a;
        }
    }

    function avaliacaoLocal(g, atual) {
        var a = O.analise.avaliarLocal(g.transcricao, g.segundos, atual.roteiro, atual.minutos);
        a.transcricao = g.transcricao;
        a.vicios = a.medidas.vicios;
        a.cobertura = a.medidas.palavras >= 5 ? a.medidas.cobertura : [];
        a.falado = falaLocal(a);
        return a;
    }

    /* Texto corrido para a voz do mentor ler, montado das mesmas partes. */
    function falaLocal(a) {
        var t = a.nota != null ? 'Sua nota neste treino foi ' + String(a.nota).replace('.', ',') + '. ' : '';
        if (a.fortes.length) t += 'O que funcionou: ' + a.fortes.join(' ') + ' ';
        if (a.melhorar.length) {
            t += 'Para a próxima: ' + a.melhorar.map(function (m) { return m.texto; }).join(' ') + ' ';
        }
        return t + 'Continue treinando: é a repetição que transforma a fala.';
    }

    /* =========================================================
       4. FEEDBACK
       ========================================================= */

    function corNota(n) {
        if (n == null) return 'var(--fg-dim)';
        return n >= 8 ? 'var(--ok)' : n >= 6 ? 'var(--acento)' : n >= 4 ? 'var(--alerta)' : 'var(--erro)';
    }

    function anel(n, tam) {
        var pct = n == null ? 0 : n * 10;
        return '<div class="anel' + (tam ? ' anel--' + tam : '') + '" style="--pct:' + pct + ';--cor:' + corNota(n) + '">' +
            '<span>' + (n == null ? '–' : String(n).replace('.', ',')) + '</span></div>';
    }

    function htmlFeedback(id) {
        var item = st.get().historico.filter(function (h) { return h.id === id; })[0];
        if (!item) {
            return '<section class="vazio"><p>Avaliação não encontrada.</p>' +
                '<a class="btn btn--forte" href="#/treinar">Treinar</a></section>';
        }
        var a = item.avaliacao;
        var m = a.medidas || {};
        var h = '<section class="tema-topo tema-topo--mini"><span class="rotulo">' +
            new Date(item.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) +
            ' · ' + esc(NIVEIS[item.nivel || 'intermediario'].nome) + '</span>' +
            '<h1>' + esc(item.tema.titulo) + '</h1></section>';

        if (a.erroIA) h += '<p class="aviso aviso--erro">A avaliação com IA falhou (' + esc(a.erroIA) + '). Esta é a avaliação local.</p>';

        h += '<section class="cartao fb-topo">' + anel(a.nota) +
            '<div><h2>Seu feedback</h2><p>' + esc(a.resumo) + '</p>' +
            (O.voz.disponivel() && a.falado ? '<button class="btn btn--forte" id="ouvir">▶ Ouvir o mentor</button>' +
                '<div class="tempo-barra tempo-barra--fina"><i id="ouvir-barra"></i></div>' : '') +
            '</div></section>';

        if (sessao.gravacao && sessao.idGravacao === id) {
            h += '<section class="cartao"><h2>Sua gravação</h2><audio controls src="' + sessao.gravacao.url + '"></audio>' +
                (a.origem === 'local' && O.ia.pronto(st.cfg()) ? '<button class="btn btn--fraco btn--largo" id="refazer-ia">Avaliar de novo com IA</button>' : '') +
                '</section>';
        }

        h += '<section class="medidas">' +
            medida(mmss(item.segundos), 'duração', item.segundos > item.minutos * 60 * 1.15 ? 'passou do tempo' : 'de ' + mmss(item.minutos * 60)) +
            medida(m.ppm ? m.ppm : '–', 'palavras/min', m.ritmo || 'sem transcrição') +
            medida(totalVicios(a.vicios), 'vícios', m.segundos ? (totalVicios(a.vicios) / (m.segundos / 60)).toFixed(1).replace('.', ',') + ' por minuto' : '') +
            '</section>';

        if (a.fortes && a.fortes.length) {
            h += '<section class="cartao"><h2 class="h-ok">Pontos fortes</h2><ul class="marcadores">' +
                a.fortes.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul></section>';
        }
        if (a.melhorar && a.melhorar.length) {
            h += '<section class="cartao"><h2 class="h-melhorar">O que melhorar</h2><div class="melhorar">' +
                a.melhorar.map(function (x) {
                    return '<div><b>' + esc(x.titulo) + '</b><p>' + esc(x.texto) + '</p></div>';
                }).join('') + '</div></section>';
        }
        h += '<section class="cartao"><h2>Vícios de linguagem</h2>' +
            (a.vicios && a.vicios.length
                ? '<div class="vicios">' + a.vicios.map(function (v) {
                    return '<span class="vicio">' + esc(v.termo) + ' <b>' + v.vezes + '×</b></span>';
                }).join('') + '</div>'
                : '<p class="peq">' + (m.palavras >= 5 || a.origem === 'ia' ? 'Nenhum vício evidente. 👏' : 'Sem transcrição para contar.') + '</p>') +
            '</section>';
        if (a.cobertura && a.cobertura.length) {
            h += '<section class="cartao"><h2>Cobertura do roteiro</h2><ul class="cobertura">' +
                a.cobertura.map(function (c) {
                    return '<li class="' + (c.coberto ? 'is-ok' : 'is-falta') + '">' + esc(c.ponto) + '</li>';
                }).join('') + '</ul></section>';
        }
        if (a.foco) {
            h += '<section class="cartao foco"><h2>Foco do próximo treino</h2><p>' + esc(a.foco) + '</p></section>';
        }
        if (a.transcricao) {
            h += '<details class="cartao"><summary>Transcrição</summary><p class="transcricao">' + esc(a.transcricao) + '</p></details>';
        }
        h += '<div class="acoes-pe">' +
            '<button class="btn btn--forte" id="de-novo">Treinar este tema de novo</button>' +
            '<a class="btn" href="#/treinar" id="novo-tema">Novo tema</a></div>';
        return h;
    }

    function medida(valor, nome, sub) {
        return '<div class="medida"><b>' + esc(valor) + '</b><span>' + esc(nome) + '</span>' +
            (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div>';
    }

    function totalVicios(v) { return (v || []).reduce(function (s, x) { return s + (x.vezes || 0); }, 0); }

    function ligarFeedback(id) {
        var item = st.get().historico.filter(function (h) { return h.id === id; })[0];
        if (!item) return;
        var ouvir = $('ouvir');
        if (ouvir) ouvir.addEventListener('click', function () {
            if (O.voz.ativo()) { O.voz.parar(); return; }
            ouvir.textContent = '■ Parar';
            O.voz.falar(item.avaliacao.falado, st.cfg(), {
                onProgresso: function (p) { var el = $('ouvir-barra'); if (el) el.style.width = p * 100 + '%'; },
                onFim: function () { if ($('ouvir')) $('ouvir').textContent = '▶ Ouvir o mentor'; }
            });
        });
        var b = $('refazer-ia');
        if (b) b.addEventListener('click', function () {
            st.apagar(id);
            ir('roteiro');
            setTimeout(function () { analisar(); }, 0);
        });
        $('de-novo').addEventListener('click', function () {
            descartarGravacao();
            var atual = st.get().atual;
            if (!atual || !atual.roteiro || atual.tema.titulo !== item.tema.titulo) {
                comecar({ titulo: item.tema.titulo, objetivo: '', pontos: [], nivel: item.nivel, origem: item.tema.origem });
                return;
            }
            ir('roteiro');
            setTimeout(function () { var g = $('gravar'); if (g) g.scrollIntoView({ behavior: 'smooth' }); }, 50);
        });
        $('novo-tema').addEventListener('click', function () { descartarGravacao(); st.definirAtual(null); });
    }

    /* =========================================================
       EVOLUÇÃO
       ========================================================= */

    function htmlEvolucao() {
        var hist = st.get().historico;
        if (!hist.length) {
            return '<section class="vazio"><h1>Sua evolução</h1><p>Faça o primeiro treino para começar a ' +
                'acompanhar nota, ritmo e vícios de linguagem ao longo do tempo.</p>' +
                '<a class="btn btn--forte" href="#/treinar">Treinar agora</a></section>';
        }
        var comNota = hist.filter(function (h) { return h.avaliacao && h.avaliacao.nota != null; });
        var notas = comNota.map(function (h) { return h.avaliacao.nota; });
        var media = notas.length ? notas.reduce(function (s, n) { return s + n; }, 0) / notas.length : null;
        var ultimas = notas.slice(-5), anteriores = notas.slice(-10, -5);
        var tendencia = ultimas.length && anteriores.length
            ? med(ultimas) - med(anteriores) : null;

        var vicios = {};
        hist.forEach(function (h) {
            ((h.avaliacao && h.avaliacao.vicios) || []).forEach(function (v) {
                var k = String(v.termo).toLowerCase();
                vicios[k] = (vicios[k] || 0) + (v.vezes || 0);
            });
        });
        var topVicios = Object.keys(vicios).map(function (k) { return { termo: k, vezes: vicios[k] }; })
            .sort(function (a, b) { return b.vezes - a.vezes; }).slice(0, 6);

        var h = '<section class="tema-topo tema-topo--mini"><h1>Sua evolução</h1></section>' +
            '<section class="medidas">' +
            medida(hist.length, hist.length === 1 ? 'treino' : 'treinos', '') +
            medida(media == null ? '–' : media.toFixed(1).replace('.', ','), 'nota média',
                tendencia == null ? '' : (tendencia >= 0 ? '▲ ' : '▼ ') + Math.abs(tendencia).toFixed(1).replace('.', ',') + ' recente') +
            medida(st.sequencia(), 'dias seguidos', '') +
            '</section>';

        if (notas.length >= 2) h += '<section class="cartao"><h2>Notas</h2>' + grafico(comNota.slice(-20)) + '</section>';

        if (topVicios.length) {
            h += '<section class="cartao"><h2>Vícios mais frequentes</h2><div class="vicios">' +
                topVicios.map(function (v) {
                    return '<span class="vicio">' + esc(v.termo) + ' <b>' + v.vezes + '×</b></span>';
                }).join('') + '</div></section>';
        }

        h += '<section class="cartao"><h2>Histórico</h2><ul class="historico">' +
            hist.slice().reverse().map(function (x) {
                return '<li><a href="#/feedback/' + encodeURIComponent(x.id) + '">' + anel(x.avaliacao.nota, 'mini') +
                    '<div><b>' + esc(x.tema.titulo) + '</b><small>' +
                    new Date(x.data).toLocaleDateString('pt-BR') + ' · ' + mmss(x.segundos) + ' · ' +
                    (x.avaliacao.origem === 'ia' ? 'IA' : 'local') + '</small></div><span class="seta">›</span></a></li>';
            }).join('') + '</ul></section>';
        return h;

        function med(l) { return l.reduce(function (s, n) { return s + n; }, 0) / l.length; }
    }

    function grafico(itens) {
        var L = 320, A = 130, m = 18;
        var passo = itens.length > 1 ? (L - m * 2) / (itens.length - 1) : 0;
        var pts = itens.map(function (h, i) {
            return [m + i * passo, A - m - (h.avaliacao.nota / 10) * (A - m * 2)];
        });
        var linha = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
        var area = linha + ' L' + pts[pts.length - 1][0].toFixed(1) + ' ' + (A - m) + ' L' + m + ' ' + (A - m) + ' Z';
        var grade = [0, 5, 10].map(function (n) {
            var y = A - m - (n / 10) * (A - m * 2);
            return '<line x1="' + m + '" x2="' + (L - m) + '" y1="' + y + '" y2="' + y + '" class="g-grade"/>' +
                '<text x="2" y="' + (y + 4) + '" class="g-txt">' + n + '</text>';
        }).join('');
        return '<svg class="grafico" viewBox="0 0 ' + L + ' ' + A + '" role="img" aria-label="Notas dos últimos treinos">' +
            '<defs><linearGradient id="g-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8b5cf6" stop-opacity=".45"/>' +
            '<stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/></linearGradient></defs>' + grade +
            '<path d="' + area + '" fill="url(#g-area)"/><path d="' + linha + '" class="g-linha"/>' +
            pts.map(function (p, i) {
                return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.5" class="g-ponto">' +
                    '<title>' + esc(itens[i].tema.titulo) + ': ' + itens[i].avaliacao.nota + '</title></circle>';
            }).join('') + '</svg>';
    }

    /* =========================================================
       AJUSTES
       ========================================================= */

    function htmlAjustes() {
        var c = st.cfg();
        var vozes = O.voz.lista();
        return '<section class="tema-topo tema-topo--mini"><h1>Ajustes</h1></section>' +
            '<section class="cartao"><h2>Chave gratuita do Gemini</h2>' +
            '<p class="peq">Com ela, a IA cria temas novos, monta roteiros sob medida e <b>ouve sua gravação</b> ' +
            'para avaliar clareza, estrutura, entonação e vícios. É gratuita e não pede cartão:</p>' +
            '<ol class="passos passos--peq"><li>Abra <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a> e entre com sua conta Google.</li>' +
            '<li>Toque em <b>Create API key</b> e copie a chave.</li><li>Cole aqui e toque em Salvar.</li></ol>' +
            '<label class="campo"><span>Chave</span><input id="chave" type="password" autocomplete="off" ' +
            'placeholder="AIza…" value="' + esc(c.chaveGoogle) + '"></label>' +
            '<div class="lado"><button class="btn btn--forte" id="salvar-chave">Salvar e testar</button>' +
            (c.chaveGoogle ? '<button class="btn btn--fraco" id="tirar-chave">Remover</button>' : '') + '</div>' +
            '<p class="peq" id="chave-status"></p>' +
            (c.chaveGoogle ? '<label class="campo"><span>Modelo</span><select id="modelo"><option value="">' +
                esc(c.modeloGoogle || 'gemini-flash-latest (padrão)') + '</option></select></label>' : '') +
            '<p class="peq">A chave fica só neste aparelho. A gravação vai direto do celular para o Google, ' +
            'sem passar por nenhum outro servidor, e não é guardada pelo app.</p></section>' +

            '<section class="cartao"><h2>Voz do mentor</h2>' +
            (O.voz.disponivel()
                ? '<label class="campo"><span>Voz</span><select id="voz">' +
                (vozes.length ? vozes.map(function (v) {
                    return '<option value="' + esc(v.name) + '"' + (v.name === c.voz ? ' selected' : '') + '>' +
                        esc(v.name) + ' (' + esc(v.lang) + ')</option>';
                }).join('') : '<option value="">Padrão do aparelho</option>') + '</select></label>' +
                '<label class="campo"><span>Velocidade: <b id="vel-txt">' + String(c.velocidade).replace('.', ',') + '×</b></span>' +
                '<input id="vel" type="range" min="0.7" max="1.5" step="0.1" value="' + c.velocidade + '"></label>' +
                '<button class="btn btn--fraco" id="testar-voz">▶ Testar a voz</button>'
                : '<p class="peq">Este navegador não tem voz sintetizada. O feedback continua aparecendo por escrito.</p>') +
            '</section>' +

            '<section class="cartao"><h2>Backup</h2><p class="peq">O histórico fica só neste aparelho. ' +
            'Exporte para guardar ou levar para outro celular (a chave não vai junto).</p>' +
            '<div class="lado"><button class="btn" id="exportar">Exportar</button>' +
            '<label class="btn">Importar<input id="importar" type="file" accept="application/json,.json" hidden></label></div>' +
            '<button class="btn btn--perigo btn--largo" id="zerar">Apagar o histórico</button></section>';
    }

    function ligarAjustes() {
        var c = st.cfg();
        var status = $('chave-status');
        $('salvar-chave').addEventListener('click', function () {
            var k = $('chave').value.trim();
            if (!k) { toast('Cole a chave primeiro.'); return; }
            status.textContent = 'Testando a chave…';
            O.ia.testarChave(k).then(function (r) {
                if (!r.ok) { status.textContent = '✗ ' + r.erro; status.className = 'peq txt-erro'; return; }
                var modelo = st.cfg().modeloGoogle;
                if (!modelo || !r.modelos.some(function (m) { return m.id === modelo; })) modelo = r.modelos[0].id;
                st.ajustar({ chaveGoogle: k, modeloGoogle: modelo });
                toast('Chave salva.', 'ok');
                pintar();
                var s = $('chave-status');
                s.textContent = '✓ Chave funcionando' + (r.aviso ? '. ' + r.aviso : '.');
                s.className = 'peq txt-ok';
            });
        });
        var b = $('tirar-chave');
        if (b) b.addEventListener('click', function () { st.ajustar({ chaveGoogle: '', modeloGoogle: '' }); pintar(); });

        var sel = $('modelo');
        if (sel) {
            O.ia.listarModelos(c.chaveGoogle).then(function (lista) {
                sel.innerHTML = lista.map(function (m) {
                    return '<option value="' + esc(m.id) + '"' + (m.id === c.modeloGoogle ? ' selected' : '') + '>' +
                        esc(m.nome) + ' — ' + esc(m.id) + '</option>';
                }).join('');
            }, function () { });
            sel.addEventListener('change', function () { st.ajustar({ modeloGoogle: sel.value }); toast('Modelo trocado.'); });
        }

        sel = $('voz');
        if (sel) sel.addEventListener('change', function () { st.ajustar({ voz: sel.value }); });
        var vel = $('vel');
        if (vel) vel.addEventListener('input', function () {
            st.ajustar({ velocidade: +vel.value });
            $('vel-txt').textContent = String(+vel.value).replace('.', ',') + '×';
        });
        b = $('testar-voz');
        if (b) b.addEventListener('click', function () {
            O.voz.falar('Olá! Eu sou seu mentor de oratória. Vamos treinar?', st.cfg());
        });

        $('exportar').addEventListener('click', function () {
            var blob = new Blob([st.exportar()], { type: 'application/json' });
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'oratoria10x-backup-' + new Date().toISOString().slice(0, 10) + '.json';
            a.click();
            setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
        });
        $('importar').addEventListener('change', function () {
            var f = this.files[0];
            if (!f) return;
            f.text().then(function (t) {
                var n = st.importar(t);
                toast(plural(n, 'treino importado', 'treinos importados') + '.', 'ok');
            }).catch(function (e) { toast(e.message, 'erro'); });
        });
        $('zerar').addEventListener('click', function () {
            if (!confirm('Apagar todo o histórico de treinos deste aparelho? A chave continua salva.')) return;
            st.zerar();
            descartarGravacao();
            toast('Histórico apagado.');
            pintar();
        });
    }

    var TELAS = {
        treinar: { html: htmlTreinar, ligar: ligarTreinar },
        roteiro: { html: htmlRoteiro, ligar: ligarRoteiro },
        feedback: { html: htmlFeedback, ligar: ligarFeedback },
        evolucao: { html: htmlEvolucao },
        ajustes: { html: htmlAjustes, ligar: ligarAjustes }
    };

    function iniciar() {
        window.addEventListener('hashchange', pintar);
        Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'), function (b) {
            b.addEventListener('click', function () { ir(b.getAttribute('data-nav')); });
        });
        /* Um roteiro que estava sendo gerado quando o app fechou não volta
           sozinho: recomeça a geração. */
        var atual = st.get().atual;
        if (atual && !atual.roteiro) {
            if (atual.tema && atual.tema.titulo) gerarRoteiro(); else st.definirAtual(null);
        }
        pintar();
        if ('serviceWorker' in navigator && location.protocol !== 'file:') {
            navigator.serviceWorker.register('sw.js').catch(function () { });
        }
    }

    document.addEventListener('DOMContentLoaded', iniciar);

    return { ir: ir, sessao: sessao, falaLocal: falaLocal };
})();
