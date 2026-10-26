/* =========================================================
   TELA AJUSTES — a chave gratuita e o feitio do estudo.

   Só há caminhos gratuitos aqui: o Claude, quando o app roda dentro
   dele, e a chave do Google AI Studio, que não pede cartão. A parte
   da chave é escrita com todas as letras: onde ela fica, quem pode
   ver, o que o Google faz com o que passa por ali.
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
        var peloClaude = B.ia.modo() === 'claude';
        /*
         * No app instalado não se gera mais nada: quem escreve é a versão que
         * roda dentro do Claude, e os estudos chegam prontos pela pasta. Chave,
         * cota, modelo e mutirão aqui seriam botões que não levam a lugar
         * nenhum — pior do que ausentes. O caminho continua inteiro no
         * navegador comum, onde a chave do Gemini ainda é um caminho de verdade.
         */
        var noApk = !!(B.copia && B.copia.noApk && B.copia.noApk());

        return '' +
            '<header class="tela-topo"><h2>Ajustes</h2></header>' +

            (peloClaude
                ? '<section class="cartao">' +
                '<h3>A IA já está ligada</h3>' +
                '<p class="dica">Esta versão roda dentro do Claude: os estudos são escritos ' +
                'por ele, pelo seu próprio plano. <b>Não é preciso chave nenhuma</b> — a ' +
                'seção abaixo só interessa se você também usa o app instalado no celular, ' +
                'onde não existe login do Claude para a página aproveitar.</p>' +
                '</section>'
                : '') +

            (noApk ? '' :

            /*
             * Com o Claude gerando, a chave do Gemini não é escolha a fazer:
             * é entulho na tela de quem já decidiu. O cartão inteiro vira um
             * detalhe dobrado — continua ali para quem também usa o APK, sem
             * disputar atenção com o que importa.
             */
            (peloClaude ? '<details class="cartao cartao--dobrado" id="quadro-chave"><summary>' +
                'Chave do Gemini — só para o app instalado no celular</summary>' : '') +

            (peloClaude ? '' : '<section class="cartao" id="quadro-chave">') +
            (peloClaude ? '' : '<h3>Chave do Google Gemini</h3>') +
            '<p class="dica">O app não tem servidor: ele fala direto com o Google usando ' +
            '<b>a sua chave</b>. A chave é <b>gratuita</b> e não pede cartão — tem limite ' +
            'por minuto e por dia, que para alguns estudos por dia sobra.</p>' +

            '<label class="rotulo" for="chave-google">Chave (começa com AIza)</label>' +
            '<div class="campo-linha">' +
            '<input class="campo" id="chave-google" type="password" autocomplete="off" ' +
            'spellcheck="false" placeholder="AIza..." value="' + esc(c.chaveGoogle) + '">' +
            '<button class="btn btn--fraco btn--icone" id="ver-google" aria-label="Mostrar">👁</button>' +
            '</div>' +
            '<div class="linha-botoes">' +
            '<button class="btn btn--forte" id="salvar-google">Salvar e buscar modelos</button>' +
            (c.chaveGoogle
                ? '<button class="btn btn--fraco btn--perigo" id="apagar-google">Apagar chave</button>'
                : '') +
            '</div>' +
            /* "Não funciona mais" é diagnóstico de ninguém. Um pedido de
               verdade, agora, responde em cinco segundos o que o log só diz
               depois de uma rodada inteira — e diz o que fazer. */
            (c.chaveGoogle
                ? '<button class="btn btn--fraco btn--largo" id="conferir-google">' +
                'Conferir a chave agora</button>'
                : '') +
            (c.cobrancaDetectada
                ? '<div class="parada">' +
                '<b>Esta chave está num projeto com cobrança</b>' +
                '<p>O Google recusou um pedido por <b>créditos de pré-pagamento</b>, e este app ' +
                'só funciona por caminho gratuito — então ele parou e não tenta mais sozinho ' +
                'com esta chave.</p>' +
                '<p>Você <b>não foi cobrado</b>: pré-pagamento é saldo comprado antes, e a API ' +
                'parar é justamente o que impede qualquer conta. Não precisa colocar saldo.</p>' +
                '<p>Para voltar ao gratuito: em <b>aistudio.google.com/apikey</b>, crie uma ' +
                'chave nova escolhendo um <b>projeto novo</b> (um que você nunca tenha ligado ' +
                'faturamento) e cole aqui. Salvar a chave nova tira este aviso.</p>' +
                '</div>'
                : '') +
            '<div id="teste-google"></div>' +
            '<div id="modelos-google">' +
            (c.modeloGoogle
                ? '<p class="dica">Modelo em uso: <b>' + esc(c.modeloGoogle) + '</b></p>'
                : '') +
            '</div>' +

            '<details class="detalhe">' +
            '<summary>Como pegar a chave, em dois minutos</summary>' +
            '<ol class="lista-num">' +
            '<li>Entre em <a href="https://aistudio.google.com/apikey" target="_blank" ' +
            'rel="noopener">aistudio.google.com/apikey</a> com sua conta Google.</li>' +
            '<li>Toque em <b>Create API key</b>. Não pede cartão.</li>' +
            '<li>Se ele perguntar o projeto, escolha um <b>sem faturamento ligado</b> — é o que ' +
            'mantém a chave no plano gratuito. Projeto com faturamento cobra, e este app não ' +
            'usa caminho pago.</li>' +
            '<li>Copie e cole aqui.</li>' +
            '</ol>' +
            '</details>' +

            '<details class="detalhe">' +
            '<summary>O que o "grátis" custa</summary>' +
            '<p>Os limites do plano gratuito são por minuto e por dia, e mudam de tempos em ' +
            'tempos; hoje ficam na casa de 10 a 15 pedidos por minuto e algumas centenas por ' +
            'dia, conforme o modelo. Se der erro de limite, espere um pouco, gere um estudo ' +
            'simples (que gasta bem menos) ou troque para um modelo Flash-Lite.</p>' +
            '<p>O preço de verdade é a privacidade: no plano gratuito o Google diz que pode ' +
            'usar o conteúdo para melhorar os modelos dele. Como aqui o conteúdo é um pedido ' +
            'de estudo de um capítulo da Bíblia, talvez isso não te incomode — mas é justo ' +
            'você saber antes.</p>' +
            '<p>Nenhum caminho gratuito tem busca na web, então o modelo escreve de memória. ' +
            'É por isso que o app insiste que você confira citação, data e número antes de ' +
            'repassar adiante.</p>' +
            '</details>' +

            '<details class="detalhe">' +
            '<summary>Onde a chave fica guardada</summary>' +
            '<p>No armazenamento deste navegador, neste aparelho. Ela não vai para servidor ' +
            'nenhum meu — não existe servidor meu — e só é enviada para ' +
            '<code>generativelanguage.googleapis.com</code> na hora de gerar um estudo.</p>' +
            '<p>Quem pegar o seu celular destravado e abrir os ajustes consegue vê-la. Como ' +
            'ela é gratuita, o estrago possível é pequeno, e dá para revogá-la a qualquer ' +
            'momento no Google AI Studio.</p>' +
            '<p>O backup que o app exporta <b>não</b> inclui a chave, de propósito.</p>' +
            '</details>' +
            (peloClaude ? '</details>' : '</section>')
            ) +

            '<section class="cartao">' +
            '<h3>' + (noApk ? 'Qual formato abrir' : 'Como o estudo é escrito') + '</h3>' +

            '<label class="rotulo" for="formato">Formato preferido</label>' +
            '<select class="campo" id="formato">' +
            opcoes({
                simples: 'Simples — contexto, quem é quem, aplicação',
                completo: 'Completo — com original, teólogos e Cristo'
            }, c.formato) + '</select>' +
            '<p class="dica">É só o que abre primeiro: na tela do estudo dá para trocar de ' +
            'formato a qualquer momento, e os dois ficam guardados lado a lado.</p>' +

            (noApk ? '' :

            '<label class="rotulo" for="tamanho">Tamanho do estudo completo</label>' +
            '<select class="campo" id="tamanho">' +
            opcoes({
                essencial: 'Essencial — 900 a 1.300 palavras',
                completo: 'Completo — 2.200 a 3.200 palavras',
                profundo: 'Profundo — 4.000 palavras ou mais'
            }, c.tamanho) + '</select>' +
            '<p class="dica">O estudo simples tem tamanho próprio: de 500 a 800 palavras, ' +
            'para ler em cinco minutos com a Bíblia aberta.</p>' +

            '<label class="rotulo" for="tradicao">Tradição teológica</label>' +
            '<select class="campo" id="tradicao">' +
            opcoes({
                equilibrada: 'Equilibrada — mostra as tradições lado a lado',
                reformada: 'Reformada / calvinista',
                arminiana: 'Arminiana / wesleyana',
                catolica: 'Católica',
                historica: 'Histórico-crítica / acadêmica'
            }, c.tradicao) + '</select>' +
            '<p class="dica">Seja qual for a escolha, o estudo completo continua obrigado a ' +
            'mostrar onde os intérpretes discordam. O viés fica explícito, não escondido.</p>' +

            '<label class="rotulo" for="versao">Tradução citada</label>' +
            '<select class="campo" id="versao">' +
            opcoes({
                ARA: 'Almeida Revista e Atualizada (ARA)',
                ACF: 'Almeida Corrigida Fiel (ACF)',
                NVI: 'Nova Versão Internacional (NVI)',
                NAA: 'Nova Almeida Atualizada (NAA)',
                NVT: 'Nova Versão Transformadora (NVT)'
            }, c.versao) + '</select>'
            ) +
            '</section>' +

            (noApk ? '' :

            '<section class="cartao">' +
            '<h3>Gerar todos os estudos</h3>' +
            '<p class="dica">A Bíblia inteira são <b>1.189 capítulos e 66 livros</b> — 2.510 ' +
            'estudos contando os dois formatos. Isso acontece na <b>Oficina</b>, que é uma ' +
            'tela só para isso: o mutirão, o que já existe e o que falta.</p>' +
            '<a class="btn btn--forte btn--largo" href="#/oficina">Abrir a Oficina</a>' +
            '</section>'
            ) +

            /*
             * No app instalado este é o único quadro da travessia: é aqui que
             * se aponta a pasta e os pacotes entram. Fora dele a metade que
             * interessa é a de gerar, e ela mora na Oficina.
             */
            (noApk ? '<section class="cartao" id="quadro-travessia" hidden></section>' : '') +

            '<section class="cartao">' +
            '<h3>Seus estudos</h3>' +
            '<p class="dica">Todo estudo gerado fica guardado neste aparelho e abre de novo ' +
            'sem gastar nada. Este quadro existe para você ver que eles estão ali — e ' +
            'protegidos.</p>' +
            '<div id="situacao-estudos"><p class="carregando">Conferindo…</p></div>' +
            '</section>' +

            '<section class="cartao">' +
            '<h3>Cópia no Google Drive</h3>' +
            '<p class="dica">A cópia em Downloads sobrevive a desinstalar o app, mas não ' +
            'sobrevive ao celular: perdido, roubado ou trocado, ela vai junto. No seu Drive, ' +
            'sobrevive aos dois. ' +
            ui.ajuda('O que o app enxerga do seu Drive',
                '<p>O login acontece <b>no navegador do aparelho</b>, na página do próprio ' +
                'Google. O app nunca vê a sua senha — o Google inclusive proíbe login dentro ' +
                'de um app como este, exatamente para que ele não possa ler o que você ' +
                'digita.</p>' +
                '<p>O que volta para o app é uma permissão chamada <b>drive.file</b>: ela ' +
                'alcança <b>somente os arquivos que este app criou</b>. Suas fotos, seus ' +
                'documentos, suas planilhas — o app não lista, não abre e não apaga nada ' +
                'disso. Não é promessa minha: é o Google que recusa.</p>' +
                '<p>O app cria uma pasta <b>Leitura Bíblica</b> e, dentro dela, um único ' +
                'arquivo, regravado a cada estudo novo e a cada leitura marcada.</p>' +
                '<p>Você pode cancelar quando quiser, aqui ou em ' +
                'myaccount.google.com → Apps com acesso à sua conta.</p>') +
            '</p>' +
            '<div id="quadro-drive"><p class="carregando">Conferindo…</p></div>' +
            '</section>' +

            '<section class="cartao">' +
            '<h3>O texto bíblico</h3>' +
            '<p class="dica">O app traz o texto bíblico embutido, para ler os capítulos ' +
            'aqui dentro, sem internet. ' +
            ui.ajuda('Por que não é a NVI',
                '<p>A NVI, como a ARA, a NAA e a ACF, é texto licenciado: os direitos são da ' +
                'editora, e embutir os 31 mil versículos dela num app seria violação de ' +
                'direito autoral, mesmo num app pessoal que não cobra nada.</p>' +
                '<p>A Almeida de 1911 é a tradução mais recente em português que já entrou ' +
                'em domínio público — por isso é ela que está aqui.</p>' +
                '<p>Na tela de leitura há um botão que abre o mesmo capítulo <b>na NVI</b>, ' +
                'no app da Bible.com, onde ela é gratuita e devidamente licenciada.</p>') +
            '</p>' +

            '<label class="rotulo" for="edicao">Edição</label>' +
            '<select class="campo" id="edicao">' +
            Object.keys(B.texto.EDICOES).map(function (k) {
                return '<option value="' + k + '"' +
                    (k === B.texto.edicaoAtual() ? ' selected' : '') + '>' +
                    esc(B.texto.EDICOES[k].curto) + '</option>';
            }).join('') + '</select>' +
            '<p class="dica" id="edicao-aviso">' + esc(B.texto.edicao().aviso) + '</p>' +

            (window.AndroidArquivo
                ? '<p class="dica">No app instalado, os 66 livros já vêm dentro do APK: a ' +
                'leitura funciona sem internet desde a primeira abertura.</p>'
                : '<button class="btn btn--forte btn--largo" id="baixar-texto">' +
                'Baixar a Bíblia para ler offline (3,7 MB)</button>' +
                '<div class="baixa" id="baixa-status"></div>' +
                '<p class="dica">Sem isto, cada livro é baixado na primeira vez que você o ' +
                'abre — e depois fica guardado. Baixar tudo de uma vez resolve a viagem de ' +
                'avião e o ônibus sem sinal.</p>') +
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
            'andando juntas. Tudo fica no aparelho; nada é enviado para lugar nenhum, a não ' +
            'ser o pedido de estudo, que vai direto para o Google — sem servidor meu no meio.</p>' +
            '<p class="dica dica--honesta">Os estudos são escritos por IA e erram, ' +
            'principalmente em citação de teólogo, data e número. Trate-os como um bom ' +
            'ponto de partida — nunca como autoridade final.</p>' +
            '</section>';
    }

    function depois(el) {
        var c = store.get().config;

        /*
         * No app instalado o cartão da chave nem é desenhado. Cada pedaço
         * dele é ligado só se estiver na tela — sem isso, o primeiro
         * addEventListener num elemento ausente derrubaria o resto de
         * Ajustes junto.
         */
        if (ui.$('ver-google')) ui.$('ver-google').addEventListener('click', function () {
            var i = ui.$('chave-google');
            i.type = i.type === 'password' ? 'text' : 'password';
        });

        var bConf = ui.$('conferir-google');
        if (bConf) bConf.addEventListener('click', function () {
            var caixa = ui.$('teste-google');
            var cfg = store.get().config;
            bConf.disabled = true;
            caixa.innerHTML = '<p class="carregando">Pedindo um texto curto ao Gemini…</p>';
            B.ia.provarChaveGoogle(cfg.chaveGoogle, cfg.modeloGoogle).then(function (q) {
                bConf.disabled = false;
                if (q.ok) {
                    caixa.innerHTML = '<p class="aviso aviso--ok"><b>Funcionando agora.</b> ' +
                        'A chave gerou texto neste instante.' +
                        (q.aviso ? '<br><small>' + esc(q.aviso) + '</small>' : '') + '</p>';
                    if (cfg.cobrancaDetectada) {
                        /* Voltou a funcionar: a marca era da situação de
                           antes, e mantê-la só atrapalharia. */
                        store.setConfig('cobrancaDetectada', false);
                        B.lote.esquecerParada();
                    }
                        return;
                }
                if (q.causa === 'creditos') store.setConfig('cobrancaDetectada', true);
                caixa.innerHTML = '<p class="aviso aviso--erro"><b>Não está funcionando:</b> ' +
                    esc(q.erro) + '</p>' +
                    '<p class="dica">' + (q.causa === 'creditos'
                        ? 'É cobrança, não a cota gratuita. Crie uma chave nova em ' +
                        '<b>aistudio.google.com/apikey</b>, escolhendo um <b>projeto novo</b>, ' +
                        'sem faturamento — e cole aqui.'
                        : q.causa === 'chave'
                            ? 'A chave foi recusada. Confira se copiou inteira, ou gere outra.'
                            : q.causa === 'modelo'
                                ? 'O modelo escolhido não existe mais para esta chave. Toque ' +
                                'em "Salvar e buscar modelos" para atualizar a lista.'
                                : 'Veja a mensagem acima: ela veio do próprio Google.') + '</p>';
            }, function (err) {
                bConf.disabled = false;
                caixa.innerHTML = '<p class="aviso aviso--erro">Não consegui conferir agora: ' +
                    esc((err && err.message) || 'erro desconhecido') + '</p>';
            });
        });

        if (ui.$('salvar-google')) ui.$('salvar-google').addEventListener('click', function () {
            var v = (ui.$('chave-google').value || '').trim();
            var caixa = ui.$('teste-google');
            /* Chave nova, começo limpo: tanto a marca de cobrança quanto o
               aviso de parada falavam da chave anterior. */
            store.setConfig('cobrancaDetectada', false);
            B.lote.esquecerParada();
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
                mostrarModelos(r.modelos);

                /* Listar modelos não prova que dá para gerar — foi assim que
                   uma chave de projeto com cobrança passou no teste e só se
                   revelou 700 estudos depois. Agora o teste gera de verdade,
                   gastando um pedido para responder a pergunta que importa. */
                caixa.innerHTML = '<p class="aviso aviso--ok">Chave aceita, ' +
                    r.modelos.length + ' modelos. Conferindo se ela gera…</p>';
                var modelo = store.get().config.modeloGoogle || (r.modelos[0] || {}).id;
                return B.ia.provarChaveGoogle(v, modelo).then(function (q) {
                    if (q.ok) {
                        caixa.innerHTML = '<p class="aviso aviso--ok">Chave <b>gratuita ' +
                            'funcionando</b>: gerou e guardou. ' + r.modelos.length +
                            ' modelos disponíveis.' +
                            (q.aviso ? '<br><small>' + esc(q.aviso) + '</small>' : '') + '</p>';
                        return;
                    }
                    if (q.causa === 'creditos') store.setConfig('cobrancaDetectada', true);
                    caixa.innerHTML = '<p class="aviso aviso--erro">' + esc(q.erro) +
                        '</p><p class="dica">A chave foi guardada, mas ' +
                        (q.causa === 'creditos'
                            ? 'ela está num projeto com cobrança — o aviso acima explica como ' +
                            'criar uma gratuita.'
                            : 'não conseguiu gerar. Confira o modelo escolhido.') + '</p>';
                });
            });
        });

        var ap = ui.$('apagar-google');
        if (ap) ap.addEventListener('click', function () {
            ui.confirmar('Apagar a chave', 'O app para de gerar estudos novos. Os estudos já ' +
                'guardados continuam aqui.', { textoOk: 'Apagar', perigo: true })
                .then(function (ok) {
                    if (!ok) return;
                    store.setConfig('chaveGoogle', '');
                    B.app.pintar();
                    ui.toast('Chave apagada.');
                });
        });

        function mostrarModelos(modelos) {
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
                'O <b>Flash-Lite</b> tem limite diário maior e escreve com menos ' +
                'profundidade.</p>';

            ui.$('modelo-google').addEventListener('change', function (ev) {
                var op = ev.target.selectedOptions[0];
                store.setConfig('modeloGoogle', ev.target.value);
                store.setConfig('limiteGoogle', parseInt(op.getAttribute('data-limite'), 10) || 8192);
                ui.toast('Modelo: ' + ev.target.value);
            });
        }

        /* Já tem chave salva: busca a lista de modelos sem pedir nada. */
        if (c.chaveGoogle && ui.$('modelos-google')) {
            B.ia.listarModelosGoogle(c.chaveGoogle).then(function (modelos) {
                if (modelos.length) mostrarModelos(modelos);
            }, function () { });
        }

        ['formato', 'tamanho', 'tradicao', 'versao'].forEach(function (campo) {
            var el2 = ui.$(campo);
            if (!el2) return;
            el2.addEventListener('change', function (ev) {
                store.setConfig(campo, ev.target.value);
                ui.toast('Salvo.');
            });
        });

        pintarSituacao();
        pintarDrive();
        B.travessia.pintar('quadro-travessia');
        esconderChaveSeAcabou();


        /* A tela volta do navegador depois do login: o quadro tem de se
           repintar sozinho, senão a pessoa fica olhando "não conectado" com a
           conta já conectada. */
        if (B.drive.disponivel()) B.drive.aoConectar('config', function (ok, recado) {
            ui.toast(ok ? 'Drive conectado: ' + recado : recado, ok ? '' : 'erro');
            pintarDrive();
            pintarSituacao();
        });

        /**
         * Acabou de gerar tudo: a chave sai da tela.
         *
         * Foi o pedido, e é o desenho certo — com a Bíblia inteira guardada
         * não há mais nada a pedir a ninguém. Some, não apaga: a chave
         * continua guardada, e pedir um formato novo traz o quadro de volta.
         */
        function esconderChaveSeAcabou() {
            var q = ui.$('quadro-chave');
            if (!q || !B.lote) return;
            B.lote.estimativa().then(function (est) {
                if (!est.faltam) q.hidden = true;
            }, function () { });
        }

        function pintarDrive() {
            var caixa = ui.$('quadro-drive');
            if (!caixa) return;

            /* No navegador não há ponte nativa: o Drive é coisa do app. */
            if (!B.drive.disponivel()) {
                caixa.innerHTML = '<p class="dica">Isto existe no <b>app instalado</b> ' +
                    '(o APK). Aqui no navegador, a cópia é a manual, em ' +
                    '<b>Progresso → Baixar backup completo</b>.</p>';
                return;
            }

            var e = B.drive.estado();
            var menu = typeof (window.AndroidArquivo || {}).compartilharArquivo === 'function';

            /* APK montado sem cliente OAuth. Dizer como criar o seu é mais útil
               que esconder o botão e deixar a pessoa achando que não dá. */
            if (!e.possivel) {
                caixa.innerHTML =
                    '<p class="dica">Este APK foi montado <b>sem</b> cliente do Google, então a ' +
                    'cópia automática no Drive está desligada. Ela depende de um cadastro ' +
                    'gratuito que só o dono da conta pode fazer — uma vez, em uns dez ' +
                    'minutos. ' +
                    ui.ajuda('Como ligar a cópia automática no Drive',
                        '<p>Em <b>console.cloud.google.com</b>, com a sua conta Google:</p>' +
                        '<ol class="passos">' +
                        '<li>crie um projeto (qualquer nome);</li>' +
                        '<li>em <b>APIs e serviços</b>, ative a <b>Google Drive API</b>;</li>' +
                        '<li>na <b>tela de consentimento OAuth</b>, escolha <b>Externo</b> e ' +
                        '<b>publique em produção</b>. Isto importa: em "Testes" o Google ' +
                        'expira o acesso <b>a cada 7 dias</b> e você teria de reconectar toda ' +
                        'semana. Como a permissão pedida é não sensível, não há verificação ' +
                        'de app a passar;</li>' +
                        '<li>em <b>Credenciais</b>, crie um <b>ID do cliente OAuth</b> do tipo ' +
                        '<b>Android</b>, com<br>pacote <code>com.bahiense.biblia</code><br>' +
                        'SHA-1 <code>D7:95:97:A7:59:00:42:A4:11:F0:DF:C7:22:4E:19:59:4D:1B:9F:FB</code>;</li>' +
                        '<li>ponha o ID gerado em <code>gradle.properties</code> ' +
                        '(<code>driveClienteId=</code>) e gere o APK de novo.</li>' +
                        '</ol>' +
                        '<p>O ID não é segredo: cliente OAuth de Android não tem senha, e o que ' +
                        'o protege é a assinatura do APK registrada aí.</p>') +
                    '</p>' +
                    (menu
                        ? '<button class="btn btn--forte btn--largo" id="drive-menu">' +
                        'Enviar a cópia para o Drive agora</button>' +
                        '<p class="dica">Este caminho funciona hoje, sem cadastro nenhum: abre o ' +
                        'menu do Android e você escolhe <b>Salvar no Drive</b>. É manual — bom ' +
                        'de fazer de vez em quando, até a cópia automática estar ligada.</p>'
                        : '');
                ligarMenu();
                return;
            }

            if (!e.conectado) {
                caixa.innerHTML =
                    '<button class="btn btn--forte btn--largo" id="drive-conectar">' +
                    'Conectar a minha conta do Google</button>' +
                    '<p class="dica">Abre a página de login do <b>Google</b> no navegador do ' +
                    'aparelho. Depois disso, cada estudo novo e cada leitura marcada regravam ' +
                    'a cópia numa pasta <b>' + esc(e.pasta || 'Leitura Bíblica') + '</b> do seu ' +
                    'Drive, sozinhos.</p>' +
                    (menu
                        ? '<button class="btn btn--fraco btn--largo" id="drive-menu">' +
                        'Só enviar uma cópia agora</button>'
                        : '');
                ligarMenu();
                var bc = ui.$('drive-conectar');
                if (bc) bc.addEventListener('click', function () {
                    bc.disabled = true;
                    B.drive.conectar().then(function () {
                        /* O aviso e o repintar vêm pelo aoConectar, que vale
                           também quando a volta demora e a tela é refeita. */
                    }, function (err) {
                        bc.disabled = false;
                        ui.toast(err.message || 'Não consegui conectar.', 'erro');
                    });
                });
                return;
            }

            caixa.innerHTML =
                '<ul class="resumo">' +
                '<li>conectado como <b>' + esc(e.conta || 'sua conta Google') + '</b></li>' +
                '<li>pasta <b>' + esc(e.pasta || 'Leitura Bíblica') + '</b> no seu Drive</li>' +
                '<li>' + (e.em ? 'último envio ' + ui.quando(e.em) : 'ainda sem envio') + '</li>' +
                '</ul>' +
                '<button class="btn btn--forte btn--largo" id="drive-enviar">' +
                'Enviar a cópia agora</button>' +
                '<button class="btn btn--fraco btn--largo" id="drive-trazer">' +
                'Trazer a cópia do Drive</button>' +
                '<button class="btn btn--fraco btn--largo" id="drive-sair">' +
                'Desconectar a conta</button>' +
                '<p class="dica">Trazer a cópia <b>substitui</b> o que está no aparelho — é o ' +
                'caminho de quem trocou de celular. Ele mostra o que há dentro antes de ' +
                'aplicar.</p>';

            var be = ui.$('drive-enviar');
            be.addEventListener('click', function () {
                be.disabled = true;
                be.textContent = 'Enviando…';
                B.copia.gravar().then(function (r) {
                    be.disabled = false;
                    be.textContent = 'Enviar a cópia agora';
                    if (r.drive) ui.toast('Cópia enviada para o seu Drive.');
                    else ui.toast(r.erro || 'Não consegui enviar para o Drive.', 'erro');
                    pintarDrive();
                });
            });

            var bt = ui.$('drive-trazer');
            bt.addEventListener('click', function () {
                bt.disabled = true;
                B.copia.daNuvem().then(function () {
                    bt.disabled = false;
                }, function (err) {
                    bt.disabled = false;
                    ui.toast(err.message || 'Não consegui trazer a cópia.', 'erro');
                });
            });

            var bs = ui.$('drive-sair');
            bs.addEventListener('click', function () {
                ui.modal({
                    titulo: 'Desconectar o Drive',
                    html: '<p>A cópia que já está no seu Drive <b>continua lá</b> — só o ' +
                        'envio automático para de acontecer.</p>',
                    textoOk: 'Desconectar'
                }).then(function (ok) {
                    if (!ok) return;
                    B.drive.desconectar();
                    ui.toast('Conta desconectada.');
                    pintarDrive();
                    pintarSituacao();
                });
            });

        }

        /* O botão do menu do Android aparece em mais de um estado do quadro; a
           ligação é uma só, feita depois de cada pintura. */
        function ligarMenu() {
            var bm = ui.$('drive-menu');
            if (!bm) return;
            bm.addEventListener('click', function () {
                B.copia.enviarPeloMenu().then(function (ok) {
                    if (!ok) ui.toast('Não consegui preparar o arquivo.', 'erro');
                });
            });
        }

        function pintarSituacao() {
            var caixa = ui.$('situacao-estudos');
            if (!caixa) return;
            B.estudos.situacao().then(function (st) {
                var mb = st.usado ? (st.usado / 1048576).toFixed(1) + ' MB' : null;
                var protegido = st.protegido === true;

                caixa.innerHTML =
                    '<ul class="resumo">' +
                    '<li><b>' + st.estudos + '</b> estudo' + (st.estudos === 1 ? '' : 's') +
                    ' guardado' + (st.estudos === 1 ? '' : 's') +
                    (st.caracteres ? ' · ' + Math.round(st.caracteres / 1000) + ' mil caracteres' : '') +
                    '</li>' +
                    (mb ? '<li>ocupando <b>' + mb + '</b> do espaço do app</li>' : '') +
                    '<li>' + (protegido
                        ? 'armazenamento <b>protegido</b>: o navegador não apaga isto para ' +
                        'liberar espaço'
                        : 'armazenamento <b>não protegido</b>: em teoria o navegador pode ' +
                        'apagar dados do app se o aparelho ficar sem espaço') + '</li>' +
                    '<li>guardados no ' + (st.noIndexedDB ? 'IndexedDB' : 'armazenamento simples') +
                    ' deste ' + (window.AndroidArquivo ? 'app' : 'navegador') + '</li>' +
                    (B.copia.disponivel()
                        ? '<li>cópia automática em <b>Downloads</b>' +
                        (B.copia.quando() ? ', última ' + ui.quando(B.copia.quando()) : ' (ainda não gravada)') +
                        ' ' + ui.ajuda('A cópia que sobrevive à desinstalação',
                            '<p>Tudo que o app guarda mora na pasta privada dele, e o Android ' +
                            'apaga essa pasta quando o app é desinstalado. Por isso, depois de ' +
                            'cada estudo novo e de cada leitura marcada, o app regrava um ' +
                            'arquivo com tudo dentro na pasta <b>Downloads</b> — que é sua, não ' +
                            'dele, e não some na desinstalação.</p>' +
                            '<p>Reinstalando, a tela inicial oferece trazer tudo de volta. Se ' +
                            'você só apagou os dados do app, ele lê a cópia sozinho; se ' +
                            'desinstalou, o Android esquece quem criou o arquivo e é preciso ' +
                            'um toque para apontá-lo no seletor.</p>' +
                            '<p>Além disso, o backup do próprio Android (aquele da sua conta ' +
                            'Google) também leva os dados do app, quando está ligado no ' +
                            'aparelho.</p>') + '</li>'
                        : '') +
                    (B.copia.naNuvem()
                        ? '<li>e no seu <b>Google Drive</b>, que sobrevive até a trocar de ' +
                        'celular</li>'
                        : '') +
                    '</ul>' +
                    (protegido ? '' :
                        '<button class="btn btn--forte btn--largo" id="proteger">' +
                        'Proteger o armazenamento</button>') +
                    (B.copia.disponivel()
                        ? '<button class="btn btn--fraco btn--largo" id="copiar-agora">' +
                        'Gravar a cópia agora</button>'
                        : '') +
                    '<button class="btn btn--fraco btn--largo" id="exportar-estudos">' +
                    'Baixar cópia dos estudos</button>' +
                    '<p class="dica">A cópia é um arquivo de texto com todos eles. Vale a pena ' +
                    'guardar uma de vez em quando: é o que sobrevive a desinstalar o app ou ' +
                    'trocar de celular. Em <b>Progresso → Baixar backup completo</b> sai o ' +
                    'arquivo que restaura tudo, estudos inclusive.</p>';

                var bp = ui.$('proteger');
                if (bp) bp.addEventListener('click', function () {
                    bp.disabled = true;
                    B.estudos.protegerAgora().then(function (ok) {
                        if (ok) ui.toast('Pronto: o navegador vai preservar seus estudos.');
                        else ui.toast('O navegador não concedeu agora. Instalar o app na tela ' +
                            'inicial costuma resolver.', 'aviso');
                        pintarSituacao();
                    });
                });

                var bc = ui.$('copiar-agora');
                if (bc) bc.addEventListener('click', function () {
                    bc.disabled = true;
                    B.copia.gravar().then(function (r) {
                        bc.disabled = false;
                        ui.toast(r.downloads
                            ? 'Cópia gravada em Downloads' + (r.drive ? ' e no seu Drive.' : '.')
                            : 'Não consegui gravar a cópia.', r.downloads ? '' : 'erro');
                        pintarSituacao();
                        pintarDrive();
                    });
                });

                var be = ui.$('exportar-estudos');
                if (be) be.addEventListener('click', function () {
                    B.estudos.listar().then(function (lista) {
                        if (!lista.length) return ui.toast('Nenhum estudo para exportar.', 'aviso');
                        var txt = lista.map(function (e) {
                            return '# ' + e.titulo + ' (' + e.formato + ')\n\n' + e.texto;
                        }).join('\n\n\n---\n\n\n');
                        ui.baixar('estudos-biblicos-' + B.store.hojeISO() + '.md', txt, 'text/markdown');
                    });
                });
            }, function () {
                caixa.innerHTML = '<p class="dica">Não consegui ler o estado do armazenamento.</p>';
            });
        }

        ui.$('edicao').addEventListener('change', function (ev) {
            B.texto.trocarEdicao(ev.target.value);
            ui.$('edicao-aviso').textContent = B.texto.edicao().aviso;
            ui.toast('Lendo a ' + B.texto.edicao().nome + '.');
        });

        var bt = ui.$('baixar-texto');
        if (bt) bt.addEventListener('click', function () {
            var status = ui.$('baixa-status');
            bt.disabled = true;
            status.textContent = 'Baixando…';
            B.texto.baixarTudo(function (feitos, total, nome) {
                status.innerHTML = ui.barra(Math.round((feitos / total) * 100)) +
                    '<span>' + feitos + ' de ' + total + ' — ' + esc(nome) + '</span>';
            }).then(function () {
                status.innerHTML = '<span>✓ Bíblia inteira guardada no aparelho.</span>';
                bt.disabled = false;
                ui.toast('Pronto: dá para ler sem internet.');
            }, function (err) {
                status.innerHTML = '<span>Não deu para terminar: ' + esc(err.message) + '</span>';
                bt.disabled = false;
            });
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
