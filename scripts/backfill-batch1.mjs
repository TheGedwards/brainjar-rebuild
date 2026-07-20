/**
 * Portfolio backfill — batch 1 (6 clients).
 *   node scripts/backfill-batch1.mjs
 *
 * Reads .env.local. Idempotent. For each entry: optional screenshot upload,
 * apothecary copy, services, binomial, website_url, auto-publish.
 * Screenshots live in scratchpad/shots/{slug}.png; useShot=false -> initials
 * fallback. setWebsite=false -> no habitat link (e.g. a lapsed/hijacked domain).
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const SHOTS = new URL("../../../AppData/Local/Temp/claude/C--Users-guyed-Downloads-Brainjar/f24b7ee8-6c38-4b27-8ae7-f215cc5c3403/scratchpad/shots/", import.meta.url);
// Absolute path is simpler/robust on Windows:
const SHOTS_DIR = "C:/Users/guyed/AppData/Local/Temp/claude/C--Users-guyed-Downloads-Brainjar/f24b7ee8-6c38-4b27-8ae7-f215cc5c3403/scratchpad/shots";

const DATA = [
  {
    slug: "bird-gard", website: "https://birdgard.com", useShot: true,
    services: ["web"], binomial: "Custos avium",
    tagline: "Bird control that pays for itself.",
    summary: "Bird Gard makes electronic bird-control devices that protect crops, equipment, and buildings from pest birds — field-proven bioacoustics sold to growers and facilities the world over.",
    challenge: "Bird Gard needed a site that could explain a technical product to a dozen different audiences at once — and turn a curious grower into a phone call.",
    approach: "We built a content-rich site with dedicated landing pages for specific crops, pest species, and industries, so every search found its own answer. Contact prompts and clear directions to the support center run throughout.",
    outcome: "The depth pulled in a larger, better-targeted audience organically, and the redesigned site turned browsers into callers.",
  },
  {
    slug: "cafe-delirium", website: null, useShot: false,
    services: ["web", "seo", "content"], binomial: "Elixir vigilantiae",
    tagline: "The corner coffee house, found first.",
    summary: "Café Delirium is a cozy independent coffee house in downtown Gresham, Oregon — a local fixture up against both chains and neighbors for every cup.",
    challenge: "In a crowded coffee market, the café needed to stand out in local search and look as inviting online as it did across the counter.",
    approach: "We rebuilt the site to put the essentials — hours, location, phone — on every page, then went to work on reputation, steadily growing reviews across Google, Yelp, and TripAdvisor.",
    outcome: "Café Delirium climbed in local results and let a wall of genuine reviews do the differentiating.",
  },
  {
    slug: "mr-geek", website: "https://mr-geek.com", useShot: false,
    services: ["web", "content", "seo"], binomial: "Medicus machinarum",
    tagline: "Searched by symptom, found by name.",
    summary: "Mr. Geek repairs smartphones, tablets, and laptops across the Portland metro — walk-in fixes for cracked screens, dead batteries, and worse.",
    challenge: "A newly launched site needed organic traffic fast, in an industry where people search for a problem, not a company.",
    approach: "Keyword research showed customers search their symptoms — “iPhone won't charge,” “Galaxy Note screen” — so we built landing pages for specific repairs and service-area pages across the west metro.",
    outcome: "Those symptom-matched pages met high-intent searchers exactly where they were, and built the confidence to walk in the door.",
  },
  {
    slug: "sasquatch-coffee", website: "https://squatchcoffee.com", useShot: true,
    services: ["seo", "paid", "web"], binomial: "Cafea cryptozoica",
    tagline: "Bold coffee, boldly sold.",
    summary: "The Sasquatch Coffee Company roasts small-batch beans and ships them nationwide — bold coffee for people who believe in adventure (and maybe in Bigfoot).",
    challenge: "Sasquatch had a great logo and a good product, but a competitive market and an e-commerce checkout shoppers kept abandoning.",
    approach: "We put their logo to work across promotional pieces to build recognition, and streamlined the store on one principle: the simpler and shorter the checkout, the more orders finish.",
    outcome: "Cart abandonment fell and completed online transactions rose.",
  },
  {
    slug: "tikipets", website: "https://tikipets.com", useShot: true,
    services: ["web"], binomial: "Deliciae quadrupedum",
    tagline: "Gourmet food, findable on any shelf.",
    summary: "Tiki Pets makes gourmet, human-grade food for cats and dogs — premium nutrition with a devoted following and a growing retail footprint.",
    challenge: "They needed a site that could show off the quality of the food and help shoppers find it on a shelf nearby.",
    approach: "We built a highly searchable catalog with nutrition front-and-center on every product, plus a store locator that finds the nearest retailer and maps the way there.",
    outcome: "Shoppers could vet the food and act on it in the same visit — from “is this good enough for my pet?” to “here's where to buy it.”",
  },
  {
    slug: "wildwoods-pest-control", website: "https://wildwoodspestcontrol.com", useShot: true,
    services: ["seo"], binomial: "Venator pestium",
    tagline: "First to rank when the pests show up.",
    summary: "Wildwoods Pest Control keeps homes and businesses across the Portland metro pest-free, out of Eagle Creek, Oregon — with a five-star reputation earned one visit at a time.",
    challenge: "Wildwoods needed to stand out in a crowded local market and be found the moment someone discovered an infestation.",
    approach: "We ran deep keyword research into how people actually describe their pest problems, then optimized around those terms and tightened local SEO to widen their Google footprint.",
    outcome: "Wildwoods took dominant rankings for pest queries and grew its customer base on the strength of search.",
  },
];

async function one(e) {
  const { data: proj } = await db.from("projects").select("id, client_id").eq("slug", e.slug).maybeSingle();
  if (!proj) { console.warn(`SKIP ${e.slug}: no project`); return; }

  let hero;
  if (e.useShot) {
    const bytes = readFileSync(`${SHOTS_DIR}/${e.slug}.png`);
    const path = `portfolio/${e.slug}.png`;
    const up = await db.storage.from("media").upload(path, bytes, { contentType: "image/png", upsert: true });
    if (up.error) throw up.error;
    hero = db.storage.from("media").getPublicUrl(path).data.publicUrl;
  }

  const patch = {
    tagline: e.tagline, summary: e.summary, challenge: e.challenge,
    approach: e.approach, outcome: e.outcome, services: e.services,
    binomial: e.binomial, is_published: true, updated_at: new Date().toISOString(),
  };
  if (e.useShot) patch.hero_image_url = hero;

  const { error } = await db.from("projects").update(patch).eq("id", proj.id);
  if (error) throw error;

  if (e.website) await db.from("clients").update({ website_url: e.website }).eq("id", proj.client_id);

  console.log(`OK ${e.slug.padEnd(24)} shot=${e.useShot ? "yes" : "initials"} site=${e.website ? "yes" : "none"}`);
}

for (const e of DATA) {
  try { await one(e); } catch (err) { console.error(`FAIL ${e.slug}:`, err.message); }
}
console.log("\nBatch 1 done.");
