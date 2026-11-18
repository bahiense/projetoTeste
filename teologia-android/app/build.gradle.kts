plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

/*
 * A tela do app É a página do Professor de Teologia do Claude
 * (teologia-claude/professor.html), copiada na compilação. Assim o app e o
 * artifact mostram as aulas do mesmo jeito, sem duas cópias para manter.
 * Na cópia saem as bibliotecas e fontes de fora (o app não usa rede) e entra
 * um cabeçalho com a política de segurança.
 */
val paginaGerada = layout.buildDirectory.dir("pagina")
val gerarPagina by tasks.registering {
    val origem = rootProject.file("../teologia-claude/professor.html")
    val destino = paginaGerada
    inputs.file(origem)
    outputs.dir(destino)
    doLast {
        val linhas = origem.readLines().filterNot { Regex("^\\s*<(script src=|link )").containsMatchIn(it) }
        val cabeca = """<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'">
<meta name="theme-color" content="#16131a">
</head><body>
"""
        val pasta = destino.get().asFile.also { it.mkdirs() }
        File(pasta, "index.html").writeText(cabeca + linhas.joinToString("\n") + "\n</body></html>\n")
    }
}

android {
    namespace = "com.bahiense.teologia"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.bahiense.teologia"
        minSdk = 28
        targetSdk = 35
        // o workflow numera cada build (GITHUB_RUN_NUMBER): é assim que o app sabe
        // que existe uma versão mais nova para oferecer no botão "Procurar atualização"
        val build = (System.getenv("GITHUB_RUN_NUMBER") ?: "0").toInt()
        versionCode = 100 + build
        versionName = "1.$build"
    }

    buildFeatures {
        buildConfig = true
    }

    sourceSets["main"].assets.srcDir(paginaGerada)

    /*
     * Chave fixa, guardada no repositório de propósito — mesma decisão do app
     * da Bíblia, do teleprompter e do Fluência. A chave de depuração que o
     * Gradle cria sozinho muda de máquina para máquina: cada build no GitHub
     * sairia com assinatura diferente e o Android recusaria a atualização com
     * "app não instalado".
     *
     * Não é chave secreta: serve para manter a assinatura estável, não para
     * provar autoria. O app não guarda chave de API nem senha, só as aulas.
     */
    signingConfigs {
        create("estavel") {
            storeFile = rootProject.file("teologia.keystore")
            storePassword = "teologia"
            keyAlias = "teologia"
            keyPassword = "teologia"
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

tasks.named("preBuild") { dependsOn(gerarPagina) }

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.core:core:1.13.1")
}
