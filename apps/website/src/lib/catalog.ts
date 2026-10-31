import {
  ICON_CATALOG,
  SLATICO_STYLES,
  SLATICO_STYLE_SPECS,
  type SlaticoIconEntry,
  type SlaticoIconName,
  type SlaticoStyle
} from "@slatico/core";

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
    description: "Home, dashboards, search, and workspace structure icons."
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

interface IconSemanticEnrichment {
  readonly categoryId: Exclude<IconCategoryId, "all">;
  readonly keywords: readonly string[];
  readonly summary: string;
}

const ICON_SEMANTIC_MAP: Readonly<Record<string, IconSemanticEnrichment>> = {
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

export interface EnrichedCatalogIcon extends SlaticoIconEntry {
  readonly name: SlaticoIconName;
  readonly categoryId: Exclude<IconCategoryId, "all">;
  readonly categoryLabel: string;
  readonly keywords: readonly string[];
  readonly summary: string;
  readonly searchableText: string;
}

function inferFallbackCategory(name: string): Exclude<IconCategoryId, "all"> {
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

export const ENRICHED_ICONS: readonly EnrichedCatalogIcon[] = ICON_CATALOG.icons.map(
  (entry) => {
    const enrichment = ICON_SEMANTIC_MAP[entry.name];
    const categoryId = enrichment?.categoryId ?? inferFallbackCategory(entry.name);
    const categoryDef =
      ICON_CATEGORIES.find((cat) => cat.id === categoryId) ?? ICON_CATEGORIES[1]!;
    const nameTokens = entry.name.split("-").filter(Boolean);
    const keywords = enrichment?.keywords ?? nameTokens;
    const summary =
      enrichment?.summary ??
      `${entry.pascalName} vector icon across all 7 Slatico architectural styles.`;

    const searchableText = [
      entry.name,
      entry.name.replace(/-/g, " "),
      entry.name.replace(/-/g, ""),
      entry.pascalName.toLowerCase(),
      categoryDef.label.toLowerCase(),
      ...nameTokens,
      ...keywords.map((k) => k.toLowerCase())
    ].join(" ");

    return {
      ...entry,
      name: entry.name as SlaticoIconName,
      categoryId,
      categoryLabel: categoryDef.label,
      keywords,
      summary,
      searchableText
    };
  }
);

export function getEnrichedIconByName(
  slug: string
): EnrichedCatalogIcon | undefined {
  const normalized = slug.trim().toLowerCase();
  return ENRICHED_ICONS.find((icon) => icon.name === normalized);
}

export function normalizeIconSearchQuery(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function filterCatalogIcons(params: {
  query?: string;
  category?: IconCategoryId;
}): readonly EnrichedCatalogIcon[] {
  const rawQuery = (params.query ?? "").trim().toLowerCase();
  const kebabQuery = normalizeIconSearchQuery(params.query ?? "");
  const category = params.category ?? "all";

  return ENRICHED_ICONS.filter((icon) => {
    if (category !== "all" && icon.categoryId !== category) {
      return false;
    }
    if (!rawQuery) {
      return true;
    }
    if (icon.name.includes(kebabQuery) || icon.searchableText.includes(rawQuery)) {
      return true;
    }
    const tokens = rawQuery.split(/[\s-]+/).filter(Boolean);
    return tokens.every((token) => icon.searchableText.includes(token));
  });
}

export { ICON_CATALOG, SLATICO_STYLES, SLATICO_STYLE_SPECS };
export type { SlaticoIconName, SlaticoStyle };
