package com.bahiense.faxina

import java.io.File
import java.io.IOException
import java.io.RandomAccessFile
import java.security.MessageDigest
import java.util.concurrent.TimeUnit

/**
 * Varre o armazenamento e separa o que vale a pena olhar.
 *
 * A varredura é feita em uma passada só sobre o disco: ler metadata de arquivo
 * é barato, ler conteúdo não é. Por isso as regras de lixo, idade e tamanho são
 * decididas na hora, e o conteúdo só é lido depois, para os poucos candidatos a
 * duplicado que sobreviveram ao filtro por tamanho.
 */
class Escaner(
    private val raiz: File,
    private val limiarGrande: Long = 100L * 1024 * 1024,
    private val limiarDuplicado: Long = 256L * 1024,
    private val diasParaAntigo: Long = 180,
) {

    /** Um arquivo candidato a duplicado, guardado até a fase de hash. */
    private class Candidato(val arquivo: File, val tamanho: Long, val modificadoEm: Long)

    fun varrer(aoProgredir: (Progresso) -> Unit): Resultado {
        val comeco = System.currentTimeMillis()
        val achados = mutableListOf<Achado>()
        val midias = mutableListOf<Achado>()
        val bytesPorPasta = HashMap<String, Long>()
        val itensPorPasta = HashMap<String, Int>()
        val avisos = mutableListOf<String>()
        val candidatos = mutableListOf<Candidato>()

        var arquivosLidos = 0
        var bytesLidos = 0L
        var pastasNegadas = 0

        val corteAntigo = comeco - TimeUnit.DAYS.toMillis(diasParaAntigo)
        val raizNormalizada = raiz.absolutePath.removeSuffix("/")

        // Pilha explícita em vez de recursão: hierarquias de mídia chegam fácil a
        // dezenas de níveis e uma pilha própria não corre risco de estourar.
        val pilha = ArrayDeque<File>()
        pilha.addLast(raiz)

        while (pilha.isNotEmpty()) {
            val pasta = pilha.removeLast()
            val relPasta = caminhoCurto(pasta.absolutePath, raizNormalizada)

            if (deveIgnorar(relPasta)) continue

            val filhos = pasta.listFiles()
            if (filhos == null) {
                // Acontece o tempo todo em Android/data e Android/obb: o sistema
                // simplesmente não deixa ler, mesmo com acesso a todos os arquivos.
                pastasNegadas++
                continue
            }

            if (filhos.isEmpty() && pasta != raiz) {
                achados += Achado(
                    caminho = pasta.absolutePath,
                    nome = pasta.name,
                    tamanho = 0L,
                    modificadoEm = pasta.lastModified(),
                    categoria = Categoria.VAZIAS,
                    motivo = "Pasta sem nenhum arquivo dentro",
                    ehPasta = true,
                    preSelecionado = true,
                )
                continue
            }

            for (filho in filhos) {
                if (filho.isDirectory) {
                    pilha.addLast(filho)
                    continue
                }

                val tamanho = filho.length()
                val modificadoEm = filho.lastModified()
                val rel = caminhoCurto(filho.absolutePath, raizNormalizada)

                arquivosLidos++
                bytesLidos += tamanho
                somarNasPastas(bytesPorPasta, itensPorPasta, rel, tamanho)

                if (arquivosLidos % 500 == 0) {
                    aoProgredir(
                        Progresso(
                            etapa = "Lendo o armazenamento",
                            arquivos = arquivosLidos,
                            pastaAtual = relPasta,
                        ),
                    )
                }

                // A vista por origem é independente da vista por problema: uma
                // foto da câmera não tem "problema" nenhum e ainda assim precisa
                // aparecer, porque é onde o espaço costuma estar.
                if (midias.size < LIMITE_DE_MIDIAS &&
                    Miniaturas.tipoDe(filho.name) != TipoDeArquivo.OUTRO
                ) {
                    val origem = origemDe(filho.name, rel)
                    midias += Achado(
                        caminho = filho.absolutePath,
                        nome = filho.name,
                        tamanho = tamanho,
                        modificadoEm = modificadoEm,
                        categoria = Categoria.GRANDES,
                        motivo = "${formatarBytes(tamanho)} · ${formatarIdade(modificadoEm, comeco)}",
                        origem = origem,
                        // Só cópia comprovada vem marcada. Foto de câmera, jamais.
                        preSelecionado = origem.descartavel,
                    )
                }

                val motivoLixo = motivoDeLixo(filho.name, rel, tamanho)
                if (motivoLixo != null) {
                    achados += Achado(
                        caminho = filho.absolutePath,
                        nome = filho.name,
                        tamanho = tamanho,
                        modificadoEm = modificadoEm,
                        categoria = Categoria.LIXO,
                        motivo = motivoLixo,
                        preSelecionado = true,
                    )
                    // Lixo não precisa entrar nas outras listas: já está marcado
                    // para sair e apareceria duas vezes na mesma tela.
                    continue
                }

                if (tamanho >= limiarGrande) {
                    achados += Achado(
                        caminho = filho.absolutePath,
                        nome = filho.name,
                        tamanho = tamanho,
                        modificadoEm = modificadoEm,
                        categoria = Categoria.GRANDES,
                        motivo = "${formatarBytes(tamanho)} · modificado ${formatarIdade(modificadoEm, comeco)}",
                        preSelecionado = false,
                    )
                }

                if (ehBaixadoAntigo(rel, modificadoEm, corteAntigo)) {
                    achados += Achado(
                        caminho = filho.absolutePath,
                        nome = filho.name,
                        tamanho = tamanho,
                        modificadoEm = modificadoEm,
                        categoria = Categoria.ANTIGOS,
                        motivo = "Baixado e não modificado ${formatarIdade(modificadoEm, comeco)}",
                        preSelecionado = false,
                    )
                }

                if (tamanho >= limiarDuplicado) {
                    candidatos += Candidato(filho, tamanho, modificadoEm)
                }
            }
        }

        achados += procurarDuplicados(candidatos, aoProgredir)

        if (pastasNegadas > 0) {
            avisos += "$pastasNegadas pasta(s) não puderam ser lidas. O Android bloqueia " +
                "Android/data e Android/obb para todo app que não seja do sistema — o cache " +
                "que está lá dentro só sai pela tela do próprio aplicativo."
        }

        if (midias.size >= LIMITE_DE_MIDIAS) {
            avisos += "A lista por origem parou em $LIMITE_DE_MIDIAS mídias — há mais " +
                "arquivos no aparelho do que cabe mostrar de uma vez."
        }

        return Resultado(
            achados = achados.sortedByDescending { it.tamanho },
            midias = midias.sortedByDescending { it.tamanho },
            pastas = maioresPastas(bytesPorPasta, itensPorPasta),
            arquivosLidos = arquivosLidos,
            bytesLidos = bytesLidos,
            duracaoMs = System.currentTimeMillis() - comeco,
            avisos = avisos,
        )
    }

    // -- pastas que pesam ----------------------------------------------------

    /**
     * Soma o arquivo em cada pasta acima dele, até três níveis.
     *
     * Três é onde a informação ainda é útil: "WhatsApp/Media/WhatsApp Video"
     * diz algo; o quarto nível já é detalhe que ninguém procura numa lista de
     * maiores pastas.
     */
    private fun somarNasPastas(
        bytes: HashMap<String, Long>,
        itens: HashMap<String, Int>,
        rel: String,
        tamanho: Long,
    ) {
        val partes = rel.split('/')
        if (partes.size < 2) return

        val prefixo = StringBuilder()
        val niveis = minOf(partes.size - 1, 3)
        for (i in 0 until niveis) {
            if (i > 0) prefixo.append('/')
            prefixo.append(partes[i])
            val chave = prefixo.toString()
            bytes[chave] = (bytes[chave] ?: 0L) + tamanho
            itens[chave] = (itens[chave] ?: 0) + 1
        }
    }

    /**
     * As maiores, sem repetir a mesma informação duas vezes.
     *
     * Como cada arquivo soma na pasta e em todas as mães, "WhatsApp" e
     * "WhatsApp/Media" apareceriam quase idênticas. Quando uma pasta filha
     * responde por 90% ou mais da mãe, ela toma o lugar da mãe: a linha mais
     * específica explica o mesmo espaço e diz mais.
     */
    private fun maioresPastas(
        bytes: HashMap<String, Long>,
        itens: HashMap<String, Int>,
    ): List<PastaGrande> {
        val escolhidas = mutableListOf<PastaGrande>()

        for ((caminho, total) in bytes.entries.sortedByDescending { it.value }) {
            if (total < LIMIAR_DE_PASTA) break
            val pasta = PastaGrande(caminho, total, itens[caminho] ?: 0)

            val mae = escolhidas.indexOfFirst {
                caminho.startsWith(it.caminho + "/") && total >= it.bytes * 0.9
            }
            if (mae >= 0) escolhidas[mae] = pasta else escolhidas.add(pasta)

            if (escolhidas.size >= 12) break
        }
        return escolhidas
    }

    // -- origem da mídia -----------------------------------------------------

    /**
     * De onde este arquivo veio, decidido por caminho e nome.
     *
     * A ordem das perguntas é o que faz a classificação funcionar: "enviado"
     * antes de "recebido", porque a pasta Sent fica dentro da pasta de mídia do
     * WhatsApp; e "captura" antes de "câmera", porque em vários aparelhos as
     * capturas moram dentro de DCIM.
     *
     * Nada aqui abre o arquivo. Ler EXIF de cada foto para confirmar a marca do
     * aparelho daria uma certeza a mais e custaria uma varredura muitas vezes
     * mais lenta — caminho e nome já acertam a enorme maioria.
     */
    private fun origemDe(nome: String, rel: String): Origem {
        val caminho = "/" + rel.lowercase()
        val arquivo = nome.lowercase()

        // O sufixo -WA#### é a assinatura do WhatsApp e sobrevive a cópias para
        // fora das pastas dele.
        val pareceWhatsApp = REGEX_WHATSAPP.containsMatchIn(arquivo)

        return when {
            caminho.contains("/sent/") && (caminho.contains("/whatsapp") || pareceWhatsApp) ->
                Origem.ENVIADO

            caminho.contains("screenshot") || caminho.contains("captura") ||
                caminho.contains("screen recording") || caminho.contains("screenrecord") ||
                arquivo.startsWith("screenshot") || arquivo.startsWith("screen_recording") ->
                Origem.CAPTURAS

            caminho.contains("/whatsapp") || caminho.contains("/telegram") ||
                caminho.startsWith("/bluetooth/") || pareceWhatsApp ->
                Origem.RECEBIDO

            caminho.startsWith("/dcim/camera/") || caminho.startsWith("/dcim/100andro") ||
                caminho.contains("/recordings/") || caminho.contains("/sounds/") ||
                caminho.contains("/voice recorder/") || caminho.contains("/gravador") ->
                Origem.CAMERA

            caminho.startsWith("/download/") || caminho.startsWith("/downloads/") ->
                Origem.BAIXADO

            PASTAS_DE_APPS.any { caminho.contains("/$it/") } ||
                caminho.contains("sticker") ->
                Origem.DE_APPS

            // DCIM que sobrou depois das perguntas acima é câmera na prática:
            // é a pasta que o sistema reserva para a captura do próprio aparelho.
            caminho.startsWith("/dcim/") -> Origem.CAMERA

            REGEX_NOME_DE_CAMERA.containsMatchIn(arquivo) -> Origem.CAMERA

            else -> Origem.OUTRAS
        }
    }

    // -- regras -------------------------------------------------------------

    private fun deveIgnorar(rel: String): Boolean {
        val baixo = rel.lowercase()
        return baixo == "android/data" || baixo.startsWith("android/data/") ||
            baixo == "android/obb" || baixo.startsWith("android/obb/") ||
            // A própria lixeira do app: o que está lá já foi decidido.
            baixo == Lixeira.PASTA.lowercase() || baixo.startsWith(Lixeira.PASTA.lowercase() + "/")
    }

    /**
     * Devolve por que o arquivo é lixo, ou null se não for. O texto vai direto
     * para a tela: o usuário precisa saber por que algo foi marcado sozinho.
     */
    private fun motivoDeLixo(nome: String, rel: String, tamanho: Long): String? {
        val baixo = "/" + rel.lowercase()
        val nomeBaixo = nome.lowercase()

        return when {
            baixo.contains("/.thumbnails/") ->
                "Miniatura — a galeria recria sozinha quando precisar"

            nomeBaixo.startsWith(".trashed-") ->
                "Já está na lixeira do sistema, esperando a exclusão definitiva"

            baixo.startsWith("/android/media/") && baixo.contains("/cache/") ->
                "Cache de aplicativo — recriado no próximo uso"

            baixo.contains("/.statuses/") ->
                "Status do WhatsApp — expira em 24 h de qualquer forma"

            baixo.startsWith("/lost.dir/") ->
                "Fragmento que o sistema recuperou de um desligamento ruim"

            nomeBaixo.endsWith(".crdownload") || nomeBaixo.endsWith(".part") ||
                nomeBaixo.endsWith(".partial") || nomeBaixo.endsWith(".!qb") ->
                "Download interrompido, o arquivo está incompleto"

            nomeBaixo.endsWith(".tmp") || nomeBaixo.endsWith(".temp") ->
                "Arquivo temporário deixado para trás"

            nomeBaixo.endsWith(".log") && tamanho > 1024 * 1024 ->
                "Registro de depuração de ${formatarBytes(tamanho)}"

            nomeBaixo == ".ds_store" || nomeBaixo == "thumbs.db" ->
                "Sobra de quando o arquivo passou por outro sistema"

            else -> null
        }
    }

    private fun ehBaixadoAntigo(rel: String, modificadoEm: Long, corte: Long): Boolean {
        if (modificadoEm <= 0L || modificadoEm >= corte) return false
        val baixo = rel.lowercase()
        return baixo.startsWith("download/") || baixo.startsWith("downloads/")
    }

    // -- duplicados ---------------------------------------------------------

    /**
     * Três peneiras, da mais barata para a mais cara: tamanho (só metadata),
     * assinatura das pontas (128 KB lidos), e enfim o hash completo. Um arquivo
     * de 4 GB só é lido inteiro se existir outro exatamente do mesmo tamanho
     * e com começo e fim idênticos — o que na prática já é uma cópia.
     */
    private fun procurarDuplicados(
        candidatos: List<Candidato>,
        aoProgredir: (Progresso) -> Unit,
    ): List<Achado> {
        val porTamanho = candidatos.groupBy { it.tamanho }.filterValues { it.size > 1 }
        if (porTamanho.isEmpty()) return emptyList()

        aoProgredir(Progresso(etapa = "Comparando arquivos parecidos", arquivos = 0))

        val achados = mutableListOf<Achado>()
        var comparados = 0

        for ((tamanho, mesmoTamanho) in porTamanho) {
            val porAssinatura = mesmoTamanho
                .groupBy { assinaturaDasPontas(it.arquivo, tamanho) }
                .filterKeys { it != null }
                .filterValues { it.size > 1 }

            for ((assinatura, quaseIguais) in porAssinatura) {
                // Se o arquivo cabe todo na amostra das pontas, a assinatura já
                // é o conteúdo inteiro: reler seria trabalho jogado fora.
                val grupos: Map<String, List<Candidato>> =
                    if (tamanho <= AMOSTRA * 2) {
                        mapOf(assinatura!! to quaseIguais)
                    } else {
                        quaseIguais
                            .groupBy { hashCompleto(it.arquivo) }
                            .filterKeys { it != null }
                            .filterValues { it.size > 1 }
                            .mapKeys { it.key!! }
                    }

                for ((hash, iguais) in grupos) {
                    comparados += iguais.size
                    aoProgredir(
                        Progresso(etapa = "Comparando arquivos parecidos", arquivos = comparados),
                    )

                    // Mantém a cópia mais antiga: costuma ser a original, e a
                    // recente é a que veio de um compartilhamento ou download.
                    val ordenados = iguais.sortedBy { it.modificadoEm }
                    ordenados.forEachIndexed { indice, c ->
                        val manter = indice == 0
                        achados += Achado(
                            caminho = c.arquivo.absolutePath,
                            nome = c.arquivo.name,
                            tamanho = c.tamanho,
                            modificadoEm = c.modificadoEm,
                            categoria = Categoria.DUPLICADOS,
                            motivo = if (manter) {
                                "Cópia mais antiga — esta fica"
                            } else {
                                "Idêntica à cópia de ${formatarIdade(ordenados[0].modificadoEm)}"
                            },
                            grupo = hash,
                            preSelecionado = !manter,
                        )
                    }
                }
            }
        }
        return achados
    }

    /** SHA-256 dos primeiros e últimos [AMOSTRA] bytes, mais o tamanho. */
    private fun assinaturaDasPontas(arquivo: File, tamanho: Long): String? = try {
        RandomAccessFile(arquivo, "r").use { raf ->
            val digest = MessageDigest.getInstance("SHA-256")
            val amostra = minOf(AMOSTRA.toLong(), tamanho).toInt()
            val buffer = ByteArray(amostra)

            raf.seek(0)
            raf.readFully(buffer)
            digest.update(buffer)

            if (tamanho > amostra) {
                raf.seek(tamanho - amostra)
                raf.readFully(buffer)
                digest.update(buffer)
            }

            digest.update(tamanho.toString().toByteArray())
            digest.digest().toHex()
        }
    } catch (e: IOException) {
        null
    } catch (e: SecurityException) {
        null
    }

    private fun hashCompleto(arquivo: File): String? = try {
        val digest = MessageDigest.getInstance("SHA-256")
        arquivo.inputStream().use { entrada ->
            val buffer = ByteArray(1 shl 20)
            while (true) {
                val lidos = entrada.read(buffer)
                if (lidos <= 0) break
                digest.update(buffer, 0, lidos)
            }
        }
        digest.digest().toHex()
    } catch (e: IOException) {
        null
    } catch (e: SecurityException) {
        null
    }

    private companion object {
        const val AMOSTRA = 64 * 1024

        /** Teto de mídias guardadas, para a lista não virar um problema de memória. */
        const val LIMITE_DE_MIDIAS = 40_000

        /** Abaixo disso uma pasta não interessa a quem procura espaço. */
        const val LIMIAR_DE_PASTA = 50L * 1024 * 1024

        /** IMG-20240115-WA0001.jpg — o carimbo que o WhatsApp deixa no nome. */
        val REGEX_WHATSAPP = Regex("-wa\\d{4}")

        /** IMG_20240115_193045, VID_2024…, PXL_2024…, DSC01234. */
        val REGEX_NOME_DE_CAMERA =
            Regex("^(img|vid|pano|pxl|mvimg|trim|dsc|dji|burst)[-_]?\\d{4}")

        val PASTAS_DE_APPS = setOf(
            "instagram", "facebook", "messenger", "twitter", "tiktok", "snapchat",
            "threads", "linkedin", "kwai", "shareit", "xender", "pinterest",
            "discord", "reddit", "spotify", "deezer",
        )

        fun ByteArray.toHex(): String = joinToString("") { "%02x".format(it) }
    }
}
