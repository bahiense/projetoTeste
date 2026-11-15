/* A escola de oração: as orações da Bíblia, o cartão de condução e a
   decoração das frases.

   O que esta suíte guarda com mais cuidado é a honestidade do material:
   toda palavra bíblica mostrada tem de vir do texto que o app tem, e a
   fronteira com as orações escritas por IA tem de estar dita na tela.

   Uso: node biblia/testes/teste-escola.mjs (com o servidor de pé) */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { semEmbutidos, juntar } from './comum.mjs';

const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => {
  try { await fn(); console.log('  ✓ ' + n); }
  catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); }
};

const vozDublê = `(() => {
  const falados = [];
  window.__falados = falados;
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  const d = {
    speaking: false, paused: false,
    getVoices: () => [{ name: 'pt-br-x-ptd#male_1-local', lang: 'pt-BR' }],
    addEventListener: () => {},
    speak(u) {
      falados.push(u.text);
      setTimeout(() => { if (u.onend) u.onend(); }, 150);
    },
    cancel() {}, pause() {}, resume() {}
  };
  Object.defineProperty(window, 'speechSynthesis', { value: d, configurable: true });
})();`;

const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript(juntar(semEmbutidos, vozDublê));
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
const ir = async (hash) => {
  await p.evaluate(h => { location.hash = h; }, hash);
  await p.waitForTimeout(700);
};

await p.goto('http://127.0.0.1:8123/biblia/#/escola', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1800);

console.log('\n--- o material ---');

await passo('as orações e as frases chegaram conferidas', async () => {
  const r = await p.evaluate(() => B.escola.resumo());
  if (r.oracoes < 50) throw new Error('só ' + r.oracoes + ' orações');
  if (r.frases < 40) throw new Error('só ' + r.frases + ' frases');
  const movs = await p.evaluate(() => B.escola.movimentos().map(m => m.id));
  if (movs.join(',') !== 'adoracao,confissao,gratidao,peticao,intercessao') {
    throw new Error('movimentos: ' + movs.join(','));
  }
  /* Movimento sem frase deixaria uma coluna vazia na tela. */
  const vazios = await p.evaluate(() =>
    B.escola.movimentos().filter(m => !B.escola.frases(m.id).length).map(m => m.id));
  if (vazios.length) throw new Error('sem frases: ' + vazios.join(','));
});

await passo('nenhuma palavra bíblica vem do arquivo de dados', async () => {
  /* O gerado guarda referência, não texto: é o que garante que a tela
     mostre a edição que a pessoa está lendo, e não uma cópia nossa. */
  const sobra = await p.evaluate(() => {
    const campos = new Set();
    (B.oracoesDados.oracoes || []).forEach(o => Object.keys(o).forEach(k => campos.add(k)));
    (B.oracoesDados.frases || []).forEach(f => Object.keys(f).forEach(k => campos.add(k)));
    return [...campos];
  });
  for (const proibido of ['texto', 'versiculos', 'trecho']) {
    if (sobra.includes(proibido)) throw new Error('o dado traz "' + proibido + '"');
  }
});

await passo('o texto mostrado é o do próprio app', async () => {
  const r = await p.evaluate(() => B.escola.texto('MAT 6.9-13'));
  if (r.versiculos.length !== 5) throw new Error('vieram ' + r.versiculos.length + ' versículos');
  /* A de 1911 escreve "sanctificado"; a revista, "santificado". */
  if (!/san(c)?tificado seja o teu nome/i.test(r.versiculos[0].t)) {
    throw new Error(r.versiculos[0].t.slice(0, 60));
  }
  if (r.versiculos[0].n !== 9) throw new Error('começou no versículo ' + r.versiculos[0].n);
  const esperado = await p.evaluate(() =>
    B.texto.capituloOuReserva('Mateus', 6).then(x => x.versiculos[8]));
  if (r.versiculos[0].t !== esperado) throw new Error('não é o texto da tela de leitura');
});

await passo('e a tela diz que estas orações são da Escritura, não de IA', async () => {
  const t = await p.locator('#tela').innerText();
  if (!/escritas por IA/i.test(t)) throw new Error('não separou das orações dos estudos');
  if (!/própria Bíblia|própria Escritura/i.test(t)) throw new Error('não disse de onde vêm');
});

console.log('\n--- o cartão de condução ---');

await passo('escolher uma frase põe no cartão', async () => {
  await p.locator('[data-mov="adoracao"] summary').click();
  await p.waitForTimeout(300);
  const f = p.locator('[data-mov="adoracao"] [data-frase]').first();
  const texto = await f.locator('.frase-texto').innerText();
  if (texto.length < 10 || /^…$/.test(texto)) throw new Error('a frase ficou sem texto');
  await f.click();
  await p.waitForTimeout(200);
  if (!await p.locator('[data-mov="adoracao"] [data-frase].is-on').count()) {
    throw new Error('não marcou');
  }
  if ((await p.evaluate(() => B.escola.cartao())).length !== 1) throw new Error('não guardou');
});

await passo('e a segunda frase do mesmo movimento troca a primeira', async () => {
  const refs = await p.evaluate(() => B.escola.frases('adoracao').map(f => f.ref));
  await p.locator('[data-frase="' + refs[1] + '"]').click();
  await p.waitForTimeout(200);
  const c = await p.evaluate(() => B.escola.cartao());
  if (c.length !== 1) throw new Error('ficaram ' + c.length + ' de adoração');
  if (c[0] !== refs[1]) throw new Error('trocou pela errada');
});

await passo('o cartão sai nos cinco movimentos, na ordem', async () => {
  await p.evaluate(() => {
    B.escola.limparCartao();
    B.escola.movimentos().forEach(m => B.escola.trocarFrase(B.escola.frases(m.id)[0].ref));
  });
  const ordem = await p.evaluate(() =>
    B.escola.cartaoPronto().map(x => x.movimento.id));
  if (ordem.join(',') !== 'adoracao,confissao,gratidao,peticao,intercessao') {
    throw new Error('ordem: ' + ordem.join(','));
  }
});

await passo('e a tela cheia mostra cinco linhas com texto de verdade', async () => {
  await ir('#/escola/cartao');
  await p.waitForTimeout(900);
  const linhas = p.locator('.cartao-linha');
  if (await linhas.count() !== 5) throw new Error('vieram ' + await linhas.count() + ' linhas');
  const primeira = await linhas.first().locator('.cartao-frase').innerText();
  if (primeira.length < 15) throw new Error('linha sem texto: ' + primeira);
  if (!/Salmo|Apocalipse|Isaías|Crônicas|Jeremias/.test(await linhas.first().innerText())) {
    throw new Error('a linha não traz a referência');
  }
  if (!/Não leia/.test(await p.locator('.cartao-aviso').innerText())) {
    throw new Error('não avisou que é para olhar de relance, não ler');
  }
});

await passo('o cronômetro conta e para', async () => {
  await p.locator('#cartao-crono').click();
  await p.waitForTimeout(1300);
  const t = await p.locator('#cartao-crono').innerText();
  if (!/8\ds/.test(t)) throw new Error('mostrou "' + t + '"');
  await p.locator('#cartao-crono').click();
  await p.waitForTimeout(200);
  if (!/90 segundos/.test(await p.locator('#cartao-crono').innerText())) {
    throw new Error('não voltou ao início');
  }
});

await passo('e a voz lê o cartão linha por linha', async () => {
  await p.evaluate(() => { window.__falados.length = 0; });
  await p.locator('#cartao-ouvir').click();
  await p.waitForTimeout(200);
  /* Enquanto ainda lê: depois do fim não há destaque, e é assim que deve ser. */
  if (!await p.locator('.cartao-linha.is-lendo').count()) throw new Error('não destacou');
  await p.waitForTimeout(700);
  const f = await p.evaluate(() => window.__falados);
  if (f.length < 3) throw new Error('falou ' + f.length + ' linhas');
  await p.evaluate(() => B.audio.parar());
});

console.log('\n--- uma oração da Bíblia ---');

await passo('abre com texto, nota e a edição dita', async () => {
  await ir('#/escola/daniel9');
  await p.waitForTimeout(1200);
  const t = await p.locator('#tela').innerText();
  if (!/Daniel/.test(t)) throw new Error('não abriu Daniel 9');
  if (!/é a justiça|a justi[çc]a/i.test(t)) throw new Error('sem o texto');
  if (!/texto:/i.test(t)) throw new Error('não disse em que edição está');
  const vv = await p.locator('.v-oracao').count();
  if (vv !== 16) throw new Error('vieram ' + vv + ' versículos (esperado 16)');
});

await passo('e ouvir lê os versículos da oração', async () => {
  await p.evaluate(() => { window.__falados.length = 0; });
  await p.locator('#oracao-ouvir').click();
  await p.waitForTimeout(700);
  if ((await p.evaluate(() => window.__falados.length)) < 2) throw new Error('não leu');
  if (!await p.locator('.v-oracao.is-lendo').count()) throw new Error('não destacou');
  await p.evaluate(() => B.audio.parar());
});

await passo('o filtro por ocasião mostra só as da ocasião', async () => {
  await ir('#/escola');
  await p.waitForTimeout(900);
  await p.locator('[data-uso="enfermo"]').click();
  await p.waitForTimeout(300);
  const itens = await p.locator('#escola-lista .orar-item').count();
  const esperado = await p.evaluate(() => B.escola.porUso('enfermo').length);
  if (!esperado) throw new Error('o dado não tem oração para doente');
  if (itens !== esperado) throw new Error('mostrou ' + itens + ' de ' + esperado);
  await p.locator('[data-uso=""]').click();
  await p.waitForTimeout(300);
  const todas = await p.locator('#escola-lista .orar-item').count();
  if (todas <= itens) throw new Error('o filtro "todas" não voltou');
});

console.log('\n--- decorar as frases ---');

await passo('a fila anda 1, 7 e 30 dias, e errar volta ao começo', async () => {
  const r = await p.evaluate(() => {
    const ref = B.escola.frases('confissao')[0].ref;
    B.escola.esquecer(ref);
    B.escola.decorar(ref);
    const passos = [];
    /* Força o vencimento para hoje a cada volta, senão nada vence. */
    const vencer = () => {
      const f = B.escola.fila();
      f[ref].quando = '2000-01-01';
      B.store.setConfig('escolaFila', f);
    };
    vencer(); B.escola.feito(ref, true); passos.push(B.escola.fila()[ref].passo);
    vencer(); B.escola.feito(ref, true); passos.push(B.escola.fila()[ref].passo);
    vencer(); B.escola.feito(ref, false); passos.push(B.escola.fila()[ref].passo);
    return { passos: passos, PASSOS: B.escola.PASSOS, firme: !!B.escola.fila()[ref].firme };
  });
  if (r.PASSOS.join(',') !== '1,7,30') throw new Error('passos: ' + r.PASSOS.join(','));
  if (r.passos.join(',') !== '1,2,0') throw new Error('andou: ' + r.passos.join(','));
  if (!r.firme) throw new Error('não marcou a frase como firme ao chegar ao fim');
});

await passo('e a tela de revisão pede a frase antes de mostrar', async () => {
  await p.evaluate(() => {
    const ref = B.escola.frases('peticao')[0].ref;
    B.escola.decorar(ref);
    const f = B.escola.fila();
    f[ref].quando = '2000-01-01';
    B.store.setConfig('escolaFila', f);
  });
  await ir('#/escola/decorar');
  await p.waitForTimeout(600);
  if (!await p.locator('#decorar-abrir').count()) throw new Error('não ofereceu a revisão');
  if (await p.locator('#decorar-texto').isVisible()) throw new Error('mostrou o texto antes');
  await p.locator('#decorar-abrir').click();
  await p.waitForTimeout(800);
  const t = await p.locator('#decorar-texto').innerText();
  if (t.length < 15) throw new Error('abriu vazio');
  await p.locator('[data-juizo="certo"]').click();
  await p.waitForTimeout(500);
  const sobrou = await p.locator('#tela').innerText();
  if (!/(1 de|terminada)/.test(sobrou)) throw new Error('não andou na fila');
});

console.log('\n--- os jogos das orações ---');

await passo('o tema entrou nos jogos, conferido como os outros', async () => {
  const b = await p.evaluate(() => B.jogos.baralhos()
    .filter(x => x.tema === 'As orações da Bíblia')
    .map(x => ({ id: x.id, n: x.itens.length, modos: B.jogos.modos(x).map(m => m.id) })));
  if (b.length < 10) throw new Error('só ' + b.length + ' baralhos de oração');
  for (const x of b) {
    if (x.n < 3) throw new Error(x.id + ' tem ' + x.n + ' itens');
    if (!x.modos.includes('relampago')) throw new Error(x.id + ' não aceita relâmpago');
  }
  /* Toda referência dos itens tem de abrir texto de verdade. */
  const ruins = await p.evaluate(async () => {
    const itens = B.jogos.baralhos()
      .filter(x => x.tema === 'As orações da Bíblia')
      .reduce((s, x) => s.concat(x.itens), []);
    const fora = [];
    for (const it of itens.slice(0, 12)) {
      const r = await B.escola.texto(it.ref).catch(() => null);
      if (!r || !r.versiculos.length || !r.versiculos[0].t) fora.push(it.ref);
    }
    return fora;
  });
  if (ruins.length) throw new Error('referências sem texto: ' + ruins.join(', '));
});

await ctx.close();
await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ')
  : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
