import type { FaqItem } from "@/lib/faq";
import { SectionTitle } from "@/components/ornaments";

/**
 * Public FAQ accordion. Native <details>/<summary> — no client JS, keyboard
 * accessible, and the answers are in the DOM for crawlers. Pair with a FAQPage
 * JSON-LD block (see lib/faq.ts) on the same page.
 */
export function FaqSection({
  items,
  eyebrow = "Take as Directed",
  title = "Questions, Answered",
}: {
  items: FaqItem[];
  eyebrow?: string;
  title?: string;
}) {
  if (!items.length) return null;
  return (
    <section className="border-t border-rule px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <SectionTitle eyebrow={eyebrow}>{title}</SectionTitle>
        <div className="mt-10 border-y border-rule">
          {items.map((it, i) => (
            <details
              key={i}
              className="group border-b border-rule last:border-b-0"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                <h3 className="display text-lg text-ink transition-colors group-open:text-tincture">
                  {it.q}
                </h3>
                <span
                  aria-hidden
                  className="shrink-0 font-display text-2xl leading-none text-tincture transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="prose-apothecary pb-6">
                {it.a.split("\n\n").map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
