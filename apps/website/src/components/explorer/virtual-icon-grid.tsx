"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** Tailwind grid used by every row: identical to the original explorer grid classes. */
export const ICON_GRID_ROW_CLASS =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";
/** `gap-3` */
const ROW_GAP_PX = 12;
/** Rows kept mounted above and below the viewport. */
const OVERSCAN_ROWS = 3;
/** Start loading the next page this far before the end of the loaded results. */
const LOAD_AHEAD_PX = 900;
const DEFAULT_ROW_HEIGHT_PX = 186;

/** Mirrors the Tailwind breakpoints of ICON_GRID_ROW_CLASS. */
function columnsForWidth(width: number): number {
  if (width >= 1024) return 6;
  if (width >= 768) return 4;
  if (width >= 640) return 3;
  return 2;
}

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface VirtualIconGridProps {
  /** Loaded result ids, in display order. */
  readonly ids: readonly number[];
  readonly hasMore: boolean;
  readonly loading: boolean;
  readonly onLoadMore: () => void;
  readonly renderItem: (id: number, position: number) => ReactNode;
  /** Number of skeleton cards rendered while the next page loads. */
  readonly placeholderCount?: number;
  readonly renderPlaceholder: (key: number) => ReactNode;
  /** Position that must stay mounted (keyboard focus), even outside the viewport. */
  readonly pinnedPosition?: number | null;
  readonly statusText: string;
  readonly loadMoreLabel?: string;
}

/**
 * Window-scrolled, row-virtualized icon grid. Only rows near the viewport are mounted, so the DOM
 * stays bounded no matter how many results are loaded; rows that scroll out are unmounted and
 * re-mounted from the (cached) catalog data when they scroll back in. Row height is measured, the
 * total height is reserved up front, and new results only ever append below, so the scroll
 * position never jumps.
 */
export function VirtualIconGrid({
  ids,
  hasMore,
  loading,
  onLoadMore,
  renderItem,
  placeholderCount = 0,
  renderPlaceholder,
  pinnedPosition = null,
  statusText,
  loadMoreLabel = "Load more icons"
}: VirtualIconGridProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [columns, setColumns] = useState(6);
  const [rowHeight, setRowHeight] = useState(DEFAULT_ROW_HEIGHT_PX);
  const [range, setRange] = useState<{ start: number; end: number }>({ start: 0, end: 7 });

  const stride = rowHeight + ROW_GAP_PX;
  const placeholders = loading && hasMore ? placeholderCount : 0;
  const totalItems = ids.length + placeholders;
  const totalRows = Math.ceil(totalItems / columns);
  const height = totalRows > 0 ? totalRows * stride - ROW_GAP_PX : 0;

  const loadMoreRef = useRef(onLoadMore);
  loadMoreRef.current = onLoadMore;
  const canLoadRef = useRef(false);
  canLoadRef.current = hasMore && !loading;

  const update = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const nextColumns = columnsForWidth(window.innerWidth);
    setColumns((prev) => (prev === nextColumns ? prev : nextColumns));
    const top = container.getBoundingClientRect().top;
    const viewportHeight = window.innerHeight;
    const start = Math.max(0, Math.floor(-top / stride) - OVERSCAN_ROWS);
    const end = Math.max(start, Math.ceil((viewportHeight - top) / stride) + OVERSCAN_ROWS);
    setRange((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
    // Progressive loading: also covers the case where a page did not fill the viewport.
    const bottom = top + container.offsetHeight;
    if (canLoadRef.current && bottom - viewportHeight < LOAD_AHEAD_PX) {
      loadMoreRef.current();
    }
  }, [stride]);

  useIsomorphicLayoutEffect(() => {
    update();
  }, [update, ids.length, columns, loading, hasMore]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [update]);

  // IntersectionObserver sentinel at the end of the grid (primary trigger for loading more).
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && canLoadRef.current) {
          loadMoreRef.current();
        }
      },
      { rootMargin: `0px 0px ${LOAD_AHEAD_PX}px 0px` }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Measure the real row height (depends on breakpoint and font metrics).
  useIsomorphicLayoutEffect(() => {
    const row = measureRef.current;
    if (!row) return;
    const measure = () => {
      const h = row.offsetHeight;
      if (h > 0) setRowHeight((prev) => (Math.abs(prev - h) < 1 ? prev : h));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  });

  const lastRow = totalRows - 1;
  const rows: number[] = [];
  for (let r = range.start; r <= Math.min(range.end, lastRow); r++) rows.push(r);
  if (pinnedPosition !== null && pinnedPosition < ids.length) {
    const pinnedRow = Math.floor(pinnedPosition / columns);
    if (!rows.includes(pinnedRow)) rows.push(pinnedRow);
  }
  const measureRow = rows[0];

  return (
    <>
      <div
        ref={containerRef}
        role="list"
        aria-label="Slatico icon grid"
        aria-busy={loading}
        className="relative mt-6"
        style={{ height }}
      >
        {rows.map((row) => {
          const startPos = row * columns;
          const cells: ReactNode[] = [];
          for (let pos = startPos; pos < Math.min(startPos + columns, totalItems); pos++) {
            cells.push(pos < ids.length ? renderItem(ids[pos]!, pos) : renderPlaceholder(pos));
          }
          return (
            <div
              key={row}
              ref={row === measureRow ? measureRef : undefined}
              role="none"
              className={`${ICON_GRID_ROW_CLASS} absolute inset-x-0`}
              style={{ top: row * stride }}
            >
              {cells}
            </div>
          );
        })}
      </div>
      <div ref={sentinelRef} aria-hidden className="h-px w-full" />
      <p className="sr-only" role="status" aria-live="polite">
        {statusText}
      </p>
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loading}
            className="rounded-[20px] squircle border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-surface-muted disabled:opacity-60"
          >
            {loading ? "Loading more icons…" : loadMoreLabel}
          </button>
        </div>
      )}
    </>
  );
}
