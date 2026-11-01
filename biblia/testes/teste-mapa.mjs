/* O mapa do acervo — livro por livro, capítulo por capítulo — e a escolha
   de quais livros o mutirão vai compor. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

const claude = `window.claude = { use: (c) => c === 'sample'
  ? Promise.resolve(async () => ({ text: '## Estudo\\n\\nTexto.' }))
  : Promise.resolve(null) };`;
const apk = `window.AndroidArquivo = { salvar: () => true, salvarBackup: () => true,
  lerBackup: () => '', pastaTem: () => true, listarPacotes: () => '[]', lerPacote: () => '',
  manterAcordado: () => true, compartilhar: () => true };`;

/* Alguns estudos de Rute, de propósito incompletos: um capítulo nos dois
   formatos, um com só o simples, dois sem nada. É isso que o mapa tem de
   saber distinguir. */
const semente = () => B.estudos.importar([
  { titulo: 'Rute 1', formato: 'completo', texto: '# a', modelo: 'claude', criado: '2026-10-01T10:00:00.000Z' },
  { titulo: 'Rute 1', formato: 'simples', texto: '# b', modelo: 'claude', criado: '2026-10-01T10:00:00.000Z' },
  { titulo: 'Rute 2', formato: 'simples', texto: '# c', modelo: 'claude', criado: '2026-10-01T10:00:00.000Z' },
  { titulo: 'Rute', formato: 'completo', texto: '# panorama', tipo: 'livro', modelo: 'claude', criado: '2026-10-01T10:00:00.000Z' }
]);

async function abrir(extra, rota) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
  if (extra) await ctx.addInitScript(extra);
  const p = await ctx.newPage();
  p.on('pageerror', e => erros.push('erro de página: ' + e.message));
  await p.goto('http://127.0.0.1:8123/biblia/#/' + rota, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1800);
  return { ctx, p };
}

const abrirMapa = async (p) => {
  await p.locator('[data-ac-mapa]').click();
  await p.waitForSelector('#ac-mapa .grupo-mapa', { timeout: 15000 });
};
const abrirRute = async (p) => {
  await p.locator('#ac-mapa [data-ac-abrir="Rute"]').click();
  await p.waitForSelector('#ac-mapa [data-ac-livro="Rute"] .grade-caps', { timeout: 5000 });
};

console.log('\n--- o mapa no app (Progresso): mostra, não escolhe ---');
{
  const { ctx, p } = await abrir(apk, 'progresso');
  await p.evaluate(semente);
  await p.evaluate(() => B.app.pintar());
  await p.waitForSelector('#acervo .acervo-topo', { timeout: 15000 });

  await passo('o mapa começa fechado e abre com um toque', async () => {
    if (await p.locator('#ac-mapa .grupo-mapa').count()) throw new Error('já estava aberto');
    await abrirMapa(p);
    const n = await p.locator('#ac-mapa .grupo-mapa').count();
    if (n !== 8) throw new Error('grupos no mapa: ' + n);
    const l = await p.locator('#ac-mapa [data-ac-livro]').count();
    if (l !== 66) throw new Error('livros no mapa: ' + l);
  });

  await passo('cada livro diz quantos capítulos estão prontos', async () => {
    const t = await p.locator('#ac-mapa [data-ac-livro="Rute"] .livro-conta').innerText();
    /* Rute tem 4 capítulos: 1 pronto nos dois formatos, 1 com só um. */
    if (t.replace(/\s/g, '') !== '1/4+1') throw new Error('conta de Rute: ' + t);
    const g = await p.locator('#ac-mapa [data-ac-livro="Gênesis"] .livro-conta').innerText();
    if (g.replace(/\s/g, '') !== '0/50') throw new Error('conta de Gênesis: ' + g);
  });

  await passo('a grade separa os dois formatos, um formato e nenhum', async () => {
    await abrirRute(p);
    const g = p.locator('#ac-mapa [data-ac-livro="Rute"] .grade-caps');
    if (await g.locator('.cap').count() !== 4) throw new Error('capítulos de Rute');
    if (await g.locator('a.cap.is-on').count() !== 1) throw new Error('nos dois formatos');
    if (await g.locator('a.cap.is-meio').count() !== 1) throw new Error('com só um formato');
    if (await g.locator('span.cap.is-vazio').count() !== 2) throw new Error('faltando');
  });

  await passo('o capítulo que existe abre o estudo; o que falta não é link', async () => {
    const g = p.locator('#ac-mapa [data-ac-livro="Rute"] .grade-caps');
    const href1 = await g.locator('.cap').nth(0).getAttribute('href');
    if (href1 !== '#/estudo/Rute%201') throw new Error('capítulo 1 leva a: ' + href1);
    /* Só o simples existe: tem de abrir o simples, não uma tela vazia. */
    const href2 = await g.locator('.cap').nth(1).getAttribute('href');
    if (href2 !== '#/estudo/Rute%202/simples') throw new Error('capítulo 2 leva a: ' + href2);
    const href3 = await g.locator('.cap').nth(2).getAttribute('href');
    if (href3) throw new Error('capítulo que falta virou link: ' + href3);
  });

  await passo('o panorama do livro aparece à parte, com o seu estado', async () => {
    const t = await p.locator('#ac-mapa [data-ac-livro="Rute"] .mapa-pan').innerText();
    if (!/Panorama/.test(t) || !/só um formato/.test(t)) throw new Error(t);
    const t2 = await p.locator('#ac-mapa [data-ac-livro="Gênesis"] .mapa-pan').count();
    if (t2) throw new Error('grade de Gênesis abriu sozinha');
  });

  await passo('no app não há caixa de escolha: lá não se gera nada', async () => {
    if (await p.locator('#ac-mapa .livro-pick').count()) throw new Error('caixas no app');
    if (await p.locator('#ac-mapa .mapa-acoes').count()) throw new Error('ações de escolha no app');
  });
  await ctx.close();
}

console.log('\n--- na Oficina: escolher os livros a compor ---');
{
  const { ctx, p } = await abrir(claude, 'oficina');
  await p.evaluate(semente);
  await p.evaluate(() => B.app.pintar());
  await p.waitForSelector('#acervo .acervo-topo', { timeout: 15000 });
  await p.waitForSelector('#lote-quais', { timeout: 15000 });

  await passo('sem escolha, o mutirão vai pelos 66', async () => {
    const t = await p.locator('#lote-quais').innerText();
    if (!/Todos os 66/.test(t)) throw new Error(t);
    const faltam = await p.evaluate(() => B.lote.estimativa().then(e => e.faltam));
    if (faltam < 2400) throw new Error('fila cheia esperada, veio ' + faltam);
  });

  await passo('o botão do mutirão abre o mapa já em modo de escolha', async () => {
    await p.locator('#lote-escolher-livros').click();
    await p.waitForSelector('#ac-mapa .livro-pick', { timeout: 15000 });
    const n = await p.locator('#ac-mapa .livro-pick').count();
    if (n !== 66) throw new Error('caixas: ' + n);
  });

  await passo('marcar Romanos corta a fila para Romanos', async () => {
    await p.locator('#ac-mapa [data-pick="Romanos"]').check();
    await p.waitForTimeout(400);
    const guardado = await p.evaluate(() => B.lote.estado().livros);
    if (guardado.join() !== 'Romanos') throw new Error('guardou: ' + guardado.join());
    const fila = await p.evaluate(() => B.lote.pendentes().then(f => f.map(i => i.titulo)));
    const fora = fila.filter(t => !/^Romanos/.test(t));
    if (fora.length) throw new Error('entrou o que não é de Romanos: ' + fora.slice(0, 3));
    /* 16 capítulos + o panorama, nos dois formatos. */
    if (fila.length !== 34) throw new Error('fila de Romanos: ' + fila.length);
  });

  await passo('a escolha some do mapa mas não da tela de quem gera', async () => {
    await p.waitForTimeout(600);
    const t = await p.locator('#lote-quais').innerText();
    if (!/1 livro: Romanos/.test(t)) throw new Error(t);
  });

  await passo('a ordem da frase é a da Bíblia, não a dos toques', async () => {
    await p.locator('#ac-mapa [data-pick="Gênesis"]').check();
    await p.waitForTimeout(400);
    const g = await p.evaluate(() => B.lote.estado().livros);
    if (g.join(', ') !== 'Gênesis, Romanos') throw new Error('ordem: ' + g.join(', '));
  });

  await passo('"só os incompletos" deixa de fora o livro inteiro pronto', async () => {
    await p.evaluate(() => B.estudos.importar([
      { titulo: 'Obadias 1', formato: 'completo', texto: '# a', modelo: 'claude' },
      { titulo: 'Obadias 1', formato: 'simples', texto: '# b', modelo: 'claude' },
      { titulo: 'Obadias', formato: 'completo', texto: '# c', tipo: 'livro', modelo: 'claude' },
      { titulo: 'Obadias', formato: 'simples', texto: '# d', tipo: 'livro', modelo: 'claude' }
    ]));
    await p.locator('[data-ac-mapa]').click();   // fecha
    await p.locator('[data-ac-mapa]').click();   // reabre, relendo as chaves
    await p.waitForSelector('#ac-mapa .livro-pick', { timeout: 15000 });
    await p.locator('[data-ac-faltando]').click();
    await p.waitForTimeout(500);
    const l = await p.evaluate(() => B.lote.estado().livros);
    if (l.length !== 65) throw new Error('livros incompletos: ' + l.length);
    if (l.indexOf('Obadias') >= 0) throw new Error('Obadias entrou mesmo pronto');
    const t = await p.locator('#ac-mapa [data-ac-livro="Obadias"] .livro-conta').innerText();
    if (t.replace(/\s/g, '') !== '1/1') throw new Error('conta de Obadias: ' + t);
  });

  await passo('"voltar aos 66" limpa a escolha de vez', async () => {
    await p.locator('#lote-livros-todos').click();
    await p.waitForTimeout(600);
    const l = await p.evaluate(() => B.lote.estado().livros);
    if (l.length) throw new Error('sobrou: ' + l.join());
    const t = await p.locator('#lote-quais').innerText();
    if (!/Todos os 66/.test(t)) throw new Error(t);
  });

  await passo('com a escolha pronta, não diz que a Bíblia inteira acabou', async () => {
    await p.evaluate(() => B.lote.escolher({ livros: ['Obadias'] }));
    await p.evaluate(() => B.app.pintar());
    await p.waitForSelector('#quadro-lote .aviso--ok', { timeout: 15000 });
    const t = await p.locator('#quadro-lote').innerText();
    if (/Está tudo gerado/.test(t)) throw new Error('disse que a Bíblia inteira acabou');
    if (!/Essa parte está pronta/.test(t)) throw new Error(t.slice(0, 160));
    const bt = await p.locator('#lote-tudo').count();
    if (!bt) throw new Error('sem o caminho de volta para a Bíblia inteira');
    await p.locator('#lote-tudo').click();
    await p.waitForTimeout(600);
    const l = await p.evaluate(() => B.lote.estado().livros);
    if (l.length) throw new Error('o botão não limpou a escolha: ' + l.join());
  });
  await ctx.close();
}

await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
