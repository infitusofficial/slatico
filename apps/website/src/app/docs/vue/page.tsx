import type { Metadata } from "next";
import { SITE_CONFIG } from "../../../config/site";
import { buildDocsGuideMetadata } from "../../../config/metadata";
import { buildBreadcrumbJsonLd } from "../../../lib/structured-data";
import { DocsCodeBlock } from "../../../components/docs/docs-code-block";

export const metadata: Metadata = buildDocsGuideMetadata("vue");

export default function VueDocsPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Documentation", path: "/docs" },
    { name: "Vue 3 & Nuxt", path: "/docs/vue" }
  ]);

  return (
    <article className="space-y-8 rounded-[32px] squircle border border-border bg-surface p-6 sm:p-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div>
        <span className="font-mono text-xs font-semibold text-primary">
          @slatico/vue · v{SITE_CONFIG.version}
        </span>
        <h1 className="mt-1 text-3xl font-bold text-foreground">
          Vue 3 &amp; Nuxt 3 Integration Guide
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          <code className="font-mono text-primary">@slatico/vue</code> provides first-class Vue 3 Composition API render-function components for all{" "}
          <strong>{SITE_CONFIG.metrics.totalFamilies} Slatico icon families</strong> across all{" "}
          <strong>{SITE_CONFIG.metrics.totalStyles} official styles</strong> ({SITE_CONFIG.metrics.totalVariants} total variants), with SSR-safe ID scoping via Vue&apos;s <code className="font-mono text-primary">useId()</code>.
        </p>
      </div>

      {/* 1. Installation */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">1. Installation</h2>
        <DocsCodeBlock
          title="Terminal (npm / pnpm / yarn)"
          language="bash"
          code={`npm install @slatico/vue
# or
pnpm add @slatico/vue
# or
yarn add @slatico/vue`}
        />
      </section>

      {/* 2. Single-File Component Usage */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          2. Monochrome, Duotone &amp; Dual-Color Usage (<code className="font-mono text-primary">&lt;script setup&gt;</code>)
        </h2>
        <DocsCodeBlock
          title="DashboardToolbar.vue"
          language="vue"
          code={`<script setup lang="ts">
import {
  BellIcon,
  ShieldCheckDuotoneIcon,
  WalletColorIcon
} from "@slatico/vue";
// Or import directly from a per-icon subpath for zero barrel overhead:
import { ArrowUpRightBoldIcon } from "@slatico/vue/icons/arrow-up-right";
</script>

<template>
  <div class="flex items-center gap-4">
    <!-- 1. Regular monochrome icon (defaults to size=24, color="currentColor") -->
    <BellIcon variant="regular" :size="24" color="currentColor" />

    <!-- 2. Customized sizing and explicit color -->
    <ArrowUpRightBoldIcon :size="32" color="#010520" />

    <!-- 3. Duotone icon with custom primary color, secondary-color & secondary-opacity -->
    <ShieldCheckDuotoneIcon
      :size="28"
      color="#010520"
      secondary-color="#FF6040"
      :secondary-opacity="0.25"
      title="Security Verified"
    />

    <!-- 4. Color icon with default brand palette (#FF6040 primary + #000000 secondary) -->
    <WalletColorIcon :size="28" />

    <!-- 5. Color icon with two custom colors (color + secondary-color) -->
    <BellIcon
      variant="color"
      :size="28"
      color="#FF6040"
      secondary-color="#010520"
      title="Notifications"
    />
  </div>
</template>`}
        />
      </section>

      {/* 3. Accessibility & Subpath Imports */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          3. Accessibility &amp; Tree Shaking
        </h2>
        <p className="text-sm text-muted-foreground">
          All Vue components accept extra attributes via Vue&apos;s <code className="font-mono text-primary">attrs</code> fallthrough (<code className="font-mono text-primary">class</code>, <code className="font-mono text-primary">data-*</code>, event listeners). When <code className="font-mono text-primary">title</code> is omitted, <code className="font-mono text-primary">aria-hidden=&quot;true&quot;</code> is applied automatically.
        </p>
        <DocsCodeBlock
          title="Subpath & Accessible Vue Usage"
          language="vue"
          code={`<script setup lang="ts">
import { MagnifyingGlassIcon } from "@slatico/vue/icons/magnifying-glass";
import { BellDuotoneIcon } from "@slatico/vue/icons/bell";
</script>

<template>
  <!-- Decorative icon inside button -->
  <button type="button" class="inline-flex items-center gap-2">
    <MagnifyingGlassIcon :size="18" />
    <span>Search</span>
  </button>

  <!-- Standalone accessible icon -->
  <BellDuotoneIcon :size="24" title="Notifications" />
</template>`}
        />
      </section>

      {/* 4. Complete Props Reference */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          4. Complete Props Reference (<code className="font-mono text-primary">SlaticoVueIconProps</code>)
        </h2>
        <div className="overflow-x-auto rounded-[24px] squircle border border-border">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-border bg-surface-muted text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Prop</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Default</th>
                <th className="px-4 py-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">variant</td>
                <td className="px-4 py-3 font-mono">SlaticoStyle</td>
                <td className="px-4 py-3 font-mono">&quot;regular&quot;</td>
                <td className="px-4 py-3 text-muted-foreground">Visual style (<code className="font-mono">thin</code>, <code className="font-mono">light</code>, <code className="font-mono">regular</code>, <code className="font-mono">bold</code>, <code className="font-mono">fill</code>, <code className="font-mono">duotone</code>, <code className="font-mono">color</code>).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">size</td>
                <td className="px-4 py-3 font-mono">number | string</td>
                <td className="px-4 py-3 font-mono">24</td>
                <td className="px-4 py-3 text-muted-foreground">Width and height of the <code className="font-mono">&lt;svg&gt;</code> element in pixels or CSS units.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">color</td>
                <td className="px-4 py-3 font-mono">string</td>
                <td className="px-4 py-3 font-mono">&quot;currentColor&quot;</td>
                <td className="px-4 py-3 text-muted-foreground">Primary color for monochrome/Duotone icons, or <code className="font-mono">--slatico-primary-color</code> override (default <code className="font-mono">#FF6040</code>) for <code className="font-mono">color</code> icons.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">secondaryColor / secondary-color</td>
                <td className="px-4 py-3 font-mono">string</td>
                <td className="px-4 py-3 font-mono">undefined</td>
                <td className="px-4 py-3 text-muted-foreground">Secondary tone color (<code className="font-mono">--slatico-secondary-color</code>) for <code className="font-mono">duotone</code> and <code className="font-mono">color</code> (default <code className="font-mono">#000000</code>) icons.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">secondaryOpacity / secondary-opacity</td>
                <td className="px-4 py-3 font-mono">number | string</td>
                <td className="px-4 py-3 font-mono">0.2 (in SVG)</td>
                <td className="px-4 py-3 text-muted-foreground">Secondary layer opacity (<code className="font-mono">--slatico-secondary-opacity</code>) for <code className="font-mono">duotone</code> icons.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">title</td>
                <td className="px-4 py-3 font-mono">string</td>
                <td className="px-4 py-3 font-mono">undefined</td>
                <td className="px-4 py-3 text-muted-foreground">Accessible label (<code className="font-mono">role=&quot;img&quot;</code> + <code className="font-mono">aria-label</code> + <code className="font-mono">&lt;title&gt;</code>). When omitted, sets <code className="font-mono">aria-hidden=&quot;true&quot;</code>.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}
