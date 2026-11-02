import type { SlaticoStyle } from "@slatico/core";
import type { IconFamilyCategoryId } from "../data/icon-taxonomy";

/**
 * On-disk format of the chunked Icon Explorer catalog written by
 * `scripts/generate-website-catalog.ts` into `apps/website/public/catalog/`.
 *
 * - `manifest.json` (revalidated on every load) lists the shards. It grows with the number of
 *   blocks (~40 bytes per 128 families), not with the number of variants.
 * - Everything under `s/` is content-hashed and immutable.
 *
 * Families are sorted by name and grouped into fixed-size blocks; a family's index in that order
 * is its id everywhere (grid position, category lists, search postings).
 */
export const CATALOG_FORMAT_VERSION = 1;
export const CATALOG_BASE_PATH = "/catalog";
export const CATALOG_MANIFEST_PATH = `${CATALOG_BASE_PATH}/manifest.json`;
export const CATALOG_SHARD_PATH = `${CATALOG_BASE_PATH}/s`;

/** [first family name in the block, family count, content hash shared by all of the block's files] */
export type CatalogBlockEntry = readonly [first: string, count: number, hash: string];

export interface CatalogManifest {
  readonly formatVersion: typeof CATALOG_FORMAT_VERSION;
  readonly catalogVersion: string;
  readonly totalFamilies: number;
  readonly styles: readonly SlaticoStyle[];
  readonly viewBox: string;
  readonly blockSize: number;
  readonly blocks: readonly CatalogBlockEntry[];
  readonly categoryPageSize: number;
  /** Per category: total families and the hashed file name of each page of family ids. */
  readonly categories: Readonly<
    Partial<Record<IconFamilyCategoryId, { readonly count: number; readonly pages: readonly string[] }>>
  >;
  readonly search: {
    readonly gramLength: number;
    readonly buckets: number;
    /** bucket number → hashed file name (empty buckets are omitted) */
    readonly files: Readonly<Record<string, string>>;
  };
}

/** One family as stored in a metadata shard: [name, pascalName, categoryId, keywords, summary]. */
export type CatalogMetaRow = readonly [
  name: string,
  pascalName: string,
  categoryId: IconFamilyCategoryId,
  keywords: readonly string[],
  summary: string
];

export interface CatalogMetaShard {
  readonly start: number;
  readonly families: readonly CatalogMetaRow[];
}

export interface CatalogPathShard {
  readonly start: number;
  readonly style: SlaticoStyle;
  /** Inner SVG markup per family, aligned with the block's metadata order. */
  readonly svg: readonly string[];
}

export interface CatalogCategoryPage {
  /** Ascending family ids (delta-encoded: first value absolute, then differences). */
  readonly ids: readonly number[];
}

export interface CatalogSearchShard {
  /** gram → ascending family ids (delta-encoded). */
  readonly grams: Readonly<Record<string, readonly number[]>>;
}

export function metaShardFile(block: number, hash: string): string {
  return `m-${String(block).padStart(5, "0")}-${hash}.json`;
}

export function pathShardFile(style: SlaticoStyle, block: number, hash: string): string {
  return `p-${style}-${String(block).padStart(5, "0")}-${hash}.json`;
}

/** Character n-grams of `text` (the search index and query planner must agree on this). */
export function textGrams(text: string, gramLength: number): Set<string> {
  const grams = new Set<string>();
  for (let i = 0; i + gramLength <= text.length; i++) {
    grams.add(text.slice(i, i + gramLength));
  }
  return grams;
}

/** FNV-1a 32-bit hash used to assign grams to search buckets. */
export function gramBucket(gram: string, buckets: number): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < gram.length; i++) {
    hash ^= gram.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) % buckets;
}

export function deltaEncode(sortedIds: readonly number[]): number[] {
  return sortedIds.map((id, i) => (i === 0 ? id : id - sortedIds[i - 1]!));
}

export function deltaDecode(encoded: readonly number[]): number[] {
  const out: number[] = new Array(encoded.length);
  let acc = 0;
  for (let i = 0; i < encoded.length; i++) {
    acc = i === 0 ? encoded[0]! : acc + encoded[i]!;
    out[i] = acc;
  }
  return out;
}
