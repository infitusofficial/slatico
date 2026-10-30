import { SLATICO_STYLE_SPECS, type SlaticoIconName, type SlaticoStyle } from "@slatico/core";
import {
  FONT_CODEPOINT_MANIFEST,
  FONT_CODEPOINTS,
  FONT_COMPATIBLE_STYLES,
  FONT_EXCLUDED_STYLES,
  FONT_FAMILIES,
  FONT_FILE_BASENAMES,
  FONT_GLYPHS,
  type SlaticoFontCompatibleStyle,
  type SlaticoFontExcludedStyle,
  type SlaticoFontGlyphMetadata
} from "./generated/font-manifest.js";

export {
  FONT_CODEPOINT_MANIFEST,
  FONT_CODEPOINTS,
  FONT_COMPATIBLE_STYLES,
  FONT_EXCLUDED_STYLES,
  FONT_FAMILIES,
  FONT_FILE_BASENAMES,
  FONT_GLYPHS,
  type SlaticoFontCompatibleStyle,
  type SlaticoFontExcludedStyle,
  type SlaticoFontGlyphMetadata
};

export {
  formatCodepointHex,
  formatCssCodepointEscape,
  parseCodepointHex,
  PUA_RANGE_END,
  PUA_RANGE_START,
  resolveStableCodepointManifest,
  type SlaticoCodepointManifest
} from "./codepoints.js";

export function canCompileStyleToMonochromeFont(
  style: SlaticoStyle
): style is SlaticoFontCompatibleStyle {
  return SLATICO_STYLE_SPECS[style].supportsIconFont;
}

export function getFontClassName(
  iconName: SlaticoIconName,
  style: SlaticoFontCompatibleStyle = "regular"
): string {
  return `slatico slatico-${iconName}-${style}`;
}

export function getFontGlyph(
  iconName: SlaticoIconName,
  style: SlaticoFontCompatibleStyle = "regular"
): SlaticoFontGlyphMetadata {
  const found = FONT_GLYPHS.find(
    (entry) => entry.iconName === iconName && entry.style === style
  );
  if (!found) {
    throw new Error(
      `Unknown Slatico font glyph "${iconName}" in style "${style}". Note: only monochrome styles (${FONT_COMPATIBLE_STYLES.join(
        ", "
      )}) are supported in @slatico/font.`
    );
  }
  return found;
}

export function getFontHtmlSnippet(
  iconName: SlaticoIconName,
  style: SlaticoFontCompatibleStyle = "regular",
  options?: { readonly title?: string; readonly className?: string }
): string {
  const classes = [
    "slatico",
    `slatico-${iconName}-${style}`,
    options?.className?.trim()
  ]
    .filter(Boolean)
    .join(" ");

  if (options?.title) {
    const escapedTitle = options.title
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<i class="${classes}" role="img" aria-label="${escapedTitle}"></i>`;
  }

  return `<i class="${classes}" aria-hidden="true"></i>`;
}

export const SLATICO_FONT_PACKAGE_STATUS = "implemented" as const;
