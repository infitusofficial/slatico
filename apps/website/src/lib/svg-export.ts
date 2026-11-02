import type { SlaticoIconName, SlaticoStyle } from "@slatico/core";
import { getSvgAsset, scopeSvgIds } from "@slatico/svg";

export interface StandaloneSvgOptions {
  readonly size?: number;
  readonly primaryColor?: string;
  readonly secondaryColor?: string;
  readonly secondaryOpacity?: number;
  readonly backgroundColor?: string | null;
  readonly idScope?: string;
}

function clampOpacity(value: number | undefined, fallback = 0.2): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }
  return Math.max(0, Math.min(1, Number(value.toFixed(3))));
}

function resolveCssColorToken(raw: string, fallback = "#1A1931"): string {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "currentColor") {
    return fallback;
  }
  if (trimmed.startsWith("var(")) {
    if (typeof document !== "undefined") {
      const varMatch = trimmed.match(/var\((--[a-zA-Z0-9-]+)\)/);
      if (varMatch?.[1]) {
        const computed = getComputedStyle(document.documentElement)
          .getPropertyValue(varMatch[1])
          .trim();
        if (computed) {
          return computed;
        }
      }
    }
    return fallback;
  }
  return trimmed;
}

/**
 * Generates a 100% standalone, valid <svg> string with all CSS variables and
 * currentColor references resolved to concrete attribute values so the file
 * renders identically in Figma, Illustrator, browsers, and native image decoders.
 */
export function buildStandaloneSvg(
  name: SlaticoIconName,
  style: SlaticoStyle,
  options: StandaloneSvgOptions = {}
): string {
  const asset = getSvgAsset(name, style);
  const size = options.size ?? 24;
  const primaryColor = (options.primaryColor ?? "currentColor").trim() || "currentColor";
  const resolvedPrimary = resolveCssColorToken(primaryColor, "#1A1931");
  const resolvedSecondary = options.secondaryColor
    ? resolveCssColorToken(options.secondaryColor, resolvedPrimary)
    : resolvedPrimary;
  const resolvedOpacity = clampOpacity(options.secondaryOpacity, 0.2);

  let inner = options.idScope
    ? scopeSvgIds(asset.innerSvg, options.idScope)
    : asset.innerSvg;

  if (style === "duotone") {
    inner = inner
      .replace(
        /var\(--slatico-secondary-color,\s*currentColor\)/g,
        resolvedSecondary
      )
      .replace(
        /var\(--slatico-secondary-opacity,\s*0\.2\)/g,
        String(resolvedOpacity)
      )
      .replace(/currentColor/g, resolvedPrimary);
  } else if (style === "color") {
    const colorPrimaryRaw = (options.primaryColor ?? "").trim();
    const resolvedColorPrimary =
      colorPrimaryRaw && colorPrimaryRaw !== "currentColor"
        ? resolveCssColorToken(colorPrimaryRaw, "#FF6040")
        : "#FF6040";
    const defaultColorSecondary =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark")
        ? "#FFFFFF"
        : "#000000";
    const colorSecondaryRaw = (options.secondaryColor ?? "").trim();
    const resolvedColorSecondary =
      colorSecondaryRaw &&
      colorSecondaryRaw !== "currentColor" &&
      colorSecondaryRaw !== "var(--primary)"
        ? resolveCssColorToken(colorSecondaryRaw, defaultColorSecondary)
        : defaultColorSecondary;

    // Single pass: chained replacements would re-match colors that were just substituted
    // (e.g. a custom secondary of #FF6040 being rewritten to the primary color).
    inner = inner.replace(
      /var\(--slatico-primary-color,\s*[^)]+\)|var\(--slatico-secondary-color,\s*[^)]+\)|\bfill="#FF6040"|\bfill="(?:black|#000000|#000)"/gi,
      (token) => {
        if (/^var\(--slatico-primary-color/i.test(token)) return resolvedColorPrimary;
        if (/^var\(--slatico-secondary-color/i.test(token)) return resolvedColorSecondary;
        if (/#FF6040/i.test(token)) return `fill="${resolvedColorPrimary}"`;
        return `fill="${resolvedColorSecondary}"`;
      }
    );
  } else {
    inner = inner.replace(/currentColor/g, resolvedPrimary);
  }

  const bgRect =
    options.backgroundColor && options.backgroundColor !== "transparent"
      ? `<rect width="24" height="24" fill="${options.backgroundColor}"/>`
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${asset.viewBox}" fill="none">${bgRect}${inner}</svg>`;
}

export function getExportFileBaseName(
  name: SlaticoIconName,
  style: SlaticoStyle,
  size?: number
): string {
  return size ? `slatico-${name}-${style}-${size}px` : `slatico-${name}-${style}`;
}

export function triggerBlobDownload(blob: Blob, fileName: string): void {
  if (typeof document === "undefined") {
    return;
  }
  const objectUrl = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 1500);
  }
}

export function downloadStandaloneSvg(
  name: SlaticoIconName,
  style: SlaticoStyle,
  options: StandaloneSvgOptions = {}
): string {
  const svg = buildStandaloneSvg(name, style, options);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const fileName = `${getExportFileBaseName(name, style, options.size)}.svg`;
  triggerBlobDownload(blob, fileName);
  return svg;
}
