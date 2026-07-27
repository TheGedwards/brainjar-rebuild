/**
 * Structured-data (JSON-LD) helpers. One place to build schema.org objects and
 * one component to render them, so every page emits consistent, valid markup.
 *
 * The organization is defined ONCE with a stable @id (`${SITE}/#organization`);
 * everything else (Service.provider, etc.) references that @id instead of
 * repeating the business details. Update the business in one place → it's
 * correct everywhere.
 */
import { SITE_URL as SITE } from "@/lib/site";

/** Cities we genuinely serve — used for areaServed on the org + service schema. */
export const AREA_SERVED = [
  "Gresham, OR",
  "Portland, OR",
  "Troutdale, OR",
  "Happy Valley, OR",
  "Sandy, OR",
  "Fairview, OR",
  "Wood Village, OR",
];

const ORG_ID = `${SITE}/#organization`;

/** Absolute URL from a site-relative path ("/work" -> "https://…/work"). */
export function abs(path: string): string {
  return path.startsWith("http") ? path : `${SITE}${path}`;
}

/**
 * The business. Enriched LocalBusiness: logo/image for knowledge-panel
 * eligibility, hours, price range, and the real social profiles. Rendered once
 * in the root layout.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    name: "Brainjar Media",
    description:
      "Digital marketing agency specializing in SEO, web development, content marketing and paid advertising.",
    url: SITE,
    telephone: "+1-503-929-7436",
    foundingDate: "2003",
    image: `${SITE}/opengraph-image`,
    logo: `${SITE}/assets/apple-touch-icon.png`,
    priceRange: "$500–$10,000",
    address: {
      "@type": "PostalAddress",
      streetAddress: "109 N Main Ave #202",
      addressLocality: "Gresham",
      addressRegion: "OR",
      postalCode: "97030",
      addressCountry: "US",
    },
    geo: { "@type": "GeoCoordinates", latitude: 45.4985, longitude: -122.4334 },
    areaServed: AREA_SERVED,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "17:00",
      },
    ],
    sameAs: [
      "https://www.facebook.com/BrainjarMedia/",
      "https://x.com/brainjarmedia",
      "https://www.youtube.com/@BrainjarMedia",
      "https://www.yelp.com/biz/brainjar-media-gresham",
      "https://maps.app.goo.gl/kqpewVLN6ppBaYSy8",
    ],
  };
}

/** A single service offering, tied back to the org as its provider. */
export function serviceSchema(opts: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    serviceType: opts.name,
    description: opts.description,
    url: abs(opts.path),
    provider: { "@id": ORG_ID },
    areaServed: AREA_SERVED,
  };
}

/**
 * A location landing page's offering: digital marketing provided by the org,
 * served to one city. Honest — it does NOT assert a physical location in that
 * city (only the sitewide org schema carries the real Gresham address).
 */
export function localServiceSchema(opts: {
  city: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Digital Marketing in ${opts.city}`,
    serviceType: "Digital Marketing",
    description: opts.description,
    url: abs(opts.path),
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "City", name: opts.city },
  };
}

/** Breadcrumb trail. Pass items in order, root first. */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

/** Renders one or more schema objects as a JSON-LD script tag. */
export function JsonLd({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
    </>
  );
}
