/**
 * Official seven Slatico icon styles.
 */
export const SLATICO_STYLES = [
  "thin",
  "light",
  "regular",
  "bold",
  "fill",
  "duotone",
  "color"
] as const;

export type SlaticoStyle = (typeof SLATICO_STYLES)[number];

export interface SlaticoStyleSpec {
  readonly id: SlaticoStyle;
  readonly label: string;
  readonly strokeWidth: number | null;
  readonly isMonochrome: boolean;
  readonly supportsIconFont: boolean;
  readonly description: string;
}

export const SLATICO_STYLE_SPECS: Readonly<Record<SlaticoStyle, SlaticoStyleSpec>> = {
  thin: {
    id: "thin",
    label: "Thin",
    strokeWidth: 1,
    isMonochrome: true,
    supportsIconFont: true,
    description: "1px precision hairline stroke for large display and high-DPI interfaces."
  },
  light: {
    id: "light",
    label: "Light",
    strokeWidth: 1.5,
    isMonochrome: true,
    supportsIconFont: true,
    description: "1.5px refined stroke balanced for modern dense application layouts."
  },
  regular: {
    id: "regular",
    label: "Regular",
    strokeWidth: 2,
    isMonochrome: true,
    supportsIconFont: true,
    description: "2px primary default stroke engineered for universal UI legibility."
  },
  bold: {
    id: "bold",
    label: "Bold",
    strokeWidth: 3,
    isMonochrome: true,
    supportsIconFont: true,
    description: "3px heavy stroke for high-contrast emphasis and compact sizes."
  },
  fill: {
    id: "fill",
    label: "Fill",
    strokeWidth: null,
    isMonochrome: true,
    supportsIconFont: true,
    description: "Solid silhouette paths ideal for active states and primary indicators."
  },
  duotone: {
    id: "duotone",
    label: "Duotone",
    strokeWidth: 1.75,
    isMonochrome: false,
    supportsIconFont: false,
    description: "Two-tone layered depth combining primary strokes with distinct secondary tone or opacity fills."
  },
  color: {
    id: "color",
    label: "Color",
    strokeWidth: null,
    isMonochrome: false,
    supportsIconFont: false,
    description: "Multicolor vector artwork preserving rich gradients and distinct semantic hues."
  }
} as const;

export const MASTER_VIEWBOX = "0 0 24 24" as const;

/**
 * Official Slatico catalog collection tiers.
 * Tier 1 is the initial 27-family (189-variant) production collection.
 * Tier 2 and Tier 3 are reserved for subsequent production expansions.
 */
export const SLATICO_TIERS = ["tier-1", "tier-2", "tier-3"] as const;

export type SlaticoTier = (typeof SLATICO_TIERS)[number];

export interface SlaticoIconVariantMetadata {
  readonly style: SlaticoStyle;
  readonly relativePath: string;
  readonly viewBox: string;
  readonly isMonochrome: boolean;
  readonly isDemo: boolean;
}

export interface SlaticoIconEntry {
  readonly name: string;
  readonly pascalName: string;
  readonly tier: SlaticoTier;
  readonly isDemo: boolean;
  readonly styles: Readonly<Record<SlaticoStyle, SlaticoIconVariantMetadata>>;
}

export interface SlaticoCatalog {
  readonly version: string;
  readonly masterViewBox: typeof MASTER_VIEWBOX;
  readonly styles: readonly SlaticoStyle[];
  readonly totalIcons: number;
  readonly totalVariants: number;
  readonly tiers: Readonly<Record<SlaticoTier, readonly string[]>>;
  readonly icons: readonly SlaticoIconEntry[];
}
