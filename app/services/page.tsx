import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SERVICES } from "@/lib/services";
import { Frame, Lozenge, PointedRule } from "@/components/ornaments";

export const metadata: Metadata = {
  title: "The Formulary — SEO, Web, Content & Paid Ads",
  description:
    "Five proven compounds, mixed to order: search engine optimization, web development, content marketing, paid advertising and graphic design. Every prescription comes with measurable results.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <section className="px-6 py-12 text-center sm:py-16">
        <Frame>
          <div className="eyebrow">The Formulary</div>
          <h1 className="display mt-4 text-[32px] leading-tight sm:text-[48px]">Our Remedies</h1>
          <Lozenge className="my-6" />
          <p className="mx-auto max-w-xl text-lg italic leading-8 text-ink-soft">
            Proven compounds, mixed to order. Rarely taken alone — we&rsquo;ll write the combination
            your goals call for.
          </p>
        </Frame>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-5xl space-y-6">
          {SERVICES.map((s) => (
            <article
              key={s.slug}
              className="grid items-center gap-8 border border-rule bg-card p-8 transition-colors hover:border-rule-strong sm:grid-cols-[140px_1fr] sm:p-10"
            >
              <div className="flex justify-center">
                <Image src={s.bottle} alt="" width={110} height={190} className="h-32 w-auto sm:h-40" />
              </div>

              <div>
                <div className="font-display text-[10px] font-bold tracking-[0.3em] text-cobalt">
                  FORMULA No. {s.no}
                </div>
                <h2 className="display mt-2 text-xl text-ink sm:text-2xl">
                  <Link href={`/services/${s.slug}`} className="hover:text-tincture">
                    {s.name}
                  </Link>
                </h2>
                <p className="mt-2 max-w-xl text-lg italic leading-8 text-ink-soft">
                  {s.lede}
                </p>

                {s.subs.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {s.subs.map((sub) => (
                      <li key={sub.slug}>
                        <Link
                          href={`/services/${s.slug}/${sub.slug}`}
                          className="inline-block border border-rule-strong bg-panel px-2 py-2 font-display text-[10px] font-bold tracking-[0.15em] text-ink-soft transition-colors hover:border-tincture hover:text-tincture"
                        >
                          {sub.name.toUpperCase()}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-5xl">
          <PointedRule />
        </div>
      </section>

      <section className="border-t-[3px] border-double border-rule-strong bg-panel px-6 py-12 text-center">
        <div className="eyebrow">Everything We Mix Comes With</div>
        <h2 className="display mt-4 text-2xl sm:text-3xl">Measurable Results.</h2>
        <Link href="/contact" className="btn btn-fill mt-8">
          GET A DIAGNOSIS
        </Link>
      </section>
    </>
  );
}
