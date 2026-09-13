/*
 * O app é uma máquina de passos com quatro telas em volta.
 *
 * Três decisões estruturais explicam o resto do arquivo:
 *
 * 1. A navegação é por hash, porque o botão "voltar" do Android vai para o
 *    histórico da página. Sem isso, voltar fecharia o app no meio do socorro,
 *    que é exatamente a hora em que ninguém quer ser expulso.
 *
 * 2. Nada de alert() nem confirm(). O WebView só mostra esses diálogos se o
 *    lado nativo instalar um WebChromeClient, e este app não instala. Toda
 *    confirmação acontece na própria tela.
 *
 * 3. Não existe contador de dias sem pecar. A contagem aqui é de saídas
 *    tomadas e de dias do programa. Um placar de pureza vira chicote ou vira
 *    orgulho, e as duas coisas atrapalham o que o app existe para fazer.
 */

(function () {
  "use strict";

  var CHAVE = 'a-saida/v1';
  var tela = document.getElementById('tela');
  var capa = document.getElementById('palco');

  var estado = {dias: {}, episodios: [], rotina: {data: '', marcados: []}, contato: null};
  var relogios = [];

  /* ---------------- guardar ---------------- */

  function carregar() {
    try {
      var bruto = localStorage.getItem(CHAVE);
      if (!bruto) return;
      var d = JSON.parse(bruto);
      if (d && typeof d === 'object') {
        estado.dias = d.dias || {};
        estado.episodios = Array.isArray(d.episodios) ? d.episodios : [];
        estado.rotina = d.rotina || {data: '', marcados: []};
        estado.contato = d.contato || null;
      }
    } catch (e) {}
  }
  function guardar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) {}
  }

  /* ---------------- utilidades ---------------- */

  function hoje() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function faixa(n) { return n <= 3 ? 'calm' : (n <= 6 ? 'warn' : 'peak'); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c];
    });
  }
  function vibrar(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }
  function limpar() {
    relogios.forEach(function (id) { clearTimeout(id); clearInterval(id); });
    relogios = [];
  }
  function depois(fn, ms) { var id = setTimeout(fn, ms); relogios.push(id); return id; }

  function versiculo(chave) { return VERSICULOS[chave] || VERSICULOS['1co1013']; }

  function versiculoHTML(chave, classe) {
    var v = versiculo(chave);
    return '<div class="' + (classe || 'versiculo') + '"><q>' + esc(v.texto) + '</q><cite>' + esc(v.ref) + '</cite></div>';
  }

  /** O versículo do dia gira pela data, para não virar escolha nem sorteio. */
  function versiculoDoDia() {
    var d = new Date();
    var dia = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
    return VERSICULO_DO_DIA[dia % VERSICULO_DO_DIA.length];
  }

  function diaAtual() {
    for (var i = 0; i < DIAS.length; i++) if (!estado.dias[DIAS[i][0]]) return DIAS[i][0];
    return null;
  }
  function diasFeitos() { return Object.keys(estado.dias).length; }

  function saidas() {
    return estado.episodios.filter(function (e) { return e.tipo === 'tentacao'; });
  }
  function quedaMedia() {
    var pares = saidas().filter(function (e) {
      return typeof e.antes === 'number' && typeof e.depois === 'number';
    });
    if (!pares.length) return null;
    var s = 0;
    pares.forEach(function (e) { s += (e.antes - e.depois); });
    return s / pares.length;
  }
  function nestaSemana() {
    var limite = new Date();
    limite.setDate(limite.getDate() - 6);
    var corte = limite.getFullYear() + '-' + pad(limite.getMonth() + 1) + '-' + pad(limite.getDate());
    return saidas().filter(function (e) { return e.data >= corte; }).length;
  }

  /* ================= ROTEADOR ================= */

  var rotas = {
    socorro: telaSocorro, hoje: telaHoje, ferramentas: telaFerramentas,
    registro: telaRegistro, ferramenta: telaFerramenta, ler: telaLer
  };

  function rota() {
    var h = (location.hash || '#/socorro').replace(/^#\/?/, '');
    var p = h.split('/');
    return {nome: p[0] || 'socorro', arg: p[1] || null};
  }

  function navegar() {
    limpar();
    var r = rota();
    if (r.nome === 'protocolo' || r.nome === 'queda' || r.nome === 'rodar') {
      abrirPalco(r.nome, r.arg);
      return;
    }
    fecharPalco();
    var fn = rotas[r.nome] || telaSocorro;
    tela.innerHTML = fn(r.arg);
    window.scrollTo(0, 0);
    ligar(r.nome);
    marcarNav(r.nome);
  }

  function marcarNav(nome) {
    var mapa = {ferramenta: 'ferramentas', ler: 'ferramentas'};
    var ativo = mapa[nome] || nome;
    [].forEach.call(document.querySelectorAll('#nav button'), function (b) {
      if (b.dataset.ir === ativo) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
  }

  function ir(destino) { location.hash = '#/' + destino; }

  /* ================= TELA: SOCORRO ================= */

  function telaSocorro() {
    var d = diaAtual();
    var sub = d ? 'Dia ' + d + ' de 21 · ' + esc(DIAS[d - 1][1]) : 'Programa concluído. A vigilância continua.';
    return '<div class="pag">' +
      '<div class="topo"><h1>A Saída</h1><span class="topo-nota">' + saidas().length + ' saídas</span></div>' +
      '<div class="agora">' +
        '<p class="agora-frase">Deus prometeu que com a tentação daria também o escape. A saída existe — o que este app faz é te levar até ela.</p>' +
        '<button class="sos" id="bt-sos"><b>Estou sendo<br>tentado</b><small>socorro guiado</small></button>' +
        '<p class="agora-sub">' + sub + '</p>' +
        '<div class="atalhos">' +
          '<button class="atalho" data-rodar="fuga"><b>Fuga imediata</b><span>90 segundos</span></button>' +
          '<button class="atalho" data-rodar="socorro"><b>Só orar</b><span>2 minutos</span></button>' +
          '<button class="atalho" data-rodar="respirar"><b>Aquietar o corpo</b><span>90 segundos</span></button>' +
          '<button class="atalho cai" id="bt-cai"><b>Eu caí</b><span>confessar e levantar</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="secao"><span class="rotulo">Versículo de hoje</span>' +
        '<div class="cartao">' + versiculoHTML(versiculoDoDia()) + '</div></div>' +
    '</div>';
  }

  /* ================= TELA: HOJE ================= */

  function telaHoje() {
    if (estado.rotina.data !== hoje()) estado.rotina = {data: hoje(), marcados: []};

    var d = diaAtual();
    var trilha = '<div class="trilha">';
    for (var i = 1; i <= 21; i++) {
      trilha += '<i class="' + (estado.dias[i] ? 'feito' : (i === d ? 'hoje' : '')) + '"></i>';
    }
    trilha += '</div>';

    var cartaoDia;
    if (d) {
      var semana = SEMANAS[Math.floor((d - 1) / 7)];
      cartaoDia = '<div class="cartao">' +
        '<div class="dia-cab"><span class="dia-n">DIA ' + pad(d) + '</span><h3>' + esc(DIAS[d - 1][1]) + '</h3></div>' +
        '<span class="rotulo">Semana ' + semana.n + ' · ' + esc(semana.nome) + '</span>' +
        '<p>' + esc(DIAS[d - 1][2]) + '</p>' +
        '<button class="bt bt-cheio bt-largo" id="bt-dia">Marcar o dia ' + d + ' como feito</button></div>';
    } else {
      cartaoDia = '<div class="cartao"><h3>Os 21 dias acabaram</h3>' +
        '<p>O que continua: o socorro em toda tentação, a prestação de contas semanal, e um ciclo novo quando outro ponto pedir trabalho.</p>' +
        '<button class="bt bt-vazio bt-largo" id="bt-reiniciar">Começar um novo ciclo</button></div>';
    }

    var listas = '';
    [['manha', 'Manhã · vigiar'], ['noite', 'Noite · prestar contas']].forEach(function (par) {
      listas += '<div class="secao"><span class="rotulo">' + par[1] + '</span><div class="cartao"><div class="lista-check">';
      ROTINA[par[0]].forEach(function (t, idx) {
        var chave = par[0] + idx;
        var m = estado.rotina.marcados.indexOf(chave) >= 0;
        listas += '<label class="item"><input type="checkbox" data-rotina="' + chave + '"' + (m ? ' checked' : '') + '><span>' + esc(t) + '</span></label>';
      });
      listas += '</div></div></div>';
    });

    var c = estado.contato;
    var contato = '<div class="secao"><span class="rotulo">Pessoa de confiança</span><div class="cartao">' +
      '<p>' + (c && c.nome ? 'Na hora do aperto, o app oferece ligar para ' + esc(c.nome) + '.' :
        'Quem sabe do seu ponto fraco e pode te perguntar. Guarde aqui para o app oferecer a ligação no meio da crise.') + '</p>' +
      '<div class="campo"><label for="c-nome">Nome</label><input type="text" id="c-nome" value="' + esc(c && c.nome || '') + '" placeholder="Irmão, pastor, conselheiro"></div>' +
      '<div class="campo"><label for="c-tel">Telefone</label><input type="tel" id="c-tel" value="' + esc(c && c.tel || '') + '" placeholder="Com DDD"></div>' +
      '<button class="bt bt-vazio bt-largo" id="c-salvar">Guardar contato</button>' +
      versiculoHTML('tg516') + '</div></div>';

    return '<div class="pag">' +
      '<div class="topo"><h1>Hoje</h1><span class="topo-nota">' + diasFeitos() + ' / 21 feitos</span></div>' +
      trilha + '<div class="secao">' + cartaoDia + '</div>' + listas + contato +
      '<div class="secao" id="area-lembrete" hidden></div></div>';
  }

  /* ================= TELA: FERRAMENTAS ================= */

  function telaFerramentas() {
    var html = '<div class="pag"><div class="topo"><h1>Ferramentas</h1></div>';
    ['Na hora', 'Oração e Palavra', 'Vida em comum'].forEach(function (grupo) {
      html += '<div class="secao"><span class="rotulo">' + esc(grupo) + '</span>';
      FERRAMENTAS.filter(function (f) { return f.grupo === grupo; }).forEach(function (f) {
        html += '<button class="ferr" data-ferr="' + f.id + '">' +
          '<span class="ferr-txt"><b>' + esc(f.nome) + '</b><span>' + esc(f.quando) + '</span></span>' +
          '<span class="ferr-dur">' + esc(f.dur) + '</span></button>';
      });
      html += '</div>';
    });
    html += '<div class="secao"><span class="rotulo">Entender</span>';
    LEITURA.forEach(function (l, i) {
      html += '<button class="ferr" data-ler="' + i + '"><span class="ferr-txt"><b>' + esc(l.titulo) + '</b></span><span class="ferr-dur">ler</span></button>';
    });
    html += '</div></div>';
    return html;
  }

  function telaFerramenta(id) {
    var f = FERRAMENTAS.filter(function (x) { return x.id === id; })[0];
    if (!f) return telaFerramentas();
    var passos = f.passos.map(function (p, i) {
      return '<div class="bloco"><b>' + (i + 1) + '</b><p>' + esc(p.texto) + '</p></div>';
    }).join('');
    return '<div class="pag">' +
      '<div class="topo"><h1>' + esc(f.nome) + '</h1><span class="topo-nota">' + esc(f.dur) + '</span></div>' +
      '<div class="cartao"><span class="rotulo">Quando usar</span><p>' + esc(f.quando) + '</p>' +
        (f.versiculo ? versiculoHTML(f.versiculo) : '') + '</div>' +
      '<div class="secao"><span class="rotulo">Os passos</span><div class="cartao leitura">' + passos + '</div></div>' +
      '<div class="secao"><button class="bt bt-cheio bt-largo" data-rodar="' + f.id + '">Fazer agora, guiado</button>' +
      '<button class="bt bt-vazio bt-largo" data-voltar>Voltar</button></div></div>';
  }

  function telaLer(i) {
    var l = LEITURA[Number(i)];
    if (!l) return telaFerramentas();
    var blocos = l.blocos.map(function (b) {
      return '<div class="bloco"><b>' + esc(b[0]) + '</b><p>' + esc(b[1]) + '</p></div>';
    }).join('');
    return '<div class="pag"><div class="topo"><h1>' + esc(l.titulo) + '</h1></div>' +
      '<div class="cartao leitura">' + blocos + '</div>' +
      (l.versiculo ? '<div class="secao"><div class="cartao">' + versiculoHTML(l.versiculo) + '</div></div>' : '') +
      '<div class="secao"><button class="bt bt-vazio bt-largo" data-voltar>Voltar</button></div></div>';
  }

  /* ================= TELA: REGISTRO ================= */

  function telaRegistro() {
    var q = quedaMedia();
    var tiles = '<div class="tiles">' +
      '<div class="tile"><span class="rotulo">Saídas tomadas</span><b>' + saidas().length + '</b></div>' +
      '<div class="tile"><span class="rotulo">Queda do desejo</span><b>' +
        (q === null ? '—' : (q >= 0 ? '−' : '+') + Math.abs(q).toFixed(1) + '<small> pts</small>') + '</b></div>' +
      '<div class="tile"><span class="rotulo">Nesta semana</span><b>' + nestaSemana() + '</b></div></div>';

    var lista;
    if (!estado.episodios.length) {
      lista = '<p class="vazio">Nada registrado ainda. Cada socorro atendido aparece aqui com o desejo de antes e o de depois — é assim que se enxerga o padrão: o horário, o lugar, a deixa.</p>';
    } else {
      lista = estado.episodios.map(function (e) {
        if (e.tipo === 'queda') {
          var det = [];
          if (e.elo) det.push('primeiro elo: ' + e.elo);
          if (e.corte) det.push('cortei: ' + e.corte);
          return '<div class="ep queda"><div class="ep-topo"><span class="ep-data">' + esc(e.data) + '</span>' +
            '<span class="ep-tipo">queda</span></div>' +
            '<b>' + esc(e.oque || 'Registrado') + '</b>' +
            (det.length ? '<span class="ep-linha">' + esc(det.join(' · ')) + '</span>' : '') +
            '<button class="ep-apagar" data-apagar="' + e.id + '">apagar</button></div>';
        }
        var salto = '';
        if (typeof e.antes === 'number') {
          salto = '<span class="ep-salto"><span class="pip ' + faixa(e.antes) + '">' + e.antes + '</span>';
          if (typeof e.depois === 'number') salto += '<span>→</span><span class="pip ' + faixa(e.depois) + '">' + e.depois + '</span>';
          salto += '</span>';
        }
        var det2 = [];
        if (e.tentacao) det2.push(e.tentacao);
        if (e.resultado) det2.push(e.resultado);
        if (e.seg) det2.push(Math.round(e.seg / 60) >= 1 ? Math.round(e.seg / 60) + ' min' : Math.round(e.seg) + ' s');
        return '<div class="ep"><div class="ep-topo"><span class="ep-data">' + esc(e.data) + '</span>' +
          '<span class="ep-tipo">saída</span>' + salto + '</div>' +
          (det2.length ? '<span class="ep-linha">' + esc(det2.join(' · ')) + '</span>' : '') +
          '<button class="ep-apagar" data-apagar="' + e.id + '">apagar</button></div>';
      }).join('');
    }

    return '<div class="pag"><div class="topo"><h1>Registro</h1></div>' + tiles +
      '<div class="cartao" style="margin-top:14px">' + versiculoHTML('rm81') +
      '<p>Os números são para enxergar o padrão, não para medir o quanto Deus te ama. Isso não oscila.</p></div>' +
      '<div class="secao"><span class="rotulo">Histórico</span>' + lista + '</div></div>';
  }

  /* ================= LIGAÇÕES ================= */

  function ligar(nome) {
    var sos = document.getElementById('bt-sos');
    if (sos) sos.addEventListener('click', function () { vibrar(12); ir('protocolo'); });
    var cai = document.getElementById('bt-cai');
    if (cai) cai.addEventListener('click', function () { ir('queda'); });

    [].forEach.call(document.querySelectorAll('[data-rodar]'), function (b) {
      b.addEventListener('click', function () { ir('rodar/' + b.dataset.rodar); });
    });
    [].forEach.call(document.querySelectorAll('[data-ferr]'), function (b) {
      b.addEventListener('click', function () { ir('ferramenta/' + b.dataset.ferr); });
    });
    [].forEach.call(document.querySelectorAll('[data-ler]'), function (b) {
      b.addEventListener('click', function () { ir('ler/' + b.dataset.ler); });
    });
    [].forEach.call(document.querySelectorAll('[data-voltar]'), function (b) {
      b.addEventListener('click', function () { history.back(); });
    });

    if (nome === 'hoje') ligarHoje();
    if (nome === 'registro') ligarRegistro();
  }

  function ligarHoje() {
    var bt = document.getElementById('bt-dia');
    if (bt) bt.addEventListener('click', function () {
      var d = diaAtual();
      if (!d) return;
      estado.dias[d] = hoje();
      guardar(); vibrar(18); navegar();
    });
    var re = document.getElementById('bt-reiniciar');
    if (re) re.addEventListener('click', function () { estado.dias = {}; guardar(); navegar(); });

    [].forEach.call(document.querySelectorAll('[data-rotina]'), function (c) {
      c.addEventListener('change', function () {
        var k = c.dataset.rotina;
        var i = estado.rotina.marcados.indexOf(k);
        if (c.checked && i < 0) estado.rotina.marcados.push(k);
        if (!c.checked && i >= 0) estado.rotina.marcados.splice(i, 1);
        guardar();
      });
    });

    var salvar = document.getElementById('c-salvar');
    if (salvar) salvar.addEventListener('click', function () {
      estado.contato = {
        nome: document.getElementById('c-nome').value.trim(),
        tel: document.getElementById('c-tel').value.trim()
      };
      guardar();
      salvar.textContent = 'Contato guardado';
      depois(function () { navegar(); }, 900);
    });

    montarLembrete();
  }

  function ligarRegistro() {
    [].forEach.call(document.querySelectorAll('[data-apagar]'), function (b) {
      var armado = false;
      b.addEventListener('click', function () {
        if (!armado) { armado = true; b.textContent = 'apagar mesmo?'; return; }
        estado.episodios = estado.episodios.filter(function (e) { return e.id !== b.dataset.apagar; });
        guardar(); navegar();
      });
    });
  }

  function escala(host, aoEscolher) {
    if (!host) return;
    var html = '';
    for (var i = 0; i <= 10; i++) {
      var cor = i <= 3 ? 'var(--calm)' : (i <= 6 ? 'var(--warn)' : 'var(--peak)');
      html += '<button type="button" data-v="' + i + '" aria-pressed="false" style="--marca:' + cor + '">' + i + '</button>';
    }
    host.innerHTML = html;
    host.addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-v]');
      if (!b) return;
      [].forEach.call(host.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      vibrar(8);
      aoEscolher(Number(b.dataset.v));
    });
  }

  /** Liga para a pessoa de confiança. O lado nativo abre o discador. */
  function botaoChamar() {
    var c = estado.contato;
    if (!c || !c.tel) return '';
    return '<a class="bt bt-vazio bt-largo" href="tel:' + esc(c.tel.replace(/[^0-9+]/g, '')) + '">Ligar para ' + esc(c.nome || 'meu contato') + '</a>';
  }

  /* ================= O PALCO ================= */

  var sessao = null;

  function abrirPalco(modo, arg) {
    var passos;
    if (modo === 'rodar') {
      var f = FERRAMENTAS.filter(function (x) { return x.id === arg; })[0];
      if (!f) { ir('ferramentas'); return; }
      passos = f.passos.map(function (p) {
        return {tipo: p.tipo || 'texto', rotulo: f.nome, linha: p.texto, apoio: '', seg: p.seg || 0};
      });
      passos.push({tipo: 'fim-ferramenta', rotulo: f.nome, versiculo: f.versiculo});
    } else if (modo === 'queda') {
      passos = QUEDA.concat([{tipo: 'desfecho-queda', rotulo: 'Levante'}]);
    } else {
      passos = [{tipo: 'escala-antes', rotulo: 'Antes de começar'}]
        .concat(PROTOCOLO)
        .concat([{tipo: 'verificacao', rotulo: 'Agora'}, {tipo: 'desfecho', rotulo: 'Resultado'}]);
    }

    sessao = {
      modo: modo, passos: passos, i: 0,
      antes: null, depois: null, resultado: null, tentacao: null, tentacaoId: null,
      oque: '', elo: '', corte: '',
      inicio: Date.now(), salvo: false
    };
    capa.hidden = false;
    document.body.style.overflow = 'hidden';
    travarTela();
    desenharPasso();
  }

  function fecharPalco() {
    if (!sessao) { capa.hidden = true; document.body.style.overflow = ''; return; }
    // sair no meio guarda o que já foi dito, em vez de descartar
    if (sessao.modo === 'protocolo' && !sessao.salvo && sessao.antes !== null) guardarSaida();
    if (sessao.modo === 'queda' && !sessao.salvo && sessao.oque) guardarQueda();
    sessao = null;
    capa.hidden = true;
    document.body.style.overflow = '';
    soltarTela();
  }

  function guardarSaida() {
    if (!sessao || sessao.salvo) return;
    sessao.salvo = true;
    estado.episodios.unshift({
      id: String(Date.now()), data: hoje(), tipo: 'tentacao',
      tentacao: sessao.tentacao, antes: sessao.antes, depois: sessao.depois,
      resultado: sessao.resultado, seg: (Date.now() - sessao.inicio) / 1000
    });
    guardar();
  }

  function guardarQueda() {
    if (!sessao || sessao.salvo) return;
    sessao.salvo = true;
    estado.episodios.unshift({
      id: String(Date.now()), data: hoje(), tipo: 'queda',
      oque: sessao.oque, elo: sessao.elo, corte: sessao.corte
    });
    guardar();
  }

  function desenharPasso() {
    limpar();
    var p = sessao.passos[sessao.i];
    var cena = capa.querySelector('.cena');
    var acoes = capa.querySelector('.acoes');
    trilhaPassos();
    capa.querySelector('.relogio').textContent = '';

    if (p.tipo === 'escala-antes') {
      cena.innerHTML = '<span class="rotulo">' + esc(p.rotulo) + '</span>' +
        '<h2>Quanto está puxando?</h2><div class="escala" id="esc"></div>' +
        '<div class="escala-pes"><span>0 · nada</span><span>10 · quase cedendo</span></div>' +
        '<p class="apoio">Dizer o tamanho já é o começo da honestidade. E serve para você ver, no fim, o que mudou.</p>';
      acoes.innerHTML = '<button class="bt bt-cheio bt-largo" id="seguir" disabled>Começar</button>';
      var s1 = document.getElementById('seguir');
      escala(document.getElementById('esc'), function (v) { sessao.antes = v; s1.disabled = false; });
      s1.addEventListener('click', avancar);
      return;
    }

    if (p.tipo === 'verificacao') { desenharVerificacao(); return; }
    if (p.tipo === 'desfecho') { desenharDesfecho(); return; }
    if (p.tipo === 'desfecho-queda') { desenharDesfechoQueda(); return; }

    if (p.tipo === 'fim-ferramenta') {
      cena.innerHTML = '<span class="rotulo">' + esc(p.rotulo) + '</span><h2>Feito.</h2>' +
        (p.versiculo ? versiculoHTML(p.versiculo) : '');
      acoes.innerHTML = '<button class="bt bt-cheio bt-largo" id="sair">Voltar</button>';
      document.getElementById('sair').addEventListener('click', function () { history.back(); });
      vibrar([14, 60, 14]);
      return;
    }

    if (p.tipo === 'escrever') { desenharEscrever(p); return; }
    if (p.tipo === 'contar') { desenharContar(p); return; }

    // passos comuns
    var html = '<span class="rotulo">' + esc(p.rotulo) + '</span><h2>' + esc(p.linha) + '</h2>';

    if (p.tipo === 'respiracao') {
      html += '<div class="respiro"><div class="bolha" id="bolha"></div><span class="cue" id="cue">Prepare</span></div>';
    }
    if (p.tipo === 'nomear') {
      html += '<div class="fichas" id="fichas">' + TENTACOES.map(function (t) {
        return '<button type="button" aria-pressed="false" data-t="' + t.id + '">' + esc(t.nome) + '</button>';
      }).join('') + '</div>';
    }
    if (p.tipo === 'oracao') {
      html += '<div class="oracao"><p>' + esc(p.oracao) + '</p></div>';
    }
    if (p.tipo === 'palavra') {
      var chave = '1co1013';
      if (sessao.tentacaoId) {
        var t = TENTACOES.filter(function (x) { return x.id === sessao.tentacaoId; })[0];
        if (t) {
          // gira pela quantidade de vezes que esta tentação já foi nomeada
          var vezes = estado.episodios.filter(function (e) { return e.tentacao === t.nome; }).length;
          chave = t.versiculos[vezes % t.versiculos.length];
        }
      }
      var v = versiculo(chave);
      html += '<div class="palavra-grande"><q>' + esc(v.texto) + '</q><cite>' + esc(v.ref) + '</cite></div>';
    }
    if (p.tipo === 'resistir') {
      html += '<div class="fichas" id="fichas">' + ACOES_SUBSTITUTAS.map(function (a) {
        return '<button type="button" aria-pressed="false" data-a="' + esc(a) + '">' + esc(a) + '</button>';
      }).join('') + '</div>';
    }
    if (p.apoio) html += '<p class="apoio">' + esc(p.apoio) + '</p>';
    if (p.versiculo && p.tipo !== 'palavra') html += versiculoHTML(p.versiculo);

    cena.innerHTML = html;
    acoes.innerHTML = (p.tipo === 'resistir' ? botaoChamar() : '') +
      '<button class="bt bt-vazio bt-largo" id="seguir">Avançar agora</button>';
    document.getElementById('seguir').addEventListener('click', avancar);

    if (p.tipo === 'nomear') {
      fichaUnica(document.getElementById('fichas'), 't', function (id) {
        sessao.tentacaoId = id;
        var t = TENTACOES.filter(function (x) { return x.id === id; })[0];
        sessao.tentacao = t ? t.nome : null;
      });
    }
    if (p.tipo === 'resistir') {
      fichaUnica(document.getElementById('fichas'), 'a', function () {});
    }
    if (p.tipo === 'respiracao') respirar(p.seg);
    if (p.seg) cronometro(p.seg);
  }

  function desenharEscrever(p) {
    var cena = capa.querySelector('.cena');
    var acoes = capa.querySelector('.acoes');
    cena.innerHTML = '<span class="rotulo">' + esc(p.rotulo) + '</span><h2>' + esc(p.linha) + '</h2>' +
      '<p class="apoio">' + esc(p.apoio) + '</p>' +
      '<div class="campo"><label for="txt">' + esc(p.campo) + '</label><input type="text" id="txt"></div>' +
      (p.versiculo ? versiculoHTML(p.versiculo) : '');
    acoes.innerHTML = '<button class="bt bt-cheio bt-largo" id="seguir">Continuar</button>';
    document.getElementById('seguir').addEventListener('click', function () {
      var v = document.getElementById('txt').value.trim();
      if (p.id === 'confessar') sessao.oque = v;
      if (p.id === 'corrente') sessao.elo = v;
      if (p.id === 'cortar') sessao.corte = v;
      avancar();
    });
  }

  function desenharContar(p) {
    var cena = capa.querySelector('.cena');
    var acoes = capa.querySelector('.acoes');
    var c = estado.contato;
    cena.innerHTML = '<span class="rotulo">' + esc(p.rotulo) + '</span><h2>' + esc(p.linha) + '</h2>' +
      '<p class="apoio">' + esc(p.apoio) + '</p>' +
      (c && c.nome ? '' : '<p class="apoio">Você ainda não guardou uma pessoa de confiança. Dá para fazer isso na aba Hoje.</p>') +
      versiculoHTML(p.versiculo);
    acoes.innerHTML = botaoChamar() + '<button class="bt bt-cheio bt-largo" id="seguir">Continuar</button>';
    document.getElementById('seguir').addEventListener('click', avancar);
  }

  function fichaUnica(host, attr, aoEscolher) {
    if (!host) return;
    host.addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-' + attr + ']');
      if (!b) return;
      var jaEra = b.getAttribute('aria-pressed') === 'true';
      [].forEach.call(host.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', 'false'); });
      if (!jaEra) { b.setAttribute('aria-pressed', 'true'); aoEscolher(b.dataset[attr]); }
      else aoEscolher(null);
      vibrar(8);
    });
  }

  function trilhaPassos() {
    var host = capa.querySelector('.passos');
    var html = '';
    for (var i = 0; i < sessao.passos.length; i++) {
      html += '<i class="' + (i < sessao.i ? 'feito' : (i === sessao.i ? 'atual' : '')) + '"></i>';
    }
    host.innerHTML = html;
  }

  function cronometro(seg) {
    var fim = Date.now() + seg * 1000;
    var marca = capa.querySelector('.passos i.atual');
    var visor = capa.querySelector('.relogio');
    var id = setInterval(function () {
      var resta = fim - Date.now();
      if (resta <= 0) { clearInterval(id); visor.textContent = ''; vibrar(14); avancar(); return; }
      visor.textContent = Math.ceil(resta / 1000) + 's';
      if (marca) marca.style.setProperty('--p', (100 - (resta / (seg * 1000)) * 100) + '%');
    }, 100);
    relogios.push(id);
  }

  /**
   * Duas inspirações pelo nariz e uma expiração longa pela boca. A expiração
   * quase o dobro da inspiração é o que baixa a frequência cardíaca.
   */
  function respirar(seg) {
    var bolha = document.getElementById('bolha');
    var cue = document.getElementById('cue');
    if (!bolha || !cue) return;
    var fases = [
      {texto: 'Inspire pelo nariz', escala: 0.82, ms: 3200, tremor: 10},
      {texto: 'Mais um pouco', escala: 1, ms: 900, tremor: 8},
      {texto: 'Solte pela boca', escala: 0.42, ms: 6000, tremor: [10, 40, 10]},
      {texto: 'Pausa', escala: 0.42, ms: 700, tremor: 0}
    ];
    var f = 0, fim = Date.now() + seg * 1000;
    function passo() {
      if (Date.now() >= fim) return;
      var fase = fases[f % fases.length];
      cue.textContent = fase.texto;
      bolha.style.transitionDuration = fase.ms + 'ms';
      bolha.style.transform = 'scale(' + fase.escala + ')';
      if (fase.tremor) vibrar(fase.tremor);
      f++;
      depois(passo, fase.ms);
    }
    depois(passo, 150);
  }

  function avancar() {
    limpar();
    if (sessao.i < sessao.passos.length - 1) { sessao.i++; desenharPasso(); }
  }

  /** A verificação que fecha o socorro: o tamanho do desejo, e se passou. */
  function desenharVerificacao() {
    var cena = capa.querySelector('.cena');
    var acoes = capa.querySelector('.acoes');
    cena.innerHTML = '<span class="rotulo">Agora</span><h2>Como está o desejo?</h2>' +
      '<div class="escala" id="esc"></div>' +
      '<div class="escala-pes"><span>0 · nada</span><span>10 · quase cedendo</span></div>' +
      '<span class="rotulo" style="margin-top:8px">E então</span>' +
      '<div class="fichas" id="fichas">' +
        '<button type="button" aria-pressed="false" data-r="Passou">Passou</button>' +
        '<button type="button" aria-pressed="false" data-r="Diminuiu">Diminuiu</button>' +
        '<button type="button" aria-pressed="false" data-r="Ainda está forte">Ainda está forte</button>' +
      '</div>';
    acoes.innerHTML = '<button class="bt bt-cheio bt-largo" id="seguir" disabled>Terminar</button>';
    var s = document.getElementById('seguir');
    function conferir() { s.disabled = !(sessao.depois !== null && sessao.resultado); }
    escala(document.getElementById('esc'), function (v) { sessao.depois = v; conferir(); });
    fichaUnica(document.getElementById('fichas'), 'r', function (v) { sessao.resultado = v; conferir(); });
    s.addEventListener('click', avancar);
  }

  function desenharDesfecho() {
    var cena = capa.querySelector('.cena');
    var acoes = capa.querySelector('.acoes');
    var forte = sessao.resultado === 'Ainda está forte';
    var d = (sessao.antes !== null && sessao.depois !== null) ? sessao.antes - sessao.depois : null;

    var frase, chave;
    if (forte) {
      frase = 'Então o socorro não terminou. Não volte para o lugar de onde você saiu. Ligue para alguém agora, ou faça a saída de novo — repetir não é fraqueza, é o que funciona.';
      chave = 'tg47';
    } else if (d !== null && d > 0) {
      frase = 'O desejo cedeu ' + d + (d > 1 ? ' pontos' : ' ponto') + ' e você não cedeu a ele. A saída estava lá, e você a tomou.';
      chave = '1co1013';
    } else if (d === 0) {
      frase = 'O desejo não baixou, e ainda assim você atravessou sem obedecer a ele. Isso conta igual: ser tentado não é pecar.';
      chave = 'hb415';
    } else {
      frase = 'Ainda está subindo. Acontece, principalmente perto do lugar onde começou. Fique longe dele e chame alguém.';
      chave = 'tg47';
    }

    cena.innerHTML = '<span class="rotulo">Resultado</span>' +
      '<div class="saldo"><span class="n de">' + (sessao.antes === null ? '—' : sessao.antes) + '</span>' +
      '<span class="seta">→</span><span class="n para">' + (sessao.depois === null ? '—' : sessao.depois) + '</span></div>' +
      '<p class="desfecho-frase">' + esc(frase) + '</p>' + versiculoHTML(chave);

    acoes.innerHTML = (forte ? botaoChamar() + '<button class="bt bt-vazio bt-largo" id="denovo">Fazer a saída de novo</button>' : '') +
      '<button class="bt bt-cheio bt-largo" id="guardar">Guardar no registro</button>';

    var dn = document.getElementById('denovo');
    if (dn) dn.addEventListener('click', function () {
      guardarSaida();
      sessao.i = 0; sessao.salvo = false; sessao.inicio = Date.now();
      sessao.antes = null; sessao.depois = null; sessao.resultado = null;
      desenharPasso();
    });
    document.getElementById('guardar').addEventListener('click', function () {
      guardarSaida(); vibrar([14, 60, 14]); location.hash = '#/registro';
    });
    vibrar([14, 60, 14]);
  }

  function desenharDesfechoQueda() {
    var cena = capa.querySelector('.cena');
    var acoes = capa.querySelector('.acoes');
    cena.innerHTML = '<span class="rotulo">Levante</span><h2>Confessado. Siga.</h2>' +
      '<p class="desfecho-frase">Ruminar a culpa depois do perdão não honra a Deus e prepara a próxima queda. Faça hoje o corte que você escreveu, conte a quem precisa ouvir, e volte ao dia de hoje do programa.</p>' +
      versiculoHTML('1jo19');
    acoes.innerHTML = botaoChamar() + '<button class="bt bt-cheio bt-largo" id="guardar">Guardar e voltar</button>';
    document.getElementById('guardar').addEventListener('click', function () {
      guardarQueda(); location.hash = '#/hoje';
    });
  }

  /* ---- manter a tela acesa durante o socorro ---- */
  var trava = null;
  function travarTela() {
    try {
      if (navigator.wakeLock && navigator.wakeLock.request) {
        navigator.wakeLock.request('screen').then(function (t) { trava = t; }).catch(function () {});
      }
    } catch (e) {}
  }
  function soltarTela() { try { if (trava) { trava.release(); trava = null; } } catch (e) {} }

  /* ================= LEMBRETE ================= */

  function montarLembrete() {
    var ponte = window.AndroidLembrete;
    var area = document.getElementById('area-lembrete');
    if (!ponte || !area) return;

    function ler() { try { return JSON.parse(ponte.estadoLembretes()); } catch (e) { return {}; } }
    function pintar() {
      var e = ler();
      var aviso = '';
      if (e.ligado && !e.permissao) aviso = '<p class="ep-linha">As notificações estão desligadas para este app. Toque em ligar de novo para liberar.</p>';
      else if (e.ligado && !e.exato) aviso = '<p class="ep-linha">Sem permissão de alarme exato, o aviso pode chegar alguns minutos depois da hora.</p>';

      area.innerHTML = '<span class="rotulo">Lembrete diário</span><div class="cartao">' +
        '<p>' + (e.ligado ? 'Todo dia às ' + esc(e.hora) + '.' : 'A hora do exame da noite: confessar, agradecer, marcar o dia.') + '</p>' +
        '<div class="campo"><label for="lb-hora">Hora</label><input type="time" id="lb-hora" step="300" value="' + esc(e.hora || '21:00') + '"></div>' +
        '<button class="bt bt-cheio bt-largo" id="lb-ligar">' + (e.ligado ? 'Trocar a hora' : 'Ligar lembrete') + '</button>' +
        (e.ligado ? '<button class="bt bt-vazio bt-largo" id="lb-desligar">Desligar</button>' : '') + aviso + '</div>';
      area.hidden = false;

      document.getElementById('lb-ligar').addEventListener('click', function () {
        ponte.agendarLembrete(JSON.stringify({ligado: true, hora: document.getElementById('lb-hora').value || '21:00'}));
        if (!ler().permissao) ponte.pedirPermissaoAviso();
        pintar();
      });
      var off = document.getElementById('lb-desligar');
      if (off) off.addEventListener('click', function () {
        ponte.agendarLembrete(JSON.stringify({ligado: false, hora: document.getElementById('lb-hora').value || '21:00'}));
        pintar();
      });
    }
    window.__pontePermissaoAviso = function () { if (document.getElementById('area-lembrete')) pintar(); };
    pintar();
  }

  /* ================= PARTIDA ================= */

  capa.querySelector('.fechar').addEventListener('click', function () { history.back(); });
  [].forEach.call(document.querySelectorAll('#nav button'), function (b) {
    b.addEventListener('click', function () { ir(b.dataset.ir); });
  });
  window.addEventListener('hashchange', navegar);
  carregar();
  if (!location.hash) location.replace('#/socorro');
  navegar();
})();
