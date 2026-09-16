/* Prepara o texto bíblico embutido no app, a partir da digitalização em
   domínio público da Almeida de 1911.

   Por que 1911 e não a NVI, a ARA ou a NAA: essas são texto licenciado, e
   distribuir os 31 mil versículos delas dentro de um app seria violação de
   direito autoral, por mais pessoal que seja o uso. A Almeida de 1911 é a
   tradução mais recente em português que já caiu em domínio público — dá
   para embutir, ler offline e distribuir sem pedir licença a ninguém.

   Fonte da digitalização: projeto JFAAL (github.com/BibliaJFAAL/JFAAL),
   pasta "original", que é o texto de 1911 sem a revisão por IA que o mesmo
   projeto oferece na pasta "atualizada".

   São duas edições do mesmo texto, e a diferença entre elas não é só de
   grafia — por isso o app oferece as duas em vez de escolher por você:

   - "1911": a digitalização da edição de 1911 como ela é, com a grafia da
     época ("valle", "aquelle", "n'elle"). É o texto histórico, sem
     intermediário.
   - "jfaal": a revisão do projeto JFAAL sobre esse mesmo texto, feita com
     apoio de inteligência artificial. Lê muito melhor (ortografia atual),
     mas mexe também em tempo verbal e pronome — não é só ortografia, e
     quem lê precisa saber disso.

   Uso:
     curl -sL -o /tmp/1911.json https://raw.githubusercontent.com/BibliaJFAAL/JFAAL/main/original/1911-JFAAtualizada.json
     curl -sL -o /tmp/jfaal.json https://raw.githubusercontent.com/BibliaJFAAL/JFAAL/main/atualizada/1911-JFAAtualizadaLivre.json
     node preparar-texto.mjs 1911 /tmp/1911.json
     node preparar-texto.mjs jfaal /tmp/jfaal.json

   Saída: data/texto/<edição>/01.json … 66.json, um arquivo por livro,
   carregados sob demanda — ninguém baixa 4 MB para ler um salmo.        */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const raiz = path.dirname(new URL(import.meta.url).pathname);
const edicao = process.argv[2];
const entrada = process.argv[3];
if (!edicao || !entrada || !/^[a-z0-9]+$/.test(edicao)) {
    console.error('uso: node preparar-texto.mjs <edição> <arquivo-fonte.json>');
    process.exit(1);
}

/* A estrutura de livros do app é a autoridade: nomes, ordem e quantidade
   de capítulos. O texto tem de encaixar nela, não o contrário. */
const ctx = { console, Object, Array, String, Number, Math, JSON, Date, RegExp, parseInt, parseFloat, isNaN };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(raiz, 'data/biblia.js'), 'utf8'), ctx, { filename: 'data/biblia.js' });
const bib = ctx.window.B.biblia;

const fonte = JSON.parse(fs.readFileSync(entrada, 'utf8'));
const livrosFonte = fonte.books || fonte;

if (livrosFonte.length !== 66) {
    console.error('a fonte tem ' + livrosFonte.length + ' livros, não 66');
    process.exit(1);
}

const destino = path.join(raiz, 'data/texto', edicao);
fs.mkdirSync(destino, { recursive: true });

let problemas = 0;
let totalCaps = 0, totalVers = 0, bytes = 0;

bib.LIVROS.forEach((livro, i) => {
    const bruto = livrosFonte[i];
    const caps = (bruto.chapters || []).map(c => {
        const vv = (c.verses || []);
        /* Versículo fora de ordem viraria texto trocado na tela, em
           silêncio. Melhor gritar aqui. */
        vv.forEach((v, k) => {
            if (v.verse !== k + 1) {
                console.warn('AVISO ' + livro.nome + ' ' + c.chapter + ': versículo ' +
                    v.verse + ' na posição ' + (k + 1));
                problemas++;
            }
        });
        return vv.map(v => String(v.text).replace(/\s+/g, ' ').trim());
    });

    if (caps.length !== livro.caps) {
        console.error('ERRO ' + livro.nome + ': a fonte traz ' + caps.length +
            ' capítulos, o app espera ' + livro.caps);
        problemas++;
    }
    const vazios = caps.filter(c => c.length === 0).length;
    if (vazios) {
        console.error('ERRO ' + livro.nome + ': ' + vazios + ' capítulos sem versículo');
        problemas++;
    }

    const arquivo = String(livro.ordem + 1).padStart(2, '0') + '.json';
    const conteudo = JSON.stringify({ livro: livro.nome, caps: caps });
    fs.writeFileSync(path.join(destino, arquivo), conteudo);

    totalCaps += caps.length;
    totalVers += caps.reduce((s, c) => s + c.length, 0);
    bytes += conteudo.length;
});

console.log('edição "' + edicao + '" | livros: 66 | capítulos: ' + totalCaps +
    ' | versículos: ' + totalVers);
console.log('tamanho: ' + (bytes / 1024 / 1024).toFixed(1) + ' MB em 66 arquivos');
console.log(problemas ? '✗ ' + problemas + ' problema(s)' : '✓ sem problemas');
process.exit(problemas ? 1 : 0);
