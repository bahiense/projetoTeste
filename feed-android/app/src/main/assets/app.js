/*
 * Feed Limpo: cancela inscrições em canais de política e inscreve nos canais
 * de música e de fé que você escolher.
 *
 * Toda conversa com o YouTube passa pela ponte nativa (YouTubeBridge.kt):
 * a página pede, a ponte chama a API com o token e devolve a resposta em
 * window.__ytResposta. O token nunca chega até aqui.
 */
(function () {
    "use strict";

    const ponte = window.AndroidYouTube || null;
    const $ = (s) => document.querySelector(s);

    /* ------------------------------------------------------------ guardado */

    function lerLocal(chave, padrao) {
        try {
            const v = localStorage.getItem(chave);
            return v ? JSON.parse(v) : padrao;
        } catch (e) {
            return padrao;
        }
    }

    function salvarLocal(chave, valor) {
        try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { }
    }

    /* Cada busca gasta 100 da cota diária de 10.000. Guardar o resultado é o
       que deixa abrir e fechar o app sem pagar a mesma busca de novo. */
    const buscas = lerLocal("feed.buscas", {});      // termo -> {opcoes, escolha}
    const extras = lerLocal("feed.extras", []);      // nomes que você acrescentou
    const pulados = new Set(lerLocal("feed.pulados", [])); // termos desmarcados

    /* ----------------------------------------------------------------- API */

    class ErroApi extends Error {
        constructor(mensagem, motivo) {
            super(mensagem);
            this.motivo = motivo || "";
        }
    }

    const pendentes = new Map();
    let seq = 0;

    window.__ytResposta = function (pedido, codigo, texto) {
        const p = pendentes.get(pedido);
        if (!p) return;
        pendentes.delete(pedido);
        if (codigo === 0) return p.rejeitar(new ErroApi(texto));
        let dados = {};
        try { dados = texto ? JSON.parse(texto) : {}; } catch (e) { }
        if (codigo >= 400) {
            const erro = dados.error || {};
            const motivo = (erro.errors && erro.errors[0] && erro.errors[0].reason) || "";
            return p.rejeitar(new ErroApi(mensagemDeErro(codigo, motivo, erro.message), motivo));
        }
        p.resolver(dados);
    };

    function mensagemDeErro(codigo, motivo, mensagem) {
        if (cotaEsgotada({ motivo }))
            return "Limite diário da API do YouTube atingido. Volte amanhã: o que já foi feito fica feito.";
        if (motivo === "accessNotConfigured")
            return "A YouTube Data API v3 não está ativada no seu projeto do Google Cloud.";
        if (codigo === 401) return "O Google não aceitou o acesso. Entre na conta outra vez.";
        return mensagem || "Erro " + codigo + " do YouTube.";
    }

    function cotaEsgotada(e) {
        return e.motivo === "quotaExceeded" || e.motivo === "dailyLimitExceeded";
    }

    function api(metodo, caminho, corpo) {
        return new Promise((resolver, rejeitar) => {
            if (!ponte) return rejeitar(new ErroApi("Abra pelo app Android: só ele consegue entrar na conta."));
            const pedido = "p" + (++seq);
            pendentes.set(pedido, { resolver, rejeitar });
            ponte.chamar(pedido, metodo, caminho, corpo ? JSON.stringify(corpo) : "");
        });
    }

    /* --------------------------------------------------------------- conta */

    function lerConta() {
        if (!ponte) return { possivel: false, conectado: false, conta: "", navegador: true };
        try {
            return JSON.parse(ponte.estado());
        } catch (e) {
            return { possivel: false, conectado: false, conta: "" };
        }
    }

    let conta = lerConta();

    window.__ytConectou = function (ok, recado) {
        conta = lerConta();
        if (ok) avisar("Conta conectada" + (recado ? ": " + recado : "."));
        else avisar(recado);
        desenhar();
    };

    window.__ytDesconectou = function () {
        conta = lerConta();
        inscricoes = null;
        desenhar();
    };

    /* ------------------------------------------------------------- estado */

    let aba = "limpar";
    let inscricoes = null;      // null = ainda não lidas
    let carregando = false;
    let filtro = "politica";
    let marcadas = new Set();   // ids de inscrição para cancelar
    let ocupado = null;         // {texto, feito, total} durante um lote
    const buscando = new Set(); // categorias em busca agora
    const inscritosAgora = new Set();
    const errosInscrever = {};  // termo -> recado

    /* ------------------------------------------------------------- miudezas */

    function esc(t) {
        return String(t).replace(/[&<>"']/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
        })[c]);
    }

    /* A busca do YouTube devolve títulos já com entidades HTML (&amp;). */
    function desentidade(t) {
        const a = document.createElement("textarea");
        a.innerHTML = t;
        return a.value;
    }

    const normalizar = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

    const padraoPolitica = new RegExp("\\b(" + window.FEED_POLITICA
        .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")\\b", "g");

    function motivoPolitico(i) {
        const achados = normalizar(i.titulo + " " + i.descricao).match(padraoPolitica) || [];
        return [...new Set(achados)].sort().join(", ");
    }

    function foto(snippet) {
        const t = snippet.thumbnails || {};
        return (t.default || t.medium || {}).url || "";
    }

    function imagem(url) {
        return url ? `<img src="${esc(url)}" alt="" loading="lazy">` : `<img alt="">`;
    }

    let relogioAviso = 0;
    function avisar(texto) {
        const el = $("#aviso");
        el.textContent = texto;
        el.hidden = false;
        clearTimeout(relogioAviso);
        relogioAviso = setTimeout(() => { el.hidden = true; }, 5000);
    }

    function confirmar(texto) {
        const d = $("#confirmar");
        $("#confirmar-texto").textContent = texto;
        d.showModal();
        return new Promise((resolver) => {
            const fim = (resposta) => {
                d.close();
                $("#confirmar-sim").onclick = $("#confirmar-nao").onclick = null;
                resolver(resposta);
            };
            $("#confirmar-sim").onclick = () => fim(true);
            $("#confirmar-nao").onclick = () => fim(false);
        });
    }

    /* ------------------------------------------------------ ler inscrições */

    async function carregarInscricoes() {
        if (carregando) return;
        carregando = true;
        desenhar();
        try {
            const lista = [];
            let pagina = "";
            do {
                const r = await api("GET", "subscriptions?part=snippet&mine=true&maxResults=50" +
                    (pagina ? "&pageToken=" + encodeURIComponent(pagina) : ""));
                for (const item of r.items || []) {
                    const s = item.snippet;
                    lista.push({
                        id: item.id,
                        canalId: s.resourceId.channelId,
                        titulo: s.title,
                        descricao: s.description || "",
                        foto: foto(s),
                    });
                }
                pagina = r.nextPageToken || "";
            } while (pagina);
            lista.forEach((i) => { i.motivo = motivoPolitico(i); });
            lista.sort((a, b) => normalizar(a.titulo).localeCompare(normalizar(b.titulo)));
            inscricoes = lista;
            marcadas = new Set(lista.filter((i) => i.motivo).map((i) => i.id));
        } catch (e) {
            avisar(e.message);
        } finally {
            carregando = false;
            desenhar();
        }
    }

    function seguidos() {
        const s = new Set(inscritosAgora);
        for (const i of inscricoes || []) if (!i.cancelada) s.add(i.canalId);
        return s;
    }

    /* ------------------------------------------------------------- cancelar */

    async function cancelarMarcadas() {
        const alvo = inscricoes.filter((i) => marcadas.has(i.id) && !i.cancelada);
        if (!alvo.length) return;
        const ok = await confirmar(`Cancelar a inscrição em ${alvo.length} ` +
            `${alvo.length === 1 ? "canal" : "canais"}? Dá para se inscrever de novo depois, ` +
            "mas o app não desfaz sozinho.");
        if (!ok) return;

        ocupado = { texto: "Cancelando", feito: 0, total: alvo.length };
        let canceladas = 0;
        for (const i of alvo) {
            try {
                await api("DELETE", "subscriptions?id=" + encodeURIComponent(i.id));
                i.cancelada = true;
            } catch (e) {
                /* Já não existe lá: o resultado é o que se queria. */
                if (e.motivo === "subscriptionNotFound") i.cancelada = true;
                else {
                    i.erro = e.message;
                    if (cotaEsgotada(e)) { avisar(e.message); break; }
                }
            }
            if (i.cancelada) { canceladas++; i.erro = ""; marcadas.delete(i.id); }
            ocupado.feito++;
            desenhar();
        }
        ocupado = null;
        desenhar();
        avisar(`${canceladas} ${canceladas === 1 ? "inscrição cancelada" : "inscrições canceladas"}.`);
    }

    /* ----------------------------------------------------------- adicionar */

    function categorias() {
        const lista = window.FEED_CANAIS.slice();
        if (extras.length) lista.push({ nome: "Seus acréscimos", canais: extras });
        return lista;
    }

    function escolhido(termo) {
        const b = buscas[termo];
        return b && b.opcoes.length ? b.opcoes[b.escolha] : null;
    }

    async function buscarTermos(termos, chave) {
        buscando.add(chave);
        desenhar();
        try {
            for (const termo of termos) {
                if (buscas[termo]) continue;
                const r = await api("GET", "search?part=snippet&type=channel&maxResults=5&q=" +
                    encodeURIComponent(termo));
                buscas[termo] = {
                    escolha: 0,
                    opcoes: (r.items || []).map((it) => ({
                        id: it.id.channelId || it.snippet.channelId,
                        titulo: desentidade(it.snippet.title),
                        foto: foto(it.snippet),
                    })),
                };
                salvarLocal("feed.buscas", buscas);
                desenhar();
            }
        } catch (e) {
            avisar(e.message);
        } finally {
            buscando.delete(chave);
            desenhar();
        }
    }

    /* Um canal por id, mesmo que dois nomes da lista tenham dado no mesmo. */
    function paraInscrever() {
        const ja = seguidos();
        const vistos = new Set();
        const alvo = [];
        for (const cat of categorias()) {
            for (const termo of cat.canais) {
                const c = escolhido(termo);
                if (!c || ja.has(c.id) || pulados.has(termo) || vistos.has(c.id)) continue;
                vistos.add(c.id);
                alvo.push({ termo, canal: c });
            }
        }
        return alvo;
    }

    async function inscreverMarcados() {
        const alvo = paraInscrever();
        if (!alvo.length) return;
        const ok = await confirmar(`Inscrever você em ${alvo.length} ` +
            `${alvo.length === 1 ? "canal" : "canais"}?`);
        if (!ok) return;

        ocupado = { texto: "Inscrevendo", feito: 0, total: alvo.length };
        let feitas = 0;
        for (const { termo, canal } of alvo) {
            try {
                await api("POST", "subscriptions?part=snippet", {
                    snippet: { resourceId: { kind: "youtube#channel", channelId: canal.id } },
                });
                inscritosAgora.add(canal.id);
            } catch (e) {
                if (e.motivo === "subscriptionDuplicate") inscritosAgora.add(canal.id);
                else {
                    errosInscrever[termo] = e.message;
                    if (cotaEsgotada(e)) { avisar(e.message); break; }
                }
            }
            if (inscritosAgora.has(canal.id)) { feitas++; delete errosInscrever[termo]; }
            ocupado.feito++;
            desenhar();
        }
        ocupado = null;
        desenhar();
        avisar(`${feitas} ${feitas === 1 ? "inscrição feita" : "inscrições feitas"}.`);
    }

    function acrescentar() {
        const campo = $("#novo-canal");
        const termo = campo ? campo.value.trim() : "";
        if (!termo) return;
        const ja = categorias().some((c) => c.canais.includes(termo));
        if (!ja) {
            extras.push(termo);
            salvarLocal("feed.extras", extras);
        }
        pulados.delete(termo);
        salvarLocal("feed.pulados", [...pulados]);
        buscarTermos([termo], "extra");
    }

    /* ------------------------------------------------------------- telas */

    function htmlConta() {
        if (conta.navegador) return `<span>Versão de navegador: para entrar na conta, use o app Android.</span>`;
        if (!conta.possivel) return "";
        if (conta.conectado) {
            return `<span>Conectado${conta.conta ? " como <b>" + esc(conta.conta) + "</b>" : ""}</span>
                <button class="pequeno secundario" data-acao="sair">Sair</button>`;
        }
        return `<button class="pequeno" data-acao="entrar">Entrar com Google</button>`;
    }

    function htmlSemCliente() {
        return `<div class="cartao">
            <h2>Falta ligar o app à sua conta Google</h2>
            <p class="dim">Este APK foi montado sem o ID do cliente OAuth do Google. Sem ele o app
            não consegue entrar no YouTube. É de graça e se faz uma vez só:</p>
            <ol class="dim">
                <li>Em <a href="https://console.cloud.google.com/">console.cloud.google.com</a>, crie
                    um projeto e ative a <b>YouTube Data API v3</b>.</li>
                <li>Na tela de consentimento OAuth, tipo <b>Externo</b>, adicione seu e-mail em
                    <b>Usuários de teste</b>.</li>
                <li>Crie um <b>ID do cliente OAuth</b> do tipo <b>Android</b>, com pacote
                    <code>com.bahiense.feed</code> e SHA-1
                    <code>E4:54:28:A1:1C:36:9A:98:C0:A2:77:45:AF:DA:D3:AE:F7:37:35:25</code>.
                    Nas configurações avançadas dele, ative o <b>esquema de URI personalizado</b>.</li>
                <li>Cole o ID em <code>feed-android/gradle.properties</code>
                    (<code>youtubeClienteId=</code>) e gere o APK de novo.</li>
            </ol>
            <p class="dim">O passo a passo completo está em <code>feed-android/README.md</code>.</p>
        </div>`;
    }

    function htmlEntrar() {
        return `<div class="cartao">
            <h2>Entre com a conta do YouTube</h2>
            <p class="dim">O login abre no navegador, na página do próprio Google. O app nunca vê
            sua senha, e nada é cancelado ou inscrito sem você confirmar.</p>
            <button data-acao="entrar">Entrar com Google</button>
        </div>`;
    }

    function htmlLimpar() {
        if (!inscricoes) {
            return `<div class="cartao">
                <h2>Canais de política</h2>
                <p class="dim">O app lê os canais que você segue e marca os que parecem ser de
                política, pelo nome e pela descrição. Você revisa a lista antes de cancelar.</p>
                <button data-acao="ler" ${carregando ? "disabled" : ""}>
                    ${carregando ? "Lendo suas inscrições…" : "Ler minhas inscrições"}</button>
            </div>`;
        }
        const politicos = inscricoes.filter((i) => i.motivo);
        const lista = filtro === "politica" ? politicos : inscricoes;
        const linhas = lista.map((i) => `
            <label class="linha ${i.cancelada ? "feito" : ""}">
                <input type="checkbox" data-cancelar="${esc(i.id)}"
                    ${marcadas.has(i.id) && !i.cancelada ? "checked" : ""}
                    ${i.cancelada || ocupado ? "disabled" : ""}>
                ${imagem(i.foto)}
                <span class="txt">
                    <b>${esc(i.titulo)}</b>
                    ${i.motivo ? `<span class="etiqueta">${esc(i.motivo)}</span>` : ""}
                    ${i.cancelada ? `<span class="etiqueta ok">cancelada</span>` : ""}
                    ${i.erro ? `<span class="etiqueta erro">${esc(i.erro)}</span>` : ""}
                </span>
            </label>`).join("");
        return `
            <p class="dim">Você segue ${inscricoes.length} canais. Os marcados parecem ser de
            política (em laranja, a palavra que bateu). Desmarque os que quer manter.</p>
            <div class="filtro">
                <button class="${filtro === "politica" ? "" : "secundario"}" data-acao="filtro"
                    data-valor="politica">Parecem política (${politicos.length})</button>
                <button class="${filtro === "todas" ? "" : "secundario"}" data-acao="filtro"
                    data-valor="todas">Todas (${inscricoes.length})</button>
            </div>
            <div class="cartao">${linhas || `<p class="dim">Nenhum canal parece ser de política.
                Veja em <b>Todas</b> se quiser escolher algum.</p>`}</div>
            <button class="secundario pequeno" data-acao="ler" ${carregando || ocupado ? "disabled" : ""}>
                Ler de novo</button>`;
    }

    function htmlAdicionar() {
        const ja = seguidos();
        const cartoes = categorias().map((cat, n) => {
            const chave = "cat" + n;
            const faltam = cat.canais.filter((t) => !buscas[t]);
            const linhas = cat.canais.map((termo) => {
                const b = buscas[termo];
                if (!b) {
                    return `<div class="linha"><span class="txt"><b>${esc(termo)}</b>
                        <span class="dim">ainda não buscado</span></span></div>`;
                }
                const c = escolhido(termo);
                if (!c) {
                    return `<div class="linha"><span class="txt"><b>${esc(termo)}</b>
                        <span class="etiqueta erro">não encontrado</span></span></div>`;
                }
                const segue = ja.has(c.id);
                return `<label class="linha ${segue ? "feito" : ""}">
                    <input type="checkbox" data-inscrever="${esc(termo)}"
                        ${segue || !pulados.has(termo) ? "checked" : ""}
                        ${segue || ocupado ? "disabled" : ""}>
                    ${imagem(c.foto)}
                    <span class="txt">
                        <b>${esc(c.titulo)}</b>
                        <span class="dim">buscado: ${esc(termo)} ·
                            <a href="https://www.youtube.com/channel/${esc(c.id)}">ver canal</a></span>
                        ${segue ? `<span class="etiqueta ok">${inscritosAgora.has(c.id) ? "inscrito" : "já segue"}</span>` : ""}
                        ${errosInscrever[termo] ? `<span class="etiqueta erro">${esc(errosInscrever[termo])}</span>` : ""}
                    </span>
                    ${!segue && b.opcoes.length > 1 ? `<button class="pequeno secundario"
                        data-acao="outro" data-termo="${esc(termo)}">Não é este</button>` : ""}
                </label>`;
            }).join("");
            return `<div class="cartao">
                <h2>${esc(cat.nome)}</h2>
                ${faltam.length ? `<p><button data-acao="buscar" data-cat="${n}"
                    ${buscando.has(chave) || ocupado ? "disabled" : ""}>
                    ${buscando.has(chave) ? "Buscando…" : `Buscar ${faltam.length} ${faltam.length === 1 ? "canal" : "canais"}`}
                    </button></p>` : ""}
                ${linhas}
            </div>`;
        }).join("");

        return `
            <p class="dim">${carregando ? "Lendo suas inscrições… " : ""}Busque cada categoria,
            confira se o canal achado é o certo (o botão <b>Não é este</b> mostra o próximo
            resultado) e inscreva-se nos marcados. Cada busca gasta 100 dos 10.000 pontos de
            cota diária; a lista toda cabe em um dia, e o que já foi buscado fica guardado.</p>
            ${cartoes}
            <div class="cartao">
                <h2>Outro canal</h2>
                <div class="campo">
                    <input id="novo-canal" placeholder="Nome do canal ou artista" autocomplete="off">
                    <button data-acao="extra" ${buscando.has("extra") || ocupado ? "disabled" : ""}>Buscar</button>
                </div>
            </div>`;
    }

    function htmlDicas() {
        return `<div class="cartao">
            <h2>Para o algoritmo esquecer a política</h2>
            <ul class="dim">
                <li>Em <b>Você → Histórico</b>, apague os vídeos e as pesquisas de política.</li>
                <li>Nas recomendações, use ⋮ → <b>Não recomendar este canal</b>. É o sinal mais forte.</li>
                <li>Nos <b>Shorts</b>, faça o mesmo e passe rápido pelo que não quer: tempo assistido conta.</li>
                <li>Evite clicar "só para ver": um clique já reforça o tema por dias.</li>
            </ul>
        </div>
        <div class="cartao">
            <h2>Para reforçar o que você gosta</h2>
            <ul class="dim">
                <li>Curta os vídeos e salve em playlists (Rock, Jazz e Blues, Country, Louvor, Pregações).</li>
                <li>Assista até o fim: pesa mais que o clique.</li>
                <li>Pesquise de propósito: "pregação expositiva", "Catecismo de Heidelberg",
                    "salmos cantados", "Delta blues", "Blue Note jazz".</li>
                <li>Para música, use o <b>YouTube Music</b>: as recomendações ficam mais limpas.</li>
                <li>Leva de 1 a 2 semanas de uso consistente para o feed mudar de verdade.</li>
            </ul>
        </div>`;
    }

    function desenharBarra() {
        const barra = $("#barra");
        let html = "";
        if (ocupado) {
            html = `<span class="dim">${ocupado.texto} ${ocupado.feito} de ${ocupado.total}…</span>`;
        } else if (conta.conectado && aba === "limpar" && inscricoes) {
            const n = inscricoes.filter((i) => marcadas.has(i.id) && !i.cancelada).length;
            html = `<span class="dim">${n} ${n === 1 ? "selecionado" : "selecionados"}</span>
                <button data-acao="cancelar" ${n ? "" : "disabled"}>Cancelar inscrições</button>`;
        } else if (conta.conectado && aba === "adicionar") {
            const n = paraInscrever().length;
            html = `<span class="dim">${n} ${n === 1 ? "marcado" : "marcados"}</span>
                <button data-acao="inscrever" ${n ? "" : "disabled"}>Inscrever</button>`;
        }
        barra.innerHTML = html;
        barra.hidden = !html;
    }

    function desenhar() {
        document.querySelectorAll("#abas button").forEach((b) =>
            b.classList.toggle("ativa", b.dataset.aba === aba));
        $("#conta").innerHTML = htmlConta();

        /* O texto digitado em "Outro canal" sobrevive ao redesenho. */
        const campo = $("#novo-canal");
        const digitado = campo ? campo.value : "";

        let html;
        if (aba === "dicas") html = htmlDicas();
        else if (conta.navegador) html = htmlDicas();
        else if (!conta.possivel) html = htmlSemCliente();
        else if (!conta.conectado) html = htmlEntrar();
        else html = aba === "limpar" ? htmlLimpar() : htmlAdicionar();
        $("#tela").innerHTML = html;

        const novo = $("#novo-canal");
        if (novo) novo.value = digitado;
        desenharBarra();
    }

    /* ------------------------------------------------------------- eventos */

    const acoes = {
        entrar() {
            if (!ponte.conectar()) avisar("Não consegui abrir o navegador para o login.");
        },
        sair() {
            ponte.desconectar();
            conta = lerConta();
            inscricoes = null;
            desenhar();
        },
        ler: carregarInscricoes,
        filtro(el) { filtro = el.dataset.valor; desenhar(); },
        cancelar: cancelarMarcadas,
        buscar(el) {
            const n = Number(el.dataset.cat);
            const cat = categorias()[n];
            buscarTermos(cat.canais.filter((t) => !buscas[t]), "cat" + n);
        },
        outro(el) {
            const b = buscas[el.dataset.termo];
            b.escolha = (b.escolha + 1) % b.opcoes.length;
            salvarLocal("feed.buscas", buscas);
            desenhar();
        },
        inscrever: inscreverMarcados,
        extra: acrescentar,
    };

    document.addEventListener("click", (e) => {
        const aba_ = e.target.closest("#abas button");
        if (aba_) {
            aba = aba_.dataset.aba;
            if (aba === "adicionar" && conta.conectado && !inscricoes) carregarInscricoes();
            desenhar();
            window.scrollTo(0, 0);
            return;
        }
        const el = e.target.closest("[data-acao]");
        if (!el || el.disabled) return;
        /* Botão dentro de <label>: sem isto o toque também marcaria a caixa. */
        e.preventDefault();
        acoes[el.dataset.acao](el);
    });

    document.addEventListener("change", (e) => {
        const c = e.target;
        if (c.dataset.cancelar) {
            if (c.checked) marcadas.add(c.dataset.cancelar);
            else marcadas.delete(c.dataset.cancelar);
        } else if (c.dataset.inscrever) {
            if (c.checked) pulados.delete(c.dataset.inscrever);
            else pulados.add(c.dataset.inscrever);
            salvarLocal("feed.pulados", [...pulados]);
        } else return;
        desenharBarra();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.target.id === "novo-canal") acrescentar();
    });

    $("#aviso").addEventListener("click", () => { $("#aviso").hidden = true; });

    desenhar();
})();
