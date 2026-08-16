package com.bahiense.faxina

import android.content.Context

/**
 * Quanto o Faxina já liberou, somado ao longo do tempo.
 *
 * A regra é uma só e não é decorativa: **só entra aqui o que virou espaço
 * livre de verdade.** Esvaziar a lixeira conta; limpar cache conta. Mandar
 * arquivo para a lixeira não conta, porque nesse momento o byte continua
 * exatamente onde estava, só que em outra pasta.
 *
 * Aplicativos de limpeza costumam somar tudo que passa pela tela e chegar a
 * números impossíveis. Um contador que mente é pior que contador nenhum: ele
 * ensina o usuário a ignorar o próprio app.
 */
object Historico {

    private const val ARQUIVO = "faxina-historico"
    private const val BYTES = "bytes_liberados"
    private const val DESDE = "primeiro_uso"

    private fun caderno(ctx: Context) =
        ctx.getSharedPreferences(ARQUIVO, Context.MODE_PRIVATE)

    /** Registra bytes que saíram do armazenamento. Zero e negativo são ignorados. */
    fun somar(ctx: Context, bytes: Long) {
        if (bytes <= 0L) return
        val c = caderno(ctx)
        val agora = System.currentTimeMillis()
        c.edit()
            .putLong(BYTES, c.getLong(BYTES, 0L) + bytes)
            .putLong(DESDE, c.getLong(DESDE, agora))
            .apply()
    }

    fun total(ctx: Context): Long = caderno(ctx).getLong(BYTES, 0L)

    /** Quando o primeiro byte foi liberado. Zero enquanto nada tiver acontecido. */
    fun desde(ctx: Context): Long = caderno(ctx).getLong(DESDE, 0L)
}
