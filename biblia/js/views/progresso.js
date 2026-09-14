/* =========================================================
   TELA PROGRESSO — os números, o calendário e o histórico.
   Serve para uma coisa só: mostrar que a leitura de um capítulo
   por dia vira Bíblia inteira.
   ========================================================= */
window.B = window.B || {};
B.telas = B.telas || {};

B.telas.progresso = (function () {
    'use strict';
    var ui = B.ui, esc = B.ui.esc, bib = B.biblia, store = B.store, plano = B.plano;

    function render() {
        var st = plano.estatisticas();
        var pb = plano.progressoBiblia();
        var prev = plano.previsao();

        return '' +
            '<header class="tela-topo"><h2>Progresso</h2></header>' +

            '<div class="cartao numeros">' +
            '<div class="numero numero--grande">' +
            '<b>' + pb.pct + '%</b><small>da Bíblia lida ' +
            ui.ajuda('O que essa conta considera',
                '<p>Capítulos distintos marcados como lidos, dos 1.189 da Bíblia — ' +
                'venham do plano diário ou da importação do que você já tinha lido.</p>' +
                '<p>Reler um capítulo não aumenta a porcentagem: ela mede cobertura, ' +
                'não esforço. Para esforço, olhe os capítulos lidos no app e a sequência.</p>') +
            '</small></div>' +
            '<div class="numero"><b>' + pb.lidos + '</b><small>capítulos lidos</small></div>' +
            '<div class="numero"><b>' + st.faltam + '</b><small>ainda não lidos</small></div>' +
            '<div class="numero"><b>' + st.biblias + '</b><small>Bíblias completas</small></div>' +
            '<div class="numero"><b>' + st.sequencia + '</b><small>dias seguidos</small></div>' +
            '<div class="numero"><b>' + st.recorde + '</b><small>recorde de dias</small></div>' +
            '<div class="numero"><b>' + st.media + '</b><small>capítulos por dia no app</small></div>' +
            '<div class="numero"><b>' + st.dias + '</b><small>dias de leitura</small></div>' +
            '<div class="numero"><b>' + st.noApp + '</b><small>marcações no app ' +
            ui.ajuda('Marcações × capítulos lidos',
                '<p><b>Capítulos lidos</b> conta capítulos distintos: reler Salmos 23 não ' +
                'aumenta o número, porque ele mede quanto da Bíblia você já cobriu.</p>' +
                '<p><b>Marcações no app</b> conta cada vez que você tocou em "marcar como ' +
                'lido", releitura incluída. É o número que o app antigo mostrava como ' +
                '"capítulos lidos", e é dele que sai a média por dia.</p>') +
            '</small></div>' +
            '</div>' +

            (prev && prev.dias > 0
                ? '<p class="faixa-previsao">Faltam <b>' + st.faltam + '</b> capítulos. No ritmo ' +
                'dos últimos 30 dias, isso dá ' + (prev.dias > 400
                    ? Math.round(prev.dias / 365 * 10) / 10 + ' anos'
                    : prev.dias + ' dias') + '.</p>'
                : '<p class="faixa-previsao">Marque alguns dias de leitura e aparece aqui a ' +
                'previsão de quando a Bíblia inteira fecha.</p>') +

            '<h3 class="secao">Últimos 35 dias</h3>' +
            '<div class="cartao">' + calendario() + '</div>' +

            '<h3 class="secao">Por grupo</h3>' +
            '<div class="cartao">' + porGrupo() + '</div>' +

            '<h3 class="secao">Conquistas</h3>' +
            '<div class="cartao" id="conquistas"></div>' +

            '<h3 class="secao">Histórico</h3>' +
            '<div class="cartao">' + historico() + '</div>' +

            '<h3 class="secao">Seus dados</h3>' +
            '<div class="cartao cartao--acoes">' +
            '<button class="btn btn--forte btn--largo" data-backup>Baixar backup completo</button>' +
            '<p class="dica">Um arquivo JSON com o plano, tudo que você marcou como lido e os ' +
            'estudos gerados. É assim que a leitura passa para outro celular — e é a sua ' +
            'garantia: se você apagar o app, o navegador leva os dados junto.</p>' +
            (B.ia.modo() === 'claude'
                ? '<p class="dica dica--honesta">Esta é a versão que roda dentro do Claude. ' +
                'Gere os estudos aqui, baixe o backup e restaure no app instalado no ' +
                'celular: os estudos vão junto no arquivo e passam a abrir lá, sem ' +
                'internet e sem chave de API.</p>'
                : '') +
            '<button class="btn btn--fraco btn--largo" data-texto>Exportar estudos em texto</button>' +
            '<button class="btn btn--fraco btn--largo btn--perigo" data-zerar>Apagar tudo</button>' +
            '</div>';
    }

    function calendario() {
        var e = store.get();
        var lidas = {};
        e.datas.forEach(function (d) { lidas[d] = true; });
        var porDia = {};
        e.historico.forEach(function (h) {
            var d = store.hojeISO(new Date(h.data));
            porDia[d] = (porDia[d] || 0) + 1;
        });

        var html = '<div class="cal">';
        var hoje = new Date();
        for (var i = 34; i >= 0; i--) {
            var d = new Date(hoje);
            d.setDate(d.getDate() - i);
            var iso = store.hojeISO(d);
            var n = porDia[iso] || 0;
            var nivel = !lidas[iso] ? 0 : n >= 8 ? 4 : n >= 5 ? 3 : n >= 2 ? 2 : 1;
            html += '<span class="cal-dia n' + nivel + (i === 0 ? ' is-hoje' : '') +
                '" title="' + iso + (n ? ': ' + n + ' capítulos' : '') + '">' + d.getDate() + '</span>';
        }
        html += '</div>' +
            '<div class="cal-legenda"><span>menos</span>' +
            '<i class="n0"></i><i class="n1"></i><i class="n2"></i><i class="n3"></i><i class="n4"></i>' +
            '<span>mais</span></div>';
        return html;
    }

    function porGrupo() {
        return bib.GRUPOS.map(function (g) {
            var real = plano.progressoReal(g.id);
            var gs = store.get().grupos[g.id];
            var atual = plano.leituraAtual(g.id);
            return '<div class="linha-grupo">' +
                '<span class="grupo-icone">' + g.icone + '</span>' +
                '<div class="linha-txt">' +
                '<b>' + esc(g.nome) + '</b>' +
                '<small>' + real.lidos + '/' + real.total + ' capítulos · ' + gs.ciclos + ' ciclos · ' +
                'agora em ' + esc(atual.ref) + '</small>' +
                ui.barra(real.pct) +
                '</div>' +
                '<span class="linha-pct">' + real.pct + '%</span>' +
                '</div>';
        }).join('');
    }

    function historico() {
        var h = store.get().historico;
        if (!h.length) {
            return '<div class="vazio"><div class="vazio-icone">📖</div>' +
                '<p>Nenhuma leitura marcada ainda.</p></div>';
        }
        return '<div class="hist">' + h.slice(0, 40).map(function (x) {
            return '<div class="hist-item">' +
                '<span class="hist-icone">' + (x.icone || '📖') + '</span>' +
                '<span class="hist-txt"><b>' + esc(x.livro) + ' ' + x.cap + '</b>' +
                '<small>' + esc(x.grupo) + '</small></span>' +
                '<span class="hist-data">' + ui.quando(x.data) + '</span>' +
                '</div>';
        }).join('') + '</div>' +
            (h.length > 40 ? '<p class="dica">Mostrando as 40 leituras mais recentes de ' +
                h.length + ' guardadas.</p>' : '');
    }

    function depois(el) {
        B.estudos.contar().then(function (n) {
            var caixa = ui.$('conquistas');
            if (!caixa) return;
            caixa.innerHTML = plano.conquistas(n).map(function (c) {
                return '<div class="conquista' + (c.ok ? '' : ' is-off') + '">' +
                    '<span class="conquista-icone">' + c.icone + '</span>' +
                    '<span class="conquista-txt"><b>' + esc(c.nome) + '</b>' +
                    '<small>' + esc(c.desc) + '</small></span>' +
                    '<span>' + (c.ok ? '✓' : '🔒') + '</span></div>';
            }).join('');
        });

        ui.q('[data-backup]', el).addEventListener('click', function () {
            B.estudos.listar().then(function (estudos) {
                var dados = store.paraBackup(estudos);
                ui.baixar('leitura-biblica-' + store.hojeISO() + '.json',
                    JSON.stringify(dados, null, 2));
                ui.toast('Backup salvo nos downloads. A chave da API não vai no arquivo.');
            });
        });

        ui.q('[data-texto]', el).addEventListener('click', function () {
            B.estudos.listar().then(function (estudos) {
                if (!estudos.length) return ui.toast('Nenhum estudo para exportar.', 'aviso');
                var txt = estudos.map(function (e) {
                    return '# ' + e.titulo + '\n\n' + e.texto +
                        (e.perguntas || []).map(function (p) {
                            return '\n\n## Pergunta: ' + p.q + '\n\n' + p.r;
                        }).join('');
                }).join('\n\n\n---\n\n\n');
                ui.baixar('estudos-biblicos-' + store.hojeISO() + '.md', txt, 'text/markdown');
                ui.toast(estudos.length + ' estudos exportados.');
            });
        });

        ui.q('[data-zerar]', el).addEventListener('click', function () {
            ui.confirmar('Apagar tudo',
                'Apaga o plano, tudo que você marcou como lido e todos os estudos guardados. ' +
                'Não dá para desfazer. Baixe o backup antes se tiver dúvida.',
                { textoOk: 'Apagar tudo', perigo: true }).then(function (ok) {
                    if (!ok) return;
                    var cfg = store.get().config;
                    store.zerar();
                    /* A chave da API fica: apagar leitura não é apagar configuração. */
                    store.get().config = cfg;
                    store.salvar();
                    B.estudos.limpar().then(function () {
                        B.app.ir('hoje');
                        B.app.pintar();
                        ui.toast('Tudo apagado. A chave da API foi mantida.');
                    });
                });
        });
    }

    return { render: render, depois: depois };
})();
