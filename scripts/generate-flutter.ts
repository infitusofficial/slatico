import fs from "node:fs/promises";
import path from "node:path";
import {
  parseCodepointHex,
  type SlaticoCodepointManifest
} from "../packages/font/src/codepoints.js";
import {
  compileStyleFontBuffers,
  FONT_FAMILY_NAMES,
  FONT_FILE_BASENAMES,
  FONT_MONOCHROME_STYLES,
  type FontMonochromeStyle
} from "./font-compiler.js";
import type { DiscoveredIconFamily } from "./icon-pipeline.js";

export const DART_RESERVED_WORDS = new Set([
  "abstract",
  "as",
  "assert",
  "async",
  "await",
  "base",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "covariant",
  "default",
  "deferred",
  "do",
  "dynamic",
  "else",
  "enum",
  "export",
  "extends",
  "extension",
  "external",
  "factory",
  "false",
  "final",
  "finally",
  "for",
  "Function",
  "get",
  "hide",
  "if",
  "implements",
  "import",
  "in",
  "index",
  "interface",
  "is",
  "late",
  "library",
  "mixin",
  "name",
  "new",
  "null",
  "of",
  "on",
  "operator",
  "part",
  "required",
  "rethrow",
  "return",
  "sealed",
  "set",
  "show",
  "static",
  "super",
  "switch",
  "sync",
  "this",
  "throw",
  "true",
  "try",
  "type",
  "typedef",
  "values",
  "var",
  "void",
  "when",
  "while",
  "with",
  "yield",
  "hashCode",
  "runtimeType",
  "toString",
  "noSuchMethod"
]);

export function toCamelCase(kebab: string): string {
  const parts = kebab.split("-").filter(Boolean);
  if (parts.length === 0) {
    throw new Error(`Cannot convert empty icon name "${kebab}" to camelCase.`);
  }
  return (
    parts[0]!.toLowerCase() +
    parts
      .slice(1)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
      .join("")
  );
}

export function toSafeDartIdentifier(kebab: string, suffix = ""): string {
  const rawCamel = toCamelCase(kebab);
  const candidate = suffix
    ? `${rawCamel}${suffix.charAt(0).toUpperCase()}${suffix.slice(1)}`
    : rawCamel;

  if (/^[0-9]/.test(candidate)) {
    return `icon${candidate.charAt(0).toUpperCase()}${candidate.slice(1)}`;
  }
  if (DART_RESERVED_WORDS.has(candidate)) {
    return `${candidate}Icon`;
  }
  return candidate;
}

/**
 * Converts a web-optimized Duotone SVG (which uses CSS custom properties
 * `var(--slatico-secondary-color, ...)` and `var(--slatico-secondary-opacity, ...)`
 * not supported by `flutter_svg`) into a clean, standards-compliant SVG for Flutter.
 * Also produces a tokenized template string so `SlaticoIcon` in Flutter can dynamically
 * inject primary `color`, `secondaryColor`, and `secondaryOpacity` without flattening layers.
 */
export function convertDuotoneSvgForFlutter(optimizedWebDuotoneSvg: string): {
  staticAssetSvg: string;
  flutterTemplateSvg: string;
  defaultSecondaryOpacity: number;
} {
  let defaultSecondaryOpacity = 0.2;

  const opacityMatch = optimizedWebDuotoneSvg.match(
    /var\(--slatico-secondary-opacity,\s*([0-9.]+)\)/
  );
  if (opacityMatch && opacityMatch[1]) {
    const parsed = Number.parseFloat(opacityMatch[1]);
    if (Number.isFinite(parsed)) {
      defaultSecondaryOpacity = parsed;
    }
  }

  let staticAssetSvg = optimizedWebDuotoneSvg
    .replace(
      /var\(--slatico-secondary-color,\s*([^)]+)\)/g,
      (_m, fallback: string) => fallback.trim()
    )
    .replace(
      /var\(--slatico-secondary-opacity,\s*([^)]+)\)/g,
      (_m, fallback: string) => fallback.trim()
    );

  if (!/\bwidth="/.test(staticAssetSvg)) {
    staticAssetSvg = staticAssetSvg.replace("<svg ", '<svg width="24" height="24" ');
  }

  let flutterTemplateSvg = optimizedWebDuotoneSvg
    .replace(/var\(--slatico-secondary-color,\s*[^)]+\)/g, "__SLATICO_SECONDARY_COLOR__")
    .replace(/var\(--slatico-secondary-opacity,\s*[^)]+\)/g, "__SLATICO_SECONDARY_OPACITY__")
    .replace(/fill="currentColor"/g, 'fill="__SLATICO_PRIMARY_COLOR__"')
    .replace(/stroke="currentColor"/g, 'stroke="__SLATICO_PRIMARY_COLOR__"');

  if (!/\bwidth="/.test(flutterTemplateSvg)) {
    flutterTemplateSvg = flutterTemplateSvg.replace("<svg ", '<svg width="24" height="24" ');
  }

  return {
    staticAssetSvg,
    flutterTemplateSvg,
    defaultSecondaryOpacity
  };
}

export function convertColorSvgForFlutter(optimizedWebColorSvg: string): string {
  let svg = optimizedWebColorSvg;
  if (!/\bwidth="/.test(svg)) {
    svg = svg.replace("<svg ", '<svg width="24" height="24" ');
  }
  return svg;
}

export function generateFlutterCatalogDartModule(
  families: readonly DiscoveredIconFamily[]
): string {
  const enumEntries = families.map((fam) => {
    const enumIdent = toSafeDartIdentifier(fam.name);
    return `  /// The \`${fam.name}\` Tier 1 icon family.\n  ${enumIdent}('${fam.name}')`;
  });

  const duotoneTemplateEntries: string[] = [];
  const duotoneDefaultOpacities: string[] = [];

  for (const fam of families) {
    const enumIdent = toSafeDartIdentifier(fam.name);
    const { flutterTemplateSvg, defaultSecondaryOpacity } = convertDuotoneSvgForFlutter(
      fam.variants.duotone.optimizedSvg
    );
    const escapedSvg = flutterTemplateSvg.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    duotoneTemplateEntries.push(
      `  SlaticoIconName.${enumIdent}:\n      '${escapedSvg}',`
    );
    duotoneDefaultOpacities.push(
      `  SlaticoIconName.${enumIdent}: ${defaultSecondaryOpacity},`
    );
  }

  return `// GENERATED CODE - DO NOT MODIFY BY HAND
// Generated deterministically by scripts/generate-flutter.ts from master SVG sources.

/// Enumeration of all ${families.length} production Slatico icon families.
enum SlaticoIconName {
${enumEntries.join(",\n\n")};

  const SlaticoIconName(this.kebabName);

  /// Canonical kebab-case identifier matching \`@slatico/core\` and SVG filenames.
  final String kebabName;

  /// Relative asset path inside \`slatico_icons\` for the \`duotone\` SVG variant.
  String get duotoneAssetPath => 'assets/svg/duotone/$kebabName.svg';

  /// Package-prefixed asset path for the \`duotone\` SVG variant.
  String get duotonePackageAssetPath =>
      'packages/slatico_icons/assets/svg/duotone/$kebabName.svg';

  /// Relative asset path inside \`slatico_icons\` for the \`color\` SVG variant.
  String get colorAssetPath => 'assets/svg/color/$kebabName.svg';

  /// Package-prefixed asset path for the \`color\` SVG variant.
  String get colorPackageAssetPath =>
      'packages/slatico_icons/assets/svg/color/$kebabName.svg';

  /// Resolves a [SlaticoIconName] from its canonical kebab-case name, or returns \`null\`.
  static SlaticoIconName? tryFromKebab(String name) {
    for (final value in SlaticoIconName.values) {
      if (value.kebabName == name) {
        return value;
      }
    }
    return null;
  }
}

/// Default authored opacity for the secondary layer of each Duotone icon.
const Map<SlaticoIconName, double> slaticoDuotoneDefaultOpacity =
    <SlaticoIconName, double>{
${duotoneDefaultOpacities.join("\n")}
};

/// Tokenized 24x24 Duotone SVG templates supporting dynamic primary color,
/// secondary color, and secondary opacity injection in \`flutter_svg\`.
const Map<SlaticoIconName, String> slaticoDuotoneSvgTemplates =
    <SlaticoIconName, String>{
${duotoneTemplateEntries.join("\n")}
};
`;
}

export function generateFlutterIconsDartModule(
  families: readonly DiscoveredIconFamily[],
  manifest: SlaticoCodepointManifest
): string {
  const styleFieldMap: Readonly<Record<FontMonochromeStyle, string>> = {
    thin: "fontFamilyThin",
    light: "fontFamilyLight",
    regular: "fontFamilyRegular",
    bold: "fontFamilyBold",
    fill: "fontFamilyFill"
  };

  const constantDeclarations: string[] = [];
  const allEntries: string[] = [];
  const styleMapEntries: Record<FontMonochromeStyle, string[]> = {
    thin: [],
    light: [],
    regular: [],
    bold: [],
    fill: []
  };

  for (const fam of families) {
    const hex = manifest.codepoints[fam.name];
    if (!hex) {
      throw new Error(`Missing Unicode PUA codepoint for icon "${fam.name}".`);
    }
    const num = parseCodepointHex(hex);
    const hexLiteral = `0x${num.toString(16).toLowerCase().padStart(4, "0")}`;
    const enumIdent = toSafeDartIdentifier(fam.name);

    for (const style of FONT_MONOCHROME_STYLES) {
      const propName = toSafeDartIdentifier(fam.name, style);
      const fontConstName = styleFieldMap[style];
      constantDeclarations.push(
        `  /// \`${fam.name}\` icon in \`${style}\` monochrome font style (\`U+${num
          .toString(16)
          .toUpperCase()
          .padStart(4, "0")}\`).`,
        `  static const IconData ${propName} = IconData(`,
        `    ${hexLiteral},`,
        `    fontFamily: ${fontConstName},`,
        `    fontPackage: fontPackage,`,
        `  );`,
        ""
      );
      allEntries.push(`    '${fam.name}-${style}': ${propName},`);
      styleMapEntries[style].push(`    SlaticoIconName.${enumIdent}: ${propName},`);
    }
  }

  return `// GENERATED CODE - DO NOT MODIFY BY HAND
// Generated deterministically by scripts/generate-flutter.ts from master SVG sources
// and packages/font/codepoints.json.

import 'package:flutter/widgets.dart';
import '../slatico_icon_data.dart';
import 'slatico_catalog.g.dart';

/// Static \`IconData\` constants and lookup tables for all ${families.length} Tier 1 Slatico
/// icon families across the 5 monochrome font styles (\`thin\`, \`light\`, \`regular\`, \`bold\`, \`fill\`,
/// totaling ${families.length * FONT_MONOCHROME_STYLES.length} \`IconData\` constants).
///
/// Note: \`duotone\` and \`color\` styles require multi-layer / multicolor vector rendering.
/// Use the \`SlaticoIcon\` widget for \`SlaticoStyle.duotone\` and \`SlaticoStyle.color\`.
abstract final class SlaticoIcons {
  /// Flutter package name used to resolve bundled TTF fonts and SVG assets.
  static const String fontPackage = 'slatico_icons';

  /// Bundled TTF font family name for \`thin\` (1px stroke) icons.
  static const String fontFamilyThin = '${FONT_FAMILY_NAMES.thin}';

  /// Bundled TTF font family name for \`light\` (1.5px stroke) icons.
  static const String fontFamilyLight = '${FONT_FAMILY_NAMES.light}';

  /// Bundled TTF font family name for \`regular\` (2px stroke) icons.
  static const String fontFamilyRegular = '${FONT_FAMILY_NAMES.regular}';

  /// Bundled TTF font family name for \`bold\` (3px stroke) icons.
  static const String fontFamilyBold = '${FONT_FAMILY_NAMES.bold}';

  /// Bundled TTF font family name for \`fill\` (solid silhouette) icons.
  static const String fontFamilyFill = '${FONT_FAMILY_NAMES.fill}';

  /// Total number of production icon families in Tier 1.
  static const int familyCount = ${families.length};

  /// Total number of monochrome \`IconData\` constants (${families.length} families × 5 styles).
  static const int monochromeGlyphCount = ${families.length * FONT_MONOCHROME_STYLES.length};

${constantDeclarations.join("\n").trimEnd()}

  /// Lookup table for \`thin\` monochrome \`IconData\` by [SlaticoIconName].
  static const Map<SlaticoIconName, IconData> thinIcons =
      <SlaticoIconName, IconData>{
${styleMapEntries.thin.join("\n")}
  };

  /// Lookup table for \`light\` monochrome \`IconData\` by [SlaticoIconName].
  static const Map<SlaticoIconName, IconData> lightIcons =
      <SlaticoIconName, IconData>{
${styleMapEntries.light.join("\n")}
  };

  /// Lookup table for \`regular\` monochrome \`IconData\` by [SlaticoIconName].
  static const Map<SlaticoIconName, IconData> regularIcons =
      <SlaticoIconName, IconData>{
${styleMapEntries.regular.join("\n")}
  };

  /// Lookup table for \`bold\` monochrome \`IconData\` by [SlaticoIconName].
  static const Map<SlaticoIconName, IconData> boldIcons =
      <SlaticoIconName, IconData>{
${styleMapEntries.bold.join("\n")}
  };

  /// Lookup table for \`fill\` monochrome \`IconData\` by [SlaticoIconName].
  static const Map<SlaticoIconName, IconData> fillIcons =
      <SlaticoIconName, IconData>{
${styleMapEntries.fill.join("\n")}
  };

  /// All ${families.length * FONT_MONOCHROME_STYLES.length} monochrome \`IconData\` constants keyed by \`<icon-name>-<style>\`.
  static const Map<String, IconData> allMonochrome = <String, IconData>{
${allEntries.join("\n")}
  };

  /// Returns the monochrome [IconData] for [name] and [style].
  ///
  /// Throws an [ArgumentError] if [style] is [SlaticoStyle.duotone] or [SlaticoStyle.color],
  /// which must be rendered via the \`SlaticoIcon\` SVG widget.
  static IconData forIcon(
    SlaticoIconName name, [
    SlaticoStyle style = SlaticoStyle.regular,
  ]) {
    switch (style) {
      case SlaticoStyle.thin:
        return thinIcons[name]!;
      case SlaticoStyle.light:
        return lightIcons[name]!;
      case SlaticoStyle.regular:
        return regularIcons[name]!;
      case SlaticoStyle.bold:
        return boldIcons[name]!;
      case SlaticoStyle.fill:
        return fillIcons[name]!;
      case SlaticoStyle.duotone:
      case SlaticoStyle.color:
        throw ArgumentError.value(
          style,
          'style',
          'SlaticoStyle.\${style.name} uses multi-layer/multicolor SVG vectors and cannot be represented as a monochrome IconData. Use the SlaticoIcon widget instead.',
        );
    }
  }
}
`;
}

export async function generateFlutterPackageArtifacts(
  repoRoot: string,
  families: readonly DiscoveredIconFamily[],
  manifest: SlaticoCodepointManifest
): Promise<void> {
  const flutterRoot = path.join(repoRoot, "packages", "flutter");
  const fontsDir = path.join(flutterRoot, "assets", "fonts");
  const duotoneSvgDir = path.join(flutterRoot, "assets", "svg", "duotone");
  const colorSvgDir = path.join(flutterRoot, "assets", "svg", "color");
  const generatedDartDir = path.join(flutterRoot, "lib", "src", "generated");

  await fs.rm(fontsDir, { recursive: true, force: true });
  await fs.rm(duotoneSvgDir, { recursive: true, force: true });
  await fs.rm(colorSvgDir, { recursive: true, force: true });
  await fs.mkdir(fontsDir, { recursive: true });
  await fs.mkdir(duotoneSvgDir, { recursive: true });
  await fs.mkdir(colorSvgDir, { recursive: true });
  await fs.mkdir(generatedDartDir, { recursive: true });

  // 1. Copy/compile the 5 deterministic monochrome TTF font files into assets/fonts/
  for (const style of FONT_MONOCHROME_STYLES) {
    const fileBase = FONT_FILE_BASENAMES[style];
    const existingFontDistTtf = path.join(
      repoRoot,
      "packages",
      "font",
      "dist",
      "fonts",
      `${fileBase}.ttf`
    );
    let ttfBuf: Buffer;
    try {
      ttfBuf = await fs.readFile(existingFontDistTtf);
    } catch {
      const compiled = await compileStyleFontBuffers(style, families, manifest);
      ttfBuf = compiled.ttf;
    }
    await fs.writeFile(path.join(fontsDir, `${fileBase}.ttf`), ttfBuf);
  }

  // 2. Write the 23 Duotone and 23 Color SVG assets (46 total) into assets/svg/{duotone,color}/
  for (const fam of families) {
    const { staticAssetSvg } = convertDuotoneSvgForFlutter(
      fam.variants.duotone.optimizedSvg
    );
    await fs.writeFile(
      path.join(duotoneSvgDir, `${fam.name}.svg`),
      `${staticAssetSvg}\n`,
      "utf8"
    );

    const colorSvg = convertColorSvgForFlutter(fam.variants.color.optimizedSvg);
    await fs.writeFile(
      path.join(colorSvgDir, `${fam.name}.svg`),
      `${colorSvg}\n`,
      "utf8"
    );
  }

  // 3. Write generated Dart modules into lib/src/generated/
  await fs.writeFile(
    path.join(generatedDartDir, "slatico_catalog.g.dart"),
    generateFlutterCatalogDartModule(families),
    "utf8"
  );
  await fs.writeFile(
    path.join(generatedDartDir, "slatico_icons.g.dart"),
    generateFlutterIconsDartModule(families, manifest),
    "utf8"
  );
}
