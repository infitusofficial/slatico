import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ICON_NAMES, SLATICO_STYLES } from "../packages/core/src/index.js";
import { getSvgAsset } from "../packages/svg/src/index.js";
import { CatalogClient, CatalogRequestError } from "../apps/website/src/lib/catalog-client";
import { ENRICHED_ICONS, filterCatalogIcons } from "../apps/website/src/lib/catalog";
import { ICON_CATEGORIES, type IconCategoryId } from "../apps/website/src/data/icon-taxonomy";
import { normalizeIconSlug, parseIconPathname } from "../apps/website/src/lib/icon-slug";

const ROOT = path.resolve(__dirname, "..");
const GENERATOR = path.join(ROOT, "scripts", "generate-website-catalog.ts");

function runGenerator(args: readonly string[]): void {
  execFileSync(process.execPath, ["--import", "tsx", GENERATOR, ...args], {
    cwd: ROOT,
    stdio: "pipe"
  });
}

function diskClient(catalogDir: string): CatalogClient {
  return new CatalogClient(async (url) => {
    const rel = url.replace(/^\/catalog\//, "");
    return JSON.parse(readFileSync(path.join(catalogDir, rel), "utf8"));
  });
}

async function collectAll(client: CatalogClient, query: string, category: IconCategoryId) {
  const cursor = client.createCursor({ query, category });
  const ids: number[] = [];
  while (!cursor.done) ids.push(...(await cursor.next(7)));
  const names = await Promise.all(ids.map(async (id) => (await client.getFamily(id)).name));
  return { names, total: cursor.knownTotal };
}

const QUERIES = [
  "",
  "arrow",
  "ar",
  "a",
  "ell",
  "notification",
  "lock open",
  "lock-open",
  "shield-check",
  "SHIELD",
  "  bell  ",
  "cloud check",
  "up-left",
  "security",
  "navigation & layout",
  "trash x",
  "zzzz",
  "!!!",
  "x"
];

describe("Icon Explorer chunked catalog", () => {
  let dirA = "";
  let dirB = "";
  let client: CatalogClient;

  beforeAll(() => {
    dirA = mkdtempSync(path.join(os.tmpdir(), "slatico-catalog-a-"));
    dirB = mkdtempSync(path.join(os.tmpdir(), "slatico-catalog-b-"));
    runGenerator(["--out", dirA]);
    runGenerator(["--out", dirB]);
    client = diskClient(dirA);
  }, 60_000);

  afterAll(() => {
    rmSync(dirA, { recursive: true, force: true });
    rmSync(dirB, { recursive: true, force: true });
  });

  it("is generated deterministically (byte-identical across runs)", () => {
    const list = (dir: string) => readdirSync(path.join(dir, "s")).sort();
    expect(list(dirA)).toEqual(list(dirB));
    for (const file of list(dirA)) {
      expect(readFileSync(path.join(dirA, "s", file), "utf8")).toBe(
        readFileSync(path.join(dirB, "s", file), "utf8")
      );
    }
    expect(readFileSync(path.join(dirA, "manifest.json"), "utf8")).toBe(
      readFileSync(path.join(dirB, "manifest.json"), "utf8")
    );
  });

  it("serves all 27 families × 7 styles with SVG data identical to @slatico/svg", async () => {
    const manifest = await client.loadManifest();
    expect(manifest.totalFamilies).toBe(27);
    expect(manifest.styles).toEqual([...SLATICO_STYLES]);
    let checked = 0;
    for (const name of ICON_NAMES) {
      const family = await client.findFamilyByName(name);
      expect(family?.name).toBe(name);
      for (const style of SLATICO_STYLES) {
        const asset = await client.getVariant(family!.index, style);
        const expected = getSvgAsset(name, style);
        expect(asset.innerSvg).toBe(expected.innerSvg);
        expect(asset.viewBox).toBe(expected.viewBox);
        checked++;
      }
    }
    expect(checked).toBe(189);
  });

  it("keeps family metadata identical to the original enrichment", async () => {
    for (const icon of ENRICHED_ICONS) {
      const family = await client.findFamilyByName(icon.name);
      expect(family).toMatchObject({
        name: icon.name,
        pascalName: icon.pascalName,
        categoryId: icon.categoryId,
        categoryLabel: icon.categoryLabel,
        keywords: icon.keywords,
        summary: icon.summary,
        searchableText: icon.searchableText
      });
    }
  });

  it("returns exactly the original search + category results, in order", async () => {
    for (const category of ICON_CATEGORIES.map((c) => c.id)) {
      for (const query of QUERIES) {
        const expected = filterCatalogIcons({ query, category }).map((i) => i.name);
        const { names, total } = await collectAll(client, query, category);
        expect(names, `query=${JSON.stringify(query)} category=${category}`).toEqual(expected);
        expect(total).toBe(expected.length);
      }
    }
  });

  it("detects a catalog replaced by a newer deploy (shard 404 + changed manifest)", async () => {
    let deployed = dirA;
    let staleSignals = 0;
    const live = new CatalogClient(
      async (url) => {
        const rel = url.replace(/^\/catalog\//, "");
        try {
          return JSON.parse(readFileSync(path.join(deployed, rel), "utf8"));
        } catch {
          throw new CatalogRequestError(404, url);
        }
      },
      () => staleSignals++
    );
    await live.loadManifest();
    const other = mkdtempSync(path.join(os.tmpdir(), "slatico-catalog-next-"));
    try {
      runGenerator(["--synthetic", "300", "--out", other]);
      deployed = other; // a new deploy lands while the tab is open
      await expect(live.getFamily(0)).rejects.toBeInstanceOf(CatalogRequestError);
      expect(staleSignals).toBe(1);
    } finally {
      rmSync(other, { recursive: true, force: true });
    }
  }, 60_000);

  it("rejects unknown names", async () => {
    expect(await client.findFamilyByName("not-a-real-icon")).toBeNull();
    expect(await client.findFamilyByName("aaa")).toBeNull();
    expect(await client.findFamilyByName("zzz")).toBeNull();
  });

  it("scales: a 10,000-family synthetic catalog streams correct search results", async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "slatico-catalog-10k-"));
    try {
      runGenerator(["--synthetic", "10000", "--out", dir]);
      const big = diskClient(dir);
      const manifest = await big.loadManifest();
      expect(manifest.totalFamilies).toBe(10_000);
      expect(manifest.blocks.length).toBe(Math.ceil(10_000 / manifest.blockSize));

      // Brute force over every metadata block vs. the indexed cursor.
      const everyone = [];
      for (let b = 0; b < manifest.blocks.length; b++) everyone.push(...(await big.loadMetaBlock(b)).families);
      expect(big.cachedShardCount).toBeLessThanOrEqual(96);
      const { matchesIconQuery, parseIconQuery } = await import("../apps/website/src/data/icon-taxonomy");
      for (const query of ["bell", "lock open", "s004", "wallet-s00999"]) {
        const expected = everyone.filter((f) => matchesIconQuery(f, parseIconQuery(query))).map((f) => f.name);
        const { names } = await collectAll(big, query, "all");
        expect(names, query).toEqual(expected);
      }
      const lookup = await big.findFamilyByName("wallet-s009999");
      expect(lookup).toBeNull();
      const hit = await big.findFamilyByName(everyone[7_777]!.name);
      expect(hit?.index).toBe(7_777);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 120_000);
});

describe("Icon Explorer deep-link slugs", () => {
  it("normalizes and validates slugs", () => {
    expect(normalizeIconSlug("arrow-up-left")).toBe("arrow-up-left");
    expect(normalizeIconSlug("ARROW-UP-LEFT")).toBe("arrow-up-left");
    expect(normalizeIconSlug("%20bell%20")).toBe("bell");
    expect(normalizeIconSlug("%E0%A4%A")).toBeNull();
    expect(normalizeIconSlug("%3Cscript%3E")).toBeNull();
    expect(normalizeIconSlug("bell--x")).toBeNull();
    expect(normalizeIconSlug("-bell")).toBeNull();
    expect(normalizeIconSlug("a".repeat(65))).toBeNull();
    expect(normalizeIconSlug("")).toBeNull();
  });

  it("parses Explorer pathnames", () => {
    expect(parseIconPathname("/icons")).toEqual({ kind: "none" });
    expect(parseIconPathname("/icons/")).toEqual({ kind: "none" });
    expect(parseIconPathname("/icons/bell")).toEqual({ kind: "valid", slug: "bell", normalizedFrom: null });
    expect(parseIconPathname("/icons/Bell")).toEqual({ kind: "valid", slug: "bell", normalizedFrom: "Bell" });
    expect(parseIconPathname("/icons/a/b")).toEqual({ kind: "invalid" });
    expect(parseIconPathname("/icons/%3Cimg%3E")).toEqual({ kind: "invalid" });
    expect(parseIconPathname("/")).toEqual({ kind: "none" });
  });
});
