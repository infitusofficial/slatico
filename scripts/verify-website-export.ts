/**
 * Post-build guardrails for the static slatico.dev export (`apps/website/out`).
 *
 * 1. Nothing but Next.js `__next*` route data may live under out/icons/: Cloudflare Pages applies
 *    `/icons/:slug /icons 200` before static files, so any other file there would be shadowed.
 * 2. No per-icon HTML pages are emitted.
 * 3. The catalog manifest and every shard it references exist (and nothing unreferenced ships).
 * 4. No JavaScript chunk embeds icon artwork beyond the small site-chrome subset.
 * Prints file counts and sizes for the build report.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { SLATICO_STYLES } from "../packages/core/src/index.js";
import { SVG_ASSETS } from "../packages/svg/src/generated/svg-data.js";
import { SITE_ICON_SVG } from "../apps/website/src/generated/site-icons.js";
import {
  metaShardFile,
  pathShardFile,
  type CatalogManifest
} from "../apps/website/src/lib/catalog-format.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.resolve(process.argv[2] ?? path.join(ROOT_DIR, "apps", "website", "out"));

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const failures: string[] = [];
if (!existsSync(OUT_DIR)) {
  console.error(`[verify export] ${OUT_DIR} does not exist — run the website build first.`);
  process.exit(1);
}
const files = walk(OUT_DIR);
const rel = (file: string) => path.relative(OUT_DIR, file).split(path.sep).join("/");

// 1 + 2. /icons/ may contain only Next.js route data.
const iconsDir = path.join(OUT_DIR, "icons");
if (existsSync(iconsDir)) {
  for (const entry of readdirSync(iconsDir)) {
    if (!entry.startsWith("__next")) {
      failures.push(`out/icons/${entry} would be shadowed by the /icons/:slug rewrite (only __next* allowed).`);
    }
  }
}
const htmlFiles = files.filter((f) => f.endsWith(".html"));
const iconHtml = htmlFiles.filter((f) => rel(f).startsWith("icons/"));
if (iconHtml.length > 0) failures.push(`Per-icon HTML pages emitted: ${iconHtml.map(rel).join(", ")}`);

// 3. Catalog completeness.
const manifestPath = path.join(OUT_DIR, "catalog", "manifest.json");
let catalogFiles = 0;
if (!existsSync(manifestPath)) {
  failures.push("out/catalog/manifest.json is missing.");
} else {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as CatalogManifest;
  const expected = new Set<string>();
  manifest.blocks.forEach(([, , hash], block) => {
    expected.add(metaShardFile(block, hash));
    for (const style of SLATICO_STYLES) expected.add(pathShardFile(style, block, hash));
  });
  for (const category of Object.values(manifest.categories)) category?.pages.forEach((p) => expected.add(p));
  Object.values(manifest.search.files).forEach((f) => expected.add(f));
  const shardDir = path.join(OUT_DIR, "catalog", "s");
  const present = new Set(existsSync(shardDir) ? readdirSync(shardDir) : []);
  for (const file of expected) if (!present.has(file)) failures.push(`Catalog shard missing: ${file}`);
  for (const file of present) if (!expected.has(file)) failures.push(`Unreferenced catalog shard: ${file}`);
  catalogFiles = present.size + 1;
  const total = manifest.blocks.reduce((sum, [, count]) => sum + count, 0);
  if (total !== manifest.totalFamilies) failures.push(`Manifest blocks hold ${total} families, expected ${manifest.totalFamilies}.`);
}

// 4. Icon artwork in client JavaScript.
const allowed = new Set<string>(Object.values(SITE_ICON_SVG));
/**
 * The homepage platform demo registers the published `@slatico/web` definitions of exactly these
 * families (a fixed showcase of the SDK, independent of catalog size).
 */
const DEMO_FAMILIES = new Set(["bell", "shield-check", "wallet"]);
const allowedSources = Object.entries(SVG_ASSETS).flatMap(([name, variants]) =>
  Object.values(variants)
    .map((variant) => variant.innerSvg)
    .filter((inner) => allowed.has(inner) || DEMO_FAMILIES.has(name))
);
const jsFiles = files.filter((f) => rel(f).startsWith("_next/static/") && f.endsWith(".js"));
const jsSources = jsFiles.map((f) => readFileSync(f, "utf8"));
const leaked: string[] = [];
for (const [name, variants] of Object.entries(SVG_ASSETS)) {
  for (const style of SLATICO_STYLES) {
    const inner = variants[style as keyof typeof variants].innerSvg;
    if (allowed.has(inner) || DEMO_FAMILIES.has(name)) continue;
    const d = /\sd="([^"]{40,})"/.exec(inner)?.[1];
    // Path data shared verbatim with an allowed variant (e.g. shield inside shield-check) is
    // indistinguishable, so it is not counted.
    if (!d || allowedSources.some((svg) => svg.includes(d))) continue;
    if (jsSources.some((src) => src.includes(d))) leaked.push(`${name}:${style}`);
  }
}
if (leaked.length > 0) {
  failures.push(`${leaked.length} icon variants are bundled into client JavaScript (e.g. ${leaked.slice(0, 5).join(", ")}).`);
}

// Report.
const bytes = files.reduce((sum, f) => sum + statSync(f).size, 0);
const pageJs = (page: string) => {
  const html = readFileSync(path.join(OUT_DIR, page), "utf8");
  const srcs = [...new Set([...html.matchAll(/(\/_next\/static\/[^"']+\.js)/g)].map((m) => m[1]!))];
  let raw = 0;
  let gz = 0;
  for (const src of srcs) {
    const buf = readFileSync(path.join(OUT_DIR, src.slice(1)));
    raw += buf.length;
    gz += gzipSync(buf, { level: 9 }).length;
  }
  return { scripts: srcs.length, jsRawKB: +(raw / 1024).toFixed(1), jsGzipKB: +(gz / 1024).toFixed(1) };
};
console.log(
  JSON.stringify(
    {
      outDir: path.relative(ROOT_DIR, OUT_DIR),
      files: files.length,
      htmlPages: htmlFiles.length,
      catalogFiles,
      totalMB: +(bytes / 1024 / 1024).toFixed(2),
      bundledIconVariants: leaked.length,
      "/icons": pageJs("icons.html"),
      "/": pageJs("index.html"),
      "/docs": pageJs("docs.html")
    },
    null,
    2
  )
);
if (failures.length > 0) {
  console.error(`\n[verify export] FAILED:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("[verify export] OK");
