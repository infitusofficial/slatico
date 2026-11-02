/**
 * Generates the chunked, content-hashed Icon Explorer catalog for slatico.dev.
 *
 *   tsx scripts/generate-website-catalog.ts                 → apps/website/public/catalog + src/generated/*
 *   tsx scripts/generate-website-catalog.ts --synthetic 100000 --out <dir>
 *       → scale measurement only: replicates the real families under suffixed names into <dir>
 *
 * Output is a pure function of the icon sources and the website taxonomy (no timestamps, sorted
 * keys, content hashes), so repeated runs are byte-identical.
 */
import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ICON_CATALOG, SLATICO_STYLES, type SlaticoStyle } from "../packages/core/src/index.js";
import { SVG_ASSETS } from "../packages/svg/src/generated/svg-data.js";
import { ENRICHED_ICONS } from "../apps/website/src/lib/catalog.js";
import {
  CATALOG_FORMAT_VERSION,
  deltaEncode,
  gramBucket,
  metaShardFile,
  pathShardFile,
  textGrams,
  type CatalogManifest,
  type CatalogMetaRow
} from "../apps/website/src/lib/catalog-format.js";
import {
  buildSearchableText,
  getCategoryLabel,
  type IconFamilyCategoryId
} from "../apps/website/src/data/icon-taxonomy.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WEBSITE_DIR = path.join(ROOT_DIR, "apps", "website");

const BLOCK_SIZE = 128;
const CATEGORY_PAGE_SIZE = 4096;
const GRAM_LENGTH = 3;

/** Icons used by client-side site chrome (header search, explorer search, empty state). */
const SITE_ICON_VARIANTS: ReadonlyArray<readonly [string, SlaticoStyle]> = [
  ["magnifying-glass", "regular"],
  ["magnifying-glass", "duotone"]
];

interface Family {
  readonly name: string;
  readonly pascalName: string;
  readonly categoryId: IconFamilyCategoryId;
  readonly keywords: readonly string[];
  readonly summary: string;
  readonly svg: Readonly<Record<SlaticoStyle, string>>;
}

function parseArgs(argv: readonly string[]): { synthetic: number; outDir: string | null } {
  let synthetic = 0;
  let outDir: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--synthetic") synthetic = Number(argv[++i]);
    else if (argv[i] === "--out") outDir = path.resolve(argv[++i]!);
  }
  if (synthetic && !outDir) {
    throw new Error("--synthetic requires --out <dir> (never write synthetic data into the website).");
  }
  return { synthetic, outDir };
}

function realFamilies(): Family[] {
  return ENRICHED_ICONS.map((icon) => {
    const variants = SVG_ASSETS[icon.name];
    const svg = Object.fromEntries(
      SLATICO_STYLES.map((style) => {
        const asset = variants[style];
        if (asset.viewBox !== ICON_CATALOG.masterViewBox) {
          throw new Error(`${icon.name} (${style}) uses viewBox ${asset.viewBox}; expected ${ICON_CATALOG.masterViewBox}.`);
        }
        return [style, asset.innerSvg];
      })
    ) as Record<SlaticoStyle, string>;
    return {
      name: icon.name,
      pascalName: icon.pascalName,
      categoryId: icon.categoryId,
      keywords: icon.keywords,
      summary: icon.summary,
      svg
    };
  });
}

function syntheticFamilies(base: readonly Family[], total: number): Family[] {
  const out: Family[] = [];
  for (let i = 0; i < total; i++) {
    const src = base[i % base.length]!;
    const suffix = `s${String(i).padStart(6, "0")}`;
    out.push({
      ...src,
      name: `${src.name}-${suffix}`,
      pascalName: `${src.pascalName}S${String(i).padStart(6, "0")}`
    });
  }
  return out;
}

const byName = (a: { name: string }, b: { name: string }) =>
  a.name < b.name ? -1 : a.name > b.name ? 1 : 0;

function hashOf(...parts: readonly string[]): string {
  const h = createHash("sha256");
  for (const p of parts) h.update(p).update("\u0000");
  return h.digest("hex").slice(0, 10);
}

function pow2Ceil(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function generate(families: readonly Family[], catalogDir: string): { files: number; bytes: number } {
  rmSync(catalogDir, { recursive: true, force: true });
  const shardDir = path.join(catalogDir, "s");
  mkdirSync(shardDir, { recursive: true });
  let files = 0;
  let bytes = 0;
  const write = (file: string, content: string) => {
    writeFileSync(path.join(shardDir, file), content);
    files++;
    bytes += Buffer.byteLength(content);
  };

  // Blocks: metadata + one path shard per style, all sharing one content hash.
  const blocks: Array<[string, number, string]> = [];
  for (let start = 0, block = 0; start < families.length; start += BLOCK_SIZE, block++) {
    const slice = families.slice(start, start + BLOCK_SIZE);
    const meta = JSON.stringify({
      start,
      families: slice.map(
        (f): CatalogMetaRow => [f.name, f.pascalName, f.categoryId, f.keywords, f.summary]
      )
    });
    const paths = SLATICO_STYLES.map((style) =>
      JSON.stringify({ start, style, svg: slice.map((f) => f.svg[style]) })
    );
    const hash = hashOf(meta, ...paths);
    write(metaShardFile(block, hash), meta);
    SLATICO_STYLES.forEach((style, i) => write(pathShardFile(style, block, hash), paths[i]!));
    blocks.push([slice[0]!.name, slice.length, hash]);
  }

  // Category id lists, paged.
  const byCategory = new Map<IconFamilyCategoryId, number[]>();
  families.forEach((f, id) => {
    const list = byCategory.get(f.categoryId) ?? [];
    list.push(id);
    byCategory.set(f.categoryId, list);
  });
  const categories: Record<string, { count: number; pages: string[] }> = {};
  for (const categoryId of [...byCategory.keys()].sort()) {
    const ids = byCategory.get(categoryId)!;
    const pages: string[] = [];
    for (let p = 0; p * CATEGORY_PAGE_SIZE < ids.length; p++) {
      const content = JSON.stringify({
        ids: deltaEncode(ids.slice(p * CATEGORY_PAGE_SIZE, (p + 1) * CATEGORY_PAGE_SIZE))
      });
      const file = `c-${categoryId}-${String(p).padStart(4, "0")}-${hashOf(content)}.json`;
      write(file, content);
      pages.push(file);
    }
    categories[categoryId] = { count: ids.length, pages };
  }

  // Trigram search index over each family's searchable text, bucketed by FNV-1a.
  const buckets = Math.min(2048, Math.max(16, pow2Ceil(Math.ceil(families.length / 64))));
  const bucketGrams: Array<Map<string, number[]>> = Array.from({ length: buckets }, () => new Map());
  families.forEach((f, id) => {
    const text = buildSearchableText({
      name: f.name,
      pascalName: f.pascalName,
      categoryLabel: getCategoryLabel(f.categoryId),
      keywords: f.keywords
    });
    for (const gram of textGrams(text, GRAM_LENGTH)) {
      const map = bucketGrams[gramBucket(gram, buckets)]!;
      const list = map.get(gram);
      if (list) list.push(id);
      else map.set(gram, [id]);
    }
  });
  const searchFiles: Record<string, string> = {};
  bucketGrams.forEach((map, bucket) => {
    if (map.size === 0) return;
    const grams = Object.fromEntries(
      [...map.keys()].sort().map((gram) => [gram, deltaEncode(map.get(gram)!)])
    );
    const content = JSON.stringify({ grams });
    const file = `q-${String(bucket).padStart(4, "0")}-${hashOf(content)}.json`;
    write(file, content);
    searchFiles[String(bucket)] = file;
  });

  const manifest: CatalogManifest = {
    formatVersion: CATALOG_FORMAT_VERSION,
    catalogVersion: ICON_CATALOG.version,
    totalFamilies: families.length,
    styles: [...SLATICO_STYLES],
    viewBox: ICON_CATALOG.masterViewBox,
    blockSize: BLOCK_SIZE,
    blocks,
    categoryPageSize: CATEGORY_PAGE_SIZE,
    categories,
    search: { gramLength: GRAM_LENGTH, buckets, files: searchFiles }
  };
  const manifestJson = `${JSON.stringify(manifest)}\n`;
  writeFileSync(path.join(catalogDir, "manifest.json"), manifestJson);
  files++;
  bytes += Buffer.byteLength(manifestJson);
  return { files, bytes };
}

function writeGeneratedModules(families: readonly Family[]): void {
  const generatedDir = path.join(WEBSITE_DIR, "src", "generated");
  mkdirSync(generatedDir, { recursive: true });
  const header =
    "// AUTO-GENERATED by scripts/generate-website-catalog.ts — DO NOT EDIT MANUALLY\n";

  const summary = {
    version: ICON_CATALOG.version,
    totalFamilies: families.length,
    totalVariants: families.length * SLATICO_STYLES.length,
    styleCount: SLATICO_STYLES.length,
    masterViewBox: ICON_CATALOG.masterViewBox
  };
  writeFileSync(
    path.join(generatedDir, "catalog-summary.ts"),
    `${header}\n/** Catalog totals for page copy; importing this never loads icon data. */\nexport const CATALOG_SUMMARY = ${JSON.stringify(summary, null, 2)} as const;\n`
  );

  const siteIcons = SITE_ICON_VARIANTS.map(([name, style]) => {
    const family = families.find((f) => f.name === name);
    if (!family) throw new Error(`Site icon ${name} is not in the catalog.`);
    return [`${name}:${style}`, family.svg[style]] as const;
  });
  writeFileSync(
    path.join(generatedDir, "site-icons.ts"),
    `${header}\n/** The few variants used by client-side site chrome, so it never imports the full catalog. */\nexport const SITE_ICON_SVG = {\n${siteIcons
      .map(([key, svg]) => `  ${JSON.stringify(key)}: ${JSON.stringify(svg)}`)
      .join(",\n")}\n} as const;\n\nexport type SiteIconKey = keyof typeof SITE_ICON_SVG;\n`
  );
}

const args = parseArgs(process.argv.slice(2));
const started = performance.now();
const base = realFamilies().sort(byName);
const families = args.synthetic ? syntheticFamilies(base, args.synthetic).sort(byName) : base;
const catalogDir = args.outDir ?? path.join(WEBSITE_DIR, "public", "catalog");
const { files, bytes } = generate(families, catalogDir);
if (!args.synthetic) writeGeneratedModules(families);
console.log(
  `[website catalog] ${families.length} families × ${SLATICO_STYLES.length} styles → ${files} files, ${(bytes / 1024 / 1024).toFixed(2)} MB in ${((performance.now() - started) / 1000).toFixed(2)}s → ${path.relative(ROOT_DIR, catalogDir)}`
);
