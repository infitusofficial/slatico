import type { Metadata } from "next";
import { SITE_CONFIG } from "../../../config/site";
import { buildDocsGuideMetadata } from "../../../config/metadata";
import { buildBreadcrumbJsonLd } from "../../../lib/structured-data";
import { DocsCodeBlock } from "../../../components/docs/docs-code-block";

export const metadata: Metadata = buildDocsGuideMetadata("react-native");

export default function ReactNativeDocsPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Documentation", path: "/docs" },
    { name: "React Native & Expo", path: "/docs/react-native" }
  ]);

  return (
    <article className="space-y-8 rounded-[32px] squircle border border-border bg-surface p-6 sm:p-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div>
        <span className="font-mono text-xs font-semibold text-primary">
          @slatico/react-native · v{SITE_CONFIG.version}
        </span>
        <h1 className="mt-1 text-3xl font-bold text-foreground">
          React Native &amp; Expo Integration Guide
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          <code className="font-mono text-primary">@slatico/react-native</code> renders all{" "}
          <strong>{SITE_CONFIG.metrics.totalVariants} Slatico vector variants</strong> ({SITE_CONFIG.metrics.totalFamilies} families × {SITE_CONFIG.metrics.totalStyles} styles) natively on iOS and Android via{" "}
          <code className="font-mono text-primary">react-native-svg</code>, resolving Duotone and Color layers directly in JavaScript without web-only CSS custom properties.
        </p>
      </div>

      {/* 1. Installation */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">1. Installation</h2>
        <DocsCodeBlock
          title="Terminal (npm / pnpm / yarn / Expo)"
          language="bash"
          code={`npm install @slatico/react-native react-native-svg
# or
pnpm add @slatico/react-native react-native-svg
# or
yarn add @slatico/react-native react-native-svg

# In Expo projects, ensure the compatible react-native-svg binary is installed:
npx expo install react-native-svg`}
        />
      </section>

      {/* 2. Component Usage */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          2. Monochrome, Duotone &amp; Dual-Color Usage
        </h2>
        <DocsCodeBlock
          title="MobileNavigation.tsx"
          language="tsx"
          code={`import { View } from "react-native";
import {
  BellIcon,
  ShieldCheckDuotoneIcon,
  WalletColorIcon
} from "@slatico/react-native";
// Or import directly from a per-icon subpath for Metro tree-shaking:
import { ArrowUpRightBoldIcon } from "@slatico/react-native/icons/arrow-up-right";

export function MobileNavigation() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
      {/* 1. Regular monochrome icon (defaults to size=24, color="#09090B") */}
      <BellIcon variant="regular" size={24} color="#010520" />

      {/* 2. Explicit style component with customized size */}
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
    </View>
  );
}`}
        />
      </section>

      {/* 3. Complete Props Reference */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          3. Complete Props Reference (<code className="font-mono text-primary">SlaticoNativeIconProps</code>)
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
                <td className="px-4 py-3 text-muted-foreground">Width and height in density-independent pixels (<code className="font-mono">dp</code> / <code className="font-mono">pt</code>).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">color</td>
                <td className="px-4 py-3 font-mono">string</td>
                <td className="px-4 py-3 font-mono">&quot;#09090B&quot; (&quot;#FF6040&quot; in color)</td>
                <td className="px-4 py-3 text-muted-foreground">Primary foreground color for monochrome, <code className="font-mono">duotone</code>, and <code className="font-mono">color</code> variants.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">secondaryColor</td>
                <td className="px-4 py-3 font-mono">string</td>
                <td className="px-4 py-3 font-mono">color (&quot;#000000&quot; in color)</td>
                <td className="px-4 py-3 text-muted-foreground">Secondary tone color for <code className="font-mono">duotone</code> and <code className="font-mono">color</code> variants.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">secondaryOpacity</td>
                <td className="px-4 py-3 font-mono">number | string</td>
                <td className="px-4 py-3 font-mono">0.22</td>
                <td className="px-4 py-3 text-muted-foreground">Opacity of the secondary tone layer in <code className="font-mono">duotone</code> icons.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">title / accessibilityLabel</td>
                <td className="px-4 py-3 font-mono">string</td>
                <td className="px-4 py-3 font-mono">undefined</td>
                <td className="px-4 py-3 text-muted-foreground">VoiceOver / TalkBack screen reader label. Sets <code className="font-mono">accessible=&#123;true&#125;</code> and <code className="font-mono">accessibilityRole=&quot;image&quot;</code>; when omitted, hides the icon from accessibility trees.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}
