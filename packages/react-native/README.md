# `@slatico/react-native`

> **Status:** Implemented (Phase 2A — Local Build & Consumer Pack Verified, Private Until Release).

Official React Native SVG icon components for **Slatico by Infitus Creative Studio**, powered by `react-native-svg` across all 7 styles (`thin`, `light`, `regular`, `bold`, `fill`, `duotone`, `color`) with individual subpath imports (`@slatico/react-native/icons/<name>`).

## Usage

```tsx
import { SparkleIcon } from "@slatico/react-native/icons/sparkle";

export function Example() {
  return (
    <SparkleIcon
      variant="duotone"
      size={28}
      color="#4F46E5"
      secondaryColor="#EC4899"
      secondaryOpacity={0.35}
      title="Featured Sparkle"
    />
  );
}
```
