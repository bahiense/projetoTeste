package com.bahiense.rede

import android.content.Context

/**
 * A lista de domínios a barrar.
 *
 * O arquivo `assets/lista.dat` traz um domínio por linha, em ASCII minúsculo.
 * Carregamos os bytes inteiros uma única vez e guardamos só o deslocamento do
 * começo de cada linha (um IntArray), em vez de milhões de objetos String —
 * assim a lista de ~950 mil domínios cabe em uns 22 MB e a consulta é uma
 * busca binária.
 *
 * Os deslocamentos são ordenados aqui dentro, comparando os bytes das linhas,
 * então não dependemos da ordem em que o arquivo foi gravado.
 */
class Blocklist private constructor(
    private val data: ByteArray,
    private val starts: IntArray
) {

    /** Compara a linha que começa em `off` com o domínio `q`. <0, 0 ou >0. */
    private fun compareLine(off: Int, q: ByteArray): Int {
        var i = off
        var j = 0
        while (true) {
            val lineEnd = i >= data.size || data[i] == '\n'.code.toByte() || data[i] == '\r'.code.toByte()
            val qEnd = j >= q.size
            if (lineEnd && qEnd) return 0
            if (lineEnd) return -1   // a linha acabou antes: é "menor"
            if (qEnd) return 1
            val a = data[i].toInt() and 0xFF
            val b = q[j].toInt() and 0xFF
            if (a != b) return a - b
            i++; j++
        }
    }

    private fun contains(q: ByteArray): Boolean {
        var lo = 0
        var hi = starts.size - 1
        while (lo <= hi) {
            val mid = (lo + hi) ushr 1
            val c = compareLine(starts[mid], q)
            when {
                c < 0 -> lo = mid + 1
                c > 0 -> hi = mid - 1
                else -> return true
            }
        }
        return false
    }

    /**
     * Um host é barrado se ele — ou qualquer domínio-pai dele — estiver na
     * lista. Assim, listar `exemplo.com` já barra `cdn.exemplo.com`.
     */
    fun isBlocked(host: String): Boolean {
        if (host.isEmpty()) return false
        var nome = host.lowercase()
        if (nome.endsWith(".")) nome = nome.dropLast(1)
        var atual = nome
        while (true) {
            if (contains(atual.toByteArray(Charsets.US_ASCII))) return true
            val ponto = atual.indexOf('.')
            if (ponto < 0) return false
            atual = atual.substring(ponto + 1)
            if (atual.indexOf('.') < 0) {
                // sobrou só o TLD (ex.: "com"): não faz sentido consultar
                return false
            }
        }
    }

    val tamanho: Int get() = starts.size

    companion object {
        @Volatile
        private var instancia: Blocklist? = null

        /** Carrega uma vez e reaproveita. Pode demorar ~1–2 s; chame fora da UI. */
        fun carregar(ctx: Context): Blocklist {
            instancia?.let { return it }
            synchronized(this) {
                instancia?.let { return it }
                val bytes = ctx.assets.open("lista.dat").use { it.readBytes() }

                // deslocamento do início de cada linha não vazia
                val offsets = ArrayList<Int>(1_000_000)
                var i = 0
                val n = bytes.size
                var inicioLinha = true
                while (i < n) {
                    val b = bytes[i]
                    if (b == '\n'.code.toByte() || b == '\r'.code.toByte()) {
                        inicioLinha = true
                    } else {
                        if (inicioLinha) offsets.add(i)
                        inicioLinha = false
                    }
                    i++
                }

                // ordena os deslocamentos pela ordem dos bytes das linhas, para
                // a busca binária valer independentemente de como o arquivo veio
                val boxed = offsets.toTypedArray()
                val tmp = Blocklist(bytes, IntArray(0))
                boxed.sortWith(Comparator { x, y -> tmp.compareOffsets(x, y) })
                val starts = IntArray(boxed.size) { boxed[it] }

                val bl = Blocklist(bytes, starts)
                instancia = bl
                return bl
            }
        }
    }

    /** Compara duas linhas pelos bytes (usado só para ordenar os deslocamentos). */
    private fun compareOffsets(x: Int, y: Int): Int {
        var i = x
        var j = y
        while (true) {
            val aEnd = i >= data.size || data[i] == '\n'.code.toByte() || data[i] == '\r'.code.toByte()
            val bEnd = j >= data.size || data[j] == '\n'.code.toByte() || data[j] == '\r'.code.toByte()
            if (aEnd && bEnd) return 0
            if (aEnd) return -1
            if (bEnd) return 1
            val a = data[i].toInt() and 0xFF
            val b = data[j].toInt() and 0xFF
            if (a != b) return a - b
            i++; j++
        }
    }
}
