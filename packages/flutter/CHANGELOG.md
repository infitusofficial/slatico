## 0.1.0

* Initial Tier 1 release preparation of `slatico_icons` for **Slatico by Infitus Creative Studio**.
* Added 23 original Tier 1 icon families across all 7 official styles (`161` total variants):
  * **Monochrome TTF Font Styles (`115` `IconData` constants):** `thin`, `light`, `regular`, `bold`, and `fill` via `SlaticoIcons.<name><Style>` with tree-shakeable `const IconData` definitions and stable Unicode PUA codepoints (`0xE001`–`0xE017`) synchronized with `@slatico/font`.
  * **Vector SVG Styles (`46` SVG assets):** `duotone` (`23` SVGs) and `color` (`23` SVGs) rendered via `SlaticoIcon` and `flutter_svg`.
* Added `SlaticoIcon` widget supporting all 7 styles, custom `size`, primary `color`, Duotone `secondaryColor` and `secondaryOpacity`, and `semanticLabel` accessibility.
* Added `SlaticoIconTheme` and `SlaticoIconThemeData` for subtree-scoped icon styling defaults.
