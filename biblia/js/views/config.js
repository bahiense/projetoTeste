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

        return '' +
            '<header class="tela-topo"><h2>Ajustes</h2></header>' +

            '<section class="cartao">' +
            '<h3>Chave da API</h3>' +
            '<p class="dica">Os estudos são escritos pela IA da Anthropic. O app não tem ' +
            'servidor: ele fala direto com a API usando <b>a sua chave</b>, e você paga o ' +
            'que usar, por estudo gerado — não há assinatura.</p>' +

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

            '<label class="rotulo" for="modelo">Modelo</label>' +
            '<select class="campo" id="modelo">' +
            Object.keys(B.ia.MODELOS).map(function (k) {
                return '<option value="' + k + '"' + (k === c.modelo ? ' selected' : '') + '>' +
                    esc(B.ia.MODELOS[k].nome) + '</option>';
            }).join('') + '</select>' +
            '<p class="dica" id="modelo-desc">' + esc((B.ia.MODELOS[c.modelo] || {}).desc || '') + '</p>' +

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
            'a não ser o pedido de estudo, que vai direto para a Anthropic.</p>' +
            '<p class="dica dica--honesta">Os estudos são escritos por IA e erram, ' +
            'principalmente em citação de teólogo, data e número. Trate-os como um bom ' +
            'ponto de partida — nunca como autoridade final.</p>' +
            '</section>';
    }

    function depois(el) {
        var c = store.get().config;

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
