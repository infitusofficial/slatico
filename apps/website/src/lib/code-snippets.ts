import type { SlaticoStyle } from "@slatico/core";
import type { IconVariantAsset } from "./icon-asset";
import { buildStandaloneSvg } from "./svg-export";

/** Slatico brand primary, used where the Explorer previews its `var(--primary)` theme token. */
const SLATICO_BRAND_PRIMARY_HEX = "#FF6040";

export const CODE_SNIPPET_PLATFORMS = [
  "react",
  "vue",
  "html",
  "web-components",
  "react-native",
  "flutter",
  "android-xml",
  "jetpack-compose",
  "swiftui",
  "uikit",
  "appkit"
] as const;

export type CodeSnippetPlatformId = (typeof CODE_SNIPPET_PLATFORMS)[number];

export interface CodeSnippetPlatformMeta {
  readonly id: CodeSnippetPlatformId;
  readonly label: string;
  readonly shortLabel: string;
  readonly language: string;
  readonly packageName: string;
}

export const CODE_SNIPPET_PLATFORM_META: Readonly<
  Record<CodeSnippetPlatformId, CodeSnippetPlatformMeta>
> = {
  react: {
    id: "react",
    label: "React / Next.js",
    shortLabel: "React",
    language: "tsx",
    packageName: "@slatico/react"
  },
  vue: {
    id: "vue",
    label: "Vue 3",
    shortLabel: "Vue 3",
    language: "vue",
    packageName: "@slatico/vue"
  },
  html: {
    id: "html",
    label: "Vanilla HTML & SVG",
    shortLabel: "HTML / SVG",
    language: "html",
    packageName: "@slatico/svg · @slatico/font"
  },
  "web-components": {
    id: "web-components",
    label: "Web Components",
    shortLabel: "Web Comp",
    language: "html",
    packageName: "@slatico/web"
  },
  "react-native": {
    id: "react-native",
    label: "React Native",
    shortLabel: "React Native",
    language: "tsx",
    packageName: "@slatico/react-native"
  },
  flutter: {
    id: "flutter",
    label: "Flutter",
    shortLabel: "Flutter",
    language: "dart",
    packageName: "slatico_icons"
  },
  "android-xml": {
    id: "android-xml",
    label: "Android XML",
    shortLabel: "Android XML",
    language: "xml",
    packageName: "dev.slatico:slatico-android"
  },
  "jetpack-compose": {
    id: "jetpack-compose",
    label: "Jetpack Compose",
    shortLabel: "Compose",
    language: "kotlin",
    packageName: "dev.slatico:slatico-android"
  },
  swiftui: {
    id: "swiftui",
    label: "SwiftUI",
    shortLabel: "SwiftUI",
    language: "swift",
    packageName: "SlaticoIcons"
  },
  uikit: {
    id: "uikit",
    label: "UIKit",
    shortLabel: "UIKit",
    language: "swift",
    packageName: "SlaticoIcons"
  },
  appkit: {
    id: "appkit",
    label: "AppKit",
    shortLabel: "AppKit",
    language: "swift",
    packageName: "SlaticoIcons"
  }
} as const;

export interface CodeSnippetOptions {
  readonly name: string;
  readonly pascalName: string;
  readonly style: SlaticoStyle;
  readonly size: number;
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly secondaryOpacity?: number;
  /** SVG data for `name` + `style`; required by the HTML / inline SVG snippet. */
  readonly asset: IconVariantAsset;
}

function toCamelCase(kebab: string): string {
  return kebab.replace(/-([a-z0-9])/g, (_, ch: string) => ch.toUpperCase());
}

function toSnakeCase(kebab: string): string {
  return kebab.replace(/-/g, "_");
}

function toUpperSnakeCase(kebab: string): string {
  return toSnakeCase(kebab).toUpperCase();
}

function normalizeHex6(raw: string, fallback = "#1A1931"): string {
  const clean = raw.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
    return clean.toUpperCase();
  }
  if (/^#[0-9A-Fa-f]{3}$/.test(clean)) {
    const r = clean[1]!;
    const g = clean[2]!;
    const b = clean[3]!;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return fallback;
}

function hexToFlutterColorLiteral(raw: string): string {
  const hex = normalizeHex6(raw).slice(1);
  return `Color(0xFF${hex})`;
}

function hexToComposeColorLiteral(raw: string): string {
  const hex = normalizeHex6(raw).slice(1);
  return `Color(0xFF${hex})`;
}

function hexToSwiftRgbTuple(raw: string): { r: string; g: string; b: string } {
  const hex = normalizeHex6(raw).slice(1);
  const r = (parseInt(hex.slice(0, 2), 16) / 255).toFixed(3);
  const g = (parseInt(hex.slice(2, 4), 16) / 255).toFixed(3);
  const b = (parseInt(hex.slice(4, 6), 16) / 255).toFixed(3);
  return { r, g, b };
}

export function generatePlatformCodeSnippet(
  platform: CodeSnippetPlatformId,
  options: CodeSnippetOptions
): string {
  const {
    name,
    pascalName,
    style,
    size,
    primaryColor,
    secondaryOpacity = 0.25
  } = options;
  // `var(--primary)` is the Icon Explorer's own theme token (rendered as the Slatico brand
  // primary #FF6040). It does not exist in consumer applications, so copy-paste snippets
  // always receive the portable hex value instead.
  const secondaryColor =
    options.secondaryColor.trim() === "var(--primary)"
      ? SLATICO_BRAND_PRIMARY_HEX
      : options.secondaryColor;

  const componentName = `${pascalName}Icon`;
  const camelName = toCamelCase(name);
  const snakeName = toSnakeCase(name);
  const upperSnakeName = toUpperSnakeCase(name);
  const styleUpper = style.toUpperCase();
  const defaultColorSecondary =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
      ? "#FFFFFF"
      : "#000000";
  const effectiveSecondaryColor =
    style === "color" &&
    (!secondaryColor.trim() ||
      secondaryColor === "currentColor" ||
      secondaryColor === "var(--primary)")
      ? defaultColorSecondary
      : secondaryColor;
  const hasCustomPrimary =
    primaryColor !== "currentColor" &&
    primaryColor.trim().length > 0 &&
    !(style === "color" && primaryColor.trim().toUpperCase() === "#FF6040");
  const hasCustomSecondary =
    effectiveSecondaryColor.trim().length > 0 &&
    effectiveSecondaryColor !== "currentColor" &&
    !(
      style === "color" &&
      (effectiveSecondaryColor.trim().toUpperCase() === "#000000" ||
        effectiveSecondaryColor === "var(--primary)")
    );
  const resolvedPrimary = hasCustomPrimary ? primaryColor : "currentColor";
  const resolvedHexPrimary = normalizeHex6(
    hasCustomPrimary ? primaryColor : style === "color" ? "#FF6040" : "#1A1931"
  );
  const resolvedHexSecondary = normalizeHex6(
    hasCustomSecondary
      ? effectiveSecondaryColor
      : style === "color"
        ? defaultColorSecondary
        : resolvedHexPrimary
  );
  const opacityNum = Number(secondaryOpacity.toFixed(2));

  switch (platform) {
    case "react": {
      const props: string[] = [
        `variant="${style}"`,
        `size={${size}}`
      ];
      if (style === "color") {
        if (hasCustomPrimary) {
          props.push(`color="${primaryColor}"`);
        }
        if (hasCustomSecondary) {
          props.push(`secondaryColor="${effectiveSecondaryColor}"`);
        }
      } else {
        props.push(`color="${resolvedPrimary}"`);
      }
      if (style === "duotone") {
        if (secondaryColor) {
          props.push(`secondaryColor="${secondaryColor}"`);
        }
        props.push(`secondaryOpacity={${opacityNum}}`);
      }
      props.push(`title="${pascalName}"`);

      return `import { ${componentName} } from "@slatico/react/icons/${name}";

export function Example() {
  return (
    <${componentName}
      ${props.join("\n      ")}
    />
  );
}`;
    }

    case "vue": {
      const props: string[] = [
        `variant="${style}"`,
        `:size="${size}"`
      ];
      if (style === "color") {
        if (hasCustomPrimary) {
          props.push(`color="${primaryColor}"`);
        }
        if (hasCustomSecondary) {
          props.push(`secondary-color="${effectiveSecondaryColor}"`);
        }
      } else {
        props.push(`color="${resolvedPrimary}"`);
      }
      if (style === "duotone") {
        if (secondaryColor) {
          props.push(`secondary-color="${secondaryColor}"`);
        }
        props.push(`:secondary-opacity="${opacityNum}"`);
      }
      props.push(`title="${pascalName}"`);

      return `<script setup lang="ts">
import { ${componentName} } from "@slatico/vue/icons/${name}";
</script>

<template>
  <${componentName}
    ${props.join("\n    ")}
  />
</template>`;
    }

    case "html": {
      const standaloneSvg = buildStandaloneSvg(options.asset, {
        size,
        primaryColor,
        secondaryColor,
        secondaryOpacity
      });
      const svgOpts: string[] = [`size: ${size}`];
      if (style === "color") {
        if (hasCustomPrimary) {
          svgOpts.push(`color: "${primaryColor}"`);
        }
        if (hasCustomSecondary) {
          svgOpts.push(`secondaryColor: "${effectiveSecondaryColor}"`);
        }
      } else {
        svgOpts.push(`color: "${resolvedPrimary}"`);
      }
      if (style === "duotone") {
        if (secondaryColor) {
          svgOpts.push(`secondaryColor: "${secondaryColor}"`);
        }
        svgOpts.push(`secondaryOpacity: ${opacityNum}`);
      }
      svgOpts.push(`title: "${pascalName}"`);
      const programmaticComment = `\n\n<!-- Programmatic SVG (@slatico/svg): -->\n<!-- import { renderSvgMarkup } from "@slatico/svg"; -->\n<!-- const html = renderSvgMarkup("${name}", "${style}", { ${svgOpts.join(", ")} }); -->`;
      const fontSnippet =
        style !== "duotone" && style !== "color"
          ? `\n\n<!-- Or via Slatico Webfont (@slatico/font/slatico.css): -->\n<i class="slatico slatico-${name}-${style}" style="font-size: ${size}px; color: ${resolvedPrimary};" aria-hidden="true"></i>`
          : "";
      return `<!-- Standalone 24x24 Inline SVG: -->\n${standaloneSvg}${programmaticComment}${fontSnippet}`;
    }

    case "web-components": {
      const defVar = `${camelName}IconDef`;
      const attrs: string[] = [
        `name="${name}"`,
        `variant="${style}"`,
        `size="${size}"`
      ];
      if (style === "color") {
        if (hasCustomPrimary) {
          attrs.push(`color="${primaryColor}"`);
        }
        if (hasCustomSecondary) {
          attrs.push(`secondary-color="${effectiveSecondaryColor}"`);
        }
      } else {
        attrs.push(`color="${resolvedPrimary}"`);
      }
      if (style === "duotone") {
        if (secondaryColor) {
          attrs.push(`secondary-color="${secondaryColor}"`);
        }
        attrs.push(`secondary-opacity="${opacityNum}"`);
      }
      attrs.push(`label="${pascalName}"`);

      return `<script type="module">
  // Bare package imports require a bundler (e.g. Vite) or an import map.
  import { defineSlaticoIconElement, registerSlaticoIcons } from "@slatico/web";
  import { ${defVar} } from "@slatico/web/icons/${name}";

  registerSlaticoIcons(${defVar});
  defineSlaticoIconElement();
</script>

<slatico-icon
  ${attrs.join("\n  ")}
></slatico-icon>`;
    }

    case "react-native": {
      const props: string[] = [
        `variant="${style}"`,
        `size={${size}}`
      ];
      if (style === "color") {
        if (hasCustomPrimary) {
          props.push(`color="${resolvedHexPrimary}"`);
        }
        if (hasCustomSecondary) {
          props.push(`secondaryColor="${resolvedHexSecondary}"`);
        }
      } else {
        props.push(`color="${resolvedHexPrimary}"`);
      }
      if (style === "duotone") {
        props.push(`secondaryColor="${resolvedHexSecondary}"`);
        props.push(`secondaryOpacity={${opacityNum}}`);
      }
      props.push(`title="${pascalName}"`);

      return `import { ${componentName} } from "@slatico/react-native/icons/${name}";

export function NativeIconExample() {
  return (
    <${componentName}
      ${props.join("\n      ")}
    />
  );
}`;
    }

    case "flutter": {
      const args: string[] = [
        `name: SlaticoIconName.${camelName}`,
        `style: SlaticoStyle.${style}`,
        `size: ${size}`
      ];
      if (style === "color") {
        if (hasCustomPrimary) {
          args.push(`color: const ${hexToFlutterColorLiteral(resolvedHexPrimary)}`);
        }
        if (hasCustomSecondary) {
          args.push(
            `secondaryColor: const ${hexToFlutterColorLiteral(resolvedHexSecondary)}`
          );
        }
      } else {
        args.push(`color: const ${hexToFlutterColorLiteral(resolvedHexPrimary)}`);
      }
      if (style === "duotone") {
        args.push(
          `secondaryColor: const ${hexToFlutterColorLiteral(resolvedHexSecondary)}`
        );
        args.push(`secondaryOpacity: ${opacityNum}`);
      }
      args.push(`semanticLabel: '${pascalName}'`);

      const stylePascal = style.charAt(0).toUpperCase() + style.slice(1);
      const monochromeFontNote =
        style !== "duotone" && style !== "color"
          ? `\n\n// Monochrome IconData constant also available:\n// Icon(SlaticoIcons.${camelName}${stylePascal}, size: ${size})`
          : "";

      return `import 'package:flutter/widgets.dart';
import 'package:slatico_icons/slatico_icons.dart';

Widget buildSlaticoIcon() {
  return SlaticoIcon(
    ${args.join(",\n    ")},
  );
}${monochromeFontNote}`;
    }

    case "android-xml": {
      const drawableName = `slatico_${snakeName}_${style}`;
      const tintLine =
        style !== "color"
          ? `\n    android:tint="${resolvedHexPrimary}"`
          : "";
      return `<!-- res/layout/example_icon.xml -->
<ImageView
    android:layout_width="${size}dp"
    android:layout_height="${size}dp"
    android:src="@drawable/${drawableName}"${tintLine}
    android:contentDescription="${pascalName}" />`;
    }

    case "jetpack-compose": {
      const args: string[] = [
        `name = SlaticoIconName.${upperSnakeName}`,
        `style = SlaticoStyle.${styleUpper}`,
        `size = ${size}.dp`
      ];
      if (style === "color") {
        if (hasCustomPrimary) {
          args.push(`color = ${hexToComposeColorLiteral(resolvedHexPrimary)}`);
        }
        if (hasCustomSecondary) {
          args.push(
            `secondaryColor = ${hexToComposeColorLiteral(resolvedHexSecondary)}`
          );
        }
      } else {
        args.push(`color = ${hexToComposeColorLiteral(resolvedHexPrimary)}`);
      }
      if (style === "duotone") {
        args.push(
          `secondaryColor = ${hexToComposeColorLiteral(resolvedHexSecondary)}`
        );
        args.push(`secondaryAlpha = ${opacityNum}f`);
      }
      args.push(`contentDescription = "${pascalName}"`);

      return `import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.infitus.slatico.SlaticoIcon
import com.infitus.slatico.SlaticoIconName
import com.infitus.slatico.SlaticoStyle

@Composable
fun ${pascalName}IconPreview() {
    SlaticoIcon(
        ${args.join(",\n        ")}
    )
}`;
    }

    case "swiftui": {
      const pRgb = hexToSwiftRgbTuple(resolvedHexPrimary);
      const sRgb = hexToSwiftRgbTuple(resolvedHexSecondary);
      const args: string[] = [
        `.${camelName}`,
        `style: .${style}`,
        `size: ${size}`
      ];
      if (style === "color") {
        if (hasCustomPrimary) {
          args.push(
            `color: Color(.sRGB, red: ${pRgb.r}, green: ${pRgb.g}, blue: ${pRgb.b}, opacity: 1.0)`
          );
        }
        if (hasCustomSecondary) {
          args.push(
            `secondaryColor: Color(.sRGB, red: ${sRgb.r}, green: ${sRgb.g}, blue: ${sRgb.b}, opacity: 1.0)`
          );
        }
      } else {
        args.push(
          `color: Color(.sRGB, red: ${pRgb.r}, green: ${pRgb.g}, blue: ${pRgb.b}, opacity: 1.0)`
        );
      }
      if (style === "duotone") {
        args.push(
          `secondaryColor: Color(.sRGB, red: ${sRgb.r}, green: ${sRgb.g}, blue: ${sRgb.b}, opacity: 1.0)`
        );
        args.push(`secondaryOpacity: ${opacityNum}`);
      }
      args.push(`accessibilityLabel: "${pascalName}"`);

      return `import SwiftUI
import SlaticoIcons

struct ${pascalName}IconView: View {
    var body: some View {
        SlaticoIcon(
            ${args.join(",\n            ")}
        )
    }
}`;
    }

    case "uikit": {
      const pRgb = hexToSwiftRgbTuple(resolvedHexPrimary);
      const sRgb = hexToSwiftRgbTuple(resolvedHexSecondary);
      const args: string[] = [
        `.${camelName}`,
        `style: .${style}`,
        `size: ${size}`
      ];
      if (style === "color") {
        if (hasCustomPrimary) {
          args.push(
            `color: UIColor(red: ${pRgb.r}, green: ${pRgb.g}, blue: ${pRgb.b}, alpha: 1.0)`
          );
        }
        if (hasCustomSecondary) {
          args.push(
            `secondaryColor: UIColor(red: ${sRgb.r}, green: ${sRgb.g}, blue: ${sRgb.b}, alpha: 1.0)`
          );
        }
      } else {
        args.push(
          `color: UIColor(red: ${pRgb.r}, green: ${pRgb.g}, blue: ${pRgb.b}, alpha: 1.0)`
        );
      }
      if (style === "duotone") {
        args.push(
          `secondaryColor: UIColor(red: ${sRgb.r}, green: ${sRgb.g}, blue: ${sRgb.b}, alpha: 1.0)`
        );
        args.push(`secondaryOpacity: ${opacityNum}`);
      }

      return `import UIKit
import SlaticoIcons

func make${pascalName}IconView() -> UIImageView {
    let iconImage = UIImage.slatico(
        ${args.join(",\n        ")}
    )
    let imageView = UIImageView(image: iconImage)
    imageView.isAccessibilityElement = true
    imageView.accessibilityLabel = "${pascalName}"
    return imageView
}`;
    }

    case "appkit": {
      const pRgb = hexToSwiftRgbTuple(resolvedHexPrimary);
      const sRgb = hexToSwiftRgbTuple(resolvedHexSecondary);
      const args: string[] = [
        `.${camelName}`,
        `style: .${style}`,
        `size: ${size}`
      ];
      if (style === "color") {
        if (hasCustomPrimary) {
          args.push(
            `color: NSColor(srgbRed: ${pRgb.r}, green: ${pRgb.g}, blue: ${pRgb.b}, alpha: 1.0)`
          );
        }
        if (hasCustomSecondary) {
          args.push(
            `secondaryColor: NSColor(srgbRed: ${sRgb.r}, green: ${sRgb.g}, blue: ${sRgb.b}, alpha: 1.0)`
          );
        }
      } else {
        args.push(
          `color: NSColor(srgbRed: ${pRgb.r}, green: ${pRgb.g}, blue: ${pRgb.b}, alpha: 1.0)`
        );
      }
      if (style === "duotone") {
        args.push(
          `secondaryColor: NSColor(srgbRed: ${sRgb.r}, green: ${sRgb.g}, blue: ${sRgb.b}, alpha: 1.0)`
        );
        args.push(`secondaryOpacity: ${opacityNum}`);
      }

      return `import AppKit
import SlaticoIcons

func make${pascalName}IconView() -> NSImageView {
    let iconImage = NSImage.slatico(
        ${args.join(",\n        ")}
    )
    let imageView = NSImageView(image: iconImage)
    imageView.setAccessibilityLabel("${pascalName}")
    return imageView
}`;
    }
  }
}
