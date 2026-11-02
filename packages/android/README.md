# Slatico Android SDK (`dev.slatico:slatico-android`)

Official Android `VectorDrawable` XML and Jetpack Compose icon library for **Slatico by Infitus Creative Studio**.

Includes all **27 Tier 1 icon families** across all **7 official styles** (`Thin`, `Light`, `Regular`, `Bold`, `Fill`, `Duotone`, and `Color`), totaling **189 native Android vector drawables** plus typed Jetpack Compose composables.

---

## Installation

### Gradle (Kotlin DSL — `build.gradle.kts`)

```kotlin
dependencies {
    implementation("dev.slatico:slatico-android:0.1.0")
}
```

Requires `mavenCentral()` in your repositories and `minSdk 24`. The Maven group is `dev.slatico`, while the Kotlin APIs and resources use the `com.infitus.slatico` package (for example `import com.infitus.slatico.SlaticoIcon`).

### Local Monorepo Composite Build (contributors)

```kotlin
// settings.gradle.kts
includeBuild("../slatico/packages/android")
```

---

## Usage in Android XML Views

All 189 icons are packaged as native Android `VectorDrawable` XML resources using the naming convention:

```text
@drawable/slatico_<snake_case_name>_<style>
```

Examples:
- `@drawable/slatico_bell_regular`
- `@drawable/slatico_shield_check_duotone`
- `@drawable/slatico_wallet_color`
- `@drawable/slatico_arrow_up_right_bold`

```xml
<!-- Monochrome icon tinted via android:tint (app:tint also works with AppCompat) -->
<ImageView
    android:layout_width="24dp"
    android:layout_height="24dp"
    android:src="@drawable/slatico_bell_regular"
    android:contentDescription="@string/notifications"
    android:tint="#010520" />

<!-- Duotone icon (secondary layer preserves built-in 20% alpha) -->
<ImageView
    android:layout_width="24dp"
    android:layout_height="24dp"
    android:src="@drawable/slatico_shield_check_duotone"
    android:contentDescription="@null"
    android:tint="#010520" />

<!-- Color icon (do not set a tint so intrinsic #FF6040 + #000000 fills are preserved) -->
<ImageView
    android:layout_width="28dp"
    android:layout_height="28dp"
    android:src="@drawable/slatico_wallet_color"
    android:contentDescription="@string/wallet" />
```

---

## Usage in Jetpack Compose

```kotlin
import androidx.compose.foundation.layout.Row
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.infitus.slatico.SlaticoIcon
import com.infitus.slatico.SlaticoIconName
import com.infitus.slatico.SlaticoStyle

@Composable
fun HeaderIcons() = Row {
    // 1. Monochrome icon (uses LocalContentColor.current by default)
    SlaticoIcon(
        name = SlaticoIconName.BELL,
        style = SlaticoStyle.REGULAR,
        size = 24.dp,
        color = Color(0xFF010520),
        contentDescription = "Notifications"
    )

    // 2. Duotone icon with independent primary color, secondaryColor, and secondaryAlpha
    SlaticoIcon(
        name = SlaticoIconName.SHIELD_CHECK,
        style = SlaticoStyle.DUOTONE,
        size = 28.dp,
        color = Color(0xFF010520),
        secondaryColor = Color(0xFFFF6040),
        secondaryAlpha = 0.25f,
        contentDescription = "Security Verified"
    )

    // 3. Color icon with default brand palette (#FF6040 primary + #000000 secondary)
    SlaticoIcon(
        name = SlaticoIconName.WALLET,
        style = SlaticoStyle.COLOR,
        size = 28.dp,
        contentDescription = "Wallet"
    )

    // 4. Color icon with two custom colors (`color` + `secondaryColor`)
    SlaticoIcon(
        name = SlaticoIconName.BELL,
        style = SlaticoStyle.COLOR,
        size = 28.dp,
        color = Color(0xFFFF6040),
        secondaryColor = Color(0xFF010520),
        contentDescription = "Alerts"
    )
}
```

### App-Wide Styling with `SlaticoIconTheme`

```kotlin
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.infitus.slatico.SlaticoIcon
import com.infitus.slatico.SlaticoIconName
import com.infitus.slatico.SlaticoIconTheme
import com.infitus.slatico.SlaticoIconThemeData
import com.infitus.slatico.SlaticoStyle

@Composable
fun ThemedIcons() {
    SlaticoIconTheme(
        theme = SlaticoIconThemeData(
            style = SlaticoStyle.DUOTONE,
            size = 24.dp,
            color = Color(0xFF010520),
            secondaryColor = Color(0xFFFF6040),
            secondaryAlpha = 0.22f
        )
    ) {
        SlaticoIcon(name = SlaticoIconName.HOUSE)
        SlaticoIcon(name = SlaticoIconName.ARROW_UP_RIGHT)
    }
}
```

## `SlaticoIcon` Composable Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `name` | `SlaticoIconName` | required | Enumerated icon family (`SlaticoIconName.BELL`, `SlaticoIconName.ARROW_UP_RIGHT`, etc.). |
| `modifier` | `Modifier` | `Modifier` | Compose layout/semantics modifier. |
| `style` | `SlaticoStyle` | `LocalSlaticoIconTheme.current.style` (`REGULAR`) | Visual style variant (`THIN`, `LIGHT`, `REGULAR`, `BOLD`, `FILL`, `DUOTONE`, `COLOR`). |
| `size` | `Dp` | `LocalSlaticoIconTheme.current.size` (`24.dp`) | Width and height of the icon. |
| `color` | `Color` | `LocalSlaticoIconTheme.current.color` (`Color.Unspecified`) | Primary color for monochrome, `DUOTONE`, and `COLOR` styles. |
| `secondaryColor` | `Color` | `LocalSlaticoIconTheme.current.secondaryColor` (`Color.Unspecified`) | Secondary tone color for `DUOTONE` and `COLOR` styles. |
| `secondaryAlpha` | `Float` | `LocalSlaticoIconTheme.current.secondaryAlpha` (`0.22f`) | Secondary layer alpha (`0f..1f`) for `DUOTONE` icons. |
| `contentDescription` | `String?` | `null` | Accessibility TalkBack description (`null` marks the icon decorative). |

## License

MIT © Infitus Creative Studio (`infitusofficial`)
