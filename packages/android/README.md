# Slatico Icons for Android (`com.infitus.slatico:slatico-android`)

Official Android native `VectorDrawable` and Jetpack Compose icon library for **Slatico by Infitus Creative Studio**.

- **23 Tier 1 Production Icon Families**
- **7 Architectural Styles per Icon (`161` Native `VectorDrawable` XML Resources):**
  - `Thin` (1px optical stroke geometry)
  - `Light` (1.5px optical stroke geometry)
  - `Regular` (2px optical stroke geometry)
  - `Bold` (3px optical stroke geometry)
  - `Fill` (Solid silhouette with preserved negative spaces via `evenOdd` fill type)
  - `Duotone` (Two-layer primary + translucent secondary depth, supporting both native XML drawables and dynamic two-color Jetpack Compose customization)
  - `Color` (Full-color semantic multi-tone vectors)

---

## Requirements

- **Minimum Android SDK:** `API 24` (Android 7.0 Nougat) — natively supports `android:fillType="evenOdd"` for crisp compound cutouts and inline `VectorDrawable` attributes without build-time PNG rasterization.
- **Compile SDK:** `API 35`
- **Kotlin:** `2.0+`
- **Jetpack Compose:** BOM `2024.12.01` / Compose UI `1.7+`

---

## Installation

Add the dependency in your module's `build.gradle.kts`:

```kotlin
dependencies {
    implementation("com.infitus.slatico:slatico-android:0.1.0")
}
```

---

## 1. Android XML Layout Usage

All 161 icons are packaged as standard Android `VectorDrawable` XML resources using the naming convention `@drawable/slatico_<icon_snake_name>_<style>`:

```xml
<!-- Monochrome (Thin, Light, Regular, Bold, Fill) with tint -->
<ImageView
    android:layout_width="24dp"
    android:layout_height="24dp"
    android:src="@drawable/slatico_house_regular"
    android:tint="@color/primary"
    android:contentDescription="@string/home" />

<!-- Duotone (retains built-in 22% secondary layer alpha) -->
<ImageView
    android:layout_width="24dp"
    android:layout_height="24dp"
    android:src="@drawable/slatico_shield_check_duotone"
    android:tint="@color/primary"
    android:contentDescription="@string/verified" />

<!-- Color (renders intrinsic multi-tone palette — omit android:tint) -->
<ImageView
    android:layout_width="24dp"
    android:layout_height="24dp"
    android:src="@drawable/slatico_wallet_color"
    android:contentDescription="@string/wallet" />
```

---

## 2. Jetpack Compose Usage

### Direct `painterResource` Usage

```kotlin
import androidx.compose.foundation.Image
import androidx.compose.material3.Icon
import androidx.compose.ui.res.painterResource
import com.infitus.slatico.R

// Monochrome / Fill / single-tint Duotone
Icon(
    painter = painterResource(R.drawable.slatico_house_regular),
    contentDescription = "Home"
)

// Multicolor artwork
Image(
    painter = painterResource(R.drawable.slatico_house_color),
    contentDescription = "Home"
)
```

### Unified `SlaticoIcon` Composable (All 7 Styles)

```kotlin
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.infitus.slatico.SlaticoIcon
import com.infitus.slatico.SlaticoIconName
import com.infitus.slatico.SlaticoStyle

// 1. Monochrome styles (THIN, LIGHT, REGULAR, BOLD, FILL)
SlaticoIcon(
    name = SlaticoIconName.HOUSE,
    style = SlaticoStyle.REGULAR,
    size = 24.dp,
    color = Color(0xFF2563EB),
    contentDescription = "Home"
)

// 2. Duotone with independent primary & secondary colors
SlaticoIcon(
    name = SlaticoIconName.SHIELD_CHECK,
    style = SlaticoStyle.DUOTONE,
    size = 28.dp,
    color = Color(0xFF4F46E5),
    secondaryColor = Color(0xFF06B6D4),
    secondaryAlpha = 0.28f,
    contentDescription = "Security Verified"
)

// 3. Color style (preserves intrinsic multi-tone palette automatically)
SlaticoIcon(
    name = SlaticoIconName.WALLET,
    style = SlaticoStyle.COLOR,
    size = 32.dp,
    contentDescription = "Wallet"
)
```

---

## 3. Programmatic Kotlin `@DrawableRes` Lookup

```kotlin
import com.infitus.slatico.SlaticoDrawables
import com.infitus.slatico.SlaticoIconName
import com.infitus.slatico.SlaticoStyle

// Direct typed property access:
val houseRegularRes: Int = SlaticoDrawables.houseRegular

// Dynamic lookup by enum or kebab-case string:
val dynamicRes: Int = SlaticoDrawables.of(SlaticoIconName.CREDIT_CARD, SlaticoStyle.DUOTONE)
val bySlugRes: Int? = SlaticoDrawables.fromKebabName("trend-up", SlaticoStyle.BOLD)
```

---

## License

MIT © Infitus Creative Studio
