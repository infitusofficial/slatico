import type { Metadata } from "next";
import { SITE_CONFIG } from "../../../config/site";
import { buildDocsGuideMetadata } from "../../../config/metadata";
import { buildBreadcrumbJsonLd } from "../../../lib/structured-data";
import { DocsCodeBlock } from "../../../components/docs/docs-code-block";

export const metadata: Metadata = buildDocsGuideMetadata("android");

export default function AndroidDocsPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Docs", path: "/docs" },
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
          com.infitus.slatico:slatico-android · Jetpack Compose &amp; Android View XML
        </span>
        <h1 className="mt-1 text-3xl font-bold text-foreground">
          Android Native Integration Guide (Compose &amp; XML)
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          The Slatico Android library (<code className="font-mono">packages/android/library</code>) compiles all {SITE_CONFIG.metrics.totalVariants} icons into native Android <code className="font-mono">VectorDrawable</code> XML resources (<code className="font-mono">R.drawable.slatico_&lt;name&gt;_&lt;style&gt;</code>) alongside a Jetpack Compose <code className="font-mono">SlaticoIcon</code> composable supporting runtime <code className="font-mono">DUOTONE</code> and <code className="font-mono">COLOR</code> dual-layer tinting.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          1. Gradle Configuration
        </h2>
        <DocsCodeBlock
          title="build.gradle.kts"
          language="kotlin"
          code={`dependencies {
    // Maven artifact coordinate:
    implementation("com.infitus.slatico:slatico-android:0.1.0")

    // Or local Gradle module inclusion from packages/android:
    // implementation(project(":library"))
}`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          2. Jetpack Compose (`SlaticoIcon`)
        </h2>
        <DocsCodeBlock
          title="DashboardScreen.kt"
          language="kotlin"
          code={`import androidx.compose.foundation.layout.Row
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.infitus.slatico.SlaticoIcon
import com.infitus.slatico.SlaticoIconName
import com.infitus.slatico.SlaticoStyle

@Composable
fun SecurityToolbar() {
    Row {
        // 1. Monochrome VectorDrawable with Compose tint
        SlaticoIcon(
            name = SlaticoIconName.SHIELD_CHECK,
            style = SlaticoStyle.REGULAR,
            size = 24.dp,
            color = Color(0xFF010520),
            contentDescription = "Security Verified"
        )

        // 2. Duotone with independent primary & secondary colors + alpha
        SlaticoIcon(
            name = SlaticoIconName.BELL,
            style = SlaticoStyle.DUOTONE,
            size = 28.dp,
            color = Color(0xFF010520),
            secondaryColor = Color(0xFFFF6040),
            secondaryAlpha = 0.28f,
            contentDescription = "Notifications"
        )

        // 3. Color style — defaults to Primary (#FF6040) & Secondary (#000000)
        SlaticoIcon(
            name = SlaticoIconName.WALLET,
            style = SlaticoStyle.COLOR,
            size = 28.dp,
            contentDescription = "Wallet"
        )

        // 4. Color style with customized Primary (color) & Secondary (secondaryColor)
        SlaticoIcon(
            name = SlaticoIconName.WALLET,
            style = SlaticoStyle.COLOR,
            size = 32.dp,
            color = Color(0xFF2563EB),
            secondaryColor = Color(0xFF010520),
            contentDescription = "Custom Branded Wallet"
        )
    }
}`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          3. Android View XML (`VectorDrawable`)
        </h2>
        <DocsCodeBlock
          title="res/layout/toolbar_icon.xml"
          language="xml"
          code={`<ImageView
    android:layout_width="24dp"
    android:layout_height="24dp"
    android:src="@drawable/slatico_bell_regular"
    android:tint="#010520"
    android:contentDescription="@string/notifications" />`}
        />
      </section>
    </article>
  );
}
