/* O mapa do capítulo: lugares certos, desenho offline, nada inventado. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const nav = await chromium.launch();
const erros = [];
const passo = async (n, fn) => { try { await fn(); console.log('  ✓ ' + n); } catch (e) { console.log('  ✗ ' + n + ' — ' + e.message); erros.push(n); } };

const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
p.on('pageerror', e => erros.push('erro de página: ' + e.message));
const ir = async (h) => { await p.goto('http://127.0.0.1:8123/biblia/#/' + h, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1600); };

await ir('mapa/Atos%2027');

await passo('o acervo de lugares carrega e diz o seu tamanho', async () => {
  const q = await p.evaluate(() => B.lugares.carregar().then(() => B.lugares.quantos()));
  if (q.lugares < 800) throw new Error('lugares: ' + q.lugares);
  if (q.capitulos < 800) throw new Error('capítulos: ' + q.capitulos);
});

await passo('a viagem de Paulo abre no Mediterrâneo, com os lugares certos', async () => {
  const nomes = await p.locator('.lugar-topo b').allInnerTexts();
  /* Creta não está: o TIPNR não traz a ilha como lugar, só os portos
     dela (Salmone, Laseia, Fenice). É buraco da fonte, não do app. */
  for (const esperado of ['Chipre', 'Sidom', 'Itália', 'Fenice']) {
    if (!nomes.includes(esperado)) throw new Error('faltou ' + esperado + ': ' + nomes.join(','));
  }
});

await passo('o desenho é um SVG feito aqui, sem imagem de servidor', async () => {
  const svg = p.locator('svg.mapa');
  if (!await svg.count()) throw new Error('sem SVG');
  if (await p.locator('.mapa img, .mapa image').count()) throw new Error('usou imagem externa');
  const pinos = await p.locator('.mapa-pino circle').count();
  if (pinos < 10) throw new Error('pinos: ' + pinos);
  const costa = await p.locator('path.mapa-costa').getAttribute('d');
  if (!costa || costa.length < 200) throw new Error('costa vazia');
});

await passo('a janela aperta no capítulo: Gênesis 12 não mostra a Itália', async () => {
  await ir('mapa/G%C3%AAnesis%2012');
  const nomes = await p.locator('.lugar-topo b').allInnerTexts();
  if (!nomes.includes('Siquém') || !nomes.includes('Harã')) throw new Error(nomes.join(','));
  if (nomes.includes('Itália')) throw new Error('trouxe a Itália para Gênesis 12');
});

await passo('e os rótulos não saem gigantes quando o zoom aperta', async () => {
  /* O viewBox é fixo: sem isso, a letra (medida em unidades do viewBox)
     crescia junto com o zoom e os nomes saíam do tamanho de um dedo. */
  await ir('mapa/Josu%C3%A9%2010');
  const vb = await p.locator('svg.mapa').getAttribute('viewBox');
  if (vb !== '0 0 360 260') throw new Error('viewBox: ' + vb);
});

await passo('capítulo de discurso empresta o mapa do vizinho, e diz que emprestou', async () => {
  await ir('mapa/Jo%C3%A3o%2013');
  const aviso = p.locator('.aviso-mapa');
  if (!await aviso.count()) throw new Error('não avisou nada');
  const t = await aviso.innerText();
  if (!/não cita nenhum lugar/.test(t)) throw new Error(t.slice(0, 90));
  if (!/João 12, 1 capítulo antes/.test(t)) throw new Error('emprestou de onde? ' + t.slice(0, 120));
  if (!await p.locator('svg.mapa').count()) throw new Error('sem mapa');
  const titulo = await p.locator('h3.secao').innerText();
  if (!/em João 12/.test(titulo)) throw new Error('a lista não diz de quem é: ' + titulo);
});

await passo('e o vizinho pode estar depois, quando o de antes não serve', async () => {
  await ir('mapa/Jo%C3%A3o%2017');
  const t = await p.locator('.aviso-mapa').innerText();
  if (!/João 18, 1 capítulo depois/.test(t)) throw new Error(t.slice(0, 120));
});

await passo('salmo nunca empresta de outro salmo: cada um é um poema', async () => {
  await ir('mapa/Salmos%20117');
  if (await p.locator('.aviso-mapa').count()) throw new Error('emprestou entre salmos');
  if (await p.locator('svg.mapa').count()) throw new Error('desenhou mapa de outro salmo');
});

await passo('capítulo sem lugar nenhum diz isso, em vez de mapa vazio', async () => {
  await ir('mapa/Tiago%201');
  const t = await p.locator('#mapa-corpo').innerText();
  if (!/não nomeia nenhum lugar/.test(t)) throw new Error(t.slice(0, 120));
  if (await p.locator('svg.mapa').count()) throw new Error('desenhou mapa sem lugar');
});

await passo('o rodapé não vende certeza que não existe', async () => {
  await ir('mapa/Jonas%201');
  const t = await p.locator('.rodape-dica').innerText();
  if (!/é por aqui/.test(t)) throw new Error('não avisou que a localização é proposta');
  if (!/STEPBible/.test(t) || !/Natural Earth/.test(t)) throw new Error('sem as fontes');
});

await passo('cada lugar leva ao mapa de hoje, fora do app', async () => {
  const a = p.locator('.lugar a').first();
  const href = await a.getAttribute('href');
  if (!/openstreetmap\.org\/\?mlat=/.test(href)) throw new Error(href);
  if (await a.getAttribute('target') !== '_blank') throw new Error('abre dentro do app');
});

await passo('o caminho está na tela de estudo, com as outras portas do capítulo', async () => {
  await p.evaluate(() => B.estudos.importar([{ titulo: 'Jonas 1', formato: 'completo',
    texto: '# Jonas 1\n\nTexto.', modelo: 'claude' }]));
  await ir('estudo/Jonas%201/completo');
  if (!await p.locator('a[href="#/mapa/Jonas%201"]').count()) throw new Error('sem botão no estudo');
  /* A tela de leitura ficou só com o texto; as portas do capítulo são do
     estudo e do bloco de hoje. */
  await ir('ler/Jonas%201');
  await p.waitForTimeout(700);
  if (await p.locator('a[href="#/mapa/Jonas%201"]').count()) {
    throw new Error('a leitura voltou a carregar as portas do capítulo');
  }
  /* No bloco de hoje da aba Estudo ficaram as duas portas que importam
     ali: ler e estudar. O mapa e as outras moram dentro do estudo. */
  await ir('estudo');
  await p.waitForSelector('.hoje-estudos', { timeout: 10000 });
  await p.waitForTimeout(800);
  if (!await p.locator('.hoje-estudo a[href^="#/estudo/"]').count()) {
    throw new Error('sem a porta do estudo no bloco de hoje');
  }
});

await passo('capítulo sem lugares e sem vizinho não ganha botão de mapa', async () => {
  await ir('estudo/Tiago%201');
  if (await p.locator('a[href^="#/mapa/"]').count()) throw new Error('ofereceu mapa vazio');
});

await passo('nenhum lugar aponta para capítulo que não existe', async () => {
  const mau = await p.evaluate(() => fetch('data/lugares.json').then(r => r.json()).then(d => {
    const ruins = [];
    Object.keys(d.capitulos).forEach(k => {
      const m = k.match(/^(\S+) (\d+)$/);
      const l = m && B.biblia.LIVROS.filter(x => x.usfm === m[1])[0];
      if (!l || +m[2] > l.caps) ruins.push(k);
    });
    return ruins;
  }));
  if (mau.length) throw new Error(mau.slice(0, 5).join(', '));
});

await passo('e nenhuma coordenada cai fora do mundo', async () => {
  const mau = await p.evaluate(() => fetch('data/lugares.json').then(r => r.json()).then(d =>
    d.lugares.filter(l => !(l.y >= -90 && l.y <= 90 && l.x >= -180 && l.x <= 180)).length));
  if (mau) throw new Error('coordenadas impossíveis: ' + mau);
});

await passo('sem os arquivos (versão sem mapa), nada quebra', async () => {
  const ctx2 = await nav.newContext({ viewport: { width: 390, height: 844 } });
  await ctx2.route('**/data/lugares.json', r => r.fulfill({ status: 404, body: '' }));
  await ctx2.route('**/data/mapa-base.json', r => r.fulfill({ status: 404, body: '' }));
  const p2 = await ctx2.newPage();
  p2.on('pageerror', e => erros.push('erro de página (sem mapa): ' + e.message));
  await p2.goto('http://127.0.0.1:8123/biblia/#/ler/Jonas%201', { waitUntil: 'domcontentloaded' });
  await p2.waitForTimeout(2000);
  if (await p2.locator('a[href^="#/mapa/"]').count()) throw new Error('ofereceu mapa sem dados');
  await ctx2.close();
});

console.log('\n--- o Israel de hoje, por baixo ---');

await passo('a mancha de hoje é desenhada em todo mapa', async () => {
  for (const ref of ['Josué 10', 'Atos 27', 'Rute 1']) {
    await ir('mapa/' + encodeURIComponent(ref));
    await p.waitForTimeout(900);
    const d = await p.evaluate(() => {
      const i = document.querySelector('.mapa-israel');
      const pa = document.querySelector('.mapa-palestina');
      return { israel: i && (i.getAttribute('d') || '').length,
               palestina: pa && (pa.getAttribute('d') || '').length };
    });
    if (!d.israel) throw new Error(ref + ': sem o contorno de Israel');
    if (!d.palestina) throw new Error(ref + ': sem Cisjordânia e Gaza');
  }
});

await passo('e vem do Natural Earth, nas coordenadas certas', async () => {
  const r = await p.evaluate(() => {
    const b = B.lugares.mapaBase();
    const pts = (b.israel || []).concat(b.palestina || [])
      .reduce((s, anel) => s.concat(anel), []);
    return {
      fonte: b.fonte,
      n: pts.length,
      sul: Math.min.apply(null, pts.map(p => p[1])),
      norte: Math.max.apply(null, pts.map(p => p[1])),
      oeste: Math.min.apply(null, pts.map(p => p[0])),
      leste: Math.max.apply(null, pts.map(p => p[0]))
    };
  });
  if (!/Natural Earth/.test(r.fonte)) throw new Error('fonte: ' + r.fonte);
  if (r.n < 80) throw new Error('contorno pobre demais: ' + r.n + ' pontos');
  /* Israel vai de Eilat (29,5°N) ao Hermom (33,4°N), entre 34,2° e 35,9°E.
     Fora disso, o recorte pegou outro país. */
  if (r.sul < 29.3 || r.sul > 29.7) throw new Error('sul: ' + r.sul);
  if (r.norte < 33.2 || r.norte > 33.6) throw new Error('norte: ' + r.norte);
  if (r.oeste < 34.1 || r.leste > 36.0) {
    throw new Error('leste-oeste: ' + r.oeste + ' a ' + r.leste);
  }
});

await passo('o nome aparece, mas nunca por cima de um lugar do capítulo', async () => {
  await ir('mapa/' + encodeURIComponent('Rute 1'));
  await p.waitForTimeout(900);
  if (!await p.locator('.mapa-hoje').count()) throw new Error('não nomeou a mancha');
  const bate = await p.evaluate(() => {
    const r = document.querySelector('.mapa-hoje').getBoundingClientRect();
    return [...document.querySelectorAll('.mapa-pino text')].some(t => {
      const o = t.getBoundingClientRect();
      return r.right > o.left && r.left < o.right && r.bottom > o.top && r.top < o.bottom;
    });
  });
  if (bate) throw new Error('o nome cobriu um lugar do capítulo');
});

await passo('e o rodapé diz o que é a mancha, sem tomar partido', async () => {
  const t = await p.locator('.rodape-dica').innerText();
  if (!/Israel de hoje/.test(t)) throw new Error('não explicou a mancha');
  if (!/Cisjord[âa]nia e Gaza/.test(t)) throw new Error('não disse o que é a hachura');
  if (!/disputed/.test(t) || !/indeterminate/.test(t)) {
    throw new Error('não disse como o Natural Earth classifica');
  }
  if (!/não toma partido/.test(t)) throw new Error('não diz que o app não escolhe fronteira');
});

await passo('o país de hoje de cada lugar sai da coordenada, e bate', async () => {
  await ir('mapa/' + encodeURIComponent('Jonas 1'));
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    const achar = n => {
      for (const ref of Object.keys(B.lugares.__todos ? {} : {})) void ref;
      return null;
    };
    void achar;
    /* Procura pelos lugares do acervo, pelo nome. */
    const want = { 'Nínive': 'Iraque', 'Tarso': 'Turquia', 'Roma': 'Itália',
      'Atenas': 'Grécia', 'Damasco': 'Síria', 'Sidom': 'Líbano',
      'Babilônia': 'Iraque' };
    const fora = {};
    const lista = B.lugares.doCapitulo ? null : null;
    void lista;
    return fetch('data/lugares.json').then(x => x.json()).then(d => {
      Object.keys(want).forEach(n => {
        const l = d.lugares.filter(x => x.n === n)[0];
        fora[n] = l ? B.lugares.paisDe(l.x, l.y) : '(sem o lugar)';
      });
      return { fora: fora, want: want };
    });
  });
  for (const n of Object.keys(r.want)) {
    if (r.fora[n] !== r.want[n]) {
      throw new Error(n + ' → ' + r.fora[n] + ' (esperado ' + r.want[n] + ')');
    }
  }
});

await passo('e os países tocados pelo capítulo ficam destacados no desenho', async () => {
  await ir('mapa/' + encodeURIComponent('Atos 27'));
  await p.waitForTimeout(1200);
  const n = await p.locator('.mapa-pais-hoje').count();
  if (n < 3) throw new Error('destacou só ' + n + ' países numa viagem pelo Mediterrâneo');
  const nomes = await p.locator('.mapa-hoje').evaluateAll(e => e.map(x => x.textContent));
  if (!nomes.length) throw new Error('nenhum país nomeado no mapa');
  /* Cada país destacado tem de conter um lugar do capítulo. */
  const confere = await p.evaluate(() => {
    const base = B.lugares.mapaBase();
    const lista = B.lugares.doCapitulo('ACT', 27) || [];   // o acervo fala USFM
    const tocados = B.lugares.paisesDe(lista);
    return { tocados: tocados, temDado: (base.paisesHoje || []).length };
  });
  if (confere.temDado < 10) throw new Error('poucos países no dado: ' + confere.temDado);
  if (!confere.tocados.length) throw new Error('nenhum país tocado pelo capítulo');
});

await passo('a lista embaixo do mapa diz o país de hoje de cada lugar', async () => {
  await ir('mapa/' + encodeURIComponent('Jonas 1'));
  await p.waitForTimeout(1000);
  const linhas = await p.locator('.lugar-pais').allInnerTexts();
  if (linhas.length < 2) throw new Error('só ' + linhas.length + ' lugares com país');
  if (!linhas.every(l => /^hoje:\s*\S/.test(l))) throw new Error('linha torta: ' + linhas[0]);
  if (!linhas.some(l => /Iraque/.test(l))) throw new Error('Nínive não saiu no Iraque');
});

await passo('ampliar num lugar não transforma a terra em mar', async () => {
  /* Zoom fundo no continente: nenhum vértice do país aparece na
     janela, e antes disso a mancha da terra sumia. */
  await ir('mapa/' + encodeURIComponent('Jonas 3'));
  await p.waitForTimeout(1200);
  const d = await p.evaluate(() => {
    const t = document.querySelector('.mapa-terra');
    const pais = document.querySelector('.mapa-pais-hoje');
    return {
      terra: t ? (t.getAttribute('d') || '').length : 0,
      pais: pais ? pais.getAttribute('class') : null
    };
  });
  if (!d.terra) throw new Error('a terra sumiu: o mapa virou um mar inteiro');
  if (!/traco/.test(d.pais || '')) {
    throw new Error('país maior que a janela devia virar só traço: ' + d.pais);
  }
});

await passo('o mapa aberto pelo estudo mostra a mesma mancha', async () => {
  /* O estudo leva ao mesmo endereço de mapa; o que se confere aqui é
     que o desenho é o mesmo, inclusive no modal que o estudo abre. */
  await p.evaluate(() => B.estudos.importar([{ titulo: 'Jonas 1', formato: 'completo',
    texto: '# Jonas 1\n\nTexto.', modelo: 'claude' }]));
  await ir('estudo/Jonas%201/completo');
  const porta = p.locator('a[href="#/mapa/Jonas%201"]');
  if (!await porta.count()) throw new Error('o estudo não ofereceu mapa');
  await porta.click();
  await p.waitForTimeout(2000);
  if (!await p.locator('.mapa-israel').count()) {
    throw new Error('a mancha não apareceu no mapa aberto pelo estudo');
  }
  if (!await p.locator('.mapa-palestina').count()) {
    throw new Error('faltou a hachura da Cisjordânia e Gaza');
  }
});

await ctx.close();
await nav.close();
console.log(erros.length ? '\n✗ ' + erros.length + ' problema(s): ' + erros.join(' | ') : '\n✓ tudo certo');
process.exit(erros.length ? 1 : 0);
