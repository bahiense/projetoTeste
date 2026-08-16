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
 * De onde a mídia veio.
 *
 * Serve para organizar, mas o motivo real é outro: a origem prevê o risco melhor
 * que qualquer outro sinal barato. Uma foto que saiu da câmera deste celular não
 * existe em nenhum outro lugar; um vídeo recebido no WhatsApp continua na
 * conversa, e uma cópia de envio é literalmente a segunda via de um arquivo que
 * o usuário já tem.
 *
 * A ordem da enum é a ordem da tela: do mais perigoso de apagar ao mais óbvio.
 */
enum class Origem(
    val titulo: String,
    val emoji: String,
    val explicacao: String,
    /** Vem marcado sozinho? Só para o que é cópia comprovada de outra coisa. */
    val descartavel: Boolean = false,
) {
    CAMERA(
        titulo = "Feito neste celular",
        emoji = "📸",
        explicacao = "Fotos, vídeos e gravações que saíram da sua câmera e do seu microfone. " +
            "Se apagar, não volta de lugar nenhum — confira uma a uma.",
    ),
    CAPTURAS(
        titulo = "Capturas de tela",
        emoji = "🖼",
        explicacao = "Prints e gravações de tela. Feitos por você, mas quase sempre para " +
            "resolver algo de um dia só.",
    ),
    RECEBIDO(
        titulo = "Recebido em conversas",
        emoji = "💬",
        explicacao = "Chegou pelo WhatsApp, Telegram ou Bluetooth. Enquanto a conversa " +
            "existir, dá para baixar de novo.",
    ),
    ENVIADO(
        titulo = "Cópias do que você enviou",
        emoji = "📤",
        explicacao = "O WhatsApp guarda uma segunda cópia de tudo que você manda. O original " +
            "continua na câmera, intacto — estas são só as duplicatas.",
        descartavel = true,
    ),
    BAIXADO(
        titulo = "Baixado da internet",
        emoji = "⬇️",
        explicacao = "Veio do navegador ou de um link. Se precisar de novo, baixa de novo.",
    ),
    DE_APPS(
        titulo = "Guardado por aplicativos",
        emoji = "🧩",
        explicacao = "Figurinhas, capas e imagens que apps salvaram sozinhos, sem você pedir.",
    ),
    OUTRAS(
        titulo = "Outras mídias",
        emoji = "🗃",
        explicacao = "Não deu para dizer de onde vieram pelo caminho nem pelo nome.",
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
    /** Preenchida só para mídia; o resto fica em OUTRAS e não é exibido por origem. */
    val origem: Origem = Origem.OUTRAS,
)

/** Uma pasta que pesa, com o que há dentro dela somado. */
data class PastaGrande(
    val caminho: String,
    val bytes: Long,
    val arquivos: Int,
)

/** O que uma varredura completa produziu. */
data class Resultado(
    /** Vista "por problema": lixo, duplicados, grandes, antigos, pastas vazias. */
    val achados: List<Achado> = emptyList(),
    /** Vista "por origem": toda a mídia encontrada, venha de onde vier. */
    val midias: List<Achado> = emptyList(),
    /** As pastas que mais pesam, já filtradas para não repetir a mesma informação. */
    val pastas: List<PastaGrande> = emptyList(),
    val arquivosLidos: Int = 0,
    val bytesLidos: Long = 0L,
    val duracaoMs: Long = 0L,
    val avisos: List<String> = emptyList(),
) {
    fun de(categoria: Categoria): List<Achado> = achados.filter { it.categoria == categoria }

    fun de(origem: Origem): List<Achado> = midias.filter { it.origem == origem }

    /**
     * Quanto cada categoria representa. Um mesmo arquivo pode cair em duas
     * gavetas (um vídeo grande e duplicado, por exemplo), então somar as
     * categorias dá mais que o total real — por isso o resumo geral usa
     * [bytesUnicos] em vez desta soma.
     */
    fun bytesDe(categoria: Categoria): Long = de(categoria).sumOf { it.tamanho }

    fun bytesDe(origem: Origem): Long = de(origem).sumOf { it.tamanho }

    /**
     * Índice por caminho, montado uma vez.
     *
     * As duas vistas mostram o mesmo arquivo por ângulos diferentes, e a seleção
     * é por caminho — sem este índice, somar o que está marcado contaria em
     * dobro tudo que aparece nas duas.
     */
    private val tamanhoPorCaminho: Map<String, Long> by lazy {
        buildMap {
            achados.forEach { put(it.caminho, it.tamanho) }
            midias.forEach { put(it.caminho, it.tamanho) }
        }
    }

    fun bytesUnicos(caminhos: Set<String>): Long =
        caminhos.sumOf { tamanhoPorCaminho[it] ?: 0L }

    val caminhosPreSelecionados: Set<String>
        get() = (achados + midias).filter { it.preSelecionado }.map { it.caminho }.toSet()
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
