package com.bahiense.formacao

import com.anthropic.client.AnthropicClient
import com.anthropic.client.okhttp.AnthropicOkHttpClient
import com.anthropic.core.JsonValue
import com.anthropic.core.MultipartField
import com.anthropic.errors.AnthropicServiceException
import com.anthropic.errors.NotFoundException
import com.anthropic.errors.PermissionDeniedException
import com.anthropic.errors.RateLimitException
import com.anthropic.errors.UnauthorizedException
import com.anthropic.helpers.MessageAccumulator
import com.anthropic.models.files.FileUploadParams
import com.anthropic.models.messages.CacheControlEphemeral
import com.anthropic.models.messages.ContentBlockParam
import com.anthropic.models.messages.DocumentBlockParam
import com.anthropic.models.messages.FileDocumentSource
import com.anthropic.models.messages.JsonOutputFormat
import com.anthropic.models.messages.Message
import com.anthropic.models.messages.MessageCreateParams
import com.anthropic.models.messages.OutputConfig
import com.anthropic.models.messages.StopReason
import com.anthropic.models.messages.TextBlockParam
import com.anthropic.models.messages.ThinkingConfigAdaptive
import com.anthropic.models.messages.WebSearchTool20260209
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.time.Duration

/**
 * O professor: tudo o que fala com o Claude passa por aqui.
 *
 * Esta classe não usa nada do Android de propósito — dá para compilar e testar
 * no computador. Quem chama (Ponte.kt) cuida de threads, arquivos e da tela.
 *
 * Cada lição passa por duas etapas:
 *  1. pesquisar(): o Claude lê o PDF inteiro (slide a slide, inclusive as
 *     imagens) e pesquisa na web os autores, conceitos e fatos citados. Sai um
 *     dossiê em texto, que fica guardado: se a etapa 2 falhar, não se paga de novo.
 *  2. montarAula(): com o PDF e o dossiê, ele escreve a aula interativa num JSON
 *     com formato garantido (structured outputs), que a tela desenha.
 *
 * O PDF sobe uma vez só pela Files API e depois é citado pelo id: as lições
 * costumam ter mais de 10 MB, e mandar isso a cada pergunta gastaria dados.
 */
class Professor(chave: String, endereco: String? = null) {

    private val cliente: AnthropicClient = AnthropicOkHttpClient.builder()
        .apiKey(chave)
        .apply { if (endereco != null) baseUrl(endereco) }  // só para testes
        .maxRetries(3)
        // uma aula inteira leva minutos para ser escrita
        .timeout(Duration.ofMinutes(20))
        .build()

    /** O que a tela mostra enquanto o professor trabalha. */
    fun interface Andamento {
        fun aviso(texto: String)
    }

    /** Confere se a chave é aceita, sem gastar nada (só consulta o modelo). */
    fun testar() {
        try {
            cliente.models().retrieve(MODELO)
        } catch (e: AnthropicServiceException) {
            throw traduzir(e)
        }
    }

    // ------------------------------------------------------------ o PDF

    /** Sobe o PDF e devolve o id do arquivo na Anthropic. */
    fun enviarPdf(pdf: File): String {
        val campo = MultipartField.builder<java.io.InputStream>()
            .value(pdf.inputStream())
            .filename("licao.pdf")
            .contentType("application/pdf")
            .build()
        return cliente.files().upload(FileUploadParams.builder().file(campo).build()).id()
    }

    fun apagarPdf(id: String) {
        try { cliente.files().delete(id) } catch (_: Exception) { }
    }

    private fun documento(arquivoId: String): ContentBlockParam = ContentBlockParam.ofDocument(
        DocumentBlockParam.builder()
            .source(FileDocumentSource.builder().fileId(arquivoId).build())
            .title("Lição da semana (PDF)")
            .build()
    )

    private fun texto(t: String): ContentBlockParam =
        ContentBlockParam.ofText(TextBlockParam.builder().text(t).build())

    // ------------------------------------------------------------ etapa 1

    fun pesquisar(arquivoId: String, andamento: Andamento): String {
        andamento.aviso("Lendo o PDF slide a slide…")
        val base = MessageCreateParams.builder()
            .model(MODELO)
            .maxTokens(48000L)
            .systemOfTextBlockParams(listOf(TextBlockParam.builder().text(Prompts.PROFESSOR).build()))
            .thinking(ThinkingConfigAdaptive.builder().build())
            .outputConfig(OutputConfig.builder().effort(OutputConfig.Effort.HIGH).build())
            .addTool(WebSearchTool20260209.builder().maxUses(15L).build())
            .addUserMessageOfContentBlockParams(listOf(documento(arquivoId), texto(Prompts.PESQUISA)))
            .comFallback()
            .build()
        return comPausas(base, andamento, "Escrevendo o dossiê de pesquisa")
    }

    // ------------------------------------------------------------ etapa 2

    fun montarAula(arquivoId: String, dossie: String, andamento: Andamento): String {
        andamento.aviso("Preparando a aula…")
        val params = MessageCreateParams.builder()
            .model(MODELO)
            .maxTokens(110000L)
            .systemOfTextBlockParams(listOf(TextBlockParam.builder().text(Prompts.PROFESSOR).build()))
            .thinking(ThinkingConfigAdaptive.builder().build())
            .outputConfig(
                OutputConfig.builder()
                    .effort(OutputConfig.Effort.HIGH)
                    .format(
                        JsonOutputFormat.builder()
                            .schema(
                                JsonOutputFormat.Schema.builder()
                                    .putAllAdditionalProperties(Esquema.AULA)
                                    .build()
                            )
                            .build()
                    )
                    .build()
            )
            .addUserMessageOfContentBlockParams(
                listOf(
                    documento(arquivoId),
                    texto("<dossie_de_pesquisa>\n$dossie\n</dossie_de_pesquisa>\n\n" + Prompts.AULA)
                )
            )
            .comFallback()
            .build()

        val (msg, texto) = transmitir(params, andamento, "Escrevendo a aula")
        when (msg.stopReason().orElse(null)) {
            StopReason.MAX_TOKENS -> throw ErroProfessor(
                "A aula ficou maior do que o limite de uma resposta. Tente de novo; se repetir, divida o PDF em duas partes."
            )
            StopReason.REFUSAL -> throw ErroProfessor("O Claude recusou escrever esta aula.")
            else -> {}
        }
        // confere que é JSON de verdade antes de guardar
        val aula = JSONObject(texto)
        if (!aula.has("modulos")) throw ErroProfessor("A aula veio incompleta. Tente de novo.")
        return aula.toString()
    }

    // ------------------------------------------------------------ conversa

    /**
     * Uma resposta do professor numa conversa (tirar dúvida, debate, sabatina,
     * correção). [mensagens] alterna usuário/professor e começa pelo usuário.
     * O texto chega aos pedaços em [aoEscrever]; o retorno é a resposta inteira.
     */
    fun conversar(
        arquivoId: String?,
        dossie: String,
        modo: String,
        contexto: String,
        mensagens: JSONArray,
        aoEscrever: (String) -> Unit,
        andamento: Andamento
    ): String {
        val sistema = Prompts.PROFESSOR + "\n\n" + Prompts.modo(modo)
        val b = MessageCreateParams.builder()
            .model(MODELO)
            .maxTokens(32000L)
            .systemOfTextBlockParams(listOf(TextBlockParam.builder().text(sistema).build()))
            .thinking(ThinkingConfigAdaptive.builder().build())
            .outputConfig(
                OutputConfig.builder()
                    .effort(if (modo == "corrigir" || modo == "avaliar") OutputConfig.Effort.HIGH else OutputConfig.Effort.MEDIUM)
                    .build()
            )
            // guarda o começo da conversa (PDF + dossiê) em cache entre as falas
            .cacheControl(CacheControlEphemeral.builder().build())
            .comFallback()
        if (modo == "tutor") b.addTool(WebSearchTool20260209.builder().maxUses(4L).build())

        val material = mutableListOf<ContentBlockParam>()
        if (arquivoId != null) material.add(documento(arquivoId))
        material.add(texto("<dossie_de_pesquisa>\n$dossie\n</dossie_de_pesquisa>"))
        if (contexto.isNotBlank()) material.add(texto("<contexto_desta_conversa>\n$contexto\n</contexto_desta_conversa>"))

        for (i in 0 until mensagens.length()) {
            val m = mensagens.getJSONObject(i)
            val txt = m.optString("texto").ifBlank { "…" }
            if (m.optString("papel") == "aluno") {
                if (i == 0) b.addUserMessageOfContentBlockParams(material + texto(txt))
                else b.addUserMessage(txt)
            } else {
                b.addAssistantMessage(txt)
            }
        }

        val escrito = StringBuilder()
        var params = b.build()
        repeat(MAX_PAUSAS) {
            val (msg, texto) = transmitir(params, andamento, null) { pedaco ->
                escrito.append(pedaco); aoEscrever(pedaco)
            }
            if (msg.stopReason().orElse(null) != StopReason.PAUSE_TURN) {
                if (msg.stopReason().orElse(null) == StopReason.REFUSAL && texto.isBlank())
                    throw ErroProfessor("O Claude recusou responder a esta mensagem.")
                return escrito.toString()
            }
            // a busca na web pausou: devolve o que veio e ele continua de onde parou
            params = params.toBuilder().addMessage(msg).build()
        }
        return escrito.toString()
    }

    // ------------------------------------------------------------ miúdos

    /** Busca na web pode pausar a resposta no meio; aqui ela é retomada até o fim. */
    private fun comPausas(
        primeira: MessageCreateParams,
        andamento: Andamento,
        rotulo: String
    ): String {
        var params = primeira
        val tudo = StringBuilder()
        repeat(MAX_PAUSAS) {
            val (msg, texto) = transmitir(params, andamento, rotulo)
            tudo.append(texto)
            when (msg.stopReason().orElse(null)) {
                StopReason.PAUSE_TURN -> params = params.toBuilder().addMessage(msg).build()
                StopReason.REFUSAL -> throw ErroProfessor("O Claude recusou analisar este PDF.")
                else -> return tudo.toString()
            }
        }
        return tudo.toString()
    }

    /** Faz a chamada em streaming, contando o andamento para a tela. */
    private fun transmitir(
        params: MessageCreateParams,
        andamento: Andamento,
        rotulo: String?,
        aoEscrever: ((String) -> Unit)? = null
    ): Pair<Message, String> {
        val acumulador = MessageAccumulator.create()
        val texto = StringBuilder()
        var buscas = 0
        var ultimoAviso = 0L
        try {
            cliente.messages().createStreaming(params).use { fluxo ->
                fluxo.stream().forEach { evento ->
                    acumulador.accumulate(evento)
                    evento.contentBlockStart().ifPresent { inicio ->
                        when {
                            inicio.contentBlock().isServerToolUse() -> {
                                buscas++
                                andamento.aviso("Pesquisando na web ($buscas)…")
                            }
                            inicio.contentBlock().isThinking() && rotulo != null ->
                                andamento.aviso("Pensando…")
                        }
                    }
                    evento.contentBlockDelta().ifPresent { d ->
                        d.delta().text().ifPresent { t ->
                            texto.append(t.text())
                            aoEscrever?.invoke(t.text())
                            val agora = System.currentTimeMillis()
                            if (rotulo != null && agora - ultimoAviso > 700) {
                                ultimoAviso = agora
                                andamento.aviso("$rotulo… ${"%,d".format(texto.length).replace(',', '.')} caracteres")
                            }
                        }
                    }
                }
            }
        } catch (e: AnthropicServiceException) {
            throw traduzir(e)
        }
        return acumulador.message() to texto.toString()
    }

    /** Se o Claude recusar, o servidor tenta de novo com outro modelo sozinho. */
    private fun MessageCreateParams.Builder.comFallback(): MessageCreateParams.Builder =
        putAdditionalHeader("anthropic-beta", "server-side-fallback-2026-07-01")
            .putAdditionalBodyProperty("fallbacks", JsonValue.from("default"))

    private fun traduzir(e: AnthropicServiceException): Exception {
        val msg = e.message ?: ""
        return when {
            e is UnauthorizedException -> ErroProfessor("A chave da API não foi aceita. Confira em Ajustes.", chaveRuim = true)
            e is PermissionDeniedException -> ErroProfessor("A chave não tem permissão para isto. Confira em console.anthropic.com.")
            e is NotFoundException && msg.contains("file", true) -> PdfSumiu()
            e is RateLimitException -> ErroProfessor("Muitos pedidos seguidos. Espere um minuto e tente de novo.")
            msg.contains("credit balance", true) ->
                ErroProfessor("Acabaram os créditos da sua conta da API. Coloque créditos em console.anthropic.com → Billing.")
            e.statusCode() == 529 || msg.contains("overloaded", true) ->
                ErroProfessor("Os servidores do Claude estão sobrecarregados agora. Tente de novo em alguns minutos.")
            else -> ErroProfessor("O Claude respondeu com erro (${e.statusCode()}): ${msg.take(300)}")
        }
    }

    class ErroProfessor(mensagem: String, val chaveRuim: Boolean = false) : Exception(mensagem)

    /** O arquivo sumiu da Anthropic (apagado no console, por exemplo): sobe de novo. */
    class PdfSumiu : Exception("PDF não encontrado na Anthropic")

    companion object {
        const val MODELO = "claude-opus-5-5"
        private const val MAX_PAUSAS = 6
    }
}
