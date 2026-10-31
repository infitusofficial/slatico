import type { Metadata } from "next";
import { SITE_CONFIG } from "../site";
import { buildPageMetadata, type PageSeoConfig } from "./builder";

export const ICONS_EXPLORER_SEO_CONFIG: PageSeoConfig = {
  title: `Icon Explorer — Browse ${SITE_CONFIG.metrics.totalFamilies} Families & ${SITE_CONFIG.metrics.totalVariants} Vector Variants | ${SITE_CONFIG.brandName}`,
  description:
    "Search, customize, and export all 161 Slatico production icons across Thin, Light, Regular, Bold, Fill, Duotone, and Color styles in SVG, PNG, WebP, Vector PDF, and 11 platform code formats.",
  canonicalPath: "/icons",
  keywords: [
    "Slatico icon explorer",
    "SVG icon search",
    "customizable SVG icons",
    "download PNG WebP PDF icons",
    "duotone icon customizer"
  ]
};

export const iconsExplorerMetadata = buildPageMetadata(ICONS_EXPLORER_SEO_CONFIG);

export function buildIconDetailMetadata(params: {
  name: string;
  pascalName: string;
  categoryLabel: string;
  keywords: readonly string[];
}): Metadata {
  return buildPageMetadata({
    title: `${params.pascalName} (${params.name}) Icon — 7 Styles, SVG/PNG/WebP/PDF & Code | ${SITE_CONFIG.brandName}`,
    description: `Inspect and export the ${params.pascalName} (${params.name}) icon across Thin, Light, Regular, Bold, Fill, Duotone, and Color styles. Copy production code for React, Vue, HTML, React Native, Flutter, Android, and Swift.`,
    canonicalPath: `/icons/${params.name}`,
    keywords: [
      `${params.name} icon`,
      `${params.pascalName} svg icon`,
      `Slatico ${params.name}`,
      params.categoryLabel,
      ...params.keywords
    ]
  });
}
