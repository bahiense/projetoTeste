/* =========================================================
   O acervo: quanto da Bíblia já está guardada no aparelho.

   Mora fora das telas porque duas delas mostram o mesmo quadro — a de
   Progresso, que fica, e a Oficina, que existe só onde se gera. Duas
   cópias da mesma conta acabariam discordando uma da outra.

   A conta sai das chaves (título + formato) e de oito registros pelo
   índice de data. Nenhum texto de estudo é carregado: ela custa o mesmo
   com dez estudos guardados e com os 2.510 da Bíblia inteira.
   ========================================================= */
window.B = window.B || {};

B.acervo = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc;

    /**
     * O que existe, o que falta e o que chegou por último.
     *
     * Tudo sai das chaves (título + formato) e de oito registros pelo índice
     * de data. Nenhum texto de estudo é carregado: a conta é a mesma com dez
     * estudos guardados e com os 2.510 da Bíblia inteira.
     */
    function alvos() {
        var lista = [];
        B.biblia.LIVROS.forEach(function (l) {
            for (var c = 1; c <= l.caps; c++) lista.push({ titulo: l.nome + ' ' + c, tipo: 'capitulo' });
        });
        B.biblia.LIVROS.forEach(function (l) { lista.push({ titulo: l.nome, tipo: 'livro' }); });
        return lista;
    }

    function pintar(onde, opcoes) {
        var caixa = ui.$(onde);
        if (!caixa) return;
        /* Sempre a configuração desta tela, nunca a da anterior: no
           navegador a Oficina e o Progresso coexistem, e o mapa do Progresso
           não escolhe livro nenhum. */
        cfg = opcoes || {};
        Promise.all([B.estudos.chaves(), B.estudos.recentes(8)]).then(function (r) {
            var tem = {};
            r[0].forEach(function (k) { tem[k] = true; });
            var novos = r[1];

            var lista = alvos();
            var conta = {
                simples: 0, completo: 0,
                capitulos: 0, livros: 0,
                /* Exercícios não entram na conta dos 2.510: são outra coisa,
                   só de capítulo, e misturá-los faria o número de estudos
                   crescer sem que nenhum estudo tivesse sido escrito. */
                exercicios: 0,
                faltam: []
            };
            B.biblia.LIVROS.forEach(function (l) {
                for (var c = 1; c <= l.caps; c++) {
                    if (tem[B.estudos.chave(l.nome + ' ' + c, 'exercicios')]) conta.exercicios++;
                }
            });
            lista.forEach(function (a) {
                ['simples', 'completo'].forEach(function (f) {
                    if (tem[B.estudos.chave(a.titulo, f)]) {
                        conta[f]++;
                        if (a.tipo === 'livro') conta.livros++; else conta.capitulos++;
                    } else {
                        conta.faltam.push({ titulo: a.titulo, formato: f });
                    }
                });
            });

            var total = lista.length * 2;
            var temos = conta.simples + conta.completo;
            var pct = Math.round((temos / total) * 100);
            var meio = Math.round(lista.length);

            caixa.innerHTML =
                '<div class="acervo-topo"><b>' + temos.toLocaleString('pt-BR') + '</b> de ' +
                total.toLocaleString('pt-BR') + ' estudos <span>' + pct + '%</span></div>' +
                ui.barra(pct) +
                '<ul class="resumo">' +
                '<li>simples: <b>' + conta.simples.toLocaleString('pt-BR') + '</b> de ' +
                meio.toLocaleString('pt-BR') + '</li>' +
                '<li>completos: <b>' + conta.completo.toLocaleString('pt-BR') + '</b> de ' +
                meio.toLocaleString('pt-BR') + '</li>' +
                '<li>de capítulo: <b>' + conta.capitulos.toLocaleString('pt-BR') + '</b> · ' +
                'de livro inteiro: <b>' + conta.livros.toLocaleString('pt-BR') + '</b></li>' +
                '<li>exercícios: <b>' + conta.exercicios.toLocaleString('pt-BR') +
                '</b> de 1.189 capítulos</li>' +
                (conta.faltam.length
                    ? '<li>faltam <b>' + conta.faltam.length.toLocaleString('pt-BR') + '</b></li>'
                    : '<li><b>Está completo.</b> Os 1.189 capítulos e os 66 livros, nos dois ' +
                    'formatos, abrem sem internet e sem IA.</li>') +
                '</ul>' +

                (novos.length
                    ? '<h4 class="acervo-tit">Chegaram por último</h4>' +
                    '<ul class="acervo-lista">' + novos.map(function (e) {
                        return '<li><a href="#/estudo/' + encodeURIComponent(e.titulo) +
                            (e.formato === 'simples' ? '/simples' : '') + '">' +
                            esc(e.titulo) + '</a> <small>' + e.formato + ' · ' +
                            ui.quando(e.criado) + '</small></li>';
                    }).join('') + '</ul>'
                    : '') +

                (conta.faltam.length
                    ? '<h4 class="acervo-tit">Os próximos que faltam</h4>' +
                    '<ul class="acervo-lista">' + proximos(conta.faltam, tem).map(function (f) {
                        return '<li>' + esc(f.titulo) + ' <small>' + f.formato + '</small></li>';
                    }).join('') + '</ul>'
                    : '') +

                /*
                 * O mapa fica fechado por padrão, e não por economia de tela:
                 * ele custa 1.189 células e a leitura de todas as chaves. Quem
                 * abre a tela quer o número; quem quer saber de Romanos abre.
                 */
                '<div class="acervo-mapa">' +
                '<button class="btn btn--fraco btn--largo" data-ac-mapa>' +
                (mapaAberto ? 'Esconder o mapa' : 'Ver livro por livro, capítulo por capítulo') +
                '</button>' +
                '<div id="ac-mapa"' + (mapaAberto ? '' : ' hidden') + '></div>' +
                '</div>';

            var bt = ui.q('[data-ac-mapa]', caixa);
            if (bt) {
                bt.addEventListener('click', function () {
                    mapaAberto = !mapaAberto;
                    var m = ui.$('ac-mapa');
                    m.hidden = !mapaAberto;
                    bt.textContent = mapaAberto
                        ? 'Esconder o mapa'
                        : 'Ver livro por livro, capítulo por capítulo';
                    if (mapaAberto) pintarMapa('ac-mapa');
                });
            }
            /* Estudo que chega durante a sessão repinta o acervo; o mapa que
               estava aberto tem de continuar aberto, e com o capítulo novo
               já marcado. */
            if (mapaAberto) pintarMapa('ac-mapa');
        }, function () {
            caixa.innerHTML = '<p class="dica">Não consegui conferir o acervo agora.</p>';
        });
    }

    /* Na ordem em que o mutirão os geraria, que é a ordem do plano: o que
       falta primeiro é o que você vai ler primeiro. */
    function proximos(faltam, tem) {
        var fila = [];
        try {
            B.lote.ordem().forEach(function (a) {
                if (fila.length >= 6) return;
                var titulo = a.livro.nome + (a.capitulo ? ' ' + a.capitulo : '');
                ['simples', 'completo'].forEach(function (f) {
                    if (fila.length >= 6) return;
                    if (!tem[B.estudos.chave(titulo, f)]) fila.push({ titulo: titulo, formato: f });
                });
            });
        } catch (e) { }
        return fila.length ? fila : faltam.slice(0, 6);
    }


    /* =====================================================
       O mapa: livro por livro, capítulo por capítulo.

       O resumo diz quantos estudos existem; não diz onde. Quem quer ler
       Romanos amanhã precisa saber se Romanos está pronto, e o número
       "1.842 de 2.510" não responde isso. Daí o mapa, que mostra cada um
       dos 1.189 capítulos e os 66 panoramas no mesmo lugar.

       Mora aqui junto com o resumo porque é a mesma conta, lida de outro
       jeito, e porque as duas telas que mostram o acervo mostram o mapa.
       ===================================================== */

    var abertos = {};    // livros com a grade aberta
    var guardados = {};  // chaves guardadas, da última leitura do mapa
    var cfg = {};        // como esta tela quer o mapa (com escolha ou sem)
    var mapaAberto = false;

    /* 0 = falta, 1 = só um formato, 2 = os dois. */
    function estadoDe(titulo) {
        var s = guardados[B.estudos.chave(titulo, 'simples')] ? 1 : 0;
        var c = guardados[B.estudos.chave(titulo, 'completo')] ? 1 : 0;
        return s + c;
    }

    function contarLivro(l) {
        var r = { prontos: 0, meio: 0, falta: 0, temos: 0, total: (l.caps + 1) * 2 };
        for (var c = 1; c <= l.caps; c++) {
            var e = estadoDe(l.nome + ' ' + c);
            r.temos += e;
            if (e === 2) r.prontos++; else if (e === 1) r.meio++; else r.falta++;
        }
        r.pan = estadoDe(l.nome);
        r.temos += r.pan;
        return r;
    }

    /* Para onde o capítulo abre: o completo quando existe, o simples quando
       é só ele que existe. Levar a um estudo que não está guardado seria
       empurrar a pessoa para uma tela vazia. */
    function destino(titulo) {
        if (guardados[B.estudos.chave(titulo, 'completo')]) {
            return '#/estudo/' + encodeURIComponent(titulo);
        }
        return '#/estudo/' + encodeURIComponent(titulo) + '/simples';
    }

    function celula(titulo, rotulo) {
        var e = estadoDe(titulo);
        var dica = esc(titulo) + ' — ' + (e === 2 ? 'os dois formatos'
            : e === 1 ? 'só o ' + (guardados[B.estudos.chave(titulo, 'simples')] ? 'simples' : 'completo')
                : 'falta');
        if (!e) return '<span class="cap is-vazio" title="' + dica + '">' + rotulo + '</span>';
        return '<a class="cap ' + (e === 2 ? 'is-on' : 'is-meio') + '" title="' + dica +
            '" href="' + destino(titulo) + '">' + rotulo + '</a>';
    }

    function gradeMapa(l) {
        var caps = '';
        for (var c = 1; c <= l.caps; c++) caps += celula(l.nome + ' ' + c, String(c));
        var pan = estadoDe(l.nome);
        return '<div class="grade">' +
            '<p class="mapa-pan">Panorama do livro inteiro: ' +
            (pan ? '<a href="' + destino(l.nome) + '">' +
                (pan === 2 ? 'os dois formatos' : 'só um formato') + '</a>'
                : '<b>falta</b>') +
            '</p>' +
            '<div class="grade-caps">' + caps + '</div>' +
            '</div>';
    }

    function livroMapa(l) {
        var n = contarLivro(l);
        var escolhido = cfg.escolher && escolhidos().indexOf(l.nome) >= 0;
        return '<div class="livro' +
            (n.temos === n.total ? ' is-completo' : n.temos ? ' is-parcial' : '') +
            '" data-ac-livro="' + esc(l.nome) + '">' +
            '<div class="livro-topo">' +
            (cfg.escolher
                ? '<input type="checkbox" class="livro-pick" data-pick="' + esc(l.nome) + '"' +
                (escolhido ? ' checked' : '') + ' aria-label="Gerar ' + esc(l.nome) + '">'
                : '') +
            '<button class="livro-linha" data-ac-abrir="' + esc(l.nome) + '">' +
            '<span class="livro-nome">' + esc(l.nome) + '</span>' +
            '<span class="livro-conta">' + n.prontos + '/' + l.caps +
            (n.meio ? ' +' + n.meio : '') + '</span>' +
            '<span class="livro-seta">' + (abertos[l.nome] ? '▾' : '▸') + '</span>' +
            '</button>' +
            '</div>' +
            (abertos[l.nome] ? gradeMapa(l) : '') +
            '</div>';
    }

    function grupoMapa(g) {
        var livros = B.biblia.grupo(g.id).livros;
        var temos = 0, total = 0;
        livros.forEach(function (l) {
            var n = contarLivro(l);
            temos += n.temos; total += n.total;
        });
        var pct = Math.round((temos / total) * 100);
        /* Sem a classe do cartão: este mapa já mora dentro de um. */
        return '<section class="grupo-mapa mapa-bloco">' +
            '<header class="grupo-topo">' +
            '<span class="grupo-icone">' + g.icone + '</span>' +
            '<div class="grupo-nome"><b>' + esc(g.nome) + '</b>' +
            '<small>' + temos.toLocaleString('pt-BR') + ' de ' + total.toLocaleString('pt-BR') +
            ' estudos · ' + pct + '%</small></div>' +
            '</header>' +
            ui.barra(pct) +
            '<div class="livros">' + livros.map(livroMapa).join('') + '</div>' +
            '</section>';
    }

    function escolhidos() {
        try { return (B.lote.estado().livros || []); } catch (e) { return []; }
    }

    /* Quem escolhe livros muda a fila do mutirão, e a fila é do lote: a
       escolha mora lá, não aqui, senão as duas discordariam. */
    function escolher(nomes) {
        try { B.lote.escolher({ livros: nomes }); } catch (e) { }
        if (cfg.aoEscolher) cfg.aoEscolher(nomes);
    }

    function pintarMapa(onde) {
        var caixa = ui.$(onde);
        if (!caixa) return;
        caixa.innerHTML = '<p class="carregando">Montando o mapa…</p>';
        B.estudos.chaves().then(function (chaves) {
            guardados = {};
            chaves.forEach(function (k) { guardados[k] = true; });
            desenharMapa(caixa);
        }, function () {
            caixa.innerHTML = '<p class="dica">Não consegui montar o mapa agora.</p>';
        });
    }

    function desenharMapa(caixa) {
        var marcados = escolhidos();
        caixa.innerHTML =
            '<p class="mapa-legenda">' +
            '<span class="cap is-on">✓</span> os dois formatos' +
            '<span class="cap is-meio">½</span> só um' +
            '<span class="cap is-vazio">·</span> falta' +
            '</p>' +
            '<p class="dica">A conta de cada livro é <b>capítulos prontos nos dois ' +
            'formatos</b> — o <b>+n</b> são os que têm só um. Toque no livro para abrir a ' +
            'grade; toque num capítulo que já existe para ler o estudo.</p>' +
            (cfg.escolher
                ? '<div class="mapa-acoes">' +
                '<button class="btn btn--mini" data-ac-todos>Todos os 66</button>' +
                '<button class="btn btn--mini" data-ac-nenhum>Limpar a escolha</button>' +
                '<button class="btn btn--mini" data-ac-faltando>Só os incompletos</button>' +
                '</div>' +
                '<p class="dica" id="ac-escolha">' + frase(marcados) + '</p>'
                : '') +
            B.biblia.GRUPOS.map(grupoMapa).join('');
        ligarMapa(caixa);
    }

    function frase(nomes) {
        if (!nomes.length) {
            return 'Nenhum livro marcado: o mutirão vai pela Bíblia inteira, na ordem do seu ' +
                'plano. Marque livros para que ele gere só esses.';
        }
        return 'O mutirão vai gerar só <b>' + nomes.length + '</b> livro' +
            (nomes.length === 1 ? '' : 's') + ': ' + esc(nomes.join(', ')) + '.';
    }

    /* Um ouvinte no quadro inteiro, e não 1.189 nos capítulos: a grade de
       Salmos sozinha tem 150 botões, e a tela toda passa de mil. */
    function ligarMapa(caixa) {
        caixa.addEventListener('click', function (ev) {
            var ab = ev.target.closest ? ev.target.closest('[data-ac-abrir]') : null;
            if (ab) {
                var nome = ab.getAttribute('data-ac-abrir');
                abertos[nome] = !abertos[nome];
                return repintarLivro(caixa, nome);
            }
            if (ev.target.hasAttribute('data-ac-todos')) {
                return trocarEscolha(caixa, B.biblia.LIVROS.map(function (l) { return l.nome; }));
            }
            if (ev.target.hasAttribute('data-ac-nenhum')) return trocarEscolha(caixa, []);
            if (ev.target.hasAttribute('data-ac-faltando')) {
                return trocarEscolha(caixa, B.biblia.LIVROS.filter(function (l) {
                    var n = contarLivro(l);
                    return n.temos < n.total;
                }).map(function (l) { return l.nome; }));
            }
        });
        caixa.addEventListener('change', function (ev) {
            if (!ev.target.hasAttribute || !ev.target.hasAttribute('data-pick')) return;
            var nome = ev.target.getAttribute('data-pick');
            var lista = escolhidos().slice();
            var i = lista.indexOf(nome);
            if (ev.target.checked) { if (i < 0) lista.push(nome); }
            else if (i >= 0) lista.splice(i, 1);
            /* Na ordem da Bíblia, não na ordem dos toques: a frase "Gênesis,
               Rute, Romanos" se lê; "Romanos, Gênesis, Rute" não. */
            var ordem = B.biblia.LIVROS.map(function (l) { return l.nome; });
            lista.sort(function (a, b) { return ordem.indexOf(a) - ordem.indexOf(b); });
            escolher(lista);
            var p = ui.$('ac-escolha');
            if (p) p.innerHTML = frase(lista);
        });
    }

    function trocarEscolha(caixa, nomes) {
        escolher(nomes);
        desenharMapa(caixa);
    }

    /* Repinta só o livro mexido: a tela inteira tem mais de mil células e
       redesenhar tudo a cada toque trava o celular. */
    function repintarLivro(caixa, nome) {
        var el = ui.qq('[data-ac-livro]', caixa).filter(function (e) {
            return e.getAttribute('data-ac-livro') === nome;
        })[0];
        if (el) el.outerHTML = livroMapa(B.biblia.livro(nome));
    }

    /* Chamada de outra tela ("escolher livros", no cartão do mutirão): abre o
       mapa e leva os olhos até ele, que mora noutro cartão. */
    function abrirMapa() {
        mapaAberto = true;
        var m = ui.$('ac-mapa');
        if (!m) return false;
        m.hidden = false;
        var bt = ui.q('[data-ac-mapa]');
        if (bt) bt.textContent = 'Esconder o mapa';
        pintarMapa('ac-mapa');
        try { m.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { }
        return true;
    }

    return {
        pintar: pintar, alvos: alvos,
        pintarMapa: pintarMapa, abrirMapa: abrirMapa, mapaEstaAberto: function () { return mapaAberto; }
    };
})();
