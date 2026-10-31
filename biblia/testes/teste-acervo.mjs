import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

const claude = () => { window.claude = { use: (c) => c === 'sample'
  ? Promise.resolve(async () => ({ text: '## x' })) : Promise.resolve(null) }; };
const apk = `window.AndroidArquivo = { salvar: () => true, salvarBackup: () => true,
  lerBackup: () => '', pastaTem: () => true, listarPacotes: () => '[]', lerPacote: () => '',
  manterAcordado: () => true };`;

const abrir = async (init, rota) => {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
  if (init) await ctx.addInitScript(init);
  const p = await ctx.newPage();
  p.on('pageerror', e => erros.push('erro de página: ' + e.message));
  await p.goto('http://127.0.0.1:8123/biblia/#/' + rota, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1800);
  return { ctx, p };
};

console.log('\n--- o acervo: o que existe, o que falta, o que chegou ---');
{
  const { ctx, p } = await abrir(claude, 'progresso');
  await p.evaluate(async () => {
    await B.estudos.importar([
      { titulo: 'Gênesis 1', formato: 'simples', texto: '# a', criado: '2026-10-01T10:00:00.000Z' },
      { titulo: 'Gênesis 1', formato: 'completo', texto: '# b', criado: '2026-10-02T10:00:00.000Z' },
      { titulo: 'Rute', formato: 'completo', texto: '# c', tipo: 'livro', criado: '2026-10-03T10:00:00.000Z' }
    ]);
  });
  await p.evaluate(() => B.app.pintar());
  await p.waitForTimeout(900);
  const t = async () => (await p.locator('#acervo').innerText());

  await passo('mostra quantos existem dos 2.510', async () => {
    const x = await t();
    if (!/\b3\b/.test(x) || !/2\.510/.test(x)) throw new Error(x.slice(0, 200));
  });
  await passo('separa simples de completos, e capítulo de livro inteiro', async () => {
    const x = await t();
    if (!/simples: 1 de 1\.255/.test(x)) throw new Error(x.slice(0, 200));
    if (!/completos: 2 de 1\.255/.test(x)) throw new Error(x.slice(0, 200));
    if (!/de livro inteiro: 1/.test(x)) throw new Error(x.slice(0, 220));
  });
  await passo('diz quantos faltam', async () => {
    const x = await t();
    if (!/faltam 2\.507/.test(x)) throw new Error(x.slice(0, 220));
  });
  await passo('lista o que chegou por último, do mais novo para o mais velho', async () => {
    const itens = await p.locator('.acervo-lista').first().locator('li').allInnerTexts();
    if (itens.length !== 3) throw new Error('listou ' + itens.length);
    if (!/^Rute/.test(itens[0])) throw new Error('a ordem está errada: ' + itens.join(' | '));
    if (!/Gênesis 1/.test(itens[2])) throw new Error(itens.join(' | '));
  });
  await passo('e os próximos que faltam, na ordem do plano', async () => {
    const itens = await p.locator('.acervo-lista').nth(1).locator('li').allInnerTexts();
    if (itens.length !== 6) throw new Error('listou ' + itens.length);
    if (/Gênesis 1\n|Gênesis 1 simples/.test(itens[0])) throw new Error('ofereceu o que já existe');
  });
  await passo('cada recente abre o estudo num toque', async () => {
    const h = await p.locator('.acervo-lista a').first().getAttribute('href');
    if (h !== '#/estudo/Rute') throw new Error(h);
  });
  await ctx.close();
}

console.log('\n--- as perguntas sobre o texto saíram ---');
{
  const { ctx, p } = await abrir(claude, 'progresso');
  await p.evaluate(() => B.estudos.importar([{ titulo: 'João 3', formato: 'completo',
    texto: '# João 3\n\nTexto do estudo.',
    perguntas: [{ q: 'pergunta velha', r: 'resposta velha' }],
    criado: '2026-10-01T10:00:00.000Z' }]));
  await p.goto('http://127.0.0.1:8123/biblia/#/estudo/Jo%C3%A3o%203/completo', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1500);
  await passo('não há mais caixa de perguntar', async () => {
    if (await p.locator('[data-perguntar]').count()) throw new Error('o botão continua lá');
    if (await p.locator('#duvida').count()) throw new Error('a caixa continua lá');
  });
  await passo('nem as perguntas antigas guardadas no estudo', async () => {
    const t = await p.locator('#palco').innerText();
    if (/pergunta velha|Suas perguntas/.test(t)) throw new Error(t.slice(0, 200));
  });
  await passo('mas o estudo abre inteiro', async () => {
    const t = await p.locator('#prosa').innerText();
    if (!/Texto do estudo/.test(t)) throw new Error(t.slice(0, 120));
  });
  await ctx.close();
}

console.log('\n--- no app instalado, nada de IA ---');
{
  const { ctx, p } = await abrir(apk, 'config');
  await passo('sem cartão da chave do Gemini', async () => {
    if (await p.locator('#chave-google').count()) throw new Error('a chave continua na tela');
    if (await p.locator('#quadro-chave').count()) throw new Error('o cartão continua lá');
  });
  await passo('sem o mutirão', async () => {
    if (await p.locator('#quadro-lote').count()) throw new Error('o mutirão continua lá');
  });
  await passo('sem os ajustes que só pesam ao gerar', async () => {
    if (await p.locator('#tamanho').count()) throw new Error('tamanho continua');
    if (await p.locator('#tradicao').count()) throw new Error('tradição continua');
  });
  await passo('mas o formato preferido fica, e salva', async () => {
    await p.selectOption('#formato', 'completo');
    await p.waitForTimeout(300);
    const v = await p.evaluate(() => B.store.get().config.formato);
    if (v !== 'completo') throw new Error('não salvou: ' + v);
  });
  await passo('e o quadro de trazer os estudos continua', async () => {
    const t = await p.locator('#quadro-travessia').innerText();
    if (!/Trazer os estudos do Claude/.test(t)) throw new Error(t.slice(0, 120));
  });
  await passo('o resto de Ajustes continua ligado (Drive, estudos, backup)', async () => {
    const t = await p.locator('#tela').innerText();
    if (!/Seus estudos/.test(t) || !/Google Drive/.test(t)) throw new Error('faltou cartão');
    if (!await p.locator('#situacao-estudos').count()) throw new Error('sem o quadro de estudos');
  });
  await ctx.close();
}

console.log('\n--- no app instalado, o estudo que falta ---');
{
  const { ctx, p } = await abrir(apk, 'estudo/Marcos%201');
  await passo('não oferece gerar: diz que o estudo ainda não chegou', async () => {
    const t = await p.locator('#palco').innerText();
    if (!/ainda não chegou/.test(t)) throw new Error(t.slice(0, 200));
    if (await p.locator('[data-gerar]').count()) throw new Error('ofereceu gerar');
    if (await p.locator('[data-copiar-prompt]').count()) throw new Error('ofereceu copiar o pedido');
  });
  await passo('e aponta para onde eles chegam', async () => {
    const h = await p.locator('.cartao--pedido a.btn').getAttribute('href');
    if (h !== '#/config') throw new Error(h);
  });
  await passo('o mutirão não anda sozinho aí dentro', async () => {
    const r = await p.evaluate(() => B.lote.comecar().then(e => e.rodando));
    if (r) throw new Error('o mutirão começou dentro do APK');
  });
  await ctx.close();
}

console.log('\n--- no navegador comum, a chave do Gemini continua existindo ---');
{
  const { ctx, p } = await abrir(null, 'config');
  await passo('o cartão da chave está lá', async () => {
    if (!await p.locator('#chave-google').count()) throw new Error('sumiu do navegador');
    if (await p.locator('#quadro-lote').count()) throw new Error('o mutirão ficou em Ajustes');
    if (!await p.locator('a[href="#/oficina"]').count()) throw new Error('sem caminho para a Oficina');
    if (!await p.locator('#tradicao').count()) throw new Error('tradição sumiu');
  });
  await ctx.close();
}

await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
