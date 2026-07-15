import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BottleShelf } from "@/components/bottle-shelf";
import { BrandMark } from "@/components/brand-mark";
import { Frame, Lozenge, SectionTitle, PointedRule } from "@/components/ornaments";
import { getFeaturedProject, getPageContent } from "@/lib/supabase";
import { renderHeading } from "@/lib/render-copy";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const c = await getPageContent("/");
  // Home falls back to the site-wide default title/description from the layout.
  return {
    title: c.seo_title ?? undefined,
    description: c.seo_description ?? undefined,
  };
}

const METHOD = [
  {
    numeral: "i.",
    name: "DIAGNOSE",
    body: "We start with your goals, then dig into what the leaders in your industry are doing.",
  },
  {
    numeral: "ii.",
    name: "FORMULATE",
    body: "We compound a strategy from SEO, content, design and ads — measured to your market.",
  },
  {
    numeral: "iii.",
    name: "ADMINISTER",
    body: "Then we help you do it better than they do — with measurable results, every month.",
  },
];

export default async function HomePage() {
  const [featured, c] = await Promise.all([
    getFeaturedProject().catch(() => null),
    getPageContent("/"),
  ]);
  const stats = featured?.project_stats?.slice(0, 3) ?? [];

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="px-6 py-12 text-center sm:py-16">
        <Frame>
          <div className="eyebrow">{c.content.hero_eyebrow}</div>
          <h1 className="display mt-4 text-[32px] leading-[1.08] sm:text-[56px]">
            {renderHeading(c.content.hero_heading)}
          </h1>
          <Lozenge className="my-6" />
          <p className="mx-auto max-w-xl text-lg italic leading-8 text-ink-soft">
            {c.content.hero_subhead}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/contact" className="btn btn-fill">
              GET A DIAGNOSIS
            </Link>
            <Link href="/services" className="btn btn-outline">
              VIEW THE FORMULARY
            </Link>
          </div>
        </Frame>
      </section>

      {/* ---------- PRESS ---------- */}
      <section className="border-y border-rule bg-panel px-6 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="eyebrow">As Featured In</div>
          <div className="mt-4 flex flex-col items-center justify-center gap-2 text-lg italic text-ink-soft sm:flex-row sm:gap-10">
            <span>The Wall Street Journal</span>
            <span className="hidden text-rule-strong sm:inline">·</span>
            <span>Barron&rsquo;s</span>
            <span className="hidden text-rule-strong sm:inline">·</span>
            <span>Portland Tribune</span>
          </div>
        </div>
      </section>

      {/* ---------- THE SHELF (signature) ---------- */}
      <BottleShelf />

      {/* ---------- FEATURED CASE STUDY ---------- */}
      {featured && (
        <section className="border-y border-rule bg-panel px-6 py-16">
          <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
            <div className="relative aspect-4/3 border border-rule-strong bg-card">
              {featured.hero_image_url ? (
                <Image
                  src={featured.hero_image_url}
                  alt={featured.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div
                  className="flex size-full items-center justify-center"
                  style={{
                    background:
                      "repeating-linear-gradient(45deg,#F1E8D8,#F1E8D8 12px,#EDE2CE 12px,#EDE2CE 24px)",
                  }}
                >
                  <span className="font-display text-[11px] tracking-[0.2em] text-ink-faint">
                    CASE STUDY IMAGE
                  </span>
                </div>
              )}
            </div>

            <div>
              <div className="eyebrow">Featured Case Study</div>
              <h2 className="display mt-4 text-2xl sm:text-3xl">
                {featured.clients?.name ?? featured.title}
              </h2>
              {featured.summary && (
                <p className="mt-4 text-lg italic leading-8 text-ink-soft">
                  {featured.summary}
                </p>
              )}

              {stats.length > 0 && (
                <div className="mt-8 flex gap-8 border-t border-rule pt-6">
                  {stats.map((s) => (
                    <div key={s.id}>
                      <div className="display text-2xl text-tincture">{s.value}</div>
                      <div className="mt-1 font-display text-[9px] font-bold tracking-[0.2em] text-ink-faint">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link href={`/work/${featured.slug}`} className="btn btn-outline mt-8">
                READ THE CASE STUDY
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ---------- THE METHOD ---------- */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <SectionTitle>We&rsquo;ll Prescribe a Solution</SectionTitle>

          {/* Roman numerals, because this genuinely IS a sequence — you cannot
              formulate before you diagnose. */}
          <div className="mt-10 grid gap-10 sm:grid-cols-3">
            {METHOD.map((step) => (
              <div key={step.name}>
                <div className="font-body text-[48px] italic leading-none text-tincture">
                  {step.numeral}
                </div>
                <div className="display mt-2 text-base tracking-[0.2em]">{step.name}</div>
                <p className="mt-2 text-lg italic leading-8 text-ink-soft">{step.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <PointedRule />
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="border-t-[3px] border-double border-rule-strong bg-panel px-6 py-12 text-center">
        <BrandMark width={80} className="mx-auto" />
        <h2 className="display mt-6 text-2xl sm:text-3xl">{c.content.cta_heading}</h2>
        <p className="mt-4 text-lg italic text-ink-soft">{c.content.cta_subhead}</p>
        <Link href="/contact" className="btn btn-fill mt-8">
          BOOK A FREE CONSULTATION
        </Link>
      </section>
    </>
  );
}
