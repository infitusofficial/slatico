import { SITE_CONFIG } from "../site";
import { buildPageMetadata, type PageSeoConfig } from "./builder";

export const HOME_SEO_CONFIG: PageSeoConfig = {
  title: `${SITE_CONFIG.brandName} — Precision Multi-Platform Open-Source SVG Icon Library`,
  description:
    `Explore ${SITE_CONFIG.metrics.totalFamilies} original icon families and ${SITE_CONFIG.metrics.totalVariants} production vector variants across Thin, Light, Regular, Bold, Fill, Duotone, and Color styles. Built for React, Vue, HTML, React Native, Flutter, Android, and Apple Swift.`,
  canonicalPath: "/",
  keywords: [
    "Slatico",
    "SVG icons",
    "open source icons",
    "React icons",
    "Vue icons",
    "Flutter icons",
    "Android VectorDrawable icons",
    "SwiftUI icons",
    "React Native icons",
    "duotone icons",
    "Infitus Creative Studio"
  ]
};

export const homeMetadata = buildPageMetadata(HOME_SEO_CONFIG);
