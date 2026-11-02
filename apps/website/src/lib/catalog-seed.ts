import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { preload } from "react-dom";
import {
  CATALOG_MANIFEST_PATH,
  CATALOG_SHARD_PATH,
  metaShardFile,
  pathShardFile,
  type CatalogManifest
} from "./catalog-format";
import { ENRICHED_ICONS } from "./catalog";

/**
 * Server-only helpers that give the client Explorer an instant first page:
 * the first families' names are rendered into the static HTML (crawlable, no layout shift), and
 * the manifest + first shards are preloaded so icons paint right after hydration.
 */

export interface ExplorerSeedFamily {
  readonly name: string;
  readonly categoryLabel: string;
}

export const EXPLORER_SEED_SIZE = 48;

const byName = (a: { name: string }, b: { name: string }) =>
  a.name < b.name ? -1 : a.name > b.name ? 1 : 0;

/** First families in catalog order (the generator uses the same name ordering). */
export function getExplorerSeed(): ExplorerSeedFamily[] {
  return [...ENRICHED_ICONS]
    .sort(byName)
    .slice(0, EXPLORER_SEED_SIZE)
    .map((icon) => ({ name: icon.name, categoryLabel: icon.categoryLabel }));
}

function readBuiltManifest(): CatalogManifest | null {
  const file = path.join(process.cwd(), "public", CATALOG_MANIFEST_PATH);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8")) as CatalogManifest;
}

/** Emits `<link rel="preload">` for the manifest and block 0 (metadata + default style). */
export function preloadExplorerCatalog(): void {
  const manifest = readBuiltManifest();
  const options = { as: "fetch", crossOrigin: "anonymous" } as const;
  preload(CATALOG_MANIFEST_PATH, options);
  const first = manifest?.blocks[0];
  if (first) {
    preload(`${CATALOG_SHARD_PATH}/${metaShardFile(0, first[2])}`, options);
    preload(`${CATALOG_SHARD_PATH}/${pathShardFile("regular", 0, first[2])}`, options);
  }
}
