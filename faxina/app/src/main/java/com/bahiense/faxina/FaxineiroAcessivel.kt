package com.bahiense.faxina

import android.accessibilityservice.AccessibilityService
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.provider.Settings
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * O botão "Limpar" de cada app, por dentro — e a fila que percorre vários.
 *
 * Limpar o cache de um app específico não tem API para app comum: o botão só
 * existe dentro de Configurações. O que este serviço faz é apertar esse botão
 * pelo usuário — abre a tela, acha "Armazenamento", acha "Limpar cache", toca,
 * e segue para o próximo app da fila sem devolver o volante no meio do caminho.
 *
 * Automação de interface é uma ferramenta afiada, então as travas importam mais
 * que o recurso:
 *
 * 1. **Só enxerga Configurações.** O `android:packageNames` do XML limita os
 *    eventos que chegam aqui. Não é promessa nossa: o sistema não entrega as
 *    telas de nenhum outro app a este serviço.
 * 2. **Só age quando pedido.** Sem uma fila armada por um toque do usuário,
 *    todo evento é descartado sem sequer olhar a tela.
 * 3. **Nunca toca em "Limpar dados".** O reconhecimento exige a palavra
 *    "cache" e recusa qualquer texto com "dados"/"data". Perder cache custa
 *    alguns segundos de recarga; perder dados custa conversas e logins.
 * 4. **Solta o aparelho se o usuário sair.** Antes de abrir o próximo app a
 *    fila confere se a tela ainda é de Configurações. Se o usuário foi embora,
 *    a fila termina ali — automação que reabre Configurações por cima de quem
 *    saiu não é ajuda, é sequestro.
 */
class FaxineiroAcessivel : AccessibilityService() {

    private val mao = Handler(Looper.getMainLooper())

    /** Pacote cujo cronômetro está armado, para não rearmar a cada evento. */
    private var cronometrado: String? = null

    private val desistirDoAtual = Runnable {
        // Este app não entregou o botão a tempo: tela diferente do previsto,
        // texto em outro idioma, ROM que esconde a opção. Segue o baile.
        Pedido.registrarPulo()
        seguir()
    }

    override fun onAccessibilityEvent(evento: AccessibilityEvent?) {
        val alvo = Pedido.vigente() ?: return

        val raiz = rootInActiveWindow ?: return
        val pacoteDaTela = raiz.packageName?.toString() ?: return
        if (!ehConfiguracoes(pacoteDaTela)) return

        armarCronometro(alvo)
        agir(alvo, raiz)
    }

    override fun onInterrupt() = Unit

    override fun onDestroy() {
        mao.removeCallbacksAndMessages(null)
        super.onDestroy()
    }

    private fun armarCronometro(alvo: Pedido.Alvo) {
        if (cronometrado == alvo.pacote) return
        cronometrado = alvo.pacote
        mao.removeCallbacks(desistirDoAtual)
        mao.postDelayed(desistirDoAtual, LIMITE_POR_APP_MS)
    }

    private fun agir(alvo: Pedido.Alvo, raiz: AccessibilityNodeInfo) {
        // O botão de cache primeiro: em algumas ROMs ele já está na tela de
        // informações do app, sem passar por "Armazenamento".
        val botao = procurar(raiz) { ehBotaoLimparCache(it) }
        if (botao != null) {
            val clicavel = clicavel(botao)
            if (clicavel != null && clicavel.performAction(AccessibilityNodeInfo.ACTION_CLICK)) {
                Pedido.registrarLimpeza()
            } else {
                // Botão presente mas desabilitado é o caso normal de cache zerado.
                Pedido.registrarPulo()
            }
            mao.removeCallbacks(desistirDoAtual)
            // A pausa deixa o clique surtir efeito antes de trocar de tela.
            mao.postDelayed({ seguir() }, 900)
            return
        }

        // Sem botão à vista: entrar em "Armazenamento". A pausa evita reentrar
        // na mesma linha a cada evento enquanto a tela ainda está trocando.
        if (SystemClock.elapsedRealtime() - Pedido.ultimoToque() < 1_200) return

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

    /** Fecha o app atual e abre o próximo da fila, ou encerra. */
    private fun seguir() {
        cronometrado = null
        mao.removeCallbacks(desistirDoAtual)

        // Com o packageNames do XML restringindo o serviço a Configurações,
        // uma raiz nula significa que a tela ativa é de outro app — ou seja, o
        // usuário saiu. A fila para aqui em vez de puxá-lo de volta.
        if (rootInActiveWindow == null) {
            encerrar(interrompida = true)
            return
        }

        val proximo = Pedido.proximo()
        if (proximo == null) {
            encerrar(interrompida = false)
            return
        }
        abrirConfiguracoesDe(proximo.pacote)
    }

    private fun encerrar(interrompida: Boolean) {
        Pedido.concluirFila(interrompida)
        voltarParaOFaxina()
    }

    private fun abrirConfiguracoesDe(pacote: String) {
        val tentativas = listOf(
            Permissoes.telaDeArmazenamentoDoApp(pacote),
            Permissoes.telaDoApp(pacote),
        )
        for (intent in tentativas) {
            try {
                startActivity(Intent(intent).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
                return
            } catch (e: Exception) {
                // tenta a próxima forma de chegar na tela
            }
        }
        // Nenhuma abriu: não dá para limpar este, siga.
        Pedido.registrarPulo()
        mao.postDelayed({ seguir() }, 300)
    }

    /** Devolve o usuário ao Faxina em vez de largá-lo dentro de Configurações. */
    private fun voltarParaOFaxina() {
        val volta = packageManager.getLaunchIntentForPackage(packageName)
        if (volta != null) {
            volta.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            mao.postDelayed({
                try {
                    startActivity(volta)
                } catch (e: Exception) {
                    performGlobalAction(GLOBAL_ACTION_BACK)
                }
            }, 600)
        } else {
            mao.postDelayed({ performGlobalAction(GLOBAL_ACTION_BACK) }, 600)
        }
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
     * A fila em aberto, compartilhada entre a interface e o serviço. Sem uma
     * fila armada por toque do usuário, `vigente()` devolve null e o serviço
     * não faz absolutamente nada.
     */
    object Pedido {

        data class Alvo(val pacote: String, val nome: String)

        @Volatile
        private var restantes: List<Alvo> = emptyList()

        @Volatile
        private var atual: Alvo? = null

        @Volatile
        private var ultimoToque: Long = 0L

        @Volatile
        private var limpos: Int = 0

        @Volatile
        private var pulados: Int = 0

        @Volatile
        var ultimoResultado: String? = null
            private set

        /** Há uma fila rodando? A tela usa para mostrar o andamento. */
        val emAndamento: Boolean get() = atual != null

        val restantesNaFila: Int get() = restantes.size

        fun armar(alvos: List<Alvo>) {
            atual = alvos.firstOrNull()
            restantes = alvos.drop(1)
            ultimoToque = 0L
            limpos = 0
            pulados = 0
            ultimoResultado = null
        }

        fun vigente(): Alvo? = atual

        fun ultimoToque(): Long = ultimoToque

        fun registrarToque() {
            ultimoToque = SystemClock.elapsedRealtime()
        }

        fun registrarLimpeza() {
            limpos++
        }

        fun registrarPulo() {
            pulados++
        }

        /** Avança para o próximo app; null quando a fila acabou. */
        fun proximo(): Alvo? {
            val seguinte = restantes.firstOrNull()
            restantes = restantes.drop(1)
            atual = seguinte
            ultimoToque = 0L
            return seguinte
        }

        fun concluirFila(interrompida: Boolean) {
            atual = null
            restantes = emptyList()
            ultimoResultado = when {
                limpos == 0 && pulados == 0 -> null
                interrompida -> "Interrompido: $limpos app(s) limpo(s) antes de você sair."
                pulados == 0 -> "$limpos app(s) com o cache limpo."
                else -> "$limpos app(s) limpo(s). $pulados sem botão de cache à vista."
            }
        }

        fun cancelar() {
            atual = null
            restantes = emptyList()
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

        fun telaDeAcessibilidade(): Intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
    }

    private companion object {
        /** Teto de segurança: árvore de Configurações não passa disso. */
        const val LIMITE_DE_NOS = 1_500

        /**
         * Quanto esperar por um app antes de pular. Generoso porque a tela de
         * armazenamento calcula tamanhos antes de habilitar o botão.
         */
        const val LIMITE_POR_APP_MS = 9_000L
    }
}
