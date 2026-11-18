package com.bahiense.teologia

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader

/**
 * A tela é a página do Professor de Teologia (a mesma do artifact no Claude),
 * servida de dentro do APK por um endereço https interno
 * (appassets.androidplatform.net). As aulas e o progresso ficam em arquivos do
 * app, pelo objeto `TeologiaNativo` (Nativo.kt), não no localStorage.
 */
class MainActivity : Activity() {

    private lateinit var web: WebView
    private lateinit var atualizador: Atualizador
    lateinit var nativo: Nativo

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

            /* Link para fora (uma fonte da pesquisa) abre no navegador, e só se for https. */
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

        nativo = Nativo(this, web)
        web.addJavascriptInterface(nativo, "TeologiaNativo")
        atualizador = Atualizador(this, web)
        web.addJavascriptInterface(atualizador, "TeologiaAtualizar")
        setContentView(web)
        arquivoDoIntent(intent)?.let { nativo.arquivoChegou(it) }
        web.loadUrl("https://appassets.androidplatform.net/assets/index.html")
    }

    /** Escolher o arquivo da aula (Downloads, Drive…). Mostra todos os arquivos:
     *  cada gerenciador rotula .json de um jeito, e filtrar escondia o arquivo. */
    fun escolherArquivo() = runOnUiThread {
        val i = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
        }
        try {
            @Suppress("DEPRECATION")
            startActivityForResult(i, PEDIDO_ARQUIVO)
        } catch (_: ActivityNotFoundException) { }
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
        arquivoDoIntent(intent)?.let { nativo.arquivoChegou(it) }
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        @Suppress("DEPRECATION")
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == PEDIDO_ARQUIVO && resultCode == RESULT_OK) data?.data?.let { nativo.arquivoChegou(it) }
    }

    @Suppress("DEPRECATION", "OVERRIDE_DEPRECATION")
    override fun onBackPressed() {
        // a página decide: fecha a tela de dentro ou deixa o app fechar
        web.evaluateJavascript("window.__voltar && window.__voltar()") { r ->
            if (r != "true") finish()
        }
    }

    override fun onDestroy() {
        atualizador.encerrar()
        web.destroy()
        super.onDestroy()
    }

    companion object {
        private const val PEDIDO_ARQUIVO = 61
    }
}
