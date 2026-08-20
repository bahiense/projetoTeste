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

    private fun caderno(ctx: Context) =
        ctx.getSharedPreferences(ARQUIVO, Context.MODE_PRIVATE)

    fun tema(ctx: Context): Tema =
        runCatching { Tema.valueOf(caderno(ctx).getString(TEMA, null) ?: "") }
            .getOrDefault(Tema.SISTEMA)

    fun definirTema(ctx: Context, tema: Tema) {
        caderno(ctx).edit().putString(TEMA, tema.name).apply()
    }
}
