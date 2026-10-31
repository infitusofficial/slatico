"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  SLATICO_STYLES,
  SLATICO_STYLE_SPECS,
  type SlaticoStyle
} from "@slatico/core";
import {
  ENRICHED_ICONS,
  filterCatalogIcons,
  getEnrichedIconByName,
  ICON_CATEGORIES,
  type EnrichedCatalogIcon,
  type IconCategoryId
} from "../../lib/catalog";
import { SITE_CONFIG } from "../../config/site";
import { DynamicSlaticoIcon } from "../dynamic-slatico-icon";
import {
  IconDetailPanel,
  type IconCustomizerState
} from "./icon-detail-panel";

export interface IconExplorerProps {
  readonly initialSelectedSlug?: string;
  readonly initialStyle?: SlaticoStyle;
  readonly compactHeader?: boolean;
}

export function IconExplorer({
  initialSelectedSlug,
  initialStyle = "regular",
  compactHeader = false
}: IconExplorerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IconCategoryId>("all");
  const [customizer, setCustomizer] = useState<IconCustomizerState>({
    style: initialStyle,
    size: 28,
    primaryColor: "currentColor",
    secondaryColor: "var(--primary)",
    secondaryOpacity: 0.25,
    previewBg: "checkerboard"
  });
  const [selectedIcon, setSelectedIcon] = useState<EnrichedCatalogIcon | null>(
    () =>
      initialSelectedSlug
        ? (getEnrichedIconByName(initialSelectedSlug) ?? null)
        : null
  );
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Hydrate initial state from URL search params on client mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get("q");
    const styleParam = params.get("style") as SlaticoStyle | null;
    const catParam = params.get("category") as IconCategoryId | null;
    const iconParam = params.get("icon");

    if (qParam) setQuery(qParam);
    if (styleParam && SLATICO_STYLES.includes(styleParam)) {
      setCustomizer((prev) => ({ ...prev, style: styleParam }));
    }
    if (catParam && ICON_CATEGORIES.some((c) => c.id === catParam)) {
      setCategory(catParam);
    }
    if (iconParam) {
      const found = getEnrichedIconByName(iconParam);
      if (found) setSelectedIcon(found);
    }
  }, []);

  // Keyboard shortcut `/` to focus search input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA" &&
        document.activeElement?.tagName !== "SELECT"
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const updateCustomizer = (patch: Partial<IconCustomizerState>) => {
    setCustomizer((prev) => ({ ...prev, ...patch }));
  };

  const filteredIcons = useMemo(
    () => filterCatalogIcons({ query, category }),
    [query, category]
  );

  const handleQuickCopyName = async (
    event: React.MouseEvent,
    slug: string
  ) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(slug);
      setCopiedSlug(slug);
      setTimeout(() => {
        setCopiedSlug((prev) => (prev === slug ? null : prev));
      }, 1500);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <section
      id="icon-explorer"
      aria-label="Interactive Slatico Icon Explorer"
      className="w-full"
    >
      {/* Sticky Filter & Customizer Toolbar */}
      <div className="rounded-[32px] squircle border border-border bg-surface p-4 shadow-xs sm:p-6">
        {!compactHeader && (
          <div className="mb-5 flex flex-col justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">
                Interactive Icon Explorer
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                Click any icon to customize stroke weight, Duotone &amp; Color layers, or export SVG, PNG, WebP, Vector PDF, and 11-platform code.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <span className="rounded-[20px] squircle border border-border bg-surface-muted px-2.5 py-1 font-semibold text-foreground">
                Showing {filteredIcons.length} of {ENRICHED_ICONS.length} families ({filteredIcons.length * 7} variants)
              </span>
            </div>
          </div>
        )}

        {/* Row 1: Search Input + Style Switcher */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground">
              <DynamicSlaticoIcon
                name="magnifying-glass"
                style="regular"
                size={18}
              />
            </span>
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search icons by name, keyword, or category (e.g., bell, security, cloud-check)..."
              aria-label="Search icons by name or keyword"
              className="w-full rounded-[20px] squircle border border-input bg-surface-subtle py-2.5 pr-20 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-surface"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute inset-y-1.5 right-2 rounded-[16px] squircle bg-surface-muted px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            ) : (
              <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:inline-block">
                /
              </kbd>
            )}
          </div>

          {/* 7-Style Segmented Control */}
          <div
            role="group"
            aria-label="Icon style selector"
            className="flex flex-wrap items-center gap-1 rounded-[20px] squircle border border-border bg-surface-muted p-1"
          >
            {SLATICO_STYLES.map((st) => {
              const spec = SLATICO_STYLE_SPECS[st];
              const active = customizer.style === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => updateCustomizer({ style: st })}
                  aria-pressed={active}
                  className={`rounded-[16px] squircle px-2.5 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  {spec.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Category Pills + Live Grid Size & Color Controls */}
        <div className="mt-4 flex flex-col justify-between gap-4 border-t border-border pt-4 xl:flex-row xl:items-center">
          {/* Category Filter Pills */}
          <div
            role="group"
            aria-label="Filter icons by category"
            className="flex flex-wrap items-center gap-1.5"
          >
            {ICON_CATEGORIES.map((cat) => {
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  aria-pressed={active}
                  className={`rounded-[20px] squircle border px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary-soft font-semibold text-primary"
                      : "border-border bg-surface-subtle text-muted-foreground hover:border-border-strong hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Live Grid Size, Color, and Secondary Color Quick Controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2 rounded-[20px] squircle border border-border bg-surface-subtle px-3 py-1.5">
              <label
                htmlFor="explorer-grid-size"
                className="font-medium text-muted-foreground"
              >
                Size:
              </label>
              <input
                id="explorer-grid-size"
                type="range"
                min={16}
                max={48}
                step={4}
                value={Math.min(48, customizer.size)}
                onChange={(e) =>
                  updateCustomizer({ size: Number(e.target.value) })
                }
                className="w-20 accent-primary"
              />
              <span className="w-9 font-mono text-foreground">
                {customizer.size}px
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-[20px] squircle border border-border bg-surface-subtle px-3 py-1.5">
              <label
                htmlFor="explorer-grid-color"
                className="font-medium text-muted-foreground"
              >
                Primary:
              </label>
              <input
                id="explorer-grid-color"
                type="color"
                aria-label="Grid icon primary color"
                value={
                  /^#[0-9A-Fa-f]{6}$/.test(customizer.primaryColor)
                    ? customizer.primaryColor
                    : customizer.style === "color"
                      ? SITE_CONFIG.colors.primary
                      : SITE_CONFIG.colors.dark
                }
                onChange={(e) =>
                  updateCustomizer({ primaryColor: e.target.value })
                }
                className="h-5 w-6 cursor-pointer rounded border border-border bg-surface"
              />
              <span className="font-mono text-[11px] text-muted-foreground">
                {/^#[0-9A-Fa-f]{6}$/.test(customizer.primaryColor)
                  ? customizer.primaryColor.toUpperCase()
                  : customizer.style === "color"
                    ? SITE_CONFIG.colors.primary
                    : SITE_CONFIG.colors.dark}
              </span>
              {customizer.primaryColor !== "currentColor" && (
                <button
                  type="button"
                  onClick={() =>
                    updateCustomizer({ primaryColor: "currentColor" })
                  }
                  className="font-medium text-primary hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {(customizer.style === "duotone" || customizer.style === "color") && (
              <div className="flex items-center gap-2 rounded-[20px] squircle border border-primary-border bg-primary-soft px-3 py-1.5">
                <label
                  htmlFor="explorer-secondary-color"
                  className="font-medium text-primary"
                >
                  Secondary:
                </label>
                <input
                  id="explorer-secondary-color"
                  type="color"
                  aria-label="Secondary layer color"
                  value={
                    /^#[0-9A-Fa-f]{6}$/.test(customizer.secondaryColor)
                      ? customizer.secondaryColor
                      : customizer.style === "color"
                        ? "#000000"
                        : SITE_CONFIG.colors.primary
                  }
                  onChange={(e) =>
                    updateCustomizer({ secondaryColor: e.target.value })
                  }
                  className="h-5 w-6 cursor-pointer rounded border border-border bg-surface"
                />
                <span className="font-mono text-[11px] text-primary">
                  {/^#[0-9A-Fa-f]{6}$/.test(customizer.secondaryColor)
                    ? customizer.secondaryColor.toUpperCase()
                    : customizer.style === "color"
                      ? "#000000"
                      : SITE_CONFIG.colors.primary}
                </span>
                {customizer.secondaryColor !== "var(--primary)" &&
                  customizer.secondaryColor !== "" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateCustomizer({ secondaryColor: "var(--primary)" })
                      }
                      className="font-medium text-primary hover:underline"
                    >
                      Reset
                    </button>
                  )}
                {customizer.style === "duotone" && (
                  <input
                    type="range"
                    aria-label="Duotone secondary opacity"
                    min={0.1}
                    max={0.9}
                    step={0.05}
                    value={customizer.secondaryOpacity}
                    onChange={(e) =>
                      updateCustomizer({
                        secondaryOpacity: Number(e.target.value)
                      })
                    }
                    className="w-16 accent-primary"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Icon Grid or Empty State */}
      {filteredIcons.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-[32px] squircle border border-dashed border-border bg-surface p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-[20px] squircle bg-primary-soft text-primary">
            <DynamicSlaticoIcon
              name="magnifying-glass"
              style="duotone"
              size={26}
            />
          </div>
          <h3 className="mt-4 text-base font-bold text-foreground">
            No matching icons found
          </h3>
          <p className="mt-1 max-w-md text-xs text-muted-foreground sm:text-sm">
            No icon matched <code className="font-mono text-foreground">&quot;{query}&quot;</code> in{" "}
            <span className="font-medium text-foreground">
              {ICON_CATEGORIES.find((c) => c.id === category)?.label}
            </span>
            . Try clearing your filter or searching another keyword.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
            className="mt-4 rounded-[20px] squircle bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Reset search &amp; filters
          </button>
        </div>
      ) : (
        <div
          role="list"
          aria-label="Slatico icon grid"
          className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        >
          {filteredIcons.map((icon) => {
            const isSelected = selectedIcon?.name === icon.name;
            const isCopied = copiedSlug === icon.name;

            return (
              <div
                key={icon.name}
                role="listitem"
                className={`group relative flex min-w-0 flex-col items-center justify-between rounded-[24px] squircle border p-4 transition-all ${
                  isSelected
                    ? "border-primary bg-primary-soft/60 ring-2 ring-ring"
                    : "border-border bg-surface hover:border-primary/60 hover:bg-surface-elevated hover:shadow-sm"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  aria-label={`${icon.name} — ${icon.categoryLabel} (${icon.pascalName} in ${customizer.style} style)`}
                  className="flex w-full flex-col items-center justify-center py-3 focus:outline-none"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-105">
                    <DynamicSlaticoIcon
                      name={icon.name}
                      style={customizer.style}
                      size={Math.min(48, customizer.size)}
                      color={customizer.primaryColor}
                      secondaryColor={customizer.secondaryColor}
                      secondaryOpacity={customizer.secondaryOpacity}
                      idScope={`grid-${icon.name}-${customizer.style}`}
                    />
                  </div>
                  <span className="mt-2.5 max-w-full truncate font-mono text-xs font-medium text-foreground">
                    {icon.name}
                  </span>
                  <span className="mt-0.5 text-[10px] text-muted-foreground">
                    {icon.categoryLabel}
                  </span>
                </button>

                {/* Quick Card Actions */}
                <div className="mt-2 flex w-full items-center justify-between border-t border-border/70 pt-2 text-[11px]">
                  <button
                    type="button"
                    onClick={(e) => handleQuickCopyName(e, icon.name)}
                    className="font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {isCopied ? "Copied!" : "Copy name"}
                  </button>
                  <Link
                    href={`/icons/${icon.name}`}
                    className="font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Icon Detail Drawer / Modal */}
      {selectedIcon && (
        <IconDetailPanel
          icon={selectedIcon}
          customizer={customizer}
          onCustomizerChange={updateCustomizer}
          onClose={() => setSelectedIcon(null)}
          mode="drawer"
        />
      )}
    </section>
  );
}
