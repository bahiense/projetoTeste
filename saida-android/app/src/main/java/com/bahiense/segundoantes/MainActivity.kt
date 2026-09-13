package com.bahiense.segundoantes

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.content.ActivityNotFoundException
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader

/**
 * O app é a mesma página que roda no navegador, servida de dentro do APK por
 * um endereço https interno (appassets.androidplatform.net).
 *
 * O endereço interno não é firula: uma página aberta como file:// não tem
 * origem estável, e o progresso guardado no localStorage pode sumir. Servida
 * assim, a origem é sempre a mesma — os 21 dias marcados e o registro de
 * episódios continuam lá depois de fechar, de atualizar o app e de reiniciar
 * o aparelho.
 *
 * O que a página não consegue sozinha é avisar com o app fechado e abrir o
 * discador. Quem repõe isso é a LembreteBridge e o desvio de tel: abaixo.
 */
class MainActivity : Activity() {

    private lateinit var web: WebView
    private lateinit var lembrete: LembreteBridge
    private var pedindoAviso = false

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

            /*
             * O botão de ligar para a pessoa de confiança é um link tel:. O
             * WebView não sabe o que fazer com ele sozinho — sem este desvio,
             * o toque simplesmente não faz nada.
             *
             * ACTION_DIAL abre o discador com o número posto, e quem aperta
             * ligar é a pessoa. Discar sozinho exigiria permissão de chamada e
             * seria pior: na crise, a decisão de ligar precisa continuar sendo
             * dela.
             */
            override fun shouldOverrideUrlLoading(
                view: WebView,
                request: WebResourceRequest
            ): Boolean {
                val url = request.url
                if (url.scheme != "tel" && url.scheme != "sms") return false
                try {
                    startActivity(Intent(Intent.ACTION_DIAL, url))
                } catch (e: ActivityNotFoundException) {
                    // aparelho sem discador: nada a fazer, e travar seria pior
                }
                return true
            }
        }

        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = false
            allowContentAccess = false
        }

        lembrete = LembreteBridge(this, web)
        web.addJavascriptInterface(lembrete, "AndroidLembrete")
        setContentView(web)

        // Alarme não sobrevive a uma atualização do app; o plano guardado, sim.
        Lembretes.reagendar(this)

        web.loadUrl("https://appassets.androidplatform.net/assets/index.html")
    }

    /**
     * Permissão de notificar. Só existe a partir do Android 13; antes disso o
     * que manda é o interruptor de notificações do aparelho, que o app não
     * consegue ligar sozinho — por isso a resposta ali é o estado real, e não
     * um "sim" otimista.
     */
    fun pedirPermissaoDeAviso() {
        if (Lembretes.podeNotificar(this)) {
            lembrete.avisarPermissao(true)
            return
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            pedindoAviso = true
            requestPermissions(arrayOf(android.Manifest.permission.POST_NOTIFICATIONS), REQ_AVISO)
            return
        }
        // Sem o diálogo do sistema, resta abrir os ajustes de notificação do app
        try {
            startActivity(
                Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                    .putExtra(Settings.EXTRA_APP_PACKAGE, packageName)
            )
        } catch (e: Exception) {
            try {
                startActivity(
                    Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                        .setData(Uri.parse("package:$packageName"))
                )
            } catch (e2: Exception) {
            }
        }
        lembrete.avisarPermissao(false)
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode != REQ_AVISO || !pedindoAviso) return
        pedindoAviso = false
        val ok = Lembretes.podeNotificar(this)
        if (ok) Lembretes.reagendar(this)
        lembrete.avisarPermissao(ok)
    }

    /** A página é uma só: voltar sai do app em vez de tentar navegar. */
    @Suppress("DEPRECATION", "OVERRIDE_DEPRECATION")
    override fun onBackPressed() {
        if (web.canGoBack()) web.goBack() else super.onBackPressed()
    }

    override fun onDestroy() {
        web.destroy()
        super.onDestroy()
    }

    companion object {
        private const val REQ_AVISO = 43
    }
}
