# Changelog

## 0.1.0

- Initial release of `com.infitus.slatico:slatico-android` for Android XML and Jetpack Compose.
- Includes all 23 Tier 1 production icon families across all 7 official styles (`Thin`, `Light`, `Regular`, `Bold`, `Fill`, `Duotone`, and `Color`), totaling 161 native Android `VectorDrawable` XML resources.
- Typed `SlaticoIconName`, `SlaticoStyle`, and `SlaticoDrawables` APIs with `@DrawableRes` annotations.
- `SlaticoIcon` Jetpack Compose composable supporting monochrome tinting, independent two-color `Duotone` customization (`color` + `secondaryColor` + `secondaryAlpha`), and intrinsic multicolor `Color` rendering.
- `SlaticoIconTheme` & `LocalSlaticoIconTheme` CompositionLocal for app-wide icon styling.
