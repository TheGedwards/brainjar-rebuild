/**
 * v1 lead pipeline — the merged model (triage → stages → outcomes) actually in
 * use on /admin/leads. Pure data (no server imports) so the client screen and
 * the server action share one source of truth.
 *
 * NOTE: this is distinct from lib/leads.ts, which holds the *parked* full
 * lead-gen machine spec (Cal.com booking, 8-stage pipeline). This is the lean
 * version we're shipping now.
 */

/** A lead row (superset of the leads table columns the admin screen uses). */
export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  symptom: string | null;
  message: string | null;
  source_path: string | null;
  emailed_at: string | null;
  created_at: string;
  status: string | null;
  reason: string | null;
  next_action: string | null;
  next_action_at: string | null; // YYYY-MM-DD
  notes: string | null;
  stage_changed_at: string | null;
  updated_at: string | null;
};

export type LeadStatus =
  // Active pipeline (the journey)
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  // Outcomes
  | "won"
  | "lost"
  | "nurture"
  // Triaged out (never entered / left the pipeline)
  | "junk"
  | "disqualified";

/** The active working pipeline, in order. */
export const ACTIVE_STAGES: LeadStatus[] = ["new", "contacted", "qualified", "proposal"];
export const ALL_STATUSES: LeadStatus[] = [
  ...ACTIVE_STAGES,
  "won",
  "lost",
  "nurture",
  "junk",
  "disqualified",
];

/** Statuses that require a reason before saving. */
export const REASON_REQUIRED: LeadStatus[] = ["junk", "disqualified", "lost"];

export const STATUS_META: Record<LeadStatus, { label: string; tone: string; dot: string }> = {
  new: { label: "New", tone: "text-tincture", dot: "bg-tincture" },
  contacted: { label: "Contacted", tone: "text-cobalt", dot: "bg-cobalt" },
  qualified: { label: "Qualified", tone: "text-cobalt", dot: "bg-cobalt" },
  proposal: { label: "Proposal Sent", tone: "text-cobalt", dot: "bg-cobalt" },
  won: { label: "Won", tone: "text-tincture", dot: "bg-tincture" },
  lost: { label: "Lost", tone: "text-ink-faint", dot: "bg-ink-faint" },
  nurture: { label: "Nurture", tone: "text-ink", dot: "bg-ink" },
  junk: { label: "Junk", tone: "text-ink-faint", dot: "bg-ink-faint" },
  disqualified: { label: "Disqualified", tone: "text-ink-faint", dot: "bg-ink-faint" },
};

/** Reason codes — different for "not a real lead" vs "real lead we lost". */
export const TRIAGE_REASONS = [
  "Spam / scam",
  "Vendor solicitation",
  "Not a service fit",
  "Budget mismatch",
  "Location mismatch",
  "Duplicate",
  "Other",
];
export const LOST_REASONS = [
  "Chose a competitor",
  "No response",
  "Price",
  "Timing — not now",
  "No budget",
  "Other",
];

export const isActiveStage = (s: string): boolean => (ACTIVE_STAGES as string[]).includes(s);
export const isOpen = (s: string): boolean => isActiveStage(s) || s === "nurture";

export function normalizeStatus(s: string | null | undefined): LeadStatus {
  return (ALL_STATUSES as string[]).includes(s ?? "") ? (s as LeadStatus) : "new";
}
