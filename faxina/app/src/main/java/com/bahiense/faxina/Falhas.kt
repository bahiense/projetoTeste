package com.bahiense.faxina

import android.app.Application
import android.content.Context
import android.os.Build
import java.io.File
import java.io.PrintWriter
import java.io.StringWriter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Caixa-preta do app.
 *
 * Um app instalado por APK não tem como mostrar o motivo de uma queda: sem
 * logcat, "abre e fecha" é tudo o que o usuário consegue relatar, e isso não
 * dá para depurar. Aqui a exceção que derruba o processo é gravada em arquivo
 * antes de morrer, e a próxima abertura mostra o texto na tela com um botão de
 * compartilhar.
 *
 * O arquivo fica em `filesDir`, que é privado do app e some na desinstalação.
 */
object Falhas {

    private const val ARQUIVO = "ultima-falha.txt"

    fun instalar(app: Application) {
        val anterior = Thread.getDefaultUncaughtExceptionHandler()

        Thread.setDefaultUncaughtExceptionHandler { linha, erro ->
            // Se gravar falhar, não pode piorar a queda que já está acontecendo.
            try {
                salvar(app, linha.name, erro)
            } catch (e: Throwable) {
                // sem nada a fazer aqui
            }
            // Devolve ao tratador do sistema para o Android registrar e encerrar
            // como faria normalmente.
            anterior?.uncaughtException(linha, erro)
        }
    }

    private fun salvar(ctx: Context, linha: String, erro: Throwable) {
        val pilha = StringWriter().also { erro.printStackTrace(PrintWriter(it)) }.toString()
        val quando = SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.getDefault()).format(Date())

        val texto = buildString {
            appendLine("Faxina ${versao(ctx)}")
            appendLine("Android ${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT})")
            appendLine("${Build.MANUFACTURER} ${Build.MODEL}")
            appendLine("Quando: $quando")
            appendLine("Linha de execução: $linha")
            appendLine()
            append(pilha)
        }

        File(ctx.filesDir, ARQUIVO).writeText(texto)
    }

    fun pendente(ctx: Context): String? {
        val arquivo = File(ctx.filesDir, ARQUIVO)
        return try {
            if (arquivo.exists()) arquivo.readText().ifBlank { null } else null
        } catch (e: Exception) {
            null
        }
    }

    fun limpar(ctx: Context) {
        try {
            File(ctx.filesDir, ARQUIVO).delete()
        } catch (e: Exception) {
            // idem
        }
    }

    private fun versao(ctx: Context): String = try {
        @Suppress("DEPRECATION")
        val info = ctx.packageManager.getPackageInfo(ctx.packageName, 0)
        "${info.versionName} (${info.packageName})"
    } catch (e: Exception) {
        "versão desconhecida"
    }
}

class FaxinaApp : Application() {
    override fun onCreate() {
        super.onCreate()
        Falhas.instalar(this)
    }
}
