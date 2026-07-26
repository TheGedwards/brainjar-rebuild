/**
 * Date-range presets + comparison math for the analytics dashboard. Pure (no
 * server imports) so the client control can read the label lists and the server
 * page can resolve the actual dates. All dates are YYYY-MM-DD (UTC).
 */

export const PERIODS = [
  { key: "7", label: "Last 7 days" },
  { key: "28", label: "Last 28 days" },
  { key: "90", label: "Last 90 days" },
  { key: "custom", label: "Custom range" },
] as const;

export const COMPARES = [
  { key: "prev", label: "Previous period" },
  { key: "year", label: "Previous year" },
  { key: "none", label: "No comparison" },
] as const;

export type DateRange = { startDate: string; endDate: string };

const iso = (d: Date) => d.toISOString().slice(0, 10);
function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

/** Resolve the selected range from URL params. Presets end "yesterday". */
export function resolveRange(params: { period?: string; start?: string; end?: string }): DateRange {
  const period = params.period ?? "28";
  if (period === "custom" && params.start && params.end) {
    return { startDate: params.start, endDate: params.end };
  }
  const days = period === "7" ? 7 : period === "90" ? 90 : 28;
  return { startDate: iso(daysAgo(days)), endDate: iso(daysAgo(1)) };
}

/** Resolve the comparison range, or null. */
export function resolveCompare(range: DateRange, mode?: string): DateRange | null {
  const m = mode ?? "prev";
  if (m === "none") return null;
  const s = new Date(`${range.startDate}T00:00:00Z`);
  const e = new Date(`${range.endDate}T00:00:00Z`);

  if (m === "year") {
    const cs = new Date(s);
    cs.setUTCFullYear(cs.getUTCFullYear() - 1);
    const ce = new Date(e);
    ce.setUTCFullYear(ce.getUTCFullYear() - 1);
    return { startDate: iso(cs), endDate: iso(ce) };
  }
  // previous period: same length, immediately before the start
  const day = 86_400_000;
  const ce = new Date(s.getTime() - day);
  const cs = new Date(ce.getTime() - (e.getTime() - s.getTime()));
  return { startDate: iso(cs), endDate: iso(ce) };
}
