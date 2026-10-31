import type { Metadata } from "next";
import { SITE_CONFIG } from "../../config/site";
import { contactMetadata } from "../../config/metadata";
import { buildBreadcrumbJsonLd } from "../../lib/structured-data";

export const metadata: Metadata = contactMetadata;

export default function ContactPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" }
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article className="space-y-8 rounded-[32px] squircle border border-border bg-surface p-6 sm:p-10">
        <div>
          <span className="font-mono text-xs font-semibold text-primary uppercase">
            Community &amp; Support
          </span>
          <h1 className="mt-1 text-3xl font-bold text-foreground sm:text-4xl">
            Connect with {SITE_CONFIG.publisher.name}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Slatico is developed in the open on GitHub. Whether you want to request a new icon family, report a platform rendering issue, or contribute to our code generators, use our official repository channels below.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <a
            href={SITE_CONFIG.links.githubIssues}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 flex-col justify-between rounded-[24px] squircle border border-border bg-surface-subtle p-6 transition-all hover:border-primary hover:bg-surface"
          >
            <div>
              <span className="font-mono text-xs font-semibold text-primary">
                GitHub Issues
              </span>
              <h2 className="mt-1.5 text-lg font-bold text-foreground">
                Request Icons &amp; Report Bugs
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Open an issue in <code className="font-mono">infitusofficial/slatico</code> to propose new Tier 2/3 icon families or report platform SDK bugs.
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold text-primary">
              Open GitHub Issues →
            </span>
          </a>

          <a
            href={SITE_CONFIG.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 flex-col justify-between rounded-[24px] squircle border border-border bg-surface-subtle p-6 transition-all hover:border-primary hover:bg-surface"
          >
            <div>
              <span className="font-mono text-xs font-semibold text-primary">
                Source Repository
              </span>
              <h2 className="mt-1.5 text-lg font-bold text-foreground">
                Slatico Open-Source Monorepo
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Inspect the master 24×24 SVG artwork, automated compiler scripts, and CI workflows across Node.js, Flutter, Android, and Swift.
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold text-primary">
              Visit github.com/infitusofficial/slatico →
            </span>
          </a>
        </div>

        <div className="rounded-[24px] squircle border border-border bg-surface-muted p-5 text-xs leading-relaxed text-muted-foreground">
          <strong className="font-semibold text-foreground">Publisher:</strong>{" "}
          <a
            href={SITE_CONFIG.publisher.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-4"
          >
            {SITE_CONFIG.publisher.name} ({SITE_CONFIG.publisher.url})
          </a>
        </div>
      </article>
    </div>
  );
}
