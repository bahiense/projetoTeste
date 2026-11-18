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
     * A chave que assina o APK NÃO fica no repositório (ele é público). Vem de
     * segredos do GitHub, que o workflow decodifica e passa por variável de
     * ambiente. Sem ela, o release sai com a chave de depuração do runner, que
     * muda a cada build: instala, mas a versão seguinte não instala por cima.
     */
    val chaveArquivo = System.getenv("TEOLOGIA_KEYSTORE").orEmpty()
    val chaveSenha = System.getenv("TEOLOGIA_KEYSTORE_SENHA").orEmpty()
    val chaveApelido = System.getenv("TEOLOGIA_KEYSTORE_ALIAS").orEmpty().ifEmpty { "teologia" }
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
}

tasks.named("preBuild") { dependsOn(gerarPagina) }

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.core:core:1.13.1")
}
