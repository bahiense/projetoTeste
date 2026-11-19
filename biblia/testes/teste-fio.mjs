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

await passo('e conta o que aconteceu nele, trecho a trecho', async () => {
  await abrir('Jonas 2');
  const cenas = p.locator('.fio-cenas li');
  const n = await cenas.count();
  if (n < 3) throw new Error('vieram ' + n + ' trechos');
  if (n > 6) throw new Error('são ' + n + ': o resumo virou o estudo inteiro');

  const linhas = await cenas.evaluateAll(els => els.map(e => e.textContent));
  for (const l of linhas) {
    if (!/^v+\.\s*\d/.test(l.trim())) throw new Error('trecho sem referência: ' + l.slice(0, 40));
    if (l.length < 30) throw new Error('trecho curto demais: ' + l);
    /* Corte feio de abreviação: "(v." no fim era o caso mais comum. */
    if (/\(v+\.?\s*$|\(\s*$/.test(l)) throw new Error('cortou no meio: ' + l.slice(-40));
  }

  /* E é mesmo o texto do estudo do capítulo anterior. */
  const doEstudo = await p.evaluate(() => B.estudos.obter('Jonas 1', 'completo')
    .then(e => e.texto.replace(/\s+/g, ' ')));
  const corpo = linhas[1].replace(/^v+\.\s*[\d-]+\s*/, '').slice(0, 40);
  if (doEstudo.indexOf(corpo) < 0) {
    throw new Error('o trecho não saiu do estudo de Jonas 1: ' + corpo);
  }
});

await passo('e isso vale para quase todo capítulo, não só para alguns', async () => {
  /* O caso que apareceu em Jeremias 31: o estudo do anterior marcava
     os trechos de outro jeito ("**vv. 1-3: título**") e o cartão dizia
     que não havia mais nada. São três formatos no acervo. */
  const r = await p.evaluate(async () => {
    const idx = await fetch('data/estudos/indice.json').then(x => x.json());
    const refs = idx.filter(e => e.tipo === 'capitulo' && e.formato === 'completo')
      .map(e => e.titulo);
    let total = 0, com = 0;
    const sem = [];
    for (const ref of refs) {
      const e = await B.estudos.obter(ref, 'completo').catch(() => null);
      if (!e || !e.texto) continue;
      total++;
      if (B.contexto.__cenasDe(e.texto, false).length) com++;
      else if (sem.length < 4) sem.push(ref);
    }
    return { total, com, sem };
  });
  if (r.total < 800) throw new Error('só ' + r.total + ' estudos para conferir');
  if (r.com / r.total < 0.99) {
    throw new Error(r.com + ' de ' + r.total + ' — ficaram de fora: ' + r.sem.join(', '));
  }
});

await passo('e os três jeitos de marcar o trecho rendem o mesmo', async () => {
  const r = await p.evaluate(() => {
    const base = '## X\n\nUma frase.\n\n### O capítulo, parte por parte\n\n';
    const jeitos = {
      negrito: base + '**vv. 1-3**\nAconteceu a primeira coisa. E mais contexto.',
      negritoComTitulo: base + '**vv. 1-3: A ordem**\nAconteceu a primeira coisa. E mais.',
      subtitulo: base + '#### **vv. 1-3**: a ordem\n\nAconteceu a primeira coisa. E mais.',
      irmao: '## X\n\nUma frase.\n\n### O capítulo, parte por parte\n\n' +
        '### vv. 1-3\nAconteceu a primeira coisa. E mais contexto.'
    };
    const fora = {};
    Object.keys(jeitos).forEach(k => {
      const c = B.contexto.__cenasDe(jeitos[k], false);
      fora[k] = c.length ? c[0].onde + ' | ' + c[0].texto.slice(0, 30) : '(nada)';
    });
    return fora;
  });
  for (const k of Object.keys(r)) {
    if (!/^vv\. 1-3 \| Aconteceu a primeira/.test(r[k])) {
      throw new Error(k + ' → ' + r[k]);
    }
  }
});

await passo('sem o estudo completo do anterior, não inventa enredo', async () => {
  const cenas = await p.evaluate(() => B.contexto
    ? true : false);
  void cenas;
  /* Um estudo sem a seção "parte por parte" não produz trecho nenhum. */
  const vazio = await p.evaluate(() => {
    const falso = '## Teste\n\nUma frase.\n\n### Onde estamos\n\nTexto qualquer.';
    return B.estudos.importar([{ titulo: 'Ageu 1', formato: 'completo',
      modelo: 'claude', texto: falso }]);
  });
  void vazio;
  await abrir('Ageu 2');
  if (await p.locator('.fio-cenas li').count()) {
    throw new Error('tirou trechos de um estudo que não os tem');
  }
  const resumo = await p.locator('[data-fio-resumo="ant"]').innerText();
  if (!resumo.trim()) throw new Error('ficou sem nem a frase do capítulo');
});

await passo('e o cartão não repete o capítulo que já está na tela', async () => {
  const t = await abrir('Jonas 2');
  if (/VOCÊ ESTÁ AQUI/.test(t)) throw new Error('voltou o passo "você está aqui"');
  if (await p.locator('[data-fio-ponte]').count()) throw new Error('voltou a ponte');
  if (await p.locator('[data-fio-resumo="atual"]').count()) {
    throw new Error('voltou o resumo do capítulo atual');
  }
});

await passo('"ver mais" abre no cartão, sem trocar a tela de capítulo', async () => {
  await abrir('Jonas 2');
  const antes = await p.evaluate(() => location.hash);
  if (!/Jonas%202|Jonas 2/.test(antes)) throw new Error('não abriu Jonas 2: ' + antes);
  if (await p.locator('.fio-passo-cab[href]').count()) {
    throw new Error('o cabeçalho ainda é link: tocar nele trocaria de capítulo');
  }

  await p.locator('[data-fio-abrir]').click();
  await p.waitForTimeout(1200);
  const depois = await p.evaluate(() => location.hash);
  if (depois !== antes) throw new Error('saiu do capítulo: ' + depois);

  const mais = await p.locator('[data-fio-mais]').innerText();
  if (mais.length < 500) throw new Error('abriu pouco: ' + mais.length + ' caracteres');
  if (!/Jonas 1, trecho a trecho/i.test(mais)) throw new Error('não disse de quem é: ' + mais.slice(0, 60));
  if (/Carregando|Não deu/.test(mais)) throw new Error('não carregou: ' + mais.slice(0, 60));
  /* Aberto, a lista curta some: seria o mesmo texto duas vezes. */
  if (await p.locator('.fio-cenas').isVisible()) throw new Error('a lista curta ficou repetida');
  if (!/ver menos/.test(await p.locator('[data-fio-rotulo]').innerText())) {
    throw new Error('o rótulo não mudou');
  }

  /* Quem quiser o estudo inteiro tem um segundo toque, dito com todas
     as letras — e esse sim navega. */
  const link = p.locator('[data-fio-estudo]');
  if (!await link.isVisible()) throw new Error('não ofereceu ir para o estudo');
  if (!/Ir para o estudo de Jonas 1/.test(await link.innerText())) {
    throw new Error('rótulo do link: ' + await link.innerText());
  }
  await link.click();
  await p.waitForTimeout(2200);
  if (!/Jonas%201|Jonas 1/.test(await p.evaluate(() => location.hash))) {
    throw new Error('o link não levou ao estudo do anterior');
  }
});

await passo('e fechar devolve o cartão ao tamanho de antes', async () => {
  await abrir('Jonas 2');
  await p.locator('[data-fio-abrir]').click();
  await p.waitForTimeout(1000);
  await p.locator('[data-fio-abrir]').click();
  await p.waitForTimeout(400);
  if (!await p.locator('[data-fio-mais]').isHidden()) throw new Error('não fechou');
  if (!await p.locator('[data-fio-estudo]').isHidden()) throw new Error('o link ficou solto');
  if (!await p.locator('.fio-cenas').isVisible()) throw new Error('a lista curta não voltou');
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

console.log('\n--- a introdução do capítulo ---');

await passo('o roteiro vem antes do "parte por parte", com os trechos na ordem',
  async () => {
    await abrir('Jeremias 30');
    const intro = p.locator('[data-intro-cap]');
    if (!await intro.count()) throw new Error('sem o cartão de introdução');

    const posicao = await p.evaluate(() => {
      const i = document.querySelector('[data-intro-cap]');
      const h = [...document.querySelectorAll('h4')]
        .filter(x => /parte por parte/i.test(x.textContent))[0];
      if (!h) return 'sem a seção';
      /* DOCUMENT_POSITION_FOLLOWING = o h4 vem depois do cartão. */
      return (i.compareDocumentPosition(h) & 4) ? 'antes' : 'depois';
    });
    if (posicao !== 'antes') throw new Error('o cartão ficou ' + posicao);

    const linhas = await p.locator('.intro-cap-roteiro li')
      .evaluateAll(e => e.map(x => x.textContent));
    if (linhas.length < 3) throw new Error('roteiro com ' + linhas.length + ' linhas');
    for (const l of linhas) {
      if (!/^v+\.\s*\d/.test(l.trim())) throw new Error('linha sem faixa: ' + l);
      if (l.length > 110) throw new Error('linha longa demais: ' + l.length);
    }
    /* Os nomes são os que o estudo deu aos trechos. */
    const doEstudo = await p.evaluate(() => B.estudos.obter('Jeremias 30', 'completo')
      .then(e => e.texto.replace(/\s+/g, ' ')));
    const nome = linhas[0].replace(/^v+\.\s*[\d-]+\s*/, '');
    if (doEstudo.indexOf(nome.slice(0, 25)) < 0) {
      throw new Error('o roteiro não saiu do estudo: ' + nome);
    }
  });

await passo('e a ordem das faixas é a ordem do capítulo', async () => {
  await abrir('Jeremias 30');
  const faixas = await p.locator('.intro-cap-roteiro li b')
    .evaluateAll(e => e.map(x => parseInt(x.textContent.replace(/[^0-9]/, ''), 10)));
  for (let i = 1; i < faixas.length; i++) {
    if (faixas[i] < faixas[i - 1]) throw new Error('fora de ordem: ' + faixas.join(', '));
  }
});

await passo('e aparece também no formato simples, onde a seção é feita pelo app',
  async () => {
    await p.evaluate(r => {
      location.hash = '#/estudo/' + encodeURIComponent(r) + '/simples';
      B.app.pintar();
    }, 'Jeremias 31');
    await p.waitForTimeout(3000);
    if (!await p.locator('[data-intro-cap]').count()) {
      throw new Error('sem o cartão no simples');
    }
    const linhas = await p.locator('.intro-cap-roteiro li').count();
    if (linhas < 3) throw new Error('roteiro com ' + linhas + ' linhas no simples');
  });

await passo('as perguntas para meditar e a oração saem do meio do estudo', async () => {
  await abrir('Jeremias 31');
  const h4 = await p.evaluate(() => [...document.querySelectorAll('h4')]
    .map(x => x.textContent.trim()));
  if (h4.some(t => /^Para meditar/i.test(t))) throw new Error('"Para meditar" ficou');
  if (h4.some(t => /^Ora[çc][ãa]o$/i.test(t))) throw new Error('a seção "Oração" ficou');
  /* A gaveta de oração deixou de citar a oração do capítulo. */
  const tela = await p.locator('#tela').innerText();
  if (/ORANDA/.test(tela) && !/Orar este capítulo/.test(tela)) {
    throw new Error('a gaveta não aponta para a tela de orar');
  }
});

await passo('mas a oração continua inteira em "Orar este capítulo"', async () => {
  const oracao = await p.evaluate(() => B.oracoes.doCapitulo('Jeremias 31'));
  if (!oracao || oracao.length < 150) throw new Error('a oração sumiu do dado');
  await p.evaluate(() => {
    location.hash = '#/orar/' + encodeURIComponent('Jeremias 31');
    B.app.pintar();
  });
  await p.waitForTimeout(2200);
  const t = await p.locator('#tela').innerText();
  if (t.indexOf(oracao.slice(0, 60)) < 0) throw new Error('a tela Orar não mostrou a oração');
});

await passo('estudo sem a seção não ganha roteiro inventado', async () => {
  await p.evaluate(() => B.estudos.importar([{
    titulo: 'Ageu 1', formato: 'completo', modelo: 'claude',
    texto: '## Ageu 1\n\nUma frase.\n\n### Onde estamos\n\nTexto qualquer.'
  }]));
  await abrir('Ageu 1');
  if (await p.locator('[data-intro-cap]').count()) {
    throw new Error('inventou roteiro para um estudo que não tem a seção');
  }
});

await ctx.close();
await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ')
  : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
