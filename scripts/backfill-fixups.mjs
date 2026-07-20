/**
 * Portfolio fixups — corrected domains found during the client's spot-check.
 *   node scripts/backfill-fixups.mjs
 * Append entries as more corrections come in. useShot uploads shots/{slug}.png.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const SHOTS_DIR = "C:/Users/guyed/AppData/Local/Temp/claude/C--Users-guyed-Downloads-Brainjar/f24b7ee8-6c38-4b27-8ae7-f215cc5c3403/scratchpad/shots";

const FIX = [
  { slug: "dr-della-parker", website: "https://stellarhw.com", useShot: true },   // rebranded to Stellar Health & Wellness
  { slug: "roedel-tile", website: "https://roedeltile.com", useShot: true },       // correct domain (was rodeltile.com)
  { slug: "cindys-window-fashions", website: "https://www.cindyswindowfashions.com", useShot: false }, // Cloudflare-walled; link only
];

for (const e of FIX) {
  try {
    const { data: proj } = await db.from("projects").select("id, client_id").eq("slug", e.slug).maybeSingle();
    if (!proj) { console.warn(`SKIP ${e.slug}: no project`); continue; }
    const patch = { updated_at: new Date().toISOString() };
    if (e.useShot) {
      const path = `portfolio/${e.slug}.png`;
      const up = await db.storage.from("media").upload(path, readFileSync(`${SHOTS_DIR}/${e.slug}.png`), { contentType: "image/png", upsert: true });
      if (up.error) throw up.error;
      patch.hero_image_url = db.storage.from("media").getPublicUrl(path).data.publicUrl;
    }
    await db.from("projects").update(patch).eq("id", proj.id);
    if (e.website) await db.from("clients").update({ website_url: e.website }).eq("id", proj.client_id);
    console.log(`OK ${e.slug.padEnd(26)} shot=${e.useShot ? "yes" : "keep"} site=${e.website}`);
  } catch (err) { console.error(`FAIL ${e.slug}:`, err.message); }
}
console.log("Fixups done.");
