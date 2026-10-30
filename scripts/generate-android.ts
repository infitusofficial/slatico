import fs from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";
import { SLATICO_STYLES, type SlaticoStyle } from "../packages/core/src/types.js";
import { toPascalCase } from "../packages/core/src/utils.js";
import type { DiscoveredIconFamily } from "./icon-pipeline.js";

const ORDERED_XML_PARSER = new XMLParser({
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

interface OrderedXmlNode {
  [key: string]: unknown;
  ":@"?: Record<string, string>;
}

export const KOTLIN_RESERVED_WORDS = new Set([
  "as",
  "break",
  "class",
  "continue",
  "do",
  "else",
  "false",
  "for",
  "fun",
  "if",
  "in",
  "interface",
  "is",
  "null",
  "object",
  "package",
  "return",
  "super",
  "this",
  "throw",
  "true",
  "try",
  "typealias",
  "typeof",
  "val",
  "var",
  "when",
  "while"
]);

export const ANDROID_UNSUPPORTED_SVG_TAGS = new Set([
  "filter",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDropShadow",
  "feFlood",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMorphology",
  "feOffset",
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "foreignObject",
  "image",
  "mask",
  "pattern",
  "switch",
  "text",
  "tspan",
  "use"
]);

export function toSnakeCase(kebab: string): string {
  return kebab.replace(/-/g, "_").toLowerCase();
}

export function toEnumConstantName(kebab: string): string {
  const upper = kebab.replace(/-/g, "_").toUpperCase();
  if (/^[0-9]/.test(upper)) {
    return `ICON_${upper}`;
  }
  return upper;
}

export function toKotlinPropertyName(kebab: string): string {
  const parts = kebab.split("-").filter(Boolean);
  if (parts.length === 0) {
    throw new Error(`Invalid empty icon name "${kebab}".`);
  }
  const camel =
    parts[0]!.toLowerCase() +
    parts
      .slice(1)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
      .join("");
  if (/^[0-9]/.test(camel)) {
    return `icon${camel.charAt(0).toUpperCase()}${camel.slice(1)}`;
  }
  if (KOTLIN_RESERVED_WORDS.has(camel)) {
    return `${camel}Icon`;
  }
  return camel;
}

export function getAndroidDrawableResourceName(
  iconName: string,
  style: SlaticoStyle
): string {
  return `slatico_${toSnakeCase(iconName)}_${style}`;
}

export interface AndroidVectorPathSpec {
  readonly pathData: string;
  readonly fillColor: string | null;
  readonly fillAlpha: number;
  readonly fillType: "nonZero" | "evenOdd";
  readonly strokeColor: string | null;
  readonly strokeWidth: number | null;
  readonly strokeAlpha: number;
  readonly strokeLineCap: "butt" | "round" | "square" | null;
  readonly strokeLineJoin: "miter" | "round" | "bevel" | null;
  readonly isSecondaryLayer: boolean;
}

interface InheritedSvgStyle {
  fill: string | null;
  fillRule: string | null;
  opacity: number;
  fillOpacity: number;
  stroke: string | null;
  strokeWidth: number | null;
  strokeOpacity: number;
  strokeLineCap: string | null;
  strokeLineJoin: string | null;
  isSecondaryLayer: boolean;
}

function parseCssOrNumericOpacity(
  rawVal: string | undefined,
  onSecondaryDetected: () => void
): number {
  if (!rawVal) {
    return 1;
  }
  const trimmed = rawVal.trim();
  const varMatch = trimmed.match(
    /^var\(--slatico-secondary-opacity,\s*([0-9.]+)\)$/
  );
  if (varMatch && varMatch[1]) {
    onSecondaryDetected();
    const parsed = Number.parseFloat(varMatch[1]);
    return Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : 0.2;
  }
  const num = Number.parseFloat(trimmed);
  return Number.isFinite(num) ? Math.max(0, Math.min(1, num)) : 1;
}

function normalizeAndroidHexColor(
  rawColor: string | null,
  onSecondaryDetected: () => void
): string | null {
  if (!rawColor) {
    return null;
  }
  const trimmed = rawColor.trim();
  if (trimmed === "none") {
    return null;
  }
  const varMatch = trimmed.match(/^var\(--slatico-secondary-color,\s*([^)]+)\)$/);
  if (varMatch && varMatch[1]) {
    onSecondaryDetected();
    return normalizeAndroidHexColor(varMatch[1].trim(), onSecondaryDetected);
  }
  if (trimmed === "currentColor" || trimmed === "black" || trimmed === "#000" || trimmed === "#000000") {
    return "#FF000000";
  }
  if (trimmed === "white" || trimmed === "#fff" || trimmed === "#FFF" || trimmed === "#ffffff" || trimmed === "#FFFFFF") {
    return "#FFFFFFFF";
  }
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1]!.toUpperCase();
    const g = trimmed[2]!.toUpperCase();
    const b = trimmed[3]!.toUpperCase();
    return `#FF${r}${r}${g}${g}${b}${b}`;
  }
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return `#FF${trimmed.slice(1).toUpperCase()}`;
  }
  if (/^#[0-9a-fA-F]{8}$/.test(trimmed)) {
    // SVG 8-digit hex is #RRGGBBAA; Android is #AARRGGBB
    const rgb = trimmed.slice(1, 7).toUpperCase();
    const alpha = trimmed.slice(7, 9).toUpperCase();
    return `#${alpha}${rgb}`;
  }
  throw new Error(
    `Unsupported SVG color value "${rawColor}" for Android VectorDrawable conversion.`
  );
}

export function extractAndroidPathsFromSvg(
  svgContent: string,
  iconName: string,
  style: SlaticoStyle
): {
  paths: AndroidVectorPathSpec[];
  unsupportedFeatures: string[];
} {
  const orderedTree = ORDERED_XML_PARSER.parse(svgContent) as OrderedXmlNode[];
  const paths: AndroidVectorPathSpec[] = [];
  const unsupportedFeatures: string[] = [];

  function walkNodes(
    nodes: readonly OrderedXmlNode[],
    inherited: InheritedSvgStyle
  ): void {
    for (const node of nodes) {
      const tagNames = Object.keys(node).filter(
        (k) => k !== ":@" && k !== "#text"
      );
      const tagName = tagNames[0];
      if (!tagName) {
        continue;
      }

      if (ANDROID_UNSUPPORTED_SVG_TAGS.has(tagName)) {
        unsupportedFeatures.push(
          `Unsupported SVG element <${tagName}> in ${style}/${iconName}.svg`
        );
        continue;
      }

      const attrs = node[":@"] ?? {};
      let isSecondary = inherited.isSecondaryLayer;
      if (attrs["@_data-slatico-layer"] === "secondary") {
        isSecondary = true;
      }

      const elemOpacity = parseCssOrNumericOpacity(attrs["@_opacity"], () => {
        isSecondary = true;
      });
      const elemFillOpacity = parseCssOrNumericOpacity(
        attrs["@_fill-opacity"],
        () => {
          isSecondary = true;
        }
      );
      const elemStrokeOpacity = parseCssOrNumericOpacity(
        attrs["@_stroke-opacity"],
        () => {
          isSecondary = true;
        }
      );

      const rawFill = attrs["@_fill"];
      const resolvedFill =
        rawFill !== undefined
          ? normalizeAndroidHexColor(rawFill, () => {
              isSecondary = true;
            })
          : inherited.fill;

      const rawStroke = attrs["@_stroke"];
      const resolvedStroke =
        rawStroke !== undefined
          ? normalizeAndroidHexColor(rawStroke, () => {
              isSecondary = true;
            })
          : inherited.stroke;

      const rawStrokeWidth = attrs["@_stroke-width"];
      const resolvedStrokeWidth =
        rawStrokeWidth !== undefined
          ? Number.parseFloat(rawStrokeWidth)
          : inherited.strokeWidth;

      const resolvedFillRule = attrs["@_fill-rule"] ?? inherited.fillRule;
      const resolvedLineCap =
        attrs["@_stroke-linecap"] ?? inherited.strokeLineCap;
      const resolvedLineJoin =
        attrs["@_stroke-linejoin"] ?? inherited.strokeLineJoin;

      const currentStyle: InheritedSvgStyle = {
        fill: resolvedFill,
        fillRule: resolvedFillRule,
        opacity: inherited.opacity * elemOpacity,
        fillOpacity: inherited.fillOpacity * elemFillOpacity,
        stroke: resolvedStroke,
        strokeWidth: resolvedStrokeWidth,
        strokeOpacity: inherited.strokeOpacity * elemStrokeOpacity,
        strokeLineCap: resolvedLineCap,
        strokeLineJoin: resolvedLineJoin,
        isSecondaryLayer: isSecondary
      };

      if (tagName === "path") {
        const d = attrs["@_d"]?.trim();
        if (!d) {
          continue;
        }
        const effectiveFillAlpha = Number(
          (currentStyle.opacity * currentStyle.fillOpacity).toFixed(4)
        );
        const effectiveStrokeAlpha = Number(
          (currentStyle.opacity * currentStyle.strokeOpacity).toFixed(4)
        );
        if (style === "duotone" && effectiveFillAlpha < 1) {
          currentStyle.isSecondaryLayer = true;
        }

        const fillColor =
          currentStyle.fill ??
          (currentStyle.stroke === null ? "#FF000000" : null);

        paths.push({
          pathData: d,
          fillColor,
          fillAlpha: effectiveFillAlpha,
          fillType:
            currentStyle.fillRule?.toLowerCase() === "evenodd"
              ? "evenOdd"
              : "nonZero",
          strokeColor: currentStyle.stroke,
          strokeWidth: currentStyle.strokeWidth,
          strokeAlpha: effectiveStrokeAlpha,
          strokeLineCap:
            currentStyle.strokeLineCap === "round" ||
            currentStyle.strokeLineCap === "square" ||
            currentStyle.strokeLineCap === "butt"
              ? currentStyle.strokeLineCap
              : null,
          strokeLineJoin:
            currentStyle.strokeLineJoin === "round" ||
            currentStyle.strokeLineJoin === "bevel" ||
            currentStyle.strokeLineJoin === "miter"
              ? currentStyle.strokeLineJoin
              : null,
          isSecondaryLayer: currentStyle.isSecondaryLayer
        });
      }

      const children = (node[tagName] as OrderedXmlNode[] | undefined) ?? [];
      if (children.length > 0 && tagName !== "defs") {
        walkNodes(children, currentStyle);
      }
    }
  }

  walkNodes(orderedTree, {
    fill: null,
    fillRule: null,
    opacity: 1,
    fillOpacity: 1,
    stroke: null,
    strokeWidth: null,
    strokeOpacity: 1,
    strokeLineCap: null,
    strokeLineJoin: null,
    isSecondaryLayer: false
  });

  return { paths, unsupportedFeatures };
}

export function convertSvgToAndroidVectorDrawableXml(
  svgContent: string,
  iconName: string,
  style: SlaticoStyle
): {
  xml: string;
  paths: AndroidVectorPathSpec[];
  unsupportedFeatures: string[];
} {
  const { paths, unsupportedFeatures } = extractAndroidPathsFromSvg(
    svgContent,
    iconName,
    style
  );

  if (paths.length === 0) {
    throw new Error(
      `Android VectorDrawable conversion produced 0 <path> elements for ${style}/${iconName}.svg.`
    );
  }

  const lines: string[] = [
    '<?xml version="1.0" encoding="utf-8"?>',
    "<!-- AUTO-GENERATED BY scripts/generate-android.ts — DO NOT EDIT MANUALLY -->",
    '<vector xmlns:android="http://schemas.android.com/apk/res/android"',
    '    android:width="24dp"',
    '    android:height="24dp"',
    '    android:viewportWidth="24"',
    '    android:viewportHeight="24">'
  ];

  for (const p of paths) {
    const attrs: string[] = [`android:pathData="${p.pathData}"`];
    if (p.fillColor !== null) {
      attrs.push(`android:fillColor="${p.fillColor}"`);
    }
    if (p.fillAlpha < 1) {
      attrs.push(`android:fillAlpha="${p.fillAlpha}"`);
    }
    if (p.fillType === "evenOdd") {
      attrs.push('android:fillType="evenOdd"');
    }
    if (p.strokeColor !== null) {
      attrs.push(`android:strokeColor="${p.strokeColor}"`);
    }
    if (p.strokeWidth !== null && p.strokeWidth > 0) {
      attrs.push(`android:strokeWidth="${p.strokeWidth}"`);
    }
    if (p.strokeColor !== null && p.strokeAlpha < 1) {
      attrs.push(`android:strokeAlpha="${p.strokeAlpha}"`);
    }
    if (p.strokeLineCap !== null) {
      attrs.push(`android:strokeLineCap="${p.strokeLineCap}"`);
    }
    if (p.strokeLineJoin !== null) {
      attrs.push(`android:strokeLineJoin="${p.strokeLineJoin}"`);
    }

    lines.push("    <path");
    for (let i = 0; i < attrs.length; i++) {
      const suffix = i === attrs.length - 1 ? " />" : "";
      lines.push(`        ${attrs[i]}${suffix}`);
    }
  }

  lines.push("</vector>", "");
  return {
    xml: lines.join("\n"),
    paths,
    unsupportedFeatures
  };
}

export function generateKotlinIconNameModule(
  families: readonly DiscoveredIconFamily[]
): string {
  const enumEntries = families.map((fam) => {
    const constName = toEnumConstantName(fam.name);
    const snake = toSnakeCase(fam.name);
    return `    /** The \`${fam.name}\` Tier 1 icon family. */\n    ${constName}("${fam.name}", "${snake}")`;
  });

  return `// AUTO-GENERATED BY scripts/generate-android.ts — DO NOT EDIT MANUALLY
package com.infitus.slatico

/**
 * Enumeration of all ${families.length} production Slatico icon families.
 */
public enum class SlaticoIconName(
    /** Canonical kebab-case identifier matching \`@slatico/core\` and SVG filenames. */
    public val kebabName: String,
    /** Android snake_case identifier used in \`R.drawable.slatico_<snakeName>_<style>\`. */
    public val snakeName: String,
) {
${enumEntries.join(",\n\n")};

    /** Returns the Android drawable resource name (\`slatico_<snakeName>_<style>\`) for [style]. */
    public fun drawableResourceName(style: SlaticoStyle): String =
        "slatico_\${snakeName}_\${style.id}"

    public companion object {
        /** Looks up a [SlaticoIconName] by its canonical kebab-case name, or returns \`null\`. */
        @JvmStatic
        public fun fromKebabName(kebabName: String): SlaticoIconName? =
            entries.firstOrNull { it.kebabName == kebabName }

        /** Alias for [fromKebabName]. */
        @JvmStatic
        public fun fromKebabOrNull(kebabName: String): SlaticoIconName? =
            fromKebabName(kebabName)
    }
}
`;
}

export function generateKotlinDrawablesModule(
  families: readonly DiscoveredIconFamily[]
): string {
  const perIconObjects: string[] = [];
  const flatProps: string[] = [];
  const whenBranches: Record<SlaticoStyle, string[]> = {
    thin: [],
    light: [],
    regular: [],
    bold: [],
    fill: [],
    duotone: [],
    color: []
  };

  for (const fam of families) {
    const pascal = toPascalCase(fam.name);
    const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1);
    const enumConst = toEnumConstantName(fam.name);
    const styleProps: string[] = [];

    for (const style of SLATICO_STYLES) {
      const resName = getAndroidDrawableResourceName(fam.name, style);
      const stylePascal = toPascalCase(style);
      styleProps.push(
        `        @get:DrawableRes\n        public val ${style}: Int get() = R.drawable.${resName}`
      );
      flatProps.push(
        `    @get:DrawableRes\n    public val ${camel}${stylePascal}: Int get() = R.drawable.${resName}`
      );
      whenBranches[style].push(
        `            SlaticoIconName.${enumConst} -> R.drawable.${resName}`
      );
    }

    perIconObjects.push(
      `    /** Drawable resource IDs for the \`${fam.name}\` icon family across all 7 styles. */`,
      `    public object ${pascal} {`,
      styleProps.join("\n\n"),
      `    }`
    );
  }

  return `// AUTO-GENERATED BY scripts/generate-android.ts — DO NOT EDIT MANUALLY
package com.infitus.slatico

import androidx.annotation.DrawableRes

/**
 * Strongly-typed Android \`@DrawableRes\` lookup catalog for all ${families.length} Tier 1 Slatico
 * icon families across all ${SLATICO_STYLES.length} official styles (${
   families.length * SLATICO_STYLES.length
 } total VectorDrawable resources).
 */
public object SlaticoDrawables {
    /** Total number of production icon families in Tier 1. */
    public const val FAMILY_COUNT: Int = ${families.length}

    /** Total number of official Slatico styles. */
    public const val STYLE_COUNT: Int = ${SLATICO_STYLES.length}

    /** Total number of generated VectorDrawable XML resources (${families.length} × ${SLATICO_STYLES.length}). */
    public const val TOTAL_DRAWABLES: Int = ${families.length * SLATICO_STYLES.length}

    /** Alias for [TOTAL_DRAWABLES]. */
    public const val TOTAL_VARIANTS: Int = TOTAL_DRAWABLES

${flatProps.join("\n\n")}

${perIconObjects.join("\n\n")}

    /**
     * Resolves the \`@DrawableRes\` resource ID for [name] and [style].
     */
    @DrawableRes
    @JvmStatic
    public fun of(
        name: SlaticoIconName,
        style: SlaticoStyle = SlaticoStyle.REGULAR,
    ): Int = when (style) {
        SlaticoStyle.THIN -> when (name) {
${whenBranches.thin.join("\n")}
        }
        SlaticoStyle.LIGHT -> when (name) {
${whenBranches.light.join("\n")}
        }
        SlaticoStyle.REGULAR -> when (name) {
${whenBranches.regular.join("\n")}
        }
        SlaticoStyle.BOLD -> when (name) {
${whenBranches.bold.join("\n")}
        }
        SlaticoStyle.FILL -> when (name) {
${whenBranches.fill.join("\n")}
        }
        SlaticoStyle.DUOTONE -> when (name) {
${whenBranches.duotone.join("\n")}
        }
        SlaticoStyle.COLOR -> when (name) {
${whenBranches.color.join("\n")}
        }
    }

    /** Alias for [of]. */
    @DrawableRes
    @JvmStatic
    public fun forIcon(
        name: SlaticoIconName,
        style: SlaticoStyle = SlaticoStyle.REGULAR,
    ): Int = of(name, style)

    /**
     * Resolves the \`@DrawableRes\` resource ID by canonical kebab-case icon name and [style],
     * or returns \`null\` if the icon name is unknown.
     */
    @JvmStatic
    public fun fromKebabName(
        kebabName: String,
        style: SlaticoStyle = SlaticoStyle.REGULAR,
    ): Int? = SlaticoIconName.fromKebabName(kebabName)?.let { of(it, style) }
}
`;
}

export function generateKotlinDuotoneVectorsModule(
  families: readonly DiscoveredIconFamily[],
  duotonePathMap: ReadonlyMap<string, readonly AndroidVectorPathSpec[]>
): string {
  const entries: string[] = [];

  for (const fam of families) {
    const enumConst = toEnumConstantName(fam.name);
    const paths = duotonePathMap.get(fam.name) ?? [];
    const pathLiterals = paths.map((p) => {
      const escapedD = p.pathData.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      return `            SlaticoDuotonePathLayer(
                pathData = "${escapedD}",
                isSecondaryTone = ${p.isSecondaryLayer},
                defaultAlpha = ${p.fillAlpha}f,
                evenOdd = ${p.fillType === "evenOdd"},
            )`;
    });

    entries.push(
      `        SlaticoIconName.${enumConst} -> listOf(\n${pathLiterals.join(",\n")},\n        )`
    );
  }

  return `// AUTO-GENERATED BY scripts/generate-android.ts — DO NOT EDIT MANUALLY
package com.infitus.slatico

/**
 * Represents a single vector path layer within a 24x24 Slatico Duotone icon,
 * enabling independent primary and secondary color rendering in Jetpack Compose.
 */
public data class SlaticoDuotonePathLayer(
    public val pathData: String,
    public val isSecondaryTone: Boolean,
    public val defaultAlpha: Float,
    public val evenOdd: Boolean,
)

/**
 * Generated 24x24 vector path layer definitions for all ${families.length} Duotone icons.
 */
public object SlaticoDuotoneVectors {
    @JvmStatic
    public fun layersFor(name: SlaticoIconName): List<SlaticoDuotonePathLayer> = when (name) {
${entries.join("\n")}
    }
}
`;
}

export async function generateAndroidPackageArtifacts(
  repoRoot: string,
  families: readonly DiscoveredIconFamily[]
): Promise<{
  totalDrawables: number;
  unsupportedFeatures: string[];
}> {
  const androidRoot = path.join(repoRoot, "packages", "android");
  const drawableDir = path.join(
    androidRoot,
    "library",
    "src",
    "main",
    "res",
    "drawable"
  );
  const generatedKotlinDir = path.join(
    androidRoot,
    "library",
    "src",
    "main",
    "kotlin",
    "com",
    "infitus",
    "slatico",
    "generated"
  );

  await fs.rm(drawableDir, { recursive: true, force: true });
  await fs.rm(generatedKotlinDir, { recursive: true, force: true });
  await fs.mkdir(drawableDir, { recursive: true });
  await fs.mkdir(generatedKotlinDir, { recursive: true });

  let totalDrawables = 0;
  const allUnsupported: string[] = [];
  const duotonePathMap = new Map<string, readonly AndroidVectorPathSpec[]>();

  for (const fam of families) {
    for (const style of SLATICO_STYLES) {
      const resName = getAndroidDrawableResourceName(fam.name, style);
      const { xml, paths, unsupportedFeatures } =
        convertSvgToAndroidVectorDrawableXml(
          fam.variants[style].optimizedSvg,
          fam.name,
          style
        );

      if (unsupportedFeatures.length > 0) {
        allUnsupported.push(...unsupportedFeatures);
      }

      if (style === "duotone") {
        duotonePathMap.set(fam.name, paths);
      }

      await fs.writeFile(path.join(drawableDir, `${resName}.xml`), xml, "utf8");
      totalDrawables++;
    }
  }

  await fs.writeFile(
    path.join(generatedKotlinDir, "SlaticoIconName.kt"),
    generateKotlinIconNameModule(families),
    "utf8"
  );
  await fs.writeFile(
    path.join(generatedKotlinDir, "SlaticoDrawables.kt"),
    generateKotlinDrawablesModule(families),
    "utf8"
  );
  await fs.writeFile(
    path.join(generatedKotlinDir, "SlaticoDuotoneVectors.kt"),
    generateKotlinDuotoneVectorsModule(families, duotonePathMap),
    "utf8"
  );

  return {
    totalDrawables,
    unsupportedFeatures: allUnsupported
  };
}
