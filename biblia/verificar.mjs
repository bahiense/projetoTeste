/* Carrega os arquivos do app fora do navegador e confere o que dá para
   conferir sem tela: dados da Bíblia, interpretação de referências,
   intervalos de capítulos, importação do backup antigo e os prompts.
   Uso: node biblia/verificar.mjs                                      */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const raiz = path.dirname(new URL(import.meta.url).pathname);
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const arquivos = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);

const nada = () => { };
const elemento = () => new Proxy(function () { }, {
    get: (t, k) => (k === 'style' || k === 'classList' || k === 'dataset' ? elemento()
        : k === 'children' || k === 'childNodes' ? []
            : typeof k === 'symbol' ? undefined : elemento()),
    set: () => true,
    apply: () => elemento()
});

const guardado = {};
const ctx = {
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    localStorage: {
        getItem: k => (k in guardado ? guardado[k] : null),
        setItem: (k, v) => { guardado[k] = String(v); },
        removeItem: k => { delete guardado[k]; }
    },
    navigator: { language: 'pt-BR', serviceWorker: { register: nada } },
    location: { hash: '', protocol: 'file:', href: 'file:///' },
    document: new Proxy({}, {
        get: (t, k) => k === 'getElementById' ? () => null
            : k === 'querySelectorAll' ? () => []
                : k === 'querySelector' ? () => null
                    : k === 'addEventListener' ? nada
                        : k === 'createElement' ? elemento
                            : k === 'body' || k === 'documentElement' ? elemento() : nada
    }),
    indexedDB: undefined,
    fetch: () => Promise.reject(new Error('sem rede no teste')),
    AbortController: function () { this.signal = {}; this.abort = nada; },
    TextDecoder: function () { this.decode = () => ''; },
    Blob: function () { }, URL: { createObjectURL: () => '', revokeObjectURL: nada },
    FileReader: function () { }, CSS: { escape: s => s },
    requestAnimationFrame: nada, addEventListener: nada, removeEventListener: nada,
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Map, Set,
    Promise, isNaN, parseInt, parseFloat, encodeURIComponent, decodeURIComponent
};
ctx.window = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);

let erros = 0;
const falhou = (msg) => { console.log('  ✗ ' + msg); erros++; };
const passou = (msg) => console.log('  ✓ ' + msg);
const confere = (cond, msg) => cond ? passou(msg) : falhou(msg);

for (const rel of arquivos) {
    const p = path.join(raiz, rel);
    if (!fs.existsSync(p)) { falhou('arquivo ausente: ' + rel); continue; }
    try { vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: rel }); }
    catch (e) { falhou('erro ao carregar ' + rel + ': ' + e.message); }
}

const B = ctx.window.B;
if (!B || !B.biblia) { console.log('nada carregou; abortando'); process.exit(1); }

console.log('\n--- dados da Bíblia ---');
confere(B.biblia.LIVROS.length === 66, '66 livros');
confere(B.biblia.TOTAL_CAPS === 1189, '1.189 capítulos (deu ' + B.biblia.TOTAL_CAPS + ')');
confere(B.biblia.GRUPOS.length === 8, '8 grupos de leitura');
confere(B.biblia.LIVROS.filter(l => l.testamento === 'AT').length === 39, '39 livros no Antigo Testamento');

const dobrados = B.biblia.LIVROS.map(l => l.nome).filter((n, i, a) => a.indexOf(n) !== i);
confere(dobrados.length === 0, 'nenhum livro repetido' + (dobrados.length ? ': ' + dobrados : ''));

console.log('\n--- interpretação de referências ---');
const casos = [
    ['João 3', 'João', 3], ['joao', 'João', null], ['jo 1', 'João', 1],
    ['Jó 3', 'Jó', 3], ['job', 'Jó', null], ['1co 13', '1 Coríntios', 13],
    ['sl 119', 'Salmos', 119], ['2 sm 11', '2 Samuel', 11], ['ap 22', 'Apocalipse', 22],
    ['cantares 2', 'Cânticos', 2], ['3jo', '3 João', null], ['apoca', 'Apocalipse', null]
];
for (const [entrada, livro, cap] of casos) {
    const r = B.biblia.interpretar(entrada);
    confere(r && r.livro.nome === livro && (r.capitulo || null) === cap,
        '"' + entrada + '" → ' + livro + (cap ? ' ' + cap : '') +
        (r ? '' : ' (veio nada)') + (r && r.livro.nome !== livro ? ' (veio ' + r.livro.nome + ')' : ''));
}
for (const ruim of ['Gênesis 51', 'xyz', '', 'Salmos 0']) {
    confere(B.biblia.interpretar(ruim) === null, '"' + ruim + '" não vira referência');
}

console.log('\n--- intervalos de capítulos ---');
const st = B.store;
st.carregar();
const vai = s => st.paraTexto(st.deTexto(s));
confere(vai('1-3,7') === '1-3,7', 'ida e volta de "1-3,7"');
confere(vai('3,1,2') === '1-3', 'números soltos viram intervalo');
confere(vai('5-5') === '5', 'intervalo de um capítulo só');
confere(vai('') === '', 'vazio continua vazio');

st.marcarFaixa('Gênesis', 1, 11, true);
confere(st.lidosNoLivro('Gênesis') === 11, 'Gênesis 1-11 marcado');
confere(st.leu('Gênesis', 11) && !st.leu('Gênesis', 12), 'limite do intervalo certo');
st.marcar('Gênesis', 11, false);
confere(st.lidosNoLivro('Gênesis') === 10, 'desmarcar tira um capítulo');
confere(st.marcar('Gênesis', 51, true) === false, 'capítulo inexistente é recusado');

const pnl = st.primeiroNaoLido('pentateuco');
confere(pnl.livro === 'Gênesis' && pnl.cap === 11, 'primeiro não lido é Gênesis 11');

console.log('\n--- lista colada ---');
const lista = st.interpretarLista('Gênesis 1-50, Salmos, Jo 1-10, 1co, banana');
confere(lista.achados.length === 4, '4 trechos entendidos');
confere(lista.erros.length === 1 && lista.erros[0] === 'banana', '"banana" cai nos erros');
const salmos = lista.achados.find(a => a.livro.nome === 'Salmos');
confere(salmos && salmos.de === 1 && salmos.ate === 150, 'livro sem número = livro inteiro');
st.aplicarLista(lista.achados);
confere(st.lidosNoLivro('Salmos') === 150, 'Salmos inteiro marcado pela lista');
confere(st.lidosNoLivro('João') === 10, 'João 1-10 marcado pela lista');

console.log('\n--- backup do app antigo ---');
const antigo = {
    groups: {
        pentateuco: { currentBookIndex: 1, currentChapter: 5, completedCycles: 0, totalChaptersRead: 44, todayRead: true },
        evangelhos: { currentBookIndex: 0, currentChapter: 1, completedCycles: 1, totalChaptersRead: 117, todayRead: false }
    },
    history: [{ date: new Date().toISOString(), group: 'Pentateuco', book: 'Êxodo', chapter: 4, icon: '📜' }],
    readDates: [new Date().toDateString()], streak: 3, maxStreak: 9,
    lastReadDate: new Date().toDateString(), totalBiblesCompleted: 0
};
confere(st.ehFormatoAntigo(antigo), 'formato antigo reconhecido');
const resumo = st.resumoDoArquivo(antigo);
/* Gênesis inteiro (50) + Êxodo 1-4 (4) + Evangelhos inteiros (117) = 171 */
confere(resumo.capitulos === 171, 'capítulos deduzidos do backup antigo: 171 (deu ' + resumo.capitulos + ')');
confere(resumo.sequencia === 3 && resumo.biblias === 0, 'sequência e Bíblias vieram junto');
st.substituirPor(resumo.estado);
confere(st.leu('Gênesis', 50) && st.leu('Êxodo', 4) && !st.leu('Êxodo', 5), 'posição do Pentateuco virou leitura');
confere(st.leu('Atos', 28), 'ciclo fechado marcou o grupo inteiro');
confere(st.get().grupos.pentateuco.livro === 'Êxodo' && st.get().grupos.pentateuco.cap === 5, 'posição preservada');
confere(st.get().grupos.pentateuco.hoje === true, 'backup do mesmo dia preserva o "já li hoje"');
const ontem = new Date(); ontem.setDate(ontem.getDate() - 1);
const velho = JSON.parse(JSON.stringify(antigo));
velho.lastReadDate = ontem.toDateString();
confere(st.resumoDoArquivo(velho).estado.grupos.pentateuco.hoje === false,
    'backup de ontem não marca leitura de hoje');

console.log('\n--- plano ---');
st.zerar();
const antes = B.plano.leituraAtual('pentateuco');
confere(antes.ref === 'Gênesis 1', 'plano começa em Gênesis 1');
const r1 = B.plano.marcarLida('pentateuco');
confere(r1.lido.cap === 1 && B.plano.leituraAtual('pentateuco').ref === 'Gênesis 2', 'marcar avança o plano');
confere(st.leu('Gênesis', 1), 'marcar registra a leitura');
confere(B.plano.estatisticas().sequencia === 1, 'sequência começa em 1');
B.plano.desfazerUltima();
confere(!st.leu('Gênesis', 1) && B.plano.leituraAtual('pentateuco').ref === 'Gênesis 1', 'desfazer volta tudo');

/* Uma volta inteira num grupo pequeno fecha o ciclo. */
st.zerar();
let ciclou = false;
for (let i = 0; i < 67; i++) ciclou = B.plano.marcarLida('profetasMenores').fechouCiclo || ciclou;
confere(ciclou, 'os 67 capítulos dos Profetas Menores fecham um ciclo');
confere(st.get().grupos.profetasMenores.ciclos === 1, 'ciclo contabilizado');
confere(B.plano.leituraAtual('profetasMenores').ref === 'Oséias 1', 'ciclo volta ao começo');

st.zerar();
B.biblia.GRUPOS.forEach(g => g.livros.forEach(l => st.marcarFaixa(l.nome, 1, l.caps, true)));
confere(B.plano.progressoBiblia().pct === 100, 'Bíblia inteira marcada dá 100%');
confere(B.plano.progressoBiblia().lidos === 1189, 'contagem total bate com 1.189');

console.log('\n--- prompts ---');
const cfg = st.get().config;
const pc = B.prompts.montar({ livro: B.biblia.livro('João'), capitulo: 3 }, cfg);
const pl = B.prompts.montar({ livro: B.biblia.livro('João'), capitulo: null }, cfg);
confere(pc.tipo === 'capitulo' && pl.tipo === 'livro', 'capítulo e livro geram pedidos diferentes');
confere(pc.titulo === 'João 3' && pl.titulo === 'João', 'títulos certos');
for (const parte of ['Quem é quem', 'palavras no original', 'teólogos', 'aponta para Cristo',
    'Ligações com o resto da Bíblia', 'discordam', 'Oração']) {
    confere(pc.usuario.includes(parte), 'o pedido do capítulo cobre "' + parte + '"');
}
for (const parte of ['cartão do livro', 'mapa do livro', 'fio da meada', 'grandes temas',
    'Cristo neste livro', 'Como ler este livro']) {
    confere(pl.usuario.toLowerCase().includes(parte.toLowerCase()), 'o panorama cobre "' + parte + '"');
}
confere(pc.usuario.includes('grego') && !pc.usuario.includes('hebraico ou aramaico'),
    'João pede grego, não hebraico');
const pg = B.prompts.montar({ livro: B.biblia.livro('Gênesis'), capitulo: 1 }, cfg);
confere(pg.usuario.includes('hebraico ou aramaico'), 'Gênesis pede hebraico');
confere(pc.sistema.includes('NUNCA invente citação'), 'a regra contra citação inventada está no sistema');
confere(pc.sistema.includes(cfg.versao), 'a tradução escolhida entra no pedido');

console.log('\n--- markdown ---');
const md = B.md.render('## Título\n\nTexto com **negrito** e *itálico*.\n\n- um\n- dois\n\n> citação');
confere(md.includes('<h3>Título</h3>'), '## vira h3');
confere(md.includes('<strong>negrito</strong>') && md.includes('<em>itálico</em>'), 'negrito e itálico');
confere(md.includes('<li>um</li>') && md.includes('<ul>'), 'lista');
confere(md.includes('<blockquote>'), 'citação');
const perigoso = B.md.render('<img src=x onerror=alert(1)> e <script>mau()</script>');
confere(!perigoso.includes('<img') && !perigoso.includes('<script'), 'HTML de fora é escapado');

console.log('\n--- modelos da IA ---');
confere(!!B.ia.MODELOS['claude-opus-5'], 'Opus 5 disponível');
confere(B.ia.MODELOS['claude-haiku-4-5'].pensa === false, 'Haiku marcado como sem pensamento adaptativo');
confere(B.ia.custo({ entrada: 1e6, saida: 1e6 }, 'claude-opus-5') === 30, 'conta de custo do Opus');

console.log('\n--- service worker ---');
const sw = fs.readFileSync(path.join(raiz, 'sw.js'), 'utf8');
const noSw = [...sw.matchAll(/'([^']+\.(?:js|css|html|png|webmanifest))'/g)].map(m => m[1]);
for (const f of arquivos.concat(['css/style.css', 'manifest.webmanifest'])) {
    confere(noSw.includes(f), 'sw.js guarda ' + f);
}
for (const f of noSw) {
    confere(fs.existsSync(path.join(raiz, f)), 'existe o arquivo ' + f);
}

console.log('\n' + (erros ? '✗ ' + erros + ' problema(s)' : '✓ tudo certo'));
process.exit(erros ? 1 : 0);
