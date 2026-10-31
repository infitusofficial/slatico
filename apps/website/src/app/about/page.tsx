import Link from "next/link";
import type { Metadata } from "next";
import { SITE_CONFIG } from "../../config/site";
import { aboutMetadata } from "../../config/metadata";
import { buildBreadcrumbJsonLd } from "../../lib/structured-data";

export const metadata: Metadata = aboutMetadata;

export default function AboutPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "About", path: "/about" }
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article className="space-y-8 rounded-[32px] squircle border border-border bg-surface p-6 sm:p-10">
        <div>
          <span className="font-mono text-xs font-semibold text-primary uppercase">
            About {SITE_CONFIG.brandName}
          </span>
          <h1 className="mt-1 text-3xl font-bold text-foreground sm:text-4xl">
            Engineered by {SITE_CONFIG.publisher.name} for Universal Visual Consistency
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {SITE_CONFIG.fullName} was created to solve a common design-system challenge: most open-source icon sets force teams to mix incompatible libraries when they need hairline strokes, heavy emphasis, layered duotone depth, or multicolor accents across web and native mobile apps.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] squircle border border-border bg-surface-subtle p-5">
            <h2 className="text-base font-bold text-foreground">
              24×24 Master Optical Grid
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Every icon is authored on a strict 24×24 coordinate system with optical balance across circular, square, and diagonal forms.
            </p>
          </div>
          <div className="rounded-[24px] squircle border border-border bg-surface-subtle p-5">
            <h2 className="text-base font-bold text-foreground">
              7 Synchronized Styles
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Thin (1px), Light (1.5px), Regular (2px), Bold (3px), Fill, Duotone, and Color variants share identical bounding geometry.
            </p>
          </div>
          <div className="rounded-[24px] squircle border border-border bg-surface-subtle p-5">
            <h2 className="text-base font-bold text-foreground">
              Deterministic Codegen
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              A single automated compiler validates all {SITE_CONFIG.metrics.totalVariants} SVG masters and emits React, Vue, Web Components, React Native, Flutter, Android, and Swift packages.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <Link
            href="/icons"
            className="rounded-[20px] squircle bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Browse Icon Catalog
          </Link>
          <Link
            href="/docs"
            className="rounded-[20px] squircle border border-border bg-surface-muted px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-surface"
          >
            Read Documentation
          </Link>
          <a
            href={SITE_CONFIG.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[20px] squircle border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            GitHub Repository →
          </a>
        </div>
      </article>
    </div>
  );
}
