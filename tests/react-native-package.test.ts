import fs from "node:fs/promises";
import path from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ICON_NAMES, SLATICO_STYLES, type SlaticoStyle } from "../packages/core/src/index.js";
import * as RnIcons from "../packages/react-native/src/index.js";
import type { SlaticoNativeIconProps } from "../packages/react-native/src/index.js";
import { BellIcon as SubpathBellIcon } from "../packages/react-native/src/icons/bell.js";
import { ShieldCheckColorIcon as SubpathShieldCheckColorIcon } from "../packages/react-native/src/icons/shield-check.js";
import { WalletDuotoneIcon as SubpathWalletDuotoneIcon } from "../packages/react-native/src/icons/wallet.js";
import SlaticoReactNativeExampleApp from "../examples/react-native/App.js";

function toPascalCase(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const rnExports = RnIcons as unknown as Record<string, ComponentType<SlaticoNativeIconProps>>;

describe("Phase 3D: @slatico/react-native Package Audit, Exports & Tree-Shaking", () => {
  it("exposes valid package.json exports, ESM/CJS entrypoints, TypeScript definitions, and react-native-svg peer dependency", async () => {
    const repoRoot = process.cwd();
    const pkgJsonRaw = await fs.readFile(
      path.join(repoRoot, "packages/react-native/package.json"),
      "utf8"
    );
    const pkgJson = JSON.parse(pkgJsonRaw) as {
      name: string;
      sideEffects: boolean;
      main: string;
      module: string;
      "react-native": string;
      types: string;
      exports: Record<string, unknown>;
      peerDependencies: Record<string, string>;
    };

    expect(pkgJson.name).toBe("@slatico/react-native");
    expect(pkgJson.sideEffects).toBe(false);
    expect(pkgJson.main).toBe("./dist/index.cjs");
    expect(pkgJson.module).toBe("./dist/index.js");
    expect(pkgJson["react-native"]).toBe("./dist/index.js");
    expect(pkgJson.types).toBe("./dist/index.d.ts");
    expect(pkgJson.exports["."]).toEqual({
      "react-native": {
        types: "./dist/index.d.ts",
        default: "./dist/index.js"
      },
      import: {
        types: "./dist/index.d.ts",
        default: "./dist/index.js"
      },
      require: {
        types: "./dist/index.d.cts",
        default: "./dist/index.cjs"
      }
    });
    expect(pkgJson.exports["./icons/*"]).toEqual({
      "react-native": {
        types: "./dist/icons/*.d.ts",
        default: "./dist/icons/*.js"
      },
      import: {
        types: "./dist/icons/*.d.ts",
        default: "./dist/icons/*.js"
      },
      require: {
        types: "./dist/icons/*.d.cts",
        default: "./dist/icons/*.cjs"
      }
    });
    expect(pkgJson.peerDependencies["react"]).toBeDefined();
    expect(pkgJson.peerDependencies["react-native-svg"]).toBeDefined();

    // Verify built ESM, CJS, and DTS artifacts exist for index and all 23 subpath icons
    const distDir = path.join(repoRoot, "packages/react-native/dist");
    for (const rel of ["index.js", "index.cjs", "index.d.ts", "index.d.cts"]) {
      const stat = await fs.stat(path.join(distDir, rel));
      expect(stat.size).toBeGreaterThan(0);
    }

    for (const iconName of ICON_NAMES) {
      for (const ext of [".js", ".cjs", ".d.ts", ".d.cts"]) {
        const stat = await fs.stat(path.join(distDir, "icons", `${iconName}${ext}`));
        expect(stat.size).toBeGreaterThan(0);
      }
    }
  });

  it("exports unified and style-specific components for all 27 icon families (216 total component exports) and matches direct subpath modules", () => {
    expect(ICON_NAMES.length).toBe(27);
    expect(SLATICO_STYLES.length).toBe(7);

    expect(SubpathBellIcon).toBe(RnIcons.BellIcon);
    expect(SubpathShieldCheckColorIcon).toBe(RnIcons.ShieldCheckColorIcon);
    expect(SubpathWalletDuotoneIcon).toBe(RnIcons.WalletDuotoneIcon);

    let verifiedComponentExports = 0;

    for (const iconName of ICON_NAMES) {
      const pascal = toPascalCase(iconName);
      const unifiedKey = `${pascal}Icon`;
      expect(typeof rnExports[unifiedKey]).toBe("function");
      verifiedComponentExports += 1;

      for (const style of SLATICO_STYLES) {
        const styleKey = `${pascal}${capitalize(style)}Icon`;
        expect(typeof rnExports[styleKey]).toBe("function");
        verifiedComponentExports += 1;
      }
    }

    expect(verifiedComponentExports).toBe(27 * 8);
  });
});

describe("Phase 3D: @slatico/react-native Visual & Functional Verification (189 Variants)", () => {
  it("renders all 189 icon variants with 24x24 viewBox proportions, zero CSS variables, and exact parity between unified and style-specific components", () => {
    let renderedCount = 0;

    for (const iconName of ICON_NAMES) {
      const pascal = toPascalCase(iconName);
      const UnifiedComp = rnExports[`${pascal}Icon`]!;

      for (const style of SLATICO_STYLES) {
        const StyleComp = rnExports[`${pascal}${capitalize(style)}Icon`]!;

        const unifiedMarkup = renderToStaticMarkup(
          createElement(UnifiedComp, { variant: style, size: 28, color: "#1E293B" })
        );
        const styleMarkup = renderToStaticMarkup(
          createElement(StyleComp, { size: 28, color: "#1E293B" })
        );

        expect(unifiedMarkup).toBe(styleMarkup);
        expect(unifiedMarkup).toContain('viewBox="0 0 24 24"');
        expect(unifiedMarkup).toContain('width="28"');
        expect(unifiedMarkup).toContain('height="28"');

        // Ensure no web-only SVG attributes, CSS variables, or unnormalized color tokens leak into RN
        expect(unifiedMarkup).not.toContain("var(--");
        expect(unifiedMarkup).not.toContain("currentColor");
        expect(unifiedMarkup).not.toContain('fill="black"');
        expect(unifiedMarkup).not.toContain("xmlns=");
        expect(unifiedMarkup).not.toContain("class=");

        renderedCount += 1;
      }
    }

    expect(renderedCount).toBe(189);
  });

  it("maintains visually distinct SVG path geometry across Thin, Light, Regular, and Bold for all 23 icon families", () => {
    for (const iconName of ICON_NAMES) {
      const pascal = toPascalCase(iconName);
      const UnifiedComp = rnExports[`${pascal}Icon`]!;

      const thinMarkup = renderToStaticMarkup(createElement(UnifiedComp, { variant: "thin" }));
      const lightMarkup = renderToStaticMarkup(createElement(UnifiedComp, { variant: "light" }));
      const regularMarkup = renderToStaticMarkup(
        createElement(UnifiedComp, { variant: "regular" })
      );
      const boldMarkup = renderToStaticMarkup(createElement(UnifiedComp, { variant: "bold" }));

      expect(thinMarkup).not.toBe(boldMarkup);
      expect(thinMarkup).not.toBe(regularMarkup);
      expect(regularMarkup).not.toBe(boldMarkup);
      expect(lightMarkup).not.toBe(boldMarkup);
    }
  });

  it("preserves negative space cutouts via fillRule=\"evenodd\" and compound subpaths in Fill icons", () => {
    const evenOddFillIcons = [
      "bell",
      "cloud-check",
      "credit-card",
      "envelope",
      "layout-dashboard",
      "lock",
      "lock-open",
      "pencil",
      "shield",
      "shield-check",
      "trash"
    ];

    for (const iconName of evenOddFillIcons) {
      const pascal = toPascalCase(iconName);
      const FillComp = rnExports[`${pascal}FillIcon`]!;
      const markup = renderToStaticMarkup(createElement(FillComp, { color: "#0F172A" }));
      expect(markup).toContain('fill="#0F172A"');
      expect(markup).toContain('fill-rule="evenodd"');
    }

    // Compound subpath Fill icons (non-zero winding cutouts) also preserve interior negative space subpaths
    for (const iconName of ["gear", "house", "magnifying-glass", "wallet"]) {
      const pascal = toPascalCase(iconName);
      const FillComp = rnExports[`${pascal}FillIcon`]!;
      const markup = renderToStaticMarkup(createElement(FillComp, { color: "#0F172A" }));
      expect(markup).toContain('fill="#0F172A"');
      expect(markup).toMatch(/d="M[^"]+[mM][^"]+"/);
    }
  });

  it("applies Duotone primary color, secondaryColor, and secondaryOpacity across all 23 Duotone icons", () => {
    const openLineSymbols = new Set(["minus", "plus"]);

    for (const iconName of ICON_NAMES) {
      const pascal = toPascalCase(iconName);
      const DuotoneComp = rnExports[`${pascal}DuotoneIcon`]!;

      const markup = renderToStaticMarkup(
        createElement(DuotoneComp, {
          size: 32,
          color: "#2563EB",
          secondaryColor: "#F97316",
          secondaryOpacity: 0.35
        })
      );

      expect(markup).toContain('fill="#2563EB"');
      if (!openLineSymbols.has(iconName)) {
        // Verify secondary tone layer receives both group opacity and explicit path fill
        expect(markup).toContain('opacity="0.35"');
        expect(markup).toContain('fill="#F97316"');
      }
    }
  });

  it("preserves default multicolor palette (#FF6040 and #000000) in Color icons when unset and supports independent primary/secondary customization", () => {
    const singleAccentColorIcons = new Set(["minus", "plus", "shield"]);

    for (const iconName of ICON_NAMES) {
      const pascal = toPascalCase(iconName);
      const ColorComp = rnExports[`${pascal}ColorIcon`]!;

      // Default (or currentColor) preserves intrinsic #FF6040 and #000000
      const defaultMarkup = renderToStaticMarkup(
        createElement(ColorComp, { size: 36 })
      );

      expect(defaultMarkup).toContain('fill="#FF6040"');
      if (!singleAccentColorIcons.has(iconName)) {
        expect(defaultMarkup).toContain('fill="#000000"');
      }
      expect(defaultMarkup).not.toContain('fill="black"');

      // Custom primary (color) and secondary (secondaryColor) update independently
      const customMarkup = renderToStaticMarkup(
        createElement(ColorComp, {
          size: 36,
          color: "#10B981",
          secondaryColor: "#2563EB"
        })
      );
      expect(customMarkup).toContain('fill="#10B981"');
      if (!singleAccentColorIcons.has(iconName)) {
        expect(customMarkup).toContain('fill="#2563EB"');
      }
    }
  });

  it("eliminates unsafe static SVG IDs and supports React useId() instance scoping", async () => {
    const repoRoot = process.cwd();
    for (const iconName of ICON_NAMES) {
      const sourceCode = await fs.readFile(
        path.join(repoRoot, "packages/react-native/src/icons", `${iconName}.tsx`),
        "utf8"
      );
      expect(sourceCode).toContain("const rawId = useId();");
      expect(sourceCode).toContain('const instanceId = rawId.replace(/[^a-zA-Z0-9_-]/g, "");');
      // Ensure no raw Figma clip0_* IDs exist in any generated React Native icon module
      expect(sourceCode).not.toContain("clip0_");
    }
  });

  it("handles invalid runtime prop values predictably without throwing or producing NaN/broken SVG attributes", () => {
    const BellIcon = rnExports.BellIcon!;
    const regularMarkup = renderToStaticMarkup(
      createElement(BellIcon, { variant: "regular", size: 24, color: "#09090B" })
    );

    // Invalid variant falls back to "regular"
    const invalidVariantMarkup = renderToStaticMarkup(
      createElement(BellIcon, {
        variant: "nonexistent" as unknown as SlaticoStyle,
        size: -12,
        color: "currentColor"
      })
    );
    expect(invalidVariantMarkup).toBe(regularMarkup);

    // Invalid Duotone props fall back to safe defaults and clamp opacity to [0, 1]
    const clampedHigh = renderToStaticMarkup(
      createElement(BellIcon, {
        variant: "duotone",
        size: Number.NaN,
        color: "",
        secondaryColor: "currentColor",
        secondaryOpacity: 4.5
      })
    );
    expect(clampedHigh).toContain('width="24"');
    expect(clampedHigh).toContain('height="24"');
    expect(clampedHigh).toContain('fill="#09090B"');
    expect(clampedHigh).toContain('opacity="1"');

    const clampedLow = renderToStaticMarkup(
      createElement(BellIcon, {
        variant: "duotone",
        secondaryOpacity: -0.75
      })
    );
    expect(clampedLow).toContain('opacity="0"');

    const fallbackNaNOpacity = renderToStaticMarkup(
      createElement(BellIcon, {
        variant: "duotone",
        secondaryOpacity: Number.NaN
      })
    );
    expect(fallbackNaNOpacity).toContain('opacity="0.22"');
  });

  it("renders the examples/react-native verification gallery application in Light, Dark, and 189-variant matrix modes", async () => {
    const lightAppMarkup = renderToStaticMarkup(
      createElement(SlaticoReactNativeExampleApp, {
        initialStyle: "duotone",
        initialDarkTheme: false,
        showAll161MatrixByDefault: false
      })
    );

    expect(lightAppMarkup).toContain("Slatico React Native");
    expect(lightAppMarkup).toContain("27 families × 7 styles = 189 native vector variants");
    expect(lightAppMarkup).toContain("7-Style Comparison (house)");

    // Verify all 27 icon family slugs are rendered in the gallery
    for (const iconName of ICON_NAMES) {
      expect(lightAppMarkup).toContain(iconName);
    }

    // Verify Dark theme + full 189-variant matrix mode renders all 189 variants simultaneously
    const darkMatrixMarkup = renderToStaticMarkup(
      createElement(SlaticoReactNativeExampleApp, {
        initialStyle: "color",
        initialDarkTheme: true,
        showAll161MatrixByDefault: true
      })
    );
    expect(darkMatrixMarkup).toContain("Complete 189-Variant Matrix (27 × 7)");
    const svgCount = (darkMatrixMarkup.match(/<svg /g) ?? []).length;
    // 189 matrix icons + 2 header badge icons + 3 subpath verification icons = 194 <svg> trees
    expect(svgCount).toBeGreaterThanOrEqual(189);

    // Verify native Android and iOS project files exist for CI compilation
    const repoRoot = process.cwd();
    for (const rel of [
      "examples/react-native/package.json",
      "examples/react-native/metro.config.cjs",
      "examples/react-native/babel.config.cjs",
      "examples/react-native/App.tsx",
      "examples/react-native/scripts/bundle.mjs",
      "examples/react-native/android/build.gradle",
      "examples/react-native/android/settings.gradle",
      "examples/react-native/android/app/build.gradle",
      "examples/react-native/android/app/src/main/AndroidManifest.xml",
      "examples/react-native/android/app/src/main/java/com/infitus/slatico/rnexample/MainActivity.kt",
      "examples/react-native/android/app/src/main/java/com/infitus/slatico/rnexample/MainApplication.kt",
      "examples/react-native/android/app/src/test/java/com/infitus/slatico/rnexample/ReactNativeSvgLinkTest.kt",
      "examples/react-native/ios/Podfile",
      "examples/react-native/ios/setup_ios_project.rb",
      "examples/react-native/ios/SlaticoReactNativeExample/AppDelegate.mm",
      "examples/react-native/ios/SlaticoReactNativeExample/Info.plist"
    ]) {
      const stat = await fs.stat(path.join(repoRoot, rel));
      expect(stat.size).toBeGreaterThan(0);
    }
  });
});
