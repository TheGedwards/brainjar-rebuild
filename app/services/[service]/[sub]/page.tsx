import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICES, getSubService } from "@/lib/services";
import { getPageContent } from "@/lib/supabase";
import { Frame, Lozenge } from "@/components/ornaments";
import { ServiceCTA } from "@/components/service-cta";

type Params = { params: Promise<{ service: string; sub: string }> };

export function generateStaticParams() {
  return SERVICES.flatMap((s) => s.subs.map((sub) => ({ service: s.slug, sub: sub.slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { service, sub } = await params;
  const found = getSubService(service, sub);
  if (!found) return {};
  return {
    title: `${found.sub.name} — ${found.service.name}`,
    description: found.sub.blurb,
    alternates: { canonical: `/services/${service}/${sub}` },
  };
}

/**
 * One template, twelve pages. Each of these has a live indexed URL on the old
 * site, so they keep their own <h1>, their own title tag and their own canonical
 * — that's the whole point of not collapsing them into anchors.
 */
export default async function SubServicePage({ params }: Params) {
  const { service, sub } = await params;
  const found = getSubService(service, sub);
  if (!found) notFound();
  const { service: s, sub: item } = found;

  // CMS overrides (blurb / intro / payoff) layered over the lib/services default.
  const c = await getPageContent(`/services/${s.slug}/${item.slug}`);
  const paras = (t: string) => t.split("\n\n").map((x, i) => <p key={i}>{x}</p>);

  const siblings = s.subs.filter((x) => x.slug !== item.slug);

  return (
    <>
      <section className="px-6 py-12 text-center sm:py-16">
        <Frame>
          <nav className="eyebrow" aria-label="Breadcrumb">
            <Link href="/services" className="hover:text-tincture">
              The Formulary
            </Link>
            <span className="mx-2 text-rule-strong">/</span>
            <Link href={`/services/${s.slug}`} className="hover:text-tincture">
              {s.name}
            </Link>
          </nav>
          <h1 className="display mt-4 text-[32px] leading-tight sm:text-[48px]">{item.name}</h1>
          <Lozenge className="my-6" />
          <p className="mx-auto max-w-xl text-lg italic leading-8 text-ink-soft">
            {c.content.blurb}
          </p>
          <Link href="/contact" className="btn btn-fill mt-8">
            GET A FREE DIAGNOSIS
          </Link>
        </Frame>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-2xl">
          <div className="prose-apothecary">
            {paras(c.content.intro)}
            {paras(c.content.payoff)}
          </div>

          {siblings.length > 0 && (
            <div className="mt-10 border-t border-rule pt-8 text-center">
              <div className="eyebrow mb-6">Included with your {s.name} prescription</div>
              <ul className="flex flex-wrap justify-center gap-4">
                {siblings.map((sib) => (
                  <li key={sib.slug}>
                    <Link
                      href={`/services/${s.slug}/${sib.slug}`}
                      className="inline-block border border-rule-strong bg-panel px-8 py-4 font-display text-sm font-bold tracking-[0.15em] text-ink-soft transition-colors hover:border-tincture hover:text-tincture"
                    >
                      {sib.name.toUpperCase()}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <ServiceCTA />
    </>
  );
}
