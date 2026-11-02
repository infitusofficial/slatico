import type { Metadata } from "next";
import { SITE_CONFIG } from "../../../config/site";
import { buildDocsGuideMetadata } from "../../../config/metadata";
import { buildBreadcrumbJsonLd } from "../../../lib/structured-data";
import { DocsCodeBlock } from "../../../components/docs/docs-code-block";

export const metadata: Metadata = buildDocsGuideMetadata("swift");

export default function SwiftDocsPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Documentation", path: "/docs" },
    { name: "Apple Swift Package", path: "/docs/swift" }
  ]);

  return (
    <article className="space-y-8 rounded-[32px] squircle border border-border bg-surface p-6 sm:p-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div>
        <span className="font-mono text-xs font-semibold text-primary">
          SlaticoIcons (SwiftPM) · v{SITE_CONFIG.version}
        </span>
        <h1 className="mt-1 text-3xl font-bold text-foreground">
          Apple Native (SwiftUI, UIKit &amp; AppKit) Guide
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The <code className="font-mono text-primary">SlaticoIcons</code> Swift Package provides a zero-dependency CoreGraphics <code className="font-mono text-primary">CGPath</code> vector renderer across iOS 15+, iPadOS 15+, macOS 12+, tvOS 15+, and watchOS 8+ for all{" "}
          <strong>{SITE_CONFIG.metrics.totalFamilies} Slatico icon families</strong> and{" "}
          <strong>{SITE_CONFIG.metrics.totalVariants} style variants</strong> (plus 189 bundled SVG resources in <code className="font-mono text-primary">Bundle.module</code>).
        </p>
      </div>

      {/* 1. Swift Package Manager Installation */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          1. Swift Package Manager (<code className="font-mono text-primary">Package.swift</code>)
        </h2>
        <DocsCodeBlock
          title="Package.swift"
          language="swift"
          code={`// Xcode: File → Add Package Dependencies… →
// https://github.com/infitusofficial/slatico-swift.git (Up to Next Major from 0.1.0)

dependencies: [
    .package(url: "https://github.com/infitusofficial/slatico-swift.git", from: "0.1.0")
],
targets: [
    .target(
        name: "YourApp",
        dependencies: [
            // SwiftPM package identity comes from the URL: "slatico-swift"
            .product(name: "SlaticoIcons", package: "slatico-swift")
        ]
    )
]`}
        />
      </section>

      {/* 2. SwiftUI Usage */}
      <section id="swiftui" className="scroll-mt-28 space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          2. SwiftUI (<code className="font-mono text-primary">SlaticoIcon</code> &amp; Environment Modifiers)
        </h2>
        <DocsCodeBlock
          title="ContentView.swift"
          language="swift"
          code={`import SwiftUI
import SlaticoIcons

struct ContentView: View {
    var body: some View {
        HStack(spacing: 16) {
            // 1. Regular monochrome icon (defaults to size = 24, Color.primary)
            SlaticoIcon(.bell, style: .regular, size: 24)

            // 2. Customized sizing and explicit monochrome color
            SlaticoIcon(
                .arrowUpRight,
                style: .bold,
                size: 32,
                color: Color(red: 0.004, green: 0.020, blue: 0.125),
                accessibilityLabel: "Open Link"
            )

            // 3. Duotone icon with custom primary color, secondaryColor & secondaryOpacity
            SlaticoIcon(
                .shieldCheck,
                style: .duotone,
                size: 28,
                color: Color(red: 0.004, green: 0.020, blue: 0.125),
                secondaryColor: Color(red: 1.0, green: 0.376, blue: 0.251),
                secondaryOpacity: 0.25,
                accessibilityLabel: "Security Verified"
            )

            // 4. Color icon with default brand palette (#FF6040 primary + #000000 secondary)
            SlaticoIcon(.wallet, style: .color, size: 28, accessibilityLabel: "Wallet")

            // 5. Color icon with two custom colors (color + secondaryColor)
            SlaticoIcon(
                .bell,
                style: .color,
                size: 28,
                color: Color(red: 1.0, green: 0.376, blue: 0.251),
                secondaryColor: Color(red: 0.004, green: 0.020, blue: 0.125),
                accessibilityLabel: "Notifications"
            )
        }
    }
}`}
        />
      </section>

      {/* 3. UIKit & AppKit */}
      <section id="uikit" className="scroll-mt-28 space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          3. UIKit (<code className="font-mono text-primary">UIImage.slatico</code>) &amp; AppKit (<code className="font-mono text-primary">NSImage.slatico</code>)
        </h2>
        <DocsCodeBlock
          title="PlatformRenderers.swift"
          language="swift"
          code={`import SlaticoIcons

#if canImport(UIKit)
import UIKit

// 1. Monochrome template UIImage (uses .alwaysTemplate when color is nil)
let bellTemplate = UIImage.slatico(.bell, style: .regular, size: 24)

// 2. Duotone UIImage with custom primary & secondary UIColor
let duotoneImage = UIImage.slatico(
    .shieldCheck,
    style: .duotone,
    size: 28,
    color: UIColor(red: 0.004, green: 0.020, blue: 0.125, alpha: 1.0),
    secondaryColor: UIColor(red: 1.0, green: 0.376, blue: 0.251, alpha: 1.0),
    secondaryOpacity: 0.25
)

// 3. Color UIImage with two custom colors
let colorImage = UIImage.slatico(
    .wallet,
    style: .color,
    size: 28,
    color: UIColor(red: 1.0, green: 0.376, blue: 0.251, alpha: 1.0),
    secondaryColor: .black
)
#endif

#if canImport(AppKit)
import AppKit

// macOS AppKit resolution-independent NSImage
let macIcon = NSImage.slatico(
    .arrowUpRight,
    style: .duotone,
    size: 24,
    color: .labelColor,
    secondaryColor: .systemOrange,
    secondaryOpacity: 0.25
)
#endif`}
        />
      </section>

      {/* 4. Complete SwiftUI & Renderer Parameter Reference */}
      <section id="appkit" className="scroll-mt-28 space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          4. Complete Parameter Reference (<code className="font-mono text-primary">SlaticoIcon</code> / <code className="font-mono text-primary">UIImage.slatico</code> / <code className="font-mono text-primary">NSImage.slatico</code>)
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
                <td className="px-4 py-3 font-mono font-semibold text-primary">_ name / icon</td>
                <td className="px-4 py-3 font-mono">SlaticoIconName</td>
                <td className="px-4 py-3 font-mono">required</td>
                <td className="px-4 py-3 text-muted-foreground">CamelCase enum case (<code className="font-mono">.bell</code>, <code className="font-mono">.shieldCheck</code>, <code className="font-mono">.arrowUpRight</code>).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">style</td>
                <td className="px-4 py-3 font-mono">SlaticoStyle?</td>
                <td className="px-4 py-3 font-mono">.regular</td>
                <td className="px-4 py-3 text-muted-foreground">Visual style (<code className="font-mono">.thin</code>, <code className="font-mono">.light</code>, <code className="font-mono">.regular</code>, <code className="font-mono">.bold</code>, <code className="font-mono">.fill</code>, <code className="font-mono">.duotone</code>, <code className="font-mono">.color</code>).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">size</td>
                <td className="px-4 py-3 font-mono">CGFloat?</td>
                <td className="px-4 py-3 font-mono">24.0</td>
                <td className="px-4 py-3 text-muted-foreground">Width and height in points.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">color</td>
                <td className="px-4 py-3 font-mono">Color? / UIColor? / NSColor?</td>
                <td className="px-4 py-3 font-mono">.primary (#FF6040 in .color)</td>
                <td className="px-4 py-3 text-muted-foreground">Primary foreground color for monochrome, <code className="font-mono">.duotone</code>, and <code className="font-mono">.color</code> styles.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">secondaryColor</td>
                <td className="px-4 py-3 font-mono">Color? / UIColor? / NSColor?</td>
                <td className="px-4 py-3 font-mono">color (#000000 in .color)</td>
                <td className="px-4 py-3 text-muted-foreground">Secondary tone color for <code className="font-mono">.duotone</code> and <code className="font-mono">.color</code> styles.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">secondaryOpacity</td>
                <td className="px-4 py-3 font-mono">Double? / CGFloat?</td>
                <td className="px-4 py-3 font-mono">0.2 (authored SVG)</td>
                <td className="px-4 py-3 text-muted-foreground">Secondary layer opacity (<code className="font-mono">0.0...1.0</code>) for <code className="font-mono">.duotone</code> icons.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">accessibilityLabel</td>
                <td className="px-4 py-3 font-mono">Text? / String?</td>
                <td className="px-4 py-3 font-mono">nil</td>
                <td className="px-4 py-3 text-muted-foreground">VoiceOver accessibility label (SwiftUI). When <code className="font-mono">nil</code>, applies <code className="font-mono">.accessibilityHidden(true)</code>.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}
