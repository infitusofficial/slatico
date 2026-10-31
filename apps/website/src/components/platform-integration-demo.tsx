"use client";

import { createElement, useEffect, useState } from "react";
import { defineSlaticoIconElement, registerSlaticoIcons } from "@slatico/web";
import { bellIconDef } from "@slatico/web/icons/bell";
import { shieldCheckIconDef } from "@slatico/web/icons/shield-check";
import { walletIconDef } from "@slatico/web/icons/wallet";
import { getSpriteSymbolId, getSvgSprite, renderSvgMarkup } from "@slatico/svg";

const FRAMEWORK_SNIPPETS = {
  react: `import { BellIcon } from "@slatico/react/icons/bell";

export function Demo() {
  return (
    <BellIcon
      variant="duotone"
      size={28}
      color="#4F46E5"
      secondaryColor="#A855F7"
      secondaryOpacity={0.35}
      title="Notification Bell"
    />
  );
}`,
  vue: `<script setup lang="ts">
import { BellIcon } from "@slatico/vue/icons/bell";
</script>

<template>
  <BellIcon
    variant="duotone"
    :size="28"
    color="#4F46E5"
    secondary-color="#A855F7"
    :secondary-opacity="0.35"
    title="Notification Bell"
  />
</template>`,
  web: `import { defineSlaticoIconElement, registerSlaticoIcons } from "@slatico/web";
import { bellIconDef } from "@slatico/web/icons/bell";

registerSlaticoIcons(bellIconDef);
defineSlaticoIconElement();

// In Vanilla HTML:
// <slatico-icon name="bell" variant="duotone" size="28" color="#4F46E5" secondary-color="#A855F7" label="Notification Bell"></slatico-icon>`,
  svg: `import { getSvgSprite, getSpriteSymbolId, renderSvgMarkup } from "@slatico/svg";

// 1. Direct programmatic SVG string:
const inlineHtml = renderSvgMarkup("bell", "duotone", {
  size: 28,
  color: "#4F46E5",
  secondaryColor: "#A855F7"
});

// 2. Or reference a variant SVG sprite symbol (#slatico-duotone-bell):
const symbolId = getSpriteSymbolId("bell", "duotone");`,
  "react-native": `import { BellIcon } from "@slatico/react-native/icons/bell";

export function NativeDemo() {
  return (
    <BellIcon
      variant="duotone"
      size={28}
      color="#4F46E5"
      secondaryColor="#A855F7"
      secondaryOpacity={0.35}
      title="Notification Bell"
    />
  );
}`
} as const;

type FrameworkKey = keyof typeof FRAMEWORK_SNIPPETS;

export function PlatformIntegrationDemo() {
  const [activeTab, setActiveTab] = useState<FrameworkKey>("react");
  const [webComponentReady, setWebComponentReady] = useState(false);

  useEffect(() => {
    registerSlaticoIcons(bellIconDef, shieldCheckIconDef, walletIconDef);
    defineSlaticoIconElement();
    setWebComponentReady(true);
  }, []);

  const duotoneSprite = getSvgSprite("duotone");
  const bellSymbolId = getSpriteSymbolId("bell", "duotone");
  const programmaticSvg = renderSvgMarkup("wallet", "color", {
    size: 28,
    title: "Programmatic Wallet SVG",
    idPrefix: "site-demo"
  });

  return (
    <div className="min-w-0 max-w-full rounded-[32px] squircle border border-border bg-surface p-4 shadow-xs sm:p-6">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <span className="inline-block rounded-md bg-primary-soft px-2.5 py-1 font-mono text-xs font-semibold text-primary">
            Multi-Framework Tier 1 Integrations
          </span>
          <h3 className="mt-2 text-base font-bold text-foreground sm:text-lg">
            Live Web Component, SVG Sprite &amp; Multi-Framework Code Contracts
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Inspect how the same authored 24×24 Tier 1 SVG sources compile into React, Vue 3, Native Web Components, SVG Sprites, and React Native.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["react", "@slatico/react"],
              ["vue", "@slatico/vue"],
              ["web", "@slatico/web"],
              ["svg", "@slatico/svg"],
              ["react-native", "@slatico/react-native"]
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`rounded-[20px] squircle px-3 py-1.5 font-mono text-xs font-semibold transition ${
                activeTab === key
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-surface-subtle text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="min-w-0 max-w-full overflow-x-auto rounded-[24px] squircle border border-code-border bg-code-bg p-4 text-xs text-code-fg">
          <pre className="font-mono leading-relaxed">
            <code>{FRAMEWORK_SNIPPETS[activeTab]}</code>
          </pre>
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-4 rounded-[24px] squircle border border-border bg-surface-subtle p-4 sm:p-5">
          <div>
            <h4 className="text-sm font-bold text-foreground">
              Live Browser Runtime Verification
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Below are live browser instances rendered via native <code className="font-mono text-foreground">&lt;slatico-icon&gt;</code> Custom Elements and <code className="font-mono text-foreground">@slatico/svg</code> sprites alongside React.
            </p>
          </div>

          {/* Inject hidden duotone SVG sprite for live <use> demonstration */}
          <div
            className="sr-only h-0 w-0 overflow-hidden"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: duotoneSprite }}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex min-w-0 flex-col items-center justify-center rounded-[20px] squircle border border-border bg-surface p-4">
              <div className="flex h-10 items-center justify-center">
                {webComponentReady
                  ? createElement("slatico-icon", {
                      name: "bell",
                      variant: "duotone",
                      size: "28",
                      color: "#4F46E5",
                      "secondary-color": "var(--primary)",
                      "secondary-opacity": "0.35",
                      label: "Native Web Component Bell"
                    })
                  : null}
              </div>
              <span className="mt-2 max-w-full truncate font-mono text-[11px] font-medium text-foreground">
                &lt;slatico-icon&gt;
              </span>
              <span className="text-[10px] text-muted-foreground">Shadow DOM Element</span>
            </div>

            <div className="flex min-w-0 flex-col items-center justify-center rounded-[20px] squircle border border-border bg-surface p-4">
              <div className="flex h-10 items-center justify-center">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={
                    {
                      color: "#059669",
                      "--slatico-secondary-color": "#F59E0B",
                      "--slatico-secondary-opacity": 0.35
                    } as React.CSSProperties
                  }
                  role="img"
                  aria-label="SVG Sprite Use Bell"
                >
                  <use href={`#${bellSymbolId}`} />
                </svg>
              </div>
              <span className="mt-2 max-w-full truncate font-mono text-[11px] font-medium text-foreground">
                &lt;use href=&quot;#{bellSymbolId}&quot;&gt;
              </span>
              <span className="text-[10px] text-muted-foreground">@slatico/svg Sprite</span>
            </div>

            <div className="flex min-w-0 flex-col items-center justify-center rounded-[20px] squircle border border-border bg-surface p-4">
              <div
                className="flex h-10 items-center justify-center"
                dangerouslySetInnerHTML={{ __html: programmaticSvg }}
              />
              <span className="mt-2 max-w-full truncate font-mono text-[11px] font-medium text-foreground">
                renderSvgMarkup()
              </span>
              <span className="text-[10px] text-muted-foreground">@slatico/svg Inline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
