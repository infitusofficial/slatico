import type { Dirent } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { optimize, type Config as SvgoConfig } from "svgo";
import {
  MASTER_VIEWBOX,
  SLATICO_STYLES,
  SLATICO_STYLE_SPECS,
  type SlaticoCatalog,
  type SlaticoIconEntry,
  type SlaticoStyle,
  type SlaticoTier
} from "../packages/core/src/types.js";
import {
  isValidIconName as checkIconName,
  isValidSlaticoStyle as checkStyle,
  toPascalCase as convertToPascalCase
} from "../packages/core/src/utils.js";

export interface DiscoveredSvgVariant {
  readonly name: string;
  readonly style: SlaticoStyle;
  readonly filePath: string;
  readonly relativePath: string;
  readonly rawSvg: string;
  readonly optimizedSvg: string;
  readonly innerSvg: string;
  readonly viewBox: string;
  readonly isMonochrome: boolean;
  readonly isDemo: boolean;
  readonly structuralFixes: readonly string[];
}

export interface DiscoveredIconFamily {
  readonly name: string;
  readonly pascalName: string;
  readonly tier: SlaticoTier;
  readonly isDemo: boolean;
  readonly variants: Readonly<Record<SlaticoStyle, DiscoveredSvgVariant>>;
}

export interface DiscoverIconsOptions {
  /**
   * Whether to include demonstration icons (`data-demo="true"`) in `families`.
   * Defaults to `false` so production counts and public package exports only include production icons.
   */
  readonly includeDemo?: boolean;
}

export interface PipelineValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly families: readonly DiscoveredIconFamily[];
  readonly demoFamilies: readonly DiscoveredIconFamily[];
  readonly structuralFixes: readonly {
    readonly relativePath: string;
    readonly fixes: readonly string[];
  }[];
}

/**
 * Pure single-primitive geometric operator icons that consist of a single
 * path in all styles including Duotone.
 */
const SINGLE_TONE_GEOMETRIC_DUOTONE_ICONS = new Set(["minus", "plus"]);

const ALLOWED_SVG_TAGS = new Set([
  "svg",
  "path",
  "circle",
  "rect",
  "line",
  "polyline",
  "polygon",
  "ellipse",
  "g",
  "defs",
  "linearGradient",
  "radialGradient",
  "stop",
  "clipPath",
  "mask",
  "use",
  "title",
  "desc"
]);

const DRAWABLE_TAGS = new Set([
  "path",
  "circle",
  "rect",
  "line",
  "polyline",
  "polygon",
  "ellipse",
  "use"
]);

const DISALLOWED_ATTR_PATTERN = /^on[a-z]+$/i;

const XML_PARSER = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  allowBooleanAttributes: true
});

function createSvgoConfig(style: SlaticoStyle, iconName: string): SvgoConfig {
  const isStrictMonochrome = SLATICO_STYLE_SPECS[style].isMonochrome;
  return {
    multipass: true,
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            removeViewBox: false,
            // Preserve IDs for gradients, masks, clipPaths, and negative spaces
            cleanupIds: {
              minify: false,
              remove: false,
              preservePrefixes: [`slatico-${iconName}`, "slatico-"]
            },
            // Keep explicit stroke-width="1" in Thin style and clip-rule/fill-rule/mask attributes
            removeUnknownsAndDefaults: {
              keepDataAttrs: false,
              keepAriaAttrs: true,
              keepRoleAttr: true,
              defaultAttrs: false
            },
            // Never blindly convert secondary Duotone or Color hues into currentColor
            convertColors: isStrictMonochrome
              ? { currentColor: false }
              : false,
            // Preserve layered paths, negative spaces (evenodd), masks, and clipPaths without destructive merging
            mergePaths: false,
            convertShapeToPath: false,
            collapseGroups: false,
            removeUselessStrokeAndFill: false,
            removeHiddenElems: false
          }
        }
      },
      "removeDimensions"
    ]
  };
}

function normalizePosixPath(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

/**
 * Non-destructively normalizes authored Figma SVG exports in memory without modifying source files on disk:
 * 1. Strips accidental Figma keyline construction grid layers (`stroke-width="0.1"` paths and empty `<g opacity="0.4">` wrappers).
 * 2. Unwraps redundant full-canvas Figma `<g clip-path="url(#clip0_...)">` + `<defs><clipPath id="clip0_..."><rect width="24" height="24" fill="white"/></clipPath></defs>` wrappers.
 * 3. Maps authored `fill="black"` on monochrome styles (`thin`, `light`, `regular`, `bold`, `fill`) to `fill="currentColor"`.
 * 4. Maps authored `duotone` `<g opacity="0.2">` and `<path opacity="0.2">` layers to CSS custom properties `--slatico-secondary-opacity` and `--slatico-secondary-color`, and primary `fill="black"` to `fill="currentColor"`.
 */
export function normalizeAuthoredSvgContent(
  rawSvg: string,
  style: SlaticoStyle
): {
  readonly normalizedSvg: string;
  readonly structuralFixes: readonly string[];
} {
  let svg = rawSvg;
  const structuralFixes: string[] = [];

  // 1. Strip accidental Figma keyline construction grid paths (stroke-width="0.1")
  if (/\bstroke-width="0\.1"/i.test(svg)) {
    const beforeGrid = svg;
    svg = svg.replace(/\s*<path\b[^>]*\bstroke-width="0\.1"[^>]*\/>/gi, "");
    svg = svg.replace(/\s*<g\b[^>]*>\s*<\/g>/gi, "");
    if (svg !== beforeGrid) {
      structuralFixes.push("stripped-figma-keyline-grid");
    }
  }

  // 2. Unwrap redundant full-canvas Figma frame clipPath (id="clip0_<page>_<node>")
  const figmaCanvasClipPattern =
    /<g\s+clip-path="url\(#(clip0_[A-Za-z0-9_]+)\)"\s*>([\s\S]*?)<\/g>\s*<defs>\s*<clipPath\s+id="\1"\s*>\s*<rect\s+width="24"\s+height="24"\s+fill="white"\s*\/>\s*<\/clipPath>\s*<\/defs>/i;
  if (figmaCanvasClipPattern.test(svg)) {
    svg = svg.replace(figmaCanvasClipPattern, (_match, _clipId: string, innerGroupContent: string) =>
      innerGroupContent.trim()
    );
    structuralFixes.push("unwrapped-figma-canvas-clip");
  }

  // 3. Normalize authored fill="black" in strict monochrome styles to fill="currentColor"
  if (SLATICO_STYLE_SPECS[style].isMonochrome) {
    svg = svg.replace(/\bfill="(?:black|#000000|#000)"/gi, 'fill="currentColor"');
  } else if (style === "duotone") {
    // 4. Normalize Duotone secondary opacity groups and paths to customizable CSS custom properties
    svg = svg.replace(
      /<g\s+opacity="0\.2"\s*>([\s\S]*?)<\/g>/gi,
      (_match, groupInner: string) => {
        const updatedInner = groupInner.replace(
          /\bfill="(?:black|#000000|#000)"/gi,
          'fill="var(--slatico-secondary-color, currentColor)"'
        );
        return `<g opacity="var(--slatico-secondary-opacity, 0.2)">${updatedInner}</g>`;
      }
    );
    svg = svg.replace(
      /<path\b([^>]*?)\bopacity="0\.2"([^>]*?)\/>/gi,
      (fullPathTag: string) =>
        fullPathTag
          .replace(/\bopacity="0\.2"/i, 'opacity="var(--slatico-secondary-opacity, 0.2)"')
          .replace(
            /\bfill="(?:black|#000000|#000)"/gi,
            'fill="var(--slatico-secondary-color, currentColor)"'
          )
    );
    svg = svg.replace(/\bfill="(?:black|#000000|#000)"/gi, 'fill="currentColor"');
  } else if (style === "color" && !/\bdata-demo="true"/i.test(svg)) {
    // 5. Normalize Tier 1 Color style primary (#FF6040) and secondary (black/#000000) layers
    // to CSS custom properties with exact authored fallback colors.
    svg = svg.replace(
      /\bfill="#FF6040"/gi,
      'fill="var(--slatico-primary-color, #FF6040)"'
    );
    svg = svg.replace(
      /\bfill="(?:black|#000000|#000)"/gi,
      'fill="var(--slatico-secondary-color, #000000)"'
    );
  }

  return {
    normalizedSvg: svg,
    structuralFixes
  };
}

interface XmlInspectionState {
  hasDrawable: boolean;
  unknownTags: Set<string>;
  unsafeAttributes: Set<string>;
  hardcodedColors: Set<string>;
  definedIds: Set<string>;
  referencedIds: Set<string>;
  hasOpacityOrSecondaryTone: boolean;
  drawableCount: number;
}

function extractUrlRefId(val: string): string | null {
  const match = val.trim().match(/^url\(#([^)]+)\)$/i);
  return match && match[1] ? match[1] : null;
}

function inspectParsedXmlNodes(node: unknown, state: XmlInspectionState): void {
  if (!node || typeof node !== "object") {
    return;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      inspectParsedXmlNodes(item, state);
    }
    return;
  }

  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (key.startsWith("@_")) {
      const attrName = key.slice(2);
      const strVal = typeof value === "string" ? value.trim() : String(value ?? "");

      if (DISALLOWED_ATTR_PATTERN.test(attrName)) {
        state.unsafeAttributes.add(attrName);
      }

      if (
        (attrName === "href" || attrName === "xlink:href" || attrName === "src") &&
        /^javascript:/i.test(strVal)
      ) {
        state.unsafeAttributes.add(`${attrName}="${strVal}"`);
      }

      if (attrName === "id" && strVal) {
        state.definedIds.add(strVal);
      }

      if (
        (attrName === "href" || attrName === "xlink:href") &&
        strVal.startsWith("#") &&
        strVal.length > 1
      ) {
        state.referencedIds.add(strVal.slice(1));
      }

      const urlId = extractUrlRefId(strVal);
      if (urlId) {
        state.referencedIds.add(urlId);
      }

      if (
        attrName === "opacity" ||
        attrName === "fill-opacity" ||
        attrName === "stroke-opacity"
      ) {
        if (strVal.startsWith("var(")) {
          state.hasOpacityOrSecondaryTone = true;
        } else {
          const num = Number.parseFloat(strVal);
          if (!Number.isNaN(num) && num > 0 && num < 1) {
            state.hasOpacityOrSecondaryTone = true;
          }
        }
      }

      if (
        (attrName === "fill" || attrName === "stroke" || attrName === "stop-color") &&
        typeof value === "string"
      ) {
        if (strVal.startsWith("var(")) {
          state.hasOpacityOrSecondaryTone = true;
        } else if (
          strVal !== "none" &&
          strVal !== "currentColor" &&
          !strVal.startsWith("url(")
        ) {
          state.hardcodedColors.add(`${attrName}="${strVal}"`);
          state.hasOpacityOrSecondaryTone = true;
        }
      }
      continue;
    }

    if (key === "#text" || key === "?xml") {
      continue;
    }

    if (!ALLOWED_SVG_TAGS.has(key)) {
      state.unknownTags.add(key);
    }
    if (DRAWABLE_TAGS.has(key)) {
      state.hasDrawable = true;
      state.drawableCount += Array.isArray(value) ? value.length : 1;
    }

    inspectParsedXmlNodes(value, state);
  }
}

export function extractInnerSvg(svgContent: string): string {
  const match = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  if (!match || match[1] === undefined) {
    throw new Error("Failed to extract inner SVG content from <svg> element.");
  }
  return match[1].trim();
}

export function validateAndOptimizeSvgContent(params: {
  rawSvg: string;
  name: string;
  style: SlaticoStyle;
  relativePath: string;
}): {
  errors: string[];
  variant?: DiscoveredSvgVariant;
  filePath?: string;
} {
  const { rawSvg, name, style, relativePath } = params;
  const errors: string[] = [];

  if (!rawSvg.trim()) {
    errors.push(`[${relativePath}] SVG file is empty.`);
    return { errors };
  }

  const xmlValid = XMLValidator.validate(rawSvg);
  if (xmlValid !== true) {
    errors.push(
      `[${relativePath}] Invalid XML syntax: ${xmlValid.err.msg} (line ${xmlValid.err.line}).`
    );
    return { errors };
  }

  const { normalizedSvg, structuralFixes } = normalizeAuthoredSvgContent(rawSvg, style);

  const parsed = XML_PARSER.parse(normalizedSvg) as Record<string, unknown>;
  const svgRoot = parsed.svg as Record<string, unknown> | undefined;
  if (!svgRoot || typeof svgRoot !== "object") {
    errors.push(`[${relativePath}] Root element must be <svg>.`);
    return { errors };
  }

  const viewBox = svgRoot["@_viewBox"];
  if (viewBox !== MASTER_VIEWBOX) {
    errors.push(
      `[${relativePath}] Invalid or missing viewBox "${String(viewBox ?? "")}". Expected "${MASTER_VIEWBOX}".`
    );
  }

  const isDemo = svgRoot["@_data-demo"] === "true";

  const inspection: XmlInspectionState = {
    hasDrawable: false,
    unknownTags: new Set<string>(),
    unsafeAttributes: new Set<string>(),
    hardcodedColors: new Set<string>(),
    definedIds: new Set<string>(),
    referencedIds: new Set<string>(),
    hasOpacityOrSecondaryTone: false,
    drawableCount: 0
  };
  inspectParsedXmlNodes({ svg: svgRoot }, inspection);

  if (inspection.unknownTags.size > 0) {
    errors.push(
      `[${relativePath}] Disallowed or unsafe SVG elements found: ${Array.from(inspection.unknownTags).join(", ")}.`
    );
  }

  if (inspection.unsafeAttributes.size > 0) {
    errors.push(
      `[${relativePath}] Disallowed or unsafe SVG attributes found: ${Array.from(inspection.unsafeAttributes).join(", ")}.`
    );
  }

  if (!inspection.hasDrawable) {
    errors.push(
      `[${relativePath}] SVG contains no drawable vector elements (path, circle, rect, etc.).`
    );
  }

  // Verify that all url(#id) or href="#id" references resolve to defined IDs in the SVG
  for (const refId of inspection.referencedIds) {
    if (!inspection.definedIds.has(refId)) {
      errors.push(
        `[${relativePath}] Broken SVG reference to "#${refId}". No element with id="${refId}" exists in this SVG.`
      );
    }
  }

  // Ensure defined IDs are properly namespaced with slatico- to prevent DOM collisions
  for (const defId of inspection.definedIds) {
    if (!defId.startsWith("slatico-")) {
      errors.push(
        `[${relativePath}] SVG element id="${defId}" must be prefixed with "slatico-" (e.g., "slatico-${name}-${defId}") to prevent DOM ID collisions.`
      );
    }
  }

  // Strict monochrome styles (thin, light, regular, bold, fill) must only use currentColor
  const isStrictMonochrome = SLATICO_STYLE_SPECS[style].isMonochrome;
  if (isStrictMonochrome && inspection.hardcodedColors.size > 0) {
    errors.push(
      `[${relativePath}] Monochrome style "${style}" must use "currentColor" instead of hardcoded colors (${Array.from(inspection.hardcodedColors).join(", ")}).`
    );
  }

  // Duotone style must contain at least 2 layers and either an opacity layer or a distinct secondary tone
  // (unless it is a pure single-primitive geometric operator icon like minus or plus)
  if (style === "duotone" && !SINGLE_TONE_GEOMETRIC_DUOTONE_ICONS.has(name)) {
    if (inspection.drawableCount < 2 || !inspection.hasOpacityOrSecondaryTone) {
      errors.push(
        `[${relativePath}] Duotone style must include at least two layers and a distinct secondary tone (via opacity, fill-opacity, CSS variable, or secondary color) — do not collapse Duotone into a single flat monochrome layer.`
      );
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  const optimizedResult = optimize(normalizedSvg, createSvgoConfig(style, name));
  const optimizedSvg = optimizedResult.data.trim();
  const innerSvg = extractInnerSvg(optimizedSvg);

  return {
    errors: [],
    variant: {
      name,
      style,
      filePath: relativePath,
      relativePath,
      rawSvg,
      optimizedSvg,
      innerSvg,
      viewBox: MASTER_VIEWBOX,
      isMonochrome: isStrictMonochrome,
      isDemo,
      structuralFixes
    }
  };
}

/**
 * Discovers and validates all icons inside the given icons root directory.
 * By default (`includeDemo: false`), `families` contains only production icon families (`isDemo === false`),
 * while `demoFamilies` contains any demonstration icon families (`data-demo="true"`).
 */
export async function discoverAndValidateIcons(
  iconsRootDir: string,
  repoRootDir: string = path.resolve(iconsRootDir, ".."),
  options: DiscoverIconsOptions = {}
): Promise<PipelineValidationResult> {
  const { includeDemo = false } = options;
  const errors: string[] = [];
  const structuralFixes: { relativePath: string; fixes: readonly string[] }[] = [];

  let rootEntries: Dirent[];
  try {
    rootEntries = await fs.readdir(iconsRootDir, { withFileTypes: true });
  } catch {
    return {
      valid: false,
      errors: [`Icons root directory not found at "${iconsRootDir}".`],
      families: [],
      demoFamilies: [],
      structuralFixes: []
    };
  }

  const sortedRootEntries = [...rootEntries].sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of sortedRootEntries) {
    if (entry.isDirectory()) {
      if (!checkStyle(entry.name)) {
        errors.push(
          `Invalid style directory "icons/${entry.name}". Allowed style directories are: ${SLATICO_STYLES.join(", ")}.`
        );
      }
    } else if (!entry.name.startsWith(".")) {
      errors.push(
        `Unexpected file "icons/${entry.name}" in icons root. Place SVG files inside their style subdirectory.`
      );
    }
  }

  const discoveredByStyle = new Map<SlaticoStyle, Map<string, DiscoveredSvgVariant>>();
  const allIconNames = new Set<string>();

  for (const style of SLATICO_STYLES) {
    const styleDir = path.join(iconsRootDir, style);
    const styleMap = new Map<string, DiscoveredSvgVariant>();
    discoveredByStyle.set(style, styleMap);

    let styleEntries: Dirent[];
    try {
      styleEntries = await fs.readdir(styleDir, { withFileTypes: true });
    } catch {
      errors.push(`Missing required style directory "icons/${style}".`);
      continue;
    }

    const sortedStyleEntries = [...styleEntries].sort((a, b) => a.name.localeCompare(b.name));
    const lowerCaseSeen = new Map<string, string>();

    for (const fileEntry of sortedStyleEntries) {
      const fullPath = path.join(styleDir, fileEntry.name);
      const relPath = normalizePosixPath(path.relative(repoRootDir, fullPath));

      if (fileEntry.isDirectory()) {
        errors.push(`[${relPath}] Nested subdirectories inside style folders are not allowed.`);
        continue;
      }

      if (!fileEntry.name.endsWith(".svg")) {
        errors.push(`[${relPath}] Only .svg files are allowed in style directories.`);
        continue;
      }

      const iconName = fileEntry.name.slice(0, -4);
      const normalizedLower = iconName.toLowerCase();
      const existingCaseMatch = lowerCaseSeen.get(normalizedLower);
      if (existingCaseMatch && existingCaseMatch !== fileEntry.name) {
        errors.push(
          `[${relPath}] Duplicate case-insensitive icon file "${fileEntry.name}" conflicts with "${existingCaseMatch}".`
        );
        continue;
      }
      lowerCaseSeen.set(normalizedLower, fileEntry.name);

      if (!checkIconName(iconName)) {
        errors.push(
          `[${relPath}] Invalid icon name "${iconName}". Icon names must be lowercase kebab-case (e.g., "shield-check").`
        );
        continue;
      }

      if (styleMap.has(iconName)) {
        errors.push(`[${relPath}] Duplicate icon "${iconName}" in style "${style}".`);
        continue;
      }

      const rawSvg = await fs.readFile(fullPath, "utf8");
      const validation = validateAndOptimizeSvgContent({
        rawSvg,
        name: iconName,
        style,
        relativePath: relPath
      });

      if (validation.errors.length > 0) {
        errors.push(...validation.errors);
        continue;
      }

      if (validation.variant) {
        if (validation.variant.structuralFixes.length > 0) {
          structuralFixes.push({
            relativePath: relPath,
            fixes: validation.variant.structuralFixes
          });
        }
        styleMap.set(iconName, {
          ...validation.variant,
          filePath: fullPath
        });
        allIconNames.add(iconName);
      }
    }
  }

  const sortedIconNames = Array.from(allIconNames).sort((a, b) => a.localeCompare(b));
  const allFamilies: DiscoveredIconFamily[] = [];
  const pascalNameCollisions = new Map<string, string>();

  for (const iconName of sortedIconNames) {
    const pascalName = convertToPascalCase(iconName);
    const existingCollision = pascalNameCollisions.get(pascalName);
    if (existingCollision && existingCollision !== iconName) {
      errors.push(
        `Icon "${iconName}" produces the same PascalCase component name "${pascalName}" as "${existingCollision}".`
      );
    }
    pascalNameCollisions.set(pascalName, iconName);

    const missingStyles: SlaticoStyle[] = [];
    const variantsPartial: Partial<Record<SlaticoStyle, DiscoveredSvgVariant>> = {};

    for (const style of SLATICO_STYLES) {
      const found = discoveredByStyle.get(style)?.get(iconName);
      if (!found) {
        missingStyles.push(style);
      } else {
        variantsPartial[style] = found;
      }
    }

    if (missingStyles.length > 0) {
      errors.push(
        `Icon "${iconName}" is missing required style variants: ${missingStyles.join(", ")}. Every Slatico icon must provide all 7 styles.`
      );
      continue;
    }

    const variants = variantsPartial as Record<SlaticoStyle, DiscoveredSvgVariant>;
    const isDemo = SLATICO_STYLES.some((s) => variants[s].isDemo);

    allFamilies.push({
      name: iconName,
      pascalName,
      tier: "tier-1",
      isDemo,
      variants
    });
  }

  const productionFamilies = allFamilies.filter((f) => !f.isDemo);
  const demoFamilies = allFamilies.filter((f) => f.isDemo);

  return {
    valid: errors.length === 0,
    errors,
    families: includeDemo ? allFamilies : productionFamilies,
    demoFamilies,
    structuralFixes
  };
}

export function buildCatalogMetadata(
  families: readonly DiscoveredIconFamily[],
  version = "0.1.0"
): SlaticoCatalog {
  const tiersMap: Record<SlaticoTier, string[]> = {
    "tier-1": [],
    "tier-2": [],
    "tier-3": []
  };

  const icons: SlaticoIconEntry[] = families.map((family) => {
    tiersMap[family.tier].push(family.name);

    const stylesRecord = {} as Record<SlaticoStyle, SlaticoIconEntry["styles"][SlaticoStyle]>;
    for (const style of SLATICO_STYLES) {
      const variant = family.variants[style];
      stylesRecord[style] = {
        style,
        relativePath: variant.relativePath,
        viewBox: variant.viewBox,
        isMonochrome: variant.isMonochrome,
        isDemo: variant.isDemo
      };
    }

    return {
      name: family.name,
      pascalName: family.pascalName,
      tier: family.tier,
      isDemo: family.isDemo,
      styles: stylesRecord
    };
  });

  return {
    version,
    masterViewBox: MASTER_VIEWBOX,
    styles: SLATICO_STYLES,
    totalIcons: icons.length,
    totalVariants: icons.length * SLATICO_STYLES.length,
    tiers: tiersMap,
    icons
  };
}

export {
  checkIconName as isValidIconName,
  checkStyle as isValidSlaticoStyle,
  convertToPascalCase as toPascalCase
};
