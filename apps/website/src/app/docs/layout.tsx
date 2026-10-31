"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_CONFIG } from "../../config/site";

export default function DocsLayout({
  children
}: {
  readonly children: React.ReactNode;
}) {
  const pathname = usePathname() || "/docs";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Pre-Release Monorepo Status Banner */}
      <div className="mb-8 rounded-[24px] squircle border border-primary-border bg-primary-soft px-4 py-3 text-xs leading-relaxed text-foreground">
        <strong className="font-semibold text-primary">
          Monorepo Release Notice ({SITE_CONFIG.releaseStatus.badgeLabel}):
        </strong>{" "}
        {SITE_CONFIG.releaseStatus.notice} Clone{" "}
        <a
          href={SITE_CONFIG.links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono font-semibold text-primary underline underline-offset-4"
        >
          github.com/infitusofficial/slatico
        </a>{" "}
        to consume packages via workspace or local path today.
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sidebar Navigation */}
        <aside className="min-w-0 lg:col-span-3">
          <nav
            aria-label="Documentation guides"
            className="sticky top-24 rounded-[28px] squircle border border-border bg-surface p-4"
          >
            <div className="mb-3 px-2 text-xs font-semibold text-muted-foreground uppercase">
              Getting Started
            </div>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href="/docs"
                  aria-current={pathname === "/docs" ? "page" : undefined}
                  className={`block rounded-[20px] squircle px-3 py-2 font-medium transition-colors ${
                    pathname === "/docs"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                  }`}
                >
                  Overview &amp; Architecture
                </Link>
              </li>
            </ul>

            <div className="mt-5 mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase">
              Platform SDK Guides
            </div>
            <ul className="space-y-1 text-sm">
              {SITE_CONFIG.docsGuides.map((guide) => {
                const active = pathname === guide.href;
                return (
                  <li key={guide.slug}>
                    <Link
                      href={guide.href}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-[20px] squircle px-3 py-2 font-medium transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                      }`}
                    >
                      <span className="block">{guide.shortTitle}</span>
                      <span
                        className={`block truncate font-mono text-[10px] ${
                          active
                            ? "text-primary-foreground/85"
                            : "text-muted-foreground"
                        }`}
                      >
                        {guide.packageName}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Documentation Article */}
        <div className="min-w-0 lg:col-span-9">{children}</div>
      </div>
    </div>
  );
}
