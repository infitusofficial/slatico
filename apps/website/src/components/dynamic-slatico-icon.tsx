import type { SlaticoIconName, SlaticoStyle } from "@slatico/core";
import { getSvgAsset, scopeSvgIds } from "@slatico/svg";

export interface DynamicSlaticoIconProps {
  readonly name: SlaticoIconName;
  readonly style?: SlaticoStyle;
  readonly size?: number;
  readonly color?: string;
  readonly secondaryColor?: string;
  readonly secondaryOpacity?: number;
  readonly title?: string;
  readonly className?: string;
  readonly idScope?: string;
}

/**
 * Renders any Slatico icon by name and style directly from `@slatico/svg` catalog data,
 * supporting dynamic style switching, primary color, Duotone secondary color + opacity,
 * and unique ID scoping so multiple instances on the page never collide.
 */
export function DynamicSlaticoIcon({
  name,
  style = "regular",
  size = 24,
  color = "currentColor",
  secondaryColor,
  secondaryOpacity,
  title,
  className,
  idScope
}: DynamicSlaticoIconProps) {
  const asset = getSvgAsset(name, style);
  const scopedInner = idScope
    ? scopeSvgIds(asset.innerSvg, idScope)
    : asset.innerSvg;

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
      data-slatico-icon={name}
      data-slatico-variant={style}
      dangerouslySetInnerHTML={{
        __html: title ? `<title>${title}</title>${scopedInner}` : scopedInner
      }}
    />
  );
}
