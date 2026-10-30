# `@slatico/font`

Production-ready icon font package for **Slatico by Infitus Creative Studio** — supporting traditional HTML websites, PHP, WordPress, Laravel, and any environment where developers prefer CSS-based icon fonts.

## Supported Monochrome Font Styles (5 Styles × 23 Icons = 115 Glyphs)

| Style | Font Family | Font Files (`dist/fonts/`) | CSS Class Pattern |
| :--- | :--- | :--- | :--- |
| **Thin** (`1px`) | `Slatico Thin` | `slatico-thin.{woff2,woff,ttf}` | `.slatico.slatico-<name>-thin` |
| **Light** (`1.5px`) | `Slatico Light` | `slatico-light.{woff2,woff,ttf}` | `.slatico.slatico-<name>-light` |
| **Regular** (`2px`) | `Slatico Regular` | `slatico-regular.{woff2,woff,ttf}` | `.slatico.slatico-<name>-regular` |
| **Bold** (`3px`) | `Slatico Bold` | `slatico-bold.{woff2,woff,ttf}` | `.slatico.slatico-<name>-bold` |
| **Fill** (solid) | `Slatico Fill` | `slatico-fill.{woff2,woff,ttf}` | `.slatico.slatico-<name>-fill` |

> **Why Duotone and Color use SVG instead of Icon Fonts:**
> `Duotone` relies on independent two-tone or opacity-layered vector paths (`--slatico-secondary-color`, `--slatico-secondary-opacity`), and `Color` relies on multi-stop gradients and distinct multi-color vector fills. Flattening them into ordinary single-layer monochrome fonts would destroy their visual fidelity. Use `@slatico/svg`, `@slatico/react`, `@slatico/vue`, `@slatico/web`, or `@slatico/react-native` for `Duotone` and `Color` styles.

## HTML & CSS Usage

```html
<link rel="stylesheet" href="node_modules/@slatico/font/dist/slatico.min.css">

<!-- Decorative icons -->
<i class="slatico slatico-house-regular" aria-hidden="true"></i>
<i class="slatico slatico-bell-bold" aria-hidden="true"></i>
<i class="slatico slatico-user-fill" aria-hidden="true"></i>

<!-- Custom sizing & color via standard CSS -->
<i class="slatico slatico-shield-check-fill" style="font-size: 32px; color: #10B981;" aria-hidden="true"></i>
```

## TypeScript & Node.js Metadata API

```ts
import {
  FONT_COMPATIBLE_STYLES,
  FONT_CODEPOINTS,
  FONT_GLYPHS,
  getFontClassName,
  getFontGlyph,
  getFontHtmlSnippet
} from "@slatico/font";

const glyph = getFontGlyph("house", "regular");
// => { iconName: "house", style: "regular", className: "slatico-house-regular", codepointHex: "0xE008", ... }

const html = getFontHtmlSnippet("bell", "bold");
// => '<i class="slatico slatico-bell-bold" aria-hidden="true"></i>'
```

## License

MIT © Infitus Creative Studio
