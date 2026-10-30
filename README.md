# Slatico

**Slatico by Infitus Creative Studio** — A modern, original, open-source, multi-platform SVG icon system engineered on a unified `24x24` optical grid across **7 official styles**.

- **Brand:** Slatico
- **Parent Brand:** Infitus Creative Studio
- **Repository:** [github.com/infitusofficial/slatico](https://github.com/infitusofficial/slatico)
- **npm Scope:** `@slatico`
- **License:** MIT

---

## Seven Official Icon Styles

Every icon in the Slatico catalog is authored across all seven styles using consistent geometry, safe areas, optical alignment, and kebab-case naming conventions:

| # | Style | Directory | Stroke / Construction | Color Model | Monochrome Icon Font Support |
| :- | :---- | :-------- | :-------------------- | :---------- | :--------------------------- |
| 1 | **Thin** | `icons/thin/` | `1px` stroke | `currentColor` | Yes |
| 2 | **Light** | `icons/light/` | `1.5px` stroke | `currentColor` | Yes |
| 3 | **Regular** | `icons/regular/` | `2px` stroke | `currentColor` | Yes |
| 4 | **Bold** | `icons/bold/` | `3px` stroke | `currentColor` | Yes |
| 5 | **Fill** | `icons/fill/` | Solid silhouette path | `currentColor` | Yes |
| 6 | **Duotone** | `icons/duotone/` | Two-tone layered depth (`1.75px` primary + secondary tone/opacity layer) | `currentColor` + secondary tone (`--slatico-secondary-color` / opacity) | No (SVG / Vector required) |
| 7 | **Color** | `icons/color/` | Multicolor vector design & gradients | Intrinsic SVG colors | No (SVG / Vector required) |

> **Design Note:** Slatico never assumes every SVG style can be converted losslessly into an ordinary single-layer monochrome icon font. `Duotone` and `Color` variants preserve their layered opacity and multicolor vector definitions natively.

---

## Platform Status (Implemented vs. Planned)

No packages have been published to npm or native registries yet. Below is the transparent status of the Phase 1 foundation:

### Implemented in Phase 1, Phase 2A, Phase 2B, Phase 3A & Phase 3B (Built & Verified Locally)

| Target | Package / Location | Status | Description |
| :----- | :----------------- | :----- | :---------- |
| **Core Metadata & Catalog** | `@slatico/core` (`packages/core`) | **Implemented** | Style specifications, naming validators, and generated typed icon catalog. |
| **SVG & Sprites Package** | `@slatico/svg` (`packages/svg`) | **Implemented** | Optimized individual SVG files (`dist/icons/*`), 7 variant SVG sprites (`dist/sprites/*`), stable symbol IDs, and programmatic SVG rendering. |
| **React Components** | `@slatico/react` (`packages/react`) | **Implemented** | Tree-shakeable React components supporting all 7 variants, Duotone props, instance-scoped SVG IDs (`useId`), and subpath imports (`@slatico/react/icons/*`). |
| **Vue 3 Components** | `@slatico/vue` (`packages/vue`) | **Implemented** | Typed Vue 3 components with SSR-safe instance-scoped SVG IDs (`useId`), Duotone props, and subpath imports (`@slatico/vue/icons/*`). |
| **Native Web Components** | `@slatico/web` (`packages/web`) | **Implemented** | Framework-independent `<slatico-icon>` Shadow DOM Custom Element with selective icon registration (`@slatico/web/icons/*`). |
| **React Native Components** | `@slatico/react-native` (`packages/react-native`) | **Implemented** | Native `react-native-svg` components supporting all 7 styles, Duotone props, multicolor gradients, and subpath imports (`@slatico/react-native/icons/*`). |
| **Web Icon Font** | `@slatico/font` (`packages/font`) | **Implemented** | WOFF2, WOFF, and TTF monochrome icon fonts, `slatico.css` / `slatico.min.css`, JSON glyph manifest, and stable Unicode PUA mappings across Thin, Light, Regular, Bold, and Fill (`5 × 23 = 115` glyphs). |
| **Flutter Package** | `slatico_icons` (`packages/flutter`) | **Implemented** | Pub.dev-ready Dart/Flutter package with `115` monochrome `IconData` constants (`SlaticoIcons`), `46` Duotone & Color SVG assets, `SlaticoIcon` widget, `SlaticoIconTheme`, tests, and showcase example app. |
| **Android Native** | `com.infitus.slatico:slatico-android` (`packages/android`) | **Implemented** | Native Android Library (`minSdk = 24`) with `161` `VectorDrawable` XML resources across all 7 styles, Kotlin `@DrawableRes` lookup (`SlaticoDrawables`), Jetpack Compose `SlaticoIcon` with dynamic two-color Duotone support, and sample showcase app. |
| **Technical Website** | `@slatico/website` (`apps/website`) | **Implemented** | Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS v4 technical landing page, live 7-style matrix, `<slatico-icon>` & SVG sprite showcase, and interactive `@slatico/font` showcase. |

### Planned Platforms (Architecture & Interface Contracts Prepared)

| Target | Package / Location | Status | Notes |
| :----- | :----------------- | :----- | :---- |
| **Swift (iOS / macOS)** | `packages/swift` | **Planned** | Native Swift Package directory prepared outside `pnpm-workspace.yaml`. |

---

## Monorepo Architecture

```text
slatico/
├── .github/workflows/       # CI validation workflow (lint, typecheck, test, build)
├── apps/
│   └── website/             # Next.js App Router + Tailwind CSS technical landing page
├── icons/                   # Master authored 24x24 SVG sources (7 required style folders)
│   ├── thin/
│   ├── light/
│   ├── regular/
│   ├── bold/
│   ├── fill/
│   ├── duotone/
│   └── color/
├── packages/
│   ├── core/                # @slatico/core — Types, style specs, utilities, catalog
│   ├── svg/                 # @slatico/svg — Optimized SVG strings & lookup helpers
│   ├── react/               # @slatico/react — Tree-shakeable React icon components
│   ├── vue/                 # @slatico/vue — Typed Vue 3 icon components
│   ├── web/                 # @slatico/web — Shadow DOM <slatico-icon> Web Components
│   ├── font/                # @slatico/font — WOFF2/WOFF/TTF monochrome icon fonts & CSS
│   ├── react-native/        # @slatico/react-native — Native react-native-svg components
│   ├── flutter/             # slatico_icons — Dart/Flutter package (TTF IconData + flutter_svg)
│   ├── android/             # com.infitus.slatico — Android VectorDrawables & Jetpack Compose
│   └── swift/               # Planned Slatico Swift package for iOS/macOS (non-JS)
├── scripts/                 # Node.js + TypeScript SVG validation, codegen, and clean scripts
├── tests/                   # Vitest unit & pipeline verification suite
├── docs/                    # Architecture & SVG authoring documentation
├── .env.example             # Environment variable template
├── eslint.config.mjs        # Flat ESLint configuration
├── package.json             # Private root workspace orchestrator
├── pnpm-workspace.yaml      # pnpm workspace definition (JS/TS packages only)
├── tsconfig.base.json       # Shared strict TypeScript compiler configuration
├── CONTRIBUTING.md          # Contributor workflow & SVG authoring rules
└── LICENSE                  # MIT License
```

---

## Getting Started & Local Development

### Prerequisites

- **Node.js:** `>= 20.0.0` (tested on Node.js v24)
- **pnpm:** `>= 9.0.0` (tested on pnpm v12)
- **Git:** `>= 2.40`

### Installation

```bash
pnpm install
```

### Key Workspace Commands

```bash
# 1. Validate all master SVG files in /icons across all 7 styles
pnpm icons:validate

# 2. Generate the typed catalog (@slatico/core), SVG data (@slatico/svg), and React components (@slatico/react)
pnpm icons:generate

# 3. Run ESLint across the monorepo
pnpm lint

# 4. Run strict TypeScript typechecking across root, packages, and website
pnpm typecheck

# 5. Run unit and pipeline tests with Vitest
pnpm test

# 6. Build all workspace packages
pnpm build:packages

# 7. Build the Next.js technical landing page
pnpm build:website

# 8. Full pipeline: generate icons + build packages + build website
pnpm build

# 9. Start the Next.js website development server locally
pnpm dev:website
```

---

## Tier 1 Production Icon Collection (23 Families · 161 Variants)

Our first production release (**Tier 1**) integrates **23 original icon families**, each crafted across all **7 official styles** (`23 × 7 = 161` production SVG variants):

`bell`, `cloud`, `cloud-check`, `credit-card`, `envelope`, `envelope-open`, `gear`, `house`, `layout-dashboard`, `lock`, `lock-open`, `magnifying-glass`, `minus`, `pencil`, `plus`, `shield`, `shield-check`, `sliders-horizontal`, `trash`, `trash-x`, `trend-up`, `user`, `wallet`.

### Multi-Tier Catalog Architecture (Tier 1 / Tier 2 / Tier 3)

- `@slatico/core` exposes `SLATICO_TIERS` (`["tier-1", "tier-2", "tier-3"]`) and `ICON_CATALOG.tiers`, allowing future **Tier 2** and **Tier 3** icon families to be added into `icons/<style>/` and regenerated without breaking any existing package APIs, subpath imports (`@slatico/<pkg>/icons/<name>`), or sprite symbol IDs (`slatico-<style>-<name>`).
- Internal pipeline demonstration fixtures (`data-demo="true"`) are automatically excluded from production counts and all public package exports (`@slatico/core`, `@slatico/svg`, `@slatico/react`, `@slatico/vue`, `@slatico/web`, `@slatico/react-native`).

---

## Local Usage Example (`@slatico/react` & `@slatico/core`)

Inside workspace applications (such as `apps/website`), generated icons can be imported from `@slatico/react` or via individual icon subpaths:

```tsx
import { BellIcon, ShieldCheckDuotoneIcon } from "@slatico/react";
import { WalletIcon } from "@slatico/react/icons/wallet";

export function Example() {
  return (
    <div>
      {/* Dynamic style variant via the variant prop */}
      <BellIcon variant="regular" size={24} />
      <BellIcon variant="color" size={32} title="Notification Bell" />

      {/* Explicit style-bound component */}
      <ShieldCheckDuotoneIcon size={24} secondaryColor="#FF6040" />

      {/* Direct subpath import for optimal bundling */}
      <WalletIcon variant="bold" size={24} />
    </div>
  );
}
```

---

## SVG Design Guidelines

1. **Master ViewBox:** Every SVG must use `viewBox="0 0 24 24"`.
2. **Complete 7-Style Coverage:** Every icon name must exist in all seven directories (`icons/thin/`, `icons/light/`, `icons/regular/`, `icons/bold/`, `icons/fill/`, `icons/duotone/`, `icons/color/`). The pipeline rejects incomplete icon families and never fabricates missing styles.
3. **Naming Convention:** Lowercase `kebab-case.svg` (e.g., `shield-check.svg`).
4. **Color Rules:**
   - Strict monochrome styles (`thin`, `light`, `regular`, `bold`, `fill`) must use `currentColor` (and `none` where applicable) — hardcoded hex/RGB values are rejected by `pnpm icons:validate`.
   - `duotone` style SVGs must contain at least two layers and preserve secondary tones or opacity layers (`var(--slatico-secondary-color, currentColor)` / `fill-opacity` / secondary hex) without collapsing into a single flat monochrome layer.
   - `color` style SVGs preserve multicolor fills, strokes, and `<linearGradient>` / `<radialGradient>` definitions with icon-scoped IDs (`id="slatico-<icon-name>-..."`).

---

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) and the docs in [`docs/`](./docs/architecture.md) before adding icons or modifying the build pipeline.

---

## License & Credits

- **License:** [MIT](./LICENSE)
- **Crafted by:** **Infitus Creative Studio** ([github.com/infitusofficial](https://github.com/infitusofficial))
