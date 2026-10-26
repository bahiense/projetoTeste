/* =========================================================
   A travessia dos estudos entre a Oficina e o app instalado.

   Duas metades da mesma coisa, e cada aparelho vê a sua: onde o Claude
   escreve, um botão deixa um pacote na pasta Downloads; no app, que não
   alcança o Claude, a pasta apontada uma vez faz os pacotes entrarem
   sozinhos na abertura.

   Mora fora das telas porque as duas metades aparecem em lugares
   diferentes — a de gerar na Oficina, a de receber em Ajustes, que é
   tudo que o app instalado tem.
   ========================================================= */
window.B = window.B || {};

B.travessia = (function () {
    'use strict';
    var ui = B.ui;

    /* A Oficina publicada: a mesma página deste app, aberta dentro do Claude,
       onde ela ganha o motor que escreve os estudos. Endereço fixo porque é
       um só — e privado: quem abrir sem estar na conta certa não entra. */
    var OFICINA = 'https://claude.ai/artifact/TJkcMZ9aPF3TyQwtFvEi3Z';

    /**
     * A travessia dos estudos entre o Chrome e o app instalado.
     *
     * Duas metades da mesma coisa, e cada aparelho vê a sua: no Chrome,
     * onde o Claude escreve, um botão deixa um pacote na pasta Downloads;
     * no app, que não alcança o Claude, a pasta apontada uma vez faz os
     * pacotes entrarem sozinhos na abertura.
     *
     * Quem não está em nenhum dos dois casos — navegador comum, sem
     * Claude e sem ponte — não vê quadro nenhum: seria um passo a mais
     * sem lugar nenhum para onde ir.
     */
    function pintar(onde) {
        var caixa = ui.$(onde);
        if (!caixa) return;
        var noClaude = B.ia.modo() === 'claude';
        var noApp = !!(B.copia && B.copia.pontePacotes && B.copia.pontePacotes());
        if (!noClaude && !noApp) { caixa.hidden = true; return; }
        caixa.hidden = false;

        if (noApp) return ladoDoApp(caixa, onde);
        return ladoDoClaude(caixa, onde);
    }

    function ladoDoClaude(caixa, onde) {
        caixa.innerHTML = '<h3>Levar os estudos para o app</h3>' +
            '<p class="dica">O app instalado no celular <b>não alcança o Claude</b> — ele ' +
            'só existe dentro do claude.ai. Então quem gera é esta página, e os estudos ' +
            'atravessam num arquivo: um toque aqui salva um pacote na pasta Downloads, e ' +
            'o app acha sozinho quando você abrir.</p>' +
            '<p class="carregando">Conferindo…</p>';

        return B.copia.aLevar().then(function (n) {
            var miolo = caixa.querySelector('.carregando');
            if (!miolo) return;
            if (!n) {
                miolo.outerHTML = '<p class="aviso aviso--ok">Tudo que está gerado já foi ' +
                    'levado. Gere mais e volte aqui.</p>';
                return;
            }
            miolo.outerHTML =
                '<ul class="resumo"><li><b>' + n.toLocaleString('pt-BR') + '</b> estudo' +
                (n === 1 ? '' : 's') + ' esperando a travessia</li></ul>' +
                '<button class="btn btn--forte btn--largo" id="levar-pacote">' +
                'Salvar o próximo pacote</button>' +
                '<p class="dica">Vai em pacotes de quatrocentos. A Bíblia inteira num ' +
                'arquivo só dá 30 MB, e abrir isso de uma vez derruba o app num celular ' +
                'modesto.</p>';
            var b = ui.$('levar-pacote');
            b.addEventListener('click', function () {
                b.disabled = true;
                b.textContent = 'Salvando…';
                B.copia.levarPacote().then(function (r) {
                    if (r.recusado || !r.quantos) {
                        b.disabled = false;
                        b.textContent = 'Salvar o próximo pacote';
                        return;
                    }
                    ui.toast(r.quantos + ' estudos salvos em ' + r.nome + '.');
                    pintar(onde);
                }, function () {
                    b.disabled = false;
                    b.textContent = 'Salvar o próximo pacote';
                    ui.toast('Não consegui montar o pacote.', 'erro');
                });
            });
        });
    }

    function ladoDoApp(caixa, onde) {
        var tem = B.copia.pastaTem();
        caixa.innerHTML = '<h3>Trazer os estudos do Claude</h3>' +
            '<p class="dica">Os estudos escritos pelo Claude ficam num arquivo na pasta ' +
            'Downloads. Para o app ler esse arquivo, o Android exige que <b>você aponte a ' +
            'pasta uma vez</b> — arquivo baixado por outro app não aparece sozinho, e ' +
            'pedir permissão de armazenamento inteira, aqui, seria pedir demais.</p>' +
            (tem
                ? '<p class="aviso aviso--ok"><b>Ligado.</b> Toda vez que você abrir o app, ' +
                'o que o Claude gerou entra sozinho.</p>' +
                '<button class="btn btn--fraco btn--largo" id="trazer-agora">' +
                'Procurar agora</button>'
                : '<button class="btn btn--forte btn--largo" id="apontar-pasta">' +
                'Escolher a pasta Downloads</button>') +

            /* Os estudos nascem lá; sem este link, chegar à Oficina exige
               achar um endereço guardado em outro lugar. */
            '<hr class="risco">' +
            '<p class="dica">É na <b>Oficina</b> que eles são escritos — a mesma página deste ' +
            'app, aberta dentro do Claude, no navegador do celular. Lá você aperta ' +
            '<b>Começar o mutirão</b> e, de vez em quando, <b>Salvar o próximo pacote</b>.</p>' +
            '<a class="btn btn--forte btn--largo" href="' + OFICINA + '" ' +
            'target="_blank" rel="noopener">Abrir a Oficina no navegador</a>';

        var bp = ui.$('apontar-pasta');
        if (bp) bp.addEventListener('click', function () {
            bp.disabled = true;
            B.copia.pastaPedir().then(function (ok) {
                if (!ok) {
                    bp.disabled = false;
                    ui.toast('Pasta não escolhida.', 'erro');
                    return;
                }
                pintar(onde);
                procurar();
            });
        });

        var ba = ui.$('trazer-agora');
        if (ba) ba.addEventListener('click', function () {
            ba.disabled = true;
            ba.textContent = 'Procurando…';
            procurar().then(function () {
                ba.disabled = false;
                ba.textContent = 'Procurar agora';
            });
        });

        function procurar() {
            return B.copia.trazerPacotes().then(function (n) {
                ui.toast(n
                    ? n + ' estudo' + (n === 1 ? '' : 's') + ' do Claude ' +
                    (n === 1 ? 'entrou' : 'entraram') + ' no app.'
                    : 'Nenhum pacote novo na pasta.');
                if (n) B.app.pintar();
            });
        }
        return Promise.resolve();
    }

    return { pintar: pintar };
})();
