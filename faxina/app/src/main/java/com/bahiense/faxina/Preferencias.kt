package com.bahiense.faxina

import android.content.Context

/** Claro, escuro, ou o que o aparelho estiver usando. */
enum class Tema(val rotulo: String) {
    SISTEMA("Automático"),
    CLARO("Claro"),
    ESCURO("Escuro"),
}

/**
 * As poucas escolhas do usuário que precisam sobreviver ao fechamento do app.
 *
 * O tema é uma delas, e ter a opção importa mais do que parece: "seguir o
 * sistema" é o padrão certo, mas quem deixa o celular no escuro e quer este
 * app claro não tem como pedir isso ao Android — a escolha é por aparelho,
 * não por aplicativo.
 */
object Preferencias {

    private const val ARQUIVO = "faxina-preferencias"
    private const val TEMA = "tema"
    private const val ROTINA = "rotina_de_cache"
    private const val ROTINA_QUANDO = "rotina_ultima_vez"
    private const val ROTINA_BYTES = "rotina_bytes"

    private fun caderno(ctx: Context) =
        ctx.getSharedPreferences(ARQUIVO, Context.MODE_PRIVATE)

    fun tema(ctx: Context): Tema =
        runCatching { Tema.valueOf(caderno(ctx).getString(TEMA, null) ?: "") }
            .getOrDefault(Tema.SISTEMA)

    fun definirTema(ctx: Context, tema: Tema) {
        caderno(ctx).edit().putString(TEMA, tema.name).apply()
    }

    // -- limpeza automática de cache -------------------------------------------

    fun rotinaLigada(ctx: Context): Boolean = caderno(ctx).getBoolean(ROTINA, false)

    fun definirRotina(ctx: Context, ligada: Boolean) {
        caderno(ctx).edit().putBoolean(ROTINA, ligada).apply()
    }

    /** Quando a rotina rodou pela última vez. Zero enquanto nunca tiver rodado. */
    fun rotinaQuando(ctx: Context): Long = caderno(ctx).getLong(ROTINA_QUANDO, 0L)

    /** Quanto a rotina já liberou somado, para a tela não precisar prometer nada. */
    fun rotinaBytes(ctx: Context): Long = caderno(ctx).getLong(ROTINA_BYTES, 0L)

    /**
     * Anota o que a passagem automática rendeu, inclusive quando rendeu zero.
     *
     * O horário é gravado sempre; os bytes só somam quando houve ganho. É isso
     * que permite a tela dizer "rodou de madrugada e não achou nada" em vez de
     * dar a entender que a rotina não funciona.
     */
    fun registrarRotina(ctx: Context, bytes: Long) {
        val c = caderno(ctx)
        c.edit()
            .putLong(ROTINA_QUANDO, System.currentTimeMillis())
            .putLong(ROTINA_BYTES, c.getLong(ROTINA_BYTES, 0L) + bytes.coerceAtLeast(0L))
            .apply()
    }
}
