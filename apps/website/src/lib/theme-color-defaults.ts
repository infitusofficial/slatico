"use client";

import { useEffect, useState } from "react";
import type { SlaticoStyle } from "@slatico/core";
import { SITE_CONFIG } from "../config/site";

export const LIGHT_COLOR_VARIANT_SECONDARY_DEFAULT = "#000000";
export const DARK_COLOR_VARIANT_SECONDARY_DEFAULT = "#FFFFFF";

/**
 * Checks whether the document root currently has the `.dark` theme class applied.
 */
export function isDocumentDarkTheme(): boolean {
  if (typeof document === "undefined") {
    return false;
  }
  return document.documentElement.classList.contains("dark");
}

/**
 * Returns true when `secondaryColor` is still in its unmodified default token state
 * (i.e. the user has not manually chosen a custom secondary color via the picker).
 */
export function isDefaultSecondaryColorState(secondaryColor?: string): boolean {
  if (!secondaryColor) {
    return true;
  }
  const trimmed = secondaryColor.trim();
  return (
    trimmed.length === 0 ||
    trimmed === "var(--primary)" ||
    trimmed === "currentColor"
  );
}

/**
 * Returns the theme-aware default secondary hex color for the `color` icon variant:
 * - Light mode -> `#000000`
 * - Dark mode  -> `#FFFFFF`
 */
export function getColorVariantDefaultSecondaryHex(isDark?: boolean): string {
  const dark = isDark ?? isDocumentDarkTheme();
  return dark
    ? DARK_COLOR_VARIANT_SECONDARY_DEFAULT
    : LIGHT_COLOR_VARIANT_SECONDARY_DEFAULT;
}

/**
 * Resolves the effective secondary color hex/token for UI swatches, code snippets, and exports.
 * - For `color` variant with no manual override: `#000000` in Light mode, `#FFFFFF` in Dark mode.
 * - For `duotone` variant with no manual override: `var(--primary)` (or `#FF6040` for hex pickers).
 * - When manually overridden: preserves the user's selected color.
 */
export function resolveEffectiveSecondaryColor(
  style: SlaticoStyle,
  secondaryColor: string,
  isDark?: boolean
): string {
  if (!isDefaultSecondaryColorState(secondaryColor)) {
    return secondaryColor;
  }
  if (style === "color") {
    return getColorVariantDefaultSecondaryHex(isDark);
  }
  return secondaryColor || "var(--primary)";
}

/**
 * Resolves a 6-digit `#RRGGBB` value suitable for `<input type="color">` value attributes.
 */
export function resolveSecondaryPickerHex(
  style: SlaticoStyle,
  secondaryColor: string,
  isDark?: boolean
): string {
  if (/^#[0-9A-Fa-f]{6}$/.test(secondaryColor.trim())) {
    return secondaryColor.trim().toUpperCase();
  }
  if (style === "color") {
    return getColorVariantDefaultSecondaryHex(isDark);
  }
  return SITE_CONFIG.colors.primary;
}

/**
 * Reactive hook that tracks whether the resolved website theme is Dark Mode
 * by observing class mutations on `document.documentElement`.
 */
export function useResolvedDarkTheme(): boolean {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      setIsDark(root.classList.contains("dark"));
    };
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"]
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}
