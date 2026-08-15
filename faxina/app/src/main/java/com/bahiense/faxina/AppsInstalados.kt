package com.bahiense.faxina

import android.app.usage.StorageStatsManager
import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Process
import android.os.storage.StorageManager

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

    fun listar(ctx: Context): List<AppInstalado> {
        val ssm = ctx.getSystemService(Context.STORAGE_STATS_SERVICE) as? StorageStatsManager
            ?: return emptyList()
        val pm = ctx.packageManager
        val usuario = Process.myUserHandle()

        @Suppress("DEPRECATION")
        val instalados = try {
            pm.getInstalledApplications(0)
        } catch (e: Exception) {
            emptyList<ApplicationInfo>()
        }

        return instalados.mapNotNull { info ->
            try {
                val stats = ssm.queryStatsForPackage(info.storageUuid, info.packageName, usuario)
                AppInstalado(
                    pacote = info.packageName,
                    nome = pm.getApplicationLabel(info).toString(),
                    apk = stats.appBytes,
                    dados = stats.dataBytes,
                    cache = stats.cacheBytes,
                    doSistema = (info.flags and ApplicationInfo.FLAG_SYSTEM) != 0,
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
}
