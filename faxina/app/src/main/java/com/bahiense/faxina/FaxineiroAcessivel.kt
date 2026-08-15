package com.bahiense.faxina

import android.accessibilityservice.AccessibilityService
import android.content.ComponentName
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.provider.Settings
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * O botão "Limpar" de cada app, por dentro.
 *
 * Limpar o cache de um app específico não tem API para app comum: o botão só
 * existe dentro de Configurações. O que este serviço faz é apertar esse botão
 * pelo usuário — abre a tela, acha "Armazenamento", acha "Limpar cache", toca.
 *
 * Automação de interface é uma ferramenta afiada, então as travas importam mais
 * que o recurso:
 *
 * 1. **Só enxerga Configurações.** O `android:packageNames` do XML limita os
 *    eventos que chegam aqui. Não é promessa nossa: o sistema não entrega as
 *    telas de nenhum outro app a este serviço.
 * 2. **Só age quando pedido.** Fora da janela de 15 s aberta por um toque do
 *    usuário, todo evento é descartado.
 * 3. **Nunca toca em "Limpar dados".** O reconhecimento exige a palavra
 *    "cache" e recusa qualquer texto com "dados"/"data". Perder cache custa
 *    alguns segundos de recarga; perder dados custa conversas e logins.
 */
class FaxineiroAcessivel : AccessibilityService() {

    private val mao = Handler(Looper.getMainLooper())

    override fun onAccessibilityEvent(evento: AccessibilityEvent?) {
        val pedido = Pedido.vigente() ?: return

        val raiz = rootInActiveWindow ?: return
        val pacoteDaTela = raiz.packageName?.toString() ?: return
        if (!ehConfiguracoes(pacoteDaTela)) return

        agir(pedido, raiz)
    }

    override fun onInterrupt() = Unit

    private fun agir(pedido: Pedido.Aberto, raiz: AccessibilityNodeInfo) {
        // O botão de cache primeiro: em algumas ROMs ele já está na tela de
        // informações do app, sem passar por "Armazenamento".
        val botao = procurar(raiz) { ehBotaoLimparCache(it) }
        if (botao != null) {
            val alvo = clicavel(botao)
            if (alvo != null && alvo.performAction(AccessibilityNodeInfo.ACTION_CLICK)) {
                Pedido.concluir("Cache de ${pedido.nome} limpo.")
                voltarParaOFaxina()
            } else {
                // Botão presente mas desabilitado é o caso normal de cache zerado.
                Pedido.concluir("${pedido.nome} já estava sem cache.")
                voltarParaOFaxina()
            }
            return
        }

        // Sem botão à vista: entrar em "Armazenamento". A pausa evita reentrar
        // na mesma linha a cada evento enquanto a tela ainda está trocando.
        if (SystemClock.elapsedRealtime() - pedido.ultimoToque < 1_200) return

        val linha = procurar(raiz) { ehLinhaArmazenamento(it) }
        if (linha != null) {
            clicavel(linha)?.let {
                if (it.performAction(AccessibilityNodeInfo.ACTION_CLICK)) Pedido.registrarToque()
            }
            return
        }

        // Nem botão nem linha: a tela pode ser mais comprida que a janela.
        procurarRolavel(raiz)?.let {
            it.performAction(AccessibilityNodeInfo.ACTION_SCROLL_FORWARD)
            Pedido.registrarToque()
        }
    }

    /** Devolve o usuário de onde ele veio, em vez de largá-lo dentro de Configurações. */
    private fun voltarParaOFaxina() {
        mao.postDelayed({ performGlobalAction(GLOBAL_ACTION_BACK) }, 700)
        mao.postDelayed({ performGlobalAction(GLOBAL_ACTION_BACK) }, 1_300)
    }

    // -- reconhecimento de texto --------------------------------------------

    private fun ehConfiguracoes(pacote: String): Boolean =
        pacote == "com.android.settings" || pacote.endsWith(".settings")

    /**
     * Exige a palavra "cache" e um verbo de remoção, e recusa qualquer menção a
     * dados. "Limpar cache" passa; "Limpar dados" e "Excluir dados do app" não
     * chegam nem perto.
     */
    private fun ehBotaoLimparCache(texto: String): Boolean {
        val t = texto.lowercase().trim()
        if (!t.contains("cache")) return false
        if (t.contains("dados") || t.contains("data")) return false
        return t.startsWith("limpar") || t.startsWith("apagar") ||
            t.startsWith("esvaziar") || t.startsWith("excluir") || t.startsWith("clear")
    }

    /**
     * A linha que leva ao submenu. "Armazenamento e cache" cai aqui e não no
     * reconhecedor de botão, porque não começa com verbo.
     */
    private fun ehLinhaArmazenamento(texto: String): Boolean {
        val t = texto.lowercase().trim()
        return t == "armazenamento" || t.startsWith("armazenamento e cache") ||
            t == "storage" || t.startsWith("storage & cache") || t.startsWith("storage and cache")
    }

    // -- travessia da árvore -------------------------------------------------

    private fun procurar(
        raiz: AccessibilityNodeInfo,
        aceita: (String) -> Boolean,
    ): AccessibilityNodeInfo? {
        val fila = ArrayDeque<AccessibilityNodeInfo>()
        fila.addLast(raiz)
        var visitados = 0

        while (fila.isNotEmpty() && visitados < LIMITE_DE_NOS) {
            val no = fila.removeFirst()
            visitados++

            // Texto e descrição são checados separadamente: juntá-los criaria
            // frases que não existem na tela.
            val texto = no.text?.toString()
            if (texto != null && aceita(texto)) return no
            val descricao = no.contentDescription?.toString()
            if (descricao != null && aceita(descricao)) return no

            for (i in 0 until no.childCount) {
                no.getChild(i)?.let { fila.addLast(it) }
            }
        }
        return null
    }

    private fun procurarRolavel(raiz: AccessibilityNodeInfo): AccessibilityNodeInfo? {
        val fila = ArrayDeque<AccessibilityNodeInfo>()
        fila.addLast(raiz)
        var visitados = 0

        while (fila.isNotEmpty() && visitados < LIMITE_DE_NOS) {
            val no = fila.removeFirst()
            visitados++
            if (no.isScrollable) return no
            for (i in 0 until no.childCount) {
                no.getChild(i)?.let { fila.addLast(it) }
            }
        }
        return null
    }

    /** O texto costuma estar em um rótulo interno; quem recebe o clique é um pai. */
    private fun clicavel(no: AccessibilityNodeInfo): AccessibilityNodeInfo? {
        var atual: AccessibilityNodeInfo? = no
        var saltos = 0
        while (atual != null && saltos < 6) {
            if (atual.isClickable && atual.isEnabled) return atual
            atual = atual.parent
            saltos++
        }
        return null
    }

    /**
     * O pedido em aberto, compartilhado entre a interface e o serviço. Fora de
     * uma janela armada por toque do usuário, `vigente()` devolve null e o
     * serviço não faz absolutamente nada.
     */
    object Pedido {
        private const val JANELA_MS = 15_000L

        data class Aberto(
            val pacote: String,
            val nome: String,
            val ultimoToque: Long,
        )

        @Volatile
        private var aberto: Aberto? = null

        @Volatile
        private var abertoEm: Long = 0L

        @Volatile
        var ultimoResultado: String? = null
            private set

        fun armar(pacote: String, nome: String) {
            aberto = Aberto(pacote, nome, 0L)
            abertoEm = SystemClock.elapsedRealtime()
            ultimoResultado = null
        }

        fun vigente(): Aberto? {
            val atual = aberto ?: return null
            if (SystemClock.elapsedRealtime() - abertoEm > JANELA_MS) {
                aberto = null
                return null
            }
            return atual
        }

        fun registrarToque() {
            aberto = aberto?.copy(ultimoToque = SystemClock.elapsedRealtime())
        }

        fun concluir(recado: String) {
            aberto = null
            ultimoResultado = recado
        }

        fun colherResultado(): String? {
            val r = ultimoResultado
            ultimoResultado = null
            return r
        }

        /**
         * Esta build declara o serviço?
         *
         * A classe existe nas duas versões — o que muda é o manifesto. Sem a
         * declaração o sistema nunca vincula nada, então a tela precisa dizer
         * isso em vez de oferecer um botão que não leva a lugar nenhum.
         */
        fun disponivel(ctx: Context): Boolean = try {
            ctx.packageManager.getServiceInfo(
                ComponentName(ctx, FaxineiroAcessivel::class.java),
                0,
            )
            true
        } catch (e: android.content.pm.PackageManager.NameNotFoundException) {
            false
        }

        /** Ligado nas Configurações de acessibilidade? */
        fun ativo(ctx: Context): Boolean {
            if (!disponivel(ctx)) return false
            val ligados = Settings.Secure.getString(
                ctx.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES,
            ) ?: return false

            val alvo = ComponentName(ctx, FaxineiroAcessivel::class.java)
            return ligados.split(':').any {
                it.equals(alvo.flattenToString(), ignoreCase = true) ||
                    it.equals(alvo.flattenToShortString(), ignoreCase = true)
            }
        }

        fun telaDeAcessibilidade(): android.content.Intent =
            android.content.Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
    }

    private companion object {
        /** Teto de segurança: árvore de Configurações não passa disso. */
        const val LIMITE_DE_NOS = 1_500
    }
}
