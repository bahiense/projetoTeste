package com.bahiense.feed

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Base64
import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.security.MessageDigest
import java.security.SecureRandom

/**
 * Login na conta Google e chamadas à API do YouTube, para a página.
 *
 * O login acontece no navegador do aparelho, na página do próprio Google. O app
 * nunca vê a senha: o que volta para cá é um código, trocado por um token com
 * PKCE. O Google recusa OAuth em WebView (erro "disallowed_useragent"), e com
 * razão — dentro de um WebView o app poderia ler o que a pessoa digita.
 *
 * As chamadas à API passam por aqui, e não por fetch na página, para o token
 * nunca chegar ao JavaScript: a página pede "cancele esta inscrição" e recebe
 * a resposta, sem nunca segurar a chave da conta.
 *
 * O ID do cliente OAuth vem do build (gradle.properties → youtubeClienteId).
 */
class YouTubeBridge(private val act: Activity, private val web: WebView) {

    private val prefs = act.getSharedPreferences("youtube", Context.MODE_PRIVATE)

    /* ---------------------------------------------------------- estado */

    @JavascriptInterface
    fun estado(): String = JSONObject().apply {
        put("possivel", CLIENTE.isNotEmpty())
        put("conectado", texto(P_REFRESH).isNotEmpty())
        put("conta", texto(P_CONTA))
    }.toString()

    /** Abre a página de login do Google no navegador do aparelho. */
    @JavascriptInterface
    fun conectar(): Boolean {
        if (CLIENTE.isEmpty()) return false
        val verificador = aleatorio(48)
        val marca = aleatorio(12)
        prefs.edit().putString(P_VERIF, verificador).putString(P_MARCA, marca).apply()

        val url = Uri.parse(AUTORIZAR).buildUpon()
            .appendQueryParameter("client_id", CLIENTE)
            .appendQueryParameter("redirect_uri", redirecionamento())
            .appendQueryParameter("response_type", "code")
            .appendQueryParameter("scope", ESCOPO)
            .appendQueryParameter("code_challenge", desafio(verificador))
            .appendQueryParameter("code_challenge_method", "S256")
            .appendQueryParameter("state", marca)
            /* offline + consent é o que faz o Google devolver refresh_token: sem
               ele o acesso morreria em uma hora, no meio de uma faxina longa. */
            .appendQueryParameter("access_type", "offline")
            .appendQueryParameter("prompt", "consent")
            .build()

        return try {
            act.startActivity(Intent(Intent.ACTION_VIEW, url))
            true
        } catch (e: Exception) {
            false
        }
    }

    /** Esquece a conta aqui e pede ao Google para cancelar a permissão. */
    @JavascriptInterface
    fun desconectar(): Boolean {
        val refresh = texto(P_REFRESH)
        prefs.edit().clear().apply()
        if (refresh.isNotEmpty()) Thread {
            try { postForm(REVOGAR, "token=" + enc(refresh)) } catch (e: Exception) { }
        }.start()
        return true
    }

    /* ------------------------------------------------------------ a API */

    /**
     * Uma chamada à API do YouTube: metodo GET, POST ou DELETE; caminho a partir
     * de /youtube/v3/ (ex: "subscriptions?part=snippet&mine=true"); corpo em JSON
     * ou vazio.
     *
     * Não devolve nada de imediato. Rede numa @JavascriptInterface travaria a
     * página até o Google responder; então o trabalho vai para outra thread e a
     * resposta volta em window.__ytResposta(pedido, codigo, texto). codigo é o
     * HTTP do Google, ou 0 quando nem deu para chegar lá (texto = o recado).
     */
    @JavascriptInterface
    fun chamar(pedido: String, metodo: String, caminho: String, corpo: String) {
        Thread {
            try {
                if (metodo !in listOf("GET", "POST", "DELETE")) throw Exception("Método $metodo não permitido.")
                val c = abrir(API + caminho)
                c.requestMethod = metodo
                c.setRequestProperty("Authorization", "Bearer " + acesso())
                if (corpo.isNotEmpty()) {
                    c.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                    c.doOutput = true
                    c.outputStream.use { it.write(corpo.toByteArray()) }
                }
                val codigo = c.responseCode
                val fluxo = if (codigo >= 400) c.errorStream else c.inputStream
                val texto = fluxo?.bufferedReader()?.use { it.readText() } ?: ""
                c.disconnect()
                if (codigo == 401) prefs.edit().remove(P_ACESSO).apply()
                responder(pedido, codigo, texto)
            } catch (e: Exception) {
                responder(pedido, 0, recado(e))
            }
        }.start()
    }

    /* ------------------------------------------------------ volta do navegador */

    /** Chamado pela MainActivity quando o navegador devolve o código. */
    fun receber(uri: Uri) {
        val erro = uri.getQueryParameter("error") ?: ""
        val codigo = uri.getQueryParameter("code") ?: ""
        val marca = prefs.getString(P_MARCA, "") ?: ""

        if (erro.isNotEmpty()) return conectou(false, if (erro == "access_denied")
            "Você recusou o acesso à conta." else "O Google recusou: $erro")
        if (marca.isEmpty() || uri.getQueryParameter("state") != marca)
            return conectou(false, "A resposta não confere com o pedido. Tente entrar de novo.")
        if (codigo.isEmpty()) return conectou(false, "O Google não devolveu o código de acesso.")

        Thread {
            try {
                val r = postForm(TOKEN,
                    "code=" + enc(codigo) +
                        "&client_id=" + enc(CLIENTE) +
                        "&code_verifier=" + enc(texto(P_VERIF)) +
                        "&redirect_uri=" + enc(redirecionamento()) +
                        "&grant_type=authorization_code")
                guardar(r)
                if (texto(P_REFRESH).isEmpty())
                    conectou(false, "O Google não devolveu permissão duradoura. " +
                        "Remova o app em myaccount.google.com e entre outra vez.")
                else conectou(true, texto(P_CONTA))
            } catch (e: Exception) {
                conectou(false, recado(e))
            }
        }.start()
    }

    /* ------------------------------------------------------------- tokens */

    private fun guardar(r: JSONObject) {
        val ed = prefs.edit()
        if (r.has("refresh_token")) ed.putString(P_REFRESH, r.getString("refresh_token"))
        ed.putString(P_ACESSO, r.optString("access_token"))
        /* Um minuto de folga: melhor renovar cedo que descobrir no meio da
           chamada que o token venceu entre a checagem e o envio. */
        ed.putLong(P_VENCE, System.currentTimeMillis() + (r.optLong("expires_in", 3600) - 60) * 1000L)
        emailDoToken(r.optString("id_token"))?.let { ed.putString(P_CONTA, it) }
        ed.remove(P_VERIF).remove(P_MARCA)
        ed.apply()
    }

    @Synchronized
    private fun acesso(): String {
        if (CLIENTE.isEmpty()) throw Exception("Este APK foi montado sem cliente do Google.")
        val atual = texto(P_ACESSO)
        if (atual.isNotEmpty() && prefs.getLong(P_VENCE, 0) > System.currentTimeMillis()) return atual

        val refresh = texto(P_REFRESH)
        if (refresh.isEmpty()) throw Exception("Conta do Google não conectada.")
        try {
            guardar(postForm(TOKEN, "grant_type=refresh_token&refresh_token=" + enc(refresh) +
                "&client_id=" + enc(CLIENTE)))
        } catch (e: Exception) {
            /* invalid_grant = a permissão morreu: a pessoa revogou, ou a tela de
               consentimento está em "Testes", onde o Google expira tudo em 7
               dias. Esquecer o token é o que faz a tela pedir novo login em vez
               de tentar para sempre. */
            if ((e.message ?: "").contains("invalid_grant")) {
                prefs.edit().remove(P_REFRESH).remove(P_ACESSO).apply()
                naJanela("window.__ytDesconectou && window.__ytDesconectou()")
                throw Exception("A permissão do Google expirou. Entre na conta outra vez.")
            }
            throw e
        }
        return texto(P_ACESSO)
    }

    /* ---------------------------------------------------------------- rede */

    /** Conexão já com prazo: sem isto um Wi-Fi ruim pendura a chamada. */
    private fun abrir(url: String): HttpURLConnection {
        val c = URL(url).openConnection() as HttpURLConnection
        c.connectTimeout = 20000
        c.readTimeout = 40000
        return c
    }

    private fun postForm(url: String, corpo: String): JSONObject {
        val c = abrir(url)
        c.requestMethod = "POST"
        c.setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
        c.doOutput = true
        c.outputStream.use { it.write(corpo.toByteArray()) }
        val codigo = c.responseCode
        if (codigo >= 400) {
            val erro = c.errorStream?.bufferedReader()?.use { it.readText() } ?: ""
            c.disconnect()
            throw Exception("HTTP $codigo " + resumir(erro))
        }
        val t = c.inputStream.bufferedReader().use { it.readText() }.also { c.disconnect() }
        return if (t.isEmpty()) JSONObject() else JSONObject(t)
    }

    /* ------------------------------------------------------------- miudezas */

    private fun texto(chave: String) = prefs.getString(chave, "") ?: ""

    private fun aleatorio(bytes: Int): String {
        val b = ByteArray(bytes)
        SecureRandom().nextBytes(b)
        return Base64.encodeToString(b, Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP)
    }

    private fun desafio(verificador: String): String = Base64.encodeToString(
        MessageDigest.getInstance("SHA-256").digest(verificador.toByteArray()),
        Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP)

    /** O redirecionamento de um cliente Android é o ID do cliente ao contrário. */
    private fun redirecionamento() =
        "com.googleusercontent.apps." + CLIENTE.removeSuffix(".apps.googleusercontent.com") +
            ":/oauth2redirect"

    /**
     * Só para mostrar na tela qual conta está conectada. Vem do id_token, que o
     * Google acabou de assinar e entregar nesta mesma resposta.
     */
    private fun emailDoToken(idToken: String): String? {
        if (idToken.isEmpty()) return null
        return try {
            val meio = idToken.split(".")[1]
            val json = String(Base64.decode(meio, Base64.URL_SAFE or Base64.NO_WRAP))
            JSONObject(json).optString("email").ifEmpty { null }
        } catch (e: Exception) {
            null
        }
    }

    /** Mensagem que caiba na tela, sem despejar o JSON de erro do Google. */
    private fun resumir(corpo: String): String {
        return try {
            val o = JSONObject(corpo)
            o.optString("error_description").ifEmpty {
                o.optJSONObject("error")?.optString("message") ?: o.optString("error")
            }
        } catch (e: Exception) {
            corpo.take(120)
        }
    }

    private fun recado(e: Exception): String {
        val m = e.message ?: "erro desconhecido"
        return when {
            m.contains("Unable to resolve host") || m.contains("timeout") ->
                "Sem internet para falar com o YouTube agora."
            else -> m
        }
    }

    /* ------------------------------------------------------ recado à página */

    private fun conectou(ok: Boolean, recado: String) = naJanela(
        "window.__ytConectou && window.__ytConectou(" + ok + "," +
            JSONObject.quote(recado) + ")")

    private fun responder(pedido: String, codigo: Int, texto: String) = naJanela(
        "window.__ytResposta && window.__ytResposta(" + JSONObject.quote(pedido) + "," +
            codigo + "," + JSONObject.quote(texto) + ")")

    private fun naJanela(js: String) = act.runOnUiThread { web.evaluateJavascript(js, null) }

    companion object {
        private val CLIENTE = BuildConfig.YOUTUBE_CLIENTE_ID
        private const val API = "https://www.googleapis.com/youtube/v3/"
        private const val AUTORIZAR = "https://accounts.google.com/o/oauth2/v2/auth"
        private const val TOKEN = "https://oauth2.googleapis.com/token"
        private const val REVOGAR = "https://oauth2.googleapis.com/revoke"
        /* youtube: ler e mudar as inscrições. openid/email: só para mostrar
           qual conta está conectada. */
        private const val ESCOPO = "https://www.googleapis.com/auth/youtube openid email"

        private const val P_REFRESH = "refresh"
        private const val P_ACESSO = "acesso"
        private const val P_VENCE = "vence"
        private const val P_CONTA = "conta"
        private const val P_VERIF = "verificador"
        private const val P_MARCA = "marca"

        private fun enc(v: String) = URLEncoder.encode(v, "UTF-8")

        /** O link que o navegador devolve é nosso? */
        fun nossoRedirecionamento(uri: Uri?): Boolean =
            uri != null && (uri.scheme ?: "").startsWith("com.googleusercontent.apps.")
    }
}
