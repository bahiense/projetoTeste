'use strict';

/*
 * Resultados: visualizações, curtidas, comentários e compartilhamentos de cada
 * perfil ligado, somados por rede e no total, e casados com o que foi
 * publicado pelo Espalhe. Os números vêm de Metricas.kt (window.EspalheMetricas).
 *
 * Carrega antes do app.js: aqui só se definem funções e o objeto
 * acoesMetricas, que o app.js junta às suas ações.
 */

const METRICAS = [
    ['views', 'Visualizações', '▶'],
    ['likes', 'Curtidas', '♥'],
    ['comentarios', 'Comentários', '💬'],
    ['compart', 'Compartilhamentos', '↗'],
];

const fmtNum = n => n == null ? '—'
    : new Intl.NumberFormat('pt-BR', { notation: n >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(n);

function conexao(pid) {
    if (!est.conexoes[pid]) {
        try { est.conexoes[pid] = JSON.parse(M.estado(pid)); } catch (e) { est.conexoes[pid] = { conectado: false }; }
    }
    return est.conexoes[pid];
}

function configMetricas() {
    try { return JSON.parse(M.configuracao()); } catch (e) { return {}; }
}

const perfisLigados = () => est.perfis.filter(p => rede(p.rede).metricas && conexao(p.id).conectado);

/* Soma os posts; null em todos = a rede não informa aquele número. */
function somar(posts) {
    const t = { n: posts.length };
    for (const [k] of METRICAS) {
        const com = posts.filter(p => p[k] != null);
        t[k] = com.length ? com.reduce((a, p) => a + p[k], 0) : null;
    }
    return t;
}

function noPeriodo(posts) {
    const desde = Date.now() - est.periodo * 86_400_000;
    return (posts || []).filter(p => p.data >= desde);
}

async function atualizarResultados(ids) {
    const alvo = ids ? est.perfis.filter(p => ids.includes(p.id)) : perfisLigados();
    if (!alvo.length) return;
    est.atualizando = true;
    if (est.aba === 'resultados') render();
    await Promise.all(alvo.map(async p => {
        const r = await pedirM('buscar', [p.id]);
        if (r.erro) {
            est.resultados[p.id] = { ...(est.resultados[p.id] || {}), erro: r.erro };
            // a ligação pode ter caído (token vencido): pergunta de novo ao nativo
            delete est.conexoes[p.id];
        } else {
            est.resultados[p.id] = r;
        }
    }));
    est.atualizando = false;
    guardar();
    if (est.aba === 'resultados') render();
}

/*
 * Liga cada envio do histórico ao post que apareceu naquele perfil logo
 * depois (de 15 min antes a 12 h depois do envio), preferindo story para
 * Stories e post para o resto. Um post só serve a um envio.
 */
function casar(h) {
    const usados = new Set();
    return h.envios.filter(e => e.feito).map(e => {
        const p = (e.pid && perfil(e.pid)) || est.perfis.find(x => x.nome === e.perfil && x.rede === e.rede);
        const posts = p && est.resultados[p.id]?.posts;
        if (!posts) return { e, p, post: null };
        const hora = e.hora || h.data;
        const querStory = e.fid === 'stories';
        let melhor = null, nota = Infinity;
        for (const post of posts) {
            const d = post.data - hora;
            if (d < -15 * 60e3 || d > 12 * 3600e3 || usados.has(p.id + post.id)) continue;
            const n = Math.abs(d) + ((post.tipo === 'story') === querStory ? 0 : 6 * 3600e3);
            if (n < nota) { nota = n; melhor = post; }
        }
        if (melhor) usados.add(p.id + melhor.id);
        return { e, p, post: melhor };
    });
}

// ------------------------------------------------------------------ tela

function numerosHtml(t, grande) {
    return `<div class="numeros ${grande ? 'grandes' : ''}">${METRICAS.map(([k, nome, ic]) => `
        <div><b>${fmtNum(t[k])}</b><small>${grande ? nome : ic}</small></div>`).join('')}</div>`;
}

function renderResultados() {
    cabecalho('Resultados', 'Os números dos seus posts, lidos direto das redes.');
    const ligados = perfisLigados();
    const semApi = est.perfis.filter(p => !rede(p.rede).metricas);
    const desligados = est.perfis.filter(p => rede(p.rede).metricas && !conexao(p.id).conectado);

    if (!ligados.length) {
        $('#conteudo').innerHTML = `
            <section class="cartao explica">
                <h2>Nenhum perfil ligado ainda</h2>
                <p>Para ver visualizações, curtidas e compartilhamentos, ligue cada perfil à API da
                rede: em <b>Perfis</b>, toque no perfil e use a parte <b>Métricas</b>.</p>
                <p>Dá para ligar Instagram, Facebook (Página), Threads, YouTube e TikTok.</p>
                <button class="primario" data-acao="ir-aba-perfis">Ligar perfis</button>
            </section>
            ${semApiHtml(semApi)}`;
        return;
    }

    // ao abrir a aba, uma atualização automática por sessão se os números têm mais de 3 h
    if (!est.atualizando && !renderResultados.auto &&
        ligados.some(p => (est.resultados[p.id]?.em || 0) < Date.now() - 3 * 3600e3)) {
        renderResultados.auto = true;
        setTimeout(() => atualizarResultados(), 0);
    }

    const porPerfil = ligados.map(p => ({ p, rd: rede(p.rede), res: est.resultados[p.id] }));
    const todos = porPerfil.flatMap(x => noPeriodo(x.res?.posts));
    const ultima = Math.min(...porPerfil.map(x => x.res?.em || 0));

    // por rede, juntando os perfis da mesma rede
    const redes = REDES.filter(rd => porPerfil.some(x => x.rd.id === rd.id)).map(rd => {
        const deles = porPerfil.filter(x => x.rd.id === rd.id);
        return { rd, deles, t: somar(deles.flatMap(x => noPeriodo(x.res?.posts))) };
    });
    const total = somar(todos);
    const maxViews = Math.max(1, ...redes.map(r => r.t.views || 0));

    const publicacoes = est.historico
        .filter(h => h.data >= Date.now() - est.periodo * 86_400_000)
        .map(h => ({ h, casados: casar(h) }))
        .filter(x => x.casados.length);

    $('#conteudo').innerHTML = `
        <div class="res-topo">
            <div class="seg fino periodo">
                ${[7, 30, 90].map(d => `<button data-acao="periodo" data-v="${d}" class="${est.periodo === d ? 'on' : ''}">${d} dias</button>`).join('')}
            </div>
            <button class="leve pequeno" data-acao="atualizar" ${est.atualizando ? 'disabled' : ''}>${est.atualizando ? 'Atualizando…' : '↻ Atualizar'}</button>
        </div>
        <p class="dica">${ultima ? 'Atualizado ' + new Date(ultima).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Ainda não atualizado.'}
            · ${total.n} post${total.n === 1 ? '' : 's'} em ${ligados.length} perfi${ligados.length > 1 ? 's' : 'l'}</p>

        <section class="cartao">
            <h2>No total</h2>
            ${numerosHtml(total, true)}
        </section>

        <section class="cartao">
            <h2>Por rede</h2>
            ${redes.map(({ rd, deles, t }) => `
                <div class="rede-res">
                    <div class="rede-titulo">${sigla(rd)} ${esc(rd.nome)}<span class="dica">${t.n} post${t.n === 1 ? '' : 's'}</span></div>
                    <div class="barra-views"><i style="width:${Math.round((t.views || 0) / maxViews * 100)}%;background:${rd.cor}"></i></div>
                    ${numerosHtml(t)}
                    ${deles.length > 1 || deles.some(x => x.res?.erro) ? deles.map(({ p, res }) => `
                        <div class="perfil-res">
                            <span>${esc(p.nome)}</span>
                            ${res?.erro ? `<em>${esc(res.erro)}</em>` : numerosHtml(somar(noPeriodo(res?.posts)))}
                        </div>`).join('') : ''}
                </div>`).join('')}
        </section>

        ${publicacoes.length ? `
        <section class="cartao">
            <h2>Suas publicações pelo Espalhe</h2>
            ${publicacoes.map(({ h, casados }, i) => publicacaoHtml(h, casados, i)).join('')}
        </section>` : ''}

        <section class="cartao">
            <h2>Todos os posts recentes</h2>
            <p class="dica">Inclusive o que você publicou fora do Espalhe.</p>
            ${porPerfil.map(({ p, rd, res }) => {
                const posts = noPeriodo(res?.posts);
                const k = 'perfil:' + p.id;
                return `
                <div class="bloco-perfil">
                    <button class="perfil-linha" data-acao="abrir" data-k="${k}">
                        <span>${sigla(rd)} ${esc(p.nome)}<small>${res?.erro ? `<em>${esc(res.erro)}</em>` : `${posts.length} post${posts.length === 1 ? '' : 's'} · ${esc(res?.conta || conexao(p.id).conta)}`}</small></span>
                        <span class="seta">${est.abertos[k] ? '⌄' : '›'}</span>
                    </button>
                    ${est.abertos[k] ? posts.map(post => postHtml(p, post)).join('') || '<p class="dica">Nada no período.</p>' : ''}
                </div>`;
            }).join('')}
        </section>

        <section class="cartao explica">
            <h2>E quem curtiu?</h2>
            <p>Nenhuma dessas redes deixa um app ver a lista de quem curtiu: Instagram, TikTok, YouTube
            e Threads só informam o total. Onde dá, o Espalhe mostra <b>quem comentou</b>; e na Página do
            Facebook, também <b>quem reagiu</b>. Toque em “Quem comentou” num post.</p>
        </section>

        ${desligados.length ? `
        <section class="cartao">
            <h2>Perfis ainda sem ligação</h2>
            ${desligados.map(p => `
                <button class="perfil-linha" data-acao="editar-perfil-res" data-id="${p.id}">
                    <span>${sigla(rede(p.rede))} ${esc(p.nome)}<small>Toque para ligar as métricas</small></span><span class="seta">›</span>
                </button>`).join('')}
        </section>` : ''}
        ${semApiHtml(semApi)}`;
}

function semApiHtml(lista) {
    if (!lista.length) return '';
    const redes = [...new Set(lista.map(p => p.rede))].map(rede);
    return `
        <section class="cartao explica">
            <h2>Sem números disponíveis</h2>
            ${redes.map(rd => `<p>${sigla(rd)} <b>${esc(rd.nome)}</b> — ${esc(rd.semMetricas)}</p>`).join('')}
        </section>`;
}

function publicacaoHtml(h, casados, i) {
    const k = 'pub:' + h.data;
    const achados = casados.filter(c => c.post);
    const t = somar(achados.map(c => c.post));
    const porRede = REDES.map(rd => ({ rd, posts: achados.filter(c => c.e.rede === rd.id).map(c => c.post) }))
        .filter(x => x.posts.length);
    const aberto = est.abertos[k];
    return `
    <div class="pub">
        <button class="pub-cab" data-acao="abrir" data-k="${k}">
            <small>${new Date(h.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} · ${h.tipo === 'video' ? 'vídeo' : 'foto'}</small>
            <p>${esc(h.legenda.slice(0, 110)) || '<span class="vazio">sem legenda</span>'}</p>
        </button>
        ${achados.length ? numerosHtml(t) : ''}
        <div class="chips">${porRede.map(({ rd, posts }) => {
            const s = somar(posts);
            return `<span class="chip">${sigla(rd)} ${fmtNum(s.views)} ▶ · ${fmtNum(s.likes)} ♥</span>`;
        }).join('')}</div>
        ${aberto ? casados.map(({ e, p, post }) => post ? postHtml(p, post, `${e.perfil} · ${e.formato}`)
            : `<p class="dica">${esc(e.perfil)} · ${esc(e.formato)}: ${!p || !rede(p.rede).metricas ? 'rede sem métricas.'
                : !conexao(p.id).conectado ? 'perfil sem ligação de métricas.'
                : 'post ainda não encontrado — atualize depois de publicar.'}</p>`).join('')
            : `<button class="leve pequeno" data-acao="abrir" data-k="${k}">Ver por perfil</button>`}
    </div>`;
}

/* Endereços que vêm das APIs só entram na tela se forem https. */
const https = u => /^https:\/\//i.test(u || '') ? u : '';

function postHtml(p, post, titulo) {
    const rd = rede(p.rede);
    const mini = https(post.miniatura), link = https(post.link);
    const k = p.id + '|' + post.id;
    const c = est.comentarios[k];
    let lista = '';
    if (c === 'carregando') lista = '<p class="dica">Carregando…</p>';
    else if (c?.erro) lista = `<p class="alerta">${esc(c.erro)}</p>`;
    else if (c?.indisponivel) lista = `<p class="dica">O ${esc(rd.nome)} não deixa apps lerem os comentários.</p>`;
    else if (c) {
        lista = `<div class="coments">
            ${c.reacoes?.length ? `<p class="dica"><b>Quem reagiu (${c.reacoes.length}):</b> ${c.reacoes.map(r => esc(r.nome)).join(', ')}</p>` : ''}
            ${c.comentarios.length ? c.comentarios.map(x => `<p><b>${esc(x.autor)}</b> ${esc(x.texto)}</p>`).join('')
                : '<p class="dica">Nenhum comentário.</p>'}
        </div>`;
    }
    const tipo = { story: 'Story', reel: 'Reel', short: 'Short', video: 'Vídeo', post: 'Post' }[post.tipo] || '';
    return `
    <div class="post">
        ${mini ? `<img src="${esc(mini)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '<div class="sem-mini"></div>'}
        <div class="post-txt">
            <small>${titulo ? esc(titulo) + ' · ' : ''}${tipo} · ${new Date(post.data).toLocaleDateString('pt-BR')}</small>
            <p>${esc(post.texto.slice(0, 90)) || '<span class="vazio">sem texto</span>'}</p>
            ${numerosHtml(post)}
            <div class="linha-acoes">
                <button class="leve pequeno" data-acao="comentarios" data-p="${p.id}" data-post="${esc(post.id)}">Quem comentou</button>
                ${link ? `<a class="leve pequeno link" href="${esc(link)}" rel="noreferrer">Abrir</a>` : ''}
            </div>
            ${lista}
        </div>
    </div>`;
}

// --------------------------------------------- ligação no cadastro de perfil

const PASSOS = {
    instagram: `
        <li>No Instagram, mude a conta para <b>Criador de conteúdo</b> (é grátis e dá para voltar):
            Configurações → Tipo de conta e ferramentas → Mudar para conta profissional.
            A API do Instagram não lê números de conta pessoal.</li>
        <li>Em <a href="https://developers.facebook.com/apps">developers.facebook.com/apps</a>, entre com o
            Facebook e crie um app com o caso de uso <b>Gerenciar mensagens e conteúdo no Instagram</b>.</li>
        <li>Em <b>Funções do app → Funções</b>, adicione a conta do Instagram como <b>Testador do Instagram</b>
            e aceite o convite no Instagram: Configurações → Apps e sites → Convites de testador.</li>
        <li>No caso de uso, abra <b>Configuração da API com login do Instagram</b> → <b>Gerar tokens de acesso</b>:
            adicione a conta e toque em <b>Gerar token</b>. Copie e cole aqui.</li>
        <li>O token vale 60 dias; o Espalhe o renova sozinho toda semana enquanto você usar.</li>`,
    threads: `
        <li>Em <a href="https://developers.facebook.com/apps">developers.facebook.com/apps</a>, crie um app com
            o caso de uso <b>Acessar a API do Threads</b>.</li>
        <li>Nas permissões do caso de uso, inclua <b>threads_basic</b>, <b>threads_manage_insights</b> e
            <b>threads_read_replies</b>.</li>
        <li>Em <b>Funções do app</b>, adicione o seu usuário como <b>Testador do Threads</b> e aceite no Threads:
            Configurações → Conta → Permissões de sites → Convites.</li>
        <li>Use o <b>Gerador de token de usuário</b> do caso de uso, copie e cole aqui.</li>`,
    facebook: `
        <li>Em <a href="https://developers.facebook.com/apps">developers.facebook.com/apps</a>, crie um app do tipo
            <b>Empresa</b>.</li>
        <li>Abra o <a href="https://developers.facebook.com/tools/explorer/">Explorador da API do Graph</a>, escolha
            o app e adicione as permissões <b>pages_show_list</b>, <b>pages_read_engagement</b>,
            <b>read_insights</b> e <b>pages_read_user_content</b>. Toque em <b>Gerar token</b> e autorize as Páginas.</li>
        <li>Leve o token ao <a href="https://developers.facebook.com/tools/debug/accesstoken/">Depurador de token</a>
            e toque em <b>Estender token de acesso</b>. O token da Página que o Espalhe tira dele não vence.</li>
        <li>Cole aqui o token estendido. Se você administra várias Páginas, o Espalhe pergunta qual é esta.</li>`,
    tiktok: `
        <li>Em <a href="https://developers.tiktok.com/apps">developers.tiktok.com</a>, entre e crie um app
            (<b>Manage apps → Connect an app</b>).</li>
        <li>Adicione o produto <b>Login Kit</b> (Web) e os escopos <b>user.info.basic</b> e <b>video.list</b>.</li>
        <li>Em Login Kit → <b>Redirect URI</b>, registre exatamente: <code>${'${volta}'}</code></li>
        <li>Crie um <b>Sandbox</b> e adicione a sua conta do TikTok em <b>Target users</b> — assim funciona sem
            esperar a aprovação do TikTok.</li>
        <li>Copie o <b>Client key</b> e o <b>Client secret</b> do sandbox e cole aqui. Eles ficam só neste celular.</li>`,
};

function metricasPerfilHtml(e) {
    const rd = rede(e.rede);
    let corpo;
    if (!rd.metricas) {
        corpo = `<p class="dica">${esc(rd.semMetricas)}</p>`;
    } else if (!e.id || perfil(e.id)?.rede !== e.rede) {
        corpo = '<p class="dica">Salve o perfil para ligar as métricas.</p>';
    } else if (conexao(e.id).conectado) {
        corpo = `<p class="ok">✓ Ligado como <b>${esc(conexao(e.id).conta)}</b></p>
            <button class="perigo pequeno" data-acao="desligar">Desligar</button>`;
    } else if (est.paginas?.perfil === e.id) {
        corpo = `<p class="dica">Você administra várias Páginas. Qual é a deste perfil?</p>
            <div class="opcoes">${est.paginas.lista.map(pg => `
                <button data-acao="pagina" data-v="${esc(pg.id)}">${esc(pg.nome)}</button>`).join('')}</div>`;
    } else if (rd.metricas === 'token') {
        corpo = `
            <textarea id="f-token" rows="3" placeholder="Cole aqui o token de acesso">${esc(e['f-token'] || '')}</textarea>
            <div class="linha-acoes"><button class="primario pequeno" data-acao="ligar-token">Ligar</button></div>
            <details><summary>Como gerar o token (uma vez só, grátis)</summary><ol>${PASSOS[rd.id]}</ol></details>`;
    } else if (rd.metricas === 'google') {
        corpo = configMetricas().google
            ? `<button class="primario pequeno" data-acao="ligar-google">Entrar com o Google</button>
               <p class="dica">Abre o login do Google no navegador. Escolha a conta (ou a conta de marca) do canal.</p>`
            : `<p class="dica">Este APK foi montado sem o ID do cliente do Google. Para ligar o YouTube, siga a seção
               <b>YouTube</b> do README do Espalhe (preencher <code>googleClienteId</code> e gerar o APK de novo).</p>`;
    } else {
        const cfg = configMetricas();
        const volta = e['f-tt-volta'] ?? cfg.tiktokVolta ?? cfg.volta;
        corpo = cfg.tiktok && !e.trocarChaves
            ? `<button class="primario pequeno" data-acao="ligar-tiktok">Entrar no TikTok</button>
               <button class="leve pequeno" data-acao="trocar-chaves">Trocar chaves do app</button>
               <p class="dica">Abre o login do TikTok no navegador; no fim, toque em “Voltar ao Espalhe” se ele pedir.</p>`
            : `<label class="rotulo" for="f-tt-chave">Client key</label>
               <input id="f-tt-chave" value="${esc(e['f-tt-chave'] || '')}" autocomplete="off">
               <label class="rotulo" for="f-tt-segredo">Client secret</label>
               <input id="f-tt-segredo" value="${esc(e['f-tt-segredo'] || '')}" autocomplete="off">
               <label class="rotulo" for="f-tt-volta">Redirect URI</label>
               <input id="f-tt-volta" value="${esc(volta)}" autocomplete="off">
               <div class="linha-acoes"><button class="primario pequeno" data-acao="salvar-chaves">Salvar chaves</button></div>
               <details><summary>Como criar o app no TikTok (uma vez só, grátis)</summary>
               <ol>${PASSOS.tiktok.replace('${volta}', esc(volta))}</ol></details>`;
    }
    // é a parte técnica do app: fica fechada, para quem só quer publicar nem precisar ver
    const aberto = e.id && (conexao(e.id).conectado || est.paginas?.perfil === e.id || e.metricasAbertas);
    return `<details class="metricas-bloco" ${aberto ? 'open' : ''}>
        <summary class="rotulo">Ver números de visualizações e curtidas <small>(opcional, exige configurar)</small></summary>${corpo}</details>`;
}

// lembra se a parte das métricas ficou aberta, para um render no meio não fechá-la
document.addEventListener('toggle', e => {
    if (est.editando && e.target.matches?.('details.metricas-bloco')) est.editando.metricasAbertas = e.target.open;
}, true);

const acoesMetricas = {
    'ir-aba-perfis'() { est.aba = 'perfis'; render(); },
    'editar-perfil-res'(b) { est.aba = 'perfis'; est.editando = { ...perfil(b.dataset.id) }; render(); window.scrollTo(0, 0); },
    periodo(b) { est.periodo = +b.dataset.v; guardar(); render(); },
    atualizar() { atualizarResultados(); },
    abrir(b) { est.abertos[b.dataset.k] = !est.abertos[b.dataset.k]; render(); },
    async comentarios(b) {
        const k = b.dataset.p + '|' + b.dataset.post;
        if (est.comentarios[k] && est.comentarios[k] !== 'carregando') { delete est.comentarios[k]; render(); return; }
        est.comentarios[k] = 'carregando';
        render();
        est.comentarios[k] = await pedirM('comentarios', [b.dataset.p, b.dataset.post]);
        render();
    },
    async 'ligar-token'(b) {
        const e = est.editando;
        const token = ($('#f-token')?.value || '').trim();
        if (!token) { aviso('Cole o token primeiro.'); return; }
        b.disabled = true;
        b.textContent = 'Conferindo…';
        const r = await pedirM('conectarToken', [e.id, e.rede, token]);
        ligou(e, r);
    },
    async pagina(b) {
        const e = est.editando;
        ligou(e, await pedirM('escolherPagina', [e.id, b.dataset.v]));
    },
    'ligar-google'() {
        const erro = M.conectarGoogle(est.editando.id);
        if (erro) aviso(erro);
    },
    'ligar-tiktok'() {
        const erro = M.conectarTikTok(est.editando.id);
        if (erro) aviso(erro);
    },
    'trocar-chaves'() { est.editando.trocarChaves = true; render(); },
    'salvar-chaves'() {
        const e = est.editando;
        const chave = ($('#f-tt-chave').value || '').trim();
        const segredo = ($('#f-tt-segredo').value || '').trim();
        if (!chave || !segredo) { aviso('Preencha o Client key e o Client secret.'); return; }
        const erro = M.configurarTikTok(chave, segredo, $('#f-tt-volta').value || '');
        if (erro) { aviso(erro); return; }
        e.trocarChaves = false;
        render();
        aviso('Chaves salvas neste celular. Agora entre no TikTok.');
    },
    desligar() {
        const e = est.editando;
        if (!confirm(`Desligar as métricas de ${e.nome}?`)) return;
        M.desconectar(e.id);
        delete est.conexoes[e.id];
        delete est.resultados[e.id];
        guardar(); render();
    },
};

function ligou(e, r) {
    delete est.conexoes[e.id];
    if (r.paginas) {
        est.paginas = { perfil: e.id, lista: r.paginas };
    } else if (r.erro) {
        aviso('Não ligou: ' + r.erro);
    } else {
        est.paginas = null;
        delete e['f-token'];
        aviso(`Ligado como ${r.conta}. Buscando os números…`);
        atualizarResultados([e.id]);
    }
    render();
}
