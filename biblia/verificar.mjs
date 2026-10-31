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

/* A tela de gerar deixou de ser um cartão de Ajustes: virou a Oficina, com
   o acervo e a travessia em módulos próprios. Os testes olham o conjunto —
   o que importa é que a pessoa veja aquilo em algum lugar. */
function telasDaIA() {
    return ['js/views/config.js', 'js/views/oficina.js', 'js/acervo.js', 'js/travessia.js']
        .map(f => fs.readFileSync(path.join(raiz, f), 'utf8')).join('\n');
}

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

console.log('\n--- prompts: estudo simples ---');
{
    const cfg = st.get().config;
    const sc = B.prompts.montar({ livro: B.biblia.livro('João'), capitulo: 3 }, cfg, 'simples');
    const sl = B.prompts.montar({ livro: B.biblia.livro('Rute'), capitulo: null }, cfg, 'simples');
    const secoes = (sc.usuario.match(/^### /gm) || []).length;
    confere(secoes === 3, 'o estudo simples do capítulo tem exatamente 3 seções (deu ' + secoes + ')');
    confere((sl.usuario.match(/^### /gm) || []).length === 3, 'o do livro também');
    for (const parte of ['O contexto', 'Quem é quem', 'Para a sua vida',
        'Histórico', 'Cultural', 'Geográfico', 'está em jogo',
        'A aplicação', 'perguntas para meditar', 'oração']) {
        confere(sc.usuario.includes(parte), 'o simples cobre "' + parte + '"');
        confere(sl.usuario.includes(parte) || parte === 'está em jogo' || parte === 'A aplicação',
            'o simples do livro cobre "' + parte + '"');
    }
    for (const fora of ['hebraico', 'teólogos', 'referências cruzadas', 'discordam',
        'aponta para Cristo', 'Strong']) {
        confere(!sc.usuario.includes(fora), 'o simples não pede "' + fora + '"');
    }
    confere(sc.simples === true && sl.simples === true, 'o pedido simples se identifica como tal');
    confere(sc.usuario.length < 2500, 'o pedido simples é curto (' + sc.usuario.length + ' caracteres)');
    confere(/500 a 800 palavras/.test(sc.usuario), 'o simples pede de 500 a 800 palavras');
}

console.log('\n--- prompts: estudo completo ---');
const cfg = st.get().config;
const pc = B.prompts.montar({ livro: B.biblia.livro('João'), capitulo: 3 }, cfg, 'completo');
const pl = B.prompts.montar({ livro: B.biblia.livro('João'), capitulo: null }, cfg, 'completo');
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
const pg = B.prompts.montar({ livro: B.biblia.livro('Gênesis'), capitulo: 1 }, cfg, 'completo');
confere(pg.usuario.includes('hebraico ou aramaico'), 'Gênesis pede hebraico');
confere(pc.sistema.includes('NUNCA invente citação'), 'a regra contra citação inventada está no sistema');
confere(pc.sistema.includes(cfg.versao), 'a tradução escolhida entra no pedido');
confere(pc.usuario.includes('SEM BUSCA NA WEB') && !pc.usuario.includes('Fontes consultadas'),
    'nenhum pedido promete busca na web');

console.log('\n--- markdown ---');
const md = B.md.render('## Título\n\nTexto com **negrito** e *itálico*.\n\n- um\n- dois\n\n> citação');
confere(md.includes('<h3>Título</h3>'), '## vira h3');
confere(md.includes('<strong>negrito</strong>') && md.includes('<em>itálico</em>'), 'negrito e itálico');
confere(md.includes('<li>um</li>') && md.includes('<ul>'), 'lista');
confere(md.includes('<blockquote>'), 'citação');
const perigoso = B.md.render('<img src=x onerror=alert(1)> e <script>mau()</script>');
confere(!perigoso.includes('<img') && !perigoso.includes('<script'), 'HTML de fora é escapado');

console.log('\n--- caminhos da IA ---');
confere(typeof B.ia.MODELOS === 'undefined', 'não sobrou catálogo de modelo pago');
confere(!!B.ia.listarModelosGoogle && !!B.ia.testarChaveGoogle, 'o caminho gratuito do Google existe');
confere(B.ia.modo() === 'google', 'fora do Claude, o motor é o Google');
confere(B.ia.pronto({ chaveGoogle: '' }) === false, 'sem chave, não dá para gerar');
confere(B.ia.pronto({ chaveGoogle: 'AIza...' }) === true, 'com chave gratuita, dá');
const fonte = fs.readFileSync(path.join(raiz, 'js/ia.js'), 'utf8');
confere(!/api\.anthropic\.com/.test(fonte), 'nenhuma chamada à API paga sobrou no código');
confere(!/x-api-key/.test(fonte), 'nenhum cabeçalho de chave paga sobrou');
confere(/generativelanguage\.googleapis\.com/.test(fonte), 'a API gratuita do Google está lá');

{
    /* Quem gera pelo Claude não quer a chave do Gemini na cara: ela só serve
       ao APK. Dobrar em vez de esconder preserva o outro caminho. */
    const conf = telasDaIA();
    confere(/peloClaude \? .<details class="cartao cartao--dobrado" id="quadro-chave">/.test(conf),
        'com o Claude gerando, o cartão da chave do Gemini vem dobrado');
    confere(/peloClaude \? '<\/details>' : '<\/section>'/.test(conf),
        'e fecha com a etiqueta certa, sem HTML quebrado');
    confere(!/peloClaude \? '' : '<input[^>]*id="chave-google"/.test(conf) &&
        /id="chave-google"/.test(conf) && /id="conferir-google"/.test(conf),
        'mas o campo e o teste da chave continuam lá dentro, para o APK');
    const css = fs.readFileSync(path.join(raiz, 'css/style.css'), 'utf8');
    confere(/\.cartao--dobrado > summary/.test(css),
        'e o detalhe dobrado tem aparência de cartão, não de lista crua');
}

console.log('\n--- configuração ---');
const cfgLimpa = st.get().config;
confere(!('chave' in cfgLimpa) && !('provedor' in cfgLimpa) && !('buscaWeb' in cfgLimpa),
    'a configuração da API paga foi embora do estado');
confere(cfgLimpa.formato === 'simples' || cfgLimpa.formato === 'completo', 'há formato preferido');
const sujo = JSON.parse(JSON.stringify(st.get()));
sujo.config.chave = 'sk-ant-secreta';
sujo.config.provedor = 'anthropic';
st.substituirPor(sujo);
confere(!('chave' in st.get().config), 'chave paga guardada de antes é apagada na abertura');

console.log('\n--- permanência dos estudos ---');
{
    const fonte = fs.readFileSync(path.join(raiz, 'js/estudos.js'), 'utf8');
    confere(/navigator\.storage\.persist/.test(fonte), 'o app pede armazenamento persistente');
    confere(/obter\(estudo\.titulo, estudo\.formato\)/.test(fonte),
        'toda gravação é conferida relendo o que foi escrito');
    confere(/não ficou guardado de verdade/.test(fonte), 'gravação que não bate vira erro, não silêncio');
    confere(!!B.estudos.situacao && !!B.estudos.protegerAgora, 'a tela de ajustes tem o que mostrar');

    const tela = fs.readFileSync(path.join(raiz, 'js/views/estudo.js'), 'utf8');
    confere(/avisarNaoGuardou/.test(tela), 'estudo que não gravou continua na tela, com saída');
    confere(/Baixar o estudo como arquivo/.test(tela), 'e pode ser levado como arquivo');

    const prog = fs.readFileSync(path.join(raiz, 'js/views/progresso.js'), 'utf8');
    confere(/zerar-estudos/.test(prog), 'apagar o progresso só leva os estudos se for marcado');
    confere(/Apagar o progresso/.test(prog), 'o botão não promete apagar mais do que apaga');
}

console.log('\n--- cópia que sobrevive à desinstalação ---');
{
    const copia = fs.readFileSync(path.join(raiz, 'js/copia.js'), 'utf8');
    confere(/salvarBackup/.test(copia), 'a cópia é gravada pela ponte nativa');
    confere(/Downloads/.test(copia), 'o destino é a pasta Downloads, fora do app');
    confere(!!B.copia.agendar && !!B.copia.restaurar && !!B.copia.deArquivo,
        'agendar, restaurar e ler de arquivo existem');
    confere(B.copia.disponivel() === false, 'sem a ponte (navegador), a cópia automática se cala');

    const est = fs.readFileSync(path.join(raiz, 'js/estudos.js'), 'utf8');
    const sto = fs.readFileSync(path.join(raiz, 'js/store.js'), 'utf8');
    confere(/B\.copia\.agendar\(\)/.test(est), 'estudo guardado dispara a cópia');
    confere(/B\.copia\.agendar\(\)/.test(sto), 'leitura marcada dispara a cópia');

    const hoje = fs.readFileSync(path.join(raiz, 'js/views/hoje.js'), 'utf8');
    confere(/estaVazio/.test(hoje), 'app zerado oferece restaurar');
    confere(/data-restaurar-auto/.test(hoje) && /data-restaurar-arquivo/.test(hoje),
        'os dois caminhos de volta estão na tela');

    const ponte = fs.readFileSync(path.join(raiz, '../biblia-android/app/src/main/java/com/bahiense/biblia/ArquivoBridge.kt'), 'utf8');
    confere(/fun salvarBackup/.test(ponte) && /fun lerBackup/.test(ponte),
        'a ponte Android grava e lê a cópia');
    confere(/"wt"/.test(ponte), 'regrava truncando, para não deixar rabo do arquivo velho');
    confere(/acharEmDownloads/.test(ponte), 'sobrescreve o mesmo arquivo em vez de criar cópias');

    const manifesto = fs.readFileSync(path.join(raiz, '../biblia-android/app/src/main/AndroidManifest.xml'), 'utf8');
    confere(/fullBackupContent/.test(manifesto) && /dataExtractionRules/.test(manifesto),
        'o backup do próprio Android está declarado');
    for (const arq of ['backup_rules.xml', 'data_extraction_rules.xml']) {
        confere(fs.existsSync(path.join(raiz, '../biblia-android/app/src/main/res/xml/', arq)),
            'existe ' + arq);
    }

    const estudo = fs.readFileSync(path.join(raiz, 'js/views/estudo.js'), 'utf8');
    confere(!/data-ler/.test(estudo), 'a tela de estudo não tem mais botão de marcar lido');
    confere(/Ler o texto/.test(estudo), 'mas continua levando ao texto');
}

console.log('\n--- cópia no Google Drive ---');
{
    const and = (f) => fs.readFileSync(path.join(raiz, '../biblia-android/', f), 'utf8');
    const drive = fs.readFileSync(path.join(raiz, 'js/drive.js'), 'utf8');
    const kt = and('app/src/main/java/com/bahiense/biblia/DriveBridge.kt');
    const arq = and('app/src/main/java/com/bahiense/biblia/ArquivoBridge.kt');
    const manifesto = and('app/src/main/AndroidManifest.xml');
    const gradle = and('app/build.gradle.kts');
    const props = and('gradle.properties');
    const hoje = fs.readFileSync(path.join(raiz, 'js/views/hoje.js'), 'utf8');
    const conf = telasDaIA();
    const copia = fs.readFileSync(path.join(raiz, 'js/copia.js'), 'utf8');

    confere(!!B.drive, 'o módulo B.drive carregou');
    confere(B.drive.disponivel() === false && B.drive.possivel() === false &&
        B.drive.conectado() === false, 'sem a ponte (navegador), o Drive se declara indisponível');
    const e = B.drive.estado();
    confere(e && e.possivel === false && e.conta === '',
        'estado() responde a forma completa mesmo sem ponte');
    confere(!!B.copia.naNuvem && !!B.copia.daNuvem && !!B.copia.enviarPeloMenu && !!B.copia.montar,
        'copia.js ganhou nuvem, volta da nuvem, envio pelo menu e montagem');
    confere(B.copia.naNuvem() === false, 'sem conta conectada, nada é mandado para nuvem alguma');

    /* O ponto mais importante do recurso inteiro: o app só alcança o que ele
       mesmo criou no Drive. Um escopo largo aqui seria pedir a conta toda. */
    confere(/auth\/drive\.file/.test(kt), 'o escopo pedido é drive.file');
    confere(!/auth\/drive["'\s]/.test(kt) && !/drive\.readonly|drive\.metadata/.test(kt),
        'e nenhum escopo largo do Drive aparece');
    confere(!/client_secret/.test(kt), 'nenhuma senha de cliente no APK (cliente Android não tem)');

    /* Login fora do WebView, com PKCE: é o que impede o app de ver a senha. */
    confere(/Intent\.ACTION_VIEW/.test(kt) && /accounts\.google\.com/.test(kt),
        'o login abre no navegador do aparelho, não dentro do app');
    confere(/code_challenge_method/.test(kt) && /S256/.test(kt), 'a troca usa PKCE');
    confere(/access_type["'\s,)]*,\s*"offline"/.test(kt) || /"offline"/.test(kt),
        'pede acesso offline, senão a cópia automática pararia em uma hora');
    confere(/state/.test(kt) && /não confere com o pedido/.test(kt),
        'a resposta do Google é conferida contra o pedido (state)');
    confere(/invalid_grant/.test(kt) && /em produção/.test(kt),
        'permissão expirada é explicada, com a causa mais comum (tela em "Testes")');
    confere(/oauth2\.googleapis\.com\/revoke/.test(kt), 'desconectar avisa o Google');
    confere(/X-HTTP-Method-Override/.test(kt), 'atualiza o mesmo arquivo em vez de duplicar');
    confere(/Leitura Bíblica/.test(kt), 'a cópia vai para uma pasta com nome, não para a raiz');
    confere(/Thread \{/.test(kt) && /__driveResposta/.test(kt),
        'a rede roda fora da chamada da ponte e responde pela janela');

    confere(/\$\{esquemaDrive\}/.test(manifesto) && /BROWSABLE/.test(manifesto),
        'o manifesto tem o filtro que recebe a volta do login');
    confere(/DRIVE_CLIENTE_ID/.test(gradle) && /manifestPlaceholders\["esquemaDrive"\]/.test(gradle),
        'o ID do cliente e o esquema vêm do build, de um lugar só');
    confere(/driveClienteId=/.test(props), 'gradle.properties tem a linha a preencher');
    confere(/com\.bahiense\.biblia/.test(props) && /D7:95:97/.test(props),
        'e traz o pacote e o SHA-1 que o Google Cloud pede');

    /* O caminho sem cadastro nenhum, que funciona no APK de hoje. */
    confere(/fun compartilharArquivo/.test(arq) && /FileProvider/.test(arq),
        'dá para mandar a cópia ao Drive pelo menu do Android, sem cadastro');
    confere(/authorities="\$\{applicationId\}\.arquivos"/.test(manifesto) &&
        /android:exported="false"/.test(manifesto),
        'o FileProvider está declarado e fechado para fora');
    const caminhos = and('app/src/main/res/xml/caminhos_compartilhados.xml');
    confere(/cache-path/.test(caminhos) && !/root-path|files-path/.test(caminhos),
        'e só abre a pasta de cache, nada mais do app');

    confere(/data-restaurar-drive/.test(hoje), 'o app zerado oferece buscar a cópia no Drive');

    /* Restaurar só existia na tela inicial, e só com o app zerado. Bastava
       marcar um capítulo para o caminho sumir — e é exatamente o caminho de
       quem leva o backup do celular para o artefato, para gerar lá o que
       falta sem repetir o que já existe. */
    const prog2 = fs.readFileSync(path.join(raiz, 'js/views/progresso.js'), 'utf8');
    confere(/data-restaurar\b/.test(prog2) && /prog-restaurar/.test(prog2),
        'e Progresso restaura um backup a qualquer momento, não só com o app vazio');
    confere(/em <b>Ajustes<\/b> há um botão/.test(prog2),
        'e manda a travessia para o botão de Ajustes, não para um passo a passo de cinco etapas');
    confere(/drive-conectar/.test(conf) && /drive-trazer/.test(conf) && /drive-sair/.test(conf),
        'Ajustes conecta, traz e desconecta');
    confere(/somente os arquivos que este app criou/.test(conf),
        'e diz em português o que o app enxerga do Drive');
    confere(/publique em produção/.test(conf) && /7 dias/.test(conf),
        'e avisa da armadilha dos 7 dias antes de a pessoa cair nela');
    confere(/naNuvem\(\)/.test(copia) && /independentes de/.test(copia),
        'a cópia local não espera pela nuvem');
}

{
    /* O seletor do Android filtra por tipo MIME, e arquivo .json vindo de
       outro app costuma chegar como octet-stream ou text/plain: com accept,
       o arquivo que a pessoa quer abrir fica cinza e não dá para escolher. */
    const vistas = ['js/views/progresso.js', 'js/views/hoje.js', 'js/views/biblia.js']
        .map(f => fs.readFileSync(path.join(raiz, f), 'utf8')).join('\n');
    confere(/type="file"/.test(vistas) && !/accept="\.json/.test(vistas),
        'o seletor de backup não filtra por extensão: no Android isso esconde o arquivo');

    const cop2 = fs.readFileSync(path.join(raiz, 'js/copia.js'), 'utf8');
    confere(/Lendo ' \+ arquivo\.name/.test(cop2),
        'e cada passo da leitura aparece: 30 MB em silêncio parecem nada acontecendo');
    confere(/não é JSON/.test(cop2) && /não é um backup deste app/.test(cop2),
        'arquivo errado diz qual é o erro, não "inválido"');
    confere(/dados\.pacote.*somarEstudos/.test(cop2),
        'e um pacote escolhido por engano soma estudos em vez de apagar a leitura');
}

{
    /* O runtime do Claude derruba a ligação de vez em quando e a frase vem
       crua, sem código: "request failed", "the connection was lost". Sem
       reconhecê-la, cada queda virava "causa desconhecida" — sem retentativa
       na hora, e oito seguidas desligariam o mutirão. */
    const ia2 = fs.readFileSync(path.join(raiz, 'js/ia.js'), 'utf8');
    const lote2 = fs.readFileSync(path.join(raiz, 'js/lote.js'), 'utf8');
    confere(!!B.ia.CAUSAS.conexao && /ligação com o Claude/.test(B.ia.CAUSAS.conexao),
        'queda de ligação com o Claude tem nome próprio');
    confere(/request failed\|connection \(was \)\?lost/.test(ia2),
        'reconhecida pelas frases que o runtime usa, que vêm sem código');
    confere(/conexao: 1/.test(lote2),
        'e contada como tropeço de rede: retenta na hora e não mexe no disjuntor');
    confere(/navigator\.onLine === false \? 'offline' : 'conexao'/.test(ia2),
        'celular sem internet continua sendo outra coisa, com outro nome');
    confere(/\+ bruta \+/.test(ia2),
        'e a frase crua do runtime vai junto no diário, para não esconder nada');
}

console.log('\n--- o que saiu, e a falha que já foi consertada ---');
{
    const lote3 = fs.readFileSync(path.join(raiz, 'js/lote.js'), 'utf8');
    const ofi3 = fs.readFileSync(path.join(raiz, 'js/views/oficina.js'), 'utf8');

    /* Um contador que vai de 12 a 13 não diz qual capítulo saiu. */
    confere(/function anotarSaida/.test(lote3) && /saidos: \[\]/.test(lote3),
        'cada estudo que sai entra numa lista, com nome e hora');
    confere(/sessaoDesde/.test(lote3) && /sessaoDesde/.test(ofi3),
        'e a sentada tem começo marcado, para separar o de agora do de ontem');
    confere(/function painelSaidos/.test(ofi3) && /nesta sentada/.test(ofi3),
        'a Oficina mostra a lista do que saiu agora, não só o número');

    /* Três falhas já consertadas não são três problemas. */
    confere(/chave: chave/.test(lote3) && /d\.consertado = agora/.test(lote3),
        'a falha consertada é marcada no diário, não só apagada da dívida');
    confere(/esquecerFalha\(item\);/.test(lote3.slice(lote3.indexOf('function renovarUm'))),
        'inclusive quando o conserto vem da renovação avulsa');
    confere(/esperando conserto/.test(ofi3) && /já foi escrito depois/.test(ofi3),
        'e o painel abre pelo que ainda está quebrado, não pelo total histórico');
    confere(/CONSERTADO em/.test(lote3),
        'o log baixado também diz quais foram consertadas');
    confere(/!\(e\.diario \|\| \[\]\)\.length/.test(ofi3),
        'o histórico continua à mão mesmo sem pendência nenhuma');
}

console.log('\n--- renovar o que já existe ---');
{
    const lote2 = fs.readFileSync(path.join(raiz, 'js/lote.js'), 'utf8');
    const est2 = fs.readFileSync(path.join(raiz, 'js/estudos.js'), 'utf8');
    const cop2 = fs.readFileSync(path.join(raiz, 'js/copia.js'), 'utf8');
    const ofi2 = fs.readFileSync(path.join(raiz, 'js/views/oficina.js'), 'utf8');

    /* O que separa estudo velho de novo não é a data: é quem escreveu. */
    confere(B.estudos.motorDe({ modelo: 'Claude (pelo seu plano)' }) === 'claude' &&
        B.estudos.motorDe({ modelo: 'gemini-2.5-flash' }) === 'google' &&
        B.estudos.motorDe({ modelo: 'colado à mão' }) === 'mao',
        'cada estudo sabe dizer quem o escreveu');
    confere(B.estudos.motorDe({}) === 'semNome',
        'e o que não tem origem anotada não é dado a motor nenhum');

    confere(/function renovaveis/.test(lote2) && /function aFazer/.test(lote2),
        'há uma fila de renovação, separada da de geração');
    confere(/if \(fila\.length \|\| !st\.renovar\)/.test(lote2),
        'e ela só anda quando não falta mais nada a gerar');
    confere(/ordem\(\)\.forEach/.test(lote2.slice(lote2.indexOf('function renovaveis'))),
        'na ordem do plano, como a geração');

    /* Os três jeitos de a renovação sair pior do que não ter. */
    confere(/criado: item\.criado \|\|/.test(lote2),
        'renovar não muda a data de criação: a lista do que chegou é do que chegou');
    confere(/esquecerTravessia/.test(cop2) && /esquecerTravessia/.test(lote2),
        'o renovado volta a entrar nos pacotes, senão o celular ficaria com o texto velho');
    confere(/if \(item\.renovar\) st\.renovados\+\+/.test(lote2),
        'e a conta de renovados é separada: "2.510 de 2.510" não anda para trás');

    confere(/id="quadro-renovar"/.test(ofi2) && /porMotor/.test(ofi2),
        'a Oficina mostra a divisão por origem e deixa escolher');

    /* Um capítulo que a pessoa está lendo agora não espera fila nenhuma. */
    const trav2 = fs.readFileSync(path.join(raiz, 'js/travessia.js'), 'utf8');
    const estudoJs2 = fs.readFileSync(path.join(raiz, 'js/views/estudo.js'), 'utf8');
    confere(/function renovarUm/.test(lote2) && /id="um-renovar"/.test(ofi2),
        'e dá para renovar um capítulo avulso, na frente de tudo');
    confere(/if \(rodando\)[\s\S]{0,160}mutirão está rodando/.test(lote2),
        'mas não com o mutirão andando: dois pedidos juntos estouram o limite por minuto');
    confere(/data-renovar-la/.test(estudoJs2) && /linkOficina/.test(trav2),
        'a tela do estudo no app leva à Oficina com o capítulo junto');
    confere(/ui\.copiar\(titulo\)/.test(estudoJs2),
        'e copia a referência, que é o caminho que não depende de a moldura passar o endereço');
    confere(/porMotor/.test(est2) && /percorrer/.test(est2),
        'contada numa passada só, sem segurar os 30 MB');
}

console.log('\n--- a Oficina: gerar é uma tela, não um cartão ---');
{
    const app = fs.readFileSync(path.join(raiz, 'js/app.js'), 'utf8');
    const ofi = fs.readFileSync(path.join(raiz, 'js/views/oficina.js'), 'utf8');
    const conf = fs.readFileSync(path.join(raiz, 'js/views/config.js'), 'utf8');
    const trav = fs.readFileSync(path.join(raiz, 'js/travessia.js'), 'utf8');
    const gera = fs.readFileSync(path.join(raiz, 'gerar-artefato.mjs'), 'utf8');
    const arte = fs.readFileSync(path.join(raiz, 'artefato/index.html'), 'utf8');

    confere(/'oficina'/.test(app) && /id="quadro-lote"/.test(ofi),
        'o mutirão tem tela própria, a Oficina');
    confere(!/id="quadro-lote"/.test(conf) && /href="#\/oficina"/.test(conf),
        'e saiu de Ajustes, que agora só aponta para lá');
    confere(/id="acervo"/.test(ofi) && /id="ofi-arquivo"/.test(ofi),
        'ela junta o acervo, o mutirão e a entrada do backup do celular');

    /* Dentro do Claude a página não é uma segunda cópia do app: ler e marcar
       capítulo acontecem no celular, com o aparelho na mão. */
    confere(/__SO_OFICINA/.test(gera) && /__SO_OFICINA/.test(arte),
        'o artefato se declara oficina, não cópia do app');
    confere(/function soOficina/.test(app) && /hoje: 1, biblia: 1, progresso: 1/.test(app),
        'e lá dentro Hoje, Bíblia e Progresso saem da barra');
    confere(/semOficina\(\) \? \{ oficina: 1 \}/.test(app),
        'como a Oficina sai da barra do app instalado, onde não se gera');

    confere(/claude\.ai\/artifact\//.test(trav) && /Abrir a Oficina/.test(trav),
        'e o app instalado traz o link que abre a Oficina no navegador');
    confere(/target="_blank"/.test(trav),
        'num separador, não dentro da WebView do app');
}

console.log('\n--- o acervo de estudos ---');
{
    const prog = fs.readFileSync(path.join(raiz, 'js/views/progresso.js'), 'utf8');
    const est = fs.readFileSync(path.join(raiz, 'js/estudos.js'), 'utf8');

    confere(!!B.estudos.recentes, 'dá para saber quais estudos chegaram por último');
    confere(/index\('criado'\)\.openCursor\(null, 'prev'\)/.test(est),
        'pelo índice de data: varrer tudo seriam 30 MB carregados para mostrar oito');
    confere(/function resumir/.test(est) && !/texto: e\.texto/.test(est),
        'e a lista não carrega o texto dos estudos junto');

    const acv = fs.readFileSync(path.join(raiz, 'js/acervo.js'), 'utf8');
    confere(/id="acervo"/.test(prog) && /B\.acervo\.pintar\('acervo'\)/.test(prog),
        'Progresso mostra o acervo: o que existe, o que falta, o que chegou');
    confere(/simples: /.test(acv) && /completos: /.test(acv) && /de livro inteiro/.test(acv),
        'separado por formato e por capítulo × livro inteiro');
    confere(/function proximos/.test(acv) && /B\.lote\.ordem\(\)/.test(acv),
        'e os próximos que faltam saem na ordem do plano, não na ordem da Bíblia');
    /* Duas telas mostram o mesmo quadro; duas cópias da conta discordariam. */
    confere(/B\.acervo\.pintar/.test(fs.readFileSync(path.join(raiz, 'js/views/oficina.js'), 'utf8')),
        'e a Oficina mostra o mesmo quadro, da mesma conta');
    /* O acervo fica fora de Ajustes de propósito: a área da IA some quando
       a Bíblia inteira estiver gerada, e isto tem de sobreviver a ela. */
    confere(/vai embora quando a Bíblia inteira/.test(prog),
        'e mora em Progresso, que sobrevive à saída da área de IA');
}

console.log('\n--- o app instalado não gera: só recebe ---');
{
    const conf = telasDaIA();
    const estudoJs = fs.readFileSync(path.join(raiz, 'js/views/estudo.js'), 'utf8');
    const lote = fs.readFileSync(path.join(raiz, 'js/lote.js'), 'utf8');
    const cop = fs.readFileSync(path.join(raiz, 'js/copia.js'), 'utf8');

    confere(/function noApk/.test(cop) && !!B.copia.noApk,
        'o app sabe dizer se está rodando dentro do APK');
    confere(B.copia.noApk() === false, 'e fora dele a resposta é não');
    confere(/var noApk = /.test(conf) && /\(noApk \? '' :/.test(conf),
        'no APK, chave do Gemini e mutirão não são desenhados');
    confere(/ainda não chegou/.test(estudoJs),
        'e o estudo que falta diz que ainda não chegou, em vez de oferecer gerar');
    confere(/B\.copia\.noApk\(\)\) \{[\s\S]{0,200}st\.ligado = false/.test(lote),
        'o mutirão recusa rodar lá dentro, mesmo com uma chave velha guardada');

    /* No navegador comum a chave continua sendo um caminho de verdade. */
    confere(/id="chave-google"/.test(conf) && /id="lote-comecar"/.test(conf),
        'mas nada disso foi apagado: no navegador os dois continuam inteiros');
}

console.log('\n--- as perguntas sobre o texto saíram ---');
{
    const fontes = ['js/views/estudo.js', 'js/prompts.js', 'js/ia.js', 'js/lote.js',
        'js/estudos.js', 'js/views/progresso.js', 'js/views/config.js']
        .map(f => fs.readFileSync(path.join(raiz, f), 'utf8')).join('\n');
    confere(!/data-perguntar|cartao--perguntar|e\.perguntas|estudo\.perguntas/.test(fontes),
        'não sobrou caixa de perguntar nem leitura de perguntas guardadas');
    confere(typeof B.prompts.pergunta === 'undefined',
        'nem o prompt que as escrevia');
    const css = fs.readFileSync(path.join(raiz, 'css/style.css'), 'utf8');
    confere(!/\.pergunta/.test(css), 'nem o estilo delas');
    /* O que fica: as perguntas para meditar, que são conteúdo do estudo. */
    confere(/Três perguntas para meditar/.test(fontes),
        'mas as perguntas para meditar continuam no texto do estudo');
}

console.log('\n--- a travessia: do Claude para o app instalado ---');
{
    const cop = fs.readFileSync(path.join(raiz, 'js/copia.js'), 'utf8');
    const conf = telasDaIA();
    const app = fs.readFileSync(path.join(raiz, 'js/app.js'), 'utf8');
    const ponte = fs.readFileSync(path.join(
        raiz, '../biblia-android/app/src/main/java/com/bahiense/biblia/ArquivoBridge.kt'), 'utf8');
    const main = fs.readFileSync(path.join(
        raiz, '../biblia-android/app/src/main/java/com/bahiense/biblia/MainActivity.kt'), 'utf8');

    confere(!!B.copia.levarPacote && !!B.copia.trazerPacotes && !!B.copia.aLevar,
        'há um caminho para o estudo atravessar do Chrome para o app');
    confere(/POR_PACOTE = 400/.test(cop) && /30 MB/.test(cop),
        'em pacotes, não num arquivo só: a Bíblia inteira derruba o app de uma vez');
    confere(/CHAVE_LEVADOS/.test(cop) && !/CHAVE_ATE/.test(cop),
        'o que já atravessou é marcado por chave de estudo, não por data de corte');
    confere(/restaurado de um backup/.test(cop),
        'e o comentário diz por quê: data de corte perderia estudo restaurado');

    /* Pacote leva estudo, e só. Quem lê no celular não perde a marcação
       porque a outra ponta passou a semana gerando. */
    confere(/pacote: 1, estudos: corpo/.test(cop) && !/paraBackup/.test(
        cop.slice(cop.indexOf('function levarPacote'), cop.indexOf('function pastaTem'))),
        'o pacote leva estudo e não estado: a leitura marcada no aparelho fica');
    confere(/B\.estudos\.importar\(estudos\)/.test(cop),
        'e do outro lado ele é acrescentado, não substitui nada');

    /* Sem a pasta apontada o app não enxerga arquivo baixado pelo Chrome:
       MediaStore só mostra o que o próprio app criou. */
    confere(/pastaEscolher/.test(ponte) && /ACTION_OPEN_DOCUMENT_TREE/.test(main),
        'a pasta é apontada uma vez, pelo seletor do sistema');
    confere(/takePersistableUriPermission/.test(main),
        'e a permissão fica guardada: não se pede de novo a cada pacote');
    confere(/persistedUriPermissions/.test(ponte),
        'mas é conferida antes de usar — ela pode ser revogada nos ajustes');
    confere(!/MANAGE_EXTERNAL_STORAGE|READ_EXTERNAL_STORAGE/.test(ponte + main),
        'sem permissão de armazenamento inteira: num app de leitura, seria pedir demais');

    confere(/trazerPacotes\(\)/.test(app),
        'na abertura do app, o que o Claude gerou entra sozinho');
    confere(/CHAVE_LIDOS/.test(cop),
        'e pacote já trazido não é relido: são megabytes por arquivo');

    confere(/quadro-travessia/.test(conf) && /Levar os estudos para o app/.test(conf) &&
        /Trazer os estudos do Claude/.test(conf),
        'o quadro mostra a metade certa em cada aparelho');
    confere(/if \(!noClaude && !noApp\) \{ caixa\.hidden = true/.test(conf),
        'e some de quem não tem para onde atravessar');

    /* O pedido: acabou a geração, a IA sai da tela. */
    confere(/function acabou\(\)/.test(conf) && /quadro-chave/.test(conf),
        'com a Bíblia inteira gerada, o quadro da chave sai da tela');
    confere(/sem tocar na IA/.test(conf) && /sem internet/.test(conf),
        'e o app diz que dali em diante abre qualquer estudo sem IA e sem internet');
}

console.log('\n--- mutirão: gerar a Bíblia inteira ---');
{
    const lote = fs.readFileSync(path.join(raiz, 'js/lote.js'), 'utf8');
    const conf = telasDaIA();
    const copia = fs.readFileSync(path.join(raiz, 'js/copia.js'), 'utf8');
    const est = fs.readFileSync(path.join(raiz, 'js/estudos.js'), 'utf8');
    const and = (f) => fs.readFileSync(path.join(raiz, '../biblia-android/', f), 'utf8');

    confere(!!B.lote, 'o módulo B.lote carregou');

    const ordem = B.lote.ordem();
    const caps = ordem.filter(a => a.capitulo);
    const livros = ordem.filter(a => !a.capitulo);
    const unicos = new Set(caps.map(a => a.livro.nome + ' ' + a.capitulo));
    confere(caps.length === 1189, 'a fila tem os 1.189 capítulos (deu ' + caps.length + ')');
    confere(unicos.size === 1189, 'e nenhum repetido');
    confere(livros.length === 66, 'mais os 66 livros inteiros, no fim');

    /* A ordem é o que decide se a cota curta serve para alguma coisa: os
       primeiros da fila têm de ser os que a pessoa vai ler primeiro. */
    const primeiros = ordem.slice(0, 8).map(a => a.livro.nome + ' ' + a.capitulo);
    const atuais = B.biblia.GRUPOS.map(g => {
        const l = B.plano.leituraAtual(g.id);
        return l.livro.nome + ' ' + l.cap;
    });
    confere(JSON.stringify(primeiros) === JSON.stringify(atuais),
        'a fila começa pela leitura atual dos oito grupos');

    const e0 = B.lote.estado();
    confere(e0.ligado === false && e0.rodando === false && e0.feitos === 0,
        'começa desligado e zerado');
    confere(e0.cotaDia === null, 'e sem cota chutada: ela é medida, não inventada');

    /* A hora da virada é a do Pacífico, não a nossa: é lá que o Google conta. */
    const vira = new Date(B.lote.proximaVirada()) - new Date();
    confere(vira > 0 && vira < 25 * 3600e3, 'a próxima virada de cota cai nas próximas 25h');

    const app = fs.readFileSync(path.join(raiz, 'js/app.js'), 'utf8');
    confere(/retomarSePreciso/.test(lote) && /retomarSePreciso/.test(app),
        'o mutirão deixado ligado volta sozinho quando o app abre');
    /* No Android, app fora da frente é WebView suspenso. Sem estes gatilhos,
       só uma abertura fria retomaria — pegar o celular do bolso não bastava. */
    confere(/visibilitychange/.test(app) && /'online'/.test(app),
        'e também quando ele reaparece ou a internet volta');
    confere(/abortador/.test(lote) && /function parar/.test(lote), 'e dá para parar no meio');
    confere(/manterAcordado/.test(lote), 'a tela fica acesa enquanto ele roda');

    /* 429 de minuto e 429 de dia são coisas diferentes, e só o corpo do
       erro distingue. Errar isso é parar o mutirão por um dia à toa. */
    const dia = B.ia.detalharQuota({ error: { details: [
        { '@type': 'type.googleapis.com/google.rpc.QuotaFailure', violations: [
            { quotaId: 'GenerateRequestsPerDayPerProjectPerModel-FreeTier', quotaValue: '250' }] } ] } });
    confere(dia.porDia && !dia.porMinuto && dia.valor === 250,
        'o 429 diário é reconhecido, com a cota real que o Google revela');
    const minuto = B.ia.detalharQuota({ error: { details: [
        { '@type': 'type.googleapis.com/google.rpc.QuotaFailure', violations: [
            { quotaId: 'GenerateRequestsPerMinutePerProjectPerModel-FreeTier' }] },
        { '@type': 'type.googleapis.com/google.rpc.RetryInfo', retryDelay: '37s' } ] } });
    confere(minuto.porMinuto && !minuto.porDia && minuto.esperar === 37,
        'o 429 por minuto vira uma espera de 37 segundos, não um dia perdido');
    confere(B.ia.detalharQuota({}).porMinuto === true,
        'sem detalhe nenhum, assume o por minuto — parar o dia à toa é pior');

    /* Com a Bíblia inteira estudada o backup passa de 30 MB. */
    confere(/function emFluxo/.test(copia) && /copiaEscrever/.test(copia),
        'a cópia grande é escrita em pedaços, não como uma string só');
    confere(/nuvem === false/.test(copia),
        'e as gravações intermediárias do mutirão não sobem ao Drive');
    confere(!!B.copia.suspender && !!B.copia.retomar,
        'a cópia automática pode ser suspensa durante o mutirão');
    confere(/percorrer/.test(est) && /openCursor/.test(est),
        'os estudos são lidos por cursor, sem carregar 30 MB na memória');
    confere(/function importar/.test(est) && /tx\.oncomplete/.test(est),
        'e restaurados numa transação só, não 2.510');

    const arq = and('app/src/main/java/com/bahiense/biblia/ArquivoBridge.kt');
    confere(/fun copiaAbrir/.test(arq) && /fun copiaEscrever/.test(arq) && /fun copiaFechar/.test(arq),
        'a ponte Android escreve a cópia em fluxo');
    confere(/fun manterAcordado/.test(arq) && /FLAG_KEEP_SCREEN_ON/.test(arq),
        'e segura a tela acesa: tela apagada é mutirão parado');
    const drv = and('app/src/main/java/com/bahiense/biblia/DriveBridge.kt');
    confere(/fun enviarDoCache/.test(drv) && /setFixedLengthStreamingMode/.test(drv),
        'o Drive sobe o arquivo do disco, sem juntar os 30 MB na memória');

    confere(/quadro-lote/.test(conf) && /lote-comecar/.test(conf) && /lote-parar/.test(conf),
        'a Oficina começa e para o mutirão');

    /* Dentro do Claude a página gera sem chave nenhuma, pelo plano de quem
       está usando. Exigir a do Gemini para o mutirão era bloqueio à toa —
       e justamente o segundo poço de cota, independente do Google. */
    confere(/B\.ia\.pronto\(cfg\)/.test(lote) && !/!cfg\.chaveGoogle/.test(lote),
        'o mutirão aceita qualquer motor pronto, não só a chave do Gemini');
    confere(/B\.ia\.pronto\(cfg\)/.test(conf) && /dentro do Claude/.test(conf),
        'e a tela diz que dá para rodar dentro do Claude, sem chave');
    confere(!!B.ia.CAUSAS.naoAutorizado && !!B.ia.CAUSAS.limitado,
        'as falhas do Claude têm nome próprio');
    confere(/naoAutorizado: 1/.test(lote) && /limitado: 1/.test(lote),
        'e cada uma no caminho certo: autorização para tudo, limite de uso espera');

    const css = fs.readFileSync(path.join(raiz, 'css/style.css'), 'utf8');

    /* Entre um estudo e outro passavam dezenas de segundos sem um pixel se
       mexer — e mutirão parado é idêntico a mutirão trabalhando. */
    confere(/avisarAndamento/.test(lote) && /andamento\.parcial = tudo\.length/.test(lote),
        'o texto que vai chegando é contado, não só o estudo que termina');
    confere(/esperarVisivel/.test(lote) && /andamento\.ate = Date\.now\(\)/.test(lote),
        'e a pausa entre pedidos também é estado visível');
    confere(/300/.test(lote) && /ultimoAviso/.test(lote),
        'os avisos são represados: um por pedaço de texto seria desperdício');
    confere(/lote-estudo-i/.test(conf) && /andamentoNaTela/.test(conf),
        'a tela tem a barra do estudo em curso');
    confere(/decorrido/.test(conf) && /andamento\.desde/.test(lote),
        'com os segundos decorridos: "pedindo" há um minuto não pode parecer ' +
        '"pedindo" há dois segundos');
    confere(/Math\.min\(95/.test(conf),
        'que para em 95%: barra cheia com texto ainda vindo mente');
    confere(/is-indefinida/.test(conf) && /is-indefinida/.test(css),
        'sem texto ainda, a faixa anda sozinha em vez de fingir percentual');
    confere(/prefers-reduced-motion/.test(css),
        'e quem pede menos movimento não leva a faixa indo e voltando');

    /* A tela se registrava a cada pintura; numa lista isso empilhava. */
    const drv2 = fs.readFileSync(path.join(raiz, 'js/drive.js'), 'utf8');
    confere(/ouvintes\[chave\] = f/.test(lote) && /ouvintes\[chave\] = f/.test(drv2),
        'ouvintes são guardados por chave, sem empilhar a cada visita a Ajustes');
    confere(/não publica mais/.test(conf),
        'e diz a verdade sobre a cota: o Google parou de publicá-la');
}

console.log('\n--- o que foi lido hoje x o que vem a seguir ---');
{
    const hoje = fs.readFileSync(path.join(raiz, 'js/views/hoje.js'), 'utf8');
    const css = fs.readFileSync(path.join(raiz, 'css/style.css'), 'utf8');

    /* Marcada a leitura, o cartão já mostra a SEGUINTE. O rótulo do botão
       fala do capítulo que está na tela — e esse não foi lido. Dizer "já
       lido" ali fazia parecer que o capítulo de amanhã já estava feito. */
    confere(!/✓ Já lido/.test(hoje),
        'o cartão de hoje não diz "já lido" sobre o capítulo seguinte');
    confere(/Hoje você leu/.test(hoje) && !!B.plano.lidosHoje,
        'em vez disso, nomeia o capítulo que foi lido de verdade');
    confere(/próxima leitura/.test(hoje) && /leitura de hoje/.test(hoje),
        'e o bloco se identifica: "leitura de hoje" ou "próxima leitura"');

    /* Na tela de leitura o botão fala do capítulo aberto, e ali "já lido"
       é verdade — por isso continua lá. */
    const ler = fs.readFileSync(path.join(raiz, 'js/views/ler.js'), 'utf8');
    confere(/✓ Já lido/.test(ler),
        'na tela de leitura o estado continua, porque ali é o capítulo aberto');

    const st = B.store.get();
    const g = B.biblia.GRUPOS[0];
    const antes = B.plano.lidosHoje(g.id).length;
    B.plano.marcarLida(g.id);
    const depois = B.plano.lidosHoje(g.id);
    confere(depois.length === antes + 1, 'marcar registra o capítulo do dia');
    const atual = B.plano.leituraAtual(g.id);
    confere(depois[depois.length - 1].ref !== atual.ref,
        'e o que foi lido nunca é o que o cartão passa a mostrar');

    confere(/grid-template-columns: 1fr 1fr 44px/.test(css) && /max-width: 419px/.test(css),
        'num celular comum o "Marcar como lido" ganha a linha inteira');
    confere(!/text-overflow: ellipsis/.test(css.slice(css.indexOf('.grupo-botoes'),
        css.indexOf('.cartao--acoes'))),
        'em vez de ser cortado em "Marcar como ..."');
}

console.log('\n--- por que um estudo falha, e a repescagem ---');
{
    const lote = fs.readFileSync(path.join(raiz, 'js/lote.js'), 'utf8');
    const ia = fs.readFileSync(path.join(raiz, 'js/ia.js'), 'utf8');
    const conf = telasDaIA();

    /* "79 falharam" não diz o que consertar; a causa diz. */
    confere(!!B.ia.CAUSAS && !!B.ia.CAUSAS.seguranca && !!B.ia.CAUSAS.limite,
        'cada falha tem um nome em português');
    confere(/causa = /.test(ia) && /finishReason/.test(ia),
        'e o erro carrega a causa e o motivo que o Google devolveu');

    /* O caso traiçoeiro: os Flash atuais pensam por padrão e os tokens de
       pensamento saem do mesmo maxOutputTokens. Com teto baixo, num capítulo
       difícil, não sobra nada para o texto — e a resposta volta vazia. */
    confere(/MAX_TOKENS[\s\S]{0,400}?limite/.test(ia),
        'vazio com MAX_TOKENS é distinguido de vazio sem motivo');
    confere(/maisTeto/.test(ia) && /maisTeto/.test(lote),
        'e leva o mutirão a repetir com teto maior, não igual');
    confere(/tetoAlto/.test(lote) && /uma vez/i.test(lote),
        'descoberto uma vez, vale para os outros 2.500 — sem gastar cota de novo');

    /* O texto bíblico narra guerra e estupro; o filtro padrão barrava. */
    confere(/safetySettings/.test(ia) && /BLOCK_ONLY_HIGH/.test(ia),
        'o filtro de conteúdo é afrouxado para a narrativa bíblica');
    confere(!/BLOCK_NONE/.test(ia),
        'mas não desligado: BLOCK_NONE nem toda chave tem, e 400 aqui pararia tudo');

    confere(/function anotarFalha/.test(lote) && /diario/.test(lote),
        'toda falha entra num diário com data, alvo, causa e mensagem');
    confere(!!B.lote.diarioComoTexto && /Falhas do mutirão/.test(B.lote.diarioComoTexto()),
        'que sai como texto para mandar a alguém');
    confere(/esquecerFalha/.test(lote), 'e some da lista quando o estudo enfim sai');

    /* O pedido do usuário: o que falhou tem de ser tentado de novo, sempre. */
    confere(/repescagem/.test(lote) && /caiuAgora/.test(lote),
        'o que falha é retentado na mesma rodada, antes de esperar o dia virar');
    confere(/jaRepescou/.test(lote),
        'mas uma vez só: em círculo, um capítulo que falha sempre torraria a cota do dia');
    confere(/SEM_REPETIR_AGORA/.test(lote) && /seguranca: 1/.test(lote),
        'e o que o filtro barrou não é repetido no mesmo minuto: seria cota queimada ' +
        'para ouvir o mesmo não');
    confere(/repescagem\.concat\(novos, teimosos\)/.test(lote),
        'e volta para o começo da fila na rodada seguinte');
    confere(/vezes \|\| 0\) < 5/.test(lote),
        'o que falha sempre vai para o fim da fila — tentado ainda, sem entupir a frente');

    /* Antes, um 400 de um capítulo esquisito desligava o mutirão inteiro. */
    confere(/DE_CONFIGURACAO/.test(lote) && !/e\.fatal/.test(lote),
        'só as falhas globais param tudo; o resto é falha daquele capítulo');

    /* "Créditos de pré-pagamento acabaram" é conta a pagar, não cota gratuita,
       e vale para toda chave do mesmo faturamento: tratá-lo como limite por
       minuto faria o mutirão esperar 30s e repetir, 2.510 vezes. */
    confere(/ehFaturamento/.test(ia) && /prepay/.test(ia),
        'o erro de pré-pagamento é reconhecido pela mensagem, não pelo código HTTP');
    confere(!!B.ia.CAUSAS.creditos && /creditos: 1/.test(lote),
        'e é causa própria, que para o mutirão em vez de varrer a fila');
    confere(/429 && erro\.causa !== 'creditos'/.test(ia),
        'um 429 de cobrança não vira espera de cota');

    /*
     * fetch não tem prazo. Numa rede ruim, ou com o Google sem responder, a
     * promessa nunca se resolve — e o mutirão congela no mesmo capítulo para
     * sempre: sem falhar, sem repetir, sem avisar. Foi o que apareceu em
     * produção como "pedindo ao Gemini" parado por minutos.
     */
    confere(/PRAZO_ABERTURA/.test(ia) && /PRAZO_OCIOSO/.test(ia),
        'a chamada tem prazo para começar e prazo entre pedaços');
    confere(/renovar\(PRAZO_OCIOSO\)/.test(ia),
        'fluxo que para no meio conta como travado, não só o que nunca começa');
    confere(/travou && e && e\.name === 'AbortError'/.test(ia),
        'o corte do cão de guarda vira falha de verdade, num fim de linha só');
    confere(!!B.ia.CAUSAS.travou, 'e tem nome em português para o diário');
    confere(/sinal\.addEventListener\('abort'/.test(ia),
        'o "parar" da pessoa continua cortando a chamada');

    /*
     * Falha de conexão é de outra natureza. Erro do capítulo não melhora
     * esperando; queda de rede melhora quase sempre — e com três tentativas
     * de 4, 8 e 12 segundos o app desistia em 24 segundos, que num celular
     * andando pela cidade é garantia de falha.
     */
    confere(/ESPERAS_REDE/.test(lote) && /DE_CONEXAO/.test(lote),
        'conexão tem escada de espera própria, separada do erro de capítulo');
    const escada = (lote.match(/ESPERAS_REDE = \[([^\]]+)\]/) || [, ''])[1]
        .split(',').map(function (x) { return Number(x.trim()); }).filter(Boolean);
    const somaEscada = escada.reduce(function (a, b) { return a + b; }, 0);
    confere(escada.every(function (v, i) { return i === 0 || v > escada[i - 1]; }),
        'crescente: insistir no mesmo ritmo numa rede caída não ajuda');

    /*
     * A paciência tem de ficar no lugar certo. Esperar nove minutos NO MESMO
     * capítulo fazia o mutirão parecer morto — a fila não andava, e quem
     * olhava a tela via um capítulo congelado. O capítulo espera pouco; quem
     * espera muito é a fila.
     */
    confere(somaEscada <= 90000,
        'o capítulo espera menos de um minuto e meio, para a fila não congelar nele (deu ' +
        Math.round(somaEscada / 1000) + 's)');
    const pausas = (lote.match(/PAUSAS_FILA = \[([^\]]+)\]/) || [, ''])[1]
        .split(',').map(function (x) { return Number(x.trim()); }).filter(Boolean);
    confere(pausas.length >= 3 && pausas[pausas.length - 1] >= 300000,
        'e a fila inteira é que pausa, crescendo até dez minutos');
    confere(/redeSeguidas/.test(lote),
        'contando só os capítulos seguidos que caíram por conexão');
    confere(/filaEmPausa/.test(conf),
        'e a tela diz que é a conexão, não aquele capítulo');

    /*
     * "Modelo sobrecarregado" (5xx) é rede ruim vista do outro lado do fio:
     * não é do capítulo e passa sozinha. Tratá-la como erro de capítulo
     * gastava três tentativas em 24s e derrubava o mutirão em oito.
     */
    confere(/servidor: 1/.test(lote),
        'o 5xx do Google espera como falha de conexão, não como erro de capítulo');
    confere(/seguidas = DE_CONEXAO\[causa\] \? 0/.test(lote),
        'e não conta para o disjuntor: uma hora de instabilidade não desliga o mutirão');
    confere(/PAUSAS_ATE_DESISTIR/.test(lote),
        'mas a paciência da fila tem teto: pausas seguidas sem um sucesso viram parede');
    confere(/retry-after/.test(ia) && /e\.esperar \* 1000/.test(lote),
        'e quando o Google diz quando voltar, é ele quem manda');
    confere(/sobrecarregado/.test(ia),
        'a mensagem distingue sobrecarga de erro genérico de servidor');
    confere(/function aguardarRede/.test(lote) && /'online'/.test(lote),
        'sem internet, o mutirão espera a conexão voltar em vez de insistir');
    confere(/PERDOES_REDE/.test(lote),
        'com teto: uma rede piscando não pode rodar para sempre');
    confere(/navigator\.onLine === false/.test(ia) && !!B.ia.CAUSAS.offline,
        '"sem sinal" e "não alcançou o Google" são causas diferentes — e o que ' +
        'fazer com cada uma também');
    confere(/semrede/.test(conf), 'e a tela diz qual das duas é');

    /* A rede para o que eu não souber prever. */
    confere(/SEGUIDAS_ATE_PARAR/.test(lote) && /seguidas >= SEGUIDAS_ATE_PARAR/.test(lote),
        'oito falhas seguidas pela mesma causa param o mutirão sozinhas');
    confere(/seguidas = 0/.test(lote), 'e um estudo que dá certo zera a contagem');
    confere(/if \(r\.desligar\)[\s\S]{0,160}anotarFalha/.test(lote),
        'a falha que derruba o mutirão também entra no diário — é a que mais importa');

    const css = fs.readFileSync(path.join(raiz, 'css/style.css'), 'utf8');
    confere(/avisoParada/.test(conf) && /\.parada \{/.test(css),
        'o motivo da parada fica visível, não em letra miúda no rodapé');
    confere(/ai\.studio/.test(conf) && /cobran/.test(conf),
        'e o caso de cobrança diz onde conferir e como voltar ao plano gratuito');

    /* Este app é só de caminho gratuito. Vista uma cobrança, ele para de
       insistir com aquela chave em vez de seguir gerando conta. */
    const sto = fs.readFileSync(path.join(raiz, 'js/store.js'), 'utf8');
    confere(/cobrancaDetectada/.test(sto) && B.store.get().config.cobrancaDetectada === false,
        'a chave começa sem marca de cobrança');
    confere(/creditos'\) B\.store\.setConfig\('cobrancaDetectada', true\)/.test(lote),
        'e ganha a marca quando o Google recusa por créditos');
    confere(/cobrancaDetectada\) return Promise\.resolve/.test(lote),
        'marcada, o mutirão não recomeça sozinho em abertura nenhuma');
    confere(/setConfig\('cobrancaDetectada', false\)/.test(conf) &&
        /esquecerParada\(\)/.test(conf) && !!B.lote.esquecerParada,
        'e trocar a chave limpa a marca e o aviso — os dois falavam da chave velha');
    confere(/não foi cobrado/.test(conf) && /sem faturamento/.test(conf),
        'o aviso diz que ninguém foi cobrado e como criar uma chave gratuita');

    /* Listar modelos responde normalmente numa chave que o faturamento barra;
       quem reprova é o generateContent. Foi por isso que a chave passou no
       teste e só se revelou 700 estudos depois. */
    confere(/function provarChaveGoogle/.test(ia) && !!B.ia.provarChaveGoogle,
        'salvar a chave faz uma geração de verdade, não só lista modelos');
    confere(/REPROVAM/.test(ia) && /creditos: 1/.test(ia),
        'e o crédito esgotado reprova a chave na hora');
    confere(/causa === 'cota'/.test(ia),
        'cota do dia estourada aprova: quem tem conta paga não bate nesse teto');
    confere(/provarChaveGoogle\(v, modelo\)/.test(conf) && /gratuita ' \+\s*'funcionando/.test(conf),
        'a tela diz se a chave gratuita realmente gera');

    /* "Não funciona mais" é diagnóstico de ninguém: um pedido de verdade,
       agora, responde em cinco segundos o que o diário só diz depois de uma
       rodada inteira — e diz o que fazer com a resposta. */
    confere(/conferir-google/.test(conf) && /Conferir a chave agora/.test(conf),
        'há um botão que testa a chave na hora, a qualquer momento');
    confere(/Funcionando agora/.test(conf) && /Não está funcionando/.test(conf),
        'com veredito em duas palavras, não em código de erro');
    confere(/projeto novo/.test(conf) && /gere outra/.test(conf),
        'e cada veredito ruim vem com o que fazer');
    confere(/cobrancaDetectada', false\);\s*\n\s*B\.lote\.esquecerParada/.test(conf),
        'voltando a funcionar, a marca de cobrança sai sozinha');

    const est2 = fs.readFileSync(path.join(raiz, 'js/views/estudo.js'), 'utf8');
    confere(!/conta da API/.test(est2) && /cota\s*' \+\s*'gratuita|cota gratuita/.test(est2),
        'nenhuma tela fala em gastar dinheiro: o que se gasta é cota');

    confere(/painelFalhas/.test(conf) && /lote-log/.test(conf),
        'a Oficina mostra a quebra por causa e deixa baixar o log');
}

console.log('\n--- texto bíblico embutido ---');
for (const edicao of Object.keys(B.texto.EDICOES)) {
    const pasta = path.join(raiz, 'data/texto', edicao);
    confere(fs.existsSync(pasta), 'a pasta da edição "' + edicao + '" existe');
    const arquivos = fs.existsSync(pasta) ? fs.readdirSync(pasta).filter(f => f.endsWith('.json')) : [];
    confere(arquivos.length === 66, edicao + ': 66 arquivos, um por livro (deu ' + arquivos.length + ')');

    let caps = 0, versos = 0, faltando = [];
    for (const livro of B.biblia.LIVROS) {
        const p = path.join(pasta, livro.arquivo + '.json');
        if (!fs.existsSync(p)) { faltando.push(livro.nome); continue; }
        const d = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (d.livro !== livro.nome) falhou('o arquivo ' + livro.arquivo + ' diz ser ' + d.livro);
        if (d.caps.length !== livro.caps) {
            falhou(livro.nome + ': ' + d.caps.length + ' capítulos no texto, ' + livro.caps + ' esperados');
        }
        if (d.caps.some(c => !c.length)) falhou(livro.nome + ' tem capítulo vazio');
        caps += d.caps.length;
        versos += d.caps.reduce((s, c) => s + c.length, 0);
    }
    confere(faltando.length === 0, edicao + ': nenhum livro sem arquivo' +
        (faltando.length ? ': ' + faltando : ''));
    confere(caps === 1189, edicao + ': os 1.189 capítulos têm texto (deu ' + caps + ')');
    confere(versos > 30000 && versos < 32000, edicao + ': ' + versos + ' versículos');
    confere(!!B.texto.EDICOES[edicao].credito && !!B.texto.EDICOES[edicao].aviso,
        edicao + ': tem crédito e aviso declarados');
}

{
    /* O texto embutido é de domínio público (ou derivado livre dele). A NVI
       e as outras traduções licenciadas não entram aqui — só o link. */
    confere(/1911/.test(B.texto.EDICOES['1911'].credito) &&
        /domínio público/.test(B.texto.EDICOES['1911'].credito),
        'o crédito declara a edição de 1911 em domínio público');
    confere(/Creative Commons/.test(B.texto.EDICOES.jfaal.credito),
        'a revisão JFAAL carrega a atribuição que a licença dela exige');
    confere(/inteligência artificial/.test(B.texto.EDICOES.jfaal.aviso),
        'o app avisa que a revisão foi feita com apoio de IA');
    const fontesLer = fs.readFileSync(path.join(raiz, 'js/views/ler.js'), 'utf8');
    confere(/linkNVI/.test(fontesLer), 'a tela de leitura oferece o link para a NVI');

    const jo = B.biblia.livro('João');
    confere(jo.usfm === 'JHN' && B.biblia.livro('Gênesis').usfm === 'GEN' &&
        B.biblia.livro('Apocalipse').usfm === 'REV', 'códigos USFM certos nos extremos');
    confere(B.biblia.linkNVI(jo, 3) === 'https://www.bible.com/bible/129/JHN.3.NVI',
        'o link da NVI tem a forma certa');
    const usfms = B.biblia.LIVROS.map(l => l.usfm);
    confere(new Set(usfms).size === 66, 'nenhum código USFM repetido');
}

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
