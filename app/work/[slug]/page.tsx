import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/lib/supabase";
import { SERVICE_CHIPS } from "@/lib/services";
import { Lozenge, PointedRule } from "@/components/ornaments";
import { GallerySlideshow } from "@/components/gallery-slideshow";
import { SpecimenPlate } from "@/components/specimen-plate";
import { EditTarget } from "@/components/admin-bar";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

/** Singular "class" label for the specimen band (CATEGORY_LABELS are plural). */
const CLASS_LABEL: Record<string, string> = {
  corporation: "Corporation",
  organization: "Organization",
  "local-business": "Local Business",
  "public-event": "Public Event",
};

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
  const { slug } = await params;
  const p = await getProject(slug).catch(() => null);
  if (!p) notFound();

  const name = p.clients?.name ?? p.title;
  const cls = p.clients?.category ? CLASS_LABEL[p.clients.category] : null;
  const website = p.clients?.website_url ?? null;
  const host = website?.replace(/^https?:\/\//, "").replace(/\/$/, "");

  // Specimen number = the client's position in the published collection.
  const all = await getProjects().catch(() => []);
  const idx = all.findIndex((x) => x.slug === p.slug);
  const specimenNo = idx >= 0 ? String(idx + 1).padStart(3, "0") : null;

  // The plate surfaces the first two measurements, side by side.
  const metrics = (p.project_stats ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, 2);

  const hasNotes = !!(p.summary || p.challenge || p.approach || p.outcome);

  // Split a body field on blank lines into paragraphs.
  const paras = (body: string) =>
    body.split("\n\n").map((t, i) => <p key={i}>{t}</p>);

  return (
    <article className="px-6 py-12">
      <EditTarget href={`/admin/portfolio/${p.id}`} label="Edit this case study" />
      <nav className="mx-auto mb-8 max-w-5xl eyebrow text-center" aria-label="Breadcrumb">
        <Link href="/work" className="hover:text-tincture">
          The Medicine Cabinet
        </Link>
      </nav>

      {/* ===== The Cabinet Card ===== */}
      <div className="mx-auto max-w-5xl bg-panel p-2 sm:p-3">
        <div className="border border-rule-strong bg-paper">
          {/* Header band */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-double border-rule-strong bg-card px-6 py-4 sm:px-8">
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] sm:text-xs">
              The Brainjar Cabinet
            </span>
            {specimenNo && (
              <span className="font-display text-[11px] font-extrabold uppercase tracking-[0.2em] text-tincture sm:text-xs">
                Specimen No. {specimenNo}
              </span>
            )}
            {cls && (
              <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-cobalt sm:text-xs">
                {cls}
              </span>
            )}
          </div>

          <div className="px-6 py-10 sm:px-10">
            {(p.services?.length ?? 0) > 0 && (
              <div className="text-center font-display text-[11px] font-semibold uppercase tracking-[0.25em] text-cobalt">
                {p.services.map((s) => SERVICE_CHIPS[s]).join(" · ")}
              </div>
            )}

            <h1 className="display mt-3 text-center text-[32px] leading-none sm:text-[48px]">
              {name}
            </h1>

            {p.binomial && (
              <p className="mt-3 text-center text-xl italic text-ink-faint">{p.binomial}</p>
            )}

            <Lozenge className="my-8" />

            {p.tagline && (
              <p className="mx-auto mb-10 max-w-2xl text-center text-lg italic leading-8 text-ink-soft">
                {p.tagline}
              </p>
            )}

            <div className="grid gap-10 md:grid-cols-[1.05fr_.95fr] md:items-start">
              {/* ---- The plate: screenshot + measurements ---- */}
              <SpecimenPlate src={p.hero_image_url} name={name} host={host} priority>
                {metrics.length > 0 && (
                  <div className="mt-3 flex items-stretch justify-center border-t border-rule pt-4">
                    {metrics.map((m, i) => (
                      <div key={m.id} className="contents">
                        {i > 0 && (
                          <div className="relative w-px bg-rule-strong" aria-hidden>
                            <span className="absolute left-1/2 top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-tincture" />
                          </div>
                        )}
                        <div className="flex-1 px-4 text-center">
                          <div className="display text-3xl leading-none text-tincture tabular-nums">
                            {m.value}
                          </div>
                          <div className="mt-2 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-ink-faint">
                            {m.label}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SpecimenPlate>

              {/* ---- Diagnosis: summary + the symptom ---- */}
              <div>
                {p.summary && <p className="prose-apothecary">{p.summary}</p>}

                {p.challenge && (
                  <section className={p.summary ? "mt-8" : ""}>
                    <h2 className="display text-sm tracking-[0.2em] text-ink">The Symptom</h2>
                    <div className="prose-apothecary mt-3">{paras(p.challenge)}</div>
                  </section>
                )}

                {!hasNotes && (
                  <p className="text-lg italic text-ink-faint">
                    The write-up for this specimen is still being compounded.{" "}
                    <Link href="/contact" className="text-tincture underline underline-offset-4">
                      Ask us about it
                    </Link>{" "}
                    and we&rsquo;ll walk you through it.
                  </p>
                )}
              </div>
            </div>

            {/* ---- Our Solution: The Formula + The Result, side by side ---- */}
            {(p.approach || p.outcome) && (
              <div className="mt-10 border-t border-rule pt-8">
                <h2 className="display mb-8 text-center text-sm tracking-[0.25em] text-tincture">
                  Our Solution
                </h2>
                {p.approach && p.outcome ? (
                  <div className="grid gap-8 md:grid-cols-[1fr_auto_1fr] md:items-stretch md:gap-0">
                    <section className="md:pr-10">
                      <h3 className="display text-sm tracking-[0.2em] text-ink">The Formula</h3>
                      <div className="prose-apothecary mt-3">{paras(p.approach)}</div>
                    </section>
                    <div className="relative hidden w-px bg-rule-strong md:block" aria-hidden>
                      <span className="absolute left-1/2 top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-tincture" />
                    </div>
                    <section className="md:pl-10">
                      <h3 className="display text-sm tracking-[0.2em] text-ink">The Result</h3>
                      <div className="prose-apothecary mt-3">{paras(p.outcome)}</div>
                    </section>
                  </div>
                ) : (
                  <section className="mx-auto max-w-2xl">
                    <h3 className="display text-sm tracking-[0.2em] text-ink">
                      {p.approach ? "The Formula" : "The Result"}
                    </h3>
                    <div className="prose-apothecary mt-3">{paras(p.approach ?? p.outcome!)}</div>
                  </section>
                )}
              </div>
            )}
          </div>

          {/* Footer band — habitat, seal, catalogue mark */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule px-6 py-5 sm:px-10">
            <span className="font-display text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              {website ? (
                <>
                  Habitat ·{" "}
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-tincture underline decoration-tincture-dk underline-offset-2"
                  >
                    {host}
                  </a>
                </>
              ) : (
                "Catalogued by Brainjar Media"
              )}
            </span>

            <span
              aria-hidden
              className="flex h-[74px] w-[74px] shrink-0 -rotate-[8deg] flex-col items-center justify-center rounded-full border-2 border-tincture text-tincture opacity-85"
            >
              <span className="font-display text-base font-extrabold leading-none">BJM</span>
              <span className="mt-[3px] font-display text-[7px] tracking-[0.18em]">EST. 2003</span>
            </span>

            <span className="font-display text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              {website ? "Catalogued by Brainjar Media" : "Gresham, Oregon"}
            </span>
          </div>
        </div>
      </div>

      {/* ===== Additional figures (gallery) ===== */}
      {(p.gallery?.length ?? 0) > 0 && (
        <div className="mx-auto mt-12 max-w-3xl">
          <div className="eyebrow mb-4 text-center">Further Figures</div>
          <GallerySlideshow images={p.gallery} />
        </div>
      )}

      <div className="mx-auto mt-12 max-w-3xl">
        <PointedRule />
        <div className="mt-8 text-center">
          <Link
            href="/work"
            className="font-display text-[11px] tracking-[0.2em] text-ink-faint hover:text-tincture"
          >
            ← BACK TO THE MEDICINE CABINET
          </Link>
        </div>
      </div>
    </article>
  );
}
