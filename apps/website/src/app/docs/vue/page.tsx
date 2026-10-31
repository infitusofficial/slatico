import type { Metadata } from "next";
import { buildDocsGuideMetadata } from "../../../config/metadata";
import { buildBreadcrumbJsonLd } from "../../../lib/structured-data";
import { DocsCodeBlock } from "../../../components/docs/docs-code-block";

export const metadata: Metadata = buildDocsGuideMetadata("vue");

export default function VueDocsPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Docs", path: "/docs" },
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
          @slatico/vue · Vue 3 Composition API &amp; Nuxt 3
        </span>
        <h1 className="mt-1 text-3xl font-bold text-foreground">
          Vue 3 &amp; Nuxt Integration Guide
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <code className="font-mono text-foreground">@slatico/vue</code> ships native Vue 3 <code className="font-mono">defineComponent</code> icons supporting reactive <code className="font-mono">variant</code>, <code className="font-mono">size</code>, <code className="font-mono">color</code>, <code className="font-mono">secondaryColor</code>, and <code className="font-mono">secondaryOpacity</code> props across all 7 styles including <code className="font-mono">duotone</code> and <code className="font-mono">color</code>.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">1. Installation</h2>
        <DocsCodeBlock
          title="Terminal (npm / pnpm / yarn)"
          language="bash"
          code={`npm install @slatico/vue
# or with pnpm:
pnpm add @slatico/vue
# or with yarn:
yarn add @slatico/vue

# Inside the Slatico monorepo workspace:
pnpm add @slatico/vue@workspace:*`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          2. Single-File Component (<code>&lt;script setup&gt;</code>) Usage
        </h2>
        <DocsCodeBlock
          title="NotificationHeader.vue"
          language="vue"
          code={`<script setup lang="ts">
import { ref } from "vue";
import { BellIcon } from "@slatico/vue/icons/bell";
import { CloudCheckIcon, CloudCheckColorIcon } from "@slatico/vue/icons/cloud-check";

const activeStyle = ref<"regular" | "duotone" | "color">("duotone");
</script>

<template>
  <div class="flex items-center gap-4">
    <!-- Duotone or Monochrome with reactive props -->
    <BellIcon
      :variant="activeStyle"
      :size="28"
      color="#010520"
      secondary-color="#FF6040"
      :secondary-opacity="0.3"
      title="Notifications"
    />

    <!-- Default Color Icon (#FF6040 Primary + #000000 Secondary) -->
    <CloudCheckIcon variant="color" :size="28" title="Cloud Synced" />

    <!-- Color Icon with custom Primary (color) and Secondary (secondary-color) -->
    <CloudCheckColorIcon
      :size="32"
      color="#059669"
      secondary-color="#010520"
      title="Custom Cloud Status"
    />
  </div>
</template>`}
        />
      </section>
    </article>
  );
}
