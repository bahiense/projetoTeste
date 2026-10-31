import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';

/* A página do artefato não leva <meta charset>: a plataforma do Claude
   embrulha. Servida solta, o navegador assume windows-1252 e o app quebra em
   expressão regular com acento — então aqui ela vai com o cabeçalho. */
const ALVO = '/home/user/projetoTeste/biblia/artefato-teste.html';
fs.writeFileSync(ALVO, '<!doctype html><meta charset="utf-8">\n' +
  fs.readFileSync('/home/user/projetoTeste/biblia/artefato/index.html', 'utf8'));

const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

const claude = `window.claude = { use: (c) => c === 'sample'
  ? Promise.resolve(async (m,o) => { if (o && o.onText) o.onText({text:'## E'}); return {text:'## Estudo'}; })
  : Promise.resolve(null) };`;
const apk = `window.AndroidArquivo = { salvar: () => true, salvarBackup: () => true,
  lerBackup: () => '', pastaTem: () => true, listarPacotes: () => '[]', lerPacote: () => '',
  manterAcordado: () => true };`;

const abrir = async (init, rota, pagina) => {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
  if (init) await ctx.addInitScript(init);
  const p = await ctx.newPage();
  p.on('pageerror', e => erros.push('erro de página: ' + e.message));
  await p.goto('http://127.0.0.1:8123/biblia/' + (pagina || '') + (rota ? '#/' + rota : ''),
    { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1800);
  return { ctx, p };
};
const visiveis = (p) => p.evaluate(() => Array.prototype.slice
  .call(document.querySelectorAll('[data-nav]'))
  .filter(b => !b.hidden).map(b => b.getAttribute('data-nav')));

console.log('\n--- a Oficina ---');
{
  const { ctx, p } = await abrir(claude, 'oficina');
  await passo('é uma tela só para gerar: acervo, mutirão e travessia', async () => {
    const t = await p.locator('#tela').innerText();
    if (!/Oficina/.test(t)) throw new Error(t.slice(0, 100));
    for (const id of ['#acervo', '#quadro-lote', '#quadro-travessia'])
      if (!await p.locator(id).count()) throw new Error('faltou ' + id);
  });
  await passo('diz que quem escreve é o Claude', async () => {
    const t = await p.locator('#tela').innerText();
    if (!/roda dentro do Claude/.test(t)) throw new Error(t.slice(0, 200));
  });
  await passo('o mutirão está ali, e começa', async () => {
    await p.waitForSelector('#lote-comecar', { timeout: 5000 });
    await p.locator('#lote-comecar').click();
    await p.waitForSelector('#lote-parar', { timeout: 8000 });
    await p.locator('#lote-parar').click();
    await p.waitForTimeout(600);
  });
  await passo('e traz o backup do celular sem sair da tela', async () => {
    if (!await p.locator('#ofi-arquivo').count()) throw new Error('sem o seletor');
    const a = await p.locator('#ofi-arquivo').getAttribute('accept');
    if (a) throw new Error('voltou a filtrar: ' + a);
  });
  await ctx.close();
}

console.log('\n--- dentro do Claude, o app não é uma cópia do app ---');
{
  const { ctx, p } = await abrir(claude, '', 'artefato-teste.html');
  await passo('abre direto na Oficina', async () => {
    const t = await p.locator('#tela').innerText();
    if (!/Oficina/.test(t)) throw new Error(t.slice(0, 120));
  });
  await passo('sem Hoje, Bíblia e Progresso na barra', async () => {
    const v = await visiveis(p);
    if (v.join(',') !== 'estudo,oficina') throw new Error('barra: ' + v.join(','));
  });
  await ctx.close();
}

console.log('\n--- no app instalado ---');
{
  const { ctx, p } = await abrir(apk, 'config');
  await passo('não há Oficina na barra: lá não se gera', async () => {
    const v = await visiveis(p);
    if (v.indexOf('oficina') >= 0) throw new Error('barra: ' + v.join(','));
    if (v.length !== 4) throw new Error('barra: ' + v.join(','));
  });
  await passo('mas há o link que abre a Oficina no navegador', async () => {
    const a = p.locator('#quadro-travessia a[href^="https://claude.ai/"]');
    if (!await a.count()) throw new Error('sem o link');
    if (!/Abrir a Oficina/.test(await a.innerText())) throw new Error(await a.innerText());
    if (await a.getAttribute('target') !== '_blank') throw new Error('abre dentro do app');
  });
  await ctx.close();
}

console.log('\n--- no navegador comum ---');
{
  const { ctx, p } = await abrir(null, 'config');
  await passo('a barra tem as cinco telas', async () => {
    const v = await visiveis(p);
    if (v.length !== 5 || v.indexOf('oficina') < 0) throw new Error('barra: ' + v.join(','));
  });
  await passo('e Ajustes aponta para a Oficina em vez de hospedá-la', async () => {
    if (await p.locator('#quadro-lote').count()) throw new Error('o mutirão ficou em Ajustes');
    const a = p.locator('a[href="#/oficina"]');
    if (!await a.count()) throw new Error('sem o caminho para a Oficina');
  });
  await ctx.close();
}

await nav.close();
fs.unlinkSync(ALVO);
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
