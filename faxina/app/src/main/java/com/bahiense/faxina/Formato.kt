package com.bahiense.faxina

import java.util.Locale
import java.util.concurrent.TimeUnit

private val PT_BR: Locale = Locale.forLanguageTag("pt-BR")

/**
 * Formata bytes como a Samsung faz na tela de armazenamento: uma casa decimal
 * com vírgula, e sempre a maior unidade que ainda deixa o número legível.
 */
fun formatarBytes(bytes: Long): String {
    if (bytes < 1024) return "$bytes B"

    val unidades = arrayOf("KB", "MB", "GB", "TB")
    var valor = bytes.toDouble() / 1024
    var i = 0
    while (valor >= 1024 && i < unidades.size - 1) {
        valor /= 1024
        i++
    }

    // Números grandes não precisam de duas casas; pequenos ficam pobres com zero.
    val casas = when {
        valor >= 100 -> 0
        valor >= 10 -> 1
        else -> 2
    }
    return String.format(PT_BR, "%.${casas}f %s", valor, unidades[i])
}

/** "há 3 meses", "há 12 dias" — para explicar por que um arquivo foi marcado. */
fun formatarIdade(modificadoEm: Long, agora: Long = System.currentTimeMillis()): String {
    if (modificadoEm <= 0L) return "data desconhecida"

    val dias = TimeUnit.MILLISECONDS.toDays((agora - modificadoEm).coerceAtLeast(0L))
    return when {
        dias <= 0 -> "hoje"
        dias == 1L -> "ontem"
        dias < 30 -> "há $dias dias"
        dias < 365 -> "há ${dias / 30} ${if (dias / 30 == 1L) "mês" else "meses"}"
        else -> "há ${dias / 365} ${if (dias / 365 == 1L) "ano" else "anos"}"
    }
}

/** Caminho sem o prefixo do armazenamento, que é igual em todo mundo e só rouba espaço na tela. */
fun caminhoCurto(caminho: String, raiz: String): String =
    caminho.removePrefix(raiz).removePrefix("/").ifEmpty { caminho }
