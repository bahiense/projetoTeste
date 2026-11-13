/* Uma edição carregada pelo próprio leitor: entra, é lida, sobrevive a
   recarregar, não vai no backup e sai quando se manda apagar.

   O arquivo de teste é montado na hora a partir do texto de domínio
   público que já vem no app — nada licenciado entra aqui.

   Uso: node biblia/testes/teste-edicao-propria.mjs (com o servidor de pé) */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

/* Rute e Judas, em "Livro cap:versículo texto", com o texto de 1911. */
const raiz = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const linhas = [];
for (const [arq, nome] of [['08', 'Rute'], ['65', 'Judas']]) {
    const d = JSON.parse(fs.readFileSync(path.join(raiz, 'data/texto/1911', arq + '.json'), 'utf8'));
    d.caps.forEach((c, i) => c.forEach((v, j) => linhas.push(nome + ' ' + (i + 1) + ':' + (j + 1) + ' ' + v)));
}
const arquivo = path.join(os.tmpdir(), 'edicao-de-teste.txt');
fs.writeFileSync(arquivo, linhas.join('\n'));
const versiculosRute = JSON.parse(fs.readFileSync(path.join(raiz, 'data/texto/1911/08.json'), 'utf8')).caps[0].length;

const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
await p.goto('http://127.0.0.1:8123/biblia/#/config', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1600);

const ir = async (rota) => {
  await p.evaluate((r) => { location.hash = '#/' + r; }, rota);
  await p.evaluate(() => B.app.pintar());
  await p.waitForTimeout(500);
};

console.log('\n--- antes de carregar nada ---');
await passo('Ajustes oferece só as duas edições em domínio público', async () => {
  const ops = await p.locator('#edicao option').allInnerTexts();
  if (ops.length !== 2) throw new Error(ops.join(' | '));
});

await passo('e o cartão explica que o que entrar fica só no aparelho', async () => {
  const t = await p.locator('#edicao-arquivo').locator('xpath=ancestor::section[1]').innerText();
  if (!/só neste aparelho/i.test(t)) throw new Error(t.slice(0, 200));
  if (!/não entra no backup/i.test(t)) throw new Error('não avisa sobre o backup');
});

console.log('\n--- carregando o arquivo ---');
await passo('o arquivo entra e a edição passa a ser a escolhida', async () => {
  await p.locator('#edicao-arquivo').setInputFiles(arquivo);
  await p.waitForTimeout(1500);
  const ed = await p.evaluate(() => B.texto.edicaoAtual());
  if (!/^propria:/.test(ed)) throw new Error('edição atual: ' + ed);
  const ops = await p.locator('#edicao option').allInnerTexts();
  if (ops.length !== 3) throw new Error(ops.join(' | '));
});

await passo('o resumo diz quantos livros e versículos entraram', async () => {
  const t = await p.locator('#edicao-arquivo').locator('xpath=ancestor::section[1]').innerText();
  if (!/2 livros/.test(t)) throw new Error(t.slice(0, 300));
});

await passo('a leitura mostra o texto carregado, não o do app', async () => {
  await ir('ler/Rute 1');
  await p.waitForSelector('#texto .v', { timeout: 10000 });
  const n = await p.locator('#texto .v').count();
  if (n !== versiculosRute) throw new Error('versículos: ' + n + ', esperava ' + versiculosRute);
});

await passo('e o crédito diz de onde esse texto veio', async () => {
  const t = await p.locator('.creditos').innerText();
  if (!/só aqui|neste aparelho/i.test(t)) throw new Error(t.slice(0, 200));
});

await passo('livro que não veio no arquivo avisa, em vez de ficar em branco', async () => {
  await ir('ler/João 3');
  await p.waitForTimeout(900);
  const t = await p.locator('#tela').innerText();
  if (!/não tem João|Troque de edição/i.test(t)) throw new Error(t.slice(0, 300));
});

console.log('\n--- o mesmo, mas em JSON ---');
await passo('arquivo JSON no formato dos repositórios de Bíblia também entra', async () => {
  const d = JSON.parse(fs.readFileSync(path.join(raiz, 'data/texto/1911/65.json'), 'utf8'));
  const json = path.join(os.tmpdir(), 'edicao-de-teste.json');
  /* Nome em inglês de propósito: muito arquivo em português vem assim. */
  fs.writeFileSync(json, JSON.stringify([{ abbrev: 'jd', name: 'Jude', chapters: d.caps }]));
  await ir('config');
  await p.locator('#edicao-arquivo').setInputFiles(json);
  await p.waitForTimeout(1500);
  const t = await p.locator('#edicao-arquivo').locator('xpath=ancestor::section[1]').innerText();
  if (!/1 livros?/.test(t)) throw new Error(t.slice(0, 300));
  await ir('ler/Judas 1');
  await p.waitForSelector('#texto .v', { timeout: 10000 });
  const n = await p.locator('#texto .v').count();
  if (n !== d.caps[0].length) throw new Error('versículos: ' + n);
  fs.unlinkSync(json);
});

await passo('as duas edições convivem, cada uma com os seus livros', async () => {
  await ir('config');
  const n = await p.locator('.edicao-guardada').count();
  if (n !== 2) throw new Error('edições guardadas: ' + n);
  /* A de Judas está em uso; Rute pertence à outra, e não aparece nela. */
  await ir('ler/Rute 1');
  await p.waitForTimeout(900);
  const t = await p.locator('#tela').innerText();
  if (!/não tem Rute|Troque de edição/i.test(t)) throw new Error(t.slice(0, 200));
});

await passo('e trocar de edição no seletor volta ao texto da outra', async () => {
  await ir('config');
  /* A primeira carregada é a do .txt, que tem Rute. */
  const id = await p.evaluate(() => B.edicaoPropria.listaAgora()[0].id);
  await p.evaluate((v) => { B.texto.trocarEdicao(v); }, 'propria:' + id);
  await ir('ler/Rute 1');
  await p.waitForSelector('#texto .v', { timeout: 10000 });
  const n = await p.locator('#texto .v').count();
  if (n !== versiculosRute) throw new Error('Rute 1 com ' + n + ' versículos');
});

await passo('apagar uma não derruba a outra', async () => {
  await ir('config');
  await p.locator('[data-apagar-edicao]').first().click();
  await p.waitForTimeout(400);
  await p.locator('#modal-pe button', { hasText: 'Apagar' }).click();
  await p.waitForTimeout(900);
  const n = await p.locator('.edicao-guardada').count();
  if (n !== 1) throw new Error('sobrou(aram) ' + n);
  /* A apagada estava em uso: o app tem de cair numa edição que existe. */
  const ed = await p.evaluate(() => B.texto.edicaoAtual());
  if (ed !== '1911') throw new Error('ficou apontando para o que não existe: ' + ed);
  const id = await p.evaluate(() => B.edicaoPropria.listaAgora()[0].id);
  await p.evaluate((v) => { B.texto.trocarEdicao(v); }, 'propria:' + id);
});

console.log('\n--- dentro do estudo ---');
await passo('o texto bíblico do estudo sai da edição carregada, não da Almeida', async () => {
  /* Depois do passo anterior, a edição em uso é a do JSON, que tem Judas. */
  const r = await p.evaluate(() => B.texto.capituloOuReserva('Judas', 1));
  if (r.reserva) throw new Error('usou a reserva sem precisar');
  if (!/sua cópia/.test(r.edicao.curto)) throw new Error(r.edicao.curto);
});

await passo('e quando ela não tem o livro, cai na Almeida dizendo que caiu', async () => {
  const r = await p.evaluate(() => B.texto.capituloOuReserva('João', 3));
  if (!r.reserva) throw new Error('não avisou que era reserva');
  if (!/Almeida/.test(r.edicao.nome)) throw new Error(r.edicao.nome);
  if (r.versiculos.length !== 36) throw new Error('João 3 com ' + r.versiculos.length);
  const ed = await p.evaluate(() => B.store.get().config.edicao);
  if (!/^propria:/.test(ed)) throw new Error('a reserva mudou a edição escolhida: ' + ed);
});

await passo('e o versículo no estudo não fica menor que a prosa em volta', async () => {
  const tam = await p.evaluate(() => {
    const caixa = document.createElement('div');
    caixa.className = 'prosa';
    caixa.innerHTML = '<p class="v-bloco-item">versículo</p><p>prosa do estudo</p>';
    document.body.appendChild(caixa);
    const [verso, prosa] = caixa.querySelectorAll('p');
    const m = (el) => parseFloat(getComputedStyle(el).fontSize);
    const r = { verso: m(verso), prosa: m(prosa) };
    caixa.remove();
    return r;
  });
  if (tam.verso < tam.prosa) throw new Error(JSON.stringify(tam));
});

console.log('\n--- o que fica e o que não viaja ---');
await passo('sobrevive a fechar e abrir o app', async () => {
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1800);
  const ed = await p.evaluate(() => B.texto.edicaoAtual());
  if (!/^propria:/.test(ed)) throw new Error('depois de recarregar: ' + ed);
});

await passo('o texto não entra no backup', async () => {
  const b = await p.evaluate(() => JSON.stringify(B.store.paraBackup([])));
  if (/misericórdia|Enoch|caps|versículo/i.test(b)) throw new Error('achei texto no backup');
  if (b.length > 200000) throw new Error('backup grande demais: ' + b.length);
});

await passo('e sai do aparelho quando se manda apagar', async () => {
  await ir('config');
  await p.locator('[data-apagar-edicao]').first().click();
  await p.waitForTimeout(400);
  await p.locator('#modal-pe button', { hasText: 'Apagar' }).click();
  await p.waitForTimeout(900);
  const ed = await p.evaluate(() => B.texto.edicaoAtual());
  if (ed !== '1911') throw new Error('edição depois de apagar: ' + ed);
  const sobrou = await p.evaluate(() => B.edicaoPropria.lista());
  if (sobrou.length) throw new Error('ficou guardado: ' + sobrou.length);
});

await passo('e a leitura volta ao texto do app', async () => {
  await ir('ler/João 3');
  await p.waitForSelector('#texto .v', { timeout: 10000 });
  const t = await p.locator('#texto .v').first().innerText();
  if (!/Nicodemos/.test(t)) throw new Error(t.slice(0, 120));
  const n = await p.locator('#texto .v').count();
  if (n !== 36) throw new Error('João 3 com ' + n + ' versículos');
});

await ctx.close();
await nav.close();
fs.unlinkSync(arquivo);
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
