package com.bahiense.faxina

import android.app.usage.StorageStatsManager
import android.content.Context
import android.os.storage.StorageManager
import java.io.IOException

/**
 * Limpeza de cache sem privilégio de sistema.
 *
 * `clearApplicationUserData` e `deleteApplicationCacheFiles` são reservados a
 * apps assinados com a chave da plataforma, então o caminho óbvio está fechado.
 * Mas existe um caminho oficial e público que chega ao mesmo lugar:
 *
 *   `StorageManager.allocateBytes(uuid, n)` diz ao sistema "vou escrever n
 *   bytes". Para atender ao pedido, o próprio Android apaga arquivos de cache
 *   de quem estiver ocupando espaço.
 *
 * A segurança aqui não depende de acertarmos quais arquivos são descartáveis —
 * essa decisão é do sistema operacional, e ele só considera descartável o que
 * está em diretório de cache. Documentos, fotos, bancos de dados, logins e
 * qualquer coisa em `files/` ficam intocados por construção. É a mesma rotina
 * que o Android roda sozinho quando o armazenamento enche.
 *
 * O que ele não faz: escolher um app específico. Isso continua sendo tela de
 * Configurações, e a lista da aba leva direto a ela.
 */
object CacheDoSistema {

    data class Medida(
        val livre: Long,
        val alocavel: Long,
    ) {
        /**
         * Quanto o sistema topa apagar agora. É uma estimativa dele, não nossa:
         * sem a permissão `ALLOCATE_AGGRESSIVE` (que é de sistema), o Android
         * costuma oferecer só o cache que passou da cota de cada app.
         */
        val liberavel: Long get() = (alocavel - livre).coerceAtLeast(0L)
    }

    data class Faxinada(
        val bytes: Long,
        val erro: String? = null,
    )

    fun medir(ctx: Context): Medida {
        val livre = livre(ctx)
        val alocavel = try {
            val sm = ctx.getSystemService(Context.STORAGE_SERVICE) as? StorageManager
            sm?.getAllocatableBytes(StorageManager.UUID_DEFAULT) ?: livre
        } catch (e: IOException) {
            livre
        } catch (e: Exception) {
            livre
        }
        return Medida(livre = livre, alocavel = alocavel)
    }

    /**
     * Dispara a limpeza e devolve o que realmente sobrou de espaço — medido
     * antes e depois, não a estimativa. Se o sistema resolver não apagar nada,
     * o número volta zero, e é isso que a tela deve mostrar.
     */
    fun liberar(ctx: Context): Faxinada {
        val sm = ctx.getSystemService(Context.STORAGE_SERVICE) as? StorageManager
            ?: return Faxinada(0L, "Serviço de armazenamento indisponível.")

        val antes = livre(ctx)
        return try {
            val uuid = StorageManager.UUID_DEFAULT
            val alvo = sm.getAllocatableBytes(uuid)
            if (alvo > 0) sm.allocateBytes(uuid, alvo)
            Faxinada((livre(ctx) - antes).coerceAtLeast(0L))
        } catch (e: IOException) {
            Faxinada(
                (livre(ctx) - antes).coerceAtLeast(0L),
                "O sistema recusou o pedido: ${e.message ?: "sem detalhe"}",
            )
        } catch (e: Exception) {
            Faxinada(
                (livre(ctx) - antes).coerceAtLeast(0L),
                e.message ?: "Erro desconhecido",
            )
        }
    }

    private fun livre(ctx: Context): Long = try {
        val ssm = ctx.getSystemService(Context.STORAGE_STATS_SERVICE) as? StorageStatsManager
        ssm?.getFreeBytes(StorageManager.UUID_DEFAULT) ?: 0L
    } catch (e: Exception) {
        0L
    }
}
