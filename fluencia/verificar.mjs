/* Carrega os arquivos JS do app num contexto tipo navegador e confere o conteúdo.
   Uso: node fluencia/verificar.mjs            */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const raiz = path.dirname(new URL(import.meta.url).pathname);
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const arquivos = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);

const noop = () => {};
const elemento = () => new Proxy(function () {}, {
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
    location: { hash: '', href: 'http://localhost/' },
    document: new Proxy({}, {
        get: (t, k) => k === 'getElementById' ? () => null
            : k === 'querySelectorAll' ? () => []
                : k === 'querySelector' ? () => null
                    : k === 'addEventListener' ? noop
                        : k === 'createElement' ? elemento
                            : k === 'body' || k === 'documentElement' ? elemento() : noop
    }),
    requestAnimationFrame: noop,
    addEventListener: noop, removeEventListener: noop,
    Blob: function () { }, URL: { createObjectURL: () => 'blob:x', revokeObjectURL: noop },
    FileReader: function () { }, confirm: () => true, alert: noop,
    speechSynthesis: undefined,
    Audio: function () { return elemento(); },
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Map, Set, Promise, isNaN, parseInt, parseFloat, encodeURIComponent, decodeURIComponent
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

const F = ctx.window.F || {};
const d = F.data || {};
console.log('\n--- conteúdo carregado ---');
for (const k of Object.keys(d)) {
    const v = d[k];
    console.log('  ' + k.padEnd(14), Array.isArray(v) ? v.length + ' itens' : typeof v === 'object' ? Object.keys(v).length + ' chaves' : v);
}
console.log('  módulos:', Object.keys(F).filter(k => k !== 'data' && k !== 'telas').join(', '));
console.log('  telas:  ', Object.keys(F.telas || {}).length, '->', Object.keys(F.telas || {}).join(', '));
/* --- referências cruzadas do currículo ---
   Cada semana aponta para um som, uma passagem, um ditado, um drill, um
   role-play e uma função. Um id trocado só apareceria como tela vazia
   semanas depois, na mão do aluno. */
const ids = (o) => new Set((o || []).map((x) => x.id));
const bancos = {
    som: ids(d.sons), shadowing: ids(d.shadowing), ditado: ids(d.ditado),
    drill: ids(d.drills), dialogo: ids(d.dialogos), funcao: ids(d.funcoes)
};
let quebradas = 0;
for (const w of (d.curriculo || [])) {
    for (const campo of Object.keys(bancos)) {
        if (!bancos[campo].has(w[campo])) {
            console.log(`  semana ${w.s}: ${campo} "${w[campo]}" não existe`);
            quebradas++;
        }
    }
    if (!(d.fases || []).some((f) => f.id === w.fase)) {
        console.log(`  semana ${w.s}: fase ${w.fase} não existe`);
        quebradas++;
    }
    if (w.escada < 1 || w.escada > (d.escada || []).length) {
        console.log(`  semana ${w.s}: degrau ${w.escada} fora da escada`);
        quebradas++;
    }
}
const semanas = (d.curriculo || []).map((w) => w.s).join();
const esperado = (d.curriculo || []).map((_, i) => i + 1).join();
if (semanas !== esperado) { console.log('  numeração de semanas com furo'); quebradas++; }
console.log(quebradas ? `\n${quebradas} referência(s) quebrada(s) no currículo`
    : `\nCurrículo: ${(d.curriculo || []).length} semanas, todas as referências conferem.`);

/* --- alcance de cada banco, em dias de uso --- */
const gasto = { chunks: 20, drills: 10, ditado: 6 };
const total = (lista, campo) => (lista || []).reduce((a, x) => a + (x[campo] || []).length, 0);
console.log('\n--- alcance ---');
console.log('  chunks       ', (d.chunks || []).length, 'blocos → ~' + Math.round((d.chunks || []).length / gasto.chunks), 'dias de material novo');
console.log('  drills       ', total(d.drills, 'itens'), 'pares → ~' + Math.round(total(d.drills, 'itens') / gasto.drills), 'sessões');
console.log('  ditado       ', total(d.ditado, 'itens'), 'frases → ~' + Math.round(total(d.ditado, 'itens') / gasto.ditado), 'sessões');
console.log('  arena        ', Object.values(d.prompts || {}).reduce((a, v) => a + v.length, 0), 'temas → 1 por sessão');
console.log('  shadowing    ', (d.shadowing || []).length, 'passagens → 1 por semana');
console.log('  role-play    ', (d.dialogos || []).length, 'cenas → 1 por semana');

console.log(erros || quebradas ? '\n' + (erros + quebradas) + ' problema(s)' : '\nTudo carregou sem erro.');
process.exit(erros || quebradas ? 1 : 0);
