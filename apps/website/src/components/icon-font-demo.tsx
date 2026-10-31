"use client";

import { useState } from "react";
import { ICON_NAMES, type SlaticoIconName } from "@slatico/core";
import {
  FONT_COMPATIBLE_STYLES,
  FONT_FAMILIES,
  getFontGlyph,
  getFontHtmlSnippet,
  type SlaticoFontCompatibleStyle
} from "@slatico/font";

const FONT_SIZE_PRESETS = [16, 24, 32, 48] as const;

const FONT_COLOR_PRESETS = [
  { label: "Current", value: "currentColor" },
  { label: "Indigo", value: "#4F46E5" },
  { label: "Emerald", value: "#10B981" },
  { label: "Amber", value: "#F59E0B" },
  { label: "Rose", value: "#F43F5E" }
] as const;

const FEATURED_FONT_ICONS: readonly SlaticoIconName[] = [
  "house",
  "bell",
  "user",
  "shield-check",
  "wallet",
  "lock",
  "credit-card",
  "gear",
  "trash",
  "pencil",
  "cloud-check",
  "sliders-horizontal"
];

export function IconFontDemo() {
  const [selectedStyle, setSelectedStyle] =
    useState<SlaticoFontCompatibleStyle>("regular");
  const [selectedIcon, setSelectedIcon] = useState<SlaticoIconName>("house");
  const [fontSize, setFontSize] = useState<number>(24);
  const [fontColor, setFontColor] = useState<string>("currentColor");

  const activeGlyph = getFontGlyph(selectedIcon, selectedStyle);

  const htmlUsageSnippet = `<link rel="stylesheet" href="slatico.css">

<!-- Selected Icon (${selectedIcon} • ${selectedStyle} • ${activeGlyph.codepointHex}) -->
${getFontHtmlSnippet(selectedIcon, selectedStyle)}

<!-- Examples across styles -->
<i class="slatico slatico-house-regular" aria-hidden="true"></i>
<i class="slatico slatico-bell-bold" aria-hidden="true"></i>
<i class="slatico slatico-user-fill" aria-hidden="true"></i>`;

  const cssUsageSnippet = `/* Customize via standard CSS typography properties */
.custom-icon {
  font-size: ${fontSize}px;
  color: ${fontColor === "currentColor" ? "#4F46E5" : fontColor};
  line-height: 1;
  vertical-align: -0.125em;
}`;

  return (
    <div className="min-w-0 max-w-full rounded-[32px] squircle border border-border bg-surface p-4 shadow-xs sm:p-6">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-primary-soft px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
              @slatico/font
            </span>
            <span className="min-w-0 break-words font-mono text-xs text-muted-foreground">
              WOFF2 • WOFF • TTF • CSS • 5 Monochrome Styles × {ICON_NAMES.length} Icons ={" "}
              {ICON_NAMES.length * FONT_COMPATIBLE_STYLES.length} Glyphs
            </span>
          </div>
          <h3 className="mt-1.5 text-base font-bold text-foreground sm:text-lg">
            Production Icon Font System (HTML, PHP, WordPress &amp; Laravel Ready)
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Live CSS icon font glyphs rendered directly from{" "}
            <code className="break-all font-mono text-foreground">@slatico/font/slatico.css</code>{" "}
            with stable Unicode Private Use Area (<code className="font-mono text-foreground">U+E001–U+E017</code>) codepoints.
          </p>
        </div>

        {/* Style selector for the 5 monochrome font styles */}
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Select Icon Font Style"
        >
          {FONT_COMPATIBLE_STYLES.map((style) => {
            const isSelected = selectedStyle === style;
            return (
              <button
                key={style}
                type="button"
                onClick={() => setSelectedStyle(style)}
                className={`rounded-[20px] squircle px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-surface-subtle text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                {style}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls: CSS Font Size & CSS Color + Five-Style Live Strip */}
      <div className="mt-5 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="min-w-0 space-y-5 lg:col-span-7">
          {/* Interactive Size & Color Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] squircle border border-border bg-surface-subtle p-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                CSS font-size:
              </span>
              <div className="flex flex-wrap gap-1">
                {FONT_SIZE_PRESETS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFontSize(size)}
                    className={`rounded-[16px] squircle px-2 py-1 font-mono text-xs font-medium transition ${
                      fontSize === size
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-surface text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                CSS color:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {FONT_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setFontColor(preset.value)}
                    className={`rounded-[16px] squircle px-2 py-1 text-xs font-medium transition ${
                      fontColor === preset.value
                        ? "border border-primary bg-primary-soft font-semibold text-primary"
                        : "border border-border bg-surface text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live 5-Style Font Comparison for Selected Icon */}
          <div className="min-w-0 rounded-[24px] squircle border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-foreground">
                5 Monochrome Font Families —{" "}
                <code className="font-mono text-primary">
                  {selectedIcon}
                </code>{" "}
                ({activeGlyph.codepointHex})
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {FONT_FAMILIES[selectedStyle]}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {FONT_COMPATIBLE_STYLES.map((style) => {
                const glyph = getFontGlyph(selectedIcon, style);
                const isCurrent = style === selectedStyle;
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setSelectedStyle(style)}
                    className={`flex min-w-0 flex-col items-center justify-center rounded-[20px] squircle border p-2.5 transition sm:p-3 ${
                      isCurrent
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-surface-subtle text-foreground hover:border-border-strong"
                    }`}
                  >
                    <div
                      className="flex h-11 items-center justify-center text-foreground"
                      style={{
                        fontSize: `${fontSize}px`,
                        color: fontColor === "currentColor" ? undefined : fontColor
                      }}
                    >
                      <i className={`slatico ${glyph.className}`} aria-hidden="true" />
                    </div>
                    <span className="mt-1.5 max-w-full truncate font-mono text-[11px] font-medium capitalize">
                      {style}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Grid of Real Tier 1 Font Glyphs */}
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Click any Tier 1 glyph below to inspect its CSS class &amp; Unicode PUA assignment:
              </span>
              <span className="max-w-full truncate font-mono text-[11px] text-muted-foreground">
                .{activeGlyph.className}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {FEATURED_FONT_ICONS.map((iconName) => {
                const glyph = getFontGlyph(iconName, selectedStyle);
                const isSelected = selectedIcon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`flex min-w-0 flex-col items-center justify-center rounded-[20px] squircle border p-2.5 transition ${
                      isSelected
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-surface hover:bg-surface-subtle"
                    }`}
                  >
                    <div
                      className="flex h-10 items-center justify-center text-foreground"
                      style={{
                        fontSize: `${Math.min(fontSize, 32)}px`,
                        color: fontColor === "currentColor" ? undefined : fontColor
                      }}
                    >
                      <i className={`slatico ${glyph.className}`} aria-hidden="true" />
                    </div>
                    <span className="mt-1 max-w-full truncate font-mono text-[10px] text-muted-foreground">
                      {iconName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Code Snippets & Architectural Explanation for Duotone / Color */}
        <div className="flex min-w-0 flex-col justify-between space-y-4 lg:col-span-5">
          <div className="min-w-0 max-w-full overflow-hidden rounded-[24px] squircle border border-code-border bg-code-bg p-4 text-code-fg">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-code-border pb-2 font-mono text-[11px] text-code-fg/75">
              <span>HTML &amp; CSS Icon Font Usage</span>
              <span>{activeGlyph.codepointHex}</span>
            </div>
            <pre className="mt-3 max-w-full overflow-x-auto font-mono text-xs leading-relaxed text-code-fg">
              <code>{htmlUsageSnippet}</code>
            </pre>
            <pre className="mt-3 max-w-full overflow-x-auto border-t border-code-border pt-3 font-mono text-xs leading-relaxed text-code-fg/90">
              <code>{cssUsageSnippet}</code>
            </pre>
          </div>

          <div className="min-w-0 rounded-[24px] squircle border border-primary-border bg-primary-soft p-4 text-xs leading-relaxed text-muted-foreground">
            <p className="font-semibold text-foreground">
              Why Duotone &amp; Color Use SVG Instead of Icon Fonts
            </p>
            <p className="mt-1 break-words">
              Standard monochrome web fonts (<code className="font-mono text-foreground">WOFF2</code> /{" "}
              <code className="font-mono text-foreground">TTF</code>) render a single foreground glyph contour per
              character. Flattening <strong className="text-foreground">Duotone</strong> (independent secondary tone and opacity
              layers) or <strong className="text-foreground">Color</strong> (customizable primary and secondary vector fills)
              into a monochrome font would destroy their visual fidelity. Use{" "}
              <code className="font-mono text-foreground">@slatico/svg</code>,{" "}
              <code className="font-mono text-foreground">@slatico/react</code>,{" "}
              <code className="font-mono text-foreground">@slatico/vue</code>,{" "}
              <code className="font-mono text-foreground">@slatico/web</code>, or{" "}
              <code className="font-mono text-foreground">@slatico/react-native</code> for Duotone and Color icons.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
