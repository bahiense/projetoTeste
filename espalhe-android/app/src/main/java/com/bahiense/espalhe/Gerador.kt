package com.bahiense.espalhe

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.ImageDecoder
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.RectF
import android.media.MediaMetadataRetriever
import android.os.Handler
import android.os.Looper
import androidx.annotation.OptIn
import androidx.media3.common.Effect
import androidx.media3.common.MediaItem
import androidx.media3.common.MimeTypes
import androidx.media3.common.util.UnstableApi
import androidx.media3.effect.Crop
import androidx.media3.effect.Presentation
import androidx.media3.transformer.Composition
import androidx.media3.transformer.EditedMediaItem
import androidx.media3.transformer.EditedMediaItemSequence
import androidx.media3.transformer.Effects
import androidx.media3.transformer.ExportException
import androidx.media3.transformer.ExportResult
import androidx.media3.transformer.ProgressHolder
import androidx.media3.transformer.Transformer
import org.json.JSONObject
import java.io.File
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * Faz as versões no tamanho que cada rede pede. A conta do enquadramento é a
 * mesma da prévia (enquadrar() em app.js): o que a pessoa viu na tela é o que
 * sai no arquivo, só que na resolução cheia.
 */
class Gerador(private val context: Context) {

    private var transformer: Transformer? = null
    private val principal = Handler(Looper.getMainLooper())

    // ------------------------------------------------------------ medir

    fun medirFoto(original: File, miniatura: File): JSONObject {
        var w = 0
        var h = 0
        // o ImageDecoder já entrega a foto de pé, com a rotação do EXIF aplicada
        val bmp = ImageDecoder.decodeBitmap(ImageDecoder.createSource(original)) { dec, info, _ ->
            w = info.size.width
            h = info.size.height
            val k = min(1.0, LADO_MINIATURA.toDouble() / max(w, h))
            dec.setTargetSize(max(1, (w * k).roundToInt()), max(1, (h * k).roundToInt()))
            dec.allocator = ImageDecoder.ALLOCATOR_SOFTWARE
        }
        salvarJpeg(bmp, miniatura, 85)
        bmp.recycle()
        return JSONObject().put("w", w).put("h", h).put("dur", 0)
    }

    fun medirVideo(original: File, miniatura: File): JSONObject {
        val mmr = MediaMetadataRetriever()
        try {
            mmr.setDataSource(original.absolutePath)
            fun num(k: Int) = mmr.extractMetadata(k)?.toLongOrNull() ?: 0L
            val rot = num(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION).toInt()
            var w = num(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH).toInt()
            var h = num(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT).toInt()
            if (rot % 180 != 0) w = h.also { h = w }
            val durMs = num(MediaMetadataRetriever.METADATA_KEY_DURATION)

            // um quadro do começo, mas não o primeiro (que costuma ser preto)
            val us = min(1_000_000L, durMs * 500L)
            var quadro = mmr.getFrameAtTime(us, MediaMetadataRetriever.OPTION_CLOSEST_SYNC)
                ?: throw IllegalStateException("vídeo sem imagem")
            // alguns aparelhos devolvem o quadro deitado: endireita pela medida
            if (w != h && (quadro.width > quadro.height) != (w > h)) {
                val m = Matrix().apply { postRotate(rot.toFloat()) }
                quadro = Bitmap.createBitmap(quadro, 0, 0, quadro.width, quadro.height, m, true)
            }
            val k = min(1.0, LADO_MINIATURA.toDouble() / max(quadro.width, quadro.height))
            val mini = Bitmap.createScaledBitmap(
                quadro, max(1, (quadro.width * k).roundToInt()), max(1, (quadro.height * k).roundToInt()), true
            )
            salvarJpeg(mini, miniatura, 85)
            return JSONObject().put("w", w).put("h", h).put("dur", durMs / 1000.0)
        } finally {
            mmr.release()
        }
    }

    // ------------------------------------------------------------- foto

    fun foto(entrada: File, saida: File, q: Quadro) {
        var sw = 0
        var sh = 0
        val src = ImageDecoder.decodeBitmap(ImageDecoder.createSource(entrada)) { dec, info, _ ->
            sw = info.size.width
            sh = info.size.height
            // decodifica só a resolução que vai ser usada: foto de 50 MP não cabe na memória
            val k = if (q.modo == "caber") min(1.0, min(q.w.toDouble() / sw, q.h.toDouble() / sh))
            else min(1.0, q.w / recorte(sw.toDouble(), sh.toDouble(), q)[2])
            dec.setTargetSize(max(1, (sw * k).roundToInt()), max(1, (sh * k).roundToInt()))
            dec.allocator = ImageDecoder.ALLOCATOR_SOFTWARE
        }
        val out = Bitmap.createBitmap(q.w, q.h, Bitmap.Config.ARGB_8888)
        val c = Canvas(out)
        val pincel = Paint(Paint.FILTER_BITMAP_FLAG or Paint.ANTI_ALIAS_FLAG)
        val tudo = RectF(0f, 0f, q.w.toFloat(), q.h.toFloat())

        if (q.modo == "caber") {
            when (q.fundo) {
                "preto" -> c.drawColor(Color.BLACK)
                "branco" -> c.drawColor(Color.WHITE)
                else -> {
                    c.drawBitmap(desfocado(src, q), null, tudo, pincel)
                    c.drawColor(Color.argb(70, 0, 0, 0))
                }
            }
            val s = min(q.w.toDouble() / src.width, q.h.toDouble() / src.height)
            val dw = src.width * s
            val dh = src.height * s
            val l = (q.w - dw) / 2
            val t = (q.h - dh) / 2
            c.drawBitmap(src, null, RectF(l.toFloat(), t.toFloat(), (l + dw).toFloat(), (t + dh).toFloat()), pincel)
        } else {
            val r = recorte(src.width.toDouble(), src.height.toDouble(), q)
            val origem = Rect(
                r[0].roundToInt(), r[1].roundToInt(),
                (r[0] + r[2]).roundToInt().coerceAtMost(src.width),
                (r[1] + r[3]).roundToInt().coerceAtMost(src.height)
            )
            c.drawBitmap(src, origem, tudo, pincel)
        }
        salvarJpeg(out, saida, 93)
        src.recycle()
        out.recycle()
    }

    /** Fundo do "caber": a própria foto ampliada e borrada (reduzir muito e ampliar de novo). */
    private fun desfocado(src: Bitmap, q: Quadro): Bitmap {
        val r = recorte(src.width.toDouble(), src.height.toDouble(), q.copy(zoom = 1.0, ox = 0.0, oy = 0.0))
        val capa = Bitmap.createBitmap(
            src, r[0].toInt(), r[1].toInt(),
            max(1, r[2].toInt().coerceAtMost(src.width - r[0].toInt())),
            max(1, r[3].toInt().coerceAtMost(src.height - r[1].toInt()))
        )
        val minus = Bitmap.createScaledBitmap(capa, max(1, q.w / 40), max(1, q.h / 40), true)
        return Bitmap.createScaledBitmap(minus, max(1, q.w / 8), max(1, q.h / 8), true)
    }

    // ------------------------------------------------------------ vídeo

    @OptIn(UnstableApi::class)
    fun video(entrada: File, saida: File, q: Quadro, progresso: (Int) -> Unit, fim: (String?) -> Unit) {
        val mmr = MediaMetadataRetriever()
        val (sw, sh) = try {
            mmr.setDataSource(entrada.absolutePath)
            val rot = mmr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION)?.toIntOrNull() ?: 0
            val w = mmr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)!!.toDouble()
            val h = mmr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)!!.toDouble()
            if (rot % 180 != 0) h to w else w to h
        } catch (e: Exception) {
            fim("Não consegui ler o vídeo (${e.message}).")
            return
        } finally {
            mmr.release()
        }

        // o Media3 entrega os quadros já de pé, então o recorte usa a medida de tela
        val efeitos = mutableListOf<Effect>()
        if (q.modo != "caber") {
            val r = recorte(sw, sh, q)
            // coordenadas do Crop vão de -1 a 1, com o y para cima
            efeitos += Crop(
                (-1 + 2 * r[0] / sw).toFloat(),
                (-1 + 2 * (r[0] + r[2]) / sw).toFloat(),
                (1 - 2 * (r[1] + r[3]) / sh).toFloat(),
                (1 - 2 * r[1] / sh).toFloat()
            )
        }
        // no "caber" sobra faixa preta; no "preencher" o recorte já tem a proporção certa
        efeitos += Presentation.createForWidthAndHeight(q.w, q.h, Presentation.LAYOUT_SCALE_TO_FIT)

        val item = EditedMediaItem.Builder(MediaItem.fromUri(android.net.Uri.fromFile(entrada)))
            .setEffects(Effects(emptyList(), efeitos))
            .build()
        // vídeo HDR de celular novo vira SDR: as redes estragam as cores do HDR
        val composicao = Composition.Builder(EditedMediaItemSequence(item))
            .setHdrMode(Composition.HDR_MODE_TONE_MAP_HDR_TO_SDR_USING_OPEN_GL)
            .build()

        saida.delete()
        val segurar = ProgressHolder()
        lateinit var acompanhar: Runnable
        val t = Transformer.Builder(context)
            .setVideoMimeType(MimeTypes.VIDEO_H264)
            .setAudioMimeType(MimeTypes.AUDIO_AAC)
            .addListener(object : Transformer.Listener {
                override fun onCompleted(composition: Composition, exportResult: ExportResult) {
                    principal.removeCallbacks(acompanhar)
                    transformer = null
                    progresso(100)
                    fim(null)
                }

                override fun onError(
                    composition: Composition,
                    exportResult: ExportResult,
                    exportException: ExportException
                ) {
                    principal.removeCallbacks(acompanhar)
                    transformer = null
                    saida.delete()
                    fim("O aparelho não conseguiu converter o vídeo (${exportException.errorCodeName}).")
                }
            })
            .build()
        transformer = t
        acompanhar = Runnable {
            if (t.getProgress(segurar) == Transformer.PROGRESS_STATE_AVAILABLE) progresso(segurar.progress)
            principal.postDelayed(acompanhar, 400)
        }
        t.start(composicao, saida.absolutePath)
        principal.postDelayed(acompanhar, 400)
    }

    @OptIn(UnstableApi::class)
    fun cancelar() {
        principal.post { transformer?.cancel(); transformer = null }
    }

    private fun salvarJpeg(b: Bitmap, f: File, qualidade: Int) {
        f.outputStream().use { b.compress(Bitmap.CompressFormat.JPEG, qualidade, it) }
    }

    companion object {
        const val LADO_MINIATURA = 1080

        /**
         * O pedaço da mídia (sw×sh) que enche o formato: o maior retângulo na
         * proporção certa, reduzido pelo zoom e deslocado por ox/oy. Devolve
         * [esquerda, topo, largura, altura] na medida da mídia.
         */
        fun recorte(sw: Double, sh: Double, q: Quadro): DoubleArray {
            val a = q.w.toDouble() / q.h
            var cw: Double
            var ch: Double
            if (sw / sh > a) { ch = sh; cw = sh * a } else { cw = sw; ch = sw / a }
            val z = q.zoom.coerceIn(1.0, 4.0)
            cw /= z
            ch /= z
            val ox = q.ox.coerceIn(-1.0, 1.0)
            val oy = q.oy.coerceIn(-1.0, 1.0)
            return doubleArrayOf((sw - cw) * (ox + 1) / 2, (sh - ch) * (oy + 1) / 2, cw, ch)
        }
    }
}
