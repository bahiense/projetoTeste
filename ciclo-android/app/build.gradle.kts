plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "br.com.ciclo.concursos"
    compileSdk = 35

    defaultConfig {
        applicationId = "br.com.ciclo.concursos"
        minSdk = 24                 // Android 7, de 2016 em diante
        targetSdk = 35
        versionCode = 8
        versionName = "1.7"
    }

    /*
     * Chave fixa, guardada no repositório de propósito.
     *
     * A chave de depuração que o Gradle cria sozinho muda de máquina para
     * máquina: cada build sairia com assinatura diferente e o Android recusaria
     * a atualização com "app não instalado". Versionada, toda build é assinada
     * igual e atualizar por cima funciona.
     *
     * Não é segredo: serve para manter a assinatura estável, não para provar
     * autoria. Publicar na Play Store exigiria uma chave de verdade, fora do
     * repositório.
     */
    signingConfigs {
        create("estavel") {
            storeFile = rootProject.file("ciclo.keystore")
            storePassword = "cicloconcursos"
            keyAlias = "ciclo"
            keyPassword = "cicloconcursos"
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
    implementation("androidx.activity:activity-ktx:1.9.3")
}

// O app web vive em /celular e é copiado para os assets na hora de compilar,
// para existir uma única cópia do código no repositório.
val copiarAppWeb = tasks.register<Copy>("copiarAppWeb") {
    from(rootProject.file("../celular")) {
        include("index.html", "manifest.webmanifest", "icone-*.png")
    }
    into(layout.projectDirectory.dir("src/main/assets"))
}

tasks.named("preBuild") {
    dependsOn(copiarAppWeb)
}
