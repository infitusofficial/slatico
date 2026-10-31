# `@slatico/web`

Framework-independent Custom Element (`<slatico-icon>`) with Shadow DOM encapsulation for **Slatico by Infitus Creative Studio** (`27` icon families across all `7` official styles = `189` variants).

Works in plain HTML, Astro, Svelte, Angular, Lit, Laravel Blade, WordPress, or any standards-compliant browser.

## Installation

```bash
npm install @slatico/web
# or
pnpm add @slatico/web
# or
yarn add @slatico/web
```

## Tree-Shakeable Registration

Register only the icons your page needs:

```ts
import { defineSlaticoIconElement, registerSlaticoIcons } from "@slatico/web";
import { bellIconDef } from "@slatico/web/icons/bell";
import { shieldCheckIconDef } from "@slatico/web/icons/shield-check";
import { walletIconDef } from "@slatico/web/icons/wallet";

registerSlaticoIcons(bellIconDef, shieldCheckIconDef, walletIconDef);
defineSlaticoIconElement();
```

Or register the entire 27-icon catalog at once:

```ts
import {
  ALL_WEB_ICON_DEFINITIONS,
  defineSlaticoIconElement,
  registerSlaticoIcons
} from "@slatico/web";

registerSlaticoIcons(...ALL_WEB_ICON_DEFINITIONS);
defineSlaticoIconElement();
```

## HTML Usage

```html
<!-- 1. Monochrome icon -->
<slatico-icon name="bell" variant="regular" size="24"></slatico-icon>

<!-- 2. Duotone icon with custom primary + secondary colors and opacity -->
<slatico-icon
  name="shield-check"
  variant="duotone"
  size="28"
  color="#010520"
  secondary-color="#FF6040"
  secondary-opacity="0.25"
  label="Security Verified"
></slatico-icon>

<!-- 3. Color icon with default palette or two custom colors -->
<slatico-icon
  name="wallet"
  variant="color"
  size="28"
  color="#FF6040"
  secondary-color="#010520"
  label="Wallet"
></slatico-icon>
```

## Observed Attributes (`<slatico-icon>`)

| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `name` | `SlaticoIconName` | — (required) | Canonical kebab-case icon family slug (e.g. `"bell"`, `"arrow-up-right"`). |
| `variant` | `SlaticoStyle` | `"regular"` | Style variant (`thin`, `light`, `regular`, `bold`, `fill`, `duotone`, `color`). |
| `size` | `number \| string` | `"24"` | Pixel size (`24`) or CSS length (`"1.5rem"`). |
| `color` | `string` | `"currentColor"` | Primary color (`color` for monochrome/duotone; `--slatico-primary-color` override for `color`). |
| `secondary-color` | `string` | `undefined` | Secondary tone color (`--slatico-secondary-color`) for `duotone` and `color` variants. |
| `secondary-opacity` | `number \| string` | `0.2` (in SVG) | Secondary tone opacity (`--slatico-secondary-opacity`) for `duotone` icons. |
| `label` | `string` | `undefined` | Accessible label (`role="img"` + `aria-label` + `<title>`). When omitted, `aria-hidden="true"` is set. |

## License

MIT © Infitus Creative Studio (`infitusofficial`)
