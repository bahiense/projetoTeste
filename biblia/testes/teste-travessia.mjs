import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

const abrir = async (init) => {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
  if (init) await ctx.addInitScript(init);
  const p = await ctx.newPage();
  p.on('pageerror', e => erros.push('erro de página: ' + e.message));
  await p.goto('http://127.0.0.1:8123/biblia/#/oficina', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1800);
  return { ctx, p };
};

const comClaude = () => {
  window.__salvos = [];
  window.claude = {
    use: (c) => {
      if (c === 'sample') return Promise.resolve(async () => ({ text: '## x' }));
      if (c === 'downloads') return Promise.resolve({
        save: ({ filename, data }) => { window.__salvos.push({ filename, data }); return Promise.resolve(); }
      });
      return Promise.resolve(null);
    }
  };
};

console.log('\n--- no Chrome: levar os estudos para o app ---');
{
  const { ctx, p } = await abrir(comClaude);
  await p.evaluate(async () => {
    const l = [];
    for (let i = 1; i <= 7; i++)
      l.push({ titulo: 'Gênesis ' + i, formato: 'simples', texto: '# estudo ' + i,
               criado: '2026-10-2' + i + 'T10:00:00.000Z' });
    await B.estudos.importar(l);
  });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1800);

  await passo('o quadro da travessia aparece e conta o que falta levar', async () => {
    const t = await p.locator('#quadro-travessia').innerText();
    if (!/Levar os estudos para o app/.test(t)) throw new Error(t.slice(0, 120));
    if (!/\b7\b/.test(t)) throw new Error('não contou os 7: ' + t.slice(0, 160));
  });

  await passo('um toque escreve o pacote, com os estudos dentro', async () => {
    await p.locator('#levar-pacote').click();
    await p.waitForTimeout(900);
    const s = await p.evaluate(() => window.__salvos);
    if (s.length !== 1) throw new Error('salvou ' + s.length + ' arquivos');
    if (!/^estudos-do-claude-01\.json$/.test(s[0].filename)) throw new Error(s[0].filename);
    const d = JSON.parse(s[0].data);
    if (d.estudos.length !== 7) throw new Error('levou ' + d.estudos.length);
    if (!d.estudos[0].texto) throw new Error('pacote sem o texto do estudo');
  });

  await passo('e o que já foi levado não é levado de novo', async () => {
    await p.waitForTimeout(600);
    const t = await p.locator('#quadro-travessia').innerText();
    if (!/já foi levado/.test(t)) throw new Error(t.slice(0, 150));
    if (await p.locator('#levar-pacote').count()) throw new Error('o botão continua lá');
  });

  await passo('e estudo que chega depois — mesmo com data velha — atravessa', async () => {
    await p.evaluate(() => B.estudos.importar([{ titulo: 'Êxodo 1', formato: 'simples',
      texto: '# novo', criado: '2019-01-01T00:00:00.000Z' }]));
    await p.waitForTimeout(400);
    const n = await p.evaluate(() => B.copia.aLevar());
    if (n !== 1) throw new Error('contou ' + n);
  });
  await ctx.close();
}

console.log('\n--- no app: trazer sozinho o que o Claude escreveu ---');
{
  const pacote = JSON.stringify({ pacote: 1, estudos: [
    { titulo: 'Salmos 1', formato: 'simples', texto: '# s1', criado: '2026-10-20T10:00:00.000Z' },
    { titulo: 'Salmos 2', formato: 'completo', texto: '# s2', criado: '2026-10-20T10:01:00.000Z' }
  ] });
  const { ctx, p } = await abrir(`
    window.__lidos = [];
    window.AndroidArquivo = {
      salvarBackup: () => true,
      pastaTem: () => true,
      pastaEscolher: () => true,
      listarPacotes: (pre) => JSON.stringify([pre + '01.json']),
      lerPacote: (n) => { window.__lidos.push(n); return ${JSON.stringify(pacote)}; }
    };`);

  await passo('na abertura, o pacote entra sem ninguém pedir', async () => {
    await p.waitForTimeout(1500);
    const n = await p.evaluate(() => B.estudos.contar());
    if (n !== 2) throw new Error('guardou ' + n + ' estudos');
  });

  await passo('e não é relido na abertura seguinte', async () => {
    await p.reload({ waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(2200);
    const lidos = await p.evaluate(() => window.__lidos);
    if (lidos.length !== 0) throw new Error('leu de novo: ' + lidos.join(','));
  });

  await passo('o quadro mostra o lado do app, não o do Chrome', async () => {
    const t = await p.locator('#quadro-travessia').innerText();
    if (!/Trazer os estudos do Claude/.test(t)) throw new Error(t.slice(0, 120));
    if (!/Ligado/.test(t)) throw new Error('não diz que está ligado: ' + t.slice(0, 160));
  });
  await ctx.close();
}

console.log('\n--- sem a pasta apontada ---');
{
  const { ctx, p } = await abrir(`
    window.AndroidArquivo = {
      salvarBackup: () => true,
      pastaTem: () => false,
      pastaEscolher: () => { setTimeout(() => window.__pastaEscolhida(true), 50); return true; },
      listarPacotes: () => '',
      lerPacote: () => ''
    };`);
  await passo('o app pede a pasta uma vez, e só', async () => {
    const t = await p.locator('#quadro-travessia').innerText();
    if (!/aponte a pasta uma vez/i.test(t)) throw new Error(t.slice(0, 160));
    if (!await p.locator('#apontar-pasta').isVisible()) throw new Error('sem o botão');
  });
  await passo('apontada, passa a buscar sozinho', async () => {
    await p.locator('#apontar-pasta').click();
    await p.waitForTimeout(600);
    await p.evaluate(() => { window.AndroidArquivo.pastaTem = () => true; });
    await p.evaluate(() => B.app.pintar());
    await p.waitForTimeout(500);
    const t = await p.locator('#quadro-travessia').innerText();
    if (!/Ligado/.test(t)) throw new Error(t.slice(0, 160));
  });
  await ctx.close();
}

console.log('\n--- navegador comum, sem Claude e sem app ---');
{
  const { ctx, p } = await abrir(null);
  await passo('não há quadro de travessia: não há para onde atravessar', async () => {
    if (await p.locator('#quadro-travessia').isVisible())
      throw new Error('o quadro apareceu sem necessidade');
  });
  await ctx.close();
}

console.log('\n--- quando a Bíblia inteira está gerada ---');
{
  const { ctx, p } = await abrir(comClaude);
  await p.evaluate(() => {
    B.lote.estimativa = () => Promise.resolve({ faltam: 0, mb: 0, dias: null, cotaDia: null, horas: 0 });
    B.app.pintar();
  });
  await p.waitForTimeout(700);
  await passo('o quadro diz que acabou, sem rodeio', async () => {
    const t = await p.locator('#quadro-lote').innerText();
    if (!/Está tudo gerado/.test(t)) throw new Error(t.slice(0, 160));
    if (!/sem internet/.test(t)) throw new Error('não diz que vale offline');
  });
  await passo('e a chave da IA sai da tela', async () => {
    if (await p.locator('#quadro-chave').isVisible())
      throw new Error('o quadro da chave continua à mostra');
  });
  await ctx.close();
}

await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
