import { SITE_CONFIG } from "../site";
import { buildPageMetadata, type PageSeoConfig } from "./builder";

export const ICONS_EXPLORER_SEO_CONFIG: PageSeoConfig = {
  title: `Icon Explorer — Browse ${SITE_CONFIG.metrics.totalFamilies} Families & ${SITE_CONFIG.metrics.totalVariants} Vector Variants | ${SITE_CONFIG.brandName}`,
  description:
    `Search, customize, and export all ${SITE_CONFIG.metrics.totalVariants} Slatico production icons across Thin, Light, Regular, Bold, Fill, Duotone, and Color styles in SVG, PNG, WebP, Vector PDF, and 11 platform code formats.`,
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
