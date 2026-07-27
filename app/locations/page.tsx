import type { Metadata } from "next";
import Link from "next/link";
import { LOCATIONS } from "@/lib/locations";
import { Frame, Lozenge } from "@/components/ornaments";
import { ServiceCTA } from "@/components/service-cta";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Areas We Serve — Portland Metro & East County",
  description:
    "Brainjar Media serves Gresham, Portland, Troutdale, Happy Valley, Sandy, Fairview and Wood Village — digital marketing, SEO and web design from our home base in downtown Gresham since 2003.",
  alternates: { canonical: "/locations" },
};

/** First sentence of the lede, as a card teaser. */
function teaser(lede: string) {
  const first = lede.split(/(?<=\.)\s/)[0];
  return first || lede;
}

export default function LocationsHub() {
  return (
    <>
      <section className="px-6 py-6 text-center sm:py-8">
        <Frame>
          <div className="eyebrow">From Our Bench in Gresham</div>
          <h1 className="display mt-4 text-[32px] leading-tight sm:text-[48px]">Areas We Serve</h1>
          <Lozenge className="my-6" />
          <p className="mx-auto max-w-xl text-lg italic leading-8 text-ink-soft">
            We&rsquo;ve compounded digital remedies from downtown Gresham since 2003 — and we deliver
            them across the Portland metro and East County. Find your corner of the map.
          </p>
        </Frame>
      </section>

      <section className="px-6 pb-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LOCATIONS.map((l) => (
              <Link
                key={l.slug}
                href={`/locations/${l.slug}`}
                className="group flex flex-col border border-rule bg-card p-8 transition-all hover:-translate-y-1 hover:border-tincture"
              >
                <div className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-cobalt">
                  {l.eyebrow}
                </div>
                <h2 className="display mt-2 text-xl group-hover:text-tincture">{l.label}</h2>
                <p className="mt-3 flex-1 text-base italic leading-7 text-ink-soft">{teaser(l.lede)}</p>
                <span className="mt-4 font-display text-[10px] font-bold tracking-[0.2em] text-tincture">
                  EXPLORE →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ServiceCTA />
    </>
  );
}
