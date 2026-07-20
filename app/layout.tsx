import type { Metadata } from "next";
import { Montserrat, Spectral } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteChrome } from "@/components/site-chrome";
import { AdminBarProvider } from "@/components/admin-bar";
import { BRAIN_KEYFRAMES } from "@/components/brand-mark";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Brainjar Media | Digital Marketing & SEO — Gresham, Portland, Oregon",
    template: "%s | Brainjar Media",
  },
  description:
    "A digital apothecary for ambitious brands. SEO, web development, content marketing and paid advertising from Gresham, Oregon. Two decades of measurable results.",
  alternates: { canonical: "/" },
  // Staging/localhost emit <meta name="robots" content="noindex,nofollow">.
  // robots.txt alone won't stop indexing of a URL linked from elsewhere.
  robots: IS_PRODUCTION_SITE ? undefined : { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: "Brainjar Media",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${spectral.variable}`}>
      <body className="flex min-h-screen flex-col">
        <style dangerouslySetInnerHTML={{ __html: BRAIN_KEYFRAMES }} />
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
            eligibility and it matters for "digital agency gresham". */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "Brainjar Media",
              description:
                "Digital marketing agency specializing in SEO, web development, content marketing and paid advertising.",
              url: SITE,
              telephone: "+1-503-929-7436",
              foundingDate: "2003",
              address: {
                "@type": "PostalAddress",
                streetAddress: "109 N Main Ave #202",
                addressLocality: "Gresham",
                addressRegion: "OR",
                postalCode: "97030",
                addressCountry: "US",
              },
              geo: { "@type": "GeoCoordinates", latitude: 45.4985, longitude: -122.4334 },
              areaServed: ["Gresham, OR", "Portland, OR"],
              sameAs: [
                "https://www.facebook.com/BrainjarMedia/",
                "https://twitter.com/brainjarmedia",
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
