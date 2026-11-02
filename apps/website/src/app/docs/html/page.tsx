import type { Metadata } from "next";
import { SITE_CONFIG } from "../../../config/site";
import { buildDocsGuideMetadata } from "../../../config/metadata";
import { buildBreadcrumbJsonLd } from "../../../lib/structured-data";
import { DocsCodeBlock } from "../../../components/docs/docs-code-block";

export const metadata: Metadata = buildDocsGuideMetadata("html");

export default function HtmlWebDocsPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Documentation", path: "/docs" },
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
          @slatico/svg · @slatico/web · @slatico/font · v{SITE_CONFIG.version}
        </span>
        <h1 className="mt-1 text-3xl font-bold text-foreground">
          Vanilla HTML, SVG, Web Components &amp; Icon Font Guide
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Use Slatico in any web stack without React or Vue using{" "}
          <code className="font-mono text-primary">@slatico/svg</code> (programmatic inline SVG &amp; sprite sheets),{" "}
          <code className="font-mono text-primary">@slatico/web</code> (Shadow DOM{" "}
          <code className="font-mono text-primary">&lt;slatico-icon&gt;</code> Custom Elements), or{" "}
          <code className="font-mono text-primary">@slatico/font</code> (WOFF2/WOFF/TTF monochrome webfonts).
        </p>
      </div>

      {/* 1. Installation */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">1. Installation</h2>
        <DocsCodeBlock
          title="Terminal (npm / pnpm / yarn)"
          language="bash"
          code={`# Install the package(s) matching your architecture:
npm install @slatico/svg @slatico/web @slatico/font
# or
pnpm add @slatico/svg @slatico/web @slatico/font
# or
yarn add @slatico/svg @slatico/web @slatico/font`}
        />
      </section>

      {/* 2. Programmatic Inline SVG & Sprites (@slatico/svg) */}
      <section id="svg" className="scroll-mt-28 space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          2. HTML / Programmatic SVG (<code className="font-mono text-primary">@slatico/svg</code>)
        </h2>
        <p className="text-sm text-muted-foreground">
          Render accessible, instance-scoped SVG markup in Node.js, Astro, Laravel, PHP, WordPress, or vanilla TypeScript:
        </p>
        <DocsCodeBlock
          title="render-svg.ts"
          language="typescript"
          code={`import { renderSvgMarkup, getSvgAsset, getSvgSprite } from "@slatico/svg";

// 1. Regular monochrome icon (defaults to size=24, color="currentColor")
const regularSvg = renderSvgMarkup("bell", "regular", {
  size: 24,
  color: "#010520",
  title: "Notifications"
});

// 2. Duotone icon with custom primary color, secondaryColor & secondaryOpacity
const duotoneSvg = renderSvgMarkup("shield-check", "duotone", {
  size: 28,
  color: "#010520",
  secondaryColor: "#FF6040",
  secondaryOpacity: 0.25,
  title: "Security Verified"
});

// 3. Color icon with default palette (#FF6040 + #000000) or two custom colors
const colorSvg = renderSvgMarkup("wallet", "color", {
  size: 32,
  color: "#FF6040",
  secondaryColor: "#010520",
  title: "Wallet"
});

// 4. Raw SVG asset & complete style sprite sheet
const asset = getSvgAsset("arrow-up-right", "bold");
const spriteSheet = getSvgSprite("regular");`}
        />
        <div className="overflow-x-auto rounded-[24px] squircle border border-border">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-border bg-surface-muted text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Option (<code className="font-mono">RenderSvgOptions</code>)</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Default</th>
                <th className="px-4 py-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">size</td>
                <td className="px-4 py-3 font-mono">number | string</td>
                <td className="px-4 py-3 font-mono">24</td>
                <td className="px-4 py-3 text-muted-foreground">Width and height attributes on the root <code className="font-mono">&lt;svg&gt;</code> element.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">color</td>
                <td className="px-4 py-3 font-mono">string</td>
                <td className="px-4 py-3 font-mono">&quot;currentColor&quot;</td>
                <td className="px-4 py-3 text-muted-foreground">Primary color (<code className="font-mono">color</code> for monochrome/Duotone; <code className="font-mono">--slatico-primary-color</code> for <code className="font-mono">color</code> style).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">secondaryColor</td>
                <td className="px-4 py-3 font-mono">string</td>
                <td className="px-4 py-3 font-mono">undefined</td>
                <td className="px-4 py-3 text-muted-foreground">Sets <code className="font-mono">--slatico-secondary-color</code> for <code className="font-mono">duotone</code> and <code className="font-mono">color</code> icons.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">secondaryOpacity</td>
                <td className="px-4 py-3 font-mono">number | string</td>
                <td className="px-4 py-3 font-mono">0.2 (in SVG)</td>
                <td className="px-4 py-3 text-muted-foreground">Sets <code className="font-mono">--slatico-secondary-opacity</code> for <code className="font-mono">duotone</code> icons.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">title</td>
                <td className="px-4 py-3 font-mono">string</td>
                <td className="px-4 py-3 font-mono">undefined</td>
                <td className="px-4 py-3 text-muted-foreground">Accessible label (<code className="font-mono">role=&quot;img&quot;</code> + <code className="font-mono">aria-label</code> + <code className="font-mono">&lt;title&gt;</code>).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">className / idPrefix</td>
                <td className="px-4 py-3 font-mono">string</td>
                <td className="px-4 py-3 font-mono">undefined</td>
                <td className="px-4 py-3 text-muted-foreground">Optional CSS class name(s) and unique SVG internal ID suffix.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Native Web Components (<slatico-icon>) */}
      <section id="web-components" className="scroll-mt-28 space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          3. Web Components (<code className="font-mono text-primary">@slatico/web</code>)
        </h2>
        <p className="text-sm text-muted-foreground">
          Register only the icons your page needs with <code className="font-mono text-primary">registerSlaticoIcons</code> and render the standards-compliant{" "}
          <code className="font-mono text-primary">&lt;slatico-icon&gt;</code> custom element anywhere in HTML, Svelte, Angular, or Lit:
        </p>
        <DocsCodeBlock
          title="index.html"
          language="html"
          code={`<script type="module">
  // Bare package imports require a bundler (e.g. Vite) or an import map.
  import { defineSlaticoIconElement, registerSlaticoIcons } from "@slatico/web";
  import { bellIconDef } from "@slatico/web/icons/bell";
  import { shieldCheckIconDef } from "@slatico/web/icons/shield-check";
  import { walletIconDef } from "@slatico/web/icons/wallet";

  registerSlaticoIcons(bellIconDef, shieldCheckIconDef, walletIconDef);
  defineSlaticoIconElement();
</script>

<!-- 1. Monochrome icon (decorative, aria-hidden="true") -->
<slatico-icon name="bell" variant="regular" size="24" color="#010520"></slatico-icon>

<!-- 2. Duotone icon with custom primary + secondary-color + secondary-opacity -->
<slatico-icon
  name="shield-check"
  variant="duotone"
  size="28"
  color="#010520"
  secondary-color="#FF6040"
  secondary-opacity="0.25"
  label="Security Verified"
></slatico-icon>

<!-- 3. Color icon with two customizable colors (color + secondary-color) -->
<slatico-icon
  name="wallet"
  variant="color"
  size="28"
  color="#FF6040"
  secondary-color="#010520"
  label="Wallet"
></slatico-icon>`}
        />
        <div className="overflow-x-auto rounded-[24px] squircle border border-border">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-border bg-surface-muted text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Attribute (<code className="font-mono">&lt;slatico-icon&gt;</code>)</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Default</th>
                <th className="px-4 py-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">name</td>
                <td className="px-4 py-3 font-mono">SlaticoIconName</td>
                <td className="px-4 py-3 font-mono">required</td>
                <td className="px-4 py-3 text-muted-foreground">Canonical kebab-case icon slug (e.g. <code className="font-mono">&quot;bell&quot;</code>, <code className="font-mono">&quot;arrow-up-right&quot;</code>).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">variant</td>
                <td className="px-4 py-3 font-mono">SlaticoStyle</td>
                <td className="px-4 py-3 font-mono">&quot;regular&quot;</td>
                <td className="px-4 py-3 text-muted-foreground">Style variant (<code className="font-mono">thin</code>, <code className="font-mono">light</code>, <code className="font-mono">regular</code>, <code className="font-mono">bold</code>, <code className="font-mono">fill</code>, <code className="font-mono">duotone</code>, <code className="font-mono">color</code>).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">size</td>
                <td className="px-4 py-3 font-mono">number | string</td>
                <td className="px-4 py-3 font-mono">&quot;24&quot;</td>
                <td className="px-4 py-3 text-muted-foreground">Pixel size (<code className="font-mono">&quot;24&quot;</code>) or CSS length (<code className="font-mono">&quot;1.5rem&quot;</code>).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">color</td>
                <td className="px-4 py-3 font-mono">string</td>
                <td className="px-4 py-3 font-mono">&quot;currentColor&quot;</td>
                <td className="px-4 py-3 text-muted-foreground">Primary color or <code className="font-mono">--slatico-primary-color</code> override for <code className="font-mono">color</code> icons.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">secondary-color</td>
                <td className="px-4 py-3 font-mono">string</td>
                <td className="px-4 py-3 font-mono">undefined</td>
                <td className="px-4 py-3 text-muted-foreground">Secondary layer color (<code className="font-mono">--slatico-secondary-color</code>) for <code className="font-mono">duotone</code> and <code className="font-mono">color</code> icons.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">secondary-opacity</td>
                <td className="px-4 py-3 font-mono">number | string</td>
                <td className="px-4 py-3 font-mono">0.2 (in SVG)</td>
                <td className="px-4 py-3 text-muted-foreground">Secondary layer opacity (<code className="font-mono">--slatico-secondary-opacity</code>) for <code className="font-mono">duotone</code> icons.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">label</td>
                <td className="px-4 py-3 font-mono">string</td>
                <td className="px-4 py-3 font-mono">undefined</td>
                <td className="px-4 py-3 text-muted-foreground">Accessible label (<code className="font-mono">role=&quot;img&quot;</code> + <code className="font-mono">aria-label</code>). When omitted, sets <code className="font-mono">aria-hidden=&quot;true&quot;</code>.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Monochrome Icon Font (@slatico/font) */}
      <section id="icon-font" className="scroll-mt-28 space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          4. Monochrome Webfont (<code className="font-mono text-primary">@slatico/font</code>)
        </h2>
        <p className="text-sm text-muted-foreground">
          The 5 monochrome styles (<code className="font-mono text-primary">thin</code>, <code className="font-mono text-primary">light</code>,{" "}
          <code className="font-mono text-primary">regular</code>, <code className="font-mono text-primary">bold</code>,{" "}
          <code className="font-mono text-primary">fill</code> — 135 glyphs total) are compiled into WOFF2, WOFF, and TTF font families using the class pattern{" "}
          <code className="font-mono text-primary">slatico slatico-&lt;name&gt;-&lt;style&gt;</code>:
        </p>
        <DocsCodeBlock
          title="webfont-example.html"
          language="html"
          code={`<!-- With a bundler (Vite, webpack, Next.js): import "@slatico/font/slatico.css"; -->
<!-- Without a bundler, load the published stylesheet from a CDN: -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@slatico/font@0.1.0/dist/slatico.min.css" />

<!-- Decorative monochrome font icons (class="slatico slatico-<name>-<style>") -->
<i class="slatico slatico-bell-regular" style="font-size: 24px; color: #010520;" aria-hidden="true"></i>
<i class="slatico slatico-house-bold" style="font-size: 28px; color: #FF6040;" aria-hidden="true"></i>
<i class="slatico slatico-arrow-up-right-fill" style="font-size: 24px;" aria-hidden="true"></i>

<!-- Accessible monochrome font icon -->
<i class="slatico slatico-shield-check-regular" role="img" aria-label="Security Verified"></i>`}
        />
      </section>
    </article>
  );
}
