import Link from "next/link";
import { SITE_CONFIG } from "../config/site";
import { BrandLogo } from "./brand-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-subtle">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <Link
              href="/"
              aria-label={`${SITE_CONFIG.brandName} Home`}
              className="inline-flex items-center"
            >
              <BrandLogo className="h-7 w-auto" />
            </Link>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              {SITE_CONFIG.description}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-md border border-border bg-surface px-2 py-1 font-mono font-semibold text-foreground">
                {SITE_CONFIG.license} License
              </span>
              <span className="rounded-md border border-border bg-surface px-2 py-1 font-mono">
                {SITE_CONFIG.metrics.totalFamilies} Families · {SITE_CONFIG.metrics.totalVariants} Variants
              </span>
              <span className="rounded-md border border-border bg-surface px-2 py-1 font-mono">
                24×24 Master Grid
              </span>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            <div>
              <h2 className="text-xs font-semibold text-foreground uppercase">
                Explore
              </h2>
              <ul className="mt-3 space-y-2.5 text-sm">
                <li>
                  <Link
                    href="/icons"
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    Icon Explorer
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    About Slatico
                  </Link>
                </li>
                <li>
                  <Link
                    href="/license"
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    MIT License
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    Contact &amp; Issues
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-foreground uppercase">
                Platform SDKs
              </h2>
              <ul className="mt-3 space-y-2.5 text-sm">
                {SITE_CONFIG.docsGuides.map((guide) => (
                  <li key={guide.slug}>
                    <Link
                      href={guide.href}
                      className="text-muted-foreground transition-colors hover:text-primary"
                    >
                      {guide.shortTitle}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h2 className="text-xs font-semibold text-foreground uppercase">
                Open Source
              </h2>
              <ul className="mt-3 space-y-2.5 text-sm">
                <li>
                  <a
                    href={SITE_CONFIG.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    GitHub Monorepo
                  </a>
                </li>
                <li>
                  <a
                    href={SITE_CONFIG.links.githubIssues}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    Request an Icon
                  </a>
                </li>
                <li>
                  <a
                    href={SITE_CONFIG.links.licenseBlob}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    Source License
                  </a>
                </li>
                <li>
                  <a
                    href="/sitemap.xml"
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    Sitemap XML
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {SITE_CONFIG.publisher.name}. Released under the{" "}
            <Link href="/license" className="font-medium text-foreground underline underline-offset-4 hover:text-primary">
              {SITE_CONFIG.license} License
            </Link>
            .
          </p>
          <p className="max-w-xl text-[11px] text-muted-foreground">
            {SITE_CONFIG.releaseStatus.notice}
          </p>
        </div>
      </div>
    </footer>
  );
}
