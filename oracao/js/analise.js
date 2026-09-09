/* =========================================================
   O analisador.

   Recebe o que o reconhecimento de fala ouviu e mede o que o método
   ensina a medir: se a ideia foi desenvolvida (5 Ângulos), se a
   oração andou por conexão (4 Pontes), se ela desceu abaixo do
   pedido (5 Níveis), se disse detalhe verdadeiro em vez de palavra
   bonita, e se concluiu por entrega ou parou por falta de assunto.

   O que ele NÃO faz — e a tela de resultado diz isso com todas as
   letras: julgar se a oração foi sincera, se agradou a Deus ou se
   estava teologicamente correta. Ele conta palavras. O resto é seu.

   E não mede tempo. Nenhum relógio entra aqui: velocidade de fala
   não é qualidade de oração, e uma oração de um minuto pode ser
   mais profunda do que uma de dez. O que se mede é o que foi dito.
   ========================================================= */
window.A = window.A || {};

A.analise = (function () {
    'use strict';

    var T = null;   // A.texto, resolvido na primeira chamada

    /* Quantos ângulos dá para esperar numa oração deste tamanho.
       O tamanho aqui é em palavras, não em minutos: uma oração curta pode
       ser inteira, e cobrar cinco ângulos dela seria cobrar errado. */
    function esperado(palavras) {
        if (palavras <= 45) return 3;
        if (palavras <= 110) return 4;
        return 5;
    }

    function analisar(texto) {
        T = A.texto;

        var norm = T.normalizar(texto);
        var toks = norm ? norm.split(' ') : [];
        var n = toks.length;

        var r = {
            palavras: n,
            vazio: n < 8
        };

        r.angulos = medirAngulos(norm, toks);
        r.caminho = medirCaminho(norm, toks);
        r.vocativos = medirVocativos(norm, toks);
        r.repeticao = T.repeticao(toks);
        r.lista = medirLista(toks, n);
        r.especificidade = medirEspecificidade(norm, toks);
        r.abertura = medirAbertura(norm, toks);
        r.encerramento = medirEncerramento(norm);
        r.dificeis = acharDificeis(toks);
        r.muletas = contarMuletas(norm);
        r.frequentes = T.frequentes(toks, 4);

        r.nota = pontuar(r);
        r.sugestoes = sugerir(r);
        r.elogios = elogiar(r);
        return r;
    }

    /* ---------------- os 5 ângulos ---------------- */

    function medirAngulos(norm, toks) {
        return A.ANGULOS.map(function (ang) {
            var p = T.pistas(norm, toks, A.LEXICO_ANGULOS[ang.id]);
            return {
                id: ang.id,
                nome: ang.nome,
                n: p.total,
                presente: p.total > 0,
                forte: p.total >= 3,
                achadas: p.achadas.slice(0, 6)
            };
        });
    }

    /* ---------------- as 4 pontes ----------------
       Uma ponte é uma relação, não uma frase — o que dá para medir é
       se a oração andou na direção dela: a situação apareceu antes da
       necessidade, a necessidade antes da fé, a fé antes da entrega.
       É indício de caminho, não prova de conexão. */
    function medirCaminho(norm, toks) {
        var pos = {};
        ['pessoas', 'situacoes', 'necessidades', 'fe', 'entrega'].forEach(function (k) {
            pos[k] = T.extremos(toks, norm, A.LEXICO_ANGULOS[k]);
        });

        /* Andou de A para B se em algum ponto B veio depois de A. Exigir que
           B *nunca* apareça antes seria cobrar uma ordem que o método não
           impõe: "Tu conheces" bem no começo é abertura legítima, não erro. */
        function andou(a, b) {
            if (!pos[a].achou || !pos[b].achou) return false;
            return pos[b].ultima > pos[a].primeira;
        }

        var pontes = [
            { id: 'parte-todo', nome: 'Parte → Todo', ok: temParteTodo(norm) },
            { id: 'situacao-necessidade', nome: 'Situação → Necessidade', ok: andou('situacoes', 'necessidades') },
            { id: 'necessidade-fe', nome: 'Necessidade → Fé', ok: andou('necessidades', 'fe') },
            { id: 'fe-entrega', nome: 'Fé → Entrega', ok: andou('fe', 'entrega') }
        ];

        var feitas = pontes.filter(function (p) { return p.ok; }).length;
        return {
            pontes: pontes,
            feitas: feitas,
            posicoes: pos,
            grau: feitas >= 3 ? 'caminho' : feitas >= 1 ? 'parcial' : 'solto'
        };
    }

    /* A ponte 1 é a única com marca própria: sai do específico e abre
       para o coletivo. */
    var ABRIU = ['cada familia', 'todas as familias', 'cada lar', 'todos os lares',
        'cada pessoa aqui', 'todos aqui', 'esta igreja', 'nesta sala', 'nesta casa',
        'a todos', 'cada um dos que', 'as familias desta', 'toda esta comunidade',
        'outras familias', 'outras pessoas'];

    function temParteTodo(norm) {
        for (var i = 0; i < ABRIU.length; i++) if (norm.indexOf(ABRIU[i]) >= 0) return true;
        return false;
    }

    /* ---------------- vocativos ----------------
       O sintoma do Módulo 2: "Pai... Senhor... meu Deus..." em fila,
       sem ideia no meio. Vocativo isolado não é problema — fila é. */
    function medirVocativos(norm, toks) {
        var total = 0, i, j;
        for (i = 0; i < toks.length; i++) {
            for (j = 0; j < A.VOCATIVOS.length; j++) {
                if (toks[i] === A.VOCATIVOS[j]) { total++; break; }
            }
        }
        A.VOCATIVOS_FRASE.forEach(function (f) { total += T.contarFrase(norm, f); });

        /* fila: dois vocativos com menos de quatro palavras entre eles */
        var pos = [], seguidos = 0;
        for (i = 0; i < toks.length; i++) {
            if (A.VOCATIVOS.indexOf(toks[i]) >= 0) pos.push(i);
        }
        for (i = 1; i < pos.length; i++) {
            if (pos[i] - pos[i - 1] <= 3) seguidos++;
        }
        return {
            total: total,
            seguidos: seguidos,
            taxa: toks.length ? total / toks.length : 0
        };
    }

    /* ---------------- oração em lista ----------------
       Muitos assuntos, poucas palavras em cada um: o padrão que o
       Módulo 5 chama de agenda sendo cumprida. */
    function medirLista(toks, n) {
        var achados = [];
        A.TOPICOS.forEach(function (t) {
            var c = 0;
            t.raiz.forEach(function (raiz) { c += T.contarRaiz(toks, raiz); });
            if (c) achados.push({ id: t.id, n: c });
        });
        var distintos = achados.length;
        var porTopico = distintos ? Math.round(n / distintos) : n;
        return {
            topicos: achados,
            distintos: distintos,
            porTopico: porTopico,
            /* quatro assuntos ou mais, com menos de 25 palavras em cada:
               não deu tempo de desenvolver nenhum */
            ehLista: distintos >= 4 && porTopico < 25
        };
    }

    /* ---------------- especificidade ---------------- */

    function medirEspecificidade(norm, toks) {
        var esp = 0, vago = 0;
        A.ESPECIFICO_FRASE.forEach(function (f) { esp += T.contarFrase(norm, f); });
        A.VAGO.forEach(function (f) { vago += T.contarFrase(norm, f); });
        /* Possessivo também aponta para algo concreto — "meus filhos" é mais
           real do que "as pessoas". Mas o crédito é pequeno e tem teto: uma
           lista de "minha família, meu trabalho, minha igreja" é possessiva
           do começo ao fim e continua sendo genérica. */
        var poss = 0;
        ['meu', 'minha', 'meus', 'minhas', 'nosso', 'nossa', 'nossos', 'nossas',
            'dele', 'dela', 'deles', 'delas'].forEach(function (p) {
                if (T.contarRaiz(toks, p) > 0) poss++;
            });
        esp += Math.min(2, poss);
        var indice = (esp + vago) ? esp / (esp + vago) : 0.5;
        return { especificos: esp, vagos: vago, indice: indice };
    }

    /* ---------------- abertura e encerramento ---------------- */

    function medirAbertura(norm, toks) {
        var inicio = toks.slice(0, 25).join(' ');
        var louvor = 0, contexto = 0;
        A.ABERTURA_GENERICA.forEach(function (f) { louvor += T.contarFrase(inicio, f); });
        var lexS = A.LEXICO_ANGULOS.situacoes;
        contexto = T.pistas(inicio, toks.slice(0, 25), lexS).total;
        return {
            generica: louvor > 0 && contexto === 0,
            contextual: contexto > 0
        };
    }

    /* O R do ALTAR é reafirmar a confiança — e isso tanto pode sair como
       entrega ("entregamos em Tuas mãos") quanto como afirmação de fé
       ("cremos que Tu estás nisso"). As duas contam como conclusão; o
       "amém" sozinho, não. */
    function medirEncerramento(norm) {
        var toks = norm.split(' ');
        var fim = toks.slice(-40).join(' ');
        var fimToks = fim.split(' ');
        var fechou = 0;
        A.ENCERRAMENTO.forEach(function (f) { fechou += T.contarFrase(fim, f); });
        var entregou = T.pistas(fim, fimToks, A.LEXICO_ANGULOS.entrega).total;
        var confiou = T.pistas(fim, fimToks, A.LEXICO_ANGULOS.fe).total;
        return {
            fechou: fechou > 0,
            porEntrega: entregou > 0 || confiou > 0,
            concluiu: fechou > 0 || entregou > 0 || confiou > 0
        };
    }

    function acharDificeis(toks) {
        var achadas = [];
        A.PALAVRAS_DIFICEIS.forEach(function (raiz) {
            if (T.temRaiz(toks, raiz)) achadas.push(raiz);
        });
        return achadas;
    }

    /* Muleta casa por palavra inteira: sem isso "sabe" apareceria dentro
       de "sabemos" e "sabedoria", e o app acusaria enchimento onde havia
       exatamente o contrário. */
    function contarMuletas(norm) {
        var n = 0;
        A.MULETAS.forEach(function (m) {
            var alvo = m.trim();
            if (!alvo) return;
            var re = new RegExp('\\b' + alvo.replace(/\s+/g, '\\s+') + '\\b', 'g');
            var achou = norm.match(re);
            if (achou) n += achou.length;
        });
        return n;
    }

    /* ---------------- nota ----------------
       Cinco medidas, com peso. Nenhuma delas mede espiritualidade —
       todas medem o que o método diz que é treinável. */
    function pontuar(r) {
        if (r.vazio) return 0;

        var alvoAng = esperado(r.palavras);
        var presentes = r.angulos.filter(function (a) { return a.presente; }).length;
        var desenvolvimento = Math.min(1, presentes / alvoAng) * 35;

        var caminho = (r.caminho.feitas / 4) * 22;

        var especificidade = r.especificidade.indice * 16;

        /* repetição e vocativo em fila comem a mesma fatia: as duas são
           o mesmo problema — preencher em vez de avançar */
        var enchimento = 15;
        enchimento -= Math.min(9, r.repeticao.taxa * 30);
        enchimento -= Math.min(9, r.vocativos.seguidos * 3);
        enchimento = Math.max(0, enchimento);

        var conclusao = 0;
        if (r.encerramento.porEntrega) conclusao = 12;
        else if (r.encerramento.fechou) conclusao = 8;

        var nota = desenvolvimento + caminho + especificidade + enchimento + conclusao;

        if (r.lista.ehLista) nota -= 12;
        if (r.dificeis.length) nota -= 4;
        if (r.muletas >= 4) nota -= 4;
        if (r.abertura.generica) nota -= 4;

        /* Tetos. Três padrões que o material trata como o problema central,
           e não como um detalhe a descontar: a oração em lista, a repetição
           para preencher e os vocativos em fila. Enquanto um deles estiver
           ali, a oração não é boa — por mais pontos que tenha somado nos
           outros critérios. */
        if (r.lista.ehLista) nota = Math.min(nota, 55);
        if (r.repeticao.taxa > 0.25) nota = Math.min(nota, 60);
        if (r.vocativos.seguidos >= 3) nota = Math.min(nota, 55);

        return Math.max(0, Math.min(100, Math.round(nota)));
    }

    /* ---------------- o que dizer ao aluno ----------------
       Cada achado aponta o módulo de onde vem, para que a correção seja
       um caminho de volta ao material, e não um veredito solto. */
    function sugerir(r) {
        var s = [];

        if (r.vazio) {
            s.push({
                grau: 'ruim', titulo: 'Não ouvi quase nada',
                texto: 'Ou o microfone não pegou, ou a oração ficou muito curta. ' +
                    'Se você orou e o app não ouviu, dá para digitar o que disse e analisar mesmo assim.',
                modulo: null
            });
            return s;
        }

        var faltando = r.angulos.filter(function (a) { return !a.presente; });
        var alvoAng = esperado(r.palavras);
        var presentes = 5 - faltando.length;
        if (presentes < alvoAng) {
            var nomes = faltando.map(function (a) { return a.nome; }).join(', ');
            s.push({
                grau: 'ruim', titulo: 'A ideia não foi desenvolvida',
                texto: 'Você tocou ' + presentes + ' dos 5 Ângulos. Faltou: ' + nomes + '. ' +
                    'Não é preciso usar todos sempre — mas numa oração deste tamanho havia espaço. ' +
                    'Quando faltar assunto, faça a pergunta do ângulo, não procure outra frase.',
                modulo: 4
            });
        }

        if (r.caminho.feitas === 0) {
            s.push({
                grau: 'ruim', titulo: 'As ideias ficaram soltas',
                texto: 'Não apareceu nenhuma das quatro relações que fazem uma oração avançar. ' +
                    'A mais simples é situação → necessidade: depois de dizer o que está acontecendo, ' +
                    'diga do que essas pessoas precisam.',
                modulo: 5
            });
        } else if (r.caminho.feitas < 3) {
            var falta = r.caminho.pontes.filter(function (p) { return !p.ok; })
                .map(function (p) { return p.nome; }).join(' · ');
            s.push({
                grau: 'medio', titulo: 'Faltou ponte',
                texto: 'A oração andou em parte. Ainda não apareceu: ' + falta + '. ' +
                    'Cada ideia precisa nascer da anterior.',
                modulo: 5
            });
        }

        if (r.lista.ehLista) {
            s.push({
                grau: 'ruim', titulo: 'Isso ficou parecendo uma lista',
                texto: 'Foram ' + r.lista.distintos + ' assuntos diferentes, com cerca de ' +
                    r.lista.porTopico + ' palavras em cada um. Quem ouve sente tópicos sendo marcados. ' +
                    'Escolha um e permaneça nele — uma ideia bem desenvolvida vale mais do que dez superficiais.',
                modulo: 5
            });
        }

        if (r.vocativos.seguidos >= 2) {
            s.push({
                grau: 'ruim', titulo: 'Vocativos em fila',
                texto: 'Foram ' + r.vocativos.seguidos + ' vezes em que um "Senhor / Pai / meu Deus" veio logo ' +
                    'depois do outro, sem ideia no meio. Isso quase sempre é a busca pela próxima frase ' +
                    'acontecendo em voz alta. Uma pausa consciente é melhor do que uma frase desesperada.',
                modulo: 2
            });
        }

        if (r.repeticao.taxa > 0.12) {
            var ex = r.repeticao.exemplos.length ? ' Por exemplo: "' + r.repeticao.exemplos[0].trecho + '".' : '';
            s.push({
                grau: 'medio', titulo: 'Você repetiu para continuar',
                texto: 'Trechos inteiros voltaram ao longo da oração.' + ex +
                    ' Quando perceber que está repetindo: encerre a ideia atual, faça uma ponte, ' +
                    'aprofunde um nível ou caminhe para a entrega.',
                modulo: 10
            });
        }

        if (r.especificidade.indice < 0.4) {
            s.push({
                grau: 'medio', titulo: 'Faltou detalhe verdadeiro',
                texto: 'A oração ficou no genérico — "tudo", "todas as coisas", "todos". ' +
                    'Não procure palavras mais bonitas: procure detalhes mais verdadeiros. ' +
                    'Diga quem, diga a situação, diga o que está acontecendo de verdade.',
                modulo: 6
            });
        }

        if (r.abertura.generica) {
            s.push({
                grau: 'medio', titulo: 'A abertura poderia ter sido em qualquer lugar',
                texto: 'Começou por louvor automático, sem nada do momento. Não há problema nenhum com ' +
                    'palavras de louvor — o ponto é deixar o contexto alimentar o começo: quem está aqui, ' +
                    'o que essas pessoas trouxeram hoje.',
                modulo: 3
            });
        }

        if (!r.encerramento.concluiu) {
            s.push({
                grau: 'ruim', titulo: 'A oração parou, não concluiu',
                texto: 'Não apareceu entrega nem fechamento no final. A conclusão não é uma fuga por falta ' +
                    'de palavras — é um movimento de entrega: "entregamos isso em Tuas mãos", "confiamos ' +
                    'no Teu cuidado".',
                modulo: 3
            });
        } else if (!r.encerramento.porEntrega) {
            s.push({
                grau: 'medio', titulo: 'Encerrou pela fórmula',
                texto: 'Terminou com o fechamento de sempre, sem passar pela entrega. Antes do "amém", ' +
                    'diga em que vocês estão confiando.',
                modulo: 3
            });
        }

        if (r.dificeis.length) {
            s.push({
                grau: 'medio', titulo: 'Palavra difícil',
                texto: 'Apareceu: ' + r.dificeis.join(', ') + '. Profundidade não é vocabulário técnico. ' +
                    'Palavras que poucos entendem criam distância em vez de conexão.',
                modulo: 6
            });
        }

        if (r.muletas >= 4) {
            s.push({
                grau: 'leve', titulo: 'Muleta de fala',
                texto: 'Apareceram ' + r.muletas + ' marcas de enchimento ("tipo", "né", "então assim"). ' +
                    'Elas ocupam o lugar de uma pausa consciente.',
                modulo: 7
            });
        }

        /* sugestão de vocabulário: só quando a mesma palavra volta muito */
        var alt = sugerirPalavras(r);
        if (alt) s.push(alt);

        return s;
    }

    /* Casa a palavra repetida com a entrada do dicionário pelo termo mais
       longo da expressão ("dá força" casa por "força", não por "dá"). Raiz
       curta só casa inteira: senão "olha por" apanharia "olhando", "olhos" e
       daria uma sugestão que não tem nada a ver com o que foi dito. */
    function chaveDe(comum) {
        var toks = A.texto.normalizar(comum).split(' ');
        var maior = '';
        for (var i = 0; i < toks.length; i++) if (toks[i].length > maior.length) maior = toks[i];
        return maior;
    }

    function sugerirPalavras(r) {
        for (var i = 0; i < r.frequentes.length; i++) {
            var p = r.frequentes[i].palavra;
            for (var j = 0; j < A.SUBSTITUICOES.length; j++) {
                var sub = A.SUBSTITUICOES[j];
                var chave = chaveDe(sub.comum);
                var casou = chave.length >= 5 ? p.indexOf(chave) === 0 : p === chave;
                if (casou) {
                    return {
                        grau: 'leve', titulo: 'A mesma palavra, ' + r.frequentes[i].n + ' vezes',
                        texto: '"' + p + '" apareceu ' + r.frequentes[i].n + ' vezes. Alternativas: ' +
                            sub.alt.join(', ') + '. Frase repetida não é erro — é humano. ' +
                            'O dicionário existe para ampliar as opções.',
                        modulo: null, dicionario: true
                    };
                }
            }
        }
        return null;
    }

    function elogiar(r) {
        var e = [];
        if (r.vazio) return e;
        var presentes = r.angulos.filter(function (a) { return a.presente; });
        if (presentes.length >= 4) e.push('Você desenvolveu a ideia por ' + presentes.length + ' ângulos diferentes.');
        if (r.caminho.feitas >= 3) e.push('A oração andou por conexão: uma ideia levou à próxima.');
        if (r.encerramento.porEntrega) e.push('Terminou por entrega, não por falta de palavras.');
        if (r.especificidade.indice >= 0.65) e.push('Teve detalhe verdadeiro em vez de bênção genérica.');
        if (r.vocativos.seguidos === 0 && r.palavras > 40) e.push('Nenhum vocativo em fila: não houve enchimento.');
        if (r.abertura.contextual) e.push('A abertura nasceu do momento, e não de uma fórmula.');
        if (r.repeticao.taxa < 0.05 && r.palavras > 60) e.push('Você avançou o tempo inteiro, sem repetir para preencher.');
        return e;
    }

    /* Veredito curto, no tom do material: honesto, sem elogio de mentira
       e sem humilhação. */
    function veredito(nota) {
        if (nota >= 85) return 'Isso é oração conduzida. Estrutura invisível, conteúdo real.';
        if (nota >= 70) return 'Boa. Teve caminho e teve verdade — dá para aprofundar mais um nível.';
        if (nota >= 55) return 'Funcionou. Ainda tem trecho preenchendo espaço em vez de avançar.';
        if (nota >= 35) return 'Você começou e chegou ao fim, que já é o exercício. Falta desenvolver.';
        return 'Ficou na superfície. Volte ao ângulo mais fácil: quem está envolvido nisso?';
    }

    return {
        analisar: analisar,
        veredito: veredito,
        esperado: esperado
    };
})();
