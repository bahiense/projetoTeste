package com.bahiense.biblia

import android.app.Activity
import android.content.ContentUris
import android.content.ContentValues
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.widget.Toast
import androidx.core.content.FileProvider
import java.io.BufferedOutputStream
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.io.OutputStream

/**
 * O que o WebView não faz e a página precisa: salvar um arquivo e compartilhar
 * um texto.
 *
 * Salvar: no navegador o backup sai de um blob com <a download>. O WebView
 * ignora blob: — o toque no botão simplesmente não faria nada, que é o pior
 * jeito de falhar num botão chamado "backup". Aqui o conteúdo vem como texto
 * pelo JavaScript e é gravado na pasta Downloads do aparelho.
 *
 * Compartilhar: navigator.share não existe no WebView; sem isto, compartilhar
 * um estudo cairia sempre na cópia para a área de transferência.
 */
class ArquivoBridge(private val act: Activity) {

    @JavascriptInterface
    fun salvar(nome: String, conteudo: String, tipo: String): Boolean {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val valores = ContentValues().apply {
                    put(MediaStore.Downloads.DISPLAY_NAME, nome)
                    put(MediaStore.Downloads.MIME_TYPE, tipo)
                    put(MediaStore.Downloads.IS_PENDING, 1)
                }
                val res = act.contentResolver
                val uri = res.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, valores)
                    ?: return avisar("Não consegui criar o arquivo em Downloads.", false)
                res.openOutputStream(uri)?.use { it.write(conteudo.toByteArray()) }
                valores.clear()
                valores.put(MediaStore.Downloads.IS_PENDING, 0)
                res.update(uri, valores, null, null)
                avisar("Salvo em Downloads: $nome", true)
            } else {
                /* Antes do Android 10 não há MediaStore para Downloads sem
                   permissão de armazenamento. A pasta do próprio app não pede
                   permissão nenhuma e o gerenciador de arquivos alcança. */
                val pasta = act.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS)
                val arquivo = File(pasta, nome)
                arquivo.writeText(conteudo)
                avisar("Salvo em ${arquivo.absolutePath}", true)
            }
        } catch (e: Exception) {
            avisar("Não consegui salvar o arquivo.", false)
        }
    }

    /**
     * Cópia de segurança automática, gravada na pasta Downloads do aparelho.
     *
     * O ponto não é conveniência: é sobreviver à desinstalação. Tudo que o app
     * guarda (localStorage, IndexedDB, os assets) mora na pasta privada dele, e
     * o Android apaga essa pasta inteira quando o app é desinstalado. A pasta
     * Downloads, não: ela é do usuário, e o que está lá continua lá.
     *
     * Sempre o mesmo arquivo, sobrescrito — senão, em um mês, haveria trezentos
     * "leitura-biblica-backup(247).json" na pasta de Downloads de alguém.
     *
     * Silencioso de propósito: isto roda sozinho depois de cada estudo gerado,
     * e um aviso a cada vez seria praga, não ajuda.
     */
    @JavascriptInterface
    fun salvarBackup(nome: String, conteudo: String): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            /* Antes do Android 10, escrever em Downloads exige permissão de
               armazenamento. A pasta do app serve de consolo, mas ela morre
               junto na desinstalação — e o app diz isso na tela. */
            return try {
                File(act.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS), nome)
                    .writeText(conteudo)
                true
            } catch (e: Exception) {
                false
            }
        }

        return try {
            val res = act.contentResolver
            val existente = acharEmDownloads(nome)
            if (existente != null) {
                /* "wt" trunca: sem isso, um backup menor que o anterior
                   deixaria o rabo do arquivo velho colado no fim. */
                res.openOutputStream(existente, "wt")?.use { it.write(conteudo.toByteArray()) }
                    ?: return false
                return true
            }
            val valores = ContentValues().apply {
                put(MediaStore.Downloads.DISPLAY_NAME, nome)
                put(MediaStore.Downloads.MIME_TYPE, "application/json")
                put(MediaStore.Downloads.IS_PENDING, 1)
            }
            val uri = res.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, valores) ?: return false
            res.openOutputStream(uri)?.use { it.write(conteudo.toByteArray()) } ?: return false
            valores.clear()
            valores.put(MediaStore.Downloads.IS_PENDING, 0)
            res.update(uri, valores, null, null)
            true
        } catch (e: Exception) {
            false
        }
    }

    /* -------------------------------------------------- cópia escrita em fluxo */

    /*
     * A Bíblia inteira estudada dá um backup de uns 30 MB. Passar isso como uma
     * String só pela ponte significa tê-lo duas vezes na memória — em
     * JavaScript e em Java — e num celular modesto é o app morrendo. Estes três
     * métodos escrevem o arquivo aos poucos, direto no disco.
     *
     * O arquivo de trabalho fica no cache com nome fixo: é o mesmo que o
     * DriveBridge lê depois, para mandar a cópia ao Drive sem que os 30 MB
     * voltem a passar pela página.
     */
    private var fluxo: OutputStream? = null

    @JavascriptInterface
    fun copiaAbrir(): Boolean {
        descartarFluxo()
        return try {
            fluxo = BufferedOutputStream(FileOutputStream(trabalho()))
            true
        } catch (e: Exception) {
            false
        }
    }

    @JavascriptInterface
    fun copiaEscrever(parte: String): Boolean {
        val f = fluxo ?: return false
        return try { f.write(parte.toByteArray()); true } catch (e: Exception) { false }
    }

    /** Fecha e leva para Downloads. Nome vazio = desistiu; joga fora. */
    @JavascriptInterface
    fun copiaFechar(nome: String): Boolean {
        val f = fluxo
        fluxo = null
        try { f?.flush(); f?.close() } catch (e: Exception) { }
        val arq = trabalho()
        if (nome.isEmpty()) { arq.delete(); return false }
        return try {
            /* O arquivo de trabalho fica de pé depois disto, de propósito: é
               dele que o Drive lê em seguida. A próxima gravação o sobrescreve. */
            arq.inputStream().use { paraDownloads(nome, it) }
        } catch (e: Exception) {
            false
        }
    }

    private fun trabalho() = File(act.cacheDir, TRABALHO)

    private fun descartarFluxo() {
        try { fluxo?.close() } catch (e: Exception) { }
        fluxo = null
    }

    /** Escreve em Downloads a partir de um fluxo, sobrescrevendo o que havia. */
    private fun paraDownloads(nome: String, entrada: InputStream): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            return try {
                File(act.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS), nome)
                    .outputStream().use { entrada.copyTo(it) }
                true
            } catch (e: Exception) { false }
        }
        val res = act.contentResolver
        val existente = acharEmDownloads(nome)
        if (existente != null) {
            return try {
                res.openOutputStream(existente, "wt")?.use { entrada.copyTo(it) } ?: return false
                true
            } catch (e: Exception) { false }
        }
        val valores = ContentValues().apply {
            put(MediaStore.Downloads.DISPLAY_NAME, nome)
            put(MediaStore.Downloads.MIME_TYPE, "application/json")
            put(MediaStore.Downloads.IS_PENDING, 1)
        }
        val uri = res.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, valores) ?: return false
        return try {
            res.openOutputStream(uri)?.use { entrada.copyTo(it) } ?: return false
            valores.clear()
            valores.put(MediaStore.Downloads.IS_PENDING, 0)
            res.update(uri, valores, null, null)
            true
        } catch (e: Exception) { false }
    }

    /** O arquivo anterior, se este mesmo app o criou nesta instalação. */
    private fun acharEmDownloads(nome: String): Uri? {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return null
        val col = MediaStore.Downloads.EXTERNAL_CONTENT_URI
        act.contentResolver.query(
            col,
            arrayOf(MediaStore.Downloads._ID),
            MediaStore.Downloads.DISPLAY_NAME + " = ?",
            arrayOf(nome),
            null
        )?.use { c ->
            if (c.moveToFirst()) return ContentUris.withAppendedId(col, c.getLong(0))
        }
        return null
    }

    /**
     * Lê de volta a cópia automática — quando dá.
     *
     * Depois de uma reinstalação não dá: o Android amarra o arquivo a quem o
     * criou, e o app novo é outro dono aos olhos do sistema. Nesse caso volta
     * vazio e a tela pede para a pessoa apontar o arquivo uma vez, no seletor
     * do sistema. Um toque, e sem pedir permissão de armazenamento — que para
     * um app de leitura bíblica seria pedir demais.
     */
    @JavascriptInterface
    fun lerBackup(nome: String): String {
        return try {
            val uri = acharEmDownloads(nome) ?: return ""
            act.contentResolver.openInputStream(uri)?.use {
                it.readBytes().toString(Charsets.UTF_8)
            } ?: ""
        } catch (e: Exception) {
            ""
        }
    }

    /**
     * Manda o backup para onde a pessoa quiser pelo menu de compartilhar do
     * Android — na prática, "Salvar no Drive".
     *
     * Existe por ser o caminho para o Drive que não pede nada: sem conta de
     * desenvolvedor, sem login dentro do app, sem permissão nenhuma. Um toque
     * aqui, um toque no Drive, e o arquivo está numa nuvem que sobrevive a
     * perder o celular — o que nem Downloads nem o armazenamento do app fazem.
     *
     * O arquivo é escrito na pasta de cache e entregue por FileProvider, então
     * o app não abre nada mais de si para fora, e o sistema limpa depois.
     */
    @JavascriptInterface
    fun compartilharArquivo(nome: String, conteudo: String, tipo: String): Boolean {
        return try {
            val pasta = File(act.cacheDir, "compartilhar").apply { mkdirs() }
            val arquivo = File(pasta, nome)
            arquivo.writeText(conteudo)
            val uri = FileProvider.getUriForFile(act, act.packageName + ".arquivos", arquivo)
            val envio = Intent(Intent.ACTION_SEND).apply {
                type = tipo
                putExtra(Intent.EXTRA_STREAM, uri)
                putExtra(Intent.EXTRA_SUBJECT, nome)
                putExtra(Intent.EXTRA_TITLE, nome)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            act.startActivity(Intent.createChooser(envio, "Guardar o backup em…"))
            true
        } catch (e: Exception) {
            avisar("Não consegui preparar o arquivo para enviar.", false)
        }
    }

    /**
     * Segura a tela acesa enquanto o mutirão de estudos roda.
     *
     * Sem isto o mutirão não existe: tela apagada é WebView suspenso, e a fila
     * pararia no meio do primeiro capítulo. É a mesma bandeira que apps de
     * receita e de navegação usam, e ela cai sozinha quando o app sai da frente
     * — não há como esquecer ligada.
     */
    @JavascriptInterface
    fun manterAcordado(ligar: Boolean): Boolean {
        act.runOnUiThread {
            if (ligar) act.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            else act.window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        }
        return true
    }

    @JavascriptInterface
    fun compartilhar(titulo: String, texto: String): Boolean {
        return try {
            val envio = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_SUBJECT, titulo)
                putExtra(Intent.EXTRA_TITLE, titulo)
                putExtra(Intent.EXTRA_TEXT, texto)
            }
            act.startActivity(Intent.createChooser(envio, titulo))
            true
        } catch (e: Exception) {
            false
        }
    }

    companion object {
        /** Nome fixo: o DriveBridge lê este mesmo arquivo. */
        const val TRABALHO = "copia-em-curso.json"
    }

    private fun avisar(msg: String, resultado: Boolean): Boolean {
        act.runOnUiThread { Toast.makeText(act, msg, Toast.LENGTH_LONG).show() }
        return resultado
    }
}
