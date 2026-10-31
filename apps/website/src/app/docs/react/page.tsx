import type { Metadata } from "next";
import { buildDocsGuideMetadata } from "../../../config/metadata";
import { buildBreadcrumbJsonLd } from "../../../lib/structured-data";
import { DocsCodeBlock } from "../../../components/docs/docs-code-block";

export const metadata: Metadata = buildDocsGuideMetadata("react");

export default function ReactDocsPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Docs", path: "/docs" },
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
          @slatico/react · React 18 / 19 &amp; Next.js App Router
        </span>
        <h1 className="mt-1 text-3xl font-bold text-foreground">
          React &amp; Next.js Integration Guide
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <code className="font-mono text-foreground">@slatico/react</code> provides tree-shakeable ESM and CJS components for all 23 Slatico icon families across all 7 styles, with full TypeScript definitions and React Server Component compatibility.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">1. Installation</h2>
        <p className="text-sm text-muted-foreground">
          Install <code className="font-mono text-foreground">@slatico/react</code> using your preferred package manager:
        </p>
        <DocsCodeBlock
          title="Terminal (npm / pnpm / yarn)"
          language="bash"
          code={`npm install @slatico/react
# or with pnpm:
pnpm add @slatico/react
# or with yarn:
yarn add @slatico/react

# Inside the Slatico monorepo workspace:
pnpm add @slatico/react@workspace:*`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          2. Tree-Shakeable Subpath &amp; Barrel Imports
        </h2>
        <p className="text-sm text-muted-foreground">
          Import individual icon components from subpath exports (<code className="font-mono">@slatico/react/icons/&lt;slug&gt;</code>) for zero-unused-icon bundling, or from the root entry (<code className="font-mono">@slatico/react</code>):
        </p>
        <DocsCodeBlock
          title="DashboardCard.tsx"
          language="tsx"
          code={`import { BellIcon } from "@slatico/react/icons/bell";
import { ShieldCheckIcon } from "@slatico/react/icons/shield-check";
import { WalletIcon, WalletColorIcon } from "@slatico/react/icons/wallet";

export function SecurityBanner() {
  return (
    <div className="flex items-center gap-3">
      {/* 1. Monochrome style (thin | light | regular | bold | fill) */}
      <BellIcon variant="regular" size={24} color="currentColor" />

      {/* 2. Duotone style with independent secondary color and opacity */}
      <ShieldCheckIcon
        variant="duotone"
        size={28}
        color="#010520"
        secondaryColor="#FF6040"
        secondaryOpacity={0.28}
        title="Verified Security"
      />

      {/* 3. Color style — defaults to Primary (#FF6040) & Secondary (#000000) */}
      <WalletIcon variant="color" size={28} title="Account Wallet" />

      {/* 4. Color style with customized Primary (color) & Secondary (secondaryColor) */}
      <WalletColorIcon
        size={32}
        color="#2563EB"
        secondaryColor="#0F172A"
        title="Custom Branded Wallet"
      />
    </div>
  );
}`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          3. Component Props (`SlaticoIconProps`)
        </h2>
        <DocsCodeBlock
          title="TypeScript Interface"
          language="ts"
          code={`export interface SlaticoIconProps extends Omit<SVGProps<SVGSVGElement>, "color"> {
  /** Icon style variant (default: "regular") */
  variant?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone" | "color";
  /** Width and height in px or CSS units (default: 24) */
  size?: number | string;
  /** Primary stroke/fill color for monochrome, duotone, and color (#FF6040 default) styles */
  color?: string;
  /** Secondary layer fill color for duotone and color (#000000 default) styles */
  secondaryColor?: string;
  /** Secondary layer opacity (0..1) for duotone style (default: 0.2) */
  secondaryOpacity?: number | string;
  /** Accessible <title> and role="img" label; omit for decorative aria-hidden="true" icons */
  title?: string;
}`}
        />
      </section>
    </article>
  );
}
