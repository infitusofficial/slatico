# `@slatico/svg`

> **Status:** Implemented (Phase 2A — Local Build & Consumer Pack Verified, Private Until Release).

Optimized individual SVG files, variant-specific SVG sprites, stable symbol IDs, and programmatic SVG helpers for **Slatico by Infitus Creative Studio** across all 7 styles (`thin`, `light`, `regular`, `bold`, `fill`, `duotone`, `color`).

## Features

1. **Physical Optimized SVG Files:** `dist/icons/<style>/<name>.svg` (exported via `@slatico/svg/icons/<style>/<name>.svg`).
2. **Variant-Specific SVG Sprites:** `dist/sprites/slatico-<style>.svg` (exported via `@slatico/svg/sprites/slatico-<style>.svg`), using stable `<symbol id="slatico-<style>-<name>" viewBox="0 0 24 24">` IDs.
3. **Programmatic API:**
   - `getSvgAsset(name, style)` — Returns `{ name, style, symbolId, viewBox, svg, innerSvg }`.
   - `getSvgSprite(style)` — Returns the full `<svg><symbol .../></svg>` sprite sheet for a style.
   - `getSpriteSymbolId(name, style)` — Returns `"slatico-<style>-<name>"`.
   - `renderSvgMarkup(name, style, options)` — Renders a complete, accessible, instance-scoped `<svg>` string.
   - `scopeSvgIds(svgFragment, instanceScope)` — Rewrites `id="slatico-..."` and `url(#slatico-...)` to prevent DOM ID collisions.

## Vanilla HTML & External Sprite Usage

### 1. Inline Sprite Sheet (`<use href="#...">`)

Inject the style sprite into the `<body>` (or reference `/sprites/slatico-duotone.svg` hosted on the same origin) and reference symbols via `<use>`:

```html
<!-- Styleable with CSS color and Duotone custom properties -->
<svg
  width="28"
  height="28"
  viewBox="0 0 24 24"
  fill="none"
  style="color: #4F46E5; --slatico-secondary-color: #EC4899; --slatico-secondary-opacity: 0.35;"
  role="img"
  aria-label="Sparkle Icon"
>
  <use href="#slatico-duotone-sparkle"></use>
</svg>
```

> **External Sprite Compatibility Note:** Standard browsers require external `<use href="/path/to/slatico-regular.svg#slatico-regular-sparkle">` files to be served from the **same origin**; additionally, some browsers restrict `<linearGradient>` / `<mask>` references inside external `<use>` shadow trees for `color` icons. For `color` icons or cross-origin environments, inline the sprite markup (`getSvgSprite("color")`) or use `renderSvgMarkup("sparkle", "color", { idPrefix: "hero" })`.
