import fs from "node:fs/promises";
import path from "node:path";
import { XMLValidator } from "fast-xml-parser";
import { describe, expect, it } from "vitest";
import { ICON_NAMES, SLATICO_STYLES } from "../packages/core/src/index.js";
import {
  extractSwiftLayersFromSvg,
  generateSwiftIconNameModule,
  generateSwiftVectorCatalogModule,
  toSwiftIdentifier
} from "../scripts/generate-swift.js";
import { discoverAndValidateIcons } from "../scripts/icon-pipeline.js";

const REPO_ROOT = process.cwd();
const SWIFT_ROOT = path.join(REPO_ROOT, "packages", "swift");
const SOURCES_DIR = path.join(SWIFT_ROOT, "Sources", "SlaticoIcons");
const GENERATED_DIR = path.join(SOURCES_DIR, "Generated");
const RESOURCES_SVG_DIR = path.join(SOURCES_DIR, "Resources", "svg");

describe("SlaticoIcons Apple Native Package (Phase 3C)", () => {
  it("contains complete Swift Package Manager structure, runtime, showcase, and XCTest targets", async () => {
    const requiredFiles = [
      "Package.swift",
      ".gitignore",
      "README.md",
      "CHANGELOG.md",
      "LICENSE",
      "Sources/SlaticoIcons/SlaticoStyle.swift",
      "Sources/SlaticoIcons/SlaticoVectorTypes.swift",
      "Sources/SlaticoIcons/SlaticoResources.swift",
      "Sources/SlaticoIcons/SlaticoCGPathParser.swift",
      "Sources/SlaticoIcons/SlaticoTheme.swift",
      "Sources/SlaticoIcons/SlaticoIcon.swift",
      "Sources/SlaticoIcons/SlaticoPlatformRenderers.swift",
      "Sources/SlaticoIcons/Generated/SlaticoIconName.generated.swift",
      "Sources/SlaticoIcons/Generated/SlaticoVectorCatalog.generated.swift",
      "Examples/SlaticoIconsExample/SlaticoShowcaseView.swift",
      "Tests/SlaticoIconsTests/SlaticoIconsTests.swift"
    ];

    for (const rel of requiredFiles) {
      const stat = await fs.stat(path.join(SWIFT_ROOT, rel));
      expect(stat.isFile(), `Expected ${rel} to exist`).toBe(true);
    }

    const packageSwift = await fs.readFile(
      path.join(SWIFT_ROOT, "Package.swift"),
      "utf8"
    );
    expect(packageSwift).toContain("swift-tools-version: 5.9");
    expect(packageSwift).toContain('name: "SlaticoIcons"');
    expect(packageSwift).toContain(".iOS(.v15)");
    expect(packageSwift).toContain(".macOS(.v12)");
    expect(packageSwift).toContain(".macCatalyst(.v15)");
    expect(packageSwift).toContain('.copy("Resources/svg")');
    expect(packageSwift).toContain('name: "SlaticoIconsExample"');
    expect(packageSwift).toContain('name: "SlaticoIconsTests"');
  });

  it("bundles all 189 canonical SVG variants across 7 style subdirectories with valid 24x24 viewBox", async () => {
    let totalFiles = 0;

    for (const style of SLATICO_STYLES) {
      const styleDir = path.join(RESOURCES_SVG_DIR, style);
      const entries = (await fs.readdir(styleDir)).sort();
      expect(entries.length).toBe(27);

      for (const iconName of ICON_NAMES) {
        const fileName = `${iconName}.svg`;
        expect(entries).toContain(fileName);
        const svgContent = await fs.readFile(path.join(styleDir, fileName), "utf8");
        expect(XMLValidator.validate(svgContent)).toBe(true);
        expect(svgContent).toContain('viewBox="0 0 24 24"');
        totalFiles++;
      }
    }

    expect(totalFiles).toBe(189);
  });

  it("generates deterministic Swift enum and vector catalog for all 23 families and 161 variants without demo leaks", async () => {
    const iconNameSwift = await fs.readFile(
      path.join(GENERATED_DIR, "SlaticoIconName.generated.swift"),
      "utf8"
    );
    const catalogSwift = await fs.readFile(
      path.join(GENERATED_DIR, "SlaticoVectorCatalog.generated.swift"),
      "utf8"
    );

    expect(iconNameSwift).toContain("public enum SlaticoIconName: String, CaseIterable");
    for (const iconName of ICON_NAMES) {
      const swiftCase = toSwiftIdentifier(iconName);
      expect(iconNameSwift).toContain(`case ${swiftCase} = "${iconName}"`);
      expect(catalogSwift).toContain(`case .${swiftCase}:`);
    }

    // Ensure removed demo icons never leak into Swift package
    for (const demoName of ["cube", "heart", "sparkles", "sparkle"]) {
      expect(iconNameSwift).not.toContain(`"${demoName}"`);
      expect(catalogSwift).not.toContain(`.${demoName}:`);
    }

    expect(catalogSwift).toContain("public static let familyCount: Int = 27");
    expect(catalogSwift).toContain("public static let styleCount: Int = 7");
    expect(catalogSwift).toContain("public static let totalVariants: Int = 189");
    expect(catalogSwift).toContain("role: .secondary");
    expect(catalogSwift).toContain("role: .fixedColor(");

    // Verify deterministic regeneration against discovered icons
    const discovery = await discoverAndValidateIcons(
      path.join(REPO_ROOT, "icons"),
      REPO_ROOT
    );
    expect(discovery.valid).toBe(true);
    expect(generateSwiftIconNameModule(discovery.families)).toBe(iconNameSwift);

    const layerMap = new Map();
    for (const fam of discovery.families) {
      for (const style of SLATICO_STYLES) {
        const extracted = extractSwiftLayersFromSvg(
          fam.variants[style].optimizedSvg,
          style
        );
        expect(extracted.unsupportedFeatures).toEqual([]);
        expect(extracted.layers.length).toBeGreaterThan(0);
        layerMap.set(`${fam.name}:${style}`, extracted.layers);
      }
    }
    expect(generateSwiftVectorCatalogModule(discovery.families, layerMap)).toBe(
      catalogSwift
    );
  });

  it("handles Swift identifier conversion, reserved words, and unsupported SVG feature detection", () => {
    expect(toSwiftIdentifier("cloud-check")).toBe("cloudCheck");
    expect(toSwiftIdentifier("sliders-horizontal")).toBe("slidersHorizontal");
    expect(toSwiftIdentifier("return")).toBe("returnIcon");
    expect(toSwiftIdentifier("switch")).toBe("switchIcon");
    expect(toSwiftIdentifier("class")).toBe("classIcon");
    expect(toSwiftIdentifier("default")).toBe("defaultIcon");
    expect(toSwiftIdentifier("3d-box")).toBe("icon3dBox");

    const unsupportedSvg = `<svg viewBox="0 0 24 24"><filter id="f"/><text>bad</text><g transform="rotate(45)"><path d="M0 0h24v24H0z"/></g></svg>`;
    const result = extractSwiftLayersFromSvg(unsupportedSvg, "regular");
    expect(result.unsupportedFeatures).toContain("Unsupported SVG element <filter>");
    expect(result.unsupportedFeatures).toContain("Unsupported SVG element <text>");
    expect(result.unsupportedFeatures).toContain(
      "Transform attribute on <g> is not supported without flattening"
    );
  });
});
