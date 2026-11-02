import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@slatico/font/slatico.css";
import "./globals.css";
import { SITE_CONFIG } from "../config/site";
import { homeMetadata } from "../config/metadata";
import {
  buildOrganizationJsonLd,
  buildSoftwareSourceCodeJsonLd,
  buildWebSiteJsonLd
} from "../lib/structured-data";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

const generalSans = localFont({
  src: [
    {
      path: "../assets/fonts/GeneralSans-Variable.woff2",
      style: "normal",
      weight: "200 700"
    },
    {
      path: "../assets/fonts/GeneralSans-VariableItalic.woff2",
      style: "italic",
      weight: "200 700"
    }
  ],
  variable: "--font-general-sans",
  display: "swap",
  preload: true
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#010520" }
  ]
};

// Site-wide defaults come from the homepage metadata, except its canonical URL and robots
// directives: every page sets its own, and inheriting them made the 404 page claim the homepage
// canonical and emit "index, follow" next to Next.js's automatic "noindex".
const {
  alternates: _homeAlternates,
  robots: _homeRobots,
  ...siteDefaultMetadata
} = homeMetadata;

export const metadata: Metadata = {
  ...siteDefaultMetadata,
  metadataBase: new URL(SITE_CONFIG.siteUrl),
  applicationName: SITE_CONFIG.brandName,
  authors: [{ name: SITE_CONFIG.publisher.name, url: SITE_CONFIG.publisher.url }],
  creator: SITE_CONFIG.publisher.name,
  publisher: SITE_CONFIG.publisher.name,
  manifest: SITE_CONFIG.assets.manifest,
  icons: {
    icon: [
      { url: SITE_CONFIG.assets.faviconIco, sizes: "any" },
      { url: SITE_CONFIG.assets.brandIcon, type: "image/svg+xml" },
      { url: SITE_CONFIG.assets.favicon32, sizes: "32x32", type: "image/png" },
      { url: SITE_CONFIG.assets.favicon16, sizes: "16x16", type: "image/png" }
    ],
    apple: [
      {
        url: SITE_CONFIG.assets.appleTouchIcon,
        sizes: "180x180",
        type: "image/png"
      }
    ],
    shortcut: [SITE_CONFIG.assets.faviconIco]
  }
};

const THEME_INIT_SCRIPT = `(function(){try{var k="slatico-theme",s=localStorage.getItem(k)||"system",m=window.matchMedia("(prefers-color-scheme: dark)").matches,d=s==="dark"||(s==="system"&&m);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";document.documentElement.setAttribute("data-theme-preference",s);}catch(e){}})();`;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globalJsonLd = [
    buildOrganizationJsonLd(),
    buildWebSiteJsonLd(),
    buildSoftwareSourceCodeJsonLd()
  ];

  return (
    <html
      lang={SITE_CONFIG.language}
      className={generalSans.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased"
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main-content" className="w-full flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
