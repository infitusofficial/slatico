# Changelog

## 0.1.0

- Initial release preparation of `dev.slatico:slatico-android` for Android XML and Jetpack Compose.
- Includes all 27 Tier 1 production icon families across all 7 official styles (`Thin`, `Light`, `Regular`, `Bold`, `Fill`, `Duotone`, and `Color`), totaling 189 native Android `VectorDrawable` XML resources.
- Typed `SlaticoIconName`, `SlaticoStyle`, and `SlaticoDrawables` APIs with `@DrawableRes` annotations.
- `SlaticoIcon` Jetpack Compose composable supporting monochrome tinting, independent two-color `Duotone` customization (`color` + `secondaryColor` + `secondaryAlpha`), and dual-color `Color` customization (`color` + `secondaryColor`).
- `SlaticoIconTheme` & `LocalSlaticoIconTheme` CompositionLocal for app-wide icon styling.
