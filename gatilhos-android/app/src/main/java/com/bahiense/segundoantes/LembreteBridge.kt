package com.bahiense.segundoantes

import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONObject

/** A ponte que a seção de lembrete da página usa para marcar o aviso diário. */
class LembreteBridge(
    private val activity: MainActivity,
    private val web: WebView
) {

    @JavascriptInterface
    fun agendarLembrete(json: String) {
        Lembretes.salvarPlano(activity, json)
        Lembretes.reagendar(activity)
    }

    @JavascriptInterface
    fun estadoLembretes(): String {
        val o = JSONObject()
        o.put("ligado", Lembretes.ligado(activity))
        o.put("hora", Lembretes.hora(activity))
        o.put("permissao", Lembretes.podeNotificar(activity))
        o.put("exato", Lembretes.podeExato(activity))
        return o.toString()
    }

    @JavascriptInterface
    fun pedirPermissaoAviso() {
        activity.runOnUiThread { activity.pedirPermissaoDeAviso() }
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
