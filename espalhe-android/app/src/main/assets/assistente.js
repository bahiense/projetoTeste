'use strict';

/*
 * O que deixa o Espalhe pronto para quem nunca mexeu nele: o assistente da
 * primeira abertura (redes → nomes → apps que faltam) e o aviso de versão nova,
 * que atualiza com um toque. Carrega antes do app.js; aqui só há funções e o
 * objeto acoesAssistente, que o app.js junta às suas ações.
 */

const U = window.EspalheAtualizar;

// --------------------------------------------------------------- assistente

/* Começa sozinho quando não há perfil nenhum e a pessoa ainda não passou por ele. */
function precisaAssistente() {
    return !est.perfis.length && !lerGuardado().assistenteVisto;
}

function iniciarAssistente() {
    est.assistente = { passo: 'oi', redes: [], nomes: {} };
}

function renderAssistente() {
    const a = est.assistente;
    document.body.classList.add('sem-abas');
    const passos = ['oi', 'redes', 'nomes', 'apps'];
    const n = passos.indexOf(a.passo);
    const pontos = `<div class="pontos">${passos.map((_, i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</div>`;
    let corpo = '', botao = '';

    if (a.passo === 'oi') {
        cabecalho('Bem-vindo ao Espalhe', '');
        corpo = `
            <section class="cartao boas-vindas">
                <div class="grande-icone">📣</div>
                <p><b>Publique a mesma foto ou vídeo em todas as suas redes, de uma vez.</b></p>
                <p>O Espalhe deixa cada um no tamanho certo — post, Stories, Reels, status — e mostra
                como vai ficar antes de enviar. Sem feed, sem distração.</p>
                <p class="dica">Vamos deixar tudo pronto em três passos.</p>
            </section>`;
        botao = `<button class="primario" data-acao="assist-ir" data-v="redes">Começar</button>`;
    } else if (a.passo === 'redes') {
        cabecalho('Onde você publica?', 'Toque em todas as redes que você usa.');
        corpo = `
            <div class="redes-grade larga">${REDES.map(rd => `
                <button data-acao="assist-rede" data-r="${rd.id}" class="${a.redes.includes(rd.id) ? 'on' : ''}">
                    ${sigla(rd)}<span>${esc(rd.nome)}</span>${a.redes.includes(rd.id) ? '<b class="marca-ok">✓</b>' : ''}
                </button>`).join('')}
            </div>`;
        botao = `<button class="leve" data-acao="assist-ir" data-v="oi">Voltar</button>
            <button class="primario" data-acao="assist-ir" data-v="nomes" ${a.redes.length ? '' : 'disabled'}>Continuar</button>`;
    } else if (a.passo === 'nomes') {
        cabecalho('Como se chamam seus perfis?', 'Serve só para você reconhecer cada um. Pode deixar em branco.');
        corpo = a.redes.map(id => {
            const rd = rede(id);
            const nomes = a.nomes[id] || [''];
            return `
            <section class="cartao">
                <div class="rede-titulo">${sigla(rd)} ${esc(rd.nome)}</div>
                ${nomes.map((nome, i) => `
                    <input class="assist-nome" data-r="${id}" data-i="${i}" value="${esc(nome)}"
                        placeholder="${id === 'whatsapp' ? 'Ex.: Pessoal, Loja…' : 'Ex.: @seuperfil'}" autocomplete="off">`).join('')}
                <button class="leve pequeno" data-acao="assist-mais" data-r="${id}">＋ Tenho outro perfil no ${esc(rd.nome)}</button>
            </section>`;
        }).join('');
        botao = `<button class="leve" data-acao="assist-ir" data-v="redes">Voltar</button>
            <button class="primario" data-acao="assist-salvar">Continuar</button>`;
    } else {
        cabecalho('Falta só instalar os apps', 'É por eles que o post sai na sua conta. Toque em cada um.');
        const faltam = appsQueFaltam();
        corpo = `
            <section class="cartao">
                ${faltam.length ? faltam.map(({ rd, app }) => `
                    <div class="envio-cab linha-app">
                        ${sigla(rd)}
                        <div class="envio-nome"><b>${esc(app.nome)}</b><small>${app.leve ? 'versão leve, ocupa pouco espaço' : esc(rd.nome)}</small></div>
                        <button class="primario pequeno" data-acao="loja" data-pacote="${app.pacote}">Instalar</button>
                    </div>`).join('')
                    : '<p class="ok grande-ok">✓ Tudo instalado. Está pronto!</p>'}
            </section>
            ${faltam.length ? `<p class="dica centro">A Play Store abre; toque em <b>Instalar</b> e volte para cá.
                Depois de instalar, entre uma vez na sua conta em cada app.</p>` : ''}`;
        botao = `<button class="primario" data-acao="assist-fim">${faltam.length ? 'Fazer isso depois' : 'Começar a publicar'}</button>`;
    }
    $('#conteudo').innerHTML = pontos + corpo;
    mostrarBarra(botao);
    document.querySelectorAll('.assist-nome').forEach(inp => inp.addEventListener('input', () => {
        const l = a.nomes[inp.dataset.r] || (a.nomes[inp.dataset.r] = ['']);
        l[+inp.dataset.i] = inp.value;
    }));
}

/* Um app por perfil cadastrado cujo app ainda não está no celular (sem repetir). */
function appsQueFaltam() {
    const vistos = new Set();
    const lista = [];
    for (const p of est.perfis) {
        if (est.instalados.has(p.pacote) || vistos.has(p.pacote)) continue;
        vistos.add(p.pacote);
        const rd = rede(p.rede);
        lista.push({ rd, app: appDe(p) });
    }
    return lista;
}

function terminarAssistente() {
    est.assistente = null;
    document.body.classList.remove('sem-abas');
    localStorage.setItem(CHAVE, JSON.stringify({ ...lerGuardado(), assistenteVisto: true }));
    guardar();
    est.aba = 'publicar';
    render();
}

const acoesAssistente = {
    'assist-ir'(b) { est.assistente.passo = b.dataset.v; render(); window.scrollTo(0, 0); },
    'assist-rede'(b) {
        const l = est.assistente.redes;
        const i = l.indexOf(b.dataset.r);
        if (i >= 0) l.splice(i, 1); else l.push(b.dataset.r);
        render();
    },
    'assist-mais'(b) {
        const l = est.assistente.nomes[b.dataset.r] || (est.assistente.nomes[b.dataset.r] = ['']);
        l.push('');
        render();
        const inps = document.querySelectorAll(`.assist-nome[data-r="${b.dataset.r}"]`);
        inps[inps.length - 1]?.focus();
    },
    'assist-salvar'() {
        const a = est.assistente;
        let n = 0;
        for (const id of a.redes) {
            const rd = rede(id);
            const nomes = (a.nomes[id] || ['']).map(x => x.trim());
            const usados = nomes.filter(Boolean).length ? nomes.filter(Boolean) : [rd.nome];
            for (const nome of usados) {
                est.perfis.push({ id: 'u' + Date.now() + (n++), rede: id, nome, pacote: primeiroInstalado(rd) });
            }
        }
        guardar();
        a.passo = 'apps';
        render();
        window.scrollTo(0, 0);
    },
    'assist-fim'() { terminarAssistente(); },
    'assistente-de-novo'() { iniciarAssistente(); render(); window.scrollTo(0, 0); },
    async 'atualizar-app'(b) {
        b.disabled = true;
        const r = await pedir('atualizar', [], p => { b.textContent = `Baixando… ${p}%`; }, U);
        if (r.permissao) {
            aviso('Ative “Permitir desta fonte” e toque em Atualizar de novo.');
            b.disabled = false;
            b.textContent = 'Atualizar';
        } else if (r.erro) {
            aviso(r.erro);
            b.disabled = false;
            b.textContent = 'Tentar de novo';
        } else {
            b.textContent = 'Toque em Atualizar na tela do Android';
        }
    },
};

// ----------------------------------------------------------- versão nova

/* Confere uma vez por dia; o aviso aparece no topo da tela de publicar. */
async function verificarVersao() {
    if (!U) return;
    const g = lerGuardado();
    if (g.versaoVista && Date.now() - g.versaoVista.em < 20 * 3600e3) {
        // compara com a versão instalada agora: o app pode ter sido atualizado desde a última olhada
        est.versaoNova = g.versaoVista.codigo > U.codigoInstalado() ? g.versaoVista : null;
        return;
    }
    const r = await pedir('verificar', [], null, U);
    if (!r.codigo) return;
    localStorage.setItem(CHAVE, JSON.stringify({ ...lerGuardado(), versaoVista: { ...r, em: Date.now() } }));
    est.versaoNova = r.codigo > r.instalada ? r : null;
    if (est.versaoNova && est.aba === 'publicar' && !est.assistente) render();
}

function avisoVersaoHtml() {
    const v = est.versaoNova;
    if (!v) return '';
    return `
        <section class="cartao versao-nova">
            <div><b>Versão nova do Espalhe</b><small>${esc(v.novidades || 'Melhorias e correções.')}</small></div>
            <button class="primario pequeno" data-acao="atualizar-app">Atualizar</button>
        </section>`;
}
