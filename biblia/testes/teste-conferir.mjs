import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros=[];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ '+n); } catch(e){ console.log('  ✗ '+n+' — '+e.message); erros.push(n); } };

const farsa = () => {
  const real = window.fetch.bind(window);
  window.fetch = async (e, o = {}) => {
    const u = typeof e === 'string' ? e : e.url;
    if (!u.includes('generativelanguage.googleapis.com')) return real(e, o);
    const json = (s,c) => new Response(JSON.stringify(c), { status:s, headers:{'content-type':'application/json'} });
    if (!u.includes(':streamGenerateContent'))
      return json(200, { models:[{ name:'models/gemini-3-flash', displayName:'Flash',
        outputTokenLimit:65536, supportedGenerationMethods:['generateContent'] }] });
    if (window.__modo === 'creditos')
      return json(429, { error:{ code:429, message:'Your prepayment credits are depleted.' } });
    if (window.__modo === 'chaveRuim')
      return json(400, { error:{ code:400, message:'API key not valid. Please pass a valid API key.' } });
    if (window.__modo === 'sobrecarga')
      return json(503, { error:{ code:503, message:'The model is overloaded.' } });
    const cod = new TextEncoder();
    const l = ['data: ' + JSON.stringify({ candidates:[{ content:{ parts:[{ text:'pronto' }] } }] }) + '\n\n',
               'data: ' + JSON.stringify({ candidates:[{ finishReason:'STOP' }] }) + '\n\n'];
    return new Response(new ReadableStream({ start(c){ l.forEach(x=>c.enqueue(cod.encode(x))); c.close(); } }),
      { status:200, headers:{'content-type':'text/event-stream'} });
  };
};

const ctx = await nav.newContext({ viewport:{width:390,height:900} });
await ctx.addInitScript(farsa);
await ctx.addInitScript(`window.__modo = 'ok';`);
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
await p.goto('http://127.0.0.1:8123/biblia/#/config', { waitUntil:'domcontentloaded' });
await p.waitForTimeout(900);
await p.evaluate(() => {
  const c = B.store.get().config;
  c.chaveGoogle = 'AIzaT'; c.modeloGoogle = 'gemini-3-flash'; B.store.salvar();
});
await p.reload({ waitUntil:'domcontentloaded' });
await p.waitForTimeout(900);

const conferir = async (modo) => {
  await p.evaluate((m) => { window.__modo = m; }, modo);
  await p.locator('#conferir-google').click();
  await p.waitForFunction(() => !/Pedindo/.test(
    (document.querySelector('#teste-google')||{}).innerText || 'Pedindo'), null, { timeout:20000 });
  return (await p.locator('#teste-google').innerText());
};

await passo('o botão existe quando há chave', async () => {
  if (!await p.locator('#conferir-google').isVisible()) throw new Error('sem o botão');
});

await passo('chave boa: diz que está funcionando agora', async () => {
  const t = await conferir('ok');
  if (!/Funcionando agora/.test(t)) throw new Error(t.slice(0,120));
});

await passo('cobrança: diz que é cobrança e manda criar em projeto novo', async () => {
  const t = await conferir('creditos');
  if (!/Não está funcionando/.test(t)) throw new Error(t.slice(0,120));
  if (!/projeto novo/.test(t)) throw new Error('não diz o que fazer: ' + t.slice(0,160));
  if (!await p.evaluate(() => B.store.get().config.cobrancaDetectada))
    throw new Error('não marcou a chave');
});

await passo('e voltando a funcionar, a marca sai sozinha', async () => {
  const t = await conferir('ok');
  if (!/Funcionando agora/.test(t)) throw new Error(t.slice(0,120));
  if (await p.evaluate(() => B.store.get().config.cobrancaDetectada))
    throw new Error('a marca ficou mesmo funcionando');
});

await passo('chave inválida: diz para conferir ou gerar outra', async () => {
  const t = await conferir('chaveRuim');
  if (!/recusada/.test(t)) throw new Error(t.slice(0,160));
});

await passo('sobrecarga não condena a chave', async () => {
  const t = await conferir('sobrecarga');
  if (!/Funcionando agora/.test(t)) throw new Error('reprovou por sobrecarga: ' + t.slice(0,160));
  if (!/sobrecarregado/.test(t)) throw new Error('não explica a ressalva: ' + t.slice(0,160));
});

await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
