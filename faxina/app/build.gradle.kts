plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.bahiense.faxina"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.bahiense.faxina"
        minSdk = 26
        targetSdk = 35
        versionCode = 2
        versionName = "1.1"
    }

    /*
     * Mesma ideia do teleprompter: chave fixa versionada, para que toda build
     * do GitHub saia com a mesma assinatura e o Android aceite a atualização
     * por cima da versão anterior em vez de recusar com "app não instalado".
     *
     * Não é segredo — serve para estabilidade de assinatura, não para provar
     * autoria. Um app de Play Store precisaria de uma chave de verdade,
     * guardada fora do repositório.
     */
    signingConfigs {
        create("estavel") {
            storeFile = rootProject.file("faxina.keystore")
            storePassword = "faxina"
            keyAlias = "faxina"
            keyPassword = "faxina"
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

    buildFeatures {
        compose = true
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
    val compose = platform("androidx.compose:compose-bom:2024.10.01")
    implementation(compose)
    androidTestImplementation(compose)

    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    debugImplementation("androidx.compose.ui:ui-tooling")
    implementation("androidx.compose.ui:ui-tooling-preview")
}
