import type { SlaticoIconName, SlaticoStyle } from "@slatico/core";
import { getSvgAsset } from "@slatico/svg";
import { IconSvg } from "./icon-svg";

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
 * Server-side icon renderer backed by the full `@slatico/svg` catalog.
 *
 * Server components only: importing this from a client component would ship every SVG variant to
 * the browser. Client components use `SiteIcon` (fixed chrome icons) or the catalog-backed
 * `CatalogIcon`.
 */
export function DynamicSlaticoIcon({ name, style = "regular", ...rest }: DynamicSlaticoIconProps) {
  return <IconSvg asset={getSvgAsset(name, style)} style={style} {...rest} />;
}
