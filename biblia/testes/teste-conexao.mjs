import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros=[];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ '+n); } catch(e){ console.log('  ✗ '+n+' — '+e.message); erros.push(n); } };

const base = () => {
  window.__tentativas = 0;
  window.__falhar = true;
  const real = window.fetch.bind(window);
  window.fetch = async (entrada, opcoes = {}) => {
    const url = typeof entrada === 'string' ? entrada : entrada.url;
    if (!url.includes('generativelanguage.googleapis.com')) return real(entrada, opcoes);
    if (!url.includes(':streamGenerateContent'))
      return new Response('{"models":[]}', { status:200, headers:{'content-type':'application/json'} });
    window.__tentativas++;
    if (window.__falhar) throw new TypeError('Failed to fetch');   // como o navegador falha
    const cod = new TextEncoder();
    const l = ['data: ' + JSON.stringify({ candidates:[{ content:{ parts:[{ text:'ok' }] } }] }) + '\n\n',
               'data: ' + JSON.stringify({ candidates:[{ finishReason:'STOP' }] }) + '\n\n'];
    return new Response(new ReadableStream({ start(c){ l.forEach(x=>c.enqueue(cod.encode(x))); c.close(); } }),
      { status:200, headers:{'content-type':'text/event-stream'} });
  };
};

console.log('\n--- com internet, mas sem alcançar o Google ---');
{
  const ctx = await nav.newContext({ viewport:{width:390,height:900} });
  await ctx.addInitScript(base);
  const p = await ctx.newPage();
  p.on('pageerror', e => erros.push('erro de página: ' + e.message));
  await p.goto('http://127.0.0.1:8123/biblia/#/hoje', { waitUntil:'domcontentloaded' });
  await p.waitForTimeout(700);
  await p.evaluate(() => { const c = B.store.get().config; c.chaveGoogle='AIzaT'; B.store.salvar(); });

  await passo('a causa distingue "não alcançou" de "sem internet"', async () => {
    const r = await p.evaluate(() => new Promise(ok => {
      B.ia.gerar(B.prompts.montar(B.biblia.interpretar('Salmos 1'), B.store.get().config, 'simples'),
        B.store.get().config, {}, new AbortController().signal)
        .then(() => ok({}), e => ok({ causa: e.causa, msg: e.message }));
    }));
    if (r.causa !== 'rede') throw new Error('causa: ' + r.causa);
    if (!/tem internet/.test(r.msg)) throw new Error('mensagem: ' + r.msg);
  });

  /* A paciência existe, mas no lugar certo: o capítulo espera pouco (para a
     fila não congelar nele) e quem espera muito é a fila inteira. */
  await passo('o capítulo espera pouco e a fila espera muito', async () => {
    const txt = await p.evaluate(async () => (await fetch('js/lote.js')).text());
    const ler = (nome) => {
      const m = txt.match(new RegExp(nome + ' = \\[([^\\]]+)\\]'));
      if (!m) throw new Error('não há ' + nome);
      return m[1].split(',').map(x => Number(x.trim()));
    };
    const capitulo = ler('ESPERAS_REDE'), fila = ler('PAUSAS_FILA');
    const soma = (a) => a.reduce((x,y)=>x+y,0);
    if (soma(capitulo) > 90000)
      throw new Error('o capítulo segura a fila por ' + Math.round(soma(capitulo)/1000) + 's');
    if (capitulo.length < 3) throw new Error('poucas tentativas: ' + capitulo.length);
    if (fila[fila.length-1] < 300000) throw new Error('a fila desiste cedo demais');
    for (const esc of [capitulo, fila])
      for (let i = 1; i < esc.length; i++)
        if (esc[i] <= esc[i-1]) throw new Error('não é crescente: ' + esc);
  });
  await ctx.close();
}

console.log('\n--- celular sem internet ---');
{
  const ctx = await nav.newContext({ viewport:{width:390,height:900} });
  await ctx.addInitScript(base);
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, 'onLine', { get: () => window.__online !== false, configurable: true });
    window.__online = false;
  });
  const p = await ctx.newPage();
  p.on('pageerror', e => erros.push('erro de página: ' + e.message));
  await p.goto('http://127.0.0.1:8123/biblia/#/hoje', { waitUntil:'domcontentloaded' });
  await p.waitForTimeout(700);
  await p.evaluate(() => { const c = B.store.get().config; c.chaveGoogle='AIzaT'; B.store.salvar(); });

  await passo('offline tem causa própria e mensagem própria', async () => {
    const r = await p.evaluate(() => new Promise(ok => {
      B.ia.gerar(B.prompts.montar(B.biblia.interpretar('Salmos 2'), B.store.get().config, 'simples'),
        B.store.get().config, {}, new AbortController().signal)
        .then(() => ok({}), e => ok({ causa: e.causa, msg: e.message }));
    }));
    if (r.causa !== 'offline') throw new Error('causa: ' + r.causa);
    if (!/sem internet/.test(r.msg)) throw new Error('mensagem: ' + r.msg);
  });

  await passo('o mutirão fica esperando a conexão, sem anotar falha', async () => {
    await p.evaluate(() => { B.lote.comecar({ formato:'simples' }); });
    await p.waitForFunction(() => B.lote.estado().fase === 'semrede', null, { timeout:30000 });
    await p.waitForTimeout(3000);
    const e = await p.evaluate(() => B.lote.estado());
    if (e.erros !== 0) throw new Error('anotou ' + e.erros + ' falha(s) estando offline');
    const n = await p.evaluate(() => window.__tentativas);
    if (n > 2) throw new Error('insistiu ' + n + ' vezes sem internet');
  });

  await passo('a tela diz que está esperando a internet voltar', async () => {
    await p.goto('http://127.0.0.1:8123/biblia/#/oficina', { waitUntil:'domcontentloaded' });
    await p.waitForTimeout(1200);
    const t = await p.locator('#lote-fase').innerText();
    if (!/sem internet/i.test(t)) throw new Error(t);
  });

  await passo('voltando a internet, ele retoma sozinho e gera', async () => {
    await p.evaluate(() => {
      window.__online = true; window.__falhar = false;
      window.dispatchEvent(new Event('online'));
    });
    await p.waitForFunction(() => B.lote.estado().feitos >= 1, null, { timeout:40000 });
    await p.evaluate(() => B.lote.parar());
    const e = await p.evaluate(() => B.lote.estado());
    if (e.erros !== 0) throw new Error('contou ' + e.erros + ' falha(s) numa queda que passou');
  });
  await ctx.close();
}

await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
