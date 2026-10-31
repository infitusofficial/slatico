import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ICON_CATALOG, ICON_NAMES, SLATICO_STYLES } from "../packages/core/src/index.js";
import { SITE_CONFIG, DOCS_GUIDES } from "../apps/website/src/config/site";
import {
  buildPageMetadata,
  homeMetadata,
  iconsExplorerMetadata,
  docsOverviewMetadata,
  aboutMetadata,
  contactMetadata,
  licenseMetadata,
  buildIconDetailMetadata,
  buildDocsGuideMetadata
} from "../apps/website/src/config/metadata";
import {
  ENRICHED_ICONS,
  filterCatalogIcons,
  getEnrichedIconByName
} from "../apps/website/src/lib/catalog";
import { buildStandaloneSvg } from "../apps/website/src/lib/svg-export";
import {
  hasValidPngMagicBytes,
  hasValidWebpMagicBytes
} from "../apps/website/src/lib/raster-export";
import {
  buildVectorPdfBytes,
  extractSvgVectorLayers
} from "../apps/website/src/lib/pdf-export";
import {
  CODE_SNIPPET_PLATFORMS,
  generatePlatformCodeSnippet
} from "../apps/website/src/lib/code-snippets";
import {
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildSoftwareSourceCodeJsonLd,
  buildWebSiteJsonLd
} from "../apps/website/src/lib/structured-data";
import {
  getColorVariantDefaultSecondaryHex,
  resolveEffectiveSecondaryColor,
  resolveSecondaryPickerHex
} from "../apps/website/src/lib/theme-color-defaults";

const ROOT_DIR = path.resolve(__dirname, "..");
const WEBSITE_DIR = path.join(ROOT_DIR, "apps", "website");

function walkFiles(dir: string, extFilter: string[]): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, extFilter));
    } else if (extFilter.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

describe("Slatico Phase 4A — Premium Icon Explorer Website Verification", () => {
  it("defines canonical brand tokens (#FF6040 and #010520) once in globals.css, maps --primary directly to --brand-primary, defines exact squircle utilities, and avoids hardcoded brand hexes in components", () => {
    const globalsCss = readFileSync(
      path.join(WEBSITE_DIR, "src", "app", "globals.css"),
      "utf8"
    );

    const primaryMatches = globalsCss.match(/#FF6040/gi) ?? [];
    const darkMatches = globalsCss.match(/#010520/gi) ?? [];

    expect(primaryMatches.length).toBe(1);
    expect(darkMatches.length).toBe(1);
    expect(globalsCss).toContain("--brand-primary: #FF6040;");
    expect(globalsCss).toContain("--brand-dark: #010520;");
    expect(globalsCss).toContain("@theme inline");

    // Verify exact --primary: var(--brand-primary) in both :root and .dark without color-mix darkening
    const directPrimaryRefs =
      globalsCss.match(/--primary:\s*var\(--brand-primary\);/g) ?? [];
    expect(directPrimaryRefs.length).toBe(2);

    // Verify exact squircle utilities in globals.css
    expect(globalsCss).toContain(
      "@utility squircle-soft {\n  @supports (corner-shape: superellipse(1.5)) {\n    corner-shape: superellipse(1.5);\n  }\n}"
    );
    expect(globalsCss).toContain(
      "@utility squircle {\n  @supports (corner-shape: superellipse(2)) {\n    corner-shape: superellipse(2);\n  }\n}"
    );
    expect(globalsCss).toContain(
      "@utility squircle-strong {\n  @supports (corner-shape: superellipse(4)) {\n    corner-shape: superellipse(4);\n  }\n}"
    );

    // Ensure squircle-soft and squircle-strong are never used in website components or pages
    const allWebsiteTsx = walkFiles(path.join(WEBSITE_DIR, "src"), [".tsx", ".ts"]);
    let squircleUsageCount = 0;
    for (const file of allWebsiteTsx) {
      const content = readFileSync(file, "utf8");
      expect(content).not.toContain("squircle-soft");
      expect(content).not.toContain("squircle-strong");
      expect(content).not.toContain("square-kel");
      if (/\bsquircle\b/.test(content)) {
        squircleUsageCount++;
      }
    }
    expect(squircleUsageCount).toBeGreaterThanOrEqual(8);

    const componentFiles = walkFiles(
      path.join(WEBSITE_DIR, "src", "components"),
      [".tsx", ".ts"]
    );
    for (const file of componentFiles) {
      const content = readFileSync(file, "utf8");
      expect(
        content.toUpperCase(),
        `Component ${path.relative(ROOT_DIR, file)} must not hardcode #FF6040`
      ).not.toContain("#FF6040");
      expect(
        content.toUpperCase(),
        `Component ${path.relative(ROOT_DIR, file)} must not hardcode #010520`
      ).not.toContain("#010520");
    }
  });

  it("includes self-hosted General Sans variable WOFF2 fonts and configures next/font/local", () => {
    const normalFont = path.join(
      WEBSITE_DIR,
      "src",
      "assets",
      "fonts",
      "GeneralSans-Variable.woff2"
    );
    const italicFont = path.join(
      WEBSITE_DIR,
      "src",
      "assets",
      "fonts",
      "GeneralSans-VariableItalic.woff2"
    );

    expect(existsSync(normalFont)).toBe(true);
    expect(existsSync(italicFont)).toBe(true);
    expect(readFileSync(normalFont).byteLength).toBeGreaterThan(20_000);
    expect(readFileSync(italicFont).byteLength).toBeGreaterThan(20_000);

    const layoutTsx = readFileSync(
      path.join(WEBSITE_DIR, "src", "app", "layout.tsx"),
      "utf8"
    );
    expect(layoutTsx).toContain("GeneralSans-Variable.woff2");
    expect(layoutTsx).toContain("GeneralSans-VariableItalic.woff2");
    expect(layoutTsx).toContain("--font-general-sans");
  });

  it("ships official brand assets (logo.svg, logo-dark.svg, icon.svg, og-image.png) and generated favicons + manifest", () => {
    const publicDir = path.join(WEBSITE_DIR, "public");
    const requiredAssets = [
      "brand/logo.svg",
      "brand/logo-dark.svg",
      "brand/icon.svg",
      "brand/og-image.png",
      "icon.svg",
      "favicon.ico",
      "favicon-16x16.png",
      "favicon-32x32.png",
      "apple-touch-icon.png",
      "android-chrome-192x192.png",
      "android-chrome-512x512.png",
      "site.webmanifest"
    ];

    for (const rel of requiredAssets) {
      const fullPath = path.join(publicDir, rel);
      expect(existsSync(fullPath), `Missing public asset ${rel}`).toBe(true);
    }

    expect(SITE_CONFIG.assets.logo).toBe("/brand/logo.svg");
    expect(SITE_CONFIG.assets.logoDark).toBe("/brand/logo-dark.svg");

    // Verify PNG magic bytes on generated favicons
    for (const pngFile of [
      "favicon-16x16.png",
      "favicon-32x32.png",
      "apple-touch-icon.png",
      "android-chrome-192x192.png",
      "android-chrome-512x512.png"
    ]) {
      const buf = new Uint8Array(readFileSync(path.join(publicDir, pngFile)));
      expect(hasValidPngMagicBytes(buf)).toBe(true);
    }

    // Verify og-image.png is 1200x630
    const ogBuf = readFileSync(path.join(publicDir, "brand", "og-image.png"));
    expect(ogBuf.readUInt32BE(16)).toBe(1200);
    expect(ogBuf.readUInt32BE(20)).toBe(630);
  });

  it("centralizes site config and supports page metadata overrides with global og-image fallback", () => {
    expect(SITE_CONFIG.brandName).toBe("Slatico");
    expect(SITE_CONFIG.assets.logo).toBe("/brand/logo.svg");
    expect(SITE_CONFIG.assets.logoDark).toBe("/brand/logo-dark.svg");
    expect(SITE_CONFIG.assets.ogImage.url).toBe("/brand/og-image.png");
    expect(SITE_CONFIG.metrics.totalFamilies).toBe(27);
    expect(SITE_CONFIG.metrics.totalVariants).toBe(189);
    expect(DOCS_GUIDES.length).toBe(7);

    // Default fallback to global og-image.png
    const defaultImages = homeMetadata.openGraph?.images as Array<{ url: string }>;
    expect(defaultImages?.[0]?.url).toBe("/brand/og-image.png");

    // Custom override support
    const overridden = buildPageMetadata({
      title: "Custom Title",
      description: "Custom Desc",
      canonicalPath: "/icons/bell",
      ogImage: {
        url: "/brand/custom-og.png",
        width: 1200,
        height: 630
      }
    });
    const overriddenImages = overridden.openGraph?.images as Array<{ url: string }>;
    expect(overriddenImages?.[0]?.url).toBe("/brand/custom-og.png");

    expect(iconsExplorerMetadata.title).toContain("Icon Explorer");
    expect(docsOverviewMetadata.title).toContain("Documentation");
    expect(aboutMetadata.title).toContain("About");
    expect(contactMetadata.title).toContain("Contact");
    expect(licenseMetadata.title).toContain("MIT");
    expect(
      buildIconDetailMetadata({
        name: "bell",
        pascalName: "Bell",
        categoryLabel: "Communication & Alerts",
        keywords: ["notification"]
      }).title
    ).toContain("Bell (bell)");
    expect(buildDocsGuideMetadata("swift").title).toContain("Apple Native");
  });

  it("dynamically enriches all 27 icon families (including arrow-down, arrow-up, arrow-up-left, arrow-up-right) and supports search & category filtering", () => {
    expect(ENRICHED_ICONS.length).toBe(ICON_CATALOG.totalIcons);
    expect(ENRICHED_ICONS.length).toBe(27);
    expect(getEnrichedIconByName("bell")?.pascalName).toBe("Bell");
    expect(getEnrichedIconByName("shield-check")?.categoryId).toBe(
      "security-identity"
    );

    // Verify all 4 arrow families are enriched and searchable
    for (const arrowSlug of [
      "arrow-down",
      "arrow-up",
      "arrow-up-left",
      "arrow-up-right"
    ] as const) {
      const enriched = getEnrichedIconByName(arrowSlug);
      expect(enriched).toBeDefined();
      expect(enriched?.categoryId).toBe("navigation-layout");
    }

    const searchArrow = filterCatalogIcons({ query: "arrow" });
    expect(searchArrow.map((i) => i.name)).toEqual(
      expect.arrayContaining([
        "arrow-down",
        "arrow-up",
        "arrow-up-left",
        "arrow-up-right"
      ])
    );

    const searchBell = filterCatalogIcons({ query: "notification" });
    expect(searchBell.some((i) => i.name === "bell")).toBe(true);

    const securityIcons = filterCatalogIcons({ category: "security-identity" });
    expect(securityIcons.length).toBeGreaterThanOrEqual(4);
    expect(securityIcons.every((i) => i.categoryId === "security-identity")).toBe(
      true
    );
  });

  it("generates standalone valid 24x24 SVGs with all CSS variables resolved across all 161 variants and supports dual-color Color icons", () => {
    for (const name of ICON_NAMES) {
      for (const style of SLATICO_STYLES) {
        const svg = buildStandaloneSvg(name, style, {
          size: 32,
          primaryColor: "#1E293B",
          secondaryColor: "#4F46E5",
          secondaryOpacity: 0.35
        });

        expect(svg.startsWith("<svg ")).toBe(true);
        expect(svg.endsWith("</svg>")).toBe(true);
        expect(svg).toContain('viewBox="0 0 24 24"');
        expect(svg).not.toContain("var(--slatico-");
        expect(svg).not.toContain("currentColor");
      }
    }

    // Verify Color style preserves #FF6040 and #000000 by default and supports independent primary/secondary customization
    const defaultColorSvg = buildStandaloneSvg("bell", "color");
    expect(defaultColorSvg).toContain('fill="#FF6040"');
    expect(defaultColorSvg).toContain('fill="#000000"');

    const customPrimaryOnlySvg = buildStandaloneSvg("bell", "color", {
      primaryColor: "#2563EB"
    });
    expect(customPrimaryOnlySvg).toContain('fill="#2563EB"');
    expect(customPrimaryOnlySvg).toContain('fill="#000000"');

    const customSecondaryOnlySvg = buildStandaloneSvg("bell", "color", {
      secondaryColor: "#059669"
    });
    expect(customSecondaryOnlySvg).toContain('fill="#FF6040"');
    expect(customSecondaryOnlySvg).toContain('fill="#059669"');

    const customBothColorSvg = buildStandaloneSvg("bell", "color", {
      primaryColor: "#2563EB",
      secondaryColor: "#059669"
    });
    expect(customBothColorSvg).toContain('fill="#2563EB"');
    expect(customBothColorSvg).toContain('fill="#059669"');

    // Verify theme-aware default secondary color for `color` variant (#000000 in Light, #FFFFFF in Dark)
    expect(getColorVariantDefaultSecondaryHex(false)).toBe("#000000");
    expect(getColorVariantDefaultSecondaryHex(true)).toBe("#FFFFFF");
    expect(resolveEffectiveSecondaryColor("color", "var(--primary)", false)).toBe(
      "#000000"
    );
    expect(resolveEffectiveSecondaryColor("color", "var(--primary)", true)).toBe(
      "#FFFFFF"
    );
    expect(resolveSecondaryPickerHex("color", "var(--primary)", false)).toBe(
      "#000000"
    );
    expect(resolveSecondaryPickerHex("color", "var(--primary)", true)).toBe(
      "#FFFFFF"
    );
    // Manual custom secondary color is preserved in both Light and Dark themes
    expect(resolveEffectiveSecondaryColor("color", "#3B82F6", false)).toBe(
      "#3B82F6"
    );
    expect(resolveEffectiveSecondaryColor("color", "#3B82F6", true)).toBe(
      "#3B82F6"
    );
    // Duotone default secondary color remains var(--primary) in both themes
    expect(
      resolveEffectiveSecondaryColor("duotone", "var(--primary)", false)
    ).toBe("var(--primary)");
    expect(
      resolveEffectiveSecondaryColor("duotone", "var(--primary)", true)
    ).toBe("var(--primary)");
  });

  it("generates valid Vector PDF 1.4 documents with real vector path operators (m, l, c, h, f/f*) and ExtGState opacity", () => {
    for (const style of SLATICO_STYLES) {
      const pdfBytes = buildVectorPdfBytes("bell", style, {
        primaryColor: "#1E293B",
        secondaryColor: "#4F46E5",
        secondaryOpacity: 0.3
      });

      const pdfText = new TextDecoder().decode(pdfBytes);
      expect(pdfText.startsWith("%PDF-1.4\n")).toBe(true);
      expect(pdfText.trimEnd().endsWith("%%EOF")).toBe(true);
      expect(pdfText).toContain("/Type /Catalog");
      expect(pdfText).toContain("/Type /Page");
      expect(pdfText).toContain("/MediaBox [0 0 96 96]");
      expect(pdfText).toContain("/ExtGState");
      // Must contain real vector path operators, not embedded raster XObject images
      expect(pdfText).not.toContain("/Subtype /Image");
      expect(pdfText).toMatch(/\bm\b/);
      expect(pdfText).toMatch(/\bc\b/);
      expect(pdfText).toMatch(/\bf\*?\b/);
    }

    const duotoneLayers = extractSvgVectorLayers(
      buildStandaloneSvg("bell", "duotone", {
        primaryColor: "#112233",
        secondaryColor: "#445566",
        secondaryOpacity: 0.35
      })
    );
    expect(duotoneLayers.length).toBeGreaterThanOrEqual(2);
    expect(duotoneLayers.some((l) => l.opacity === 0.35)).toBe(true);

    const colorLayers = extractSvgVectorLayers(
      buildStandaloneSvg("bell", "color", {
        primaryColor: "#2563EB",
        secondaryColor: "#059669"
      })
    );
    expect(colorLayers.some((l) => l.fillHex.toUpperCase() === "#2563EB")).toBe(true);
    expect(colorLayers.some((l) => l.fillHex.toUpperCase() === "#059669")).toBe(true);
  });

  it("validates WebP RIFF/WEBP magic byte detection", () => {
    const validWebpHeader = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50
    ]);
    const invalidHeader = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d
    ]);
    expect(hasValidWebpMagicBytes(validWebpHeader)).toBe(true);
    expect(hasValidWebpMagicBytes(invalidHeader)).toBe(false);
  });

  it("generates accurate platform code snippets for all 11 supported targets including dual-color Color icons", () => {
    expect(CODE_SNIPPET_PLATFORMS.length).toBe(11);

    for (const platform of CODE_SNIPPET_PLATFORMS) {
      const snippet = generatePlatformCodeSnippet(platform, {
        name: "shield-check",
        pascalName: "ShieldCheck",
        style: "duotone",
        size: 28,
        primaryColor: "#1E293B",
        secondaryColor: "#059669",
        secondaryOpacity: 0.3
      });

      expect(snippet.length).toBeGreaterThan(30);
    }

    const reactColorSnippet = generatePlatformCodeSnippet("react", {
      name: "bell",
      pascalName: "Bell",
      style: "color",
      size: 28,
      primaryColor: "#2563EB",
      secondaryColor: "#059669"
    });
    expect(reactColorSnippet).toContain('color="#2563EB"');
    expect(reactColorSnippet).toContain('secondaryColor="#059669"');

    expect(
      generatePlatformCodeSnippet("react", {
        name: "bell",
        pascalName: "Bell",
        style: "duotone",
        size: 28,
        primaryColor: "#1E293B",
        secondaryColor: "#059669",
        secondaryOpacity: 0.3
      })
    ).toContain("@slatico/react/icons/bell");

    expect(
      generatePlatformCodeSnippet("flutter", {
        name: "bell",
        pascalName: "Bell",
        style: "duotone",
        size: 28,
        primaryColor: "#1E293B",
        secondaryColor: "#059669",
        secondaryOpacity: 0.3
      })
    ).toContain("SlaticoIconName.bell");

    expect(
      generatePlatformCodeSnippet("jetpack-compose", {
        name: "shield-check",
        pascalName: "ShieldCheck",
        style: "duotone",
        size: 28,
        primaryColor: "#1E293B",
        secondaryColor: "#059669",
        secondaryOpacity: 0.3
      })
    ).toContain("SlaticoIconName.SHIELD_CHECK");

    expect(
      generatePlatformCodeSnippet("swiftui", {
        name: "cloud-check",
        pascalName: "CloudCheck",
        style: "duotone",
        size: 28,
        primaryColor: "#1E293B",
        secondaryColor: "#059669",
        secondaryOpacity: 0.3
      })
    ).toContain("SlaticoIcon(");

    // Verify Android XML snippet matches actual generated VectorDrawable resource on disk (slatico_<snake_name>_<style>)
    const androidXmlSnippet = generatePlatformCodeSnippet("android-xml", {
      name: "shield-check",
      pascalName: "ShieldCheck",
      style: "regular",
      size: 24,
      primaryColor: "#010520",
      secondaryColor: "#FF6040"
    });
    expect(androidXmlSnippet).toContain("@drawable/slatico_shield_check_regular");
    expect(
      existsSync(
        path.join(
          ROOT_DIR,
          "packages",
          "android",
          "library",
          "src",
          "main",
          "res",
          "drawable",
          "slatico_shield_check_regular.xml"
        )
      )
    ).toBe(true);

    // Verify Flutter monochrome IconData constant matches actual generated SlaticoIcons.<camelName><PascalStyle>
    const flutterRegularSnippet = generatePlatformCodeSnippet("flutter", {
      name: "shield-check",
      pascalName: "ShieldCheck",
      style: "regular",
      size: 24,
      primaryColor: "#010520",
      secondaryColor: "#FF6040"
    });
    expect(flutterRegularSnippet).toContain("SlaticoIcons.shieldCheckRegular");

    // Verify HTML snippet includes standalone SVG, programmatic @slatico/svg renderSvgMarkup, and @slatico/font class
    const htmlRegularSnippet = generatePlatformCodeSnippet("html", {
      name: "bell",
      pascalName: "Bell",
      style: "regular",
      size: 24,
      primaryColor: "#010520",
      secondaryColor: "#FF6040"
    });
    expect(htmlRegularSnippet).toContain("renderSvgMarkup");
    expect(htmlRegularSnippet).toContain("slatico slatico-regular-bell");

    // Verify UIKit & AppKit snippets with customizable Color style
    const uikitColorSnippet = generatePlatformCodeSnippet("uikit", {
      name: "wallet",
      pascalName: "Wallet",
      style: "color",
      size: 32,
      primaryColor: "#2563EB",
      secondaryColor: "#010520"
    });
    expect(uikitColorSnippet).toContain("UIImage.slatico(");
    expect(uikitColorSnippet).toContain("secondaryColor: UIColor(");

    const appkitColorSnippet = generatePlatformCodeSnippet("appkit", {
      name: "wallet",
      pascalName: "Wallet",
      style: "color",
      size: 32,
      primaryColor: "#2563EB",
      secondaryColor: "#010520"
    });
    expect(appkitColorSnippet).toContain("NSImage.slatico(");
    expect(appkitColorSnippet).toContain("secondaryColor: NSColor(");
  });

  it("emits valid JSON-LD structured data objects", () => {
    const org = buildOrganizationJsonLd();
    const site = buildWebSiteJsonLd();
    const code = buildSoftwareSourceCodeJsonLd();
    const crumbs = buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Icons", path: "/icons" }
    ]);

    expect(() => JSON.stringify([org, site, code, crumbs])).not.toThrow();
    expect(org["@type"]).toBe("Organization");
    expect(site["@type"]).toBe("WebSite");
    expect(code["@type"]).toBe("SoftwareSourceCode");
    expect(crumbs["@type"]).toBe("BreadcrumbList");
  });

  it("verifies static export HTML output when apps/website/out is present", () => {
    const outDir = path.join(WEBSITE_DIR, "out");
    if (!existsSync(outDir)) {
      return;
    }

    const expectedOutputs = [
      "index.html",
      "icons.html",
      "icons/arrow-down.html",
      "icons/arrow-up.html",
      "icons/arrow-up-left.html",
      "icons/arrow-up-right.html",
      "icons/bell.html",
      "icons/shield-check.html",
      "docs.html",
      "docs/react.html",
      "docs/vue.html",
      "docs/html.html",
      "docs/react-native.html",
      "docs/flutter.html",
      "docs/android.html",
      "docs/swift.html",
      "about.html",
      "contact.html",
      "license.html",
      "sitemap.xml",
      "robots.txt",
      "favicon.ico",
      "site.webmanifest",
      "brand/logo.svg",
      "brand/logo-dark.svg",
      "brand/icon.svg",
      "brand/og-image.png"
    ];

    for (const rel of expectedOutputs) {
      const targetPath = path.join(outDir, rel);
      const altIndexPath = path.join(outDir, rel.replace(/\.html$/, ""), "index.html");
      expect(
        existsSync(targetPath) || existsSync(altIndexPath),
        `Expected static export artifact ${rel} in apps/website/out`
      ).toBe(true);
    }

    const sitemapXml = readFileSync(path.join(outDir, "sitemap.xml"), "utf8");
    expect(sitemapXml).toContain("/icons/bell");
    expect(sitemapXml).toContain("/docs/swift");
  });
});
