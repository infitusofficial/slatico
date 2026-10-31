import type { Metadata } from "next";
import { SITE_CONFIG } from "../../../config/site";
import { buildDocsGuideMetadata } from "../../../config/metadata";
import { buildBreadcrumbJsonLd } from "../../../lib/structured-data";
import { DocsCodeBlock } from "../../../components/docs/docs-code-block";

export const metadata: Metadata = buildDocsGuideMetadata("android");

export default function AndroidDocsPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Documentation", path: "/docs" },
    { name: "Android Native", path: "/docs/android" }
  ]);

  return (
    <article className="space-y-8 rounded-[32px] squircle border border-border bg-surface p-6 sm:p-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div>
        <span className="font-mono text-xs font-semibold text-primary">
          dev.slatico:slatico-android · v{SITE_CONFIG.version}
        </span>
        <h1 className="mt-1 text-3xl font-bold text-foreground">
          Android Native (Jetpack Compose &amp; VectorDrawable XML)
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          <code className="font-mono text-primary">dev.slatico:slatico-android</code> packages all{" "}
          <strong>{SITE_CONFIG.metrics.totalVariants} native Android VectorDrawable XML resources</strong> ({SITE_CONFIG.metrics.totalFamilies} families across all {SITE_CONFIG.metrics.totalStyles} styles) along with a Jetpack Compose{" "}
          <code className="font-mono text-primary">SlaticoIcon</code> composable supporting runtime Duotone and dual-color <code className="font-mono text-primary">COLOR</code> path customization.
        </p>
      </div>

      {/* 1. Gradle Setup */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          1. Gradle Installation (<code className="font-mono text-primary">build.gradle.kts</code>)
        </h2>
        <DocsCodeBlock
          title="build.gradle.kts"
          language="kotlin"
          code={`// Maven Central dependency:
dependencies {
    implementation("dev.slatico:slatico-android:0.1.0")
}

// Or local monorepo composite build in settings.gradle.kts:
// includeBuild("../slatico/packages/android")`}
        />
      </section>

      {/* 2. Jetpack Compose */}
      <section id="compose" className="scroll-mt-28 space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          2. Jetpack Compose (<code className="font-mono text-primary">SlaticoIcon</code> &amp; <code className="font-mono text-primary">SlaticoIconTheme</code>)
        </h2>
        <DocsCodeBlock
          title="MainScreen.kt"
          language="kotlin"
          code={`import androidx.compose.foundation.layout.Row
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.infitus.slatico.SlaticoIcon
import com.infitus.slatico.SlaticoIconName
import com.infitus.slatico.SlaticoStyle

@Composable
fun HeaderActions() {
    Row {
        // 1. Monochrome icon (defaults to size = 24.dp, LocalContentColor.current)
        SlaticoIcon(
            name = SlaticoIconName.BELL,
            style = SlaticoStyle.REGULAR,
            size = 24.dp,
            color = Color(0xFF010520),
            contentDescription = "Notifications"
        )

        // 2. Duotone icon with custom primary color, secondaryColor & secondaryAlpha
        SlaticoIcon(
            name = SlaticoIconName.SHIELD_CHECK,
            style = SlaticoStyle.DUOTONE,
            size = 28.dp,
            color = Color(0xFF010520),
            secondaryColor = Color(0xFFFF6040),
            secondaryAlpha = 0.25f,
            contentDescription = "Security Verified"
        )

        // 3. Color icon with default brand palette (#FF6040 primary + #000000 secondary)
        SlaticoIcon(
            name = SlaticoIconName.WALLET,
            style = SlaticoStyle.COLOR,
            size = 28.dp,
            contentDescription = "Wallet"
        )

        // 4. Color icon with two custom colors (color + secondaryColor)
        SlaticoIcon(
            name = SlaticoIconName.BELL,
            style = SlaticoStyle.COLOR,
            size = 28.dp,
            color = Color(0xFFFF6040),
            secondaryColor = Color(0xFF010520),
            contentDescription = "Alerts"
        )
    }
}`}
        />
      </section>

      {/* 3. Classic Android XML Views */}
      <section id="android-xml" className="scroll-mt-28 space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          3. Android XML Views (<code className="font-mono text-primary">VectorDrawable</code>)
        </h2>
        <p className="text-sm text-muted-foreground">
          Every icon is available as <code className="font-mono text-primary">@drawable/slatico_&lt;snake_name&gt;_&lt;style&gt;</code> (or programmatically via <code className="font-mono text-primary">SlaticoDrawables.of(name, style)</code>):
        </p>
        <DocsCodeBlock
          title="res/layout/header_toolbar.xml"
          language="xml"
          code={`<!-- 1. Monochrome VectorDrawable tinted via app:tint -->
<ImageView
    android:layout_width="24dp"
    android:layout_height="24dp"
    android:src="@drawable/slatico_bell_regular"
    android:contentDescription="@string/notifications"
    app:tint="#010520" />

<!-- 2. Duotone VectorDrawable (secondary layer preserves built-in 20% fillAlpha) -->
<ImageView
    android:layout_width="28dp"
    android:layout_height="28dp"
    android:src="@drawable/slatico_shield_check_duotone"
    android:contentDescription="@null"
    app:tint="#010520" />

<!-- 3. Color VectorDrawable (omit app:tint to preserve #FF6040 + #000000 fills) -->
<ImageView
    android:layout_width="28dp"
    android:layout_height="28dp"
    android:src="@drawable/slatico_wallet_color"
    android:contentDescription="@string/wallet" />`}
        />
      </section>

      {/* 4. Complete Composable Parameter Reference */}
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
                <td className="px-4 py-3 text-muted-foreground">UPPER_SNAKE_CASE enum (<code className="font-mono">SlaticoIconName.BELL</code>, <code className="font-mono">SlaticoIconName.ARROW_UP_RIGHT</code>).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">modifier</td>
                <td className="px-4 py-3 font-mono">Modifier</td>
                <td className="px-4 py-3 font-mono">Modifier</td>
                <td className="px-4 py-3 text-muted-foreground">Compose modifier applied to the root icon container.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">style</td>
                <td className="px-4 py-3 font-mono">SlaticoStyle</td>
                <td className="px-4 py-3 font-mono">SlaticoStyle.REGULAR</td>
                <td className="px-4 py-3 text-muted-foreground">Visual style (<code className="font-mono">THIN</code>, <code className="font-mono">LIGHT</code>, <code className="font-mono">REGULAR</code>, <code className="font-mono">BOLD</code>, <code className="font-mono">FILL</code>, <code className="font-mono">DUOTONE</code>, <code className="font-mono">COLOR</code>).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">size</td>
                <td className="px-4 py-3 font-mono">Dp</td>
                <td className="px-4 py-3 font-mono">24.dp</td>
                <td className="px-4 py-3 text-muted-foreground">Width and height of the rendered icon.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">color</td>
                <td className="px-4 py-3 font-mono">Color</td>
                <td className="px-4 py-3 font-mono">Color.Unspecified</td>
                <td className="px-4 py-3 text-muted-foreground">Primary color for monochrome/Duotone (falls back to <code className="font-mono">LocalContentColor</code>) or primary fill (<code className="font-mono">0xFFFF6040</code>) for <code className="font-mono">COLOR</code>.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">secondaryColor</td>
                <td className="px-4 py-3 font-mono">Color</td>
                <td className="px-4 py-3 font-mono">Color.Unspecified</td>
                <td className="px-4 py-3 text-muted-foreground">Secondary layer color for <code className="font-mono">DUOTONE</code> and <code className="font-mono">COLOR</code> (default <code className="font-mono">0xFF000000</code>).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">secondaryAlpha</td>
                <td className="px-4 py-3 font-mono">Float</td>
                <td className="px-4 py-3 font-mono">0.22f</td>
                <td className="px-4 py-3 text-muted-foreground">Secondary layer alpha (<code className="font-mono">0f..1f</code>) for <code className="font-mono">DUOTONE</code> icons.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-primary">contentDescription</td>
                <td className="px-4 py-3 font-mono">String?</td>
                <td className="px-4 py-3 font-mono">null</td>
                <td className="px-4 py-3 text-muted-foreground">TalkBack accessibility description (<code className="font-mono">null</code> marks the icon decorative).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}
