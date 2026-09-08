package com.bahiense.altar

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Looper
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
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
    private var idiomaAtual = "pt-BR"
    private var jaTentouDeNovo = false

    private class Fala(val texto: String, val rate: Float, val lang: String)

    init {
        activity.runOnUiThread { iniciarTts() }
    }

    /* ---------------- falar ---------------- */

    private fun iniciarTts() {
        tts = TextToSpeech(activity) { status ->
            ttsPronto = status == TextToSpeech.SUCCESS
            if (ttsPronto) {
                tts?.language = Locale("pt", "BR")
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
            f.lang.startsWith("pt-PT") -> Locale("pt", "PT")
            else -> Locale("pt", "BR")
        }
        val posto = motor.setLanguage(alvo)
        if (posto == TextToSpeech.LANG_MISSING_DATA || posto == TextToSpeech.LANG_NOT_SUPPORTED) {
            motor.language = Locale("pt", "BR")
        }

        motor.setSpeechRate(f.rate)
        motor.speak(f.texto, TextToSpeech.QUEUE_FLUSH, null, "altar")
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
        jaTentouDeNovo = false
        ouvirAgora(lang)
    }

    private fun ouvirAgora(lang: String) {
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
            idiomaAtual = lang
            anotar("escuta iniciada (" + lang + ")")
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
            anotar("escuta concluída")
            val lista = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val alternativas = JSONArray()
            lista?.forEach { alternativas.put(it) }
            js("window.__ponteEscuta && window.__ponteEscuta.resultado($alternativas)")
            js("window.__ponteEscuta && window.__ponteEscuta.fim()")
        }

        override fun onError(error: Int) {
            ouvindo = false
            anotar("erro de escuta: código " + error + " → " + nomeDoErro(error))

            /*
             * ERROR_CLIENT e ERROR_RECOGNIZER_BUSY aparecem quando o serviço de
             * reconhecimento ainda está se desmontando de uma sessão anterior —
             * o caso comum é ter gravado a voz logo antes. Um reconhecedor novo,
             * meio segundo depois, costuma resolver. Uma tentativa só: insistir
             * além disso é esconder um problema de verdade.
             */
            val transitorio = error == SpeechRecognizer.ERROR_CLIENT ||
                error == SpeechRecognizer.ERROR_RECOGNIZER_BUSY ||
                error == SpeechRecognizer.ERROR_AUDIO
            if (transitorio && !jaTentouDeNovo) {
                jaTentouDeNovo = true
                anotar("tentando escutar de novo com um reconhecedor limpo")
                activity.runOnUiThread {
                    try { reconhecedor?.destroy() } catch (e: Exception) { }
                    reconhecedor = null
                    web.postDelayed({ ouvirAgora(idiomaAtual) }, 500)
                }
                return
            }

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
        SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "sem-internet"
        SpeechRecognizer.ERROR_SERVER,
        SpeechRecognizer.ERROR_SERVER_DISCONNECTED -> "servidor-de-fala"
        SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "reconhecimento-ocupado"
        SpeechRecognizer.ERROR_CLIENT -> "reconhecimento-instavel"
        SpeechRecognizer.ERROR_AUDIO -> "microfone-ocupado"
        SpeechRecognizer.ERROR_TOO_MANY_REQUESTS -> "limite-do-google"
        SpeechRecognizer.ERROR_LANGUAGE_NOT_SUPPORTED,
        SpeechRecognizer.ERROR_LANGUAGE_UNAVAILABLE -> "idioma-nao-instalado"
        // o código cru evita que um erro novo do Android vire "audio-capture"
        // genérico e mande o aluno procurar solução no lugar errado
        else -> "android-" + codigo
    }

    private fun erro(nome: String) {
        js("window.__ponteEscuta && window.__ponteEscuta.erro(${JSONObject.quote(nome)})")
    }

    /* ---------------- microfone ---------------- */

    @JavascriptInterface
    fun temMicrofone(): Boolean = activity.temMicrofone()

    @JavascriptInterface
    fun pedirMicrofone() {
        activity.runOnUiThread { activity.pedirMicrofone() }
    }

    /**
     * Solta o microfone quando a página precisa dele para outra coisa.
     *
     * Um SpeechRecognizer vivo continua segurando a entrada de áudio em boa
     * parte dos aparelhos, e aí o getUserMedia da página falha com
     * NotReadableError, que a página sozinha não tem como resolver.
     *
     * O método espera a liberação acontecer de fato antes de responder: o
     * SpeechRecognizer só pode ser destruído na thread principal, e devolver
     * o controle para o JavaScript antes disso fazia a página pedir o
     * microfone enquanto ele ainda estava preso. Chamadas vindas do
     * JavascriptInterface chegam numa thread própria, então esperar aqui não
     * trava a interface.
     */
    @JavascriptInterface
    fun liberarMicrofone() {
        val pronto = CountDownLatch(1)

        val soltar = Runnable {
            tts?.stop()
            ouvindo = false
            try { reconhecedor?.cancel() } catch (e: Exception) { }
            try { reconhecedor?.destroy() } catch (e: Exception) { }
            reconhecedor = null
            pronto.countDown()
        }

        if (Looper.myLooper() == Looper.getMainLooper()) {
            soltar.run()
            return
        }

        activity.runOnUiThread(soltar)
        try {
            pronto.await(500, TimeUnit.MILLISECONDS)
            // o serviço de reconhecimento ainda leva um instante para devolver
            // a captura depois de desligado
            Thread.sleep(150)
        } catch (e: InterruptedException) {
            Thread.currentThread().interrupt()
        }
    }

    /* ---------------- diagnóstico ---------------- */

    /*
     * Um erro relatado por print vira adivinhação: o app diz "não consegui" e
     * ninguém sabe o que o Android respondeu. Este registro fica no aparelho,
     * aparece nos Ajustes e pode ser copiado — é o que transforma "continua
     * com erro" em uma causa.
     */
    private val registro = ArrayList<String>()

    fun anotar(linha: String) {
        synchronized(registro) {
            registro.add(hora() + "  " + linha)
            while (registro.size > 40) registro.removeAt(0)
        }
    }

    private fun hora(): String {
        val d = java.util.Date()
        return java.text.SimpleDateFormat("HH:mm:ss", java.util.Locale.US).format(d)
    }

    @JavascriptInterface
    fun diagnostico(): String {
        val cabecalho = listOf(
            "app " + versao(),
            "Android " + Build.VERSION.RELEASE + " (SDK " + Build.VERSION.SDK_INT + ")",
            Build.MANUFACTURER + " " + Build.MODEL,
            "permissão de microfone: " + (if (activity.temMicrofone()) "concedida" else "NEGADA"),
            "reconhecimento de fala: " + (if (SpeechRecognizer.isRecognitionAvailable(activity)) "disponível" else "INDISPONÍVEL"),
            "motor de fala: " + (if (ttsPronto) "pronto" else "não iniciou")
        ).joinToString("\n")
        synchronized(registro) {
            return cabecalho + "\n\n" + (if (registro.isEmpty()) "(sem eventos ainda)" else registro.joinToString("\n"))
        }
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
