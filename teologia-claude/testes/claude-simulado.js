/* Um Claude de mentira para testar a página fora do claude.ai.
   Injetado antes da página (addInitScript). Simula sample (com imagens e
   ferramentas), db (que devolve documentos CONGELADOS, como o de verdade),
   user, downloads e mcp (o conector de pesquisa).
   Controles do teste:
     window.__falhar = [{quando: 'trecho do pedido', code: 'rate_limited'}]  falha uma vez
     window.__pedidos  lista dos pedidos feitos (para conferir)
     window.__baixado  o último arquivo "baixado" */
(function () {
    'use strict';
    var CHAVE = '__mockdb';
    function carregar() { try { return JSON.parse(localStorage.getItem(CHAVE) || '{}'); } catch (e) { return {}; } }
    var docs = carregar();
    function salvar() { localStorage.setItem(CHAVE, JSON.stringify(docs)); }
    function congelar(o) {
        if (o && typeof o === 'object') { Object.freeze(o); Object.keys(o).forEach(function (k) { congelar(o[k]); }); }
        return o;
    }
    function snap(caminho) {
        var v = docs[caminho];
        return { id: caminho.split('/').pop(), exists: v !== undefined, data: function () { return congelar(JSON.parse(JSON.stringify(v))); } };
    }
    function colecao(base) {
        function consulta(filtros) {
            return {
                where: function (campo, op, valor) { return consulta(filtros.concat([[campo, valor]])); },
                get: async function () {
                    await espera(5);
                    var lista = Object.keys(docs).filter(function (k) {
                        if (k.indexOf(base + '/') !== 0 || k.slice(base.length + 1).indexOf('/') >= 0) return false;
                        return filtros.every(function (f) { return docs[k] && docs[k][f[0]] === f[1]; });
                    }).map(snap);
                    return { docs: lista, size: lista.length };
                }
            };
        }
        var q = consulta([]);
        return {
            where: q.where, get: q.get,
            doc: function (id) {
                var c = base + '/' + id;
                return {
                    get: async function () { await espera(3); return snap(c); },
                    set: async function (v) {
                        await espera(3);
                        var t = JSON.stringify(v);
                        if (t.length > 1000000) throw { code: 'too_large', message: 'documento grande demais' };
                        docs[c] = JSON.parse(t); salvar();
                    },
                    delete: async function () { delete docs[c]; salvar(); }
                };
            }
        };
    }
    function espera(ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); }

    window.__pedidos = [];
    window.__falhar = window.__falhar || [];
    function talvezFalhar(texto) {
        for (var i = 0; i < window.__falhar.length; i++) {
            var f = window.__falhar[i];
            if (texto.indexOf(f.quando) >= 0) { window.__falhar.splice(i, 1); throw { code: f.code || 'rate_limited', message: 'falha simulada' }; }
        }
    }

    function respostaJSON(p) {
        if (p.indexOf('FICHAMENTO completo') >= 0) {
            var parte = (p.match(/parte="(\d+) de (\d+)"/) || [])[1] || '1';
            return { fichamento: 'Fichamento da parte ' + parte + ': justificação pela fé, Lutero e Rm 3.', modulos: [
                { titulo: 'Parte ' + parte + ' — começo', trecho: 'cap. ' + parte + 'a', cobre: 'o começo' },
                { titulo: 'Parte ' + parte + ' — fim', trecho: 'cap. ' + parte + 'b', cobre: 'o fim' }],
                autores: ['Martinho Lutero'], passagens: ['Rm 3.21-26'] };
        }
        if (p.indexOf('Planeje a AULA INTERATIVA') >= 0) return {
            titulo: 'A justificação pela fé', subtitulo: 'O coração da Reforma',
            visao_geral: 'Uma visão **geral** da doutrina.', roteiro: ['Ler', 'Entender', 'Debater'],
            modulos: [{ titulo: 'O problema do pecado', trecho: 'páginas 1 a 2', cobre: 'pecado' },
                      { titulo: 'A justiça de Deus', trecho: 'páginas 3 a 4', cobre: 'justiça' },
                      { titulo: 'Fé e obras', trecho: 'páginas 5 a 7', cobre: 'Tiago e Paulo' }],
            autores: [{ nome: 'Martinho Lutero', citado_no_material: true }, { nome: 'Agostinho de Hipona', citado_no_material: true },
                      { nome: 'João Calvino', citado_no_material: false }, { nome: 'N. T. Wright', citado_no_material: false }],
            passagens: [{ referencia: 'Rm 3.21-26', citada_no_material: true }, { referencia: 'Gl 2.16', citada_no_material: true },
                        { referencia: 'Tg 2.14-26', citada_no_material: true }, { referencia: 'Hc 2.4', citada_no_material: false },
                        { referencia: 'Ef 2.8-10', citada_no_material: false }]
        };
        if (p.indexOf('Escolha de 5 a 8 buscas') >= 0) return { buscas: [
            { consulta: 'Lutero Torre experiência data', por_que: 'conferir a data' },
            { consulta: 'Declaração Conjunta sobre a Doutrina da Justificação 1999', por_que: 'debate atual' },
            { consulta: 'nova perspectiva sobre Paulo Sanders Dunn Wright', por_que: 'debate' }] };
        var mod = p.match(/Escreva agora o MÓDULO (\d+)/);
        if (mod) return { titulo: 'Módulo ' + mod[1], trecho: 'páginas', em_uma_frase: 'A ideia do módulo ' + mod[1] + '.',
            explicacao: 'O material diz que **dikaiosýnē** é a justiça.\n\n- ponto um\n- ponto dois', complemento: 'O professor acrescenta o contexto de Agostinho.',
            da_pesquisa: p.indexOf('<pesquisa_na_web>') >= 0 ? 'Segundo a [Declaração Conjunta](https://www.vatican.va/exemplo), houve consenso parcial em 1999.' : '',
            passagens: ['Rm 3.21-26'], ilustracao: 'Um réu absolvido.', por_que_importa: 'Importa para a fé.', cuidado: 'Não confunda com santificação.',
            checagem: { pergunta: 'O que é justificar?', resposta: 'Declarar justo.' } };
        if (p.indexOf('verbete completo') >= 0) {
            var grupo = JSON.parse(p.match(/teólogos ou autores: (\[.*?\])\./)[1]);
            return { autores: grupo.map(function (a) { return { nome: a.nome, datas: '1483–1546', origem: 'Alemanha', tradicao: 'Luterana', citado_no_material: a.citado_no_material,
                o_que_o_material_diz: 'O material cita.', quem_foi: 'Um reformador.', ideias_centrais: ['Sola fide'], obras: [{ titulo: 'Da liberdade cristã', ano: '1520', sobre: 'liberdade' }],
                relacao_com_o_material: 'Liga-se ao tema.', dialogos: 'Debateu com Erasmo.', da_pesquisa: '', frase: 'Simul iustus et peccator.' }; }) };
        }
        if (p.indexOf('estudo de cada uma destas passagens') >= 0) {
            var gp = JSON.parse(p.match(/passagens bíblicas: (\[.*?\])\./)[1]);
            return { passagens: gp.map(function (x) { return { referencia: x.referencia, citada_no_material: x.citada_no_material, como_o_material_usa: 'Como prova.',
                contexto: 'Carta aos romanos, c. 57 d.C.', sentido: 'Deus justifica o ímpio.',
                termos_originais: [{ original: 'δικαιοσύνη', transliteracao: 'dikaiosýnē', lingua: 'grego', significado: 'justiça', observacao: 'termo forense' },
                                   { original: 'צְדָקָה', transliteracao: 'tsedaqah', lingua: 'hebraico', significado: 'justiça', observacao: 'fidelidade à aliança' }],
                interpretacoes: [{ tradicao: 'Luterana', leitura: 'imputação' }, { tradicao: 'Católica', leitura: 'infusão' }],
                ligacao_com_o_tema: 'Central.', da_pesquisa: '' }; }) };
        }
        if (p.indexOf('Monte o GLOSSÁRIO') >= 0) return { conceitos: [
            { termo: 'Justificação', original: 'δικαίωσις (dikaíōsis)', definicao: 'Ato de declarar justo.', exemplo: 'Um juiz absolve.', tradicoes: 'Divergem.', nao_confundir: 'santificação', do_material: true },
            { termo: 'Imputação', original: '', definicao: 'Creditar a justiça de Cristo.', exemplo: '', tradicoes: '', nao_confundir: '', do_material: false }],
            linha_do_tempo: [{ data: '1517', evento: '95 teses', importancia: 'início da Reforma' }, { data: '1547', evento: 'Trento, sessão VI', importancia: 'resposta católica' }] };
        if (p.indexOf('Monte de 3 a 6 DEBATES') >= 0) return { debates: [{ questao: 'Justificação é forense ou transformadora?', contexto: 'Desde a Reforma.',
            posicoes: [{ nome: 'Forense', quem_defende: 'Luteranos e reformados', argumentos: ['Rm 4.5'], ponto_fraco: 'Tiago 2' },
                       { nome: 'Transformadora', quem_defende: 'Católicos', argumentos: ['Tg 2.24'], ponto_fraco: 'Rm 4' }],
            posicao_do_material: 'Forense', como_debater: 'Defina os termos.' }] };
        if (p.indexOf('questões de MÚLTIPLA ESCOLHA') >= 0) return {
            quiz: [{ pergunta: 'Quem escreveu as 95 teses?', alternativas: ['Calvino', 'Lutero', 'Zuínglio', 'Knox'], correta: 1, explicacao: 'Foi Lutero.' },
                   { pergunta: 'Em que ano?', alternativas: ['1517', '1521', '1530', '1545'], correta: 0, explicacao: '1517.' }],
            verdadeiro_falso: [{ afirmacao: 'Trento aceitou o sola fide.', verdadeira: false, explicacao: 'Rejeitou.' }] };
        if (p.indexOf('FLASHCARDS') >= 0) return { flashcards: [{ frente: 'Sola fide', verso: 'Só pela fé' }, { frente: 'Simul iustus', verso: 'Ao mesmo tempo justo e pecador' }],
            dissertativas: [{ enunciado: 'Explique a justificação forense.', nivel: 'básico', pontos_esperados: ['declaração', 'imputação'] }],
            argumentos_prontos: ['Rm 4.5 fala de justificar o ímpio.'], aprofundamento: [{ titulo: 'Institutas', autor: 'Calvino', tradicao: 'Reformada', por_que: 'Clássico.' }],
            sintese: 'A **síntese** da aula.' };
        if (p.indexOf('parte de aplicação') >= 0) {
            var t = (p.match(/"titulo": "([^"]+)", "secoes"/) || [])[1] || 'Aplicação';
            return { titulo: t, secoes: [{ titulo: 'Esboço', conteudo: '1. Introdução\n2. Desenvolvimento' }, { titulo: 'Cuidados', conteudo: 'Não distorça o texto.' }] };
        }
        throw { code: 'invalid_json', message: 'o simulado não sabe responder: ' + p.slice(-200) };
    }

    async function sample(input, opcoes) {
        opcoes = opcoes || {};
        var texto = typeof input === 'string' ? input : input.map(function (t) { return t.content; }).join('\n');
        window.__pedidos.push({ fim: texto.slice(-300), fichamento: texto.indexOf('FICHAMENTO completo') >= 0, paginas: (texto.match(/As imagens são as páginas (\d+ a \d+)/) || [])[1], inicioModulo: (texto.match(/Escreva agora o MÓDULO \d+ de \d+/) || [])[0], imagens: opcoes.images ? opcoes.images.length : 0, ferramentas: opcoes.tools ? opcoes.tools.length : 0, cache: opcoes.cache, bytes: new TextEncoder().encode(texto).length });
        if (new TextEncoder().encode(texto).length > 262144) throw { code: 'prompt_too_large', message: 'grande demais' };
        if (opcoes.tools && 'cache' in opcoes) throw { code: 'invalid_request', message: 'cache com tools' };
        await espera(10);
        talvezFalhar(texto);
        var r;
        if (texto.indexOf('Transcreva cada página') >= 0) {
            if (!opcoes.images || !opcoes.images.length) throw { code: 'invalid_request', message: 'sem imagens' };
            if (opcoes.images.length > 6) throw { code: 'invalid_request', message: 'imagens demais' };
            var m = texto.match(/páginas (\d+) a (\d+)/);
            r = '';
            for (var n = +m[1]; n <= +m[2]; n++) r += '### Página ' + n + ' — Slide\n\nTexto transcrito da página ' + n + ' com δικαιοσύνη e Rm 3.21.\n\n';
        } else if (texto.indexOf('DOSSIÊ DA PESQUISA') >= 0) {
            r = '## Dossiê\n\n- A Declaração Conjunta é de 1999 ([vatican.va](https://www.vatican.va/exemplo)).';
        } else if (opcoes.tools) {
            var res = await opcoes.tools[0].execute({ consulta: 'teste de busca' }, { signal: opcoes.signal });
            r = 'Pesquisei e achei: ' + String(res).slice(0, 60) + ' [fonte](https://exemplo.org)';
        } else if (texto.indexOf('Modo DEBATE') >= 0 || texto.indexOf('Modo SABATINA') >= 0 || texto.indexOf('Modo CORREÇÃO') >= 0 || texto.indexOf('Modo TIRA-DÚVIDAS') >= 0) {
            r = texto.indexOf('O debate acabou') >= 0 ? 'Nota 8. Bons argumentos.' : 'Resposta do professor ao aluno.';
        } else if (opcoes.__json) {
            return respostaJSON(texto);
        } else throw { code: 'invalid_request', message: 'pedido inesperado' };
        if (opcoes.onText) opcoes.onText({ text: r, delta: r });
        return { text: r, truncated: false };
    }
    sample.json = async function (input, opcoes) {
        var o = Object.assign({}, opcoes || {}, { __json: true });
        return sample(input, o);
    };
    sample.limits = async function () {
        return { maxPromptBytes: 262144, images: { maxCount: window.__maxImagens || 6, maxInputBytes: 20000000, mediaTypes: ['image/jpeg', 'image/png'] }, tools: { maxCount: 8 } };
    };

    var buscas = [];
    window.__buscas = buscas;
    var mcp = {
        listTools: async function () { return window.__semConector ? { servers: [] } : { servers: [{ server: 'Parallel Search', authStatus: 'connected', tools: [{ name: 'web_search', description: '' }] }] }; },
        describeTool: async function () { return { name: 'web_search', description: '', inputSchema: { type: 'object', properties: { objective: { type: 'string' }, search_queries: { type: 'array', items: { type: 'string' } } }, required: ['objective'] } }; },
        callTool: async function (srv, tool, entrada) {
            if (window.__semConector) throw { code: 'server_not_connected', message: 'sem conector' };
            if (srv !== 'Parallel Search' || tool !== 'web_search' || typeof entrada.objective !== 'string') throw { code: 'tool_error', message: 'argumentos' };
            buscas.push(entrada);
            return { content: [], payload: { results: [{ url: 'https://pt.wikipedia.org/wiki/Teste', title: 'Teste', excerpts: ['trecho sobre ' + entrada.objective] }] } };
        }
    };
    var caps = {
        sample: sample,
        db: { collection: colecao },
        user: { id: async function () { return 'u_teste'; }, isOwner: function () { return true; } },
        downloads: { save: async function (a) { window.__baixado = a; return { status: 'saved' }; } },
        mcp: mcp
    };
    window.claude = { use: function (n) { return Promise.resolve(caps[n] || null); } };
})();
