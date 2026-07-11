import type { ServiceKey } from "./supabase";

/**
 * The formulary. This single array drives:
 *   - the interactive bottle shelf on the home page
 *   - /services (the Formulary)
 *   - /services/[service] and /services/[service]/[sub] (17 pages, one template)
 *   - the portfolio filter chips
 *   - the footer service columns
 *
 * Adding a service = adding an object here. Nothing else to touch.
 *
 * NOTE ON GRAPHIC DESIGN: the mockup shelves four bottles; the live site sells
 * five. Graphic Design is included below (No. 05) because it has a live indexed
 * page at /graphic-design/ that we're 301ing, and you sent the bottle art. If
 * you'd rather retire it, delete this one object — the shelf, the formulary and
 * the redirect target all fall back gracefully to four.
 */
export type SubService = {
  slug: string;
  name: string;
  blurb: string;
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
    bottle: "/assets/bottleseo.png",
    subs: [
      {
        slug: "keyword-research",
        name: "Keyword Research",
        blurb: "We find the words your customers actually type — not the ones you wish they typed.",
      },
      {
        slug: "competitive-analysis",
        name: "Competitive Analysis",
        blurb: "We take apart what's working for the leaders in your industry, then hand you the recipe.",
      },
      {
        slug: "local-seo",
        name: "Local SEO",
        blurb: "Own the map pack. When somebody nearby needs what you sell, you're the first answer.",
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
    bottle: "/assets/bottlewebdev.png",
    subs: [
      {
        slug: "website-design",
        name: "Website Design",
        blurb: "A site that looks like you spent money, and works like you spent it well.",
      },
      {
        slug: "landing-pages",
        name: "Landing Pages",
        blurb: "One page, one job, one measurable outcome. Nowhere to wander off to.",
      },
      {
        slug: "ecommerce",
        name: "E-Commerce",
        blurb: "A checkout that gets out of the way, and a catalog shoppers can actually navigate.",
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
    bottle: "/assets/bottlecontentmktg.png",
    subs: [
      {
        slug: "social-media",
        name: "Social Media",
        blurb: "A reason to follow you, published on a schedule you can live with.",
      },
      {
        slug: "email-campaigns",
        name: "Email Campaigns",
        blurb: "The list you already own, finally earning its keep.",
      },
      {
        slug: "copywriting",
        name: "Copywriting",
        blurb: "Words that sound like you and read like they were written for one person.",
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
    bottle: "/assets/bottlepaidads.png",
    subs: [
      {
        slug: "google-ppc",
        name: "Google PPC",
        blurb: "Buy the top of the page for the searches that end in a sale.",
      },
      {
        slug: "facebook-ads",
        name: "Facebook Ads",
        blurb: "Find the people who don't know they need you yet.",
      },
      {
        slug: "facebook-boosting",
        name: "Facebook Boosting",
        blurb: "Put money behind the posts that are already working.",
      },
    ],
  },
  {
    key: "design",
    no: "05",
    slug: "graphic-design",
    label: "MARK & SEAL",
    name: "Graphic Design",
    desc: "A logo is a signature. We make yours worth signing.",
    lede: "Identity, packaging and print — the part of the brand people can hold.",
    bottle: "/assets/bottlegraphicdesign.png",
    subs: [],
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
