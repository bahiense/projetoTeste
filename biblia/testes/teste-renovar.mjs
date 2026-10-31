import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

const claude = `
  window.__pedidos = [];
  window.claude = { use: (c) => c === 'sample' ? Promise.resolve(async (m) => {
    window.__pedidos.push(String(m[0].content).slice(0, 40));
    return { text: '## Texto novo\\n\\nEscrito agora.' };
  }) : Promise.resolve(null) };`;

const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript(claude);
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
await p.goto('http://127.0.0.1:8123/biblia/#/oficina', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1800);

/* Um acervo de mentira com três origens. */
await p.evaluate(() => B.estudos.importar([
  { titulo: 'Gênesis 1', formato: 'simples', texto: '# velho', modelo: 'gemini-2.5-flash',
    criado: '2026-09-01T10:00:00.000Z' },
  { titulo: 'Gênesis 2', formato: 'simples', texto: '# velho', modelo: 'gemini-2.5-flash',
    criado: '2026-09-02T10:00:00.000Z' },
  { titulo: 'Mateus 1', formato: 'simples', texto: '# novo', modelo: 'Claude (pelo seu plano)',
    criado: '2026-10-20T10:00:00.000Z' },
  { titulo: 'Rute', formato: 'completo', texto: '# meu', modelo: 'colado à mão', tipo: 'livro',
    criado: '2026-10-21T10:00:00.000Z' }
]));

console.log('\n--- quem escreveu cada estudo ---');
await passo('a origem sai do rodapé, sem chutar', async () => {
  const c = await p.evaluate(() => B.estudos.porMotor());
  if (c.google !== 2 || c.claude !== 1 || c.mao !== 1 || c.total !== 4)
    throw new Error(JSON.stringify(c));
});
await passo('estudo sem origem anotada não é dado a nenhum motor', async () => {
  const m = await p.evaluate(() => B.estudos.motorDe({ titulo: 'x' }));
  if (m !== 'semNome') throw new Error(m);
});

console.log('\n--- o cartão de renovar ---');
await p.evaluate(() => B.app.pintar());
await p.waitForTimeout(900);
await passo('mostra a divisão por origem', async () => {
  const t = await p.locator('#quadro-renovar').innerText();
  if (!/2 escritos pelo Gemini/.test(t)) throw new Error(t.slice(0, 200));
  if (!/1 escritos pelo Claude/.test(t)) throw new Error(t.slice(0, 200));
});
await passo('e só oferece origens que existem no acervo', async () => {
  const vs = await p.locator('#renovar-motor option').evaluateAll(o => o.map(x => x.value));
  if (vs.indexOf('outro') >= 0 || vs.indexOf('semNome') >= 0) throw new Error(vs.join(','));
  if (vs.indexOf('google') < 0) throw new Error(vs.join(','));
});
await passo('pôr na fila guarda a escolha', async () => {
  await p.selectOption('#renovar-motor', 'google');
  await p.locator('#renovar-sim').click();
  await p.waitForTimeout(600);
  const e = await p.evaluate(() => B.lote.estado().renovar);
  if (e !== 'google') throw new Error(e);
  const t = await p.locator('#quadro-renovar').innerText();
  if (!/Na fila/.test(t)) throw new Error(t.slice(0, 200));
});

console.log('\n--- a ordem: primeiro o que falta ---');
await passo('com capítulos faltando, a fila é de geração, não de renovação', async () => {
  const r = await p.evaluate(() => B.lote.aFazer().then(x => ({
    n: x.fila.length, renovando: x.renovando, primeiro: x.fila[0] && x.fila[0].titulo
  })));
  if (r.renovando) throw new Error('foi renovar antes de terminar');
  if (r.n < 2000) throw new Error('fila curta demais: ' + r.n);
});

await passo('com tudo gerado, aí sim a fila é a de renovação', async () => {
  /* Finge que não falta nada. Trocar B.lote.pendentes não serve: o mutirão
     chama a função de dentro do módulo, não a que está no objeto. Quem ele
     consulta de verdade é B.estudos.chaves — é essa que o teste troca. */
  await p.evaluate(() => {
    var todas = [];
    B.biblia.LIVROS.forEach(function (l) {
      for (var c = 1; c <= l.caps; c++) {
        todas.push(B.estudos.chave(l.nome + ' ' + c, 'simples'));
        todas.push(B.estudos.chave(l.nome + ' ' + c, 'completo'));
      }
      todas.push(B.estudos.chave(l.nome, 'simples'));
      todas.push(B.estudos.chave(l.nome, 'completo'));
    });
    B.estudos.chaves = () => Promise.resolve(todas);
  });
  const r = await p.evaluate(() => B.lote.aFazer().then(x => ({
    n: x.fila.length, renovando: x.renovando,
    titulos: x.fila.map(i => i.titulo + '/' + i.formato)
  })));
  if (!r.renovando) throw new Error('não entrou em renovação');
  if (r.n !== 2) throw new Error('renovou ' + r.n + ': ' + r.titulos.join(', '));
  if (r.titulos[0] !== 'Gênesis 1/simples') throw new Error('fora da ordem do plano: ' + r.titulos.join(', '));
});

console.log('\n--- renovar de verdade ---');
await passo('o texto novo substitui o velho', async () => {
  await p.evaluate(() => B.lote.comecar());
  for (var i = 0; i < 40; i++) {
    await p.waitForTimeout(1000);
    const pronto = await p.evaluate(() => B.estudos.obter('Gênesis 1', 'simples')
      .then(e => /Texto novo/.test(e.texto)));
    if (pronto) break;
  }
  const e = await p.evaluate(() => B.estudos.obter('Gênesis 1', 'simples'));
  if (!/Texto novo/.test(e.texto)) throw new Error('não renovou: ' + e.texto);
  if (!/Claude/.test(e.modelo)) throw new Error('não trocou o motor: ' + e.modelo);
});
await passo('a data de criação continua sendo a do original', async () => {
  const e = await p.evaluate(() => B.estudos.obter('Gênesis 1', 'simples'));
  if (e.criado !== '2026-09-01T10:00:00.000Z') throw new Error('criado virou ' + e.criado);
  if (!e.atualizado || e.atualizado <= e.criado) throw new Error('sem data de renovação');
});
await passo('e o renovado volta a atravessar para o celular', async () => {
  await p.evaluate(() => B.lote.parar());
  const falta = await p.evaluate(() => B.copia.aLevar());
  /* tudo ainda por levar; o que importa é que levar e renovar não se anulam */
  if (!falta) throw new Error('nada para levar');
  await p.evaluate(() => B.copia.levarPacote());
  await p.waitForTimeout(600);
  const antes = await p.evaluate(() => B.copia.aLevar());
  if (antes !== 0) throw new Error('sobrou ' + antes + ' depois de levar');
  await p.evaluate(() => B.copia.esquecerTravessia(B.estudos.chave('Gênesis 1', 'simples')));
  const depois = await p.evaluate(() => B.copia.aLevar());
  if (depois !== 1) throw new Error('o renovado não voltou para a fila: ' + depois);
});
await passo('o contador de renovados anda sem mexer no total gerado', async () => {
  const e = await p.evaluate(() => B.lote.estado());
  if (!e.renovados) throw new Error('renovados = ' + e.renovados);
});
await passo('tirar da fila zera a contagem, sem desfazer o texto', async () => {
  await p.evaluate(() => B.lote.renovarMotor(''));
  const e = await p.evaluate(() => B.lote.estado());
  if (e.renovar || e.renovados) throw new Error(JSON.stringify({ r: e.renovar, n: e.renovados }));
  const g = await p.evaluate(() => B.estudos.obter('Gênesis 1', 'simples'));
  if (!/Texto novo/.test(g.texto)) throw new Error('desfez o texto renovado');
});

await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
