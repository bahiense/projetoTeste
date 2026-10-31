import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros=[];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ '+n); } catch(e){ console.log('  ✗ '+n+' — '+e.message); erros.push(n); } };

const abrir = async (comClaude) => {
  const ctx = await nav.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2, colorScheme:'dark' });
  if (comClaude) await ctx.addInitScript(() => {
    window.claude = { use: (c) => c === 'sample' ? Promise.resolve(async (m,o) => {
      if (o && o.onText) o.onText({ text:'## Estudo\n\nTexto.' });
      return { text:'## Estudo\n\nTexto.' };
    }) : Promise.resolve(null) };
  });
  const p = await ctx.newPage();
  p.on('pageerror', e => erros.push('erro de página: ' + e.message));
  await p.goto('http://127.0.0.1:8123/biblia/#/config', { waitUntil:'domcontentloaded' });
  await p.waitForTimeout(1600);
  return { ctx, p };
};

console.log('\n--- com o Claude gerando ---');
{
  const { ctx, p } = await abrir(true);
  await passo('a chave do Gemini vira um detalhe dobrado, fechado', async () => {
    const d = p.locator('.cartao--dobrado');
    if (!await d.count()) throw new Error('o cartão não virou detalhe');
    if (await p.evaluate(() => !!document.querySelector('.cartao--dobrado[open]')))
      throw new Error('veio aberto');
    if (await p.locator('#chave-google').isVisible()) throw new Error('o campo está à mostra');
  });
  await passo('mas continua alcançável para quem usa o APK', async () => {
    await p.locator('.cartao--dobrado > summary').click();
    await p.waitForTimeout(300);
    if (!await p.locator('#chave-google').isVisible()) throw new Error('não abriu');
    if (!await p.locator('#salvar-google').isVisible()) throw new Error('sem o botão de salvar');
  });
  await passo('e o primeiro cartão diz que a IA já está ligada', async () => {
    const t = await p.locator('section.cartao').first().innerText();
    if (!/já está ligada/.test(t)) throw new Error(t.slice(0,100));
  });
  await passo('o mutirão continua disponível sem chave, agora na Oficina', async () => {
    await p.goto('http://127.0.0.1:8123/biblia/#/oficina', { waitUntil:'domcontentloaded' });
    await p.waitForSelector('#lote-comecar', { timeout: 8000 });
    await p.goto('http://127.0.0.1:8123/biblia/#/config', { waitUntil:'domcontentloaded' });
    await p.waitForTimeout(1200);
  });
  await passo('nada estoura a tela do celular', async () => {
    if (await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1))
      throw new Error('estourou');
  });
  const cartao = p.locator('.cartao--dobrado');
  await cartao.scrollIntoViewIfNeeded();
  await p.screenshot({ path:'/tmp/claude-0/-home-user/81e5514c-15a3-5fdb-9332-043d4f543cde/scratchpad/shot-soclaude.png' });
  await ctx.close();
}

console.log('\n--- no APK, sem Claude ---');
{
  const { ctx, p } = await abrir(false);
  await passo('o cartão da chave continua inteiro e visível', async () => {
    if (await p.locator('.cartao--dobrado').count()) throw new Error('dobrou sem Claude');
    if (!await p.locator('#chave-google').isVisible()) throw new Error('o campo sumiu');
    const t = await p.locator('section.cartao').first().innerText();
    if (!/Chave do Google Gemini/.test(t)) throw new Error('perdeu o título: ' + t.slice(0,80));
  });
  await ctx.close();
}

await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
