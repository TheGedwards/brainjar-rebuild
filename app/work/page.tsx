import type { Metadata } from "next";
import Link from "next/link";
import { getProjects, getPageContent } from "@/lib/supabase";
import { WorkGrid } from "@/components/work-grid";
import { Frame, Lozenge } from "@/components/ornaments";
import { renderHeading } from "@/lib/render-copy";
import { PAGE_SEO } from "@/lib/pages";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const c = await getPageContent("/work");
  return {
    title: c.seo_title ?? PAGE_SEO.work.title,
    description: c.seo_description ?? PAGE_SEO.work.description,
    alternates: { canonical: "/work" },
  };
}

export default async function WorkPage() {
  const [projects, c] = await Promise.all([
    getProjects().catch(() => []),
    getPageContent("/work"),
  ]);

  return (
    <>
      <section className="px-6 py-12 text-center sm:py-16">
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

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-6xl">
          <WorkGrid projects={projects} />
        </div>
      </section>

      <section className="border-y border-rule bg-panel px-6 py-12">
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

      <section className="px-6 py-12 text-center">
        <h2 className="display text-2xl sm:text-3xl">Your Results Belong on This Shelf</h2>
        <Link href="/contact" className="btn btn-fill mt-8">
          START YOUR PROJECT
        </Link>
      </section>
    </>
  );
}
