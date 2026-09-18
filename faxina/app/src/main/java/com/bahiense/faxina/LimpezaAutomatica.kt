package com.bahiense.faxina

import android.app.job.JobInfo
import android.app.job.JobParameters
import android.app.job.JobScheduler
import android.app.job.JobService
import android.content.ComponentName
import android.content.Context
import java.util.concurrent.TimeUnit

/**
 * A limpeza de cache que roda sozinha, sem o usuário abrir o app.
 *
 * É a mesma operação do botão "Liberar cache": pedir espaço ao Android pelo
 * `StorageManager.allocateBytes` e deixar o sistema decidir o que descartar.
 * Nada de novo acontece aqui — o que muda é quem aperta o botão e quando.
 *
 * **Por que JobScheduler e não WorkManager.** O WorkManager é a ferramenta
 * padrão e faria isto com menos linhas, mas traria uma biblioteca inteira, e
 * nesta mesma base já custou caro mexer nas dependências: uma versão de
 * coroutines mais nova que a testada contra o Compose produziu um app que abria
 * e fechava. O JobScheduler é da plataforma, existe desde muito antes do
 * mínimo suportado aqui, e o que este serviço precisa dele cabe em um arquivo.
 *
 * **Por que com o aparelho parado e sem bateria baixa.** Limpar cache enquanto
 * a pessoa usa o celular é contraproducente: o app recria o que precisa em
 * seguida, gastando processamento, bateria e às vezes dados móveis para baixar
 * de novo o que acabou de ser jogado fora. Cache descartado de madrugada não
 * custa nada; cache descartado no meio do uso custa duas vezes.
 */
class LimpezaAutomatica : JobService() {

    override fun onStartJob(params: JobParameters?): Boolean {
        /*
         * onStartJob roda na thread principal, e medir armazenamento é I/O.
         * Devolver true promete ao sistema que o trabalho segue em outra thread
         * e que jobFinished será chamado no fim — sem isso o Android considera
         * o job encerrado no retorno.
         */
        Thread {
            val feito = runCatching { CacheDoSistema.liberar(applicationContext) }
                .getOrDefault(CacheDoSistema.Faxinada(0L))

            // Mesma regra do resto do app: só entra no histórico o que virou
            // espaço livre de verdade, medido antes e depois.
            Historico.somar(applicationContext, feito.bytes)
            Preferencias.registrarRotina(applicationContext, feito.bytes)

            jobFinished(params, false)
        }.start()
        return true
    }

    /**
     * O sistema retomou as condições antes de terminarmos.
     *
     * Devolver false é deliberado: não vale reagendar uma tentativa perdida. A
     * próxima passagem periódica resolve, e insistir em limpar cache é
     * justamente o comportamento que gasta bateria sem devolver espaço.
     */
    override fun onStopJob(params: JobParameters?): Boolean = false

    companion object {
        private const val ID = 4201

        /** Doze e o agrupamento de jobs mandam mais que este número. É um piso, não um relógio. */
        private val INTERVALO = TimeUnit.HOURS.toMillis(12)

        /**
         * Devolve se o sistema aceitou. O `runCatching` cobre o `build()` junto
         * com o `schedule()` de propósito: ROMs modificadas recusam combinações
         * de restrições que o AOSP aceita, e o erro sai do construtor. Uma chave
         * que não liga é ruim; um app que fecha ao tocar na chave é pior.
         */
        fun agendar(ctx: Context): Boolean = runCatching {
            val agenda = ctx.getSystemService(Context.JOB_SCHEDULER_SERVICE) as? JobScheduler
                ?: return false

            val job = JobInfo.Builder(ID, ComponentName(ctx, LimpezaAutomatica::class.java))
                .setPeriodic(INTERVALO)
                .setRequiresDeviceIdle(true)
                .setRequiresBatteryNotLow(true)
                // Sobrevive ao reinício do aparelho; é o que exige a permissão
                // RECEIVE_BOOT_COMPLETED no manifesto.
                .setPersisted(true)
                .build()

            agenda.schedule(job) == JobScheduler.RESULT_SUCCESS
        }.getOrDefault(false)

        fun cancelar(ctx: Context) {
            val agenda = ctx.getSystemService(Context.JOB_SCHEDULER_SERVICE) as? JobScheduler
            runCatching { agenda?.cancel(ID) }
        }

        /** Pergunta ao sistema, não à preferência: é ele quem sabe se o job existe. */
        fun agendada(ctx: Context): Boolean {
            val agenda = ctx.getSystemService(Context.JOB_SCHEDULER_SERVICE) as? JobScheduler
                ?: return false
            return runCatching { agenda.getPendingJob(ID) != null }.getOrDefault(false)
        }
    }
}
