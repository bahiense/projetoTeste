package com.bahiense.faxina

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.os.Process
import android.os.storage.StorageManager
import android.provider.Settings

/**
 * O app depende de duas permissões que não aparecem no diálogo comum de
 * permissões: as duas exigem que o usuário vá até uma tela de Configurações e
 * ligue uma chave. Aqui ficam as checagens e os atalhos para essas telas.
 */
object Permissoes {

    /** Acesso a todos os arquivos: sem ele a varredura só enxerga a pasta do próprio app. */
    fun temAcessoAArquivos(ctx: Context): Boolean =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            Environment.isExternalStorageManager()
        } else {
            ctx.checkSelfPermission(android.Manifest.permission.READ_EXTERNAL_STORAGE) ==
                PackageManager.PERMISSION_GRANTED
        }

    fun telaDeAcessoAArquivos(ctx: Context): Intent =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // A tela específica do app às vezes não existe em ROMs modificadas,
            // por isso quem chama precisa ter o plano B da lista geral.
            Intent(
                Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION,
                Uri.parse("package:${ctx.packageName}"),
            )
        } else {
            Intent(
                Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                Uri.fromParts("package", ctx.packageName, null),
            )
        }

    fun telaDeAcessoAArquivosGeral(): Intent =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION)
        } else {
            Intent(Settings.ACTION_SETTINGS)
        }

    /** Acesso de uso: sem ele não dá para saber quanto cada app instalado ocupa. */
    fun temAcessoDeUso(ctx: Context): Boolean {
        val ops = ctx.getSystemService(Context.APP_OPS_SERVICE) as? AppOpsManager ?: return false
        val modo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ops.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                ctx.packageName,
            )
        } else {
            @Suppress("DEPRECATION")
            ops.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                ctx.packageName,
            )
        }
        return modo == AppOpsManager.MODE_ALLOWED
    }

    fun telaDeAcessoDeUso(): Intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)

    /** Tela de detalhes de um app instalado, onde ficam "Desinstalar" e "Limpar cache". */
    fun telaDoApp(pacote: String): Intent =
        Intent(
            Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
            Uri.fromParts("package", pacote, null),
        )

    /**
     * Tentativa de cair direto no submenu "Armazenamento" do app, pulando a tela
     * de informações.
     *
     * Não existe intent pública para isso: a atividade é interna do app de
     * Configurações e cada fabricante monta a sua. Vale a tentativa porque, na
     * pior das hipóteses, quem chama cai no [telaDoApp] de sempre — nunca fica
     * pior que o comportamento atual.
     */
    fun telasDeArmazenamentoDoApp(pacote: String): List<Intent> {
        val dados = Uri.fromParts("package", pacote, null)
        val argumentos = Bundle().apply { putString("package", pacote) }

        fun porClasse(classe: String) = Intent(Intent.ACTION_MAIN)
            .setClassName("com.android.settings", classe)
            .putExtra(":settings:show_fragment_args", argumentos)
            .putExtra("package", pacote)
            .setData(dados)

        // Da tela mais específica para a mais genérica. Componente inexistente
        // levanta ActivityNotFoundException e componente fechado levanta
        // SecurityException — quem chama trata as duas e passa para a próxima,
        // então a lista custa apenas a tentativa.
        return listOf(
            porClasse("com.android.settings.Settings\$AppStorageActivity"),
            porClasse("com.android.settings.Settings\$StorageUseActivity"),
            porClasse("com.android.settings.applications.AppStorageSettingsActivity"),
            telaDoApp(pacote),
        )
    }

    /**
     * Assistente de liberação de espaço do próprio sistema. É público e
     * documentado, e leva à mesma rotina que o Android usa quando o
     * armazenamento enche.
     */
    fun assistenteDeEspaco(): Intent = Intent(StorageManager.ACTION_MANAGE_STORAGE)
}
