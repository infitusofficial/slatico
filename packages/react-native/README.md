# `@slatico/react-native`

Official React Native & Expo SVG icon components for **Slatico by Infitus Creative Studio** (`27` icon families across all `7` official styles = `189` variants), powered by `react-native-svg`.

## Installation

```bash
npm install @slatico/react-native react-native-svg
# or
pnpm add @slatico/react-native react-native-svg
# or
yarn add @slatico/react-native react-native-svg
```

## Usage

```tsx
import {
  BellIcon,
  ShieldCheckDuotoneIcon,
  WalletColorIcon
} from "@slatico/react-native";
// Or import directly from a per-icon subpath:
import { ArrowUpRightBoldIcon } from "@slatico/react-native/icons/arrow-up-right";

export function MobileToolbar() {
  return (
    <>
      {/* 1. Monochrome icon */}
      <BellIcon variant="regular" size={24} color="#010520" />

      {/* 2. Explicit style component */}
      <ArrowUpRightBoldIcon size={20} color="#010520" />

      {/* 3. Duotone icon with independent primary & secondary colors + opacity */}
      <ShieldCheckDuotoneIcon
        size={28}
        color="#010520"
        secondaryColor="#FF6040"
        secondaryOpacity={0.25}
        title="Security Verified"
      />

      {/* 4. Color icon with default brand palette or two custom colors */}
      <WalletColorIcon
        size={32}
        color="#FF6040"
        secondaryColor="#010520"
        title="Wallet"
      />
    </>
  );
}
```

## Component Props (`SlaticoNativeIconProps`)

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `SlaticoStyle` | `"regular"` | Style variant (`thin`, `light`, `regular`, `bold`, `fill`, `duotone`, `color`). |
| `size` | `number \| string` | `24` | Width and height in density-independent pixels (`dp` / `pt`). |
| `color` | `string` | `"#09090B"` (`"#FF6040"` for `color`) | Primary color for monochrome, `duotone`, and `color` variants. |
| `secondaryColor` | `string` | `color` (`"#000000"` for `color`) | Secondary tone color for `duotone` and `color` variants. |
| `secondaryOpacity` | `number \| string` | `0.22` | Secondary layer opacity for `duotone` icons. |
| `title` / `accessibilityLabel` | `string` | `undefined` | Accessible label for VoiceOver and TalkBack. Sets `accessible={true}` and `accessibilityRole="image"`. |

## License

MIT © Infitus Creative Studio (`infitusofficial`)
