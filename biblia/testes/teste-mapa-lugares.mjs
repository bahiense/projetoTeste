/* O mapa do capítulo: lugares certos, desenho offline, nada inventado. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
const ir = async (h) => { await p.goto('http://127.0.0.1:8123/biblia/#/' + h, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1600); };

await ir('mapa/Atos%2027');

await passo('o acervo de lugares carrega e diz o seu tamanho', async () => {
  const q = await p.evaluate(() => B.lugares.carregar().then(() => B.lugares.quantos()));
  if (q.lugares < 800) throw new Error('lugares: ' + q.lugares);
  if (q.capitulos < 800) throw new Error('capítulos: ' + q.capitulos);
});

await passo('a viagem de Paulo abre no Mediterrâneo, com os lugares certos', async () => {
  const nomes = await p.locator('.lugar-topo b').allInnerTexts();
  /* Creta não está: o TIPNR não traz a ilha como lugar, só os portos
     dela (Salmone, Laseia, Fenice). É buraco da fonte, não do app. */
  for (const esperado of ['Chipre', 'Sidom', 'Itália', 'Fenice']) {
    if (!nomes.includes(esperado)) throw new Error('faltou ' + esperado + ': ' + nomes.join(','));
  }
});

await passo('o desenho é um SVG feito aqui, sem imagem de servidor', async () => {
  const svg = p.locator('svg.mapa');
  if (!await svg.count()) throw new Error('sem SVG');
  if (await p.locator('.mapa img, .mapa image').count()) throw new Error('usou imagem externa');
  const pinos = await p.locator('.mapa-pino circle').count();
  if (pinos < 10) throw new Error('pinos: ' + pinos);
  const costa = await p.locator('path.mapa-costa').getAttribute('d');
  if (!costa || costa.length < 200) throw new Error('costa vazia');
});

await passo('a janela aperta no capítulo: Gênesis 12 não mostra a Itália', async () => {
  await ir('mapa/G%C3%AAnesis%2012');
  const nomes = await p.locator('.lugar-topo b').allInnerTexts();
  if (!nomes.includes('Siquém') || !nomes.includes('Harã')) throw new Error(nomes.join(','));
  if (nomes.includes('Itália')) throw new Error('trouxe a Itália para Gênesis 12');
});

await passo('e os rótulos não saem gigantes quando o zoom aperta', async () => {
  /* O viewBox é fixo: sem isso, a letra (medida em unidades do viewBox)
     crescia junto com o zoom e os nomes saíam do tamanho de um dedo. */
  await ir('mapa/Josu%C3%A9%2010');
  const vb = await p.locator('svg.mapa').getAttribute('viewBox');
  if (vb !== '0 0 360 260') throw new Error('viewBox: ' + vb);
});

await passo('capítulo de discurso empresta o mapa do vizinho, e diz que emprestou', async () => {
  await ir('mapa/Jo%C3%A3o%2013');
  const aviso = p.locator('.aviso-mapa');
  if (!await aviso.count()) throw new Error('não avisou nada');
  const t = await aviso.innerText();
  if (!/não cita nenhum lugar/.test(t)) throw new Error(t.slice(0, 90));
  if (!/João 12, 1 capítulo antes/.test(t)) throw new Error('emprestou de onde? ' + t.slice(0, 120));
  if (!await p.locator('svg.mapa').count()) throw new Error('sem mapa');
  const titulo = await p.locator('h3.secao').innerText();
  if (!/em João 12/.test(titulo)) throw new Error('a lista não diz de quem é: ' + titulo);
});

await passo('e o vizinho pode estar depois, quando o de antes não serve', async () => {
  await ir('mapa/Jo%C3%A3o%2017');
  const t = await p.locator('.aviso-mapa').innerText();
  if (!/João 18, 1 capítulo depois/.test(t)) throw new Error(t.slice(0, 120));
});

await passo('salmo nunca empresta de outro salmo: cada um é um poema', async () => {
  await ir('mapa/Salmos%20117');
  if (await p.locator('.aviso-mapa').count()) throw new Error('emprestou entre salmos');
  if (await p.locator('svg.mapa').count()) throw new Error('desenhou mapa de outro salmo');
});

await passo('capítulo sem lugar nenhum diz isso, em vez de mapa vazio', async () => {
  await ir('mapa/Tiago%201');
  const t = await p.locator('#mapa-corpo').innerText();
  if (!/não nomeia nenhum lugar/.test(t)) throw new Error(t.slice(0, 120));
  if (await p.locator('svg.mapa').count()) throw new Error('desenhou mapa sem lugar');
});

await passo('o rodapé não vende certeza que não existe', async () => {
  await ir('mapa/Jonas%201');
  const t = await p.locator('.rodape-dica').innerText();
  if (!/é por aqui/.test(t)) throw new Error('não avisou que a localização é proposta');
  if (!/STEPBible/.test(t) || !/Natural Earth/.test(t)) throw new Error('sem as fontes');
});

await passo('cada lugar leva ao mapa de hoje, fora do app', async () => {
  const a = p.locator('.lugar a').first();
  const href = await a.getAttribute('href');
  if (!/openstreetmap\.org\/\?mlat=/.test(href)) throw new Error(href);
  if (await a.getAttribute('target') !== '_blank') throw new Error('abre dentro do app');
});

await passo('o caminho está na tela de estudo, na de leitura e no bloco de hoje', async () => {
  await ir('estudo/Jonas%201');
  if (!await p.locator('a[href="#/mapa/Jonas%201"]').count()) throw new Error('sem botão no estudo');
  await ir('ler/Jonas%201');
  await p.waitForTimeout(700);
  if (!await p.locator('a[href="#/mapa/Jonas%201"]').count()) throw new Error('sem atalho na leitura');
  await ir('estudo');
  await p.waitForSelector('.hoje-estudos', { timeout: 10000 });
  await p.waitForTimeout(800);
  if (!await p.locator('.hoje-estudo a[href^="#/mapa/"]').count()) {
    throw new Error('sem mapa no bloco de hoje');
  }
});

await passo('capítulo sem lugares e sem vizinho não ganha botão de mapa', async () => {
  await ir('estudo/Tiago%201');
  if (await p.locator('a[href^="#/mapa/"]').count()) throw new Error('ofereceu mapa vazio');
});

await passo('nenhum lugar aponta para capítulo que não existe', async () => {
  const mau = await p.evaluate(() => fetch('data/lugares.json').then(r => r.json()).then(d => {
    const ruins = [];
    Object.keys(d.capitulos).forEach(k => {
      const m = k.match(/^(\S+) (\d+)$/);
      const l = m && B.biblia.LIVROS.filter(x => x.usfm === m[1])[0];
      if (!l || +m[2] > l.caps) ruins.push(k);
    });
    return ruins;
  }));
  if (mau.length) throw new Error(mau.slice(0, 5).join(', '));
});

await passo('e nenhuma coordenada cai fora do mundo', async () => {
  const mau = await p.evaluate(() => fetch('data/lugares.json').then(r => r.json()).then(d =>
    d.lugares.filter(l => !(l.y >= -90 && l.y <= 90 && l.x >= -180 && l.x <= 180)).length));
  if (mau) throw new Error('coordenadas impossíveis: ' + mau);
});

await passo('sem os arquivos (versão sem mapa), nada quebra', async () => {
  const ctx2 = await nav.newContext({ viewport: { width: 390, height: 844 } });
  await ctx2.route('**/data/lugares.json', r => r.fulfill({ status: 404, body: '' }));
  await ctx2.route('**/data/mapa-base.json', r => r.fulfill({ status: 404, body: '' }));
  const p2 = await ctx2.newPage();
  p2.on('pageerror', e => erros.push('erro de página (sem mapa): ' + e.message));
  await p2.goto('http://127.0.0.1:8123/biblia/#/ler/Jonas%201', { waitUntil: 'domcontentloaded' });
  await p2.waitForTimeout(2000);
  if (await p2.locator('a[href^="#/mapa/"]').count()) throw new Error('ofereceu mapa sem dados');
  await ctx2.close();
});

await ctx.close();
await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
