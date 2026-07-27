/**
 * Redirect & broken-link integrity checker (powers /admin/redirects).
 *
 * 1. REDIRECTS: fetches every rule's source on the live deployment and confirms
 *    it still returns a permanent redirect (301/308) to the expected
 *    destination. Pattern rules (`:slug`, `:path*`) are tested with a sample
 *    value. This is the safety net for the load-bearing 301 map.
 * 2. INTERNAL LINKS: crawls the sitemap pages, extracts on-site links, and flags
 *    any that 404 (broken) or themselves redirect (should point at the final
 *    URL). External links, mailto/tel, and /admin are skipped.
 *
 * Cached hourly. All fetches use redirect:"manual" so we observe the real status.
 */
import { unstable_cache } from "next/cache";
import { REDIRECTS, isPatternRule } from "@/lib/redirects";

export type RedirectCheck = {
  source: string;
  destination: string;
  tested: string; // the actual URL path tested (sample-substituted for patterns)
  status: number | null;
  location: string | null;
  ok: boolean;
  note: string;
  pattern: boolean;
};

export type LinkCheck = {
  url: string;
  status: number | null;
  severity: "warn" | "fail";
  note: string;
  foundOn: string;
};

export type LinkAudit = {
  base: string;
  redirects: RedirectCheck[];
  redirectSummary: { total: number; ok: number; broken: number };
  links: LinkCheck[];
  linkSummary: { checked: number; ok: number; redirected: number; broken: number };
};

const PERMANENT = new Set([301, 308]);
const SAMPLE = "checker-sample";

/** Replace Next path params (`:slug`, `:path*`) with a sample token. */
function sampleize(path: string): string {
  return path.replace(/:[a-zA-Z]+\*?/g, SAMPLE);
}

function locPath(location: string | null): string | null {
  if (!location) return null;
  try {
    return location.startsWith("http") ? new URL(location).pathname : location.split("?")[0];
  } catch {
    return location;
  }
}

async function head(url: string, timeoutMs = 8000): Promise<{ status: number | null; location: string | null }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: "GET", redirect: "manual", signal: ctrl.signal });
    return { status: res.status, location: res.headers.get("location") };
  } catch {
    return { status: null, location: null };
  } finally {
    clearTimeout(t);
  }
}

/** Run tasks in bounded-concurrency batches. */
async function pool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
  }
  return out;
}

async function checkRedirects(base: string): Promise<RedirectCheck[]> {
  return pool(REDIRECTS, 16, async (r) => {
    const pattern = isPatternRule(r.source);
    const tested = sampleize(r.source);
    const expected = sampleize(r.destination);
    const { status, location } = await head(base + tested);
    const gotPath = locPath(location);

    let ok = false;
    let note = "";
    if (status === null) {
      note = "No response.";
    } else if (!PERMANENT.has(status)) {
      note = status >= 300 && status < 400 ? `Redirects with ${status} (not permanent).` : `Returned ${status}, not a redirect.`;
    } else if (gotPath && gotPath.replace(/\/$/, "") !== expected.replace(/\/$/, "")) {
      note = `Lands on ${gotPath} (expected ${expected}).`;
    } else {
      ok = true;
      note = `${status} → ${gotPath ?? expected}`;
    }
    return { source: r.source, destination: r.destination, tested, status, location: gotPath, ok, note, pattern };
  });
}

/** Pull internal, on-site links out of an HTML string. */
function extractLinks(html: string): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(/href=["'](\/[^"'#]*)["']/g)) {
    const href = m[1].split("?")[0].split("#")[0];
    if (!href || href.startsWith("//")) continue; // protocol-relative = external
    if (href.startsWith("/admin")) continue; // gated + noindex
    if (/\.(png|jpe?g|svg|webp|ico|xml|txt|json|webmanifest)$/i.test(href)) continue; // assets
    out.push(href.replace(/\/$/, "") || "/");
  }
  return out;
}

async function checkInternalLinks(base: string): Promise<{ links: LinkCheck[]; summary: LinkAudit["linkSummary"] }> {
  // Crawl the sitemap pages for on-site links.
  const sm = await fetch(`${base}/sitemap.xml`).then((r) => r.text()).catch(() => "");
  const pages = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
    try { return new URL(m[1]).pathname; } catch { return null; }
  }).filter((p): p is string => !!p);

  const foundOn = new Map<string, string>();
  await pool(pages, 12, async (p) => {
    const html = await fetch(base + p).then((r) => r.text()).catch(() => "");
    for (const href of extractLinks(html)) if (!foundOn.has(href)) foundOn.set(href, p);
  });

  const unique = [...foundOn.keys()];
  let ok = 0, redirected = 0, broken = 0;
  const problems: LinkCheck[] = [];

  await pool(unique, 16, async (url) => {
    const { status } = await head(base + url);
    if (status && status >= 200 && status < 300) { ok++; return; }
    if (status && status >= 300 && status < 400) {
      redirected++;
      problems.push({ url, status, severity: "warn", note: "Links to a redirect — point it at the final URL.", foundOn: foundOn.get(url)! });
      return;
    }
    broken++;
    problems.push({ url, status, severity: "fail", note: status ? `Returns ${status}.` : "No response.", foundOn: foundOn.get(url)! });
  });

  problems.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "fail" ? -1 : 1));
  return { links: problems, summary: { checked: unique.length, ok, redirected, broken } };
}

async function runLinkAudit(base: string): Promise<LinkAudit> {
  const [redirects, linkResult] = await Promise.all([checkRedirects(base), checkInternalLinks(base)]);
  redirects.sort((a, b) => Number(a.ok) - Number(b.ok)); // failures first
  return {
    base,
    redirects,
    redirectSummary: {
      total: redirects.length,
      ok: redirects.filter((r) => r.ok).length,
      broken: redirects.filter((r) => !r.ok).length,
    },
    links: linkResult.links,
    linkSummary: linkResult.summary,
  };
}

/** Cached for an hour, keyed by base URL. */
export function getLinkAudit(base: string): Promise<LinkAudit> {
  return unstable_cache(() => runLinkAudit(base), ["admin-link-audit-v1", base], { revalidate: 3600 })();
}
