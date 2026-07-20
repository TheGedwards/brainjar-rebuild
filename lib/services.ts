import type { ServiceKey } from "./supabase";

/**
 * The formulary. This single array drives:
 *   - the interactive bottle shelf on the home page
 *   - the Services dropdown in the main nav (components/services-menu.tsx)
 *   - /services (the Formulary)
 *   - /services/[service] and /services/[service]/[sub] (17 pages, one template)
 *   - the portfolio filter chips
 *   - the footer service columns
 *
 * Adding a service = adding an object here. Nothing else to touch.
 *
 * GRAPHIC DESIGN was retired 2026-07-18. Retiring a service is NOT just
 * deleting the object: `/graphic-design` is a live indexed URL with a 301 in
 * next.config.ts that pointed at `/services/graphic-design`. Deleting the
 * service would have left that redirect landing on a 404, so the redirect was
 * repointed to `/services`. If you ever retire another service, repoint every
 * redirect aimed at it first.
 *
 * BOTTLE ART: all four services use the new bottle-*.png set.
 */
export type SubService = {
  slug: string;
  name: string;
  /** One-line italic hero line. */
  blurb: string;
  /** Body paragraph 1: why this piece is part of the parent prescription
   *  (not an optional add-on) — what it is and why the parent formula needs it. */
  intro: string;
  /** Body paragraph 2: how the intro turns into tangible results, plus a soft,
   *  unhurried nudge to get in touch. */
  payoff: string;
};

export type Service = {
  key: ServiceKey;
  no: string;
  slug: string;
  /** The apothecary name — what's on the label. */
  label: string;
  /** The plain name — what a client would search for. */
  name: string;
  /** Card copy on the shelf. */
  desc: string;
  /** Longer copy on /services and the service page hero. */
  lede: string;
  bottle: string;
  subs: SubService[];
};

export const SERVICES: Service[] = [
  {
    key: "seo",
    no: "01",
    slug: "seo",
    label: "SEARCH TONIC",
    name: "Search Engine Optimization",
    desc: "Our recipe for rankings is as guarded as Grandma's apple pie — and twice as effective.",
    lede: "Be found first. We reverse-engineer what your industry's leaders rank for — then out-formulate them.",
    bottle: "/assets/bottle-seo.png",
    subs: [
      {
        slug: "keyword-research",
        name: "Keyword Research",
        blurb: "We find the words your customers actually type — not the ones you wish they typed.",
        intro:
          "Before we mix a single batch of Search Engine Optimization, we take a measurement: the exact words your customers type when they go looking for what you sell. Keyword research isn't something you add to the Search Tonic — it's the reading the whole formula is calibrated against. Skip it and you can rank beautifully for phrases nobody ever searches.",
        payoff:
          "Get those words right and the rest follows in terms you can bank — the right visitors, more calls, more quotes — because your pages finally answer the questions people are actually asking. Search rankings compound quietly, month over month, so the earlier we take the reading, the more ground you gain on competitors still guessing. Whenever you're ready, we'll show you what your market is really typing into that search bar.",
      },
      {
        slug: "competitive-analysis",
        name: "Competitive Analysis",
        blurb: "We take apart what's working for the leaders in your industry, then hand you the recipe.",
        intro:
          "Competitive analysis is the diagnosis we run before adjusting your Search Engine Optimization — a clear-eyed look at your site, your market, and the competitors already ranking above you. It comes standard with the Search Tonic because you can't out-rank a rival you haven't studied. We chart what they're doing right, where they're exposed, and exactly where there's room for you to move up.",
        payoff:
          "That map turns into rankings you can measure: we press your advantage where competitors are weak and close the gaps where they're strong, so your visibility climbs on purpose rather than by luck. Every month you wait, they're compounding their head start — the sooner we study them, the sooner you begin taking that traffic back. Reach out and we'll tell you exactly where you stand today, honestly.",
      },
      {
        slug: "local-seo",
        name: "Local SEO",
        blurb: "Own the map pack. When somebody nearby needs what you sell, you're the first answer.",
        intro:
          "Local SEO is the part of the formula that puts you on the map — literally. It's bundled into your Search Tonic because most of your customers aren't searching the whole internet; they're searching their own neighborhood, and “near me” is where the decision gets made. We tune your Google Business Profile, your maps and directory listings, and your location pages so search engines know exactly who you serve and where.",
        payoff:
          "Done well, this is what turns a nearby search into someone walking through your door — the way Café Delirium landed at the top of Gresham coffee searches. Local rankings are winner-take-most, and the businesses that claim the map pack first tend to keep it, so timing matters more here than almost anywhere. Let's make sure the next person searching your street finds you, not the shop down the block.",
      },
    ],
  },
  {
    key: "web",
    no: "02",
    slug: "web-development",
    label: "SITE ELIXIR",
    name: "Web Development",
    desc: "Most sites are trampolines — visitors bounce. We build jungle gyms they climb all over.",
    lede: "Sites that visitors climb all over instead of bouncing off. Built fast, built to convert.",
    bottle: "/assets/bottle-websitedev.png",
    subs: [
      {
        slug: "website-design",
        name: "Website Design",
        blurb: "A site that looks like you spent money, and works like you spent it well.",
        intro:
          "Website design comes with your Site Elixir because a site that looks handsome but works badly is just an expensive brochure. This is the ingredient that makes everything else go down easy — intuitive navigation, a layout that carries your brand, and a look that holds up to both the eye and the scrutiny of a search engine. We work in mockups, with your feedback stirred in at every round, so the finished site feels unmistakably like you.",
        payoff:
          "Good design quietly does the selling: visitors stay longer, understand you faster, and take the next step instead of bouncing away confused. That lift shows up everywhere downstream — your ads convert better, your SEO finally has somewhere worth sending traffic, your business looks the part. First impressions online are made in seconds, so when you're ready to make yours count, we're ready to draw it up.",
      },
      {
        slug: "landing-pages",
        name: "Landing Pages",
        blurb: "One page, one job, one measurable outcome. Nowhere to wander off to.",
        intro:
          "Landing pages are built into your Site Elixir because depth is what earns rankings — and a lone homepage has none. Rather than a glorified backlink, we build content-rich pages with a job to do, each one optimized around a specific search and pointed at a specific outcome. It's how Bird Gard grew into hundreds of pages, one for every species and industry it serves.",
        payoff:
          "Each page becomes its own front door: it catches a high-intent search, keeps visitors moving deeper instead of bouncing, and quietly widens the net you cast across your market. The more of them working for you, the more ground you hold — and that footprint takes time to build, so the sooner we start, the sooner it compounds. Tell us where your best customers are searching and we'll build the pages that meet them there.",
      },
      {
        slug: "ecommerce",
        name: "E-Commerce",
        blurb: "A checkout that gets out of the way, and a catalog shoppers can actually navigate.",
        intro:
          "When you sell online, the storefront is the product experience — so e-commerce comes standard with your Site Elixir, not bolted on afterward. We build the shopping cart, the product management, and the checkout as one intuitive system that works as smoothly on a phone as on a desktop. Running a store is easier said than done; this is the part of the formula that makes it look effortless to your customer.",
        payoff:
          "The payoff is measured right at the checkout line: fewer abandoned carts, quicker purchases, and a shopping experience people actually finish. Every day spent with a clunky store is a day of orders quietly slipping away to a competitor whose checkout simply works. When you're ready to stop leaving those sales on the table, we'll show you how a store should run.",
      },
    ],
  },
  {
    key: "content",
    no: "03",
    slug: "content-marketing",
    label: "STORY SERUM",
    name: "Content Marketing",
    desc: "Honesty is the best policy — and the best marketing. We bottle your story and pour it everywhere.",
    lede: "Honest stories, told well, everywhere your customers already are. No snake oil.",
    bottle: "/assets/bottle-contentmarketing.png",
    subs: [
      {
        slug: "social-media",
        name: "Social Media",
        blurb: "A reason to follow you, published on a schedule you can live with.",
        intro:
          "Social media is woven into your Story Serum because a story only works if it's told where people already spend their time. This is the ingredient that keeps you present — a steady rhythm of custom posts and blog content that gives followers a reason to stick around. The platform never sleeps, and neither does the impression you're making on it.",
        payoff:
          "Kept up consistently, this is what turns a quiet page into an audience — the way All About Automotive went from a dozen daily viewers to thousands. That reach builds like interest: every post adds to a following that grows on its own and costs nothing to reach again. Momentum is the whole game here, so the best day to start posting with intent was months ago — the second best is today. Let's get your story in front of them.",
      },
      {
        slug: "email-campaigns",
        name: "Email Campaigns",
        blurb: "The list you already own, finally earning its keep.",
        intro:
          "Email campaigns come with your Story Serum because the list you already own is the one audience no algorithm can take away from you. Done right — genuinely useful content, clean design, the right message at the right moment — email keeps you in front of customers without renting their attention back every single time. We build the strategy around what your people actually respond to, not guesswork.",
        payoff:
          "That direct line turns into repeat business: promotions that land, events that fill, and customers who hear from you before they hear from the competition. A well-tended list is a compounding asset — one campaign built T-Sleeve's to nearly 10,000 subscribers — and it only grows more valuable the earlier you start tending it. Whenever you're ready, we'll help you turn a pile of addresses into a room full of regulars.",
      },
      {
        slug: "copywriting",
        name: "Copywriting",
        blurb: "Words that sound like you and read like they were written for one person.",
        intro:
          "Copywriting is the base every other ingredient in the Story Serum is dissolved into — the actual words on the page. It comes standard because a site can't rank, sell, or sound like you without writing that does all three at once: customized to your voice, built on real research, and threaded with the keywords that help you get found. We'll write as many pages as your story needs.",
        payoff:
          "Good copy is quietly persuasive: it holds attention, answers objections before they're spoken, and moves a reader toward doing business with you — while doubling as the fuel your SEO runs on. Words that are functional and fun to read keep working every hour your site is open, long after they're written. When you're ready to sound like the best version of your business, we're ready to put it into words.",
      },
    ],
  },
  {
    key: "paid",
    no: "04",
    slug: "paid-advertising",
    label: "SIGNAL BOOST",
    name: "Paid Advertising",
    desc: "Like a double shot of espresso for your pipeline — measured, potent, repeatable.",
    lede: "A measured boost when you need it — every dollar tracked from click to customer.",
    bottle: "/assets/bottle-paidads.png",
    subs: [
      {
        slug: "google-ppc",
        name: "Google PPC",
        blurb: "Buy the top of the page for the searches that end in a sale.",
        intro:
          "Google PPC comes standard with your Signal Boost because it's the fastest way onto the page — top placement for the searches that end in a sale, live the day we launch. Where SEO earns its rankings over months, this buys you the spot now, on a budget you set and adjust as the data comes in. It's the part of the formula built for when you can't wait to be found.",
        payoff:
          "Every dollar is tracked from click to customer, and we shift spend toward the hours and days that actually convert — maximum result, minimum waste. The catch is that your competitors are bidding on those same searches right now, and the buyers are searching today, not next quarter. When you're ready to turn the tap on, we'll build a campaign that earns its keep and prove it with the numbers.",
      },
      {
        slug: "facebook-ads",
        name: "Facebook Ads",
        blurb: "Find the people who don't know they need you yet.",
        intro:
          "Facebook ads are part of your Signal Boost because not every customer is searching for you yet — some need to meet you mid-scroll. This is the ingredient that finds them: clean, professional creative placed in front of precise demographics, with several versions tested so the strongest one carries the budget. It's how we capitalize on the hours people already spend on the feed.",
        payoff:
          "Handled well, that attention becomes traffic and leads without burning out — we rotate creative before fatigue sets in and lean into whatever's working, backed by plain-English reporting. Attention only gets more expensive over time, and campaigns tied to a moment — a launch, a season, an event — reward whoever moves first. Tell us who you're trying to reach and we'll put you in front of them while it still counts.",
      },
      {
        slug: "facebook-boosting",
        name: "Facebook Boosting",
        blurb: "Put money behind the posts that are already working.",
        intro:
          "Facebook boosting is included in your Signal Boost because your best-performing posts deserve more than the handful of people who'd see them for free. This is the ingredient that amplifies what's already resonating — highly shareable graphics and video, pushed to the right audience at the right moment for the widest reach. It's less about shouting louder and more about matching the right content with the right crowd.",
        payoff:
          "Boost the right post and it travels: engagement climbs, new audiences discover you, and a single piece of content earns attention far beyond your current following — the way Sasquatch Coffee turned humor into a fanbase. Social momentum is fleeting, though, and a post's moment passes quickly, so a boost works best applied while the iron is hot. When you've got something worth spreading, we'll make sure the right people see it.",
      },
    ],
  },
];

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);

export const getSubService = (serviceSlug: string, subSlug: string) => {
  const service = getService(serviceSlug);
  const sub = service?.subs.find((s) => s.slug === subSlug);
  return service && sub ? { service, sub } : null;
};

/** Short labels for the portfolio filter chips and project cards. */
export const SERVICE_CHIPS: Record<ServiceKey, string> = {
  seo: "SEO",
  web: "WEB",
  content: "CONTENT",
  paid: "PAID ADS",
  design: "DESIGN",
};

export const CATEGORY_LABELS = {
  "corporation": "Corporations",
  "organization": "Organizations",
  "local-business": "Local Business",
  "public-event": "Public Events",
} as const;
