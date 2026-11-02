import { SITE_ICON_SVG, type SiteIconKey } from "../generated/site-icons";

/**
 * Lightweight icon for client-side site chrome (header, explorer search). Backed by a generated
 * subset of the catalog, so client components never bundle the full SVG catalog.
 */
export function SiteIcon({
  icon,
  size = 24,
  className
}: {
  readonly icon: SiteIconKey;
  readonly size?: number;
  readonly className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: SITE_ICON_SVG[icon] }}
    />
  );
}
