import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { PassThrough } from "node:stream";
import { SVGIcons2SVGFontStream } from "svgicons2svgfont";
import {
  formatCodepointHex,
  formatCssCodepointEscape,
  parseCodepointHex,
  resolveStableCodepointManifest,
  type SlaticoCodepointManifest
} from "../packages/font/src/codepoints.js";
import type { DiscoveredIconFamily } from "./icon-pipeline.js";

const requireFromRoot = createRequire(import.meta.url);
const svgiconsEntryPath = requireFromRoot.resolve("svgicons2svgfont");
const requireFromSvgicons = createRequire(svgiconsEntryPath);

interface SvgCommand {
  type: number;
  relative?: boolean;
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

interface SvgPathDataInstance {
  commands: SvgCommand[];
  toAbs(): SvgPathDataInstance;
  normalizeST(): SvgPathDataInstance;
  qtToC(): SvgPathDataInstance;
  aToC(): SvgPathDataInstance;
}

interface SvgPathDataConstructor {
  new (d: string): SvgPathDataInstance;
  readonly MOVE_TO: number;
  readonly LINE_TO: number;
  readonly HORIZ_LINE_TO: number;
  readonly VERT_LINE_TO: number;
  readonly CURVE_TO: number;
  readonly CLOSE_PATH: number;
}

const {
  SVGPathData,
  SVGPathDataTransformer,
  encodeSVGPath
} = requireFromSvgicons("svg-pathdata") as {
  SVGPathData: SvgPathDataConstructor;
  SVGPathDataTransformer: {
    REVERSE_PATH: (commands: SvgCommand[], preserveSubpathOrder?: boolean) => SvgCommand[];
  };
  encodeSVGPath: (commands: SvgCommand[]) => string;
};

const svg2ttf = requireFromRoot("svg2ttf") as (
  svgString: string,
  options?: {
    ts?: number;
    copyright?: string;
    description?: string;
    url?: string;
    version?: string;
    fullname?: string;
    familyname?: string;
    subfamilyname?: string;
  }
) => { buffer: Uint8Array };

const ttf2woff = requireFromRoot("ttf2woff") as (
  ttfBuffer: Uint8Array,
  options?: Record<string, unknown>
) => { buffer: Uint8Array };

const wawoff2 = requireFromRoot("wawoff2") as {
  compress: (ttfBuffer: Uint8Array) => Promise<Uint8Array>;
};

export const FONT_MONOCHROME_STYLES = [
  "thin",
  "light",
  "regular",
  "bold",
  "fill"
] as const;

export type FontMonochromeStyle = (typeof FONT_MONOCHROME_STYLES)[number];

export const FONT_EXCLUDED_STYLES = ["duotone", "color"] as const;

export const FONT_FAMILY_NAMES: Readonly<Record<FontMonochromeStyle, string>> = {
  thin: "Slatico Thin",
  light: "Slatico Light",
  regular: "Slatico Regular",
  bold: "Slatico Bold",
  fill: "Slatico Fill"
};

export const FONT_FILE_BASENAMES: Readonly<Record<FontMonochromeStyle, string>> = {
  thin: "slatico-thin",
  light: "slatico-light",
  regular: "slatico-regular",
  bold: "slatico-bold",
  fill: "slatico-fill"
};

function sampleSubpathPolygon(commands: readonly SvgCommand[]): [number, number][] {
  const pts: [number, number][] = [];
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;

  for (const cmd of commands) {
    if (cmd.type === SVGPathData.MOVE_TO) {
      cx = cmd.x ?? 0;
      cy = cmd.y ?? 0;
      sx = cx;
      sy = cy;
      pts.push([cx, cy]);
    } else if (cmd.type === SVGPathData.LINE_TO) {
      cx = cmd.x ?? cx;
      cy = cmd.y ?? cy;
      pts.push([cx, cy]);
    } else if (cmd.type === SVGPathData.HORIZ_LINE_TO) {
      cx = cmd.x ?? cx;
      pts.push([cx, cy]);
    } else if (cmd.type === SVGPathData.VERT_LINE_TO) {
      cy = cmd.y ?? cy;
      pts.push([cx, cy]);
    } else if (cmd.type === SVGPathData.CURVE_TO) {
      const x0 = cx;
      const y0 = cy;
      const x1 = cmd.x1 ?? x0;
      const y1 = cmd.y1 ?? y0;
      const x2 = cmd.x2 ?? x0;
      const y2 = cmd.y2 ?? y0;
      const x = cmd.x ?? x0;
      const y = cmd.y ?? y0;
      const steps = 8;
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const mt = 1 - t;
        const px =
          mt * mt * mt * x0 +
          3 * mt * mt * t * x1 +
          3 * mt * t * t * x2 +
          t * t * t * x;
        const py =
          mt * mt * mt * y0 +
          3 * mt * mt * t * y1 +
          3 * mt * t * t * y2 +
          t * t * t * y;
        pts.push([px, py]);
      }
      cx = x;
      cy = y;
    } else if (cmd.type === SVGPathData.CLOSE_PATH) {
      cx = sx;
      cy = sy;
    }
  }
  return pts;
}

function computeSignedArea(pts: readonly [number, number][]): number {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]!;
    const [x2, y2] = pts[(i + 1) % pts.length]!;
    area += x1 * y2 - x2 * y1;
  }
  return area / 2;
}

function pointInPolygon(pt: readonly [number, number], vs: readonly [number, number][]): boolean {
  const [x, y] = pt;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const [xi, yi] = vs[i]!;
    const [xj, yj] = vs[j]!;
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Normalizes SVG compound path contour winding directions in memory so that
 * TrueType (`fill-rule="nonzero"`) preserves all interior holes and negative spaces
 * authored with `fill-rule="evenodd"` in SVG. Never modifies source SVG files on disk.
 */
export function normalizePathWindingForTrueType(d: string): string {
  const pathData = new SVGPathData(d).toAbs().normalizeST().qtToC().aToC();

  const subpaths: SvgCommand[][] = [];
  let current: SvgCommand[] = [];
  for (const cmd of pathData.commands) {
    if (cmd.type === SVGPathData.MOVE_TO && current.length > 0) {
      subpaths.push(current);
      current = [];
    }
    current.push(cmd);
  }
  if (current.length > 0) {
    subpaths.push(current);
  }

  if (subpaths.length <= 1) {
    return d;
  }

  const analyzed = subpaths.map((cmds) => {
    const pts = sampleSubpathPolygon(cmds);
    const signedArea = computeSignedArea(pts);
    return {
      cmds,
      pts,
      signedArea,
      absArea: Math.abs(signedArea)
    };
  });

  const normalizedCommands: SvgCommand[] = [];
  for (let i = 0; i < analyzed.length; i++) {
    const sub = analyzed[i]!;
    if (sub.pts.length === 0) {
      normalizedCommands.push(...sub.cmds);
      continue;
    }
    let depth = 0;
    const testPt = sub.pts[0]!;
    for (let j = 0; j < analyzed.length; j++) {
      if (i === j) {
        continue;
      }
      const other = analyzed[j]!;
      if (other.absArea <= sub.absArea) {
        continue;
      }
      if (pointInPolygon(testPt, other.pts)) {
        depth++;
      }
    }
    const shouldBePositive = depth % 2 === 0;
    const isPositive = sub.signedArea >= 0;
    if (shouldBePositive !== isPositive) {
      normalizedCommands.push(...SVGPathDataTransformer.REVERSE_PATH(sub.cmds, true));
    } else {
      normalizedCommands.push(...sub.cmds);
    }
  }

  return encodeSVGPath(normalizedCommands);
}

export function prepareSvgForFontCompilation(svgContent: string): string {
  let prepared = svgContent.replace(/\bd="([^"]+)"/g, (_match, d: string) => {
    return `d="${normalizePathWindingForTrueType(d)}"`;
  });
  if (!/\bwidth="/.test(prepared)) {
    prepared = prepared.replace("<svg ", '<svg width="24" height="24" ');
  }
  return prepared;
}

export async function loadAndSyncCodepointsManifest(
  codepointsJsonPath: string,
  families: readonly DiscoveredIconFamily[]
): Promise<SlaticoCodepointManifest> {
  const rawJson = await fs.readFile(codepointsJsonPath, "utf8");
  const current = JSON.parse(rawJson) as SlaticoCodepointManifest;
  const iconNames = families.map((f) => f.name);
  const resolved = resolveStableCodepointManifest(current, iconNames);
  const serialized = `${JSON.stringify(resolved, null, 2)}\n`;
  if (serialized !== rawJson) {
    await fs.writeFile(codepointsJsonPath, serialized, "utf8");
  }
  return resolved;
}

export function generateFontManifestTsModule(
  families: readonly DiscoveredIconFamily[],
  manifest: SlaticoCodepointManifest
): string {
  const iconEntries = families.map((fam) => {
    const hex = manifest.codepoints[fam.name];
    if (!hex) {
      throw new Error(`Missing Unicode codepoint for icon "${fam.name}".`);
    }
    const num = parseCodepointHex(hex);
    return {
      name: fam.name,
      codepointHex: formatCodepointHex(num),
      codepointNumber: num,
      cssEscape: formatCssCodepointEscape(num),
      unicodeChar: String.fromCodePoint(num)
    };
  });

  const glyphEntries = [];
  for (const style of FONT_MONOCHROME_STYLES) {
    const fontFamily = FONT_FAMILY_NAMES[style];
    const fontFileBase = FONT_FILE_BASENAMES[style];
    for (const icon of iconEntries) {
      glyphEntries.push({
        iconName: icon.name,
        style,
        className: `slatico-${icon.name}-${style}`,
        shorthandClassName: `slatico-${icon.name}`,
        htmlSnippet: `<i class="slatico slatico-${icon.name}-${style}" aria-hidden="true"></i>`,
        fontFamily,
        fontFileBase,
        codepointHex: icon.codepointHex,
        codepointNumber: icon.codepointNumber,
        cssEscape: icon.cssEscape,
        unicodeChar: icon.unicodeChar
      });
    }
  }

  return `// AUTO-GENERATED BY scripts/generate-icons.ts — DO NOT EDIT MANUALLY
import type { SlaticoIconName } from "@slatico/core";

export const FONT_COMPATIBLE_STYLES = ${JSON.stringify(FONT_MONOCHROME_STYLES)} as const;
export type SlaticoFontCompatibleStyle = (typeof FONT_COMPATIBLE_STYLES)[number];

export const FONT_EXCLUDED_STYLES = ${JSON.stringify(FONT_EXCLUDED_STYLES)} as const;
export type SlaticoFontExcludedStyle = (typeof FONT_EXCLUDED_STYLES)[number];

export const FONT_FAMILIES: Readonly<Record<SlaticoFontCompatibleStyle, string>> = ${JSON.stringify(
    FONT_FAMILY_NAMES,
    null,
    2
  )};

export const FONT_FILE_BASENAMES: Readonly<Record<SlaticoFontCompatibleStyle, string>> = ${JSON.stringify(
    FONT_FILE_BASENAMES,
    null,
    2
  )};

export interface SlaticoFontGlyphMetadata {
  readonly iconName: SlaticoIconName;
  readonly style: SlaticoFontCompatibleStyle;
  readonly className: string;
  readonly shorthandClassName: string;
  readonly htmlSnippet: string;
  readonly fontFamily: string;
  readonly fontFileBase: string;
  readonly codepointHex: string;
  readonly codepointNumber: number;
  readonly cssEscape: string;
  readonly unicodeChar: string;
}

export const FONT_CODEPOINTS: Readonly<Record<SlaticoIconName, string>> = ${JSON.stringify(
    manifest.codepoints,
    null,
    2
  )};

export const FONT_CODEPOINT_MANIFEST = ${JSON.stringify(manifest, null, 2)} as const;

export const FONT_GLYPHS: readonly SlaticoFontGlyphMetadata[] = ${JSON.stringify(
    glyphEntries,
    null,
    2
  )};
`;
}

export async function compileStyleFontBuffers(
  style: FontMonochromeStyle,
  families: readonly DiscoveredIconFamily[],
  manifest: SlaticoCodepointManifest
): Promise<{
  svgFont: string;
  ttf: Buffer;
  woff: Buffer;
  woff2: Buffer;
}> {
  const familyName = FONT_FAMILY_NAMES[style];
  const fontId = FONT_FILE_BASENAMES[style];

  const svgFont = await new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const fontStream = new SVGIcons2SVGFontStream({
      fontName: familyName,
      fontId,
      fontHeight: 1200,
      descent: 0,
      normalize: true,
      round: 10e12
    });

    fontStream.on("data", (chunk: Buffer | string) => {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk, "utf8") : Buffer.from(chunk));
    });
    fontStream.on("error", reject);
    fontStream.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    for (const fam of families) {
      const hex = manifest.codepoints[fam.name];
      if (!hex) {
        reject(new Error(`Missing codepoint for icon "${fam.name}"`));
        return;
      }
      const codepoint = parseCodepointHex(hex);
      const rawSvg = fam.variants[style].optimizedSvg;
      const preparedSvg = prepareSvgForFontCompilation(rawSvg);

      const iconStream = new PassThrough() as PassThrough & {
        metadata: { unicode: string[]; name: string };
      };
      iconStream.metadata = {
        unicode: [String.fromCodePoint(codepoint)],
        name: fam.name
      };
      fontStream.write(iconStream);
      iconStream.end(preparedSvg);
    }

    fontStream.end();
  });

  const ttfResult = svg2ttf(svgFont, {
    ts: 0,
    version: "Version 1.0",
    familyname: familyName,
    fullname: familyName,
    subfamilyname: "Regular",
    copyright: "Copyright (c) Infitus Creative Studio. Licensed under MIT.",
    description: `${familyName} monochrome icon font from Slatico by Infitus Creative Studio.`,
    url: "https://github.com/infitusofficial/slatico"
  });
  const ttfBuffer = Buffer.from(ttfResult.buffer);

  const woffResult = ttf2woff(new Uint8Array(ttfBuffer), {});
  const woffBuffer = Buffer.from(woffResult.buffer);

  const woff2Uint8 = await wawoff2.compress(new Uint8Array(ttfBuffer));
  const woff2Buffer = Buffer.from(woff2Uint8);

  return {
    svgFont,
    ttf: ttfBuffer,
    woff: woffBuffer,
    woff2: woff2Buffer
  };
}

export function generateSlaticoFontCss(
  families: readonly DiscoveredIconFamily[],
  manifest: SlaticoCodepointManifest,
  fontRelativeDir = "./fonts"
): { css: string; minCss: string } {
  const lines: string[] = [
    "/*!",
    " * @slatico/font v0.1.0 — Slatico by Infitus Creative Studio",
    " * Monochrome Icon Font Stylesheet (Thin, Light, Regular, Bold, Fill)",
    " * Note: Duotone and Color styles require SVG, React, Vue, Web Components, or React Native.",
    " * License: MIT (https://github.com/infitusofficial/slatico)",
    " */",
    ""
  ];

  for (const style of FONT_MONOCHROME_STYLES) {
    const familyName = FONT_FAMILY_NAMES[style];
    const fileBase = FONT_FILE_BASENAMES[style];
    lines.push(
      "@font-face {",
      `  font-family: "${familyName}";`,
      `  src: url("${fontRelativeDir}/${fileBase}.woff2") format("woff2"),`,
      `       url("${fontRelativeDir}/${fileBase}.woff") format("woff"),`,
      `       url("${fontRelativeDir}/${fileBase}.ttf") format("truetype");`,
      "  font-weight: normal;",
      "  font-style: normal;",
      "  font-display: block;",
      "}",
      ""
    );
  }

  lines.push(
    ".slatico {",
    '  font-family: "Slatico Regular";',
    "  display: inline-block;",
    "  font-style: normal;",
    "  font-weight: normal;",
    "  font-variant: normal;",
    "  text-transform: none;",
    "  line-height: 1;",
    "  vertical-align: -0.125em;",
    "  speak: never;",
    "  -webkit-font-smoothing: antialiased;",
    "  -moz-osx-font-smoothing: grayscale;",
    "}",
    ""
  );

  for (const style of FONT_MONOCHROME_STYLES) {
    const familyName = FONT_FAMILY_NAMES[style];
    lines.push(`.slatico--${style} {`, `  font-family: "${familyName}";`, "}", "");
  }

  for (const fam of families) {
    const hex = manifest.codepoints[fam.name]!;
    const num = parseCodepointHex(hex);
    const cssEscape = formatCssCodepointEscape(num);

    lines.push(`.slatico-${fam.name}::before {`, `  content: "${cssEscape}";`, "}");

    for (const style of FONT_MONOCHROME_STYLES) {
      const familyName = FONT_FAMILY_NAMES[style];
      lines.push(
        `.slatico-${fam.name}-${style} {`,
        `  font-family: "${familyName}";`,
        "}",
        `.slatico-${fam.name}-${style}::before {`,
        `  content: "${cssEscape}";`,
        "}"
      );
    }
    lines.push("");
  }

  const css = `${lines.join("\n").trimEnd()}\n`;

  const minCss =
    "/*! @slatico/font v0.1.0 | MIT License | github.com/infitusofficial/slatico */" +
    css
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\s+/g, " ")
      .replace(/\s*([{}:;,])\s*/g, "$1")
      .replace(/;}/g, "}")
      .trim() +
    "\n";

  return { css, minCss };
}

export function buildJsonGlyphManifest(
  families: readonly DiscoveredIconFamily[],
  manifest: SlaticoCodepointManifest
): Record<string, unknown> {
  const glyphs: Record<string, unknown>[] = [];
  for (const style of FONT_MONOCHROME_STYLES) {
    const fontFamily = FONT_FAMILY_NAMES[style];
    const fontFileBase = FONT_FILE_BASENAMES[style];
    for (const fam of families) {
      const hex = manifest.codepoints[fam.name]!;
      const num = parseCodepointHex(hex);
      glyphs.push({
        iconName: fam.name,
        style,
        className: `slatico-${fam.name}-${style}`,
        shorthandClassName: `slatico-${fam.name}`,
        fontFamily,
        fontFileBase,
        codepointHex: formatCodepointHex(num),
        codepointNumber: num,
        cssEscape: formatCssCodepointEscape(num),
        unicodeChar: String.fromCodePoint(num)
      });
    }
  }

  return {
    name: "@slatico/font",
    version: "0.1.0",
    totalFamilies: families.length,
    totalStyles: FONT_MONOCHROME_STYLES.length,
    totalGlyphs: families.length * FONT_MONOCHROME_STYLES.length,
    supportedStyles: FONT_MONOCHROME_STYLES,
    excludedStyles: FONT_EXCLUDED_STYLES,
    excludedStylesReason:
      "Duotone (layered opacity/two-tone) and Color (multi-stop gradients and distinct vector fills) require SVG, React, Vue, Web Components, or React Native rendering and must never be flattened into monochrome fonts.",
    fontFamilies: FONT_FAMILY_NAMES,
    codepointManifest: manifest,
    glyphs
  };
}
