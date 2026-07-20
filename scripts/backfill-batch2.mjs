/**
 * Portfolio backfill — batch 2 (the remaining 22 clients).
 *   node scripts/backfill-batch2.mjs
 *
 * Idempotent. useShot uploads scratchpad/shots/{slug}.png; false -> initials
 * fallback (site down / bot-walled / hijacked). website:null -> no habitat link
 * (used for dead domains and, critically, two domains now hosting gambling/scam
 * sites — skyland-pub, and cafe-delirium in batch 1).
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

const DATA = [
  { slug: "bend-kitty-lodge", website: "https://bendkittylodgeoregon.com", useShot: true, services: ["web","content","seo"], binomial: "Hospitium felium",
    tagline: "Luxury boarding, for cats only.",
    summary: "Bend Kitty Lodge is a cats-only luxury boarding house in Bend, Oregon — climbing structures, window seats, and deluxe suites for the discerning feline.",
    challenge: "In a market full of general pet boarders, the Lodge needed cat owners to find the one place built entirely around cats.",
    approach: "We rebuilt their search presence from the ground up, researching how cat owners actually look for boarding and optimizing the site around those exact terms.",
    outcome: "The Lodge climbed the rankings for cat-boarding searches, well ahead of where the old site had left it." },

  { slug: "brainwave-computers", website: "https://brainwavepc.com", useShot: true, services: ["seo","web","content"], binomial: "Machina cerebri",
    tagline: "The one-stop tech shop, easy to find.",
    summary: "BrainWave Computers builds, sells, and repairs laptops and desktops out of the Portland metro — a full-service tech shop for home and business.",
    challenge: "BrainWave needed a modern look and a local presence that would put them in front of nearby customers searching for repairs.",
    approach: "We redesigned the site with brighter graphics and cleaner branding, then targeted everyday PC-repair searches with local SEO across the metro.",
    outcome: "A refreshed brand and local visibility connected BrainWave with the area customers already looking for exactly what they do." },

  { slug: "cindys-window-fashions", website: "https://cindyswindowfashions.com", useShot: false, services: ["content","paid"], binomial: "Ornamenta fenestrae",
    tagline: "Custom window coverings, wider reach.",
    summary: "Cindy's Window Fashions designs, fits, and installs high-end custom window coverings — a boutique operation with a craftsman's reputation.",
    challenge: "Cindy's needed a bigger online audience without diluting the boutique feel.",
    approach: "We stood up an external blog that funnels readers back to the main site, kept it fed with weekly posts and social shares, and ran targeted Facebook and Google ad campaigns.",
    outcome: "Steady content plus paid reach widened Cindy's audience and kept the brand in front of shoppers planning a remodel." },

  { slug: "dr-della-parker", website: null, useShot: false, services: ["web","content","paid"], binomial: "Medica naturae",
    tagline: "A naturopath's practice, grown online.",
    summary: "Dr. Della Parker is a naturopathic physician in Clackamas, Oregon, who came to us to grow her practice by building an audience online.",
    challenge: "She needed a stronger digital presence — and a steady way to reach the right patients.",
    approach: "We built a refreshed site and brand, then worked with her on medically-sound blog content and Facebook advertising to put it in front of a relevant local audience.",
    outcome: "A clearer brand and paid social reach expanded her audience and her practice's visibility." },

  { slug: "frenzi-frozen-yogurt", website: "https://frenzifrozenyogurt.com", useShot: true, services: ["web","content","seo"], binomial: "Gelidum delirium",
    tagline: "Froyo the whole town keeps coming back for.",
    summary: "Frenzi is a self-serve frozen yogurt and milkshake shop in downtown Gresham — a bright, sprinkle-covered neighborhood favorite.",
    challenge: "Frenzi needed an online presence that drove both website visits and real foot traffic through the door.",
    approach: "We built a new site as the hub, then kept Gresham in the loop with a steady rhythm of Facebook posts and blog updates — flavors, promotions, reasons to come back.",
    outcome: "Consistent local content turned online attention into in-store visits." },

  { slug: "gresham-center-for-the-arts", website: "https://greshamcenterforthearts.org", useShot: true, services: ["web","seo","content"], binomial: "Mecaenas artium",
    tagline: "A hub for the arts in East County.",
    summary: "The Gresham Center for the Arts is a nonprofit that funds and champions art events and opportunities in Gresham and beyond.",
    challenge: "The organization needed better visibility and a way to coordinate a scattered community of events and coordinators.",
    approach: "We designed a site built around an active community arts calendar, with a simple page any coordinator can use to publish their own event to the public.",
    outcome: "The calendar made the Center the region's arts hub — and cut the staff's administrative load." },

  { slug: "health-plans-in-oregon", website: "https://healthplansinoregon.com", useShot: true, services: ["paid","content","seo","web"], binomial: "Custos salutis",
    tagline: "Found first when enrollment opens.",
    summary: "Health Plans in Oregon is an insurance agency offering free enrollment help to Oregonians navigating public and private health coverage.",
    challenge: "Too many visitors bounced off the homepage before reaching help — and the agency needed to surge visibility during enrollment windows.",
    approach: "We rebuilt the homepage to funnel visitors toward the plan pages, refreshed the brand, and ran targeted paid campaigns timed to peak enrollment demand.",
    outcome: "A clearer path and well-timed ads kept more visitors moving toward the help they came for." },

  { slug: "hood-gorge", website: "https://hood-gorge.com", useShot: true, services: ["web","content"], binomial: "Vocatio montium",
    tagline: "The Gorge, made trip-ready.",
    summary: "Experience Mt. Hood & the Gorge is a Travel Oregon regional initiative promoting the Mt. Hood and Columbia River Gorge to visitors.",
    challenge: "The initiative needed a fresh, mobile-friendly site that could sell the region while staying on Travel Oregon's brand.",
    approach: "We built a current, mobile-first site to the agency's style standards, then went beyond looks with real itineraries — hiking, dining, skiing, wine — that turn a browser into a trip-planner.",
    outcome: "The site became a practical planning resource, not just a pretty brochure." },

  { slug: "jim-neill-golf-tournament", website: null, useShot: false, services: ["web","seo","content"], binomial: "Ludus caritatis",
    tagline: "Registration that runs itself.",
    summary: "The Jim Neill Memorial Foundation runs an annual charity golf tournament at Eastmoreland in Portland, with proceeds to selected 501(c)(3) charities.",
    challenge: "The foundation needed dependable online registration that worked on every browser and device — and more golfers signing up.",
    approach: "We built a custom registration platform that handled sign-ups and tied directly into their banking and bookkeeping for a fully automated flow, then drove registrations with SEO and email.",
    outcome: "A hands-off registration system, plus search and email, kept the field full year over year." },

  { slug: "laser-smooth-company", website: "https://lasersmoothcompany.com", useShot: true, services: ["web","seo","content"], binomial: "Levigatio cutis",
    tagline: "The case for laser, made in search.",
    summary: "Laser Smooth Company runs a laser hair-removal clinic in Gresham, Oregon, competing against every other way people try to remove hair.",
    challenge: "The clinic needed to stand out in search and win the argument for laser over the alternatives.",
    approach: "We built informative pages — FAQs, testimonials, before-and-afters, procedure explainers — plus comparison content making the case for laser, and kept a weekly blog feeding search.",
    outcome: "Educational content and steady blogging lifted visibility for laser hair-removal searches and built first-timers' confidence." },

  { slug: "little-genius-montessori", website: null, useShot: false, services: ["seo","web"], binomial: "Ingenium parvulorum",
    tagline: "Outranked four rivals in thirty days.",
    summary: "Little Genius Montessori is an educational childcare in Gresham for infants, toddlers, and young children.",
    challenge: "The school faced an enrollment deadline and needed visibility fast.",
    approach: "We redesigned the site around local search, targeting the exact terms Gresham parents use to find childcare, and kept a blog running to hold the ground we gained.",
    outcome: "Within 30 days of launch, Little Genius outranked four Montessori competitors and a slew of local daycares." },

  { slug: "paesano-bocce-club", website: "https://paesanobocceclub.com", useShot: true, services: ["web","seo"], binomial: "Sodalitas bocciae",
    tagline: "Old-world club, modern league.",
    summary: "Paesano Bocce Club is a Gresham bocce organization where teams compete on natural-surface courts — equal parts heritage and active league.",
    challenge: "The club needed branding and a site that captured both its history and its living, week-to-week competition.",
    approach: "We designed a logo drawn from classic sports emblems, then built a site that tells the club's story while keeping schedule, standings, and rules easy to update.",
    outcome: "Paesano reads as both a storied institution and an active league — and the standings stay current without a fuss." },

  { slug: "retro-hypno", website: "https://retrohypno.com", useShot: true, services: ["web","paid"], binomial: "Somnus jocosus",
    tagline: "All-ages comedy hypnosis, booked with ease.",
    summary: "Retro Hypno performs comedy hypnosis shows for all ages, venues, and organizations — theater-grade entertainment with a professional edge.",
    challenge: "The act needed a site that felt like showbiz while still reading as credible and easy to book.",
    approach: "We built a site with a theater's look and feel, leaned on video from past shows and audience testimonials, and stripped the contact process down to one simple inquiry form.",
    outcome: "Prospective bookers could feel the show and reach out in a single click." },

  { slug: "roedel-tile", website: null, useShot: false, services: ["web","seo"], binomial: "Ars tegularum",
    tagline: "A century of tile, made searchable.",
    summary: "Roedel Tile, founded in 1920, is one of the region's largest commercial tile contractors — family-owned, with work in landmarks from Starbucks to OSU's Memorial Union.",
    challenge: "A century-old firm needed a modern presence that still honored its heritage and reputation.",
    approach: "We built a site in sepia tones with a timeless logo, and took an unusual SEO tack — optimizing around Roedel's completed landmark projects rather than generic industry keywords.",
    outcome: "The brand's real credibility — its body of work — became the thing people could actually find." },

  { slug: "ron-morehead", website: "https://ronmorehead.com", useShot: true, services: ["web","seo","content"], binomial: "Vox ferarum",
    tagline: "One name, one home for the research.",
    summary: "Ron Morehead is an author and researcher known worldwide for the Sierra Sounds — the only Bigfoot recordings scientifically studied and accredited as genuine.",
    challenge: "His recordings were more famous than he was, and his work was scattered across three separate websites.",
    approach: "We consolidated all three into one platform built around Morehead himself, unifying his established work and new research under a single brand.",
    outcome: "A cohesive home raised his profile and brought in more requests from media and fellow researchers." },

  { slug: "sand-in-the-city", website: null, useShot: false, services: ["web","content"], binomial: "Sculptor harenae",
    tagline: "A charity spectacle, run like clockwork.",
    summary: "Sand in the City was an annual Portland fundraiser for children's charities, where corporate teams built sand sculptures in Pioneer Courthouse Square.",
    challenge: "The event needed a public face and a serious back end to run hundreds of volunteers, vendors, and donations.",
    approach: "We built a dual-purpose platform — a community-facing site out front, and behind it the machinery to organize volunteers and vendors and track every donation.",
    outcome: "Across three years together, the event set records for both attendance and donations." },

  { slug: "skyland-pub", website: null, useShot: false, services: ["web","seo","content","paid"], binomial: "Taberna sportiva",
    tagline: "The Troutdale sports bar, found first.",
    summary: "Skyland Pub is a beloved sports bar in the Troutdale, Oregon area — big screens, good food, and a full slate of games.",
    challenge: "Skyland needed a modern site and had to win local search in a competitive sports-bar market.",
    approach: "We led with the pub's entertainment and menu on the homepage, ran local SEO for Troutdale across Google and Yelp, and strengthened their Facebook presence for regular engagement.",
    outcome: "Local optimization put Skyland in front of nearby fans looking for somewhere to catch the game." },

  { slug: "stonebridge-mortgage-group", website: "https://stone-bridge.com", useShot: true, services: ["web","content"], binomial: "Pons lapideus",
    tagline: "A trusted lender, in steady touch.",
    summary: "Stonebridge Mortgage Group provides mortgage and loan financing across Oregon and Washington — independent, and built on trust.",
    challenge: "Stonebridge wanted a refreshed site aligned to its brand and a better way to stay close to its existing clients.",
    approach: "We redesigned the site to match their identity, launched a monthly newsletter to keep past and present clients engaged, and shared homeownership tips through their Facebook page.",
    outcome: "A polished presence plus consistent outreach kept Stonebridge top-of-mind with clients and prospects alike." },

  { slug: "student-crossword-puzzles", website: null, useShot: false, services: ["web","content"], binomial: "Ludus litterarum",
    tagline: "Brand recognition that points to the sale.",
    summary: "Student Crossword Puzzles makes educational puzzle books for K-12 students, teaching everything from math to geography through pop-culture clues.",
    challenge: "Sales happened entirely on Amazon, so the site and social had to build the brand and drive traffic — not process transactions.",
    approach: "We redesigned the site and created new book-cover art, then featured that art consistently across the site, Facebook, and Amazon to unify the brand and steer buyers to the shelf that actually sells.",
    outcome: "One recognizable look across every platform pointed customers straight to Amazon to buy." },

  { slug: "the-hoppy-brewer", website: "https://oregonshoppyplace.com", useShot: true, services: ["web","content","seo"], binomial: "Cerevisia lupuli",
    tagline: "Taproom and homebrew, both promoted.",
    summary: "The Hoppy Brewer is a Gresham beer destination — taproom, homebrew supplies, and packaged beer under one roof.",
    challenge: "Two businesses in one needed promoting at once, in a competitive local beer market.",
    approach: "We built a cohesive site, split the content to target the taproom and the supply shop separately, and used Facebook ads to push tasting events and live music toward the door.",
    outcome: "Search visibility plus social buzz connected online locals with the brick-and-mortar taproom." },

  { slug: "west-columbia-gorge-chamber-of-commerce", website: "https://westcolumbiagorgechamber.com", useShot: true, services: ["web","content","seo"], binomial: "Concilium mercatorum",
    tagline: "One hub for members and visitors.",
    summary: "The West Columbia Gorge Chamber promotes tourism and business across western Oregon's Columbia River Gorge.",
    challenge: "The Chamber needed to grow membership and give locals and visitors one place to find regional events and businesses.",
    approach: "We built a polished site with a member business directory that rewards joining, plus a unified calendar for networking, tourism, educational, and civic events.",
    outcome: "The site pulled the region's events and businesses into a single, easy resource — serving members and visitors at once." },

  { slug: "zipline-x", website: "https://ziplinex.com", useShot: true, services: ["web","content","seo"], binomial: "Volatus per silvam",
    tagline: "A brand of its own, and a reputation to match.",
    summary: "ZiplineX runs the most popular zip-lining tour in Washington, about 45 minutes from Portland.",
    challenge: "Operating under its parent company, ZiplineX needed to stand on its own as an independent, promotable brand.",
    approach: "We redesigned the site, rewrote the marketing copy, and leaned into review aggregation and reputation management to lift search and tourism-platform visibility.",
    outcome: "ZiplineX established a distinct identity, separate from its parent, with the reviews to back it up." },
];

async function one(e) {
  const { data: proj } = await db.from("projects").select("id, client_id").eq("slug", e.slug).maybeSingle();
  if (!proj) { console.warn(`SKIP ${e.slug}: no project`); return; }
  const patch = {
    tagline: e.tagline, summary: e.summary, challenge: e.challenge, approach: e.approach,
    outcome: e.outcome, services: e.services, binomial: e.binomial,
    is_published: true, updated_at: new Date().toISOString(),
  };
  if (e.useShot) {
    const path = `portfolio/${e.slug}.png`;
    const up = await db.storage.from("media").upload(path, readFileSync(`${SHOTS_DIR}/${e.slug}.png`), { contentType: "image/png", upsert: true });
    if (up.error) throw up.error;
    patch.hero_image_url = db.storage.from("media").getPublicUrl(path).data.publicUrl;
  }
  const { error } = await db.from("projects").update(patch).eq("id", proj.id);
  if (error) throw error;
  if (e.website) await db.from("clients").update({ website_url: e.website }).eq("id", proj.client_id);
  console.log(`OK ${e.slug.padEnd(40)} shot=${e.useShot ? "yes" : "initials"} site=${e.website ? "yes" : "none"}`);
}

for (const e of DATA) {
  try { await one(e); } catch (err) { console.error(`FAIL ${e.slug}:`, err.message); }
}
console.log("\nBatch 2 done.");
