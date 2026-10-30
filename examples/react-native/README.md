# Slatico React Native Example (`@slatico/react-native-example`)

Minimal production verification and showcase application for **`@slatico/react-native`** (`0.1.0`), built with **React Native `0.79.2`**, **React `19.0.0`**, and **`react-native-svg` `15.11.2`**.

---

## Features Verified

- **All 23 Tier 1 Icon Families × 7 Official Styles (`161` Vector Variants):**
  - `thin`, `light`, `regular`, `bold`, `fill`, `duotone`, and `color`
- **Barrel & Subpath Imports:**
  - Barrel imports from `@slatico/react-native` (`BellIcon`, `HouseIcon`, `WalletIcon`, etc.)
  - Direct tree-shakeable subpath imports (`@slatico/react-native/icons/wallet`, `@slatico/react-native/icons/shield-check`)
- **Interactive Controls:**
  - Style picker across all 7 styles + full 161-variant comparison matrix toggle
  - Density-independent size presets (`16dp`, `20dp`, `24dp`, `32dp`, `40dp`, `48dp`)
  - Primary foreground color presets
  - Duotone secondary color and opacity (`15%`, `22%`, `35%`, `50%`) presets
  - Intrinsic multi-tone `color` preservation (`#FF6040` + `#000000`)
  - Light & Dark theme toggle
  - Search filtering across all 23 icon families

---

## Commands

From the monorepo root:

```bash
# Build workspace packages first
pnpm build:packages

# Typecheck the React Native example app
pnpm --filter @slatico/react-native-example typecheck

# Bundle production JS via Metro for Android and iOS
pnpm --filter @slatico/react-native-example bundle:android
pnpm --filter @slatico/react-native-example bundle:ios
```
