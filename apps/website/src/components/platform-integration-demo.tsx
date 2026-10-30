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
      secondaryColor="#FF6040"
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
    secondary-color="#FF6040"
    :secondary-opacity="0.35"
    title="Notification Bell"
  />
</template>`,
  web: `import { defineSlaticoIconElement, registerSlaticoIcons } from "@slatico/web";
import { bellIconDef } from "@slatico/web/icons/bell";

registerSlaticoIcons(bellIconDef);
defineSlaticoIconElement();

// In Vanilla HTML:
// <slatico-icon name="bell" variant="duotone" size="28" color="#4F46E5" secondary-color="#FF6040" label="Notification Bell"></slatico-icon>`,
  svg: `import { getSvgSprite, getSpriteSymbolId, renderSvgMarkup } from "@slatico/svg";

// 1. Direct programmatic SVG string:
const inlineHtml = renderSvgMarkup("bell", "duotone", {
  size: 28,
  color: "#4F46E5",
  secondaryColor: "#FF6040"
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
      secondaryColor="#FF6040"
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
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 lg:flex-row lg:items-center dark:border-zinc-800">
        <div>
          <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            Multi-Framework Tier 1 Integrations
          </span>
          <h3 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Live Web Component, SVG Sprite &amp; Multi-Framework Code Contracts
          </h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Inspect how the same authored 24x24 Tier 1 SVG sources compile into React, Vue 3, Native Web Components, SVG Sprites, and React Native.
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
              className={`rounded-lg px-3 py-1.5 font-mono text-xs font-medium transition ${
                activeTab === key
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-950 p-4 text-xs text-zinc-100 dark:border-zinc-800">
          <pre className="font-mono leading-relaxed">
            <code>{FRAMEWORK_SNIPPETS[activeTab]}</code>
          </pre>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-5 dark:border-zinc-800/80 dark:bg-zinc-950/60">
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Live Browser Runtime Verification
            </h4>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Below are live browser instances rendered via native <code className="font-mono">&lt;slatico-icon&gt;</code> Custom Elements and <code className="font-mono">@slatico/svg</code> sprites alongside React.
            </p>
          </div>

          {/* Inject hidden duotone SVG sprite for live <use> demonstration */}
          <div
            className="hidden"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: duotoneSprite }}
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex h-10 items-center justify-center">
                {webComponentReady
                  ? createElement("slatico-icon", {
                      name: "bell",
                      variant: "duotone",
                      size: "28",
                      color: "#4F46E5",
                      "secondary-color": "#FF6040",
                      "secondary-opacity": "0.35",
                      label: "Native Web Component Bell"
                    })
                  : null}
              </div>
              <span className="mt-2 font-mono text-[11px] font-medium text-zinc-800 dark:text-zinc-200">
                &lt;slatico-icon&gt;
              </span>
              <span className="text-[10px] text-zinc-500">Shadow DOM Element</span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
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
              <span className="mt-2 font-mono text-[11px] font-medium text-zinc-800 dark:text-zinc-200">
                &lt;use href=&quot;#{bellSymbolId}&quot;&gt;
              </span>
              <span className="text-[10px] text-zinc-500">@slatico/svg Sprite</span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div
                className="flex h-10 items-center justify-center"
                dangerouslySetInnerHTML={{ __html: programmaticSvg }}
              />
              <span className="mt-2 font-mono text-[11px] font-medium text-zinc-800 dark:text-zinc-200">
                renderSvgMarkup()
              </span>
              <span className="text-[10px] text-zinc-500">@slatico/svg Inline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
