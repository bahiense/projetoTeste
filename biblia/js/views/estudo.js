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

            /* Depois da busca e antes da estante: a busca é a ferramenta da
               tela e não pode descer oito cartões; o dia é o que se quer ver
               sem procurar. */
            '<div id="hoje-estudo"></div>' +

            '<div id="estante"><p class="carregando">Abrindo a estante…</p></div>';
    }

    /**
     * O dia de hoje no alto da estante.
     *
     * A tela de Estudo abria numa busca e numa pilha ordenada por data de
     * geração — útil para achar, inútil para o dia. Quem leu três capítulos
     * de manhã quer voltar a eles à noite: ver o vídeo, ler o comentário,
     * olhar a teologia. É isto aqui.
     *
     * Mostra o que foi LIDO hoje primeiro, e depois o que o plano ainda
     * espera de cada grupo — a agenda do dia inteira, com todas as portas
     * de cada capítulo numa linha só.
     */
    function renderHoje(guardados) {
        var lidos = [];
        var faltam = [];
        bib.GRUPOS.forEach(function (g) {
            var hoje = B.plano.lidosHoje(g.id);
            hoje.forEach(function (h) {
                lidos.push({ ref: h.ref, grupo: g, lido: true });
            });
            if (!hoje.length) {
                var a = B.plano.leituraAtual(g.id);
                faltam.push({ ref: a.ref, grupo: g, lido: false });
            }
        });
        var tudo = lidos.concat(faltam);
        if (!tudo.length) return '';

        return '<h3 class="secao">Hoje <small>' +
            (lidos.length
                ? lidos.length + ' capítulo' + (lidos.length === 1 ? '' : 's') + ' lido' +
                (lidos.length === 1 ? '' : 's') + ' hoje'
                : 'a leitura de hoje, ainda por ler') +
            '</small></h3>' +
            '<div class="hoje-estudos">' + tudo.map(function (x) {
                return linhaHoje(x, guardados);
            }).join('') + '</div>';
    }

    function linhaHoje(x, guardados) {
        var alvo = bib.interpretar(x.ref);
        if (!alvo) return '';
        var enc = encodeURIComponent(x.ref);
        var temEstudo = guardados && (guardados[x.ref + '|completo'] || guardados[x.ref + '|simples']);
        var temTeologia = B.doutrina &&
            B.doutrina.temas(alvo.livro.usfm, alvo.capitulo).length;
        var temCom = temComentario(alvo);

        return '<div class="hoje-estudo' + (x.lido ? ' is-lido' : '') + '">' +
            '<div class="hoje-topo">' +
            '<span class="hoje-icone">' + x.grupo.icone + '</span>' +
            '<b>' + esc(x.ref) + '</b>' +
            '<small>' + (x.lido ? 'lido hoje' : 'a ler') + '</small>' +
            '</div>' +
            '<div class="hoje-portas">' +
            '<a class="btn btn--mini" href="#/ler/' + enc + '">Ler</a>' +
            '<a class="btn btn--mini' + (temEstudo ? ' btn--feito' : '') +
            '" href="#/estudo/' + enc + '">Estudo' + (temEstudo ? '' : ' (falta)') + '</a>' +
            '<a class="btn btn--mini" href="#/videos/' + enc + '">Em vídeo</a>' +
            (temTeologia
                ? '<a class="btn btn--mini" href="#/teologia/' + enc + '">Teologia</a>'
                : '') +
            (temCom
                ? '<a class="btn btn--mini" href="#/comentario/' + enc + '">Comentário</a>'
                : '') +
            (B.lugares && B.lugares.tem(alvo.livro.usfm, alvo.capitulo)
                ? '<a class="btn btn--mini" href="#/mapa/' + enc + '">Mapa</a>'
                : '') +
            '</div>' +
            '</div>';
    }

    function renderEstante(lista) {
        if (!lista.length) {
            return '<div class="vazio">' +
                '<div class="vazio-icone">📚</div>' +
                '<p>Nenhum estudo guardado ainda.</p>' +
                '<p class="dica">' + (B.copia && B.copia.noApk && B.copia.noApk()
                    ? 'Os estudos são escritos na versão que roda dentro do Claude e chegam ' +
                    'aqui em pacotes. O primeiro que chegar fica nesta estante.'
                    : 'O primeiro estudo que você gerar fica aqui, e continua disponível ' +
                    'mesmo sem internet.') + '</p></div>';
        }
        var caps = lista.filter(function (e) { return e.tipo === 'capitulo'; }).length;
        return '<h3 class="secao">Estante <small>' + lista.length + ' estudo' +
            (lista.length > 1 ? 's' : '') + ' · ' + caps + ' de capítulo</small></h3>' +
            '<div class="estante">' + lista.map(function (e) {
                return '<a class="estudo-item" href="#/estudo/' + encodeURIComponent(e.titulo) +
                    (e.formato === 'simples' ? '/simples' : '') + '">' +
                    '<span class="estudo-tipo">' + (e.tipo === 'livro' ? '📕' : '📄') + '</span>' +
                    '<span class="estudo-txt"><b>' + esc(e.titulo) + '</b>' +
                    '<small>' + (e.formato === 'simples' ? 'simples' : 'completo') + ' · ' +
                    (e.tipo === 'livro' ? 'livro inteiro' : 'capítulo') +
                    ' · ' + ui.quando(e.criado) +
                    '</small></span>' +
                    '<span class="estudo-seta">›</span></a>';
            }).join('') + '</div>';
    }

    /* ---------- o estudo ---------- */

    /* A rota pode vir com o formato colado no fim: "#/estudo/João 3/simples".
       Sem ele, vale o último formato usado. */
    function separarFormato(ref) {
        var m = String(ref).match(/^(.*)\/(simples|completo)$/);
        if (m) return { ref: m[1], formato: m[2] };
        return { ref: ref, formato: store.get().config.formato || 'simples' };
    }

    function renderEstudo(bruto) {
        var d = separarFormato(bruto);
        var ref = d.ref;
        var alvo = bib.interpretar(ref);
        if (!alvo) {
            return '<header class="tela-topo"><h2>Não encontrei</h2>' +
                '<p class="tela-sub">"' + esc(ref) + '" não bate com nenhum livro da Bíblia.</p></header>' +
                '<p><a class="btn btn--forte" href="#/estudo">Voltar à busca</a></p>';
        }
        var titulo = alvo.livro.nome + (alvo.capitulo ? ' ' + alvo.capitulo : '');
        return '<div id="palco" data-titulo="' + esc(titulo) + '" data-formato="' +
            esc(d.formato) + '">' +
            '<p class="carregando">Procurando na estante…</p></div>';
    }

    function cabecalhoEstudo(titulo, alvo, guardado, formato) {
        var g = bib.grupo(alvo.livro.grupo);
        var sub = alvo.capitulo
            ? 'Capítulo ' + alvo.capitulo + ' de ' + alvo.livro.caps + ' · ' + g.nome
            : 'Livro inteiro · ' + alvo.livro.caps + ' capítulos · ' + g.nome;
        return '<header class="tela-topo tela-topo--estudo">' +
            '<a class="voltar" href="#/estudo">‹ estudos</a>' +
            '<h2>' + esc(titulo) + '</h2>' +
            '<p class="tela-sub">' + esc(sub) +
            (guardado ? ' · gerado ' + ui.quando(guardado.criado) : '') + '</p>' +

            '<div class="alternador" role="tablist">' +
            '<button class="alt' + (formato === 'simples' ? ' is-on' : '') +
            '" data-formato="simples" role="tab">Simples' +
            '<small>contexto, quem é quem, aplicação</small></button>' +
            '<button class="alt' + (formato === 'completo' ? ' is-on' : '') +
            '" data-formato="completo" role="tab">Completo' +
            '<small>com original, teólogos e Cristo</small></button>' +
            '</div>' +
            /* Marcar como lido é ação da tela de leitura, onde o capítulo
               está na frente dos olhos. Aqui ficaria a segunda cópia do
               mesmo botão, e duas cópias sempre acabam discordando. */
            /*
             * Ler o texto e ver a doutrina que se apoia nele são dois
             * caminhos do mesmo lugar, então ficam lado a lado. O número
             * aparece na etiqueta: sem ele, o botão convida para uma tela
             * que pode estar vazia.
             */
            (alvo.capitulo ? (function () {
                var ref = alvo.livro.nome + ' ' + alvo.capitulo;
                var quantos = B.doutrina ? B.doutrina.temas(alvo.livro.usfm, alvo.capitulo).length : 0;
                /* Ouvir entra na mesma fileira: ler, pensar e ouvir quem
                   pregou o mesmo capítulo são três portas do mesmo lugar. */
                return '<div class="grupo-botoes grupo-botoes--dois">' +
                    '<a class="btn btn--forte" href="#/ler/' + encodeURIComponent(ref) +
                    '">Ler o texto</a>' +
                    (quantos
                        ? '<a class="btn btn--fraco" href="#/teologia/' +
                        encodeURIComponent(ref) + '">Teologia reformada <b>' + quantos +
                        '</b></a>'
                        : '') +
                    '<a class="btn btn--fraco" href="#/videos/' + encodeURIComponent(ref) +
                    '">Em vídeo</a>' +
                    (temComentario(alvo)
                        ? '<a class="btn btn--fraco" href="#/comentario/' +
                        encodeURIComponent(ref) + '">Comentário</a>'
                        : '') +
                    (B.lugares && B.lugares.tem(alvo.livro.usfm, alvo.capitulo)
                        ? '<a class="btn btn--fraco" href="#/mapa/' +
                        encodeURIComponent(ref) + '">Mapa</a>'
                        : '') +
                    '</div>';
            })() : '') +
            '</header>';
    }

    /* Tela de antes de gerar: diz o que vai acontecer e quanto custa. */
    function renderPedido(titulo, alvo, formato) {
        var cfg = store.get().config;
        var peloClaude = B.ia.modo() === 'claude';
        var temChave = B.ia.pronto(cfg);
        var simples = formato === 'simples';

        /*
         * No app instalado não se gera: os estudos são escritos na versão que
         * roda dentro do Claude e chegam prontos. Oferecer "Gerar estudo" aqui
         * seria um botão que não leva a lugar nenhum — melhor dizer onde o
         * texto está e como ele vem.
         */
        if (B.copia && B.copia.noApk && B.copia.noApk()) {
            return cabecalhoEstudo(titulo, alvo, null, formato) +
                '<div class="cartao cartao--pedido">' +
                '<h3>Este estudo ainda não chegou</h3>' +
                '<p class="dica">O estudo ' + (simples ? 'simples' : 'completo') + ' de <b>' +
                esc(titulo) + '</b> ainda não está neste aparelho. Quem escreve os estudos é ' +
                'a versão do app que roda dentro do <b>Claude</b>; de lá eles vêm em pacotes, ' +
                'e entram aqui sozinhos toda vez que você abre o app.</p>' +
                '<a class="btn btn--forte btn--largo" href="#/config">Ver como os estudos chegam</a>' +
                (formato === 'simples'
                    ? '<p class="dica">Talvez o <b>completo</b> deste capítulo já esteja aqui: ' +
                    'troque no seletor acima.</p>'
                    : '<p class="dica">Talvez o <b>simples</b> deste capítulo já esteja aqui: ' +
                    'troque no seletor acima.</p>') +
                '</div>';
        }

        var itens = simples
            ? '<li>o contexto histórico, cultural e geográfico</li>' +
            '<li>quem é quem e o que está em jogo para cada um</li>' +
            '<li>aplicação, três perguntas para meditar e uma oração</li>'
            : alvo.capitulo
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
                '<li>Cristo no livro e um roteiro de leitura</li>';

        var cabeca = simples
            ? (alvo.capitulo ? 'Estudo simples do capítulo' : 'Apresentação simples do livro')
            : (alvo.capitulo ? 'Explicação completa do capítulo' : 'Panorama do livro inteiro');

        return cabecalhoEstudo(titulo, alvo, null, formato) +

            '<div class="cartao cartao--pedido">' +
            '<h3>' + cabeca + '</h3>' +
            '<ul class="lista-seta">' + itens + '</ul>' +
            '<p class="dica">' +
            (peloClaude
                ? 'Escrito pelo <b>Claude</b>, pelo seu próprio plano — sem chave e sem conta ' +
                'de API. '
                : 'Escrito pelo <b>Gemini</b> (' + esc(cfg.modeloGoogle || 'modelo do Google') +
                '), pela camada gratuita do Google: não custa nada, dentro do limite diário. ') +
            (simples ? 'Leva menos de um minuto. ' : 'Leva de 1 a 3 minutos. ') +
            'Depois de pronto fica guardado no aparelho, e reler não consome nada.</p>' +
            '<p class="dica">Sem busca na web: as citações e os dados saem da memória do ' +
            'modelo. Confira antes de repassar adiante.</p>' +

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

    function renderTexto(estudo, alvo) {
        return '<article class="prosa" id="prosa">' + B.md.render(estudo.texto) + '</article>' +

            emVideo(alvo) +

            '<div class="rodape-estudo">' +
            '<small>' + esc(estudo.modelo || '') +
            (estudo.custo ? ' · US$ ' + estudo.custo.toFixed(3) : '') +
            (estudo.buscas ? ' · ' + estudo.buscas + ' buscas na web' : '') +
            ' · gerado ' + ui.quando(estudo.criado) + '</small>' +
            '<div class="rodape-botoes">' +
            '<button class="btn btn--fraco" data-compartilhar>Compartilhar</button>' +
            (B.copia && B.copia.noApk && B.copia.noApk()
                /* Aqui não se gera; o que dá é pedir que a Oficina reescreva
                   este mesmo capítulo, já preenchido. */
                ? '<button class="btn btn--fraco" data-renovar-la>Renovar na Oficina</button>'
                : '<button class="btn btn--fraco" data-refazer>Refazer</button>') +
            '<button class="btn btn--fraco btn--perigo" data-apagar>Apagar</button>' +
            '</div>' +
            '<p class="dica dica--honesta">Texto escrito por IA. Ele erra — principalmente em ' +
            'citação de teólogo, data e número. Confira no texto bíblico e num comentário de ' +
            'verdade antes de ensinar isto a alguém.</p>' +
            '</div>';
    }

    /* Calvino e Henry estão guardados para este capítulo? A resposta só
       existe depois que os índices chegam; antes disso o botão não
       aparece, em vez de aparecer e levar a uma tela vazia. */
    function temComentario(alvo) {
        if (!B.comentario || !alvo || !alvo.capitulo) return false;
        return B.comentario.tem('calvino', alvo.livro.usfm, alvo.capitulo) ||
            B.comentario.tem('henry', alvo.livro.usfm, alvo.capitulo);
    }

    /**
     * O capítulo em vídeo, dentro da própria página do estudo.
     *
     * O botão lá em cima leva à tela inteira; mas quem acabou de ler o
     * estudo está aqui embaixo, e é aqui que dá vontade de ouvir alguém
     * pregar o mesmo texto. Pedir mais um toque para ver o que cabe em
     * duas linhas é pedir à toa.
     *
     * Vale também para o panorama de um livro: ali a busca é do livro
     * inteiro, não de um capítulo.
     */
    function emVideo(alvo) {
        if (!alvo || !alvo.livro || !B.videos) return '';
        var ref = alvo.livro.nome + (alvo.capitulo ? ' ' + alvo.capitulo : '');
        var b = B.videos.buscas(alvo.livro, alvo.capitulo || 0);
        /* As de português mais a primeira em inglês: o resto fica na tela
           cheia, a um toque, para este cartão não virar um muro. */
        var fila = b.pt.concat(b.ingles.slice(0, 1));

        return '<section class="cartao video-aqui">' +
            '<h3>Este ' + (alvo.capitulo ? 'capítulo' : 'livro') + ' em vídeo</h3>' +
            '<p class="dica">Pregação, estudo e comentário de <b>' + esc(ref) + '</b> — ' +
            'cada botão abre uma busca no YouTube.</p>' +
            '<div class="video-buscas">' +
            fila.map(function (x) {
                return '<a class="btn btn--mini" target="_blank" rel="noopener" href="' +
                    esc(B.videos.url(x.termo)) + '">' + esc(x.rotulo) + '</a>';
            }).join('') +
            '<a class="btn btn--mini" href="#/videos/' + encodeURIComponent(ref) +
            '">Mais</a>' +
            '</div>' +
            '</section>';
    }

    /* ---------- montagem ---------- */

    function depois(el, arg) {
        if (!arg) return montarEstante(el);
        var palco = ui.$('palco');
        if (!palco) return;
        var titulo = palco.getAttribute('data-titulo');
        var formato = palco.getAttribute('data-formato');
        var alvo = bib.interpretar(titulo);
        abrir(palco, titulo, alvo, formato);
    }

    /* Mostra o que estiver guardado naquele formato; se não houver nada,
       mostra o pedido. Trocar de formato é só chamar isto de novo. */
    function abrir(palco, titulo, alvo, formato) {
        store.setConfig('formato', formato);
        palco.setAttribute('data-formato', formato);
        B.estudos.obter(titulo, formato).then(function (guardado) {
            if (guardado) mostrarEstudo(palco, titulo, alvo, guardado, formato);
            else mostrarPedido(palco, titulo, alvo, formato);
        });
    }

    /* O alternador Simples/Completo, presente nas duas telas. */
    function ligarAlternador(palco, titulo, alvo, formato) {
        ui.qq('[data-formato]', palco).forEach(function (b) {
            if (b.tagName !== 'BUTTON') return;
            b.addEventListener('click', function () {
                var novo = b.getAttribute('data-formato');
                if (novo === formato) return;
                abrir(palco, titulo, alvo, novo);
            });
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
            var guardados = {};
            lista.forEach(function (e) { guardados[e.titulo + '|' + e.formato] = true; });
            var hoje = ui.$('hoje-estudo');
            if (hoje) hoje.innerHTML = renderHoje(guardados);
        });
        /* Os índices do comentário chegam por fetch, depois da primeira
           pintura; quando chegarem, o bloco de hoje ganha o botão. */
        if (B.comentario) {
            Promise.all([
                B.comentario.carregar(),
                B.lugares ? B.lugares.carregar() : null
            ]).then(function () {
                var hoje = ui.$('hoje-estudo');
                if (!hoje || !hoje.innerHTML) return;
                B.estudos.listar().then(function (lista) {
                    var g = {};
                    lista.forEach(function (e) { g[e.titulo + '|' + e.formato] = true; });
                    hoje.innerHTML = renderHoje(g);
                });
            });
        }
    }

    function mostrarPedido(palco, titulo, alvo, formato) {
        palco.innerHTML = renderPedido(titulo, alvo, formato);
        ligarAlternador(palco, titulo, alvo, formato);

        var g = ui.q('[data-gerar]', palco);
        if (g) g.addEventListener('click', function () { gerar(palco, titulo, alvo, formato); });

        var cp = ui.q('[data-copiar-prompt]', palco);
        if (cp) cp.addEventListener('click', function () {
            B.comentario.fontes(alvo).then(function (fontes) {
                var p = B.prompts.montar(alvo, store.get().config, formato, fontes);
                return ui.copiar(p.sistema + '\n\n---\n\n' + p.usuario);
            }).then(function (ok) {
                if (ok) ui.toast('Pedido copiado. Cole no Claude e traga a resposta de volta.');
            });
        });

        var col = ui.q('[data-colar]', palco);
        if (col) col.addEventListener('click', function () { colar(palco, titulo, alvo, formato); });
    }

    function mostrarEstudo(palco, titulo, alvo, estudo, formato) {
        formato = formato || estudo.formato || 'completo';
        palco.innerHTML = cabecalhoEstudo(titulo, alvo, estudo, formato) +
            renderTexto(estudo, alvo);
        ligarAlternador(palco, titulo, alvo, formato);

        ui.q('[data-compartilhar]', palco).addEventListener('click', function () {
            ui.compartilhar(titulo, '# ' + titulo + '\n\n' + estudo.texto);
        });

        var bLa = ui.q('[data-renovar-la]', palco);
        if (bLa) bLa.addEventListener('click', function () {
            /* A área de transferência é o caminho que não depende de o
               endereço atravessar a moldura do Claude. */
            ui.copiar(titulo);
            var link = B.travessia.linkOficina(titulo, formato);
            ui.toast('"' + titulo + '" copiado. Toque em renovar na Oficina.');
            window.open(link, '_blank', 'noopener');
        });

        var bRefazer = ui.q('[data-refazer]', palco);
        if (bRefazer) bRefazer.addEventListener('click', function () {
            ui.confirmar('Refazer o estudo',
                'Isto apaga o estudo atual e gera outro do zero, gastando mais um pedido da ' +
                'sua cota gratuita do dia. O texto novo será diferente deste.',
                { textoOk: 'Refazer' }).then(function (ok) {
                    if (ok) gerar(palco, titulo, alvo, formato);
                });
        });

        ui.q('[data-apagar]', palco).addEventListener('click', function () {
            ui.confirmar('Apagar estudo', 'Apagar "' + titulo + '" do aparelho? Para ter de volta, ' +
                'seria preciso gerar outra vez.', { textoOk: 'Apagar', perigo: true }).then(function (ok) {
                    if (!ok) return;
                    B.estudos.remover(titulo, formato).then(function () {
                        ui.toast('Estudo apagado.');
                        B.app.ir('estudo');
                    });
                });
        });
    }

    /* ---------- geração em tempo real ---------- */

    function gerar(palco, titulo, alvo, formato) {
        var cfg = store.get().config;
        /* Os comentários entram no pedido quando existem; buscá-los é um
           fetch de arquivos que podem nem estar aqui, então nada espera
           por eles além do próprio pedido. */
        B.comentario.fontes(alvo).then(function (fontes) {
            gerarCom(palco, titulo, alvo, formato, cfg, fontes);
        }, function () { gerarCom(palco, titulo, alvo, formato, cfg, []); });
    }

    function gerarCom(palco, titulo, alvo, formato, cfg, fontes) {
        var pedido = B.prompts.montar(alvo, cfg, formato, fontes);
        var ctrl = new AbortController();
        emCurso = { abortar: function () { ctrl.abort(); }, titulo: titulo };

        palco.innerHTML = cabecalhoEstudo(titulo, alvo, null, formato) +
            '<div class="gerando" id="gerando">' +
            '<div class="gerando-topo">' +
            '<span class="pulso"></span>' +
            '<span id="status">preparando o pedido…</span>' +
            '<button class="btn btn--fraco" data-cancelar>Parar</button>' +
            '</div>' +
            '<div class="gerando-pensa" id="pensa" hidden></div>' +
            '</div>' +
            '<article class="prosa" id="prosa"></article>';

        ligarAlternador(palco, titulo, alvo, formato);
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
                titulo: titulo, formato: formato,
                tipo: alvo.capitulo ? 'capitulo' : 'livro',
                livro: alvo.livro.nome, cap: alvo.capitulo || null,
                texto: r.texto, modelo: r.modelo, custo: r.custo,
                buscas: buscas,
                criado: new Date().toISOString()
            };
            return B.estudos.salvar(estudo).then(function () {
                mostrarEstudo(palco, titulo, alvo, estudo, formato);
                ui.toast('Estudo pronto e guardado no aparelho.');
            }, function (err) {
                /* O texto existe, custou tempo (e limite diário) e não pode
                   sumir porque a gravação falhou. Mostra assim mesmo, com
                   saída para tentar de novo ou levar o arquivo embora. */
                mostrarEstudo(palco, titulo, alvo, estudo, formato);
                avisarNaoGuardou(palco, estudo, err);
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
                b.onclick = function () { gerar(palco, titulo, alvo, formato); };
                ui.$('gerando').appendChild(b);
                return;
            }
            mostrarErro(palco, titulo, alvo, err, function () {
                gerar(palco, titulo, alvo, formato);
            });
        });
    }

    /* Faixa no topo do estudo que não conseguiu ser gravado. Fica ali até
       a gravação dar certo — some sozinha quando dá. */
    function avisarNaoGuardou(palco, estudo, err) {
        var caixa = document.createElement('div');
        caixa.className = 'aviso aviso--erro';
        caixa.innerHTML = '<b>O estudo não ficou guardado.</b><br>' +
            esc(err && err.message ? err.message : 'O navegador recusou a gravação.') +
            '<br>O texto está aqui na tela — se você sair agora, ele se perde.';

        var tentar = document.createElement('button');
        tentar.className = 'btn btn--forte btn--largo';
        tentar.textContent = 'Tentar guardar de novo';
        tentar.onclick = function () {
            tentar.disabled = true;
            B.estudos.salvar(estudo).then(function () {
                caixa.remove();
                ui.toast('Agora sim: guardado no aparelho.');
            }, function (e2) {
                tentar.disabled = false;
                ui.toast(e2.message, 'erro');
            });
        };

        var baixar = document.createElement('button');
        baixar.className = 'btn btn--fraco btn--largo';
        baixar.textContent = 'Baixar o estudo como arquivo';
        baixar.onclick = function () {
            ui.baixar(estudo.titulo.replace(/[^\wÀ-ÿ ]/g, '') + '.md',
                '# ' + estudo.titulo + '\n\n' + estudo.texto, 'text/markdown');
        };

        caixa.appendChild(tentar);
        caixa.appendChild(baixar);
        var topo = ui.q('.tela-topo', palco);
        if (topo) topo.insertAdjacentElement('afterend', caixa);
        else palco.prepend(caixa);
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

    /* Traz de fora um estudo que a pessoa gerou em outro lugar. */
    function colar(palco, titulo, alvo, formato) {
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
                titulo: titulo, formato: formato,
                tipo: alvo.capitulo ? 'capitulo' : 'livro',
                livro: alvo.livro.nome, cap: alvo.capitulo || null,
                texto: t, modelo: 'colado à mão', custo: 0,
                criado: new Date().toISOString()
            };
            B.estudos.salvar(estudo).then(function () {
                mostrarEstudo(palco, titulo, alvo, estudo, formato);
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
