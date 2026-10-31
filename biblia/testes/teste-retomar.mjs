import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros=[];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ '+n); } catch(e){ console.log('  ✗ '+n+' — '+e.message); erros.push(n); } };

const ctx = await nav.newContext({ viewport:{width:390,height:900} });
await ctx.addInitScript(() => {
  window.__n = 0;
  const real = window.fetch.bind(window);
  window.fetch = async (entrada, opcoes = {}) => {
    const url = typeof entrada === 'string' ? entrada : entrada.url;
    if (!url.includes('generativelanguage.googleapis.com')) return real(entrada, opcoes);
    if (!url.includes(':streamGenerateContent'))
      return new Response('{"models":[]}', { status:200, headers:{'content-type':'application/json'} });
    window.__n++;
    const cod = new TextEncoder();
    const l = ['data: ' + JSON.stringify({ candidates:[{ content:{ parts:[{ text:'ok' }] } }] }) + '\n\n',
               'data: ' + JSON.stringify({ candidates:[{ finishReason:'STOP' }] }) + '\n\n'];
    return new Response(new ReadableStream({ start(c){ l.forEach(x=>c.enqueue(cod.encode(x))); c.close(); } }),
      { status:200, headers:{'content-type':'text/event-stream'} });
  };
});
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
await p.goto('http://127.0.0.1:8123/biblia/#/hoje', { waitUntil:'domcontentloaded' });
await p.waitForTimeout(800);
await p.evaluate(() => { const c = B.store.get().config; c.chaveGoogle='AIzaT'; B.store.salvar(); });

/* Duas metades: que os eventos chamam a retomada, e que a retomada sabe
   quando recusar. Juntas, cobrem "ficar sempre ligado sem voltar à toa". */
await passo('app reaparecendo chama a retomada', async () => {
  await p.evaluate(() => {
    window.__chamou = 0;
    const real = B.lote.retomarSePreciso;
    B.lote.retomarSePreciso = function () { window.__chamou++; return real.apply(B.lote, arguments); };
    Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await p.waitForTimeout(400);
  if (!await p.evaluate(() => window.__chamou)) throw new Error('não chamou');
});

await passo('a volta da internet também chama', async () => {
  await p.evaluate(() => { window.__chamou = 0; window.dispatchEvent(new Event('online')); });
  await p.waitForTimeout(400);
  if (!await p.evaluate(() => window.__chamou)) throw new Error('não chamou');
});

await passo('o app aberto do zero chama também', async () => {
  const txt = await p.evaluate(async () => (await fetch('js/app.js')).text());
  if (!/retomarSePreciso\(\)/.test(txt)) throw new Error('não há retomada na abertura');
  if (!/visibilitychange/.test(txt) || !/'online'/.test(txt))
    throw new Error('faltam os gatilhos de reaparecer e de internet');
});

await passo('mas não retoma o que foi desligado de propósito', async () => {
  await p.evaluate(() => { window.__n = 0; });
  await p.evaluate(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('online'));
  });
  await p.waitForTimeout(2500);
  if (await p.evaluate(() => window.__n)) throw new Error('voltou sozinho estando desligado');
});

/* A sequência real: o Google recusa por crédito, o mutirão para e marca a
   chave, e a partir daí nenhum gatilho automático o traz de volta — só o
   botão, que é decisão da pessoa. */
await passo('parado por cobrança, nenhum gatilho automático o traz de volta', async () => {
  await p.evaluate(() => {
    window.__creditos = true;
    const real = window.fetch;
    window.fetch = async (e, o = {}) => {
      const u = typeof e === 'string' ? e : e.url;
      if (u.includes(':streamGenerateContent') && window.__creditos) {
        window.__n++;
        return new Response(JSON.stringify({ error:{ code:429,
          message:'Your prepayment credits are depleted.' } }),
          { status:429, headers:{'content-type':'application/json'} });
      }
      return real(e, o);
    };
    B.lote.comecar({ formato:'simples' });
  });
  await p.waitForFunction(() => !B.lote.estado().rodando &&
    B.store.get().config.cobrancaDetectada, null, { timeout:40000 });

  await p.evaluate(() => { window.__n = 0; });
  await p.evaluate(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('online'));
  });
  await p.waitForTimeout(2500);
  if (await p.evaluate(() => window.__n))
    throw new Error('voltou sozinho com a chave marcada por cobrança');
});

await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
