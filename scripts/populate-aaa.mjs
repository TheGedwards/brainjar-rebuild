/**
 * One-off: hand-populate the All About Automotive specimen so we can see the
 * full /work/[slug] plate on staging before automating the other 32.
 *
 *   node scripts/populate-aaa.mjs
 *
 * Reads .env.local for NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 * Idempotent: re-running overwrites the same fields and re-inserts the 2 stats.
 *
 * NOTE: the two metrics are ILLUSTRATIVE, derived from the old site's own
 * claims ("a dozen daily viewers to thousands", "one of the top automotive
 * blogs in the country"). Confirm or clear them before launch — per CLAUDE.md
 * we don't ship invented numbers.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// --- env ---
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing Supabase env in .env.local");

const db = createClient(url, key, { auth: { persistSession: false } });
const SLUG = "all-about-automotive";
const SCREENSHOT =
  "C:/Users/guyed/AppData/Local/Temp/claude/C--Users-guyed-Downloads-Brainjar/f24b7ee8-6c38-4b27-8ae7-f215cc5c3403/scratchpad/aaa.png";

const copy = {
  title: "All About Automotive",
  tagline: "The neighborhood repair shop that out-blogged the whole industry.",
  summary:
    "All About Automotive is a full-service auto repair shop in Gresham, Oregon — the kind of trusted, independent garage a town quietly runs on. They came to us to be found by the drivers who didn't already know them.",
  challenge:
    "A loyal following kept the bays full, but almost none of it came from the web. Their real expertise lived in the shop and in a blog nobody was reading — invisible to the thousands of nearby drivers searching for a mechanic they could trust.",
  approach:
    "We made their blog the engine. Every post was broadcast across local and national channels, each piece matched to the audience most likely to share it, so the shop's own hard-won knowledge did the marketing for them.",
  outcome:
    "The blog grew into one of the most-read automotive journals in the country, climbing from a dozen readers a day to thousands. Local search traction rose alongside it — and new customers started arriving already convinced.",
  year: 2014,
  services: ["seo", "content"],
  binomial: "Officina reparandi",
};

const stats = [
  { value: "1,000s", label: "DAILY BLOG READERS", is_headline: true, sort_order: 0 },
  { value: "Top-Ranked", label: "U.S. AUTO BLOG", is_headline: false, sort_order: 1 },
];

async function main() {
  // locate project + client
  const { data: proj, error: e0 } = await db
    .from("projects")
    .select("id, client_id, slug")
    .eq("slug", SLUG)
    .maybeSingle();
  if (e0) throw e0;
  if (!proj) throw new Error(`No project with slug ${SLUG}`);
  console.log("project:", proj.id, "client:", proj.client_id);

  // upload screenshot -> media bucket
  const bytes = readFileSync(SCREENSHOT);
  const path = `portfolio/${SLUG}.png`;
  const up = await db.storage
    .from("media")
    .upload(path, bytes, { contentType: "image/png", upsert: true });
  if (up.error) throw up.error;
  const hero = db.storage.from("media").getPublicUrl(path).data.publicUrl;
  console.log("hero_image_url:", hero);

  // update project (without binomial first, so a pre-migration DB still works)
  const { error: e1 } = await db
    .from("projects")
    .update({
      title: copy.title,
      tagline: copy.tagline,
      summary: copy.summary,
      challenge: copy.challenge,
      approach: copy.approach,
      outcome: copy.outcome,
      year: copy.year,
      services: copy.services,
      hero_image_url: hero,
      is_published: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", proj.id);
  if (e1) throw e1;
  console.log("project copy + hero updated");

  // binomial (needs specimen.sql). Attempt separately so a missing column
  // doesn't roll back the rest.
  const bin = await db.from("projects").update({ binomial: copy.binomial }).eq("id", proj.id);
  if (bin.error) console.warn("binomial NOT set (run supabase/specimen.sql):", bin.error.message);
  else console.log("binomial set:", copy.binomial);

  // client website so the footer habitat link renders
  const { error: e2 } = await db
    .from("clients")
    .update({ website_url: "https://allaboutautomotive.com", city: "Gresham, OR" })
    .eq("id", proj.client_id);
  if (e2) throw e2;
  console.log("client website_url set");

  // stats: clear + insert the two metrics
  await db.from("project_stats").delete().eq("project_id", proj.id);
  const { error: e3 } = await db
    .from("project_stats")
    .insert(stats.map((s) => ({ ...s, project_id: proj.id })));
  if (e3) throw e3;
  console.log("2 metrics inserted");

  console.log("\nDone. Visit /work/all-about-automotive");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
