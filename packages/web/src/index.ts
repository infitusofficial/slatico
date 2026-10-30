import type { SlaticoIconName, SlaticoStyle } from "@slatico/core";

export interface SlaticoWebIconDefinition {
  readonly name: SlaticoIconName;
  readonly variants: Readonly<Record<SlaticoStyle, string>>;
}

export interface SlaticoWebElementAttributes {
  readonly name: SlaticoIconName;
  readonly variant?: SlaticoStyle | undefined;
  readonly size?: number | string | undefined;
  readonly color?: string | undefined;
  readonly "secondary-color"?: string | undefined;
  readonly "secondary-opacity"?: number | string | undefined;
  readonly label?: string | undefined;
}

export const SLATICO_WEB_TAG_NAME = "slatico-icon" as const;

const ICON_REGISTRY = new Map<string, SlaticoWebIconDefinition>();

/**
 * Registers one or more icon definitions for use by <slatico-icon>.
 * Tree-shakeable: import only the icon definitions your application needs.
 */
export function registerSlaticoIcons(
  ...definitions: readonly SlaticoWebIconDefinition[]
): void {
  for (const def of definitions) {
    ICON_REGISTRY.set(def.name, def);
  }
  if (typeof document !== "undefined" && typeof customElements !== "undefined") {
    const existingElements = document.querySelectorAll<HTMLElement>(SLATICO_WEB_TAG_NAME);
    existingElements.forEach((el) => {
      if ("renderIcon" in el && typeof (el as { renderIcon?: () => void }).renderIcon === "function") {
        (el as { renderIcon: () => void }).renderIcon();
      }
    });
  }
}

export function getRegisteredSlaticoIcon(
  name: string
): SlaticoWebIconDefinition | undefined {
  return ICON_REGISTRY.get(name);
}

export function clearRegisteredSlaticoIcons(): void {
  ICON_REGISTRY.clear();
}

function escapeAttr(val: string): string {
  return val
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function scopeInnerSvgIds(innerSvg: string, scopeId: string): string {
  return innerSvg
    .replace(/\bid="(slatico-[^"]+)"/g, `id="$1-${scopeId}"`)
    .replace(/url\(#(slatico-[^)]+)\)/g, `url(#$1-${scopeId})`)
    .replace(/href="#(slatico-[^"]+)"/g, `href="#$1-${scopeId}"`);
}

let webInstanceCounter = 0;

/**
 * Builds the inner Shadow DOM or light DOM HTML for a <slatico-icon> configuration.
 * Can also be called in Node/SSR environments for testing and pre-rendering.
 */
export function buildSlaticoWebElementMarkup(params: {
  name: string;
  variant?: SlaticoStyle | undefined;
  size?: string | number | undefined;
  color?: string | undefined;
  secondaryColor?: string | undefined;
  secondaryOpacity?: string | number | undefined;
  label?: string | undefined;
  instanceId?: string | undefined;
}): string {
  const {
    name,
    variant = "regular",
    size = "24",
    color,
    secondaryColor,
    secondaryOpacity,
    label,
    instanceId = `wc${++webInstanceCounter}`
  } = params;

  const def = ICON_REGISTRY.get(name);
  if (!def) {
    return "";
  }

  const rawInner = def.variants[variant] ?? def.variants.regular;
  if (!rawInner) {
    return "";
  }

  const scopedInner = scopeInnerSvgIds(rawInner, instanceId);
  const resolvedSize = typeof size === "number" || /^\d+(\.\d+)?$/.test(String(size))
    ? `${size}px`
    : String(size);

  const styleRules: string[] = [
    "display:inline-block",
    `width:${escapeAttr(resolvedSize)}`,
    `height:${escapeAttr(resolvedSize)}`,
    "vertical-align:middle",
    "flex-shrink:0"
  ];

  if (variant !== "color" && color) {
    styleRules.push(`color:${escapeAttr(color)}`);
  }
  if (secondaryColor) {
    styleRules.push(`--slatico-secondary-color:${escapeAttr(secondaryColor)}`);
  }
  if (secondaryOpacity !== undefined && String(secondaryOpacity) !== "") {
    styleRules.push(`--slatico-secondary-opacity:${escapeAttr(String(secondaryOpacity))}`);
  }

  const a11yAttrs = label
    ? ` role="img" aria-label="${escapeAttr(label)}"`
    : ' aria-hidden="true"';
  const titleNode = label ? `<title>${escapeAttr(label)}</title>` : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="none" style="${styleRules.join(
    ";"
  )}"${a11yAttrs} data-slatico-icon="${escapeAttr(name)}" data-slatico-variant="${escapeAttr(
    variant
  )}" part="svg">${titleNode}${scopedInner}</svg>`;
}

const BaseHTMLElement: typeof HTMLElement =
  typeof HTMLElement !== "undefined"
    ? HTMLElement
    : (class {} as unknown as typeof HTMLElement);

export class SlaticoIconElement extends BaseHTMLElement {
  static get observedAttributes(): readonly string[] {
    return [
      "name",
      "variant",
      "size",
      "color",
      "secondary-color",
      "secondary-opacity",
      "label",
      "title"
    ];
  }

  readonly #instanceId = `wc${++webInstanceCounter}`;
  #root: ShadowRoot | null = null;

  constructor() {
    super();
    if (typeof this.attachShadow === "function") {
      this.#root = this.attachShadow({ mode: "open" });
    }
  }

  connectedCallback(): void {
    this.renderIcon();
  }

  attributeChangedCallback(): void {
    this.renderIcon();
  }

  renderIcon(): void {
    if (!this.#root) {
      return;
    }

    const name = this.getAttribute("name") ?? "";
    const variantAttr = (this.getAttribute("variant") ?? "regular") as SlaticoStyle;
    const size = this.getAttribute("size") ?? "24";
    const color = this.getAttribute("color") ?? undefined;
    const secondaryColor = this.getAttribute("secondary-color") ?? undefined;
    const secondaryOpacity = this.getAttribute("secondary-opacity") ?? undefined;
    const label = this.getAttribute("label") ?? this.getAttribute("title") ?? undefined;

    if (!label && !this.hasAttribute("aria-hidden") && !this.hasAttribute("role")) {
      this.setAttribute("aria-hidden", "true");
    } else if (label) {
      this.removeAttribute("aria-hidden");
      this.setAttribute("role", "img");
      this.setAttribute("aria-label", label);
    }

    const svgMarkup = buildSlaticoWebElementMarkup({
      name,
      variant: variantAttr,
      size,
      color,
      secondaryColor,
      secondaryOpacity,
      label,
      instanceId: this.#instanceId
    });

    this.#root.innerHTML = `<style>:host{display:inline-flex;align-items:center;justify-content:center;line-height:0}</style>${svgMarkup}`;
  }
}

/**
 * Defines the <slatico-icon> custom element in the browser CustomElementRegistry.
 * Safe to call multiple times or during SSR (no-op when customElements is unavailable).
 */
export function defineSlaticoIconElement(
  tagName: string = SLATICO_WEB_TAG_NAME
): void {
  if (typeof customElements === "undefined") {
    return;
  }
  if (!customElements.get(tagName)) {
    customElements.define(tagName, SlaticoIconElement);
  }
}

export * from "./icons/index.js";
