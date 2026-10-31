import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ICON_NAMES } from "../packages/core/src/index.js";
import {
  FONT_CODEPOINT_MANIFEST,
  FONT_CODEPOINTS,
  FONT_COMPATIBLE_STYLES,
  FONT_FAMILIES,
  FONT_FILE_BASENAMES
} from "../packages/font/src/index.js";
import {
  convertDuotoneSvgForFlutter,
  generateFlutterCatalogDartModule,
  generateFlutterIconsDartModule,
  toCamelCase,
  toSafeDartIdentifier
} from "../scripts/generate-flutter.js";
import { discoverAndValidateIcons } from "../scripts/icon-pipeline.js";

describe("Phase 3A: slatico_icons Flutter Package Generation & Verification", () => {
  it("converts kebab-case icon names to camelCase and handles Dart reserved identifiers safely", () => {
    expect(toCamelCase("house")).toBe("house");
    expect(toCamelCase("shield-check")).toBe("shieldCheck");
    expect(toCamelCase("sliders-horizontal")).toBe("slidersHorizontal");
    expect(toCamelCase("trash-x")).toBe("trashX");

    expect(toSafeDartIdentifier("house", "regular")).toBe("houseRegular");
    expect(toSafeDartIdentifier("shield-check", "bold")).toBe("shieldCheckBold");

    // Reserved Dart keywords and Enum built-in properties must be escaped safely
    expect(toSafeDartIdentifier("switch")).toBe("switchIcon");
    expect(toSafeDartIdentifier("default")).toBe("defaultIcon");
    expect(toSafeDartIdentifier("class")).toBe("classIcon");
    expect(toSafeDartIdentifier("index")).toBe("indexIcon");
    expect(toSafeDartIdentifier("values")).toBe("valuesIcon");
    expect(toSafeDartIdentifier("3d-box")).toBe("icon3dBox");

    // Style-suffixed identifiers for reserved root words do not collide with reserved words
    expect(toSafeDartIdentifier("switch", "regular")).toBe("switchRegular");
  });

  it("verifies all 23 icon families, 115 monochrome IconData entries, and exact codepoint parity with @slatico/font", async () => {
    const repoRoot = process.cwd();
    const flutterRoot = path.join(repoRoot, "packages/flutter");

    const [catalogDart, iconsDart] = await Promise.all([
      fs.readFile(path.join(flutterRoot, "lib/src/generated/slatico_catalog.g.dart"), "utf8"),
      fs.readFile(path.join(flutterRoot, "lib/src/generated/slatico_icons.g.dart"), "utf8")
    ]);

    expect(iconsDart).toContain("static const String fontPackage = 'slatico_icons';");
    expect(iconsDart).toContain("static const int familyCount = 27;");
    expect(iconsDart).toContain("static const int monochromeGlyphCount = 135;");

    // Verify all 135 static const IconData declarations exist and match FONT_CODEPOINTS
    const iconDataMatches = [...iconsDart.matchAll(/static const IconData (\w+) = IconData\(\s*(0x[0-9a-f]{4}),/g)];
    expect(iconDataMatches.length).toBe(135);

    for (const iconName of ICON_NAMES) {
      const enumIdent = toSafeDartIdentifier(iconName);
      expect(catalogDart).toContain(`${enumIdent}('${iconName}')`);

      const expectedHex = FONT_CODEPOINTS[iconName].toLowerCase();
      for (const style of FONT_COMPATIBLE_STYLES) {
        const propName = toSafeDartIdentifier(iconName, style);
        expect(iconsDart).toContain(`static const IconData ${propName} = IconData(\n    ${expectedHex},`);
        expect(iconsDart).toContain(`'${iconName}-${style}': ${propName},`);
      }
    }

    // Verify no demo icons leaked into generated Dart code
    expect(catalogDart).not.toContain("'cube'");
    expect(catalogDart).not.toContain("'sparkle'");
    expect(iconsDart).not.toContain("cubeRegular");
    expect(iconsDart).not.toContain("sparkleRegular");
  });

  it("bundles all 5 TTF font files (byte-for-byte identical to @slatico/font) and all 46 Duotone & Color SVG assets", async () => {
    const repoRoot = process.cwd();
    const flutterRoot = path.join(repoRoot, "packages/flutter");
    const fontPkgFontsDir = path.join(repoRoot, "packages/font/dist/fonts");
    const flutterFontsDir = path.join(flutterRoot, "assets/fonts");

    for (const style of FONT_COMPATIBLE_STYLES) {
      const fileBase = FONT_FILE_BASENAMES[style];
      const [sourceTtf, flutterTtf] = await Promise.all([
        fs.readFile(path.join(fontPkgFontsDir, `${fileBase}.ttf`)),
        fs.readFile(path.join(flutterFontsDir, `${fileBase}.ttf`))
      ]);
      expect(flutterTtf.byteLength).toBeGreaterThan(2000);
      expect(Buffer.compare(sourceTtf, flutterTtf)).toBe(0);
    }

    const duotoneDir = path.join(flutterRoot, "assets/svg/duotone");
    const colorDir = path.join(flutterRoot, "assets/svg/color");
    const [duotoneFiles, colorFiles] = await Promise.all([
      fs.readdir(duotoneDir),
      fs.readdir(colorDir)
    ]);

    expect(
      duotoneFiles
        .filter((f) => f.endsWith(".svg"))
        .map((f) => f.slice(0, -4))
        .sort()
    ).toEqual(ICON_NAMES);
    expect(
      colorFiles
        .filter((f) => f.endsWith(".svg"))
        .map((f) => f.slice(0, -4))
        .sort()
    ).toEqual(ICON_NAMES);

    // Verify all 46 SVG assets are flutter_svg-compatible (valid 24x24 viewBox, no CSS var(--...) expressions)
    for (const iconName of ICON_NAMES) {
      const [duotoneSvg, colorSvg] = await Promise.all([
        fs.readFile(path.join(duotoneDir, `${iconName}.svg`), "utf8"),
        fs.readFile(path.join(colorDir, `${iconName}.svg`), "utf8")
      ]);

      expect(duotoneSvg).toContain('viewBox="0 0 24 24"');
      expect(duotoneSvg).toContain('width="24"');
      expect(duotoneSvg).toContain('height="24"');
      expect(duotoneSvg).not.toContain("var(--slatico");

      expect(colorSvg).toContain('viewBox="0 0 24 24"');
      expect(colorSvg).toContain('width="24"');
      expect(colorSvg).toContain('height="24"');
      expect(colorSvg).toContain("#FF6040");
    }
  });

  it("verifies pub.dev package structure, pubspec.yaml font/asset declarations, and deterministic codegen", async () => {
    const repoRoot = process.cwd();
    const flutterRoot = path.join(repoRoot, "packages/flutter");

    const requiredFiles = [
      "pubspec.yaml",
      "analysis_options.yaml",
      "README.md",
      "CHANGELOG.md",
      "LICENSE",
      "lib/slatico_icons.dart",
      "lib/src/slatico_icon_data.dart",
      "lib/src/slatico_icon_widget.dart",
      "lib/src/slatico_theme.dart",
      "lib/src/generated/slatico_catalog.g.dart",
      "lib/src/generated/slatico_icons.g.dart",
      "test/slatico_icons_test.dart",
      "example/pubspec.yaml",
      "example/analysis_options.yaml",
      "example/README.md",
      "example/lib/main.dart"
    ];

    for (const relPath of requiredFiles) {
      const stat = await fs.stat(path.join(flutterRoot, relPath));
      expect(stat.isFile()).toBe(true);
      expect(stat.size).toBeGreaterThan(0);
    }

    const pubspec = await fs.readFile(path.join(flutterRoot, "pubspec.yaml"), "utf8");
    expect(pubspec).toContain("name: slatico_icons");
    expect(pubspec).toContain("repository: https://github.com/infitusofficial/slatico/tree/main/packages/flutter");
    expect(pubspec).toContain("flutter_svg: ^2.0.17");
    expect(pubspec).toContain("- assets/svg/duotone/");
    expect(pubspec).toContain("- assets/svg/color/");

    for (const style of FONT_COMPATIBLE_STYLES) {
      expect(pubspec).toContain(`family: ${FONT_FAMILIES[style]}`);
      expect(pubspec).toContain(`asset: assets/fonts/${FONT_FILE_BASENAMES[style]}.ttf`);
    }

    // Verify deterministic Dart output across repeated calls
    const discovery = await discoverAndValidateIcons(path.join(repoRoot, "icons"), repoRoot);
    const cat1 = generateFlutterCatalogDartModule(discovery.families);
    const cat2 = generateFlutterCatalogDartModule(discovery.families);
    expect(cat1).toBe(cat2);

    const icons1 = generateFlutterIconsDartModule(discovery.families, FONT_CODEPOINT_MANIFEST);
    const icons2 = generateFlutterIconsDartModule(discovery.families, FONT_CODEPOINT_MANIFEST);
    expect(icons1).toBe(icons2);

    const sampleDuotone = convertDuotoneSvgForFlutter(
      discovery.families[0]!.variants.duotone.optimizedSvg
    );
    expect(sampleDuotone.staticAssetSvg).not.toContain("var(--slatico");
    expect(sampleDuotone.flutterTemplateSvg).toContain("__SLATICO_PRIMARY_COLOR__");
    expect(sampleDuotone.flutterTemplateSvg).toContain("__SLATICO_SECONDARY_COLOR__");
  });
});
