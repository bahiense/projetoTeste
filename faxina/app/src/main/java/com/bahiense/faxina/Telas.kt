package com.bahiense.faxina

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle

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
    modifier: Modifier = Modifier,
) {
    val ctx = LocalContext.current
    val uso by vm.uso.collectAsStateWithLifecycle()
    val varredura by vm.varredura.collectAsStateWithLifecycle()
    val naLixeira by vm.naLixeira.collectAsStateWithLifecycle()

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item { CartaoUso(uso) }

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

        item {
            Card(colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceVariant)) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Varredura", style = MaterialTheme.typography.titleMedium)

                    when (val v = varredura) {
                        is EstadoVarredura.Ocioso -> Text(
                            "Ainda não rodou. A primeira passada costuma levar de um a " +
                                "cinco minutos, dependendo de quantos arquivos existem.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )

                        is EstadoVarredura.Rodando -> Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                        ) {
                            CircularProgressIndicator(Modifier.height(20.dp).width(20.dp))
                            Column {
                                Text(v.progresso.etapa, style = MaterialTheme.typography.bodyMedium)
                                Text(
                                    "${v.progresso.arquivos} arquivos",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            }
                        }

                        is EstadoVarredura.Pronto -> {
                            val r = v.resultado
                            Text(
                                "${r.arquivosLidos} arquivos lidos em ${r.duracaoMs / 1000}s.",
                                style = MaterialTheme.typography.bodyMedium,
                            )
                            Categoria.entries.forEach { c ->
                                val itens = r.de(c)
                                if (itens.isNotEmpty()) {
                                    LinhaResumo(
                                        rotulo = "${c.emoji}  ${c.titulo}",
                                        valor = if (c == Categoria.VAZIAS) {
                                            "${itens.size} pastas"
                                        } else {
                                            "${itens.size} · ${formatarBytes(r.bytesDe(c))}"
                                        },
                                    )
                                }
                            }
                            r.avisos.forEach { aviso ->
                                Text(
                                    aviso,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            }
                        }

                        is EstadoVarredura.Falhou -> Text(
                            "Falhou: ${v.mensagem}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.error,
                        )
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = vm::varrer,
                            enabled = podeLerArquivos && varredura !is EstadoVarredura.Rodando,
                        ) {
                            Text(if (varredura is EstadoVarredura.Pronto) "Varrer de novo" else "Varrer agora")
                        }
                        if (varredura is EstadoVarredura.Pronto) {
                            OutlinedButton(onClick = aoVerArquivos) { Text("Ver achados") }
                        }
                    }
                }
            }
        }

        item {
            Card(colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceVariant)) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Onde está o seu espaço", style = MaterialTheme.typography.titleMedium)
                    Text(
                        "Fotos, vídeos, áudio e documentos somam pouco em quase todo aparelho " +
                            "cheio. O peso costuma estar nos aplicativos e nos dados que eles " +
                            "guardam — e essa lista a tela da Samsung não mostra.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Button(onClick = aoVerApps, enabled = podeLerApps) {
                        Text("Ver apps por tamanho")
                    }
                }
            }
        }

        if (naLixeira.isNotEmpty()) {
            item {
                Card(colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceVariant)) {
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

@Composable
private fun CartaoUso(uso: UsoDoAparelho) {
    Card(colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceVariant)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("Armazenamento interno", style = MaterialTheme.typography.titleMedium)

            Row(verticalAlignment = Alignment.Bottom) {
                Text(
                    "${(uso.fracaoUsada * 100).toInt()}%",
                    style = MaterialTheme.typography.displaySmall,
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    "usados",
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.padding(bottom = 6.dp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(Modifier.weight(1f))
                Text(
                    "${formatarBytes(uso.usado)} / ${formatarBytes(uso.total)}",
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.padding(bottom = 6.dp),
                )
            }

            Box(
                Modifier
                    .fillMaxWidth()
                    .height(10.dp)
                    .clip(RoundedCornerShape(5.dp))
                    .background(MaterialTheme.colorScheme.outline),
            ) {
                Box(
                    Modifier
                        .fillMaxWidth(uso.fracaoUsada)
                        .height(10.dp)
                        .background(MaterialTheme.colorScheme.primary),
                )
            }

            Text(
                "${formatarBytes(uso.livre)} livres",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
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

// ---------------------------------------------------------------------------
// Arquivos
// ---------------------------------------------------------------------------

@Composable
fun TelaArquivos(vm: FaxinaViewModel, modifier: Modifier = Modifier) {
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

    var abertas by remember { mutableStateOf(setOf(Categoria.LIXO)) }
    var confirmando by remember { mutableStateOf(false) }
    val bytesMarcados = resultado.bytesUnicos(selecionados)

    Column(modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(
                start = 16.dp, end = 16.dp, top = 16.dp, bottom = 8.dp,
            ),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Categoria.entries.forEach { categoria ->
                val itens = resultado.de(categoria)
                if (itens.isEmpty()) return@forEach

                val aberta = categoria in abertas
                item(key = "cab-${categoria.name}") {
                    CabecalhoCategoria(
                        categoria = categoria,
                        quantidade = itens.size,
                        bytes = resultado.bytesDe(categoria),
                        aberta = aberta,
                        marcados = itens.count { it.caminho in selecionados },
                        aoAbrir = {
                            abertas = if (aberta) abertas - categoria else abertas + categoria
                        },
                        aoMarcarTodos = { marcar ->
                            vm.marcar(itens.map { it.caminho }, marcar)
                        },
                    )
                }

                if (aberta) {
                    items(itens, key = { "${categoria.name}-${it.caminho}" }) { achado ->
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

        HorizontalDivider(color = MaterialTheme.colorScheme.outline)
        Row(
            Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(Modifier.weight(1f)) {
                Text(
                    "${selecionados.size} selecionado(s)",
                    style = MaterialTheme.typography.bodyMedium,
                )
                Text(
                    formatarBytes(bytesMarcados),
                    style = MaterialTheme.typography.titleMedium,
                )
            }
            Button(
                onClick = { confirmando = true },
                enabled = selecionados.isNotEmpty() && !ocupado,
            ) {
                Text("Mandar para a lixeira")
            }
        }
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

@Composable
private fun CabecalhoCategoria(
    categoria: Categoria,
    quantidade: Int,
    bytes: Long,
    aberta: Boolean,
    marcados: Int,
    aoAbrir: () -> Unit,
    aoMarcarTodos: (Boolean) -> Unit,
) {
    Card(
        colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceVariant),
        modifier = Modifier.fillMaxWidth().clickable(onClick = aoAbrir),
    ) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("${categoria.emoji}  ${categoria.titulo}", style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.weight(1f))
                Text(
                    "$quantidade · ${formatarBytes(bytes)}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(Modifier.width(8.dp))
                Text(if (aberta) "▾" else "▸")
            }
            Text(
                categoria.explicacao,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            if (aberta) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    TextButton(onClick = { aoMarcarTodos(true) }) { Text("Marcar todos") }
                    TextButton(onClick = { aoMarcarTodos(false) }) { Text("Desmarcar") }
                    Spacer(Modifier.weight(1f))
                    Text(
                        "$marcados de $quantidade",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(top = 14.dp),
                    )
                }
            }
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
    Row(
        Modifier
            .fillMaxWidth()
            .clickable(onClick = aoAlternar)
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Checkbox(checked = marcado, onCheckedChange = { aoAlternar() })
        Spacer(Modifier.width(4.dp))
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

@Composable
fun TelaApps(vm: FaxinaViewModel, podeLerApps: Boolean, modifier: Modifier = Modifier) {
    val ctx = LocalContext.current
    val apps by vm.apps.collectAsStateWithLifecycle()
    val carregando by vm.carregandoApps.collectAsStateWithLifecycle()
    var mostrarSistema by remember { mutableStateOf(false) }

    LaunchedEffect(podeLerApps) {
        if (podeLerApps && apps.isEmpty()) vm.carregarApps()
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

    val visiveis = apps.filter { mostrarSistema || !it.doSistema }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        item {
            Card(colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceVariant)) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        "${formatarBytes(visiveis.sumOf { it.total })} em ${visiveis.size} apps",
                        style = MaterialTheme.typography.titleMedium,
                    )
                    Text(
                        "Cache somado: ${formatarBytes(visiveis.sumOf { it.cache })}. " +
                            "Nenhum app comum consegue limpar o cache de outro — o Android " +
                            "reserva isso ao sistema. Tocar em um item abre a tela onde os " +
                            "botões de desinstalar e limpar cache existem.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(onClick = { mostrarSistema = !mostrarSistema }) {
                            Text(if (mostrarSistema) "Esconder do sistema" else "Mostrar do sistema")
                        }
                        OutlinedButton(onClick = vm::carregarApps) { Text("Recarregar") }
                    }
                }
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
            LinhaApp(app) { abrirConfiguracoes(ctx, Permissoes.telaDoApp(app.pacote)) }
        }
    }
}

@Composable
private fun LinhaApp(app: AppInstalado, aoClicar: () -> Unit) {
    Card(
        colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceVariant),
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
                app.pacote,
                style = MaterialTheme.typography.bodySmall,
                fontFamily = FontFamily.Monospace,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
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
            Card(colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surfaceVariant)) {
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
