plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.bahiense.teleprompter"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.bahiense.teleprompter"
        minSdk = 24
        targetSdk = 35
        versionCode = 5
        versionName = "1.4"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            // assinado com a chave de debug para o APK poder ser instalado direto
            signingConfig = signingConfigs.getByName("debug")
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
