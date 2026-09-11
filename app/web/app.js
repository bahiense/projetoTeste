"use strict";

/* ------------------------------------------------------------ utilidades */

const $ = (seletor) => document.querySelector(seletor);

function esc(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

async function pedir(rota, dados) {
  const opcoes = dados
    ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados) }
    : {};
  const resposta = await fetch(rota, opcoes);
  const corpo = await resposta.json();
  if (resposta.status === 401 && !rota.startsWith("/api/sessao") && !rota.startsWith("/api/senha")) {
    telaDeEntrada(corpo.tem_senha !== false);   // a sessão caiu: peça a senha de novo
    throw new Error("Entre com a sua senha para continuar");
  }
  if (!resposta.ok) throw new Error(corpo.erro || "Falha na operação");
  return corpo;
}

/* ------------------------------------------------------------ acesso */

/** Tela única de entrada: pede a senha, ou cria a primeira se ainda não houver. */
function telaDeEntrada(temSenha) {
  document.querySelector("header").hidden = true;
  document.querySelector("main").innerHTML = `
    <div class="cartao" style="max-width:420px;margin:40px auto">
      <h2>${temSenha ? "Entrar" : "Crie a sua senha"}</h2>
      <p class="legenda">${temSenha
        ? "Este é o seu ciclo de estudos. Digite a senha para continuar."
        : "Este endereço está na internet, então precisa de senha antes de guardar qualquer coisa. Use pelo menos 6 caracteres."}</p>
      <div style="margin-bottom:12px">
        <label for="senha">Senha</label>
        <input id="senha" type="password" autocomplete="${temSenha ? "current-password" : "new-password"}">
      </div>
      ${temSenha ? "" : `<div style="margin-bottom:12px">
        <label for="senha2">Repita a senha</label>
        <input id="senha2" type="password" autocomplete="new-password"></div>`}
      <div class="botoes">
        <button class="acao" id="btn-entrar">${temSenha ? "Entrar" : "Criar senha e entrar"}</button>
      </div>
    </div>`;
  const campo = $("#senha");
  campo.focus();
  const enviar = async () => {
    try {
      if (temSenha) {
        await pedir("/api/sessao/entrar", { senha: campo.value });
      } else {
        if (campo.value !== $("#senha2").value) return recado("As duas senhas não são iguais.");
        await pedir("/api/senha/definir", { senha: campo.value });
      }
      location.reload();
    } catch (erro) {
      recado(erro.message);
    }
  };
  $("#btn-entrar").addEventListener("click", enviar);
  document.querySelectorAll("#senha, #senha2").forEach((c) =>
    c.addEventListener("keydown", (e) => { if (e.key === "Enter") enviar(); }));
}

let temporizadorRecado;
function recado(texto) {
  let caixa = $("#recado");
  if (!caixa) {
    caixa = document.createElement("div");
    caixa.id = "recado";
    document.body.appendChild(caixa);
  }
  caixa.textContent = texto;
  clearTimeout(temporizadorRecado);
  temporizadorRecado = setTimeout(() => caixa.remove(), 2600);
}

function pct(valor) {
  return valor === null || valor === undefined ? "—" : `${valor}%`;
}

function classePorMeta(valor, meta) {
  if (valor === null || valor === undefined) return "neutro";
  return valor >= meta ? "ok" : "erro";
}

const NOMES_SITUACAO = {
  nao_iniciada: "Não iniciada",
  consolidada: "Consolidada",
  lendo: "Em leitura",
  aguardando_revisao: "Aguardando revisão",
  aguardando_exercicios: "Aguardando exercícios",
  abaixo_da_meta: "Abaixo da meta",
  sem_paginas: "Sem páginas cadastradas",
};

const MOTIVOS = {
  nao_sabia: "Não sabia o conteúdo",
  desatencao: "Desatenção",
  interpretacao: "Interpretação do enunciado",
  pegadinha: "Pegadinha da banca",
  decoreba: "Faltou decorar (lei seca)",
};

/* ------------------------------------------------------------ estado */

const app = { estado: null, panorama: null, meta: 80, aba: "hoje", sessao: { tem_senha: false } };

async function recarregar() {
  app.estado = await pedir("/api/estado");
  app.meta = Number(app.estado.config.meta_acerto || 80);
  app.panorama = await pedir("/api/panorama");
  desenhar();
}

function desenhar() {
  if (!app.estado) return;   // a carga falhou: a mensagem de erro ja esta na tela
  desenharHoje();
  if (app.aba === "ciclo") desenharCiclo();
  if (app.aba === "materias") desenharMaterias();
  if (app.aba === "desempenho") desenharDesempenho();
  if (app.aba === "config") desenharConfig();
}

/* ------------------------------------------------------------ aba: hoje */

function desenharHoje() {
  const hoje = app.estado.hoje;
  const projecao = app.estado.projecao;
  $("#indicadores-hoje").innerHTML = `
    <div class="indicador"><div class="rotulo">Sessões hoje</div><div class="valor">${hoje.sessoes}</div></div>
    <div class="indicador"><div class="rotulo">Questões hoje</div><div class="valor">${hoje.questoes}</div>
      <div class="rotulo">${hoje.questoes ? `${hoje.acertos} acertos — ${pct(hoje.percentual)}` : "nenhuma ainda"}</div></div>
    <div class="indicador"><div class="rotulo">Tarefas restantes</div><div class="valor">${projecao.tarefas_pendentes}</div></div>
    <div class="indicador"><div class="rotulo">Término previsto</div>
      <div class="valor" style="font-size:19px">${projecao.termino_previsto ? dataBr(projecao.termino_previsto) : "—"}</div>
      <div class="rotulo">${projecao.sessoes_por_dia ? `${projecao.sessoes_por_dia} sessões/dia` : "sem histórico"}</div></div>`;

  $("#aviso-sem-paginas").innerHTML = avisoSemPaginas();
  const vencidas = app.estado.revisoes_vencidas;
  $("#revisoes-vencidas").innerHTML = !vencidas.length ? "" : `
    <div class="cartao" style="border-color:var(--alerta)">
      <h3>Revisões espaçadas vencidas (${vencidas.length})</h3>
      <p class="legenda" style="margin-bottom:10px">Conteúdo já consolidado que está na hora de reencontrar. Faça antes da fila normal.</p>
      <ul class="fila">${vencidas.map((r) => `
        <li><span class="selo alerta">${r.intervalo_dias}d</span>
          <span class="nome">${esc(r.materia)}</span>
          <span class="tarefa-aula">Aula ${r.numero} ${esc(r.titulo)}</span>
          <span class="detalhe">
            <button class="acao fantasma" data-revisao-feita="${r.id}">Feita</button>
            <button class="acao fantasma" data-revisao-adiar="${r.id}">Adiar 2d</button>
          </span></li>`).join("")}
      </ul></div>`;

  const tarefa = app.estado.tarefa_atual;
  if (!tarefa) {
    $("#tarefa-atual").innerHTML = `<div class="cartao"><div class="vazio">
      Nenhuma tarefa pendente. Cadastre matérias e aulas na aba <b>Matérias</b> para o ciclo começar.
    </div></div>`;
    $("#lista-fila").innerHTML = "";
    return;
  }
  $("#tarefa-atual").innerHTML = tarefa.tipo === "sessao" ? cartaoLeitura(tarefa) : cartaoExercicios(tarefa);
  if (tarefa.tipo === "bateria") $("#lista-erros").appendChild(linhaErro());
  $("#lista-fila").innerHTML = app.estado.fila.length
    ? app.estado.fila.map((t, i) => `
      <li><span class="ordem">${i + 2}</span>
        <span class="nome">${esc(t.materia)}</span>
        <span class="tarefa-aula">Aula ${t.aula_numero} · bloco ${t.bloco}</span>
        <span class="detalhe">${esc(t.rotulo)}</span></li>`).join("")
    : `<li class="vazio">Fila vazia.</li>`;
}

/** Aula sem total de paginas nao entra no rodizio - diga isso, em vez de
    deixar o ciclo parecer menor do que e. */
function avisoSemPaginas() {
  const faltando = (app.panorama || []).filter((m) => (m.sem_paginas || []).length);
  if (!faltando.length) return "";
  const total = faltando.reduce((s, m) => s + m.sem_paginas.length, 0);
  return `<div class="aviso"><b>${total} ${total === 1 ? "aula está" : "aulas estão"} fora do ciclo</b>
    por não ter o total de páginas preenchido:
    ${faltando.map((m) => esc(m.nome) + " (" + m.sem_paginas.length + ")").join(" · ")}.
    Preencha na aba Matérias conforme for baixando os PDFs.</div>`;
}

function seloDaFase(tarefa) {
  if (tarefa.tipo === "bateria") return `<span class="selo alerta">Exercícios</span>`;
  const mapa = { leitura: ["", "Leitura"], revisao: ["ok", "Revisão"], reforco: ["erro", "Reforço"] };
  const [classe, nome] = mapa[tarefa.fase];
  return `<span class="selo ${classe}">${nome}</span>`;
}

function cabecalhoTarefa(t) {
  return `<div class="tarefa-topo">
      ${seloDaFase(t)}
      <span class="tarefa-materia">${esc(t.materia)}</span>
      <span class="tarefa-aula">Aula ${t.aula_numero}${t.aula_titulo ? " — " + esc(t.aula_titulo) : ""} · bloco ${t.bloco}</span>
      ${t.link ? `<a href="${esc(t.link)}" target="_blank" rel="noopener" style="margin-left:auto">abrir material</a>` : ""}
    </div>`;
}

function cartaoLeitura(t) {
  return `<div class="cartao">
    ${cabecalhoTarefa(t)}
    <div class="destaque">Páginas ${t.pag_inicio} a ${t.pag_fim}
      <small>${t.paginas} páginas · parte ${t.parte}</small></div>
    <div class="linha" style="margin-top:16px">
      <div class="estreito"><label>Minutos</label><input id="sessao-minutos" type="number" min="0" placeholder="0"></div>
      <div><label>Pontos-chave (o que você lembra sem olhar o PDF)</label>
        <textarea id="sessao-pontos" placeholder="Escreva de memória 2 ou 3 ideias centrais desta leitura."></textarea></div>
    </div>
    <div class="linha" style="margin-top:12px">
      <div><label>Onde parei / observação da aula</label>
        <input id="sessao-obs" value="${esc(t.observacao)}" placeholder="ex.: parei no item 3.2, pág. 27"></div>
    </div>
    <div class="botoes">
      <button class="acao" id="btn-concluir-sessao">Concluir esta sessão</button>
      <span class="legenda" style="margin:0">Ao concluir, o rodízio passa para a próxima matéria.</span>
    </div>
  </div>`;
}

function cartaoExercicios(t) {
  return `<div class="cartao">
    ${cabecalhoTarefa(t)}
    <div class="destaque">${t.questoes} questões <small>${t.momento === "fixacao" ? "fixação logo após a leitura" : "bateria da " + t.momento}</small></div>
    <div class="linha" style="margin-top:16px">
      <div class="estreito"><label>Questões</label><input id="bat-questoes" type="number" min="1" value="${t.questoes}"></div>
      <div class="estreito"><label>Acertos</label><input id="bat-acertos" type="number" min="0" value=""></div>
      <div class="estreito"><label>Minutos</label><input id="bat-minutos" type="number" min="0" placeholder="0"></div>
      <div><label>Observação</label><input id="bat-obs" placeholder="banca, caderno usado..."></div>
    </div>
    <div style="margin-top:16px">
      <label>Erros — anote o assunto de cada questão que você errou</label>
      <div id="lista-erros"></div>
      <button class="acao fantasma" id="btn-add-erro" style="padding:6px 12px;font-size:13px">+ adicionar erro</button>
    </div>
    <div class="botoes">
      <button class="acao" id="btn-registrar-bateria">Registrar resultado</button>
    </div>
  </div>`;
}

function linhaErro() {
  const div = document.createElement("div");
  div.className = "erro-item";
  div.innerHTML = `<input placeholder="assunto da questão errada" data-campo="assunto">
    <select data-campo="motivo">${Object.entries(MOTIVOS)
      .map(([v, n]) => `<option value="${v}">${n}</option>`).join("")}</select>
    <button class="acao fantasma" data-remover-erro style="padding:6px 10px">×</button>`;
  return div;
}

/* ------------------------------------------------------------ aba: ciclo */

function desenharCiclo() {
  if (!app.panorama.length) {
    $("#painel-ciclo").innerHTML = `<div class="cartao"><div class="vazio">Nenhuma matéria cadastrada ainda.</div></div>`;
    return;
  }
  const legenda = `<div class="cartao" style="padding:12px 16px">
    <div class="aulas-mini" style="align-items:center">
      <span style="font-size:13px;color:var(--suave);margin-right:4px">Legenda:</span>
      <span class="aula-mini nao_iniciada">não iniciada</span>
      <span class="aula-mini lendo">em leitura</span>
      <span class="aula-mini aguardando_revisao">aguardando revisão</span>
      <span class="aula-mini abaixo_da_meta">abaixo da meta</span>
      <span class="aula-mini consolidada">consolidada</span>
    </div></div>`;
  $("#painel-ciclo").innerHTML = legenda + app.panorama.map((m) => `
    <div class="cartao">
      <div class="tarefa-topo">
        <span class="tarefa-materia">${esc(m.nome)}</span>
        <span class="selo neutro">peso ${m.peso}</span>
        <span class="selo">sarrafo ${m.sarrafo}%</span>
        ${m.ativa ? "" : `<span class="selo alerta">pausada</span>`}
        <span class="detalhe" style="margin-left:auto;color:var(--suave);font-size:13px">
          ${m.total_aulas} aulas · ${m.total_paginas} páginas · aproveitamento ${pct(m.percentual)}</span>
      </div>
      ${m.blocos.map((b) => `
        <div class="bloco ${b.consolidado ? "aprovado" : b.abaixo_da_meta ? "reprovado" : ""}">
          <div class="bloco-topo">
            <b>Bloco ${b.numero}</b>
            ${b.consolidado ? `<span class="selo ok">consolidado</span>`
              : b.abaixo_da_meta ? `<span class="selo erro">abaixo da meta</span>` : ""}
            <span class="detalhe">${pct(b.percentual)} na última medição · ${b.questoes_acumuladas} questões no total</span>
          </div>
          <div class="aulas-mini">${b.aulas.map((a) => `
            <span class="aula-mini ${a.situacao}" title="${NOMES_SITUACAO[a.situacao]} · leitura ${a.sessoes_leitura_feitas}/${a.sessoes_leitura} · revisão ${a.sessoes_revisao_feitas}/${a.sessoes_revisao} · acumulado ${pct(a.percentual)} em ${a.questoes} questões · rodada ${a.rodada}">
              Aula ${a.numero}${a.percentual_rodada !== null ? ` · ${a.percentual_rodada}%` : ""}</span>`).join("")}
          </div>
        </div>`).join("") || `<div class="vazio">Sem aulas cadastradas.</div>`}
    </div>`).join("");
}

/* ------------------------------------------------------------ aba: matérias */

function desenharMaterias() {
  $("#painel-materias").innerHTML = app.panorama.map((m) => `
    <div class="cartao" data-materia="${m.id}">
      <div class="linha">
        <div><label>Matéria</label><input value="${esc(m.nome)}" data-campo="nome"></div>
        <div class="estreito"><label>Peso</label><input type="number" min="1" max="5" value="${m.peso}" data-campo="peso"></div>
        <div class="estreito"><label>Sarrafo %</label><input type="number" min="1" max="100" value="${m.meta ?? ""}" placeholder="${app.meta}" data-campo="meta"></div>
        <div class="estreito"><label>Ordem</label><input type="number" value="${m.ordem}" data-campo="ordem"></div>
        <div class="estreito"><label>Blocos</label><input type="number" min="1" value="${m.qtd_blocos ?? ""}" placeholder="auto" data-campo="qtd_blocos"></div>
        <div class="estreito"><label>Ativa</label>
          <select data-campo="ativa"><option value="1" ${m.ativa ? "selected" : ""}>Sim</option>
          <option value="0" ${m.ativa ? "" : "selected"}>Não</option></select></div>
        <div style="flex:0 0 auto"><button class="acao" data-salvar-materia="${m.id}">Salvar</button></div>
        <div style="flex:0 0 auto"><button class="acao fantasma" data-excluir-materia="${m.id}">Excluir</button></div>
      </div>
      <div class="tabela-rolagem" style="margin-top:14px">
        <table>
          <thead><tr><th class="num">Aula</th><th>Título</th><th class="num">Páginas (T)</th>
            <th class="num">Sessões</th><th>Link do PDF</th><th>Link dos exercícios</th><th></th></tr></thead>
          <tbody>${m.blocos.flatMap((b) => b.aulas).map((a) => `
            <tr data-aula="${a.id}">
              <td class="num"><input type="number" value="${a.numero}" data-campo="numero" style="width:64px"></td>
              <td><input value="${esc(a.titulo)}" data-campo="titulo" placeholder="assunto"></td>
              <td class="num"><input type="number" min="0" value="${a.total_paginas}" data-campo="total_paginas" style="width:78px"></td>
              <td class="num" style="color:var(--suave)">${a.sessoes_leitura}× ${a.paginas_por_dia}p</td>
              <td><input value="${esc(a.link_pdf)}" data-campo="link_pdf" placeholder="https://"></td>
              <td><input value="${esc(a.link_exercicios)}" data-campo="link_exercicios" placeholder="https://"></td>
              <td><button class="acao fantasma" data-salvar-aula="${a.id}" style="padding:6px 10px">✓</button></td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div class="linha" style="margin-top:12px">
        <div class="estreito"><label>Criar</label><input type="number" min="1" value="10" data-campo="lote_qtd"></div>
        <div class="estreito"><label>A partir da aula</label><input type="number" min="0" value="${m.total_aulas + 1}" data-campo="lote_inicio"></div>
        <div style="flex:0 0 auto"><button class="acao fantasma" data-lote="${m.id}">Adicionar aulas em lote</button></div>
      </div>
    </div>`).join("") || `<div class="cartao"><div class="vazio">Cadastre a primeira matéria acima.</div></div>`;
}

/* ------------------------------------------------------------ aba: desempenho */

function desenharDesempenho() {
  const meta = app.meta;
  const fracos = [];
  app.panorama.forEach((m) => m.blocos.forEach((b) => {
    if (b.abaixo_da_meta) fracos.push(`${m.nome} — bloco ${b.numero} (${b.percentual}%)`);
  }));
  $("#painel-desempenho").innerHTML = `
    ${fracos.length ? `<div class="aviso"><b>Blocos abaixo de ${meta}%:</b> ${fracos.map(esc).join(" · ")}</div>` : ""}
    ${app.panorama.map((m) => `
      <div class="cartao">
        <div class="tarefa-topo">
          <span class="tarefa-materia">${esc(m.nome)}</span>
          <span class="selo ${classePorMeta(m.percentual, meta)}">${pct(m.percentual)}</span>
          <span class="detalhe" style="margin-left:auto;color:var(--suave);font-size:13px">${m.acertos}/${m.questoes} questões</span>
        </div>
        <div class="tabela-rolagem"><table>
          <thead><tr><th>Bloco</th><th>Aula</th><th>Situação</th><th class="num">Leitura</th>
            <th class="num">Revisão</th><th class="num">Rodada</th><th class="num">Última medição</th>
            <th class="num">Questões</th><th class="num">Acertos</th><th class="num">Acumulado</th></tr></thead>
          <tbody>${m.blocos.flatMap((b) => b.aulas.map((a) => `
            <tr>
              <td>${b.numero}</td>
              <td>Aula ${a.numero} ${esc(a.titulo)}</td>
              <td><span class="selo ${a.situacao === "consolidada" ? "ok" : a.situacao === "abaixo_da_meta" ? "erro" : "neutro"}">${NOMES_SITUACAO[a.situacao]}</span></td>
              <td class="num">${a.sessoes_leitura_feitas}/${a.sessoes_leitura}</td>
              <td class="num">${a.sessoes_revisao_feitas}/${a.sessoes_revisao}</td>
              <td class="num">${a.rodada}</td>
              <td class="num"><b class="${classePorMeta(a.percentual_rodada, meta) === "erro" ? "" : ""}">${pct(a.percentual_rodada)}</b></td>
              <td class="num">${a.questoes}</td>
              <td class="num">${a.acertos}</td>
              <td class="num">${pct(a.percentual)}</td>
            </tr>`)).join("")}
          </tbody></table></div>
      </div>`).join("") || `<div class="cartao"><div class="vazio">Sem dados ainda.</div></div>`}`;
}

/* ------------------------------------------------------------ aba: erros */

async function desenharErros() {
  const dados = await pedir("/api/erros");
  $("#painel-erros").innerHTML = `
    <div class="cartao">
      <h3>Assuntos que mais derrubam</h3>
      ${dados.ranking.length ? `<ul class="fila">${dados.ranking.slice(0, 15).map((r, i) => `
        <li><span class="ordem">${i + 1}</span>
          <span class="nome">${esc(r.assunto)}</span>
          <span class="tarefa-aula">${esc(r.materia)}</span>
          <span class="detalhe">${r.vezes}× · ${r.abertos} em aberto</span></li>`).join("")}</ul>`
        : `<div class="vazio">Nenhum erro registrado ainda.</div>`}
    </div>
    ${dados.itens.length ? `<div class="cartao"><h3>Todos os erros</h3>
      <div class="tabela-rolagem"><table>
        <thead><tr><th>Data</th><th>Matéria</th><th>Aula</th><th>Assunto</th><th>Motivo</th><th></th></tr></thead>
        <tbody>${dados.itens.map((e) => `
          <tr style="${e.resolvido ? "opacity:.45" : ""}">
            <td>${dataBr(e.data)}</td><td>${esc(e.materia)}</td><td>${e.aula_numero}</td>
            <td>${esc(e.assunto)}</td><td>${MOTIVOS[e.motivo] || e.motivo}</td>
            <td><button class="acao fantasma" data-erro="${e.id}" style="padding:5px 10px;font-size:13px">
              ${e.resolvido ? "reabrir" : "resolvido"}</button></td>
          </tr>`).join("")}</tbody></table></div></div>` : ""}`;
}

/* ------------------------------------------------------------ aba: determinações */

async function desenharDeterminacoes() {
  const itens = await pedir("/api/determinacoes");
  $("#painel-determinacoes").innerHTML = `<div class="cartao">
    ${itens.map((d) => `<div style="margin-bottom:16px" data-determinacao="${d.id}">
      <label>${esc(d.pergunta)}</label>
      <textarea data-campo="resposta" style="min-height:90px">${esc(d.resposta)}</textarea>
    </div>`).join("")}
    <div class="botoes"><button class="acao" id="btn-salvar-determinacoes">Salvar</button></div>
  </div>`;
}

/* ------------------------------------------------------------ aba: ajustes */

const CAMPOS_CONFIG = [
  ["paginas_min_dia", "Mínimo de páginas por sessão", "number"],
  ["paginas_max_dia", "Máximo de páginas por sessão", "number"],
  ["fator_revisao", "Aceleração da revisão (2 = o dobro de páginas)", "number"],
  ["questoes_por_bateria", "Questões por bateria de revisão", "number"],
  ["questoes_fixacao", "Questões de fixação após a leitura", "number"],
  ["exercicios_fixacao", "Fazer fixação após ler cada aula (1 = sim, 0 = não)", "number"],
  ["meta_acerto", "Meta de acerto (%)", "number"],
  ["minimo_questoes_avaliacao", "Mínimo de questões para julgar uma aula", "number"],
  ["max_rodadas_reforco", "Máximo de rodadas de reforço por bloco", "number"],
  ["tamanho_bloco_alvo", "Tamanho alvo do bloco (aulas)", "number"],
  ["intervalos_revisao_espacada", "Revisões espaçadas (dias, separados por vírgula)", "text"],
];

function desenharConfig() {
  const cfg = app.estado.config;
  $("#painel-config").innerHTML = `<div class="cartao">
    ${CAMPOS_CONFIG.map(([chave, rotulo, tipo]) => `
      <div style="margin-bottom:12px"><label>${rotulo}</label>
        <input type="${tipo}" step="any" value="${esc(cfg[chave])}" data-config="${chave}"></div>`).join("")}
    <div class="botoes">
      <button class="acao" id="btn-salvar-config">Salvar ajustes</button>
      <button class="acao fantasma" id="btn-exportar">Baixar backup</button>
      <label class="acao fantasma" style="cursor:pointer;margin:0;font-weight:600;color:var(--suave)">
        Restaurar backup<input type="file" id="arquivo-backup" accept=".json" hidden></label>
    </div>
    <p class="legenda" style="margin:14px 0 0">Seus dados ficam em um arquivo no seu computador.
      Faça o backup de vez em quando.</p>
  </div>
  <div class="cartao">
    <h3>Senha</h3>
    <p class="legenda">${app.sessao.tem_senha
      ? "Trocar a senha desconecta os outros aparelhos."
      : "Sem senha: só dá para abrir neste computador. Publicando na internet, ela vira obrigatória."}</p>
    <div class="linha">
      ${app.sessao.tem_senha ? `<div><label>Senha atual</label>
        <input id="cfg-senha-atual" type="password" autocomplete="current-password"></div>` : ""}
      <div><label>Nova senha</label>
        <input id="cfg-senha-nova" type="password" autocomplete="new-password"></div>
      <div style="flex:0 0 auto"><label>&nbsp;</label>
        <button class="acao" id="btn-senha">${app.sessao.tem_senha ? "Trocar senha" : "Criar senha"}</button></div>
      ${app.sessao.tem_senha ? `<div style="flex:0 0 auto"><label>&nbsp;</label>
        <button class="acao fantasma" id="btn-sair">Sair</button></div>` : ""}
    </div>
  </div>`;
}

/* ------------------------------------------------------------ ações */

function dataBr(iso) {
  if (!iso) return "—";
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

async function concluirSessao() {
  const t = app.estado.tarefa_atual;
  await pedir("/api/sessoes/concluir", {
    aula_id: t.aula_id, fase: t.fase, rodada: t.rodada, indice: t.indice,
    pag_inicio: t.pag_inicio, pag_fim: t.pag_fim,
    minutos: $("#sessao-minutos").value || 0,
    pontos_chave: $("#sessao-pontos").value,
    observacao: $("#sessao-obs").value,
  });
  recado("Sessão concluída. Próxima matéria do rodízio.");
  await recarregar();
}

async function registrarBateria() {
  const t = app.estado.tarefa_atual;
  const acertos = $("#bat-acertos").value;
  if (acertos === "") return recado("Informe quantas questões você acertou.");
  const erros = [...document.querySelectorAll("#lista-erros .erro-item")].map((linha) => ({
    assunto: linha.querySelector('[data-campo="assunto"]').value,
    motivo: linha.querySelector('[data-campo="motivo"]').value,
  })).filter((e) => e.assunto.trim());
  await pedir("/api/baterias", {
    aula_id: t.aula_id, momento: t.momento, rodada: t.rodada,
    questoes: $("#bat-questoes").value, acertos,
    minutos: $("#bat-minutos").value || 0, observacao: $("#bat-obs").value, erros,
  });
  recado("Resultado registrado.");
  await recarregar();
}

function valoresDoBloco(elemento) {
  const dados = {};
  elemento.querySelectorAll("[data-campo]").forEach((campo) => {
    dados[campo.dataset.campo] = campo.value;
  });
  return dados;
}

async function tratarClique(evento) {
  const alvo = evento.target.closest("button, label");
  if (!alvo) return;
  const d = alvo.dataset;
  try {
    if (alvo.id === "btn-concluir-sessao") return await concluirSessao();
    if (alvo.id === "btn-registrar-bateria") return await registrarBateria();
    if (alvo.id === "btn-add-erro") return $("#lista-erros").appendChild(linhaErro());
    if (d.removerErro !== undefined) return alvo.closest(".erro-item").remove();

    if (d.revisaoFeita) {
      await pedir("/api/revisoes/concluir", { id: d.revisaoFeita });
      recado("Revisão marcada como feita.");
      return await recarregar();
    }
    if (d.revisaoAdiar) {
      await pedir("/api/revisoes/adiar", { id: d.revisaoAdiar, dias: 2 });
      return await recarregar();
    }
    if (alvo.id === "btn-nova-materia") {
      const nome = $("#mat-nome").value.trim();
      if (!nome) return recado("Dê um nome à matéria.");
      await pedir("/api/materias", {
        nome, peso: $("#mat-peso").value, ordem: $("#mat-ordem").value,
        qtd_blocos: $("#mat-blocos").value || null,
      });
      $("#mat-nome").value = "";
      recado("Matéria criada.");
      return await recarregar();
    }
    if (d.salvarMateria) {
      const cartao = alvo.closest("[data-materia]");
      const v = valoresDoBloco(cartao);
      await pedir("/api/materias", {
        id: d.salvarMateria, nome: v.nome, peso: v.peso, ordem: v.ordem,
        qtd_blocos: v.qtd_blocos || null, meta: v.meta || null, ativa: v.ativa === "1",
      });
      recado("Matéria salva.");
      return await recarregar();
    }
    if (d.excluirMateria) {
      if (!confirm("Excluir a matéria e todo o histórico dela?")) return;
      await pedir("/api/excluir", { tabela: "materia", id: d.excluirMateria });
      return await recarregar();
    }
    if (d.salvarAula) {
      const linha = alvo.closest("[data-aula]");
      const v = valoresDoBloco(linha);
      await pedir("/api/aulas", { id: d.salvarAula, materia_id: 0, ...v });
      recado("Aula salva.");
      return await recarregar();
    }
    if (d.lote) {
      const cartao = alvo.closest("[data-materia]");
      const v = valoresDoBloco(cartao);
      await pedir("/api/aulas/lote", {
        materia_id: d.lote, quantidade: v.lote_qtd, inicio: v.lote_inicio,
      });
      recado("Aulas criadas. Agora preencha o total de páginas de cada uma.");
      return await recarregar();
    }
    if (d.erro) {
      await pedir("/api/erros/alternar", { id: d.erro });
      return await desenharErros();
    }
    if (alvo.id === "btn-salvar-determinacoes") {
      const itens = [...document.querySelectorAll("[data-determinacao]")].map((bloco) => ({
        id: bloco.dataset.determinacao,
        pergunta: bloco.querySelector("label").textContent,
        resposta: bloco.querySelector("textarea").value,
      }));
      await pedir("/api/determinacoes", { itens });
      return recado("Salvo.");
    }
    if (alvo.id === "btn-salvar-config") {
      const dados = {};
      document.querySelectorAll("[data-config]").forEach((c) => { dados[c.dataset.config] = c.value; });
      await pedir("/api/config", dados);
      recado("Ajustes salvos.");
      return await recarregar();
    }
    if (alvo.id === "btn-senha") {
      const nova = $("#cfg-senha-nova").value;
      const atual = $("#cfg-senha-atual") ? $("#cfg-senha-atual").value : "";
      await pedir("/api/senha/definir", { senha: nova, senha_atual: atual });
      recado("Senha salva.");
      app.sessao.tem_senha = true;
      return desenharConfig();
    }
    if (alvo.id === "btn-sair") {
      await pedir("/api/sessao/sair", {});
      return location.reload();
    }
    if (alvo.id === "btn-exportar") {
      const dump = await pedir("/api/exportar");
      const url = URL.createObjectURL(new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `ciclo-concursos-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }
  } catch (erro) {
    recado(erro.message);
  }
}

async function trocarAba(nome) {
  app.aba = nome;
  document.querySelectorAll("#menu button").forEach((b) => b.classList.toggle("ativo", b.dataset.aba === nome));
  document.querySelectorAll("main section").forEach((s) => { s.hidden = s.id !== `aba-${nome}`; });
  if (nome === "erros") await desenharErros();
  else if (nome === "determinacoes") await desenharDeterminacoes();
  else desenhar();
}

/* ------------------------------------------------------------ início */

document.addEventListener("click", tratarClique);
$("#menu").addEventListener("click", (e) => {
  if (e.target.dataset.aba) trocarAba(e.target.dataset.aba);
});
document.addEventListener("change", async (e) => {
  if (e.target.id !== "arquivo-backup") return;
  const arquivo = e.target.files[0];
  if (!arquivo) return;
  if (!confirm("Restaurar o backup apaga os dados atuais. Continuar?")) return;
  try {
    await pedir("/api/importar", JSON.parse(await arquivo.text()));
    recado("Backup restaurado.");
    await recarregar();
  } catch (erro) {
    recado(erro.message);
  }
});

(async () => {
  app.sessao = await pedir("/api/sessao");
  if (!app.sessao.autenticado) return telaDeEntrada(app.sessao.tem_senha);
  await iniciar();
})().catch((erro) => recado(erro.message));

function iniciar() {
  return recarregar().catch((erro) => {
  recado(erro.message);
    $("#tarefa-atual").innerHTML = `<div class="cartao"><div class="vazio">
      Não consegui carregar seus dados: ${esc(erro.message)}.<br>
      Feche a janela preta do servidor e abra o <b>iniciar.bat</b> de novo.</div></div>`;
  });
}
