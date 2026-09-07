package com.bahiense.fluencia

import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONObject

/**
 * A ponte que a tela de ajustes usa para marcar os lembretes.
 *
 * Fica separada da VozBridge de propósito: são dois assuntos distintos, e a
 * página precisa saber qual das duas falta quando algo não funciona.
 */
class LembreteBridge(
    private val activity: MainActivity,
    private val web: WebView
) {

    @JavascriptInterface
    fun agendarLembretes(json: String): String {
        Lembretes.salvarPlano(activity, json)
        val n = Lembretes.reagendar(activity)
        return n.toString()
    }

    @JavascriptInterface
    fun estadoLembretes(): String {
        val o = JSONObject()
        o.put("permissao", Lembretes.podeNotificar(activity))
        o.put("exato", Lembretes.podeExato(activity))
        o.put("agendados", if (Lembretes.plano(activity).optBoolean("ligado", false)) {
            Lembretes.plano(activity).optJSONArray("dias")?.length() ?: 0
        } else 0)
        return o.toString()
    }

    @JavascriptInterface
    fun pedirPermissaoAviso() {
        activity.runOnUiThread { activity.pedirPermissaoDeAviso() }
    }

    @JavascriptInterface
    fun abrirAjustesDeAlarme() {
        activity.runOnUiThread { activity.abrirAjustesDeAlarme() }
    }

    /** Resposta do pedido de permissão, de volta para a página. */
    fun avisarPermissao(ok: Boolean) {
        web.post {
            web.evaluateJavascript(
                "window.__pontePermissaoAviso && window.__pontePermissaoAviso($ok)", null
            )
        }
    }
}
