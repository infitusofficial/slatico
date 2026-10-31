# `@slatico/react`

Official tree-shakeable React (`18+` and `19+`) and Next.js SVG icon components for **Slatico by Infitus Creative Studio** (`27` icon families across all `7` official styles = `189` variants).

## Installation

```bash
npm install @slatico/react
# or
pnpm add @slatico/react
# or
yarn add @slatico/react
```

## Quick Start

Import unified `<NameIcon />` components (which accept a `variant` prop) or style-specific components (`<NameRegularIcon />`, `<NameDuotoneIcon />`, `<NameColorIcon />`):

```tsx
import {
  BellIcon,
  ShieldCheckDuotoneIcon,
  WalletColorIcon,
  ArrowUpRightBoldIcon
} from "@slatico/react";

export function HeaderActions() {
  return (
    <div className="flex items-center gap-4">
      {/* 1. Regular monochrome icon inheriting currentColor */}
      <BellIcon variant="regular" size={24} color="currentColor" />

      {/* 2. Explicit style component with custom size and color */}
      <ArrowUpRightBoldIcon size={20} color="#010520" />

      {/* 3. Duotone icon with primary color, secondaryColor, and secondaryOpacity */}
      <ShieldCheckDuotoneIcon
        size={28}
        color="#010520"
        secondaryColor="#FF6040"
        secondaryOpacity={0.25}
        title="Security Verified"
      />

      {/* 4. Color icon with default palette (#FF6040 primary + #000000 secondary) */}
      <WalletColorIcon size={28} />

      {/* 5. Color icon with two custom colors */}
      <BellIcon
        variant="color"
        size={28}
        color="#FF6040"
        secondaryColor="#010520"
        title="Alerts"
      />
    </div>
  );
}
```

## Subpath Imports & Tree Shaking

`@slatico/react` is marked `"sideEffects": false` and supports direct per-icon subpath imports for zero-overhead bundling:

```tsx
import { BellIcon, BellDuotoneIcon } from "@slatico/react/icons/bell";
import { ArrowUpRightIcon } from "@slatico/react/icons/arrow-up-right";
```

## Component Props (`SlaticoIconProps`)

All Slatico React components forward refs to the underlying `SVGSVGElement` and accept all standard React `<svg>` props plus:

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `"thin" \| "light" \| "regular" \| "bold" \| "fill" \| "duotone" \| "color"` | `"regular"` | Visual style variant (on unified `<NameIcon />` components). |
| `size` | `number \| string` | `24` | Width and height of the SVG in pixels (`24`) or CSS units (`"1.5rem"`). |
| `color` | `string` | `"currentColor"` | Primary icon color. For `variant="color"`, overrides `--slatico-primary-color` (default `#FF6040`). |
| `secondaryColor` | `string` | `undefined` | Secondary layer color (`--slatico-secondary-color`) for `duotone` and `color` (default `#000000`) variants. |
| `secondaryOpacity` | `number \| string` | `0.2` (in SVG) | Secondary tone opacity (`--slatico-secondary-opacity`) for `duotone` icons. |
| `title` | `string` | `undefined` | Accessible label. Renders `<title>`, `role="img"`, and `aria-label`. When omitted, sets `aria-hidden="true"`. |

## License

MIT © Infitus Creative Studio (`infitusofficial`)
