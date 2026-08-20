package com.bahiense.faxina

import android.app.admin.DevicePolicyManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Build
import android.view.accessibility.AccessibilityManager
import android.view.inputmethod.InputMethodManager

/**
 * O que o aparelho sabe dizer sobre um aplicativo.
 *
 * Vale registrar o que **não** está aqui: a descrição do que o app faz. Ela não
 * existe no aparelho — vive na ficha da loja, e nenhum app consegue lê-la sem
 * ir à rede. Inventar um texto a partir do nome do pacote seria escrever
 * ficção com cara de dado, e um palpite errado sobre "isto é importante?" é
 * exatamente o tipo de erro que faz alguém desinstalar o que não devia.
 *
 * Então o que este arquivo reúne é só o verificável: a categoria que o próprio
 * app declara no manifesto, quem o instalou, os papéis que ele exerce no
 * sistema agora, e as permissões que ele **de fato tem** — não as que pediu.
 * Para a descrição, a tela manda o usuário à loja, que é onde ela existe.
 */
object PerfilDeApps {

    /** Quão perigoso é remover. A ordem vai do mais grave ao mais banal. */
    enum class Importancia(val rotulo: String, val explicacao: String) {
        ESSENCIAL(
            "Essencial para o sistema",
            "Roda o tempo todo como parte do Android. Mexer aqui pode deixar o " +
                "aparelho instável — e o próprio sistema costuma nem deixar.",
        ),
        COMPONENTE(
            "Peça do sistema",
            "Veio no aparelho e não tem tela própria: é um pedaço do Android ou " +
                "da One UI que outros apps usam por baixo. Some da lista de apps, " +
                "mas faz falta.",
        ),
        EM_USO(
            "Em uso pelo sistema agora",
            "Está exercendo uma função escolhida por você. Remover ou desativar " +
                "muda o comportamento do aparelho até você escolher um substituto.",
        ),
        DE_FABRICA(
            "Veio no aparelho",
            "Instalado de fábrica, com tela própria. Não dá para desinstalar, mas " +
                "quase sempre dá para desativar em Configurações.",
        ),
        SEU(
            "Instalado por você",
            "Não faz parte do sistema. Desinstalar é seguro para o aparelho — a " +
                "única perda é o que estiver guardado dentro dele.",
        ),
    }

    data class Perfil(
        val versao: String,
        /** Categoria declarada pelo próprio app no manifesto. Nula quando não declara. */
        val categoria: String?,
        val instaladoPor: String,
        val temTelaPropria: Boolean,
        /** Papéis exercidos agora: teclado, launcher, administrador, acessibilidade. */
        val papeis: List<String>,
        val importancia: Importancia,
        /** Permissões sensíveis efetivamente concedidas, em português. */
        val permissoes: List<String>,
        /** Quantas sensíveis ele pediu e não recebeu. */
        val negadas: Int,
    )

    fun ler(ctx: Context, pacote: String): Perfil? {
        val pm = ctx.packageManager
        val info = try {
            @Suppress("DEPRECATION")
            pm.getPackageInfo(pacote, PackageManager.GET_PERMISSIONS)
        } catch (e: Exception) {
            return null
        }
        val app = info.applicationInfo ?: return null

        val papeis = papeisDe(ctx, pacote)
        val temTela = try {
            pm.getLaunchIntentForPackage(pacote) != null
        } catch (e: Exception) {
            false
        }
        val doSistema = (app.flags and ApplicationInfo.FLAG_SYSTEM) != 0
        val persistente = (app.flags and ApplicationInfo.FLAG_PERSISTENT) != 0

        val (concedidas, negadas) = permissoesDe(info)

        return Perfil(
            versao = info.versionName?.takeIf { it.isNotBlank() } ?: "sem versão declarada",
            categoria = categoriaDe(app),
            instaladoPor = instaladorDe(ctx, pacote, doSistema),
            temTelaPropria = temTela,
            papeis = papeis,
            importancia = when {
                persistente && doSistema -> Importancia.ESSENCIAL
                doSistema && !temTela -> Importancia.COMPONENTE
                papeis.isNotEmpty() -> Importancia.EM_USO
                doSistema -> Importancia.DE_FABRICA
                else -> Importancia.SEU
            },
            permissoes = concedidas,
            negadas = negadas,
        )
    }

    /**
     * A categoria vem do atributo `android:appCategory` do manifesto.
     *
     * É declaração do próprio autor, não classificação da loja nem julgamento
     * nosso — e muita gente não declara nada, daí o nulo. Mesmo assim ajuda:
     * saber que um app de 3 GB se declara "vídeo" já explica o tamanho.
     */
    private fun categoriaDe(app: ApplicationInfo): String? {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return null
        return when (app.category) {
            ApplicationInfo.CATEGORY_GAME -> "Jogo"
            ApplicationInfo.CATEGORY_AUDIO -> "Música e áudio"
            ApplicationInfo.CATEGORY_VIDEO -> "Vídeo"
            ApplicationInfo.CATEGORY_IMAGE -> "Fotos e imagens"
            ApplicationInfo.CATEGORY_SOCIAL -> "Social e mensagens"
            ApplicationInfo.CATEGORY_NEWS -> "Notícias e leitura"
            ApplicationInfo.CATEGORY_MAPS -> "Mapas e navegação"
            ApplicationInfo.CATEGORY_PRODUCTIVITY -> "Produtividade"
            else -> null
        }
    }

    /** Quem entregou o APK. Distingue loja de instalação manual. */
    private fun instaladorDe(ctx: Context, pacote: String, doSistema: Boolean): String {
        if (doSistema) return "Veio na imagem do aparelho"
        val pm = ctx.packageManager
        val quem = try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                pm.getInstallSourceInfo(pacote).installingPackageName
            } else {
                @Suppress("DEPRECATION")
                pm.getInstallerPackageName(pacote)
            }
        } catch (e: Exception) {
            null
        }
        return when (quem) {
            "com.android.vending" -> "Play Store"
            "com.sec.android.app.samsungapps" -> "Galaxy Store"
            "com.amazon.venezia" -> "Amazon Appstore"
            null -> "Instalado por arquivo APK"
            else -> "Instalado por $quem"
        }
    }

    /**
     * Os papéis que o app exerce agora.
     *
     * Isto responde "é importante?" melhor que qualquer outro sinal, porque não
     * é sobre o app em si: é sobre o que você escolheu que ele fizesse. Um
     * teclado é trivial até ser o seu único teclado.
     */
    private fun papeisDe(ctx: Context, pacote: String): List<String> {
        val papeis = mutableListOf<String>()

        runCatching {
            val casa = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME)
            @Suppress("DEPRECATION")
            val atual = ctx.packageManager
                .resolveActivity(casa, PackageManager.MATCH_DEFAULT_ONLY)
                ?.activityInfo?.packageName
            if (atual == pacote) papeis += "Tela inicial do aparelho"
        }

        runCatching {
            val imm = ctx.getSystemService(Context.INPUT_METHOD_SERVICE) as? InputMethodManager
            if (imm?.enabledInputMethodList?.any { it.packageName == pacote } == true) {
                papeis += "Teclado ativo"
            }
        }

        runCatching {
            val dpm = ctx.getSystemService(Context.DEVICE_POLICY_SERVICE) as? DevicePolicyManager
            if (dpm?.activeAdmins?.any { it.packageName == pacote } == true) {
                papeis += "Administrador do aparelho"
            }
        }

        runCatching {
            val am = ctx.getSystemService(Context.ACCESSIBILITY_SERVICE) as? AccessibilityManager
            val ligados = am?.getEnabledAccessibilityServiceList(
                android.accessibilityservice.AccessibilityServiceInfo.FEEDBACK_ALL_MASK,
            )
            if (ligados?.any { it.resolveInfo?.serviceInfo?.packageName == pacote } == true) {
                papeis += "Serviço de acessibilidade ligado"
            }
        }

        return papeis
    }

    /**
     * Permissões sensíveis, separadas entre concedidas e recusadas.
     *
     * A distinção é o ponto todo. Toda lista de permissões que se vê por aí
     * mostra o que o app *pediu*, e pedir não custa nada — o que importa é o
     * que ele *tem*. Um app que pediu câmera e levou não é o mesmo que um app
     * que pediu e você negou.
     */
    private fun permissoesDe(info: android.content.pm.PackageInfo): Pair<List<String>, Int> {
        val pedidas = info.requestedPermissions ?: return emptyList<String>() to 0
        val estado = info.requestedPermissionsFlags

        val concedidas = linkedSetOf<String>()
        var negadas = 0

        pedidas.forEachIndexed { posicao, permissao ->
            val rotulo = EM_PORTUGUES[permissao] ?: return@forEachIndexed
            val temAgora = estado != null &&
                posicao < estado.size &&
                (estado[posicao] and android.content.pm.PackageInfo.REQUESTED_PERMISSION_GRANTED) != 0
            if (temAgora) concedidas += rotulo else negadas++
        }
        return concedidas.toList() to negadas
    }

    /**
     * Só as permissões que o usuário reconheceria como invasivas.
     *
     * Listar as 40 que um app grande declara afogaria as cinco que importam.
     * Internet ficou de fora justamente por isso: praticamente todo app tem, e
     * o que todo mundo tem não informa nada.
     */
    private val EM_PORTUGUES = mapOf(
        "android.permission.CAMERA" to "Câmera",
        "android.permission.RECORD_AUDIO" to "Microfone",
        "android.permission.ACCESS_FINE_LOCATION" to "Localização precisa",
        "android.permission.ACCESS_COARSE_LOCATION" to "Localização aproximada",
        "android.permission.ACCESS_BACKGROUND_LOCATION" to "Localização em segundo plano",
        "android.permission.READ_CONTACTS" to "Ler contatos",
        "android.permission.WRITE_CONTACTS" to "Alterar contatos",
        "android.permission.READ_CALENDAR" to "Ler a agenda",
        "android.permission.WRITE_CALENDAR" to "Alterar a agenda",
        "android.permission.READ_SMS" to "Ler SMS",
        "android.permission.SEND_SMS" to "Enviar SMS",
        "android.permission.RECEIVE_SMS" to "Receber SMS",
        "android.permission.READ_CALL_LOG" to "Histórico de chamadas",
        "android.permission.CALL_PHONE" to "Fazer chamadas",
        "android.permission.READ_PHONE_STATE" to "Estado do telefone",
        "android.permission.BODY_SENSORS" to "Sensores do corpo",
        "android.permission.ACTIVITY_RECOGNITION" to "Atividade física",
        "android.permission.READ_EXTERNAL_STORAGE" to "Ler arquivos",
        "android.permission.WRITE_EXTERNAL_STORAGE" to "Gravar arquivos",
        "android.permission.MANAGE_EXTERNAL_STORAGE" to "Todos os arquivos",
        "android.permission.READ_MEDIA_IMAGES" to "Suas fotos",
        "android.permission.READ_MEDIA_VIDEO" to "Seus vídeos",
        "android.permission.READ_MEDIA_AUDIO" to "Seus áudios",
        "android.permission.SYSTEM_ALERT_WINDOW" to "Sobrepor outros apps",
        "android.permission.PACKAGE_USAGE_STATS" to "Ver o uso de outros apps",
        "android.permission.QUERY_ALL_PACKAGES" to "Listar todos os apps",
        "android.permission.REQUEST_INSTALL_PACKAGES" to "Instalar outros apps",
        "android.permission.POST_NOTIFICATIONS" to "Enviar notificações",
    )
}
