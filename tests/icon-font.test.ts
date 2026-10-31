import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const requireFromTest = createRequire(import.meta.url);
const opentype = requireFromTest("opentype.js") as {
  parse(buffer: ArrayBuffer): {
    unitsPerEm: number;
    charToGlyph(char: string): {
      unicode?: number;
      advanceWidth?: number;
      getPath(x: number, y: number, fontSize: number): {
        toPathData(decimalPlaces?: number): string;
      };
    };
  };
};
import { ICON_NAMES } from "../packages/core/src/index.js";
import {
  canCompileStyleToMonochromeFont,
  FONT_CODEPOINT_MANIFEST,
  FONT_CODEPOINTS,
  FONT_COMPATIBLE_STYLES,
  FONT_EXCLUDED_STYLES,
  FONT_FAMILIES,
  FONT_FILE_BASENAMES,
  FONT_GLYPHS,
  getFontClassName,
  getFontGlyph,
  getFontHtmlSnippet,
  resolveStableCodepointManifest,
  SLATICO_FONT_PACKAGE_STATUS,
  type SlaticoCodepointManifest
} from "../packages/font/src/index.js";
import {
  compileStyleFontBuffers,
  generateSlaticoFontCss
} from "../scripts/font-compiler.js";
import { discoverAndValidateIcons } from "../scripts/icon-pipeline.js";

const execFileAsync = promisify(execFile);

describe("Phase 2B: @slatico/font Monochrome Icon Font System", () => {
  it("supports the 5 monochrome styles (27 families × 5 styles = 135 glyphs) and excludes Duotone, Color, and demo icons", () => {
    expect(SLATICO_FONT_PACKAGE_STATUS).toBe("implemented");
    expect(FONT_COMPATIBLE_STYLES).toEqual(["thin", "light", "regular", "bold", "fill"]);
    expect(FONT_EXCLUDED_STYLES).toEqual(["duotone", "color"]);

    for (const style of FONT_COMPATIBLE_STYLES) {
      expect(canCompileStyleToMonochromeFont(style)).toBe(true);
    }
    expect(canCompileStyleToMonochromeFont("duotone")).toBe(false);
    expect(canCompileStyleToMonochromeFont("color")).toBe(false);

    expect(Object.keys(FONT_CODEPOINTS).length).toBe(27);
    expect(Object.keys(FONT_CODEPOINTS).sort()).toEqual([...ICON_NAMES].sort());
    expect(FONT_GLYPHS.length).toBe(135);

    // Ensure demo icons are excluded
    expect("cube" in FONT_CODEPOINTS).toBe(false);
    expect("sparkle" in FONT_CODEPOINTS).toBe(false);
    expect(FONT_GLYPHS.some((g) => (g.iconName as string) === "cube")).toBe(false);
    expect(FONT_GLYPHS.some((g) => (g.iconName as string) === "sparkle")).toBe(false);
  });

  it("maintains a stable, deterministic Unicode PUA mapping that never changes existing codepoints or reuses retired codepoints", () => {
    expect(FONT_CODEPOINTS.bell).toBe("0xE001");
    expect(FONT_CODEPOINTS.house).toBe("0xE008");
    expect(FONT_CODEPOINTS.user).toBe("0xE016");
    expect(FONT_CODEPOINTS.wallet).toBe("0xE017");
    expect(FONT_CODEPOINTS["arrow-down"]).toBe("0xE018");
    expect(FONT_CODEPOINTS["arrow-up"]).toBe("0xE019");
    expect(FONT_CODEPOINTS["arrow-up-left"]).toBe("0xE01A");
    expect(FONT_CODEPOINTS["arrow-up-right"]).toBe("0xE01B");
    expect(FONT_CODEPOINT_MANIFEST.nextCodepoint).toBe("0xE01C");

    // Simulate adding future Tier 2 / Tier 3 icons that sort BEFORE "bell" alphabetically (e.g. "anchor", "archive")
    const expandedNames = ["anchor", "archive", ...ICON_NAMES, "zap"].sort();
    const afterAddition = resolveStableCodepointManifest(
      FONT_CODEPOINT_MANIFEST,
      expandedNames
    );

    // Existing Tier 1 codepoints must remain 100% unchanged despite alphabetical insertion at index 0
    for (const name of ICON_NAMES) {
      expect(afterAddition.codepoints[name]).toBe(FONT_CODEPOINTS[name]);
    }

    // Newly added icons receive sequential codepoints starting at 0xE01C
    expect(afterAddition.codepoints.anchor).toBe("0xE01C");
    expect(afterAddition.codepoints.archive).toBe("0xE01D");
    expect(afterAddition.codepoints.zap).toBe("0xE01E");
    expect(afterAddition.nextCodepoint).toBe("0xE01F");

    // Simulate retiring "archive" (0xE01D) and adding "bookmark": 0xE01D must move to retiredCodepoints and never be reused
    const afterRetirement = resolveStableCodepointManifest(
      afterAddition,
      ["anchor", ...ICON_NAMES, "zap", "bookmark"].sort()
    );
    expect(afterRetirement.codepoints.archive).toBeUndefined();
    expect(afterRetirement.retiredCodepoints).toContain("0xE01D");
    expect(afterRetirement.codepoints.bookmark).toBe("0xE01F");
    expect(afterRetirement.nextCodepoint).toBe("0xE020");

    // Verify determinism across repeated calls
    const repeatCall = resolveStableCodepointManifest(
      afterAddition,
      ["anchor", ...ICON_NAMES, "zap", "bookmark"].sort()
    );
    expect(repeatCall).toEqual(afterRetirement);
  });

  it("provides predictable CSS class names, HTML snippet helpers, and valid slatico.css / slatico.min.css stylesheets", async () => {
    expect(getFontClassName("house", "regular")).toBe("slatico slatico-house-regular");
    expect(getFontClassName("bell", "bold")).toBe("slatico slatico-bell-bold");
    expect(getFontClassName("user", "fill")).toBe("slatico slatico-user-fill");

    expect(getFontHtmlSnippet("house", "regular")).toBe(
      '<i class="slatico slatico-house-regular" aria-hidden="true"></i>'
    );
    expect(getFontHtmlSnippet("bell", "bold", { title: "Notifications" })).toBe(
      '<i class="slatico slatico-bell-bold" role="img" aria-label="Notifications"></i>'
    );

    const repoRoot = process.cwd();
    const cssPath = path.join(repoRoot, "packages/font/dist/slatico.css");
    const minCssPath = path.join(repoRoot, "packages/font/dist/slatico.min.css");
    const jsonManifestPath = path.join(repoRoot, "packages/font/dist/slatico-glyphs.json");

    const [css, minCss, rawManifest] = await Promise.all([
      fs.readFile(cssPath, "utf8"),
      fs.readFile(minCssPath, "utf8"),
      fs.readFile(jsonManifestPath, "utf8")
    ]);

    expect(css.length).toBeGreaterThan(1000);
    expect(minCss.length).toBeGreaterThan(500);
    expect(minCss.length).toBeLessThan(css.length);

    // Check @font-face declarations for all 5 style families
    for (const style of FONT_COMPATIBLE_STYLES) {
      const familyName = FONT_FAMILIES[style];
      const fileBase = FONT_FILE_BASENAMES[style];
      expect(css).toContain(`font-family: "${familyName}";`);
      expect(css).toContain(`url("./fonts/${fileBase}.woff2") format("woff2")`);
      expect(css).toContain(`url("./fonts/${fileBase}.woff") format("woff")`);
      expect(css).toContain(`url("./fonts/${fileBase}.ttf") format("truetype")`);
    }

    // Check all 115 glyph class rules resolve to their expected font family and codepoint escape
    for (const glyph of FONT_GLYPHS) {
      expect(css).toContain(`.${glyph.className} {`);
      expect(css).toContain(`.${glyph.className}::before {\n  content: "${glyph.cssEscape}";\n}`);
      expect(minCss).toContain(`.${glyph.className}::before{content:"${glyph.cssEscape}"}`);
    }

    const parsedManifest = JSON.parse(rawManifest) as {
      totalFamilies: number;
      totalStyles: number;
      totalGlyphs: number;
      supportedStyles: string[];
      excludedStyles: string[];
      glyphs: unknown[];
    };
    expect(parsedManifest.totalFamilies).toBe(27);
    expect(parsedManifest.totalStyles).toBe(5);
    expect(parsedManifest.totalGlyphs).toBe(135);
    expect(parsedManifest.supportedStyles).toEqual(["thin", "light", "regular", "bold", "fill"]);
    expect(parsedManifest.excludedStyles).toEqual(["duotone", "color"]);
    expect(parsedManifest.glyphs.length).toBe(135);
  });

  it("generates valid, non-empty, deterministic TTF, WOFF, and WOFF2 font files with intact negative space contours", async () => {
    const repoRoot = process.cwd();
    const fontsDir = path.join(repoRoot, "packages/font/dist/fonts");

    for (const style of FONT_COMPATIBLE_STYLES) {
      const fileBase = FONT_FILE_BASENAMES[style];
      const ttfPath = path.join(fontsDir, `${fileBase}.ttf`);
      const woffPath = path.join(fontsDir, `${fileBase}.woff`);
      const woff2Path = path.join(fontsDir, `${fileBase}.woff2`);

      const [ttfBuf, woffBuf, woff2Buf] = await Promise.all([
        fs.readFile(ttfPath),
        fs.readFile(woffPath),
        fs.readFile(woff2Path)
      ]);

      expect(ttfBuf.byteLength).toBeGreaterThan(2000);
      expect(woffBuf.byteLength).toBeGreaterThan(1000);
      expect(woff2Buf.byteLength).toBeGreaterThan(800);

      // Verify WOFF ("wOFF") and WOFF2 ("wOF2") magic headers
      expect(woffBuf.subarray(0, 4).toString("ascii")).toBe("wOFF");
      expect(woff2Buf.subarray(0, 4).toString("ascii")).toBe("wOF2");

      // Parse TTF with opentype.js and verify every single one of the 23 glyphs has valid vector contours
      const font = opentype.parse(
        ttfBuf.buffer.slice(ttfBuf.byteOffset, ttfBuf.byteOffset + ttfBuf.byteLength)
      );
      expect(font.unitsPerEm).toBe(1200);

      for (const iconName of ICON_NAMES) {
        const glyphMeta = getFontGlyph(iconName, style);
        const otGlyph = font.charToGlyph(glyphMeta.unicodeChar);
        expect(otGlyph).toBeDefined();
        expect(otGlyph.unicode).toBe(glyphMeta.codepointNumber);
        expect(otGlyph.advanceWidth).toBe(1200);

        const pathData = otGlyph.getPath(0, 1200, 1200).toPathData(2);
        expect(pathData.length).toBeGreaterThan(10);
      }

      // Specifically check fill icons with interior cutouts (credit-card, lock, pencil, trash, wallet) have multiple contours (M commands)
      if (style === "fill") {
        for (const cutoutIcon of ["credit-card", "lock", "pencil", "trash", "wallet"] as const) {
          const glyphMeta = getFontGlyph(cutoutIcon, "fill");
          const otGlyph = font.charToGlyph(glyphMeta.unicodeChar);
          const pathData = otGlyph.getPath(0, 1200, 1200).toPathData(2);
          const moveCount = (pathData.match(/M/g) ?? []).length;
          expect(moveCount).toBeGreaterThanOrEqual(2);
        }
      }
    }

    // Verify deterministic font compilation across repeated runs
    const iconsDir = path.join(repoRoot, "icons");
    const discovery = await discoverAndValidateIcons(iconsDir, repoRoot);
    const codepointsRaw = await fs.readFile(
      path.join(repoRoot, "packages/font/codepoints.json"),
      "utf8"
    );
    const manifest = JSON.parse(codepointsRaw) as SlaticoCodepointManifest;

    const run1 = await compileStyleFontBuffers("regular", discovery.families, manifest);
    const run2 = await compileStyleFontBuffers("regular", discovery.families, manifest);
    expect(Buffer.compare(run1.ttf, run2.ttf)).toBe(0);
    expect(Buffer.compare(run1.woff, run2.woff)).toBe(0);
    expect(Buffer.compare(run1.woff2, run2.woff2)).toBe(0);

    const cssRun1 = generateSlaticoFontCss(discovery.families, manifest);
    const cssRun2 = generateSlaticoFontCss(discovery.families, manifest);
    expect(cssRun1.css).toBe(cssRun2.css);
    expect(cssRun1.minCss).toBe(cssRun2.minCss);
  });

  it(
    "packs @slatico/font with pnpm pack and verifies standalone HTML/CSS and ESM/CJS imports in an isolated consumer project",
    async () => {
      const repoRoot = process.cwd();
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "slatico-font-pack-"));
      const tarballsDir = path.join(tmpDir, "tarballs");
      await fs.mkdir(tarballsDir, { recursive: true });

      const isWin = process.platform === "win32";
      const cmd = isWin ? (process.env.ComSpec ?? "cmd.exe") : "pnpm";

      try {
        for (const pkgName of ["core", "font"] as const) {
          const pkgDir = path.join(repoRoot, "packages", pkgName);
          const args = isWin
            ? ["/d", "/s", "/c", `pnpm pack --pack-destination ${tarballsDir}`]
            : ["pack", "--pack-destination", tarballsDir];
          await execFileAsync(cmd, args, {
            cwd: pkgDir,
            windowsVerbatimArguments: isWin
          });
        }

        const packedFiles = await fs.readdir(tarballsDir);
        expect(packedFiles.length).toBe(2);

        const consumerNodeModules = path.join(tmpDir, "node_modules", "@slatico");
        await fs.mkdir(consumerNodeModules, { recursive: true });

        for (const pkgName of ["core", "font"] as const) {
          const tgzFile = packedFiles.find((f) => f.startsWith(`slatico-${pkgName}-`));
          expect(tgzFile).toBeDefined();
          const extractTarget = path.join(consumerNodeModules, pkgName);
          await fs.mkdir(extractTarget, { recursive: true });
          await execFileAsync(
            "tar",
            ["-xzf", path.join(tarballsDir, tgzFile!), "-C", extractTarget, "--strip-components=1"],
            { cwd: tmpDir }
          );
        }

        // Verify all required package distribution files exist in unpacked @slatico/font tarball
        const unpackedFontDir = path.join(consumerNodeModules, "font");
        const expectedFiles = [
          "package.json",
          "README.md",
          "LICENSE",
          "codepoints.json",
          "dist/index.js",
          "dist/index.cjs",
          "dist/index.d.ts",
          "dist/index.d.cts",
          "dist/slatico.css",
          "dist/slatico.min.css",
          "dist/slatico-glyphs.json",
          "dist/fonts/slatico-thin.woff2",
          "dist/fonts/slatico-thin.woff",
          "dist/fonts/slatico-thin.ttf",
          "dist/fonts/slatico-light.woff2",
          "dist/fonts/slatico-light.woff",
          "dist/fonts/slatico-light.ttf",
          "dist/fonts/slatico-regular.woff2",
          "dist/fonts/slatico-regular.woff",
          "dist/fonts/slatico-regular.ttf",
          "dist/fonts/slatico-bold.woff2",
          "dist/fonts/slatico-bold.woff",
          "dist/fonts/slatico-bold.ttf",
          "dist/fonts/slatico-fill.woff2",
          "dist/fonts/slatico-fill.woff",
          "dist/fonts/slatico-fill.ttf"
        ];

        for (const relPath of expectedFiles) {
          const stat = await fs.stat(path.join(unpackedFontDir, relPath));
          expect(stat.isFile()).toBe(true);
          expect(stat.size).toBeGreaterThan(0);
        }

        // Verify ESM consumer import in isolated directory
        const verifyScriptPath = path.join(tmpDir, "verify-font-consumer.mjs");
        await fs.writeFile(
          verifyScriptPath,
          `
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import {
  FONT_COMPATIBLE_STYLES,
  FONT_GLYPHS,
  FONT_CODEPOINTS,
  getFontGlyph,
  getFontClassName,
  getFontHtmlSnippet
} from "@slatico/font";

const require = createRequire(import.meta.url);
const cjsFont = require("@slatico/font");
const glyphsJsonPath = require.resolve("@slatico/font/glyphs.json");
const cssPath = require.resolve("@slatico/font/slatico.css");
const minCssPath = require.resolve("@slatico/font/slatico.min.css");

assert.equal(FONT_COMPATIBLE_STYLES.length, 5);
assert.equal(FONT_GLYPHS.length, 135);
assert.equal(Object.keys(FONT_CODEPOINTS).length, 27);
assert.equal(getFontClassName("house", "regular"), "slatico slatico-house-regular");
assert.equal(getFontGlyph("bell", "bold").codepointHex, "0xE001");
assert.equal(
  getFontHtmlSnippet("user", "fill"),
  '<i class="slatico slatico-user-fill" aria-hidden="true"></i>'
);
assert.equal(cjsFont.FONT_GLYPHS.length, 135);
assert.ok(fs.existsSync(glyphsJsonPath));
assert.ok(fs.existsSync(cssPath));
assert.ok(fs.existsSync(minCssPath));
console.log("FONT_PACK_CONSUMER_OK");
`,
          "utf8"
        );

        const { stdout } = await execFileAsync(process.execPath, [verifyScriptPath], {
          cwd: tmpDir
        });
        expect(stdout).toContain("FONT_PACK_CONSUMER_OK");
      } finally {
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    },
    30000
  );
});
