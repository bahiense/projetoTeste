package com.bahiense.espalhe

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.core.content.FileProvider
import org.json.JSONObject
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

/**
 * Atualização com um toque, sem Play Store: confere a versão publicada na aba
 * Releases do repositório, baixa o APK novo e abre o instalador do Android.
 *
 * Quem garante que o arquivo é legítimo é o próprio Android: ele só instala por
 * cima se o APK novo tiver a mesma assinatura do instalado. Um arquivo trocado
 * no caminho é recusado com "app não instalado", sem tocar nos dados.
 */
class Atualizador(private val activity: Activity, private val web: WebView) {

    private val trabalho = Executors.newSingleThreadExecutor()
    private val principal = Handler(Looper.getMainLooper())

    /** A versão publicada: {codigo, nome, novidades} — ou {} quando não deu para ver. */
    @JavascriptInterface
    fun verificar(pedido: Int) {
        trabalho.execute {
            val r = try {
                val v = JSONObject(baixarTexto(VERSAO))
                JSONObject()
                    .put("instalada", BuildConfig.VERSION_CODE)
                    .put("codigo", v.optInt("codigo"))
                    .put("nome", v.optString("nome"))
                    .put("novidades", v.optString("novidades"))
            } catch (e: Exception) {
                JSONObject().put("instalada", BuildConfig.VERSION_CODE)
            }
            responder(pedido, r)
        }
    }

    @JavascriptInterface
    fun versaoInstalada(): String = BuildConfig.VERSION_NAME

    @JavascriptInterface
    fun codigoInstalado(): Int = BuildConfig.VERSION_CODE

    /** Baixa e abre o instalador. O andamento chega em __progresso; o fim, em __resposta. */
    @JavascriptInterface
    fun atualizar(pedido: Int) {
        // Android 8+: na primeira vez, a pessoa autoriza o Espalhe a instalar
        // atualizações (uma tela do sistema com um interruptor só)
        if (!activity.packageManager.canRequestPackageInstalls()) {
            principal.post {
                activity.startActivity(
                    Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + activity.packageName))
                )
            }
            responder(pedido, JSONObject().put("permissao", true))
            return
        }
        trabalho.execute {
            try {
                val pasta = File(activity.cacheDir, "atualizacao").apply { mkdirs() }
                val apk = File(pasta, "espalhe.apk")
                baixar(APK, apk) { p -> progresso(pedido, p) }
                val uri = FileProvider.getUriForFile(activity, Ponte.AUTORIDADE_ATUALIZACAO, apk)
                principal.post {
                    activity.startActivity(Intent(Intent.ACTION_VIEW).apply {
                        setDataAndType(uri, "application/vnd.android.package-archive")
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
                    })
                }
                responder(pedido, JSONObject().put("ok", true))
            } catch (e: Exception) {
                responder(pedido, JSONObject().put("erro",
                    if ((e.message ?: "").contains("resolve host")) "Sem internet agora."
                    else "Não consegui baixar a atualização (${e.message})."))
            }
        }
    }

    private fun abrir(url: String): HttpURLConnection {
        var atual = url
        // o GitHub responde o download com redirecionamentos; segue até 5, só https
        repeat(5) {
            val c = URL(atual).openConnection() as HttpURLConnection
            c.instanceFollowRedirects = false
            c.connectTimeout = 20000
            c.readTimeout = 60000
            val codigo = c.responseCode
            if (codigo in 300..399) {
                val destino = c.getHeaderField("Location") ?: throw Exception("redirecionamento vazio")
                c.disconnect()
                if (!destino.startsWith("https://")) throw Exception("endereço inseguro")
                atual = destino
            } else {
                if (codigo >= 400) throw Exception("HTTP $codigo")
                return c
            }
        }
        throw Exception("redirecionamentos demais")
    }

    private fun baixarTexto(url: String): String {
        val c = abrir(url)
        return c.inputStream.bufferedReader().use { it.readText() }.also { c.disconnect() }
    }

    private fun baixar(url: String, destino: File, andamento: (Int) -> Unit) {
        val c = abrir(url)
        val total = c.contentLengthLong
        val temp = File(destino.parentFile, destino.name + ".parte")
        c.inputStream.use { ent ->
            temp.outputStream().use { sai ->
                val buf = ByteArray(64 * 1024)
                var lido = 0L
                var ultimo = -1
                while (true) {
                    val n = ent.read(buf)
                    if (n < 0) break
                    sai.write(buf, 0, n)
                    lido += n
                    val p = if (total > 0) (lido * 100 / total).toInt() else 0
                    if (p != ultimo) { ultimo = p; andamento(p) }
                }
            }
        }
        c.disconnect()
        destino.delete()
        temp.renameTo(destino)
    }

    private fun progresso(pedido: Int, p: Int) {
        principal.post {
            web.evaluateJavascript("window.__progresso && window.__progresso($pedido, $p)", null)
        }
    }

    private fun responder(pedido: Int, json: JSONObject) {
        principal.post {
            web.evaluateJavascript("window.__resposta && window.__resposta($pedido, $json)", null)
        }
    }

    fun encerrar() = trabalho.shutdown()

    companion object {
        private const val BASE = "https://github.com/bahiense/projetoTeste/releases/download/espalhe-apk-latest/"
        private const val VERSAO = BASE + "espalhe-versao.json"
        private const val APK = BASE + "espalhe.apk"
    }
}
