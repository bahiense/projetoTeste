/* Desinstalar e reinstalar sem perder nada.

   A pasta apontada é o único lugar fora do alcance da desinstalação que o
   app alcança de volta sem seletor de arquivo. Aqui ela é um objeto no
   localStorage que o "reinstalar" preserva de propósito — é exatamente o
   que o Android faz: apaga a pasta do app, não a pasta da pessoa. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

/* A ponte do APK, com uma pasta de mentira que sobrevive à reinstalação. */
const apk = (comPasta) => `
window.__FAKE = { pasta: 'FAKE:pasta', tem: 'FAKE:temPasta' };
/* A permissão da pasta se dá uma vez, não a cada abertura: sem isto o
   próprio duble reconcederia a pasta no recarregamento e o caso de quem
   reinstalou sem apontar nada nunca seria testado. */
if (${comPasta} && !localStorage.getItem('FAKE:jaDecidiu')) localStorage.setItem('FAKE:temPasta', '1');
localStorage.setItem('FAKE:jaDecidiu', '1');
function __dir() { try { return JSON.parse(localStorage.getItem('FAKE:pasta') || '{}'); } catch (e) { return {}; } }
function __grava(n, c) { var d = __dir(); d[n] = c; localStorage.setItem('FAKE:pasta', JSON.stringify(d)); return true; }
window.AndroidArquivo = {
  salvar: () => true,
  /* Depois de reinstalar o MediaStore não devolve mais nada: é o buraco
     que a pasta apontada existe para tapar. */
  salvarBackup: () => true,
  lerBackup: () => '',
  compartilhar: () => true,
  manterAcordado: () => true,
  pastaTem: () => !!localStorage.getItem('FAKE:temPasta'),
  pastaEscreve: () => !!localStorage.getItem('FAKE:temPasta'),
  pastaEscolher: () => { localStorage.setItem('FAKE:temPasta', '1');
    setTimeout(() => window.__pastaEscolhida && window.__pastaEscolhida(true), 10); return true; },
  pastaGravar: (n, c) => localStorage.getItem('FAKE:temPasta') ? __grava(n, c) : false,
  /* Sem a permissão não se lê nada: é assim no Android, e um duble que
     lê de qualquer jeito esconderia exatamente o caso que importa. */
  pastaLer: (n) => localStorage.getItem('FAKE:temPasta') ? (__dir()[n] || '') : '',
  listarPacotes: (pre) => localStorage.getItem('FAKE:temPasta')
    ? JSON.stringify(Object.keys(__dir()).filter(n => n.indexOf(pre) === 0 && /\\.json$/.test(n)).sort())
    : '',
  lerPacote: (n) => localStorage.getItem('FAKE:temPasta') ? (__dir()[n] || '') : ''
};`;

/* O que o Android faz numa desinstalação: some a pasta privada do app
   (localStorage e IndexedDB), fica a pasta da pessoa. */
const reinstalar = async (p) => {
  await p.evaluate(async () => {
    const guardar = {};
    Object.keys(localStorage).filter(k => k.indexOf('FAKE:') === 0)
      .forEach(k => { guardar[k] = localStorage.getItem(k); });
    localStorage.clear();
    Object.keys(guardar).forEach(k => localStorage.setItem(k, guardar[k]));
    await new Promise(ok => { const r = indexedDB.deleteDatabase('biblia'); r.onsuccess = r.onerror = r.onblocked = ok; });
  });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(2600);   // a abertura só vai buscar depois de 1,2 s
};

async function abrir(comPasta) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(apk(comPasta));
  const p = await ctx.newPage();
  p.on('pageerror', e => erros.push('erro de página: ' + e.message));
  await p.goto('http://127.0.0.1:8123/biblia/#/hoje', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1800);
  return { ctx, p };
}

/* Uma vida de uso: capítulos lidos, estudos guardados, um pacote na pasta. */
const usar = async (p) => {
  await p.evaluate(async () => {
    B.store.marcar('Gênesis', 1); B.store.marcar('Gênesis', 2); B.store.marcar('Salmos', 23);
    await B.estudos.importar([
      { titulo: 'Gênesis 1', formato: 'completo', texto: '# um', modelo: 'claude' }
    ]);
    /* Um pacote como o artefato o deixa na pasta: é por ele que os estudos
       voltam depois de reinstalar. */
    window.AndroidArquivo.pastaGravar('estudos-do-claude-001.json', JSON.stringify({
      pacote: 1, estudos: [
        { titulo: 'Gênesis 1', formato: 'completo', texto: '# um', modelo: 'claude' },
        { titulo: 'Salmos 23', formato: 'simples', texto: '# dois', modelo: 'claude' }
      ]
    }));
    await B.copia.gravar();
  });
};

console.log('\n--- com a pasta apontada: reinstalar não perde nada ---');
{
  const { ctx, p } = await abrir(true);
  await usar(p);

  await passo('o estado vai para a pasta, e só ele — sem os megabytes dos estudos', async () => {
    const dir = await p.evaluate(() => JSON.parse(localStorage.getItem('FAKE:pasta') || '{}'));
    const bruto = dir['leitura-biblica-estado.json'];
    if (!bruto) throw new Error('nada gravado: ' + Object.keys(dir));
    const d = JSON.parse(bruto);
    if ((d.estudos || []).length) throw new Error('o estado levou estudos junto');
    if (!d.estado || !d.estado.lidos) throw new Error('sem a leitura dentro');
  });

  await passo('desinstalar e instalar de novo devolve a leitura sozinho', async () => {
    await reinstalar(p);
    const lidos = await p.evaluate(() => B.plano.progressoBiblia().lidos);
    if (lidos !== 3) throw new Error('capítulos lidos depois de reinstalar: ' + lidos);
  });

  await passo('e devolve os estudos pelos pacotes, sem tocar em nada', async () => {
    const n = await p.evaluate(() => B.estudos.contar());
    if (n !== 2) throw new Error('estudos depois de reinstalar: ' + n);
  });

  await passo('a tela não pede mais para restaurar: já está tudo lá', async () => {
    await p.evaluate(() => B.app.pintar());
    await p.waitForTimeout(400);
    if (await p.locator('#restaurar').count()) throw new Error('ainda oferecendo restaurar');
  });

  await passo('e volta a gravar na pasta a partir dali', async () => {
    await p.evaluate(async () => { B.store.marcar('Rute', 1); await B.copia.gravar(); });
    const d = await p.evaluate(() => JSON.parse(
      JSON.parse(localStorage.getItem('FAKE:pasta'))['leitura-biblica-estado.json']));
    if (!/Rute/.test(JSON.stringify(d.estado.lidos))) throw new Error('não regravou');
  });
  await ctx.close();
}

console.log('\n--- sem a pasta apontada: um toque e tudo volta ---');
{
  const { ctx, p } = await abrir(false);

  await passo('sem a pasta, o app não finge que gravou', async () => {
    await usar(p);
    const dir = await p.evaluate(() => localStorage.getItem('FAKE:pasta'));
    if (dir && dir !== '{}') throw new Error('gravou sem permissão: ' + dir);
    const ok = await p.evaluate(() => B.copia.estadoNaPasta());
    if (ok) throw new Error('disse que gravou');
  });

  await passo('Ajustes avisa que falta apontar a pasta', async () => {
    await p.evaluate(() => B.app.ir('config'));
    await p.waitForSelector('#copia-pasta', { timeout: 8000 });
    const t = await p.locator('.resumo li.is-aviso').innerText();
    if (!/ainda não foi apontada/.test(t)) throw new Error(t);
  });

  await passo('um toque aponta a pasta e grava na hora', async () => {
    await p.locator('#copia-pasta').click();
    await p.waitForTimeout(800);
    const dir = await p.evaluate(() => JSON.parse(localStorage.getItem('FAKE:pasta') || '{}'));
    if (!dir['leitura-biblica-estado.json']) throw new Error('não gravou depois de apontar');
  });

  await passo('depois disso, reinstalar devolve a leitura', async () => {
    await reinstalar(p);
    const lidos = await p.evaluate(() => B.plano.progressoBiblia().lidos);
    if (lidos !== 3) throw new Error('lidos: ' + lidos);
  });
  await ctx.close();
}

console.log('\n--- reinstalou e a pasta não estava apontada ---');
{
  const { ctx, p } = await abrir(true);
  await usar(p);
  /* Apaga tudo, inclusive a permissão da pasta: é o estado real de quem
     reinstala o app sem ter apontado nada antes. */
  await p.evaluate(() => localStorage.removeItem('FAKE:temPasta'));
  await reinstalar(p);

  await passo('a tela inicial oferece apontar a pasta, em destaque', async () => {
    await p.waitForSelector('#restaurar', { timeout: 8000 });
    const b = p.locator('[data-apontar-pasta]');
    if (!await b.count()) throw new Error('sem o convite da pasta');
    if (!/btn--forte/.test(await b.getAttribute('class'))) throw new Error('não está em destaque');
  });

  await passo('e o toque traz a leitura e os estudos de uma vez', async () => {
    await p.locator('[data-apontar-pasta]').click();
    await p.waitForTimeout(1500);
    const r = await p.evaluate(() => ({ lidos: B.plano.progressoBiblia().lidos, n: B.estudos.contar() }));
    const n = await p.evaluate(() => B.estudos.contar());
    if (r.lidos !== 3) throw new Error('lidos: ' + r.lidos);
    if (n !== 2) throw new Error('estudos: ' + n);
  });
  await ctx.close();
}

console.log('\n--- no navegador comum nada disso aparece ---');
{
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  p.on('pageerror', e => erros.push('erro de página: ' + e.message));
  await p.goto('http://127.0.0.1:8123/biblia/#/config', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1800);
  await passo('sem ponte, sem convite de pasta', async () => {
    if (await p.locator('#copia-pasta').count()) throw new Error('apareceu no navegador');
    if (await p.evaluate(() => B.copia.estadoNaPasta())) throw new Error('disse que gravou');
    if (await p.evaluate(() => B.copia.estadoDaPasta())) throw new Error('leu de algum lugar');
  });
  await ctx.close();
}

await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
