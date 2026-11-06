/* Para cantar: o que o app afirma sobre música tem de ser verdade. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
await p.goto('http://127.0.0.1:8123/biblia/#/musica/Salmos%2023', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1800);

await passo('o capítulo com música nomeada mostra os cartões', async () => {
  const n = await p.locator('.cartao.musica').count();
  if (n !== 2) throw new Error('cartões no Salmo 23: ' + n);
  const t = await p.locator('.cartao.musica').first().innerText();
  if (!/Saltério Escocês/.test(t)) throw new Error(t);
});

await passo('cada música diz se canta o texto ou só toca no tema', async () => {
  await p.goto('http://127.0.0.1:8123/biblia/#/musica/G%C3%AAnesis%201', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(900);
  const selos = await p.locator('.cartao.musica .selo').allInnerTexts();
  if (!selos.length || selos.some(s => s !== 'tema do capítulo')) {
    throw new Error('Gênesis 1 é tema, não texto: ' + selos.join('|'));
  }
  await p.goto('http://127.0.0.1:8123/biblia/#/musica/Lamenta%C3%A7%C3%B5es%203', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(900);
  const s2 = await p.locator('.cartao.musica .selo').allInnerTexts();
  if (s2.some(s => s !== 'canta o texto')) throw new Error('Lamentações 3: ' + s2.join('|'));
});

await passo('todo link é busca no YouTube, nunca um vídeo escolhido', async () => {
  const hrefs = await p.locator('a[href*="youtube"]').evaluateAll(a => a.map(x => x.href));
  if (!hrefs.length) throw new Error('nenhum link');
  const mau = hrefs.filter(h => h.indexOf('youtube.com/results?search_query=') < 0);
  if (mau.length) throw new Error('link que não é busca: ' + mau[0]);
  const alvos = await p.locator('a[href*="youtube"]').evaluateAll(a => a.map(x => x.target));
  if (alvos.some(t => t !== '_blank')) throw new Error('abre dentro do app');
});

await passo('capítulo sem música nomeada ainda tem por onde procurar', async () => {
  await p.goto('http://127.0.0.1:8123/biblia/#/musica/Levítico%2013', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(900);
  if (await p.locator('.cartao.musica').count()) throw new Error('inventou música para Levítico 13');
  const t = await p.locator('.tela-sub').innerText();
  if (!/nenhuma música nomeada/.test(t)) throw new Error('não avisou: ' + t);
  const buscas = await p.locator('.musica-buscas a').count();
  if (buscas < 2) throw new Error('buscas: ' + buscas);
});

await passo('salmo traz os saltérios completos, que existem para os 150', async () => {
  await p.goto('http://127.0.0.1:8123/biblia/#/musica/Salmos%2088', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(900);
  const t = await p.locator('.cartao').last().innerText();
  if (!/Saltério Escocês/.test(t) || !/EveryPsalm/.test(t)) throw new Error(t.slice(0, 160));
  const rot = await p.locator('.musica-buscas a').allInnerTexts();
  if (!rot.some(r => /Salmo 88 cantado/.test(r))) throw new Error(rot.join('|'));
});

await passo('a tela de estudo leva até aqui, com o número quando há', async () => {
  await p.goto('http://127.0.0.1:8123/biblia/#/estudo/Romanos%208', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);
  const b = p.locator('a[href="#/musica/Romanos%208"]');
  if (!await b.count()) throw new Error('sem botão em Romanos 8');
  if (!/2/.test(await b.innerText())) throw new Error('sem o número: ' + await b.innerText());
  await p.goto('http://127.0.0.1:8123/biblia/#/estudo/Lev%C3%ADtico%2013', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);
  const t = await p.locator('a[href="#/musica/Lev%C3%ADtico%2013"]').innerText();
  if (/\d/.test(t)) throw new Error('prometeu música que não tem: ' + t);
});

await passo('e a tela de leitura também', async () => {
  await p.goto('http://127.0.0.1:8123/biblia/#/ler/Salmos%2023', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1500);
  if (!await p.locator('a[href="#/musica/Salmos%2023"]').count()) throw new Error('sem atalho na leitura');
});

await passo('referência inventada não quebra a tela', async () => {
  await p.goto('http://127.0.0.1:8123/biblia/#/musica/Zzz%209', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(900);
  const t = await p.locator('#tela').innerText();
  if (!/Não reconheci/.test(t)) throw new Error(t.slice(0, 120));
});

await passo('nenhuma música aponta para capítulo que não existe', async () => {
  const mau = await p.evaluate(() => {
    const ruins = [];
    const checar = (chave) => {
      const m = chave.match(/^(\w+) (\d+)$/);
      const l = B.biblia.LIVROS.filter(x => x.usfm === m[1])[0];
      if (!l || +m[2] > l.caps) ruins.push(chave);
    };
    Object.keys(B.musica.CANTOS).forEach(checar);
    Object.keys(B.musica.TEMAS).forEach(checar);
    return ruins;
  });
  if (mau.length) throw new Error(mau.join(', '));
});

await ctx.close();
await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
