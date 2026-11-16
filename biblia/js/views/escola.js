/* =========================================================
   TELA ESCOLA DE ORAÇÃO.

   Quatro lugares numa tela só:

   - o cartão de condução, que é o treino de orar em público;
   - as orações da Bíblia, para ler, ouvir e imitar;
   - as frases em revisão espaçada, para ter o que dizer sem procurar;
   - a porta para os jogos das orações, que é onde elas ficam de cor.

   O cartão tem tela própria (#/escola/cartao) por um motivo prático:
   quem está de pé, na frente de gente, precisa de cinco linhas grandes
   e nada em volta. Tela cheia de botões é tela que se lê — e oração
   lida em voz alta soa como circular de condomínio.
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.escola = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, escola = B.escola;

    var usoAtual = '';          // filtro das orações, só nesta sessão de tela

    /* ---------- a tela ---------- */

    function render(arg) {
        if (arg === 'cartao') return renderCartao();
        if (arg === 'decorar') return renderDecorar();
        if (arg && arg.indexOf('treino/') === 0) return renderTreino(arg.slice(7));
        if (arg) return renderOracao(arg);
        return renderPainel();
    }

    function renderPainel() {
        var r = escola.resumo();
        var pronto = escola.cartaoPronto();
        var sugestao = escola.sugestaoTreino();
        var volta = escola.proximaVolta();
        if (volta) volta = volta.split('-').reverse().join('/');

        return '<header class="tela-topo">' +
            '<h2>Escola de oração</h2>' +
            '<p class="tela-sub">Para orar em público sem travar: ' + r.oracoes +
            ' orações da própria Bíblia, ' + r.frases + ' frases para decorar e um ' +
            'cartão de cinco linhas para levar na mão.</p>' +
            '</header>' +

            /* O cartão primeiro: é o que se usa na reunião de hoje. */
            '<section class="cartao">' +
            '<h3>O seu cartão</h3>' +
            (pronto.length
                ? '<ol class="cartao-fiada">' + pronto.map(function (p) {
                    return '<li><b>' + esc(p.movimento ? p.movimento.nome : '') + '</b> ' +
                        '<span class="dica">' + esc(p.onde) + '</span></li>';
                }).join('') + '</ol>' +
                '<div class="grupo-botoes grupo-botoes--dois">' +
                '<a class="btn btn--forte" href="#/escola/cartao">🙏 Orar com o cartão</a>' +
                '<button class="btn btn--fraco" id="cartao-limpar">Limpar</button>' +
                '</div>'
                : '<p class="dica">Vazio. Escolha abaixo uma frase de cada movimento: ' +
                'o cartão sai com letra grande, para orar olhando de relance.</p>') +
            '</section>' +

            '<section class="cartao">' +
            '<h3>Montar a oração</h3>' +
            '<p class="dica">Os cinco movimentos de uma oração pública, na ordem em que ' +
            'funcionam. As frases são bíblicas, com a referência ao lado — tocar numa ' +
            'põe no cartão e troca a que estava naquele movimento.</p>' +
            escola.movimentos().map(function (m) {
                return '<details class="detalhe" data-mov="' + esc(m.id) + '">' +
                    '<summary>' + esc(m.nome) + '</summary>' +
                    '<p class="dica">' + esc(m.dica) + '</p>' +
                    '<div class="frases">' +
                    escola.frases(m.id).map(function (f) {
                        return '<button class="frase' + (escola.noCartao(f.ref) ? ' is-on' : '') +
                            '" data-frase="' + esc(f.ref) + '">' +
                            '<span class="frase-onde">' + esc(f.onde) + '</span>' +
                            '<span class="frase-texto" data-texto-de="' + esc(f.ref) + '">' +
                            '…</span></button>';
                    }).join('') +
                    '</div></details>';
            }).join('') +
            '</section>' +

            '<section class="cartao">' +
            '<h3>Decorar uma oração</h3>' +
            '<p class="dica">O treino trabalha as palavras: põe os versículos em ordem e ' +
            'esconde palavras para você completar. Tudo com o texto do app — nada de ' +
            'adivinhar rótulo.</p>' +
            (r.treinando
                ? '<p>' + r.treinando + ' em treino' +
                  (r.treinoFirmes ? ', ' + r.treinoFirmes + ' firme' +
                      (r.treinoFirmes > 1 ? 's' : '') : '') + '. ' +
                  (r.treinoHoje
                    ? '<b>' + r.treinoHoje + ' para hoje.</b>'
                    : 'Nenhuma vence hoje' + (volta ? ' — a próxima volta ' + esc(volta) : '') +
                      '.') + '</p>' +
                  '<div class="orar-lista">' +
                  (r.treinoHoje ? escola.oracoesParaHoje() : []).map(function (x) {
                      return '<a class="orar-item" href="#/escola/treino/' +
                          encodeURIComponent(x.id) + '">' +
                          '<span class="orar-item-txt"><b>' + esc(x.titulo) + '</b>' +
                          '<small>' + esc(x.onde) +
                          (x.atrasado ? ' · atrasada' : '') + '</small></span>' +
                          '<span class="estudo-seta">›</span></a>';
                  }).join('') + '</div>'
                : '') +
            /* A sugestão muda: a que vence hoje, senão uma que você ainda
               não treinou. Botão fixo numa oração só vira conselho ruim
               na segunda semana. */
            (sugestao
                ? '<a class="btn btn--' + (r.treinoHoje ? 'forte' : 'fraco') +
                  ' btn--largo" href="#/escola/treino/' + encodeURIComponent(sugestao.id) +
                  '">🎯 Treinar ' + esc(sugestao.titulo) + '</a>' +
                  '<p class="dica">' + esc(sugestao.motivo) +
                  ' · ou escolha outra na lista das orações da Bíblia, aqui embaixo.</p>'
                : '') +
            '</section>' +

            '<section class="cartao">' +
            '<h3>Decorar as frases</h3>' +
            (r.decorando
                ? '<p>' + r.decorando + ' em decoração' +
                  (r.firmes ? ', ' + r.firmes + ' já firme' + (r.firmes > 1 ? 's' : '') : '') +
                  '. ' + (r.hoje
                    ? '<b>' + r.hoje + ' para hoje.</b>'
                    : 'Nenhuma vence hoje.') + '</p>' +
                  '<a class="btn btn--' + (r.hoje ? 'forte' : 'fraco') +
                  ' btn--largo" href="#/escola/decorar">' +
                  (r.hoje ? 'Revisar agora' : 'Ver a fila') + '</a>'
                : '<p class="dica">Nenhuma frase em decoração ainda. Em cada frase lá em ' +
                  'cima há um botão para pôr na fila: ela volta em 1, 7 e 30 dias — que é ' +
                  'o que faz a frase estar disponível quando você precisa dela de pé.</p>') +
            '</section>' +

            '<section class="cartao">' +
            '<h3>As orações dos estudos</h3>' +
            '<p class="dica">Estas são escritas por IA a partir do capítulo — e por isso ' +
            'ficam separadas das da Bíblia. Dá para treiná-las do mesmo jeito: pôr as ' +
            'frases em ordem e completar.</p>' +
            '<div id="escola-estudos"></div>' +
            '<a class="btn btn--fraco btn--largo" href="#/orar">🙏 Todas as orações dos ' +
            'estudos</a>' +
            '</section>' +

            '<section class="cartao">' +
            '<h3>As orações da Bíblia</h3>' +
            '<p class="dica">Texto de verdade, lido da edição que você está usando no app. ' +
            'Toque para abrir, ouvir e ler a nota.</p>' +
            '<div class="ferr-grupo" id="escola-usos">' +
            '<button class="btn btn--mini' + (usoAtual ? '' : ' is-on') +
            '" data-uso="">Todas</button>' +
            escola.usos().map(function (u) {
                return '<button class="btn btn--mini' + (usoAtual === u.id ? ' is-on' : '') +
                    '" data-uso="' + esc(u.id) + '">' + esc(u.nome) + '</button>';
            }).join('') +
            '</div>' +
            '<div id="escola-lista"></div>' +
            '</section>' +

            '<section class="cartao">' +
            '<p class="dica">' + esc(escola.CREDITO) + '</p>' +
            '<p class="dica">As orações que fecham cada estudo são outra coisa: escritas ' +
            'por IA a partir do capítulo, e ficam em <a href="#/orar">Orações</a>. Para ' +
            'aprender a orar, o modelo aqui é a Escritura.</p>' +
            '</section>';
    }

    /* ---------- o cartão, em tela cheia ---------- */

    function renderCartao() {
        var pronto = escola.cartaoPronto();
        if (!pronto.length) {
            return '<header class="tela-topo"><a class="voltar" href="#/escola">‹ escola</a>' +
                '<h2>Cartão vazio</h2></header>' +
                '<p>Escolha uma frase de cada movimento na escola de oração.</p>' +
                '<a class="btn btn--forte" href="#/escola">Voltar</a>';
        }
        return '<header class="tela-topo tela-topo--orar">' +
            '<a class="voltar" href="#/escola">‹ escola</a>' +
            '<p class="olho">Cartão de condução</p>' +
            '</header>' +
            '<div id="cartao-corpo"><p class="carregando">Abrindo…</p></div>' +
            '<div class="grupo-botoes grupo-botoes--dois orar-pe">' +
            '<button class="btn btn--fraco" id="cartao-crono">⏱ 90 segundos</button>' +
            (B.audio && B.audio.disponivel()
                ? '<button class="btn btn--fraco" id="cartao-ouvir">🔊 Ouvir</button>'
                : '<a class="btn btn--fraco" href="#/escola">Trocar as frases</a>') +
            '</div>';
    }

    /* ---------- uma oração ---------- */

    function renderOracao(id) {
        var o = escola.oracao(id);
        if (!o) {
            return '<header class="tela-topo"><a class="voltar" href="#/escola">‹ escola</a>' +
                '<h2>Não encontrei</h2></header>';
        }
        var alvo = escola.alvoDe(o.ref);
        var ref = alvo ? alvo.livro.nome + ' ' + alvo.capitulo : '';
        return '<header class="tela-topo tela-topo--orar">' +
            '<a class="voltar" href="#/escola">‹ escola</a>' +
            '<p class="olho">' + esc(o.quem) + '</p>' +
            '<h2>' + esc(o.titulo) + '</h2>' +
            '<p class="tela-sub">' + esc(o.onde) + '</p>' +
            '</header>' +
            (o.nota ? '<p class="escola-nota">' + esc(o.nota) + '</p>' : '') +
            '<div id="oracao-corpo"><p class="carregando">Abrindo a oração…</p></div>' +
            '<div class="grupo-botoes grupo-botoes--dois orar-pe">' +
            (B.audio && B.audio.disponivel()
                ? '<button class="btn btn--fraco" id="oracao-ouvir" ' +
                  'data-ref="' + esc(o.ref) + '">🔊 Ouvir e repetir</button>'
                : '') +
            '<a class="btn btn--forte" href="#/escola/treino/' +
            encodeURIComponent(o.id) + '">🎯 Decorar de cor</a>' +
            '</div>' +
            (ref ? '<div class="grupo-botoes orar-pe">' +
                '<a class="btn btn--fraco btn--largo" href="#/ler/' +
                encodeURIComponent(ref) + '">📖 No capítulo</a></div>' : '');
    }

    /* ---------- treinar uma oração de cor ---------- */

    function renderTreino(id) {
        var daIA = escola.ehDeEstudo(id);
        var o = escola.oracao(id);
        if (!o && !daIA) {
            return '<header class="tela-topo"><a class="voltar" href="#/escola">‹ escola</a>' +
                '<h2>Não encontrei esta oração</h2></header>';
        }
        var ref = daIA ? id.slice(escola.ESTUDO.length) : '';
        return '<header class="tela-topo">' +
            '<a class="voltar" href="' +
            (daIA ? '#/orar/' + encodeURIComponent(ref) : '#/escola/' + encodeURIComponent(id)) +
            '">‹ a oração</a>' +
            '<p class="olho">Decorar de cor</p>' +
            '<h2>' + esc(daIA ? 'Oração de ' + ref : o.titulo) + '</h2>' +
            '<p class="tela-sub">' +
            (daIA
                ? esc(ref) + ' · ' + esc(B.oracoes.AVISO)
                : esc(o.onde) + ' · o texto é o do app, e é com ele que o treino trabalha.') +
            '</p></header>' +
            '<div id="treino-corpo"><p class="carregando">Montando o treino…</p></div>';
    }

    function depoisTreino(el, id) {
        var vao = ui.$('treino-corpo');
        if (!vao) return;

        escola.trechoTreino(id).then(function (t) {
            if (!t.versiculos.length) {
                vao.innerHTML = '<section class="cartao"><p class="dica">Não deu para ' +
                    'carregar o texto desta oração. Na tela de leitura, abra o capítulo ' +
                    'uma vez e volte.</p></section>';
                return;
            }
            var acertos = 0, erros = 0;
            /* Oração de um ou dois versículos não dá para pôr em ordem:
               aí o treino é só de lacunas, e isso é dito. */
            if (t.versiculos.length >= 3) ordem(t); else lacunas(t);

            function ordem(t) {
                var certa = t.versiculos.map(function (v) { return v.n; });
                var faltam = escola.embaralhar(t.versiculos.slice());
                var postos = [];

                function pintar() {
                    vao.innerHTML = '<section class="cartao">' +
                        '<p class="olho">1 de 2 · pôr em ordem</p>' +
                        '<p class="dica">Toque ' +
                        (t.oracao.ia ? 'nas frases' : 'nos versículos') +
                        ' na ordem da oração. Diga cada uma em voz alta antes de ' +
                        'tocar.</p>' +
                        '<ol class="treino-postos">' +
                        (postos.length
                            ? postos.map(function (v) {
                                return '<li><span class="n">' + v.n + '</span> ' +
                                    esc(v.t) + '</li>';
                            }).join('')
                            : '<li class="treino-vazio">—</li>') +
                        '</ol>' +
                        '<div class="treino-pecas">' +
                        faltam.map(function (v, i) {
                            return '<button class="frase" data-peca="' + i + '">' +
                                esc(v.t) + '</button>';
                        }).join('') +
                        '</div>' +
                        '</section>';
                }
                pintar();

                vao.addEventListener('click', function (ev) {
                    var b = ev.target.closest ? ev.target.closest('[data-peca]') : null;
                    if (!b) return;
                    var i = parseInt(b.getAttribute('data-peca'), 10);
                    var v = faltam[i];
                    if (v.n === certa[postos.length]) {
                        postos.push(v);
                        faltam.splice(i, 1);
                        acertos++;
                        if (!faltam.length) {
                            ui.toast('Ordem certa.');
                            setTimeout(function () { lacunas(t); }, 400);
                            return;
                        }
                        pintar();
                    } else {
                        erros++;
                        b.classList.add('is-erro');
                        setTimeout(function () { b.classList.remove('is-erro'); }, 500);
                        ui.toast('Não é esse. O próximo é ' +
                            (t.oracao.ia ? 'a frase ' : 'o versículo ') +
                            certa[postos.length] + '.');
                    }
                });
            }

            function lacunas(t) {
                var perguntas = escola.lacunas(t.versiculos);
                if (!perguntas.length) return fim();
                var i = 0;

                function uma() {
                    if (i >= perguntas.length) return fim();
                    var q = perguntas[i];
                    vao.innerHTML = '<section class="cartao">' +
                        '<p class="olho">2 de 2 · completar · ' + (i + 1) + ' de ' +
                        perguntas.length + '</p>' +
                        '<p class="treino-frase">' + esc(q.frase) + '</p>' +
                        '<p class="dica">' + (t.oracao.ia ? 'Frase ' : 'Versículo ') +
                        q.n + '</p>' +
                        '<div class="treino-opcoes">' +
                        q.opcoes.map(function (op) {
                            return '<button class="btn btn--fraco" data-op="' + esc(op) +
                                '">' + esc(op) + '</button>';
                        }).join('') +
                        '</div></section>';

                    ui.qq('[data-op]', vao).forEach(function (b) {
                        b.addEventListener('click', function () {
                            if (b.getAttribute('data-op') === q.certa) {
                                acertos++;
                                b.classList.add('is-on');
                                ui.toast('Isso.');
                            } else {
                                erros++;
                                b.classList.add('is-erro');
                                ui.toast('Era "' + q.certa + '".');
                            }
                            i++;
                            setTimeout(uma, 500);
                        });
                    });
                }
                uma();
            }

            function fim() {
                /* O juízo é da pessoa, não do placar: acertar a lacuna não
                   é saber a oração de cor, e o app não finge que é. */
                var bem = erros === 0;
                vao.innerHTML = '<section class="cartao">' +
                    '<h3>' + (bem ? '✓ Sem erro nenhum.' : 'Fim do treino.') + '</h3>' +
                    '<p>' + acertos + ' acerto' + (acertos === 1 ? '' : 's') +
                    (erros ? ', ' + erros + ' erro' + (erros === 1 ? '' : 's') : '') + '.</p>' +
                    '<p class="dica">Você consegue orar esta oração agora, sem olhar?</p>' +
                    '<div class="grupo-botoes grupo-botoes--dois">' +
                    '<button class="btn btn--fraco" data-juizo="erro">Ainda não</button>' +
                    '<button class="btn btn--forte" data-juizo="certo">Consigo</button>' +
                    '</div>' +
                    '<a class="btn btn--fraco btn--largo" href="#/escola/treino/' +
                    encodeURIComponent(id) + '">Treinar nesta oração outra vez</a>' +
                    '</section>';

                ui.qq('[data-juizo]', vao).forEach(function (b) {
                    b.addEventListener('click', function () {
                        var certo = b.getAttribute('data-juizo') === 'certo';
                        escola.feitoOracao(id, certo);
                        ui.toast(certo
                            ? 'Volta em ' + escola.PASSOS[escola.filaOracoes()[id].passo] +
                              ' dia(s), para ver se ficou.'
                            : 'Volta amanhã.');
                        location.hash = '#/escola';
                    });
                });
            }
        }, function (erro) {
            vao.innerHTML = '<section class="cartao"><p class="dica">Não deu para montar ' +
                'o treino: ' + esc(erro && erro.message ? erro.message
                    : 'o texto não está no aparelho ainda') + '.</p>' +
                '<a class="btn btn--fraco btn--largo" href="#/escola">Voltar</a></section>';
        });
    }

    /* ---------- a revisão das frases ---------- */

    function renderDecorar() {
        var fila = escola.paraHoje();
        var todas = escola.fila();
        return '<header class="tela-topo">' +
            '<a class="voltar" href="#/escola">‹ escola</a>' +
            '<h2>Decorar as frases</h2>' +
            '<p class="tela-sub">' +
            (fila.length
                ? fila.length + ' para hoje. Diga a frase em voz alta antes de abrir.'
                : 'Nada vence hoje. ' + Object.keys(todas).length + ' na fila.') +
            '</p></header>' +
            '<div id="decorar-corpo"></div>';
    }

    /* ---------- depois ---------- */

    function depois(el, arg) {
        if (arg === 'cartao') return depoisCartao(el);
        if (arg === 'decorar') return depoisDecorar(el);
        if (arg && arg.indexOf('treino/') === 0) return depoisTreino(el, arg.slice(7));
        if (arg) return depoisOracao(el, arg);
        return depoisPainel(el);
    }

    /* Mostra o texto de cada frase dentro do próprio botão. */
    function encherFrases(raiz) {
        ui.qq('[data-texto-de]', raiz).forEach(function (vao) {
            var ref = vao.getAttribute('data-texto-de');
            escola.texto(ref).then(function (r) {
                vao.textContent = r.versiculos.map(function (v) { return v.t; }).join(' ');
            }, function () { vao.textContent = '(não deu para carregar o texto)'; });
        });
    }

    function depoisPainel(el) {
        encherFrases(el);
        pintarLista();
        pintarEstudos();

        var limpar = ui.$('cartao-limpar');
        if (limpar) limpar.addEventListener('click', function () {
            escola.limparCartao();
            B.app.pintar();
        });

        var usos = ui.$('escola-usos');
        if (usos) usos.addEventListener('click', function (ev) {
            var b = ev.target.closest ? ev.target.closest('[data-uso]') : null;
            if (!b) return;
            usoAtual = b.getAttribute('data-uso');
            ui.qq('[data-uso]', usos).forEach(function (o) {
                o.classList.toggle('is-on', o === b);
            });
            pintarLista();
        });

        el.addEventListener('click', function (ev) {
            var f = ev.target.closest ? ev.target.closest('[data-frase]') : null;
            if (!f) return;
            var ref = f.getAttribute('data-frase');
            escola.trocarFrase(ref);
            /* Repinta só o que mudou: o <details> aberto fica aberto. */
            ui.qq('[data-frase]', el).forEach(function (b) {
                b.classList.toggle('is-on', escola.noCartao(b.getAttribute('data-frase')));
            });
            ui.toast(escola.noCartao(ref)
                ? 'No cartão. ' + (escola.naFila(ref) ? '' : 'Toque e segure para decorar.')
                : 'Fora do cartão.');
        });

        /* Segurar a frase põe (ou tira) da fila de decoração. */
        var segurando = null;
        el.addEventListener('pointerdown', function (ev) {
            var f = ev.target.closest ? ev.target.closest('[data-frase]') : null;
            if (!f) return;
            segurando = setTimeout(function () {
                segurando = null;
                var ref = f.getAttribute('data-frase');
                if (escola.naFila(ref)) {
                    escola.esquecer(ref);
                    ui.toast('Fora da fila de decoração.');
                } else {
                    escola.decorar(ref);
                    ui.toast('Na fila: volta amanhã, em 7 e em 30 dias.');
                }
            }, 550);
        });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (nome) {
            el.addEventListener(nome, function () {
                if (segurando) { clearTimeout(segurando); segurando = null; }
            });
        });
    }

    /*
     * As orações dos estudos que valem a pena treinar: as que a pessoa
     * guardou e, enquanto não houver nenhuma, os capítulos lidos hoje —
     * que é onde ela está de fato.
     */
    function pintarEstudos() {
        var vao = ui.$('escola-estudos');
        if (!vao || !B.oracoes) return;

        var refs = B.oracoes.guardadas();
        var deHoje = [];
        if (!refs.length && B.plano && B.biblia.GRUPOS) {
            B.biblia.GRUPOS.forEach(function (g) {
                B.plano.lidosHoje(g.id).forEach(function (h) { deHoje.push(h.ref); });
            });
            refs = deHoje;
        }
        refs = refs.slice(0, 6);

        if (!refs.length) {
            vao.innerHTML = '<p class="dica">Nenhuma guardada ainda, e nada lido hoje. ' +
                'Guarde uma oração na tela de Orações e ela aparece aqui para treinar.</p>';
            return;
        }

        /* Só entra na lista o capítulo que tem oração de verdade: botão
           que abre em "este capítulo ainda não tem oração" é promessa
           que o app não cumpre. */
        Promise.all(refs.map(function (ref) {
            return B.oracoes.doCapitulo(ref).then(function (t) {
                return t ? ref : null;
            }, function () { return null; });
        })).then(function (bons) {
            bons = bons.filter(function (r) { return !!r; });
            vao.innerHTML = bons.length
                ? '<div class="orar-lista">' + bons.map(function (ref) {
                    var id = B.escola.ESTUDO + ref;
                    return '<a class="orar-item" href="#/escola/treino/' +
                        encodeURIComponent(id) + '">' +
                        '<span class="orar-item-txt"><b>Oração de ' + esc(ref) + '</b>' +
                        '<small>escrita por IA · ' +
                        (escola.naFilaOracao(id) ? 'em treino' : 'treinar de cor') +
                        '</small></span>' +
                        '<span class="estudo-seta">›</span></a>';
                }).join('') + '</div>'
                : '<p class="dica">Os capítulos de hoje ainda não têm oração: ela vem no ' +
                  'estudo completo.</p>';
        });
    }

    function pintarLista() {
        var vao = ui.$('escola-lista');
        if (!vao) return;
        var lista = escola.porUso(usoAtual);
        vao.innerHTML = lista.length
            ? '<div class="orar-lista">' + lista.map(function (o) {
                return '<a class="orar-item" href="#/escola/' + encodeURIComponent(o.id) + '">' +
                    '<span class="orar-item-txt"><b>' + esc(o.titulo) + '</b>' +
                    '<small>' + esc(o.quem) + ' · ' + esc(o.onde) + '</small></span>' +
                    '<span class="estudo-seta">›</span></a>';
            }).join('') + '</div>'
            : '<p class="dica">Nenhuma oração marcada para esta ocasião.</p>';
    }

    /* ---------- uma oração: texto e voz ---------- */

    function mostrarTexto(vao, ref, classe) {
        return escola.texto(ref).then(function (r) {
            vao.innerHTML = '<div class="' + classe + '">' +
                r.versiculos.map(function (v) {
                    return '<p class="v-oracao" data-v="' + v.n + '">' +
                        '<span class="n">' + v.n + '</span> ' + esc(v.t) + '</p>';
                }).join('') +
                '</div>' +
                '<p class="dica">' + esc(r.alvo.onde) + ' · texto: ' +
                esc(r.edicao ? r.edicao.curto || r.edicao.nome : '') +
                (r.reserva ? ' (a edição que você carregou não traz este livro)' : '') +
                '</p>';
            return r;
        }, function () {
            vao.innerHTML = '<p class="dica">Não deu para carregar o texto. ' +
                'Na tela de leitura, baixe o livro e volte.</p>';
            return null;
        });
    }

    function ligarVoz(botao, vao, pegarTextos) {
        if (!botao || !B.audio || !B.audio.disponivel()) return;
        botao.addEventListener('click', function () {
            if (B.audio.estado().lendo) {
                B.audio.parar();
                botao.textContent = '🔊 Ouvir';
                return;
            }
            var textos = pegarTextos();
            if (!textos.length) return;
            botao.textContent = '⏹ Parar';
            B.audio.ler(textos, function (i) {
                var linhas = ui.qq('.v-oracao, .cartao-linha', vao);
                linhas.forEach(function (el, n) { el.classList.toggle('is-lendo', n === i); });
                if (linhas[i]) linhas[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, function () {
                botao.textContent = '🔊 Ouvir';
                ui.qq('.is-lendo', vao).forEach(function (el) {
                    el.classList.remove('is-lendo');
                });
            }, 0);
        });

        /* Sair da tela cala a voz, como na leitura. */
        if (!ligarVoz.ouvindo) {
            ligarVoz.ouvindo = true;
            window.addEventListener('hashchange', function () {
                if (B.audio.estado().lendo) B.audio.parar();
            });
        }
    }

    function depoisOracao(el, id) {
        var o = escola.oracao(id);
        var vao = ui.$('oracao-corpo');
        if (!o || !vao) return;
        var textos = [];
        mostrarTexto(vao, o.ref, 'oracao-texto').then(function (r) {
            if (r) textos = r.versiculos.map(function (v) { return v.t; });
        });
        ligarVoz(ui.$('oracao-ouvir'), vao, function () { return textos; });
    }

    /* ---------- o cartão em tela cheia ---------- */

    function depoisCartao(el) {
        var vao = ui.$('cartao-corpo');
        if (!vao) return;
        var pronto = escola.cartaoPronto();
        if (!pronto.length) return;

        var textos = [];
        Promise.all(pronto.map(function (p) {
            return escola.texto(p.ref).then(function (r) {
                return {
                    movimento: p.movimento, onde: p.onde,
                    texto: r.versiculos.map(function (v) { return v.t; }).join(' ')
                };
            }, function () { return null; });
        })).then(function (linhas) {
            linhas = linhas.filter(function (l) { return !!l; });
            textos = linhas.map(function (l) { return l.texto; });
            vao.innerHTML = linhas.map(function (l) {
                return '<div class="cartao-linha">' +
                    '<p class="olho">' + esc(l.movimento ? l.movimento.nome : '') + '</p>' +
                    '<p class="cartao-frase">' + esc(l.texto) + '</p>' +
                    '<p class="dica">' + esc(l.onde) + '</p>' +
                    '</div>';
            }).join('') +
                '<p class="dica cartao-aviso">Não leia: olhe de relance e ore com as suas ' +
                'palavras. A frase bíblica é o trilho, não o texto.</p>';
        });

        ligarVoz(ui.$('cartao-ouvir'), vao, function () { return textos; });

        /*
         * O cronômetro existe porque oração pública longa vira sermão —
         * e quem está aprendendo não sente o tempo passar. Noventa
         * segundos é o que caberia numa reunião sem ninguém se mexer.
         */
        var crono = ui.$('cartao-crono');
        if (crono) crono.addEventListener('click', function () {
            if (crono.__t) {
                clearInterval(crono.__t);
                crono.__t = null;
                crono.textContent = '⏱ 90 segundos';
                return;
            }
            var resta = 90;
            crono.textContent = '⏱ ' + resta + 's';
            crono.__t = setInterval(function () {
                resta--;
                crono.textContent = '⏱ ' + resta + 's';
                if (resta <= 0) {
                    clearInterval(crono.__t);
                    crono.__t = null;
                    crono.textContent = '⏱ 90 segundos';
                    ui.toast('Noventa segundos. É tempo de sobra para uma oração pública.');
                }
            }, 1000);
        });
        window.addEventListener('hashchange', function () {
            if (crono && crono.__t) { clearInterval(crono.__t); crono.__t = null; }
        });
    }

    /* ---------- a revisão ---------- */

    function depoisDecorar(el) {
        var vao = ui.$('decorar-corpo');
        if (!vao) return;
        var fila = escola.paraHoje();

        if (!fila.length) {
            var todas = Object.keys(escola.fila());
            vao.innerHTML = todas.length
                ? '<section class="cartao"><p>Todas em dia. A próxima volta quando vencer.</p>' +
                  '<a class="btn btn--fraco btn--largo" href="#/escola">Voltar à escola</a>' +
                  '</section>'
                : '<section class="cartao"><p class="dica">A fila está vazia. Na escola de ' +
                  'oração, segure uma frase para pôr nela.</p>' +
                  '<a class="btn btn--forte btn--largo" href="#/escola">Escolher frases</a>' +
                  '</section>';
            return;
        }

        var i = 0;
        function uma() {
            if (i >= fila.length) {
                vao.innerHTML = '<section class="cartao"><p>✓ Fila de hoje terminada.</p>' +
                    '<a class="btn btn--forte btn--largo" href="#/escola">Voltar à escola</a>' +
                    '</section>';
                return;
            }
            var f = fila[i];
            vao.innerHTML = '<section class="cartao">' +
                '<p class="olho">' + (i + 1) + ' de ' + fila.length +
                (f.atrasado ? ' · atrasada' : '') + '</p>' +
                '<h3>' + esc(f.onde) + '</h3>' +
                '<p class="dica">Diga a frase em voz alta. Só depois abra.</p>' +
                '<div id="decorar-texto" hidden></div>' +
                '<button class="btn btn--forte btn--largo" id="decorar-abrir">Abrir</button>' +
                '<div class="grupo-botoes grupo-botoes--dois" id="decorar-juizo" hidden>' +
                '<button class="btn btn--fraco" data-juizo="erro">Não lembrei</button>' +
                '<button class="btn btn--forte" data-juizo="certo">Lembrei</button>' +
                '</div>' +
                '</section>';

            ui.$('decorar-abrir').addEventListener('click', function () {
                var cx = ui.$('decorar-texto');
                cx.hidden = false;
                ui.$('decorar-abrir').hidden = true;
                ui.$('decorar-juizo').hidden = false;
                mostrarTexto(cx, f.ref, 'oracao-texto');
            });

            ui.$('decorar-juizo').addEventListener('click', function (ev) {
                var b = ev.target.closest ? ev.target.closest('[data-juizo]') : null;
                if (!b) return;
                escola.feito(f.ref, b.getAttribute('data-juizo') === 'certo');
                i++;
                uma();
            });
        }
        uma();
    }

    return { render: render, depois: depois };
})();
