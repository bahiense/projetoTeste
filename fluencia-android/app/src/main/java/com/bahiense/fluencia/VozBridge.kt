package com.bahiense.fluencia

import android.content.Intent
import android.media.MediaRecorder
import android.os.Build
import android.os.Bundle
import android.os.Looper
import java.io.File
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

    /* ---------------- microfone ---------------- */

    @JavascriptInterface
    fun temMicrofone(): Boolean = activity.temMicrofone()

    @JavascriptInterface
    fun pedirMicrofone() {
        activity.runOnUiThread { activity.pedirMicrofone() }
    }

    /**
     * Solta o microfone antes de a página gravar.
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

    /* ---------------- gravar (nativo) ---------------- */

    /*
     * A gravação da voz sai do WebView e vem para cá.
     *
     * O getUserMedia do WebView é a peça mais frágil desta pilha: disputa o
     * microfone com o reconhecimento de fala e com qualquer assistente do
     * aparelho, e quando perde devolve um NotReadableError que não diz quem
     * ganhou. O MediaRecorder do Android grava direto, com o ciclo de vida sob
     * nosso controle — e é o mesmo caminho que o teleprompter deste
     * repositório já usa para vídeo.
     *
     * O arquivo vai para o cache do app e é servido de volta para a página
     * pelo mesmo endereço interno do resto do conteúdo.
     */
    private var gravador: MediaRecorder? = null
    private var arquivoAtual: File? = null

    private fun pastaDeGravacoes(): File {
        val pasta = File(activity.cacheDir, "gravacoes")
        if (!pasta.exists()) pasta.mkdirs()
        return pasta
    }

    @JavascriptInterface
    fun gravarDisponivel(): Boolean = activity.temMicrofone()

    @JavascriptInterface
    fun gravarComecar(): String {
        if (!activity.temMicrofone()) return "sem-permissao"

        liberarMicrofone()   // o reconhecedor não pode estar segurando a captura

        return try {
            limparAntigas()
            val destino = File(pastaDeGravacoes(), "rec-" + System.currentTimeMillis() + ".m4a")
            val rec = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                MediaRecorder(activity)
            } else {
                @Suppress("DEPRECATION") MediaRecorder()
            }
            rec.setAudioSource(MediaRecorder.AudioSource.MIC)
            rec.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            rec.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            rec.setAudioSamplingRate(44100)
            rec.setAudioEncodingBitRate(96000)
            rec.setOutputFile(destino.absolutePath)
            rec.prepare()
            rec.start()
            gravador = rec
            arquivoAtual = destino
            anotar("gravação iniciada: " + destino.name)
            "ok"
        } catch (e: Exception) {
            anotar("falha ao iniciar gravação: " + (e.message ?: e.javaClass.simpleName))
            desmontarGravador()
            "erro:" + (e.message ?: e.javaClass.simpleName)
        }
    }

    /** Devolve o endereço interno do arquivo, ou vazio se não houver nada. */
    @JavascriptInterface
    fun gravarParar(): String {
        val rec = gravador ?: return ""
        return try {
            rec.stop()
            desmontarGravador()
            val f = arquivoAtual
            arquivoAtual = null
            if (f != null && f.exists() && f.length() > 0) {
                anotar("gravação salva: " + f.name + " (" + f.length() / 1024 + " KB)")
                "https://appassets.androidplatform.net/gravacoes/" + f.name
            } else {
                anotar("gravação terminou vazia")
                ""
            }
        } catch (e: Exception) {
            // stop() lança quando não houve áudio suficiente; o arquivo não presta
            anotar("falha ao parar gravação: " + (e.message ?: e.javaClass.simpleName))
            desmontarGravador()
            arquivoAtual?.delete()
            arquivoAtual = null
            ""
        }
    }

    @JavascriptInterface
    fun gravandoAgora(): Boolean = gravador != null

    private fun desmontarGravador() {
        try { gravador?.reset() } catch (e: Exception) { }
        try { gravador?.release() } catch (e: Exception) { }
        gravador = null
    }

    /*
     * A comparação que o exercício propõe é entre hoje e daqui a duas semanas,
     * então o arquivo precisa sobreviver a fechar o app. Sessenta dias cobrem
     * o ciclo com folga; depois disso vira só ocupação de espaço.
     */
    private fun limparAntigas() {
        try {
            val agora = System.currentTimeMillis()
            pastaDeGravacoes().listFiles()?.forEach { f ->
                if (agora - f.lastModified() > 60L * 24 * 60 * 60 * 1000L) f.delete()
            }
        } catch (e: Exception) { }
    }

    /** Apaga uma gravação a pedido do aluno. */
    @JavascriptInterface
    fun gravarApagar(url: String): Boolean {
        return try {
            val nome = url.substringAfterLast('/')
            // o nome vem da página; só pode apontar para dentro da pasta
            if (nome.isEmpty() || nome.contains("..") || nome.contains('/')) return false
            val pasta = pastaDeGravacoes()
            val f = File(pasta, nome)
            if (!f.canonicalPath.startsWith(pasta.canonicalPath)) return false
            val foi = f.exists() && f.delete()
            anotar("gravação apagada: " + nome + (if (foi) "" else " (não encontrada)"))
            foi
        } catch (e: Exception) {
            false
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
