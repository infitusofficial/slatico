import java.net.URI
import java.net.URLEncoder
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.util.Base64
import org.gradle.api.GradleException
import org.gradle.api.tasks.bundling.Zip
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    `maven-publish`
    signing
}

group = findProperty("GROUP")?.toString() ?: "dev.slatico"
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

val centralPortalStagingDir = layout.buildDirectory.dir("central-portal-staging")

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
                    url.set(findProperty("POM_URL")?.toString() ?: "https://slatico.dev")

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
                            url.set(findProperty("POM_DEVELOPER_URL")?.toString() ?: "https://slatico.dev")
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

        repositories {
            maven {
                name = "CentralPortalStaging"
                url = uri(centralPortalStagingDir)
            }
        }
    }

    signing {
        val inMemoryKey = (
            findProperty("signingKey")?.toString()
                ?: System.getenv("ORG_GRADLE_PROJECT_signingKey")
                ?: System.getenv("SIGNING_KEY")
        )?.takeIf { it.isNotBlank() }

        val inMemoryKeyId = (
            findProperty("signingKeyId")?.toString()
                ?: System.getenv("ORG_GRADLE_PROJECT_signingKeyId")
                ?: System.getenv("SIGNING_KEY_ID")
        )?.takeIf { it.isNotBlank() }

        val inMemoryPassword = (
            findProperty("signingPassword")?.toString()
                ?: System.getenv("ORG_GRADLE_PROJECT_signingPassword")
                ?: System.getenv("SIGNING_PASSWORD")
        ) ?: ""

        val hasGpgCmd = findProperty("signing.gnupg.keyName") != null
        val hasKeyRing = findProperty("signing.keyId") != null &&
            findProperty("signing.secretKeyRingFile") != null

        val hasSigningCredentials = inMemoryKey != null || hasGpgCmd || hasKeyRing
        isRequired = hasSigningCredentials

        if (inMemoryKey != null) {
            val unescapedKey = inMemoryKey.trim().replace("\\n", "\n")
            val normalizedKey = if (unescapedKey.contains("-----BEGIN")) {
                unescapedKey
            } else {
                String(Base64.getMimeDecoder().decode(unescapedKey), StandardCharsets.UTF_8)
            }
            val normalizedKeyId = inMemoryKeyId
                ?.trim()
                ?.removePrefix("0x")
                ?.removePrefix("0X")
                ?.replace(" ", "")
                ?.takeIf { it.length >= 8 }
                ?.takeLast(8)

            if (normalizedKeyId != null) {
                useInMemoryPgpKeys(normalizedKeyId, normalizedKey, inMemoryPassword)
            } else {
                useInMemoryPgpKeys(normalizedKey, inMemoryPassword)
            }
        } else if (hasGpgCmd) {
            useGpgCmd()
        }

        if (hasSigningCredentials) {
            sign(publishing.publications["release"])
        }
    }

    val artifactIdResolved = findProperty("POM_ARTIFACT_ID")?.toString() ?: "slatico-android"
    val groupPath = project.group.toString().replace('.', '/')
    val versionResolved = project.version.toString()
    val artifactRelativeDir = "$groupPath/$artifactIdResolved/$versionResolved"

    val prepareCentralPortalStaging = tasks.register("prepareCentralPortalStaging") {
        group = "publishing"
        description = "Stages Maven Central artifacts and ensures MD5, SHA-1, SHA-256, and SHA-512 checksums for Sonatype Central Portal."
        dependsOn("publishReleasePublicationToCentralPortalStagingRepository")

        doLast {
            val stagingRoot = centralPortalStagingDir.get().asFile
            val versionDir = stagingRoot.resolve(artifactRelativeDir)
            if (!versionDir.exists()) {
                throw GradleException("Staging directory not found: ${versionDir.absolutePath}")
            }

            // Remove checksums generated for .asc signature files if present
            versionDir.listFiles()?.forEach { file ->
                if (
                    file.name.endsWith(".asc.md5") ||
                    file.name.endsWith(".asc.sha1") ||
                    file.name.endsWith(".asc.sha256") ||
                    file.name.endsWith(".asc.sha512")
                ) {
                    file.delete()
                }
            }

            val checksumAlgorithms = mapOf(
                "md5" to "MD5",
                "sha1" to "SHA-1",
                "sha256" to "SHA-256",
                "sha512" to "SHA-512"
            )

            // Ensure all four checksums exist for every primary artifact (.aar, -sources.jar, -javadoc.jar, .pom, .module)
            versionDir.listFiles()?.filter { file ->
                file.isFile &&
                    !file.name.endsWith(".asc") &&
                    !file.name.endsWith(".md5") &&
                    !file.name.endsWith(".sha1") &&
                    !file.name.endsWith(".sha256") &&
                    !file.name.endsWith(".sha512")
            }?.forEach { artifactFile ->
                val bytes = artifactFile.readBytes()
                checksumAlgorithms.forEach { (ext, algo) ->
                    val checksumFile = File(versionDir, "${artifactFile.name}.$ext")
                    val digestHex = MessageDigest.getInstance(algo)
                        .digest(bytes)
                        .joinToString("") { "%02x".format(it) }
                    checksumFile.writeText(digestHex, StandardCharsets.UTF_8)
                }
            }
        }
    }

    val packageCentralPortalBundle = tasks.register<Zip>("packageCentralPortalBundle") {
        group = "publishing"
        description = "Packages the staged Maven repository layout into a Sonatype Central Publisher Portal .zip bundle."
        dependsOn(prepareCentralPortalStaging)

        from(centralPortalStagingDir) {
            include("$artifactRelativeDir/**")
            exclude("**/maven-metadata*")
        }
        archiveBaseName.set(artifactIdResolved)
        archiveVersion.set(versionResolved)
        archiveClassifier.set("central-portal-bundle")
        destinationDirectory.set(layout.buildDirectory.dir("distributions"))
    }

    tasks.register("uploadCentralPortalBundle") {
        group = "publishing"
        description = "Uploads the signed Central Portal bundle with publishingType=USER_MANAGED for validation without auto-publishing."
        dependsOn(packageCentralPortalBundle)

        doLast {
            val stagingRoot = centralPortalStagingDir.get().asFile
            val versionDir = stagingRoot.resolve(artifactRelativeDir)
            val basePrefix = "$artifactIdResolved-$versionResolved"
            val expectedSignatures = listOf(
                "$basePrefix.aar.asc",
                "$basePrefix-sources.jar.asc",
                "$basePrefix-javadoc.jar.asc",
                "$basePrefix.pom.asc",
                "$basePrefix.module.asc"
            )
            val missingSignatures = expectedSignatures.filter { !File(versionDir, it).exists() }
            if (missingSignatures.isNotEmpty()) {
                throw GradleException(
                    "Refusing to upload unsigned bundle to Sonatype Central Portal. Missing PGP signatures: ${missingSignatures.joinToString(", ")}. " +
                        "Configure PGP signing credentials in ~/.gradle/gradle.properties or environment variables before running uploadCentralPortalBundle."
                )
            }

            val username = (
                findProperty("mavenCentralUsername")?.toString()
                    ?: findProperty("sonatypeCentralUsername")?.toString()
                    ?: System.getenv("MAVEN_CENTRAL_USERNAME")
                    ?: System.getenv("SONATYPE_USERNAME")
            )?.takeIf { it.isNotBlank() }

            val password = (
                findProperty("mavenCentralPassword")?.toString()
                    ?: findProperty("sonatypeCentralPassword")?.toString()
                    ?: System.getenv("MAVEN_CENTRAL_PASSWORD")
                    ?: System.getenv("SONATYPE_PASSWORD")
            )?.takeIf { it.isNotBlank() }

            if (username == null || password == null) {
                throw GradleException(
                    "Missing Sonatype Central Portal User Token credentials. Set mavenCentralUsername and mavenCentralPassword in ~/.gradle/gradle.properties " +
                        "or MAVEN_CENTRAL_USERNAME and MAVEN_CENTRAL_PASSWORD environment variables."
                )
            }

            val bundleFile = packageCentralPortalBundle.get().archiveFile.get().asFile
            val deploymentName = "${project.group}:$artifactIdResolved:$versionResolved"
            val encodedName = URLEncoder.encode(deploymentName, StandardCharsets.UTF_8)
            val endpoint = "https://central.sonatype.com/api/v1/publisher/upload?publishingType=USER_MANAGED&name=$encodedName"
            val bearerToken = Base64.getEncoder().encodeToString("$username:$password".toByteArray(StandardCharsets.UTF_8))
            val boundary = "----SlaticoCentralPortalBoundary${System.currentTimeMillis()}"

            val lineBreak = "\r\n"
            val headerPart = buildString {
                append("--").append(boundary).append(lineBreak)
                append("Content-Disposition: form-data; name=\"bundle\"; filename=\"${bundleFile.name}\"").append(lineBreak)
                append("Content-Type: application/octet-stream").append(lineBreak)
                append(lineBreak)
            }.toByteArray(StandardCharsets.UTF_8)
            val footerPart = "$lineBreak--$boundary--$lineBreak".toByteArray(StandardCharsets.UTF_8)
            val fileBytes = bundleFile.readBytes()
            val bodyBytes = ByteArray(headerPart.size + fileBytes.size + footerPart.size)
            System.arraycopy(headerPart, 0, bodyBytes, 0, headerPart.size)
            System.arraycopy(fileBytes, 0, bodyBytes, headerPart.size, fileBytes.size)
            System.arraycopy(footerPart, 0, bodyBytes, headerPart.size + fileBytes.size, footerPart.size)

            val client = HttpClient.newHttpClient()
            val request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Authorization", "Bearer $bearerToken")
                .header("Content-Type", "multipart/form-data; boundary=$boundary")
                .POST(HttpRequest.BodyPublishers.ofByteArray(bodyBytes))
                .build()

            val response = client.send(request, HttpResponse.BodyHandlers.ofString())
            if (response.statusCode() !in 200..299) {
                throw GradleException(
                    "Sonatype Central Portal upload failed with HTTP ${response.statusCode()}: ${response.body()}"
                )
            }
            val deploymentId = response.body().trim()
            logger.lifecycle("Successfully uploaded $deploymentName to Sonatype Central Portal (USER_MANAGED validation mode).")
            logger.lifecycle("Deployment ID: $deploymentId")
            logger.lifecycle("Inspect validation status and publish manually at: https://central.sonatype.com/publishing/deployments")
        }
    }
}
