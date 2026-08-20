package com.bahiense.faxina

import android.app.Application
import android.content.Context
import android.content.Intent
import android.os.Environment
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File

data class Recado(val texto: String, val ehErro: Boolean = false)

/**
 * Uma sequência de apps para limpar o cache, um após o outro.
 *
 * Existe porque a limpeza automática de verdade depende do serviço de
 * acessibilidade, que o Play Protect impede de instalar. Sem ele, ninguém
 * aperta o botão pelo usuário — mas dá para tirar dele todo o resto: escolher
 * o app, achar a tela, voltar para a lista, procurar o próximo. Sobra tocar
 * "Limpar cache" e voltar.
 */
data class FilaGuiada(
    val restantes: List<AppInstalado>,
    val feitos: Int,
    val total: Int,
    /** true = mostrando o aviso do próximo; false = a tela do app está aberta. */
    val esperandoAbrir: Boolean,
) {
    val atual: AppInstalado? get() = restantes.firstOrNull()
}

class FaxinaViewModel(app: Application) : AndroidViewModel(app) {

    // Guardado à parte porque getApplication() é genérico e não infere sozinho
    // quando o parâmetro esperado é só um Context.
    private val ctx: Context = app.applicationContext

    val raiz: File = Environment.getExternalStorageDirectory()

    private val _varredura = MutableStateFlow<EstadoVarredura>(EstadoVarredura.Ocioso)
    val varredura = _varredura.asStateFlow()

    private val _selecionados = MutableStateFlow<Set<String>>(emptySet())
    val selecionados = _selecionados.asStateFlow()

    private val _apps = MutableStateFlow<List<AppInstalado>>(emptyList())
    val apps = _apps.asStateFlow()

    private val _carregandoApps = MutableStateFlow(false)
    val carregandoApps = _carregandoApps.asStateFlow()

    private val _uso = MutableStateFlow(UsoDoAparelho(0L, 0L))
    val uso = _uso.asStateFlow()

    private val _naLixeira = MutableStateFlow<List<Lixeira.Item>>(emptyList())
    val naLixeira = _naLixeira.asStateFlow()

    private val _recado = MutableStateFlow<Recado?>(null)
    val recado = _recado.asStateFlow()

    private val _ocupado = MutableStateFlow(false)
    val ocupado = _ocupado.asStateFlow()

    /** Não-nulo enquanto uma operação de lixeira está em curso. */
    private val _andamento = MutableStateFlow<Lixeira.Andamento?>(null)
    val andamento = _andamento.asStateFlow()

    private val _cache = MutableStateFlow(CacheDoSistema.Medida(0L, 0L))
    val cache = _cache.asStateFlow()

    private val _limpandoCache = MutableStateFlow(false)
    val limpandoCache = _limpandoCache.asStateFlow()

    init {
        atualizarUso()
        atualizarLixeira()
        atualizarCache()
    }

    /*
     * As três leituras de partida rodam antes de a primeira tela aparecer. Uma
     * exceção aqui escapa pelo viewModelScope e derruba o processo — o app
     * "abre e fecha" sem nunca desenhar nada. Nenhuma delas vale isso: sem o
     * número, a tela mostra zero e segue.
     */
    fun atualizarUso() {
        viewModelScope.launch {
            _uso.value = withContext(Dispatchers.IO) {
                runCatching { AppsInstalados.uso(ctx) }.getOrDefault(UsoDoAparelho(0L, 0L))
            }
        }
    }

    fun atualizarLixeira() {
        viewModelScope.launch {
            _naLixeira.value = withContext(Dispatchers.IO) {
                runCatching { Lixeira.listar(raiz) }.getOrDefault(emptyList())
            }
        }
    }

    fun descartarRecado() {
        _recado.value = null
    }

    /** Para telas que precisam falar algo sem passar por uma ação do ViewModel. */
    fun avisar(texto: String, ehErro: Boolean = false) {
        _recado.value = Recado(texto, ehErro)
    }

    // -- varredura ----------------------------------------------------------

    fun varrer() {
        if (_varredura.value is EstadoVarredura.Rodando) return

        viewModelScope.launch {
            _varredura.value = EstadoVarredura.Rodando(Progresso("Preparando"))
            try {
                val resultado = withContext(Dispatchers.IO) {
                    Escaner(raiz).varrer { progresso ->
                        _varredura.value = EstadoVarredura.Rodando(progresso)
                    }
                }
                // Só o que é seguro apagar já vem marcado; o resto o usuário decide.
                _selecionados.value = resultado.caminhosPreSelecionados
                _varredura.value = EstadoVarredura.Pronto(resultado)
            } catch (e: Exception) {
                _varredura.value = EstadoVarredura.Falhou(e.message ?: "Erro desconhecido")
            }
            atualizarUso()
        }
    }

    // -- seleção ------------------------------------------------------------

    fun alternar(caminho: String) {
        _selecionados.value = _selecionados.value.toMutableSet().apply {
            if (!add(caminho)) remove(caminho)
        }
    }

    fun marcar(caminhos: List<String>, marcado: Boolean) {
        _selecionados.value = _selecionados.value.toMutableSet().apply {
            if (marcado) addAll(caminhos) else removeAll(caminhos.toSet())
        }
    }

    fun bytesSelecionados(): Long {
        val pronto = _varredura.value as? EstadoVarredura.Pronto ?: return 0L
        return pronto.resultado.bytesUnicos(_selecionados.value)
    }

    // -- ações destrutivas --------------------------------------------------

    fun moverParaLixeira() {
        enviarParaLixeira(_selecionados.value, limparSelecao = true)
    }

    /**
     * Manda um conjunto avulso para a lixeira.
     *
     * Separado da seleção da aba Arquivos de propósito: a tela de detalhe de um
     * app apaga os arquivos dele, e nada mais. Reaproveitar _selecionados aqui
     * levaria junto o que estivesse marcado na outra aba, sem o usuário pedir.
     */
    fun enviarParaLixeira(caminhos: Set<String>, limparSelecao: Boolean = false) {
        if (caminhos.isEmpty() || _ocupado.value) return

        viewModelScope.launch {
            _ocupado.value = true
            _andamento.value = Lixeira.Andamento(0, caminhos.size, "preparando")

            val balanco = withContext(Dispatchers.IO) {
                Lixeira.mover(ctx, raiz, caminhos) { _andamento.value = it }
            }

            // Miniatura é indexada por caminho; com os arquivos em outro lugar,
            // um caminho reaproveitado mostraria a capa do arquivo anterior.
            Miniaturas.esquecerTudo()

            /*
             * O que saiu do disco não pode continuar em nenhuma das duas vistas.
             *
             * A filtragem é por conjunto de caminhos, e não por File.exists(),
             * porque este trecho roda na thread da interface: com dezenas de
             * milhares de mídias na lista, perguntar ao disco por cada uma
             * congelava o app inteiro no momento do envio para a lixeira. A
             * resposta já veio pronta de quem moveu os arquivos.
             */
            val pronto = _varredura.value as? EstadoVarredura.Pronto
            if (pronto != null) {
                val saiu = balanco.caminhosMovidos
                _varredura.value = EstadoVarredura.Pronto(
                    pronto.resultado.copy(
                        achados = pronto.resultado.achados.filterNot { it.caminho in saiu },
                        midias = pronto.resultado.midias.filterNot { it.caminho in saiu },
                    ),
                )
            }
            if (limparSelecao) _selecionados.value = emptySet()

            _recado.value = if (balanco.falhas.isEmpty()) {
                Recado(
                    "${balanco.quantidade} item(ns) na lixeira, ${formatarBytes(balanco.bytes)}. " +
                        "O espaço só é liberado ao esvaziar.",
                )
            } else {
                Recado(
                    "${balanco.quantidade} item(ns) movido(s). ${balanco.falhas.size} não " +
                        "saíram do lugar (o sistema recusou).",
                    ehErro = true,
                )
            }

            _andamento.value = null
            _ocupado.value = false
            atualizarLixeira()
            atualizarUso()
        }
    }

    fun restaurarTudo() = restaurar(_naLixeira.value)

    /**
     * Devolve ao lugar de origem os itens escolhidos.
     *
     * Recebe a lista em vez de mexer sempre na lixeira inteira porque, depois
     * que a tela passou a mostrar miniaturas, o caso comum deixou de ser
     * "restaurar tudo": é olhar a grade, achar as três fotos que não deviam
     * ter entrado e trazer só elas de volta.
     */
    fun restaurar(itens: List<Lixeira.Item>) {
        if (_ocupado.value || itens.isEmpty()) return
        viewModelScope.launch {
            _ocupado.value = true
            _andamento.value = Lixeira.Andamento(0, itens.size, "preparando")
            val balanco = withContext(Dispatchers.IO) {
                Lixeira.restaurar(ctx, raiz, itens) { _andamento.value = it }
            }
            Miniaturas.esquecerTudo()
            _recado.value = Recado("${balanco.quantidade} item(ns) de volta ao lugar de origem.")
            _andamento.value = null
            _ocupado.value = false
            atualizarLixeira()
            atualizarUso()
        }
    }

    fun esvaziarLixeira() {
        if (_ocupado.value) return
        viewModelScope.launch {
            _ocupado.value = true
            _andamento.value = Lixeira.Andamento(0, _naLixeira.value.size, "preparando")
            val balanco = withContext(Dispatchers.IO) {
                Lixeira.esvaziar(ctx, raiz) { _andamento.value = it }
            }
            // Aqui o espaço volta de verdade — é um dos dois lugares que somam
            // no histórico. Mandar para a lixeira não soma: o byte só mudou de
            // pasta.
            Historico.somar(ctx, balanco.bytes)
            _liberadoAoTodo.value = Historico.total(ctx)
            _recado.value = Recado(
                "${formatarBytes(balanco.bytes)} liberados de vez em " +
                    "${balanco.quantidade} arquivo(s).",
            )
            _andamento.value = null
            _ocupado.value = false
            atualizarLixeira()
            atualizarUso()
        }
    }

    // -- apps ---------------------------------------------------------------

    fun carregarApps() {
        if (_carregandoApps.value) return
        viewModelScope.launch {
            _carregandoApps.value = true
            _apps.value = withContext(Dispatchers.IO) {
                runCatching { AppsInstalados.listar(ctx) }.getOrDefault(emptyList())
            }
            _carregandoApps.value = false
        }
    }

    // -- diagnóstico ----------------------------------------------------------

    private val _diagnostico = MutableStateFlow<List<Verificacao>>(emptyList())
    val diagnostico = _diagnostico.asStateFlow()

    fun diagnosticar() {
        viewModelScope.launch {
            val apps = _apps.value
            val uso = _uso.value
            val naLixeira = _naLixeira.value.sumOf { it.tamanho }
            _diagnostico.value = withContext(Dispatchers.IO) {
                runCatching { Diagnostico.verificar(ctx, uso, apps, naLixeira) }
                    .getOrDefault(emptyList())
            }
        }
    }

    // -- detalhe de um app ---------------------------------------------------

    private val _retrato = MutableStateFlow<ArquivosDeApps.Retrato?>(null)
    val retrato = _retrato.asStateFlow()

    private val _vasculhando = MutableStateFlow(false)
    val vasculhando = _vasculhando.asStateFlow()

    private val _perfil = MutableStateFlow<PerfilDeApps.Perfil?>(null)
    val perfil = _perfil.asStateFlow()

    fun vasculharApp(pacote: String) {
        viewModelScope.launch {
            _perfil.value = withContext(Dispatchers.IO) {
                runCatching { PerfilDeApps.ler(ctx, pacote) }.getOrNull()
            }
            _vasculhando.value = true
            _retrato.value = null
            _retrato.value = withContext(Dispatchers.IO) {
                runCatching { ArquivosDeApps.vasculhar(pacote, raiz) }.getOrNull()
            }
            _vasculhando.value = false
        }
    }

    fun esquecerRetrato() {
        _perfil.value = null
        _retrato.value = null
    }

    // -- fila guiada ---------------------------------------------------------

    private val _fila = MutableStateFlow<FilaGuiada?>(null)
    val fila = _fila.asStateFlow()

    fun iniciarFilaGuiada(apps: List<AppInstalado>) {
        if (apps.isEmpty() || _fila.value != null) return
        _fila.value = FilaGuiada(
            restantes = apps,
            feitos = 0,
            total = apps.size,
            esperandoAbrir = true,
        )
    }

    /** Abre a tela do app da vez. A tela chama isto depois do aviso do próximo. */
    fun abrirAppDaFila() {
        val fila = _fila.value ?: return
        val alvo = fila.atual ?: run { encerrarFila(); return }
        _fila.value = fila.copy(esperandoAbrir = false)
        if (!abrirArmazenamentoDe(alvo.pacote)) {
            avisar("Não foi possível abrir a tela de ${alvo.nome}.", ehErro = true)
            pararFila()
        }
    }

    /**
     * Voltou de Configurações: conta o app como feito e prepara o próximo.
     *
     * Não há como saber se o botão foi realmente tocado — o sistema não conta
     * isso a ninguém. O balanço do fim usa o cache medido antes e depois, que
     * é o número honesto.
     */
    fun retomarFilaGuiada() {
        val fila = _fila.value ?: return
        if (fila.esperandoAbrir) return

        val restantes = fila.restantes.drop(1)
        if (restantes.isEmpty()) {
            encerrarFila()
            return
        }
        _fila.value = fila.copy(
            restantes = restantes,
            feitos = fila.feitos + 1,
            esperandoAbrir = true,
        )
    }

    fun pararFila() {
        val fila = _fila.value ?: return
        _fila.value = null
        avisar("Sequência interrompida em ${fila.feitos} de ${fila.total}.")
        atualizarCache()
        atualizarUso()
        carregarApps()
    }

    private fun encerrarFila() {
        val fila = _fila.value
        _fila.value = null
        if (fila != null) avisar("Sequência concluída: ${fila.total} apps visitados.")
        atualizarCache()
        atualizarUso()
        carregarApps()
    }

    private fun abrirArmazenamentoDe(pacote: String): Boolean =
        abrirPrimeiroQuePuder(ctx, Permissoes.telasDeArmazenamentoDoApp(pacote))

    // -- pasta aberta ----------------------------------------------------------

    private val _pasta = MutableStateFlow<Pastas.Conteudo?>(null)
    val pasta = _pasta.asStateFlow()

    private val _lendoPasta = MutableStateFlow(false)
    val lendoPasta = _lendoPasta.asStateFlow()

    fun abrirPasta(relativo: String) {
        viewModelScope.launch {
            _lendoPasta.value = true
            _pasta.value = withContext(Dispatchers.IO) {
                runCatching { Pastas.ler(raiz, relativo) }.getOrNull()
            }
            _lendoPasta.value = false
        }
    }

    fun fecharPasta() {
        _pasta.value = null
    }

    // -- histórico -------------------------------------------------------------

    private val _liberadoAoTodo = MutableStateFlow(Historico.total(ctx))
    val liberadoAoTodo = _liberadoAoTodo.asStateFlow()

    // -- cache ---------------------------------------------------------------

    /** Botão único da tela inicial: libera o cache que o sistema deixar e varre em seguida. */
    fun limpezaRapida() {
        if (_limpandoCache.value) return
        viewModelScope.launch {
            _limpandoCache.value = true
            val faxinada = withContext(Dispatchers.IO) {
                runCatching { CacheDoSistema.liberar(ctx) }
                    .getOrDefault(CacheDoSistema.Faxinada(0L))
            }
            _limpandoCache.value = false
            Historico.somar(ctx, faxinada.bytes)
            _liberadoAoTodo.value = Historico.total(ctx)

            _recado.value = if (faxinada.bytes > 0) {
                Recado("${formatarBytes(faxinada.bytes)} de cache liberados. Agora os arquivos…")
            } else {
                Recado("Cache já estava enxuto. Vendo os arquivos…")
            }

            atualizarCache()
            varrer()
        }
    }

    fun atualizarCache() {
        viewModelScope.launch {
            _cache.value = withContext(Dispatchers.IO) {
                runCatching { CacheDoSistema.medir(ctx) }
                    .getOrDefault(CacheDoSistema.Medida(0L, 0L))
            }
        }
    }

    fun limparCache() {
        if (_limpandoCache.value) return
        viewModelScope.launch {
            _limpandoCache.value = true
            val faxinada = withContext(Dispatchers.IO) { CacheDoSistema.liberar(ctx) }
            Historico.somar(ctx, faxinada.bytes)
            _liberadoAoTodo.value = Historico.total(ctx)

            _recado.value = when {
                faxinada.erro != null -> Recado(faxinada.erro, ehErro = true)
                faxinada.bytes <= 0L -> Recado(
                    "O sistema não achou cache que valesse apagar agora. " +
                        "Para casos específicos, use a lista abaixo.",
                )
                else -> Recado("${formatarBytes(faxinada.bytes)} de cache liberados.")
            }

            _limpandoCache.value = false
            atualizarCache()
            atualizarUso()
            // Os tamanhos de cache por app mudaram; a lista velha viraria mentira.
            if (_apps.value.isNotEmpty()) carregarApps()
        }
    }
}
