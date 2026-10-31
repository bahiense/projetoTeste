import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

/* Um motor que obedece a uma chave: o teste liga e desliga a falha quando
   quer. Trocar o window.claude depois não adianta — o app resolve o
   amostrador uma vez, na abertura, e segura aquele. */
const claude = `
  window.__falhar = false;
  window.claude = { use: (c) => c === 'sample' ? Promise.resolve(async () => {
    if (window.__falhar) throw new Error('O Claude devolveu algo que não entendi.');
    return { text: '## Estudo\\n\\nTexto do estudo.' };
  }) : Promise.resolve(null) };`;

const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript(claude);
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
await p.goto('http://127.0.0.1:8123/biblia/#/oficina', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1800);

console.log('\n--- o que saiu nesta sentada ---');
await p.evaluate(() => { B.lote.comecar(); });
let saiu = 0;
for (let i = 0; i < 30 && saiu < 3; i++) {
  await p.waitForTimeout(1500);
  saiu = await p.evaluate(() => (B.lote.estado().saidos || []).length);
}
/* parar() pede para parar; quem para é o laço, ao fim do capítulo em curso.
   Esperar pelo pedido, e não pela parada, deixava o teste chamando a
   renovação avulsa com o mutirão ainda rodando. */
await p.evaluate(() => B.lote.parar());
for (let i = 0; i < 30; i++) {
  await p.waitForTimeout(1000);
  if (!await p.evaluate(() => B.lote.estado().rodando)) break;
}

await passo('cada estudo que sai entra numa lista, com nome e hora', async () => {
  const s = await p.evaluate(() => B.lote.estado().saidos);
  if (s.length < 3) throw new Error('registrou ' + s.length);
  if (!s[0].titulo || !s[0].quando || !s[0].formato) throw new Error(JSON.stringify(s[0]));
});

await passo('a sentada tem começo marcado, para separar de ontem', async () => {
  const e = await p.evaluate(() => B.lote.estado());
  if (!e.sessaoDesde) throw new Error('sem sessaoDesde');
  if (!(e.saidos[0].quando >= e.sessaoDesde)) throw new Error('fora da sentada');
});

await passo('e a tela mostra a lista, não só o contador', async () => {
  await p.evaluate(() => B.app.pintar());
  await p.waitForTimeout(1200);
  const t = await p.locator('.falhas--ok').innerText();
  if (!/nesta sentada/.test(t)) throw new Error(t.slice(0, 160));
  const itens = await p.locator('.falhas--ok li').count();
  if (itens < 3) throw new Error('listou ' + itens);
  const primeiro = await p.locator('.falhas--ok li').first().innerText();
  if (!/^\S.*\d+\s+(simples|completo)/.test(primeiro))
    throw new Error('sem nome e formato: ' + primeiro);
});

console.log('\n--- falha consertada sai da lista de pendências ---');
/* Pela renovação avulsa, que é um pedido só: no mutirão a falha só é anotada
   depois de três tentativas no mesmo capítulo, e o conserto viria na
   repescagem do fim da rodada — 2.510 capítulos depois. */

await passo('o capítulo que falha entra na lista de pendências', async () => {
  await p.evaluate(() => { window.__falhar = true; });
  const r = await p.evaluate(() => B.lote.renovarUm('Tiago 1', 'completo')
    .then(() => 'saiu', e => e.message));
  if (r === 'saiu') throw new Error('não falhou');
  const e = await p.evaluate(() => B.lote.estado());
  const d = e.diario.filter(x => /Tiago 1/.test(x.alvo));
  if (!d.length) throw new Error('não entrou no diário');
  if (d[0].consertado) throw new Error('nasceu consertada');
  if (!e.aguardando) throw new Error('não entrou nas pendências');
});

await passo('quando ele enfim sai, a linha fica marcada como consertada', async () => {
  await p.evaluate(() => { window.__falhar = false; });
  const r = await p.evaluate(() => B.lote.renovarUm('Tiago 1', 'completo')
    .then(() => 'saiu', e => e.message));
  if (r !== 'saiu') throw new Error(r);
  const e = await p.evaluate(() => B.lote.estado());
  const d = e.diario.filter(x => /Tiago 1/.test(x.alvo));
  if (!d.every(x => x.consertado)) throw new Error('não marcou: ' + JSON.stringify(d));
});

await passo('e some da lista de pendências', async () => {
  const e = await p.evaluate(() => B.lote.estado());
  if (e.aguardando !== 0) throw new Error('ainda esperando: ' + e.aguardando);
});

await passo('o renovado avulso também entra na lista do que saiu', async () => {
  const e = await p.evaluate(() => B.lote.estado());
  const s = e.saidos.filter(x => x.titulo === 'Tiago 1');
  if (!s.length) throw new Error('não entrou');
  if (!s[0].renovado) throw new Error('não marcado como renovado');
});

await passo('o painel diz isso em vez de gritar o total de falhas', async () => {
  await p.evaluate(() => B.app.pintar());
  await p.waitForTimeout(1200);
  const painel = p.locator('.falhas:not(.falhas--ok)');
  const resumo = await painel.locator('summary').innerText();
  if (!/nenhuma[\s\S]*esperando conserto/i.test(resumo)) throw new Error(resumo);
  /* Fechado, o detalhe só entrega o resumo: abrir é parte do que se testa. */
  await painel.locator('summary').click();
  await p.waitForTimeout(300);
  const t = await painel.innerText();
  if (!/já foi escrito depois/.test(t)) throw new Error(t.slice(0, 250));
  if (!/consertado/.test(t)) throw new Error('sem o selo: ' + t.slice(0, 250));
});

await passo('e o log baixado também diz quais foram consertadas', async () => {
  const txt = await p.evaluate(() => B.lote.diarioComoTexto());
  if (!/Ainda esperando conserto: 0/.test(txt)) throw new Error(txt.slice(0, 200));
  if (!/CONSERTADO em/.test(txt)) throw new Error(txt.slice(0, 300));
});

await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
