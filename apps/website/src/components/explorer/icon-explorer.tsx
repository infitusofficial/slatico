"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SLATICO_STYLES,
  SLATICO_STYLE_SPECS,
  type SlaticoStyle
} from "@slatico/core";
import {
  ICON_CATEGORIES,
  type IconCategoryId
} from "../../data/icon-taxonomy";
import { CATALOG_SUMMARY } from "../../generated/catalog-summary";
import {
  getCatalogClient,
  type CatalogFamily,
  type ResultCursor
} from "../../lib/catalog-client";
import type { ExplorerSeedFamily } from "../../lib/catalog-seed";
import {
  ICONS_BASE_PATH,
  iconDetailPath,
  normalizeIconSlug,
  parseIconPathname
} from "../../lib/icon-slug";
import { SITE_CONFIG } from "../../config/site";
import {
  getColorVariantDefaultSecondaryHex,
  useResolvedDarkTheme
} from "../../lib/theme-color-defaults";
import { SiteIcon } from "../site-icon";
import { IconCard, IconCardPlaceholder, type IconCardDisplay } from "./icon-card";
import type { IconCustomizerState } from "./icon-detail-panel";
import { VirtualIconGrid } from "./virtual-icon-grid";

// The drawer (customizer, exporters, 11 code generators) loads on first open.
const IconDetailPanel = dynamic(
  () => import("./icon-detail-panel").then((mod) => mod.IconDetailPanel),
  { ssr: false }
);

/** Families requested per progressive-loading step. */
const PAGE_SIZE = 96;
const SCROLL_STATE_KEY = "slatico-explorer-scroll";

export interface IconExplorerProps {
  readonly initialStyle?: SlaticoStyle;
  readonly compactHeader?: boolean;
  /**
   * `path` (Icon Explorer page): the drawer is reflected in the URL as /icons/<slug>.
   * `none` (homepage): the drawer opens in place and the URL never changes.
   */
  readonly routing?: "path" | "none";
  /** First families in catalog order, server-rendered for an instant, crawlable first paint. */
  readonly seed?: readonly ExplorerSeedFamily[];
}

interface ResultState {
  readonly ids: readonly number[];
  readonly done: boolean;
  readonly total: number | null;
}

interface SavedScroll {
  readonly path: string;
  readonly count: number;
  readonly scrollY: number;
}

function readSavedScroll(): SavedScroll | null {
  try {
    const raw = window.sessionStorage.getItem(SCROLL_STATE_KEY);
    return raw ? (JSON.parse(raw) as SavedScroll) : null;
  } catch {
    return null;
  }
}

function writeSavedScroll(value: SavedScroll | null): void {
  try {
    if (value) window.sessionStorage.setItem(SCROLL_STATE_KEY, JSON.stringify(value));
    else window.sessionStorage.removeItem(SCROLL_STATE_KEY);
  } catch {
    // Storage unavailable (private mode, blocked): scroll restoration is a convenience only.
  }
}

export function IconExplorer({
  initialStyle = "regular",
  compactHeader = false,
  routing = "none",
  seed = []
}: IconExplorerProps) {
  const client = getCatalogClient();
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
  const [selectedIcon, setSelectedIcon] = useState<CatalogFamily | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [results, setResults] = useState<ResultState>(() => ({
    ids: seed.map((_, i) => i),
    done: false,
    total: null
  }));
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [focusedPosition, setFocusedPosition] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const cursorRef = useRef<ResultCursor | null>(null);
  const generationRef = useRef(0);
  const loadingRef = useRef(false);
  const restoreRef = useRef<SavedScroll | null>(null);
  const resultsCountRef = useRef(0);
  const openerRef = useRef<HTMLElement | null>(null);
  const pushedEntryRef = useRef(false);
  const isDarkTheme = useResolvedDarkTheme();
  const defaultColorSecondary = getColorVariantDefaultSecondaryHex(isDarkTheme);
  const isDefaultView = query === "" && category === "all";
  resultsCountRef.current = results.ids.length;

  // ---- Result stream -------------------------------------------------------------------

  const loadMore = useCallback(async () => {
    const cursor = cursorRef.current;
    if (!cursor || cursor.done || loadingRef.current) return;
    const generation = generationRef.current;
    loadingRef.current = true;
    setLoading(true);
    try {
      const more = await cursor.next(PAGE_SIZE);
      if (generation !== generationRef.current) return;
      setLoadError(false);
      setResults((prev) => ({
        ids: [...prev.ids, ...more],
        done: cursor.done,
        total: cursor.knownTotal
      }));
    } catch {
      if (generation === generationRef.current) setLoadError(true);
    } finally {
      if (generation === generationRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, []);

  // Scroll restoration state must be read before the first page is requested.
  const listPath = routing === "path" ? ICONS_BASE_PATH : "/";
  if (typeof window !== "undefined" && restoreRef.current === null && generationRef.current === 0) {
    const saved = readSavedScroll();
    if (saved && saved.path === listPath) restoreRef.current = saved;
  }

  // (Re)start the stream whenever the query or category changes. The previous results stay on
  // screen until the first page of the new results is ready, so the grid never flashes empty.
  useEffect(() => {
    const generation = ++generationRef.current;
    const cursor = client.createCursor({ query, category });
    cursorRef.current = cursor;
    loadingRef.current = true;
    setLoading(true);
    const restore = restoreRef.current;
    cursor.next(restore ? Math.max(PAGE_SIZE, restore.count) : PAGE_SIZE).then(
      (first) => {
        if (generation !== generationRef.current) return;
        setLoadError(false);
        setResults({ ids: first, done: cursor.done, total: cursor.knownTotal });
        loadingRef.current = false;
        setLoading(false);
      },
      () => {
        if (generation !== generationRef.current) return;
        setLoadError(true);
        loadingRef.current = false;
        setLoading(false);
      }
    );
  }, [client, query, category]);

  // Remember how far the listing was scrolled when leaving the page; restore it on Back.
  useEffect(() => {
    return () => {
      writeSavedScroll({
        path: listPath,
        count: resultsCountRef.current,
        scrollY: window.scrollY
      });
    };
  }, [listPath]);
  useEffect(() => {
    const restore = restoreRef.current;
    // Wait for real cursor results (the server-rendered seed does not count).
    if (!restore || loading || (results.total === null && !results.done)) return;
    restoreRef.current = null;
    writeSavedScroll(null);
    if (!isDefaultView) return;
    requestAnimationFrame(() => window.scrollTo(0, restore.scrollY));
  }, [results, loading, isDefaultView]);

  // ---- Drawer + URL ----------------------------------------------------------------------

  const openFromSlug = useCallback(
    async (rawSlug: string, source: "path" | "query") => {
      const slug = normalizeIconSlug(rawSlug);
      const family = slug ? await client.findFamilyByName(slug).catch(() => null) : null;
      if (!family) {
        setNotice(
          slug
            ? `No icon named “${slug}” exists in the Slatico catalog. Showing all icons instead.`
            : "That icon link is not valid. Showing all icons instead."
        );
        if (routing === "path" && window.location.pathname !== ICONS_BASE_PATH) {
          window.history.replaceState(window.history.state, "", ICONS_BASE_PATH + window.location.search);
        }
        setSelectedIcon(null);
        return;
      }
      setNotice(null);
      if (routing === "path") {
        const search = new URLSearchParams(window.location.search);
        if (source === "query") search.delete("icon");
        const qs = search.toString();
        const target = iconDetailPath(family.name) + (qs ? `?${qs}` : "");
        if (window.location.pathname + window.location.search !== target) {
          window.history.replaceState(window.history.state, "", target);
        }
      }
      setSelectedIcon(family);
    },
    [client, routing]
  );

  // Initial URL state: /icons/<slug>, legacy ?icon=<slug>, and ?q / ?style / ?category.
  useEffect(() => {
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

    if (routing === "path") {
      const parsed = parseIconPathname(window.location.pathname);
      if (parsed.kind === "valid") {
        void openFromSlug(parsed.slug, "path");
        return;
      }
      if (parsed.kind === "invalid") {
        void openFromSlug("", "path");
        return;
      }
    }
    if (iconParam) void openFromSlug(iconParam, "query");
  }, [routing, openFromSlug]);

  // Back / Forward: the URL is the source of truth for which icon is open.
  useEffect(() => {
    if (routing !== "path") return;
    const onPopState = () => {
      const parsed = parseIconPathname(window.location.pathname);
      if (parsed.kind === "valid") {
        void openFromSlug(parsed.slug, "path");
      } else {
        pushedEntryRef.current = false;
        setSelectedIcon(null);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [routing, openFromSlug]);

  const openFamily = useCallback(
    (family: CatalogFamily, trigger: HTMLElement) => {
      openerRef.current = trigger;
      setNotice(null);
      if (routing === "path" && window.location.pathname !== iconDetailPath(family.name)) {
        window.history.pushState(
          window.history.state,
          "",
          iconDetailPath(family.name) + window.location.search
        );
        pushedEntryRef.current = true;
      }
      setSelectedIcon(family);
    },
    [routing]
  );

  const closeDrawer = useCallback(() => {
    if (routing === "path") {
      if (pushedEntryRef.current) {
        // Opened from the grid: step back so Back/Forward stay in sync with the drawer.
        pushedEntryRef.current = false;
        window.history.back();
      } else if (window.location.pathname !== ICONS_BASE_PATH) {
        // Landed directly on /icons/<slug>: replace, so closing never leaves the site.
        window.history.replaceState(
          window.history.state,
          "",
          ICONS_BASE_PATH + window.location.search
        );
      }
    }
    setSelectedIcon(null);
  }, [routing]);

  // Return keyboard focus to the card that opened the drawer.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (selectedIcon) {
      wasOpenRef.current = true;
      return;
    }
    if (!wasOpenRef.current) return;
    wasOpenRef.current = false;
    const opener = openerRef.current;
    requestAnimationFrame(() => {
      if (opener?.isConnected) opener.focus();
    });
  }, [selectedIcon]);

  // ---- UI helpers ------------------------------------------------------------------------

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

  const updateCustomizer = useCallback((patch: Partial<IconCustomizerState>) => {
    setCustomizer((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleQuickCopyName = useCallback(async (event: React.MouseEvent, slug: string) => {
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
  }, []);

  const display = useMemo<IconCardDisplay>(
    () => ({
      style: customizer.style,
      size: customizer.size,
      primaryColor: customizer.primaryColor,
      secondaryColor: customizer.secondaryColor,
      secondaryOpacity: customizer.secondaryOpacity
    }),
    [
      customizer.style,
      customizer.size,
      customizer.primaryColor,
      customizer.secondaryColor,
      customizer.secondaryOpacity
    ]
  );

  const shownCount = results.ids.length;
  const knownTotal = results.total ?? (results.done ? shownCount : null);
  const formatCount = (n: number) => n.toLocaleString("en-US");
  const matchLabel = knownTotal !== null ? formatCount(knownTotal) : `${formatCount(shownCount)}+`;
  const variantLabel =
    knownTotal !== null
      ? formatCount(knownTotal * CATALOG_SUMMARY.styleCount)
      : `${formatCount(shownCount * CATALOG_SUMMARY.styleCount)}+`;
  const hasMore = !results.done;
  const isEmpty = results.done && shownCount === 0 && !loading;
  // Seed rows are positions 0..n of the default (unfiltered) listing.
  const seedActive = isDefaultView;
  const statusText = loading
    ? "Loading icons…"
    : `Showing ${formatCount(shownCount)} of ${matchLabel} icon families${hasMore ? ". Scroll or use Load more icons to see more." : "."}`;

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
                Showing {matchLabel} of {formatCount(CATALOG_SUMMARY.totalFamilies)} families ({variantLabel} variants)
              </span>
            </div>
          </div>
        )}

        {/* Row 1: Search Input + Style Switcher */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground">
              <SiteIcon icon="magnifying-glass:regular" size={18} />
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
                        ? defaultColorSecondary
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
                      ? defaultColorSecondary
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

      {notice && (
        <p
          role="status"
          className="mt-4 rounded-[20px] squircle border border-primary-border bg-primary-soft px-4 py-2.5 text-xs font-medium text-primary"
        >
          {notice}
        </p>
      )}

      {/* Icon Grid or Empty State */}
      {isEmpty ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-[32px] squircle border border-dashed border-border bg-surface p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-[20px] squircle bg-primary-soft text-primary">
            <SiteIcon icon="magnifying-glass:duotone" size={26} />
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
        <VirtualIconGrid
          ids={results.ids}
          hasMore={hasMore}
          loading={loading}
          onLoadMore={() => void loadMore()}
          pinnedPosition={focusedPosition}
          statusText={statusText}
          placeholderCount={shownCount === 0 ? 12 : 6}
          renderPlaceholder={(key) => <IconCardPlaceholder key={`placeholder-${key}`} />}
          renderItem={(id, position) => (
            <IconCard
              key={id}
              id={id}
              position={position}
              setSize={knownTotal ?? -1}
              display={display}
              selected={selectedIcon?.index === id}
              copied={copiedSlug !== null && copiedSlug === client.peekFamily(id)?.name}
              seed={seedActive ? seed[id] : undefined}
              detailsMode={routing === "path" ? "drawer" : "navigate"}
              onOpen={openFamily}
              onCopyName={handleQuickCopyName}
              onFocusPosition={setFocusedPosition}
            />
          )}
        />
      )}

      {loadError && (
        <p role="alert" className="mt-4 text-center text-xs text-muted-foreground">
          Icons could not be loaded. Check your connection and{" "}
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
            onClick={() => {
              setLoadError(false);
              void loadMore();
            }}
          >
            try again
          </button>
          .
        </p>
      )}

      {/* Interactive Icon Detail Drawer / Modal */}
      {selectedIcon && (
        <IconDetailPanel
          icon={selectedIcon}
          customizer={customizer}
          onCustomizerChange={updateCustomizer}
          onClose={closeDrawer}
          mode="drawer"
          linkMode={routing === "path" ? "copy-link" : "open-in-explorer"}
        />
      )}
    </section>
  );
}
