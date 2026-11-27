package com.bahiense.formacao

import android.Manifest
import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader

/**
 * A tela é a página da pasta assets, servida de dentro do APK por um endereço
 * https interno (appassets.androidplatform.net): a origem estável é o que
 * mantém o progresso e as conversas no localStorage entre uma abertura e outra.
 */
class MainActivity : Activity() {

    private lateinit var web: WebView
    private lateinit var ponte: Ponte
    private lateinit var atualizador: Atualizador
    lateinit var copias: Copias
    private var paginaPronta = false
    private var recebido: Uri? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WebView.setWebContentsDebuggingEnabled(false)

        val loader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        web = WebView(this)
        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? = loader.shouldInterceptRequest(request.url)

            /* Link para fora (uma fonte citada pelo professor) abre no navegador,
               e só se for https. */
            override fun onPageFinished(view: WebView, url: String) {
                paginaPronta = true
                recebido?.let { recebido = null; copias.arquivoEscolhido(it) }
            }

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                if (request.url.scheme == "https" && request.url.host == "appassets.androidplatform.net") return false
                if (request.url.scheme != "https") return true
                return try {
                    startActivity(Intent(Intent.ACTION_VIEW, request.url)); true
                } catch (e: ActivityNotFoundException) { true }
            }
        }
        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = false
            allowContentAccess = false
            javaScriptCanOpenWindowsAutomatically = false
            setSupportMultipleWindows(false)
            setGeolocationEnabled(false)
            mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW
        }

        ponte = Ponte(this, web)
        web.addJavascriptInterface(ponte, "Politica")
        atualizador = Atualizador(this, web)
        web.addJavascriptInterface(atualizador, "PoliticaAtualizar")
        copias = Copias(this, web)
        web.addJavascriptInterface(copias, "PoliticaCopias")
        setContentView(web)
        recebido = arquivoDoIntent(intent)
        web.loadUrl("https://appassets.androidplatform.net/assets/index.html")
        trabalhoMudou()
    }

    /** Abre o seletor de arquivos do sistema, só PDFs. */
    fun abrirSeletorPdf() = runOnUiThread {
        val i = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "application/pdf"
        }
        try {
            @Suppress("DEPRECATION")
            startActivityForResult(i, PEDIDO_PDF)
        } catch (e: ActivityNotFoundException) {
            ponte.pdfEscolhido(null)
        }
    }

    /**
     * Pede à pessoa que aponte a pasta Downloads, uma vez: é o único jeito de o
     * app ler os arquivos que o Claude baixou (arquivo de outro app, que não é
     * mídia). O sistema guarda o consentimento entre aberturas.
     */
    fun escolherPasta() = runOnUiThread {
        val i = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).addFlags(
            Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION or
                Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION
        )
        try {
            @Suppress("DEPRECATION")
            startActivityForResult(i, PEDIDO_PASTA)
        } catch (e: ActivityNotFoundException) {
            copias.pastaEscolhida(null)
        }
    }

    /* Arquivo de aula que chegou por "Abrir com" ou "Compartilhar". */
    private fun arquivoDoIntent(i: Intent?): Uri? = when (i?.action) {
        Intent.ACTION_VIEW -> i.data
        Intent.ACTION_SEND -> @Suppress("DEPRECATION")
            if (Build.VERSION.SDK_INT >= 33) i.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
            else i.getParcelableExtra(Intent.EXTRA_STREAM)
        else -> null
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        val uri = arquivoDoIntent(intent) ?: return
        if (paginaPronta) copias.arquivoEscolhido(uri) else recebido = uri
    }

    /** Escolher o arquivo da aula à mão (Downloads, Drive…). Mostra todos os
     *  arquivos: cada gerenciador rotula .json de um jeito, e filtrar escondia o arquivo. */
    fun escolherArquivoCopia() = runOnUiThread {
        val i = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
        }
        try {
            @Suppress("DEPRECATION")
            startActivityForResult(i, PEDIDO_COPIA)
        } catch (_: ActivityNotFoundException) { }
    }

    /** Uma aula começou ou terminou: tela acesa e serviço só enquanto houver trabalho. */
    fun trabalhoMudou() {
        if (Ponte.gerando.isEmpty()) {
            window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        } else {
            window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            // Android 13+: sem a permissão a notificação some, mas o serviço segura o app
            if (Build.VERSION.SDK_INT >= 33 &&
                checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
            ) requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), PEDIDO_AVISO)
        }
        ServicoAula.atualizar(this)
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        @Suppress("DEPRECATION")
        super.onActivityResult(requestCode, resultCode, data)
        val uri = if (resultCode == RESULT_OK) data?.data else null
        when (requestCode) {
            PEDIDO_PDF -> ponte.pdfEscolhido(uri)
            PEDIDO_COPIA -> copias.arquivoEscolhido(uri)
            PEDIDO_PASTA -> {
                var ok: Uri? = null
                if (uri != null) try {
                    try {
                        contentResolver.takePersistableUriPermission(
                            uri, Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                        )
                    } catch (e: Exception) {
                        contentResolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    }
                    ok = uri
                } catch (_: Exception) { }
                copias.pastaEscolhida(ok)
            }
        }
    }

    @Suppress("DEPRECATION", "OVERRIDE_DEPRECATION")
    override fun onBackPressed() {
        // a página decide: fecha a tela de dentro ou deixa o app fechar
        web.evaluateJavascript("window.__voltar && window.__voltar()") { r ->
            if (r != "true") finish()
        }
    }

    override fun onDestroy() {
        ponte.encerrar()
        atualizador.encerrar()
        web.destroy()
        super.onDestroy()
    }

    companion object {
        private const val PEDIDO_PDF = 51
        private const val PEDIDO_AVISO = 52
        private const val PEDIDO_PASTA = 53
        private const val PEDIDO_COPIA = 54
    }
}
