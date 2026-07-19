/**
 * Which deployment am I? Drives crawlability.
 *
 * Only the real production domain should be indexable. Staging (*.vercel.app)
 * and localhost must never be crawled, or Google indexes a duplicate of the
 * site that competes with brainjarmedia.com in search results.
 *
 * Set NEXT_PUBLIC_SITE_URL to the live domain in production and the staging
 * URL on staging — that single env var flips both robots.txt and the
 * <meta name="robots"> tag in the root layout.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.brainjarmedia.com";

export const IS_PRODUCTION_SITE = SITE_URL.includes("brainjarmedia.com");
