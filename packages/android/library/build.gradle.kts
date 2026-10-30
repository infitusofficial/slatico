import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    `maven-publish`
    signing
}

group = findProperty("GROUP")?.toString() ?: "com.infitus.slatico"
version = findProperty("VERSION_NAME")?.toString() ?: "0.1.0"

android {
    namespace = "com.infitus.slatico"
    compileSdk = 35

    defaultConfig {
        minSdk = 24
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        consumerProguardFiles("consumer-rules.pro")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "consumer-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        compose = true
    }

    testOptions {
        unitTests {
            isIncludeAndroidResources = true
        }
    }

    publishing {
        singleVariant("release") {
            withSourcesJar()
            withJavadocJar()
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.12.01")
    implementation(composeBom)

    api("androidx.annotation:annotation:1.9.1")
    api("androidx.compose.runtime:runtime")
    api("androidx.compose.ui:ui")
    api("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.core:core-ktx:1.15.0")

    testImplementation("junit:junit:4.13.2")
}

afterEvaluate {
    publishing {
        publications {
            create<MavenPublication>("release") {
                from(components["release"])

                groupId = project.group.toString()
                artifactId = findProperty("POM_ARTIFACT_ID")?.toString() ?: "slatico-android"
                version = project.version.toString()

                pom {
                    name.set(findProperty("POM_NAME")?.toString() ?: "Slatico Icons for Android")
                    description.set(
                        findProperty("POM_DESCRIPTION")?.toString()
                            ?: "Multi-style open-source Android VectorDrawable and Jetpack Compose icon library by Infitus Creative Studio."
                    )
                    url.set(findProperty("POM_URL")?.toString() ?: "https://github.com/infitusofficial/slatico")

                    licenses {
                        license {
                            name.set(findProperty("POM_LICENCE_NAME")?.toString() ?: "MIT License")
                            url.set(findProperty("POM_LICENCE_URL")?.toString() ?: "https://opensource.org/licenses/MIT")
                        }
                    }

                    developers {
                        developer {
                            id.set(findProperty("POM_DEVELOPER_ID")?.toString() ?: "infitus")
                            name.set(findProperty("POM_DEVELOPER_NAME")?.toString() ?: "Infitus Creative Studio")
                        }
                    }

                    scm {
                        url.set(findProperty("POM_SCM_URL")?.toString() ?: "https://github.com/infitusofficial/slatico")
                        connection.set(
                            findProperty("POM_SCM_CONNECTION")?.toString()
                                ?: "scm:git:git://github.com/infitusofficial/slatico.git"
                        )
                        developerConnection.set(
                            findProperty("POM_SCM_DEV_CONNECTION")?.toString()
                                ?: "scm:git:ssh://git@github.com/infitusofficial/slatico.git"
                        )
                    }
                }
            }
        }
    }

    signing {
        val hasSigningCredentials = findProperty("signing.keyId") != null ||
            findProperty("signingKey") != null ||
            !System.getenv("ORG_GRADLE_PROJECT_signingKey").isNullOrBlank()
        isRequired = hasSigningCredentials
        if (hasSigningCredentials) {
            sign(publishing.publications["release"])
        }
    }
}
