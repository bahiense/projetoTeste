/* =========================================================
   Conversa com a IA. Só por caminhos gratuitos.

   1. DENTRO DO CLAUDE (a versão publicada como artifact): a própria
      página pede o estudo ao Claude, sem chave nenhuma. Quem paga é o
      plano do Claude de quem está lendo.

   2. FORA DELE (o APK e o site instalado): a chave gratuita do Google
      AI Studio. Ela não pede cartão, tem limite por minuto e por dia, e
      — o que importa para um app sem servidor — a API do Google aceita
      chamada vinda direto do navegador.

   O resto do app não sabe em qual dos dois está: chama B.ia.gerar() e
   recebe o texto pedaço por pedaço do mesmo jeito.

   Nenhum dos dois caminhos tem busca na web. Por isso o prompt é montado
   sem prometer citação conferida: dizer que conferiu sem ter conferido
   seria pior do que não conferir.
   ========================================================= */
window.B = window.B || {};

B.ia = (function () {
    'use strict';

    /* ---------- qual motor está disponível ---------- */

    var motor = 'google';     // 'claude' quando a página roda dentro do Claude
    var claudeSample = null;
    var deteccao = null;

    function detectar() {
        if (deteccao) return deteccao;
        if (!window.claude || typeof window.claude.use !== 'function') {
            deteccao = Promise.resolve('google');
            return deteccao;
        }
        /* use() pode demorar (até dez segundos) e devolver null quando a
           página não tem a capacidade: nesse caso é a chave que vale. */
        deteccao = Promise.resolve(window.claude.use('sample')).then(function (s) {
            claudeSample = s || null;
            motor = s ? 'claude' : 'google';
            return motor;
        }, function () { return 'google'; });
        return deteccao;
    }

    function modo() { return motor; }

    /* Tem como gerar estudo agora? A tela usa isto para decidir entre o
       botão e o aviso de configuração. */
    function pronto(cfg) {
        return motor === 'claude' || !!cfg.chaveGoogle;
    }

    /* ---------- Claude, de dentro da própria página ---------- */

    function viaClaude(pedido, cfg, eventos, sinal) {
        if (eventos.onInicio) eventos.onInicio();
        var opcoes = {
            modelTier: pedido.tipo === 'pergunta' || pedido.simples ? 'default' : 'complex',
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
            throw e;
        });
    }

    /* ---------- Google Gemini (camada gratuita) ---------- */

    var URL_GOOGLE = 'https://generativelanguage.googleapis.com/v1beta';

    /* A lista de modelos do Gemini muda com frequência, e um identificador
       fixo aqui envelheceria em semanas. Por isso o app pergunta à própria
       API quais existem para aquela chave. */
    function listarModelosGoogle(chave) {
        return fetch(URL_GOOGLE + '/models?pageSize=200', {
            headers: { 'x-goog-api-key': chave }
        }).then(function (r) {
            if (!r.ok) {
                return r.text().then(function (t) {
                    var d = null;
                    try { d = JSON.parse(t); } catch (e) { }
                    throw new Error(explicarErroGoogle(r.status, d, t));
                });
            }
            return r.json();
        }).then(function (d) {
            return (d.models || []).filter(function (m) {
                var metodos = m.supportedGenerationMethods || m.supportedActions || [];
                return metodos.indexOf('generateContent') >= 0 &&
                    /gemini/.test(m.name || '') &&
                    !/embedding|aqa|image|tts|audio|live|vision-only/.test(m.name || '');
            }).map(function (m) {
                return {
                    id: String(m.name).replace(/^models\//, ''),
                    nome: m.displayName || String(m.name).replace(/^models\//, ''),
                    limiteSaida: m.outputTokenLimit || 8192
                };
            }).sort(function (a, b) {
                /* O Flash cheio primeiro: é o que a camada gratuita serve com
                   qualidade suficiente para um estudo longo. O Flash-Lite vem
                   depois — tem limite diário maior, mas escreve mais raso, e
                   um estudo raso é justamente o que este app não quer. */
                return posto(a.id) - posto(b.id) || b.id.localeCompare(a.id);
            });

            function posto(id) {
                if (/flash/.test(id) && !/lite/.test(id)) return 0;
                if (/flash/.test(id)) return 1;
                return 2;
            }
        });
    }

    function explicarErroGoogle(status, dados, bruto) {
        var msg = (dados && dados.error && dados.error.message) || bruto || '';
        if (status === 400 && /API key not valid|API_KEY_INVALID/i.test(msg)) {
            return 'Chave recusada pelo Google. Confira se você copiou a chave inteira do ' +
                'Google AI Studio.';
        }
        if (status === 403) {
            return 'O Google recusou o acesso a este modelo com essa chave. Escolha outro ' +
                'modelo em Ajustes.';
        }
        if (status === 429) {
            var q = detalharQuota(dados);
            if (q.porDia) {
                return 'Acabou a cota gratuita do Gemini de hoje' +
                    (q.valor ? ' (' + q.valor + ' pedidos por dia neste modelo)' : '') +
                    '. Ela volta na virada do dia no fuso do Pacífico — umas 4h ou 5h da manhã ' +
                    'aqui. Um modelo Flash-Lite costuma ter cota maior.';
            }
            if (q.porMinuto) {
                return 'Você passou do limite por minuto do Gemini. Espere ' +
                    (q.esperar ? q.esperar + ' segundos' : 'um pouco') + ' e tente de novo.';
            }
            return 'Você bateu o limite gratuito do Gemini por agora (ele conta por minuto ' +
                'e por dia). Espere um pouco, escolha um modelo Flash-Lite, que tem limite ' +
                'maior, ou gere um estudo simples, que gasta bem menos.';
        }
        if (status >= 500) return 'Erro no servidor do Google (' + status + '). Tente de novo.';
        return msg ? ('O Google recusou o pedido: ' + msg) : ('Erro ' + status + ' na chamada.');
    }

    /**
     * O que o Google diz junto com um 429.
     *
     * Importa porque "esperar meio minuto" e "voltar amanhã" são coisas muito
     * diferentes, e só o corpo do erro distingue as duas. De quebra, o Google
     * manda ali o valor da cota — que ele não publica mais em documentação
     * nenhuma. É a única medida confiável do limite: a do próprio dono da chave.
     */
    function detalharQuota(dados) {
        var r = { porDia: false, porMinuto: false, valor: null, esperar: 0 };
        var det = (dados && dados.error && dados.error.details) || [];
        det.forEach(function (d) {
            var tipo = d['@type'] || '';
            if (/QuotaFailure/.test(tipo)) {
                (d.violations || []).forEach(function (v) {
                    var id = (v.quotaId || '') + ' ' + (v.quotaMetric || '');
                    if (/PerDay|per_day/i.test(id)) {
                        r.porDia = true;
                        if (v.quotaValue) r.valor = Number(v.quotaValue) || null;
                    } else if (/PerMinute|per_minute/i.test(id)) {
                        r.porMinuto = true;
                    }
                });
            }
            if (/RetryInfo/.test(tipo) && d.retryDelay) {
                r.esperar = Math.ceil(parseFloat(String(d.retryDelay).replace('s', '')) || 0);
            }
        });
        /* Sem detalhe nenhum, o mais provável num uso normal é o limite por
           minuto — e tratá-lo como "acabou o dia" pararia o mutirão à toa. */
        if (!r.porDia && !r.porMinuto) r.porMinuto = true;
        return r;
    }

    function viaGemini(pedido, cfg, eventos, sinal) {
        var modelo = cfg.modeloGoogle || 'gemini-flash-latest';
        var limite = Math.min(32768, cfg.limiteGoogle || 8192);

        var corpo = {
            system_instruction: { parts: [{ text: pedido.sistema }] },
            contents: [{ role: 'user', parts: [{ text: pedido.usuario }] }],
            generationConfig: { maxOutputTokens: limite }
        };

        if (eventos.onInicio) eventos.onInicio();

        return fetch(URL_GOOGLE + '/models/' + encodeURIComponent(modelo) +
            ':streamGenerateContent?alt=sse', {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-goog-api-key': cfg.chaveGoogle },
            body: JSON.stringify(corpo),
            signal: sinal
        }).then(function (r) {
            if (r.ok) return lerFluxoGoogle(r, eventos, modelo);
            return r.text().then(function (t) {
                var d = null;
                try { d = JSON.parse(t); } catch (e) { }
                var erro = new Error(explicarErroGoogle(r.status, d, t));
                erro.fatal = r.status === 400 || r.status === 403;
                erro.status = r.status;
                if (r.status === 429) erro.quota = detalharQuota(d);
                throw erro;
            });
        }, function (falha) {
            if (falha && falha.name === 'AbortError') throw falha;
            var e = new Error('Não consegui falar com o Google. Verifique a conexão.');
            e.rede = true;
            throw e;
        });
    }

    function lerFluxoGoogle(resposta, eventos, modelo) {
        var leitor = resposta.body.getReader();
        var dec = new TextDecoder();
        var sobra = '', texto = '', motivo = '';
        var uso = { entrada: 0, saida: 0, buscas: 0 };

        function processar(linha) {
            if (linha.indexOf('data:') !== 0) return;
            var cru = linha.slice(5).trim();
            if (!cru) return;
            var ev;
            try { ev = JSON.parse(cru); } catch (e) { return; }

            if (ev.usageMetadata) {
                uso.entrada = ev.usageMetadata.promptTokenCount || uso.entrada;
                uso.saida = ev.usageMetadata.candidatesTokenCount || uso.saida;
            }
            if (ev.promptFeedback && ev.promptFeedback.blockReason) {
                throw new Error('O Google bloqueou o pedido (' +
                    ev.promptFeedback.blockReason + ').');
            }
            var c = (ev.candidates || [])[0];
            if (!c) return;
            if (c.finishReason) motivo = c.finishReason;
            var partes = (c.content && c.content.parts) || [];
            partes.forEach(function (parte) {
                if (typeof parte.text !== 'string' || !parte.text) return;
                texto += parte.text;
                if (eventos.onTexto) eventos.onTexto(parte.text, texto);
            });
        }

        function passo() {
            return leitor.read().then(function (r) {
                if (r.done) {
                    if (!texto.trim()) {
                        throw new Error(motivo === 'SAFETY'
                            ? 'O Gemini recusou este texto por filtro de conteúdo. Tente outro ' +
                            'capítulo ou troque de modelo em Ajustes.'
                            : 'A resposta voltou vazia. Tente de novo.');
                    }
                    if (motivo === 'MAX_TOKENS' && eventos.onAviso) {
                        eventos.onAviso('O modelo chegou ao limite de tamanho e o texto pode ' +
                            'ter ficado cortado no fim.');
                    }
                    var fim = { texto: texto, uso: uso, modelo: modelo, custo: 0 };
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

    function testarChaveGoogle(chave) {
        return listarModelosGoogle(chave).then(function (modelos) {
            if (!modelos.length) {
                return {
                    ok: false, erro: 'A chave funcionou, mas nenhum modelo de texto veio na ' +
                        'lista. Confira no Google AI Studio se a API está ativada.'
                };
            }
            return { ok: true, modelos: modelos };
        }, function (err) {
            return { ok: false, erro: err.message };
        });
    }

    /* ---------- porta de entrada ---------- */

    function gerar(pedido, cfg, eventos, sinal) {
        if (motor === 'claude' && claudeSample) return viaClaude(pedido, cfg, eventos, sinal);
        if (!cfg.chaveGoogle) {
            return Promise.reject(new Error('Falta a chave gratuita do Google. Configure em Ajustes.'));
        }
        return viaGemini(pedido, cfg, eventos, sinal);
    }

    return {
        gerar: gerar, detectar: detectar, modo: modo, pronto: pronto,
        listarModelosGoogle: listarModelosGoogle, testarChaveGoogle: testarChaveGoogle,
        detalharQuota: detalharQuota
    };
})();
