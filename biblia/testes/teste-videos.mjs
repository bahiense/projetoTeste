/* O capítulo em vídeo: buscas no YouTube, nunca vídeo escolhido. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
const ir = async (h) => { await p.goto('http://127.0.0.1:8123/biblia/#/' + h, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1200); };

await ir('videos/Salmos%2023');

await passo('a tela traz as três fileiras de busca', async () => {
  const secoes = await p.locator('h3.secao').allInnerTexts();
  if (secoes.join('|') !== 'Em português|Em inglês|Por expositor') throw new Error(secoes.join('|'));
  if (await p.locator('.video-buscas a').count() < 9) throw new Error('poucas buscas');
});

await passo('todo link é busca no YouTube e abre fora do app', async () => {
  const links = await p.locator('.video-buscas a').evaluateAll(a => a.map(x => ({ h: x.href, t: x.target })));
  const mau = links.filter(l => l.h.indexOf('youtube.com/results?search_query=') < 0);
  if (mau.length) throw new Error('não é busca: ' + mau[0].h);
  if (links.some(l => l.t !== '_blank')) throw new Error('abre dentro do app');
});

await passo('a busca em inglês usa o nome do livro em inglês', async () => {
  const hrefs = await p.locator('.video-buscas a').evaluateAll(a => a.map(x => decodeURIComponent(x.href)));
  if (!hrefs.some(h => /Psalm 23 sermon/.test(h))) throw new Error('sem "Psalm 23 sermon"');
  if (hrefs.some(h => /Salmos 23 sermon/.test(h))) throw new Error('buscou "Salmos 23 sermon", que não acha nada');
});

await passo('a tela avisa que não sabe o que vai aparecer', async () => {
  const t = await p.locator('.rodape-dica').innerText();
  if (!/Confira o que ouvir|confira o que ouvir/.test(t)) throw new Error(t);
});

await passo('os links estão dentro da própria página do estudo', async () => {
  await ir('estudo/Salmos%2023');
  await p.evaluate(() => B.estudos.importar([{ titulo: 'Salmos 23', formato: 'simples',
    texto: '# O bom pastor\n\nTexto.', modelo: 'claude' }]));
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1600);
  if (!await p.locator('#prosa').count()) throw new Error('o estudo nem abriu');
  const card = p.locator('.video-aqui');
  if (!await card.count()) throw new Error('sem o cartão no fim do estudo');
  if (!/Este capítulo em vídeo/.test(await card.innerText())) throw new Error(await card.innerText());
  const n = await card.locator('a[href*="youtube"]').count();
  if (n < 4) throw new Error('buscas no cartão: ' + n);
  if (!await card.locator('a[href="#/videos/Salmos%2023"]').count()) throw new Error('sem o "Mais"');
});

await passo('o panorama de um livro busca o livro inteiro', async () => {
  await p.evaluate(() => B.estudos.importar([{ titulo: 'Rute', formato: 'simples', tipo: 'livro',
    texto: '# Rute\n\nPanorama.', modelo: 'claude' }]));
  await ir('estudo/Rute');
  await p.waitForTimeout(600);
  const card = p.locator('.video-aqui');
  if (!await card.count()) throw new Error('sem cartão no panorama');
  if (!/Este livro em vídeo/.test(await card.innerText())) throw new Error(await card.innerText());
  const hrefs = await card.locator('a[href*="youtube"]').evaluateAll(a => a.map(x => decodeURIComponent(x.href)));
  if (hrefs.some(h => /Rute \d/.test(h))) throw new Error('inventou capítulo: ' + hrefs[0]);
});

await passo('a tela de estudo e a de leitura levam até lá', async () => {
  await ir('estudo/Romanos%208');
  if (!await p.locator('a[href="#/videos/Romanos%208"]').count()) throw new Error('sem botão no estudo');
  await ir('ler/Romanos%208');
  await p.waitForTimeout(800);
  if (!await p.locator('a[href="#/videos/Romanos%208"]').count()) throw new Error('sem atalho na leitura');
});

await passo('e não sobrou nada de música no app', async () => {
  const resto = await p.evaluate(() => ({ mus: !!window.B.musica, tela: !!(B.telas && B.telas.musica) }));
  if (resto.mus || resto.tela) throw new Error('ainda há música carregada');
  await ir('musica/Salmos%2023');
  const h = await p.evaluate(() => location.hash);
  if (/musica/.test(await p.locator('#tela').innerText())) throw new Error('tela de música viva');
  if (h !== '#/musica/Salmos%2023') throw new Error(h);
});

await passo('referência inventada não quebra a tela', async () => {
  await ir('videos/Zzz%209');
  if (!/Não reconheci/.test(await p.locator('#tela').innerText())) throw new Error('não avisou');
});

await ctx.close();
await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
