import type { Metadata } from "next";
import Link from "next/link";
import { Frame, Lozenge, SectionTitle } from "@/components/ornaments";
import { getPageContent } from "@/lib/supabase";
import { renderHeading } from "@/lib/render-copy";
import { PAGE_SEO } from "@/lib/pages";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const c = await getPageContent("/about");
  return {
    title: c.seo_title ?? PAGE_SEO.about.title,
    description: c.seo_description ?? PAGE_SEO.about.description,
    alternates: { canonical: "/about" },
  };
}

const METHOD = [
  {
    numeral: "i.",
    name: "DIAGNOSE",
    body: "We start with your goals. Then we dig into what the leaders in your industry are actually doing — the keywords they own, the pages that earn them links, the ads they keep running because those ads keep working.",
  },
  {
    numeral: "ii.",
    name: "FORMULATE",
    body: "We compound a strategy from the four elements — search, site, story and spend — measured to your market. Rarely is one taken alone. The proportions are the whole job.",
  },
  {
    numeral: "iii.",
    name: "ADMINISTER",
    body: "Then we help you do it better than they do, and we show our work. Every month, in plain English, with the numbers that decide whether we keep the account.",
  },
];

export default async function AboutPage() {
  const c = await getPageContent("/about");
  return (
    <>
      <section className="px-6 py-12 text-center sm:py-16">
        <Frame>
          <div className="eyebrow">{c.content.hero_eyebrow}</div>
          <h1 className="display mt-4 text-[32px] leading-tight sm:text-[48px]">
            {renderHeading(c.content.hero_heading)}
          </h1>
          <Lozenge className="my-6" />
          <p className="mx-auto max-w-xl text-lg italic leading-8 text-ink-soft">
            {c.content.hero_subhead}
          </p>
        </Frame>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-3xl">
          <SectionTitle eyebrow="How It Works">The Method</SectionTitle>
          <div className="mt-10 space-y-12">
            {METHOD.map((step) => (
              <div key={step.name} className="grid gap-6 sm:grid-cols-[80px_1fr]">
                <div className="font-body text-[48px] italic leading-none text-tincture">
                  {step.numeral}
                </div>
                <div>
                  <div className="display text-base tracking-[0.2em]">{step.name}</div>
                  <p className="prose-apothecary mt-2">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-rule bg-panel px-6 py-12">
        <div className="mx-auto grid max-w-4xl gap-8 text-center sm:grid-cols-4">
          {[
            ["20+", "YEARS PRACTICING"],
            ["140+", "REMEDIES DELIVERED"],
            ["96%", "CLIENTS RETAINED"],
            ["#1", "RATED IN PORTLAND"],
          ].map(([v, l]) => (
            <div key={l}>
              <div className="display text-3xl text-tincture">{v}</div>
              <div className="mt-2 font-display text-[9px] font-bold tracking-[0.2em] text-ink-faint">
                {l}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-12 text-center">
        <h2 className="display text-2xl">What Should We Mix for You?</h2>
        <Link href="/contact" className="btn btn-fill mt-8">
          GET A DIAGNOSIS
        </Link>
      </section>
    </>
  );
}
