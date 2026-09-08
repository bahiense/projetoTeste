/* =========================================================
   LEMBRETE DE PRÁTICA — o aviso da hora de orar em voz alta.

   O programa de 21 dias morre no dia em que a pessoa esquece.
   O aviso pode vir alguns minutos ANTES do horário marcado, que é
   quando ainda dá para se recolher num canto — no minuto exato já
   é tarde.

   Quem avisa de verdade é o Android, pelo AlarmManager: o
   navegador só consegue avisar com a página aberta, e isso não
   serve para lembrar de nada.
   ========================================================= */
window.A = window.A || {};

A.lembrete = (function () {
    'use strict';

    var DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    var timerWeb = null;

    function cfg() { return A.store.get().config.lembrete; }

    function ponte() {
        return (window.__android && window.__android.lembretes) || null;
    }

    /* ---------------- próximo disparo ----------------

       O dia escolhido é o dia do ESTUDO, não o do aviso: quem marca
       segunda 00h05 com dez minutos de antecedência é avisado no
       domingo às 23h55, e não numa segunda que não existe. */
    function proximo(quando) {
        var c = cfg();
        if (!c.ligado || !c.dias.length) return null;
        var partes = String(c.hora || '20:00').split(':');
        var h = parseInt(partes[0], 10) || 0, m = parseInt(partes[1], 10) || 0;
        var agora = quando || new Date();

        for (var i = 0; i < 9; i++) {
            var pratica = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + i, h, m, 0, 0);
            if (c.dias.indexOf(pratica.getDay()) < 0) continue;
            var aviso = new Date(pratica.getTime() - (c.antes || 0) * 60000);
            if (aviso.getTime() > agora.getTime()) return { aviso: aviso, pratica: pratica };
        }
        return null;
    }

    function doisDigitos(n) { return (n < 10 ? '0' : '') + n; }

    function descrever() {
        var c = cfg();
        if (!c.ligado) return 'Desligado.';
        if (!c.dias.length) return 'Nenhum dia escolhido — marque pelo menos um.';
        var p = proximo();
        if (!p) return 'Sem próximo aviso.';
        var hoje = new Date();
        var dif = Math.floor((p.aviso - new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())) / 86400000);
        var quando = dif === 0 ? 'hoje' : dif === 1 ? 'amanhã' : DIAS[p.aviso.getDay()];
        return 'Próximo aviso ' + quando + ' às ' +
            doisDigitos(p.aviso.getHours()) + ':' + doisDigitos(p.aviso.getMinutes()) +
            (c.antes ? ' (prática às ' + doisDigitos(p.pratica.getHours()) + ':' + doisDigitos(p.pratica.getMinutes()) + ')' : '');
    }

    /* ---------------- estado do aparelho ---------------- */

    /* Três coisas podem faltar, e cada uma tem conserto diferente:
       permissão de notificar, permissão de alarme exato, e o app
       nativo em si. Misturar as três num "não funcionou" deixa o
       aluno sem saber o que fazer. */
    function estado() {
        var p = ponte();
        if (!p) {
            var web = typeof Notification !== 'undefined';
            return {
                onde: 'navegador',
                pode: web && Notification.permission === 'granted',
                permissao: web ? Notification.permission : 'indisponivel',
                exato: true
            };
        }
        var bruto = {};
        try { bruto = JSON.parse(p.estado() || '{}'); } catch (e) { }
        return {
            onde: 'android',
            pode: !!bruto.permissao,
            permissao: bruto.permissao ? 'granted' : 'denied',
            exato: bruto.exato !== false,
            agendados: bruto.agendados || 0
        };
    }

    /* Pede a permissão e devolve o resultado por promessa, para a tela
       poder mostrar o que aconteceu sem ficar consultando. */
    function pedirPermissao() {
        var p = ponte();
        if (p) {
            return new Promise(function (resolve) {
                window.__pontePermissaoAviso = function (ok) {
                    window.__pontePermissaoAviso = null;
                    resolve(!!ok);
                };
                try { p.pedirPermissao(); } catch (e) { resolve(false); }
                /* Se o Android não responder (permissão já negada duas vezes,
                   por exemplo), não deixa a tela esperando para sempre. */
                setTimeout(function () {
                    if (window.__pontePermissaoAviso) {
                        window.__pontePermissaoAviso = null;
                        resolve(estado().pode);
                    }
                }, 20000);
            });
        }
        if (typeof Notification === 'undefined') return Promise.resolve(false);
        return Notification.requestPermission().then(function (r) { return r === 'granted'; });
    }

    function abrirAjustesDeAlarme() {
        var p = ponte();
        if (p && p.abrirAjustesExato) { try { p.abrirAjustesExato(); } catch (e) { } }
    }

    /* ---------------- aplicar ----------------

       Chamado sempre que a configuração muda. No Android entrega o
       plano inteiro para o lado nativo reagendar; no navegador arma
       um temporizador que só vale enquanto a página estiver aberta. */
    function aplicar() {
        var c = cfg();
        var p = ponte();
        if (p) {
            try {
                p.agendar(JSON.stringify({
                    ligado: !!c.ligado,
                    dias: c.dias || [],
                    hora: c.hora || '20:00',
                    antes: c.antes || 0
                }));
            } catch (e) { }
            return;
        }
        armarNoNavegador();
    }

    function armarNoNavegador() {
        clearTimeout(timerWeb);
        var c = cfg();
        if (!c.ligado || typeof Notification === 'undefined') return;
        if (Notification.permission !== 'granted') return;
        var p = proximo();
        if (!p) return;
        var espera = p.aviso - new Date();
        /* setTimeout com valor acima de ~24,8 dias estoura; e de qualquer
           forma a aba não fica aberta tanto tempo. */
        if (espera > 86400000) return;
        timerWeb = setTimeout(function () {
            try {
                new Notification('Altar', {
                    body: texto(c.antes),
                    tag: 'altar-pratica'
                });
            } catch (e) { }
            armarNoNavegador();
        }, espera);
    }

    function texto(antes) {
        if (!antes) return 'Hora de praticar. O exercício de hoje leva poucos minutos.';
        return 'Sua prática começa em ' + antes + ' minuto' + (antes > 1 ? 's' : '') +
            '. Procure um lugar onde dê para orar em voz alta.';
    }

    return {
        DIAS: DIAS,
        proximo: proximo,
        descrever: descrever,
        estado: estado,
        pedirPermissao: pedirPermissao,
        abrirAjustesDeAlarme: abrirAjustesDeAlarme,
        aplicar: aplicar
    };
})();
