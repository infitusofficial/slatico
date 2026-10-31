# `@slatico/vue`

Official Vue 3 & Nuxt 3 SVG icon components for **Slatico by Infitus Creative Studio** (`27` icon families across all `7` official styles = `189` variants).

## Installation

```bash
npm install @slatico/vue
# or
pnpm add @slatico/vue
# or
yarn add @slatico/vue
```

## Usage (`<script setup>`)

```vue
<script setup lang="ts">
import {
  BellIcon,
  ShieldCheckDuotoneIcon,
  WalletColorIcon
} from "@slatico/vue";
// Or import directly from a per-icon subpath:
import { ArrowUpRightBoldIcon } from "@slatico/vue/icons/arrow-up-right";
</script>

<template>
  <!-- 1. Monochrome icon -->
  <BellIcon variant="regular" :size="24" color="currentColor" />

  <!-- 2. Explicit style component -->
  <ArrowUpRightBoldIcon :size="20" color="#010520" />

  <!-- 3. Duotone icon with custom primary + secondary colors and opacity -->
  <ShieldCheckDuotoneIcon
    :size="28"
    color="#010520"
    secondary-color="#FF6040"
    :secondary-opacity="0.25"
    title="Security Verified"
  />

  <!-- 4. Color icon with default palette or two custom colors -->
  <WalletColorIcon
    :size="28"
    color="#FF6040"
    secondary-color="#010520"
    title="Wallet"
  />
</template>
```

## Component Props (`SlaticoVueIconProps`)

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `SlaticoStyle` | `"regular"` | Style variant (`thin`, `light`, `regular`, `bold`, `fill`, `duotone`, `color`). |
| `size` | `number \| string` | `24` | Width and height of the `<svg>` element. |
| `color` | `string` | `"currentColor"` | Primary color (`color` for monochrome/duotone; `--slatico-primary-color` override for `color`). |
| `secondaryColor` | `string` | `undefined` | Secondary tone color (`--slatico-secondary-color`) for `duotone` and `color` variants. |
| `secondaryOpacity` | `number \| string` | `0.2` (in SVG) | Secondary tone opacity (`--slatico-secondary-opacity`) for `duotone` icons. |
| `title` | `string` | `undefined` | Accessible label (`role="img"` + `aria-label` + `<title>`). When omitted, `aria-hidden="true"` is set. |

## License

MIT © Infitus Creative Studio (`infitusofficial`)
