package com.bahiense.rede

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.VpnService

/**
 * Religa o filtro depois de reiniciar o aparelho ou de o app ser atualizado.
 *
 * Só conseguimos religar sem interação se a permissão de VPN já tiver sido
 * concedida antes (VpnService.prepare devolve null). O jeito mais garantido
 * de sobreviver ao boot é o usuário ligar a "VPN sempre ativa" nas
 * configurações; aí o próprio Android reergue a VPN.
 */
class BootReceptor : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        val acao = intent?.action ?: return
        if (acao == Intent.ACTION_BOOT_COMPLETED ||
            acao == Intent.ACTION_MY_PACKAGE_REPLACED ||
            acao == "android.intent.action.QUICKBOOT_POWERON"
        ) {
            if (VpnService.prepare(context) == null) {
                FiltroVpnService.iniciar(context)
            }
        }
    }
}
