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
    const conf = fs.readFileSync(path.join(raiz, 'js/views/config.js'), 'utf8');
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
    confere(/drive-conectar/.test(conf) && /drive-trazer/.test(conf) && /drive-sair/.test(conf),
        'Ajustes conecta, traz e desconecta');
    confere(/somente os arquivos que este app criou/.test(conf),
        'e diz em português o que o app enxerga do Drive');
    confere(/publique em produção/.test(conf) && /7 dias/.test(conf),
        'e avisa da armadilha dos 7 dias antes de a pessoa cair nela');
    confere(/naNuvem\(\)/.test(copia) && /independentes de/.test(copia),
        'a cópia local não espera pela nuvem');
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
