/* Exercícios do capítulo: gerados com o texto na frente, corrigidos na hora. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

/* Um Claude de mentira que devolve um JSON de exercícios. */
const claude = `window.__pedidos = [];
window.claude = { use: (c) => c === 'sample'
  ? Promise.resolve(async (p) => { window.__pedidos.push(p);
      return { text: JSON.stringify({ perguntas: [
        { t: 'multipla', p: 'Quem lavou os pés dos discípulos?', o: ['Pedro','Jesus','Judas','João'], c: 1, v: 5, e: 'Jesus se levanta da ceia e lava os pés.' },
        { t: 'cv', p: 'Pedro aceitou na hora que Jesus lavasse os seus pés.', c: false, v: 8, e: 'Pedro recusa: "nunca me lavarás os pés".' }
      ] }) }; })
  : Promise.resolve(null) };`;

const QUIZ = JSON.stringify({ perguntas: [
  { t: 'multipla', p: 'Quem lavou os pés?', o: ['Pedro', 'Jesus', 'Judas', 'João'], c: 1, v: 5, e: 'Está no versículo 5.' },
  { t: 'cv', p: 'Pedro aceitou na hora.', c: false, v: 8, e: 'Ele recusou.' }
] });

const ctx = await nav.newContext({ viewport: { width: 390, height: 900 } });
await ctx.addInitScript(claude);
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
const ir = async (h) => { await p.goto('http://127.0.0.1:8123/biblia/#/' + h, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1500); };

console.log('\n--- o pedido ---');

await passo('o pedido leva o texto do capítulo dentro', async () => {
  await ir('hoje');
  const r = await p.evaluate(async () => {
    const alvo = B.biblia.interpretar('João 13');
    const pedido = await B.prompts.preparar(alvo, B.store.get().config, 'exercicios');
    return { sistema: pedido.sistema, usuario: pedido.usuario };
  });
  if (!/TEXTO DO CAPÍTULO/.test(r.usuario)) throw new Error('sem o texto do capítulo');
  /* João 13.5 na Almeida: a bacia e os pés dos discípulos. */
  if (!/bacia/i.test(r.usuario)) throw new Error('o texto veio vazio');
  if (!/múltipla escolha/.test(r.usuario)) throw new Error('não pediu múltipla escolha');
  if (!/responda SÓ com JSON/i.test(r.sistema)) throw new Error('não exigiu JSON');
  if (!/resposta certa tem de estar literalmente nele/.test(r.sistema)) {
    throw new Error('não amarrou a resposta ao texto');
  }
});

await passo('exercício é de capítulo: livro inteiro não tem', async () => {
  const r = await p.evaluate(async () => {
    const alvo = B.biblia.interpretar('Rute');
    return await B.prompts.preparar(alvo, B.store.get().config, 'exercicios');
  });
  if (r) throw new Error('montou exercício para o livro inteiro');
});

console.log('\n--- gerar de verdade, pela Oficina ---');

await passo('o campo avulso escreve o exercício do capítulo', async () => {
  await ir('oficina');
  await p.waitForSelector('#um-ref', { timeout: 10000 });
  await p.fill('#um-ref', 'João 13');
  await p.selectOption('#um-formato', 'exercicios');
  await p.locator('#um-renovar').click();
  await p.waitForSelector('#um-estado .aviso--ok', { timeout: 20000 });
  const g = await p.evaluate(() => B.estudos.obter('João 13', 'exercicios'));
  if (!g) throw new Error('não guardou');
  if (!/perguntas/.test(g.texto)) throw new Error('guardou outra coisa: ' + g.texto.slice(0, 60));
  const pedido = await p.evaluate(() => window.__pedidos[window.__pedidos.length - 1]);
  const txt = JSON.stringify(pedido);
  if (!/TEXTO DO CAPÍTULO/.test(txt)) throw new Error('o pedido foi sem o texto do capítulo');
});

await passo('e recusa exercício de livro inteiro, com recado', async () => {
  await p.fill('#um-ref', 'Rute');
  await p.selectOption('#um-formato', 'exercicios');
  await p.locator('#um-renovar').click();
  await p.waitForTimeout(900);
  const t = await p.locator('#um-estado').innerText();
  if (!/capítulo/i.test(t)) throw new Error(t.slice(0, 120));
});

console.log('\n--- guardar sem atropelar o estudo ---');

await passo('o exercício e o estudo completo do mesmo capítulo convivem', async () => {
  await p.evaluate(async (q) => {
    await B.estudos.importar([
      { titulo: 'João 13', formato: 'completo', texto: '# Estudo completo', modelo: 'claude' },
      { titulo: 'João 13', formato: 'exercicios', texto: q, modelo: 'claude' }
    ]);
  }, QUIZ);
  const r = await p.evaluate(async () => ({
    completo: (await B.estudos.obter('João 13', 'completo')).texto.slice(0, 20),
    ex: (await B.estudos.obter('João 13', 'exercicios')).texto.slice(0, 12),
    chaves: await B.estudos.chaves()
  }));
  if (!/Estudo completo/.test(r.completo)) throw new Error('o exercício comeu o estudo: ' + r.completo);
  if (!/perguntas/.test(r.ex)) throw new Error('o exercício não ficou guardado');
  if (r.chaves.length !== 2) throw new Error('chaves: ' + r.chaves.join(' | '));
});

console.log('\n--- responder ---');

await passo('a tela mostra as perguntas e as alternativas', async () => {
  await ir('exercicios/Jo%C3%A3o%2013');
  if (await p.locator('.ex-pergunta').count() !== 2) throw new Error('perguntas na tela');
  const alts = await p.locator('.ex-pergunta').first().locator('.alt-ex').count();
  if (alts !== 4) throw new Error('alternativas: ' + alts);
  const cv = await p.locator('.ex-pergunta').nth(1).locator('.alt-ex').allInnerTexts();
  if (cv.join('|') !== 'Certo|Errado') throw new Error(cv.join('|'));
});

await passo('errar mostra a resposta certa, não só o erro', async () => {
  const q = p.locator('.ex-pergunta').first();
  await q.locator('.alt-ex').first().click();      // "Pedro", errada
  await p.waitForTimeout(300);
  const t = await q.locator('.ex-resposta').innerText();
  if (!/A resposta é/.test(t) || !/Jesus/.test(t)) throw new Error(t);
  if (!/versículo 5/i.test(t.toLowerCase().replace('versiculo','versículo'))) {
    throw new Error('não disse o versículo: ' + t);
  }
  if (!await q.locator('.alt-ex.is-certa').count()) throw new Error('não marcou a certa');
  if (!await q.locator('.alt-ex.is-errada').count()) throw new Error('não marcou a errada');
});

await passo('acertar diz certo, e o placar conta', async () => {
  const q = p.locator('.ex-pergunta').nth(1);
  await q.locator('.alt-ex').nth(1).click();        // "Errado", que é a certa
  await p.waitForTimeout(300);
  if (!/Certo\./.test(await q.locator('.ex-resposta').innerText())) throw new Error('não corrigiu');
  const placar = await p.locator('#ex-placar').innerText();
  if (!/1 de 2/.test(placar)) throw new Error('placar: ' + placar);
});

await passo('respondida uma vez, a pergunta não muda mais — só refazendo', async () => {
  const q = p.locator('.ex-pergunta').first();
  if (!await q.locator('.alt-ex[disabled]').count()) throw new Error('deixou responder de novo');
  await p.locator('#ex-refazer').click();
  await p.waitForTimeout(300);
  if (await p.locator('.alt-ex[disabled]').count()) throw new Error('refazer não liberou');
  if (!await p.locator('#ex-placar[hidden]').count()) throw new Error('placar continuou');
});

console.log('\n--- quando não dá ---');

await passo('capítulo sem exercício explica como gerar', async () => {
  await ir('exercicios/Rute%201');
  const t = await p.locator('#ex-corpo').innerText();
  if (!/Ainda não há exercícios/.test(t)) throw new Error(t.slice(0, 100));
  if (!/Oficina/.test(t)) throw new Error('não disse onde se faz');
});

await passo('JSON embrulhado em cercas de código ainda é lido', async () => {
  await p.evaluate(async (q) => {
    await B.estudos.importar([{ titulo: 'Rute 1', formato: 'exercicios',
      texto: '```json\n' + q + '\n```', modelo: 'claude' }]);
  }, QUIZ);
  /* Repintar, e não ir à mesma URL: o hash é o mesmo e o navegador não
     recarrega — o teste veria a tela de antes do exercício entrar. */
  await p.evaluate(() => B.app.pintar());
  await p.waitForTimeout(700);
  if (await p.locator('.ex-pergunta').count() !== 2) throw new Error('não leu dentro da cerca');
});

await passo('texto que não é lista de perguntas vira recado, não tela quebrada', async () => {
  await p.evaluate(async () => {
    await B.estudos.importar([{ titulo: 'Rute 2', formato: 'exercicios',
      texto: 'Claro! Aqui estão as perguntas: 1) quem...', modelo: 'claude' }]);
  });
  await ir('exercicios/Rute%202');
  const t = await p.locator('#ex-corpo').innerText();
  if (!/embaralhados/.test(t)) throw new Error(t.slice(0, 100));
  if (await p.locator('.ex-pergunta').count()) throw new Error('fingiu que tinha pergunta');
});

console.log('\n--- os caminhos ---');

await passo('o botão está no estudo, na leitura e no bloco de hoje', async () => {
  await ir('estudo/Jo%C3%A3o%2013');
  if (!await p.locator('a[href="#/exercicios/Jo%C3%A3o%2013"]').count()) throw new Error('sem botão no estudo');
  await ir('ler/Jo%C3%A3o%2013');
  await p.waitForTimeout(800);
  if (!await p.locator('a[href="#/exercicios/Jo%C3%A3o%2013"]').count()) throw new Error('sem atalho na leitura');
  await ir('estudo');
  await p.waitForSelector('.hoje-estudos', { timeout: 10000 });
  await p.waitForTimeout(600);
  if (!await p.locator('.hoje-estudo a[href^="#/exercicios/"]').count()) {
    throw new Error('sem exercícios no bloco de hoje');
  }
});

await passo('o acervo conta os exercícios à parte dos 2.510 estudos', async () => {
  await ir('progresso');
  await p.waitForSelector('#acervo .resumo', { timeout: 10000 });
  const t = await p.locator('#acervo .resumo').innerText();
  if (!/exercícios: 3 de 1.189/.test(t.replace(/ /g, ' '))) throw new Error(t);
  const topo = await p.locator('#acervo .acervo-topo').innerText();
  if (!/de 2.510/.test(topo)) throw new Error('mexeu na conta dos estudos: ' + topo);
});

await passo('e a Oficina oferece gerar só os exercícios', async () => {
  await ir('oficina');
  await p.waitForSelector('#lote-formato', { timeout: 10000 });
  const ops = await p.locator('#lote-formato option').allInnerTexts();
  if (!ops.some(o => /exercícios/i.test(o))) throw new Error(ops.join(' | '));
  const um = await p.locator('#um-formato option').allInnerTexts();
  if (!um.some(o => /Exercícios/.test(o))) throw new Error(um.join(' | '));
});

await ctx.close();
await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
