package com.bahiense.faxina

import android.graphics.drawable.Icon
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import android.widget.Toast

/**
 * O botão de limpeza na aba de notificações.
 *
 * É o mesmo `CacheDoSistema.liberar` da tela de Cache, só que alcançável sem
 * abrir o app: dois arrastos para baixo e um toque. Limpar cache é a operação
 * que o usuário repete mais, e a única que não precisa de nenhuma escolha —
 * então é a única que faz sentido colocar aqui.
 *
 * O bloco de recursos do Play Protect não pega este serviço: a permissão que
 * ele exige é BIND_QUICK_SETTINGS_TILE, sem nada de acessibilidade. Fica na
 * versão padrão junto com o resto.
 */
class AtalhoDeLimpeza : TileService() {

    private val naTela = Handler(Looper.getMainLooper())

    override fun onStartListening() {
        super.onStartListening()
        // A medida é uma leitura de estatística de armazenamento: rápida, mas
        // ainda assim de disco. Fora da thread da interface do sistema.
        Thread {
            val medida = CacheDoSistema.medir(applicationContext)
            naTela.post { descrever(medida) }
        }.start()
    }

    override fun onClick() {
        super.onClick()

        val t = qsTile
        if (t != null) {
            t.state = Tile.STATE_UNAVAILABLE
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                t.subtitle = "Limpando…"
            }
            t.updateTile()
        }

        Thread {
            val feito = CacheDoSistema.liberar(applicationContext)
            naTela.post {
                val recado = when {
                    feito.erro != null -> "Faxina: ${feito.erro}"
                    feito.bytes <= 0L -> "Faxina: o sistema não tinha cache descartável agora."
                    else -> "Faxina: ${formatarBytes(feito.bytes)} liberados."
                }
                Toast.makeText(applicationContext, recado, Toast.LENGTH_LONG).show()
                descrever(CacheDoSistema.medir(applicationContext))
            }
        }.start()
    }

    /** Deixa o próprio bloco dizer quanto há para liberar, sem abrir nada. */
    private fun descrever(medida: CacheDoSistema.Medida) {
        val t = qsTile ?: return
        t.state = Tile.STATE_INACTIVE
        t.label = "Limpar cache"
        t.icon = Icon.createWithResource(this, R.drawable.ic_atalho_limpeza)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            t.subtitle = if (medida.liberavel > 0) {
                "~${formatarBytes(medida.liberavel)}"
            } else {
                formatarBytes(medida.livre) + " livres"
            }
        }
        t.updateTile()
    }
}
