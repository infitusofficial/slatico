import type { Metadata } from "next";
import { DOCS_GUIDES, SITE_CONFIG } from "../site";
import { buildPageMetadata, type PageSeoConfig } from "./builder";

export const DOCS_OVERVIEW_SEO_CONFIG: PageSeoConfig = {
  title: `Documentation — Multi-Platform Integration Guides | ${SITE_CONFIG.brandName}`,
  description:
    "Official developer documentation for integrating Slatico icons into React, Next.js, Vue 3, Vanilla HTML, Web Components, React Native, Flutter, Android (Compose & XML), and Apple Swift (SwiftUI, UIKit & AppKit).",
  canonicalPath: "/docs",
  keywords: [
    "Slatico documentation",
    "@slatico/react docs",
    "@slatico/vue docs",
    "@slatico/web docs",
    "@slatico/react-native docs",
    "slatico_icons Flutter docs",
    "SlaticoIcons Swift docs",
    "Slatico Android Compose docs"
  ]
};

export const docsOverviewMetadata = buildPageMetadata(DOCS_OVERVIEW_SEO_CONFIG);

export function buildDocsGuideMetadata(slug: string): Metadata {
  const guide = DOCS_GUIDES.find((item) => item.slug === slug);
  if (!guide) {
    return docsOverviewMetadata;
  }

  return buildPageMetadata({
    title: `${guide.title} Guide (${guide.packageName}) — ${SITE_CONFIG.brandName} Docs`,
    description: `${guide.summary} Learn installation, style switching, sizing, Duotone customization, and accessibility best practices.`,
    canonicalPath: guide.href,
    ogType: "article",
    keywords: [
      guide.title,
      guide.packageName,
      guide.ecosystem,
      "Slatico documentation",
      "SVG icon library guide"
    ]
  });
}
