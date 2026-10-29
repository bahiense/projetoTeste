'use strict';

/*
 * Espalhe: escolhe uma foto ou vídeo, marca em quais perfis vai, mostra como
 * fica em cada rede e entrega a cada app o arquivo já no tamanho certo.
 *
 * A ponte nativa (window.Espalhe, em Ponte.kt) faz o que a página não
 * consegue: abrir a galeria, gerar as versões e abrir o app de cada rede.
 * O que demora volta em window.__resposta(pedido, json).
 */

const N = window.Espalhe;
const M = window.EspalheMetricas;
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ------------------------------------------------------------------ estado

const CHAVE = 'espalhe.v1';

function lerGuardado() {
    try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; }
}

function novoRascunho() {
    return {
        id: 'p' + Date.now(),
        etapa: 'compor',      // compor → previa → enviar
        midia: null,
        legenda: '',
        alvos: {},            // perfilId → [formatoId]
        enquadros: {},        // "1080x1920" → {modo, zoom, ox, oy, fundo}
        arquivos: {},         // "1080x1920" → {chave, arquivo, mime}
        enviados: {},         // "perfilId:formatoId" → hora em que abriu o app
    };
}

const guardado = lerGuardado();
const est = {
    perfis: guardado.perfis || [],
    historico: guardado.historico || [],
    // o rascunho fica guardado: o Android pode fechar o Espalhe enquanto a
    // pessoa está no Instagram, e a volta precisa cair na mesma lista de envio
    rascunho: guardado.rascunho || novoRascunho(),
    areas: guardado.areas ?? true,
    // os últimos números lidos de cada perfil (sem token nenhum: esses ficam no nativo)
    resultados: guardado.resultados || {},
    periodo: guardado.periodo || 30,
    aba: 'publicar',
    editando: null,
    instalados: new Set(),
    preparo: null,
    erros: {},
    conexoes: {},       // perfilId → {conectado, conta}, perguntado ao nativo
    atualizando: false,
    abertos: {},        // o que está expandido na tela de resultados
    comentarios: {},    // "perfil|post" → resposta, ou 'carregando'
    paginas: null,      // Facebook com várias Páginas: {perfil, lista}
};

function guardar() {
    localStorage.setItem(CHAVE, JSON.stringify({
        perfis: est.perfis, historico: est.historico,
        rascunho: est.rascunho, areas: est.areas,
        resultados: est.resultados, periodo: est.periodo,
    }));
}

const rede = id => REDES.find(r => r.id === id);
const formatoDe = (rd, fid) => rd.formatos.find(f => f.id === fid);
const perfil = id => est.perfis.find(p => p.id === id);
const appDe = p => rede(p.rede).apps.find(a => a.pacote === p.pacote) || rede(p.rede).apps[0];

// ------------------------------------------------------------ ponte nativa

let seq = 1;
const pendentes = {};

function pedir(fn, args = [], aoProgresso, ponte = N) {
    return new Promise(res => {
        const id = seq++;
        pendentes[id] = { res, prog: aoProgresso };
        ponte[fn](id, ...args);
    });
}
const pedirM = (fn, args) => pedir(fn, args, null, M);

window.__resposta = (id, r) => {
    const p = pendentes[id];
    if (!p) return;
    delete pendentes[id];
    p.res(r);
};
window.__progresso = (id, n) => {
    const p = pendentes[id];
    if (p && p.prog) p.prog(n);
};
window.__recebida = r => usarMidia(r);

/* Volta de um login pelo navegador (YouTube, TikTok). */
window.__conectou = (perfilId, ok, recado) => {
    delete est.conexoes[perfilId];
    aviso(ok ? `Conectado: ${recado}` : recado);
    if (ok) atualizarResultados([perfilId]);
    render();
};

/* O botão voltar do Android pergunta aqui antes de fechar o app. */
window.__voltar = () => {
    if (est.editando) { est.editando = null; est.paginas = null; render(); return true; }
    if (est.aba !== 'publicar') { est.aba = 'publicar'; render(); return true; }
    const r = est.rascunho;
    if (r.etapa === 'enviar' && !est.preparo) { r.etapa = 'previa'; guardar(); render(); return true; }
    if (r.etapa === 'previa') { r.etapa = 'compor'; guardar(); render(); return true; }
    return false;
};

function atualizarInstalados() {
    const todos = [...new Set(REDES.flatMap(r => r.apps.map(a => a.pacote)))];
    try {
        est.instalados = new Set(JSON.parse(N.instalados(JSON.stringify(todos))));
    } catch (e) {
        est.instalados = new Set();
    }
}

// --------------------------------------------------------------- utilidades

function aviso(txt) {
    const el = $('#aviso');
    el.textContent = txt;
    el.hidden = false;
    clearTimeout(aviso.t);
    aviso.t = setTimeout(() => { el.hidden = true; }, 4200);
}

const fmtDur = s => {
    s = Math.round(s);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
};
const fmtBytes = b => b > 1e9 ? (b / 1e9).toFixed(1) + ' GB'
    : b > 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.round(b / 1e3) + ' KB';

function proporcao(w, h) {
    const mdc = (a, b) => b ? mdc(b, a % b) : a;
    const d = mdc(w, h);
    return (w / d) + ':' + (h / d);
}

const sigla = rd => `<span class="sigla" style="background:${rd.cor}">${esc(rd.sigla)}</span>`;

/**
 * O pedaço da mídia (sw×sh) que enche um formato w×h: o maior retângulo na
 * proporção certa, reduzido pelo zoom e deslocado por ox/oy (-1 a 1).
 * A mesma conta está em Gerador.recorte — prévia e arquivo final batem.
 */
function recorte(sw, sh, w, h, q) {
    const a = w / h;
    let cw, ch;
    if (sw / sh > a) { ch = sh; cw = sh * a; } else { cw = sw; ch = sw / a; }
    const z = Math.min(4, Math.max(1, q.zoom || 1));
    cw /= z; ch /= z;
    const ox = Math.min(1, Math.max(-1, q.ox || 0));
    const oy = Math.min(1, Math.max(-1, q.oy || 0));
    return [(sw - cw) * (ox + 1) / 2, (sh - ch) * (oy + 1) / 2, cw, ch];
}

// ------------------------------------------------------------ alvos e mídia

const tipoAtual = () => est.rascunho.midia?.tipo || 'foto';

function formatosPadrao(rd, tipo) {
    const aceitos = rd.formatos.filter(f => f.tipos.includes(tipo));
    const pad = aceitos.filter(f => (f.padrao || []).includes(tipo));
    return (pad.length ? pad : aceitos.slice(0, 1)).map(f => f.id);
}

/* Os formatos escolhidos que servem para a mídia atual. */
function formatosValidos(pid) {
    const p = perfil(pid);
    if (!p) return [];
    const rd = rede(p.rede);
    const tipo = est.rascunho.midia?.tipo;
    return (est.rascunho.alvos[pid] || [])
        .map(fid => formatoDe(rd, fid))
        .filter(f => f && (!tipo || f.tipos.includes(tipo)));
}

/* Lista de envio: um item por perfil e formato, na ordem dos perfis. */
function envios() {
    const lista = [];
    for (const p of est.perfis) {
        if (!est.rascunho.alvos[p.id]) continue;
        for (const f of formatosValidos(p.id)) lista.push({ p, rd: rede(p.rede), f });
    }
    return lista;
}

/* Ao trocar de foto para vídeo (ou o contrário), tira o que não serve e
   põe o formato padrão onde não sobrou nada. */
function ajustarFormatos() {
    const r = est.rascunho;
    const tipo = tipoAtual();
    for (const pid of Object.keys(r.alvos)) {
        const p = perfil(pid);
        if (!p) { delete r.alvos[pid]; continue; }
        const rd = rede(p.rede);
        const ok = r.alvos[pid].filter(fid => formatoDe(rd, fid)?.tipos.includes(tipo));
        r.alvos[pid] = ok.length ? ok : formatosPadrao(rd, tipo);
    }
}

let miniatura = null;

function carregarMiniatura() {
    const m = est.rascunho.midia;
    if (!m) { miniatura = null; return; }
    miniatura = new Image();
    miniatura.onload = () => desenharTodos();
    miniatura.src = '/midia/' + m.miniatura;
}

function apagarMidia(m) {
    if (!m) return;
    N.apagar(m.arquivo);
    N.apagar(m.miniatura);
}

function usarMidia(m) {
    if (!m || m.cancelado) return;
    if (m.erro) { aviso(m.erro); return; }
    const r = est.rascunho;
    apagarMidia(r.midia);
    N.limparSaida();
    Object.assign(r, { midia: m, enquadros: {}, arquivos: {}, enviados: {}, etapa: 'compor' });
    est.aba = 'publicar';
    est.erros = {};
    ajustarFormatos();
    guardar();
    carregarMiniatura();
    render();
}

// ---------------------------------------------------------------- enquadro

/* Padrão: preencher, a não ser que o recorte fosse jogar fora quase metade
   da imagem (foto deitada num Stories, por exemplo) — aí cabe inteira. */
function enquadro(w, h) {
    const r = est.rascunho;
    const k = w + 'x' + h;
    if (!r.enquadros[k]) {
        const m = r.midia;
        const am = m.w / m.h, af = w / h;
        const sobra = Math.min(am / af, af / am);
        r.enquadros[k] = { modo: sobra < 0.6 ? 'caber' : 'preencher', zoom: 1, ox: 0, oy: 0, fundo: 'desfoque' };
    }
    return r.enquadros[k];
}

function desenhar(cv) {
    const img = miniatura;
    if (!img || !img.complete || !img.naturalWidth) return;
    const box = cv.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const W = Math.max(1, Math.round(box.width * dpr));
    const H = Math.max(1, Math.round(box.height * dpr));
    if (cv.width !== W) cv.width = W;
    if (cv.height !== H) cv.height = H;
    const fw = +cv.dataset.w, fh = +cv.dataset.h;
    const q = enquadro(fw, fh);
    const tw = img.naturalWidth, th = img.naturalHeight;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, W, H);

    if (q.modo === 'caber') {
        const fundo = est.rascunho.midia.tipo === 'video' ? 'preto' : q.fundo;
        if (fundo === 'desfoque') {
            const c = recorte(tw, th, fw, fh, { zoom: 1 });
            ctx.filter = `blur(${Math.round(W / 28)}px)`;
            ctx.drawImage(img, c[0], c[1], c[2], c[3], -W * 0.06, -H * 0.06, W * 1.12, H * 1.12);
            ctx.filter = 'none';
            ctx.fillStyle = 'rgba(0,0,0,.27)';
        } else {
            ctx.fillStyle = fundo === 'branco' ? '#fff' : '#000';
        }
        ctx.fillRect(0, 0, W, H);
        const s = Math.min(W / tw, H / th);
        const dw = tw * s, dh = th * s;
        ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
        const c = recorte(tw, th, fw, fh, q);
        ctx.drawImage(img, c[0], c[1], c[2], c[3], 0, 0, W, H);
    }
}

function desenharTodos(grupo) {
    const sel = grupo ? `canvas[data-g="${grupo}"]` : 'canvas[data-g]';
    document.querySelectorAll(sel).forEach(desenhar);
}

/* Arrastar a imagem dentro do quadro muda o que aparece (só no "preencher"). */
let arrasto = null;

document.addEventListener('pointerdown', e => {
    const cv = e.target.closest('.quadro')?.querySelector('canvas');
    if (!cv || !miniatura) return;
    const fw = +cv.dataset.w, fh = +cv.dataset.h;
    const q = enquadro(fw, fh);
    if (q.modo !== 'preencher') return;
    const tw = miniatura.naturalWidth, th = miniatura.naturalHeight;
    const c = recorte(tw, th, fw, fh, q);
    const box = cv.getBoundingClientRect();
    arrasto = {
        id: e.pointerId, x: e.clientX, y: e.clientY, ox: q.ox, oy: q.oy, q, g: cv.dataset.g,
        // quantos pixels da miniatura cada pixel de tela representa, e a folga para mover
        kx: c[2] / box.width, ky: c[3] / box.height, fx: tw - c[2], fy: th - c[3],
    };
    e.target.setPointerCapture?.(e.pointerId);
    e.preventDefault();
});

document.addEventListener('pointermove', e => {
    const a = arrasto;
    if (!a || e.pointerId !== a.id) return;
    const lim = v => Math.min(1, Math.max(-1, v));
    if (a.fx > 0.5) a.q.ox = lim(a.ox - 2 * (e.clientX - a.x) * a.kx / a.fx);
    if (a.fy > 0.5) a.q.oy = lim(a.oy - 2 * (e.clientY - a.y) * a.ky / a.fy);
    if (!a.raf) a.raf = requestAnimationFrame(() => { a.raf = 0; desenharTodos(a.g); });
});

const soltar = e => {
    if (!arrasto || e.pointerId !== arrasto.id) return;
    arrasto = null;
    guardar();
};
document.addEventListener('pointerup', soltar);
document.addEventListener('pointercancel', soltar);

// ------------------------------------------------------------------ telas

function render() {
    document.querySelectorAll('#abas button').forEach(b =>
        b.classList.toggle('ativa', b.dataset.aba === est.aba));
    const barra = $('#barra');
    barra.hidden = true;
    barra.innerHTML = '';
    if (est.aba === 'perfis') renderPerfis();
    else if (est.aba === 'historico') renderHistorico();
    else if (est.aba === 'resultados') renderResultados();
    else if (est.rascunho.etapa === 'previa' && est.rascunho.midia) renderPrevia();
    else if (est.rascunho.etapa === 'enviar' && est.rascunho.midia) renderEnviar();
    else renderCompor();
}

function cabecalho(titulo, sub) {
    $('#titulo').textContent = titulo;
    $('#subtitulo').textContent = sub;
}

function mostrarBarra(html) {
    const barra = $('#barra');
    barra.innerHTML = html;
    barra.hidden = false;
}

// ---- 1. compor

function renderCompor() {
    const r = est.rascunho;
    const m = r.midia;
    est.rascunho.etapa = 'compor';
    cabecalho('Publicar', 'O que vai postar e em quais perfis.');

    const midia = m ? `
        <div class="midia">
            <img src="/midia/${esc(m.miniatura)}" alt="">
            <div>
                <b>${m.tipo === 'video' ? 'Vídeo' : 'Foto'}</b>
                <small>${m.w} × ${m.h}${m.tipo === 'video' ? ' · ' + fmtDur(m.dur) : ''} · ${fmtBytes(m.bytes)}</small>
                <button class="leve" data-acao="escolher">Trocar</button>
            </div>
        </div>` : `
        <button class="grande" data-acao="escolher">＋ Escolher foto ou vídeo</button>
        <p class="dica">Também dá para abrir a galeria, tocar em Compartilhar e escolher o Espalhe.</p>`;

    let destinos;
    if (!est.perfis.length) {
        destinos = `<p class="dica">Você ainda não cadastrou nenhum perfil.</p>
            <button class="primario" data-acao="ir-perfis">Cadastrar meus perfis</button>`;
    } else {
        destinos = REDES.filter(rd => est.perfis.some(p => p.rede === rd.id)).map(rd => `
            <div class="rede-grupo">
                <div class="rede-titulo">${sigla(rd)} ${esc(rd.nome)}</div>
                ${est.perfis.filter(p => p.rede === rd.id).map(p => alvoHtml(p, rd)).join('')}
            </div>`).join('') + `
            <div class="linha-acoes">
                <button class="leve" data-acao="todos">Marcar todos</button>
                <button class="leve" data-acao="nenhum">Desmarcar</button>
            </div>`;
    }

    $('#conteudo').innerHTML = `
        <section class="cartao"><h2><i>1</i> O que vai postar</h2>${midia}</section>
        <section class="cartao">
            <h2><i>2</i> Legenda</h2>
            <textarea id="legenda" rows="4" placeholder="Texto, hashtags, link…">${esc(r.legenda)}</textarea>
            <div class="contador" id="contador"></div>
        </section>
        <section class="cartao"><h2><i>3</i> Onde publicar</h2>${destinos}</section>`;

    contarLegenda();
    const n = envios().length;
    const nPerfis = new Set(envios().map(e => e.p.id)).size;
    mostrarBarra(`
        <span class="resumo">${n ? `${nPerfis} perfi${nPerfis > 1 ? 's' : 'l'} · ${n} publicaç${n > 1 ? 'ões' : 'ão'}` : (m ? 'Marque os perfis' : 'Escolha a mídia')}</span>
        <button class="primario" data-acao="previa" ${m && n ? '' : 'disabled'}>Ver como fica →</button>`);
}

function alvoHtml(p, rd) {
    const r = est.rascunho;
    const sel = !!r.alvos[p.id];
    const tipo = r.midia?.tipo;
    const instalado = est.instalados.has(p.pacote);
    const aceita = !tipo || rd.formatos.some(f => f.tipos.includes(tipo));
    const chips = sel && aceita ? `<div class="chips">${rd.formatos.map(f => {
        const ok = !tipo || f.tipos.includes(tipo);
        const on = (r.alvos[p.id] || []).includes(f.id) && ok;
        return `<button class="chip ${on ? 'on' : ''}" data-acao="formato" data-id="${p.id}" data-f="${f.id}" ${ok ? '' : 'disabled'}>
            ${esc(f.nome)}<small>${proporcao(f.w, f.h)}</small></button>`;
    }).join('')}</div>` : '';
    return `
        <div class="alvo ${sel ? 'sel' : ''}">
            <button class="alvo-linha" data-acao="perfil" data-id="${p.id}">
                <span class="caixa">${sel ? '✓' : ''}</span>
                <span class="alvo-nome">${esc(p.nome)}
                    <small>${esc(appDe(p).nome)}${instalado ? '' : ' · <em>app não instalado</em>'}${aceita ? '' : ` · não aceita ${tipo === 'video' ? 'vídeo' : 'foto'}`}</small>
                </span>
            </button>
            ${chips}
        </div>`;
}

function contarLegenda() {
    const el = $('#contador');
    if (!el) return;
    const n = [...est.rascunho.legenda].length;
    const limites = envios().filter(e => e.rd.limiteTexto && n > e.rd.limiteTexto);
    el.innerHTML = `${n} caractere${n === 1 ? '' : 's'}` + (limites.length
        ? ` · <em>passa de ${limites[0].rd.limiteTexto} no ${esc(limites[0].rd.nome)}</em>` : '');
}

// ---- 2. prévia

function gruposPrevia() {
    const grupos = new Map();
    const vistos = new Set();
    for (const { p, rd, f } of envios()) {
        const k = f.w + 'x' + f.h;
        if (!grupos.has(k)) grupos.set(k, { w: f.w, h: f.h, telas: [] });
        // dois perfis do Instagram no mesmo formato: uma prévia só, com os dois nomes
        const chaveTela = rd.id + ':' + f.id;
        const g = grupos.get(k);
        if (vistos.has(chaveTela)) {
            g.telas.find(t => t.chave === chaveTela).perfis.push(p);
        } else {
            vistos.add(chaveTela);
            g.telas.push({ chave: chaveTela, rd, f, perfis: [p] });
        }
    }
    return [...grupos.entries()];
}

function renderPrevia() {
    const r = est.rascunho;
    const m = r.midia;
    cabecalho('Como vai ficar', 'Ajuste o enquadramento de cada tamanho. Arraste a imagem para escolher o que aparece.');

    const grupos = gruposPrevia();
    $('#conteudo').innerHTML = `
        <label class="interruptor">
            <input type="checkbox" data-acao="areas" ${est.areas ? 'checked' : ''}>
            Mostrar em vermelho o que fica atrás dos botões e textos da rede
        </label>
        ${grupos.map(([k, g]) => grupoHtml(k, g, m)).join('')}`;

    requestAnimationFrame(() => desenharTodos());
    mostrarBarra(`
        <button class="leve" data-acao="voltar-compor">← Voltar</button>
        <button class="primario" data-acao="enviar-etapa">Preparar ${grupos.length} arquivo${grupos.length > 1 ? 's' : ''} →</button>`);
}

function grupoHtml(k, g, m) {
    const q = enquadro(g.w, g.h);
    const avisos = [];
    // a mídia original é pequena para o tamanho final? (vai ser ampliada)
    const usado = q.modo === 'caber'
        ? Math.min(g.w / m.w, g.h / m.h)
        : g.w / recorte(m.w, m.h, g.w, g.h, q)[2];
    if (usado > 1.5) avisos.push('A mídia original tem pouca resolução para este tamanho e vai ser ampliada: pode ficar um pouco borrada.');

    const usam = g.telas.map(t => `${t.rd.nome} ${t.f.nome}`).join(', ');
    return `
    <section class="cartao grupo">
        <div class="grupo-topo">
            <b>${g.w} × ${g.h}</b><span class="prop">${proporcao(g.w, g.h)}</span>
        </div>
        <p class="dica">Vale para: ${esc(usam)}.</p>
        <div class="seg">
            <button data-acao="modo" data-g="${k}" data-v="preencher" class="${q.modo === 'preencher' ? 'on' : ''}">Preencher a tela</button>
            <button data-acao="modo" data-g="${k}" data-v="caber" class="${q.modo === 'caber' ? 'on' : ''}">Mostrar inteira</button>
        </div>
        ${q.modo === 'preencher' ? `
            <label class="zoom">Zoom
                <input type="range" min="1" max="3" step="0.01" value="${q.zoom}" data-acao="zoom" data-g="${k}">
                <button class="leve pequeno" data-acao="centralizar" data-g="${k}">Centralizar</button>
            </label>` : m.tipo === 'foto' ? `
            <div class="seg fino">
                <span>Fundo</span>
                ${[['desfoque', 'Desfocado'], ['preto', 'Preto'], ['branco', 'Branco']].map(([v, t]) =>
                    `<button data-acao="fundo" data-g="${k}" data-v="${v}" class="${q.fundo === v ? 'on' : ''}">${t}</button>`).join('')}
            </div>` : '<p class="dica">No vídeo, o espaço que sobra fica preto.</p>'}
        ${avisos.map(a => `<p class="alerta">${esc(a)}</p>`).join('')}
        <div class="telas">${g.telas.map(t => telaHtml(t, k, m)).join('')}</div>
    </section>`;
}

function telaHtml(t, k, m) {
    const { rd, f } = t;
    const nome = esc(t.perfis[0].nome);
    const outros = t.perfis.length > 1 ? ` <small>+${t.perfis.length - 1}</small>` : '';
    const leg = esc(est.rascunho.legenda.slice(0, 90)) || '<span class="vazio">sem legenda</span>';
    const av = `<i class="av" style="background:${rd.cor}"></i>`;
    let sobre = '';
    if (f.tela === 'story' || f.tela === 'status') {
        sobre = `<div class="ui"><div class="barras"><i></i></div>
            <div class="cab">${av}<b>${f.tela === 'status' ? 'Meu status' : nome}</b></div>
            ${f.tela === 'story' ? '<div class="caixa-msg">Enviar mensagem</div>' : `<div class="leg-status">${leg}</div>`}</div>`;
    } else if (f.tela === 'vertical') {
        sobre = `<div class="ui"><div class="lado"><span>♥</span><span>💬</span><span>↗</span></div>
            <div class="base"><b>${nome}</b><p>${leg}</p></div></div>`;
    }
    const a = AREAS_COBERTAS[f.tela];
    const areas = est.areas && f.tela !== 'feed' ? `
        <div class="area" style="top:0;height:${a.topo * 100}%"></div>
        <div class="area" style="bottom:0;height:${a.base * 100}%"></div>
        ${a.dir ? `<div class="area" style="right:0;top:${a.topo * 100}%;bottom:${a.base * 100}%;width:${a.dir * 100}%"></div>` : ''}` : '';

    const larg = f.w > f.h ? 260 : f.tela === 'feed' ? 210 : 158;
    const durAviso = m.tipo === 'video' && f.maxSeg && m.dur > f.maxSeg + 0.5
        ? `<p class="alerta">Vídeo de ${fmtDur(m.dur)}: acima de ${fmtDur(f.maxSeg)} o app pode cortar ou dividir.</p>` : '';

    return `
    <figure class="tela tela-${f.tela}" style="width:${larg}px">
        <figcaption>${sigla(rd)} ${esc(rd.nome)} · ${esc(f.nome)}</figcaption>
        <div class="moldura">
            ${f.tela === 'feed' ? `<div class="feed-cab">${av}<b>${nome}</b>${outros}</div>` : ''}
            <div class="quadro ${enquadro(f.w, f.h).modo === 'preencher' ? 'arrastavel' : ''}" style="aspect-ratio:${f.w}/${f.h}">
                <canvas data-g="${k}" data-w="${f.w}" data-h="${f.h}"></canvas>
                ${m.tipo === 'video' ? '<span class="play">▶</span>' : ''}
                ${areas}${sobre}
            </div>
            ${f.tela === 'feed' ? `<div class="feed-acoes">♡ 💬 ↗</div><div class="feed-leg"><b>${nome}</b> ${leg}</div>` : ''}
        </div>
        ${durAviso}
    </figure>`;
}

// ---- 3. preparar e enviar

function chaveArquivo(w, h, q, tipo) {
    const fundo = q.modo === 'caber' ? (tipo === 'video' ? 'preto' : q.fundo) : '';
    return [w, h, q.modo, (+q.zoom).toFixed(3), (+q.ox).toFixed(3), (+q.oy).toFixed(3), fundo].join('|');
}

/* Gera um arquivo por tamanho (um 1080×1920 serve ao Stories, ao Reels, ao
   TikTok e ao status). Só refaz o que mudou desde a última vez. */
async function preparar() {
    const r = est.rascunho;
    const m = r.midia;
    const faltam = gruposPrevia().map(([k, g]) => ({ k, g, q: enquadro(g.w, g.h) }))
        .filter(({ k, g, q }) => r.arquivos[k]?.chave !== chaveArquivo(g.w, g.h, q, m.tipo));
    if (!faltam.length) return;
    est.erros = {};
    est.preparo = { feito: 0, total: faltam.length, pct: 0 };
    render();
    for (const { k, g, q } of faltam) {
        est.preparo.atual = `${g.w} × ${g.h}`;
        est.preparo.pct = 0;
        renderProgresso();
        const res = await pedir('gerar', [JSON.stringify({
            arquivo: m.arquivo, tipo: m.tipo, w: g.w, h: g.h,
            modo: q.modo, zoom: q.zoom, ox: q.ox, oy: q.oy, fundo: q.fundo,
            saida: `${r.id}_${g.w}x${g.h}_${Date.now() % 100000}`,
        })], pct => { est.preparo.pct = pct; renderProgresso(); });
        if (res.erro) {
            est.erros[k] = res.erro;
        } else {
            if (r.arquivos[k]) N.apagar(r.arquivos[k].arquivo);
            r.arquivos[k] = { chave: chaveArquivo(g.w, g.h, q, m.tipo), arquivo: res.arquivo, mime: res.mime };
            guardar();
        }
        est.preparo.feito++;
    }
    est.preparo = null;
    render();
}

function renderProgresso() {
    const el = $('#progresso');
    const p = est.preparo;
    if (!el || !p) return;
    const total = (p.feito + p.pct / 100) / p.total;
    el.innerHTML = `
        <b>Preparando ${p.atual} (${p.feito + 1} de ${p.total})</b>
        <div class="trilho"><i style="width:${Math.round(total * 100)}%"></i></div>
        <small>${est.rascunho.midia.tipo === 'video' ? 'Vídeo demora: o aparelho refaz quadro a quadro. Deixe a tela ligada.' : ''}</small>`;
}

function renderEnviar() {
    const r = est.rascunho;
    cabecalho('Enviar', 'Toque em cada um. O app da rede abre com o arquivo pronto; você confirma lá.');
    const lista = envios();
    const feitos = lista.filter(e => r.enviados[e.p.id + ':' + e.f.id]).length;
    const contaPorApp = {};
    for (const p of est.perfis) if (r.alvos[p.id]) contaPorApp[p.pacote] = (contaPorApp[p.pacote] || 0) + 1;

    const linhas = lista.map(({ p, rd, f }) => {
        const k = f.w + 'x' + f.h;
        const arq = r.arquivos[k];
        const quando = r.enviados[p.id + ':' + f.id];
        const instalado = est.instalados.has(p.pacote);
        const erro = est.erros[k];
        const conta = contaPorApp[p.pacote] > 1
            ? ` <b>Confira se a conta ativa no ${esc(appDe(p).nome)} é ${esc(p.nome)}</b> — se não for, troque lá antes de publicar.` : '';
        let botao;
        if (!instalado) botao = `<button class="leve pequeno" data-acao="loja" data-pacote="${p.pacote}">Instalar</button>`;
        else botao = `<button class="${quando ? 'leve' : 'primario'} pequeno" data-acao="enviar" data-id="${p.id}" data-f="${f.id}" ${arq ? '' : 'disabled'}>${quando ? 'De novo' : 'Enviar'}</button>`;
        return `
        <div class="envio ${quando ? 'feito' : ''}">
            <div class="envio-cab">
                ${sigla(rd)}
                <div class="envio-nome"><b>${esc(p.nome)}</b><small>${esc(rd.nome)} · ${esc(f.nome)} · ${f.w}×${f.h}</small></div>
                ${botao}
            </div>
            ${erro ? `<p class="alerta">${esc(erro)} <button class="leve pequeno" data-acao="tentar">Tentar de novo</button></p>` : ''}
            ${quando ? `<p class="ok">✓ Aberto no ${esc(appDe(p).nome)} às ${new Date(quando).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>` : ''}
            <p class="dica">${esc(rd.dica)}${conta}${instalado ? '' : ' O app não está instalado neste celular.'}</p>
        </div>`;
    }).join('');

    const galeria = Object.entries(r.arquivos).map(([k, a]) => `
        <button class="leve pequeno" data-acao="galeria" data-k="${k}">${k.replace('x', ' × ')}</button>`).join('');

    $('#conteudo').innerHTML = `
        ${est.preparo ? '<section class="cartao" id="progresso"></section>' : ''}
        ${r.legenda.trim() ? `<section class="cartao legenda-copiada">
            <p>A legenda vai para a área de transferência a cada envio. Se o app não preencher sozinho,
            toque e segure no campo de texto e escolha <b>Colar</b>.</p>
            <button class="leve pequeno" data-acao="copiar">Copiar legenda agora</button>
        </section>` : ''}
        <section class="cartao">
            <h2>${feitos} de ${lista.length} enviados</h2>
            ${linhas}
        </section>
        ${galeria ? `<section class="cartao"><h2>Salvar uma cópia na galeria</h2>
            <p class="dica">Para postar à mão em outra rede ou pelo computador.</p>
            <div class="linha-acoes">${galeria}</div></section>` : ''}`;
    renderProgresso();
    mostrarBarra(`
        <button class="leve" data-acao="voltar-previa" ${est.preparo ? 'disabled' : ''}>← Ajustar</button>
        <button class="primario" data-acao="concluir" ${est.preparo ? 'disabled' : ''}>Concluir</button>`);
}

function concluir() {
    const r = est.rascunho;
    const lista = envios();
    const pendentesN = lista.filter(e => !r.enviados[e.p.id + ':' + e.f.id]).length;
    if (pendentesN && !confirm(`Ainda falta${pendentesN > 1 ? 'm' : ''} ${pendentesN}. Concluir mesmo assim?`)) return;
    est.historico.unshift({
        data: Date.now(),
        tipo: r.midia.tipo,
        legenda: r.legenda,
        // perfil, formato e hora: é o que liga a publicação ao post que aparece
        // na rede depois, para os resultados
        envios: lista.map(({ p, rd, f }) => ({
            pid: p.id, perfil: p.nome, rede: rd.id, fid: f.id, formato: f.nome,
            feito: !!r.enviados[p.id + ':' + f.id], hora: r.enviados[p.id + ':' + f.id] || null,
        })),
    });
    est.historico = est.historico.slice(0, 200);
    // as versões e o original só ocupam espaço depois de publicados
    N.limparSaida();
    apagarMidia(r.midia);
    est.rascunho = novoRascunho();
    miniatura = null;
    guardar();
    render();
    aviso('Publicação concluída e guardada no histórico.');
}

// ---- perfis

function renderPerfis() {
    cabecalho('Meus perfis', 'Todas as contas onde você publica. Pode ter mais de uma em cada rede.');
    const e = est.editando;
    let form = '';
    if (e) {
        const rd = rede(e.rede);
        form = `
        <section class="cartao form">
            <h2>${e.id ? 'Editar perfil' : 'Novo perfil'}</h2>
            <label class="rotulo">Rede</label>
            <div class="redes-grade">${REDES.map(x => `
                <button data-acao="form-rede" data-r="${x.id}" class="${x.id === e.rede ? 'on' : ''}">${sigla(x)}<span>${esc(x.nome)}</span></button>`).join('')}
            </div>
            <label class="rotulo" for="f-nome">Nome do perfil</label>
            <input id="f-nome" value="${esc(e.nome)}" placeholder="@seuperfil, nome da página…" autocomplete="off">
            ${rd.apps.length > 1 ? `
                <label class="rotulo">Publicar pelo app</label>
                <div class="opcoes">${rd.apps.map(a => `
                    <button data-acao="form-app" data-pacote="${a.pacote}" class="${a.pacote === e.pacote ? 'on' : ''}">
                        ${esc(a.nome)}${a.leve ? ' <small class="leve-tag">mais leve</small>' : ''}${est.instalados.has(a.pacote) ? '' : ' <small>não instalado</small>'}</button>`).join('')}
                </div>` : ''}
            ${est.instalados.has(e.pacote) ? '' : `
                <p class="dica">Para publicar neste perfil, o ${esc(appDe(e).nome)} precisa estar no celular.
                <button class="leve pequeno" data-acao="loja" data-pacote="${e.pacote}">Baixar na Play Store</button></p>`}
            ${metricasPerfilHtml(e)}
            <div class="linha-acoes">
                <button class="primario" data-acao="salvar-perfil">Salvar</button>
                <button class="leve" data-acao="cancelar-perfil">Cancelar</button>
                ${e.id ? '<button class="perigo" data-acao="apagar-perfil">Apagar</button>' : ''}
            </div>
        </section>`;
    }

    const lista = REDES.filter(rd => est.perfis.some(p => p.rede === rd.id)).map(rd => `
        <div class="rede-grupo">
            <div class="rede-titulo">${sigla(rd)} ${esc(rd.nome)}</div>
            ${est.perfis.filter(p => p.rede === rd.id).map(p => `
                <button class="perfil-linha" data-acao="editar-perfil" data-id="${p.id}">
                    <span>${esc(p.nome)}<small>${esc(appDe(p).nome)}${est.instalados.has(p.pacote) ? '' : ' · <em>app não instalado</em>'}${conexao(p.id).conectado ? ' · <b class="lig">métricas ligadas</b>' : ''}</small></span>
                    <span class="seta">›</span>
                </button>`).join('')}
        </div>`).join('');

    $('#conteudo').innerHTML = `
        ${form}
        ${e ? '' : `<button class="grande" data-acao="novo-perfil">＋ Adicionar perfil</button>`}
        ${lista ? `<section class="cartao">${lista}</section>` : ''}
        <section class="cartao explica">
            <h2>Como funciona com várias contas</h2>
            <p>O Espalhe não entra nas suas contas nem mostra o que os outros postam. Ele prepara a
            mídia no tamanho certo e entrega ao app da rede, que publica na conta que estiver
            <b>ativa nele</b>.</p>
            <p>Com duas contas no mesmo app (dois Instagram, por exemplo), na hora de enviar o Espalhe
            lembra qual conta deve estar ativa: troque lá antes de confirmar.</p>
            <p>O Espalhe publica pelos apps das redes porque é o único jeito de o post sair público em
            todas elas — o status do WhatsApp, por exemplo, não tem outra porta. Para pesar menos, prefira
            as versões leves: ${REDES.flatMap(r => r.apps.filter(a => a.leve)).map(a =>
                `<button class="link-loja" data-acao="loja" data-pacote="${a.pacote}">${esc(a.nome)}</button>`).join(', ')}.
            Dá para tirar o ícone delas da tela inicial e desligar as notificações: o Espalhe abre direto na
            tela de publicar, sem passar pelo feed.</p>
            <p>Para Páginas do Facebook e contas comerciais do Instagram, cadastre o perfil com o app
            <b>Meta Business Suite</b>: ele deixa escolher a conta na hora de publicar. Para um segundo
            WhatsApp, use o <b>WhatsApp Business</b>.</p>
        </section>
        ${segurancaHtml()}`;
    $('#f-nome')?.addEventListener('input', ev => { est.editando.nome = ev.target.value; });
    // o que foi digitado nos campos de ligação sobrevive a um render no meio
    for (const id of ['f-token', 'f-tt-chave', 'f-tt-segredo', 'f-tt-volta']) {
        $('#' + id)?.addEventListener('input', ev => { est.editando[id] = ev.target.value; });
    }
}

function segurancaHtml() {
    let b = { ativo: false, possivel: false };
    try { b = JSON.parse(N.bloqueio()); } catch (e) { }
    const ligados = est.perfis.filter(p => conexao(p.id).conectado).length;
    return `
        <section class="cartao explica">
            <h2>Segurança</h2>
            <label class="interruptor">
                <input type="checkbox" data-acao="bloqueio" ${b.ativo ? 'checked' : ''}>
                Pedir a digital (ou a senha do celular) para abrir o Espalhe
            </label>
            ${b.possivel ? '' : '<p class="dica">Para usar, configure antes um bloqueio de tela no celular.</p>'}
            <p>Os acessos às suas contas ficam cifrados com uma chave guardada no chip de segurança do
            celular: não saem dele, nem em backup. O Espalhe não tem servidor — nada do que você publica
            ou mede passa por outro lugar além das próprias redes.</p>
            ${ligados ? `<button class="perigo pequeno" data-acao="desligar-tudo">Desligar as métricas de todos os perfis</button>` : ''}
        </section>`;
}

function primeiroInstalado(rd) {
    return (rd.apps.find(a => est.instalados.has(a.pacote)) || rd.apps.find(a => a.leve) || rd.apps[0]).pacote;
}

// ---- histórico

function renderHistorico() {
    cabecalho('Histórico', 'O que já foi publicado por aqui.');
    const usado = N.espacoUsado();
    const itens = est.historico.map(h => `
        <div class="hist">
            <small>${new Date(h.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} · ${h.tipo === 'video' ? 'vídeo' : 'foto'}</small>
            <p>${esc(h.legenda.slice(0, 160)) || '<span class="vazio">sem legenda</span>'}</p>
            <div class="chips">${h.envios.map(e => {
                const rd = rede(e.rede);
                return `<span class="chip ${e.feito ? 'on' : 'apagado'}">${rd ? sigla(rd) : ''} ${esc(e.perfil)} · ${esc(e.formato)}${e.feito ? ' ✓' : ''}</span>`;
            }).join('')}</div>
        </div>`).join('');
    $('#conteudo').innerHTML = `
        <section class="cartao">${itens || '<p class="dica">Nada publicado ainda.</p>'}</section>
        <section class="cartao">
            <p class="dica">Arquivos guardados pelo app: ${fmtBytes(usado)}. Eles são apagados ao concluir cada publicação.</p>
            ${est.historico.length ? '<button class="perigo pequeno" data-acao="limpar-historico">Apagar histórico</button>' : ''}
        </section>`;
}

// ---------------------------------------------------------------- eventos

const acoes = {
    async escolher() { usarMidia(await pedir('escolherMidia')); },
    'ir-perfis'() { est.aba = 'perfis'; est.editando = novoPerfil(); render(); },
    perfil(b) {
        const r = est.rascunho;
        const p = perfil(b.dataset.id);
        if (r.alvos[p.id]) delete r.alvos[p.id];
        else r.alvos[p.id] = formatosPadrao(rede(p.rede), tipoAtual());
        guardar(); render();
    },
    formato(b) {
        const lista = est.rascunho.alvos[b.dataset.id];
        const i = lista.indexOf(b.dataset.f);
        if (i >= 0) lista.splice(i, 1); else lista.push(b.dataset.f);
        // sem nenhum formato, o perfil sai da lista
        if (!lista.length) delete est.rascunho.alvos[b.dataset.id];
        guardar(); render();
    },
    todos() {
        for (const p of est.perfis) {
            if (!est.rascunho.alvos[p.id]) est.rascunho.alvos[p.id] = formatosPadrao(rede(p.rede), tipoAtual());
        }
        guardar(); render();
    },
    nenhum() { est.rascunho.alvos = {}; guardar(); render(); },
    previa() { est.rascunho.etapa = 'previa'; guardar(); render(); window.scrollTo(0, 0); },
    'voltar-compor'() { est.rascunho.etapa = 'compor'; guardar(); render(); },
    'voltar-previa'() { est.rascunho.etapa = 'previa'; guardar(); render(); },
    'enviar-etapa'() { est.rascunho.etapa = 'enviar'; guardar(); window.scrollTo(0, 0); render(); preparar(); },
    tentar() { preparar(); },
    modo(b) { enquadroDe(b).modo = b.dataset.v; guardar(); render(); },
    fundo(b) { enquadroDe(b).fundo = b.dataset.v; guardar(); render(); },
    centralizar(b) {
        Object.assign(enquadroDe(b), { zoom: 1, ox: 0, oy: 0 });
        guardar(); render();
    },
    areas(b) { est.areas = b.checked; guardar(); render(); },
    enviar(b) {
        const r = est.rascunho;
        const p = perfil(b.dataset.id);
        const f = formatoDe(rede(p.rede), b.dataset.f);
        const arq = r.arquivos[f.w + 'x' + f.h];
        const erro = N.enviar(arq.arquivo, arq.mime, p.pacote, r.legenda.trim());
        if (erro) { aviso(erro); return; }
        r.enviados[p.id + ':' + f.id] = Date.now();
        guardar();
        render();
    },
    copiar() { N.copiar(est.rascunho.legenda.trim()); aviso('Legenda copiada.'); },
    loja(b) { N.abrirLoja(b.dataset.pacote); },
    async galeria(b) {
        const a = est.rascunho.arquivos[b.dataset.k];
        const r = await pedir('salvarNaGaleria', [a.arquivo, a.mime]);
        aviso(r.erro || 'Salvo na galeria, na pasta Espalhe.');
    },
    concluir,
    'novo-perfil'() { est.editando = novoPerfil(); render(); },
    'editar-perfil'(b) { est.editando = { ...perfil(b.dataset.id) }; render(); window.scrollTo(0, 0); },
    'form-rede'(b) {
        const rd = rede(b.dataset.r);
        est.editando.rede = rd.id;
        est.editando.pacote = primeiroInstalado(rd);
        render();
    },
    'form-app'(b) { est.editando.pacote = b.dataset.pacote; render(); },
    'salvar-perfil'() {
        const e = est.editando;
        e.nome = e.nome.trim();
        if (!e.nome) { aviso('Dê um nome ao perfil, como @seuperfil.'); $('#f-nome').focus(); return; }
        if (e.id) {
            const i = est.perfis.findIndex(p => p.id === e.id);
            // mudou de rede: os formatos e a ligação de métricas não valem mais
            if (est.perfis[i].rede !== e.rede) {
                delete est.rascunho.alvos[e.id];
                M.desconectar(e.id);
                delete est.resultados[e.id];
                delete est.conexoes[e.id];
            }
            est.perfis[i] = { id: e.id, rede: e.rede, nome: e.nome, pacote: e.pacote };
        } else {
            e.id = 'u' + Date.now();
            est.perfis.push({ id: e.id, rede: e.rede, nome: e.nome, pacote: e.pacote });
            // perfil novo de rede com métricas: fica aberto para ligar logo
            if (rede(e.rede).metricas) {
                guardar(); render();
                aviso('Perfil salvo. Agora, se quiser, ligue as métricas.');
                return;
            }
        }
        est.editando = null;
        guardar(); render();
        aviso('Perfil salvo.');
    },
    bloqueio(b) {
        const erro = N.definirBloqueio(b.checked);
        if (erro) { aviso(erro); b.checked = false; return; }
        aviso(b.checked ? 'Bloqueio ligado: o Espalhe vai pedir a digital ao abrir.' : 'Bloqueio desligado.');
    },
    'desligar-tudo'() {
        if (!confirm('Desligar as métricas de todos os perfis? Você vai precisar ligar cada um de novo.')) return;
        M.desconectarTudo();
        est.conexoes = {};
        est.resultados = {};
        guardar(); render();
    },
    'cancelar-perfil'() { est.editando = null; est.paginas = null; render(); },
    ...acoesMetricas,
    'apagar-perfil'() {
        const e = est.editando;
        if (!confirm(`Apagar o perfil ${e.nome}?`)) return;
        est.perfis = est.perfis.filter(p => p.id !== e.id);
        delete est.rascunho.alvos[e.id];
        M.desconectar(e.id);
        delete est.resultados[e.id];
        est.editando = null;
        guardar(); render();
    },
    'limpar-historico'() {
        if (!confirm('Apagar todo o histórico?')) return;
        est.historico = [];
        guardar(); render();
    },
};

function novoPerfil() {
    const rd = REDES[0];
    return { id: null, rede: rd.id, nome: '', pacote: primeiroInstalado(rd) };
}

function enquadroDe(b) {
    const [w, h] = b.dataset.g.split('x').map(Number);
    return enquadro(w, h);
}

document.addEventListener('click', e => {
    const aba = e.target.closest('#abas button');
    if (aba) {
        est.aba = aba.dataset.aba;
        est.editando = null;
        est.paginas = null;
        render();
        window.scrollTo(0, 0);
        return;
    }
    const b = e.target.closest('[data-acao]');
    if (!b || b.disabled || b.type === 'range') return;
    const f = acoes[b.dataset.acao];
    if (f) f(b);
});

document.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'legenda') {
        est.rascunho.legenda = t.value;
        guardar();
        contarLegenda();
    } else if (t.dataset.acao === 'zoom') {
        enquadroDe(t).zoom = +t.value;
        desenharTodos(t.dataset.g);
    }
});
document.addEventListener('change', e => {
    if (e.target.dataset.acao === 'zoom') { guardar(); render(); }
});

/* Voltando do app de uma rede (ou depois de instalar um), confere de novo
   o que está instalado. */
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    atualizarInstalados();
    if (!arrasto && !est.editando && est.aba !== 'publicar') render();
});

window.addEventListener('resize', () => desenharTodos());

// ------------------------------------------------------------------ início

if (!N) {
    document.body.innerHTML = '<p style="padding:24px">Esta página é a tela do app Espalhe e só funciona dentro dele.</p>';
} else {
    atualizarInstalados();
    // os formatos de um perfil apagado ou de uma rede que mudou não podem travar a lista
    for (const pid of Object.keys(est.rascunho.alvos)) if (!perfil(pid)) delete est.rascunho.alvos[pid];
    carregarMiniatura();
    render();
    // voltou com a lista de envio pela metade e sem algum arquivo: refaz
    if (est.rascunho.etapa === 'enviar' && est.rascunho.midia) preparar();
}
