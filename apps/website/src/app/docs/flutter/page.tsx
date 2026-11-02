import type { Metadata } from "next";
import { SITE_CONFIG } from "../../../config/site";
import { buildDocsGuideMetadata } from "../../../config/metadata";
import { buildBreadcrumbJsonLd } from "../../../lib/structured-data";
import { DocsCodeBlock } from "../../../components/docs/docs-code-block";

export const metadata: Metadata = buildDocsGuideMetadata("flutter");

export default function FlutterDocsPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Documentation", path: "/docs" },
    { name: "Flutter", path: "/docs/flutter" }
  ]);

  return (
    <article className="space-y-8 rounded-[32px] squircle border border-border bg-surface p-6 sm:p-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div>
        <span className="font-mono text-xs font-semibold text-primary">
          slatico_icons · v{SITE_CONFIG.version}
        </span>
        <h1 className="mt-1 text-3xl font-bold text-foreground">
          Flutter Integration Guide (iOS, Android, Web &amp; Desktop)
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          <code className="font-mono text-primary">slatico_icons</code> delivers all{" "}
          <strong>{SITE_CONFIG.metrics.totalFamilies} Slatico icon families</strong> across all{" "}
          <strong>{SITE_CONFIG.metrics.totalStyles} official styles</strong> ({SITE_CONFIG.metrics.totalVariants} total variants):{" "}
          <strong>135 native TTF <code className="font-mono">IconData</code> glyphs</strong> for the 5 monochrome styles (<code className="font-mono">thin</code>, <code className="font-mono">light</code>, <code className="font-mono">regular</code>, <code className="font-mono">bold</code>, <code className="font-mono">fill</code>) and{" "}
          <strong>54 vector SVG templates</strong> for <code className="font-mono">duotone</code> and <code className="font-mono">color</code> via <code className="font-mono">flutter_svg</code>.
        </p>
      </div>

      {/* 1. Installation */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          1. Installation (<code className="font-mono text-primary">pubspec.yaml</code>)
        </h2>
        <DocsCodeBlock
          title="pubspec.yaml / Terminal"
          language="yaml"
          code={`# 1. Install from pub.dev:
dependencies:
  slatico_icons: ^0.1.0

# Or via Flutter CLI:
# flutter pub add slatico_icons

# 2. Contributors only — use a local monorepo checkout:
dependencies:
  slatico_icons:
    path: ../slatico/packages/flutter`}
        />
      </section>

      {/* 2. SlaticoIcon Widget Usage */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          2. Unified <code className="font-mono text-primary">SlaticoIcon</code> Widget &amp; Native <code className="font-mono text-primary">IconData</code>
        </h2>
        <DocsCodeBlock
          title="main.dart"
          language="dart"
          code={`import 'package:flutter/material.dart';
import 'package:slatico_icons/slatico_icons.dart';

class ToolbarExample extends StatelessWidget {
  const ToolbarExample({super.key});

  @override
  Widget build(BuildContext context) {
    return const Row(
      children: [
        // 1. Native Flutter Icon with bundled monochrome TTF IconData
        Icon(SlaticoIcons.houseRegular, size: 24, color: Color(0xFF010520)),
        Icon(SlaticoIcons.arrowUpRightBold, size: 24, color: Color(0xFF010520)),

        // 2. Unified SlaticoIcon widget (Monochrome — delegates to native Icon)
        SlaticoIcon(
          name: SlaticoIconName.bell,
          style: SlaticoStyle.regular,
          size: 24,
          color: Color(0xFF010520),
        ),

        // 3. Duotone style with primary color, secondaryColor & secondaryOpacity
        SlaticoIcon(
          name: SlaticoIconName.shieldCheck,
          style: SlaticoStyle.duotone,
          size: 28,
          color: Color(0xFF010520),
          secondaryColor: Color(0xFFFF6040),
          secondaryOpacity: 0.25,
          semanticLabel: 'Security Verified',
        ),

        // 4. Color style with default brand palette (#FF6040 primary + #000000 secondary)
        SlaticoIcon(
          name: SlaticoIconName.wallet,
          style: SlaticoStyle.color,
          size: 28,
          semanticLabel: 'Wallet',
        ),

        // 5. Color style with two custom colors (color + secondaryColor)
        SlaticoIcon(
          name: SlaticoIconName.bell,
          style: SlaticoStyle.color,
          size: 28,
          color: Color(0xFFFF6040),
          secondaryColor: Color(0xFF010520),
          semanticLabel: 'Notifications',
        ),
      ],
    );
  }
}`}
        />
      </section>

      {/* 3. Subtree Theming */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          3. Subtree Styling with <code className="font-mono text-primary">SlaticoIconTheme</code>
        </h2>
        <DocsCodeBlock
          title="theme_example.dart"
          language="dart"
          code={`SlaticoIconTheme(
  data: const SlaticoIconThemeData(
    style: SlaticoStyle.duotone,
    size: 24,
    color: Color(0xFF010520),
    secondaryColor: Color(0xFFFF6040),
    secondaryOpacity: 0.22,
  ),
  child: const Row(
    children: [
      SlaticoIcon(name: SlaticoIconName.bell),
      SlaticoIcon(name: SlaticoIconName.layoutDashboard),
      SlaticoIcon(name: SlaticoIconName.arrowUpRight),
    ],
  ),
)`}
        />
      </section>

      {/* 4. Complete Parameter Reference */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          4. Complete Parameter Reference (<code className="font-mono text-primary">SlaticoIcon</code>)
        </h2>
        <div className="overflow-x-auto rounded-[24px] squircle border border-border">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-border bg-surface-muted text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Parameter</th>
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
                <td className="px-4 py-3 text-muted-foreground">CamelCase enum constant (<code className="font-mono">SlaticoIconName.bell</code>, <code className="font-mono">SlaticoIconName.arrowUpRight</code>).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">style</td>
                <td className="px-4 py-3 font-mono">SlaticoStyle?</td>
                <td className="px-4 py-3 font-mono">SlaticoStyle.regular</td>
                <td className="px-4 py-3 text-muted-foreground">Style variant (<code className="font-mono">thin</code>, <code className="font-mono">light</code>, <code className="font-mono">regular</code>, <code className="font-mono">bold</code>, <code className="font-mono">fill</code>, <code className="font-mono">duotone</code>, <code className="font-mono">color</code>).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">size</td>
                <td className="px-4 py-3 font-mono">double?</td>
                <td className="px-4 py-3 font-mono">24.0</td>
                <td className="px-4 py-3 text-muted-foreground">Width and height in logical pixels (falls back to <code className="font-mono">SlaticoIconTheme</code> or <code className="font-mono">IconTheme</code>).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">color</td>
                <td className="px-4 py-3 font-mono">Color?</td>
                <td className="px-4 py-3 font-mono">IconTheme color (#FF6040 in color)</td>
                <td className="px-4 py-3 text-muted-foreground">Primary foreground color for monochrome, <code className="font-mono">duotone</code>, and <code className="font-mono">color</code> styles.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">secondaryColor</td>
                <td className="px-4 py-3 font-mono">Color?</td>
                <td className="px-4 py-3 font-mono">color (#000000 in color)</td>
                <td className="px-4 py-3 text-muted-foreground">Secondary tone color for <code className="font-mono">duotone</code> and <code className="font-mono">color</code> styles.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">secondaryOpacity</td>
                <td className="px-4 py-3 font-mono">double?</td>
                <td className="px-4 py-3 font-mono">0.2 (authored SVG)</td>
                <td className="px-4 py-3 text-muted-foreground">Opacity (<code className="font-mono">0.0</code>–<code className="font-mono">1.0</code>) for the secondary layer in <code className="font-mono">SlaticoStyle.duotone</code>.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">semanticLabel</td>
                <td className="px-4 py-3 font-mono">String?</td>
                <td className="px-4 py-3 font-mono">null</td>
                <td className="px-4 py-3 text-muted-foreground">TalkBack / VoiceOver label. When <code className="font-mono">null</code>, sets <code className="font-mono">excludeFromSemantics: true</code>.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}
