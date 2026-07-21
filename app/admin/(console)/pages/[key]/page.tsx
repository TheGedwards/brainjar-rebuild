import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser, ADMIN_ROLES } from "@/lib/auth";
import { getPageDef, PAGE_SEO } from "@/lib/pages";
import { getPageContent } from "@/lib/supabase";
import { savePage } from "@/app/admin/actions";
import { field, label } from "@/components/admin/ui";
import { SeoFields } from "@/components/admin/seo-fields";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function PageEditor({ params, searchParams }: Params) {
  const { profile } = await requireUser();
  if (!ADMIN_ROLES.includes(profile.role)) redirect("/admin");

  const { key } = await params;
  const { saved } = await searchParams;
  const def = getPageDef(key);
  if (!def) notFound();

  const current = await getPageContent(def.path);
  const seoDefaults = PAGE_SEO[def.key] ?? { title: "", description: "" };
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.brainjarmedia.com")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const displayUrl = def.path === "/" ? base : `${base}${def.path}`;

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/pages"
        className="font-display text-[10px] tracking-[0.2em] text-ink-faint hover:text-tincture"
      >
        ← PAGES
      </Link>
      <h1 className="mt-2 display text-2xl">{def.name}</h1>

      {/* Sticky action bar — save + view live, reachable from the top. */}
      <div className="sticky top-0 z-10 mt-4 flex items-center justify-between gap-3 border-y border-rule bg-paper/95 py-3 backdrop-blur">
        <span className="font-display text-[10px] tracking-[0.2em] text-ink-faint">
          EDITING {def.path}
        </span>
        <div className="flex items-center gap-3">
          <a href={def.path} target="_blank" className="btn btn-outline !py-2.5">
            VIEW PAGE ↗
          </a>
          <button form="page-form" className="btn btn-fill !py-2.5">
            SAVE
          </button>
        </div>
      </div>

      {saved && (
        <div className="mt-4 flex items-center justify-between gap-3 border border-cobalt/40 bg-cobalt-lt/20 px-4 py-3">
          <span className="text-base text-ink">Saved.</span>
          <a
            href={def.path}
            target="_blank"
            className="font-display text-[11px] font-bold tracking-[0.2em] text-cobalt hover:text-tincture"
          >
            VIEW THE LIVE PAGE ↗
          </a>
        </div>
      )}

      <form id="page-form" action={savePage} className="mt-6 space-y-6">
        <input type="hidden" name="path" value={def.path} />

        {/* Copy slots -------------------------------------------------------- */}
        <div className="space-y-4 border border-rule bg-card p-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">Copy</h2>
          {def.slots.map((s) => (
            <div key={s.key}>
              <label className={label}>{s.label}</label>
              {s.type === "text" ? (
                <input
                  name={`slot_${s.key}`}
                  defaultValue={current.content[s.key] ?? ""}
                  className={field}
                />
              ) : (
                <textarea
                  name={`slot_${s.key}`}
                  rows={s.type === "heading" ? 2 : 3}
                  defaultValue={current.content[s.key] ?? ""}
                  className={field}
                />
              )}
              {s.hint && <p className="mt-1 text-base italic text-ink-faint">{s.hint}</p>}
            </div>
          ))}
        </div>

        {/* SEO — marketing pages only; service/sub SEO stays derived for now. */}
        {def.type === "marketing" && (
          <div className="border border-rule bg-card p-6">
            <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.2em]">
              Search Engine
            </h2>
            <SeoFields
              initialTitle={current.seo_title ?? ""}
              initialDescription={current.seo_description ?? ""}
              fallbackTitle={seoDefaults.title}
              fallbackDescription={seoDefaults.description}
              displayUrl={displayUrl}
            />
          </div>
        )}

        <button className="btn btn-fill">SAVE PAGE</button>
      </form>
    </div>
  );
}
