plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

/*
 * Para as métricas do YouTube: o ID do cliente OAuth (tipo Android) da sua
 * conta Google, em gradle.properties (googleClienteId). Vazio é previsto: o
 * app funciona e só o YouTube fica sem números, com a explicação na tela.
 * Não é segredo — cliente Android não tem senha; o que o protege é o pacote
 * mais a assinatura do APK.
 *
 * voltaTikTok é a página que devolve o login do TikTok ao app (espalhe-volta/
 * no GitHub Pages deste repositório). Dá para trocar dentro do app também.
 */
val googleClienteId = (project.findProperty("googleClienteId") as String? ?: "").trim()
val voltaTikTok = (project.findProperty("voltaTikTok") as String? ?: "").trim()

/*
 * O servidor do Espalhe (espalhe-servidor/, um Cloudflare Worker): é ele que
 * deixa ligar as métricas com um toque, "Entrar com o Instagram". O endereço vem
 * da variável ESPALHE_SERVIDOR do repositório (o workflow passa) ou de
 * gradle.properties. Vazio = sem o botão, só o modo manual.
 */
val servidor = (System.getenv("ESPALHE_SERVIDOR") ?: project.findProperty("servidor") as String? ?: "")
    .trim().trimEnd('/')
    .also { require(it.isEmpty() || it.startsWith("https://")) { "O servidor precisa ser https://" } }

android {
    namespace = "com.bahiense.espalhe"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.bahiense.espalhe"
        // 28: o ImageDecoder já aplica a rotação da foto (EXIF) sozinho
        minSdk = 28
        targetSdk = 35
        // o workflow numera cada build (GITHUB_RUN_NUMBER): é assim que o app sabe
        // que existe uma versão mais nova para oferecer no botão "Atualizar"
        val build = (System.getenv("GITHUB_RUN_NUMBER") ?: "0").toInt()
        versionCode = 100 + build
        versionName = "1.$build"

        buildConfigField("String", "GOOGLE_CLIENTE_ID", "\"" + googleClienteId + "\"")
        buildConfigField("String", "VOLTA_TIKTOK", "\"" + voltaTikTok + "\"")
        buildConfigField("String", "SERVIDOR", "\"" + servidor + "\"")

        /*
         * O Google só devolve o login para o ID do cliente ao contrário, e um
         * <data android:scheme> no manifesto não aceita curinga. Sem cliente vai
         * um esquema que ninguém chama — o filtro existe e fica inerte.
         */
        manifestPlaceholders["esquemaLogin"] =
            if (googleClienteId.isEmpty()) "com.bahiense.espalhe.semcliente"
            else "com.googleusercontent.apps." +
                googleClienteId.removeSuffix(".apps.googleusercontent.com")
    }

    buildFeatures {
        buildConfig = true
    }

    /*
     * A chave que assina o APK NÃO fica no repositório: ele é público, e quem
     * tivesse a chave poderia montar um APK falso que o Android aceitaria como
     * atualização do Espalhe — herdando os acessos às contas guardados nele.
     * Ela vem de segredos do GitHub (ESPALHE_KEYSTORE_B64 e ESPALHE_KEYSTORE_SENHA),
     * que o workflow decodifica e passa por variável de ambiente.
     *
     * Sem a chave (build de quem clonou, ou antes de cadastrar os segredos), o
     * release sai com a chave de depuração da máquina: serve para conferir que
     * compila, e o workflow não publica esse APK.
     */
    val chaveArquivo = System.getenv("ESPALHE_KEYSTORE").orEmpty()
    val chaveSenha = System.getenv("ESPALHE_KEYSTORE_SENHA").orEmpty()
    val temChave = chaveArquivo.isNotEmpty() && file(chaveArquivo).exists() && chaveSenha.isNotEmpty()
    signingConfigs {
        if (temChave) create("estavel") {
            storeFile = file(chaveArquivo)
            storePassword = chaveSenha
            keyAlias = "espalhe"
            keyPassword = chaveSenha
        }
    }

    buildTypes {
        release {
            // release, e não debug: um APK de depuração deixa qualquer um com um cabo
            // USB copiar os dados do app (run-as)
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName(if (temChave) "estavel" else "debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.core:core:1.13.1")
    // recorta e redimensiona o vídeo no próprio aparelho, com o codificador de hardware
    implementation("androidx.media3:media3-transformer:1.4.1")
    implementation("androidx.media3:media3-effect:1.4.1")
    implementation("androidx.media3:media3-common:1.4.1")
}
