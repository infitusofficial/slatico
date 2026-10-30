# Contributing to Slatico

Thank you for your interest in contributing to **Slatico by Infitus Creative Studio**.

## Core Principles

1. **No Fake Variants:** Every icon added to `icons/` must be genuinely authored across all **7 official styles** (`thin`, `light`, `regular`, `bold`, `fill`, `duotone`, `color`). Never copy-paste the same SVG into multiple style folders to bypass validation.
2. **Source of Truth:** `icons/<style>/<name>.svg` is the single source of truth. Never manually edit files inside `packages/*/src/generated/` or `packages/react/src/icons/`.
3. **Strict Validation:** All pull requests must pass `pnpm icons:validate`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.

## Adding or Updating an Icon

1. Author the 7 SVG files on a `0 0 24 24` viewBox using lowercase `kebab-case` filenames:
   - `icons/thin/<name>.svg` (`1px` stroke, `currentColor`)
   - `icons/light/<name>.svg` (`1.5px` stroke, `currentColor`)
   - `icons/regular/<name>.svg` (`2px` stroke, `currentColor`)
   - `icons/bold/<name>.svg` (`3px` stroke, `currentColor`)
   - `icons/fill/<name>.svg` (solid silhouette, `currentColor`)
   - `icons/duotone/<name>.svg` (layered `1.75px` primary stroke + secondary tone/opacity layer using `var(--slatico-secondary-color, currentColor)` or distinct secondary tone)
   - `icons/color/<name>.svg` (multicolor vector paths; prefix any `<defs>` IDs with `slatico-<name>-`)
2. Validate your SVG sources:
   ```bash
   pnpm icons:validate
   ```
3. Regenerate the catalog and package sources:
   ```bash
   pnpm icons:generate
   ```
4. Run the full verification suite:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```
