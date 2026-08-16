package com.bahiense.faxina

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
// android.graphics.Color não é importado de propósito: colidiria com o Color do
// Compose, usado no tema logo abaixo. Na tela de falha ele aparece pelo nome
// completo, que é o único lugar que precisa dele.
import android.graphics.Typeface
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.delay

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Se a abertura anterior morreu, o motivo vem antes de qualquer outra
        // coisa. A tela é feita de Views comuns de propósito: se o problema
        // estiver no próprio Compose, uma tela de erro em Compose morreria junto.
        val falha = Falhas.pendente(this)
        if (falha != null) {
            setContentView(telaDeFalha(falha))
            return
        }

        setContent { TemaFaxina { Faxina() } }
    }

    private fun telaDeFalha(texto: String): View {
        fun dp(valor: Int) = (valor * resources.displayMetrics.density).toInt()
        fun cor(hex: String) = android.graphics.Color.parseColor(hex)

        val raiz = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(cor("#FF07080A"))
            setPadding(dp(20), dp(56), dp(20), dp(32))
        }

        raiz.addView(
            TextView(this).apply {
                text = "O Faxina fechou sozinho"
                setTextColor(android.graphics.Color.WHITE)
                textSize = 22f
            },
        )
        raiz.addView(
            TextView(this).apply {
                text = "Abaixo está o motivo, gravado no instante da queda. " +
                    "Compartilhe este texto para o erro poder ser corrigido."
                setTextColor(cor("#FFBFC9C7"))
                textSize = 14f
                setPadding(0, dp(8), 0, dp(12))
            },
        )

        val rolagem = ScrollView(this).apply {
            addView(
                TextView(context).apply {
                    text = texto
                    setTextColor(cor("#FFE3E3E3"))
                    textSize = 11f
                    typeface = Typeface.MONOSPACE
                    setTextIsSelectable(true)
                },
            )
        }
        raiz.addView(
            rolagem,
            LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f),
        )

        raiz.addView(
            Button(this).apply {
                text = "Compartilhar o erro"
                setOnClickListener {
                    val envio = Intent(Intent.ACTION_SEND)
                        .setType("text/plain")
                        .putExtra(Intent.EXTRA_SUBJECT, "Faxina — falha na abertura")
                        .putExtra(Intent.EXTRA_TEXT, texto)
                    try {
                        startActivity(Intent.createChooser(envio, "Compartilhar o erro"))
                    } catch (e: ActivityNotFoundException) {
                        // sem app de compartilhamento; o texto continua na tela
                        // e é selecionável para copiar à mão.
                    }
                }
            },
        )
        raiz.addView(
            Button(this).apply {
                text = "Descartar e tentar de novo"
                setOnClickListener {
                    Falhas.limpar(this@MainActivity)
                    recreate()
                }
            },
        )

        return raiz
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
    //
    // Envolvidas em runCatching porque ROMs modificadas às vezes recusam a
    // consulta: responder "não tem permissão" mostra um cartão pedindo para
    // ligá-la, o que é bem melhor que fechar o app na cara do usuário.
    var podeLerArquivos by remember {
        mutableStateOf(runCatching { Permissoes.temAcessoAArquivos(ctx) }.getOrDefault(false))
    }
    var podeLerApps by remember {
        mutableStateOf(runCatching { Permissoes.temAcessoDeUso(ctx) }.getOrDefault(false))
    }
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        podeLerArquivos = runCatching { Permissoes.temAcessoAArquivos(ctx) }.getOrDefault(false)
        podeLerApps = runCatching { Permissoes.temAcessoDeUso(ctx) }.getOrDefault(false)
        // Voltar de Configurações é o sinal de que um app da sequência acabou.
        vm.retomarFilaGuiada()
    }

    // A sequência avança sozinha, com uma pausa curta para o botão Parar ficar
    // alcançável. Sem ela, o usuário só escaparia fechando o aplicativo.
    val fila by vm.fila.collectAsStateWithLifecycle()
    LaunchedEffect(fila?.feitos, fila?.esperandoAbrir) {
        val atual = fila
        if (atual != null && atual.esperandoAbrir) {
            delay(1_400)
            vm.abrirAppDaFila()
        }
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
        Box(Modifier.padding(espaco)) {
            ConteudoDaAba(aba, vm, podeLerArquivos, podeLerApps) { aba = it }
            fila?.let {
                FaixaDaFila(
                    fila = it,
                    aoParar = vm::pararFila,
                    modifier = Modifier.align(Alignment.BottomCenter),
                )
            }
        }
    }
}

@Composable
private fun ConteudoDaAba(
    aba: Aba,
    vm: FaxinaViewModel,
    podeLerArquivos: Boolean,
    podeLerApps: Boolean,
    aoTrocarAba: (Aba) -> Unit,
) {
    val conteudo = Modifier.fillMaxSize()
    when (aba) {
        Aba.RESUMO -> TelaResumo(
            vm = vm,
            podeLerArquivos = podeLerArquivos,
            podeLerApps = podeLerApps,
            aoVerArquivos = { aoTrocarAba(Aba.ARQUIVOS) },
            aoVerApps = { aoTrocarAba(Aba.APPS) },
            modifier = conteudo,
        )

        Aba.ARQUIVOS -> TelaArquivos(vm = vm, modifier = conteudo)

        Aba.APPS -> TelaApps(vm = vm, podeLerApps = podeLerApps, modifier = conteudo)

        Aba.CACHE -> TelaCache(vm = vm, podeLerApps = podeLerApps, modifier = conteudo)

        Aba.LIXEIRA -> TelaLixeira(vm = vm, modifier = conteudo)
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
