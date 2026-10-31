import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

const claude = `
  window.__pedidos = [];
  window.claude = { use: (c) => c === 'sample' ? Promise.resolve(async (m) => {
    window.__pedidos.push(String(m[0].content));
    return { text: '## Panorama\\n\\nTexto.' };
  }) : Promise.resolve(null) };`;

const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript(claude);
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
await p.goto('http://127.0.0.1:8123/biblia/#/oficina', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1800);

console.log('\n--- o panorama dos livros, por escolha ---');
await passo('a tela deixa escolher entre tudo, só livros e só capítulos', async () => {
  const vs = await p.locator('#lote-escopo option').evaluateAll(o => o.map(x => x.value));
  if (vs.join(',') !== 'tudo,livros,capitulos') throw new Error(vs.join(','));
});

await passo('escolhido "só livros", a fila tem 132 e nenhum capítulo', async () => {
  await p.evaluate(() => B.lote.escolher({ escopo: 'livros', formato: 'ambos' }));
  const r = await p.evaluate(() => B.lote.pendentes().then(f => ({
    n: f.length, comCapitulo: f.filter(i => i.alvo.capitulo).length,
    primeiro: f[0].titulo
  })));
  if (r.n !== 132) throw new Error('fila de ' + r.n);
  if (r.comCapitulo) throw new Error('entrou capítulo: ' + r.comCapitulo);
  if (!/^Gênesis$/.test(r.primeiro)) throw new Error('começou por ' + r.primeiro);
});

await passo('e o pedido que vai à IA é mesmo o do livro inteiro', async () => {
  await p.evaluate(() => { window.__pedidos = []; B.lote.comecar(); });
  for (var i = 0; i < 20; i++) {
    await p.waitForTimeout(1200);
    if (await p.evaluate(() => window.__pedidos.length)) break;
  }
  await p.evaluate(() => B.lote.parar());
  const texto = await p.evaluate(() => window.__pedidos[0] || '');
  if (!/roteiro de leitura|livro inteiro|panorama|mapa do livro/i.test(texto))
    throw new Error('não parece pedido de livro: ' + texto.slice(0, 200));
  if (/capítulo \d/i.test(texto.slice(0, 400)))
    throw new Error('pediu capítulo: ' + texto.slice(0, 200));
});

await passo('o guardado é marcado como de livro, e o acervo o conta à parte', async () => {
  for (var i = 0; i < 20; i++) {
    await p.waitForTimeout(1000);
    if (await p.evaluate(() => B.estudos.contar())) break;
  }
  const e = await p.evaluate(() => B.estudos.obter('Gênesis', 'simples')
    .then(x => x || B.estudos.obter('Gênesis', 'completo')));
  if (!e) throw new Error('não guardou');
  if (e.tipo !== 'livro') throw new Error('tipo: ' + e.tipo);
  await p.evaluate(() => B.app.pintar());
  await p.waitForTimeout(900);
  const t = await p.locator('#acervo').innerText();
  if (!/de livro inteiro: 1/.test(t)) throw new Error(t.slice(0, 220));
});

console.log('\n--- a escolha estreita não mente sobre o resto ---');
await passo('"tudo gerado" não aparece quando só uma parte foi pedida', async () => {
  /* parar() pede; quem para é o laço, no fim do capítulo em curso. */
  await p.evaluate(() => B.lote.parar());
  for (var i = 0; i < 30; i++) {
    await p.waitForTimeout(1000);
    if (!await p.evaluate(() => B.lote.estado().rodando)) break;
  }
  await p.evaluate(() => {
    B.lote.escolher({ escopo: 'livros', formato: 'simples' });
    B.estudos.chaves = () => Promise.resolve([]);
    const real = B.lote.estimativa;
    B.lote.estimativa = () => Promise.resolve({ faltam: 0, mb: 0, dias: null, cotaDia: null, horas: 0 });
  });
  await p.evaluate(() => B.app.pintar());
  await p.waitForTimeout(900);
  const t = await p.locator('#quadro-lote').innerText();
  if (/Está tudo gerado/.test(t)) throw new Error('disse que acabou tudo: ' + t.slice(0, 160));
  if (!/Essa parte está pronta/.test(t)) throw new Error(t.slice(0, 200));
});

await passo('e oferece conferir a Bíblia inteira num toque', async () => {
  await p.locator('#lote-tudo').click();
  await p.waitForTimeout(600);
  const e = await p.evaluate(() => B.lote.estado());
  if (e.escopo !== 'tudo' || e.formato !== 'ambos') throw new Error(JSON.stringify(e.escopo));
});

await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
