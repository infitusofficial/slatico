import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ENRICHED_ICONS,
  getEnrichedIconByName,
  SLATICO_STYLES
} from "../../../lib/catalog";
import { buildIconDetailMetadata } from "../../../config/metadata";
import { buildBreadcrumbJsonLd } from "../../../lib/structured-data";
import { DynamicSlaticoIcon } from "../../../components/dynamic-slatico-icon";
import { StandaloneIconDetailClient } from "../../../components/explorer/standalone-icon-detail-client";

export const dynamicParams = false;

export function generateStaticParams(): Array<{ slug: string }> {
  return ENRICHED_ICONS.map((icon) => ({
    slug: icon.name
  }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const icon = getEnrichedIconByName(slug);
  if (!icon) {
    return {
      title: "Icon Not Found | Slatico"
    };
  }
  return buildIconDetailMetadata({
    name: icon.name,
    pascalName: icon.pascalName,
    categoryLabel: icon.categoryLabel,
    keywords: icon.keywords
  });
}

export default async function IconDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const icon = getEnrichedIconByName(slug);

  if (!icon) {
    notFound();
  }

  const relatedIcons = ENRICHED_ICONS.filter(
    (item) => item.categoryId === icon.categoryId && item.name !== icon.name
  ).slice(0, 6);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Icons", path: "/icons" },
    { name: icon.pascalName, path: `/icons/${icon.name}` }
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span>/</span>
        <Link href="/icons" className="hover:text-primary">
          Icons
        </Link>
        <span>/</span>
        <span className="font-mono font-semibold text-foreground">
          {icon.name}
        </span>
      </nav>

      {/* Page Heading */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="font-mono text-xs font-semibold text-primary uppercase">
            {icon.categoryLabel} · {SLATICO_STYLES.length} Styles
          </span>
          <h1 className="mt-1 text-3xl font-bold text-foreground sm:text-4xl">
            {icon.pascalName} Icon (<code className="font-mono text-2xl sm:text-3xl">{icon.name}</code>)
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {icon.summary}
          </p>
        </div>
        <Link
          href="/icons"
          className="inline-flex items-center gap-1.5 rounded-[20px] squircle border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted"
        >
          <span>← Back to all icons</span>
        </Link>
      </div>

      {/* Interactive Customizer, Export & 11-Platform Code Panel */}
      <StandaloneIconDetailClient icon={icon} />

      {/* Related Icons in Same Category */}
      {relatedIcons.length > 0 && (
        <section aria-labelledby="related-icons-heading" className="mt-12">
          <h2
            id="related-icons-heading"
            className="text-lg font-bold text-foreground"
          >
            Related Icons in {icon.categoryLabel}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {relatedIcons.map((rel) => (
              <Link
                key={rel.name}
                href={`/icons/${rel.name}`}
                className="flex min-w-0 flex-col items-center justify-center rounded-[24px] squircle border border-border bg-surface p-4 transition-colors hover:border-primary/60 hover:bg-surface-elevated"
              >
                <DynamicSlaticoIcon
                  name={rel.name}
                  style="regular"
                  size={28}
                  idScope={`related-${rel.name}`}
                />
                <span className="mt-2 font-mono text-xs font-medium text-foreground">
                  {rel.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
