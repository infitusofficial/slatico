import {
  ICON_CATALOG,
  SLATICO_STYLES,
  SLATICO_STYLE_SPECS,
  type SlaticoStyleSpec
} from "@slatico/core";

export const SITE_METADATA = {
  brand: "Slatico",
  parentBrand: "Infitus Creative Studio",
  tagline: "One Icon System. Seven Precision Styles. Every Modern Platform.",
  description:
    "Slatico by Infitus Creative Studio is a modern, original, open-source SVG icon system engineered on a strict 24x24 optical grid across Thin, Light, Regular, Bold, Fill, Duotone, and Color styles.",
  githubUrl: "https://github.com/infitusofficial/slatico",
  npmScope: "@slatico",
  license: "MIT",
  phaseStatus: "Tier 1 Production Collection — 23 Icon Families × 7 Styles (161 Variants)"
} as const;

export const STYLE_LIST: readonly SlaticoStyleSpec[] = SLATICO_STYLES.map(
  (style) => SLATICO_STYLE_SPECS[style]
);

export interface PlatformRoadmapItem {
  readonly id: string;
  readonly name: string;
  readonly packageIdentifier: string;
  readonly ecosystem: string;
  readonly status: "Implemented (Verified Locally)" | "Interface Prepared (Planned)";
  readonly description: string;
}

export const PLATFORM_ROADMAP: readonly PlatformRoadmapItem[] = [
  {
    id: "core",
    name: "Core Metadata & Catalog",
    packageIdentifier: "@slatico/core",
    ecosystem: "TypeScript / Node.js",
    status: "Implemented (Verified Locally)",
    description: "Strict TypeScript style specifications, naming utilities, and generated icon catalog."
  },
  {
    id: "svg",
    name: "Optimized SVGs & Sprites",
    packageIdentifier: "@slatico/svg",
    ecosystem: "Vanilla HTML / Universal Bundlers",
    status: "Implemented (Verified Locally)",
    description: "Individual optimized SVGs, 7 variant SVG sprites, stable symbol IDs, and programmatic SVG rendering."
  },
  {
    id: "react",
    name: "React Components",
    packageIdentifier: "@slatico/react",
    ecosystem: "React 18+ / Next.js",
    status: "Implemented (Verified Locally)",
    description: "Tree-shakeable React components supporting all 7 variants, Duotone props, and instance-scoped SVG IDs."
  },
  {
    id: "vue",
    name: "Vue 3 Components",
    packageIdentifier: "@slatico/vue",
    ecosystem: "Vue 3 / Nuxt (SSR Ready)",
    status: "Implemented (Verified Locally)",
    description: "Typed Vue 3 components with individual subpath imports, Duotone customization, and SSR-safe scoped IDs."
  },
  {
    id: "web",
    name: "Web Components",
    packageIdentifier: "@slatico/web",
    ecosystem: "Native Custom Elements",
    status: "Implemented (Verified Locally)",
    description: "Framework-independent <slatico-icon> Shadow DOM Custom Element with selective icon registration."
  },
  {
    id: "react-native",
    name: "React Native",
    packageIdentifier: "@slatico/react-native",
    ecosystem: "iOS & Android (Expo / RN)",
    status: "Implemented (Verified Locally)",
    description: "Native vector components powered by react-native-svg supporting all 7 styles, Duotone, and Color gradients."
  },
  {
    id: "font",
    name: "Web Icon Fonts",
    packageIdentifier: "@slatico/font",
    ecosystem: "CSS / WOFF2 / WOFF / TTF",
    status: "Implemented (Verified Locally)",
    description:
      "Production WOFF2, WOFF, and TTF icon fonts, CSS stylesheets, and stable Unicode PUA mappings for Thin, Light, Regular, Bold, and Fill (115 glyphs)."
  },
  {
    id: "flutter",
    name: "Flutter Package",
    packageIdentifier: "slatico_icons",
    ecosystem: "Dart / Flutter",
    status: "Implemented (Verified Locally)",
    description:
      "7-style Flutter package combining 115 tree-shakeable TTF IconData constants (Thin–Fill) with 46 Duotone & Color flutter_svg vector assets."
  },
  {
    id: "android",
    name: "Android Native",
    packageIdentifier: "com.infitus.slatico",
    ecosystem: "Kotlin / Jetpack Compose",
    status: "Implemented (Verified Locally)",
    description:
      "161 native Android VectorDrawable XML resources across all 7 styles with Kotlin @DrawableRes mappings and Jetpack Compose SlaticoIcon."
  },
  {
    id: "swift",
    name: "Swift Package",
    packageIdentifier: "SlaticoIcons",
    ecosystem: "SwiftUI / UIKit / AppKit",
    status: "Implemented (Verified Locally)",
    description:
      "Native Swift Package supporting SwiftUI, UIKit, and AppKit across iOS 15+ and macOS 12+ with 161 vector variants and Duotone/Color support."
  }
] as const;

export const PIPELINE_SUMMARY = {
  masterViewBox: ICON_CATALOG.masterViewBox,
  styleCount: ICON_CATALOG.styles.length,
  tier1FamiliesCount: ICON_CATALOG.totalIcons,
  tier1VariantsCount: ICON_CATALOG.totalVariants
} as const;
