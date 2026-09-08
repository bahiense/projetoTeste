/* Carrega o app inteiro fora do navegador, confere o conteúdo e roda o
   analisador contra as orações do próprio material.

   Esta última parte é a que importa de verdade: se um ajuste no léxico
   fizer as orações modelo caírem de nota, ou fizer a versão "antes" de um
   antes-e-depois empatar com a "depois", o analisador parou de medir o que
   o método ensina — e isso precisa quebrar aqui, não na mão de quem usa.

   Uso: node oracao/verificar.mjs
*/
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const raiz = path.dirname(new URL(import.meta.url).pathname);
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const arquivos = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);

const noop = () => { };
const elemento = () => new Proxy(function () { }, {
    get: (t, k) => (k === 'style' || k === 'classList' || k === 'dataset' ? elemento()
        : k === 'children' || k === 'childNodes' ? []
            : typeof k === 'symbol' ? undefined : elemento()),
    set: () => true,
    apply: () => elemento()
});
const ctx = {
    console,
    setTimeout, clearTimeout, setInterval, clearInterval,
    localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
    navigator: { language: 'pt-BR', serviceWorker: { register: noop } },
    location: { hash: '', href: 'http://localhost/', protocol: 'file:' },
    document: new Proxy({}, {
        /* devolve um elemento de mentira em vez de null: assim o app.js
           chega a montar a tela inicial aqui dentro, e um erro de render
           aparece na verificação em vez de aparecer no celular */
        get: (t, k) => k === 'getElementById' ? () => elemento()
            : k === 'querySelectorAll' ? () => []
                : k === 'querySelector' ? () => elemento()
                    : k === 'addEventListener' ? noop
                        : k === 'createElement' ? elemento
                            : k === 'body' || k === 'documentElement' ? elemento() : noop
    }),
    requestAnimationFrame: noop, scrollTo: noop, vibrate: noop,
    addEventListener: noop, removeEventListener: noop,
    Blob: function () { }, URL: { createObjectURL: () => 'blob:x', revokeObjectURL: noop },
    FileReader: function () { }, confirm: () => true, alert: noop,
    Notification: undefined, speechSynthesis: undefined,
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error,
    Map, Set, Promise, isNaN, parseInt, parseFloat, encodeURIComponent, decodeURIComponent
};
ctx.window = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);

let erros = 0;
for (const rel of arquivos) {
    const p = path.join(raiz, rel);
    if (!fs.existsSync(p)) { console.log('AUSENTE ' + rel); erros++; continue; }
    try {
        vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: rel });
    } catch (e) {
        console.log('ERRO em ' + rel + ': ' + e.message);
        erros++;
    }
}

const A = ctx.window.A || {};

console.log('\n--- conteúdo ---');
const bancos = {
    'módulos do curso': A.MODULOS, 'cenários': A.CENARIOS, 'dias do programa': A.PROGRAMA,
    'palavras do dicionário': A.DICIONARIO, 'versículos': A.VERSICULOS,
    'orações modelo': A.EXEMPLOS, 'antes e depois': A.ANTES_DEPOIS,
    'letras do ALTAR': A.ALTAR, 'ângulos': A.ANGULOS, 'pontes': A.PONTES, 'níveis': A.NIVEIS,
    'temas de sorteio': A.TEMAS, 'imprevistos': A.IMPREVISTOS
};
for (const [nome, lista] of Object.entries(bancos)) {
    console.log('  ' + nome.padEnd(24), (lista || []).length);
}
console.log('  telas'.padEnd(26), Object.keys(A.telas || {}).length,
    '->', Object.keys(A.telas || {}).join(', '));

/* --- integridade --- */
let quebras = 0;
function conferir(cond, msg) { if (!cond) { console.log('  ' + msg); quebras++; } }

conferir((A.PROGRAMA || []).length === 21, 'o programa não tem 21 dias');
(A.PROGRAMA || []).forEach((d, i) => {
    conferir(d.dia === i + 1, `dia ${d.dia}: numeração fora de ordem`);
    conferir(['tema', 'frase', 'cenario', 'duplo', 'imprevisto', 'surpresa', 'estado'].indexOf(d.modo) >= 0,
        `dia ${d.dia}: modo "${d.modo}" não existe no treino`);
    if (d.modo === 'frase') conferir(!!d.frase, `dia ${d.dia}: modo frase sem frase`);
    if (d.modo === 'duplo') conferir((d.contextos || []).length === 2, `dia ${d.dia}: modo duplo sem dois contextos`);
    if (d.filtro) conferir((A.CENARIOS || []).some(c => c.contexto === d.filtro),
        `dia ${d.dia}: filtro "${d.filtro}" não casa com nenhum cenário`);
    conferir(!!A.FASES[d.fase - 1], `dia ${d.dia}: fase ${d.fase} não existe`);
});

(A.CENARIOS || []).forEach(c => {
    conferir((A.CONTEXTOS || []).indexOf(c.contexto) >= 0, `cenário ${c.id}: contexto "${c.contexto}" fora da lista`);
    conferir(c.segundos > 0, `cenário ${c.id}: sem duração`);
    conferir(!!c.quem && !!c.necessidade, `cenário ${c.id}: leitura do momento incompleta`);
});

conferir((A.DICIONARIO || []).length === 100, 'o dicionário não tem 100 verbetes');
(A.DICIONARIO || []).forEach(d => {
    conferir((A.DIC_CATEGORIAS || []).some(c => c.id === d.cat), `verbete ${d.n}: categoria "${d.cat}" não existe`);
});
conferir((A.VERSICULOS || []).length === 50, 'não são 50 versículos');
(A.VERSICULOS || []).forEach(v => {
    conferir((A.VER_CATEGORIAS || []).some(c => c.id === v.cat), `versículo ${v.ref}: categoria "${v.cat}" não existe`);
});
(A.MODULOS || []).forEach((m, i) => conferir(m.n === i + 1, `módulo ${m.n}: numeração fora de ordem`));

/* toda tela citada numa rota precisa existir */
['hoje', 'treinar', 'dia', 'programa', 'curso', 'ferramenta', 'dicionario', 'versiculos',
    'modelos', 'antesdepois', 'momento', 'progresso', 'avaliacao', 'config'].forEach(t => {
        conferir(typeof (A.telas || {})[t] === 'function', `a tela "${t}" não foi registrada`);
    });

console.log(quebras ? `\n${quebras} problema(s) de conteúdo` : '\nConteúdo: todas as referências conferem.');

/* --- o analisador contra o próprio material --- */
console.log('\n--- analisador ---');
let falhas = 0;
const nota = (texto, alvo) => {
    const palavras = texto.split(/\s+/).length;
    const seg = alvo || Math.round(palavras / 2.2);
    return A.analise.analisar(texto, { segundos: seg, alvo: seg }).nota;
};

for (const e of (A.EXEMPLOS || [])) {
    const n = nota(e.oracao);
    const ok = n >= 80;
    if (!ok) falhas++;
    console.log(`  ${ok ? 'ok ' : 'FALHOU'} ${String(n).padStart(3)}  ${e.titulo}`);
}
console.log('  (as orações do material precisam passar de 80)');

for (const ad of (A.ANTES_DEPOIS || [])) {
    const a = nota(ad.antes), b = nota(ad.depois);
    const ok = b > a;
    if (!ok) falhas++;
    console.log(`  ${ok ? 'ok ' : 'FALHOU'} ${String(a).padStart(3)} → ${String(b).padStart(3)}  ${ad.tema}`);
}
console.log('  (o "depois" precisa medir mais que o "antes")');

/* padrões que o material trata como o problema central */
const casos = [
    ['oração em lista', 'Senhor abençoa minha família abençoa o meu trabalho abençoa a minha igreja ' +
        'abençoa a minha saúde abençoa os meus amigos em nome de Jesus amém', 60],
    ['vocativos em fila', 'Pai... Senhor... meu Deus... Pai, nós te pedimos... Senhor... nós te pedimos ' +
        'Senhor... Pai... abençoa Senhor, abençoa Pai, em nome de Jesus amém', 60]
];
for (const [nome, texto, alvo] of casos) {
    const n = nota(texto, alvo);
    const ok = n <= 60;
    if (!ok) falhas++;
    console.log(`  ${ok ? 'ok ' : 'FALHOU'} ${String(n).padStart(3)}  ${nome} (precisa ficar em 60 ou menos)`);
}

const total = erros + quebras + falhas;
console.log(total ? `\n${total} problema(s)` : '\nTudo certo.');
process.exit(total ? 1 : 0);
