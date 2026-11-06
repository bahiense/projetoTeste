/* =========================================================
   Comentário reformado na mão de quem escreve o estudo.

   O app sempre avisou que a IA erra principalmente em citação de
   teólogo. A razão é simples: ela cita de memória. Aqui ela para de
   citar de memória — o comentário sobre o capítulo entra no pedido, em
   texto, e o estudo é escrito com a fonte aberta na frente.

   Duas obras, as duas em domínio público e as duas na veia reformada:

   - JOÃO CALVINO, comentários (tradução inglesa do século XIX, do CCEL,
     pelo módulo CalvinCommentaries do projeto SWORD). Ele não comentou
     a Bíblia inteira: são 47 livros e 773 capítulos — não há Samuel,
     Reis, Crônicas, Jó, Provérbios, Atos, Apocalipse, e o Ezequiel para
     na metade porque ele morreu no meio das aulas.
   - MATTHEW HENRY, comentário completo (1708-1710, em CC0). Puritano
     inglês, e cobre os 1.189 capítulos, sem buraco.

   Onde não há fonte, não há: o pedido sai sem ela, e o estudo não finge
   que teve uma.

   Os 78 MB (22 MB dentro do APK, que é zip) vão nos dois lugares: na
   página que gera, para o estudo sair com a fonte na frente, e no
   aparelho, para a tela de Comentário abrir sem internet. O estudo
   continua chegando com a citação já traduzida dentro dele.
   ========================================================= */
window.B = window.B || {};

B.comentario = (function () {
    'use strict';

    var OBRAS = [
        {
            id: 'calvino', pasta: 'data/calvino/',
            autor: 'João Calvino', obra: 'Comentários de João Calvino',
            quando: '1540-1564'
        },
        {
            id: 'henry', pasta: 'data/henry/',
            autor: 'Matthew Henry', obra: 'Comentário Bíblico de Matthew Henry',
            quando: '1708-1710'
        }
    ];

    /*
     * Orçamento do pedido. Calvino escreve 3,4 mil caracteres por
     * versículo, Henry quase 30 mil por capítulo: mandar os dois
     * inteiros em cada um dos 2.510 estudos seria pagar caríssimo por
     * material que o modelo não vai usar inteiro. Com as duas fontes, o
     * teto é por fonte; com uma só, ela fica com tudo.
     */
    var SOZINHA = 20000;
    var ACOMPANHADA = 12000;
    var POR_VERSICULO_MAX = 1400;
    var POR_VERSICULO_MIN = 420;
    /*
     * Teto duro de um bloco. O corte por versículo tem um mínimo, porque
     * trezentos caracteres de Calvino não são argumento nenhum — mas num
     * capítulo de 176 versículos (Salmo 119) esse mínimo multiplicado
     * estoura em 74 mil caracteres. Então o bloco para e DIZ onde parou.
     */
    var TETO = 30000;
    /* Com as duas obras na mesa o teto é menor por obra: o pedido inteiro
       é que não pode virar um caminhão. */
    var TETO_DUPLO = 18000;

    var indices = null;     // {id: índice} ou {} quando não há nada aqui
    var buscando = null;
    var pedacos = {};

    /** Os índices das obras publicadas junto com a página. */
    function carregar() {
        if (indices) return Promise.resolve(indices);
        if (buscando) return buscando;
        buscando = Promise.all(OBRAS.map(function (o) {
            return fetch(o.pasta + 'indice.json').then(function (r) {
                return r.ok ? r.json() : null;
            }).catch(function () { return null; });
        })).then(function (lidos) {
            /* No APK e no navegador comum os arquivos não estão lá, e isso
               não é erro: é o lugar errado para procurar. */
            indices = {};
            lidos.forEach(function (idx, i) { if (idx) indices[OBRAS[i].id] = idx; });
            return indices;
        });
        return buscando;
    }

    function tem(id, usfm, cap) {
        var idx = indices && indices[id];
        return !!(idx && cap && idx.capitulos[usfm + ' ' + cap]);
    }

    /** O que existe aqui, para a tela poder dizer em números. */
    function quantos() {
        var r = {};
        OBRAS.forEach(function (o) {
            var idx = indices && indices[o.id];
            r[o.id] = idx ? Object.keys(idx.capitulos).length : 0;
        });
        return r;
    }

    function pedaco(pasta, nome) {
        var chave = pasta + nome;
        if (pedacos[chave]) return pedacos[chave];
        pedacos[chave] = fetch(pasta + nome + '.json').then(function (r) {
            if (!r.ok) throw new Error('pedaço ' + nome);
            return r.json();
        });
        return pedacos[chave];
    }

    /* Corta no fim de uma frase, não no meio de uma palavra — e diz que
       cortou, para o modelo não completar o que não leu. */
    function cortar(texto, limite) {
        if (texto.length <= limite) return texto;
        var parte = texto.slice(0, limite);
        var fim = Math.max(parte.lastIndexOf('. '), parte.lastIndexOf('.\n'));
        if (fim > limite * 0.5) parte = parte.slice(0, fim + 1);
        return parte.trim() + ' […]';
    }

    /* Calvino vem por versículo: o capítulo inteiro cabe, repartido. */
    function deVersiculos(versos, orcamento, teto) {
        var numeros = Object.keys(versos).sort(function (a, b) { return a - b; });
        var cota = Math.floor(orcamento / numeros.length);
        if (cota > POR_VERSICULO_MAX) cota = POR_VERSICULO_MAX;
        if (cota < POR_VERSICULO_MIN) cota = POR_VERSICULO_MIN;
        var linhas = [], usado = 0, i;
        for (i = 0; i < numeros.length; i++) {
            var trecho = cortar(versos[numeros[i]], cota);
            if (usado + trecho.length > teto && linhas.length) break;
            linhas.push('v. ' + numeros[i] + ' — ' + trecho);
            usado += trecho.length;
        }
        if (i < numeros.length) {
            linhas.push('[o comentário aos versículos ' + numeros[i] + ' a ' +
                numeros[numeros.length - 1] + ' não coube aqui: não cite sobre eles.]');
        }
        return linhas.join('\n\n');
    }

    function doCapitulo(o, alvo, orcamento, teto) {
        var idx = indices[o.id];
        var nome = idx && idx.capitulos[alvo.livro.usfm + ' ' + alvo.capitulo];
        if (!nome) return Promise.resolve(null);
        return pedaco(o.pasta, nome).then(function (d) {
            var corpo = (d.caps || {})[String(alvo.capitulo)];
            if (!corpo) return null;
            var texto = typeof corpo === 'string'
                ? cortar(corpo, orcamento)               /* Henry: prosa do capítulo */
                : deVersiculos(corpo, orcamento, teto);  /* Calvino: versículo a versículo */
            if (!texto) return null;
            return { autor: o.autor, obra: o.obra, quando: o.quando, texto: texto };
        }, function () { return null; });
    }

    /**
     * O comentário inteiro deste capítulo, sem corte nenhum — é o que a
     * tela de leitura do comentário mostra. O corte existe para caber num
     * pedido à IA; para ler, quem corta é o olho.
     */
    function inteiro(alvo) {
        if (!alvo || !alvo.capitulo || !alvo.livro) return Promise.resolve([]);
        return carregar().then(function (idx) {
            return Promise.all(OBRAS.map(function (o) {
                var nome = idx[o.id] && idx[o.id].capitulos[alvo.livro.usfm + ' ' + alvo.capitulo];
                if (!nome) return null;
                return pedaco(o.pasta, nome).then(function (d) {
                    var corpo = (d.caps || {})[String(alvo.capitulo)];
                    if (!corpo) return null;
                    return {
                        id: o.id, autor: o.autor, obra: o.obra, quando: o.quando,
                        /* Calvino vem por versículo; Henry, em prosa corrida. */
                        versos: typeof corpo === 'string' ? null : corpo,
                        texto: typeof corpo === 'string' ? corpo : null
                    };
                }, function () { return null; });
            })).then(function (r) { return r.filter(Boolean); });
        });
    }

    /**
     * As fontes para este capítulo: uma lista (pode vir vazia) com autor,
     * obra e o texto já cortado no tamanho do pedido.
     */
    function fontes(alvo) {
        if (!alvo || !alvo.capitulo || !alvo.livro) return Promise.resolve([]);
        return carregar().then(function (idx) {
            var tem2 = OBRAS.filter(function (o) {
                return idx[o.id] && idx[o.id].capitulos[alvo.livro.usfm + ' ' + alvo.capitulo];
            });
            if (!tem2.length) return [];
            var duas = tem2.length > 1;
            var orcamento = duas ? ACOMPANHADA : SOZINHA;
            var teto = duas ? TETO_DUPLO : TETO;
            return Promise.all(tem2.map(function (o) {
                return doCapitulo(o, alvo, orcamento, teto);
            })).then(function (r) {
                return r.filter(Boolean);
            });
        });
    }

    return {
        OBRAS: OBRAS, carregar: carregar, tem: tem, quantos: quantos,
        fontes: fontes, inteiro: inteiro
    };
})();
