import { ShieldCheckIcon } from "@slatico/react";
import { IconFontDemo } from "@/components/icon-font-demo";
import { PlatformIntegrationDemo } from "@/components/platform-integration-demo";
import { StyleShowcase } from "@/components/style-showcase";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  PIPELINE_SUMMARY,
  PLATFORM_ROADMAP,
  SITE_METADATA,
  STYLE_LIST
} from "@/data/site-config";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-zinc-50/85 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
              <ShieldCheckIcon variant="color" size={20} title="Slatico mark" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {SITE_METADATA.brand}
                </span>
                <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-mono text-[11px] font-medium text-indigo-600 dark:text-indigo-300">
                  v0.1.0-alpha
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                by {SITE_METADATA.parentBrand}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href={SITE_METADATA.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 md:py-16">
        {/* Hero */}
        <section className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>{SITE_METADATA.phaseStatus}</span>
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            {SITE_METADATA.tagline}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-400">
            {SITE_METADATA.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-xs font-mono text-zinc-600 dark:text-zinc-400">
            <span className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
              Master ViewBox: {PIPELINE_SUMMARY.masterViewBox}
            </span>
            <span className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
              Tier 1: {PIPELINE_SUMMARY.tier1FamiliesCount} Families ({PIPELINE_SUMMARY.tier1VariantsCount} SVGs)
            </span>
            <span className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
              Styles: {PIPELINE_SUMMARY.styleCount} Official Variants
            </span>
            <span className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
              License: {SITE_METADATA.license}
            </span>
            <span className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
              Scope: {SITE_METADATA.npmScope}
            </span>
          </div>
        </section>

        {/* Interactive Showcase */}
        <section className="mt-12" aria-labelledby="showcase-heading">
          <h2 id="showcase-heading" className="sr-only">
            Interactive Icon Preview
          </h2>
          <StyleShowcase />
        </section>

        {/* Multi-Framework Integration Demo */}
        <section className="mt-10" aria-labelledby="integrations-heading">
          <h2 id="integrations-heading" className="sr-only">
            Multi-Framework Integrations
          </h2>
          <PlatformIntegrationDemo />
        </section>

        {/* Icon Font System Demonstration */}
        <section className="mt-10" aria-labelledby="icon-font-heading">
          <h2 id="icon-font-heading" className="sr-only">
            Icon Font System Demonstration
          </h2>
          <IconFontDemo />
        </section>

        {/* Seven Official Icon Styles Specification */}
        <section className="mt-16" aria-labelledby="styles-heading">
          <div className="max-w-2xl">
            <h2
              id="styles-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
            >
              Seven Official Icon Styles
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Every icon in the Slatico catalog is authored natively across all seven styles on a unified{" "}
              <code className="font-mono">0 0 24 24</code> canvas. No synthetic stroke scaling or fake auto-generated variants.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STYLE_LIST.map((spec, index) => (
              <div
                key={spec.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-zinc-400">
                      0{index + 1} / {spec.id}
                    </span>
                    <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {spec.strokeWidth !== null ? `${spec.strokeWidth}px stroke` : "Vector fill"}
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {spec.label}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {spec.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-[11px] text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
                  <span>{spec.isMonochrome ? "currentColor" : "Multicolor SVG"}</span>
                  <span>{spec.supportsIconFont ? "Font + SVG" : "SVG / Vector Only"}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Multi-Platform Architecture & Status */}
        <section className="mt-16" aria-labelledby="platforms-heading">
          <div className="max-w-2xl">
            <h2
              id="platforms-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
            >
              Platform Architecture & Development Status
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Transparent engineering status across our monorepo packages. No packages are published to npm or native registries during Phase 1.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {PLATFORM_ROADMAP.map((item) => {
              const isImplemented = item.status.startsWith("Implemented");
              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <code className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {item.packageIdentifier}
                      </code>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          isImplemented
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "bg-zinc-200/70 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.name}{" "}
                      <span className="font-normal text-zinc-500 dark:text-zinc-400">
                        ({item.ecosystem})
                      </span>
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-medium text-zinc-800 dark:text-zinc-200">
              {SITE_METADATA.brand} by {SITE_METADATA.parentBrand}
            </p>
            <p className="mt-0.5">
              Released under the {SITE_METADATA.license} License. Tier 1 Production Collection ({PIPELINE_SUMMARY.tier1FamiliesCount} families, {PIPELINE_SUMMARY.tier1VariantsCount} SVG variants).
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={SITE_METADATA.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
