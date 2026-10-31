import type { Metadata } from "next";
import { buildDocsGuideMetadata } from "../../../config/metadata";
import { buildBreadcrumbJsonLd } from "../../../lib/structured-data";
import { DocsCodeBlock } from "../../../components/docs/docs-code-block";

export const metadata: Metadata = buildDocsGuideMetadata("swift");

export default function SwiftDocsPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Docs", path: "/docs" },
    { name: "Apple Swift", path: "/docs/swift" }
  ]);

  return (
    <article className="space-y-8 rounded-[32px] squircle border border-border bg-surface p-6 sm:p-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div>
        <span className="font-mono text-xs font-semibold text-primary">
          SlaticoIcons · SwiftUI, UIKit &amp; AppKit (iOS 15+ / macOS 12+)
        </span>
        <h1 className="mt-1 text-3xl font-bold text-foreground">
          Apple Native Integration Guide (SwiftUI, UIKit &amp; AppKit)
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <code className="font-mono text-foreground">SlaticoIcons</code> (<code className="font-mono">packages/swift</code>) is a zero-dependency Swift Package powered by a deterministic CoreGraphics <code className="font-mono">CGPath</code> vector engine supporting customizable <code className="font-mono">.duotone</code> and <code className="font-mono">.color</code> icons.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          1. Swift Package Manager (`Package.swift`)
        </h2>
        <DocsCodeBlock
          title="Package.swift"
          language="swift"
          code={`dependencies: [
    .package(url: "https://github.com/infitusofficial/slatico.git", from: "0.1.0"),
    // Or local monorepo path:
    // .package(path: "../slatico/packages/swift")
],
targets: [
    .target(
        name: "YourApp",
        dependencies: [
            .product(name: "SlaticoIcons", package: "SlaticoIcons")
        ]
    )
]`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          2. SwiftUI (`SlaticoIcon` &amp; `SlaticoIconTheme`)
        </h2>
        <DocsCodeBlock
          title="ContentView.swift"
          language="swift"
          code={`import SwiftUI
import SlaticoIcons

struct HeaderIconsView: View {
    var body: some View {
        HStack(spacing: 16) {
            // 1. Monochrome style
            SlaticoIcon(.house, style: .regular, size: 24, color: .primary)

            // 2. Duotone with independent primary & secondary colors + opacity
            SlaticoIcon(
                .bell,
                style: .duotone,
                size: 28,
                color: .primary,
                secondaryColor: .orange,
                secondaryOpacity: 0.28,
                accessibilityLabel: "Notifications"
            )

            // 3. Color style — defaults to Primary (#FF6040) & Secondary (#000000)
            SlaticoIcon(.wallet, style: .color, size: 28, accessibilityLabel: "Wallet")

            // 4. Color style with customized Primary (color) & Secondary (secondaryColor)
            SlaticoIcon(
                .wallet,
                style: .color,
                size: 32,
                color: .blue,
                secondaryColor: .primary,
                accessibilityLabel: "Custom Branded Wallet"
            )
        }
    }
}`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          3. UIKit (`UIImage.slatico`) &amp; AppKit (`NSImage.slatico`)
        </h2>
        <DocsCodeBlock
          title="PlatformImages.swift"
          language="swift"
          code={`import SlaticoIcons

#if canImport(UIKit)
import UIKit
let bellImage = UIImage.slatico(
    .bell,
    style: .duotone,
    size: 28,
    color: .label,
    secondaryColor: .systemOrange,
    secondaryOpacity: 0.28
)
#endif

#if canImport(AppKit)
import AppKit
let macShieldImage = NSImage.slatico(
    .shieldCheck,
    style: .color,
    size: 28,
    color: .systemBlue,
    secondaryColor: .labelColor
)
#endif`}
        />
      </section>
    </article>
  );
}
