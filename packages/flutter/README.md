# `slatico_icons`

Official Flutter icon package for **Slatico by Infitus Creative Studio** — a modern, original, open-source icon system crafted on a unified `24x24` optical grid across **7 official styles**.

- **Brand:** Slatico by Infitus Creative Studio
- **Repository:** [github.com/infitusofficial/slatico](https://github.com/infitusofficial/slatico)
- **Package Name:** `slatico_icons`
- **License:** MIT
- **Tier 1 Collection:** `23` original icon families × `7` styles (`161` variants: `115` monochrome `IconData` constants + `46` vector SVG assets)

---

## Seven Official Styles & Rendering Architecture

| Style | Enum Value | Rendering Engine in Flutter | Construction |
| :--- | :--- | :--- | :--- |
| **Thin** | `SlaticoStyle.thin` | Bundled TTF (`Slatico Thin`) via `Icon` or `SlaticoIcon` | `1.0px` stroke |
| **Light** | `SlaticoStyle.light` | Bundled TTF (`Slatico Light`) via `Icon` or `SlaticoIcon` | `1.5px` stroke |
| **Regular** | `SlaticoStyle.regular` | Bundled TTF (`Slatico Regular`) via `Icon` or `SlaticoIcon` | `2.0px` stroke |
| **Bold** | `SlaticoStyle.bold` | Bundled TTF (`Slatico Bold`) via `Icon` or `SlaticoIcon` | `3.0px` stroke |
| **Fill** | `SlaticoStyle.fill` | Bundled TTF (`Slatico Fill`) via `Icon` or `SlaticoIcon` | Solid silhouette with negative spaces |
| **Duotone** | `SlaticoStyle.duotone` | Vector SVG (`flutter_svg`) via `SlaticoIcon` | Two-tone / opacity-layered vectors |
| **Color** | `SlaticoStyle.color` | Vector SVG (`flutter_svg`) via `SlaticoIcon` | Intrinsic multicolor fills & gradients |

---

## Installation

Add `slatico_icons` to your `pubspec.yaml`:

```yaml
dependencies:
  slatico_icons: ^0.1.0
```

---

## Usage

### 1. Monochrome Styles (`Thin`, `Light`, `Regular`, `Bold`, `Fill`) with Flutter's `Icon` Widget

All 115 monochrome variants (`23` families × `5` styles) are exposed as tree-shakeable `static const IconData` constants on `SlaticoIcons`:

```dart
import 'package:flutter/material.dart';
import 'package:slatico_icons/slatico_icons.dart';

class MonochromeExample extends StatelessWidget {
  const MonochromeExample({super.key});

  @override
  Widget build(BuildContext context) {
    return const Row(
      children: [
        Icon(SlaticoIcons.houseThin, size: 24, color: Colors.black87),
        Icon(SlaticoIcons.houseLight, size: 24, color: Colors.black87),
        Icon(SlaticoIcons.houseRegular, size: 24, color: Colors.blue),
        Icon(SlaticoIcons.bellBold, size: 24, color: Colors.indigo),
        Icon(SlaticoIcons.userFill, size: 24, color: Colors.teal),
      ],
    );
  }
}
```

### 2. Universal `SlaticoIcon` Widget (All 7 Styles Including `Duotone` & `Color`)

Use `SlaticoIcon` to render any style — especially `SlaticoStyle.duotone` (with customizable primary `color`, `secondaryColor`, and `secondaryOpacity`) and `SlaticoStyle.color` (preserving intrinsic multicolor artwork):

```dart
import 'package:flutter/material.dart';
import 'package:slatico_icons/slatico_icons.dart';

class SevenStyleExample extends StatelessWidget {
  const SevenStyleExample({super.key});

  @override
  Widget build(BuildContext context) {
    return const Wrap(
      spacing: 16,
      children: [
        // Duotone with independent primary & secondary colors
        SlaticoIcon(
          name: SlaticoIconName.house,
          style: SlaticoStyle.duotone,
          size: 24,
          color: Colors.black,
          secondaryColor: Colors.blue,
          secondaryOpacity: 0.25,
        ),

        // Multicolor vector variant (intrinsic colors preserved automatically)
        SlaticoIcon(
          name: SlaticoIconName.house,
          style: SlaticoStyle.color,
          size: 32,
          semanticLabel: 'Home dashboard',
        ),

        // Monochrome style via SlaticoIcon
        SlaticoIcon(
          name: SlaticoIconName.shieldCheck,
          style: SlaticoStyle.fill,
          size: 24,
          color: Colors.green,
        ),
      ],
    );
  }
}
```

### 3. Subtree Theming with `SlaticoIconTheme`

```dart
SlaticoIconTheme(
  data: const SlaticoIconThemeData(
    style: SlaticoStyle.duotone,
    size: 28,
    color: Color(0xFF1E293B),
    secondaryColor: Color(0xFF6366F1),
    secondaryOpacity: 0.3,
  ),
  child: const Row(
    children: [
      SlaticoIcon(name: SlaticoIconName.bell),
      SlaticoIcon(name: SlaticoIconName.wallet),
      SlaticoIcon(name: SlaticoIconName.lock),
    ],
  ),
)
```

---

## Accessibility

- By default (`semanticLabel == null`), `SlaticoIcon` marks icons as decorative (`excludeFromSemantics: true`) so screen readers do not announce redundant glyph descriptions next to text labels.
- When an icon conveys standalone meaning, provide `semanticLabel: 'Notifications'` on `SlaticoIcon` or `Icon`.

---

## License

MIT © Infitus Creative Studio
