/* =========================================================
   Biblioteca — dicionário, versículos e orações modelo.

   Três materiais de consulta que existem para serem abertos ANTES
   da oração, não durante: ler no meio de uma oração pública é
   exatamente o oposto de estar presente.
   ========================================================= */
window.A = window.A || {};
A.telas = A.telas || {};

(function () {
    'use strict';

    function abas(atual) {
        var itens = [
            { id: 'dicionario', n: 'Dicionário' },
            { id: 'versiculos', n: 'Versículos' },
            { id: 'modelos', n: 'Modelos' },
            { id: 'antesdepois', n: 'Antes e depois' }
        ];
        return '<div class="pilulas">' + itens.map(function (i) {
            return '<a class="pilula' + (i.id === atual ? ' is-on' : '') + '" href="#/' + i.id + '">' + i.n + '</a>';
        }).join('') + '</div>';
    }

    A.telas.biblioteca = function (el) { location.hash = '#/dicionario'; };

    /* ---------------- dicionário ---------------- */

    A.telas.dicionario = function (el) {
        var u = A.ui;
        var busca = (A.telas.dicionario.busca || '').toLowerCase();
        var cat = A.telas.dicionario.cat || 'todas';

        var lista = A.DICIONARIO.filter(function (d) {
            if (cat !== 'todas' && d.cat !== cat) return false;
            if (!busca) return true;
            var alvo = (d.p + ' ' + (d.sig || '') + ' ' + (d.ex || '') + ' ' + (d.vez || '')).toLowerCase();
            return alvo.indexOf(busca) >= 0;
        });

        var html = u.cabecalho('Dicionário Altar', 'Fale melhor sem falar difícil. Cem palavras e expressões.') +
            abas('dicionario');

        html += '<input class="entrada" id="dic-busca" placeholder="Buscar palavra ou ideia…" value="' +
            u.esc(A.telas.dicionario.busca || '') + '">';

        html += '<div class="pilulas">' +
            '<button class="pilula' + (cat === 'todas' ? ' is-on' : '') + '" data-cat="todas">Todas</button>' +
            A.DIC_CATEGORIAS.map(function (c) {
                return '<button class="pilula' + (cat === c.id ? ' is-on' : '') + '" data-cat="' + c.id + '">' +
                    u.esc(c.nome) + '</button>';
            }).join('') + '</div>';

        html += u.aviso('Palavra difícil não torna a oração mais espiritual. Se uma palavra parecer ' +
            'estranha na sua boca, não force. Escolha cinco e use durante a semana.');

        html += '<div class="verbetes">' + (lista.length ? lista.map(function (d) {
            var mar = A.store.marcado('palavras', d.n);
            return '<div class="verbete">' +
                '<div class="verbete-topo"><b>' + u.esc(d.p) + '</b>' +
                '<button class="estrela' + (mar ? ' is-on' : '') + '" data-marca="' + d.n + '" ' +
                'aria-label="marcar">' + (mar ? '★' : '☆') + '</button></div>' +
                (d.sig ? '<p class="sig">' + u.esc(d.sig) + '</p>' : '') +
                (d.vez ? '<p class="troca"><s>' + u.esc(d.vez) + '</s><br>' + u.esc(d.diga) + '</p>' : '') +
                (d.ex ? '<p class="citacao">' + u.esc(d.ex) + '</p>' : '') +
                (d.dica ? '<p class="legenda">' + u.esc(d.dica) + '</p>' : '') +
                (d.ex ? u.botaoOuvir(d.ex, 'Ouvir') : '') +
                '</div>';
        }).join('') : u.vazio('Nada encontrado com isso.')) + '</div>';

        html += '<div class="cartao"><h3>Quando você perceber que está repetindo</h3>' +
            '<table class="tabela"><tbody>' + A.SUBSTITUICOES.map(function (s) {
                return '<tr><td><b>' + u.esc(s.comum) + '</b></td><td>' + u.esc(s.alt.join(' · ')) + '</td></tr>';
            }).join('') + '</tbody></table></div>';

        el.innerHTML = html;

        var b = u.$('dic-busca');
        b.oninput = function () {
            A.telas.dicionario.busca = b.value;
            var pos = b.selectionStart;
            A.telas.dicionario(el);
            var novo = u.$('dic-busca');
            novo.focus();
            try { novo.setSelectionRange(pos, pos); } catch (e) { }
        };
        u.qq('[data-cat]', el).forEach(function (x) {
            x.onclick = function () { A.telas.dicionario.cat = x.getAttribute('data-cat'); A.telas.dicionario(el); };
        });
        u.qq('[data-marca]', el).forEach(function (x) {
            x.onclick = function () {
                A.store.alternarMarcado('palavras', parseInt(x.getAttribute('data-marca'), 10));
                A.telas.dicionario(el);
            };
        });
    };

    /* ---------------- versículos ---------------- */

    A.telas.versiculos = function (el) {
        var u = A.ui;
        var cat = A.telas.versiculos.cat || 'todas';
        var lista = A.VERSICULOS.filter(function (v) { return cat === 'todas' || v.cat === cat; });

        var html = u.cabecalho('50 versículos', 'Encontre a Palavra certa para o momento — e ore com as suas palavras.') +
            abas('versiculos');

        html += '<div class="pilulas">' +
            '<button class="pilula' + (cat === 'todas' ? ' is-on' : '') + '" data-vcat="todas">Todas</button>' +
            A.VER_CATEGORIAS.map(function (c) {
                return '<button class="pilula' + (cat === c.id ? ' is-on' : '') + '" data-vcat="' + c.id + '">' +
                    u.esc(c.nome) + '</button>';
            }).join('') + '</div>';

        html += '<div class="versiculos">' + lista.map(function (v, i) {
            var id = v.ref + '|' + v.titulo;
            var mar = A.store.marcado('versiculos', id);
            return '<div class="versiculo">' +
                '<div class="verbete-topo"><b>' + u.esc(v.ref) + '</b>' +
                '<button class="estrela' + (mar ? ' is-on' : '') + '" data-vmarca="' + u.esc(id) + '">' +
                (mar ? '★' : '☆') + '</button></div>' +
                '<i class="v-titulo">' + u.esc(v.titulo) + '</i>' +
                '<blockquote>' + u.esc(v.texto) + '</blockquote>' +
                '<p class="legenda"><b>Quando usar.</b> ' + u.esc(v.porque) + '</p>' +
                '<p class="citacao"><small>virado oração</small>' + u.esc(v.como) + '</p>' +
                u.botaoOuvir(v.como, 'Ouvir') +
                '</div>';
        }).join('') + '</div>';

        el.innerHTML = html;

        u.qq('[data-vcat]', el).forEach(function (x) {
            x.onclick = function () { A.telas.versiculos.cat = x.getAttribute('data-vcat'); A.telas.versiculos(el); };
        });
        u.qq('[data-vmarca]', el).forEach(function (x) {
            x.onclick = function () {
                A.store.alternarMarcado('versiculos', x.getAttribute('data-vmarca'));
                A.telas.versiculos(el);
            };
        });
    };

    /* ---------------- orações modelo ---------------- */

    A.telas.modelos = function (el) {
        var u = A.ui;
        var html = u.cabecalho('Orações modelo',
            'Leia a oração primeiro. O método só aparece depois — é assim que ele deve aparecer.') +
            abas('modelos');

        html += A.EXEMPLOS.map(function (e, i) {
            return '<div class="cartao"><h3>' + u.esc(e.titulo) + '</h3>' +
                '<p class="legenda">' + u.esc(e.contexto) + '</p>' +
                '<blockquote class="oracao">' + u.esc(e.oracao) + '</blockquote>' +
                '<div class="linha-botoes">' + u.botaoOuvir(e.oracao, 'Ouvir a oração') +
                '<button class="btn" data-bastidor="' + i + '">Ver o método por trás</button></div>' +
                '<div class="bastidores" id="bast-' + i + '" hidden>' +
                e.bastidores.map(function (b) {
                    return '<div class="bast"><b>' + u.esc(b.t) + '</b><span>' + u.esc(b.d) + '</span></div>';
                }).join('') + '</div></div>';
        }).join('');

        el.innerHTML = html;

        u.qq('[data-bastidor]', el).forEach(function (x) {
            x.onclick = function () {
                var d = u.$('bast-' + x.getAttribute('data-bastidor'));
                d.hidden = !d.hidden;
                x.textContent = d.hidden ? 'Ver o método por trás' : 'Esconder';
            };
        });
    };

    /* ---------------- antes e depois ---------------- */

    A.telas.antesdepois = function (el) {
        var u = A.ui;
        var html = u.cabecalho('Antes e depois',
            'A mesma intenção, com e sem percepção. A diferença quase nunca é tamanho.') +
            abas('antesdepois');

        html += A.ANTES_DEPOIS.map(function (a) {
            return '<div class="cartao"><h3>' + u.esc(a.tema) + '</h3>' +
                '<div class="comparar comparar--col">' +
                '<div class="comp comp--fraco"><small>antes</small>' + u.esc(a.antes) + '</div>' +
                '<div class="comp comp--forte"><small>depois</small>' + u.esc(a.depois) + '</div>' +
                '</div><ul class="lista-ex">' +
                a.oque.map(function (o) { return '<li>' + u.esc(o) + '</li>'; }).join('') +
                '</ul></div>';
        }).join('');

        el.innerHTML = html;
    };
})();
