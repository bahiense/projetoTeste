package com.bahiense.segundoantes

import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import org.json.JSONObject
import java.util.Calendar

/**
 * Lembrete diário.
 *
 * A página só consegue avisar enquanto estiver aberta, o que não serve para
 * lembrar de nada. Quem avisa aqui é o AlarmManager: um alarme por dia, que
 * sobrevive ao app fechado e — por causa do BootReceptor — ao aparelho
 * reiniciado.
 *
 * O plano fica guardado em SharedPreferences, e não só no localStorage da
 * página: o receptor que remarca depois do disparo e o que roda no boot
 * precisam do plano sem poder abrir o WebView para perguntar.
 */
object Lembretes {

    private const val PREFS = "segundoantes.lembretes"
    private const val CANAL = "treino"
    private const val REQUEST = 9100
    private const val AVISO_ID = 9101
    const val HORA_PADRAO = "21:00"

    fun salvarPlano(ctx: Context, json: String) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putString("plano", json).apply()
    }

    fun plano(ctx: Context): JSONObject {
        val bruto = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("plano", null)
        return try {
            if (bruto.isNullOrBlank()) JSONObject() else JSONObject(bruto)
        } catch (e: Exception) {
            JSONObject()
        }
    }

    fun hora(ctx: Context): String = plano(ctx).optString("hora", HORA_PADRAO)

    fun ligado(ctx: Context): Boolean = plano(ctx).optBoolean("ligado", false)

    /**
     * Remarca do zero. Cancelar antes de marcar é o que evita alarme órfão de
     * um horário que o usuário acabou de trocar.
     */
    fun reagendar(ctx: Context): Boolean {
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        am.cancel(intentDoAviso(ctx))

        if (!ligado(ctx)) return false

        val partes = hora(ctx).split(":")
        val h = partes.getOrNull(0)?.toIntOrNull() ?: 21
        val m = partes.getOrNull(1)?.toIntOrNull() ?: 0
        marcar(am, proximoDisparo(h, m), intentDoAviso(ctx))
        return true
    }

    private fun proximoDisparo(h: Int, m: Int): Long {
        val agora = Calendar.getInstance()
        val c = Calendar.getInstance()
        c.set(Calendar.HOUR_OF_DAY, h)
        c.set(Calendar.MINUTE, m)
        c.set(Calendar.SECOND, 0)
        c.set(Calendar.MILLISECOND, 0)
        // a hora de hoje já passou: o próximo é amanhã
        if (c.timeInMillis <= agora.timeInMillis) c.add(Calendar.DAY_OF_YEAR, 1)
        return c.timeInMillis
    }

    private fun marcar(am: AlarmManager, quando: Long, pi: PendingIntent) {
        try {
            if (podeExato(am)) {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, quando, pi)
            } else {
                // Sem permissão de alarme exato o aviso ainda chega, só que o
                // Android escolhe o minuto. Melhor atrasado que nenhum.
                am.setWindow(AlarmManager.RTC_WAKEUP, quando, 15 * 60_000L, pi)
            }
        } catch (e: SecurityException) {
            am.setWindow(AlarmManager.RTC_WAKEUP, quando, 15 * 60_000L, pi)
        }
    }

    fun podeExato(am: AlarmManager): Boolean =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) am.canScheduleExactAlarms() else true

    fun podeExato(ctx: Context): Boolean =
        podeExato(ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager)

    fun podeNotificar(ctx: Context): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ctx.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS)
                != android.content.pm.PackageManager.PERMISSION_GRANTED
            ) return false
        }
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        return nm.areNotificationsEnabled()
    }

    private fun intentDoAviso(ctx: Context): PendingIntent {
        val i = Intent(ctx, AlarmeReceptor::class.java).apply {
            action = "com.bahiense.segundoantes.LEMBRETE"
        }
        return PendingIntent.getBroadcast(
            ctx, REQUEST, i,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    fun notificar(ctx: Context) {
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val canal = NotificationChannel(
            CANAL, "Lembrete do treino", NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "O aviso diário de fazer o bloco da noite."
        }
        nm.createNotificationChannel(canal)

        val corpo = "Desmontagem do episódio mais forte, ensaio mental, marcar o dia. " +
            "Sete minutos."

        val abrir = Intent(ctx, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pi = PendingIntent.getActivity(
            ctx, 1, abrir, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val n = Notification.Builder(ctx, CANAL)
            .setSmallIcon(R.drawable.ic_aviso)
            .setContentTitle("O bloco da noite")
            .setContentText(corpo)
            .setStyle(Notification.BigTextStyle().bigText(corpo))
            .setContentIntent(pi)
            .setAutoCancel(true)
            .build()

        try {
            nm.notify(AVISO_ID, n)
        } catch (e: SecurityException) {
            // permissão revogada entre o agendamento e o disparo
        }
    }
}

/**
 * Dispara o aviso e já remarca o dia seguinte: setExactAndAllowWhileIdle vale
 * para uma vez só, não é um alarme repetido.
 */
class AlarmeReceptor : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
        Lembretes.notificar(ctx)
        Lembretes.reagendar(ctx)
    }
}

/** Alarme não sobrevive a reiniciar o aparelho; o plano guardado, sim. */
class BootReceptor : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
        val acao = intent.action ?: return
        if (acao == Intent.ACTION_BOOT_COMPLETED ||
            acao == Intent.ACTION_MY_PACKAGE_REPLACED ||
            acao == "android.intent.action.QUICKBOOT_POWERON"
        ) {
            Lembretes.reagendar(ctx)
        }
    }
}
