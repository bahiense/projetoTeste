package com.bahiense.faxina

import android.app.ActivityManager
import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager

/**
 * Liberar memória, e a verdade sobre o que isso resolve.
 *
 * Esta é a função mais vendida e mais mentida dos aplicativos de limpeza. O
 * que existe de verdade é `killBackgroundProcesses`, que encerra os processos
 * em segundo plano de um pacote. O que os anúncios não dizem:
 *
 * - **O Android relança boa parte quase na hora.** Serviços declarados como
 *   `START_STICKY`, alarmes e tarefas agendadas voltam sozinhos, e a memória
 *   liberada some em segundos.
 * - **Relançar custa mais bateria do que deixar quieto.** Um processo parado em
 *   segundo plano praticamente não consome; recriá-lo do zero consome.
 * - **Memória livre não é virtude.** O Android usa de propósito a RAM que sobra
 *   para manter apps prontos; "livre" ali quer dizer "desperdiçada". O próprio
 *   sistema já mata o que precisa, na hora exata em que precisa.
 *
 * Então por que existe? Porque tem um uso legítimo e estreito: quando um app se
 * comporta mal e trava o aparelho, encerrá-lo devolve a fluidez na hora. Fora
 * disso, o botão devolve pouco e cobra bateria — e a tela diz isso com essas
 * palavras, em vez de exibir um número inflado.
 *
 * O que este arquivo faz de diferente do gênero: **mede antes e depois e conta
 * o resultado real**, mesmo quando é zero, e **poupa quem não pode ser
 * derrubado** — teclado, tela inicial, administrador e acessibilidade. Matar o
 * teclado ativo é o tipo de "otimização" que deixa o usuário sem conseguir
 * digitar.
 */
object Memoria {

    data class Medida(
        val total: Long,
        val livre: Long,
        /** Abaixo disto o sistema começa a matar processos sozinho. */
        val limiar: Long,
        val apertada: Boolean,
    ) {
        val usada: Long get() = (total - livre).coerceAtLeast(0L)
        val fracaoUsada: Float
            get() = if (total <= 0L) 0f else (usada.toFloat() / total.toFloat()).coerceIn(0f, 1f)
    }

    data class Liberada(
        val bytes: Long,
        /** Quantos pacotes foram encerrados. */
        val encerrados: Int,
        /** Quantos foram deixados em paz por serem do sistema ou estarem em uso. */
        val poupados: Int,
    )

    fun medir(ctx: Context): Medida {
        val am = ctx.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
            ?: return Medida(0L, 0L, 0L, false)
        return try {
            val info = ActivityManager.MemoryInfo()
            am.getMemoryInfo(info)
            Medida(
                total = info.totalMem,
                livre = info.availMem,
                limiar = info.threshold,
                apertada = info.lowMemory,
            )
        } catch (e: Exception) {
            Medida(0L, 0L, 0L, false)
        }
    }

    /**
     * Encerra o segundo plano dos apps que podem ser encerrados.
     *
     * A lista sai do PackageManager, e não da aba Apps, para funcionar mesmo
     * sem a permissão "Acesso de uso" — medir tamanho exige aquela permissão,
     * encerrar processo não.
     */
    fun liberar(ctx: Context): Liberada {
        val am = ctx.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
            ?: return Liberada(0L, 0, 0)

        val intocaveis = PerfilDeApps.protegidos(ctx) + ctx.packageName
        val instalados = try {
            @Suppress("DEPRECATION")
            ctx.packageManager.getInstalledApplications(0)
        } catch (e: Exception) {
            emptyList<ApplicationInfo>()
        }

        val antes = medir(ctx).livre
        var encerrados = 0
        var poupados = 0

        for (app in instalados) {
            val doSistema = (app.flags and ApplicationInfo.FLAG_SYSTEM) != 0
            if (doSistema || app.packageName in intocaveis) {
                poupados++
                continue
            }
            val deu = runCatching { am.killBackgroundProcesses(app.packageName) }.isSuccess
            if (deu) encerrados++ else poupados++
        }

        // O sistema devolve as páginas depois de encerrar, não durante. Medir
        // no mesmo instante devolveria quase sempre zero, e o número honesto
        // viraria um número errado.
        runCatching { Thread.sleep(700) }

        val depois = medir(ctx).livre
        return Liberada(
            bytes = (depois - antes).coerceAtLeast(0L),
            encerrados = encerrados,
            poupados = poupados,
        )
    }
}
