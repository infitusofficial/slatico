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
    <article className="space-y-8 rounded-[32px] squircle border border-border bg-surface p-6 sm:p-10">
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

      {/* Style System Table */}
      <section aria-labelledby="style-matrix-heading" className="space-y-3">
        <h2
          id="style-matrix-heading"
          className="text-xl font-bold text-foreground"
        >
          1. Seven Official Architectural Styles
        </h2>
        <p className="text-sm text-muted-foreground">
          Every Slatico icon family ships with all seven styles guaranteed:
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
                    {spec.supportsIconFont ? "Yes" : "SVG / Vector Only"}
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

      {/* Package Installation Quick Reference */}
      <section aria-labelledby="package-install-heading" className="space-y-3">
        <h2
          id="package-install-heading"
          className="text-xl font-bold text-foreground"
        >
          2. Package Installation Reference
        </h2>
        <p className="text-sm text-muted-foreground">
          Install the official scoped package for your target framework using npm, pnpm, or Yarn:
        </p>
        <DocsCodeBlock
          title="Terminal (npm / pnpm / yarn)"
          language="bash"
          code={`# React & Next.js
npm install @slatico/react

# Vue 3 & Nuxt
npm install @slatico/vue

# Vanilla HTML, Custom Elements & Programmatic SVG
npm install @slatico/web @slatico/svg @slatico/font

# React Native & Expo
npm install @slatico/react-native react-native-svg`}
        />
      </section>

      {/* Monorepo Build & Verification Commands */}
      <section aria-labelledby="monorepo-quickstart-heading" className="space-y-3">
        <h2
          id="monorepo-quickstart-heading"
          className="text-xl font-bold text-foreground"
        >
          3. Monorepo Workspace Quickstart
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

# Validate 161 master SVGs, generate all platform packages, and build:
pnpm icons:validate
pnpm icons:generate
pnpm build:packages`}
        />
      </section>

      {/* Platform Guides Directory */}
      <section aria-labelledby="platform-guides-heading" className="space-y-4">
        <h2
          id="platform-guides-heading"
          className="text-xl font-bold text-foreground"
        >
          4. Choose Your Platform Integration Guide
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
