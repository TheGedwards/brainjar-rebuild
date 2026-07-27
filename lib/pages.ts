/**
 * Registry of editable marketing pages and their copy "slots". Pure data (no
 * server imports) so the admin editor (client) and the public pages (server)
 * can both read it. Defaults are the exact current copy — until someone edits a
 * field, the site renders identically.
 *
 * Slot types:
 *   text     — single line
 *   textarea — multi-line running copy
 *   heading  — supports *word* for the tincture accent and a new line for <br>
 *              (see renderHeading in lib/render-copy.tsx)
 */

import type { ServiceKey } from "./supabase";
import { SERVICES } from "./services";
import { LOCATIONS } from "./locations";

export type SlotType = "text" | "textarea" | "heading" | "faq";
export type Slot = { key: string; label: string; type: SlotType; default: string; hint?: string };
export type PageType = "marketing" | "service" | "subservice" | "location";
export type PageDef = {
  key: string;
  path: string;
  name: string;
  type: PageType;
  slots: Slot[];
  /** service + sub-service pages: which service they belong to (grouping). */
  serviceKey?: ServiceKey;
  /** sub-service pages: parent service display name. */
  parentName?: string;
};

const HEADING_HINT = "Wrap a word in *asterisks* for the accent color; a new line becomes a line break.";

const MARKETING_PAGES: Omit<PageDef, "type">[] = [
  {
    key: "home",
    path: "/",
    name: "Home",
    slots: [
      { key: "hero_eyebrow", label: "Hero eyebrow", type: "text", default: "A Digital Apothecary for Ambitious Brands" },
      { key: "hero_heading", label: "Hero heading", type: "heading", default: "Remedies for the\n*Undiscovered* Brand", hint: HEADING_HINT },
      { key: "hero_subhead", label: "Hero subhead", type: "textarea", default: "We diagnose what ails your website, then distill SEO, design & content into growth your competition can’t replicate." },
    ],
  },
  {
    key: "about",
    path: "/about",
    name: "About",
    slots: [
      { key: "hero_eyebrow", label: "Hero eyebrow", type: "text", default: "Est. 2003 · Downtown Gresham" },
      { key: "hero_heading", label: "Hero heading", type: "heading", default: "Twenty Years\n*Behind the Counter*", hint: HEADING_HINT },
      { key: "hero_subhead", label: "Hero subhead", type: "textarea", default: "We’ve worked for Intel, Microsoft, NASCAR and Pendleton Woolen Mills. We’ve also worked for the pub on Main Street. Both got the same attention, and neither got a template." },
    ],
  },
  {
    key: "services",
    path: "/services",
    name: "Services",
    slots: [
      { key: "hero_eyebrow", label: "Hero eyebrow", type: "text", default: "The Formulary" },
      { key: "hero_heading", label: "Hero heading", type: "heading", default: "Our Remedies", hint: HEADING_HINT },
      { key: "hero_subhead", label: "Hero subhead", type: "textarea", default: "Proven compounds, mixed to order. Rarely taken alone — we’ll write the combination your goals call for." },
    ],
  },
  {
    key: "contact",
    path: "/contact",
    name: "Contact",
    slots: [
      { key: "hero_eyebrow", label: "Hero eyebrow", type: "text", default: "Take as Directed" },
      { key: "hero_heading", label: "Hero heading", type: "heading", default: "Get a Diagnosis", hint: HEADING_HINT },
      { key: "hero_subhead", label: "Hero subhead", type: "textarea", default: "More leads, calls, foot traffic or sales — tell us the symptom, we’ll mix the cure. The consultation is free." },
    ],
  },
  {
    key: "work",
    path: "/work",
    name: "Portfolio (index)",
    slots: [
      { key: "hero_eyebrow", label: "Hero eyebrow", type: "text", default: "The Medicine Cabinet" },
      { key: "hero_heading", label: "Hero heading", type: "heading", default: "Proof, Bottled", hint: HEADING_HINT },
      { key: "hero_subhead", label: "Hero subhead", type: "textarea", default: "Every jar on this shelf holds a result we can show you." },
    ],
  },
  {
    key: "blog",
    path: "/blog",
    name: "Blog (index)",
    slots: [
      { key: "hero_eyebrow", label: "Hero eyebrow", type: "text", default: "Notes from the Dispensary" },
      { key: "hero_heading", label: "Hero heading", type: "heading", default: "The Blog", hint: HEADING_HINT },
      { key: "hero_subhead", label: "Hero subhead", type: "textarea", default: "What we’ve learned, written down. No snake oil." },
    ],
  },
];

/**
 * Seed FAQs per service. Stored as the default of each service page's "faq"
 * slot (a JSON string). Honest, plain-English answers — no keyword stuffing —
 * and eligible for Google's FAQ rich result via the FAQPage schema.
 */
const SERVICE_FAQS: Partial<Record<ServiceKey, { q: string; a: string }[]>> = {
  seo: [
    {
      q: "How long until we see results from SEO?",
      a: "For most local and small-business campaigns, meaningful movement shows in three to six months, with the biggest gains compounding after that. Low-competition and local-map terms can move faster; national, high-competition terms take longer. Anyone promising overnight rankings is selling something we wouldn't.",
    },
    {
      q: "Do you guarantee first-page rankings?",
      a: "No — and neither can anyone honest, because Google's algorithm isn't ours to control. What we guarantee is white-hat work, transparent reporting, and a strategy tied to the searches that actually bring you customers, not vanity keywords.",
    },
    {
      q: "What's the difference between local SEO and regular SEO?",
      a: "Local SEO targets the map pack and \"near me\" searches — it leans on your Google Business Profile, reviews, and consistent name-address-phone data across the web. Regular (organic) SEO is about ranking your website's pages. Most Gresham and Portland businesses need both, and we treat them together.",
    },
    {
      q: "Do I have to sign a long-term contract?",
      a: "No lock-in traps. SEO is ongoing work, so we recommend committing to a few months to let it take hold, but we keep terms flexible and earn the next month with results, not paperwork.",
    },
  ],
  web: [
    {
      q: "What do you build websites with?",
      a: "We choose the right tool for the job rather than forcing every client onto one platform — from modern frameworks for fast, custom sites to a well-configured content system when you need to edit copy yourself. The goal is always the same: fast, secure, easy to maintain, and built to rank.",
    },
    {
      q: "Will my site be fast and mobile-friendly?",
      a: "Yes. Every site we build is responsive by default and tuned for Core Web Vitals — the speed and stability signals Google uses for ranking. A slow site quietly costs you both rankings and customers, so performance isn't an add-on for us.",
    },
    {
      q: "Do you offer hosting and ongoing maintenance?",
      a: "We do — hosting, updates, backups, and security monitoring — so you're not left to babysit the site after launch. If you'd rather host it elsewhere, that's fine too; you're never locked in.",
    },
    {
      q: "Who owns the website when it's finished?",
      a: "You do — the site, the domain, and the content are yours. We build assets you keep, not a rental you can never leave.",
    },
  ],
  content: [
    {
      q: "What kinds of content do you produce?",
      a: "Blog posts and articles, service and landing-page copy, email, and the on-page writing that helps pages rank and convert. Everything is written by people who understand both your business and how search works.",
    },
    {
      q: "How is content marketing different from SEO?",
      a: "They're partners. SEO figures out what your customers are searching for; content marketing answers those searches with something genuinely worth reading. Without content, there's little for SEO to rank — and without SEO, good content goes unseen.",
    },
    {
      q: "How often should we publish?",
      a: "Consistency beats volume. A steady cadence of a few strong, useful pieces a month usually outperforms a burst of thin posts that stop. We'll set a pace you can sustain and that moves the needle.",
    },
  ],
  paid: [
    {
      q: "Which advertising platforms do you manage?",
      a: "Primarily Google Ads (search, display, and local) and Meta (Facebook and Instagram), plus others when they fit your audience. We recommend platforms based on where your customers actually are, not where it's easiest to spend.",
    },
    {
      q: "How quickly do paid ads work compared to SEO?",
      a: "Paid ads can put you in front of buyers today — that's their advantage. SEO builds durable, lower-cost traffic over months. The smartest plans use ads to generate leads now while SEO compounds in the background.",
    },
    {
      q: "What budget do I need to get started?",
      a: "It depends on your market and goals, but we scope campaigns to fit budgets across a wide range and are candid when a budget is too thin to compete. We'd rather tell you that up front than quietly waste it.",
    },
    {
      q: "How is ad spend billed versus your management fee?",
      a: "Your ad spend goes directly to the platforms on your own account — you keep ownership and full visibility. Our fee for building, running, and optimizing the campaigns is separate and transparent, with no hidden markup on your spend.",
    },
  ],
};

// Service + sub-service pages, generated from lib/services.ts. Their copy lives
// in code (SERVICES) as the default; edits are stored as page_content overrides
// keyed by path, exactly like the marketing pages.
const SERVICE_PAGES: PageDef[] = SERVICES.flatMap((s) => {
  const service: PageDef = {
    key: `service-${s.slug}`,
    path: `/services/${s.slug}`,
    name: s.name,
    type: "service",
    serviceKey: s.key,
    slots: [
      { key: "lede", label: "Hero lede — the paragraph under the title", type: "textarea", default: s.lede },
      {
        key: "faq",
        label: "FAQ — questions & answers (shown as an accordion + FAQ rich result)",
        type: "faq",
        default: JSON.stringify(SERVICE_FAQS[s.key] ?? []),
      },
    ],
  };
  const subs: PageDef[] = s.subs.map((sub) => ({
    key: `sub-${s.slug}-${sub.slug}`,
    path: `/services/${s.slug}/${sub.slug}`,
    name: sub.name,
    type: "subservice",
    serviceKey: s.key,
    parentName: s.name,
    slots: [
      { key: "blurb", label: "Hero line — the italic line under the title", type: "text", default: sub.blurb },
      { key: "intro", label: "Paragraph 1 — why it’s part of the prescription", type: "textarea", default: sub.intro },
      { key: "payoff", label: "Paragraph 2 — the results + soft nudge", type: "textarea", default: sub.payoff },
    ],
  }));
  return [service, ...subs];
});

// Location landing pages, generated from lib/locations.ts. Editable slots layer
// over the code defaults exactly like service pages; structural bits (heading,
// eyebrow, audience list) stay in code.
const LOCATION_PAGES: PageDef[] = LOCATIONS.map((l) => ({
  key: `location-${l.slug}`,
  path: `/locations/${l.slug}`,
  name: l.label,
  type: "location",
  slots: [
    { key: "lede", label: "Hero lede — the paragraph under the title", type: "textarea", default: l.lede },
    {
      key: "argument",
      label: "Opening argument — one or more paragraphs (blank line = new paragraph)",
      type: "textarea",
      default: l.argument.join("\n\n"),
    },
    { key: "proof", label: "Proof paragraph — above the link to the portfolio", type: "textarea", default: l.proof },
    {
      key: "faq",
      label: "City FAQ — questions & answers (accordion + FAQ rich result)",
      type: "faq",
      default: JSON.stringify(l.faq),
    },
  ],
}));

/** Every editable page: marketing, service + sub-service, then location pages. */
export const PAGES: PageDef[] = [
  ...MARKETING_PAGES.map((p) => ({ ...p, type: "marketing" as const })),
  ...SERVICE_PAGES,
  ...LOCATION_PAGES,
];

/** Default SEO title/description per page (fallback + editor placeholder). */
export const PAGE_SEO: Record<string, { title: string; description: string }> = {
  home: {
    title: "Brainjar Media | Digital Marketing & SEO, Gresham OR",
    description:
      "Grow your brand with SEO, web development, content, and paid ads from a Gresham, Oregon agency with two decades of measurable results.",
  },
  about: {
    title: "About Our Process",
    description:
      "Meet the Gresham agency compounding digital remedies since 2003 — for Intel, Microsoft, NASCAR, Pendleton, and the shop down the street.",
  },
  services: {
    title: "Our Services — SEO, Web, Content & Ads",
    description:
      "Mix the right remedy for your goals — SEO, web development, content, and paid ads, each tied to measurable results. Book a free diagnosis.",
  },
  contact: {
    title: "Get a Diagnosis — Contact",
    description:
      "Tell us the symptom and we’ll mix the cure. Brainjar Media, 109 N Main Ave #202, Gresham, OR 97030. (503) 929-7436.",
  },
  work: {
    title: "The Medicine Cabinet — Portfolio",
    description:
      "See real results — websites, SEO, content, and ad campaigns for businesses, nonprofits, and events across Portland and Gresham, Oregon.",
  },
  blog: {
    title: "Notes from the Dispensary — Blog",
    description:
      "Plain-English notes on SEO, websites, content and advertising from Brainjar Media in Gresham, Oregon.",
  },
};

export function getPageDef(pathOrKey: string): PageDef | undefined {
  return PAGES.find((p) => p.path === pathOrKey || p.key === pathOrKey);
}

/** The in-code default content map for a page (slotKey -> default text). */
export function pageDefaults(path: string): Record<string, string> {
  const def = getPageDef(path);
  const out: Record<string, string> = {};
  def?.slots.forEach((s) => (out[s.key] = s.default));
  return out;
}
