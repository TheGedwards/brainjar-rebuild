/**
 * 301 REDIRECT MAP — brainjarmedia.com (WordPress) -> Next.js
 *
 * This is the single source of truth for the redirect map. `next.config.ts`
 * imports REDIRECTS and returns it; the in-admin checker (/admin/redirects,
 * lib/link-audit.ts) imports the same array to verify every rule still works.
 * Keeping both readers on ONE array means the checker can never drift from what
 * the site actually serves.
 *
 * `permanent: true` emits a real permanent redirect. Next matches these BEFORE
 * routing, so nothing here can be shadowed by an app route. Source paths are
 * written WITHOUT trailing slashes (Next normalizes before matching).
 *
 * ORDER MATTERS: exact rules that would otherwise be caught by a wildcard must
 * come first (e.g. /portfolio-2 before /portfolio-:slug). Preserve the order.
 *
 * Every old URL either lands on an equivalent page or the closest parent.
 * No old URL is allowed to 404. Never delete a rule — repoint it if a route
 * is renamed or retired.
 */

export type RedirectRule = { source: string; destination: string };

// --- Core pages -------------------------------------------------------------
const corePages: RedirectRule[] = [
  { source: "/about-our-process", destination: "/about" },
  { source: "/brainjar-media-services", destination: "/services" },
  { source: "/brainjar-media-portfolio", destination: "/work" },
  { source: "/brainjar-blog", destination: "/blog" },
  { source: "/contact-us", destination: "/contact" },
  { source: "/sitemap", destination: "/sitemap.xml" },
];

// --- Top-level service pages ------------------------------------------------
const servicePages: RedirectRule[] = [
  { source: "/search-engine-optimization", destination: "/services/seo" },
  { source: "/web-development", destination: "/services/web-development" },
  { source: "/content-marketing", destination: "/services/content-marketing" },
  { source: "/paid-advertisements", destination: "/services/paid-advertising" },
  // Graphic Design was retired 2026-07-18. This old indexed URL now lands on
  // the Formulary instead of a dead service page — do NOT delete this rule.
  { source: "/graphic-design", destination: "/services" },
];

/**
 * Sub-service pages. Kept as REAL nested pages rather than collapsed into an
 * anchor on the parent — 12 indexed URLs with their own keyword targets are
 * worth more as standalone pages than as #fragments.
 */
const subServicePages: RedirectRule[] = [
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
 * /work/{slug}, so ONE wildcard rule covers the whole set. The named exceptions
 * run FIRST and rename a handful of slugs that were bad for SEO.
 */
const portfolioRenames: RedirectRule[] = [
  { source: "/portfolio-the-sasquatch-coffee-company", destination: "/work/sasquatch-coffee" },
  { source: "/portfolio-west-columbia-gorge-chamber", destination: "/work/west-columbia-gorge-chamber-of-commerce" },
  { source: "/portfolio-presage-consulting-and-training", destination: "/work/presage-consulting" },
  { source: "/portfolio-all-about-automotive", destination: "/work/all-about-automotive" },
];

const portfolioWildcard: RedirectRule = {
  source: "/portfolio-:slug",
  destination: "/work/:slug",
};

/**
 * Legacy WordPress pages found in the old wp-sitemap (crawled 2026-07-24) that
 * weren't covered above. Each lands on the closest live equivalent.
 */
const legacyPages: RedirectRule[] = [
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
 */
const legacyCaseStudies: RedirectRule[] = [
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
  // ~19 old "a page from our portfolio" blog posts share this prefix -> /work.
  { source: "/a-page-from-our-portfolio-:slug", destination: "/work" },
];

/**
 * Legacy blog posts (2014–2020). No 1:1 equivalents, so each 301s to /blog.
 */
const legacyBlogPosts: RedirectRule[] = [
  "what-is-search-engine-optimization",
  "why-google-business-pages-are-important",
  "3-types-of-media-marketing-owned-paid-and-earned",
  "brand-publishing-turns-your-business-into-global-media-company",
  "dont-worry-about-facebook-likes-improve-your-reach-and-engagement",
  "forbes-predicts-social-media-will-become-20-of-marketing-budgets-in-2015",
  "3-reasons-why-content-marketing-is-essential",
  "3-ways-to-measure-your-social-media-success",
  "canva-free-and-easy-tool-to-improve-your-facebook-and-blog-posts",
  "3-reasons-why-we-can-finally-recomend-pinterest-and-one-reason-we-cant",
  "5-social-media-marketing-predictions-for-2015",
  "google-hasnt-soared-5-reasons-you-still-need-it",
  "3-workarounds-for-facebooks-pay-to-play-platform",
  "6-marketing-tools-that-will-soon-be-obsolete",
  "10-must-see-social-media-marketing-stats",
  "top-3-ways-to-build-links-to-your-website",
  "6-tips-to-get-customers-to-promote-your-brand",
  "10-online-marketing-experts-to-follow-in-2015",
  "9-key-points-for-cleaning-up-your-online-reputation-nightmare",
  "googles-mobile-friendly-update-starts-april-21st-is-your-website-ready",
  "8-things-you-must-do-for-seo",
  "user-experience-is-a-big-deal",
  "top-10-seo-mistakes-to-avoid",
  "top-5-reasons-you-need-a-website-redesign",
  "how-to-choose-the-right-seo-company",
  "learn-how-online-customer-reviews-help-seo",
  "how-important-is-click-through-rate",
  "4-tips-to-manage-mobile-seo",
  "organic-search-engine-optimization",
  "seo-and-content-marketing-joining-forces",
  "7-fatal-seo-mistakes-of-small-businesses",
  "8-reasons-to-hire-a-professional-seo-copywriter",
  "local-seo-for-small-businesses",
  "google-analytics-now-removes-referral-spam-from-reports-automatically",
  "how-does-google-rankbrain-affect-search-engine-optimization-in-2016",
  "top-3-seo-copywriting-mistake-you-should-avoid",
  "how-do-i-create-great-content-for-seo",
  "why-you-need-both-on-page-and-off-page-seo",
  "what-are-local-seo-rankings-how-can-i-improve-them",
  "why-every-website-needs-a-faq-page",
  "what-is-the-difference-between-white-hat-and-black-hat-seo",
  "how-do-i-find-the-best-seo-keywords-for-my-business",
  "improve-your-websites-ranking-using-these-seo-tips",
  "frequency-should-be-your-first-year-priority",
  "5-things-to-consider-during-your-website-development",
  "1-ez-rule-to-rank-for-keywords-with-a-checklist",
  "4-tips-you-can-use-to-write-great-copy-for-your-business",
  "how-long-should-my-blog-posts-be",
  "how-to-optimize-titles-urls-and-descriptions-to-boost-seo",
  "how-do-i-implement-keyword-research-for-seo",
  "how-can-i-take-advantage-of-googles-query-deserved-freshness-qdf",
  "reach-your-target-audience-with-vertical-search-engine-optimization",
  "greater-portland-chapter-of-narpm-presentation-sep-20th-2019",
  "phases-to-business-recovery-connect-to-your-customers",
  "phases-to-business-recovery-adjust",
  "phases-to-business-recovery-adjust-2",
  "bounce-back-from-covd-19-generate-interest",
  "bounce-back-from-covd-19-use-ads-on-facebook",
  "gresham-chamber-slides-2020",
  "bounce-back-from-covd-19-blogging-google-my-business-and-facebook",
  "covid-19-and-business-growth-analyze-your-efforts",
  "covid-19-and-business-growth-increase-ad-budget",
  "covid-19-and-business-growth-blog-on-new-trends",
].map((slug) => ({ source: `/${slug}`, destination: "/blog" }));

// --- WordPress cruft --------------------------------------------------------
const wordpressCruft: RedirectRule[] = [
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

/**
 * The full ordered map. Order is preserved exactly (exact rules before the
 * wildcards that would otherwise swallow them).
 */
export const REDIRECTS: RedirectRule[] = [
  ...corePages,
  ...servicePages,
  ...subServicePages,
  ...legacyPages,
  ...legacyCaseStudies,
  ...legacyBlogPosts,
  ...portfolioRenames,
  portfolioWildcard,
  ...wordpressCruft,
];

/** A rule whose source contains a Next path pattern (`:slug`, `:path*`). */
export const isPatternRule = (source: string) => source.includes(":");
