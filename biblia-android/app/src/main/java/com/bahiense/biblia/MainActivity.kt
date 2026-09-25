package com.bahiense.biblia

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewFeature

/**
 * O app é a mesma página web da pasta /biblia, servida de dentro do APK por um
 * endereço https interno (appassets.androidplatform.net).
 *
 * O endereço interno não é firula. Ele dá à página uma origem estável e segura,
 * e disso dependem três coisas: o progresso da leitura (localStorage) e os
 * estudos (IndexedDB) continuarem existindo entre uma abertura e outra; a
 * chamada à API do Google, que o navegador só deixa sair de contexto seguro;
 * e a área de transferência. Aberta como file://, a página perderia as três.
 *
 * O WebView não tem duas coisas que a versão do navegador usa: baixar arquivo
 * (o backup vem de um blob, que o WebView ignora) e o menu de compartilhar.
 * Quem repõe as duas é a ArquivoBridge, com a página conversando com ela pelo
 * js/ponte-android.js — no navegador comum a ponte sai pela porta na primeira
 * linha e tudo segue como antes.
 *
 * A DriveBridge é a terceira coisa que só o app faz: a cópia de segurança no
 * Google Drive da própria pessoa. O login dela acontece fora daqui, no
 * navegador do aparelho, e a volta chega como intent — é o que esta classe
 * recebe no onNewIntent e entrega à ponte.
 */
class MainActivity : Activity() {

    private lateinit var web: WebView
    private lateinit var drive: DriveBridge
    private var escolhaDeArquivo: ValueCallback<Array<Uri>>? = null

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

            /* Só agora há window.__driveConectou para receber o recado. */
            override fun onPageFinished(view: WebView, url: String) {
                loginPendente?.let { loginPendente = null; drive.receber(it) }
            }

            /*
             * Link para fora (as fontes consultadas no fim de um estudo, o
             * console do Google) abre no navegador do aparelho. Dentro do
             * WebView ele viraria uma página sem barra de endereço e sem volta,
             * e o usuário ficaria preso numa casca que parece o app.
             */
            override fun shouldOverrideUrlLoading(
                view: WebView,
                request: WebResourceRequest
            ): Boolean {
                val url = request.url
                if (url.host == "appassets.androidplatform.net") return false
                /* A volta do login do Google não é navegação: é recado para o
                   app. Ele chega aqui se o navegador abrir o link em vez de
                   entregá-lo ao sistema. */
                if (DriveBridge.nossoRedirecionamento(url)) {
                    drive.receber(url)
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

        web.webChromeClient = object : WebChromeClient() {
            /* Restaurar backup abre o seletor de arquivos do sistema; sem este
               caminho, o <input type="file"> da página não faz nada. */
            override fun onShowFileChooser(
                view: WebView,
                callback: ValueCallback<Array<Uri>>,
                params: FileChooserParams
            ): Boolean {
                escolhaDeArquivo?.onReceiveValue(null)
                escolhaDeArquivo = callback
                return try {
                    startActivityForResult(params.createIntent(), REQ_ARQUIVO)
                    true
                } catch (e: ActivityNotFoundException) {
                    escolhaDeArquivo = null
                    callback.onReceiveValue(null)
                    false
                }
            }
        }

        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = false
            allowContentAccess = false
        }

        /* Sem isto o WebView ignora o tema escuro do aparelho e a página, que
           segue prefers-color-scheme, fica sempre clara. */
        if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) {
            WebSettingsCompat.setAlgorithmicDarkeningAllowed(web.settings, true)
        }

        drive = DriveBridge(this, web)
        web.addJavascriptInterface(ArquivoBridge(this), "AndroidArquivo")
        web.addJavascriptInterface(drive, "AndroidDrive")
        setContentView(web)

        anotarLogin(intent)
        web.loadUrl("https://appassets.androidplatform.net/assets/index.html")
    }

    /* launchMode=singleTask: com o app aberto, a volta do login cai aqui. */
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        val uri = intent.data
        if (DriveBridge.nossoRedirecionamento(uri)) drive.receber(uri!!)
    }

    private fun anotarLogin(intent: Intent?) {
        val uri = intent?.data
        if (DriveBridge.nossoRedirecionamento(uri)) loginPendente = uri
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != REQ_ARQUIVO) return
        val callback = escolhaDeArquivo ?: return
        escolhaDeArquivo = null
        callback.onReceiveValue(
            if (resultCode == RESULT_OK) WebChromeClient.FileChooserParams.parseResult(resultCode, data)
            else null
        )
    }

    /** O app navega por hash (#/hoje, #/estudo/João 3): voltar devolve à tela anterior. */
    @Suppress("DEPRECATION", "OVERRIDE_DEPRECATION")
    override fun onBackPressed() {
        if (web.canGoBack()) web.goBack() else super.onBackPressed()
    }

    override fun onDestroy() {
        web.destroy()
        super.onDestroy()
    }

    companion object {
        private const val REQ_ARQUIVO = 71
    }
}
