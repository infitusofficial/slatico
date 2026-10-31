import fs from "node:fs/promises";
import path from "node:path";

const TARGETS = [
  "packages/core/dist",
  "packages/svg/dist",
  "packages/react/dist",
  "packages/vue/dist",
  "packages/web/dist",
  "packages/font/dist",
  "packages/react-native/dist",
  "examples/react-native/dist",
  "examples/react-native/.metro-cache",
  "apps/website/.next",
  "apps/website/out"
];

async function clean(): Promise<void> {
  const root = process.cwd();
  for (const rel of TARGETS) {
    const fullPath = path.join(root, rel);
    await fs.rm(fullPath, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 100
    });
  }
  console.log("[Slatico Clean] Removed build outputs and caches.");
}

clean().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
