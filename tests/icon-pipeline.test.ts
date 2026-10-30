import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ICON_CATALOG,
  ICON_NAMES,
  MASTER_VIEWBOX,
  SLATICO_STYLES,
  SLATICO_STYLE_SPECS,
  SLATICO_TIERS,
  getIconComponentName,
  isValidIconName,
  isValidSlaticoStyle,
  toPascalCase
} from "../packages/core/src/index.js";
import { getSvgAsset } from "../packages/svg/src/index.js";
import {
  BellBoldIcon,
  BellColorIcon,
  BellDuotoneIcon,
  BellFillIcon,
  BellIcon,
  BellLightIcon,
  BellRegularIcon,
  BellThinIcon,
  LockIcon,
  ShieldCheckIcon,
  WalletIcon
} from "../packages/react/src/index.js";
import { BellIcon as DirectBellIcon } from "../packages/react/src/icons/bell.js";
import { WalletIcon as DirectWalletIcon } from "../packages/react/src/icons/wallet.js";
import { canCompileStyleToMonochromeFont } from "../packages/font/src/index.js";
import {
  discoverAndValidateIcons,
  validateAndOptimizeSvgContent
} from "../scripts/icon-pipeline.js";
import {
  generateCoreCatalogModule,
  generateReactBarrelModule,
  generateReactIconModule,
  generateSvgDataModule
} from "../scripts/generate-icons.js";

const EXPECTED_TIER1_FAMILIES = [
  "bell",
  "cloud",
  "cloud-check",
  "credit-card",
  "envelope",
  "envelope-open",
  "gear",
  "house",
  "layout-dashboard",
  "lock",
  "lock-open",
  "magnifying-glass",
  "minus",
  "pencil",
  "plus",
  "shield",
  "shield-check",
  "sliders-horizontal",
  "trash",
  "trash-x",
  "trend-up",
  "user",
  "wallet"
] as const;

describe("@slatico/core specifications and utilities", () => {
  it("defines all 7 official Slatico styles and catalog tiers in order", () => {
    expect(SLATICO_STYLES).toEqual([
      "thin",
      "light",
      "regular",
      "bold",
      "fill",
      "duotone",
      "color"
    ]);
    expect(SLATICO_TIERS).toEqual(["tier-1", "tier-2", "tier-3"]);
    expect(MASTER_VIEWBOX).toBe("0 0 24 24");
  });

  it("enforces exact stroke widths and monochrome rules per style", () => {
    expect(SLATICO_STYLE_SPECS.thin.strokeWidth).toBe(1);
    expect(SLATICO_STYLE_SPECS.light.strokeWidth).toBe(1.5);
    expect(SLATICO_STYLE_SPECS.regular.strokeWidth).toBe(2);
    expect(SLATICO_STYLE_SPECS.bold.strokeWidth).toBe(3);
    expect(SLATICO_STYLE_SPECS.fill.strokeWidth).toBeNull();
    expect(SLATICO_STYLE_SPECS.duotone.strokeWidth).toBe(1.75);
    expect(SLATICO_STYLE_SPECS.duotone.isMonochrome).toBe(false);
    expect(SLATICO_STYLE_SPECS.color.isMonochrome).toBe(false);
    expect(SLATICO_STYLE_SPECS.duotone.supportsIconFont).toBe(false);
    expect(SLATICO_STYLE_SPECS.color.supportsIconFont).toBe(false);
  });

  it("validates icon names and converts to PascalCase accurately", () => {
    expect(isValidIconName("bell")).toBe(true);
    expect(isValidIconName("shield-check")).toBe(true);
    expect(isValidIconName("sliders-horizontal")).toBe(true);

    expect(isValidIconName("Bell")).toBe(false);
    expect(isValidIconName("shield_check")).toBe(false);
    expect(isValidIconName("-leading")).toBe(false);
    expect(isValidIconName("trailing-")).toBe(false);

    expect(toPascalCase("shield-check")).toBe("ShieldCheck");
    expect(getIconComponentName("shield-check")).toBe("ShieldCheckIcon");
    expect(getIconComponentName("shield-check", "duotone")).toBe("ShieldCheckDuotoneIcon");
    expect(isValidSlaticoStyle("regular")).toBe(true);
    expect(isValidSlaticoStyle("outline")).toBe(false);
  });

  it("distinguishes monochrome font-compatible styles from multi-layer/multicolor styles", () => {
    expect(canCompileStyleToMonochromeFont("regular")).toBe(true);
    expect(canCompileStyleToMonochromeFont("fill")).toBe(true);
    expect(canCompileStyleToMonochromeFont("duotone")).toBe(false);
    expect(canCompileStyleToMonochromeFont("color")).toBe(false);
  });
});

describe("SVG discovery, validation, and Tier 1 production pipeline", () => {
  it("validates all 23 Tier 1 production icon families (161 variants) and excludes demo icons from production exports", async () => {
    const repoRoot = process.cwd();
    const iconsDir = path.join(repoRoot, "icons");
    const result = await discoverAndValidateIcons(iconsDir, repoRoot);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.families.length).toBe(23);
    expect(result.demoFamilies.map((f) => f.name)).toEqual(["cube", "sparkle"]);

    expect(ICON_NAMES).toEqual(EXPECTED_TIER1_FAMILIES);
    expect(ICON_CATALOG.totalIcons).toBe(23);
    expect(ICON_CATALOG.totalVariants).toBe(161);
    expect(ICON_CATALOG.tiers["tier-1"]).toEqual(EXPECTED_TIER1_FAMILIES);
    expect(ICON_CATALOG.tiers["tier-2"]).toEqual([]);
    expect(ICON_CATALOG.tiers["tier-3"]).toEqual([]);
    expect(ICON_CATALOG.icons.every((entry) => !entry.isDemo && entry.tier === "tier-1")).toBe(true);

    // Verify all 161 refined Tier 1 source SVGs are clean on disk with 0 structural fixes needed
    expect(result.structuralFixes.length).toBe(0);
    for (const family of result.families) {
      for (const style of SLATICO_STYLES) {
        const optimized = family.variants[style].optimizedSvg;
        expect(optimized).not.toContain('stroke-width="0.1"');
        expect(optimized).not.toContain("clip0_");
      }
    }
  });

  it("preserves explicit stroke widths and gradients in the 3 archived demonstration icon fixtures", async () => {
    const repoRoot = process.cwd();
    const demoFixturesDir = path.join(repoRoot, "tests", "fixtures", "demo-icons");
    const demoResult = await discoverAndValidateIcons(demoFixturesDir, repoRoot, {
      includeDemo: true
    });

    expect(demoResult.valid).toBe(true);
    expect(demoResult.families.map((f) => f.name)).toEqual(["cube", "shield-check", "sparkle"]);

    const sparkleFamily = demoResult.families.find((f) => f.name === "sparkle")!;
    expect(sparkleFamily.variants.thin.optimizedSvg).toContain('stroke-width="1"');
    expect(sparkleFamily.variants.light.optimizedSvg).toContain('stroke-width="1.5"');
    expect(sparkleFamily.variants.regular.optimizedSvg).toContain('stroke-width="2"');
    expect(sparkleFamily.variants.bold.optimizedSvg).toContain('stroke-width="3"');
    expect(sparkleFamily.variants.color.optimizedSvg).toContain("linearGradient");
    expect(sparkleFamily.variants.color.optimizedSvg).toContain("url(#slatico-sparkle-grad)");
  });

  it("supports Duotone with two distinct tones or opacity layers without replacing secondary colors with currentColor", () => {
    const repoDuotone = getSvgAsset("bell", "duotone");
    expect(repoDuotone.svg).toContain("var(--slatico-secondary-color, currentColor)");
    expect(repoDuotone.svg).toContain("var(--slatico-secondary-opacity, 0.2)");
    expect(repoDuotone.svg).toContain('fill="currentColor"');

    // Also test a Duotone icon authored with an explicit secondary hex color
    const twoToneDuotone = validateAndOptimizeSvgContent({
      rawSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <path d="M4 4h16v16H4z" fill="#818CF8" fill-opacity="0.35"/>
        <path d="M4 4h16v16H4z" stroke="currentColor" stroke-width="1.75"/>
      </svg>`,
      name: "two-tone-test",
      style: "duotone",
      relativePath: "icons/duotone/two-tone-test.svg"
    });
    expect(twoToneDuotone.errors).toEqual([]);
    expect(twoToneDuotone.variant?.optimizedSvg).toContain("#818CF8");
    expect(twoToneDuotone.variant?.optimizedSvg).toContain('fill-opacity=".35"');

    // Reject a fake single-layer Duotone icon that has no secondary tone or opacity
    const flatFakeDuotone = validateAndOptimizeSvgContent({
      rawSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <path d="M4 4h16v16H4z" stroke="currentColor" stroke-width="1.75"/>
      </svg>`,
      name: "flat-duotone",
      style: "duotone",
      relativePath: "icons/duotone/flat-duotone.svg"
    });
    expect(
      flatFakeDuotone.errors.some((e) => e.includes("Duotone style must include at least two layers"))
    ).toBe(true);
  });

  it("preserves gradients, masks, clipPaths, IDs, and negative space (evenodd) in SVG optimization", () => {
    const colorBell = getSvgAsset("bell", "color");
    expect(colorBell.viewBox).toBe("0 0 24 24");
    expect(colorBell.svg).toContain("#FF6040");

    // Verify negative space (fill-rule="evenodd" clip-rule="evenodd") in fill shield-check
    const fillShield = getSvgAsset("shield-check", "fill");
    expect(fillShield.svg).toContain('fill-rule="evenodd"');
    expect(fillShield.svg).toContain('clip-rule="evenodd"');

    // Verify masks, clipPaths, and radialGradients with slatico-* IDs are preserved
    const complexColorSvg = validateAndOptimizeSvgContent({
      rawSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <defs>
          <clipPath id="slatico-complex-clip">
            <rect x="2" y="2" width="20" height="20" rx="4"/>
          </clipPath>
          <mask id="slatico-complex-mask">
            <rect x="0" y="0" width="24" height="24" fill="#FFFFFF"/>
            <circle cx="12" cy="12" r="4" fill="#000000"/>
          </mask>
          <radialGradient id="slatico-complex-rad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#38BDF8"/>
            <stop offset="100%" stop-color="#6366F1"/>
          </radialGradient>
        </defs>
        <g clip-path="url(#slatico-complex-clip)" mask="url(#slatico-complex-mask)">
          <rect x="2" y="2" width="20" height="20" fill="url(#slatico-complex-rad)"/>
        </g>
      </svg>`,
      name: "complex",
      style: "color",
      relativePath: "icons/color/complex.svg"
    });
    expect(complexColorSvg.errors).toEqual([]);
    expect(complexColorSvg.variant?.optimizedSvg).toContain('id="slatico-complex-clip"');
    expect(complexColorSvg.variant?.optimizedSvg).toContain('id="slatico-complex-mask"');
    expect(complexColorSvg.variant?.optimizedSvg).toContain('id="slatico-complex-rad"');
    expect(complexColorSvg.variant?.optimizedSvg).toContain('clip-path="url(#slatico-complex-clip)"');
    expect(complexColorSvg.variant?.optimizedSvg).toContain('mask="url(#slatico-complex-mask)"');
  });

  it("rejects broken url(#id) references, unprefixed IDs, event handler attributes, and hardcoded colors in monochrome styles", () => {
    const brokenRef = validateAndOptimizeSvgContent({
      rawSvg:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 2h20v20H2z" fill="url(#slatico-missing-grad)"/></svg>',
      name: "broken-ref",
      style: "color",
      relativePath: "icons/color/broken-ref.svg"
    });
    expect(brokenRef.errors.some((e) => e.includes("Broken SVG reference"))).toBe(true);

    const unprefixedId = validateAndOptimizeSvgContent({
      rawSvg:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><clipPath id="generic-clip"><rect width="24" height="24"/></clipPath></defs><path d="M2 2h20v20H2z" clip-path="url(#generic-clip)" fill="#10B981"/></svg>',
      name: "unprefixed",
      style: "color",
      relativePath: "icons/color/unprefixed.svg"
    });
    expect(unprefixedId.errors.some((e) => e.includes('must be prefixed with "slatico-"'))).toBe(
      true
    );

    const unsafeEventAttr = validateAndOptimizeSvgContent({
      rawSvg:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 2h20v20H2z" fill="currentColor" onload="alert(1)"/></svg>',
      name: "unsafe-attr",
      style: "fill",
      relativePath: "icons/fill/unsafe-attr.svg"
    });
    expect(unsafeEventAttr.errors.some((e) => e.includes("unsafe SVG attributes"))).toBe(true);

    const hardcodedMono = validateAndOptimizeSvgContent({
      rawSvg:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 2h20v20H2z" stroke="#FF0000"/></svg>',
      name: "bad-color",
      style: "thin",
      relativePath: "icons/thin/bad-color.svg"
    });
    expect(hardcodedMono.errors.some((e) => e.includes("currentColor"))).toBe(true);
  });

  it("produces 100% deterministic SVG and React code generation outputs across repeated runs", async () => {
    const repoRoot = process.cwd();
    const iconsDir = path.join(repoRoot, "icons");

    const run1 = await discoverAndValidateIcons(iconsDir, repoRoot);
    const run2 = await discoverAndValidateIcons(iconsDir, repoRoot);

    expect(generateCoreCatalogModule(run1.families)).toBe(generateCoreCatalogModule(run2.families));
    expect(generateSvgDataModule(run1.families)).toBe(generateSvgDataModule(run2.families));
    expect(generateReactBarrelModule(run1.families)).toBe(generateReactBarrelModule(run2.families));

    for (let i = 0; i < run1.families.length; i++) {
      const fam1 = run1.families[i]!;
      const fam2 = run2.families[i]!;
      expect(generateReactIconModule(fam1)).toBe(generateReactIconModule(fam2));
    }
  });

  it("fails loudly when an icon is missing one or more of the 7 required style variants", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "slatico-test-"));
    try {
      for (const style of SLATICO_STYLES) {
        await fs.mkdir(path.join(tmpDir, style), { recursive: true });
      }
      await fs.writeFile(
        path.join(tmpDir, "regular", "incomplete-icon.svg"),
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 12h16" stroke="currentColor" stroke-width="2"/></svg>',
        "utf8"
      );

      const res = await discoverAndValidateIcons(tmpDir, tmpDir);
      expect(res.valid).toBe(false);
      expect(
        res.errors.some((e) =>
          e.includes('Icon "incomplete-icon" is missing required style variants')
        )
      ).toBe(true);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});

describe("@slatico/react components & real consumer package verification", () => {
  it("renders all 7 variants, custom colors, Duotone secondaryColor/secondaryOpacity, sizes, and SVG props accurately", () => {
    expect(DirectBellIcon).toBe(BellIcon);
    expect(DirectWalletIcon).toBe(WalletIcon);
    expect(LockIcon).toBeDefined();
    expect(ShieldCheckIcon).toBeDefined();

    const thinHtml = renderToStaticMarkup(
      createElement(BellThinIcon, {
        size: 28,
        color: "#4F46E5",
        className: "custom-thin",
        id: "thin-icon"
      })
    );
    expect(thinHtml).toContain('width="28"');
    expect(thinHtml).toContain('height="28"');
    expect(thinHtml).toContain('fill="currentColor"');
    expect(thinHtml).toContain('class="custom-thin"');
    expect(thinHtml).toContain("color:#4F46E5");
    expect(thinHtml).toContain('aria-hidden="true"');

    const duotoneHtml = renderToStaticMarkup(
      createElement(BellDuotoneIcon, {
        size: "2rem",
        color: "#059669",
        secondaryColor: "#F59E0B",
        secondaryOpacity: 0.4,
        title: "Accessible Duotone Bell"
      })
    );
    expect(duotoneHtml).toContain('role="img"');
    expect(duotoneHtml).toContain('aria-label="Accessible Duotone Bell"');
    expect(duotoneHtml).toContain("<title>Accessible Duotone Bell</title>");
    expect(duotoneHtml).toContain("--slatico-secondary-color:#F59E0B");
    expect(duotoneHtml).toContain("--slatico-secondary-opacity:0.4");
    expect(duotoneHtml).toContain('fill="var(--slatico-secondary-color, currentColor)"');

    const colorHtml = renderToStaticMarkup(createElement(BellColorIcon, { size: 32 }));
    expect(colorHtml).toContain('fill="#FF6040"');

    // Verify all 7 explicit variant components render distinct markup
    const variantsMarkup = [
      renderToStaticMarkup(createElement(BellThinIcon)),
      renderToStaticMarkup(createElement(BellLightIcon)),
      renderToStaticMarkup(createElement(BellRegularIcon)),
      renderToStaticMarkup(createElement(BellBoldIcon)),
      renderToStaticMarkup(createElement(BellFillIcon)),
      renderToStaticMarkup(createElement(BellDuotoneIcon)),
      renderToStaticMarkup(createElement(BellColorIcon))
    ];
    expect(new Set(variantsMarkup).size).toBe(7);
  });

  it("verifies built dist outputs for @slatico/core, @slatico/svg, and @slatico/react work as external consumer packages", async () => {
    const repoRoot = process.cwd();
    const coreDist = await import(
      new URL(`file:///${path.join(repoRoot, "packages/core/dist/index.js").replace(/\\/g, "/")}`)
        .href
    );
    const svgDist = await import(
      new URL(`file:///${path.join(repoRoot, "packages/svg/dist/index.js").replace(/\\/g, "/")}`)
        .href
    );
    const reactDist = await import(
      new URL(`file:///${path.join(repoRoot, "packages/react/dist/index.js").replace(/\\/g, "/")}`)
        .href
    );
    const reactSubpathBell = await import(
      new URL(
        `file:///${path.join(repoRoot, "packages/react/dist/icons/bell.js").replace(/\\/g, "/")}`
      ).href
    );

    expect(coreDist.SLATICO_STYLES).toHaveLength(7);
    expect(coreDist.ICON_CATALOG.totalIcons).toBe(23);
    expect(coreDist.ICON_CATALOG.totalVariants).toBe(161);
    expect(svgDist.getSvgAsset("shield-check", "fill").svg).toContain('fill-rule="evenodd"');
    expect(reactDist.ShieldCheckIcon).toBeDefined();
    expect(reactSubpathBell.BellIcon).toBeDefined();

    const renderedFromBuiltDist = renderToStaticMarkup(
      createElement(reactSubpathBell.BellIcon, { variant: "duotone", secondaryColor: "#EC4899" })
    );
    expect(renderedFromBuiltDist).toContain("--slatico-secondary-color:#EC4899");
  });
});
