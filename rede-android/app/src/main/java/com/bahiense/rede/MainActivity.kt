package com.bahiense.rede

import android.app.Activity
import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.VpnService
import android.os.Build
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

/**
 * A única tela do app. Serve para ligar a proteção uma vez e, no fim, ocultar
 * o ícone. Depois de ocultar, o app some da gaveta de aplicativos; a proteção
 * continua rodando em segundo plano e religa a cada boot.
 */
class MainActivity : Activity() {

    private val PEDIR_VPN = 1
    private lateinit var status: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val raiz = LinearLayout(this)
        raiz.orientation = LinearLayout.VERTICAL
        raiz.setBackgroundColor(Color.parseColor("#0B0B0D"))
        raiz.setPadding(56, 120, 56, 56)
        raiz.gravity = Gravity.CENTER_HORIZONTAL

        val titulo = TextView(this)
        titulo.text = "Rede"
        titulo.setTextColor(Color.parseColor("#E8E8EA"))
        titulo.textSize = 26f
        raiz.addView(titulo)

        status = TextView(this)
        status.setTextColor(Color.parseColor("#9AA0A6"))
        status.textSize = 15f
        status.setPadding(0, 40, 0, 40)
        raiz.addView(status)

        val bAtivar = Button(this)
        bAtivar.text = "Ativar proteção"
        bAtivar.setOnClickListener { pedirVpn() }
        raiz.addView(bAtivar, larguraCheia())

        val bOcultar = Button(this)
        bOcultar.text = "Concluir e ocultar o app"
        bOcultar.setOnClickListener { ocultar() }
        raiz.addView(bOcultar, larguraCheia())

        setContentView(raiz)

        // se já foi autorizado antes, garante que está rodando
        if (VpnService.prepare(this) == null) {
            FiltroVpnService.iniciar(this)
        }
        atualizar()
    }

    private fun larguraCheia(): LinearLayout.LayoutParams {
        val lp = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT
        )
        lp.topMargin = 24
        return lp
    }

    override fun onResume() {
        super.onResume()
        atualizar()
    }

    private fun atualizar() {
        status.text = if (FiltroVpnService.ativo)
            "Proteção ativa.\n\nPara ficar firme mesmo depois de reiniciar, ligue também\na \"VPN sempre ativa\" para o app Rede em:\nAjustes › Rede e internet › VPN.\n\nQuando terminar, toque em \"Concluir e ocultar\"."
        else
            "Proteção desligada.\nToque em \"Ativar proteção\"."
    }

    private fun pedirVpn() {
        val intent = VpnService.prepare(this)
        if (intent != null) {
            startActivityForResult(intent, PEDIR_VPN)
        } else {
            FiltroVpnService.iniciar(this)
            atualizar()
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == PEDIR_VPN && resultCode == Activity.RESULT_OK) {
            FiltroVpnService.iniciar(this)
        }
        atualizar()
    }

    /** Desliga o alias do lançador: o ícone some da gaveta de aplicativos. */
    private fun ocultar() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            // pede notificação para a barrinha do serviço não sumir no Android 13+
            try {
                requestPermissions(arrayOf(android.Manifest.permission.POST_NOTIFICATIONS), 9)
            } catch (_: Exception) {}
        }
        FiltroVpnService.iniciar(this)
        val alias = ComponentName(this, "com.bahiense.rede.Lancador")
        packageManager.setComponentEnabledSetting(
            alias,
            PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
            PackageManager.DONT_KILL_APP
        )
        status.text = "Pronto. O app foi ocultado e a proteção segue ativa.\n\n" +
            "Para desinstalar (se um dia precisar), procure \"Rede\" em\n" +
            "Ajustes › Aplicativos."
        finishAfterTransition()
    }
}
