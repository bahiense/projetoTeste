"""Motor do ciclo de estudos.

O plano de estudo e deterministico: dado o cadastro (materias, aulas, total de
paginas) e a configuracao, sabemos exatamente qual e a proxima tarefa e quais
virao depois. O banco guarda apenas o que ja foi CONCLUIDO; tudo o que ainda
esta pendente e recalculado na hora.

Fluxo de um bloco (grupo de 3 a 5 aulas da mesma materia):

    LEITURA   aula a aula, quebrada em sessoes de 10 a 20 paginas
              (+ bateria curta de fixacao ao terminar cada aula)
    REVISAO   volta a primeira aula do bloco, releitura em ritmo acelerado
              (+ bateria de exercicios ao terminar cada aula)
    REFORCO   repete revisao + exercicios apenas nas aulas abaixo da meta,
              ate atingir a meta ou esgotar as rodadas
    -> proximo bloco

Entre matérias o rodizio e ponderado pelo peso: materias mais importantes
aparecem mais vezes, sem nunca cair duas seguidas na mesma materia.
"""
import datetime
import math

from . import db

FASES = ("leitura", "revisao", "reforco")


# ---------------------------------------------------------------- divisao

def dividir_paginas(total, min_dia, max_dia):
    """Divide um PDF em sessoes respeitando o teto de paginas por dia.

    Usa o menor numero de dias que mantenha cada sessao <= max_dia, e depois
    distribui as paginas o mais uniformemente possivel entre esses dias. O piso
    (min_dia) so e violado quando o PDF inteiro e menor que ele.
    """
    total = max(0, int(total))
    if total == 0:
        return []
    max_dia = max(1, int(max_dia))
    min_dia = max(1, min(int(min_dia), max_dia))
    dias = max(1, math.ceil(total / max_dia))
    while dias > 1 and total / dias < min_dia:
        dias -= 1
    base, resto = divmod(total, dias)
    fatias = []
    pagina = 1
    for i in range(dias):
        tamanho = base + (1 if i < resto else 0)
        fatias.append((pagina, pagina + tamanho - 1))
        pagina += tamanho
    return fatias


def dividir_por_fase(total, cfg, fase):
    """Leitura usa o ritmo normal; revisao e reforco usam o ritmo acelerado."""
    minimo = db.num(cfg, "paginas_min_dia")
    maximo = db.num(cfg, "paginas_max_dia")
    if fase != "leitura":
        fator = db.num(cfg, "fator_revisao", float)
        minimo = max(1, int(round(minimo * fator)))
        maximo = max(minimo, int(round(maximo * fator)))
    return dividir_paginas(total, minimo, maximo)


def montar_blocos(numeros, qtd_blocos=None, alvo=4):
    """Agrupa as aulas em blocos de tamanho parecido (3 a 5 aulas)."""
    numeros = list(numeros)
    n = len(numeros)
    if n == 0:
        return []
    if qtd_blocos:
        k = max(1, min(int(qtd_blocos), n))
    else:
        k = max(1, round(n / max(1, alvo)))
        while k > 1 and n / k < 3:
            k -= 1
        while n / k > 5:
            k += 1
    base, resto = divmod(n, k)
    blocos = []
    i = 0
    for j in range(k):
        tamanho = base + (1 if j < resto else 0)
        blocos.append(numeros[i:i + tamanho])
        i += tamanho
    return [b for b in blocos if b]


# ---------------------------------------------------------------- leitura do estado

def _carregar_materia(con, materia_id, cfg):
    aulas = con.execute(
        "SELECT * FROM aula WHERE materia_id = ? ORDER BY numero", (materia_id,)
    ).fetchall()
    aulas = [dict(a) for a in aulas]
    ids = [a["id"] for a in aulas]
    concluidas = {}
    baterias = {}
    if ids:
        marcas = ",".join("?" * len(ids))
        for linha in con.execute(
            f"SELECT aula_id, fase, rodada, indice FROM sessao "
            f"WHERE aula_id IN ({marcas}) AND concluida_em IS NOT NULL", ids
        ):
            concluidas.setdefault(linha["aula_id"], set()).add(
                (linha["fase"], linha["rodada"], linha["indice"])
            )
        for linha in con.execute(
            f"SELECT aula_id, momento, rodada, questoes, acertos FROM bateria "
            f"WHERE aula_id IN ({marcas}) ORDER BY id", ids
        ):
            baterias.setdefault(linha["aula_id"], []).append(dict(linha))
    for a in aulas:
        a["concluidas"] = concluidas.get(a["id"], set())
        a["baterias"] = baterias.get(a["id"], [])
    return aulas


def aproveitamento(baterias, momento=None, rodada=None):
    """Soma questoes e acertos, opcionalmente filtrando por momento/rodada."""
    q = a = 0
    for b in baterias:
        if momento and b["momento"] != momento:
            continue
        if rodada is not None and b["rodada"] != rodada:
            continue
        q += b["questoes"]
        a += b["acertos"]
    return q, a


def percentual(questoes, acertos):
    return round(100.0 * acertos / questoes, 1) if questoes else None


def ultima_avaliacao(aula):
    """Rodada mais recente em que a aula foi medida por exercicios, se houve."""
    rodadas = [b["rodada"] for b in aula["baterias"] if b["momento"] in ("revisao", "reforco")]
    if not rodadas:
        return None
    rodada = max(rodadas)
    return rodada, ("revisao" if rodada <= 1 else "reforco")


def _aula_consolidada(aula, cfg):
    """A aula passou na ultima vez em que foi medida?

    Exige duas coisas: percentual >= meta e um numero minimo de questoes, para
    que 80% nao venha de uma amostra pequena demais para significar algo. Uma
    aula que ja passou continua passada — quem volta ao reforco e so quem
    ficou abaixo da meta na sua propria ultima medicao.
    """
    ultima = ultima_avaliacao(aula)
    if ultima is None:
        return False, None
    rodada, momento = ultima
    q, a = aproveitamento(aula["baterias"], momento=momento, rodada=rodada)
    pct = percentual(q, a)
    if q < db.num(cfg, "minimo_questoes_avaliacao"):
        return False, pct
    return pct >= db.num(cfg, "meta_acerto"), pct


# ---------------------------------------------------------------- geracao de tarefas

def _tarefa_sessao(materia, aula, bloco, fase, rodada, indice, faixa, total_sessoes):
    inicio, fim = faixa
    rotulos = {"leitura": "Leitura", "revisao": "Revis\u00e3o", "reforco": "Refor\u00e7o"}
    return {
        "tipo": "sessao",
        "fase": fase,
        "rodada": rodada,
        "indice": indice,
        "materia_id": materia["id"],
        "materia": materia["nome"],
        "aula_id": aula["id"],
        "aula_numero": aula["numero"],
        "aula_titulo": aula["titulo"],
        "bloco": bloco,
        "pag_inicio": inicio,
        "pag_fim": fim,
        "paginas": fim - inicio + 1,
        "parte": f"{indice}/{total_sessoes}",
        "link": aula["link_pdf"],
        "observacao": aula["observacao"],
        "rotulo": f"{rotulos[fase]} \u2014 p\u00e1ginas {inicio} a {fim}",
    }


def _tarefa_bateria(materia, aula, bloco, momento, rodada, questoes):
    rotulos = {
        "fixacao": "Exerc\u00edcios de fixa\u00e7\u00e3o",
        "revisao": "Exerc\u00edcios da revis\u00e3o",
        "reforco": "Exerc\u00edcios de refor\u00e7o",
    }
    return {
        "tipo": "bateria",
        "momento": momento,
        "rodada": rodada,
        "materia_id": materia["id"],
        "materia": materia["nome"],
        "aula_id": aula["id"],
        "aula_numero": aula["numero"],
        "aula_titulo": aula["titulo"],
        "bloco": bloco,
        "questoes": questoes,
        "link": aula["link_exercicios"],
        "observacao": aula["observacao"],
        "rotulo": f"{rotulos[momento]} \u2014 {questoes} quest\u00f5es",
    }


def tarefas_da_materia(con, materia, cfg, limite=40):
    """Percorre o plano da materia e devolve as proximas tarefas pendentes."""
    materia = dict(materia)
    aulas = _carregar_materia(con, materia["id"], cfg)
    if not aulas:
        return []
    por_numero = {a["numero"]: a for a in aulas}
    blocos = montar_blocos(
        [a["numero"] for a in aulas],
        materia.get("qtd_blocos"),
        db.num(cfg, "tamanho_bloco_alvo"),
    )
    usa_fixacao = db.num(cfg, "exercicios_fixacao") == 1
    q_fixacao = db.num(cfg, "questoes_fixacao")
    q_bateria = db.num(cfg, "questoes_por_bateria")
    max_rodadas = db.num(cfg, "max_rodadas_reforco")

    pendentes = []

    def sessoes_pendentes(aula, numero_bloco, fase, rodada):
        fatias = dividir_por_fase(aula["total_paginas"], cfg, fase)
        if not fatias:
            return False
        faltou = False
        for indice, faixa in enumerate(fatias, start=1):
            if (fase, rodada, indice) in aula["concluidas"]:
                continue
            faltou = True
            if len(pendentes) < limite:
                pendentes.append(
                    _tarefa_sessao(materia, aula, numero_bloco, fase, rodada,
                                   indice, faixa, len(fatias))
                )
        return faltou

    for numero_bloco, numeros in enumerate(blocos, start=1):
        aulas_bloco = [por_numero[n] for n in numeros]

        # --- fase 1: leitura de todas as aulas do bloco
        bloco_lido = True
        for aula in aulas_bloco:
            if sessoes_pendentes(aula, numero_bloco, "leitura", 1):
                bloco_lido = False
            elif usa_fixacao and not aproveitamento(aula["baterias"], momento="fixacao")[0]:
                bloco_lido = False
                if len(pendentes) < limite:
                    pendentes.append(
                        _tarefa_bateria(materia, aula, numero_bloco, "fixacao", 1, q_fixacao)
                    )
        if not bloco_lido:
            if len(pendentes) >= limite:
                return pendentes
            continue

        # --- fase 2: revisao + exercicios, aula a aula
        bloco_revisado = True
        for aula in aulas_bloco:
            if sessoes_pendentes(aula, numero_bloco, "revisao", 1):
                bloco_revisado = False
            elif not aproveitamento(aula["baterias"], momento="revisao", rodada=1)[0]:
                bloco_revisado = False
                if len(pendentes) < limite:
                    pendentes.append(
                        _tarefa_bateria(materia, aula, numero_bloco, "revisao", 1, q_bateria)
                    )
        if not bloco_revisado:
            if len(pendentes) >= limite:
                return pendentes
            continue

        # --- fase 3: reforco individual das aulas que ficaram abaixo da meta.
        # Cada aula tem a sua propria contagem de rodadas: quem ja passou fica
        # de fora, quem esgotou as rodadas segue sinalizada e o bloco anda.
        bloco_fechado = True
        for aula in aulas_bloco:
            consolidada, _ = _aula_consolidada(aula, cfg)
            if consolidada:
                continue
            anterior = ultima_avaliacao(aula)
            rodada = (anterior[0] if anterior else 1) + 1
            if rodada > max_rodadas + 1:
                continue
            if sessoes_pendentes(aula, numero_bloco, "reforco", rodada):
                bloco_fechado = False
            elif not aproveitamento(aula["baterias"], momento="reforco", rodada=rodada)[0]:
                bloco_fechado = False
                if len(pendentes) < limite:
                    pendentes.append(
                        _tarefa_bateria(materia, aula, numero_bloco, "reforco", rodada, q_bateria)
                    )
        if not bloco_fechado:
            if len(pendentes) >= limite:
                return pendentes
            continue

        # bloco consolidado: segue para o proximo
        if len(pendentes) >= limite:
            return pendentes

    return pendentes


# ---------------------------------------------------------------- rodizio

def fila(con, cfg=None, limite=12):
    """Intercala as tarefas das materias por rodizio ponderado (peso = prioridade).

    Usa o algoritmo de round-robin ponderado suave: a materia escolhida acumula
    credito igual ao seu peso e devolve o total ao ser servida. O resultado
    distribui as materias importantes com mais frequencia sem agrupa-las.
    """
    cfg = cfg or db.config(con)
    materias = con.execute(
        "SELECT * FROM materia WHERE ativa = 1 ORDER BY ordem, id"
    ).fetchall()
    pendentes = {}
    for m in materias:
        tarefas = tarefas_da_materia(con, m, cfg, limite=limite)
        if tarefas:
            pendentes[m["id"]] = {"materia": dict(m), "tarefas": tarefas, "credito": 0}
    resultado = []
    while pendentes and len(resultado) < limite:
        total = sum(max(1, p["materia"]["peso"]) for p in pendentes.values())
        for p in pendentes.values():
            p["credito"] += max(1, p["materia"]["peso"])
        escolhido = max(pendentes.values(), key=lambda p: (p["credito"], -p["materia"]["ordem"]))
        escolhido["credito"] -= total
        resultado.append(escolhido["tarefas"].pop(0))
        if not escolhido["tarefas"]:
            del pendentes[escolhido["materia"]["id"]]
    return resultado


# ---------------------------------------------------------------- revisoes espacadas

def hoje():
    return datetime.date.today().isoformat()


def agendar_revisoes_espacadas(con, aula_id, cfg):
    """Ao consolidar uma aula, marca as revisoes futuras (7, 30, 90 dias)."""
    intervalos = [
        int(x) for x in cfg.get("intervalos_revisao_espacada", "7,30,90").split(",") if x.strip()
    ]
    base = datetime.date.today()
    for dias in intervalos:
        con.execute(
            "INSERT OR IGNORE INTO revisao_agendada (aula_id, prevista_para, intervalo_dias) "
            "VALUES (?, ?, ?)",
            (aula_id, (base + datetime.timedelta(days=dias)).isoformat(), dias),
        )


def revisoes_vencidas(con, limite=20):
    linhas = con.execute(
        """SELECT r.id, r.prevista_para, r.intervalo_dias, a.id AS aula_id, a.numero,
                  a.titulo, a.total_paginas, a.link_pdf, a.link_exercicios, m.nome AS materia
           FROM revisao_agendada r
           JOIN aula a ON a.id = r.aula_id
           JOIN materia m ON m.id = a.materia_id
           WHERE r.concluida_em IS NULL AND r.prevista_para <= ?
           ORDER BY r.prevista_para, m.ordem LIMIT ?""",
        (hoje(), limite),
    ).fetchall()
    return [dict(l) for l in linhas]
