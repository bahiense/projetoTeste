import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

/* O runtime do Claude derruba os dois primeiros pedidos com a frase crua que
   apareceu no diário do usuário, e responde no terceiro. */
const comQueda = `
  window.__pedidos = 0;
  window.claude = { use: (c) => c === 'sample' ? Promise.resolve(async () => {
    window.__pedidos++;
    if (window.__pedidos === 1) throw new Error('request failed');
    if (window.__pedidos === 2) throw new Error('the connection was lost — try again');
    return { text: '## Estudo\\n\\nTexto.' };
  }) : Promise.resolve(null) };`;

const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript(comQueda);
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
await p.goto('http://127.0.0.1:8123/biblia/#/oficina', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1800);

console.log('\n--- queda de ligação com o Claude ---');

await passo('ela tem nome: não é mais "causa desconhecida"', async () => {
  const r = await p.evaluate(() => B.ia.gerar(
    { sistema: 's', usuario: 'u', simples: true }, B.store.get().config, {}
  ).then(() => 'gerou', e => e.causa + ' | ' + e.message));
  if (!/^conexao \|/.test(r)) throw new Error(r);
  if (!/request failed/.test(r)) throw new Error('perdeu a frase do runtime: ' + r);
});

await passo('e o mutirão a trata como tropeço de rede, não como defeito', async () => {
  const conexao = await p.evaluate(() => B.ia.CAUSAS.conexao);
  if (!/ligação com o Claude/.test(conexao)) throw new Error(conexao);
});

await passo('o capítulo sai mesmo tendo caído duas vezes antes', async () => {
  await p.evaluate(() => B.estudos.limpar());
  await p.evaluate(() => { window.__pedidos = 0; });
  await p.locator('#lote-comecar').click();
  /* Esperar na mão: waitForFunction aceita a promessa como verdadeira e
     devolveria na hora, antes de o primeiro estudo existir. */
  var guardou = 0;
  for (var i = 0; i < 40 && !guardou; i++) {
    await p.waitForTimeout(1500);
    guardou = await p.evaluate(() => B.estudos.contar());
  }
  await p.evaluate(() => B.lote.parar());
  if (!guardou) throw new Error('nenhum estudo saiu em 60s');
  const n = await p.evaluate(() => window.__pedidos);
  if (n < 3) throw new Error('não repetiu: ' + n + ' pedidos');
});

await passo('e o disjuntor não conta queda de ligação', async () => {
  const st = await p.evaluate(() => B.lote.estado());
  if (!st) throw new Error('sem estado');
  const desligou = await p.evaluate(() => B.lote.estado().ligado === false &&
    /desconhecida/.test(B.lote.estado().ultimoErro || ''));
  if (desligou) throw new Error('o mutirão parou por causa das quedas');
});

await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
