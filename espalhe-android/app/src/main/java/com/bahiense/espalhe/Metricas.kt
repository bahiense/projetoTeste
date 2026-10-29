package com.bahiense.espalhe

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.util.Base64
import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.security.MessageDigest
import java.security.SecureRandom
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.concurrent.Executors

/**
 * Visualizações, curtidas, comentários e compartilhamentos de cada perfil,
 * lidos pelas APIs oficiais. A ligação é por perfil: dois Instagram são duas
 * ligações, cada uma com o seu token.
 *
 * Os tokens ficam só aqui, no lado nativo; a página pede "busque os números
 * deste perfil" e recebe a lista já arrumada, sem nunca segurar a chave da conta.
 * Todo post sai no mesmo formato, de qualquer rede:
 *   {id, data, texto, miniatura, link, tipo, views, likes, comentarios, compart}
 * com null onde a rede não informa aquele número.
 *
 * Como cada rede liga:
 *  - Instagram, Threads, Facebook: a pessoa cola um token gerado no painel da
 *    Meta para desenvolvedores. Sem senha no app e sem segredo de cliente.
 *  - YouTube: login do Google no navegador, com PKCE (como no Feed Limpo).
 *  - TikTok: login no navegador; a volta passa por uma página no GitHub Pages
 *    (espalhe-volta/) que devolve o código ao app pelo endereço espalhe://volta.
 */
class Metricas(private val context: Context, private val web: WebView) {

    private val prefs = context.getSharedPreferences("metricas", Context.MODE_PRIVATE)
    private val trabalho = Executors.newFixedThreadPool(3)
    private val principal = Handler(Looper.getMainLooper())

    // ------------------------------------------------------------- estado

    @JavascriptInterface
    fun estado(perfil: String): String {
        val c = conexao(perfil)
        return JSONObject()
            .put("conectado", c != null)
            .put("conta", c?.optString("conta") ?: "")
            .toString()
    }

    @JavascriptInterface
    fun configuracao(): String = JSONObject()
        .put("google", GOOGLE_CLIENTE.isNotEmpty())
        .put("tiktok", tiktokApp() != null)
        .put("tiktokVolta", tiktokApp()?.optString("volta") ?: VOLTA_PADRAO)
        .put("volta", VOLTA_PADRAO)
        .toString()

    @JavascriptInterface
    fun desconectar(perfil: String) {
        prefs.edit().remove("c_$perfil").apply()
    }

    // ------------------------------------------- Instagram, Threads, Facebook

    /**
     * Confere o token colado e guarda. No Facebook, um token de usuário que
     * administra várias Páginas volta com a lista para a pessoa escolher.
     */
    @JavascriptInterface
    fun conectarToken(pedido: Int, perfil: String, rede: String, token: String) {
        trabalho.execute {
            responder(pedido, tentar {
                val t = token.trim()
                when (rede) {
                    "instagram" -> {
                        val eu = get("$IG/me?fields=username&access_token=${enc(t)}")
                        salvar(perfil, JSONObject().put("rede", rede).put("token", t)
                            .put("renovado", System.currentTimeMillis())
                            .put("conta", "@" + eu.optString("username")))
                    }
                    "threads" -> {
                        val eu = get("$TH/me?fields=username&access_token=${enc(t)}")
                        salvar(perfil, JSONObject().put("rede", rede).put("token", t)
                            .put("renovado", System.currentTimeMillis())
                            .put("conta", "@" + eu.optString("username")))
                    }
                    "facebook" -> conectarFacebook(perfil, t)
                    else -> throw Falha("Esta rede não liga por token.")
                }
            })
        }
    }

    private fun conectarFacebook(perfil: String, t: String): JSONObject {
        // token de usuário: lista as Páginas que ele administra
        val paginas = try {
            get("$FB/me/accounts?fields=id,name,access_token&limit=100&access_token=${enc(t)}")
                .optJSONArray("data") ?: JSONArray()
        } catch (e: Falha) {
            JSONArray()  // já é token de Página: /me/accounts não existe para ela
        }
        if (paginas.length() == 0) {
            val eu = get("$FB/me?fields=id,name&access_token=${enc(t)}")
            return salvar(perfil, JSONObject().put("rede", "facebook").put("token", t)
                .put("conta", eu.optString("name")))
        }
        if (paginas.length() == 1) return guardarPagina(perfil, paginas.getJSONObject(0))
        // várias: guarda a lista (com os tokens) só aqui e devolve só os nomes
        prefs.edit().putString("paginas_$perfil", paginas.toString()).apply()
        val nomes = JSONArray()
        for (i in 0 until paginas.length()) {
            val p = paginas.getJSONObject(i)
            nomes.put(JSONObject().put("id", p.getString("id")).put("nome", p.optString("name")))
        }
        return JSONObject().put("paginas", nomes)
    }

    @JavascriptInterface
    fun escolherPagina(pedido: Int, perfil: String, paginaId: String) {
        trabalho.execute {
            responder(pedido, tentar {
                val lista = JSONArray(prefs.getString("paginas_$perfil", "[]"))
                var escolhida: JSONObject? = null
                for (i in 0 until lista.length()) {
                    if (lista.getJSONObject(i).getString("id") == paginaId) escolhida = lista.getJSONObject(i)
                }
                prefs.edit().remove("paginas_$perfil").apply()
                guardarPagina(perfil, escolhida ?: throw Falha("Página não encontrada. Cole o token de novo."))
            })
        }
    }

    /* O token de Página tirado de um token de usuário de longa duração não vence. */
    private fun guardarPagina(perfil: String, p: JSONObject) = salvar(perfil, JSONObject()
        .put("rede", "facebook").put("token", p.getString("access_token")).put("conta", p.optString("name")))

    // ------------------------------------------------- login pelo navegador

    /** YouTube: abre o login do Google no navegador. A volta chega em receber(). */
    @JavascriptInterface
    fun conectarGoogle(perfil: String): String {
        if (GOOGLE_CLIENTE.isEmpty()) return "Este APK foi montado sem o ID do cliente do Google (veja o README)."
        val verif = aleatorio(48)
        val marca = aleatorio(12)
        anotarLogin(marca, perfil, "youtube", verif)
        abrirNavegador(Uri.parse("https://accounts.google.com/o/oauth2/v2/auth").buildUpon()
            .appendQueryParameter("client_id", GOOGLE_CLIENTE)
            .appendQueryParameter("redirect_uri", voltaGoogle())
            .appendQueryParameter("response_type", "code")
            .appendQueryParameter("scope", ESCOPO_GOOGLE)
            .appendQueryParameter("code_challenge", desafio(verif))
            .appendQueryParameter("code_challenge_method", "S256")
            .appendQueryParameter("state", marca)
            // offline + consent: é o que faz o Google devolver o refresh_token
            .appendQueryParameter("access_type", "offline")
            .appendQueryParameter("prompt", "consent")
            .build())
        return ""
    }

    /** As chaves do app que a pessoa criou no TikTok for Developers. Ficam só no aparelho. */
    @JavascriptInterface
    fun configurarTikTok(chave: String, segredo: String, volta: String) {
        prefs.edit().putString("tiktok_app", JSONObject()
            .put("chave", chave.trim()).put("segredo", segredo.trim())
            .put("volta", volta.trim().ifEmpty { VOLTA_PADRAO }).toString()).apply()
    }

    @JavascriptInterface
    fun conectarTikTok(perfil: String): String {
        val app = tiktokApp() ?: return "Preencha antes as chaves do app do TikTok."
        val marca = aleatorio(12)
        anotarLogin(marca, perfil, "tiktok", "")
        abrirNavegador(Uri.parse("https://www.tiktok.com/v2/auth/authorize/").buildUpon()
            .appendQueryParameter("client_key", app.getString("chave"))
            .appendQueryParameter("scope", "user.info.basic,video.list")
            .appendQueryParameter("response_type", "code")
            .appendQueryParameter("redirect_uri", app.getString("volta"))
            .appendQueryParameter("state", marca)
            .build())
        return ""
    }

    /** Chamado pela MainActivity quando o navegador devolve o código. */
    fun receber(uri: Uri) {
        val login = JSONObject(prefs.getString("login", "{}") ?: "{}")
        val perfil = login.optString("perfil")
        val rede = login.optString("rede")
        val erro = uri.getQueryParameter("error") ?: ""
        val codigo = uri.getQueryParameter("code") ?: ""
        if (perfil.isEmpty()) return
        if (erro.isNotEmpty()) return conectou(perfil, false,
            if (erro == "access_denied") "Você recusou o acesso." else "A rede recusou: $erro")
        if (uri.getQueryParameter("state") != login.optString("marca"))
            return conectou(perfil, false, "A resposta não confere com o pedido. Tente de novo.")
        if (codigo.isEmpty()) return conectou(perfil, false, "A rede não devolveu o código de acesso.")
        prefs.edit().remove("login").apply()

        trabalho.execute {
            try {
                val c = if (rede == "youtube") {
                    val r = postForm(GOOGLE_TOKEN, "code=${enc(codigo)}&client_id=${enc(GOOGLE_CLIENTE)}" +
                        "&code_verifier=${enc(login.optString("verif"))}&redirect_uri=${enc(voltaGoogle())}" +
                        "&grant_type=authorization_code")
                    if (!r.has("refresh_token")) throw Falha("O Google não devolveu permissão duradoura. Tente de novo.")
                    val c = JSONObject().put("rede", rede).put("refresh", r.getString("refresh_token"))
                    tokenGoogle(c, r)
                    val canal = getAuth("$YT/channels?part=snippet&mine=true", c.getString("acesso"))
                        .optJSONArray("items")?.optJSONObject(0)
                        ?: throw Falha("Essa conta do Google não tem canal no YouTube.")
                    c.put("conta", canal.getJSONObject("snippet").optString("title"))
                } else {
                    val app = tiktokApp() ?: throw Falha("Chaves do TikTok sumiram.")
                    val r = postForm(TT_TOKEN, "client_key=${enc(app.getString("chave"))}" +
                        "&client_secret=${enc(app.getString("segredo"))}&code=${enc(codigo)}" +
                        "&grant_type=authorization_code&redirect_uri=${enc(app.getString("volta"))}")
                    val c = JSONObject().put("rede", rede)
                    tokenTikTok(c, r)
                    val u = tiktok("GET", "$TT/user/info/?fields=display_name", null, c.getString("acesso"))
                    c.put("conta", u.optJSONObject("data")?.optJSONObject("user")?.optString("display_name") ?: "")
                }
                salvar(perfil, c)
                conectou(perfil, true, c.optString("conta"))
            } catch (e: Exception) {
                conectou(perfil, false, recado(e))
            }
        }
    }

    // --------------------------------------------------------------- buscar

    /** Os posts recentes do perfil, cada um com os seus números. */
    @JavascriptInterface
    fun buscar(pedido: Int, perfil: String) {
        trabalho.execute {
            responder(pedido, tentar {
                val c = conexao(perfil) ?: throw Falha("Perfil não conectado.")
                val posts = when (c.getString("rede")) {
                    "instagram" -> instagram(perfil, c)
                    "threads" -> threads(perfil, c)
                    "facebook" -> facebook(c)
                    "youtube" -> youtube(perfil, c)
                    "tiktok" -> tiktokVideos(perfil, c)
                    else -> JSONArray()
                }
                JSONObject().put("conta", c.optString("conta")).put("posts", posts)
                    .put("em", System.currentTimeMillis())
            })
        }
    }

    /** Quem comentou (e, onde a rede conta, quem reagiu) num post. */
    @JavascriptInterface
    fun comentarios(pedido: Int, perfil: String, postId: String) {
        trabalho.execute {
            responder(pedido, tentar {
                val c = conexao(perfil) ?: throw Falha("Perfil não conectado.")
                val lista = JSONArray()
                var reacoes: JSONArray? = null
                val id = enc(postId)
                when (c.getString("rede")) {
                    "instagram" -> dados(get("$IG/$id/comments?fields=username,text,timestamp&limit=50&access_token=${tok(c)}"))
                        .forEach { lista.put(comentario("@" + it.optString("username"), it.optString("text"), it.optString("timestamp"))) }
                    "threads" -> dados(get("$TH/$id/replies?fields=username,text,timestamp&access_token=${tok(c)}"))
                        .forEach { lista.put(comentario("@" + it.optString("username"), it.optString("text"), it.optString("timestamp"))) }
                    "facebook" -> {
                        dados(get("$FB/$id/comments?fields=from{name},message,created_time&limit=50&access_token=${tok(c)}"))
                            .forEach {
                                lista.put(comentario(it.optJSONObject("from")?.optString("name") ?: "Alguém",
                                    it.optString("message"), it.optString("created_time")))
                            }
                        // o Facebook ainda mostra quem reagiu aos posts da própria Página
                        reacoes = try {
                            JSONArray().also { r ->
                                dados(get("$FB/$id/reactions?fields=name,type&limit=100&access_token=${tok(c)}"))
                                    .forEach { r.put(JSONObject().put("nome", it.optString("name")).put("tipo", it.optString("type"))) }
                            }
                        } catch (e: Falha) { null }
                    }
                    "youtube" -> dados(getAuth("$YT/commentThreads?part=snippet&maxResults=50&order=time&videoId=$id", acessoGoogle(perfil, c)), "items")
                        .forEach {
                            val s = it.getJSONObject("snippet").getJSONObject("topLevelComment").getJSONObject("snippet")
                            lista.put(comentario(s.optString("authorDisplayName"), s.optString("textOriginal"), s.optString("publishedAt")))
                        }
                    else -> return@tentar JSONObject().put("indisponivel", true)
                }
                JSONObject().put("comentarios", lista).put("reacoes", reacoes ?: JSONObject.NULL)
            })
        }
    }

    private fun comentario(autor: String, texto: String, data: String) =
        JSONObject().put("autor", autor).put("texto", texto).put("data", quando(data))

    // ---- Instagram (API do Instagram com login do Instagram, conta Profissional)

    private fun instagram(perfil: String, c: JSONObject): JSONArray {
        renovarMeta(perfil, c, "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token")
        val campos = "id,caption,media_type,media_product_type,timestamp,permalink,thumbnail_url,media_url,like_count,comments_count"
        val itens = dados(get("$IG/me/media?fields=$campos&limit=25&access_token=${tok(c)}")).toMutableList()
        // Stories só existem por 24 horas, e não aparecem em /media
        try {
            itens += dados(get("$IG/me/stories?fields=$campos&access_token=${tok(c)}"))
        } catch (e: Falha) { }
        val saida = JSONArray()
        for (m in itens) {
            val produto = m.optString("media_product_type")
            val tipo = when (produto) { "STORY" -> "story"; "REELS" -> "reel"; else -> "post" }
            // cada tipo aceita uma lista de métricas; uma métrica errada derruba o pedido inteiro
            val listas = if (tipo == "story") listOf("views,reach,shares,replies", "reach")
            else listOf("views,reach,likes,comments,shares,saved", "reach,likes,comments,shares,saved", "reach")
            val ins = insights(listas) { "$IG/${m.getString("id")}/insights?metric=$it&access_token=${tok(c)}" }
            saida.put(post(
                m.getString("id"), quando(m.optString("timestamp")), m.optString("caption"),
                m.optString("thumbnail_url").ifEmpty { m.optString("media_url") }, m.optString("permalink"), tipo,
                views = ins["views"], likes = ins["likes"] ?: m.optNum("like_count"),
                comentarios = ins["comments"] ?: ins["replies"] ?: m.optNum("comments_count"),
                compart = ins["shares"], alcance = ins["reach"], salvos = ins["saved"]
            ))
        }
        return saida
    }

    // ---- Threads

    private fun threads(perfil: String, c: JSONObject): JSONArray {
        renovarMeta(perfil, c, "https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token")
        val itens = dados(get("$TH/me/threads?fields=id,text,timestamp,permalink,media_type,thumbnail_url,media_url&limit=25&access_token=${tok(c)}"))
        val saida = JSONArray()
        for (m in itens) {
            val ins = insights(listOf("views,likes,replies,reposts,quotes,shares", "views,likes,replies,reposts")) {
                "$TH/${m.getString("id")}/insights?metric=$it&access_token=${tok(c)}"
            }
            val compart = listOfNotNull(ins["reposts"], ins["shares"], ins["quotes"]).takeIf { it.isNotEmpty() }?.sum()
            saida.put(post(
                m.getString("id"), quando(m.optString("timestamp")), m.optString("text"),
                m.optString("thumbnail_url").ifEmpty { m.optString("media_url") }, m.optString("permalink"), "post",
                views = ins["views"], likes = ins["likes"], comentarios = ins["replies"], compart = compart
            ))
        }
        return saida
    }

    // ---- Facebook (Página)

    private fun facebook(c: JSONObject): JSONArray {
        val campos = "id,message,created_time,permalink_url,full_picture,shares," +
            "reactions.summary(total_count).limit(0),comments.summary(total_count).limit(0)"
        val itens = dados(get("$FB/me/posts?fields=${enc(campos)}&limit=25&access_token=${tok(c)}"))
        val saida = JSONArray()
        for (m in itens) {
            // "post_media_view" é a métrica de visualizações nova; a antiga fica de reserva
            val ins = insights(listOf("post_media_view", "post_impressions")) {
                "$FB/${m.getString("id")}/insights?metric=$it&access_token=${tok(c)}"
            }
            saida.put(post(
                m.getString("id"), quando(m.optString("created_time")), m.optString("message"),
                m.optString("full_picture"), m.optString("permalink_url"), "post",
                views = ins["post_media_view"] ?: ins["post_impressions"],
                likes = m.optJSONObject("reactions")?.optJSONObject("summary")?.optNum("total_count"),
                comentarios = m.optJSONObject("comments")?.optJSONObject("summary")?.optNum("total_count"),
                compart = m.optJSONObject("shares")?.optNum("count") ?: 0L
            ))
        }
        return saida
    }

    // ---- YouTube

    private fun youtube(perfil: String, c: JSONObject): JSONArray {
        val acesso = acessoGoogle(perfil, c)
        val canal = getAuth("$YT/channels?part=contentDetails&mine=true", acesso)
            .optJSONArray("items")?.optJSONObject(0) ?: return JSONArray()
        val envios = canal.getJSONObject("contentDetails").getJSONObject("relatedPlaylists").getString("uploads")
        val ids = dados(getAuth("$YT/playlistItems?part=contentDetails&maxResults=25&playlistId=$envios", acesso), "items")
            .map { it.getJSONObject("contentDetails").getString("videoId") }
        if (ids.isEmpty()) return JSONArray()
        val videos = dados(getAuth("$YT/videos?part=snippet,statistics,contentDetails&id=${ids.joinToString(",")}", acesso), "items")

        // compartilhamentos só existem na API de Analytics
        val compart = mutableMapOf<String, Long>()
        try {
            val hoje = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
            val r = getAuth("https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE" +
                "&startDate=2006-01-01&endDate=$hoje&metrics=shares&dimensions=video" +
                "&filters=video==${ids.joinToString(",")}", acesso)
            val linhas = r.optJSONArray("rows") ?: JSONArray()
            for (i in 0 until linhas.length()) {
                val l = linhas.getJSONArray(i)
                compart[l.getString(0)] = l.getLong(1)
            }
        } catch (e: Falha) { }

        val saida = JSONArray()
        for (v in videos) {
            val s = v.getJSONObject("snippet")
            val st = v.optJSONObject("statistics") ?: JSONObject()
            val id = v.getString("id")
            val curto = segundos(v.optJSONObject("contentDetails")?.optString("duration") ?: "") <= 180
            saida.put(post(
                id, quando(s.optString("publishedAt")), s.optString("title"),
                s.optJSONObject("thumbnails")?.optJSONObject("medium")?.optString("url") ?: "",
                if (curto) "https://youtube.com/shorts/$id" else "https://youtu.be/$id",
                if (curto) "short" else "video",
                views = st.optNum("viewCount"), likes = st.optNum("likeCount"),
                comentarios = st.optNum("commentCount"), compart = compart[id] ?: if (compart.isEmpty()) null else 0L
            ))
        }
        return saida
    }

    private fun acessoGoogle(perfil: String, c: JSONObject): String {
        if (c.optLong("vence") > System.currentTimeMillis()) return c.getString("acesso")
        try {
            tokenGoogle(c, postForm(GOOGLE_TOKEN, "grant_type=refresh_token&refresh_token=${enc(c.getString("refresh"))}" +
                "&client_id=${enc(GOOGLE_CLIENTE)}"))
        } catch (e: Falha) {
            if (e.message.orEmpty().contains("invalid_grant")) {
                desconectar(perfil)
                throw Falha("A permissão do Google expirou. Conecte o perfil de novo.")
            }
            throw e
        }
        salvar(perfil, c)
        return c.getString("acesso")
    }

    private fun tokenGoogle(c: JSONObject, r: JSONObject) {
        c.put("acesso", r.getString("access_token"))
        c.put("vence", System.currentTimeMillis() + (r.optLong("expires_in", 3600) - 60) * 1000L)
    }

    // ---- TikTok

    private fun tiktokVideos(perfil: String, c: JSONObject): JSONArray {
        val campos = "id,title,video_description,create_time,cover_image_url,share_url,view_count,like_count,comment_count,share_count"
        val r = tiktok("POST", "$TT/video/list/?fields=$campos", JSONObject().put("max_count", 20).toString(), acessoTikTok(perfil, c))
        val saida = JSONArray()
        for (v in dados(r.optJSONObject("data") ?: JSONObject(), "videos")) {
            saida.put(post(
                v.getString("id"), v.optLong("create_time") * 1000L,
                v.optString("video_description").ifEmpty { v.optString("title") },
                v.optString("cover_image_url"), v.optString("share_url"), "video",
                views = v.optNum("view_count"), likes = v.optNum("like_count"),
                comentarios = v.optNum("comment_count"), compart = v.optNum("share_count")
            ))
        }
        return saida
    }

    private fun acessoTikTok(perfil: String, c: JSONObject): String {
        if (c.optLong("vence") > System.currentTimeMillis()) return c.getString("acesso")
        val app = tiktokApp() ?: throw Falha("Chaves do app do TikTok não configuradas.")
        try {
            tokenTikTok(c, postForm(TT_TOKEN, "client_key=${enc(app.getString("chave"))}" +
                "&client_secret=${enc(app.getString("segredo"))}&grant_type=refresh_token" +
                "&refresh_token=${enc(c.getString("refresh"))}"))
        } catch (e: Falha) {
            desconectar(perfil)
            throw Falha("O acesso ao TikTok expirou. Conecte o perfil de novo.")
        }
        salvar(perfil, c)
        return c.getString("acesso")
    }

    private fun tokenTikTok(c: JSONObject, r: JSONObject) {
        val acesso = r.optString("access_token")
        if (acesso.isEmpty()) throw Falha(r.optString("error_description").ifEmpty { "O TikTok não devolveu o acesso." })
        c.put("acesso", acesso)
        c.put("refresh", r.optString("refresh_token"))
        c.put("vence", System.currentTimeMillis() + (r.optLong("expires_in", 86400) - 120) * 1000L)
    }

    /* A API do TikTok responde 200 com {"error":{"code":"ok"}} quando dá certo. */
    private fun tiktok(metodo: String, url: String, corpo: String?, acesso: String): JSONObject {
        val r = http(metodo, url, corpo, "application/json", acesso)
        val e = r.optJSONObject("error")
        if (e != null && e.optString("code") != "ok") throw Falha(e.optString("message").ifEmpty { e.optString("code") })
        return r
    }

    // ------------------------------------------------------------ miudezas

    /** Tokens do Instagram e do Threads valem 60 dias; renovar toda semana os mantém vivos. */
    private fun renovarMeta(perfil: String, c: JSONObject, url: String) {
        if (System.currentTimeMillis() - c.optLong("renovado") < 7L * 86_400_000L) return
        try {
            val r = get("$url&access_token=${tok(c)}")
            c.put("token", r.getString("access_token")).put("renovado", System.currentTimeMillis())
            salvar(perfil, c)
        } catch (e: Falha) {
            // token novo demais para renovar (menos de 24 h) não é problema; vencido é
            if (e.message.orEmpty().contains("expired", true) || e.message.orEmpty().contains("Session", true)) {
                desconectar(perfil)
                throw Falha("O token venceu. Gere um novo no painel da Meta e conecte de novo.")
            }
        }
    }

    /** Tenta as listas de métricas em ordem, até uma ser aceita. Devolve nome → número. */
    private fun insights(listas: List<String>, url: (String) -> String): Map<String, Long> {
        for (l in listas) {
            try {
                val r = mutableMapOf<String, Long>()
                for (d in dados(get(url(l)))) {
                    val v = d.optJSONObject("total_value")?.optNum("value")
                        ?: d.optJSONArray("values")?.optJSONObject(0)?.optNum("value")
                    if (v != null) r[d.getString("name")] = v
                }
                return r
            } catch (e: Falha) { }
        }
        return emptyMap()
    }

    private fun post(
        id: String, data: Long, texto: String, miniatura: String, link: String, tipo: String,
        views: Long?, likes: Long?, comentarios: Long?, compart: Long?,
        alcance: Long? = null, salvos: Long? = null
    ) = JSONObject().put("id", id).put("data", data).put("texto", texto.take(300))
        .put("miniatura", miniatura).put("link", link).put("tipo", tipo)
        .put("views", views ?: JSONObject.NULL).put("likes", likes ?: JSONObject.NULL)
        .put("comentarios", comentarios ?: JSONObject.NULL).put("compart", compart ?: JSONObject.NULL)
        .put("alcance", alcance ?: JSONObject.NULL).put("salvos", salvos ?: JSONObject.NULL)

    private fun JSONObject.optNum(k: String): Long? =
        if (has(k) && !isNull(k)) optString(k).toLongOrNull() ?: optDouble(k).takeIf { !it.isNaN() }?.toLong() else null

    private fun dados(o: JSONObject, chave: String = "data"): List<JSONObject> {
        val a = o.optJSONArray(chave) ?: return emptyList()
        return (0 until a.length()).mapNotNull { a.optJSONObject(it) }
    }

    /** Datas das APIs: "2026-10-29T10:00:00+0000" (Meta) ou "...Z" (Google). */
    private fun quando(s: String): Long {
        if (s.isEmpty()) return 0
        for (f in listOf("yyyy-MM-dd'T'HH:mm:ssZ", "yyyy-MM-dd'T'HH:mm:ssXXX", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")) {
            try {
                return SimpleDateFormat(f, Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }.parse(s)!!.time
            } catch (e: Exception) { }
        }
        return 0
    }

    /** Duração ISO 8601 do YouTube (PT1M30S) em segundos. */
    private fun segundos(d: String): Long {
        val m = Regex("PT(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+)S)?").find(d) ?: return Long.MAX_VALUE
        val (h, mi, s) = m.destructured
        return (h.toLongOrNull() ?: 0) * 3600 + (mi.toLongOrNull() ?: 0) * 60 + (s.toLongOrNull() ?: 0)
    }

    private fun tok(c: JSONObject) = enc(c.getString("token"))

    private fun conexao(perfil: String): JSONObject? =
        prefs.getString("c_$perfil", null)?.let { JSONObject(it) }

    private fun salvar(perfil: String, c: JSONObject): JSONObject {
        prefs.edit().putString("c_$perfil", c.toString()).apply()
        return JSONObject().put("ok", true).put("conta", c.optString("conta"))
    }

    private fun tiktokApp(): JSONObject? =
        prefs.getString("tiktok_app", null)?.let { JSONObject(it) }
            ?.takeIf { it.optString("chave").isNotEmpty() && it.optString("segredo").isNotEmpty() }

    private fun anotarLogin(marca: String, perfil: String, rede: String, verif: String) {
        prefs.edit().putString("login", JSONObject().put("marca", marca).put("perfil", perfil)
            .put("rede", rede).put("verif", verif).toString()).apply()
    }

    private fun abrirNavegador(uri: Uri) {
        context.startActivity(Intent(Intent.ACTION_VIEW, uri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }

    private fun aleatorio(bytes: Int): String {
        val b = ByteArray(bytes)
        SecureRandom().nextBytes(b)
        return Base64.encodeToString(b, Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP)
    }

    private fun desafio(v: String): String = Base64.encodeToString(
        MessageDigest.getInstance("SHA-256").digest(v.toByteArray()),
        Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP)

    /** O redirecionamento de um cliente Android do Google é o ID do cliente ao contrário. */
    private fun voltaGoogle() =
        "com.googleusercontent.apps." + GOOGLE_CLIENTE.removeSuffix(".apps.googleusercontent.com") + ":/oauth2redirect"

    // ---------------------------------------------------------------- rede

    private class Falha(msg: String) : Exception(msg)

    private fun get(url: String) = http("GET", url, null, null, null)
    private fun getAuth(url: String, acesso: String) = http("GET", url, null, null, acesso)
    private fun postForm(url: String, corpo: String) =
        http("POST", url, corpo, "application/x-www-form-urlencoded", null)

    private fun http(metodo: String, url: String, corpo: String?, tipo: String?, acesso: String?): JSONObject {
        val c = URL(url).openConnection() as HttpURLConnection
        c.connectTimeout = 20000
        c.readTimeout = 40000
        c.requestMethod = metodo
        if (acesso != null) c.setRequestProperty("Authorization", "Bearer $acesso")
        if (corpo != null) {
            c.setRequestProperty("Content-Type", tipo ?: "application/json")
            c.doOutput = true
            c.outputStream.use { it.write(corpo.toByteArray()) }
        }
        val codigo = c.responseCode
        val texto = (if (codigo >= 400) c.errorStream else c.inputStream)
            ?.bufferedReader()?.use { it.readText() } ?: ""
        c.disconnect()
        if (codigo >= 400) throw Falha(resumir(texto).ifEmpty { "HTTP $codigo" })
        return if (texto.isBlank()) JSONObject() else JSONObject(texto)
    }

    /** O recado de erro de cada API, sem despejar o JSON na tela. */
    private fun resumir(corpo: String): String = try {
        val o = JSONObject(corpo)
        val e = o.opt("error")
        when (e) {
            is JSONObject -> e.optString("message").ifEmpty { e.optString("code") }
            is String -> o.optString("error_description").ifEmpty { e }
            else -> o.optString("message")
        }
    } catch (x: Exception) {
        corpo.take(140)
    }

    private fun recado(e: Exception): String {
        val m = e.message ?: e.javaClass.simpleName
        return if (m.contains("Unable to resolve host") || m.contains("timeout", true)) "Sem internet agora." else m
    }

    private fun tentar(f: () -> JSONObject): JSONObject = try {
        f()
    } catch (e: Exception) {
        JSONObject().put("erro", recado(e))
    }

    private fun responder(pedido: Int, json: JSONObject) = principal.post {
        web.evaluateJavascript("window.__resposta && window.__resposta($pedido, $json)", null)
    }

    private fun conectou(perfil: String, ok: Boolean, recado: String) = principal.post {
        web.evaluateJavascript("window.__conectou && window.__conectou(${JSONObject.quote(perfil)}, $ok, ${JSONObject.quote(recado)})", null)
    }

    fun encerrar() = trabalho.shutdown()

    companion object {
        private val GOOGLE_CLIENTE = BuildConfig.GOOGLE_CLIENTE_ID
        val VOLTA_PADRAO = BuildConfig.VOLTA_TIKTOK

        private const val IG = "https://graph.instagram.com/v23.0"
        private const val TH = "https://graph.threads.net/v1.0"
        private const val FB = "https://graph.facebook.com/v23.0"
        private const val YT = "https://www.googleapis.com/youtube/v3"
        private const val TT = "https://open.tiktokapis.com/v2"
        private const val TT_TOKEN = "https://open.tiktokapis.com/v2/oauth/token/"
        private const val GOOGLE_TOKEN = "https://oauth2.googleapis.com/token"
        private const val ESCOPO_GOOGLE = "https://www.googleapis.com/auth/youtube.readonly " +
            "https://www.googleapis.com/auth/yt-analytics.readonly"

        private fun enc(v: String) = URLEncoder.encode(v, "UTF-8")

        /** É a volta de um login (Google ou TikTok)? */
        fun nossaVolta(uri: Uri?): Boolean = uri != null &&
            (uri.scheme == "espalhe" || (uri.scheme ?: "").startsWith("com.googleusercontent.apps."))
    }
}
