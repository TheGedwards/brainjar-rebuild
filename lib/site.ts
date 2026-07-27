/**
 * Which deployment am I? Drives crawlability.
 *
 * Only the real production domain should be indexable. Staging (*.vercel.app),
 * localhost, AND any brainjarmedia.com *subdomain* (e.g. a temporary
 * preview.brainjarmedia.com) must never be crawled, or Google indexes a
 * duplicate that competes with the real site in search results.
 *
 * Set NEXT_PUBLIC_SITE_URL to the live domain in production and the staging
 * URL on staging — that single env var flips both robots.txt and the
 * <meta name="robots"> tag in the root layout.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.brainjarmedia.com";

// Match the canonical host EXACTLY (www or apex) — NOT a substring. A substring
// check (`includes("brainjarmedia.com")`) wrongly treats preview/staging
// subdomains as production and lets them get indexed. This is why the old
// preview.brainjarmedia.com was crawlable.
const PRODUCTION_HOSTS = new Set(["brainjarmedia.com", "www.brainjarmedia.com"]);
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}
export const IS_PRODUCTION_SITE = PRODUCTION_HOSTS.has(hostOf(SITE_URL));
