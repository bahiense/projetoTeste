/* =========================================================
   Conversa com o Gemini, pela chave gratuita do Google AI Studio.

   Três pedidos: sortear um tema, montar o roteiro de estudo e avaliar
   a gravação. A avaliação manda o próprio áudio — o Gemini ouve a fala,
   não só lê uma transcrição, e por isso consegue julgar hesitação,
   entonação e clareza, que o reconhecimento do navegador apaga.

   Os três pedem resposta em JSON com esquema fixo, para a tela nunca
   precisar adivinhar formato.
   ========================================================= */
window.O = window.O || {};

O.ia = (function () {
    'use strict';

    var URL_GOOGLE = 'https://generativelanguage.googleapis.com/v1beta';
    var PRAZO = { texto: 70000, audio: 150000 };

    function pronto(cfg) { return !!(cfg && cfg.chaveGoogle); }

    /* ---------- erros ---------- */

    function explicarErro(status, dados, bruto) {
        var msg = (dados && dados.error && dados.error.message) || bruto || '';
        if (status === 400 && /API key not valid|API_KEY_INVALID/i.test(msg)) {
            return 'Chave recusada pelo Google. Confira se você copiou a chave inteira.';
        }
        if (/prepay|credits? (are )?depleted|billing/i.test(msg)) {
            return 'Os créditos dessa chave acabaram. Use uma chave gratuita do Google AI Studio.';
        }
        if (status === 403) return 'O Google recusou o acesso a este modelo com essa chave. Escolha outro modelo em Ajustes.';
        if (status === 404) return 'Esse modelo não existe mais. Escolha outro em Ajustes.';
        if (status === 429) {
            return 'Você bateu o limite gratuito do Gemini por agora (ele conta por minuto e ' +
                'por dia). Espere um pouco ou escolha um modelo Flash-Lite em Ajustes.';
        }
        if (status >= 500) return 'Erro no servidor do Google (' + status + '). Tente de novo.';
        return msg ? ('O Google recusou o pedido: ' + msg) : ('Erro ' + status + ' na chamada.');
    }

    /* ---------- modelos ---------- */

    function listarModelos(chave) {
        return fetch(URL_GOOGLE + '/models?pageSize=200', {
            headers: { 'x-goog-api-key': chave }
        }).then(function (r) {
            if (!r.ok) {
                return r.text().then(function (t) {
                    var d = null;
                    try { d = JSON.parse(t); } catch (e) { }
                    throw new Error(explicarErro(r.status, d, t));
                });
            }
            return r.json();
        }).then(function (d) {
            return (d.models || []).filter(function (m) {
                var metodos = m.supportedGenerationMethods || [];
                return metodos.indexOf('generateContent') >= 0 &&
                    /gemini/.test(m.name || '') &&
                    !/embedding|aqa|image|tts|live|native-audio/.test(m.name || '');
            }).map(function (m) {
                return {
                    id: String(m.name).replace(/^models\//, ''),
                    nome: m.displayName || String(m.name).replace(/^models\//, '')
                };
            }).sort(function (a, b) {
                return posto(a.id) - posto(b.id) || b.id.localeCompare(a.id);
            });

            /* Flash primeiro: ouve áudio bem e cabe na camada gratuita. */
            function posto(id) {
                if (/flash-latest$/.test(id)) return 0;
                if (/flash/.test(id) && !/lite/.test(id)) return 1;
                if (/flash/.test(id)) return 2;
                return 3;
            }
        });
    }

    /* ---------- chamada base ---------- */

    function chamar(partes, sistema, esquema, cfg, prazo, sinal) {
        if (!pronto(cfg)) return Promise.reject(new Error('Falta a chave gratuita do Gemini. Configure em Ajustes.'));
        var modelo = cfg.modeloGoogle || 'gemini-flash-latest';
        var corpo = {
            system_instruction: { parts: [{ text: sistema }] },
            contents: [{ role: 'user', parts: partes }],
            generationConfig: {
                /* Os Flash atuais "pensam" e o pensamento sai deste mesmo
                   teto; com pouco, a resposta volta vazia. */
                maxOutputTokens: 16384,
                temperature: 0.8,
                responseMimeType: 'application/json',
                responseSchema: esquema
            }
        };

        var ctrl = new AbortController();
        var travou = false;
        var relogio = setTimeout(function () { travou = true; ctrl.abort(); }, prazo);
        if (sinal) sinal.addEventListener('abort', function () { ctrl.abort(); });

        return fetch(URL_GOOGLE + '/models/' + encodeURIComponent(modelo) + ':generateContent', {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-goog-api-key': cfg.chaveGoogle },
            body: JSON.stringify(corpo),
            signal: ctrl.signal
        }).then(function (r) {
            return r.text().then(function (t) {
                var d = null;
                try { d = JSON.parse(t); } catch (e) { }
                if (!r.ok) throw new Error(explicarErro(r.status, d, t));
                return d;
            });
        }, function (falha) {
            if (travou) throw new Error('O Gemini não respondeu a tempo. Tente de novo.');
            if (falha && falha.name === 'AbortError') throw falha;
            throw new Error('Não consegui falar com o Google. Verifique a conexão.');
        }).then(function (d) {
            clearTimeout(relogio);
            if (d && d.promptFeedback && d.promptFeedback.blockReason) {
                throw new Error('O Google bloqueou o pedido (' + d.promptFeedback.blockReason + ').');
            }
            var c = d && d.candidates && d.candidates[0];
            var texto = ((c && c.content && c.content.parts) || []).map(function (p) {
                return p.thought ? '' : (p.text || '');
            }).join('');
            if (!texto.trim()) {
                throw new Error(c && c.finishReason === 'MAX_TOKENS'
                    ? 'O modelo gastou todo o limite pensando. Tente de novo ou troque de modelo.'
                    : 'A resposta do Gemini voltou vazia. Tente de novo.');
            }
            return lerJSON(texto);
        }, function (e) {
            clearTimeout(relogio);
            throw e;
        });
    }

    /* Mesmo pedindo JSON, às vezes vem cercado de ```json. */
    function lerJSON(texto) {
        var t = String(texto).trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
        try { return JSON.parse(t); } catch (e) { }
        var i = t.indexOf('{'), f = t.lastIndexOf('}');
        if (i >= 0 && f > i) {
            try { return JSON.parse(t.slice(i, f + 1)); } catch (e) { }
        }
        throw new Error('O Gemini respondeu num formato que o app não entendeu. Tente de novo.');
    }

    /* ---------- esquemas ---------- */

    var S = 'STRING', N = 'NUMBER', OBJ = 'OBJECT', ARR = 'ARRAY', BOOL = 'BOOLEAN';
    function obj(props, req) { return { type: OBJ, properties: props, required: req || Object.keys(props) }; }
    function lista(item) { return { type: ARR, items: item }; }

    var ESQ_TEMA = obj({
        titulo: { type: S }, objetivo: { type: S }, pontos: lista({ type: S })
    });

    var ESQ_ROTEIRO = obj({
        titulo: { type: S },
        objetivo: { type: S },
        pontos: lista(obj({ titulo: { type: S }, explicacao: { type: S } })),
        estrutura: lista(obj({ parte: { type: S }, tempo: { type: S }, texto: { type: S } })),
        dicas: lista({ type: S }),
        estrategia: lista({ type: S })
    });

    var ESQ_AVALIACAO = obj({
        transcricao: { type: S },
        nota: { type: N },
        resumo: { type: S },
        fortes: lista({ type: S }),
        melhorar: lista(obj({ titulo: { type: S }, texto: { type: S } })),
        vicios: lista(obj({ termo: { type: S }, vezes: { type: N } })),
        cobertura: lista(obj({ ponto: { type: S }, coberto: { type: BOOL } })),
        foco: { type: S },
        falado: { type: S }
    });

    var NOMES_NIVEL = { iniciante: 'iniciante', intermediario: 'intermediário', avancado: 'avançado' };

    var SISTEMA = 'Você é um mentor de oratória brasileiro, experiente, direto e encorajador. ' +
        'Escreve sempre em português do Brasil, com frases claras e práticas, sem jargão.';

    /* ---------- pedidos ---------- */

    function sortearTema(nivel, jaFeitos, cfg) {
        var evitar = (jaFeitos || []).slice(-30);
        var pedido = 'Crie UM tema inédito para um treino de oratória de nível ' +
            NOMES_NIVEL[nivel] + '. ' +
            (nivel === 'iniciante' ? 'Assunto pessoal ou do dia a dia, fácil de falar sem preparo técnico.'
                : nivel === 'avancado' ? 'Assunto que exija tomar posição e argumentar, ou uma situação profissional exigente (pitch, defesa de projeto, debate).'
                    : 'Assunto de trabalho, carreira ou sociedade, que peça explicação organizada.') +
            ' Varie bastante de área. Dê um título curto, um objetivo de uma frase dizendo o que a ' +
            'pessoa deve conseguir explicar, e de 3 a 4 pontos-chave curtos.' +
            (evitar.length ? '\n\nNão repita nem se aproxime destes temas já treinados: ' + evitar.join('; ') + '.' : '');
        return chamar([{ text: pedido }], SISTEMA, ESQ_TEMA, cfg, PRAZO.texto).then(function (t) {
            return { titulo: t.titulo, objetivo: t.objetivo, pontos: t.pontos || [], nivel: nivel, origem: 'ia' };
        });
    }

    function criarRoteiro(tema, minutos, contexto, cfg) {
        var pedido = 'Monte o roteiro de estudo para eu treinar esta fala.\n\n' +
            'Tema: ' + tema.titulo + '\n' +
            (tema.objetivo ? 'Objetivo: ' + tema.objetivo + '\n' : '') +
            (tema.pontos && tema.pontos.length ? 'Pontos sugeridos: ' + tema.pontos.join('; ') + '\n' : '') +
            (contexto ? 'Situação real em que vou falar: ' + contexto + '\n' : '') +
            'Nível: ' + NOMES_NIVEL[tema.nivel || 'intermediario'] + '\n' +
            'Tempo máximo: ' + minutos + ' minuto' + (minutos > 1 ? 's' : '') + '\n\n' +
            'Devolva:\n' +
            '- objetivo: uma frase do que a fala deve conseguir;\n' +
            '- pontos: 3 a 5 pontos-chave, cada um com título curto e explicação de 1 a 2 frases ' +
            'com o conteúdo que devo dizer (fatos, exemplos);\n' +
            '- estrutura: abertura, desenvolvimento e fechamento, com o tempo aproximado de cada ' +
            'parte e o que dizer nela (inclua uma sugestão concreta de frase de abertura);\n' +
            '- dicas: 3 a 5 dicas práticas de entrega (voz, pausas, gestos, olhar) para ESTE tema;\n' +
            '- estrategia: 4 a 5 passos de como estudar e ensaiar até me sentir seguro.';
        return chamar([{ text: pedido }], SISTEMA, ESQ_ROTEIRO, cfg, PRAZO.texto).then(function (r) {
            r.titulo = r.titulo || tema.titulo;
            r.origem = 'ia';
            return r;
        });
    }

    function avaliar(audio, tema, roteiro, segundos, minutos, cfg, sinal) {
        var pontos = ((roteiro && roteiro.pontos) || []).map(function (p) {
            return typeof p === 'string' ? p : p.titulo;
        });
        var pedido = 'Ouça minha apresentação e avalie como meu mentor de oratória.\n\n' +
            'Tema: ' + tema.titulo + '\n' +
            (roteiro && roteiro.objetivo ? 'Objetivo: ' + roteiro.objetivo + '\n' : '') +
            'Pontos-chave do roteiro: ' + (pontos.join('; ') || '(livre)') + '\n' +
            'Nível: ' + NOMES_NIVEL[tema.nivel || 'intermediario'] + '\n' +
            'Duração da gravação: ' + Math.round(segundos) + ' segundos (máximo combinado: ' +
            minutos * 60 + ' segundos)\n\n' +
            'Devolva:\n' +
            '- transcricao: a transcrição LITERAL, mantendo hesitações ("éé", "ããn"), repetições ' +
            'e muletas ("né", "tipo", "então") exatamente como foram ditas;\n' +
            '- nota: de 0 a 10, com uma casa decimal, considerando clareza, estrutura, domínio do ' +
            'conteúdo, fluência, vícios, ritmo, entonação e fechamento. Seja justo: 7 é uma fala ' +
            'boa com pontos a ajustar, 9 ou mais só para fala realmente excelente. Se não houver ' +
            'fala audível, dê 0 e diga isso no resumo;\n' +
            '- resumo: 3 a 5 frases com a impressão geral, falando diretamente comigo ("você");\n' +
            '- fortes: 3 a 5 pontos fortes específicos, citando trechos;\n' +
            '- melhorar: 3 a 6 itens, cada um com um título (ex.: "Abertura e clareza", ' +
            '"Estrutura", "Conclusão", "Entonação") e um texto que diga o problema, cite o trecho ' +
            'e sugira concretamente como dizer melhor;\n' +
            '- vicios: cada vício de linguagem e hesitação ouvido, com quantas vezes apareceu ' +
            '(lista vazia se não houver);\n' +
            '- cobertura: para cada ponto-chave do roteiro, se foi coberto na fala;\n' +
            '- foco: a UMA coisa mais importante para eu treinar na próxima vez;\n' +
            '- falado: um feedback de 60 a 90 segundos para ser LIDO EM VOZ ALTA para mim, como um ' +
            'mentor falando comigo depois da apresentação: comece pela nota, elogie o que funcionou, ' +
            'explique as 2 ou 3 melhorias principais e termine com encorajamento. Texto corrido, ' +
            'sem listas, sem símbolos, sem markdown.';
        var partes = [
            { inline_data: { mime_type: audio.tipo, data: audio.base64 } },
            { text: pedido }
        ];
        return chamar(partes, SISTEMA, ESQ_AVALIACAO, cfg, PRAZO.audio, sinal).then(function (a) {
            a.nota = typeof a.nota === 'number' ? Math.max(0, Math.min(10, Math.round(a.nota * 10) / 10)) : null;
            a.origem = 'ia';
            return a;
        });
    }

    /* Listar modelos responde até em chave que o faturamento barra; só
       gerar prova que a chave serve. O pedido é mínimo. */
    function testarChave(chave) {
        return listarModelos(chave).then(function (modelos) {
            if (!modelos.length) return { ok: false, erro: 'A chave funcionou, mas nenhum modelo veio na lista.' };
            var cfg = { chaveGoogle: chave, modeloGoogle: modelos[0].id };
            return chamar([{ text: 'Responda {"ok": true}' }], 'Responda só o JSON pedido.',
                obj({ ok: { type: BOOL } }), cfg, PRAZO.texto).then(function () {
                return { ok: true, modelos: modelos };
            }, function (e) {
                if (/limite gratuito/.test(e.message)) {
                    return { ok: true, modelos: modelos, aviso: 'Chave válida, mas a cota gratuita está esgotada agora.' };
                }
                return { ok: false, erro: e.message };
            });
        }, function (e) {
            return { ok: false, erro: e.message };
        });
    }

    return {
        pronto: pronto, listarModelos: listarModelos, testarChave: testarChave,
        sortearTema: sortearTema, criarRoteiro: criarRoteiro, avaliar: avaliar, lerJSON: lerJSON
    };
})();
