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
console.log(erros ? '\n' + erros + ' arquivo(s) com problema' : '\nTudo carregou sem erro.');
process.exit(erros ? 1 : 0);
