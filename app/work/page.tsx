import type { Metadata } from "next";
import Link from "next/link";
import { getProjects } from "@/lib/supabase";
import { WorkGrid } from "@/components/work-grid";
import { Frame, Lozenge } from "@/components/ornaments";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "The Medicine Cabinet — Portfolio",
  description:
    "Every jar on this shelf holds a result we can show you. Websites, SEO, content and ad campaigns for corporations, organizations, local business and public events across Portland and Gresham, Oregon.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const projects = await getProjects().catch(() => []);

  return (
    <>
      <section className="px-6 py-12 text-center sm:py-16">
        <Frame>
          <div className="eyebrow">The Medicine Cabinet</div>
          <h1 className="display mt-4 text-[32px] leading-tight sm:text-[48px]">Proof, Bottled</h1>
          <Lozenge className="my-6" />
          <p className="mx-auto max-w-xl text-lg italic leading-8 text-ink-soft">
            Every jar on this shelf holds a result we can show you.
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
