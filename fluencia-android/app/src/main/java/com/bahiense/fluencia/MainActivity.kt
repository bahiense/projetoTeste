package com.bahiense.fluencia

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.os.Bundle
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader

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
    private var pendingPermission: PermissionRequest? = null

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
        setContentView(web)

        // Pede o microfone na abertura: o primeiro exercício do dia já usa, e um
        // pedido no meio de um exercício de fala atrapalha mais do que ajuda.
        if (!temMicrofone()) {
            requestPermissions(arrayOf(Manifest.permission.RECORD_AUDIO), REQ_PERMS)
        }

        web.loadUrl("https://appassets.androidplatform.net/assets/index.html")
    }

    private fun temMicrofone(): Boolean =
        checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED

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
        if (requestCode != REQ_PERMS) return

        val request = pendingPermission
        if (request != null) {
            pendingPermission = null
            responder(request)
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
    }
}
