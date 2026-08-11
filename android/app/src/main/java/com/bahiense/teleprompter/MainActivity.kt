package com.bahiense.teleprompter

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader

/**
 * O app é a mesma página web que roda no navegador, servida de dentro do APK
 * por um endereço https interno (appassets.androidplatform.net) — a câmera só
 * funciona em contexto seguro, e é isso que o WebViewAssetLoader garante.
 */
class MainActivity : Activity() {

    private lateinit var web: WebView
    private var pendingPermission: PermissionRequest? = null

    private val needed = arrayOf(Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

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
                    if (missing().isEmpty()) {
                        answer(request)
                    } else {
                        pendingPermission = request
                        requestPermissions(missing(), REQ_PERMS)
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

        web.addJavascriptInterface(VideoBridge(this), "AndroidBridge")
        setContentView(web)
        goFullscreen()

        val faltando = missing()
        if (faltando.isNotEmpty()) requestPermissions(faltando, REQ_PERMS)

        web.loadUrl("https://appassets.androidplatform.net/assets/index.html")
    }

    private fun has(permission: String): Boolean =
        checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED

    private fun hasPermissions(): Boolean = needed.all { has(it) }

    private fun missing(): Array<String> = needed.filter { !has(it) }.toTypedArray()

    /**
     * Libera para a página só o que o sistema realmente concedeu. Se o microfone
     * foi negado mas a câmera não, a página tenta de novo pedindo só vídeo, em vez
     * de ficar sem nada.
     */
    private fun answer(request: PermissionRequest) {
        val allowed = request.resources.filter { resource ->
            when (resource) {
                PermissionRequest.RESOURCE_VIDEO_CAPTURE -> has(Manifest.permission.CAMERA)
                PermissionRequest.RESOURCE_AUDIO_CAPTURE -> has(Manifest.permission.RECORD_AUDIO)
                else -> false
            }
        }.toTypedArray()

        if (allowed.isEmpty()) request.deny() else request.grant(allowed)
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
            answer(request)
            return
        }

        // A permissão chegou depois de a página já ter tentado e falhado: manda
        // tentar de novo, senão o app fica dizendo que não abriu a câmera até
        // ser reiniciado.
        if (has(Manifest.permission.CAMERA)) {
            web.evaluateJavascript("window.__retryCamera && window.__retryCamera()", null)
        }
    }

    private fun goFullscreen() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false)
        } else {
            @Suppress("DEPRECATION")
            web.systemUiVisibility = (View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION)
        }
    }

    /** Voltar: se o prompter estiver aberto, volta para a tela do texto; senão sai. */
    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        web.evaluateJavascript(
            "(function(){var p=document.getElementById('prompter');" +
                    "if(p&&p.classList.contains('is-active')){" +
                    "document.getElementById('btn-back').click();return 'handled';}" +
                    "return 'exit';})()"
        ) { result ->
            if (result != null && result.contains("handled")) return@evaluateJavascript
            super.onBackPressed()
        }
    }

    fun setCaptureService(on: Boolean) {
        val intent = Intent(this, CaptureService::class.java)
        try {
            if (on) startForegroundService(intent) else stopService(intent)
        } catch (e: Exception) {
            // sem o serviço a gravação ainda funciona; só perde a garantia do sistema
        }
    }

    override fun onDestroy() {
        setCaptureService(false)
        super.onDestroy()
    }

    fun openAppSettings() {
        val intent = Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
            data = android.net.Uri.fromParts("package", packageName, null)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        startActivity(intent)
    }

    fun shareUri(uri: android.net.Uri, mime: String) {
        val send = Intent(Intent.ACTION_SEND).apply {
            type = mime
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        startActivity(Intent.createChooser(send, "Compartilhar vídeo"))
    }

    private companion object {
        const val REQ_PERMS = 10
    }
}
