"use client";

import { useState, type ComponentType } from "react";
import { SLATICO_STYLES, SLATICO_STYLE_SPECS, type SlaticoStyle } from "@slatico/core";
import {
  BellIcon,
  CloudCheckIcon,
  CloudIcon,
  CreditCardIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  GearIcon,
  HouseIcon,
  LayoutDashboardIcon,
  LockIcon,
  LockOpenIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PencilIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShieldIcon,
  SlidersHorizontalIcon,
  TrashIcon,
  TrashXIcon,
  TrendUpIcon,
  UserIcon,
  type SlaticoIconProps
} from "@slatico/react";
import { WalletIcon } from "@slatico/react/icons/wallet";

interface Tier1ShowcaseItem {
  readonly name: string;
  readonly label: string;
  readonly importPath: string;
  readonly Component: ComponentType<SlaticoIconProps>;
}

const TIER1_ICONS: readonly Tier1ShowcaseItem[] = [
  { name: "bell", label: "Bell", importPath: "@slatico/react", Component: BellIcon },
  { name: "cloud", label: "Cloud", importPath: "@slatico/react", Component: CloudIcon },
  { name: "cloud-check", label: "Cloud Check", importPath: "@slatico/react", Component: CloudCheckIcon },
  { name: "credit-card", label: "Credit Card", importPath: "@slatico/react", Component: CreditCardIcon },
  { name: "envelope", label: "Envelope", importPath: "@slatico/react", Component: EnvelopeIcon },
  { name: "envelope-open", label: "Envelope Open", importPath: "@slatico/react", Component: EnvelopeOpenIcon },
  { name: "gear", label: "Gear", importPath: "@slatico/react", Component: GearIcon },
  { name: "house", label: "House", importPath: "@slatico/react", Component: HouseIcon },
  { name: "layout-dashboard", label: "Layout Dashboard", importPath: "@slatico/react", Component: LayoutDashboardIcon },
  { name: "lock", label: "Lock", importPath: "@slatico/react", Component: LockIcon },
  { name: "lock-open", label: "Lock Open", importPath: "@slatico/react", Component: LockOpenIcon },
  { name: "magnifying-glass", label: "Magnifying Glass", importPath: "@slatico/react", Component: MagnifyingGlassIcon },
  { name: "minus", label: "Minus", importPath: "@slatico/react", Component: MinusIcon },
  { name: "pencil", label: "Pencil", importPath: "@slatico/react", Component: PencilIcon },
  { name: "plus", label: "Plus", importPath: "@slatico/react", Component: PlusIcon },
  { name: "shield", label: "Shield", importPath: "@slatico/react", Component: ShieldIcon },
  { name: "shield-check", label: "Shield Check", importPath: "@slatico/react", Component: ShieldCheckIcon },
  { name: "sliders-horizontal", label: "Sliders Horizontal", importPath: "@slatico/react", Component: SlidersHorizontalIcon },
  { name: "trash", label: "Trash", importPath: "@slatico/react", Component: TrashIcon },
  { name: "trash-x", label: "Trash X", importPath: "@slatico/react", Component: TrashXIcon },
  { name: "trend-up", label: "Trend Up", importPath: "@slatico/react", Component: TrendUpIcon },
  { name: "user", label: "User", importPath: "@slatico/react", Component: UserIcon },
  { name: "wallet", label: "Wallet", importPath: "@slatico/react/icons/wallet", Component: WalletIcon }
] as const;

const COLOR_PRESETS = [
  { label: "Default", primary: "currentColor", secondary: undefined },
  { label: "Brand Primary", primary: "var(--foreground)", secondary: "var(--primary)" },
  { label: "Indigo + Violet", primary: "#4F46E5", secondary: "#A855F7" },
  { label: "Emerald + Amber", primary: "#059669", secondary: "#F59E0B" },
  { label: "Sky + Rose", primary: "#0284C7", secondary: "#F43F5E" }
] as const;

export function StyleShowcase() {
  const [activeStyle, setActiveStyle] = useState<SlaticoStyle>("regular");
  const [previewSize, setPreviewSize] = useState<number>(28);
  const [colorPresetIndex, setColorPresetIndex] = useState<number>(0);

  const activeSpec = SLATICO_STYLE_SPECS[activeStyle];
  const activeColorPreset = COLOR_PRESETS[colorPresetIndex] ?? COLOR_PRESETS[0];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-6 lg:flex-row lg:items-center dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
              Tier 1 Production Collection (23 Families · 161 Variants)
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Rendered via <code className="font-mono">@slatico/react</code> &amp; subpath imports
            </span>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Interactive Seven-Style Production Preview
          </h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {activeSpec.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {SLATICO_STYLES.map((style) => {
            const spec = SLATICO_STYLE_SPECS[style];
            const isSelected = style === activeStyle;
            return (
              <button
                key={style}
                type="button"
                onClick={() => setActiveStyle(style)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {spec.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex flex-wrap items-center gap-4">
          <span>
            Active Style:{" "}
            <strong className="text-zinc-800 dark:text-zinc-200">{activeSpec.label}</strong>
          </span>
          <span>
            Stroke:{" "}
            <strong className="text-zinc-800 dark:text-zinc-200">
              {activeSpec.strokeWidth ? `${activeSpec.strokeWidth}px` : "Solid / Layered"}
            </strong>
          </span>
          <span>
            Color Mode:{" "}
            <strong className="text-zinc-800 dark:text-zinc-200">
              {activeStyle === "duotone"
                ? "Two-Tone / Layered Opacity"
                : activeSpec.isMonochrome
                  ? "currentColor"
                  : "Multicolor SVG"}
            </strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span>Palette:</span>
            {COLOR_PRESETS.map((preset, idx) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setColorPresetIndex(idx)}
                className={`rounded px-2 py-0.5 text-xs ${
                  colorPresetIndex === idx
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span>Size:</span>
            {[24, 28, 36].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setPreviewSize(sz)}
                className={`rounded px-2 py-0.5 font-mono text-xs ${
                  previewSize === sz
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {sz}px
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {TIER1_ICONS.map(({ name, label, importPath, Component }) => (
          <div
            key={name}
            className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/60"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="block truncate font-mono text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  {name}
                </span>
                <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                  {label} (<code className="font-mono text-[10px]">{importPath}</code>)
                </p>
              </div>
              <span className="shrink-0 rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                tier-1
              </span>
            </div>

            <div className="my-4 flex items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-white py-6 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
              <Component
                variant={activeStyle}
                size={previewSize}
                color={activeColorPreset.primary}
                secondaryColor={activeColorPreset.secondary}
                secondaryOpacity={activeColorPreset.secondary ? 0.35 : undefined}
                title={`${label} ${activeStyle} icon`}
                data-testid={`preview-${name}-${activeStyle}`}
              />
            </div>

            <div className="grid grid-cols-7 gap-1 pt-1">
              {SLATICO_STYLES.map((styleVariant) => {
                const isCurrent = styleVariant === activeStyle;
                return (
                  <button
                    key={styleVariant}
                    type="button"
                    onClick={() => setActiveStyle(styleVariant)}
                    title={`${name} (${styleVariant})`}
                    className={`flex flex-col items-center justify-center rounded-md p-1.5 transition ${
                      isCurrent
                        ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/30 dark:bg-indigo-950/60 dark:text-indigo-300"
                        : "text-zinc-700 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <Component
                      variant={styleVariant}
                      size={18}
                      color={activeColorPreset.primary}
                      secondaryColor={activeColorPreset.secondary}
                      secondaryOpacity={activeColorPreset.secondary ? 0.35 : undefined}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
