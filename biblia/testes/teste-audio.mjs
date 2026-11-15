/* Ouvir o capítulo: a voz do aparelho lendo versículo a versículo.

   A voz é dublada — num container não há motor de fala, e mesmo onde há
   o teste não pode depender do tempo real de uma leitura. O dublê fala
   instantaneamente e avisa o fim, que é o que o app precisa saber.

   Uso: node biblia/testes/teste-audio.mjs (com o servidor de pé) */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

/* Os nomes são os que o motor do Google usa de verdade — é deles que o
   app tira o sexo da voz, porque nem o Android nem o navegador informam
   isso. A terceira não diz nada, de propósito: é o caso em que a tela
   não pode inventar rótulo. */
const VOZES_PT = [
  { name: 'pt-br-x-ptd#male_1-local', lang: 'pt-BR' },
  { name: 'pt-br-x-afs#female_2-local', lang: 'pt-BR' },
  { name: 'Luciana', lang: 'pt-BR' }
];

const voz = (demora, lang) => `(() => {
  const falados = [];
  window.__falados = falados;
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  const dublê = {
    speaking: false, paused: false,
    getVoices: () => ${lang === 'pt-BR' ? JSON.stringify(VOZES_PT)
      : (lang ? `[{ name: 'Teste', lang: '${lang}' }]` : '[]')},
    addEventListener: () => {},
    speak(u) {
      falados.push({ texto: u.text, rate: u.rate, lang: u.lang,
                     voz: u.voice && u.voice.name });
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

  await passo('a barra oferece todas as velocidades', async () => {
    await p.evaluate(() => { window.__falados.length = 0; });
    await p.locator('[data-ouvir]').click();
    await p.waitForTimeout(300);
    const vs = await p.locator('#audio-barra [data-audio-vel]').evaluateAll(
      els => els.map(e => parseFloat(e.getAttribute('data-audio-vel'))));
    const esperadas = await p.evaluate(() => B.audio.VELOCIDADES);
    if (vs.join(',') !== esperadas.join(',')) throw new Error('ofereceu: ' + vs.join(','));
    if (vs.length < 5) throw new Error('poucas velocidades: ' + vs.length);
  });

  await passo('e a escolhida vale na hora, no versículo em curso', async () => {
    /* O dublê gasta 400 ms por frase: se uma frase nova sai em 150 ms,
       foi porque a troca de velocidade recomeçou o versículo. */
    const antes = await p.evaluate(() => window.__falados.length);
    await p.locator('[data-audio-vel="1.75"]').click();
    await p.waitForTimeout(150);
    const falados = await p.evaluate(() => window.__falados);
    if (falados.length <= antes) throw new Error('esperou o próximo versículo');
    if (falados[falados.length - 1].rate !== 1.75) {
      throw new Error('taxa: ' + falados[falados.length - 1].rate);
    }
    if (falados[falados.length - 1].texto !== falados[antes - 1].texto) {
      throw new Error('trocou de versículo em vez de repetir o atual');
    }
    if (await p.evaluate(() => B.audio.velocidade()) !== 1.75) throw new Error('não guardou');
    if (!await p.locator('[data-audio-vel="1.75"].is-on').count()) {
      throw new Error('não marcou qual está em uso');
    }
    await p.locator('[data-audio-vel="1"]').click();
    await p.waitForTimeout(100);
  });

  await passo('e os Ajustes guardam a velocidade sem precisar estar lendo', async () => {
    await p.evaluate(() => B.audio.parar());
    await p.evaluate(() => { location.hash = '#/config'; });
    await p.waitForTimeout(700);
    await p.locator('#voz-vels [data-audio-vel="1.25"]').click();
    await p.waitForTimeout(100);
    if (await p.evaluate(() => B.audio.velocidade()) !== 1.25) throw new Error('não guardou');
    await p.locator('#voz-vels [data-audio-vel="1"]').click();
    await p.evaluate(() => { location.hash = '#/ler/Jonas/1'; });
    await p.waitForTimeout(900);
  });

  await passo('o nome da voz é o que diz se ela é masculina ou feminina', async () => {
    const lista = await p.evaluate(() => B.audio.listaVozes());
    if (lista.length !== 3) throw new Error('viu ' + lista.length + ' vozes');
    const m = lista.find(v => v.genero === 'm');
    const f = lista.find(v => v.genero === 'f');
    if (!m || !/male_1/.test(m.nome)) throw new Error('não achou a masculina');
    if (!f || !/female_2/.test(f.nome)) throw new Error('não achou a feminina');
    /* "female" contém "male": o feminino não pode virar masculino. */
    if (f.genero !== 'f') throw new Error('confundiu female com male');
    const semSexo = lista.find(v => v.id === 'Luciana');
    if (semSexo.genero !== '') throw new Error('inventou sexo para uma voz sem nome disso');
    if (!/Voz/.test(semSexo.rotulo)) throw new Error('rótulo: ' + semSexo.rotulo);
  });

  await passo('e a escolhida é a que fala, valendo na hora', async () => {
    await p.evaluate(() => { location.hash = '#/config'; });
    await p.waitForTimeout(800);
    await p.locator('#voz-nomes [data-audio-voz*="male_1"]').click();
    await p.waitForTimeout(400);
    if (await p.evaluate(() => B.audio.voz().genero) !== 'm') throw new Error('não guardou');
    const amostra = await p.evaluate(() => window.__falados[window.__falados.length - 1]);
    if (!/male_1/.test(amostra.voz || '')) throw new Error('a amostra saiu em outra voz');

    await p.evaluate(() => B.audio.parar());
    await p.evaluate(() => { location.hash = '#/ler/Jonas/1'; });
    await p.waitForTimeout(900);
    await p.evaluate(() => { window.__falados.length = 0; });
    await p.locator('[data-ouvir]').click();
    await p.waitForTimeout(300);
    const usada = await p.evaluate(() => window.__falados[0].voz);
    if (!/male_1/.test(usada || '')) throw new Error('leu com a voz ' + usada);

    const antes = await p.evaluate(() => window.__falados.length);
    await p.locator('[data-audio-voz-gira]').click();
    await p.waitForTimeout(150);
    const agora = await p.evaluate(() => window.__falados);
    if (agora.length <= antes) throw new Error('esperou o próximo versículo');
    if (agora[agora.length - 1].voz === usada) throw new Error('não trocou de voz');
    if (agora[agora.length - 1].texto !== agora[antes - 1].texto) {
      throw new Error('trocou de versículo em vez de repetir o atual');
    }
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
      vozes: () => JSON.stringify([
        { id: 'pt-br-x-ptd#male_1-local', nome: 'pt-br-x-ptd#male_1-local' },
        { id: 'pt-br-x-afs#female_2-local', nome: 'pt-br-x-afs#female_2-local' }
      ]),
      escolherVoz(nome) { window.__vozDoMotor = nome; return true; },
      falar(texto, id, vel) {
        falados.push({ texto: texto, id: id, vel: vel, voz: window.__vozDoMotor });
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

  await passo('o bloco também deixa trocar a velocidade, e só enquanto lê', async () => {
    const vel = p.locator('.bloco-exegese:has([data-ouvir-bloco]) [data-vel-bloco]').first();
    if (!await vel.isVisible()) throw new Error('não mostrou a velocidade do bloco que lê');
    const outros = await p.locator('[data-vel-bloco]:visible').count();
    if (outros !== 1) throw new Error('apareceu em ' + outros + ' blocos');

    const antes = await p.evaluate(() => window.__falados.length);
    await vel.click();
    await p.waitForTimeout(150);
    const falados = await p.evaluate(() => window.__falados);
    if (falados.length <= antes) throw new Error('não aplicou na hora');
    if (falados[falados.length - 1].vel === falados[antes - 1].vel) {
      throw new Error('a voz nova saiu na velocidade velha');
    }
    if (!/[0-9],?[0-9]*×/.test(await vel.innerText())) {
      throw new Error('o botão não diz a velocidade: ' + await vel.innerText());
    }

    await p.locator('[data-ouvir-bloco]').first().click();
    await p.waitForTimeout(200);
    if (await p.locator('[data-vel-bloco]:visible').count()) {
      throw new Error('a velocidade ficou na tela depois de parar');
    }
  });

  await passo('no app, a voz escolhida vai para o motor do Android', async () => {
    await p.evaluate(() => B.audio.parar());
    const lista = await p.evaluate(() => B.audio.listaVozes());
    if (lista.length !== 2) throw new Error('viu ' + lista.length + ' vozes no app');
    if (!lista.some(v => v.genero === 'm') || !lista.some(v => v.genero === 'f')) {
      throw new Error('não separou masculina de feminina');
    }
    await p.evaluate(() => B.audio.voz('pt-br-x-ptd#male_1-local'));
    await p.evaluate(() => { location.hash = '#/ler/Jonas/1'; });
    await p.waitForTimeout(900);
    await p.evaluate(() => { window.__falados.length = 0; });
    await p.locator('[data-ouvir]').click();
    await p.waitForTimeout(400);
    const usada = await p.evaluate(() => window.__falados[0].voz);
    if (usada !== 'pt-br-x-ptd#male_1-local') throw new Error('motor ficou com: ' + usada);
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
