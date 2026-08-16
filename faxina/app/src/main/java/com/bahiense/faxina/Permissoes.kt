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

    /** Onde o usuário chega ao tocar "Limpar" em um app. */
    fun telasDeArmazenamentoDoApp(pacote: String): List<Intent> {
        /*
         * Só a intent pública, e por um motivo aprendido na prática.
         *
         * Antes daqui havia três palpites de atividade interna de Configurações,
         * tentados antes desta. Um deles, `Settings$StorageUseActivity`, existe
         * na One UI — mas é a LISTA de apps por armazenamento, não a tela de um
         * app. Como ela abria sem erro, era sempre a escolhida, e o usuário caía
         * em "Aplicativos" e tinha de procurar o app na mão. Palpite que resolve
         * é atalho; palpite que abre a tela errada é caminho mais longo.
         *
         * ACTION_APPLICATION_DETAILS_SETTINGS é documentada e cai na tela do app
         * pedido, sempre. Dali sobram dois toques: "Armazenamento" e "Limpar
         * cache". Menos que isso não existe sem o serviço de acessibilidade.
         */
        val destaque = Bundle().apply {
            putString(":settings:fragment_args_key", CHAVE_DE_ARMAZENAMENTO)
        }

        return listOf(
            telaDoApp(pacote)
                // Pede ao Configurações que realce a linha de armazenamento.
                // Onde não for entendido, o extra é ignorado sem efeito nenhum.
                .putExtra(":settings:fragment_args_key", CHAVE_DE_ARMAZENAMENTO)
                .putExtra(":settings:show_fragment_args", destaque),
        )
    }

    /**
     * Assistente de liberação de espaço do próprio sistema. É público e
     * documentado, e leva à mesma rotina que o Android usa quando o
     * armazenamento enche.
     */
    fun assistenteDeEspaco(): Intent = Intent(StorageManager.ACTION_MANAGE_STORAGE)

    /**
     * O diálogo de desinstalação do sistema.
     *
     * É a única forma de um app comum remover outro, e ela não remove nada
     * sozinha: abre a confirmação do Android, com o nome do app na tela, e
     * quem aperta "OK" é o usuário. O Faxina nunca desinstala nada por conta
     * própria — nem teria como.
     *
     * Vale para apps instalados por você. Os que vieram no aparelho não são
     * desinstaláveis; para esses, o caminho é "Desativar", na tela de
     * informações do app.
     */
    fun desinstalar(pacote: String): Intent =
        Intent(Intent.ACTION_DELETE, Uri.parse("package:$pacote"))

    /** Nome da preferência de armazenamento na tela de informações do app, no AOSP. */
    private const val CHAVE_DE_ARMAZENAMENTO = "storage_settings"
}
