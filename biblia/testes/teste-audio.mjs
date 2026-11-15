/* Ouvir o capítulo: a voz do aparelho lendo versículo a versículo.

   A voz é dublada — num container não há motor de fala, e mesmo onde há
   o teste não pode depender do tempo real de uma leitura. O dublê fala
   instantaneamente e avisa o fim, que é o que o app precisa saber.

   Uso: node biblia/testes/teste-audio.mjs (com o servidor de pé) */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

const voz = (demora, lang) => `(() => {
  const falados = [];
  window.__falados = falados;
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  const dublê = {
    speaking: false, paused: false,
    getVoices: () => ${lang ? `[{ name: 'Teste', lang: '${lang}' }]` : '[]'},
    addEventListener: () => {},
    speak(u) {
      falados.push({ texto: u.text, rate: u.rate, lang: u.lang });
      this.speaking = true;
      setTimeout(() => { this.speaking = false; if (u.onend) u.onend(); }, ${demora});
    },
    cancel() { this.speaking = false; this.paused = false; },
    pause() { this.paused = true; },
    resume() { this.paused = false; }
  };
  /* window.speechSynthesis é só leitura: tem de ser redefinido. */
  Object.defineProperty(window, 'speechSynthesis', { value: dublê, configurable: true });
})();`;

const abrir = async (init, ref) => {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(init);
  const p = await ctx.newPage();
  p.on('pageerror', e => erros.push('erro de página: ' + e.message));
  await p.goto('http://127.0.0.1:8123/biblia/#/ler/' + encodeURIComponent(ref),
    { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1800);
  return { ctx, p };
};

console.log('\n--- ouvir o capítulo ---');
{
  /* 400ms por versículo: devagar o bastante para o teste tocar nos
     botões no meio da leitura, rápido o bastante para a suíte não
     virar uma espera de minuto. */
  const { ctx, p } = await abrir(voz(400, 'pt-BR'), 'Jonas 1');

  await passo('o botão existe quando o aparelho tem voz', async () => {
    if (!/Ouvir/.test(await p.locator('[data-ouvir]').innerText())) throw new Error('sem botão');
    if (!await p.locator('#audio-barra').isHidden()) throw new Error('a barra já estava aberta');
  });

  await passo('lê versículo a versículo, na ordem, e destaca o da vez', async () => {
    await p.locator('[data-ouvir]').click();
    await p.waitForTimeout(900);
    const f = await p.evaluate(() => window.__falados.map(x => x.texto));
    if (f.length < 2) throw new Error('falou ' + f.length);
    if (!/E veiu a palavra do Senhor a Jonas/.test(f[0])) throw new Error(f[0].slice(0, 60));
    if (await p.locator('.v.is-lendo').count() !== 1) throw new Error('nenhum versículo destacado');
  });

  await passo('a barra diz onde está e deixa pausar', async () => {
    const t = await p.locator('#audio-barra').innerText();
    if (!/Versículo \d+ de 17/.test(t)) throw new Error(t.replace(/\n/g, ' | '));
    await p.locator('[data-audio-pausa]').click();
    await p.waitForTimeout(300);
    if (!/Continuar/.test(await p.locator('#audio-barra').innerText())) throw new Error('não pausou');
    const antes = await p.evaluate(() => window.__falados.length);
    await p.waitForTimeout(600);
    const depois = await p.evaluate(() => window.__falados.length);
    if (depois > antes) throw new Error('continuou falando pausado');
  });

  await passo('e continuar vai até o fim do capítulo', async () => {
    await p.locator('[data-audio-pausa]').click();
    await p.waitForTimeout(8000);
    const f = await p.evaluate(() => window.__falados.length);
    if (f !== 17) throw new Error('falou ' + f + ' de 17');
    if (!/Ouvir/.test(await p.locator('[data-ouvir]').innerText())) throw new Error('não voltou ao início');
    if (!await p.locator('#audio-barra').isHidden()) throw new Error('a barra ficou aberta');
    if (await p.locator('.v.is-lendo').count()) throw new Error('ficou versículo destacado');
  });

  await passo('a velocidade escolhida vale para os próximos versículos', async () => {
    await p.evaluate(() => { window.__falados.length = 0; });
    await p.locator('[data-ouvir]').click();
    await p.waitForTimeout(300);
    await p.locator('[data-audio-vel="1.5"]').click();
    await p.waitForTimeout(900);
    const taxas = await p.evaluate(() => window.__falados.map(x => x.rate));
    if (taxas[taxas.length - 1] !== 1.5) throw new Error('taxas: ' + taxas.join(', '));
    if (await p.evaluate(() => B.audio.velocidade()) !== 1.5) throw new Error('não guardou');
  });

  await passo('parar cala na hora', async () => {
    /* A leitura está em curso desde o passo anterior: o botão agora é o
       de parar. */
    if (!/Parar/.test(await p.locator('[data-ouvir]').innerText())) {
      await p.locator('[data-ouvir]').click();
      await p.waitForTimeout(300);
    }
    await p.locator('[data-ouvir]').click();
    await p.waitForTimeout(200);
    const antes = await p.evaluate(() => window.__falados.length);
    await p.waitForTimeout(900);
    if (await p.evaluate(() => window.__falados.length) !== antes) throw new Error('continuou');
    if (await p.evaluate(() => B.audio.estado().lendo)) throw new Error('continuou lendo');
  });

  await passo('sair do capítulo cala também', async () => {
    await p.locator('[data-ouvir]').click();
    await p.waitForTimeout(500);
    await p.evaluate(() => { location.hash = '#/hoje'; });
    await p.waitForTimeout(500);
    const antes = await p.evaluate(() => window.__falados.length);
    await p.waitForTimeout(600);
    if (await p.evaluate(() => window.__falados.length) !== antes) {
      throw new Error('a voz seguiu sozinha fora da leitura');
    }
    if (await p.evaluate(() => B.audio.estado().lendo)) throw new Error('ficou lendo');
  });

  await ctx.close();
}

console.log('\n--- quando o aparelho não ajuda ---');
{
  const { ctx, p } = await abrir(voz(60, null), 'Jonas 1');
  await passo('sem voz em português, lê assim mesmo e avisa', async () => {
    if (await p.evaluate(() => B.audio.temVozPortugues())) throw new Error('achou voz onde não há');
    await p.locator('[data-ouvir]').click();
    await p.waitForTimeout(400);
    if (!await p.evaluate(() => window.__falados.length)) throw new Error('não leu');
    const t = await p.locator('#toast').innerText();
    if (!/português/i.test(t)) throw new Error('não avisou: ' + t);
  });
  await ctx.close();
}

{
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(`Object.defineProperty(window, 'speechSynthesis',
    { value: undefined, configurable: true });`);
  const p = await ctx.newPage();
  p.on('pageerror', e => erros.push('erro de página: ' + e.message));
  await p.goto('http://127.0.0.1:8123/biblia/#/ler/' + encodeURIComponent('Jonas 1'),
    { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1500);
  await passo('sem leitura em voz alta no aparelho, o botão nem aparece', async () => {
    if (await p.locator('[data-ouvir]').count()) throw new Error('ofereceu o que não há');
    if (!await p.locator('.texto .v').count()) throw new Error('e a leitura normal quebrou');
  });
  await ctx.close();
}

console.log('\n--- dentro do app, onde o WebView não tem voz de navegador ---');
{
  /* O WebView do Android não traz o speechSynthesis: quem fala é a ponte
     nativa, ligada ao TextToSpeech do sistema. */
  const comoNoApk = `(() => {
    Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true });
    window.SpeechSynthesisUtterance = undefined;
    const falados = []; window.__falados = falados;
    window.AndroidVoz = {
      existe: () => true, pronta: () => true, temPortugues: () => true,
      falar(texto, id, vel) {
        falados.push({ texto: texto, id: id, vel: vel });
        setTimeout(() => window.B.audio.__fimNativo(id, 'fim'), 250);
        return true;
      },
      parar() { return true; }
    };
    window.AndroidArquivo = { manterAcordado: () => true };
  })();`;

  const { ctx, p } = await abrir(comoNoApk, 'Jonas 1');

  await passo('o botão aparece no app, pela voz do sistema', async () => {
    if (!await p.locator('[data-ouvir]').count()) throw new Error('sem botão no app');
    if (await p.evaluate(() => typeof speechSynthesis !== 'undefined')) {
      throw new Error('o teste não está simulando o WebView');
    }
    if (!await p.evaluate(() => B.audio.disponivel())) throw new Error('disse que não há voz');
  });

  await passo('e lê versículo a versículo pela ponte nativa', async () => {
    await p.locator('[data-ouvir]').click();
    await p.waitForTimeout(800);
    const f = await p.evaluate(() => window.__falados.map(x => x.texto));
    if (f.length < 2) throw new Error('falou ' + f.length);
    if (!/E veiu a palavra do Senhor a Jonas/.test(f[0])) throw new Error(f[0].slice(0, 50));
    if (await p.locator('.v.is-lendo').count() !== 1) throw new Error('não destacou');
    const vel = await p.evaluate(() => window.__falados[0].vel);
    if (!vel) throw new Error('não mandou a velocidade para o motor');
  });

  await passo('aviso de frase velha, chegando atrasado, não embaralha a leitura', async () => {
    const antes = await p.evaluate(() => window.__falados.length);
    await p.evaluate(() => B.audio.__fimNativo('999', 'fim'));
    await p.waitForTimeout(100);
    if (await p.evaluate(() => window.__falados.length) !== antes) {
      throw new Error('pulou versículo por causa de um aviso velho');
    }
  });

  await passo('o trecho bíblico do estudo também tem o botão', async () => {
    await p.evaluate(() => B.audio.parar());
    await p.evaluate(() => {
      location.hash = '#/estudo/' + encodeURIComponent('Jeremias 27') + '/completo';
    });
    await p.evaluate(() => B.app.pintar());
    await p.waitForTimeout(2200);
    if (!await p.locator('[data-ouvir-bloco]').count()) throw new Error('sem botão no estudo');
    await p.evaluate(() => { window.__falados.length = 0; });
    await p.locator('[data-ouvir-bloco]').first().click();
    await p.waitForTimeout(900);
    const f = await p.evaluate(() => window.__falados.map(x => x.texto));
    if (f.length < 2) throw new Error('falou ' + f.length);
    if (!/No principio do reinado/.test(f[0])) throw new Error(f[0].slice(0, 50));
    if (await p.locator('.bloco-versos-inline').first().isHidden()) {
      throw new Error('não abriu o quadro do texto');
    }
    if (!await p.locator('.v-bloco-item.is-lendo').count()) throw new Error('não destacou no bloco');
    if (!/Parar/.test(await p.locator('[data-ouvir-bloco]').first().innerText())) {
      throw new Error('o botão não virou "parar"');
    }
  });

  await passo('e sair do estudo cala a voz', async () => {
    await p.evaluate(() => { location.hash = '#/hoje'; });
    await p.waitForTimeout(600);
    const antes = await p.evaluate(() => window.__falados.length);
    await p.waitForTimeout(700);
    if (await p.evaluate(() => window.__falados.length) !== antes) throw new Error('seguiu falando');
  });

  await ctx.close();
}

await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
