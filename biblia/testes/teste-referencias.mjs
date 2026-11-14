/* Referências cruzadas e revisão espaçada.

   Uso: node biblia/testes/teste-referencias.mjs (com o servidor de pé) */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
await p.goto('http://127.0.0.1:8123/biblia/#/ler/' + encodeURIComponent('Gênesis 1'),
  { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(2000);

const ir = async (rota) => {
  await p.evaluate((r) => { location.hash = '#/' + r; }, rota);
  await p.evaluate(() => B.app.pintar());
  await p.waitForTimeout(900);
};

console.log('\n--- referências cruzadas na leitura ---');
await passo('o versículo só mostra as ligações quando é tocado', async () => {
  if (await p.locator('.v-ligacoes').count()) throw new Error('apareceram sem ninguém pedir');
  await p.locator('#texto .v[data-v="1"]').click();
  await p.waitForTimeout(500);
  const t = await p.locator('.v-ligacoes').first().innerText();
  if (!/João 1\.1-3/.test(t)) throw new Error(t.replace(/\n/g, ' | '));
});

await passo('e tocar numa delas abre o texto daquele versículo', async () => {
  await p.locator('.v-ligacoes .ligacao').first().click();
  await p.waitForTimeout(800);
  const titulo = await p.locator('#modal-titulo').innerText();
  const corpo = await p.locator('.caixa-versos-modal').innerText();
  if (!/João 1/.test(titulo)) throw new Error(titulo);
  if (!/Verbo/.test(corpo)) throw new Error(corpo.slice(0, 80));
  await p.locator('#modal-x').click();
  await p.waitForTimeout(300);
});

await passo('tocar de novo no versículo fecha as ligações', async () => {
  await p.locator('#texto .v[data-v="1"]').click();
  await p.waitForTimeout(400);
  if (await p.locator('.v-ligacoes').count()) throw new Error('continuaram abertas');
});

await passo('o crédito da licença está na tela', async () => {
  const t = await p.locator('.creditos').innerText();
  if (!/openbible\.info/.test(t) || !/CC BY/.test(t)) throw new Error(t.slice(0, 200));
});

console.log('\n--- e dentro do estudo ---');
await passo('cada bloco traz as ligações da sua faixa de versículos', async () => {
  await p.evaluate(() => {
    location.hash = '#/estudo/' + encodeURIComponent('Jeremias 27') + '/completo';
  });
  await p.evaluate(() => B.app.pintar());
  await p.waitForTimeout(2000);
  const b = p.locator('[data-toggle-versos]').first();
  if (await b.count() && /Mostrar/.test(await b.innerText())) {
    await b.click();
    await p.waitForTimeout(900);
  }
  const t = await p.locator('.bloco-ligacoes').first().innerText();
  if (!/ONDE MAIS A BÍBLIA DIZ ISTO/i.test(t)) throw new Error(t.slice(0, 120));
  if ((await p.locator('.bloco-ligacoes').first().locator('.ligacao').count()) < 3) {
    throw new Error('poucas ligações: ' + t.replace(/\n/g, ' | '));
  }
});

await passo('as ligações saem do arquivo conferido, não da IA', async () => {
  const d = await p.evaluate(() => fetch('data/referencias/01.json').then(r => r.json()));
  if (!d.refs['1']['1'].length) throw new Error('sem ligações em Gênesis 1.1');
  const ruins = await p.evaluate(() => {
    const d2 = B.referencias;
    return ['GEN 1.1', 'JHN 3.16', 'PSA 23.1'].filter(function (r) {
      const m = r.split(/[ .]/);
      return !d2.humana(r);
    });
  });
  if (ruins.length) throw new Error('não soube ler: ' + ruins.join(', '));
});

console.log('\n--- revisão espaçada ---');
await passo('capítulo lido entra na fila com três encontros', async () => {
  await p.evaluate(() => { B.revisao.esquecer(); B.plano.registrarLeitura('Gênesis', 1); });
  const n = await p.evaluate(() => B.revisao.naFila());
  if (n !== 1) throw new Error('na fila: ' + n);
  const hoje = await p.evaluate(() => B.revisao.quantosHoje());
  if (hoje !== 0) throw new Error('voltou no mesmo dia: ' + hoje);
});

await passo('reler o mesmo capítulo não enfileira duas vezes', async () => {
  await p.evaluate(() => { B.plano.registrarLeitura('Gênesis', 1); });
  const n = await p.evaluate(() => B.revisao.naFila());
  if (n !== 1) throw new Error('na fila: ' + n);
});

await passo('quando o dia chega, "Hoje" mostra o capítulo com exercícios e jogo', async () => {
  await p.evaluate(() => {
    const m = B.store.get().config.revisao;
    Object.keys(m).forEach(k => { m[k].quando = '2020-01-01'; });
    B.store.setConfig('revisao', m);
  });
  await ir('hoje');
  const t = await p.locator('.revisao').innerText();
  if (!/Gênesis 1/.test(t)) throw new Error(t.replace(/\n/g, ' | ').slice(0, 160));
  if (!/Exercícios/.test(t)) throw new Error('sem exercícios');
  if (!/Os sete dias da criação/.test(t)) throw new Error('o jogo não é do capítulo: ' + t.replace(/\n/g, ' | '));
});

await passo('o jogo sugerido é do capítulo; não havendo, do livro', async () => {
  const doCap = await p.evaluate(() => B.revisao.jogosDoCapitulo('GEN', 1).map(b => b.id));
  if (!doCap.includes('criacao')) throw new Error(doCap.join(', '));
  const doLivro = await p.evaluate(() => B.revisao.jogosDoLivro('GEN').length);
  if (doLivro < 5) throw new Error('jogos de Gênesis: ' + doLivro);
  const semJogo = await p.evaluate(() => B.revisao.jogoSugerido('OBA', 1));
  if (semJogo && !/profetas menores|Obadias/i.test(semJogo.nome)) {
    throw new Error('sugeriu jogo sem relação: ' + semJogo.nome);
  }
});

await passo('"Revisado" marca o próximo encontro e tira da lista de hoje', async () => {
  await p.locator('[data-revisado]').first().click();
  await p.waitForTimeout(700);
  const hoje = await p.evaluate(() => B.revisao.quantosHoje());
  if (hoje !== 0) throw new Error('continuou na lista: ' + hoje);
  const it = await p.evaluate(() => B.store.get().config.revisao['Gênesis 1']);
  if (!it || it.passo !== 1) throw new Error(JSON.stringify(it));
  const amanha = await p.evaluate(() => B.store.hojeISO());
  if (!(it.quando > amanha)) throw new Error('o próximo encontro não foi adiante: ' + it.quando);
});

await passo('e na terceira volta o capítulo sai da fila', async () => {
  await p.evaluate(() => { B.revisao.feito('Gênesis 1'); B.revisao.feito('Gênesis 1'); });
  const n = await p.evaluate(() => B.revisao.naFila());
  if (n !== 0) throw new Error('ainda na fila: ' + n);
});

await passo('a fila vai no backup, junto com a leitura', async () => {
  await p.evaluate(() => { B.plano.registrarLeitura('Jonas', 2); });
  const b = await p.evaluate(() => JSON.stringify(B.store.paraBackup([])));
  if (!/Jonas 2/.test(b) || !/revisao/.test(b)) throw new Error('não foi no backup');
});

await passo('"Rever agora", em Ajustes, puxa a próxima para hoje', async () => {
  await p.evaluate(() => {
    B.revisao.esquecer();
    B.plano.registrarLeitura('Gênesis', 1);
    B.plano.registrarLeitura('Rute', 1);
  });
  if (await p.evaluate(() => B.revisao.quantosHoje()) !== 0) throw new Error('já venciam hoje');
  await ir('config');
  const cartao = p.locator('#rever-agora');
  if (!(await cartao.count())) throw new Error('sem o botão em Ajustes');
  await cartao.click();
  await p.waitForTimeout(700);
  const hoje = await p.evaluate(() => B.revisao.quantosHoje());
  if (hoje !== 2) throw new Error('para hoje: ' + hoje);
  await ir('hoje');
  const t = await p.locator('.revisao').innerText();
  if (!/Gênesis 1/.test(t) || !/Rute 1/.test(t)) throw new Error(t.replace(/\n/g, ' | '));
});

await passo('e esvaziar a fila em Ajustes limpa tudo', async () => {
  await ir('config');
  await p.locator('#revisao-zerar').click();
  await p.waitForTimeout(400);
  await p.locator('#modal-pe button', { hasText: 'Esvaziar' }).click();
  await p.waitForTimeout(700);
  if (await p.evaluate(() => B.revisao.naFila()) !== 0) throw new Error('sobrou na fila');
});

await passo('sem nada vencendo, o cartão não aparece', async () => {
  await p.evaluate(() => B.revisao.esquecer());
  await ir('hoje');
  if (await p.locator('.revisao').count()) throw new Error('apareceu vazio');
});

await ctx.close();
await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
