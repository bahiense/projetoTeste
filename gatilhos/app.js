/*
 * O app é uma máquina de passos com quatro telas em volta.
 *
 * Duas decisões estruturais explicam o resto do arquivo:
 *
 * 1. A navegação é por hash. Não é estética: o WebView do Android manda o
 *    botão "voltar" para o histórico da página, então cada tela precisa ser
 *    uma entrada de histórico — senão voltar fecha o app no meio do
 *    protocolo, que é exatamente a hora em que ninguém quer ser expulso.
 *
 * 2. Nada de alert() nem confirm(). O WebView só mostra esses diálogos se o
 *    lado nativo instalar um WebChromeClient, e este app não instala. Toda
 *    confirmação é feita na própria tela.
 */

(function () {
  "use strict";

  var CHAVE = 'segundo-antes/v2';
  var tela = document.getElementById('tela');
  var capa = document.getElementById('protocolo');

  var estado = {dias: {}, episodios: [], rotina: {data: '', marcados: []}, lembrete: null};
  var relogios = [];   // tudo que precisa ser desligado ao trocar de tela

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

  function diaAtual() {
    for (var i = 0; i < DIAS.length; i++) if (!estado.dias[DIAS[i][0]]) return DIAS[i][0];
    return null;   // programa concluído
  }
  function diasFeitos() { return Object.keys(estado.dias).length; }

  /** Dias seguidos, contando de hoje (ou de ontem, se hoje ainda não teve nada) para trás. */
  function sequencia() {
    var ativos = {};
    Object.keys(estado.dias).forEach(function (k) { ativos[estado.dias[k]] = true; });
    estado.episodios.forEach(function (e) { ativos[e.data] = true; });
    var d = new Date(), n = 0;
    if (!ativos[hoje()]) d.setDate(d.getDate() - 1);
    for (var i = 0; i < 400; i++) {
      var chave = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
      if (!ativos[chave]) break;
      n++; d.setDate(d.getDate() - 1);
    }
    return n;
  }

  function quedaMedia() {
    var pares = estado.episodios.filter(function (e) {
      return typeof e.antes === 'number' && typeof e.depois === 'number';
    });
    if (!pares.length) return null;
    var s = 0;
    pares.forEach(function (e) { s += (e.antes - e.depois); });
    return s / pares.length;
  }

  /* ================= ROTEADOR ================= */

  var rotas = {
    'agora': telaAgora,
    'hoje': telaHoje,
    'ferramentas': telaFerramentas,
    'registro': telaRegistro,
    'ferramenta': telaFerramenta,
    'ler': telaLer
  };

  function rota() {
    var h = (location.hash || '#/agora').replace(/^#\/?/, '');
    var p = h.split('/');
    return {nome: p[0] || 'agora', arg: p[1] || null};
  }

  function navegar() {
    limpar();
    var r = rota();

    // o protocolo e as ferramentas guiadas são telas cheias por cima de tudo
    if (r.nome === 'protocolo' || r.nome === 'rodar') {
      abrirPalco(r.nome === 'protocolo' ? null : r.arg);
      return;
    }
    fecharPalco();

    var fn = rotas[r.nome] || telaAgora;
    tela.innerHTML = fn(r.arg);
    window.scrollTo(0, 0);
    ligar(r.nome, r.arg);
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

  /* ================= TELA: AGORA ================= */

  function telaAgora() {
    var d = diaAtual();
    var seq = sequencia();
    var sub = d
      ? 'Dia ' + d + ' de 21 · ' + esc(DIAS[d - 1][1])
      : 'Programa concluído. A prática continua.';

    return '<div class="pag">' +
      '<div class="topo"><h1>O Segundo Antes</h1>' +
      '<span class="topo-nota">' + (seq > 0 ? seq + (seq > 1 ? ' dias seguidos' : ' dia') : 'comece hoje') + '</span></div>' +
      '<div class="agora">' +
        '<p class="agora-frase">Entre o gatilho e a sua reação existe pouco mais de um segundo. É ali que existe escolha.</p>' +
        '<button class="sos" id="bt-sos"><b>Estou ativado</b><small>protocolo de 90 s</small></button>' +
        '<p class="agora-sub">' + sub + '</p>' +
        '<div class="atalhos">' +
          '<button class="atalho" data-rodar="respiracao"><b>Só respirar</b><span>90 segundos</span></button>' +
          '<button class="atalho" data-rodar="surfar"><b>Surfar o impulso</b><span>3 minutos</span></button>' +
          '<button class="atalho" data-rodar="orientacao"><b>Voltar ao chão</b><span>60 segundos</span></button>' +
          '<button class="atalho" data-rodar="descarga"><b>Descarregar</b><span>3 minutos</span></button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ================= TELA: HOJE ================= */

  function telaHoje() {
    if (estado.rotina.data !== hoje()) estado.rotina = {data: hoje(), marcados: []};

    var d = diaAtual();
    var trilha = '<div class="trilha">';
    for (var i = 1; i <= 21; i++) {
      var cls = estado.dias[i] ? 'feito' : (i === d ? 'hoje' : '');
      trilha += '<i class="' + cls + '"></i>';
    }
    trilha += '</div>';

    var cartaoDia;
    if (d) {
      var semana = SEMANAS[Math.floor((d - 1) / 7)];
      cartaoDia = '<div class="cartao">' +
        '<div class="dia-cab"><span class="dia-n">DIA ' + pad(d) + '</span><h3>' + esc(DIAS[d - 1][1]) + '</h3></div>' +
        '<span class="rotulo">Semana ' + semana.n + ' · ' + esc(semana.nome) + '</span>' +
        '<p>' + esc(DIAS[d - 1][2]) + '</p>' +
        '<button class="bt bt-cheio bt-largo" id="bt-dia">Marcar o dia ' + d + ' como feito</button>' +
      '</div>';
    } else {
      cartaoDia = '<div class="cartao"><h3>Os 21 dias acabaram</h3>' +
        '<p>Três coisas continuam: o protocolo em toda ativação, uma desmontagem por semana, e um ciclo novo a cada trimestre com outro gatilho-alvo.</p>' +
        '<button class="bt bt-vazio bt-largo" id="bt-reiniciar">Começar um novo ciclo</button></div>';
    }

    var listas = '';
    ['manha', 'noite'].forEach(function (parte) {
      var titulo = parte === 'manha' ? 'Manhã · 5 min' : 'Noite · 7 min';
      listas += '<div class="secao"><span class="rotulo">' + titulo + '</span><div class="cartao"><div class="lista-check">';
      ROTINA[parte].forEach(function (t, idx) {
        var chave = parte + idx;
        var m = estado.rotina.marcados.indexOf(chave) >= 0;
        listas += '<label class="item"><input type="checkbox" data-rotina="' + chave + '"' + (m ? ' checked' : '') + '>' +
          '<span>' + esc(t) + '</span></label>';
      });
      listas += '</div></div></div>';
    });

    return '<div class="pag">' +
      '<div class="topo"><h1>Hoje</h1><span class="topo-nota">' + diasFeitos() + ' / 21 feitos</span></div>' +
      trilha +
      '<div class="secao">' + cartaoDia + '</div>' +
      listas +
      '<div class="secao" id="area-lembrete" hidden></div>' +
    '</div>';
  }

  /* ================= TELA: FERRAMENTAS ================= */

  function telaFerramentas() {
    var html = '<div class="pag"><div class="topo"><h1>Ferramentas</h1></div>';
    ['Corpo', 'Mente', 'Ação'].forEach(function (grupo) {
      var legenda = {Corpo: 'baixar a ativação', Mente: 'desmontar o significado', 'Ação': 'instalar a resposta nova'};
      html += '<div class="secao"><span class="rotulo">' + grupo + ' · ' + legenda[grupo] + '</span>';
      FERRAMENTAS.filter(function (f) { return f.grupo === grupo; }).forEach(function (f) {
        html += '<button class="ferr" data-ferr="' + f.id + '">' +
          '<span class="ferr-txt"><b>' + esc(f.nome) + '</b><span>' + esc(f.quando) + '</span></span>' +
          '<span class="ferr-dur">' + esc(f.dur) + '</span></button>';
      });
      html += '</div>';
    });

    html += '<div class="secao"><span class="rotulo">Entender o mecanismo</span>';
    LEITURA.forEach(function (l, i) {
      html += '<button class="ferr" data-ler="' + i + '">' +
        '<span class="ferr-txt"><b>' + esc(l.titulo) + '</b></span><span class="ferr-dur">ler</span></button>';
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
      '<div class="cartao"><span class="rotulo">Quando usar</span><p>' + esc(f.quando) + '</p></div>' +
      '<div class="secao"><span class="rotulo">Os passos</span><div class="cartao leitura">' + passos + '</div></div>' +
      '<div class="secao"><button class="bt bt-cheio bt-largo" data-rodar="' + f.id + '">Fazer agora, guiado</button>' +
      '<button class="bt bt-vazio bt-largo" data-voltar>Voltar</button></div>' +
    '</div>';
  }

  function telaLer(i) {
    var l = LEITURA[Number(i)];
    if (!l) return telaFerramentas();
    var blocos = l.blocos.map(function (b) {
      return '<div class="bloco"><b>' + esc(b[0]) + '</b><p>' + esc(b[1]) + '</p></div>';
    }).join('');
    return '<div class="pag"><div class="topo"><h1>' + esc(l.titulo) + '</h1></div>' +
      '<div class="cartao leitura">' + blocos + '</div>' +
      '<div class="secao"><button class="bt bt-vazio bt-largo" data-voltar>Voltar</button></div></div>';
  }

  /* ================= TELA: REGISTRO ================= */

  function telaRegistro() {
    var q = quedaMedia();
    var tiles = '<div class="tiles">' +
      '<div class="tile"><span class="rotulo">Episódios</span><b>' + estado.episodios.length + '</b></div>' +
      '<div class="tile"><span class="rotulo">Queda média</span><b>' +
        (q === null ? '—' : (q >= 0 ? '−' : '+') + Math.abs(q).toFixed(1) + '<small> pts</small>') + '</b></div>' +
      '<div class="tile"><span class="rotulo">Sequência</span><b>' + sequencia() + '<small> d</small></b></div>' +
    '</div>';

    var lista;
    if (!estado.episodios.length) {
      lista = '<p class="vazio">Nenhum episódio ainda. Cada vez que você rodar o protocolo, ele aparece aqui com a intensidade de antes e a de depois.</p>';
    } else {
      lista = estado.episodios.map(function (e) {
        var salto = '';
        if (typeof e.antes === 'number') {
          salto = '<span class="ep-salto"><span class="pip ' + faixa(e.antes) + '">' + e.antes + '</span>';
          if (typeof e.depois === 'number') {
            salto += '<span>→</span><span class="pip ' + faixa(e.depois) + '">' + e.depois + '</span>';
          }
          salto += '</span>';
        }
        var titulo = e.gatilho || e.emocao || 'Episódio';
        var detalhes = [];
        if (e.emocao && e.gatilho) detalhes.push(e.emocao);
        if (e.corpo) detalhes.push('no ' + e.corpo.toLowerCase());
        if (e.seg) detalhes.push(Math.round(e.seg) + ' s de protocolo');
        return '<div class="ep"><div class="ep-topo"><span class="ep-data">' + esc(e.data) + '</span>' + salto + '</div>' +
          '<b>' + esc(titulo) + '</b>' +
          (detalhes.length ? '<span class="ep-linha">' + esc(detalhes.join(' · ')) + '</span>' : '') +
          '<button class="ep-apagar" data-apagar="' + e.id + '">apagar</button></div>';
      }).join('');
    }

    return '<div class="pag">' +
      '<div class="topo"><h1>Registro</h1></div>' + tiles +
      '<div class="secao"><button class="bt bt-vazio bt-largo" id="bt-manual">Registrar um episódio à mão</button>' +
        '<div id="form-manual" hidden></div></div>' +
      '<div class="secao"><span class="rotulo">Episódios</span>' + lista + '</div>' +
    '</div>';
  }

  function formManual() {
    return '<div class="cartao">' +
      '<div class="campo"><label for="m-gatilho">O que aconteceu</label>' +
      '<input type="text" id="m-gatilho" placeholder="A deixa exata, em uma linha"></div>' +
      '<div class="campo"><label>Intensidade no pico</label><div class="escala" id="m-antes"></div></div>' +
      '<div class="campo"><label>Intensidade depois</label><div class="escala" id="m-depois"></div></div>' +
      '<button class="bt bt-cheio bt-largo" id="m-salvar">Guardar episódio</button></div>';
  }

  /* ================= LIGAÇÕES DE CADA TELA ================= */

  function ligar(nome, arg) {
    var sos = document.getElementById('bt-sos');
    if (sos) sos.addEventListener('click', function () { vibrar(12); ir('protocolo'); });

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
    if (re) re.addEventListener('click', function () {
      estado.dias = {}; guardar(); navegar();
    });

    [].forEach.call(document.querySelectorAll('[data-rotina]'), function (c) {
      c.addEventListener('change', function () {
        var k = c.dataset.rotina;
        var i = estado.rotina.marcados.indexOf(k);
        if (c.checked && i < 0) estado.rotina.marcados.push(k);
        if (!c.checked && i >= 0) estado.rotina.marcados.splice(i, 1);
        guardar();
      });
    });

    montarLembrete();
  }

  function ligarRegistro() {
    var bt = document.getElementById('bt-manual');
    var area = document.getElementById('form-manual');
    if (bt) bt.addEventListener('click', function () {
      if (!area.hidden) { area.hidden = true; bt.textContent = 'Registrar um episódio à mão'; return; }
      area.innerHTML = formManual();
      area.hidden = false;
      bt.textContent = 'Cancelar';
      var antes = null, depois = null;
      escala(document.getElementById('m-antes'), function (v) { antes = v; });
      escala(document.getElementById('m-depois'), function (v) { depois = v; });
      document.getElementById('m-salvar').addEventListener('click', function () {
        var g = document.getElementById('m-gatilho').value.trim();
        if (!g && antes === null) return;
        estado.episodios.unshift({
          id: String(Date.now()), data: hoje(), gatilho: g, antes: antes, depois: depois, tipo: 'manual'
        });
        guardar(); navegar();
      });
    });

    [].forEach.call(document.querySelectorAll('[data-apagar]'), function (b) {
      var armado = false;
      b.addEventListener('click', function () {
        // sem confirm() no WebView: o próprio botão pede a segunda toque
        if (!armado) { armado = true; b.textContent = 'apagar mesmo?'; return; }
        estado.episodios = estado.episodios.filter(function (e) { return e.id !== b.dataset.apagar; });
        guardar(); navegar();
      });
    });
  }

  /** Monta uma escala 0–10 e devolve o valor por callback. */
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

  /* ================= O PALCO: protocolo e ferramentas guiadas ================= */

  var sessao = null;

  function abrirPalco(idFerramenta) {
    var passos, titulo;
    if (idFerramenta) {
      var f = FERRAMENTAS.filter(function (x) { return x.id === idFerramenta; })[0];
      if (!f) { ir('ferramentas'); return; }
      titulo = f.nome;
      passos = f.passos.map(function (p) {
        return {tipo: p.tipo || 'texto', rotulo: titulo, linha: p.texto, apoio: '', seg: p.seg || 0};
      });
      passos.push({tipo: 'fim-ferramenta', rotulo: titulo});
    } else {
      titulo = 'Protocolo';
      passos = [{tipo: 'escala-antes', rotulo: 'Antes de começar'}]
        .concat(PROTOCOLO.map(function (p) { return p; }))
        .concat([{tipo: 'escala-depois', rotulo: 'Agora'}, {tipo: 'desfecho', rotulo: 'Feito'}]);
    }

    sessao = {
      passos: passos, i: 0, titulo: titulo, ferramenta: !!idFerramenta,
      antes: null, depois: null, emocao: null, corpo: null, gatilho: '',
      inicio: Date.now(), salvo: false, saindo: false
    };
    capa.hidden = false;
    document.body.style.overflow = 'hidden';
    travarTela();
    desenharPasso();
  }

  function fecharPalco() {
    if (!sessao) { capa.hidden = true; document.body.style.overflow = ''; return; }
    if (!sessao.ferramenta && !sessao.salvo && sessao.antes !== null) guardarEpisodio();
    sessao = null;
    capa.hidden = true;
    document.body.style.overflow = '';
    soltarTela();
  }

  function guardarEpisodio() {
    if (!sessao || sessao.salvo) return;
    sessao.salvo = true;
    estado.episodios.unshift({
      id: String(Date.now()),
      data: hoje(),
      gatilho: sessao.gatilho,
      emocao: sessao.emocao,
      corpo: sessao.corpo,
      antes: sessao.antes,
      depois: sessao.depois,
      seg: (Date.now() - sessao.inicio) / 1000,
      tipo: 'protocolo'
    });
    guardar();
  }

  function desenharPasso() {
    limpar();
    var p = sessao.passos[sessao.i];
    var palco = capa.querySelector('.palco');
    var acoes = capa.querySelector('.acoes');
    desenharTrilhaPasso();
    capa.querySelector('.relogio').textContent = '';

    if (p.tipo === 'escala-antes' || p.tipo === 'escala-depois') {
      var antes = p.tipo === 'escala-antes';
      palco.innerHTML = '<span class="rotulo">' + esc(p.rotulo) + '</span>' +
        '<h2>' + (antes ? 'Qual a intensidade agora?' : 'E agora, quanto é?') + '</h2>' +
        '<div class="escala" id="esc"></div>' +
        '<div class="escala-pes"><span>0 · calmo</span><span>10 · no limite</span></div>' +
        (antes ? '<p class="apoio">O número não precisa ser exato. O que importa é ter um antes para comparar com o depois.</p>' : '');
      acoes.innerHTML = '<button class="bt bt-cheio bt-largo" id="seguir" disabled>' +
        (antes ? 'Começar' : 'Ver o resultado') + '</button>';
      var seguir = document.getElementById('seguir');
      escala(document.getElementById('esc'), function (v) {
        if (antes) sessao.antes = v; else sessao.depois = v;
        seguir.disabled = false;
      });
      seguir.addEventListener('click', avancar);
      return;
    }

    if (p.tipo === 'desfecho') { desenharDesfecho(); return; }

    if (p.tipo === 'fim-ferramenta') {
      palco.innerHTML = '<span class="rotulo">' + esc(p.rotulo) + '</span>' +
        '<h2>Feito.</h2>' +
        '<p class="apoio">Você executou até o fim. É a repetição, e não a intensidade, que constrói o circuito novo.</p>';
      acoes.innerHTML = '<button class="bt bt-cheio bt-largo" id="sair">Voltar</button>';
      document.getElementById('sair').addEventListener('click', function () { history.back(); });
      vibrar([14, 60, 14]);
      return;
    }

    // passos comuns: texto, respiração, nomear, orientar
    var corpo = '<span class="rotulo">' + esc(p.rotulo) + '</span><h2>' + esc(p.linha) + '</h2>';

    if (p.tipo === 'respiracao') {
      corpo += '<div class="respiro"><div class="bolha" id="bolha"></div><span class="cue" id="cue">Prepare</span></div>';
    }
    if (p.tipo === 'nomear') {
      corpo += '<div class="fichas" id="fichas-emocao">' + EMOCOES.map(function (e) {
        return '<button type="button" aria-pressed="false" data-e="' + esc(e) + '">' + esc(e) + '</button>';
      }).join('') + '</div>' +
      '<span class="rotulo" style="margin-top:6px">Onde no corpo</span>' +
      '<div class="fichas" id="fichas-corpo">' + CORPO.map(function (c) {
        return '<button type="button" aria-pressed="false" data-c="' + esc(c) + '">' + esc(c) + '</button>';
      }).join('') + '</div>';
    }
    if (p.tipo === 'orientar') {
      corpo += '<div class="fichas" id="fichas-orientar">' +
        ['Três coisas que vejo', 'Dois sons', 'Os pés no chão'].map(function (t, i) {
          return '<button type="button" aria-pressed="false" data-o="' + i + '">' + t + '</button>';
        }).join('') + '</div>';
    }
    if (p.apoio) corpo += '<p class="apoio">' + esc(p.apoio) + '</p>';

    palco.innerHTML = corpo;
    acoes.innerHTML = '<button class="bt bt-vazio bt-largo" id="seguir">Avançar agora</button>';
    document.getElementById('seguir').addEventListener('click', avancar);

    if (p.tipo === 'nomear') {
      fichaUnica(document.getElementById('fichas-emocao'), 'e', function (v) { sessao.emocao = v; });
      fichaUnica(document.getElementById('fichas-corpo'), 'c', function (v) { sessao.corpo = v; });
    }
    if (p.tipo === 'orientar') {
      var host = document.getElementById('fichas-orientar');
      host.addEventListener('click', function (ev) {
        var b = ev.target.closest('button[data-o]');
        if (!b) return;
        b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        vibrar(8);
      });
    }
    if (p.tipo === 'respiracao') respirar(p.seg);
    if (p.seg) cronometro(p.seg);
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

  function desenharTrilhaPasso() {
    var host = capa.querySelector('.passos');
    var html = '';
    for (var i = 0; i < sessao.passos.length; i++) {
      var cls = i < sessao.i ? 'feito' : (i === sessao.i ? 'atual' : '');
      html += '<i class="' + cls + '"></i>';
    }
    host.innerHTML = html;
  }

  /** Conta o tempo do passo, enche a barrinha e avança sozinho no fim. */
  function cronometro(seg) {
    var fim = Date.now() + seg * 1000;
    var marca = capa.querySelector('.passos i.atual');
    var visor = capa.querySelector('.relogio');
    var id = setInterval(function () {
      var resta = fim - Date.now();
      if (resta <= 0) {
        clearInterval(id);
        visor.textContent = '';
        vibrar(14);
        avancar();
        return;
      }
      visor.textContent = Math.ceil(resta / 1000) + 's';
      if (marca) marca.style.setProperty('--p', (100 - (resta / (seg * 1000)) * 100) + '%');
    }, 100);
    relogios.push(id);
  }

  /**
   * A respiração fisiológica, conduzida pelo círculo: duas inspirações pelo
   * nariz e uma expiração longa pela boca. A expiração é quase o dobro da
   * inspiração — é ela que baixa a frequência cardíaca, e não o ar que entra.
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

  function desenharDesfecho() {
    var palco = capa.querySelector('.palco');
    var acoes = capa.querySelector('.acoes');
    var seg = Math.round((Date.now() - sessao.inicio) / 1000);
    var d = (sessao.antes !== null && sessao.depois !== null) ? sessao.antes - sessao.depois : null;

    var frase;
    if (d === null) frase = 'Episódio guardado.';
    else if (d > 0) frase = 'Caiu ' + d + (d > 1 ? ' pontos' : ' ponto') + (seg >= 45 ? ' em ' + seg + ' segundos' : '') + ', e você não agiu pelo impulso. É exatamente isso que treina o circuito novo.';
    else if (d === 0) frase = 'A intensidade não caiu — e ainda assim você atravessou sem obedecer a ela. Isso conta igual: o que treina é não agir, não é se acalmar.';
    else frase = 'Subiu. Acontece, principalmente no começo e quando a situação ainda está acontecendo. Se estiver acima de 7, a ação é uma só: adiar a resposta em 20 minutos e sair do lugar.';

    palco.innerHTML = '<span class="rotulo">Resultado</span>' +
      '<div class="saldo"><span class="n de">' + (sessao.antes === null ? '—' : sessao.antes) + '</span>' +
      '<span class="seta">→</span><span class="n para">' + (sessao.depois === null ? '—' : sessao.depois) + '</span></div>' +
      '<p class="desfecho-frase">' + esc(frase) + '</p>' +
      '<div class="campo"><label for="d-gatilho">O que disparou? (opcional)</label>' +
      '<input type="text" id="d-gatilho" placeholder="Em uma linha"></div>';

    acoes.innerHTML = '<button class="bt bt-cheio bt-largo" id="guardar">Guardar no registro</button>';
    document.getElementById('guardar').addEventListener('click', function () {
      sessao.gatilho = document.getElementById('d-gatilho').value.trim();
      guardarEpisodio();
      vibrar([14, 60, 14]);
      location.hash = '#/registro';
    });
    vibrar([14, 60, 14]);
  }

  /* ---- manter a tela acesa durante o protocolo, quando o aparelho deixa ---- */
  var trava = null;
  function travarTela() {
    try {
      if (navigator.wakeLock && navigator.wakeLock.request) {
        navigator.wakeLock.request('screen').then(function (t) { trava = t; }).catch(function () {});
      }
    } catch (e) {}
  }
  function soltarTela() {
    try { if (trava) { trava.release(); trava = null; } } catch (e) {}
  }

  /* ================= LEMBRETE (só dentro do aplicativo) ================= */

  function montarLembrete() {
    var ponte = window.AndroidLembrete;
    var area = document.getElementById('area-lembrete');
    if (!ponte || !area) return;

    function ler() {
      try { return JSON.parse(ponte.estadoLembretes()); } catch (e) { return {}; }
    }
    function pintar() {
      var e = ler();
      var aviso = '';
      if (e.ligado && !e.permissao) {
        aviso = '<p class="ep-linha">As notificações estão desligadas para este app. Toque em ligar de novo para liberar.</p>';
      } else if (e.ligado && !e.exato) {
        aviso = '<p class="ep-linha">Sem permissão de alarme exato, o aviso pode chegar alguns minutos depois da hora.</p>';
      }
      area.innerHTML = '<span class="rotulo">Lembrete diário</span><div class="cartao">' +
        '<p>' + (e.ligado ? 'Todo dia às ' + esc(e.hora) + '.' : 'O programa depende de repetição, e repetição depende de lembrar.') + '</p>' +
        '<div class="campo"><label for="lb-hora">Hora do bloco da noite</label>' +
        '<input type="time" id="lb-hora" step="300" value="' + esc(e.hora || '21:00') + '"></div>' +
        '<button class="bt bt-cheio bt-largo" id="lb-ligar">' + (e.ligado ? 'Trocar a hora' : 'Ligar lembrete') + '</button>' +
        (e.ligado ? '<button class="bt bt-vazio bt-largo" id="lb-desligar">Desligar</button>' : '') +
        aviso + '</div>';
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
  if (!location.hash) location.replace('#/agora');
  navegar();
})();
