/* Gera a versão que roda dentro do Claude (o artifact).

   É o mesmo app da pasta, com três diferenças que o ambiente exige:
   a página publicada não leva <html>/<head>/<body> próprios (a plataforma
   embrulha), não registra service worker (o cache é dela) e anuncia, na
   primeira abertura, que ali a IA já vem ligada.

   O conteúdo sai do próprio index.html, então as duas versões não têm como
   divergir: mexeu no app, rode isto de novo.

   Uso: node biblia/gerar-artefato.mjs                                     */
import fs from 'node:fs';
import path from 'node:path';

const raiz = path.dirname(new URL(import.meta.url).pathname);
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');

const corpo = html.match(/<body>([\s\S]*)<\/body>/)[1].trim();
/* Dentro do Claude o título é o nome do artifact numa galeria com dezenas
   de outros: vale o nome, sem o subtítulo explicativo da versão web. */
const titulo = html.match(/<title>([^<]*)<\/title>/)[1].split('—')[0].trim();
const fonte = html.match(/<link href="(https:\/\/fonts[^"]+)"[^>]*>/)[1];

const pagina = `<title>${titulo}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fonte}" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">

<!-- Aqui o cache é da plataforma; um service worker por cima só serviria
     para servir código velho depois de uma republicação. -->
<script>window.__SEM_SW = true;</script>

${corpo}
`;

const destino = path.join(raiz, 'artefato');
fs.mkdirSync(destino, { recursive: true });
fs.writeFileSync(path.join(destino, 'index.html'), pagina);

/* A lista de arquivos que acompanham a página é a mesma do service worker,
   menos o que só existe fora do Claude. */
const sw = fs.readFileSync(path.join(raiz, 'sw.js'), 'utf8');
const fora = ['./', 'index.html', 'manifest.webmanifest', 'sw.js', 'js/ponte-android.js'];
const arquivos = [...sw.matchAll(/'([^']+)'/g)]
    .map(m => m[1])
    .filter(f => !fora.includes(f) && fs.existsSync(path.join(raiz, f)));

fs.writeFileSync(path.join(destino, 'arquivos.json'), JSON.stringify(arquivos, null, 2));

console.log('artefato/index.html gerado (' + Math.round(pagina.length / 1024) + ' KB)');
console.log(arquivos.length + ' arquivos de apoio:');
arquivos.forEach(f => console.log('  ' + f));
