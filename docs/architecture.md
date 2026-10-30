# Slatico Monorepo & Pipeline Architecture

## 1. Separation of Authored Sources vs. Generated Code

- **Authored SVG Masters:** Stored in `icons/{thin,light,regular,bold,fill,duotone,color}/*.svg`.
- **Pipeline Engine:** `scripts/icon-pipeline.ts` discovers files, validates directory structure and XML safety, enforces monochrome `currentColor` vs. multicolor rules, and optimizes SVGs via SVGO without stripping required IDs, gradients, clip paths, or masks.
- **Deterministic Codegen:** `scripts/generate-icons.ts` emits:
  - `packages/core/src/generated/catalog.ts`
  - `packages/svg/src/generated/svg-data.ts`
  - `packages/react/src/icons/*.tsx` and `packages/react/src/icons/index.ts`

## 2. Non-JavaScript Platform Boundary

Native packages (`packages/flutter`, `packages/android`, `packages/swift`) are intentionally excluded from `pnpm-workspace.yaml` and do not contain artificial `package.json` files. When implemented in Phase 3, they will use their native build manifests (`pubspec.yaml`, `build.gradle.kts`, and `Package.swift`).
