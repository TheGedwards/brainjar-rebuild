import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCATIONS, getLocation } from "@/lib/locations";
import { SERVICES } from "@/lib/services";
import { getPageContent } from "@/lib/supabase";
import { Frame, Lozenge, SectionTitle } from "@/components/ornaments";
import { FaqSection } from "@/components/faq-section";
import { ServiceCTA } from "@/components/service-cta";
import { renderHeading } from "@/lib/render-copy";
import { JsonLd, localServiceSchema, breadcrumbSchema } from "@/lib/schema";
import { parseFaq, faqPageSchema } from "@/lib/faq";

export const revalidate = 300;

type Params = { params: Promise<{ city: string }> };

export function generateStaticParams() {
  return LOCATIONS.map((l) => ({ city: l.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const l = getLocation((await params).city);
  if (!l) return {};
  return {
    // Titles in the registry are already full ("… — Brainjar Media"), so bypass
    // the layout's "%s | Brainjar Media" template with `absolute`.
    title: { absolute: l.title },
    description: l.description,
    alternates: { canonical: `/locations/${l.slug}` },
  };
}

export default async function LocationPage({ params }: Params) {
  const l = getLocation((await params).city);
  if (!l) notFound();

  // CMS overrides (lede / argument / proof / faq) layered over the code defaults.
  const c = await getPageContent(`/locations/${l.slug}`);
  const argument = (c.content.argument ?? l.argument.join("\n\n")).split("\n\n").filter(Boolean);
  const faqs = parseFaq(c.content.faq);

  return (
    <>
      <JsonLd
        data={[
          localServiceSchema({ city: l.city, description: l.description, path: `/locations/${l.slug}` }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Areas We Serve", path: "/locations" },
            { name: l.label, path: `/locations/${l.slug}` },
          ]),
          ...(faqs.length ? [faqPageSchema(faqs)] : []),
        ]}
      />

      {/* Hero */}
      <section className="px-6 py-6 text-center sm:py-8">
        <Frame>
          <div className="eyebrow">{l.eyebrow}</div>
          <h1 className="display mt-4 text-[32px] leading-tight sm:text-[48px]">
            {renderHeading(l.heading)}
          </h1>
          <Lozenge className="my-6" />
          <p className="mx-auto max-w-xl text-lg italic leading-8 text-ink-soft">{c.content.lede}</p>
          <Link href="/contact" className="btn btn-fill mt-8">
            GET A FREE DIAGNOSIS
          </Link>
        </Frame>
      </section>

      {/* Opening argument */}
      <section className="px-6 pb-8">
        <div className="prose-apothecary mx-auto max-w-2xl">
          {argument.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {/* Service emphasis — internal links to the four remedies */}
      <section className="border-y border-rule bg-panel px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <SectionTitle eyebrow="The Formulary">Our Remedies for {l.city}</SectionTitle>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="group border border-rule bg-card p-8 transition-all hover:-translate-y-1 hover:border-tincture"
              >
                <div className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-cobalt">
                  Formula No. {s.no}
                </div>
                <h3 className="display mt-2 text-lg group-hover:text-tincture">{s.name}</h3>
                <p className="mt-2 text-base italic leading-7 text-ink-soft">{s.lede}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <SectionTitle eyebrow="Prescribed For">{l.audienceHeading}</SectionTitle>
          <ul className="mx-auto mt-10 max-w-2xl space-y-4">
            {l.audience.map((a, i) => (
              <li key={i} className="flex gap-4 text-lg leading-8 text-ink-soft">
                <span aria-hidden className="mt-2 h-2 w-2 shrink-0 rotate-45 bg-tincture" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Proof — links to the real portfolio, no invented testimonials */}
      <section className="border-t border-rule px-6 py-8 text-center">
        <div className="mx-auto max-w-2xl">
          <SectionTitle eyebrow="The Evidence">{l.proofHeading}</SectionTitle>
          <p className="mx-auto mt-8 max-w-xl text-lg italic leading-8 text-ink-soft">{c.content.proof}</p>
          <Link href="/work" className="btn btn-outline mt-8">
            SEE THE PORTFOLIO
          </Link>
        </div>
      </section>

      <FaqSection items={faqs} eyebrow={`${l.city}, Oregon`} title="Questions, Answered" />

      <ServiceCTA />
    </>
  );
}
