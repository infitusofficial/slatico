import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { describe, expect, it } from "vitest";
import { ICON_NAMES, SLATICO_STYLES } from "../packages/core/src/index.js";
import {
  convertSvgToAndroidVectorDrawableXml,
  generateKotlinDrawablesModule,
  generateKotlinIconNameModule,
  getAndroidDrawableResourceName,
  toEnumConstantName,
  toKotlinPropertyName,
  toSnakeCase
} from "../scripts/generate-android.js";
import { discoverAndValidateIcons } from "../scripts/icon-pipeline.js";

const REPO_ROOT = process.cwd();
const ANDROID_ROOT = path.join(REPO_ROOT, "packages", "android");
const DRAWABLE_DIR = path.join(
  ANDROID_ROOT,
  "library",
  "src",
  "main",
  "res",
  "drawable"
);
const GENERATED_KOTLIN_DIR = path.join(
  ANDROID_ROOT,
  "library",
  "src",
  "main",
  "kotlin",
  "com",
  "infitus",
  "slatico",
  "generated"
);

const XML_PARSER = new XMLParser({
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

describe("com.infitus.slatico Android Native Library (Phase 3B)", () => {
  it("contains complete Gradle Kotlin DSL, AndroidManifest, Compose, and sample app structure", async () => {
    const requiredFiles = [
      "settings.gradle.kts",
      "build.gradle.kts",
      "gradle.properties",
      "gradlew",
      "gradlew.bat",
      "gradle/wrapper/gradle-wrapper.properties",
      "gradle/wrapper/gradle-wrapper.jar",
      "README.md",
      "CHANGELOG.md",
      "LICENSE",
      "library/build.gradle.kts",
      "library/consumer-rules.pro",
      "library/src/main/AndroidManifest.xml",
      "library/src/main/kotlin/com/infitus/slatico/SlaticoStyle.kt",
      "library/src/main/kotlin/com/infitus/slatico/SlaticoTheme.kt",
      "library/src/main/kotlin/com/infitus/slatico/SlaticoIcon.kt",
      "library/src/test/kotlin/com/infitus/slatico/SlaticoAndroidTest.kt",
      "sample/build.gradle.kts",
      "sample/src/main/AndroidManifest.xml",
      "sample/src/main/res/layout/activity_xml_preview.xml",
      "sample/src/main/kotlin/com/infitus/slatico/sample/MainActivity.kt"
    ];

    for (const rel of requiredFiles) {
      const stat = await fs.stat(path.join(ANDROID_ROOT, rel));
      expect(stat.isFile(), `Expected ${rel} to exist`).toBe(true);
    }

    const wrapperProps = await fs.readFile(
      path.join(ANDROID_ROOT, "gradle", "wrapper", "gradle-wrapper.properties"),
      "utf8"
    );
    expect(wrapperProps).toContain("gradle-8.11.1-bin.zip");
    expect(wrapperProps).toContain(
      "distributionSha256Sum=f397b287023acdba1e9f6fc5ea72d22dd63669d59ed4a289a29b1a76eee151c6"
    );

    const wrapperJarBuf = await fs.readFile(
      path.join(ANDROID_ROOT, "gradle", "wrapper", "gradle-wrapper.jar")
    );
    const wrapperJarSha256 = crypto
      .createHash("sha256")
      .update(wrapperJarBuf)
      .digest("hex");
    expect(wrapperJarSha256).toBe(
      "2db75c40782f5e8ba1fc278a5574bab070adccb2d21ca5a6e5ed840888448046"
    );

    const gradlewSh = await fs.readFile(path.join(ANDROID_ROOT, "gradlew"), "utf8");
    expect(gradlewSh.includes("\r\n")).toBe(false);

    const libGradle = await fs.readFile(
      path.join(ANDROID_ROOT, "library", "build.gradle.kts"),
      "utf8"
    );
    expect(libGradle).toContain('namespace = "com.infitus.slatico"');
    expect(libGradle).toContain("minSdk = 24");
    expect(libGradle).toContain("compileSdk = 35");
    expect(libGradle).toContain("JvmTarget.JVM_17");
    expect(libGradle).toContain("isIncludeAndroidResources = true");
    expect(libGradle).toContain("maven-publish");
    expect(libGradle).toContain("isRequired = hasSigningCredentials");

    const ciYaml = await fs.readFile(
      path.join(REPO_ROOT, ".github", "workflows", "ci.yml"),
      "utf8"
    );
    expect(ciYaml).toContain("contents: read");
    expect(ciYaml).toContain(":library:assembleRelease");
    expect(ciYaml).toContain(":library:testDebugUnitTest");
    expect(ciYaml).toContain(":sample:assembleDebug");
  });

  it("generates exactly 161 valid Android VectorDrawable XML resources (23 families × 7 styles)", async () => {
    const files = (await fs.readdir(DRAWABLE_DIR))
      .filter((f) => f.endsWith(".xml"))
      .sort();

    expect(files.length).toBe(161);
    expect(ICON_NAMES.length * SLATICO_STYLES.length).toBe(161);

    for (const iconName of ICON_NAMES) {
      for (const style of SLATICO_STYLES) {
        const resName = getAndroidDrawableResourceName(iconName, style);
        const fileName = `${resName}.xml`;
        expect(files).toContain(fileName);

        const xmlContent = await fs.readFile(
          path.join(DRAWABLE_DIR, fileName),
          "utf8"
        );
        const validation = XMLValidator.validate(xmlContent);
        expect(validation, `Invalid XML in ${fileName}`).toBe(true);

        expect(xmlContent).not.toContain("currentColor");
        expect(xmlContent).not.toContain("var(--slatico");

        const parsed = XML_PARSER.parse(xmlContent) as Array<Record<string, unknown>>;
        const vectorNode = parsed.find((n) => "vector" in n);
        expect(vectorNode, `Missing <vector> in ${fileName}`).toBeDefined();

        const vectorAttrs = (vectorNode?.[":@"] ?? {}) as Record<string, string>;
        expect(vectorAttrs["@_xmlns:android"]).toBe(
          "http://schemas.android.com/apk/res/android"
        );
        expect(vectorAttrs["@_android:width"]).toBe("24dp");
        expect(vectorAttrs["@_android:height"]).toBe("24dp");
        expect(vectorAttrs["@_android:viewportWidth"]).toBe("24");
        expect(vectorAttrs["@_android:viewportHeight"]).toBe("24");

        const children = (vectorNode?.vector ?? []) as Array<Record<string, unknown>>;
        const pathNodes = children.filter((c) => "path" in c);
        expect(
          pathNodes.length,
          `Expected at least 1 <path> in ${fileName}`
        ).toBeGreaterThan(0);

        for (const pNode of pathNodes) {
          const pAttrs = (pNode[":@"] ?? {}) as Record<string, string>;
          expect(pAttrs["@_android:pathData"]?.length).toBeGreaterThan(0);
          expect(pAttrs["@_android:fillColor"]).toMatch(/^#[0-9A-F]{8}$/);
        }
      }
    }
  });

  it("preserves Duotone secondary layer alpha and group fill-rule propagation", async () => {
    const bellDuotone = await fs.readFile(
      path.join(DRAWABLE_DIR, "slatico_bell_duotone.xml"),
      "utf8"
    );
    expect(bellDuotone).toContain('android:fillAlpha="0.2"');
    expect(bellDuotone).toContain('android:fillType="evenOdd"');

    const walletDuotone = await fs.readFile(
      path.join(DRAWABLE_DIR, "slatico_wallet_duotone.xml"),
      "utf8"
    );
    expect(walletDuotone).toContain('android:fillAlpha="0.2"');
    expect(walletDuotone).toContain('android:fillType="evenOdd"');
  });

  it("preserves multi-tone semantic colors in all 23 Color style VectorDrawables without flattening", async () => {
    for (const iconName of ICON_NAMES) {
      const resName = getAndroidDrawableResourceName(iconName, "color");
      const xmlContent = await fs.readFile(
        path.join(DRAWABLE_DIR, `${resName}.xml`),
        "utf8"
      );
      expect(xmlContent).toContain("#FFFF6040");
    }
  });

  it("generates deterministic Kotlin APIs matching on-disk files with zero demo icons", async () => {
    const discovery = await discoverAndValidateIcons(
      path.join(REPO_ROOT, "icons"),
      REPO_ROOT
    );
    expect(discovery.valid).toBe(true);
    expect(discovery.families.length).toBe(23);

    const expectedIconNamesKt = generateKotlinIconNameModule(discovery.families);
    const actualIconNamesKt = await fs.readFile(
      path.join(GENERATED_KOTLIN_DIR, "SlaticoIconName.kt"),
      "utf8"
    );
    expect(actualIconNamesKt).toBe(expectedIconNamesKt);

    const expectedDrawablesKt = generateKotlinDrawablesModule(discovery.families);
    const actualDrawablesKt = await fs.readFile(
      path.join(GENERATED_KOTLIN_DIR, "SlaticoDrawables.kt"),
      "utf8"
    );
    expect(actualDrawablesKt).toBe(expectedDrawablesKt);

    const actualDuotoneKt = await fs.readFile(
      path.join(GENERATED_KOTLIN_DIR, "SlaticoDuotoneVectors.kt"),
      "utf8"
    );
    expect(actualDuotoneKt).toContain("object SlaticoDuotoneVectors");

    for (const demoSlug of ["cube", "heart", "sparkles", "sparkles-demo"]) {
      expect(actualIconNamesKt).not.toContain(`"${demoSlug}"`);
      expect(actualDrawablesKt).not.toContain(`slatico_${toSnakeCase(demoSlug)}_`);
    }
  });

  it("safely handles Kotlin reserved identifiers and detects unsupported SVG elements", () => {
    expect(toKotlinPropertyName("class")).toBe("classIcon");
    expect(toKotlinPropertyName("object")).toBe("objectIcon");
    expect(toKotlinPropertyName("when")).toBe("whenIcon");
    expect(toKotlinPropertyName("3d-cube")).toBe("icon3dCube");
    expect(toEnumConstantName("3d-cube")).toBe("ICON_3D_CUBE");

    const svgWithFilter =
      '<svg viewBox="0 0 24 24"><filter id="f1"><feGaussianBlur stdDeviation="2"/></filter><path d="M0 0h24v24H0z" fill="#000"/></svg>';
    const res = convertSvgToAndroidVectorDrawableXml(
      svgWithFilter,
      "test-icon",
      "regular"
    );
    expect(res.unsupportedFeatures.length).toBeGreaterThan(0);
    expect(res.unsupportedFeatures.join(" ")).toContain("<filter>");
  });
});
