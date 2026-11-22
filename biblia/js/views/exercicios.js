/* =========================================================
   TELA EXERCÍCIOS — o que ficou do capítulo (Arena de 6 Modos).

   1. 🎯 Quiz Exegético (Múltipla Escolha & Certo/Errado, corrigido na hora)
   2. 🧩 Completar Lacunas dos Versículos (Cloze / Preencher Palavras-Chave)
   3. ⏳ Ordem Cronológica das Cenas ("O que aconteceu primeiro?")
   4. 🔗 Ligar Pares do Capítulo (Personagens, Palavras no Original & Lugares)
   5. 🕵️ Detetive do Texto ("Em qual versículo ou bloco está isto?")
   6. ⚡ Desafio Relâmpago de 60 Segundos (Revisão Contra o Relógio com Combo)

   As perguntas do Quiz são escritas pela IA no artefato, com o TEXTO DO
   CAPÍTULO dentro do pedido: a resposta certa tem de estar no texto. Os
   outros 5 modos são gerados 100% offline a partir do estudo completo e
   dos versículos reais do capítulo. E mesmo assim o rodapé lembra que,
   se a correção discordar da Bíblia, a Bíblia é que está certa.
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.exercicios = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, bib = B.biblia;

    var feito = {};           // índice da pergunta do Quiz -> alternativa escolhida
    var timerRelampago = null;
    var estadoAtual = null;

    var STOPWORDS = {
        'para': 1, 'como': 1, 'mais': 1, 'pelo': 1, 'pela': 1, 'pelos': 1, 'pelas': 1,
        'sobre': 1, 'entre': 1, 'depois': 1, 'antes': 1, 'quando': 1, 'onde': 1,
        'porque': 1, 'porquanto': 1, 'pois': 1, 'assim': 1, 'entao': 1, 'então': 1,
        'tambem': 1, 'também': 1, 'todos': 1, 'todas': 1, 'tudo': 1, 'cada': 1,
        'outro': 1, 'outra': 1, 'outros': 1, 'outras': 1, 'mesmo': 1, 'mesma': 1,
        'este': 1, 'esta': 1, 'estes': 1, 'estas': 1, 'isto': 1, 'esse': 1, 'essa': 1,
        'esses': 1, 'essas': 1, 'isso': 1, 'aquele': 1, 'aquela': 1, 'aqueles': 1,
        'aquelas': 1, 'aquilo': 1, 'aquelle': 1, 'aquella': 1, 'aquelles': 1,
        'qual': 1, 'quais': 1, 'quem': 1, 'cujo': 1, 'cuja': 1, 'seus': 1, 'suas': 1,
        'meus': 1, 'minha': 1, 'minhas': 1, 'teus': 1, 'tuas': 1, 'nosso': 1, 'nossa': 1,
        'nossos': 1, 'nossas': 1, 'vosso': 1, 'vossa': 1, 'vossos': 1, 'vossas': 1,
        'dele': 1, 'dela': 1, 'deles': 1, 'delas': 1, 'nele': 1, 'nela': 1, 'neles': 1,
        'disse': 1, 'dizendo': 1, 'foram': 1, 'fazer': 1, 'feito': 1, 'feita': 1,
        'tinha': 1, 'tinham': 1, 'estava': 1, 'estavam': 1, 'seja': 1, 'sejam': 1,
        'sera': 1, 'será': 1, 'serao': 1, 'serão': 1, 'fosse': 1, 'fossem': 1,
        'contra': 1, 'desde': 1, 'diante': 1, 'segundo': 1, 'ainda': 1, 'agora': 1,
        'aqui': 1, 'ali': 1, 'além': 1, 'alem': 1, 'muito': 1, 'muita': 1, 'muitos': 1,
        'muitas': 1, 'pouco': 1, 'toda': 1, 'todo': 1, 'eles': 1, 'elas': 1, 'você': 1,
        'vocês': 1, 'contigo': 1, 'comigo': 1, 'conosco': 1, 'convosco': 1, 'perante': 1
    };

    /* ---------- Injeção única de CSS dos 6 modos ---------- */
    function injetarCSS() {
        if (!document || !document.head || document.getElementById('ex-jogos-css')) return;
        var st = document.createElement('style');
        st.id = 'ex-jogos-css';
        st.textContent = [
            '.ex-modos-cab { background: var(--bg-soft); border: 1px solid var(--line); border-left: 4px solid var(--ouro); border-radius: var(--raio); padding: 12px 14px; margin: 10px 0 12px; }',
            '.ex-modos-selo { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--ouro); margin-bottom: 3px; }',
            '.ex-modos-tit { margin: 0 0 4px; font-family: var(--serif); font-size: 20px; color: var(--tinta); }',
            '.ex-modos-barra { display: grid; grid-template-columns: repeat(2, 1fr); gap: 7px; margin: 10px 0 14px; }',
            '@media (min-width: 520px) { .ex-modos-barra { grid-template-columns: repeat(3, 1fr); } }',
            '.ex-modo-aba { display: flex; align-items: center; gap: 7px; text-align: left; padding: 9px 11px; background: var(--bg-soft); border: 1px solid var(--line); border-radius: 12px; font-family: var(--sans); font-size: 13px; font-weight: 700; color: var(--fg); cursor: pointer; transition: border-color .15s, background .15s; }',
            '.ex-modo-aba:active { transform: scale(.99); }',
            '.ex-modo-aba.is-on { background: var(--tinta); border-color: var(--tinta); color: var(--tinta-txt); }',
            '.ex-modo-aba-ico { font-size: 16px; flex: none; }',
            '.ex-modo-aba-txt { display: flex; flex-direction: column; min-width: 0; line-height: 1.2; }',
            '.ex-modo-aba-txt small { font-size: 10.5px; font-weight: 600; opacity: .8; margin-top: 2px; }',
            '.ex-painel-topo { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; background: var(--bg-soft2); border: 1px solid var(--line); border-radius: 12px; padding: 10px 13px; margin-bottom: 12px; font-size: 13.5px; }',
            '.ex-painel-placar { font-weight: 700; color: var(--tinta); background: var(--ouro-claro); border: 1px solid var(--ouro); border-radius: 999px; padding: 3px 11px; font-size: 12.5px; }',
            '.ex-lacuna-card { margin-bottom: 12px; }',
            '.ex-lacuna-ref { display: inline-block; font-size: 11.5px; font-weight: 700; color: var(--tinta); background: var(--ouro-claro); border: 1px solid var(--ouro); border-radius: 999px; padding: 2px 10px; margin-bottom: 8px; }',
            '.ex-lacuna-verso { font-family: var(--serif); font-size: 18px; line-height: 1.68; margin: 4px 0 12px; color: var(--fg); }',
            '.ex-slot { display: inline-flex; align-items: center; justify-content: center; min-width: 82px; padding: 1px 9px; margin: 0 3px; border-bottom: 2px dashed var(--ouro); background: var(--bg-soft2); border-radius: 6px; font-family: var(--sans); font-size: 14px; font-weight: 700; color: var(--tinta); vertical-align: baseline; }',
            '.ex-slot.is-alvo { border: 2px solid var(--ouro); background: var(--ouro-claro); }',
            '.ex-slot.is-preenchido { border: 1px solid var(--ok); background: var(--ok-claro); color: var(--fg); }',
            '.ex-banco-palavras { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 8px; }',
            '.ex-chip-palavra { font-family: var(--sans); font-size: 13.5px; font-weight: 700; padding: 7px 13px; border-radius: 999px; border: 1px solid var(--line); background: var(--bg-soft2); color: var(--fg); cursor: pointer; }',
            '.ex-chip-palavra:disabled { opacity: .45; cursor: default; }',
            '.ex-chip-palavra.is-certa { background: var(--ok-claro); border-color: var(--ok); color: var(--fg); opacity: 1; }',
            '.ex-chip-palavra.is-errada { border-color: var(--bad); color: var(--bad); }',
            '.ex-ordem-fila { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }',
            '.ex-ordem-passo { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; background: var(--ok-claro); border: 1px solid var(--ok); border-radius: 12px; }',
            '.ex-ordem-num { width: 26px; height: 26px; border-radius: 50%; background: var(--ok); color: var(--tinta-txt); font-weight: 700; font-size: 12.5px; display: inline-flex; align-items: center; justify-content: center; flex: none; }',
            '.ex-ordem-cartoes { display: flex; flex-direction: column; gap: 8px; }',
            '.ex-ordem-btn { text-align: left; padding: 12px 14px; background: var(--bg-soft); border: 1px solid var(--line); border-radius: 12px; font-family: var(--sans); font-size: 14px; color: var(--fg); cursor: pointer; display: flex; flex-direction: column; gap: 4px; }',
            '.ex-ordem-btn:disabled { opacity: .45; cursor: default; }',
            '.ex-ordem-btn.is-certa { border-color: var(--ok); background: var(--ok-claro); }',
            '.ex-ordem-btn.is-errada { border-color: var(--bad); color: var(--bad); }',
            '.ex-pares-grade { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-bottom: 12px; }',
            '@media (max-width: 400px) { .ex-pares-grade { grid-template-columns: 1fr; } }',
            '.ex-pares-col { display: flex; flex-direction: column; gap: 8px; }',
            '.ex-par-btn { text-align: left; padding: 11px 12px; background: var(--bg-soft); border: 1px solid var(--line); border-radius: 12px; font-family: var(--sans); font-size: 13.5px; line-height: 1.4; color: var(--fg); cursor: pointer; }',
            '.ex-par-btn.is-selecionado { background: var(--ouro-claro); border-color: var(--ouro); font-weight: 700; }',
            '.ex-par-btn.is-fechado { background: var(--ok-claro); border-color: var(--ok); opacity: .75; cursor: default; }',
            '.ex-par-btn.is-erro { border-color: var(--bad); color: var(--bad); }',
            '.ex-par-selo { display: inline-block; font-size: 10.5px; font-weight: 700; text-transform: uppercase; color: var(--ouro); margin-bottom: 2px; }',
            '.ex-detetive-pista { background: var(--ouro-claro); border: 1px solid var(--ouro); border-radius: 10px; padding: 9px 12px; margin: 8px 0 10px; font-size: 13.5px; }',
            '.ex-detetive-citacao { font-family: var(--serif); font-size: 18px; line-height: 1.6; padding: 12px 14px; background: var(--bg-soft2); border-left: 4px solid var(--ouro); border-radius: 10px; margin: 8px 0 12px; }',
            '.ex-opcoes-jogo { display: flex; flex-direction: column; gap: 7px; }',
            '.ex-opcao-btn { text-align: left; background: var(--bg-soft2); border: 1px solid var(--line); border-radius: 10px; padding: 10px 12px; font-family: var(--sans); font-size: 14px; color: var(--fg); cursor: pointer; }',
            '.ex-opcao-btn:disabled { cursor: default; opacity: .75; }',
            '.ex-opcao-btn.is-certa { background: var(--ok-claro); border-color: var(--ok); font-weight: 700; opacity: 1; }',
            '.ex-opcao-btn.is-errada { border-color: var(--bad); color: var(--bad); opacity: 1; }',
            '.ex-rel-barra { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; background: var(--tinta); color: var(--tinta-txt); padding: 10px 14px; border-radius: 12px; margin-bottom: 12px; font-size: 14px; }',
            '.ex-rel-combo { background: var(--ouro); color: var(--tinta-txt); padding: 2px 9px; border-radius: 999px; font-weight: 700; font-size: 12.5px; }',
            '.ex-gabarito-lista { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }',
            '.ex-gabarito-item { padding: 9px 11px; background: var(--bg-soft2); border: 1px solid var(--line); border-left: 3px solid var(--ouro); border-radius: 9px; font-size: 13.5px; }'
        ].join('\n');
        document.head.appendChild(st);
    }

    function limparTimerRelampago() {
        if (timerRelampago) {
            clearInterval(timerRelampago);
            timerRelampago = null;
        }
    }

    function separar(ref) {
        var m = (ref || '').match(/^(.*?)\s+(\d+)$/);
        if (!m) return null;
        var livro = bib.livro(m[1]);
        if (!livro) return null;
        var cap = parseInt(m[2], 10);
        if (!cap || cap > livro.caps) return null;
        return { livro: livro, capitulo: cap, ref: livro.nome + ' ' + cap };
    }

    /**
     * O JSON das perguntas, lido com desconfiança.
     *
     * O modelo às vezes embrulha a resposta em cercas de código, e um
     * JSON quebrado não pode virar tela quebrada: vira recado.
     */
    function ler(texto) {
        var t = String(texto || '').trim();
        var cerca = t.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (cerca) t = cerca[1].trim();
        var i = t.indexOf('{'), j = t.lastIndexOf('}');
        if (i > 0 || j < t.length - 1) t = t.slice(i, j + 1);
        var d;
        try { d = JSON.parse(t); } catch (e) { return null; }
        var lista = (d && d.perguntas) || [];
        lista = lista.filter(function (q) {
            if (!q || !q.p) return false;
            if (q.t === 'cv') return typeof q.c === 'boolean';
            return Array.isArray(q.o) && q.o.length >= 2 &&
                typeof q.c === 'number' && q.c >= 0 && q.c < q.o.length;
        });
        return lista.length ? lista : null;
    }

    function embaralhar(lista) {
        var a = (lista || []).slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = a[i];
            a[i] = a[j];
            a[j] = tmp;
        }
        return a;
    }

    function render(arg) {
        limparTimerRelampago();
        var alvo = separar(arg);
        if (!alvo) {
            return '<header class="tela-topo"><a class="voltar" href="#/hoje">‹ hoje</a>' +
                '<h2>Exercícios</h2></header>' +
                '<p class="dica">Não reconheci esse capítulo.</p>';
        }
        var enc = encodeURIComponent(alvo.ref);
        return '<header class="tela-topo">' +
            '<a class="voltar" href="#/estudo/' + enc + '">‹ estudo</a>' +
            '<h2>Exercícios</h2>' +
            '<p class="tela-sub">' + esc(alvo.ref) + ' · o que ficou do capítulo</p>' +
            '<div class="grupo-botoes grupo-botoes--dois">' +
            '<a class="btn btn--fraco" href="#/ler/' + enc + '">Ler o texto</a>' +
            '<a class="btn btn--fraco" href="#/estudo/' + enc + '">O estudo</a>' +
            '</div>' +
            '</header>' +
            '<div id="ex-corpo"><p class="carregando">Procurando os exercícios…</p></div>';
    }

    function depois(el, arg) {
        limparTimerRelampago();
        injetarCSS();
        var alvo = separar(arg);
        var caixa = ui.$('ex-corpo');
        if (!alvo || !caixa) return;
        feito = {};

        var pEx = B.estudos.obter(alvo.ref, 'exercicios');
        var pComp = B.estudos.obter(alvo.ref, 'completo').then(function (r) { return r; }, function () { return null; });
        var pTxt = (B.texto && B.texto.capituloOuReserva)
            ? B.texto.capituloOuReserva(alvo.livro.nome, alvo.capitulo).then(function (r) { return r; }, function () { return null; })
            : Promise.resolve(null);

        Promise.all([pEx, pComp, pTxt]).then(function (res) {
            var guardado = res[0];
            var estudoComp = res[1];
            var dadosTexto = res[2];
            var versos = (dadosTexto && dadosTexto.versiculos) ? dadosTexto.versiculos : [];

            /* Caso de JSON corrompido: mostra apenas o recado de embaralhados (sem .ex-pergunta). */
            if (guardado) {
                var perguntas = ler(guardado.texto);
                if (!perguntas) {
                    caixa.innerHTML = ilegivel(alvo);
                    return;
                }
                montarArena(caixa, alvo, perguntas, guardado, estudoComp, versos);
                return;
            }

            /* Sem JSON de exercícios guardado: exibe o aviso oficial no topo e a Arena logo abaixo! */
            montarArena(caixa, alvo, null, null, estudoComp, versos);
        }, function () {
            caixa.innerHTML = '<p class="dica">Não consegui abrir os exercícios agora.</p>';
        });
    }

    function semExercicio(alvo) {
        var noApk = B.copia && B.copia.noApk && B.copia.noApk();
        return '<section class="cartao">' +
            '<p class="dica"><b>Ainda não há exercícios deste capítulo.</b></p>' +
            '<p class="dica">' + (noApk
                ? 'Eles são escritos na Oficina, na versão que roda dentro do Claude, e ' +
                'chegam aqui nos pacotes — junto com os estudos.'
                : 'Para escrever os deste capítulo agora, use a Oficina: o campo ' +
                '"Renovar um capítulo agora" aceita o formato <b>exercícios</b>. Para ' +
                'todos de uma vez, escolha <b>Só os exercícios</b> no mutirão.') + '</p>' +
            '</section>';
    }

    function ilegivel(alvo) {
        return '<section class="cartao">' +
            '<p class="aviso aviso--erro"><b>Os exercícios deste capítulo vieram ' +
            'embaralhados.</b> O que está guardado não é uma lista de perguntas que eu ' +
            'consiga ler.</p>' +
            '<p class="dica">Peça de novo na Oficina (<b>Renovar um capítulo agora</b>, ' +
            'formato exercícios): o pedido é refeito e o texto velho é substituído só ' +
            'quando o novo chega inteiro.</p></section>';
    }

    /* =========================================================
       EXTRAÇÃO DE DADOS DO ESTUDO COMPLETO E DOS VERSÍCULOS
       ========================================================= */

    function extrairSecaoMarkdown(md, regexTitulo) {
        if (!md) return '';
        var partes = String(md).split(/\n(?=#{2,4}\s)/);
        for (var i = 0; i < partes.length; i++) {
            var linhas = partes[i].split('\n');
            var cab = (linhas[0] || '').replace(/^#+\s*/, '').trim();
            if (regexTitulo.test(cab)) {
                return linhas.slice(1).join('\n').trim();
            }
        }
        return '';
    }

    function limparMd(s) {
        return String(s || '')
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/^\s*[-*•]\s*/, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function primeiraSentenca(s, maxLen) {
        var limpo = limparMd(s);
        if (!limpo) return '';
        var m = limpo.match(/^(.+?[.!?])(?:\s|$)/);
        var f = m ? m[1] : limpo;
        var teto = maxLen || 140;
        if (f.length > teto) {
            f = f.slice(0, teto - 1).replace(/\s+\S*$/, '') + '…';
        }
        return f;
    }

    /* Extrai itens em negrito "- **Termo:** Explicação" de uma seção do estudo */
    function extrairItensNegrito(mdSecao, rotuloCategoria) {
        if (!mdSecao) return [];
        var linhas = mdSecao.split(/\n+/);
        var itens = [];
        for (var i = 0; i < linhas.length; i++) {
            var ln = linhas[i].trim();
            if (!ln) continue;
            var m = ln.match(/^(?:[-*•]|\d+\.)?\s*\*\*([^*]{2,75})\*\*[:.\s—–-]*(.+)$/);
            if (m) {
                var chave = limparMd(m[1]).replace(/[:.—–-]+$/, '').trim();
                var valor = primeiraSentenca(m[2], 145);
                if (chave && valor && valor.length >= 12) {
                    itens.push({ a: chave, b: valor, tipo: rotuloCategoria });
                }
            }
        }
        return itens;
    }

    /* Extrai versículos-chave citados no estudo (ou escolhe os mais ricos do capítulo) */
    function extrairNumerosVersosChave(mdEstudo, totalVersos) {
        var achados = [];
        var vistos = {};
        var sec = extrairSecaoMarkdown(mdEstudo, /vers[íi]culos?-chave/i);
        if (sec) {
            var regex = /(?:[:.]|\bv\.|\bvv\.)\s*(\d{1,3})\b/gi;
            var m;
            while ((m = regex.exec(sec)) !== null) {
                var num = parseInt(m[1], 10);
                if (num >= 1 && num <= totalVersos && !vistos[num]) {
                    vistos[num] = true;
                    achados.push(num);
                }
            }
        }
        return achados;
    }

    /* Constrói os itens do Modo 2: Completar as Lacunas do Versículo (Cloze) */
    function gerarDadosLacunas(alvo, estudoComp, versos) {
        var lista = versos && versos.length ? versos : [
            'No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.',
            'Sabendo Jesus que o Pai tinha depositado nas suas mãos todas as coisas, levantou-se da ceia, tirou as vestes e, tomando uma toalha, cingiu-se.',
            'Depois deitou água numa bacia e começou a lavar os pés aos discípulos e a enxugar-lhos com a toalha com que estava cingido.',
            'Um novo mandamento vos dou: que vos ameis uns aos outros; como eu vos amei a vós, que também vós uns aos outros vos ameis.'
        ];

        var preferidos = extrairNumerosVersosChave(estudoComp && estudoComp.texto, lista.length);
        var indices = [];
        var usados = {};

        preferidos.forEach(function (vNum) {
            var idx = vNum - 1;
            if (idx >= 0 && idx < lista.length && lista[idx].length >= 45 && !usados[idx]) {
                usados[idx] = true;
                indices.push(idx);
            }
        });

        /* Completa até 5 versículos distribuídos pelo capítulo */
        var candidatos = [];
        for (var i = 0; i < lista.length; i++) {
            if (!usados[i] && lista[i] && lista[i].length >= 45) {
                candidatos.push(i);
            }
        }
        if (!candidatos.length) {
            for (var c = 0; c < lista.length; c++) {
                if (!usados[c]) candidatos.push(c);
            }
        }

        var passo = Math.max(1, Math.floor(candidatos.length / Math.max(1, 5 - indices.length)));
        for (var k = 0; k < candidatos.length && indices.length < 5; k += passo) {
            indices.push(candidatos[k]);
        }
        indices.sort(function (a, b) { return a - b; });

        /* Coleta vocabulário do capítulo para distratores plausíveis */
        var vocabCap = [];
        var vocabVisto = {};
        lista.forEach(function (v) {
            var pals = String(v).split(/[^A-Za-zÀ-ÖØ-öø-ÿ]+/);
            pals.forEach(function (p) {
                var b = p.toLowerCase();
                if (p.length >= 5 && !STOPWORDS[b] && !vocabVisto[b]) {
                    vocabVisto[b] = true;
                    vocabCap.push(p);
                }
            });
        });

        return indices.map(function (idx) {
            var textoOriginal = String(lista[idx] || '').trim();
            var tokens = textoOriginal.match(/[A-Za-zÀ-ÖØ-öø-ÿ]+|[^A-Za-zÀ-ÖØ-öø-ÿ]+/g) || [textoOriginal];
            var candidatosPal = [];
            tokens.forEach(function (tk, pos) {
                if (/^[A-Za-zÀ-ÖØ-öø-ÿ]+$/.test(tk)) {
                    var baixa = tk.toLowerCase();
                    if (tk.length >= 5 && !STOPWORDS[baixa]) {
                        candidatosPal.push({ pos: pos, palavra: tk, baixa: baixa });
                    }
                }
            });
            if (candidatosPal.length < 2) {
                tokens.forEach(function (tk, pos) {
                    if (/^[A-Za-zÀ-ÖØ-öø-ÿ]+$/.test(tk) && tk.length >= 4) {
                        candidatosPal.push({ pos: pos, palavra: tk, baixa: tk.toLowerCase() });
                    }
                });
            }

            /* Escolhe 2 ou 3 palavras bem espaçadas no versículo */
            var escolhidas = [];
            var jaBaixa = {};
            var meta = candidatosPal.length >= 5 ? 3 : Math.min(2, candidatosPal.length);
            var salto = Math.max(1, Math.floor(candidatosPal.length / Math.max(1, meta)));
            for (var m = 0; m < candidatosPal.length && escolhidas.length < meta; m += salto) {
                var cand = candidatosPal[m];
                if (!jaBaixa[cand.baixa]) {
                    jaBaixa[cand.baixa] = true;
                    escolhidas.push(cand);
                }
            }

            /* Distratores plausíveis do próprio capítulo */
            var distratores = [];
            var poolDist = embaralhar(vocabCap);
            for (var d = 0; d < poolDist.length && distratores.length < 2; d++) {
                var pDist = poolDist[d];
                if (!jaBaixa[pDist.toLowerCase()]) {
                    jaBaixa[pDist.toLowerCase()] = true;
                    distratores.push(pDist);
                }
            }
            if (distratores.length < 2) {
                ['aliança', 'palavra', 'caminho', 'verdade'].forEach(function (extra) {
                    if (distratores.length < 2 && !jaBaixa[extra]) distratores.push(extra);
                });
            }

            var banco = embaralhar(escolhidas.map(function (e) { return e.palavra; }).concat(distratores));

            return {
                versoNum: idx + 1,
                ref: alvo.ref + ':' + (idx + 1),
                textoOriginal: textoOriginal,
                tokens: tokens,
                lacunas: escolhidas,
                banco: banco
            };
        });
    }

    /* Constrói as cenas do Modo 3: Ordem Cronológica das Cenas do Capítulo */
    function gerarDadosCenas(alvo, estudoComp, versos) {
        var cenas = [];
        if (estudoComp && estudoComp.texto && B.contexto && B.contexto.__cenasDe) {
            cenas = B.contexto.__cenasDe(estudoComp.texto, false) || [];
        }
        if (cenas.length >= 3) {
            return cenas.slice(0, 6).map(function (c, i) {
                return {
                    ordem: i,
                    onde: c.onde || ('Bloco ' + (i + 1)),
                    titulo: c.titulo || '',
                    resumo: c.texto || c.titulo || ('Cena ' + (i + 1) + ' de ' + alvo.ref)
                };
            });
        }

        /* Reserva a partir dos versículos reais do capítulo divididos em 4 a 5 blocos */
        var lista = versos && versos.length ? versos : [
            'Abertura do capítulo: o cenário e os personagens iniciais em ' + alvo.ref + '.',
            'O desenvolvimento central do discurso ou acontecimento bíblico.',
            'O ponto de virada e a resposta diante da Palavra de Deus.',
            'O desfecho do capítulo e a preparação para o próximo passo.'
        ];
        var numBlocos = Math.min(5, Math.max(3, Math.ceil(lista.length / 6)));
        var tam = Math.max(1, Math.ceil(lista.length / numBlocos));
        var blocos = [];
        for (var i = 0; i < numBlocos; i++) {
            var ini = i * tam;
            if (ini >= lista.length) break;
            var fim = Math.min(lista.length, ini + tam);
            var trecho = primeiraSentenca(lista[ini], 150);
            blocos.push({
                ordem: blocos.length,
                onde: (ini + 1) === fim ? ('v. ' + (ini + 1)) : ('vv. ' + (ini + 1) + '–' + fim),
                titulo: 'Cena ' + (blocos.length + 1),
                resumo: trecho
            });
        }
        return blocos;
    }

    /* Constrói os pares do Modo 4: Ligar Pares (Personagens, Léxico Original, Lugares ou Versículos) */
    function gerarDadosPares(alvo, estudoComp, versos, perguntasQuiz) {
        var pares = [];
        var vistos = {};

        function adicionarPar(a, b, tipo) {
            var ca = String(a || '').trim();
            var cb = String(b || '').trim();
            if (!ca || !cb || vistos[ca.toLowerCase()]) return;
            vistos[ca.toLowerCase()] = true;
            pares.push({ id: pares.length, a: ca, b: cb, tipo: tipo || 'Capítulo' });
        }

        if (estudoComp && estudoComp.texto) {
            var secQuem = extrairSecaoMarkdown(estudoComp.texto, /quem [ée] quem/i);
            extrairItensNegrito(secQuem, '👤 Quem é quem').forEach(function (it) {
                adicionarPar(it.a, it.b, it.tipo);
            });

            var secOrig = extrairSecaoMarkdown(estudoComp.texto, /palavras? no original/i);
            extrairItensNegrito(secOrig, '🔤 Original').forEach(function (it) {
                adicionarPar(it.a, it.b, it.tipo);
            });

            var secLug = extrairSecaoMarkdown(estudoComp.texto, /^os lugares/i);
            extrairItensNegrito(secLug, '📍 Lugar').forEach(function (it) {
                adicionarPar(it.a, it.b, it.tipo);
            });
        }

        /* Se houver perguntas do Quiz, aproveita também como pares exegéticos se faltarem itens */
        if (pares.length < 4 && perguntasQuiz && perguntasQuiz.length) {
            perguntasQuiz.forEach(function (q) {
                var resp = textoCerto(q);
                var refV = q.v ? ('v. ' + q.v + ' · ' + resp) : resp;
                adicionarPar(refV, q.e || q.p, '🎯 Exegese');
            });
        }

        /* Completa com versículos-chave do capítulo se ainda houver menos de 4 pares */
        if (pares.length < 4 && versos && versos.length) {
            var salto = Math.max(1, Math.floor(versos.length / 5));
            for (var i = 0; i < versos.length && pares.length < 5; i += salto) {
                var vTxt = primeiraSentenca(versos[i], 130);
                if (vTxt) {
                    adicionarPar(alvo.ref + ':' + (i + 1), vTxt, '📖 Versículo');
                }
            }
        }

        if (pares.length < 3) {
            var ctx = B.contexto && B.contexto.analisar ? B.contexto.analisar(alvo.livro, alvo.capitulo) : null;
            adicionarPar(alvo.ref, (ctx && ctx.temaLivro) || 'Capítulo estudado na leitura bíblica.', '📖 Contexto');
            if (ctx && ctx.alianca) {
                adicionarPar(ctx.alianca.nome, ctx.alianca.promessa, '🏛️ Aliança');
                adicionarPar('Cristo na Aliança', ctx.alianca.cristo, '✝️ Cristologia');
            }
        }

        return pares.slice(0, 6);
    }

    /* Constrói os casos do Modo 5: Detetive do Texto ("Em qual versículo ou bloco está isto?") */
    function gerarDadosDetetive(alvo, estudoComp, versos, perguntasQuiz) {
        var casos = [];
        var cenas = gerarDadosCenas(alvo, estudoComp, versos);

        /* Casos baseados nos versículos do capítulo */
        if (versos && versos.length >= 4) {
            var escolhidos = [];
            var passo = Math.max(1, Math.floor(versos.length / 5));
            for (var i = 0; i < versos.length && escolhidos.length < 5; i += passo) {
                escolhidos.push(i);
            }
            escolhidos.forEach(function (vIdx) {
                var vNum = vIdx + 1;
                var rotuloCerto = alvo.ref + ':' + vNum + ' (Versículo ' + vNum + ')';
                var opcoes = [rotuloCerto];
                var pool = [];
                for (var j = 0; j < versos.length; j++) {
                    if (j !== vIdx) pool.push(j + 1);
                }
                embaralhar(pool).slice(0, 3).forEach(function (outroNum) {
                    opcoes.push(alvo.ref + ':' + outroNum + ' (Versículo ' + outroNum + ')');
                });

                var anterior = vIdx > 0 ? primeiraSentenca(versos[vIdx - 1], 110) : 'Está logo na abertura do capítulo.';
                var posterior = (vIdx + 1 < versos.length) ? primeiraSentenca(versos[vIdx + 1], 110) : 'Está no encerramento do capítulo.';

                casos.push({
                    tipo: 'Trecho literal do capítulo',
                    citacao: '“' + limparMd(versos[vIdx]) + '”',
                    pista: vIdx > 0
                        ? ('O versículo imediatamente anterior diz: “' + anterior + '”')
                        : ('O versículo seguinte continua dizendo: “' + posterior + '”'),
                    opcoes: embaralhar(opcoes),
                    certa: rotuloCerto,
                    explicacao: 'Registrado literalmente em ' + alvo.ref + ':' + vNum + '.'
                });
            });
        }

        /* Casos baseados nas cenas exegéticas de "O capítulo, parte por parte" */
        if (cenas.length >= 3 && casos.length < 6) {
            var todosRots = cenas.map(function (c) {
                return c.onde + (c.titulo ? ' · ' + c.titulo : '');
            });
            cenas.forEach(function (c, idx) {
                if (casos.length >= 6) return;
                var rotCerto = todosRots[idx];
                var outros = embaralhar(todosRots.filter(function (_, n) { return n !== idx; })).slice(0, 3);
                casos.push({
                    tipo: 'Análise exegética do bloco',
                    citacao: c.resumo,
                    pista: idx === 0
                        ? 'Este é o bloco que abre o capítulo.'
                        : ('Acontece logo após o bloco ' + cenas[idx - 1].onde + '.'),
                    opcoes: embaralhar([rotCerto].concat(outros)),
                    certa: rotCerto,
                    explicacao: 'Esta cena pertence à faixa ' + rotCerto + ' de ' + alvo.ref + '.'
                });
            });
        }

        if (!casos.length && perguntasQuiz && perguntasQuiz.length) {
            perguntasQuiz.forEach(function (q) {
                var cert = textoCerto(q);
                var ops = q.t === 'cv' ? ['Certo', 'Errado'] : q.o.slice();
                casos.push({
                    tipo: 'Investigação do capítulo',
                    citacao: q.p,
                    pista: q.v ? ('Consulte o versículo ' + q.v + ' de ' + alvo.ref + '.') : 'Observe o contexto central do capítulo.',
                    opcoes: ops,
                    certa: cert,
                    explicacao: (q.e || '') + (q.v ? ' (Versículo ' + q.v + ')' : '')
                });
            });
        }

        return casos.slice(0, 5);
    }

    /* Constrói o banco de perguntas do Modo 6: Desafio Relâmpago de 60 Segundos */
    function gerarBancoRelampago(alvo, estudoComp, versos, perguntasQuiz) {
        var banco = [];

        /* 1. Perguntas do Quiz Exegético */
        if (perguntasQuiz && perguntasQuiz.length) {
            perguntasQuiz.forEach(function (q) {
                var opcoes = q.t === 'cv' ? ['Certo', 'Errado'] : q.o.slice();
                var respCerta = textoCerto(q);
                banco.push({
                    categoria: '🎯 Quiz Exegético',
                    pergunta: q.p,
                    opcoes: opcoes,
                    certa: respCerta,
                    fonte: q.v ? (alvo.ref + ':' + q.v) : alvo.ref,
                    explicacao: q.e || ('Resposta correta: ' + respCerta)
                });
            });
        }

        /* 2. Pares de Personagens, Palavras no Original e Lugares */
        var pares = gerarDadosPares(alvo, estudoComp, versos, perguntasQuiz);
        if (pares.length >= 3) {
            pares.forEach(function (par, idx) {
                var outros = embaralhar(pares.filter(function (_, n) { return n !== idx; }))
                    .slice(0, 3)
                    .map(function (x) { return x.a; });
                var opcoes = embaralhar([par.a].concat(outros));
                banco.push({
                    categoria: par.tipo,
                    pergunta: par.b,
                    opcoes: opcoes,
                    certa: par.a,
                    fonte: alvo.ref,
                    explicacao: par.a + ' — ' + par.b
                });
            });
        }

        /* 3. Versículos e Lacunas rápidas */
        var lacunas = gerarDadosLacunas(alvo, estudoComp, versos);
        lacunas.forEach(function (lac) {
            if (!lac.lacunas || !lac.lacunas.length) return;
            var alvoPal = lac.lacunas[0];
            var fraseComLacuna = lac.tokens.map(function (tk, pos) {
                return pos === alvoPal.pos ? '_____' : tk;
            }).join('');
            var opcoes = embaralhar(lac.banco.slice(0, 4));
            if (opcoes.indexOf(alvoPal.palavra) < 0) {
                opcoes[0] = alvoPal.palavra;
                opcoes = embaralhar(opcoes);
            }
            banco.push({
                categoria: '🧩 Palavra do Versículo',
                pergunta: 'Complete ' + lac.ref + ': “' + primeiraSentenca(fraseComLacuna, 160) + '”',
                opcoes: opcoes,
                certa: alvoPal.palavra,
                fonte: lac.ref,
                explicacao: lac.ref + ' — “' + primeiraSentenca(lac.textoOriginal, 160) + '”'
            });
        });

        return embaralhar(banco);
    }

    /* =========================================================
       MONTAGEM DA ARENA DE 6 MODOS DE EXERCÍCIOS DO CAPÍTULO
       ========================================================= */

    var MODOS_INFO = [
        { id: 'quiz', ico: '🎯', nome: '1. Quiz Exegético', sub: 'Múltipla escolha & C/E' },
        { id: 'lacunas', ico: '🧩', nome: '2. Lacunas do Texto', sub: 'Completar versículos' },
        { id: 'ordem', ico: '⏳', nome: '3. Ordem das Cenas', sub: 'Sequência do capítulo' },
        { id: 'pares', ico: '🔗', nome: '4. Ligar Pares', sub: 'Pessoas, original e lugares' },
        { id: 'detetive', ico: '🕵️', nome: '5. Detetive Bíblico', sub: 'Achar o versículo/bloco' },
        { id: 'relampago', ico: '⚡', nome: '6. Relâmpago 60s', sub: 'Desafio com combo' }
    ];

    function montarArena(caixa, alvo, perguntas, guardado, estudoComp, versos) {
        estadoAtual = {
            caixa: caixa,
            alvo: alvo,
            perguntas: perguntas,
            guardado: guardado,
            estudoComp: estudoComp,
            versos: versos,
            modoAtivo: 'quiz'
        };

        var abasHtml = '<div class="ex-modos-cab">' +
            '<span class="ex-modos-selo">🎮 Laboratório Bíblico Interativo · 6 Modos de Fixação</span>' +
            '<h3 class="ex-modos-tit">Arena de Exercícios de ' + esc(alvo.ref) + '</h3>' +
            '<p class="dica">Treine o capítulo por 6 ângulos complementares: interpretação textual, memorização de versículos, ordem cronológica das cenas, léxico/personagens, investigação de referências e revisão relâmpago.</p>' +
            '<div class="ex-modos-barra" role="tablist">' +
            MODOS_INFO.map(function (m) {
                var ativo = m.id === 'quiz';
                return '<button type="button" class="ex-modo-aba' + (ativo ? ' is-on' : '') + '" ' +
                    'data-ex-modo="' + m.id + '" role="tab" aria-selected="' + (ativo ? 'true' : 'false') + '">' +
                    '<span class="ex-modo-aba-ico">' + m.ico + '</span>' +
                    '<span class="ex-modo-aba-txt"><span>' + esc(m.nome) + '</span>' +
                    '<small>' + esc(m.sub) + '</small></span>' +
                    '</button>';
            }).join('') +
            '</div>' +
            '</div>';

        var avisoTopo = !guardado ? semExercicio(alvo) : '';

        caixa.innerHTML = avisoTopo + abasHtml + '<div id="ex-arena-palco"></div>';

        /* Procurado dentro da própria caixa, não no documento: o
           pedido é assíncrono, e quem trocou de tela antes de ele
           chegar deixava esta caixa fora da página — aí o palco não
           existia e a tela inteira quebrava. */
        var palco = caixa.querySelector('#ex-arena-palco');
        if (!palco) return;
        pintarModoQuiz(palco, alvo, perguntas, guardado);

        /* Ouvinte das abas de modo */
        ui.qq('[data-ex-modo]', caixa).forEach(function (btn) {
            btn.addEventListener('click', function () {
                var novoModo = btn.getAttribute('data-ex-modo');
                if (!novoModo) return;
                limparTimerRelampago();
                estadoAtual.modoAtivo = novoModo;
                ui.qq('[data-ex-modo]', caixa).forEach(function (b) {
                    var on = b === btn;
                    b.classList.toggle('is-on', on);
                    b.setAttribute('aria-selected', on ? 'true' : 'false');
                });
                abrirModoNoPalco(palco, novoModo);
            });
        });
    }

    function abrirModoNoPalco(palco, modo) {
        if (!palco || !estadoAtual) return;
        var st = estadoAtual;
        if (modo === 'quiz') {
            pintarModoQuiz(palco, st.alvo, st.perguntas, st.guardado);
        } else if (modo === 'lacunas') {
            pintarModoLacunas(palco, st.alvo, st.estudoComp, st.versos);
        } else if (modo === 'ordem') {
            pintarModoOrdem(palco, st.alvo, st.estudoComp, st.versos);
        } else if (modo === 'pares') {
            pintarModoPares(palco, st.alvo, st.estudoComp, st.versos, st.perguntas);
        } else if (modo === 'detetive') {
            pintarModoDetetive(palco, st.alvo, st.estudoComp, st.versos, st.perguntas);
        } else if (modo === 'relampago') {
            pintarModoRelampago(palco, st.alvo, st.estudoComp, st.versos, st.perguntas);
        }
    }

    /* =========================================================
       MODO 1: 🎯 QUIZ EXEGÉTICO (Compatível 100% com teste-exercicios.mjs)
       ========================================================= */

    function pintarModoQuiz(palco, alvo, perguntas, guardado) {
        feito = {};
        if (!perguntas || !perguntas.length) {
            palco.innerHTML =
                '<section class="cartao">' +
                '<p class="dica">O <b>Quiz Exegético</b> deste capítulo ainda não foi gerado na Oficina, mas você já pode jogar agora mesmo os outros <b>5 modos interativos</b> nas abas acima:</p>' +
                '<div class="grupo-botoes grupo-botoes--dois">' +
                '<button type="button" class="btn btn--forte" data-ir-modo="lacunas">🧩 Jogar Lacunas</button>' +
                '<button type="button" class="btn btn--forte" data-ir-modo="ordem">⏳ Ordem das Cenas</button>' +
                '<button type="button" class="btn btn--fraco" data-ir-modo="pares">🔗 Ligar Pares</button>' +
                '<button type="button" class="btn btn--fraco" data-ir-modo="detetive">🕵️ Detetive do Texto</button>' +
                '</div>' +
                '</section>';
            ui.qq('[data-ir-modo]', palco).forEach(function (b) {
                b.addEventListener('click', function () {
                    var m = b.getAttribute('data-ir-modo');
                    var aba = ui.q('[data-ex-modo="' + m + '"]');
                    if (aba) aba.click();
                });
            });
            return;
        }

        palco.innerHTML =
            '<p class="dica">São <b>' + perguntas.length + '</b> perguntas sobre ' +
            esc(alvo.ref) + '. Toque na resposta: ela é corrigida na hora, e a explicação ' +
            'diz em que versículo está.</p>' +
            '<div id="ex-placar" class="ex-placar" hidden></div>' +
            '<div class="exercicios">' +
            perguntas.map(function (q, i) { return cartao(q, i); }).join('') +
            '</div>' +
            '<div class="ex-pe">' +
            '<button class="btn btn--fraco btn--largo" id="ex-refazer">Refazer</button>' +
            '<p class="dica">Perguntas escritas por IA com o texto do capítulo na frente, ' +
            'e a resposta certa tem de estar nele. Mesmo assim: se a correção discordar da ' +
            'Bíblia, <b>a Bíblia está certa</b> — e vale avisar para o capítulo ser ' +
            'refeito.' + (guardado && guardado.criado ? ' Escritos ' + ui.quando(guardado.criado) + '.' : '') +
            '</p></div>';

        ligar(palco, perguntas);
    }

    function cartao(q, i) {
        var alternativas = q.t === 'cv'
            ? [{ r: 'Certo', v: 'true' }, { r: 'Errado', v: 'false' }]
            : q.o.map(function (o, n) { return { r: o, v: String(n) }; });
        return '<section class="cartao ex-pergunta" data-q="' + i + '">' +
            '<p class="ex-pergunta-txt"><b>' + (i + 1) + '.</b> ' + esc(q.p) + '</p>' +
            '<div class="alternativas">' +
            alternativas.map(function (a) {
                return '<button class="alt-ex" data-q="' + i + '" data-v="' + a.v + '">' +
                    esc(a.r) + '</button>';
            }).join('') +
            '</div>' +
            '<div class="ex-resposta" hidden></div>' +
            '</section>';
    }

    function certa(q) { return q.t === 'cv' ? String(q.c) : String(q.c); }

    function ligar(caixa, perguntas) {
        caixa.addEventListener('click', function (ev) {
            var b = ev.target.closest ? ev.target.closest('.alt-ex') : null;
            if (b) return responder(caixa, perguntas, b);
            if (ev.target.id === 'ex-refazer') {
                feito = {};
                ui.qq('.ex-pergunta', caixa).forEach(function (sec) {
                    ui.qq('.alt-ex', sec).forEach(function (a) {
                        a.classList.remove('is-certa', 'is-errada');
                        a.disabled = false;
                    });
                    var r = ui.q('.ex-resposta', sec);
                    r.hidden = true;
                    r.innerHTML = '';
                });
                var placarEl = ui.$('ex-placar');
                if (placarEl) placarEl.hidden = true;
                caixa.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    function responder(caixa, perguntas, botao) {
        var i = +botao.getAttribute('data-q');
        if (i in feito) return;          // responde uma vez; depois é "refazer"
        var q = perguntas[i];
        var escolhido = botao.getAttribute('data-v');
        var gabarito = certa(q);
        feito[i] = escolhido;

        var sec = botao.closest('.ex-pergunta');
        ui.qq('.alt-ex', sec).forEach(function (a) {
            a.disabled = true;
            if (a.getAttribute('data-v') === gabarito) a.classList.add('is-certa');
            else if (a === botao) a.classList.add('is-errada');
        });

        /* A resposta certa aparece sempre, acertando ou errando: o ponto do
           exercício é aprender o capítulo, não medir ninguém. */
        var acertou = escolhido === gabarito;
        var resp = ui.q('.ex-resposta', sec);
        resp.hidden = false;
        resp.innerHTML = '<p class="' + (acertou ? 'ex-ok' : 'ex-nao') + '">' +
            (acertou ? '✓ Certo.' : '✗ A resposta é: <b>' + esc(textoCerto(q)) + '</b>') +
            '</p>' +
            (q.e ? '<p class="dica">' + esc(q.e) + '</p>' : '') +
            (q.v ? '<p class="dica">Versículo ' + esc(String(q.v)) + '.</p>' : '');

        placar(perguntas);
    }

    function textoCerto(q) {
        if (q.t === 'cv') return q.c ? 'Certo' : 'Errado';
        return q.o[q.c];
    }

    function placar(perguntas) {
        var feitas = Object.keys(feito).length;
        var caixa = ui.$('ex-placar');
        if (!caixa) return;
        var acertos = 0;
        Object.keys(feito).forEach(function (i) {
            if (feito[i] === certa(perguntas[i])) acertos++;
        });
        caixa.hidden = false;
        caixa.innerHTML = '<b>' + acertos + '</b> de <b>' + feitas + '</b> respondidas' +
            (feitas === perguntas.length ? ' · acabou' : '');
    }

    /* =========================================================
       MODO 2: 🧩 COMPLETAR AS LACUNAS DO VERSÍCULO (CLOZE)
       ========================================================= */

    function pintarModoLacunas(palco, alvo, estudoComp, versos) {
        var itens = gerarDadosLacunas(alvo, estudoComp, versos);
        var totalLacunas = itens.reduce(function (acc, it) { return acc + it.lacunas.length; }, 0);
        var preenchidas = 0;
        var acertos = 0;

        var cartoesHtml = itens.map(function (it, idxCard) {
            var mapaPos = {};
            it.lacunas.forEach(function (l, idxLac) {
                mapaPos[l.pos] = idxLac;
            });

            var versoHtml = it.tokens.map(function (tk, pos) {
                if (pos in mapaPos) {
                    var nLac = mapaPos[pos];
                    return '<span class="ex-slot' + (nLac === 0 ? ' is-alvo' : '') + '" ' +
                        'data-slot-card="' + idxCard + '" data-slot-idx="' + nLac + '">' +
                        '[' + (nLac + 1) + ' ___]</span>';
                }
                return esc(tk);
            }).join('');

            var chipsHtml = it.banco.map(function (pal, idxChip) {
                return '<button type="button" class="ex-chip-palavra" ' +
                    'data-chip-card="' + idxCard + '" data-chip-idx="' + idxChip + '" ' +
                    'data-chip-pal="' + esc(pal) + '">' + esc(pal) + '</button>';
            }).join('');

            return '<section class="cartao ex-lacuna-card" data-lacuna-card="' + idxCard + '">' +
                '<span class="ex-lacuna-ref">📖 ' + esc(it.ref) + '</span>' +
                '<p class="ex-lacuna-verso">' + versoHtml + '</p>' +
                '<div class="ex-banco-palavras">' + chipsHtml + '</div>' +
                '<div class="ex-lacuna-fb" hidden></div>' +
                '</section>';
        }).join('');

        palco.innerHTML =
            '<div class="ex-painel-topo">' +
            '<span>Toque nas palavras na ordem das lacunas <b>[1]</b>, <b>[2]</b>…</span>' +
            '<span class="ex-painel-placar" id="ex-lacunas-placar">0 / ' + totalLacunas + ' palavras</span>' +
            '</div>' +
            cartoesHtml +
            '<button type="button" class="btn btn--fraco btn--largo" id="ex-lacunas-novo">🔄 Embaralhar novos versículos</button>';

        var proximoPorCard = itens.map(function () { return 0; });

        palco.addEventListener('click', function (ev) {
            if (ev.target.id === 'ex-lacunas-novo') {
                pintarModoLacunas(palco, alvo, estudoComp, versos);
                return;
            }
            var chip = ev.target.closest ? ev.target.closest('.ex-chip-palavra') : null;
            if (!chip || chip.disabled) return;

            var cIdx = +chip.getAttribute('data-chip-card');
            var item = itens[cIdx];
            var atualIdx = proximoPorCard[cIdx];
            if (!item || atualIdx >= item.lacunas.length) return;

            var esperado = item.lacunas[atualIdx].palavra;
            var escolhida = chip.getAttribute('data-chip-pal');
            var cardEl = ui.q('[data-lacuna-card="' + cIdx + '"]', palco);

            if (escolhida.toLowerCase() === esperado.toLowerCase()) {
                chip.disabled = true;
                chip.classList.add('is-certa');
                var slotEl = ui.q('[data-slot-card="' + cIdx + '"][data-slot-idx="' + atualIdx + '"]', cardEl);
                if (slotEl) {
                    slotEl.textContent = esperado;
                    slotEl.classList.remove('is-alvo');
                    slotEl.classList.add('is-preenchido');
                }
                proximoPorCard[cIdx]++;
                preenchidas++;
                acertos++;

                var proxSlot = ui.q('[data-slot-card="' + cIdx + '"][data-slot-idx="' + proximoPorCard[cIdx] + '"]', cardEl);
                if (proxSlot) proxSlot.classList.add('is-alvo');

                if (proximoPorCard[cIdx] >= item.lacunas.length) {
                    ui.qq('.ex-chip-palavra', cardEl).forEach(function (b) { b.disabled = true; });
                    var fb = ui.q('.ex-lacuna-fb', cardEl);
                    if (fb) {
                        fb.hidden = false;
                        fb.innerHTML = '<p class="ex-ok" style="margin-top:10px">✓ Versículo completo! <b>' +
                            esc(item.ref) + '</b> — “' + esc(item.textoOriginal) + '”</p>';
                    }
                }
            } else {
                chip.classList.add('is-errada');
                setTimeout(function () { chip.classList.remove('is-errada'); }, 500);
            }

            var pl = ui.$('ex-lacunas-placar');
            if (pl) {
                pl.textContent = acertos + ' / ' + totalLacunas + ' palavras' +
                    (preenchidas >= totalLacunas ? ' · Concluído! 🎉' : '');
            }
        });
    }

    /* =========================================================
       MODO 3: ⏳ ORDEM CRONOLÓGICA DAS CENAS DO CAPÍTULO
       ========================================================= */

    function pintarModoOrdem(palco, alvo, estudoComp, versos) {
        var cenas = gerarDadosCenas(alvo, estudoComp, versos);
        var embaralhadas = embaralhar(cenas);
        var proximo = 0;
        var acertos = 0;
        var erros = 0;

        palco.innerHTML =
            '<div class="ex-painel-topo">' +
            '<span>Toque nas cenas na <b>ordem cronológica</b> em que acontecem em ' + esc(alvo.ref) + ':</span>' +
            '<span class="ex-painel-placar" id="ex-ordem-placar">Passo 1 de ' + cenas.length + '</span>' +
            '</div>' +
            '<div class="ex-ordem-fila" id="ex-ordem-fila"></div>' +
            '<div class="ex-ordem-cartoes">' +
            embaralhadas.map(function (c) {
                return '<button type="button" class="ex-ordem-btn" data-ordem="' + c.ordem + '">' +
                    (c.titulo ? '<b>' + esc(c.titulo) + '</b>' : '') +
                    '<span>' + esc(c.resumo) + '</span>' +
                    '</button>';
            }).join('') +
            '</div>' +
            '<div style="margin-top:12px">' +
            '<button type="button" class="btn btn--fraco btn--largo" id="ex-ordem-reiniciar">🔄 Embaralhar cenas novamente</button>' +
            '</div>';

        palco.addEventListener('click', function (ev) {
            if (ev.target.id === 'ex-ordem-reiniciar') {
                pintarModoOrdem(palco, alvo, estudoComp, versos);
                return;
            }
            var btn = ev.target.closest ? ev.target.closest('.ex-ordem-btn') : null;
            if (!btn || btn.disabled) return;

            var ordClicada = +btn.getAttribute('data-ordem');
            var filaEl = ui.$('ex-ordem-fila');
            var placarEl = ui.$('ex-ordem-placar');

            if (ordClicada === proximo) {
                acertos++;
                btn.disabled = true;
                btn.classList.add('is-certa');
                var cenaCerta = cenas[proximo];
                if (filaEl) {
                    filaEl.insertAdjacentHTML('beforeend',
                        '<div class="ex-ordem-passo">' +
                        '<span class="ex-ordem-num">' + (proximo + 1) + 'º</span>' +
                        '<div><b>' + esc(cenaCerta.onde) + (cenaCerta.titulo ? ' · ' + esc(cenaCerta.titulo) : '') + '</b>' +
                        '<p class="dica" style="margin:2px 0 0">' + esc(cenaCerta.resumo) + '</p></div>' +
                        '</div>');
                }
                proximo++;
                if (placarEl) {
                    placarEl.textContent = proximo >= cenas.length
                        ? ('✓ Sequência completa! (' + acertos + ' acertos, ' + erros + ' erros)')
                        : ('Passo ' + (proximo + 1) + ' de ' + cenas.length);
                }
            } else {
                erros++;
                btn.classList.add('is-errada');
                setTimeout(function () { btn.classList.remove('is-errada'); }, 550);
                if (placarEl) {
                    placarEl.textContent = 'Passo ' + (proximo + 1) + ' de ' + cenas.length + ' · ' + erros + ' erro(s)';
                }
            }
        });
    }

    /* =========================================================
       MODO 4: 🔗 LIGAR PARES DO CAPÍTULO (Personagens, Original & Lugares)
       ========================================================= */

    function pintarModoPares(palco, alvo, estudoComp, versos, perguntasQuiz) {
        var todosPares = gerarDadosPares(alvo, estudoComp, versos, perguntasQuiz);
        var esquerda = embaralhar(todosPares);
        var direita = embaralhar(todosPares);
        var selEsq = null;
        var selDir = null;
        var fechados = 0;

        palco.innerHTML =
            '<div class="ex-painel-topo">' +
            '<span>Toque em um item à esquerda e depois na descrição correspondente à direita:</span>' +
            '<span class="ex-painel-placar" id="ex-pares-placar">0 / ' + todosPares.length + ' pares</span>' +
            '</div>' +
            '<div class="ex-pares-grade">' +
            '<div class="ex-pares-col">' +
            esquerda.map(function (p) {
                return '<button type="button" class="ex-par-btn" data-lado="esq" data-par-id="' + p.id + '">' +
                    '<span class="ex-par-selo">' + esc(p.tipo) + '</span><br>' +
                    '<b>' + esc(p.a) + '</b></button>';
            }).join('') +
            '</div>' +
            '<div class="ex-pares-col">' +
            direita.map(function (p) {
                return '<button type="button" class="ex-par-btn" data-lado="dir" data-par-id="' + p.id + '">' +
                    esc(p.b) + '</button>';
            }).join('') +
            '</div>' +
            '</div>' +
            '<div id="ex-pares-historico" class="ex-gabarito-lista"></div>' +
            '<div style="margin-top:12px">' +
            '<button type="button" class="btn btn--fraco btn--largo" id="ex-pares-novo">🔄 Embaralhar mesa de pares</button>' +
            '</div>';

        palco.addEventListener('click', function (ev) {
            if (ev.target.id === 'ex-pares-novo') {
                pintarModoPares(palco, alvo, estudoComp, versos, perguntasQuiz);
                return;
            }
            var btn = ev.target.closest ? ev.target.closest('.ex-par-btn') : null;
            if (!btn || btn.disabled || btn.classList.contains('is-fechado')) return;

            var lado = btn.getAttribute('data-lado');
            if (lado === 'esq') {
                if (selEsq) selEsq.classList.remove('is-selecionado');
                selEsq = btn;
                btn.classList.add('is-selecionado');
            } else {
                if (selDir) selDir.classList.remove('is-selecionado');
                selDir = btn;
                btn.classList.add('is-selecionado');
            }

            if (selEsq && selDir) {
                var idE = +selEsq.getAttribute('data-par-id');
                var idD = +selDir.getAttribute('data-par-id');
                var bE = selEsq, bD = selDir;
                selEsq = null;
                selDir = null;

                if (idE === idD) {
                    bE.classList.remove('is-selecionado');
                    bD.classList.remove('is-selecionado');
                    bE.classList.add('is-fechado');
                    bD.classList.add('is-fechado');
                    bE.disabled = true;
                    bD.disabled = true;
                    fechados++;

                    var parObj = todosPares.filter(function (x) { return x.id === idE; })[0];
                    var hist = ui.$('ex-pares-historico');
                    if (hist && parObj) {
                        hist.insertAdjacentHTML('afterbegin',
                            '<div class="ex-gabarito-item">✓ <b>' + esc(parObj.a) + '</b> (' +
                            esc(parObj.tipo) + '): ' + esc(parObj.b) + '</div>');
                    }
                    var pl = ui.$('ex-pares-placar');
                    if (pl) {
                        pl.textContent = fechados + ' / ' + todosPares.length + ' pares' +
                            (fechados >= todosPares.length ? ' · Mesa concluída! 🎉' : '');
                    }
                } else {
                    bE.classList.remove('is-selecionado');
                    bD.classList.remove('is-selecionado');
                    bE.classList.add('is-erro');
                    bD.classList.add('is-erro');
                    setTimeout(function () {
                        bE.classList.remove('is-erro');
                        bD.classList.remove('is-erro');
                    }, 500);
                }
            }
        });
    }

    /* =========================================================
       MODO 5: 🕵️ DETETIVE DO TEXTO ("Em qual versículo ou bloco está isto?")
       ========================================================= */

    function pintarModoDetetive(palco, alvo, estudoComp, versos, perguntasQuiz) {
        var casos = gerarDadosDetetive(alvo, estudoComp, versos, perguntasQuiz);
        var respondidos = {};
        var acertos = 0;

        palco.innerHTML =
            '<div class="ex-painel-topo">' +
            '<span>Descubra em qual <b>versículo ou bloco</b> de ' + esc(alvo.ref) + ' está cada trecho:</span>' +
            '<span class="ex-painel-placar" id="ex-det-placar">0 / ' + casos.length + ' casos</span>' +
            '</div>' +
            casos.map(function (c, i) {
                return '<section class="cartao" data-det-card="' + i + '" style="margin-bottom:12px">' +
                    '<span class="ex-lacuna-ref">🕵️ Caso #' + (i + 1) + ' · ' + esc(c.tipo) + '</span>' +
                    '<div class="ex-detetive-citacao">' + esc(c.citacao) + '</div>' +
                    '<button type="button" class="btn btn--mini btn--fraco" data-det-pista="' + i + '" style="margin-bottom:8px">' +
                    '💡 Pedir pista do contexto</button>' +
                    '<div class="ex-detetive-pista" id="ex-det-pista-box-' + i + '" hidden>' +
                    '<b>Pista:</b> ' + esc(c.pista) + '</div>' +
                    '<div class="ex-opcoes-jogo">' +
                    c.opcoes.map(function (op) {
                        return '<button type="button" class="ex-opcao-btn" data-det-q="' + i + '" data-det-op="' + esc(op) + '">' +
                            esc(op) + '</button>';
                    }).join('') +
                    '</div>' +
                    '<div class="ex-det-fb" hidden style="margin-top:10px"></div>' +
                    '</section>';
            }).join('') +
            '<button type="button" class="btn btn--fraco btn--largo" id="ex-det-novo">🔄 Sortear novos casos</button>';

        palco.addEventListener('click', function (ev) {
            if (ev.target.id === 'ex-det-novo') {
                pintarModoDetetive(palco, alvo, estudoComp, versos, perguntasQuiz);
                return;
            }
            var btnPista = ev.target.closest ? ev.target.closest('[data-det-pista]') : null;
            if (btnPista) {
                var pIdx = btnPista.getAttribute('data-det-pista');
                var boxP = ui.$('ex-det-pista-box-' + pIdx);
                if (boxP) {
                    boxP.hidden = !boxP.hidden;
                    btnPista.textContent = boxP.hidden ? '💡 Pedir pista do contexto' : '▴ Ocultar pista';
                }
                return;
            }

            var btnOp = ev.target.closest ? ev.target.closest('.ex-opcao-btn') : null;
            if (!btnOp || btnOp.disabled) return;

            var qIdx = +btnOp.getAttribute('data-det-q');
            if (qIdx in respondidos) return;
            respondidos[qIdx] = true;

            var caso = casos[qIdx];
            var escolha = btnOp.getAttribute('data-det-op');
            var acertou = escolha === caso.certa;
            if (acertou) acertos++;

            var cardEl = ui.q('[data-det-card="' + qIdx + '"]', palco);
            ui.qq('.ex-opcao-btn', cardEl).forEach(function (b) {
                b.disabled = true;
                if (b.getAttribute('data-det-op') === caso.certa) b.classList.add('is-certa');
                else if (b === btnOp) b.classList.add('is-errada');
            });

            var fb = ui.q('.ex-det-fb', cardEl);
            if (fb) {
                fb.hidden = false;
                fb.innerHTML = '<p class="' + (acertou ? 'ex-ok' : 'ex-nao') + '">' +
                    (acertou ? '✓ Investigação exata!' : '✗ Localização correta: <b>' + esc(caso.certa) + '</b>') +
                    '</p><p class="dica">' + esc(caso.explicacao) + '</p>';
            }

            var pl = ui.$('ex-det-placar');
            if (pl) {
                var totalResp = Object.keys(respondidos).length;
                pl.textContent = acertos + ' / ' + casos.length + ' casos' +
                    (totalResp >= casos.length ? ' · Investigação concluída!' : '');
            }
        });
    }

    /* =========================================================
       MODO 6: ⚡ DESAFIO RELÂMPAGO DE 60 SEGUNDOS (COM COMBO)
       ========================================================= */

    function pintarModoRelampago(palco, alvo, estudoComp, versos, perguntasQuiz) {
        limparTimerRelampago();
        var banco = gerarBancoRelampago(alvo, estudoComp, versos, perguntasQuiz);

        if (!banco.length) {
            palco.innerHTML = '<section class="cartao"><p class="dica">Não há itens suficientes para o Desafio Relâmpago neste capítulo.</p></section>';
            return;
        }

        var restantes = 60;
        var pontos = 0;
        var combo = 0;
        var melhorCombo = 0;
        var acertos = 0;
        var totalResp = 0;
        var idxAtual = 0;
        var historico = [];
        var encerrado = false;

        palco.innerHTML =
            '<div class="ex-rel-barra">' +
            '<span>⏱️ <b id="ex-rel-tempo">60s</b></span>' +
            '<span>Pontos: <b id="ex-rel-pts">0</b></span>' +
            '<span class="ex-rel-combo" id="ex-rel-combo">🔥 Combo x1</span>' +
            '</div>' +
            '<div id="ex-rel-mesa"></div>';

        var mesa = ui.$('ex-rel-mesa');

        timerRelampago = setInterval(function () {
            if (encerrado) return;
            restantes--;
            var elT = ui.$('ex-rel-tempo');
            if (elT) elT.textContent = Math.max(0, restantes) + 's';
            if (restantes <= 0) {
                finalizarRelampago('⏱️ Tempo esgotado!');
            }
        }, 1000);

        pintarPerguntaRelampago();

        function pintarPerguntaRelampago() {
            if (encerrado || !mesa) return;
            if (idxAtual >= banco.length) {
                idxAtual = 0;
                banco = embaralhar(banco);
            }
            var q = banco[idxAtual];
            mesa.innerHTML =
                '<section class="cartao">' +
                '<span class="ex-lacuna-ref">' + esc(q.categoria) + ' · ' + esc(q.fonte) + '</span>' +
                '<p class="ex-pergunta-txt" style="margin-top:6px"><b>' + esc(q.pergunta) + '</b></p>' +
                '<div class="ex-opcoes-jogo">' +
                q.opcoes.map(function (op) {
                    return '<button type="button" class="ex-opcao-btn" data-rel-op="' + esc(op) + '">' +
                        esc(op) + '</button>';
                }).join('') +
                '</div>' +
                '</section>';
        }

        function finalizarRelampago(motivo) {
            if (encerrado) return;
            encerrado = true;
            limparTimerRelampago();
            if (!mesa) return;

            mesa.innerHTML =
                '<section class="cartao">' +
                '<h3 style="margin:0 0 6px;font-family:var(--serif)">' + esc(motivo) + '</h3>' +
                '<p class="dica">Você acertou <b>' + acertos + '</b> de <b>' + totalResp + '</b> respostas rápidas em ' + esc(alvo.ref) +
                ' · Pontuação: <b>' + pontos + ' pts</b> · Melhor sequência: <b>🔥 x' + Math.max(1, melhorCombo) + '</b>.</p>' +
                '<button type="button" class="btn btn--forte btn--largo" id="ex-rel-denovo">⚡ Jogar Relâmpago 60s novamente</button>' +
                (historico.length
                    ? '<h4 style="margin:14px 0 6px">Gabarito comentado da rodada:</h4>' +
                      '<div class="ex-gabarito-lista">' +
                      historico.map(function (h) {
                          return '<div class="ex-gabarito-item">' +
                              (h.acertou ? '✓ ' : '✗ ') + '<b>' + esc(h.fonte) + ':</b> ' +
                              esc(h.explicacao) + '</div>';
                      }).join('') +
                      '</div>'
                    : '') +
                '</section>';
        }

        palco.addEventListener('click', function (ev) {
            if (ev.target.id === 'ex-rel-denovo') {
                pintarModoRelampago(palco, alvo, estudoComp, versos, perguntasQuiz);
                return;
            }
            var btn = ev.target.closest ? ev.target.closest('[data-rel-op]') : null;
            if (!btn || btn.disabled || encerrado) return;

            var q = banco[idxAtual];
            var escolha = btn.getAttribute('data-rel-op');
            var acertou = escolha === q.certa;
            totalResp++;

            if (acertou) {
                acertos++;
                combo++;
                if (combo > melhorCombo) melhorCombo = combo;
                pontos += 10 * combo;
            } else {
                combo = 0;
            }

            historico.unshift({
                acertou: acertou,
                fonte: q.fonte,
                explicacao: q.explicacao
            });

            var elPts = ui.$('ex-rel-pts');
            var elCombo = ui.$('ex-rel-combo');
            if (elPts) elPts.textContent = String(pontos);
            if (elCombo) elCombo.textContent = '🔥 Combo x' + Math.max(1, combo);

            ui.qq('[data-rel-op]', mesa).forEach(function (b) {
                b.disabled = true;
                if (b.getAttribute('data-rel-op') === q.certa) b.classList.add('is-certa');
                else if (b === btn) b.classList.add('is-errada');
            });

            idxAtual++;
            setTimeout(function () {
                if (!encerrado) pintarPerguntaRelampago();
            }, 380);
        });
    }

    return { render: render, depois: depois };
})();
