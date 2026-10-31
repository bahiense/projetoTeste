import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros=[];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ '+n); } catch(e){ console.log('  ✗ '+n+' — '+e.message); erros.push(n); } };

const ctx = await nav.newContext({ viewport:{width:390,height:1400}, deviceScaleFactor:2, colorScheme:'dark' });
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
await p.goto('http://127.0.0.1:8123/biblia/#/hoje', { waitUntil:'domcontentloaded' });
await p.waitForTimeout(700);
await p.evaluate(() => {
  const c = B.store.get().config; c.chaveGoogle = 'AIzaX'; B.store.salvar();
  localStorage.setItem('bib:lote', JSON.stringify({
    ligado:false, formato:'ambos', feitos:771, erros:109, cotaDia:250,
    porCausa:{ rede:61, limite:31, seguranca:17 },
    falhas:{ 'Salmos 82':{ titulo:'Salmos 82', formato:'simples', causa:'rede', vezes:2,
      quando:new Date().toISOString() } },
    diario:[{ quando:new Date().toISOString(), alvo:'Salmos 82 (simples)', causa:'rede', fim:'',
      msg:'O celular tem internet, mas não consegui falar com o Google.' }],
    ultimoErro:'8 capítulos seguidos falharam pelo mesmo motivo (não alcançou o Google (com internet no aparelho)). Isso não é problema dos capítulos: parei para você ver o que houve.'
  }));
});
await p.goto('http://127.0.0.1:8123/biblia/#/oficina', { waitUntil:'domcontentloaded' });
await p.reload({ waitUntil:'domcontentloaded' });
await p.waitForTimeout(1500);

await passo('parado, o motivo aparece antes dos números e do botão', async () => {
  const r = await p.evaluate(() => {
    const q = document.querySelector('#quadro-lote');
    const aviso = q.querySelector('.parada'), lista = q.querySelector('.resumo'),
          botao = q.querySelector('#lote-comecar');
    if (!aviso) return { erro: 'sem aviso' };
    return { antesDaLista: aviso.compareDocumentPosition(lista) & Node.DOCUMENT_POSITION_FOLLOWING ? 1 : 0,
             antesDoBotao: aviso.compareDocumentPosition(botao) & Node.DOCUMENT_POSITION_FOLLOWING ? 1 : 0,
             texto: aviso.innerText.slice(0, 80) };
  });
  if (r.erro) throw new Error(r.erro);
  if (!r.antesDaLista) throw new Error('o motivo ficou depois dos números');
  if (!r.antesDoBotao) throw new Error('o motivo ficou depois do botão');
  if (!/mesmo motivo/.test(r.texto)) throw new Error('texto: ' + r.texto);
});

await passo('e o painel de falhas já vem aberto, com a causa que domina', async () => {
  const aberto = await p.evaluate(() => !!document.querySelector('#quadro-lote .falhas[open]'));
  if (!aberto) throw new Error('o painel continuou fechado');
  const t = await p.locator('#quadro-lote .falhas').innerText();
  if (!/não alcançou o Google/.test(t)) throw new Error('não mostra a causa principal: ' + t.slice(0,120));
  if (!/61/.test(t)) throw new Error('não mostra a contagem');
});

await passo('rodando, o painel volta a ficar fechado (não é alarme)', async () => {
  await p.evaluate(() => {
    B.lote.estado = () => ({ ligado:true, rodando:true, em:'Salmos 82', feitos:771, feitosHoje:4,
      erros:109, porCausa:{ rede:61 }, diario:[], falhas:{}, aguardando:0, formato:'ambos',
      cotaDia:250, pausadoAte:null, esperandoCota:false, ultimoErro:'', caracteres:0, dia:'',
      vez:1, parcial:0, esperado:4200, fase:'pedindo', esperandoAte:0, desde:Date.now(),
      filaEmPausa:0 });
    B.lote.pendentes = () => Promise.resolve(new Array(1739));
    B.app.pintar();
  });
  await p.waitForTimeout(900);
  if (await p.evaluate(() => !!document.querySelector('#quadro-lote .falhas[open]')))
    throw new Error('abriu enquanto roda');
});

const cartao = p.locator('section.cartao').filter({ hasText:'A Bíblia inteira são' });
await p.goto('http://127.0.0.1:8123/biblia/#/oficina', { waitUntil:'domcontentloaded' });
await p.reload({ waitUntil:'domcontentloaded' });
await p.waitForTimeout(1500);
await cartao.scrollIntoViewIfNeeded();
await cartao.screenshot({ path:'/tmp/claude-0/-home-user/81e5514c-15a3-5fdb-9332-043d4f543cde/scratchpad/shot-motivo.png' });

await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
