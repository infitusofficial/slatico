import fs from "node:fs/promises";
import path from "node:path";
import {
  buildJsonGlyphManifest,
  compileStyleFontBuffers,
  FONT_FILE_BASENAMES,
  FONT_MONOCHROME_STYLES,
  generateSlaticoFontCss,
  loadAndSyncCodepointsManifest
} from "./font-compiler.js";
import { discoverAndValidateIcons } from "./icon-pipeline.js";

async function buildFontPackageAssets(): Promise<void> {
  const pkgRoot = process.cwd();
  const repoRoot = path.resolve(pkgRoot, "../..");
  const iconsDir = path.join(repoRoot, "icons");
  const codepointsPath = path.join(pkgRoot, "codepoints.json");
  const distDir = path.join(pkgRoot, "dist");
  const fontsOutDir = path.join(distDir, "fonts");

  const result = await discoverAndValidateIcons(iconsDir, repoRoot);
  if (!result.valid) {
    throw new Error("Icon validation failed during @slatico/font asset build.");
  }

  const manifest = await loadAndSyncCodepointsManifest(codepointsPath, result.families);

  await fs.mkdir(fontsOutDir, { recursive: true });

  for (const style of FONT_MONOCHROME_STYLES) {
    const fileBase = FONT_FILE_BASENAMES[style];
    const buffers = await compileStyleFontBuffers(style, result.families, manifest);

    await fs.writeFile(path.join(fontsOutDir, `${fileBase}.ttf`), buffers.ttf);
    await fs.writeFile(path.join(fontsOutDir, `${fileBase}.woff`), buffers.woff);
    await fs.writeFile(path.join(fontsOutDir, `${fileBase}.woff2`), buffers.woff2);
  }

  const { css, minCss } = generateSlaticoFontCss(result.families, manifest, "./fonts");
  await fs.writeFile(path.join(distDir, "slatico.css"), css, "utf8");
  await fs.writeFile(path.join(distDir, "slatico.min.css"), minCss, "utf8");

  const jsonManifest = buildJsonGlyphManifest(result.families, manifest);
  await fs.writeFile(
    path.join(distDir, "slatico-glyphs.json"),
    `${JSON.stringify(jsonManifest, null, 2)}\n`,
    "utf8"
  );

  console.log(
    `[@slatico/font] Built 5 style font families (${FONT_MONOCHROME_STYLES.join(
      ", "
    )}) × ${result.families.length} glyphs = ${
      result.families.length * FONT_MONOCHROME_STYLES.length
    } total glyphs in TTF, WOFF, WOFF2, CSS, Minified CSS, and JSON manifest.`
  );
}

buildFontPackageAssets().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
