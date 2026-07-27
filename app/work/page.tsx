import type { Metadata } from "next";
import { getProjects, getPageContent } from "@/lib/supabase";
import { ServiceCTA } from "@/components/service-cta";
import { WorkGrid } from "@/components/work-grid";
import { Frame, Lozenge } from "@/components/ornaments";
import { renderHeading } from "@/lib/render-copy";
import { PAGE_SEO } from "@/lib/pages";
import { getMediaAltMap, altFor } from "@/lib/media";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const c = await getPageContent("/work");
  return {
    title: c.seo_title ?? PAGE_SEO.work.title,
    description: c.seo_description ?? PAGE_SEO.work.description,
    alternates: { canonical: "/work" },
  };
}

const SERVICE_KEYS = ["seo", "web", "content", "paid", "design"] as const;

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  const initialFilter = (SERVICE_KEYS as readonly string[]).includes(service ?? "")
    ? (service as (typeof SERVICE_KEYS)[number])
    : "all";
  const [projects, c, altMap] = await Promise.all([
    getProjects().catch(() => []),
    getPageContent("/work"),
    getMediaAltMap().catch(() => ({})),
  ]);

  // Resolve each card's hero alt server-side (WorkGrid is a client component),
  // falling back to the client name when no alt has been set on the image.
  const heroAlts: Record<string, string> = {};
  for (const p of projects) heroAlts[p.id] = altFor(altMap, p.hero_image_url, p.clients?.name ?? p.title);

  return (
    <>
      <section className="px-6 py-6 text-center sm:py-8">
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

      <section className="px-6 pb-8">
        <div className="mx-auto max-w-6xl">
          <WorkGrid projects={projects} initialFilter={initialFilter} heroAlts={heroAlts} />
        </div>
      </section>

      <section className="border-y border-rule bg-panel px-6 py-6">
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

      <ServiceCTA />
    </>
  );
}
