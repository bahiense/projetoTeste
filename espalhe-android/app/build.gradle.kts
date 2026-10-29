plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.bahiense.espalhe"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.bahiense.espalhe"
        // 28: o ImageDecoder já aplica a rotação da foto (EXIF) sozinho
        minSdk = 28
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    /*
     * Chave fixa, guardada no repositório de propósito — mesma decisão dos
     * outros apps daqui. A chave de depuração que o Gradle cria sozinho muda
     * de máquina para máquina, e o Android recusaria a atualização com
     * "app não instalado". Não é segredo: serve só para a assinatura ser estável.
     */
    signingConfigs {
        create("estavel") {
            storeFile = rootProject.file("espalhe.keystore")
            storePassword = "espalhe"
            keyAlias = "espalhe"
            keyPassword = "espalhe"
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
    implementation("androidx.core:core:1.13.1")
    // recorta e redimensiona o vídeo no próprio aparelho, com o codificador de hardware
    implementation("androidx.media3:media3-transformer:1.4.1")
    implementation("androidx.media3:media3-effect:1.4.1")
    implementation("androidx.media3:media3-common:1.4.1")
}
