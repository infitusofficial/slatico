import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createSSRApp, h as vueH } from "vue";
import { renderToString as renderVueToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";
import { ICON_NAMES, SLATICO_STYLES } from "../packages/core/src/index.js";
import {
  getSpriteSymbolId,
  getSvgAsset,
  getSvgSprite,
  renderSvgMarkup,
  scopeSvgIds,
  SVG_SPRITES
} from "../packages/svg/src/index.js";
import {
  BellColorIcon as ReactBellColorIcon,
  ShieldCheckColorIcon as ReactShieldCheckColorIcon
} from "../packages/react/src/index.js";
import {
  BellBoldIcon as VueBellBoldIcon,
  BellColorIcon as VueBellColorIcon,
  BellDuotoneIcon as VueBellDuotoneIcon,
  BellFillIcon as VueBellFillIcon,
  BellIcon as VueBellIcon,
  BellLightIcon as VueBellLightIcon,
  BellRegularIcon as VueBellRegularIcon,
  BellThinIcon as VueBellThinIcon,
  ShieldCheckColorIcon as VueShieldCheckColorIcon,
  WalletIcon as VueWalletIcon
} from "../packages/vue/src/index.js";
import { BellIcon as DirectVueBellIcon } from "../packages/vue/src/icons/bell.js";
import {
  bellIconDef,
  buildSlaticoWebElementMarkup,
  clearRegisteredSlaticoIcons,
  getRegisteredSlaticoIcon,
  registerSlaticoIcons,
  shieldCheckIconDef
} from "../packages/web/src/index.js";
import { walletIconDef as DirectWebWalletDef } from "../packages/web/src/icons/wallet.js";

const execFileAsync = promisify(execFile);

describe("Phase 2A & Tier 1: @slatico/react & @slatico/svg instance ID scoping & sprites", () => {
  it("scopes SVG gradient/mask/clipPath IDs per rendered instance and renders Tier 1 color icons cleanly", () => {
    const twoColorIcons = renderToStaticMarkup(
      createElement(
        "div",
        null,
        createElement(ReactBellColorIcon, { size: 24 }),
        createElement(ReactBellColorIcon, { size: 32 }),
        createElement(ReactShieldCheckColorIcon, { size: 24 })
      )
    );

    expect(twoColorIcons).toContain('fill="var(--slatico-primary-color, #FF6040)"');
    expect(twoColorIcons).toContain('fill="var(--slatico-secondary-color, #000000)"');
    expect(twoColorIcons).toContain('data-slatico-icon="bell"');
    expect(twoColorIcons).toContain('data-slatico-icon="shield-check"');

    // Verify scopeSvgIds rewrites slatico-* IDs and url(#slatico-*) references deterministically
    const sampleGradSvg =
      '<defs><linearGradient id="slatico-test-grad"><stop stop-color="#FF6040"/></linearGradient></defs><path fill="url(#slatico-test-grad)"/>';
    const scopedA = scopeSvgIds(sampleGradSvg, "instA");
    const scopedB = scopeSvgIds(sampleGradSvg, "instB");
    expect(scopedA).toContain('id="slatico-test-grad-instA"');
    expect(scopedA).toContain('fill="url(#slatico-test-grad-instA)"');
    expect(scopedB).toContain('id="slatico-test-grad-instB"');
    expect(scopedA).not.toBe(scopedB);
  });

  it("provides variant-specific SVG sprites, stable symbol IDs, programmatic lookup, and physical dist files for all 23 Tier 1 icons", async () => {
    for (const style of SLATICO_STYLES) {
      const sprite = getSvgSprite(style);
      expect(sprite).toBe(SVG_SPRITES[style]);
      for (const iconName of ICON_NAMES) {
        expect(sprite).toContain(`<symbol id="slatico-${style}-${iconName}" viewBox="0 0 24 24">`);
      }
      // Ensure demo icons are not leaked into public sprites
      expect(sprite).not.toContain(`id="slatico-${style}-sparkle"`);
      expect(sprite).not.toContain(`id="slatico-${style}-cube"`);
    }

    expect(getSpriteSymbolId("bell", "duotone")).toBe("slatico-duotone-bell");

    const customMarkup = renderSvgMarkup("bell", "duotone", {
      size: 28,
      color: "#4F46E5",
      secondaryColor: "#A855F7",
      secondaryOpacity: 0.4,
      title: "Vanilla Bell",
      className: "vanilla-icon",
      idPrefix: "inst1"
    });
    expect(customMarkup).toContain('width="28"');
    expect(customMarkup).toContain('class="vanilla-icon"');
    expect(customMarkup).toContain("color:#4F46E5");
    expect(customMarkup).toContain("--slatico-secondary-color:#A855F7");
    expect(customMarkup).toContain("--slatico-secondary-opacity:0.4");
    expect(customMarkup).toContain('role="img" aria-label="Vanilla Bell"');
    expect(customMarkup).toContain("<title>Vanilla Bell</title>");

    const asset = getSvgAsset("lock", "duotone");
    expect(asset.svg).toContain("var(--slatico-secondary-color, currentColor)");
    expect(asset.svg).not.toContain("clip0_");
    expect(asset.svg).not.toContain('stroke-width="0.1"');

    // Verify physical built files in packages/svg/dist/icons and packages/svg/dist/sprites
    const repoRoot = process.cwd();
    const physicalSvg = await fs.readFile(
      path.join(repoRoot, "packages/svg/dist/icons/thin/bell.svg"),
      "utf8"
    );
    expect(physicalSvg).toContain('fill="currentColor"');

    const physicalSprite = await fs.readFile(
      path.join(repoRoot, "packages/svg/dist/sprites/slatico-duotone.svg"),
      "utf8"
    );
    expect(physicalSprite).toContain('id="slatico-duotone-wallet"');
    expect(physicalSprite).not.toContain('id="slatico-duotone-cube"');
  });
});

describe("Phase 2A & Tier 1: @slatico/vue Vue 3 SSR & Consumer Application Verification", () => {
  it("renders all 7 variants, custom colors, Duotone props, and accessibility in a Vue 3 SSR app", async () => {
    expect(DirectVueBellIcon).toBe(VueBellIcon);

    const app = createSSRApp({
      render() {
        return vueH("div", { id: "vue-consumer-app" }, [
          vueH(VueBellThinIcon, { size: 20, color: "#111827", class: "vue-thin" }),
          vueH(VueBellLightIcon, { size: 24 }),
          vueH(VueBellRegularIcon, { size: 24 }),
          vueH(VueBellBoldIcon, { size: 24 }),
          vueH(VueBellFillIcon, { size: 24 }),
          vueH(VueBellDuotoneIcon, {
            size: 32,
            color: "#059669",
            secondaryColor: "#F59E0B",
            secondaryOpacity: 0.35,
            title: "Vue Duotone Bell"
          }),
          vueH(VueBellColorIcon, { size: 36 }),
          vueH(VueShieldCheckColorIcon, { size: 28 }),
          vueH(VueWalletIcon, { variant: "duotone", secondaryColor: "#EC4899" })
        ]);
      }
    });

    const html = await renderVueToString(app);
    expect(html).toContain('fill="currentColor"');
    expect(html).toContain("--slatico-secondary-color:#F59E0B");
    expect(html).toContain("--slatico-secondary-opacity:0.35");
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Vue Duotone Bell"');
    expect(html).toContain("<title>Vue Duotone Bell</title>");
    expect(html).toContain('fill="var(--slatico-primary-color, #FF6040)"');
    expect(html).toContain('fill="var(--slatico-secondary-color, #000000)"');
  });
});

describe("Phase 2A & Tier 1: @slatico/web Native Web Components Verification", () => {
  it("supports selective icon registration, all 7 variants, Duotone attributes, and accessibility", () => {
    clearRegisteredSlaticoIcons();
    expect(getRegisteredSlaticoIcon("bell")).toBeUndefined();

    registerSlaticoIcons(bellIconDef, shieldCheckIconDef, DirectWebWalletDef);
    expect(getRegisteredSlaticoIcon("bell")).toBe(bellIconDef);
    expect(getRegisteredSlaticoIcon("wallet")).toBe(DirectWebWalletDef);

    const duotoneMarkup = buildSlaticoWebElementMarkup({
      name: "bell",
      variant: "duotone",
      size: 32,
      color: "#4F46E5",
      secondaryColor: "#EC4899",
      secondaryOpacity: 0.45,
      label: "Custom Element Bell",
      instanceId: "wc-test-1"
    });

    expect(duotoneMarkup).toContain("width:32px;height:32px");
    expect(duotoneMarkup).toContain("color:#4F46E5");
    expect(duotoneMarkup).toContain("--slatico-secondary-color:#EC4899");
    expect(duotoneMarkup).toContain("--slatico-secondary-opacity:0.45");
    expect(duotoneMarkup).toContain('role="img" aria-label="Custom Element Bell"');
    expect(duotoneMarkup).toContain("<title>Custom Element Bell</title>");

    const colorMarkup = buildSlaticoWebElementMarkup({
      name: "bell",
      variant: "color",
      instanceId: "wc-a"
    });
    expect(colorMarkup).toContain('fill="var(--slatico-primary-color, #FF6040)"');
    expect(colorMarkup).toContain('fill="var(--slatico-secondary-color, #000000)"');

    const customColorMarkup = buildSlaticoWebElementMarkup({
      name: "bell",
      variant: "color",
      color: "#2563EB",
      secondaryColor: "#10B981",
      instanceId: "wc-b"
    });
    expect(customColorMarkup).toContain("--slatico-primary-color:#2563EB");
    expect(customColorMarkup).toContain("--slatico-secondary-color:#10B981");
  });
});

describe("Phase 2A & Tier 1: @slatico/react-native Components Verification", () => {
  it("generates valid React Native SVG component trees across all 7 styles, Duotone props, and multicolor vectors", async () => {
    const repoRoot = process.cwd();
    const rnSrc = await import("../packages/react-native/src/index.js");
    const rnSubpathWallet = await import("../packages/react-native/src/icons/wallet.js");

    expect(rnSrc.BellIcon).toBeDefined();
    expect(rnSrc.BellDuotoneIcon).toBeDefined();
    expect(rnSrc.BellColorIcon).toBeDefined();
    expect(rnSubpathWallet.WalletIcon).toBe(rnSrc.WalletIcon);

    // Render the React Native components using the mocked react-native-svg primitives
    const rnDuotoneTree = renderToStaticMarkup(
      createElement(rnSrc.BellDuotoneIcon, {
        size: 32,
        color: "#4F46E5",
        secondaryColor: "#EC4899",
        secondaryOpacity: 0.4,
        title: "Native Duotone Bell"
      })
    );
    expect(rnDuotoneTree).toContain("<svg");
    expect(rnDuotoneTree).toContain('fill="#EC4899"');
    expect(rnDuotoneTree).toContain('opacity="0.4"');
    expect(rnDuotoneTree).toContain('fill="#4F46E5"');
    expect(rnDuotoneTree).toContain('data-accessibility-label="Native Duotone Bell"');

    const rnColorTree = renderToStaticMarkup(
      createElement(
        "div",
        null,
        createElement(rnSrc.BellColorIcon, { size: 28 }),
        createElement(rnSrc.WalletIcon, { variant: "color", size: 36 })
      )
    );
    expect(rnColorTree).toContain('fill="#FF6040"');

    // Also inspect the compiled ESM output of @slatico/react-native
    const distFiles = await fs.readdir(path.join(repoRoot, "packages/react-native/dist"));
    const chunkFiles = distFiles.filter((f) => f.startsWith("chunk-") && f.endsWith(".js"));
    expect(chunkFiles.length).toBeGreaterThanOrEqual(3);

    const combinedChunks = (
      await Promise.all(
        chunkFiles.map((f) =>
          fs.readFile(path.join(repoRoot, "packages/react-native/dist", f), "utf8")
        )
      )
    ).join("\n");

    expect(combinedChunks).toContain("react-native-svg");
    expect(combinedChunks).toContain("resolvedSecondaryColor");
    expect(combinedChunks).toContain("secondaryOpacity");
  });
});

describe("Phase 2A & Tier 1: Isolated Tarball Packing & Consumer Installation Verification", () => {
  it(
    "packs @slatico/core, @slatico/svg, @slatico/react, @slatico/vue, @slatico/web, and @slatico/react-native with pnpm pack and verifies imports in an isolated consumer project",
    async () => {
      const repoRoot = process.cwd();
      const tmpConsumerDir = await fs.mkdtemp(path.join(os.tmpdir(), "slatico-consumer-"));
      const tarballsDir = path.join(tmpConsumerDir, "tarballs");
      await fs.mkdir(tarballsDir, { recursive: true });

      const packagesToPack = [
        "core",
        "svg",
        "react",
        "vue",
        "web",
        "react-native"
      ] as const;

      const isWin = process.platform === "win32";
      const cmd = isWin ? (process.env.ComSpec ?? "cmd.exe") : "pnpm";

      try {
        for (const pkgName of packagesToPack) {
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
        expect(packedFiles.length).toBe(6);

        // Verify unpacked tarball contents for @slatico/core, @slatico/svg, @slatico/react, @slatico/vue, @slatico/web, @slatico/react-native
        const consumerNodeModules = path.join(tmpConsumerDir, "node_modules", "@slatico");
        await fs.mkdir(consumerNodeModules, { recursive: true });

        for (const pkgName of packagesToPack) {
          const tgzFile = packedFiles.find((f) => f.startsWith(`slatico-${pkgName}-`));
          expect(tgzFile).toBeDefined();
          const extractTarget = path.join(consumerNodeModules, pkgName);
          await fs.mkdir(extractTarget, { recursive: true });
          await execFileAsync(
            "tar",
            ["-xzf", path.join(tarballsDir, tgzFile!), "-C", extractTarget, "--strip-components=1"],
            { cwd: tmpConsumerDir }
          );
        }

        // Symlink peer dependencies (react, react-dom, vue) from repo root into isolated consumer node_modules
        for (const peer of ["react", "react-dom", "vue"]) {
          await fs.symlink(
            path.join(repoRoot, "node_modules", peer),
            path.join(tmpConsumerDir, "node_modules", peer),
            "junction"
          );
        }

        // Write and execute an isolated ESM consumer verification script
        const consumerScriptPath = path.join(tmpConsumerDir, "verify-consumer.mjs");
        await fs.writeFile(
          consumerScriptPath,
          `
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { SLATICO_STYLES, ICON_CATALOG, ICON_NAMES } from "@slatico/core";
import { getSvgAsset, getSvgSprite, renderSvgMarkup } from "@slatico/svg";
import { BellIcon } from "@slatico/react";
import { WalletIcon } from "@slatico/react/icons/wallet";
import { ShieldCheckDuotoneIcon as VueShieldDuotone } from "@slatico/vue/icons/shield-check";
import { registerSlaticoIcons, buildSlaticoWebElementMarkup } from "@slatico/web";
import { bellIconDef } from "@slatico/web/icons/bell";

assert.equal(SLATICO_STYLES.length, 7);
assert.equal(ICON_NAMES.length, 23);
assert.equal(ICON_CATALOG.totalIcons, 23);
assert.equal(ICON_CATALOG.totalVariants, 161);

const svgAsset = getSvgAsset("bell", "thin");
assert.ok(svgAsset.svg.includes('fill="currentColor"'));
assert.ok(getSvgSprite("color").includes('id="slatico-color-bell"'));
assert.ok(renderSvgMarkup("wallet", "duotone", { secondaryColor: "#10B981" }).includes("--slatico-secondary-color:#10B981"));

const reactHtml = renderToStaticMarkup(
  createElement("div", null,
    createElement(BellIcon, { variant: "color", size: 28 }),
    createElement(WalletIcon, { variant: "duotone", secondaryColor: "#6366F1" })
  )
);
assert.ok(reactHtml.includes("--slatico-secondary-color:#6366F1"));
assert.ok(reactHtml.includes('fill="var(--slatico-primary-color, #FF6040)"'));

const vueHtml = await renderToString(
  createSSRApp({
    render: () => h(VueShieldDuotone, { size: 30, secondaryColor: "#F59E0B", title: "Consumer Vue Shield" })
  })
);
assert.ok(vueHtml.includes("--slatico-secondary-color:#F59E0B"));
assert.ok(vueHtml.includes("Consumer Vue Shield"));

registerSlaticoIcons(bellIconDef);
const webHtml = buildSlaticoWebElementMarkup({ name: "bell", variant: "bold", size: 24 });
assert.ok(webHtml.includes('fill="currentColor"'));
console.log("ISOLATED_CONSUMER_OK");
`,
          "utf8"
        );

        const { stdout } = await execFileAsync(process.execPath, [consumerScriptPath], {
          cwd: tmpConsumerDir
        });
        expect(stdout).toContain("ISOLATED_CONSUMER_OK");
      } finally {
        await fs.rm(tmpConsumerDir, { recursive: true, force: true });
      }
    },
    30000
  );
});
