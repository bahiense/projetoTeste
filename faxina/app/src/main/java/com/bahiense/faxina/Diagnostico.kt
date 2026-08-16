package com.bahiense.faxina

import android.accessibilityservice.AccessibilityServiceInfo
import android.app.ActivityManager
import android.app.admin.DevicePolicyManager
import android.content.Context
import android.content.pm.ApplicationInfo
import android.view.accessibility.AccessibilityManager
import java.util.concurrent.TimeUnit

enum class Gravidade { OK, ATENCAO }

/** Para onde o botão de uma verificação leva. A tela é quem sabe navegar. */
enum class AcaoSugerida { NENHUMA, VER_ARQUIVOS, VER_APPS, VER_CACHE, VER_LIXEIRA, ACESSIBILIDADE }

data class Verificacao(
    val titulo: String,
    val detalhe: String,
    val gravidade: Gravidade,
    val acao: AcaoSugerida = AcaoSugerida.NENHUMA,
    val rotuloDaAcao: String = "",
)

/**
 * A lista de conferências do aparelho, no espírito da "Assistência do aparelho"
 * da Samsung — mas só com o que dá para medir de verdade.
 *
 * O Device Care é um app de sistema e enxerga coisas que nenhum aplicativo
 * comum alcança: consumo de bateria por app, encerramentos de outros processos,
 * memória de terceiros. Aqui a régua é outra — cada item desta lista sai de uma
 * API pública, e o que não sai não vira linha verde decorativa. Uma verificação
 * que sempre diz "tudo bem" porque não mede nada é pior que verificação nenhuma.
 */
object Diagnostico {

    private const val DIAS_PARA_PARADO = 60L
    private const val TAMANHO_QUE_INCOMODA = 100L * 1024 * 1024
    private const val CACHE_QUE_INCOMODA = 1024L * 1024 * 1024

    fun verificar(
        ctx: Context,
        uso: UsoDoAparelho,
        apps: List<AppInstalado>,
        bytesNaLixeira: Long,
    ): List<Verificacao> = buildList {
        add(armazenamento(uso))
        add(memoria(ctx))
        if (apps.isNotEmpty()) {
            add(cacheAcumulado(apps))
            add(appsParados(apps))
        }
        add(lixeira(bytesNaLixeira))
        add(acessibilidade(ctx))
        add(administradores(ctx))
    }

    private fun armazenamento(uso: UsoDoAparelho): Verificacao {
        val apertado = uso.total > 0 && uso.fracaoUsada >= 0.90f
        return Verificacao(
            titulo = "Armazenamento",
            detalhe = if (uso.total <= 0) {
                "Não foi possível medir agora."
            } else if (apertado) {
                "${formatarBytes(uso.livre)} livres — abaixo de 10%. É quando o " +
                    "aparelho começa a engasgar de verdade."
            } else {
                "${formatarBytes(uso.livre)} livres de ${formatarBytes(uso.total)}."
            },
            gravidade = if (apertado) Gravidade.ATENCAO else Gravidade.OK,
            acao = if (apertado) AcaoSugerida.VER_ARQUIVOS else AcaoSugerida.NENHUMA,
            rotuloDaAcao = "Ver o que dá para tirar",
        )
    }

    /**
     * Memória do aparelho inteiro, não por app.
     *
     * `getMemoryInfo` é pública e conta o total do sistema. Já a memória de cada
     * processo alheio some desde o Android 5 — `getRunningAppProcesses` passou a
     * responder apenas sobre quem pergunta. Por isso a linha fala do aparelho e
     * não aponta culpados: apontar exigiria um dado que não existe.
     */
    private fun memoria(ctx: Context): Verificacao {
        val am = ctx.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
        val info = ActivityManager.MemoryInfo()
        return try {
            am?.getMemoryInfo(info)
            Verificacao(
                titulo = "Memória",
                detalhe = if (info.totalMem <= 0) {
                    "Não foi possível medir agora."
                } else if (info.lowMemory) {
                    "O sistema está em memória baixa: ${formatarBytes(info.availMem)} " +
                        "disponíveis de ${formatarBytes(info.totalMem)}."
                } else {
                    "${formatarBytes(info.availMem)} disponíveis de " +
                        "${formatarBytes(info.totalMem)}. É o total do aparelho — o " +
                        "consumo de cada app o Android não conta a ninguém."
                },
                gravidade = if (info.lowMemory) Gravidade.ATENCAO else Gravidade.OK,
            )
        } catch (e: Exception) {
            Verificacao("Memória", "Não foi possível medir agora.", Gravidade.OK)
        }
    }

    private fun cacheAcumulado(apps: List<AppInstalado>): Verificacao {
        val total = apps.sumOf { it.cache }
        val muito = total >= CACHE_QUE_INCOMODA
        return Verificacao(
            titulo = "Cache dos aplicativos",
            detalhe = if (muito) {
                "${formatarBytes(total)} acumulados. Some sozinho quando o disco " +
                    "aperta, mas dá para adiantar."
            } else {
                "${formatarBytes(total)} acumulados — dentro do normal."
            },
            gravidade = if (muito) Gravidade.ATENCAO else Gravidade.OK,
            acao = if (muito) AcaoSugerida.VER_CACHE else AcaoSugerida.NENHUMA,
            rotuloDaAcao = "Limpar cache",
        )
    }

    private fun appsParados(apps: List<AppInstalado>): Verificacao {
        val corte = System.currentTimeMillis() - TimeUnit.DAYS.toMillis(DIAS_PARA_PARADO)
        val parados = apps.filter {
            !it.doSistema && it.ultimoUso < corte && it.total >= TAMANHO_QUE_INCOMODA
        }
        val bytes = parados.sumOf { it.total }
        return Verificacao(
            titulo = "Aplicativos parados",
            detalhe = if (parados.isEmpty()) {
                "Nenhum app grande sem uso há $DIAS_PARA_PARADO dias."
            } else {
                "${parados.size} app(s) ocupando ${formatarBytes(bytes)} sem serem " +
                    "abertos há mais de $DIAS_PARA_PARADO dias."
            },
            gravidade = if (parados.isEmpty()) Gravidade.OK else Gravidade.ATENCAO,
            acao = if (parados.isEmpty()) AcaoSugerida.NENHUMA else AcaoSugerida.VER_APPS,
            rotuloDaAcao = "Ver a lista",
        )
    }

    private fun lixeira(bytes: Long): Verificacao = Verificacao(
        titulo = "Lixeira do Faxina",
        detalhe = if (bytes <= 0) {
            "Vazia."
        } else {
            "${formatarBytes(bytes)} esperando. Enquanto estiverem aqui, o espaço " +
                "continua ocupado."
        },
        gravidade = if (bytes <= 0) Gravidade.OK else Gravidade.ATENCAO,
        acao = if (bytes <= 0) AcaoSugerida.NENHUMA else AcaoSugerida.VER_LIXEIRA,
        rotuloDaAcao = "Abrir a lixeira",
    )

    /**
     * Quem pode ler a sua tela.
     *
     * Esta é a verificação de segurança que um app comum realmente consegue
     * fazer, e vale mais que um "nenhum malware detectado": um serviço de
     * acessibilidade ativo lê tudo que aparece e pode tocar por você. É o vetor
     * dos golpes bancários, e a lista é pública.
     */
    private fun acessibilidade(ctx: Context): Verificacao = try {
        val am = ctx.getSystemService(Context.ACCESSIBILITY_SERVICE) as? AccessibilityManager
        val ativos = am
            ?.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK)
            .orEmpty()
            .filter { it.resolveInfo?.serviceInfo?.packageName != ctx.packageName }

        val nomes = ativos.mapNotNull {
            it.resolveInfo?.loadLabel(ctx.packageManager)?.toString()
        }.distinct()

        Verificacao(
            titulo = "Acesso à sua tela",
            detalhe = if (nomes.isEmpty()) {
                "Nenhum outro app com acessibilidade ligada."
            } else {
                "${nomes.size} app(s) podem ler a tela e tocar por você: " +
                    "${nomes.joinToString(", ")}. Se você não reconhece algum, " +
                    "desligue — é o caminho preferido dos golpes bancários."
            },
            gravidade = if (nomes.isEmpty()) Gravidade.OK else Gravidade.ATENCAO,
            acao = if (nomes.isEmpty()) AcaoSugerida.NENHUMA else AcaoSugerida.ACESSIBILIDADE,
            rotuloDaAcao = "Rever permissões",
        )
    } catch (e: Exception) {
        Verificacao("Acesso à sua tela", "Não foi possível verificar agora.", Gravidade.OK)
    }

    /** Apps com poder de administrador — apagar o aparelho, travar a tela, etc. */
    private fun administradores(ctx: Context): Verificacao = try {
        val dpm = ctx.getSystemService(Context.DEVICE_POLICY_SERVICE) as? DevicePolicyManager
        val pm = ctx.packageManager
        val deTerceiros = dpm?.activeAdmins.orEmpty().filter { admin ->
            val info = runCatching { pm.getApplicationInfo(admin.packageName, 0) }.getOrNull()
            info != null && (info.flags and ApplicationInfo.FLAG_SYSTEM) == 0
        }
        val nomes = deTerceiros.mapNotNull { admin ->
            runCatching {
                pm.getApplicationLabel(pm.getApplicationInfo(admin.packageName, 0)).toString()
            }.getOrNull()
        }.distinct()

        Verificacao(
            titulo = "Administradores do aparelho",
            detalhe = if (nomes.isEmpty()) {
                "Nenhum app de fora do sistema com poder de administrador."
            } else {
                "${nomes.joinToString(", ")} — pode bloquear ou apagar o aparelho."
            },
            gravidade = if (nomes.isEmpty()) Gravidade.OK else Gravidade.ATENCAO,
        )
    } catch (e: Exception) {
        Verificacao("Administradores do aparelho", "Não foi possível verificar agora.", Gravidade.OK)
    }
}
