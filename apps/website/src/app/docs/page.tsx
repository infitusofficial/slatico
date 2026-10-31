import Link from "next/link";
import type { Metadata } from "next";
import { SITE_CONFIG } from "../../config/site";
import { docsOverviewMetadata } from "../../config/metadata";
import { buildBreadcrumbJsonLd } from "../../lib/structured-data";
import { DocsCodeBlock } from "../../components/docs/docs-code-block";

export const metadata: Metadata = docsOverviewMetadata;

export default function DocsOverviewPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Documentation", path: "/docs" }
  ]);

  return (
    <article className="space-y-10 rounded-[32px] squircle border border-border bg-surface p-6 sm:p-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div>
        <span className="font-mono text-xs font-semibold text-primary uppercase">
          Developer Documentation
        </span>
        <h1 className="mt-1 text-3xl font-bold text-foreground sm:text-4xl">
          Slatico Multi-Platform Architecture &amp; SDK Overview
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Slatico is a deterministic, open-source icon system created by{" "}
          <strong>{SITE_CONFIG.publisher.name}</strong>. From a single canonical set of{" "}
          <strong>{SITE_CONFIG.metrics.totalVariants} hand-crafted 24×24 SVG master files</strong>{" "}
          ({SITE_CONFIG.metrics.totalFamilies} families across 7 architectural styles), our automated compiler pipeline generates type-safe, zero-bloat packages for Web, Cross-Platform Mobile, Android Native, and Apple Native applications.
        </p>
      </div>

      {/* 1. Getting Started & Installation */}
      <section
        id="installation"
        aria-labelledby="package-install-heading"
        className="scroll-mt-28 space-y-4"
      >
        <h2
          id="package-install-heading"
          className="text-xl font-bold text-foreground"
        >
          1. Getting Started &amp; Installation
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Install the official scoped package for your target framework using{" "}
          <code className="font-mono text-primary">npm</code>,{" "}
          <code className="font-mono text-primary">pnpm</code>, or{" "}
          <code className="font-mono text-primary">yarn</code>, or add the native mobile package for Flutter, Android, or Apple Swift:
        </p>
        <DocsCodeBlock
          title="Web & React Native (npm / pnpm / yarn)"
          language="bash"
          code={`# React & Next.js
npm install @slatico/react
pnpm add @slatico/react
yarn add @slatico/react

# Vue 3 & Nuxt
npm install @slatico/vue
pnpm add @slatico/vue
yarn add @slatico/vue

# Vanilla HTML, Custom Elements (<slatico-icon>) & Icon Font
npm install @slatico/svg @slatico/web @slatico/font
pnpm add @slatico/svg @slatico/web @slatico/font
yarn add @slatico/svg @slatico/web @slatico/font

# React Native & Expo
npm install @slatico/react-native react-native-svg
pnpm add @slatico/react-native react-native-svg
yarn add @slatico/react-native react-native-svg`}
        />
        <DocsCodeBlock
          title="Flutter, Android Gradle & Apple SwiftPM"
          language="bash"
          code={`# Flutter (pubspec.yaml / CLI)
flutter pub add slatico_icons

# Android (build.gradle.kts)
implementation("com.infitus.slatico:slatico-android:0.1.0")

# Apple Swift Package Manager (Package.swift local monorepo path or Git release)
.package(path: "../slatico/packages/swift")`}
        />
      </section>

      {/* 2. Seven Official Architectural Styles */}
      <section
        id="seven-styles"
        aria-labelledby="style-matrix-heading"
        className="scroll-mt-28 space-y-3"
      >
        <h2
          id="style-matrix-heading"
          className="text-xl font-bold text-foreground"
        >
          2. Seven Official Architectural Styles
        </h2>
        <p className="text-sm text-muted-foreground">
          Every Slatico icon family ships with all seven styles guaranteed on a unified{" "}
          <code className="font-mono text-primary">24×24</code> optical grid:
        </p>
        <div className="overflow-x-auto rounded-[24px] squircle border border-border">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-border bg-surface-muted text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Style ID</th>
                <th className="px-4 py-3 font-semibold">Stroke / Geometry</th>
                <th className="px-4 py-3 font-semibold">Color Model</th>
                <th className="px-4 py-3 font-semibold">Icon Font</th>
                <th className="px-4 py-3 font-semibold">Engineering Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SITE_CONFIG.styles.map((spec) => (
                <tr key={spec.id} className="bg-surface">
                  <td className="px-4 py-3 font-mono font-semibold text-primary">
                    {spec.id}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {spec.strokeWidth ? `${spec.strokeWidth}px` : "Solid / Layered"}
                  </td>
                  <td className="px-4 py-3">
                    {spec.id === "duotone"
                      ? "Primary + Secondary Tone/Alpha"
                      : spec.isMonochrome
                        ? "Monochrome (currentColor / tint)"
                        : "Primary (#FF6040) + Secondary (#000000) Customizable"}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {spec.supportsIconFont ? "Yes (TTF / WOFF2)" : "SVG / Vector Only"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {spec.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Icon Customization: Primary & Secondary Colors */}
      <section
        id="customization"
        aria-labelledby="customization-heading"
        className="scroll-mt-28 space-y-4"
      >
        <h2
          id="customization-heading"
          className="text-xl font-bold text-foreground"
        >
          3. Icon Customization: Sizing, Primary &amp; Secondary Colors
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Slatico supports three distinct color models across all 8 platform SDKs:
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] squircle border border-border bg-surface-subtle p-4">
            <h3 className="text-sm font-semibold text-foreground">
              Monochrome (<code className="font-mono text-primary">thin</code>–<code className="font-mono text-primary">fill</code>)
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Inherits <code className="font-mono">currentColor</code> on the web or the ambient theme tint on mobile. Pass <code className="font-mono">color</code> to override.
            </p>
          </div>
          <div className="rounded-[24px] squircle border border-border bg-surface-subtle p-4">
            <h3 className="text-sm font-semibold text-foreground">
              Duotone (<code className="font-mono text-primary">duotone</code>)
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Combines a primary foreground layer (<code className="font-mono">color</code>) with an independent secondary depth layer (<code className="font-mono">secondaryColor</code> and <code className="font-mono">secondaryOpacity</code>, default <code className="font-mono">0.2</code>).
            </p>
          </div>
          <div className="rounded-[24px] squircle border border-border bg-surface-subtle p-4">
            <h3 className="text-sm font-semibold text-foreground">
              Dual-Color (<code className="font-mono text-primary">color</code>)
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Authored with Slatico Primary (<code className="font-mono text-primary">#FF6040</code>) and dark structural accents (<code className="font-mono">#000000</code>). Pass <code className="font-mono">color</code> and/or <code className="font-mono">secondaryColor</code> in any SDK to customize either layer dynamically.
            </p>
          </div>
        </div>
        <DocsCodeBlock
          title="Customizing Monochrome, Duotone & Color Icons (@slatico/react)"
          language="tsx"
          code={`import { BellIcon, ShieldCheckDuotoneIcon, WalletColorIcon } from "@slatico/react";

export function CustomizationDemo() {
  return (
    <div className="flex items-center gap-4">
      {/* 1. Monochrome: custom size + primary color */}
      <BellIcon variant="regular" size={24} color="#010520" />

      {/* 2. Duotone: independent primary color, secondaryColor & secondaryOpacity */}
      <ShieldCheckDuotoneIcon
        size={28}
        color="#010520"
        secondaryColor="#FF6040"
        secondaryOpacity={0.25}
      />

      {/* 3. Color: default palette (#FF6040 primary + #000000 secondary) */}
      <WalletColorIcon size={28} />

      {/* 4. Color: customized primary + secondary colors */}
      <WalletColorIcon
        size={28}
        color="#FF6040"
        secondaryColor="#010520"
      />
    </div>
  );
}`}
        />
      </section>

      {/* 4. Accessibility */}
      <section
        id="accessibility"
        aria-labelledby="accessibility-heading"
        className="scroll-mt-28 space-y-3"
      >
        <h2
          id="accessibility-heading"
          className="text-xl font-bold text-foreground"
        >
          4. Accessibility Best Practices
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Every Slatico SDK is engineered to be accessible by default and prevent noisy screen reader announcements:
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Decorative Icons (Default):</strong>{" "}
            When an icon sits beside visible text (such as a button label), omit the label prop. Web packages automatically set{" "}
            <code className="font-mono text-primary">aria-hidden=&quot;true&quot;</code> and{" "}
            <code className="font-mono text-primary">focusable=&quot;false&quot;</code>; Flutter sets{" "}
            <code className="font-mono text-primary">excludeFromSemantics: true</code>; Jetpack Compose passes{" "}
            <code className="font-mono text-primary">contentDescription = null</code>; and SwiftUI applies{" "}
            <code className="font-mono text-primary">.accessibilityHidden(true)</code>.
          </li>
          <li>
            <strong className="text-foreground">Semantic / Standalone Icons:</strong>{" "}
            When an icon conveys meaning without adjacent text, pass{" "}
            <code className="font-mono text-primary">title=&quot;Notifications&quot;</code> (React, Vue, SVG, React Native),{" "}
            <code className="font-mono text-primary">label=&quot;Notifications&quot;</code> (Web Components),{" "}
            <code className="font-mono text-primary">semanticLabel: &apos;Notifications&apos;</code> (Flutter),{" "}
            <code className="font-mono text-primary">contentDescription = &quot;Notifications&quot;</code> (Android), or{" "}
            <code className="font-mono text-primary">accessibilityLabel: &quot;Notifications&quot;</code> (SwiftUI).
          </li>
        </ul>
      </section>

      {/* 5. Import Optimization & Tree Shaking */}
      <section
        id="tree-shaking"
        aria-labelledby="tree-shaking-heading"
        className="scroll-mt-28 space-y-3"
      >
        <h2
          id="tree-shaking-heading"
          className="text-xl font-bold text-foreground"
        >
          5. Import Optimization &amp; Tree Shaking
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          All JavaScript/TypeScript packages (<code className="font-mono text-primary">@slatico/core</code>,{" "}
          <code className="font-mono text-primary">@slatico/svg</code>,{" "}
          <code className="font-mono text-primary">@slatico/react</code>,{" "}
          <code className="font-mono text-primary">@slatico/vue</code>,{" "}
          <code className="font-mono text-primary">@slatico/web</code>, and{" "}
          <code className="font-mono text-primary">@slatico/react-native</code>) declare{" "}
          <code className="font-mono text-primary">&quot;sideEffects&quot;: false</code> and expose dedicated per-icon subpath exports so bundlers like Vite, Next.js (Turbopack / Webpack), Rollup, and Metro only include the exact icons your app renders:
        </p>
        <DocsCodeBlock
          title="Subpath Imports for Maximum Tree Shaking"
          language="tsx"
          code={`// Named barrel import (tree-shaken by ESM bundlers)
import { BellIcon, ShieldCheckDuotoneIcon } from "@slatico/react";

// Direct per-icon subpath import (zero barrel evaluation in dev & prod)
import { BellIcon } from "@slatico/react/icons/bell";
import { ArrowUpRightBoldIcon } from "@slatico/vue/icons/arrow-up-right";
import { bellIconDef } from "@slatico/web/icons/bell";
import { WalletColorIcon } from "@slatico/react-native/icons/wallet";`}
        />
      </section>

      {/* 6. Monorepo Workspace Quickstart */}
      <section
        id="monorepo-quickstart"
        aria-labelledby="monorepo-quickstart-heading"
        className="scroll-mt-28 space-y-3"
      >
        <h2
          id="monorepo-quickstart-heading"
          className="text-xl font-bold text-foreground"
        >
          6. Monorepo Workspace Quickstart
        </h2>
        <p className="text-sm text-muted-foreground">
          Clone the repository to develop locally or consume packages directly from source before public registry publication:
        </p>
        <DocsCodeBlock
          title="Terminal (pnpm workspace)"
          language="bash"
          code={`git clone https://github.com/infitusofficial/slatico.git
cd slatico
pnpm install

# Validate ${SITE_CONFIG.metrics.totalVariants} master SVGs, generate all platform packages, and build:
pnpm icons:validate
pnpm icons:generate
pnpm build:packages`}
        />
      </section>

      {/* 7. Troubleshooting */}
      <section
        id="troubleshooting"
        aria-labelledby="troubleshooting-heading"
        className="scroll-mt-28 space-y-3"
      >
        <h2
          id="troubleshooting-heading"
          className="text-xl font-bold text-foreground"
        >
          7. Troubleshooting &amp; FAQ
        </h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="rounded-[20px] squircle border border-border bg-surface-subtle p-4">
            <h3 className="font-semibold text-foreground">
              Why aren&apos;t Duotone or Color icons included in <code className="font-mono text-primary">@slatico/font</code> or Flutter <code className="font-mono text-primary">IconData</code>?
            </h3>
            <p className="mt-1 text-xs leading-relaxed">
              Standard TrueType/WOFF2 glyph tables only support a single monochrome outline per glyph. Because <code className="font-mono">duotone</code> requires independent dual-layer opacity and <code className="font-mono">color</code> requires multi-tone fills, use <code className="font-mono">@slatico/svg</code>, <code className="font-mono">@slatico/react</code>, <code className="font-mono">@slatico/vue</code>, <code className="font-mono">@slatico/web</code>, or Flutter&apos;s <code className="font-mono">SlaticoIcon</code> widget for Duotone and Color styles.
            </p>
          </div>
          <div className="rounded-[20px] squircle border border-border bg-surface-subtle p-4">
            <h3 className="font-semibold text-foreground">
              My Color icon on Android XML turns solid black or white when placed in an <code className="font-mono text-primary">ImageView</code>.
            </h3>
            <p className="mt-1 text-xs leading-relaxed">
              Remove <code className="font-mono">app:tint</code> from the <code className="font-mono">ImageView</code> when rendering <code className="font-mono">@drawable/slatico_*_color</code> resources so Android preserves the authored <code className="font-mono">#FF6040</code> and <code className="font-mono">#000000</code> vector path fills. To customize both colors dynamically on Android, use the Jetpack Compose <code className="font-mono">SlaticoIcon</code> composable with <code className="font-mono">color</code> and <code className="font-mono">secondaryColor</code>.
            </p>
          </div>
          <div className="rounded-[20px] squircle border border-border bg-surface-subtle p-4">
            <h3 className="font-semibold text-foreground">
              How do I prevent Dark Mode from hiding the dark secondary paths of a <code className="font-mono text-primary">color</code> icon?
            </h3>
            <p className="mt-1 text-xs leading-relaxed">
              In Dark Mode, pass a light secondary color (such as <code className="font-mono">secondaryColor=&quot;#FFFFFF&quot;</code>) or set <code className="font-mono">--slatico-secondary-color: #FFFFFF;</code> inside your <code className="font-mono">.dark</code> CSS scope so the secondary layer contrasts cleanly against dark surfaces while preserving the <code className="font-mono">#FF6040</code> brand primary fill.
            </p>
          </div>
        </div>
      </section>

      {/* 8. License */}
      <section
        id="license"
        aria-labelledby="license-heading"
        className="scroll-mt-28 space-y-2"
      >
        <h2 id="license-heading" className="text-xl font-bold text-foreground">
          8. Open-Source License ({SITE_CONFIG.license})
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          All {SITE_CONFIG.metrics.totalVariants} Slatico icons and all 8 platform SDKs are released under the permissive{" "}
          <Link
            href="/license"
            className="font-semibold text-primary underline underline-offset-4"
          >
            MIT License
          </Link>{" "}
          by {SITE_CONFIG.publisher.name}. You may use, customize, and bundle Slatico in personal and commercial projects without attribution requirements.
        </p>
      </section>

      {/* 9. Platform Guides Directory */}
      <section
        id="platform-guides"
        aria-labelledby="platform-guides-heading"
        className="scroll-mt-28 space-y-4"
      >
        <h2
          id="platform-guides-heading"
          className="text-xl font-bold text-foreground"
        >
          9. Choose Your Platform Integration Guide
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SITE_CONFIG.docsGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={guide.href}
              className="group flex min-w-0 flex-col justify-between rounded-[24px] squircle border border-border bg-surface-subtle p-5 transition-all hover:border-primary hover:bg-surface"
            >
              <div>
                <span className="font-mono text-xs font-semibold text-primary">
                  {guide.packageName}
                </span>
                <h3 className="mt-1.5 text-base font-semibold text-foreground group-hover:text-primary">
                  {guide.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {guide.summary}
                </p>
              </div>
              <span className="mt-4 text-xs font-semibold text-primary">
                Read {guide.shortTitle} guide →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
