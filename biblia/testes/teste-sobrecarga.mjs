import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros=[];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ '+n); } catch(e){ console.log('  ✗ '+n+' — '+e.message); erros.push(n); } };

/* Gemini sobrecarregado: 503 "model is overloaded", como no uso real. */
const ctx = await nav.newContext({ viewport:{width:390,height:900} });
await ctx.addInitScript(() => {
  window.__chamadas = 0;
  window.__retryAfter = null;
  const real = window.fetch.bind(window);
  window.fetch = async (entrada, opcoes = {}) => {
    const url = typeof entrada === 'string' ? entrada : entrada.url;
    if (!url.includes('generativelanguage.googleapis.com')) return real(entrada, opcoes);
    if (!url.includes(':streamGenerateContent'))
      return new Response('{"models":[]}', { status:200, headers:{'content-type':'application/json'} });
    window.__chamadas++;
    const h = { 'content-type':'application/json' };
    if (window.__retryAfter) h['retry-after'] = String(window.__retryAfter);
    return new Response(JSON.stringify({ error:{ code:503, status:'UNAVAILABLE',
      message:'The model is overloaded. Please try again later.' } }), { status:503, headers:h });
  };
});
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
await p.goto('http://127.0.0.1:8123/biblia/#/hoje', { waitUntil:'domcontentloaded' });
await p.waitForTimeout(700);
await p.evaluate(() => { const c = B.store.get().config; c.chaveGoogle='AIzaT'; B.store.salvar(); });

await passo('503 vira "sobrecarregado", não "erro genérico"', async () => {
  const r = await p.evaluate(() => new Promise(ok => {
    B.ia.gerar(B.prompts.montar(B.biblia.interpretar('Salmos 1'), B.store.get().config, 'simples'),
      B.store.get().config, {}, new AbortController().signal)
      .then(() => ok({}), e => ok({ causa: e.causa, msg: e.message, esperar: e.esperar }));
  }));
  if (r.causa !== 'servidor') throw new Error('causa: ' + r.causa);
  if (!/sobrecarregado/.test(r.msg)) throw new Error('mensagem: ' + r.msg);
});

await passo('o Retry-After do Google é lido', async () => {
  const r = await p.evaluate(() => { window.__retryAfter = 42; return new Promise(ok => {
    B.ia.gerar(B.prompts.montar(B.biblia.interpretar('Salmos 2'), B.store.get().config, 'simples'),
      B.store.get().config, {}, new AbortController().signal)
      .then(() => ok({}), e => ok({ esperar: e.esperar }));
  }); });
  if (r.esperar !== 42) throw new Error('esperar: ' + r.esperar);
  await p.evaluate(() => { window.__retryAfter = null; });
});

await passo('o mutirão não é derrubado pela sobrecarga: a fila pausa', async () => {
  await p.evaluate(() => { B.lote.comecar({ formato:'simples' }); });
  /* uma falha de capítulo leva ~50s; esperar a primeira pausa de fila */
  await p.waitForFunction(() => B.lote.estado().filaEmPausa > 0, null, { timeout:120000 });
  const e = await p.evaluate(() => B.lote.estado());
  if (!e.ligado) throw new Error('desligou na primeira sobrecarga');
  if (!e.porCausa.servidor) throw new Error('causas: ' + JSON.stringify(e.porCausa));
});

await passo('e a tela diz que a fila está esperando, não que o capítulo errou', async () => {
  await p.goto('http://127.0.0.1:8123/biblia/#/oficina', { waitUntil:'domcontentloaded' });
  await p.waitForTimeout(1300);
  const t = await p.locator('#lote-fase').innerText();
  if (!/a fila volta em/.test(t)) throw new Error(t);
});

await passo('o disjuntor não conta sobrecarga', async () => {
  const txt = await p.evaluate(async () => (await fetch('js/lote.js')).text());
  if (!/seguidas = DE_CONEXAO\[causa\] \? 0/.test(txt))
    throw new Error('sobrecarga ainda conta para o disjuntor');
  await p.evaluate(() => B.lote.parar());
});

await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
