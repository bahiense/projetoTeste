package com.bahiense.faxina

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
// android.graphics.Color não é importado de propósito: colidiria com o Color do
// Compose, usado no tema logo abaixo. Na tela de falha ele aparece pelo nome
// completo, que é o único lugar que precisa dele.
import android.graphics.Typeface
import android.os.Build
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.annotation.DrawableRes
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Shapes
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
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
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.delay

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // Antes do super: é o contrato da biblioteca de splash, que troca o
        // tema de abertura pelo tema normal no primeiro quadro desenhado.
        installSplashScreen()
        super.onCreate(savedInstanceState)
        // O app desenha atrás das barras do sistema; o Scaffold devolve o
        // espaço delas via insets. É o padrão da plataforma desde o Android 15.
        enableEdgeToEdge()

        // Se a abertura anterior morreu, o motivo vem antes de qualquer outra
        // coisa. A tela é feita de Views comuns de propósito: se o problema
        // estiver no próprio Compose, uma tela de erro em Compose morreria junto.
        val falha = Falhas.pendente(this)
        if (falha != null) {
            setContentView(telaDeFalha(falha))
            return
        }

        setContent {
            // Lido aqui e guardado em estado: trocar o tema tem de repintar o
            // app na hora, sem exigir que o usuário feche e abra de novo.
            var tema by remember { mutableStateOf(Preferencias.tema(this)) }
            TemaFaxina(tema) {
                Faxina(
                    tema = tema,
                    aoTrocarTema = {
                        Preferencias.definirTema(this, it)
                        tema = it
                    },
                )
            }
        }
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

/** A paleta escura de reserva, para antes do Material You. */
private val esquemaEscuro = darkColorScheme(
    primary = Color(0xFF4DD0C7),
    onPrimary = Color(0xFF00201E),
    primaryContainer = Color(0xFF00504B),
    onPrimaryContainer = Color(0xFF9CF2E9),
    secondary = Color(0xFFB0CCC8),
    secondaryContainer = Color(0xFF324B48),
    onSecondaryContainer = Color(0xFFCCE8E3),
    background = Color(0xFF0E1413),
    onBackground = Color(0xFFE3E3E3),
    surface = Color(0xFF0E1413),
    onSurface = Color(0xFFE3E3E3),
    surfaceVariant = Color(0xFF1B1F1E),
    onSurfaceVariant = Color(0xFFBFC9C7),
    surfaceContainer = Color(0xFF171D1C),
    surfaceContainerHigh = Color(0xFF1F2625),
    surfaceContainerHighest = Color(0xFF2A3130),
    error = Color(0xFFFFB4AB),
    errorContainer = Color(0xFF7A2C25),
    onErrorContainer = Color(0xFFFFDAD6),
    outline = Color(0xFF3D4644),
)

/**
 * O tema claro, e por que os cartões são brancos.
 *
 * No escuro a hierarquia se faz clareando: o fundo é quase preto e cada
 * camada acima dele sobe um degrau. No claro o instinto é repetir a receita
 * ao contrário e escurecer os cartões — e é assim que se produz aquele
 * cinza encardido que faz um app parecer velho.
 *
 * Aqui é o oposto: o fundo é um cinza levíssimo e **o cartão é branco puro**.
 * O conteúdo é a parte clara, o fundo é o descanso. É o que faz uma tela
 * parecer limpa em vez de apagada.
 */
private val esquemaClaro = lightColorScheme(
    primary = Color(0xFF006A62),
    onPrimary = Color(0xFFFFFFFF),
    primaryContainer = Color(0xFF9CF2E9),
    onPrimaryContainer = Color(0xFF00201E),
    secondary = Color(0xFF4A635F),
    onSecondary = Color(0xFFFFFFFF),
    secondaryContainer = Color(0xFFCCE8E3),
    onSecondaryContainer = Color(0xFF051F1D),
    background = Color(0xFFF2F5F4),
    onBackground = Color(0xFF171D1C),
    surface = Color(0xFFF2F5F4),
    onSurface = Color(0xFF171D1C),
    surfaceVariant = Color(0xFFE2E9E7),
    onSurfaceVariant = Color(0xFF56605E),
    surfaceContainer = Color(0xFFFFFFFF),
    surfaceContainerHigh = Color(0xFFFFFFFF),
    surfaceContainerHighest = Color(0xFFE4EAE8),
    error = Color(0xFFBA1A1A),
    onError = Color(0xFFFFFFFF),
    errorContainer = Color(0xFFFFDAD6),
    onErrorContainer = Color(0xFF410002),
    outline = Color(0xFFCBD5D2),
)

/**
 * A escala de formas do app inteiro, um degrau mais redonda que a padrão.
 * Cantos francos são a assinatura visual do Material 3 expressivo — e como os
 * componentes leem daqui, uma linha muda o app todo.
 */
private val formas = Shapes(
    extraSmall = RoundedCornerShape(10.dp),
    small = RoundedCornerShape(16.dp),
    medium = RoundedCornerShape(22.dp),
    large = RoundedCornerShape(28.dp),
    extraLarge = RoundedCornerShape(36.dp),
)

@Composable
fun TemaFaxina(tema: Tema, conteudo: @Composable () -> Unit) {
    val ctx = LocalContext.current
    val escuro = when (tema) {
        Tema.CLARO -> false
        Tema.ESCURO -> true
        Tema.SISTEMA -> isSystemInDarkTheme()
    }

    /*
     * Material You quando o aparelho tem: a paleta sai do papel de parede e o
     * app passa a combinar com a One UI em vez de trazer uma cor fixa que
     * envelhece. As paletas acima são o plano B do Android 11 para baixo.
     */
    val esquema = when {
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && escuro -> dynamicDarkColorScheme(ctx)
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> dynamicLightColorScheme(ctx)
        escuro -> esquemaEscuro
        else -> esquemaClaro
    }

    MaterialTheme(colorScheme = esquema, shapes = formas) {
        Surface(color = MaterialTheme.colorScheme.background) { conteudo() }
    }
}

/**
 * As abas, com desenho de verdade no lugar do emoji.
 *
 * Emoji na barra de navegação é o detalhe que mais denuncia um app amador: o
 * traço é de outra família, o tamanho não obedece ao tema e a cor não muda
 * quando o item é selecionado. Estes cinco são vetores próprios, de um traço
 * só, que herdam a cor do Material como qualquer ícone nativo.
 */
private enum class Aba(val titulo: String, @DrawableRes val icone: Int) {
    RESUMO("Início", R.drawable.ic_aba_inicio),
    ARQUIVOS("Arquivos", R.drawable.ic_aba_arquivos),
    APPS("Apps", R.drawable.ic_aba_apps),
    CACHE("Cache", R.drawable.ic_aba_cache),
    LIXEIRA("Lixeira", R.drawable.ic_aba_lixeira),
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Faxina(
    tema: Tema,
    aoTrocarTema: (Tema) -> Unit,
    vm: FaxinaViewModel = viewModel(),
) {
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
            NavigationBar(containerColor = MaterialTheme.colorScheme.surfaceContainer) {
                Aba.entries.forEach { alvo ->
                    NavigationBarItem(
                        selected = aba == alvo,
                        onClick = { aba = alvo },
                        icon = {
                            Icon(
                                painter = painterResource(alvo.icone),
                                contentDescription = null,
                                modifier = Modifier.size(24.dp),
                            )
                        },
                        label = { Text(alvo.titulo) },
                    )
                }
            }
        },
        snackbarHost = { SnackbarHost(avisos) },
    ) { espaco ->
        Box(Modifier.padding(espaco)) {
            ConteudoDaAba(
                aba = aba,
                vm = vm,
                podeLerArquivos = podeLerArquivos,
                podeLerApps = podeLerApps,
                tema = tema,
                aoTrocarTema = aoTrocarTema,
                aoTrocarAba = { aba = it },
            )
            fila?.let {
                FaixaDaFila(
                    fila = it,
                    aoParar = vm::pararFila,
                    modifier = Modifier.align(Alignment.BottomCenter),
                )
            }
        }
    }

    // Fora do Scaffold: vale para qualquer aba, já que a lixeira é acionada
    // de mais de uma.
    val andamento by vm.andamento.collectAsStateWithLifecycle()
    andamento?.let { AvisoDeAndamento(it) }
}

@Composable
private fun ConteudoDaAba(
    aba: Aba,
    vm: FaxinaViewModel,
    podeLerArquivos: Boolean,
    podeLerApps: Boolean,
    tema: Tema,
    aoTrocarTema: (Tema) -> Unit,
    aoTrocarAba: (Aba) -> Unit,
) {
    val conteudo = Modifier.fillMaxSize()

    // O diagnóstico é uma tela cheia dentro da aba Início, não uma sexta aba:
    // a barra do Material comporta cinco, e a sexta espremeria as outras.
    var noDiagnostico by remember { mutableStateOf(false) }

    // Levantado pelo alerta "Aplicativos parados" e baixado ao sair da aba, para
    // que só a chegada pelo alerta traga a lista filtrada.
    var focoEmEsquecidos by remember { mutableStateOf(false) }
    LaunchedEffect(aba) { if (aba != Aba.APPS) focoEmEsquecidos = false }
    if (aba == Aba.RESUMO && noDiagnostico) {
        TelaDiagnostico(
            vm = vm,
            aoVoltar = { noDiagnostico = false },
            aoIr = { destino ->
                noDiagnostico = false
                when (destino) {
                    AcaoSugerida.VER_ARQUIVOS -> aoTrocarAba(Aba.ARQUIVOS)
                    AcaoSugerida.VER_APPS -> {
                        focoEmEsquecidos = true
                        aoTrocarAba(Aba.APPS)
                    }
                    AcaoSugerida.VER_CACHE -> aoTrocarAba(Aba.CACHE)
                    AcaoSugerida.VER_LIXEIRA -> aoTrocarAba(Aba.LIXEIRA)
                    else -> Unit
                }
            },
            modifier = conteudo,
        )
        return
    }

    when (aba) {
        Aba.RESUMO -> TelaResumo(
            vm = vm,
            podeLerArquivos = podeLerArquivos,
            podeLerApps = podeLerApps,
            aoVerArquivos = { aoTrocarAba(Aba.ARQUIVOS) },
            aoVerApps = { aoTrocarAba(Aba.APPS) },
            aoVerDiagnostico = { noDiagnostico = true },
            tema = tema,
            aoTrocarTema = aoTrocarTema,
            modifier = conteudo,
        )

        Aba.ARQUIVOS -> TelaArquivos(vm = vm, modifier = conteudo)

        Aba.APPS -> TelaApps(
            vm = vm,
            podeLerApps = podeLerApps,
            iniciarEmEsquecidos = focoEmEsquecidos,
            modifier = conteudo,
        )

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
 * Teto de arquivos por envio.
 *
 * Não é escolha de gosto: o Intent viaja por Binder, cuja transação tem cerca
 * de 1 MB, e cada content:// custa algumas centenas de bytes já parcelado.
 * Passar do teto não dá erro tratável — derruba a transação. Melhor recusar
 * antes e dizer o número do que quebrar na entrega.
 */
const val LIMITE_DE_ENVIO = 200

/**
 * Manda os arquivos escolhidos para outro app — Drive, Fotos, Telegram, o que
 * estiver instalado.
 *
 * O caminho é a folha de compartilhamento do Android, e não a API do Drive, e
 * a diferença importa. A API exigiria projeto no Google Cloud, cliente OAuth
 * amarrado à assinatura do APK e uma tela de consentimento — tudo isso para
 * servir a um destino só. A folha entrega para qualquer nuvem instalada, com a
 * conta que o usuário já usa, e quem cuida de pasta, progresso e retomada é o
 * app de destino, que faz isso melhor do que este faria.
 *
 * O que ela não dá é confirmação: o Android não avisa se o envio terminou. Por
 * isso o Faxina nunca apaga nada depois de compartilhar — subir e apagar são
 * dois botões, e o segundo é sempre do usuário, depois de conferir.
 */
fun enviarArquivos(ctx: Context, caminhos: Collection<String>): Boolean {
    val arquivos = caminhos.map { java.io.File(it) }.filter { it.exists() }
    if (arquivos.isEmpty() || arquivos.size > LIMITE_DE_ENVIO) return false

    return try {
        val uris = ArrayList<android.net.Uri>(arquivos.size)
        for (arquivo in arquivos) {
            uris += androidx.core.content.FileProvider.getUriForFile(
                ctx,
                "${ctx.packageName}.arquivos",
                arquivo,
            )
        }

        // Tipo comum quando todos são do mesmo ramo (image/*, video/*); senão
        // */*. Acertar isso é o que faz o Drive e o Fotos aparecerem no topo
        // da folha em vez de sumirem no meio da lista.
        val ramos = arquivos.map { Miniaturas.mimeDe(it.name).substringBefore('/') }.toSet()
        val tipo = if (ramos.size == 1) "${ramos.first()}/*" else "*/*"

        val envio = Intent(Intent.ACTION_SEND_MULTIPLE)
            .setType(tipo)
            .putParcelableArrayListExtra(Intent.EXTRA_STREAM, uris)
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)

        ctx.startActivity(
            Intent.createChooser(envio, "Enviar ${arquivos.size} arquivo(s) para…")
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
        )
        true
    } catch (e: IllegalArgumentException) {
        false
    } catch (e: ActivityNotFoundException) {
        false
    } catch (e: SecurityException) {
        false
    }
}

/**
 * Tenta abrir cada tela da lista até uma responder.
 *
 * A tela de armazenamento de um app é uma atividade interna de Configurações e
 * cada fabricante monta a sua, então não há um alvo único que funcione em todo
 * aparelho. Componente inexistente e componente fechado levantam exceções
 * diferentes, e as duas significam a mesma coisa aqui: tente a próxima.
 */
fun abrirPrimeiroQuePuder(ctx: Context, telas: List<Intent>): Boolean {
    for (tela in telas) {
        try {
            ctx.startActivity(Intent(tela).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            return true
        } catch (e: Exception) {
            // próxima
        }
    }
    return false
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
