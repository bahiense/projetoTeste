package com.bahiense.faxina

import android.content.Context
import android.media.MediaScannerConnection
import java.io.File
import java.io.IOException

/**
 * Nada é apagado direto.
 *
 * O que o usuário marca vai primeiro para uma pasta de lixeira dentro do
 * próprio armazenamento, junto com um índice do lugar de onde veio. Como a
 * lixeira fica no mesmo volume, mover é só renomear: é instantâneo e não gasta
 * espaço nenhum. O espaço só é devolvido de verdade quando a lixeira é
 * esvaziada — e até lá dá para desfazer.
 *
 * O preço disso é honesto e precisa aparecer na tela: enquanto a lixeira não
 * for esvaziada, o armazenamento livre não muda.
 */
object Lixeira {

    const val PASTA = "Faxina/Lixeira"

    private const val ARQUIVOS = "arquivos"
    private const val INDICE = "indice.tsv"
    private const val SEPARADOR = "\t"

    data class Item(
        val origem: String,
        val guardado: String,
        val tamanho: Long,
        val removidoEm: Long,
    ) {
        val nome: String get() = origem.substringAfterLast('/')
    }

    data class Balanco(
        val quantidade: Int = 0,
        val bytes: Long = 0L,
        val falhas: List<String> = emptyList(),
        /**
         * Os caminhos que realmente saíram do lugar.
         *
         * Existe para quem chamou poder atualizar as listas sem perguntar ao
         * disco de novo: conferir a existência de dezenas de milhares de
         * arquivos é lento o bastante para travar a tela, e a resposta já é
         * conhecida aqui.
         */
        val caminhosMovidos: Set<String> = emptySet(),
    )

    /** Andamento de uma operação em lote, para a tela não ficar muda. */
    data class Andamento(val feitos: Int, val total: Int, val nome: String)

    private fun pastaBase(raiz: File) = File(raiz, PASTA)
    private fun pastaArquivos(raiz: File) = File(pastaBase(raiz), ARQUIVOS)
    private fun indice(raiz: File) = File(pastaBase(raiz), INDICE)

    // -- mover para a lixeira ------------------------------------------------

    fun mover(
        ctx: Context,
        raiz: File,
        caminhos: Collection<String>,
        aoProgredir: (Andamento) -> Unit = {},
    ): Balanco {
        val destinoBase = pastaArquivos(raiz)
        if (!destinoBase.exists() && !destinoBase.mkdirs()) {
            return Balanco(falhas = listOf("Não foi possível criar a pasta da lixeira."))
        }

        val agora = System.currentTimeMillis()
        val novos = mutableListOf<Item>()
        val falhas = mutableListOf<String>()
        val movidos = mutableSetOf<String>()
        var bytes = 0L
        val tocados = mutableListOf<String>()

        // Do caminho mais longo para o mais curto: assim uma pasta vazia só é
        // tratada depois do que estava dentro dela.
        val lista = caminhos.distinct().sortedByDescending { it.length }

        lista.forEachIndexed { posicao, caminho ->
            val arquivo = File(caminho)
            aoProgredir(Andamento(posicao, lista.size, arquivo.name))

            if (!arquivo.exists()) return@forEachIndexed

            if (arquivo.isDirectory) {
                // Pasta vazia não vale a viagem até a lixeira: se ainda estiver
                // vazia, delete() resolve; se não estiver, delete() falha sozinho
                // e nada é perdido.
                if (arquivo.delete()) {
                    novos += Item(caminho, "", 0L, agora)
                    movidos += caminho
                } else {
                    falhas += arquivo.name
                }
                return@forEachIndexed
            }

            val tamanho = arquivo.length()
            val destino = destinoUnico(destinoBase, arquivo.name)

            val moveu = try {
                arquivo.renameTo(destino) || copiarEApagar(arquivo, destino)
            } catch (e: IOException) {
                false
            } catch (e: SecurityException) {
                false
            }

            if (moveu) {
                novos += Item(caminho, destino.absolutePath, tamanho, agora)
                movidos += caminho
                bytes += tamanho
                tocados += caminho
                tocados += destino.absolutePath
            } else {
                falhas += arquivo.name
            }
        }

        aoProgredir(Andamento(lista.size, lista.size, "finalizando"))
        anexarAoIndice(raiz, novos)
        avisarGaleria(ctx, tocados)
        return Balanco(
            quantidade = novos.size,
            bytes = bytes,
            falhas = falhas,
            caminhosMovidos = movidos,
        )
    }

    // -- desfazer e esvaziar -------------------------------------------------

    fun listar(raiz: File): List<Item> {
        val arquivo = indice(raiz)
        if (!arquivo.exists()) return emptyList()

        return arquivo.readLines().mapNotNull { linha ->
            val partes = linha.split(SEPARADOR)
            if (partes.size < 4) return@mapNotNull null
            val guardado = partes[1]
            // Pastas vazias entram no índice só como registro; não há o que restaurar.
            if (guardado.isEmpty()) return@mapNotNull null
            Item(
                origem = partes[0],
                guardado = guardado,
                tamanho = partes[2].toLongOrNull() ?: 0L,
                removidoEm = partes[3].toLongOrNull() ?: 0L,
            )
        }.filter { File(it.guardado).exists() }.reversed()
    }

    fun restaurar(
        ctx: Context,
        raiz: File,
        itens: List<Item>,
        aoProgredir: (Andamento) -> Unit = {},
    ): Balanco {
        val falhas = mutableListOf<String>()
        val tocados = mutableListOf<String>()
        var restaurados = 0
        var bytes = 0L

        itens.forEachIndexed { posicao, item ->
            aoProgredir(Andamento(posicao, itens.size, item.nome))
            val guardado = File(item.guardado)
            if (!guardado.exists()) return@forEachIndexed

            val destino = destinoUnico(File(item.origem).parentFile ?: raiz, item.nome)
            destino.parentFile?.mkdirs()

            val voltou = try {
                guardado.renameTo(destino) || copiarEApagar(guardado, destino)
            } catch (e: IOException) {
                false
            } catch (e: SecurityException) {
                false
            }

            if (voltou) {
                restaurados++
                bytes += item.tamanho
                tocados += destino.absolutePath
                tocados += item.guardado
            } else {
                falhas += item.nome
            }
        }

        aoProgredir(Andamento(itens.size, itens.size, "finalizando"))
        reescreverIndice(raiz)
        avisarGaleria(ctx, tocados)
        return Balanco(quantidade = restaurados, bytes = bytes, falhas = falhas)
    }

    /** Aqui o espaço é devolvido de verdade — e não tem volta. */
    fun esvaziar(ctx: Context, raiz: File, aoProgredir: (Andamento) -> Unit = {}): Balanco {
        val itens = listar(raiz)
        var bytes = 0L
        var apagados = 0
        val falhas = mutableListOf<String>()
        val tocados = mutableListOf<String>()

        itens.forEachIndexed { posicao, item ->
            aoProgredir(Andamento(posicao, itens.size, item.nome))
            val arquivo = File(item.guardado)
            if (arquivo.delete()) {
                apagados++
                bytes += item.tamanho
                tocados += item.guardado
            } else if (arquivo.exists()) {
                falhas += item.nome
            }
        }

        aoProgredir(Andamento(itens.size, itens.size, "finalizando"))
        pastaArquivos(raiz).listFiles()?.forEach { it.deleteRecursively() }
        indice(raiz).delete()
        avisarGaleria(ctx, tocados)
        return Balanco(quantidade = apagados, bytes = bytes, falhas = falhas)
    }

    fun tamanho(raiz: File): Long = listar(raiz).sumOf { it.tamanho }

    // -- apoio ---------------------------------------------------------------

    private fun destinoUnico(pasta: File, nome: String): File {
        var candidato = File(pasta, nome)
        if (!candidato.exists()) return candidato

        val base = nome.substringBeforeLast('.', nome)
        val extensao = nome.substringAfterLast('.', "")
        var n = 1
        while (candidato.exists() && n < 10_000) {
            val sufixo = if (extensao.isEmpty()) "$base ($n)" else "$base ($n).$extensao"
            candidato = File(pasta, sufixo)
            n++
        }
        return candidato
    }

    /** Plano B para quando a lixeira e o arquivo estão em volumes diferentes. */
    private fun copiarEApagar(origem: File, destino: File): Boolean {
        origem.copyTo(destino, overwrite = true)
        if (origem.delete()) return true
        // Não dá para deixar as duas cópias: seria o oposto de liberar espaço.
        destino.delete()
        return false
    }

    private fun anexarAoIndice(raiz: File, itens: List<Item>) {
        if (itens.isEmpty()) return
        val arquivo = indice(raiz)
        arquivo.parentFile?.mkdirs()
        val texto = itens.joinToString("") { item ->
            listOf(item.origem, item.guardado, item.tamanho, item.removidoEm)
                .joinToString(SEPARADOR) + "\n"
        }
        arquivo.appendText(texto)
    }

    /** Descarta do índice as linhas cujo arquivo não está mais na lixeira. */
    private fun reescreverIndice(raiz: File) {
        val arquivo = indice(raiz)
        if (!arquivo.exists()) return

        val vivas = arquivo.readLines().filter { linha ->
            val partes = linha.split(SEPARADOR)
            partes.size >= 4 && partes[1].isNotEmpty() && File(partes[1]).exists()
        }
        if (vivas.isEmpty()) arquivo.delete() else arquivo.writeText(vivas.joinToString("\n") + "\n")
    }

    /**
     * Sem isso a galeria continua mostrando fotos que já saíram do disco, e o
     * usuário acha que a limpeza não funcionou.
     */
    private fun avisarGaleria(ctx: Context, caminhos: List<String>) {
        if (caminhos.isEmpty()) return
        MediaScannerConnection.scanFile(ctx, caminhos.distinct().toTypedArray(), null, null)
    }
}
