import { ICON_CATALOG, SLATICO_STYLES, SLATICO_STYLE_SPECS } from "@slatico/core";

export interface SiteNavigationItem {
  readonly label: string;
  readonly href: string;
  readonly description?: string;
}

export interface DocsGuideNavItem {
  readonly slug: string;
  readonly title: string;
  readonly shortTitle: string;
  readonly href: string;
  readonly packageName: string;
  readonly ecosystem: string;
  readonly summary: string;
}

export const DOCS_GUIDES: readonly DocsGuideNavItem[] = [
  {
    slug: "react",
    title: "React & Next.js",
    shortTitle: "React",
    href: "/docs/react",
    packageName: "@slatico/react",
    ecosystem: "React 18 / 19 & Next.js App Router",
    summary:
      "Tree-shakeable React SVG components with typed style, size, primary color, and Duotone secondary controls."
  },
  {
    slug: "vue",
    title: "Vue 3 & Nuxt",
    shortTitle: "Vue 3",
    href: "/docs/vue",
    packageName: "@slatico/vue",
    ecosystem: "Vue 3 Composition API & Nuxt 3",
    summary:
      "First-class Vue 3 functional icon components supporting all 7 architectural styles and reactive props."
  },
  {
    slug: "html",
    title: "Vanilla HTML, SVG & Web Components",
    shortTitle: "HTML / Web",
    href: "/docs/html",
    packageName: "@slatico/svg · @slatico/web · @slatico/font",
    ecosystem: "Pure SVG, Custom Elements & Webfonts",
    summary:
      "Zero-framework SVG rendering, <slatico-icon> custom elements with Shadow DOM, and WOFF2/TTF icon fonts."
  },
  {
    slug: "react-native",
    title: "React Native & Expo",
    shortTitle: "React Native",
    href: "/docs/react-native",
    packageName: "@slatico/react-native",
    ecosystem: "iOS, Android & New Architecture (Fabric)",
    summary:
      "Native vector rendering powered by react-native-svg with resolved Duotone colors and zero web-only CSS dependencies."
  },
  {
    slug: "flutter",
    title: "Flutter (iOS, Android, Web & Desktop)",
    shortTitle: "Flutter",
    href: "/docs/flutter",
    packageName: "slatico_icons",
    ecosystem: "Dart 3.3+ & Flutter 3.19+",
    summary:
      "Multi-style SlaticoIcon widget and SlaticoIcons catalog backed by flutter_svg and bundled vector assets."
  },
  {
    slug: "android",
    title: "Android Native (Jetpack Compose & XML)",
    shortTitle: "Android",
    href: "/docs/android",
    packageName: "dev.slatico:slatico-android",
    ecosystem: "Jetpack Compose & Android View XML",
    summary:
      `${ICON_CATALOG.totalVariants} native Android VectorDrawable resources and Jetpack Compose SlaticoIcon composables with runtime tinting.`
  },
  {
    slug: "swift",
    title: "Apple Native (SwiftUI, UIKit & AppKit)",
    shortTitle: "Swift / Apple",
    href: "/docs/swift",
    packageName: "SlaticoIcons (Swift Package)",
    ecosystem: "iOS 15+, iPadOS, macOS 12+ & Mac Catalyst",
    summary:
      "Native CoreGraphics/SwiftUI vector path renderer with SwiftUI View, UIImage, and NSImage APIs."
  }
] as const;

const RAW_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const RESOLVED_SITE_URL = (
  RAW_SITE_URL && RAW_SITE_URL.length > 0 ? RAW_SITE_URL : "https://slatico.dev"
).replace(/\/+$/, "");

export const SITE_CONFIG = {
  brandName: "Slatico",
  fullName: "Slatico by Infitus Creative Studio",
  colors: {
    primary: "#FF6040",
    dark: "#010520"
  },
  publisher: {
    name: "Infitus Creative Studio",
    url: "https://github.com/infitusofficial"
  },
  tagline: "Precision-crafted multi-platform icon system across 7 architectural styles.",
  title: "Slatico — Multi-Platform Open-Source Icon System by Infitus Creative Studio",
  description:
    `Explore ${ICON_CATALOG.totalIcons} original icon families and ${ICON_CATALOG.totalVariants} production vector variants across Thin, Light, Regular, Bold, Fill, Duotone, and Color styles for React, Vue, Web Components, React Native, Flutter, Android, and Apple Swift.`,
  siteUrl: RESOLVED_SITE_URL,
  locale: "en_US",
  language: "en",
  license: "MIT",
  version: ICON_CATALOG.version,
  npmScope: "@slatico",
  releaseStatus: {
    isPublishedToRegistries: true,
    badgeLabel: `v${ICON_CATALOG.version} · Public Release`,
    notice:
      `Slatico ${ICON_CATALOG.version} is published on npm (@slatico/*), pub.dev (slatico_icons), Maven Central (dev.slatico:slatico-android), and Swift Package Manager (github.com/infitusofficial/slatico-swift).`
  },
  links: {
    website: RESOLVED_SITE_URL,
    github: "https://github.com/infitusofficial/slatico",
    githubIssues: "https://github.com/infitusofficial/slatico/issues",
    githubDiscussions: "https://github.com/infitusofficial/slatico/issues",
    licenseBlob: "https://github.com/infitusofficial/slatico/blob/main/LICENSE"
  },
  registries: [
    { label: "npm", href: "https://www.npmjs.com/org/slatico" },
    { label: "pub.dev", href: "https://pub.dev/packages/slatico_icons" },
    {
      label: "Maven Central",
      href: "https://central.sonatype.com/artifact/dev.slatico/slatico-android"
    },
    { label: "Swift Package", href: "https://github.com/infitusofficial/slatico-swift" }
  ],
  assets: {
    logo: "/brand/logo.svg",
    logoDark: "/brand/logo-dark.svg",
    logoWidth: 497,
    logoHeight: 114,
    brandIcon: "/brand/icon.svg",
    faviconIco: "/favicon.ico",
    favicon16: "/favicon-16x16.png",
    favicon32: "/favicon-32x32.png",
    appleTouchIcon: "/apple-touch-icon.png",
    androidChrome192: "/android-chrome-192x192.png",
    androidChrome512: "/android-chrome-512x512.png",
    manifest: "/site.webmanifest",
    ogImage: {
      url: "/brand/og-image.png",
      width: 1200,
      height: 630,
      alt: "Slatico by Infitus Creative Studio — Multi-Platform Open-Source Icon System",
      type: "image/png"
    }
  },
  metrics: {
    totalFamilies: ICON_CATALOG.totalIcons,
    totalVariants: ICON_CATALOG.totalVariants,
    totalStyles: SLATICO_STYLES.length,
    masterGrid: ICON_CATALOG.masterViewBox
  },
  styles: SLATICO_STYLES.map((styleId) => SLATICO_STYLE_SPECS[styleId]),
  mainNav: [
    { label: "Home", href: "/" },
    { label: "Icons", href: "/icons" },
    { label: "Docs", href: "/docs" },
    { label: "About", href: "/about" },
    { label: "License", href: "/license" },
    { label: "Contact", href: "/contact" }
  ] satisfies readonly SiteNavigationItem[],
  docsGuides: DOCS_GUIDES
} as const;

export type SiteConfig = typeof SITE_CONFIG;
