import type { SvgProps } from "react-native-svg";
import type { SlaticoStyle } from "@slatico/core";

export interface SlaticoNativeIconProps extends Omit<SvgProps, "color" | "title"> {
  /**
   * Visual style variant of the icon.
   * @default "regular"
   */
  readonly variant?: SlaticoStyle | undefined;
  /**
   * Width and height of the SVG icon in density-independent pixels.
   * @default 24
   */
  readonly size?: number | string | undefined;
  /**
   * Primary foreground color applied to monochrome and duotone strokes/fills.
   * @default "#09090B"
   */
  readonly color?: string | undefined;
  /**
   * Secondary tone color for Duotone icons. When omitted, falls back to primary `color`.
   */
  readonly secondaryColor?: string | undefined;
  /**
   * Secondary layer opacity for Duotone icons.
   * @default 0.22
   */
  readonly secondaryOpacity?: number | string | undefined;
  /**
   * Accessible label for screen readers (VoiceOver / TalkBack).
   */
  readonly title?: string | undefined;
}
