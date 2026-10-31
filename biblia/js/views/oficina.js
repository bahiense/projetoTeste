/* =========================================================
   A Oficina: onde os estudos são escritos.

   Existe como tela separada porque gerar e ler são dois usos que não se
   encontram. Quem lê abre o app no celular; quem gera abre esta página
   dentro do Claude, deixa o mutirão andando e, de vez em quando, salva
   um pacote para o celular.

   No app instalado ela não aparece: lá não se gera nada, os estudos
   chegam prontos pela pasta.
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.oficina = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, store = B.store;

    function opcoes(mapa, atual) {
        return Object.keys(mapa).map(function (v) {
            return '<option value="' + v + '"' + (v === atual ? ' selected' : '') + '>' +
                esc(mapa[v]) + '</option>';
        }).join('');
    }

    function render(arg) {
        var peloClaude = B.ia.modo() === 'claude';
        /* "#/oficina/João 3/simples": o pedido que veio da tela de leitura,
           do outro lado. Chega como argumento de rota quando a Oficina é
           aberta por um link, e aí o campo já vem preenchido. */
        var pedido = separar(arg);

        return '' +
            '<header class="tela-topo"><h2>Oficina</h2>' +
            '<p class="tela-sub">Onde os estudos são escritos e empacotados para o celular.</p>' +
            '</header>' +

            (peloClaude
                ? '<section class="cartao">' +
                '<h3>Quem escreve</h3>' +
                '<p class="dica">Esta página roda <b>dentro do Claude</b>: é ele que escreve ' +
                'os estudos, pelo seu próprio plano — sem chave, sem conta de API e sem ' +
                'cobrança. Cada estudo guardado traz, no rodapé, o nome de quem o escreveu.</p>' +
                '</section>'
                : '<section class="cartao">' +
                '<h3>Quem escreve</h3>' +
                '<p class="dica">Aqui fora do Claude quem escreve é o <b>Gemini</b>, com a ' +
                'chave gratuita que você guardou em <a href="#/config">Ajustes</a>.</p>' +
                '</section>') +

            '<h3 class="secao">Acervo</h3>' +
            '<div class="cartao" id="acervo"><p class="carregando">Conferindo o acervo…</p></div>' +

            '<h3 class="secao">Gerar o que falta</h3>' +
            '<section class="cartao">' +
            '<p class="dica">A Bíblia inteira são <b>1.189 capítulos e 66 livros</b> — 2.510 ' +
            'estudos contando os dois formatos. O mutirão vai gerando na ordem do seu plano ' +
            'de leitura e guardando tudo. Pode deixar esta página aberta e na frente: se ' +
            'fechar, ele pausa e continua quando você voltar. ' +
            ui.ajuda('Quanto tempo isso leva, de verdade',
                '<p>Pelo Claude, depende do seu plano: ele gera até o limite da sua conta e ' +
                'volta quando ela repõe. Pela chave do Gemini, depende de uma coisa que <b>o ' +
                'Google não publica mais</b>: quantos pedidos por dia a camada gratuita ' +
                'aguenta. Ele tirou as tabelas do site em dezembro de 2025, e os relatos ' +
                'desde então vão de 20 a 1.500 por dia, variando por modelo e por conta.</p>' +
                '<p>Por isso o app não chuta. Quando a cota acaba, o Google devolve no erro o ' +
                '<b>valor real</b> dela — e é esse número que aparece aqui, medido na sua ' +
                'chave. A partir dele dá para dizer quantos dias faltam.</p>' +
                '<p>O mutirão para sozinho quando a cota acaba e <b>volta no dia seguinte</b>, ' +
                'de onde parou. A página precisa estar aberta e na frente; fechou, ele pausa.</p>') +
            '</p>' +
            '<p class="dica dica--honesta">Estudo por estudo, a IA erra igual: em citação de ' +
            'teólogo, data e número. Gerar 2.510 de uma vez não piora nem melhora isso — só ' +
            'quer dizer que ninguém leu nenhum ainda.</p>' +
            '<div id="quadro-lote"><p class="carregando">Conferindo…</p></div>' +
            '</section>' +

            '<h3 class="secao">Renovar um capítulo agora</h3>' +
            '<section class="cartao">' +
            '<p class="dica">Leu um estudo e achou fraco? Diga qual, e ele é reescrito ' +
            '<b>na frente de tudo</b> — sem esperar a fila. No app do celular, a tela do ' +
            'estudo tem um botão que já traz o capítulo preenchido aqui.</p>' +
            '<label class="rotulo" for="um-ref">Capítulo ou livro</label>' +
            '<input class="campo" id="um-ref" type="text" placeholder="João 3" ' +
            'value="' + esc(pedido.ref) + '">' +
            '<label class="rotulo" for="um-formato">Formato</label>' +
            '<select class="campo" id="um-formato">' +
            opcoes({ completo: 'Completo', simples: 'Simples' }, pedido.formato) + '</select>' +
            '<button class="btn btn--forte btn--largo" id="um-renovar">Renovar agora</button>' +
            '<div id="um-estado"></div>' +
            '</section>' +

            '<h3 class="secao">Renovar o que já existe</h3>' +
            '<section class="cartao" id="quadro-renovar">' +
            '<p class="carregando">Vendo quem escreveu cada estudo…</p></section>' +

            '<section class="cartao" id="quadro-travessia" hidden></section>' +

            '<h3 class="secao">Trazer do celular</h3>' +
            '<section class="cartao">' +
            '<p class="dica">Se o celular já tem leitura marcada e estudos guardados, traga o ' +
            'backup dele para cá uma vez: assim o mutirão segue a ordem do <b>seu</b> plano e ' +
            'não gasta tempo refazendo o que já existe lá.</p>' +
            '<label class="btn btn--fraco btn--largo" for="ofi-arquivo">Trazer o backup do celular</label>' +
            '<input type="file" id="ofi-arquivo" hidden>' +
            '<p class="dica">O arquivo é o <code>leitura-biblica-backup.json</code> da pasta ' +
            'Downloads do aparelho — o app o regrava sozinho.</p>' +
            '</section>';
    }

    /* "João 3/simples" → as duas partes; sem formato, vale o completo. */
    function separar(arg) {
        var m = String(arg || '').match(/^(.*)\/(simples|completo)$/);
        if (m) return { ref: m[1], formato: m[2] };
        return { ref: arg || '', formato: 'completo' };
    }

    function depois(el, arg) {
        ligarUm(separar(arg));
        var campo = ui.$('ofi-arquivo');
        campo.addEventListener('change', function (ev) {
            var f = ev.target.files && ev.target.files[0];
            ev.target.value = '';
            if (f) B.copia.deArquivo(f).then(function () { B.app.pintar(); });
        });

        B.acervo.pintar('acervo');
        pintarRenovar();
        pintarLote();
        B.travessia.pintar('quadro-travessia');

        /* Por chave: sem isso, cada visita empilharia mais um ouvinte, e o
           mutirão acabaria repintando a tela dez vezes por pedaço de texto. */
        B.lote.aoMudar('oficina', aoAndar);

        /* Enquanto o mutirão roda, a tela se mexe sozinha: a contagem
           regressiva da pausa não gera evento nenhum. */
        var relogio = null;
        function relogioLigado(ligar) {
            if (ligar && !relogio) relogio = setInterval(andamentoNaTela, 250);
            if (!ligar && relogio) { clearInterval(relogio); relogio = null; }
        }

        /*
         * Mudou alguma coisa no mutirão. Se é só o andamento do estudo em
         * curso, mexe nos pedaços que mudaram — repintar o cartão inteiro
         * dezenas de vezes por estudo fecharia o painel de falhas na cara da
         * pessoa e faria a tela pular.
         */
        function aoAndar(e) {
            if (!!ui.$('lote-agora') === !!e.rodando) {
                if (e.rodando) return andamentoNaTela(e);
                return;
            }
            pintarLote();
        }

        /*
         * O estudo em curso, em tempo real: a fase, o quanto já chegou, e a
         * contagem da pausa. Escreve direto nos elementos — nada de refazer o
         * cartão, que apagaria o que a pessoa abriu.
         */
        function andamentoNaTela(e) {
            e = e || B.lote.estado();
            var agora = ui.$('lote-agora'), barra = ui.$('lote-estudo-i'), fase = ui.$('lote-fase');
            if (!agora || !barra || !fase) return relogioLigado(false);

            agora.textContent = e.em || '…';
            var feitos = ui.$('lote-feitos');
            if (feitos) feitos.textContent = e.feitos;

            if (e.fase === 'semrede') {
                barra.className = 'is-espera';
                barra.style.width = '100%';
                fase.textContent = 'sem internet — esperando a conexão voltar';
                return;
            }

            if (e.fase === 'esperando') {
                var falta = Math.max(0, Math.ceil((e.esperandoAte - Date.now()) / 1000));
                barra.style.width = '100%';
                barra.className = 'is-espera';
                /* Pausa da fila inteira por rede ruim: dizer "deu erro;
                   tentando de novo" aqui esconderia que o problema é a
                   conexão, e não aquele capítulo. */
                if (e.filaEmPausa) {
                    fase.textContent = 'conexão ruim em ' + e.filaEmPausa +
                        ' capítulo' + (e.filaEmPausa === 1 ? '' : 's') + ' seguido' +
                        (e.filaEmPausa === 1 ? '' : 's') + '; a fila volta em ' +
                        (falta > 90 ? Math.round(falta / 60) + ' min' : falta + 's');
                    return;
                }
                fase.textContent = e.vez > 1
                    ? 'deu erro; tentando de novo em ' +
                    (falta > 90 ? Math.round(falta / 60) + ' min' : falta + 's') +
                    ' (tentativa ' + e.vez + ')'
                    : 'próximo capítulo em ' + falta + 's';
                return;
            }

            /* Segundos desde que o pedido saiu. Sem isto, "pedindo ao
               Gemini…" parado há um minuto é idêntico a "pedindo" há dois
               segundos — e era justamente onde dava para ficar pendurado. */
            var decorrido = e.desde ? Math.floor((Date.now() - e.desde) / 1000) : 0;

            barra.className = '';
            if (e.fase === 'pedindo') {
                /* Sem texto ainda: barra indeterminada, que anda sozinha. O
                   honesto é dizer "não sei quanto falta", não inventar 10%. */
                barra.className = 'is-indefinida';
                barra.style.width = '100%';
                fase.textContent = 'pedindo ao Gemini… ' + decorrido + 's' +
                    (decorrido > 25 ? ' (corta em 70s e tenta de novo)' : '');
                return;
            }
            if (e.fase === 'guardando') {
                barra.style.width = '100%';
                fase.textContent = 'guardando no aparelho…';
                return;
            }
            if (e.fase === 'escrevendo') {
                /* Para em 95%: barra cheia com texto ainda vindo mente. */
                var pct = Math.min(95, Math.round((e.parcial / (e.esperado || 1)) * 100));
                barra.style.width = pct + '%';
                fase.textContent = 'escrevendo… ' +
                    (e.parcial || 0).toLocaleString('pt-BR') + ' caracteres · ' +
                    decorrido + 's';
                return;
            }
            barra.style.width = '0%';
            fase.textContent = 'preparando…';
        }

        /* Por que o mutirão não está andando. Isto não pode ficar em letra
           miúda no rodapé: é a resposta para "por que parou?", e algumas das
           causas só a pessoa pode resolver. */
        function avisoParada(e) {
            if (!e.ultimoErro) return '';
            var credito = /cr[ée]dito|pr[ée]-pagamento|prepay/i.test(e.ultimoErro);
            return '<div class="parada">' +
                '<b>' + (credito ? 'O Google parou de atender esta chave' : 'O mutirão parou') +
                '</b><p>' + esc(e.ultimoErro) + '</p>' +
                (credito
                    ? '<p>Isto é <b>cobrança</b>, não a cota gratuita — e vale para todas as ' +
                    'chaves do mesmo faturamento, por isso nenhum capítulo passa. Em ' +
                    '<b>ai.studio/projects</b>, veja se o projeto desta chave está no plano ' +
                    'gratuito ou com faturamento ligado; com faturamento ligado e saldo zero, ' +
                    'a API não responde. Criar a chave num projeto <b>sem</b> faturamento ' +
                    'devolve o plano gratuito.</p>'
                    : '') +
                '</div>';
        }

        /* As falhas, em números e por causa. Um total solto ("79 falharam")
           não diz o que consertar; a quebra por causa diz. */
        /**
         * O que saiu nesta sentada, com nome.
         *
         * Um contador que vai de 12 a 13 não diz qual capítulo saiu. Quem
         * abre a página para produzir quer ver a lista do que foi escrito
         * agora — e é ela que mostra, de relance, que o trabalho andou.
         */
        function painelSaidos(e) {
            var tudo = e.saidos || [];
            var daSessao = e.sessaoDesde
                ? tudo.filter(function (x) { return x.quando >= e.sessaoDesde; })
                : [];
            if (!tudo.length) return '';

            var lista = daSessao.length ? daSessao : tudo;
            var titulo = daSessao.length
                ? '<b>' + daSessao.length + '</b> ' +
                (daSessao.length === 1 ? 'saiu' : 'saíram') + ' nesta sentada'
                : 'os últimos que saíram';

            return '<details class="falhas falhas--ok" open>' +
                '<summary>' + titulo +
                (e.feitosHoje ? ' · <b>' + e.feitosHoje + '</b> hoje' : '') + '</summary>' +
                '<ul class="falhas-lista">' + lista.slice(0, 12).map(function (x) {
                    return '<li class="is-ok"><b>' + esc(x.titulo) + '</b> ' +
                        '<small>' + x.formato + (x.renovado ? ' · renovado' : '') +
                        ' · ' + ui.quando(x.quando) + '</small></li>';
                }).join('') + '</ul>' +
                (lista.length > 12
                    ? '<p class="dica">E mais ' + (lista.length - 12) + '.</p>'
                    : '') +
                '</details>';
        }

        function painelFalhas(e, aberto) {
            /* O histórico aparece mesmo sem pendência: é nele que se vê que
               aquela falha de ontem já foi consertada. */
            if (!e.erros && !e.aguardando && !(e.diario || []).length) return '';
            var causas = Object.keys(e.porCausa || {}).sort(function (a, b) {
                return e.porCausa[b] - e.porCausa[a];
            });
            return '<details class="falhas"' + (aberto ? ' open' : '') + '>' +
                /*
                 * O que importa aqui é o que ainda está quebrado, não quantas
                 * vezes algo quebrou. "3 falhas" num diário onde as três já
                 * foram consertadas é um alarme falso que ninguém consegue
                 * desligar.
                 */
                '<summary>' + (e.aguardando
                    ? '<b>' + e.aguardando + '</b> esperando conserto'
                    : '<b>nenhuma</b> esperando conserto') +
                ' · ' + e.erros + ' falha' + (e.erros === 1 ? '' : 's') + ' desde o começo' +
                '</summary>' +
                (!e.aguardando && e.erros
                    ? '<p class="aviso aviso--ok">Tudo que falhou já foi escrito depois. ' +
                    'A lista abaixo é histórico, não pendência.</p>'
                    : '') +
                (causas.length
                    ? '<ul class="resumo">' + causas.map(function (c) {
                        return '<li><b>' + e.porCausa[c] + '</b> · ' +
                            esc((B.ia.CAUSAS && B.ia.CAUSAS[c]) || c) + '</li>';
                    }).join('') + '</ul>'
                    /* Quem já rodava o mutirão antes deste registro existir tem
                       o total, mas não o porquê — e dizer isso é melhor do que
                       mostrar um quadro vazio sem explicação. */
                    : '<p class="dica">Estas são de antes de o app anotar o motivo, então a ' +
                    'causa delas não ficou guardada. As próximas aparecem aqui com causa, ' +
                    'data e a mensagem do Google.</p>') +
                (e.diario && e.diario.length
                    ? '<p class="rotulo">Últimas</p><ul class="falhas-lista">' +
                    e.diario.slice(0, 8).map(function (d) {
                        return '<li' + (d.consertado ? ' class="is-ok"' : '') + '><b>' +
                            esc(d.alvo) + '</b> — ' +
                            esc((B.ia.CAUSAS && B.ia.CAUSAS[d.causa]) || d.causa) +
                            (d.fim ? ' <code>' + esc(d.fim) + '</code>' : '') +
                            (d.consertado
                                ? ' <b class="selo-ok">✓ consertado ' +
                                ui.quando(d.consertado) + '</b>'
                                : '') +
                            '<br><small>' + ui.quando(d.quando) + ' · ' + esc(d.msg) +
                            '</small></li>';
                    }).join('') + '</ul>'
                    : '') +
                '<button class="btn btn--fraco btn--largo" id="lote-log">' +
                'Baixar o log das falhas</button>' +
                '<p class="dica">Nada aqui é perdido: tudo que falhou volta para o começo da ' +
                'fila na próxima rodada, e é tentado de novo todo dia até sair.</p>' +
                '</details>';
        }

        function ligarLog() {
            var b = ui.$('lote-log');
            if (b) b.addEventListener('click', function () {
                ui.baixar('falhas-mutirao-' + B.store.hojeISO() + '.md',
                    B.lote.diarioComoTexto(), 'text/markdown');
            });
        }

        /**
         * Acabou: a IA sai da tela.
         *
         * Foi o pedido, e é o desenho certo. Com a Bíblia inteira guardada no
         * aparelho, chave, modelo e cota viraram entulho: não há mais nada a
         * pedir a ninguém. Some o quadro da chave, e no lugar fica uma linha
         * dizendo onde os estudos estão.
         *
         * Some, não apaga: a chave continua guardada, e basta gerar um
         * formato novo para o quadro voltar.
         */
        function acabou() {
            var q = ui.$('quadro-chave');
            if (!q || q.dataset.guardado) return;
            q.dataset.guardado = '1';
            q.hidden = true;
        }

        /* O pedido avulso: um capítulo, agora, na frente da fila. */
        function ligarUm(pedido) {
            var b = ui.$('um-renovar');
            var caixa = ui.$('um-estado');
            if (!b) return;

            if (pedido.ref) {
                caixa.innerHTML = '<p class="dica">Veio do app: <b>' + esc(pedido.ref) +
                    '</b>. Confira e toque em renovar.</p>';
            }

            b.addEventListener('click', function () {
                var ref = (ui.$('um-ref').value || '').trim();
                if (!ref) return ui.toast('Diga qual capítulo.', 'aviso');
                b.disabled = true;
                caixa.innerHTML = '<div class="gerando-topo"><span class="pulso"></span>' +
                    '<span>reescrevendo ' + esc(ref) + '…</span></div>';
                B.lote.renovarUm(ref, ui.$('um-formato').value).then(function (nome) {
                    b.disabled = false;
                    caixa.innerHTML = '<p class="aviso aviso--ok"><b>' + esc(nome) +
                        '</b> foi reescrito. Ele volta nos pacotes para o celular.</p>';
                    B.acervo.pintar('acervo');
                    pintarRenovar();
                }, function (e) {
                    b.disabled = false;
                    caixa.innerHTML = '<p class="aviso aviso--erro">' +
                        esc(e && e.message ? e.message : 'Não consegui renovar.') + '</p>';
                });
            });
        }

        /**
         * Renovar os estudos de uma origem.
         *
         * A pergunta que isto responde é "os novos estão melhores — dá para
         * refazer os antigos?". O que separa antigo de novo não é a data: é
         * quem escreveu, que fica gravado no rodapé de cada estudo.
         */
        var NOMES = {
            claude: 'escritos pelo Claude',
            google: 'escritos pelo Gemini',
            mao: 'colados à mão',
            outro: 'de outra origem',
            semNome: 'sem origem anotada'
        };

        /* O botão que põe a renovação para andar, na vez dela. */
        function ofereceRenovacao(caixa, e) {
            return B.lote.renovaveis(e.renovar).then(function (fila) {
                if (!fila.length) {
                    caixa.innerHTML += '<p class="dica">E não sobrou nenhum estudo daquela ' +
                        'origem para renovar: todos já foram reescritos.</p>';
                    return;
                }
                caixa.innerHTML += '<ul class="resumo"><li>na fila de renovação: <b>' +
                    fila.length.toLocaleString('pt-BR') + '</b> estudos ' +
                    (NOMES[e.renovar] || e.renovar) + '</li></ul>' +
                    '<button class="btn btn--forte btn--largo" id="lote-comecar">' +
                    'Começar a renovação</button>';
                var b = ui.$('lote-comecar');
                b.addEventListener('click', function () {
                    b.disabled = true;
                    B.lote.comecar().then(pintarLote);
                });
            }, function () { });
        }

        function pintarRenovar() {
            var caixa = ui.$('quadro-renovar');
            if (!caixa) return;
            return B.estudos.porMotor().then(function (c) {
                var e = B.lote.estado();
                if (!c.total) {
                    caixa.innerHTML = '<p class="dica">Ainda não há estudo guardado para ' +
                        'renovar.</p>';
                    return;
                }

                var linhas = Object.keys(NOMES).filter(function (k) { return c[k]; })
                    .map(function (k) {
                        return '<li><b>' + c[k].toLocaleString('pt-BR') + '</b> ' + NOMES[k] +
                            (k === e.renovar ? ' — <b>na fila</b>' : '') + '</li>';
                    }).join('');

                /* Só as origens que existem viram opção: oferecer "renovar os
                   colados à mão" num acervo sem nenhum é pedir um engano. */
                var podem = Object.keys(NOMES).filter(function (k) { return c[k]; });
                var mapa = {};
                podem.forEach(function (k) { mapa[k] = NOMES[k].replace(/^./, function (x) {
                    return x.toUpperCase();
                }); });

                caixa.innerHTML =
                    '<p class="dica">Cada estudo guarda <b>quem o escreveu</b>. Se os novos ' +
                    'estão saindo melhores, dá para pôr os de outra origem na fila: o mutirão ' +
                    'os reescreve <b>depois</b> de terminar tudo que ainda falta — estudo que ' +
                    'não existe vale mais do que estudo que existe e pode melhorar.</p>' +
                    '<ul class="resumo">' + linhas + '</ul>' +

                    (e.renovar
                        ? '<p class="aviso aviso--ok"><b>Na fila:</b> os ' +
                        (NOMES[e.renovar] || e.renovar) + '.' +
                        (e.renovados ? ' Já renovados: <b>' + e.renovados + '</b>.' : '') +
                        '</p>' +
                        '<button class="btn btn--fraco btn--largo" id="renovar-nao">' +
                        'Tirar da fila</button>'
                        : '<label class="rotulo" for="renovar-motor">Quais renovar</label>' +
                        '<select class="campo" id="renovar-motor">' +
                        '<option value="">— escolha —</option>' + opcoes(mapa, '') + '</select>' +
                        '<button class="btn btn--forte btn--largo" id="renovar-sim">' +
                        'Pôr na fila</button>') +

                    '<p class="dica">Renovar custa o mesmo que gerar: são tantos pedidos ' +
                    'quantos estudos. O texto antigo só é substituído quando o novo chega ' +
                    'inteiro, e o renovado volta a entrar nos pacotes para o celular.</p>';

                var sim = ui.$('renovar-sim');
                if (sim) sim.addEventListener('click', function () {
                    var m = ui.$('renovar-motor').value;
                    if (!m) return ui.toast('Escolha quais renovar.', 'aviso');
                    B.lote.renovarMotor(m);
                    ui.toast(c[m].toLocaleString('pt-BR') + ' estudos na fila de renovação.');
                    pintarRenovar();
                    pintarLote();
                });
                var nao = ui.$('renovar-nao');
                if (nao) nao.addEventListener('click', function () {
                    B.lote.renovarMotor('');
                    ui.toast('Renovação desligada.');
                    pintarRenovar();
                    pintarLote();
                });
            }, function () {
                caixa.innerHTML = '<p class="dica">Não consegui ver as origens agora.</p>';
            });
        }

        function pintarLote() {
            var caixa = ui.$('quadro-lote');
            if (!caixa) return;
            var e = B.lote.estado();
            var cfg = store.get().config;

            relogioLigado(false);

            /* Dentro do Claude a página gera sem chave nenhuma, pelo plano de
               quem está usando — então o quadro não pode exigir a do Gemini. */
            if (!B.ia.pronto(cfg)) {
                caixa.innerHTML = '<p class="dica">Para isto o app precisa de um caminho para ' +
                    'a IA: a <b>chave do Gemini</b>, no primeiro quadro desta tela, ou abrir ' +
                    'o app <b>dentro do Claude</b>, onde ele gera sem chave, pelo seu plano. ' +
                    'Os dois são gratuitos, e são cotas separadas — se uma acabar, a outra ' +
                    'continua.</p>';
                return;
            }

            /* No Claude não há cota do Google a medir, e falar dela confunde. */
            var noClaude = B.ia.modo() === 'claude' && !cfg.chaveGoogle;

            /* Rodando: o que importa é ver que anda, e poder parar. */
            if (e.rodando) {
                caixa.innerHTML =
                    '<div class="lote-barra"><i id="lote-barra-i"></i></div>' +
                    '<ul class="resumo">' +
                    '<li>' + (e.renovando ? 'renovando agora' : 'gerando agora') +
                    ': <b id="lote-agora">' + esc(e.em || '…') + '</b>' +
                    /* A barra deste estudo: é ela que se mexe entre um
                       capítulo e outro e mostra que o app está vivo. */
                    '<div class="lote-barra lote-barra--estudo"><i id="lote-estudo-i"></i></div>' +
                    '<small id="lote-fase">preparando…</small></li>' +
                    '<li><b id="lote-feitos">' + e.feitos + '</b> prontos nesta rodada' +
                    (e.feitosHoje ? ' · <b>' + e.feitosHoje + '</b> hoje' : '') +
                    '</li>' +
                    '</ul>' +
                    painelSaidos(e) +
                    painelFalhas(e) +
                    '<button class="btn btn--fraco btn--largo" id="lote-parar">' +
                    'Parar o mutirão</button>' +
                    '<p class="dica">Pode deixar nesta tela. A tela fica acesa sozinha enquanto ' +
                    'ele trabalha; se você fechar o app, ele pausa e continua na próxima ' +
                    'abertura.</p>';
                ligarParar();
                ligarLog();
                pintarFaltam();
                relogioLigado(true);
                andamentoNaTela(e);
                return;
            }

            /* Cota do dia esgotada: isto não é erro, é fim de expediente. */
            if (e.esperandoCota) {
                var volta = new Date(e.pausadoAte);
                caixa.innerHTML =
                    '<ul class="resumo">' +
                    '<li>a cota gratuita de hoje acabou' +
                    (e.cotaDia ? ': <b>' + e.cotaDia + '</b> pedidos por dia nesta chave' : '') +
                    '</li>' +
                    '<li><b>' + e.feitos + '</b> estudos gerados até agora</li>' +
                    '<li>volta sozinho depois das <b>' +
                    volta.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) +
                    '</b>, quando o dia vira no fuso do Google</li>' +
                    '</ul>' +
                    painelFalhas(e) +
                    '<button class="btn btn--fraco btn--largo" id="lote-parar">' +
                    'Desligar o mutirão</button>' +
                    '<p class="dica">Pode fechar o app. Na próxima vez que você abrir, depois ' +
                    'dessa hora, ele continua de onde parou.</p>';
                ligarParar();
                ligarLog();
                return;
            }

            caixa.innerHTML = '<p class="carregando">Conferindo o que falta…</p>';
            B.lote.estimativa().then(function (est) {
                if (!est.faltam) {
                    caixa.innerHTML = '<p class="aviso aviso--ok"><b>Está tudo gerado.</b> ' +
                        'Os 1.189 capítulos e os 66 livros, no que você pediu. Daqui para a ' +
                        'frente o app abre qualquer estudo sem tocar na IA — e sem internet.</p>';
                    acabou();
                    /* Com a geração fechada, é a vez da fila de renovação —
                       se houver uma pedida. É só aqui que ela anda. */
                    if (e.renovar) ofereceRenovacao(caixa, e);
                    return;
                }
                caixa.innerHTML =
                    /* Por que não está andando vem primeiro. Enterrado embaixo
                       dos números e do seletor, ninguém lia — e a pergunta
                       "parou, por quê?" ficava sem resposta na própria tela
                       que tinha a resposta. */
                    avisoParada(e) +
                    '<ul class="resumo">' +
                    '<li>faltam <b>' + est.faltam.toLocaleString('pt-BR') + '</b> estudos' +
                    (e.aguardando ? ', <b>' + e.aguardando + '</b> deles de repescagem' : '') +
                    '</li>' +
                    '<li>vão ocupar mais ou menos <b>' + est.mb.toFixed(0) + ' MB</b></li>' +
                    '<li>' + (noClaude
                        ? 'gerados pelo <b>Claude</b>, pelo seu plano — sem chave e sem a cota ' +
                        'do Google'
                        : est.cotaDia
                            ? 'na sua cota medida (<b>' + est.cotaDia + '</b> por dia), uns <b>' +
                            est.dias + '</b> dia' + (est.dias === 1 ? '' : 's')
                            : 'quantos dias, só a primeira parada dirá: o Google não publica ' +
                            'mais a cota gratuita, e o app a mede quando ela acaba') + '</li>' +
                    '</ul>' +
                    '<label class="rotulo" for="lote-formato">O que gerar</label>' +
                    '<select class="campo" id="lote-formato">' +
                    opcoes({
                        ambos: 'Os dois formatos, capítulo a capítulo',
                        simples: 'Só os simples — mais rápido, cabe primeiro',
                        completo: 'Só os completos'
                    }, e.formato) + '</select>' +
                    '<button class="btn btn--forte btn--largo" id="lote-comecar">' +
                    (e.aguardando ? 'Continuar o mutirão' : 'Começar o mutirão') + '</button>' +
                    painelSaidos(e) +
                    painelFalhas(e, !e.rodando && !!e.ultimoErro) +
                    '<p class="dica">A ordem segue o seu plano: o próximo capítulo de cada um ' +
                    'dos oito grupos primeiro, e assim por diante. Se a cota só der para cem ' +
                    'por dia, que sejam os cem que você vai ler antes. Durante o mutirão a ' +
                    'cópia de segurança sai a cada cinquenta estudos, não a cada um — senão ' +
                    'seriam dezenas de GB gravados à toa.</p>';

                ligarLog();
                var bc = ui.$('lote-comecar');
                bc.addEventListener('click', function () {
                    bc.disabled = true;
                    B.lote.comecar({ formato: ui.$('lote-formato').value }).then(pintarLote);
                });
            }, function () {
                caixa.innerHTML = '<p class="dica">Não consegui conferir o que falta.</p>';
            });

            function ligarParar() {
                var bp = ui.$('lote-parar');
                if (bp) bp.addEventListener('click', function () {
                    bp.disabled = true;
                    B.lote.parar().then(pintarLote);
                });
            }

            /* A barra precisa do total, que custa uma leitura das chaves: só
               na primeira pintura de cada rodada, não a cada estudo. */
            function pintarFaltam() {
                if (pintarLote.total) return desenhar();
                B.lote.pendentes().then(function (f) {
                    pintarLote.total = f.length + e.feitos;
                    desenhar();
                });
                function desenhar() {
                    var i = ui.$('lote-barra-i');
                    if (!i || !pintarLote.total) return;
                    i.style.width = Math.min(100, (e.feitos / pintarLote.total) * 100) + '%';
                }
            }
        }
    }

    return { render: render, depois: depois };
})();
