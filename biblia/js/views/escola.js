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

    /* ---------- treinar uma oração de cor ----------

       Sete exercícios, porque decorar não é uma coisa só: reconhecer,
       recitar, emendar e lembrar sem muleta são habilidades diferentes,
       e cada exercício trabalha uma. Todos operam sobre o texto que o
       app tem — nenhuma palavra vem de fora.

       A ordem do "treino completo" é a de quem decora de verdade: ver,
       reconhecer, recitar com muleta, recitar sem, e só então provar
       que sabe. */

    var EXERCICIOS = [
        { id: 'cartoes', nome: 'Cartões', icone: '🃏',
          dica: 'Vira a carta e diz se lembrava. O começo de tudo.' },
        { id: 'letras', nome: 'Primeiras letras', icone: '🔤',
          dica: 'Só a primeira letra de cada palavra. Recite em voz alta.' },
        { id: 'sumindo', nome: 'Sumindo aos poucos', icone: '🫥',
          dica: 'O texto some por partes, até você dizer de cabeça.' },
        { id: 'ordem', nome: 'Pôr em ordem', icone: '🔀',
          dica: 'Os trechos embaralhados, você monta a oração.' },
        { id: 'completar', nome: 'Completar', icone: '␣',
          dica: 'Uma palavra escondida por vez, quatro opções.' },
        { id: 'depois', nome: 'O que vem depois', icone: '▶',
          dica: 'A emenda, que é onde a memória falha.' },
        { id: 'ouvir', nome: 'Ouvir e repetir', icone: '🔊',
          dica: 'A voz do aparelho lê, você repete junto.' }
    ];

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
                    'carregar o texto desta oração.</p></section>';
                return;
            }
            var peca = t.oracao.ia ? 'frase' : 'versículo';
            var pecas = t.oracao.ia ? 'frases' : 'versículos';
            var acertos = 0, erros = 0;

            /* ----- o menu ----- */

            function menu() {
                acertos = 0;
                erros = 0;
                vao.innerHTML = '<section class="cartao">' +
                    '<p class="dica">' + t.versiculos.length + ' ' + pecas +
                    ' neste treino. Escolha um exercício — ou faça o caminho inteiro, ' +
                    'que é a ordem de quem decora: ver, reconhecer, recitar com muleta, ' +
                    'recitar sem.</p>' +
                    '<button class="btn btn--forte btn--largo" data-ex="tudo">' +
                    '🎯 Treino completo</button>' +
                    '<div class="treino-menu">' +
                    EXERCICIOS.map(function (x) {
                        return '<button class="frase" data-ex="' + x.id + '">' +
                            '<span class="frase-onde">' + x.icone + ' ' + esc(x.nome) +
                            '</span><span class="frase-texto">' + esc(x.dica) +
                            '</span></button>';
                    }).join('') +
                    '</div></section>';

                ui.qq('[data-ex]', vao).forEach(function (b) {
                    b.addEventListener('click', function () {
                        var qual = b.getAttribute('data-ex');
                        if (qual === 'tudo') return caminho(0);
                        /* Exercício avulso também termina no juízo: é lá
                           que a oração anda na fila de 1, 7 e 30 dias.
                           Só "ouvir" volta ao menu, porque é prática e
                           não prova. */
                        rodar(qual, qual === 'ouvir' ? menu : fim);
                    });
                });
            }

            /* O treino completo: um exercício atrás do outro, e no fim o
               juízo. Ouvir fica de fora da corrente — é prática, não
               prova, e quem está no ônibus não quer a voz sozinha. */
            var CAMINHO = ['cartoes', 'letras', 'sumindo', 'ordem', 'completar', 'depois'];

            function caminho(i) {
                if (i >= CAMINHO.length) return fim();
                rodar(CAMINHO[i], function () { caminho(i + 1); }, i + 1, CAMINHO.length);
            }

            function rodar(qual, aoFim, passo, total) {
                var cabeca = passo
                    ? '<p class="olho">' + passo + ' de ' + total + ' · ' + esc(nomeDe(qual)) +
                      '</p>'
                    : '<p class="olho">' + esc(nomeDe(qual)) + '</p>';
                if (qual === 'cartoes') return cartoes(cabeca, aoFim);
                if (qual === 'letras') return letras(cabeca, aoFim);
                if (qual === 'sumindo') return sumindo(cabeca, aoFim);
                if (qual === 'ordem') return ordem(cabeca, aoFim);
                if (qual === 'completar') return completar(cabeca, aoFim);
                if (qual === 'depois') return oQueVemDepois(cabeca, aoFim);
                if (qual === 'ouvir') return ouvir(cabeca, aoFim);
                return aoFim();
            }

            function nomeDe(qual) {
                var achou = '';
                EXERCICIOS.forEach(function (x) { if (x.id === qual) achou = x.nome; });
                return achou;
            }

            function botaoVoltar() {
                return '<button class="btn btn--fraco btn--largo" data-voltar>' +
                    'Voltar aos exercícios</button>';
            }

            function ligarVoltar() {
                var b = ui.q('[data-voltar]', vao);
                if (b) b.addEventListener('click', function () {
                    if (B.audio && B.audio.estado().lendo) B.audio.parar();
                    menu();
                });
            }

            /* ----- 1. cartões ----- */

            function cartoes(cabeca, aoFim) {
                var i = 0;
                function carta() {
                    if (i >= t.versiculos.length) return aoFim();
                    var v = t.versiculos[i];
                    vao.innerHTML = '<section class="cartao treino-carta">' + cabeca +
                        '<p class="dica">' + (i + 1) + ' de ' + t.versiculos.length +
                        ' · diga o ' + peca + ' ' + v.n + ' em voz alta, depois vire.</p>' +
                        '<div class="carta-frente" data-virar>' +
                        '<span class="carta-n">' + esc(cabecaDe(v)) + '</span>' +
                        '<span class="dica">toque para virar</span>' +
                        '</div>' +
                        '<div class="carta-verso" hidden><p class="oracao-texto">' +
                        esc(v.t) + '</p></div>' +
                        '<div class="grupo-botoes grupo-botoes--dois" data-juizo hidden>' +
                        '<button class="btn btn--fraco" data-lembrei="nao">Não lembrava</button>' +
                        '<button class="btn btn--forte" data-lembrei="sim">Lembrava</button>' +
                        '</div>' + botaoVoltar() + '</section>';

                    ui.q('[data-virar]', vao).addEventListener('click', function () {
                        ui.q('.carta-verso', vao).hidden = false;
                        ui.q('[data-juizo]', vao).hidden = false;
                    });
                    ui.qq('[data-lembrei]', vao).forEach(function (b) {
                        b.addEventListener('click', function () {
                            if (b.getAttribute('data-lembrei') === 'sim') acertos++; else erros++;
                            i++;
                            carta();
                        });
                    });
                    ligarVoltar();
                }
                carta();
            }

            /* A dica da frente: para a primeira carta, de onde é; para as
               outras, o fim do trecho anterior — que é a deixa de verdade
               de quem está orando. */
            function cabecaDe(v) {
                var i = t.versiculos.indexOf(v);
                if (i <= 0) return t.oracao.ia ? 'Como começa' : t.oracao.onde;
                var antes = String(t.versiculos[i - 1].t).split(' ');
                return '…' + antes.slice(-5).join(' ');
            }

            /* ----- 2. primeiras letras ----- */

            function letras(cabeca, aoFim) {
                var i = 0;
                function uma() {
                    if (i >= t.versiculos.length) return aoFim();
                    var v = t.versiculos[i];
                    vao.innerHTML = '<section class="cartao">' + cabeca +
                        '<p class="dica">' + (i + 1) + ' de ' + t.versiculos.length +
                        ' · recite em voz alta com esta muleta.</p>' +
                        '<p class="treino-letras">' + esc(escola.primeirasLetras(v.t)) + '</p>' +
                        '<div class="treino-conferido" hidden>' +
                        '<p class="oracao-texto">' + esc(v.t) + '</p></div>' +
                        '<button class="btn btn--forte btn--largo" data-ver>Conferir</button>' +
                        '<div class="grupo-botoes grupo-botoes--dois" data-juizo hidden>' +
                        '<button class="btn btn--fraco" data-lembrei="nao">Escapou</button>' +
                        '<button class="btn btn--forte" data-lembrei="sim">Acertei</button>' +
                        '</div>' + botaoVoltar() + '</section>';

                    ui.q('[data-ver]', vao).addEventListener('click', function () {
                        ui.q('.treino-conferido', vao).hidden = false;
                        ui.q('[data-ver]', vao).hidden = true;
                        ui.q('[data-juizo]', vao).hidden = false;
                    });
                    ui.qq('[data-lembrei]', vao).forEach(function (b) {
                        b.addEventListener('click', function () {
                            if (b.getAttribute('data-lembrei') === 'sim') acertos++; else erros++;
                            i++;
                            uma();
                        });
                    });
                    ligarVoltar();
                }
                uma();
            }

            /* ----- 3. sumindo aos poucos ----- */

            function sumindo(cabeca, aoFim) {
                var fracoes = [0, 0.25, 0.5, 0.75, 1];
                var k = 0;
                function volta() {
                    if (k >= fracoes.length) return aoFim();
                    var f = fracoes[k];
                    var inteiro = k === 0;
                    var nada = k === fracoes.length - 1;
                    vao.innerHTML = '<section class="cartao">' + cabeca +
                        '<p class="dica">' +
                        (inteiro ? 'Leia a oração inteira, em voz alta, devagar.'
                            : nada ? 'Agora de cabeça, sem olhar nada.'
                            : 'De novo em voz alta — o que sumiu você completa.') +
                        '</p>' +
                        (nada
                            ? '<p class="treino-vazio-grande">de cabeça</p>'
                            : '<div class="oracao-texto">' +
                              t.versiculos.map(function (v) {
                                  return '<p class="v-oracao">' +
                                      esc(escola.apagarParte(v.t, f)) + '</p>';
                              }).join('') + '</div>') +
                        '<button class="btn btn--forte btn--largo" data-continuar>' +
                        (nada ? 'Consegui' : 'Pronto, continuar') + '</button>' +
                        botaoVoltar() + '</section>';

                    ui.q('[data-continuar]', vao).addEventListener('click', function () {
                        k++;
                        volta();
                    });
                    ligarVoltar();
                }
                volta();
            }

            /* ----- 4. pôr em ordem ----- */

            function ordem(cabeca, aoFim) {
                if (t.versiculos.length < 3) return aoFim();
                var certa = t.versiculos.map(function (v) { return v.n; });
                var faltam = escola.embaralhar(t.versiculos.slice());
                var postos = [];

                function pintar() {
                    vao.innerHTML = '<section class="cartao">' + cabeca +
                        '<p class="dica">Toque ' + (t.oracao.ia ? 'nas frases' : 'nos versículos') +
                        ' na ordem da oração. Diga cada um em voz alta antes de tocar.</p>' +
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
                        '</div>' + botaoVoltar() + '</section>';

                    ui.qq('[data-peca]', vao).forEach(function (b) {
                        b.addEventListener('click', function () {
                            var i = parseInt(b.getAttribute('data-peca'), 10);
                            var v = faltam[i];
                            if (v.n === certa[postos.length]) {
                                postos.push(v);
                                faltam.splice(i, 1);
                                acertos++;
                                if (!faltam.length) {
                                    ui.toast('Ordem certa.');
                                    setTimeout(aoFim, 400);
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
                    });
                    ligarVoltar();
                }
                pintar();
            }

            /* ----- 5. completar ----- */

            function completar(cabeca, aoFim) {
                var perguntas = escola.lacunas(t.versiculos);
                if (!perguntas.length) return aoFim();
                var i = 0;

                function uma() {
                    if (i >= perguntas.length) return aoFim();
                    var q = perguntas[i];
                    vao.innerHTML = '<section class="cartao">' + cabeca +
                        '<p class="dica">' + (i + 1) + ' de ' + perguntas.length + '</p>' +
                        '<p class="treino-frase">' + esc(q.frase) + '</p>' +
                        '<p class="dica">' + (t.oracao.ia ? 'Frase ' : 'Versículo ') +
                        q.n + '</p>' +
                        '<div class="treino-opcoes">' +
                        q.opcoes.map(function (op) {
                            return '<button class="btn btn--fraco" data-op="' + esc(op) +
                                '">' + esc(op) + '</button>';
                        }).join('') +
                        '</div>' + botaoVoltar() + '</section>';

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
                    ligarVoltar();
                }
                uma();
            }

            /* ----- 6. o que vem depois ----- */

            function oQueVemDepois(cabeca, aoFim) {
                var perguntas = [];
                t.versiculos.forEach(function (v, i) {
                    var q = escola.qualVemDepois(t.versiculos, i);
                    if (q) perguntas.push(q);
                });
                if (!perguntas.length) return aoFim();
                var i = 0;

                function uma() {
                    if (i >= perguntas.length) return aoFim();
                    var q = perguntas[i];
                    vao.innerHTML = '<section class="cartao">' + cabeca +
                        '<p class="dica">' + (i + 1) + ' de ' + perguntas.length +
                        ' · depois deste trecho, o que vem?</p>' +
                        '<p class="oracao-texto treino-atual">' + esc(q.atual) + '</p>' +
                        '<div class="treino-pecas">' +
                        q.opcoes.map(function (op) {
                            return '<button class="frase" data-op="' + esc(op) + '">' +
                                esc(op) + '</button>';
                        }).join('') +
                        '</div>' + botaoVoltar() + '</section>';

                    ui.qq('[data-op]', vao).forEach(function (b) {
                        b.addEventListener('click', function () {
                            if (b.getAttribute('data-op') === q.certa) {
                                acertos++;
                                b.classList.add('is-on');
                            } else {
                                erros++;
                                b.classList.add('is-erro');
                                ui.toast('Vinha: "' + q.certa + '"');
                            }
                            i++;
                            setTimeout(uma, 600);
                        });
                    });
                    ligarVoltar();
                }
                uma();
            }

            /* ----- 7. ouvir e repetir ----- */

            function ouvir(cabeca, aoFim) {
                var tem = B.audio && B.audio.disponivel();
                vao.innerHTML = '<section class="cartao">' + cabeca +
                    '<p class="dica">' + (tem
                        ? 'A voz do aparelho lê; repita junto, em voz alta. Repetir é o que ' +
                          'faz a boca pegar o ritmo da frase.'
                        : 'Este aparelho não ofereceu voz ao app, então este exercício não ' +
                          'funciona aqui. Em Ajustes há o caminho para instalar a voz.') +
                    '</p>' +
                    (tem ? '<button class="btn btn--forte btn--largo" data-ouvir>' +
                        '🔊 Ouvir</button>' : '') +
                    '<div class="oracao-texto" id="treino-ouvir">' +
                    t.versiculos.map(function (v) {
                        return '<p class="v-oracao"><span class="n">' + v.n + '</span> ' +
                            esc(v.t) + '</p>';
                    }).join('') +
                    '</div>' + botaoVoltar() + '</section>';

                if (tem) {
                    ligarVoz(ui.q('[data-ouvir]', vao), ui.$('treino-ouvir'), function () {
                        return t.versiculos.map(function (v) { return v.t; });
                    });
                }
                ligarVoltar();
            }

            /* ----- o fim ----- */

            function fim() {
                if (B.audio && B.audio.estado().lendo) B.audio.parar();
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
                    '<button class="btn btn--fraco btn--largo" data-voltar>' +
                    'Escolher outro exercício</button>' +
                    '</section>';

                ui.qq('[data-juizo]', vao).forEach(function (b) {
                    b.addEventListener('click', function () {
                        var certo = b.getAttribute('data-juizo') === 'certo';
                        escola.feitoOracao(id, certo);
                        var it = escola.filaOracoes()[id];
                        ui.toast(certo
                            ? 'Volta em ' + escola.PASSOS[it ? it.passo : 0] + ' dia(s), ' +
                              'para ver se ficou.'
                            : 'Volta amanhã.');
                        location.hash = '#/escola';
                    });
                });
                ligarVoltar();
            }

            menu();
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
        /* once: sair da tela para o cronômetro e tira o ouvinte junto —
           sem isso, cada visita ao cartão deixava mais um pendurado. */
        window.addEventListener('hashchange', function () {
            if (crono && crono.__t) { clearInterval(crono.__t); crono.__t = null; }
        }, { once: true });
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
