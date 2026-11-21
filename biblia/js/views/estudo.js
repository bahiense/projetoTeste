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
    var encicloDados = null;
    var encicloBuscando = null;

    function carregarEnciclopedia() {
        if (encicloDados) return Promise.resolve(encicloDados);
        if (encicloBuscando) return encicloBuscando;
        encicloBuscando = fetch('data/enciclopedia-estudos.json')
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (d) { encicloDados = d || null; return encicloDados; })
            .catch(function () { return null; });
        return encicloBuscando;
    }

    function normBusca(s) {
        return String(s || '')
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    /* ---------- a estante ---------- */

    function render(arg) {
        if (arg && String(arg).charAt(0) === '@') {
            return renderPortalEnciclo(String(arg).slice(1));
        }
        if (arg) return renderEstudo(arg);

        return '' +
            '<header class="tela-topo">' +
            '<h2>Estudo</h2>' +
            '<p class="tela-sub">Escreva um capítulo (<b>João 3</b>), o nome do livro (<b>João</b>), ' +
            'ou qualquer <b>assunto, palavra em hebraico/grego, personagem ou teólogo</b>.</p>' +
            '</header>' +

            '<div class="busca">' +
            '<input class="campo" id="busca" type="search" autocomplete="off" ' +
            'placeholder="Gênesis 1, justificação, graça, hesed, Calvino, Davi…" enterkeyhint="go">' +
            '<div class="sugestoes" id="sugestoes"></div>' +
            '</div>' +

            /* Depois da busca e antes da estante: a busca é a ferramenta da
               tela e não pode descer oito cartões; o dia é o que se quer ver
               sem procurar. */
            '<div id="hoje-estudo"></div>' +

            cartaoJogos() +

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
        var temEstudo = guardados && guardados[x.ref + '|completo'];

        return '<div class="hoje-estudo' + (x.lido ? ' is-lido' : '') + '">' +
            '<div class="hoje-topo">' +
            '<span class="hoje-icone">' + x.grupo.icone + '</span>' +
            '<b>' + esc(x.ref) + '</b>' +
            '<small>' + (x.lido ? 'lido hoje' : 'a ler') + '</small>' +
            '</div>' +
            '<div class="grupo-botoes grupo-botoes--dois">' +
            '<a class="btn btn--fraco" href="#/ler/' + enc + '">📖 Ler</a>' +
            '<a class="btn ' + (temEstudo ? 'btn--feito' : 'btn--estudo') +
            '" href="#/estudo/' + enc + '">✦ Estudar' + (temEstudo ? '' : ' (falta)') + '</a>' +
            '</div>' +
            '</div>';
    }

    /**
     * A porta dos jogos de memorização.
     *
     * Fica na tela de Estudo, abaixo do dia: estudar um capítulo é uma
     * coisa, ter na ponta da língua o que não se procura (os dias da
     * criação, os doze apóstolos, a ordem dos livros) é outra — e esta
     * segunda se treina por repetição, não por leitura.
     */
    function cartaoJogos() {
        var r = B.jogos ? B.jogos.resumo() : { baralhos: 0, itens: 0, decorados: 0 };
        return '<a class="cartao orar-porta" href="#/orar">' +
            '<span class="jg-porta-icone">🙏</span>' +
            '<span class="jg-porta-txt"><b>Orações</b>' +
            '<small>A oração que fecha cada estudo, para orar — não para ler de novo</small>' +
            '</span>' +
            '<span class="estudo-seta">›</span></a>' +

            (r.baralhos
                ? '<a class="cartao jg-porta" href="#/jogos">' +
                  '<span class="jg-porta-icone">🎯</span>' +
                  '<span class="jg-porta-txt"><b>Jogos de memorização</b>' +
                  '<small>' + r.baralhos + ' assuntos para ter de cor · ' + r.itens +
                  ' itens · ' + r.decorados + ' já decorado' + (r.decorados === 1 ? '' : 's') +
                  '</small></span>' +
                  '<span class="estudo-seta">›</span></a>'
                : '') +

            '<h3 class="secao">Biblioteca & Ferramentas de Estudo</h3>' +
            '<div class="portais-estudo-grade">' +
            '<a class="cartao portal-estudo-card" href="#/estudo/@lexico">' +
            '<span class="jg-porta-icone">🔤</span>' +
            '<span class="jg-porta-txt"><b>Léxico Hebraico & Grego</b>' +
            '<small>Palavras no original de A a Z com código Strong e significado exegético</small></span>' +
            '<span class="estudo-seta">›</span></a>' +

            '<a class="cartao portal-estudo-card" href="#/teologia">' +
            '<span class="jg-porta-icone">🏛️</span>' +
            '<span class="jg-porta-txt"><b>Símbolos de Fé Reformados</b>' +
            '<small>6 Confissões e Catecismos históricos (Westminster, Heidelberg, Belga, Dort)</small></span>' +
            '<span class="estudo-seta">›</span></a>' +

            '<a class="cartao portal-estudo-card" href="#/estudo/@teologos">' +
            '<span class="jg-porta-icone">📜</span>' +
            '<span class="jg-porta-txt"><b>Vozes da História da Igreja</b>' +
            '<small>Comentários de Agostinho, Calvino, Lutero, Spurgeon, Owen, Matthew Henry…</small></span>' +
            '<span class="estudo-seta">›</span></a>' +

            '<a class="cartao portal-estudo-card" href="#/estudo/@personagens">' +
            '<span class="jg-porta-icone">👤</span>' +
            '<span class="jg-porta-txt"><b>Quem é Quem na Bíblia</b>' +
            '<small>Enciclopédia de personagens bíblicos de A a Z e onde aparecem</small></span>' +
            '<span class="estudo-seta">›</span></a>' +

            '<a class="cartao portal-estudo-card" href="#/estudo/@cristo">' +
            '<span class="jg-porta-icone">✝️</span>' +
            '<span class="jg-porta-txt"><b>Cristo em Toda a Escritura</b>' +
            '<small>Mapa Cristocêntrico capítulo a capítulo: tipologia, promessa e cumprimento</small></span>' +
            '<span class="estudo-seta">›</span></a>' +

            '<a class="cartao portal-estudo-card" href="#/mapa">' +
            '<span class="jg-porta-icone">🗺️</span>' +
            '<span class="jg-porta-txt"><b>Atlas Bíblico & Rotas</b>' +
            '<small>As 6 grandes jornadas bíblicas e busca de todos os lugares com fronteiras de hoje</small></span>' +
            '<span class="estudo-seta">›</span></a>' +
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
                    '">' +
                    '<span class="estudo-tipo">' + (e.tipo === 'livro' ? '📕' : '📄') + '</span>' +
                    '<span class="estudo-txt"><b>' + esc(e.titulo) + '</b>' +
                    '<small>' +
                    (e.tipo === 'livro' ? 'livro inteiro' : 'capítulo') +
                    ' · ' + ui.quando(e.criado) +
                    '</small></span>' +
                    '<span class="estudo-seta">›</span></a>';
            }).join('') + '</div>';
    }

    /* ---------- o estudo ---------- */

    /*
     * Só existe um formato: o completo.
     *
     * Havia dois, e a escolha custava um toque a cada abertura, 4 MB no
     * APK e um galho em todo código que mostra estudo. Endereço velho
     * ("#/estudo/João 3/simples") continua abrindo — no completo, que é
     * o que existe.
     */
    function separarFormato(ref) {
        var m = String(ref).match(/^(.*)\/(simples|completo)$/);
        return { ref: m ? m[1] : ref, formato: 'completo' };
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

    function faixaTempo(titulo, alvo) {
        if (!B.tempo || !alvo || !alvo.livro) return '';
        var info = B.tempo.doCapitulo(alvo.livro, alvo.capitulo);
        if (!info) return '';
        return '<a class="faixa-tempo" href="#/tempo/' + encodeURIComponent(titulo) + '">' +
            '<div class="faixa-tempo-topo">' +
            '<span class="selo selo--aqui">⏳ ' + esc(info.era.curto) + '</span>' +
            '<span class="faixa-tempo-data">' + esc(info.data) + '</span>' +
            '<span class="faixa-tempo-abrir">Linha do tempo ›</span>' +
            '</div>' +
            '<div class="faixa-tempo-corpo">' +
            '<b>👑 ' + esc(info.reinado) + '</b>' +
            '<small>🏛️ ' + esc(info.imperio) + ' · ' + esc(info.situacao) + '</small>' +
            '</div>' +
            '</a>';
    }

    function blocoFerramentasCompleto(titulo, alvo) {
        if (!alvo) return '';
        var html = faixaTempo(titulo, alvo);
        if (alvo.capitulo) {
            var ref = alvo.livro.nome + ' ' + alvo.capitulo;
            var enc = encodeURIComponent(ref);
            var quantos = B.doutrina ? B.doutrina.temas(alvo.livro.usfm, alvo.capitulo).length : 0;
            html += '<div class="grupo-botoes grupo-botoes--dois">' +
                '<a class="btn btn--fraco" href="#/tempo/' + enc +
                '">⏳ Linha do tempo</a>' +
                (B.lugares && B.lugares.temAlgum(alvo.livro.usfm, alvo.capitulo)
                    ? '<a class="btn btn--fraco" href="#/mapa/' +
                    enc + '">🗺️ Mapa</a>'
                    : '') +
                '<a class="btn btn--fraco" href="#/exercicios/' +
                enc + '">✍️ Exercícios</a>' +
                '<a class="btn btn--fraco" href="#/videos/' + enc +
                '">▶ Em vídeo</a>' +
                (quantos
                    ? '<a class="btn btn--fraco" href="#/teologia/' +
                    enc + '">🏛️ Teologia reformada <b>' + quantos +
                    '</b></a>'
                    : '') +
                '</div>';
        }
        return html ? '<div class="estudo-ferramentas-resto">' + html + '</div>' : '';
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

            (alvo.capitulo && B.contexto && B.contexto.renderFioNarrativa
                ? B.contexto.renderFioNarrativa(alvo.livro, alvo.capitulo)
                : '') +

            (alvo.capitulo && B.contexto && B.contexto.renderParalelosCapitulo
                ? B.contexto.renderParalelosCapitulo(alvo.livro, alvo.capitulo)
                : '') +

            (!alvo.capitulo ? faixaTempo(titulo, alvo) : '') +
            (!alvo.capitulo && guardado
                ? '<div class="apostila-livro-topo" style="margin-top:12px">' +
                  '<button class="btn btn--forte btn--largo" type="button" data-baixar-pdf-livro>' +
                  '📚 Baixar Apostila do Livro Inteiro (PDF)</button>' +
                  '<small class="dica" style="display:block;margin-top:4px;text-align:center">' +
                  'Gera um único PDF com capa, sumário, este panorama e todos os estudos de capítulos de ' + esc(alvo.livro.nome) + ' com as passagens bíblicas abertas.</small>' +
                  '</div>'
                : '') +
            '</header>';
    }

    /* Tela de antes de gerar: diz o que vai acontecer e quanto custa. */
    function renderPedido(titulo, alvo, formato) {
        var cfg = store.get().config;
        var peloClaude = B.ia.modo() === 'claude';
        var temChave = B.ia.pronto(cfg);
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
                '<p class="dica">O estudo de <b>' +
                esc(titulo) + '</b> ainda não está neste aparelho. Quem escreve os estudos é ' +
                'a versão do app que roda dentro do <b>Claude</b>; de lá eles vêm em pacotes, ' +
                'e entram aqui sozinhos toda vez que você abre o app.</p>' +
                '<a class="btn btn--forte btn--largo" href="#/config">Ver como os estudos chegam</a>' +
                '</div>';
        }

        var itens = alvo.capitulo
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

        var cabeca = alvo.capitulo
            ? 'Explicação completa do capítulo'
            : 'Panorama do livro inteiro';

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
            'Leva de 1 a 3 minutos. ' +
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

    /* Extrai a seção "### O capítulo, parte por parte" de um estudo completo */
    function extrairSecaoPartePorParte(textoCompleto) {
        if (!textoCompleto) return '';
        var linhas = String(textoCompleto).split(/\r?\n/);
        var dentro = false;
        var coletadas = [];
        for (var i = 0; i < linhas.length; i++) {
            var linha = linhas[i];
            if (!dentro) {
                if (/^###\s+.*(?:parte por parte|bloco a bloco|passo a passo)/i.test(linha)) {
                    dentro = true;
                    coletadas.push(linha);
                }
            } else {
                if (/^###\s+/.test(linha) && !/^###\s*(?:vv?\.|vers[íi]culos?)\s*\d+/i.test(linha)) {
                    break;
                }
                coletadas.push(linha);
            }
        }
        return coletadas.join('\n').trim();
    }

    /* Coloca "### O capítulo, parte por parte" como a primeira seção */
    function colocarPartePorPartePrimeiro(textoBase, textoCompletoAux) {
        if (!textoBase) return textoBase;
        var base = String(textoBase);
        var secaoExistente = extrairSecaoPartePorParte(base);
        var secaoDoCompleto = textoCompletoAux ? extrairSecaoPartePorParte(textoCompletoAux) : '';
        var secaoFinal = secaoDoCompleto || secaoExistente;
        if (!secaoFinal) return base;

        if (secaoExistente) {
            base = base.replace(secaoExistente, '').replace(/\n{3,}/g, '\n\n');
        }

        /* Insere antes do primeiro subtítulo ### ("### Onde estamos") */
        var mPrimeiroH3 = base.match(/^###\s+/m);
        if (mPrimeiroH3 && typeof mPrimeiroH3.index === 'number') {
            return base.slice(0, mPrimeiroH3.index) + secaoFinal + '\n\n' + base.slice(mPrimeiroH3.index);
        }
        return base + '\n\n' + secaoFinal;
    }

    function renderTexto(estudo, alvo, formato, estudoCompleto) {
        var textoParaRender = estudo.texto || '';
        if (alvo && alvo.capitulo) {
            textoParaRender = colocarPartePorPartePrimeiro(textoParaRender, '');
        }
        var antEst = (alvo && alvo.capitulo && B.contexto && B.contexto.vizinhoCapitulo)
            ? B.contexto.vizinhoCapitulo(alvo.livro, alvo.capitulo, -1)
            : null;
        var proxEst = (alvo && alvo.capitulo && B.contexto && B.contexto.vizinhoCapitulo)
            ? B.contexto.vizinhoCapitulo(alvo.livro, alvo.capitulo, 1)
            : null;
        return '<article class="prosa" id="prosa">' + B.md.render(textoParaRender) + '</article>' +

            emVideo(alvo) +

            /* Fixar o que acabou de ser lido: é aqui que a pessoa está
               quando termina o estudo, e é aqui que os exercícios e o
               jogo do capítulo têm serventia. */
            (alvo && alvo.capitulo
                ? '<section class="cartao fixar" id="fixar">' +
                  '<p class="carregando">Preparando o que fixa este capítulo…</p></section>'
                : '') +

            '<div class="rodape-estudo">' +
            '<small>' + esc(estudo.modelo || '') +
            (estudo.custo ? ' · US$ ' + estudo.custo.toFixed(3) : '') +
            (estudo.buscas ? ' · ' + estudo.buscas + ' buscas na web' : '') +
            ' · gerado ' + ui.quando(estudo.criado) + '</small>' +
            '<div class="rodape-botoes">' +
            '<button class="btn btn--fraco" type="button" data-baixar-pdf>📄 Baixar PDF</button>' +
            (!alvo.capitulo
                ? '<button class="btn btn--fraco" type="button" data-baixar-pdf-livro>📚 Apostila do Livro Inteiro (PDF)</button>'
                : '') +
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
            '</div>' +
            (alvo && alvo.capitulo
                ? '<nav class="paginacao paginacao--estudo">' +
                  (antEst
                      ? '<a class="btn btn--fraco" href="#/estudo/' + encodeURIComponent(antEst.ref) +
                        '">‹ Estudo de ' + esc(antEst.ref) + '</a>'
                      : '<span></span>') +
                  (proxEst
                      ? '<a class="btn btn--fraco" href="#/estudo/' + encodeURIComponent(proxEst.ref) +
                        '">Estudo de ' + esc(proxEst.ref) + ' ›</a>'
                      : '<span></span>') +
                  '</nav>'
                : '');
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

    /**
     * O quadro "Fixar este capítulo", no fim do estudo.
     *
     * O estudo passa; o que fica é o que se responde. Este quadro junta
     * os exercícios do capítulo e um jogo de memorização dele no lugar
     * onde a pessoa está quando acaba de ler. A oração não está aqui:
     * ela subiu para as ações, logo abaixo da leitura.
     *
     * Os exercícios podem não existir ainda (são escritos na Oficina),
     * e isso é dito em vez de prometido: botão que leva a tela vazia é
     * pior que botão nenhum.
     */
    function preencherFixar(palco, alvo, titulo) {
        var caixa = ui.q('#fixar', palco);
        if (!caixa || !alvo || !alvo.capitulo) return;
        var ref = alvo.livro.nome + ' ' + alvo.capitulo;
        var enc = encodeURIComponent(ref);
        var jogo = B.jogos ? B.jogos.sugerido(alvo.livro.usfm, alvo.capitulo) : null;

        B.estudos.obter(ref, 'exercicios').catch(function () { return null; })
            .then(function (ex) { pintarFixar(caixa, ref, enc, jogo, ex); });
    }

    function quantasPerguntas(ex) {
        if (!ex || !ex.texto) return 0;
        var m = String(ex.texto).match(/"p"\s*:/g);
        return m ? m.length : 0;
    }

    function pintarFixar(caixa, ref, enc, jogo, ex) {
        var n = quantasPerguntas(ex);
        caixa.innerHTML = '<h3>Fixar este capítulo</h3>' +
            '<p class="dica">Ler uma vez é o começo. O que fica é o que você responde e ' +
            'joga — e isto aqui é o que existe deste capítulo.</p>' +
            (ex
                ? '<a class="btn btn--forte btn--largo" href="#/exercicios/' + enc + '">' +
                  '✍️ Exercícios deste capítulo' + (n ? ' · ' + n + ' perguntas' : '') + '</a>'
                : '<p class="dica"><b>Os exercícios deste capítulo ainda não foram ' +
                  'escritos.</b> Eles são gerados na Oficina e chegam nos pacotes, junto ' +
                  'com os estudos.</p>') +
            (jogo
                ? '<a class="btn btn--fraco btn--largo" href="#/jogos/' +
                  encodeURIComponent(jogo.id) + '">🎯 ' + esc(jogo.nome) + '</a>'
                : '');
    }

    /* ---------- montagem ---------- */

    function depois(el, arg) {
        if (arg && String(arg).charAt(0) === '@') {
            return montarPortalEnciclo(String(arg).slice(1));
        }
        if (!arg) return montarEstante(el);
        var palco = ui.$('palco');
        if (!palco) return;
        var titulo = palco.getAttribute('data-titulo');
        var formato = palco.getAttribute('data-formato');
        var alvo = bib.interpretar(titulo);
        abrir(palco, titulo, alvo, formato);
    }

    /* Mostra o estudo guardado; se não houver nada, mostra o pedido. */
    function abrir(palco, titulo, alvo, formato) {
        palco.setAttribute('data-formato', formato);
        B.estudos.obter(titulo, formato).then(function (guardado) {
            if (guardado) mostrarEstudo(palco, titulo, alvo, guardado, formato);
            else mostrarPedido(palco, titulo, alvo, formato);
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

            var qNorm = normBusca(t);
            if (qNorm.length >= 2) {
                if (!encicloDados) {
                    carregarEnciclopedia().then(function () {
                        if (campo.value.trim() === t) pintarSugestoes();
                    });
                } else {
                    html += buscarNaEnciclopediaSugestoes(qNorm, alvo);
                }
            }
            sug.innerHTML = html;
        }

        function buscarNaEnciclopediaSugestoes(qNorm, alvoLivro) {
            if (!encicloDados) return '';
            var extra = '';
            var vistos = {};
            if (alvoLivro) {
                vistos[alvoLivro.livro.nome + (alvoLivro.capitulo ? ' ' + alvoLivro.capitulo : '')] = true;
            }

            /* 1. Palavras no original (Léxico) */
            var lexHits = (encicloDados.lexico || []).filter(function (lx) {
                return normBusca((lx.termo || lx.p || '') + ' ' + (lx.strong || lx.s || '') + ' ' + (lx.resumo || lx.d || '')).indexOf(qNorm) >= 0;
            }).slice(0, 3);
            lexHits.forEach(function (lx) {
                var r0 = lx.ref || (lx.r && lx.r[0]) || '';
                if (!r0) return;
                var st = lx.strong || lx.s || '';
                var tm = lx.termo || lx.p || '';
                extra += item(r0, '🔤 Léxico: ' + tm + (st ? ' [' + st + ']' : '') + ' — em ' + r0, false);
                vistos[r0] = true;
            });

            /* 2. Personagens Bíblicos */
            var perHits = (encicloDados.personagens || []).filter(function (pe) {
                return normBusca(pe.nome || pe.n || '').indexOf(qNorm) >= 0;
            }).slice(0, 3);
            perHits.forEach(function (pe) {
                var listaR = pe.refs || pe.r || [];
                var r0 = listaR[0] || '';
                if (!r0) return;
                extra += item(r0, '👤 Personagem: ' + (pe.nome || pe.n) + ' (' + listaR.length + ' capítulos) — ver em ' + r0, false);
                vistos[r0] = true;
            });

            /* 3. Teólogos */
            var teoHits = (encicloDados.teologos || []).filter(function (tg) {
                return normBusca(tg.nome || tg.n || '').indexOf(qNorm) >= 0;
            }).slice(0, 2);
            teoHits.forEach(function (tg) {
                var itensTg = tg.itens || tg.c || [];
                var c0 = itensTg[0] || null;
                if (!c0) return;
                var refTg = c0.ref || c0.r || '';
                if (!refTg) return;
                extra += item(refTg, '📜 Teólogo: ' + (tg.nome || tg.n) + ' (' + (tg.n || tg.t || itensTg.length) + ' estudos) — ex.: ' + refTg, false);
                vistos[refTg] = true;
            });

            /* 4. Busca temática por palavras nos estudos */
            var estObj = encicloDados.estudos || {};
            var refs = estObj.refs || [];
            var resumos = estObj.resumos || [];
            var palavras = estObj.palavras || {};
            var tokens = qNorm.split(/\s+/).filter(function (tk) { return tk.length >= 3; });
            if (tokens.length) {
                var placar = {};
                tokens.forEach(function (tk) {
                    if (palavras[tk]) {
                        palavras[tk].forEach(function (idx) {
                            placar[idx] = (placar[idx] || 0) + 3;
                        });
                    } else {
                        var chavesP = Object.keys(palavras);
                        for (var i = 0; i < chavesP.length; i++) {
                            if (chavesP[i].indexOf(tk) === 0) {
                                palavras[chavesP[i]].forEach(function (idx) {
                                    placar[idx] = (placar[idx] || 0) + 1;
                                });
                            }
                        }
                    }
                });
                var candidatos = Object.keys(placar).map(function (k) {
                    return { idx: parseInt(k, 10), pts: placar[k] };
                });
                candidatos.sort(function (a, b) { return b.pts - a.pts || a.idx - b.idx; });
                var cont = 0;
                for (var c = 0; c < candidatos.length && cont < 6; c++) {
                    var refEst = refs[candidatos[c].idx];
                    if (!refEst || vistos[refEst]) continue;
                    vistos[refEst] = true;
                    var resCurto = resumos[candidatos[c].idx] || 'Estudo temático relacionado';
                    if (resCurto.length > 95) resCurto = resCurto.slice(0, 92) + '…';
                    extra += item(refEst, '✦ Assunto: ' + resCurto, false);
                    cont++;
                }
            }
            return extra;
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
        /* O índice dos lugares chega por fetch, depois da primeira pintura;
           quando chegar, o bloco de hoje ganha o botão de Mapa. */
        if (B.lugares) {
            B.lugares.carregar().then(function () {
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
        if (B.contexto) {
            B.contexto.ligar(palco, alvo.livro, alvo.capitulo || 1);
            if (alvo.capitulo && B.contexto.preencherFioNarrativa) {
                B.contexto.preencherFioNarrativa(palco, alvo.livro, alvo.capitulo, null);
            }
        }

        var g = ui.q('[data-gerar]', palco);
        if (g) g.addEventListener('click', function () { gerar(palco, titulo, alvo, formato); });

        var cp = ui.q('[data-copiar-prompt]', palco);
        if (cp) cp.addEventListener('click', function () {
            B.prompts.preparar(alvo, store.get().config, formato).then(function (p) {
                return ui.copiar(p.sistema + '\n\n---\n\n' + p.usuario);
            }).then(function (ok) {
                if (ok) ui.toast('Pedido copiado. Cole no Claude e traga a resposta de volta.');
            });
        });

        var col = ui.q('[data-colar]', palco);
        if (col) col.addEventListener('click', function () { colar(palco, titulo, alvo, formato); });
    }

    /**
     * Onde a leitura acaba e o estudo começa.
     *
     * A tela tinha uma coisa só, do começo ao fim: o texto inteiro,
     * com a leitura em blocos no meio e o botão de marcar lá embaixo,
     * depois de tudo. Quem só queria ler o capítulo tinha de rolar o
     * estudo inteiro para dizer que leu.
     *
     * Então a tela é cortada em duas no lugar certo: acabou a leitura
     * parte por parte, entram as duas ações do dia — marcar a leitura
     * e orar o capítulo. Daí para baixo é aprofundamento, num bloco
     * com nome, atalhos e as ferramentas do capítulo. Nada foi
     * escondido: o que mudou é a ordem.
     */
    function inserirRestanteAposPartePorParte(palco, titulo, alvo, formato, estudo) {
        var prosa = ui.$('prosa');
        if (!prosa) return;

        var corte = acharCorteDoEstudo(prosa);
        var temCap = !!(alvo && alvo.capitulo);

        /* As duas ações, logo abaixo da leitura em blocos. */
        if (temCap) {
            var acoes = document.createElement('div');
            acoes.className = 'estudo-acoes';
            acoes.innerHTML = htmlAcoesLeitura(alvo, estudo);
            if (corte && corte.parentNode === prosa) prosa.insertBefore(acoes, corte);
            else prosa.parentNode.insertBefore(acoes, prosa.nextSibling);
        }

        /* Sem seção abaixo da leitura não há área a montar — e um
           "Aprofundar" sem nada embaixo seria pior que nenhum. As
           ferramentas do capítulo, aí, ficam no fim do texto. */
        var secao = null;
        if (corte && corte.parentNode === prosa) {
            secao = document.createElement('section');
            secao.className = 'aprofundar';
            secao.innerHTML =
                '<h3 class="aprofundar-tit">Aprofundar</h3>' +
                '<p class="dica">A leitura do capítulo termina acima. Daqui para baixo é o ' +
                'estudo dele: contexto, palavras no original, o que dizem os teólogos, onde ' +
                'discordam e a ligação com Cristo. Pode ser agora ou noutro dia.</p>';
            prosa.insertBefore(secao, corte);
            while (secao.nextSibling) secao.appendChild(secao.nextSibling);
        }

        /* As ferramentas do capítulo (linha do tempo, mapa, exercícios,
           vídeo, teologia) são aprofundamento também, e é aqui que elas
           param de atravessar a leitura. */
        if (temCap) {
            var htmlFerr = blocoFerramentasCompleto(titulo, alvo);
            if (htmlFerr) {
                var divFerr = document.createElement('div');
                divFerr.innerHTML = htmlFerr;
                var noFerr = divFerr.firstChild;
                if (noFerr) {
                    if (secao) secao.insertBefore(noFerr, corte);
                    else prosa.appendChild(noFerr);
                }
            }
        }

        if (secao) barraDeSecoes(secao, corte);
    }

    /* O primeiro título de seção depois da leitura parte por parte — que é
       onde a leitura acaba. Os títulos de versículo ("vv. 1-4") são da
       própria leitura e não contam. */
    function acharCorteDoEstudo(prosa) {
        var h4s = ui.qq('h4', prosa);
        for (var i = 0; i < h4s.length; i++) {
            var txt = (h4s[i].textContent || '').trim();
            if (!/parte por parte|bloco a bloco|passo a passo/i.test(txt)) continue;
            for (var j = i + 1; j < h4s.length; j++) {
                var t2 = (h4s[j].textContent || '').trim();
                if (!/^(?:vv?\.|vers[íi]culos?)\s*\d+/i.test(t2)) return h4s[j];
            }
            return null;
        }
        return null;
    }

    /* As duas ações do dia. A oração só aparece quando o estudo tem uma:
       botão que abre tela vazia é pior que botão nenhum. */
    function htmlAcoesLeitura(alvo, estudo) {
        var hoje = B.plano ? B.plano.leuHoje(alvo.livro.nome, alvo.capitulo) : false;
        var enc = encodeURIComponent(alvo.livro.nome + ' ' + alvo.capitulo);
        var temOracao = !!(estudo && estudo.texto && B.oracoes && B.oracoes.extrair &&
            B.oracoes.extrair(estudo.texto));
        return '<button class="btn ' + (hoje ? 'btn--feito' : 'btn--forte') +
            ' btn--largo" data-marcar-estudo-fim' +
            (hoje ? ' aria-label="Lido hoje. Tocar desfaz o registro de hoje."' : '') + '>' +
            (hoje ? '✓ Leitura de hoje registrada' : '✓ Marcar leitura de hoje') + '</button>' +
            (temOracao
                ? '<a class="btn btn--fraco btn--largo" href="#/orar/' + enc +
                '">🙏 Orar este capítulo</a>'
                : '') +
            '<button class="btn btn--fraco btn--largo" type="button" data-baixar-pdf>' +
            '📄 Baixar PDF deste estudo</button>';
    }

    /* Atalhos e organização em Gavetas/Abas para o celular dentro do Aprofundar */
    function classificarPilarSecao(titulo) {
        var t = (titulo || '').toLowerCase();
        if (/onde estamos|mundo por tr|quem [ée] quem|os lugares|arqueologia/.test(t)) return 'contexto';
        if (/vers[íi]culos?-chave|palavras? no original|lente hermen|tesouro exeg|cart[ãa]o do livro|mapa do livro|fio da meada/.test(t)) return 'exegese';
        if (/te[óo]logos|int[ée]rpretes discordam|dificuldades|doutrinas sistem|catequese|fixa[çc][ãa]o doutrin/.test(t)) return 'teologia';
        if (/liga[çc][õo]es com o resto|aponta para cristo|cristo neste livro|teologia do pacto|grandes temas|passagens que todo/.test(t)) return 'cristo';
        return 'vida';
    }

    function iconeSecaoAprofundar(titulo) {
        var t = (titulo || '').toLowerCase();
        if (/^[📜🔍🏺⚖️🛡️💎🏛️🗄️]/.test(t)) return '';
        if (/onde estamos/.test(t)) return '🧭 ';
        if (/mundo por tr|mundo do livro/.test(t)) return '🏛️ ';
        if (/quem [ée] quem/.test(t)) return '👤 ';
        if (/os lugares/.test(t)) return '📍 ';
        if (/vers[íi]culos?-chave|passagens/.test(t)) return '🔑 ';
        if (/palavras? no original/.test(t)) return '🔤 ';
        if (/te[óo]logos/.test(t)) return '📜 ';
        if (/discordam|dificuldades/.test(t)) return '⚖️ ';
        if (/liga[çc][õo]es/.test(t)) return '🔗 ';
        if (/cristo/.test(t)) return '✝️ ';
        if (/mesa de estudo|como ler/.test(t)) return '🌱 ';
        if (/mais fundo/.test(t)) return '📚 ';
        return '✦ ';
    }

    function resumoCurtoGaveta(corpoEl) {
        var txt = (corpoEl.textContent || '').replace(/\s+/g, ' ').trim();
        if (!txt) return '';
        return txt.length > 90 ? txt.slice(0, 88).replace(/\s+\S*$/, '') + '…' : txt;
    }

    function barraDeSecoes(secao, antesDe) {
        var titulos = ui.qq('h4', secao).filter(function (h) {
            return !/^(?:vv?\.|vers[íi]culos?)\s*\d+/i.test((h.textContent || '').trim());
        });
        if (titulos.length < 2) return;

        /* 1. Transforma cada seção h4 do aprofundamento em uma gaveta (acordeão) moderna para celular */
        var gavetas = [];
        titulos.forEach(function (h, idx) {
            var id = 'est-sec-' + idx;
            h.id = id;
            var txtTit = (h.textContent || '').trim();
            var pilar = classificarPilarSecao(txtTit);

            var raizBloco = h;
            if (h.parentNode && h.parentNode !== secao &&
                (h.parentNode.classList.contains('secao-cristo') ||
                 h.parentNode.classList.contains('est-area-perito') ||
                 h.parentNode.classList.contains('est-catequese') ||
                 h.parentNode.classList.contains('est-gavetas'))) {
                raizBloco = h.parentNode;
            }

            var gaveta = document.createElement('div');
            gaveta.className = 'aprof-gaveta' + (idx === 0 ? ' is-aberta' : '');
            gaveta.setAttribute('data-gaveta-id', id);
            gaveta.setAttribute('data-pilar', pilar);

            var cab = document.createElement('div');
            cab.className = 'aprof-gaveta-cab';
            cab.setAttribute('role', 'button');
            cab.setAttribute('tabindex', '0');
            cab.setAttribute('aria-expanded', idx === 0 ? 'true' : 'false');

            var corpo = document.createElement('div');
            corpo.className = 'aprof-gaveta-corpo';

            if (raizBloco !== h) {
                raizBloco.parentNode.insertBefore(gaveta, raizBloco);
                var rotuloAntigo = ui.q('.ctx-rotulo', raizBloco);
                var txtRotulo = rotuloAntigo ? (rotuloAntigo.textContent || '').trim() : '';
                if (rotuloAntigo && rotuloAntigo.parentNode) rotuloAntigo.parentNode.removeChild(rotuloAntigo);

                var ic1 = iconeSecaoAprofundar(txtTit);
                if (ic1) h.textContent = ic1 + txtTit;

                cab.innerHTML = (txtRotulo ? '<span class="aprof-gaveta-selo">' + esc(txtRotulo) + '</span>' : '');
                var linhaTit = document.createElement('div');
                linhaTit.className = 'aprof-gaveta-tit-linha';
                linhaTit.appendChild(h);
                var seta = document.createElement('span');
                seta.className = 'aprof-gaveta-seta';
                seta.textContent = idx === 0 ? '▴' : '▾';
                linhaTit.appendChild(seta);
                cab.appendChild(linhaTit);

                corpo.appendChild(raizBloco);
            } else {
                var elementos = [];
                var prox = h.nextSibling;
                while (prox) {
                    if (prox.nodeType === 1) {
                        if (prox.tagName === 'H4' && !/^(?:vv?\.|vers[íi]culos?)\s*\d+/i.test((prox.textContent || '').trim())) break;
                        if (prox.classList && (prox.classList.contains('secao-cristo') ||
                            prox.classList.contains('est-area-perito') ||
                            prox.classList.contains('est-catequese') ||
                            prox.classList.contains('est-gavetas') ||
                            prox.classList.contains('aprof-gaveta'))) break;
                    }
                    elementos.push(prox);
                    prox = prox.nextSibling;
                }
                h.parentNode.insertBefore(gaveta, h);
                var ic2 = iconeSecaoAprofundar(txtTit);
                if (ic2) h.textContent = ic2 + txtTit;

                var linhaTit2 = document.createElement('div');
                linhaTit2.className = 'aprof-gaveta-tit-linha';
                linhaTit2.appendChild(h);
                var seta2 = document.createElement('span');
                seta2.className = 'aprof-gaveta-seta';
                seta2.textContent = idx === 0 ? '▴' : '▾';
                linhaTit2.appendChild(seta2);
                cab.appendChild(linhaTit2);

                elementos.forEach(function (el) { corpo.appendChild(el); });
            }

            var prevTxt = resumoCurtoGaveta(corpo);
            if (prevTxt) {
                var pPrev = document.createElement('p');
                pPrev.className = 'aprof-gaveta-previa';
                pPrev.textContent = prevTxt;
                cab.appendChild(pPrev);
            }

            gaveta.appendChild(cab);
            gaveta.appendChild(corpo);
            gavetas.push({ gaveta: gaveta, cab: cab, h: h, id: id, pilar: pilar, tituloOriginal: txtTit });
        });

        function alternarGaveta(gObj, forcarAbrir) {
            var aberta = typeof forcarAbrir === 'boolean'
                ? forcarAbrir
                : !gObj.gaveta.classList.contains('is-aberta');
            gObj.gaveta.classList.toggle('is-aberta', aberta);
            gObj.cab.setAttribute('aria-expanded', aberta ? 'true' : 'false');
            var setaEl = ui.q('.aprof-gaveta-seta', gObj.cab);
            if (setaEl) setaEl.textContent = aberta ? '▴' : '▾';
        }

        gavetas.forEach(function (gObj) {
            gObj.cab.addEventListener('click', function () {
                alternarGaveta(gObj);
                atualizarBotaoExpandirTodas();
            });
            gObj.cab.addEventListener('keydown', function (ev) {
                if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    alternarGaveta(gObj);
                    atualizarBotaoExpandirTodas();
                }
            });
        });

        /* 2. Barra de 6 Abas Temáticas (Pilares) + Botão Expandir/Recolher Tudo */
        var barraPilares = document.createElement('div');
        barraPilares.className = 'aprof-pilares-barra';
        barraPilares.innerHTML =
            '<div class="aprof-pilares-chips">' +
            '<button type="button" class="pilar-chip is-on" data-pilar-filtro="todos">📋 Todos (' + gavetas.length + ')</button>' +
            '<button type="button" class="pilar-chip" data-pilar-filtro="contexto">🏛️ Contexto & História</button>' +
            '<button type="button" class="pilar-chip" data-pilar-filtro="exegese">🔤 Original & Hermenêutica</button>' +
            '<button type="button" class="pilar-chip" data-pilar-filtro="teologia">⚖️ Teólogos & Doutrina</button>' +
            '<button type="button" class="pilar-chip" data-pilar-filtro="cristo">✝️ Cristo & Aliança</button>' +
            '<button type="button" class="pilar-chip" data-pilar-filtro="vida">🌱 Vida & Retenção</button>' +
            '</div>' +
            '<div class="aprof-pilares-acoes">' +
            '<small class="dica">Toque em qualquer tópico abaixo para abrir ou filtre por área acima</small>' +
            '<button type="button" class="btn btn--mini" data-toggle-todas-gavetas>📂 Expandir tudo</button>' +
            '</div>';

        /* 3. Barra de Chips Rápidos (.prosa-sumario) */
        var barra = document.createElement('nav');
        barra.className = 'prosa-sumario';
        barra.setAttribute('aria-label', 'Seções do estudo');
        barra.innerHTML = gavetas.map(function (gObj) {
            return '<button type="button" class="sumario-chip" data-pilar-chip="' + gObj.pilar + '" data-ir-sec="' + gObj.id + '">' +
                esc((gObj.h.textContent || '').trim()) + '</button>';
        }).join('');

        var refInsercao = gavetas.length ? gavetas[0].gaveta : antesDe;
        secao.insertBefore(barraPilares, refInsercao);
        secao.insertBefore(barra, refInsercao);

        function atualizarBotaoExpandirTodas() {
            var btnTodas = ui.q('[data-toggle-todas-gavetas]', barraPilares);
            if (!btnTodas) return;
            var visiveis = gavetas.filter(function (g) { return !g.gaveta.hidden; });
            var algumaFechada = visiveis.some(function (g) { return !g.gaveta.classList.contains('is-aberta'); });
            btnTodas.textContent = algumaFechada ? '📂 Expandir tudo' : '📁 Recolher tudo';
        }

        var btnToggleTodas = ui.q('[data-toggle-todas-gavetas]', barraPilares);
        if (btnToggleTodas) {
            btnToggleTodas.addEventListener('click', function () {
                var visiveis = gavetas.filter(function (g) { return !g.gaveta.hidden; });
                var abrirTodas = visiveis.some(function (g) { return !g.gaveta.classList.contains('is-aberta'); });
                visiveis.forEach(function (g) { alternarGaveta(g, abrirTodas); });
                atualizarBotaoExpandirTodas();
            });
        }

        ui.qq('[data-pilar-filtro]', barraPilares).forEach(function (btnPilar) {
            btnPilar.addEventListener('click', function () {
                var alvoPilar = btnPilar.getAttribute('data-pilar-filtro');
                ui.qq('[data-pilar-filtro]', barraPilares).forEach(function (b) {
                    b.classList.toggle('is-on', b === btnPilar);
                });
                var primeiraVisivel = true;
                gavetas.forEach(function (gObj) {
                    var mostrar = (alvoPilar === 'todos' || gObj.pilar === alvoPilar);
                    gObj.gaveta.hidden = !mostrar;
                    if (mostrar && alvoPilar !== 'todos') {
                        alternarGaveta(gObj, true);
                    } else if (mostrar && alvoPilar === 'todos') {
                        alternarGaveta(gObj, primeiraVisivel);
                        primeiraVisivel = false;
                    }
                });
                ui.qq('[data-pilar-chip]', barra).forEach(function (ch) {
                    ch.hidden = (alvoPilar !== 'todos' && ch.getAttribute('data-pilar-chip') !== alvoPilar);
                });
                atualizarBotaoExpandirTodas();
            });
        });

        ui.qq('[data-ir-sec]', barra).forEach(function (b) {
            b.addEventListener('click', function () {
                var idAlvo = b.getAttribute('data-ir-sec');
                var gAlvo = gavetas.filter(function (g) { return g.id === idAlvo; })[0];
                if (gAlvo) {
                    gAlvo.gaveta.hidden = false;
                    alternarGaveta(gAlvo, true);
                    atualizarBotaoExpandirTodas();
                    if (gAlvo.gaveta.scrollIntoView) {
                        gAlvo.gaveta.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    }

    function atualizarBotaoMarcar(botao, livro, cap) {
        if (!botao || !B.plano) return;
        var hoje = B.plano.leuHoje(livro.nome, cap);
        botao.className = 'btn ' + (hoje ? 'btn--feito' : 'btn--forte') + ' btn--largo';
        botao.textContent = hoje ? '✓ Leitura de hoje registrada' : '✓ Marcar leitura de hoje';
        if (hoje) botao.setAttribute('aria-label', 'Lido hoje. Tocar desfaz o registro de hoje.');
        else botao.removeAttribute('aria-label');
    }

    function marcarLeituraNoEstudo(botao, livro, cap) {
        if (!B.plano) return;
        var plano = B.plano;
        var g = bib.grupo(livro.grupo);

        if (plano.leuHoje(livro.nome, cap)) {
            var ultimo = (store.get().historico || [])[0];
            if (ultimo && ultimo.livro === livro.nome && ultimo.cap === cap) {
                plano.desfazerUltima();
                plano.atualizarSequencia();
                store.salvar();
                atualizarBotaoMarcar(botao, livro, cap);
                B.app.cabecalho();
                return ui.toast('Registro de hoje desfeito.');
            }
            return ui.toast('Você já registrou este capítulo hoje.');
        }

        var atual = plano.leituraAtual(g.id);
        if (atual.livro.nome === livro.nome && atual.cap === cap) {
            var r = plano.marcarLida(g.id);
            B.app.cabecalho();
            var prox = plano.leituraAtual(g.id);
            atualizarBotaoMarcar(botao, livro, cap);
            ui.toast(r.fechouCiclo
                ? 'Ciclo de ' + g.nome + ' completo!'
                : 'Lido hoje. A próxima de ' + g.nome + ' é ' + prox.ref + '.');
        } else {
            plano.registrarLeitura(livro.nome, cap);
            atualizarBotaoMarcar(botao, livro, cap);
            B.app.cabecalho();
            ui.toast('Leitura de hoje registrada.');
        }
    }

    /**
     * Prepara a página inteira do estudo para impressão/salvamento em PDF,
     * abrindo todas as passagens bíblicas fechadas (.bloco-versos-inline),
     * as respostas da catequese (.cat-resposta) e a oração do capítulo.
     */
    function baixarPdfEstudo(palco, titulo, alvo, estudo) {
        var prosa = ui.$('prosa');
        var promessaVersos = (alvo && alvo.capitulo && B.texto && B.texto.capituloOuReserva)
            ? B.texto.capituloOuReserva(alvo.livro.nome, alvo.capitulo).then(function (r) {
                var versos = r && r.versiculos ? r.versiculos : [];
                var deOndeVeio = '<small class="dica v-bloco-fonte">' + (r.reserva
                    ? 'Texto da <b>' + esc(r.edicao.nome) + '</b>: a edição que você carregou não tem este livro.'
                    : 'Texto: <b>' + esc(r.edicao.nome) + '</b>') + '</small>';
                ui.qq('[data-versos-faixa]', palco).forEach(function (box) {
                    if (ui.q('.v-bloco-item', box)) return;
                    var partes = (box.getAttribute('data-versos-faixa') || '').split('-');
                    var v1 = Math.max(1, parseInt(partes[0], 10) || 1);
                    var v2 = Math.min(versos.length, parseInt(partes[1], 10) || v1);
                    var htmlV = [];
                    for (var n = v1; n <= v2; n++) {
                        if (versos[n - 1]) {
                            htmlV.push('<p class="v-bloco-item"><b class="v-bloco-num">' + n + '</b> ' + esc(versos[n - 1]) + '</p>');
                        }
                    }
                    if (htmlV.length) {
                        box.innerHTML = htmlV.join('') + deOndeVeio;
                    }
                });
            }, function () { })
            : Promise.resolve();

        return promessaVersos.then(function () {
            /* Se o estudo tiver oração (que fica na tela Orar), anexa-a ao fim para sair no PDF */
            var blocoOracaoPdf = null;
            var oracaoTxt = (estudo && estudo.texto && B.oracoes && B.oracoes.extrair)
                ? B.oracoes.extrair(estudo.texto)
                : null;
            if (oracaoTxt && prosa) {
                blocoOracaoPdf = document.createElement('section');
                blocoOracaoPdf.className = 'pdf-oracao-extra';
                blocoOracaoPdf.innerHTML = '<h4>Oração deste capítulo</h4>' +
                    '<p class="pdf-oracao-texto">' + esc(oracaoTxt).replace(/\n+/g, '<br>') + '</p>';
                prosa.appendChild(blocoOracaoPdf);
            }

            /* Abre todas as passagens bíblicas fechadas e respostas da catequese */
            var abertosTemporariamente = [];
            ui.qq('.bloco-versos-inline, .cat-resposta', palco).forEach(function (el) {
                if (el.hidden) {
                    el.hidden = false;
                    abertosTemporariamente.push(el);
                }
            });

            document.body.classList.add('modo-pdf');

            var jaRestaurou = false;
            function restaurar() {
                if (jaRestaurou) return;
                jaRestaurou = true;
                window.removeEventListener('afterprint', restaurar);
                document.body.classList.remove('modo-pdf');
                abertosTemporariamente.forEach(function (el) { el.hidden = true; });
                if (blocoOracaoPdf && blocoOracaoPdf.parentNode) {
                    blocoOracaoPdf.parentNode.removeChild(blocoOracaoPdf);
                }
            }

            window.addEventListener('afterprint', restaurar);
            setTimeout(function () {
                if (ui.imprimirPdf) ui.imprimirPdf(titulo);
                else window.print();
                setTimeout(restaurar, 2500);
            }, 80);
        });
    }

    function mostrarEstudo(palco, titulo, alvo, estudo, formato, estudoCompleto) {
        formato = 'completo';
        palco.innerHTML = cabecalhoEstudo(titulo, alvo, estudo, formato) +
            renderTexto(estudo, alvo, formato, estudoCompleto);
        if (B.contexto) {
            B.contexto.ligar(palco, alvo.livro, alvo.capitulo || 1);
            if (alvo.capitulo && B.contexto.preencherFioNarrativa) {
                B.contexto.preencherFioNarrativa(palco, alvo.livro, alvo.capitulo, estudo);
            }
            B.contexto.enriquecerEstudoDOM(ui.$('prosa'), estudo, alvo.livro, alvo.capitulo || 1);
        }
        inserirRestanteAposPartePorParte(palco, titulo, alvo, formato, estudo);
        preencherFixar(palco, alvo, titulo);

        var btnMarcarFim = ui.q('[data-marcar-estudo-fim]', palco);
        if (btnMarcarFim && alvo && alvo.capitulo) {
            btnMarcarFim.addEventListener('click', function () {
                marcarLeituraNoEstudo(btnMarcarFim, alvo.livro, alvo.capitulo);
            });
        }

        ui.qq('[data-baixar-pdf]', palco).forEach(function (btnPdf) {
            btnPdf.addEventListener('click', function () {
                baixarPdfEstudo(palco, titulo, alvo, estudo);
            });
        });

        ui.qq('[data-baixar-pdf-livro]', palco).forEach(function (btnApostila) {
            btnApostila.addEventListener('click', function () {
                baixarApostilaLivroPdf(palco, alvo, estudo, btnApostila);
            });
        });

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
        /* O pedido vem pronto de prompts.preparar: comentário no completo,
           texto do capítulo no exercício. Nada disso pode travar a tela se
           faltar. */
        B.prompts.preparar(alvo, cfg, formato).then(function (pedido) {
            gerarCom(palco, titulo, alvo, formato, cfg, pedido);
        }, function () {
            gerarCom(palco, titulo, alvo, formato, cfg, B.prompts.montar(alvo, cfg, formato));
        });
    }

    function gerarCom(palco, titulo, alvo, formato, cfg, pedido) {
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

    /* ---------- Apostila do Livro Inteiro em PDF (Item 5) ---------- */
    function baixarApostilaLivroPdf(palco, alvo, estudoPanorama, btnDisparo) {
        if (!alvo || !alvo.livro) return;
        var livro = alvo.livro;
        var txtOriginalBtn = btnDisparo ? btnDisparo.textContent : '';
        if (btnDisparo) {
            btnDisparo.disabled = true;
            btnDisparo.textContent = '⏳ Montando apostila de ' + livro.nome + '…';
        }

        var promessasCaps = [];
        for (var c = 1; c <= livro.caps; c++) {
            (function (numCap) {
                var refCap = livro.nome + ' ' + numCap;
                promessasCaps.push(
                    Promise.all([
                        B.estudos.obter(refCap, 'completo').catch(function () { return null; }),
                        B.texto && B.texto.capituloOuReserva
                            ? B.texto.capituloOuReserva(livro.nome, numCap).catch(function () { return null; })
                            : Promise.resolve(null)
                    ]).then(function (par) {
                        return { cap: numCap, ref: refCap, estudo: par[0], textoObj: par[1] };
                    })
                );
            })(c);
        }

        Promise.all(promessasCaps).then(function (listaCaps) {
            if (btnDisparo) {
                btnDisparo.disabled = false;
                btnDisparo.textContent = txtOriginalBtn;
            }
            var disponiveis = listaCaps.filter(function (x) { return x.estudo && x.estudo.texto; });
            var g = bib.grupo(livro.grupo);

            var apostilaEl = document.createElement('div');
            apostilaEl.className = 'pdf-apostila-livro';

            /* 1. Capa e Sumário */
            var sumarioItens = '<li><b>Panorama Geral de ' + esc(livro.nome) + '</b></li>' +
                disponiveis.map(function (item) {
                    return '<li><b>' + esc(item.ref) + '</b></li>';
                }).join('');

            var htmlPartes = [
                '<section class="pdf-apostila-capa">' +
                '<p class="ctx-rotulo">📚 Caderno de Estudo Bíblico Exegético & Reformado</p>' +
                '<h1>' + esc(livro.nome) + '</h1>' +
                '<p class="pdf-apostila-sub">' + esc(g.nome) + ' · ' + livro.caps + ' capítulos (' +
                disponiveis.length + ' estudos de capítulos incluídos)</p>' +
                '<div class="pdf-apostila-sumario">' +
                '<h3>Sumário da Apostila</h3>' +
                '<ol>' + sumarioItens + '</ol>' +
                '</div>' +
                '</section>'
            ];

            /* 2. Panorama do Livro */
            if (estudoPanorama && estudoPanorama.texto) {
                htmlPartes.push(
                    '<section class="pdf-apostila-capitulo">' +
                    '<h2>Panorama de ' + esc(livro.nome) + '</h2>' +
                    '<div class="prosa">' + B.md.render(estudoPanorama.texto) + '</div>' +
                    '</section>'
                );
            }

            /* 3. Cada capítulo do livro */
            disponiveis.forEach(function (item) {
                var mdOrd = colocarPartePorPartePrimeiro(item.estudo.texto, '');
                var divTemp = document.createElement('div');
                divTemp.className = 'prosa';
                divTemp.innerHTML = B.md.render(mdOrd);
                if (B.contexto && B.contexto.enriquecerEstudoDOM) {
                    B.contexto.enriquecerEstudoDOM(divTemp, item.estudo, livro, item.cap);
                }
                /* Preenche todas as faixas de versículos sincronamente com item.textoObj */
                var versos = item.textoObj && item.textoObj.versiculos ? item.textoObj.versiculos : [];
                var nomeEd = item.textoObj && item.textoObj.edicao ? item.textoObj.edicao.nome : 'Almeida';
                ui.qq('[data-versos-faixa]', divTemp).forEach(function (box) {
                    box.hidden = false;
                    var partes = (box.getAttribute('data-versos-faixa') || '').split('-');
                    var v1 = Math.max(1, parseInt(partes[0], 10) || 1);
                    var v2 = Math.min(versos.length, parseInt(partes[1], 10) || v1);
                    var htmlV = [];
                    for (var n = v1; n <= v2; n++) {
                        if (versos[n - 1]) {
                            htmlV.push('<p class="v-bloco-item"><b class="v-bloco-num">' + n + '</b> ' + esc(versos[n - 1]) + '</p>');
                        }
                    }
                    if (htmlV.length) {
                        box.innerHTML = htmlV.join('') + '<small class="dica v-bloco-fonte">Texto: <b>' + esc(nomeEd) + '</b></small>';
                    }
                });
                ui.qq('.bloco-versos-inline, .cat-resposta', divTemp).forEach(function (el) {
                    el.hidden = false;
                });

                var oracaoCap = (B.oracoes && B.oracoes.extrair) ? B.oracoes.extrair(item.estudo.texto) : null;
                if (oracaoCap) {
                    var secOr = document.createElement('section');
                    secOr.className = 'pdf-oracao-extra';
                    secOr.innerHTML = '<h4>Oração de ' + esc(item.ref) + '</h4>' +
                        '<p class="pdf-oracao-texto">' + esc(oracaoCap).replace(/\n+/g, '<br>') + '</p>';
                    divTemp.appendChild(secOr);
                }

                htmlPartes.push(
                    '<section class="pdf-apostila-capitulo">' +
                    '<h2>' + esc(item.ref) + '</h2>' +
                    divTemp.outerHTML +
                    '</section>'
                );
            });

            apostilaEl.innerHTML = htmlPartes.join('');
            palco.appendChild(apostilaEl);
            document.body.classList.add('modo-pdf', 'modo-pdf-apostila');

            var jaLimpou = false;
            function limparApostila() {
                if (jaLimpou) return;
                jaLimpou = true;
                window.removeEventListener('afterprint', limparApostila);
                document.body.classList.remove('modo-pdf', 'modo-pdf-apostila');
                if (apostilaEl && apostilaEl.parentNode) {
                    apostilaEl.parentNode.removeChild(apostilaEl);
                }
            }

            window.addEventListener('afterprint', limparApostila);
            setTimeout(function () {
                var nomePdf = livro.nome + ' - Apostila Completa';
                if (ui.imprimirPdf) ui.imprimirPdf(nomePdf);
                else window.print();
                setTimeout(limparApostila, 3000);
            }, 100);
        });
    }

    /* ---------- Portais da Enciclopédia Bíblica (Itens 9, 11, 12, 15) ---------- */
    function renderPortalEnciclo(tipo) {
        var titulos = {
            lexico: { icone: '🔤', tit: 'Léxico Hebraico & Grego', sub: 'Palavras no original de A a Z com código Strong, transliteração e explicação exegética' },
            teologos: { icone: '📜', tit: 'Vozes da História da Igreja', sub: 'Comentários patrísticos, reformados, puritanos e contemporâneos capítulo por capítulo' },
            personagens: { icone: '👤', tit: 'Quem é Quem na Bíblia', sub: 'Enciclopédia de personagens bíblicos e todos os capítulos onde atuam' },
            cristo: { icone: '✝️', tit: 'Cristo em Toda a Escritura', sub: 'Mapa Cristocêntrico pelas Alianças: tipologia, promessa e cumprimento no Novo Testamento' }
        };
        var info = titulos[tipo] || titulos.lexico;
        return '<header class="tela-topo">' +
            '<a class="voltar" href="#/estudo">‹ estudo</a>' +
            '<h2>' + info.icone + ' ' + esc(info.tit) + '</h2>' +
            '<p class="tela-sub">' + esc(info.sub) + '</p>' +
            '</header>' +
            '<div id="portal-enciclo-corpo" data-portal-tipo="' + esc(tipo) + '">' +
            '<p class="carregando">Carregando enciclopédia…</p></div>';
    }

    function montarPortalEnciclo(tipo) {
        var caixa = ui.$('portal-enciclo-corpo');
        if (!caixa) return;
        carregarEnciclopedia().then(function (dados) {
            if (!dados) {
                caixa.innerHTML = '<div class="vazio"><p>Não foi possível carregar a enciclopédia agora.</p></div>';
                return;
            }
            if (tipo === 'lexico') montarPortalLexico(caixa, dados.lexico || []);
            else if (tipo === 'teologos') montarPortalTeologos(caixa, dados.teologos || []);
            else if (tipo === 'personagens') montarPortalPersonagens(caixa, dados.personagens || []);
            else if (tipo === 'cristo') montarPortalCristo(caixa, dados.cristo || []);
        });
    }

    function montarPortalLexico(caixa, lista) {
        var linguaAtiva = 'todas';
        caixa.innerHTML =
            '<div class="busca">' +
            '<input class="campo" id="busca-portal-lex" type="search" autocomplete="off" ' +
            'placeholder="Buscar em ' + lista.length + ' palavras: graça, hesed, logos, aliança, H2617, G3056…">' +
            '</div>' +
            '<div class="prosa-sumario" id="abas-portal-lex">' +
            '<button type="button" class="sumario-chip is-on" data-lingua="todas">Todas (' + lista.length + ')</button>' +
            '<button type="button" class="sumario-chip" data-lingua="Hebraico">Hebraico · AT</button>' +
            '<button type="button" class="sumario-chip" data-lingua="Grego">Grego · NT</button>' +
            '</div>' +
            '<div id="lista-portal-lex"></div>';

        var campo = ui.$('busca-portal-lex');
        var alvoLista = ui.$('lista-portal-lex');

        function pintar() {
            var q = normBusca(campo ? campo.value : '');
            var filtrados = lista.filter(function (x) {
                var ling = x.lingua || x.l || '';
                if (linguaAtiva !== 'todas' && ling !== linguaAtiva) return false;
                if (!q) return true;
                var termo = x.termo || x.p || '';
                var strong = x.strong || x.s || '';
                var resumo = x.resumo || x.d || '';
                var refStr = x.ref || (x.r || []).join(' ');
                return normBusca(termo + ' ' + strong + ' ' + resumo + ' ' + refStr).indexOf(q) >= 0;
            });
            var fatia = filtrados.slice(0, 60);
            if (!fatia.length) {
                alvoLista.innerHTML = '<div class="vazio"><p>Nenhum termo encontrado.</p></div>';
                return;
            }
            alvoLista.innerHTML =
                '<p class="dica">Mostrando ' + fatia.length + ' de ' + filtrados.length + ' termos bíblicos no original.</p>' +
                fatia.map(function (lx) {
                    var ling = lx.lingua || lx.l || 'Original';
                    var strong = lx.strong || lx.s || '';
                    var termo = lx.termo || lx.p || '';
                    var resumo = lx.resumo || lx.d || '';
                    var refs = lx.r || (lx.ref ? [lx.ref] : []);
                    return '<div class="cartao card-lexico" style="margin-bottom:10px">' +
                        '<div class="card-teologo-topo">' +
                        '<span class="selo-epoca ' + (ling === 'Hebraico' ? 'epoca--patristica' : 'epoca--reforma') + '">' + esc(ling) + '</span>' +
                        (strong ? ' <span class="selo-strong">' + esc(strong) + '</span>' : '') +
                        '</div>' +
                        '<p style="margin:6px 0 4px"><b>' + esc(termo) + '</b></p>' +
                        (resumo && resumo !== termo ? '<p class="dica" style="margin:0 0 8px">' + esc(resumo) + '</p>' : '') +
                        '<div class="bloco-ligacoes"><small class="bloco-ligacoes-titulo">Estudo onde esta palavra é analisada:</small>' +
                        refs.map(function (ref) {
                            return '<a class="ligacao" href="#/estudo/' + encodeURIComponent(ref) + '">✦ ' + esc(ref) + '</a>';
                        }).join('') +
                        '</div>' +
                        '</div>';
                }).join('');
        }

        if (campo) campo.addEventListener('input', pintar);
        ui.qq('[data-lingua]', caixa).forEach(function (btn) {
            btn.addEventListener('click', function () {
                linguaAtiva = btn.getAttribute('data-lingua');
                ui.qq('[data-lingua]', caixa).forEach(function (b) { b.classList.toggle('is-on', b === btn); });
                pintar();
            });
        });
        pintar();
    }

    function montarPortalTeologos(caixa, lista) {
        var epocaAtiva = 'todas';
        var teologoAtivo = 'todos';
        var epocas = ['Patrística', 'Reforma (Séc. XVI)', 'Puritanos & Clássicos', 'Exegese Contemporânea', 'Teologia Brasileira'];

        caixa.innerHTML =
            '<div class="busca">' +
            '<input class="campo" id="busca-portal-teo" type="search" autocomplete="off" ' +
            'placeholder="Buscar teólogo, capítulo ou tema: Calvino, Agostinho, Spurgeon, graça, cruz…">' +
            '</div>' +
            '<div class="prosa-sumario" id="abas-epoca-teo">' +
            '<button type="button" class="sumario-chip is-on" data-epoca="todas">Todas as Épocas</button>' +
            epocas.map(function (ep) {
                return '<button type="button" class="sumario-chip" data-epoca="' + esc(ep) + '">' + esc(ep) + '</button>';
            }).join('') +
            '</div>' +
            '<div class="prosa-sumario" id="abas-nome-teo" style="margin-top:6px"></div>' +
            '<div id="lista-portal-teo"></div>';

        var campo = ui.$('busca-portal-teo');
        var abasNomes = ui.$('abas-nome-teo');
        var alvoLista = ui.$('lista-portal-teo');

        function pintarBotoesTeologos() {
            var filtradosEpoca = lista.filter(function (t) {
                var ep = t.epoca || t.e || '';
                return epocaAtiva === 'todas' || ep === epocaAtiva;
            });
            abasNomes.innerHTML =
                '<button type="button" class="sumario-chip' + (teologoAtivo === 'todos' ? ' is-on' : '') + '" data-teologo="todos">Todos (' + filtradosEpoca.length + ')</button>' +
                filtradosEpoca.map(function (t) {
                    var nomeTg = t.nome || t.n || '';
                    var qtdTg = (t.itens ? t.itens.length : (t.n || t.t || 0));
                    return '<button type="button" class="sumario-chip' + (teologoAtivo === nomeTg ? ' is-on' : '') +
                        '" data-teologo="' + esc(nomeTg) + '">' + esc(nomeTg) + ' (' + qtdTg + ')</button>';
                }).join('');

            ui.qq('[data-teologo]', abasNomes).forEach(function (btn) {
                btn.addEventListener('click', function () {
                    teologoAtivo = btn.getAttribute('data-teologo');
                    ui.qq('[data-teologo]', abasNomes).forEach(function (b) { b.classList.toggle('is-on', b === btn); });
                    pintarLista();
                });
            });
        }

        function pintarLista() {
            var q = normBusca(campo ? campo.value : '');
            var cards = [];
            lista.forEach(function (t) {
                var ep = t.epoca || t.e || '';
                var nomeTg = t.nome || t.n || '';
                if (epocaAtiva !== 'todas' && ep !== epocaAtiva) return;
                if (teologoAtivo !== 'todos' && nomeTg !== teologoAtivo) return;
                (t.itens || t.c || []).forEach(function (com) {
                    var refCom = com.ref || com.r || '';
                    var txtCom = com.texto || com.x || '';
                    if (q && normBusca(nomeTg + ' ' + ep + ' ' + refCom + ' ' + txtCom).indexOf(q) < 0) return;
                    cards.push({ nome: nomeTg, epoca: ep, ref: refCom, texto: txtCom });
                });
            });

            var limite = (teologoAtivo !== 'todos' || q) ? 80 : 40;
            var fatia = cards.slice(0, limite);
            if (!fatia.length) {
                alvoLista.innerHTML = '<div class="vazio"><p>Nenhum comentário encontrado para esse filtro.</p></div>';
                return;
            }
            alvoLista.innerHTML =
                '<p class="dica">Mostrando ' + fatia.length + ' de ' + cards.length + ' comentários teológicos catalogados.</p>' +
                fatia.map(function (c) {
                    return '<div class="cartao card-teologo" style="margin-bottom:10px">' +
                        '<div class="card-teologo-topo">' +
                        '<span class="selo-epoca">' + esc(c.epoca) + '</span> ' +
                        '<b>' + esc(c.nome) + '</b> · ' +
                        '<a class="ligacao" href="#/estudo/' + encodeURIComponent(c.ref) + '">✦ ' + esc(c.ref) + '</a>' +
                        '</div>' +
                        '<p class="dica" style="margin:6px 0 0">' + esc(c.texto) + '</p>' +
                        '</div>';
                }).join('');
        }

        if (campo) campo.addEventListener('input', pintarLista);
        ui.qq('[data-epoca]', caixa).forEach(function (btn) {
            btn.addEventListener('click', function () {
                epocaAtiva = btn.getAttribute('data-epoca');
                teologoAtivo = 'todos';
                ui.qq('[data-epoca]', caixa).forEach(function (b) { b.classList.toggle('is-on', b === btn); });
                pintarBotoesTeologos();
                pintarLista();
            });
        });

        pintarBotoesTeologos();
        pintarLista();
    }

    function montarPortalPersonagens(caixa, lista) {
        var letraAtiva = 'todas';
        var letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'Z'];

        caixa.innerHTML =
            '<div class="busca">' +
            '<input class="campo" id="busca-portal-per" type="search" autocomplete="off" ' +
            'placeholder="Buscar entre ' + lista.length + ' personagens: Abraão, Moisés, Davi, Rute, Elias, Pedro, Paulo…">' +
            '</div>' +
            '<div class="prosa-sumario" id="abas-letra-per">' +
            '<button type="button" class="sumario-chip is-on" data-letra="todas">Mais frequentes (' + lista.length + ')</button>' +
            letras.map(function (L) {
                return '<button type="button" class="sumario-chip" data-letra="' + L + '">' + L + '</button>';
            }).join('') +
            '</div>' +
            '<div id="lista-portal-per"></div>';

        var campo = ui.$('busca-portal-per');
        var alvoLista = ui.$('lista-portal-per');

        function pintar() {
            var q = normBusca(campo ? campo.value : '');
            var filtrados = lista.filter(function (p) {
                var nomeP = p.nome || p.n || '';
                var descP = p.desc || p.d || '';
                var refsP = p.refs || p.r || [];
                if (letraAtiva !== 'todas') {
                    var ini = normBusca(nomeP).charAt(0).toUpperCase();
                    if (ini !== letraAtiva) return false;
                }
                if (!q) return true;
                return normBusca(nomeP + ' ' + descP + ' ' + refsP.join(' ')).indexOf(q) >= 0;
            });
            var fatia = filtrados.slice(0, 50);
            if (!fatia.length) {
                alvoLista.innerHTML = '<div class="vazio"><p>Nenhum personagem encontrado.</p></div>';
                return;
            }
            alvoLista.innerHTML =
                '<p class="dica">Mostrando ' + fatia.length + ' de ' + filtrados.length + ' personagens bíblicos.</p>' +
                fatia.map(function (p) {
                    var nomeP = p.nome || p.n || '';
                    var descP = p.desc || p.d || '';
                    var refsP = p.refs || p.r || [];
                    var qtdP = refsP.length || p.c || 0;
                    return '<div class="cartao" style="margin-bottom:10px">' +
                        '<div class="lugar-topo"><b>👤 ' + esc(nomeP) + '</b>' +
                        '<small>' + qtdP + ' capítulo' + (qtdP === 1 ? '' : 's') + '</small></div>' +
                        '<p class="dica" style="margin:6px 0 8px">' + esc(descP) + '</p>' +
                        '<div class="bloco-ligacoes"><small class="bloco-ligacoes-titulo">Capítulos onde aparece:</small>' +
                        refsP.map(function (ref) {
                            return '<a class="ligacao" href="#/estudo/' + encodeURIComponent(ref) + '">' + esc(ref) + '</a>';
                        }).join('') +
                        '</div>' +
                        '</div>';
                }).join('');
        }

        if (campo) campo.addEventListener('input', pintar);
        ui.qq('[data-letra]', caixa).forEach(function (btn) {
            btn.addEventListener('click', function () {
                letraAtiva = btn.getAttribute('data-letra');
                ui.qq('[data-letra]', caixa).forEach(function (b) { b.classList.toggle('is-on', b === btn); });
                pintar();
            });
        });
        pintar();
    }

    function montarPortalCristo(caixa, lista) {
        var viaAtiva = 'todas';
        var testAtivo = 'todos';
        var vias = ['Citação no NT', 'Promessa e Cumprimento', 'Tipologia', 'História da Redenção'];

        caixa.innerHTML =
            '<div class="busca">' +
            '<input class="campo" id="busca-portal-cristo" type="search" autocomplete="off" ' +
            'placeholder="Buscar em ' + lista.length + ' conexões cristocêntricas: Cordeiro, Sacerdote, Davi, Cruz, Aliança…">' +
            '</div>' +
            '<div class="prosa-sumario" id="abas-via-cristo">' +
            '<button type="button" class="sumario-chip is-on" data-via="todas">Todas as Vias (' + lista.length + ')</button>' +
            vias.map(function (v) {
                return '<button type="button" class="sumario-chip" data-via="' + esc(v) + '">' + esc(v) + '</button>';
            }).join('') +
            '</div>' +
            '<div class="prosa-sumario" style="margin-top:6px">' +
            '<button type="button" class="sumario-chip is-on" data-test="todos">Toda a Bíblia</button>' +
            '<button type="button" class="sumario-chip" data-test="AT">Antigo Testamento</button>' +
            '<button type="button" class="sumario-chip" data-test="NT">Novo Testamento</button>' +
            '</div>' +
            '<div id="lista-portal-cristo"></div>';

        var campo = ui.$('busca-portal-cristo');
        var alvoLista = ui.$('lista-portal-cristo');

        function pintar() {
            var q = normBusca(campo ? campo.value : '');
            var filtrados = lista.filter(function (c) {
                var viaC = c.via || c.v || '';
                var testC = c.testamento || c.t || '';
                var refC = c.ref || c.r || '';
                var txtC = c.texto || c.x || '';
                if (viaAtiva !== 'todas' && viaC !== viaAtiva) return false;
                if (testAtivo !== 'todos' && testC !== testAtivo) return false;
                if (!q) return true;
                return normBusca(refC + ' ' + viaC + ' ' + txtC).indexOf(q) >= 0;
            });
            var fatia = filtrados.slice(0, 60);
            if (!fatia.length) {
                alvoLista.innerHTML = '<div class="vazio"><p>Nenhuma conexão encontrada.</p></div>';
                return;
            }
            alvoLista.innerHTML =
                '<p class="dica">Mostrando ' + fatia.length + ' de ' + filtrados.length + ' capítulos conectados à pessoa e obra de Cristo.</p>' +
                fatia.map(function (c) {
                    var viaC = c.via || c.v || '';
                    var refC = c.ref || c.r || '';
                    var txtC = c.texto || c.x || '';
                    return '<div class="cartao secao-cristo" style="margin-bottom:10px">' +
                        '<div class="card-teologo-topo">' +
                        '<span class="selo-epoca">' + esc(viaC) + '</span> ' +
                        '<a class="ligacao" href="#/estudo/' + encodeURIComponent(refC) + '"><b>✦ ' + esc(refC) + '</b></a>' +
                        '</div>' +
                        '<p style="margin:6px 0 0">' + esc(txtC) + '</p>' +
                        '</div>';
                }).join('');
        }

        if (campo) campo.addEventListener('input', pintar);
        ui.qq('[data-via]', caixa).forEach(function (btn) {
            btn.addEventListener('click', function () {
                viaAtiva = btn.getAttribute('data-via');
                ui.qq('[data-via]', caixa).forEach(function (b) { b.classList.toggle('is-on', b === btn); });
                pintar();
            });
        });
        ui.qq('[data-test]', caixa).forEach(function (btn) {
            btn.addEventListener('click', function () {
                testAtivo = btn.getAttribute('data-test');
                ui.qq('[data-test]', caixa).forEach(function (b) { b.classList.toggle('is-on', b === btn); });
                pintar();
            });
        });
        pintar();
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
