package com.bahiense.feed

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader

/**
 * O app é a página da pasta assets, servida de dentro do APK por um endereço
 * https interno (appassets.androidplatform.net). A origem estável é o que
 * mantém o localStorage — onde ficam as buscas de canais já feitas, que
 * custam cota da API — entre uma abertura e outra.
 *
 * O login do Google acontece fora daqui, no navegador do aparelho, e a volta
 * chega como intent — é o que esta classe recebe e entrega à YouTubeBridge.
 */
class MainActivity : Activity() {

    private lateinit var web: WebView
    private lateinit var youtube: YouTubeBridge

    /* O login do Google pode voltar com o app fechado: aí o endereço chega no
       onCreate, antes de existir página para avisar. Guarda e entrega depois. */
    private var loginPendente: Uri? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val loader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        web = WebView(this)
        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? = loader.shouldInterceptRequest(request.url)

            /* Só agora há window.__ytConectou para receber o recado. */
            override fun onPageFinished(view: WebView, url: String) {
                loginPendente?.let { loginPendente = null; youtube.receber(it) }
            }

            /* Link para fora (um canal, o console do Google) abre no navegador
               ou no app do YouTube, não preso dentro do WebView. */
            override fun shouldOverrideUrlLoading(
                view: WebView,
                request: WebResourceRequest
            ): Boolean {
                val url = request.url
                if (url.host == "appassets.androidplatform.net") return false
                if (YouTubeBridge.nossoRedirecionamento(url)) {
                    youtube.receber(url)
                    return true
                }
                return try {
                    startActivity(Intent(Intent.ACTION_VIEW, url))
                    true
                } catch (e: ActivityNotFoundException) {
                    true
                }
            }
        }

        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = false
            allowContentAccess = false
        }

        youtube = YouTubeBridge(this, web)
        web.addJavascriptInterface(youtube, "AndroidYouTube")
        setContentView(web)

        anotarLogin(intent)
        web.loadUrl("https://appassets.androidplatform.net/assets/index.html")
    }

    /* launchMode=singleTask: com o app aberto, a volta do login cai aqui. */
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        val uri = intent.data
        if (YouTubeBridge.nossoRedirecionamento(uri)) youtube.receber(uri!!)
    }

    private fun anotarLogin(intent: Intent?) {
        val uri = intent?.data
        if (YouTubeBridge.nossoRedirecionamento(uri)) loginPendente = uri
    }

    @Suppress("DEPRECATION", "OVERRIDE_DEPRECATION")
    override fun onBackPressed() {
        if (web.canGoBack()) web.goBack() else super.onBackPressed()
    }

    override fun onDestroy() {
        web.destroy()
        super.onDestroy()
    }
}
