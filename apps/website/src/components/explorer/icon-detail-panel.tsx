"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  SLATICO_STYLES,
  SLATICO_STYLE_SPECS,
  type SlaticoStyle
} from "@slatico/core";
import type { EnrichedCatalogIcon } from "../../lib/catalog";
import { SITE_CONFIG } from "../../config/site";
import {
  getColorVariantDefaultSecondaryHex,
  resolveEffectiveSecondaryColor,
  useResolvedDarkTheme
} from "../../lib/theme-color-defaults";
import { DynamicSlaticoIcon } from "../dynamic-slatico-icon";
import {
  buildStandaloneSvg,
  downloadStandaloneSvg
} from "../../lib/svg-export";
import {
  exportIconToPng,
  exportIconToWebp,
  isCanvasWebpSupported,
  RASTER_EXPORT_SIZES,
  type RasterExportSize
} from "../../lib/raster-export";
import {
  CODE_SNIPPET_PLATFORMS,
  CODE_SNIPPET_PLATFORM_META,
  generatePlatformCodeSnippet,
  type CodeSnippetPlatformId
} from "../../lib/code-snippets";

export type PreviewBackgroundMode = "checkerboard" | "light" | "dark";

export interface IconCustomizerState {
  readonly style: SlaticoStyle;
  readonly size: number;
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly secondaryOpacity: number;
  readonly previewBg: PreviewBackgroundMode;
}

export interface IconDetailPanelProps {
  readonly icon: EnrichedCatalogIcon;
  readonly customizer: IconCustomizerState;
  readonly onCustomizerChange: (patch: Partial<IconCustomizerState>) => void;
  readonly onClose?: () => void;
  readonly mode?: "drawer" | "inline";
}

const COLOR_PRESETS: ReadonlyArray<{ label: string; value: string }> = [
  { label: "Default", value: "currentColor" },
  { label: "Brand Dark", value: SITE_CONFIG.colors.dark },
  { label: "Brand Primary", value: SITE_CONFIG.colors.primary },
  { label: "Indigo", value: "#4F46E5" },
  { label: "Emerald", value: "#059669" },
  { label: "Cyan", value: "#0891B2" },
  { label: "Amber", value: "#D97706" },
  { label: "Rose", value: "#E11D48" },
  { label: "Violet", value: "#7C3AED" }
];

const SECONDARY_COLOR_PRESETS: ReadonlyArray<{ label: string; value: string }> = [
  { label: "Default", value: "var(--primary)" },
  { label: "Brand Primary", value: SITE_CONFIG.colors.primary },
  { label: "Brand Dark", value: SITE_CONFIG.colors.dark },
  { label: "Black", value: "#000000" },
  { label: "White", value: "#FFFFFF" },
  { label: "Indigo", value: "#4F46E5" },
  { label: "Emerald", value: "#059669" },
  { label: "Cyan", value: "#0891B2" }
];

const QUICK_SIZES = [16, 20, 24, 32, 48, 64] as const;

export function IconDetailPanel({
  icon,
  customizer,
  onCustomizerChange,
  onClose,
  mode = "drawer"
}: IconDetailPanelProps) {
  const [activePlatform, setActivePlatform] =
    useState<CodeSnippetPlatformId>("react");
  const [rasterSize, setRasterSize] = useState<RasterExportSize>(256);
  const [rasterBgMode, setRasterBgMode] = useState<"transparent" | "white" | "dark">(
    "transparent"
  );
  const [webpSupported, setWebpSupported] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const isDarkTheme = useResolvedDarkTheme();
  const defaultColorSecondary = getColorVariantDefaultSecondaryHex(isDarkTheme);
  const effectiveSecondaryColor = resolveEffectiveSecondaryColor(
    customizer.style,
    customizer.secondaryColor,
    isDarkTheme
  );

  useEffect(() => {
    setWebpSupported(isCanvasWebpSupported());
  }, []);

  useEffect(() => {
    if (mode !== "drawer") return;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, onClose, icon.name]);

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Copied ${label}`);
    } catch {
      showToast(`Could not copy ${label}`);
    }
  };

  const resolvedRasterBg =
    rasterBgMode === "transparent"
      ? null
      : rasterBgMode === "white"
        ? "#FFFFFF"
        : "#0B1120";

  const handleCopySvg = async () => {
    const svg = buildStandaloneSvg(icon.name, customizer.style, {
      size: customizer.size,
      primaryColor: customizer.primaryColor,
      secondaryColor: effectiveSecondaryColor,
      secondaryOpacity: customizer.secondaryOpacity
    });
    await copyText(svg, `${icon.name} (${customizer.style}) SVG`);
  };

  const handleDownloadSvg = () => {
    downloadStandaloneSvg(icon.name, customizer.style, {
      size: customizer.size,
      primaryColor: customizer.primaryColor,
      secondaryColor: effectiveSecondaryColor,
      secondaryOpacity: customizer.secondaryOpacity
    });
    showToast(`Downloaded slatico-${icon.name}-${customizer.style}.svg`);
  };

  const handleExportPng = async () => {
    setIsExporting(true);
    try {
      const res = await exportIconToPng(icon.name, customizer.style, {
        dimension: rasterSize,
        primaryColor: customizer.primaryColor,
        secondaryColor: effectiveSecondaryColor,
        secondaryOpacity: customizer.secondaryOpacity,
        backgroundColor: resolvedRasterBg
      });
      showToast(`Downloaded ${res.fileName}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "PNG export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWebp = async () => {
    setIsExporting(true);
    try {
      const res = await exportIconToWebp(icon.name, customizer.style, {
        dimension: rasterSize,
        primaryColor: customizer.primaryColor,
        secondaryColor: effectiveSecondaryColor,
        secondaryOpacity: customizer.secondaryOpacity,
        backgroundColor: resolvedRasterBg
      });
      showToast(`Downloaded ${res.fileName}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "WebP export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const { downloadVectorPdf } = await import("../../lib/pdf-export");
      downloadVectorPdf(icon.name, customizer.style, {
        primaryColor: customizer.primaryColor,
        secondaryColor: effectiveSecondaryColor,
        secondaryOpacity: customizer.secondaryOpacity,
        backgroundColor: resolvedRasterBg
      });
      showToast(`Downloaded vector PDF slatico-${icon.name}-${customizer.style}.pdf`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "PDF export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const currentCodeSnippet = generatePlatformCodeSnippet(activePlatform, {
    name: icon.name,
    pascalName: icon.pascalName,
    style: customizer.style,
    size: customizer.size,
    primaryColor: customizer.primaryColor,
    secondaryColor: effectiveSecondaryColor,
    secondaryOpacity: customizer.secondaryOpacity
  });

  const activePlatformMeta = CODE_SNIPPET_PLATFORM_META[activePlatform];

  const previewSurfaceClass =
    customizer.previewBg === "light"
      ? "bg-white text-slate-900"
      : customizer.previewBg === "dark"
        ? "bg-brand-dark text-white"
        : "bg-checkerboard text-foreground";

  const content = (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-primary-soft px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
              {icon.categoryLabel}
            </span>
            <span className="rounded-md border border-border bg-surface-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
              24×24 Master Grid
            </span>
          </div>
          <h2
            id="icon-detail-title"
            className="mt-2 text-xl font-bold text-foreground"
          >
            {icon.pascalName}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-foreground">
              {icon.name}
            </code>
            <button
              type="button"
              onClick={() => copyText(icon.name, "icon slug")}
              className="font-medium text-primary hover:underline"
            >
              Copy slug
            </button>
            <span>·</span>
            <Link
              href={`/icons/${icon.name}`}
              className="font-medium text-primary hover:underline"
            >
              Open standalone page
            </Link>
          </div>
        </div>

        {mode === "drawer" && onClose && (
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close icon inspector"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
          >
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
          </button>
        )}
      </div>

      {/* Feedback Toast Banner */}
      {feedbackMessage && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-primary-border bg-primary-soft px-3.5 py-2 text-xs font-semibold text-primary"
        >
          {feedbackMessage}
        </div>
      )}

      {/* Live Preview Stage & All-7-Styles Comparison Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
        <div
          className={`relative flex min-h-44 min-w-0 flex-col items-center justify-center rounded-[24px] squircle border border-border p-6 sm:col-span-5 ${previewSurfaceClass}`}
        >
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-lg border border-border bg-surface/90 p-0.5 text-[10px] backdrop-blur-xs">
            {(["checkerboard", "light", "dark"] as const).map((bg) => (
              <button
                key={bg}
                type="button"
                onClick={() => onCustomizerChange({ previewBg: bg })}
                aria-pressed={customizer.previewBg === bg}
                className={`rounded px-1.5 py-0.5 font-medium capitalize ${
                  customizer.previewBg === bg
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {bg === "checkerboard" ? "Grid" : bg}
              </button>
            ))}
          </div>

          <DynamicSlaticoIcon
            name={icon.name}
            style={customizer.style}
            size={customizer.size}
            color={customizer.primaryColor}
            secondaryColor={customizer.secondaryColor}
            secondaryOpacity={customizer.secondaryOpacity}
            idScope={`detail-stage-${icon.name}`}
          />

          <div className="mt-4 flex items-center gap-2 font-mono text-[11px] opacity-75">
            <span>{SLATICO_STYLE_SPECS[customizer.style].label}</span>
            <span>·</span>
            <span>
              {customizer.size}×{customizer.size}px
            </span>
          </div>
        </div>

        {/* 7 Style Strip */}
        <div className="flex min-w-0 flex-col justify-between rounded-[24px] squircle border border-border bg-surface-subtle p-4 sm:col-span-7">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              7 Architectural Styles
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {SLATICO_STYLE_SPECS[customizer.style].strokeWidth
                ? `${SLATICO_STYLE_SPECS[customizer.style].strokeWidth}px stroke`
                : "Solid / Layered"}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {SLATICO_STYLES.map((st) => {
              const active = customizer.style === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => onCustomizerChange({ style: st })}
                  aria-pressed={active}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-[16px] squircle border p-2 text-center transition-all ${
                    active
                      ? "border-primary bg-primary-soft text-primary shadow-2xs"
                      : "border-border bg-surface text-foreground hover:border-border-strong"
                  }`}
                >
                  <DynamicSlaticoIcon
                    name={icon.name}
                    style={st}
                    size={22}
                    color={customizer.primaryColor}
                    secondaryColor={customizer.secondaryColor}
                    secondaryOpacity={customizer.secondaryOpacity}
                    idScope={`strip-${icon.name}-${st}`}
                  />
                  <span className="text-[10px] font-medium capitalize">
                    {st}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            {SLATICO_STYLE_SPECS[customizer.style].description}
          </p>
        </div>
      </div>

      {/* Interactive Customizer Controls (Size, Primary Color, Secondary Color) */}
      <div className="rounded-[24px] squircle border border-border bg-surface p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Size Controls */}
          <div className="min-w-0">
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="detail-size-slider"
                className="font-semibold text-foreground"
              >
                Preview &amp; Snippet Size
              </label>
              <span className="font-mono text-muted-foreground">
                {customizer.size}px
              </span>
            </div>
            <input
              id="detail-size-slider"
              type="range"
              min={16}
              max={64}
              step={2}
              value={customizer.size}
              onChange={(e) =>
                onCustomizerChange({ size: Number(e.target.value) })
              }
              className="mt-2 w-full accent-primary"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => onCustomizerChange({ size: sz })}
                  className={`rounded-lg border px-2 py-0.5 font-mono text-[11px] font-medium ${
                    customizer.size === sz
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {sz}px
                </button>
              ))}
            </div>
          </div>

          {/* Primary Color Controls */}
          <div className="min-w-0">
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="detail-primary-color"
                className="font-semibold text-foreground"
              >
                Primary Color{" "}
                {customizer.style === "color" && (
                  <span className="font-normal text-muted-foreground">
                    (Default Primary)
                  </span>
                )}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id="detail-primary-color"
                  type="color"
                  aria-label="Custom primary hex color"
                  value={
                    /^#[0-9A-Fa-f]{6}$/.test(customizer.primaryColor)
                      ? customizer.primaryColor
                      : customizer.style === "color"
                        ? SITE_CONFIG.colors.primary
                        : SITE_CONFIG.colors.dark
                  }
                  onChange={(e) =>
                    onCustomizerChange({ primaryColor: e.target.value })
                  }
                  className="h-6 w-8 cursor-pointer rounded border border-border bg-surface"
                />
                <code className="font-mono text-[11px] text-muted-foreground">
                  {/^#[0-9A-Fa-f]{6}$/.test(customizer.primaryColor)
                    ? customizer.primaryColor.toUpperCase()
                    : customizer.style === "color"
                      ? `${SITE_CONFIG.colors.primary} (default)`
                      : `${SITE_CONFIG.colors.dark} (default)`}
                </code>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() =>
                    onCustomizerChange({ primaryColor: preset.value })
                  }
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-medium ${
                    customizer.primaryColor === preset.value
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-surface-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-border"
                    style={{
                      backgroundColor:
                        preset.value === "currentColor"
                          ? customizer.style === "color"
                            ? SITE_CONFIG.colors.primary
                            : SITE_CONFIG.colors.dark
                          : preset.value
                    }}
                  />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Duotone & Color Secondary Layer Controls */}
        {(customizer.style === "duotone" || customizer.style === "color") && (
          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <div className="min-w-0">
              <div className="flex items-center justify-between text-xs">
                <label
                  htmlFor="detail-secondary-color"
                  className="font-semibold text-foreground"
                >
                  {customizer.style === "color"
                    ? `Secondary Color (Default ${defaultColorSecondary})`
                    : "Duotone Secondary Color"}
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    id="detail-secondary-color"
                    type="color"
                    aria-label="Custom secondary hex color"
                    value={
                      /^#[0-9A-Fa-f]{6}$/.test(customizer.secondaryColor)
                        ? customizer.secondaryColor
                        : customizer.style === "color"
                          ? defaultColorSecondary
                          : SITE_CONFIG.colors.primary
                    }
                    onChange={(e) =>
                      onCustomizerChange({ secondaryColor: e.target.value })
                    }
                    className="h-6 w-8 cursor-pointer rounded border border-border bg-surface"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onCustomizerChange({ secondaryColor: "var(--primary)" })
                    }
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Reset default
                  </button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SECONDARY_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() =>
                      onCustomizerChange({ secondaryColor: preset.value })
                    }
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-medium ${
                      customizer.secondaryColor === preset.value
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-surface-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-border"
                      style={{
                        backgroundColor:
                          preset.value === "var(--primary)"
                            ? customizer.style === "color"
                              ? defaultColorSecondary
                              : SITE_CONFIG.colors.primary
                            : preset.value
                      }}
                    />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Controls <code className="font-mono">--slatico-secondary-color</code>{" "}
                in Web/SVG and <code className="font-mono">secondaryColor</code> in native SDKs.
              </p>
            </div>

            {customizer.style === "duotone" ? (
              <div className="min-w-0">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="detail-secondary-opacity"
                    className="font-semibold text-foreground"
                  >
                    Secondary Layer Opacity
                  </label>
                  <span className="font-mono text-muted-foreground">
                    {Math.round(customizer.secondaryOpacity * 100)}%
                  </span>
                </div>
                <input
                  id="detail-secondary-opacity"
                  type="range"
                  min={0.05}
                  max={1}
                  step={0.05}
                  value={customizer.secondaryOpacity}
                  onChange={(e) =>
                    onCustomizerChange({
                      secondaryOpacity: Number(e.target.value)
                    })
                  }
                  className="mt-2 w-full accent-primary"
                />
              </div>
            ) : (
              <div className="flex min-w-0 flex-col justify-center rounded-[20px] squircle border border-border bg-surface-subtle p-3.5 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">
                  Dual-Tone Color Architecture
                </p>
                <p className="mt-1 leading-relaxed">
                  Slatico <code className="font-mono text-foreground">color</code> icons support independent Primary and Secondary customization across live preview, SVG/PNG/WebP/PDF export, and all platform SDKs while preserving original brand defaults when unset.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export Suite: SVG, PNG, WebP, Vector PDF */}
      <div className="rounded-[24px] squircle border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-foreground uppercase">
            Instant Asset Export (SVG · PNG · WebP · Vector PDF)
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <label htmlFor="raster-dimension-select" className="text-muted-foreground">
              Raster size:
            </label>
            <select
              id="raster-dimension-select"
              value={rasterSize}
              onChange={(e) =>
                setRasterSize(Number(e.target.value) as RasterExportSize)
              }
              className="rounded-lg border border-border bg-surface-muted px-2 py-1 font-mono text-xs text-foreground"
            >
              {RASTER_EXPORT_SIZES.map((dim) => (
                <option key={dim} value={dim}>
                  {dim}×{dim}px
                </option>
              ))}
            </select>

            <label htmlFor="raster-bg-select" className="text-muted-foreground">
              Background:
            </label>
            <select
              id="raster-bg-select"
              value={rasterBgMode}
              onChange={(e) =>
                setRasterBgMode(
                  e.target.value as "transparent" | "white" | "dark"
                )
              }
              className="rounded-lg border border-border bg-surface-muted px-2 py-1 text-xs text-foreground"
            >
              <option value="transparent">Transparent</option>
              <option value="white">Light (#FFFFFF)</option>
              <option value="dark">Dark Surface</option>
            </select>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <button
            type="button"
            onClick={handleCopySvg}
            className="inline-flex items-center justify-center gap-1.5 rounded-[20px] squircle bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <span>Copy SVG</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSvg}
            className="inline-flex items-center justify-center gap-1.5 rounded-[20px] squircle border border-border bg-surface-muted px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-border-strong"
          >
            <span>Download SVG</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportPng}
            className="inline-flex items-center justify-center gap-1.5 rounded-[20px] squircle border border-border bg-surface-muted px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-border-strong disabled:opacity-50"
          >
            <span>PNG ({rasterSize}px)</span>
          </button>

          <button
            type="button"
            disabled={isExporting || !webpSupported}
            onClick={handleExportWebp}
            title={
              webpSupported
                ? `Export ${rasterSize}x${rasterSize}px WebP`
                : "WebP canvas encoding is not supported in this browser"
            }
            className="inline-flex items-center justify-center gap-1.5 rounded-[20px] squircle border border-border bg-surface-muted px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-border-strong disabled:opacity-50"
          >
            <span>WebP ({rasterSize}px)</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportPdf}
            className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-[20px] squircle border border-primary-border bg-primary-soft px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:col-span-1"
          >
            <span>Vector PDF</span>
          </button>
        </div>
      </div>

      {/* 11-Platform Code Snippets */}
      <div className="min-w-0 rounded-[24px] squircle border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-foreground uppercase">
              Multi-Platform Code Generator (11 Targets)
            </h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Package: <code className="font-mono text-foreground">{activePlatformMeta.packageName}</code>
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              copyText(currentCodeSnippet, `${activePlatformMeta.label} snippet`)
            }
            className="inline-flex items-center gap-1.5 rounded-[20px] squircle bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <span>Copy {activePlatformMeta.shortLabel} Code</span>
          </button>
        </div>

        {/* Platform Tabs */}
        <div
          role="tablist"
          aria-label="Platform code target"
          className="mt-3 flex flex-wrap gap-1.5 border-b border-border pb-3"
        >
          {CODE_SNIPPET_PLATFORMS.map((platId) => {
            const meta = CODE_SNIPPET_PLATFORM_META[platId];
            const active = activePlatform === platId;
            return (
              <button
                key={platId}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setActivePlatform(platId)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {meta.shortLabel}
              </button>
            );
          })}
        </div>

        <pre className="mt-3 max-w-full overflow-x-auto rounded-[20px] squircle border border-code-border bg-code-bg p-4 font-mono text-xs leading-relaxed text-code-fg">
          <code>{currentCodeSnippet}</code>
        </pre>
      </div>

      {/* Keywords & Metadata */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="font-semibold text-muted-foreground">Search tags:</span>
        {icon.keywords.map((kw) => (
          <span
            key={kw}
            className="rounded-md border border-border bg-surface-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
          >
            {kw}
          </span>
        ))}
      </div>
    </div>
  );

  if (mode === "inline") {
    return (
      <div className="rounded-[32px] squircle border border-border bg-surface p-5 shadow-xs sm:p-8">
        {content}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-brand-dark/55 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="icon-detail-title"
        className="mt-auto flex max-h-[92vh] w-full flex-col overflow-y-auto rounded-t-3xl border-t border-border bg-surface p-5 shadow-2xl sm:mt-0 sm:max-h-screen sm:max-w-2xl sm:rounded-t-none sm:rounded-l-3xl sm:border-t-0 sm:border-l sm:p-6"
      >
        {content}
      </div>
    </div>
  );
}
