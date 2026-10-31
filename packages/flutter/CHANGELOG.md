## 0.1.0

* Initial Tier 1 release preparation of `slatico_icons` for **Slatico by Infitus Creative Studio**.
* Added 27 original Tier 1 icon families across all 7 official styles (`189` total variants):
  * **Monochrome TTF Font Styles (`135` `IconData` constants):** `thin`, `light`, `regular`, `bold`, and `fill` via `SlaticoIcons.<name><Style>` with tree-shakeable `const IconData` definitions and stable Unicode PUA codepoints (`0xE001`–`0xE01C`) synchronized with `@slatico/font`.
  * **Vector SVG Styles (`54` SVG assets):** `duotone` (`27` SVGs) and `color` (`27` SVGs) rendered via `SlaticoIcon` and `flutter_svg`.
* Added `SlaticoIcon` widget supporting all 7 styles, custom `size`, primary `color`, Duotone `secondaryColor` and `secondaryOpacity`, dual-color `Color` customization (`color` + `secondaryColor`), and `semanticLabel` accessibility.
* Added `SlaticoIconTheme` and `SlaticoIconThemeData` for subtree-scoped icon styling defaults.
