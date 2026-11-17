package com.bahiense.politica

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.provider.OpenableColumns
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.core.content.FileProvider
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.Collections
import java.util.concurrent.Executors

/**
 * O que a página (assets/app.js) pede ao lado nativo, pelo objeto `Politica`.
 *
 * Cada lição mora numa pasta própria, files/aulas/<id>/:
 *   licao.pdf   o PDF escolhido
 *   meta.json   nome, título, estado e o id do PDF na Anthropic
 *   dossie.md   a pesquisa da etapa 1
 *   aula.json   a aula pronta da etapa 2
 *
 * A chave da API fica só aqui, cifrada (Cofre.kt): a página nunca a vê.
 *
 * O trabalho com o Claude roda em threads que pertencem ao processo, não à
 * tela: se a Activity for recriada, a aula continua sendo escrita e avisa a
 * página nova (Ponte.atual).
 */
class Ponte(private val activity: MainActivity, private val web: WebView) {

    private val principal = Handler(Looper.getMainLooper())
    private val cofre = Cofre(activity, "chave")

    init { atual = this }

    // ------------------------------------------------------------ a chave

    @JavascriptInterface
    fun temChave(): Boolean = !cofre.getString(CHAVE, null).isNullOrBlank()

    /** Confere a chave na Anthropic e guarda. Resposta em __chave({pedido, ok}|{erro}). */
    @JavascriptInterface
    fun salvarChave(pedido: Int, chave: String) {
        val k = chave.trim()
        if (!k.startsWith("sk-ant-")) {
            responder(pedido, JSONObject().put("erro", "A chave da API começa com sk-ant-. Copie de novo em console.anthropic.com → API Keys."))
            return
        }
        trabalho.execute {
            try {
                Professor(k).testar()
                cofre.put(CHAVE, k)
                responder(pedido, JSONObject().put("ok", true))
            } catch (e: Exception) {
                responder(pedido, JSONObject().put("erro", mensagem(e)))
            }
        }
    }

    @JavascriptInterface
    fun apagarChave() = cofre.remove(CHAVE)

    private fun professor(): Professor {
        val k = cofre.getString(CHAVE, null)
        if (k.isNullOrBlank()) throw Professor.ErroProfessor("Falta a chave da API. Abra Ajustes.", chaveRuim = true)
        return Professor(k)
    }

    // ------------------------------------------------------------ lições

    @JavascriptInterface
    fun escolherPdf() = activity.abrirSeletorPdf()

    /** O seletor voltou: copia o PDF para a pasta do app e avisa a página. */
    fun pdfEscolhido(uri: Uri?) {
        if (uri == null) { chamar("__pdf", JSONObject().put("cancelado", true)); return }
        trabalho.execute {
            try {
                val nome = nomeDe(uri)
                val id = System.currentTimeMillis().toString(36)
                val pasta = pasta(id).apply { mkdirs() }
                val pdf = File(pasta, "licao.pdf")
                activity.contentResolver.openInputStream(uri)!!.use { ent ->
                    pdf.outputStream().use { ent.copyTo(it) }
                }
                val cabeca = pdf.inputStream().use { val b = ByteArray(5); it.read(b); String(b) }
                if (cabeca != "%PDF-") {
                    pasta.deleteRecursively()
                    chamar("__pdf", JSONObject().put("erro", "Esse arquivo não é um PDF."))
                    return@execute
                }
                if (pdf.length() > LIMITE_PDF) {
                    pasta.deleteRecursively()
                    chamar("__pdf", JSONObject().put("erro", "O PDF passa de 32 MB, o limite da Anthropic. Divida o arquivo em partes."))
                    return@execute
                }
                val meta = JSONObject()
                    .put("id", id)
                    .put("nome", nome)
                    .put("titulo", nome.removeSuffix(".pdf").removeSuffix(".PDF").replace('-', ' ').replace('_', ' '))
                    .put("criada", System.currentTimeMillis())
                    .put("tamanho", pdf.length())
                    .put("estado", "nova")
                salvarMeta(id, meta)
                chamar("__pdf", meta)
            } catch (e: Exception) {
                chamar("__pdf", JSONObject().put("erro", "Não consegui abrir o PDF (${e.message})."))
            }
        }
    }

    @JavascriptInterface
    fun listar(): String {
        val lista = JSONArray()
        (raiz().listFiles() ?: emptyArray())
            .mapNotNull { lerMeta(it.name) }
            .sortedByDescending { it.optLong("criada") }
            .forEach { m ->
                // "gerando" sem thread viva = o app foi fechado no meio
                if (m.optString("estado") == "gerando" && m.optString("id") !in gerando)
                    m.put("estado", "interrompida")
                lista.put(m)
            }
        return lista.toString()
    }

    @JavascriptInterface
    fun ler(id: String): String = arquivo(id, "aula.json")?.readText() ?: ""

    @JavascriptInterface
    fun temDossie(id: String): Boolean = arquivo(id, "dossie.md") != null

    @JavascriptInterface
    fun dossie(id: String): String = arquivo(id, "dossie.md")?.readText() ?: ""

    @JavascriptInterface
    fun renomear(id: String, titulo: String) {
        val m = lerMeta(id) ?: return
        salvarMeta(id, m.put("titulo", titulo.trim().take(120)))
    }

    @JavascriptInterface
    fun apagar(id: String) {
        if (!valido(id)) return
        val arquivoId = lerMeta(id)?.optString("arquivoId").orEmpty()
        pasta(id).deleteRecursively()
        if (arquivoId.isNotEmpty()) trabalho.execute {
            try { professor().apagarPdf(arquivoId) } catch (_: Exception) { }
        }
    }

    /** Abre o PDF original no leitor de PDF do celular. */
    @JavascriptInterface
    fun abrirPdf(id: String) {
        val pdf = arquivo(id, "licao.pdf") ?: run {
            chamar("__aviso", JSONObject().put("texto", "Esta aula veio do Claude: o PDF original ficou no aparelho em que você o escolheu."))
            return
        }
        val uri = FileProvider.getUriForFile(activity, AUTORIDADE, pdf)
        principal.post {
            try {
                activity.startActivity(Intent(Intent.ACTION_VIEW).apply {
                    setDataAndType(uri, "application/pdf")
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                })
            } catch (e: ActivityNotFoundException) {
                chamar("__aviso", JSONObject().put("texto", "Nenhum leitor de PDF instalado."))
            }
        }
    }

    // ------------------------------------------------------------ gerar a aula

    @JavascriptInterface
    fun gerar(id: String) {
        if (!valido(id) || id in gerando) return
        val meta = lerMeta(id) ?: return
        gerando.add(id)
        meta.put("estado", "gerando")
        meta.remove("erro")
        salvarMeta(id, meta)
        principal.post { activity.trabalhoMudou() }

        trabalho.execute {
            val andamento = Professor.Andamento { t -> evento(id, "andamento", t) }
            try {
                val prof = professor()
                var arquivoId = garantirPdf(id, prof, andamento)

                var dossie = arquivo(id, "dossie.md")?.readText()
                if (dossie.isNullOrBlank()) {
                    dossie = tentandoDeNovo(id, prof, andamento, arquivoId) { aid ->
                        arquivoId = aid
                        prof.pesquisar(aid, andamento)
                    }
                    File(pasta(id), "dossie.md").writeText(dossie)
                }
                evento(id, "andamento", "Dossiê pronto. Agora a aula…")

                val aula = tentandoDeNovo(id, prof, andamento, arquivoId) { aid ->
                    prof.montarAula(aid, dossie, andamento)
                }
                File(pasta(id), "aula.json").writeText(aula)
                val titulo = JSONObject(aula).optString("titulo")
                val m = lerMeta(id) ?: JSONObject()
                if (titulo.isNotBlank()) m.put("titulo", titulo)
                salvarMeta(id, m.put("estado", "pronta").put("atualizada", System.currentTimeMillis()))
                activity.copias.copiaAutomatica()
                evento(id, "pronta", "")
            } catch (e: Exception) {
                lerMeta(id)?.let { salvarMeta(id, it.put("estado", "erro").put("erro", mensagem(e))) }
                evento(id, "erro", mensagem(e), (e as? Professor.ErroProfessor)?.chaveRuim == true)
            } finally {
                gerando.remove(id)
                principal.post { atual?.activity?.trabalhoMudou() }
            }
        }
    }

    /** Prepara a aula de novo, do zero (nova pesquisa). */
    @JavascriptInterface
    fun refazer(id: String) {
        if (!valido(id) || id in gerando) return
        File(pasta(id), "dossie.md").delete()
        File(pasta(id), "aula.json").delete()
        gerar(id)
    }

    @JavascriptInterface
    fun emAndamento(): String = JSONArray(gerando.toList()).toString()

    /** Sobe o PDF para a Anthropic, se ainda não subiu. */
    private fun garantirPdf(id: String, prof: Professor, andamento: Professor.Andamento): String {
        val meta = lerMeta(id) ?: throw Professor.ErroProfessor("A lição sumiu.")
        meta.optString("arquivoId").takeIf { it.isNotEmpty() }?.let { return it }
        andamento.aviso("Enviando o PDF (${meta.optLong("tamanho") / 1_000_000} MB)…")
        val novo = prof.enviarPdf(File(pasta(id), "licao.pdf"))
        salvarMeta(id, meta.put("arquivoId", novo))
        return novo
    }

    /** Se o PDF sumiu da Anthropic, sobe de novo e repete uma vez. */
    private fun <T> tentandoDeNovo(
        id: String, prof: Professor, andamento: Professor.Andamento, arquivoId: String,
        tarefa: (String) -> T
    ): T = try {
        tarefa(arquivoId)
    } catch (e: Professor.PdfSumiu) {
        lerMeta(id)?.let { salvarMeta(id, it.put("arquivoId", "")) }
        tarefa(garantirPdf(id, prof, andamento))
    }

    // ------------------------------------------------------------ conversa

    /**
     * Uma fala do professor. Os pedaços do texto chegam em __fala(pedido, {pedaco}),
     * e o fim em __fala(pedido, {fim}) ou {erro}.
     */
    @JavascriptInterface
    fun conversar(pedido: Int, id: String, modo: String, contexto: String, mensagens: String) {
        if (!valido(id)) return
        trabalho.execute {
            try {
                val prof = professor()
                var arquivoId = garantirPdf(id, prof) { t -> fala(pedido, JSONObject().put("andamento", t)) }
                val dossie = arquivo(id, "dossie.md")?.readText().orEmpty()
                val lista = JSONArray(mensagens)
                val buffer = StringBuilder()
                var ultimo = 0L
                val enviar = {
                    if (buffer.isNotEmpty()) {
                        fala(pedido, JSONObject().put("pedaco", buffer.toString()))
                        buffer.setLength(0)
                    }
                }
                val texto = tentandoDeNovo(id, prof, { }, arquivoId) { aid ->
                    arquivoId = aid
                    prof.conversar(aid, dossie, modo, contexto, lista, { p ->
                        synchronized(buffer) {
                            buffer.append(p)
                            val agora = System.currentTimeMillis()
                            // junta os pedaços: um evaluateJavascript por palavra trava a tela
                            if (agora - ultimo > 120) { ultimo = agora; enviar() }
                        }
                    }) { t -> fala(pedido, JSONObject().put("andamento", t)) }
                }
                synchronized(buffer) { enviar() }
                fala(pedido, JSONObject().put("fim", texto))
            } catch (e: Exception) {
                fala(pedido, JSONObject().put("erro", mensagem(e))
                    .put("chaveRuim", (e as? Professor.ErroProfessor)?.chaveRuim == true))
            }
        }
    }

    // ------------------------------------------------------------ arquivos

    private fun raiz() = File(activity.filesDir, "aulas").apply { mkdirs() }
    private fun valido(id: String) = id.matches(Regex("^[a-z0-9]{1,20}$"))
    private fun pasta(id: String) = File(raiz(), id)
    private fun arquivo(id: String, nome: String): File? =
        if (valido(id)) File(pasta(id), nome).takeIf { it.exists() } else null

    private fun lerMeta(id: String): JSONObject? = try {
        arquivo(id, "meta.json")?.readText()?.let { JSONObject(it) }
    } catch (e: Exception) { null }

    @Synchronized
    private fun salvarMeta(id: String, meta: JSONObject) {
        if (!pasta(id).exists()) return
        val tmp = File(pasta(id), "meta.json.tmp")
        tmp.writeText(meta.toString())
        tmp.renameTo(File(pasta(id), "meta.json"))
    }

    private fun nomeDe(uri: Uri): String {
        activity.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { c ->
            if (c.moveToFirst()) c.getString(0)?.let { return it }
        }
        return "licao.pdf"
    }

    private fun mensagem(e: Exception): String = when (e) {
        is Professor.ErroProfessor -> e.message ?: "Erro."
        is java.net.UnknownHostException -> "Sem internet agora."
        is java.io.IOException -> "A conexão caiu (${e.message}). Tente de novo: o que já ficou pronto não se perde."
        else -> "Deu errado: ${e.javaClass.simpleName} ${e.message ?: ""}".trim()
    }

    // ------------------------------------------------------------ avisar a página

    private fun evento(id: String, tipo: String, texto: String, chaveRuim: Boolean = false) =
        atual?.chamar("__evento", JSONObject().put("id", id).put("tipo", tipo).put("texto", texto).put("chaveRuim", chaveRuim))

    private fun fala(pedido: Int, json: JSONObject) =
        atual?.chamar("__fala", JSONObject(json.toString()).put("pedido", pedido))

    private fun responder(pedido: Int, json: JSONObject) =
        chamar("__chave", json.put("pedido", pedido))

    fun chamar(funcao: String, json: JSONObject) {
        principal.post {
            if (atual === this) web.evaluateJavascript("window.$funcao && window.$funcao($json)", null)
        }
    }

    fun encerrar() {
        if (atual === this) atual = null
    }

    companion object {
        const val AUTORIDADE = "com.bahiense.politica.arquivos"
        private const val CHAVE = "anthropic"
        private const val LIMITE_PDF = 32L * 1024 * 1024

        /** A ponte da tela aberta agora (a que recebe os avisos). */
        @Volatile var atual: Ponte? = null

        /** Lições sendo escritas neste momento, no processo inteiro. */
        val gerando: MutableSet<String> = Collections.synchronizedSet(mutableSetOf())

        /** Do processo, não da tela: sobrevive à Activity ser recriada. */
        private val trabalho = Executors.newCachedThreadPool()
    }
}
