package com.bahiense.rede

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.util.concurrent.Executors

/**
 * VPN local que só intercepta o DNS.
 *
 * O aparelho passa a mandar toda consulta de DNS para um endereço nosso
 * (10.111.222.2). Lemos a pergunta, e:
 *   - se o domínio está na lista, respondemos "não existe" (NXDOMAIN), então o
 *     site simplesmente não abre;
 *   - se não está, repassamos a pergunta a um resolvedor de verdade e
 *     devolvemos a resposta.
 *
 * O resto do tráfego (tudo que não é DNS) não passa por aqui, então a conexão
 * comum do celular continua normal.
 */
class FiltroVpnService : VpnService() {

    private var tun: ParcelFileDescriptor? = null
    @Volatile private var rodando = false
    private var thread: Thread? = null
    private val pool = Executors.newFixedThreadPool(8)
    private val escrita = Any()
    private lateinit var lista: Blocklist

    companion object {
        private const val ADDR_CLIENTE = "10.111.222.1"
        private const val ADDR_DNS = "10.111.222.2"
        private const val UPSTREAM = "1.1.1.1"
        private const val CANAL = "rede_sistema"
        private const val NOTIF_ID = 42
        @Volatile var ativo = false; private set

        fun iniciar(ctx: Context) {
            val i = Intent(ctx, FiltroVpnService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) ctx.startForegroundService(i)
            else ctx.startService(i)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        emPrimeiroPlano()
        if (rodando) return START_STICKY
        rodando = true
        thread = Thread { laco() }.also { it.start() }
        return START_STICKY
    }

    private fun emPrimeiroPlano() {
        val nm = getSystemService(NotificationManager::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val canal = NotificationChannel(CANAL, getString(R.string.canal_nome), NotificationManager.IMPORTANCE_MIN)
            canal.setShowBadge(false)
            nm.createNotificationChannel(canal)
        }
        val abrir = PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        val n: Notification = Notification.Builder(this, CANAL)
            .setContentTitle(getString(R.string.notif_titulo))
            .setContentText(getString(R.string.notif_texto))
            .setSmallIcon(R.drawable.ic_fg)
            .setContentIntent(abrir)
            .setOngoing(true)
            .build()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(NOTIF_ID, n, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        } else {
            startForeground(NOTIF_ID, n)
        }
    }

    private fun laco() {
        try {
            lista = Blocklist.carregar(this)
        } catch (e: Exception) {
            rodando = false
            stopSelf()
            return
        }

        val b = Builder()
            .setSession("Rede")
            .setMtu(1500)
            .addAddress(ADDR_CLIENTE, 24)
            .addDnsServer(ADDR_DNS)
            // só capturamos o tráfego destinado ao nosso DNS
            .addRoute(ADDR_DNS, 32)
        try {
            // o próprio app não deve passar pela VPN (evita laço no repasse)
            b.addDisallowedApplication(packageName)
        } catch (_: Exception) {}

        val pfd = b.establish() ?: run {
            rodando = false
            stopSelf()
            return
        }
        tun = pfd
        ativo = true

        val entrada = FileInputStream(pfd.fileDescriptor)
        val saida = FileOutputStream(pfd.fileDescriptor)
        val buf = ByteArray(32767)
        try {
            while (rodando) {
                val len = entrada.read(buf)
                if (len <= 0) continue
                val pacote = buf.copyOf(len)
                pool.execute { tratar(pacote, saida) }
            }
        } catch (_: Exception) {
        } finally {
            ativo = false
            try { pfd.close() } catch (_: Exception) {}
        }
    }

    private fun tratar(p: ByteArray, saida: FileOutputStream) {
        try {
            if (p.size < 28) return
            val versao = (p[0].toInt() ushr 4) and 0x0F
            if (versao != 4) return
            val ihl = (p[0].toInt() and 0x0F) * 4
            if (p[9].toInt() and 0xFF != 17) return // só UDP
            val udp = ihl
            val dstPort = ((p[udp + 2].toInt() and 0xFF) shl 8) or (p[udp + 3].toInt() and 0xFF)
            if (dstPort != 53) return

            val dnsOff = udp + 8
            if (dnsOff + 12 > p.size) return

            val srcIp = p.copyOfRange(12, 16)
            val srcPort = ((p[udp].toInt() and 0xFF) shl 8) or (p[udp + 1].toInt() and 0xFF)

            val host = lerQName(p, dnsOff + 12)

            if (host != null && lista.isBlocked(host)) {
                val resp = montarNxdomain(p, ihl, dnsOff)
                synchronized(escrita) { saida.write(resp); saida.flush() }
                return
            }

            // repassa a consulta a um resolvedor de verdade
            val payload = p.copyOfRange(dnsOff, p.size)
            val respostaDns = repassar(payload) ?: return
            val pacoteResp = montarUdp(
                srcIp = byteArrayOf(10, 111.toByte(), 222.toByte(), 2),
                srcPort = 53,
                dstIp = srcIp,
                dstPort = srcPort,
                payload = respostaDns
            )
            synchronized(escrita) { saida.write(pacoteResp); saida.flush() }
        } catch (_: Exception) {
        }
    }

    /** Lê o nome do domínio (QNAME) da pergunta DNS. */
    private fun lerQName(p: ByteArray, inicio: Int): String? {
        val sb = StringBuilder()
        var i = inicio
        var voltas = 0
        while (i < p.size) {
            val len = p[i].toInt() and 0xFF
            if (len == 0) break
            if (len and 0xC0 != 0) return null // ponteiro de compressão: não em pergunta
            i++
            if (i + len > p.size) return null
            if (sb.isNotEmpty()) sb.append('.')
            for (k in 0 until len) sb.append((p[i + k].toInt() and 0xFF).toChar())
            i += len
            if (++voltas > 127) return null
        }
        return if (sb.isEmpty()) null else sb.toString()
    }

    /** Monta uma resposta NXDOMAIN reaproveitando o pacote da pergunta. */
    private fun montarNxdomain(req: ByteArray, ihl: Int, dnsOff: Int): ByteArray {
        val out = req.copyOf()
        // trocar IP de origem e destino
        for (k in 0 until 4) {
            val tmp = out[12 + k]; out[12 + k] = out[16 + k]; out[16 + k] = tmp
        }
        // trocar portas UDP
        for (k in 0 until 2) {
            val tmp = out[ihl + k]; out[ihl + k] = out[ihl + 2 + k]; out[ihl + 2 + k] = tmp
        }
        // flags DNS: QR=1, RD copiado, RA=1, RCODE=3 (NXDOMAIN)
        out[dnsOff + 2] = (0x81).toByte()
        out[dnsOff + 3] = (0x83).toByte()
        // ANCOUNT/NSCOUNT/ARCOUNT = 0
        out[dnsOff + 6] = 0; out[dnsOff + 7] = 0
        out[dnsOff + 8] = 0; out[dnsOff + 9] = 0
        out[dnsOff + 10] = 0; out[dnsOff + 11] = 0
        // trocar portas mudou o pacote; zerar o checksum UDP (opcional em IPv4)
        // para a resposta não ser descartada por checksum velho
        out[ihl + 6] = 0; out[ihl + 7] = 0
        corrigirChecksums(out, ihl)
        return out
    }

    /** Monta um pacote IPv4/UDP do zero. */
    private fun montarUdp(srcIp: ByteArray, srcPort: Int, dstIp: ByteArray, dstPort: Int, payload: ByteArray): ByteArray {
        val total = 20 + 8 + payload.size
        val out = ByteArray(total)
        out[0] = 0x45
        out[1] = 0
        out[2] = ((total ushr 8) and 0xFF).toByte()
        out[3] = (total and 0xFF).toByte()
        out[4] = 0; out[5] = 0
        out[6] = 0x40; out[7] = 0 // don't fragment
        out[8] = 64 // TTL
        out[9] = 17 // UDP
        // checksum (10,11) depois
        System.arraycopy(srcIp, 0, out, 12, 4)
        System.arraycopy(dstIp, 0, out, 16, 4)
        val udp = 20
        out[udp] = ((srcPort ushr 8) and 0xFF).toByte()
        out[udp + 1] = (srcPort and 0xFF).toByte()
        out[udp + 2] = ((dstPort ushr 8) and 0xFF).toByte()
        out[udp + 3] = (dstPort and 0xFF).toByte()
        val udpLen = 8 + payload.size
        out[udp + 4] = ((udpLen ushr 8) and 0xFF).toByte()
        out[udp + 5] = (udpLen and 0xFF).toByte()
        out[udp + 6] = 0; out[udp + 7] = 0 // checksum UDP opcional em IPv4
        System.arraycopy(payload, 0, out, udp + 8, payload.size)
        corrigirChecksums(out, 20)
        return out
    }

    /** Recalcula o checksum do cabeçalho IP (o do UDP fica 0, que é válido). */
    private fun corrigirChecksums(p: ByteArray, ihl: Int) {
        p[10] = 0; p[11] = 0
        var soma = 0L
        var i = 0
        while (i < ihl) {
            val palavra = ((p[i].toInt() and 0xFF) shl 8) or (p[i + 1].toInt() and 0xFF)
            soma += palavra.toLong()
            i += 2
        }
        while (soma shr 16 != 0L) soma = (soma and 0xFFFF) + (soma shr 16)
        val cs = soma.inv().toInt() and 0xFFFF
        p[10] = ((cs ushr 8) and 0xFF).toByte()
        p[11] = (cs and 0xFF).toByte()
    }

    private fun repassar(payload: ByteArray): ByteArray? {
        var sock: DatagramSocket? = null
        return try {
            sock = DatagramSocket()
            protect(sock)
            sock.soTimeout = 4000
            val alvo = InetAddress.getByName(UPSTREAM)
            sock.send(DatagramPacket(payload, payload.size, alvo, 53))
            val resp = ByteArray(2048)
            val dp = DatagramPacket(resp, resp.size)
            sock.receive(dp)
            resp.copyOf(dp.length)
        } catch (_: Exception) {
            null
        } finally {
            try { sock?.close() } catch (_: Exception) {}
        }
    }

    override fun onDestroy() {
        rodando = false
        ativo = false
        try { thread?.interrupt() } catch (_: Exception) {}
        try { tun?.close() } catch (_: Exception) {}
        try { pool.shutdownNow() } catch (_: Exception) {}
        super.onDestroy()
    }

    // reinicia sozinho se o sistema encerrar o serviço
    override fun onRevoke() {
        // o usuário revogou a VPN nas configurações; tentamos religar
        rodando = false
        ativo = false
        try { tun?.close() } catch (_: Exception) {}
        iniciar(applicationContext)
        super.onRevoke()
    }
}
