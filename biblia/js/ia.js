/* =========================================================
   Conversa com o Claude. Por dois caminhos, conforme onde o app roda.

   1. DENTRO DO CLAUDE (a versão publicada como artifact): a própria
      página pede o estudo ao Claude, sem chave nenhuma. Quem paga é o
      plano do Claude de quem está lendo. É o caminho sem configuração.

   2. FORA DELE (o APK e o site instalado): não existe login do Claude
      para a página usar, então vale a chave da API da Anthropic, que
      fica no aparelho e vai só para api.anthropic.com.

   O resto do app não sabe em qual dos dois está: chama B.ia.gerar() e
   recebe o texto pedaço por pedaço do mesmo jeito.

   Não há servidor no meio: a chave é sua, fica no seu aparelho e vai
   só para api.anthropic.com. Isso tem um preço honesto — quem pegar o
   seu celular destravado consegue ver a chave em Ajustes — e uma
   vantagem: o app não depende de mim nem de servidor nenhum para
   continuar funcionando.

   O texto chega em streaming, pedaço por pedaço, porque um estudo
   completo leva um ou dois minutos e ninguém merece olhar para uma
   ampulheta esse tempo todo.
   ========================================================= */
window.B = window.B || {};

B.ia = (function () {
    'use strict';

    var URL_API = 'https://api.anthropic.com/v1/messages';
    var VERSAO_API = '2023-06-01';
    var BETA_FALLBACK = 'server-side-fallback-2026-07-01';
    var CHAVE_DEGRADADO = 'bib:semRecurso';

    /* O que cada modelo aceita. Haiku não tem pensamento adaptativo nem
       controle de esforço; mandar esses campos para ele dá erro 400. */
    var MODELOS = {
        'claude-opus-5': {
            nome: 'Claude Opus 5', desc: 'O melhor para estudo denso. Mais caro e mais lento.',
            pensa: true, esforco: true, maxTokens: 64000, preco: [5, 25]
        },
        'claude-sonnet-5': {
            nome: 'Claude Sonnet 5', desc: 'Bem perto do Opus por um terço do preço.',
            pensa: true, esforco: true, maxTokens: 64000, preco: [2, 10]
        },
        'claude-haiku-4-5': {
            nome: 'Claude Haiku 4.5', desc: 'Rápido e barato; menos profundidade teológica.',
            pensa: false, esforco: false, maxTokens: 32000, preco: [1, 5]
        }
    };

    /* ---------- qual motor está disponível ---------- */

    var motor = 'chave';      // 'claude' quando a página roda dentro do Claude
    var claudeSample = null;
    var deteccao = null;

    function detectar() {
        if (deteccao) return deteccao;
        if (!window.claude || typeof window.claude.use !== 'function') {
            deteccao = Promise.resolve('chave');
            return deteccao;
        }
        /* use() pode demorar (até dez segundos) e devolver null quando a
           página não tem a capacidade: nesse caso é a chave que vale. */
        deteccao = Promise.resolve(window.claude.use('sample')).then(function (s) {
            claudeSample = s || null;
            motor = s ? 'claude' : 'chave';
            return motor;
        }, function () { return 'chave'; });
        return deteccao;
    }

    function modo() { return motor; }

    /* Pede o estudo ao Claude da própria página. Sem chave, sem custo
       separado — e sem busca na web, que este caminho não oferece. */
    function viaClaude(pedido, cfg, eventos, sinal) {
        if (eventos.onInicio) eventos.onInicio();
        var opcoes = {
            modelTier: pedido.tipo === 'pergunta' ? 'default' : 'complex',
            cache: false,
            onText: function (ev) {
                if (eventos.onTexto) eventos.onTexto('', ev.text || '');
            }
        };
        if (sinal) opcoes.signal = sinal;

        return claudeSample([
            { role: 'user', content: pedido.sistema + '\n\n---\n\n' + pedido.usuario }
        ], opcoes).then(function (r) {
            var texto = (r && r.text) || '';
            if (!texto.trim()) throw new Error('A resposta voltou vazia. Tente de novo.');
            if (r && r.truncated && eventos.onAviso) {
                eventos.onAviso('O texto chegou ao limite de tamanho e pode ter ficado ' +
                    'cortado no fim.');
            }
            var fim = { texto: texto, uso: null, modelo: 'Claude (pelo seu plano)', custo: 0 };
            if (eventos.onFim) eventos.onFim(fim);
            return fim;
        }, function (err) {
            if (err && (err.name === 'AbortError' || err.code === 'cancelled')) {
                var a = new Error('cancelado');
                a.name = 'AbortError';
                throw a;
            }
            var codigo = err && err.code;
            var msg = codigo === 'not_granted'
                ? 'Você não autorizou esta página a usar o Claude. Recarregue e aceite o pedido para gerar o estudo.'
                : codigo === 'rate_limited'
                    ? 'O Claude está limitando o uso agora. Espere alguns minutos e tente de novo.'
                    : (err && err.message) || 'O Claude não conseguiu responder agora.';
            var e = new Error(msg);
            e.fatal = codigo === 'not_granted';
            e.parcial = err && err.text;
            throw e;
        });
    }

    function semRecurso() {
        try { return JSON.parse(localStorage.getItem(CHAVE_DEGRADADO) || '{}'); }
        catch (e) { return {}; }
    }
    function desligarRecurso(nome) {
        var d = semRecurso();
        d[nome] = true;
        try { localStorage.setItem(CHAVE_DEGRADADO, JSON.stringify(d)); } catch (e) { }
    }

    function corpo(pedido, cfg, sem) {
        var m = MODELOS[cfg.modelo] || MODELOS['claude-opus-5'];
        var b = {
            model: cfg.modelo,
            max_tokens: m.maxTokens,
            stream: true,
            system: pedido.sistema,
            messages: [{ role: 'user', content: pedido.usuario }]
        };
        /* Pensamento adaptativo: o modelo decide sozinho quanto pensar
           antes de escrever, e o resumo do raciocínio vira o "pensando..."
           que aparece na tela enquanto o estudo não começa. */
        if (m.pensa && !sem.pensamento) b.thinking = { type: 'adaptive', display: 'summarized' };
        if (m.esforco && !sem.esforco) b.output_config = { effort: cfg.esforco || 'high' };
        /* Se a pergunta esbarrar num classificador de segurança, a própria
           API refaz o pedido em outro modelo em vez de devolver recusa. */
        if (!sem.fallback) b.fallbacks = 'default';
        if (cfg.buscaWeb && !sem.busca) {
            b.tools = [{ type: 'web_search_20260209', name: 'web_search', max_uses: 8 }];
        }
        return b;
    }

    function cabecalhos(cfg, sem) {
        var h = {
            'content-type': 'application/json',
            'x-api-key': cfg.chave,
            'anthropic-version': VERSAO_API,
            /* Sem este cabeçalho a API recusa chamada vinda de navegador. */
            'anthropic-dangerous-direct-browser-access': 'true'
        };
        if (!sem.fallback) h['anthropic-beta'] = BETA_FALLBACK;
        return h;
    }

    /* Lê o erro da API e diz, em português, o que a pessoa pode fazer. */
    function explicarErro(status, dados, textoBruto) {
        var msg = (dados && dados.error && dados.error.message) || textoBruto || '';
        var tipo = (dados && dados.error && dados.error.type) || '';
        if (status === 401 || tipo === 'authentication_error') {
            return { txt: 'Chave recusada. Confira se você copiou a chave inteira (ela começa com "sk-ant-") e se ela ainda está ativa no console da Anthropic.', fatal: true };
        }
        if (status === 403) return { txt: 'A chave não tem permissão para este modelo. Escolha outro modelo em Ajustes.', fatal: true };
        if (status === 400 && /credit balance|billing/i.test(msg)) {
            return { txt: 'A conta da API está sem créditos. Adicione crédito em console.anthropic.com → Billing.', fatal: true };
        }
        if (status === 429) return { txt: 'Limite de uso atingido por agora. Espere um minuto e tente de novo.', fatal: false };
        if (status === 529 || status === 503) return { txt: 'A API está sobrecarregada neste momento. Tente de novo daqui a pouco.', fatal: false };
        if (status >= 500) return { txt: 'Erro no servidor da Anthropic (' + status + '). Tente de novo.', fatal: false };
        return { txt: msg ? ('A API recusou o pedido: ' + msg) : ('Erro ' + status + ' na chamada da API.'), fatal: false };
    }

    /* Um erro 400 pode ser só um recurso novo que a conta ainda não tem.
       Em vez de morrer, o app desliga aquele recurso e tenta de novo. */
    function recursoCulpado(msg) {
        msg = String(msg || '').toLowerCase();
        if (/fallback/.test(msg)) return 'fallback';
        if (/web_search|tools|tool/.test(msg)) return 'busca';
        if (/thinking/.test(msg)) return 'pensamento';
        if (/output_config|effort/.test(msg)) return 'esforco';
        return null;
    }

    /* ---------- a chamada ---------- */
    /* eventos: onTexto(pedaco), onPensando(resumo), onBusca(consulta),
                onInicio(), onFim({texto, uso, modelo}) */

    function gerar(pedido, cfg, eventos, sinal) {
        if (motor === 'claude' && claudeSample) return viaClaude(pedido, cfg, eventos, sinal);
        if (!cfg.chave) {
            return Promise.reject(new Error('Falta a chave da API. Configure em Ajustes.'));
        }
        return viaApi(pedido, cfg, eventos, sinal);
    }

    function viaApi(pedido, cfg, eventos, sinal) {
        var sem = semRecurso();
        var tentativas = 0;

        function tentar() {
            tentativas++;
            return fetch(URL_API, {
                method: 'POST',
                headers: cabecalhos(cfg, sem),
                body: JSON.stringify(corpo(pedido, cfg, sem)),
                signal: sinal
            }).then(function (r) {
                if (r.ok) return lerFluxo(r, eventos, cfg);

                return r.text().then(function (t) {
                    var dados = null;
                    try { dados = JSON.parse(t); } catch (e) { }
                    var msg = (dados && dados.error && dados.error.message) || t;

                    if (r.status === 400 && tentativas < 4) {
                        var culpado = recursoCulpado(msg);
                        if (culpado && !sem[culpado]) {
                            sem[culpado] = true;
                            desligarRecurso(culpado);
                            if (eventos.onAviso) {
                                eventos.onAviso(culpado === 'busca'
                                    ? 'A busca na web não está disponível para esta chave; seguindo sem ela.'
                                    : 'Um recurso novo da API não está disponível aqui; seguindo sem ele.');
                            }
                            return tentar();
                        }
                    }
                    var e = explicarErro(r.status, dados, t);
                    var erro = new Error(e.txt);
                    erro.fatal = e.fatal;
                    throw erro;
                });
            }, function (falha) {
                if (falha && falha.name === 'AbortError') throw falha;
                var erro = new Error('Não consegui falar com a API. Verifique a conexão — ' +
                    'e, se estiver usando um bloqueador de anúncios ou VPN, tente desligar.');
                erro.rede = true;
                throw erro;
            });
        }

        return tentar();
    }

    /* Lê o fluxo de eventos (SSE) e vai entregando o texto conforme chega. */
    function lerFluxo(resposta, eventos, cfg) {
        var leitor = resposta.body.getReader();
        var dec = new TextDecoder();
        var sobra = '';
        var texto = '';
        var uso = { entrada: 0, saida: 0, buscas: 0 };
        var modeloUsado = cfg.modelo;
        var recusa = false;
        var jsonParcial = '';
        var blocoAtual = '';

        if (eventos.onInicio) eventos.onInicio();

        function processar(linha) {
            if (linha.indexOf('data:') !== 0) return;
            var cru = linha.slice(5).trim();
            if (!cru || cru === '[DONE]') return;
            var ev;
            try { ev = JSON.parse(cru); } catch (e) { return; }

            if (ev.type === 'message_start' && ev.message) {
                modeloUsado = ev.message.model || modeloUsado;
                if (ev.message.usage) uso.entrada = ev.message.usage.input_tokens || 0;
            } else if (ev.type === 'content_block_start') {
                blocoAtual = (ev.content_block && ev.content_block.type) || '';
                jsonParcial = '';
                if (blocoAtual === 'server_tool_use') uso.buscas++;
            } else if (ev.type === 'content_block_delta' && ev.delta) {
                var d = ev.delta;
                if (d.type === 'text_delta') {
                    texto += d.text;
                    if (eventos.onTexto) eventos.onTexto(d.text, texto);
                } else if (d.type === 'thinking_delta' && eventos.onPensando) {
                    eventos.onPensando(d.thinking || '');
                } else if (d.type === 'input_json_delta') {
                    jsonParcial += d.partial_json || '';
                }
            } else if (ev.type === 'content_block_stop') {
                if (blocoAtual === 'server_tool_use' && eventos.onBusca) {
                    var consulta = '';
                    try { consulta = (JSON.parse(jsonParcial) || {}).query || ''; } catch (e) { }
                    if (consulta) eventos.onBusca(consulta);
                }
                blocoAtual = '';
            } else if (ev.type === 'message_delta') {
                if (ev.usage) uso.saida = ev.usage.output_tokens || uso.saida;
                if (ev.delta && ev.delta.stop_reason === 'refusal') recusa = true;
            } else if (ev.type === 'error') {
                var m = (ev.error && ev.error.message) || 'erro no meio da resposta';
                throw new Error('A API interrompeu a resposta: ' + m);
            }
        }

        function passo() {
            return leitor.read().then(function (r) {
                if (r.done) {
                    if (recusa && !texto.trim()) {
                        throw new Error('O modelo recusou este pedido. Se ele veio de uma ' +
                            'pergunta livre, tente reformular; se veio de um capítulo, ' +
                            'avise — isso não deveria acontecer com texto bíblico.');
                    }
                    if (!texto.trim()) throw new Error('A resposta voltou vazia. Tente de novo.');
                    var fim = { texto: texto, uso: uso, modelo: modeloUsado, custo: custo(uso, modeloUsado) };
                    if (eventos.onFim) eventos.onFim(fim);
                    return fim;
                }
                sobra += dec.decode(r.value, { stream: true });
                var partes = sobra.split('\n');
                sobra = partes.pop();
                partes.forEach(function (l) { processar(l.trim()); });
                return passo();
            });
        }

        return passo();
    }

    /* Custo aproximado em dólar. Aproximado mesmo: não conta cache nem
       as buscas na web, que são cobradas à parte. */
    function custo(uso, modelo) {
        var m = MODELOS[modelo] || MODELOS['claude-opus-5'];
        var d = (uso.entrada / 1e6) * m.preco[0] + (uso.saida / 1e6) * m.preco[1];
        return Math.round(d * 1000) / 1000;
    }

    /* Confere a chave com o pedido mais barato possível. */
    function testarChave(chave, modelo) {
        return fetch(URL_API, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-api-key': chave,
                'anthropic-version': VERSAO_API,
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: modelo || 'claude-haiku-4-5',
                max_tokens: 8,
                messages: [{ role: 'user', content: 'Responda apenas: ok' }]
            })
        }).then(function (r) {
            if (r.ok) return { ok: true };
            return r.text().then(function (t) {
                var dados = null;
                try { dados = JSON.parse(t); } catch (e) { }
                return { ok: false, erro: explicarErro(r.status, dados, t).txt };
            });
        }, function () {
            return { ok: false, erro: 'Não consegui falar com a API. Verifique a conexão.' };
        });
    }

    return {
        gerar: gerar, testarChave: testarChave, MODELOS: MODELOS, custo: custo,
        detectar: detectar, modo: modo
    };
})();
