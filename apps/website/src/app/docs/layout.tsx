"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_CONFIG } from "../../config/site";

const CORE_CONCEPT_LINKS = [
  { label: "Installation", href: "/docs#installation" },
  { label: "Seven Icon Styles", href: "/docs#seven-styles" },
  { label: "Customization & Colors", href: "/docs#customization" },
  { label: "Accessibility", href: "/docs#accessibility" },
  { label: "Import Optimization & Tree Shaking", href: "/docs#tree-shaking" },
  { label: "Troubleshooting", href: "/docs#troubleshooting" },
  { label: "License (MIT)", href: "/license" }
] as const;

export default function DocsLayout({
  children
}: {
  readonly children: React.ReactNode;
}) {
  const pathname = usePathname() || "/docs";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Release Status Banner */}
      <div className="mb-8 rounded-[24px] squircle border border-primary-border bg-primary-soft px-4 py-3 text-xs leading-relaxed text-foreground">
        <strong className="font-semibold text-primary">
          {SITE_CONFIG.releaseStatus.badgeLabel}:
        </strong>{" "}
        {SITE_CONFIG.releaseStatus.notice} Registries:{" "}
        {SITE_CONFIG.registries.map((registry, index) => (
          <span key={registry.href}>
            <a
              href={registry.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline underline-offset-4"
            >
              {registry.label}
            </a>
            {index < SITE_CONFIG.registries.length - 1 ? " · " : ". "}
          </span>
        ))}
        Report bugs on{" "}
        <a
          href={SITE_CONFIG.links.githubIssues}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary underline underline-offset-4"
        >
          GitHub Issues
        </a>
        .
      </div>

      {/* Mobile-Friendly Quick Navigation (<lg) */}
      <nav
        aria-label="Mobile documentation navigation"
        className="mb-6 rounded-[24px] squircle border border-border bg-surface p-3.5 lg:hidden"
      >
        <div className="mb-2 text-[11px] font-semibold text-muted-foreground uppercase">
          Documentation Guides
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Link
            href="/docs"
            aria-current={pathname === "/docs" ? "page" : undefined}
            className={`rounded-[14px] squircle px-3 py-1.5 text-xs font-medium transition-colors ${
              pathname === "/docs"
                ? "bg-primary text-primary-foreground font-semibold"
                : "border border-border bg-surface-subtle text-foreground hover:border-primary"
            }`}
          >
            Overview
          </Link>
          {SITE_CONFIG.docsGuides.map((guide) => {
            const active = pathname === guide.href;
            return (
              <Link
                key={guide.slug}
                href={guide.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-[14px] squircle px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "border border-border bg-surface-subtle text-foreground hover:border-primary"
                }`}
              >
                {guide.shortTitle}
              </Link>
            );
          })}
        </div>
        <div className="mt-3 border-t border-border pt-2.5">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {CORE_CONCEPT_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-primary hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden min-w-0 lg:col-span-3 lg:block">
          <nav
            aria-label="Documentation guides"
            className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[28px] squircle border border-border bg-surface p-4"
          >
            <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase">
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
              {CORE_CONCEPT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-[16px] squircle px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
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
