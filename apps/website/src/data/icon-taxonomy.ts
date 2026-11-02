/**
 * Icon taxonomy shared by the build-time catalog generator (`scripts/generate-website-catalog.ts`)
 * and the browser. Pure data and string helpers only: no SVG artwork and no `@slatico/*` runtime
 * imports, so importing it never pulls the icon catalog into a client bundle.
 */

export type IconCategoryId =
  | "all"
  | "navigation-layout"
  | "communication-alerts"
  | "security-identity"
  | "commerce-finance"
  | "cloud-data"
  | "actions-editing"
  | "system-settings";

export interface IconCategoryDefinition {
  readonly id: IconCategoryId;
  readonly label: string;
  readonly description: string;
}

export const ICON_CATEGORIES: readonly IconCategoryDefinition[] = [
  {
    id: "all",
    label: "All Icons",
    description: "Complete Slatico icon catalog across all functional domains."
  },
  {
    id: "navigation-layout",
    label: "Navigation & Layout",
    description: "Home, directional arrows, dashboards, search, and workspace structure icons."
  },
  {
    id: "communication-alerts",
    label: "Communication & Alerts",
    description: "Messaging, notifications, and inbox status indicators."
  },
  {
    id: "security-identity",
    label: "Security & Identity",
    description: "Authentication, access control, shields, and user profiles."
  },
  {
    id: "commerce-finance",
    label: "Commerce & Finance",
    description: "Payments, wallets, billing cards, and financial growth."
  },
  {
    id: "cloud-data",
    label: "Cloud & Analytics",
    description: "Cloud storage, sync verification, and trend metrics."
  },
  {
    id: "actions-editing",
    label: "Actions & Editing",
    description: "Create, edit, remove, and destructive action controls."
  },
  {
    id: "system-settings",
    label: "System & Controls",
    description: "Configuration gears, sliders, and preference adjustments."
  }
] as const;

export interface IconSemanticEnrichment {
  readonly categoryId: Exclude<IconCategoryId, "all">;
  readonly keywords: readonly string[];
  readonly summary: string;
}

export const ICON_SEMANTIC_MAP: Readonly<Record<string, IconSemanticEnrichment>> = {
  "arrow-down": {
    categoryId: "navigation-layout",
    keywords: ["arrow", "down", "south", "download", "direction", "scroll", "move", "pointer", "bottom"],
    summary: "Downward directional arrow for downloads, scroll indicators, and descending navigation."
  },
  "arrow-up": {
    categoryId: "navigation-layout",
    keywords: ["arrow", "up", "north", "upload", "direction", "scroll", "move", "pointer", "top"],
    summary: "Upward directional arrow for uploads, back-to-top actions, and ascending navigation."
  },
  "arrow-up-left": {
    categoryId: "navigation-layout",
    keywords: ["arrow", "up-left", "northwest", "diagonal", "return", "direction", "pointer", "corner"],
    summary: "Diagonal upper-left arrow for return navigation, parent contexts, and directional pointers."
  },
  "arrow-up-right": {
    categoryId: "navigation-layout",
    keywords: ["arrow", "up-right", "northeast", "diagonal", "external link", "open", "launch", "direction", "outbound"],
    summary: "Diagonal upper-right arrow for external links, outbound launches, and call-to-action buttons."
  },
  bell: {
    categoryId: "communication-alerts",
    keywords: ["notification", "alert", "alarm", "ring", "reminder", "chime", "updates"],
    summary: "Notification bell for alerts, activity feeds, and real-time reminders."
  },
  cloud: {
    categoryId: "cloud-data",
    keywords: ["storage", "server", "weather", "remote", "backup", "network", "hosting"],
    summary: "Cloud infrastructure symbol for remote storage, sync, and SaaS states."
  },
  "cloud-check": {
    categoryId: "cloud-data",
    keywords: ["saved", "synced", "backup", "verified", "upload complete", "cloud status"],
    summary: "Verified cloud state indicating completed sync or backed-up data."
  },
  "credit-card": {
    categoryId: "commerce-finance",
    keywords: ["payment", "billing", "checkout", "debit", "subscription", "card", "purchase"],
    summary: "Payment card for checkout flows, billing portals, and subscription settings."
  },
  envelope: {
    categoryId: "communication-alerts",
    keywords: ["email", "mail", "message", "inbox", "letter", "contact", "unread"],
    summary: "Closed envelope representing unread messages, email actions, and contact forms."
  },
  "envelope-open": {
    categoryId: "communication-alerts",
    keywords: ["read", "opened mail", "newsletter", "inbox", "message read", "email"],
    summary: "Opened envelope for read states, email campaigns, and message archives."
  },
  gear: {
    categoryId: "system-settings",
    keywords: ["settings", "preferences", "cog", "configuration", "system", "options", "admin"],
    summary: "Precision mechanical gear for system configuration and application preferences."
  },
  house: {
    categoryId: "navigation-layout",
    keywords: ["home", "start", "main", "overview", "landing", "building", "residence"],
    summary: "Primary home navigation icon for root views and workspace overviews."
  },
  "layout-dashboard": {
    categoryId: "navigation-layout",
    keywords: ["grid", "analytics", "panels", "bento", "workspace", "overview", "widgets"],
    summary: "Modular bento grid for dashboards, workspace switchers, and analytics views."
  },
  lock: {
    categoryId: "security-identity",
    keywords: ["secure", "private", "password", "encrypted", "protected", "auth", "closed"],
    summary: "Closed padlock indicating encrypted states, permissions, and authentication."
  },
  "lock-open": {
    categoryId: "security-identity",
    keywords: ["unlocked", "public", "access", "decrypted", "open", "permission"],
    summary: "Unlocked padlock representing granted access or public resource visibility."
  },
  "magnifying-glass": {
    categoryId: "navigation-layout",
    keywords: ["search", "find", "lookup", "explore", "filter", "inspect", "zoom"],
    summary: "Optical search lens for command palettes, search inputs, and discovery views."
  },
  minus: {
    categoryId: "actions-editing",
    keywords: ["remove", "subtract", "collapse", "decrease", " zoom out", "delete", "line"],
    summary: "Horizontal subtraction bar for quantity steppers, accordions, and zoom controls."
  },
  pencil: {
    categoryId: "actions-editing",
    keywords: ["edit", "write", "compose", "modify", "rename", "draw", "annotate"],
    summary: "Drafting pencil for inline editing, content creation, and annotation actions."
  },
  plus: {
    categoryId: "actions-editing",
    keywords: ["add", "create", "new", "insert", "expand", "increase", "zoom in"],
    summary: "Balanced cross mark for primary creation actions, new items, and expansion."
  },
  shield: {
    categoryId: "security-identity",
    keywords: ["security", "protection", "defense", "privacy", "guard", "firewall", "safety"],
    summary: "Protective emblem for security centers, privacy controls, and trust badges."
  },
  "shield-check": {
    categoryId: "security-identity",
    keywords: ["verified", "compliant", "protected", "audit", "safe", "certified", "security"],
    summary: "Verified security shield for compliance status, 2FA, and audited protection."
  },
  "sliders-horizontal": {
    categoryId: "system-settings",
    keywords: ["filters", "controls", "tuning", "equalizer", "preferences", "adjust", "options"],
    summary: "Horizontal fader tracks for advanced search filters and parameter tuning."
  },
  trash: {
    categoryId: "actions-editing",
    keywords: ["delete", "remove", "bin", "garbage", "discard", "archive", "clear"],
    summary: "Waste receptacle for item deletion, bin management, and cleanup workflows."
  },
  "trash-x": {
    categoryId: "actions-editing",
    keywords: ["permanent delete", "purge", "destroy", "erase", "remove", "danger"],
    summary: "Destructive purge action icon for permanent deletion and irreversible removal."
  },
  "trend-up": {
    categoryId: "cloud-data",
    keywords: ["growth", "analytics", "chart", "metrics", "performance", "increase", "stocks"],
    summary: "Ascending trajectory arrow for KPI growth, revenue charts, and analytics."
  },
  user: {
    categoryId: "security-identity",
    keywords: ["profile", "account", "person", "avatar", "member", "customer", "identity"],
    summary: "Human silhouette for user profiles, account menus, and identity management."
  },
  wallet: {
    categoryId: "commerce-finance",
    keywords: ["balance", "money", "crypto", "funds", "billing", "payout", "finance"],
    summary: "Bifold wallet for account balances, payouts, and financial overview screens."
  }
};

export function inferFallbackCategory(name: string): Exclude<IconCategoryId, "all"> {
  if (name.includes("cloud") || name.includes("trend")) return "cloud-data";
  if (name.includes("lock") || name.includes("shield") || name.includes("user")) {
    return "security-identity";
  }
  if (name.includes("card") || name.includes("wallet")) return "commerce-finance";
  if (name.includes("bell") || name.includes("envelope")) return "communication-alerts";
  if (name.includes("gear") || name.includes("slider")) return "system-settings";
  if (
    name.includes("plus") ||
    name.includes("minus") ||
    name.includes("pencil") ||
    name.includes("trash")
  ) {
    return "actions-editing";
  }
  return "navigation-layout";
}

export type IconFamilyCategoryId = Exclude<IconCategoryId, "all">;

export function getCategoryLabel(categoryId: IconCategoryId): string {
  return (ICON_CATEGORIES.find((cat) => cat.id === categoryId) ?? ICON_CATEGORIES[1]!).label;
}

/** Converts a kebab-case slug into its PascalCase component name (`arrow-up` → `ArrowUp`). */
export function toPascalName(name: string): string {
  return name
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/** The lowercase text a family is searched against (unchanged from the original explorer). */
export function buildSearchableText(params: {
  readonly name: string;
  readonly pascalName: string;
  readonly categoryLabel: string;
  readonly keywords: readonly string[];
}): string {
  const nameTokens = params.name.split("-").filter(Boolean);
  return [
    params.name,
    params.name.replace(/-/g, " "),
    params.name.replace(/-/g, ""),
    params.pascalName.toLowerCase(),
    params.categoryLabel.toLowerCase(),
    ...nameTokens,
    ...params.keywords.map((k) => k.toLowerCase())
  ].join(" ");
}

export function normalizeIconSearchQuery(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export interface ParsedIconQuery {
  /** Lowercased, trimmed query ("" means no text filter). */
  readonly raw: string;
  /** Kebab-case form matched against the family name. */
  readonly kebab: string;
  /** Whitespace / hyphen separated tokens that must all occur. */
  readonly tokens: readonly string[];
}

export function parseIconQuery(query: string): ParsedIconQuery {
  const raw = query.trim().toLowerCase();
  return {
    raw,
    kebab: normalizeIconSearchQuery(query),
    tokens: raw.split(/[\s-]+/).filter(Boolean)
  };
}

/** Exact match rule of the Icon Explorer search (name substring, phrase, or every token). */
export function matchesIconQuery(
  family: { readonly name: string; readonly searchableText: string },
  query: ParsedIconQuery
): boolean {
  if (!query.raw) {
    return true;
  }
  if (family.name.includes(query.kebab) || family.searchableText.includes(query.raw)) {
    return true;
  }
  return query.tokens.every((token) => family.searchableText.includes(token));
}
