/**
 * FAQ data helpers. A page's FAQ lives in a single "faq" content slot as a JSON
 * string — an array of { q, a }. Keeping the parse + schema logic here (pure, no
 * imports) lets the public page, the FAQPage JSON-LD, and the admin editor all
 * share one shape.
 */

export type FaqItem = { q: string; a: string };

/** Parse a faq slot value. Tolerant: bad JSON or wrong shape -> no FAQs. */
export function parseFaq(raw?: string | null): FaqItem[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(
        (x): x is FaqItem =>
          !!x && typeof x.q === "string" && typeof x.a === "string" && !!x.q.trim() && !!x.a.trim()
      )
      .map((x) => ({ q: x.q.trim(), a: x.a.trim() }));
  } catch {
    return [];
  }
}

/** Serialize FAQ items back to a slot string (drops empty rows). */
export function serializeFaq(items: FaqItem[]): string {
  return JSON.stringify(items.filter((it) => it.q.trim() || it.a.trim()));
}

/** schema.org FAQPage — eligible for the FAQ rich result in Google. */
export function faqPageSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}
