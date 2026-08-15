package com.bahiense.faxina

import android.app.Application
import android.content.Context
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

    private val _cache = MutableStateFlow(CacheDoSistema.Medida(0L, 0L))
    val cache = _cache.asStateFlow()

    private val _limpandoCache = MutableStateFlow(false)
    val limpandoCache = _limpandoCache.asStateFlow()

    init {
        atualizarUso()
        atualizarLixeira()
        atualizarCache()
    }

    fun atualizarUso() {
        viewModelScope.launch {
            _uso.value = withContext(Dispatchers.IO) { AppsInstalados.uso(ctx) }
        }
    }

    fun atualizarLixeira() {
        viewModelScope.launch {
            _naLixeira.value = withContext(Dispatchers.IO) { Lixeira.listar(raiz) }
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
        val caminhos = _selecionados.value
        if (caminhos.isEmpty() || _ocupado.value) return

        viewModelScope.launch {
            _ocupado.value = true
            val balanco = withContext(Dispatchers.IO) {
                Lixeira.mover(ctx, raiz, caminhos)
            }

            // Miniatura é indexada por caminho; com os arquivos em outro lugar,
            // um caminho reaproveitado mostraria a capa do arquivo anterior.
            Miniaturas.esquecerTudo()

            // O que saiu do disco não pode continuar na lista de achados.
            val pronto = _varredura.value as? EstadoVarredura.Pronto
            if (pronto != null) {
                val sobraram = pronto.resultado.achados.filter { File(it.caminho).exists() }
                _varredura.value =
                    EstadoVarredura.Pronto(pronto.resultado.copy(achados = sobraram))
            }
            _selecionados.value = emptySet()

            _recado.value = if (balanco.falhas.isEmpty()) {
                Recado(
                    "${balanco.movidos} item(ns) na lixeira, ${formatarBytes(balanco.bytes)}. " +
                        "O espaço só é liberado ao esvaziar.",
                )
            } else {
                Recado(
                    "${balanco.movidos} item(ns) movido(s). ${balanco.falhas.size} não " +
                        "saíram do lugar (o sistema recusou).",
                    ehErro = true,
                )
            }

            _ocupado.value = false
            atualizarLixeira()
            atualizarUso()
        }
    }

    fun restaurarTudo() {
        if (_ocupado.value) return
        viewModelScope.launch {
            _ocupado.value = true
            val itens = _naLixeira.value
            val balanco = withContext(Dispatchers.IO) {
                Lixeira.restaurar(ctx, raiz, itens)
            }
            Miniaturas.esquecerTudo()
            _recado.value = Recado("${balanco.movidos} item(ns) de volta ao lugar de origem.")
            _ocupado.value = false
            atualizarLixeira()
            atualizarUso()
        }
    }

    fun esvaziarLixeira() {
        if (_ocupado.value) return
        viewModelScope.launch {
            _ocupado.value = true
            val balanco = withContext(Dispatchers.IO) {
                Lixeira.esvaziar(ctx, raiz)
            }
            _recado.value = Recado(
                "${formatarBytes(balanco.bytes)} liberados de vez em ${balanco.movidos} arquivo(s).",
            )
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
            _apps.value = withContext(Dispatchers.IO) { AppsInstalados.listar(ctx) }
            _carregandoApps.value = false
        }
    }

    // -- cache ---------------------------------------------------------------

    fun atualizarCache() {
        viewModelScope.launch {
            _cache.value = withContext(Dispatchers.IO) { CacheDoSistema.medir(ctx) }
        }
    }

    fun limparCache() {
        if (_limpandoCache.value) return
        viewModelScope.launch {
            _limpandoCache.value = true
            val faxinada = withContext(Dispatchers.IO) { CacheDoSistema.liberar(ctx) }

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
