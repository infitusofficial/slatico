import { SLATICO_STYLES, type SlaticoStyle } from "./types.js";

const KEBAB_CASE_REGEX = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

/**
 * Validates whether a string is a valid Slatico icon style.
 */
export function isValidSlaticoStyle(value: string): value is SlaticoStyle {
  return (SLATICO_STYLES as readonly string[]).includes(value);
}

/**
 * Validates whether an icon name adheres to strict kebab-case naming conventions.
 */
export function isValidIconName(name: string): boolean {
  return KEBAB_CASE_REGEX.test(name);
}

/**
 * Converts a kebab-case icon name (e.g., "shield-check") to PascalCase ("ShieldCheck").
 */
export function toPascalCase(name: string): string {
  return name
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join("");
}

/**
 * Formats a React/Vue component name for a given icon name and optional style suffix.
 */
export function getIconComponentName(name: string, style?: SlaticoStyle): string {
  const base = toPascalCase(name);
  if (!style) {
    return `${base}Icon`;
  }
  return `${base}${toPascalCase(style)}Icon`;
}
