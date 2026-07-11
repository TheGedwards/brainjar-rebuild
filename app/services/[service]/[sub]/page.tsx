import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICES, getSubService } from "@/lib/services";
import { Frame, Lozenge } from "@/components/ornaments";

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

  const siblings = s.subs.filter((x) => x.slug !== item.slug);

  return (
    <>
      <section className="px-6 py-16 text-center sm:py-20">
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
          <h1 className="display mt-5 text-[30px] leading-tight sm:text-[42px]">{item.name}</h1>
          <Lozenge className="my-6" />
          <p className="mx-auto max-w-xl text-lg italic leading-relaxed text-ink-soft">
            {item.blurb}
          </p>
          <Link href="/contact" className="btn btn-fill mt-8">
            GET A DIAGNOSIS
          </Link>
        </Frame>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-2xl">
          <div className="prose-apothecary">
            <p>
              {item.name} is one part of {s.name.toLowerCase()} — Formula No. {s.no} in our
              formulary. It is rarely taken alone, and it is never taken without a diagnosis first.
            </p>
            <p>
              Replace this paragraph with the real page copy from the old site, or let us write it.
              This page exists so that the {item.name.toLowerCase()} URL you already rank for keeps
              its own home instead of being folded into a parent page.
            </p>
          </div>

          {siblings.length > 0 && (
            <div className="mt-14 border-t border-rule pt-8">
              <div className="eyebrow mb-4">Often Taken With</div>
              <ul className="flex flex-wrap gap-2">
                {siblings.map((sib) => (
                  <li key={sib.slug}>
                    <Link
                      href={`/services/${s.slug}/${sib.slug}`}
                      className="inline-block border border-rule-strong bg-panel px-3 py-1.5 font-display text-[10px] font-bold tracking-[0.15em] text-ink-soft hover:border-tincture hover:text-tincture"
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
    </>
  );
}
