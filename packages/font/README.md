# `@slatico/font`

Production-ready monochrome icon fonts (`WOFF2`, `WOFF`, and `TTF`), CSS stylesheet, and deterministic Unicode Private Use Area (`U+E001`–`U+E01C`) codepoint metadata for **Slatico by Infitus Creative Studio**.

## Included Styles (`135` Glyphs Total)

Monochrome vector styles compiled into dedicated font families (`27` icons per style):

| Style | Font Family Name | CSS Class Pattern | Files (`WOFF2`, `WOFF`, `TTF`) |
| :--- | :--- | :--- | :--- |
| `thin` | `Slatico Thin` | `slatico slatico-<name>-thin` | `slatico-thin.{woff2,woff,ttf}` |
| `light` | `Slatico Light` | `slatico slatico-<name>-light` | `slatico-light.{woff2,woff,ttf}` |
| `regular` | `Slatico Regular` | `slatico slatico-<name>-regular` | `slatico-regular.{woff2,woff,ttf}` |
| `bold` | `Slatico Bold` | `slatico slatico-<name>-bold` | `slatico-bold.{woff2,woff,ttf}` |
| `fill` | `Slatico Fill` | `slatico slatico-<name>-fill` | `slatico-fill.{woff2,woff,ttf}` |

> **Architectural Note:** `duotone` and `color` styles use multi-layer opacity and dual-color fills that cannot be represented in single-color glyph tables. For `duotone` and `color` icons, use `@slatico/svg`, `@slatico/react`, `@slatico/vue`, or `@slatico/web`.

## Installation

```bash
npm install @slatico/font
# or
pnpm add @slatico/font
# or
yarn add @slatico/font
```

## HTML & CSS Usage

Import `@slatico/font/slatico.css` in your bundler entry or link it in HTML:

```ts
import "@slatico/font/slatico.css";
```

Render any monochrome icon using the `slatico` base class and `slatico-<name>-<style>` modifier:

```html
<!-- Decorative icons (hidden from screen readers) -->
<i class="slatico slatico-bell-regular" aria-hidden="true"></i>
<i class="slatico slatico-shield-check-bold" style="font-size: 28px; color: #FF6040;" aria-hidden="true"></i>
<i class="slatico slatico-arrow-up-right-fill" aria-hidden="true"></i>

<!-- Semantic accessible icon -->
<i class="slatico slatico-wallet-regular" role="img" aria-label="Account Wallet"></i>
```

## Programmatic TypeScript Helpers

```ts
import {
  FONT_CODEPOINTS,
  getFontClassName,
  getFontGlyph,
  getFontHtmlSnippet
} from "@slatico/font";

const className = getFontClassName("bell", "regular");
// -> "slatico slatico-bell-regular"

const html = getFontHtmlSnippet("bell", "bold", {
  title: "Notifications"
});
// -> '<i class="slatico slatico-bell-bold" role="img" aria-label="Notifications"></i>'

const glyph = getFontGlyph("house", "fill");
// -> { iconName: "house", style: "fill", codepoint: 57357, codepointHex: "E00D", ... }
```

## License

MIT © Infitus Creative Studio (`infitusofficial`)
