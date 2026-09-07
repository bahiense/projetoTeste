package com.bahiense.fluencia

import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar

/**
 * Lembrete de estudo.
 *
 * A página só consegue avisar enquanto estiver aberta, o que não serve para
 * lembrar de nada. Quem avisa aqui é o AlarmManager: um alarme por dia da
 * semana escolhido, que sobrevive ao app fechado e — por causa do
 * BootReceptor — ao aparelho reiniciado.
 *
 * O plano fica guardado em SharedPreferences, e não só no localStorage da
 * página: o receptor que reagenda depois do disparo e o que roda no boot
 * precisam do plano sem poder abrir o WebView para perguntar.
 */
object Lembretes {

    private const val PREFS = "fluencia.lembretes"
    private const val CANAL = "estudo"
    private const val BASE_REQUEST = 8100

    // 0 = domingo, para bater com o getDay() do JavaScript
    private val DIA_PARA_CALENDAR = intArrayOf(
        Calendar.SUNDAY, Calendar.MONDAY, Calendar.TUESDAY, Calendar.WEDNESDAY,
        Calendar.THURSDAY, Calendar.FRIDAY, Calendar.SATURDAY
    )

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

    /**
     * Reagenda tudo do zero. Cancelar antes de marcar é o que evita alarme
     * órfão de um dia que o aluno acabou de desmarcar.
     *
     * Devolve quantos alarmes ficaram de pé.
     */
    fun reagendar(ctx: Context): Int {
        val p = plano(ctx)
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        for (dia in 0..6) am.cancel(intentDoDia(ctx, dia))

        if (!p.optBoolean("ligado", false)) return 0

        val dias = p.optJSONArray("dias") ?: JSONArray()
        val hora = p.optString("hora", "19:00")
        val antes = p.optInt("antes", 0)
        val partes = hora.split(":")
        val h = partes.getOrNull(0)?.toIntOrNull() ?: 19
        val m = partes.getOrNull(1)?.toIntOrNull() ?: 0

        var marcados = 0
        for (i in 0 until dias.length()) {
            val dia = dias.optInt(i, -1)
            if (dia < 0 || dia > 6) continue
            val quando = proximoDisparo(dia, h, m, antes)
            val pi = intentDoDia(ctx, dia)
            marcar(am, quando, pi)
            marcados++
        }
        return marcados
    }

    /**
     * O dia escolhido é o dia do ESTUDO. A antecedência é subtraída depois,
     * então segunda 00:05 com 10 minutos de aviso dispara no domingo 23:55 —
     * e não numa segunda que já passou.
     */
    private fun proximoDisparo(diaJs: Int, h: Int, m: Int, antes: Int): Long {
        val agora = Calendar.getInstance()
        val c = Calendar.getInstance()
        c.set(Calendar.DAY_OF_WEEK, DIA_PARA_CALENDAR[diaJs])
        c.set(Calendar.HOUR_OF_DAY, h)
        c.set(Calendar.MINUTE, m)
        c.set(Calendar.SECOND, 0)
        c.set(Calendar.MILLISECOND, 0)
        c.add(Calendar.MINUTE, -antes)

        // set(DAY_OF_WEEK) pode cair para trás dentro da semana corrente
        while (c.timeInMillis <= agora.timeInMillis) c.add(Calendar.DAY_OF_YEAR, 7)
        return c.timeInMillis
    }

    private fun marcar(am: AlarmManager, quando: Long, pi: PendingIntent) {
        val exato = podeExato(am)
        try {
            if (exato) {
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

    private fun intentDoDia(ctx: Context, dia: Int): PendingIntent {
        val i = Intent(ctx, AlarmeReceptor::class.java).apply {
            action = "com.bahiense.fluencia.LEMBRETE"
            putExtra("dia", dia)
        }
        return PendingIntent.getBroadcast(
            ctx, BASE_REQUEST + dia, i,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    fun notificar(ctx: Context) {
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val canal = NotificationChannel(
                CANAL, "Lembrete de estudo", NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "O aviso de que a sua hora de estudar está chegando."
            }
            nm.createNotificationChannel(canal)
        }

        val antes = plano(ctx).optInt("antes", 0)
        val corpo = if (antes <= 0) {
            "Hora de estudar. Comece pelo bloco de hoje."
        } else {
            "Seu estudo começa em $antes ${if (antes > 1) "minutos" else "minuto"}. " +
                "Separe o fone e um lugar onde dê para falar alto."
        }

        val abrir = Intent(ctx, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pi = PendingIntent.getActivity(
            ctx, 1, abrir, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val n = Notification.Builder(ctx, CANAL)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("Fluência 180")
            .setContentText(corpo)
            .setStyle(Notification.BigTextStyle().bigText(corpo))
            .setContentIntent(pi)
            .setAutoCancel(true)
            .build()

        try {
            nm.notify(7180, n)
        } catch (e: SecurityException) {
            // permissão revogada entre o agendamento e o disparo
        }
    }
}

/**
 * Dispara o aviso e já remarca a semana seguinte: setExactAndAllowWhileIdle
 * vale para uma vez só, não é um alarme repetido.
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
