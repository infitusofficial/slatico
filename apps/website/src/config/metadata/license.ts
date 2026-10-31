import { SITE_CONFIG } from "../site";
import { buildPageMetadata, type PageSeoConfig } from "./builder";

export const LICENSE_SEO_CONFIG: PageSeoConfig = {
  title: `MIT Open-Source License & Usage Permissions — ${SITE_CONFIG.brandName}`,
  description:
    "Read the full MIT License for Slatico by Infitus Creative Studio. Free for commercial and personal software, web apps, mobile apps, and design systems.",
  canonicalPath: "/license",
  keywords: [
    "Slatico MIT License",
    "open source icon license",
    "commercial use icons",
    "Infitus Creative Studio license"
  ]
};

export const licenseMetadata = buildPageMetadata(LICENSE_SEO_CONFIG);
