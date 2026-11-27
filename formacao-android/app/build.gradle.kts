plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.bahiense.formacao"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.bahiense.formacao"
        minSdk = 28
        targetSdk = 35
        // o workflow numera cada build (GITHUB_RUN_NUMBER): é assim que o app sabe
        // que existe uma versão mais nova para oferecer no botão "Atualizar"
        val build = (System.getenv("GITHUB_RUN_NUMBER") ?: "0").toInt()
        versionCode = 100 + build
        versionName = "1.$build"
    }

    buildFeatures {
        buildConfig = true
    }

    /*
     * A chave que assina o APK NÃO fica no repositório (ele é público). Vem de
     * segredos do GitHub, que o workflow decodifica e passa por variável de
     * ambiente. Sem ela, o release sai com a chave de depuração: instala e
     * funciona, mas uma versão nova assinada com outra chave não instala por cima.
     */
    val chaveArquivo = System.getenv("POLITICA_KEYSTORE").orEmpty()
    val chaveSenha = System.getenv("POLITICA_KEYSTORE_SENHA").orEmpty()
    val chaveApelido = System.getenv("POLITICA_KEYSTORE_ALIAS").orEmpty().ifEmpty { "politica" }
    val temChave = chaveArquivo.isNotEmpty() && file(chaveArquivo).exists() && chaveSenha.isNotEmpty()
    signingConfigs {
        if (temChave) create("estavel") {
            storeFile = file(chaveArquivo)
            storePassword = chaveSenha
            keyAlias = chaveApelido
            keyPassword = chaveSenha
        }
    }

    buildTypes {
        release {
            // release, e não debug: um APK de depuração deixa copiar os dados do
            // app (inclusive a chave cifrada) por cabo USB
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

    // o SDK da Anthropic traz Jackson, OkHttp e OpenTelemetry, que repetem
    // arquivos de licença e de manifesto dentro de META-INF
    packaging {
        resources {
            excludes += setOf(
                "META-INF/DEPENDENCIES",
                "META-INF/LICENSE*",
                "META-INF/NOTICE*",
                "META-INF/INDEX.LIST",
                "META-INF/*.SF",
                "META-INF/*.DSA",
                "META-INF/*.RSA",
                "META-INF/versions/9/OSGI-INF/MANIFEST.MF",
                "META-INF/versions/9/module-info.class",
                "module-info.class"
            )
        }
    }
}

dependencies {
    // o SDK oficial da Anthropic para Java/Kotlin: é por ele que o app fala com o Claude
    implementation("com.anthropic:anthropic-java:3.10.0")
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.core:core:1.13.1")
}
