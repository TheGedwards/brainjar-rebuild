/**
 * In-house SEO health linter. Fetches every public page from the running
 * deployment and parses the real rendered HTML — the same thing an external
 * crawler (Screaming Frog, Ahrefs) does — then flags the common on-page SEO
 * problems. Powers /admin/seo.
 *
 * Cheap regex parsing (no cheerio dependency) is enough for these checks. The
 * whole sweep is cached for an hour; the admin page notes that.
 */
import { unstable_cache } from "next/cache";
import { PAGES } from "@/lib/pages";
import { getProjects, getPosts } from "@/lib/supabase";

export type Severity = "ok" | "warn" | "fail";
export type Check = { id: string; label: string; severity: Severity; detail: string };
export type PageAudit = {
  path: string;
  name: string;
  ok: boolean; // responded 200
  title: string; // captured for cross-page duplicate detection
  desc: string;
  fails: number;
  warns: number;
  checks: Check[];
};
export type SiteAudit = {
  base: string;
  pages: PageAudit[];
  totals: { pages: number; failPages: number; warnPages: number; cleanPages: number };
};

type Target = { path: string; name: string };

// --- tiny HTML helpers ------------------------------------------------------

function firstMatch(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? m[1] : null;
}

/** Pull the `content` attribute out of a single tag string. */
function attrContent(tag: string | null): string | null {
  if (!tag) return null;
  const m = tag.match(/content=["']([^"']*)["']/i);
  return m ? m[1].trim() : null;
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .trim();
}

/** Rough visible-word count: drop head/script/style, strip tags. */
function wordCount(html: string): number {
  const body = html.replace(/[\s\S]*?<\/head>/i, "");
  const text = body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ");
  const words = text.split(/\s+/).filter((w) => w.length > 1);
  return words.length;
}

// --- per-page checks --------------------------------------------------------

function auditHtml(path: string, name: string, html: string): PageAudit {
  const checks: Check[] = [];
  const add = (id: string, label: string, severity: Severity, detail: string) =>
    checks.push({ id, label, severity, detail });

  // Title
  const rawTitle = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = rawTitle ? decode(rawTitle) : "";
  if (!title) add("title", "Title tag", "fail", "Missing <title>.");
  else if (title.length < 30) add("title", "Title tag", "warn", `Only ${title.length} chars — short (aim 30–60).`);
  else if (title.length > 60) add("title", "Title tag", "warn", `${title.length} chars — may truncate in search (aim 30–60).`);
  else add("title", "Title tag", "ok", `${title.length} chars.`);

  // Meta description
  const descTag = firstMatch(html, /(<meta[^>]+name=["']description["'][^>]*>)/i);
  const desc = attrContent(descTag) ? decode(attrContent(descTag)!) : "";
  if (!desc) add("desc", "Meta description", "fail", "Missing meta description.");
  else if (desc.length < 70) add("desc", "Meta description", "warn", `Only ${desc.length} chars — thin (aim 70–160).`);
  else if (desc.length > 160) add("desc", "Meta description", "warn", `${desc.length} chars — will truncate (aim 70–160).`);
  else add("desc", "Meta description", "ok", `${desc.length} chars.`);

  // Canonical
  const hasCanonical = /<link[^>]+rel=["']canonical["'][^>]*>/i.test(html);
  add("canonical", "Canonical link", hasCanonical ? "ok" : "fail", hasCanonical ? "Present." : "No canonical <link>.");

  // H1
  const h1s = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1s === 0) add("h1", "H1 heading", "fail", "No <h1> on the page.");
  else if (h1s > 1) add("h1", "H1 heading", "warn", `${h1s} <h1> tags — there should be exactly one.`);
  else add("h1", "H1 heading", "ok", "Exactly one <h1>.");

  // OpenGraph image
  const hasOg = /<meta[^>]+property=["']og:image["'][^>]*>/i.test(html);
  add("og", "Social image (og:image)", hasOg ? "ok" : "warn", hasOg ? "Present." : "No og:image — poor link previews.");

  // Structured data
  const hasLd = /<script[^>]+type=["']application\/ld\+json["']/i.test(html);
  add("schema", "Structured data", hasLd ? "ok" : "warn", hasLd ? "JSON-LD present." : "No JSON-LD schema.");

  // Images missing alt
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  const noAlt = imgs.filter((t) => !/\balt\s*=/.test(t)).length;
  if (noAlt > 0) add("alt", "Image alt text", "warn", `${noAlt} of ${imgs.length} <img> missing an alt attribute.`);
  else add("alt", "Image alt text", "ok", imgs.length ? `All ${imgs.length} images have alt.` : "No images.");

  // Thin content
  const words = wordCount(html);
  if (words < 150) add("content", "Content depth", "warn", `~${words} words — thin (aim 150+).`);
  else add("content", "Content depth", "ok", `~${words} words.`);

  return { path, name, ok: true, title, desc, ...tally(checks) };
}

/** Count severities and bundle with the checks. */
function tally(checks: Check[]) {
  return {
    checks,
    fails: checks.filter((c) => c.severity === "fail").length,
    warns: checks.filter((c) => c.severity === "warn").length,
  };
}

// --- crawl ------------------------------------------------------------------

/** Enumerate every public URL from the registries + the DB. */
async function targets(): Promise<Target[]> {
  const [projects, posts] = await Promise.all([
    getProjects().catch(() => []),
    getPosts().catch(() => []),
  ]);
  const list: Target[] = [
    ...PAGES.map((p) => ({ path: p.path, name: p.name })),
    { path: "/locations", name: "Areas We Serve (hub)" },
    ...projects.map((p) => ({ path: `/work/${p.slug}`, name: `Work — ${p.clients?.name ?? p.title}` })),
    ...posts.map((p) => ({ path: `/blog/${p.slug}`, name: `Blog — ${p.title}` })),
  ];
  // Dedupe by path.
  const seen = new Set<string>();
  return list.filter((t) => (seen.has(t.path) ? false : (seen.add(t.path), true)));
}

async function fetchOne(base: string, t: Target): Promise<PageAudit> {
  try {
    const res = await fetch(`${base}${t.path}`, { cache: "no-store" });
    if (!res.ok) {
      return {
        path: t.path,
        name: t.name,
        ok: false,
        title: "",
        desc: "",
        ...tally([{ id: "http", label: "Response", severity: "fail", detail: `HTTP ${res.status}.` }]),
      };
    }
    return auditHtml(t.path, t.name, await res.text());
  } catch {
    return {
      path: t.path,
      name: t.name,
      ok: false,
      title: "",
      desc: "",
      ...tally([{ id: "http", label: "Response", severity: "fail", detail: "Did not respond." }]),
    };
  }
}

/** Run the targets through fetchOne in small concurrent batches. */
async function crawl(base: string, all: Target[]): Promise<PageAudit[]> {
  const out: PageAudit[] = [];
  const size = 8;
  for (let i = 0; i < all.length; i += size) {
    const batch = all.slice(i, i + size);
    out.push(...(await Promise.all(batch.map((t) => fetchOne(base, t)))));
  }
  return out;
}

/**
 * Flag titles/descriptions reused across pages — duplicates confuse search
 * engines about which page to rank. Adds a check to each page in a dup group
 * and re-tallies its severity counts.
 */
function markDuplicates(pages: PageAudit[]) {
  const group = (get: (p: PageAudit) => string) => {
    const map = new Map<string, PageAudit[]>();
    for (const p of pages) {
      const v = get(p).toLowerCase();
      if (!v) continue;
      (map.get(v) ?? map.set(v, []).get(v)!).push(p);
    }
    return map;
  };

  const inject = (map: Map<string, PageAudit[]>, id: string, label: string, sev: Severity, noun: string) => {
    for (const dupes of map.values()) {
      if (dupes.length < 2) continue;
      const others = dupes.length - 1;
      for (const p of dupes) {
        p.checks.push({
          id,
          label,
          severity: sev,
          detail: `Same ${noun} as ${others} other page${others > 1 ? "s" : ""}.`,
        });
        Object.assign(p, tally(p.checks));
      }
    }
  };

  inject(group((p) => p.title), "dup-title", "Duplicate title", "fail", "title");
  inject(group((p) => p.desc), "dup-desc", "Duplicate description", "warn", "description");
}

async function runAudit(base: string): Promise<SiteAudit> {
  const all = await targets();
  const pages = await crawl(base, all);

  markDuplicates(pages);
  pages.sort((a, b) => b.fails - a.fails || b.warns - a.warns || a.path.localeCompare(b.path));

  return {
    base,
    pages,
    totals: {
      pages: pages.length,
      failPages: pages.filter((p) => p.fails > 0).length,
      warnPages: pages.filter((p) => p.fails === 0 && p.warns > 0).length,
      cleanPages: pages.filter((p) => p.fails === 0 && p.warns === 0).length,
    },
  };
}

/** Cached for an hour. Keyed by base URL so staging/prod don't collide. */
export function getSeoAudit(base: string): Promise<SiteAudit> {
  return unstable_cache(() => runAudit(base), ["admin-seo-audit-v1", base], {
    revalidate: 3600,
  })();
}
