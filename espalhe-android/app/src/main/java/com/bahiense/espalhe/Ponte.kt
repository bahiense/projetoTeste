package com.bahiense.espalhe

import android.content.ActivityNotFoundException
import android.content.ClipData
import android.content.ClipboardManager
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.webkit.JavascriptInterface
import android.webkit.MimeTypeMap
import android.webkit.WebView
import androidx.core.content.FileProvider
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.concurrent.Executors

/**
 * O que a página não consegue fazer sozinha: ler a galeria, gerar as versões
 * em cada tamanho e entregar o arquivo pronto ao app de cada rede.
 *
 * Tudo que demora responde depois, em window.__resposta(pedido, json); o
 * andamento de um vídeo chega em window.__progresso(pedido, 0..100).
 */
class Ponte(private val activity: MainActivity, private val web: WebView) {

    private val trabalho = Executors.newSingleThreadExecutor()
    private val principal = Handler(Looper.getMainLooper())
    private val gerador = Gerador(activity)

    private var pedidoSeletor = 0

    // ---------------------------------------------------------------- mídia

    @JavascriptInterface
    fun escolherMidia(pedido: Int) {
        pedidoSeletor = pedido
        principal.post { activity.abrirSeletor() }
    }

    fun seletorTerminou(uri: Uri?) {
        val pedido = pedidoSeletor
        if (uri == null) {
            responder(pedido, JSONObject().put("cancelado", true))
            return
        }
        trabalho.execute { responder(pedido, importar(uri)) }
    }

    /** Uma foto ou vídeo que outro app compartilhou com o Espalhe. */
    fun importarRecebida(uri: Uri) {
        trabalho.execute {
            val r = importar(uri)
            principal.post {
                web.evaluateJavascript("window.__recebida && window.__recebida($r)", null)
            }
        }
    }

    /**
     * Copia o original para files/midia (a galeria pode apagar ou mover o
     * arquivo no meio do caminho) e mede: tipo, tamanho na tela já com a
     * rotação aplicada, duração. A miniatura é o que a prévia desenha.
     */
    private fun importar(uri: Uri): JSONObject = try {
        val cr = activity.contentResolver
        val mime = cr.getType(uri) ?: ""
        val video = mime.startsWith("video/")
        val ext = MimeTypeMap.getSingleton().getExtensionFromMimeType(mime)
            ?: if (video) "mp4" else "jpg"
        val id = "m" + System.currentTimeMillis()
        val pasta = pastaMidia(activity)
        val original = File(pasta, "$id.$ext")
        cr.openInputStream(uri)!!.use { entrada ->
            original.outputStream().use { entrada.copyTo(it) }
        }
        val miniatura = File(pasta, "${id}_t.jpg")
        val info = if (video) gerador.medirVideo(original, miniatura)
        else gerador.medirFoto(original, miniatura)
        info.put("id", id)
            .put("arquivo", original.name)
            .put("miniatura", miniatura.name)
            .put("tipo", if (video) "video" else "foto")
            .put("bytes", original.length())
    } catch (e: Exception) {
        JSONObject().put("erro", "Não consegui abrir esse arquivo (${e.message ?: e.javaClass.simpleName}).")
    }

    // ------------------------------------------------------------- versões

    /**
     * Gera uma versão no tamanho exato de um formato. A tarefa vem da página:
     * {arquivo, tipo, w, h, modo: preencher|caber, zoom, ox, oy, fundo, saida}.
     */
    @JavascriptInterface
    fun gerar(pedido: Int, tarefaJson: String) {
        val t = JSONObject(tarefaJson)
        val entrada = File(pastaMidia(activity), t.getString("arquivo"))
        val nome = t.getString("saida").replace(Regex("[^A-Za-z0-9_-]"), "_")
        val video = t.getString("tipo") == "video"
        val saida = File(pastaSaida(activity).apply { mkdirs() }, nome + if (video) ".mp4" else ".jpg")
        val q = Quadro(
            t.getInt("w"), t.getInt("h"), t.optString("modo", "preencher"),
            t.optDouble("zoom", 1.0), t.optDouble("ox", 0.0), t.optDouble("oy", 0.0),
            t.optString("fundo", "desfoque")
        )
        val pronto = JSONObject()
            .put("arquivo", "saida/" + saida.name)
            .put("mime", if (video) "video/mp4" else "image/jpeg")

        if (!video) {
            trabalho.execute {
                responder(pedido, try {
                    gerador.foto(entrada, saida, q)
                    pronto
                } catch (e: Throwable) {
                    JSONObject().put("erro", "Falhou ao gerar a foto (${e.message ?: e.javaClass.simpleName}).")
                })
            }
            return
        }
        // o Transformer do Media3 precisa nascer e viver numa thread com Looper
        principal.post {
            gerador.video(
                entrada, saida, q,
                progresso = { p ->
                    web.evaluateJavascript("window.__progresso && window.__progresso($pedido, $p)", null)
                },
                fim = { erro ->
                    responder(pedido, if (erro == null) pronto else JSONObject().put("erro", erro))
                }
            )
        }
    }

    // --------------------------------------------------------------- envio

    /** Quais destes pacotes estão instalados — para a página dizer o que falta. */
    @JavascriptInterface
    fun instalados(pacotesJson: String): String {
        val pm = activity.packageManager
        val todos = JSONArray(pacotesJson)
        val sim = JSONArray()
        for (i in 0 until todos.length()) {
            val p = todos.getString(i)
            try {
                pm.getPackageInfo(p, 0)
                sim.put(p)
            } catch (_: PackageManager.NameNotFoundException) {
            }
        }
        return sim.toString()
    }

    /**
     * Abre o app da rede já com o arquivo. A legenda vai junto e também para a
     * área de transferência: Instagram, TikTok e outros ignoram o texto que
     * chega pelo compartilhamento, então ela precisa estar pronta para colar.
     * Devolve "" quando abriu, ou o motivo de não ter aberto.
     */
    @JavascriptInterface
    fun enviar(arquivo: String, mime: String, pacote: String, legenda: String): String {
        val f = arquivoSeguro(arquivo) ?: return "Arquivo não encontrado. Prepare de novo."
        if (legenda.isNotBlank()) copiarTexto(legenda)
        val uri = FileProvider.getUriForFile(activity, AUTORIDADE, f)
        val i = Intent(Intent.ACTION_SEND).apply {
            type = mime
            putExtra(Intent.EXTRA_STREAM, uri)
            if (legenda.isNotBlank()) putExtra(Intent.EXTRA_TEXT, legenda)
            clipData = ClipData.newRawUri("", uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            if (pacote.isNotEmpty()) setPackage(pacote)
        }
        return try {
            activity.startActivity(
                if (pacote.isEmpty()) Intent.createChooser(i, "Enviar para…") else i
            )
            ""
        } catch (e: ActivityNotFoundException) {
            "Esse app não está instalado ou não aceita esse tipo de arquivo."
        } catch (e: SecurityException) {
            "O Android bloqueou o envio (${e.message})."
        }
    }

    @JavascriptInterface
    fun copiar(texto: String) = copiarTexto(texto)

    private fun copiarTexto(texto: String) {
        val cb = activity.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        cb.setPrimaryClip(ClipData.newPlainText("Legenda", texto))
    }

    @JavascriptInterface
    fun abrirLoja(pacote: String) {
        val loja = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$pacote"))
        try {
            activity.startActivity(loja)
        } catch (e: ActivityNotFoundException) {
            activity.startActivity(
                Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=$pacote"))
            )
        }
    }

    /** Uma cópia na galeria, para postar à mão numa rede sem app ou pelo computador. */
    @JavascriptInterface
    fun salvarNaGaleria(pedido: Int, arquivo: String, mime: String) {
        trabalho.execute {
            responder(pedido, try {
                val f = arquivoSeguro(arquivo) ?: throw IllegalStateException("arquivo sumiu")
                if (Build.VERSION.SDK_INT < 29) throw IllegalStateException("precisa de Android 10 ou mais novo")
                val video = mime.startsWith("video/")
                val colecao = if (video) MediaStore.Video.Media.EXTERNAL_CONTENT_URI
                else MediaStore.Images.Media.EXTERNAL_CONTENT_URI
                val valores = ContentValues().apply {
                    put(MediaStore.MediaColumns.DISPLAY_NAME, "espalhe_" + f.name)
                    put(MediaStore.MediaColumns.MIME_TYPE, mime)
                    put(MediaStore.MediaColumns.RELATIVE_PATH, if (video) "Movies/Espalhe" else "Pictures/Espalhe")
                    put(MediaStore.MediaColumns.IS_PENDING, 1)
                }
                val cr = activity.contentResolver
                val destino = cr.insert(colecao, valores)!!
                cr.openOutputStream(destino)!!.use { saida -> f.inputStream().use { it.copyTo(saida) } }
                valores.clear()
                valores.put(MediaStore.MediaColumns.IS_PENDING, 0)
                cr.update(destino, valores, null, null)
                JSONObject().put("ok", true)
            } catch (e: Exception) {
                JSONObject().put("erro", "Não salvou na galeria (${e.message}).")
            })
        }
    }

    /** Apaga uma mídia importada ou uma versão gerada. Só dentro das duas pastas do app. */
    @JavascriptInterface
    fun apagar(caminho: String) {
        trabalho.execute {
            val f = if (caminho.startsWith("saida/")) arquivoSeguro(caminho)
            else File(pastaMidia(activity), caminho).takeIf { it.parentFile == pastaMidia(activity) }
            f?.delete()
        }
    }

    /** Esvazia as versões geradas (só ocupam espaço depois de enviadas). */
    @JavascriptInterface
    fun limparSaida() {
        trabalho.execute { pastaSaida(activity).listFiles()?.forEach { it.delete() } }
    }

    @JavascriptInterface
    fun espacoUsado(): Long =
        listOf(pastaMidia(activity), pastaSaida(activity))
            .flatMap { it.listFiles()?.toList() ?: emptyList() }
            .sumOf { it.length() }

    // ------------------------------------------------------------ interno

    private fun arquivoSeguro(caminho: String): File? {
        val nome = caminho.removePrefix("saida/")
        if (nome.contains('/') || nome.contains("..")) return null
        return File(pastaSaida(activity), nome).takeIf { it.exists() }
    }

    private fun responder(pedido: Int, json: JSONObject) {
        principal.post {
            web.evaluateJavascript("window.__resposta && window.__resposta($pedido, $json)", null)
        }
    }

    fun encerrar() {
        gerador.cancelar()
        trabalho.shutdown()
    }

    companion object {
        const val AUTORIDADE = "com.bahiense.espalhe.arquivos"

        fun pastaMidia(c: Context) = File(c.filesDir, "midia").apply { mkdirs() }
        fun pastaSaida(c: Context) = File(c.filesDir, "saida")
    }
}

/** Como encaixar a mídia num formato de w×h. ox/oy vão de -1 a 1; zoom de 1 a 3. */
data class Quadro(
    val w: Int, val h: Int, val modo: String,
    val zoom: Double, val ox: Double, val oy: Double, val fundo: String
)
