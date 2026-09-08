plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.bahiense.altar"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.bahiense.altar"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    /*
     * Chave fixa, guardada no repositório de propósito — mesma decisão do
     * teleprompter. A chave de depuração que o Gradle cria sozinho muda de
     * máquina para máquina: cada build no GitHub sairia com assinatura
     * diferente e o Android recusaria a atualização com "app não instalado".
     *
     * Não é uma chave secreta: serve para manter a assinatura estável, não
     * para provar autoria. Se um dia o app for para a Play Store, é preciso
     * gerar uma chave de verdade e mantê-la fora do repositório.
     */
    signingConfigs {
        create("estavel") {
            storeFile = rootProject.file("altar.keystore")
            storePassword = "altar-oracao"
            keyAlias = "altar"
            keyPassword = "altar-oracao"
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

// O app web fica em /oracao e é copiado para os assets na hora de compilar,
// assim existe uma única cópia do código no repositório. Ferramentas de
// desenvolvimento ficam de fora: dentro do APK não servem para nada.
val copyWebApp = tasks.register<Copy>("copyWebApp") {
    from(rootProject.file("../oracao")) {
        exclude("README.md", "verificar.mjs", "sw.js")
    }
    into(layout.projectDirectory.dir("src/main/assets"))
}

tasks.named("preBuild") {
    dependsOn(copyWebApp)
}
