package com.bahiense.faxina

import java.io.File

/**
 * O conteúdo de uma pasta, para abrir a partir da lista de maiores.
 *
 * Separado do [Escaner] de propósito. A varredura geral procura problemas —
 * duplicados, lixo, coisa antiga — e por isso classifica, compara hashes e
 * decide o que vem marcado. Aqui a pergunta é outra e muito mais simples:
 * *o que exatamente tem dentro desta pasta?* Nada vem marcado, nada é julgado.
 * Quem olha e decide é o usuário, arquivo por arquivo.
 */
object Pastas {

    /**
     * Teto de arquivos carregados.
     *
     * Uma pasta de miniaturas passa fácil dos 30 mil, e montar tudo isso em
     * memória para uma grade que o dedo nunca vai rolar até o fim é desperdício
     * puro. Os maiores são os que interessam, e são os que ficam.
     */
    const val LIMITE = 3_000

    data class Conteudo(
        /** Caminho relativo à raiz, o mesmo que veio da lista de pastas. */
        val relativo: String,
        val itens: List<Achado>,
        /** Quantidade e peso reais, contados mesmo além do teto. */
        val arquivos: Int,
        val bytes: Long,
    ) {
        val truncado: Boolean get() = arquivos > itens.size
    }

    /** Lê a pasta inteira, entrando nas subpastas. */
    fun ler(raiz: File, relativo: String): Conteudo {
        val base = File(raiz, relativo)
        val achados = ArrayList<Achado>()
        var arquivos = 0
        var bytes = 0L

        val porVisitar = ArrayDeque<File>()
        porVisitar.add(base)

        while (porVisitar.isNotEmpty()) {
            val dir = porVisitar.removeFirst()
            val filhos = try {
                dir.listFiles()
            } catch (e: SecurityException) {
                null
            } ?: continue

            for (arquivo in filhos) {
                if (arquivo.isDirectory) {
                    porVisitar.add(arquivo)
                    continue
                }
                val tamanho = arquivo.length()
                arquivos++
                bytes += tamanho
                achados += Achado(
                    caminho = arquivo.absolutePath,
                    nome = arquivo.name,
                    tamanho = tamanho,
                    modificadoEm = arquivo.lastModified(),
                    categoria = Categoria.GRANDES,
                    motivo = pastaDe(arquivo, base, relativo),
                )
            }
        }

        // Ordena tudo e só então corta: o teto tem de guardar os maiores, e não
        // os primeiros que o sistema de arquivos entregou.
        achados.sortByDescending { it.tamanho }
        return Conteudo(
            relativo = relativo,
            itens = if (achados.size > LIMITE) achados.subList(0, LIMITE).toList() else achados,
            arquivos = arquivos,
            bytes = bytes,
        )
    }

    /** Em qual subpasta o arquivo está, para a linha dizer algo além do nome. */
    private fun pastaDe(arquivo: File, base: File, relativo: String): String {
        val dentro = arquivo.parentFile?.absolutePath.orEmpty()
        val raizDaPasta = base.absolutePath
        return if (dentro.length > raizDaPasta.length && dentro.startsWith(raizDaPasta)) {
            relativo + dentro.substring(raizDaPasta.length)
        } else {
            relativo
        }
    }
}
