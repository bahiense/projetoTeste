package com.bahiense.espalhe

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * Onde ficam os acessos às contas (tokens, chaves do app do TikTok). Cada valor
 * é cifrado com AES-GCM por uma chave que mora no Android Keystore: ela nunca
 * sai do chip de segurança do aparelho, então copiar a pasta do app (por backup,
 * root ou cabo) entrega só texto cifrado, inútil em outro lugar.
 *
 * Um valor que não decifra (chave apagada ao trocar o bloqueio de tela em alguns
 * aparelhos, arquivo adulterado) é tratado como ausente: o perfil só pede para
 * ligar de novo.
 */
class Cofre(context: Context, nome: String) {

    private val prefs = context.getSharedPreferences(nome, Context.MODE_PRIVATE)

    fun getString(chave: String, padrao: String?): String? {
        val guardado = prefs.getString(chave, null) ?: return padrao
        return try {
            val bytes = Base64.decode(guardado, Base64.NO_WRAP)
            val c = Cipher.getInstance(CIFRA)
            c.init(Cipher.DECRYPT_MODE, chave(), GCMParameterSpec(128, bytes, 0, IV))
            // o nome do campo entra como dado autenticado: um valor não pode ser
            // trocado de lugar com outro dentro do arquivo
            c.updateAAD(chave.toByteArray())
            String(c.doFinal(bytes, IV, bytes.size - IV), Charsets.UTF_8)
        } catch (e: Exception) {
            remove(chave)
            padrao
        }
    }

    fun put(chave: String, valor: String) {
        val c = Cipher.getInstance(CIFRA)
        c.init(Cipher.ENCRYPT_MODE, chave())
        c.updateAAD(chave.toByteArray())
        val cifrado = c.doFinal(valor.toByteArray(Charsets.UTF_8))
        prefs.edit().putString(chave, Base64.encodeToString(c.iv + cifrado, Base64.NO_WRAP)).apply()
    }

    fun remove(chave: String) {
        prefs.edit().remove(chave).apply()
    }

    fun limpar() {
        prefs.edit().clear().apply()
    }

    @Synchronized
    private fun chave(): SecretKey {
        val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (ks.getKey(ALIAS, null) as SecretKey?)?.let { return it }
        val gerador = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        gerador.init(
            KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .build()
        )
        return gerador.generateKey()
    }

    companion object {
        private const val ALIAS = "espalhe_cofre"
        private const val CIFRA = "AES/GCM/NoPadding"
        private const val IV = 12
    }
}
