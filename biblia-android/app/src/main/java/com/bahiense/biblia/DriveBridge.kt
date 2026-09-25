package com.bahiense.biblia

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Base64
import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.security.MessageDigest
import java.security.SecureRandom
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/**
 * Cópia de segurança automática no Google Drive da própria pessoa.
 *
 * Por que existe, já havendo a cópia em Downloads: a pasta Downloads sobrevive
 * à desinstalação, mas não sobrevive ao celular. Perdeu o aparelho, caiu na
 * água, trocou de telefone — e a cópia foi com ele. O Drive é a única das três
 * que atravessa isso.
 *
 * O login acontece no navegador do aparelho, na página do próprio Google. O app
 * nunca vê a senha: o que volta para cá é um token, e um token que só alcança
 * os arquivos que este app criou (escopo drive.file). Ele não lê, não lista e
 * não apaga mais nada do Drive — nem se o código quisesse.
 *
 * Por que no navegador e não aqui dentro: o Google recusa OAuth em WebView
 * (erro "disallowed_useragent"), e com razão — dentro de um WebView o app
 * poderia ler o que a pessoa digita na página de login. A recusa é a garantia.
 *
 * O ID do cliente OAuth vem do build (gradle.properties → driveClienteId). Sem
 * ele o recurso fica desligado e a tela de Ajustes explica como criar o seu.
 * Não é segredo: cliente OAuth de Android não tem senha, e o que o protege é a
 * assinatura do APK registrada no Google Cloud.
 */
class DriveBridge(private val act: Activity, private val web: WebView) {

    private val prefs = act.getSharedPreferences("drive", Context.MODE_PRIVATE)

    /* ---------------------------------------------------------- estado */

    @JavascriptInterface
    fun estado(): String = JSONObject().apply {
        put("possivel", CLIENTE.isNotEmpty())
        put("conectado", texto(P_REFRESH).isNotEmpty())
        put("conta", texto(P_CONTA))
        put("em", texto(P_EM))
        put("pasta", PASTA)
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
               ele o acesso morreria em uma hora e a cópia automática pararia. */
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

    /* ------------------------------------------------- ida e volta do arquivo */

    /**
     * Grava o backup no Drive: uma pasta "Leitura Bíblica" e, dentro dela,
     * sempre o mesmo arquivo, atualizado em vez de duplicado.
     *
     * Não devolve nada de imediato. Rede numa @JavascriptInterface travaria a
     * página inteira até o Google responder; então o trabalho vai para outra
     * thread e a resposta volta pela janela, em window.__driveResposta.
     */
    @JavascriptInterface
    fun enviar(pedido: String, nome: String, conteudo: String) {
        Thread {
            try {
                val tk = acesso()
                val pasta = pasta(tk)
                var arquivo = texto(P_ARQ + nome)
                if (arquivo.isEmpty()) arquivo = achar(tk, nome, pasta)
                if (arquivo.isEmpty()) {
                    arquivo = criar(tk, nome, pasta, conteudo)
                } else if (!atualizar(tk, arquivo, conteudo)) {
                    /* Apagado no Drive por quem é dono dele: refaz, em vez de
                       ficar tentando escrever num arquivo que não existe. */
                    prefs.edit().remove(P_ARQ + nome).apply()
                    arquivo = criar(tk, nome, pasta, conteudo)
                }
                prefs.edit().putString(P_ARQ + nome, arquivo).putString(P_EM, agora()).apply()
                responder(pedido, true, texto(P_EM))
            } catch (e: Exception) {
                responder(pedido, false, recado(e))
            }
        }.start()
    }

    /** Traz o backup de volta — o caminho de quem trocou de celular. */
    @JavascriptInterface
    fun baixar(pedido: String, nome: String) {
        Thread {
            try {
                val tk = acesso()
                val arquivo = achar(tk, nome, pasta(tk))
                if (arquivo.isEmpty()) {
                    responder(pedido, false, "Não há cópia no Drive desta conta.")
                } else {
                    responder(pedido, true, pegar(
                        "https://www.googleapis.com/drive/v3/files/$arquivo?alt=media", tk))
                }
            } catch (e: Exception) {
                responder(pedido, false, recado(e))
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
            "Você recusou o acesso ao Drive." else "O Google recusou: $erro")
        if (marca.isEmpty() || uri.getQueryParameter("state") != marca)
            return conectou(false, "A resposta não confere com o pedido. Tente conectar de novo.")
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
                        "Desconecte o app em myaccount.google.com e conecte outra vez.")
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
        /* Um minuto de folga: melhor renovar cedo que descobrir no meio do
           envio que o token venceu entre a checagem e a chamada. */
        ed.putLong(P_VENCE, System.currentTimeMillis() + (r.optLong("expires_in", 3600) - 60) * 1000L)
        emailDoToken(r.optString("id_token"))?.let { ed.putString(P_CONTA, it) }
        ed.remove(P_VERIF).remove(P_MARCA)
        ed.apply()
    }

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
            /* invalid_grant = a permissão morreu (a pessoa revogou, ou a tela de
               consentimento está em "Testing", onde o Google expira tudo em 7
               dias). Esquecer o token é o que faz a tela pedir novo login em vez
               de tentar para sempre. */
            if ((e.message ?: "").contains("invalid_grant")) {
                prefs.edit().remove(P_REFRESH).remove(P_ACESSO).apply()
                throw Exception("A permissão do Google expirou. Conecte a conta outra vez — " +
                    "e confira se a tela de consentimento está publicada \"em produção\".")
            }
            throw e
        }
        return texto(P_ACESSO)
    }

    /* -------------------------------------------------------------- Drive */

    private fun pasta(tk: String): String {
        val guardada = texto(P_PASTA)
        if (guardada.isNotEmpty()) return guardada
        val achada = buscar(tk, "mimeType = 'application/vnd.google-apps.folder' and " +
            "name = '" + PASTA + "' and trashed = false")
        val id = if (achada.isNotEmpty()) achada else {
            val corpo = JSONObject()
                .put("name", PASTA)
                .put("mimeType", "application/vnd.google-apps.folder").toString()
            JSONObject(enviarJson("https://www.googleapis.com/drive/v3/files", tk,
                "application/json", corpo.toByteArray(), false)).getString("id")
        }
        prefs.edit().putString(P_PASTA, id).apply()
        return id
    }

    private fun achar(tk: String, nome: String, pasta: String) =
        buscar(tk, "name = '" + nome.replace("'", "\\'") + "' and '" + pasta +
            "' in parents and trashed = false")

    /**
     * Com drive.file a busca só alcança o que este app criou — então não há
     * risco de topar com um arquivo de mesmo nome de outra pessoa ou de outro
     * programa. Isso é o escopo trabalhando a favor.
     */
    private fun buscar(tk: String, consulta: String): String {
        val url = "https://www.googleapis.com/drive/v3/files?spaces=drive&pageSize=1" +
            "&fields=files(id)&q=" + enc(consulta)
        val arquivos = JSONObject(pegar(url, tk)).optJSONArray("files")
        return if (arquivos != null && arquivos.length() > 0)
            arquivos.getJSONObject(0).getString("id") else ""
    }

    private fun criar(tk: String, nome: String, pasta: String, conteudo: String): String {
        val meta = JSONObject().put("name", nome).put("parents", org.json.JSONArray().put(pasta))
        val corpo = ByteArrayOutputStream()
        corpo.write(("--$LIMITE\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
            meta + "\r\n--$LIMITE\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n")
            .toByteArray())
        corpo.write(conteudo.toByteArray())
        corpo.write("\r\n--$LIMITE--\r\n".toByteArray())
        return JSONObject(enviarJson(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
            tk, "multipart/related; boundary=$LIMITE", corpo.toByteArray(), false)).getString("id")
    }

    /** false quando o arquivo não existe mais lá; exceção para o resto. */
    private fun atualizar(tk: String, id: String, conteudo: String): Boolean {
        return try {
            enviarJson("https://www.googleapis.com/upload/drive/v3/files/$id?uploadType=media",
                tk, "application/json; charset=UTF-8", conteudo.toByteArray(), true)
            true
        } catch (e: Exception) {
            if ((e.message ?: "").contains("404")) false else throw e
        }
    }

    /* ---------------------------------------------------------------- rede */

    /** Conexão já com prazo: sem isto um Wi-Fi de hotel pendura o envio. */
    private fun abrir(url: String): HttpURLConnection {
        val c = URL(url).openConnection() as HttpURLConnection
        c.connectTimeout = 20000
        c.readTimeout = 40000
        return c
    }

    private fun pegar(url: String, tk: String): String {
        val c = abrir(url)
        c.setRequestProperty("Authorization", "Bearer $tk")
        return ler(c)
    }

    private fun enviarJson(
        url: String, tk: String, tipo: String, corpo: ByteArray, remendo: Boolean
    ): String {
        val c = abrir(url)
        c.requestMethod = "POST"
        /* HttpURLConnection não faz PATCH. O Google aceita este cabeçalho no
           lugar, e é o que evita arrastar uma biblioteca de HTTP para cá. */
        if (remendo) c.setRequestProperty("X-HTTP-Method-Override", "PATCH")
        c.setRequestProperty("Authorization", "Bearer $tk")
        c.setRequestProperty("Content-Type", tipo)
        c.doOutput = true
        c.outputStream.use { it.write(corpo) }
        return ler(c)
    }

    private fun postForm(url: String, corpo: String): JSONObject {
        val c = abrir(url)
        c.requestMethod = "POST"
        c.setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
        c.doOutput = true
        c.outputStream.use { it.write(corpo.toByteArray()) }
        val t = ler(c)
        return if (t.isEmpty()) JSONObject() else JSONObject(t)
    }

    private fun ler(c: HttpURLConnection): String {
        val codigo = c.responseCode
        if (codigo >= 400) {
            val erro = (c.errorStream?.bufferedReader()?.use { it.readText() } ?: "")
            c.disconnect()
            throw Exception("HTTP $codigo " + resumir(erro))
        }
        return c.inputStream.bufferedReader().use { it.readText() }.also { c.disconnect() }
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
     * Google acabou de assinar e entregar nesta mesma resposta — não é dado de
     * fora, e por isso não precisa de mais uma chamada de rede para conferir.
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

    private fun agora(): String {
        val f = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)
        f.timeZone = TimeZone.getTimeZone("UTC")
        return f.format(Date())
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
                "Sem internet para falar com o Drive agora."
            m.contains("HTTP 401") || m.contains("HTTP 403") ->
                "O Google não aceitou o acesso. Conecte a conta outra vez."
            else -> m
        }
    }

    /* ------------------------------------------------------ recado à página */

    private fun conectou(ok: Boolean, recado: String) = naJanela(
        "window.__driveConectou && window.__driveConectou(" + ok + "," +
            JSONObject.quote(recado) + ")")

    private fun responder(pedido: String, ok: Boolean, dados: String) = naJanela(
        "window.__driveResposta && window.__driveResposta(" + JSONObject.quote(pedido) + "," +
            ok + "," + JSONObject.quote(dados) + ")")

    private fun naJanela(js: String) = act.runOnUiThread { web.evaluateJavascript(js, null) }

    companion object {
        private val CLIENTE = BuildConfig.DRIVE_CLIENTE_ID
        private const val PASTA = "Leitura Bíblica"
        private const val AUTORIZAR = "https://accounts.google.com/o/oauth2/v2/auth"
        private const val TOKEN = "https://oauth2.googleapis.com/token"
        private const val REVOGAR = "https://oauth2.googleapis.com/revoke"
        /* drive.file: só os arquivos que este app criar. openid/email: só para
           mostrar de qual conta é a cópia. Todos escopos não sensíveis — é por
           isso que o app não precisa passar pela verificação do Google. */
        private const val ESCOPO = "https://www.googleapis.com/auth/drive.file openid email"
        private const val LIMITE = "limiteLeituraBiblica"

        private const val P_REFRESH = "refresh"
        private const val P_ACESSO = "acesso"
        private const val P_VENCE = "vence"
        private const val P_CONTA = "conta"
        private const val P_EM = "em"
        private const val P_VERIF = "verificador"
        private const val P_MARCA = "marca"
        private const val P_PASTA = "pasta"
        private const val P_ARQ = "arquivo:"

        private fun enc(v: String) = URLEncoder.encode(v, "UTF-8")

        /** O link que o navegador devolve é nosso? */
        fun nossoRedirecionamento(uri: Uri?): Boolean =
            uri != null && (uri.scheme ?: "").startsWith("com.googleusercontent.apps.")
    }
}
