import type { SlaticoStyle } from "@slatico/core";

/**
 * One rendered icon variant (family + style). The Icon Explorer receives these from the
 * lazily loaded catalog shards (see `catalog-client.ts`); build-time code and tests can pass
 * `getSvgAsset(name, style)` from `@slatico/svg`, which has the same shape.
 */
export interface IconVariantAsset {
  readonly name: string;
  readonly style: SlaticoStyle;
  readonly viewBox: string;
  readonly innerSvg: string;
}

/**
 * Suffixes every `slatico-*` id (and its `url(#…)` / `href="#…"` references) with a scope so
 * several inline copies of the same icon never collide. Mirrors `scopeSvgIds` in
 * `@slatico/svg`, duplicated here so client code does not import that package's full catalog.
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
