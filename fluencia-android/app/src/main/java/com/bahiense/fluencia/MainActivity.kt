package com.bahiense.fluencia

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader
import java.io.File

/**
 * O app é a mesma página web que roda no navegador, servida de dentro do APK
 * por um endereço https interno (appassets.androidplatform.net).
 *
 * O endereço interno não é firula: o microfone e o MediaRecorder só funcionam
 * em contexto seguro, e uma página aberta como file:// não é. É também o que
 * dá à página uma origem estável, para o progresso guardado não sumir.
 *
 * O que o WebView não tem é voz: nem a fala do sistema (speechSynthesis) nem o
 * reconhecimento (SpeechRecognition) existem dentro dele. Quem repõe as duas
 * coisas é a VozBridge, do lado nativo, com a página conversando com ela pelo
 * js/ponte-android.js.
 */
class MainActivity : Activity() {

    private lateinit var web: WebView
    private lateinit var voz: VozBridge
    private lateinit var lembrete: LembreteBridge
    private var pendingPermission: PermissionRequest? = null
    private var pedidoDaPagina = false
    private var pedindoAviso = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // /assets/ é o app; /gravacoes/ devolve à página o áudio que o lado
        // nativo gravou, pelo mesmo endereço seguro do resto do conteúdo
        val gravacoes = File(cacheDir, "gravacoes")
        if (!gravacoes.exists()) gravacoes.mkdirs()

        val loader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .addPathHandler("/gravacoes/", WebViewAssetLoader.InternalStoragePathHandler(this, gravacoes))
            .build()

        web = WebView(this)
        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? = loader.shouldInterceptRequest(request.url)
        }

        web.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest) {
                runOnUiThread {
                    if (temMicrofone()) {
                        responder(request)
                    } else {
                        pendingPermission = request
                        requestPermissions(arrayOf(Manifest.permission.RECORD_AUDIO), REQ_PERMS)
                    }
                }
            }

            override fun onPermissionRequestCanceled(request: PermissionRequest) {
                if (pendingPermission == request) pendingPermission = null
            }
        }

        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            allowFileAccess = false
            allowContentAccess = false
        }

        voz = VozBridge(this, web)
        web.addJavascriptInterface(voz, "AndroidVoz")
        lembrete = LembreteBridge(this, web)
        web.addJavascriptInterface(lembrete, "AndroidLembrete")
        setContentView(web)

        // Alarme não sobrevive a uma atualização do app; o plano guardado, sim.
        Lembretes.reagendar(this)

        // Pede o microfone na abertura: o primeiro exercício do dia já usa, e um
        // pedido no meio de um exercício de fala atrapalha mais do que ajuda.
        if (!temMicrofone()) {
            requestPermissions(arrayOf(Manifest.permission.RECORD_AUDIO), REQ_PERMS)
        }

        web.loadUrl("https://appassets.androidplatform.net/assets/index.html")
    }

    fun temMicrofone(): Boolean =
        checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED

    /**
     * Pedido de microfone vindo da página, e não do WebView.
     *
     * O reconhecimento de fala funciona sem esta permissão, porque quem grava é
     * o serviço do sistema — mas a gravação do próprio app precisa dela. Sem
     * este caminho, quem tivesse negado o aviso da abertura ficaria sem gravar
     * para sempre, sem entender por quê.
     */
    fun pedirMicrofone() {
        if (temMicrofone()) {
            avisarMicrofone(true)
            return
        }
        pedidoDaPagina = true
        requestPermissions(arrayOf(Manifest.permission.RECORD_AUDIO), REQ_PERMS)
    }

    private fun avisarMicrofone(liberado: Boolean) {
        web.evaluateJavascript(
            "window.__ponteMicrofone && window.__ponteMicrofone($liberado)", null
        )
    }

    private fun responder(request: PermissionRequest) {
        val liberados = request.resources.filter {
            it == PermissionRequest.RESOURCE_AUDIO_CAPTURE && temMicrofone()
        }.toTypedArray()

        if (liberados.isEmpty()) request.deny() else request.grant(liberados)
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)

        if (requestCode == REQ_AVISO) {
            if (pedindoAviso) {
                pedindoAviso = false
                val ok = Lembretes.podeNotificar(this)
                if (ok) Lembretes.reagendar(this)
                lembrete.avisarPermissao(ok)
            }
            return
        }

        if (requestCode != REQ_PERMS) return

        val request = pendingPermission
        if (request != null) {
            pendingPermission = null
            responder(request)
        }

        if (pedidoDaPagina) {
            pedidoDaPagina = false
            avisarMicrofone(temMicrofone())
        }
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
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), REQ_AVISO)
            return
        }
        // Sem o diálogo do sistema, resta abrir os ajustes de notificação do app
        try {
            startActivity(
                Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                    .putExtra(Settings.EXTRA_APP_PACKAGE, packageName)
            )
        } catch (e: Exception) {
            abrirAjustesDoApp()
        }
        lembrete.avisarPermissao(false)
    }

    /** Alarme no horário certo: no Android 12+ o usuário precisa liberar. */
    fun abrirAjustesDeAlarme() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return
        try {
            startActivity(
                Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
                    .setData(Uri.parse("package:$packageName"))
            )
        } catch (e: Exception) {
            abrirAjustesDoApp()
        }
    }

    private fun abrirAjustesDoApp() {
        try {
            startActivity(
                Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                    .setData(Uri.parse("package:$packageName"))
            )
        } catch (e: Exception) {
        }
    }

    /** O app navega por hash (#/hoje, #/pronuncia): voltar devolve à tela anterior. */
    @Suppress("DEPRECATION", "OVERRIDE_DEPRECATION")
    override fun onBackPressed() {
        if (web.canGoBack()) web.goBack() else super.onBackPressed()
    }

    override fun onPause() {
        super.onPause()
        // Sair do app com a voz falando deixaria o áudio tocando por cima de tudo,
        // e o reconhecimento segurando o microfone.
        voz.pararTudo()
    }

    override fun onDestroy() {
        voz.desligar()
        web.destroy()
        super.onDestroy()
    }

    companion object {
        private const val REQ_PERMS = 42
        private const val REQ_AVISO = 43
    }
}
