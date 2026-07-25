import type { NextConfig } from "next";

/**
 * 301 REDIRECT MAP — brainjarmedia.com (WordPress) -> Next.js
 *
 * `permanent: true` emits a real HTTP 301. Next matches these BEFORE routing,
 * so nothing here can be shadowed by an app route.
 *
 * Source paths are written WITHOUT trailing slashes. Next normalizes
 * `/about-our-process/` -> `/about-our-process` before matching (trailingSlash
 * is false by default), so both forms are covered by one rule.
 *
 * Every old URL either lands on an equivalent page or the closest parent.
 * No old URL is allowed to 404.
 */

// --- Core pages -------------------------------------------------------------
const corePages = [
  { source: "/about-our-process", destination: "/about" },
  { source: "/brainjar-media-services", destination: "/services" },
  { source: "/brainjar-media-portfolio", destination: "/work" },
  { source: "/brainjar-blog", destination: "/blog" },
  { source: "/contact-us", destination: "/contact" },
  { source: "/sitemap", destination: "/sitemap.xml" },
];

// --- Top-level service pages ------------------------------------------------
const servicePages = [
  { source: "/search-engine-optimization", destination: "/services/seo" },
  { source: "/web-development", destination: "/services/web-development" },
  { source: "/content-marketing", destination: "/services/content-marketing" },
  { source: "/paid-advertisements", destination: "/services/paid-advertising" },
  // Graphic Design was retired 2026-07-18. This old indexed URL now lands on
  // the Formulary instead of a dead service page — do NOT delete this rule.
  { source: "/graphic-design", destination: "/services" },
];

/**
 * Sub-service pages. These are kept as REAL nested pages rather than being
 * collapsed into an anchor on the parent — 12 indexed URLs with their own
 * keyword targets ("local seo gresham", "facebook boosting") are worth more as
 * standalone pages than as #fragments, which Google does not rank separately.
 */
const subServicePages = [
  { source: "/seo-keyword-research", destination: "/services/seo/keyword-research" },
  { source: "/seo-competitive-analysis", destination: "/services/seo/competitive-analysis" },
  { source: "/seo-local-seo", destination: "/services/seo/local-seo" },
  { source: "/web-development-design", destination: "/services/web-development/website-design" },
  { source: "/web-development-landing-pages", destination: "/services/web-development/landing-pages" },
  { source: "/web-development-ecommerce", destination: "/services/web-development/ecommerce" },
  { source: "/content-marketing-social-media", destination: "/services/content-marketing/social-media" },
  { source: "/content-marketing-email-campaign", destination: "/services/content-marketing/email-campaigns" },
  { source: "/content-marketing-copywriting", destination: "/services/content-marketing/copywriting" },
  { source: "/paid-ads-google-ppc", destination: "/services/paid-advertising/google-ppc" },
  { source: "/paid-ads-facebook-ad-campaign", destination: "/services/paid-advertising/facebook-ads" },
  { source: "/paid-ads-facebook-boosting", destination: "/services/paid-advertising/facebook-boosting" },
];

/**
 * Portfolio. All 33 live under /portfolio-{slug}/ and map cleanly to
 * /work/{slug}, so ONE wildcard rule covers the whole set — including any
 * portfolio URL that exists in Google's index but wasn't linked from the
 * portfolio page.
 *
 * The named exceptions below run FIRST and rename a handful of slugs that were
 * bad for SEO (redundant "the-", "-company", "-commerce" fragments).
 */
const portfolioRenames = [
  { source: "/portfolio-the-sasquatch-coffee-company", destination: "/work/sasquatch-coffee" },
  { source: "/portfolio-west-columbia-gorge-chamber", destination: "/work/west-columbia-gorge-chamber-of-commerce" },
  { source: "/portfolio-presage-consulting-and-training", destination: "/work/presage-consulting" },
  { source: "/portfolio-all-about-automotive", destination: "/work/all-about-automotive" },
];

const portfolioWildcard = {
  source: "/portfolio-:slug",
  destination: "/work/:slug",
};

/**
 * Legacy WordPress pages found in the old wp-sitemap (crawled 2026-07-24) that
 * weren't covered above. Each lands on the closest live equivalent so no old
 * indexed URL 404s. A few targets are best-guesses (marked) — adjust if wrong.
 */
const legacyPages = [
  // About cluster
  { source: "/history", destination: "/about" },
  { source: "/philosophy", destination: "/about" },
  { source: "/how-we-do-it", destination: "/about" },
  // Old service variants (Graphic Design retired 2026-07-18 -> /services)
  { source: "/web-design", destination: "/services/web-development" },
  { source: "/social-media", destination: "/services/content-marketing/social-media" },
  { source: "/seosmm", destination: "/services" },
  { source: "/graphic-design-3", destination: "/services" },
  { source: "/graphic-design-logos-brand-identity", destination: "/services" },
  { source: "/graphic-design-business-cards", destination: "/services" },
  // Proof / portfolio landing pages
  { source: "/client-list", destination: "/work" },
  { source: "/testimonials", destination: "/work" },
  { source: "/case-studies", destination: "/work" },
  { source: "/client-template", destination: "/work" },
  { source: "/portfolio-2", destination: "/work" }, // MUST precede /portfolio-:slug
  { source: "/bickmore", destination: "/work" }, // old client page (best-guess)
  // Content offers / misc (best-guess targets)
  { source: "/free-competitive-analysis", destination: "/services/seo/competitive-analysis" },
  { source: "/smm4leaders", destination: "/services/content-marketing/social-media" },
  { source: "/seven-rules", destination: "/blog" },
  // Theme-demo / test / dead pages -> home
  { source: "/page-templates", destination: "/" },
  { source: "/page-templates/:path*", destination: "/" },
  { source: "/page-template", destination: "/" },
  { source: "/home_test", destination: "/" },
  { source: "/artists-needed", destination: "/" },
  { source: "/holiday-greens", destination: "/" },
];

/**
 * Legacy per-service case-study URLs (the scheme before /portfolio-{slug}).
 * Where the client maps cleanly to a current specimen slug, point there;
 * otherwise land on the portfolio index. All are exact paths, so they don't
 * collide with the /web-development-* sub-service rules above.
 */
const legacyCaseStudies = [
  { source: "/seo-all-about-automotive", destination: "/work/all-about-automotive" },
  { source: "/web-development-sand-in-the-city", destination: "/work/sand-in-the-city" },
  { source: "/web-development-skyland-pub", destination: "/work/skyland-pub" },
  { source: "/graphics-the-best-little-genius-montessori", destination: "/work/little-genius-montessori" },
  { source: "/seo-petropics", destination: "/work" },
  { source: "/e-commerce-da-leather", destination: "/work" },
  { source: "/web-development-gresham-animal-hospital", destination: "/work" },
  { source: "/web-development-best-burger-bbq", destination: "/work" },
  { source: "/web-development-human-solutions", destination: "/work" },
  { source: "/graphics-a-way-with-numbers", destination: "/work" },
  { source: "/graphics-off-the-charts-games", destination: "/work" },
  { source: "/graphics-radiah-tech", destination: "/work" },
  { source: "/graphics-cliff-barackman", destination: "/work" },
  { source: "/graphics-willamette-eggs", destination: "/work" },
  { source: "/e-commerce-club-sunglass", destination: "/work" },
  { source: "/social-media-iron-mountain-ridge", destination: "/work" },
  { source: "/social-media-iron-mountain-ridge-2", destination: "/work" },
  { source: "/seo-gramor-development", destination: "/work" },
];

// --- WordPress cruft --------------------------------------------------------
// Old WP endpoints that get crawled forever. Send them somewhere sane instead
// of letting them 404 or, worse, sit there as an attack surface.
const wordpressCruft = [
  { source: "/wp-login.php", destination: "/" },
  { source: "/wp-admin", destination: "/" },
  { source: "/wp-admin/:path*", destination: "/" },
  { source: "/feed", destination: "/blog" },
  { source: "/comments/feed", destination: "/blog" },
  { source: "/category/:slug", destination: "/blog" },
  { source: "/tag/:slug", destination: "/blog" },
  { source: "/author/:slug", destination: "/blog" },
  { source: "/index.php", destination: "/" },
  { source: "/home", destination: "/" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage — portfolio screenshots and blog cover images
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },

  async redirects() {
    return [
      ...corePages,
      ...servicePages,
      ...subServicePages,
      ...legacyPages,
      ...legacyCaseStudies,
      ...portfolioRenames,
      portfolioWildcard,
      ...wordpressCruft,
    ].map((r) => ({ ...r, permanent: true })); // permanent: true === HTTP 301
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;

/**
 * NOT handled here, handle in the Vercel dashboard instead:
 *
 * 1. apex -> www. The live site canonicalizes on https://www.brainjarmedia.com,
 *    so keep www as canonical to preserve existing backlink equity. In Vercel:
 *    Project -> Domains -> add both, set brainjarmedia.com to "Redirect to
 *    www.brainjarmedia.com" (Vercel issues a 308, which search engines treat
 *    the same as a 301 for consolidation).
 *
 * 2. http -> https is automatic on Vercel.
 *
 * 3. /wp-content/uploads/** — old image URLs. These have accumulated image
 *    search equity over 15 years. Two options:
 *      a) leave them 404ing (acceptable, images aren't a ranking asset here), or
 *      b) rehost the originals in Supabase Storage under the same paths and add
 *         a rewrite. Only worth it if Google Images sends you real traffic —
 *         check Search Console -> Performance -> Search type: Image first.
 */
