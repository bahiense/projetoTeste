package com.bahiense.espalhe

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader

/**
 * A tela é a página da pasta assets, servida de dentro do APK por um endereço
 * https interno (appassets.androidplatform.net): a origem estável é o que
 * mantém os perfis cadastrados no localStorage entre uma abertura e outra.
 *
 * As fotos e vídeos importados ficam em files/midia e a página os enxerga em
 * /midia/ — é de lá que vêm as miniaturas da prévia.
 */
class MainActivity : Activity() {

    private lateinit var web: WebView
    private lateinit var ponte: Ponte
    private lateinit var metricas: Metricas

    /* Uma foto compartilhada da galeria pode chegar com o app fechado: aí ela
       entra no onCreate, antes de existir página para receber. */
    private var recebidaPendente: Uri? = null
    private var paginaPronta = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val loader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .addPathHandler(
                "/midia/",
                WebViewAssetLoader.InternalStoragePathHandler(this, Ponte.pastaMidia(this))
            )
            .build()

        web = WebView(this)
        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? = loader.shouldInterceptRequest(request.url)

            override fun onPageFinished(view: WebView, url: String) {
                paginaPronta = true
                recebidaPendente?.let { recebidaPendente = null; ponte.importarRecebida(it) }
            }

            /* Link para fora (ajuda de uma rede) abre no navegador. */
            override fun shouldOverrideUrlLoading(
                view: WebView,
                request: WebResourceRequest
            ): Boolean {
                if (request.url.host == "appassets.androidplatform.net") return false
                return try {
                    startActivity(Intent(Intent.ACTION_VIEW, request.url))
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

        ponte = Ponte(this, web)
        web.addJavascriptInterface(ponte, "Espalhe")
        metricas = Metricas(this, web)
        web.addJavascriptInterface(metricas, "EspalheMetricas")
        setContentView(web)

        recebidaPendente = midiaCompartilhada(intent)
        // a volta de um login pode reabrir o app do zero: a ligação é guardada
        // mesmo sem página para avisar, e a tela a encontra ao carregar
        intent?.data?.takeIf { Metricas.nossaVolta(it) }?.let { metricas.receber(it) }
        web.loadUrl("https://appassets.androidplatform.net/assets/index.html")
    }

    /* launchMode=singleTask: com o app aberto, o "compartilhar" cai aqui. */
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        intent.data?.takeIf { Metricas.nossaVolta(it) }?.let { metricas.receber(it); return }
        val uri = midiaCompartilhada(intent) ?: return
        if (paginaPronta) ponte.importarRecebida(uri) else recebidaPendente = uri
    }

    private fun midiaCompartilhada(intent: Intent?): Uri? {
        if (intent?.action != Intent.ACTION_SEND) return null
        @Suppress("DEPRECATION")
        return if (Build.VERSION.SDK_INT >= 33)
            intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
        else intent.getParcelableExtra(Intent.EXTRA_STREAM)
    }

    /** Chamado pela ponte: abre o seletor de fotos e vídeos do sistema. */
    fun abrirSeletor() {
        val i = if (Build.VERSION.SDK_INT >= 33) {
            // sem tipo, o seletor mostra fotos e vídeos juntos
            Intent(MediaStore.ACTION_PICK_IMAGES)
        } else {
            Intent(Intent.ACTION_GET_CONTENT).apply {
                type = "*/*"
                putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("image/*", "video/*"))
                addCategory(Intent.CATEGORY_OPENABLE)
            }
        }
        try {
            startActivityForResult(i, PEDIDO_SELETOR)
        } catch (e: ActivityNotFoundException) {
            ponte.seletorTerminou(null)
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        @Suppress("DEPRECATION")
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != PEDIDO_SELETOR) return
        ponte.seletorTerminou(if (resultCode == RESULT_OK) data?.data else null)
    }

    @Suppress("DEPRECATION", "OVERRIDE_DEPRECATION")
    override fun onBackPressed() {
        // a página decide: volta uma etapa do fluxo ou deixa o app fechar
        web.evaluateJavascript("window.__voltar && window.__voltar()") { r ->
            if (r != "true") finish()
        }
    }

    override fun onDestroy() {
        ponte.encerrar()
        metricas.encerrar()
        web.destroy()
        super.onDestroy()
    }

    companion object {
        private const val PEDIDO_SELETOR = 41
    }
}
