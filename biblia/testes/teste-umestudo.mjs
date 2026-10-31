import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

const claude = `window.claude = { use: (c) => c === 'sample'
  ? Promise.resolve(async () => ({ text: '## Reescrito\\n\\nTexto novo.' }))
  : Promise.resolve(null) };`;
const apk = `window.AndroidArquivo = { salvar: () => true, salvarBackup: () => true,
  lerBackup: () => '', pastaTem: () => true, listarPacotes: () => '[]', lerPacote: () => '',
  manterAcordado: () => true, compartilhar: () => true };`;

console.log('\n--- renovar um capítulo na hora, na Oficina ---');
{
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(claude);
  const p = await ctx.newPage();
  p.on('pageerror', e => erros.push('erro de página: ' + e.message));
  await p.goto('http://127.0.0.1:8123/biblia/#/oficina', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1800);
  await p.evaluate(() => B.estudos.importar([{ titulo: 'João 3', formato: 'completo',
    texto: '# velho', modelo: 'gemini-2.5-flash', criado: '2026-09-01T10:00:00.000Z' }]));

  await passo('o campo está lá, com o formato completo por padrão', async () => {
    await p.evaluate(() => B.app.pintar());
    await p.waitForTimeout(500);
    if (!await p.locator('#um-ref').count()) throw new Error('sem o campo');
    if (await p.locator('#um-formato').inputValue() !== 'completo') throw new Error('formato errado');
  });

  await passo('um toque reescreve o estudo na frente de tudo', async () => {
    await p.fill('#um-ref', 'João 3');
    await p.locator('#um-renovar').click();
    await p.waitForSelector('#um-estado .aviso--ok', { timeout: 20000 });
    const e = await p.evaluate(() => B.estudos.obter('João 3', 'completo'));
    if (!/Reescrito/.test(e.texto)) throw new Error('não reescreveu: ' + e.texto);
    if (!/Claude/.test(e.modelo)) throw new Error('motor: ' + e.modelo);
    if (e.criado !== '2026-09-01T10:00:00.000Z') throw new Error('mudou a data: ' + e.criado);
  });

  await passo('mesmo com a Bíblia inteira por gerar: não espera a fila', async () => {
    const falta = await p.evaluate(() => B.lote.estimativa().then(x => x.faltam));
    if (falta < 2000) throw new Error('o acervo não estava vazio: ' + falta);
  });

  await passo('referência que não existe dá recado claro, não erro cru', async () => {
    await p.fill('#um-ref', 'Zzz 9');
    await p.locator('#um-renovar').click();
    await p.waitForSelector('#um-estado .aviso--erro', { timeout: 10000 });
    const t = await p.locator('#um-estado').innerText();
    if (!/não reconheci/i.test(t)) throw new Error(t);
  });

  await passo('e recusa enquanto o mutirão está rodando', async () => {
    /* comecar() só resolve quando a fila inteira acaba — esperar por ela
       seria esperar a Bíblia inteira. Dispara e segue. */
    await p.evaluate(() => { B.lote.comecar(); });
    await p.waitForTimeout(800);
    const r = await p.evaluate(() => B.lote.renovarUm('João 3', 'completo')
      .then(() => 'deixou', e => e.message));
    await p.evaluate(() => B.lote.parar());
    await p.waitForTimeout(500);
    if (!/mutirão está rodando/.test(r)) throw new Error(r);
  });
  await ctx.close();
}

console.log('\n--- o pedido vindo do app, pela rota ---');
{
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(claude);
  const p = await ctx.newPage();
  p.on('pageerror', e => erros.push('erro de página: ' + e.message));
  await p.goto('http://127.0.0.1:8123/biblia/#/oficina/Salmos%2023/simples',
    { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1800);
  await passo('a Oficina abre com o capítulo já preenchido', async () => {
    if (await p.locator('#um-ref').inputValue() !== 'Salmos 23') throw new Error(await p.locator('#um-ref').inputValue());
    if (await p.locator('#um-formato').inputValue() !== 'simples') throw new Error('formato');
    const t = await p.locator('#um-estado').innerText();
    if (!/Veio do app/.test(t)) throw new Error(t);
  });
  await ctx.close();
}

console.log('\n--- no app, a tela do estudo ---');
{
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
  await ctx.addInitScript(apk);
  const p = await ctx.newPage();
  p.on('pageerror', e => erros.push('erro de página: ' + e.message));
  await p.goto('http://127.0.0.1:8123/biblia/#/progresso', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1500);
  await p.evaluate(() => B.estudos.importar([{ titulo: 'João 3', formato: 'completo',
    texto: '# velho', modelo: 'gemini-2.5-flash', criado: '2026-09-01T10:00:00.000Z' }]));
  await p.goto('http://127.0.0.1:8123/biblia/#/estudo/Jo%C3%A3o%203/completo',
    { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1500);

  await passo('não oferece "Refazer" (lá não se gera), e sim "Renovar na Oficina"', async () => {
    if (await p.locator('[data-refazer]').count()) throw new Error('ofereceu refazer');
    if (!await p.locator('[data-renovar-la]').count()) throw new Error('sem o botão novo');
  });
  await passo('o link leva à Oficina com o capítulo junto', async () => {
    const l = await p.evaluate(() => B.travessia.linkOficina('João 3', 'completo'));
    if (!/^https:\/\/claude\.ai\/artifact\//.test(l)) throw new Error(l);
    if (!/#\/oficina\/Jo%C3%A3o%203\/completo$/.test(l)) throw new Error(l);
  });
  await passo('e a referência vai para a área de transferência, que não depende da moldura', async () => {
    const [pop] = await Promise.all([
      p.waitForEvent('popup', { timeout: 8000 }).catch(() => null),
      p.locator('[data-renovar-la]').click()
    ]);
    if (pop) await pop.close();
    await p.waitForTimeout(400);
    const txt = await p.evaluate(() => navigator.clipboard.readText());
    if (txt !== 'João 3') throw new Error('copiou: ' + txt);
  });
  await ctx.close();
}

await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
