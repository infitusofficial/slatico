import fs from "node:fs/promises";
import path from "node:path";
import { SLATICO_STYLES } from "../packages/core/src/types.js";
import { discoverAndValidateIcons } from "./icon-pipeline.js";
import { buildStyleSvgSprite } from "./generate-icons.js";

async function buildSvgPackageStaticAssets(): Promise<void> {
  const pkgRoot = process.cwd();
  const repoRoot = path.resolve(pkgRoot, "../..");
  const iconsDir = path.join(repoRoot, "icons");
  const distDir = path.join(pkgRoot, "dist");

  const result = await discoverAndValidateIcons(iconsDir, repoRoot);
  if (!result.valid) {
    throw new Error(`Icon validation failed during @slatico/svg asset build.`);
  }

  const distIconsDir = path.join(distDir, "icons");
  const distSpritesDir = path.join(distDir, "sprites");
  await fs.mkdir(distIconsDir, { recursive: true });
  await fs.mkdir(distSpritesDir, { recursive: true });

  for (const style of SLATICO_STYLES) {
    const styleOutDir = path.join(distIconsDir, style);
    await fs.mkdir(styleOutDir, { recursive: true });

    for (const family of result.families) {
      const variant = family.variants[style];
      await fs.writeFile(
        path.join(styleOutDir, `${family.name}.svg`),
        `${variant.optimizedSvg}\n`,
        "utf8"
      );
    }

    const spriteContent = buildStyleSvgSprite(result.families, style);
    await fs.writeFile(
      path.join(distSpritesDir, `slatico-${style}.svg`),
      `${spriteContent}\n`,
      "utf8"
    );
  }
}

buildSvgPackageStaticAssets().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
