package com.bahiense.fluencia

import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONArray
import org.json.JSONObject
import java.util.Locale

/**
 * A voz do app, do lado nativo.
 *
 * O WebView não implementa a Web Speech API: dentro dele window.speechSynthesis
 * e SpeechRecognition simplesmente não existem, e um app de treino de fala sem
 * os dois não é nada. Esta ponte repõe as duas coisas com o que o Android tem —
 * TextToSpeech e SpeechRecognizer — e a página as consome pelo remendo em
 * js/ponte-android.js, que devolve a mesma forma da API do navegador.
 *
 * Tudo o que mexe com essas duas classes precisa rodar na thread principal; os
 * métodos marcados com @JavascriptInterface chegam de outra thread, daí o
 * runOnUiThread em cada um.
 */
class VozBridge(private val activity: MainActivity, private val web: WebView) {

    private var tts: TextToSpeech? = null
    private var ttsPronto = false
    private var pendente: Fala? = null

    private var reconhecedor: SpeechRecognizer? = null
    private var ouvindo = false

    private class Fala(val texto: String, val rate: Float, val lang: String)

    init {
        activity.runOnUiThread { iniciarTts() }
    }

    /* ---------------- falar ---------------- */

    private fun iniciarTts() {
        tts = TextToSpeech(activity) { status ->
            ttsPronto = status == TextToSpeech.SUCCESS
            if (ttsPronto) {
                tts?.language = Locale.US
                tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) {}

                    override fun onDone(utteranceId: String?) {
                        js("window.__ponteFalaFim && window.__ponteFalaFim(true)")
                    }

                    @Suppress("DEPRECATION", "OVERRIDE_DEPRECATION")
                    override fun onError(utteranceId: String?) {
                        js("window.__ponteFalaFim && window.__ponteFalaFim(false)")
                    }
                })
                // uma fala pedida antes de o motor ficar pronto não se perde
                pendente?.let { dizer(it) }
                pendente = null
            }
        }
    }

    private fun dizer(f: Fala) {
        val motor = tts ?: return

        // O aparelho pode não ter o pacote de voz do sotaque escolhido; nesse
        // caso o americano é a queda mais segura, porque vem instalado quase
        // sempre. Falar com o sotaque errado é melhor do que não falar.
        val alvo = when {
            f.lang.startsWith("en-GB") -> Locale.UK
            f.lang.startsWith("en-AU") -> Locale("en", "AU")
            f.lang.startsWith("en-IN") -> Locale("en", "IN")
            else -> Locale.US
        }
        val posto = motor.setLanguage(alvo)
        if (posto == TextToSpeech.LANG_MISSING_DATA || posto == TextToSpeech.LANG_NOT_SUPPORTED) {
            motor.language = Locale.US
        }

        motor.setSpeechRate(f.rate)
        motor.speak(f.texto, TextToSpeech.QUEUE_FLUSH, null, "fluencia")
    }

    @JavascriptInterface
    fun temFala(): Boolean = true

    @JavascriptInterface
    fun falar(texto: String, rate: Float, lang: String) {
        activity.runOnUiThread {
            val f = Fala(texto, if (rate <= 0f) 1f else rate, lang)
            if (ttsPronto) dizer(f) else pendente = f
        }
    }

    @JavascriptInterface
    fun pararFala() {
        activity.runOnUiThread {
            pendente = null
            tts?.stop()
        }
    }

    /* ---------------- ouvir ---------------- */

    @JavascriptInterface
    fun temEscuta(): Boolean = SpeechRecognizer.isRecognitionAvailable(activity)

    @JavascriptInterface
    fun ouvir(lang: String) {
        activity.runOnUiThread {
            if (ouvindo) pararEscutaAgora()

            if (!SpeechRecognizer.isRecognitionAvailable(activity)) {
                erro("service-not-allowed")
                return@runOnUiThread
            }

            val rec = reconhecedor ?: SpeechRecognizer.createSpeechRecognizer(activity).also {
                it.setRecognitionListener(ouvinte)
                reconhecedor = it
            }

            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(
                    RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                    RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
                )
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang)
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
            }

            ouvindo = true
            rec.startListening(intent)
        }
    }

    @JavascriptInterface
    fun pararEscuta() {
        activity.runOnUiThread { pararEscutaAgora() }
    }

    private fun pararEscutaAgora() {
        if (!ouvindo) return
        // stopListening entrega o que já foi dito; cancel jogaria fora.
        reconhecedor?.stopListening()
    }

    private val ouvinte = object : RecognitionListener {
        override fun onReadyForSpeech(params: Bundle?) {}
        override fun onBeginningOfSpeech() {}
        override fun onRmsChanged(rmsdB: Float) {}
        override fun onBufferReceived(buffer: ByteArray?) {}
        override fun onEndOfSpeech() {}
        override fun onEvent(eventType: Int, params: Bundle?) {}

        override fun onPartialResults(partialResults: Bundle?) {
            val lista = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val texto = lista?.firstOrNull() ?: return
            js("window.__ponteEscuta && window.__ponteEscuta.parcial(${JSONObject.quote(texto)})")
        }

        override fun onResults(results: Bundle?) {
            ouvindo = false
            val lista = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val alternativas = JSONArray()
            lista?.forEach { alternativas.put(it) }
            js("window.__ponteEscuta && window.__ponteEscuta.resultado($alternativas)")
            js("window.__ponteEscuta && window.__ponteEscuta.fim()")
        }

        override fun onError(error: Int) {
            ouvindo = false
            erro(nomeDoErro(error))
        }
    }

    /* Os nomes são os mesmos da API do navegador, para a página tratar os dois
       mundos com o mesmo código. */
    private fun nomeDoErro(codigo: Int): String = when (codigo) {
        SpeechRecognizer.ERROR_NO_MATCH,
        SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "no-speech"
        SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "not-allowed"
        SpeechRecognizer.ERROR_NETWORK,
        SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "network"
        SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "aborted"
        else -> "audio-capture"
    }

    private fun erro(nome: String) {
        js("window.__ponteEscuta && window.__ponteEscuta.erro(${JSONObject.quote(nome)})")
    }

    /* ---------------- utilidades ---------------- */

    @JavascriptInterface
    fun versao(): String = try {
        activity.packageManager.getPackageInfo(activity.packageName, 0).versionName ?: "?"
    } catch (e: Exception) {
        "?"
    }

    private fun js(codigo: String) {
        activity.runOnUiThread { web.evaluateJavascript(codigo, null) }
    }

    fun pararTudo() {
        activity.runOnUiThread {
            tts?.stop()
            if (ouvindo) {
                ouvindo = false
                reconhecedor?.cancel()
            }
        }
    }

    fun desligar() {
        activity.runOnUiThread {
            tts?.stop()
            tts?.shutdown()
            tts = null
            reconhecedor?.destroy()
            reconhecedor = null
        }
    }
}
