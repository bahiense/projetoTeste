/*
 * Servidor do Espalhe (Cloudflare Worker).
 *
 * Existe por um motivo só: trocar o código de login de cada rede por um acesso
 * exige a senha do app de desenvolvedor, e essa senha não pode ir dentro do APK
 * (qualquer um a tiraria de lá). Ela fica aqui, como segredo do Worker.
 *
 * Não guarda nada: não há banco de dados. O acesso conseguido volta para o app
 * cifrado com uma chave que só aquele celular tem (ECDH P-256 + AES-GCM): o
 * celular manda a metade pública na hora de entrar, e só ele consegue abrir a
 * resposta — nem o navegador, nem o histórico, nem quem copiar o link.
 *
 * Rotas:
 *   GET  /                 página para o dono conferir a configuração
 *   GET  /redes            quais redes estão configuradas (o app pergunta)
 *   GET  /entrar/:rede     começa o login (vem do app, pelo navegador)
 *   GET  /volta/:rede      a rede devolve o código aqui; entrega ao app
 *   POST /renovar          renova TikTok e Google, que pedem a senha para isso
 */

const REDES = {
    instagram: {
        nome: 'Instagram',
        vars: ['IG_ID', 'IG_SEGREDO'],
        autorizar: (env, volta, estado) => url('https://www.instagram.com/oauth/authorize', {
            client_id: env.IG_ID, redirect_uri: volta, response_type: 'code', state: estado,
            scope: 'instagram_business_basic,instagram_business_manage_insights,instagram_business_manage_comments',
        }),
        async trocar(env, volta, codigo) {
            const curto = await postForm('https://api.instagram.com/oauth/access_token', {
                client_id: env.IG_ID, client_secret: env.IG_SEGREDO, grant_type: 'authorization_code',
                redirect_uri: volta, code: codigo,
            });
            // o de curta duração vale 1 hora; o longo, 60 dias (e o app renova)
            const longo = await getJson(url('https://graph.instagram.com/access_token', {
                grant_type: 'ig_exchange_token', client_secret: env.IG_SEGREDO, access_token: curto.access_token,
            }));
            return { token: longo.access_token };
        },
    },
    threads: {
        nome: 'Threads',
        vars: ['TH_ID', 'TH_SEGREDO'],
        autorizar: (env, volta, estado) => url('https://threads.net/oauth/authorize', {
            client_id: env.TH_ID, redirect_uri: volta, response_type: 'code', state: estado,
            scope: 'threads_basic,threads_manage_insights,threads_read_replies',
        }),
        async trocar(env, volta, codigo) {
            const curto = await postForm('https://graph.threads.net/oauth/access_token', {
                client_id: env.TH_ID, client_secret: env.TH_SEGREDO, grant_type: 'authorization_code',
                redirect_uri: volta, code: codigo,
            });
            const longo = await getJson(url('https://graph.threads.net/access_token', {
                grant_type: 'th_exchange_token', client_secret: env.TH_SEGREDO, access_token: curto.access_token,
            }));
            return { token: longo.access_token };
        },
    },
    facebook: {
        nome: 'Facebook (Páginas)',
        vars: ['FB_ID', 'FB_SEGREDO'],
        autorizar: (env, volta, estado) => url('https://www.facebook.com/v23.0/dialog/oauth', {
            client_id: env.FB_ID, redirect_uri: volta, response_type: 'code', state: estado,
            scope: 'pages_show_list,pages_read_engagement,read_insights,pages_read_user_content',
        }),
        async trocar(env, volta, codigo) {
            const curto = await getJson(url('https://graph.facebook.com/v23.0/oauth/access_token', {
                client_id: env.FB_ID, client_secret: env.FB_SEGREDO, redirect_uri: volta, code: codigo,
            }));
            // token longo de usuário: os tokens de Página tirados dele não vencem
            const longo = await getJson(url('https://graph.facebook.com/v23.0/oauth/access_token', {
                grant_type: 'fb_exchange_token', client_id: env.FB_ID, client_secret: env.FB_SEGREDO,
                fb_exchange_token: curto.access_token,
            }));
            return { token: longo.access_token };
        },
    },
    tiktok: {
        nome: 'TikTok',
        vars: ['TT_CHAVE', 'TT_SEGREDO'],
        autorizar: (env, volta, estado) => url('https://www.tiktok.com/v2/auth/authorize/', {
            client_key: env.TT_CHAVE, redirect_uri: volta, response_type: 'code', state: estado,
            scope: 'user.info.basic,video.list',
        }),
        async trocar(env, volta, codigo) {
            const r = await postForm('https://open.tiktokapis.com/v2/oauth/token/', {
                client_key: env.TT_CHAVE, client_secret: env.TT_SEGREDO, grant_type: 'authorization_code',
                redirect_uri: volta, code: codigo,
            });
            return { acesso: r.access_token, refresh: r.refresh_token, expira: r.expires_in };
        },
        async renovar(env, refresh) {
            const r = await postForm('https://open.tiktokapis.com/v2/oauth/token/', {
                client_key: env.TT_CHAVE, client_secret: env.TT_SEGREDO, grant_type: 'refresh_token',
                refresh_token: refresh,
            });
            return { acesso: r.access_token, refresh: r.refresh_token, expira: r.expires_in };
        },
    },
    youtube: {
        nome: 'YouTube',
        vars: ['GOOGLE_ID', 'GOOGLE_SEGREDO'],
        autorizar: (env, volta, estado) => url('https://accounts.google.com/o/oauth2/v2/auth', {
            client_id: env.GOOGLE_ID, redirect_uri: volta, response_type: 'code', state: estado,
            scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly',
            // offline + consent: é o que faz o Google devolver o refresh_token
            access_type: 'offline', prompt: 'consent',
        }),
        async trocar(env, volta, codigo) {
            const r = await postForm('https://oauth2.googleapis.com/token', {
                client_id: env.GOOGLE_ID, client_secret: env.GOOGLE_SEGREDO, grant_type: 'authorization_code',
                redirect_uri: volta, code: codigo,
            });
            return { acesso: r.access_token, refresh: r.refresh_token, expira: r.expires_in };
        },
        async renovar(env, refresh) {
            const r = await postForm('https://oauth2.googleapis.com/token', {
                client_id: env.GOOGLE_ID, client_secret: env.GOOGLE_SEGREDO, grant_type: 'refresh_token',
                refresh_token: refresh,
            });
            return { acesso: r.access_token, refresh, expira: r.expires_in };
        },
    },
};

const configurada = (env, id) => REDES[id].vars.every(v => env[v]);

export default {
    async fetch(req, env) {
        const u = new URL(req.url);
        const [, rota, rede] = u.pathname.split('/');
        try {
            if (!env.SEGREDO) return texto('Falta o segredo SEGREDO no Worker. Veja o guia de configuração.', 500);
            if (req.method === 'GET' && !rota) return paginaDono(env, u.origin);
            if (req.method === 'GET' && rota === 'redes') {
                return json(Object.keys(REDES).filter(id => configurada(env, id)));
            }
            if (req.method === 'GET' && rota === 'entrar' && REDES[rede]) return entrar(env, u, rede);
            if (req.method === 'GET' && rota === 'volta' && REDES[rede]) return voltar(env, u, rede);
            if (req.method === 'POST' && rota === 'renovar') return renovar(env, req);
            return texto('Não encontrado.', 404);
        } catch (e) {
            return paginaErro(e.message);
        }
    },
};

// ------------------------------------------------------------------- login

async function entrar(env, u, rede) {
    if (!configurada(env, rede)) return paginaErro(`O ${REDES[rede].nome} ainda não foi configurado neste servidor.`);
    const pub = u.searchParams.get('pub') || '';
    const marca = u.searchParams.get('marca') || '';
    if (!/^[A-Za-z0-9_-]{80,200}$/.test(pub) || !/^[A-Za-z0-9_-]{8,40}$/.test(marca)) {
        return paginaErro('Pedido de login inválido. Volte ao Espalhe e tente de novo.');
    }
    // o "state" leva a chave pública do celular, assinada: na volta, só aceitamos
    // o que este servidor mesmo mandou, e por 15 minutos
    const estado = await assinar(env, { r: rede, p: pub, m: marca, x: Date.now() + 15 * 60e3 });
    return Response.redirect(REDES[rede].autorizar(env, `${u.origin}/volta/${rede}`, estado), 302);
}

async function voltar(env, u, rede) {
    const erro = u.searchParams.get('error');
    const estado = await conferir(env, u.searchParams.get('state') || '');
    if (!estado || estado.r !== rede) return paginaErro('Este login não confere ou demorou demais. Tente de novo pelo Espalhe.');
    let resultado;
    if (erro) {
        resultado = { erro: erro === 'access_denied' ? 'Você recusou o acesso.' : `A rede recusou: ${erro}` };
    } else {
        const codigo = u.searchParams.get('code');
        if (!codigo) return paginaErro('A rede não devolveu o código de acesso.');
        try {
            resultado = await REDES[rede].trocar(env, `${u.origin}/volta/${rede}`, codigo);
        } catch (e) {
            resultado = { erro: e.message };
        }
    }
    resultado.rede = rede;
    const caixa = await cifrarPara(estado.p, JSON.stringify(resultado));
    const destino = 'intent://volta?' + new URLSearchParams({ marca: estado.m, chave: caixa.chave, dados: caixa.dados }) +
        '#Intent;scheme=espalhe;package=com.bahiense.espalhe;end';
    return paginaVolta(destino);
}

async function renovar(env, req) {
    const { rede, refresh } = await req.json();
    if (!REDES[rede]?.renovar || !configurada(env, rede) || typeof refresh !== 'string' || !refresh) {
        return json({ erro: 'pedido inválido' }, 400);
    }
    try {
        return json(await REDES[rede].renovar(env, refresh));
    } catch (e) {
        return json({ erro: e.message }, 400);
    }
}

// ------------------------------------------------------------ criptografia

const b64u = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const deB64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

async function chaveHmac(env) {
    return crypto.subtle.importKey('raw', new TextEncoder().encode(env.SEGREDO), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function assinar(env, obj) {
    const corpo = b64u(new TextEncoder().encode(JSON.stringify(obj)));
    const sig = await crypto.subtle.sign('HMAC', await chaveHmac(env), new TextEncoder().encode(corpo));
    return corpo + '.' + b64u(sig);
}

async function conferir(env, estado) {
    const [corpo, sig] = estado.split('.');
    if (!corpo || !sig) return null;
    const ok = await crypto.subtle.verify('HMAC', await chaveHmac(env), deB64u(sig), new TextEncoder().encode(corpo));
    if (!ok) return null;
    const obj = JSON.parse(new TextDecoder().decode(deB64u(corpo)));
    return obj.x > Date.now() ? obj : null;
}

/*
 * Cifra para o celular: uma chave EC de uso único deste lado + a pública do
 * celular dão um segredo comum (ECDH); o SHA-256 dele é a chave AES-GCM. O
 * celular refaz a mesma conta com a sua chave privada (Metricas.kt, abrirCaixa).
 */
async function cifrarPara(pubB64, texto) {
    const delas = await crypto.subtle.importKey('spki', deB64u(pubB64), { name: 'ECDH', namedCurve: 'P-256' }, false, []);
    const nossa = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
    const comum = await crypto.subtle.deriveBits({ name: 'ECDH', public: delas }, nossa.privateKey, 256);
    const aes = await crypto.subtle.importKey('raw', await crypto.subtle.digest('SHA-256', comum), 'AES-GCM', false, ['encrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cifrado = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aes, new TextEncoder().encode(texto));
    const junto = new Uint8Array(12 + cifrado.byteLength);
    junto.set(iv);
    junto.set(new Uint8Array(cifrado), 12);
    return { chave: b64u(await crypto.subtle.exportKey('spki', nossa.publicKey)), dados: b64u(junto) };
}

// -------------------------------------------------------------------- rede

function url(base, params) {
    return base + '?' + new URLSearchParams(params);
}

async function lerResposta(r) {
    const t = await r.text();
    let o;
    try { o = JSON.parse(t); } catch (e) { throw new Error(`resposta inesperada (HTTP ${r.status})`); }
    const e = o.error;
    if (!r.ok || e) {
        throw new Error((typeof e === 'object' ? e.message : o.error_description || e) || o.error_message || `HTTP ${r.status}`);
    }
    return o;
}

const getJson = u => fetch(u).then(lerResposta);
const postForm = (u, campos) => fetch(u, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(campos),
}).then(lerResposta);

// ----------------------------------------------------------------- páginas

const json = (o, status = 200) => new Response(JSON.stringify(o), {
    status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});
const texto = (t, status = 200) => new Response(t, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function pagina(titulo, corpo, extra = '') {
    return new Response(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(titulo)}</title><style>
body{margin:0;background:#0b0d12;color:#eef1f7;font-family:system-ui,sans-serif;line-height:1.5}
main{max-width:560px;margin:0 auto;padding:32px 18px;text-align:center}
a.b{display:inline-block;background:#8b6cff;color:#fff;padding:14px 22px;border-radius:12px;font-weight:600;text-decoration:none;margin-top:14px}
p{color:#97a0b6}table{width:100%;text-align:left;border-collapse:collapse;margin-top:16px;font-size:14px}
td{border-top:1px solid #242a3a;padding:8px 4px;vertical-align:top}code{background:#141824;padding:2px 5px;border-radius:5px;word-break:break-all}
.ok{color:#3ccf8e}.nao{color:#ff8a3d}</style></head><body><main>${corpo}</main>${extra}</body></html>`, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store',
            'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'",
            'Referrer-Policy': 'no-referrer',
        },
    });
}

function paginaVolta(destino) {
    return pagina('Voltar ao Espalhe', `<h1>Pronto!</h1><p>Voltando ao Espalhe…</p>
        <a class="b" href="${esc(destino)}">Voltar ao Espalhe</a>`,
        `<script>location.replace(${JSON.stringify(destino)})</script>`);
}

function paginaErro(msg) {
    return pagina('Espalhe', `<h1>Ops</h1><p>${esc(msg)}</p>
        <a class="b" href="intent://volta#Intent;scheme=espalhe;package=com.bahiense.espalhe;end">Voltar ao Espalhe</a>`);
}

/* Para o dono: o que já está configurado e os endereços de volta a cadastrar. */
function paginaDono(env, origem) {
    const linhas = Object.entries(REDES).map(([id, r]) => `<tr>
        <td><b>${esc(r.nome)}</b><br>${configurada(env, id) ? '<span class="ok">✓ configurado</span>' : `<span class="nao">falta ${r.vars.filter(v => !env[v]).join(', ')}</span>`}</td>
        <td>Endereço de volta:<br><code>${esc(origem)}/volta/${id}</code></td></tr>`).join('');
    return pagina('Servidor do Espalhe', `<h1>Servidor do Espalhe</h1>
        <p>Funcionando. Cadastre cada endereço de volta no painel da rede correspondente.</p>
        <table>${linhas}</table>`);
}
