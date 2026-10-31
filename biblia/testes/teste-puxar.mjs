import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const D = '/tmp/claude-0/-home-user/81e5514c-15a3-5fdb-9332-043d4f543cde/scratchpad';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

fs.writeFileSync(D + '/bkp.json', JSON.stringify({
  estado: { versao: 3, grupos: {}, historico: [], datas: ['2026-10-01'], sequencia: 1, config: {} },
  estudos: [{ titulo: 'Rute 1', formato: 'simples', texto: '# rute', criado: '2026-10-01T10:00:00.000Z' }]
}));
fs.writeFileSync(D + '/pac.json', JSON.stringify({
  pacote: 1, estudos: [
    { titulo: 'Tiago 1', formato: 'simples', texto: '# t1', criado: '2026-10-02T10:00:00.000Z' },
    { titulo: 'Tiago 2', formato: 'completo', texto: '# t2', criado: '2026-10-02T10:01:00.000Z' }]
}));
fs.writeFileSync(D + '/outro.json', JSON.stringify({ receita: 'bolo' }));
fs.writeFileSync(D + '/nada.json', 'isto não é json {');

const comClaude = () => {
  window.claude = { use: (c) => c === 'sample'
    ? Promise.resolve(async () => ({ text: '## x' })) : Promise.resolve(null) };
};

const abrir = async () => {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(comClaude);
  const p = await ctx.newPage();
  p.on('pageerror', e => erros.push('erro de página: ' + e.message));
  await p.goto('http://127.0.0.1:8123/biblia/#/progresso', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1600);
  return { ctx, p };
};
const aviso = (p) => p.locator('#toast').innerText();

console.log('\n--- puxar o backup do celular para dentro do Claude ---');
{
  const { ctx, p } = await abrir();
  await passo('o seletor não filtra por extensão (no Android isso esconde o arquivo)', async () => {
    const a = await p.locator('#prog-restaurar').getAttribute('accept');
    if (a) throw new Error('ainda filtra por ' + a);
  });
  await passo('escolhido o arquivo, a tela diz que está lendo', async () => {
    await p.locator('#prog-restaurar').setInputFiles(D + '/bkp.json');
    await p.waitForTimeout(250);
    const t = await aviso(p);
    if (!/Lendo bkp\.json/.test(t)) throw new Error('disse: ' + t);
  });
  await passo('e abre a conferência antes de aplicar', async () => {
    await p.waitForSelector('#modal:not([hidden])', { timeout: 3000 });
    const t = await p.locator('#modal-corpo').innerText();
    if (!/1<?\/?b?>? ?estudo/.test(t.replace(/\s+/g, ' ')) && !/1 estudo/.test(t))
      throw new Error(t.slice(0, 160));
  });
  await passo('confirmada, o estudo entra', async () => {
    await p.locator('#modal-pe .btn--forte').click();
    await p.waitForTimeout(800);
    const n = await p.evaluate(() => B.estudos.contar());
    if (n !== 1) throw new Error('guardou ' + n);
  });
  await ctx.close();
}

console.log('\n--- quando o arquivo escolhido é um pacote ---');
{
  const { ctx, p } = await abrir();
  await p.evaluate(() => B.estudos.importar([{ titulo: 'Rute 1', formato: 'simples',
    texto: '# rute', criado: '2026-10-01T10:00:00.000Z' }]));
  await p.evaluate(() => { var e = B.store.get(); e.datas = ['2026-10-01']; B.store.substituirPor(e); });
  await passo('ele soma os estudos sem apagar a leitura deste aparelho', async () => {
    await p.locator('#prog-restaurar').setInputFiles(D + '/pac.json');
    await p.waitForTimeout(900);
    const t = await aviso(p);
    if (!/nada foi substituído/.test(t)) throw new Error('disse: ' + t);
    const n = await p.evaluate(() => B.estudos.contar());
    if (n !== 3) throw new Error('ficou com ' + n + ' estudos');
    const d = await p.evaluate(() => B.store.get().datas.length);
    if (d !== 1) throw new Error('mexeu na leitura: ' + d);
  });
  await passo('e não pede conferência: não há o que substituir', async () => {
    if (await p.locator('#modal').isVisible()) throw new Error('abriu o modal à toa');
  });
  await ctx.close();
}

console.log('\n--- quando o arquivo está errado, dizer qual é o erro ---');
{
  const { ctx, p } = await abrir();
  await passo('JSON de outra coisa: diz que é JSON, mas não é backup', async () => {
    await p.locator('#prog-restaurar').setInputFiles(D + '/outro.json');
    await p.waitForTimeout(500);
    const t = await aviso(p);
    if (!/não é um backup deste app/.test(t)) throw new Error('disse: ' + t);
  });
  await passo('arquivo que nem JSON é: diz isso, com o nome dele', async () => {
    await p.locator('#prog-restaurar').setInputFiles(D + '/nada.json');
    await p.waitForTimeout(500);
    const t = await aviso(p);
    if (!/nada\.json/.test(t) || !/não é JSON/.test(t)) throw new Error('disse: ' + t);
  });
  await ctx.close();
}

await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
