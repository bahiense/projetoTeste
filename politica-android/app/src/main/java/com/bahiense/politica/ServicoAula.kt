package com.bahiense.politica

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder

/**
 * Escrever uma aula leva vários minutos. Este serviço não faz o trabalho (ele
 * roda nas threads da Ponte): só mantém o app em primeiro plano, com uma
 * notificação, para o Android não matar o processo se a pessoa for para outro
 * app no meio. Some sozinho quando não há mais aula sendo escrita.
 */
class ServicoAula : Service() {

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (Ponte.gerando.isEmpty()) { parar(); return START_NOT_STICKY }
        val gerenciador = getSystemService(NotificationManager::class.java)
        gerenciador?.createNotificationChannel(
            NotificationChannel(CANAL, "Aulas sendo preparadas", NotificationManager.IMPORTANCE_LOW)
        )
        val abrir = PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        val n = Notification.Builder(this, CANAL)
            .setSmallIcon(android.R.drawable.ic_menu_edit)
            .setContentTitle("O professor está preparando a aula")
            .setContentText("Pode usar o celular normalmente. Leva alguns minutos.")
            .setContentIntent(abrir)
            .setOngoing(true)
            .build()
        if (Build.VERSION.SDK_INT >= 34)
            startForeground(1, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
        else
            startForeground(1, n)
        return START_NOT_STICKY
    }

    private fun parar() {
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    companion object {
        private const val CANAL = "aulas"

        /** Liga ou desliga conforme houver aula sendo escrita. */
        fun atualizar(context: Context) {
            val i = Intent(context, ServicoAula::class.java)
            if (Ponte.gerando.isEmpty()) context.stopService(i)
            else try { context.startForegroundService(i) } catch (_: Exception) { }
        }
    }
}
