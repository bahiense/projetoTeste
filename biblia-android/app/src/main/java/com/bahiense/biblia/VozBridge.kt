package com.bahiense.biblia

import android.app.Activity
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONArray
import org.json.JSONObject
import java.util.Locale

/**
 * A leitura em voz alta dentro do app.
 *
 * No navegador a página usa o speechSynthesis, que já vem pronto. O WebView
 * do Android NÃO tem esse recurso: o objeto nem existe, e por isso o botão
 * "Ouvir" simplesmente não aparecia no app instalado — justamente onde ele
 * faz mais falta, que é no celular, lendo de manhã.
 *
 * Esta ponte repõe o que falta usando o TextToSpeech do próprio Android: a
 * mesma voz que lê mensagens e mapas, já instalada, sem baixar nada e sem
 * internet. A página fala uma frase por vez e espera o aviso de que acabou;
 * esse aviso volta por evaluateJavascript, chamando B.audio.__fimNativo().
 *
 * O motor demora alguns instantes para iniciar na primeira vez. Enquanto
 * isso, pronta() responde false e a página mostra o botão assim mesmo —
 * tocar nele enfileira a fala, que sai quando o motor abre.
 */
class VozBridge(private val act: Activity, private val web: WebView) {

    private var tts: TextToSpeech? = null
    private var pronto = false
    private var pendente: Pendente? = null

    private data class Pendente(val texto: String, val id: String, val velocidade: Float)

    init {
        tts = TextToSpeech(act) { estado ->
            pronto = estado == TextToSpeech.SUCCESS
            if (pronto) {
                tts?.language = Locale("pt", "BR")
                tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(id: String?) {}
                    override fun onDone(id: String?) = avisar("fim", id)
                    @Deprecated("exigido pela classe base")
                    override fun onError(id: String?) = avisar("erro", id)
                    override fun onError(id: String?, code: Int) = avisar("erro", id)
                })
                /* Pediram para falar antes de o motor abrir: fala agora. */
                pendente?.let { p -> pendente = null; falar(p.texto, p.id, p.velocidade) }
            }
        }
    }

    /** Avisa a página que a frase acabou — é o que faz a leitura andar. */
    private fun avisar(oque: String, id: String?) {
        val js = "window.B && B.audio && B.audio.__fimNativo && " +
            "B.audio.__fimNativo('" + (id ?: "").replace("'", "") + "','" + oque + "')"
        act.runOnUiThread { web.evaluateJavascript(js, null) }
    }

    /** Há motor de voz neste aparelho? */
    @JavascriptInterface
    fun existe(): Boolean = tts != null

    /** Já pode falar? (o motor abre em segundo plano na primeira vez) */
    @JavascriptInterface
    fun pronta(): Boolean = pronto

    /** Tem voz em português instalada? */
    @JavascriptInterface
    fun temPortugues(): Boolean {
        val t = tts ?: return false
        return try {
            val r = t.isLanguageAvailable(Locale("pt", "BR"))
            r == TextToSpeech.LANG_AVAILABLE || r == TextToSpeech.LANG_COUNTRY_AVAILABLE ||
                r == TextToSpeech.LANG_COUNTRY_VAR_AVAILABLE
        } catch (e: Exception) {
            false
        }
    }

    /**
     * As vozes em português instaladas neste aparelho.
     *
     * Vai para a página como JSON. O Android não diz se a voz é de homem
     * ou de mulher — a classe Voice não tem esse campo —, então o que vai
     * é o nome que o motor dá, e é a página que lê dele o que der. Nas
     * vozes do Google o nome traz "male" ou "female" dentro; nas de
     * outros motores, às vezes não traz nada, e aí a página mostra a voz
     * sem rótulo, com amostra para ouvir.
     */
    @JavascriptInterface
    fun vozes(): String {
        val t = tts ?: return "[]"
        return try {
            val fora = JSONArray()
            t.voices
                ?.filter { it.locale != null && it.locale.language == "pt" }
                /* pt-BR antes de pt-PT, e offline antes das de rede. */
                ?.sortedWith(compareBy(
                    { if (it.locale.country == "BR") 0 else 1 },
                    { if (it.isNetworkConnectionRequired) 1 else 0 },
                    { it.name }
                ))
                ?.forEach { v ->
                    val o = JSONObject()
                    o.put("id", v.name)
                    o.put("nome", v.name)
                    o.put("idioma", v.locale.toString())
                    o.put("rede", v.isNetworkConnectionRequired)
                    fora.put(o)
                }
            fora.toString()
        } catch (e: Exception) {
            "[]"
        }
    }

    /** Passa a falar com esta voz. Nome vazio volta à padrão do motor. */
    @JavascriptInterface
    fun escolherVoz(nome: String): Boolean {
        val t = tts ?: return false
        return try {
            if (nome.isEmpty()) {
                t.language = Locale("pt", "BR")
                return true
            }
            val v = t.voices?.firstOrNull { it.name == nome } ?: return false
            t.voice = v
            true
        } catch (e: Exception) {
            false
        }
    }

    @JavascriptInterface
    fun falar(texto: String, id: String, velocidade: Float): Boolean {
        val t = tts ?: return false
        if (!pronto) {
            pendente = Pendente(texto, id, velocidade)
            return true          // sai assim que o motor abrir
        }
        return try {
            t.setSpeechRate(if (velocidade > 0f) velocidade else 1f)
            val extras = Bundle()
            extras.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, id)
            t.speak(texto, TextToSpeech.QUEUE_FLUSH, extras, id) == TextToSpeech.SUCCESS
        } catch (e: Exception) {
            false
        }
    }

    @JavascriptInterface
    fun parar(): Boolean {
        pendente = null
        return try {
            tts?.stop()
            true
        } catch (e: Exception) {
            false
        }
    }

    /** O app indo para trás não pode deixar a voz falando sozinha. */
    fun soltar() {
        try {
            tts?.stop()
            tts?.shutdown()
        } catch (e: Exception) {
        }
        tts = null
        pronto = false
    }
}
