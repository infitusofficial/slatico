import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_METADATA } from "@/data/site-config";
import "@slatico/font/slatico.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://slatico.infitus.com"
  ),
  title: {
    default: `${SITE_METADATA.brand} by ${SITE_METADATA.parentBrand} — Multi-Platform SVG Icon System`,
    template: `%s | ${SITE_METADATA.brand}`
  },
  description: SITE_METADATA.description,
  keywords: [
    "Slatico",
    "Infitus Creative Studio",
    "SVG icons",
    "React icons",
    "open-source icon library",
    "duotone icons",
    "color icons",
    "multi-platform icons"
  ],
  authors: [{ name: SITE_METADATA.parentBrand }],
  creator: SITE_METADATA.parentBrand,
  publisher: SITE_METADATA.parentBrand,
  openGraph: {
    type: "website",
    siteName: `${SITE_METADATA.brand} by ${SITE_METADATA.parentBrand}`,
    title: `${SITE_METADATA.brand} — Seven-Style Open-Source SVG Icon Library`,
    description: SITE_METADATA.description,
    url: "https://github.com/infitusofficial/slatico"
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_METADATA.brand} by ${SITE_METADATA.parentBrand}`,
    description: SITE_METADATA.description
  }
};

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem('slatico-theme');
    if (stored === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
