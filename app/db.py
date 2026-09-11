"""Banco de dados SQLite. Sem dependencias externas."""
import os
import sqlite3

PADRAO = {
    "paginas_min_dia": "10",
    "paginas_max_dia": "20",
    "fator_revisao": "2.0",
    "questoes_por_bateria": "10",
    "questoes_fixacao": "5",
    "exercicios_fixacao": "1",
    "meta_acerto": "80",
    "minimo_questoes_avaliacao": "10",
    "intervalos_revisao_espacada": "7,30,90",
    "tamanho_bloco_alvo": "4",
    "max_rodadas_reforco": "3",
}

ESQUEMA = """
CREATE TABLE IF NOT EXISTS config (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS materia (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        TEXT NOT NULL UNIQUE,
    ordem       INTEGER NOT NULL DEFAULT 0,
    peso        INTEGER NOT NULL DEFAULT 1,
    qtd_blocos  INTEGER,
    meta        INTEGER,
    ativa       INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS aula (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    materia_id      INTEGER NOT NULL REFERENCES materia(id) ON DELETE CASCADE,
    numero          INTEGER NOT NULL,
    titulo          TEXT NOT NULL DEFAULT '',
    total_paginas   INTEGER NOT NULL DEFAULT 0,
    link_pdf        TEXT NOT NULL DEFAULT '',
    link_exercicios TEXT NOT NULL DEFAULT '',
    observacao      TEXT NOT NULL DEFAULT '',
    UNIQUE (materia_id, numero)
);

CREATE TABLE IF NOT EXISTS sessao (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    aula_id      INTEGER NOT NULL REFERENCES aula(id) ON DELETE CASCADE,
    fase         TEXT NOT NULL,
    rodada       INTEGER NOT NULL DEFAULT 1,
    indice       INTEGER NOT NULL,
    pag_inicio   INTEGER NOT NULL,
    pag_fim      INTEGER NOT NULL,
    concluida_em TEXT,
    minutos      INTEGER,
    pontos_chave TEXT NOT NULL DEFAULT '',
    UNIQUE (aula_id, fase, rodada, indice)
);

CREATE TABLE IF NOT EXISTS bateria (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    aula_id    INTEGER NOT NULL REFERENCES aula(id) ON DELETE CASCADE,
    momento    TEXT NOT NULL,
    rodada     INTEGER NOT NULL DEFAULT 1,
    questoes   INTEGER NOT NULL,
    acertos    INTEGER NOT NULL,
    minutos    INTEGER,
    data       TEXT NOT NULL,
    observacao TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS erro (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    bateria_id INTEGER NOT NULL REFERENCES bateria(id) ON DELETE CASCADE,
    assunto    TEXT NOT NULL,
    motivo     TEXT NOT NULL DEFAULT 'nao_sabia',
    anotacao   TEXT NOT NULL DEFAULT '',
    resolvido  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS revisao_agendada (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    aula_id       INTEGER NOT NULL REFERENCES aula(id) ON DELETE CASCADE,
    prevista_para TEXT NOT NULL,
    intervalo_dias INTEGER NOT NULL,
    concluida_em  TEXT,
    UNIQUE (aula_id, intervalo_dias)
);

CREATE TABLE IF NOT EXISTS determinacao (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    pergunta TEXT NOT NULL,
    resposta TEXT NOT NULL DEFAULT '',
    ordem    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_aula_materia ON aula(materia_id, numero);
CREATE INDEX IF NOT EXISTS idx_sessao_aula ON sessao(aula_id);
CREATE INDEX IF NOT EXISTS idx_bateria_aula ON bateria(aula_id);
"""


def caminho_banco():
    env = os.environ.get("CICLO_DB")
    if env:
        return env
    base = os.path.join(os.path.expanduser("~"), "CicloConcursos")
    os.makedirs(base, exist_ok=True)
    return os.path.join(base, "dados.db")


def conectar(caminho=None, criar=False):
    con = sqlite3.connect(caminho or caminho_banco())
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    if criar:
        iniciar(con)
    return con


def iniciar(con):
    con.executescript(ESQUEMA)
    colunas = {linha["name"] for linha in con.execute("PRAGMA table_info(materia)")}
    if "meta" not in colunas:          # banco criado antes do sarrafo por materia
        con.execute("ALTER TABLE materia ADD COLUMN meta INTEGER")
    for chave, valor in PADRAO.items():
        con.execute("INSERT OR IGNORE INTO config (chave, valor) VALUES (?, ?)", (chave, valor))
    if not con.execute("SELECT 1 FROM determinacao").fetchone():
        con.executemany(
            "INSERT INTO determinacao (pergunta, resposta, ordem) VALUES (?, '', ?)",
            [("Por que eu preciso passar neste concurso?", 1), ("O que eu preciso fazer hoje?", 2)],
        )
    con.commit()


def config(con):
    linhas = con.execute("SELECT chave, valor FROM config").fetchall()
    return {linha["chave"]: linha["valor"] for linha in linhas}


def num(cfg, chave, tipo=int):
    return tipo(cfg.get(chave, PADRAO[chave]))
