// Teste de ponta a ponta do Professor de Teologia, com o Claude simulado.
// Uso: node teologia-claude/testes/teste-fluxo.mjs <pasta com node_modules/pdfjs-dist> [pasta para capturas]
// Cobre: PDF (texto e imagem), queda no meio e "continuar", recarregar a página e
// escolher o arquivo de novo, material grande (fichamento), pesquisa na web
// simulada e sem conector, abas, exercícios, conversa com ferramenta, cópia
// baixada e o modo app Android (TeologiaNativo) importando a cópia.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const modulos = process.argv[2];
const capturas = process.argv[3] || '.';
if (!modulos) { console.error('informe a pasta com node_modules/pdfjs-dist'); process.exit(2); }
const pdfjs = path.join(modulos, 'node_modules/pdfjs-dist/build');
const pagina = fs.readFileSync(path.join(aqui, '..', 'professor.html'), 'utf8');
const simulado = fs.readFileSync(path.join(aqui, 'claude-simulado.js'), 'utf8');
// o mesmo esqueleto que o claude.ai põe em volta da página
const html = '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"></head><body>' + pagina + '</body></html>';
// a página do app Android: o mesmo filtro e cabeçalho que teologia-android/app/build.gradle.kts aplica
const gradle = fs.readFileSync(path.join(aqui, '..', '..', 'teologia-android', 'app', 'build.gradle.kts'), 'utf8');
const cabecaApp = gradle.match(/val cabeca = """([\s\S]*?)"""/)[1];
const htmlApp = cabecaApp + pagina.split('\n').filter(l => !/^\s*<(script src=|link )/.test(l)).join('\n') + '\n</body></html>\n';

let falhas = 0;
function confere(cond, texto) { console.log((cond ? '  ok  ' : '  FALHOU  ') + texto); if (!cond) falhas++; }

const browser = await chromium.launch();

async function novaPagina(ctx, extra) {
    const p = await ctx.newPage();
    const erros = [];
    p.on('pageerror', e => erros.push(String(e)));
    p.on('console', m => { if (m.type() === 'error' && !/fonts|favicon|ERR_FAILED/.test(m.text())) erros.push(m.text()); });
    await p.route('**/*', async rota => {
        const u = rota.request().url();
        if (u.startsWith('https://teste.local/')) return rota.fulfill({ contentType: 'text/html', body: html });
        if (u.includes('cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/')) {
            const nome = u.split('/').pop();
            return rota.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(pdfjs, nome)) });
        }
        return rota.abort();
    });
    if (extra) await p.addInitScript(extra);
    await p.addInitScript(simulado);
    p.erros = erros;
    return p;
}

async function escolher(p, botao, arq) {
    const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.click(botao)]);
    await fc.setFiles(arq);
}

async function esperarProntas(p, n) {
    try { await p.waitForFunction(n => document.querySelectorAll('[data-abrir]').length >= n, n, { timeout: 150000 }); }
    catch (e) { console.log('--- esperava ' + n + ' aula(s) pronta(s):\n' + (await p.innerText('body')).slice(0, 1500)); throw e; }
}

async function esperarTexto(p, texto, ms = 20000) {
    try { await p.waitForFunction(t => document.body.innerText.toLowerCase().includes(t.toLowerCase()), texto, { timeout: ms }); }
    catch (e) { console.log('--- esperava "' + texto + '"; a tela tem:\n' + (await p.innerText('body')).slice(0, 1500) + '\n--- erros: ' + (p.erros || []).join(' | ')); throw e; }
}

// ---------------------------------------------------------------- um PDF de teste
const ctxPdf = await browser.newContext();
const pp = await ctxPdf.newPage();
const longo = 'A justificação pela fé, segundo o apóstolo Paulo em Romanos 3.21-26, é o ato de Deus que declara justo o ímpio. '.repeat(8);
let corpo = '';
for (let i = 1; i <= 7; i++) corpo += `<section style="page-break-after:always;font:14px serif"><h1>Página ${i}</h1><p>${i <= 4 ? longo : 'Slide curto: δικαιοσύνη'}</p></section>`;
await pp.setContent('<html><body>' + corpo + '</body></html>');
const pdfArq = path.join(capturas, 'material-teste.pdf');
fs.writeFileSync(pdfArq, await pp.pdf({ format: 'A5' }));
await ctxPdf.close();

// ---------------------------------------------------------------- 1. PDF, queda no meio, continuar
console.log('1. PDF de aula, com pesquisa, caindo no módulo 2');
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
let p = await novaPagina(ctx, 'window.__falhar = [{quando: "Escreva agora o MÓDULO 2", code: "rate_limited"}];');
await p.goto('https://teste.local/');
await esperarTexto(p, 'Novo material');
await p.click('#nova');
await esperarTexto(p, 'Pesquisa pelo conector');
await escolher(p, '#escolher', pdfArq);
await esperarTexto(p, 'material-teste.pdf');
confere(await p.isChecked('#imagens'), 'aula em slides liga "ler como imagem"');
await p.click('#preparar');
await esperarTexto(p, 'limite de uso', 150000);
confere(true, 'a queda (cota) aparece com a mensagem certa');
let pedidos = await p.evaluate(() => window.__pedidos);
const leituras = pedidos.filter(x => x.imagens > 0);
confere(leituras.length === 3 && leituras.every(x => x.imagens <= 6), 'leu as 7 páginas em 3 pedidos com imagens (' + leituras.map(x => x.imagens).join(',') + ')');
confere((await p.evaluate(() => window.__buscas.length)) === 3, 'fez as 3 buscas na web pelo conector');
await p.screenshot({ path: path.join(capturas, 'shot-teologia-queda.png') });
const antes = pedidos.length;
await p.click('[data-continuar]');
await esperarProntas(p, 1);
pedidos = await p.evaluate(() => window.__pedidos);
const refeitos = pedidos.slice(antes).filter(x => /Transcreva|MÓDULO 1,|Planeje|buscas/.test(x.fim));
confere(refeitos.length === 0, 'continuar não repetiu leitura, plano, pesquisa nem o módulo 1');
confere(p.erros.length === 0, 'sem erros de JavaScript (inclusive objeto congelado): ' + p.erros.join(' | '));

// abrir e navegar
await p.click('[data-abrir]');
await p.waitForSelector('#aba-revisao');
const abas = await p.$$eval('#abas button', bs => bs.map(b => b.textContent));
confere(JSON.stringify(abas) === JSON.stringify(['Aula', 'Passagens', 'Teólogos', 'Conceitos', 'Cronologia', 'Debates', 'Exercícios', 'Apologética', 'Professor', 'Revisão']), 'abas: ' + abas.join(', '));
const dias = await p.$$eval('[data-mod] .rotulo', r => r.map(x => x.textContent));
confere(dias.length === 5 && dias[0] === 'Segunda-feira' && dias[4] === 'Sexta-feira', 'a aula mostra a semana: ' + dias.join(', '));
await p.click('[data-mod="1"]');
await esperarTexto(p, 'Complemento do professor');
confere(await p.isVisible('text=Terminei o estudo de hoje'), 'o dia termina com "Terminei o estudo de hoje"');
confere(await p.isVisible('text=Da pesquisa na web'), 'módulo mostra "do material", complemento e pesquisa separados');
await p.screenshot({ path: path.join(capturas, 'shot-teologia-modulo.png'), fullPage: true });
await p.click('#lido');
await p.click('#voltar');
await p.click('#aba-passagens');
await p.click('[data-pas="0"]');
await esperarTexto(p, 'Nas línguas originais');
confere(await p.isVisible('text=δικαιοσύνη'), 'passagem com o termo grego');
await p.screenshot({ path: path.join(capturas, 'shot-teologia-passagem.png'), fullPage: true });
await p.click('#voltar');
await p.click('#aba-exercicios');
await p.click('[data-ex="quiz"]');
await p.click('[data-op="1"]');
await esperarTexto(p, 'Certo');
await p.click('#seguir');
await p.click('[data-op="2"]');
await esperarTexto(p, 'Errado');
await p.click('#seguir');
await esperarTexto(p, '1/2');
confere(true, 'múltipla escolha conta acertos e erros');
await p.click('#voltar');
await p.click('[data-ex="flash"]');
await p.click('#carta');
await p.click('#sim');
confere(await p.isVisible('text=1 de 2 sabidos'), 'flashcards guardam o que já sei');
await p.click('#voltar');
await p.click('[data-dis="0"]');
await p.fill('#resp', 'A justificação forense é a declaração de Deus de que o pecador é justo em Cristo.');
await p.click('#enviar');
await esperarTexto(p, 'Resposta do professor');
confere(true, 'dissertativa vai para correção');
await p.click('#voltar'); await p.click('#voltar');
await p.click('#aba-debates');
await p.click('[data-deb="0"]');
await p.click('[data-lado="0"]');
await esperarTexto(p, 'Resposta do professor');
await p.fill('#msg', 'Romanos 4.5 diz que Deus justifica o ímpio.');
await p.click('#enviar');
await p.waitForSelector('#avaliar');
await p.click('#avaliar');
await esperarTexto(p, 'Nota 8');
confere(true, 'debate com avaliação no fim');
await p.click('#voltar'); await p.click('#voltar');
await p.click('#aba-professor');
await p.click('[data-sug="0"]');
await esperarTexto(p, 'Pesquisei e achei');
pedidos = await p.evaluate(() => window.__pedidos);
const conv = pedidos[pedidos.length - 1];
confere(conv.ferramentas === 1 && conv.cache === undefined, 'conversa com a ferramenta de pesquisa (sem "cache")');
await p.click('#voltar');
await p.click('#aba-revisao');
confere(await p.isVisible('text=Dossiê da pesquisa na web'), 'revisão mostra o dossiê');
await p.click('#voltar');
await p.click('[data-levar]');
await p.waitForFunction(() => window.__baixado);
const baixado = await p.evaluate(() => window.__baixado);
confere(/^teologia-aula-.*\.json$/.test(baixado.filename), 'arquivo baixado: ' + baixado.filename);
const pacote = JSON.parse(baixado.data);
confere(pacote.formato === 'professor-de-teologia' && pacote.aulas[0].partes.mod.length === 5 && pacote.aulas[0].partes.material.includes('Página 7'), 'pacote completo (5 aulas, material inteiro)');
confere(JSON.stringify(pacote.aulas[0].partes.a.modulos.map(m => m.dia)) === JSON.stringify(['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira']), 'plano com uma aula para cada dia, de segunda a sexta');
fs.writeFileSync(path.join(capturas, 'pacote-teste.json'), baixado.data);
confere(p.erros.length === 0, 'sem erros de JavaScript até aqui: ' + p.erros.join(' | '));
await p.close();

// ---------------------------------------------------------------- 2. queda na leitura, recarregar, escolher o arquivo de novo
console.log('2. queda durante a leitura e recarga da página');
// a falha vale só para a primeira carga (o init script roda de novo ao recarregar)
p = await novaPagina(ctx, 'if (!sessionStorage.jaFalhou) { sessionStorage.jaFalhou = 1; window.__falhar = [{quando: "páginas 4 a", code: "rate_limited"}]; }');
await p.goto('https://teste.local/');
await esperarTexto(p, 'Novo material');
await p.click('#nova');
await escolher(p, '#escolher', pdfArq);
await p.click('input[name=genero][value=livro] + span');
confere(!(await p.isChecked('#imagens')), 'livro desliga "ler como imagem"');
await p.click('input[name=objetivo][value=pregacao] + span');
await p.click('#preparar');
await esperarTexto(p, 'limite de uso', 150000);
pedidos = await p.evaluate(() => window.__pedidos);
confere(pedidos.filter(x => x.imagens).length === 1, 'páginas com texto lidas direto; só a janela com slides foi como imagem');
await p.reload();
await esperarTexto(p, 'Escolher o arquivo e continuar');
confere(true, 'depois de recarregar, pede o arquivo para continuar');
await escolher(p, '[data-continuar]', pdfArq);
await esperarProntas(p, 2);
pedidos = await p.evaluate(() => window.__pedidos);
const lidas = pedidos.filter(x => x.imagens).map(x => x.paginas);
confere(JSON.stringify(lidas) === '["4 a 6","7 a 7"]', 'continuou a leitura da página 4 em diante: ' + lidas.join(' / '));
confere(p.erros.length === 0, 'sem erros de JavaScript: ' + p.erros.join(' | '));
await p.click('[data-abrir]');
await p.waitForSelector('#aba-revisao');
const abas2 = await p.$$eval('#abas button', bs => bs.map(b => b.textContent));
confere(abas2[1] === 'Pregação', 'objetivo pregação põe a aba Pregação em segundo: ' + abas2.join(', '));
await p.close();

// ---------------------------------------------------------------- 3. texto colado grande, sem conector de pesquisa
console.log('3. texto grande colado (fichamento) e sem conector');
p = await novaPagina(ctx, 'window.__semConector = true;');
await p.goto('https://teste.local/');
await esperarTexto(p, 'Novo material');
await p.click('#nova');
await esperarTexto(p, 'adicione o conector');
confere(!(await p.isChecked('#pesquisar')), 'sem conector, a pesquisa vem desligada e explicada');
await p.click('text=Ou colar um texto');
const grande = ('Capítulo sobre a graça. ' + 'Agostinho ensinou que a graça precede a vontade. '.repeat(40) + '\n\n').repeat(70);
await p.fill('#colado', grande);
await p.click('#preparar');
await esperarProntas(p, 3);
pedidos = await p.evaluate(() => window.__pedidos);
const fich = pedidos.filter(x => x.fichamento).length;
confere(fich >= 2, 'material grande foi fichado em ' + fich + ' partes');
confere(pedidos.filter(x => /Escreva agora o MÓDULO \d+ de 5/.test(x.inicioModulo || '')).length === 5, 'material grande também virou 5 aulas, de segunda a sexta');
confere(Math.max(...pedidos.map(x => x.bytes)) < 262144, 'nenhum pedido passou do limite (' + Math.max(...pedidos.map(x => x.bytes)) + ' bytes)');
await p.click('[data-abrir]');
await esperarTexto(p, 'De onde vem cada informação');
await p.click('text=De onde vem cada informação');
confere(await p.isVisible('text=não houve pesquisa'), 'legenda diz que não houve pesquisa');
await p.screenshot({ path: path.join(capturas, 'shot-teologia-aula.png'), fullPage: true });
confere(p.erros.length === 0, 'sem erros de JavaScript: ' + p.erros.join(' | '));
await p.close();
await ctx.close();

// ---------------------------------------------------------------- 4. modo app Android
console.log('4. modo app Android (TeologiaNativo), importando a cópia');
const nativo = `(function(){
  var arq = {}; window.__arquivosNativos = arq; window.__copiasNativas = [];
  window.TeologiaNativo = {
    ler: function(k){ return arq[k] || ''; },
    gravar: function(k, v){ if (!/^[a-z0-9-]+$/.test(k)) return false; arq[k] = v; return true; },
    apagar: function(k){ delete arq[k]; },
    apagarPrefixo: function(p){ Object.keys(arq).forEach(function(k){ if (k.indexOf(p) === 0) delete arq[k]; }); },
    metas: function(){ return JSON.stringify(Object.keys(arq).filter(function(k){ return k.indexOf('m-') === 0; }).map(function(k){ return JSON.parse(arq[k]); })); },
    importarArquivo: function(){ window.__pediuArquivo = true; },
    copiaAutomatica: function(j){ window.__copiasNativas.push(j.length); },
    salvarCopia: function(j){ window.__copiasNativas.push(j.length); setTimeout(function(){ window.__copia({ok:true, texto:'Cópia salva em Downloads.'}); }, 10); },
    enviarCopia: function(){}, ultimaCopia: function(){ return 0; }, pronto: function(){ window.__pronto = true; }
  };
})();`;
const ctxA = await browser.newContext({ viewport: { width: 390, height: 844 } });
const a = await ctxA.newPage();
const errosA = [];
a.on('pageerror', e => errosA.push(String(e)));
const pedidosFora = [];
await a.route('**/*', r => { const u = r.request().url(); if (u.startsWith('https://teste.local/')) return r.fulfill({ contentType: 'text/html', body: htmlApp }); pedidosFora.push(u); return r.abort(); });
a.on('console', m => { if (/Content Security Policy|Refused/.test(m.text())) errosA.push(m.text()); });
await a.addInitScript(nativo);
await a.goto('https://teste.local/');
await esperarTexto(a, 'Importar aula');
confere(await a.evaluate(() => window.__pronto === true), 'avisou o lado nativo que está pronta');
await a.click('#importar');
confere(await a.evaluate(() => window.__pediuArquivo), 'Importar abre o seletor nativo');
await a.evaluate(t => window.__arquivoRecebido(t), fs.readFileSync(path.join(capturas, 'pacote-teste.json'), 'utf8'));
await a.waitForSelector('[data-abrir]');
confere((await a.evaluate(() => window.__copiasNativas.length)) === 1, 'depois de importar, fez a cópia automática em Downloads');
await a.evaluate(t => window.__arquivoRecebido(t), fs.readFileSync(path.join(capturas, 'pacote-teste.json'), 'utf8'));
await esperarTexto(a, 'já estavam aqui');
confere(true, 'importar de novo não duplica');
await a.click('[data-abrir]');
await esperarTexto(a, 'A justificação pela fé');
await a.click('#aba-exercicios');
await a.click('[data-ex="quiz"]');
await a.click('[data-op="1"]');
await esperarTexto(a, 'Certo');
confere(true, 'no app, a múltipla escolha funciona offline');
await a.click('#voltar');
await a.click('[data-ex="sabatina"]');
await esperarTexto(a, 'acontecem no');
confere(!(await a.$('#msg')), 'no app, a conversa avisa que acontece no Claude (sem caixa de texto)');
await a.click('#voltar'); await a.click('#voltar');
await a.screenshot({ path: path.join(capturas, 'shot-teologia-app.png'), fullPage: true });
await a.evaluate(t => window.__arquivoRecebido(t), '{"formato":"outro"}');
await esperarTexto(a, 'não é uma aula');
confere(true, 'arquivo errado é recusado com aviso');
confere(errosA.length === 0, 'sem erros de JavaScript no modo app: ' + errosA.join(' | '));
confere(pedidosFora.length === 0, 'a página do app não pede nada de fora: ' + pedidosFora.join(' '));
await browser.close();

console.log(falhas ? `\n${falhas} conferência(s) falharam.` : '\nTudo certo.');
process.exit(falhas ? 1 : 0);
