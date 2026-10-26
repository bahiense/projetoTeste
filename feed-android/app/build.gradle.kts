plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

/*
 * ID do cliente OAuth do Google, para entrar na conta do YouTube. Fica em
 * gradle.properties (youtubeClienteId) porque é uma linha por pessoa: quem
 * compila este app usa o cliente da conta Google dele, não o de outro.
 *
 * Vazio é um estado previsto: o app abre e a primeira tela explica como
 * criar o seu. Não é segredo — cliente OAuth de Android não tem senha; o que
 * o protege é o nome do pacote mais a assinatura do APK.
 */
val youtubeClienteId = (project.findProperty("youtubeClienteId") as String? ?: "").trim()

android {
    namespace = "com.bahiense.feed"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.bahiense.feed"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        buildConfigField("String", "YOUTUBE_CLIENTE_ID", "\"" + youtubeClienteId + "\"")

        /*
         * O Google só devolve o login para o endereço que é o ID do cliente ao
         * contrário, e um <data android:scheme> no manifesto não aceita curinga.
         * Por isso o esquema entra aqui, no build. Sem cliente configurado vai
         * um esquema nosso que ninguém chama — o filtro existe e fica inerte.
         */
        manifestPlaceholders["esquemaLogin"] =
            if (youtubeClienteId.isEmpty()) "com.bahiense.feed.semcliente"
            else "com.googleusercontent.apps." +
                youtubeClienteId.removeSuffix(".apps.googleusercontent.com")
    }

    buildFeatures {
        buildConfig = true
    }

    /*
     * Chave fixa, guardada no repositório de propósito — mesma decisão dos
     * outros apps daqui. A chave de depuração que o Gradle cria sozinho muda
     * de máquina para máquina: cada build no GitHub sairia com assinatura
     * diferente, o Android recusaria a atualização com "app não instalado" e
     * o SHA-1 registrado no Google Cloud deixaria de bater.
     * Não é uma chave secreta: serve só para manter a assinatura estável.
     */
    signingConfigs {
        create("estavel") {
            storeFile = rootProject.file("feed.keystore")
            storePassword = "feedlimpo"
            keyAlias = "feedlimpo"
            keyPassword = "feedlimpo"
        }
    }

    buildTypes {
        debug {
            signingConfig = signingConfigs.getByName("estavel")
        }
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("estavel")
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
}
