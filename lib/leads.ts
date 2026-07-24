/**
 * Lead-pipeline configuration. Pure data (no server imports) so both the admin
 * CRM (client) and server actions/webhook can read it. Edit these arrays to
 * adjust the pipeline — adding a status is adding one object here, exactly like
 * SERVICES drives the service UI.
 *
 * NOTE ON "configurable booking settings": availability, buffers, daily limits,
 * the booking questions and the investment-range options all live in the Cal.com
 * dashboard — that IS the settings panel, changeable without a deploy. Our code
 * stays agnostic: the webhook stores whatever custom answers Cal.com sends
 * (see attribution + meeting handling), so nothing here hard-codes those values.
 */

export type LeadStatus =
  | "new"
  | "contacted"
  | "meeting_booked"
  | "met"
  | "proposal"
  | "won"
  | "lost"
  | "nurturing";

export type LeadSource =
  | "contact_form"
  | "book_consult"
  | "cta"
  | "manual"
  | "import";

/** Ordered pipeline stages. `tone` maps to an existing palette token (no new colors). */
export const LEAD_STATUSES: { key: LeadStatus; label: string; tone: string }[] = [
  { key: "new",            label: "New",            tone: "text-tincture" },
  { key: "contacted",      label: "Contacted",      tone: "text-cobalt" },
  { key: "meeting_booked", label: "Meeting Booked", tone: "text-cobalt" },
  { key: "met",            label: "Met",            tone: "text-ink" },
  { key: "proposal",       label: "Proposal Out",   tone: "text-ink" },
  { key: "won",            label: "Won",            tone: "text-tincture" },
  { key: "lost",           label: "Lost",           tone: "text-ink-faint" },
  { key: "nurturing",      label: "Nurturing",      tone: "text-ink-faint" },
];

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  contact_form: "Contact form",
  book_consult: "Booked consult",
  cta:          "CTA",
  manual:       "Added manually",
  import:       "Imported",
};

export function statusLabel(key: string): string {
  return LEAD_STATUSES.find((s) => s.key === key)?.label ?? key;
}
export function statusTone(key: string): string {
  return LEAD_STATUSES.find((s) => s.key === key)?.tone ?? "text-ink";
}
export function sourceLabel(key: string): string {
  return LEAD_SOURCE_LABELS[key as LeadSource] ?? key;
}

/**
 * First-party attribution. On first landing we stash these in a cookie; on /book
 * we read them and pass them to the Cal.com embed as metadata, and the webhook
 * writes them onto the lead. Cookie name + fields kept here so capture, embed
 * and webhook agree on one shape.
 */
export const ATTRIBUTION_COOKIE = "bjm_attr";
export type Attribution = {
  landing_page?: string;
  referrer?: string;
  service_page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  first_seen?: string; // ISO timestamp
};
export const ATTRIBUTION_FIELDS: (keyof Attribution)[] = [
  "landing_page",
  "referrer",
  "service_page",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "first_seen",
];
