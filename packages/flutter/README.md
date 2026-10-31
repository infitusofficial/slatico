# `slatico_icons`

Official Flutter icon package for **Slatico by Infitus Creative Studio** — a modern 7-style vector icon system engineered on a unified `24×24` optical grid.

## Architecture Overview

`slatico_icons` provides **27 Tier 1 icon families** across all **7 official Slatico styles** (`189` total variants) using a hybrid rendering architecture tailored for Flutter:

| Style | Rendering Engine | Flutter API | Count |
| :--- | :--- | :--- | :--- |
| **Thin** (`thin`) | Native TTF Font (`Slatico Thin`) | `Icon(SlaticoIcons.<name>Thin)` or `SlaticoIcon` | 27 |
| **Light** (`light`) | Native TTF Font (`Slatico Light`) | `Icon(SlaticoIcons.<name>Light)` or `SlaticoIcon` | 27 |
| **Regular** (`regular`) | Native TTF Font (`Slatico Regular`) | `Icon(SlaticoIcons.<name>Regular)` or `SlaticoIcon` | 27 |
| **Bold** (`bold`) | Native TTF Font (`Slatico Bold`) | `Icon(SlaticoIcons.<name>Bold)` or `SlaticoIcon` | 27 |
| **Fill** (`fill`) | Native TTF Font (`Slatico Fill`) | `Icon(SlaticoIcons.<name>Fill)` or `SlaticoIcon` | 27 |
| **Duotone** (`duotone`) | Two-Layer Vector SVG (`flutter_svg`) | `SlaticoIcon(name: ..., style: SlaticoStyle.duotone)` | 27 |
| **Color** (`color`) | Dual-Tone Brand Vector SVG (`flutter_svg`) | `SlaticoIcon(name: ..., style: SlaticoStyle.color)` | 27 |

## Installation

Add `slatico_icons` to your `pubspec.yaml`:

```yaml
dependencies:
  slatico_icons: ^0.1.0
```

Or install via the Flutter CLI:

```bash
flutter pub add slatico_icons
```

## Quick Start

### 1. Native `IconData` (Monochrome Styles: Thin, Light, Regular, Bold, Fill)

```dart
import 'package:flutter/material.dart';
import 'package:slatico_icons/slatico_icons.dart';

class MonochromeExample extends StatelessWidget {
  const MonochromeExample({super.key});

  @override
  Widget build(BuildContext context) {
    return const Row(
      children: [
        Icon(SlaticoIcons.houseRegular, size: 24),
        Icon(SlaticoIcons.bellThin, size: 24),
        Icon(SlaticoIcons.shieldCheckBold, size: 24, color: Color(0xFF010520)),
        Icon(SlaticoIcons.arrowUpRightFill, size: 24, color: Color(0xFFFF6040)),
      ],
    );
  }
}
```

### 2. Unified `SlaticoIcon` Widget (All 7 Styles Including Duotone & Color)

```dart
import 'package:flutter/material.dart';
import 'package:slatico_icons/slatico_icons.dart';

class AllStylesExample extends StatelessWidget {
  const AllStylesExample({super.key});

  @override
  Widget build(BuildContext context) {
    return const Row(
      children: [
        // 1. Monochrome (automatically delegates to native Flutter Icon + TTF)
        SlaticoIcon(
          name: SlaticoIconName.bell,
          style: SlaticoStyle.regular,
          size: 24,
          color: Color(0xFF010520),
        ),

        // 2. Duotone with independent primary color, secondaryColor, and secondaryOpacity
        SlaticoIcon(
          name: SlaticoIconName.shieldCheck,
          style: SlaticoStyle.duotone,
          size: 28,
          color: Color(0xFF010520),
          secondaryColor: Color(0xFFFF6040),
          secondaryOpacity: 0.25,
          semanticLabel: 'Verified Security',
        ),

        // 3. Color with default brand palette (#FF6040 primary + #000000 secondary)
        SlaticoIcon(
          name: SlaticoIconName.wallet,
          style: SlaticoStyle.color,
          size: 28,
          semanticLabel: 'Wallet',
        ),

        // 4. Color with custom primary `color` and `secondaryColor`
        SlaticoIcon(
          name: SlaticoIconName.bell,
          style: SlaticoStyle.color,
          size: 28,
          color: Color(0xFFFF6040),
          secondaryColor: Color(0xFF010520),
          semanticLabel: 'Notifications',
        ),
      ],
    );
  }
}
```

### 3. Subtree Defaults with `SlaticoIconTheme`

```dart
SlaticoIconTheme(
  data: const SlaticoIconThemeData(
    style: SlaticoStyle.duotone,
    size: 24,
    color: Color(0xFF010520),
    secondaryColor: Color(0xFFFF6040),
    secondaryOpacity: 0.22,
  ),
  child: const Row(
    children: [
      SlaticoIcon(name: SlaticoIconName.bell),
      SlaticoIcon(name: SlaticoIconName.layoutDashboard),
      SlaticoIcon(name: SlaticoIconName.arrowUpRight),
    ],
  ),
)
```

## `SlaticoIcon` Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `name` | `SlaticoIconName` | required | Enumerated Slatico icon family (`SlaticoIconName.bell`, `SlaticoIconName.arrowUpRight`, etc.). |
| `style` | `SlaticoStyle?` | `SlaticoStyle.regular` | Style variant (`thin`, `light`, `regular`, `bold`, `fill`, `duotone`, `color`). |
| `size` | `double?` | `24.0` | Logical pixel width and height. |
| `color` | `Color?` | `IconTheme.of(context).color` (`#FF6040` in `color`) | Primary color for monochrome, `duotone`, and `color` styles. |
| `secondaryColor` | `Color?` | `color` (`#000000` in `color`) | Secondary tone color for `duotone` and `color` styles. |
| `secondaryOpacity` | `double?` | `0.2` (authored SVG opacity) | Opacity (`0.0`–`1.0`) for the secondary layer in `SlaticoStyle.duotone`. |
| `semanticLabel` | `String?` | `null` | Screen reader label (TalkBack / VoiceOver). When `null`, icon is excluded from semantics. |

## License

MIT © Infitus Creative Studio (`infitusofficial`)
