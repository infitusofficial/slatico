import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@slatico/core": path.resolve(import.meta.dirname, "packages/core/src/index.ts"),
      "@slatico/svg": path.resolve(import.meta.dirname, "packages/svg/src/index.ts"),
      "@slatico/react": path.resolve(import.meta.dirname, "packages/react/src/index.ts"),
      "@slatico/vue": path.resolve(import.meta.dirname, "packages/vue/src/index.ts"),
      "@slatico/web": path.resolve(import.meta.dirname, "packages/web/src/index.ts"),
      "@slatico/react-native": path.resolve(import.meta.dirname, "packages/react-native/src/index.ts"),
      "react-native-svg": path.resolve(import.meta.dirname, "tests/mocks/react-native-svg.ts")
    }
  },
  test: {
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    environment: "node",
    globals: false
  }
});
