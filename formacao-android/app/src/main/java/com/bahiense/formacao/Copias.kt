package com.bahiense.formacao

import android.content.ContentUris
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.DocumentsContract
import android.provider.MediaStore
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.core.content.FileProvider
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.concurrent.Executors

/**
 * As aulas que atravessam do Claude para o app, e as cópias que fazem elas
 * durarem para sempre. Objeto `PoliticaCopias` na página.
 *
 * O mesmo desenho do app da Bíblia:
 *
 *  - O Formação do Pensador dentro do Claude (o artifact) escreve as aulas
 *    pelo plano da pessoa e as baixa como arquivo "politica-*.json" na pasta
 *    Downloads. O app não alcança o Claude, mas alcança essa pasta: a pessoa a
 *    aponta uma vez no seletor do sistema e, a partir daí, toda abertura traz
 *    as aulas novas sozinha.
 *
 *  - Cópia automática: depois de cada aula que entra, o app regrava
 *    "formacao-copia-do-app.json" em Downloads, com todas as aulas. Downloads é
 *    da pessoa, não do app: sobrevive a desinstalar. Ao reinstalar e apontar a
 *    pasta de novo, essa cópia entra como qualquer outro pacote.
 *
 *  - Para sobreviver à perda do celular: "Enviar cópia" abre o menu de
 *    compartilhar do Android com o arquivo, e a pessoa escolhe o Google Drive.
 *
 * O formato do arquivo é o mesmo nos dois lados:
 * {"formato": "professor-de-politica", "versao": 1, "aulas": [{id, titulo, nome, criada, atualizada, aula}]}
 */
class Copias(private val activity: MainActivity, private val web: WebView) {

    private val principal = Handler(Looper.getMainLooper())
    private val prefs = activity.getSharedPreferences("copias", Context.MODE_PRIVATE)

    // ------------------------------------------------------------ a pasta

    @JavascriptInterface
    fun pastaTem(): Boolean = pasta() != null

    @JavascriptInterface
    fun pastaEscolher() = activity.escolherPasta()

    /** O MainActivity guardou a pasta escolhida; avisa a página e já importa. */
    fun pastaEscolhida(uri: Uri?) {
        if (uri != null) prefs.edit().putString(CHAVE_PASTA, uri.toString()).apply()
        chamar("__pasta", JSONObject().put("ok", uri != null))
    }

    private fun pasta(): Uri? {
        val txt = prefs.getString(CHAVE_PASTA, null) ?: return null
        val uri = Uri.parse(txt)
        // a permissão pode ter sido revogada nos ajustes do sistema
        val vale = activity.contentResolver.persistedUriPermissions.any { it.uri == uri && it.isReadPermission }
        return if (vale) uri else null
    }

    // ------------------------------------------------------------ importar

    /**
     * Procura arquivos "politica-*.json" na pasta apontada e traz as aulas que
     * ainda não estão no app (ou que estão numa versão mais nova). Só relê
     * arquivo que mudou desde a última vez. Resposta em __importou({novas, erro}).
     */
    @JavascriptInterface
    fun importarDaPasta() {
        trabalho.execute {
            val raiz = pasta()
            if (raiz == null) { chamar("__importou", JSONObject().put("novas", 0).put("semPasta", true)); return@execute }
            var novas = 0
            try {
                val vistos = JSONObject(prefs.getString(CHAVE_VISTOS, "{}") ?: "{}")
                val achados = mutableListOf<Triple<String, String, Long>>()
                // olha também as subpastas (o app do Claude pode salvar em Download/Claude)
                fun varrer(docPai: String, nivel: Int) {
                    activity.contentResolver.query(
                        DocumentsContract.buildChildDocumentsUriUsingTree(raiz, docPai),
                        arrayOf(
                            DocumentsContract.Document.COLUMN_DOCUMENT_ID,
                            DocumentsContract.Document.COLUMN_DISPLAY_NAME,
                            DocumentsContract.Document.COLUMN_LAST_MODIFIED,
                            DocumentsContract.Document.COLUMN_MIME_TYPE
                        ), null, null, null
                    )?.use { c ->
                        while (c.moveToNext()) {
                            val nome = c.getString(1) ?: continue
                            if (c.getString(3) == DocumentsContract.Document.MIME_TYPE_DIR) {
                                if (nivel < 2) varrer(c.getString(0), nivel + 1)
                            } else if ((nome.startsWith("formacao-") || nome.startsWith("politica-")) && (nome.endsWith(".json") || nome.endsWith(".txt"))) {
                                achados.add(Triple(c.getString(0), nome, c.getLong(2)))
                            }
                        }
                    }
                }
                varrer(DocumentsContract.getTreeDocumentId(raiz), 0)
                for ((docId, nome, quando) in achados) {
                    val marca = "$nome@$quando"
                    if (vistos.optBoolean(marca)) continue
                    val uri = DocumentsContract.buildDocumentUriUsingTree(raiz, docId)
                    val texto = activity.contentResolver.openInputStream(uri)?.use { it.readBytes().toString(Charsets.UTF_8) } ?: continue
                    novas += importarTexto(texto)
                    vistos.put(marca, true)
                }
                prefs.edit().putString(CHAVE_VISTOS, vistos.toString()).apply()
                if (novas > 0) copiaAutomatica()
                chamar("__importou", JSONObject().put("novas", novas))
            } catch (e: Exception) {
                chamar("__importou", JSONObject().put("novas", novas).put("erro", "Não consegui ler a pasta (${e.message})."))
            }
        }
    }

    /** Escolher um arquivo de cópia à mão (de qualquer lugar, inclusive do Drive). */
    @JavascriptInterface
    fun importarArquivo() = activity.escolherArquivoCopia()

    fun arquivoEscolhido(uri: Uri?) {
        if (uri == null) return
        trabalho.execute {
            try {
                val texto = activity.contentResolver.openInputStream(uri)!!.use { it.readBytes().toString(Charsets.UTF_8) }
                val n = importarTexto(texto)
                if (n > 0) copiaAutomatica()
                chamar("__importou", JSONObject().put("novas", n).put("manual", true))
            } catch (e: org.json.JSONException) {
                chamar("__importou", JSONObject().put("novas", 0).put("erro", "Esse arquivo não é uma aula do Formação do Pensador (ou veio cortado no download)."))
            } catch (e: IllegalArgumentException) {
                chamar("__importou", JSONObject().put("novas", 0).put("erro", "Esse arquivo não é uma aula do Formação do Pensador."))
            } catch (e: Exception) {
                chamar("__importou", JSONObject().put("novas", 0).put("erro", "Não consegui ler o arquivo (${e.javaClass.simpleName}: ${e.message})."))
            }
        }
    }

    /** Grava as aulas de um arquivo de cópia. Devolve quantas entraram ou mudaram. */
    @Synchronized
    private fun importarTexto(texto: String): Int {
        val pacote = JSONObject(texto)
        if (pacote.optString("formato") != "professor-de-politica") throw IllegalArgumentException("formato")
        val aulas = pacote.optJSONArray("aulas") ?: return 0
        var n = 0
        for (i in 0 until aulas.length()) {
            val a = aulas.getJSONObject(i)
            val id = a.optString("id")
            val aula = a.optJSONObject("aula") ?: continue
            if (!id.matches(Regex("^[a-z0-9]{1,20}$")) || !aula.has("modulos")) continue
            val pasta = File(raiz(), id)
            val metaArq = File(pasta, "meta.json")
            val atualizada = a.optLong("atualizada", a.optLong("criada"))
            if (metaArq.exists()) {
                val antiga = try { JSONObject(metaArq.readText()) } catch (e: Exception) { JSONObject() }
                // a aula já está aqui, e não mais velha que a do arquivo
                if (antiga.optString("estado") == "pronta" && antiga.optLong("atualizada", antiga.optLong("criada")) >= atualizada) continue
            }
            pasta.mkdirs()
            val material = aula.optString("material")
            aula.remove("material")
            File(pasta, "aula.json").writeText(aula.toString())
            if (material.isNotBlank()) File(pasta, "dossie.md").writeText(material)
            val meta = JSONObject()
                .put("id", id)
                .put("titulo", a.optString("titulo").ifBlank { aula.optString("titulo") })
                .put("nome", a.optString("nome"))
                .put("criada", a.optLong("criada", System.currentTimeMillis()))
                .put("atualizada", atualizada)
                .put("estado", "pronta")
                .put("origem", "claude")
            metaArq.writeText(meta.toString())
            n++
        }
        return n
    }

    // ------------------------------------------------------------ cópias

    /** Todas as aulas prontas, no formato de cópia. */
    private fun pacoteCompleto(): String {
        val aulas = JSONArray()
        (raiz().listFiles() ?: emptyArray()).sortedBy { it.name }.forEach { p ->
            try {
                val meta = JSONObject(File(p, "meta.json").readText())
                val aulaArq = File(p, "aula.json")
                if (!aulaArq.exists()) return@forEach
                val aula = JSONObject(aulaArq.readText())
                File(p, "dossie.md").takeIf { it.exists() }?.let { aula.put("material", it.readText()) }
                aulas.put(
                    JSONObject().put("id", meta.optString("id")).put("titulo", meta.optString("titulo"))
                        .put("nome", meta.optString("nome")).put("criada", meta.optLong("criada"))
                        .put("atualizada", meta.optLong("atualizada", meta.optLong("criada"))).put("aula", aula)
                )
            } catch (_: Exception) { }
        }
        return JSONObject().put("formato", "professor-de-politica").put("versao", 1)
            .put("gerado", System.currentTimeMillis()).put("aulas", aulas).toString()
    }

    /** Regrava a cópia automática em Downloads (sobrescreve a anterior). */
    fun copiaAutomatica(): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return false
        return try {
            val dados = pacoteCompleto().toByteArray()
            val res = activity.contentResolver
            // dentro da pasta apontada a cópia é da pessoa, não do app: sobrescreve mesmo depois de reinstalar
            pasta()?.let { raiz ->
                if (activity.contentResolver.persistedUriPermissions.any { it.uri == raiz && it.isWritePermission }) {
                    val existente = acharNaPasta(raiz, NOME_COPIA)
                    val uri = existente ?: DocumentsContract.createDocument(
                        res, DocumentsContract.buildDocumentUriUsingTree(raiz, DocumentsContract.getTreeDocumentId(raiz)),
                        "application/json", NOME_COPIA
                    )
                    if (uri != null) {
                        res.openOutputStream(uri, "wt")?.use { it.write(dados) }
                        marcarCopia(); return true
                    }
                }
            }
            val col = MediaStore.Downloads.EXTERNAL_CONTENT_URI
            var uri: Uri? = null
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
            marcarCopia()
            true
        } catch (e: Exception) {
            false
        }
    }

    private fun marcarCopia() = prefs.edit().putLong(CHAVE_ULTIMA, System.currentTimeMillis()).apply()

    private fun acharNaPasta(raiz: Uri, nome: String): Uri? {
        val filhos = DocumentsContract.buildChildDocumentsUriUsingTree(raiz, DocumentsContract.getTreeDocumentId(raiz))
        activity.contentResolver.query(
            filhos, arrayOf(DocumentsContract.Document.COLUMN_DOCUMENT_ID, DocumentsContract.Document.COLUMN_DISPLAY_NAME),
            null, null, null
        )?.use { c ->
            while (c.moveToNext()) if (c.getString(1) == nome) return DocumentsContract.buildDocumentUriUsingTree(raiz, c.getString(0))
        }
        return null
    }

    @JavascriptInterface
    fun salvarCopia() {
        trabalho.execute {
            val ok = copiaAutomatica()
            chamar("__copia", JSONObject().put("ok", ok).put("texto",
                if (ok) "Cópia salva em Downloads ($NOME_COPIA)." else "Não consegui salvar a cópia em Downloads."))
        }
    }

    @JavascriptInterface
    fun ultimaCopia(): Long = prefs.getLong(CHAVE_ULTIMA, 0)

    /** Abre o menu de compartilhar com a cópia: daí, Google Drive, e-mail, WhatsApp… */
    @JavascriptInterface
    fun enviarCopia() {
        trabalho.execute {
            try {
                val pastaCache = File(activity.cacheDir, "copia").apply { mkdirs() }
                val arq = File(pastaCache, NOME_COPIA)
                arq.writeText(pacoteCompleto())
                val uri = FileProvider.getUriForFile(activity, Ponte.AUTORIDADE, arq)
                principal.post {
                    val envio = Intent(Intent.ACTION_SEND).apply {
                        type = "application/json"
                        putExtra(Intent.EXTRA_STREAM, uri)
                        putExtra(Intent.EXTRA_SUBJECT, "Cópia das aulas — Formação do Pensador")
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    }
                    activity.startActivity(Intent.createChooser(envio, "Guardar a cópia das aulas"))
                }
            } catch (e: Exception) {
                chamar("__copia", JSONObject().put("ok", false).put("texto", "Não consegui preparar a cópia."))
            }
        }
    }

    // ------------------------------------------------------------ miúdos

    private fun raiz() = File(activity.filesDir, "aulas").apply { mkdirs() }

    private fun chamar(funcao: String, json: JSONObject) {
        principal.post { web.evaluateJavascript("window.$funcao && window.$funcao($json)", null) }
    }

    fun encerrar() {}

    companion object {
        const val NOME_COPIA = "formacao-copia-do-app.json"
        private const val CHAVE_PASTA = "pasta"
        private const val CHAVE_VISTOS = "vistos"
        private const val CHAVE_ULTIMA = "ultimaCopia"
        private val trabalho = Executors.newSingleThreadExecutor()
    }
}
