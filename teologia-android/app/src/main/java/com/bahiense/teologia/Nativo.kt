package com.bahiense.teologia

import android.content.ContentUris
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.core.content.FileProvider
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.concurrent.Executors

/**
 * O que a página pede ao lado nativo, pelo objeto `TeologiaNativo`.
 *
 * 1. Guardar: cada documento da aula (o mesmo que, no Claude, fica no banco do
 *    artifact) é um arquivo files/banco/<chave>.json. A página lê e grava por
 *    chave; a importação do arquivo de cópia é feita pela própria página.
 *
 * 2. Receber aulas: o Professor de Teologia no Claude baixa "teologia-*.json".
 *    Elas chegam por "Importar aula" (seletor de arquivos do sistema), por
 *    "Abrir com" e por "Compartilhar". No Android 11+ não dá para ler a pasta
 *    Downloads inteira, por isso não há varredura de pasta.
 *
 * 3. Cópias para sempre: depois de cada importação, a página monta o pacote
 *    com todas as aulas e o app regrava "teologia-copia-do-app.json" em
 *    Downloads (sobrevive a desinstalar). "Enviar cópia" abre o menu de
 *    compartilhar (Google Drive, e-mail…), para sobreviver à perda do celular.
 */
class Nativo(private val activity: MainActivity, private val web: WebView) {

    private val principal = Handler(Looper.getMainLooper())
    private val prefs = activity.getSharedPreferences("copias", Context.MODE_PRIVATE)
    @Volatile private var paginaPronta = false
    @Volatile private var recebido: String? = null
    private var pendente: Uri? = null

    // ------------------------------------------------------------ o banco

    private fun banco() = File(activity.filesDir, "banco").apply { mkdirs() }
    private fun valida(chave: String) = chave.matches(Regex("^[a-z0-9-]{1,80}$"))
    private fun arquivo(chave: String) = File(banco(), "$chave.json")

    @JavascriptInterface
    fun ler(chave: String): String {
        if (!valida(chave)) return ""
        val f = arquivo(chave)
        return if (f.exists()) f.readText() else ""
    }

    @JavascriptInterface
    @Synchronized
    fun gravar(chave: String, json: String): Boolean {
        if (!valida(chave)) return false
        return try {
            // grava ao lado e troca: um corte de energia no meio não estraga o que havia
            val tmp = File(banco(), "$chave.json.tmp")
            tmp.writeText(json)
            tmp.renameTo(arquivo(chave))
        } catch (e: Exception) { false }
    }

    @JavascriptInterface
    fun apagar(chave: String) { if (valida(chave)) arquivo(chave).delete() }

    @JavascriptInterface
    fun apagarPrefixo(prefixo: String) {
        if (!valida(prefixo.trimEnd('-').ifEmpty { "x" })) return
        banco().listFiles()?.filter { it.name.startsWith(prefixo) }?.forEach { it.delete() }
    }

    /** Os "m-<id>.json": a lista de aulas. */
    @JavascriptInterface
    fun metas(): String {
        val lista = JSONArray()
        banco().listFiles()?.filter { it.name.startsWith("m-") && it.name.endsWith(".json") }?.forEach {
            try { lista.put(JSONObject(it.readText())) } catch (_: Exception) { }
        }
        return lista.toString()
    }

    // ------------------------------------------------------------ receber aulas

    @JavascriptInterface
    fun importarArquivo() = activity.escolherArquivo()

    /** A página terminou de carregar: entrega o arquivo que chegou antes dela. */
    @JavascriptInterface
    fun pronto() {
        paginaPronta = true
        val u = synchronized(this) { pendente.also { pendente = null } }
        if (u != null) arquivoChegou(u)
    }

    /** Um arquivo veio do seletor, de "Abrir com" ou de "Compartilhar". */
    fun arquivoChegou(uri: Uri) {
        if (!paginaPronta) { synchronized(this) { pendente = uri }; return }
        trabalho.execute {
            try {
                val texto = activity.contentResolver.openInputStream(uri)!!.use { it.readBytes().toString(Charsets.UTF_8) }
                recebido = texto
                // o texto pode ter vários MB: a página o busca por pegarRecebido(), sem passar por evaluateJavascript
                principal.post { web.evaluateJavascript("window.__arquivoRecebido && window.__arquivoRecebido(TeologiaNativo.pegarRecebido())", null) }
            } catch (e: Exception) {
                avisar("__erroArquivo", JSONObject.quote("Não consegui ler o arquivo (${e.javaClass.simpleName}: ${e.message})."))
            }
        }
    }

    @JavascriptInterface
    fun pegarRecebido(): String = (recebido ?: "").also { recebido = null }

    // ------------------------------------------------------------ cópias

    /** Regrava a cópia em Downloads (chamada pela página depois de cada importação). */
    @JavascriptInterface
    fun copiaAutomatica(pacote: String) {
        trabalho.execute { gravarEmDownloads(pacote) }
    }

    @JavascriptInterface
    fun salvarCopia(pacote: String) {
        trabalho.execute {
            val ok = gravarEmDownloads(pacote)
            avisar("__copia", JSONObject().put("ok", ok).put("texto",
                if (ok) "Cópia salva em Downloads ($NOME_COPIA)." else "Não consegui salvar a cópia em Downloads.").toString())
        }
    }

    @JavascriptInterface
    fun ultimaCopia(): Long = prefs.getLong(CHAVE_ULTIMA, 0)

    private fun gravarEmDownloads(pacote: String): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return false
        return try {
            val dados = pacote.toByteArray()
            val res = activity.contentResolver
            val col = MediaStore.Downloads.EXTERNAL_CONTENT_URI
            var uri: Uri? = null
            // só acha a cópia que este app criou (depois de reinstalar, cria outra ao lado)
            res.query(col, arrayOf(MediaStore.Downloads._ID), MediaStore.Downloads.DISPLAY_NAME + " = ?", arrayOf(NOME_COPIA), null)?.use { c ->
                if (c.moveToFirst()) uri = ContentUris.withAppendedId(col, c.getLong(0))
            }
            if (uri != null) {
                res.openOutputStream(uri!!, "wt")?.use { it.write(dados) }
            } else {
                val v = ContentValues().apply {
                    put(MediaStore.Downloads.DISPLAY_NAME, NOME_COPIA)
                    put(MediaStore.Downloads.MIME_TYPE, "application/json")
                    put(MediaStore.Downloads.IS_PENDING, 1)
                }
                val novo = res.insert(col, v) ?: return false
                res.openOutputStream(novo)?.use { it.write(dados) }
                v.clear(); v.put(MediaStore.Downloads.IS_PENDING, 0)
                res.update(novo, v, null, null)
            }
            prefs.edit().putLong(CHAVE_ULTIMA, System.currentTimeMillis()).apply()
            true
        } catch (e: Exception) {
            false
        }
    }

    /** Abre o menu de compartilhar com a cópia: daí, Google Drive, e-mail, WhatsApp… */
    @JavascriptInterface
    fun enviarCopia(pacote: String) {
        trabalho.execute {
            try {
                val pasta = File(activity.cacheDir, "copia").apply { mkdirs() }
                val arq = File(pasta, NOME_COPIA)
                arq.writeText(pacote)
                val uri = FileProvider.getUriForFile(activity, AUTORIDADE, arq)
                principal.post {
                    val envio = Intent(Intent.ACTION_SEND).apply {
                        type = "application/json"
                        putExtra(Intent.EXTRA_STREAM, uri)
                        putExtra(Intent.EXTRA_SUBJECT, "Cópia das aulas — Professor de Teologia")
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    }
                    activity.startActivity(Intent.createChooser(envio, "Guardar a cópia das aulas"))
                }
            } catch (e: Exception) {
                avisar("__copia", JSONObject().put("ok", false).put("texto", "Não consegui preparar a cópia.").toString())
            }
        }
    }

    // ------------------------------------------------------------ miúdos

    private fun avisar(funcao: String, argumento: String) {
        principal.post { web.evaluateJavascript("window.$funcao && window.$funcao($argumento)", null) }
    }

    companion object {
        const val AUTORIDADE = "com.bahiense.teologia.arquivos"
        const val NOME_COPIA = "teologia-copia-do-app.json"
        private const val CHAVE_ULTIMA = "ultimaCopia"
        private val trabalho = Executors.newSingleThreadExecutor()
    }
}
