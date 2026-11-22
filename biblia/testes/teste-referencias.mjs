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
  /* A primeira .ligacao da caixa é a ferramenta de comparar edições;
     a referência cruzada é a que leva um data-ligacao. */
  await p.locator('.v-ligacoes .ligacao[data-ligacao]').first().click();
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

console.log('\n--- o fim do estudo do capítulo ---');
const abrirEstudo = async (ref, fmt) => {
  await p.evaluate(([r, f]) => {
    location.hash = '#/estudo/' + encodeURIComponent(r) + '/' + f;
  }, [ref, fmt]);
  await p.evaluate(() => B.app.pintar());
  await p.waitForTimeout(2000);
  const c = p.locator('#fixar');
  if (!(await c.count())) throw new Error('sem o quadro "Fixar este capítulo"');
  return (await c.innerText()).replace(/\n+/g, ' | ');
};

await passo('o estudo termina com os exercícios do capítulo, um jogo dele e a oração',
  async () => {
    const t = await abrirEstudo('Jeremias 27', 'completo');
    if (!/Exercícios deste capítulo/.test(t)) throw new Error(t.slice(0, 200));
    if (!/perguntas/.test(t)) throw new Error('não disse quantas perguntas: ' + t.slice(0, 200));
    if (!/🎯/.test(t)) throw new Error('sem jogo: ' + t.slice(0, 200));
  });

await passo('e não marca mais data nenhuma: a revisão dos capítulos saiu', async () => {
  const t = await abrirEstudo('Jeremias 27', 'completo');
  if (/revis/i.test(t)) throw new Error('ainda fala em revisão: ' + t.slice(-200));
  await p.evaluate(() => B.plano.registrarLeitura('Jeremias', 27));
  const t2 = await abrirEstudo('Jeremias 27', 'completo');
  if (/revis/i.test(t2)) throw new Error('marcar leitura trouxe a fila de volta');
  if (await p.evaluate(() => !!window.B.revisao)) throw new Error('o módulo ainda existe');
  if (await p.evaluate(() => !!(B.store.get().config || {}).revisao)) {
    throw new Error('marcar leitura ainda escreve a fila na config');
  }
});

await passo('e a tela Hoje não tem mais o cartão de revisão', async () => {
  await ir('hoje');
  if (await p.locator('.revisao').count()) throw new Error('o cartão ainda aparece');
  if (/revisão de hoje/i.test(await p.locator('#tela').innerText())) {
    throw new Error('ainda fala em revisão de hoje');
  }
});

await passo('o jogo do capítulo continua existindo, agora em B.jogos', async () => {
  const r = await p.evaluate(() => {
    const g = B.jogos.sugerido('JER', 27);
    return {
      tem: !!g,
      nome: g && g.nome,
      doCapitulo: B.jogos.doCapitulo('GEN', 1).length,
      doLivro: B.jogos.doLivro('GEN').length
    };
  });
  if (!r.tem) throw new Error('não sugeriu jogo para Jeremias 27');
  if (!r.doCapitulo) throw new Error('nenhum baralho ligado a Gênesis 1');
  if (r.doLivro < r.doCapitulo) throw new Error('o índice do livro ficou menor que o do capítulo');
});

await ctx.close();
await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
