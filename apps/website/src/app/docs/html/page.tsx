import type { Metadata } from "next";
import { buildDocsGuideMetadata } from "../../../config/metadata";
import { buildBreadcrumbJsonLd } from "../../../lib/structured-data";
import { DocsCodeBlock } from "../../../components/docs/docs-code-block";

export const metadata: Metadata = buildDocsGuideMetadata("html");

export default function HtmlDocsPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Docs", path: "/docs" },
    { name: "HTML, SVG & Web Components", path: "/docs/html" }
  ]);

  return (
    <article className="space-y-8 rounded-[32px] squircle border border-border bg-surface p-6 sm:p-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div>
        <span className="font-mono text-xs font-semibold text-primary">
          @slatico/svg · @slatico/web · @slatico/font
        </span>
        <h1 className="mt-1 text-3xl font-bold text-foreground">
          Vanilla HTML, SVG Sprites, Web Components &amp; Icon Fonts
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Use Slatico without any frontend framework via programmatic SVG strings, <code className="font-mono">&lt;slatico-icon&gt;</code> Custom Elements with Shadow DOM isolation, or WOFF2/TTF CSS icon fonts.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">1. Installation</h2>
        <DocsCodeBlock
          title="Terminal (npm / pnpm / yarn)"
          language="bash"
          code={`npm install @slatico/web @slatico/svg @slatico/font
# or with pnpm:
pnpm add @slatico/web @slatico/svg @slatico/font`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          2. Native Web Components (`@slatico/web`)
        </h2>
        <DocsCodeBlock
          title="index.html"
          language="html"
          code={`<script type="module">
  import { defineSlaticoIconElement, registerSlaticoIcons } from "@slatico/web";
  import { bellIconDef } from "@slatico/web/icons/bell";
  import { shieldCheckIconDef } from "@slatico/web/icons/shield-check";
  import { walletIconDef } from "@slatico/web/icons/wallet";

  registerSlaticoIcons(bellIconDef, shieldCheckIconDef, walletIconDef);
  defineSlaticoIconElement();
</script>

<!-- Duotone icon with custom primary & secondary colors -->
<slatico-icon
  name="bell"
  variant="duotone"
  size="28"
  color="#010520"
  secondary-color="#FF6040"
  secondary-opacity="0.3"
  label="Notifications"
></slatico-icon>

<!-- Color icon with custom primary (#2563EB) & secondary (#010520) colors -->
<slatico-icon
  name="wallet"
  variant="color"
  size="32"
  color="#2563EB"
  secondary-color="#010520"
  label="Wallet"
></slatico-icon>`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          3. Programmatic SVG &amp; Sprite Sheets (`@slatico/svg`)
        </h2>
        <DocsCodeBlock
          title="render-svg.ts"
          language="ts"
          code={`import { renderSvgMarkup, getSvgSprite, getSpriteSymbolId } from "@slatico/svg";

// Render a standalone accessible <svg> string (supports monochrome, duotone, and color):
const svgHtml = renderSvgMarkup("shield-check", "color", {
  size: 28,
  color: "#FF6040",
  secondaryColor: "#010520",
  title: "Verified"
});

// Or inject a style sprite sheet and reference <use href="#slatico-regular-bell" />:
const regularSprite = getSvgSprite("regular");
const symbolId = getSpriteSymbolId("bell", "regular"); // "slatico-regular-bell"`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          4. Webfonts (`@slatico/font`)
        </h2>
        <p className="text-sm text-muted-foreground">
          Includes WOFF2, WOFF, and TTF fonts for the 5 monochrome styles (<code className="font-mono">thin</code>, <code className="font-mono">light</code>, <code className="font-mono">regular</code>, <code className="font-mono">bold</code>, <code className="font-mono">fill</code>):
        </p>
        <DocsCodeBlock
          title="HTML Webfont Classes"
          language="html"
          code={`<link rel="stylesheet" href="node_modules/@slatico/font/dist/slatico.css" />

<i class="slatico slatico-regular-house" style="font-size: 24px;" aria-hidden="true"></i>
<i class="slatico slatico-bold-bell" style="font-size: 24px;" aria-hidden="true"></i>
<i class="slatico slatico-fill-shield-check" style="font-size: 24px;" aria-hidden="true"></i>`}
        />
      </section>
    </article>
  );
}
