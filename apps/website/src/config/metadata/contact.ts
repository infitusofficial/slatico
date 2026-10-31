import { SITE_CONFIG } from "../site";
import { buildPageMetadata, type PageSeoConfig } from "./builder";

export const CONTACT_SEO_CONFIG: PageSeoConfig = {
  title: `Contact & Community Channels — ${SITE_CONFIG.brandName}`,
  description:
    "Connect with Infitus Creative Studio, request new icons, report bugs, or contribute to the open-source Slatico monorepo on GitHub.",
  canonicalPath: "/contact",
  keywords: [
    "Contact Slatico",
    "Infitus Creative Studio GitHub",
    "request Slatico icon",
    "Slatico issue tracker"
  ]
};

export const contactMetadata = buildPageMetadata(CONTACT_SEO_CONFIG);
