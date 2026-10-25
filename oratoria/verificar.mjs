/* Carrega os arquivos do app fora do navegador e confere o que dá para
   conferir sem tela: banco de temas, roteiro local, contagem de vícios,
   ritmo, cobertura, avaliação local, leitura do JSON da IA e histórico.
   Uso: node oratoria/verificar.mjs                                      */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const raiz = path.dirname(new URL(import.meta.url).pathname);
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const arquivos = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);

const nada = () => { };
const guardado = {};
const ctx = {
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    localStorage: {
        getItem: k => (k in guardado ? guardado[k] : null),
        setItem: (k, v) => { guardado[k] = String(v); },
        removeItem: k => { delete guardado[k]; }
    },
    navigator: { language: 'pt-BR' },
    location: { hash: '', protocol: 'file:' },
    document: { addEventListener: nada, getElementById: () => null, querySelectorAll: () => [] },
    addEventListener: nada,
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Promise,
    Blob: function (partes, op) { this.partes = partes; this.type = op && op.type; },
    DataView, ArrayBuffer, Uint8Array, Float32Array
};
ctx.window = ctx;
vm.createContext(ctx);

let erros = 0;
const confere = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) erros++; };

for (const rel of arquivos) {
    vm.runInContext(fs.readFileSync(path.join(raiz, rel), 'utf8'), ctx, { filename: rel });
}
const O = ctx.O;

console.log('Arquivos do index.html');
for (const rel of arquivos) confere(fs.existsSync(path.join(raiz, rel)), rel);
const sw = fs.readFileSync(path.join(raiz, 'sw.js'), 'utf8');
for (const rel of arquivos) confere(sw.includes("'" + rel + "'"), 'sw.js guarda ' + rel);

console.log('Banco de temas');
for (const nivel of Object.keys(O.temas.NIVEIS)) {
    const todos = O.temas.todos(nivel);
    confere(todos.length >= 10, nivel + ': ' + todos.length + ' temas');
    confere(todos.every(t => t.titulo && t.objetivo && t.pontos.length >= 3), nivel + ': todos com objetivo e 3+ pontos');
    const feitos = todos.slice(1).map(t => t.titulo);
    confere(O.temas.sortear(nivel, feitos).titulo === todos[0].titulo, nivel + ': sorteio evita os já feitos');
}

console.log('Roteiro local');
const tema = O.temas.todos('intermediario')[0];
const rot = O.roteiro.montar(tema, 2);
confere(rot.pontos.length === tema.pontos.length && rot.estrutura.length === 3, 'pontos e três partes');
confere(rot.dicas.length >= 3 && rot.estrategia.length >= 4, 'dicas e estratégia');
confere(O.roteiro.montar({ titulo: 'Meu tema', nivel: 'avancado' }, 3).pontos.length === 3, 'tema próprio ganha pontos genéricos');

console.log('Vícios de linguagem');
const v = O.analise.contarVicios('Então, tipo assim, né, eu acho que, tipo, a gente precisa, né? Éé, na verdade é isso. Então tá.');
const mapa = Object.fromEntries(v.map(x => [x.termo, x.vezes]));
confere(mapa['né'] === 2, '"né" 2x (' + mapa['né'] + ')');
confere(mapa['tipo assim'] === 1 && mapa['tipo'] === 1, '"tipo assim" não conta também como "tipo"');
confere(mapa['então'] === 2, '"então" 2x');
confere(mapa['na verdade'] === 1 && mapa['tá'] === 1, '"na verdade" e "tá"');
confere(!mapa['assim'], '"assim" de "tipo assim" não conta sozinho');
confere(mapa['éé / ãã (hesitação)'] === 1, 'hesitação "Éé"');
confere(O.analise.contarVicios('A estação está cheia e o tipógrafo chegou.').length === 0, 'sem falso positivo dentro de palavras');

console.log('Ritmo e cobertura');
const fala = Array(140).fill('palavra').join(' ');
confere(O.analise.ritmo(fala, 60).ppm === 140, '140 palavras em 60s = 140 ppm');
confere(O.analise.nomeRitmo(140) === 'adequado' && O.analise.nomeRitmo(200) === 'acelerado' &&
    O.analise.nomeRitmo(90) === 'lento', 'nomes do ritmo');
const cob = O.analise.cobertura('Primeiro, ter prioridades claras. Depois, organizar o tempo do dia.',
    ['Prioridades claras', 'Organização do tempo', 'Pausas e bem-estar']);
confere(cob[0].coberto && cob[1].coberto && !cob[2].coberto, 'cobertura por radical (organizar ≈ organização)');

console.log('Avaliação local');
const boa = 'Produtividade no trabalho depende de prioridades claras. ' +
    'A organização do tempo ajuda muito, e com menos distrações rendemos mais. ' +
    'Pausas e bem-estar também contam. ';
const textoBom = Array(12).fill(boa).join('');
const rotProd = O.roteiro.montar(tema, 2);
const a1 = O.analise.avaliarLocal(textoBom, O.analise.palavras(textoBom).length / 140 * 60, rotProd, 2);
confere(a1.nota >= 9, 'fala limpa e completa tira nota alta (' + a1.nota + ')');
const ruim = Array(40).fill('então tipo né eu acho').join(' ');
const a2 = O.analise.avaliarLocal(ruim, 30, rotProd, 2);
confere(a2.nota < a1.nota - 3, 'fala cheia de vícios, curta e fora do tema cai (' + a2.nota + ')');
confere(a2.melhorar.some(m => m.titulo === 'Vícios de linguagem'), 'vícios viram item de melhoria');
const a3 = O.analise.avaliarLocal('', 50, rotProd, 2);
confere(a3.nota === null && /tempo/.test(a3.resumo), 'sem transcrição: sem nota, e diz o porquê');

console.log('Resposta da IA');
confere(O.ia.lerJSON('```json\n{"nota": 7.5}\n```').nota === 7.5, 'JSON cercado de ```json');
confere(O.ia.lerJSON('Aqui está: {"a":1} pronto').a === 1, 'JSON com texto em volta');
let lancou = false;
try { O.ia.lerJSON('sem json'); } catch (e) { lancou = true; }
confere(lancou, 'texto sem JSON vira erro legível');

console.log('Histórico');
O.store.registrar({ tema: { titulo: 'A' }, segundos: 60, avaliacao: { nota: 7 } });
O.store.registrar({ tema: { titulo: 'B' }, segundos: 60, avaliacao: { nota: 8 } });
confere(O.store.temasFeitos().join() === 'A,B', 'temas feitos');
confere(O.store.sequencia() === 1, 'sequência de 1 dia');
const backup = O.store.exportar();
confere(!JSON.parse(backup).cfg.chaveGoogle && JSON.parse(backup).historico.length === 2, 'backup sem a chave');
confere(O.store.importar(backup) === 0, 'importar o mesmo backup não duplica');

console.log('WAV');
const wav = O.gravador.codificarWav(new Float32Array([0, 0.5, -0.5, 1]), 16000);
const dv = new DataView(wav.partes[0]);
confere(wav.type === 'audio/wav' && dv.getUint32(24, true) === 16000 && dv.getUint32(40, true) === 8,
    'cabeçalho WAV 16 kHz com 4 amostras');

console.log(erros ? '\n' + erros + ' falha(s).' : '\nTudo certo.');
process.exit(erros ? 1 : 0);
