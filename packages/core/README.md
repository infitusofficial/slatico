# `@slatico/core`

Core TypeScript types, style specifications, naming utilities, and generated icon catalog metadata for **Slatico by Infitus Creative Studio**.

- **27 Tier 1 Icon Families** across **7 Official Architectural Styles** (`189` total variants: `thin`, `light`, `regular`, `bold`, `fill`, `duotone`, and `color`).
- Master optical grid specification (`24x24`).
- Strictly typed union types (`SlaticoIconName`, `SlaticoStyle`, `SlaticoTier`) and runtime validators (`isValidIconName`, `isValidSlaticoStyle`).

## Installation

```bash
npm install @slatico/core
# or
pnpm add @slatico/core
# or
yarn add @slatico/core
```

## Usage

```ts
import {
  ICON_CATALOG,
  ICON_NAMES,
  SLATICO_STYLES,
  SLATICO_STYLE_SPECS,
  getIconComponentName,
  isValidIconName,
  isValidSlaticoStyle,
  type SlaticoIconName,
  type SlaticoStyle
} from "@slatico/core";

console.log(ICON_CATALOG.totalIcons); // 27
console.log(ICON_CATALOG.totalVariants); // 189
console.log(SLATICO_STYLES); // ["thin", "light", "regular", "bold", "fill", "duotone", "color"]

if (isValidIconName("shield-check") && isValidSlaticoStyle("duotone")) {
  const componentName = getIconComponentName("shield-check", "duotone");
  // -> "ShieldCheckDuotoneIcon"
}
```

## Exported API

| Export | Kind | Description |
| :--- | :--- | :--- |
| `ICON_CATALOG` | `SlaticoCatalog` | Full generated catalog containing all 27 icon entries, tags, categories, and variant metadata. |
| `ICON_NAMES` | `readonly SlaticoIconName[]` | Sorted array of all 27 canonical kebab-case icon family slugs. |
| `SLATICO_STYLES` | `readonly SlaticoStyle[]` | All 7 official styles: `thin`, `light`, `regular`, `bold`, `fill`, `duotone`, `color`. |
| `SLATICO_STYLE_SPECS` | `Record<SlaticoStyle, SlaticoStyleSpec>` | Optical and rendering specifications for each style (including `supportsIconFont`). |
| `MASTER_VIEWBOX` | `"0 0 24 24"` | Canonical 24x24 viewBox coordinate system. |
| `isValidIconName(value)` |Type guard | Returns `true` if `value` is a valid `SlaticoIconName`. |
| `isValidSlaticoStyle(value)` | Type guard | Returns `true` if `value` is a valid `SlaticoStyle`. |
| `getIconComponentName(name, style?)` | Function | Converts an icon slug and optional style into its canonical PascalCase component name. |
| `toPascalCase(slug)` | Function | Converts a kebab-case slug (`"arrow-up-right"`) to PascalCase (`"ArrowUpRight"`). |

## License

MIT © Infitus Creative Studio (`infitusofficial`)
