import { SERVICES } from "@/lib/services";
import { LOCATIONS } from "@/lib/locations";
import { getPosts } from "@/lib/supabase";
import { SITE_URL } from "@/lib/site";

/**
 * /llms.txt — a curated, LLM-friendly map of the site (llmstxt.org proposal).
 * Generated dynamically from the same registries that drive the real pages
 * (SERVICES, LOCATIONS, published posts), so it can never drift out of sync.
 * Regenerated hourly.
 */
export const revalidate = 3600;

/** Collapse whitespace so each entry stays on one markdown line. */
const clean = (s: string) => s.replace(/\s+/g, " ").trim();

export async function GET() {
  const abs = (p: string) => `${SITE_URL}${p}`;
  const posts = await getPosts().catch(() => []);

  const lines: string[] = [
    "# Brainjar Media",
    "",
    "> Digital marketing agency in Gresham, Oregon (est. 2003) — SEO, web development, content marketing, and paid advertising for businesses across the Portland metro and East County.",
    "",
    "Brainjar Media builds measurable growth for local and national brands alike. Two decades of results, based in downtown Gresham. Contact: (503) 929-7436 · 109 N Main Ave #202, Gresham, OR 97030.",
    "",
    "## Services",
  ];

  for (const s of SERVICES) {
    lines.push(`- [${s.name}](${abs(`/services/${s.slug}`)}): ${clean(s.lede)}`);
    for (const sub of s.subs) {
      lines.push(`  - [${sub.name}](${abs(`/services/${s.slug}/${sub.slug}`)}): ${clean(sub.blurb)}`);
    }
  }

  lines.push("", "## Areas We Serve");
  for (const l of LOCATIONS) {
    lines.push(`- [${l.label}](${abs(`/locations/${l.slug}`)}): ${clean(l.description)}`);
  }

  if (posts.length) {
    lines.push("", "## Blog");
    for (const p of posts.slice(0, 100)) {
      const note = p.excerpt ? `: ${clean(p.excerpt)}` : "";
      lines.push(`- [${p.title}](${abs(`/blog/${p.slug}`)})${note}`);
    }
  }

  lines.push(
    "",
    "## Key Pages",
    `- [About](${abs("/about")}): Our story and process since 2003.`,
    `- [Portfolio](${abs("/work")}): Case studies and client results.`,
    `- [Contact](${abs("/contact")}): Book a free consultation — no obligation.`,
    ""
  );

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600",
    },
  });
}
