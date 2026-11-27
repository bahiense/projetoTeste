/* =========================================================
   Formação do Pensador — a tela.

   Toda a conversa com o Claude é feita pelo lado nativo (objeto
   `Politica`, Ponte.kt), que guarda a chave cifrada. Aqui ficam só
   as telas, o progresso e o histórico das conversas (localStorage).

   Tudo o que vem do Claude passa por P.md.render ou esc antes de
   virar HTML: texto de fora nunca entra na página como marcação.
   ========================================================= */
(function () {
    'use strict';

    var N = window.Politica;
    var ATU = window.PoliticaAtualizar;
    var COP = window.PoliticaCopias;
    // o Formação do Pensador dentro do Claude: onde as aulas são preparadas pelo plano, sem chave
    var NO_CLAUDE = 'https://claude.ai/artifact/V1oFFYvRYkonzx5QVfEceo';
    var md = P.md.render, esc = P.md.esc;

    var $tela = document.getElementById('tela');
    var $titulo = document.getElementById('titulo');
    var $voltar = document.getElementById('voltar');
    var $abas = document.getElementById('abas');

    /* ---------- guardar no aparelho ---------- */

    function ler(chave, padrao) {
        try { var v = localStorage.getItem(chave); return v ? JSON.parse(v) : padrao; }
        catch (e) { return padrao; }
    }
    function gravar(chave, valor) {
        try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { aviso('Memória do app cheia.'); }
    }
    function progresso(id) {
        var p = ler('prog:' + id, null) || {};
        p.lidos = p.lidos || {};
        p.flash = p.flash || {};
        p.quiz = p.quiz || {};
        p.vf = p.vf || {};
        p.corrigidas = p.corrigidas || {};
        return p;
    }
    function salvarProgresso(id, p) { gravar('prog:' + id, p); }

    /* ---------- aviso rápido ---------- */

    var $aviso = document.getElementById('aviso'), tempoAviso;
    function aviso(texto, ms) {
        $aviso.textContent = texto;
        $aviso.hidden = false;
        clearTimeout(tempoAviso);
        tempoAviso = setTimeout(function () { $aviso.hidden = true; }, ms || 4000);
    }
    $aviso.onclick = function () { $aviso.hidden = true; };

    /* ---------- navegação ----------
       Cada tela é {titulo, abas?, desenhar(el)}. A pilha faz o "voltar"
       do Android funcionar dentro do app. */

    var pilha = [];
    function ir(tela) { pilha.push(tela); desenhar(true); }
    function trocar(tela) { pilha[pilha.length - 1] = tela; desenhar(true); }
    function voltar() { if (pilha.length > 1) { pilha.pop(); desenhar(false); } }
    window.__voltar = function () {
        if (pilha.length > 1) { voltar(); return true; }
        return false;
    };
    $voltar.onclick = voltar;
    document.getElementById('ajustes').onclick = function () { ir(telaAjustes(false)); };

    function desenhar(topo) {
        var t = pilha[pilha.length - 1];
        $titulo.textContent = t.titulo || 'Formação do Pensador';
        $voltar.hidden = pilha.length < 2;
        if (t.abas) {
            $abas.hidden = false;
            $abas.innerHTML = t.abas.map(function (a) {
                return '<button data-aba="' + a.id + '"' + (a.id === t.aba ? ' class="ativa"' : '') + '>' + esc(a.nome) + '</button>';
            }).join('');
            $abas.querySelectorAll('button').forEach(function (b) {
                b.onclick = function () { t.aba = b.dataset.aba; desenhar(true); };
            });
            var ativa = $abas.querySelector('.ativa');
            if (ativa) ativa.scrollIntoView({ inline: 'center', block: 'nearest' });
        } else {
            $abas.hidden = true;
        }
        $tela.innerHTML = '';
        t.desenhar($tela);
        if (topo) window.scrollTo(0, 0);
        else if (t.rolagem) window.scrollTo(0, t.rolagem);
    }
    window.addEventListener('scroll', function () {
        var t = pilha[pilha.length - 1];
        if (t) t.rolagem = window.scrollY;
    }, { passive: true });

    function el(html) {
        var d = document.createElement('div');
        d.innerHTML = html;
        return d;
    }
    /* O WebView não mostra confirm(): a confirmação é um segundo toque no mesmo botão. */
    function confirmar(botao, texto, acao) {
        if (botao.dataset.armado) { acao(); return; }
        botao.dataset.armado = '1';
        var original = botao.textContent;
        botao.textContent = texto;
        setTimeout(function () { if (botao.isConnected) { delete botao.dataset.armado; botao.textContent = original; } }, 4000);
    }
    function ao(raiz, seletor, fn) {
        raiz.querySelectorAll(seletor).forEach(function (n) { n.onclick = function (ev) { fn(n, ev); }; });
    }

    /* =========================================================
       Início: as lições
       ========================================================= */

    var andamentos = {};

    function telaInicio() {
        return {
            titulo: 'Minhas lições',
            desenhar: function (raiz) {
                if (!N) {
                    raiz.innerHTML = '<p class="vazio">Este app funciona dentro do APK.</p>';
                    return;
                }
                var lista = JSON.parse(N.listar());
                var temPasta = COP && COP.pastaTem();
                var html = '<a class="botao largo" href="' + NO_CLAUDE + '">Preparar nova lição no Claude ›</a><p></p>' +
                    '<div class="cartao"><span class="rotulo">Trazer a aula do Claude</span>' +
                    '<p class="peq">No Formação do Pensador (dentro do Claude), toque em <b>Levar para o app do celular</b> e salve o arquivo. ' +
                    'Depois, aqui, toque no botão e escolha o arquivo <b>formacao-aula-….json</b> (fica em Downloads).</p>' +
                    '<button class="botao principal largo" id="importarAula">Importar aula (arquivo)</button>' +
                    '<p class="fraco peq" style="margin:10px 0 0">Também dá para tocar no arquivo baixado e escolher <b>Abrir com → Formação do Pensador</b>.</p>' +
                    (temPasta ? '<p></p><button class="botao largo" id="buscar">Buscar aulas novas na pasta apontada</button>' : '') +
                    '</div><p></p>' +
                    (N.temChave() ? '<button class="botao largo" id="nova">＋ Nova lição pela API (PDF)</button><p></p>' : '');
                if (!lista.length) {
                    html += '<div class="vazio"><div class="grande">🏛️</div>' +
                        '<p>Nenhuma aula ainda.</p>' +
                        '<p class="peq">Prepare a lição da semana no Claude, toque em <b>Levar para o app</b> e ela aparece aqui, ' +
                        'para estudar quando quiser, mesmo sem internet.</p></div>';
                }
                lista.forEach(function (m) {
                    html += cartaoLicao(m);
                });
                raiz.innerHTML = html;
                var nova = raiz.querySelector('#nova');
                if (nova) nova.onclick = function () { N.escolherPdf(); };
                var imp = raiz.querySelector('#importarAula');
                if (imp) imp.onclick = function () { if (COP) COP.importarArquivo(); };
                var buscar = raiz.querySelector('#buscar');
                if (buscar) buscar.onclick = function () { buscar.disabled = true; buscar.textContent = 'Procurando…'; COP.importarDaPasta(); };
                ao(raiz, '[data-abrir]', function (n) { abrirAula(n.dataset.abrir); });
                ao(raiz, '[data-gerar]', function (n, ev) { ev.stopPropagation(); confirmarGerar(n.dataset.gerar); });
                ao(raiz, '[data-menu]', function (n, ev) { ev.stopPropagation(); ir(telaMenuLicao(n.dataset.menu)); });
            }
        };
    }

    function cartaoLicao(m) {
        var id = esc(m.id), estado = m.estado;
        var data = new Date(m.criada).toLocaleDateString('pt-BR');
        var corpo = '';
        if (estado === 'pronta') {
            var p = progresso(m.id), total = ler('total:' + m.id, 0);
            var sem = ler('semana:' + m.id, null) || semanaPorConta(total);
            var dias = sem.filter(function (g) { return g.length; });
            var feitos = dias.filter(function (g) { return g.every(function (i) { return p.lidos[i]; }); }).length;
            var pct = dias.length ? Math.round(100 * feitos / dias.length) : 0;
            corpo = '<div class="barra"><i style="width:' + pct + '%"></i></div>' +
                '<div class="estado fraco">' + (ler('simples:' + m.id, false) ? (p.lidos[0] ? 'Aula para leigos · lida ✓' : 'Aula para leigos · pronta para ler')
                    : total ? feitos + ' de ' + dias.length + ' dias estudados' : 'Aula pronta') + '</div>';
        } else if (estado === 'gerando') {
            corpo = '<div class="estado"><span class="girando"></span>' +
                esc(andamentos[m.id] || 'O professor está preparando a aula…') + '</div>' +
                '<div class="estado fraco peq">Leva de 5 a 15 minutos. Pode sair do app: ele avisa quando terminar.</div>';
        } else if (estado === 'erro' || estado === 'interrompida') {
            corpo = '<div class="estado" style="color:var(--vermelho)">' +
                esc(estado === 'erro' ? (m.erro || 'Deu errado.') : 'A preparação foi interrompida (o app foi fechado).') +
                '</div><div class="botoes"><button class="botao principal" data-gerar="' + id + '">Tentar de novo</button></div>';
        } else {
            corpo = '<div class="botoes"><button class="botao principal" data-gerar="' + id + '">Preparar a aula</button></div>';
        }
        return '<div class="cartao licao' + (estado === 'pronta' ? ' toque" data-abrir="' + id : '') + '">' +
            '<div style="display:flex;gap:8px;align-items:flex-start"><div style="flex:1">' +
            '<h3 style="margin:0">' + esc(m.titulo) + '</h3>' +
            '<div class="fraco peq">' + esc(data) + ' · ' + esc(m.nome) + '</div></div>' +
            '<button class="icone" data-menu="' + id + '" aria-label="Opções">⋮</button></div>' +
            corpo + '</div>';
    }

    function confirmarGerar(id) {
        if (!N.temChave()) { ir(telaAjustes(true)); return; }
        N.gerar(id);
        andamentos[id] = 'Começando…';
        desenhar(false);
    }

    function telaMenuLicao(id) {
        var m = JSON.parse(N.listar()).filter(function (x) { return x.id === id; })[0];
        return {
            titulo: m ? m.titulo : 'Lição',
            desenhar: function (raiz) {
                if (!m) { voltar(); return; }
                raiz.innerHTML =
                    '<div class="cartao"><span class="rotulo">Nome da lição</span>' +
                    '<input type="text" id="nome" value="' + esc(m.titulo) + '">' +
                    '<div class="botoes"><button class="botao" id="renomear">Salvar nome</button></div></div>' +
                    '<button class="botao largo" id="pdf">Abrir o PDF original</button><p></p>' +
                    (m.estado === 'pronta' ? '<button class="botao largo" id="refazer">Preparar a aula de novo</button>' +
                        '<p class="fraco peq">Refaz a aula do zero (com nova pesquisa). Gasta créditos de novo.</p>' : '') +
                    '<hr><button class="botao perigo largo" id="apagar">Apagar esta lição</button>';
                raiz.querySelector('#renomear').onclick = function () {
                    N.renomear(id, raiz.querySelector('#nome').value);
                    aviso('Nome salvo.'); voltar();
                };
                raiz.querySelector('#pdf').onclick = function () { N.abrirPdf(id); };
                var r = raiz.querySelector('#refazer');
                if (r) r.onclick = function () {
                    if (!N.temChave()) { aviso('Para refazer pelo app é preciso a chave da API (Ajustes). Ou prepare de novo no Claude.', 7000); return; }
                    confirmar(r, 'Toque de novo para refazer do zero', function () {
                        N.refazer(id); voltar(); andamentos[id] = 'Começando…'; desenhar(false);
                    });
                };
                var $ap = raiz.querySelector('#apagar');
                $ap.onclick = function () { confirmar($ap, 'Toque de novo para apagar de vez', function () {
                    N.apagar(id);
                    Object.keys(localStorage).forEach(function (k) {
                        if (k.indexOf(':' + id) > 0 || k.indexOf('conv:' + id + ':') === 0) localStorage.removeItem(k);
                    });
                    voltar();
                }); };
            }
        };
    }

    window.__pdf = function (r) {
        if (r.cancelado) return;
        if (r.erro) { aviso(r.erro, 7000); return; }
        aviso('PDF adicionado. Toque em "Preparar a aula".');
        if (pilha.length === 1) desenhar(false);
    };

    window.__evento = function (e) {
        if (e.tipo === 'andamento') {
            andamentos[e.id] = e.texto;
            var noInicio = pilha.length === 1;
            if (noInicio) desenhar(false);
            return;
        }
        delete andamentos[e.id];
        if (e.tipo === 'pronta') aviso('A aula ficou pronta! 🎓', 6000);
        if (e.tipo === 'erro') {
            aviso(e.texto, 9000);
            if (e.chaveRuim) { ir(telaAjustes(true)); return; }
        }
        if (pilha.length === 1) desenhar(false);
    };

    window.__aviso = function (r) { aviso(r.texto); };

    /* =========================================================
       A aula
       ========================================================= */

    function abrirAula(id) {
        var bruto = N.ler(id);
        if (!bruto) { aviso('A aula não foi encontrada.'); return; }
        var dados;
        try { dados = JSON.parse(bruto); } catch (e) { aviso('A aula está corrompida. Prepare de novo.'); return; }
        gravar('total:' + id, (dados.modulos || []).length);
        var aula = { id: id, d: dados, semana: semanaDe(lista(dados.modulos)) };
        gravar('semana:' + id, aula.semana);
        gravar('simples:' + id, dados.tipo === 'simples');
        var abas = [
            { id: 'aula', nome: 'Aula' },
            { id: 'autores', nome: 'Autores' },
            { id: 'conceitos', nome: 'Conceitos' },
            { id: 'debates', nome: 'Debates' },
            { id: 'exercicios', nome: 'Exercícios' },
            { id: 'professor', nome: 'Professor' },
            { id: 'revisao', nome: 'Revisão' }
        ];
        if ((dados.linha_do_tempo || []).length) abas.splice(3, 0, { id: 'tempo', nome: 'Cronologia' });
        // a aula para leigos: uma aula só, palavras, quem é quem e teste
        if (dados.tipo === 'simples') abas = [
            { id: 'aula', nome: 'Aula' }, { id: 'conceitos', nome: 'Palavras difíceis' }, { id: 'autores', nome: 'Quem é quem' },
            { id: 'teste', nome: 'Teste rápido' }, { id: 'professor', nome: 'Professor' }
        ];
        ir({
            titulo: dados.titulo,
            abas: abas,
            aba: ler('aba:' + id, 'aula'),
            desenhar: function (raiz) {
                gravar('aba:' + id, this.aba);
                ({
                    teste: abaTeste, aula: abaAula, autores: abaAutores, conceitos: abaConceitos, tempo: abaTempo,
                    debates: abaDebates, exercicios: abaExercicios, professor: abaProfessor, revisao: abaRevisao
                }[this.aba] || abaAula)(raiz, aula);
            }
        });
    }

    function lista(a) { return Array.isArray(a) ? a : []; }

    /* ---------- aba Aula ---------- */

    /* A semana de estudo: a aula é dividida em cinco dias, de segunda a sexta,
       e cada dia tem os seus módulos. Aulas novas dizem o dia de cada módulo
       ("dia": 1 a 5); nas antigas, os módulos são repartidos em ordem. */
    var DIAS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
    function hojeDia() { var d = new Date().getDay(); return d >= 1 && d <= 5 ? d - 1 : -1; }
    function semanaPorConta(n) {
        var g = [[], [], [], [], []];
        for (var i = 0; i < n; i++) g[n <= 5 ? i : Math.floor(i * 5 / n)].push(i);
        return g;
    }
    function semanaDe(mods) {
        var comDia = mods.length && mods.every(function (m) { return m.dia >= 1 && m.dia <= 5; });
        if (!comDia) return semanaPorConta(mods.length);
        var g = [[], [], [], [], []];
        mods.forEach(function (m, i) { g[m.dia - 1].push(i); });
        return g;
    }
    function diaDoModulo(aula, i) {
        for (var k = 0; k < 5; k++) if (aula.semana[k].indexOf(i) >= 0) return k;
        return 0;
    }
    function diaFeito(aula, k, p) { var g = aula.semana[k]; return g.length > 0 && g.every(function (i) { return p.lidos[i]; }); }

    /* ---------- aula para leigos ---------- */

    function abaTeste(raiz, aula) {
        var n = lista(aula.d.quiz).length, q = progresso(aula.id).quiz;
        raiz.innerHTML = '<h2>Teste rápido</h2><p class="fraco">' + n + ' perguntas para conferir se você entendeu a aula.' +
            (q.melhor !== undefined ? ' Seu melhor resultado: ' + q.melhor + ' de ' + n + '.' : '') + '</p>' +
            '<button class="botao principal largo" id="comecar">Começar o teste</button>';
        raiz.querySelector('#comecar').onclick = function () { ir(telaQuiz(aula, 'quiz')); };
    }

    function abaAulaSimples(raiz, aula) {
        var d = aula.d, m = lista(d.modulos)[0] || {}, p = progresso(aula.id);
        var html = '<span class="rotulo">Aula para leigos · bem explicada</span><h2>' + esc(d.titulo) + '</h2>' +
            (m.em_uma_frase ? '<p class="frase">' + esc(m.em_uma_frase) + '</p>' : '') +
            '<div class="cartao texto"><span class="rotulo ouro">Do que se trata</span>' + md(d.visao_geral) + '</div>' +
            '<div class="texto">' + md(m.explicacao) + '</div>';
        if (lista(d.argumentos_prontos).length) html += '<div class="cartao texto"><span class="rotulo">Para guardar na cabeça</span><ul>' +
            lista(d.argumentos_prontos).map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul></div>';
        if (m.checagem && m.checagem.pergunta) html += '<div class="cartao texto"><span class="rotulo">Para pensar</span><p><b>' + esc(m.checagem.pergunta) + '</b></p>' +
            '<button class="botao" id="ver">Ver um jeito de responder</button><div id="resp" hidden style="margin-top:10px">' + md(m.checagem.resposta) + '</div></div>';
        html += '<div class="botoes"><button class="botao" id="perguntar">💬 Perguntar ao professor</button>' +
            '<button class="botao principal" id="lido">' + (p.lidos[0] ? '✓ Aula lida' : 'Terminei a aula') + '</button></div>';
        raiz.innerHTML = html;
        var ver = raiz.querySelector('#ver');
        if (ver) ver.onclick = function () { raiz.querySelector('#resp').hidden = false; ver.hidden = true; };
        raiz.querySelector('#lido').onclick = function () {
            var q = progresso(aula.id);
            if (q.lidos[0]) delete q.lidos[0]; else { q.lidos[0] = true; aviso('Muito bem! Agora faça o teste rápido.', 4000); }
            salvarProgresso(aula.id, q); desenhar(false);
        };
        raiz.querySelector('#perguntar').onclick = function () {
            ir(telaConversa(aula, { chave: 'tutor', modo: 'tutor', titulo: 'Professor', recomecar: true,
                dica: 'Pergunte qualquer coisa: não existe pergunta boba.',
                contexto: 'O aluno escolheu a AULA PARA LEIGOS: responda como um professor especialista falando com um adulto que não conhece o assunto. Explique com clareza e com todas as nuances, sempre com o contexto por trás, explique toda palavra difícil e use exemplos do cotidiano. Neutralidade total: não tome posição nem dê opinião; mostre os fatos como são e, onde houver disputa, apresente cada lado com justiça.' }));
        };
    }

    function abaAula(raiz, aula) {
        if (aula.d.tipo === 'simples') return abaAulaSimples(raiz, aula);
        var d = aula.d, p = progresso(aula.id);
        var mods = lista(d.modulos), sem = aula.semana;
        var dias = [0, 1, 2, 3, 4].filter(function (k) { return sem[k].length; });
        var feitos = dias.filter(function (k) { return diaFeito(aula, k, p); }).length;
        var html = '<h2>' + esc(d.titulo) + '</h2>' +
            (d.subtitulo ? '<p class="fraco">' + esc(d.subtitulo) + '</p>' : '') +
            '<div class="barra"><i style="width:' + (dias.length ? 100 * feitos / dias.length : 0) + '%"></i></div>' +
            '<p class="fraco peq">' + feitos + ' de ' + dias.length + ' dias estudados</p>' +
            '<div class="cartao texto"><span class="rotulo">Visão geral</span>' + md(d.visao_geral) + '</div>';
        if (lista(d.roteiro).length) {
            html += '<div class="cartao texto"><span class="rotulo ouro">Roteiro</span><ol>' +
                lista(d.roteiro).map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ol></div>';
        }
        html += '<h3>A semana de estudo</h3>';
        var hoje = hojeDia();
        dias.forEach(function (k) {
            var g = sem[k], lidosDia = g.filter(function (i) { return p.lidos[i]; }).length, feito = lidosDia === g.length;
            html += '<div class="cartao toque modulo-item' + (feito ? ' lido' : '') + '" data-dia="' + k + '">' +
                '<div class="num dia">' + (feito ? '✓' : DIAS[k].slice(0, 3)) + '</div><div>' +
                '<span class="rotulo' + (k === hoje ? '' : ' ouro') + '">' + DIAS[k] + (k === hoje ? ' · hoje' : '') + '</span><br>' +
                '<b>' + g.length + (g.length === 1 ? ' módulo' : ' módulos') + '</b>' +
                '<span class="fraco peq"> · ' + lidosDia + ' estudado' + (lidosDia === 1 ? '' : 's') + '</span>' +
                '<ul class="peq lista-dia">' + g.map(function (i) { return '<li class="' + (p.lidos[i] ? 'feito' : '') + '">' + esc(mods[i].titulo) + '</li>'; }).join('') + '</ul>' +
                '</div></div>';
        });
        raiz.innerHTML = html;
        ao(raiz, '[data-dia]', function (n) { ir(telaDia(aula, +n.dataset.dia)); });
    }

    /* Um dia da semana: os módulos daquele dia, cada um abre a sua aula. */
    function telaDia(aula, k) {
        var mods = lista(aula.d.modulos);
        return {
            titulo: DIAS[k],
            desenhar: function (raiz) {
                var p = progresso(aula.id), g = aula.semana[k];
                var dias = [0, 1, 2, 3, 4].filter(function (x) { return aula.semana[x].length; });
                var pos = dias.indexOf(k), ant = dias[pos - 1], prox = dias[pos + 1];
                var lidosDia = g.filter(function (i) { return p.lidos[i]; }).length;
                var html = '<span class="rotulo ouro">Dia ' + (pos + 1) + ' de ' + dias.length + '</span>' +
                    '<h2>' + DIAS[k] + '</h2>' +
                    '<div class="barra"><i style="width:' + (g.length ? 100 * lidosDia / g.length : 0) + '%"></i></div>' +
                    '<p class="fraco peq">' + lidosDia + ' de ' + g.length + ' módulos estudados hoje</p>';
                g.forEach(function (i, j) {
                    var m = mods[i];
                    html += '<div class="cartao toque modulo-item' + (p.lidos[i] ? ' lido' : '') + '" data-mod="' + i + '">' +
                        '<div class="num">' + (p.lidos[i] ? '✓' : j + 1) + '</div><div>' +
                        '<b>' + esc(m.titulo) + '</b><div class="fraco peq">' + esc(m.em_uma_frase) + '</div>' +
                        (m.slides ? '<div class="marcas"><span class="marca">' + esc(m.slides) + '</span></div>' : '') +
                        '</div></div>';
                });
                html += '<div class="navega">' +
                    (ant !== undefined ? '<button class="botao" id="ant">‹ ' + DIAS[ant].split('-')[0] + '</button>' : '') +
                    (prox !== undefined ? '<button class="botao" id="prox">' + DIAS[prox].split('-')[0] + ' ›</button>' : '') + '</div>';
                raiz.innerHTML = html;
                ao(raiz, '[data-mod]', function (n) { ir(telaModulo(aula, +n.dataset.mod)); });
                var a = raiz.querySelector('#ant'), b = raiz.querySelector('#prox');
                if (a) a.onclick = function () { trocar(telaDia(aula, ant)); };
                if (b) b.onclick = function () { trocar(telaDia(aula, prox)); };
            }
        };
    }

    /* Palavras difíceis, quem é quem e teste rápido no fim de cada módulo (vêm do Claude). */
    function temExtras(m) { return !!(m && (lista(m.palavras).length || lista(m.quem_e_quem).length || lista(m.teste).length)); }

    function htmlExtras(m) {
        var h = '';
        if (lista(m.palavras).length) h += '<details class="cartao texto"><summary>Palavras difíceis (' + m.palavras.length + ')</summary><div class="pilha" style="margin-top:10px">' +
            m.palavras.map(function (w) {
                return '<div><b>' + esc(w.termo) + '</b><br>' + esc(w.explicacao) + (w.exemplo ? '<br><span class="fraco peq">Exemplo: ' + esc(w.exemplo) + '</span>' : '') + '</div>';
            }).join('') + '</div></details>';
        if (lista(m.quem_e_quem).length) h += '<details class="cartao texto"><summary>Quem é quem (' + m.quem_e_quem.length + ')</summary><div class="pilha" style="margin-top:10px">' +
            m.quem_e_quem.map(function (q) {
                return '<div><b>' + esc(q.nome) + '</b><br>' + esc(q.quem_foi) + (q.o_que_tem_a_ver ? '<br><span class="fraco peq">Neste módulo: ' + esc(q.o_que_tem_a_ver) + '</span>' : '') + '</div>';
            }).join('') + '</div></details>';
        if (lista(m.teste).length) h += '<details class="cartao texto"><summary>Teste rápido (' + m.teste.length + ' perguntas)</summary><div class="pilha" style="margin-top:10px">' +
            m.teste.map(function (q, qi) {
                return '<div data-q="' + qi + '"><p style="margin:0 0 6px"><b>' + (qi + 1) + '. ' + esc(q.pergunta) + '</b></p><div class="pilha" style="gap:6px">' +
                    lista(q.alternativas).map(function (o, k) { return '<button class="alternativa" data-op="' + k + '">' + 'ABCDE'[k] + ') ' + esc(o) + '</button>'; }).join('') +
                    '</div><div class="explica" hidden style="margin-top:6px"></div></div>';
            }).join('') + '<p class="fraco peq" id="placarModulo" style="margin:0"></p></div></details>';
        return h;
    }

    /* Liga os botões do teste rápido do módulo. */
    function ligarTeste(raiz, m) {
        var acertos = 0, feitas = 0;
        raiz.querySelectorAll('[data-q]').forEach(function (bloco) {
            var q = m.teste[+bloco.dataset.q], respondida = false;
            bloco.querySelectorAll('[data-op]').forEach(function (b) {
                b.onclick = function () {
                    if (respondida) return;
                    respondida = true; feitas++;
                    var k = +b.dataset.op;
                    bloco.querySelectorAll('[data-op]').forEach(function (x) { if (+x.dataset.op === q.correta) x.classList.add('certa'); });
                    if (k === q.correta) acertos++; else b.classList.add('errada');
                    var e = bloco.querySelector('.explica');
                    e.innerHTML = '<span class="rotulo' + (k === q.correta ? '">Certo' : ' erro">Errado') + '</span>' + md(q.explicacao);
                    e.hidden = false;
                    var pl = raiz.querySelector('#placarModulo');
                    if (pl) pl.textContent = acertos + ' de ' + feitas + ' certas' + (feitas === m.teste.length ? ' · teste terminado' : '');
                };
            });
        });
    }

    function telaModulo(aula, i) {
        var mods = lista(aula.d.modulos), k = diaDoModulo(aula, i), g = aula.semana[k], j = g.indexOf(i);
        return {
            titulo: DIAS[k] + ' · módulo ' + (j + 1) + ' de ' + g.length,
            desenhar: function (raiz) {
                var m = mods[i], p = progresso(aula.id);
                var html = '<span class="rotulo">' + DIAS[k] + ' · módulo ' + (j + 1) + ' de ' + g.length + (m.slides ? ' · ' + esc(m.slides) : '') + '</span>' +
                    '<h2>' + esc(m.titulo) + '</h2>' +
                    '<p class="frase">' + esc(m.em_uma_frase) + '</p>' +
                    '<div class="texto">' + md(m.explicacao) + '</div>' +
                    '<div class="cartao texto"><span class="rotulo ouro">Exemplo</span>' + md(m.exemplo) + '</div>' +
                    '<div class="cartao texto"><span class="rotulo">Por que importa</span>' + md(m.por_que_importa) + '</div>' +
                    (m.cuidado ? '<div class="cartao texto"><span class="rotulo vermelho">Cuidado</span>' + md(m.cuidado) + '</div>' : '');
                if (m.checagem && m.checagem.pergunta) {
                    html += '<div class="cartao texto"><span class="rotulo">Você entendeu?</span>' +
                        '<p><b>' + esc(m.checagem.pergunta) + '</b></p>' +
                        '<p class="fraco peq">Pense na sua resposta antes de ver a do professor.</p>' +
                        '<button class="botao" id="ver">Ver a resposta</button>' +
                        '<div class="resposta" id="resp" hidden>' + md(m.checagem.resposta) + '</div></div>';
                }
                if (temExtras(m)) html += htmlExtras(m);
                var ultimo = j === g.length - 1;
                html += '<div class="botoes">' +
                    '<button class="botao" id="perguntar">💬 Perguntar ao professor</button>' +
                    '<button class="botao principal" id="lido">' + (p.lidos[i] ? '✓ Estudado' : 'Marcar como estudado') + '</button></div>' +
                    '<div class="navega">' +
                    (j > 0 ? '<button class="botao" id="ant">‹ Módulo anterior</button>' : '') +
                    (!ultimo ? '<button class="botao" id="prox">Próximo módulo ›</button>' : '<button class="botao" id="fimDia">Voltar ao dia</button>') + '</div>';
                raiz.innerHTML = html;
                var ver = raiz.querySelector('#ver');
                if (ver) ver.onclick = function () { raiz.querySelector('#resp').hidden = false; ver.hidden = true; };
                if (temExtras(m)) ligarTeste(raiz, m);
                raiz.querySelector('#lido').onclick = function () {
                    var q = progresso(aula.id);
                    if (q.lidos[i]) delete q.lidos[i]; else q.lidos[i] = true;
                    salvarProgresso(aula.id, q);
                    if (q.lidos[i] && diaFeito(aula, k, q)) {
                        var resta = [k + 1, k + 2, k + 3, k + 4].filter(function (x) { return x < 5 && aula.semana[x].length; })[0];
                        aviso(resta !== undefined ? 'Estudo de ' + DIAS[k].toLowerCase() + ' concluído. Próximo: ' + DIAS[resta].toLowerCase() + '.' : 'Semana concluída! Revise com os exercícios.', 5000);
                        voltar();
                        return;
                    }
                    if (q.lidos[i] && !ultimo) { trocar(telaModulo(aula, g[j + 1])); return; }
                    desenhar(false);
                };
                raiz.querySelector('#perguntar').onclick = function () {
                    ir(telaConversa(aula, {
                        chave: 'mod' + i, modo: 'tutor', titulo: 'Dúvidas: ' + m.titulo,
                        contexto: 'O aluno está no estudo de ' + DIAS[k].toLowerCase() + ', no módulo "' + m.titulo + '" (' + (m.slides || '') + ').',
                        dica: 'Pergunte qualquer coisa sobre este módulo.'
                    }));
                };
                var ant = raiz.querySelector('#ant'), prox = raiz.querySelector('#prox'), fim = raiz.querySelector('#fimDia');
                if (ant) ant.onclick = function () { trocar(telaModulo(aula, g[j - 1])); };
                if (prox) prox.onclick = function () { trocar(telaModulo(aula, g[j + 1])); };
                if (fim) fim.onclick = function () { voltar(); };
            }
        };
    }

    /* ---------- aba Autores ---------- */

    function abaAutores(raiz, aula) {
        var autores = lista(aula.d.autores);
        var html = '<h2>Autores</h2><p class="fraco">Quem pensou o que está nesta lição, e como cada um se liga ao tema.</p>';
        autores.forEach(function (a, i) {
            html += '<div class="cartao toque" data-autor="' + i + '"><b style="font-size:17px">' + esc(a.nome) + '</b>' +
                '<div class="fraco peq">' + esc(a.datas) + ' · ' + esc(a.origem) + '</div>' +
                '<div class="marcas"><span class="marca' + (a.citado_no_pdf ? ' verde">citado no PDF' : '">complementar') + '</span></div></div>';
        });
        raiz.innerHTML = html;
        ao(raiz, '[data-autor]', function (n) { ir(telaAutor(aula, +n.dataset.autor)); });
    }

    function telaAutor(aula, i) {
        var a = lista(aula.d.autores)[i];
        return {
            titulo: a.nome,
            desenhar: function (raiz) {
                raiz.innerHTML =
                    '<h2>' + esc(a.nome) + '</h2><p class="fraco">' + esc(a.datas) + ' · ' + esc(a.origem) + '</p>' +
                    (a.frase ? '<p class="frase">' + esc(a.frase) + '</p>' : '') +
                    '<div class="cartao texto"><span class="rotulo">Quem foi</span>' + md(a.quem_foi) + '</div>' +
                    '<div class="cartao texto"><span class="rotulo">Ideias centrais</span><ul>' +
                    lista(a.ideias_centrais).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
                    '<div class="cartao texto"><span class="rotulo ouro">Como se liga à lição</span>' + md(a.relacao_com_a_licao) + '</div>' +
                    '<div class="cartao texto"><span class="rotulo">Diálogos e críticas</span>' + md(a.dialogos) + '</div>' +
                    '<div class="cartao texto"><span class="rotulo">Obras principais</span><ul>' +
                    lista(a.obras).map(function (o) {
                        return '<li><b>' + esc(o.titulo) + '</b> (' + esc(o.ano) + ') — ' + esc(o.sobre) + '</li>';
                    }).join('') + '</ul></div>' +
                    '<button class="botao largo" id="perguntar">💬 Perguntar ao professor sobre ' + esc(a.nome) + '</button>';
                raiz.querySelector('#perguntar').onclick = function () {
                    ir(telaConversa(aula, {
                        chave: 'autor' + i, modo: 'tutor', titulo: a.nome,
                        contexto: 'O aluno está estudando o autor ' + a.nome + '.',
                        dica: 'Pergunte sobre a vida, as ideias ou as obras de ' + a.nome + '.'
                    }));
                };
            }
        };
    }

    /* ---------- aba Conceitos ---------- */

    function abaConceitos(raiz, aula) {
        var cs = lista(aula.d.conceitos);
        raiz.innerHTML = '<h2>Conceitos</h2><input type="search" id="busca" placeholder="Procurar um termo…"><p></p><div id="lista"></div>';
        var $l = raiz.querySelector('#lista');
        function pintar(f) {
            f = (f || '').toLowerCase();
            $l.innerHTML = cs.filter(function (c) {
                return !f || (c.termo + ' ' + c.definicao).toLowerCase().indexOf(f) >= 0;
            }).map(function (c) {
                return '<div class="cartao"><b style="font-size:17px">' + esc(c.termo) + '</b>' +
                    '<p style="margin:6px 0">' + esc(c.definicao) + '</p>' +
                    (c.exemplo ? '<p class="peq"><span class="rotulo ouro">Exemplo</span><br>' + esc(c.exemplo) + '</p>' : '') +
                    (c.nao_confundir ? '<p class="peq"><span class="rotulo vermelho">Não confunda</span><br>' + esc(c.nao_confundir) + '</p>' : '') +
                    '</div>';
            }).join('') || '<p class="vazio">Nada encontrado.</p>';
        }
        raiz.querySelector('#busca').oninput = function () { pintar(this.value); };
        pintar('');
    }

    /* ---------- aba Cronologia ---------- */

    function abaTempo(raiz, aula) {
        raiz.innerHTML = '<h2>Cronologia</h2>' + lista(aula.d.linha_do_tempo).map(function (t) {
            return '<div class="cartao"><span class="rotulo ouro">' + esc(t.data) + '</span>' +
                '<p style="margin:2px 0 6px"><b>' + esc(t.evento) + '</b></p>' +
                '<p class="fraco peq" style="margin:0">' + esc(t.importancia) + '</p></div>';
        }).join('');
    }

    /* ---------- aba Debates ---------- */

    function abaDebates(raiz, aula) {
        var ds = lista(aula.d.debates);
        var html = '<h2>Debates</h2><p class="fraco">As grandes controvérsias do tema. Estude as posições e depois treine: ' +
            'o professor defende o lado contrário ao seu.</p>';
        ds.forEach(function (d, i) {
            html += '<div class="cartao toque" data-deb="' + i + '"><span class="rotulo">Debate ' + (i + 1) + '</span>' +
                '<p style="margin:0"><b>' + esc(d.questao) + '</b></p>' +
                (ler('conv:' + aula.id + ':deb' + i, []).length ? '<div class="marcas"><span class="marca verde">já treinado</span></div>' : '') +
                '</div>';
        });
        raiz.innerHTML = html;
        ao(raiz, '[data-deb]', function (n) { ir(telaDebate(aula, +n.dataset.deb)); });
    }

    function telaDebate(aula, i) {
        var d = lista(aula.d.debates)[i];
        return {
            titulo: 'Debate ' + (i + 1),
            desenhar: function (raiz) {
                var html = '<h2>' + esc(d.questao) + '</h2><div class="texto">' + md(d.contexto) + '</div>';
                lista(d.posicoes).forEach(function (p, j) {
                    html += '<div class="cartao texto"><span class="rotulo">' + esc(p.nome) + '</span>' +
                        '<p class="fraco peq">Quem defende: ' + esc(p.quem_defende) + '</p><ul>' +
                        lista(p.argumentos).map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>' +
                        '<p class="peq"><span class="rotulo vermelho">Ponto fraco</span><br>' + esc(p.ponto_fraco) + '</p>' +
                        '<button class="botao largo" data-lado="' + j + '">🎤 Defender esta posição</button></div>';
                });
                html += '<div class="cartao texto"><span class="rotulo ouro">Como debater bem</span>' + md(d.como_debater) + '</div>';
                if (ler('conv:' + aula.id + ':deb' + i, []).length) {
                    html += '<button class="botao largo" id="continuar">Continuar o debate anterior</button>';
                }
                raiz.innerHTML = html;
                ao(raiz, '[data-lado]', function (n) {
                    var p = d.posicoes[+n.dataset.lado];
                    gravar('conv:' + aula.id + ':deb' + i, []);
                    ir(telaConversa(aula, debateCfg(d, i, p)));
                });
                var c = raiz.querySelector('#continuar');
                if (c) c.onclick = function () {
                    ir(telaConversa(aula, debateCfg(d, i, ler('lado:' + aula.id + ':' + i, d.posicoes[0]))));
                };
            }
        };
        function debateCfg(d, i, p) {
            gravar('lado:' + aula.id + ':' + i, p);
            return {
                chave: 'deb' + i, modo: 'debate', titulo: 'Debate: você defende "' + p.nome + '"',
                contexto: 'Questão do debate: ' + d.questao + '\nO aluno defende a posição: "' + p.nome + '" (' + p.quem_defende + ').\n' +
                    'As outras posições: ' + lista(d.posicoes).filter(function (x) { return x !== p; })
                        .map(function (x) { return x.nome; }).join('; ') + '.',
                abertura: 'Eu defendo a posição "' + p.nome + '". Pode começar me atacando com o seu melhor argumento.',
                dica: 'Responda aos argumentos do professor. Quando quiser, encerre e peça a avaliação.',
                avaliar: true
            };
        }
    }

    /* ---------- aba Exercícios ---------- */

    function abaExercicios(raiz, aula) {
        var d = aula.d, p = progresso(aula.id);
        var nFlash = lista(d.flashcards).length, sabidos = Object.keys(p.flash).length;
        var html = '<h2>Exercícios</h2><p class="fraco">Para fixar e para treinar a argumentação. Faça todos.</p>' +
            item('quiz', '✅ Múltipla escolha', lista(d.quiz).length + ' questões' +
                (p.quiz.melhor !== undefined ? ' · melhor resultado: ' + p.quiz.melhor + '/' + lista(d.quiz).length : '')) +
            item('vf', '⚖️ Verdadeiro ou falso', lista(d.verdadeiro_falso).length + ' afirmações' +
                (p.vf.melhor !== undefined ? ' · melhor: ' + p.vf.melhor + '/' + lista(d.verdadeiro_falso).length : '')) +
            item('flash', '🃏 Flashcards', nFlash + ' cartões · ' + sabidos + ' já sabidos') +
            item('sabatina', '🎓 Sabatina oral', 'O professor pergunta, você responde, ele corrige e aumenta a dificuldade') +
            '<h3>Questões dissertativas</h3><p class="fraco peq">Escreva sua resposta e o professor corrige, dá nota e mostra a resposta modelo.</p>';
        lista(d.dissertativas).forEach(function (q, i) {
            html += '<div class="cartao toque" data-dis="' + i + '"><span class="rotulo">' + esc(q.nivel) + '</span>' +
                '<p style="margin:0">' + esc(q.enunciado) + '</p>' +
                (p.corrigidas[i] ? '<div class="marcas"><span class="marca verde">corrigida</span></div>' : '') + '</div>';
        });
        raiz.innerHTML = html;
        ao(raiz, '[data-ex]', function (n) {
            var t = n.dataset.ex;
            if (t === 'quiz') ir(telaQuiz(aula, 'quiz'));
            else if (t === 'vf') ir(telaQuiz(aula, 'vf'));
            else if (t === 'flash') ir(telaFlash(aula));
            else ir(telaConversa(aula, {
                chave: 'sabatina', modo: 'sabatina', titulo: 'Sabatina oral',
                abertura: 'Pode começar a sabatina sobre a lição inteira.',
                dica: 'Responda como numa prova oral. Para terminar, peça o balanço final.',
                recomecar: true
            }));
        });
        ao(raiz, '[data-dis]', function (n) { ir(telaDissertativa(aula, +n.dataset.dis)); });
        function item(id, nome, sub) {
            return '<div class="cartao toque" data-ex="' + id + '"><b>' + nome + '</b><div class="fraco peq">' + sub + '</div></div>';
        }
    }

    /* Múltipla escolha e verdadeiro/falso: uma questão por vez. */
    function telaQuiz(aula, tipo, soEstas) {
        var todas = lista(tipo === 'quiz' ? aula.d.quiz : aula.d.verdadeiro_falso);
        var ordem = soEstas || todas.map(function (_, i) { return i; });
        var pos = 0, acertos = 0, erros = [], respondida = false;
        return {
            titulo: tipo === 'quiz' ? 'Múltipla escolha' : 'Verdadeiro ou falso',
            desenhar: function (raiz) {
                if (pos >= ordem.length) { fim(raiz); return; }
                var q = todas[ordem[pos]];
                var opcoes = tipo === 'quiz' ? lista(q.alternativas) : ['Verdadeiro', 'Falso'];
                var certa = tipo === 'quiz' ? q.correta : (q.verdadeira ? 0 : 1);
                raiz.innerHTML = '<div class="placar">Questão ' + (pos + 1) + ' de ' + ordem.length + ' · ' + acertos + ' acertos</div>' +
                    '<div class="barra"><i style="width:' + (100 * pos / ordem.length) + '%"></i></div>' +
                    '<h3>' + esc(tipo === 'quiz' ? q.pergunta : q.afirmacao) + '</h3>' +
                    opcoes.map(function (o, k) {
                        return '<button class="alternativa" data-op="' + k + '">' + (tipo === 'quiz' ? 'ABCD'[k] + ') ' : '') + esc(o) + '</button>';
                    }).join('') + '<div id="depois"></div>';
                respondida = false;
                ao(raiz, '[data-op]', function (n) {
                    if (respondida) return;
                    respondida = true;
                    var k = +n.dataset.op;
                    raiz.querySelectorAll('[data-op]').forEach(function (b) {
                        if (+b.dataset.op === certa) b.classList.add('certa');
                    });
                    if (k === certa) acertos++;
                    else { n.classList.add('errada'); erros.push(ordem[pos]); }
                    raiz.querySelector('#depois').innerHTML =
                        '<div class="cartao texto"><span class="rotulo' + (k === certa ? '">Certo!' : ' vermelho">Errado') + '</span>' +
                        md(q.explicacao) + '</div><button class="botao principal largo" id="seguir">Continuar</button>';
                    raiz.querySelector('#seguir').onclick = function () { pos++; desenhar(true); };
                    raiz.querySelector('#seguir').scrollIntoView({ behavior: 'smooth', block: 'end' });
                });
            }
        };
        function fim(raiz) {
            if (!soEstas) {
                var p = progresso(aula.id), reg = p[tipo];
                reg.ultimo = acertos;
                reg.melhor = Math.max(reg.melhor || 0, acertos);
                salvarProgresso(aula.id, p);
            }
            var pct = Math.round(100 * acertos / ordem.length);
            raiz.innerHTML = '<div class="vazio"><div class="grande">' + (pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚') + '</div>' +
                '<h2>' + acertos + ' de ' + ordem.length + '</h2><p>' +
                (pct >= 80 ? 'Muito bem! Você domina este conteúdo.' : pct >= 60 ? 'Bom, mas revise os pontos que errou.' :
                    'Volte aos módulos e tente de novo. Errar aqui é o jeito de aprender.') + '</p></div>' +
                '<div class="botoes">' + (erros.length ? '<button class="botao principal" id="erros">Refazer as ' + erros.length + ' que errei</button>' : '') +
                '<button class="botao" id="tudo">Refazer tudo</button></div>';
            var e = raiz.querySelector('#erros');
            if (e) e.onclick = function () { trocar(telaQuiz(aula, tipo, erros.slice())); };
            raiz.querySelector('#tudo').onclick = function () { trocar(telaQuiz(aula, tipo)); };
        }
    }

    /* Flashcards: toca para virar; "sabia" tira do monte. */
    function telaFlash(aula) {
        var cards = lista(aula.d.flashcards);
        var p = progresso(aula.id);
        var monte = cards.map(function (_, i) { return i; }).filter(function (i) { return !p.flash[i]; });
        if (!monte.length) monte = cards.map(function (_, i) { return i; });
        monte.sort(function () { return Math.random() - 0.5; });
        var virado = false;
        return {
            titulo: 'Flashcards',
            desenhar: function (raiz) {
                var q = progresso(aula.id);
                if (!monte.length) {
                    raiz.innerHTML = '<div class="vazio"><div class="grande">🎉</div><h2>Monte terminado</h2>' +
                        '<p>' + Object.keys(q.flash).length + ' de ' + cards.length + ' cartões sabidos.</p></div>' +
                        '<div class="botoes"><button class="botao" id="zerar">Recomeçar com todos</button></div>';
                    raiz.querySelector('#zerar').onclick = function () {
                        var r = progresso(aula.id); r.flash = {}; salvarProgresso(aula.id, r); trocar(telaFlash(aula));
                    };
                    return;
                }
                var c = cards[monte[0]];
                raiz.innerHTML = '<div class="placar">Faltam ' + monte.length + ' · ' + Object.keys(q.flash).length + ' de ' + cards.length + ' sabidos</div>' +
                    '<div class="cartao flash" id="carta"><div><div class="lado">' + (virado ? 'resposta' : 'pergunta · toque para virar') + '</div>' +
                    '<p>' + esc(virado ? c.verso : c.frente) + '</p></div></div>' +
                    (virado ? '<div class="botoes"><button class="botao" id="nao">Não sabia</button>' +
                        '<button class="botao principal" id="sim">Sabia ✓</button></div>' : '');
                raiz.querySelector('#carta').onclick = function () { virado = !virado; desenhar(false); };
                if (virado) {
                    raiz.querySelector('#sim').onclick = function () {
                        var r = progresso(aula.id); r.flash[monte[0]] = true; salvarProgresso(aula.id, r);
                        monte.shift(); virado = false; desenhar(false);
                    };
                    raiz.querySelector('#nao').onclick = function () {
                        monte.push(monte.shift()); virado = false; desenhar(false);
                    };
                }
            }
        };
    }

    /* Dissertativa: escreve, o professor corrige na conversa. */
    function telaDissertativa(aula, i) {
        var q = lista(aula.d.dissertativas)[i];
        var chave = 'dis' + i;
        return {
            titulo: 'Questão ' + (i + 1),
            desenhar: function (raiz) {
                var temConversa = ler('conv:' + aula.id + ':' + chave, []).length > 0;
                raiz.innerHTML = '<span class="rotulo">' + esc(q.nivel) + '</span><h2>' + esc(q.enunciado) + '</h2>' +
                    '<textarea id="resp" placeholder="Escreva sua resposta com suas palavras…">' + esc(ler('rasc:' + aula.id + ':' + i, '')) + '</textarea>' +
                    '<div class="botoes"><button class="botao principal" id="enviar">Enviar para correção</button></div>' +
                    (temConversa ? '<button class="botao largo" id="ver" style="margin-top:8px">Ver a correção anterior</button>' : '') +
                    '<details class="cartao" style="margin-top:14px"><summary>Ver os pontos esperados (só depois de tentar)</summary><ul>' +
                    lista(q.pontos_esperados).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></details>';
                var $r = raiz.querySelector('#resp');
                $r.oninput = function () { gravar('rasc:' + aula.id + ':' + i, $r.value); };
                raiz.querySelector('#enviar').onclick = function () {
                    var t = $r.value.trim();
                    if (t.length < 20) { aviso('Escreva uma resposta um pouco mais longa.'); return; }
                    gravar('conv:' + aula.id + ':' + chave, []);
                    var p = progresso(aula.id); p.corrigidas[i] = true; salvarProgresso(aula.id, p);
                    ir(telaConversa(aula, cfg(t)));
                };
                var v = raiz.querySelector('#ver');
                if (v) v.onclick = function () { ir(telaConversa(aula, cfg(null))); };
            }
        };
        function cfg(abertura) {
            return {
                chave: chave, modo: 'corrigir', titulo: 'Correção da questão ' + (i + 1),
                contexto: 'Questão: ' + q.enunciado + '\nNível: ' + q.nivel + '\nPontos esperados:\n- ' + lista(q.pontos_esperados).join('\n- '),
                abertura: abertura,
                dica: 'Você pode reescrever a resposta e mandar de novo para nova correção.'
            };
        }
    }

    /* ---------- aba Professor ---------- */

    function abaProfessor(raiz, aula) {
        raiz.innerHTML = '<h2>Professor</h2><p class="fraco">Converse com o professor sobre qualquer ponto da lição. ' +
            'Ele conhece o PDF inteiro e a pesquisa feita, e pode buscar informação nova na web.</p>' +
            '<button class="botao principal largo" id="conversar">💬 Abrir a conversa</button>' +
            '<h3>Sugestões</h3>' +
            ['Explique a lição inteira para um leigo, com todas as nuances.',
                'Quais são as três ideias mais importantes desta lição?',
                'Como eu usaria esta lição para analisar uma notícia de hoje?',
                'Quais as críticas mais fortes a essa forma de analisar a política?',
                'Que pergunta difícil alguém poderia me fazer num debate sobre isso?'
            ].map(function (s) { return '<div class="cartao toque" data-sug="' + esc(s) + '">' + esc(s) + '</div>'; }).join('');
        raiz.querySelector('#conversar').onclick = function () { ir(telaConversa(aula, tutorCfg())); };
        ao(raiz, '[data-sug]', function (n) {
            var c = tutorCfg(); c.abertura = n.dataset.sug; c.enviarAbertura = true;
            ir(telaConversa(aula, c));
        });
        function tutorCfg() {
            return { chave: 'tutor', modo: 'tutor', titulo: 'Professor', dica: 'Pergunte o que quiser sobre a lição.', recomecar: true };
        }
    }

    /* ---------- aba Revisão ---------- */

    function abaRevisao(raiz, aula) {
        var d = aula.d;
        raiz.innerHTML = '<h2>Revisão</h2>' +
            '<div class="cartao texto"><span class="rotulo">Síntese</span>' + md(d.sintese) + '</div>' +
            '<div class="cartao texto"><span class="rotulo ouro">Argumentos prontos para o debate</span><ul>' +
            lista(d.argumentos_prontos).map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul></div>' +
            '<div class="cartao texto"><span class="rotulo">Para ir além</span><ul>' +
            lista(d.aprofundamento).map(function (l) {
                return '<li><b>' + esc(l.titulo) + '</b> — ' + esc(l.autor) + '<br><span class="fraco peq">' + esc(l.por_que) + '</span></li>';
            }).join('') + '</ul></div>' +
            '<button class="botao largo" id="dossie">📑 Ver o dossiê de pesquisa do professor</button><p></p>' +
            '<button class="botao largo" id="pdf">📄 Abrir o PDF original</button>';
        raiz.querySelector('#pdf').onclick = function () { N.abrirPdf(aula.id); };
        raiz.querySelector('#dossie').onclick = function () {
            ir({
                titulo: 'Dossiê de pesquisa',
                desenhar: function (r) {
                    r.innerHTML = '<div class="texto">' + md(N.dossie(aula.id)) + '</div>';
                }
            });
        };
    }

    /* =========================================================
       Conversa com o professor (dúvidas, debate, sabatina, correção)
       ========================================================= */

    var conversas = {};   // pedido -> {aoPedaco, aoFim, aoErro, aoAndamento}
    var proximoPedido = 1;

    window.__fala = function (r) {
        var c = conversas[r.pedido];
        if (!c) return;
        if (r.pedaco !== undefined) c.aoPedaco(r.pedaco);
        else if (r.andamento !== undefined) c.aoAndamento(r.andamento);
        else if (r.fim !== undefined) { delete conversas[r.pedido]; c.aoFim(r.fim); }
        else if (r.erro !== undefined) { delete conversas[r.pedido]; c.aoErro(r.erro, r.chaveRuim); }
    };

    function telaConversa(aula, cfg) {
        var chave = 'conv:' + aula.id + ':' + cfg.chave;
        var falando = false;
        var tela = {
            titulo: cfg.titulo,
            desenhar: function (raiz) {
                var msgs = ler(chave, []);
                var html = '<div class="conversa" id="conv">';
                if (!msgs.length && cfg.dica) html += '<p class="fraco peq centro">' + esc(cfg.dica) + '</p>';
                msgs.forEach(function (m) { html += fala(m); });
                html += '</div><div style="height:16px"></div><div class="botoes" id="extras">' +
                    (cfg.avaliar && msgs.length > 2 ? '<button class="botao" id="avaliar">🏁 Encerrar e avaliar meu desempenho</button>' : '') +
                    (cfg.recomecar && msgs.length ? '<button class="botao" id="recomecar">Recomeçar a conversa</button>' : '') +
                    '</div><div class="escrever"><textarea id="msg" rows="1" placeholder="Escreva…"></textarea>' +
                    '<button class="botao principal" id="enviar">➤</button></div>';
                raiz.innerHTML = html;
                var $msg = raiz.querySelector('#msg');
                $msg.value = ler('rasc:' + chave, '');
                $msg.oninput = function () {
                    gravar('rasc:' + chave, $msg.value);
                    $msg.style.height = 'auto';
                    $msg.style.height = Math.min(160, $msg.scrollHeight) + 'px';
                };
                raiz.querySelector('#enviar').onclick = function () {
                    var t = $msg.value.trim();
                    if (!t || falando) return;
                    $msg.value = ''; gravar('rasc:' + chave, '');
                    enviar(raiz, t, cfg.modo);
                };
                var av = raiz.querySelector('#avaliar');
                if (av) av.onclick = function () {
                    if (!falando) enviar(raiz, 'Encerro o debate aqui. Avalie o meu desempenho.', 'avaliar');
                };
                var rc = raiz.querySelector('#recomecar');
                if (rc) rc.onclick = function () {
                    if (falando) return;
                    confirmar(rc, 'Toque de novo para apagar a conversa', function () { gravar(chave, []); desenhar(false); });
                };
                window.scrollTo(0, document.body.scrollHeight);

                // a primeira fala é automática (debate, sabatina, resposta para correção, sugestão)
                if (cfg.abertura && !tela.abriu && (!msgs.length || cfg.enviarAbertura)) {
                    tela.abriu = true;
                    enviar(raiz, cfg.abertura, cfg.modo);
                }
            }
        };
        return tela;

        function fala(m) {
            if (m.papel === 'aluno') return '<div class="fala aluno">' + esc(m.texto) + '</div>';
            return '<div class="fala prof texto"><div class="quem">Professor</div>' + md(m.texto) + '</div>';
        }

        function enviar(raiz, texto, modo) {
            if (!N.temChave()) { trocar(telaSemChave(cfg)); return; }
            var msgs = ler(chave, []);
            // se a última fala ficou sem resposta (erro), junta com a nova
            if (msgs.length && msgs[msgs.length - 1].papel === 'aluno') msgs.pop();
            msgs.push({ papel: 'aluno', texto: texto });
            gravar(chave, msgs);
            var $conv = raiz.querySelector('#conv');
            $conv.insertAdjacentHTML('beforeend', fala(msgs[msgs.length - 1]));
            var $prof = el('<div class="fala prof texto"><div class="quem">Professor</div>' +
                '<div class="corpo"><span class="girando"></span><span class="fraco peq">Pensando…</span></div></div>').firstChild;
            $conv.appendChild($prof);
            var $corpo = $prof.querySelector('.corpo');
            window.scrollTo(0, document.body.scrollHeight);
            falando = true;
            var acumulado = '', agendado = false;
            var pedido = proximoPedido++;
            conversas[pedido] = {
                aoAndamento: function (t) {
                    if (!acumulado) $corpo.innerHTML = '<span class="girando"></span><span class="fraco peq">' + esc(t) + '</span>';
                },
                aoPedaco: function (t) {
                    acumulado += t;
                    if (agendado) return;
                    agendado = true;
                    requestAnimationFrame(function () {
                        agendado = false;
                        var noFim = window.innerHeight + window.scrollY >= document.body.scrollHeight - 120;
                        $corpo.innerHTML = md(acumulado);
                        if (noFim) window.scrollTo(0, document.body.scrollHeight);
                    });
                },
                aoFim: function (t) {
                    falando = false;
                    var m = ler(chave, []);
                    m.push({ papel: 'prof', texto: t || acumulado });
                    gravar(chave, m);
                    if (pilha[pilha.length - 1] === tela) desenhar(false);
                },
                aoErro: function (erro, chaveRuim) {
                    falando = false;
                    $prof.classList.add('erro');
                    $corpo.innerHTML = '<p style="color:var(--vermelho)">' + esc(erro) + '</p>' +
                        '<button class="botao" id="denovo">Tentar de novo</button>';
                    $corpo.querySelector('#denovo').onclick = function () {
                        $prof.remove();
                        var m = ler(chave, []);
                        var ultima = m.length && m[m.length - 1].papel === 'aluno' ? m[m.length - 1].texto : texto;
                        $conv.lastElementChild && $conv.lastElementChild.remove();
                        enviar(raiz, ultima, modo);
                    };
                    if (chaveRuim) ir(telaAjustes(true));
                }
            };
            N.conversar(pedido, aula.id, modo, cfg.contexto || '', JSON.stringify(msgs));
        }
    }

    /* Sem chave da API, conversar com o professor é no Claude, pelo plano. */
    function telaSemChave(cfg) {
        return {
            titulo: cfg.titulo,
            desenhar: function (raiz) {
                raiz.innerHTML = '<h2>Converse com o professor no Claude</h2>' +
                    '<div class="cartao texto"><p>Tirar dúvidas, debater, fazer a sabatina e corrigir as dissertativas usa o Claude. ' +
                    'Pelo seu plano, sem custo extra, isso acontece no <b>Formação do Pensador dentro do Claude</b>: a mesma aula está lá, ' +
                    'com essas mesmas abas.</p><p>Aqui no app você estuda a aula, os autores, os conceitos, os debates e faz ' +
                    'múltipla escolha, verdadeiro ou falso e flashcards, mesmo sem internet.</p></div>' +
                    '<a class="botao principal largo" href="' + NO_CLAUDE + '">Abrir no Claude ›</a><p></p>' +
                    '<button class="botao largo" id="chave">Usar uma chave da API aqui (pago à parte)</button>';
                raiz.querySelector('#chave').onclick = function () { trocar(telaAjustes(false)); };
            }
        };
    }

    /* ---------- as aulas que chegam do Claude, e as cópias ---------- */

    window.__pasta = function (r) {
        if (!r.ok) { aviso('A pasta não foi apontada.'); return; }
        aviso('Pasta apontada. Procurando aulas…');
        COP.importarDaPasta();
        if (pilha.length === 1) desenhar(false);
    };
    window.__importou = function (r) {
        if (r.erro) aviso(r.erro, 7000);
        else if (r.novas) aviso(r.novas === 1 ? 'Uma aula nova chegou do Claude.' : r.novas + ' aulas novas chegaram do Claude.', 6000);
        else if (r.manual) aviso('Essas aulas já estavam no app.');
        if (pilha.length === 1) desenhar(false);
        var b = document.getElementById('buscar');
        if (b && !r.novas && !r.erro) { b.disabled = false; b.textContent = 'Nenhuma aula nova. Buscar de novo'; }
    };
    window.__copia = function (r) { aviso(r.texto, 6000); };

    /* =========================================================
       Ajustes: a chave da API e a atualização
       ========================================================= */

    var respostas = {};
    window.__chave = function (r) {
        var f = respostas[r.pedido]; delete respostas[r.pedido];
        if (f) f(r);
    };
    // o Atualizador responde por estas duas
    window.__resposta = function (pedido, r) {
        var f = respostas[pedido]; delete respostas[pedido];
        if (f) f(r);
    };
    window.__progresso = function (pedido, p) {
        var b = document.getElementById('atualizar');
        if (b) b.textContent = 'Baixando… ' + p + '%';
    };

    function telaAjustes(obrigatorio) {
        return {
            titulo: 'Ajustes',
            desenhar: function (raiz) {
                var tem = N && N.temChave();
                var ultima = COP ? COP.ultimaCopia() : 0;
                raiz.innerHTML =
                    '<h2>Cópias das aulas</h2>' +
                    '<div class="cartao texto"><p>As aulas ficam neste celular para sempre. Para não perder nem se desinstalar o app ' +
                    'ou trocar de celular, existem três cópias:</p><ul>' +
                    '<li><b>No Claude</b>: as aulas preparadas lá continuam guardadas na sua conta.</li>' +
                    '<li><b>Em Downloads</b>: o app regrava sozinho <code>formacao-copia-do-app.json</code> a cada aula nova. Sobrevive a desinstalar o app.</li>' +
                    '<li><b>No Google Drive</b>: toque em <b>Enviar cópia</b> e escolha o Drive. Sobrevive a perder o celular.</li></ul>' +
                    '<p class="fraco peq">' + (ultima ? 'Última cópia em Downloads: ' + esc(new Date(ultima).toLocaleString('pt-BR')) : 'Ainda não há cópia em Downloads.') + '</p>' +
                    '<div class="botoes"><button class="botao" id="salvarCopia">Salvar cópia agora</button>' +
                    '<button class="botao principal" id="enviarCopia">Enviar cópia (Drive)</button></div>' +
                    '<p></p><button class="botao largo" id="importar">Trazer aulas de um arquivo de cópia</button></div>' +
                    '<hr><h2>' + (tem ? 'A chave da API está ligada ✓' : 'Chave da API (opcional)') + '</h2>' +
                    '<p class="fraco">Não é preciso: as aulas podem ser preparadas no Claude, pelo seu plano. A chave serve só para preparar ' +
                    'aulas e conversar com o professor direto por aqui, com pesquisa na web, pagando à parte.</p>' +
                    '<div class="cartao texto"><p>Quem escreve as aulas e conversa com você é o <b>Claude</b>, da Anthropic, ' +
                    'pela API. Para isso o app precisa de uma <b>chave da API</b> (é diferente da assinatura do Claude: ' +
                    'a API é paga por uso, com créditos).</p>' +
                    '<ol><li>Abra <a href="https://console.anthropic.com/">console.anthropic.com</a> e entre (pode ser com o mesmo e-mail do Claude).</li>' +
                    '<li>Em <b>Billing</b>, coloque créditos (US$ 10 dão para várias semanas).</li>' +
                    '<li>Em <b>API Keys</b>, toque em <b>Create Key</b>, dê um nome e copie a chave (começa com <code>sk-ant-</code>).</li>' +
                    '<li>Cole aqui embaixo.</li></ol>' +
                    '<p class="fraco peq">Custo aproximado: de US$ 1,50 a 4 para preparar cada lição (leitura do PDF, pesquisa na web e a aula), ' +
                    'e alguns centavos por pergunta ao professor.</p></div>' +
                    '<input type="password" id="chave" placeholder="' + (tem ? 'Colar uma chave nova…' : 'sk-ant-…') + '" autocomplete="off">' +
                    '<div class="botoes"><button class="botao principal" id="salvar">Conferir e salvar</button>' +
                    (tem ? '<button class="botao perigo" id="apagar">Tirar a chave</button>' : '') + '</div>' +
                    '<p class="fraco peq">A chave fica guardada só neste celular, cifrada pelo chip de segurança do Android, ' +
                    'e só é usada para falar com a Anthropic.</p>' +
                    '<hr><h3>Versão</h3><p class="fraco" id="versao"></p>' +
                    '<button class="botao largo" id="atualizar">Procurar atualização</button>';
                if (COP) {
                    raiz.querySelector('#salvarCopia').onclick = function () { COP.salvarCopia(); };
                    raiz.querySelector('#enviarCopia').onclick = function () { COP.enviarCopia(); };
                    raiz.querySelector('#importar').onclick = function () { COP.importarArquivo(); };
                }
                var $c = raiz.querySelector('#chave');
                raiz.querySelector('#salvar').onclick = function () {
                    var b = this, k = $c.value.trim();
                    if (!k) { aviso('Cole a chave primeiro.'); return; }
                    b.disabled = true; b.textContent = 'Conferindo…';
                    var p = proximoPedido++;
                    respostas[p] = function (r) {
                        b.disabled = false; b.textContent = 'Conferir e salvar';
                        if (r.erro) { aviso(r.erro, 8000); return; }
                        aviso('Chave conferida e salva. ✓');
                        if (pilha.length > 1) voltar(); else trocar(telaInicio());
                    };
                    N.salvarChave(p, k);
                };
                var ap = raiz.querySelector('#apagar');
                if (ap) ap.onclick = function () {
                    confirmar(ap, 'Toque de novo para tirar a chave', function () { N.apagarChave(); desenhar(false); });
                };
                var $v = raiz.querySelector('#versao');
                $v.textContent = ATU ? 'Instalada: ' + ATU.versaoInstalada() : '';
                raiz.querySelector('#atualizar').onclick = function () {
                    if (!ATU) return;
                    var b = this; b.disabled = true; b.textContent = 'Procurando…';
                    var p = proximoPedido++;
                    respostas[p] = function (r) {
                        b.disabled = false;
                        if (!r.codigo) { b.textContent = 'Procurar atualização'; aviso('Não deu para ver agora. Confira a internet.'); return; }
                        if (r.codigo <= r.instalada) { b.textContent = 'Você está na versão mais nova ✓'; return; }
                        b.textContent = 'Instalar a versão ' + r.nome;
                        $v.innerHTML = 'Novidade: ' + esc(r.novidades);
                        b.onclick = function () {
                            b.disabled = true;
                            var q = proximoPedido++;
                            respostas[q] = function (s) {
                                b.disabled = false;
                                if (s.permissao) { b.textContent = 'Autorize e toque de novo'; return; }
                                if (s.erro) { aviso(s.erro); b.textContent = 'Tentar de novo'; }
                            };
                            ATU.atualizar(q);
                        };
                    };
                    ATU.verificar(p);
                };
            }
        };
    }

    /* =========================================================
       Começo
       ========================================================= */

    pilha = [telaInicio()];
    desenhar(true);
    // toda abertura traz as aulas novas que o Claude deixou em Downloads
    if (COP && COP.pastaTem()) COP.importarDaPasta();

    // ao voltar ao app, a lista reflete o que terminou enquanto ele estava fora
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) return;
        if (pilha.length === 1) desenhar(false);
        if (COP && COP.pastaTem()) COP.importarDaPasta();
    });
})();
