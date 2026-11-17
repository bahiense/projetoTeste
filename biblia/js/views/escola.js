/* =========================================================
   TELA ESCOLA DE ORAÇÃO.

   Quatro lugares numa tela só:

   - o cartão de condução, que é o treino de orar em público;
   - as orações da Bíblia, para ler, ouvir e imitar;
   - as frases e as orações em flash cards, com a fila de 1, 7 e 30 dias;
   - as orações dos estudos, marcadas uma a uma, no mesmo baralho.

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
        /* O endereço velho da revisão abre a fila como baralho. */
        if (arg === 'decorar') return renderCartoes('fila');
        /* Endereço velho (#/escola/treino/…) continua abrindo: quem
           guardou o link não merece uma tela de "não encontrei". */
        if (arg && arg.indexOf('treino/') === 0) return renderCartoes(arg.slice(7));
        if (arg && arg.indexOf('cartoes/') === 0) return renderCartoes(arg.slice(8));
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
                '</div>' +
                '<a class="btn btn--fraco btn--largo" href="#/escola/cartoes/cartao">' +
                '🃏 Flash cards destas frases</a>'
                : '<p class="dica">Vazio. Escolha abaixo uma frase de cada movimento: ' +
                'o cartão sai com letra grande, para orar olhando de relance.</p>') +
            '</section>' +

            '<section class="cartao" id="escola-montar">' +
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
            '<p class="dica">Flash cards: a frente traz a deixa, você diz em voz alta, ' +
            'vira e marca se lembrava. O texto é o do app.</p>' +
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
                      return '<a class="orar-item" href="#/escola/cartoes/' +
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
                  ' btn--largo" href="#/escola/cartoes/' + encodeURIComponent(sugestao.id) +
                  '">🃏 ' + esc(sugestao.titulo) + '</a>' +
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
                  ' btn--largo" href="#/escola/cartoes/fila">' +
                  (r.hoje ? '🃏 Rever as de hoje' : 'Ver a fila') + '</a>'
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
            '<button class="btn btn--fraco" id="cartao-crono">⏱ 40 segundos</button>' +
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
            '<a class="btn btn--forte" href="#/escola/cartoes/' +
            encodeURIComponent(o.id) + '">🃏 Flash cards</a>' +
            '</div>' +
            (ref ? '<div class="grupo-botoes orar-pe">' +
                '<a class="btn btn--fraco btn--largo" href="#/ler/' +
                encodeURIComponent(ref) + '">📖 No capítulo</a></div>' : '');
    }

    /* ---------- flash cards ----------

       Antes havia sete exercícios e um "treino completo" que encadeava
       seis deles. Era demais: quem quer decorar uma oração quer uma
       carta na frente, não um circuito. Ficou só o baralho — frente,
       verso, "lembrava / não lembrava" — e é ele que alimenta a fila de
       1, 7 e 30 dias. */

    function renderCartoes(fonte) {
        return '<header class="tela-topo">' +
            '<a class="voltar" href="#/escola">‹ escola</a>' +
            '<p class="olho">Flash cards</p>' +
            '<div id="cartoes-topo"></div>' +
            '</header>' +
            '<div id="cartoes-corpo"><p class="carregando">Montando as cartas…</p></div>';
    }

    function depoisCartoes(el, fonte) {
        var vao = ui.$('cartoes-corpo');
        var topo = ui.$('cartoes-topo');
        if (!vao) return;

        escola.baralho(fonte).then(function (b) {
            if (topo) {
                topo.innerHTML = '<h2>' + esc(b.titulo || 'Flash cards') + '</h2>' +
                    (b.ia ? '<p class="tela-sub">' + esc(B.oracoes.AVISO) + '</p>'
                          : (b.onde ? '<p class="tela-sub">' + esc(b.onde) + '</p>' : ''));
            }
            if (!b.cartas || !b.cartas.length) return vazio(b);

            var cartas = b.cartas;
            var i = 0, lembrei = 0, escapou = 0;

            function carta() {
                if (i >= cartas.length) return fim();
                var c = cartas[i];
                vao.innerHTML = '<section class="cartao treino-carta">' +
                    '<p class="dica">' + (i + 1) + ' de ' + cartas.length +
                    (c.onde ? ' · ' + esc(c.onde) : '') + '</p>' +
                    '<div class="carta-frente" data-virar>' +
                    '<span class="carta-n">' + esc(c.frente) + '</span>' +
                    '<span class="dica">diga em voz alta, depois toque para virar</span>' +
                    '</div>' +
                    '<div class="carta-verso" hidden>' +
                    '<p class="oracao-texto">' + esc(c.verso) + '</p></div>' +
                    '<div class="grupo-botoes grupo-botoes--dois" data-juizo hidden>' +
                    '<button class="btn btn--fraco" data-lembrei="nao">Não lembrava</button>' +
                    '<button class="btn btn--forte" data-lembrei="sim">Lembrava</button>' +
                    '</div>' +
                    '</section>';

                ui.q('[data-virar]', vao).addEventListener('click', function () {
                    ui.q('.carta-verso', vao).hidden = false;
                    ui.q('[data-juizo]', vao).hidden = false;
                });

                ui.qq('[data-lembrei]', vao).forEach(function (btn) {
                    btn.addEventListener('click', function () {
                        var certo = btn.getAttribute('data-lembrei') === 'sim';
                        if (certo) lembrei++; else escapou++;
                        /* A frase tem fila própria: cada carta anda a sua.
                           A oração é uma só — o juízo dela vem no fim. */
                        if (c.tipo === 'frase') {
                            if (!escola.naFila(c.chave)) escola.decorar(c.chave);
                            escola.feito(c.chave, certo);
                        }
                        i++;
                        carta();
                    });
                });
            }

            function fim() {
                var daOracao = b.tipo === 'oracao' && cartas[0] && cartas[0].chave;
                vao.innerHTML = '<section class="cartao">' +
                    '<h3>' + (escapou ? 'Fim do baralho.' : '✓ Todas de cor.') + '</h3>' +
                    '<p>' + lembrei + ' lembrada' + (lembrei === 1 ? '' : 's') +
                    (escapou ? ', ' + escapou + ' escapou' + (escapou > 1 ? 'ram' : '') : '') +
                    '.</p>' +
                    (daOracao
                        ? '<p class="dica">Você consegue orar esta oração agora, sem olhar?</p>' +
                          '<div class="grupo-botoes grupo-botoes--dois">' +
                          '<button class="btn btn--fraco" data-juizo="erro">Ainda não</button>' +
                          '<button class="btn btn--forte" data-juizo="certo">Consigo</button>' +
                          '</div>'
                        : '<p class="dica">As frases que escaparam voltam amanhã; as que você ' +
                          'lembrou, mais adiante.</p>') +
                    '<button class="btn btn--fraco btn--largo" data-dedenovo>' +
                    'Passar de novo</button>' +
                    '<a class="btn btn--fraco btn--largo" href="#/escola">Voltar à escola</a>' +
                    '</section>';

                ui.qq('[data-juizo]', vao).forEach(function (btn) {
                    btn.addEventListener('click', function () {
                        var certo = btn.getAttribute('data-juizo') === 'certo';
                        /* Um baralho de várias orações não cabe num juízo
                           só: cada oração que entrou leva o seu. */
                        var chaves = {};
                        cartas.forEach(function (c) { chaves[c.chave] = true; });
                        Object.keys(chaves).forEach(function (k) {
                            escola.feitoOracao(k, certo);
                        });
                        var um = escola.filaOracoes()[Object.keys(chaves)[0]];
                        ui.toast(certo
                            ? 'Volta em ' + escola.PASSOS[um ? um.passo : 0] + ' dia(s).'
                            : 'Volta amanhã.');
                        location.hash = '#/escola';
                    });
                });

                var denovo = ui.q('[data-dedenovo]', vao);
                if (denovo) denovo.addEventListener('click', function () {
                    i = 0; lembrei = 0; escapou = 0;
                    carta();
                });
            }

            carta();
        }, function (erro) {
            vao.innerHTML = '<section class="cartao"><p class="dica">Não deu para montar ' +
                'as cartas: ' + esc(erro && erro.message ? erro.message
                    : 'o texto não está no aparelho ainda') + '.</p>' +
                '<a class="btn btn--fraco btn--largo" href="#/escola">Voltar</a></section>';
        });

        function vazio(b) {
            var recados = {
                cartao: 'O seu cartão está vazio. Em <b>Montar a oração</b>, toque numa ' +
                    'frase de cada movimento — elas viram as cartas deste baralho.',
                fila: 'Nenhuma frase vence hoje.',
                estudos: 'Nenhuma oração de estudo marcada. Na escola, toque nas que você ' +
                    'quer trabalhar.'
            };
            vao.innerHTML = '<section class="cartao"><p class="dica">' +
                (recados[b.vazio] || 'Não há cartas aqui.') + '</p>' +
                '<a class="btn btn--forte btn--largo" href="#/escola">Voltar à escola</a>' +
                '</section>';
        }
    }

    /* ---------- a revisão das frases ---------- */

    /* ---------- depois ---------- */

    function depois(el, arg) {
        if (arg === 'cartao') return depoisCartao(el);
        if (arg === 'decorar') return depoisCartoes(el, 'fila');
        if (arg && arg.indexOf('treino/') === 0) return depoisCartoes(el, arg.slice(7));
        if (arg && arg.indexOf('cartoes/') === 0) return depoisCartoes(el, arg.slice(8));
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

        /*
         * Os ouvintes moram nas seções desta pintura, não em #tela.
         *
         * #tela é o mesmo nó a cada repintura: pendurar nele empilhava
         * um ouvinte por visita, e o segundo desfazia o que o primeiro
         * fazia — tocar numa frase marcava e desmarcava na mesma hora.
         */
        var estudos = ui.$('escola-estudos');
        if (estudos) estudos.addEventListener('click', function (ev) {
            var e = ev.target.closest ? ev.target.closest('[data-estudo]') : null;
            if (!e) return;
            escola.escolherEstudo(e.getAttribute('data-estudo'));
            pintarEstudos();
        });

        var montar = ui.$('escola-montar');
        if (!montar) return;

        montar.addEventListener('click', function (ev) {
            var f = ev.target.closest ? ev.target.closest('[data-frase]') : null;
            if (!f) return;
            var ref = f.getAttribute('data-frase');
            escola.trocarFrase(ref);
            /* Repinta só o que mudou: o <details> aberto fica aberto. */
            ui.qq('[data-frase]', montar).forEach(function (b) {
                b.classList.toggle('is-on', escola.noCartao(b.getAttribute('data-frase')));
            });
            ui.toast(escola.noCartao(ref)
                ? 'No cartão. ' + (escola.naFila(ref) ? '' : 'Toque e segure para decorar.')
                : 'Fora do cartão.');
        });

        /* Segurar a frase põe (ou tira) da fila de decoração. */
        var segurando = null;
        montar.addEventListener('pointerdown', function (ev) {
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
            montar.addEventListener(nome, function () {
                if (segurando) { clearTimeout(segurando); segurando = null; }
            });
        });
    }

    /*
     * As orações dos estudos, para escolher quais entram no baralho.
     *
     * A lista é a das guardadas; enquanto não houver nenhuma, as dos
     * capítulos lidos hoje — que é onde a pessoa está de fato. Tocar
     * numa marca ou desmarca; o botão embaixo trabalha as marcadas
     * juntas, numa sessão só.
     */
    function pintarEstudos() {
        var vao = ui.$('escola-estudos');
        if (!vao || !B.oracoes) return;

        var refs = B.oracoes.guardadas();
        if (!refs.length && B.plano && B.biblia.GRUPOS) {
            B.biblia.GRUPOS.forEach(function (g) {
                B.plano.lidosHoje(g.id).forEach(function (h) { refs.push(h.ref); });
            });
        }
        /* O que já foi escolhido antes continua na lista, mesmo que tenha
           saído das guardadas — senão a escolha some sem aviso. */
        escola.estudosEscolhidos().forEach(function (ref) {
            if (refs.indexOf(ref) < 0) refs.push(ref);
        });
        refs = refs.slice(0, 12);

        if (!refs.length) {
            vao.innerHTML = '<p class="dica">Nenhuma guardada ainda, e nada lido hoje. ' +
                'Guarde uma oração na tela de Orações (☆) e ela aparece aqui para ' +
                'escolher.</p>';
            return;
        }

        /* Só entra na lista o capítulo que tem oração de verdade: item
           que abre em "este capítulo ainda não tem oração" é promessa
           que o app não cumpre. */
        Promise.all(refs.map(function (ref) {
            return B.oracoes.doCapitulo(ref).then(function (t) {
                return t ? ref : null;
            }, function () { return null; });
        })).then(function (bons) {
            bons = bons.filter(function (r) { return !!r; });
            if (!bons.length) {
                vao.innerHTML = '<p class="dica">Os capítulos de hoje ainda não têm ' +
                    'oração: ela vem no estudo completo.</p>';
                return;
            }
            var escolhidas = escola.estudosEscolhidos().filter(function (r) {
                return bons.indexOf(r) >= 0;
            });
            vao.innerHTML = '<div class="frases">' +
                bons.map(function (ref) {
                    var marcada = escola.estudoEscolhido(ref);
                    return '<button class="frase' + (marcada ? ' is-on' : '') +
                        '" data-estudo="' + esc(ref) + '">' +
                        '<span class="frase-onde">' + (marcada ? '✓ ' : '') +
                        'Oração de ' + esc(ref) + '</span>' +
                        '<span class="frase-texto" data-prevê="' + esc(ref) + '">…</span>' +
                        '</button>';
                }).join('') +
                '</div>' +
                '<a class="btn btn--' + (escolhidas.length ? 'forte' : 'fraco') +
                ' btn--largo" href="#/escola/cartoes/estudos">🃏 Flash cards ' +
                (escolhidas.length ? 'das ' + escolhidas.length + ' marcadas'
                    : '— marque ao menos uma') + '</a>';

            /* Uma linha de cada oração, para saber qual é sem abrir. */
            ui.qq('[data-prevê]', vao).forEach(function (el) {
                B.oracoes.doCapitulo(el.getAttribute('data-prevê')).then(function (t) {
                    if (t) el.textContent = String(t).replace(/\s+/g, ' ').slice(0, 90) + '…';
                }, function () { });
            });
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
         * e quem está aprendendo não sente o tempo passar. Quarenta
         * segundos é o que o dono do app achou do tamanho certo, e é
         * tempo de sobra para as cinco linhas do cartão.
         */
        var crono = ui.$('cartao-crono');
        if (crono) crono.addEventListener('click', function () {
            if (crono.__t) {
                clearInterval(crono.__t);
                crono.__t = null;
                crono.textContent = '⏱ 40 segundos';
                return;
            }
            var resta = 40;
            crono.textContent = '⏱ ' + resta + 's';
            crono.__t = setInterval(function () {
                resta--;
                crono.textContent = '⏱ ' + resta + 's';
                if (resta <= 0) {
                    clearInterval(crono.__t);
                    crono.__t = null;
                    crono.textContent = '⏱ 40 segundos';
                    ui.toast('Quarenta segundos. É tempo de sobra para uma oração pública.');
                }
            }, 1000);
        });
        /* once: sair da tela para o cronômetro e tira o ouvinte junto —
           sem isso, cada visita ao cartão deixava mais um pendurado. */
        window.addEventListener('hashchange', function () {
            if (crono && crono.__t) { clearInterval(crono.__t); crono.__t = null; }
        }, { once: true });
    }

    return { render: render, depois: depois };
})();
