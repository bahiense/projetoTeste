package br.com.ciclo.concursos

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.webkit.WebViewAssetLoader

/**
 * A casca do aplicativo. O ciclo de estudos inteiro vive nos assets, em
 * HTML e JavaScript; esta tela só o hospeda.
 *
 * O WebViewAssetLoader serve os arquivos sob https://appassets.androidplatform.net/
 * em vez de file://. Isso importa: numa origem file:// o navegador trata o
 * armazenamento local como descartável e o seu progresso poderia sumir. Servido
 * como https, o localStorage se comporta como em qualquer site — e é ali que
 * ficam as matérias, as aulas e tudo o que você registra.
 */
class MainActivity : ComponentActivity() {

    private lateinit var navegador: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(estadoSalvo: Bundle?) {
        super.onCreate(estadoSalvo)

        val servidor = WebViewAssetLoader.Builder()
            .setDomain(DOMINIO)
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        navegador = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT
            )
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true          // o localStorage do app
            settings.databaseEnabled = true
            settings.allowFileAccess = false           // nada de ler o disco do telefone
            settings.allowContentAccess = false
            settings.mediaPlaybackRequiresUserGesture = true
            settings.textZoom = 100                    // ignora a fonte gigante do sistema
            isVerticalScrollBarEnabled = true
            overScrollMode = WebView.OVER_SCROLL_IF_CONTENT_SCROLLS

            webViewClient = object : WebViewClient() {
                override fun shouldInterceptRequest(
                    visao: WebView, pedido: WebResourceRequest
                ): WebResourceResponse? = servidor.shouldInterceptRequest(pedido.url)

                /** Link externo (o PDF da aula, o caderno de questões) abre no
                 *  navegador do telefone; o resto continua dentro do app. */
                override fun shouldOverrideUrlLoading(
                    visao: WebView, pedido: WebResourceRequest
                ): Boolean {
                    val url = pedido.url
                    if (url.host == DOMINIO) return false
                    return try {
                        startActivity(android.content.Intent(android.content.Intent.ACTION_VIEW, url))
                        true
                    } catch (erro: Exception) {
                        true
                    }
                }
            }
        }
        setContentView(navegador)

        // O botão Voltar anda no histórico do app antes de sair dele.
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (navegador.canGoBack()) navegador.goBack() else finish()
            }
        })

        if (estadoSalvo == null) navegador.loadUrl(PAGINA) else navegador.restoreState(estadoSalvo)
    }

    override fun onSaveInstanceState(estado: Bundle) {
        super.onSaveInstanceState(estado)
        navegador.saveState(estado)
    }

    override fun onDestroy() {
        navegador.destroy()
        super.onDestroy()
    }

    private companion object {
        const val DOMINIO = "appassets.androidplatform.net"
        const val PAGINA = "https://appassets.androidplatform.net/assets/index.html"
    }
}
