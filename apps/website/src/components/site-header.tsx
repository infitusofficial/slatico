"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE_CONFIG } from "../config/site";
import { BrandLogo } from "./brand-logo";
import { ThemeToggle } from "./theme-toggle";
import { DynamicSlaticoIcon } from "./dynamic-slatico-icon";

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const isActiveRoute = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo referencing centralized SITE_CONFIG.assets.logo & logoDark */}
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            aria-label={`${SITE_CONFIG.brandName} Home`}
            className="inline-flex shrink-0 items-center gap-2.5 rounded-lg py-1 focus-visible:outline-2"
          >
            <BrandLogo className="h-7 w-auto" />
          </Link>
          <span className="hidden rounded-full border border-primary-border bg-primary-soft px-2.5 py-0.5 font-mono text-[11px] font-semibold text-primary xl:inline-flex">
            v{SITE_CONFIG.version}
          </span>
        </div>

        {/* Desktop Primary Navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-0.5 md:flex lg:gap-1"
        >
          {SITE_CONFIG.mainNav.map((item) => {
            const active = isActiveRoute(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-[20px] squircle px-2.5 py-1.5 text-xs font-medium transition-colors lg:px-3 lg:text-sm ${
                  active
                    ? "bg-primary-soft text-primary font-semibold"
                    : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions: Quick Search Link, Theme Toggle, GitHub, Mobile Menu Button */}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/icons"
            aria-label={`Search ${SITE_CONFIG.metrics.totalVariants} icons in Icon Explorer`}
            className="hidden items-center gap-2 rounded-[20px] squircle border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-2xs transition-colors hover:border-border-strong hover:text-foreground lg:inline-flex"
          >
            <DynamicSlaticoIcon
              name="magnifying-glass"
              style="regular"
              size={14}
            />
            <span>Search {SITE_CONFIG.metrics.totalVariants} icons...</span>
            <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              /
            </kbd>
          </Link>

          <ThemeToggle />

          <a
            href={SITE_CONFIG.links.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub — Slatico Repository"
            className="hidden items-center gap-1.5 rounded-[20px] squircle border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface-muted sm:inline-flex"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
            </svg>
            <span>GitHub</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-primary-nav"
            aria-label={
              mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="inline-flex h-9 w-9 items-center justify-center rounded-[20px] squircle border border-border bg-surface text-foreground md:hidden"
          >
            {mobileMenuOpen ? (
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-primary-nav"
          aria-label="Mobile navigation"
          className="border-t border-border bg-surface px-4 py-4 shadow-lg md:hidden"
        >
          <div className="flex flex-col gap-1">
            {SITE_CONFIG.mainNav.map((item) => {
              const active = isActiveRoute(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                    active
                      ? "bg-primary-soft text-primary font-semibold"
                      : "text-foreground hover:bg-surface-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href={SITE_CONFIG.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-muted px-4 py-2.5 text-sm font-semibold text-foreground"
            >
              <span>View on GitHub</span>
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
