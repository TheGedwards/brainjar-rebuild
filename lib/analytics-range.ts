/**
 * Comparison presets for the analytics dashboard — each option is a "this period
 * vs that period" pair, so every view shows fair, equal-length deltas. Pure (no
 * server imports): the client toolbar reads the labels, the server page resolves
 * the two windows with rangesFor(). Dates are YYYY-MM-DD (UTC).
 */

export const MODES = [
  { key: "weekWoW", label: "This week vs last week" },
  { key: "monthMoM", label: "This month vs last month" },
  { key: "last28", label: "Last 28 days vs previous 28" },
  { key: "last3mo", label: "Last 3 months vs previous 3" },
  { key: "yearYoY", label: "This year vs last year" },
  { key: "custom", label: "Custom range vs previous period" },
  { key: "customYoy", label: "Custom range vs last year" },
] as const;

export type Mode = (typeof MODES)[number]["key"];
export const CUSTOM_MODES: string[] = ["custom", "customYoy"];
export const DEFAULT_MODE: Mode = "last28";

export type DateRange = { startDate: string; endDate: string };
export type RangeResult = { current: DateRange; previous: DateRange; label: string; prevLabel: string };

const MS = 86_400_000;
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const iso = (d: Date) => d.toISOString().slice(0, 10);
const parse = (s: string) => new Date(`${s}T00:00:00Z`);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * MS);
const lenDays = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / MS) + 1;

function anchorDate(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return addDays(d, -1); // yesterday — today's data is always partial
}
function mondayOf(d: Date): Date {
  const day = (d.getUTCDay() + 6) % 7; // Mon=0 … Sun=6
  return addDays(d, -day);
}
const firstOfMonth = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
const firstOfLastMonth = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1));
const firstOfYear = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
const minusYear = (d: Date) => new Date(Date.UTC(d.getUTCFullYear() - 1, d.getUTCMonth(), d.getUTCDate()));

function human(r: DateRange): string {
  const s = parse(r.startDate);
  const e = parse(r.endDate);
  const f = (d: Date) => `${MON[d.getUTCMonth()]} ${d.getUTCDate()}`;
  return `${f(s)} – ${f(e)}, ${e.getUTCFullYear()}`;
}

export function rangesFor(mode: string, custom: { start?: string; end?: string }): RangeResult {
  const anchor = anchorDate();
  let cs: Date, ce: Date, ps: Date, pe: Date;

  switch (mode) {
    case "weekWoW":
      ce = anchor; cs = mondayOf(anchor);
      ps = addDays(cs, -7); pe = addDays(ce, -7);
      break;
    case "monthMoM": {
      ce = anchor; cs = firstOfMonth(anchor);
      const elapsed = lenDays(cs, ce);
      ps = firstOfLastMonth(anchor); pe = addDays(ps, elapsed - 1);
      break;
    }
    case "last3mo":
      ce = anchor; cs = addDays(anchor, -89);
      pe = addDays(cs, -1); ps = addDays(pe, -89);
      break;
    case "yearYoY":
      ce = anchor; cs = firstOfYear(anchor);
      ps = firstOfYear(minusYear(anchor)); pe = minusYear(anchor);
      break;
    case "custom":
    case "customYoy": {
      if (!custom.start || !custom.end) return rangesFor(DEFAULT_MODE, {}); // half-filled → safe fallback
      cs = parse(custom.start); ce = parse(custom.end);
      if (mode === "customYoy") {
        ps = minusYear(cs); pe = minusYear(ce);
      } else {
        const len = lenDays(cs, ce);
        pe = addDays(cs, -1); ps = addDays(pe, -(len - 1));
      }
      break;
    }
    case "last28":
    default:
      ce = anchor; cs = addDays(anchor, -27);
      pe = addDays(cs, -1); ps = addDays(pe, -27);
      break;
  }

  const current = { startDate: iso(cs), endDate: iso(ce) };
  const previous = { startDate: iso(ps), endDate: iso(pe) };
  return { current, previous, label: human(current), prevLabel: human(previous) };
}
