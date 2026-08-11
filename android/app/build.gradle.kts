plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.bahiense.teleprompter"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.bahiense.teleprompter"
        minSdk = 26
        targetSdk = 35
        versionCode = 9
        versionName = "1.8"
    }

    /*
     * Chave fixa, guardada no repositório de propósito.
     *
     * A chave de depuração que o Gradle cria sozinho muda de máquina para
     * máquina: cada build no GitHub saía com assinatura diferente e o Android
     * recusava a atualização com "app não instalado". Com a chave versionada,
     * toda build é assinada igual e a atualização funciona.
     *
     * Não é uma chave secreta: serve para manter a assinatura estável, não
     * para provar autoria. Se um dia o app for para a Play Store, é preciso
     * gerar uma chave de verdade e mantê-la fora do repositório.
     */
    signingConfigs {
        create("estavel") {
            storeFile = rootProject.file("teleprompter.keystore")
            storePassword = "teleprompter"
            keyAlias = "teleprompter"
            keyPassword = "teleprompter"
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

// O app web fica em /teleprompter e é copiado para os assets na hora de compilar,
// assim existe uma única cópia do código no repositório.
val copyWebApp = tasks.register<Copy>("copyWebApp") {
    from(rootProject.file("../teleprompter")) {
        exclude("README.md")
    }
    into(layout.projectDirectory.dir("src/main/assets"))
}

tasks.named("preBuild") {
    dependsOn(copyWebApp)
}
