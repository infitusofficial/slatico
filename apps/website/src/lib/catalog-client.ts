import type { SlaticoStyle } from "@slatico/core";
import {
  buildSearchableText,
  getCategoryLabel,
  matchesIconQuery,
  parseIconQuery,
  type IconCategoryId,
  type IconFamilyCategoryId,
  type ParsedIconQuery
} from "../data/icon-taxonomy";
import {
  CATALOG_FORMAT_VERSION,
  CATALOG_MANIFEST_PATH,
  CATALOG_SHARD_PATH,
  deltaDecode,
  gramBucket,
  metaShardFile,
  pathShardFile,
  textGrams,
  type CatalogCategoryPage,
  type CatalogManifest,
  type CatalogMetaShard,
  type CatalogPathShard,
  type CatalogSearchShard
} from "./catalog-format";
import type { IconVariantAsset } from "./icon-asset";

/**
 * Browser access to the chunked Icon Explorer catalog. Only the manifest plus a bounded number of
 * shards are ever held in memory, so the explorer scales to hundreds of thousands of families.
 */

export interface CatalogFamily {
  readonly index: number;
  readonly name: string;
  readonly pascalName: string;
  readonly categoryId: IconFamilyCategoryId;
  readonly categoryLabel: string;
  readonly keywords: readonly string[];
  readonly summary: string;
  readonly searchableText: string;
}

interface ParsedMetaShard {
  readonly start: number;
  readonly families: readonly CatalogFamily[];
}

/** Maximum parsed shards kept in memory (metadata + path shards of every style combined). */
const SHARD_CACHE_LIMIT = 96;
const FETCH_CONCURRENCY = 6;

type FetchJson = (url: string, init?: { readonly fresh?: boolean }) => Promise<unknown>;

export class CatalogRequestError extends Error {
  constructor(
    readonly status: number,
    readonly url: string
  ) {
    super(`Catalog request failed (${status}): ${url}`);
  }
}

const defaultFetchJson: FetchJson = async (url, init) => {
  const response = await fetch(url, {
    credentials: "same-origin",
    cache: init?.fresh ? "no-cache" : "default"
  });
  if (!response.ok) throw new CatalogRequestError(response.status, url);
  return response.json();
};

/** Same catalog build? (Shard names are content hashes, so the manifest identifies the build.) */
function sameCatalog(a: CatalogManifest, b: CatalogManifest): boolean {
  return JSON.stringify(a.blocks) === JSON.stringify(b.blocks) && JSON.stringify(a.search) === JSON.stringify(b.search);
}

export class CatalogClient {
  private manifestPromise: Promise<CatalogManifest> | null = null;
  private manifestValue: CatalogManifest | null = null;
  /** Insertion-ordered map used as an LRU cache of parsed shards. */
  private readonly shards = new Map<string, unknown>();
  private readonly inflight = new Map<string, Promise<unknown>>();

  constructor(
    private readonly fetchJson: FetchJson = defaultFetchJson,
    /** Called when a newer catalog was deployed while this page was open (default: reload). */
    private readonly onStaleCatalog: () => void = () => {
      if (typeof window !== "undefined") window.location.reload();
    }
  ) {}
  private staleCheck: Promise<void> | null = null;

  get manifest(): CatalogManifest | null {
    return this.manifestValue;
  }

  /** Number of parsed shards currently held (exposed for QA / memory checks). */
  get cachedShardCount(): number {
    return this.shards.size;
  }

  loadManifest(): Promise<CatalogManifest> {
    if (!this.manifestPromise) {
      this.manifestPromise = this.fetchJson(CATALOG_MANIFEST_PATH).then((raw) => {
        const manifest = raw as CatalogManifest;
        if (manifest.formatVersion !== CATALOG_FORMAT_VERSION) {
          throw new Error(`Unsupported catalog format ${String(manifest.formatVersion)}`);
        }
        this.manifestValue = manifest;
        return manifest;
      });
      this.manifestPromise.catch(() => {
        this.manifestPromise = null;
      });
    }
    return this.manifestPromise;
  }

  private peekShard<T>(file: string): T | undefined {
    const value = this.shards.get(file);
    if (value !== undefined) {
      this.shards.delete(file);
      this.shards.set(file, value);
    }
    return value as T | undefined;
  }

  private loadShard<T>(file: string, parse: (raw: unknown) => T): Promise<T> {
    const cached = this.peekShard<T>(file);
    if (cached !== undefined) return Promise.resolve(cached);
    const pending = this.inflight.get(file);
    if (pending) return pending as Promise<T>;
    const request = this.fetchJson(`${CATALOG_SHARD_PATH}/${file}`)
      .then((raw) => {
        const parsed = parse(raw);
        this.shards.set(file, parsed);
        while (this.shards.size > SHARD_CACHE_LIMIT) {
          this.shards.delete(this.shards.keys().next().value as string);
        }
        return parsed;
      })
      .catch(async (error: unknown) => {
        if (error instanceof CatalogRequestError && error.status === 404) await this.checkForNewCatalog();
        throw error;
      })
      .finally(() => this.inflight.delete(file));
    this.inflight.set(file, request);
    return request;
  }

  /**
   * A shard 404 normally means a deploy replaced the catalog while this tab was open: family
   * indices and shard names may all have changed, so the in-memory state is unusable.
   */
  private checkForNewCatalog(): Promise<void> {
    const current = this.manifestValue;
    if (!current) return Promise.resolve();
    this.staleCheck ??= Promise.resolve(this.fetchJson(CATALOG_MANIFEST_PATH, { fresh: true }))
      .then((raw) => {
        if (!sameCatalog(current, raw as CatalogManifest)) this.onStaleCatalog();
      })
      .catch(() => undefined)
      .finally(() => {
        this.staleCheck = null;
      });
    return this.staleCheck;
  }

  blockOf(index: number): number {
    return Math.floor(index / this.requireManifest().blockSize);
  }

  private requireManifest(): CatalogManifest {
    if (!this.manifestValue) throw new Error("Catalog manifest not loaded yet.");
    return this.manifestValue;
  }

  private metaFile(block: number): string {
    const entry = this.requireManifest().blocks[block];
    if (!entry) throw new Error(`Catalog block ${block} out of range.`);
    return metaShardFile(block, entry[2]);
  }

  private pathFile(style: SlaticoStyle, block: number): string {
    return pathShardFile(style, block, this.requireManifest().blocks[block]![2]);
  }

  async loadMetaBlock(block: number): Promise<ParsedMetaShard> {
    await this.loadManifest();
    return this.loadShard(this.metaFile(block), (raw) => {
      const shard = raw as CatalogMetaShard;
      return {
        start: shard.start,
        families: shard.families.map(([name, pascalName, categoryId, keywords, summary], i) => {
          const categoryLabel = getCategoryLabel(categoryId);
          return {
            index: shard.start + i,
            name,
            pascalName,
            categoryId,
            categoryLabel,
            keywords,
            summary,
            searchableText: buildSearchableText({ name, pascalName, categoryLabel, keywords })
          };
        })
      };
    });
  }

  peekFamily(index: number): CatalogFamily | undefined {
    if (!this.manifestValue) return undefined;
    const block = this.blockOf(index);
    const shard = this.peekShard<ParsedMetaShard>(this.metaFile(block));
    return shard?.families[index - shard.start];
  }

  async getFamily(index: number): Promise<CatalogFamily> {
    await this.loadManifest();
    const shard = await this.loadMetaBlock(this.blockOf(index));
    const family = shard.families[index - shard.start];
    if (!family) throw new Error(`Catalog family ${index} missing.`);
    return family;
  }

  peekVariant(index: number, style: SlaticoStyle): IconVariantAsset | undefined {
    if (!this.manifestValue) return undefined;
    const block = this.blockOf(index);
    const paths = this.peekShard<CatalogPathShard>(this.pathFile(style, block));
    const family = this.peekFamily(index);
    if (!paths || !family) return undefined;
    return {
      name: family.name,
      style,
      viewBox: this.manifestValue.viewBox,
      innerSvg: paths.svg[index - paths.start]!
    };
  }

  async getVariant(index: number, style: SlaticoStyle): Promise<IconVariantAsset> {
    const manifest = await this.loadManifest();
    const block = this.blockOf(index);
    const [family, paths] = await Promise.all([
      this.getFamily(index),
      this.loadShard(this.pathFile(style, block), (raw) => raw as CatalogPathShard)
    ]);
    return {
      name: family.name,
      style,
      viewBox: manifest.viewBox,
      innerSvg: paths.svg[index - paths.start]!
    };
  }

  /** Exact lookup of an already-validated slug via binary search over block boundaries. */
  async findFamilyByName(name: string): Promise<CatalogFamily | null> {
    const manifest = await this.loadManifest();
    const { blocks } = manifest;
    let lo = 0;
    let hi = blocks.length - 1;
    let block = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (blocks[mid]![0] <= name) {
        block = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    if (block < 0) return null;
    const shard = await this.loadMetaBlock(block);
    return shard.families.find((family) => family.name === name) ?? null;
  }

  async loadCategoryPage(categoryId: IconFamilyCategoryId, page: number): Promise<number[] | null> {
    const manifest = await this.loadManifest();
    const file = manifest.categories[categoryId]?.pages[page];
    if (!file) return null;
    return this.loadShard(file, (raw) => deltaDecode((raw as CatalogCategoryPage).ids));
  }

  /** Sorted family ids whose searchable text contains `gram`. */
  async gramPostings(gram: string): Promise<number[]> {
    const manifest = await this.loadManifest();
    const bucket = gramBucket(gram, manifest.search.buckets);
    const file = manifest.search.files[String(bucket)];
    if (!file) return [];
    const shard = await this.loadShard(file, (raw) => raw as CatalogSearchShard);
    const encoded = shard.grams[gram];
    return encoded ? deltaDecode(encoded) : [];
  }

  /** Starts a progressive result stream for a query + category filter. */
  createCursor(params: { query: string; category: IconCategoryId }): ResultCursor {
    return new ResultCursor(this, parseIconQuery(params.query), params.category);
  }
}

function intersectSorted(a: readonly number[], b: readonly number[]): number[] {
  const out: number[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i]! === b[j]!) {
      out.push(a[i]!);
      i++;
      j++;
    } else if (a[i]! < b[j]!) i++;
    else j++;
  }
  return out;
}

function unionSorted(lists: readonly (readonly number[])[]): number[] {
  return [...new Set(lists.flat())].sort((x, y) => x - y);
}

async function mapLimit<T, R>(items: readonly T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]!);
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * Streams matching family ids in catalog order. Search uses the trigram index only to narrow
 * candidates; every candidate is then verified with `matchesIconQuery`, so results are identical
 * to the original in-memory filter. Queries with no indexable token (all tokens shorter than the
 * gram length) fall back to a progressive scan.
 */
export class ResultCursor {
  private candidates: number[] | "all" | null = null;
  private position = 0;
  private categoryPage = 0;
  private categoryBuffer: number[] = [];
  private matched = 0;
  private finished = false;

  constructor(
    private readonly client: CatalogClient,
    private readonly query: ParsedIconQuery,
    private readonly category: IconCategoryId
  ) {}

  get done(): boolean {
    return this.finished;
  }

  /** Total number of matches, when known without scanning (or once the scan has finished). */
  get knownTotal(): number | null {
    const manifest = this.client.manifest;
    if (this.finished) return this.matched;
    if (!manifest || this.query.raw) return null;
    if (this.category === "all") return manifest.totalFamilies;
    return manifest.categories[this.category]?.count ?? 0;
  }

  private async planCandidates(): Promise<number[] | "all"> {
    const manifest = await this.client.loadManifest();
    const gramLength = manifest.search.gramLength;
    const { raw, kebab, tokens } = this.query;
    if (!raw) return "all";

    const postingsFor = async (text: string): Promise<number[] | "all"> => {
      if (text.length < gramLength) return "all";
      let result: number[] | null = null;
      for (const gram of textGrams(text, gramLength)) {
        const list = await this.client.gramPostings(gram);
        result = result ? intersectSorted(result, list) : list;
        if (result.length === 0) break;
      }
      return result ?? "all";
    };

    const phrase = await postingsFor(raw);
    const nameMatch = await postingsFor(kebab);
    let everyToken: number[] | "all" = "all";
    for (const token of tokens) {
      const list = await postingsFor(token);
      if (list === "all") continue;
      everyToken = everyToken === "all" ? list : intersectSorted(everyToken, list);
    }
    if (phrase === "all" || nameMatch === "all" || everyToken === "all") return "all";
    return unionSorted([phrase, nameMatch, everyToken]);
  }

  /** Next ids to consider (unverified), in ascending order; empty when exhausted. */
  private async nextCandidateChunk(): Promise<number[]> {
    const manifest = await this.client.loadManifest();
    const chunk = manifest.blockSize * 2;
    if (this.candidates === "all") {
      if (this.category !== "all") {
        if (this.categoryBuffer.length === 0) {
          const page = await this.client.loadCategoryPage(this.category, this.categoryPage++);
          if (!page) return [];
          this.categoryBuffer = page.slice(); // never mutate the cached shard
        }
        return this.categoryBuffer.splice(0, chunk);
      }
      const start = this.position;
      const end = Math.min(manifest.totalFamilies, start + chunk);
      this.position = end;
      return Array.from({ length: end - start }, (_, i) => start + i);
    }
    const list = this.candidates!;
    const slice = list.slice(this.position, this.position + chunk);
    this.position += slice.length;
    return slice;
  }

  async next(count: number): Promise<number[]> {
    if (this.finished) return [];
    if (this.candidates === null) this.candidates = await this.planCandidates();
    const out: number[] = [];
    const verifyText = Boolean(this.query.raw);
    const verifyCategory = this.category !== "all" && this.candidates !== "all";

    while (out.length < count) {
      const chunk = await this.nextCandidateChunk();
      if (chunk.length === 0) {
        this.finished = true;
        break;
      }
      if (verifyText || verifyCategory) {
        const blocks = [...new Set(chunk.map((id) => this.client.blockOf(id)))];
        await mapLimit(blocks, FETCH_CONCURRENCY, (block) => this.client.loadMetaBlock(block));
      }
      for (const id of chunk) {
        if (verifyText || verifyCategory) {
          const family = this.client.peekFamily(id) ?? (await this.client.getFamily(id));
          if (verifyCategory && family.categoryId !== this.category) continue;
          if (verifyText && !matchesIconQuery(family, this.query)) continue;
        }
        out.push(id);
      }
    }
    // Ids beyond `count` stay valid results; hand them out now rather than re-scanning later.
    this.matched += out.length;
    return out;
  }
}

let sharedClient: CatalogClient | null = null;

export function getCatalogClient(): CatalogClient {
  if (!sharedClient) sharedClient = new CatalogClient();
  return sharedClient;
}
