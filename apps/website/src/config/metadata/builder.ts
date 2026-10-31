import type { Metadata } from "next";
import { SITE_CONFIG } from "../site";

export interface PageSeoConfig {
  readonly title: string;
  readonly description: string;
  readonly canonicalPath: string;
  readonly keywords?: readonly string[];
  readonly ogTitle?: string;
  readonly ogDescription?: string;
  readonly ogType?: "website" | "article";
  readonly ogImage?: {
    readonly url: string;
    readonly width?: number;
    readonly height?: number;
    readonly alt?: string;
    readonly type?: string;
  };
  readonly twitterTitle?: string;
  readonly twitterDescription?: string;
  readonly twitterCard?: "summary_large_image" | "summary";
  readonly robots?: {
    readonly index?: boolean;
    readonly follow?: boolean;
  };
}

export function resolveCanonicalUrl(canonicalPath: string): string {
  const base = SITE_CONFIG.siteUrl.replace(/\/+$/, "");
  const cleanPath = canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`;
  return cleanPath === "/" ? base : `${base}${cleanPath}`;
}

export function buildPageMetadata(config: PageSeoConfig): Metadata {
  const canonicalUrl = resolveCanonicalUrl(config.canonicalPath);
  const resolvedOgImage = config.ogImage?.url
    ? {
        url: config.ogImage.url,
        width: config.ogImage.width ?? SITE_CONFIG.assets.ogImage.width,
        height: config.ogImage.height ?? SITE_CONFIG.assets.ogImage.height,
        alt: config.ogImage.alt ?? config.ogTitle ?? config.title,
        type: config.ogImage.type ?? SITE_CONFIG.assets.ogImage.type
      }
    : SITE_CONFIG.assets.ogImage;

  const ogTitle = config.ogTitle ?? config.title;
  const ogDescription = config.ogDescription ?? config.description;
  const twitterTitle = config.twitterTitle ?? ogTitle;
  const twitterDescription = config.twitterDescription ?? ogDescription;

  return {
    title: config.title,
    description: config.description,
    ...(config.keywords ? { keywords: [...config.keywords] } : {}),
    alternates: {
      canonical: canonicalUrl
    },
    robots: {
      index: config.robots?.index ?? true,
      follow: config.robots?.follow ?? true,
      googleBot: {
        index: config.robots?.index ?? true,
        follow: config.robots?.follow ?? true,
        "max-image-preview": "large",
        "max-snippet": -1
      }
    },
    openGraph: {
      type: config.ogType ?? "website",
      locale: SITE_CONFIG.locale,
      url: canonicalUrl,
      siteName: SITE_CONFIG.brandName,
      title: ogTitle,
      description: ogDescription,
      images: [resolvedOgImage]
    },
    twitter: {
      card: config.twitterCard ?? "summary_large_image",
      title: twitterTitle,
      description: twitterDescription,
      images: [resolvedOgImage.url]
    }
  };
}
