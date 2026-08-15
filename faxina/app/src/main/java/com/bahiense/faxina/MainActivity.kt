package com.bahiense.faxina

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { TemaFaxina { Faxina() } }
    }
}

/**
 * Paleta escura de propósito: o app vive ao lado da tela de armazenamento da
 * Samsung, que é escura, e uma tela clara no meio do caminho incomoda.
 */
private val esquemaEscuro = darkColorScheme(
    primary = Color(0xFF4DD0C7),
    onPrimary = Color(0xFF00201E),
    primaryContainer = Color(0xFF00504B),
    onPrimaryContainer = Color(0xFF9CF2E9),
    secondary = Color(0xFFB0CCC8),
    background = Color(0xFF07080A),
    onBackground = Color(0xFFE3E3E3),
    surface = Color(0xFF07080A),
    onSurface = Color(0xFFE3E3E3),
    surfaceVariant = Color(0xFF1B1F1E),
    onSurfaceVariant = Color(0xFFBFC9C7),
    error = Color(0xFFFFB4AB),
    outline = Color(0xFF3D4644),
)

@Composable
fun TemaFaxina(conteudo: @Composable () -> Unit) {
    MaterialTheme(colorScheme = esquemaEscuro) {
        Surface(color = MaterialTheme.colorScheme.background) { conteudo() }
    }
}

private enum class Aba(val titulo: String, val emoji: String) {
    RESUMO("Início", "🏠"),
    ARQUIVOS("Arquivos", "🗂️"),
    APPS("Apps", "📱"),
    CACHE("Cache", "🧹"),
    LIXEIRA("Lixeira", "🗑️"),
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Faxina(vm: FaxinaViewModel = viewModel()) {
    val ctx = LocalContext.current
    var aba by remember { mutableStateOf(Aba.RESUMO) }

    // As duas permissões são ligadas em telas de Configurações, fora do app.
    // Revalidar a cada volta para o primeiro plano é a única forma de perceber.
    var podeLerArquivos by remember { mutableStateOf(Permissoes.temAcessoAArquivos(ctx)) }
    var podeLerApps by remember { mutableStateOf(Permissoes.temAcessoDeUso(ctx)) }
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        podeLerArquivos = Permissoes.temAcessoAArquivos(ctx)
        podeLerApps = Permissoes.temAcessoDeUso(ctx)
    }

    val avisos = remember { SnackbarHostState() }
    val recado by vm.recado.collectAsStateWithLifecycle()
    LaunchedEffect(recado) {
        val atual = recado ?: return@LaunchedEffect
        avisos.showSnackbar(atual.texto)
        vm.descartarRecado()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (aba == Aba.RESUMO) "Faxina" else aba.titulo) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background,
                ),
            )
        },
        bottomBar = {
            NavigationBar(containerColor = MaterialTheme.colorScheme.surfaceVariant) {
                Aba.entries.forEach { alvo ->
                    NavigationBarItem(
                        selected = aba == alvo,
                        onClick = { aba = alvo },
                        icon = { Text(alvo.emoji) },
                        label = { Text(alvo.titulo) },
                    )
                }
            }
        },
        snackbarHost = { SnackbarHost(avisos) },
    ) { espaco ->
        val conteudo = Modifier.padding(espaco)
        when (aba) {
            Aba.RESUMO -> TelaResumo(
                vm = vm,
                podeLerArquivos = podeLerArquivos,
                podeLerApps = podeLerApps,
                aoVerArquivos = { aba = Aba.ARQUIVOS },
                aoVerApps = { aba = Aba.APPS },
                modifier = conteudo,
            )

            Aba.ARQUIVOS -> TelaArquivos(vm = vm, modifier = conteudo)

            Aba.APPS -> TelaApps(
                vm = vm,
                podeLerApps = podeLerApps,
                modifier = conteudo,
            )

            Aba.CACHE -> TelaCache(
                vm = vm,
                podeLerApps = podeLerApps,
                modifier = conteudo,
            )

            Aba.LIXEIRA -> TelaLixeira(vm = vm, modifier = conteudo)
        }
    }
}

/**
 * Abre o arquivo no visualizador padrão do sistema.
 *
 * A miniatura responde "é uma foto de quê?"; isso responde "é esta mesmo?".
 * Antes de apagar em lote, poder conferir o arquivo original é a diferença
 * entre limpar e se arrepender.
 */
fun abrirArquivo(ctx: Context, caminho: String): Boolean {
    val arquivo = java.io.File(caminho)
    if (!arquivo.exists()) return false

    return try {
        val uri = androidx.core.content.FileProvider.getUriForFile(
            ctx,
            "${ctx.packageName}.arquivos",
            arquivo,
        )
        val intent = Intent(Intent.ACTION_VIEW)
            .setDataAndType(uri, Miniaturas.mimeDe(arquivo.name))
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
        ctx.startActivity(intent)
        true
    } catch (e: ActivityNotFoundException) {
        // Nenhum app instalado abre esse tipo.
        false
    } catch (e: IllegalArgumentException) {
        // Caminho fora do que o provedor publica (cartão externo, por exemplo).
        false
    } catch (e: SecurityException) {
        false
    }
}

/**
 * Abre uma tela de Configurações. Algumas ROMs da Samsung não têm a tela
 * específica de um app; nesse caso vale mais cair na lista geral do que
 * derrubar o aplicativo com ActivityNotFoundException.
 */
fun abrirConfiguracoes(ctx: Context, intent: Intent, alternativa: Intent? = null): Boolean {
    val comFlag = Intent(intent).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    return try {
        ctx.startActivity(comFlag)
        true
    } catch (e: ActivityNotFoundException) {
        if (alternativa == null) return false
        try {
            ctx.startActivity(Intent(alternativa).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            true
        } catch (e2: ActivityNotFoundException) {
            false
        }
    }
}
