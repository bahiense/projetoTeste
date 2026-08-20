package com.bahiense.faxina

import android.app.usage.StorageStatsManager
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.os.Process
import android.os.storage.StorageManager
import java.util.concurrent.TimeUnit

data class AppInstalado(
    val pacote: String,
    val nome: String,
    /** Tamanho do APK instalado e das bibliotecas nativas. */
    val apk: Long,
    /** Dados privados do app. O Android já conta o cache aqui dentro. */
    val dados: Long,
    /** Parte de [dados] que é descartável — mostrada à parte porque é o alvo fácil. */
    val cache: Long,
    val doSistema: Boolean,
    val instaladoEm: Long = 0L,
    val atualizadoEm: Long = 0L,
    /** Última vez em primeiro plano. Zero quando não há registro no período. */
    val ultimoUso: Long = 0L,
    /** Tempo somado em primeiro plano no último ano. */
    val tempoEmUso: Long = 0L,
) {
    val total: Long get() = apk + dados

    /** Dados que sobram depois de tirar o cache: o que uma limpeza de cache não resolve. */
    val dadosSemCache: Long get() = (dados - cache).coerceAtLeast(0L)
}

data class UsoDoAparelho(
    val total: Long,
    val livre: Long,
) {
    val usado: Long get() = (total - livre).coerceAtLeast(0L)
    val fracaoUsada: Float
        get() = if (total <= 0L) 0f else (usado.toFloat() / total.toFloat()).coerceIn(0f, 1f)
}

/**
 * A tela da Samsung lista vídeos, fotos e documentos, mas não mostra o que
 * quase sempre é o maior consumidor: os próprios aplicativos e os dados que
 * eles guardam. Esta é a parte do app que preenche esse buraco.
 *
 * Um app comum não consegue limpar o cache de outro — `clearApplicationUserData`
 * é reservado ao sistema. O que dá para fazer é medir e levar o usuário direto
 * à tela onde os botões existem.
 */
object AppsInstalados {

    fun uso(ctx: Context): UsoDoAparelho {
        val ssm = ctx.getSystemService(Context.STORAGE_STATS_SERVICE) as? StorageStatsManager
            ?: return UsoDoAparelho(0L, 0L)
        return try {
            UsoDoAparelho(
                total = ssm.getTotalBytes(StorageManager.UUID_DEFAULT),
                livre = ssm.getFreeBytes(StorageManager.UUID_DEFAULT),
            )
        } catch (e: Exception) {
            UsoDoAparelho(0L, 0L)
        }
    }

    /**
     * O pacote ainda está instalado?
     *
     * Serve para a tela de detalhe perceber que o app foi embora enquanto o
     * usuário estava no diálogo do Android. Sem isso ela continuaria mostrando
     * os números de algo que não existe mais.
     */
    fun instalado(ctx: Context, pacote: String): Boolean = try {
        @Suppress("DEPRECATION")
        ctx.packageManager.getPackageInfo(pacote, 0)
        true
    } catch (e: PackageManager.NameNotFoundException) {
        false
    } catch (e: Exception) {
        false
    }

    fun listar(ctx: Context): List<AppInstalado> {
        val ssm = ctx.getSystemService(Context.STORAGE_STATS_SERVICE) as? StorageStatsManager
            ?: return emptyList()
        val pm = ctx.packageManager
        val usuario = Process.myUserHandle()

        // getInstalledPackages em vez de getInstalledApplications: só ele traz
        // as datas de instalação e de atualização, e é uma chamada só para todos.
        @Suppress("DEPRECATION")
        val instalados = try {
            pm.getInstalledPackages(0)
        } catch (e: Exception) {
            emptyList<PackageInfo>()
        }

        val uso = usoPorPacote(ctx)

        return instalados.mapNotNull { pacote ->
            val info = pacote.applicationInfo ?: return@mapNotNull null
            try {
                val stats = ssm.queryStatsForPackage(info.storageUuid, pacote.packageName, usuario)
                val registro = uso[pacote.packageName]
                AppInstalado(
                    pacote = pacote.packageName,
                    nome = pm.getApplicationLabel(info).toString(),
                    apk = stats.appBytes,
                    dados = stats.dataBytes,
                    cache = stats.cacheBytes,
                    doSistema = (info.flags and ApplicationInfo.FLAG_SYSTEM) != 0,
                    instaladoEm = pacote.firstInstallTime,
                    atualizadoEm = pacote.lastUpdateTime,
                    ultimoUso = registro?.lastTimeUsed ?: 0L,
                    tempoEmUso = registro?.totalTimeInForeground ?: 0L,
                )
            } catch (e: SecurityException) {
                // Sem "Acesso de uso" concedido, cada consulta estoura aqui.
                null
            } catch (e: PackageManager.NameNotFoundException) {
                null
            } catch (e: Exception) {
                null
            }
        }.sortedByDescending { it.total }
    }

    /**
     * Quanto cada app foi usado no último ano.
     *
     * `queryAndAggregateUsageStats` já devolve somado por pacote, o que evita
     * juntar baldes na mão. A janela de um ano é a maior que o sistema costuma
     * guardar; além dela os registros simplesmente somem, e um app sem registro
     * aparece como "sem uso" — que é diferente de "nunca aberto", e a tela diz
     * isso com essas palavras.
     */
    private fun usoPorPacote(ctx: Context): Map<String, UsageStats> = try {
        val usm = ctx.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
        if (usm == null) {
            emptyMap()
        } else {
            val fim = System.currentTimeMillis()
            usm.queryAndAggregateUsageStats(fim - TimeUnit.DAYS.toMillis(365), fim)
        }
    } catch (e: Exception) {
        emptyMap()
    }
}

/** Como ordenar a lista de apps. */
enum class OrdemDeApps(val rotulo: String) {
    ESPACO("Espaço"),
    CACHE("Cache"),
    MAIS_USADO("Mais usado"),
    MENOS_USADO("Menos usado"),
    RECENTES("Instalado agora"),
    ANTIGOS("Instalado há mais tempo"),
}

/** Quais apps entram na lista. */
enum class MostrarApps(val rotulo: String) {
    DO_USUARIO("Instalados por você"),
    DO_SISTEMA("Do sistema"),
    TODOS("Todos"),
}

fun ordenarApps(apps: List<AppInstalado>, ordem: OrdemDeApps): List<AppInstalado> = when (ordem) {
    OrdemDeApps.ESPACO -> apps.sortedByDescending { it.total }
    OrdemDeApps.CACHE -> apps.sortedByDescending { it.cache }
    OrdemDeApps.MAIS_USADO -> apps.sortedByDescending { it.tempoEmUso }
    // Sem registro conta como zero, então os nunca abertos encabeçam a lista —
    // que é exatamente quem se procura ao ordenar por menos usado.
    OrdemDeApps.MENOS_USADO -> apps.sortedBy { it.tempoEmUso }
    OrdemDeApps.RECENTES -> apps.sortedByDescending { it.instaladoEm }
    OrdemDeApps.ANTIGOS -> apps.sortedBy { it.instaladoEm }
}
