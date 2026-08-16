package com.bahiense.faxina

import java.io.File

/** Como os arquivos de um app são separados na tela de detalhe. */
enum class GrupoDeConteudo(val rotulo: String, val emoji: String) {
    IMAGENS("Imagens", "🖼"),
    VIDEOS("Vídeos", "🎬"),
    AUDIOS("Áudio", "🎵"),
    DOCUMENTOS("Documentos", "📄"),
    OUTROS("Outros arquivos", "🗂"),
}

/**
 * O que cada aplicativo guarda fora da própria caixa-preta.
 *
 * Esta é a metade visível do armazenamento de um app, e vale explicar por que
 * existe uma metade invisível:
 *
 * - `/data/data/<pacote>` e `Android/data/<pacote>` são privados. Desde o
 *   Android 11 nem o "Acesso a todos os arquivos" abre a segunda, e a primeira
 *   nunca foi acessível. De lá o sistema só informa três totais — APK, dados,
 *   cache — sem nenhuma composição. Não existe API que conte quantas fotos ou
 *   quantos bancos de dados há dentro.
 * - `Android/media/<pacote>` **é** legível, e é onde o WhatsApp e vários outros
 *   passaram a guardar a mídia justamente por isso. Some-se a ela as pastas
 *   clássicas na raiz, e sobra a parte que dá para listar, medir e apagar.
 *
 * Então a tela mostra os três totais do sistema como números fechados, e detalha
 * por tipo apenas o que realmente conseguiu abrir — sem fingir que a composição
 * do resto é conhecida.
 */
object ArquivosDeApps {

    data class Fatia(
        val grupo: GrupoDeConteudo,
        val quantidade: Int,
        val bytes: Long,
        val caminhos: List<String>,
    )

    data class Retrato(
        /** Pastas realmente encontradas, em caminho relativo, para a tela citar. */
        val pastas: List<String>,
        val fatias: List<Fatia>,
        val arquivos: Int,
        val bytes: Long,
        val truncado: Boolean,
    )

    /** Teto por app: nenhuma tela de detalhe justifica varrer sem limite. */
    private const val LIMITE_DE_ARQUIVOS = 20_000

    /**
     * Pastas antigas na raiz do armazenamento, de antes de os apps migrarem
     * para `Android/media`. Muitas continuam lá, cheias, anos depois.
     */
    private val pastasHistoricas: Map<String, List<String>> = mapOf(
        "com.whatsapp" to listOf("WhatsApp"),
        "com.whatsapp.w4b" to listOf("WhatsApp Business"),
        "org.telegram.messenger" to listOf("Telegram"),
        "com.instagram.android" to listOf("Pictures/Instagram", "Movies/Instagram"),
        "com.facebook.katana" to listOf("Pictures/Facebook", "Movies/Facebook"),
        "com.facebook.orca" to listOf("Pictures/Messenger"),
        "com.zhiliaoapp.musically" to listOf("Pictures/TikTok", "Movies/TikTok", "DCIM/TikTok"),
        "com.twitter.android" to listOf("Pictures/Twitter"),
        "com.snapchat.android" to listOf("Pictures/Snapchat"),
        "com.spotify.music" to listOf("Spotify"),
        "com.google.android.apps.docs" to listOf("Download"),
    )

    /**
     * Onde procurar. `Android/media/<pacote>` vale para qualquer app — é a regra
     * do sistema, não um palpite; as históricas são a tabela acima.
     */
    fun pastasDe(pacote: String, raiz: File): List<File> {
        val relativos = buildList {
            add("Android/media/$pacote")
            pastasHistoricas[pacote]?.let { addAll(it) }
        }
        return relativos
            .map { File(raiz, it) }
            .filter { it.isDirectory && it.canRead() }
    }

    fun vasculhar(pacote: String, raiz: File): Retrato {
        val pastas = pastasDe(pacote, raiz)
        if (pastas.isEmpty()) {
            return Retrato(emptyList(), emptyList(), 0, 0L, false)
        }

        val porGrupo = linkedMapOf<GrupoDeConteudo, MutableList<File>>()
        var arquivos = 0
        var bytes = 0L
        var truncado = false

        val pilha = ArrayDeque(pastas)
        while (pilha.isNotEmpty()) {
            if (arquivos >= LIMITE_DE_ARQUIVOS) {
                truncado = true
                break
            }
            val filhos = pilha.removeLast().listFiles() ?: continue
            for (filho in filhos) {
                if (filho.isDirectory) {
                    pilha.addLast(filho)
                    continue
                }
                arquivos++
                bytes += filho.length()
                porGrupo.getOrPut(grupoDe(filho.name)) { mutableListOf() }.add(filho)
                if (arquivos >= LIMITE_DE_ARQUIVOS) {
                    truncado = true
                    break
                }
            }
        }

        // A ordem da enum, não a de descoberta: o usuário procura "Vídeos" no
        // mesmo lugar toda vez que abre a tela.
        val fatias = GrupoDeConteudo.entries.mapNotNull { grupo ->
            val itens = porGrupo[grupo] ?: return@mapNotNull null
            Fatia(
                grupo = grupo,
                quantidade = itens.size,
                bytes = itens.sumOf { it.length() },
                caminhos = itens.map { it.absolutePath },
            )
        }

        val raizNormalizada = raiz.absolutePath.removeSuffix("/")
        return Retrato(
            pastas = pastas.map { caminhoCurto(it.absolutePath, raizNormalizada) },
            fatias = fatias,
            arquivos = arquivos,
            bytes = bytes,
            truncado = truncado,
        )
    }

    private val documentos = setOf(
        "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "rtf", "odt",
        "csv", "epub", "zip", "rar", "7z", "apk", "json", "xml", "log",
    )

    private fun grupoDe(nome: String): GrupoDeConteudo {
        // Reaproveita a classificação das miniaturas para mídia, e trata só o
        // que ela não cobre: documento é o resto que tem extensão conhecida.
        return when (Miniaturas.tipoDe(nome)) {
            TipoDeArquivo.IMAGEM -> GrupoDeConteudo.IMAGENS
            TipoDeArquivo.VIDEO -> GrupoDeConteudo.VIDEOS
            TipoDeArquivo.AUDIO -> GrupoDeConteudo.AUDIOS
            TipoDeArquivo.OUTRO -> {
                val ext = nome.substringAfterLast('.', "").lowercase()
                if (ext in documentos) GrupoDeConteudo.DOCUMENTOS else GrupoDeConteudo.OUTROS
            }
        }
    }
}
