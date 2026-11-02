import type { Metadata } from "next";
import { SITE_CONFIG } from "../../config/site";
import { licenseMetadata } from "../../config/metadata";
import { buildBreadcrumbJsonLd } from "../../lib/structured-data";

export const metadata: Metadata = licenseMetadata;

const MIT_LICENSE_TEXT = `MIT License

Copyright (c) 2026 Infitus Creative Studio

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

export default function LicensePage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "License", path: "/license" }
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
            Open-Source Licensing
          </span>
          <h1 className="mt-1 text-3xl font-bold text-foreground sm:text-4xl">
            {SITE_CONFIG.license} License
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            All Slatico SVG artwork, generated platform packages, and compiler tooling are released under the permissive{" "}
            <strong>{SITE_CONFIG.license} License</strong> by{" "}
            <strong>{SITE_CONFIG.publisher.name}</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] squircle border border-border bg-surface-subtle p-5">
            <h2 className="text-sm font-bold text-foreground">
              Permitted Uses
            </h2>
            <ul className="mt-2.5 space-y-1.5 text-xs text-muted-foreground">
              <li>• Unlimited commercial and personal software applications</li>
              <li>• Web, mobile (iOS / Android), desktop, and SaaS products</li>
              <li>• Customization of colors, sizes, strokes, and vector formats</li>
              <li>• Bundling inside client projects and open-source packages</li>
            </ul>
          </div>
          <div className="rounded-[24px] squircle border border-border bg-surface-subtle p-5">
            <h2 className="text-sm font-bold text-foreground">
              Conditions
            </h2>
            <ul className="mt-2.5 space-y-1.5 text-xs text-muted-foreground">
              <li>• Include the copyright and MIT license notice in all copies or substantial portions of the software</li>
              <li>• Software and artwork are provided &quot;as is&quot; without warranty</li>
              <li>• Request (not a license term): please don&apos;t present derivative icon packs as officially endorsed by {SITE_CONFIG.publisher.name}</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-foreground uppercase">
            Full License Text
          </h2>
          <pre className="mt-3 max-w-full overflow-x-auto rounded-[24px] squircle border border-code-border bg-code-bg p-5 font-mono text-xs leading-relaxed text-code-fg">
            <code>{MIT_LICENSE_TEXT}</code>
          </pre>
        </div>
      </article>
    </div>
  );
}
