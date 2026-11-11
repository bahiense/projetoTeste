/* Os jogos de memorização no navegador: a porta na tela de Estudo, o
   acervo, as três mecânicas e o placar que sobrevive a recarregar.

   Uso: node biblia/testes/teste-jogos.mjs (com o servidor de pé) */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
await p.goto('http://127.0.0.1:8123/biblia/#/estudo', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);

/* A rota muda sem recarregar; o hash igual não repinta sozinho. */
const ir = async (rota) => {
  await p.evaluate((r) => { location.hash = '#/' + r; }, rota);
  await p.evaluate(() => B.app.pintar());
  await p.waitForTimeout(400);
};

console.log('\n--- a porta na tela de Estudo ---');
await passo('o cartão dos jogos aparece com a conta dos assuntos', async () => {
  const t = await p.locator('.jg-porta').innerText();
  if (!/Jogos de memorização/.test(t)) throw new Error(t);
  if (!/1\d\d assuntos/.test(t)) throw new Error('conta estranha: ' + t);
});

await passo('e leva ao acervo', async () => {
  await p.locator('.jg-porta').click();
  await p.waitForTimeout(400);
  if (!/#\/jogos/.test(await p.evaluate(() => location.hash))) throw new Error('não foi');
});

console.log('\n--- o acervo ---');
await passo('mostra mais de cinquenta jogos, agrupados por tema', async () => {
  const n = await p.locator('.jg-item').count();
  if (n <= 50) throw new Error('só ' + n);
  const temas = await p.locator('h3.secao').count();
  if (temas < 10) throw new Error('temas: ' + temas);
});

await passo('cada jogo diz quantos itens tem e de onde vem', async () => {
  const t = await p.locator('.jg-item').first().innerText();
  if (!/\d+ itens · /.test(t)) throw new Error(t);
});

console.log('\n--- pôr em ordem ---');
await passo('a capa oferece os modos e já mostra a lista certa', async () => {
  await ir('jogos/criacao');
  const t = await p.locator('#tela').innerText();
  if (!/Pôr em ordem/.test(t) || !/Relâmpago/.test(t)) throw new Error(t.slice(0, 200));
  if (!/1\. 1º dia/.test(t)) throw new Error('sem a lista: ' + t.slice(0, 300));
});

await passo('tocar na ordem certa preenche a fila e dá a nota cheia', async () => {
  await ir('jogos/criacao/ordem');
  const total = await p.locator('.jg-pedra').count();
  for (let i = 0; i < total; i++) {
    await p.locator('.jg-pedra[data-i="' + i + '"]').click();
    await p.waitForTimeout(60);
  }
  await p.waitForTimeout(400);
  const t = await p.locator('.jg-fim').innerText();
  if (!new RegExp(total + ' de ' + total + ' de primeira').test(t)) throw new Error(t.slice(0, 200));
  if (!/decorado/.test(t)) throw new Error('não contou como decorado: ' + t.slice(0, 200));
});

await passo('errar revela qual era o certo, em vez de só negar', async () => {
  await ir('jogos/criacao/ordem');
  const total = await p.locator('.jg-pedra').count();
  await p.locator('.jg-pedra[data-i="' + (total - 1) + '"]').click();
  await p.waitForTimeout(300);
  const fila = await p.locator('.jg-fila').innerText();
  if (!/1º dia/.test(fila)) throw new Error('não revelou o primeiro: ' + fila);
  if (!await p.locator('.jg-passo.is-revelada').count()) throw new Error('sem marca de revelado');
  const placar = await p.locator('#jg-placar').innerText();
  if (!/1 erro/.test(placar)) throw new Error(placar);
});

console.log('\n--- ligar os pares ---');
await passo('a mesa é pequena e o par certo trava verde', async () => {
  await ir('jogos/apostolos/pares');
  const n = await p.locator('.jg-par--a').count();
  if (n > 5) throw new Error('mesa grande: ' + n);
  const chave = await p.locator('.jg-par--a').first().getAttribute('data-chave');
  await p.locator('.jg-par--a').first().click();
  await p.locator('.jg-par--b[data-chave="' + chave.replace(/"/g, '\\"') + '"]').click();
  await p.waitForTimeout(200);
  if (await p.locator('.jg-par.is-certa').count() !== 2) throw new Error('não travou o par');
  if (!/1<\/b> de/.test(await p.locator('#jg-placar').innerHTML())) {
    throw new Error(await p.locator('#jg-placar').innerText());
  }
});

await passo('par errado não trava e conta erro', async () => {
  const chave = await p.locator('.jg-par--a:not([disabled])').first().getAttribute('data-chave');
  await p.locator('.jg-par--a:not([disabled])').first().click();
  const outro = p.locator('.jg-par--b:not([disabled])').filter({ hasNot: p.locator('nada') });
  const chaves = await p.locator('.jg-par--b:not([disabled])').evaluateAll(
    (ns, c) => ns.map(n => n.getAttribute('data-chave')).filter(x => x !== c), chave);
  await p.locator('.jg-par--b[data-chave="' + chaves[0].replace(/"/g, '\\"') + '"]').click();
  await p.waitForTimeout(600);
  if (!/1 erro/.test(await p.locator('#jg-placar').innerText())) {
    throw new Error(await p.locator('#jg-placar').innerText());
  }
  if (await p.locator('.jg-par.is-certa').count() !== 2) throw new Error('travou o par errado');
});

console.log('\n--- relâmpago ---');
await passo('a pergunta vem com quatro alternativas', async () => {
  await ir('jogos/mandamentos/relampago');
  if (await p.locator('.alt-ex').count() !== 4) throw new Error('alternativas: ' +
    await p.locator('.alt-ex').count());
});

await passo('errar mostra a resposta certa e o versículo de onde ela saiu', async () => {
  const certa = await p.evaluate(() => {
    const alvo = document.querySelector('.jg-flash-txt').textContent;
    const b = B.jogos.porId('mandamentos').itens.filter(i => i.b === alvo)[0];
    return b.a;
  });
  const textos = await p.locator('.alt-ex').allInnerTexts();
  const errada = textos.findIndex(t => t !== certa);
  await p.locator('.alt-ex[data-n="' + errada + '"]').click();
  await p.waitForTimeout(200);
  const t = await p.locator('.jg-flash-resp').innerText();
  if (!t.includes(certa)) throw new Error('não mostrou o certo: ' + t);
  if (!await p.locator('.jg-flash-resp .jg-ref').count()) throw new Error('sem referência');
  if (await p.locator('.alt-ex.is-certa').count() !== 1) throw new Error('não marcou a certa');
});

await passo('o fim da rodada traz a lista certa inteira', async () => {
  for (let i = 0; i < 20; i++) {
    if (!await p.locator('#jg-adiante').count()) {
      const alt = p.locator('.alt-ex:not([disabled])').first();
      if (!await alt.count()) break;
      await alt.click();
      await p.waitForTimeout(80);
    }
    await p.locator('#jg-adiante').click();
    await p.waitForTimeout(120);
    if (await p.locator('.jg-fim').count()) break;
  }
  const t = await p.locator('#jg-mesa').innerText();
  if (!/Como é:/.test(t)) throw new Error('sem gabarito: ' + t.slice(0, 200));
});

console.log('\n--- o placar fica ---');
await passo('o jogo vencido continua marcado depois de recarregar o app', async () => {
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1500);
  await ir('jogos');
  const feitos = await p.locator('.jg-item.is-feito').count();
  if (!feitos) throw new Error('nenhum marcado');
  const t = await p.locator('.jg-resumo').innerText();
  if (!/1<\/b>|\b1\b/.test(t)) throw new Error(t);
});

await passo('e sai do lugar certo quando se pede para esquecer', async () => {
  await ir('jogos/criacao');
  await p.locator('#jg-zerar').click();
  await p.waitForTimeout(400);
  const guardado = await p.evaluate(() => (B.store.get().config.jogos || {}).criacao);
  if (guardado) throw new Error('ficou guardado');
});

await ctx.close();
await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
