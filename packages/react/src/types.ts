import type { SVGProps } from "react";
import type { SlaticoStyle } from "@slatico/core";

export interface SlaticoIconProps extends Omit<SVGProps<SVGSVGElement>, "color"> {
  /**
   * Visual style variant of the icon.
   * @default "regular"
   */
  readonly variant?: SlaticoStyle | undefined;
  /**
   * Width and height of the SVG icon in pixels or CSS units.
   * @default 24
   */
  readonly size?: number | string | undefined;
  /**
   * Primary foreground color applied via CSS color / currentColor.
   */
  readonly color?: string | undefined;
  /**
   * Optional secondary tone color for Duotone icons (binds to --slatico-secondary-color).
   * When omitted, Duotone icons use their authored secondary color or currentColor with opacity.
   */
  readonly secondaryColor?: string | undefined;
  /**
   * Optional secondary layer opacity override for Duotone icons (binds to --slatico-secondary-opacity).
   */
  readonly secondaryOpacity?: number | string | undefined;
  /**
   * Accessible label. When provided, sets role="img" and aria-label.
   * When omitted, aria-hidden="true" is applied automatically.
   */
  readonly title?: string | undefined;
}
