/* Duas coisas que o dia exige da tela de leitura e da de estudo:

   1. Registrar a leitura DE HOJE sempre, mesmo num capítulo lido cinquenta
      vezes. O botão era do capítulo ("já lido"); agora é do dia.
   2. A aba de Estudo abrir pelo dia de hoje, com as portas de cada
      capítulo — ler, estudo, vídeo, teologia, comentário. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
const ir = async (h) => { await p.goto('http://127.0.0.1:8123/biblia/#/' + h, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1400); };
const botao = () => p.locator('[data-ler]');

await ir('hoje');

console.log('\n--- o botão é da leitura de hoje, não do capítulo ---');

await passo('capítulo lido há vinte anos ainda pede a leitura de hoje', async () => {
  await p.evaluate(() => { B.store.marcar('1 João', 3, true); B.store.salvar(); });
  await ir('ler/1%20Jo%C3%A3o%203');
  const t = await botao().innerText();
  if (!/Marcar leitura de hoje/.test(t)) throw new Error('o botão diz: ' + t);
});

await passo('um toque registra o dia sem mexer na posição do plano', async () => {
  const antes = await p.evaluate(() => B.plano.leituraAtual(B.biblia.livro('1 João').grupo).ref);
  await botao().click();
  await p.waitForTimeout(600);
  const t = await botao().innerText();
  if (!/Lido hoje/.test(t)) throw new Error('não registrou: ' + t);
  const r = await p.evaluate(() => ({
    hoje: B.plano.leuHoje('1 João', 3),
    pos: B.plano.leituraAtual(B.biblia.livro('1 João').grupo).ref,
    dias: B.store.get().datas.length,
    hist: B.store.get().historico[0]
  }));
  if (!r.hoje) throw new Error('o histórico não registrou hoje');
  if (r.pos !== antes) throw new Error('mexeu na posição do plano: ' + antes + ' → ' + r.pos);
  if (!r.dias) throw new Error('não contou o dia para a sequência');
  if (!r.hist.fora) throw new Error('não marcou como leitura fora da vez');
});

await passo('o segundo toque desfaz só o registro de hoje', async () => {
  await botao().click();
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => ({
    hoje: B.plano.leuHoje('1 João', 3),
    pos: B.plano.leituraAtual(B.biblia.livro('1 João').grupo).ref
  }));
  if (r.hoje) throw new Error('não desfez');
  /* O buraco que isto tapa: desfazer uma releitura jogava a posição do
     grupo para o capítulo relido. */
  if (r.pos === '1 João 3') throw new Error('desfazer moveu o plano para cá');
  if (!/Marcar leitura de hoje/.test(await botao().innerText())) throw new Error('o botão não voltou');
});

await passo('no capítulo da vez, marcar continua andando com o plano', async () => {
  const alvo = await p.evaluate(() => B.plano.leituraAtual('pentateuco').ref);
  await ir('ler/' + encodeURIComponent(alvo));
  await botao().click();
  await p.waitForTimeout(700);
  const depois = await p.evaluate(() => B.plano.leituraAtual('pentateuco').ref);
  if (depois === alvo) throw new Error('o plano não andou: ' + alvo);
  if (!/Lido hoje/.test(await botao().innerText())) throw new Error('não marcou o dia');
});

console.log('\n--- a aba de Estudo abre pelo dia ---');

await passo('o que foi lido hoje aparece no alto, marcado como lido', async () => {
  await ir('estudo');
  await p.waitForSelector('.hoje-estudos', { timeout: 10000 });
  const lidos = await p.locator('.hoje-estudo.is-lido .hoje-topo b').allInnerTexts();
  if (!lidos.length) throw new Error('nenhum capítulo lido hoje no bloco');
  const t = await p.locator('.hoje-estudo.is-lido .hoje-topo small').first().innerText();
  if (t !== 'lido hoje') throw new Error(t);
});

await passo('e os oito grupos aparecem: o lido hoje ou o que falta ler', async () => {
  const n = await p.locator('.hoje-estudo').count();
  if (n < 8) throw new Error('linhas no bloco de hoje: ' + n);
  const falta = await p.locator('.hoje-estudo:not(.is-lido) .hoje-topo small').first().innerText();
  if (falta !== 'a ler') throw new Error(falta);
});

await passo('cada capítulo leva às suas portas, não só ao estudo', async () => {
  const linha = p.locator('.hoje-estudo').first();
  const ref = await linha.locator('.hoje-topo b').innerText();
  const enc = encodeURIComponent(ref);
  for (const rota of ['ler', 'estudo', 'videos']) {
    if (!await linha.locator('a[href="#/' + rota + '/' + enc + '"]').count()) {
      throw new Error('faltou ' + rota + ' em ' + ref);
    }
  }
});

await passo('o estudo que falta é dito que falta, em vez de prometer', async () => {
  const t = await p.locator('.hoje-estudo').first().innerText();
  if (!/Estudo \(falta\)/.test(t)) throw new Error('não avisou: ' + t);
  await p.evaluate(async () => {
    const ref = document.querySelector('.hoje-estudo .hoje-topo b').textContent;
    await B.estudos.importar([{ titulo: ref, formato: 'completo', texto: '# x', modelo: 'claude' }]);
  });
  /* Repintar, e não ir à mesma URL: o hash é o mesmo, e o navegador não
     recarrega nada — o teste veria a tela de antes do estudo entrar. */
  await p.evaluate(() => B.app.pintar());
  await p.waitForSelector('.hoje-estudos', { timeout: 10000 });
  await p.waitForTimeout(600);
  if (/Estudo \(falta\)/.test(await p.locator('.hoje-estudo').first().innerText())) {
    throw new Error('continuou dizendo que falta');
  }
});

console.log('\n--- a tela de comentário ---');

await passo('o comentário de um capítulo abre com as duas obras', async () => {
  await ir('comentario/Romanos%208');
  await p.waitForSelector('.cartao.comentario', { timeout: 15000 });
  const autores = await p.locator('.cartao.comentario h3').allInnerTexts();
  if (autores.join('|') !== 'João Calvino|Matthew Henry') throw new Error(autores.join('|'));
  const t = await p.locator('#comentario-corpo').innerText();
  if (!/em inglês/.test(t) || !/domínio público/.test(t)) throw new Error('não avisou do inglês');
  if (!/consolation/i.test(t)) throw new Error('não trouxe o texto de Calvino');
});

await passo('onde Calvino não escreveu, Henry aparece sozinho', async () => {
  await ir('comentario/Apocalipse%2021');
  await p.waitForSelector('.cartao.comentario', { timeout: 15000 });
  const autores = await p.locator('.cartao.comentario h3').allInnerTexts();
  if (autores.join('|') !== 'Matthew Henry') throw new Error(autores.join('|'));
});

await passo('a tela de leitura e a de estudo levam ao comentário', async () => {
  await ir('ler/Romanos%208');
  await p.waitForTimeout(900);
  if (!await p.locator('a[href="#/comentario/Romanos%208"]').count()) {
    throw new Error('sem atalho na leitura');
  }
  await ir('estudo/Romanos%208');
  await p.waitForTimeout(900);
  if (!await p.locator('a[href="#/comentario/Romanos%208"]').count()) {
    throw new Error('sem botão no estudo');
  }
});

await passo('sem os arquivos, o botão não aparece em vez de levar ao vazio', async () => {
  const ctx2 = await nav.newContext({ viewport: { width: 390, height: 844 } });
  await ctx2.route('**/data/calvino/**', r => r.fulfill({ status: 404, body: '' }));
  await ctx2.route('**/data/henry/**', r => r.fulfill({ status: 404, body: '' }));
  const p2 = await ctx2.newPage();
  p2.on('pageerror', e => erros.push('erro de página (sem comentário): ' + e.message));
  await p2.goto('http://127.0.0.1:8123/biblia/#/ler/Romanos%208', { waitUntil: 'domcontentloaded' });
  await p2.waitForTimeout(2000);
  if (await p2.locator('a[href="#/comentario/Romanos%208"]').count()) {
    throw new Error('ofereceu comentário que não existe');
  }
  await p2.goto('http://127.0.0.1:8123/biblia/#/comentario/Romanos%208', { waitUntil: 'domcontentloaded' });
  await p2.waitForTimeout(1500);
  if (!/Não há comentário guardado/.test(await p2.locator('#comentario-corpo').innerText())) {
    throw new Error('a tela direta não explicou a falta');
  }
  await ctx2.close();
});

await ctx.close();
await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
