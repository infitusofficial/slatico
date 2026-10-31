# `@slatico/svg`

Optimized raw SVG assets, style sprite sheets, and programmatic SVG rendering utilities for **Slatico by Infitus Creative Studio** (`27` icon families × `7` styles = `189` variants).

## Installation

```bash
npm install @slatico/svg
# or
pnpm add @slatico/svg
# or
yarn add @slatico/svg
```

## Programmatic SVG Rendering

Use `renderSvgMarkup` to generate accessible, instance-scoped inline `<svg>` strings for HTML templates, SSR frameworks, emails, or static site generators:

```ts
import { renderSvgMarkup, getSvgAsset, getSvgSprite, getSpriteSymbolId } from "@slatico/svg";

// 1. Monochrome icon (Thin, Light, Regular, Bold, Fill)
const regularHtml = renderSvgMarkup("bell", "regular", {
  size: 24,
  color: "#010520",
  title: "Notifications"
});

// 2. Duotone icon with independent primary & secondary colors + opacity
const duotoneHtml = renderSvgMarkup("shield-check", "duotone", {
  size: 28,
  color: "#010520",
  secondaryColor: "#FF6040",
  secondaryOpacity: 0.25,
  title: "Verified Security"
});

// 3. Color icon with default brand palette (#FF6040 primary, #000000 secondary)
// or two custom colors via `color` and `secondaryColor`
const colorHtml = renderSvgMarkup("wallet", "color", {
  size: 32,
  color: "#FF6040",
  secondaryColor: "#010520",
  title: "Wallet"
});

// 4. Retrieve raw asset metadata or a complete style sprite sheet
const asset = getSvgAsset("arrow-up-right", "bold");
const regularSprite = getSvgSprite("regular");
const symbolId = getSpriteSymbolId("bell", "duotone"); // "slatico-duotone-bell"
```

## `RenderSvgOptions` Reference

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `size` | `number \| string` | `24` | Width and height of the `<svg>` element in pixels or CSS units. |
| `color` | `string` | `"currentColor"` | Primary color (`color` for monochrome/duotone; `--slatico-primary-color` override for `color` style). |
| `secondaryColor` | `string` | `undefined` | Secondary layer color (`--slatico-secondary-color`) for `duotone` and `color` styles. |
| `secondaryOpacity` | `number \| string` | `undefined` | Secondary tone opacity (`--slatico-secondary-opacity`, default `0.2`) for `duotone` icons. |
| `title` | `string` | `undefined` | Accessible label. Adds `<title>`, `role="img"`, and `aria-label`. When omitted, sets `aria-hidden="true"`. |
| `className` | `string` | `undefined` | Optional CSS class name(s) applied to the root `<svg>` element. |
| `idPrefix` | `string` | `undefined` | Optional unique suffix to scope internal SVG IDs across multiple DOM instances. |

## Raw SVG & Sprite Exports

- Individual SVGs: `@slatico/svg/icons/<style>/<name>.svg` (e.g. `@slatico/svg/icons/duotone/bell.svg`)
- Style Sprite Sheets: `@slatico/svg/sprites/slatico-<style>.svg` (e.g. `@slatico/svg/sprites/slatico-regular.svg`)

## License

MIT © Infitus Creative Studio (`infitusofficial`)
