import { SITE_CONFIG } from "../config/site";
import { resolveCanonicalUrl } from "../config/metadata";

export interface BreadcrumbEntry {
  readonly name: string;
  readonly path: string;
}

export function buildOrganizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.publisher.name,
    url: SITE_CONFIG.publisher.url,
    logo: resolveCanonicalUrl(SITE_CONFIG.assets.logo),
    sameAs: [SITE_CONFIG.links.github]
  };
}

export function buildWebSiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.fullName,
    alternateName: SITE_CONFIG.brandName,
    url: resolveCanonicalUrl("/"),
    description: SITE_CONFIG.description,
    inLanguage: SITE_CONFIG.language,
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.publisher.name,
      url: SITE_CONFIG.publisher.url
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${resolveCanonicalUrl("/icons")}?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

export function buildSoftwareSourceCodeJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: SITE_CONFIG.brandName,
    description: SITE_CONFIG.description,
    url: resolveCanonicalUrl("/"),
    version: SITE_CONFIG.version,
    codeRepository: SITE_CONFIG.links.github,
    license: SITE_CONFIG.links.licenseBlob,
    programmingLanguage: [
      "TypeScript",
      "JavaScript",
      "Dart",
      "Kotlin",
      "Swift",
      "SVG"
    ],
    runtimePlatform: [
      "React",
      "Vue 3",
      "Web Components",
      "React Native",
      "Flutter",
      "Android Jetpack Compose",
      "Apple SwiftUI / UIKit / AppKit"
    ],
    author: {
      "@type": "Organization",
      name: SITE_CONFIG.publisher.name,
      url: SITE_CONFIG.publisher.url
    }
  };
}

export function buildBreadcrumbJsonLd(
  items: readonly BreadcrumbEntry[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: resolveCanonicalUrl(item.path)
    }))
  };
}
