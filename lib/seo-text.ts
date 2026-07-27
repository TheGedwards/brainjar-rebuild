/**
 * Keep meta descriptions from being truncated in search results. DB-driven
 * pages (case studies) derive their description from long body copy; this clamps
 * to a clean word boundary at/under `max` so Google shows the whole thing.
 */
export function clampMeta(text: string, max = 160): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  // Prefer ending on a full sentence if one fits and keeps enough of the text —
  // reads far better than a mid-sentence cut.
  const window = t.slice(0, max);
  const sentence = window.match(/^[\s\S]*[.!?](?=\s|$)/);
  if (sentence && sentence[0].length >= 90) return sentence[0].trim();
  // Otherwise trim to a word boundary and signal continuation.
  const slice = t.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > 40 ? slice.slice(0, lastSpace) : slice;
  return cut.replace(/[\s.,;:—–-]+$/, "") + "…";
}
