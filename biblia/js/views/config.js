/* =========================================================
   TELA AJUSTES — a chave da API e o feitio do estudo.

   A parte da chave é escrita com todas as letras: onde ela fica,
   quem pode ver, quanto custa. Pedir a chave de alguém sem explicar
   isso seria abuso de confiança.
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.config = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, store = B.store;

    function opcoes(mapa, atual) {
        return Object.keys(mapa).map(function (k) {
            return '<option value="' + k + '"' + (k === atual ? ' selected' : '') + '>' +
                esc(mapa[k]) + '</option>';
        }).join('');
    }

    function render() {
        var c = store.get().config;
        var temChave = !!c.chave;
        var peloClaude = B.ia.modo() === 'claude';

        return '' +
            '<header class="tela-topo"><h2>Ajustes</h2></header>' +

            (peloClaude
                ? '<section class="cartao">' +
                '<h3>A IA já está ligada</h3>' +
                '<p class="dica">Esta versão roda dentro do Claude: os estudos são escritos ' +
                'por ele, pelo seu próprio plano. <b>Não é preciso chave de API nenhuma</b> — ' +
                'a seção abaixo só interessa se você também usa o app instalado no celular, ' +
                'onde não existe login do Claude para a página aproveitar.</p>' +
                '</section>'
                : '') +

            '<section class="cartao">' +
            '<h3>Quem escreve os estudos' + (peloClaude ? ' (opcional aqui)' : '') + '</h3>' +
            '<p class="dica">O app não tem servidor: ele fala direto com a IA usando ' +
            '<b>a sua chave</b>. Escolha de quem é a chave.</p>' +

            '<div class="escolha">' +
            '<label class="opcao' + (c.provedor === 'google' ? '' : ' is-on') + '">' +
            '<input type="radio" name="provedor" value="anthropic"' +
            (c.provedor === 'google' ? '' : ' checked') + '>' +
            '<span><b>Claude (Anthropic)</b><small>Melhor qualidade nos estudos e busca na ' +
            'web para conferir citações. Paga por uso, uns poucos centavos de dólar por ' +
            'estudo.</small></span></label>' +
            '<label class="opcao' + (c.provedor === 'google' ? ' is-on' : '') + '">' +
            '<input type="radio" name="provedor" value="google"' +
            (c.provedor === 'google' ? ' checked' : '') + '>' +
            '<span><b>Google Gemini — tem camada grátis</b><small>Chave sem cartão de ' +
            'crédito, com limite por minuto e por dia. Sem busca na web, e no plano ' +
            'gratuito o Google pode usar o que você manda para treinar os modelos dele.' +
            '</small></span></label>' +
            '</div>' +
            '</section>' +

            '<section class="cartao" id="bloco-google"' + (c.provedor === 'google' ? '' : ' hidden') + '>' +
            '<h3>Chave do Google Gemini</h3>' +
            '<label class="rotulo" for="chave-google">Chave (começa com AIza)</label>' +
            '<div class="campo-linha">' +
            '<input class="campo" id="chave-google" type="password" autocomplete="off" ' +
            'spellcheck="false" placeholder="AIza..." value="' + esc(c.chaveGoogle) + '">' +
            '<button class="btn btn--fraco btn--icone" id="ver-google" aria-label="Mostrar">👁</button>' +
            '</div>' +
            '<button class="btn btn--forte btn--largo" id="salvar-google">Salvar e buscar modelos</button>' +
            '<div id="teste-google"></div>' +
            '<div id="modelos-google">' +
            (c.modeloGoogle
                ? '<p class="dica">Modelo em uso: <b>' + esc(c.modeloGoogle) + '</b></p>'
                : '') +
            '</div>' +

            '<details class="detalhe">' +
            '<summary>Como pegar a chave grátis</summary>' +
            '<ol class="lista-num">' +
            '<li>Entre em <a href="https://aistudio.google.com/apikey" target="_blank" ' +
            'rel="noopener">aistudio.google.com/apikey</a> com sua conta Google.</li>' +
            '<li>Toque em <b>Create API key</b>. Não pede cartão.</li>' +
            '<li>Copie e cole aqui.</li>' +
            '</ol>' +
            '<p>Os limites do plano gratuito são por minuto e por dia e mudam de tempos em ' +
            'tempos; hoje ficam na casa de 10 a 15 pedidos por minuto e algumas centenas por ' +
            'dia, conforme o modelo. Para um punhado de estudos por dia, sobra.</p>' +
            '<p>O preço do "grátis" é a privacidade: no plano gratuito o Google diz que pode ' +
            'usar o conteúdo para melhorar os modelos. Como aqui o conteúdo é o pedido de ' +
            'estudo de um capítulo da Bíblia, talvez isso não te incomode — mas é justo você ' +
            'saber antes.</p>' +
            '</details>' +
            '</section>' +

            '<section class="cartao" id="bloco-anthropic"' + (c.provedor === 'google' ? ' hidden' : '') + '>' +
            '<h3>Chave da Anthropic</h3>' +
            '<p class="dica">Você paga o que usar, por estudo gerado — não há assinatura.</p>' +

            '<label class="rotulo" for="chave">Chave (começa com sk-ant-)</label>' +
            '<div class="campo-linha">' +
            '<input class="campo" id="chave" type="password" autocomplete="off" ' +
            'spellcheck="false" placeholder="sk-ant-..." value="' + esc(c.chave) + '">' +
            '<button class="btn btn--fraco btn--icone" id="ver-chave" aria-label="Mostrar">👁</button>' +
            '</div>' +
            '<div class="linha-botoes">' +
            '<button class="btn btn--forte" id="salvar-chave">Salvar e testar</button>' +
            (temChave ? '<button class="btn btn--fraco btn--perigo" id="apagar-chave">Apagar chave</button>' : '') +
            '</div>' +
            '<div id="teste-chave"></div>' +

            '<details class="detalhe">' +
            '<summary>Como conseguir a chave</summary>' +
            '<ol class="lista-num">' +
            '<li>Entre em <a href="https://console.anthropic.com" target="_blank" rel="noopener">' +
            'console.anthropic.com</a> e crie a conta.</li>' +
            '<li>Em <b>Billing</b>, coloque um crédito inicial (US$ 5 já dá para dezenas de estudos).</li>' +
            '<li>Em <b>API keys</b>, crie uma chave e copie.</li>' +
            '<li>Cole aqui. Fim.</li>' +
            '</ol>' +
            '</details>' +

            '<details class="detalhe">' +
            '<summary>Onde essa chave fica guardada</summary>' +
            '<p>No armazenamento deste navegador, neste aparelho. Ela não vai para servidor ' +
            'nenhum meu — não existe servidor meu — e só é enviada para ' +
            '<code>api.anthropic.com</code> na hora de gerar um estudo.</p>' +
            '<p>O lado honesto disso: quem pegar o seu celular destravado e abrir os ajustes ' +
            'consegue ver a chave. Se isso te preocupar, crie uma chave separada só para o ' +
            'app e ponha um limite de gasto nela no console — dá para revogar a qualquer ' +
            'momento sem mexer no resto.</p>' +
            '<p>O backup que o app exporta <b>não</b> inclui a chave, de propósito.</p>' +
            '</details>' +
            '</section>' +

            '<section class="cartao">' +
            '<h3>Como o estudo é escrito</h3>' +

            '<div id="bloco-modelo"' + (c.provedor === 'google' ? ' hidden' : '') + '>' +
            '<label class="rotulo" for="modelo">Modelo</label>' +
            '<select class="campo" id="modelo">' +
            Object.keys(B.ia.MODELOS).map(function (k) {
                return '<option value="' + k + '"' + (k === c.modelo ? ' selected' : '') + '>' +
                    esc(B.ia.MODELOS[k].nome) + '</option>';
            }).join('') + '</select>' +
            '<p class="dica" id="modelo-desc">' + esc((B.ia.MODELOS[c.modelo] || {}).desc || '') + '</p>' +
            '</div>' +

            '<label class="rotulo" for="tamanho">Tamanho do estudo</label>' +
            '<select class="campo" id="tamanho">' +
            opcoes({
                essencial: 'Essencial — 900 a 1.300 palavras',
                completo: 'Completo — 2.200 a 3.200 palavras',
                profundo: 'Profundo — 4.000 palavras ou mais'
            }, c.tamanho) + '</select>' +

            '<label class="rotulo" for="tradicao">Tradição teológica</label>' +
            '<select class="campo" id="tradicao">' +
            opcoes({
                equilibrada: 'Equilibrada — mostra as tradições lado a lado',
                reformada: 'Reformada / calvinista',
                arminiana: 'Arminiana / wesleyana',
                catolica: 'Católica',
                historica: 'Histórico-crítica / acadêmica'
            }, c.tradicao) + '</select>' +
            '<p class="dica">Seja qual for a escolha, o estudo continua obrigado a mostrar ' +
            'onde os intérpretes discordam. O viés fica explícito, não escondido.</p>' +

            '<label class="rotulo" for="versao">Tradução citada</label>' +
            '<select class="campo" id="versao">' +
            opcoes({
                ARA: 'Almeida Revista e Atualizada (ARA)',
                ACF: 'Almeida Corrigida Fiel (ACF)',
                NVI: 'Nova Versão Internacional (NVI)',
                NAA: 'Nova Almeida Atualizada (NAA)',
                NVT: 'Nova Versão Transformadora (NVT)'
            }, c.versao) + '</select>' +

            '<div id="bloco-anthropic-extras"' + (c.provedor === 'google' ? ' hidden' : '') + '>' +
            '<label class="chave-liga">' +
            '<input type="checkbox" id="busca"' + (c.buscaWeb ? ' checked' : '') + '>' +
            '<span><b>Buscar na web</b><small>Deixa o modelo conferir citações de teólogos e ' +
            'dados históricos antes de escrever. Melhora muito a confiabilidade e acrescenta ' +
            'alguns centavos por estudo.</small></span>' +
            '</label>' +

            '<label class="chave-liga">' +
            '<input type="checkbox" id="esforco"' + (c.esforco === 'max' ? ' checked' : '') + '>' +
            '<span><b>Pensar ao máximo</b><small>O modelo raciocina mais antes de escrever. ' +
            'Melhor nos textos difíceis; mais lento e mais caro.</small></span>' +
            '</label>' +
            '</div>' +
            '</section>' +

            '<section class="cartao">' +
            '<h3>Instalar no celular</h3>' +
            '<p class="dica">No Chrome do Android: menu ⋮ → <b>Adicionar à tela inicial</b>. ' +
            'No iPhone, no Safari: botão de compartilhar → <b>Adicionar à Tela de Início</b>. ' +
            'Depois disso o app abre como qualquer outro, em tela cheia, e a leitura ' +
            'funciona sem internet (só gerar estudo novo precisa de rede).</p>' +
            '<button class="btn btn--forte btn--largo" id="instalar" hidden>Instalar agora</button>' +
            '</section>' +

            '<section class="cartao">' +
            '<h3>Sobre</h3>' +
            '<p class="dica">Plano de leitura em oito frentes paralelas: um capítulo por dia ' +
            'de cada grupo fecha a Bíblia inteira, com narrativa, poesia, profecia e carta ' +
            'andando juntas. Tudo fica no aparelho; nada é enviado para lugar nenhum, ' +
            'a não ser o pedido de estudo, que vai direto para o provedor que você ' +
            'escolheu ali em cima — sem servidor meu no meio.</p>' +
            '<p class="dica dica--honesta">Os estudos são escritos por IA e erram, ' +
            'principalmente em citação de teólogo, data e número. Trate-os como um bom ' +
            'ponto de partida — nunca como autoridade final.</p>' +
            '</section>';
    }

    function depois(el) {
        var c = store.get().config;

        /* Trocar de provedor mostra e esconde os blocos sem repintar a tela,
           para não perder o que a pessoa já digitou no campo da chave. */
        ui.qq('input[name="provedor"]', el).forEach(function (r) {
            r.addEventListener('change', function () {
                if (!r.checked) return;
                var google = r.value === 'google';
                store.setConfig('provedor', r.value);
                ui.$('bloco-google').hidden = !google;
                ui.$('bloco-anthropic').hidden = google;
                ui.$('bloco-modelo').hidden = google;
                ui.$('bloco-anthropic-extras').hidden = google;
                ui.qq('.opcao', el).forEach(function (o) {
                    o.classList.toggle('is-on', o.contains(r) === google ? google : !google);
                });
                ui.toast(google ? 'Usando o Gemini do Google.' : 'Usando o Claude da Anthropic.');
            });
        });

        ui.$('ver-google').addEventListener('click', function () {
            var i = ui.$('chave-google');
            i.type = i.type === 'password' ? 'text' : 'password';
        });

        ui.$('salvar-google').addEventListener('click', function () {
            var v = (ui.$('chave-google').value || '').trim();
            var caixa = ui.$('teste-google');
            if (!v) {
                store.setConfig('chaveGoogle', '');
                caixa.innerHTML = '<p class="aviso">Chave apagada.</p>';
                return;
            }
            caixa.innerHTML = '<p class="carregando">Testando a chave e buscando os modelos…</p>';
            B.ia.testarChaveGoogle(v).then(function (r) {
                if (!r.ok) {
                    caixa.innerHTML = '<p class="aviso aviso--erro">' + esc(r.erro) + '</p>';
                    return;
                }
                store.setConfig('chaveGoogle', v);
                caixa.innerHTML = '<p class="aviso aviso--ok">Chave funcionando. ' +
                    r.modelos.length + ' modelos disponíveis.</p>';
                mostrarModelosGoogle(r.modelos);
            });
        });

        function mostrarModelosGoogle(modelos) {
            var atual = store.get().config.modeloGoogle || modelos[0].id;
            if (!store.get().config.modeloGoogle) {
                store.setConfig('modeloGoogle', modelos[0].id);
                store.setConfig('limiteGoogle', modelos[0].limiteSaida);
            }
            ui.$('modelos-google').innerHTML =
                '<label class="rotulo" for="modelo-google">Modelo do Gemini</label>' +
                '<select class="campo" id="modelo-google">' +
                modelos.map(function (m) {
                    return '<option value="' + esc(m.id) + '" data-limite="' + m.limiteSaida + '"' +
                        (m.id === atual ? ' selected' : '') + '>' + esc(m.nome) + '</option>';
                }).join('') + '</select>' +
                '<p class="dica">Os modelos <b>Flash</b> são os que a camada gratuita serve. ' +
                'O <b>Flash-Lite</b> tem limite diário maior e escreve com menos profundidade.</p>';

            ui.$('modelo-google').addEventListener('change', function (ev) {
                var op = ev.target.selectedOptions[0];
                store.setConfig('modeloGoogle', ev.target.value);
                store.setConfig('limiteGoogle', parseInt(op.getAttribute('data-limite'), 10) || 8192);
                ui.toast('Modelo: ' + ev.target.value);
            });
        }

        /* Já tem chave salva: busca a lista de modelos sem pedir nada. */
        if (c.chaveGoogle) {
            B.ia.listarModelosGoogle(c.chaveGoogle).then(function (modelos) {
                if (modelos.length) mostrarModelosGoogle(modelos);
            }, function () { });
        }

        ui.$('ver-chave').addEventListener('click', function () {
            var i = ui.$('chave');
            i.type = i.type === 'password' ? 'text' : 'password';
        });

        ui.$('salvar-chave').addEventListener('click', function () {
            var v = (ui.$('chave').value || '').trim();
            var caixa = ui.$('teste-chave');
            if (!v) {
                store.setConfig('chave', '');
                caixa.innerHTML = '<p class="aviso">Chave apagada.</p>';
                return;
            }
            if (v.indexOf('sk-ant-') !== 0) {
                caixa.innerHTML = '<p class="aviso aviso--erro">Uma chave da Anthropic começa ' +
                    'com <code>sk-ant-</code>. Confira se você copiou a chave certa.</p>';
                return;
            }
            caixa.innerHTML = '<p class="carregando">Testando a chave…</p>';
            B.ia.testarChave(v).then(function (r) {
                if (r.ok) {
                    store.setConfig('chave', v);
                    caixa.innerHTML = '<p class="aviso aviso--ok">Chave funcionando e salva. ' +
                        'Pode gerar estudos.</p>';
                } else {
                    caixa.innerHTML = '<p class="aviso aviso--erro">' + esc(r.erro) + '</p>';
                }
            });
        });

        var ap = ui.$('apagar-chave');
        if (ap) ap.addEventListener('click', function () {
            ui.confirmar('Apagar a chave', 'O app para de gerar estudos novos. Os estudos ' +
                'já guardados continuam aqui.', { textoOk: 'Apagar', perigo: true })
                .then(function (ok) {
                    if (!ok) return;
                    store.setConfig('chave', '');
                    B.app.pintar();
                    ui.toast('Chave apagada.');
                });
        });

        ui.$('modelo').addEventListener('change', function (ev) {
            store.setConfig('modelo', ev.target.value);
            ui.$('modelo-desc').textContent = (B.ia.MODELOS[ev.target.value] || {}).desc || '';
            ui.toast('Modelo: ' + B.ia.MODELOS[ev.target.value].nome);
        });
        ['tamanho', 'tradicao', 'versao'].forEach(function (campo) {
            ui.$(campo).addEventListener('change', function (ev) {
                store.setConfig(campo, ev.target.value);
                ui.toast('Salvo.');
            });
        });
        ui.$('busca').addEventListener('change', function (ev) {
            store.setConfig('buscaWeb', ev.target.checked);
        });
        ui.$('esforco').addEventListener('change', function (ev) {
            store.setConfig('esforco', ev.target.checked ? 'max' : 'high');
        });

        /* O navegador só deixa instalar quando ele mesmo oferece. */
        if (B.instalar && B.instalar.pronto) {
            var b = ui.$('instalar');
            b.hidden = false;
            b.addEventListener('click', function () { B.instalar.pedir(); });
        }
    }

    return { render: render, depois: depois };
})();
