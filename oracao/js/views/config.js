/* =========================================================
   Ajustes — nome, lembrete, voz, privacidade e backup.
   ========================================================= */
window.A = window.A || {};
A.telas = A.telas || {};

(function () {
    'use strict';

    A.telas.config = function (el) {
        var u = A.ui, s = A.store.get(), c = s.config;

        var html = u.cabecalho('Ajustes');

        html += '<div class="cartao"><h3>Seu nome</h3>' +
            '<input class="entrada" id="cf-nome" value="' + u.esc(s.nome) + '" placeholder="como o app te chama"></div>';

        /* ---- lembrete ---- */
        var lem = c.lembrete;
        html += '<div class="cartao"><h3>Lembrete de prática</h3>' +
            '<label class="campo campo--linha"><input type="checkbox" id="cf-lem" ' +
            (lem.ligado ? 'checked' : '') + '><span>Me avisar todo dia</span></label>' +
            '<div id="cf-lem-box"' + (lem.ligado ? '' : ' hidden') + '>' +
            '<div class="dias-semana">' + A.lembrete.DIAS.map(function (d, i) {
                return '<button class="dia-sem' + (lem.dias.indexOf(i) >= 0 ? ' is-on' : '') +
                    '" data-dia="' + i + '">' + d + '</button>';
            }).join('') + '</div>' +
            '<label class="campo campo--linha"><span>Hora</span>' +
            '<input type="time" id="cf-hora" value="' + u.esc(lem.hora) + '"></label>' +
            '<label class="campo campo--linha"><span>Avisar antes</span>' +
            '<select id="cf-antes">' + [0, 5, 10, 15, 30].map(function (n) {
                return '<option value="' + n + '"' + (lem.antes === n ? ' selected' : '') + '>' +
                    (n ? n + ' minutos' : 'na hora') + '</option>';
            }).join('') + '</select></label>' +
            '<p class="legenda" id="cf-lem-txt">' + u.esc(A.lembrete.descrever()) + '</p>' +
            '</div></div>';

        /* ---- voz ---- */
        var vozes = A.voz.listaVozes();
        html += '<div class="cartao"><h3>Voz de leitura</h3>' +
            (vozes.length ?
                '<label class="campo"><span>Qual voz lê os exemplos</span><select id="cf-voz">' +
                '<option value="">automática</option>' +
                vozes.map(function (v) {
                    return '<option value="' + u.esc(v.name) + '"' +
                        (c.vozLeitura === v.name ? ' selected' : '') + '>' + u.esc(v.name) + '</option>';
                }).join('') + '</select></label>' :
                '<p class="legenda">Nenhuma voz em português encontrada neste aparelho.</p>') +
            '<label class="campo campo--slider"><span>Velocidade: <b id="cf-vel-n">' +
            c.velocidade + '×</b></span>' +
            '<input type="range" id="cf-vel" min="0.6" max="1.4" step="0.1" value="' + c.velocidade + '"></label>' +
            u.botaoOuvir('Senhor, nós nos colocamos diante de Ti neste momento.', 'Testar') +
            '</div>';

        /* ---- privacidade ---- */
        html += '<div class="cartao"><h3>Privacidade</h3>' +
            '<p class="sub">Tudo fica neste aparelho. O app não tem servidor e não envia nada para lugar ' +
            'nenhum — nem as orações, nem as anotações. O reconhecimento de fala é o do próprio ' +
            'navegador ou do Android.</p>' +
            '<label class="campo campo--linha"><input type="checkbox" id="cf-texto" ' +
            (c.guardarTexto ? 'checked' : '') + '><span>Guardar o texto das orações</span></label>' +
            '<p class="legenda">Oração pública fala da vida de outras pessoas. Se preferir, o app guarda ' +
            'só as medidas e descarta o texto.</p>' +
            '<div class="linha-botoes">' +
            '<button class="btn btn--perigo" id="cf-limpar-texto">Apagar os textos guardados</button>' +
            '</div></div>';

        /* ---- backup ---- */
        html += '<div class="cartao"><h3>Backup</h3>' +
            '<p class="sub">Trocar de aparelho apaga tudo. O arquivo abaixo leva o seu progresso junto.</p>' +
            '<div class="linha-botoes">' +
            '<button class="btn" id="cf-exportar">Baixar backup</button>' +
            '<button class="btn" id="cf-importar">Restaurar de um arquivo</button>' +
            '<input type="file" id="cf-arquivo" accept="application/json" hidden>' +
            '</div></div>';

        /* ---- diagnóstico e zerar ---- */
        html += '<div class="cartao"><h3>Diagnóstico</h3><dl class="alvos">' +
            '<dt>Reconhecimento de fala</dt><dd>' + (A.voz.temEscuta() ? 'disponível' : 'indisponível neste aparelho') + '</dd>' +
            '<dt>Leitura em voz alta</dt><dd>' + (A.voz.temFala() ? 'disponível' : 'indisponível') + '</dd>' +
            '<dt>App Android</dt><dd>' + (window.__android ? 'sim (versão ' + window.__android.versao + ')' : 'não — rodando no navegador') + '</dd>' +
            '</dl>' +
            (A.diag.linhas().length ? '<pre class="diag">' + u.esc(A.diag.linhas().join('\n')) + '</pre>' : '') +
            '</div>';

        html += '<div class="linha-botoes"><button class="btn btn--perigo" id="cf-zerar">Apagar tudo e recomeçar</button></div>';

        html += '<p class="legenda creditos">Conteúdo baseado no Método Altar (módulos 1 a 10, dicionário e ' +
            'os 50 versículos). O app organiza o material e cobra a prática — a oração é sua.</p>';

        el.innerHTML = html;
        ligar(el);
    };

    function ligar(el) {
        var u = A.ui, s = A.store.get(), c = s.config;

        u.$('cf-nome').onchange = function () { s.nome = this.value.trim(); A.store.salvar(); };

        u.$('cf-lem').onchange = function () {
            c.lembrete.ligado = this.checked;
            u.$('cf-lem-box').hidden = !this.checked;
            if (this.checked) {
                A.lembrete.pedirPermissao().then(function (ok) {
                    if (!ok) u.toast('O aparelho não liberou as notificações.', 'ruim');
                    aplicar();
                });
            } else aplicar();
        };

        u.qq('[data-dia]', el).forEach(function (b) {
            b.onclick = function () {
                var d = parseInt(b.getAttribute('data-dia'), 10);
                var i = c.lembrete.dias.indexOf(d);
                if (i >= 0) c.lembrete.dias.splice(i, 1); else c.lembrete.dias.push(d);
                b.classList.toggle('is-on');
                aplicar();
            };
        });

        u.$('cf-hora').onchange = function () { c.lembrete.hora = this.value; aplicar(); };
        u.$('cf-antes').onchange = function () { c.lembrete.antes = parseInt(this.value, 10); aplicar(); };

        function aplicar() {
            A.store.salvar();
            A.lembrete.aplicar();
            var t = u.$('cf-lem-txt');
            if (t) t.textContent = A.lembrete.descrever();
        }

        var vz = u.$('cf-voz');
        if (vz) vz.onchange = function () { c.vozLeitura = this.value; A.store.salvar(); };

        var vel = u.$('cf-vel');
        vel.oninput = function () {
            c.velocidade = parseFloat(this.value);
            u.$('cf-vel-n').textContent = c.velocidade + '×';
            A.store.salvar();
        };

        u.$('cf-texto').onchange = function () { c.guardarTexto = this.checked; A.store.salvar(); };

        u.$('cf-limpar-texto').onclick = function () {
            if (!confirm('Apagar o texto de todas as orações guardadas? As medidas continuam.')) return;
            A.store.apagarTextos();
            u.toast('Textos apagados.');
        };

        u.$('cf-exportar').onclick = function () {
            var blob = new Blob([A.store.exportar()], { type: 'application/json' });
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'altar-backup-' + A.store.hoje() + '.json';
            a.click();
            setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
        };

        u.$('cf-importar').onclick = function () { u.$('cf-arquivo').click(); };
        u.$('cf-arquivo').onchange = function () {
            var f = this.files && this.files[0];
            if (!f) return;
            var leitor = new FileReader();
            leitor.onload = function () {
                try {
                    A.store.importar(String(leitor.result));
                    u.toast('Backup restaurado.');
                    location.hash = '#/hoje';
                    location.reload();
                } catch (e) {
                    u.toast('Arquivo inválido.', 'ruim');
                }
            };
            leitor.readAsText(f);
        };

        u.$('cf-zerar').onclick = function () {
            if (!confirm('Apagar todo o progresso, as orações e as anotações? Não dá para desfazer.')) return;
            A.store.zerar();
            location.hash = '#/hoje';
            location.reload();
        };
    }
})();
