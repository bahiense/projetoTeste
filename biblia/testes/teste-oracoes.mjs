/* As orações dos estudos, para orar.

   Uso: node biblia/testes/teste-oracoes.mjs (com o servidor de pé) */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
await p.goto('http://127.0.0.1:8123/biblia/#/hoje', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1800);

const ir = async (rota) => {
  await p.evaluate((r) => { location.hash = '#/' + r; }, rota);
  await p.evaluate(() => B.app.pintar());
  await p.waitForTimeout(1200);
};

console.log('\n--- tirar a oração de dentro do estudo ---');
await passo('a oração sai do estudo completo, inteira', async () => {
  const o = await p.evaluate(() => B.estudos.obter('1 Timóteo 4', 'completo')
    .then(e => B.oracoes.extrair(e.texto)));
  if (!o || o.length < 100) throw new Error('saiu curta demais: ' + JSON.stringify(o));
  if (/^#/.test(o) || /###/.test(o)) throw new Error('veio com cabeçalho: ' + o.slice(0, 60));
  if (!/Amém|amém|\.$/.test(o.trim())) throw new Error('fim estranho: ' + o.slice(-40));
});

await passo('estudo sem a seção não inventa oração', async () => {
  const o = await p.evaluate(() => B.oracoes.extrair('# Título\n\n### O contexto\n\nTexto.'));
  if (o) throw new Error('inventou: ' + o);
});

await passo('e a seção vazia ou curta demais também não vale', async () => {
  const o = await p.evaluate(() => B.oracoes.extrair('### Oração\n\nAmém.\n\n### Outra coisa\n\nx'));
  if (o) throw new Error('aceitou um resto de linha: ' + o);
});

console.log('\n--- a tela de orar ---');
await passo('mostra a oração sozinha, em coluna própria', async () => {
  await ir('orar/' + encodeURIComponent('1 Timóteo 4'));
  const t = await p.locator('.oracao').innerText();
  if (!/Deus/.test(t)) throw new Error(t.slice(0, 80));
  /* Nada de estudo na tela: nem blocos, nem exercícios, nem referências. */
  if (await p.locator('.bloco-exegese, #fixar, .cap-ligacoes').count()) {
    throw new Error('a tela de orar trouxe pedaços do estudo');
  }
});

await passo('diz de onde vem a oração', async () => {
  const t = await p.locator('.orar-nota').innerText();
  if (!/IA a partir do capítulo/.test(t)) throw new Error(t);
});

await passo('guardar põe e tira da sua lista', async () => {
  await p.locator('[data-guardar]').click();
  await p.waitForTimeout(400);
  if (!await p.evaluate(() => B.oracoes.estaGuardada('1 Timóteo 4'))) throw new Error('não guardou');
  await p.locator('[data-guardar]').click();
  await p.waitForTimeout(400);
  if (await p.evaluate(() => B.oracoes.estaGuardada('1 Timóteo 4'))) throw new Error('não soltou');
  await p.locator('[data-guardar]').click();
  await p.waitForTimeout(400);
});

await passo('capítulo sem estudo completo diz que a oração ainda não chegou', async () => {
  await ir('orar/' + encodeURIComponent('Naum 3'));
  const t = await p.locator('#orar-corpo').innerText();
  const temEstudo = await p.evaluate(() => B.estudos.obter('Naum 3', 'completo').then(e => !!e));
  if (!temEstudo && !/ainda não tem oração/.test(t)) throw new Error(t.slice(0, 120));
});

console.log('\n--- o acervo ---');
await passo('lista as suas e as do dia', async () => {
  await ir('orar');
  const t = await p.locator('#tela').innerText();
  if (!/As suas orações/.test(t)) throw new Error(t.slice(0, 160));
  /* "para ser orada" é o subtítulo da tela; o que não pode sobrar é o
     registro: "Orei hoje", "ainda não orada", "orada há dois dias". */
  if (/Orei hoje|ainda não orada|orada há/.test(t)) {
    throw new Error('sobrou registro de oração: ' + t.slice(0, 160));
  }
  if (!/1 Timóteo 4/.test(t)) throw new Error('a guardada não apareceu');
  if (!/leitura de hoje|lidos hoje/i.test(t)) throw new Error('sem o bloco do dia');
});

await passo('e a lista do dia segue a leitura marcada', async () => {
  await p.evaluate(() => B.plano.registrarLeitura('Jonas', 2));
  await ir('orar');
  const t = await p.locator('#orar-hoje').innerText();
  if (!/Jonas 2/.test(t)) throw new Error(t.replace(/\n/g, ' | ').slice(0, 160));
});

console.log('\n--- as portas ---');
await passo('o fim do estudo leva a orar o capítulo', async () => {
  await ir('estudo/' + encodeURIComponent('1 Timóteo 4') + '/completo');
  await p.waitForTimeout(900);
  if (!await p.locator('#fixar a[href^="#/orar/"]').count()) throw new Error('sem a porta no estudo');
});

await passo('e a aba Estudo tem a porta do acervo', async () => {
  await ir('estudo');
  await p.waitForTimeout(600);
  if (!await p.locator('a[href="#/orar"]').count()) throw new Error('sem a porta na aba');
});

await passo('o que é seu vai no backup', async () => {
  const b = await p.evaluate(() => JSON.stringify(B.store.paraBackup([])));
  if (!/oracoes/.test(b) || !/1 Timóteo 4/.test(b)) throw new Error('a lista não foi no backup');
});

console.log('\n--- procurar por assunto ---');

await passo('o índice cobre as orações que vêm no app', async () => {
  const d = await p.evaluate(() => fetch('data/oracoes-indice.json').then(r => r.json()));
  if (!d.refs || d.refs.length < 800) throw new Error('só ' + (d.refs || []).length);
  if (d.refs.length !== d.trechos.length) throw new Error('trechos fora de conta');
  if (Object.keys(d.palavras).length < 2000) throw new Error('vocabulário pobre');
  /* Toda referência tem de ser capítulo de verdade. */
  const ruins = await p.evaluate(refs => refs.filter(r => !B.biblia.interpretar(r)),
    d.refs.slice(0, 200));
  if (ruins.length) throw new Error('refs ruins: ' + ruins.slice(0, 3).join(', '));
  /* E o trecho é mesmo o começo da oração daquele capítulo. */
  const i = d.refs.indexOf('Jonas 1');
  if (i < 0) throw new Error('Jonas 1 ficou de fora');
  const real = await p.evaluate(() => B.oracoes.doCapitulo('Jonas 1'));
  if (real.replace(/\s+/g, ' ').indexOf(d.trechos[i].slice(0, 60)) !== 0) {
    throw new Error('o trecho não é o começo da oração');
  }
});

await passo('procurar uma palavra acha as formas dela', async () => {
  const r = await p.evaluate(() => B.oracoes.buscar('perdão', ''));
  if (r.length < 40) throw new Error('achou só ' + r.length + ' para "perdão"');
  /* "perdão" tem de achar "perdoa": é o caso que a poda resolve. */
  const refs = r.map(x => x.ref);
  const tem = await p.evaluate(async (refs) => {
    for (const ref of refs.slice(0, 12)) {
      const t = await B.oracoes.doCapitulo(ref);
      if (t && /perdo/i.test(t.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) return ref;
    }
    return null;
  }, refs);
  if (!tem) throw new Error('nenhum dos primeiros resultados fala de perdoar');
});

await passo('e o resultado vem na ordem da Bíblia, não na do alfabeto', async () => {
  const r = await p.evaluate(() => B.oracoes.buscar('medo', '')
    .then(l => l.slice(0, 12).map(x => x.ref)));
  const ordens = await p.evaluate(refs => refs.map(ref => {
    const a = B.biblia.interpretar(ref);
    return a && a.livro ? a.livro.ordem * 1000 + a.capitulo : 0;
  }), r);
  for (let i = 1; i < ordens.length; i++) {
    if (ordens[i] < ordens[i - 1]) {
      throw new Error('fora de ordem: ' + r[i - 1] + ' antes de ' + r[i]);
    }
  }
});

await passo('duas palavras pedem as duas', async () => {
  const um = await p.evaluate(() => B.oracoes.buscar('medo', ''));
  const dois = await p.evaluate(() => B.oracoes.buscar('medo família', ''));
  if (!um.length) throw new Error('"medo" não achou nada');
  if (dois.length >= um.length) throw new Error('a segunda palavra não apertou a busca');
});

await passo('e os assuntos são contados nas próprias orações', async () => {
  const lista = await p.evaluate(() => B.oracoes.assuntos());
  if (lista.length < 10) throw new Error('só ' + lista.length + ' assuntos');
  const a = lista[0];
  const r = await p.evaluate(id => B.oracoes.buscar('', id), a.id);
  if (r.length !== a.n) throw new Error(a.nome + ': diz ' + a.n + ', acha ' + r.length);
});

await passo('a busca aparece na tela e abre a oração achada', async () => {
  await ir('orar');
  await p.waitForTimeout(1200);
  if (!await p.locator('#busca-oracao').count()) throw new Error('sem campo de busca');
  if (await p.locator('[data-assunto]').count() < 10) throw new Error('sem os assuntos');
  await p.locator('#busca-oracao').fill('medo');
  await p.waitForTimeout(900);
  const itens = p.locator('#busca-resultado .orar-item');
  if (!await itens.count()) throw new Error('não mostrou resultado');
  const alvo = await itens.first().getAttribute('href');
  await itens.first().click();
  await p.waitForTimeout(1800);
  const t = await p.locator('#tela').innerText();
  if (!/Oração|oração/.test(t)) throw new Error('não abriu a oração: ' + alvo);
  if (/Procurar por assunto/.test(t)) throw new Error('continuou no acervo');
});

await passo('oração que você importou também é achada, fora do índice', async () => {
  const ctx2 = await nav.newContext({ viewport: { width: 390, height: 844 } });
  const p2 = await ctx2.newPage();
  p2.on('pageerror', e => erros.push('erro de página (importada): ' + e.message));
  await p2.goto('http://127.0.0.1:8123/biblia/#/orar', { waitUntil: 'domcontentloaded' });
  await p2.waitForTimeout(2000);
  await p2.evaluate(() => B.estudos.importar([{
    titulo: 'Obadias 1', formato: 'completo', modelo: 'claude',
    texto: '# Obadias 1\n\nTexto.\n\n### Oração\n\nSenhor, diante do orgulho de Edom, ' +
      'ensina-nos a humildade do xilindró e a mansidão que não cobra troco. Amém.'
  }]));
  const achou = await p2.evaluate(() => B.oracoes.buscar('xilindró', ''));
  if (!achou.length) throw new Error('não achou a oração importada');
  if (achou[0].ref !== 'Obadias 1') throw new Error('achou outra: ' + achou[0].ref);
  if (!achou[0].seu) throw new Error('não marcou como sua');
  await ctx2.close();
});

await passo('sem o índice no aparelho, a tela não quebra', async () => {
  const ctx3 = await nav.newContext({ viewport: { width: 390, height: 844 } });
  await ctx3.addInitScript(`(() => {
    const real = window.fetch;
    window.fetch = function (u, o) {
      if (String(u || '').indexOf('oracoes-indice') >= 0) {
        return Promise.resolve(new Response('', { status: 404 }));
      }
      return real.call(this, u, o);
    };
  })();`);
  const p3 = await ctx3.newPage();
  p3.on('pageerror', e => erros.push('erro de página (sem índice): ' + e.message));
  await p3.goto('http://127.0.0.1:8123/biblia/#/orar', { waitUntil: 'domcontentloaded' });
  await p3.waitForTimeout(2200);
  const t = await p3.locator('#busca-conta').innerText();
  if (!/não está neste aparelho/.test(t)) throw new Error('não avisou: ' + t);
  await p3.locator('#busca-oracao').fill('perdão');
  await p3.waitForTimeout(900);
  if (!/Nenhuma oração/.test(await p3.locator('#busca-resultado').innerText())) {
    throw new Error('devia dizer que não achou, e não quebrar');
  }
  await ctx3.close();
});

await ctx.close();
await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
