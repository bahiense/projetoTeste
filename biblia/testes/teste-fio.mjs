/* O fio da narrativa: de onde vem o capítulo que se vai estudar.

   Um passo só. No primeiro capítulo de um livro, o passo é o livro —
   o capítulo de trás ali é de outro livro e não ajuda ninguém.

   Uso: node biblia/testes/teste-fio.mjs (com o servidor de pé) */
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

const abrir = async (ref) => {
  await p.evaluate(r => {
    location.hash = '#/estudo/' + encodeURIComponent(r) + '/completo';
    B.app.pintar();
  }, ref);
  await p.waitForTimeout(2600);
  const caixa = p.locator('.fio-narrativa');
  if (!await caixa.count()) throw new Error(ref + ': sem o cartão do fio');
  return (await caixa.innerText()).replace(/\n+/g, ' | ');
};

console.log('\n--- um passo só ---');

await passo('no meio do livro, o resumo é do capítulo anterior', async () => {
  const t = await abrir('Jonas 2');
  if (!/O CAPÍTULO ANTERIOR/.test(t)) throw new Error(t.slice(0, 120));
  if (!/Jonas 1/.test(t)) throw new Error('não nomeou o anterior: ' + t.slice(0, 120));
  if (/Carregando/.test(t)) throw new Error('ficou carregando');
  /* E o resumo é mesmo o do capítulo anterior, não o deste. */
  const doAnterior = await p.evaluate(() => B.estudos.obter('Jonas 1', 'completo')
    .then(e => (e.texto.split('\n').filter(l => l.trim() && !/^#/.test(l))[0] || '').trim()));
  const corpo = await p.locator('[data-fio-resumo="ant"]').innerText();
  if (doAnterior.indexOf(corpo.slice(0, 40)) < 0) {
    throw new Error('o resumo não é o de Jonas 1: ' + corpo.slice(0, 60));
  }
});

await passo('e o cartão não repete o capítulo que já está na tela', async () => {
  const t = await abrir('Jonas 2');
  if (/VOCÊ ESTÁ AQUI/.test(t)) throw new Error('voltou o passo "você está aqui"');
  if (await p.locator('[data-fio-ponte]').count()) throw new Error('voltou a ponte');
  if (await p.locator('[data-fio-resumo="atual"]').count()) {
    throw new Error('voltou o resumo do capítulo atual');
  }
});

await passo('no capítulo 1, o resumo é do livro em que se entra', async () => {
  for (const ref of ['Jonas 1', 'Lucas 1', 'Êxodo 1', 'Gênesis 1']) {
    const t = await abrir(ref);
    const livro = ref.replace(/ 1$/, '');
    if (!/O LIVRO EM QUE VOCÊ ENTRA/.test(t)) throw new Error(ref + ': ' + t.slice(0, 120));
    if (/O CAPÍTULO ANTERIOR/.test(t)) throw new Error(ref + ': ofereceu capítulo de trás');
    if (/Carregando/.test(t)) throw new Error(ref + ': ficou carregando');
    const corpo = await p.locator('[data-fio-resumo="livro"]').innerText();
    if (corpo.length < 40) throw new Error(ref + ': resumo curto demais');
    /* Êxodo 1 não pode trazer Gênesis 50. */
    if (/Gênesis 50|Malaquias 4|Lucas 24/.test(t)) {
      throw new Error(ref + ': trouxe o fim do livro anterior');
    }
    void livro;
  }
});

await passo('e esse resumo é o do panorama daquele livro', async () => {
  await abrir('Lucas 1');
  const naTela = await p.locator('[data-fio-resumo="livro"]').innerText();
  const doPanorama = await p.evaluate(() => B.estudos.obter('Lucas', 'completo')
    .then(e => e && e.texto
      ? (e.texto.split('\n').filter(l => l.trim() && !/^#/.test(l))[0] || '').trim()
      : ''));
  if (!doPanorama) throw new Error('não há panorama de Lucas para comparar');
  if (doPanorama.replace(/\*\*/g, '').indexOf(naTela.slice(0, 50)) < 0) {
    throw new Error('não é a frase do panorama: ' + naTela.slice(0, 60));
  }
});

await passo('livro sem panorama cai no tema que o app já tem, sem inventar', async () => {
  const ctx2 = await nav.newContext({ viewport: { width: 390, height: 844 } });
  const p2 = await ctx2.newPage();
  p2.on('pageerror', e => erros.push('erro de página (sem panorama): ' + e.message));
  /* Esconde os estudos de livro, deixando os de capítulo. */
  await ctx2.addInitScript(`(() => {
    const real = window.fetch;
    window.fetch = function (u, o) {
      return real.call(this, u, o).then(r => {
        if (String(u || '').indexOf('data/estudos/') < 0) return r;
        return r.clone().json().then(d => {
          if (d && typeof d === 'object' && !Array.isArray(d)) {
            Object.keys(d).forEach(k => {
              if (!/ \\d+( ·|$)/.test(k)) delete d[k];   // fora os de livro
            });
          }
          return new Response(JSON.stringify(d), {
            status: 200, headers: { 'Content-Type': 'application/json' } });
        }).catch(() => r);
      });
    };
  })();`);
  await p2.goto('http://127.0.0.1:8123/biblia/#/estudo/' + encodeURIComponent('Jonas 1') +
    '/completo', { waitUntil: 'domcontentloaded' });
  await p2.waitForTimeout(3000);
  const corpo = await p2.locator('[data-fio-resumo="livro"]').innerText();
  if (/Carregando/.test(corpo)) throw new Error('ficou carregando sem o panorama');
  if (corpo.length < 30) throw new Error('não caiu no tema do livro: ' + corpo);
  await ctx2.close();
});

await ctx.close();
await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ')
  : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
