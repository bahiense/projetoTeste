import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
await p.goto('http://127.0.0.1:8123/biblia/#/progresso', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);

console.log('\n--- o índice invertido ---');
await passo('Romanos 8 sustenta dezenas de pontos da confissão', async () => {
  const n = await p.evaluate(() => B.doutrina.temas('ROM', 8).length);
  if (n < 20) throw new Error('achou ' + n);
});
await passo('e um capítulo que ela não cita devolve vazio, sem inventar', async () => {
  const n = await p.evaluate(() => B.doutrina.temas('OBA', 1).length);
  if (n !== 0) throw new Error('inventou ' + n);
});
await passo('cada tema diz de que obra veio', async () => {
  const t = await p.evaluate(() => B.doutrina.temas('ROM', 8)[0]);
  if (!/^(Confissão|Breve Catecismo|Catecismo Maior) /.test(t.marca)) throw new Error(t.marca);
  if (!t.item.t || /^Of /.test(t.item.t)) throw new Error('título em inglês: ' + t.item.t);
});
await passo('as citações apontam para livros que o app conhece', async () => {
  const maus = await p.evaluate(() => {
    const conhecidos = {};
    B.biblia.LIVROS.forEach(l => conhecidos[l.usfm] = l.caps);
    const ruins = [];
    Object.keys(B.doutrina.PORCAPITULO).forEach(k => {
      const u = k.split(' ')[0], c = +k.split(' ')[1];
      if (!conhecidos[u]) ruins.push(k + ' (livro)');
      else if (c < 1 || c > conhecidos[u]) ruins.push(k + ' (capítulo fora de ' + conhecidos[u] + ')');
    });
    return ruins;
  });
  if (maus.length) throw new Error(maus.slice(0, 6).join(', '));
});

console.log('\n--- a tela ---');
await p.goto('http://127.0.0.1:8123/biblia/#/teologia/Romanos%208', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(900);
await passo('lista os temas de Romanos 8', async () => {
  const n = await p.locator('.tema').count();
  if (n < 30) throw new Error('listou ' + n);
  const obras = await p.locator('h3.secao').count();
  if (obras < 2) throw new Error('não agrupou por obra: ' + obras);
  const t = await p.locator('.tema').first().innerText();
  if (!/(Confissão|Catecismo) [\d.]+/.test(t)) throw new Error(t.slice(0, 120));
});
await passo('abrindo um tema, vêm os textos que o sustentam', async () => {
  await p.locator('.tema summary').first().click();
  await p.waitForTimeout(300);
  const refs = await p.locator('.tema[open] .tema-refs a').count();
  if (!refs) throw new Error('sem referências');
  const txt = await p.locator('.tema[open] .tema-refs a').first().innerText();
  if (!/^[\wÀ-ú1-3 ]+ \d+/.test(txt)) throw new Error('referência estranha: ' + txt);
});
await passo('e dá para pular para outro capítulo citado', async () => {
  const h = await p.locator('.tema[open] .tema-refs a').first().getAttribute('href');
  if (!/^#\/teologia\//.test(h)) throw new Error(h);
});
await passo('cada obra declara a sua origem', async () => {
  const ts = await p.locator('.dica--honesta').allInnerTexts();
  if (ts.length < 2) throw new Error('só ' + ts.length + ' créditos');
  if (!ts.some(x => /Domínio público/.test(x))) throw new Error(ts.join(' | ').slice(0, 200));
  if (!ts.some(x => /tradução feita para este app/.test(x)))
    throw new Error('não declara a tradução');
});

await passo('capítulo não citado diz isso com todas as letras', async () => {
  await p.goto('http://127.0.0.1:8123/biblia/#/teologia/Obadias%201', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(700);
  const t = await p.locator('#tela').innerText();
  if (!/Nenhuma destas obras cita/.test(t)) throw new Error(t.slice(0, 160));
  if (!/668/.test(t)) throw new Error('não diz o alcance real');
});

console.log('\n--- o caminho desde o estudo ---');
await p.goto('http://127.0.0.1:8123/biblia/#/progresso', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(800);
await p.evaluate(() => B.estudos.importar([
  { titulo: 'Romanos 8', formato: 'completo', texto: '# r8', modelo: 'Claude (pelo seu plano)',
    criado: '2026-10-01T10:00:00.000Z' },
  { titulo: 'Obadias 1', formato: 'completo', texto: '# ob', modelo: 'Claude (pelo seu plano)',
    criado: '2026-10-01T10:00:00.000Z' }]));

await passo('o estudo mostra o botão ao lado de "Ler o texto", com o número', async () => {
  await p.goto('http://127.0.0.1:8123/biblia/#/estudo/Romanos%208/completo', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);
  const b = p.locator('a[href^="#/teologia/"]');
  if (!await b.count()) throw new Error('sem o botão');
  const t = await b.innerText();
  if (!/Teologia reformada\s*\d+/.test(t)) throw new Error(t);
  const ler = await p.locator('a[href^="#/ler/"]').count();
  if (!ler) throw new Error('sumiu o "Ler o texto"');
});
await passo('e não mostra botão vazio onde a confissão não diz nada', async () => {
  await p.goto('http://127.0.0.1:8123/biblia/#/estudo/Obadias%201/completo', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);
  if (await p.locator('a[href^="#/teologia/"]').count()) throw new Error('ofereceu tela vazia');
  if (!await p.locator('a[href^="#/ler/"]').count()) throw new Error('sumiu o "Ler o texto"');
});
await passo('nada estoura a tela do celular', async () => {
  await p.goto('http://127.0.0.1:8123/biblia/#/teologia/Romanos%208', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(700);
  if (await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1))
    throw new Error('estourou');
});

await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
