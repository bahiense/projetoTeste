/* Gera app.html: o app inteiro num arquivo só, com CSS e JS embutidos.
   Rode depois de mexer em index.html, css/ ou js/:  node gerar-app-unico.mjs  */
import fs from 'node:fs';
import path from 'node:path';

const raiz = path.dirname(new URL(import.meta.url).pathname);
const ler = (p) => fs.readFileSync(path.join(raiz, p), 'utf8');

let html = ler('index.html');

// CSS
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/,
    (_, arq) => '<style>\n' + ler(arq) + '\n</style>');

// JS (na mesma ordem das tags)
html = html.replace(/<script src="([^"]+)"><\/script>/g,
    (_, arq) => '<script>\n' + ler(arq) + '\n</script>');

// sem servidor não há manifest nem service worker
html = html.replace(/\s*<link rel="manifest"[^>]*>/, '');
html = html.replace(/\s*<link rel="icon"[^>]*>/, '');
html = html.replace(/\s*<link rel="apple-touch-icon"[^>]*>/, '');
html = html.replace("navigator.serviceWorker.register('sw.js')",
    "location.protocol !== 'file:' && navigator.serviceWorker.register('sw.js')");

fs.writeFileSync(path.join(raiz, 'app.html'), html);
console.log('app.html gerado —', (html.length / 1024).toFixed(0) + ' KB, ' + html.split('\n').length + ' linhas');
