/* =========================================================
   Fluência 180 — montagem, navegação e telas gerais.
   ========================================================= */
window.F = window.F || {};
F.telas = F.telas || {};

(function () {
    'use strict';

    var ui = F.ui, esc = F.ui.esc;
    var telaAtual = null;

    /* ---------------- navegação ---------------- */

    var ROTAS = [
        'inicio', 'hoje', 'exercicios', 'pronuncia', 'shadowing', 'escuta', 'chunks',
        'drills', 'conversa', 'explicar', 'pegaoerro', 'coragem', 'erros', 'plano',
        'progresso', 'config', 'metodo'
    ];

    function rota() {
        var h = (location.hash || '').replace(/^#\/?/, '');
        var partes = h.split('/').filter(Boolean);
        var nome = partes[0] || (F.store.get().pacto ? 'hoje' : 'inicio');
        if (ROTAS.indexOf(nome) < 0) nome = 'hoje';
        return { nome: nome, args: partes.slice(1) };
    }

    function ir(hash) { location.hash = hash; }

    function desenhar() {
        var r = rota();
        var tela = F.telas[r.nome];
        var alvo = ui.$('tela');
        if (!tela) { alvo.innerHTML = '<p class="vazio">Tela não encontrada.</p>'; return; }

        // deixa a tela anterior desligar timers e áudio
        if (telaAtual && telaAtual.desmontar) { try { telaAtual.desmontar(); } catch (e) { } }
        F.voz.pararFala();
        F.voz.pararEscuta();
        // sair no meio de uma gravação deixaria o microfone preso pelo próprio app
        if (F.voz.gravando()) F.voz.pararGravacao();
        else F.voz.soltarStream();

        telaAtual = tela;
        ui.fecharModal();
        ui.limparAjudas();
        alvo.innerHTML = tela.render(r.args) || '';
        alvo.scrollTop = 0;
        window.scrollTo(0, 0);
        if (tela.montar) tela.montar(r.args);
        pintarCabecalho();
        marcarNav(r.nome);
    }

    function marcarNav(nome) {
        var mapa = { hoje: 'hoje', exercicios: 'exercicios', coragem: 'coragem', progresso: 'progresso' };
        var grupo = mapa[nome] || (['pronuncia', 'shadowing', 'escuta', 'chunks', 'drills', 'conversa', 'explicar', 'pegaoerro', 'erros'].indexOf(nome) >= 0 ? 'exercicios' : '');
        ui.qq('.nav-item').forEach(function (b) {
            b.classList.toggle('is-on', b.getAttribute('data-nav') === grupo);
        });
    }

    /* ---------------- cabeçalho ---------------- */

    function pintarCabecalho() {
        var s = F.store.get();
        var min = F.store.minutosHoje();
        var meta = s.config.metaDiaria || 45;
        var pct = Math.min(100, Math.round((min / meta) * 100));
        ui.$('cab-streak').textContent = s.streak.atual;
        ui.$('cab-min').textContent = min + '/' + meta + ' min';
        ui.$('cab-semana').textContent = 'Semana ' + s.semana;
        ui.$('cab-barra').style.width = pct + '%';
    }

    /* ---------------- tempo de estudo ---------------- */

    var segundos = 0;
    setInterval(function () {
        if (document.hidden) return;
        segundos++;
        if (segundos % 60 === 0) {
            F.store.registrarMinutos(1);
            pintarCabecalho();
        }
    }, 1000);

    /* ---------------- ações globais ---------------- */

    document.addEventListener('click', function (ev) {
        var fechar = ev.target.closest ? ev.target.closest('[data-fechar-modal]') : null;
        if (fechar || ev.target.id === 'modal') { ui.fecharModal(); return; }

        var ajuda = ev.target.closest ? ev.target.closest('[data-ajuda]') : null;
        if (ajuda) { ui.abrirAjuda(parseInt(ajuda.getAttribute('data-ajuda'), 10)); return; }

        var alvo = ev.target.closest ? ev.target.closest('[data-falar],[data-nav],[data-ir]') : null;
        if (!alvo) return;

        if (alvo.hasAttribute('data-falar')) {
            // tudo que é falado passa pelo limpador: sem seta, sem IPA, sem nota
            var t = F.texto.paraFalar(alvo.getAttribute('data-falar'));
            if (!t) return;
            var rate = parseFloat(alvo.getAttribute('data-rate') || '0') || undefined;
            F.voz.falar(t, { rate: rate });
            alvo.classList.add('is-falando');
            setTimeout(function () { alvo.classList.remove('is-falando'); }, 600);
            return;
        }
        if (alvo.hasAttribute('data-ir')) { ir(alvo.getAttribute('data-ir')); return; }
        if (alvo.hasAttribute('data-nav')) { ir('#/' + alvo.getAttribute('data-nav')); }
    });

    window.addEventListener('hashchange', desenhar);
    document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape') ui.fecharModal();
    });

    /* =========================================================
       TELA: primeiro acesso e pacto
       ========================================================= */
    F.telas.inicio = {
        render: function () {
            return '' +
                '<div class="abertura">' +
                '<h1 class="abertura-titulo">Fluência <span>180</span></h1>' +
                '<p class="abertura-sub">Um ano para transformar um inglês intermediário em fala quase nativa. ' +
                'Método de escola missionária de idiomas: pouca teoria, muita boca aberta, todo dia.</p>' +

                '<div class="cartao">' +
                '<h3>Como funciona</h3>' +
                '<ul class="lista-check">' +
                '<li><b>45 minutos por dia</b>, seis dias por semana. Trinta deles falando em voz alta.</li>' +
                '<li><b>Um alvo por semana</b>, por 48 semanas: um som, uma estrutura, uma função, uma missão real.</li>' +
                '<li><b>O app te ouve</b> e mostra, palavra por palavra, o que o ouvido de um nativo perderia.</li>' +
                '<li><b>Escada da coragem</b>: 20 degraus do espelho até ensinar uma aula inteira em inglês.</li>' +
                '</ul>' +
                '</div>' +

                '<div class="cartao cartao--pacto">' +
                '<h3>O pacto</h3>' +
                '<p>Na escola missionária existe uma regra chamada <b>SYL — Speak Your Language</b>. ' +
                'Durante o tempo combinado, não se fala a língua materna. Nem uma palavra. ' +
                'Não é rigor por rigor: é que a saída fácil do português é exatamente o que impede o cérebro ' +
                'de procurar o caminho em inglês.</p>' +
                '<label class="pacto-linha"><input type="checkbox" id="pc1"> Vou falar em voz alta todos os dias, mesmo sozinho, mesmo feio.</label>' +
                '<label class="pacto-linha"><input type="checkbox" id="pc2"> Quando faltar palavra, vou descrever em inglês em vez de trocar para o português.</label>' +
                '<label class="pacto-linha"><input type="checkbox" id="pc3"> Não vou pedir desculpa pelo meu inglês. Nunca.</label>' +
                '<label class="campo"><span>Seu nome</span><input type="text" id="nome" placeholder="como quer ser chamado" autocomplete="name"></label>' +
                '<button class="btn btn--grande" id="assinar" disabled>Assinar e começar a semana 1</button>' +
                '</div>' +

                '<p class="rodape-nota">Tudo fica salvo só no seu aparelho. Nenhum dado sai daqui.</p>' +
                '</div>';
        },
        montar: function () {
            var cxs = ['pc1', 'pc2', 'pc3'].map(ui.$);
            var bt = ui.$('assinar');
            function checa() {
                bt.disabled = !cxs.every(function (c) { return c.checked; });
            }
            cxs.forEach(function (c) { c.addEventListener('change', checa); });
            bt.addEventListener('click', function () {
                var s = F.store.get();
                s.pacto = true;
                s.nome = ui.$('nome').value.trim();
                s.criado = F.store.hoje();
                F.store.salvar();
                F.store.tocarStreak();
                ui.toast('Pacto assinado. Bem-vindo ao dia 1.');
                ir('#/hoje');
            });
        }
    };

    /* =========================================================
       TELA: configurações
       ========================================================= */

    /* Lembrete de estudo. O aviso chega antes da hora marcada, que é
       quando ainda dá para se organizar; no minuto exato já é tarde. */
    function cartaoLembrete(l) {
        var dias = F.lembrete.DIAS.map(function (d, i) {
            return '<button type="button" class="dia-btn' + (l.dias.indexOf(i) >= 0 ? ' is-on' : '') +
                '" data-dia="' + i + '" aria-pressed="' + (l.dias.indexOf(i) >= 0) + '">' +
                esc(d[0].toUpperCase() + d.slice(1)) + '</button>';
        }).join('');

        var antes = [0, 5, 10, 15, 30, 60].map(function (n) {
            return '<option value="' + n + '"' + (l.antes === n ? ' selected' : '') + '>' +
                (n ? n + ' minutos antes' : 'Na hora exata') + '</option>';
        }).join('');

        return '<div class="cartao">' +
            '<div class="cartao-titulo"><h3>Lembrete de estudo</h3>' +
            ui.ajuda('Como o lembrete funciona',
                '<p>O aviso chega alguns minutos <b>antes</b> do horário marcado, de propósito: no ' +
                'minuto exato você já está no meio de outra coisa. Com dez minutos dá tempo de ' +
                'terminar o que está fazendo e pegar o fone.</p>' +
                '<p>Os dias marcados são os dias de <b>estudo</b>. Se você marcar segunda às 00:05 ' +
                'com dez minutos de antecedência, o aviso toca no domingo às 23:55.</p>' +
                '<p>No aplicativo instalado quem avisa é o próprio Android, então o aviso chega ' +
                'com o app fechado e continua valendo depois de reiniciar o aparelho. No ' +
                'navegador, só enquanto esta página estiver aberta — para lembrar de verdade, ' +
                'use o app.</p>') +
            '</div>' +
            '<label class="campo campo--linha"><input type="checkbox" id="lem-ligado"' +
            (l.ligado ? ' checked' : '') + '><span>Avisar antes da hora de estudar</span></label>' +
            '<div id="lem-corpo"' + (l.ligado ? '' : ' hidden') + '>' +
            '<p class="ex-rotulo">Dias de estudo</p>' +
            '<div class="dias" id="lem-dias">' + dias + '</div>' +
            '<div class="grade-2">' +
            '<label class="campo"><span>Hora de começar</span>' +
            '<input type="time" id="lem-hora" value="' + esc(l.hora) + '"></label>' +
            '<label class="campo"><span>Avisar</span><select id="lem-antes">' + antes + '</select></label>' +
            '</div>' +
            '<p class="sub" id="lem-status">…</p>' +
            '<div class="linha-botoes" id="lem-acoes"></div>' +
            '</div></div>';
    }

    function montarLembrete() {
        var s = F.store.get();
        var l = s.config.lembrete;

        function salvar() {
            F.store.salvar();
            F.lembrete.aplicar();
            pintarStatus();
        }

        /* O estado do aparelho manda mais que a configuração: adianta pouco
           dizer "próximo aviso amanhã" se a permissão de notificar está
           negada. Cada falta tem o seu próprio botão de conserto. */
        function pintarStatus() {
            var texto = ui.$('lem-status'), acoes = ui.$('lem-acoes');
            if (!texto || !acoes) return;
            var e = F.lembrete.estado();
            acoes.innerHTML = '';

            if (l.ligado && !e.pode) {
                texto.innerHTML = '<b class="fb--erro">O aparelho ainda não deixa o app avisar.</b> ' +
                    'Sem essa permissão nada é enviado.';
                acoes.innerHTML = '<button class="btn btn--forte" id="lem-permitir">Permitir avisos</button>';
                ui.$('lem-permitir').addEventListener('click', function () {
                    F.lembrete.pedirPermissao().then(function (ok) {
                        if (ok) { F.lembrete.aplicar(); ui.toast('Avisos liberados.'); }
                        else ui.toast('O aparelho recusou. Ajustes → Aplicativos → Fluência 180 → Notificações.', 'erro');
                        pintarStatus();
                    });
                });
                return;
            }

            texto.textContent = F.lembrete.descrever() +
                (e.onde === 'navegador' ? ' Só enquanto esta página estiver aberta — no app instalado o aviso chega com ele fechado.' : '');

            if (l.ligado && e.onde === 'android' && !e.exato) {
                acoes.innerHTML = '<button class="btn" id="lem-exato">Liberar alarme no horário certo</button>';
                ui.$('lem-exato').addEventListener('click', function () { F.lembrete.abrirAjustesDeAlarme(); });
                texto.innerHTML += ' <b class="fb--erro">O Android está segurando o alarme exato</b> — ' +
                    'o aviso pode atrasar alguns minutos até você liberar.';
            }
        }

        var lig = ui.$('lem-ligado');
        if (!lig) return;
        lig.addEventListener('change', function () {
            l.ligado = this.checked;
            ui.$('lem-corpo').hidden = !l.ligado;
            F.store.salvar();
            F.lembrete.aplicar();
            /* Pinta antes de pedir a permissão: o diálogo do sistema pode
               demorar ou nem aparecer, e até lá a tela estaria mostrando o
               estado anterior. */
            pintarStatus();
            if (l.ligado && !F.lembrete.estado().pode) {
                F.lembrete.pedirPermissao().then(function () { F.lembrete.aplicar(); pintarStatus(); });
            }
        });

        ui.qq('#lem-dias [data-dia]').forEach(function (b) {
            b.addEventListener('click', function () {
                var d = parseInt(b.getAttribute('data-dia'), 10);
                var i = l.dias.indexOf(d);
                if (i >= 0) l.dias.splice(i, 1); else l.dias.push(d);
                l.dias.sort();
                b.classList.toggle('is-on', i < 0);
                b.setAttribute('aria-pressed', i < 0);
                salvar();
            });
        });

        var hora = ui.$('lem-hora');
        hora.addEventListener('change', function () { l.hora = this.value || '19:00'; salvar(); });
        ui.$('lem-antes').addEventListener('change', function () { l.antes = parseInt(this.value, 10); salvar(); });
        pintarStatus();
    }

    F.telas.config = {
        render: function () {
            var c = F.store.get().config;
            var vozes = F.voz.listaVozes();
            var opts = ['<option value="">Escolher automaticamente</option>'].concat(vozes.map(function (v) {
                return '<option value="' + esc(v.name) + '"' + (c.voz === v.name ? ' selected' : '') + '>' +
                    esc(v.name) + ' — ' + esc(v.lang) + '</option>';
            })).join('');

            return ui.cabecalho('Ajustes', 'Voz, meta diária e seus dados.') +
                '<div class="cartao">' +
                '<label class="campo"><span>Sotaque de referência</span>' +
                '<select id="cfg-sotaque">' +
                ['en-US:Americano', 'en-GB:Britânico', 'en-AU:Australiano', 'en-IN:Indiano'].map(function (o) {
                    var p = o.split(':');
                    return '<option value="' + p[0] + '"' + (c.sotaque === p[0] ? ' selected' : '') + '>' + p[1] + '</option>';
                }).join('') +
                '</select></label>' +

                '<label class="campo"><span>Voz do aparelho ' +
                (vozes.length ? '(' + vozes.length + ' em inglês)' : '(nenhuma voz em inglês encontrada)') +
                '</span><select id="cfg-voz">' + opts + '</select></label>' +
                '<button class="btn btn--som" data-falar="This is how I sound. Repeat after me, and listen to the rhythm.">🔊 Testar a voz</button>' +

                '<label class="campo"><span>Velocidade da fala: <b id="cfg-rate-v">' + c.rate + '×</b></span>' +
                '<input type="range" id="cfg-rate" min="0.5" max="1.3" step="0.05" value="' + c.rate + '"></label>' +

                '<label class="campo"><span>Meta diária: <b id="cfg-meta-v">' + c.metaDiaria + ' min</b></span>' +
                '<input type="range" id="cfg-meta" min="15" max="120" step="5" value="' + c.metaDiaria + '"></label>' +

                '<label class="campo campo--linha"><input type="checkbox" id="cfg-pt"' + (c.mostrarPt ? ' checked' : '') + '>' +
                '<span>Mostrar a tradução em português por padrão</span></label>' +
                '</div>' +

                cartaoLembrete(c.lembrete) +

                '<div class="cartao">' +
                '<h3>Seus dados</h3>' +
                '<p class="sub">Tudo fica neste aparelho. Baixe uma cópia antes de trocar de celular ou limpar o navegador.</p>' +
                '<div class="linha-botoes">' +
                '<button class="btn" id="exportar">Baixar backup</button>' +
                '<button class="btn" id="importar">Restaurar backup</button>' +
                '<button class="btn btn--perigo" id="zerar">Apagar tudo</button>' +
                '</div>' +
                '<input type="file" id="arquivo" accept="application/json" hidden>' +
                '</div>' +

                '<div class="cartao">' +
                '<h3>Recursos do aparelho</h3>' +
                '<ul class="lista-status">' +
                linhaStatus('Falar (voz do sistema)', F.voz.temFala()) +
                linhaStatus('Ouvir você (reconhecimento de fala)', F.voz.temEscuta()) +
                linhaStatus('Gravar sua voz', F.voz.temGravacao()) +
                '</ul>' +
                (F.voz.temEscuta() ? '' : '<p class="sub">Sem reconhecimento de fala, todos os exercícios continuam ' +
                    'funcionando: no lugar de falar, você digita o que diria. O ideal é usar o Chrome.</p>') +
                '</div>' +

                '<div class="cartao">' +
                '<h3>Diagnóstico</h3>' +
                '<p class="sub">O que o aparelho respondeu nas últimas tentativas de falar, ouvir e gravar. ' +
                'Serve para descobrir a causa quando algo falha — copie e mande junto com o relato.</p>' +
                '<pre class="diag-body" id="diag-corpo">carregando…</pre>' +
                '<div class="linha-botoes">' +
                '<button class="btn" id="diag-atualizar">Atualizar</button>' +
                '<button class="btn" id="diag-copiar">Copiar</button>' +
                '</div>' +
                '</div>';
        },
        montar: function () {
            var s = F.store.get();
            function liga(id, fn) { var e = ui.$(id); if (e) e.addEventListener('change', fn); }
            liga('cfg-sotaque', function () { s.config.sotaque = this.value; s.config.voz = ''; F.store.salvar(); desenhar(); });
            liga('cfg-voz', function () { s.config.voz = this.value; F.store.salvar(); });
            liga('cfg-pt', function () { s.config.mostrarPt = this.checked; F.store.salvar(); });

            var r = ui.$('cfg-rate');
            r.addEventListener('input', function () {
                s.config.rate = parseFloat(this.value);
                ui.$('cfg-rate-v').textContent = s.config.rate.toFixed(2) + '×';
                F.store.salvar();
            });
            var m = ui.$('cfg-meta');
            m.addEventListener('input', function () {
                s.config.metaDiaria = parseInt(this.value, 10);
                ui.$('cfg-meta-v').textContent = s.config.metaDiaria + ' min';
                F.store.salvar();
                pintarCabecalho();
            });

            montarLembrete();

            ui.$('exportar').addEventListener('click', function () {
                var blob = new Blob([F.store.exportar()], { type: 'application/json' });
                var a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'fluencia180-' + F.store.hoje() + '.json';
                document.body.appendChild(a); a.click(); a.remove();
                ui.toast('Backup baixado.');
            });
            ui.$('importar').addEventListener('click', function () { ui.$('arquivo').click(); });
            ui.$('arquivo').addEventListener('change', function () {
                var f = this.files[0];
                if (!f) return;
                var leitor = new FileReader();
                leitor.onload = function () {
                    try {
                        F.store.importar(leitor.result);
                        F.lembrete.aplicar();
                        ui.toast('Backup restaurado.');
                        desenhar();
                    } catch (e) { ui.toast('Arquivo inválido.', 'erro'); }
                };
                leitor.readAsText(f);
            });
            /* Diagnóstico: o que o app registrou no aparelho. */
            function pintarDiag() {
                var el = ui.$('diag-corpo');
                if (!el) return;
                var linhas = [];
                linhas.push('navegador: ' + navigator.userAgent);
                linhas.push('fala: ' + (F.voz.temFala() ? 'sim' : 'não') +
                    ' · escuta: ' + (F.voz.temEscuta() ? 'sim' : 'não') +
                    ' · gravação: ' + (F.voz.temGravacao() ? 'sim' : 'não'));
                var nativo = window.__android;
                linhas.push('app Android: ' + (nativo ? 'versão ' + nativo.versao : 'não (rodando no navegador)'));
                if (nativo && nativo.diagnostico) {
                    var d = nativo.diagnostico();
                    if (d) linhas.push('', d);
                }
                if (F.diag && F.diag.linhas().length) {
                    linhas.push('', '— eventos da página —', F.diag.linhas().join('\n'));
                }
                el.textContent = linhas.join('\n');
            }
            pintarDiag();
            ui.$('diag-atualizar').addEventListener('click', pintarDiag);
            ui.$('diag-copiar').addEventListener('click', function () {
                var t = ui.$('diag-corpo').textContent;
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(t).then(function () { ui.toast('Diagnóstico copiado.'); },
                        function () { ui.toast('Não consegui copiar — selecione o texto à mão.', 'erro'); });
                } else {
                    ui.toast('Selecione o texto e copie à mão.');
                }
            });

            ui.$('zerar').addEventListener('click', function () {
                if (!confirm('Apagar todo o seu progresso? Isso não tem volta.')) return;
                F.store.zerar();
                ir('#/inicio');
                desenhar();
            });
        }
    };

    function linhaStatus(nome, ok) {
        return '<li class="' + (ok ? 'ok' : 'nao') + '">' + (ok ? '✓' : '✕') + ' ' + esc(nome) + '</li>';
    }

    /* =========================================================
       TELA: o método (por que cada exercício existe)
       ========================================================= */
    F.telas.metodo = {
        render: function () {
            return ui.cabecalho('Por que este método funciona',
                'Escola missionária de idiomas: o que ela faz de diferente, e por que dá certo com brasileiro.') +
                '<div class="cartao texto-longo">' +
                '<h3>1. A língua se aprende usando, não estudando</h3>' +
                '<p>No treinamento missionário, o aluno recebe uma tarefa real — ensinar uma lição, visitar uma família — ' +
                'e a língua é o instrumento para cumprir a tarefa. Ninguém "estuda inglês": as pessoas resolvem coisas ' +
                'em inglês. É por isso que aqui todo exercício tem um objetivo comunicativo, e não uma lista de vocabulário.</p>' +

                '<h3>2. Bloco, não palavra</h3>' +
                '<p>Quem monta a frase peça por peça sempre vai falar devagar, por mais que saiba gramática. ' +
                'O falante fluente puxa blocos prontos da memória — <i>to be honest with you</i>, <i>that makes sense</i>, ' +
                '<i>I see where you are coming from</i>. São mais de seiscentos blocos aqui, por função, e a repetição ' +
                'espaçada garante que eles fiquem.</p>' +

                '<h3>3. Falar antes de estar pronto</h3>' +
                '<p>A regra SYL existe para tirar a saída fácil. Quem pode voltar ao português quando falta uma palavra ' +
                'nunca desenvolve a habilidade mais importante da fluência: <b>contornar</b> — explicar a palavra que ' +
                'você não sabe usando as que você sabe. Nativo faz isso o tempo todo.</p>' +

                '<h3>4. Repetição até virar reflexo</h3>' +
                '<p>Os drills de estímulo e resposta parecem antiquados, e são: vêm do método audiolingual, que a escola ' +
                'missionária nunca abandonou porque funciona para uma coisa específica — automatizar estrutura. ' +
                'Enquanto você precisar pensar para formar um present perfect, ele não existe na sua fala espontânea.</p>' +

                '<h3>5. Constância mata talento</h3>' +
                '<p>Quarenta e cinco minutos por dia durante seis meses são cento e trinta e cinco horas de prática ' +
                'concentrada. Três horas num sábado, uma vez por mês, não são nada. O app mede sua sequência de dias ' +
                'porque é a única métrica que prevê o resultado final.</p>' +

                '<h3>6. Erro corrigido na hora, sem drama</h3>' +
                '<p>O app te ouve, mostra o que saiu diferente e nomeia o erro típico de brasileiro por trás. ' +
                'Sem nota vermelha, sem humilhação, sem elogio falso: informação exata e a próxima tentativa.</p>' +

                '<h3>O que este método NÃO é</h3>' +
                '<p>Não é curso de gramática, não substitui conversar com gente de verdade e não faz milagre em quem ' +
                'não abre a boca. As missões semanais existem justamente para te empurrar para fora do app — ' +
                'é lá fora que a fluência acontece. Aqui é o treino.</p>' +
                '</div>';
        }
    };

    /* ---------------- boot ---------------- */

    F.app = { ir: ir, desenhar: desenhar, pintarCabecalho: pintarCabecalho };

    document.addEventListener('DOMContentLoaded', function () {
        F.store.limparGravacoesMortas();
        /* Reaplica o lembrete na abertura: se o aparelho perdeu os alarmes
           (backup restaurado, app reinstalado), o plano guardado aqui é a
           única cópia que sobrou. */
        F.lembrete.aplicar();
        if (!location.hash) location.hash = F.store.get().pacto ? '#/hoje' : '#/inicio';
        desenhar();
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(function () { });
        }
    });
})();
