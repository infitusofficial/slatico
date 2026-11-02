import type { Metadata } from "next";
import { SITE_CONFIG } from "../../config/site";
import { iconsExplorerMetadata } from "../../config/metadata";
import { buildBreadcrumbJsonLd } from "../../lib/structured-data";
import { IconExplorer } from "../../components/explorer/icon-explorer";
import { getExplorerSeed, preloadExplorerCatalog } from "../../lib/catalog-seed";

export const metadata: Metadata = iconsExplorerMetadata;

/**
 * Also served (via the Cloudflare Pages rewrite `/icons/:slug /icons 200`) for every
 * `/icons/<slug>` deep link; the Explorer then opens that icon's drawer client-side. All drawer
 * states share this page's canonical URL, https://slatico.dev/icons.
 */
export default function IconsExplorerPage() {
  preloadExplorerCatalog();
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Icons", path: "/icons" }
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="font-mono text-xs font-semibold text-primary uppercase">
            Slatico Master Catalog
          </span>
          <h1 className="mt-1 text-3xl font-bold text-foreground sm:text-4xl">
            Explore All {SITE_CONFIG.metrics.totalFamilies} Icon Families ({SITE_CONFIG.metrics.totalVariants} Variants)
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
            Every icon is authored on a strict 24×24 optical grid across Thin, Light, Regular, Bold, Fill, Duotone, and Color styles. Customize colors and export standalone SVG, PNG, WebP, Vector PDF, or 11 platform code snippets.
          </p>
        </div>
      </div>

      <IconExplorer compactHeader routing="path" seed={getExplorerSeed()} />
    </div>
  );
}
