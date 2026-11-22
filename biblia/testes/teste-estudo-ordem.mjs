/* A tela do estudo em duas partes.

   Em cima a leitura do capítulo parte por parte; abaixo dela as duas
   ações do dia (marcar a leitura, orar o capítulo); e daí para baixo o
   aprofundamento, num bloco com nome. Esta suíte confere a ordem — que
   é o pedido — e que nada do estudo se perdeu no caminho.

   Confere também que o formato "simples" saiu: nenhum alternador na
   tela, nenhum estudo simples no pacote, e link antigo abrindo o
   completo em vez de uma tela vazia.

   Uso: node biblia/testes/teste-estudo-ordem.mjs (com o servidor de pé) */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => {
  try { await fn(); console.log('  ✓ ' + n); }
  catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); }
};

const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
await p.goto('http://127.0.0.1:8123/biblia/#/hoje', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(2000);

const abrir = async (hash) => {
  await p.evaluate(h => { location.hash = h; B.app.pintar(); }, hash);
  await p.waitForTimeout(2600);
};

/* Onde cada coisa está na tela, de cima para baixo. */
const ordem = () => p.evaluate(() => {
  const topo = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    return el.getBoundingClientRect().top + window.scrollY;
  };
  const h4 = Array.prototype.slice.call(document.querySelectorAll('.prosa h4'))
    .filter(h => /parte por parte|bloco a bloco|passo a passo/i.test(h.textContent || ''))[0];
  return {
    leitura: h4 ? h4.getBoundingClientRect().top + window.scrollY : null,
    acoes: topo('.estudo-acoes'),
    marcar: topo('[data-marcar-estudo-fim]'),
    orar: topo('.estudo-acoes a[href^="#/orar/"]'),
    aprofundar: topo('.aprofundar'),
    ferramentas: topo('.aprofundar .estudo-ferramentas-resto'),
    sumario: topo('.aprofundar .prosa-sumario')
  };
});

console.log('\n--- a ordem da tela ---');

await passo('as duas ações ficam logo abaixo da leitura parte por parte', async () => {
  await abrir('#/estudo/' + encodeURIComponent('Jonas 2'));
  const o = await ordem();
  if (o.leitura === null) throw new Error('não achei a leitura parte por parte');
  if (o.acoes === null) throw new Error('não achei as ações');
  if (!(o.leitura < o.acoes)) throw new Error('as ações vieram antes da leitura');
  if (o.marcar === null) throw new Error('falta o botão de marcar a leitura');
  if (o.orar === null) throw new Error('falta o botão de orar o capítulo');
});

await passo('e o aprofundamento vem depois delas, com nome', async () => {
  const o = await ordem();
  if (o.aprofundar === null) throw new Error('não achei a área de aprofundamento');
  if (!(o.acoes < o.aprofundar)) throw new Error('o aprofundamento ficou acima das ações');
  const tit = await p.locator('.aprofundar-tit').innerText();
  if (!/aprofundar/i.test(tit)) throw new Error('título: ' + tit);
  if (o.ferramentas === null) throw new Error('as ferramentas do capítulo não estão nele');
  if (o.sumario === null) throw new Error('os atalhos das seções não estão nele');
});

await passo('o botão de marcar registra a leitura e volta atrás', async () => {
  const bt = p.locator('[data-marcar-estudo-fim]');
  const antes = await bt.innerText();
  await bt.click();
  await p.waitForTimeout(600);
  const depois = await bt.innerText();
  if (antes === depois) throw new Error('o texto não mudou: ' + antes);
  if (!/registrada/i.test(depois)) throw new Error('depois de marcar diz: ' + depois);
  const lido = await p.evaluate(() => B.plano.leuHoje('Jonas', 2));
  if (!lido) throw new Error('o plano não registrou a leitura');
  await p.locator('[data-marcar-estudo-fim]').click();
  await p.waitForTimeout(600);
  if (await p.evaluate(() => B.plano.leuHoje('Jonas', 2))) {
    throw new Error('tocar de novo não desfez');
  }
});

await passo('e a oração abre a tela da oração deste capítulo', async () => {
  const href = await p.locator('.estudo-acoes a[href^="#/orar/"]').getAttribute('href');
  if (!/Jonas%202$/.test(href)) throw new Error('aponta para ' + href);
});

await passo('nada do estudo se perdeu na mudança', async () => {
  const r = await p.evaluate(async () => {
    const e = await B.estudos.obter('Jonas 2', 'completo');
    /* "Para meditar" e "Oração" saíram do meio do texto a pedido: a
       oração tem tela própria e as perguntas saíram de vez. */
    const secoes = (e.texto.match(/^###+\s+(.+)$/gm) || [])
      .map(l => l.replace(/^#+\s+/, '').replace(/\*/g, '').trim())
      .filter(t => !/^vv?\./i.test(t))
      .filter(t => !/^(para meditar|ora[çc][ãa]o)$/i.test(t));
    const naTela = document.querySelector('#palco').innerText;
    return { secoes: secoes, faltando: secoes.filter(t => naTela.indexOf(t) < 0) };
  });
  if (r.secoes.length < 5) throw new Error('o estudo tem ' + r.secoes.length + ' seções?');
  if (r.faltando.length) throw new Error('fora da tela: ' + r.faltando.join(' · '));
});

await passo('o panorama de um livro não ganha ações de capítulo', async () => {
  await abrir('#/estudo/' + encodeURIComponent('Jonas'));
  const o = await ordem();
  if (o.acoes !== null) throw new Error('o livro inteiro ganhou botão de marcar leitura');
});

console.log('\n--- o topo travado e o rodapé ---');

await passo('o cabeçalho e o título do capítulo ficam travados ao rolar', async () => {
  await abrir('#/estudo/' + encodeURIComponent('Jonas 2'));
  await p.evaluate(() => window.scrollTo(0, 1500));
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const cab = document.querySelector('.cabecalho').getBoundingClientRect();
    const topo = document.querySelector('.estudo-topo-fixo');
    const t = topo ? topo.getBoundingClientRect() : null;
    return {
      cabTopo: Math.round(cab.top),
      topoTopo: t ? Math.round(t.top) : null,
      cabFim: Math.round(cab.bottom),
      titulo: topo ? (topo.textContent || '').trim().slice(0, 40) : '',
      rolagem: Math.round(window.scrollY),
      /* "hidden" no body faria dele um contêiner de rolagem e nada
         grudaria; foi assim que o topo deixou de funcionar. */
      overflowBody: getComputedStyle(document.body).overflowX
    };
  });
  if (r.rolagem < 500) throw new Error('a página não rolou o bastante');
  if (r.overflowBody === 'hidden') throw new Error('body com overflow-x: hidden quebra o sticky');
  if (r.cabTopo !== 0) throw new Error('o cabeçalho saiu do topo: ' + r.cabTopo);
  if (r.topoTopo === null) throw new Error('não achei a barra do estudo');
  if (Math.abs(r.topoTopo - r.cabFim) > 4) {
    throw new Error('a barra do capítulo não grudou embaixo do cabeçalho: ' + r.topoTopo + ' vs ' + r.cabFim);
  }
  if (!/Jonas 2/.test(r.titulo)) throw new Error('a barra travada não traz o capítulo: ' + r.titulo);
});

await passo('e o menu de áreas está nessa barra', async () => {
  const n = await p.locator('.estudo-topo-fixo [data-estudo-menu-btn]').count();
  if (!n) throw new Error('sem o botão de áreas no topo travado');
});

await passo('o rodapé do estudo continua na tela, com o aviso de IA', async () => {
  const caixa = p.locator('.rodape-estudo');
  if (!await caixa.count()) throw new Error('o rodapé sumiu do estudo');
  const t = await caixa.innerText();
  if (!/escrito por IA/i.test(t)) throw new Error('sem o aviso de IA: ' + t.slice(0, 90));
  /* Visível de verdade, não só presente no HTML. */
  const r = await caixa.evaluate(el => el.getBoundingClientRect().height);
  if (r < 20) throw new Error('o rodapé está escondido (altura ' + r + ')');
  for (const sel of ['[data-apagar]', '[data-compartilhar]']) {
    if (!await p.locator('.rodape-estudo ' + sel).count()) throw new Error('faltou ' + sel);
  }
});

await passo('os botões de cada bloco cabem inteiros, numa linha cada', async () => {
  const r = await p.evaluate(() => {
    const maus = [];
    document.querySelectorAll('.bloco-exegese-toggle').forEach(el => {
      const cx = el.getBoundingClientRect();
      if (!cx.width) return;
      const cs = getComputedStyle(el);
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
      const linhas = Math.round((cx.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / lh);
      if (linhas > 1) maus.push((el.textContent || '').trim() + ' em ' + linhas + ' linhas');
      if (cx.width > el.parentElement.getBoundingClientRect().width + 1) {
        maus.push((el.textContent || '').trim() + ' estoura a caixa');
      }
    });
    return maus;
  });
  if (r.length) throw new Error(r.slice(0, 3).join(' · '));
});

console.log('\n--- o formato simples saiu ---');

await passo('link antigo com /simples abre o estudo completo', async () => {
  await abrir('#/estudo/' + encodeURIComponent('Jonas 2') + '/simples');
  const fmt = await p.evaluate(() => document.querySelector('#palco').dataset.formato);
  if (fmt !== 'completo') throw new Error('abriu como ' + fmt);
  const txt = await p.locator('#palco').innerText();
  if (/ainda não chegou|Gerar estudo/.test(txt)) throw new Error('abriu tela vazia');
  if (!/Aprofundar/i.test(txt)) throw new Error('não é o estudo completo');
});

await passo('e não há mais alternador de formato na tela', async () => {
  const n = await p.locator('.alt, [data-formato-trocar]').count();
  if (n) throw new Error('sobraram ' + n + ' trocadores de formato');
});

await passo('nenhum estudo simples sobrou no pacote do app', async () => {
  const r = await p.evaluate(() => fetch('data/estudos/indice.json').then(x => x.json())
    .then(i => ({
      total: i.length,
      simples: i.filter(e => e.formato === 'simples' || / · simples$/.test(e.id)).length
    })));
  if (r.simples) throw new Error(r.simples + ' estudos simples no índice');
  if (r.total < 1100) throw new Error('só ' + r.total + ' estudos no índice');
});

await passo('e a configuração não guarda formato nenhum', async () => {
  const tem = await p.evaluate(() => 'formato' in (B.store.get().config || {}));
  if (tem) throw new Error('config.formato continua guardado');
});

await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s)' : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
