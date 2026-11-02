import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "../config/site";
import { resolveCanonicalUrl } from "../config/metadata";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-10-31T00:00:00.000Z");

  const corePages: MetadataRoute.Sitemap = [
    {
      url: resolveCanonicalUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0
    },
    {
      url: resolveCanonicalUrl("/icons"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.95
    },
    {
      url: resolveCanonicalUrl("/docs"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: resolveCanonicalUrl("/about"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: resolveCanonicalUrl("/license"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      url: resolveCanonicalUrl("/contact"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6
    }
  ];

  const docsPages: MetadataRoute.Sitemap = SITE_CONFIG.docsGuides.map(
    (guide) => ({
      url: resolveCanonicalUrl(guide.href),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85
    })
  );

  // Icon detail URLs (/icons/<slug>) are drawer states of the Explorer and share its canonical
  // (https://slatico.dev/icons), so they are intentionally not listed.
  return [...corePages, ...docsPages];
}
