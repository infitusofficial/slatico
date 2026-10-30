# `@slatico/vue`

> **Status:** Implemented (Phase 2A — Local Build & Consumer Pack Verified, Private Until Release).

Official tree-shakeable Vue 3 icon components for **Slatico by Infitus Creative Studio**, supporting all 7 styles (`thin`, `light`, `regular`, `bold`, `fill`, `duotone`, `color`), Duotone customization (`secondaryColor`, `secondaryOpacity`), SSR-safe unique SVG ID scoping (`useId`), and individual icon subpath imports (`@slatico/vue/icons/<name>`).

## Usage

```vue
<script setup lang="ts">
import { SparkleIcon, SparkleDuotoneIcon } from "@slatico/vue/icons/sparkle";
</script>

<template>
  <SparkleIcon variant="regular" :size="24" color="#4F46E5" />
  <SparkleDuotoneIcon
    :size="32"
    color="#059669"
    secondary-color="#F59E0B"
    :secondary-opacity="0.35"
    title="Verified Sparkle"
  />
</template>
```
