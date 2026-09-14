package com.bahiense.biblia

import android.app.Activity
import android.content.ContentValues
import android.content.Intent
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.webkit.JavascriptInterface
import android.widget.Toast
import java.io.File

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

    private fun avisar(msg: String, resultado: Boolean): Boolean {
        act.runOnUiThread { Toast.makeText(act, msg, Toast.LENGTH_LONG).show() }
        return resultado
    }
}
