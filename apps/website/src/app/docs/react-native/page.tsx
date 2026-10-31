import type { Metadata } from "next";
import { buildDocsGuideMetadata } from "../../../config/metadata";
import { buildBreadcrumbJsonLd } from "../../../lib/structured-data";
import { DocsCodeBlock } from "../../../components/docs/docs-code-block";

export const metadata: Metadata = buildDocsGuideMetadata("react-native");

export default function ReactNativeDocsPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Docs", path: "/docs" },
    { name: "React Native", path: "/docs/react-native" }
  ]);

  return (
    <article className="space-y-8 rounded-[32px] squircle border border-border bg-surface p-6 sm:p-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div>
        <span className="font-mono text-xs font-semibold text-primary">
          @slatico/react-native · iOS, Android &amp; New Architecture (Fabric)
        </span>
        <h1 className="mt-1 text-3xl font-bold text-foreground">
          React Native &amp; Expo Integration Guide
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <code className="font-mono text-foreground">@slatico/react-native</code> renders native <code className="font-mono">react-native-svg</code> primitives (<code className="font-mono">Svg</code>, <code className="font-mono">Path</code>, <code className="font-mono">G</code>) with resolved <code className="font-mono">duotone</code> and <code className="font-mono">color</code> props and zero web-only CSS variables. Verified on Android Gradle APK builds and iOS Xcode Simulator compilation.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          1. Installation &amp; Peer Dependencies
        </h2>
        <DocsCodeBlock
          title="Terminal (npm / pnpm / yarn)"
          language="bash"
          code={`npm install @slatico/react-native react-native-svg
# or with pnpm:
pnpm add @slatico/react-native react-native-svg
# or with yarn:
yarn add @slatico/react-native react-native-svg

# For bare iOS projects:
cd ios && pod install`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">
          2. Usage with All 7 Styles, Duotone &amp; Customizable Color Icons
        </h2>
        <DocsCodeBlock
          title="WalletScreen.tsx"
          language="tsx"
          code={`import React from "react";
import { View } from "react-native";
import { WalletIcon, WalletColorIcon } from "@slatico/react-native/icons/wallet";
import { ShieldCheckIcon } from "@slatico/react-native/icons/shield-check";
import { BellIcon } from "@slatico/react-native/icons/bell";

export function HeaderActions() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
      {/* 1. Monochrome style */}
      <BellIcon variant="regular" size={24} color="#010520" />

      {/* 2. Duotone with native secondaryColor and secondaryOpacity */}
      <ShieldCheckIcon
        variant="duotone"
        size={28}
        color="#010520"
        secondaryColor="#FF6040"
        secondaryOpacity={0.28}
        title="Verified Account"
      />

      {/* 3. Color style — defaults to #FF6040 (Primary) & #000000 (Secondary) */}
      <WalletIcon variant="color" size={28} title="Wallet" />

      {/* 4. Color style with customized Primary (color) & Secondary (secondaryColor) */}
      <WalletColorIcon
        size={32}
        color="#2563EB"
        secondaryColor="#010520"
        title="Custom Branded Wallet"
      />
    </View>
  );
}`}
        />
      </section>
    </article>
  );
}
