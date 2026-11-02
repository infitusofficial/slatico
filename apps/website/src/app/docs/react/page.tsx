import type { Metadata } from "next";
import { SITE_CONFIG } from "../../../config/site";
import { buildDocsGuideMetadata } from "../../../config/metadata";
import { buildBreadcrumbJsonLd } from "../../../lib/structured-data";
import { DocsCodeBlock } from "../../../components/docs/docs-code-block";

export const metadata: Metadata = buildDocsGuideMetadata("react");

export default function ReactDocsPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Documentation", path: "/docs" },
    { name: "React & Next.js", path: "/docs/react" }
  ]);

  return (
    <article className="space-y-8 rounded-[32px] squircle border border-border bg-surface p-6 sm:p-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div>
        <span className="font-mono text-xs font-semibold text-primary">
          @slatico/react · v{SITE_CONFIG.version}
        </span>
        <h1 className="mt-1 text-3xl font-bold text-foreground">
          React &amp; Next.js Integration Guide
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          <code className="font-mono text-primary">@slatico/react</code> provides tree-shakeable, SSR-safe React 18 &amp; 19 SVG components for all{" "}
          <strong>{SITE_CONFIG.metrics.totalFamilies} Slatico icon families</strong> across all{" "}
          <strong>{SITE_CONFIG.metrics.totalStyles} official styles</strong> ({SITE_CONFIG.metrics.totalVariants} total variants).
        </p>
      </div>

      {/* 1. Installation */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">1. Installation</h2>
        <DocsCodeBlock
          title="Terminal (npm / pnpm / yarn)"
          language="bash"
          code={`npm install @slatico/react
# or
pnpm add @slatico/react
# or
yarn add @slatico/react`}
        />
      </section>

      {/* 2. Component Usage Across All Styles */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          2. Monochrome, Duotone &amp; Dual-Color Usage
        </h2>
        <p className="text-sm text-muted-foreground">
          Import either unified <code className="font-mono text-primary">&lt;NameIcon /&gt;</code> components (which accept a{" "}
          <code className="font-mono text-primary">variant</code> prop) or explicit style components such as{" "}
          <code className="font-mono text-primary">BellRegularIcon</code>,{" "}
          <code className="font-mono text-primary">ShieldCheckDuotoneIcon</code>, and{" "}
          <code className="font-mono text-primary">WalletColorIcon</code>:
        </p>
        <DocsCodeBlock
          title="AppHeader.tsx"
          language="tsx"
          code={`import {
  BellIcon,
  ShieldCheckDuotoneIcon,
  WalletColorIcon,
  ArrowUpRightBoldIcon
} from "@slatico/react";

export function AppHeader() {
  return (
    <header className="flex items-center gap-4">
      {/* 1. Regular monochrome icon (defaults to size=24, color="currentColor") */}
      <BellIcon variant="regular" size={24} color="currentColor" />

      {/* 2. Customized sizing and explicit hex color */}
      <ArrowUpRightBoldIcon size={32} color="#010520" />

      {/* 3. Duotone icon with primary color, secondaryColor & secondaryOpacity */}
      <ShieldCheckDuotoneIcon
        size={28}
        color="#010520"
        secondaryColor="#FF6040"
        secondaryOpacity={0.25}
        title="Security Verified"
      />

      {/* 4. Color icon with default brand palette (#FF6040 primary + #000000 secondary) */}
      <WalletColorIcon size={28} />

      {/* 5. Color icon with two custom colors (color + secondaryColor) */}
      <BellIcon
        variant="color"
        size={28}
        color="#FF6040"
        secondaryColor="#010520"
        title="Notifications"
      />
    </header>
  );
}`}
        />
      </section>

      {/* 3. Subpath Imports & Tree Shaking */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          3. Subpath Imports &amp; Tree Shaking
        </h2>
        <p className="text-sm text-muted-foreground">
          <code className="font-mono text-primary">@slatico/react</code> sets{" "}
          <code className="font-mono text-primary">&quot;sideEffects&quot;: false</code> and exposes per-icon subpath modules under{" "}
          <code className="font-mono text-primary">@slatico/react/icons/&lt;slug&gt;</code> for instant dev-server startup and minimal production bundles:
        </p>
        <DocsCodeBlock
          title="SubpathImportExample.tsx"
          language="tsx"
          code={`import { BellIcon, BellDuotoneIcon } from "@slatico/react/icons/bell";
import { ArrowUpRightIcon } from "@slatico/react/icons/arrow-up-right";

export function ActionBadge() {
  return (
    <span className="inline-flex items-center gap-2">
      <BellDuotoneIcon size={20} color="#010520" secondaryColor="#FF6040" />
      <ArrowUpRightIcon variant="bold" size={16} />
    </span>
  );
}`}
        />
      </section>

      {/* 4. Accessibility Usage */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          4. Accessibility Usage
        </h2>
        <p className="text-sm text-muted-foreground">
          When <code className="font-mono text-primary">title</code> is omitted, the component renders{" "}
          <code className="font-mono text-primary">aria-hidden=&quot;true&quot;</code> so decorative icons inside buttons or links are ignored by screen readers. Pass{" "}
          <code className="font-mono text-primary">title</code> when the icon conveys standalone semantic meaning:
        </p>
        <DocsCodeBlock
          title="AccessibleIcons.tsx"
          language="tsx"
          code={`import { BellIcon, MagnifyingGlassIcon } from "@slatico/react";

export function AccessibleIcons() {
  return (
    <>
      {/* Decorative icon next to visible button text (aria-hidden="true") */}
      <button type="button" className="inline-flex items-center gap-2">
        <MagnifyingGlassIcon size={18} />
        <span>Search Icons</span>
      </button>

      {/* Standalone semantic icon (role="img" + aria-label + <title>) */}
      <BellIcon variant="duotone" size={24} title="3 Unread Notifications" />
    </>
  );
}`}
        />
      </section>

      {/* 5. Complete Props API Reference */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          5. Complete Props Reference (<code className="font-mono text-primary">SlaticoIconProps</code>)
        </h2>
        <p className="text-sm text-muted-foreground">
          All components forward <code className="font-mono text-primary">ref</code> to the root{" "}
          <code className="font-mono text-primary">SVGSVGElement</code> and accept standard React{" "}
          <code className="font-mono text-primary">SVGProps&lt;SVGSVGElement&gt;</code> in addition to:
        </p>
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
                <td className="px-4 py-3 font-mono">&quot;thin&quot; | &quot;light&quot; | &quot;regular&quot; | &quot;bold&quot; | &quot;fill&quot; | &quot;duotone&quot; | &quot;color&quot;</td>
                <td className="px-4 py-3 font-mono">&quot;regular&quot;</td>
                <td className="px-4 py-3 text-muted-foreground">Selects the architectural style on unified <code className="font-mono">*Icon</code> components.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">size</td>
                <td className="px-4 py-3 font-mono">number | string</td>
                <td className="px-4 py-3 font-mono">24</td>
                <td className="px-4 py-3 text-muted-foreground">Sets SVG width and height in pixels (<code className="font-mono">24</code>) or CSS units (<code className="font-mono">&quot;1.5rem&quot;</code>).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">color</td>
                <td className="px-4 py-3 font-mono">string</td>
                <td className="px-4 py-3 font-mono">&quot;currentColor&quot;</td>
                <td className="px-4 py-3 text-muted-foreground">Primary foreground color for monochrome and Duotone icons, or custom primary fill (<code className="font-mono">--slatico-primary-color</code>, default <code className="font-mono">#FF6040</code>) for <code className="font-mono">color</code> icons.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">secondaryColor</td>
                <td className="px-4 py-3 font-mono">string</td>
                <td className="px-4 py-3 font-mono">undefined</td>
                <td className="px-4 py-3 text-muted-foreground">Binds <code className="font-mono">--slatico-secondary-color</code> for <code className="font-mono">duotone</code> and <code className="font-mono">color</code> (default <code className="font-mono">#000000</code>) icons.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">secondaryOpacity</td>
                <td className="px-4 py-3 font-mono">number | string</td>
                <td className="px-4 py-3 font-mono">0.2 (in SVG)</td>
                <td className="px-4 py-3 text-muted-foreground">Binds <code className="font-mono">--slatico-secondary-opacity</code> for <code className="font-mono">duotone</code> secondary layers.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">title</td>
                <td className="px-4 py-3 font-mono">string</td>
                <td className="px-4 py-3 font-mono">undefined</td>
                <td className="px-4 py-3 text-muted-foreground">Accessible label. When provided, sets <code className="font-mono">role=&quot;img&quot;</code>, <code className="font-mono">aria-label</code>, and renders a <code className="font-mono">&lt;title&gt;</code> node; otherwise sets <code className="font-mono">aria-hidden=&quot;true&quot;</code>.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}
