plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.bahiense.biblia"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.bahiense.biblia"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    /*
     * Chave fixa, guardada no repositório de propósito — mesma decisão do
     * teleprompter e do Fluência. A chave de depuração que o Gradle cria
     * sozinho muda de máquina para máquina: cada build no GitHub sairia com
     * assinatura diferente e o Android recusaria a atualização com "app não
     * instalado", obrigando a desinstalar e perder a leitura guardada.
     *
     * Não é chave secreta: serve para manter a assinatura estável, não para
     * provar autoria.
     */
    signingConfigs {
        create("estavel") {
            storeFile = rootProject.file("biblia.keystore")
            storePassword = "biblia"
            keyAlias = "biblia"
            keyPassword = "biblia"
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

// O app web fica em /biblia e é copiado para os assets na hora de compilar,
// assim existe uma única cópia do código no repositório. Ferramentas de
// desenvolvimento ficam de fora, e o service worker também: dentro do APK os
// arquivos já estão no aparelho, e um cache por cima disso só serviria para
// servir código velho depois de atualizar o app.
val copyWebApp = tasks.register<Copy>("copyWebApp") {
    from(rootProject.file("../biblia")) {
        exclude("README.md", "verificar.mjs", "gerar-artefato.mjs", "artefato", "sw.js")
    }
    into(layout.projectDirectory.dir("src/main/assets"))
}

tasks.named("preBuild") {
    dependsOn(copyWebApp)
}
