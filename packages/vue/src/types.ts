import type { SVGAttributes } from "vue";
import type { SlaticoStyle } from "@slatico/core";

export interface SlaticoVueIconProps extends /* @vue-ignore */ Omit<SVGAttributes, "color"> {
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
   */
  readonly secondaryColor?: string | undefined;
  /**
   * Optional secondary layer opacity override for Duotone icons (binds to --slatico-secondary-opacity).
   */
  readonly secondaryOpacity?: number | string | undefined;
  /**
   * Accessible label. When provided, sets role="img", aria-label, and renders <title>.
   * When omitted, aria-hidden="true" is applied automatically.
   */
  readonly title?: string | undefined;
}
