/** URL helpers for Icon Explorer deep links (`/icons/<slug>`). */

export const ICONS_BASE_PATH = "/icons";
const MAX_SLUG_LENGTH = 64;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type SlugParseResult =
  | { readonly kind: "none" }
  | { readonly kind: "valid"; readonly slug: string; readonly normalizedFrom: string | null }
  | { readonly kind: "invalid" };

/**
 * Normalizes a raw slug (URL path segment or `?icon=` value) into catalog form, or rejects it.
 * Returns only the syntactic verdict — callers must still confirm the slug exists in the catalog.
 */
export function normalizeIconSlug(raw: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  const slug = decoded.normalize("NFKC").trim().toLowerCase();
  if (!slug || slug.length > MAX_SLUG_LENGTH || !SLUG_PATTERN.test(slug)) {
    return null;
  }
  return slug;
}

/** Extracts the slug from an Explorer pathname: `/icons` → none, `/icons/<slug>` → parsed. */
export function parseIconPathname(pathname: string): SlugParseResult {
  const trimmed = pathname.replace(/\/+$/, "");
  if (trimmed === ICONS_BASE_PATH || trimmed === "") {
    return { kind: "none" };
  }
  if (!trimmed.startsWith(`${ICONS_BASE_PATH}/`)) {
    return { kind: "none" };
  }
  const raw = trimmed.slice(ICONS_BASE_PATH.length + 1);
  if (!raw || raw.includes("/")) {
    return { kind: "invalid" };
  }
  const slug = normalizeIconSlug(raw);
  if (!slug) {
    return { kind: "invalid" };
  }
  return { kind: "valid", slug, normalizedFrom: slug === raw ? null : raw };
}

export function iconDetailPath(slug: string): string {
  return `${ICONS_BASE_PATH}/${slug}`;
}
