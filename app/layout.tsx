import type { Metadata } from "next";
import { Montserrat, Spectral } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteChrome } from "@/components/site-chrome";
import { AdminBarProvider } from "@/components/admin-bar";
import { BRAIN_KEYFRAMES } from "@/components/brand-mark";
import Script from "next/script";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
  display: "swap",
});

import { SITE_URL as SITE, IS_PRODUCTION_SITE } from "@/lib/site";
import { JsonLd, organizationSchema } from "@/lib/schema";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Brainjar Media | Digital Marketing & SEO, Gresham OR",
    template: "%s | Brainjar Media",
  },
  description:
    "A digital apothecary for ambitious brands. SEO, web development, content marketing and paid advertising from Gresham, Oregon. Two decades of measurable results.",
  alternates: { canonical: "/" },
  // Staging/localhost emit <meta name="robots" content="noindex,nofollow">.
  // robots.txt alone won't stop indexing of a URL linked from elsewhere.
  robots: IS_PRODUCTION_SITE ? undefined : { index: false, follow: false },
  icons: {
    icon: [
      { url: "/assets/favicon.svg", type: "image/svg+xml" },
      { url: "/assets/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/assets/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/assets/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Brainjar Media",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // GA4 loads only on the real production domain and only once the Measurement
  // ID env var is set — never on staging/localhost, so GA isn't polluted.
  const GA_ID = process.env.NEXT_PUBLIC_GA4_ID;
  return (
    <html lang="en" className={`${montserrat.variable} ${spectral.variable}`}>
      <body className="flex min-h-screen flex-col">
        <style dangerouslySetInnerHTML={{ __html: BRAIN_KEYFRAMES }} />
        {IS_PRODUCTION_SITE && GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-tincture focus:px-4 focus:py-2 focus:font-display focus:text-xs focus:text-paper"
        >
          Skip to content
        </a>
        <AdminBarProvider>
          <SiteChrome header={<SiteHeader />} footer={<SiteFooter />}>
            {children}
          </SiteChrome>
        </AdminBarProvider>

        {/* LocalBusiness schema. The old site had none; this is free rich-result
            eligibility and it matters for "digital agency gresham". Built in
            lib/schema.tsx with a stable @id everything else references. */}
        <JsonLd data={organizationSchema()} />
      </body>
    </html>
  );
}
