/**
 * Build-time / server-side view of the full icon catalog.
 *
 * This module reads every family from `@slatico/core`, so it must only be imported by server
 * components, build scripts (`scripts/generate-website-catalog.ts`) and tests. Client components
 * use `catalog-client.ts`, which lazily fetches the generated JSON shards instead.
 */
import {
  ICON_CATALOG,
  SLATICO_STYLES,
  SLATICO_STYLE_SPECS,
  type SlaticoIconEntry,
  type SlaticoIconName,
  type SlaticoStyle
} from "@slatico/core";
import {
  buildSearchableText,
  getCategoryLabel,
  ICON_CATEGORIES,
  ICON_SEMANTIC_MAP,
  inferFallbackCategory,
  matchesIconQuery,
  normalizeIconSearchQuery,
  parseIconQuery,
  type IconCategoryDefinition,
  type IconCategoryId,
  type IconFamilyCategoryId
} from "../data/icon-taxonomy";

export interface EnrichedCatalogIcon extends SlaticoIconEntry {
  readonly name: SlaticoIconName;
  readonly categoryId: IconFamilyCategoryId;
  readonly categoryLabel: string;
  readonly keywords: readonly string[];
  readonly summary: string;
  readonly searchableText: string;
}

export const ENRICHED_ICONS: readonly EnrichedCatalogIcon[] = ICON_CATALOG.icons.map(
  (entry) => {
    const enrichment = ICON_SEMANTIC_MAP[entry.name];
    const categoryId = enrichment?.categoryId ?? inferFallbackCategory(entry.name);
    const categoryLabel = getCategoryLabel(categoryId);
    const keywords = enrichment?.keywords ?? entry.name.split("-").filter(Boolean);
    const summary =
      enrichment?.summary ??
      `${entry.pascalName} vector icon across all 7 Slatico architectural styles.`;

    return {
      ...entry,
      name: entry.name as SlaticoIconName,
      categoryId,
      categoryLabel,
      keywords,
      summary,
      searchableText: buildSearchableText({
        name: entry.name,
        pascalName: entry.pascalName,
        categoryLabel,
        keywords
      })
    };
  }
);

export function getEnrichedIconByName(
  slug: string
): EnrichedCatalogIcon | undefined {
  const normalized = slug.trim().toLowerCase();
  return ENRICHED_ICONS.find((icon) => icon.name === normalized);
}

/** Reference (in-memory) implementation of the explorer search; the client cursor must match it. */
export function filterCatalogIcons(params: {
  query?: string;
  category?: IconCategoryId;
}): readonly EnrichedCatalogIcon[] {
  const query = parseIconQuery(params.query ?? "");
  const category = params.category ?? "all";
  return ENRICHED_ICONS.filter(
    (icon) =>
      (category === "all" || icon.categoryId === category) && matchesIconQuery(icon, query)
  );
}

export { ICON_CATEGORIES, normalizeIconSearchQuery };
export type { IconCategoryDefinition, IconCategoryId };
export { ICON_CATALOG, SLATICO_STYLES, SLATICO_STYLE_SPECS };
export type { SlaticoIconName, SlaticoStyle };
