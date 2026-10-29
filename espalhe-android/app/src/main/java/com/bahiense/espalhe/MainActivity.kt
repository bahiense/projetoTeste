package com.bahiense.espalhe

import android.app.Activity
import android.app.KeyguardManager
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.view.View
import android.view.WindowManager
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
 *
 * Com o bloqueio ligado, a tela só aparece depois da digital (ou do PIN/padrão
 * do celular), ao abrir e ao voltar depois de alguns minutos fora.
 */
class MainActivity : Activity() {

    private lateinit var web: WebView
    private lateinit var ponte: Ponte
    private lateinit var metricas: Metricas
    private lateinit var atualizador: Atualizador

    /* Uma foto compartilhada da galeria pode chegar com o app fechado: aí ela
       entra no onCreate, antes de existir página para receber. */
    private var recebidaPendente: Uri? = null
    private var paginaPronta = false

    private val seguranca by lazy { getSharedPreferences("seguranca", MODE_PRIVATE) }
    private val comBloqueio get() = seguranca.getBoolean("bloqueio", false)
    private var desbloqueado = false
    private var confirmando = false
    private var saiuEm = 0L

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // o APK de depuração ligaria isto sozinho; aqui fica desligado sempre
        WebView.setWebContentsDebuggingEnabled(false)
        protegerTela()

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

            /* Link para fora (ajuda de uma rede, um post) abre no navegador, e só
               se for https: nada de intent:// ou outro esquema vindo de conteúdo. */
            override fun shouldOverrideUrlLoading(
                view: WebView,
                request: WebResourceRequest
            ): Boolean {
                if (request.url.scheme == "https" && request.url.host == "appassets.androidplatform.net") return false
                if (request.url.scheme != "https") return true
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
            javaScriptCanOpenWindowsAutomatically = false
            setSupportMultipleWindows(false)
            setGeolocationEnabled(false)
            mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW
        }

        ponte = Ponte(this, web)
        web.addJavascriptInterface(ponte, "Espalhe")
        metricas = Metricas(this, web)
        web.addJavascriptInterface(metricas, "EspalheMetricas")
        atualizador = Atualizador(this, web)
        web.addJavascriptInterface(atualizador, "EspalheAtualizar")
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

    // ---------------------------------------------------------- bloqueio

    override fun onResume() {
        super.onResume()
        pedirDesbloqueio()
    }

    override fun onStop() {
        super.onStop()
        if (!confirmando) saiuEm = System.currentTimeMillis()
    }

    /* Pede a digital ao abrir, e de novo depois de 5 minutos fora — tempo de
       sobra para ir ao Instagram publicar e voltar sem ser incomodado. */
    private fun pedirDesbloqueio() {
        if (!comBloqueio || confirmando) { web.visibility = View.VISIBLE; return }
        if (desbloqueado && System.currentTimeMillis() - saiuEm < 5 * 60_000L) return
        val km = getSystemService(KeyguardManager::class.java)
        // tiraram o bloqueio de tela do celular: não há o que pedir
        if (!km.isDeviceSecure) { web.visibility = View.VISIBLE; return }
        web.visibility = View.INVISIBLE
        desbloqueado = false
        @Suppress("DEPRECATION")
        val i = km.createConfirmDeviceCredentialIntent("Espalhe", "Confirme que é você para abrir") ?: return
        confirmando = true
        @Suppress("DEPRECATION")
        startActivityForResult(i, PEDIDO_DESBLOQUEIO)
    }

    fun estadoBloqueio(): String = org.json.JSONObject()
        .put("ativo", comBloqueio)
        .put("possivel", getSystemService(KeyguardManager::class.java).isDeviceSecure)
        .toString()

    /** Liga ou desliga o bloqueio. Devolve "" ou o motivo de não ter ligado. */
    fun definirBloqueio(ativo: Boolean): String {
        if (ativo && !getSystemService(KeyguardManager::class.java).isDeviceSecure)
            return "Configure antes um bloqueio de tela no celular (digital, PIN ou padrão)."
        seguranca.edit().putBoolean("bloqueio", ativo).apply()
        desbloqueado = true
        saiuEm = System.currentTimeMillis()
        runOnUiThread { protegerTela() }
        return ""
    }

    /* Com bloqueio, o conteúdo também some da lista de apps recentes e não sai
       em captura de tela. */
    private fun protegerTela() {
        if (comBloqueio) window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        else window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        @Suppress("DEPRECATION")
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == PEDIDO_DESBLOQUEIO) {
            confirmando = false
            if (resultCode == RESULT_OK) {
                desbloqueado = true
                saiuEm = System.currentTimeMillis()
                web.visibility = View.VISIBLE
            } else {
                finish()
            }
            return
        }
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
        atualizador.encerrar()
        web.destroy()
        super.onDestroy()
    }

    companion object {
        private const val PEDIDO_SELETOR = 41
        private const val PEDIDO_DESBLOQUEIO = 42
    }
}
