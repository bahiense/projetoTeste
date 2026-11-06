/* O comentário de Calvino dentro do pedido: a IA para de citar de memória.

   O que importa aqui não é a tela: é o que sai no texto do pedido, porque
   é dali que vem a citação que vai ficar guardada para sempre. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
await p.goto('http://127.0.0.1:8123/biblia/#/hoje', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1600);

const pedido = (ref, formato) => p.evaluate(async ([ref, formato]) => {
  const alvo = B.biblia.interpretar(ref);
  const fontes = await B.comentario.fontes(alvo);
  const pedido = B.prompts.montar(alvo, B.store.get().config, formato, fontes);
  const acha = (autor) => (fontes.filter(f => f.autor === autor)[0] || {}).texto || '';
  return {
    fontes: fontes.map(f => f.autor),
    calvino: acha('João Calvino'), henry: acha('Matthew Henry'),
    usuario: pedido.usuario
  };
}, [ref, formato]);

await passo('os dois acervos carregam e dizem o seu tamanho', async () => {
  const q = await p.evaluate(() => B.comentario.carregar().then(() => B.comentario.quantos()));
  if (q.calvino !== 773) throw new Error('capítulos de Calvino: ' + q.calvino);
  if (q.henry !== 1189) throw new Error('capítulos de Henry: ' + q.henry);
});

await passo('Henry cobre o que falta em Calvino, inclusive Isaías 53', async () => {
  for (const ref of ['Apocalipse 21', 'Jó 1', '1 Samuel 3', 'Provérbios 3', 'Isaías 53']) {
    const r = await pedido(ref, 'completo');
    if (r.fontes.join() !== 'Matthew Henry') throw new Error(ref + ': ' + r.fontes.join('+'));
    if (r.henry.length < 2000) throw new Error(ref + ' veio curto: ' + r.henry.length);
  }
});

await passo('o capítulo comentado traz o texto real de Calvino', async () => {
  const r = await pedido('Romanos 8', 'completo');
  if (!r.calvino) throw new Error('veio vazio');
  if (!/v\. 1 —/.test(r.calvino)) throw new Error('sem versículo numerado');
  /* Uma frase que está mesmo no comentário dele a Romanos 8. */
  if (!/consolation/i.test(r.calvino)) throw new Error(r.calvino.slice(0, 200));
  if (r.usuario.indexOf(r.calvino) < 0) throw new Error('o pedido não levou a fonte');
  if (!/FONTE PRIMÁRIA/.test(r.usuario)) throw new Error('sem o cabeçalho da fonte');
});

await passo('e as regras de uso vão junto, não só o texto', async () => {
  const r = await pedido('Romanos 8', 'completo');
  for (const regra of ['nunca de memória', 'tradução nossa', 'não vira aspas', '[…]']) {
    if (r.usuario.indexOf(regra) < 0) throw new Error('faltou a regra: ' + regra);
  }
});

await passo('o pedido não estoura de tamanho', async () => {
  for (const ref of ['Salmos 119', 'Romanos 8', 'Gênesis 1', 'Isaías 53', 'João 3']) {
    const r = await pedido(ref, 'completo');
    const todo = r.calvino.length + r.henry.length;
    /* Dois tetos de 18 mil mais os avisos de corte. */
    if (todo > 37000) throw new Error(ref + ': ' + todo + ' caracteres');
    if (todo < 2000) throw new Error(ref + ' veio curto demais: ' + todo);
  }
});

await passo('o capítulo inteiro chega, não só o começo dele', async () => {
  const r = await pedido('Romanos 8', 'completo');
  const nums = [...r.calvino.matchAll(/^v\. (\d+) —/gm)].map(m => +m[1]);
  if (nums.length < 20) throw new Error('versículos no bloco: ' + nums.length);
  if (Math.max(...nums) < 30) throw new Error('parou no versículo ' + Math.max(...nums));
});

await passo('o capítulo que não cabe inteiro diz onde parou', async () => {
  const r = await pedido('Salmos 119', 'completo');
  if (!/não coube aqui: não cite sobre eles/.test(r.calvino)) {
    throw new Error('cortou o capítulo sem avisar');
  }
  const nums = [...r.calvino.matchAll(/^v\. (\d+) —/gm)].map(m => +m[1]);
  if (nums.length < 40) throw new Error('versículos: ' + nums.length);
});

await passo('o que foi cortado é marcado, para o modelo não completar', async () => {
  const r = await pedido('Salmos 119', 'completo');
  if (r.calvino.indexOf('[…]') < 0) throw new Error('cortou sem marcar');
});

await passo('livro que Calvino não comentou não ganha Calvino inventado', async () => {
  for (const ref of ['Apocalipse 21', 'Jó 1', '1 Samuel 3', 'Provérbios 3']) {
    const r = await pedido(ref, 'completo');
    if (r.calvino) throw new Error(ref + ' trouxe Calvino do nada');
    if (/JOÃO CALVINO/.test(r.usuario)) throw new Error(ref + ': pedido com Calvino vazio');
  }
});

await passo('com as duas fontes, as duas aparecem e cada uma tem o seu teto', async () => {
  const r = await pedido('Romanos 8', 'completo');
  if (r.fontes.join('+') !== 'João Calvino+Matthew Henry') throw new Error(r.fontes.join('+'));
  if (!/JOÃO CALVINO \(1540-1564\)/.test(r.usuario)) throw new Error('sem o cabeçalho de Calvino');
  if (!/MATTHEW HENRY \(1708-1710\)/.test(r.usuario)) throw new Error('sem o cabeçalho de Henry');
  if (r.calvino.length > 18600 || r.henry.length > 12400) {
    throw new Error('sem teto por fonte: ' + r.calvino.length + ' e ' + r.henry.length);
  }
});

await passo('o estudo simples não carrega 20 KB de Calvino', async () => {
  const r = await pedido('Romanos 8', 'simples');
  if (/FONTE PRIMÁRIA/.test(r.usuario)) throw new Error('o simples levou a fonte');
});

await passo('o panorama de um livro também não', async () => {
  const r = await pedido('Romanos', 'completo');
  if (r.calvino) throw new Error('trouxe comentário de capítulo para o livro inteiro');
});

await passo('sem os arquivos (APK), tudo segue em silêncio', async () => {
  const ctx2 = await nav.newContext({ viewport: { width: 390, height: 844 } });
  await ctx2.route('**/data/calvino/**', r => r.fulfill({ status: 404, body: '' }));
  await ctx2.route('**/data/henry/**', r => r.fulfill({ status: 404, body: '' }));
  const p2 = await ctx2.newPage();
  p2.on('pageerror', e => erros.push('erro de página (sem calvino): ' + e.message));
  await p2.goto('http://127.0.0.1:8123/biblia/#/hoje', { waitUntil: 'domcontentloaded' });
  await p2.waitForTimeout(1600);
  const r = await p2.evaluate(async () => {
    const alvo = B.biblia.interpretar('Romanos 8');
    const f = await B.comentario.fontes(alvo);
    return { n: f.length, q: B.comentario.quantos(), tem: B.comentario.tem('calvino', 'ROM', 8) };
  });
  if (r.n) throw new Error('inventou fonte sem os arquivos');
  if (r.q.calvino || r.q.henry || r.tem) throw new Error('disse ter acervo sem ter');
  await ctx2.close();
});

await ctx.close();
await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
