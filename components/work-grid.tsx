"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Project, ServiceKey } from "@/lib/supabase";
import { SERVICE_CHIPS } from "@/lib/services";
import { AdminOnly } from "@/components/admin-bar";

const FILTERS: { key: ServiceKey | "all"; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "seo", label: "SEO" },
  { key: "web", label: "WEB" },
  { key: "content", label: "CONTENT" },
  { key: "paid", label: "PAID ADS" },
  { key: "design", label: "DESIGN" },
];

export function WorkGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<ServiceKey | "all">("all");

  // Only offer a filter chip if something is actually behind it. Until you tag
  // the 33 seeded projects with services, this correctly shows just "ALL"
  // instead of five chips that all return an empty grid.
  const available = useMemo(() => {
    const present = new Set(projects.flatMap((p) => p.services ?? []));
    return FILTERS.filter((f) => f.key === "all" || present.has(f.key as ServiceKey));
  }, [projects]);

  const shown = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.services?.includes(filter))),
    [projects, filter]
  );

  return (
    <>
      {available.length > 1 && (
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {available.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`border px-4 py-2 font-display text-[11px] font-bold tracking-[0.18em] transition-colors ${
                filter === f.key
                  ? "border-tincture bg-tincture text-paper"
                  : "border-rule-strong bg-card text-ink-soft hover:border-tincture hover:text-tincture"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => {
          const headline = p.project_stats?.find((s) => s.is_headline) ?? p.project_stats?.[0];
          return (
            <div key={p.id} className="group/card relative">
            <AdminOnly>
              <Link
                href={`/admin/portfolio/${p.id}`}
                className="absolute right-3 top-3 z-10 flex items-center rounded-full bg-ink/85 px-3 py-1 font-display text-[10px] font-bold tracking-[0.15em] text-paper opacity-0 transition-opacity hover:bg-ink group-hover/card:opacity-100"
              >
                EDIT
              </Link>
            </AdminOnly>
            <Link
              href={`/work/${p.slug}`}
              className="group flex flex-col border border-rule bg-card transition-all duration-200 hover:-translate-y-1.5 hover:border-rule-strong hover:shadow-[0_14px_26px_rgba(59,52,42,0.14)]"
            >
              <div className="relative flex aspect-16/10 items-center justify-center overflow-hidden bg-panel">
                {p.hero_image_url ? (
                  <Image
                    src={p.hero_image_url}
                    alt={p.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  // Empty state. Not a gray box with "image" in it — a label
                  // stock swatch with the client's initials, which looks
                  // deliberate on a shelf of 33 and stops looking broken.
                  <div
                    className="flex size-full items-center justify-center"
                    style={{
                      background:
                        "repeating-linear-gradient(45deg,#F1E8D8,#F1E8D8 12px,#EDE2CE 12px,#EDE2CE 24px)",
                    }}
                  >
                    <span className="display text-3xl text-rule-strong">
                      {initials(p.clients?.name ?? p.title)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-6">
                {(p.services?.length ?? 0) > 0 && (
                  <div className="font-display text-[9px] font-bold tracking-[0.2em] text-cobalt">
                    {p.services.map((s) => SERVICE_CHIPS[s]).join(" · ")}
                  </div>
                )}
                <div className="display mt-2 text-base text-ink group-hover:text-tincture">
                  {p.clients?.name ?? p.title}
                </div>
                {p.tagline && (
                  <div className="mt-2 text-base italic text-ink-soft">{p.tagline}</div>
                )}
                {headline && (
                  <div className="mt-4 inline-block self-start border border-rule-strong bg-panel px-2 py-1 font-display text-[10px] font-bold tracking-[0.15em] text-tincture">
                    {headline.value} {headline.label}
                  </div>
                )}
              </div>
            </Link>
            </div>
          );
        })}
      </div>

      {shown.length === 0 && (
        <p className="mt-12 text-center text-lg italic text-ink-faint">
          Nothing on this shelf yet.
        </p>
      )}
    </>
  );
}

function initials(name: string) {
  return name
    .replace(/^(the|a)\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
