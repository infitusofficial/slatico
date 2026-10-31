import type { MetadataRoute } from "next";
import { resolveCanonicalUrl } from "../config/metadata";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: resolveCanonicalUrl("/sitemap.xml")
  };
}
