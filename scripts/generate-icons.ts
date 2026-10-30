import fs from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";
import { SLATICO_STYLES, type SlaticoStyle } from "../packages/core/src/types.js";
import { toPascalCase } from "../packages/core/src/utils.js";
import {
  generateFontManifestTsModule,
  loadAndSyncCodepointsManifest
} from "./font-compiler.js";
import { generateAndroidPackageArtifacts } from "./generate-android.js";
import { generateFlutterPackageArtifacts } from "./generate-flutter.js";
import {
  buildCatalogMetadata,
  discoverAndValidateIcons,
  type DiscoveredIconFamily
} from "./icon-pipeline.js";

const REPO_ROOT = process.cwd();
const ICONS_DIR = path.join(REPO_ROOT, "icons");

const CORE_GENERATED_DIR = path.join(REPO_ROOT, "packages", "core", "src", "generated");
const SVG_GENERATED_DIR = path.join(REPO_ROOT, "packages", "svg", "src", "generated");
const FONT_GENERATED_DIR = path.join(REPO_ROOT, "packages", "font", "src", "generated");
const FONT_CODEPOINTS_PATH = path.join(REPO_ROOT, "packages", "font", "codepoints.json");
const REACT_ICONS_DIR = path.join(REPO_ROOT, "packages", "react", "src", "icons");
const VUE_ICONS_DIR = path.join(REPO_ROOT, "packages", "vue", "src", "icons");
const WEB_ICONS_DIR = path.join(REPO_ROOT, "packages", "web", "src", "icons");
const RN_ICONS_DIR = path.join(REPO_ROOT, "packages", "react-native", "src", "icons");

const SVG_ATTR_TO_REACT: Readonly<Record<string, string>> = {
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stroke-miterlimit": "strokeMiterlimit",
  "stroke-opacity": "strokeOpacity",
  "fill-rule": "fillRule",
  "clip-rule": "clipRule",
  "clip-path": "clipPath",
  "clip-path-units": "clipPathUnits",
  "fill-opacity": "fillOpacity",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "gradientUnits": "gradientUnits",
  "gradientTransform": "gradientTransform",
  "spreadMethod": "spreadMethod",
  "maskUnits": "maskUnits",
  "maskContentUnits": "maskContentUnits",
  "mask-type": "maskType",
  "vector-effect": "vectorEffect",
  "shape-rendering": "shapeRendering",
  "color-interpolation-filters": "colorInterpolationFilters",
  "xlink:href": "xlinkHref"
};

const SVG_TAG_TO_RN: Readonly<Record<string, string>> = {
  svg: "Svg",
  path: "Path",
  circle: "Circle",
  rect: "Rect",
  line: "Line",
  polyline: "Polyline",
  polygon: "Polygon",
  ellipse: "Ellipse",
  g: "G",
  defs: "Defs",
  linearGradient: "LinearGradient",
  radialGradient: "RadialGradient",
  stop: "Stop",
  clipPath: "ClipPath",
  mask: "Mask",
  use: "Use"
};

const ORDERED_XML_PARSER = new XMLParser({
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

interface OrderedXmlNode {
  [key: string]: unknown;
  ":@"?: Record<string, string>;
}

function toReactAttrName(attr: string): string {
  return SVG_ATTR_TO_REACT[attr] ?? attr;
}

function formatScopedSvgAttrExpression(val: string, scopeVarName: string): string {
  if (val.startsWith("slatico-")) {
    return `{\`${val}-\${${scopeVarName}}\`}`;
  }
  const urlMatch = val.match(/^url\(#(slatico-[^)]+)\)$/);
  if (urlMatch && urlMatch[1]) {
    return `{\`url(#${urlMatch[1]}-\${${scopeVarName}})\`}`;
  }
  const hrefMatch = val.match(/^#(slatico-.+)$/);
  if (hrefMatch && hrefMatch[1]) {
    return `{\`#${hrefMatch[1]}-\${${scopeVarName}}\`}`;
  }
  return JSON.stringify(val);
}

function serializeOrderedNodesToJsx(
  nodes: readonly OrderedXmlNode[],
  indentLevel: number,
  scopeVarName = "instanceId"
): string {
  const indent = " ".repeat(indentLevel);
  const lines: string[] = [];

  for (const node of nodes) {
    const tagNames = Object.keys(node).filter((k) => k !== ":@" && k !== "#text");
    const tagName = tagNames[0];
    if (!tagName) {
      continue;
    }

    const rawAttrs = node[":@"] ?? {};
    const attrPairs: string[] = [];
    for (const [rawKey, val] of Object.entries(rawAttrs)) {
      if (!rawKey.startsWith("@_")) {
        continue;
      }
      const attrName = toReactAttrName(rawKey.slice(2));
      const strVal = String(val);
      const formattedVal =
        attrName === "id" ||
        attrName === "fill" ||
        attrName === "stroke" ||
        attrName === "clipPath" ||
        attrName === "mask" ||
        attrName === "href" ||
        attrName === "xlinkHref"
          ? formatScopedSvgAttrExpression(strVal, scopeVarName)
          : JSON.stringify(strVal);
      attrPairs.push(`${attrName}=${formattedVal}`);
    }

    const attrString = attrPairs.length > 0 ? ` ${attrPairs.join(" ")}` : "";
    const children = (node[tagName] as OrderedXmlNode[] | undefined) ?? [];

    if (children.length === 0) {
      lines.push(`${indent}<${tagName}${attrString} />`);
    } else {
      lines.push(`${indent}<${tagName}${attrString}>`);
      lines.push(serializeOrderedNodesToJsx(children, indentLevel + 2, scopeVarName));
      lines.push(`${indent}</${tagName}>`);
    }
  }

  return lines.join("\n");
}

export function convertOptimizedSvgToJsxBody(
  optimizedSvg: string,
  indentLevel = 6,
  scopeVarName = "instanceId"
): string {
  const parsed = ORDERED_XML_PARSER.parse(optimizedSvg) as OrderedXmlNode[];
  const svgNode = parsed.find((n) => "svg" in n);
  if (!svgNode) {
    throw new Error("Unable to find <svg> root node when generating JSX.");
  }
  const children = (svgNode.svg as OrderedXmlNode[] | undefined) ?? [];
  return serializeOrderedNodesToJsx(children, indentLevel, scopeVarName);
}

function formatVueAttrValue(attrName: string, val: string): string {
  if (
    (attrName === "id" && val.startsWith("slatico-")) ||
    /^url\(#slatico-[^)]+\)$/.test(val) ||
    /^#slatico-.+$/.test(val)
  ) {
    if (val.startsWith("slatico-")) {
      return `\`${val}-\${uid}\``;
    }
    const urlMatch = val.match(/^url\(#(slatico-[^)]+)\)$/);
    if (urlMatch && urlMatch[1]) {
      return `\`url(#${urlMatch[1]}-\${uid})\``;
    }
    const hrefMatch = val.match(/^#(slatico-.+)$/);
    if (hrefMatch && hrefMatch[1]) {
      return `\`#${hrefMatch[1]}-\${uid}\``;
    }
  }
  return JSON.stringify(val);
}

function serializeOrderedNodesToVueVNodes(
  nodes: readonly OrderedXmlNode[],
  indentLevel: number
): string {
  const indent = " ".repeat(indentLevel);
  const items: string[] = [];

  for (const node of nodes) {
    const tagNames = Object.keys(node).filter((k) => k !== ":@" && k !== "#text");
    const tagName = tagNames[0];
    if (!tagName) {
      continue;
    }

    const rawAttrs = node[":@"] ?? {};
    const propEntries: string[] = [];
    for (const [rawKey, val] of Object.entries(rawAttrs)) {
      if (!rawKey.startsWith("@_")) {
        continue;
      }
      const attrName = rawKey.slice(2);
      const strVal = String(val);
      propEntries.push(`${JSON.stringify(attrName)}: ${formatVueAttrValue(attrName, strVal)}`);
    }

    const propsLiteral = propEntries.length > 0 ? `{ ${propEntries.join(", ")} }` : "{}";
    const children = (node[tagName] as OrderedXmlNode[] | undefined) ?? [];

    if (children.length === 0) {
      items.push(`${indent}h(${JSON.stringify(tagName)}, ${propsLiteral})`);
    } else {
      const childVNodes = serializeOrderedNodesToVueVNodes(children, indentLevel + 2);
      items.push(
        `${indent}h(${JSON.stringify(tagName)}, ${propsLiteral}, [\n${childVNodes}\n${indent}])`
      );
    }
  }

  return items.join(",\n");
}

export function convertOptimizedSvgToVueVNodes(
  optimizedSvg: string,
  indentLevel = 8
): string {
  const parsed = ORDERED_XML_PARSER.parse(optimizedSvg) as OrderedXmlNode[];
  const svgNode = parsed.find((n) => "svg" in n);
  if (!svgNode) {
    throw new Error("Unable to find <svg> root node when generating Vue VNodes.");
  }
  const children = (svgNode.svg as OrderedXmlNode[] | undefined) ?? [];
  return serializeOrderedNodesToVueVNodes(children, indentLevel);
}

function formatReactNativeAttrExpression(attrName: string, val: string): string {
  if (val === "currentColor") {
    return "{color}";
  }
  if (val.startsWith("var(--slatico-secondary-color")) {
    return "{resolvedSecondaryColor}";
  }
  if (val.startsWith("var(--slatico-secondary-opacity")) {
    return "{secondaryOpacity}";
  }
  if (
    attrName === "id" ||
    attrName === "fill" ||
    attrName === "stroke" ||
    attrName === "clipPath" ||
    attrName === "mask" ||
    attrName === "href" ||
    attrName === "xlinkHref"
  ) {
    return formatScopedSvgAttrExpression(val, "instanceId");
  }
  return JSON.stringify(val);
}

function serializeOrderedNodesToReactNativeJsx(
  nodes: readonly OrderedXmlNode[],
  indentLevel: number,
  usedRnComponents: Set<string>
): string {
  const indent = " ".repeat(indentLevel);
  const lines: string[] = [];

  for (const node of nodes) {
    const tagNames = Object.keys(node).filter((k) => k !== ":@" && k !== "#text");
    const tagName = tagNames[0];
    if (!tagName) {
      continue;
    }

    const rnComponent = SVG_TAG_TO_RN[tagName];
    if (!rnComponent) {
      throw new Error(`Unsupported SVG tag "${tagName}" for React Native codegen.`);
    }
    usedRnComponents.add(rnComponent);

    const rawAttrs = node[":@"] ?? {};
    const attrPairs: string[] = [];
    for (const [rawKey, val] of Object.entries(rawAttrs)) {
      if (!rawKey.startsWith("@_")) {
        continue;
      }
      const attrName = toReactAttrName(rawKey.slice(2));
      const strVal = String(val);
      const formattedVal = formatReactNativeAttrExpression(attrName, strVal);
      attrPairs.push(`${attrName}=${formattedVal}`);
    }

    const attrString = attrPairs.length > 0 ? ` ${attrPairs.join(" ")}` : "";
    const children = (node[tagName] as OrderedXmlNode[] | undefined) ?? [];

    if (children.length === 0) {
      lines.push(`${indent}<${rnComponent}${attrString} />`);
    } else {
      lines.push(`${indent}<${rnComponent}${attrString}>`);
      lines.push(serializeOrderedNodesToReactNativeJsx(children, indentLevel + 2, usedRnComponents));
      lines.push(`${indent}</${rnComponent}>`);
    }
  }

  return lines.join("\n");
}

export function buildStyleSvgSprite(
  families: readonly DiscoveredIconFamily[],
  style: SlaticoStyle
): string {
  const symbols: string[] = [];
  for (const family of families) {
    const variant = family.variants[style];
    const symbolId = `slatico-${style}-${family.name}`;
    symbols.push(
      `  <symbol id="${symbolId}" viewBox="${variant.viewBox}">${variant.innerSvg}</symbol>`
    );
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">\n${symbols.join(
    "\n"
  )}\n</svg>`;
}

export function generateCoreCatalogModule(families: readonly DiscoveredIconFamily[]): string {
  const catalog = buildCatalogMetadata(families);
  const iconNamesLiteral = families.map((f) => JSON.stringify(f.name)).join(", ");

  return `// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
// Generated by scripts/generate-icons.ts from master SVG sources in /icons

import type { SlaticoCatalog } from "../types.js";

export const ICON_NAMES = [${iconNamesLiteral}] as const;

export type SlaticoIconName = (typeof ICON_NAMES)[number];

export const ICON_CATALOG: SlaticoCatalog = ${JSON.stringify(catalog, null, 2)} as const;
`;
}

export function generateSvgDataModule(families: readonly DiscoveredIconFamily[]): string {
  const assetTree: Record<
    string,
    Record<
      SlaticoStyle,
      {
        name: string;
        style: SlaticoStyle;
        symbolId: string;
        viewBox: string;
        svg: string;
        innerSvg: string;
      }
    >
  > = {};

  for (const family of families) {
    const styleMap = {} as Record<
      SlaticoStyle,
      {
        name: string;
        style: SlaticoStyle;
        symbolId: string;
        viewBox: string;
        svg: string;
        innerSvg: string;
      }
    >;
    for (const style of SLATICO_STYLES) {
      const v = family.variants[style];
      styleMap[style] = {
        name: family.name,
        style,
        symbolId: `slatico-${style}-${family.name}`,
        viewBox: v.viewBox,
        svg: v.optimizedSvg,
        innerSvg: v.innerSvg
      };
    }
    assetTree[family.name] = styleMap;
  }

  const spritesRecord = {} as Record<SlaticoStyle, string>;
  for (const style of SLATICO_STYLES) {
    spritesRecord[style] = buildStyleSvgSprite(families, style);
  }

  return `// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
// Generated by scripts/generate-icons.ts from master SVG sources in /icons

import type { SlaticoIconName, SlaticoStyle } from "@slatico/core";
import type { SlaticoSvgAsset } from "../index.js";

export const SVG_ASSETS: Readonly<
  Record<SlaticoIconName, Readonly<Record<SlaticoStyle, SlaticoSvgAsset>>>
> = ${JSON.stringify(assetTree, null, 2)} as const;

export const SVG_SPRITES: Readonly<Record<SlaticoStyle, string>> = ${JSON.stringify(
    spritesRecord,
    null,
    2
  )} as const;
`;
}

export function generateReactIconModule(family: DiscoveredIconFamily): string {
  const baseComponentName = `${family.pascalName}Icon`;

  const switchCases: string[] = [];
  for (const style of SLATICO_STYLES) {
    const jsxBody = convertOptimizedSvgToJsxBody(
      family.variants[style].optimizedSvg,
      8,
      "instanceId"
    );
    switchCases.push(`    case "${style}":\n      return (\n        <>\n${jsxBody}\n        </>\n      );`);
  }

  const styleWrapperExports: string[] = [];
  for (const style of SLATICO_STYLES) {
    const stylePascal = toPascalCase(style);
    const styleComponentName = `${family.pascalName}${stylePascal}Icon`;
    styleWrapperExports.push(
      `export const ${styleComponentName} = forwardRef<SVGSVGElement, Omit<SlaticoIconProps, "variant">>(\n  function ${styleComponentName}(props, ref) {\n    return <${baseComponentName} ref={ref} variant="${style}" {...props} />;\n  }\n);\n${styleComponentName}.displayName = "${styleComponentName}";`
    );
  }

  return `// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
// Generated by scripts/generate-icons.ts from master SVG sources in /icons

import { forwardRef, useId, type CSSProperties, type ReactNode } from "react";
import type { SlaticoStyle } from "@slatico/core";
import type { SlaticoIconProps } from "../types.js";

function render${family.pascalName}Variant(variant: SlaticoStyle, _instanceId: string): ReactNode {
  const instanceId = _instanceId;
  void instanceId;
  switch (variant) {
${switchCases.join("\n")}
  }
}

export const ${baseComponentName} = forwardRef<SVGSVGElement, SlaticoIconProps>(
  function ${baseComponentName}(
    {
      variant = "regular",
      size = 24,
      color = "currentColor",
      secondaryColor,
      secondaryOpacity,
      title,
      style,
      ...rest
    },
    ref
  ) {
    const rawId = useId();
    const instanceId = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
    const isColorVariant = variant === "color";
    const duotoneVars: Record<string, string | number> = {};
    if (secondaryColor !== undefined) {
      duotoneVars["--slatico-secondary-color"] = secondaryColor;
    }
    if (secondaryOpacity !== undefined) {
      duotoneVars["--slatico-secondary-opacity"] = secondaryOpacity;
    }

    const resolvedStyle: CSSProperties | undefined = isColorVariant
      ? style
      : ({
          color,
          ...duotoneVars,
          ...style
        } as CSSProperties);

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        style={resolvedStyle}
        role={title ? "img" : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
        data-slatico-icon="${family.name}"
        data-slatico-variant={variant}
        {...rest}
      >
        {title ? <title>{title}</title> : null}
        {render${family.pascalName}Variant(variant, instanceId)}
      </svg>
    );
  }
);
${baseComponentName}.displayName = "${baseComponentName}";

${styleWrapperExports.join("\n\n")}
`;
}

export function generateReactBarrelModule(families: readonly DiscoveredIconFamily[]): string {
  const lines = [
    "// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY",
    "// Generated by scripts/generate-icons.ts from master SVG sources in /icons",
    ""
  ];

  for (const family of families) {
    const exportedNames = [
      `${family.pascalName}Icon`,
      ...SLATICO_STYLES.map((s) => `${family.pascalName}${toPascalCase(s)}Icon`)
    ];
    lines.push(
      `export { ${exportedNames.join(", ")} } from "./${family.name}.js";`
    );
  }

  return `${lines.join("\n")}\n`;
}

export function generateVueIconModule(family: DiscoveredIconFamily): string {
  const baseComponentName = `${family.pascalName}Icon`;

  const switchCases: string[] = [];
  for (const style of SLATICO_STYLES) {
    const vnodes = convertOptimizedSvgToVueVNodes(family.variants[style].optimizedSvg, 8);
    switchCases.push(`    case "${style}":\n      return [\n${vnodes}\n      ];`);
  }

  const styleWrapperExports: string[] = [];
  for (const style of SLATICO_STYLES) {
    const stylePascal = toPascalCase(style);
    const styleComponentName = `${family.pascalName}${stylePascal}Icon`;
    styleWrapperExports.push(
      `export const ${styleComponentName} = defineComponent({\n  name: "${styleComponentName}",\n  props: {\n    size: { type: [Number, String] as PropType<number | string>, default: 24 },\n    color: { type: String, default: "currentColor" },\n    secondaryColor: { type: String as PropType<string | undefined>, default: undefined },\n    secondaryOpacity: { type: [Number, String] as PropType<number | string | undefined>, default: undefined },\n    title: { type: String as PropType<string | undefined>, default: undefined }\n  },\n  setup(props, { attrs }) {\n    return () => h(${baseComponentName}, { ...attrs, ...props, variant: "${style}" });\n  }\n});`
    );
  }

  return `// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
// Generated by scripts/generate-icons.ts from master SVG sources in /icons

import { defineComponent, h, useId, type PropType, type VNode } from "vue";
import type { SlaticoStyle } from "@slatico/core";

function render${family.pascalName}VueVariant(variant: SlaticoStyle, _uid: string): VNode[] {
  const uid = _uid;
  void uid;
  switch (variant) {
${switchCases.join("\n")}
  }
}

export const ${baseComponentName} = defineComponent({
  name: "${baseComponentName}",
  props: {
    variant: { type: String as PropType<SlaticoStyle>, default: "regular" },
    size: { type: [Number, String] as PropType<number | string>, default: 24 },
    color: { type: String, default: "currentColor" },
    secondaryColor: { type: String as PropType<string | undefined>, default: undefined },
    secondaryOpacity: { type: [Number, String] as PropType<number | string | undefined>, default: undefined },
    title: { type: String as PropType<string | undefined>, default: undefined }
  },
  setup(props, { attrs }) {
    const rawId = useId();
    const uid = String(rawId ?? "v0").replace(/[^a-zA-Z0-9_-]/g, "");

    return () => {
      const variant = props.variant ?? "regular";
      const isColorVariant = variant === "color";
      const styleObj: Record<string, string | number> = {};
      if (!isColorVariant && props.color) {
        styleObj.color = props.color;
      }
      if (props.secondaryColor !== undefined) {
        styleObj["--slatico-secondary-color"] = props.secondaryColor;
      }
      if (props.secondaryOpacity !== undefined) {
        styleObj["--slatico-secondary-opacity"] = props.secondaryOpacity;
      }

      const children: VNode[] = [];
      if (props.title) {
        children.push(h("title", null, props.title));
      }
      children.push(...render${family.pascalName}VueVariant(variant, uid));

      return h(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          viewBox: "0 0 24 24",
          width: props.size ?? 24,
          height: props.size ?? 24,
          fill: "none",
          style: styleObj,
          role: props.title ? "img" : undefined,
          "aria-label": props.title || undefined,
          "aria-hidden": props.title ? undefined : "true",
          "data-slatico-icon": "${family.name}",
          "data-slatico-variant": variant,
          ...attrs
        },
        children
      );
    };
  }
});

${styleWrapperExports.join("\n\n")}
`;
}

export function generateWebIconModule(family: DiscoveredIconFamily): string {
  const defExportName = `${family.name.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase())}IconDef`;
  const pascalExportName = `${family.pascalName}IconDef`;

  const variantsMap: Record<SlaticoStyle, string> = {} as Record<SlaticoStyle, string>;
  for (const style of SLATICO_STYLES) {
    variantsMap[style] = family.variants[style].innerSvg;
  }

  return `// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
// Generated by scripts/generate-icons.ts from master SVG sources in /icons

import type { SlaticoWebIconDefinition } from "../index.js";

export const ${defExportName}: SlaticoWebIconDefinition = {
  name: "${family.name}",
  variants: ${JSON.stringify(variantsMap, null, 2)}
} as const;

export const ${pascalExportName}: SlaticoWebIconDefinition = ${defExportName};
`;
}

export function generateWebBarrelModule(families: readonly DiscoveredIconFamily[]): string {
  const lines = [
    "// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY",
    "// Generated by scripts/generate-icons.ts from master SVG sources in /icons",
    ""
  ];

  for (const family of families) {
    const camelName = `${family.name.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase())}IconDef`;
    const pascalName = `${family.pascalName}IconDef`;
    lines.push(`export { ${camelName}, ${pascalName} } from "./${family.name}.js";`);
  }

  return `${lines.join("\n")}\n`;
}

export function generateReactNativeIconModule(family: DiscoveredIconFamily): string {
  const baseComponentName = `${family.pascalName}Icon`;
  const usedRnComponents = new Set<string>(["Svg"]);

  const switchCases: string[] = [];
  for (const style of SLATICO_STYLES) {
    const parsed = ORDERED_XML_PARSER.parse(
      family.variants[style].optimizedSvg
    ) as OrderedXmlNode[];
    const svgNode = parsed.find((n) => "svg" in n);
    if (!svgNode) {
      throw new Error(`Missing <svg> root in ${family.name} (${style}).`);
    }
    const children = (svgNode.svg as OrderedXmlNode[] | undefined) ?? [];
    const jsxBody = serializeOrderedNodesToReactNativeJsx(children, 8, usedRnComponents);
    switchCases.push(`    case "${style}":\n      return (\n        <>\n${jsxBody}\n        </>\n      );`);
  }

  const sortedRnImports = Array.from(usedRnComponents).sort((a, b) => a.localeCompare(b));

  const styleWrapperExports: string[] = [];
  for (const style of SLATICO_STYLES) {
    const stylePascal = toPascalCase(style);
    const styleComponentName = `${family.pascalName}${stylePascal}Icon`;
    styleWrapperExports.push(
      `export function ${styleComponentName}(props: Omit<SlaticoNativeIconProps, "variant">): ReactElement {\n  return <${baseComponentName} variant="${style}" {...props} />;\n}\n${styleComponentName}.displayName = "${styleComponentName}";`
    );
  }

  return `// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
// Generated by scripts/generate-icons.ts from master SVG sources in /icons

import { useId, type ReactElement, type ReactNode } from "react";
import { ${sortedRnImports.join(", ")} } from "react-native-svg";
import type { SlaticoStyle } from "@slatico/core";
import type { SlaticoNativeIconProps } from "../types.js";

interface VariantRenderParams {
  readonly variant: SlaticoStyle;
  readonly color: string;
  readonly resolvedSecondaryColor: string;
  readonly secondaryOpacity: number | string;
  readonly instanceId: string;
}

function render${family.pascalName}NativeVariant(params: VariantRenderParams): ReactNode {
  const { variant, color, resolvedSecondaryColor, secondaryOpacity, instanceId } = params;
  void color;
  void resolvedSecondaryColor;
  void secondaryOpacity;
  void instanceId;
  switch (variant) {
${switchCases.join("\n")}
  }
}

export function ${baseComponentName}({
  variant = "regular",
  size = 24,
  color = "#09090B",
  secondaryColor,
  secondaryOpacity = 0.22,
  title,
  accessibilityLabel,
  ...rest
}: SlaticoNativeIconProps): ReactElement {
  const rawId = useId();
  const instanceId = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const resolvedSecondaryColor = secondaryColor ?? color;
  const resolvedA11yLabel = accessibilityLabel ?? title;
  const a11yProps = resolvedA11yLabel
    ? { accessible: true, accessibilityRole: "image" as const, accessibilityLabel: resolvedA11yLabel }
    : {};

  return (
    <Svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      {...a11yProps}
      {...rest}
    >
      {render${family.pascalName}NativeVariant({
        variant,
        color,
        resolvedSecondaryColor,
        secondaryOpacity,
        instanceId
      })}
    </Svg>
  );
}
${baseComponentName}.displayName = "${baseComponentName}";

${styleWrapperExports.join("\n\n")}
`;
}

export async function generateAllIconArtifacts(): Promise<void> {
  const result = await discoverAndValidateIcons(ICONS_DIR, REPO_ROOT);
  if (!result.valid) {
    console.error("Icon validation failed with the following errors:");
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
    process.exitCode = 1;
    throw new Error(`Icon pipeline validation failed with ${result.errors.length} error(s).`);
  }

  await fs.mkdir(CORE_GENERATED_DIR, { recursive: true });
  await fs.mkdir(SVG_GENERATED_DIR, { recursive: true });
  await fs.mkdir(FONT_GENERATED_DIR, { recursive: true });

  for (const targetDir of [REACT_ICONS_DIR, VUE_ICONS_DIR, WEB_ICONS_DIR, RN_ICONS_DIR]) {
    await fs.rm(targetDir, { recursive: true, force: true });
    await fs.mkdir(targetDir, { recursive: true });
  }

  await fs.writeFile(
    path.join(CORE_GENERATED_DIR, "catalog.ts"),
    generateCoreCatalogModule(result.families),
    "utf8"
  );

  await fs.writeFile(
    path.join(SVG_GENERATED_DIR, "svg-data.ts"),
    generateSvgDataModule(result.families),
    "utf8"
  );

  const fontManifest = await loadAndSyncCodepointsManifest(
    FONT_CODEPOINTS_PATH,
    result.families
  );
  await fs.writeFile(
    path.join(FONT_GENERATED_DIR, "font-manifest.ts"),
    generateFontManifestTsModule(result.families, fontManifest),
    "utf8"
  );

  const sharedBarrel = generateReactBarrelModule(result.families);

  for (const family of result.families) {
    await fs.writeFile(
      path.join(REACT_ICONS_DIR, `${family.name}.tsx`),
      generateReactIconModule(family),
      "utf8"
    );
    await fs.writeFile(
      path.join(VUE_ICONS_DIR, `${family.name}.ts`),
      generateVueIconModule(family),
      "utf8"
    );
    await fs.writeFile(
      path.join(WEB_ICONS_DIR, `${family.name}.ts`),
      generateWebIconModule(family),
      "utf8"
    );
    await fs.writeFile(
      path.join(RN_ICONS_DIR, `${family.name}.tsx`),
      generateReactNativeIconModule(family),
      "utf8"
    );
  }

  await fs.writeFile(path.join(REACT_ICONS_DIR, "index.ts"), sharedBarrel, "utf8");
  await fs.writeFile(path.join(VUE_ICONS_DIR, "index.ts"), sharedBarrel, "utf8");
  await fs.writeFile(
    path.join(WEB_ICONS_DIR, "index.ts"),
    generateWebBarrelModule(result.families),
    "utf8"
  );
  await fs.writeFile(path.join(RN_ICONS_DIR, "index.ts"), sharedBarrel, "utf8");

  await generateFlutterPackageArtifacts(REPO_ROOT, result.families, fontManifest);
  await generateAndroidPackageArtifacts(REPO_ROOT, result.families);

  console.log(
    `[Slatico Pipeline] Generated ${result.families.length} icon families (${
      result.families.length * SLATICO_STYLES.length
    } style variants) across @slatico/core, @slatico/svg, @slatico/font, @slatico/react, @slatico/vue, @slatico/web, @slatico/react-native, slatico_icons (Flutter), and com.infitus.slatico (Android).`
  );
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));

if (isDirectExecution) {
  generateAllIconArtifacts().catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
