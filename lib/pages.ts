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

export type SlotType = "text" | "textarea" | "heading";
export type Slot = { key: string; label: string; type: SlotType; default: string; hint?: string };
export type PageDef = { key: string; path: string; name: string; slots: Slot[] };

const HEADING_HINT = "Wrap a word in *asterisks* for the accent color; a new line becomes a line break.";

export const PAGES: PageDef[] = [
  {
    key: "home",
    path: "/",
    name: "Home",
    slots: [
      { key: "hero_eyebrow", label: "Hero eyebrow", type: "text", default: "A Digital Apothecary for Ambitious Brands" },
      { key: "hero_heading", label: "Hero heading", type: "heading", default: "Remedies for the\n*Undiscovered* Brand", hint: HEADING_HINT },
      { key: "hero_subhead", label: "Hero subhead", type: "textarea", default: "We diagnose what ails your website, then distill SEO, design & content into growth your competition can’t replicate." },
      { key: "cta_heading", label: "Closing CTA heading", type: "text", default: "Ready for Your Prescription?" },
      { key: "cta_subhead", label: "Closing CTA subhead", type: "textarea", default: "More leads, calls, foot traffic or sales — tell us the symptom, we’ll mix the cure." },
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
      { key: "cta_eyebrow", label: "Closing CTA eyebrow", type: "text", default: "Everything We Mix Comes With" },
      { key: "cta_heading", label: "Closing CTA heading", type: "text", default: "Measurable Results." },
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

/** Default SEO title/description per page (fallback + editor placeholder). */
export const PAGE_SEO: Record<string, { title: string; description: string }> = {
  home: {
    title: "Brainjar Media | Digital Marketing & SEO — Gresham, Portland, Oregon",
    description:
      "A digital apothecary for ambitious brands. SEO, web development, content marketing and paid advertising from Gresham, Oregon. Two decades of measurable results.",
  },
  about: {
    title: "About Our Process",
    description:
      "Brainjar Media has been compounding digital remedies from Gresham, Oregon since 2003 — for Intel, Microsoft, NASCAR, Pendleton Woolen Mills, and the shop down the street.",
  },
  services: {
    title: "The Formulary — SEO, Web, Content & Paid Ads",
    description:
      "Five proven compounds, mixed to order: search engine optimization, web development, content marketing, paid advertising and graphic design. Every prescription comes with measurable results.",
  },
  contact: {
    title: "Get a Diagnosis — Contact",
    description:
      "Tell us the symptom and we’ll mix the cure. Brainjar Media, 109 N Main Ave #202, Gresham, OR 97030. (503) 929-7436.",
  },
  work: {
    title: "The Medicine Cabinet — Portfolio",
    description:
      "Every jar on this shelf holds a result we can show you. Websites, SEO, content and ad campaigns for corporations, organizations, local business and public events across Portland and Gresham, Oregon.",
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
