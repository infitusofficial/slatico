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
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 lg:flex-row lg:items-center dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              @slatico/font
            </span>
            <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
              WOFF2 • WOFF • TTF • CSS • 5 Monochrome Styles × {ICON_NAMES.length} Icons ={" "}
              {ICON_NAMES.length * FONT_COMPATIBLE_STYLES.length} Glyphs
            </span>
          </div>
          <h3 className="mt-1.5 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Production Icon Font System (HTML, PHP, WordPress & Laravel Ready)
          </h3>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Live CSS icon font glyphs rendered directly from{" "}
            <code className="font-mono">@slatico/font/slatico.css</code> with stable Unicode
            Private Use Area (<code className="font-mono">U+E001–U+E017</code>) codepoints.
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
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                  isSelected
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {style}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls: CSS Font Size & CSS Color + Five-Style Live Strip */}
      <div className="mt-5 grid gap-6 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          {/* Interactive Size & Color Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 dark:border-zinc-800/80 dark:bg-zinc-950/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                CSS font-size:
              </span>
              <div className="flex gap-1">
                {FONT_SIZE_PRESETS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFontSize(size)}
                    className={`rounded px-2 py-1 font-mono text-xs transition ${
                      fontSize === size
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                CSS color:
              </span>
              <div className="flex gap-1.5">
                {FONT_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setFontColor(preset.value)}
                    className={`rounded px-2 py-1 text-xs font-medium transition ${
                      fontColor === preset.value
                        ? "ring-2 ring-indigo-500 bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                        : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live 5-Style Font Comparison for Selected Icon */}
          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                5 Monochrome Font Families —{" "}
                <code className="font-mono text-indigo-600 dark:text-indigo-400">
                  {selectedIcon}
                </code>{" "}
                ({activeGlyph.codepointHex})
              </span>
              <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                {FONT_FAMILIES[selectedStyle]}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-5 gap-2">
              {FONT_COMPATIBLE_STYLES.map((style) => {
                const glyph = getFontGlyph(selectedIcon, style);
                const isCurrent = style === selectedStyle;
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setSelectedStyle(style)}
                    className={`flex flex-col items-center justify-center rounded-lg border p-3 transition ${
                      isCurrent
                        ? "border-indigo-500 bg-indigo-50/40 dark:border-indigo-400 dark:bg-indigo-950/30"
                        : "border-zinc-200/80 bg-zinc-50/40 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950/40"
                    }`}
                  >
                    <div
                      className="flex h-12 items-center justify-center text-zinc-900 dark:text-zinc-100"
                      style={{
                        fontSize: `${fontSize}px`,
                        color: fontColor === "currentColor" ? undefined : fontColor
                      }}
                    >
                      <i className={`slatico ${glyph.className}`} aria-hidden="true" />
                    </div>
                    <span className="mt-1.5 font-mono text-[11px] font-medium capitalize text-zinc-700 dark:text-zinc-300">
                      {style}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Grid of Real Tier 1 Font Glyphs */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Click any Tier 1 glyph below to inspect its CSS class & Unicode PUA assignment:
              </span>
              <span className="font-mono text-[11px] text-zinc-500">
                .{activeGlyph.className}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {FEATURED_FONT_ICONS.map((iconName) => {
                const glyph = getFontGlyph(iconName, selectedStyle);
                const isSelected = selectedIcon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`flex flex-col items-center justify-center rounded-lg border p-2.5 transition ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50/40 dark:border-indigo-400 dark:bg-indigo-950/30"
                        : "border-zinc-200/80 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <div
                      className="flex h-10 items-center justify-center text-zinc-900 dark:text-zinc-100"
                      style={{
                        fontSize: `${Math.min(fontSize, 32)}px`,
                        color: fontColor === "currentColor" ? undefined : fontColor
                      }}
                    >
                      <i className={`slatico ${glyph.className}`} aria-hidden="true" />
                    </div>
                    <span className="mt-1 max-w-full truncate font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
                      {iconName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Code Snippets & Architectural Explanation for Duotone / Color */}
        <div className="flex flex-col justify-between space-y-4 lg:col-span-5">
          <div className="rounded-xl border border-zinc-200 bg-zinc-950 p-4 text-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-[11px] font-mono text-zinc-400">
              <span>HTML & CSS Icon Font Usage</span>
              <span>{activeGlyph.codepointHex}</span>
            </div>
            <pre className="mt-3 overflow-x-auto font-mono text-xs leading-relaxed text-zinc-200">
              <code>{htmlUsageSnippet}</code>
            </pre>
            <pre className="mt-3 border-t border-zinc-800 pt-3 overflow-x-auto font-mono text-xs leading-relaxed text-indigo-300">
              <code>{cssUsageSnippet}</code>
            </pre>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              Why Duotone & Color Use SVG Instead of Icon Fonts
            </p>
            <p className="mt-1">
              Standard monochrome web fonts (<code className="font-mono">WOFF2</code> /{" "}
              <code className="font-mono">TTF</code>) render a single foreground glyph contour per
              character. Flattening <strong>Duotone</strong> (independent secondary tone and opacity
              layers) or <strong>Color</strong> (multi-stop vector gradients and distinct fills)
              into a monochrome font would destroy their visual fidelity. Use{" "}
              <code className="font-mono">@slatico/svg</code>,{" "}
              <code className="font-mono">@slatico/react</code>,{" "}
              <code className="font-mono">@slatico/vue</code>,{" "}
              <code className="font-mono">@slatico/web</code>, or{" "}
              <code className="font-mono">@slatico/react-native</code> for Duotone and Color icons.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
