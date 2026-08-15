package com.bahiense.faxina

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.media.ExifInterface
import android.media.MediaMetadataRetriever
import android.media.ThumbnailUtils
import android.util.LruCache
import android.webkit.MimeTypeMap
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Semaphore
import kotlinx.coroutines.sync.withPermit
import kotlinx.coroutines.withContext
import java.util.Collections
import java.util.concurrent.ConcurrentHashMap

enum class TipoDeArquivo(val emoji: String) {
    IMAGEM("🖼"),
    VIDEO("🎬"),
    AUDIO("🎵"),
    OUTRO("📄"),
}

/**
 * Miniaturas dos arquivos encontrados.
 *
 * Ver a foto vale mais que ler o nome dela: "IMG_20231104_193img.jpg" não diz
 * nada sobre o que se está prestes a apagar. Vale para vídeo (primeiro quadro)
 * e para MP3 (capa embutida) pelo mesmo motivo.
 *
 * Um caminho só é decodificado uma vez: o resultado fica em cache de memória, e
 * os arquivos que não renderam imagem entram numa lista de recusados para não
 * serem tentados de novo a cada rolagem.
 */
object Miniaturas {

    /** Um oitavo da memória do processo, com teto — miniatura não pode causar OOM. */
    private val cache = object : LruCache<String, Bitmap>(
        (Runtime.getRuntime().maxMemory() / 8)
            .coerceIn(4L * 1024 * 1024, 32L * 1024 * 1024)
            .toInt(),
    ) {
        override fun sizeOf(key: String, value: Bitmap): Int = value.byteCount
    }

    private val recusados: MutableSet<String> =
        Collections.newSetFromMap(ConcurrentHashMap<String, Boolean>())

    /** Decodificar é caro; sem limite, uma rolagem rápida enfileira centenas de jobs. */
    private val vagas = Semaphore(4)

    private val extensoesDeImagem =
        setOf("jpg", "jpeg", "png", "gif", "webp", "bmp", "heic", "heif", "avif")
    private val extensoesDeVideo =
        setOf("mp4", "3gp", "mkv", "webm", "avi", "mov", "m4v", "ts", "flv")
    private val extensoesDeAudio =
        setOf("mp3", "m4a", "aac", "ogg", "opus", "flac", "wav", "wma", "amr")

    fun tipoDe(nome: String): TipoDeArquivo {
        val ext = nome.substringAfterLast('.', "").lowercase()
        return when (ext) {
            in extensoesDeImagem -> TipoDeArquivo.IMAGEM
            in extensoesDeVideo -> TipoDeArquivo.VIDEO
            in extensoesDeAudio -> TipoDeArquivo.AUDIO
            else -> TipoDeArquivo.OUTRO
        }
    }

    fun mimeDe(nome: String): String {
        val ext = nome.substringAfterLast('.', "").lowercase()
        return MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext) ?: "*/*"
    }

    suspend fun carregar(caminho: String, lado: Int): Bitmap? {
        val tipo = tipoDe(caminho.substringAfterLast('/'))
        if (tipo == TipoDeArquivo.OUTRO) return null

        val chave = "$caminho@$lado"
        cache.get(chave)?.let { return it }
        if (chave in recusados) return null

        return vagas.withPermit {
            // Outra rolagem pode ter decodificado o mesmo item enquanto se esperava a vaga.
            cache.get(chave)?.let { return@withPermit it }

            val bitmap = withContext(Dispatchers.IO) {
                try {
                    when (tipo) {
                        TipoDeArquivo.IMAGEM -> daImagem(caminho, lado)
                        TipoDeArquivo.VIDEO -> doVideo(caminho, lado)
                        TipoDeArquivo.AUDIO -> daCapa(caminho, lado)
                        TipoDeArquivo.OUTRO -> null
                    }
                } catch (e: Exception) {
                    // Arquivo corrompido, formato exótico, sem permissão: para uma
                    // miniatura nada disso merece derrubar a tela.
                    null
                } catch (e: OutOfMemoryError) {
                    null
                }
            }

            if (bitmap == null) {
                // Sem teto, uma varredura de 200 mil arquivos encheria a memória
                // só de caminhos que falharam.
                if (recusados.size > 5_000) recusados.clear()
                recusados += chave
            } else {
                cache.put(chave, bitmap)
            }
            bitmap
        }
    }

    // -- decodificação -------------------------------------------------------

    private fun daImagem(caminho: String, lado: Int): Bitmap? {
        val medida = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeFile(caminho, medida)
        if (medida.outWidth <= 0 || medida.outHeight <= 0) return null

        val opcoes = BitmapFactory.Options().apply {
            inSampleSize = amostragem(medida.outWidth, medida.outHeight, lado)
        }
        val cheia = BitmapFactory.decodeFile(caminho, opcoes) ?: return null
        return girarPeloExif(caminho, quadrada(cheia, lado))
    }

    private fun doVideo(caminho: String, lado: Int): Bitmap? {
        val leitor = MediaMetadataRetriever()
        return try {
            leitor.setDataSource(caminho)
            // -1 pega o primeiro quadro disponível; alguns vídeos começam no preto,
            // mas é o único ponto garantido em qualquer container.
            val quadro = leitor.getFrameAtTime(-1, MediaMetadataRetriever.OPTION_CLOSEST_SYNC)
            quadro?.let { quadrada(it, lado) }
        } catch (e: Exception) {
            null
        } finally {
            try {
                leitor.release()
            } catch (e: Exception) {
                // release() de um retriever que nunca abriu nada também estoura.
            }
        }
    }

    private fun daCapa(caminho: String, lado: Int): Bitmap? {
        val leitor = MediaMetadataRetriever()
        return try {
            leitor.setDataSource(caminho)
            val bytes = leitor.embeddedPicture ?: return null

            val medida = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            BitmapFactory.decodeByteArray(bytes, 0, bytes.size, medida)
            if (medida.outWidth <= 0) return null

            val opcoes = BitmapFactory.Options().apply {
                inSampleSize = amostragem(medida.outWidth, medida.outHeight, lado)
            }
            BitmapFactory.decodeByteArray(bytes, 0, bytes.size, opcoes)
                ?.let { quadrada(it, lado) }
        } catch (e: Exception) {
            null
        } finally {
            try {
                leitor.release()
            } catch (e: Exception) {
                // idem
            }
        }
    }

    /** Maior potência de 2 que ainda deixa a imagem acima do tamanho pedido. */
    private fun amostragem(largura: Int, altura: Int, lado: Int): Int {
        if (lado <= 0) return 1
        var passo = 1
        while (largura / (passo * 2) >= lado && altura / (passo * 2) >= lado) {
            passo *= 2
        }
        return passo
    }

    private fun quadrada(origem: Bitmap, lado: Int): Bitmap =
        ThumbnailUtils.extractThumbnail(
            origem,
            lado,
            lado,
            ThumbnailUtils.OPTIONS_RECYCLE_INPUT,
        )

    /**
     * Foto tirada em pé chega deitada se o EXIF for ignorado — e uma miniatura
     * virada de lado atrapalha justamente quem está tentando reconhecer o que é.
     */
    private fun girarPeloExif(caminho: String, bitmap: Bitmap): Bitmap {
        val graus = try {
            when (
                ExifInterface(caminho).getAttributeInt(
                    ExifInterface.TAG_ORIENTATION,
                    ExifInterface.ORIENTATION_NORMAL,
                )
            ) {
                ExifInterface.ORIENTATION_ROTATE_90 -> 90f
                ExifInterface.ORIENTATION_ROTATE_180 -> 180f
                ExifInterface.ORIENTATION_ROTATE_270 -> 270f
                else -> 0f
            }
        } catch (e: Exception) {
            0f
        }
        if (graus == 0f) return bitmap

        val girada = Bitmap.createBitmap(
            bitmap,
            0,
            0,
            bitmap.width,
            bitmap.height,
            Matrix().apply { postRotate(graus) },
            true,
        )
        if (girada != bitmap) bitmap.recycle()
        return girada
    }

    /**
     * Zera tudo depois de mover arquivos. Um caminho reaproveitado por outro
     * arquivo mostraria a capa antiga, e a chave do cache não sabe disso.
     */
    fun esquecerTudo() {
        cache.evictAll()
        recusados.clear()
    }
}
