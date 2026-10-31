import { SITE_CONFIG } from "../config/site";

export interface BrandLogoProps {
  readonly className?: string;
}

/**
 * Renders the official Slatico brand logo, automatically switching between
 * `/brand/logo.svg` (Light mode) and `/brand/logo-dark.svg` (Dark mode),
 * including resolved System theme preference, with zero hydration mismatch
 * or theme flash.
 */
export function BrandLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <span className="inline-flex items-center">
      <img
        src={SITE_CONFIG.assets.logo}
        alt={`${SITE_CONFIG.brandName} logo`}
        width={132}
        height={30}
        className={`block select-none dark:hidden ${className}`}
      />
      <img
        src={SITE_CONFIG.assets.logoDark}
        alt={`${SITE_CONFIG.brandName} logo`}
        width={132}
        height={30}
        className={`hidden select-none dark:block ${className}`}
      />
    </span>
  );
}
