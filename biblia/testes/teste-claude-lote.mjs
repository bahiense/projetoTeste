import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros=[];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ '+n); } catch(e){ console.log('  ✗ '+n+' — '+e.message); erros.push(n); } };

/* A página rodando dentro do Claude: window.claude.use('sample'). */
const ctx = await nav.newContext({ viewport:{width:390,height:900} });
await ctx.addInitScript(() => {
  window.__pedidosClaude = 0;
  window.__modo = 'ok';
  window.claude = {
    use: (cap) => cap === 'sample' ? Promise.resolve(async (mensagens, opcoes) => {
      window.__pedidosClaude++;
      window.__ultimoTier = opcoes && opcoes.modelTier;
      if (window.__modo === 'limitado') { const e = new Error('rate'); e.code = 'rate_limited'; throw e; }
      if (window.__modo === 'negado') { const e = new Error('nope'); e.code = 'not_granted'; throw e; }
      if (opcoes && opcoes.onText) opcoes.onText({ text: '## Estudo\n\nTexto pelo Claude.' });
      return { text: '## Estudo\n\nTexto pelo Claude.' };
    }) : Promise.resolve(null)
  };
});
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
await p.goto('http://127.0.0.1:8123/biblia/#/oficina', { waitUntil:'domcontentloaded' });
await p.waitForTimeout(1500);

await passo('sem chave do Google, o quadro oferece o mutirão mesmo assim', async () => {
  const semChave = await p.evaluate(() => !B.store.get().config.chaveGoogle);
  if (!semChave) throw new Error('o teste precisa começar sem chave');
  if (!await p.locator('#lote-comecar').isVisible()) throw new Error('não ofereceu começar');
  const t = await p.locator('#quadro-lote').innerText();
  if (!/Claude/.test(t)) throw new Error('não menciona o Claude: ' + t.slice(0,150));
  if (/cota medida|não publica mais/.test(t)) throw new Error('fala da cota do Google à toa');
});

await passo('o mutirão roda pelo Claude, sem chave nenhuma', async () => {
  await p.evaluate(() => { B.lote.comecar({ formato:'simples' }); });
  await p.waitForFunction(() => B.lote.estado().feitos >= 2, null, { timeout:60000 });
  await p.evaluate(() => B.lote.parar());
  const e = await p.evaluate(() => B.lote.estado());
  if (e.erros) throw new Error('falhou ' + e.erros + ' vez(es)');
  if (!await p.evaluate(() => window.__pedidosClaude)) throw new Error('não chamou o Claude');
});

await passo('e os estudos ficam guardados com a autoria certa', async () => {
  const r = await p.evaluate(async () => {
    const l = await B.estudos.listar();
    return { n: l.length, modelo: (l[0]||{}).modelo };
  });
  if (r.n < 2) throw new Error('guardados: ' + r.n);
  if (!/Claude/.test(r.modelo || '')) throw new Error('modelo: ' + r.modelo);
});

await passo('estudo simples usa o nível leve do plano, não o pesado', async () => {
  const t = await p.evaluate(() => window.__ultimoTier);
  if (t !== 'default') throw new Error('modelTier: ' + t);
});

await passo('limite de uso do Claude é espera, não falha de capítulo', async () => {
  const r = await p.evaluate(() => { window.__modo = 'limitado'; return new Promise(ok => {
    B.ia.gerar(B.prompts.montar(B.biblia.interpretar('Salmos 9'), B.store.get().config, 'simples'),
      B.store.get().config, {}, new AbortController().signal)
      .then(() => ok({}), e => ok({ causa: e.causa }));
  }); });
  if (r.causa !== 'limitado') throw new Error('causa: ' + r.causa);
  const txt = await p.evaluate(async () => (await fetch('js/lote.js')).text());
  if (!/limitado: 1/.test(txt)) throw new Error('não entrou no caminho paciente');
});

await passo('falta de autorização para tudo, em vez de repetir 2.510 vezes', async () => {
  const r = await p.evaluate(() => { window.__modo = 'negado'; return new Promise(ok => {
    B.ia.gerar(B.prompts.montar(B.biblia.interpretar('Salmos 10'), B.store.get().config, 'simples'),
      B.store.get().config, {}, new AbortController().signal)
      .then(() => ok({}), e => ok({ causa: e.causa }));
  }); });
  if (r.causa !== 'naoAutorizado') throw new Error('causa: ' + r.causa);
  const txt = await p.evaluate(async () => (await fetch('js/lote.js')).text());
  if (!/naoAutorizado: 1/.test(txt)) throw new Error('não para o mutirão');
});

await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
