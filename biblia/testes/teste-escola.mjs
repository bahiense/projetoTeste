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
  /* Repinta à mão: ir para o hash em que já se está não dispara
     hashchange, e a tela ficaria a de antes. */
  await p.evaluate(h => { location.hash = h; if (B.app) B.app.pintar(); }, hash);
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

await passo('o cronômetro é de 40 segundos, conta e para', async () => {
  if (!/40 segundos/.test(await p.locator('#cartao-crono').innerText())) {
    throw new Error('não começa em 40: ' + await p.locator('#cartao-crono').innerText());
  }
  await p.locator('#cartao-crono').click();
  await p.waitForTimeout(1300);
  const t = await p.locator('#cartao-crono').innerText();
  if (!/3\ds/.test(t)) throw new Error('mostrou "' + t + '"');
  await p.locator('#cartao-crono').click();
  await p.waitForTimeout(200);
  if (!/40 segundos/.test(await p.locator('#cartao-crono').innerText())) {
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

await passo('e a fila de hoje abre como baralho, de verso escondido', async () => {
  await p.evaluate(() => {
    const ref = B.escola.frases('peticao')[0].ref;
    B.escola.decorar(ref);
    const f = B.escola.fila();
    f[ref].quando = '2000-01-01';
    B.store.setConfig('escolaFila', f);
  });
  await ir('#/escola/cartoes/fila');
  await p.waitForTimeout(1500);
  if (!await p.locator('.carta-frente').count()) throw new Error('não ofereceu as cartas');
  if (await p.locator('.carta-verso').isVisible()) throw new Error('mostrou o texto antes');
  await p.locator('[data-virar]').click();
  await p.waitForTimeout(300);
  const t = await p.locator('.carta-verso').innerText();
  if (t.length < 15) throw new Error('abriu vazio');
  await p.locator('[data-lembrei="sim"]').click();
  await p.waitForTimeout(400);
  if (!/lembrada|Fim do baralho|de cor/.test(await p.locator('#cartoes-corpo').innerText())) {
    throw new Error('não andou no baralho');
  }
});

console.log('\n--- flash cards ---');

await passo('o baralho de uma oração vem com as cartas do texto do app', async () => {
  await ir('#/escola/cartoes/salmo51');
  await p.waitForTimeout(1600);
  if (await p.locator('.carta-verso').isVisible()) throw new Error('o verso veio aberto');
  if (!await p.locator('.carta-frente').count()) throw new Error('sem a frente da carta');
  await p.locator('[data-virar]').click();
  await p.waitForTimeout(250);
  const verso = await p.locator('.carta-verso').innerText();
  const reais = await p.evaluate(() => B.escola.trechoTreino('salmo51')
    .then(t => t.versiculos.map(v => v.t)));
  if (!reais.some(r => verso.indexOf(r) >= 0)) throw new Error('o verso não é do texto');
  if (!await p.locator('[data-lembrei="sim"]').isVisible()) {
    throw new Error('não pediu o juízo da carta');
  }
});

await passo('e no fim pergunta pela oração inteira, mandando para a fila', async () => {
  await p.evaluate(() => B.escola.esquecerOracao('jabes'));
  await ir('#/escola/cartoes/jabes');
  await p.waitForTimeout(1500);
  for (let i = 0; i < 10; i++) {
    if (!await p.locator('[data-virar]').count()) break;
    await p.locator('[data-virar]').click();
    await p.waitForTimeout(120);
    await p.locator('[data-lembrei="sim"]').click();
    await p.waitForTimeout(160);
  }
  const t = await p.locator('#cartoes-corpo').innerText();
  if (!/consegue orar esta oração agora/i.test(t)) throw new Error('sem o juízo: ' + t.slice(0, 80));
  await p.locator('[data-juizo="certo"]').click();
  await p.waitForTimeout(500);
  if (!await p.evaluate(() => !!B.escola.filaOracoes()['jabes'])) {
    throw new Error('a oração não entrou na fila');
  }
});

await passo('as frases do cartão viram baralho, e cada uma anda a sua fila', async () => {
  await p.evaluate(() => {
    B.store.setConfig('escolaFila', {});
    B.escola.limparCartao();
    B.escola.movimentos().forEach(m => B.escola.trocarFrase(B.escola.frases(m.id)[0].ref));
  });
  await ir('#/escola/cartoes/cartao');
  await p.waitForTimeout(1600);
  const primeira = await p.locator('#cartoes-corpo .dica').first().innerText();
  if (!/1 de 5/.test(primeira)) throw new Error('não vieram as cinco frases: ' + primeira);
  await p.locator('[data-virar]').click();
  await p.waitForTimeout(200);
  await p.locator('[data-lembrei="sim"]').click();
  await p.waitForTimeout(300);
  const fila = await p.evaluate(() => B.escola.fila());
  if (Object.keys(fila).length !== 1) {
    throw new Error('a frase julgada não entrou sozinha na fila: ' + Object.keys(fila).length);
  }
});

await passo('e o cartão vazio diz o que fazer, em vez de abrir sem cartas', async () => {
  await p.evaluate(() => B.escola.limparCartao());
  await ir('#/escola/cartoes/cartao');
  await p.waitForTimeout(1200);
  const t = await p.locator('#cartoes-corpo').innerText();
  if (!/Montar a oração/.test(t)) throw new Error('não explicou: ' + t.slice(0, 80));
  if (await p.locator('[data-virar]').count()) throw new Error('abriu carta sem cartão');
});

await passo('os exercícios antigos e o treino completo não existem mais', async () => {
  await ir('#/escola/cartoes/salmo51');
  await p.waitForTimeout(1400);
  for (const q of ['tudo', 'letras', 'sumindo', 'ordem', 'completar', 'depois']) {
    if (await p.locator('[data-ex="' + q + '"]').count()) {
      throw new Error('ainda há o exercício "' + q + '"');
    }
  }
  const sumiu = await p.evaluate(() => ({
    lacunas: typeof B.escola.lacunas,
    letras: typeof B.escola.primeirasLetras,
    apagar: typeof B.escola.apagarParte,
    depois: typeof B.escola.qualVemDepois
  }));
  for (const k of Object.keys(sumiu)) {
    if (sumiu[k] !== 'undefined') throw new Error('o módulo ainda exporta ' + k);
  }
});

await passo('o endereço antigo do treino continua abrindo as cartas', async () => {
  await ir('#/escola/treino/jabes');
  await p.waitForTimeout(1400);
  if (!await p.locator('.carta-frente').count()) throw new Error('não abriu');
});

await passo('a sugestão de treino muda conforme o que você já treinou', async () => {
  const r = await p.evaluate(() => {
    /* Começa do zero: nada em treino. */
    B.store.setConfig('escolaOracoes', {});
    const primeira = B.escola.sugestaoTreino();

    /* Põe a sugerida em treino, vencendo só daqui a dias. */
    B.escola.decorarOracao(primeira.id);
    const segunda = B.escola.sugestaoTreino();

    /* E uma vencida hoje passa à frente de tudo. */
    const atrasada = B.escola.oracoes().filter(o => o.id !== primeira.id)[3];
    B.escola.decorarOracao(atrasada.id);
    const f = B.escola.filaOracoes();
    f[atrasada.id].quando = '2000-01-01';
    B.store.setConfig('escolaOracoes', f);
    const terceira = B.escola.sugestaoTreino();

    return {
      primeira: primeira, segunda: segunda, terceira: terceira,
      atrasada: atrasada.id, volta: B.escola.proximaVolta()
    };
  });
  if (!r.primeira || !r.primeira.id) throw new Error('não sugeriu nada no começo');
  if (r.segunda.id === r.primeira.id) {
    throw new Error('continuou sugerindo a mesma: ' + r.segunda.id);
  }
  if (r.terceira.id !== r.atrasada) {
    throw new Error('a vencida não passou à frente: ' + r.terceira.id);
  }
  if (!/vence hoje/.test(r.terceira.motivo)) throw new Error('motivo: ' + r.terceira.motivo);
  if (!r.volta) throw new Error('não soube dizer quando a próxima volta');
});

await passo('e o painel não tem mais botão fixo numa oração só', async () => {
  await p.evaluate(() => B.store.setConfig('escolaOracoes', {}));
  await ir('#/escola');
  /* Repinta à mão: o hash já era este, e sem troca de hash a tela não
     se redesenha sozinha. */
  await p.evaluate(() => B.app.pintar());
  await p.waitForTimeout(800);
  const sugerida = await p.evaluate(() => B.escola.sugestaoTreino().id);
  if (!await p.locator('a[href="#/escola/cartoes/' + sugerida + '"]').count()) {
    throw new Error('o botão não leva à oração sugerida');
  }
  /* Põe a sugerida em treino e repinta: a sugestão tem de trocar. */
  await p.evaluate(id => B.escola.decorarOracao(id), sugerida);
  await p.evaluate(() => B.app.pintar());
  await p.waitForTimeout(600);
  if (await p.locator('a[href="#/escola/cartoes/' + sugerida + '"]').count()) {
    throw new Error('continuou oferecendo a mesma oração');
  }
});

console.log('\n--- as orações dos estudos ---');

await passo('a oração do estudo também vira treino, partida em frases', async () => {
  const r = await p.evaluate(async () => {
    /* Um texto de estudo qualquer, pelo caminho que o app usa. */
    const t = 'Senhor, tu és santo e não mudas. Diante de Jônatas e de Davi, ' +
      'reconhecemos que a amizade vem de ti e dura. Ensina-nos a guardar a palavra ' +
      'dada, mesmo quando custa caro. Em nome de Jesus, amém.';
    const frases = B.escola.frasesDoTexto(t);
    return {
      n: frases.length,
      juntou: frases.join(' ') === t,
      curtas: frases.filter(f => f.length < 40).length
    };
  });
  if (r.n < 2) throw new Error('não partiu em frases: ' + r.n);
  if (!r.juntou) throw new Error('perdeu ou mexeu no texto ao partir');
  if (r.curtas) throw new Error(r.curtas + ' frase(s) curtas demais para treinar');
});

await passo('e o baralho dela avisa que é escrita por IA', async () => {
  const tela = await p.evaluate(() => B.telas.escola.render('cartoes/estudo:João 3'));
  if (!/Flash cards/.test(tela)) throw new Error('não abriu como baralho');
  if (/o texto é o do app/.test(tela)) throw new Error('prometeu texto bíblico');
  /* O aviso vem com as cartas, que dependem do estudo embutido: quem o
     confere na tela é a seção das orações dos estudos, mais abaixo. */
});

await passo('a fila aceita a oração do estudo, com o mesmo passo', async () => {
  const r = await p.evaluate(() => {
    const id = B.escola.ESTUDO + 'João 3';
    B.escola.esquecerOracao(id);
    B.escola.decorarOracao(id);
    B.escola.feitoOracao(id, true);
    const passo = B.escola.filaOracoes()[id].passo;
    const f = B.escola.filaOracoes();
    f[id].quando = '2000-01-01';
    B.store.setConfig('escolaOracoes', f);
    const hoje = B.escola.oracoesParaHoje().filter(x => x.id === id)[0];
    return { passo: passo, titulo: hoje && hoje.titulo, ia: hoje && hoje.ia };
  });
  if (r.passo !== 1) throw new Error('não andou: ' + r.passo);
  if (!/João 3/.test(r.titulo || '')) throw new Error('não nomeou: ' + r.titulo);
  if (!r.ia) throw new Error('não marcou como escrita por IA');
});

await passo('o painel não oferece mais o botão que levava aos jogos em geral', async () => {
  await ir('#/escola');
  await p.waitForTimeout(900);
  if (await p.locator('#tela a[href="#/jogos"]').count()) {
    throw new Error('ainda há link para a tela de jogos');
  }
  const t = await p.locator('#tela').innerText();
  if (!/orações dos estudos/i.test(t)) throw new Error('não há seção das orações dos estudos');
});

console.log('\n--- escolher orações dos estudos ---');
{
  /* Estes precisam dos estudos de verdade: a oração sai do estudo
     completo, e o dublê desta suíte responde vazio a data/estudos. */
  const ctx2 = await nav.newContext({ viewport: { width: 390, height: 844 } });
  const p2 = await ctx2.newPage();
  p2.on('pageerror', e => erros.push('erro de página: ' + e.message));
  await p2.goto('http://127.0.0.1:8123/biblia/#/escola', { waitUntil: 'domcontentloaded' });
  await p2.waitForTimeout(2200);
  const ir2 = async (hash) => {
    await p2.evaluate(h => { location.hash = h; if (B.app) B.app.pintar(); }, hash);
    await p2.waitForTimeout(900);
  };

  await passo('dá para escolher quais orações de estudo entram no baralho', async () => {
    await p2.evaluate(async () => {
      B.store.setConfig('escolaEstudos', []);
      await B.oracoes.doCapitulo('Jonas 1');
      await B.oracoes.doCapitulo('Jonas 2');
      if (!B.oracoes.estaGuardada('Jonas 1')) B.oracoes.guardar('Jonas 1');
      if (!B.oracoes.estaGuardada('Jonas 2')) B.oracoes.guardar('Jonas 2');
    });
    await ir2('#/escola');
    await p2.waitForTimeout(1500);
    const quantas = await p2.locator('[data-estudo]').count();
    if (quantas < 2) throw new Error('só ' + quantas + ' orações para escolher');

    /* Um toque marca. É aqui que se pega ouvinte duplicado, que
       marcava e desmarcava na mesma hora. */
    await p2.locator('[data-estudo]').first().click();
    await p2.waitForTimeout(700);
    if ((await p2.evaluate(() => B.escola.estudosEscolhidos())).length !== 1) {
      throw new Error('o toque não marcou (ou marcou e desmarcou)');
    }
    await p2.locator('[data-estudo]').nth(1).click();
    await p2.waitForTimeout(700);
    const marcadas = await p2.evaluate(() => B.escola.estudosEscolhidos());
    if (marcadas.length !== 2) throw new Error('marcadas: ' + marcadas.join(', '));

    await p2.locator('[data-estudo]').first().click();
    await p2.waitForTimeout(700);
    if ((await p2.evaluate(() => B.escola.estudosEscolhidos())).length !== 1) {
      throw new Error('não desmarcou');
    }
  });

  await passo('e as marcadas viram um baralho só, avisando que são de IA', async () => {
    await p2.evaluate(() => B.store.setConfig('escolaEstudos', ['Jonas 1', 'Jonas 2']));
    await ir2('#/escola/cartoes/estudos');
    await p2.waitForTimeout(1800);
    const topo = await p2.locator('#cartoes-topo').innerText();
    if (!/2 orações/.test(topo)) throw new Error('topo: ' + topo.replace(/\n/g, ' '));
    if (!/IA/.test(topo)) throw new Error('não avisou que são escritas por IA');
    const conta = await p2.locator('#cartoes-corpo .dica').first().innerText();
    if (!/1 de [2-9]/.test(conta)) throw new Error('cartas: ' + conta);
    /* E o verso é mesmo o texto daquela oração. */
    await p2.locator('[data-virar]').click();
    await p2.waitForTimeout(250);
    const verso = await p2.locator('.carta-verso').innerText();
    const oracao = await p2.evaluate(() => B.oracoes.doCapitulo('Jonas 1'));
    if (oracao.replace(/\s+/g, ' ').indexOf(verso.trim().slice(0, 40)) < 0) {
      throw new Error('o verso não é da oração: ' + verso.slice(0, 60));
    }
  });

  await ctx2.close();
}

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

await passo('e há baralho que trabalha as palavras, não só o rótulo', async () => {
  const comeco = await p.evaluate(() => B.jogos.baralhos()
    .filter(b => b.id.indexOf('orar-comeco') === 0));
  if (comeco.length < 4) throw new Error('só ' + comeco.length + ' baralhos de "como começa"');

  /* O lado b é texto bíblico de verdade: tem de bater, palavra por
     palavra, com o começo daquele versículo — na Almeida revista, que é
     a edição de onde o gerador o copiou (está dito na fonte do baralho). */
  if (!comeco.every(b => /Almeida revista/.test(b.fonte))) {
    throw new Error('o baralho não diz de que edição saiu o texto');
  }
  const fora = await p.evaluate(async () => {
    const antes = B.texto.edicaoAtual();
    B.texto.trocarEdicao('jfaal');
    const itens = B.jogos.baralhos()
      .filter(b => b.id.indexOf('orar-comeco') === 0)
      .reduce((s, b) => s.concat(b.itens), []);
    const ruins = [];
    for (const it of itens.slice(0, 10)) {
      const r = await B.escola.texto(it.ref).catch(() => null);
      if (!r) { ruins.push(it.ref + ' (sem texto)'); continue; }
      const limpo = it.b.replace(/^"|…?"$/g, '').replace(/…$/, '');
      if (r.versiculos[0].t.indexOf(limpo.slice(0, 25)) !== 0) {
        ruins.push(it.ref + ' → ' + limpo.slice(0, 30));
      }
    }
    B.texto.trocarEdicao(antes);
    return ruins;
  });
  if (fora.length) throw new Error('não é o começo do versículo: ' + fora.join(' | '));
});

await ctx.close();
await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ')
  : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
