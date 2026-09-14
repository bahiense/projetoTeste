/* =========================================================
   TELA ESTUDO — a explicação do capítulo (ou do livro inteiro).

   Sem referência na rota, é a busca mais a estante do que já foi
   gerado. Com referência, é o estudo: o que está guardado, ou o
   pedido novo chegando em tempo real.

   Regra que orienta a tela: gerar custa dinheiro e leva um minuto;
   reler não custa nada. Então tudo que é gerado fica guardado, e o
   app avisa antes de gastar de novo.
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.estudo = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, bib = B.biblia, store = B.store;

    var emCurso = null;     // { abortar, titulo }

    /* ---------- a estante ---------- */

    function render(arg) {
        if (arg) return renderEstudo(arg);

        return '' +
            '<header class="tela-topo">' +
            '<h2>Estudo</h2>' +
            '<p class="tela-sub">Escreva um capítulo (<b>João 3</b>) para a explicação completa, ' +
            'ou só o nome do livro (<b>João</b>) para o panorama do livro inteiro.</p>' +
            '</header>' +

            '<div class="busca">' +
            '<input class="campo" id="busca" type="search" autocomplete="off" ' +
            'placeholder="Gênesis 1, Salmos 23, Romanos…" enterkeyhint="go">' +
            '<div class="sugestoes" id="sugestoes"></div>' +
            '</div>' +

            '<div id="estante"><p class="carregando">Abrindo a estante…</p></div>';
    }

    function renderEstante(lista) {
        if (!lista.length) {
            return '<div class="vazio">' +
                '<div class="vazio-icone">📚</div>' +
                '<p>Nenhum estudo guardado ainda.</p>' +
                '<p class="dica">O primeiro estudo que você gerar fica aqui, e continua ' +
                'disponível mesmo sem internet.</p></div>';
        }
        var caps = lista.filter(function (e) { return e.tipo === 'capitulo'; }).length;
        return '<h3 class="secao">Estante <small>' + lista.length + ' estudo' +
            (lista.length > 1 ? 's' : '') + ' · ' + caps + ' de capítulo</small></h3>' +
            '<div class="estante">' + lista.map(function (e) {
                return '<a class="estudo-item" href="#/estudo/' + encodeURIComponent(e.titulo) + '">' +
                    '<span class="estudo-tipo">' + (e.tipo === 'livro' ? '📕' : '📄') + '</span>' +
                    '<span class="estudo-txt"><b>' + esc(e.titulo) + '</b>' +
                    '<small>' + (e.tipo === 'livro' ? 'panorama do livro' : 'capítulo') +
                    ' · ' + ui.quando(e.criado) +
                    (e.perguntas && e.perguntas.length ? ' · ' + e.perguntas.length + ' pergunta' +
                        (e.perguntas.length > 1 ? 's' : '') : '') +
                    '</small></span>' +
                    '<span class="estudo-seta">›</span></a>';
            }).join('') + '</div>';
    }

    /* ---------- o estudo ---------- */

    function renderEstudo(ref) {
        var alvo = bib.interpretar(ref);
        if (!alvo) {
            return '<header class="tela-topo"><h2>Não encontrei</h2>' +
                '<p class="tela-sub">"' + esc(ref) + '" não bate com nenhum livro da Bíblia.</p></header>' +
                '<p><a class="btn btn--forte" href="#/estudo">Voltar à busca</a></p>';
        }
        var titulo = alvo.livro.nome + (alvo.capitulo ? ' ' + alvo.capitulo : '');
        return '<div id="palco" data-titulo="' + esc(titulo) + '">' +
            '<p class="carregando">Procurando na estante…</p></div>';
    }

    function cabecalhoEstudo(titulo, alvo, guardado) {
        var g = bib.grupo(alvo.livro.grupo);
        var sub = alvo.capitulo
            ? 'Capítulo ' + alvo.capitulo + ' de ' + alvo.livro.caps + ' · ' + g.nome
            : 'Livro inteiro · ' + alvo.livro.caps + ' capítulos · ' + g.nome;
        var lido = alvo.capitulo && store.leu(alvo.livro.nome, alvo.capitulo);

        return '<header class="tela-topo tela-topo--estudo">' +
            '<a class="voltar" href="#/estudo">‹ estudos</a>' +
            '<h2>' + esc(titulo) + '</h2>' +
            '<p class="tela-sub">' + esc(sub) +
            (guardado ? ' · gerado ' + ui.quando(guardado.criado) : '') + '</p>' +
            (alvo.capitulo
                ? '<button class="btn ' + (lido ? 'btn--fraco' : 'btn--forte') + ' btn--largo" data-ler>' +
                (lido ? '✓ já lido — desmarcar' : 'Marcar como lido') + '</button>'
                : '') +
            '</header>';
    }

    /* Tela de antes de gerar: diz o que vai acontecer e quanto custa. */
    function renderPedido(titulo, alvo) {
        var cfg = store.get().config;
        var m = B.ia.MODELOS[cfg.modelo] || B.ia.MODELOS['claude-opus-5'];
        var peloClaude = B.ia.modo() === 'claude';
        var peloGoogle = !peloClaude && cfg.provedor === 'google';
        var temChave = B.ia.pronto(cfg);
        var estimativa = alvo.capitulo ? [0.04, 0.25] : [0.05, 0.30];
        if (cfg.modelo === 'claude-sonnet-5') estimativa = [0.02, 0.12];
        if (cfg.modelo === 'claude-haiku-4-5') estimativa = [0.01, 0.05];

        return cabecalhoEstudo(titulo, alvo, null) +

            '<div class="cartao cartao--pedido">' +
            '<h3>' + (alvo.capitulo ? 'Explicação completa do capítulo' : 'Panorama do livro inteiro') + '</h3>' +
            '<ul class="lista-seta">' +
            (alvo.capitulo
                ? '<li>contexto histórico, cultural e geográfico</li>' +
                '<li>quem é quem e o que está em jogo para cada um</li>' +
                '<li>o capítulo explicado bloco a bloco</li>' +
                '<li>versículos-chave e palavras no ' +
                (alvo.livro.testamento === 'AT' ? 'hebraico' : 'grego') + ' original</li>' +
                '<li>o que dizem teólogos de tradições diferentes</li>' +
                '<li>onde os intérpretes discordam, sem varrer para baixo do tapete</li>' +
                '<li>referências cruzadas e como o texto aponta para Cristo</li>' +
                '<li>aplicação, perguntas para meditar e oração</li>'
                : '<li>autor, data, ocasião e destinatário</li>' +
                '<li>o mundo histórico do livro</li>' +
                '<li>o mapa do livro e o fio da meada do começo ao fim</li>' +
                '<li>personagens, lugares e grandes temas</li>' +
                '<li>palavras-chave no original e passagens famosas</li>' +
                '<li>dificuldades, disputas e o que dizem os teólogos</li>' +
                '<li>Cristo no livro e um roteiro de leitura</li>') +
            '</ul>' +
            (peloClaude
                ? '<p class="dica">Escrito pelo <b>Claude</b>, pelo seu próprio plano — ' +
                'sem chave e sem conta de API. Leva de 1 a 3 minutos. Depois de pronto, ' +
                'fica guardado e reler não consome nada.</p>'
                : peloGoogle
                    ? '<p class="dica">Escrito pelo <b>Gemini</b> (' +
                    esc(cfg.modeloGoogle || 'modelo do Google') + '), pela camada gratuita do ' +
                    'Google: não custa nada, dentro do limite diário. Sem busca na web — as ' +
                    'citações de teólogos saem da memória do modelo, então confira antes de ' +
                    'repassar adiante.</p>'
                    : '<p class="dica">Escrito por ' + esc(m.nome) +
                (cfg.buscaWeb ? ', com busca na web para conferir citações' : '') +
                '. Leva de 1 a 3 minutos e custa mais ou menos US$ ' +
                estimativa[0].toFixed(2) + ' a ' + estimativa[1].toFixed(2) + ' da sua conta da API. ' +
                'Depois de gerado, fica guardado no aparelho e reler não custa nada.</p>') +

            (temChave
                ? '<button class="btn btn--forte btn--largo" data-gerar>Gerar estudo</button>'
                : '<div class="aviso">' +
                '<b>Falta configurar a IA.</b> O estudo é escrito por IA, e o app precisa ' +
                'de uma chave sua para isso. A do <b>Google Gemini</b> é gratuita e sai em ' +
                'dois minutos, sem cartão. <a href="#/config">Configurar agora</a>.' +
                '</div>' +
                '<button class="btn btn--forte btn--largo" data-copiar-prompt>Copiar o pedido pronto</button>' +
                '<p class="dica">Sem chave, dá para copiar o pedido, colar no Claude ou em ' +
                'outro chat de IA, e trazer a resposta de volta com o botão abaixo.</p>') +

            '<button class="btn btn--fraco btn--largo" data-colar>Colar um estudo pronto</button>' +
            '</div>';
    }

    function renderTexto(estudo) {
        var perguntas = (estudo.perguntas || []).map(function (p) {
            return '<div class="pergunta">' +
                '<div class="pergunta-q">' + esc(p.q) + '</div>' +
                '<div class="prosa">' + B.md.render(p.r) + '</div>' +
                '</div>';
        }).join('');

        return '<article class="prosa" id="prosa">' + B.md.render(estudo.texto) + '</article>' +

            (perguntas ? '<h3 class="secao">Suas perguntas</h3>' + perguntas : '') +

            '<div class="cartao cartao--perguntar">' +
            '<label class="rotulo" for="duvida">Ficou com dúvida?</label>' +
            '<textarea class="campo campo--texto" id="duvida" rows="2" ' +
            'placeholder="Por que Paulo cita Habacuque aqui?"></textarea>' +
            '<button class="btn btn--forte btn--largo" data-perguntar>Perguntar sobre este texto</button>' +
            '</div>' +

            '<div class="rodape-estudo">' +
            '<small>' + esc(estudo.modelo || '') +
            (estudo.custo ? ' · US$ ' + estudo.custo.toFixed(3) : '') +
            (estudo.buscas ? ' · ' + estudo.buscas + ' buscas na web' : '') +
            ' · gerado ' + ui.quando(estudo.criado) + '</small>' +
            '<div class="rodape-botoes">' +
            '<button class="btn btn--fraco" data-compartilhar>Compartilhar</button>' +
            '<button class="btn btn--fraco" data-refazer>Refazer</button>' +
            '<button class="btn btn--fraco btn--perigo" data-apagar>Apagar</button>' +
            '</div>' +
            '<p class="dica dica--honesta">Texto escrito por IA. Ele erra — principalmente em ' +
            'citação de teólogo, data e número. Confira no texto bíblico e num comentário de ' +
            'verdade antes de ensinar isto a alguém.</p>' +
            '</div>';
    }

    /* ---------- montagem ---------- */

    function depois(el, arg) {
        if (!arg) return montarEstante(el);
        var palco = ui.$('palco');
        if (!palco) return;
        var titulo = palco.getAttribute('data-titulo');
        var alvo = bib.interpretar(titulo);

        B.estudos.obter(titulo).then(function (guardado) {
            if (guardado) mostrarEstudo(palco, titulo, alvo, guardado);
            else mostrarPedido(palco, titulo, alvo);
        });
    }

    function montarEstante(el) {
        var campo = ui.$('busca');
        var sug = ui.$('sugestoes');

        function pintarSugestoes() {
            var t = campo.value.trim();
            if (!t) { sug.innerHTML = ''; return; }
            var alvo = bib.interpretar(t);
            var lista = bib.sugerir(t.replace(/\s*\d+\s*$/, ''), 6);
            var num = (t.match(/(\d{1,3})\s*$/) || [])[1];

            var html = '';
            if (alvo) {
                var ref = alvo.livro.nome + (alvo.capitulo ? ' ' + alvo.capitulo : '');
                html += item(ref, alvo.capitulo ? 'estudo do capítulo' : 'panorama do livro inteiro', true);
            }
            lista.forEach(function (l) {
                var ref = l.nome + (num && +num <= l.caps ? ' ' + num : '');
                if (alvo && ref === (alvo.livro.nome + (alvo.capitulo ? ' ' + alvo.capitulo : ''))) return;
                html += item(ref, num && +num <= l.caps ? 'capítulo' : l.caps + ' capítulos', false);
            });
            sug.innerHTML = html;
        }

        function item(ref, sub, destaque) {
            return '<a class="sugestao' + (destaque ? ' is-forte' : '') +
                '" href="#/estudo/' + encodeURIComponent(ref) + '">' +
                '<b>' + esc(ref) + '</b><small>' + esc(sub) + '</small></a>';
        }

        campo.addEventListener('input', pintarSugestoes);
        campo.addEventListener('keydown', function (ev) {
            if (ev.key !== 'Enter') return;
            var alvo = bib.interpretar(campo.value);
            if (alvo) B.app.ir('estudo', alvo.livro.nome + (alvo.capitulo ? ' ' + alvo.capitulo : ''));
            else ui.toast('Não reconheci esse livro.', 'aviso');
        });

        B.estudos.listar().then(function (lista) {
            var caixa = ui.$('estante');
            if (caixa) caixa.innerHTML = renderEstante(lista);
        });
    }

    function mostrarPedido(palco, titulo, alvo) {
        palco.innerHTML = renderPedido(titulo, alvo);
        ligarCabecalho(palco, alvo);

        var g = ui.q('[data-gerar]', palco);
        if (g) g.addEventListener('click', function () { gerar(palco, titulo, alvo); });

        var cp = ui.q('[data-copiar-prompt]', palco);
        if (cp) cp.addEventListener('click', function () {
            var p = B.prompts.montar(alvo, configDoMomento());
            ui.copiar(p.sistema + '\n\n---\n\n' + p.usuario).then(function (ok) {
                if (ok) ui.toast('Pedido copiado. Cole no Claude e traga a resposta de volta.');
            });
        });

        var col = ui.q('[data-colar]', palco);
        if (col) col.addEventListener('click', function () { colar(palco, titulo, alvo); });
    }

    function mostrarEstudo(palco, titulo, alvo, estudo) {
        palco.innerHTML = cabecalhoEstudo(titulo, alvo, estudo) + renderTexto(estudo);
        ligarCabecalho(palco, alvo);

        ui.q('[data-compartilhar]', palco).addEventListener('click', function () {
            ui.compartilhar(titulo, '# ' + titulo + '\n\n' + estudo.texto);
        });

        ui.q('[data-refazer]', palco).addEventListener('click', function () {
            ui.confirmar('Refazer o estudo',
                'Isto apaga o estudo atual e gera outro do zero, gastando de novo na sua conta da API. ' +
                'O texto novo será diferente deste.',
                { textoOk: 'Refazer' }).then(function (ok) {
                    if (ok) gerar(palco, titulo, alvo, estudo.perguntas);
                });
        });

        ui.q('[data-apagar]', palco).addEventListener('click', function () {
            ui.confirmar('Apagar estudo', 'Apagar "' + titulo + '" do aparelho? Para ter de volta, ' +
                'seria preciso gerar outra vez.', { textoOk: 'Apagar', perigo: true }).then(function (ok) {
                    if (!ok) return;
                    B.estudos.remover(titulo).then(function () {
                        ui.toast('Estudo apagado.');
                        B.app.ir('estudo');
                    });
                });
        });

        var bp = ui.q('[data-perguntar]', palco);
        bp.addEventListener('click', function () {
            var campo = ui.$('duvida');
            var duvida = (campo.value || '').trim();
            if (!duvida) return ui.toast('Escreva a pergunta primeiro.', 'aviso');
            if (!B.ia.pronto(store.get().config)) {
                return ui.toast('Configure a IA em Ajustes primeiro.', 'aviso');
            }
            perguntar(palco, titulo, alvo, estudo, duvida);
        });
    }

    function ligarCabecalho(palco, alvo) {
        var b = ui.q('[data-ler]', palco);
        if (!b || !alvo.capitulo) return;
        b.addEventListener('click', function () {
            var lido = store.leu(alvo.livro.nome, alvo.capitulo);
            store.marcar(alvo.livro.nome, alvo.capitulo, !lido);
            store.salvar();
            if (!lido) B.plano.atualizarSequencia();
            store.salvar();
            b.textContent = !lido ? '✓ já lido — desmarcar' : 'Marcar como lido';
            b.className = 'btn ' + (!lido ? 'btn--fraco' : 'btn--forte') + ' btn--largo';
            B.app.cabecalho();
            ui.toast(!lido ? 'Marcado como lido.' : 'Desmarcado.');
        });
    }

    /* ---------- geração em tempo real ---------- */

    /* Pelo caminho do Claude da própria página não há busca na web; o
       prompt precisa saber disso para não prometer citação conferida. */
    function configDoMomento() {
        var cfg = store.get().config;
        var semBusca = B.ia.modo() === 'claude' || cfg.provedor === 'google';
        if (!semBusca) return cfg;
        var c = {};
        Object.keys(cfg).forEach(function (k) { c[k] = cfg[k]; });
        c.buscaWeb = false;
        return c;
    }

    function gerar(palco, titulo, alvo, perguntasAntigas) {
        var cfg = configDoMomento();
        var pedido = B.prompts.montar(alvo, cfg);
        var ctrl = new AbortController();
        emCurso = { abortar: function () { ctrl.abort(); }, titulo: titulo };

        palco.innerHTML = cabecalhoEstudo(titulo, alvo, null) +
            '<div class="gerando" id="gerando">' +
            '<div class="gerando-topo">' +
            '<span class="pulso"></span>' +
            '<span id="status">preparando o pedido…</span>' +
            '<button class="btn btn--fraco" data-cancelar>Parar</button>' +
            '</div>' +
            '<div class="gerando-pensa" id="pensa" hidden></div>' +
            '</div>' +
            '<article class="prosa" id="prosa"></article>';

        ligarCabecalho(palco, alvo);
        var status = ui.$('status');
        var pensa = ui.$('pensa');
        var prosa = ui.$('prosa');
        var buscas = 0;
        var ultimoDesenho = 0;
        var pendente = null;

        ui.q('[data-cancelar]', palco).addEventListener('click', function () {
            ctrl.abort();
        });

        function desenhar(texto, agora) {
            var t = Date.now();
            if (!agora && t - ultimoDesenho < 250) {
                clearTimeout(pendente);
                pendente = setTimeout(function () { desenhar(texto, true); }, 250);
                return;
            }
            ultimoDesenho = t;
            prosa.innerHTML = B.md.render(texto);
        }

        B.ia.gerar(pedido, cfg, {
            onInicio: function () { status.textContent = 'pensando…'; },
            onPensando: function (t) {
                if (!t) return;
                pensa.hidden = false;
                pensa.textContent = String(t).slice(-400);
                pensa.scrollTop = pensa.scrollHeight;
            },
            onBusca: function (consulta) {
                buscas++;
                status.textContent = 'buscando: ' + consulta;
            },
            onAviso: function (msg) { ui.toast(msg, 'aviso'); },
            onTexto: function (pedaco, tudo) {
                pensa.hidden = true;
                status.textContent = 'escrevendo… ' + Math.round(tudo.length / 1000) + ' mil caracteres';
                desenhar(tudo);
            }
        }, ctrl.signal).then(function (r) {
            clearTimeout(pendente);
            emCurso = null;
            var estudo = {
                titulo: titulo, tipo: alvo.capitulo ? 'capitulo' : 'livro',
                livro: alvo.livro.nome, cap: alvo.capitulo || null,
                texto: r.texto, modelo: r.modelo, custo: r.custo,
                buscas: buscas, perguntas: perguntasAntigas || [],
                criado: new Date().toISOString()
            };
            return B.estudos.salvar(estudo).then(function () {
                mostrarEstudo(palco, titulo, alvo, estudo);
                ui.toast('Estudo pronto e guardado no aparelho.');
            });
        }).catch(function (err) {
            clearTimeout(pendente);
            emCurso = null;
            if (err && err.name === 'AbortError') {
                var texto = prosa.textContent || '';
                ui.$('gerando').innerHTML = '<p class="dica">Geração interrompida' +
                    (texto.length > 400 ? '. O pedaço abaixo não foi guardado.' : '.') + '</p>';
                var b = document.createElement('button');
                b.className = 'btn btn--forte btn--largo';
                b.textContent = 'Tentar de novo';
                b.onclick = function () { gerar(palco, titulo, alvo, perguntasAntigas); };
                ui.$('gerando').appendChild(b);
                return;
            }
            mostrarErro(palco, titulo, alvo, err, function () { gerar(palco, titulo, alvo, perguntasAntigas); });
        });
    }

    function mostrarErro(palco, titulo, alvo, err, tentarDeNovo) {
        var g = ui.$('gerando');
        var html = '<div class="aviso aviso--erro"><b>Não deu certo.</b><br>' +
            esc(err && err.message ? err.message : 'Erro desconhecido.') + '</div>';
        if (g) g.innerHTML = html; else palco.insertAdjacentHTML('beforeend', html);

        var caixa = g || palco;
        var b = document.createElement('button');
        b.className = 'btn btn--forte btn--largo';
        b.textContent = 'Tentar de novo';
        b.onclick = tentarDeNovo;
        caixa.appendChild(b);

        if (err && err.fatal) {
            var c = document.createElement('a');
            c.className = 'btn btn--fraco btn--largo';
            c.href = '#/config';
            c.textContent = 'Abrir ajustes';
            caixa.appendChild(c);
        }
    }

    function perguntar(palco, titulo, alvo, estudo, duvida) {
        var cfg = configDoMomento();
        var pedido = B.prompts.pergunta(titulo, estudo.texto, duvida, cfg);
        var ctrl = new AbortController();

        var caixa = ui.q('.cartao--perguntar', palco);
        caixa.innerHTML = '<div class="gerando-topo"><span class="pulso"></span>' +
            '<span id="status2">pensando na sua pergunta…</span></div>' +
            '<div class="prosa" id="resposta"></div>';

        var resposta = ui.$('resposta');
        B.ia.gerar(pedido, cfg, {
            onTexto: function (p, tudo) { resposta.innerHTML = B.md.render(tudo); },
            onBusca: function (c) { ui.$('status2').textContent = 'buscando: ' + c; }
        }, ctrl.signal).then(function (r) {
            estudo.perguntas = (estudo.perguntas || []).concat([{ q: duvida, r: r.texto }]);
            return B.estudos.salvar(estudo).then(function () {
                mostrarEstudo(palco, titulo, alvo, estudo);
                var alvoEl = ui.qq('.pergunta', palco).pop();
                if (alvoEl) alvoEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }).catch(function (err) {
            caixa.innerHTML = '<div class="aviso aviso--erro">' +
                esc(err && err.message ? err.message : 'Erro.') + '</div>';
        });
    }

    /* Traz de fora um estudo que a pessoa gerou em outro lugar. */
    function colar(palco, titulo, alvo) {
        ui.modal({
            titulo: 'Colar estudo pronto',
            html: '<p class="dica">Cole aqui o texto que você gerou em outro lugar (Claude, ' +
                'ChatGPT, um comentário que você escreveu). Ele fica guardado como o estudo ' +
                'de <b>' + esc(titulo) + '</b>, com markdown e tudo.</p>' +
                '<textarea class="campo campo--texto" id="colado" rows="10" ' +
                'placeholder="## João 3&#10;..."></textarea>',
            textoOk: 'Guardar'
        }).then(function (ok) {
            if (!ok) return;
            var t = (ui.$('colado').value || '').trim();
            if (t.length < 50) return ui.toast('Texto curto demais para ser um estudo.', 'aviso');
            var estudo = {
                titulo: titulo, tipo: alvo.capitulo ? 'capitulo' : 'livro',
                livro: alvo.livro.nome, cap: alvo.capitulo || null,
                texto: t, modelo: 'colado à mão', custo: 0, perguntas: [],
                criado: new Date().toISOString()
            };
            B.estudos.salvar(estudo).then(function () {
                mostrarEstudo(palco, titulo, alvo, estudo);
                ui.toast('Guardado.');
            });
        });
    }

    /* Sair da tela no meio de uma geração: corta o pedido em vez de
       deixá-lo correndo (e sendo cobrado) sem ninguém para ler. */
    function abortar() {
        if (!emCurso) return;
        emCurso.abortar();
        emCurso = null;
    }

    return { render: render, depois: depois, abortar: abortar };
})();
