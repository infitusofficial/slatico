import type { SlaticoIconName, SlaticoStyle } from "@slatico/core";
import { SVG_ASSETS, SVG_SPRITES } from "./generated/svg-data.js";

export { SVG_ASSETS, SVG_SPRITES } from "./generated/svg-data.js";

export interface SlaticoSvgAsset {
  readonly name: SlaticoIconName;
  readonly style: SlaticoStyle;
  readonly symbolId: string;
  readonly viewBox: string;
  readonly svg: string;
  readonly innerSvg: string;
}

export interface RenderSvgOptions {
  readonly size?: number | string | undefined;
  readonly color?: string | undefined;
  readonly secondaryColor?: string | undefined;
  readonly secondaryOpacity?: number | string | undefined;
  readonly title?: string | undefined;
  readonly className?: string | undefined;
  readonly idPrefix?: string | undefined;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Scope internal SVG IDs (e.g., id="slatico-..." and url(#slatico-...)) with a unique suffix
 * so multiple rendered instances never collide in the DOM.
 */
export function scopeSvgIds(svgFragment: string, instanceScope: string): string {
  if (!instanceScope) {
    return svgFragment;
  }
  const safeScope = instanceScope.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeScope) {
    return svgFragment;
  }
  return svgFragment
    .replace(/\bid="(slatico-[^"]+)"/g, `id="$1-${safeScope}"`)
    .replace(/url\(#(slatico-[^)]+)\)/g, `url(#$1-${safeScope})`)
    .replace(/href="#(slatico-[^"]+)"/g, `href="#$1-${safeScope}"`);
}

/**
 * Returns the canonical sprite <symbol> ID for a given icon name and style.
 * Example: getSpriteSymbolId("sparkle", "duotone") -> "slatico-duotone-sparkle"
 */
export function getSpriteSymbolId(
  name: SlaticoIconName,
  style: SlaticoStyle = "regular"
): string {
  return `slatico-${style}-${name}`;
}

/**
 * Retrieves the optimized SVG asset for a given icon name and style.
 */
export function getSvgAsset(
  name: SlaticoIconName,
  style: SlaticoStyle = "regular"
): SlaticoSvgAsset {
  const family = SVG_ASSETS[name];
  if (!family) {
    throw new Error(`Unknown Slatico icon "${String(name)}".`);
  }
  const asset = family[style];
  if (!asset) {
    throw new Error(`Unknown Slatico style "${String(style)}" for icon "${String(name)}".`);
  }
  return asset;
}

/**
 * Returns the complete SVG sprite sheet string for a given Slatico style.
 */
export function getSvgSprite(style: SlaticoStyle = "regular"): string {
  const sprite = SVG_SPRITES[style];
  if (!sprite) {
    throw new Error(`Unknown Slatico style "${String(style)}".`);
  }
  return sprite;
}

/**
 * Programmatically renders a complete, accessible, instance-scoped <svg> string.
 */
export function renderSvgMarkup(
  name: SlaticoIconName,
  style: SlaticoStyle = "regular",
  options: RenderSvgOptions = {}
): string {
  const asset = getSvgAsset(name, style);
  const {
    size = 24,
    color = "currentColor",
    secondaryColor,
    secondaryOpacity,
    title,
    className,
    idPrefix
  } = options;

  const styleParts: string[] = [];
  if (style !== "color" && color) {
    styleParts.push(`color:${color}`);
  }
  if (secondaryColor !== undefined) {
    styleParts.push(`--slatico-secondary-color:${secondaryColor}`);
  }
  if (secondaryOpacity !== undefined) {
    styleParts.push(`--slatico-secondary-opacity:${String(secondaryOpacity)}`);
  }

  const styleAttr = styleParts.length > 0 ? ` style="${escapeXml(styleParts.join(";"))}"` : "";
  const classAttr = className ? ` class="${escapeXml(className)}"` : "";
  const a11yAttrs = title
    ? ` role="img" aria-label="${escapeXml(title)}"`
    : ' aria-hidden="true"';
  const titleElement = title ? `<title>${escapeXml(title)}</title>` : "";
  const inner = idPrefix ? scopeSvgIds(asset.innerSvg, idPrefix) : asset.innerSvg;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${asset.viewBox}" width="${escapeXml(
    String(size)
  )}" height="${escapeXml(
    String(size)
  )}" fill="none"${classAttr}${styleAttr}${a11yAttrs} data-slatico-icon="${asset.name}" data-slatico-variant="${asset.style}">${titleElement}${inner}</svg>`;
}
