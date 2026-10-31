import type { Metadata } from "next";
import { buildDocsGuideMetadata } from "../../../config/metadata";
import { buildBreadcrumbJsonLd } from "../../../lib/structured-data";
import { DocsCodeBlock } from "../../../components/docs/docs-code-block";

export const metadata: Metadata = buildDocsGuideMetadata("flutter");

export default function FlutterDocsPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Docs", path: "/docs" },
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
          slatico_icons · Dart 3 &amp; Flutter 3.24+
        </span>
        <h1 className="mt-1 text-3xl font-bold text-foreground">
          Flutter Integration Guide
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          The <code className="font-mono text-foreground">slatico_icons</code> package (<code className="font-mono">packages/flutter</code>) provides both the universal <code className="font-mono">SlaticoIcon</code> vector widget (supporting all 7 styles including customizable <code className="font-mono">duotone</code> and <code className="font-mono">color</code> icons) and 115 tree-shakeable <code className="font-mono">SlaticoIcons</code> <code className="font-mono">IconData</code> constants.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          1. Add Dependency in `pubspec.yaml`
        </h2>
        <DocsCodeBlock
          title="pubspec.yaml"
          language="yaml"
          code={`dependencies:
  flutter:
    sdk: flutter
  # Published package (or local monorepo path):
  slatico_icons: ^0.1.0
  # Local workspace path alternative:
  # slatico_icons:
  #   path: ../packages/flutter`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          2. Universal `SlaticoIcon` Widget &amp; Customizable Color Icons
        </h2>
        <DocsCodeBlock
          title="lib/main.dart"
          language="dart"
          code={`import 'package:flutter/material.dart';
import 'package:slatico_icons/slatico_icons.dart';

class SlaticoShowcaseRow extends StatelessWidget {
  const SlaticoShowcaseRow({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: const [
        // 1. Monochrome style
        SlaticoIcon(
          SlaticoIconName.house,
          style: SlaticoStyle.regular,
          size: 24,
          color: Color(0xFF010520),
        ),

        // 2. Duotone style with independent secondaryColor & secondaryOpacity
        SlaticoIcon(
          SlaticoIconName.bell,
          style: SlaticoStyle.duotone,
          size: 28,
          color: Color(0xFF010520),
          secondaryColor: Color(0xFFFF6040),
          secondaryOpacity: 0.28,
          semanticLabel: 'Notifications',
        ),

        // 3. Color style — defaults to Primary (#FF6040) & Secondary (#000000)
        SlaticoIcon(
          SlaticoIconName.wallet,
          style: SlaticoStyle.color,
          size: 28,
          semanticLabel: 'Wallet',
        ),

        // 4. Color style with customized Primary (color) & Secondary (secondaryColor)
        SlaticoIcon(
          SlaticoIconName.wallet,
          style: SlaticoStyle.color,
          size: 32,
          color: Color(0xFF2563EB),
          secondaryColor: Color(0xFF010520),
          semanticLabel: 'Custom Branded Wallet',
        ),
      ],
    );
  }
}`}
        />
      </section>
    </article>
  );
}
