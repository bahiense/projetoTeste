package com.bahiense.teleprompter

import android.content.ContentValues
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.webkit.JavascriptInterface
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream

/**
 * Ponte usada pela página para salvar o vídeo na galeria.
 *
 * No navegador o vídeo é baixado como arquivo; dentro do app o blob é enviado
 * em pedaços (base64) para cá e gravado direto em Filmes/Teleprompter.
 */
class VideoBridge(private val activity: MainActivity) {

    private var out: OutputStream? = null
    private var uri: Uri? = null
    private var legacyFile: File? = null
    private var mime: String = "video/mp4"

    @JavascriptInterface
    fun isAvailable(): Boolean = true

    /** Versão instalada, para não haver dúvida sobre qual build está rodando. */
    @JavascriptInterface
    fun appVersion(): String = try {
        activity.packageManager.getPackageInfo(activity.packageName, 0).versionName ?: "?"
    } catch (e: Exception) {
        "?"
    }

    /** Abre a tela de permissões do app, quando a câmera foi negada de vez. */
    @JavascriptInterface
    fun openSettings() {
        activity.runOnUiThread { activity.openAppSettings() }
    }

    /** Abre o arquivo de destino. Retorna false se não conseguir. */
    @JavascriptInterface
    fun begin(name: String, mimeType: String): Boolean {
        close()
        mime = if (mimeType.isNotBlank()) mimeType.substringBefore(';') else "video/mp4"
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val values = ContentValues().apply {
                    put(MediaStore.Video.Media.DISPLAY_NAME, name)
                    put(MediaStore.Video.Media.MIME_TYPE, mime)
                    put(MediaStore.Video.Media.RELATIVE_PATH, Environment.DIRECTORY_MOVIES + "/Teleprompter")
                    put(MediaStore.Video.Media.IS_PENDING, 1)
                }
                val resolver = activity.contentResolver
                val target = resolver.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, values)
                    ?: return false
                uri = target
                out = resolver.openOutputStream(target)
            } else {
                val dir = File(
                    Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES),
                    "Teleprompter"
                )
                if (!dir.exists()) dir.mkdirs()
                val file = File(dir, name)
                legacyFile = file
                out = FileOutputStream(file)
            }
            out != null
        } catch (e: Exception) {
            close()
            false
        }
    }

    /** Grava um pedaço do vídeo (base64, sem o prefixo data:). */
    @JavascriptInterface
    fun write(chunk: String): Boolean {
        val stream = out ?: return false
        return try {
            stream.write(Base64.decode(chunk, Base64.DEFAULT))
            true
        } catch (e: Exception) {
            false
        }
    }

    /** Fecha o arquivo e o publica na galeria. Retorna o endereço ou string vazia. */
    @JavascriptInterface
    fun finish(): String {
        return try {
            out?.flush()
            out?.close()
            out = null

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val target = uri ?: return ""
                val values = ContentValues().apply { put(MediaStore.Video.Media.IS_PENDING, 0) }
                activity.contentResolver.update(target, values, null, null)
                target.toString()
            } else {
                val file = legacyFile ?: return ""
                val values = ContentValues().apply {
                    put(MediaStore.Video.Media.DATA, file.absolutePath)
                    put(MediaStore.Video.Media.MIME_TYPE, mime)
                }
                val target = activity.contentResolver
                    .insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, values)
                uri = target
                target?.toString() ?: ""
            }
        } catch (e: Exception) {
            ""
        }
    }

    /** Cancela e apaga o arquivo pela metade. */
    @JavascriptInterface
    fun abort() {
        close()
        try {
            uri?.let { activity.contentResolver.delete(it, null, null) }
            legacyFile?.delete()
        } catch (e: Exception) {
            // nada a fazer
        }
        uri = null
        legacyFile = null
    }

    /** Abre o menu de compartilhar do Android com o último vídeo salvo. */
    @JavascriptInterface
    fun share() {
        val target = uri ?: return
        activity.runOnUiThread { activity.shareUri(target, mime) }
    }

    private fun close() {
        try {
            out?.flush()
            out?.close()
        } catch (e: Exception) {
            // nada a fazer
        }
        out = null
    }
}
