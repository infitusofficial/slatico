import Link from "next/link";
import type { Metadata } from "next";
import { SITE_CONFIG } from "../config/site";
import { homeMetadata } from "../config/metadata";
import { DynamicSlaticoIcon } from "../components/dynamic-slatico-icon";
import { IconExplorer } from "../components/explorer/icon-explorer";
import { getExplorerSeed, preloadExplorerCatalog } from "../lib/catalog-seed";
import { IconFontDemo } from "../components/icon-font-demo";
import { PlatformIntegrationDemo } from "../components/platform-integration-demo";
import { getSpriteSymbolId, getSvgSprite, renderSvgMarkup } from "@slatico/svg";

export const metadata: Metadata = homeMetadata;

/** `@slatico/svg` output for the platform demo, rendered at build time (see PlatformIntegrationDemo). */
function getPlatformDemoMarkup() {
  const bellSymbolId = getSpriteSymbolId("bell", "duotone");
  const fullSprite = getSvgSprite("duotone");
  const start = fullSprite.indexOf(`<symbol id="${bellSymbolId}"`);
  const end = start >= 0 ? fullSprite.indexOf("</symbol>", start) : -1;
  const symbol = end >= 0 ? fullSprite.slice(start, end + "</symbol>".length) : null;
  if (!symbol) throw new Error(`Sprite symbol ${bellSymbolId} not found.`);
  return {
    bellSymbolId,
    duotoneSprite: fullSprite.replace(/(<svg[^>]*>)[\s\S]*(<\/svg>)\s*$/, `$1${symbol}$2`),
    programmaticSvg: renderSvgMarkup("wallet", "color", {
      size: 28,
      title: "Programmatic Wallet SVG",
      idPrefix: "site-demo"
    })
  };
}

export default function HomePage() {
  preloadExplorerCatalog();
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[52px] squircle border border-border bg-surface p-6 shadow-xs sm:p-10 lg:p-14">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-border bg-primary-soft px-3 py-1 font-mono text-xs font-semibold text-primary">
            <span>{SITE_CONFIG.releaseStatus.badgeLabel}</span>
          </span>
          <span className="rounded-full border border-border bg-surface-muted px-3 py-1 font-mono text-xs text-muted-foreground">
            {SITE_CONFIG.metrics.totalFamilies} Families ·{" "}
            {SITE_CONFIG.metrics.totalVariants} Production Variants
          </span>
          <span className="rounded-full border border-border bg-surface-muted px-3 py-1 font-mono text-xs text-muted-foreground">
            {SITE_CONFIG.license} Licensed
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          <div className="min-w-0 lg:col-span-8">
            <h1 className="text-3xl font-bold text-foreground sm:text-5xl lg:leading-[1.12]">
              Precision-engineered icons for{" "}
              <span className="text-primary">every modern runtime</span>.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {SITE_CONFIG.description}
            </p>

            {/* Primary CTAs */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/icons"
                className="inline-flex items-center gap-2 rounded-[32px] squircle bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary-hover"
              >
                <DynamicSlaticoIcon
                  name="magnifying-glass"
                  style="bold"
                  size={16}
                />
                <span>Explore All {SITE_CONFIG.metrics.totalVariants} Icons</span>
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-[32px] squircle border border-border bg-surface-muted px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-border-strong hover:bg-surface"
              >
                <span>Developer Documentation</span>
              </Link>
              <a
                href={SITE_CONFIG.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[32px] squircle border border-border bg-surface px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <span>GitHub Monorepo →</span>
              </a>
            </div>
          </div>

          {/* Architectural Metrics Card */}
          <div className="grid min-w-0 grid-cols-2 gap-3 lg:col-span-4">
            <div className="rounded-[24px] squircle border border-border bg-surface-subtle p-4">
              <span className="font-mono text-2xl font-bold text-primary sm:text-3xl">
                {SITE_CONFIG.metrics.totalVariants}
              </span>
              <p className="mt-1 text-xs font-semibold text-foreground">
                Production Vectors
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Zero demo placeholders
              </p>
            </div>
            <div className="rounded-[24px] squircle border border-border bg-surface-subtle p-4">
              <span className="font-mono text-2xl font-bold text-foreground sm:text-3xl">
                {SITE_CONFIG.metrics.totalStyles}
              </span>
              <p className="mt-1 text-xs font-semibold text-foreground">
                Architectural Styles
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Thin to Multicolor
              </p>
            </div>
            <div className="rounded-[24px] squircle border border-border bg-surface-subtle p-4">
              <span className="font-mono text-2xl font-bold text-foreground sm:text-3xl">
                11
              </span>
              <p className="mt-1 text-xs font-semibold text-foreground">
                Code Targets
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Web, Mobile &amp; Native
              </p>
            </div>
            <div className="rounded-[24px] squircle border border-border bg-surface-subtle p-4">
              <span className="font-mono text-2xl font-bold text-foreground sm:text-3xl">
                24×24
              </span>
              <p className="mt-1 text-xs font-semibold text-foreground">
                Optical Grid
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Pixel-aligned geometry
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Icon Explorer Section */}
      <div className="mt-10">
        <IconExplorer routing="none" seed={getExplorerSeed()} />
      </div>

      {/* 7 Official Architectural Styles Matrix */}
      <section aria-labelledby="styles-heading" className="mt-16">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="font-mono text-xs font-semibold text-primary uppercase">
              Unified Multi-Style System
            </span>
            <h2
              id="styles-heading"
              className="mt-1 text-2xl font-bold text-foreground"
            >
              Seven Synchronized Architectural Styles
            </h2>
          </div>
          <Link
            href="/icons"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Compare all styles in full explorer →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
          {SITE_CONFIG.styles.map((styleSpec) => (
            <div
              key={styleSpec.id}
              className="flex min-w-0 flex-col justify-between rounded-[24px] squircle border border-border bg-surface p-4 shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">
                    {styleSpec.label}
                  </span>
                  <span className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {styleSpec.strokeWidth
                      ? `${styleSpec.strokeWidth}px`
                      : "Layered"}
                  </span>
                </div>
                <div className="my-5 flex items-center justify-center gap-3 rounded-[20px] squircle border border-border bg-surface-subtle py-4 text-foreground">
                  <DynamicSlaticoIcon
                    name="shield-check"
                    style={styleSpec.id}
                    size={26}
                    secondaryColor="var(--primary)"
                    secondaryOpacity={0.28}
                    idScope={`home-style-shield-${styleSpec.id}`}
                  />
                  <DynamicSlaticoIcon
                    name="bell"
                    style={styleSpec.id}
                    size={26}
                    secondaryColor="var(--primary)"
                    secondaryOpacity={0.28}
                    idScope={`home-style-bell-${styleSpec.id}`}
                  />
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {styleSpec.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Documentation Guides Grid */}
      <section aria-labelledby="platforms-heading" className="mt-16">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="font-mono text-xs font-semibold text-primary uppercase">
              First-Class Native &amp; Web Packages
            </span>
            <h2
              id="platforms-heading"
              className="mt-1 text-2xl font-bold text-foreground"
            >
              Engineered for Web, Cross-Platform, Android &amp; Apple
            </h2>
          </div>
          <Link
            href="/docs"
            className="text-xs font-semibold text-primary hover:underline"
          >
            View all documentation guides →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SITE_CONFIG.docsGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={guide.href}
              className="group flex min-w-0 flex-col justify-between rounded-[28px] squircle border border-border bg-surface p-5 transition-all hover:border-primary/60 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-primary">
                    {guide.packageName}
                  </span>
                  <span className="text-xs text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary">
                    Guide →
                  </span>
                </div>
                <h3 className="mt-2 text-base font-semibold text-foreground">
                  {guide.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {guide.summary}
                </p>
              </div>
              <div className="mt-4 border-t border-border pt-3 font-mono text-[11px] text-muted-foreground">
                {guide.ecosystem}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Live Web Component, Sprite & Webfont Demonstrations */}
      <section aria-labelledby="live-runtime-heading" className="mt-16 space-y-8">
        <div>
          <span className="font-mono text-xs font-semibold text-primary uppercase">
            Browser Runtime Verification
          </span>
          <h2
            id="live-runtime-heading"
            className="mt-1 text-2xl font-bold text-foreground"
          >
            Live Web Components, SVG Sprites &amp; Webfonts
          </h2>
        </div>
        <PlatformIntegrationDemo {...getPlatformDemoMarkup()} />
        <IconFontDemo />
      </section>
    </div>
  );
}
