# `@slatico/web`

> **Status:** Implemented (Phase 2A — Local Build & Consumer Pack Verified, Private Until Release).

Lightweight, framework-independent native Custom Elements (`<slatico-icon>`) for **Slatico by Infitus Creative Studio** across all 7 styles.

## Usage

Register only the icons your page needs for optimal bundle size:

```ts
import { defineSlaticoIconElement, registerSlaticoIcons } from "@slatico/web";
import { sparkleIconDef } from "@slatico/web/icons/sparkle";

registerSlaticoIcons(sparkleIconDef);
defineSlaticoIconElement();
```

```html
<slatico-icon
  name="sparkle"
  variant="duotone"
  size="28"
  color="#4F46E5"
  secondary-color="#EC4899"
  secondary-opacity="0.35"
  label="Featured Sparkle"
></slatico-icon>
```
