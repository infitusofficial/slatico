import { SITE_CONFIG } from "../site";
import { buildPageMetadata, type PageSeoConfig } from "./builder";

export const ABOUT_SEO_CONFIG: PageSeoConfig = {
  title: `About ${SITE_CONFIG.brandName} — Design Philosophy & 24×24 Optical Grid`,
  description:
    "Learn how Infitus Creative Studio engineered Slatico: a deterministic 24×24 vector grid, 7 synchronized architectural styles, and automated multi-platform code generation.",
  canonicalPath: "/about",
  keywords: [
    "About Slatico",
    "Infitus Creative Studio",
    "24x24 icon grid architecture",
    "multi-style icon system"
  ]
};

export const aboutMetadata = buildPageMetadata(ABOUT_SEO_CONFIG);
