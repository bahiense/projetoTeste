package com.bahiense.faxina

import android.graphics.Bitmap
import android.widget.Toast
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import java.util.concurrent.TimeUnit

// ---------------------------------------------------------------------------
// Início
// ---------------------------------------------------------------------------

@Composable
fun TelaResumo(
    vm: FaxinaViewModel,
    podeLerArquivos: Boolean,
    podeLerApps: Boolean,
    aoVerArquivos: () -> Unit,
    aoVerApps: () -> Unit,
    aoVerDiagnostico: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val ctx = LocalContext.current
    val uso by vm.uso.collectAsStateWithLifecycle()
    val diagnostico by vm.diagnostico.collectAsStateWithLifecycle()
    val varredura by vm.varredura.collectAsStateWithLifecycle()
    val naLixeira by vm.naLixeira.collectAsStateWithLifecycle()
    val limpandoCache by vm.limpandoCache.collectAsStateWithLifecycle()
    val liberadoAoTodo by vm.liberadoAoTodo.collectAsStateWithLifecycle()

    // "Que mais pesam" x "com mais arquivos": duas perguntas diferentes sobre a
    // mesma varredura, e quase nunca a mesma resposta.
    var porQuantidade by remember { mutableStateOf(false) }
    var pastaAberta by remember { mutableStateOf<String?>(null) }

    // Refeito a cada volta à tela: os números que ele lê mudam por fora do app.
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) { vm.diagnosticar() }

    // Mesma escolha da aba Apps: sem biblioteca de navegação, a subtela toma o
    // lugar desta e o voltar é um botão na tela, não o do sistema.
    pastaAberta?.let { caminho ->
        TelaDaPasta(
            vm = vm,
            relativo = caminho,
            aoVoltar = {
                pastaAberta = null
                vm.fecharPasta()
            },
            modifier = modifier,
        )
        return
    }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            CartaoDeArmazenamento(
                uso = uso,
                varredura = varredura,
                limpandoCache = limpandoCache,
                habilitado = podeLerArquivos,
                liberadoAoTodo = liberadoAoTodo,
                aoLimpar = vm::limpezaRapida,
            )
        }

        item {
            val alertas = diagnostico.count { it.gravidade == Gravidade.ATENCAO }
            Card(
                colors = CardDefaults.cardColors(
                    if (alertas > 0) {
                        MaterialTheme.colorScheme.secondaryContainer
                    } else {
                        MaterialTheme.colorScheme.surfaceContainerHigh
                    },
                ),
                shape = RoundedCornerShape(24.dp),
                modifier = Modifier.fillMaxWidth().clickable(onClick = aoVerDiagnostico),
            ) {
                Row(
                    Modifier.padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        if (alertas > 0) "⚠️" else "✅",
                        style = MaterialTheme.typography.headlineSmall,
                    )
                    Spacer(Modifier.width(14.dp))
                    Column(Modifier.weight(1f)) {
                        Text("Diagnóstico", style = MaterialTheme.typography.titleMedium)
                        Text(
                            when {
                                diagnostico.isEmpty() -> "Conferindo o aparelho…"
                                alertas == 0 -> "${diagnostico.size} verificações, nenhum alerta."
                                else -> "$alertas ponto(s) de atenção em ${diagnostico.size}."
                            },
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    Text("›", style = MaterialTheme.typography.headlineSmall)
                }
            }
        }

        if (!podeLerArquivos) {
            item {
                CartaoPermissao(
                    titulo = "Acesso a todos os arquivos",
                    texto = "Sem essa permissão o app enxerga apenas a própria pasta. É ela que " +
                        "permite varrer o armazenamento inteiro em busca de lixo e duplicados.",
                    rotulo = "Abrir a configuração",
                    aoClicar = {
                        abrirConfiguracoes(
                            ctx,
                            Permissoes.telaDeAcessoAArquivos(ctx),
                            Permissoes.telaDeAcessoAArquivosGeral(),
                        )
                    },
                )
            }
        }

        if (!podeLerApps) {
            item {
                CartaoPermissao(
                    titulo = "Acesso de uso",
                    texto = "Necessária para medir quanto cada aplicativo instalado ocupa. " +
                        "No seu caso é a informação que mais importa: a maior parte do " +
                        "armazenamento está em apps, não em fotos e vídeos.",
                    rotulo = "Abrir a configuração",
                    aoClicar = {
                        abrirConfiguracoes(ctx, Permissoes.telaDeAcessoDeUso())
                    },
                )
            }
        }

        (varredura as? EstadoVarredura.Pronto)?.resultado?.let { r ->
            val sugestoes = sugestoesDe(r)
            if (sugestoes.isNotEmpty()) {
                item {
                    Text(
                        "Sugestões de limpeza",
                        style = MaterialTheme.typography.titleLarge,
                        modifier = Modifier.padding(top = 4.dp, bottom = 2.dp),
                    )
                }
                items(sugestoes.chunked(2)) { par ->
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        par.forEach { s ->
                            CartaoDeSugestao(s, Modifier.weight(1f), aoVerArquivos)
                        }
                        if (par.size == 1) Spacer(Modifier.weight(1f))
                    }
                }
            }
        }

        (varredura as? EstadoVarredura.Pronto)?.resultado?.let { r ->
            val lista = if (porQuantidade) r.pastasCheias else r.pastas
            if (r.pastas.isNotEmpty() || r.pastasCheias.isNotEmpty()) {
                item {
                    Text(
                        "As pastas do aparelho",
                        style = MaterialTheme.typography.titleLarge,
                        modifier = Modifier.padding(top = 4.dp, bottom = 2.dp),
                    )
                }
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Etiqueta("Que mais pesam", !porQuantidade) { porQuantidade = false }
                        Etiqueta("Com mais arquivos", porQuantidade) { porQuantidade = true }
                    }
                }
                item {
                    Card(
                        colors = CardDefaults.cardColors(
                            MaterialTheme.colorScheme.surfaceContainerHigh,
                        ),
                        shape = RoundedCornerShape(24.dp),
                    ) {
                        if (lista.isEmpty()) {
                            Text(
                                if (porQuantidade) {
                                    "Nenhuma pasta passou de 200 arquivos. Nada aqui está " +
                                        "cheio o bastante para atrapalhar."
                                } else {
                                    "Nenhuma pasta passou de 50 MB."
                                },
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(18.dp),
                            )
                        } else {
                            Column(
                                Modifier.padding(vertical = 8.dp),
                                verticalArrangement = Arrangement.spacedBy(2.dp),
                            ) {
                                // A barra compara cada pasta com a primeira da
                                // lista, na grandeza que a lista ordena.
                                val maior = if (porQuantidade) {
                                    lista.first().arquivos.coerceAtLeast(1).toFloat()
                                } else {
                                    lista.first().bytes.coerceAtLeast(1L).toFloat()
                                }
                                lista.take(8).forEach { p ->
                                    val quanto = if (porQuantidade) {
                                        p.arquivos.toFloat()
                                    } else {
                                        p.bytes.toFloat()
                                    }
                                    LinhaDePasta(p, quanto / maior, porQuantidade) {
                                        pastaAberta = p.caminho
                                        vm.abrirPasta(p.caminho)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        (varredura as? EstadoVarredura.Falhou)?.let { v ->
            item {
                Card(colors = CardDefaults.cardColors(MaterialTheme.colorScheme.errorContainer)) {
                    Text(
                        "A varredura falhou: ${v.mensagem}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onErrorContainer,
                        modifier = Modifier.padding(16.dp),
                    )
                }
            }
        }

        item {
            Card(colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceContainerHigh)) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("De onde vem o espaço", style = MaterialTheme.typography.titleMedium)

                    val midias = (varredura as? EstadoVarredura.Pronto)?.resultado
                    if (midias == null || midias.midias.isEmpty()) {
                        Text(
                            "Fotos, vídeos e áudio somam pouco em quase todo aparelho cheio. " +
                                "O peso costuma estar nos aplicativos e nos dados que eles " +
                                "guardam — e essa lista a tela da Samsung não mostra.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    } else {
                        Origem.entries.forEach { origem ->
                            val itens = midias.de(origem)
                            if (itens.isNotEmpty()) {
                                LinhaResumo(
                                    rotulo = "${origem.emoji}  ${origem.titulo}",
                                    valor = "${itens.size} · ${formatarBytes(midias.bytesDe(origem))}",
                                )
                            }
                        }
                        Text(
                            "Toque em \"Ver achados\" e escolha \"Por origem\" para mexer " +
                                "nessas listas.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }

                    Button(onClick = aoVerApps, enabled = podeLerApps) {
                        Text("Ver apps por tamanho")
                    }
                }
            }
        }

        if (naLixeira.isNotEmpty()) {
            item {
                Card(colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceContainerHigh)) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("Lixeira com conteúdo", style = MaterialTheme.typography.titleMedium)
                        Text(
                            "${naLixeira.size} item(ns), ${formatarBytes(naLixeira.sumOf { it.tamanho })} " +
                                "ainda ocupando espaço. Nada é liberado de verdade até esvaziar.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
        }
    }
}

/**
 * O anel de armazenamento.
 *
 * Um arco lê melhor que uma barra para "quanto sobrou": o vazio à direita é
 * o espaço livre, e dá para ver de longe se o aparelho está apertado. O número
 * grande fica no meio, onde o olho já vai parar.
 */
@Composable
private fun AnelDeUso(uso: UsoDoAparelho, modifier: Modifier = Modifier) {
    val trilho = MaterialTheme.colorScheme.outline
    val cheio = MaterialTheme.colorScheme.primary
    val alerta = MaterialTheme.colorScheme.error

    // Acima de 90% o aparelho começa a engasgar de verdade; a cor avisa antes
    // de o usuário precisar ler qualquer número.
    val destaque = if (uso.fracaoUsada >= 0.9f) alerta else cheio

    Box(modifier.size(190.dp), contentAlignment = Alignment.Center) {
        Canvas(Modifier.fillMaxSize()) {
            val traco = 18.dp.toPx()
            val canto = Offset(traco / 2f, traco / 2f)
            val medida = Size(size.width - traco, size.height - traco)
            val estilo = Stroke(width = traco, cap = StrokeCap.Round)

            drawArc(
                color = trilho,
                startAngle = 135f,
                sweepAngle = 270f,
                useCenter = false,
                topLeft = canto,
                size = medida,
                style = estilo,
            )
            if (uso.fracaoUsada > 0f) {
                drawArc(
                    color = destaque,
                    startAngle = 135f,
                    sweepAngle = 270f * uso.fracaoUsada,
                    useCenter = false,
                    topLeft = canto,
                    size = medida,
                    style = estilo,
                )
            }
        }

        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                formatarBytes(uso.livre),
                style = MaterialTheme.typography.headlineMedium,
            )
            Text(
                "livres",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(6.dp))
            Text(
                "${(uso.fracaoUsada * 100).toInt()}% de ${formatarBytes(uso.total)}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

/**
 * O cartão-herói da tela inicial.
 *
 * É o "hero moment" do Material 3 Expressive: o anel de espaço, o botão que faz
 * o óbvio e, enquanto a varredura corre, a barra ondulada — o indicador novo do
 * Material 3, que faz uma espera longa parecer viva em vez de travada.
 */
@Composable
private fun CartaoDeArmazenamento(
    uso: UsoDoAparelho,
    varredura: EstadoVarredura,
    limpandoCache: Boolean,
    habilitado: Boolean,
    liberadoAoTodo: Long,
    aoLimpar: () -> Unit,
) {
    val rodando = varredura is EstadoVarredura.Rodando
    val ocupado = limpandoCache || rodando

    Card(
        colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceContainerHigh),
        shape = RoundedCornerShape(32.dp),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(
            Modifier.padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            AnelDeUso(uso)

            if (rodando) {
                val p = (varredura as EstadoVarredura.Rodando).progresso
                Column(
                    Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    LinearProgressIndicator(
                        Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                    )
                    Text(
                        "${p.etapa} · ${p.arquivos} arquivos",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }

            Button(
                onClick = aoLimpar,
                enabled = habilitado && !ocupado,
                shape = RoundedCornerShape(28.dp),
                modifier = Modifier.fillMaxWidth().height(56.dp),
            ) {
                if (limpandoCache) {
                    CircularProgressIndicator(
                        Modifier.size(18.dp),
                        strokeWidth = 2.dp,
                        color = MaterialTheme.colorScheme.onPrimary,
                    )
                    Spacer(Modifier.width(12.dp))
                }
                Text(
                    when {
                        limpandoCache -> "Liberando cache…"
                        rodando -> "Procurando…"
                        varredura is EstadoVarredura.Pronto -> "Verificar de novo"
                        else -> "Limpeza rápida"
                    },
                    style = MaterialTheme.typography.titleMedium,
                )
            }

            Text(
                "Libera o cache que o sistema permitir e procura o que pode sair. " +
                    "Nada é apagado sem você confirmar.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
            )

            // Só aparece depois que houve o que contar, e conta apenas o que
            // virou espaço livre de verdade — cache liberado e lixeira
            // esvaziada. Arquivo mandado para a lixeira não entra: ele ainda
            // está lá.
            if (liberadoAoTodo > 0) {
                Text(
                    "🧹  ${formatarBytes(liberadoAoTodo)} liberados até hoje",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.primary,
                    textAlign = TextAlign.Center,
                )
            }
        }
    }
}

/**
 * Um cartão de sugestão da tela inicial — o atalho para uma pilha de limpeza.
 *
 * [paleta] é um índice, não uma Color: montar a lista de sugestões acontece no
 * corpo do LazyColumn, que não é um escopo @Composable e portanto não pode ler
 * MaterialTheme. A cor é resolvida dentro do cartão, que é @Composable.
 */
private data class Sugestao(
    val titulo: String,
    val emoji: String,
    val quantidade: Int,
    val bytes: Long,
    val paleta: Int,
)

/**
 * As sugestões que a tela inicial destaca, na ordem em que o Files as mostra:
 * lixo, duplicados, capturas e arquivos grandes. Só as gavetas com conteúdo
 * viram cartão — sugerir uma pilha vazia é ruído.
 *
 * Função comum, não @Composable: é chamada de dentro do LazyColumn.
 */
private fun sugestoesDe(r: Resultado): List<Sugestao> = listOf(
    Sugestao("Lixo e cache", "🧽", r.de(Categoria.LIXO).size, r.bytesDe(Categoria.LIXO), 0),
    Sugestao("Duplicados", "👯", r.de(Categoria.DUPLICADOS).size, r.bytesDe(Categoria.DUPLICADOS), 1),
    Sugestao("Capturas de tela", "🖼", r.de(Origem.CAPTURAS).size, r.bytesDe(Origem.CAPTURAS), 2),
    Sugestao("Arquivos grandes", "🐘", r.de(Categoria.GRANDES).size, r.bytesDe(Categoria.GRANDES), 3),
).filter { it.quantidade > 0 }

@Composable
private fun CartaoDeSugestao(s: Sugestao, modifier: Modifier = Modifier, aoAbrir: () -> Unit) {
    val cs = MaterialTheme.colorScheme
    val container = when (s.paleta) {
        0 -> cs.primaryContainer
        1 -> cs.tertiaryContainer
        2 -> cs.secondaryContainer
        else -> cs.surfaceContainerHighest
    }
    val conteudo = when (s.paleta) {
        0 -> cs.onPrimaryContainer
        1 -> cs.onTertiaryContainer
        2 -> cs.onSecondaryContainer
        else -> cs.onSurface
    }

    Card(
        colors = CardDefaults.cardColors(container),
        shape = RoundedCornerShape(24.dp),
        modifier = modifier
            .height(132.dp)
            .clickable(onClick = aoAbrir),
    ) {
        Column(
            Modifier.padding(16.dp).fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween,
        ) {
            Text(s.emoji, style = MaterialTheme.typography.headlineSmall)
            Column {
                Text(
                    s.titulo,
                    style = MaterialTheme.typography.titleSmall,
                    color = conteudo,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(
                    "${s.quantidade} · ${formatarBytes(s.bytes)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = conteudo.copy(alpha = 0.8f),
                )
            }
        }
    }
}

@Composable
private fun CartaoPermissao(
    titulo: String,
    texto: String,
    rotulo: String,
    aoClicar: () -> Unit,
) {
    Card(
        colors = CardDefaults.cardColors(MaterialTheme.colorScheme.primaryContainer),
    ) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                "Falta permissão: $titulo",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onPrimaryContainer,
            )
            Text(
                texto,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onPrimaryContainer,
            )
            Button(onClick = aoClicar) { Text(rotulo) }
        }
    }
}

@Composable
private fun LinhaResumo(rotulo: String, valor: String) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(rotulo, style = MaterialTheme.typography.bodyMedium)
        Text(
            valor,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

/**
 * Uma pasta pesada, com barra proporcional à maior da lista.
 *
 * A barra é relativa e não absoluta de propósito: o que interessa aqui é
 * comparar as pastas entre si. Contra o total do aparelho, todas as barras
 * ficariam curtas e a lista não diria nada.
 */
@Composable
private fun LinhaDePasta(
    pasta: PastaGrande,
    fracao: Float,
    porQuantidade: Boolean = false,
    aoAbrir: () -> Unit,
) {
    val nome = pasta.caminho.substringAfterLast('/')
    val onde = pasta.caminho.substringBeforeLast('/', "")

    Column(
        Modifier
            .fillMaxWidth()
            .clickable(onClick = aoAbrir)
            .padding(horizontal = 18.dp, vertical = 8.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(
                    nome,
                    style = MaterialTheme.typography.bodyLarge,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                if (onde.isNotEmpty()) {
                    Text(
                        onde,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }
            Spacer(Modifier.width(12.dp))
            // O número que ordena a lista fica em cima, grande; o outro embaixo.
            // Ler a lista de cima para baixo tem de bater com a barra ao lado.
            Column(horizontalAlignment = Alignment.End, modifier = Modifier.padding(end = 8.dp)) {
                Text(
                    if (porQuantidade) {
                        "${pasta.arquivos} arq."
                    } else {
                        formatarBytes(pasta.bytes)
                    },
                    style = MaterialTheme.typography.titleSmall,
                )
                Text(
                    if (porQuantidade) {
                        formatarBytes(pasta.bytes)
                    } else {
                        "${pasta.arquivos} arq."
                    },
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Text("›", style = MaterialTheme.typography.titleLarge)
        }
        Spacer(Modifier.height(6.dp))
        // Barra desenhada na mão: duas caixas. O indicador do Material traz
        // gap e ponto de parada por padrão, que numa lista de oito linhas
        // viram só ruído.
        Box(
            Modifier
                .fillMaxWidth()
                .height(6.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.surfaceContainerHighest),
        ) {
            Box(
                Modifier
                    .fillMaxWidth(fracao.coerceIn(0.02f, 1f))
                    .height(6.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primary),
            )
        }
    }
}

/**
 * A barra de baixo das telas de seleção: o que está marcado e o que fazer.
 *
 * Duas saídas, e a ordem visual diz qual é qual. **Enviar cópia** manda os
 * arquivos para outro app — Drive, Fotos, o que estiver instalado — e não tira
 * nada do aparelho; é o contorno, e por isso tem só contorno. **Para a
 * lixeira** é a ação principal, e é a preenchida.
 *
 * As duas são independentes de propósito. Enviar e apagar em um toque só seria
 * mais cômodo e seria errado: a folha de compartilhamento não devolve
 * confirmação de que a cópia chegou, então apagar em seguida seria apagar no
 * escuro. Sobe, confere no destino, volta e apaga.
 */
@Composable
private fun BarraDeAcoes(
    quantidade: Int,
    bytes: Long,
    habilitado: Boolean,
    aoEnviar: () -> Unit,
    aoDescartar: () -> Unit,
) {
    HorizontalDivider(color = MaterialTheme.colorScheme.outline)
    Column(
        Modifier.fillMaxWidth().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("$quantidade selecionado(s)", style = MaterialTheme.typography.bodyMedium)
            Spacer(Modifier.weight(1f))
            Text(formatarBytes(bytes), style = MaterialTheme.typography.titleMedium)
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(
                onClick = aoEnviar,
                enabled = habilitado,
                modifier = Modifier.weight(1f),
            ) { Text("Enviar cópia") }
            Button(
                onClick = aoDescartar,
                enabled = habilitado,
                modifier = Modifier.weight(1f),
            ) { Text("Para a lixeira") }
        }
    }
}

/** Envia, ou explica por que não deu — em vez de um botão que não faz nada. */
private fun enviarOuAvisar(ctx: android.content.Context, caminhos: Set<String>) {
    if (caminhos.size > LIMITE_DE_ENVIO) {
        Toast.makeText(
            ctx,
            "Selecione no máximo $LIMITE_DE_ENVIO por vez: acima disso o Android não " +
                "consegue passar a lista para o outro app de uma vez só.",
            Toast.LENGTH_LONG,
        ).show()
        return
    }
    if (!enviarArquivos(ctx, caminhos)) {
        Toast.makeText(
            ctx,
            "Não deu para enviar. Ou nenhum app instalado aceita esses arquivos, ou " +
                "eles saíram do lugar desde a varredura.",
            Toast.LENGTH_LONG,
        ).show()
    }
}

/**
 * O que existe dentro de uma pasta, em miniaturas grandes.
 *
 * A lista de pastas responde *onde* está o espaço; esta tela responde *o quê*,
 * que é a única pergunta cuja resposta permite apagar com segurança. Por isso
 * a grade e não a lista: quando se decide olhando a imagem, uma miniatura de
 * 48 dp não serve — e aqui decidir olhando é o modo único, porque nada vem
 * classificado nem pré-marcado.
 *
 * A seleção é local, e não a da aba Arquivos. Apagar o que se escolheu aqui
 * não pode levar junto o que ficou marcado lá.
 */
@Composable
private fun TelaDaPasta(
    vm: FaxinaViewModel,
    relativo: String,
    aoVoltar: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val ctx = LocalContext.current
    val conteudo by vm.pasta.collectAsStateWithLifecycle()
    val lendo by vm.lendoPasta.collectAsStateWithLifecycle()
    val ocupado by vm.ocupado.collectAsStateWithLifecycle()

    var marcados by remember(relativo) { mutableStateOf(setOf<String>()) }
    var confirmando by remember(relativo) { mutableStateOf(false) }

    val itens = conteudo?.itens.orEmpty()
    val bytesMarcados = remember(marcados, itens) {
        itens.filter { it.caminho in marcados }.sumOf { it.tamanho }
    }

    Column(modifier.fillMaxSize()) {
        Row(
            Modifier.fillMaxWidth().padding(start = 8.dp, end = 16.dp, top = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            TextButton(onClick = aoVoltar) { Text("‹  Voltar") }
            Spacer(Modifier.weight(1f))
            if (itens.isNotEmpty()) {
                TextButton(onClick = {
                    marcados = if (marcados.size == itens.size) {
                        emptySet()
                    } else {
                        itens.map { it.caminho }.toSet()
                    }
                }) {
                    Text(if (marcados.size == itens.size) "Nenhum" else "Todos")
                }
            }
        }

        Column(Modifier.padding(horizontal = 16.dp)) {
            Text(
                relativo.substringAfterLast('/'),
                style = MaterialTheme.typography.headlineSmall,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                relativo,
                style = MaterialTheme.typography.bodySmall,
                fontFamily = FontFamily.Monospace,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            conteudo?.let { c ->
                Text(
                    "${c.arquivos} arquivo(s) · ${formatarBytes(c.bytes)}" +
                        if (c.truncado) " · mostrando os ${c.itens.size} maiores" else "",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(top = 4.dp),
                )
            }
        }

        if (lendo) {
            Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else if (itens.isEmpty()) {
            Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                Text(
                    "Pasta vazia, ou o sistema não deixou ler o conteúdo dela.",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(32.dp),
                )
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = 108.dp),
                modifier = Modifier.weight(1f),
                contentPadding = androidx.compose.foundation.layout.PaddingValues(
                    start = 16.dp, end = 16.dp, top = 12.dp, bottom = 8.dp,
                ),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                items(itens, key = { it.caminho }) { achado ->
                    LadrilhoDeArquivo(
                        achado = achado,
                        marcado = achado.caminho in marcados,
                        aoAlternar = {
                            marcados = if (achado.caminho in marcados) {
                                marcados - achado.caminho
                            } else {
                                marcados + achado.caminho
                            }
                        },
                    )
                }
            }
        }

        BarraDeAcoes(
            quantidade = marcados.size,
            bytes = bytesMarcados,
            habilitado = marcados.isNotEmpty() && !ocupado,
            aoEnviar = { enviarOuAvisar(ctx, marcados) },
            aoDescartar = { confirmando = true },
        )
    }

    if (confirmando) {
        AlertDialog(
            onDismissRequest = { confirmando = false },
            title = { Text("Mandar ${marcados.size} item(ns) para a lixeira?") },
            text = {
                Text(
                    "Nada aqui foi analisado pelo Faxina: esta pasta é uma listagem " +
                        "crua, e a escolha é inteiramente sua. Os arquivos vão para " +
                        "${Lixeira.PASTA} e dá para trazer de volta enquanto a lixeira " +
                        "não for esvaziada.",
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    confirmando = false
                    vm.enviarParaLixeira(marcados)
                    marcados = emptySet()
                    vm.abrirPasta(relativo)
                }) { Text("Mandar") }
            },
            dismissButton = {
                TextButton(onClick = { confirmando = false }) { Text("Cancelar") }
            },
        )
    }
}

/**
 * A lista de conferências, no espírito da Assistência do aparelho da Samsung.
 *
 * Só entram verificações que medem alguma coisa de verdade, e cada uma que
 * acusa problema traz o botão que leva ao lugar de resolver. Uma checagem que
 * sempre passa porque não mede nada é decoração, e ficou de fora.
 */
@Composable
fun TelaDiagnostico(
    vm: FaxinaViewModel,
    aoVoltar: () -> Unit,
    aoIr: (AcaoSugerida) -> Unit,
    modifier: Modifier = Modifier,
) {
    val ctx = LocalContext.current
    val itens by vm.diagnostico.collectAsStateWithLifecycle()
    val alertas = itens.count { it.gravidade == Gravidade.ATENCAO }

    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) { vm.diagnosticar() }

    Column(modifier.fillMaxSize()) {
        Row(
            Modifier.fillMaxWidth().padding(start = 8.dp, end = 16.dp, top = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            TextButton(onClick = aoVoltar) { Text("‹  Voltar") }
        }

        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            item {
                Card(
                    colors = CardDefaults.cardColors(
                        if (alertas > 0) {
                            MaterialTheme.colorScheme.secondaryContainer
                        } else {
                            MaterialTheme.colorScheme.primaryContainer
                        },
                    ),
                    shape = RoundedCornerShape(28.dp),
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Column(
                        Modifier.fillMaxWidth().padding(28.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        Text(
                            if (alertas > 0) "$alertas a rever" else "Tudo certo",
                            style = MaterialTheme.typography.headlineMedium,
                            color = if (alertas > 0) {
                                MaterialTheme.colorScheme.onSecondaryContainer
                            } else {
                                MaterialTheme.colorScheme.onPrimaryContainer
                            },
                        )
                        Text(
                            "${itens.size} verificações",
                            style = MaterialTheme.typography.bodyMedium,
                            color = if (alertas > 0) {
                                MaterialTheme.colorScheme.onSecondaryContainer
                            } else {
                                MaterialTheme.colorScheme.onPrimaryContainer
                            },
                        )
                    }
                }
            }

            items(itens, key = { it.titulo }) { v ->
                Card(
                    colors = CardDefaults.cardColors(
                        MaterialTheme.colorScheme.surfaceContainerHigh,
                    ),
                ) {
                    Row(Modifier.padding(16.dp)) {
                        Text(
                            if (v.gravidade == Gravidade.OK) "✓" else "!",
                            style = MaterialTheme.typography.titleLarge,
                            color = if (v.gravidade == Gravidade.OK) {
                                MaterialTheme.colorScheme.primary
                            } else {
                                MaterialTheme.colorScheme.error
                            },
                        )
                        Spacer(Modifier.width(14.dp))
                        Column(
                            Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(4.dp),
                        ) {
                            Text(v.titulo, style = MaterialTheme.typography.titleSmall)
                            Text(
                                v.detalhe,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                            if (v.acao != AcaoSugerida.NENHUMA) {
                                TextButton(
                                    onClick = {
                                        if (v.acao == AcaoSugerida.ACESSIBILIDADE) {
                                            abrirConfiguracoes(
                                                ctx,
                                                FaxineiroAcessivel.Pedido.telaDeAcessibilidade(),
                                            )
                                        } else {
                                            aoIr(v.acao)
                                        }
                                    },
                                    contentPadding = androidx.compose.foundation.layout
                                        .PaddingValues(0.dp),
                                ) { Text(v.rotuloDaAcao) }
                            }
                        }
                    }
                }
            }

        }
    }
}

// ---------------------------------------------------------------------------
// Arquivos
// ---------------------------------------------------------------------------

@Composable
fun TelaArquivos(vm: FaxinaViewModel, modifier: Modifier = Modifier) {
    val ctx = LocalContext.current
    val varredura by vm.varredura.collectAsStateWithLifecycle()
    val selecionados by vm.selecionados.collectAsStateWithLifecycle()
    val ocupado by vm.ocupado.collectAsStateWithLifecycle()

    val resultado = (varredura as? EstadoVarredura.Pronto)?.resultado
    if (resultado == null) {
        Box(modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text(
                "Rode a varredura na aba Início para ver o que dá para limpar.",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(32.dp),
            )
        }
        return
    }

    var porOrigem by remember { mutableStateOf(false) }
    var emGrade by remember { mutableStateOf(false) }
    var abertas by remember { mutableStateOf(setOf<String>(Categoria.LIXO.name)) }
    var confirmando by remember { mutableStateOf(false) }
    var busca by remember { mutableStateOf("") }
    var ordem by remember { mutableStateOf(OrdemArquivos.MAIORES) }
    val bytesMarcados = resultado.bytesUnicos(selecionados)

    Column(modifier.fillMaxSize()) {
        // Duas leituras do mesmo resultado. "Por problema" responde o que pode
        // sair; "por origem" responde de onde o espaço veio — e é a que mostra
        // fotos da câmera, que não têm problema nenhum e ocupam quase tudo.
        Row(
            Modifier.padding(start = 16.dp, end = 16.dp, top = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Seletor(
                porOrigem = porOrigem,
                aoTrocar = { porOrigem = it },
                modifier = Modifier.weight(1f),
            )
            Spacer(Modifier.width(8.dp))
            SeletorDeVista(emGrade = emGrade, aoTrocar = { emGrade = it })
        }

        OutlinedTextField(
            value = busca,
            onValueChange = { busca = it },
            placeholder = { Text("Procurar por nome") },
            leadingIcon = { Text("🔎") },
            trailingIcon = {
                if (busca.isNotEmpty()) {
                    TextButton(onClick = { busca = "" }) { Text("Limpar") }
                }
            },
            singleLine = true,
            shape = RoundedCornerShape(22.dp),
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = 16.dp, end = 16.dp, top = 10.dp),
        )

        Row(
            Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(start = 16.dp, end = 16.dp, top = 10.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            OrdemArquivos.entries.forEach { o ->
                Etiqueta(
                    rotulo = o.rotulo,
                    ativa = ordem == o,
                    aoClicar = { ordem = o },
                )
            }
        }

        /*
         * Montado fora do LazyColumn e memorizado de propósito.
         *
         * O corpo do LazyColumn roda a cada recomposição, e agrupar significa
         * varrer as dezenas de milhares de mídias uma vez por grupo. Feito lá
         * dentro, cada toque em uma caixa de seleção custava centenas de
         * milhares de comparações antes de a tela redesenhar.
         */
        val grupos: List<GrupoDeArquivos> = remember(resultado, porOrigem, busca, ordem) {
            val procurado = busca.trim().lowercase()
            fun arrumar(itens: List<Achado>): List<Achado> {
                val filtrados = if (procurado.isEmpty()) {
                    itens
                } else {
                    itens.filter { it.nome.lowercase().contains(procurado) }
                }
                return when (ordem) {
                    OrdemArquivos.MAIORES -> filtrados.sortedByDescending { it.tamanho }
                    OrdemArquivos.RECENTES -> filtrados.sortedByDescending { it.modificadoEm }
                    OrdemArquivos.ANTIGOS -> filtrados.sortedBy { it.modificadoEm }
                    OrdemArquivos.NOME -> filtrados.sortedBy { it.nome.lowercase() }
                }
            }

            if (porOrigem) {
                Origem.entries.map { origem ->
                    GrupoDeArquivos(
                        chave = "origem-${origem.name}",
                        titulo = origem.titulo,
                        emoji = origem.emoji,
                        explicacao = origem.explicacao,
                        itens = arrumar(resultado.de(origem)),
                    )
                }
            } else {
                Categoria.entries.map { categoria ->
                    GrupoDeArquivos(
                        chave = categoria.name,
                        titulo = categoria.titulo,
                        emoji = categoria.emoji,
                        explicacao = categoria.explicacao,
                        itens = arrumar(resultado.de(categoria)),
                        contarComoPastas = categoria == Categoria.VAZIAS,
                    )
                }
            }.filter { it.itens.isNotEmpty() }
        }

        /*
         * Procurar abre os grupos sozinho.
         *
         * Digitar e não ver nada porque tudo continua fechado é a maneira mais
         * rápida de o usuário concluir que a busca não funciona.
         */
        LaunchedEffect(busca, grupos) {
            if (busca.isNotBlank()) abertas = abertas + grupos.map { it.chave }
        }

        val alternarGrupo: (String) -> Unit = { chave ->
            abertas = if (chave in abertas) abertas - chave else abertas + chave
        }

        if (grupos.isEmpty()) {
            Box(
                Modifier.weight(1f).fillMaxWidth(),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    if (busca.isBlank()) {
                        "Nada a mostrar aqui."
                    } else {
                        "Nenhum arquivo com \"${busca.trim()}\" no nome."
                    },
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(32.dp),
                )
            }
        } else if (emGrade) {
            LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = 108.dp),
                modifier = Modifier.weight(1f),
                contentPadding = androidx.compose.foundation.layout.PaddingValues(
                    start = 16.dp, end = 16.dp, top = 12.dp, bottom = 8.dp,
                ),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                grupos.forEach { grupo ->
                    val aberto = grupo.chave in abertas
                    item(
                        key = "cab-${grupo.chave}",
                        // O cabeçalho ocupa a linha toda; só os ladrilhos entram na grade.
                        span = { GridItemSpan(maxLineSpan) },
                    ) {
                        CabecalhoDeGrupo(
                            grupo = grupo,
                            aberto = aberto,
                            marcados = if (aberto) {
                                grupo.itens.count { it.caminho in selecionados }
                            } else {
                                0
                            },
                            aoAbrir = { alternarGrupo(grupo.chave) },
                            aoMarcarTodos = { marcar ->
                                vm.marcar(grupo.itens.map { it.caminho }, marcar)
                            },
                        )
                    }

                    if (aberto) {
                        items(
                            grupo.itens,
                            key = { "${grupo.chave}-${it.caminho}" },
                        ) { achado ->
                            LadrilhoDeArquivo(
                                achado = achado,
                                marcado = achado.caminho in selecionados,
                                aoAlternar = { vm.alternar(achado.caminho) },
                            )
                        }
                    }
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                contentPadding = androidx.compose.foundation.layout.PaddingValues(
                    start = 16.dp, end = 16.dp, top = 12.dp, bottom = 8.dp,
                ),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                grupos.forEach { grupo ->
                    val aberto = grupo.chave in abertas
                    item(key = "cab-${grupo.chave}") {
                        CabecalhoDeGrupo(
                            grupo = grupo,
                            aberto = aberto,
                            marcados = if (aberto) {
                                grupo.itens.count { it.caminho in selecionados }
                            } else {
                                0
                            },
                            aoAbrir = { alternarGrupo(grupo.chave) },
                            aoMarcarTodos = { marcar ->
                                vm.marcar(grupo.itens.map { it.caminho }, marcar)
                            },
                        )
                    }

                    if (aberto) {
                        items(grupo.itens, key = { "${grupo.chave}-${it.caminho}" }) { achado ->
                            LinhaAchado(
                                achado = achado,
                                raiz = vm.raiz.absolutePath,
                                marcado = achado.caminho in selecionados,
                                aoAlternar = { vm.alternar(achado.caminho) },
                            )
                        }
                    }
                }
            }
        }

        BarraDeAcoes(
            quantidade = selecionados.size,
            bytes = bytesMarcados,
            habilitado = selecionados.isNotEmpty() && !ocupado,
            aoEnviar = { enviarOuAvisar(ctx, selecionados) },
            aoDescartar = { confirmando = true },
        )
    }

    if (confirmando) {
        AlertDialog(
            onDismissRequest = { confirmando = false },
            title = { Text("Mandar ${selecionados.size} item(ns) para a lixeira?") },
            text = {
                Text(
                    "Os arquivos saem do lugar de origem e ficam guardados em " +
                        "${Lixeira.PASTA}, de onde dá para trazer de volta. O espaço " +
                        "(${formatarBytes(bytesMarcados)}) só é liberado quando você " +
                        "esvaziar a lixeira.",
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    confirmando = false
                    vm.moverParaLixeira()
                }) { Text("Mandar") }
            },
            dismissButton = {
                TextButton(onClick = { confirmando = false }) { Text("Cancelar") }
            },
        )
    }
}

/** As ordens de exibição da aba Arquivos. Maiores primeiro é o padrão útil. */
private enum class OrdemArquivos(val rotulo: String) {
    MAIORES("Maiores"),
    RECENTES("Mais novos"),
    ANTIGOS("Mais antigos"),
    NOME("Nome"),
}

/** Um bloco da lista, venha ele de uma categoria de problema ou de uma origem. */
private data class GrupoDeArquivos(
    val chave: String,
    val titulo: String,
    val emoji: String,
    val explicacao: String,
    val itens: List<Achado>,
    val contarComoPastas: Boolean = false,
)

@Composable
private fun Seletor(
    porOrigem: Boolean,
    aoTrocar: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(22.dp))
            .background(MaterialTheme.colorScheme.surfaceContainerHigh)
            .padding(4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        AbaDoSeletor("Por problema", !porOrigem, Modifier.weight(1f)) { aoTrocar(false) }
        AbaDoSeletor("Por origem", porOrigem, Modifier.weight(1f)) { aoTrocar(true) }
    }
}

@Composable
private fun AbaDoSeletor(
    rotulo: String,
    ativa: Boolean,
    modifier: Modifier = Modifier,
    aoClicar: () -> Unit,
) {
    Box(
        modifier
            .clip(RoundedCornerShape(18.dp))
            .background(
                if (ativa) MaterialTheme.colorScheme.primary else Color.Transparent,
            )
            .clickable(onClick = aoClicar)
            .padding(vertical = 10.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            rotulo,
            style = MaterialTheme.typography.labelLarge,
            color = if (ativa) {
                MaterialTheme.colorScheme.onPrimary
            } else {
                MaterialTheme.colorScheme.onSurfaceVariant
            },
        )
    }
}

/**
 * Alterna entre lista e grade.
 *
 * A lista responde "o que é este arquivo" com nome, caminho e motivo; a grade
 * responde "qual destas imagens eu quero fora" com a imagem em tamanho de
 * reconhecer. Para varrer centenas de fotos, a segunda pergunta é a única que
 * importa — e a lista, com miniatura de 48 dp, é péssima nela.
 */
@Composable
private fun SeletorDeVista(emGrade: Boolean, aoTrocar: (Boolean) -> Unit) {
    Row(
        Modifier
            .clip(RoundedCornerShape(22.dp))
            .background(MaterialTheme.colorScheme.surfaceContainerHigh)
            .padding(4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        IconeDeVista("☰", !emGrade) { aoTrocar(false) }
        IconeDeVista("▦", emGrade) { aoTrocar(true) }
    }
}

@Composable
private fun IconeDeVista(simbolo: String, ativo: Boolean, aoClicar: () -> Unit) {
    Box(
        Modifier
            .size(40.dp)
            .clip(RoundedCornerShape(18.dp))
            .background(if (ativo) MaterialTheme.colorScheme.primary else Color.Transparent)
            .clickable(onClick = aoClicar),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            simbolo,
            style = MaterialTheme.typography.titleMedium,
            color = if (ativo) {
                MaterialTheme.colorScheme.onPrimary
            } else {
                MaterialTheme.colorScheme.onSurfaceVariant
            },
        )
    }
}

/**
 * O arquivo como ladrilho da grade.
 *
 * Toque marca e desmarca — em uma grade, escolher é a ação constante e merece o
 * gesto mais barato. Toque longo abre o arquivo, que é a ação de conferência,
 * feita uma vez a cada tanto.
 */
@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun LadrilhoDeArquivo(
    achado: Achado,
    marcado: Boolean,
    aoAlternar: () -> Unit,
) {
    val ctx = LocalContext.current

    val tipo = remember(achado.nome) { Miniaturas.tipoDe(achado.nome) }
    val extensao = remember(achado.nome) {
        achado.nome.substringAfterLast('.', "").uppercase().take(4)
    }

    /*
     * Cor por tipo, não só a sigla.
     *
     * Numa grade de trinta ladrilhos, ler "MP4" em cada um é trabalho; enxergar
     * que três deles são lilases não é. E vídeo é justamente o tipo que costuma
     * carregar o peso, então achá-lo de relance é metade da tarefa.
     */
    val corDoTipo = when (tipo) {
        TipoDeArquivo.IMAGEM -> Color(0xFF9CF2E9)
        TipoDeArquivo.VIDEO -> Color(0xFFC9B6FF)
        TipoDeArquivo.AUDIO -> Color(0xFFFFD08A)
        TipoDeArquivo.OUTRO -> Color(0xFFDDDDDD)
    }

    Box(
        Modifier
            .aspectRatio(1f)
            .clip(RoundedCornerShape(12.dp))
            .combinedClickable(
                onClick = aoAlternar,
                onLongClick = {
                    if (!achado.ehPasta && !abrirArquivo(ctx, achado.caminho)) {
                        Toast.makeText(
                            ctx,
                            "Nenhum app instalado abre esse arquivo",
                            Toast.LENGTH_SHORT,
                        ).show()
                    }
                },
            ),
    ) {
        Miniatura(
            caminho = achado.caminho,
            ehPasta = achado.ehPasta,
            // Decodificar acima do tamanho da célula deixa a imagem nítida sem
            // carregar o arquivo inteiro na memória.
            lado = 140.dp,
            modifier = Modifier.fillMaxSize(),
        )

        // A cortina é o que faz o marcado ser lido de relance, sem procurar a
        // caixinha em cada ladrilho.
        if (marcado) {
            Box(
                Modifier
                    .matchParentSize()
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.4f)),
            )
        }

        // A sigla do tipo, no canto oposto ao da marcação para nunca disputarem
        // o mesmo espaço.
        Text(
            extensao.ifEmpty { tipo.emoji },
            style = MaterialTheme.typography.labelSmall,
            color = corDoTipo,
            maxLines = 1,
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(4.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(Color.Black.copy(alpha = 0.55f))
                .padding(horizontal = 5.dp, vertical = 2.dp),
        )

        Box(
            Modifier
                .align(Alignment.TopEnd)
                .padding(6.dp)
                .size(24.dp)
                .clip(CircleShape)
                .background(
                    if (marcado) {
                        MaterialTheme.colorScheme.primary
                    } else {
                        Color.Black.copy(alpha = 0.45f)
                    },
                ),
            contentAlignment = Alignment.Center,
        ) {
            if (marcado) {
                Text(
                    "✓",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onPrimary,
                )
            }
        }

        Text(
            formatarBytes(achado.tamanho),
            style = MaterialTheme.typography.labelSmall,
            color = Color.White,
            maxLines = 1,
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(4.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(Color.Black.copy(alpha = 0.55f))
                .padding(horizontal = 5.dp, vertical = 2.dp),
        )
    }
}

@Composable
private fun CabecalhoDeGrupo(
    grupo: GrupoDeArquivos,
    aberto: Boolean,
    marcados: Int,
    aoAbrir: () -> Unit,
    aoMarcarTodos: (Boolean) -> Unit,
) {
    val quantidade = grupo.itens.size
    val bytes = grupo.itens.sumOf { it.tamanho }

    Card(
        colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceContainerHigh),
        modifier = Modifier
            .fillMaxWidth()
            .animateContentSize(animationSpec = spring(stiffness = Spring.StiffnessMediumLow))
            .clickable(onClick = aoAbrir),
    ) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    "${grupo.emoji}  ${grupo.titulo}",
                    style = MaterialTheme.typography.titleMedium,
                )
                Spacer(Modifier.weight(1f))
                Text(
                    if (grupo.contarComoPastas) {
                        "$quantidade pastas"
                    } else {
                        "$quantidade · ${formatarBytes(bytes)}"
                    },
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(Modifier.width(8.dp))
                Text(if (aberto) "▾" else "▸")
            }
            Text(
                grupo.explicacao,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            if (aberto) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    TextButton(onClick = { aoMarcarTodos(true) }) { Text("Marcar todos") }
                    TextButton(onClick = { aoMarcarTodos(false) }) { Text("Desmarcar") }
                    Spacer(Modifier.weight(1f))
                    Text(
                        "$marcados de $quantidade",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
    }
}

/**
 * Miniatura do arquivo — foto, primeiro quadro do vídeo ou capa do MP3.
 *
 * O nome do arquivo raramente diz o que ele é, e "IMG_20231104_193045.jpg" é
 * uma péssima base para decidir se algo pode sumir. Enquanto a imagem não
 * chega (ou quando o arquivo não tem imagem nenhuma), fica o emoji do tipo.
 */
@Composable
private fun Miniatura(
    caminho: String,
    ehPasta: Boolean,
    lado: Dp,
    modifier: Modifier = Modifier,
) {
    val tipo = remember(caminho, ehPasta) {
        if (ehPasta) TipoDeArquivo.OUTRO else Miniaturas.tipoDe(caminho.substringAfterLast('/'))
    }
    val ladoPx = with(LocalDensity.current) { lado.roundToPx() }

    // produceState cancela o carregamento sozinho quando a linha sai da tela,
    // que é o que segura a rolagem de uma lista com milhares de itens.
    val bitmap by produceState<Bitmap?>(null, caminho, ladoPx) {
        value = if (tipo == TipoDeArquivo.OUTRO) null else Miniaturas.carregar(caminho, ladoPx)
    }

    // O tamanho vem de fora: na lista é um quadrado fixo, na grade é a célula
    // inteira. Só a resolução de decodificação continua sendo decidida aqui.
    Box(
        modifier.background(MaterialTheme.colorScheme.outline),
        contentAlignment = Alignment.Center,
    ) {
        val imagem = bitmap
        if (imagem != null) {
            Image(
                bitmap = imagem.asImageBitmap(),
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize(),
            )
        } else {
            Text(if (ehPasta) "📂" else tipo.emoji)
        }
    }
}

@Composable
private fun LinhaAchado(
    achado: Achado,
    raiz: String,
    marcado: Boolean,
    aoAlternar: () -> Unit,
) {
    val ctx = LocalContext.current
    Row(
        Modifier
            .fillMaxWidth()
            .clickable(onClick = aoAlternar)
            .padding(vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Checkbox(checked = marcado, onCheckedChange = { aoAlternar() })

        // Tocar a miniatura abre o arquivo de verdade; tocar o resto da linha
        // marca. Conferir antes de apagar não deveria custar uma navegação.
        Miniatura(
            caminho = achado.caminho,
            ehPasta = achado.ehPasta,
            lado = 48.dp,
            modifier = Modifier
                .size(48.dp)
                .clip(RoundedCornerShape(6.dp))
                .clickable {
                    if (!achado.ehPasta && !abrirArquivo(ctx, achado.caminho)) {
                        Toast.makeText(
                            ctx,
                            "Nenhum app instalado abre esse arquivo",
                            Toast.LENGTH_SHORT,
                        ).show()
                    }
                },
        )

        Spacer(Modifier.width(10.dp))
        Column(Modifier.weight(1f)) {
            Text(
                achado.nome,
                style = MaterialTheme.typography.bodyMedium,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                caminhoCurto(achado.caminho, raiz),
                style = MaterialTheme.typography.bodySmall,
                fontFamily = FontFamily.Monospace,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                achado.motivo,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.primary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
        }
        Spacer(Modifier.width(8.dp))
        Text(
            if (achado.ehPasta) "—" else formatarBytes(achado.tamanho),
            style = MaterialTheme.typography.bodyMedium,
        )
    }
}

// ---------------------------------------------------------------------------
// Apps
// ---------------------------------------------------------------------------

/** Três meses sem abrir. Cobre uso sazonal — viagem, imposto, banco de vez em quando. */
private const val DIAS_DE_ESQUECIMENTO = 90L

/** Abaixo disso, desinstalar não muda nada de útil e a lista vira ruído. */
private const val BYTES_DE_ESQUECIMENTO = 20L * 1024 * 1024

@Composable
fun TelaApps(vm: FaxinaViewModel, podeLerApps: Boolean, modifier: Modifier = Modifier) {
    val ctx = LocalContext.current
    val apps by vm.apps.collectAsStateWithLifecycle()
    val carregando by vm.carregandoApps.collectAsStateWithLifecycle()
    var ordem by remember { mutableStateOf(OrdemDeApps.ESPACO) }
    var mostrar by remember { mutableStateOf(MostrarApps.DO_USUARIO) }
    var soParados by remember { mutableStateOf(false) }
    var aberto by remember { mutableStateOf<AppInstalado?>(null) }

    LaunchedEffect(podeLerApps) {
        if (podeLerApps && apps.isEmpty()) vm.carregarApps()
    }

    // Sem biblioteca de navegação: a lista some enquanto o detalhe está aberto,
    // e o botão físico de voltar continua fechando o app inteiro — que é o
    // comportamento esperado de uma aba, não de uma pilha de telas.
    aberto?.let { alvo ->
        TelaDoApp(
            vm = vm,
            app = alvo,
            aoVoltar = {
                aberto = null
                vm.esquecerRetrato()
            },
            modifier = modifier,
        )
        return
    }

    if (!podeLerApps) {
        Box(modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(
                Modifier.padding(32.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(
                    "Ligue \"Acesso de uso\" para o Faxina medir quanto cada app ocupa.",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Button(onClick = { abrirConfiguracoes(ctx, Permissoes.telaDeAcessoDeUso()) }) {
                    Text("Abrir a configuração")
                }
            }
        }
        return
    }

    /*
     * A lista de esquecidos, com dois cortes.
     *
     * O de tempo (90 dias) e o de tamanho (20 MB) existem pelo mesmo motivo:
     * uma lista de vinte apizinhos de 4 MB parados desde sempre é ruído que
     * ensina a ignorar o cartão. O que interessa é o app grande e parado.
     */
    val esquecidos = remember(apps) {
        val corte = System.currentTimeMillis() - TimeUnit.DAYS.toMillis(DIAS_DE_ESQUECIMENTO)
        apps
            .filter { !it.doSistema && it.ultimoUso < corte && it.total >= BYTES_DE_ESQUECIMENTO }
            .sortedByDescending { it.total }
    }

    // Ordenar e filtrar toda a lista custa caro para refazer a cada recomposição,
    // e as três escolhas mudam pouco.
    val visiveis = remember(apps, ordem, mostrar, soParados, esquecidos) {
        if (soParados) {
            ordenarApps(esquecidos, ordem)
        } else {
            ordenarApps(
                apps.filter { app ->
                    when (mostrar) {
                        MostrarApps.DO_USUARIO -> !app.doSistema
                        MostrarApps.DO_SISTEMA -> app.doSistema
                        MostrarApps.TODOS -> true
                    }
                },
                ordem,
            )
        }
    }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        item {
            Card(colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceContainerHigh)) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        "${formatarBytes(visiveis.sumOf { it.total })} em ${visiveis.size} apps",
                        style = MaterialTheme.typography.titleMedium,
                    )
                    Text(
                        "Cache somado: ${formatarBytes(visiveis.sumOf { it.cache })} — a aba " +
                            "Cache limpa isso. Aqui o alvo é o resto: o APK e os dados, que " +
                            "só saem desinstalando ou limpando pela tela do próprio app. " +
                            "Tocar em um item abre exatamente essa tela.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    OutlinedButton(onClick = vm::carregarApps) { Text("Recarregar") }
                }
            }
        }

        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    "Ordenar por",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Row(
                    Modifier.horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    OrdemDeApps.entries.forEach { alvo ->
                        Etiqueta(alvo.rotulo, ordem == alvo) { ordem = alvo }
                    }
                }

                Text(
                    "Mostrar",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 4.dp),
                )
                Row(
                    Modifier.horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    MostrarApps.entries.forEach { alvo ->
                        Etiqueta(alvo.rotulo, mostrar == alvo) { mostrar = alvo }
                    }
                    Etiqueta("Esquecidos", soParados) { soParados = !soParados }
                }
            }
        }

        if (esquecidos.isNotEmpty()) {
            item {
                CartaoDeEsquecidos(
                    esquecidos = esquecidos,
                    filtroLigado = soParados,
                    aoFiltrar = {
                        soParados = !soParados
                        if (soParados) ordem = OrdemDeApps.ESPACO
                    },
                )
            }
        }

        if (carregando) {
            item {
                Row(
                    Modifier.fillMaxWidth().padding(24.dp),
                    horizontalArrangement = Arrangement.Center,
                ) {
                    CircularProgressIndicator()
                }
            }
        }

        items(visiveis, key = { it.pacote }) { app ->
            LinhaApp(app) { aberto = app }
        }
    }
}

/**
 * O detalhe de um aplicativo.
 *
 * A tela existe para separar duas coisas que a lista misturava: os três totais
 * que o sistema informa (e cuja composição ninguém consegue ver) e os arquivos
 * que o app deixou no armazenamento compartilhado, esses sim listáveis por tipo
 * e apagáveis um grupo de cada vez.
 */
@Composable
private fun TelaDoApp(
    vm: FaxinaViewModel,
    app: AppInstalado,
    aoVoltar: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val ctx = LocalContext.current
    val retrato by vm.retrato.collectAsStateWithLifecycle()
    val vasculhando by vm.vasculhando.collectAsStateWithLifecycle()
    val ocupado by vm.ocupado.collectAsStateWithLifecycle()

    var marcados by remember(app.pacote) { mutableStateOf(setOf<GrupoDeConteudo>()) }
    var confirmando by remember(app.pacote) { mutableStateOf(false) }

    LaunchedEffect(app.pacote) { vm.vasculharApp(app.pacote) }

    val fatias = retrato?.fatias.orEmpty()
    val escolhidas = fatias.filter { it.grupo in marcados }
    val bytesMarcados = escolhidas.sumOf { it.bytes }

    Column(modifier.fillMaxSize()) {
        Row(
            Modifier.fillMaxWidth().padding(start = 8.dp, end = 16.dp, top = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            TextButton(onClick = aoVoltar) { Text("‹  Voltar") }
            Spacer(Modifier.weight(1f))
        }

        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item {
                Column {
                    Text(app.nome, style = MaterialTheme.typography.headlineSmall)
                    Text(
                        app.pacote,
                        style = MaterialTheme.typography.bodySmall,
                        fontFamily = FontFamily.Monospace,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }

            item {
                Card(colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceContainerHigh)) {
                    Column(
                        Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        Text("O que o sistema informa", style = MaterialTheme.typography.titleMedium)
                        LinhaResumo("Aplicativo", formatarBytes(app.apk))
                        LinhaResumo("Dados", formatarBytes(app.dadosSemCache))
                        LinhaResumo("Cache", formatarBytes(app.cache))
                        HorizontalDivider(color = MaterialTheme.colorScheme.outline)
                        LinhaResumo("Total", formatarBytes(app.total))
                        Text(
                            "Estes três números são tudo o que o Android conta sobre a área " +
                                "privada do app. O que existe lá dentro — fotos, bancos de " +
                                "dados, mensagens — nenhum aplicativo consegue enxergar, e " +
                                "inventar essa divisão seria chute.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedButton(onClick = {
                                abrirPrimeiroQuePuder(
                                    ctx,
                                    Permissoes.telasDeArmazenamentoDoApp(app.pacote),
                                )
                            }) { Text("Configurações") }

                            // Só para o que você instalou: app de fábrica não
                            // desinstala, e oferecer o botão seria mentir.
                            if (!app.doSistema) {
                                Button(
                                    onClick = {
                                        abrirConfiguracoes(
                                            ctx,
                                            Permissoes.desinstalar(app.pacote),
                                        )
                                    },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = MaterialTheme.colorScheme.errorContainer,
                                        contentColor = MaterialTheme.colorScheme.onErrorContainer,
                                    ),
                                ) { Text("Desinstalar") }
                            }
                        }
                        if (!app.doSistema) {
                            Text(
                                "Desinstalar é o único jeito de recuperar os " +
                                    "${formatarBytes(app.total)} inteiros. Quem confirma é " +
                                    "o diálogo do Android, não o Faxina.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        } else {
                            Text(
                                "Veio de fábrica: não dá para desinstalar. Em Configurações " +
                                    "costuma existir \"Desativar\", que não devolve o espaço " +
                                    "do APK mas para de acumular dados.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                }
            }

            item {
                Text(
                    "Arquivos fora da área privada",
                    style = MaterialTheme.typography.titleLarge,
                    modifier = Modifier.padding(top = 4.dp),
                )
            }

            if (vasculhando) {
                item {
                    Row(
                        Modifier.fillMaxWidth().padding(24.dp),
                        horizontalArrangement = Arrangement.Center,
                    ) { CircularProgressIndicator() }
                }
            }

            val r = retrato
            if (!vasculhando && r != null) {
                if (r.fatias.isEmpty()) {
                    item {
                        Text(
                            "Nada encontrado fora da área privada. Todo o espaço deste app " +
                                "está no lugar que o sistema não abre — só desinstalar ou " +
                                "limpar dados pela tela de Configurações resolve.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                } else {
                    item {
                        Text(
                            "${formatarBytes(r.bytes)} em ${r.arquivos} arquivos, dentro de " +
                                r.pastas.joinToString(", ") + ".",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    items(r.fatias, key = { it.grupo.name }) { fatia ->
                        LinhaDeGrupo(
                            fatia = fatia,
                            marcada = fatia.grupo in marcados,
                            aoAlternar = {
                                marcados = if (fatia.grupo in marcados) {
                                    marcados - fatia.grupo
                                } else {
                                    marcados + fatia.grupo
                                }
                            },
                        )
                    }
                    if (r.truncado) {
                        item {
                            Text(
                                "A contagem parou no teto de arquivos deste app; pode haver " +
                                    "mais do que o mostrado.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                }
            }
        }

        if (escolhidas.isNotEmpty()) {
            HorizontalDivider(color = MaterialTheme.colorScheme.outline)
            Row(
                Modifier.fillMaxWidth().padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(Modifier.weight(1f)) {
                    Text(
                        "${escolhidas.sumOf { it.quantidade }} arquivo(s)",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    Text(formatarBytes(bytesMarcados), style = MaterialTheme.typography.titleMedium)
                }
                Button(onClick = { confirmando = true }, enabled = !ocupado) {
                    Text("Mandar para a lixeira")
                }
            }
        }
    }

    if (confirmando) {
        AlertDialog(
            onDismissRequest = { confirmando = false },
            title = { Text("Apagar arquivos de ${app.nome}?") },
            text = {
                Text(
                    "${escolhidas.sumOf { it.quantidade }} arquivo(s), " +
                        "${formatarBytes(bytesMarcados)}, em: " +
                        escolhidas.joinToString(", ") { it.grupo.rotulo.lowercase() } + ".\n\n" +
                        "Vão para a lixeira do Faxina, de onde dá para trazer de volta " +
                        "enquanto ela não for esvaziada. O app em si não é tocado.",
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    confirmando = false
                    vm.enviarParaLixeira(escolhidas.flatMap { it.caminhos }.toSet())
                    marcados = emptySet()
                    vm.vasculharApp(app.pacote)
                }) { Text("Mandar") }
            },
            dismissButton = {
                TextButton(onClick = { confirmando = false }) { Text("Cancelar") }
            },
        )
    }
}

@Composable
private fun LinhaDeGrupo(
    fatia: ArquivosDeApps.Fatia,
    marcada: Boolean,
    aoAlternar: () -> Unit,
) {
    Card(
        colors = CardDefaults.cardColors(
            if (marcada) {
                MaterialTheme.colorScheme.primaryContainer
            } else {
                MaterialTheme.colorScheme.surfaceContainerHigh
            },
        ),
        modifier = Modifier.fillMaxWidth().clickable(onClick = aoAlternar),
    ) {
        Row(
            Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Checkbox(checked = marcada, onCheckedChange = { aoAlternar() })
            Spacer(Modifier.width(8.dp))
            Text(fatia.grupo.emoji, style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(fatia.grupo.rotulo, style = MaterialTheme.typography.titleSmall)
                Text(
                    "${fatia.quantidade} arquivo(s)",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Text(formatarBytes(fatia.bytes), style = MaterialTheme.typography.titleSmall)
        }
    }
}

@Composable
private fun Etiqueta(rotulo: String, ativa: Boolean, aoClicar: () -> Unit) {
    Box(
        Modifier
            .clip(RoundedCornerShape(18.dp))
            .background(
                if (ativa) {
                    MaterialTheme.colorScheme.primary
                } else {
                    MaterialTheme.colorScheme.surfaceVariant
                },
            )
            .clickable(onClick = aoClicar)
            .padding(horizontal = 14.dp, vertical = 8.dp),
    ) {
        Text(
            rotulo,
            style = MaterialTheme.typography.labelLarge,
            maxLines = 1,
            color = if (ativa) {
                MaterialTheme.colorScheme.onPrimary
            } else {
                MaterialTheme.colorScheme.onSurfaceVariant
            },
        )
    }
}

/**
 * Os aplicativos que você parou de abrir.
 *
 * É a informação mais valiosa desta aba e a que nenhuma tela do sistema mostra
 * junta: o Android sabe quando cada app foi usado pela última vez e sabe quanto
 * cada um ocupa, mas nunca cruza as duas coisas. Um app de 3 GB aberto ontem é
 * espaço bem gasto; o mesmo app parado há seis meses é o candidato número um.
 *
 * O corte é de 90 dias porque três meses cobrem uso sazonal — app de viagem,
 * de imposto de renda, do banco que você só abre de vez em quando. Abaixo
 * disso o alarme seria falso com frequência demais para valer.
 */
@Composable
private fun CartaoDeEsquecidos(
    esquecidos: List<AppInstalado>,
    filtroLigado: Boolean,
    aoFiltrar: () -> Unit,
) {
    if (esquecidos.isEmpty()) return

    val bytes = esquecidos.sumOf { it.total }
    Card(
        colors = CardDefaults.cardColors(MaterialTheme.colorScheme.secondaryContainer),
        shape = RoundedCornerShape(20.dp),
    ) {
        Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                formatarBytes(bytes),
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onSecondaryContainer,
            )
            Text(
                "em ${esquecidos.size} app(s) que você não abre há mais de 3 meses.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSecondaryContainer,
            )
            Text(
                esquecidos.take(4).joinToString(", ") { it.nome } +
                    if (esquecidos.size > 4) " e mais ${esquecidos.size - 4}." else ".",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSecondaryContainer,
            )
            Button(onClick = aoFiltrar) {
                Text(if (filtroLigado) "Ver todos de novo" else "Ver só esses")
            }
        }
    }
}

@Composable
private fun LinhaApp(app: AppInstalado, aoClicar: () -> Unit) {
    Card(
        colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceContainerHigh),
        modifier = Modifier.fillMaxWidth().clickable(onClick = aoClicar),
    ) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    app.nome,
                    style = MaterialTheme.typography.titleSmall,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f),
                )
                Spacer(Modifier.width(8.dp))
                Text(formatarBytes(app.total), style = MaterialTheme.typography.titleSmall)
            }
            Text(
                "app ${formatarBytes(app.apk)} · dados ${formatarBytes(app.dadosSemCache)} · " +
                    "cache ${formatarBytes(app.cache)}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Text(
                buildString {
                    // "sem registro" e não "nunca aberto": o sistema descarta o
                    // histórico depois de um tempo, e as duas coisas são diferentes.
                    append(
                        if (app.ultimoUso > 0L) {
                            "aberto ${formatarIdade(app.ultimoUso)}"
                        } else {
                            "sem registro de uso"
                        },
                    )
                    if (app.instaladoEm > 0L) {
                        append(" · instalado ${formatarIdade(app.instaladoEm)}")
                    }
                },
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.primary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

@Composable
fun TelaCache(vm: FaxinaViewModel, podeLerApps: Boolean, modifier: Modifier = Modifier) {
    val ctx = LocalContext.current
    val medida by vm.cache.collectAsStateWithLifecycle()
    val limpando by vm.limpandoCache.collectAsStateWithLifecycle()
    val apps by vm.apps.collectAsStateWithLifecycle()

    val servicoExiste = remember { FaxineiroAcessivel.Pedido.disponivel(ctx) }
    var servicoLigado by remember { mutableStateOf(FaxineiroAcessivel.Pedido.ativo(ctx)) }
    var confirmandoLote by remember { mutableStateOf(false) }

    LaunchedEffect(podeLerApps) {
        vm.atualizarCache()
        if (podeLerApps && apps.isEmpty()) vm.carregarApps()
    }

    // Voltar de Configurações é o único momento em que dá para saber se o
    // serviço foi ligado e se a limpeza automática chegou ao fim.
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        servicoLigado = FaxineiroAcessivel.Pedido.ativo(ctx)
        FaxineiroAcessivel.Pedido.colherResultado()?.let { vm.avisar(it) }
        vm.atualizarCache()
        if (podeLerApps) vm.carregarApps()
    }

    // Abaixo de 1 MB não vale a viagem até Configurações.
    val comCache = apps.filter { it.cache >= 1024 * 1024 }.sortedByDescending { it.cache }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        item {
            Card(colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceContainerHigh)) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Limpeza geral", style = MaterialTheme.typography.titleMedium)
                    Text(
                        formatarBytes(medida.liberavel),
                        style = MaterialTheme.typography.displaySmall,
                    )
                    Text(
                        "é o quanto o sistema topa apagar agora, sem escolher app.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )

                    if (limpando) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                        ) {
                            CircularProgressIndicator(Modifier.height(20.dp).width(20.dp))
                            Text("Limpando…", style = MaterialTheme.typography.bodyMedium)
                        }
                    } else {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            // Sem trava quando a estimativa é zero: em alguns
                            // aparelhos ela sai zerada e a limpeza ainda assim
                            // libera espaço. O resultado real é medido depois.
                            Button(onClick = vm::limparCache) { Text("Liberar cache") }
                            OutlinedButton(onClick = {
                                abrirConfiguracoes(ctx, Permissoes.assistenteDeEspaco())
                            }) { Text("Assistente do sistema") }
                        }
                    }
                }
            }
        }

        item { CartaoDoAtalho(ctx) }

        item { CartaoLimpezaAutomatica(servicoExiste, servicoLigado, ctx) }

        item {
            Card(colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceContainerHigh)) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Por que apagar aqui é seguro", style = MaterialTheme.typography.titleMedium)
                    Text(
                        "Quem apaga não é o Faxina: ele pede espaço ao Android, e o próprio " +
                            "sistema decide o que descartar. E o sistema só considera " +
                            "descartável o que está em pasta de cache — coisa que o app " +
                            "recria sozinho no próximo uso.\n\n" +
                            "Conversas, fotos, documentos, downloads, logins e configurações " +
                            "ficam fora por construção, não por acerto nosso. É a mesma " +
                            "rotina que o Android roda sozinho quando o armazenamento enche.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }

        if (!podeLerApps) {
            item {
                CartaoPermissao(
                    titulo = "Acesso de uso",
                    texto = "Necessária para ver o cache de cada aplicativo separadamente.",
                    rotulo = "Abrir a configuração",
                    aoClicar = { abrirConfiguracoes(ctx, Permissoes.telaDeAcessoDeUso()) },
                )
            }
            return@LazyColumn
        }

        item {
            Column(Modifier.padding(top = 8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    "Cache por aplicativo",
                    style = MaterialTheme.typography.titleMedium,
                )
                Text(
                    "${formatarBytes(comCache.sumOf { it.cache })} em ${comCache.size} apps. " +
                        "O número lá em cima costuma ser menor porque o Android guarda uma " +
                        "reserva de cache que a limpeza geral não encosta — por aqui a " +
                        "limpeza é por app, sem reserva que segure.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                if (comCache.isNotEmpty()) {
                    Button(
                        onClick = { confirmandoLote = true },
                        shape = RoundedCornerShape(24.dp),
                        modifier = Modifier.fillMaxWidth().height(50.dp),
                    ) {
                        Text("Limpar ${minOf(comCache.size, LIMITE_DO_LOTE)} apps em sequência")
                    }
                }
            }
        }

        items(comCache, key = { it.pacote }) { app ->
            LinhaCacheDeApp(
                app = app,
                automatico = servicoLigado,
                aoAbrir = {
                    abrirPrimeiroQuePuder(ctx, Permissoes.telasDeArmazenamentoDoApp(app.pacote))
                },
                aoLimpar = {
                    val abriu = iniciarFila(
                        ctx,
                        listOf(FaxineiroAcessivel.Pedido.Alvo(app.pacote, app.nome)),
                    )
                    if (!abriu) vm.avisar("Não foi possível abrir a tela de ${app.nome}.", true)
                },
            )
        }

        if (comCache.isEmpty()) {
            item {
                Text(
                    "Nenhum app com mais de 1 MB de cache.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(vertical = 16.dp),
                )
            }
        }
    }

    if (confirmandoLote) {
        val lote = comCache.take(LIMITE_DO_LOTE)
        AlertDialog(
            onDismissRequest = { confirmandoLote = false },
            title = { Text("Limpar ${lote.size} apps em sequência?") },
            text = {
                Text(
                    if (servicoLigado) {
                        "A tela vai passar sozinha por Configurações, um app de cada vez, " +
                            "apertando \"Limpar cache\". Cerca de ${lote.size * 5} segundos " +
                            "no total, e no fim ela volta para cá.\n\n" +
                            "Até ${formatarBytes(lote.sumOf { it.cache })} podem sair. Só o " +
                            "cache: conversas, fotos e logins não são tocados.\n\n" +
                            "Para interromper, basta sair de Configurações."
                    } else {
                        "O Faxina abre a tela de cada app na sequência. Em cada uma, toque " +
                            "em \"Armazenamento\", depois em \"Limpar cache\", e volte — a " +
                            "próxima abre sozinha, sem você procurar nada.\n\n" +
                            "Até ${formatarBytes(lote.sumOf { it.cache })} podem sair. Só o " +
                            "cache: conversas, fotos e logins não são tocados.\n\n" +
                            "Entre um app e outro aparece um botão Parar, caso queira " +
                            "encerrar antes do fim."
                    },
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    confirmandoLote = false
                    if (servicoLigado) {
                        val alvos = lote.map { FaxineiroAcessivel.Pedido.Alvo(it.pacote, it.nome) }
                        if (!iniciarFila(ctx, alvos)) {
                            vm.avisar("Não foi possível abrir as Configurações.", true)
                        }
                    } else {
                        vm.iniciarFilaGuiada(lote)
                    }
                }) { Text("Começar") }
            },
            dismissButton = {
                TextButton(onClick = { confirmandoLote = false }) { Text("Cancelar") }
            },
        )
    }
}

/**
 * O aviso de andamento das operações de lixeira.
 *
 * Mover milhares de arquivos leva tempo mesmo quando cada um é instantâneo, e
 * uma tela parada durante isso é indistinguível de uma tela travada. A barra
 * mostra a fração real, não uma animação genérica: o usuário precisa saber
 * quanto falta, não só que algo acontece.
 */
@Composable
fun AvisoDeAndamento(andamento: Lixeira.Andamento) {
    val fracao = if (andamento.total <= 0) {
        0f
    } else {
        (andamento.feitos.toFloat() / andamento.total).coerceIn(0f, 1f)
    }

    AlertDialog(
        // Sem onDismissRequest ativo: interromper no meio deixaria metade dos
        // arquivos em um lugar e metade no outro.
        onDismissRequest = {},
        confirmButton = {},
        title = { Text("Movendo para a lixeira") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    "${andamento.feitos} de ${andamento.total}",
                    style = MaterialTheme.typography.headlineSmall,
                )
                Box(
                    Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(MaterialTheme.colorScheme.outline),
                ) {
                    Box(
                        Modifier
                            .fillMaxWidth(fracao)
                            .height(8.dp)
                            .background(MaterialTheme.colorScheme.primary),
                    )
                }
                Text(
                    andamento.nome,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        },
    )
}

/**
 * A faixa que acompanha a sequência guiada.
 *
 * Aparece no instante entre voltar de um app e abrir o próximo. É curto de
 * propósito — mas precisa existir, senão a única forma de escapar da sequência
 * seria fechar o aplicativo.
 */
@Composable
fun FaixaDaFila(fila: FilaGuiada, aoParar: () -> Unit, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.fillMaxWidth().padding(16.dp),
        colors = CardDefaults.cardColors(MaterialTheme.colorScheme.primaryContainer),
        shape = RoundedCornerShape(20.dp),
    ) {
        Row(
            Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(Modifier.weight(1f)) {
                Text(
                    "Limpando ${fila.feitos + 1} de ${fila.total}",
                    style = MaterialTheme.typography.titleSmall,
                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                )
                Text(
                    fila.atual?.nome ?: "concluindo…",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            Spacer(Modifier.width(12.dp))
            OutlinedButton(onClick = aoParar) { Text("Parar") }
        }
    }
}

/**
 * Quantos apps um lote percorre no máximo.
 *
 * Cada app custa alguns segundos de tela de Configurações passando sozinha, e
 * durante isso o aparelho não é do usuário. Vinte já cobre o que importa em
 * qualquer celular e mantém a espera abaixo de dois minutos.
 */
private const val LIMITE_DO_LOTE = 20

/**
 * Arma a fila e abre o primeiro app. O serviço cuida do resto — inclusive de
 * abrir os próximos, o que a interface não conseguiria fazer estando em segundo
 * plano.
 */
private fun iniciarFila(
    ctx: android.content.Context,
    alvos: List<FaxineiroAcessivel.Pedido.Alvo>,
): Boolean {
    val primeiro = alvos.firstOrNull() ?: return false
    FaxineiroAcessivel.Pedido.armar(alvos)

    val abriu = abrirPrimeiroQuePuder(ctx, Permissoes.telasDeArmazenamentoDoApp(primeiro.pacote))
    // Fila armada sem tela aberta ficaria pendurada esperando um evento que
    // nunca vem, e o próximo toque em "Limpar" herdaria o estado sujo.
    if (!abriu) FaxineiroAcessivel.Pedido.cancelar()
    return abriu
}

/**
 * Oferece o bloco de Configurações Rápidas.
 *
 * Do Android 13 em diante existe um pedido oficial: o sistema mostra um
 * diálogo e coloca o bloco sozinho. Antes disso não há API nenhuma, e a única
 * coisa honesta a fazer é ensinar o caminho manual em uma linha.
 */
@Composable
private fun CartaoDoAtalho(ctx: android.content.Context) {
    var pedido by remember { mutableStateOf(false) }

    Card(colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceContainerHigh)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Atalho na barra de notificações", style = MaterialTheme.typography.titleMedium)
            Text(
                "Um bloco \"Limpar cache\" junto do Wi-Fi e da lanterna: dois arrastos " +
                    "para baixo e um toque, sem abrir o Faxina. Ele mostra quanto há " +
                    "para liberar já no próprio bloco.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
                Button(onClick = {
                    pedido = true
                    pedirAtalhoRapido(ctx)
                }) { Text(if (pedido) "Pedir de novo" else "Adicionar o bloco") }
            } else {
                Text(
                    "Para colocar: puxe a barra de notificações, toque no lápis de editar " +
                        "e arraste o bloco do Faxina para cima.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary,
                )
            }
        }
    }
}

@androidx.annotation.RequiresApi(android.os.Build.VERSION_CODES.TIRAMISU)
private fun pedirAtalhoRapido(ctx: android.content.Context) {
    val barra = ctx.getSystemService(android.app.StatusBarManager::class.java) ?: return
    try {
        barra.requestAddTileService(
            android.content.ComponentName(ctx, AtalhoDeLimpeza::class.java),
            "Limpar cache",
            android.graphics.drawable.Icon.createWithResource(ctx, R.drawable.ic_atalho_limpeza),
            { comando -> comando.run() },
            { },
        )
    } catch (e: Exception) {
        Toast.makeText(ctx, "Não deu para pedir o bloco: ${e.message}", Toast.LENGTH_LONG).show()
    }
}

/**
 * Explica o serviço de acessibilidade antes de pedir para ligar.
 *
 * Ligar acessibilidade é uma permissão grande, e pedir isso sem dizer o que
 * será feito com ela é exatamente o que apps de limpeza ruins fazem. Aqui os
 * limites vêm antes do botão.
 */
@Composable
private fun CartaoLimpezaAutomatica(
    existe: Boolean,
    ligado: Boolean,
    ctx: android.content.Context,
) {
    // Versão padrão: o serviço nem está no APK. Explicar é melhor que oferecer
    // um botão que o sistema jamais vai atender.
    if (!existe) {
        Card(colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceContainerHigh)) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Sequência guiada", style = MaterialTheme.typography.titleMedium)
                Text(
                    "Nesta versão os últimos toques são seus: o Faxina abre a tela de cada " +
                        "app na sequência, você toca em \"Armazenamento\", em \"Limpar " +
                        "cache\" e volta — e a próxima abre sozinha. Você nunca precisa " +
                        "procurar o próximo app nem voltar até esta lista.\n\n" +
                        "Existe uma versão que aperta o botão também, por acessibilidade, " +
                        "mas o Play Protect recusa instalar qualquer app de fora da loja " +
                        "que declare esse serviço — e a regra existe por bom motivo, já que " +
                        "acessibilidade é o vetor preferido dos golpes bancários.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
        return
    }

    Card(
        colors = CardDefaults.cardColors(
            if (ligado) {
                MaterialTheme.colorScheme.surfaceVariant
            } else {
                MaterialTheme.colorScheme.primaryContainer
            },
        ),
    ) {
        val cor = if (ligado) {
            MaterialTheme.colorScheme.onSurfaceVariant
        } else {
            MaterialTheme.colorScheme.onPrimaryContainer
        }

        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                if (ligado) "Botão \"Limpar\" ativo" else "Limpar com um toque só",
                style = MaterialTheme.typography.titleMedium,
                color = cor,
            )

            if (ligado) {
                Text(
                    "Use \"Limpar de uma vez\", logo abaixo, para percorrer a lista " +
                        "inteira sem tocar em nada — a tela passa sozinha por " +
                        "Configurações e volta para cá no fim. O botão Limpar de cada " +
                        "linha faz o mesmo para um app só.\n\n" +
                        "Para desligar, é no mesmo lugar onde foi ligado.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = cor,
                )
                OutlinedButton(onClick = {
                    abrirConfiguracoes(ctx, FaxineiroAcessivel.Pedido.telaDeAcessibilidade())
                }) { Text("Configurações de acessibilidade") }
            } else {
                Text(
                    "Limpar o cache de um app específico não tem API para app comum — " +
                        "o botão só existe dentro de Configurações. Com um serviço de " +
                        "acessibilidade ligado, o Faxina aperta esse botão por você.\n\n" +
                        "• Só enxerga as telas de Configurações. Nenhum outro app é " +
                        "entregue a ele pelo sistema.\n" +
                        "• Só age nos 15 segundos depois de você tocar em \"Limpar\".\n" +
                        "• Nunca toca em \"Limpar dados\": exige a palavra \"cache\" e " +
                        "recusa qualquer botão que fale em dados.\n\n" +
                        "Sem isso o botão continua funcionando — só que parando na tela " +
                        "de Configurações para você dar o último toque.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = cor,
                )
                Button(onClick = {
                    abrirConfiguracoes(ctx, FaxineiroAcessivel.Pedido.telaDeAcessibilidade())
                }) { Text("Ligar nas Configurações") }
            }
        }
    }
}

@Composable
private fun LinhaCacheDeApp(
    app: AppInstalado,
    automatico: Boolean,
    aoAbrir: () -> Unit,
    aoLimpar: () -> Unit,
) {
    Card(
        colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceContainerHigh),
        modifier = Modifier.fillMaxWidth().clickable(onClick = aoAbrir),
    ) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(
                        app.nome,
                        style = MaterialTheme.typography.titleSmall,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Text(
                        "total ${formatarBytes(app.total)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Spacer(Modifier.width(8.dp))
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        formatarBytes(app.cache),
                        style = MaterialTheme.typography.titleSmall,
                        color = MaterialTheme.colorScheme.primary,
                    )
                    Text(
                        "de cache",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Spacer(Modifier.width(12.dp))
                Button(onClick = aoLimpar) {
                    Text(if (automatico) "Limpar" else "Abrir")
                }
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Lixeira
// ---------------------------------------------------------------------------

@Composable
fun TelaLixeira(vm: FaxinaViewModel, modifier: Modifier = Modifier) {
    val itens by vm.naLixeira.collectAsStateWithLifecycle()
    val ocupado by vm.ocupado.collectAsStateWithLifecycle()
    var confirmando by remember { mutableStateOf(false) }
    val total = itens.sumOf { it.tamanho }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        item {
            Card(colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceContainerHigh)) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        "${itens.size} item(ns) · ${formatarBytes(total)}",
                        style = MaterialTheme.typography.titleMedium,
                    )
                    Text(
                        "Enquanto estiverem aqui, esses arquivos continuam ocupando o mesmo " +
                            "espaço de antes — só mudaram de pasta. Esvaziar é o passo que " +
                            "devolve o espaço, e não tem volta.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = { confirmando = true },
                            enabled = itens.isNotEmpty() && !ocupado,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.error,
                                contentColor = Color.Black,
                            ),
                        ) { Text("Esvaziar") }
                        OutlinedButton(
                            onClick = vm::restaurarTudo,
                            enabled = itens.isNotEmpty() && !ocupado,
                        ) { Text("Restaurar tudo") }
                    }
                }
            }
        }

        items(itens, key = { it.guardado }) { item ->
            Column(Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                Row {
                    Text(
                        item.nome,
                        style = MaterialTheme.typography.bodyMedium,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f),
                    )
                    Text(formatarBytes(item.tamanho), style = MaterialTheme.typography.bodyMedium)
                }
                Text(
                    "voltaria para ${caminhoCurto(item.origem, vm.raiz.absolutePath)}",
                    style = MaterialTheme.typography.bodySmall,
                    fontFamily = FontFamily.Monospace,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
    }

    if (confirmando) {
        AlertDialog(
            onDismissRequest = { confirmando = false },
            title = { Text("Apagar de vez?") },
            text = {
                Text(
                    "${itens.size} arquivo(s), ${formatarBytes(total)}. Depois disso não há " +
                        "como recuperar pelo aplicativo.",
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    confirmando = false
                    vm.esvaziarLixeira()
                }) { Text("Apagar de vez") }
            },
            dismissButton = {
                TextButton(onClick = { confirmando = false }) { Text("Cancelar") }
            },
        )
    }
}
