import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/lib/supabase";
import { SERVICE_CHIPS } from "@/lib/services";
import { Lozenge, PointedRule } from "@/components/ornaments";
import { GallerySlideshow } from "@/components/gallery-slideshow";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects().catch(() => []);
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await getProject((await params).slug).catch(() => null);
  if (!p) return {};
  const name = p.clients?.name ?? p.title;
  return {
    title: `${name} — Case Study`,
    description: p.summary ?? p.tagline ?? `How Brainjar Media helped ${name}.`,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: p.hero_image_url ? { images: [p.hero_image_url] } : undefined,
  };
}

export default async function ProjectPage({ params }: Params) {
  const p = await getProject((await params).slug).catch(() => null);
  if (!p) notFound();

  const name = p.clients?.name ?? p.title;
  const sections = [
    { label: "The Symptom", body: p.challenge },
    { label: "The Formula", body: p.approach },
    { label: "The Result", body: p.outcome },
  ].filter((s) => s.body);

  return (
    <article className="px-6 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <nav className="eyebrow" aria-label="Breadcrumb">
          <Link href="/work" className="hover:text-tincture">
            The Medicine Cabinet
          </Link>
        </nav>

        {(p.services?.length ?? 0) > 0 && (
          <div className="mt-4 font-display text-[10px] font-bold tracking-[0.25em] text-cobalt">
            {p.services.map((s) => SERVICE_CHIPS[s]).join(" · ")}
          </div>
        )}

        <h1 className="display mt-4 text-[32px] leading-tight sm:text-[48px]">{name}</h1>
        {p.tagline && (
          <p className="mt-4 text-xl italic text-ink-soft">{p.tagline}</p>
        )}
        <Lozenge className="my-8" />
      </div>

      {p.hero_image_url && (
        <div className="mx-auto mt-4 max-w-4xl border border-rule-strong p-2">
          <div className="relative aspect-16/9">
            <Image
              src={p.hero_image_url}
              alt={name}
              fill
              sizes="(max-width: 1024px) 100vw, 900px"
              priority
              className="object-cover"
            />
          </div>
        </div>
      )}

      {(p.project_stats?.length ?? 0) > 0 && (
        <div className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-10 border-y border-rule py-8">
          {p.project_stats
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((s) => (
              <div key={s.id} className="text-center">
                <div className="display text-3xl text-tincture">{s.value}</div>
                <div className="mt-2 font-display text-[9px] font-bold tracking-[0.2em] text-ink-faint">
                  {s.label}
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="mx-auto mt-10 max-w-2xl">
        {p.summary && <p className="prose-apothecary">{p.summary}</p>}

        {sections.map((s) => (
          <section key={s.label} className="mt-12">
            <h2 className="display text-sm tracking-[0.2em] text-ink">{s.label}</h2>
            <div className="prose-apothecary mt-4">
              {s.body!.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>
        ))}

        {sections.length === 0 && !p.summary && (
          // Honest empty state. Not "coming soon" — a real invitation.
          <p className="text-center text-lg italic text-ink-faint">
            The write-up for this one is still being compounded.{" "}
            <Link href="/contact" className="text-tincture underline underline-offset-4">
              Ask us about it
            </Link>{" "}
            and we&rsquo;ll walk you through it.
          </p>
        )}

        {(p.gallery?.length ?? 0) > 0 && <GallerySlideshow images={p.gallery} />}

        {p.clients?.website_url && (
          <div className="mt-12 text-center">
            <a
              href={p.clients.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              VISIT {name.toUpperCase()}
            </a>
          </div>
        )}

        <div className="mt-12">
          <PointedRule />
        </div>

        <div className="mt-8 text-center">
          <Link href="/work" className="font-display text-[11px] tracking-[0.2em] text-ink-faint hover:text-tincture">
            ← BACK TO THE MEDICINE CABINET
          </Link>
        </div>
      </div>
    </article>
  );
}
