/* As orações dos estudos, para orar.

   Uso: node biblia/testes/teste-oracoes.mjs (com o servidor de pé) */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
await p.goto('http://127.0.0.1:8123/biblia/#/hoje', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1800);

const ir = async (rota) => {
  await p.evaluate((r) => { location.hash = '#/' + r; }, rota);
  await p.evaluate(() => B.app.pintar());
  await p.waitForTimeout(1200);
};

console.log('\n--- tirar a oração de dentro do estudo ---');
await passo('a oração sai do estudo completo, inteira', async () => {
  const o = await p.evaluate(() => B.estudos.obter('1 Timóteo 4', 'completo')
    .then(e => B.oracoes.extrair(e.texto)));
  if (!o || o.length < 100) throw new Error('saiu curta demais: ' + JSON.stringify(o));
  if (/^#/.test(o) || /###/.test(o)) throw new Error('veio com cabeçalho: ' + o.slice(0, 60));
  if (!/Amém|amém|\.$/.test(o.trim())) throw new Error('fim estranho: ' + o.slice(-40));
});

await passo('estudo sem a seção não inventa oração', async () => {
  const o = await p.evaluate(() => B.oracoes.extrair('# Título\n\n### O contexto\n\nTexto.'));
  if (o) throw new Error('inventou: ' + o);
});

await passo('e a seção vazia ou curta demais também não vale', async () => {
  const o = await p.evaluate(() => B.oracoes.extrair('### Oração\n\nAmém.\n\n### Outra coisa\n\nx'));
  if (o) throw new Error('aceitou um resto de linha: ' + o);
});

console.log('\n--- a tela de orar ---');
await passo('mostra a oração sozinha, em coluna própria', async () => {
  await ir('orar/' + encodeURIComponent('1 Timóteo 4'));
  const t = await p.locator('.oracao').innerText();
  if (!/Deus/.test(t)) throw new Error(t.slice(0, 80));
  /* Nada de estudo na tela: nem blocos, nem exercícios, nem referências. */
  if (await p.locator('.bloco-exegese, #fixar, .cap-ligacoes').count()) {
    throw new Error('a tela de orar trouxe pedaços do estudo');
  }
});

await passo('diz de onde vem a oração', async () => {
  const t = await p.locator('.orar-nota').innerText();
  if (!/IA a partir do capítulo/.test(t)) throw new Error(t);
});

await passo('guardar põe e tira da sua lista', async () => {
  await p.locator('[data-guardar]').click();
  await p.waitForTimeout(400);
  if (!await p.evaluate(() => B.oracoes.estaGuardada('1 Timóteo 4'))) throw new Error('não guardou');
  await p.locator('[data-guardar]').click();
  await p.waitForTimeout(400);
  if (await p.evaluate(() => B.oracoes.estaGuardada('1 Timóteo 4'))) throw new Error('não soltou');
  await p.locator('[data-guardar]').click();
  await p.waitForTimeout(400);
});

await passo('capítulo sem estudo completo diz que a oração ainda não chegou', async () => {
  await ir('orar/' + encodeURIComponent('Naum 3'));
  const t = await p.locator('#orar-corpo').innerText();
  const temEstudo = await p.evaluate(() => B.estudos.obter('Naum 3', 'completo').then(e => !!e));
  if (!temEstudo && !/ainda não tem oração/.test(t)) throw new Error(t.slice(0, 120));
});

console.log('\n--- o acervo ---');
await passo('lista as suas e as do dia', async () => {
  await ir('orar');
  const t = await p.locator('#tela').innerText();
  if (!/As suas orações/.test(t)) throw new Error(t.slice(0, 160));
  /* "para ser orada" é o subtítulo da tela; o que não pode sobrar é o
     registro: "Orei hoje", "ainda não orada", "orada há dois dias". */
  if (/Orei hoje|ainda não orada|orada há/.test(t)) {
    throw new Error('sobrou registro de oração: ' + t.slice(0, 160));
  }
  if (!/1 Timóteo 4/.test(t)) throw new Error('a guardada não apareceu');
  if (!/leitura de hoje|lidos hoje/i.test(t)) throw new Error('sem o bloco do dia');
});

await passo('e a lista do dia segue a leitura marcada', async () => {
  await p.evaluate(() => B.plano.registrarLeitura('Jonas', 2));
  await ir('orar');
  const t = await p.locator('#orar-hoje').innerText();
  if (!/Jonas 2/.test(t)) throw new Error(t.replace(/\n/g, ' | ').slice(0, 160));
});

console.log('\n--- as portas ---');
await passo('o fim do estudo leva a orar o capítulo', async () => {
  await ir('estudo/' + encodeURIComponent('1 Timóteo 4') + '/completo');
  await p.waitForTimeout(900);
  if (!await p.locator('#fixar a[href^="#/orar/"]').count()) throw new Error('sem a porta no estudo');
});

await passo('e a aba Estudo tem a porta do acervo', async () => {
  await ir('estudo');
  await p.waitForTimeout(600);
  if (!await p.locator('a[href="#/orar"]').count()) throw new Error('sem a porta na aba');
});

await passo('o que é seu vai no backup', async () => {
  const b = await p.evaluate(() => JSON.stringify(B.store.paraBackup([])));
  if (!/oracoes/.test(b) || !/1 Timóteo 4/.test(b)) throw new Error('a lista não foi no backup');
});

await ctx.close();
await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
