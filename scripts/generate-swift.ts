import fs from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";
import { SLATICO_STYLES, type SlaticoStyle } from "../packages/core/src/types.js";
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

export const SWIFT_RESERVED_WORDS = new Set([
  "Any",
  "Self",
  "Type",
  "as",
  "associatedtype",
  "break",
  "case",
  "catch",
  "class",
  "continue",
  "default",
  "defer",
  "deinit",
  "do",
  "else",
  "enum",
  "extension",
  "fallthrough",
  "false",
  "fileprivate",
  "for",
  "func",
  "guard",
  "if",
  "import",
  "in",
  "init",
  "inout",
  "internal",
  "is",
  "let",
  "nil",
  "open",
  "operator",
  "precedencegroup",
  "private",
  "protocol",
  "public",
  "repeat",
  "rethrows",
  "return",
  "self",
  "static",
  "struct",
  "subscript",
  "super",
  "switch",
  "throw",
  "throws",
  "true",
  "try",
  "typealias",
  "var",
  "where",
  "while"
]);

export const SWIFT_UNSUPPORTED_SVG_TAGS = new Set([
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

export function toSwiftIdentifier(kebab: string): string {
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
  if (SWIFT_RESERVED_WORDS.has(camel)) {
    return `${camel}Icon`;
  }
  return camel;
}

export type SwiftLayerColorRole =
  | { readonly kind: "primary" }
  | { readonly kind: "secondary" }
  | {
      readonly kind: "fixed";
      readonly hex: string;
      readonly red: number;
      readonly green: number;
      readonly blue: number;
    };

export interface SwiftVectorLayerSpec {
  readonly pathData: string;
  readonly role: SwiftLayerColorRole;
  readonly defaultOpacity: number;
  readonly isEvenOdd: boolean;
}

interface InheritedSvgStyle {
  readonly fill?: string | undefined;
  readonly opacity?: string | undefined;
  readonly fillOpacity?: string | undefined;
  readonly fillRule?: string | undefined;
  readonly clipRule?: string | undefined;
}

const NAMED_HEX_COLORS: Readonly<Record<string, string>> = {
  black: "#000000",
  white: "#FFFFFF",
  red: "#FF0000",
  green: "#008000",
  blue: "#0000FF"
};

function normalizeHex6(rawColor: string | undefined): string {
  if (!rawColor) {
    return "#000000";
  }
  const trimmed = rawColor.trim();
  if (
    trimmed === "currentColor" ||
    trimmed.startsWith("var(--slatico-secondary-color")
  ) {
    return "#000000";
  }
  const lower = trimmed.toLowerCase();
  if (lower in NAMED_HEX_COLORS) {
    return NAMED_HEX_COLORS[lower]!;
  }
  const hex3 = trimmed.match(/^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/);
  if (hex3) {
    return `#${hex3[1]}${hex3[1]}${hex3[2]}${hex3[2]}${hex3[3]}${hex3[3]}`.toUpperCase();
  }
  const hex6 = trimmed.match(/^#([0-9a-fA-F]{6})$/);
  if (hex6) {
    return `#${hex6[1]!.toUpperCase()}`;
  }
  return "#000000";
}

function hex6ToNormalizedRgb(hex6: string): {
  red: number;
  green: number;
  blue: number;
} {
  const clean = hex6.replace(/^#/, "");
  const r = Number.parseInt(clean.slice(0, 2), 16) / 255;
  const g = Number.parseInt(clean.slice(2, 4), 16) / 255;
  const b = Number.parseInt(clean.slice(4, 6), 16) / 255;
  return {
    red: Number(r.toFixed(6)),
    green: Number(g.toFixed(6)),
    blue: Number(b.toFixed(6))
  };
}

function resolveNumericOpacity(raw: string | undefined): number {
  if (!raw) {
    return 1;
  }
  const trimmed = raw.trim();
  const varMatch = trimmed.match(
    /^var\(--slatico-secondary-opacity\s*,\s*([0-9.]+)\)$/
  );
  if (varMatch && varMatch[1]) {
    const parsed = Number.parseFloat(varMatch[1]);
    return Number.isFinite(parsed) ? parsed : 0.2;
  }
  const parsed = Number.parseFloat(trimmed);
  if (Number.isFinite(parsed)) {
    return Math.max(0, Math.min(1, parsed));
  }
  return 1;
}

function walkOrderedXmlNodesForSwift(
  nodes: readonly OrderedXmlNode[],
  inherited: InheritedSvgStyle,
  style: SlaticoStyle,
  outLayers: SwiftVectorLayerSpec[],
  unsupportedFeatures: string[]
): void {
  for (const node of nodes) {
    const tagNames = Object.keys(node).filter((k) => k !== ":@" && k !== "#text");
    const tagName = tagNames[0];
    if (!tagName) {
      continue;
    }

    if (SWIFT_UNSUPPORTED_SVG_TAGS.has(tagName)) {
      unsupportedFeatures.push(`Unsupported SVG element <${tagName}>`);
      continue;
    }

    const attrs = node[":@"] ?? {};
    const mergedStyle: InheritedSvgStyle = {
      fill: (attrs["@_fill"] as string | undefined) ?? inherited.fill,
      opacity: (attrs["@_opacity"] as string | undefined) ?? inherited.opacity,
      fillOpacity:
        (attrs["@_fill-opacity"] as string | undefined) ?? inherited.fillOpacity,
      fillRule:
        (attrs["@_fill-rule"] as string | undefined) ?? inherited.fillRule,
      clipRule:
        (attrs["@_clip-rule"] as string | undefined) ?? inherited.clipRule
    };

    if (tagName === "g" || tagName === "svg") {
      if (attrs["@_transform"]) {
        unsupportedFeatures.push(
          `Transform attribute on <${tagName}> is not supported without flattening`
        );
      }
      const children = (node[tagName] as OrderedXmlNode[] | undefined) ?? [];
      walkOrderedXmlNodesForSwift(
        children,
        mergedStyle,
        style,
        outLayers,
        unsupportedFeatures
      );
      continue;
    }

    if (tagName === "path") {
      const d = String(attrs["@_d"] ?? "").trim();
      if (!d) {
        continue;
      }

      const rawFill = mergedStyle.fill;
      if (rawFill?.trim().toLowerCase() === "none") {
        continue;
      }

      const op1 = resolveNumericOpacity(mergedStyle.opacity);
      const op2 = resolveNumericOpacity(mergedStyle.fillOpacity);
      const combinedOpacity = Number((op1 * op2).toFixed(4));

      const rawRule = (
        mergedStyle.fillRule ??
        mergedStyle.clipRule ??
        "nonzero"
      ).toLowerCase();
      const isEvenOdd = rawRule === "evenodd";

      const isSecondary =
        style === "duotone" &&
        (combinedOpacity < 1 ||
          Boolean(rawFill?.includes("--slatico-secondary-color")) ||
          Boolean(mergedStyle.opacity?.includes("--slatico-secondary-opacity")) ||
          Boolean(
            mergedStyle.fillOpacity?.includes("--slatico-secondary-opacity")
          ));

      let role: SwiftLayerColorRole;
      if (style === "color") {
        const hex6 = normalizeHex6(rawFill);
        const { red, green, blue } = hex6ToNormalizedRgb(hex6);
        role = { kind: "fixed", hex: hex6, red, green, blue };
      } else if (isSecondary) {
        role = { kind: "secondary" };
      } else {
        role = { kind: "primary" };
      }

      outLayers.push({
        pathData: d,
        role,
        defaultOpacity: combinedOpacity,
        isEvenOdd
      });
      continue;
    }

    unsupportedFeatures.push(`Unsupported SVG element <${tagName}>`);
  }
}

export function extractSwiftLayersFromSvg(
  svgString: string,
  style: SlaticoStyle
): {
  readonly layers: readonly SwiftVectorLayerSpec[];
  readonly unsupportedFeatures: readonly string[];
} {
  const parsed = ORDERED_XML_PARSER.parse(svgString) as OrderedXmlNode[];
  const svgNode = parsed.find((n) => "svg" in n);
  if (!svgNode) {
    throw new Error("Missing <svg> root element when extracting Swift vector layers.");
  }

  const outLayers: SwiftVectorLayerSpec[] = [];
  const unsupportedFeatures: string[] = [];
  const children = (svgNode.svg as OrderedXmlNode[] | undefined) ?? [];

  walkOrderedXmlNodesForSwift(
    children,
    {},
    style,
    outLayers,
    unsupportedFeatures
  );

  return {
    layers: outLayers,
    unsupportedFeatures
  };
}

export function generateSwiftIconNameModule(
  families: readonly DiscoveredIconFamily[]
): string {
  const enumCases = families.map((fam) => {
    const swiftId = toSwiftIdentifier(fam.name);
    return `    /// The \`${fam.name}\` Tier 1 production icon family.\n    case ${swiftId} = "${fam.name}"`;
  });

  return `// AUTO-GENERATED BY scripts/generate-swift.ts — DO NOT EDIT MANUALLY
import Foundation

/// Strongly-typed identifier for all ${families.length} Tier 1 Slatico production icon families.
public enum SlaticoIconName: String, CaseIterable, Codable, Sendable, Identifiable {
${enumCases.join("\n\n")}

    /// Canonical kebab-case identifier matching \`@slatico/core\` and master SVG filenames.
    public var slug: String { rawValue }

    /// Unique identifier for SwiftUI \`ForEach\` and \`Identifiable\` conformance.
    public var id: String { rawValue }

    /// Resolves a \`SlaticoIconName\` by its canonical kebab-case slug, or returns \`nil\`.
    public init?(slug: String) {
        self.init(rawValue: slug.lowercased())
    }

    /// Relative bundle subpath for the optimized SVG asset in \`Bundle.module\`.
    public func resourceSubpath(for style: SlaticoStyle) -> String {
        "svg/\\(style.rawValue)/\\(rawValue).svg"
    }
}
`;
}

function formatSwiftLayerRole(role: SwiftLayerColorRole): string {
  switch (role.kind) {
    case "primary":
      return ".primary";
    case "secondary":
      return ".secondary";
    case "fixed":
      return `.fixedColor(hex: "${role.hex}", red: ${role.red}, green: ${role.green}, blue: ${role.blue})`;
  }
}

export function generateSwiftVectorCatalogModule(
  families: readonly DiscoveredIconFamily[],
  layerMap: ReadonlyMap<string, readonly SwiftVectorLayerSpec[]>
): string {
  const switchCases: string[] = [];

  for (const fam of families) {
    const swiftId = toSwiftIdentifier(fam.name);
    const styleBranches: string[] = [];

    for (const style of SLATICO_STYLES) {
      const key = `${fam.name}:${style}`;
      const layers = layerMap.get(key) ?? [];
      const layerLiterals = layers.map((l) => {
        const escapedD = l.pathData.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        return `                SlaticoVectorLayerSpec(
                    pathData: "${escapedD}",
                    role: ${formatSwiftLayerRole(l.role)},
                    defaultOpacity: ${l.defaultOpacity},
                    isEvenOdd: ${l.isEvenOdd}
                )`;
      });

      styleBranches.push(
        `            case .${style}:\n                return SlaticoVectorIconSpec(\n                    name: .${swiftId},\n                    style: .${style},\n                    layers: [\n${layerLiterals.join(",\n")}\n                    ]\n                )`
      );
    }

    switchCases.push(
      `        case .${swiftId}:\n            switch style {\n${styleBranches.join("\n")}\n            }`
    );
  }

  return `// AUTO-GENERATED BY scripts/generate-swift.ts — DO NOT EDIT MANUALLY
import Foundation

/// Generated 24×24 vector geometry catalog for all ${families.length} Tier 1 Slatico icon families
/// across all ${SLATICO_STYLES.length} architectural styles (${
    families.length * SLATICO_STYLES.length
  } total variants).
public enum SlaticoVectorCatalog {
    /// Total number of production icon families in Tier 1.
    public static let familyCount: Int = ${families.length}

    /// Total number of official Slatico styles.
    public static let styleCount: Int = ${SLATICO_STYLES.length}

    /// Total number of generated vector variants (${families.length} × ${SLATICO_STYLES.length}).
    public static let totalVariants: Int = ${
      families.length * SLATICO_STYLES.length
    }

    /// Returns the 24×24 vector layer specification for \`icon\` and \`style\`.
    public static func spec(for icon: SlaticoIconName, style: SlaticoStyle) -> SlaticoVectorIconSpec {
        switch icon {
${switchCases.join("\n")}
        }
    }
}
`;
}

export async function generateSwiftPackageArtifacts(
  repoRoot: string,
  families: readonly DiscoveredIconFamily[]
): Promise<{
  totalVariants: number;
  unsupportedFeatures: string[];
}> {
  const swiftRoot = path.join(repoRoot, "packages", "swift");
  const generatedDir = path.join(
    swiftRoot,
    "Sources",
    "SlaticoIcons",
    "Generated"
  );
  const resourcesSvgDir = path.join(
    swiftRoot,
    "Sources",
    "SlaticoIcons",
    "Resources",
    "svg"
  );

  await fs.rm(generatedDir, { recursive: true, force: true });
  await fs.rm(resourcesSvgDir, { recursive: true, force: true });
  await fs.mkdir(generatedDir, { recursive: true });

  const layerMap = new Map<string, readonly SwiftVectorLayerSpec[]>();
  const allUnsupported: string[] = [];
  let totalVariants = 0;

  for (const style of SLATICO_STYLES) {
    await fs.mkdir(path.join(resourcesSvgDir, style), { recursive: true });
  }

  for (const fam of families) {
    for (const style of SLATICO_STYLES) {
      const variant = fam.variants[style];
      const { layers, unsupportedFeatures } = extractSwiftLayersFromSvg(
        variant.optimizedSvg,
        style
      );
      if (unsupportedFeatures.length > 0) {
        for (const msg of unsupportedFeatures) {
          allUnsupported.push(`${style}/${fam.name}.svg: ${msg}`);
        }
      }
      layerMap.set(`${fam.name}:${style}`, layers);

      await fs.writeFile(
        path.join(resourcesSvgDir, style, `${fam.name}.svg`),
        `${variant.optimizedSvg}\n`,
        "utf8"
      );
      totalVariants++;
    }
  }

  await fs.writeFile(
    path.join(generatedDir, "SlaticoIconName.generated.swift"),
    generateSwiftIconNameModule(families),
    "utf8"
  );

  await fs.writeFile(
    path.join(generatedDir, "SlaticoVectorCatalog.generated.swift"),
    generateSwiftVectorCatalogModule(families, layerMap),
    "utf8"
  );

  return {
    totalVariants,
    unsupportedFeatures: allUnsupported
  };
}
