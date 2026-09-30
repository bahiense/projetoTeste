plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.bahiense.rede"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.bahiense.rede"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    /*
     * Chave fixa, guardada no repositório de propósito — mesma decisão dos
     * outros apps daqui. A chave de depuração que o Gradle cria sozinho muda
     * de máquina para máquina: cada build no GitHub sairia com assinatura
     * diferente e o Android recusaria a atualização com "app não instalado".
     * Não é uma chave secreta: serve só para manter a assinatura estável.
     */
    signingConfigs {
        create("estavel") {
            storeFile = rootProject.file("rede.keystore")
            storePassword = "fluencia"
            keyAlias = "fluencia"
            keyPassword = "fluencia"
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
}
