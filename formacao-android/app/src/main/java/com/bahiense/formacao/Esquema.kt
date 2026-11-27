package com.bahiense.formacao

import com.anthropic.core.JsonValue

/**
 * O formato da aula. O Claude é obrigado a responder exatamente neste formato
 * (structured outputs), então a tela pode confiar em cada campo.
 *
 * Os textos longos vêm em Markdown simples (parágrafos, **negrito**, listas com
 * "- ", citações com "> "), que js/markdown.js desenha.
 */
object Esquema {

    private fun s(descricao: String) = mapOf("type" to "string", "description" to descricao)
    private fun lista(item: Any, descricao: String) =
        mapOf("type" to "array", "items" to item, "description" to descricao)
    private fun obj(vararg campos: Pair<String, Any>): Map<String, Any> = mapOf(
        "type" to "object",
        "properties" to mapOf(*campos),
        "required" to campos.map { it.first },
        "additionalProperties" to false
    )

    private val raiz = obj(
        "titulo" to s("Título da lição"),
        "subtitulo" to s("Uma frase que diz o que o aluno vai aprender"),
        "visao_geral" to s("Markdown. O que é esta lição, de onde vem o tema, por que importa e o que o aluno saberá fazer no fim."),
        "roteiro" to lista(s("Um passo"), "Os passos da aula, na ordem dos módulos"),
        "modulos" to lista(
            obj(
                "titulo" to s("Título do módulo"),
                "dia" to mapOf("type" to "integer", "enum" to listOf(1, 2, 3, 4, 5), "description" to "Dia da semana em que o aluno estuda este módulo: 1 segunda, 2 terça, 3 quarta, 4 quinta, 5 sexta"),
                "slides" to s("Quais páginas do PDF este módulo cobre, ex.: 'slides 10 a 13'"),
                "em_uma_frase" to s("A ideia central do módulo em uma frase simples"),
                "explicacao" to s("Markdown longo e completo: tudo o que o PDF diz nestes slides, explicado do simples ao complexo, mais o que o PDF não diz e o aluno precisa saber"),
                "exemplo" to s("Markdown. Um exemplo concreto, da política brasileira ou internacional conforme o tema, que mostre a ideia funcionando"),
                "por_que_importa" to s("Markdown curto. Para que serve isto numa análise ou num debate"),
                "cuidado" to s("Markdown curto. O erro de interpretação mais comum sobre este ponto"),
                "checagem" to obj(
                    "pergunta" to s("Uma pergunta para o aluno verificar se entendeu"),
                    "resposta" to s("Markdown. A resposta comentada")
                )
            ),
            "Os módulos, na ordem do PDF, cobrindo todos os slides, repartidos de segunda a sexta (2 a 3 por dia)"
        ),
        "autores" to lista(
            obj(
                "nome" to s("Nome completo"),
                "datas" to s("Nascimento e morte, ou 'nascido em …'"),
                "origem" to s("País e área (filósofo, cientista político, sociólogo…)"),
                "citado_no_pdf" to mapOf("type" to "boolean", "description" to "true se o PDF cita este autor; false se é um autor complementar trazido pelo professor"),
                "quem_foi" to s("Markdown. Vida, contexto histórico em que escreveu e o problema que queria resolver"),
                "ideias_centrais" to lista(s("Uma ideia, explicada em uma ou duas frases"), "As ideias principais do autor"),
                "obras" to lista(
                    obj("titulo" to s("Título da obra (como é conhecida no Brasil, se houver tradução)"), "ano" to s("Ano"), "sobre" to s("Do que trata, em uma frase")),
                    "Obras principais. Só obras reais."
                ),
                "relacao_com_a_licao" to s("Markdown. Exatamente como as ideias deste autor se ligam ao tema e aos fatos da lição"),
                "dialogos" to s("Markdown. Com quem concorda, a quem responde, quem o critica e por quê"),
                "frase" to s("Uma frase célebre ou ideia-síntese do autor. Se não for citação literal conhecida, escreva como paráfrase, sem aspas")
            ),
            "Todos os autores citados no PDF, e mais os autores essenciais para entender o tema"
        ),
        "conceitos" to lista(
            obj(
                "termo" to s("O termo"),
                "definicao" to s("Definição em linguagem simples"),
                "exemplo" to s("Exemplo de uso"),
                "nao_confundir" to s("Com o que costuma ser confundido e a diferença. Vazio se não houver")
            ),
            "Glossário: todos os verbetes do PDF e os demais termos técnicos da aula"
        ),
        "linha_do_tempo" to lista(
            obj("data" to s("Data"), "evento" to s("O que aconteceu"), "importancia" to s("Por que importa para a lição")),
            "Cronologia dos fatos e das ideias, quando fizer sentido. Pode ser vazia"
        ),
        "debates" to lista(
            obj(
                "questao" to s("A pergunta polêmica, formulada como questão de debate"),
                "contexto" to s("Markdown. Por que isso é disputado"),
                "posicoes" to lista(
                    obj(
                        "nome" to s("Nome curto da posição"),
                        "quem_defende" to s("Autores, correntes ou atores que defendem"),
                        "argumentos" to lista(s("Um argumento"), "Os melhores argumentos desta posição"),
                        "ponto_fraco" to s("Onde esta posição é mais vulnerável")
                    ),
                    "Duas a quatro posições, apresentadas com justiça"
                ),
                "como_debater" to s("Markdown. Dicas para argumentar bem neste debate: dados a usar, armadilhas, perguntas que desmontam o adversário")
            ),
            "As grandes controvérsias do tema"
        ),
        "quiz" to lista(
            obj(
                "pergunta" to s("Pergunta de múltipla escolha"),
                "alternativas" to lista(s("Alternativa"), "Exatamente quatro alternativas"),
                "correta" to mapOf("type" to "integer", "description" to "Índice da alternativa correta, de 0 a 3"),
                "explicacao" to s("Por que a correta está certa e as outras erradas")
            ),
            "Questões de múltipla escolha cobrindo toda a lição, das fáceis às difíceis"
        ),
        "verdadeiro_falso" to lista(
            obj(
                "afirmacao" to s("Afirmação"),
                "verdadeira" to mapOf("type" to "boolean", "description" to "Se a afirmação é verdadeira"),
                "explicacao" to s("Explicação")
            ),
            "Afirmações para julgar, incluindo pegadinhas comuns"
        ),
        "flashcards" to lista(
            obj("frente" to s("Pergunta curta, termo ou nome"), "verso" to s("Resposta curta")),
            "Cartões de memorização: conceitos, autores, obras, datas, números"
        ),
        "dissertativas" to lista(
            obj(
                "enunciado" to s("Questão aberta, de análise ou aplicação"),
                "nivel" to s("básico, intermediário ou avançado"),
                "pontos_esperados" to lista(s("Um ponto que uma boa resposta deve trazer"), "O que o professor espera ver na resposta")
            ),
            "Questões para responder por escrito e receber correção do professor. Inclua o exercício proposto no próprio PDF, se houver"
        ),
        "argumentos_prontos" to lista(s("Uma frase"), "Frases-chave, bem formuladas, para usar numa conversa ou debate sobre o tema"),
        "aprofundamento" to lista(
            obj("titulo" to s("Obra ou fonte"), "autor" to s("Autor"), "por_que" to s("O que o aluno ganha lendo")),
            "Leituras para ir além. Só obras e fontes reais"
        ),
        "sintese" to s("Markdown. O resumo final da lição: o que levar para casa")
    )

    /** O esquema, já no formato que o SDK pede. */
    val AULA: Map<String, JsonValue> = raiz.mapValues { JsonValue.from(it.value) }
}
