"use client";

import { memo, type MouseEvent } from "react";
import type { SlaticoStyle } from "@slatico/core";
import type { CatalogFamily } from "../../lib/catalog-client";
import { CopyButton } from "../copy-button";
import { iconDetailPath } from "../../lib/icon-slug";
import { useCatalogFamily, useCatalogVariant } from "../../lib/use-catalog";
import { IconSvg } from "../icon-svg";

export interface IconCardDisplay {
  readonly style: SlaticoStyle;
  readonly size: number;
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly secondaryOpacity: number;
}

export interface IconCardProps {
  readonly id: number;
  readonly position: number;
  readonly setSize: number;
  readonly display: IconCardDisplay;
  readonly selected: boolean;
  /** Server-rendered name/category shown until the metadata shard is available. */
  readonly seed?: { readonly name: string; readonly categoryLabel: string };
  /** `drawer`: "Details →" opens the drawer in place; `navigate`: it links to the Explorer. */
  readonly detailsMode: "drawer" | "navigate";
  readonly onOpen: (family: CatalogFamily, trigger: HTMLElement) => void;
  readonly onFocusPosition: (position: number) => void;
}

const cardShellClass =
  "group relative flex min-w-0 flex-col items-center justify-between rounded-[24px] squircle border p-4 transition-all";

function isPlainLeftClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export const IconCard = memo(function IconCard({
  id,
  position,
  setSize,
  display,
  selected,
  seed,
  detailsMode,
  onOpen,
  onFocusPosition
}: IconCardProps) {
  const family = useCatalogFamily(id);
  const asset = useCatalogVariant(id, display.style);
  const name = family?.name ?? seed?.name;
  const categoryLabel = family?.categoryLabel ?? seed?.categoryLabel;

  return (
    <div
      role="listitem"
      aria-posinset={position + 1}
      aria-setsize={setSize}
      onFocus={() => onFocusPosition(position)}
      className={`${cardShellClass} ${
        selected
          ? "border-primary bg-primary-soft/60 ring-2 ring-ring"
          : "border-border bg-surface hover:border-primary/60 hover:bg-surface-elevated hover:shadow-sm"
      }`}
    >
      <button
        type="button"
        data-family-index={id}
        disabled={!family}
        onClick={(event) => family && onOpen(family, event.currentTarget)}
        aria-label={
          family
            ? `${family.name} — ${family.categoryLabel} (${family.pascalName} in ${display.style} style)`
            : "Loading icon"
        }
        className="flex w-full flex-col items-center justify-center py-3 focus:outline-none"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-105">
          {asset ? (
            <IconSvg
              asset={asset}
              style={display.style}
              size={Math.min(48, display.size)}
              color={display.primaryColor}
              secondaryColor={display.secondaryColor}
              secondaryOpacity={display.secondaryOpacity}
              idScope={`grid-${asset.name}-${display.style}`}
            />
          ) : (
            <span
              aria-hidden
              className="block animate-pulse rounded-lg bg-surface-muted"
              style={{ width: Math.min(48, display.size), height: Math.min(48, display.size) }}
            />
          )}
        </div>
        <span className="mt-2.5 max-w-full truncate font-mono text-xs font-medium text-foreground">
          {name ?? <span className="inline-block h-3 w-20 animate-pulse rounded bg-surface-muted align-middle" />}
        </span>
        <span className="mt-0.5 text-[10px] text-muted-foreground">
          {categoryLabel ?? <span className="inline-block h-2.5 w-16 animate-pulse rounded bg-surface-muted align-middle" />}
        </span>
      </button>

      {/* Quick Card Actions */}
      <div className="mt-2 flex w-full items-center justify-between border-t border-border/70 pt-2 text-[11px]">
        <CopyButton
          text={name ?? ""}
          disabled={!name}
          label="Copy name"
          announcement={`Icon name ${name ?? ""} copied to clipboard`}
          showIcon={false}
          stopPropagation
          className="font-medium text-muted-foreground transition-colors hover:text-primary"
          copiedClassName="!text-primary"
        />
        {name ? (
          <a
            href={iconDetailPath(name)}
            onClick={(event) => {
              if (detailsMode === "drawer" && family && isPlainLeftClick(event)) {
                event.preventDefault();
                onOpen(family, event.currentTarget);
              }
            }}
            className="font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Details →
          </a>
        ) : (
          <span className="font-medium text-muted-foreground">Details →</span>
        )}
      </div>
    </div>
  );
});

/** Skeleton card with the same footprint as IconCard (shown while the next page loads). */
export function IconCardPlaceholder() {
  return (
    <div aria-hidden className={`${cardShellClass} border-border bg-surface`}>
      <div className="flex w-full flex-col items-center justify-center py-3">
        <div className="flex h-14 w-14 items-center justify-center">
          <span className="block h-7 w-7 animate-pulse rounded-lg bg-surface-muted" />
        </div>
        <span className="mt-2.5 inline-block h-4 w-20 animate-pulse rounded bg-surface-muted" />
        <span className="mt-0.5 inline-block h-3 w-16 animate-pulse rounded bg-surface-muted" />
      </div>
      <div className="mt-2 flex w-full items-center justify-between border-t border-border/70 pt-2 text-[11px]">
        <span className="inline-block h-3.5 w-14 animate-pulse rounded bg-surface-muted" />
        <span className="inline-block h-3.5 w-12 animate-pulse rounded bg-surface-muted" />
      </div>
    </div>
  );
}
