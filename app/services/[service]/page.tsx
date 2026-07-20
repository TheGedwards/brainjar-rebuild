import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SERVICES, getService } from "@/lib/services";
import { getProjects } from "@/lib/supabase";
import { Frame, Lozenge, SectionTitle } from "@/components/ornaments";

type Params = { params: Promise<{ service: string }> };

export function generateStaticParams() {
  return SERVICES.map((s) => ({ service: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const s = getService((await params).service);
  if (!s) return {};
  return {
    title: s.name,
    description: s.lede,
    alternates: { canonical: `/services/${s.slug}` },
  };
}

export default async function ServicePage({ params }: Params) {
  const s = getService((await params).service);
  if (!s) notFound();

  // Related work: projects that used this compound.
  const projects = await getProjects().catch(() => []);
  const related = projects.filter((p) => p.services?.includes(s.key)).slice(0, 3);

  return (
    <>
      <section className="px-6 py-12 text-center sm:py-16">
        <Frame>
          <Image src={s.bottle} alt="" width={110} height={190} className="mx-auto h-32 w-auto sm:h-40" />
          <div className="eyebrow mt-6">Formula No. {s.no} · {s.label}</div>
          <h1 className="display mt-4 text-[32px] leading-tight sm:text-[48px]">{s.name}</h1>
          <Lozenge className="my-6" />
          <p className="mx-auto max-w-xl text-lg italic leading-8 text-ink-soft">{s.lede}</p>
          <Link href="/contact" className="btn btn-fill mt-8">
            GET A FREE DIAGNOSIS
          </Link>
        </Frame>
      </section>

      {s.subs.length > 0 && (
        <section className="border-y border-rule bg-panel px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <SectionTitle eyebrow="What's In It">The Ingredients</SectionTitle>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {s.subs.map((sub, i) => (
                <Link
                  key={sub.slug}
                  href={`/services/${s.slug}/${sub.slug}`}
                  className="group border border-rule bg-card p-8 transition-all hover:-translate-y-1 hover:border-tincture"
                >
                  <div className="font-body text-4xl italic leading-none text-tincture">
                    {["i", "ii", "iii"][i]}.
                  </div>
                  <h3 className="display mt-2 text-sm tracking-[0.18em] group-hover:text-tincture">
                    {sub.name}
                  </h3>
                  <p className="mt-2 text-lg italic leading-8 text-ink-soft">
                    {sub.blurb}{" "}
                    <span className="font-semibold not-italic text-tincture underline decoration-1 underline-offset-4 group-hover:text-tincture-dk">
                      Learn more
                    </span>
                    <span aria-hidden="true" className="not-italic text-tincture group-hover:text-tincture-dk">
                      {" "}&rarr;
                    </span>
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <SectionTitle eyebrow="Proof">Taken By</SectionTitle>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/work/${p.slug}`}
                  className="border border-rule bg-card p-6 transition-colors hover:border-tincture"
                >
                  <div className="display text-base">{p.clients?.name ?? p.title}</div>
                  {p.tagline && <div className="mt-2 text-base italic text-ink-soft">{p.tagline}</div>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t-[3px] border-double border-rule-strong bg-panel px-6 py-12 text-center">
        <h2 className="display text-2xl sm:text-3xl">What Should We Mix for You?</h2>
        <Link href="/contact" className="btn btn-fill mt-8">
          BOOK A FREE CONSULTATION
        </Link>
      </section>
    </>
  );
}
