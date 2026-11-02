import type { SlaticoStyle } from "@slatico/core";
import { scopeSvgIds, type IconVariantAsset } from "../lib/icon-asset";

export interface IconSvgProps {
  readonly asset: Pick<IconVariantAsset, "name" | "viewBox" | "innerSvg">;
  readonly style: SlaticoStyle;
  readonly size?: number;
  readonly color?: string;
  readonly secondaryColor?: string;
  readonly secondaryOpacity?: number;
  readonly title?: string;
  readonly className?: string;
  readonly idScope?: string;
}

/**
 * Renders one icon variant from its SVG data, supporting primary color, Duotone secondary color +
 * opacity, Color-style overrides, and per-instance id scoping.
 */
export function IconSvg({
  asset,
  style,
  size = 24,
  color = "currentColor",
  secondaryColor,
  secondaryOpacity,
  title,
  className,
  idScope
}: IconSvgProps) {
  const scopedInner = idScope ? scopeSvgIds(asset.innerSvg, idScope) : asset.innerSvg;

  const inlineStyle: Record<string, string> = {};
  if (style === "color") {
    if (color && color !== "currentColor") {
      inlineStyle["--slatico-primary-color"] = color;
    }
    if (
      secondaryColor &&
      secondaryColor !== "currentColor" &&
      secondaryColor !== "var(--primary)"
    ) {
      inlineStyle["--slatico-secondary-color"] = secondaryColor;
    } else {
      inlineStyle["--slatico-secondary-color"] =
        "var(--slatico-color-secondary-default, #000000)";
    }
  } else {
    if (color) {
      inlineStyle.color = color;
    }
    if (style === "duotone") {
      if (secondaryColor) {
        inlineStyle["--slatico-secondary-color"] = secondaryColor;
      }
      if (secondaryOpacity !== undefined) {
        inlineStyle["--slatico-secondary-opacity"] = String(secondaryOpacity);
      }
    }
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={asset.viewBox}
      width={size}
      height={size}
      fill="none"
      className={className}
      style={inlineStyle}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      data-slatico-icon={asset.name}
      data-slatico-variant={style}
      dangerouslySetInnerHTML={{
        __html: title ? `<title>${title}</title>${scopedInner}` : scopedInner
      }}
    />
  );
}
