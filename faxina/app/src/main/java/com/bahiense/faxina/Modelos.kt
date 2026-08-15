package com.bahiense.faxina

/** As gavetas em que a varredura separa o que encontrou. */
enum class Categoria(
    val titulo: String,
    val emoji: String,
    val explicacao: String,
) {
    LIXO(
        titulo = "Lixo e cache",
        emoji = "🧽",
        explicacao = "Miniaturas, downloads interrompidos e caches que os apps recriam sozinhos. " +
            "Apagar é seguro: nada aqui é conteúdo seu.",
    ),
    DUPLICADOS(
        titulo = "Duplicados",
        emoji = "👯",
        explicacao = "Arquivos com conteúdo idêntico, byte a byte. Uma cópia de cada fica marcada " +
            "para manter; as outras podem sair.",
    ),
    GRANDES(
        titulo = "Arquivos grandes",
        emoji = "🐘",
        explicacao = "Os maiores arquivos do aparelho. Nada vem marcado — confira um por um antes " +
            "de decidir.",
    ),
    ANTIGOS(
        titulo = "Baixados e esquecidos",
        emoji = "🕰️",
        explicacao = "Coisas na pasta Download que você não abre há meses. Costuma ser o resto de " +
            "algo que já cumpriu sua função.",
    ),
    VAZIAS(
        titulo = "Pastas vazias",
        emoji = "📂",
        explicacao = "Pastas sem nada dentro, deixadas por apps que você desinstalou. Não liberam " +
            "espaço, mas tiram bagunça do caminho.",
    ),
}

/**
 * Um arquivo (ou pasta) que a varredura decidiu mostrar.
 *
 * [preSelecionado] é o palpite do app: verdadeiro só quando apagar é seguro
 * sem o usuário precisar olhar item por item.
 */
data class Achado(
    val caminho: String,
    val nome: String,
    val tamanho: Long,
    val modificadoEm: Long,
    val categoria: Categoria,
    val motivo: String,
    val ehPasta: Boolean = false,
    /** Hash do conteúdo, só para duplicados: agrupa as cópias iguais. */
    val grupo: String? = null,
    val preSelecionado: Boolean = false,
)

/** O que uma varredura completa produziu. */
data class Resultado(
    val achados: List<Achado> = emptyList(),
    val arquivosLidos: Int = 0,
    val bytesLidos: Long = 0L,
    val duracaoMs: Long = 0L,
    val avisos: List<String> = emptyList(),
) {
    fun de(categoria: Categoria): List<Achado> = achados.filter { it.categoria == categoria }

    /**
     * Quanto cada categoria representa. Um mesmo arquivo pode cair em duas
     * gavetas (um vídeo grande e duplicado, por exemplo), então somar as
     * categorias dá mais que o total real — por isso o resumo geral usa
     * [bytesUnicos] em vez desta soma.
     */
    fun bytesDe(categoria: Categoria): Long = de(categoria).sumOf { it.tamanho }

    fun bytesUnicos(caminhos: Set<String>): Long =
        achados.asSequence()
            .filter { it.caminho in caminhos }
            .distinctBy { it.caminho }
            .sumOf { it.tamanho }

    val caminhosPreSelecionados: Set<String>
        get() = achados.filter { it.preSelecionado }.map { it.caminho }.toSet()
}

/** Progresso enquanto a varredura roda, para a tela não ficar parada. */
data class Progresso(
    val etapa: String,
    val arquivos: Int = 0,
    val pastaAtual: String = "",
)

sealed interface EstadoVarredura {
    data object Ocioso : EstadoVarredura
    data class Rodando(val progresso: Progresso) : EstadoVarredura
    data class Pronto(val resultado: Resultado) : EstadoVarredura
    data class Falhou(val mensagem: String) : EstadoVarredura
}
