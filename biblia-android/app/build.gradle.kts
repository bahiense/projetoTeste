plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

/*
 * ID do cliente OAuth do Google, para a cópia automática no Drive. Fica em
 * gradle.properties (driveClienteId) porque é uma linha por pessoa: quem
 * compila este app usa o cliente da conta Google dele, não o de outro.
 *
 * Vazio é um estado previsto, não um defeito: sem ele o app funciona igual,
 * só sem o Drive, e a tela de Ajustes explica como criar o seu.
 *
 * Não é segredo. Cliente OAuth de Android não tem senha; o que o protege é
 * o nome do pacote mais a assinatura do APK, registrados no Google Cloud.
 */
val driveClienteId = (project.findProperty("driveClienteId") as String? ?: "").trim()

android {
    namespace = "com.bahiense.biblia"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.bahiense.biblia"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        buildConfigField("String", "DRIVE_CLIENTE_ID", "\"" + driveClienteId + "\"")

        /*
         * O Google só devolve o login para o endereço que é o ID do cliente ao
         * contrário, e um <data android:scheme> no manifesto não aceita curinga.
         * Por isso o esquema entra aqui, no build. Sem cliente configurado vai
         * um esquema nosso que ninguém chama — o filtro existe e fica inerte.
         */
        manifestPlaceholders["esquemaDrive"] =
            if (driveClienteId.isEmpty()) "com.bahiense.biblia.semdrive"
            else "com.googleusercontent.apps." +
                driveClienteId.removeSuffix(".apps.googleusercontent.com")
    }

    buildFeatures {
        buildConfig = true
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
    /* FileProvider, para entregar o arquivo de backup ao menu de compartilhar
       sem expor um caminho file:// — o Android recusa file:// entre apps. */
    implementation("androidx.core:core:1.13.1")
}

// O app web fica em /biblia e é copiado para os assets na hora de compilar —
// inclusive data/texto, os 132 arquivos do texto bíblico: é o que faz a leitura
// funcionar sem internet desde a primeira abertura.
// assim existe uma única cópia do código no repositório. Ferramentas de
// desenvolvimento ficam de fora, e o service worker também: dentro do APK os
// arquivos já estão no aparelho, e um cache por cima disso só serviria para
// servir código velho depois de atualizar o app.
val copyWebApp = tasks.register<Copy>("copyWebApp") {
    from(rootProject.file("../biblia")) {
        exclude("README.md", "verificar.mjs", "gerar-artefato.mjs", "preparar-texto.mjs",
            "artefato", "artefato/**", "sw.js")
    }
    into(layout.projectDirectory.dir("src/main/assets"))
}

tasks.named("preBuild") {
    dependsOn(copyWebApp)
}
